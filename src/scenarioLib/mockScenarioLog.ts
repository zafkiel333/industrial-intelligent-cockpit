// 场景工况基础日志生成器。
// 这里记录的是页面对应业务对象的运行、复核、分析和处置事件，不是代码修改日志。
// 接入真实日志源时，只需让 useScenarioLog 返回同一 ScenarioLogEntry 结构，信息条无需改动。
import { useMemo } from 'react';

export type ScenarioLogLevel = 'normal' | 'info' | 'attention' | 'warning' | 'critical';

export interface ScenarioLogEntry {
  time: string;
  level: ScenarioLogLevel;
  content: string;
}

interface CategoryLogProfile {
  activity: string;
  indicators: string[];
  review: string;
  record: string;
  impact: string;
  severeEligible: boolean;
}

interface DomainLogProfile {
  pattern: RegExp;
  subject: string;
  indicators: string[];
  parts: string[];
}

interface CategoryDomainFallback {
  subject: string;
  parts: string[];
}

const CATEGORY_PROFILES: Record<string, CategoryLogProfile> = {
  工业智能运维: { activity: '设备运行巡检', indicators: ['运行负载', '温升趋势', '机械状态', '控制响应'], review: '复核现场工况和关键部件状态', record: '运维班组记录', impact: '设备连续稳定运行', severeEligible: true },
  工业产品知识库: { activity: '知识条目校审', indicators: ['资料完整性', '版本有效性', '部件关联关系', '检索命中情况'], review: '核对技术资料、部件编码和适用范围', record: '知识条目变更记录', impact: '知识检索与维修决策', severeEligible: false },
  运行驾驶舱: { activity: '运行态势复核', indicators: ['核心指标', '调度计划', '区域状态', '告警闭环'], review: '核对数据源、调度约束和现场反馈', record: '值班交接记录', impact: '生产调度与安全态势', severeEligible: true },
  运行指数分析: { activity: '指标周期分析', indicators: ['统计口径', '数据完整率', '趋势偏差', '同期对标结果'], review: '复核计算口径、异常样本和业务原因', record: '指标分析记录', impact: '经营分析与运行优化', severeEligible: false },
  数字化交付: { activity: '交付成果核验', indicators: ['模型完整性', '属性完备率', '文档版本', '交付清单一致性'], review: '核对模型、文档、编码和验收清单', record: '交付批次记录', impact: '数字资产接收与后续运维', severeEligible: false },
  仿真分析: { activity: '计算任务复核', indicators: ['边界条件', '求解收敛性', '关键响应量', '结果一致性'], review: '核对输入条件、求解过程和结果合理性', record: '计算任务记录', impact: '方案评估与工况研判', severeEligible: false },
  客户数据管理: { activity: '主数据质量复核', indicators: ['字段完整率', '编码唯一性', '关联关系', '更新及时性'], review: '核对主数据、业务关系和重复记录', record: '数据维护记录', impact: '客户服务与业务协同', severeEligible: false },
  远程专家服务: { activity: '专家会诊复核', indicators: ['问题证据', '会诊结论', '处置建议', '反馈闭环'], review: '核对现场证据、专家意见和执行反馈', record: '远程会诊记录', impact: '故障研判与现场处置', severeEligible: true },
  预测性维护: { activity: '健康趋势复核', indicators: ['健康指数', '退化趋势', '剩余周期', '维护窗口'], review: '核对历史趋势、预测结果和检修反馈', record: '预测维护记录', impact: '故障预防与维护安排', severeEligible: true },
  应用维修服务: { activity: '维修服务过程复核', indicators: ['服务响应', '工单进度', '修复质量', '回访结果'], review: '核对故障现象、维修步骤和验收结果', record: '维修服务记录', impact: '维修交付与设备恢复', severeEligible: true },
  备品备件服务: { activity: '备件保障复核', indicators: ['库存数量', '安全库存', '批次状态', '领用周转'], review: '核对库存、适配关系和补货计划', record: '备件出入库记录', impact: '检修物资保障', severeEligible: false },
  模拟维修服务: { activity: '维修流程演练复核', indicators: ['步骤完整性', '工具适配性', '安全要点', '作业时长'], review: '核对维修步骤、工装和安全控制点', record: '维修训练记录', impact: '维修准备与作业规范', severeEligible: false },
  运维知识管理: { activity: '运维知识校审', indicators: ['规程有效性', '案例完整性', '知识关联', '发布状态'], review: '核对规程、案例证据和适用设备', record: '知识发布记录', impact: '运维标准执行与经验复用', severeEligible: false },
  服务数据管理: { activity: '服务数据质量复核', indicators: ['工单完整率', '数据关联率', '状态一致性', '归档及时性'], review: '核对服务工单、设备档案和结果数据', record: '服务数据更新记录', impact: '服务过程追溯与统计分析', severeEligible: false },
  设备点巡检: { activity: '点巡检任务复核', indicators: ['到检率', '测点完整率', '异常项', '整改闭环'], review: '核对巡检路线、测点结果和现场照片', record: '点巡检记录', impact: '设备状态掌握与隐患闭环', severeEligible: true },
  维修计划管理: { activity: '维修计划执行复核', indicators: ['计划完成率', '资源到位率', '停机窗口', '验收状态'], review: '核对计划、人员、备件和停机条件', record: '维修计划记录', impact: '检修组织与生产衔接', severeEligible: false },
  零部件寿命预警: { activity: '寿命趋势复核', indicators: ['健康度', '累计负荷', '退化速率', '剩余寿命'], review: '核对运行载荷、检修记录和寿命预测', record: '寿命评估记录', impact: '部件更换与检修决策', severeEligible: true },
  计算机视觉监测: { activity: '图像识别结果复核', indicators: ['识别置信度', '缺陷特征', '变化速率', '复核结论'], review: '核对原始图像、缺陷位置和人工复核结果', record: '视觉检测记录', impact: '缺陷发现与状态确认', severeEligible: true },
  震动监测: { activity: '振动趋势复核', indicators: ['振动幅值', '频谱特征', '转频分量', '测点质量'], review: '核对时域波形、频谱和相邻测点响应', record: '振动监测记录', impact: '旋转部件状态与结构安全', severeEligible: true },
  维修培训: { activity: '培训任务复核', indicators: ['课程完成率', '实操成绩', '关键步骤', '能力评价'], review: '核对课程内容、实操过程和考核结果', record: '培训考核记录', impact: '岗位能力与作业规范', severeEligible: false },
};

