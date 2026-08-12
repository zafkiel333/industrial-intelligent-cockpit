// 2026-08-09 新增：组合外部模型、实时参数、趋势、分析预测和资源信息页面；
import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  CloudCog,
  Database,
  ExternalLink,
  FileBox,
  FileDown,
  Gauge,
  LoaderCircle,
  RefreshCw,
  Server,
  ShieldCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SciFiCard } from '../../../components/SciFiCard';
import { AssessmentPanel } from '../../../components/remote-model-showcase/AssessmentPanel';
// 2026-08-10 新增：接入跨项目连接拓扑与通道详情抽屉；
import { ConnectionDetailDrawer } from '../../../components/remote-model-showcase/ConnectionDetailDrawer';
import { ProjectConnectionMap } from '../../../components/remote-model-showcase/ProjectConnectionMap';
import { RemoteMetricCard } from '../../../components/remote-model-showcase/RemoteMetricCard';
import { RemoteModelViewer } from '../../../components/remote-model-showcase/RemoteModelViewer';
import { getModelShowcaseConfig } from '../../../src/remoteModelShowcase/modelCatalog';
import { downloadScenarioReport } from '../../../src/scenarioLib/scenarioFieldReport';
import { useModelShowcaseConnection } from '../../../src/remoteModelShowcase/useModelShowcaseConnection';
import { useRemoteModelTelemetry } from '../../../src/remoteModelShowcase/useRemoteModelTelemetry';
import type { ModelShowcaseSceneId, RemoteDataMode } from '../../../src/remoteModelShowcase/types';

interface RemoteModelSimulationViewProps {
  sceneId: ModelShowcaseSceneId;
}

const chartColors = ['#22d3ee', '#f59e0b', '#a78bfa', '#34d399'];
const modeOptions: Array<{ id: RemoteDataMode; label: string }> = [
  { id: 'dashboard', label: '实时工况' },
  { id: 'normal', label: '正常运行' },
  { id: 'high_load', label: '高负荷' },
  { id: 'fault', label: '故障演练' },
];

const formatNumber = (value?: number) => typeof value === 'number'
  ? value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
  : '--';

const riskLabels = {
  healthy: '健康',
  attention: '关注',
  warning: '预警',
  critical: '高风险',
} as const;

// 2026-08-12 新增：将模型更新技术状态转换为页面可读的业务状态；
const modelRefreshLabels = {
  fresh: '当前为最新可用版本',
  checking: '正在检查新版本',
  stale: '当前版本可用，等待复查',
  'update-failed': '本次更新失败，使用旧版本',
  empty: '尚未建立模型缓存',
} as const;

