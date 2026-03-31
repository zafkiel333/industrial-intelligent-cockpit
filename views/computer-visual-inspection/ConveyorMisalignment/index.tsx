import React from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/computer-visual-inspection/ConveyorMisalignment/ThreeScene';

const ConveyorMisalignmentView: React.FC = () => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full tech-grid-bg">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">输送带偏斜与边缘磨损视觉监测</h1>
        <div className="px-4 py-1 bg-cyan-900/30 border border-cyan-500/50 rounded text-xs text-cyan-300">
          矿山核心场景
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 h-[500px]">
          <SciFiCard title="实时视觉监测与3D数字孪生" className="h-full">
            <ThreeScene />
          </SciFiCard>
        </div>
        <div className="col-span-4 space-y-6">
          <SciFiCard title="智能诊断结果">
            <div className="space-y-4">
              <div className="p-3 bg-slate-900/50 border-l-4 border-yellow-500">
                <div className="text-xs text-slate-500 uppercase">当前状态</div>
                <div className="text-lg font-bold text-yellow-400">轻度偏斜</div>
              </div>
              <div className="p-3 bg-slate-900/50 border-l-4 border-cyan-500">
                <div className="text-xs text-slate-500 uppercase">偏斜角度</div>
                <div className="text-lg font-bold text-cyan-400">2.5 °</div>
              </div>
            </div>
          </SciFiCard>
          
          <SciFiCard title="维修计划联动">
            <div className="text-sm text-slate-400 leading-relaxed">
              视觉系统识别到皮带边缘与架体存在摩擦风险。系统已自动安排<span className="text-yellow-400">调偏装置校验</span>，并将其列入本周维护清单。
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default ConveyorMisalignmentView;