const DEFAULT_CATEGORY_PROFILE: CategoryLogProfile = {
  activity: '业务状态复核', indicators: ['核心指标', '数据完整性', '执行状态', '结果一致性'],
  review: '核对业务数据和现场反馈', record: '业务运行记录', impact: '业务连续运行', severeEligible: false,
};

const CATEGORY_DOMAIN_FALLBACKS: Record<string, CategoryDomainFallback> = {
  工业智能运维: { subject: '智能运维对象', parts: ['设备状态监测', '数据采集链路', '诊断分析环节', '运维处置闭环'] },
  工业产品知识库: { subject: '产品知识资产', parts: ['产品技术资料', '部件与编码关系', '适用范围与版本', '检索与知识发布'] },
  运行驾驶舱: { subject: '生产运行态势', parts: ['核心运行单元', '调度与计划环节', '数据汇聚链路', '告警与处置闭环'] },
  运行指数分析: { subject: '运行指标体系', parts: ['指标数据源', '统计计算口径', '对标分析环节', '结果发布与复核'] },
  数字化交付: { subject: '数字化交付成果', parts: ['模型与数据成果', '属性及编码关系', '交付文档版本', '验收清单与问题闭环'] },
  仿真分析: { subject: '仿真计算任务', parts: ['输入参数与边界', '求解模型与网格', '关键响应结果', '方案比选与结果复核'] },
  客户数据管理: { subject: '客户业务主数据', parts: ['客户基础档案', '组织与账户关系', '合同及服务关联', '数据更新与质量闭环'] },
  远程专家服务: { subject: '远程专家会诊业务', parts: ['现场证据与运行数据', '专家协同与会商', '诊断结论与建议', '执行反馈与闭环'] },
  预测性维护: { subject: '预测维护对象', parts: ['历史状态数据', '健康与退化模型', '风险结论与维护窗口', '检修反馈与模型复核'] },
  应用维修服务: { subject: '维修服务任务', parts: ['故障受理与证据', '维修方案与资源', '现场修复过程', '验收回访与闭环'] },
  备品备件服务: { subject: '备品备件保障业务', parts: ['备件主数据与适配', '库存与批次状态', '领用配送环节', '补货计划与质量追溯'] },
  模拟维修服务: { subject: '维修流程训练任务', parts: ['作业步骤与安全点', '工具工装配置', '操作过程与用时', '训练评价与改进'] },
  运维知识管理: { subject: '运维知识资产', parts: ['规程与标准', '故障案例证据', '设备与知识关联', '校审发布与应用反馈'] },
  服务数据管理: { subject: '服务过程数据', parts: ['服务工单信息', '设备与客户关联', '过程状态与结果', '归档统计与质量复核'] },
  设备点巡检: { subject: '设备点巡检任务', parts: ['巡检路线与点位', '测量结果与照片', '异常项复核', '整改验收与闭环'] },
  维修计划管理: { subject: '维修计划任务', parts: ['计划范围与窗口', '人员与工器具资源', '备件及停机条件', '执行验收与计划闭环'] },
  零部件寿命预警: { subject: '关键零部件寿命状态', parts: ['累计载荷与工况', '健康度与退化趋势', '剩余寿命结论', '更换窗口与检修反馈'] },
  计算机视觉监测: { subject: '视觉监测任务', parts: ['图像采集与成像质量', '目标区域与缺陷特征', '识别结果与人工复核', '变化跟踪与处置闭环'] },
  震动监测: { subject: '振动监测对象', parts: ['测点与传感器', '时域波形与幅值', '频谱与特征频率', '趋势诊断与现场复核'] },
  维修培训: { subject: '维修培训任务', parts: ['课程与岗位要求', '实操步骤与安全点', '考核成绩与能力项', '补训计划与评价闭环'] },
};

