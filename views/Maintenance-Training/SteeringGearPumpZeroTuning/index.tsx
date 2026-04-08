import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/SteeringGearPumpZeroTuning/ThreeScene';
import { SteeringPumpState } from '../../../components/Maintenance-Training/SteeringGearPumpZeroTuning/three-types';
import { Power, Settings2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SteeringGearPumpZeroTuning() {
  const [state, setState] = useState<SteeringPumpState>({
    pumpRunning: false,
    zeroOffset: 5, // Starts with an error
    rudderAngle: 0,
    tuningScrew: 0
  });

  // Simulation logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.pumpRunning) {
      interval = setInterval(() => {
        setState(prev => {
          // If pump is running and there's a zero offset, rudder will drift
          let newRudderAngle = prev.rudderAngle + (prev.zeroOffset * 0.1);
          // Clamp rudder angle
          newRudderAngle = Math.max(-35, Math.min(35, newRudderAngle));
          return { ...prev, rudderAngle: newRudderAngle };
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [state.pumpRunning]);

  const togglePump = () => {
    setState(prev => ({ ...prev, pumpRunning: !prev.pumpRunning }));
  };

  const adjustScrew = (amount: number) => {
    setState(prev => {
      const newScrew = Math.max(-10, Math.min(10, prev.tuningScrew + amount));
      // Tuning screw directly affects zero offset.
      // Let's say initial offset was 5. If screw goes to -5, offset becomes 0.
      const newOffset = 5 + newScrew; 
      return { ...prev, tuningScrew: newScrew, zeroOffset: newOffset };
    });
  };

  const resetRudder = () => {
    // Simulate manual bypass or centering
    setState(prev => ({ ...prev, rudderAngle: 0 }));
  };

  const isTuned = state.zeroOffset === 0;

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-cyan-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">舵机液压泵变量机构零位调校实操</h1>
          <p className="text-sm text-slate-400 mt-1">Steering Gear Hydraulic Pump Variable Mechanism Zero Tuning</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={togglePump}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${state.pumpRunning ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
          >
            <Power size={18} />
            {state.pumpRunning ? '主泵运行中' : '主泵已停止'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="零位调校控制面板" highlight>
            <div className="space-y-6">
              
              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">实际舵角 (Rudder Angle)</span>
                  <span className={`font-mono font-bold ${Math.abs(state.rudderAngle) > 2 ? 'text-red-400' : 'text-green-400'}`}>
                    {state.rudderAngle.toFixed(1)}°
                  </span>
                </div>
                {/* Visual Rudder Indicator */}
                <div className="w-full h-4 bg-slate-800 rounded-full relative overflow-hidden mt-2">
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-500 z-10"></div>
                  <div 
                    className="absolute top-0 bottom-0 bg-cyan-500 transition-all duration-100"
                    style={{ 
                      left: state.rudderAngle < 0 ? `${50 + (state.rudderAngle / 35) * 50}%` : '50%',
                      right: state.rudderAngle > 0 ? `${50 - (state.rudderAngle / 35) * 50}%` : '50%'
                    }}
                  ></div>
                </div>
                <button onClick={resetRudder} className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 underline">
                  手动回中舵角 (模拟旁通)
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-sm text-slate-400 flex items-center gap-2">
                  <Settings2 size={16} /> 零位调节螺钉 (Tuning Screw)
                </label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => adjustScrew(-1)}
                    className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xl"
                  >-</button>
                  <div className="flex-1 text-center font-mono text-lg text-cyan-300">
                    {state.tuningScrew > 0 ? '+' : ''}{state.tuningScrew}
                  </div>
                  <button 
                    onClick={() => adjustScrew(1)}
                    className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xl"
                  >+</button>
                </div>
                <p className="text-xs text-slate-500 text-center">顺时针(+) / 逆时针(-)</p>
              </div>

              {isTuned ? (
                <div className="p-3 bg-green-900/30 border border-green-500/50 rounded-lg text-green-400 text-sm flex items-start gap-2">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                  <p><strong>调校成功：</strong>零位已准确设定。在无舵令状态下，主泵无排量，舵角保持稳定。</p>
                </div>
              ) : (
                <div className="p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg text-yellow-400 text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p><strong>零位偏差：</strong>当前存在零位偏差。启动主泵后，即使无舵令，舵机也会发生漂移（跑舵）。请调节螺钉直至舵角不再变化。</p>
                </div>
              )}

            </div>
          </SciFiCard>

          <SciFiCard title="操作要领">
            <ul className="space-y-2 text-sm text-slate-300">
              <li>1. 启动舵机主泵前，确保系统已充满油并排气。</li>
              <li>2. 在驾驶台或集控室给出“零舵角”指令。</li>
              <li>3. 观察舵角指示器，若舵角缓慢漂移，说明变量泵零位不准。</li>
              <li>4. 松开变量机构零位调节螺钉的锁紧螺母。</li>
              <li>5. 缓慢微调调节螺钉，观察跑舵方向和速度变化，直至舵角完全稳定。</li>
              <li>6. 锁紧螺母，并进行左右满舵测试，确认回中准确。</li>
            </ul>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-cyan-400 mb-1">变量泵机构透视</h3>
            <p className="text-slate-400">
              黄色部件为零位调节螺钉。蓝色粒子流表示液压油流动。
              <br/>当零位不准时，即使无控制信号，泵也会产生排量导致跑舵。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
