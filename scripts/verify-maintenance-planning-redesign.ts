import fs from 'node:fs';
import path from 'node:path';
import { MAINTENANCE_PLANNING_SCENARIOS } from '../views/Maintenance-plan-management/shared/planningScenarioConfigs';

// 2026-08-21 新增：防止维修计划前十页退化为空页面或复制后遗漏场景专属业务字段。
const expected = [
  ['mpm-0', 'HydroTurbineOverhaul/HydroTurbineOverhaulView.tsx'],
  ['mpm-1', 'SpillwayGateMaintenance/SpillwayGateMaintenanceView.tsx'],
  ['mpm-2', 'DamStructureReinforcement/DamStructureReinforcementView.tsx'],
  ['mpm-3', 'PenstockAntiCorrosion/PenstockAntiCorrosionView.tsx'],
  ['mpm-4', 'TransformerPreventive/TransformerPreventiveView.tsx'],
  ['mpm-5', 'PumpStationAnnual/PumpStationAnnualView.tsx'],
  ['mpm-6', 'ReservoirDesilting/ReservoirDesiltingView.tsx'],
  ['mpm-7', 'NavigationLockOverhaul/NavigationLockOverhaulView.tsx'],
  ['mpm-8', 'HydraulicHoistMaintenance/HydraulicHoistMaintenanceView.tsx'],
  ['mpm-9', 'TailraceTunnelInspection/TailraceTunnelInspectionView.tsx'],
] as const;

const errors: string[] = [];
const titles = new Set<string>();
const recommendations = new Set<string>();
const root = process.cwd();

for (const [id, relativeView] of expected) {
  const config = MAINTENANCE_PLANNING_SCENARIOS[id];
  if (!config) {
    errors.push(`${id}: 缺少业务配置`);
    continue;
  }

  if (config.id !== id) errors.push(`${id}: 配置 id 不一致`);
  if (config.kpis.length !== 4) errors.push(`${id}: KPI 必须为 4 项`);
  if (config.signals.length !== 4) errors.push(`${id}: 状态信号必须为 4 项`);
  if (config.stages.length < 5) errors.push(`${id}: 关键路径不得少于 5 个阶段`);
  if (config.risks.length < 3) errors.push(`${id}: 风险控制不得少于 3 项`);
  if (config.resources.length < 4) errors.push(`${id}: 资源准备度不得少于 4 项`);
  if (config.intelligence.inputs.length < 4) errors.push(`${id}: 智能模型输入不得少于 4 类`);
  if (!config.intelligence.constraint || !config.intelligence.benefit || !config.basis) {
    errors.push(`${id}: 缺少决策边界、收益或业务依据`);
  }

  if (titles.has(config.title)) errors.push(`${id}: 页面标题与其他场景重复`);
  titles.add(config.title);
  if (recommendations.has(config.intelligence.recommendation)) errors.push(`${id}: 智能建议与其他场景重复`);
  recommendations.add(config.intelligence.recommendation);

  const viewPath = path.join(root, 'views', 'Maintenance-plan-management', relativeView);
  if (!fs.existsSync(viewPath)) {
    errors.push(`${id}: 页面文件不存在 ${relativeView}`);
    continue;
  }
  const source = fs.readFileSync(viewPath, 'utf8');
  if (!source.includes('MaintenancePlanningWorkbench')) errors.push(`${id}: 未接入数字化维修计划工作台`);
  if (!source.includes(`MAINTENANCE_PLANNING_SCENARIOS['${id}']`)) errors.push(`${id}: 页面绑定了错误的业务配置`);
  if (!source.includes(`/models/${id}`)) errors.push(`${id}: 模型库链接场景 id 不匹配`);
  if (!source.includes('<ThreeScene')) errors.push(`${id}: 未保留三维场景`);
}

if (Object.keys(MAINTENANCE_PLANNING_SCENARIOS).length !== expected.length) {
  errors.push(`前十页配置数量异常：${Object.keys(MAINTENANCE_PLANNING_SCENARIOS).length}`);
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`MAINTENANCE_PLANNING_REDESIGN_OK pages=${expected.length} kpis=40 signals=40 stages=${expected.reduce((sum, [id]) => sum + MAINTENANCE_PLANNING_SCENARIOS[id].stages.length, 0)}`);
