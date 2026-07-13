import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/BallastWaterUVLampRepair/ThreeScene';
import { UVLampState } from '../../../components/Maintenance-Training/BallastWaterUVLampRepair/three-types';
import { ArrowRight, ArrowLeft, Zap, ShieldAlert, Droplet } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[BallastWaterUVLampRepair]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/BallastWaterUVLampRepair';

export default function BallastWaterUVLampRepair() {
  const [state, setState] = useState<UVLampState>({
    step: 0
  });

  const steps = [
    { title: "正常运行", desc: "UV灯管在石英套管内发光，对流经反应器的压载水进行紫外线杀菌处理。" },
    { title: "断电与排空", desc: "切断UV反应器电源，挂牌锁定。关闭进出水阀门，打开排空阀排尽反应器内的海水。" },
    { title: "拆卸端盖与接线", desc: "断开UV灯管的电气接线插头，拧下固定端盖和密封压盖。" },
    { title: "抽出旧灯管", desc: "戴上干净的棉质手套，小心、平稳地将旧UV灯管从石英套管中抽出，避免折断或刮伤套管。" },
    { title: "安装新灯管", desc: "将新灯管推入套管，连接插头，装回端盖。恢复供电前需进行水压试验确认无泄漏。" }
  ];

  const nextStep = () => {
    setState(prev => ({ ...prev, step: Math.min(4, prev.step + 1) }));
  };

  const prevStep = () => {
    setState(prev => ({ ...prev, step: Math.max(0, prev.step - 1) }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 tracking-wider">船舶压载水处理系统UV灯管更换演练</h1>
          <p className="text-sm text-slate-400 mt-1">Ballast Water Treatment System (BWTS) UV Lamp Replacement</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.step === 0 ? 'bg-indigo-900/50 border-indigo-500 text-indigo-400' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
            <Zap size={18} />
            {state.step === 0 ? '高压电源接通' : '电源已切断锁定'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="更换作业流程" highlight>
            <div className="space-y-4">
              {steps.map((s, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    state.step === idx 
                      ? 'bg-indigo-900/40 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                      : state.step > idx 
                        ? 'bg-slate-800/50 border-slate-700 text-slate-500' 
                        : 'bg-black/50 border-slate-800 text-slate-600'
                  }`}
                >
                  <h3 className={`font-bold text-sm mb-1 ${state.step === idx ? 'text-indigo-300' : ''}`}>
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
                className="py-3 bg-indigo-900/50 hover:bg-indigo-800/50 border border-indigo-500 rounded-lg font-bold disabled:opacity-30 transition-colors flex items-center justify-center gap-2 text-indigo-300"
              >
                下一步 <ArrowRight size={18} />
              </button>
            </div>
          </SciFiCard>

          <SciFiCard title="安全与防护要求">
            <div className="text-sm text-slate-400 space-y-3">
              <p className="flex items-start gap-2">
                <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">防紫外线灼伤：</strong>严禁在未装入反应器的情况下通电点亮UV灯管。强紫外线会严重灼伤眼睛和皮肤。</span>
              </p>
              <p className="flex items-start gap-2">
                <Droplet size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">防污染：</strong>拿取新灯管时必须佩戴干净的无绒棉手套。手指上的油脂印在石英玻璃上，在高温下会烧结，严重影响透光率和灯管寿命。</span>
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
            <h3 className="font-bold text-indigo-400 mb-1">UV反应器透视图</h3>
            <p className="text-slate-400">
              展示灯管在石英套管内的安装结构。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
