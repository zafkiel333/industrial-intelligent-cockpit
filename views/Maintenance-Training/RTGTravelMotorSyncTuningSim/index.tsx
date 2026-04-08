import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/RTGTravelMotorSyncTuningSim/ThreeScene';
import { RTGTravelState } from '../../../components/Maintenance-Training/RTGTravelMotorSyncTuningSim/three-types';
import { Activity, AlertTriangle, Settings2, RefreshCw } from 'lucide-react';

export default function RTGTravelMotorSyncTuningSim() {
  const [state, setState] = useState<RTGTravelState>({
    speedLeft: 0,
    speedRight: 0,
    syncError: 0,
    isTuning: false
  });

  const [targetSpeed, setTargetSpeed] = useState(50);
  const [faultInjected, setFaultInjected] = useState(true);

  // Simulation logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    interval = setInterval(() => {
      setState(prev => {
        let newLeft = prev.speedLeft;
        let newRight = prev.speedRight;

        // Accelerate/Decelerate towards target
        if (newLeft < targetSpeed) newLeft += 2;
        if (newLeft > targetSpeed) newLeft -= 2;
        
        if (faultInjected && !prev.isTuning) {
          // Right motor lags behind if fault is active and not tuning
          if (newRight < targetSpeed * 0.8) newRight += 1.5;
          if (newRight > targetSpeed * 0.8) newRight -= 1.5;
        } else {
          // Normal or tuning active
          if (newRight < targetSpeed) newRight += 2;
          if (newRight > targetSpeed) newRight -= 2;
        }

        // Calculate sync error (accumulated difference)
        const diff = newLeft - newRight;
        let newError = prev.syncError + (diff * 0.1);
        
        // If tuning is active, error slowly corrects itself
        if (prev.isTuning && Math.abs(newError) > 0) {
           newError = newError * 0.9; // Decay error
           if (Math.abs(newError) < 0.1) newError = 0;
        }

        return {
          ...prev,
          speedLeft: newLeft,
          speedRight: newRight,
          syncError: newError
        };
      });
    }, 100);
    return () => clearInterval(interval);
  }, [targetSpeed, faultInjected]);

  const toggleTuning = () => {
    setState(prev => ({ ...prev, isTuning: !prev.isTuning }));
    if (!state.isTuning) {
      setFaultInjected(false); // Tuning fixes the fault
    }
  };

  const injectFault = () => {
    setFaultInjected(true);
    setState(prev => ({ ...prev, isTuning: false }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-purple-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-purple-400 tracking-wider">场桥大车行走电机同步控制调试</h1>
          <p className="text-sm text-slate-400 mt-1">RTG Gantry Travel Motor Synchronization Tuning</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${Math.abs(state.syncError) > 10 ? 'bg-red-900/50 border-red-500 text-red-400' : 'bg-green-900/50 border-green-500 text-green-400'}`}>
            <Activity size={18} />
            偏斜报警: {Math.abs(state.syncError) > 10 ? '触发 (大车偏斜过大)' : '正常'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="变频器同步控制面板" highlight>
            <div className="space-y-6">
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">目标速度给定</span>
                  <span className="text-purple-400 font-mono">{targetSpeed}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={targetSpeed}
                  onChange={(e) => setTargetSpeed(parseInt(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">左侧电机 (Master)</div>
                  <div className="text-2xl font-mono text-cyan-400">{state.speedLeft.toFixed(1)}%</div>
                </div>
                <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">右侧电机 (Slave)</div>
                  <div className={`text-2xl font-mono ${state.speedRight < state.speedLeft - 5 ? 'text-red-400' : 'text-cyan-400'}`}>
                    {state.speedRight.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-slate-300">位置同步误差 (脉冲差)</span>
                  <span className="font-mono font-bold text-yellow-400">{state.syncError.toFixed(1)}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={injectFault}
                    className="py-2 bg-red-900/30 hover:bg-red-800/50 border border-red-500/50 rounded-lg text-sm transition-colors text-red-400 flex items-center justify-center gap-2"
                  >
                    <AlertTriangle size={16} /> 模拟右侧丢转
                  </button>
                  <button 
                    onClick={toggleTuning}
                    className={`py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${state.isTuning ? 'bg-purple-600 text-white' : 'bg-purple-900/50 border border-purple-500 text-purple-300 hover:bg-purple-800/50'}`}
                  >
                    <Settings2 size={16} /> {state.isTuning ? 'PID自适应调节中' : '启动交叉耦合控制'}
                  </button>
                </div>
              </div>

            </div>
          </SciFiCard>

          <SciFiCard title="同步控制原理">
            <p className="text-sm text-slate-300 leading-relaxed">
              场桥（RTG）大车跨距大，两侧由独立变频器驱动。若两侧速度或位置不一致，会导致大车“走偏”甚至啃轨。
              <br/><br/>
              <strong className="text-purple-400">主从控制与交叉耦合：</strong>
              系统实时采集两侧编码器脉冲，计算位置差。当开启同步控制时，PLC或变频器内部的PID算法会动态微调从动侧（或两侧）的速度给定，消除位置误差，保证大车直线行驶。
            </p>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-purple-400 mb-1">大车行走俯视图</h3>
            <p className="text-slate-400">
              观察大车在轨道上的姿态。两侧速度不一致将导致明显的偏斜。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
