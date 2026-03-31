import React from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/computer-visual-inspection/ScreenMesh/ThreeScene';

const ScreenMeshView: React.FC = () => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full tech-grid-bg">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">振动筛筛网破损与堵塞监测</h1>
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
                <div className="text-lg font-bold text-yellow-400">检测到破损</div>
              </div>
              <div className="p-3 bg-slate-900/50 border-l-4 border-cyan-500">
                <div className="text-xs text-slate-500 uppercase">堵塞比例</div>
                <div className="text-lg font-bold text-cyan-400">15 %</div>
              </div>
            </div>
          </SciFiCard>
          
          <SciFiCard title="维修计划联动">
            <div className="text-sm text-slate-400 leading-relaxed">
              视觉系统识别到筛网中央存在局部破损。系统已自动安排<span className="text-yellow-400">筛网更换</span>，并记录筛分效率。
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default ScreenMeshView;
