// 2026-08-21 新增：零部件寿命预警前十页的差异化业务配置。
// 所有数值均为数字化场景演示值；实际阈值必须由设备厂家、适用标准和现场基线确认。

export type LifeWarningTone = 'blue' | 'green' | 'amber' | 'red' | 'violet';

export interface LifeWarningKpi {
  label: string;
  value: string;
  unit?: string;
  note: string;
  tone: LifeWarningTone;
}

export interface LifeWarningSignal {
  label: string;
  display: string;
  value: number;
  warning: number;
  unit: string;
  direction: 'upper' | 'lower';
  source: string;
}

export interface DegradationMechanism {
  name: string;
  contribution: number;
  evidence: string;
}

export interface WarningThreshold {
  level: '关注' | '预警' | '处置';
  trigger: string;
  action: string;
}

export interface LifeWarningAction {
  action: string;
  due: string;
  owner: string;
  state: '待确认' | '已排程' | '执行中' | '已完成';
}

export interface LifeWarningScenarioConfig {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  asset: string;
  discipline: string;
  status: string;
  statusTone: LifeWarningTone;
  healthIndex: number;
  remainingLife: string;
  remainingLifeUnit: string;
  remainingLifeRange: string;
  confidence: number;
  inspectionWindow: string;
  sceneTitle: string;
  sceneNote: string;
  kpis: LifeWarningKpi[];
  signals: LifeWarningSignal[];
  mechanisms: DegradationMechanism[];
  thresholds: WarningThreshold[];
  actions: LifeWarningAction[];
  trend: {
    label: string;
    unit: string;
    history: number[];
    forecast: number[];
    warning: number;
    higherIsHealthy: boolean;
  };
  intelligence: {
    model: string;
    inputs: string[];
    recommendation: string;
    constraint: string;
    benefit: string;
  };
  basis: string;
}

const commonActions = (inspect: string, owner: string): LifeWarningAction[] => [
  { action: '复核传感器质量与时间同步', due: '本班次', owner: '状态监测', state: '执行中' },
  { action: inspect, due: '72 小时内', owner, state: '已排程' },
  { action: '复算剩余寿命与不确定度区间', due: '复检后', owner: '可靠性工程', state: '待确认' },
  { action: '更新设备台账和检修窗口', due: '会签后', owner: '计划管理', state: '待确认' },
];

