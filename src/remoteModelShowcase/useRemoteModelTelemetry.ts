// 2026-08-09 新增：统一管理外部模型初始化、轮询、工况切换、历史趋势和诊断请求；
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ConsistencyResult,
  DiagnosisResult,
  ModelShowcaseBootstrap,
  ModelShowcaseSceneId,
  RemoteBindableField,
  RemoteDashboardData,
  RemoteDataMode,
  RemoteScenarioType,
  ShowcaseApiErrorBody,
  TelemetryHistoryPoint,
} from './types';

const POLL_INTERVAL_MS = 5_000;
const HISTORY_LIMIT = 60;

interface SceneRuntimeCache {
  bootstrap: ModelShowcaseBootstrap | null;
  dashboard: RemoteDashboardData | null;
  history: TelemetryHistoryPoint[];
  diagnosis: DiagnosisResult | null;
  consistency: ConsistencyResult | null;
  mode: RemoteDataMode;
  error: string | null;
  lastSuccessAt: number | null;
  lastCheckedAt: number | null;
  dashboardSignature: string | null;
}

// 2026-08-09 修复：按场景保留应用运行期数据，切页先展示旧值并同步请求最新数据；
// Module-level cache: it survives page unmount/remount and is released only
// when the browser application itself stops or reloads.
const sceneRuntimeCaches = new Map<ModelShowcaseSceneId, SceneRuntimeCache>();
const bootstrapRequests = new Map<ModelShowcaseSceneId, Promise<SceneRuntimeCache>>();
const telemetryRequestVersions = new Map<ModelShowcaseSceneId, number>();
const diagnosisRequestVersions = new Map<ModelShowcaseSceneId, number>();

function createRuntimeCache(): SceneRuntimeCache {
  return {
    bootstrap: null,
    dashboard: null,
    history: [],
    diagnosis: null,
    consistency: null,
    mode: 'dashboard',
    error: null,
    lastSuccessAt: null,
    lastCheckedAt: null,
    dashboardSignature: null,
  };
}

function getRuntimeCache(sceneId: ModelShowcaseSceneId): SceneRuntimeCache {
  const cached = sceneRuntimeCaches.get(sceneId);
  if (cached) return cached;
  const created = createRuntimeCache();
  sceneRuntimeCaches.set(sceneId, created);
  return created;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '数据请求失败';
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json().catch(() => ({})) as ShowcaseApiErrorBody & T
    : {} as ShowcaseApiErrorBody & T;
  if (!response.ok) {
    throw new Error(body.error?.message || body.message || `请求失败（${response.status}）`);
  }
  if (!contentType.includes('application/json')) {
    throw new Error('本地模型接口未返回 JSON，请确认后端服务已重启并加载最新路由');
  }
  return body;
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function materializeRangeFields(fields: RemoteBindableField[], phase: number): RemoteBindableField[] {
  return fields.map((field, index) => {
    if (finite(field.value)) return { ...field, value_source: field.value_source || 'api' };
    const min = finite(field.normal_min) ? field.normal_min : 0;
    const max = finite(field.normal_max) ? field.normal_max : min + 1;
    const center = finite(field.base_value) ? field.base_value : (min + max) / 2;
    const amplitude = Math.max((max - min) * 0.08, Math.abs(center) * 0.01, 0.01);
    const value = Math.min(max, Math.max(min, center + Math.sin(phase / 7 + index * 0.91) * amplitude));
    return {
      ...field,
      value: Number(value.toFixed(3)),
      abnormal: false,
      trend: Math.cos(phase / 7 + index * 0.91) > 0.1 ? 'up' : 'down',
      value_source: 'range-simulated',
    };
  });
}

function snapshotFromFields(fields: RemoteBindableField[], time: number): TelemetryHistoryPoint {
  return {
    time,
    label: new Date(time).toLocaleTimeString('zh-CN', { hour12: false }),
    values: Object.fromEntries(fields.filter((field) => finite(field.value)).map((field) => [field.field, field.value])),
  };
}

function extractTimeSeries(payload: RemoteDashboardData): TelemetryHistoryPoint[] {
  const loose = payload as RemoteDashboardData & Record<string, unknown>;
  const candidate = [loose.time_series, loose.telemetry_history, loose.history].find(Array.isArray) as unknown[] | undefined;
  if (!candidate) return [];
  return candidate
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      const timeValue = row.timestamp ?? row.time ?? row.recorded_at ?? row.datetime;
      const time = typeof timeValue === 'number' ? timeValue : Date.parse(String(timeValue || ''));
      if (!Number.isFinite(time)) return null;
      const valuesObject = row.values && typeof row.values === 'object' ? row.values as Record<string, unknown> : row;
      const values = Object.fromEntries(
        Object.entries(valuesObject).filter(([, value]) => finite(value)) as Array<[string, number]>,
      );
      return { time, label: new Date(time).toLocaleTimeString('zh-CN', { hour12: false }), values };
    })
    .filter((item): item is TelemetryHistoryPoint => Boolean(item))
    .sort((a, b) => a.time - b.time);
}

