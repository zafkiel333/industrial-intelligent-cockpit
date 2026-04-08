import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/SubmersiblePumpMotorDryingSim/ThreeScene';
import { DryingState } from '../../../components/Maintenance-Training/SubmersiblePumpMotorDryingSim/three-types';
import { Thermometer, Droplets, Flame, CheckCircle } from 'lucide-react';

export default function SubmersiblePumpMotorDryingSim() {
  const [state, setState] = useState<DryingState>({
    temperature: 20,
    moisture: 100,
    isHeating: false,
    targetTemp: 80
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isHeating) {
      interval = setInterval(() => {
        setState(prev => {
          // Temperature logic
          let newTemp = prev.temperature;
          if (prev.temperature < prev.targetTemp) {
            newTemp += 2;
          } else if (prev.temperature > prev.targetTemp) {
            newTemp -= 1;
          }

          // Moisture logic (dries faster at higher temps)
          let newMoisture = prev.moisture;
          if (newTemp > 50 && newMoisture > 0) {
            const dryingRate = (newTemp - 40) * 0.02;
            newMoisture = Math.max(0, prev.moisture - dryingRate);
          }

          return {
            ...prev,
            temperature: newTemp,
            moisture: newMoisture
          };
        });
      }, 500);
    } else {
      // Cooling down
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          temperature: Math.max(20, prev.temperature - 1)
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isHeating, state.targetTemp]);

  const toggleHeating = () => {
    setState(prev => ({ ...prev, isHeating: !prev.isHeating }));
  };

  const handleTargetTempChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, targetTemp: parseInt(e.target.value) }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-orange-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-orange-400 tracking-wider">矿用隔爆型潜水泵电机烘干实操</h1>
          <p className="text-sm text-slate-400 mt-1">Explosion-Proof Submersible Pump Motor Drying Simulation</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.moisture === 0 ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-orange-900/50 border-orange-500 text-orange-400'}`}>
            {state.moisture === 0 ? <CheckCircle size={18} /> : <Droplets size={18} />}
            绝缘状态: {state.moisture === 0 ? '干燥合格' : '受潮 (需烘干)'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="烘干控制柜" highlight>
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg text-center">
                  <div className="text-sm text-slate-400 mb-1 flex items-center justify-center gap-1"><Thermometer size={14}/> 实时温度</div>
                  <div className={`text-3xl font-mono font-bold ${state.temperature > 100 ? 'text-red-400' : 'text-orange-400'}`}>
                    {Math.round(state.temperature)}°C
                  </div>
                </div>
                <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg text-center">
                  <div className="text-sm text-slate-400 mb-1 flex items-center justify-center gap-1"><Droplets size={14}/> 相对湿度估算</div>
                  <div className="text-3xl font-mono font-bold text-sky-400">
                    {Math.round(state.moisture)}%
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">目标温度设定</span>
                  <span className="text-orange-400 font-mono">{state.targetTemp}°C</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="120" 
                  value={state.targetTemp}
                  onChange={handleTargetTempChange}
                  className="w-full accent-orange-500"
                />
                <div className="text-xs text-slate-500 mt-1">建议烘干温度: 70°C - 85°C</div>
              </div>

              <button 
                onClick={toggleHeating}
                className={`w-full py-4 rounded-lg font-bold tracking-wider transition-colors flex items-center justify-center gap-2 border ${
                  state.isHeating 
                    ? 'bg-orange-900/50 border-orange-500 text-orange-400' 
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300'
                }`}
              >
                <Flame size={18} className={state.isHeating ? 'animate-pulse' : ''} />
                {state.isHeating ? '停止加热' : '启动加热'}
              </button>

            </div>
          </SciFiCard>

          <SciFiCard title="烘干工艺规范">
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2"><span className="text-orange-500 font-bold">1.</span> 潜水泵大修或绝缘电阻低于规定值时，必须进行干燥处理。</li>
              <li className="flex gap-2"><span className="text-orange-500 font-bold">2.</span> 升温应缓慢，温升率不宜超过 20°C/h，防止绝缘开裂。</li>
              <li className="flex gap-2"><span className="text-orange-500 font-bold">3.</span> 最高烘干温度一般控制在 70°C~85°C 之间，严禁超过 100°C 以免损坏绝缘。</li>
              <li className="flex gap-2"><span className="text-orange-500 font-bold">4.</span> 烘干过程中需定时测量绝缘电阻，当绝缘电阻稳定在合格值以上且保持 3 小时不变时，方可停止烘干。</li>
            </ul>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-orange-400 mb-2">环境监测</h3>
            <div className="space-y-1 text-slate-300">
              <p>加热器: {state.isHeating ? '运行中' : '关闭'}</p>
              <p>水分蒸发: {state.moisture > 0 && state.temperature > 40 ? '进行中' : '无'}</p>
              {state.temperature > 95 && <p className="text-red-400 font-bold animate-pulse">警告: 温度过高，可能损坏绝缘！</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
