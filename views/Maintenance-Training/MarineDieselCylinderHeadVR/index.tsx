import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/MarineDieselCylinderHeadVR/ThreeScene';
import { CylinderHeadState } from '../../../components/Maintenance-Training/MarineDieselCylinderHeadVR/three-types';
import { ArrowRight, ArrowLeft, Anchor, AlertTriangle, Wrench } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[MarineDieselCylinderHeadVR]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/MarineDieselCylinderHeadVR';

export default function MarineDieselCylinderHeadVR() {
  const [state, setState] = useState<CylinderHeadState>({
    step: 0
  });

  const steps = [
    { title: "准备与隔离", desc: "停机，合上盘车机，挂警告牌。关闭冷却水、燃油、起动空气等相关阀门，并放空管路。" },
    { title: "拆除外部管件", desc: "拆除高压油管、冷却水进出水管、排气管法兰、起动空气管及各传感器连线。" },
    { title: "松开液压螺栓", desc: "安装液压拉伸器，连接高压油泵。按规定压力打压，松开气缸盖螺母并取下。" },
    { title: "吊出气缸盖", desc: "安装专用吊具，使用机舱行车平稳、垂直地向上吊起气缸盖，移至专用支架上。" },
    { title: "检查与清洁", desc: "检查气缸盖底面燃烧室状态，检查气门、喷油器孔。清洁气缸套上部及密封面。" }
  ];

  const nextStep = () => {
    setState(prev => ({ ...prev, step: Math.min(4, prev.step + 1) }));
  };

  const prevStep = () => {
    setState(prev => ({ ...prev, step: Math.max(0, prev.step - 1) }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-blue-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-400 tracking-wider">船舶低速柴油机气缸盖拆装虚拟实训</h1>
          <p className="text-sm text-slate-400 mt-1">Marine Low-Speed Diesel Engine Cylinder Head VR Disassembly</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-blue-900/50 border border-blue-500 text-blue-400 rounded-lg flex items-center gap-2">
            <Anchor size={18} />
            轮机工程 (Marine Engineering)
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="标准作业流程 (SOP)" highlight>
            <div className="space-y-4">
              {steps.map((s, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    state.step === idx 
                      ? 'bg-blue-900/40 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                      : state.step > idx 
                        ? 'bg-slate-800/50 border-slate-700 text-slate-500' 
                        : 'bg-black/50 border-slate-800 text-slate-600'
                  }`}
                >
                  <h3 className={`font-bold text-sm mb-1 ${state.step === idx ? 'text-blue-300' : ''}`}>
                    {idx + 1}. {s.title}
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
                disabled={state.step === 4}
                className="py-3 bg-blue-900/50 hover:bg-blue-800/50 border border-blue-500 rounded-lg font-bold disabled:opacity-30 transition-colors flex items-center justify-center gap-2 text-blue-300"
              >
                下一步 <ArrowRight size={18} />
              </button>
            </div>
          </SciFiCard>

          <SciFiCard title="安全与技术要点">
            <div className="text-sm text-slate-400 space-y-3">
              <p className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">液压拉伸器安全：</strong>使用超高压液压泵（通常700-1500 bar）时，严禁人员站在拉伸器正上方，防止高压油管破裂或拉伸器断裂伤人。</span>
              </p>
              <p className="flex items-start gap-2">
                <Wrench size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">吊装平衡：</strong>低速机气缸盖极重（数吨），吊装时必须调整好重心，确保垂直起吊，防止刮伤气缸套内壁或损坏螺栓螺纹。</span>
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
            <h3 className="font-bold text-blue-400 mb-1">3D 视图状态</h3>
            <p className="text-slate-400">
              {state.step === 0 && '整机装配状态'}
              {state.step === 1 && '管系已隔离拆除'}
              {state.step === 2 && '液压螺母已松开'}
              {state.step === 3 && '行车起吊中...'}
              {state.step === 4 && '气缸盖底面检查'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
