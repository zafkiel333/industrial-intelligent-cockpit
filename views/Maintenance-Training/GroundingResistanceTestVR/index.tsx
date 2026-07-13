import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/GroundingResistanceTestVR/ThreeScene';
import { GroundingState } from '../../../components/Maintenance-Training/GroundingResistanceTestVR/three-types';
import { Activity, Zap, Ruler, CloudRain, Sun, Cloud, AlertTriangle, CheckCircle2 } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[GroundingResistanceTestVR]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/GroundingResistanceTestVR';

export default function GroundingResistanceTestVR() {
  const [state, setState] = useState<GroundingState>({
    testVoltage: 0,
    testCurrent: 0,
    measuredResistance: 0,
    soilResistivity: 100, // Base Ohm-m
    probeDistanceE: 0,
    probeDistanceP: 20, // Default 20m
    probeDistanceC: 40, // Default 40m
    isTesting: false,
    connectionStatus: { E: true, P: true, C: true },
    weatherCondition: 'Normal'
  });

  // Calculate Resistance based on physics principles (simplified Fall-of-Potential method)
  useEffect(() => {
    if (!state.isTesting) return;

    const interval = setInterval(() => {
      setState(prev => {
        const next = { ...prev };

        // Check connections
        if (!next.connectionStatus.E || !next.connectionStatus.P || !next.connectionStatus.C) {
            next.measuredResistance = 9999; // Open circuit
            next.testCurrent = 0;
            next.testVoltage = 0;
            return next;
        }

        // Adjust soil resistivity based on weather
        let currentResistivity = next.soilResistivity;
        if (next.weatherCondition === 'Wet') currentResistivity *= 0.5;
        if (next.weatherCondition === 'Dry') currentResistivity *= 2.0;

        // Base resistance of the grounding grid itself (ideal)
        const trueGridResistance = 2.5; // Ohms

        // Fall of Potential Curve Simulation
        // R_measured = V_p / I_c
        // The measured resistance varies depending on where probe P is placed relative to C.
        // Ideal placement is usually at 61.8% of distance to C.
        
        const ratio = next.probeDistanceP / next.probeDistanceC;
        
        // Simulate the resistance curve
        let measuredR = trueGridResistance;
        
        if (ratio < 0.1) {
            // Too close to E, measuring E's local resistance field
            measuredR = trueGridResistance * 0.2;
        } else if (ratio > 0.9) {
            // Too close to C, measuring C's local resistance field
            measuredR = trueGridResistance * 5;
        } else {
            // The "flat" part of the curve is around 0.5 - 0.7
            // We create a curve that is flat near 0.618 and rises at ends
            const deviationFromIdeal = Math.abs(ratio - 0.618);
            measuredR = trueGridResistance * (1 + deviationFromIdeal * 0.5);
        }

        // Add soil resistivity effect
        measuredR *= (currentResistivity / 100);

        // Add some noise
        measuredR += (Math.random() - 0.5) * 0.1;

        next.measuredResistance = Math.max(0, measuredR);
        
        // Simulate instrument injecting current and measuring voltage
        next.testCurrent = 10; // mA constant current source
        next.testVoltage = (next.testCurrent / 1000) * next.measuredResistance;

        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [state.isTesting, state.probeDistanceP, state.probeDistanceC, state.weatherCondition, state.connectionStatus]);

  const toggleConnection = (terminal: 'E' | 'P' | 'C') => {
    setState(prev => ({
        ...prev,
        connectionStatus: {
            ...prev.connectionStatus,
            [terminal]: !prev.connectionStatus[terminal]
        }
    }));
  };

  const setWeather = (weather: GroundingState['weatherCondition']) => {
      setState(prev => ({ ...prev, weatherCondition: weather }));
  };

  // Determine if reading is valid (P is around 62% of C)
  const ratio = state.probeDistanceP / state.probeDistanceC;
  const isOptimalPlacement = ratio >= 0.55 && ratio <= 0.65;
  const isResistancePass = state.measuredResistance > 0 && state.measuredResistance <= 4.0; // Standard industrial requirement < 4 Ohms

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 tracking-wider">厂区防雷接地网接地电阻测试模拟</h1>
          <p className="text-sm text-slate-400 mt-1">Grounding Grid Resistance Test VR Simulation (Fall-of-Potential Method)</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 rounded-lg border bg-slate-800 border-slate-600 text-slate-400 flex items-center gap-2">
            {state.weatherCondition === 'Dry' && <Sun size={18} className="text-yellow-500"/>}
            {state.weatherCondition === 'Normal' && <Cloud size={18} className="text-slate-300"/>}
            {state.weatherCondition === 'Wet' && <CloudRain size={18} className="text-blue-400"/>}
            土壤状态: {state.weatherCondition === 'Dry' ? '干燥 (高阻)' : state.weatherCondition === 'Wet' ? '潮湿 (低阻)' : '正常'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="接地电阻测试仪" highlight>
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 border-2 border-slate-700 rounded-lg relative overflow-hidden flex flex-col items-center">
                <div className="w-full flex justify-between text-xs text-slate-400 mb-2">
                  <span>MODEL: GEO-4000</span>
                  <span className={state.isTesting ? "text-green-400 animate-pulse" : "text-slate-500"}>
                    {state.isTesting ? "TESTING..." : "READY"}
                  </span>
                </div>
                
                <div className="font-mono text-5xl text-center text-green-400 tracking-widest bg-slate-800/80 p-6 rounded border border-slate-600 shadow-inner w-full mb-4">
                  {state.measuredResistance === 9999 ? 'O.L' : state.measuredResistance.toFixed(2)} <span className="text-2xl">Ω</span>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full text-sm text-slate-400 mb-4">
                  <div className="bg-slate-800 p-2 rounded text-center">
                    V: {state.testVoltage.toFixed(2)} V
                  </div>
                  <div className="bg-slate-800 p-2 rounded text-center">
                    I: {state.testCurrent.toFixed(1)} mA
                  </div>
                </div>

                <button 
                  onMouseDown={() => setState(prev => ({ ...prev, isTesting: true }))}
                  onMouseUp={() => setState(prev => ({ ...prev, isTesting: false }))}
                  onMouseLeave={() => setState(prev => ({ ...prev, isTesting: false }))}
                  className={`w-32 h-32 rounded-full font-bold text-xl transition-all shadow-lg flex items-center justify-center border-4 ${state.isTesting ? 'bg-red-600 border-red-400 text-white scale-95 shadow-inner' : 'bg-red-700 border-red-900 text-slate-200 hover:bg-red-600'}`}
                >
                  TEST
                </button>
                <p className="text-xs text-slate-500 mt-2">长按进行测试</p>
              </div>

              {/* Connection Terminals */}
              <div className="flex justify-between px-4">
                <button onClick={() => toggleConnection('E')} className={`flex flex-col items-center gap-1 ${state.connectionStatus.E ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-slate-300"></div>
                  <span className="text-xs font-bold">E (接地极)</span>
                </button>
                <button onClick={() => toggleConnection('P')} className={`flex flex-col items-center gap-1 ${state.connectionStatus.P ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-slate-300"></div>
                  <span className="text-xs font-bold">P (电位极)</span>
                </button>
                <button onClick={() => toggleConnection('C')} className={`flex flex-col items-center gap-1 ${state.connectionStatus.C ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-slate-300"></div>
                  <span className="text-xs font-bold">C (电流极)</span>
                </button>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="测试布线与环境设置">
            <div className="space-y-6">
              
              <div>
                <div className="flex justify-between text-sm text-slate-300 mb-1">
                  <span className="flex items-center gap-2"><Ruler size={16}/> C极 (电流极) 距离</span>
                  <span className="font-mono text-red-400">{state.probeDistanceC} m</span>
                </div>
                <input 
                  type="range" min="20" max="100" step="5" value={state.probeDistanceC}
                  onChange={(e) => {
                      const newC = Number(e.target.value);
                      setState(prev => ({ 
                          ...prev, 
                          probeDistanceC: newC,
                          // Keep P within C's range
                          probeDistanceP: Math.min(prev.probeDistanceP, newC - 5)
                      }))
                  }}
                  className="w-full accent-red-500"
                />
                <p className="text-xs text-slate-500 mt-1">通常要求大于接地网对角线长度的4-5倍。</p>
              </div>

              <div>
                <div className="flex justify-between text-sm text-slate-300 mb-1">
                  <span className="flex items-center gap-2"><Ruler size={16}/> P极 (电位极) 距离</span>
                  <span className="font-mono text-yellow-400">{state.probeDistanceP} m</span>
                </div>
                <input 
                  type="range" min="5" max={state.probeDistanceC - 5} step="1" value={state.probeDistanceP}
                  onChange={(e) => setState(prev => ({ ...prev, probeDistanceP: Number(e.target.value) }))}
                  className="w-full accent-yellow-500"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-500">当前比例: {(ratio * 100).toFixed(1)}%</span>
                  <span className={`text-xs font-bold ${isOptimalPlacement ? 'text-green-400' : 'text-yellow-500'}`}>
                    {isOptimalPlacement ? '最佳位置 (0.618区)' : '可能存在测量误差'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="text-sm text-slate-400 mb-2">模拟天气/土壤条件</div>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setWeather('Dry')} className={`py-2 rounded text-xs font-bold flex flex-col items-center gap-1 ${state.weatherCondition === 'Dry' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700' : 'bg-slate-800 text-slate-400'}`}>
                    <Sun size={16}/> 干燥
                  </button>
                  <button onClick={() => setWeather('Normal')} className={`py-2 rounded text-xs font-bold flex flex-col items-center gap-1 ${state.weatherCondition === 'Normal' ? 'bg-slate-700 text-white border border-slate-500' : 'bg-slate-800 text-slate-400'}`}>
                    <Cloud size={16}/> 正常
                  </button>
                  <button onClick={() => setWeather('Wet')} className={`py-2 rounded text-xs font-bold flex flex-col items-center gap-1 ${state.weatherCondition === 'Wet' ? 'bg-blue-900/50 text-blue-400 border border-blue-700' : 'bg-slate-800 text-slate-400'}`}>
                    <CloudRain size={16}/> 雨后
                  </button>
                </div>
              </div>

            </div>
          </SciFiCard>

        </div>

        {/* Right Panel - 3D View & Evaluation */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="flex-1 border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50 min-h-[400px]">
            <ThreeScene state={state} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

            <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
              <h3 className="font-bold text-indigo-400 mb-1">直线法 (Fall-of-Potential) 布线视图</h3>
              <p className="text-slate-400">
                - <span className="text-green-400">E极</span>: 连接被测接地网<br/>
                - <span className="text-yellow-400">P极</span>: 电位探测针<br/>
                - <span className="text-red-400">C极</span>: 电流辅助针<br/>
                - 测试时可见地下电流回流路径
              </p>
            </div>

            {/* Distance Markers Overlay */}
            <div className="absolute bottom-10 left-0 w-full flex justify-center pointer-events-none">
                <div className="w-3/4 max-w-2xl relative h-8 border-b-2 border-slate-500">
                    {/* E Marker */}
                    <div className="absolute left-0 bottom-0 transform -translate-x-1/2 flex flex-col items-center">
                        <div className="w-0.5 h-4 bg-green-500"></div>
                        <span className="text-xs font-bold text-green-400 mt-1">E (0m)</span>
                    </div>
                    {/* P Marker */}
                    <div className="absolute bottom-0 transform -translate-x-1/2 flex flex-col items-center transition-all duration-300" style={{ left: `${ratio * 100}%` }}>
                        <div className="w-0.5 h-4 bg-yellow-500"></div>
                        <span className="text-xs font-bold text-yellow-400 mt-1">P ({state.probeDistanceP}m)</span>
                    </div>
                    {/* C Marker */}
                    <div className="absolute right-0 bottom-0 transform translate-x-1/2 flex flex-col items-center">
                        <div className="w-0.5 h-4 bg-red-500"></div>
                        <span className="text-xs font-bold text-red-400 mt-1">C ({state.probeDistanceC}m)</span>
                    </div>
                </div>
            </div>
          </div>

          <SciFiCard title="测试结果评估">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h4 className="text-sm font-bold text-slate-300 mb-2">布线规范性</h4>
                {isOptimalPlacement ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 size={20} />
                    <span>P极位置极佳 (约61.8%)，处于零电位区，测量结果准确。</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-yellow-400">
                    <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                    <span className="text-sm">P极偏离0.618位置。若太靠近E极，测量值偏小；若太靠近C极，测量值偏大。建议调整。</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h4 className="text-sm font-bold text-slate-300 mb-2">阻值合规性 (标准: &le; 4Ω)</h4>
                {!state.isTesting && state.measuredResistance === 0 ? (
                  <span className="text-slate-500 text-sm">请长按TEST按钮进行测量...</span>
                ) : state.measuredResistance === 9999 ? (
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle size={20} />
                    <span>测试线未连接或断路！</span>
                  </div>
                ) : isResistancePass ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 size={20} />
                    <span>接地电阻 {state.measuredResistance.toFixed(2)}Ω，符合安全规范要求。</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-red-400">
                    <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                    <span className="text-sm">接地电阻 {state.measuredResistance.toFixed(2)}Ω，超出4Ω限值！需检查接地网腐蚀情况或添加降阻剂。</span>
                  </div>
                )}
              </div>
            </div>
          </SciFiCard>

        </div>
      </div>
    </div>
  );
}
