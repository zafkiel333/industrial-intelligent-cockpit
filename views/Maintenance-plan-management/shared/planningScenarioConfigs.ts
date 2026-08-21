// 2026-08-21 新增：维修计划管理前十页的差异化业务配置。
// 数值用于数字化场景演示，业务字段参考水电设备检修、液压钢结构、变压器诊断、
// 泵组维护、泥沙管理与输水隧洞检查等公开行业指南，不作为现场作业替代依据。

export type PlanningTone = 'blue' | 'green' | 'amber' | 'red' | 'violet';
export type PlanningLayout = 'asset' | 'risk' | 'quality' | 'diagnostic' | 'capacity' | 'logistics' | 'schedule' | 'reliability' | 'safety';

export interface PlanningKpi {
  label: string;
  value: string;
  unit?: string;
  note: string;
  tone: PlanningTone;
}

export interface PlanningSignal {
  label: string;
  value: number;
  display: string;
  warning: number;
  unit: string;
  direction: 'lower' | 'higher';
}

export interface PlanningStage {
  name: string;
  window: string;
  owner: string;
  progress: number;
  state: '完成' | '执行中' | '待开始' | '受约束';
  gate: string;
}

export interface PlanningRisk {
  title: string;
  level: '高' | '中' | '低';
  control: string;
}

export interface PlanningResource {
  name: string;
  demand: string;
  readiness: number;
  note: string;
}

export interface PlanningScenarioConfig {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  asset: string;
  discipline: string;
  status: string;
  statusTone: PlanningTone;
  window: string;
  completion: number;
  readiness: number;
  confidence: number;
  layout: PlanningLayout;
  sceneTitle: string;
  sceneNote: string;
  kpis: PlanningKpi[];
  signals: PlanningSignal[];
  stages: PlanningStage[];
  risks: PlanningRisk[];
  resources: PlanningResource[];
  intelligence: {
    model: string;
    inputs: string[];
    recommendation: string;
    constraint: string;
    benefit: string;
  };
  basis: string;
}

