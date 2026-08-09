import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/PortConveyorFluidCouplingMaint/ThreeScene';
import { FluidCouplingState } from '../../../components/Maintenance-Training/PortConveyorFluidCouplingMaint/three-types';
import { Droplet, Thermometer, Power, AlertTriangle, ShieldAlert } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[PortConveyorFluidCouplingMaint]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/PortConveyorFluidCouplingMaint';

export default function PortConveyorFluidCouplingMaint() {
  const [state, setState] = useState<FluidCouplingState>({
    oilLevel: 80,
    temperature: 40,
    motorSpeed: 0,
    isRunning: false,
    fusiblePlugBlown: false
  });

  // Simulation logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isRunning && !state.fusiblePlugBlown) {
      interval = setInterval(() => {
        setState(prev => {
          let newTemp = prev.temperature;
          
          // Heat generation based on slip (low oil = high slip = high heat)
          if (prev.oilLevel < 60) {
            newTemp += (60 - prev.oilLevel) * 0.05;
          } else {
            // Normal cooling
            if (newTemp > 40) newTemp -= 0.5;
          }

          // Fusible plug blows at 110°C
          let blown = false;
          if (newTemp >= 110) {
            blown = true;
            newTemp = 110; // Max out
          }

          return { ...prev, temperature: newTemp, fusiblePlugBlown: blown };
        });
      }, 500);
    } else if (!state.isRunning && state.temperature > 30) {
      // Cooling down when stopped
      interval = setInterval(() => {
        setState(prev => ({ ...prev, temperature: prev.temperature - 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isRunning, state.fusiblePlugBlown, state.oilLevel]);

  const toggleMotor = () => {
    setState(prev => ({ 
      ...prev, 
      isRunning: !prev.isRunning,
      motorSpeed: !prev.isRunning ? 1450 : 0 
    }));
  };

  const adjustOil = (amount: number) => {
    setState(prev => ({
      ...prev,
      oilLevel: Math.max(0, Math.min(100, prev.oilLevel + amount))
    }));
  };

  const replacePlug = () => {
    setState(prev => ({
      ...prev,
      fusiblePlugBlown: false,
      temperature: 40,
      oilLevel: 80 // Refill oil after replacing plug
    }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-blue-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-400 tracking-wider">港口带式输送机液力偶合器维护实训</h1>
          <p className="text-sm text-slate-400 mt-1">Port Belt Conveyor Fluid Coupling Maintenance</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={toggleMotor}
            disabled={state.fusiblePlugBlown}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${state.isRunning ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-slate-800 border-slate-600 text-slate-400'} disabled:opacity-30`}
          >
            <Power size={18} />
            {state.isRunning ? '电机运行中 (1450 RPM)' : '电机已停止'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="偶合器状态监控" highlight>
            <div className="space-y-6">
              
              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Droplet size={16}/> 充液量 (Oil Fill Level)</span>
                  <span className={`font-mono font-bold text-xl ${state.oilLevel < 60 ? 'text-yellow-400' : 'text-blue-400'}`}>
                    {state.oilLevel}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div 
                    className={`h-full transition-all duration-300 ${state.oilLevel < 60 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                    style={{ width: `${state.oilLevel}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => adjustOil(-10)} disabled={state.isRunning} className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm transition-colors disabled:opacity-30">排油 (-10%)</button>
                  <button onClick={() => adjustOil(10)} disabled={state.isRunning} className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm transition-colors disabled:opacity-30">注油 (+10%)</button>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">注：必须在停机状态下调整充液量</p>
              </div>

              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Thermometer size={16}/> 工作油温 (Temperature)</span>
                  <span className={`font-mono font-bold text-xl ${state.temperature > 90 ? 'text-red-400' : 'text-green-400'}`}>
                    {state.temperature.toFixed(1)}°C
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${state.temperature > 90 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${(state.temperature / 150) * 100}%` }}
                  ></div>
                </div>
              </div>

              {state.fusiblePlugBlown && (
                <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 flex flex-col gap-3">
                  <div className="flex items-start gap-2">
                    <ShieldAlert size={20} className="shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <strong className="block mb-1">易熔塞熔化报警！</strong>
                      <p className="text-sm">由于充液量不足导致滑差过大，油温急剧升高超过110°C，易熔合金熔化，工作油喷出，切断动力传递以保护电机。</p>
                    </div>
                  </div>
                  <button onClick={replacePlug} className="py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors">
                    更换易熔塞并重新注油
                  </button>
                </div>
              )}

              {!state.fusiblePlugBlown && state.oilLevel < 60 && state.isRunning && (
                <div className="p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg text-yellow-400 text-sm flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <p><strong>警告：</strong>充液量过低！滑差增大，传递扭矩下降，油温正在快速上升！</p>
                </div>
              )}

            </div>
          </SciFiCard>

          <SciFiCard title="维护规范">
            <ul className="space-y-2 text-sm text-slate-300">
              <li>1. 正常充液量一般为总容积的 40% ~ 80%，严禁充满。</li>
              <li>2. 易熔塞是过载保护装置，严禁用实心螺塞或其它材料替代。</li>
              <li>3. 频繁启动或长时间超载会导致油温过高，易熔塞熔化。</li>
              <li>4. 更换易熔塞时，必须查明过载原因（如皮带卡死、超载），并清理偶合器外壳上的油污。</li>
            </ul>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>

          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-blue-400 mb-1">液力偶合器透视图</h3>
            <p className="text-slate-400">
              左侧为电机(泵轮)，右侧为减速箱(涡轮)。
              <br/>内部黄色粒子代表传动介质(液压油)。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