function mergeHistory(previous: TelemetryHistoryPoint[], incoming: TelemetryHistoryPoint[]): TelemetryHistoryPoint[] {
  const merged = new Map<number, TelemetryHistoryPoint>();
  [...previous, ...incoming].forEach((point) => merged.set(point.time, point));
  return Array.from(merged.values()).sort((a, b) => a.time - b.time).slice(-HISTORY_LIMIT);
}

function signatureForDashboard(dashboard: RemoteDashboardData): string {
  return JSON.stringify({
    scenario: dashboard.scenario || 'dashboard',
    sync: dashboard.twin_status?.last_sync || null,
    status: dashboard.twin_status?.status || null,
    fields: dashboard.bindable_fields.map((field) => [field.field, field.value, field.abnormal, field.trend]),
  });
}

function storeDashboard(sceneId: ModelShowcaseSceneId, next: RemoteDashboardData): { cache: SceneRuntimeCache; changed: boolean } {
  if (!next || !Array.isArray(next.bindable_fields)) {
    throw new Error('模型数据接口返回结构不完整');
  }
  const cache = getRuntimeCache(sceneId);
  const now = Date.now();
  const fields = materializeRangeFields(next.bindable_fields, now / 1_000);
  const materialized = { ...next, bindable_fields: fields };
  const signature = signatureForDashboard(materialized);
  cache.lastCheckedAt = now;
  cache.error = null;

  if (cache.dashboard && cache.dashboardSignature === signature) {
    return { cache, changed: false };
  }

  const series = extractTimeSeries(materialized);
  cache.dashboard = materialized;
  cache.dashboardSignature = signature;
  cache.history = mergeHistory(cache.history, series.length ? series : [snapshotFromFields(fields, now)]);
  cache.lastSuccessAt = now;
  return { cache, changed: true };
}

function loadBootstrap(sceneId: ModelShowcaseSceneId): Promise<SceneRuntimeCache> {
  const existing = bootstrapRequests.get(sceneId);
  if (existing) return existing;

  const request = requestJson<ModelShowcaseBootstrap>(`/api/model-showcase/${sceneId}/bootstrap`)
    .then((result) => {
      if (!result?.model || !result.dashboard) throw new Error('模型初始化接口返回结构不完整');
      const stored = storeDashboard(sceneId, result.dashboard).cache;
      stored.bootstrap = { ...result, dashboard: stored.dashboard! };
      return stored;
    })
    .catch((error) => {
      const cache = getRuntimeCache(sceneId);
      cache.error = errorMessage(error);
      cache.lastCheckedAt = Date.now();
      throw error;
    })
    .finally(() => bootstrapRequests.delete(sceneId));
  bootstrapRequests.set(sceneId, request);
  return request;
}