const DOMAIN_PROFILES: DomainLogProfile[] = [
  { pattern: /水轮|水电|机组|调速|轴承|转轮/, subject: '水轮发电机组', indicators: ['转速', '轴承温度', '主轴振动', '水压', '流量', '出力'], parts: ['主轴及联轴器', '轴承与润滑系统', '导叶及水力通道', '发电机与励磁系统'] },
  { pattern: /大坝|坝体|水工|渗流|水库|防洪/, subject: '水工设施', indicators: ['结构位移', '渗压', '接缝开度', '应力', '水位', '裂缝变化'], parts: ['主体结构', '坝基与排水系统', '接缝及止水', '监测断面'] },
  { pattern: /污水|水处理|排污|水质|曝气|污泥/, subject: '水处理系统', indicators: ['进出水流量', '溶解氧', '污泥浓度', '浊度', '设备电流', '出水指标'], parts: ['进水提升单元', '曝气与生化系统', '沉淀过滤单元', '在线监测仪表'] },
  { pattern: /泵|排水|供水/, subject: '泵组及输送系统', indicators: ['泵轴转速', '轴承温度', '泵体振动', '出口压力', '输送流量', '电机功率'], parts: ['吸入口与叶轮', '泵轴及轴承', '机械密封', '驱动电机与管路'] },
  { pattern: /矿|采掘|掘进|钻|破碎|选矿|制砂|卡车|提升机/, subject: '矿山生产装备', indicators: ['作业负荷', '驱动电流', '温升', '机械振动', '处理效率', '液压状态'], parts: ['工作机构', '驱动与传动系统', '液压回路', '承载结构及基础'] },
  { pattern: /船|港|航道|泊位|码头|船闸|航标|浮标/, subject: '船舶与港航设施', indicators: ['推进负荷', '轴系状态', '泊位作业量', '航道条件', '通信质量', '能耗指标'], parts: ['推进轴系', '装卸与系泊设备', '航标通信单元', '航道及通航设施'] },
  { pattern: /发电机|输电|变压器|断路器|电气|绕组|开关柜|GIS/, subject: '电气设备', indicators: ['负载电流', '运行电压', '油温', '绕组温度', '局部放电', '电磁振动'], parts: ['绕组与绝缘系统', '一次连接回路', '冷却系统', '铁芯及夹件'] },
  { pattern: /起重|吊|岸桥|场桥|门机|启闭机/, subject: '起重及启闭设备', indicators: ['载荷', '运行位置', '运行速度', '驱动电流', '电机温度', '结构振动'], parts: ['吊具与钢丝绳', '起升驱动与制动机构', '主梁及轨道', '限位与控制系统'] },
  { pattern: /空调|制冷|冷水机|压缩机|风机|通风|冷却塔/, subject: '通风制冷设备', indicators: ['吸排气压力', '排气温度', '电机电流', '机组振动', '换热效率', '风量'], parts: ['压缩机与风机', '换热器', '工质循环回路', '电机及控制系统'] },
  { pattern: /机器人|机械臂|伺服/, subject: '工业机器人', indicators: ['关节电流', '关节温度', '定位误差', '重复精度', '关节振动', '作业节拍'], parts: ['伺服电机', '减速器及轴承', '编码器', '末端执行器'] },
  { pattern: /视觉|缺陷|裂缝|渗漏|磨损|损伤|变形|检测/, subject: '检测对象', indicators: ['缺陷特征', '形变幅值', '表面温度', '相对位移', '识别置信度', '变化速率'], parts: ['目标区域', '连接界面', '结构边缘', '成像与识别链路'] },
  { pattern: /客户|合同|账户|组织|主数据/, subject: '客户业务数据', indicators: ['记录完整性', '编码一致性', '关联关系', '更新状态'], parts: ['客户主档', '组织关系', '合同账户', '服务关联信息'] },
];

