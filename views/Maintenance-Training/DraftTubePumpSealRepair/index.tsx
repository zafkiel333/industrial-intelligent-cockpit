import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/DraftTubePumpSealRepair/ThreeScene';
import { PumpState } from '../../../components/Maintenance-Training/DraftTubePumpSealRepair/three-types';
import { Settings, Layers, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';

export default function DraftTubePumpSealRepair() {
  const [state, setState] = useState<PumpState>({
    step: 0,
    isExploded: false
  });

  const steps = [
    { title: "准备工作", desc: "切断电机电源，挂牌上锁。关闭进出口阀门，排空泵内积水。" },
    { title: "拆卸联轴器", desc: "拆除电机与水泵之间的联轴器柱销，将电机向后移开，腾出检修空间。" },
    { title: "拆卸泵盖", desc: "松开泵盖与泵体的连接螺栓，使用顶丝将泵盖平稳顶出，注意保护轴套。" },
    { title: "取出旧机封", desc: "取下叶轮螺母和叶轮，将旧的机械密封动环和静环从轴上和泵盖中取出。" },
    { title: "安装新机封", desc: "清洁轴套和密封腔。在O型圈上涂抹硅脂，将新机封静环压入泵盖，动环套入轴上。" },
    { title: "回装与测试", desc: "按拆卸的相反顺序回装部件。盘车检查无卡涩后，开阀排气，送电试车。" }
  ];

  const nextStep = () => {
    setState(prev => {
      const next = prev.step + 1;
      if (next >= steps.length) return { ...prev, step: 0 }; // Reset
      return { ...prev, step: next, isExploded: false }; // Ensure not exploded during step animation
    });
  };

  const toggleExploded = () => {
    setState(prev => ({ ...prev, isExploded: !prev.isExploded }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-cyan-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">尾水管排水泵机械密封更换教学</h1>
          <p className="text-sm text-slate-400 mt-1">Draft Tube Drainage Pump Mechanical Seal Replacement</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={toggleExploded}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition-all ${state.isExploded ? 'bg-cyan-900/50 border-cyan-500 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-cyan-500'}`}
          >
            <Layers size={18} />
            {state.isExploded ? '关闭爆炸图' : '开启爆炸图'}
          </button>
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
                    state.step === idx && !state.isExploded
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
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${state.step === idx && !state.isExploded ? 'bg-cyan-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
                        {idx + 1}
                      </div>
                    )}
                    <h3 className={`font-bold ${state.step === idx && !state.isExploded ? 'text-cyan-300' : state.step > idx ? 'text-green-400' : 'text-slate-400'}`}>
                      {s.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400 pl-9">{s.desc}</p>
                </div>
              ))}
            </div>

            <button 
              onClick={nextStep}
              disabled={state.isExploded}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-bold tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              {state.step === steps.length - 1 ? '完成并重置' : '执行下一步'}
              <ArrowRight size={18} />
            </button>
          </SciFiCard>

          <SciFiCard title="安装注意事项" className="border-yellow-900/50">
            <div className="flex gap-4 items-start text-yellow-400">
              <AlertTriangle size={24} className="shrink-0 mt-1" />
              <div className="text-sm space-y-2">
                <ul className="list-disc list-inside space-y-1 text-yellow-300/80">
                  <li>严禁敲击机械密封的动静环端面，防止碎裂。</li>
                  <li>安装时必须保持端面绝对清洁，不可用手直接触摸。</li>
                  <li>弹簧压缩量应按说明书规定，过大易磨损，过小易泄漏。</li>
                </ul>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg flex flex-col gap-2">
            <div className="flex items-center justify-between gap-6">
              <span className="text-sm text-slate-400">当前视角</span>
              <span className="text-sm font-bold text-cyan-400">{state.isExploded ? '爆炸图 (结构解析)' : '装配图 (流程演示)'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
