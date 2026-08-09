import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/ElectromagneticFlowmeterElectrodeTestSim/ThreeScene';
import { FlowmeterState } from '../../../components/Maintenance-Training/ElectromagneticFlowmeterElectrodeTestSim/three-types';
import { Activity, Droplets, Zap, AlertTriangle, Settings2, Play, Square } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ElectromagneticFlowmeterElectrodeTestSim]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ElectromagneticFlowmeterElectrodeTestSim';

export default function ElectromagneticFlowmeterElectrodeTestSim() {
  const [state, setState] = useState<FlowmeterState>({
    flowRate: 0,
    fluidConductivity: 500, // uS/cm (typical tap water)
    electrodeVoltageA: 0,
    electrodeVoltageB: 0,
    polarizationVoltage: 0,
    isTesting: false,
    testPhase: 'FullPipeZeroFlow',
    electrodeCoating: 0,
    magneticFieldStrength: 0.05 // Tesla
  });

  const [multimeterMode, setMultimeterMode] = useState<'DCV' | 'ACV' | 'Resistance'>('DCV');

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const next = { ...prev };

        // Simulate Electromagnetic Flowmeter Physics
        // E = B * v * D (Induced voltage = Magnetic field * velocity * diameter)
        // We simulate the voltage at the electrodes

        // Base noise
        let noiseA = (Math.random() - 0.5) * 2; // mV
        let noiseB = (Math.random() - 0.5) * 2; // mV

        if (next.testPhase === 'EmptyPipe') {
            // Empty pipe: infinite resistance, erratic voltage, high polarization
            next.electrodeVoltageA = 1500 + (Math.random() * 500); // High erratic mV
            next.electrodeVoltageB = 1500 + (Math.random() * 500);
            next.polarizationVoltage = Math.abs(next.electrodeVoltageA - next.electrodeVoltageB);
        } else {
            // Full pipe
            // Polarization voltage (DC offset) depends on fluid and coating
            const basePolarization = 50; // mV
            const coatingEffect = next.electrodeCoating * 2; // Up to 200mV extra
            
            // Flow induced voltage (AC component, simplified as DC for this meter reading sim)
            const flowVelocity = next.flowRate / 3600; // Simplified conversion
            const inducedVoltage = next.magneticFieldStrength * flowVelocity * 0.2 * 1000; // mV

            // Asymmetry due to coating
            const asymmetry = (next.electrodeCoating / 100) * 0.2;

            next.electrodeVoltageA = basePolarization + coatingEffect + (inducedVoltage * (1 + asymmetry)) + noiseA;
            next.electrodeVoltageB = basePolarization + coatingEffect - (inducedVoltage * (1 - asymmetry)) + noiseB;

            // Polarization voltage is the DC difference between electrodes and ground
            // In a real test, measured between electrode and ground ring
            next.polarizationVoltage = Math.max(Math.abs(next.electrodeVoltageA), Math.abs(next.electrodeVoltageB));
        }

        return next;
      });
    }, 500); // Update every 500ms for multimeter feel

    return () => clearInterval(interval);
  }, []);

  const setPhase = (phase: FlowmeterState['testPhase']) => {
    setState(prev => {
        const next = { ...prev, testPhase: phase };
        if (phase === 'EmptyPipe') next.flowRate = 0;
        if (phase === 'FullPipeZeroFlow') next.flowRate = 0;
        if (phase === 'Flowing') next.flowRate = 50; // Set a default flow
        return next;
    });
  };

  const getMultimeterReading = () => {
    if (multimeterMode === 'DCV') {
        // Measuring polarization voltage (DC)
        return state.polarizationVoltage.toFixed(1) + ' mV';
    } else if (multimeterMode === 'ACV') {
        // Measuring flow signal (AC)
        if (state.testPhase === 'Flowing') {
            const flowVelocity = state.flowRate / 3600;
            const induced = state.magneticFieldStrength * flowVelocity * 0.2 * 1000;
            return induced.toFixed(2) + ' mV';
        }
        return '0.00 mV';
    } else {
        // Resistance (simplified)
        if (state.testPhase === 'EmptyPipe') return 'O.L (开路)';
        // Resistance increases with coating and decreases with conductivity
        const baseRes = 10000 / state.fluidConductivity; // kOhm
        const coatingRes = state.electrodeCoating * 5; // kOhm
        return (baseRes + coatingRes).toFixed(1) + ' kΩ';
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 tracking-wider">电磁流量计电极极化电压测量</h1>
          <p className="text-sm text-slate-400 mt-1">Electromagnetic Flowmeter Electrode Polarization Voltage Test</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 rounded-lg border bg-slate-800 border-slate-600 text-slate-400 flex items-center gap-2">
            <Droplets size={18} />
            介质电导率: {state.fluidConductivity} μS/cm
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="数字万用表 (模拟)" highlight>
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 border-2 border-slate-700 rounded-lg relative overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-slate-400">FLUKE 87V</div>
                  <div className="text-xs font-bold text-yellow-500">{multimeterMode}</div>
                </div>
                <div className="font-mono text-5xl text-right text-slate-200 tracking-widest bg-slate-800/50 p-4 rounded border border-slate-700 shadow-inner">
                  {getMultimeterReading()}
                </div>
                
                {/* Multimeter Dial */}
                <div className="mt-6 flex justify-center gap-4">
                  <button 
                    onClick={() => setMultimeterMode('DCV')}
                    className={`px-4 py-2 rounded font-bold ${multimeterMode === 'DCV' ? 'bg-yellow-600 text-slate-900' : 'bg-slate-700 text-slate-400'}`}
                  >
                    V= (DC)
                  </button>
                  <button 
                    onClick={() => setMultimeterMode('ACV')}
                    className={`px-4 py-2 rounded font-bold ${multimeterMode === 'ACV' ? 'bg-yellow-600 text-slate-900' : 'bg-slate-700 text-slate-400'}`}
                  >
                    V~ (AC)
                  </button>
                  <button 
                    onClick={() => setMultimeterMode('Resistance')}
                    className={`px-4 py-2 rounded font-bold ${multimeterMode === 'Resistance' ? 'bg-yellow-600 text-slate-900' : 'bg-slate-700 text-slate-400'}`}
                  >
                    Ω
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-300">
                <p className="mb-1"><strong className="text-indigo-400">测量说明：</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>极化电压 (DCV):</strong> 测量电极与地之间的直流电压。正常满管时应 &lt; 1V (1000mV)。若过高，说明电极被污染或极化严重。</li>
                  <li><strong>电极电阻 (Ω):</strong> 测量电极与地之间的电阻。满管时通常在几kΩ到几十kΩ。空管时为无穷大(O.L)。</li>
                </ul>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="工况模拟控制">
            <div className="space-y-4">
              
              <div>
                <div className="text-sm text-slate-400 mb-2">管道状态</div>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setPhase('EmptyPipe')}
                    className={`py-2 rounded text-xs font-bold ${state.testPhase === 'EmptyPipe' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                  >
                    空管报警测试
                  </button>
                  <button 
                    onClick={() => setPhase('FullPipeZeroFlow')}
                    className={`py-2 rounded text-xs font-bold ${state.testPhase === 'FullPipeZeroFlow' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                  >
                    满管零点测试
                  </button>
                  <button 
                    onClick={() => setPhase('Flowing')}
                    className={`py-2 rounded text-xs font-bold ${state.testPhase === 'Flowing' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                  >
                    正常流量运行
                  </button>
                </div>
              </div>

              {state.testPhase === 'Flowing' && (
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>流量设定</span>
                    <span>{state.flowRate} m³/h</span>
                  </div>
                  <input 
                    type="range" min="10" max="200" step="10" value={state.flowRate}
                    onChange={(e) => setState(prev => ({ ...prev, flowRate: Number(e.target.value) }))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-700">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>电极结垢/污染程度模拟</span>
                  <span className={state.electrodeCoating > 50 ? 'text-red-400' : 'text-yellow-400'}>{state.electrodeCoating}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={state.electrodeCoating}
                  onChange={(e) => setState(prev => ({ ...prev, electrodeCoating: Number(e.target.value) }))}
                  className="w-full accent-red-500"
                />
                <p className="text-xs text-slate-500 mt-1">增加结垢会导致极化电压升高，接触电阻增大。</p>
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
            <h3 className="font-bold text-indigo-400 mb-1">电磁流量计内部透视图</h3>
            <p className="text-slate-400">
              - 上下褐色块：励磁线圈<br/>
              - 两侧金色圆柱：测量电极<br/>
              - 蓝色流体：导电介质<br/>
              - 红色虚线：磁场方向<br/>
              - 结垢模拟会改变电极颜色
            </p>
          </div>

          {/* Diagnostic Overlay */}
          <div className="absolute bottom-4 right-4 z-10 bg-slate-900/90 border border-slate-600 p-4 rounded-lg w-64">
            <h4 className="text-sm font-bold text-slate-200 mb-2 border-b border-slate-700 pb-1">诊断结论</h4>
            {state.testPhase === 'EmptyPipe' ? (
              <div className="text-red-400 text-sm flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 shrink-0"/>
                <span>空管状态。极化电压极高且不稳定，电阻无穷大。空管报警应触发。</span>
              </div>
            ) : state.electrodeCoating > 70 ? (
              <div className="text-red-400 text-sm flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 shrink-0"/>
                <span>电极严重污染！极化电压超过1V，建议拆卸清洗电极。</span>
              </div>
            ) : state.electrodeCoating > 30 ? (
              <div className="text-yellow-400 text-sm flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 shrink-0"/>
                <span>电极轻度结垢。极化电压偏高，可能影响测量精度。</span>
              </div>
            ) : (
              <div className="text-green-400 text-sm flex items-start gap-2">
                <Activity size={16} className="mt-0.5 shrink-0"/>
                <span>电极状态良好。极化电压在正常范围内 (&lt; 100mV)。</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
