// 2026-08-09 新增：集中维护四个外部模型场景、指标映射、图表分组和故障知识；
import type { ModelShowcaseSceneId, RiskDirection } from './types';

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
  domain: 'hydro' | 'pump' | 'crane' | 'vehicle';
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

export const MODEL_SHOWCASE_CATALOG: Record<ModelShowcaseSceneId, ModelShowcaseConfig> = {
  'sim-visual-hydro-turbine': {
    sceneId: 'sim-visual-hydro-turbine',
    modelId: 2326,
    title: '水轮机多工况数字孪生仿真',
    englishTitle: 'Hydro Turbine Multi-condition Digital Twin',
    description: '融合转速、温度、振动、水压、流量与功率数据，呈现水轮机组运行状态和智能诊断结论。',
    expectedRemoteName: '水轮机总成',
    sourceAssetLabel: '远端模型：水轮机总成',
    sourceDetailUrl: 'http://8.146.211.204:3100/three-model/detail?id=2326',
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
    title: '污水泵运行效能与故障仿真',
    englishTitle: 'Wastewater Pump Efficiency & Fault Simulation',
    description: '围绕压力、流量、功率、温升与振动关系，评估污水泵运行效能并输出潜在故障结论。',
    expectedRemoteName: '污水泵KCM100HD',
    sourceAssetLabel: '远端模型：污水泵 KCM100HD',
    sourceDetailUrl: 'http://8.146.211.204:3100/three-model/detail?id=2328',
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
    title: '桥式起重机载荷安全数字孪生仿真',
    englishTitle: 'Bridge Crane Load Safety Digital Twin',
    description: '利用载荷、小车位置、运行速度、电机温度与振动数据，评估吊运安全和驱动系统状态。',
    expectedRemoteName: '桥式起重机',
    sourceAssetLabel: '远端模型：桥式起重机',
    sourceDetailUrl: 'http://8.146.211.204:3100/three-model/detail?id=2316',
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
    title: '矿卡牵引运输状态与故障仿真',
    englishTitle: 'Haul Truck Transport Condition & Fault Simulation',
    description: '以拖车牵引车资源承载矿卡运输场景，融合动力、热状态、振动、液压与燃油数据输出诊断结论。',
    expectedRemoteName: '拖车牵引车',
    sourceAssetLabel: '远端模型：拖车牵引车',
    sourceDetailUrl: 'http://8.146.211.204:3100/three-model/detail?id=2310',
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

export const MODEL_SHOWCASE_SCENE_IDS = Object.keys(MODEL_SHOWCASE_CATALOG) as ModelShowcaseSceneId[];

export function isModelShowcaseSceneId(value: string): value is ModelShowcaseSceneId {
  return Object.prototype.hasOwnProperty.call(MODEL_SHOWCASE_CATALOG, value);
}

export function getModelShowcaseConfig(sceneId: string): ModelShowcaseConfig | undefined {
  return isModelShowcaseSceneId(sceneId) ? MODEL_SHOWCASE_CATALOG[sceneId] : undefined;
}
