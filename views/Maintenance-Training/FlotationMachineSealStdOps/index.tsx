import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/FlotationMachineSealStdOps/ThreeScene';
import { SealState } from '../../../components/Maintenance-Training/FlotationMachineSealStdOps/three-types';
import { ArrowRight, ArrowLeft, ShieldCheck, Droplet } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[FlotationMachineSealStdOps]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/FlotationMachineSealStdOps';

export default function FlotationMachineSealStdOps() {
  const [state, setState] = useState<SealState>({
    step: 0
  });

  const steps = [
    { title: "运行状态", desc: "浮选机主轴正常运转。若发现轴承座漏浆，需停机更换密封。" },
    { title: "拆卸密封盖", desc: "停机、断电、挂牌。拆除主轴承座上部的密封压盖螺栓，吊起压盖。" },
    { title: "取出旧密封", desc: "使用专用工具将磨损的旧密封圈从轴承座内挑出，注意不要划伤主轴。" },
    { title: "清洗密封面", desc: "使用清洗剂彻底清理轴承座内部和主轴表面的矿浆残留和油污。" },
    { title: "安装新密封", desc: "在主轴和新密封圈唇口涂抹润滑脂，平稳压入新密封圈，确保方向正确。" },
    { title: "回装压盖", desc: "将密封压盖回装，对角均匀紧固螺栓。盘车检查是否有卡滞。" }
  ];

  const nextStep = () => {
    setState(prev => ({ ...prev, step: Math.min(5, prev.step + 1) }));
  };

  const prevStep = () => {
    setState(prev => ({ ...prev, step: Math.max(0, prev.step - 1) }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-teal-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-teal-400 tracking-wider">浮选机主轴承座密封更换标准作业</h1>
          <p className="text-sm text-slate-400 mt-1">Flotation Machine Main Bearing Housing Seal Replacement SOP</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-teal-900/50 border border-teal-500 text-teal-400 rounded-lg flex items-center gap-2">
            <ShieldCheck size={18} />
            标准作业程序 (SOP)
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="作业步骤控制" highlight>
            <div className="space-y-4">
              {steps.map((s, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    state.step === idx 
                      ? 'bg-teal-900/40 border-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.2)]' 
                      : state.step > idx 
                        ? 'bg-slate-800/50 border-slate-700 text-slate-500' 
                        : 'bg-black/50 border-slate-800 text-slate-600'
                  }`}
                >
                  <h3 className={`font-bold text-sm mb-1 ${state.step === idx ? 'text-teal-300' : ''}`}>
                    {idx}. {s.title}
                  </h3>
                  {state.step === idx && <p className="text-xs text-slate-400">{s.desc}</p>}
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button 
                onClick={prevStep}
                disabled={state.step === 0}
                className="py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg font-bold disabled:opacity-30 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} /> 上一步
              </button>
              <button 
                onClick={nextStep}
                disabled={state.step === 5}
                className="py-3 bg-teal-900/50 hover:bg-teal-800/50 border border-teal-500 rounded-lg font-bold disabled:opacity-30 transition-colors flex items-center justify-center gap-2 text-teal-300"
              >
                下一步 <ArrowRight size={18} />
              </button>
            </div>
          </SciFiCard>

          <SciFiCard title="关键注意事项">
            <div className="text-sm text-slate-400 space-y-2">
              <p className="flex items-start gap-2">
                <Droplet size={16} className="text-teal-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">防腐防磨：</strong>浮选机工作环境恶劣，矿浆具有腐蚀性和磨损性，密封失效会导致轴承快速损坏。</span>
              </p>
              <p className="flex items-start gap-2">
                <ShieldCheck size={16} className="text-teal-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">安装方向：</strong>骨架油封的唇口必须朝向矿浆侧（压力侧），切勿装反。</span>
              </p>
            </div>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>

          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-teal-400 mb-1">3D 视图说明</h3>
            <p className="text-slate-400">蓝色环形件代表新型聚氨酯耐磨密封圈</p>
          </div>
        </div>
      </div>
    </div>
  );
}
