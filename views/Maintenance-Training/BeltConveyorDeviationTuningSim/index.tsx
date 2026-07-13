import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/BeltConveyorDeviationTuningSim/ThreeScene';
import { ConveyorState } from '../../../components/Maintenance-Training/BeltConveyorDeviationTuningSim/three-types';
import { MoveHorizontal, Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[BeltConveyorDeviationTuningSim]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/BeltConveyorDeviationTuningSim';

export default function BeltConveyorDeviationTuningSim() {
  const [state, setState] = useState<ConveyorState>({
    deviation: 0,
    isAutoTuning: true,
    speed: 50
  });

  // Auto-tuning logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isAutoTuning && state.speed > 0 && Math.abs(state.deviation) > 0) {
      interval = setInterval(() => {
        setState(prev => {
          const correction = prev.deviation > 0 ? -5 : 5;
          const newDeviation = prev.deviation + correction;
          // Snap to 0 if close enough
          if (Math.abs(newDeviation) < 5) return { ...prev, deviation: 0 };
          return { ...prev, deviation: newDeviation };
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [state.isAutoTuning, state.speed, state.deviation]);

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, speed: parseInt(e.target.value) }));
  };

  const forceDeviation = (direction: 'left' | 'right') => {
    setState(prev => ({ 
      ...prev, 
      deviation: direction === 'left' ? -80 : 80 
    }));
  };

  const toggleAutoTuning = () => {
    setState(prev => ({ ...prev, isAutoTuning: !prev.isAutoTuning }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 tracking-wider">井下胶带输送机跑偏自动纠偏调试</h1>
          <p className="text-sm text-slate-400 mt-1">Underground Belt Conveyor Auto-Deviation Tuning</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${Math.abs(state.deviation) > 50 ? 'bg-red-900/50 border-red-500 text-red-400' : 'bg-green-900/50 border-green-500 text-green-400'}`}>
            {Math.abs(state.deviation) > 50 ? <AlertTriangle size={18} /> : <ShieldCheck size={18} />}
            跑偏状态: {Math.abs(state.deviation) > 50 ? '严重跑偏' : state.deviation === 0 ? '居中正常' : '轻微偏移'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="纠偏控制系统" highlight>
            <div className="space-y-6">
              
              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-slate-400 flex items-center gap-2">
                    <MoveHorizontal size={16} /> 实时偏移量
                  </span>
                  <span className={`text-2xl font-mono font-bold ${Math.abs(state.deviation) > 50 ? 'text-red-400' : 'text-indigo-400'}`}>
                    {state.deviation > 0 ? '+' : ''}{state.deviation} mm
                  </span>
                </div>
                
                {/* Deviation Bar */}
                <div className="relative w-full bg-slate-800 h-4 rounded-full overflow-hidden flex items-center">
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-500 z-10"></div>
                  <div 
                    className={`absolute h-full transition-all duration-300 ${Math.abs(state.deviation) > 50 ? 'bg-red-500' : 'bg-indigo-500'}`}
                    style={{ 
                      left: state.deviation < 0 ? `calc(50% - ${Math.abs(state.deviation)/2}%)` : '50%',
                      width: `${Math.abs(state.deviation)/2}%` 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>左偏 (Left)</span>
                  <span>居中 (Center)</span>
                  <span>右偏 (Right)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Activity size={16}/> 运行带速</span>
                  <span className="text-indigo-400 font-mono">{state.speed}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={state.speed}
                  onChange={handleSpeedChange}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => forceDeviation('left')}
                  className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm transition-colors text-slate-300"
                >
                  模拟左跑偏
                </button>
                <button 
                  onClick={() => forceDeviation('right')}
                  className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm transition-colors text-slate-300"
                >
                  模拟右跑偏
                </button>
              </div>

              <button 
                onClick={toggleAutoTuning}
                className={`w-full py-4 rounded-lg font-bold tracking-wider transition-colors flex items-center justify-center gap-2 border ${
                  state.isAutoTuning 
                    ? 'bg-indigo-900/50 border-indigo-500 text-indigo-400' 
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300'
                }`}
              >
                <Settings size={18} className={state.isAutoTuning ? 'animate-spin-slow' : ''} />
                {state.isAutoTuning ? '自动纠偏已开启' : '开启自动纠偏'}
              </button>

            </div>
          </SciFiCard>

          <SciFiCard title="系统原理与规范">
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2"><span className="text-indigo-500 font-bold">1.</span> <strong className="text-slate-200">检测原理：</strong>两侧防跑偏开关（激光模拟）实时监测胶带边缘位置。</li>
              <li className="flex gap-2"><span className="text-indigo-500 font-bold">2.</span> <strong className="text-slate-200">纠偏动作：</strong>当发生跑偏时，自动纠偏托辊组会发生偏转。利用托辊与胶带间的摩擦力产生横向推力，迫使胶带复位。</li>
              <li className="flex gap-2"><span className="text-indigo-500 font-bold">3.</span> <strong className="text-slate-200">安全保护：</strong>若跑偏量超过极限（如±80mm）且持续一定时间，系统将触发紧急停机，防止撕带事故。</li>
            </ul>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>

          <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-indigo-400 mb-2">3D 监控视图</h3>
            <div className="space-y-1 text-slate-300">
              <p>纠偏托辊: {state.isAutoTuning && Math.abs(state.deviation) > 10 ? <span className="text-indigo-400">动作中 (倾斜)</span> : '待机 (水平)'}</p>
              <p>限位激光: {Math.abs(state.deviation) > 50 ? <span className="text-red-400 animate-pulse">触发报警</span> : '正常监控'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
