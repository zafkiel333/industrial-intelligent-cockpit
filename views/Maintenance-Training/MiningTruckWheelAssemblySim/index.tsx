import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/MiningTruckWheelAssemblySim/ThreeScene';
import { WheelState } from '../../../components/Maintenance-Training/MiningTruckWheelAssemblySim/three-types';
import { Truck, Wrench, CheckCircle, ArrowRight, Layers } from 'lucide-react';

export default function MiningTruckWheelAssemblySim() {
  const [state, setState] = useState<WheelState>({
    step: 0,
    isAnimating: false
  });

  const steps = [
    { id: 0, title: '爆炸视图 (Exploded View)', desc: '查看电动轮总成所有关键部件。' },
    { id: 1, title: '安装牵引电机', desc: '将交流变频牵引电机吊装至后桥壳内，紧固连接螺栓。' },
    { id: 2, title: '安装行星齿轮减速器', desc: '安装轮毂及双级行星齿轮减速机构，加注齿轮油。' },
    { id: 3, title: '安装轮辋总成', desc: '使用专用轮胎机械手将轮辋对准法兰，预紧螺母。' },
    { id: 4, title: '安装巨型轮胎', desc: '装配 59/80R63 巨型轮胎，按规定力矩交叉紧固所有轮胎螺母。' }
  ];

  const nextStep = () => {
    setState(prev => ({ ...prev, step: Math.min(4, prev.step + 1) }));
  };

  const prevStep = () => {
    setState(prev => ({ ...prev, step: Math.max(0, prev.step - 1) }));
  };

  const resetToExploded = () => {
    setState({ step: 0, isAnimating: false });
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 tracking-wider">露天矿卡车电动轮总成拆装实训</h1>
          <p className="text-sm text-slate-400 mt-1">Mining Haul Truck Electric Wheel Assembly Training</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-indigo-900/50 border border-indigo-500 text-indigo-300 rounded-lg flex items-center gap-2">
            <Truck size={18} />
            车型: 300吨级交流电传动矿卡
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel - Steps */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="装配工艺流程 (Assembly Process)" highlight>
            <div className="space-y-4 relative">
              
              {/* Vertical line connecting steps */}
              <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800 z-0"></div>

              {steps.map((s, idx) => {
                const isActive = state.step === idx;
                const isCompleted = state.step > idx;
                
                return (
                  <div 
                    key={idx} 
                    className={`relative z-10 flex gap-4 p-4 rounded-xl border transition-all duration-300 ${
                      isActive 
                        ? 'bg-indigo-900/40 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                        : isCompleted 
                          ? 'bg-slate-800/50 border-slate-700' 
                          : 'bg-slate-900/30 border-slate-800 opacity-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                      isActive ? 'bg-indigo-600 border-indigo-400 text-white' : 
                      isCompleted ? 'bg-green-600 border-green-500 text-white' : 
                      'bg-slate-800 border-slate-600 text-slate-500'
                    }`}>
                      {isCompleted ? <CheckCircle size={20} /> : idx}
                    </div>
                    <div>
                      <h3 className={`font-bold mb-1 ${isActive ? 'text-indigo-300' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                        {s.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button 
                onClick={prevStep}
                disabled={state.step === 0}
                className="py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg font-bold tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                上一步 (Prev)
              </button>
              <button 
                onClick={nextStep}
                disabled={state.step === 4}
                className="py-3 bg-indigo-700 hover:bg-indigo-600 border border-indigo-500 rounded-lg font-bold tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                下一步 (Next) <ArrowRight size={18} />
              </button>
            </div>
            
            <button 
              onClick={resetToExploded}
              className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 rounded-lg font-bold tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <Layers size={18} /> 恢复爆炸视图
            </button>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-indigo-950">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 right-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-4 rounded-lg text-xs w-64">
            <h3 className="font-bold text-indigo-400 mb-3 flex items-center gap-2"><Wrench size={16}/> 专用工装设备</h3>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-center justify-between">
                <span>100吨级桥式起重机</span>
                <span className={state.step === 1 ? 'text-green-400' : 'text-slate-600'}>使用中</span>
              </li>
              <li className="flex items-center justify-between">
                <span>轮胎机械手 (Tire Handler)</span>
                <span className={state.step === 4 ? 'text-green-400' : 'text-slate-600'}>使用中</span>
              </li>
              <li className="flex items-center justify-between">
                <span>液压扭矩扳手 (3500Nm)</span>
                <span className={state.step === 4 ? 'text-green-400' : 'text-slate-600'}>使用中</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
