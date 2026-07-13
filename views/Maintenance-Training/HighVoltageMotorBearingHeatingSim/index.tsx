import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/HighVoltageMotorBearingHeatingSim/ThreeScene';
import { MotorHeatingState } from '../../../components/Maintenance-Training/HighVoltageMotorBearingHeatingSim/three-types';
import { Thermometer, Power, Play, Square, AlertTriangle, CheckCircle } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[HighVoltageMotorBearingHeatingSim]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/HighVoltageMotorBearingHeatingSim';

export default function HighVoltageMotorBearingHeatingSim() {
  const [state, setState] = useState<MotorHeatingState>({
    bearingTemperature: 25,
    heaterTemperature: 25,
    ambientTemperature: 25,
    heatingTime: 0,
    isHeating: false,
    targetTemperature: 110, // Standard target for bearing heating
    magneticProbeAttached: false,
    bearingInnerDiameter: 100.00, // mm
    shaftOuterDiameter: 100.05, // mm (interference fit)
    expansionAmount: 0,
    heaterPower: 3.6 // kW
  });

  const [testPhase, setTestPhase] = useState<'Setup' | 'Heating' | 'Ready' | 'Overheated'>('Setup');

  // Simulation Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isHeating) {
      interval = setInterval(() => {
        setState(prev => {
          const next = { ...prev };
          
          // Heating logic
          // Temperature rise depends on power and mass (simplified)
          const heatingRate = next.heaterPower * 0.5; // deg C per second
          
          if (next.magneticProbeAttached) {
            // Closed loop control
            if (next.bearingTemperature < next.targetTemperature) {
                next.bearingTemperature += heatingRate;
                next.heaterTemperature = next.bearingTemperature + 5; // Heater is slightly hotter
            } else {
                // Maintain temp
                next.isHeating = false; // Auto shutoff
            }
          } else {
            // Open loop (Dangerous!)
            next.heaterTemperature += heatingRate * 1.5;
            // Bearing heats slower than heater without direct feedback control
            next.bearingTemperature += heatingRate * 0.8; 
          }

          next.heatingTime += 1;

          // Calculate Thermal Expansion
          // Formula: ΔL = α * L * ΔT
          // α for steel ≈ 1.2e-5 / °C
          const alpha = 0.000012;
          const deltaT = next.bearingTemperature - next.ambientTemperature;
          next.expansionAmount = next.bearingInnerDiameter * alpha * deltaT;

          // Phase logic
          if (next.bearingTemperature >= 120) {
              setTestPhase('Overheated');
              next.isHeating = false; // Safety trip
          } else if (next.bearingTemperature >= next.targetTemperature && next.magneticProbeAttached) {
              setTestPhase('Ready');
          }

          return next;
        });
      }, 1000); // 1 second per tick
    } else {
      // Cooling down
      interval = setInterval(() => {
        setState(prev => {
          if (prev.bearingTemperature <= prev.ambientTemperature) return prev;
          const next = { ...prev };
          const coolingRate = (next.bearingTemperature - next.ambientTemperature) * 0.01;
          next.bearingTemperature -= coolingRate;
          next.heaterTemperature -= coolingRate * 1.5;
          
          const alpha = 0.000012;
          const deltaT = next.bearingTemperature - next.ambientTemperature;
          next.expansionAmount = next.bearingInnerDiameter * alpha * deltaT;

          return next;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [state.isHeating]);

  const toggleProbe = () => {
    setState(prev => ({ ...prev, magneticProbeAttached: !prev.magneticProbeAttached }));
  };

  const toggleHeating = () => {
    if (state.isHeating) {
      setState(prev => ({ ...prev, isHeating: false }));
    } else {
      setState(prev => ({ ...prev, isHeating: true, heatingTime: 0 }));
      setTestPhase('Heating');
    }
  };

  const resetSim = () => {
    setState({
      bearingTemperature: 25,
      heaterTemperature: 25,
      ambientTemperature: 25,
      heatingTime: 0,
      isHeating: false,
      targetTemperature: 110,
      magneticProbeAttached: false,
      bearingInnerDiameter: 100.00,
      shaftOuterDiameter: 100.05,
      expansionAmount: 0,
      heaterPower: 3.6
    });
    setTestPhase('Setup');
  };

  // Check if expansion is enough for assembly
  const currentInnerDiameter = state.bearingInnerDiameter + state.expansionAmount;
  const clearance = currentInnerDiameter - state.shaftOuterDiameter;
  const isReadyToInstall = clearance > 0.02; // Need at least 0.02mm clearance

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 tracking-wider">高压电机轴承加热器规范使用实训</h1>
          <p className="text-sm text-slate-400 mt-1">High Voltage Motor Bearing Induction Heater Operation</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.isHeating ? 'bg-red-900/50 border-red-500 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
            <Power size={18} />
            加热器: {state.isHeating ? '运行中 (加热)' : '待机'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="温度与膨胀监控" highlight>
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/80 border border-indigo-500/30 rounded-lg relative overflow-hidden">
                <div className="flex justify-between items-center mb-1 relative z-10">
                  <div className="text-sm text-indigo-300 flex items-center gap-2"><Thermometer size={16}/> 轴承实时温度</div>
                  <div className={`font-mono text-3xl font-bold ${state.bearingTemperature > 120 ? 'text-red-500' : state.bearingTemperature >= state.targetTemperature ? 'text-green-400' : 'text-orange-400'}`}>
                    {state.bearingTemperature.toFixed(1)} <span className="text-lg">°C</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-2 mt-2 rounded-full overflow-hidden relative z-10">
                  <div className={`h-full transition-all ${state.bearingTemperature > 120 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(100, (state.bearingTemperature / 150) * 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1 relative z-10">
                  <span>目标: {state.targetTemperature}°C</span>
                  <span>极限: 120°C</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">热膨胀量 (ΔL)</div>
                  <div className="font-mono text-lg text-cyan-400">+{state.expansionAmount.toFixed(3)} mm</div>
                </div>
                <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">当前内径</div>
                  <div className="font-mono text-lg text-indigo-300">{currentInnerDiameter.toFixed(3)} mm</div>
                </div>
                <div className="col-span-2 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-slate-400">装配间隙 (轴径 {state.shaftOuterDiameter}mm)</div>
                    <div className={`font-mono text-lg font-bold ${clearance > 0.02 ? 'text-green-400' : 'text-red-400'}`}>
                      {clearance.toFixed(3)} mm
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="操作面板">
            <div className="space-y-4">
              
              <div className="p-3 bg-slate-800 rounded border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-300">步骤 1: 安装磁性温度探头</span>
                  <button 
                    onClick={toggleProbe}
                    disabled={state.isHeating}
                    className={`px-3 py-1 rounded text-xs font-bold ${state.magneticProbeAttached ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                  >
                    {state.magneticProbeAttached ? '已吸附' : '点击吸附'}
                  </button>
                </div>
                {!state.magneticProbeAttached && (
                  <p className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle size={12}/> 警告：未安装探头将导致设备无法闭环控温，极易导致轴承退火报废！</p>
                )}
              </div>

              <div className="p-3 bg-slate-800 rounded border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-300">步骤 2: 设置目标温度</span>
                  <span className="font-mono text-indigo-400">{state.targetTemperature}°C</span>
                </div>
                <input 
                  type="range" min="80" max="130" step="5" value={state.targetTemperature}
                  onChange={(e) => setState(prev => ({ ...prev, targetTemperature: Number(e.target.value) }))}
                  disabled={state.isHeating}
                  className="w-full accent-indigo-500"
                />
                <p className="text-xs text-slate-500 mt-1">规范要求：一般轴承加热温度为 90°C ~ 110°C，严禁超过 120°C。</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={toggleHeating} 
                  className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${state.isHeating ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                >
                  {state.isHeating ? <><Square size={18} /> 停止加热</> : <><Play size={18} /> 开始加热</>}
                </button>
                <button onClick={resetSim} className="px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">复位</button>
              </div>

              {/* Status Messages */}
              {testPhase === 'Ready' && (
                <div className="p-3 bg-green-900/30 border border-green-500/50 rounded text-green-400 flex items-start gap-2">
                  <CheckCircle size={18} className="mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <strong>加热完成！</strong>
                    <p className="text-xs mt-1">当前装配间隙充足，请立即佩戴隔热手套进行热套作业。注意保持轴承平正。</p>
                  </div>
                </div>
              )}

              {testPhase === 'Overheated' && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded text-red-400 flex items-start gap-2">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <strong>轴承过热报废！</strong>
                    <p className="text-xs mt-1">温度超过120°C，轴承材料发生退火，硬度降低，严禁继续使用。原因：未安装温度探头导致失控。</p>
                  </div>
                </div>
              )}

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
            <h3 className="font-bold text-indigo-400 mb-1">感应加热器 3D 视图</h3>
            <p className="text-slate-400">
              - 底部：加热器主机<br/>
              - 中间：穿过轴承内孔的加热杆 (Yoke)<br/>
              - 环形：待加热轴承 (随温度升高变红)<br/>
              - 红色探头：磁性温度传感器 (吸附在内圈)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
