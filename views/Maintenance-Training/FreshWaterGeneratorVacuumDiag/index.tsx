import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/FreshWaterGeneratorVacuumDiag/ThreeScene';
import { FWGState } from '../../../components/Maintenance-Training/FreshWaterGeneratorVacuumDiag/three-types';
import { Thermometer, Gauge, Wind, AlertTriangle, Droplets } from 'lucide-react';

export default function FreshWaterGeneratorVacuumDiag() {
  const [state, setState] = useState<FWGState>({
    vacuumLevel: 0,
    ejectorPumpRunning: false,
    coolingWaterTemp: 30,
    heatingWaterTemp: 80,
    leakActive: false
  });

  // Simulation logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    interval = setInterval(() => {
      setState(prev => {
        let newVacuum = prev.vacuumLevel;

        if (prev.ejectorPumpRunning) {
          // Base vacuum building
          let targetVacuum = 95;

          // Cooling water temp affects vacuum (higher temp = worse vacuum)
          if (prev.coolingWaterTemp > 35) {
            targetVacuum -= (prev.coolingWaterTemp - 35) * 2;
          }

          // Leak drastically reduces vacuum
          if (prev.leakActive) {
            targetVacuum = 40;
          }

          // Move towards target
          if (newVacuum < targetVacuum) newVacuum += 2;
          if (newVacuum > targetVacuum) newVacuum -= 2;
        } else {
          // Lose vacuum if pump is off
          if (newVacuum > 0) newVacuum -= 5;
        }

        return { ...prev, vacuumLevel: Math.max(0, Math.min(100, newVacuum)) };
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const togglePump = () => {
    setState(prev => ({ ...prev, ejectorPumpRunning: !prev.ejectorPumpRunning }));
  };

  const toggleLeak = () => {
    setState(prev => ({ ...prev, leakActive: !prev.leakActive }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-teal-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-teal-400 tracking-wider">船用造水机真空度不足故障诊断</h1>
          <p className="text-sm text-slate-400 mt-1">Fresh Water Generator (FWG) Low Vacuum Troubleshooting</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={togglePump}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${state.ejectorPumpRunning ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
          >
            <Wind size={18} />
            {state.ejectorPumpRunning ? '喷射泵运行中' : '喷射泵已停止'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="运行参数监控" highlight>
            <div className="space-y-6">
              
              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Gauge size={16}/> 真空度 (Vacuum)</span>
                  <span className={`font-mono font-bold text-xl ${state.vacuumLevel < 85 ? 'text-red-400' : 'text-teal-400'}`}>
                    {state.vacuumLevel.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${state.vacuumLevel < 85 ? 'bg-red-500' : 'bg-teal-500'}`}
                    style={{ width: `${state.vacuumLevel}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">正常造水需维持在 90% 以上高真空度。</p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Droplets size={16} className="text-blue-400"/> 冷却海水温度</span>
                  <span className="text-blue-400 font-mono">{state.coolingWaterTemp}°C</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="50" 
                  value={state.coolingWaterTemp}
                  onChange={(e) => setState(prev => ({ ...prev, coolingWaterTemp: parseInt(e.target.value) }))}
                  className="w-full accent-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">温度过高会导致冷凝效果变差，破坏真空。</p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Thermometer size={16} className="text-red-400"/> 加热淡水温度</span>
                  <span className="text-red-400 font-mono">{state.heatingWaterTemp}°C</span>
                </div>
                <input 
                  type="range" 
                  min="60" 
                  max="90" 
                  value={state.heatingWaterTemp}
                  onChange={(e) => setState(prev => ({ ...prev, heatingWaterTemp: parseInt(e.target.value) }))}
                  className="w-full accent-red-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-700">
                <button 
                  onClick={toggleLeak}
                  className={`w-full py-3 rounded-lg border font-bold transition-colors flex items-center justify-center gap-2 ${state.leakActive ? 'bg-red-900/50 border-red-500 text-red-400' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'}`}
                >
                  <AlertTriangle size={18} />
                  {state.leakActive ? '解除系统漏气' : '模拟系统漏气故障'}
                </button>
              </div>

            </div>
          </SciFiCard>

          <SciFiCard title="真空度不足排查逻辑">
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2"><span className="text-teal-500 font-bold">1.</span> 检查喷射泵工作水压是否正常（通常需 &gt; 0.3 MPa）。</li>
              <li className="flex gap-2"><span className="text-teal-500 font-bold">2.</span> 检查冷却海水温度是否过高，或冷凝器是否脏污导致换热不良。</li>
              <li className="flex gap-2"><span className="text-teal-500 font-bold">3.</span> 检查加热水温度是否过高，导致蒸发量过大超出冷凝能力。</li>
              <li className="flex gap-2"><span className="text-teal-500 font-bold">4.</span> 检查系统密封性：壳体法兰、视孔玻璃、真空破坏阀是否漏气。</li>
              <li className="flex gap-2"><span className="text-teal-500 font-bold">5.</span> 检查喷射器喷嘴是否磨损或堵塞。</li>
            </ul>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-teal-400 mb-1">造水机内部透视</h3>
            <p className="text-slate-400">
              底部红色为加热蒸发器，顶部蓝色为冷凝器。
              <br/>白色粒子代表产生的二次蒸汽。红色粒子代表漏入的空气。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
