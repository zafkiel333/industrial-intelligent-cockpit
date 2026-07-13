import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/MarineRadarMagnetronRepair/ThreeScene';
import { MagnetronState } from '../../../components/Maintenance-Training/MarineRadarMagnetronRepair/three-types';
import { ArrowRight, ArrowLeft, Radio, ShieldAlert, Zap, Clock } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[MarineRadarMagnetronRepair]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/MarineRadarMagnetronRepair';

export default function MarineRadarMagnetronRepair() {
  const [state, setState] = useState<MagnetronState>({
    step: 0,
    isTransmitting: true
  });

  const steps = [
    { title: "正常发射状态", desc: "磁控管产生高频微波脉冲，通过波导管传输至天线发射。寿命到期后发射功率下降，海浪杂波增多，目标丢失。" },
    { title: "断电与高压放电", desc: "切断雷达主电源并挂牌。打开收发机外壳，使用绝缘螺丝刀将高压电容两端短接放电，防止高压电击伤人！" },
    { title: "拆卸旧磁控管", desc: "拔下磁控管灯丝和高压插头，拆除固定螺丝，垂直向上拔出磁控管，注意不要损坏波导管内的探针。" },
    { title: "安装新磁控管", desc: "将新磁控管探针对准波导管孔位垂直插入，均匀拧紧固定螺丝，恢复电气连接。注意磁铁极性及防尘。" },
    { title: "预热与老化 (Warm-up)", desc: "更换后首次开机，必须在 Standby 状态下预热至少 30 分钟（老化），让管内真空度恢复，严禁直接开启 TX 发射！" }
  ];

  const nextStep = () => {
    setState(prev => ({ 
      ...prev, 
      step: Math.min(4, prev.step + 1),
      isTransmitting: false // Stop transmitting as soon as we leave step 0
    }));
  };

  const prevStep = () => {
    setState(prev => ({ 
      ...prev, 
      step: Math.max(0, prev.step - 1),
      isTransmitting: prev.step - 1 === 0 // Resume transmitting if back to step 0
    }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-rose-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-rose-400 tracking-wider">船用雷达天线收发机磁控管更换教学</h1>
          <p className="text-sm text-slate-400 mt-1">Marine Radar Transceiver Magnetron Replacement</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.isTransmitting ? 'bg-rose-900/50 border-rose-500 text-rose-400 animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
            <Radio size={18} />
            {state.isTransmitting ? 'TX 发射中 (高压危险)' : 'Standby / 断电状态'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="更换作业流程 (SOP)" highlight>
            <div className="space-y-4">
              {steps.map((s, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    state.step === idx 
                      ? 'bg-rose-900/40 border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]' 
                      : state.step > idx 
                        ? 'bg-slate-800/50 border-slate-700 text-slate-500' 
                        : 'bg-black/50 border-slate-800 text-slate-600'
                  }`}
                >
                  <h3 className={`font-bold text-sm mb-1 ${state.step === idx ? 'text-rose-300' : ''}`}>
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
                className="py-3 bg-rose-900/50 hover:bg-rose-800/50 border border-rose-500 rounded-lg font-bold disabled:opacity-30 transition-colors flex items-center justify-center gap-2 text-rose-300"
              >
                下一步 <ArrowRight size={18} />
              </button>
            </div>
          </SciFiCard>

          <SciFiCard title="安全与技术要领">
            <div className="text-sm text-slate-400 space-y-3">
              <p className="flex items-start gap-2">
                <Zap size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">致命高压警告：</strong>雷达调制器产生数千伏高压。即使断电，高压电容仍可能存有致命电荷，必须手动短接放电！</span>
              </p>
              <p className="flex items-start gap-2">
                <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">强磁场警告：</strong>磁控管带有强力磁铁，严禁将手表、磁卡或铁质工具靠近，防止被吸附砸坏玻璃管壳。</span>
              </p>
              <p className="flex items-start gap-2">
                <Clock size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">老化(Aging)要求：</strong>新磁控管内部可能存在微量残余气体，直接加高压发射会导致内部打火烧毁。必须先加灯丝电压预热30分钟吸收气体。</span>
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
            <h3 className="font-bold text-rose-400 mb-1">收发机内部结构透视</h3>
            <p className="text-slate-400">
              红色部件为磁控管，下方黄色为波导管，右侧蓝色为高压电容。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
