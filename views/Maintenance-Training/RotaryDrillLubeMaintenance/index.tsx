import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/RotaryDrillLubeMaintenance/ThreeScene';
import { LubeState } from '../../../components/Maintenance-Training/RotaryDrillLubeMaintenance/three-types';
import { Droplet, Settings, Activity, AlertTriangle } from 'lucide-react';

export default function RotaryDrillLubeMaintenance() {
  const [state, setState] = useState<LubeState>({
    oilLevel: 30,
    isLubricating: false,
    rotationSpeed: 50
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isLubricating && state.oilLevel > 0) {
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          oilLevel: Math.max(0, prev.oilLevel - 1)
        }));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [state.isLubricating, state.oilLevel]);

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, rotationSpeed: parseInt(e.target.value) }));
  };

  const toggleLube = () => {
    setState(prev => ({ ...prev, isLubricating: !prev.isLubricating }));
  };

  const refillOil = () => {
    setState(prev => ({ ...prev, oilLevel: 100 }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-sky-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-sky-400 tracking-wider">牙轮钻机回转机构润滑保养教学</h1>
          <p className="text-sm text-slate-400 mt-1">Rotary Drill Rotation Mechanism Lubrication Maintenance</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.oilLevel < 20 ? 'bg-red-900/50 border-red-500 text-red-400' : 'bg-sky-900/50 border-sky-500 text-sky-400'}`}>
            <AlertTriangle size={18} />
            油位状态: {state.oilLevel < 20 ? '油量不足' : '正常'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel - Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="集中润滑控制 (Central Lube Control)" highlight>
            <div className="space-y-6">
              
              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-slate-400 flex items-center gap-2">
                    <Droplet size={16} /> 润滑油箱液位
                  </span>
                  <span className={`text-2xl font-mono font-bold ${state.oilLevel < 20 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {state.oilLevel}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${state.oilLevel < 20 ? 'bg-red-500' : 'bg-yellow-500'}`}
                    style={{ width: `${state.oilLevel}%` }}
                  ></div>
                </div>
                <button 
                  onClick={refillOil}
                  className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm transition-colors"
                >
                  补充润滑油 (Refill)
                </button>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2">
                    <Settings size={16} /> 回转机构转速
                  </span>
                  <span className="text-sky-400 font-mono">{state.rotationSpeed} RPM</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={state.rotationSpeed}
                  onChange={handleSpeedChange}
                  className="w-full accent-sky-500"
                />
              </div>

              <button 
                onClick={toggleLube}
                disabled={state.oilLevel === 0}
                className={`w-full py-4 rounded-lg font-bold tracking-wider transition-colors flex items-center justify-center gap-2 border ${
                  state.isLubricating 
                    ? 'bg-sky-900/50 border-sky-500 text-sky-400' 
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300'
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                <Activity size={18} />
                {state.isLubricating ? '停止润滑泵' : '启动自动润滑'}
              </button>

            </div>
          </SciFiCard>

          <SciFiCard title="保养规程 (Maintenance Protocol)">
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2"><span className="text-sky-500 font-bold">1.</span> 检查润滑油箱液位，低于20%时必须及时补充专用齿轮油。</li>
              <li className="flex gap-2"><span className="text-sky-500 font-bold">2.</span> 启动回转机构前，应先开启集中润滑系统，确保齿面形成油膜。</li>
              <li className="flex gap-2"><span className="text-sky-500 font-bold">3.</span> 观察润滑管路是否有泄漏，喷嘴是否堵塞。</li>
              <li className="flex gap-2"><span className="text-sky-500 font-bold">4.</span> 钻机作业期间，润滑系统应保持间歇或连续工作状态。</li>
            </ul>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-sky-400 mb-2">系统状态</h3>
            <div className="space-y-1 text-slate-300">
              <p>主齿轮状态: {state.rotationSpeed > 0 ? '运转中' : '停止'}</p>
              <p>润滑泵状态: {state.isLubricating ? '工作中' : '待机'}</p>
              <p>油膜形成率: {state.isLubricating ? '良好 (95%)' : '下降中'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
