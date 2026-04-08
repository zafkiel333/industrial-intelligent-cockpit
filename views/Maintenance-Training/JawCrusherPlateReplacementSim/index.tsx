import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/JawCrusherPlateReplacementSim/ThreeScene';
import { CrusherState } from '../../../components/Maintenance-Training/JawCrusherPlateReplacementSim/three-types';
import { ArrowRight, ArrowLeft, Wrench, AlertOctagon } from 'lucide-react';

export default function JawCrusherPlateReplacementSim() {
  const [state, setState] = useState<CrusherState>({
    step: 0,
    wearLevel: 85
  });

  const steps = [
    { title: "正常运行", desc: "破碎机运行中。注意观察动颚板下端磨损情况。" },
    { title: "拆卸紧固件", desc: "停机闭锁后，拆除动颚板的固定螺栓和压块。" },
    { title: "吊出并翻转", desc: "使用起重设备吊出动颚板，在安全区域将其上下翻转 180 度。" },
    { title: "回装紧固", desc: "将翻转后的动颚板吊回原位，重新安装压块并按规定力矩紧固螺栓。" },
    { title: "试车运行", desc: "清理现场，解除闭锁，空载试车确认无异常。" }
  ];

  const nextStep = () => {
    setState(prev => ({ ...prev, step: Math.min(4, prev.step + 1) }));
  };

  const prevStep = () => {
    setState(prev => ({ ...prev, step: Math.max(0, prev.step - 1) }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-stone-700 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-300 tracking-wider">颚式破碎机动颚板翻转更换演练</h1>
          <p className="text-sm text-stone-500 mt-1">Jaw Crusher Movable Jaw Plate Flipping & Replacement Drill</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-stone-900 border border-stone-600 text-stone-300 rounded-lg flex items-center gap-2">
            <AlertOctagon size={18} className="text-red-500" />
            下端磨损率: {state.wearLevel}% (需翻转)
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="作业流程控制" highlight>
            <div className="space-y-4">
              {steps.map((s, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    state.step === idx 
                      ? 'bg-stone-800 border-stone-400 shadow-[0_0_10px_rgba(168,162,158,0.2)]' 
                      : state.step > idx 
                        ? 'bg-stone-900/80 border-stone-700 text-stone-500' 
                        : 'bg-black/50 border-stone-800 text-stone-600'
                  }`}
                >
                  <h3 className={`font-bold mb-1 ${state.step === idx ? 'text-stone-200' : ''}`}>
                    {idx + 1}. {s.title}
                  </h3>
                  {state.step === idx && <p className="text-xs text-stone-400">{s.desc}</p>}
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button 
                onClick={prevStep}
                disabled={state.step === 0}
                className="py-3 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-lg font-bold disabled:opacity-30 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} /> 上一步
              </button>
              <button 
                onClick={nextStep}
                disabled={state.step === 4}
                className="py-3 bg-stone-700 hover:bg-stone-600 border border-stone-500 rounded-lg font-bold disabled:opacity-30 transition-colors flex items-center justify-center gap-2 text-white"
              >
                下一步 <ArrowRight size={18} />
              </button>
            </div>
          </SciFiCard>

          <SciFiCard title="维修知识点">
            <div className="text-sm text-stone-400 space-y-2">
              <p>颚式破碎机的颚板在工作时，下部受力最大，磨损最快。</p>
              <p>为了延长颚板的使用寿命，通常将其设计成上下对称的形状。当下部磨损到一定程度时，可以将其<strong className="text-stone-200">掉头（翻转180度）</strong>继续使用。</p>
              <p className="text-red-400 mt-2 flex items-center gap-1"><Wrench size={14}/> 注意：吊装翻转时必须使用专用吊具，严禁人员站在颚板下方。</p>
            </div>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-stone-700 rounded-xl overflow-hidden relative bg-stone-950">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-stone-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-stone-300 mb-1">3D 视图说明</h3>
            <p className="text-stone-500">红色区域表示颚板严重磨损部位</p>
          </div>
        </div>
      </div>
    </div>
  );
}
