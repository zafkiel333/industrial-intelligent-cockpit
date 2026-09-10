// 2026-08-09 新增：集中维护外部模型场景、指标映射、图表分组和故障知识；
import { PAGE_MODEL_BINDINGS } from './pageModelBindings';
import type { PageModelBinding } from './pageModelBindings';
import { getModelOperationalProfile } from './modelOperationalProfiles';
import type { ExistingModelShowcaseSceneId, ModelShowcaseSceneId, RiskDirection } from './types';

export interface ShowcaseFieldConfig {
  label: string;
  riskDirection: RiskDirection;
  weight: number;
}

export interface ShowcaseFaultProfile {
  code: string;
  name: string;
  fields: string[];
  recommendation: string;
}

export interface ShowcaseChartGroup {
  title: string;
  fields: string[];
}

export interface ModelShowcaseConfig {
  sceneId: ModelShowcaseSceneId;
  modelId: number;
  title: string;
  englishTitle: string;
  description: string;
  expectedRemoteName: string;
  sourceAssetLabel: string;
  // 2026-08-10 新增：固定来源模型人工追溯地址，不允许前端拼接或接收任意外部 URL；
  sourceDetailUrl: string;
  domain: 'hydro' | 'pump' | 'crane' | 'vehicle' | 'industrial';
  accent: string;
  fields: Record<string, ShowcaseFieldConfig>;
  chartGroups: ShowcaseChartGroup[];
  faultProfiles: ShowcaseFaultProfile[];
  viewer: {
    rotation?: [number, number, number];
    offset?: [number, number, number];
    autoRotateSpeed: number;
  };
}

