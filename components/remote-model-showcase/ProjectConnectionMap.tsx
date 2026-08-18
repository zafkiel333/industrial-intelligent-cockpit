// 2026-08-10 新增：在设备页展示外部模型项目、本地 BFF 与工业智能驾驶舱的连接拓扑；
// 2026-08-10 调整：将技术连接拓扑统一改为设备数字孪生资源协同的业务表达；
import React from 'react';
import { ArrowDown, ArrowRight, Cable, ExternalLink, Info, MonitorUp, Server } from 'lucide-react';
import type { ModelShowcaseConnectionSnapshot } from '../../src/remoteModelShowcase/types';
import { ConnectionStatusBadge } from './ConnectionStatusBadge';

interface ProjectConnectionMapProps {
  snapshot: ModelShowcaseConnectionSnapshot | null;
  modelId: number;
  modelName: string;
  loading: boolean;
  error: string | null;
  onOpenDetails: () => void;
  onOpenModelDetail: () => void;
  modelDetailOpening: boolean;
}

const ArrowNode = () => (
  <div className="flex items-center justify-center text-cyan-500/60">
    <ArrowDown size={18} className="xl:hidden" />
    <ArrowRight size={18} className="hidden xl:block" />
  </div>
);

export const ProjectConnectionMap: React.FC<ProjectConnectionMapProps> = ({
  snapshot,
  modelId,
  modelName,
  loading,
  error,
  onOpenDetails,
  onOpenModelDetail,
  modelDetailOpening,
}) => {
  const status = snapshot?.overallStatus ?? 'unknown';
  const cacheLabel = snapshot?.connector.modelCache === 'hit' ? '已就绪' : '等待首次加载';
  return (
    // 2026-08-12 调整：资源协同关系区使用独立浅蓝信息层，突出跨项目数据链路；
    <section className="remote-model-connection-map mb-4 border border-cyan-500/20 bg-[#07111f]/90 p-3 shadow-[0_0_24px_rgba(8,145,178,0.06)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-2.5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-200">
            <Cable size={14} className="text-cyan-400" />设备数字孪生资源协同
          </div>
          <div className="mt-1 text-[10px] text-slate-500">汇聚设备三维模型与运行数据，支撑仿真监测、健康评估和故障预警</div>
        </div>
        <div className="flex items-center gap-2">
          <ConnectionStatusBadge status={status} />
          <button type="button" onClick={onOpenDetails} className="inline-flex items-center gap-1.5 border border-slate-600 bg-slate-900/70 px-2.5 py-1.5 text-[10px] text-slate-300 hover:border-cyan-500/50 hover:text-cyan-200">
            <Info size={12} />查看协同状态
          </button>
        </div>
      </div>

      <div className="grid items-stretch gap-2 xl:grid-cols-[minmax(0,1fr)_28px_minmax(0,1fr)_28px_minmax(0,1fr)]">
        {/* 2026-08-12 调整：三类资源协同节点分别使用浅蓝、浅暖黄和浅紫底色； */}
        <div className="remote-model-connection-node remote-model-connection-node-source border border-cyan-500/25 bg-cyan-950/10 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 gap-2.5">
              <Server size={18} className="mt-0.5 shrink-0 text-cyan-400" />
              <div className="min-w-0">
                <div className="text-[9px] tracking-[0.18em] text-cyan-500">模型资源平台</div>
                <div className="mt-0.5 truncate text-xs font-semibold text-slate-200">{snapshot?.sourceProject.name || 'ICES-Union 3d2.0'}</div>
                <div className="mt-1 text-[10px] text-slate-500">{modelName} · 资源编号 {modelId}</div>
              </div>
            </div>
            {/* 2026-08-18 调整：交由主平台路由打开内标签或执行普通同页跳转。 */}
            <button type="button" onClick={onOpenModelDetail} disabled={modelDetailOpening} className="inline-flex shrink-0 items-center gap-1 border border-cyan-500/35 bg-cyan-500/10 px-2 py-1.5 text-[10px] text-cyan-200 hover:bg-cyan-500/20 disabled:cursor-wait disabled:opacity-60" title="在主平台中打开设备模型资源详情">
              {modelDetailOpening ? '正在打开…' : '查看资源详情'}<ExternalLink size={11} />
            </button>
          </div>
        </div>

        <ArrowNode />

        <div className="remote-model-connection-node remote-model-connection-node-connector border border-amber-500/20 bg-amber-950/10 p-3">
          <div className="flex gap-2.5">
            <Cable size={18} className="mt-0.5 shrink-0 text-amber-300" />
            <div>
              <div className="text-[9px] tracking-[0.18em] text-amber-500">安全接入服务</div>
              <div className="mt-0.5 text-xs font-semibold text-slate-200">模型数据安全接入服务</div>
              {/* 2026-08-10 新增：在连接节点直接显示当前模型缓存状态与传输方式； */}
              <div className="mt-1 text-[10px] leading-4 text-slate-500">接口接入 · 模型资源{cacheLabel}</div>
              <div className="mt-1 text-[9px] leading-4 text-slate-600">资源授权 · 文件校验 · 快速复用 · 异常保护</div>
            </div>
          </div>
        </div>

        <ArrowNode />

        <div className="remote-model-connection-node remote-model-connection-node-target border border-violet-500/20 bg-violet-950/10 p-3">
          <div className="flex gap-2.5">
            <MonitorUp size={18} className="mt-0.5 shrink-0 text-violet-300" />
            <div>
              <div className="text-[9px] tracking-[0.18em] text-violet-500">业务应用端</div>
              <div className="mt-0.5 text-xs font-semibold text-slate-200">工业智能驾驶舱</div>
              {/* 2026-08-10 新增：标注当前消费场景，明确四个页面共享连接能力但状态相互隔离； */}
              <div className="mt-1 text-[9px] text-violet-300/70">当前场景：{modelName}仿真监测</div>
              <div className="mt-1 text-[10px] leading-4 text-slate-500">三维可视化 · 运行监测 · 健康评估 · 故障预警 · 分析报告</div>
            </div>
          </div>
        </div>
      </div>

      {(loading || error) && (
        <div className={`mt-2 text-[10px] ${error ? 'text-amber-300/80' : 'text-slate-600'}`}>
          {error ? `资源协同状态暂未更新：${error}；当前继续显示上一次结果。` : '正在获取设备资源协同状态…'}
        </div>
      )}
    </section>
  );
};
