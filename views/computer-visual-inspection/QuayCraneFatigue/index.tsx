import React from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/computer-visual-inspection/QuayCraneFatigue/ThreeScene';

const QuayCraneFatigueView: React.FC = () => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full tech-grid-bg">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">岸桥钢结构疲劳与裂纹监测</h1>
        <div className="px-4 py-1 bg-cyan-900/30 border border-cyan-500/50 rounded text-xs text-cyan-300">
          港航船舶核心场景
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
              <div className="p-3 bg-slate-900/50 border-l-4 border-cyan-500">
                <div className="text-xs text-slate-500 uppercase">当前状态</div>
                <div className="text-lg font-bold text-cyan-400">结构稳定</div>
              </div>
              <div className="p-3 bg-slate-900/50 border-l-4 border-cyan-500">
                <div className="text-xs text-slate-500 uppercase">疲劳寿命评估</div>
                <div className="text-lg font-bold text-cyan-400">85% 剩余</div>
              </div>
            </div>
          </SciFiCard>
          
          <SciFiCard title="维修计划联动">
            <div className="text-sm text-slate-400 leading-relaxed">
              视觉传感器未发现明显应力集中点。系统建议维持当前的<span className="text-cyan-400">季度性结构探伤</span>计划。
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default QuayCraneFatigueView;
