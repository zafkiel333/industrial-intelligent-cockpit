// 2026-07-09 新增：场景库测试方案 - 场景工况日志模拟生成器。
// 注意：这里生成的是"场景/设备工况日志"（巡检、告警、状态变化等），不是代码修改日志；
// 代码修改记录见仓库根目录 `场景库测试方案/修改日志.md`。
//
// 替换为真实日志源时该怎么改：
// 把 useScenarioLog(scenarioId) 内部的 generateMockScenarioLog(...) 调用，
// 换成对真实日志接口/数据库的查询，返回值需满足 ScenarioLogEntry[]（{ time, level, content }[]）结构，
// ScenarioMetaBar 等消费方的展示逻辑不需要任何改动。
import { useMemo } from 'react';

export type ScenarioLogLevel = 'info' | 'warning' | 'critical';

export interface ScenarioLogEntry {
  time: string; // 人类可读时间，如 2026-07-09 08:12
  level: ScenarioLogLevel;
  content: string;
}

// 常规运维日志措辞模板，按场景名称拼接，贴近真实巡检/监测日志的语气
const INFO_TEMPLATES = [
  (name: string) => `例行巡检完成，${name}运行参数正常`,
  (name: string) => `${name}状态自检通过，未发现异常`,
  (name: string) => `${name}运行数据已同步至监测平台`,
  (name: string) => `完成${name}例行保养记录登记`,
  (name: string) => `${name}关键指标处于正常波动范围`,
];
const WARNING_TEMPLATES = [
  (name: string) => `${name}监测值短暂超出预警阈值，已自动记录并持续观察`,
  (name: string) => `${name}通信链路短暂中断，已自动重连`,
  (name: string) => `${name}检测到轻微异常波动，建议下次巡检重点关注`,
];
const CRITICAL_TEMPLATES = [
  (name: string) => `${name}触发告警阈值，已生成工单并通知运维人员`,
  (name: string) => `${name}关键部件状态异常，建议尽快安排检修`,
];

// 简单的字符串哈希 + mulberry32，保证同一个场景每次生成的模拟日志一致（不会每次刷新都乱跳）
const hashSeed = (input: string): number => {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
};

const mulberry32 = (seed: number) => {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const formatTime = (d: Date): string => {
  const p = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const generateMockScenarioLog = (scenarioId: string, scenarioName: string, entryCount = 8): ScenarioLogEntry[] => {
  const rand = mulberry32(hashSeed(scenarioId));
  const now = Date.now();
  const entries: ScenarioLogEntry[] = [];

  for (let i = 0; i < entryCount; i++) {
    const minutesAgo = Math.floor(rand() * 60 * 48) + i * 15; // 分布在最近约 48 小时内，按时间倒序
    const roll = rand();
    let level: ScenarioLogLevel = 'info';
    let templates = INFO_TEMPLATES;
    if (roll > 0.93) {
      level = 'critical';
      templates = CRITICAL_TEMPLATES;
    } else if (roll > 0.75) {
      level = 'warning';
      templates = WARNING_TEMPLATES;
    }
    const template = templates[Math.floor(rand() * templates.length)];
    entries.push({
      time: formatTime(new Date(now - minutesAgo * 60 * 1000)),
      level,
      content: template(scenarioName),
    });
  }

  return entries.sort((a, b) => (a.time < b.time ? 1 : -1));
};

export const useScenarioLog = (scenarioId: string, scenarioName: string): ScenarioLogEntry[] => {
  return useMemo(() => generateMockScenarioLog(scenarioId, scenarioName), [scenarioId, scenarioName]);
};
