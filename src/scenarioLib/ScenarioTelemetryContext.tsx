// 2026-07-09 新增：场景库测试方案 - 场景遥测上下文。
// 统一管理"端到端耗时面板"和"更新时间"两项展示所需的数据，并实现 mock/real 自动切换：
// - 无真实后端的页面：由 ScenarioMetaBar 自动测量"进入场景 -> 内容绘制完成"的耗时（口径：页面渲染耗时）。
// - 有真实后端的试点页面：页面内部调用 reportRealTiming，上报"数据传入 -> 全部更新完成"的真实耗时（口径：响应耗时），
//   一旦收到真实上报，该场景的展示会自动切换为真实数据，不需要改动信息条本身的逻辑。
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface ScenarioTelemetrySnapshot {
  isReal: boolean;
  updatedAt: number; // epoch ms，内容渲染 / 数据更新完成那一刻
  elapsedMs: number; // 耗时（ms）
}

interface ScenarioTelemetryContextValue {
  snapshots: Record<string, ScenarioTelemetrySnapshot>;
  reportMockTiming: (scenarioId: string, startAt: number, completeAt: number) => void;
  reportRealTiming: (scenarioId: string, dataInAt: number, allUpdatesCompleteAt: number) => void;
}

const ScenarioTelemetryContext = createContext<ScenarioTelemetryContextValue | null>(null);

export const ScenarioTelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snapshots, setSnapshots] = useState<Record<string, ScenarioTelemetrySnapshot>>({});

  const reportMockTiming = useCallback((scenarioId: string, startAt: number, completeAt: number) => {
    setSnapshots((prev) => ({
      ...prev,
      [scenarioId]: {
        isReal: false,
        updatedAt: completeAt,
        elapsedMs: Math.max(0, completeAt - startAt),
      },
    }));
  }, []);

  // 供 Phase 4 试点页面调用：真实数据到达并完成前端更新后上报，自动覆盖为真实口径
  const reportRealTiming = useCallback((scenarioId: string, dataInAt: number, allUpdatesCompleteAt: number) => {
    setSnapshots((prev) => ({
      ...prev,
      [scenarioId]: {
        isReal: true,
        updatedAt: allUpdatesCompleteAt,
        elapsedMs: Math.max(0, allUpdatesCompleteAt - dataInAt),
      },
    }));
  }, []);

  const value = useMemo(
    () => ({ snapshots, reportMockTiming, reportRealTiming }),
    [snapshots, reportMockTiming, reportRealTiming]
  );

  return <ScenarioTelemetryContext.Provider value={value}>{children}</ScenarioTelemetryContext.Provider>;
};

export const useScenarioTelemetry = (scenarioId: string) => {
  const ctx = useContext(ScenarioTelemetryContext);
  if (!ctx) {
    throw new Error('useScenarioTelemetry 必须在 ScenarioTelemetryProvider 内使用');
  }
  const { snapshots, reportMockTiming, reportRealTiming } = ctx;
  return {
    snapshot: snapshots[scenarioId],
    reportMockTiming,
    reportRealTiming,
  };
};
