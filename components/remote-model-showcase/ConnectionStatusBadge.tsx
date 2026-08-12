// 2026-08-10 新增：统一显示跨项目连接、缓存、降级与离线状态；
// 2026-08-10 调整：将连接技术状态转换为设备资源同步业务状态；
import React from 'react';
import { CircleAlert, CircleCheck, CircleDashed, DatabaseZap, Unplug } from 'lucide-react';
import type { ModelConnectionStatus } from '../../src/remoteModelShowcase/types';

const statusStyles: Record<ModelConnectionStatus, {
  label: string;
  className: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}> = {
  connected: { label: '资源同步正常', className: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300', Icon: CircleCheck },
  cached: { label: '资源已就绪', className: 'border-cyan-500/35 bg-cyan-500/10 text-cyan-300', Icon: DatabaseZap },
  degraded: { label: '部分服务受限', className: 'border-amber-500/35 bg-amber-500/10 text-amber-300', Icon: CircleAlert },
  offline: { label: '资源暂不可用', className: 'border-rose-500/35 bg-rose-500/10 text-rose-300', Icon: Unplug },
  unknown: { label: '等待首次同步', className: 'border-slate-600 bg-slate-800/50 text-slate-400', Icon: CircleDashed },
};

interface ConnectionStatusBadgeProps {
  status: ModelConnectionStatus;
  compact?: boolean;
}

export const ConnectionStatusBadge: React.FC<ConnectionStatusBadgeProps> = ({ status, compact = false }) => {
  const item = statusStyles[status];
  return (
    // 2026-08-12 调整：状态标签增加独立作用域，避免等待状态保留深灰底色；
    <span className={`remote-model-status-badge remote-model-status-${status} inline-flex items-center gap-1.5 rounded border ${compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[10px]'} ${item.className}`}>
      <item.Icon size={compact ? 10 : 12} />
      {item.label}
    </span>
  );
};
