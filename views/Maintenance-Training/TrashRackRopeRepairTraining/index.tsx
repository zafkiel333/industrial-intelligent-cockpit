import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/TrashRackRopeRepairTraining/ThreeScene';
import { RopeState } from '../../../components/Maintenance-Training/TrashRackRopeRepairTraining/three-types';
import { AlertOctagon, CheckSquare, ArrowDown, ArrowUp, Wrench } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[TrashRackRopeRepairTraining]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/TrashRackRopeRepairTraining';

export default function TrashRackRopeRepairTraining() {
  const [state, setState] = useState<RopeState>({
    step: 0,
    hoistPos: 50,
    isBroken: true
  });

  const steps = [
    { title: "停电闭锁", desc: "切断清污机主电源，挂“禁止合闸”标示牌，确保机械无法意外启动。" },
    { title: "固定抓斗", desc: "使用手拉葫芦或支撑架将倾斜的抓斗固定，防止在拆卸断绳时突然坠落。" },
    { title: "拆除断绳", desc: "松开卷筒上的压板，抽出断裂的钢丝绳，并清理卷筒槽内的油污。" },
    { title: "穿引新绳", desc: "将新钢丝绳按规定绕向缠绕在卷筒上，穿过滑轮组，固定在抓斗平衡臂上。" },
    { title: "试车调整", desc: "恢复送电，空载试运行，检查钢丝绳排列是否整齐，抓斗是否水平。" }
  ];

  const nextStep = () => {
    setState(prev => {
      const next = prev.step + 1;
      if (next >= steps.length) return { step: 0, hoistPos: 50, isBroken: true }; // Reset
      
      // Fix rope at step 3
      return { 
        ...prev, 
        step: next,
        isBroken: next < 3 
      };
    });
  };

  const moveHoist = (dir: 'up' | 'down') => {
    if (state.isBroken && state.step < 4) return; // Cannot move if broken unless testing
    setState(prev => ({
      ...prev,
      hoistPos: Math.max(0, Math.min(100, prev.hoistPos + (dir === 'down' ? 5 : -5)))
    }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-orange-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-orange-400 tracking-wider">拦污栅清污机钢丝绳断裂抢修实训</h1>
          <p className="text-sm text-slate-400 mt-1">Trash Rack Cleaning Machine Wire Rope Repair Drill</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.isBroken ? 'bg-red-900/50 border-red-500 text-red-400' : 'bg-green-900/50 border-green-500 text-green-400'}`}>
            <AlertOctagon size={18} />
            设备状态: {state.isBroken ? '钢丝绳断裂 (故障)' : '已修复 (正常)'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel - CCTV & Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="现场监控画面 (CCTV)" highlight>
            <div className="aspect-video bg-black border-2 border-slate-700 rounded-lg relative overflow-hidden mb-4">
              <div className="absolute top-2 left-2 text-xs font-mono text-white/70 bg-black/50 px-2 py-1 rounded">CAM 01 - 坝顶视角</div>
              <div className="absolute top-2 right-2 text-xs font-mono text-red-500 animate-pulse">REC</div>
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <div className="w-full h-full border border-white/10 grid grid-cols-3 grid-rows-3">
                  {[...Array(9)].map((_, i) => <div key={i} className="border border-white/5"></div>)}
                </div>
              </div>
              {/* Fallback image or simple CSS representation for CCTV */}
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                <Wrench size={48} className="opacity-20" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => moveHoist('up')}
                disabled={state.isBroken && state.step < 4}
                className="py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowUp size={18} /> 起升 (UP)
              </button>
              <button 
                onClick={() => moveHoist('down')}
                disabled={state.isBroken && state.step < 4}
                className="py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowDown size={18} /> 下降 (DOWN)
              </button>
            </div>
          </SciFiCard>

          <SciFiCard title="抢修作业指导书">
            <div className="space-y-4">
              {steps.map((s, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded border transition-all duration-300 ${
                    state.step === idx 
                      ? 'bg-orange-900/40 border-orange-500' 
                      : state.step > idx 
                        ? 'bg-slate-800 border-slate-700 opacity-50' 
                        : 'bg-slate-900/50 border-slate-800 opacity-30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <CheckSquare className={state.step > idx ? 'text-green-500' : state.step === idx ? 'text-orange-400' : 'text-slate-600'} size={16} />
                    <h3 className={`text-sm font-bold ${state.step === idx ? 'text-orange-300' : 'text-slate-400'}`}>
                      步骤 {idx + 1}: {s.title}
                    </h3>
                  </div>
                  {state.step === idx && <p className="text-xs text-slate-300 pl-7">{s.desc}</p>}
                </div>
              ))}
            </div>

            <button 
              onClick={nextStep}
              className="w-full mt-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold tracking-wider transition-colors"
            >
              {state.step === steps.length - 1 ? '演练完成 (重置)' : '确认完成，进入下一步'}
            </button>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>

          <div className="absolute bottom-4 left-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg flex gap-4 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-slate-400">抓斗位置</span>
              <span className="font-mono text-lg text-orange-400">{state.hoistPos.toFixed(1)} %</span>
            </div>
            <div className="w-px bg-slate-700 mx-2"></div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-400">钢丝绳张力</span>
              <span className={`font-mono text-lg ${state.isBroken ? 'text-red-400' : 'text-green-400'}`}>
                {state.isBroken ? '0.0 kN' : '12.5 kN'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