export const LIFE_WARNING_SCENARIOS: Record<string, LifeWarningScenarioConfig> = {
  'turbine-blade-erosion': {
    id: 'turbine-blade-erosion', code: 'RUL-HYD-RUNNER-01', title: '水轮机转轮叶片冲蚀寿命预警',
    subtitle: '融合含沙量、空化强度、停机测厚和运行小时，评估叶片材料损失及下一可用检修窗口。',
    asset: '1# 水轮机转轮 / 叶片 B07', discipline: '水机金属结构', status: '趋势偏快', statusTone: 'amber',
    healthIndex: 78, remainingLife: '4,600', remainingLifeUnit: '运行小时', remainingLifeRange: '3,900–5,400 h', confidence: 86,
    inspectionWindow: '枯水期停机窗口 · 2026-11-18', sceneTitle: '转轮叶片冲蚀数字孪生',
    sceneNote: '高风险区集中在进水边与背水面；颜色表达相对退化程度，不替代停机测厚。',
    kpis: [
      { label: '健康指数', value: '78', unit: '/100', note: '较上月下降 2.4', tone: 'amber' },
      { label: '预测寿命', value: '4,600', unit: 'h', note: '区间 3,900–5,400 h', tone: 'blue' },
      { label: '材料损失率', value: '7.8', unit: '%', note: '相对上次检修基线', tone: 'red' },
      { label: '预测置信度', value: '86', unit: '%', note: '含一次停机测厚校准', tone: 'violet' },
    ],
    signals: [
      { label: '最大冲蚀深度', display: '1.8', value: 1.8, warning: 2.0, unit: 'mm', direction: 'upper', source: '停机三维扫描' },
      { label: '含沙浓度', display: '3.4', value: 3.4, warning: 3.0, unit: 'kg/m³', direction: 'upper', source: '取水口在线监测' },
      { label: '空化强度指数', display: '4.6', value: 4.6, warning: 4.0, unit: '—', direction: 'upper', source: '声发射特征' },
      { label: '高风险面积占比', display: '12.5', value: 12.5, warning: 15, unit: '%', direction: 'upper', source: '图像与扫描融合' },
    ],
    mechanisms: [
      { name: '泥沙磨粒冲蚀', contribution: 46, evidence: '含沙浓度与流速联合升高' },
      { name: '空化剥蚀', contribution: 38, evidence: '背水面宽频声发射增强' },
      { name: '涂层疲劳与腐蚀', contribution: 16, evidence: '修复区边缘出现点蚀' },
    ],
    thresholds: [
      { level: '关注', trigger: '冲蚀深度 ≥ 1.5 mm', action: '提高趋势采样频率' },
      { level: '预警', trigger: '深度 ≥ 2.0 mm 或增速异常', action: '锁定枯水期复测窗口' },
      { level: '处置', trigger: '裂纹或厚度低于工程限值', action: '停机并由专业人员评定' },
    ],
    actions: commonActions('安排水下机器人复核与停机测厚', '水机检修'),
    trend: { label: '健康指数', unit: '/100', history: [92, 90, 88, 86, 84, 81, 78], forecast: [76, 73, 69, 64, 58], warning: 60, higherIsHealthy: true },
    intelligence: {
      model: '冲蚀物理约束退化模型 + 贝叶斯更新', inputs: ['含沙量', '流速/水头', '空化声学', '三维测厚', '运行小时'],
      recommendation: '维持当前负荷上限，枯水期优先复核 B07 进水边；测厚结果回写后再决定补焊或抗磨涂层修复。',
      constraint: '模型不得单独给出继续运行许可；发现裂纹、异常振动或保护动作时必须转人工工程评定。',
      benefit: '把停机检查集中到最可能超限的叶片区域，减少无目标拆检。',
    },
    basis: 'DOE 水电空化寿命研究与 USBR 水电机组检修资料；阈值为演示控制值。',
  },

  'generator-insulation-aging': {
    id: 'generator-insulation-aging', code: 'RUL-ELE-STATOR-02', title: '发电机定子线棒绝缘老化预警',
    subtitle: '结合局部放电、介质损耗、绝缘电阻和热循环，跟踪主绝缘劣化及检修优先级。',
    asset: '1# 发电机 / 定子槽 17–22', discipline: '高压绝缘', status: '局放升高', statusTone: 'red',
    healthIndex: 72, remainingLife: '18', remainingLifeUnit: '个月', remainingLifeRange: '14–24 个月', confidence: 82,
    inspectionWindow: '年度试验窗口 · 2026-10-06', sceneTitle: '定子线棒绝缘层数字孪生',
    sceneNote: '三维模型显示局放活跃区和热应力分布，趋势判断需结合停机电气试验。',
    kpis: [
      { label: '绝缘健康指数', value: '72', unit: '/100', note: '槽 19 风险最高', tone: 'red' },
      { label: '剩余寿命区间', value: '14–24', unit: '月', note: '置信度 82%', tone: 'blue' },
      { label: '局放增幅', value: '+31', unit: '%', note: '较同负荷基线', tone: 'red' },
      { label: '热循环累计', value: '1,284', unit: '次', note: '近 12 月 +126', tone: 'violet' },
    ],
    signals: [
      { label: '局部放电量', display: '182', value: 182, warning: 150, unit: 'pC', direction: 'upper', source: '在线局放' },
      { label: '介损增量', display: '0.72', value: 0.72, warning: 0.80, unit: '%', direction: 'upper', source: '停机介损试验' },
      { label: '绝缘电阻', display: '500', value: 500, warning: 400, unit: 'MΩ', direction: 'lower', source: '绝缘试验' },
      { label: '线棒热点温度', display: '65', value: 65, warning: 80, unit: '°C', direction: 'upper', source: 'RTD 温度' },
    ],
    mechanisms: [
      { name: '局部放电侵蚀', contribution: 43, evidence: '相位谱图集中度和幅值同步上升' },
      { name: '热循环老化', contribution: 35, evidence: '启停频次增加，热点反复出现' },
      { name: '潮气与表面污秽', contribution: 22, evidence: '停机绝缘参数受湿度影响明显' },
    ],
    thresholds: [
      { level: '关注', trigger: '局放较基线持续增长 ≥ 20%', action: '核验噪声与相位谱图' },
      { level: '预警', trigger: '多参数趋势一致恶化', action: '提前安排停机电气试验' },
      { level: '处置', trigger: '出现放电定位集中或保护异常', action: '限制运行并组织绝缘评定' },
    ],
    actions: commonActions('完成槽电位、介损和端部放电复测', '电气检修'),
    trend: { label: '绝缘健康指数', unit: '/100', history: [88, 86, 84, 82, 79, 76, 72], forecast: [69, 66, 62, 57, 51], warning: 60, higherIsHealthy: true },
    intelligence: {
      model: '绝缘多参数健康指数 + 热老化等效模型', inputs: ['局放相位谱', '介损', '绝缘电阻', '温度', '启停记录'],
      recommendation: '将槽 19–21 列入年度试验重点，并把在线局放采样由周级提升为日级趋势复核。',
      constraint: '局放绝对值受传感器、噪声和安装方式影响，必须与历史基线和停机试验联合判定。',
      benefit: '在大修前识别需要重点开槽检查的区域，降低整圈无差别检查工作量。',
    },
    basis: 'USBR FIST 固体绝缘试验资料强调周期趋势比单次绝对值更具诊断意义。',
  },

  'transformer-bushing-life': {
    id: 'transformer-bushing-life', code: 'RUL-ELE-BUSH-03', title: '主变压器套管寿命预测',
    subtitle: '用 C1/C2 电容量、介损、含水量和热负荷评估套管绝缘状态及复测窗口。',
    asset: '主变 T1 / 高压套管 B 相', discipline: '变压器诊断', status: '可控关注', statusTone: 'amber',
    healthIndex: 83, remainingLife: '28', remainingLifeUnit: '个月', remainingLifeRange: '22–36 个月', confidence: 88,
    inspectionWindow: '计划停电窗口 · 2026-12-12', sceneTitle: '套管电容屏与热场数字孪生',
    sceneNote: '模型突出电容屏、法兰与密封区域；趋势变化需与出厂值和历次试验比较。',
    kpis: [
      { label: '综合健康指数', value: '83', unit: '/100', note: 'B 相低于 A/C 相', tone: 'amber' },
      { label: '预测寿命', value: '28', unit: '月', note: '区间 22–36 月', tone: 'blue' },
      { label: '电容量偏移', value: '2.1', unit: '%', note: '相对投运基线', tone: 'amber' },
      { label: '模型置信度', value: '88', unit: '%', note: '具备 6 次历史试验', tone: 'violet' },
    ],
    signals: [
      { label: '介质损耗因数', display: '0.62', value: 0.62, warning: 0.70, unit: '%', direction: 'upper', source: '在线/离线介损' },
      { label: 'C1 电容量偏移', display: '2.1', value: 2.1, warning: 3.0, unit: '%', direction: 'upper', source: '电容量试验' },
      { label: '绝缘含水量', display: '18', value: 18, warning: 25, unit: 'ppm', direction: 'upper', source: '油样分析' },
      { label: '顶部油温', display: '64', value: 64, warning: 85, unit: '°C', direction: 'upper', source: '温度监测' },
    ],
    mechanisms: [
      { name: '受潮与介质损耗', contribution: 41, evidence: '介损缓慢上升且与湿度相关' },
      { name: '电容屏局部缺陷', contribution: 34, evidence: 'B 相 C1 偏移高于相邻相' },
      { name: '密封与热老化', contribution: 25, evidence: '法兰温差和密封服役年限增加' },
    ],
    thresholds: [
      { level: '关注', trigger: '介损或电容量偏离历史带宽', action: '缩短在线趋势周期' },
      { level: '预警', trigger: '多次复测仍持续单向增长', action: '纳入最近停电窗口试验' },
      { level: '处置', trigger: '突变、渗漏或异常发热', action: '立即组织停电检查评定' },
    ],
    actions: commonActions('复核 C1/C2、介损及红外温差', '变压器专业'),
    trend: { label: '套管健康指数', unit: '/100', history: [91, 90, 89, 88, 87, 85, 83], forecast: [82, 80, 77, 73, 68], warning: 65, higherIsHealthy: true },
    intelligence: {
      model: '套管多源趋势融合 + 相间对比异常检测', inputs: ['C1/C2', '介损', '油样含水', '红外温差', '负荷'],
      recommendation: '保持 B 相在线趋势监视，下一停电窗口执行 C1/C2 和介损复测，不建议仅凭单次数据提前更换。',
      constraint: '试验值必须进行温度修正并与出厂、交接和历次数据对比；突变优先按缺陷处置。',
      benefit: '避免按固定年限过早更换，同时对突发劣化保留快速升级通道。',
    },
    basis: 'USBR《Transformers: Basics, Maintenance, and Diagnostics》套管 C1/C2 与介损趋势方法。',
  },

  'gate-hoist-rope-fatigue': {
    id: 'gate-hoist-rope-fatigue', code: 'RUL-MEC-ROPE-04', title: '闸门启闭机钢丝绳疲劳预警',
    subtitle: '融合弯曲循环、断丝、直径损失、腐蚀和张力不均，形成逐段剩余寿命与停用判据。',
    asset: '泄洪闸 G3 / 左侧工作绳', discipline: '起重与金属结构', status: '预警复检', statusTone: 'red',
    healthIndex: 68, remainingLife: '1,400', remainingLifeUnit: '启闭循环', remainingLifeRange: '900–1,900 次', confidence: 84,
    inspectionWindow: '低水位检修窗口 · 2026-09-22', sceneTitle: '钢丝绳断丝与弯曲疲劳数字孪生',
    sceneNote: '三维模型按绳段显示弯曲高循环区；报废与停用必须由合格人员按适用规范判定。',
    kpis: [
      { label: '绳体健康指数', value: '68', unit: '/100', note: '卷筒出口段最低', tone: 'red' },
      { label: '预测余量', value: '1,400', unit: '次', note: '区间 900–1,900 次', tone: 'amber' },
      { label: '断丝计数', value: '4', unit: '根/捻距', note: '需人工复核', tone: 'red' },
      { label: '张力不均', value: '7.4', unit: '%', note: '左右绳差值', tone: 'violet' },
    ],
    signals: [
      { label: '断丝数量', display: '4', value: 4, warning: 6, unit: '根/捻距', direction: 'upper', source: '机器视觉+人工' },
      { label: '直径损失', display: '4.2', value: 4.2, warning: 5, unit: '%', direction: 'upper', source: '激光测径' },
      { label: '腐蚀面积', display: '18', value: 18, warning: 20, unit: '%', direction: 'upper', source: '图像检测' },
      { label: '张力不均', display: '7.4', value: 7.4, warning: 10, unit: '%', direction: 'upper', source: '张力传感器' },
    ],
    mechanisms: [
      { name: '滑轮反复弯曲疲劳', contribution: 52, evidence: '卷筒出口段循环计数最高' },
      { name: '水汽腐蚀与润滑衰减', contribution: 29, evidence: '外层钢丝出现点蚀' },
      { name: '偏载与绳槽磨损', contribution: 19, evidence: '左右绳张力长期偏差' },
    ],
    thresholds: [
      { level: '关注', trigger: '局部断丝或直径持续下降', action: '逐段标记并缩短检查周期' },
      { level: '预警', trigger: '接近项目控制值或结构变形', action: '限制启闭并由合格人员复检' },
      { level: '处置', trigger: '达到适用报废条件', action: '挂牌停用并更换钢丝绳' },
    ],
    actions: commonActions('开展全绳磁检测、测径与绳槽检查', '启闭机检修'),
    trend: { label: '钢丝绳健康指数', unit: '/100', history: [86, 84, 81, 78, 75, 71, 68], forecast: [65, 61, 56, 50, 43], warning: 55, higherIsHealthy: true },
    intelligence: {
      model: 'Miner 累积损伤 + 断丝/腐蚀证据融合', inputs: ['启闭循环', '张力谱', '断丝', '直径', '腐蚀图像'],
      recommendation: '在下一次低水位窗口完成全绳检测，重点复核卷筒出口 2–6 m 绳段及绳槽对中。',
      constraint: '算法不能替代法定/规范检查；结构变形、热损伤或达到报废条件时不得以预测寿命延长使用。',
      benefit: '把检查定位到高循环绳段，并联动绳槽与张力根因，避免只换绳不治因。',
    },
    basis: 'OSHA 钢丝绳检查与停用原则；具体报废条件以项目采用标准和厂家要求为准。',
  },

  'governor-servo-valve-wear': {
    id: 'governor-servo-valve-wear', code: 'RUL-HYD-SERVO-05', title: '调速器伺服阀磨损寿命预警',
    subtitle: '监测油液清洁度、死区、迟滞和阶跃响应，预测阀芯阀套磨损及控制性能退化。',
    asset: '1# 调速系统 / 主配压阀 SV-02', discipline: '液压控制', status: '性能退化', statusTone: 'amber',
    healthIndex: 76, remainingLife: '2,200', remainingLifeUnit: '运行小时', remainingLifeRange: '1,700–2,900 h', confidence: 80,
    inspectionWindow: '调速器检修窗口 · 2026-10-18', sceneTitle: '伺服阀阀芯磨损数字孪生',
    sceneNote: '模型展示阀芯间隙和污染颗粒影响；清洁度异常应先处理油系统，再判断阀件更换。',
    kpis: [
      { label: '控制健康指数', value: '76', unit: '/100', note: '迟滞较基线上升', tone: 'amber' },
      { label: '预测余量', value: '2,200', unit: 'h', note: '区间 1,700–2,900 h', tone: 'blue' },
      { label: '阶跃响应', value: '92', unit: 'ms', note: '目标 ≤100 ms', tone: 'green' },
      { label: '油液清洁度', value: 'NAS 8', note: '处于控制边界', tone: 'violet' },
    ],
    signals: [
      { label: '油液清洁度', display: 'NAS 8', value: 8, warning: 8, unit: '级', direction: 'upper', source: '颗粒计数器' },
      { label: '阀芯死区', display: '0.18', value: 0.18, warning: 0.20, unit: 'mm', direction: 'upper', source: '在线辨识' },
      { label: '迟滞率', display: '2.6', value: 2.6, warning: 3.0, unit: '%', direction: 'upper', source: '开度反馈' },
      { label: '阶跃响应时间', display: '92', value: 92, warning: 100, unit: 'ms', direction: 'upper', source: '试验记录' },
    ],
    mechanisms: [
      { name: '颗粒磨损', contribution: 48, evidence: '清洁度靠近控制边界' },
      { name: '阀芯边缘冲蚀', contribution: 31, evidence: '小开度迟滞持续增加' },
      { name: '油温与黏度波动', contribution: 21, evidence: '低温工况响应离散度增大' },
    ],
    thresholds: [
      { level: '关注', trigger: '死区或迟滞连续三次上升', action: '复核油温补偿和反馈零点' },
      { level: '预警', trigger: '清洁度、死区同时接近控制值', action: '过滤油液并安排性能试验' },
      { level: '处置', trigger: '调节振荡或拒动风险', action: '切换备用并检修阀件' },
    ],
    actions: commonActions('执行油液过滤、阀芯泄漏和阶跃试验', '调速器专业'),
    trend: { label: '控制健康指数', unit: '/100', history: [90, 88, 86, 83, 81, 78, 76], forecast: [74, 71, 67, 62, 56], warning: 60, higherIsHealthy: true },
    intelligence: {
      model: '液压响应参数辨识 + 磨损状态空间模型', inputs: ['阀位指令/反馈', '压力差', '油温', '颗粒度', '启闭频次'],
      recommendation: '先改善油液清洁度并复测死区；若过滤后迟滞仍大于趋势带宽，再安排阀芯阀套检查。',
      constraint: '不得把油温、反馈零漂或控制器参数问题直接归因于机械磨损。',
      benefit: '把“换阀”决策拆分为油液治理、参数复核和机械检查三层，减少误换件。',
    },
    basis: 'USBR 水电调速器机械与数字控制维护资料；阈值为演示控制值。',
  },

  'intake-trash-rack-life': {
    id: 'intake-trash-rack-life', code: 'RUL-STR-RACK-06', title: '进水口拦污栅结构寿命评估',
    subtitle: '结合腐蚀减薄、流激振动、水位差和堵塞率，评估栅条及连接节点剩余承载能力。',
    asset: '进水口 2# 孔 / 拦污栅 R2', discipline: '水工金属结构', status: '持续监测', statusTone: 'blue',
    healthIndex: 81, remainingLife: '9.4', remainingLifeUnit: '年', remainingLifeRange: '7.2–11.8 年', confidence: 78,
    inspectionWindow: '潜水检查窗口 · 2026-09-10', sceneTitle: '拦污栅腐蚀与流激振动数字孪生',
    sceneNote: '风险集中于水气交替区、清污机导向接触区和连接焊缝；模型不替代水下检查。',
    kpis: [
      { label: '结构健康指数', value: '81', unit: '/100', note: '水气交替区最低', tone: 'blue' },
      { label: '预测寿命', value: '9.4', unit: '年', note: '区间 7.2–11.8 年', tone: 'green' },
      { label: '最大减薄', value: '11', unit: '%', note: '相对名义厚度', tone: 'amber' },
      { label: '堵塞率', value: '16', unit: '%', note: '清污后下降 4%', tone: 'violet' },
    ],
    signals: [
      { label: '最大厚度损失', display: '11', value: 11, warning: 15, unit: '%', direction: 'upper', source: '水下超声测厚' },
      { label: '振动幅值', display: '2.8', value: 2.8, warning: 3.5, unit: 'mm', direction: 'upper', source: '水下振动传感器' },
      { label: '栅前后水位差', display: '0.42', value: 0.42, warning: 0.50, unit: 'm', direction: 'upper', source: '水位计' },
      { label: '堵塞面积比', display: '16', value: 16, warning: 20, unit: '%', direction: 'upper', source: '水下视觉' },
    ],
    mechanisms: [
      { name: '水气交替腐蚀', contribution: 44, evidence: '变水位区减薄速率最高' },
      { name: '流激振动疲劳', contribution: 33, evidence: '高流量工况出现窄带峰值' },
      { name: '清污机接触磨损', contribution: 23, evidence: '导向接触区涂层擦伤' },
    ],
    thresholds: [
      { level: '关注', trigger: '减薄或振动超出历史带宽', action: '增加水下巡检点位' },
      { level: '预警', trigger: '减薄接近设计复核值', action: '开展承载能力复核' },
      { level: '处置', trigger: '裂纹、断条或连接失效', action: '限制工况并更换栅段' },
    ],
    actions: commonActions('完成水下测厚、焊缝与锚固节点检查', '水工金结'),
    trend: { label: '结构健康指数', unit: '/100', history: [90, 89, 88, 86, 84, 83, 81], forecast: [80, 78, 75, 71, 66], warning: 65, higherIsHealthy: true },
    intelligence: {
      model: '腐蚀减薄率 + 流激疲劳联合可靠度模型', inputs: ['超声厚度', '水位差', '振动', '流速', '堵塞图像'],
      recommendation: '优先复核水气交替区和清污机导向接触区；结构仍有余量时采用分段更换而非整栅报废。',
      constraint: '承载结论必须使用最新设计荷载和实测截面，由结构专业人员签发。',
      benefit: '将寿命评估细化到可更换栅段，降低整体停运和水下施工范围。',
    },
    basis: 'USBR 拦污栅设计、腐蚀检查和长期服役资料。',
  },

  'spillway-gate-seal-aging': {
    id: 'spillway-gate-seal-aging', code: 'RUL-POLY-SEAL-07', title: '泄洪洞闸门止水橡胶老化预警',
    subtitle: '跟踪硬度、压缩永久变形、渗漏和表面裂纹，预测止水失效及更换窗口。',
    asset: '泄洪洞事故闸门 / 底止水 S-04', discipline: '高分子密封', status: '更换准备', statusTone: 'red',
    healthIndex: 65, remainingLife: '7', remainingLifeUnit: '个月', remainingLifeRange: '5–10 个月', confidence: 85,
    inspectionWindow: '无水检修窗口 · 2026-10-28', sceneTitle: '止水橡胶压缩与裂纹数字孪生',
    sceneNote: '三维场景显示底止水压缩不足和裂纹聚集区；水头变化可能放大渗漏。',
    kpis: [
      { label: '密封健康指数', value: '65', unit: '/100', note: '底角区风险最高', tone: 'red' },
      { label: '预测余量', value: '7', unit: '月', note: '区间 5–10 月', tone: 'amber' },
      { label: '渗漏量', value: '3.8', unit: 'L/min', note: '超过演示控制值', tone: 'red' },
      { label: '备件齐套', value: '92', unit: '%', note: '接头胶待到货', tone: 'green' },
    ],
    signals: [
      { label: '橡胶硬度', display: '78', value: 78, warning: 80, unit: 'Shore A', direction: 'upper', source: '现场硬度计' },
      { label: '压缩永久变形', display: '32', value: 32, warning: 30, unit: '%', direction: 'upper', source: '停机量测' },
      { label: '单位渗漏量', display: '3.8', value: 3.8, warning: 3.0, unit: 'L/min', direction: 'upper', source: '集水计量' },
      { label: '表面裂纹计数', display: '12', value: 12, warning: 10, unit: '处', direction: 'upper', source: '视觉巡检' },
    ],
    mechanisms: [
      { name: '压缩永久变形', contribution: 45, evidence: '底止水回弹能力下降' },
      { name: '臭氧/热氧老化', contribution: 32, evidence: '外露段网状微裂纹增加' },
      { name: '泥沙磨损与偏压', contribution: 23, evidence: '底角区磨痕和偏载明显' },
    ],
    thresholds: [
      { level: '关注', trigger: '硬度或渗漏持续增长', action: '缩短启闭后复查周期' },
      { level: '预警', trigger: '压缩变形和渗漏同时超限', action: '冻结备件并锁定无水窗口' },
      { level: '处置', trigger: '连续射流或止水脱槽', action: '限制运行并应急处理' },
    ],
    actions: commonActions('复核止水压缩量、槽口和平整度', '闸门检修'),
    trend: { label: '密封健康指数', unit: '/100', history: [84, 82, 79, 76, 72, 68, 65], forecast: [61, 57, 52, 46, 39], warning: 55, higherIsHealthy: true },
    intelligence: {
      model: '橡胶老化主曲线 + 渗漏状态更新', inputs: ['硬度', '压缩变形', '温度', '渗漏', '启闭次数'],
      recommendation: '保留 2026-10 无水窗口更换计划，进场前复核槽口尺寸并完成新止水压缩量校核。',
      constraint: '模型不能替代闸门安全评估；出现止水脱槽、连续射流或结构干涉应立即升级。',
      benefit: '提前完成备件和工装准备，避免到窗口后才发现止水规格或槽口不匹配。',
    },
    basis: 'USBR 高分子水封材料检查能力与闸门维护实践；阈值为演示值。',
  },

  'excitation-system-module-life': {
    id: 'excitation-system-module-life', code: 'RUL-ELE-IGBT-08', title: '励磁系统功率模块寿命预警',
    subtitle: '利用结温循环、导通压降、热阻和栅极泄漏等前兆量评估 IGBT 功率模块剩余寿命。',
    asset: '1# 励磁整流柜 / 功率单元 P06', discipline: '电力电子', status: '热循环关注', statusTone: 'amber',
    healthIndex: 74, remainingLife: '16,000', remainingLifeUnit: '热循环', remainingLifeRange: '12,000–21,000 次', confidence: 81,
    inspectionWindow: '励磁系统检修 · 2026-09-16', sceneTitle: 'IGBT 功率模块热疲劳数字孪生',
    sceneNote: '三维模型显示芯片、键合线和基板热区；模块寿命受结温幅值和冷却条件共同影响。',
    kpis: [
      { label: '模块健康指数', value: '74', unit: '/100', note: 'P06 低于柜内均值', tone: 'amber' },
      { label: '剩余热循环', value: '16k', unit: '次', note: '区间 12k–21k', tone: 'blue' },
      { label: '热阻增幅', value: '9.4', unit: '%', note: '接近演示控制值', tone: 'red' },
      { label: '预测置信度', value: '81', unit: '%', note: '具备温度与电参量', tone: 'violet' },
    ],
    signals: [
      { label: '导通压降漂移', display: '6.8', value: 6.8, warning: 8, unit: '%', direction: 'upper', source: '在线电参量' },
      { label: '结温循环幅值', display: '58', value: 58, warning: 65, unit: '°C', direction: 'upper', source: '热网络估算' },
      { label: '热阻增幅', display: '9.4', value: 9.4, warning: 10, unit: '%', direction: 'upper', source: '热瞬态辨识' },
      { label: '栅极泄漏', display: '0.42', value: 0.42, warning: 0.50, unit: 'mA', direction: 'upper', source: '驱动板采样' },
    ],
    mechanisms: [
      { name: '键合线热疲劳', contribution: 47, evidence: '导通压降与结温循环相关' },
      { name: '焊层/基板退化', contribution: 35, evidence: '等效热阻持续上升' },
      { name: '驱动与绝缘老化', contribution: 18, evidence: '栅极泄漏缓慢增长' },
    ],
    thresholds: [
      { level: '关注', trigger: '热阻或 Vce 漂移超出历史带宽', action: '核验传感与冷却状态' },
      { level: '预警', trigger: '两个独立前兆量同步恶化', action: '安排停机热瞬态复测' },
      { level: '处置', trigger: '驱动异常、过温或保护频发', action: '切换冗余并更换模块' },
    ],
    actions: commonActions('清洁冷却通道并执行热瞬态/驱动复测', '励磁专业'),
    trend: { label: '功率模块健康指数', unit: '/100', history: [89, 87, 84, 82, 79, 77, 74], forecast: [71, 68, 63, 57, 50], warning: 55, higherIsHealthy: true },
    intelligence: {
      model: 'Coffin–Manson 热循环损伤 + 粒子滤波 RUL', inputs: ['结温循环', 'Vce(on)', '热阻', '栅极泄漏', '负荷谱'],
      recommendation: '先排除散热器积尘和风道不均；若热阻复测仍增长，将 P06 与备用模块轮换。',
      constraint: '结温为模型估算量，必须与散热器温度、负荷和驱动告警交叉验证；保护动作优先级高于 RUL。',
      benefit: '把模块轮换与检修窗口对齐，减少无预警功率单元退出。',
    },
    basis: 'NASA IGBT 加速老化与功率电子预测研究使用热循环、电压电流和热瞬态前兆量。',
  },

  'oil-pressure-vessel-fatigue': {
    id: 'oil-pressure-vessel-fatigue', code: 'RUL-MEC-VESSEL-09', title: '油压装置压力容器疲劳监测',
    subtitle: '累计压力循环、壁厚减薄、焊缝声发射和安全附件状态，评估压力容器疲劳使用系数。',
    asset: '调速器油压装置 / 储能罐 PV-01', discipline: '压力容器', status: '计划复验', statusTone: 'amber',
    healthIndex: 79, remainingLife: '12.6', remainingLifeUnit: '年', remainingLifeRange: '9.8–15.2 年', confidence: 79,
    inspectionWindow: '法定检验窗口 · 2027-03', sceneTitle: '压力容器循环疲劳数字孪生',
    sceneNote: '模型展示筒体、封头、接管和焊缝应力热点；法定检验结论优先于预测结果。',
    kpis: [
      { label: '容器健康指数', value: '79', unit: '/100', note: '接管焊缝为重点', tone: 'amber' },
      { label: '预测余寿命', value: '12.6', unit: '年', note: '区间 9.8–15.2 年', tone: 'green' },
      { label: '疲劳使用系数', value: '0.61', note: '演示控制值 0.80', tone: 'violet' },
      { label: '累计循环', value: '182k', unit: '次', note: '近一年 +18k', tone: 'blue' },
    ],
    signals: [
      { label: '疲劳使用系数', display: '0.61', value: 0.61, warning: 0.80, unit: '—', direction: 'upper', source: '循环计数+计算' },
      { label: '压力循环次数', display: '182k', value: 182, warning: 250, unit: '千次', direction: 'upper', source: 'PLC 历史数据' },
      { label: '最大壁厚损失', display: '7.8', value: 7.8, warning: 10, unit: '%', direction: 'upper', source: '超声测厚' },
      { label: '异常声发射事件', display: '3', value: 3, warning: 5, unit: '次/月', direction: 'upper', source: '声发射监测' },
    ],
    mechanisms: [
      { name: '压力循环疲劳', contribution: 51, evidence: '调节频繁导致小循环累计' },
      { name: '接管焊缝应力集中', contribution: 31, evidence: '声发射事件集中于接管区' },
      { name: '内壁腐蚀减薄', contribution: 18, evidence: '底部测点厚度缓慢下降' },
    ],
    thresholds: [
      { level: '关注', trigger: '循环速率或壁厚损失加快', action: '核验压力控制策略与测厚' },
      { level: '预警', trigger: '疲劳使用系数接近评定边界', action: '提前开展合于使用评定' },
      { level: '处置', trigger: '裂纹指示、安全附件失效', action: '停用隔离并依法检验' },
    ],
    actions: commonActions('执行接管焊缝无损检测和安全阀校验', '特种设备专业'),
    trend: { label: '容器健康指数', unit: '/100', history: [88, 87, 85, 84, 82, 80, 79], forecast: [77, 75, 72, 68, 63], warning: 60, higherIsHealthy: true },
    intelligence: {
      model: '雨流计数 + 累积疲劳损伤 + 厚度趋势', inputs: ['压力时序', '循环幅值', '壁厚', '焊缝检测', '安全附件'],
      recommendation: '维持 2027-03 检验窗口，提前补充接管焊缝测点；优化频繁小幅补压以降低循环累计。',
      constraint: '预测结果不得替代法定检验、定期检验和安全阀校验；发现裂纹指示必须升级处置。',
      benefit: '同时管理疲劳根因和法定窗口，避免只按年限或只按循环单一决策。',
    },
    basis: 'USBR FIST 2-9 非受火压力容器检查框架；具体要求以所在地特种设备法规为准。',
  },

  'cooling-pump-bearing-life': {
    id: 'cooling-pump-bearing-life', code: 'RUL-ROT-BEAR-10', title: '冷却水泵轴承寿命预警',
    subtitle: '融合振动包络、温度、润滑状态、负荷和启停次数，评估滚动轴承退化阶段与更换窗口。',
    asset: '技术供水泵 P-03 / 驱动端轴承', discipline: '旋转机械', status: '早期缺陷', statusTone: 'red',
    healthIndex: 69, remainingLife: '980', remainingLifeUnit: '运行小时', remainingLifeRange: '720–1,320 h', confidence: 87,
    inspectionWindow: '备用泵切换窗口 · 2026-08-29', sceneTitle: '滚动轴承局部损伤数字孪生',
    sceneNote: '三维模型显示滚道与滚动体损伤区域；包络谱用于早期识别，拆检结论决定是否更换。',
    kpis: [
      { label: '轴承健康指数', value: '69', unit: '/100', note: '驱动端外圈特征增强', tone: 'red' },
      { label: '预测余量', value: '980', unit: 'h', note: '区间 720–1,320 h', tone: 'amber' },
      { label: '包络振动', value: '5.2', unit: 'mm/s', note: '高于演示控制值', tone: 'red' },
      { label: '备用泵可用', value: '是', note: '切换试验已完成', tone: 'green' },
    ],
    signals: [
      { label: '包络振动速度', display: '5.2', value: 5.2, warning: 4.5, unit: 'mm/s', direction: 'upper', source: '在线振动' },
      { label: '轴承温度', display: '72', value: 72, warning: 80, unit: '°C', direction: 'upper', source: '温度传感器' },
      { label: '润滑颗粒等级', display: '18/16/13', value: 18, warning: 18, unit: 'ISO 4406', direction: 'upper', source: '油样分析' },
      { label: '包络峭度', display: '4.7', value: 4.7, warning: 5.0, unit: '—', direction: 'upper', source: '振动特征' },
    ],
    mechanisms: [
      { name: '外圈滚道局部剥落', contribution: 49, evidence: 'BPFO 附近包络谱峰值增强' },
      { name: '润滑污染', contribution: 29, evidence: '颗粒等级处于控制边界' },
      { name: '对中/负荷波动', contribution: 22, evidence: '启停后径向振动离散度增大' },
    ],
    thresholds: [
      { level: '关注', trigger: '特征频率幅值持续增长', action: '提高趋势采样并复核工况' },
      { level: '预警', trigger: '振动超限且温度/颗粒协同恶化', action: '切换备用泵并安排拆检' },
      { level: '处置', trigger: '振动突升、异响或温度快速上升', action: '立即停泵防止次生损伤' },
    ],
    actions: commonActions('完成备用泵切换、对中和轴承拆检准备', '辅机检修'),
    trend: { label: '轴承健康指数', unit: '/100', history: [88, 86, 83, 80, 77, 73, 69], forecast: [65, 60, 54, 47, 39], warning: 55, higherIsHealthy: true },
    intelligence: {
      model: '包络谱退化指数 + Weibull/贝叶斯 RUL', inputs: ['振动包络', '温度', '油液颗粒', '负荷', '启停次数'],
      recommendation: '在一周内切换备用泵复测；若 BPFO 特征仍增长，按 2026-08-29 窗口更换驱动端轴承并检查对中。',
      constraint: '变速、气蚀和松动可能造成相似振动特征，必须结合工况、频谱和现场听诊排除。',
      benefit: '利用备用泵窗口在故障扩展前完成计划更换，减少轴颈和泵体次生损伤。',
    },
    basis: 'SKF 轴承寿命与状态监测资料强调振动、温度、润滑和负荷联合判断。',
  },
};
