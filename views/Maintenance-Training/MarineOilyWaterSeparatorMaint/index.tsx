import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/MarineOilyWaterSeparatorMaint/ThreeScene';
import { SeparatorState } from '../../../components/Maintenance-Training/MarineOilyWaterSeparatorMaint/three-types';
import { Activity, Droplets, Settings, AlertTriangle, Play, Square } from 'lucide-react';

export default function MarineOilyWaterSeparatorMaint() {
  const [state, setState] = useState<SeparatorState>({
    rpm: 0,
    bowlOpen: false,
    oilFeed: false,
    waterSeal: false,
    vibration: 0,
    sludgeLevel: 0
  });

  const [isRunning, setIsRunning] = useState(false);
  const [faultType, setFaultType] = useState<'none' | 'bowl_leak' | 'heavy_sludge'>('none');

  // Simulation loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setState(prev => {
          let newRpm = prev.rpm;
          if (newRpm < 8000) newRpm += 200; // Spool up

          let newSludge = prev.sludgeLevel;
          let newVib = 0;

          if (prev.oilFeed && newRpm > 7000) {
            // Accumulate sludge if feeding
            newSludge = Math.min(100, prev.sludgeLevel + (faultType === 'heavy_sludge' ? 2 : 0.5));
          }

          // Vibration logic
          if (newSludge > 80) {
            newVib = (newSludge - 80) / 2; // High sludge causes imbalance/vibration
          }
          if (faultType === 'bowl_leak' && prev.waterSeal) {
             // Operating water leak causes partial bowl opening and severe vibration
             newVib = Math.max(newVib, 5 + Math.random() * 3);
          }

          return { ...prev, rpm: newRpm, sludgeLevel: newSludge, vibration: newVib };
        });
      }, 500);
    } else {
      interval = setInterval(() => {
        setState(prev => ({ ...prev, rpm: Math.max(0, prev.rpm - 100), vibration: 0 }));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isRunning, faultType]);

  const triggerDischarge = () => {
    if (state.rpm < 7000) {
      alert("转速不足，无法进行排渣操作！");
      return;
    }
    // Simulate discharge sequence
    setState(prev => ({ ...prev, oilFeed: false })); // Stop feed
    setTimeout(() => setState(prev => ({ ...prev, bowlOpen: true, sludgeLevel: 0 })), 1000); // Open bowl
    setTimeout(() => setState(prev => ({ ...prev, bowlOpen: false })), 3000); // Close bowl
    setTimeout(() => setState(prev => ({ ...prev, oilFeed: true })), 4000); // Resume feed
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-cyan-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">船用分油机排渣与震动故障维护</h1>
          <p className="text-sm text-slate-400 mt-1">Marine Purifier Sludge Discharge & Vibration Maintenance</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.vibration > 5 ? 'bg-red-900/50 border-red-500 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
            <Activity size={18} />
            震动烈度: {state.vibration.toFixed(1)} mm/s
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="分油机控制面板" highlight>
            <div className="space-y-6">
              
              <div className="flex justify-between items-center p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <span className="text-sm text-slate-400">分离筒转速 (RPM)</span>
                <span className={`font-mono font-bold text-2xl ${state.rpm > 7500 ? 'text-cyan-400' : 'text-yellow-400'}`}>
                  {state.rpm.toFixed(0)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setIsRunning(!isRunning)}
                  className={`py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${isRunning ? 'bg-red-900/50 hover:bg-red-800/50 border border-red-500 text-red-400' : 'bg-green-900/50 hover:bg-green-800/50 border border-green-500 text-green-400'}`}
                >
                  {isRunning ? <><Square size={18} /> 停止分离机</> : <><Play size={18} /> 启动分离机</>}
                </button>
                <button 
                  onClick={() => setState(prev => ({ ...prev, oilFeed: !prev.oilFeed }))}
                  disabled={!isRunning || state.rpm < 7000 || state.bowlOpen}
                  className={`py-3 rounded-lg font-bold transition-colors disabled:opacity-30 ${state.oilFeed ? 'bg-cyan-900/50 border border-cyan-500 text-cyan-400' : 'bg-slate-800 border border-slate-600 text-slate-400'}`}
                >
                  {state.oilFeed ? '停止进油' : '开启进油'}
                </button>
              </div>

              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">排渣空间积聚量 (Sludge)</span>
                  <span className="font-mono text-orange-400">{state.sludgeLevel.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${state.sludgeLevel > 80 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${state.sludgeLevel}%` }}></div>
                </div>
                <button 
                  onClick={triggerDischarge}
                  disabled={!isRunning || state.rpm < 7000 || state.bowlOpen}
                  className="w-full py-2 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded text-sm transition-colors disabled:opacity-30"
                >
                  手动执行排渣程序 (Manual Discharge)
                </button>
              </div>

            </div>
          </SciFiCard>

          <SciFiCard title="故障模拟与分析">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => setFaultType('none')}
                  className={`py-2 text-sm rounded border text-left px-3 ${faultType === 'none' ? 'bg-cyan-900/50 border-cyan-500 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  正常运行工况
                </button>
                <button 
                  onClick={() => setFaultType('heavy_sludge')}
                  className={`py-2 text-sm rounded border text-left px-3 ${faultType === 'heavy_sludge' ? 'bg-orange-900/50 border-orange-500 text-orange-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  劣质燃油 (泥渣快速积聚)
                </button>
                <button 
                  onClick={() => setFaultType('bowl_leak')}
                  className={`py-2 text-sm rounded border text-left px-3 ${faultType === 'bowl_leak' ? 'bg-red-900/50 border-red-500 text-red-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  操作水密封圈老化泄漏
                </button>
              </div>

              {faultType === 'heavy_sludge' && (
                <div className="p-3 bg-orange-900/30 border border-orange-500/50 rounded-lg text-sm text-orange-200">
                  <strong>分析：</strong>燃油杂质过多导致泥渣空间迅速填满。泥渣分布不均会引起转鼓动平衡破坏，产生剧烈震动。
                  <br/><strong>对策：</strong>缩短自动排渣时间间隔，或手动增加排渣次数。
                </div>
              )}

              {faultType === 'bowl_leak' && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-sm text-red-200">
                  <strong>分析：</strong>维持转鼓关闭的“操作水”因密封圈老化泄漏，导致转鼓在运行中微启，破坏水封跑油，并伴随剧烈异常震动。
                  <br/><strong>对策：</strong>必须立即停机，拆解转鼓，更换滑动底盘下方的尼龙/橡胶密封圈 (O-ring)。
                </div>
              )}
            </div>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-cyan-400 mb-1">分油机转鼓剖面透视</h3>
            <p className="text-slate-400">
              观察离心力作用下油水杂质的分离过程。<br/>
              排渣时，滑动底盘下降，泥渣从边缘抛出。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
