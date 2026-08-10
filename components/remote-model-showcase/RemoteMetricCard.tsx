// 2026-08-09 新增：展示外部模型单项实时指标、正常范围、趋势和异常状态；
import React from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Waves } from 'lucide-react';
import type { RemoteBindableField } from '../../src/remoteModelShowcase/types';

interface RemoteMetricCardProps {
  field: RemoteBindableField;
}

export const RemoteMetricCard: React.FC<RemoteMetricCardProps> = ({ field }) => {
  const span = Math.max(field.normal_max - field.normal_min, 0.0001);
  const ratio = Math.min(1, Math.max(0, (field.value - field.normal_min) / span));
  const TrendIcon = field.trend === 'up' ? ArrowUpRight : field.trend === 'down' ? ArrowDownRight : ArrowRight;
  const abnormal = field.abnormal || field.value < field.normal_min || field.value > field.normal_max;

  return (
    <div className={`relative overflow-hidden border p-3 transition ${abnormal ? 'border-rose-500/45 bg-rose-950/15' : 'border-slate-700/60 bg-slate-950/35 hover:border-cyan-700/55'}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Waves size={12} className={abnormal ? 'text-rose-400' : 'text-cyan-400'} />
            {field.label}
          </div>
          <div className={`mt-1.5 font-mono text-xl font-semibold ${abnormal ? 'text-rose-300' : 'text-slate-100'}`}>
            {field.value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}
            <span className="ml-1 text-[10px] font-normal text-slate-500">{field.unit}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] ${abnormal ? 'border-rose-500/35 bg-rose-500/10 text-rose-300' : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'}`}>
          <TrendIcon size={11} />
          {abnormal ? '异常' : '正常'}
        </div>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded bg-slate-800">
        <div className={`h-full ${abnormal ? 'bg-rose-400' : 'bg-cyan-400'}`} style={{ width: `${Math.max(2, ratio * 100)}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[9px] text-slate-600">
        <span>{field.normal_min}</span>
        <span>正常范围</span>
        <span>{field.normal_max}</span>
      </div>
      {field.value_source === 'range-simulated' && (
        <div className="mt-2 text-[9px] text-amber-300/80">范围模拟值 · 非实时实测值</div>
      )}
    </div>
  );
};
