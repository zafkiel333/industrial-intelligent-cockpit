import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Crosshair,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { apiUrl } from '../../src/integration/apiClient';
import { referenceStatus } from '../../src/remoteModelShowcase/dataTimeline';
import type { DataTimeline } from '../../src/remoteModelShowcase/dataTimeline';
import type { ModelShowcaseSceneId } from '../../src/remoteModelShowcase/types';

interface BatchSummary {
  batchId: string;
  fileName: string;
  deviceId: string;
  importedAt: string;
}

interface Overview {
  dataVersion: string;
  devices: string[];
  batches: BatchSummary[];
}

interface PredictionAlert {
  field: string;
  label: string;
  unit: string;
  part: string;
  direction: 'low' | 'high';
  severity: 'attention' | 'warning' | 'critical';
  firstAt: string;
  peakAt: string;
  peakValue: number;
  normalMin: number;
  normalMax: number;
  consecutivePoints: number;
  durationMinutes: number;
}

interface PredictionTimeline extends DataTimeline {
  generatedAt: string;
  alerts: PredictionAlert[];
  diagnosis: {
    healthScore: number;
    riskLevel: 'healthy' | 'attention' | 'warning' | 'critical';
    conclusion: string;
    predictions: Array<{
      faultCode: string;
      faultName: string;
      probability: number;
      expectedWindow: string;
      evidence: string[];
      recommendation: string;
    }>;
  };
}

interface FocusEventDetail {
  sceneId: string;
  deviceId?: string;
  batchId?: string;
}

const palette = ['#087eaa', '#9a4fb8', '#d56d16', '#188779', '#d4475f', '#536fbd'];
const number = (value: number | null | undefined, decimals = 2) => value == null || !Number.isFinite(value)
  ? '--'
  : value.toLocaleString('zh-CN', { maximumFractionDigits: decimals });
const dateTime = (value: string | null | undefined) => value
  ? new Date(value).toLocaleString('zh-CN', { hour12: false })
  : '--';
const clock = (value: number) => new Date(value).toLocaleTimeString('zh-CN', {
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
});
const methodLabels: Record<string, string> = {
  level: '稳健平滑',
  'damped-trend': '阻尼趋势',
  seasonal: '周期趋势',
};
const riskLabels = { healthy: '趋势平稳', attention: '需要关注', warning: '预测预警', critical: '高风险预警' } as const;

async function requestJson<T>(pathname: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(apiUrl(pathname), { signal, headers: { Accept: 'application/json' } });
  const body = await response.json().catch(() => ({})) as T & { error?: { message?: string } };
  if (!response.ok) throw new Error(body.error?.message || `请求失败（${response.status}）`);
  return body;
}