const EXISTING_MODEL_SHOWCASE_CATALOG: Record<ExistingModelShowcaseSceneId, ModelShowcaseConfig> = {
  'sim-visual-hydro-turbine': {
    sceneId: 'sim-visual-hydro-turbine',
    modelId: 2326,
    title: '水轮机多工况数字孪生分析',
    englishTitle: 'Hydro Turbine Multi-condition Digital Twin Analysis',
    description: '融合转速、温度、振动、水压、流量与功率数据，呈现水轮机组运行状态和智能诊断结论。',
    expectedRemoteName: '水轮机总成',
    sourceAssetLabel: '远端模型：水轮机总成',
    sourceDetailUrl: 'https://8.146.211.204:3100/three-model/detail?id=2326',
    domain: 'hydro',
    accent: '#22d3ee',
    fields: {
      rpm: { label: '转速', riskDirection: 'high', weight: 0.12 },
      temperature: { label: '轴承温度', riskDirection: 'high', weight: 0.2 },
      vibration: { label: '主轴振动', riskDirection: 'high', weight: 0.25 },
      pressure: { label: '水压', riskDirection: 'both', weight: 0.14 },
      flow_rate: { label: '流量', riskDirection: 'both', weight: 0.12 },
      power_output: { label: '输出功率', riskDirection: 'both', weight: 0.17 },
    },
    chartGroups: [
      { title: '转速 / 输出功率', fields: ['rpm', 'power_output'] },
      { title: '水压 / 流量', fields: ['pressure', 'flow_rate'] },
      { title: '温度 / 振动', fields: ['temperature', 'vibration'] },
    ],
    faultProfiles: [
      { code: 'SHAFT_IMBALANCE', name: '轴系不平衡风险', fields: ['vibration', 'rpm'], recommendation: '复核主轴振动频谱、联轴器同轴度和转轮动平衡状态。' },
      { code: 'BEARING_OVERHEAT', name: '轴承温升异常', fields: ['temperature', 'vibration'], recommendation: '检查轴承润滑、冷却回路与推力瓦温度分布。' },
      { code: 'HYDRAULIC_INSTABILITY', name: '水力工况失稳', fields: ['pressure', 'flow_rate', 'vibration'], recommendation: '核对导叶开度与流量匹配，排查空化和压力脉动。' },
      { code: 'POWER_DEGRADATION', name: '机组出力衰减', fields: ['power_output', 'flow_rate', 'rpm'], recommendation: '检查水头、流量利用率及发电机负荷响应。' },
    ],
    viewer: { autoRotateSpeed: 0.45 },
  },
  'sim-visual-wastewater-pump': {
    sceneId: 'sim-visual-wastewater-pump',
    modelId: 2328,
    title: '污水泵运行效能与故障分析',
    englishTitle: 'Wastewater Pump Efficiency & Fault Analysis',
    description: '围绕压力、流量、功率、温升与振动关系，评估污水泵运行效能并输出潜在故障结论。',
    expectedRemoteName: '污水泵KCM100HD',
    sourceAssetLabel: '远端模型：污水泵 KCM100HD',
    sourceDetailUrl: 'https://8.146.211.204:3100/three-model/detail?id=2328',
    domain: 'pump',
    accent: '#38bdf8',
    fields: {
      rpm: { label: '转速', riskDirection: 'high', weight: 0.1 },
      temperature: { label: '泵体温度', riskDirection: 'high', weight: 0.2 },
      vibration: { label: '泵体振动', riskDirection: 'high', weight: 0.24 },
      pressure: { label: '出口压力', riskDirection: 'both', weight: 0.16 },
      flow_rate: { label: '流量', riskDirection: 'both', weight: 0.15 },
      power_output: { label: '功率', riskDirection: 'high', weight: 0.15 },
    },
    chartGroups: [
      { title: '出口压力 / 流量', fields: ['pressure', 'flow_rate'] },
      { title: '功率 / 流量效能', fields: ['power_output', 'flow_rate'] },
      { title: '温度 / 振动', fields: ['temperature', 'vibration'] },
    ],
    faultProfiles: [
      { code: 'PUMP_CAVITATION', name: '泵体气蚀风险', fields: ['vibration', 'pressure', 'flow_rate'], recommendation: '检查入口液位、吸入管路阻力和叶轮气蚀痕迹。' },
      { code: 'PUMP_BLOCKAGE', name: '进口或叶轮堵塞', fields: ['flow_rate', 'pressure', 'power_output'], recommendation: '检查格栅、吸入口及叶轮流道是否存在杂物沉积。' },
      { code: 'PUMP_BEARING_SEAL', name: '轴承与密封异常', fields: ['temperature', 'vibration'], recommendation: '检查轴承润滑、机械密封泄漏和轴系对中。' },
      { code: 'MOTOR_OVERLOAD', name: '驱动电机过载', fields: ['power_output', 'temperature', 'rpm'], recommendation: '核对电机负载、电流和泵工况点，避免长期偏离高效区。' },
    ],
    viewer: { autoRotateSpeed: 0.5 },
  },
  'sim-visual-bridge-crane': {
    sceneId: 'sim-visual-bridge-crane',
    modelId: 2316,
    title: '桥式起重机载荷安全数字孪生分析',
    englishTitle: 'Bridge Crane Load Safety Digital Twin',
    description: '利用载荷、小车位置、运行速度、电机温度与振动数据，评估吊运安全和驱动系统状态。',
    expectedRemoteName: '桥式起重机',
    sourceAssetLabel: '远端模型：桥式起重机',
    sourceDetailUrl: 'https://8.146.211.204:3100/three-model/detail?id=2316',
    domain: 'crane',
    accent: '#f59e0b',
    fields: {
      load_weight: { label: '负载重量', riskDirection: 'high', weight: 0.28 },
      trolley_position: { label: '小车位置', riskDirection: 'both', weight: 0.08 },
      crane_speed: { label: '运行速度', riskDirection: 'high', weight: 0.2 },
      motor_temperature: { label: '电机温度', riskDirection: 'high', weight: 0.22 },
      vibration: { label: '结构振动', riskDirection: 'high', weight: 0.22 },
    },
    chartGroups: [
      { title: '负载 / 运行速度', fields: ['load_weight', 'crane_speed'] },
      { title: '小车位置轨迹', fields: ['trolley_position'] },
      { title: '电机温度 / 振动', fields: ['motor_temperature', 'vibration'] },
    ],
    faultProfiles: [
      { code: 'CRANE_OVERLOAD', name: '起升超载风险', fields: ['load_weight', 'crane_speed'], recommendation: '核对吊物重量、限载保护和起升速度，必要时中止吊运。' },
      { code: 'DRIVE_OVERHEAT', name: '驱动电机过热', fields: ['motor_temperature', 'crane_speed'], recommendation: '检查电机散热、制动间隙和频繁启停工况。' },
      { code: 'STRUCTURAL_VIBRATION', name: '桥架或轨道振动异常', fields: ['vibration', 'load_weight', 'trolley_position'], recommendation: '检查轨道接头、车轮啃轨、桥架连接和载荷摆动。' },
      { code: 'TROLLEY_POSITIONING', name: '小车定位与冲击风险', fields: ['trolley_position', 'crane_speed'], recommendation: '检查小车限位、编码器和减速制动控制。' },
    ],
    viewer: { autoRotateSpeed: 0.32 },
  },
  'sim-visual-haul-truck': {
    sceneId: 'sim-visual-haul-truck',
    modelId: 2310,
    title: '矿卡牵引运输状态与故障分析',
    englishTitle: 'Haul Truck Transport Condition & Fault Analysis',
    description: '围绕矿卡运输工况，融合动力、冷却、车体振动、液压、有效载荷与牵引功率数据输出诊断结论。',
    expectedRemoteName: '拖车牵引车',
    sourceAssetLabel: '远端模型：拖车牵引车',
    sourceDetailUrl: 'https://8.146.211.204:3100/three-model/detail?id=2310',
    domain: 'vehicle',
    accent: '#fb923c',
    fields: {
      rpm: { label: '发动机转速', riskDirection: 'high', weight: 0.12 },
      temperature: { label: '发动机温度', riskDirection: 'high', weight: 0.22 },
      vibration: { label: '车体振动', riskDirection: 'high', weight: 0.2 },
      pressure: { label: '液压压力', riskDirection: 'both', weight: 0.17 },
      flow_rate: { label: '燃油流量', riskDirection: 'both', weight: 0.13 },
      power_output: { label: '输出功率', riskDirection: 'both', weight: 0.16 },
    },
    chartGroups: [
      { title: '发动机转速 / 输出功率', fields: ['rpm', 'power_output'] },
      { title: '温度 / 车体振动', fields: ['temperature', 'vibration'] },
      { title: '液压压力 / 燃油流量', fields: ['pressure', 'flow_rate'] },
    ],
    faultProfiles: [
      { code: 'ENGINE_OVERHEAT', name: '发动机过热风险', fields: ['temperature', 'rpm', 'power_output'], recommendation: '检查冷却液、散热器、风扇和高负荷持续时间。' },
      { code: 'HYDRAULIC_ANOMALY', name: '液压系统压力异常', fields: ['pressure', 'power_output'], recommendation: '检查液压油位、泵阀、管路泄漏和执行机构响应。' },
      { code: 'DRIVELINE_VIBRATION', name: '传动或悬挂振动异常', fields: ['vibration', 'rpm'], recommendation: '检查传动轴、轮胎、悬挂连接及车架紧固状态。' },
      { code: 'FUEL_POWER_LOSS', name: '燃油供给与动力衰减', fields: ['flow_rate', 'power_output', 'rpm'], recommendation: '检查燃油滤清器、供油压力和发动机负荷响应。' },
    ],
    viewer: { autoRotateSpeed: 0.38 },
  },
};

