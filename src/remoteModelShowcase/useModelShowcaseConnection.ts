// 2026-08-10 新增：轮询跨项目连接关系快照，并在页面切换后保留应用运行期的最后状态；
// 2026-08-10 调整：将用户可见错误改为设备资源协同状态描述；
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ModelShowcaseConnectionSnapshot, ModelShowcaseSceneId, ShowcaseApiErrorBody } from './types';

const CONNECTION_POLL_INTERVAL_MS = 10_000;
const connectionSnapshots = new Map<ModelShowcaseSceneId, ModelShowcaseConnectionSnapshot>();
const connectionRequests = new Map<ModelShowcaseSceneId, Promise<ModelShowcaseConnectionSnapshot>>();

async function requestConnection(sceneId: ModelShowcaseSceneId): Promise<ModelShowcaseConnectionSnapshot> {
  const existing = connectionRequests.get(sceneId);
  if (existing) return existing;

  const request = fetch(`/api/model-showcase/${sceneId}/connection`, {
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

export function useModelShowcaseConnection(sceneId: ModelShowcaseSceneId) {
  const cachedAtRender = connectionSnapshots.get(sceneId) ?? null;
  const [snapshot, setSnapshot] = useState<ModelShowcaseConnectionSnapshot | null>(cachedAtRender);
  const [loading, setLoading] = useState(!cachedAtRender);
  const [refreshing, setRefreshing] = useState(false);
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

  useEffect(() => {
    mounted.current = true;
    activeScene.current = sceneId;
    const cached = connectionSnapshots.get(sceneId) ?? null;
    setSnapshot(cached);
    setLoading(!cached);
    setError(null);
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
    error,
    lastCheckedAt,
    refresh: () => refresh(true),
  };
}
