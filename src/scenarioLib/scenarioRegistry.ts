// 2026-07-09 新增：场景库测试方案 - 场景注册表。
// 从 constants.tsx 的 MENU_ITEMS 派生出一份扁平的场景元数据表，
// 供全局场景信息条（ScenarioMetaBar）和场景导出按钮共用，避免重复遍历导航结构。
import { MENU_ITEMS } from '../../constants';
import type { MenuItem } from '../../types';

export interface ScenarioRegistryEntry {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
}

export interface ScenarioCategorySummary {
  categoryId: string;
  categoryName: string;
  sceneCount: number;
}

const buildRegistry = (): ScenarioRegistryEntry[] => {
  const entries: ScenarioRegistryEntry[] = [];

  MENU_ITEMS.forEach((category: MenuItem) => {
    // 分类自身也是一个可进入的页面（多数分类点击后展示分类总览页），一并注册
    entries.push({
      id: category.id,
      name: category.label,
      categoryId: category.id,
      categoryName: category.label,
    });

    (category.children || []).forEach((child: MenuItem) => {
      entries.push({
        id: child.id,
        name: child.label,
        categoryId: category.id,
        categoryName: category.label,
      });
    });
  });

  return entries;
};

export const SCENARIO_REGISTRY: ScenarioRegistryEntry[] = buildRegistry();

const REGISTRY_BY_ID: Map<string, ScenarioRegistryEntry> = new Map(
  SCENARIO_REGISTRY.map((entry) => [entry.id, entry])
);

// 找不到时给一个兜底展示值，避免信息条因未知 id（比如个别历史遗留的动态拼接 id）报错或留白
export const getScenarioMeta = (scenarioId: string): ScenarioRegistryEntry => {
  return (
    REGISTRY_BY_ID.get(scenarioId) || {
      id: scenarioId,
      name: scenarioId,
      categoryId: 'unknown',
      categoryName: '未分类',
    }
  );
};

export const getCategorySummaries = (): ScenarioCategorySummary[] => {
  return MENU_ITEMS.map((category: MenuItem) => ({
    categoryId: category.id,
    categoryName: category.label,
    sceneCount: (category.children || []).length,
  }));
};

export const getTotalSceneCount = (): number => {
  return MENU_ITEMS.reduce((sum, category: MenuItem) => sum + (category.children || []).length, 0);
};