const PUBLIC_DESCRIPTION_OVERRIDES: Partial<Record<PageModelBinding['viewId'], string>> = {
  'eq-0': '面向水轮机智能运维，关联轴流式水轮机的三维结构、运行参数和状态指标，呈现关键部件状态、变化趋势及风险信息。',
  'eq-1': '面向发电机智能运维，关联混流式水轮发电机组的定子、转子、轴承等关键结构及运行指标，呈现设备状态、变化趋势与风险信息。',
  'eq-2': '面向输电装置智能运维，关联输电塔、绝缘子及线路结构与运行指标，呈现设备状态、变化趋势与风险信息。',
};

function createPublicDescription(binding: PageModelBinding): string {
  const override = PUBLIC_DESCRIPTION_OVERRIDES[binding.viewId];
  if (override) return override;

  const businessName = binding.pageTitle.trim();
  const modelName = binding.modelName.trim();

  if (/检修|维修|维保|保养|更换|校验|整定|实训|教学|作业|操作/.test(businessName)) {
    return `围绕${businessName}业务，结合${modelName}的三维结构、作业流程与关键状态信息，辅助设备认知、过程检查和作业分析。`;
  }

  if (/交付|BIM|装配|工艺|制造|设计/.test(businessName)) {
    return `面向${businessName}，以${modelName}为核心载体，呈现设备结构、业务要素和关键状态信息。`;
  }

  if (/监测|预警|预测|评估|分析|运维|状态|健康|诊断/.test(businessName)) {
    return `面向${businessName}，关联${modelName}的三维结构、运行参数和状态指标，呈现关键部件状态、变化趋势及风险信息。`;
  }

  return `围绕${businessName}业务，呈现${modelName}的三维结构、关键部件与运行状态信息。`;
}