const DEFAULT_CATEGORY_DOMAIN: CategoryDomainFallback = {
  subject: '页面业务对象', parts: ['主要业务环节', '关键状态对象', '数据采集与关联链路', '处置与结果闭环'],
};

type EventKind = 'current' | 'sync' | 'routine' | 'analysis' | 'attention' | 'followup' | 'plan' | 'handover' | 'quality' | 'closure' | 'warning' | 'archive' | 'calibration' | 'verification' | 'periodic' | 'critical';
interface EventBlueprint { days: number; level: ScenarioLogLevel; kind: EventKind; }

const EVENT_BLUEPRINTS: EventBlueprint[] = [
  { days: 0, level: 'normal', kind: 'current' }, { days: 1, level: 'info', kind: 'sync' },
  { days: 3, level: 'normal', kind: 'routine' }, { days: 6, level: 'info', kind: 'analysis' },
  { days: 10, level: 'attention', kind: 'attention' }, { days: 15, level: 'normal', kind: 'followup' },
  { days: 21, level: 'warning', kind: 'warning' }, { days: 28, level: 'normal', kind: 'quality' },
  { days: 36, level: 'info', kind: 'handover' }, { days: 45, level: 'normal', kind: 'verification' },
  { days: 55, level: 'normal', kind: 'closure' }, { days: 66, level: 'info', kind: 'plan' },
  { days: 78, level: 'info', kind: 'archive' }, { days: 91, level: 'normal', kind: 'periodic' },
  { days: 105, level: 'info', kind: 'calibration' }, { days: 120, level: 'attention', kind: 'attention' },
  { days: 136, level: 'normal', kind: 'followup' }, { days: 153, level: 'info', kind: 'analysis' },
  { days: 171, level: 'normal', kind: 'routine' }, { days: 190, level: 'info', kind: 'plan' },
  { days: 210, level: 'normal', kind: 'closure' }, { days: 231, level: 'warning', kind: 'warning' },
  { days: 253, level: 'normal', kind: 'verification' }, { days: 276, level: 'info', kind: 'archive' },
  { days: 300, level: 'normal', kind: 'periodic' }, { days: 325, level: 'attention', kind: 'attention' },
  { days: 351, level: 'normal', kind: 'followup' }, { days: 378, level: 'info', kind: 'quality' },
  { days: 406, level: 'normal', kind: 'closure' }, { days: 435, level: 'critical', kind: 'critical' },
  { days: 465, level: 'normal', kind: 'verification' }, { days: 496, level: 'info', kind: 'handover' },
  { days: 528, level: 'normal', kind: 'routine' }, { days: 561, level: 'info', kind: 'archive' },
];

const hashSeed = (input: string): number => {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
};

