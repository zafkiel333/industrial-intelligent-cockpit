import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/OverheadCraneDeflectionMeasurementEdu/ThreeScene';
import { OverheadCraneState } from '../../../components/Maintenance-Training/OverheadCraneDeflectionMeasurementEdu/three-types';
import { Ruler, ArrowDownToLine, Settings, AlertCircle, Play, Square, Crosshair } from 'lucide-react';

export default function OverheadCraneDeflectionMeasurementEdu() {
  const [state, setState] = useState<OverheadCraneState>({
    mainGirderDeflection: 0,
    loadWeight: 0,
    trolleyPosition: 50, // Center
    bridgePosition: 0,
    isLifting: false,
    isMoving: false,
    ambientTemperature: 25,
    laserSensorStatus: 'Normal',
    laserReading: 10000, // Base distance in mm
    calibrationOffset: 0
  });

  const [testPhase, setTestPhase] = useState<'Idle' | 'Unloaded' | 'Loaded' | 'Result'>('Idle');
  const [unloadedReading, setUnloadedReading] = useState<number | null>(null);
  const [loadedReading, setLoadedReading] = useState<number | null>(null);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const next = { ...prev };

        // Calculate theoretical deflection based on load and trolley position
        // Simplified beam deflection formula: max at center
        const span = 16; // m
        const E = 200e9; // Young's modulus steel (Pa)
        const I = 0.005; // Moment of inertia (m^4) - arbitrary for sim
        
        // Base deflection from dead weight
        let deflection = 5; // mm

        // Deflection from load
        if (next.loadWeight > 0) {
            // Position factor: max at 50%, 0 at 0% and 100%
            const posFactor = 1 - Math.abs(next.trolleyPosition - 50) / 50;
            // Load factor
            const loadFactor = next.loadWeight * 1.5; // mm per ton at center
            deflection += loadFactor * posFactor;
        }

        // Add some noise
        deflection += (Math.random() * 0.2 - 0.1);

        // Temperature effect (thermal expansion/sag)
        deflection += (next.ambientTemperature - 25) * 0.1;

        next.mainGirderDeflection = deflection;

        // Update Laser Reading
        // Base distance to floor is 10m (10000mm). Deflection reduces this distance.
        if (next.laserSensorStatus === 'Normal') {
            next.laserReading = 10000 - deflection + next.calibrationOffset + (Math.random() * 0.5 - 0.25);
        } else if (next.laserSensorStatus === 'Warning') {
            next.laserReading = 10000 - deflection + next.calibrationOffset + (Math.random() * 5 - 2.5); // Noisy
        } else {
            next.laserReading = 0; // Error
        }

        return next;
      });
    }, 100); // Fast update for smooth reading

    return () => clearInterval(interval);
  }, []);

  const handleTrolleyMove = (pos: number) => {
    setState(prev => ({ ...prev, trolleyPosition: pos, isMoving: true }));
    setTimeout(() => setState(prev => ({ ...prev, isMoving: false })), 500);
  };

  const handleLoadChange = (weight: number) => {
    setState(prev => ({ ...prev, loadWeight: weight, isLifting: true }));
    setTimeout(() => setState(prev => ({ ...prev, isLifting: false })), 1000);
  };

  const calibrateSensor = () => {
    setState(prev => ({
      ...prev,
      calibrationOffset: 10000 - prev.laserReading + prev.calibrationOffset
    }));
  };

  const startTestSequence = () => {
    setTestPhase('Unloaded');
    handleTrolleyMove(50);
    handleLoadChange(0);
  };

  const recordUnloaded = () => {
    setUnloadedReading(state.laserReading);
    setTestPhase('Loaded');
    handleLoadChange(32); // Apply rated load (e.g., 32t)
  };

  const recordLoaded = () => {
    setLoadedReading(state.laserReading);
    setTestPhase('Result');
  };

  const resetTest = () => {
    setTestPhase('Idle');
    setUnloadedReading(null);
    setLoadedReading(null);
    handleLoadChange(0);
  };

  const calculatedDeflection = (unloadedReading && loadedReading) ? (unloadedReading - loadedReading) : 0;
  const allowableDeflection = (16000 / 700); // Span / 700 is a common standard (approx 22.8mm for 16m span)

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 tracking-wider">桥式起重机主梁下挠度测量教学</h1>
          <p className="text-sm text-slate-400 mt-1">Overhead Crane Main Girder Deflection Measurement</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 rounded-lg border bg-slate-800 border-slate-600 text-slate-400 flex items-center gap-2">
            <Ruler size={18} />
            跨度: 16m | 额定载荷: 32t
          </div>
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.laserSensorStatus === 'Normal' ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-red-900/50 border-red-500 text-red-400'}`}>
            <Crosshair size={18} />
            激光测距仪: {state.laserSensorStatus}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="实时测量数据" highlight>
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/80 border border-indigo-500/30 rounded-lg text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>
                <div className="text-sm text-indigo-300 mb-1 relative z-10">激光测距仪读数 (至主梁底部)</div>
                <div className="font-mono text-4xl text-indigo-400 font-bold relative z-10">
                  {state.laserReading.toFixed(2)} <span className="text-xl">mm</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">小车位置</div>
                  <div className="font-mono text-lg text-cyan-400">{state.trolleyPosition.toFixed(1)} %</div>
                </div>
                <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">当前载荷</div>
                  <div className="font-mono text-lg text-yellow-400">{state.loadWeight.toFixed(1)} t</div>
                </div>
                <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">环境温度</div>
                  <div className="font-mono text-lg text-orange-400">{state.ambientTemperature.toFixed(1)} °C</div>
                </div>
                <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">理论下挠度</div>
                  <div className="font-mono text-lg text-slate-300">{state.mainGirderDeflection.toFixed(2)} mm</div>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="测量流程控制">
            <div className="space-y-4">
              
              {/* Stepper UI */}
              <div className="flex justify-between relative mb-6">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-700 -z-10 -translate-y-1/2"></div>
                {['Idle', 'Unloaded', 'Loaded', 'Result'].map((step, index) => {
                  const isActive = testPhase === step;
                  const isPast = ['Idle', 'Unloaded', 'Loaded', 'Result'].indexOf(testPhase) > index;
                  return (
                    <div key={step} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${isActive ? 'bg-indigo-600 border-indigo-400 text-white' : isPast ? 'bg-green-600 border-green-400 text-white' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>
                      {index + 1}
                    </div>
                  )
                })}
              </div>

              {testPhase === 'Idle' && (
                <div className="text-center space-y-3">
                  <p className="text-sm text-slate-400">准备进行主梁静载下挠度测试。请确保起重机停在测试区域，激光测距仪已对准跨中基准点。</p>
                  <button onClick={calibrateSensor} className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm mb-2">传感器归零校准</button>
                  <button onClick={startTestSequence} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold flex items-center justify-center gap-2">
                    <Play size={18} /> 开始测试流程
                  </button>
                </div>
              )}

              {testPhase === 'Unloaded' && (
                <div className="text-center space-y-3">
                  <p className="text-sm text-slate-300">步骤 1: 记录空载基准值</p>
                  <p className="text-xs text-slate-400">小车已移至跨中(50%)，无吊载。待数据稳定后记录。</p>
                  <button onClick={recordUnloaded} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold">
                    记录空载读数
                  </button>
                </div>
              )}

              {testPhase === 'Loaded' && (
                <div className="text-center space-y-3">
                  <p className="text-sm text-slate-300">步骤 2: 施加额定载荷并记录</p>
                  <p className="text-xs text-slate-400">已起吊额定载荷(32t)，悬停离地100mm。静置10分钟后记录。</p>
                  <div className="text-xs text-yellow-400 animate-pulse">正在模拟静置等待...</div>
                  <button onClick={recordLoaded} className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-bold text-slate-900">
                    记录满载读数
                  </button>
                </div>
              )}

              {testPhase === 'Result' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-800 rounded border border-slate-600">
                    <div className="flex justify-between text-sm mb-1"><span>空载读数 (h1):</span> <span className="font-mono">{unloadedReading?.toFixed(2)} mm</span></div>
                    <div className="flex justify-between text-sm mb-1"><span>满载读数 (h2):</span> <span className="font-mono">{loadedReading?.toFixed(2)} mm</span></div>
                    <div className="w-full h-px bg-slate-600 my-2"></div>
                    <div className="flex justify-between text-base font-bold text-indigo-400">
                      <span>实测下挠度 (Δh):</span> 
                      <span className="font-mono">{calculatedDeflection.toFixed(2)} mm</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded border ${calculatedDeflection <= allowableDeflection ? 'bg-green-900/30 border-green-500/50 text-green-400' : 'bg-red-900/30 border-red-500/50 text-red-400'}`}>
                    <div className="flex items-center gap-2 mb-1 font-bold">
                      {calculatedDeflection <= allowableDeflection ? <ArrowDownToLine size={18} /> : <AlertCircle size={18} />}
                      结论: {calculatedDeflection <= allowableDeflection ? '合格' : '超标'}
                    </div>
                    <div className="text-xs">
                      允许最大下挠度 (S/700): {allowableDeflection.toFixed(2)} mm
                    </div>
                  </div>

                  <button onClick={resetTest} className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm flex items-center justify-center gap-2">
                    <Square size={16} /> 结束测试并复位
                  </button>
                </div>
              )}

            </div>
          </SciFiCard>

          <SciFiCard title="手动控制面板">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>小车位置</span>
                  <span>{state.trolleyPosition.toFixed(0)}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={state.trolleyPosition}
                  onChange={(e) => handleTrolleyMove(Number(e.target.value))}
                  disabled={testPhase !== 'Idle' && testPhase !== 'Result'}
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>吊载重量 (t)</span>
                  <span>{state.loadWeight.toFixed(1)}t</span>
                </div>
                <input 
                  type="range" min="0" max="40" step="0.5" value={state.loadWeight}
                  onChange={(e) => handleLoadChange(Number(e.target.value))}
                  disabled={testPhase !== 'Idle' && testPhase !== 'Result'}
                  className="w-full accent-yellow-500"
                />
              </div>
            </div>
          </SciFiCard>

        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-indigo-400 mb-1">起重机主梁形变可视化</h3>
            <p className="text-slate-400">
              - 绿色光束：激光测距仪<br/>
              - 主梁形变在视觉上进行了适度夸张以方便观察<br/>
              - 载荷越重、越靠近跨中，下挠度越大
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