function createExpandedConfig(binding: PageModelBinding): ModelShowcaseConfig {
  const operational = getModelOperationalProfile(binding.viewId as ModelShowcaseSceneId);
  const fields = Object.fromEntries(operational.fields.map(field => [field.field, {
    label: field.label, riskDirection: field.riskDirection, weight: field.weight,
  }]));
  return {
    sceneId: binding.viewId as ModelShowcaseSceneId,
    modelId: binding.modelId,
    title: `${binding.pageTitle} · 三维模型展示`,
    englishTitle: `Industrial Model Showcase · ${binding.modelName}`,
    description: createPublicDescription(binding),
    expectedRemoteName: binding.modelName,
    sourceAssetLabel: `远端模型：${binding.modelName}`,
    sourceDetailUrl: `https://8.146.211.204:3100/three-model/detail?id=${binding.modelId}`,
    domain: 'industrial',
    accent: binding.grade === 'A' ? '#22d3ee' : binding.grade === 'B' ? '#38bdf8' : '#a78bfa',
    fields,
    chartGroups: Array.from({length: Math.ceil(operational.fields.length / 2)}, (_, index) => {
      const groupFields = operational.fields.slice(index * 2, index * 2 + 2);
      return { title: groupFields.map(field => field.label).join(' / '), fields: groupFields.map(field => field.field) };
    }),
    faultProfiles: operational.faultProfiles.map(fault => ({
      code: fault.code, name: fault.name, fields: fault.fields, recommendation: fault.recommendation,
    })),
    viewer: { autoRotateSpeed: 0.4 },
  };
}

const EXPANDED_MODEL_SHOWCASE_CATALOG = Object.fromEntries(
  PAGE_MODEL_BINDINGS.map((binding) => [binding.viewId, createExpandedConfig(binding)]),
) as Record<(typeof PAGE_MODEL_BINDINGS)[number]['viewId'], ModelShowcaseConfig>;

function applyOperationalProfile(config: ModelShowcaseConfig): ModelShowcaseConfig {
  const operational = getModelOperationalProfile(config.sceneId);
  return {
    ...config,
    fields: Object.fromEntries(operational.fields.map(field => [field.field, {
      label: field.label,
      riskDirection: field.riskDirection,
      weight: field.weight,
    }])),
    chartGroups: Array.from({ length: Math.ceil(operational.fields.length / 2) }, (_, index) => {
      const groupFields = operational.fields.slice(index * 2, index * 2 + 2);
      return { title: groupFields.map(field => field.label).join(' / '), fields: groupFields.map(field => field.field) };
    }),
    faultProfiles: operational.faultProfiles.map(fault => ({
      code: fault.code,
      name: fault.name,
      fields: fault.fields,
      recommendation: fault.recommendation,
    })),
  };
}

const OPERATIONAL_EXISTING_MODEL_SHOWCASE_CATALOG = Object.fromEntries(
  Object.values(EXISTING_MODEL_SHOWCASE_CATALOG).map(config => [config.sceneId, applyOperationalProfile(config)]),
) as Record<ExistingModelShowcaseSceneId, ModelShowcaseConfig>;

export const MODEL_SHOWCASE_CATALOG: Record<ModelShowcaseSceneId, ModelShowcaseConfig> = {
  ...OPERATIONAL_EXISTING_MODEL_SHOWCASE_CATALOG,
  ...EXPANDED_MODEL_SHOWCASE_CATALOG,
};

export const MODEL_SHOWCASE_SCENE_IDS = Object.keys(MODEL_SHOWCASE_CATALOG) as ModelShowcaseSceneId[];

export function isModelShowcaseSceneId(value: string): value is ModelShowcaseSceneId {
  return Object.prototype.hasOwnProperty.call(MODEL_SHOWCASE_CATALOG, value);
}

export function getModelShowcaseConfig(sceneId: string): ModelShowcaseConfig | undefined {
  return isModelShowcaseSceneId(sceneId) ? MODEL_SHOWCASE_CATALOG[sceneId] : undefined;
}