export function useRemoteModelTelemetry(sceneId: ModelShowcaseSceneId) {
  const runtimeAtRender = getRuntimeCache(sceneId);
  const [bootstrap, setBootstrap] = useState<ModelShowcaseBootstrap | null>(() => runtimeAtRender.bootstrap);
  const [dashboard, setDashboard] = useState<RemoteDashboardData | null>(() => runtimeAtRender.dashboard);
  const [history, setHistory] = useState<TelemetryHistoryPoint[]>(() => runtimeAtRender.history);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(() => runtimeAtRender.diagnosis);
  const [consistency, setConsistency] = useState<ConsistencyResult | null>(() => runtimeAtRender.consistency);
  const [mode, setModeState] = useState<RemoteDataMode>(() => runtimeAtRender.mode);
  const [initialLoading, setInitialLoading] = useState(!runtimeAtRender.bootstrap || !runtimeAtRender.dashboard);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(() => runtimeAtRender.error);
  const [lastSuccessAt, setLastSuccessAt] = useState<number | null>(() => runtimeAtRender.lastSuccessAt);
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(() => runtimeAtRender.lastCheckedAt);
  const mounted = useRef(true);

  const hydrateFromRuntime = useCallback((cache: SceneRuntimeCache) => {
    if (!mounted.current) return;
    setBootstrap(cache.bootstrap);
    setDashboard(cache.dashboard);
    setHistory(cache.history);
    setDiagnosis(cache.diagnosis);
    setConsistency(cache.consistency);
    setModeState(cache.mode);
    setError(cache.error);
    setLastSuccessAt(cache.lastSuccessAt);
    setLastCheckedAt(cache.lastCheckedAt);
  }, []);

  const loadDiagnosis = useCallback(async () => {
    const version = (diagnosisRequestVersions.get(sceneId) || 0) + 1;
    diagnosisRequestVersions.set(sceneId, version);
    try {
      const result = await requestJson<DiagnosisResult>(`/api/model-showcase/${sceneId}/diagnosis`, {
        method: 'POST',
        body: '{}',
      });
      if (diagnosisRequestVersions.get(sceneId) !== version) return;
      const cache = getRuntimeCache(sceneId);
      cache.diagnosis = result;
      if (mounted.current) setDiagnosis(result);
    } catch (diagnosisError) {
      console.warn('[model-showcase] diagnosis unavailable:', diagnosisError);
    }
  }, [sceneId]);

  const refresh = useCallback(async (requestedMode: RemoteDataMode, foreground = false) => {
    const version = (telemetryRequestVersions.get(sceneId) || 0) + 1;
    telemetryRequestVersions.set(sceneId, version);
    if (foreground && mounted.current) setRefreshing(true);
    try {
      const endpoint = requestedMode === 'dashboard'
        ? `/api/model-showcase/${sceneId}/dashboard`
        : `/api/model-showcase/${sceneId}/scenario/${requestedMode}`;
      const next = await requestJson<RemoteDashboardData>(endpoint, requestedMode === 'dashboard'
        ? undefined
        : { method: 'POST', body: '{}' });
      if (telemetryRequestVersions.get(sceneId) !== version) return;
      const cache = storeDashboard(sceneId, next).cache;
      cache.mode = requestedMode;
      hydrateFromRuntime(cache);
      void loadDiagnosis();
    } catch (refreshError) {
      if (telemetryRequestVersions.get(sceneId) !== version) return;
      const cache = getRuntimeCache(sceneId);
      cache.error = errorMessage(refreshError);
      cache.lastCheckedAt = Date.now();
      hydrateFromRuntime(cache);
    } finally {
      if (foreground && mounted.current && telemetryRequestVersions.get(sceneId) === version) setRefreshing(false);
    }
  }, [hydrateFromRuntime, loadDiagnosis, sceneId]);

  useEffect(() => {
    mounted.current = true;
    const cached = getRuntimeCache(sceneId);
    hydrateFromRuntime(cached);

    if (cached.bootstrap && cached.dashboard) {
      setInitialLoading(false);
      // Show cached data immediately, then check for newer data in parallel.
      void refresh(cached.mode, false);
    } else {
      setInitialLoading(true);
      void loadBootstrap(sceneId)
        .then((loaded) => {
          hydrateFromRuntime(loaded);
          void loadDiagnosis();
        })
        .catch(() => hydrateFromRuntime(getRuntimeCache(sceneId)))
        .finally(() => {
          if (mounted.current) setInitialLoading(false);
        });
    }

    return () => {
      mounted.current = false;
    };
  }, [hydrateFromRuntime, loadDiagnosis, refresh, sceneId]);

  useEffect(() => {
    if (!bootstrap) return;
    const poll = () => {
      if (document.visibilityState === 'visible') void refresh(mode, false);
    };
    const timer = window.setInterval(poll, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [bootstrap, mode, refresh]);

  const setMode = useCallback((nextMode: RemoteDataMode) => {
    const cache = getRuntimeCache(sceneId);
    cache.mode = nextMode;
    cache.consistency = null;
    setModeState(nextMode);
    setConsistency(null);
    void refresh(nextMode, true);
  }, [refresh, sceneId]);

  const validateConsistency = useCallback(async () => {
    if (!dashboard) return;
    setSyncing(true);
    try {
      const scenario: RemoteScenarioType = mode === 'dashboard' ? 'normal' : mode;
      const result = await requestJson<ConsistencyResult>(`/api/model-showcase/${sceneId}/data-sync`, {
        method: 'POST',
        body: JSON.stringify({
          scenario,
          actual_values: Object.fromEntries(dashboard.bindable_fields.map((field) => [field.field, field.value])),
        }),
      });
      const cache = getRuntimeCache(sceneId);
      cache.consistency = result;
      if (mounted.current) setConsistency(result);
    } catch (syncError) {
      const cache = getRuntimeCache(sceneId);
      cache.error = errorMessage(syncError);
      cache.lastCheckedAt = Date.now();
      hydrateFromRuntime(cache);
    } finally {
      if (mounted.current) setSyncing(false);
    }
  }, [dashboard, hydrateFromRuntime, mode, sceneId]);

  const hasRangeSimulation = useMemo(
    () => dashboard?.bindable_fields.some((field) => field.value_source === 'range-simulated') || false,
    [dashboard],
  );

  return {
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
    setMode,
    refresh: () => refresh(mode, true),
    validateConsistency,
  };
}
