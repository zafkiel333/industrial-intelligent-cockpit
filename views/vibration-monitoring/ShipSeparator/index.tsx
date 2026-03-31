import React from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/ShipSeparator/ThreeScene';
const ShipSeparatorView: React.FC = () => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full tech-grid-bg">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">船用分油机高速旋转不平衡震动</h1>
        <div className="px-4 py-1 bg-cyan-900/30 border border-cyan-500/50 rounded text-xs text-cyan-300">震动监测核心场景</div>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 h-[600px]"><SciFiCard title="实时震动分析与3D数字孪生" className="h-full"><ThreeScene /></SciFiCard></div>
        <div className="col-span-4 space-y-6">
          <SciFiCard title="震动特征提取">
            <div className="space-y-4">
              <div className="p-3 bg-slate-900/50 border-l-4 border-cyan-500"><div className="text-xs text-slate-500 uppercase">当前峰值</div><div className="text-lg font-bold text-cyan-400">2.45 mm/s</div></div>
              <div className="p-3 bg-slate-900/50 border-l-4 border-emerald-500"><div className="text-xs text-slate-500 uppercase">运行状态</div><div className="text-lg font-bold text-emerald-400">正常运行</div></div>
            </div>
          </SciFiCard>
          <SciFiCard title="频谱分析摘要"><div className="text-sm text-slate-400 leading-relaxed">系统实时监测船用分油机高速旋转不平衡震动的震动频率分布。当前主频稳定，未发现异常。</div></SciFiCard>
        </div>
      </div>
    </div>
  );
};
export default ShipSeparatorView;