function miniPath(values: number[], width = 124, height = 34): string {
  if (!values.length) return '';
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const span = Math.max(0.000001, maximum - minimum);
  return values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : index / (values.length - 1) * width;
    const y = height - 3 - (value - minimum) / span * (height - 6);
    return `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

export function PilotPredictionDashboard({
  sceneId,
  viewer,
}: {
  sceneId: ModelShowcaseSceneId;
  viewer: React.ReactNode;
}) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [deviceId, setDeviceId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [data, setData] = useState<PredictionTimeline | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const pendingFocusRef = useRef<FocusEventDetail | null>(null);

  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    const handleChanged = (event: Event) => {
      const detail = (event as CustomEvent<FocusEventDetail>).detail;
      if (detail?.sceneId !== sceneId) return;
      pendingFocusRef.current = detail;
      if (detail.deviceId) setDeviceId(detail.deviceId);
      if (detail.batchId !== undefined) setBatchId(detail.batchId);
      refresh();
      window.setTimeout(() => document.querySelector('.pilot-data-dashboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    };
    window.addEventListener('model-data-changed', handleChanged);
    window.addEventListener('model-data-focus', handleChanged);
    return () => {
      window.removeEventListener('model-data-changed', handleChanged);
      window.removeEventListener('model-data-focus', handleChanged);
    };
  }, [refresh, sceneId]);

  useEffect(() => {
    const controller = new AbortController();
    requestJson<Overview>(`model-showcase/${sceneId}/data/overview`, controller.signal)
      .then((next) => {
        const pendingFocus = pendingFocusRef.current;
        setOverview(next);
        if (pendingFocus?.deviceId && next.devices.includes(pendingFocus.deviceId)) {
          setDeviceId(pendingFocus.deviceId);
          if (pendingFocus.batchId !== undefined) {
            setBatchId(next.batches.some((batch) => batch.batchId === pendingFocus.batchId && batch.deviceId === pendingFocus.deviceId) ? pendingFocus.batchId : '');
          }
        } else {
          setDeviceId((current) => next.devices.includes(current) ? current : next.devices[0] || '');
        }
        pendingFocusRef.current = null;
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message || '数据概况读取失败');
      });
    return () => controller.abort();
  }, [revision, sceneId]);

  const availableBatches = useMemo(
    () => overview?.batches.filter((batch) => batch.deviceId === deviceId) || [],
    [deviceId, overview],
  );

  useEffect(() => {
    if (batchId && !availableBatches.some((batch) => batch.batchId === batchId)) setBatchId('');
  }, [availableBatches, batchId]);

  useEffect(() => {
    if (!deviceId) { setData(null); return undefined; }
    const controller = new AbortController();
    setError('');
    const query = new URLSearchParams({ deviceId });
    if (batchId) query.set('batchId', batchId);
    requestJson<PredictionTimeline>(`model-showcase/${sceneId}/data/timeline?${query}`, controller.signal)
      .then(setData)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message || '预测数据读取失败');
      });
    return () => controller.abort();
  }, [batchId, deviceId, overview?.dataVersion, revision, sceneId]);

  const selectedBatch = availableBatches.find((batch) => batch.batchId === batchId);
  const currentData = data?.deviceId === deviceId && (data.batchId || '') === batchId ? data : null;

  return <section className="pilot-data-dashboard" aria-label="设备数据与预测分析">
    <header className="pilot-dashboard-heading">
      <div>
        <span className="pilot-dashboard-eyebrow"><Activity size={14} /> 设备数据分析</span>
        <h2>实测数据与长周期预测</h2>
        <p>历史实测与未来预测分区呈现，预测结论、预警和部位均随所选设备及批次更新。</p>
      </div>
      <div className="pilot-dashboard-filters">
        <label>设备<select value={deviceId} onChange={(event) => { setDeviceId(event.target.value); setBatchId(''); }} disabled={!overview?.devices.length}>{!overview?.devices.length && <option value="">暂无设备</option>}{overview?.devices.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>数据范围<select value={batchId} onChange={(event) => setBatchId(event.target.value)}><option value="">该设备全部留存数据</option>{availableBatches.map((batch) => <option key={batch.batchId} value={batch.batchId}>{dateTime(batch.importedAt)} · {batch.fileName}</option>)}</select></label>
        <button type="button" onClick={refresh} title="刷新实测与预测数据"><RefreshCw size={16} /></button>
      </div>
    </header>

    {error && <div className="model-data-error pilot-dashboard-error" role="alert">{error}</div>}

    <div className="pilot-operational-grid">
      <div className="pilot-viewer-slot">{viewer}</div>
      <MeasuredDataPanel data={currentData} batchName={selectedBatch?.fileName} />
    </div>

    <div className="pilot-prediction-grid">
      <PredictionChart data={currentData} />
      <PredictionInsights data={currentData} />
    </div>
  </section>;
}

function MeasuredDataPanel({ data, batchName }: { data: PredictionTimeline | null; batchName?: string }) {
  const latest = data?.history.at(-1);
  return <section className="pilot-panel pilot-measured-panel">
    <header className="pilot-panel-heading"><div><span><Activity size={15} /></span><div><h3>实测数据</h3><p>{batchName || '设备全部留存数据'}</p></div></div><b>{data ? `${data.displayedRecords} 条` : '--'}</b></header>
    {!data ? <div className="pilot-panel-empty">正在读取设备实测数据...</div> : !latest ? <div className="pilot-panel-empty">当前数据范围内没有可展示记录。</div> : <>
      <div className="pilot-measured-time"><span>最新采集时间</span><time>{dateTime(latest.timestamp)}</time></div>
      <div className="pilot-measured-list">{data.fields.map((field, index) => {
        const value = latest.quality === 'bad' ? null : latest.values[field.field];
        const status = referenceStatus(value, field);
        const history = data.history.filter((record) => record.quality !== 'bad').map((record) => record.values[field.field]).filter(Number.isFinite).slice(-48);
        return <article key={field.field} className={`pilot-measured-item is-${status}`}>
          <div><i style={{ background: palette[index % palette.length] }} /><span>{field.label}</span><small>{field.unit}</small></div>
          <strong>{number(value, field.decimals)}</strong>
          <svg viewBox="0 0 124 34" role="img" aria-label={`${field.label}最近变化`}><path d={miniPath(history)} fill="none" stroke={palette[index % palette.length]} strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg>
          <footer><span>参考 {number(field.normalMin, field.decimals)} - {number(field.normalMax, field.decimals)}</span><b>{status === 'normal' ? '范围内' : status === 'unknown' ? '不可判定' : status === 'high' ? '偏高' : '偏低'}</b></footer>
        </article>;
      })}</div>
    </>}
  </section>;
}

function PredictionChart({ data }: { data: PredictionTimeline | null }) {
  const stepCount = data ? Math.max(0, ...data.fields.map((field) => data.forecasts.filter((point) => point.field === field.field).length)) : 0;
  const [cursor, setCursor] = useState(Math.max(0, stepCount - 1));
  useEffect(() => setCursor(Math.max(0, stepCount - 1)), [data?.dataVersion, data?.deviceId, data?.batchId, stepCount]);
  if (!data) return <section className="pilot-panel pilot-forecast-panel"><div className="pilot-panel-empty">正在生成预测数据...</div></section>;
  if (!data.forecasts.length) return <section className="pilot-panel pilot-forecast-panel"><header className="pilot-panel-heading"><div><span><TrendingUp size={15} /></span><div><h3>预测数据</h3><p>{data.horizon}</p></div></div></header><div className="pilot-panel-empty">{data.forecastMessage || '有效连续数据不足，暂不能生成预测。'}</div></section>;

  const start = Date.parse(data.forecastOrigin!);
  const end = Math.max(...data.forecasts.map((point) => Date.parse(point.timestamp)));
  const width = 1000;
  const left = 126;
  const right = 24;
  const top = 34;
  const rowHeight = 72;
  const plotHeight = data.fields.length * rowHeight;
  const height = top + plotHeight + 42;
  const x = (time: number) => left + (time - start) / Math.max(1, end - start) * (width - left - right);
  const cursorTime = start + (end - start) * (cursor + 1) / Math.max(1, stepCount);
  const path = (points: Array<{ timestamp: string; predicted: number }>, y: (value: number) => number) => points.map((point, index) => `${index ? 'L' : 'M'}${x(Date.parse(point.timestamp)).toFixed(1)},${y(point.predicted).toFixed(1)}`).join(' ');
  const area = (points: Array<{ timestamp: string; lower: number; upper: number }>, y: (value: number) => number) => [
    ...points.map((point) => `${x(Date.parse(point.timestamp)).toFixed(1)},${y(point.upper).toFixed(1)}`),
    ...points.slice().reverse().map((point) => `${x(Date.parse(point.timestamp)).toFixed(1)},${y(point.lower).toFixed(1)}`),
  ].join(' ');

  return <section className="pilot-panel pilot-forecast-panel">
    <header className="pilot-panel-heading"><div><span><TrendingUp size={15} /></span><div><h3>预测数据</h3><p>{data.horizon} · {data.forecasts.length} 个指标预测点</p></div></div><b>{dateTime(data.generatedAt)}</b></header>
    <div className="pilot-forecast-legend"><span><i className="is-normal" />模型参考范围</span><span><i className="is-band" />预测误差带</span><span><i className="is-line" />预测中值</span><span><i className="is-alert" />持续越界</span></div>
    <div className="pilot-forecast-scroll" tabIndex={0}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="各指标长周期预测图">
        <rect x={left} y={top} width={width - left - right} height={plotHeight} fill="#fbfdfe" />
        {Array.from({ length: 6 }, (_, index) => {
          const time = start + (end - start) * index / 5;
          return <g key={index}><line x1={x(time)} x2={x(time)} y1={top} y2={top + plotHeight} stroke="#dce7ed" strokeDasharray="3 5" /><text x={x(time)} y={height - 14} textAnchor={index === 0 ? 'start' : index === 5 ? 'end' : 'middle'} className="pilot-chart-tick">{clock(time)}</text></g>;
        })}
        {data.fields.map((field, index) => {
          const points = data.forecasts.filter((point) => point.field === field.field);
          const values = points.flatMap((point) => [point.lower, point.upper, point.predicted, field.normalMin, field.normalMax]);
          const minimum = Math.min(...values);
          const maximum = Math.max(...values);
          const padding = Math.max((maximum - minimum) * 0.12, Math.abs(maximum) * 0.01, 0.001);
          const low = field.normalMin >= 0 ? Math.max(0, minimum - padding) : minimum - padding;
          const high = maximum + padding;
          const yTop = top + index * rowHeight + 8;
          const yBottom = top + (index + 1) * rowHeight - 10;
          const y = (value: number) => yBottom - (value - low) / Math.max(0.000001, high - low) * (yBottom - yTop);
          const color = palette[index % palette.length];
          return <g key={field.field}>
            <line x1={left} x2={width - right} y1={top + (index + 1) * rowHeight} y2={top + (index + 1) * rowHeight} stroke="#dbe6ec" />
            <rect x={left} y={y(field.normalMax)} width={width - left - right} height={Math.max(0, y(field.normalMin) - y(field.normalMax))} fill="#1b9b69" opacity=".1" />
            <line x1={left} x2={width - right} y1={y(field.normalMin)} y2={y(field.normalMin)} stroke="#2c8a63" strokeDasharray="3 4" />
            <line x1={left} x2={width - right} y1={y(field.normalMax)} y2={y(field.normalMax)} stroke="#2c8a63" strokeDasharray="3 4" />
            <text x="10" y={yTop + 14} fill={color} className="pilot-chart-label">{field.label}</text>
            <text x="10" y={yTop + 31} className="pilot-chart-tick">{field.unit}</text>
            <text x={left - 9} y={yTop + 4} textAnchor="end" className="pilot-chart-tick">{number(high, field.decimals)}</text>
            <text x={left - 9} y={yBottom + 3} textAnchor="end" className="pilot-chart-tick">{number(low, field.decimals)}</text>
            <polygon points={area(points, y)} fill={color} opacity=".1" />
            <path d={path(points, y)} fill="none" stroke={color} strokeWidth="2.1" vectorEffect="non-scaling-stroke" />
            {points.filter((point) => point.predicted < field.normalMin || point.predicted > field.normalMax).map((point) => <circle key={point.timestamp} cx={x(Date.parse(point.timestamp))} cy={y(point.predicted)} r="2.2" fill="#c62e3b" />)}
          </g>;
        })}
        <line x1={x(cursorTime)} x2={x(cursorTime)} y1={top} y2={top + plotHeight} stroke="#315f78" strokeWidth="1.2" />
      </svg>
    </div>
    <div className="pilot-forecast-cursor"><Clock3 size={14} /><input type="range" min={0} max={Math.max(0, stepCount - 1)} value={cursor} onChange={(event) => setCursor(Number(event.target.value))} /><time>{dateTime(new Date(cursorTime).toISOString())}</time></div>
    <div className="pilot-forecast-readout">{data.fields.map((field, index) => {
      const points = data.forecasts.filter((point) => point.field === field.field);
      const point = points[Math.min(cursor, points.length - 1)];
      const model = data.forecastModels.find((item) => item.field === field.field);
      const status = point ? referenceStatus(point.predicted, field) : 'unknown';
      return <article key={field.field}><i style={{ background: palette[index % palette.length] }} /><span>{field.label}</span><strong>{number(point?.predicted, field.decimals)} <small>{field.unit}</small></strong><b className={`is-${status}`}>{status === 'normal' ? '范围内' : status === 'high' ? '偏高' : status === 'low' ? '偏低' : '--'}</b><small>{methodLabels[model?.method || ''] || '待计算'}{model?.validationMae != null ? ` · MAE ${number(model.validationMae, field.decimals)}` : ''}</small></article>;
    })}</div>
    <footer className="pilot-forecast-note">预测模型按每项指标的滚动多步回测自动择优；误差带随预测距离扩大。参考范围用于趋势筛查，不替代设备保护定值。</footer>
  </section>;
}

function PredictionInsights({ data }: { data: PredictionTimeline | null }) {
  if (!data) return <aside className="pilot-insight-column"><section className="pilot-panel"><div className="pilot-panel-empty">正在形成预测结论...</div></section></aside>;
  const alerts = data.alerts || [];
  const primaryFaults = data.diagnosis.predictions.filter((item) => item.probability >= 0.24).slice(0, 3);
  const locations = [...new Set(alerts.map((alert) => alert.part))];
  return <aside className="pilot-insight-column">
    <section className={`pilot-panel pilot-conclusion-card is-${data.diagnosis.riskLevel}`}>
      <header><span><Sparkles size={16} /></span><div><h3>预测结论</h3><p>{riskLabels[data.diagnosis.riskLevel]}</p></div><strong>{data.diagnosis.healthScore}<small> / 100</small></strong></header>
      <p>{data.diagnosis.conclusion}</p>
      {primaryFaults.length > 0 && <div className="pilot-fault-list">{primaryFaults.map((fault) => <div key={fault.faultCode}><span>{fault.faultName}</span><b>{Math.round(fault.probability * 100)}%</b></div>)}</div>}
    </section>

    <section className="pilot-panel pilot-alert-card">
      <header className="pilot-insight-heading"><div><ShieldAlert size={16} /><h3>预警</h3></div><b>{alerts.length ? `${alerts.length} 项` : '无持续越界'}</b></header>
      {!alerts.length ? <div className="pilot-alert-clear"><CheckCircle2 size={22} /><div><strong>预测窗口内未触发预警</strong><p>未发现持续越过模型参考范围的趋势。</p></div></div> : <div className="pilot-alert-list">{alerts.map((alert) => <article key={alert.field} className={`is-${alert.severity}`}><AlertTriangle size={16} /><div><header><strong>{alert.label}{alert.direction === 'high' ? '偏高' : '偏低'}</strong><b>{alert.severity === 'critical' ? '高风险' : alert.severity === 'warning' ? '预警' : '关注'}</b></header><p>{dateTime(alert.firstAt)}起，预计持续约 {number(alert.durationMinutes, 1)} 分钟</p><small>峰值 {number(alert.peakValue)} {alert.unit} · 参考 {number(alert.normalMin)} - {number(alert.normalMax)} {alert.unit}</small></div></article>)}</div>}
    </section>

    <section className="pilot-panel pilot-location-card">
      <header className="pilot-insight-heading"><div><Crosshair size={16} /><h3>预警部位</h3></div><b>{locations.length} 处</b></header>
      {!locations.length ? <p className="pilot-location-empty">当前无需定位预警部位。</p> : <div className="pilot-location-list">{locations.map((location, index) => <div key={location}><span>{String(index + 1).padStart(2, '0')}</span><strong>{location}</strong></div>)}</div>}
    </section>
  </aside>;
}
