// 2026-07-13 新增：场景库测试方案 Phase 4.0 —— 通用真实数据拉取 hook。
// 参照 unit1-predictive 页面原有的 fetchData 逻辑抽出，供 Phase 4.1~4.10 的 10 个试点页面复用。
// 对接 server.ts 新增的 /api/scenarios/:scenarioId/data 通用接口。
import { useCallback, useEffect, useState } from 'react';

export interface ScenarioDataRow {
  time: string;
  [metric: string]: number | string;
}

interface ScenarioRealDataState {
  unifiedData: ScenarioDataRow[];
  historyDividerIndex: number;
  loading: boolean;
  error: string | null;
}

export function useScenarioRealData(scenarioId: string) {
  const [state, setState] = useState<ScenarioRealDataState>({
    unifiedData: [],
    historyDividerIndex: 0,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`/api/scenarios/${scenarioId}/data`);
      if (!res.ok) {
        let errText = '未能加载数据，可能暂无后端数据返回';
        try {
          const errData = await res.json();
          if (errData.error) errText = errData.error;
        } catch (e) {}
        throw new Error(errText);
      }
      const data = await res.json();
      if (data.isEmpty || !data.unifiedData || data.unifiedData.length === 0) {
        setState({ unifiedData: [], historyDividerIndex: 0, loading: false, error: null });
      } else {
        setState({
          unifiedData: data.unifiedData,
          historyDividerIndex: data.historyDividerIndex,
          loading: false,
          error: null,
        });
      }
    } catch (err: any) {
      setState((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  }, [scenarioId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clearData = useCallback(async () => {
    const res = await fetch(`/api/scenarios/${scenarioId}/upload/clear`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      await fetchData();
    }
    return data;
  }, [scenarioId, fetchData]);

  return { ...state, refetch: fetchData, clearData };
}
