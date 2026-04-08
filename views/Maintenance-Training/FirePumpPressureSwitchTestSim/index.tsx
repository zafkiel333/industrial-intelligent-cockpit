import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/FirePumpPressureSwitchTestSim/ThreeScene';
import { PressureSwitchState } from '../../../components/Maintenance-Training/FirePumpPressureSwitchTestSim/three-types';
import { Activity, Settings2, Droplets, Power, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function FirePumpPressureSwitchTestSim() {
  const [state, setState] = useState<PressureSwitchState>({
    pressure: 1.0, // Initial stable pressure
    isPumpRunning: false,
    switchCutIn: 0.7, // Start pump when pressure drops below this
    switchCutOut: 1.2, // Stop pump when pressure reaches this
    isTesting: false,
    testValveOpen: false,
    switchState: 'OFF'
  });

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const next = { ...prev };

        // Pressure Dynamics
        if (next.testValveOpen) {
          // Pressure drops when valve is open
          next.pressure = Math.max(0, next.pressure - 0.05);
        } else if (next.isPumpRunning) {
          // Pressure rises when pump is running
          next.pressure = Math.min(1.5, next.pressure + 0.08);
        } else {
          // Slow leak/stabilization
          if (next.pressure > 1.0) next.pressure -= 0.01;
        }

        // Pressure Switch Logic
        if (next.pressure <= next.switchCutIn && next.switchState === 'OFF') {
          next.switchState = 'ON';
          next.isPumpRunning = true; // Auto start pump
        } else if (next.pressure >= next.switchCutOut && next.switchState === 'ON') {
          next.switchState = 'OFF';
          next.isPumpRunning = false; // Auto stop pump
        }

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const toggleTestValve = () => setState(prev => ({ ...prev, testValveOpen: !prev.testValveOpen }));
  
  const adjustSetting = (param: 'switchCutIn' | 'switchCutOut', amount: number) => {
    setState(prev => {
      const next = { ...prev };
      next[param] = Math.max(0.1, Math.min(1.5, next[param] + amount));
      // Ensure CutOut is always > CutIn
      if (next.switchCutIn >= next.switchCutOut) {
        if (param === 'switchCutIn') next.switchCutOut = next.switchCutIn + 0.1;
        else next.switchCutIn = next.switchCutOut - 0.1;
      }
      return next;
    });
  };

  const isConfigCorrect = Math.abs(state.switchCutIn - 0.8) < 0.05 && Math.abs(state.switchCutOut - 1.2) < 0.05;

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-red-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-red-400 tracking-wider">消防稳压泵压力开关动作值校验</h1>
          <p className="text-sm text-slate-400 mt-1">Fire Jockey Pump Pressure Switch Calibration</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 rounded-lg border bg-slate-900/50 border-slate-600 flex items-center gap-2">
            <Activity size={18} className="text-blue-400" />
            管网压力: <span className="font-mono text-blue-400">{state.pressure.toFixed(2)} MPa</span>
          </div>
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.isPumpRunning ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
            <Power size={18} />
            稳压泵: {state.isPumpRunning ? '运行中' : '停止'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="压力开关设定" highlight>
            <div className="space-y-6">
              
              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">启泵压力 (Cut-In)</span>
                  <span className="font-mono text-yellow-400">{state.switchCutIn.toFixed(2)} MPa</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => adjustSetting('switchCutIn', -0.05)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm">-0.05</button>
                  <button onClick={() => adjustSetting('switchCutIn', 0.05)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm">+0.05</button>
                </div>
                <p className="text-[10px] text-slate-500">目标设定值: 0.80 MPa</p>
              </div>

              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">停泵压力 (Cut-Out)</span>
                  <span className="font-mono text-yellow-400">{state.switchCutOut.toFixed(2)} MPa</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => adjustSetting('switchCutOut', -0.05)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm">-0.05</button>
                  <button onClick={() => adjustSetting('switchCutOut', 0.05)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm">+0.05</button>
                </div>
                <p className="text-[10px] text-slate-500">目标设定值: 1.20 MPa</p>
              </div>

              {isConfigCorrect ? (
                <div className="p-3 bg-green-900/30 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle2 size={16} />
                  参数设定符合规范要求
                </div>
              ) : (
                <div className="p-3 bg-orange-900/30 border border-orange-500/50 rounded-lg flex items-center gap-2 text-orange-400 text-sm">
                  <AlertTriangle size={16} />
                  参数设定偏离目标值
                </div>
              )}

            </div>
          </SciFiCard>

          <SciFiCard title="动作校验测试">
            <div className="space-y-4">
              <button 
                onClick={toggleTestValve}
                className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${state.testValveOpen ? 'bg-blue-900/50 border border-blue-500 text-blue-400' : 'bg-slate-800 border border-slate-600 text-slate-300'}`}
              >
                <Droplets size={20} />
                {state.testValveOpen ? '关闭测试放水阀' : '打开测试放水阀 (模拟泄压)'}
              </button>

              <div className="text-sm text-slate-400 space-y-2 mt-4">
                <p><strong>测试步骤：</strong></p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>调整压力开关的启停设定值。</li>
                  <li>打开测试放水阀，观察管网压力下降。</li>
                  <li>当压力降至设定值时，检查稳压泵是否自动启动。</li>
                  <li>关闭放水阀，观察压力上升。</li>
                  <li>当压力升至设定值时，检查稳压泵是否自动停止。</li>
                </ol>
              </div>
            </div>
          </SciFiCard>

        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-red-400 mb-1">消防管网与压力开关</h3>
            <p className="text-slate-400">
              左侧为压力表，中间为压力开关，右侧为测试放水阀。<br/>
              压力开关上的绿灯亮起表示发出启泵信号。<br/>
              通过放水模拟管网泄漏，验证开关动作是否准确。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
