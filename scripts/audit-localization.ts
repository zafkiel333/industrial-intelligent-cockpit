import { readFileSync } from 'node:fs';
import { MENU_ITEMS } from '../constants';
import { translateVisibleText } from '../src/localization/chineseUi';

const cases: Array<[string, string]> = [
  ['Current Depth', '当前深度'],
  ['AI DIAGNOSTICS', '智能诊断'],
  ['System Status: Online', '系统状态：在线'],
  ['Maintenance Schedule', '检修安排'],
  ['Armature Current', '电枢电流'],
  ['TENSION (kN)', '张力（kN）'],
  ['SHAFT-MAIN-01', 'SHAFT-MAIN-01'],
  ['METALLURGY_GENOME', 'METALLURGY_GENOME'],
  ['v24.03', 'v24.03'],
  ['实时震动分析与3D数字孪生', '振动实时分析与三维数字孪生'],
  ['运行状态: 正常运行中', '运行状态：运行正常'],
  ['Last Sync: Today 08:30', '最近同步：今天 08:30'],
  ['Legal Rep', '法定代表人'],
  ['N/A', '暂无'],
  ['系统实时监测船用造水机高压泵震动监测的震动频率分布。', '系统实时分析船用造水机高压泵的振动频谱。'],
  ['健康状态: 优', '健康状态：优秀'],
  ['Aeration Blower B', 'B号曝气鼓风机'],
  ['Return Pump A', 'A号污泥回流泵'],
  ['Anoxic Mixer', '缺氧池搅拌器'],
  ['BIO-REACTORS & PURIFICATION', '生物反应与深度净化'],
  ['调速器 (Governor)', '调速器'],
  ['方位误差 (Bearing)', '方位误差'],
  ['失效模式分析 (FMEA)', '失效模式分析（FMEA）'],
  ['设备维护手册_v2.pdf', '设备维护手册_v2.pdf'],
  ['AUTO-GENERATED', '自动生成'],
  ['激光导向系统 (SLS)', '激光导向系统（SLS）'],
  ['PSS (电力系统稳定器)', '电力系统稳定器（PSS）'],
  ['Pipe Burst', '管道爆裂'],
  ['Node-452 (Main St)', 'Node-452（主街道）'],
  ['Rescue Team Alpha', 'A组救援队'],
  ['Loc: Tunnel Main Junction', '位置：主隧道交汇处'],
  ['Medical Unit', '医疗救援组'],
  ['Reservoir A', 'A水库'],
  ['Unified Code', '统一编码'],
  ['Customer Name', '客户名称'],
  ['Government', '政府机构'],
  ['Enterprise', '企业客户'],
  ['Individual', '个人客户'],
  ['East China', '华东地区'],
  ['Municipal Transport Bureau', '市交通运输局'],
  ['kb-crushing-equip', 'kb-crushing-equip'],
  ['ENT-CN-MFG-24001', 'ENT-CN-MFG-24001'],
  ['DMA-03', 'DMA-03'],
  ['AUTO-CHECK', '自动校验'],
  ['MULTI-DIMENSIONAL', '多维分析'],
  ['Government', '政府机构'],
  ['场景ID：cp-smart-water', '场景编号：cp-smart-water'],
];

for (const [source, expected] of cases) {
  const actual = translateVisibleText(source);
  if (actual !== expected) {
    throw new Error(`文案转换不符合预期：${source} -> ${actual}（预期：${expected}）`);
  }
  if (/相关信息|标识/.test(actual)) {
    throw new Error(`文案中仍含机械占位词：${source} -> ${actual}`);
  }
}

const sidebarSource = readFileSync(new URL('../components/Sidebar.tsx', import.meta.url), 'utf8');
if (!sidebarSource.includes("data-localization={depth === 0 ? 'preserve' : undefined}")) {
  throw new Error('20 个一级分类尚未启用本地化保护。');
}

const orgSource = readFileSync(new URL('../views/cdm/CustomerOrgStructureView.tsx', import.meta.url), 'utf8');
if (!orgSource.includes("label: 'Quantum Global Group'") || !orgSource.includes('ORG_NODE_DISPLAY_NAME')) {
  throw new Error('组织架构的数据层英文标签与中文展示映射未正确分离。');
}

const cardSource = readFileSync(new URL('../components/SciFiCard.tsx', import.meta.url), 'utf8');
if (!cardSource.includes('subtitleIsCode') || !cardSource.includes("subtitleIsCode ? 'preserve'")) {
  throw new Error('卡片代码副标题尚未启用本地化保护。');
}

const metaBarSource = readFileSync(new URL('../src/scenarioLib/ScenarioMetaBar.tsx', import.meta.url), 'utf8');
if (!metaBarSource.includes('data-localization="preserve"') || !metaBarSource.includes('{meta.id}')) {
  throw new Error('场景信息条的原始 ID 尚未启用本地化保护。');
}

const customerMasterSource = readFileSync(new URL('../views/cdm/CustomerMasterDataView.tsx', import.meta.url), 'utf8');
if (!customerMasterSource.includes('data-localization="preserve"') || !customerMasterSource.includes('{row.id}')) {
  throw new Error('客户主数据编码尚未与中文展示文案分离。');
}

const processScriptSource = readFileSync(new URL('../views/digital-delivery/MineProcessDeliveryView.tsx', import.meta.url), 'utf8');
if (!processScriptSource.includes('data-localization="preserve"') || !processScriptSource.includes('IF Shearer_Pos > 120 THEN')) {
  throw new Error('可执行逻辑脚本尚未启用原文保护。');
}

const wastewaterSource = readFileSync(new URL('../views/WastewaterView.tsx', import.meta.url), 'utf8');
for (const requiredCopy of ['B号曝气鼓风机', 'A号污泥回流泵', '缺氧池搅拌器', '进水浓度', '出水浓度']) {
  if (!wastewaterSource.includes(requiredCopy)) {
    throw new Error(`污水处理页面缺少完整中文业务名称：${requiredCopy}`);
  }
}
if (!wastewaterSource.includes('EQUIPMENT_DISPLAY_NAMES') || !wastewaterSource.includes('EQUIPMENT_STATUS_NAMES')) {
  throw new Error('污水处理页面的内部值与中文展示值尚未分离。');
}

const expectedCategories = [
  '工业智能运维', '工业产品知识库', '运行驾驶舱', '运行指数分析', '数字化交付',
  '仿真分析', '客户数据管理', '远程专家服务', '预测性维护', '应用维修服务',
  '备品备件服务', '模拟维修服务', '运维知识管理', '服务数据管理', '设备点巡检',
  '维修计划管理', '零部件寿命预警', '计算机视觉监测', '震动监测', '维修培训',
];
const actualCategories = MENU_ITEMS.map((item) => item.label);
if (JSON.stringify(actualCategories) !== JSON.stringify(expectedCategories)) {
  throw new Error(`一级分类名称发生变化：${actualCategories.join('、')}`);
}

console.log(`中文文案转换审计通过：${cases.length} 个代表性场景，20 个一级分类名称保持不变。`);
