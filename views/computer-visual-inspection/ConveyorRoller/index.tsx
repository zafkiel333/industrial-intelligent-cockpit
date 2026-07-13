import React from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/computer-visual-inspection/ConveyorRoller/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-conveyor-roller]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-conveyor-roller';

const ConveyorRollerView: React.FC = () => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full tech-grid-bg">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">输送带托辊不转与轴承过热监测</h1>
        <div className="px-4 py-1 bg-cyan-900/30 border border-cyan-500/50 rounded text-xs text-cyan-300">
          矿山核心场景
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 h-[500px]">
          <SciFiCard title="实时视觉监测与3D数字孪生" className="h-full">
            <ThreeScene />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </SciFiCard>
        </div>
        <div className="col-span-4 space-y-6">
          <SciFiCard title="智能诊断结果">
            <div className="space-y-4">
              <div className="p-3 bg-slate-900/50 border-l-4 border-yellow-500">
                <div className="text-xs text-slate-500 uppercase">当前状态</div>
                <div className="text-lg font-bold text-yellow-400">检测到卡死</div>
              </div>
              <div className="p-3 bg-slate-900/50 border-l-4 border-cyan-500">
                <div className="text-xs text-slate-500 uppercase">托辊温度</div>
                <div className="text-lg font-bold text-cyan-400">85 °C</div>
              </div>
            </div>
          </SciFiCard>
          
          <SciFiCard title="维修计划联动">
            <div className="text-sm text-slate-400 leading-relaxed">
              视觉系统识别到 15 号托辊停止转动。系统已自动安排<span className="text-yellow-400">托辊更换</span>，并记录皮带运行阻力。
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default ConveyorRollerView;
