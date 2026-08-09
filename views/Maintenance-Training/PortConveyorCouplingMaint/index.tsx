import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/PortConveyorCouplingMaint/ThreeScene';
import { CouplingState } from '../../../components/Maintenance-Training/PortConveyorCouplingMaint/three-types';
import { Droplet, Thermometer, Activity, Power, Wrench, AlertTriangle } from 'lucide-react';

export default function PortConveyorCouplingMaint() {
  const [state, setState] = useState<CouplingState>({
    oilLevel: 60, // Normal is 80%
    oilTemp: 45,
    inputSpeed: 0,
    outputSpeed: 0,
    isRunning: false,
    isLeaking: false,
    plugRemoved: false
  });

  // Simulation Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.isRunning) {
      interval = setInterval(() => {
        setState(prev => {
          let newTemp = prev.oilTemp;
          let newOutSpeed = prev.outputSpeed;
          let newLevel = prev.oilLevel;
          let leaking = prev.isLeaking;

          // Input speed ramps up quickly
          const newInSpeed = 1450; 

          // Output speed depends on oil level (slip)
          // Normal slip is ~3-5%. Low oil = high slip.
          const maxEfficiency = prev.oilLevel / 80; // Assuming 80% is optimal fill
          const targetOutSpeed = newInSpeed * Math.min(0.97, maxEfficiency);
          
          // Ramp up output speed
          if (newOutSpeed < targetOutSpeed) {
            newOutSpeed += 50;
          }

          // Temperature increases based on slip (inefficiency generates heat)
          const slip = (newInSpeed - newOutSpeed) / newInSpeed;
          if (slip > 0.1) {
             newTemp += 0.5; // Heat up faster if slipping a lot
          } else {
             newTemp += 0.1; // Normal operating heat
          }

          // Simulate leak if plug removed while running or if temp gets too high (fusible plug melts)
          if (prev.plugRemoved || newTemp > 110) {
             leaking = true;
             newLevel = Math.max(0, prev.oilLevel - 1); // Lose oil
          }

          // Cool down if not running (handled in else block, but here we just cap it)
          newTemp = Math.min(150, newTemp);

          return { 
            ...prev, 
            inputSpeed: newInSpeed,
            outputSpeed: newOutSpeed,
            oilTemp: newTemp,
            oilLevel: newLevel,
            isLeaking: leaking,
            plugRemoved: prev.plugRemoved || newTemp > 110 // Melt plug if too hot
          };
        });
      }, 200);
    } else {
      // Cool down and spin down when stopped
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          inputSpeed: Math.max(0, prev.inputSpeed - 100),
          outputSpeed: Math.max(0, prev.outputSpeed - 50),
          oilTemp: Math.max(25, prev.oilTemp - 0.5),
          isLeaking: prev.plugRemoved && prev.oilLevel > 0 // Still leak if plug out and has oil
        }));
      }, 500);
    }

    return () => clearInterval(interval);
  }, [state.isRunning]);

  const togglePower = () => {
    setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const addOil = () => {
    if (state.isRunning) {
      alert("请先停机再加注工作液！");
      return;
    }
    if (state.plugRemoved) {
      alert("注油塞已拆除，无法加注！");
      return;
    }
    setState(prev => ({ ...prev, oilLevel: Math.min(100, prev.oilLevel + 10) }));
  };

  const togglePlug = () => {
    if (state.isRunning) {
      alert("运行中严禁拆卸易熔塞！");
      return;
    }
    setState(prev => ({ ...prev, plugRemoved: !prev.plugRemoved }));
  };

  const replacePlug = () => {
     if (state.isRunning) return;
     setState(prev => ({ ...prev, plugRemoved: false, isLeaking: false }));
  }

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-cyan-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">港口带式输送机液力偶合器维护实训</h1>
          <p className="text-sm text-slate-400 mt-1">Port Conveyor Fluid Coupling Maintenance & Troubleshooting</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.oilTemp > 90 ? 'bg-red-900/50 border-red-500 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
            <Thermometer size={18} />
            油温状态: {state.oilTemp > 90 ? '过热警告 (OVERHEAT)' : '正常 (NORMAL)'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="运行状态监控" highlight>
            <div className="space-y-6">
              
              <div className="flex justify-between items-center p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <span className="text-sm text-slate-400">主电机电源 (Main Motor)</span>
                <button 
                  onClick={togglePower}
                  className={`px-4 py-2 rounded font-bold flex items-center gap-2 transition-colors ${state.isRunning ? 'bg-green-900/50 text-green-400 border border-green-500' : 'bg-red-900/50 text-red-400 border border-red-500'}`}
                >
                  <Power size={16} /> {state.isRunning ? 'RUNNING' : 'STOPPED'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">输入转速 (Input RPM)</span>
                  <span className="font-mono text-xl text-cyan-400">{state.inputSpeed.toFixed(0)}</span>
                </div>
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">输出转速 (Output RPM)</span>
                  <span className={`font-mono text-xl ${state.outputSpeed < state.inputSpeed * 0.8 && state.isRunning ? 'text-orange-400' : 'text-cyan-400'}`}>
                    {state.outputSpeed.toFixed(0)}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-400 flex items-center gap-2"><Droplet size={14}/> 充液量 (Oil Level)</span>
                    <span className={`font-mono ${state.oilLevel < 70 ? 'text-orange-400' : 'text-cyan-400'}`}>{state.oilLevel.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${state.oilLevel < 70 ? 'bg-orange-500' : 'bg-cyan-500'}`} style={{ width: `${state.oilLevel}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">标准充液量: 80%</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-400 flex items-center gap-2"><Thermometer size={14}/> 工作油温 (Oil Temp)</span>
                    <span className={`font-mono ${state.oilTemp > 90 ? 'text-red-400' : 'text-cyan-400'}`}>{state.oilTemp.toFixed(1)}°C</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${state.oilTemp > 90 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${Math.min(100, (state.oilTemp / 150) * 100)}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">易熔塞熔化温度: 110°C</p>
                </div>
              </div>

            </div>
          </SciFiCard>

          <SciFiCard title="维护操作">
            <div className="space-y-4">
              <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-300">
                <p className="mb-2"><strong>故障现象：</strong>皮带机启动困难，电机转速正常但减速机转速低（滑差大），偶合器发热严重。</p>
                <p><strong>排查：</strong>检查充液量是否不足。若油温过高导致易熔塞熔化，需停机更换易熔塞并重新注油。</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={addOil}
                  disabled={state.isRunning || state.plugRemoved}
                  className="py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-600 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors text-cyan-400"
                >
                  <Droplet size={20} />
                  <span className="font-bold text-sm">加注工作液</span>
                </button>
                
                {state.plugRemoved ? (
                  <button 
                    onClick={replacePlug}
                    disabled={state.isRunning}
                    className="py-3 bg-green-900/50 hover:bg-green-800/50 disabled:opacity-50 border border-green-500 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors text-green-400"
                  >
                    <Wrench size={20} />
                    <span className="font-bold text-sm">安装新易熔塞</span>
                  </button>
                ) : (
                  <button 
                    onClick={togglePlug}
                    disabled={state.isRunning}
                    className="py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-600 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors text-slate-300"
                  >
                    <Wrench size={20} />
                    <span className="font-bold text-sm">拆卸易熔塞</span>
                  </button>
                )}
              </div>

              {state.isLeaking && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-sm text-red-200 flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <span><strong>警告：</strong>工作液泄漏！易熔塞已熔化或被拆除。请立即停机处理。</span>
                </div>
              )}
            </div>
          </SciFiCard>

        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-cyan-400 mb-1">液力偶合器内部透视</h3>
            <p className="text-slate-400">
              左侧(蓝)为电机输入，右侧(灰)为减速机负载。<br/>
              中间透明壳体内：红色为泵轮(主动)，绿色为涡轮(从动)。<br/>
              橙色液体为工作液。油量不足会导致转速差增大并急剧发热。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
