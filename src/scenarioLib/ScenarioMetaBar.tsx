import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { Activity, ChevronDown, ChevronUp, Clock, Gauge, ScrollText, Tag } from 'lucide-react';
import { apiUrl } from '../integration/apiClient';
import { formatResponseDuration, subscribeTiming, timingSnapshot, type ResponseTiming } from '../remoteModelShowcase/responseTiming';
import { isModelShowcaseSceneId } from '../remoteModelShowcase/modelCatalog';
import { getScenarioMeta } from './scenarioRegistry';
import { useScenarioTelemetry } from './ScenarioTelemetryContext';
import { useScenarioLog, type ScenarioLogEntry, type ScenarioLogLevel } from './mockScenarioLog';

type BusinessLogLevel = ScenarioLogLevel | 'normal' | 'attention';
interface RemoteSceneLogEntry {
  id: string;
  timestamp: string;
  level: BusinessLogLevel;
  category: 'operation' | 'prediction' | 'verification';
  deviceId: string;
  caseId: string;
  content: string;
}
interface RemoteResponseTiming extends Omit<ResponseTiming, 'id' | 'end' | 'duration' | 'status'> {
  end: number;
  duration: number;
  status: 'completed' | 'failed' | 'cancelled';
  recordedAt: string;
}

const LOG_LEVEL_STYLE: Record<BusinessLogLevel, string> = {
  normal: 'is-normal', info: 'is-info', attention: 'is-attention', warning: 'is-warning', critical: 'is-critical',
};
const LOG_LEVEL_LABEL: Record<BusinessLogLevel, string> = {
  normal: '正常', info: '信息', attention: '关注', warning: '预警', critical: '严重预警',
};

function formatDateTime(epochMs: number, milliseconds = false): string {
  const d = new Date(epochMs);
  const pad = (value: number, width = 2) => value.toString().padStart(width, '0');
  const value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  return milliseconds ? `${value}.${pad(d.getMilliseconds(), 3)}` : value;
}

function responseStatus(status: ResponseTiming['status']) {
  if (status === 'running') return '处理中';
  if (status === 'failed') return '未完成';
  if (status === 'cancelled') return '计时已中止';
  return '已完成';
}

function SceneBusinessLog({entries}:{entries:Array<ScenarioLogEntry|RemoteSceneLogEntry>}) {
  return <div className="platform-log-panel scene-business-log" aria-label="场景日志">{entries.length?entries.map((entry,index)=>{
    const remote='timestamp' in entry,level=entry.level as BusinessLogLevel;
    return <div className={`platform-business-log-row ${LOG_LEVEL_STYLE[level]}`} key={remote?entry.id:`${entry.time}-${index}`}>
      <time>{remote?formatDateTime(Date.parse(entry.timestamp)):entry.time}</time><span className="platform-log-level">{LOG_LEVEL_LABEL[level]}</span>
      {remote&&<span className="platform-log-category">{{operation:'运行记录',prediction:'预测结果',verification:'实测核验'}[entry.category]}</span>}<p>{entry.content}</p>
    </div>;
  }):<div className="platform-log-empty">当前尚无运行、预测或实测核验记录</div>}</div>;
}

function SystemResponseLog({entries}:{entries:Array<ResponseTiming|RemoteResponseTiming>}) {
  return <div className="platform-log-panel system-response-log" aria-label="系统响应日志">{entries.length?entries.map(row=><article className={`system-response-operation is-${row.status}`} key={row.traceId} data-trace-id={row.traceId}>
    <header><div><Activity size={14}/><strong>{row.action}</strong>{row.context&&<small>{row.context}</small>}</div><span>{responseStatus(row.status)}</span></header>
    <div className="system-response-log-line is-start" data-log-kind="start"><time>{formatDateTime(row.start,true)}</time><b data-localization="preserve">T_start</b><code data-localization="preserve">{formatDateTime(row.start,true)}</code><span>响应计时开始</span></div>
    {row.end!==null&&<>
      <div className="system-response-log-line is-end" data-log-kind="end"><time>{formatDateTime(row.end,true)}</time><b data-localization="preserve">T_end</b><code data-localization="preserve">{formatDateTime(row.end,true)}</code><span>结果完成显示</span></div>
      <div className="system-response-log-line is-duration" data-log-kind="duration"><time>{formatDateTime(row.end,true)}</time><b data-localization="preserve">Δt</b><code data-localization="preserve">{formatResponseDuration(row.duration)}</code><span data-localization="preserve">T_end - T_start</span></div>
    </>}
  </article>):<div className="platform-log-empty">完成页面操作后，将在此记录开始时间、结束时间和响应时延</div>}</div>;
}

