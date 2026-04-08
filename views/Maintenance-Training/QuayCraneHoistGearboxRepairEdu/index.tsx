import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/QuayCraneHoistGearboxRepairEdu/ThreeScene';
import { GearboxState } from '../../../components/Maintenance-Training/QuayCraneHoistGearboxRepairEdu/three-types';
import { ArrowRight, ArrowLeft, Settings, AlertTriangle, Play } from 'lucide-react';

export default function QuayCraneHoistGearboxRepairEdu() {
  const [state, setState] = useState<GearboxState>({
    step: 0,
    isRunning: false
  });

  const steps = [
    { title: "运行与准备", desc: "观察减速箱运行状态。检修前必须切断起升电机电源，挂牌锁定，并释放卷筒制动器余压。" },
    { title: "拆卸上箱盖", desc: "排空润滑油。拆除箱盖结合面螺栓，使用顶丝顶起上箱盖，用行车平稳吊离。" },
    { title: "吊出高速轴组件", desc: "拆除高速轴两端轴承端盖，使用专用吊具将高速轴连同齿轮、轴承整体吊出。" },
    { title: "检查轴承与齿轮", desc: "清洗轴承，检查游隙和滚道磨损情况。检查高速齿轮齿面是否有疲劳剥落、点蚀或断齿。" }
  ];

  const nextStep = () => {
    setState(prev => ({ ...prev, step: Math.min(3, prev.step + 1), isRunning: false }));
  };

  const prevStep = () => {
    setState(prev => ({ ...prev, step: Math.max(0, prev.step - 1), isRunning: false }));
  };

  const toggleRun = () => {
    if (state.step === 0) {
      setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-orange-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-orange-400 tracking-wider">岸桥起升机构减速箱高速轴检修教学</h1>
          <p className="text-sm text-slate-400 mt-1">Quay Crane Hoist Gearbox High-Speed Shaft Maintenance</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={toggleRun}
            disabled={state.step !== 0}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${state.isRunning ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-slate-800 border-slate-600 text-slate-400'} disabled:opacity-30`}
          >
            <Play size={18} />
            {state.isRunning ? '减速箱运行中' : '测试运行'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="检修工艺流程" highlight>
            <div className="space-y-4">
              {steps.map((s, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    state.step === idx 
                      ? 'bg-orange-900/40 border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]' 
                      : state.step > idx 
                        ? 'bg-slate-800/50 border-slate-700 text-slate-500' 
                        : 'bg-black/50 border-slate-800 text-slate-600'
                  }`}
                >
                  <h3 className={`font-bold text-sm mb-1 ${state.step === idx ? 'text-orange-300' : ''}`}>
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
                disabled={state.step === 3}
                className="py-3 bg-orange-900/50 hover:bg-orange-800/50 border border-orange-500 rounded-lg font-bold disabled:opacity-30 transition-colors flex items-center justify-center gap-2 text-orange-300"
              >
                下一步 <ArrowRight size={18} />
              </button>
            </div>
          </SciFiCard>

          <SciFiCard title="技术标准与注意事项">
            <div className="text-sm text-slate-400 space-y-3">
              <p className="flex items-start gap-2">
                <Settings size={16} className="text-orange-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">高速轴特性：</strong>高速轴转速高、扭矩小，是减速箱中最容易发生轴承损坏和齿面磨损的部件。</span>
              </p>
              <p className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">装配要求：</strong>合箱前必须清理结合面，涂抹密封胶。紧固螺栓需按对角线顺序，使用力矩扳手达到规定力矩。</span>
              </p>
            </div>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-orange-400 mb-1">3D 视图状态</h3>
            <p className="text-slate-400">
              {state.step === 0 && '整体装配状态'}
              {state.step === 1 && '上箱盖已移除'}
              {state.step === 2 && '高速轴组件吊出'}
              {state.step === 3 && '高速轴承及齿轮检查'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