export const MAINTENANCE_PLANNING_SCENARIOS: Record<string, PlanningScenarioConfig> = {
  'mpm-0': {
    id: 'mpm-0',
    code: 'WO-HYD-26041',
    title: '水轮发电机组大修计划',
    subtitle: '以停机窗口、解体路径、主轴系找正和质量见证点为主线的机组大修数字化统筹',
    asset: '#1 水轮发电机组 · 320 MW',
    discipline: '水机 / 发电机 / 起重',
    status: '开工准备',
    statusTone: 'blue',
    window: '09-12 08:00 — 10-18 18:00',
    completion: 18,
    readiness: 96,
    confidence: 92,
    layout: 'asset',
    sceneTitle: '机组解体与吊装路径数字孪生',
    sceneNote: '联动转轮、主轴、转子和桥机作业空间，校核交叉作业与吊装净距',
    kpis: [
      { label: '计划停机窗口', value: '36', unit: '天', note: '电网已批复', tone: 'blue' },
      { label: '关键路径余量', value: '42', unit: '小时', note: '较基线 +6 h', tone: 'green' },
      { label: '专用工装齐套', value: '96', unit: '%', note: '差 1 套转子支墩', tone: 'amber' },
      { label: '质量见证点', value: '18/24', note: '6 项待签审', tone: 'violet' },
    ],
    signals: [
      { label: '上导轴承摆度', value: 0.082, display: '0.082', warning: 0.12, unit: 'mm', direction: 'lower' },
      { label: '轴系振动', value: 1.8, display: '1.8', warning: 2.5, unit: 'mm/s', direction: 'lower' },
      { label: '气隙偏差', value: 5.6, display: '5.6', warning: 8, unit: '%', direction: 'lower' },
      { label: '定子绝缘指数 PI', value: 2.4, display: '2.40', warning: 2, unit: '', direction: 'higher' },
    ],
    stages: [
      { name: '停机隔离与盘车基线', window: 'D1–D2', owner: '运行班 / 电气班', progress: 100, state: '完成', gate: 'LOTO 与零能量确认' },
      { name: '上机架及转子解体', window: 'D3–D9', owner: '水机班 / 起重班', progress: 62, state: '执行中', gate: '转子吊装方案会签' },
      { name: '转轮、主轴及轴承检查', window: 'D10–D20', owner: '水机班 / 无损检测', progress: 0, state: '待开始', gate: '磁粉/渗透检测放行' },
      { name: '回装找正与气隙复测', window: 'D21–D31', owner: '安装班 / 试验班', progress: 0, state: '待开始', gate: '轴线、摆度和气隙验收' },
      { name: '充水、空载及并网试验', window: 'D32–D36', owner: '调试组 / 运行班', progress: 0, state: '待开始', gate: '试运行许可' },
    ],
    risks: [
      { title: '转子吊装净距不足', level: '中', control: '三维碰撞校核后将电缆桥架临时拆移 0.6 m' },
      { title: '转轮叶片汽蚀返修扩大', level: '中', control: '预留 24 h 焊补与型线复测缓冲' },
      { title: '轴系找正数据漂移', level: '低', control: '温度稳定 6 h 后复测并双人签认' },
    ],
    resources: [
      { name: '350 t 桥式起重机', demand: 'D3–D11', readiness: 100, note: '载荷试验已完成' },
      { name: '转子支墩与起吊梁', demand: '1 套', readiness: 78, note: '支墩复验待回传' },
      { name: '无损检测人员', demand: 'UT/MT/PT 8 人', readiness: 100, note: '资质有效' },
      { name: '轴系找正仪', demand: '2 套', readiness: 92, note: '备用探头在途' },
    ],
    intelligence: {
      model: '关键路径 CPM + 三维吊装碰撞校核 + 历史工单工时回归',
      inputs: ['SCADA 停机前基线', '振动与摆度', '历次大修工时', '桥机载荷与作业空间'],
      recommendation: '将转子电气试验与转轮无损检测并行，桥机冲突时段错开 4 小时，可释放关键路径 6 小时。',
      constraint: '不得压缩转子落位后的轴系稳定与复测时间。',
      benefit: '预计减少非计划等待 11%，并把并网延误概率由 18% 降至 9%。',
    },
    basis: 'USBR FIST 2-7：水轮发电机组机械大修程序与不可达部位检查要求',
  },
  'mpm-1': {
    id: 'mpm-1',
    code: 'WO-GATE-26018',
    title: '泄洪闸门定期维保',
    subtitle: '围绕汛前可用率、关键焊缝、支铰与启闭同步性的水工金属结构维保计划',
    asset: '3# 弧形泄洪闸门 · 12 × 14 m',
    discipline: '金属结构 / 水工 / 防汛',
    status: '汛前窗口锁定',
    statusTone: 'green',
    window: '08-25 06:00 — 08-29 20:00',
    completion: 34,
    readiness: 91,
    confidence: 89,
    layout: 'risk',
    sceneTitle: '闸门结构、支铰与启闭同步监控',
    sceneNote: '叠加门叶变形、钢丝绳张力差、支铰摩阻和上下游水位边界',
    kpis: [
      { label: '汛前可用率目标', value: '100', unit: '%', note: '5 孔门联动验收', tone: 'green' },
      { label: '允许停门窗口', value: '110', unit: '小时', note: '受来水约束', tone: 'blue' },
      { label: '同步偏差', value: '2.3', unit: 'mm', note: '控制值 ≤ 5 mm', tone: 'green' },
      { label: '重点焊缝', value: '26', unit: '处', note: '8 处需 MT 复核', tone: 'amber' },
    ],
    signals: [
      { label: '支铰启门摩阻', value: 82, display: '82', warning: 110, unit: 'kN', direction: 'lower' },
      { label: '钢丝绳张力差', value: 3.8, display: '3.8', warning: 6, unit: '%', direction: 'lower' },
      { label: '门叶挠度', value: 5.4, display: '5.4', warning: 8, unit: 'mm', direction: 'lower' },
      { label: '液压制动保持率', value: 98.6, display: '98.6', warning: 96, unit: '%', direction: 'higher' },
    ],
    stages: [
      { name: '检修闸门/叠梁门隔离', window: 'T0–T8 h', owner: '水工班', progress: 100, state: '完成', gate: '渗漏量及隔离验收' },
      { name: '门叶与焊缝近接检查', window: 'T8–T34 h', owner: '金结班 / NDT', progress: 45, state: '执行中', gate: '疲劳敏感区检测报告' },
      { name: '支铰、轮组及止水维保', window: 'T34–T70 h', owner: '机械班', progress: 0, state: '待开始', gate: '摩阻与间隙复测' },
      { name: '启闭同步与制动试验', window: 'T70–T94 h', owner: '试验班', progress: 0, state: '待开始', gate: '空载/有水联动试验' },
      { name: '防汛恢复与封闭验收', window: 'T94–T110 h', owner: '防汛办', progress: 0, state: '待开始', gate: '汛前可用确认' },
    ],
    risks: [
      { title: '上游来水突破隔离条件', level: '高', control: '接入 6 h 来水预报；达到触发值立即恢复闸门' },
      { title: '疲劳裂纹超出局部修复范围', level: '中', control: '预置焊接工艺评定及备用加固板' },
      { title: '双吊点不同步', level: '中', control: '编码器、张力和机械限位三重校核' },
    ],
    resources: [
      { name: '检修叠梁门', demand: '1 套', readiness: 100, note: '密封试验合格' },
      { name: '磁粉/超声检测', demand: '26 点位', readiness: 88, note: '夜班检测员待确认' },
      { name: '止水橡皮组件', demand: '14 m', readiness: 100, note: '尺寸复核完成' },
      { name: '防汛恢复班组', demand: '12 人', readiness: 84, note: '2 人值班冲突' },
    ],
    intelligence: {
      model: '来水短临预测 + 疲劳热点分级 + 启闭同步偏差诊断',
      inputs: ['上下游水位', '启闭载荷曲线', '焊缝历史缺陷', '钢丝绳张力与编码器'],
      recommendation: '优先检查下游面纵梁与支臂连接热点；将止水更换移至夜间低来水段，保留 16 小时恢复缓冲。',
      constraint: '任一时段必须保持设计泄洪能力，且不得跨越防汛恢复红线。',
      benefit: '预计把高风险焊缝漏检概率降低 43%，减少一次重复搭架。',
    },
    basis: 'USACE EM 1110-2-6054：液压钢结构的关键部位检查、疲劳评估与修复',
  },
  'mpm-2': {
    id: 'mpm-2',
    code: 'PRJ-DAM-26007',
    title: '大坝主体结构加固排期',
    subtitle: '以潜在失效模式、施工期安全和监测反馈为约束的坝体加固动态计划',
    asset: '混凝土重力坝 · 18–26 坝段',
    discipline: '坝工 / 岩土 / 监测',
    status: '施工监测',
    statusTone: 'amber',
    window: '08-05 — 11-26',
    completion: 43,
    readiness: 94,
    confidence: 86,
    layout: 'risk',
    sceneTitle: '坝段应力、渗流与加固体融合模型',
    sceneNote: '将帷幕灌浆、锚固和排水孔施工进度叠加到位移与扬压力监测面',
    kpis: [
      { label: '风险降幅预测', value: '38', unit: '%', note: '相对施工前基线', tone: 'green' },
      { label: '最大位移增量', value: '2.4', unit: 'mm', note: '稳定趋势', tone: 'blue' },
      { label: '灌浆合格段', value: '31/48', note: '5 段待复灌', tone: 'amber' },
      { label: '监测数据完好率', value: '98.7', unit: '%', note: '2 点离线', tone: 'violet' },
    ],
    signals: [
      { label: '坝顶水平位移增量', value: 2.4, display: '2.4', warning: 5, unit: 'mm', direction: 'lower' },
      { label: '基底扬压力系数', value: 0.31, display: '0.31', warning: 0.45, unit: '', direction: 'lower' },
      { label: '排水孔流量', value: 18.6, display: '18.6', warning: 30, unit: 'L/min', direction: 'lower' },
      { label: '灌浆单位注入量', value: 21, display: '21', warning: 35, unit: 'L/m', direction: 'lower' },
    ],
    stages: [
      { name: '监测基线与失效模式复核', window: 'W1–W2', owner: '安全评价组', progress: 100, state: '完成', gate: '风险评审会批准' },
      { name: '帷幕灌浆试验段', window: 'W3–W5', owner: '基础处理队', progress: 100, state: '完成', gate: '透水率复检' },
      { name: '坝体锚固与分区灌浆', window: 'W6–W13', owner: '加固施工队', progress: 52, state: '执行中', gate: '分序升压与抬动控制' },
      { name: '排水孔恢复及量水设施', window: 'W10–W15', owner: '水工班', progress: 24, state: '执行中', gate: '排水能力验收' },
      { name: '荷载观测与风险再评估', window: 'W16', owner: '监测中心', progress: 0, state: '待开始', gate: '残余风险签认' },
    ],
    risks: [
      { title: '灌浆抬动影响邻坝段', level: '高', control: '压力—注入量联控，位移触发自动停泵' },
      { title: '施工措施改变渗流路径', level: '高', control: '每日反演扬压力面并保留临时排水通道' },
      { title: '监测点断链导致误判', level: '中', control: '关键量采用人工测读与自动采集双通道' },
    ],
    resources: [
      { name: '灌浆泵组', demand: '4 用 1 备', readiness: 100, note: '压力校验证书齐全' },
      { name: '高强锚索', demand: '128 束', readiness: 92, note: '10 束待复检' },
      { name: '位移/扬压监测', demand: '42 点', readiness: 95, note: '2 点通讯待修复' },
      { name: '安全监测工程师', demand: '三班 6 人', readiness: 100, note: '全程值守' },
    ],
    intelligence: {
      model: '潜在失效模式 PFMA + 渗流反演 + 施工扰动贝叶斯更新',
      inputs: ['坝体位移', '扬压力与渗流量', '灌浆压力/注入量', '库水位与温度'],
      recommendation: '26# 坝段第三序孔注入量异常，建议先恢复下游排水孔，再以 0.15 MPa 降阶复灌。',
      constraint: '加固措施不得引入新的失效路径；模型结论必须结合人工巡查和工程判断。',
      benefit: '可提前识别施工扰动，预计减少复灌返工 2 个班次。',
    },
    basis: 'FEMA P-1025：风险知情的大坝安全决策与施工期风险控制原则',
  },
  'mpm-3': {
    id: 'mpm-3',
    code: 'WO-PEN-26012',
    title: '压力钢管防腐处理计划',
    subtitle: '把腐蚀分区、表面处理、涂层施工、环境条件和寿命成本纳入同一质量闭环',
    asset: '引水压力钢管 B 线 · DN 7200',
    discipline: '防腐 / 无损检测 / 受限空间',
    status: '表面处理',
    statusTone: 'blue',
    window: '10-03 — 10-21',
    completion: 47,
    readiness: 97,
    confidence: 93,
    layout: 'quality',
    sceneTitle: '腐蚀地图与涂层施工分区',
    sceneNote: '按桩号叠加剩余壁厚、点蚀密度、表面清洁度、干膜厚度和针孔检测结果',
    kpis: [
      { label: '最小剩余壁厚', value: '24.8', unit: 'mm', note: '设计下限 22 mm', tone: 'green' },
      { label: '待处理面积', value: '8,420', unit: 'm²', note: 'A/B/C 三区', tone: 'blue' },
      { label: '表面合格率', value: '94.6', unit: '%', note: 'Sa 2½ 复验', tone: 'amber' },
      { label: '预计涂层寿命', value: '24', unit: '年', note: '按环境模型估计', tone: 'violet' },
    ],
    signals: [
      { label: '露点差', value: 4.8, display: '4.8', warning: 3, unit: '℃', direction: 'higher' },
      { label: '钢材表面温度', value: 19.6, display: '19.6', warning: 12, unit: '℃', direction: 'higher' },
      { label: '平均干膜厚度', value: 436, display: '436', warning: 400, unit: 'μm', direction: 'higher' },
      { label: '针孔缺陷密度', value: 0.6, display: '0.6', warning: 1.5, unit: '处/100m²', direction: 'lower' },
    ],
    stages: [
      { name: '排水隔离与气体检测', window: 'D1–D2', owner: '运行班 / 安全员', progress: 100, state: '完成', gate: '受限空间作业许可' },
      { name: '壁厚普查与缺陷分区', window: 'D2–D5', owner: 'NDT 班', progress: 100, state: '完成', gate: '减薄点工程评定' },
      { name: '喷砂除锈与清洁度验收', window: 'D4–D10', owner: '防腐班', progress: 58, state: '执行中', gate: '粗糙度/盐分/粉尘验收' },
      { name: '底中面涂层施工', window: 'D8–D16', owner: '涂装班', progress: 26, state: '执行中', gate: '层间复涂窗口' },
      { name: '干膜与针孔检测', window: 'D16–D19', owner: '质检组', progress: 0, state: '待开始', gate: '充水许可' },
    ],
    risks: [
      { title: '露点差不足导致涂层失效', level: '高', control: '环境传感器联锁喷涂设备，低于阈值自动停工' },
      { title: '受限空间通风失效', level: '高', control: '连续气体监测、双路送排风和外部监护' },
      { title: '局部点蚀超出涂装修复', level: '中', control: '壁厚不足点转入补焊/贴板工程评定' },
    ],
    resources: [
      { name: '除湿送风机组', demand: '2 用 1 备', readiness: 100, note: '风量联调完成' },
      { name: '磨料与回收系统', demand: '96 t', readiness: 94, note: '第二批次在途' },
      { name: '涂料批次', demand: '6.8 t', readiness: 100, note: '批号与保质期核验' },
      { name: '气体检测仪', demand: '8 台', readiness: 100, note: '标定有效' },
    ],
    intelligence: {
      model: '壁厚空间插值 + 涂层质量规则引擎 + 全寿命成本 LCC 比选',
      inputs: ['超声壁厚', '表面盐分/粗糙度', '温湿度与露点', '干膜厚度/针孔'],
      recommendation: 'C2 区点蚀呈簇状分布，建议由局部补涂升级为 18 m 环带重涂，并保留阴极保护接口。',
      constraint: '涂层建议不替代承压结构完整性评定；壁厚不足必须走工程处置流程。',
      benefit: '预计减少 340 m² 低效全面返工，降低生命周期维护成本约 8%。',
    },
    basis: 'USBR《Guide to Protective Coatings》与压力钢管腐蚀控制寿命成本研究',
  },
  'mpm-4': {
    id: 'mpm-4',
    code: 'WO-TR-26009',
    title: '主变压器预防性检修',
    subtitle: '以 DGA 趋势、绝缘状态、套管与有载调压装置为核心的停电检修决策台',
    asset: '1# 主变 · 500 kV / 420 MVA',
    discipline: '高压试验 / 油务 / 继保',
    status: '停电许可待批',
    statusTone: 'amber',
    window: '09-06 00:00 — 09-07 20:00',
    completion: 12,
    readiness: 88,
    confidence: 95,
    layout: 'diagnostic',
    sceneTitle: '主变内部结构与热—气体诊断模型',
    sceneNote: '关联绕组热点、油流、套管、分接开关和气体增长率，辅助确定开盖检查边界',
    kpis: [
      { label: '停电窗口', value: '44', unit: '小时', note: '调度预批复', tone: 'blue' },
      { label: 'DGA 风险等级', value: '关注', note: '乙炔未检出', tone: 'amber' },
      { label: '试验项目覆盖', value: '17/21', note: '4 项待停电', tone: 'violet' },
      { label: '关键备件齐套', value: '88', unit: '%', note: '套管密封在途', tone: 'amber' },
    ],
    signals: [
      { label: '氢气 H₂', value: 42, display: '42', warning: 100, unit: 'ppm', direction: 'lower' },
      { label: '乙炔 C₂H₂', value: 0, display: '未检出', warning: 5, unit: 'ppm', direction: 'lower' },
      { label: '油中水分', value: 18, display: '18', warning: 25, unit: 'ppm', direction: 'lower' },
      { label: '绕组热点温度', value: 78, display: '78', warning: 95, unit: '℃', direction: 'lower' },
    ],
    stages: [
      { name: '停电、验电、接地与消防隔离', window: 'T0–T4 h', owner: '运行班', progress: 0, state: '受约束', gate: '调度许可与工作票' },
      { name: '油样、套管与绕组试验', window: 'T4–T16 h', owner: '高压试验班', progress: 0, state: '待开始', gate: '试验数据交叉复核' },
      { name: '有载调压装置检查', window: 'T12–T26 h', owner: '检修班 / 油务班', progress: 0, state: '待开始', gate: '触头磨损与油质验收' },
      { name: '渗漏治理与附件复装', window: 'T22–T34 h', owner: '本体检修班', progress: 0, state: '待开始', gate: '真空/密封试验' },
      { name: '保护校验与送电观察', window: 'T34–T44 h', owner: '继保班 / 运行班', progress: 0, state: '待开始', gate: '送电会签' },
    ],
    risks: [
      { title: '停电许可延迟压缩试验时间', level: '高', control: '设置 6 h 决策点，超时则切换最小检修包' },
      { title: '套管拆装引入受潮', level: '中', control: '湿度窗口监测并准备干燥空气覆盖' },
      { title: 'DGA 单点值误判', level: '低', control: '以增长率和多次样本趋势为主，不以单点触发开盖' },
    ],
    resources: [
      { name: '介损/直阻试验设备', demand: '各 1 套', readiness: 100, note: '计量有效' },
      { name: '真空滤油机', demand: '6000 L/h', readiness: 100, note: '油管已清洁封存' },
      { name: '套管密封组件', demand: '3 套', readiness: 64, note: '预计 09-02 到站' },
      { name: '消防与油务监护', demand: '三班 9 人', readiness: 92, note: '夜班补员中' },
    ],
    intelligence: {
      model: 'DGA 增长率诊断 + 热模型 + 检修包价值/风险排序',
      inputs: ['历次 DGA 与油化', '负荷/热点温度', '套管介损', '局放与调压开关动作'],
      recommendation: '当前气体组合不支持开盖大修；建议保留有载调压开关检查和套管密封治理，取消无依据的器身吊检。',
      constraint: '诊断需结合制造商限值、样品质量和试验复核，不以算法单独决定送电。',
      benefit: '可节省约 12 小时非必要开盖工时，并降低器身受潮风险。',
    },
    basis: 'USBR FIST 3-30/3-31：DGA 趋势、绝缘油和主变状态诊断要求',
  },
  'mpm-5': {
    id: 'mpm-5',
    code: 'WO-PUMP-26031',
    title: '大型泵站年度检修排程',
    subtitle: '兼顾供水能力、泵组效率、轴系状态和备用容量的滚动年度检修计划',
    asset: '东线泵站 · 4 × 12 MW 立式泵组',
    discipline: '泵组 / 电机 / 调度',
    status: '2# 机组检修',
    statusTone: 'blue',
    window: '08-20 — 09-15',
    completion: 36,
    readiness: 93,
    confidence: 91,
    layout: 'capacity',
    sceneTitle: '泵组工况与检修隔离数字孪生',
    sceneNote: '同步展示叶轮、轴系、导轴承和进出水流态，校核检修期间剩余供水能力',
    kpis: [
      { label: '可用泵组', value: '3/4', note: '满足当前需水', tone: 'green' },
      { label: '最佳效率点偏差', value: '4.8', unit: '%', note: '2# 机组偏高', tone: 'amber' },
      { label: '本次停机', value: '16', unit: '天', note: '较上年 -2 天', tone: 'blue' },
      { label: '易损件齐套', value: '93', unit: '%', note: '机封 1 套在途', tone: 'violet' },
    ],
    signals: [
      { label: '泵组效率', value: 86.4, display: '86.4', warning: 84, unit: '%', direction: 'higher' },
      { label: '导轴承振动', value: 2.1, display: '2.1', warning: 3.5, unit: 'mm/s', direction: 'lower' },
      { label: '轴承温度', value: 64, display: '64', warning: 75, unit: '℃', direction: 'lower' },
      { label: '轴系跳动', value: 0.09, display: '0.09', warning: 0.15, unit: 'mm', direction: 'lower' },
    ],
    stages: [
      { name: '供水能力校核与机组隔离', window: 'D1', owner: '调度 / 运行班', progress: 100, state: '完成', gate: '剩余容量确认' },
      { name: '泵体解体与叶轮检查', window: 'D2–D6', owner: '机械班', progress: 64, state: '执行中', gate: '汽蚀/磨损测量' },
      { name: '轴承、密封及轴系处理', window: 'D5–D10', owner: '机械班 / 安装班', progress: 28, state: '执行中', gate: '轴系找正验收' },
      { name: '电机与保护预防性试验', window: 'D8–D12', owner: '电气班', progress: 0, state: '待开始', gate: '绝缘与保护校验' },
      { name: '性能试验与效率复核', window: 'D13–D16', owner: '试验组', progress: 0, state: '待开始', gate: '流量/扬程/效率验收' },
    ],
    risks: [
      { title: '高温需水导致备用容量不足', level: '高', control: '需水预测超过阈值时暂停影响出水能力的工序' },
      { title: '叶轮汽蚀修复范围扩大', level: '中', control: '预留焊补与动平衡工时 18 h' },
      { title: '轴系找正受基础温度影响', level: '低', control: '按稳定温度状态记录并进行热态修正' },
    ],
    resources: [
      { name: '备用供水能力', demand: '≥ 72 m³/s', readiness: 100, note: '3 台运行满足' },
      { name: '叶轮动平衡工位', demand: '1 个班次', readiness: 86, note: '与 4# 机组冲突' },
      { name: '机械密封组件', demand: '2 套', readiness: 68, note: '1 套在途' },
      { name: '效率试验仪器', demand: '流量/功率各 1 套', readiness: 100, note: '标定完成' },
    ],
    intelligence: {
      model: '需水预测 + 泵组效率曲线 + 检修轮换优化',
      inputs: ['日需水计划', '泵组流量/扬程/功率', '振动温度', '故障与检修历史'],
      recommendation: '将 3# 泵组小修提前到 2# 性能试验阶段并行执行，当前需水情景下仍保有 14% 容量裕度。',
      constraint: '任何时段均应满足最小供水和备用泵组要求。',
      benefit: '预计年度集中停机减少 2 天，偏离最佳效率点的运行时长下降 16%。',
    },
    basis: 'USBR FIST 4-1A：泵组年度检查、振动、轴系、密封与性能劣化判据',
  },
  'mpm-6': {
    id: 'mpm-6',
    code: 'PRJ-SED-26005',
    title: '水库清淤清障作业计划',
    subtitle: '以测深成果、泥沙预算、作业产能、弃土去向和水环境约束驱动清淤调度',
    asset: '库湾 C 区与进水口航槽',
    discipline: '水文泥沙 / 疏浚 / 环保',
    status: '分区疏浚',
    statusTone: 'green',
    window: '07-18 — 10-10',
    completion: 58,
    readiness: 95,
    confidence: 84,
    layout: 'logistics',
    sceneTitle: '库底地形、淤积厚度与疏浚船轨迹',
    sceneNote: '基于多期测深差分划定优先区，联动泥浆管线、脱水场容量和浑浊度控制',
    kpis: [
      { label: '目标清淤方量', value: '18.2', unit: '万 m³', note: '已完成 10.6 万', tone: 'blue' },
      { label: '日均产能', value: '6,820', unit: 'm³/d', note: '较计划 +7%', tone: 'green' },
      { label: '测深体积不确定度', value: '±6.5', unit: '%', note: '满足调度精度', tone: 'violet' },
      { label: '下游浑浊度增量', value: '7.8', unit: 'NTU', note: '低于控制线', tone: 'green' },
    ],
    signals: [
      { label: '进水口最小水深', value: 8.6, display: '8.6', warning: 7.5, unit: 'm', direction: 'higher' },
      { label: '绞吸泵浓度', value: 21, display: '21', warning: 28, unit: '%', direction: 'lower' },
      { label: '泥浆管线压力', value: 1.26, display: '1.26', warning: 1.6, unit: 'MPa', direction: 'lower' },
      { label: '脱水场剩余容量', value: 38, display: '38', warning: 20, unit: '%', direction: 'higher' },
    ],
    stages: [
      { name: '多波束测深与泥沙预算', window: 'W1–W2', owner: '测绘组', progress: 100, state: '完成', gate: '断面与体积复核' },
      { name: '优先区划分与环保许可', window: 'W2–W4', owner: '计划组 / 环保组', progress: 100, state: '完成', gate: '弃土与水质方案批准' },
      { name: '进水口航槽疏浚', window: 'W4–W9', owner: '绞吸船组', progress: 74, state: '执行中', gate: '最小水深复测' },
      { name: '库湾淤积区清障', window: 'W7–W12', owner: '抓斗船组', progress: 42, state: '执行中', gate: '障碍物分类处置' },
      { name: '终测、方量结算与生态恢复', window: 'W12', owner: '测绘 / 环保组', progress: 0, state: '待开始', gate: '终测与水质验收' },
    ],
    risks: [
      { title: '洪水过程造成快速回淤', level: '高', control: '结合来沙预报动态调整优先区，洪峰前撤离船机' },
      { title: '脱水场容量不足', level: '中', control: '按含水率滚动预测并启用备用堆场' },
      { title: '浑浊度越限', level: '中', control: '下游在线监测联动降低绞吸浓度和推进速度' },
    ],
    resources: [
      { name: '绞吸式挖泥船', demand: '1 艘', readiness: 100, note: '有效产能 5,200 m³/d' },
      { name: '抓斗清障船', demand: '1 艘', readiness: 92, note: '液压抓斗待保养' },
      { name: '泥浆输送管线', demand: '2.4 km', readiness: 96, note: '1 处浮管待加固' },
      { name: '脱水/弃土场', demand: '7.6 万 m³', readiness: 88, note: '备用区审批中' },
    ],
    intelligence: {
      model: '多期水下地形差分 + 泥沙预算 + 船机路径/产能联合优化',
      inputs: ['多波束测深', '入库来沙量', '船机轨迹与泵浓度', '水质与弃土场容量'],
      recommendation: '将 C3 区作业推迟至本轮小洪水后，当前优先保障进水口 8.5 m 等深线，可减少预计回淤 1.4 万 m³。',
      constraint: '不得突破水质许可、航行安全和洪水撤离条件。',
      benefit: '预计减少无效重复清淤 7.6%，提升有效库容恢复量。',
    },
    basis: 'World Bank 沉积建模与管理指南：泥沙预算、分区优先级和多种管理措施组合',
  },
  'mpm-7': {
    id: 'mpm-7',
    code: 'WO-LOCK-26003',
    title: '通航船闸大修停航计划',
    subtitle: '统筹停航公告、船流疏导、闸室排水、闸门检修和恢复通航试验的窗口计划',
    asset: '二线船闸 · 280 × 34 m',
    discipline: '通航 / 金属结构 / 机电',
    status: '停航准备',
    statusTone: 'amber',
    window: '11-02 00:00 — 11-14 24:00',
    completion: 21,
    readiness: 90,
    confidence: 88,
    layout: 'schedule',
    sceneTitle: '闸室、闸门与停航作业空间仿真',
    sceneNote: '联动引航道船流、叠梁门隔离、闸室排水、门体搭架和充泄水试验',
    kpis: [
      { label: '计划停航', value: '13', unit: '天', note: '公告已发布', tone: 'blue' },
      { label: '待疏导船舶', value: '126', unit: '艘', note: '峰值 18 艘/日', tone: 'amber' },
      { label: '关键检查点', value: '42', unit: '处', note: '门叶与埋件', tone: 'violet' },
      { label: '恢复缓冲', value: '18', unit: '小时', note: '保留联调余量', tone: 'green' },
    ],
    signals: [
      { label: '闸室剩余水深', value: 3.2, display: '3.2', warning: 1.2, unit: 'm', direction: 'higher' },
      { label: '叠梁门渗漏量', value: 18, display: '18', warning: 30, unit: 'L/s', direction: 'lower' },
      { label: '人字门错位量', value: 2.8, display: '2.8', warning: 5, unit: 'mm', direction: 'lower' },
      { label: '输水阀门启闭差', value: 1.6, display: '1.6', warning: 3, unit: 's', direction: 'lower' },
    ],
    stages: [
      { name: '船流消散与停航封控', window: 'D-7–D0', owner: '通航调度', progress: 64, state: '执行中', gate: '上下游待闸船清零' },
      { name: '叠梁门封堵与闸室排水', window: 'D1–D2', owner: '水工班', progress: 0, state: '待开始', gate: '隔离及渗漏验收' },
      { name: '闸门、埋件及阀门检修', window: 'D3–D9', owner: '金结 / 机电班', progress: 0, state: '待开始', gate: '关键焊缝与支承验收' },
      { name: '闸室结构与导航设施处理', window: 'D6–D10', owner: '土建 / 导航班', progress: 0, state: '待开始', gate: '衬砌与系船设施验收' },
      { name: '充水联调与恢复通航', window: 'D11–D13', owner: '调试 / 通航调度', progress: 0, state: '待开始', gate: '空载及实船试运行' },
    ],
    risks: [
      { title: '船流消散慢压缩停航窗口', level: '高', control: '分时放行与上下游锚地容量联动预测' },
      { title: '隔离渗漏超过排水能力', level: '高', control: '叠梁门止水预处理并配置双路排水' },
      { title: '门体裂纹扩大检修范围', level: '中', control: '预备修复工艺与 18 h 机动工期' },
    ],
    resources: [
      { name: '上下游锚地容量', demand: '≥ 140 艘', readiness: 94, note: '下游临时区待启用' },
      { name: '检修叠梁门', demand: '2 套', readiness: 100, note: '吊点复验完成' },
      { name: '移动排水泵', demand: '3 用 1 备', readiness: 100, note: '联动试验通过' },
      { name: '水下/高空检测组', demand: '12 人', readiness: 86, note: '潜水班次待协调' },
    ],
    intelligence: {
      model: '船流到达预测 + 停航窗口关键路径 + 闸门缺陷范围推演',
      inputs: ['AIS/过闸计划', '锚地容量', '叠梁门渗漏', '闸门历史缺陷与工时'],
      recommendation: '提前 36 小时执行限流，可在停航起点前消散 29 艘船；门体 NDT 与闸室结构检查采用双作业面。',
      constraint: '通航效率优化不得降低隔离安全、受限空间和起重作业条件。',
      benefit: '预计减少停航前拥堵 23%，恢复通航日期置信度提升至 88%。',
    },
    basis: 'USACE 液压钢结构检查指南与船闸充泄水系统维护要求',
  },
  'mpm-8': {
    id: 'mpm-8',
    code: 'WO-HOIST-26022',
    title: '液压启闭机系统维保',
    subtitle: '覆盖油液清洁度、压力保持、双缸同步、密封和安全阀整定的可靠性维保闭环',
    asset: '溢洪道 2# 液压启闭机 · 2 × 1600 kN',
    discipline: '液压 / 电控 / 金属结构',
    status: '油液冲洗',
    statusTone: 'blue',
    window: '08-27 — 09-02',
    completion: 53,
    readiness: 98,
    confidence: 94,
    layout: 'reliability',
    sceneTitle: '液压回路、双缸同步与负载保持监控',
    sceneNote: '关联泵站、阀组、油缸、位移传感器和门体载荷，追踪污染与内泄漏路径',
    kpis: [
      { label: '油液清洁度', value: '17/15/12', note: '目标达成', tone: 'green' },
      { label: '双缸同步偏差', value: '1.4', unit: 'mm', note: '控制值 ≤ 3 mm', tone: 'green' },
      { label: '保压衰减', value: '0.3', unit: 'MPa/10min', note: '低于限值', tone: 'blue' },
      { label: '阀组复验', value: '11/14', note: '3 项待负载试验', tone: 'amber' },
    ],
    signals: [
      { label: '系统压力', value: 15.8, display: '15.8', warning: 18, unit: 'MPa', direction: 'lower' },
      { label: '回油过滤器压差', value: 0.18, display: '0.18', warning: 0.35, unit: 'MPa', direction: 'lower' },
      { label: '油温', value: 43, display: '43', warning: 55, unit: '℃', direction: 'lower' },
      { label: '油箱含水率', value: 126, display: '126', warning: 200, unit: 'ppm', direction: 'lower' },
    ],
    stages: [
      { name: '门体锁定与液压卸压', window: 'D1', owner: '运行 / 机械班', progress: 100, state: '完成', gate: '机械锁定与零压确认' },
      { name: '油样分析与回路诊断', window: 'D1–D2', owner: '油务 / 液压班', progress: 100, state: '完成', gate: '污染源定位' },
      { name: '阀组、密封与滤芯更换', window: 'D2–D4', owner: '液压班', progress: 72, state: '执行中', gate: '部件清洁装配' },
      { name: '循环冲洗与清洁度复验', window: 'D4–D5', owner: '油务班', progress: 48, state: '执行中', gate: '连续两次油样合格' },
      { name: '保压、同步与负载试验', window: 'D6–D7', owner: '试验组', progress: 0, state: '待开始', gate: '安全阀及联锁验收' },
    ],
    risks: [
      { title: '污染残留导致伺服阀卡滞', level: '高', control: '以连续两次清洁度合格作为装复质量门' },
      { title: '门体意外下滑', level: '高', control: '机械锁定、液压卸压和位移联锁三重隔离' },
      { title: '双缸不同步造成门体扭曲', level: '中', control: '低速分级加载并实时比较位移差' },
    ],
    resources: [
      { name: '离线循环滤油车', demand: '2 台', readiness: 100, note: 'β 值和流量满足' },
      { name: '伺服阀/比例阀备件', demand: '4 件', readiness: 100, note: '清洁封装' },
      { name: '油缸密封组件', demand: '2 套', readiness: 100, note: '材质批次确认' },
      { name: '颗粒度/含水检测', demand: '现场 1 套', readiness: 92, note: '含水探头待校验' },
    ],
    intelligence: {
      model: '液压回路故障树 + 污染趋势诊断 + 双缸同步残差监测',
      inputs: ['压力/流量/温度', '油液颗粒度与含水率', '双缸位移', '阀控指令与响应'],
      recommendation: '污染峰值与旁通阀动作同步，建议更换旁通阀密封并延长低流量冲洗 2 小时，而非更换主泵。',
      constraint: '负载试验前必须完成机械锁定复核和安全阀独立校验。',
      benefit: '避免误换主泵，预计减少 14 小时拆装并保留故障证据链。',
    },
    basis: 'USBR 机械维护与液压设备检查原则：泄漏、压力保护、清洁度和功能试验',
  },
  'mpm-9': {
    id: 'mpm-9',
    code: 'WO-TUN-26006',
    title: '尾水隧洞排空检修计划',
    subtitle: '以安全隔离、受控排空、通风检测、衬砌缺陷和恢复充水为核心的隧洞检修计划',
    asset: '2# 尾水隧洞 · 长 1.8 km',
    discipline: '水工 / 地质 / 受限空间',
    status: '受控排空',
    statusTone: 'amber',
    window: '10-08 — 10-16',
    completion: 29,
    readiness: 92,
    confidence: 87,
    layout: 'safety',
    sceneTitle: '排空边界、衬砌缺陷与人员路径模型',
    sceneNote: '模拟叠梁门隔离、残水线、通风分区、裂缝/渗漏点和应急撤离距离',
    kpis: [
      { label: '排空完成度', value: '72', unit: '%', note: '剩余水深 0.8 m', tone: 'blue' },
      { label: '氧含量', value: '20.8', unit: '%', note: '通风正常', tone: 'green' },
      { label: '已识别缺陷', value: '14', unit: '处', note: '3 处需工程评定', tone: 'amber' },
      { label: '撤离覆盖', value: '100', unit: '%', note: '通信中继已布设', tone: 'green' },
    ],
    signals: [
      { label: '叠梁门渗漏量', value: 22, display: '22', warning: 35, unit: 'L/s', direction: 'lower' },
      { label: '洞内氧含量', value: 20.8, display: '20.8', warning: 19.5, unit: '%', direction: 'higher' },
      { label: '最大裂缝宽度', value: 0.42, display: '0.42', warning: 0.5, unit: 'mm', direction: 'lower' },
      { label: '衬砌渗水量', value: 8.6, display: '8.6', warning: 15, unit: 'L/min', direction: 'lower' },
    ],
    stages: [
      { name: '上下游隔离与结构复核', window: 'D1', owner: '水工 / 结构组', progress: 100, state: '完成', gate: '外水压力与隔离验算' },
      { name: '分级排空与渗漏监测', window: 'D1–D2', owner: '运行班', progress: 72, state: '执行中', gate: '排空速率及渗漏稳定' },
      { name: '通风、气体与应急通信', window: 'D2', owner: '安全组', progress: 86, state: '执行中', gate: '受限空间准入' },
      { name: '全断面扫描与近接检查', window: 'D3–D6', owner: '检测 / 地质组', progress: 0, state: '待开始', gate: '缺陷分级清单' },
      { name: '修复、复测与分级充水', window: 'D6–D9', owner: '水工班 / 运行班', progress: 0, state: '待开始', gate: '结构评定与充水许可' },
    ],
    risks: [
      { title: '排空后外水压力作用于衬砌', level: '高', control: '排空前复核外水位与衬砌稳定，异常时改用 ROV 检查' },
      { title: '隔离渗漏与突发进水', level: '高', control: '双路排水、流量报警和上游专人监护' },
      { title: '落石/衬砌剥落与气体风险', level: '高', control: '先行遥测扫描、强制通风和分区准入' },
    ],
    resources: [
      { name: '叠梁门与密封', demand: '2 道', readiness: 100, note: '渗漏试验完成' },
      { name: '排水泵组', demand: '2 用 1 备', readiness: 100, note: '备用电源接入' },
      { name: '移动扫描/ROV', demand: '各 1 套', readiness: 84, note: 'ROV 声呐待复测' },
      { name: '通风与通信中继', demand: '6 站', readiness: 92, note: '末端站电池待更换' },
    ],
    intelligence: {
      model: '多期点云变化检测 + 缺陷图像分割 + 排空/充水风险规则引擎',
      inputs: ['排水量与渗漏', '气体/通风数据', '点云与影像', '外水位和衬砌历史缺陷'],
      recommendation: 'K1+240 至 K1+310 存在渗水聚集，建议先以 ROV 复核上游侧，再决定是否允许人员近接检查。',
      constraint: '衬砌稳定性存在疑问时不得仅凭计划强制排空入洞，应切换远程检查方案。',
      benefit: '将人员暴露于未知区段的时间预计降低 31%，同时保留可追溯缺陷坐标。',
    },
    basis: 'USBR 输水隧洞设计与检查指南：排空前结构复核、外水压力和 ROV 替代检查',
  },
};