export const RemoteModelSimulationView: React.FC<RemoteModelSimulationViewProps> = ({ sceneId }) => {
  const config = getModelShowcaseConfig(sceneId)!;
  const telemetry = useRemoteModelTelemetry(sceneId);
  // 2026-08-10 新增：连接快照与业务遥测独立请求，任一链路失败都不会清空另一方已有数据；
  const connection = useModelShowcaseConnection(sceneId);
  const [connectionDetailsOpen, setConnectionDetailsOpen] = useState(false);
  const {
    bootstrap,
    dashboard,
    history,
    diagnosis,
    consistency,
    mode,
    initialLoading,
    refreshing,
    syncing,
    error,
    lastSuccessAt,
    lastCheckedAt,
    hasRangeSimulation,
  } = telemetry;

  const chartData = useMemo(
    () => history.map((point) => ({ label: point.label, time: point.time, ...point.values })),
    [history],
  );
  const online = !error && dashboard?.twin_status.status?.toUpperCase() === 'ONLINE';
  const modelRefresh = connection.snapshot?.modelRefresh;
  // 2026-08-12 新增：连接快照中的活动版本优先于初始化描述，版本变化会驱动视窗获取新的二进制；
  const displayedModel = useMemo(() => {
    if (!bootstrap) return null;
    return {
      ...bootstrap.model,
      version: modelRefresh?.activeVersion || bootstrap.model.version,
      updatedAt: modelRefresh?.updatedAt || bootstrap.model.updatedAt,
      fileName: modelRefresh?.fileName || bootstrap.model.fileName,
      fileSize: modelRefresh?.fileSize || bootstrap.model.fileSize,
      format: modelRefresh?.format || bootstrap.model.format,
    };
  }, [bootstrap, modelRefresh]);

  // 2026-08-10 新增：用户手动刷新时同步更新业务数据和轻量连接快照；
  const handleRefreshAll = () => {
    telemetry.refresh();
    void connection.refresh();
  };

  // 2026-08-09 新增：复用通用导出能力生成当前设备评估与故障预测 Markdown 报告；
  const handleDownloadReport = () => {
    if (!dashboard || !diagnosis) return;
    const predictionText = diagnosis.faultPredictions.length
      ? diagnosis.faultPredictions.map((prediction, index) => [
          `${index + 1}. **${prediction.faultName}**：概率 ${Math.round(prediction.probability * 100)}%，${prediction.expectedWindow}`,
          prediction.evidence.length ? `   - 依据：${prediction.evidence.join('；')}` : '',
        ].filter(Boolean).join('\n')).join('\n')
      : '未输出显著故障预测。';
    const recommendations = diagnosis.recommendations.length
      ? diagnosis.recommendations.map((item, index) => `${index + 1}. ${item}`).join('\n')
      : '保持当前巡检周期，持续观察关键参数趋势。';

    downloadScenarioReport({
      scenarioId: sceneId,
      title: `${config.title}设备评估与故障预测报告`,
      dataPointCount: history.length,
      metrics: [
        { label: '设备健康评分', value: String(diagnosis.healthScore), unit: '分' },
        { label: '综合风险等级', value: riskLabels[diagnosis.riskLevel] },
        { label: '诊断置信度', value: String(Math.round(diagnosis.confidence * 100)), unit: '%' },
        ...dashboard.bindable_fields.map((field) => ({
          label: field.label,
          value: formatNumber(field.value),
          unit: field.unit,
        })),
      ],
      conclusion: [
        '### 数据分析与诊断结论',
        diagnosis.conclusion,
        '### 故障预测',
        predictionText,
        '### 处置建议',
        recommendations,
        '### 数据状态',
        error
          ? `报告使用运行期缓存中的最后成功数据，最近更新时间：${lastSuccessAt ? new Date(lastSuccessAt).toLocaleString('zh-CN', { hour12: false }) : '未知'}。`
          : `报告使用当前 API 数据，最近更新时间：${lastSuccessAt ? new Date(lastSuccessAt).toLocaleString('zh-CN', { hour12: false }) : '未知'}。`,
      ].join('\n\n'),
    });
  };

  if (initialLoading && !bootstrap) {
    return (
      // 2026-08-12 调整：四个外部模型页面的初始化状态使用统一浅蓝灰信息面板；
      <div className="remote-model-showcase-state flex h-full min-h-[620px] items-center justify-center bg-[#050b14] text-slate-300">
        <div className="text-center">
          <LoaderCircle className="mx-auto animate-spin text-cyan-400" size={34} />
          <div className="mt-4 text-sm tracking-[0.22em]">正在初始化数字孪生数据链路</div>
          <div className="mt-2 text-[10px] text-slate-600">模型元数据 · 实时参数 · 诊断服务</div>
        </div>
      </div>
    );
  }

  if (!bootstrap || !dashboard) {
    return (
      // 2026-08-12 调整：外部服务异常状态使用浅色边界和清晰的危险提示层级；
      <div className="remote-model-showcase-state flex h-full min-h-[620px] items-center justify-center bg-[#050b14] px-6 text-slate-300">
        <div className="max-w-lg border border-rose-500/30 bg-rose-950/10 p-8 text-center">
          <WifiOff className="mx-auto text-rose-400" size={34} />
          <h2 className="mt-4 text-lg font-semibold">外部模型服务暂不可用</h2>
          <p className="mt-2 text-xs leading-6 text-slate-500">{error || '初始化数据不完整，请检查本地后端与远端 API。'}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => window.location.reload()} className="border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs text-cyan-200 hover:bg-cyan-500/20">
              重新建立连接
            </button>
            {/* 2026-08-10 新增：即使本地链路异常也允许人工打开外部项目来源模型页排查； */}
            <a href={config.sourceDetailUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 border border-slate-600 bg-slate-900/70 px-4 py-2 text-xs text-slate-300 hover:border-cyan-500/50 hover:text-cyan-200">
              查看资源详情<ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    // 2026-08-09 修复：由应用主内容区统一滚动，避免模型或缺失数据形成嵌套高度扩张；
    // 2026-08-12 调整：为仿真分析前四页增加独立浅色主题作用域，强化标题、模型、参数和诊断区层级；
    <div className="remote-model-showcase-page min-h-0 w-full overflow-x-hidden bg-[#050b14] text-slate-200 font-[Rajdhani]">
      <div className="remote-model-showcase-layout min-h-full bg-[radial-gradient(circle_at_50%_0%,rgba(8,145,178,0.12),transparent_36%)] p-4 lg:p-5">
        <header className="remote-model-showcase-header mb-4 border border-slate-800/70 bg-[#08111f]/90 px-4 py-4 shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-cyan-400/80">
                <span>Simulation Analysis</span>
                <span className="text-slate-700">/</span>
                <span>ID {config.modelId}</span>
                <span className={`rounded border px-2 py-0.5 tracking-normal ${online ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/30 bg-rose-500/10 text-rose-300'}`}>
                  {online ? 'API ONLINE' : 'API STALE'}
                </span>
                {/* 2026-08-10 新增：在页面标题区明确标注来源项目及本地连接层； */}
                {/* 2026-08-10 调整：将工程化来源标签改为资源来源与接入服务业务标签； */}
                <span className="rounded border border-cyan-500/25 bg-cyan-500/5 px-2 py-0.5 tracking-normal text-cyan-300">资源来源：ICES-Union 3d2.0</span>
                <span className="rounded border border-amber-500/25 bg-amber-500/5 px-2 py-0.5 tracking-normal text-amber-300">接入服务：模型数据安全接入</span>
              </div>
              <h1 className="text-xl font-bold tracking-wide text-slate-100 lg:text-2xl">{config.title}</h1>
              <p className="mt-1 max-w-4xl text-xs leading-5 text-slate-500">{config.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {modeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={refreshing}
                  onClick={() => telemetry.setMode(option.id)}
                  className={`border px-3 py-2 text-[11px] transition disabled:opacity-50 ${mode === option.id ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.12)]' : 'border-slate-700 bg-slate-900/70 text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}
                >
                  {option.label}
                </button>
              ))}
              <button type="button" disabled={refreshing || connection.refreshing} onClick={handleRefreshAll} className="border border-slate-700 bg-slate-900/70 p-2 text-slate-400 hover:border-cyan-600 hover:text-cyan-300 disabled:opacity-50" title="立即刷新">
                <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              </button>
              {/* 2026-08-12 新增：独立的模型更新按钮仅刷新三维资源，不打断遥测和诊断数据展示； */}
              <button
                type="button"
                disabled={connection.modelRefreshing || modelRefresh?.state === 'checking'}
                onClick={() => void connection.refreshModel()}
                className="inline-flex items-center gap-1.5 border border-sky-300 bg-sky-50/80 px-3 py-2 text-[11px] text-sky-800 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-55"
                title="向模型资源服务核对并获取最新三维模型"
              >
                <RefreshCw size={14} className={connection.modelRefreshing || modelRefresh?.state === 'checking' ? 'animate-spin' : ''} />
                {connection.modelRefreshing ? '正在更新模型' : '更新三维模型'}
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-2 border-t border-white/5 pt-3 text-[10px] text-slate-500 sm:grid-cols-2 lg:grid-cols-6">
            <div className="flex items-center gap-2"><Wifi size={12} className={online ? 'text-emerald-400' : 'text-rose-400'} />孪生状态：{dashboard.twin_status.status}</div>
            <div className="flex items-center gap-2"><Database size={12} className="text-cyan-500" />数据源：{dashboard.twin_status.data_source || 'Remote API'}</div>
            <div className="flex items-center gap-2"><Gauge size={12} className="text-cyan-500" />延迟：{dashboard.twin_status.sync_latency_ms ?? '--'} ms</div>
            <div className="flex items-center gap-2"><Activity size={12} className="text-cyan-500" />数据点：{dashboard.twin_status.data_points || dashboard.bindable_fields.length}</div>
            <div className="flex items-center gap-2"><Server size={12} className="text-cyan-500" />数据更新：{lastSuccessAt ? new Date(lastSuccessAt).toLocaleString('zh-CN', { hour12: false }) : '--'}</div>
            <div className="flex items-center gap-2"><RefreshCw size={12} className="text-cyan-500" />最近检查：{lastCheckedAt ? new Date(lastCheckedAt).toLocaleTimeString('zh-CN', { hour12: false }) : '--'}</div>
          </div>
          {error && (
            <div className="mt-3 flex items-center gap-2 border border-rose-500/25 bg-rose-500/5 px-3 py-2 text-[11px] text-rose-300">
              <AlertCircle size={13} />
              {error}；当前继续显示运行期缓存中的最后一次成功数据。上次更新时间：{lastSuccessAt ? new Date(lastSuccessAt).toLocaleString('zh-CN', { hour12: false }) : '暂无'}。
            </div>
          )}
          {/* 2026-08-12 新增：更新失败只以小字提示，明确当前仍在使用上次可用模型； */}
          {(modelRefresh?.lastRefreshError || connection.modelRefreshFeedback?.result === 'failed') && (
            <div className="mt-3 flex items-center gap-2 border border-amber-300 bg-amber-50/90 px-3 py-2 text-[11px] text-amber-900">
              <AlertCircle size={13} className="shrink-0" />
              {modelRefresh?.state === 'stale' ? '模型当前可展示，但持久缓存未完成。' : '本次模型更新未成功，当前继续使用上次可用版本。'}
              失败时间：{modelRefresh?.lastCheckedAt ? new Date(modelRefresh.lastCheckedAt).toLocaleString('zh-CN', { hour12: false }) : '暂无'}；上次成功更新：{modelRefresh?.updatedAt ? new Date(modelRefresh.updatedAt).toLocaleString('zh-CN', { hour12: false }) : '暂无'}
              {modelRefresh?.lastRefreshError ? `；原因：${modelRefresh.lastRefreshError}` : ''}
            </div>
          )}
          {connection.modelRefreshFeedback && connection.modelRefreshFeedback.result !== 'failed' && (
            <div className={`mt-3 flex items-center gap-2 border px-3 py-2 text-[11px] ${connection.modelRefreshFeedback.result === 'rate-limited' ? 'border-amber-300 bg-amber-50/90 text-amber-900' : 'border-emerald-300 bg-emerald-50/90 text-emerald-800'}`}>
              {connection.modelRefreshFeedback.result === 'rate-limited' ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />}
              {connection.modelRefreshFeedback.message}
            </div>
          )}
          {hasRangeSimulation && (
            <div className="mt-3 flex items-center gap-2 border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-300">
              <AlertCircle size={13} />
              部分字段仅提供范围，当前数值为页面范围模拟值，已与 API 实时值区分标注。
            </div>
          )}
        </header>

        {/* 2026-08-10 新增：用三段式拓扑呈现来源项目、后端代理和当前驾驶舱之间的连接； */}
        <ProjectConnectionMap
          snapshot={connection.snapshot}
          modelId={config.modelId}
          modelName={config.expectedRemoteName}
          detailUrl={config.sourceDetailUrl}
          loading={connection.loading}
          error={connection.error}
          onOpenDetails={() => setConnectionDetailsOpen(true)}
        />
        <ConnectionDetailDrawer
          open={connectionDetailsOpen}
          snapshot={connection.snapshot}
          detailUrl={config.sourceDetailUrl}
          refreshing={connection.refreshing}
          lastCheckedAt={connection.lastCheckedAt}
          onClose={() => setConnectionDetailsOpen(false)}
          onRefresh={connection.refresh}
        />

        {/* 2026-08-09 修复：固定模型与参数卡边界，超量数据仅在组件内部滚动； */}
        <div className="remote-model-showcase-primary-grid grid items-start gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(420px,0.9fr)]">
          <SciFiCard title="3D 设备数字孪生" subtitle={(displayedModel?.format || bootstrap.model.format).toUpperCase()} noPadding highlight className="remote-model-showcase-viewer-card h-[492px] min-h-0 overflow-hidden">
            <RemoteModelViewer
              asset={displayedModel || bootstrap.model}
              fields={dashboard.bindable_fields}
              renderConfig={bootstrap.dashboard.render_config}
              accent={config.accent}
              autoRotateSpeed={config.viewer.autoRotateSpeed}
            />
          </SciFiCard>

          <SciFiCard title="实时运行参数" subtitle={`${dashboard.bindable_fields.length} POINTS`} className="remote-model-showcase-telemetry-card h-[492px] min-h-0 overflow-hidden">
            <div className="h-full overflow-y-auto pr-1">
              <div className="grid gap-3 sm:grid-cols-2">
                {dashboard.bindable_fields.map((field) => <RemoteMetricCard key={field.field} field={field} />)}
              </div>
              <div className="mt-3 border-t border-white/5 pt-3 text-[10px] text-slate-600">
                轮询周期 5 秒 · 当前工况：{dashboard.scenario_label || modeOptions.find((item) => item.id === mode)?.label}
              </div>
            </div>
          </SciFiCard>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          {config.chartGroups.map((group, groupIndex) => (
            <SciFiCard key={group.title} title={group.title} subtitle={`${history.length} SAMPLES`} className="remote-model-showcase-chart-card min-h-[272px]">
              <div className="h-[215px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 5" vertical={false} />
                    <XAxis dataKey="label" stroke="#475569" tick={{ fill: '#64748b', fontSize: 9 }} minTickGap={28} />
                    {group.fields.map((field) => <YAxis key={field} yAxisId={field} hide domain={['auto', 'auto']} />)}
                    <Tooltip
                      contentStyle={{ background: '#07111f', border: '1px solid #334155', fontSize: 11 }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
                    {group.fields.map((field, index) => (
                      <Line
                        key={field}
                        yAxisId={field}
                        type="monotone"
                        dataKey={field}
                        name={config.fields[field]?.label || field}
                        stroke={chartColors[(groupIndex + index) % chartColors.length]}
                        dot={false}
                        strokeWidth={1.8}
                        isAnimationActive={false}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>
          ))}
        </div>

        {/* 2026-08-09 新增：展示数据分析、故障预测和可下载的评估预测报告； */}
        <div className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.6fr)]">
          <SciFiCard title="数据分析、设备评估与故障预测" subtitle="DIAGNOSIS OUTPUT" highlight className="remote-model-showcase-diagnosis-card">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-cyan-500/20 bg-cyan-950/10 px-3 py-2.5">
              <div className="text-[11px] leading-5 text-slate-400">
                诊断与预测仅依赖当前遥测及运行期历史，3D 模型文件缺失不会中断分析。
              </div>
              <button
                type="button"
                disabled={!diagnosis}
                onClick={handleDownloadReport}
                className="flex shrink-0 items-center gap-2 border border-cyan-500/40 bg-cyan-500/15 px-3 py-2 text-xs text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                title={diagnosis ? '下载当前设备分析与故障预测报告' : '诊断结论生成后可下载'}
              >
                <FileDown size={14} />
                下载评估预测报告
              </button>
            </div>
            <AssessmentPanel diagnosis={diagnosis} />
          </SciFiCard>

          <div className="grid gap-4">
            <SciFiCard title="API 数据一致性" subtitle="VALIDATION">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-2xl font-mono text-cyan-200">{consistency?.overall_consistency_pct != null ? `${formatNumber(consistency.overall_consistency_pct)}%` : '--'}</div>
                  <div className="mt-1 text-[10px] text-slate-500">{consistency?.summary || '按当前工况值向远端校验接口发起核验'}</div>
                </div>
                {consistency ? <CheckCircle2 className="text-emerald-400" size={28} /> : <ShieldCheck className="text-slate-700" size={28} />}
              </div>
              <button type="button" disabled={syncing} onClick={telemetry.validateConsistency} className="mt-4 flex w-full items-center justify-center gap-2 border border-cyan-500/35 bg-cyan-500/10 py-2 text-xs text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50">
                {syncing ? <LoaderCircle size={13} className="animate-spin" /> : <CloudCog size={13} />}
                {syncing ? '正在校验' : '校验当前数据'}
              </button>
            </SciFiCard>

            <SciFiCard title="模型与资源信息" subtitle={`MODEL ${config.modelId}`}>
              <dl className="space-y-2.5 text-[11px]">
                <div className="flex justify-between gap-3"><dt className="text-slate-500">API 设备名称</dt><dd className="text-right text-slate-300">{dashboard.equipment.name}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">页面设备语义</dt><dd className="text-right text-slate-300">{config.expectedRemoteName}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">资源文件</dt><dd className="max-w-[210px] truncate text-right text-slate-300" title={(displayedModel || bootstrap.model).fileName}>{(displayedModel || bootstrap.model).fileName}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">文件大小</dt><dd className="font-mono text-slate-300">{((displayedModel || bootstrap.model).fileSize / 1024 / 1024).toFixed(2)} MB</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">活动版本</dt><dd className="font-mono text-slate-300">{(displayedModel || bootstrap.model).version.slice(0, 8)}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">更新状态</dt><dd className="text-right text-slate-300">{modelRefresh ? modelRefreshLabels[modelRefresh.state] : '正在同步状态'}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">模型更新时间</dt><dd className="text-right text-slate-300">{modelRefresh?.updatedAt ? new Date(modelRefresh.updatedAt).toLocaleString('zh-CN', { hour12: false }) : '首次加载中'}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">上次模型检查</dt><dd className="text-right text-slate-300">{modelRefresh?.lastCheckedAt ? new Date(modelRefresh.lastCheckedAt).toLocaleString('zh-CN', { hour12: false }) : '尚未检查'}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">下次自动检查</dt><dd className="text-right text-slate-300">{modelRefresh?.nextRefreshAt ? new Date(modelRefresh.nextRefreshAt).toLocaleString('zh-CN', { hour12: false }) : '模型就绪后计算'}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">模型面数</dt><dd className="font-mono text-slate-300">{formatNumber(dashboard.model_config?.polygon_count)}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">材质数量</dt><dd className="font-mono text-slate-300">{dashboard.model_config?.material_count ?? '--'}</dd></div>
              </dl>
              <div className="mt-4 flex items-start gap-2 border-t border-white/5 pt-3 text-[10px] leading-5 text-slate-500">
                <FileBox size={13} className="mt-0.5 shrink-0 text-cyan-500" />
                <span>{config.sourceAssetLabel}。模型二进制由本项目后端代理获取，前端不直接访问远端对象地址。</span>
              </div>
              {sceneId === 'sim-visual-haul-truck' && (
                <div className="mt-3 border border-amber-500/20 bg-amber-500/5 p-2 text-[10px] leading-5 text-amber-200/75">
                  当前“矿卡”页面按已确认方案使用上游“拖车牵引车”资源承载。
                </div>
              )}
            </SciFiCard>
          </div>
        </div>
      </div>
    </div>
  );
};
