import fs from 'node:fs';
import path from 'node:path';
import { LIFE_WARNING_SCENARIOS } from '../views/life-warning/shared/lifeWarningScenarioConfigs';

// 防止零部件寿命预警前十页退化为空页面、复制页面，或遗漏专属三维场景和业务字段。
const expectedIds = [
  'turbine-blade-erosion',
  'generator-insulation-aging',
  'transformer-bushing-life',
  'gate-hoist-rope-fatigue',
  'governor-servo-valve-wear',
  'intake-trash-rack-life',
  'spillway-gate-seal-aging',
  'excitation-system-module-life',
  'oil-pressure-vessel-fatigue',
  'cooling-pump-bearing-life',
] as const;

const errors: string[] = [];
const titles = new Set<string>();
const recommendations = new Set<string>();
const bases = new Set<string>();
const root = process.cwd();

for (const id of expectedIds) {
  const config = LIFE_WARNING_SCENARIOS[id];
  if (!config) {
    errors.push(`${id}: 缺少寿命预警业务配置`);
    continue;
  }

  if (config.id !== id) errors.push(`${id}: 配置 id 不一致`);
  if (config.kpis.length !== 4) errors.push(`${id}: KPI 必须为 4 项`);
  if (config.signals.length !== 4) errors.push(`${id}: 状态信号必须为 4 项`);
  if (config.mechanisms.length !== 3) errors.push(`${id}: 退化机理必须为 3 项`);
  if (config.thresholds.length !== 3) errors.push(`${id}: 三级预警阈值必须完整`);
  if (config.actions.length !== 4) errors.push(`${id}: 处置队列必须为 4 项`);
  if (config.trend.history.length < 5 || config.trend.forecast.length < 4) {
    errors.push(`${id}: 寿命趋势历史段或预测段数据不足`);
  }
  if (config.intelligence.inputs.length < 4) errors.push(`${id}: 智能模型输入不得少于 4 类`);
  if (!config.intelligence.constraint || !config.intelligence.benefit || !config.basis) {
    errors.push(`${id}: 缺少决策边界、收益或业务依据`);
  }

  if (titles.has(config.title)) errors.push(`${id}: 页面标题与其他场景重复`);
  titles.add(config.title);
  if (recommendations.has(config.intelligence.recommendation)) errors.push(`${id}: 智能建议与其他场景重复`);
  recommendations.add(config.intelligence.recommendation);
  if (bases.has(config.basis)) errors.push(`${id}: 业务依据与其他场景完全重复`);
  bases.add(config.basis);

  const viewPath = path.join(root, 'views', 'life-warning', id, 'View.tsx');
  const scenePath = path.join(root, 'components', 'life-warning', id, 'ThreeScene.tsx');
  if (!fs.existsSync(viewPath)) {
    errors.push(`${id}: 页面文件不存在`);
    continue;
  }
  if (!fs.existsSync(scenePath)) errors.push(`${id}: 专属三维场景不存在`);

  const source = fs.readFileSync(viewPath, 'utf8');
  if (!source.includes('LifeWarningWorkbench')) errors.push(`${id}: 未接入寿命管理工作台`);
  if (!source.includes(`LIFE_WARNING_SCENARIOS['${id}']`)) errors.push(`${id}: 页面绑定了错误的业务配置`);
  if (!source.includes(`/models/${id}`)) errors.push(`${id}: 模型库链接场景 id 不匹配`);
  if (!source.includes('<ThreeScene')) errors.push(`${id}: 未保留专属三维场景`);
  if (/bg-(?:slate|gray|zinc|neutral)-(?:900|950)|bg-black/.test(source)) {
    errors.push(`${id}: 页面层仍包含大面积深色背景类`);
  }
}

if (Object.keys(LIFE_WARNING_SCENARIOS).length !== expectedIds.length) {
  errors.push(`前十页配置数量异常：${Object.keys(LIFE_WARNING_SCENARIOS).length}`);
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(
  `LIFE_WARNING_REDESIGN_OK pages=${expectedIds.length} kpis=40 signals=40 mechanisms=30 thresholds=30 actions=40`,
);
