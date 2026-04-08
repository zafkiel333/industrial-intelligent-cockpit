import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/ExcitationBrushReplacementOps/ThreeScene';
import { BrushState } from '../../../components/Maintenance-Training/ExcitationBrushReplacementOps/three-types';
import { Zap, ShieldAlert, CheckCircle2, ArrowRight, Activity } from 'lucide-react';

export default function ExcitationBrushReplacementOps() {
  const [state, setState] = useState<BrushState>({
    step: 0,
    isRotating: true,
    sparkIntensity: 1.5 // Initial fault state
  });

  const steps = [
    { title: "故障确认", desc: "发现滑环处有异常火花，碳刷磨损严重，需在线更换。" },
    { title: "安全防护", desc: "穿戴绝缘手套、绝缘鞋，站在绝缘垫上，使用绝缘工具。" },
    { title: "拔出旧碳刷", desc: "单手操作，平稳提起压簧，迅速拔出磨损的旧碳刷。" },
    { title: "装入新碳刷", desc: "将打磨好接触面的新碳刷顺着刷握平滑装入。" },
    { title: "检查压簧", desc: "放下压簧，检查压力是否适中，碳刷在刷握内应能自由滑动，无卡涩。" }
  ];

  const nextStep = () => {
    setState(prev => {
      const next = prev.step + 1;
      if (next >= steps.length) return { ...prev, step: 0, sparkIntensity: 1.5 }; // Reset
      
      // If step is 4 (final), sparks are gone
      return { 
        ...prev, 
        step: next,
        sparkIntensity: next === 4 ? 0 : prev.sparkIntensity
      };
    });
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-cyan-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">励磁系统碳刷在线更换实操</h1>
          <p className="text-sm text-slate-400 mt-1">Excitation System Carbon Brush Online Replacement</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <Activity className="text-cyan-400" size={18} />
            <span className="text-sm text-slate-400">转子电流:</span>
            <span className="font-mono text-lg text-cyan-300">1250 A</span>
          </div>
          <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <Zap className="text-yellow-400" size={18} />
            <span className="text-sm text-slate-400">励磁电压:</span>
            <span className="font-mono text-lg text-yellow-300">220 V</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel - Steps */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="标准作业流程 (SOP)" highlight>
            <div className="space-y-4 mb-6">
              {steps.map((s, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    state.step === idx 
                      ? 'bg-cyan-900/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                      : state.step > idx 
                        ? 'bg-green-900/20 border-green-800/50 opacity-70' 
                        : 'bg-slate-900/50 border-slate-800 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {state.step > idx ? (
                      <CheckCircle2 className="text-green-500" size={20} />
                    ) : (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${state.step === idx ? 'bg-cyan-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
                        {idx + 1}
                      </div>
                    )}
                    <h3 className={`font-bold ${state.step === idx ? 'text-cyan-300' : state.step > idx ? 'text-green-400' : 'text-slate-400'}`}>
                      {s.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400 pl-9">{s.desc}</p>
                </div>
              ))}
            </div>

            <button 
              onClick={nextStep}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              {state.step === steps.length - 1 ? '完成并重置' : '执行下一步'}
              <ArrowRight size={18} />
            </button>
          </SciFiCard>

          <SciFiCard title="安全警告" className="border-red-900/50">
            <div className="flex gap-4 items-start text-red-400">
              <ShieldAlert size={24} className="shrink-0 mt-1" />
              <div className="text-sm space-y-2">
                <p className="font-bold">高危操作提示：</p>
                <ul className="list-disc list-inside space-y-1 text-red-300/80">
                  <li>在线更换时，发电机仍在运行，带有高压电。</li>
                  <li>严禁双手同时触碰不同极性的滑环或刷握。</li>
                  <li>必须单手操作，另一只手应放在背后或口袋中。</li>
                  <li>同一刷架上一次只能更换1-2块碳刷，防止励磁电流分配不均。</li>
                </ul>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          {/* Overlay Status */}
          <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 p-4 rounded-lg flex flex-col gap-2">
            <div className="flex items-center justify-between gap-6">
              <span className="text-sm text-slate-400">滑环状态</span>
              <span className="text-sm font-bold text-green-400">运转中 (3000 RPM)</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-sm text-slate-400">接触火花</span>
              <span className={`text-sm font-bold ${state.sparkIntensity > 0 ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                {state.sparkIntensity > 0 ? '异常 (3级)' : '正常 (无火花)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
