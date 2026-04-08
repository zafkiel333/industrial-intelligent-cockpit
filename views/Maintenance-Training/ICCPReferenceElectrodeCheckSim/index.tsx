import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/ICCPReferenceElectrodeCheckSim/ThreeScene';
import { ICCPState } from '../../../components/Maintenance-Training/ICCPReferenceElectrodeCheckSim/three-types';
import { Zap, Power, Wrench, AlertTriangle, ShieldCheck, Droplet } from 'lucide-react';

export default function ICCPReferenceElectrodeCheckSim() {
  const [state, setState] = useState<ICCPState>({
    hullPotential: -820, // Target ~ -800 to -850 mV
    anodeCurrent: 25, // Amps
    referenceElectrodeFault: false,
    powerSupply: true,
    waterConductivity: 1.0 // 1.0 = Seawater, lower = fresh/brackish
  });

  // ICCP Control Loop Simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.powerSupply) {
      interval = setInterval(() => {
        setState(prev => {
          let newPotential = prev.hullPotential;
          let newCurrent = prev.anodeCurrent;

          // The controller tries to maintain -820mV based on what the sensor reads
          // If sensor is faulty (dirty), it reads less negative than reality (e.g., reads -600mV while actual is -820mV)
          // Controller sees -600mV, thinks "under-protected", and cranks up the current.
          // This causes actual hull potential to become OVER-protected (e.g., -1000mV), causing paint damage.

          let sensorReading = newPotential;
          if (prev.referenceElectrodeFault) {
             sensorReading += 200; // Sensor is fouled, reading is artificially high (less negative)
          }

          // Controller logic (simplified PID)
          const target = -820;
          const error = target - sensorReading; // e.g., -820 - (-600) = -220
          
          // Adjust current based on error
          if (error < -10) {
             newCurrent = Math.min(100, newCurrent + 2); // Increase current
          } else if (error > 10) {
             newCurrent = Math.max(0, newCurrent - 2); // Decrease current
          }

          // Physics: Actual hull potential responds to current and water conductivity
          // More current = more negative potential
          // Lower conductivity (fresh water) requires more voltage/current to achieve same potential
          const naturalPotential = -600; // Unprotected steel in seawater
          const protectionEffect = newCurrent * 10 * prev.waterConductivity;
          
          // Move actual potential towards the physics-driven value
          const physicsTarget = naturalPotential - protectionEffect;
          newPotential += (physicsTarget - newPotential) * 0.1;

          return { 
            ...prev, 
            hullPotential: newPotential,
            anodeCurrent: newCurrent
          };
        });
      }, 500);
    } else {
      // Power off: potential drifts back to natural state (-600mV)
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          anodeCurrent: 0,
          hullPotential: Math.min(-600, prev.hullPotential + 10)
        }));
      }, 500);
    }

    return () => clearInterval(interval);
  }, [state.powerSupply, state.referenceElectrodeFault, state.waterConductivity]);

  const togglePower = () => {
    setState(prev => ({ ...prev, powerSupply: !prev.powerSupply }));
  };

  const cleanElectrode = () => {
    setState(prev => ({ ...prev, referenceElectrodeFault: false }));
  };

  const foulElectrode = () => {
    setState(prev => ({ ...prev, referenceElectrodeFault: true }));
  };

  const changeWater = (type: 'sea' | 'fresh') => {
    setState(prev => ({ ...prev, waterConductivity: type === 'sea' ? 1.0 : 0.3 }));
  };

  // Determine system status
  let statusColor = 'text-green-400';
  let statusText = '正常保护 (NORMAL)';
  let statusIcon = <ShieldCheck size={18} />;

  if (!state.powerSupply) {
    statusColor = 'text-slate-400';
    statusText = '系统停机 (OFF)';
    statusIcon = <Power size={18} />;
  } else if (state.hullPotential > -750) {
    statusColor = 'text-red-400';
    statusText = '欠保护 - 腐蚀风险 (UNDER-PROTECTED)';
    statusIcon = <AlertTriangle size={18} />;
  } else if (state.hullPotential < -950) {
    statusColor = 'text-orange-400';
    statusText = '过保护 - 涂层剥落风险 (OVER-PROTECTED)';
    statusIcon = <AlertTriangle size={18} />;
  }

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-cyan-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">船体外加电流阴极保护参比电极检查</h1>
          <p className="text-sm text-slate-400 mt-1">ICCP Reference Electrode Inspection & Troubleshooting</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 bg-slate-900/50 ${statusColor} border-current`}>
            {statusIcon}
            船体电位状态: {statusText}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="ICCP 控制面板" highlight>
            <div className="space-y-6">
              
              <div className="flex justify-between items-center p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <span className="text-sm text-slate-400">系统电源 (System Power)</span>
                <button 
                  onClick={togglePower}
                  className={`px-4 py-2 rounded font-bold flex items-center gap-2 transition-colors ${state.powerSupply ? 'bg-green-900/50 text-green-400 border border-green-500' : 'bg-red-900/50 text-red-400 border border-red-500'}`}
                >
                  <Power size={16} /> {state.powerSupply ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">实际船体电位 (Hull Potential)</span>
                  <span className={`font-mono text-xl font-bold ${state.hullPotential > -750 ? 'text-red-400' : state.hullPotential < -950 ? 'text-orange-400' : 'text-green-400'}`}>
                    {state.hullPotential.toFixed(0)} mV
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">目标: -820 mV</p>
                </div>
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">输出电流 (Anode Current)</span>
                  <span className="font-mono text-xl font-bold text-cyan-400">
                    {state.anodeCurrent.toFixed(1)} A
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">最大: 100 A</p>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">水域环境 (Water Environment)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => changeWater('sea')}
                    className={`py-2 rounded border flex items-center justify-center gap-2 text-sm transition-colors ${state.waterConductivity === 1.0 ? 'bg-blue-900/50 border-blue-500 text-blue-400' : 'bg-slate-700 border-slate-600 text-slate-300'}`}
                  >
                    <Droplet size={14} /> 海水 (Seawater)
                  </button>
                  <button 
                    onClick={() => changeWater('fresh')}
                    className={`py-2 rounded border flex items-center justify-center gap-2 text-sm transition-colors ${state.waterConductivity < 1.0 ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400' : 'bg-slate-700 border-slate-600 text-slate-300'}`}
                  >
                    <Droplet size={14} /> 淡水 (Freshwater)
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">淡水导电率低，系统需输出更大电压/电流才能达到保护电位。</p>
              </div>

            </div>
          </SciFiCard>

          <SciFiCard title="参比电极检查与维护">
            <div className="space-y-4">
              <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-300">
                <p className="mb-2"><strong>故障现象：</strong>控制柜显示输出电流异常增大，但船体电位读数偏低（不够负）。</p>
                <p><strong>原因分析：</strong>参比电极表面被海生物附着或油污覆盖，导致测量失准。系统误认为欠保护，从而盲目增大电流，造成实际船体<strong>过保护</strong>，可能引起油漆起泡剥落。</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={cleanElectrode}
                  disabled={!state.referenceElectrodeFault}
                  className="py-3 bg-green-900/50 hover:bg-green-800/50 disabled:opacity-50 border border-green-500 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors text-green-400"
                >
                  <Wrench size={20} />
                  <span className="font-bold text-sm">清洗参比电极</span>
                </button>
                
                <button 
                  onClick={foulElectrode}
                  disabled={state.referenceElectrodeFault}
                  className="py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-600 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors text-slate-300"
                >
                  <AlertTriangle size={20} />
                  <span className="font-bold text-sm">模拟电极污损</span>
                </button>
              </div>

              {state.referenceElectrodeFault && state.powerSupply && (
                <div className="p-3 bg-orange-900/30 border border-orange-500/50 rounded-lg text-sm text-orange-200">
                  <strong>警告：</strong>参比电极被污损，测量信号失真！控制系统正在输出过大电流，船体面临过保护风险。请安排潜水员清理电极表面。
                </div>
              )}
            </div>
          </SciFiCard>

        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-cyan-400 mb-1">船底 ICCP 组件透视</h3>
            <p className="text-slate-400">
              左侧大矩形：辅助阳极 (释放保护电流，蓝色粒子)<br/>
              右侧小圆形：参比电极 (测量船体电位)<br/>
              当参比电极变脏(棕色)时，系统会错误地增大电流。<br/>
              船体出现红色斑点表示欠保护(腐蚀)。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
