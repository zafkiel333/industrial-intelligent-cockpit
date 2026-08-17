// 2026-08-10 新增：轮询跨项目连接关系快照，并在页面切换后保留应用运行期的最后状态；
// 2026-08-10 调整：将用户可见错误改为设备资源协同状态描述；
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ModelRefreshResult,
  ModelShowcaseConnectionSnapshot,
  ModelShowcaseSceneId,
  ShowcaseApiErrorBody,
} from './types';
import { apiUrl } from '../integration/apiClient';

const CONNECTION_POLL_INTERVAL_MS = 10_000;
const connectionSnapshots = new Map<ModelShowcaseSceneId, ModelShowcaseConnectionSnapshot>();
const connectionRequests = new Map<ModelShowcaseSceneId, Promise<ModelShowcaseConnectionSnapshot>>();

async function requestConnection(sceneId: ModelShowcaseSceneId): Promise<ModelShowcaseConnectionSnapshot> {
  const existing = connectionRequests.get(sceneId);
  if (existing) return existing;

  const request = fetch(apiUrl(`model-showcase/${sceneId}/connection`), {
    headers: { Accept: 'application/json' },
  }).then(async (response) => {
    const body = await response.json().catch(() => ({})) as ShowcaseApiErrorBody & ModelShowcaseConnectionSnapshot;
    if (!response.ok) {
      throw new Error(body.error?.message || body.message || `资源协同状态获取失败（${response.status}）`);
    }
    connectionSnapshots.set(sceneId, body);
    return body;
  }).finally(() => connectionRequests.delete(sceneId));

  connectionRequests.set(sceneId, request);
  return request;
}

// 2026-08-12 新增：手动更新只调用本地 BFF，由后端完成限流、校验、持久化及旧版本保护；
async function requestModelRefresh(sceneId: ModelShowcaseSceneId): Promise<ModelRefreshResult> {
  const response = await fetch(apiUrl(`model-showcase/${sceneId}/model/refresh`), {
    method: 'POST',
    headers: { Accept: 'application/json' },
  });
  const body = await response.json().catch(() => ({})) as ShowcaseApiErrorBody & Partial<ModelRefreshResult>;
  if ((!response.ok && !body.modelRefresh) || !body.result || !body.message || !body.modelRefresh) {
    throw new Error(body.error?.message || body.message || `模型更新请求失败（${response.status}）`);
  }
  return body as ModelRefreshResult;
}

export function useModelShowcaseConnection(sceneId: ModelShowcaseSceneId) {
  const cachedAtRender = connectionSnapshots.get(sceneId) ?? null;
  const [snapshot, setSnapshot] = useState<ModelShowcaseConnectionSnapshot | null>(cachedAtRender);
  const [loading, setLoading] = useState(!cachedAtRender);
  const [refreshing, setRefreshing] = useState(false);
  const [modelRefreshing, setModelRefreshing] = useState(false);
  const [modelRefreshFeedback, setModelRefreshFeedback] = useState<ModelRefreshResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);
  const mounted = useRef(true);
  // 2026-08-10 新增：记录当前场景，防止快速切页时旧场景的异步响应覆盖新页面状态；
  const activeScene = useRef(sceneId);

  const refresh = useCallback(async (foreground = false) => {
    if (foreground && mounted.current) setRefreshing(true);
    try {
      const next = await requestConnection(sceneId);
      if (!mounted.current || activeScene.current !== sceneId) return;
      setSnapshot(next);
      setError(null);
    } catch (requestError) {
      if (!mounted.current || activeScene.current !== sceneId) return;
      setError(requestError instanceof Error ? requestError.message : '资源协同状态获取失败');
    } finally {
      if (mounted.current && activeScene.current === sceneId) {
        setLoading(false);
        setRefreshing(false);
        setLastCheckedAt(Date.now());
      }
    }
  }, [sceneId]);

  const refreshModel = useCallback(async () => {
    if (mounted.current) setModelRefreshing(true);
    try {
      const result = await requestModelRefresh(sceneId);
      if (!mounted.current || activeScene.current !== sceneId) return null;
      setModelRefreshFeedback(result);
      setSnapshot((current) => {
        if (!current) return current;
        const next = { ...current, modelRefresh: result.modelRefresh, generatedAt: new Date().toISOString() };
        connectionSnapshots.set(sceneId, next);
        return next;
      });
      setError(null);
      return result;
    } catch (requestError) {
      if (!mounted.current || activeScene.current !== sceneId) return null;
      setError(requestError instanceof Error ? requestError.message : '模型手动更新失败');
      return null;
    } finally {
      if (mounted.current && activeScene.current === sceneId) setModelRefreshing(false);
    }
  }, [sceneId]);

  useEffect(() => {
    mounted.current = true;
    activeScene.current = sceneId;
    const cached = connectionSnapshots.get(sceneId) ?? null;
    setSnapshot(cached);
    setLoading(!cached);
    setError(null);
    setModelRefreshFeedback(null);
    void refresh(false);
    return () => {
      mounted.current = false;
    };
  }, [sceneId, refresh]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh(false);
    }, CONNECTION_POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return {
    snapshot,
    loading,
    refreshing,
    modelRefreshing,
    modelRefreshFeedback,
    error,
    lastCheckedAt,
    refresh: () => refresh(true),
    refreshModel,
  };
}