export const ScenarioMetaBar: React.FC<{ scenarioId: string }> = ({ scenarioId }) => {
  const meta = getScenarioMeta(scenarioId);
  const { snapshot, reportMockTiming } = useScenarioTelemetry(scenarioId);
  const staticLogEntries = useScenarioLog(scenarioId, meta.name);
  const timingRows = useSyncExternalStore(subscribeTiming, () => timingSnapshot(scenarioId), () => []);
  const [remoteSceneLogs, setRemoteSceneLogs] = useState<RemoteSceneLogEntry[]>([]);
  const [remoteResponseLogs, setRemoteResponseLogs] = useState<RemoteResponseTiming[]>([]);
  const [logOpen, setLogOpen] = useState(false);
  const [responseLogOpen, setResponseLogOpen] = useState(false);
  const supportsResponseLog = isModelShowcaseSceneId(scenarioId);
  const timingRevision = timingRows.map(row => `${row.traceId}:${row.status}:${row.end ?? ''}`).join('|');

  useEffect(() => {
    const startPerf = performance.now();
    const startEpoch = Date.now();
    const frame = requestAnimationFrame(() => {
      const elapsedMs = performance.now() - startPerf;
      reportMockTiming(scenarioId, startEpoch, startEpoch + elapsedMs);
    });
    return () => cancelAnimationFrame(frame);
  }, [scenarioId, reportMockTiming]);

  useEffect(() => {
    setLogOpen(false);
    setResponseLogOpen(false);
  }, [scenarioId]);

  useEffect(() => {
    if (!supportsResponseLog) {
      setRemoteSceneLogs([]);
      setRemoteResponseLogs([]);
      return;
    }
    const controller = new AbortController();
    const base = `model-showcase/${scenarioId}/data/forecast/logs`;
    void Promise.allSettled([
      fetch(apiUrl(`${base}/scene`), { signal: controller.signal }).then(async response => {
        if (!response.ok) throw new Error('scene log request failed');
        return (await response.json()) as { entries?: RemoteSceneLogEntry[] };
      }),
      fetch(apiUrl(`${base}/response`), { signal: controller.signal }).then(async response => {
        if (!response.ok) throw new Error('response log request failed');
        return (await response.json()) as { entries?: RemoteResponseTiming[] };
      }),
    ]).then(([sceneResult, responseResult]) => {
      if (controller.signal.aborted) return;
      if (sceneResult.status === 'fulfilled') setRemoteSceneLogs(sceneResult.value.entries || []);
      if (responseResult.status === 'fulfilled') setRemoteResponseLogs(responseResult.value.entries || []);
    });
    return () => controller.abort();
  }, [supportsResponseLog, timingRevision, scenarioId]);

  const sceneLogEntries = useMemo(() => supportsResponseLog ? remoteSceneLogs : staticLogEntries, [remoteSceneLogs, staticLogEntries, supportsResponseLog]);
  const responseLogs = useMemo(() => {
    const merged = new Map<string, ResponseTiming | RemoteResponseTiming>();
    for (const row of remoteResponseLogs) merged.set(row.traceId, row);
    for (const row of timingRows) merged.set(row.traceId, row);
    return [...merged.values()].sort((left, right) => (right.end ?? right.start) - (left.end ?? left.start));
  }, [remoteResponseLogs, timingRows]);

  const toggleSceneLog = () => {
    setLogOpen(value => !value);
    setResponseLogOpen(false);
  };
  const toggleResponseLog = () => {
    setResponseLogOpen(value => !value);
    setLogOpen(false);
  };

  return <SciFiCard className="platform-meta-bar mb-4" noPadding>
    <div className="platform-meta-summary">
      <div className="platform-meta-identity"><span>{meta.name}</span><small data-localization="preserve"><Tag size={10}/>{meta.id}</small></div>
      <div className="platform-meta-fact"><Clock size={14}/><span>更新时间</span><strong>{snapshot?formatDateTime(snapshot.updatedAt):'--'}</strong></div>
      <div className="platform-meta-fact"><Gauge size={14}/><span>端到端耗时</span><strong>{snapshot?`${snapshot.elapsedMs.toFixed(0)} ms`:'--'}</strong><small>页面渲染耗时</small></div>
      <div className="platform-log-actions">
        <button type="button" aria-expanded={logOpen} onClick={toggleSceneLog}><ScrollText size={14}/><span>场景日志（{sceneLogEntries.length}）</span>{logOpen?<ChevronUp size={14}/>:<ChevronDown size={14}/>}</button>
        {supportsResponseLog&&<button type="button" aria-expanded={responseLogOpen} onClick={toggleResponseLog}><Activity size={14}/><span>系统响应日志（{responseLogs.length}）</span>{responseLogOpen?<ChevronUp size={14}/>:<ChevronDown size={14}/>}</button>}
      </div>
    </div>
    {logOpen&&<SceneBusinessLog entries={sceneLogEntries}/>}
    {responseLogOpen&&<SystemResponseLog entries={responseLogs}/>}
  </SciFiCard>;
};
