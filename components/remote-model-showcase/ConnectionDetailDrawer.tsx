// 2026-08-10 新增：通过侧边抽屉展示各 API 通道状态、缓存信息、数据归属及来源模型入口；
// 2026-08-10 调整：将抽屉标题、资源职责和服务状态改为设备业务场景表述；
import React, { useEffect } from 'react';
import { ExternalLink, RefreshCw, X } from 'lucide-react';
import type { ModelConnectionChannelState, ModelShowcaseConnectionSnapshot } from '../../src/remoteModelShowcase/types';
import { ConnectionStatusBadge } from './ConnectionStatusBadge';
import { DataProvenancePanel } from './DataProvenancePanel';

interface ConnectionDetailDrawerProps {
  open: boolean;
  snapshot: ModelShowcaseConnectionSnapshot | null;
  detailUrl: string;
  refreshing: boolean;
  lastCheckedAt: number | null;
  onClose: () => void;
  onRefresh: () => void;
}

const formatTime = (value: string | null) => value
  ? new Date(value).toLocaleString('zh-CN', { hour12: false })
  : '--';

const cacheStateLabels = {
  hit: '已使用就绪资源',
  miss: '资源首次加载完成',
  empty: '资源尚未加载',
} as const;

const channelExtra = (channel: ModelConnectionChannelState) => [
  channel.httpStatus ? `服务响应 ${channel.httpStatus}` : null,
  typeof channel.latencyMs === 'number' ? `响应耗时 ${channel.latencyMs} ms` : null,
  channel.cacheState ? cacheStateLabels[channel.cacheState] : null,
  typeof channel.bytes === 'number' ? `资源大小 ${(channel.bytes / 1024 / 1024).toFixed(2)} MB` : null,
].filter(Boolean).join(' · ') || '尚未产生服务记录';

export const ConnectionDetailDrawer: React.FC<ConnectionDetailDrawerProps> = ({
  open,
  snapshot,
  detailUrl,
  refreshing,
  lastCheckedAt,
  onClose,
  onRefresh,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-[2px]" role="presentation" onMouseDown={onClose}>
      <aside className="ml-auto flex h-full w-full max-w-2xl flex-col border-l border-cyan-500/25 bg-[#050b14] shadow-[-20px_0_50px_rgba(0,0,0,0.45)]" role="dialog" aria-modal="true" aria-label="设备数字孪生资源协同状态" onMouseDown={(event) => event.stopPropagation()}>
        <header className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              设备资源协同状态
              <ConnectionStatusBadge status={snapshot?.overallStatus ?? 'unknown'} compact />
            </div>
            <div className="mt-1 text-[10px] text-slate-500">
              状态更新：{snapshot ? formatTime(snapshot.generatedAt) : '--'} · 最近校验：{lastCheckedAt ? new Date(lastCheckedAt).toLocaleTimeString('zh-CN', { hour12: false }) : '--'}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onRefresh} disabled={refreshing} className="border border-slate-700 p-2 text-slate-400 hover:border-cyan-500 hover:text-cyan-300 disabled:opacity-50" title="刷新资源协同状态">
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button type="button" onClick={onClose} className="border border-slate-700 p-2 text-slate-400 hover:border-rose-500 hover:text-rose-300" aria-label="关闭资源协同状态">
              <X size={14} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          <section>
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold text-slate-200">资源来源与应用去向</h3>
              <a href={snapshot?.sourceProject.detailUrl || detailUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 border border-cyan-500/35 bg-cyan-500/10 px-2.5 py-1.5 text-[10px] text-cyan-200 hover:bg-cyan-500/20">
                查看资源详情<ExternalLink size={11} />
              </a>
            </div>
            <div className="grid gap-2 text-[10px] sm:grid-cols-3">
              <div className="border border-slate-700/60 bg-slate-950/40 p-3"><div className="text-slate-600">模型资源平台</div><div className="mt-1 text-slate-300">{snapshot?.sourceProject.name || 'ICES-Union 3d2.0'}</div></div>
              <div className="border border-slate-700/60 bg-slate-950/40 p-3"><div className="text-slate-600">安全接入服务</div><div className="mt-1 text-slate-300">{snapshot?.connector.name || '模型数据安全接入服务'}</div></div>
              <div className="border border-slate-700/60 bg-slate-950/40 p-3"><div className="text-slate-600">业务应用</div><div className="mt-1 text-slate-300">{snapshot?.targetProject.name || '工业智能驾驶舱'}</div></div>
            </div>
            <p className="mt-2 text-[10px] leading-5 text-slate-600">设备模型及运行数据由资源平台提供，经安全接入服务校验后用于当前仿真监测；资源详情页仅用于人工查看原始设备模型。</p>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold text-slate-200">资源同步与智能服务状态</h3>
            <div className="space-y-2">
              {(snapshot?.channels ?? []).map((channel) => (
                <div key={channel.channel} className="border border-slate-700/60 bg-slate-950/35 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-300">{channel.label}</div>
                      <div className="mt-1 text-[9px] text-slate-600">数据职责：{channel.owner === 'upstream' ? '模型资源平台提供' : '工业智能驾驶舱分析生成'}</div>
                    </div>
                    <ConnectionStatusBadge status={channel.status} compact />
                  </div>
                  <div className="mt-2 grid gap-1 text-[9px] text-slate-500 sm:grid-cols-2">
                    <span>{channelExtra(channel)}</span>
                    <span>最近可用：{formatTime(channel.lastSuccessAt)}</span>
                  </div>
                  {channel.errorMessage && <div className="mt-2 border-l-2 border-rose-500/50 pl-2 text-[9px] leading-4 text-rose-300/80">服务异常（{channel.errorCode}）：{channel.errorMessage}</div>}
                </div>
              ))}
              {!snapshot && <div className="border border-dashed border-slate-700 p-6 text-center text-xs text-slate-600">正在获取资源协同状态</div>}
            </div>
          </section>

          {snapshot && (
            <section>
              <h3 className="mb-2 text-xs font-semibold text-slate-200">业务数据与分析成果说明</h3>
              <DataProvenancePanel provenance={snapshot.provenance} />
            </section>
          )}
        </div>
      </aside>
    </div>
  );
};