const formatTime = (date: Date): string => {
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

function eventContent(kind: EventKind, scenarioName: string, profile: CategoryLogProfile, domain: Omit<DomainLogProfile, 'pattern'>, index: number): string {
  const indicator = (profile.indicators.length > 1 ? profile.indicators : domain.indicators)[index % (profile.indicators.length > 1 ? profile.indicators.length : domain.indicators.length)];
  const domainIndicator = domain.indicators[index % domain.indicators.length];
  const part = domain.parts[(index * 3 + 1) % domain.parts.length];
  const prefix = `${scenarioName}：`;
  switch (kind) {
    case 'current': return `${prefix}最新状态复核完成，${domainIndicator}与${indicator}保持稳定，当前未发现需要升级处置的事项。`;
    case 'sync': return `${prefix}${profile.record}已更新，${domain.subject}的${domainIndicator}、${part}状态和最近处置结果完成关联。`;
    case 'routine': return `${prefix}${profile.activity}完成，重点核查${part}及${domainIndicator}，现场状态与记录一致。`;
    case 'analysis': return `${prefix}完成阶段性分析，${indicator}变化与当前业务条件相符，分析结果已纳入本期复核。`;
    case 'attention': return `${prefix}${domainIndicator}出现短时偏离，${profile.review}后未形成持续异常，后续继续关注相邻周期变化。`;
    case 'followup': return `${prefix}跟踪复核完成，前期关注的${part}状态已恢复稳定，${domainIndicator}保持在业务参考范围。`;
    case 'plan': return `${prefix}下一周期工作安排已确认，计划围绕${part}、${indicator}和相关业务条件开展重点复核。`;
    case 'handover': return `${prefix}完成值班与任务交接，${profile.record}、待复核事项和${domain.subject}当前状态已核对。`;
    case 'quality': return `${prefix}数据质量检查完成，${domainIndicator}记录连续，关键字段、时间顺序和业务关联未见缺口。`;
    case 'closure': return `${prefix}前期异常事项完成闭环，${part}经复核满足继续运行条件，相关记录已归档。`;
    case 'warning': return `${prefix}发现${domainIndicator}持续偏离参考范围，已启动专项复核并检查${part}，处置期间加强趋势跟踪。`;
    case 'archive': return `${prefix}${profile.record}完成归档，${indicator}分析依据、复核结论和后续安排均已登记。`;
    case 'calibration': return `${prefix}完成数据口径与基准复核，${domainIndicator}的采集范围、单位和判定条件保持一致。`;
    case 'verification': return `${prefix}复核结果确认，${domainIndicator}变化与${part}现场状态相符，本次判断已完成闭环验证。`;
    case 'periodic': return `${prefix}周期复盘完成，${profile.activity}、${indicator}和处置完成情况符合本期业务要求。`;
    case 'critical': return `${prefix}曾出现影响${profile.impact}的持续异常，已按预案限制相关作业并组织现场处置，后续复核确认风险解除。`;
  }
}

export const generateMockScenarioLog = (scenarioId: string, scenarioName: string, categoryName = '', entryCount = 34): ScenarioLogEntry[] => {
  const category = CATEGORY_PROFILES[categoryName] || DEFAULT_CATEGORY_PROFILE;
  const matchedDomain = DOMAIN_PROFILES.find(rule => rule.pattern.test(scenarioName));
  const categoryDomain = CATEGORY_DOMAIN_FALLBACKS[categoryName] || DEFAULT_CATEGORY_DOMAIN;
  const domain: Omit<DomainLogProfile, 'pattern'> = matchedDomain || { ...categoryDomain, indicators: category.indicators };
  const seed = hashSeed(`${scenarioId}:${scenarioName}:${categoryName}`);
  const anchor = new Date();
  anchor.setSeconds(0, 0);
  const allowCritical = category.severeEligible && seed % 17 === 0;
  const blueprints = EVENT_BLUEPRINTS.slice(0, Math.max(0, entryCount));

  return blueprints.map((blueprint, index) => {
    const minuteOffset = (seed + index * 83) % 720;
    const time = new Date(anchor.getTime() - blueprint.days * 86_400_000 - minuteOffset * 60_000);
    const level = blueprint.level === 'critical' ? allowCritical ? 'critical' : 'info' : blueprint.level;
    const kind = blueprint.kind === 'critical' && !allowCritical ? 'verification' : blueprint.kind;
    return { time: formatTime(time), level, content: eventContent(kind, scenarioName, category, domain, index) };
  }).sort((left, right) => right.time.localeCompare(left.time));
};

export const useScenarioLog = (scenarioId: string, scenarioName: string, categoryName = ''): ScenarioLogEntry[] => {
  return useMemo(() => generateMockScenarioLog(scenarioId, scenarioName, categoryName), [scenarioId, scenarioName, categoryName]);
};
