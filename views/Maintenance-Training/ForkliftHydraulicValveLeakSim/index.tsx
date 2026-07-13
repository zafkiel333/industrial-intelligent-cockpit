import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/ForkliftHydraulicValveLeakSim/ThreeScene';
import { ForkliftHydraulicState } from '../../../components/Maintenance-Training/ForkliftHydraulicValveLeakSim/three-types';
import { Droplets, Gauge, Play, Square, AlertTriangle, Settings2 } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ForkliftHydraulicValveLeakSim]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ForkliftHydraulicValveLeakSim';

export default function ForkliftHydraulicValveLeakSim() {
  const [state, setState] = useState<ForkliftHydraulicState>({
    systemPressure: 0,
    pumpSpeed: 0,
    oilTemperature: 45,
    valveSpoolPosition: 0,
    cylinderPosition: 0,
    internalLeakageRate: 0, // Set to >0 to simulate a fault
    isTesting: false,
    testPhase: 'Idle',
    pressureDrop: 0
  });

  const [faultSeverity, setFaultSeverity] = useState<number>(0); // 0 = healthy, 100 = severe leak
  const [testTimer, setTestTimer] = useState<number>(0);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const next = { ...prev };

        // Basic Hydraulic Logic
        if (next.pumpSpeed > 0) {
            // Pump running
            if (next.valveSpoolPosition > 10) {
                // Extending cylinder
                next.systemPressure = 15 + (Math.random() * 0.5); // Operating pressure
                next.cylinderPosition = Math.min(1000, next.cylinderPosition + (next.pumpSpeed / 100));
            } else if (next.valveSpoolPosition < -10) {
                // Retracting cylinder
                next.systemPressure = 12 + (Math.random() * 0.5);
                next.cylinderPosition = Math.max(0, next.cylinderPosition - (next.pumpSpeed / 100));
            } else {
                // Neutral, holding
                if (next.testPhase === 'Holding') {
                    // Pressure drop due to internal leakage
                    const leakFactor = (faultSeverity / 100) * 0.5; // MPa drop per tick
                    next.systemPressure = Math.max(0, next.systemPressure - leakFactor);
                    next.internalLeakageRate = faultSeverity * (next.systemPressure / 20); // Leakage depends on pressure
                } else {
                    // Relief valve pressure or standby
                    next.systemPressure = 2 + (Math.random() * 0.2);
                    next.internalLeakageRate = 0;
                }
            }
        } else {
            // Pump off
            if (next.testPhase === 'Holding') {
                const leakFactor = (faultSeverity / 100) * 0.5;
                next.systemPressure = Math.max(0, next.systemPressure - leakFactor);
                next.internalLeakageRate = faultSeverity * (next.systemPressure / 20);
            } else {
                next.systemPressure = Math.max(0, next.systemPressure - 1); // Bleed off
                next.internalLeakageRate = 0;
            }
        }

        // Temperature rises slightly with leakage
        if (next.internalLeakageRate > 10) {
            next.oilTemperature = Math.min(80, next.oilTemperature + 0.05);
        }

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [faultSeverity]);

  // Test Sequence Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.testPhase === 'Holding' && testTimer > 0) {
        timer = setTimeout(() => setTestTimer(t => t - 1), 1000);
    } else if (state.testPhase === 'Holding' && testTimer === 0) {
        // Test complete
        setState(prev => ({ ...prev, testPhase: 'Result', isTesting: false }));
    }
    return () => clearTimeout(timer);
  }, [state.testPhase, testTimer]);

  const startPump = () => setState(prev => ({ ...prev, pumpSpeed: 1500 }));
  const stopPump = () => setState(prev => ({ ...prev, pumpSpeed: 0 }));
  
  const moveSpool = (val: number) => setState(prev => ({ ...prev, valveSpoolPosition: val }));

  const startLeakTest = () => {
    setState(prev => {
        const next = { ...prev };
        next.isTesting = true;
        next.testPhase = 'Pressurizing';
        next.pumpSpeed = 1500;
        next.valveSpoolPosition = 100; // Push to end to build pressure
        return next;
    });

    // Simulate building pressure against end stop
    setTimeout(() => {
        setState(prev => {
            const next = { ...prev };
            next.valveSpoolPosition = 0; // Return to neutral to hold
            next.systemPressure = 20; // Set initial hold pressure (e.g., relief setting)
            next.testPhase = 'Holding';
            next.pressureDrop = 0;
            return next;
        });
        setTestTimer(10); // 10 second hold test
    }, 2000);
  };

  const resetTest = () => {
    setState(prev => ({ ...prev, testPhase: 'Idle', isTesting: false, pressureDrop: 0 }));
    setTestTimer(0);
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 tracking-wider">厂内叉车液压多路阀内泄检测实训</h1>
          <p className="text-sm text-slate-400 mt-1">Forklift Hydraulic Multi-way Valve Internal Leakage Detection</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.pumpSpeed > 0 ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
            <Settings2 size={18} className={state.pumpSpeed > 0 ? 'animate-spin' : ''} />
            液压泵: {state.pumpSpeed > 0 ? '运行中' : '停止'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="系统参数监控" highlight>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 p-4 bg-slate-900/80 border border-indigo-500/30 rounded-lg relative overflow-hidden">
                <div className="flex justify-between items-center mb-1 relative z-10">
                  <div className="text-sm text-indigo-300 flex items-center gap-2"><Gauge size={16}/> 系统压力 (P)</div>
                  <div className="font-mono text-3xl text-indigo-400 font-bold">{state.systemPressure.toFixed(1)} <span className="text-lg">MPa</span></div>
                </div>
                {/* Visual pressure bar */}
                <div className="w-full bg-slate-800 h-2 mt-2 rounded-full overflow-hidden relative z-10">
                  <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(state.systemPressure / 25) * 100}%` }}></div>
                </div>
              </div>

              <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">油缸位置</div>
                <div className="font-mono text-lg text-cyan-400">{state.cylinderPosition.toFixed(0)} mm</div>
              </div>
              <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">液压油温</div>
                <div className="font-mono text-lg text-orange-400">{state.oilTemperature.toFixed(1)} °C</div>
              </div>
              <div className="col-span-2 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-2"><Droplets size={14}/> 估算内泄量 (仅供参考)</div>
                <div className={`font-mono text-xl ${state.internalLeakageRate > 10 ? 'text-red-400' : 'text-slate-300'}`}>
                  {state.internalLeakageRate.toFixed(1)} L/min
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="保压测试流程">
            <div className="space-y-4">
              
              <div className="flex justify-between text-xs mb-2">
                <span className={state.testPhase === 'Idle' ? 'text-indigo-400 font-bold' : 'text-slate-500'}>准备</span>
                <span className={state.testPhase === 'Pressurizing' ? 'text-indigo-400 font-bold' : 'text-slate-500'}>加压</span>
                <span className={state.testPhase === 'Holding' ? 'text-indigo-400 font-bold' : 'text-slate-500'}>保压 ({testTimer}s)</span>
                <span className={state.testPhase === 'Result' ? 'text-indigo-400 font-bold' : 'text-slate-500'}>结果</span>
              </div>

              {state.testPhase === 'Idle' && (
                <button 
                  onClick={startLeakTest} 
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold flex items-center justify-center gap-2"
                >
                  <Play size={18} /> 开始标准化保压测试
                </button>
              )}

              {state.testPhase === 'Pressurizing' && (
                <div className="p-4 bg-slate-800 rounded text-center text-sm text-slate-300 animate-pulse">
                  正在将油缸推至极限位置建立系统最高压力...
                </div>
              )}

              {state.testPhase === 'Holding' && (
                <div className="p-4 bg-indigo-900/30 border border-indigo-500/50 rounded text-center">
                  <div className="text-sm text-indigo-300 mb-2">多路阀处于中位，正在监测压力下降</div>
                  <div className="font-mono text-2xl text-white">{testTimer} s</div>
                </div>
              )}

              {state.testPhase === 'Result' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-800 rounded border border-slate-600">
                    <div className="text-sm text-slate-400 mb-1">10秒内压力下降值 (ΔP)</div>
                    <div className="font-mono text-2xl text-yellow-400">
                      {((20 - state.systemPressure)).toFixed(2)} MPa
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded border ${(20 - state.systemPressure) > 2 ? 'bg-red-900/30 border-red-500/50 text-red-400' : 'bg-green-900/30 border-green-500/50 text-green-400'}`}>
                    <div className="font-bold flex items-center gap-2 mb-1">
                      {(20 - state.systemPressure) > 2 ? <AlertTriangle size={18} /> : <div className="w-4 h-4 rounded-full bg-green-500"></div>}
                      诊断结论: {(20 - state.systemPressure) > 2 ? '多路阀内泄严重，需更换密封件或阀芯' : '内泄在允许范围内 (正常)'}
                    </div>
                    <div className="text-xs">标准: 额定压力下，10秒内压降不应超过 2.0 MPa</div>
                  </div>

                  <button onClick={resetTest} className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm flex items-center justify-center gap-2">
                    <Square size={16} /> 结束测试
                  </button>
                </div>
              )}

            </div>
          </SciFiCard>

          <SciFiCard title="设备控制与故障设置">
            <div className="space-y-4">
              <div className="flex gap-2">
                <button onClick={startPump} disabled={state.pumpSpeed > 0 || state.isTesting} className="flex-1 py-2 bg-green-900/50 hover:bg-green-800 border border-green-500/50 rounded text-sm text-green-400 disabled:opacity-50">启动液压泵</button>
                <button onClick={stopPump} disabled={state.pumpSpeed === 0 || state.isTesting} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-slate-300 disabled:opacity-50">停止液压泵</button>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>多路阀阀芯位置 (手动操作)</span>
                  <span>{state.valveSpoolPosition}%</span>
                </div>
                <input 
                  type="range" min="-100" max="100" value={state.valveSpoolPosition}
                  onChange={(e) => moveSpool(Number(e.target.value))}
                  onMouseUp={() => moveSpool(0)} // Spring return to center
                  onTouchEnd={() => moveSpool(0)}
                  disabled={state.isTesting}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>缩回 (Retract)</span>
                  <span>中位 (Neutral)</span>
                  <span>伸出 (Extend)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>设置阀芯磨损程度 (内泄故障)</span>
                  <span className={faultSeverity > 50 ? 'text-red-400' : 'text-yellow-400'}>{faultSeverity}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={faultSeverity}
                  onChange={(e) => setFaultSeverity(Number(e.target.value))}
                  disabled={state.isTesting}
                  className="w-full accent-red-500"
                />
              </div>
            </div>
          </SciFiCard>

        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>

          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-indigo-400 mb-1">液压系统透视图</h3>
            <p className="text-slate-400">
              - 左侧: 液压泵<br/>
              - 中间: 多路换向阀 (内部可见阀芯移动)<br/>
              - 右侧: 执行油缸<br/>
              - 红色管路代表高压，蓝色代表低压/回油<br/>
              - 阀体内部红色粒子表示内泄流体
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
