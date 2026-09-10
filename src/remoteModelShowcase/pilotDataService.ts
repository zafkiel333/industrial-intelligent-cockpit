import { buildDataTimeline } from './dataTimeline';
import { registerUnifiedHydroRoutes, checkVerification, readRun, unifiedRoot, unifiedSummary } from './unifiedHydroService';
import { adaptiveForecast, forecastTraining } from './adaptiveForecast';
import { harmonicForecast } from './harmonicForecast';
import { HYDRO_THRESHOLD_MODEL } from './thresholdModel';
import { buildDataInspection } from './dataInspection';
import type { Request, Response } from 'express';
import { createHash, randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import * as xlsx from 'xlsx';
import { ZipArchive } from 'archiver';
import PDFDocument from 'pdfkit';
import { Document, HeadingLevel, Packer, Paragraph } from 'docx';
import { getModelShowcaseConfig, isModelShowcaseSceneId, MODEL_SHOWCASE_SCENE_IDS } from './modelCatalog';
import { getModelOperationalProfile } from './modelOperationalProfiles';
import type { ModelShowcaseSceneId } from './types';
import {
  HYDRO_VALIDATION_FAULTS,
  HYDRO_VALIDATION_FIELDS,
  hydroValidationDefinitions,
  type HydroFaultCode,
  type HydroValidationTag,
} from './hydroValidationSuite';

xlsx.set_fs(fs);

export const PILOT_DATA_SCENE_IDS = MODEL_SHOWCASE_SCENE_IDS;
export type PilotSceneId = ModelShowcaseSceneId;
type ImportMode = 'replace' | 'append';
type ConflictPolicy = 'keep-existing' | 'replace-existing' | 'reject';
type Quality = 'good' | 'uncertain' | 'bad';
type ImportSource = 'standard' | 'modbus' | 'iec61850';

interface FieldRule {
  field: string;
  label: string;
  unit: string;
  normalMin: number;
  normalMax: number;
  base: number;
  amplitude: number;
  decimals: number;
  modbusAddress: number;
  iec61850Path: string;
}

interface ModelDataProfile {
  sampleIntervalSeconds: number;
  forecastSteps: number;
  forecastLabel: string;
  fields: FieldRule[];
}

export interface DataRecord {
  source_device_id?: string;
  timestamp: string;
  device_id: string;
  quality: Quality;
  values: Record<string, number>;
  batch_id: string;
}

interface BatchManifest {
  batchId: string;
  fileName: string;
  fileSize: number;
  sha256: string;
  format: 'csv' | 'xlsx' | 'json' | 'modbus' | 'iec61850';
  source?: ImportSource;
  deviceId: string;
  mode: ImportMode;
  conflictPolicy: ConflictPolicy;
  importedAt: string;
  rowCount: number;
  acceptedCount: number;
  rejectedCount: number;
  duplicateCount: number;
  status: 'completed';
  sclFileName?: string;
  sclPath?: string;
  sclSha256?: string;
  sclSize?: number;
}

interface ImportPreview {
  verification?: { matched: number; excluded: number; coverage: number };
  source: ImportSource;
  sourceLabel: string;
  fileFormat: 'csv' | 'xlsx' | 'json';
  sourceRowCount: number;
  validRecordCount: number;
  rejectedRecordCount: number;
  mappedPointCount: number;
  requiredPointCount: number;
  mappings: Array<{ sourceKey: string; field: string; label: string; unit: string; observed: boolean }>;
  unmappedPoints: string[];
  missingRequiredPoints: string[];
  timeRange: { startAt: string | null; endAt: string | null };
  quality: { good: number; uncertain: number; bad: number };
  correctedValueCount: number;
  invalidValueCount: number;
  incompleteRecordCount: number;
  duplicatePointCount: number;
  scl: { fileName: string; size: number; savedAfterConfirmation: boolean } | null;
  impact: {
    currentDeviceRecords: number;
    duplicateTimes: number;
    estimatedDeviceRecords: number;
    estimatedTotalRecords: number;
  };
  warnings: string[];
}

export interface StoredState {
  schemaVersion: 1;
  dataVersion: string;
  updatedAt: string;
  records: DataRecord[];
  batches: BatchManifest[];
}

interface ImportTask {
  verificationCaseId?: string;
  focusBatchId?: string;
  batchId: string;
  sceneId: PilotSceneId;
  deviceId: string;
  fileName: string;
  fileSize: number;
  format: 'csv' | 'xlsx' | 'json';
  source: ImportSource;
  mode: ImportMode;
  conflictPolicy: ConflictPolicy;
  uploadedBytes: number;
  parsedRows: number;
  totalRows: number | null;
  stage: 'uploading' | 'previewing' | 'previewed' | 'importing' | 'completed' | 'failed' | 'cancelled';
  error: string | null;
  createdAt: string;
  updatedAt: string;
  tempPath: string;
  normalizedPath: string;
  sclFileName: string | null;
  sclFileSize: number;
  sclUploadedBytes: number;
  sclTempPath: string | null;
  preview: ImportPreview | null;
}

interface NormalizedRows {
  records: DataRecord[];
  rejected: number;
  observedFields: Set<string>;
  unmappedPoints: Set<string>;
  correctedValueCount: number;
  invalidValueCount: number;
  incompleteRecordCount: number;
  duplicatePointCount: number;
}

interface HydroValidationFileSummary {
  fileName: string;
  sha256: string;
  rowCount: number;
  startAt: string;
  endAt: string;
  uploadedAt: string;
}

interface HydroFieldValidationMetric {
  field: string;
  label: string;
  unit: string;
  mae: number;
  rmse: number;
  normalizedMae: number;
  smape: number;
  intervalCoverage: number;
}

interface HydroValidationResult {
  actualTag: HydroValidationTag;
  actualFaultCode: HydroFaultCode | null;
  actualFaultName: string;
  actualFaultPart: string;
  statusCorrect: boolean;
  faultCorrect: boolean;
  conclusionCorrect: boolean;
  normalizedMae: number;
  smape: number;
  intervalCoverage: number;
  fieldMetrics: HydroFieldValidationMetric[];
  actualSeries: Array<{
    timestamp: string;
    values: Record<string, number>;
  }>;
  verifiedAt: string;
}

interface HydroValidationCaseRecord {
  caseId: string;
  deviceId: string;
  status: 'predicted' | 'verified';
  observation: HydroValidationFileSummary;
  prediction: {
    generatedAt: string;
    tag: HydroValidationTag;
    faultCode: HydroFaultCode | null;
    faultName: string;
    faultPart: string;
    conclusion: string;
    riskLevel: 'healthy' | 'attention' | 'warning' | 'critical';
    healthScore: number;
    forecasts: Array<{ field: string; timestamp: string; predicted: number; lower: number; upper: number }>;
  };
  verification?: HydroValidationFileSummary;
  result?: HydroValidationResult;
}

interface HydroValidationIndexEntry {
  caseId: string;
  deviceId: string;
  status: 'predicted' | 'verified';
  observation: HydroValidationFileSummary;
  predictedTag: HydroValidationTag;
  predictedFaultCode: HydroFaultCode | null;
  predictedFaultName: string;
  predictedFaultPart: string;
  conclusion: string;
  riskLevel: 'healthy' | 'attention' | 'warning' | 'critical';
  healthScore: number;
  verification?: HydroValidationFileSummary;
  result?: HydroValidationResult;
}

interface HydroValidationIndex {
  schemaVersion: 1;
  updatedAt: string;
  records: HydroValidationIndexEntry[];
}

type DownloadSection = { heading: string; lines: string[] };

const imports = new Map<string, ImportTask>();

const LEGACY_PROFILES: Partial<Record<PilotSceneId, ModelDataProfile>> = {
  'sim-visual-hydro-turbine': profile(60, 360, '未来 6 小时', [
    ['rpm', '转速', 'r/min', 140, 160, 150, 3.2, 1, 40001, 'LD0/MMXU1.RotSpd.mag.f'],
    ['temperature', '轴承温度', '°C', 35, 75, 54, 5, 1, 40003, 'LD0/TTMP1.Tmp.mag.f'],
    ['vibration', '主轴振动', 'mm/s', 0, 4.5, 1.6, 0.55, 2, 40005, 'LD0/SVBR1.Vbr.mag.f'],
    ['pressure', '水压', 'MPa', 1.1, 2.4, 1.75, 0.18, 2, 40007, 'LD0/MMXU1.HydPres.mag.f'],
    ['flow_rate', '流量', 'm³/s', 18, 42, 31, 3.5, 2, 40009, 'LD0/MMXU1.Flwrte.mag.f'],
    ['power_output', '输出功率', 'MW', 12, 32, 23, 3.2, 2, 40011, 'LD0/MMXU1.TotW.mag.f'],
  ]),
  'sim-visual-wastewater-pump': profile(60, 360, '未来 6 小时', [
    ['rpm', '转速', 'r/min', 1380, 1520, 1450, 22, 1, 40001, 'LD0/MMXU1.RotSpd.mag.f'],
    ['temperature', '泵体温度', '°C', 25, 70, 44, 4.5, 1, 40003, 'LD0/TTMP1.Tmp.mag.f'],
    ['vibration', '泵体振动', 'mm/s', 0, 4.5, 1.45, 0.5, 2, 40005, 'LD0/SVBR1.Vbr.mag.f'],
    ['pressure', '出口压力', 'MPa', 0.28, 0.68, 0.47, 0.05, 3, 40007, 'LD0/MMXU1.Pres.mag.f'],
    ['flow_rate', '流量', 'm³/h', 55, 115, 86, 8, 2, 40009, 'LD0/MMXU1.Flwrte.mag.f'],
    ['power_output', '功率', 'kW', 20, 55, 36, 4, 2, 40011, 'LD0/MMXU1.TotW.mag.f'],
  ]),
  'sim-visual-bridge-crane': profile(10, 180, '未来 30 分钟', [
    ['load_weight', '负载重量', 't', 0, 20, 8.5, 2.2, 2, 40001, 'LD0/MMXU1.Load.mag.f'],
    ['trolley_position', '小车位置', 'm', 0, 28, 13.5, 8, 2, 40003, 'LD0/GGIO1.AnIn1.mag.f'],
    ['crane_speed', '运行速度', 'm/min', 0, 40, 18, 4.5, 2, 40005, 'LD0/MMXU1.Spd.mag.f'],
    ['motor_temperature', '电机温度', '°C', 25, 80, 51, 6, 1, 40007, 'LD0/TTMP1.Tmp.mag.f'],
    ['vibration', '结构振动', 'mm/s', 0, 5, 1.8, 0.65, 2, 40009, 'LD0/SVBR1.Vbr.mag.f'],
  ]),
  'sim-visual-haul-truck': profile(30, 240, '未来 2 小时', [
    ['rpm', '发动机转速', 'r/min', 650, 2100, 1320, 210, 1, 40001, 'LD0/MMXU1.RotSpd.mag.f'],
    ['temperature', '发动机温度', '°C', 65, 105, 86, 4.8, 1, 40003, 'LD0/TTMP1.Tmp.mag.f'],
    ['vibration', '车体振动', 'mm/s', 0, 7, 2.7, 0.8, 2, 40005, 'LD0/SVBR1.Vbr.mag.f'],
    ['pressure', '液压压力', 'MPa', 12, 28, 20, 2.2, 2, 40007, 'LD0/MMXU1.Pres.mag.f'],
    ['flow_rate', '燃油流量', 'L/h', 18, 68, 39, 7, 2, 40009, 'LD0/MMXU1.Flwrte.mag.f'],
    ['power_output', '输出功率', 'kW', 120, 380, 250, 38, 2, 40011, 'LD0/MMXU1.TotW.mag.f'],
  ]),
};

const LEGACY_WARNING_PARTS: Partial<Record<PilotSceneId, Record<string, string>>> = {
  'sim-visual-hydro-turbine': {
    rpm: '调速器与旋转轴系', temperature: '主轴承及润滑冷却回路', vibration: '主轴、联轴器与转轮',
    pressure: '引水流道与导叶机构', flow_rate: '进水口、导叶与转轮流道', power_output: '发电机及励磁系统',
  },
  'sim-visual-wastewater-pump': {
    rpm: '驱动电机与联轴器', temperature: '泵体轴承与机械密封', vibration: '叶轮、泵轴与安装基础',
    pressure: '出口管路与止回阀', flow_rate: '吸入口、格栅与叶轮流道', power_output: '驱动电机及供电回路',
  },
  'sim-visual-bridge-crane': {
    load_weight: '吊钩、钢丝绳与起升机构', trolley_position: '小车限位与位置编码器', crane_speed: '大车驱动与制动机构',
    motor_temperature: '起升及运行电机', vibration: '桥架、端梁与轨道连接',
  },
  'sim-visual-haul-truck': {
    rpm: '发动机与传动系统', temperature: '发动机冷却系统', vibration: '传动轴、悬挂与车架',
    pressure: '液压泵阀与执行管路', flow_rate: '燃油供给与滤清系统', power_output: '发动机及动力输出系统',
  },
};

function profile(sampleIntervalSeconds: number, forecastSteps: number, forecastLabel: string, rows: Array<[string, string, string, number, number, number, number, number, number, string]>): ModelDataProfile {
  return {
    sampleIntervalSeconds,
    forecastSteps,
    forecastLabel,
    fields: rows.map(([field, label, unit, normalMin, normalMax, base, amplitude, decimals, modbusAddress, iec61850Path]) => ({ field, label, unit, normalMin, normalMax, base, amplitude, decimals, modbusAddress, iec61850Path })),
  };
}

const PROFILES = new Proxy({} as Record<PilotSceneId, ModelDataProfile>, {
  get: (_target, key: string) => getModelOperationalProfile(key as PilotSceneId),
});
const WARNING_PARTS = new Proxy({} as Record<PilotSceneId, Record<string, string>>, {
  get: (_target, key: string) => Object.fromEntries(getModelOperationalProfile(key as PilotSceneId).fields.map(field => [field.field, field.part])),
});
void LEGACY_PROFILES;
void LEGACY_WARNING_PARTS;

function isPilotSceneId(value: string): value is PilotSceneId {
  return isModelShowcaseSceneId(value);
}

function safeScene(req: Request): PilotSceneId {
  const value = Array.isArray(req.params.sceneId) ? req.params.sceneId[0] : req.params.sceneId;
  if (!isPilotSceneId(value)) throw httpError(404, '未找到对应的模型数据页面');
  return value;
}

function httpError(status: number, message: string): Error & { status: number } {
  return Object.assign(new Error(message), { status });
}

function rootFor(dataDirectory: string, sceneId: PilotSceneId): string {
  const config = getModelShowcaseConfig(sceneId)!;
  return path.join(dataDirectory, 'model-showcase', `${sceneId}__model-${config.modelId}`);
}

function ensureDirectories(dataDirectory: string, sceneId: PilotSceneId): string {
  const root = rootFor(dataDirectory, sceneId);
  for (const child of ['current', 'batches', 'imports', 'reference', path.join('protocol', 'scl'), path.join('validation','unified')]) fs.mkdirSync(path.join(root, child), { recursive: true });
  if (sceneId === 'sim-visual-hydro-turbine') {
    for (const child of [path.join('validation', 'cases'), path.join('validation', 'uploads')]) fs.mkdirSync(path.join(root, child), { recursive: true });
  }
  ensureReferenceDocuments(root, sceneId);
  return root;
}

function schemaFor(sceneId: PilotSceneId) {
  const config = getModelShowcaseConfig(sceneId)!;
  const p = PROFILES[sceneId];
  return {
    schemaVersion: 1,
    sceneId,
    modelId: config.modelId,
    modelName: config.title,
    required: ['timestamp', 'device_id', 'quality', ...p.fields.map((field) => field.field)],
    fields: p.fields,
    importSources: {
      standard: { formats: ['csv', 'xlsx', 'json'], structure: '每行一条完整时间记录，列名使用模型字段' },
      modbus: { formats: ['csv', 'xlsx', 'json'], structure: '固定字段长表，每行一个寄存器点值', requiredColumns: requiredProtocolColumns('modbus') },
      iec61850: { formats: ['csv', 'xlsx', 'json'], structure: '固定字段长表，每行一个对象点值', requiredColumns: requiredProtocolColumns('iec61850'), scl: ['icd', 'cid', 'scd', 'ssd', 'xml'], sclStorage: 'protocol/scl，确认导入后永久保存' },
    },
    obviousExceptionPolicy: {
      normalize: ['字段首尾空白', '英文/中文小数分隔符', '常见质量值大小写'],
      rejectValue: ['空值', '非数值', '非有限数值', '明显超出模型合理范围'],
      rejectRecord: ['时间戳无效', '任一必需点位缺失或无效'],
      duplicatePoint: '同一时间同一点位保留文件中最后一个值并在预检计数',
    },
    qualityValues: ['good', 'uncertain', 'bad'],
    sampleIntervalSeconds: p.sampleIntervalSeconds,
    forecast: { steps: p.forecastSteps, label: p.forecastLabel },
    verification: { entry: '使用独立的“导入验证数据”按钮', reference: '只使用所选设备的当前历史生成预测；验证数据不参与预测拟合', optionalFields: ['actual_tag','actual_fault_code','actual_fault_name','actual_fault_part'], tags: ['normal','abnormal'], faultCodes: getModelOperationalProfile(sceneId).faultProfiles.map(fault=>fault.code), timeAlignment: '匹配原预测时间戳；部分覆盖补齐前不计入完整核验；缺少标签只计算误差', storage: 'validation/unified，保存原预测与参考快照' },
  };
}

function ensureReferenceDocuments(root: string, sceneId: PilotSceneId): void {
  const reference = path.join(root, 'reference');
  const config = getModelShowcaseConfig(sceneId)!;
  const p = PROFILES[sceneId];
  const schema = schemaFor(sceneId);
  const files: Record<string, string> = {
    'README.md': `# ${config.title} 数据目录\n\n- 页面：${sceneId}\n- 模型 ID：${config.modelId}\n- current：当前活动数据和版本\n- batches：已接收的原始批次\n- imports：尚未完成的分块上传与导入预检\n- reference：数据规范、算法、固定协议字段说明和三格式样例\n- protocol/scl：确认导入后永久保存的 IEC 61850 SCL 文件\n- validation/unified：保存预测、后续实测和累计核验结果\n\n通用表格、Modbus 和 IEC 61850 来源文件只在解析入口不同，字段标准化后进入同一存储、展示、预测和诊断链路。SCL 文件用于辅助核对 IEC 61850 点位模型，不作为历史测量记录，但会与所属导入批次关联并永久保存。\n`,
    'data-schema.json': JSON.stringify(schema, null, 2),
    '协议长表固定字段与异常处理.md': `# 协议长表固定字段与异常处理\n\n## Modbus 固定字段\n\n${requiredProtocolColumns('modbus').join(',')}\n\n## IEC 61850 固定字段\n\n${requiredProtocolColumns('iec61850').join(',')}\n\n字段名称固定且区分用途，可增加额外列，但不能缺少上述列。每行允许个别值缺位；空值、非数值和明显越界值会在预检中计数并剔除。某一时间点缺少任一模型必需点位时，该完整时间记录不导入。简单空白、小数分隔符和质量值大小写会自动规范化。同一时间同一点位重复时保留文件中最后一个值并给出计数。\n\nIEC 61850 可附带 ICD/CID/SCD/SSD/XML；确认导入后保存到 protocol/scl，并在批次清单中记录文件名、大小、相对路径和 SHA-256。删除运行数据、删除批次或重置不自动删除已归档 SCL。\n`,
    'algorithm.md': `# 预测与诊断算法\n\n推荐采样间隔：${p.sampleIntervalSeconds} 秒。预测窗口：${p.forecastLabel}。\n\n每个指标使用最近最多 720 个连续等间隔有效点，先进行稳健局部水平和抗异常斜率估计，再通过滚动起点回测比较指数平滑基线、阻尼趋势和周期趋势三类候选。周期候选要求重复相关性不低于 0.55，且多步 MAE 比非周期基线改善至少 8%；否则使用更保守的非周期模型。预测值不按正常上下限裁剪，仅约束非负物理量。误差带按滚动回测绝对误差 90% 分位和短期噪声共同估计，并随预测距离扩展，不代表已校准置信区间。质量 bad 或采样缺口会切断训练段。\n\n预警不是由单个预测点触发：未来预测需要持续越过模型参考范围后才形成预警。系统输出首次越界时间、方向、峰值、持续点数及模型对应部位，再将当前偏离、趋势、残差和未来持续越界共同计入故障风险。参考范围用于工程筛查，不替代现场保护定值。\n`,
  };
  for (const [name, content] of Object.entries(files)) {
    const target = path.join(reference, name);
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) fs.writeFileSync(target, content, 'utf8');
  }
  const sampleRows = generatedRecords(sceneId, `${config.modelId}-01`, 30).map((record) => ({ timestamp: record.timestamp, device_id: record.device_id, quality: record.quality, ...record.values }));
  const sampleSheet = xlsx.utils.json_to_sheet(sampleRows);
  const csvPath = path.join(reference, 'sample.csv');
  const jsonPath = path.join(reference, 'sample.json');
  const xlsxPath = path.join(reference, 'sample.xlsx');
  if (!fs.existsSync(csvPath)) fs.writeFileSync(csvPath, xlsx.utils.sheet_to_csv(sampleSheet), 'utf8');
  if (!fs.existsSync(jsonPath)) fs.writeFileSync(jsonPath, JSON.stringify({ records: sampleRows }, null, 2), 'utf8');
  if (!fs.existsSync(xlsxPath) || fs.statSync(xlsxPath).size < 1_000) {
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, sampleSheet, 'data');
    fs.writeFileSync(xlsxPath, xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
  }
  for (const source of ['modbus', 'iec61850'] as const) {
    const protocolRows = protocolRowsForSample(sceneId, `${config.modelId}-01`, source);
    const protocolSheet = xlsx.utils.json_to_sheet(protocolRows);
    const protocolJsonPath = path.join(reference, `${source}-sample.json`);
    const protocolCsvPath = path.join(reference, `${source}-sample.csv`);
    const protocolXlsxPath = path.join(reference, `${source}-sample.xlsx`);
    if (!fs.existsSync(protocolJsonPath)) fs.writeFileSync(protocolJsonPath, JSON.stringify({ source, deviceId: `${config.modelId}-01`, records: protocolRows }, null, 2), 'utf8');
    if (!fs.existsSync(protocolCsvPath)) fs.writeFileSync(protocolCsvPath, xlsx.utils.sheet_to_csv(protocolSheet), 'utf8');
    if (!fs.existsSync(protocolXlsxPath) || fs.statSync(protocolXlsxPath).size < 1_000) {
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, protocolSheet, source === 'modbus' ? 'Modbus' : 'IEC 61850');
      fs.writeFileSync(protocolXlsxPath, xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
    }
  }
}

function statePath(dataDirectory: string, sceneId: PilotSceneId): string {
  return path.join(ensureDirectories(dataDirectory, sceneId), 'current', 'state.json');
}

function emptyState(): StoredState {
  const now = new Date().toISOString();
  return { schemaVersion: 1, dataVersion: randomUUID(), updatedAt: now, records: [], batches: [] };
}

function readState(dataDirectory: string, sceneId: PilotSceneId): StoredState {
  const target = statePath(dataDirectory, sceneId);
  if (!fs.existsSync(target)) return emptyState();
  return JSON.parse(fs.readFileSync(target, 'utf8')) as StoredState;
}

function writeState(dataDirectory: string, sceneId: PilotSceneId, state: StoredState): void {
  const target = statePath(dataDirectory, sceneId);
  const temp = `${target}.${randomUUID()}.tmp`;
  state.dataVersion = randomUUID();
  state.updatedAt = new Date().toISOString();
  fs.writeFileSync(temp, JSON.stringify(state));
  fs.renameSync(temp, target);
}

function generatedRecords(sceneId: PilotSceneId, deviceId: string, count = 120): DataRecord[] {
  const p = PROFILES[sceneId];
  const start = Date.now() - (count - 1) * p.sampleIntervalSeconds * 1000;
  const batchId = `initial-${sceneId}`;
  return Array.from({ length: count }, (_, index) => {
    const values = Object.fromEntries(p.fields.map((field, fieldIndex) => {
      const wave = Math.sin(index / 9 + fieldIndex * 0.72) * field.amplitude;
      const shortWave = Math.cos(index / 4.3 + fieldIndex) * field.amplitude * 0.18;
      return [field.field, Number((field.base + wave + shortWave).toFixed(field.decimals))];
    }));
    return { timestamp: new Date(start + index * p.sampleIntervalSeconds * 1000).toISOString(), device_id: deviceId, quality: 'good', values, batch_id: batchId };
  });
}

function initializedState(sceneId: PilotSceneId): StoredState {
  const config = getModelShowcaseConfig(sceneId)!;
  const records = generatedRecords(sceneId, `${config.modelId}-01`);
  return {
    schemaVersion: 1,
    dataVersion: randomUUID(),
    updatedAt: new Date().toISOString(),
    records,
    batches: [{
      batchId: `initial-${sceneId}`,
      fileName: 'initial-data.json',
      fileSize: Buffer.byteLength(JSON.stringify(records)),
      sha256: createHash('sha256').update(JSON.stringify(records)).digest('hex'),
      format: 'json',
      source: 'standard',
      deviceId: `${config.modelId}-01`,
      mode: 'replace',
      conflictPolicy: 'replace-existing',
      importedAt: new Date().toISOString(),
      rowCount: records.length,
      acceptedCount: records.length,
      rejectedCount: 0,
      duplicateCount: 0,
      status: 'completed',
    }],
  };
}

function ensureState(dataDirectory: string, sceneId: PilotSceneId): StoredState {
  const target = statePath(dataDirectory, sceneId);
  if (!fs.existsSync(target)) writeState(dataDirectory, sceneId, initializedState(sceneId));
  return readState(dataDirectory, sceneId);
}

function parseFormat(fileName: string): 'csv' | 'xlsx' | 'json' {
  const extension = path.extname(fileName).toLowerCase().slice(1);
  if (extension === 'csv' || extension === 'xlsx' || extension === 'json') return extension;
  throw httpError(400, '仅支持 CSV、XLSX 和 JSON 文件');
}

function parseImportSource(value: unknown): ImportSource {
  return value === 'modbus' || value === 'iec61850' ? value : 'standard';
}

function sanitizeFileName(value: unknown): string {
  const fileName = path.basename(String(value || '')).replace(/[\u0000-\u001f]/g, '').slice(0, 180);
  if (!fileName) throw httpError(400, '文件名不能为空');
  return fileName;
}

function sanitizeSclFileName(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  const fileName = sanitizeFileName(value);
  const extension = path.extname(fileName).toLowerCase();
  if (!['.icd', '.cid', '.scd', '.ssd', '.xml'].includes(extension)) throw httpError(400, 'SCL 文件仅支持 ICD、CID、SCD、SSD 或 XML');
  return fileName;
}

function validateDeviceId(value: unknown): string {
  const deviceId = String(value || '').trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/.test(deviceId)) throw httpError(400, '设备 ID 需为 1-64 位字母、数字、点、下划线、冒号或连字符');
  return deviceId;
}

function rowsFromFile(task: ImportTask): Record<string, unknown>[] {
  if (task.format === 'json') {
    const parsed = JSON.parse(fs.readFileSync(task.tempPath, 'utf8')) as unknown;
    const rows = Array.isArray(parsed) ? parsed : parsed && typeof parsed === 'object' && Array.isArray((parsed as { records?: unknown }).records) ? (parsed as { records: unknown[] }).records : null;
    if (!rows) throw httpError(400, 'JSON 须为记录数组，或包含 records 数组');
    return rows.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object');
  }
  const workbook = xlsx.readFile(task.tempPath, { cellDates: true });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) throw httpError(400, '工作簿不包含可读取的工作表');
  return xlsx.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: null, raw: false });
}

function cell(row: Record<string, unknown>, aliases: string[]): unknown {
  for (const alias of aliases) {
    if (alias in row) return row[alias];
    const key = Object.keys(row).find((candidate) => candidate.trim().toLowerCase() === alias.toLowerCase());
    if (key) return row[key];
  }
  return undefined;
}

function rowTimestamp(row: Record<string, unknown>): number {
  const value = cell(row, ['timestamp', 'time', 'datetime', 'recorded_at', 'source_timestamp']);
  return value instanceof Date ? value.getTime() : Date.parse(String(value || ''));
}

function requiredProtocolColumns(source: 'modbus' | 'iec61850'): string[] {
  return source === 'modbus'
    ? ['timestamp', 'device_id', 'unit_id', 'function_code', 'address', 'raw_value', 'data_type', 'byte_order', 'scale', 'offset', 'unit', 'quality']
    : ['timestamp', 'device_id', 'ied', 'object_reference', 'functional_constraint', 'value', 'unit', 'quality'];
}

function validateProtocolColumns(source: 'modbus' | 'iec61850', rows: Record<string, unknown>[]): void {
  const first = rows[0];
  if (!first) throw httpError(400, `${source === 'modbus' ? 'Modbus' : 'IEC 61850'} 文件没有数据行`);
  const columns = new Set(Object.keys(first).map((key) => key.trim().toLowerCase()));
  const missing = requiredProtocolColumns(source).filter((column) => !columns.has(column));
  if (missing.length) throw httpError(400, `${source === 'modbus' ? 'Modbus' : 'IEC 61850'} 长表缺少固定字段：${missing.join(', ')}`);
}

function validateSclFile(task: ImportTask): void {
  if (!task.sclFileName || !task.sclTempPath) return;
  const content = fs.readFileSync(task.sclTempPath, 'utf8');
  if (!/<(?:\w+:)?SCL(?:\s|>)/i.test(content) || !/<(?:\w+:)?IED(?:\s|>)/i.test(content) || !/<(?:\w+:)?LDevice(?:\s|>)/i.test(content)) {
    throw httpError(400, 'SCL 文件未识别到 SCL、IED 或 LDevice 结构');
  }
}

function numericCell(value: unknown): { value: number; corrected: boolean } {
  if (typeof value === 'number') return { value, corrected: false };
  const raw = String(value ?? '').trim();
  if (!raw) return { value: Number.NaN, corrected: false };
  const normalized = raw.replace(/，/g, ',').replace(/\s/g, '').replace(/,/g, '.');
  const parsed = /^[-+]?0x[0-9a-f]+$/i.test(normalized)
    ? Number.parseInt(normalized.replace(/^[-+]?0x/i, ''), 16)
    : Number(normalized);
  return { value: parsed, corrected: normalized !== raw };
}

function obviouslyInvalidValue(rule: Pick<FieldRule, 'normalMin' | 'normalMax' | 'base'>, value: number): boolean {
  if (!Number.isFinite(value)) return true;
  const span = Math.max(rule.normalMax - rule.normalMin, Math.abs(rule.base) * 0.1, 1);
  const lower = rule.normalMin >= 0 ? 0 : rule.normalMin - span * 4;
  const upper = rule.normalMax + span * 4;
  return value < lower || value > upper;
}

function rowQuality(row: Record<string, unknown>): Quality {
  const value = String(cell(row, ['quality', 'q', 'validity']) ?? '').trim().toLowerCase();
  if (value === 'good' || value === 'valid' || value === 'ok') return 'good';
  if (value === 'bad' || value === 'invalid' || value === 'failure') return 'bad';
  return 'uncertain';
}

function qualityNeedsNormalization(row: Record<string, unknown>): boolean {
  const raw = cell(row, ['quality', 'q', 'validity']);
  if (raw === undefined || raw === null) return false;
  const text = String(raw);
  return text !== text.trim().toLowerCase();
}

function worseQuality(left: Quality, right: Quality): Quality {
  const rank: Record<Quality, number> = { good: 0, uncertain: 1, bad: 2 };
  return rank[right] > rank[left] ? right : left;
}

function protocolNumber(value: unknown, dataType: unknown, byteOrderValue?: unknown): number {
  const text = String(value ?? '').trim().replace(/，/g, ',');
  if (!text) return Number.NaN;
  const type = String(dataType || '').trim().toLowerCase();
  const byteOrder = String(byteOrderValue || 'ABCD').trim().toUpperCase();
  const wordValues = Array.isArray(value)
    ? value.map(Number)
    : text.includes(',') || /\s/.test(text) ? text.split(/[\s,;]+/).filter(Boolean).map((part) => /^0x/i.test(part) ? Number.parseInt(part.slice(2), 16) : Number(part)) : [];
  if (wordValues.length === 2 && wordValues.every((word) => Number.isInteger(word) && word >= 0 && word <= 0xffff) && ['float32', 'int32', 'uint32'].includes(type)) {
    const sourceBytes = [wordValues[0] >> 8, wordValues[0] & 0xff, wordValues[1] >> 8, wordValues[1] & 0xff];
    const orders: Record<string, number[]> = { ABCD: [0, 1, 2, 3], BADC: [1, 0, 3, 2], CDAB: [2, 3, 0, 1], DCBA: [3, 2, 1, 0] };
    const bytes = Buffer.from((orders[byteOrder] || orders.ABCD).map((index) => sourceBytes[index]));
    if (type === 'float32') return bytes.readFloatBE(0);
    if (type === 'int32') return bytes.readInt32BE(0);
    return bytes.readUInt32BE(0);
  }
  const numericText = text.includes(',') && !(wordValues.length === 2 && ['float32', 'int32', 'uint32'].includes(type)) ? text.replace(',', '.') : text;
  const numeric = /^[-+]?0x[0-9a-f]+$/i.test(numericText) ? Number.parseInt(numericText.replace(/^[-+]?0x/i, ''), 16) : Number(numericText);
  if (!Number.isFinite(numeric)) return Number.NaN;
  if (type === 'int16') {
    const word = numeric & 0xffff;
    return word >= 0x8000 ? word - 0x10000 : word;
  }
  if (type === 'uint16') return numeric & 0xffff;
  if (type === 'int32') return numeric | 0;
  if (type === 'uint32') return numeric >>> 0;
  return numeric;
}

function normalizeStandardRows(sceneId: PilotSceneId, task: ImportTask, rows: Record<string, unknown>[]): NormalizedRows {
  const rules = PROFILES[sceneId].fields;
  const records: DataRecord[] = [];
  let rejected = 0;
  const observedFields = new Set<string>();
  const unmappedPoints = new Set<string>();
  let correctedValueCount = 0;
  let invalidValueCount = 0;
  let incompleteRecordCount = 0;
  let duplicatePointCount = 0;
  const metadataKeys = new Set(['timestamp', 'time', 'datetime', 'recorded_at', 'device_id', 'deviceid', 'quality', 'values', 'case_id', 'actual_tag', 'actual_fault_code', 'actual_fault_name', 'actual_fault_part']);
  for (const row of rows) {
    const millis = rowTimestamp(row);
    const quality = rowQuality(row);
    if (qualityNeedsNormalization(row)) correctedValueCount += 1;
    const valuesContainer = row.values && typeof row.values === 'object' ? row.values as Record<string, unknown> : row;
    const values = Object.fromEntries(rules.map((rule) => {
      const parsed = numericCell(cell(valuesContainer, [rule.field, rule.label]));
      const value = parsed.value;
      if (parsed.corrected) correctedValueCount += 1;
      if (Number.isFinite(value) && !obviouslyInvalidValue(rule, value)) observedFields.add(rule.field);
      else invalidValueCount += 1;
      return [rule.field, obviouslyInvalidValue(rule, value) ? Number.NaN : value];
    }).filter(([, value]) => Number.isFinite(value)));
    for (const key of Object.keys(valuesContainer)) {
      const normalizedKey = key.trim().toLowerCase();
      if (!metadataKeys.has(normalizedKey) && !rules.some((rule) => normalizedKey === rule.field.toLowerCase() || key.trim() === rule.label)) unmappedPoints.add(key);
    }
    if (!Number.isFinite(millis) || Object.keys(values).length !== rules.length) {
      rejected += 1;
      if (Number.isFinite(millis)) incompleteRecordCount += 1;
      continue;
    }
    records.push({ timestamp: new Date(millis).toISOString(), device_id: task.deviceId, quality, values, batch_id: task.batchId });
  }
  records.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return { records, rejected, observedFields, unmappedPoints, correctedValueCount, invalidValueCount, incompleteRecordCount, duplicatePointCount };
}

function normalizeProtocolRows(sceneId: PilotSceneId, task: ImportTask, rows: Record<string, unknown>[]): NormalizedRows {
  const rules = PROFILES[sceneId].fields;
  const recordsByTime = new Map<string, { values: Record<string, number>; quality: Quality }>();
  const seenPoints = new Set<string>();
  const invalidTimes = new Set<string>();
  const observedFields = new Set<string>();
  const unmappedPoints = new Set<string>();
  let correctedValueCount = 0;
  let invalidValueCount = 0;
  let incompleteRecordCount = 0;
  let duplicatePointCount = 0;

  validateProtocolColumns(task.source as 'modbus' | 'iec61850', rows);

  for (const row of rows) {
    const millis = rowTimestamp(row);
    if (qualityNeedsNormalization(row)) correctedValueCount += 1;
    if (!Number.isFinite(millis)) {
      invalidTimes.add(`row-${invalidTimes.size}`);
      continue;
    }
    const timestamp = new Date(millis).toISOString();
    const sourceKeyValue = task.source === 'modbus'
      ? cell(row, ['address', 'register', 'register_address', 'modbus_address'])
      : cell(row, ['object_reference', 'objectReference', 'reference', 'path', 'iec61850_path']);
    const sourceKey = String(sourceKeyValue ?? '').trim();
    const rule = task.source === 'modbus'
      ? rules.find((candidate) => String(candidate.modbusAddress) === sourceKey.replace(/^HR/i, ''))
      : rules.find((candidate) => sourceKey === candidate.iec61850Path || sourceKey.endsWith(`/${candidate.iec61850Path}`));
    if (!rule) {
      if (sourceKey) unmappedPoints.add(sourceKey);
      continue;
    }

    const rawValue = cell(row, task.source === 'modbus' ? ['raw_value', 'register_value', 'value'] : ['value', 'measured_value', 'mag']);
    const originalRawText = String(rawValue ?? '');
    const rawText = originalRawText.trim();
    if (originalRawText !== rawText || rawText.includes(',') || rawText.includes('，') || /\s/.test(rawText)) correctedValueCount += 1;
    let value = protocolNumber(rawValue, cell(row, ['data_type', 'dataType']), cell(row, ['byte_order', 'byteOrder', 'word_order', 'wordOrder']));
    if (task.source === 'modbus' && Number.isFinite(value)) {
      const scale = Number(cell(row, ['scale', 'multiplier']) ?? 1);
      const offset = Number(cell(row, ['offset']) ?? 0);
      value = value * (Number.isFinite(scale) ? scale : 1) + (Number.isFinite(offset) ? offset : 0);
    }
    const group = recordsByTime.get(timestamp) || { values: {}, quality: 'good' as Quality };
    const pointKey = `${timestamp}|${rule.field}`;
    if (seenPoints.has(pointKey)) duplicatePointCount += 1;
    seenPoints.add(pointKey);
    recordsByTime.set(timestamp, group);
    if (!Number.isFinite(value) || obviouslyInvalidValue(rule, value)) {
      invalidValueCount += 1;
      // 文件最后一个点值无效时，也必须覆盖此前有效值，不能静默保留旧值。
      delete group.values[rule.field];
      continue;
    }

    observedFields.add(rule.field);
    group.values[rule.field] = value;
    group.quality = worseQuality(group.quality, rowQuality(row));
    recordsByTime.set(timestamp, group);
  }

  const records: DataRecord[] = [];
  let rejected = invalidTimes.size;
  for (const [timestamp, group] of recordsByTime) {
    if (rules.some((rule) => !Number.isFinite(group.values[rule.field]))) {
      rejected += 1;
      incompleteRecordCount += 1;
      continue;
    }
    records.push({ timestamp, device_id: task.deviceId, quality: group.quality, values: group.values, batch_id: task.batchId });
  }
  records.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return { records, rejected, observedFields, unmappedPoints, correctedValueCount, invalidValueCount, incompleteRecordCount, duplicatePointCount };
}

function normalizeRows(sceneId: PilotSceneId, task: ImportTask, rows: Record<string, unknown>[]): NormalizedRows {
  return task.source === 'standard'
    ? normalizeStandardRows(sceneId, task, rows)
    : normalizeProtocolRows(sceneId, task, rows);
}

function sourceKeyFor(rule: FieldRule, source: ImportSource): string {
  if (source === 'modbus') return String(rule.modbusAddress);
  if (source === 'iec61850') return rule.iec61850Path;
  return rule.field;
}

function sourceLabel(source: ImportSource): string {
  if (source === 'modbus') return 'Modbus';
  if (source === 'iec61850') return 'IEC 61850';
  return '通用表格';
}

function buildImportPreview(dataDirectory: string, sceneId: PilotSceneId, task: ImportTask): ImportPreview {
  validateSclFile(task);
  const rows = rowsFromFile(task);
  const normalized = normalizeRows(sceneId, task, rows);
  const sourceDevices = [...new Set(rows.map(row => String(cell(row, ['device_id', 'deviceId']) || '').trim()).filter(Boolean))];
  if (sourceDevices.length > 1) throw httpError(400, '一个数据文件只能属于一个具体设备，请拆分后导入');
  normalized.records.forEach(record => { record.source_device_id = sourceDevices[0] || task.deviceId; });
  const verification = task.verificationCaseId ? checkVerification(rootFor(dataDirectory, sceneId), task.verificationCaseId, task.deviceId, normalized.records, rows, false, sceneId) : null;
  if (!normalized.records.length) throw httpError(400, task.source === 'standard' ? '文件中没有通过校验的记录' : '协议文件没有形成包含全部必需点位的完整时间记录');
  fs.writeFileSync(task.normalizedPath, JSON.stringify(normalized.records), 'utf8');
  const rules = PROFILES[sceneId].fields;
  const state = ensureState(dataDirectory, sceneId);
  const currentDevice = state.records.filter((record) => record.device_id === task.deviceId);
  const currentTimes = new Set(currentDevice.map((record) => record.timestamp));
  const uniqueIncoming = new Map(normalized.records.map((record) => [record.timestamp, record]));
  const duplicateTimes = [...uniqueIncoming.keys()].filter((timestamp) => currentTimes.has(timestamp)).length;
  const estimatedDeviceRecords = task.mode === 'replace'
    ? uniqueIncoming.size
    : currentDevice.length + uniqueIncoming.size - duplicateTimes;
  const estimatedTotalRecords = state.records.length - currentDevice.length + estimatedDeviceRecords;
  const timestamps = [...uniqueIncoming.keys()].sort();
  const quality = [...uniqueIncoming.values()].reduce((counts, record) => ({ ...counts, [record.quality]: counts[record.quality] + 1 }), { good: 0, uncertain: 0, bad: 0 });
  const missingRequiredPoints = rules.filter((rule) => !normalized.observedFields.has(rule.field)).map((rule) => rule.label);
  const warnings = [
    sourceDevices[0] && sourceDevices[0] !== task.deviceId ? `文件设备 ${sourceDevices[0]} 将归入所选设备 ${task.deviceId}；确认导入表示确认此归属` : '',
    task.verificationCaseId ? '本次数据仅用于当前预测的后续实测核验，不修改历史参考或原预测。' : '',
    normalized.rejected ? `${normalized.rejected} 个时间记录因时间无效或必需点位不完整而被拒绝` : '',
    normalized.unmappedPoints.size ? `${normalized.unmappedPoints.size} 个文件点位未配置映射，将被忽略` : '',
    duplicateTimes && !verification ? `${duplicateTimes} 个时间点与设备现有数据重复，将按当前重复时间策略处理` : '',
    normalized.correctedValueCount ? `${normalized.correctedValueCount} 个简单格式值已自动规范化` : '',
    normalized.invalidValueCount ? `${normalized.invalidValueCount} 个空值、非数值或明显越界值已剔除` : '',
    normalized.incompleteRecordCount ? `${normalized.incompleteRecordCount} 个时间点因必需点位不全未进入导入数据` : '',
    normalized.duplicatePointCount ? `${normalized.duplicatePointCount} 个同时间同点位重复值已采用文件中最后一个值` : '',
  ].filter(Boolean);
  return {
    source: task.source,
    ...(verification ? {verification:{matched:verification.matched,excluded:verification.excluded,coverage:verification.run.coverage || 0}} : {}),
    sourceLabel: sourceLabel(task.source),
    fileFormat: task.format,
    sourceRowCount: rows.length,
    validRecordCount: uniqueIncoming.size,
    rejectedRecordCount: normalized.rejected,
    mappedPointCount: normalized.observedFields.size,
    requiredPointCount: rules.length,
    mappings: rules.map((rule) => ({ sourceKey: sourceKeyFor(rule, task.source), field: rule.field, label: rule.label, unit: rule.unit, observed: normalized.observedFields.has(rule.field) })),
    unmappedPoints: [...normalized.unmappedPoints].slice(0, 20),
    missingRequiredPoints,
    timeRange: { startAt: timestamps[0] || null, endAt: timestamps[timestamps.length - 1] || null },
    quality,
    correctedValueCount: normalized.correctedValueCount,
    invalidValueCount: normalized.invalidValueCount,
    incompleteRecordCount: normalized.incompleteRecordCount,
    duplicatePointCount: normalized.duplicatePointCount,
    scl: task.sclFileName ? { fileName: task.sclFileName, size: task.sclFileSize, savedAfterConfirmation: false } : null,
    impact: { currentDeviceRecords: currentDevice.length, duplicateTimes, estimatedDeviceRecords, estimatedTotalRecords },
    warnings,
  };
}

export function analyse(sceneId: PilotSceneId, state: StoredState, deviceId?: string | null, enhanced = false) {
  const p = PROFILES[sceneId];
  const selectedDevice = deviceId || [...new Set(state.records.map(r=>r.device_id))].sort()[0];
  const scoped = state.records.filter(record=>record.device_id===selectedDevice).sort((a,b)=>a.timestamp.localeCompare(b.timestamp));
  const usable = scoped.filter(record=>record.quality!=='bad');
  const training = forecastTraining(scoped,p.sampleIntervalSeconds);
  const latestRecords = usable.slice(-240);
  const series = latestRecords.map((record) => ({ timestamp: record.timestamp, device_id: record.device_id, quality: record.quality, ...record.values }));
  const forecasts: Array<Record<string, string | number>> = [];
  const forecastModels: Array<{field:string;method:string;period:number|null;trainingRecords:number;validationMae:number|null;baselineMae:number|null;validationPoints:number;validationHorizon:number}> = [];
  const fieldRisks: Array<{ field: string; label: string; value: number; risk: number }> = [];
  for (const rule of p.fields) {
    const values = latestRecords.map((record) => record.values[rule.field]).filter(Number.isFinite).slice(-60);
    if (!values.length) continue;
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const slope = values.length > 1 ? (values[values.length - 1] - values[Math.max(0, values.length - 12)]) / Math.min(11, values.length - 1) : 0;
    const residual = Math.sqrt(values.reduce((sum, value, index) => sum + Math.pow(value - (mean + slope * (index - values.length / 2)), 2), 0) / values.length);
    const last = values[values.length - 1];
    const span = Math.max(0.000001, rule.normalMax - rule.normalMin);
    const boundaryDistance = last < rule.normalMin ? rule.normalMin - last : last > rule.normalMax ? last - rule.normalMax : Math.max(0, Math.abs(last - (rule.normalMin + rule.normalMax) / 2) - span * 0.32);
    let forecastRisk = 0;
    if(training.records.length>=6) {
      const fitted=(enhanced ? harmonicForecast : adaptiveForecast)(training.records.map(r=>r.values[rule.field]),p.forecastSteps,rule.normalMin>=0?0:-Infinity);
      const {points,...metadata}=fitted;forecastModels.push({field:rule.field,...metadata});
      const outside = points.filter((point) => point.predicted < rule.normalMin || point.predicted > rule.normalMax);
      const maximumDeviation = outside.reduce((maximum, point) => Math.max(maximum, point.predicted < rule.normalMin ? rule.normalMin - point.predicted : point.predicted - rule.normalMax), 0);
      forecastRisk = Math.min(100, Math.round(maximumDeviation / span * 180 + outside.length / Math.max(1, points.length) * 80));
      points.forEach((point,index)=>forecasts.push({field:rule.field,label:rule.label,unit:rule.unit,timestamp:new Date(Date.parse(training.records.at(-1)!.timestamp)+(index+1)*training.interval*1000).toISOString(),predicted:Number(point.predicted.toFixed(rule.decimals)),lower:Number(point.lower.toFixed(rule.decimals)),upper:Number(point.upper.toFixed(rule.decimals))}));
    }
    const currentRisk = Math.min(100, Math.round(boundaryDistance / span * 160 + Math.abs(slope) / span * 240 + residual / span * 80));
    fieldRisks.push({ field: rule.field, label: rule.label, value: last, risk: Math.max(currentRisk, forecastRisk) });
  }
  const config = getModelShowcaseConfig(sceneId)!;
  const alerts = p.fields.flatMap((rule) => {
    const points = forecasts.filter((item) => item.field === rule.field);
    if (!points.length) return [];
    const outside = points.map((point) => Number(point.predicted) < rule.normalMin ? 'low' : Number(point.predicted) > rule.normalMax ? 'high' : null);
    let bestStart = -1;
    let bestLength = 0;
    let bestDirection: 'low' | 'high' = 'high';
    for (let index = 0; index < outside.length;) {
      const direction = outside[index];
      if (!direction) { index += 1; continue; }
      let end = index + 1;
      while (end < outside.length && outside[end] === direction) end += 1;
      if (end - index > bestLength) {
        bestStart = index;
        bestLength = end - index;
        bestDirection = direction;
      }
      index = end;
    }
    const minimumPersistence = Math.max(3, Math.ceil(points.length * 0.015));
    if (bestStart < 0 || bestLength < minimumPersistence) return [];
    const run = points.slice(bestStart, bestStart + bestLength);
    const span = Math.max(0.000001, rule.normalMax - rule.normalMin);
    const peak = run.reduce((selected, point) => {
      const deviation = bestDirection === 'high' ? Number(point.predicted) - rule.normalMax : rule.normalMin - Number(point.predicted);
      const selectedDeviation = bestDirection === 'high' ? Number(selected.predicted) - rule.normalMax : rule.normalMin - Number(selected.predicted);
      return deviation > selectedDeviation ? point : selected;
    }, run[0]);
    const peakDeviation = bestDirection === 'high' ? Number(peak.predicted) - rule.normalMax : rule.normalMin - Number(peak.predicted);
    const score = peakDeviation / span * 160 + bestLength / points.length * 80;
    const severity = score >= 45 ? 'critical' : score >= 18 ? 'warning' : 'attention';
    return [{
      field: rule.field,
      label: rule.label,
      unit: rule.unit,
      part: WARNING_PARTS[sceneId][rule.field] || rule.label,
      direction: bestDirection,
      severity,
      firstAt: String(run[0].timestamp),
      peakAt: String(peak.timestamp),
      peakValue: Number(peak.predicted),
      normalMin: rule.normalMin,
      normalMax: rule.normalMax,
      consecutivePoints: bestLength,
      durationMinutes: Number((bestLength * training.interval / 60).toFixed(1)),
    }];
  }).sort((left, right) => {
    const weights = { attention: 1, warning: 2, critical: 3 };
    return weights[right.severity] - weights[left.severity] || left.firstAt.localeCompare(right.firstAt);
  });
  const predictions = config.faultProfiles.map((fault) => {
    const relevant = fieldRisks.filter((item) => fault.fields.includes(item.field));
    const probability = Math.min(0.97, 0.05 + (relevant.reduce((sum, item) => sum + item.risk, 0) / Math.max(1, relevant.length)) / 100 * 0.86);
    return { faultCode: fault.code, faultName: fault.name, probability: Number(probability.toFixed(2)), expectedWindow: p.forecastLabel, evidence: relevant.sort((a, b) => b.risk - a.risk).slice(0, 3).map((item) => `${item.label} ${item.value}，风险贡献 ${item.risk}%`), recommendation: fault.recommendation };
  }).sort((a, b) => b.probability - a.probability).slice(0, 3);
  const maxRisk = Math.max(0, ...fieldRisks.map((item) => item.risk));
  const riskLevel = alerts.some((alert) => alert.severity === 'critical') || maxRisk >= 72 ? 'critical' : alerts.some((alert) => alert.severity === 'warning') || maxRisk >= 48 ? 'warning' : alerts.length || maxRisk >= 24 ? 'attention' : 'healthy';
  const horizonMinutes = Number((p.forecastSteps * training.interval / 60).toFixed(2));
  const horizon = horizonMinutes >= 60 && Number.isInteger(horizonMinutes / 60)
    ? `未来 ${horizonMinutes / 60} 小时`
    : `未来 ${horizonMinutes} 分钟`;
  const conclusion = alerts.length
    ? `${horizon}内发现 ${alerts.length} 项持续越界趋势，最早可能于${new Date(alerts[0].firstAt).toLocaleString('zh-CN', { hour12: false })}出现在${alerts[0].part}。建议结合现场工况复核并提前安排检查。`
    : `${horizon}内各指标预测中值未出现持续越过模型参考范围的趋势，设备总体运行趋势平稳。`;
  return { dataVersion: state.dataVersion, generatedAt: new Date().toISOString(), deviceId: selectedDevice || null, horizon, sampleIntervalSeconds: training.interval, series, forecasts, forecastModels, alerts, diagnosis: { healthScore: Math.max(0, 100 - maxRisk), riskLevel, conclusion, predictions } };
}

function overview(sceneId: PilotSceneId, state: StoredState) {
  const devices = [...new Set(state.records.map((record) => record.device_id))].sort();
  const good = state.records.filter((record) => record.quality === 'good').length;
  const uncertain = state.records.filter((record) => record.quality === 'uncertain').length;
  const bad = state.records.filter((record) => record.quality === 'bad').length;
  const sorted = state.records.map((record) => record.timestamp).sort();
  return {
    sceneId,
    modelId: getModelShowcaseConfig(sceneId)!.modelId,
    dataVersion: state.dataVersion,
    updatedAt: state.updatedAt,
    recordCount: state.records.length,
    fieldCount: PROFILES[sceneId].fields.length,
    deviceCount: devices.length,
    devices,
    timeRange: { startAt: sorted[0] || null, endAt: sorted[sorted.length - 1] || null },
    quality: { good, uncertain, bad },
    batches: state.batches.slice().sort((a, b) => b.importedAt.localeCompare(a.importedAt)),
    profile: PROFILES[sceneId],
  };
}

function rowsForSample(sceneId: PilotSceneId, deviceId: string): Record<string, unknown>[] {
  return generatedRecords(sceneId, deviceId, 30).map((record) => ({ timestamp: record.timestamp, device_id: record.device_id, quality: record.quality, ...record.values }));
}

function protocolRowsForSample(sceneId: PilotSceneId, deviceId: string, source: ImportSource): Record<string, unknown>[] {
  if (source === 'standard') return rowsForSample(sceneId, deviceId);
  const profile = PROFILES[sceneId];
  const config = getModelShowcaseConfig(sceneId)!;
  return generatedRecords(sceneId, deviceId, 12).flatMap((record) => profile.fields.map((rule) => source === 'modbus' ? {
    timestamp: record.timestamp,
    device_id: deviceId,
    unit_id: 1,
    function_code: 3,
    address: rule.modbusAddress,
    raw_value: record.values[rule.field],
    data_type: 'float32',
    byte_order: 'ABCD',
    scale: 1,
    offset: 0,
    unit: rule.unit,
    quality: record.quality,
  } : {
    timestamp: record.timestamp,
    device_id: deviceId,
    ied: `${config.modelId}_IED_01`,
    object_reference: rule.iec61850Path,
    functional_constraint: 'MX',
    value: record.values[rule.field],
    unit: rule.unit,
    quality: record.quality,
  }));
}

function protocolFieldGuide(source: 'modbus' | 'iec61850'): string {
  const title = source === 'modbus' ? 'Modbus 固定长表字段' : 'IEC 61850 固定长表字段';
  const scl = source === 'iec61850' ? '\n\nSCL：可上传 ICD/CID/SCD/SSD/XML；确认导入后永久保存到当前模型 protocol/scl 目录。' : '';
  return `${title}\n\n固定列：${requiredProtocolColumns(source).join(',')}\n\n允许额外列，但固定列不能缺少。空值、非数值、明显越界值及缺少必需点位的时间记录会在预检中计数并剔除；简单格式问题自动规范化；同一时间同一点位重复时保留最后一个值。${scl}\n`;
}

function removeBatchFiles(dataDirectory: string, sceneId: PilotSceneId, batchIds: Set<string>): void {
  const directory = path.join(rootFor(dataDirectory, sceneId), 'batches');
  if (!fs.existsSync(directory)) return;
  for (const fileName of fs.readdirSync(directory)) {
    const batchId = fileName.split('.')[0];
    if (batchIds.has(batchId)) fs.unlinkSync(path.join(directory, fileName));
  }
}

function cleanupAbandonedImports(dataDirectory: string): void {
  for (const sceneId of PILOT_DATA_SCENE_IDS) {
    const directory = path.join(rootFor(dataDirectory, sceneId), 'imports');
    if (!fs.existsSync(directory)) continue;
    for (const fileName of fs.readdirSync(directory)) {
      if (!fileName.endsWith('.part') && !fileName.endsWith('.normalized.json')) continue;
      const batchId = fileName.endsWith('.scl.part')
        ? fileName.slice(0, -'.scl.part'.length)
        : fileName.endsWith('.part') ? fileName.slice(0, -'.part'.length) : fileName.slice(0, -'.normalized.json'.length);
      if (!imports.has(batchId)) fs.unlinkSync(path.join(directory, fileName));
    }
  }
}

function normalizeProtocolValues(sceneId: PilotSceneId, source: 'modbus' | 'iec61850', input: Record<string, unknown>): Record<string, number> {
  const p = PROFILES[sceneId];
  return Object.fromEntries(p.fields.map((rule) => {
    const key = source === 'modbus' ? String(rule.modbusAddress) : rule.iec61850Path;
    return [rule.field, Number(input[key])];
  }).filter(([, value]) => Number.isFinite(value)));
}

function pdfFontPath(): string | null {
  const candidates = [
    path.join(process.cwd(), 'src', 'remoteModelShowcase', 'assets', 'NotoSansSC.ttf'),
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
    'C:/Windows/Fonts/msyh.ttc',
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function downloadFileName(sceneId: PilotSceneId, deviceId: string, label: string, extension: string): string {
  const config = getModelShowcaseConfig(sceneId)!;
  const safeTitle = config.title.replace(/[\\/:*?"<>|]/g, '-');
  const safeDeviceId = deviceId.replace(/[\\/:*?"<>|]/g, '-');
  return `${config.modelId}-${safeTitle}-设备ID-${safeDeviceId}-${label}.${extension}`;
}

function requestedDeviceId(req: Request): string {
  return validateDeviceId(req.query.deviceId);
}

function setDownloadHeaders(res: Response, mimeType: string, fileName: string): void {
  const extension = path.extname(fileName);
  const fallback = `model-data${extension}`;
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`);
}

function requestedFormat(req: Request, allowed: readonly string[], fallback: string): string {
  const format = String(req.query.format || fallback).trim().toLowerCase();
  if (!allowed.includes(format)) throw httpError(400, `下载格式仅支持 ${allowed.map((item) => item.toUpperCase()).join('、')}`);
  return format;
}

function sendJsonDownload(res: Response, fileName: string, value: unknown): void {
  setDownloadHeaders(res, 'application/json; charset=utf-8', fileName);
  res.send(`${JSON.stringify(value, null, 2)}\n`);
}

function sendCsvDownload(res: Response, fileName: string, sheet: xlsx.WorkSheet): void {
  setDownloadHeaders(res, 'text/csv; charset=utf-8', fileName);
  res.send(`\ufeff${xlsx.utils.sheet_to_csv(sheet)}`);
}

async function writeDocx(res: Response, fileName: string, title: string, sections: DownloadSection[]): Promise<void> {
  const children = [
    new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
    ...sections.flatMap((section) => [
      new Paragraph({ text: section.heading, heading: HeadingLevel.HEADING_2 }),
      ...section.lines.map((line) => new Paragraph({ text: line })),
    ]),
  ];
  const output = await Packer.toBuffer(new Document({ sections: [{ children }] }));
  setDownloadHeaders(res, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileName);
  res.send(output);
}

function writePdf(res: Response, fileName: string, title: string, sections: DownloadSection[]): void {
  setDownloadHeaders(res, 'application/pdf', fileName);
  const doc = new PDFDocument({ size: 'A4', margin: 48, info: { Title: title } });
  const font = pdfFontPath();
  if (font) doc.font(font);
  doc.pipe(res);
  doc.fontSize(18).fillColor('#123047').text(title);
  doc.moveDown();
  for (const section of sections) {
    doc.fontSize(12).fillColor('#176b87').text(section.heading);
    doc.moveDown(0.35);
    doc.fontSize(9).fillColor('#263746');
    section.lines.forEach((line) => doc.text(line, { lineGap: 3 }));
    doc.moveDown();
  }
  doc.end();
}

function specificationSections(sceneId: PilotSceneId): DownloadSection[] {
  const p = PROFILES[sceneId];
  const faults=getModelOperationalProfile(sceneId).faultProfiles;
  return [
    { heading: '预测与后续实测核验', lines: ['历史数据统一传入并选择已有设备追加/替换，或新增设备保存。选中设备后使用其唯一当前历史生成预测。至少需要 24 条连续有效历史，采样缺口可能减少可用于预测的连续窗口。', '后续实测仍使用相同格式与协议字段，点击独立的“导入验证数据”按钮。时间戳应覆盖原预测区间；原预测不会被验证数据改写。', `可增加 actual_tag（normal / abnormal）、actual_fault_code、actual_fault_name、actual_fault_part。实际故障代码：${faults.map(fault=>fault.code).join('、')}。缺少标签只计算误差，缺少故障依据不统计故障结论准确率。`, '每个模型随数据样例提供三套观测—验证数据，一套正常、两套异常。部分覆盖显示核验覆盖率；补齐后计入累计统计。'] },
    { heading: '通用表格', lines: ['支持 CSV、XLSX、JSON。每行一条完整时序记录；JSON 可直接使用数组或 records 数组。', '必填列：timestamp、device_id、quality，以及下列全部模型字段。上传表单中的设备 ID 作为本批全部记录的最终标签。'] },
    { heading: 'Modbus 固定长表字段', lines: [`固定列：${requiredProtocolColumns('modbus').join('、')}。允许增加额外列，但固定列不能缺少。`, '相同 timestamp 的全部必需寄存器聚合为一条模型记录；未映射寄存器忽略并在导入预检中列出。'] },
    { heading: 'IEC 61850 固定长表字段', lines: [`固定列：${requiredProtocolColumns('iec61850').join('、')}。允许增加额外列，但固定列不能缺少。`, 'SCL 的 ICD/CID/SCD/SSD/XML 文件用于核对设备与点位模型；确认导入后永久保存到当前模型 protocol/scl 目录，并与导入批次关联。'] },
    { heading: '明显异常处理', lines: ['简单空白、小数分隔符和质量值大小写自动规范化；空值、非数值、非有限数值及明显超出模型合理范围的值会剔除。', '时间戳无效或缺少任一必需点位的时间记录不导入；同一时间同一点位重复时采用文件中最后一个值。全部处理数量均在确认前预览。'] },
    { heading: '字段定义', lines: p.fields.map((field) => `${field.field} | ${field.label} | ${field.unit} | 正常范围 ${field.normalMin} - ${field.normalMax}`) },
    { heading: '协议映射', lines: p.fields.map((field) => `${field.field} | Modbus ${field.modbusAddress} | IEC 61850 ${field.iec61850Path}`) },
    { heading: '时间与质量', lines: ['timestamp 使用 ISO 8601，建议携带时区；quality 允许 good、uncertain、bad。bad 数据保存但不进入预测。', `推荐采样间隔 ${p.sampleIntervalSeconds} 秒；预测窗口 ${p.forecastLabel}。`] },
  ];
}

function reportSections(state: StoredState, result: ReturnType<typeof analyse>): DownloadSection[] {
  return [
    { heading: '数据范围', lines: [`数据版本：${state.dataVersion}`, `记录数：${result.series.length}（当前分析窗口）`, `设备：${result.deviceId || '全部设备'}`, `生成时间：${result.generatedAt}`] },
    { heading: '诊断结果', lines: [`健康评分：${result.diagnosis.healthScore}`, `风险等级：${result.diagnosis.riskLevel}`, result.diagnosis.conclusion] },
    { heading: '故障预测', lines: result.diagnosis.predictions.map((item) => `${item.faultName} | 概率 ${Math.round(item.probability * 100)}% | ${item.expectedWindow} | ${item.recommendation}`) },
  ];
}

const HYDRO_VALIDATION_SCENE_ID: PilotSceneId = 'sim-visual-hydro-turbine';

function safeHydroValidationScene(req: Request): PilotSceneId {
  const sceneId = safeScene(req);
  if (sceneId !== HYDRO_VALIDATION_SCENE_ID) throw httpError(404, '该页面未启用预测验证工作台');
  return sceneId;
}

function hydroValidationRoot(dataDirectory: string): string {
  const root = path.join(ensureDirectories(dataDirectory, HYDRO_VALIDATION_SCENE_ID), 'validation');
  fs.mkdirSync(path.join(root, 'cases'), { recursive: true });
  fs.mkdirSync(path.join(root, 'uploads'), { recursive: true });
  return root;
}

function hydroValidationIndexPath(dataDirectory: string): string {
  return path.join(hydroValidationRoot(dataDirectory), 'index.json');
}

function readHydroValidationIndex(dataDirectory: string): HydroValidationIndex {
  const target = hydroValidationIndexPath(dataDirectory);
  if (!fs.existsSync(target)) return { schemaVersion: 1, updatedAt: new Date(0).toISOString(), records: [] };
  return JSON.parse(fs.readFileSync(target, 'utf8')) as HydroValidationIndex;
}

function writeJsonAtomically(target: string, value: unknown): void {
  const temp = `${target}.${randomUUID()}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(value, null, 2), 'utf8');
  fs.renameSync(temp, target);
}

function writeHydroValidationIndex(dataDirectory: string, index: HydroValidationIndex): void {
  index.updatedAt = new Date().toISOString();
  index.records.sort((left, right) => left.caseId.localeCompare(right.caseId));
  writeJsonAtomically(hydroValidationIndexPath(dataDirectory), index);
}

function hydroValidationCasePath(dataDirectory: string, caseId: string): string {
  return path.join(hydroValidationRoot(dataDirectory), 'cases', `${caseId}.json`);
}

function readHydroValidationCase(dataDirectory: string, caseId: string): HydroValidationCaseRecord | null {
  const target = hydroValidationCasePath(dataDirectory, caseId);
  return fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, 'utf8')) as HydroValidationCaseRecord : null;
}

function validationDefinition(caseId: unknown) {
  const normalized = String(caseId || '').trim().toUpperCase();
  const definition = hydroValidationDefinitions().find((item) => item.caseId === normalized);
  if (!definition) throw httpError(400, '验证组编号应为 HT-01 至 HT-50');
  return definition;
}

function validationUploadContent(value: unknown): string {
  const content = String(value || '');
  if (!content.trim()) throw httpError(400, '上传文件内容为空');
  if (Buffer.byteLength(content, 'utf8') > 2 * 1024 * 1024) throw httpError(413, '单个预测验证文件不能超过 2 MB');
  return content.replace(/^\ufeff/, '');
}

function parseHydroValidationRows(
  content: string,
  caseId: string,
  phase: 'observation' | 'verification',
): { records: DataRecord[]; actualTag: HydroValidationTag | null; actualFaultCode: HydroFaultCode | null } {
  let workbook: xlsx.WorkBook;
  try {
    workbook = xlsx.read(content, { type: 'string', cellDates: true });
  } catch {
    throw httpError(400, '文件不是可读取的 CSV 数据');
  }
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw httpError(400, '文件不包含可读取的数据表');
  const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null, raw: false });
  if (!rows.length) throw httpError(400, '文件中没有数据记录');
  const required = ['case_id', 'timestamp', 'device_id', 'quality', ...HYDRO_VALIDATION_FIELDS.map((field) => field.field)];
  if (phase === 'verification') required.push('actual_tag', 'actual_fault_code', 'actual_fault_name', 'actual_fault_part');
  const columns = new Set(Object.keys(rows[0]).map((key) => key.trim().toLowerCase()));
  const missing = required.filter((key) => !columns.has(key));
  if (missing.length) throw httpError(400, `文件缺少固定字段：${missing.join('、')}`);
  const definition = validationDefinition(caseId);
  let actualTag: HydroValidationTag | null = null;
  let actualFaultCode: HydroFaultCode | null = null;
  const records = rows.map((row, index) => {
    const rowCaseId = String(cell(row, ['case_id']) || '').trim().toUpperCase();
    if (rowCaseId !== definition.caseId) throw httpError(400, `第 ${index + 2} 行验证组编号为 ${rowCaseId || '空'}，与当前选择的 ${definition.caseId} 不一致`);
    const timestampMillis = rowTimestamp(row);
    if (!Number.isFinite(timestampMillis)) throw httpError(400, `第 ${index + 2} 行时间戳无效`);
    const values = Object.fromEntries(HYDRO_VALIDATION_FIELDS.map((field) => {
      const parsed = numericCell(cell(row, [field.field, field.label]));
      if (obviouslyInvalidValue(field, parsed.value)) throw httpError(400, `第 ${index + 2} 行${field.label}为空、非数值或明显超出合理范围`);
      return [field.field, parsed.value];
    }));
    if (phase === 'verification') {
      const tagText = String(cell(row, ['actual_tag']) || '').trim().toLowerCase();
      const rowTag: HydroValidationTag = tagText === 'abnormal' || tagText === '异常' ? 'abnormal' : tagText === 'normal' || tagText === '正常' ? 'normal' : (() => { throw httpError(400, `第 ${index + 2} 行 actual_tag 仅允许 normal 或 abnormal`); })();
      const faultText = String(cell(row, ['actual_fault_code']) || '').trim().toUpperCase();
      const rowFault = faultText ? faultText as HydroFaultCode : null;
      if (rowFault && !(rowFault in HYDRO_VALIDATION_FAULTS)) throw httpError(400, `第 ${index + 2} 行实际故障类型无法识别`);
      if (rowTag === 'abnormal' && !rowFault) throw httpError(400, `第 ${index + 2} 行异常状态缺少实际故障类型`);
      if (actualTag && actualTag !== rowTag) throw httpError(400, '验证文件中的实际状态标签不一致');
      if (actualFaultCode !== null && actualFaultCode !== rowFault) throw httpError(400, '验证文件中的实际故障类型不一致');
      actualTag = rowTag;
      actualFaultCode = rowFault;
    }
    return {
      timestamp: new Date(timestampMillis).toISOString(),
      device_id: definition.deviceId,
      quality: rowQuality(row),
      values,
      batch_id: `hydro-validation-${definition.caseId}-${phase}`,
    };
  }).sort((left, right) => left.timestamp.localeCompare(right.timestamp));
  const uniqueTimes = new Set(records.map((record) => record.timestamp));
  if (uniqueTimes.size !== records.length) throw httpError(400, '文件中存在重复时间记录');
  const expectedCount = phase === 'observation' ? definition.observationCount : definition.verificationCount;
  if (records.length !== expectedCount) throw httpError(400, `${phase === 'observation' ? '观测' : '验证'}数据应包含 ${expectedCount} 条记录，当前为 ${records.length} 条`);
  for (let index = 1; index < records.length; index += 1) {
    const interval = (Date.parse(records[index].timestamp) - Date.parse(records[index - 1].timestamp)) / 1000;
    if (Math.abs(interval - definition.sampleIntervalSeconds) > 1) throw httpError(400, `第 ${index + 2} 行与上一行不满足 ${definition.sampleIntervalSeconds} 秒连续采样`);
  }
  return { records, actualTag, actualFaultCode };
}

function validationFileSummary(fileName: string, content: string, records: DataRecord[]): HydroValidationFileSummary {
  return {
    fileName: sanitizeFileName(fileName),
    sha256: createHash('sha256').update(content).digest('hex'),
    rowCount: records.length,
    startAt: records[0].timestamp,
    endAt: records.at(-1)!.timestamp,
    uploadedAt: new Date().toISOString(),
  };
}

export function validationPredictionForScene(sceneId: PilotSceneId, records: DataRecord[], enhanced = false) {
  const operational = getModelOperationalProfile(sceneId);
  const state: StoredState = { schemaVersion: 1, dataVersion: randomUUID(), updatedAt: new Date().toISOString(), records, batches: [] };
  const result = analyse(sceneId, state, records[0].device_id, enhanced);
  const riskLevel = (['healthy', 'attention', 'warning', 'critical'] as const).find((level) => level === result.diagnosis.riskLevel) || 'attention';
  const latest=records.filter(record=>record.quality!=='bad').sort((a,b)=>a.timestamp.localeCompare(b.timestamp)).at(-1);
  const currentOutOfRange=Boolean(latest&&operational.fields.some(field=>latest.values[field.field]<field.normalMin||latest.values[field.field]>field.normalMax));
  const predictedAbnormal = currentOutOfRange || result.alerts.length > 0 || result.diagnosis.riskLevel === 'warning' || result.diagnosis.riskLevel === 'critical';
  const primary = predictedAbnormal ? result.diagnosis.predictions[0] : null;
  const selectedFault = primary ? operational.faultProfiles.find(fault => fault.code === primary.faultCode) : null;
  const faultCode = selectedFault?.code || null;
  const faultName = selectedFault?.name || '未发现明确故障趋势';
  const faultPart = selectedFault?.part || '无';
  const tag: HydroValidationTag = predictedAbnormal ? 'abnormal' : 'normal';
  const enhancedConclusion = predictedAbnormal
    ? `${result.horizon}内${result.alerts.length ? `发现 ${result.alerts.length} 项持续越界趋势` : '预测中值尚未持续越界，但当前历史偏离与趋势风险已达到预警条件'}。${faultCode ? `建议优先检查${faultName}相关部位，结合现场工况核实。` : '建议结合现场工况进一步检查。'}`
    : `${result.horizon}内预测中值未触发持续越界，当前未发现明确故障趋势。`;
  return {
    generatedAt: result.generatedAt,
    tag,
    faultCode,
    faultName,
    faultPart,
    conclusion: enhanced ? enhancedConclusion : `${result.diagnosis.conclusion} 预测状态为${tag === 'abnormal' ? '异常' : '正常'}${faultCode ? `，主要疑似故障为${faultName}，建议关注${faultPart}` : ''}。`,
    riskLevel,
    healthScore: result.diagnosis.healthScore,
    models: result.forecastModels,
    thresholdModelVersion: operational.thresholdModel.version,
    alerts: result.alerts,
    candidates: result.diagnosis.predictions,
    sampleIntervalSeconds: result.sampleIntervalSeconds,
    horizon: result.horizon,
    fields: operational.fields.map(({field,label,unit,normalMin,normalMax})=>({field,label,unit,normalMin,normalMax})),
    forecasts: result.forecasts.map((forecast) => ({
      field: String(forecast.field),
      timestamp: String(forecast.timestamp),
      predicted: Number(forecast.predicted),
      lower: Number(forecast.lower),
      upper: Number(forecast.upper),
    })),
  };
}

export function validationPrediction(records: DataRecord[], enhanced = false) {
  return validationPredictionForScene(HYDRO_VALIDATION_SCENE_ID, records, enhanced) as ReturnType<typeof validationPredictionForScene> & { faultCode: HydroFaultCode | null };
}

export function compareModelValidation(
  sceneId: PilotSceneId,
  record: { prediction: ReturnType<typeof validationPredictionForScene> },
  actualRecords: DataRecord[],
  actualTag: HydroValidationTag,
  actualFaultCode: string | null,
) {
  const operational = getModelOperationalProfile(sceneId);
  const forecasts = new Map(record.prediction.forecasts.map(forecast => [`${forecast.field}|${forecast.timestamp}`, forecast]));
  const fieldMetrics = operational.fields.map(field => {
    const pairs = actualRecords.map(actual => ({ actual: actual.values[field.field], forecast: forecasts.get(`${field.field}|${actual.timestamp}`) }))
      .filter((pair): pair is {actual:number;forecast:{field:string;timestamp:string;predicted:number;lower:number;upper:number}} => Number.isFinite(pair.actual) && Boolean(pair.forecast));
    if (pairs.length !== actualRecords.length) throw httpError(400, `${field.label}验证时间未与保存的预测完整对齐`);
    const absoluteErrors = pairs.map(pair => Math.abs(pair.actual - pair.forecast.predicted));
    const squaredErrors = pairs.map(pair => (pair.actual - pair.forecast.predicted) ** 2);
    const smapeValues = pairs.map(pair => 2 * Math.abs(pair.actual - pair.forecast.predicted) / Math.max(.000001, Math.abs(pair.actual) + Math.abs(pair.forecast.predicted)));
    const mae = absoluteErrors.reduce((sum,value)=>sum+value,0) / pairs.length;
    const rmse = Math.sqrt(squaredErrors.reduce((sum,value)=>sum+value,0) / pairs.length);
    return { field:field.field,label:field.label,unit:field.unit,mae:Number(mae.toFixed(field.decimals+2)),rmse:Number(rmse.toFixed(field.decimals+2)),
      normalizedMae:Number((mae/(field.normalMax-field.normalMin)).toFixed(4)),smape:Number((smapeValues.reduce((sum,value)=>sum+value,0)/pairs.length).toFixed(4)),
      intervalCoverage:Number((pairs.filter(pair=>pair.actual>=pair.forecast.lower&&pair.actual<=pair.forecast.upper).length/pairs.length).toFixed(4)) };
  });
  const mean=(key:'normalizedMae'|'smape'|'intervalCoverage')=>fieldMetrics.reduce((sum,metric)=>sum+metric[key],0)/fieldMetrics.length;
  const actualFault=actualFaultCode ? operational.faultProfiles.find(fault=>fault.code===actualFaultCode) : null;
  const statusCorrect=record.prediction.tag===actualTag;
  const faultCorrect=actualTag==='normal' ? record.prediction.tag==='normal' : record.prediction.faultCode===actualFaultCode;
  return {actualTag,actualFaultCode,actualFaultName:actualFault?.name||'未发现故障状态',actualFaultPart:actualFault?.part||'无',statusCorrect,faultCorrect,
    conclusionCorrect:statusCorrect&&faultCorrect,normalizedMae:Number(mean('normalizedMae').toFixed(4)),smape:Number(mean('smape').toFixed(4)),
    intervalCoverage:Number(mean('intervalCoverage').toFixed(4)),fieldMetrics,
    actualSeries:actualRecords.map(item=>({timestamp:item.timestamp,values:Object.fromEntries(operational.fields.map(field=>[field.field,item.values[field.field]]))})),verifiedAt:new Date().toISOString()};
}

export function compareHydroValidation(record: Pick<HydroValidationCaseRecord, 'prediction'>, actualRecords: DataRecord[], actualTag: HydroValidationTag, actualFaultCode: HydroFaultCode | null): HydroValidationResult {
  const forecasts = new Map(record.prediction.forecasts.map((forecast) => [`${forecast.field}|${forecast.timestamp}`, forecast]));
  const fieldMetrics = HYDRO_VALIDATION_FIELDS.map((field) => {
    const pairs = actualRecords.map((actual) => ({ actual: actual.values[field.field], forecast: forecasts.get(`${field.field}|${actual.timestamp}`) })).filter((pair): pair is { actual: number; forecast: { field: string; timestamp: string; predicted: number; lower: number; upper: number } } => Boolean(pair.forecast));
    if (pairs.length !== actualRecords.length) throw httpError(400, `${field.label}验证时间未与冻结预测完整对齐`);
    const absoluteErrors = pairs.map((pair) => Math.abs(pair.actual - pair.forecast.predicted));
    const squaredErrors = pairs.map((pair) => (pair.actual - pair.forecast.predicted) ** 2);
    const smapeValues = pairs.map((pair) => 2 * Math.abs(pair.actual - pair.forecast.predicted) / Math.max(0.000001, Math.abs(pair.actual) + Math.abs(pair.forecast.predicted)));
    const mae = absoluteErrors.reduce((sum, value) => sum + value, 0) / pairs.length;
    const rmse = Math.sqrt(squaredErrors.reduce((sum, value) => sum + value, 0) / pairs.length);
    const smape = smapeValues.reduce((sum, value) => sum + value, 0) / pairs.length;
    const coverage = pairs.filter((pair) => pair.actual >= pair.forecast.lower && pair.actual <= pair.forecast.upper).length / pairs.length;
    return {
      field: field.field,
      label: field.label,
      unit: field.unit,
      mae: Number(mae.toFixed(field.decimals + 2)),
      rmse: Number(rmse.toFixed(field.decimals + 2)),
      normalizedMae: Number((mae / (field.normalMax - field.normalMin)).toFixed(4)),
      smape: Number(smape.toFixed(4)),
      intervalCoverage: Number(coverage.toFixed(4)),
    };
  });
  const average = (key: 'normalizedMae' | 'smape' | 'intervalCoverage') => fieldMetrics.reduce((sum, metric) => sum + metric[key], 0) / fieldMetrics.length;
  const predictedFaultCode = record.prediction.faultCode;
  const statusCorrect = record.prediction.tag === actualTag;
  const faultCorrect = actualTag === 'normal' ? record.prediction.tag === 'normal' : predictedFaultCode === actualFaultCode;
  return {
    actualTag,
    actualFaultCode,
    actualFaultName: actualFaultCode ? HYDRO_VALIDATION_FAULTS[actualFaultCode].name : '未发现故障状态',
    actualFaultPart: actualFaultCode ? HYDRO_VALIDATION_FAULTS[actualFaultCode].part : '无',
    statusCorrect,
    faultCorrect,
    conclusionCorrect: statusCorrect && faultCorrect,
    normalizedMae: Number(average('normalizedMae').toFixed(4)),
    smape: Number(average('smape').toFixed(4)),
    intervalCoverage: Number(average('intervalCoverage').toFixed(4)),
    fieldMetrics,
    actualSeries: actualRecords.map((record) => ({
      timestamp: record.timestamp,
      values: Object.fromEntries(HYDRO_VALIDATION_FIELDS.map((field) => [field.field, record.values[field.field]])),
    })),
    verifiedAt: new Date().toISOString(),
  };
}

function validationIndexEntry(record: HydroValidationCaseRecord): HydroValidationIndexEntry {
  return {
    caseId: record.caseId,
    deviceId: record.deviceId,
    status: record.status,
    observation: record.observation,
    predictedTag: record.prediction.tag,
    predictedFaultCode: record.prediction.faultCode,
    predictedFaultName: record.prediction.faultName,
    predictedFaultPart: record.prediction.faultPart,
    conclusion: record.prediction.conclusion,
    riskLevel: record.prediction.riskLevel,
    healthScore: record.prediction.healthScore,
    verification: record.verification,
    result: record.result,
  };
}

function persistHydroValidationCase(dataDirectory: string, record: HydroValidationCaseRecord): void {
  writeJsonAtomically(hydroValidationCasePath(dataDirectory, record.caseId), record);
  const index = readHydroValidationIndex(dataDirectory);
  index.records = [...index.records.filter((item) => item.caseId !== record.caseId), validationIndexEntry(record)];
  writeHydroValidationIndex(dataDirectory, index);
}

function hydroValidationOverview(dataDirectory: string) {
  const index = readHydroValidationIndex(dataDirectory);
  const verified = index.records.filter((record) => record.status === 'verified' && record.result);
  const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  return {
    schemaVersion: 1,
    modelId: 2326,
    targetCases: 50,
    predictedCases: index.records.length,
    verifiedCases: verified.length,
    updatedAt: index.updatedAt,
    metrics: {
      statusAccuracy: mean(verified.map((record) => record.result!.statusCorrect ? 1 : 0)),
      conclusionAccuracy: mean(verified.map((record) => record.result!.conclusionCorrect ? 1 : 0)),
      faultAccuracy: mean(verified.filter((record) => record.result!.actualTag === 'abnormal').map((record) => record.result!.faultCorrect ? 1 : 0)),
      normalizedMae: mean(verified.map((record) => record.result!.normalizedMae)),
      smape: mean(verified.map((record) => record.result!.smape)),
      intervalCoverage: mean(verified.map((record) => record.result!.intervalCoverage)),
    },
    availableCases: hydroValidationDefinitions().map((definition) => ({
      caseId: definition.caseId,
      deviceId: definition.deviceId,
      observationCount: definition.observationCount,
      verificationCount: definition.verificationCount,
      observationFileName: `${definition.caseId}-观测数据.csv`,
      verificationFileName: `${definition.caseId}-验证数据.csv`,
      status: index.records.find((record) => record.caseId === definition.caseId)?.status || 'pending',
    })),
    records: index.records.slice().sort((left, right) => right.caseId.localeCompare(left.caseId)),
  };
}

function validationDatasetRoot(dataDirectory: string): string {
  return path.join(rootFor(dataDirectory, HYDRO_VALIDATION_SCENE_ID), 'reference', 'forecast-validation');
}

function pairedDatasetRoot(dataDirectory:string,sceneId:PilotSceneId):string {
  return path.join(ensureDirectories(dataDirectory,sceneId),'reference','forecast-validation');
}

function deterministicSeed(value:string):number {
  return Number.parseInt(createHash('sha256').update(value).digest('hex').slice(0,8),16);
}

export function modelPairedDatasetRows(sceneId:PilotSceneId,setIndex:number,phase:'observation'|'verification') {
  const config=getModelShowcaseConfig(sceneId)!;
  const operational=getModelOperationalProfile(sceneId);
  const observationCount=180;
  const verificationCount=operational.forecastSteps;
  const start=Date.parse(`2026-08-${String(8+setIndex*3).padStart(2,'0')}T00:00:00.000Z`);
  const offset=phase==='observation'?0:observationCount;
  const count=phase==='observation'?observationCount:verificationCount;
  const abnormal=setIndex>1;
  const fault=abnormal?operational.faultProfiles[Math.min(setIndex-2,operational.faultProfiles.length-1)]:null;
  const seed=deterministicSeed(`${sceneId}:${setIndex}`);
  return Array.from({length:count},(_,localIndex)=>{
    const index=offset+localIndex;
    const progress=Math.max(0,(index-observationCount*.5)/(observationCount+verificationCount-observationCount*.5));
    const values=Object.fromEntries(operational.fields.map((field,fieldIndex)=>{
      const span=field.normalMax-field.normalMin;
      const period=15+(seed+fieldIndex*7)%21;
      const wave=Math.sin(index/period+fieldIndex*.83)*field.amplitude*.62+Math.cos(index/(period*.43)+fieldIndex)*field.amplitude*.14;
      let shift=0;
      if(fault?.fields.includes(field.field)){
        const direction=field.riskDirection==='low'?-1:1;
        shift=direction*span*Math.min(.82,2.25*progress);
      }
      const verificationVariation=phase==='verification' ? Math.sin((localIndex+1)*.47+fieldIndex*1.17)*field.amplitude*.08 : 0;
      const value=field.base+wave+shift+verificationVariation;
      return [field.field,Number(value.toFixed(field.decimals))];
    }));
    return {timestamp:new Date(start+index*operational.sampleIntervalSeconds*1000).toISOString(),device_id:`${config.modelId}-SET-${String(setIndex).padStart(2,'0')}`,quality:'good',...values,
      ...(phase==='verification'?{actual_tag:abnormal?'abnormal':'normal',actual_fault_code:fault?.code||'',actual_fault_name:fault?.name||'',actual_fault_part:fault?.part||''}:{})};
  });
}

function ensurePairedDatasets(dataDirectory:string,sceneId:PilotSceneId):string {
  const root=pairedDatasetRoot(dataDirectory,sceneId);
  fs.mkdirSync(root,{recursive:true});
  const config=getModelShowcaseConfig(sceneId)!;
  const operational=getModelOperationalProfile(sceneId);
  const manifest={schemaVersion:2,sceneId,modelId:config.modelId,modelName:config.expectedRemoteName,generatedFor:'预测与后续实测核验',sets:[1,2,3].map(setIndex=>({setId:`SET-${String(setIndex).padStart(2,'0')}`,tag:setIndex===1?'normal':'abnormal',faultCode:setIndex===1?null:operational.faultProfiles[Math.min(setIndex-2,operational.faultProfiles.length-1)].code,observationCount:180,verificationCount:operational.forecastSteps,sampleIntervalSeconds:operational.sampleIntervalSeconds}))};
  for(const setIndex of [1,2,3]){
    const setId=`SET-${String(setIndex).padStart(2,'0')}`;
    const directory=path.join(root,setId);
    fs.mkdirSync(directory,{recursive:true});
    const observation=modelPairedDatasetRows(sceneId,setIndex,'observation');
    const verification=modelPairedDatasetRows(sceneId,setIndex,'verification');
    const observationFile=`${config.modelId}-${config.expectedRemoteName}-${setId}-观测数据.csv`;
    const verificationFile=`${config.modelId}-${config.expectedRemoteName}-${setId}-验证数据.csv`;
    fs.writeFileSync(path.join(directory,observationFile),`\ufeff${xlsx.utils.sheet_to_csv(xlsx.utils.json_to_sheet(observation))}`,'utf8');
    fs.writeFileSync(path.join(directory,verificationFile),`\ufeff${xlsx.utils.sheet_to_csv(xlsx.utils.json_to_sheet(verification))}`,'utf8');
    fs.writeFileSync(path.join(directory,'数据组说明.md'),`# ${config.expectedRemoteName} ${setId}\n\n- 观测数据：${observationFile}\n- 验证数据：${verificationFile}\n- 实际状态：${setIndex===1?'正常':'异常'}\n- 故障类型：${setIndex===1?'无':operational.faultProfiles[Math.min(setIndex-2,operational.faultProfiles.length-1)].name}\n- 使用顺序：先将观测数据导入设备历史并生成预测，再通过“导入验证数据”核验原预测。\n- 验证数据不参与预测拟合；预测生成后保持冻结。\n`,'utf8');
  }
  fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2),'utf8');
  fs.writeFileSync(path.join(root,'三组预测核验数据说明.md'),`# ${config.expectedRemoteName} 预测核验数据\n\n本目录包含三套相互独立的观测—验证数据：一套正常工况、两套异常工况。各套数据均使用本模型专属字段、单位、参考范围与故障代码。数据保留连续波动、负载变化和测量扰动；验证段与观测段时间连续，但不复制观测值。\n\n预测误差范围由观测历史的滚动回测误差估计。少量验证点可能位于范围外，用于反映工况变化和测量扰动；是否异常以实际状态标签及持续趋势共同核验，不由单点偏差决定。\n`,'utf8');
  return root;
}

function errorResponse(res: Response, error: unknown): void {
  const normalized = error instanceof Error ? error : new Error('请求处理失败');
  const status = 'status' in normalized && typeof normalized.status === 'number' ? normalized.status : 500;
  if (status >= 500) console.error('[pilot-data]', normalized);
  if (!res.headersSent) res.status(status).json({ error: { code: status === 500 ? 'PILOT_DATA_ERROR' : 'INVALID_REQUEST', message: normalized.message, retryable: false } });
}

export function registerPilotDataRoutes(app: { get: Function; post: Function; put: Function; delete: Function }, dataDirectory: string): void {
  cleanupAbandonedImports(dataDirectory);
  for (const modelSceneId of PILOT_DATA_SCENE_IDS) {
    registerUnifiedHydroRoutes(app, () => ensureState(dataDirectory, modelSceneId), () => rootFor(dataDirectory, modelSceneId), modelSceneId);
  }
  const route = (handler: (req: Request, res: Response) => Promise<unknown> | void | Response) => async (req: Request, res: Response) => {
    try { await handler(req, res); } catch (error) { errorResponse(res, error); }
  };

  app.get('/api/model-showcase/:sceneId/data/overview', route((req, res) => {
    const sceneId = safeScene(req);
    res.json(overview(sceneId, ensureState(dataDirectory, sceneId)));
  }));

  app.get('/api/model-showcase/:sceneId/data/inspection', route((req, res) => {
    const sceneId = safeScene(req);
    const state = ensureState(dataDirectory, sceneId);
    const deviceId = req.query.deviceId ? validateDeviceId(req.query.deviceId) : [...new Set(state.records.map(r => r.device_id))].sort()[0] || null;
    const batchId = typeof req.query.batchId === 'string' && req.query.batchId ? req.query.batchId : null;
    res.json({ dataVersion: state.dataVersion, ...buildDataInspection(state.records, PROFILES[sceneId].fields, deviceId, batchId) });
  }));

  app.get('/api/model-showcase/:sceneId/data/timeline', route((req, res) => {
    const sceneId = safeScene(req);
    const state = ensureState(dataDirectory, sceneId);
    const deviceId = req.query.deviceId ? validateDeviceId(req.query.deviceId) : [...new Set(state.records.map(r => r.device_id))].sort()[0] || null;
    const batchId = typeof req.query.batchId === 'string' && req.query.batchId ? req.query.batchId : null;
    const records = state.records.filter(r => r.device_id === deviceId && (!batchId || r.batch_id === batchId));
    const result = analyse(sceneId, { ...state, records }, deviceId);
    const forecasts = result.forecasts.map(f => ({field:String(f.field),timestamp:String(f.timestamp),predicted:Number(f.predicted),lower:Number(f.lower),upper:Number(f.upper)}));
    const p = PROFILES[sceneId];
    res.json({
      dataVersion: state.dataVersion,
      ...buildDataTimeline(records, p.fields, deviceId, batchId, result.sampleIntervalSeconds, forecasts, result.horizon, result.forecastModels),
      generatedAt: result.generatedAt,
      diagnosis: result.diagnosis,
      alerts: result.alerts,
    });
  }));

  app.get('/api/model-showcase/:sceneId/data/analysis', route((req, res) => {
    const sceneId = safeScene(req);
    const deviceId = req.query.deviceId ? validateDeviceId(req.query.deviceId) : null;
    res.json(analyse(sceneId, ensureState(dataDirectory, sceneId), deviceId));
  }));

  app.get('/api/model-showcase/:sceneId/data/validation/overview', route((req, res) => {
    safeHydroValidationScene(req);
    res.json(hydroValidationOverview(dataDirectory));
  }));

  app.get('/api/model-showcase/:sceneId/data/validation/cases/:caseId', route((req, res) => {
    safeHydroValidationScene(req);
    const definition = validationDefinition(req.params.caseId);
    const record = readHydroValidationCase(dataDirectory, definition.caseId);
    res.json({ definition: { caseId: definition.caseId, deviceId: definition.deviceId, observationCount: definition.observationCount, verificationCount: definition.verificationCount }, record });
  }));

  app.post('/api/model-showcase/:sceneId/data/validation/cases/:caseId/observation', route((req, res) => {
    safeHydroValidationScene(req);
    const definition = validationDefinition(req.params.caseId);
    const content = validationUploadContent(req.body?.content);
    const parsed = parseHydroValidationRows(content, definition.caseId, 'observation');
    if (parsed.records[0].timestamp !== definition.observationStart || parsed.records.at(-1)!.timestamp !== definition.observationEnd) {
      throw httpError(400, `观测时间范围应为 ${definition.observationStart} 至 ${definition.observationEnd}`);
    }
    const uploadRoot = path.join(hydroValidationRoot(dataDirectory), 'uploads', definition.caseId);
    fs.rmSync(uploadRoot, { recursive: true, force: true });
    fs.mkdirSync(uploadRoot, { recursive: true });
    const fileName = sanitizeFileName(req.body?.fileName || `${definition.caseId}-观测数据.csv`);
    fs.writeFileSync(path.join(uploadRoot, `observation-${fileName}`), content, 'utf8');
    const prediction = validationPrediction(parsed.records);
    const record: HydroValidationCaseRecord = {
      caseId: definition.caseId,
      deviceId: definition.deviceId,
      status: 'predicted',
      observation: validationFileSummary(fileName, content, parsed.records),
      prediction,
    };
    persistHydroValidationCase(dataDirectory, record);
    res.status(201).json({ overview: hydroValidationOverview(dataDirectory), record });
  }));

  app.post('/api/model-showcase/:sceneId/data/validation/cases/:caseId/verification', route((req, res) => {
    safeHydroValidationScene(req);
    const definition = validationDefinition(req.params.caseId);
    const record = readHydroValidationCase(dataDirectory, definition.caseId);
    if (!record) throw httpError(409, '请先上传该组观测数据并冻结预测结果');
    const content = validationUploadContent(req.body?.content);
    const parsed = parseHydroValidationRows(content, definition.caseId, 'verification');
    if (parsed.records[0].timestamp !== definition.verificationStart || parsed.records.at(-1)!.timestamp !== definition.verificationEnd) {
      throw httpError(400, `验证时间范围应为 ${definition.verificationStart} 至 ${definition.verificationEnd}`);
    }
    if (!parsed.actualTag) throw httpError(400, '验证文件缺少实际状态标签');
    const fileName = sanitizeFileName(req.body?.fileName || `${definition.caseId}-验证数据.csv`);
    const uploadRoot = path.join(hydroValidationRoot(dataDirectory), 'uploads', definition.caseId);
    fs.mkdirSync(uploadRoot, { recursive: true });
    fs.writeFileSync(path.join(uploadRoot, `verification-${fileName}`), content, 'utf8');
    record.status = 'verified';
    record.verification = validationFileSummary(fileName, content, parsed.records);
    record.result = compareHydroValidation(record, parsed.records, parsed.actualTag, parsed.actualFaultCode);
    persistHydroValidationCase(dataDirectory, record);
    res.json({ overview: hydroValidationOverview(dataDirectory), record });
  }));

  app.delete('/api/model-showcase/:sceneId/data/validation/cases/:caseId', route((req, res) => {
    safeHydroValidationScene(req);
    const definition = validationDefinition(req.params.caseId);
    const target = hydroValidationCasePath(dataDirectory, definition.caseId);
    if (fs.existsSync(target)) fs.unlinkSync(target);
    fs.rmSync(path.join(hydroValidationRoot(dataDirectory), 'uploads', definition.caseId), { recursive: true, force: true });
    const index = readHydroValidationIndex(dataDirectory);
    index.records = index.records.filter((record) => record.caseId !== definition.caseId);
    writeHydroValidationIndex(dataDirectory, index);
    res.json(hydroValidationOverview(dataDirectory));
  }));

  app.delete('/api/model-showcase/:sceneId/data/validation', route((req, res) => {
    safeHydroValidationScene(req);
    const root = hydroValidationRoot(dataDirectory);
    fs.rmSync(path.join(root, 'cases'), { recursive: true, force: true });
    fs.rmSync(path.join(root, 'uploads'), { recursive: true, force: true });
    fs.mkdirSync(path.join(root, 'cases'), { recursive: true });
    fs.mkdirSync(path.join(root, 'uploads'), { recursive: true });
    writeHydroValidationIndex(dataDirectory, { schemaVersion: 1, updatedAt: new Date().toISOString(), records: [] });
    res.json(hydroValidationOverview(dataDirectory));
  }));

  app.get('/api/model-showcase/:sceneId/data/validation/datasets', route((req, res) => {
    const sceneId=safeScene(req);
    if(sceneId!==HYDRO_VALIDATION_SCENE_ID){
      const datasetRoot=ensurePairedDatasets(dataDirectory,sceneId);
      const config=getModelShowcaseConfig(sceneId)!;
      const deviceId=req.query.deviceId?requestedDeviceId(req):`${config.modelId}-01`;
      setDownloadHeaders(res,'application/zip',downloadFileName(sceneId,deviceId,'三组预测核验成对样例','zip'));
      const archive=new ZipArchive({zlib:{level:9}});
      archive.on('error',error=>res.destroy(error));
      archive.pipe(res);
      for(const setId of ['SET-01','SET-02','SET-03']){
        const directory=path.join(datasetRoot,setId);
        for(const fileName of fs.readdirSync(directory))archive.file(path.join(directory,fileName),{name:`${setId}/${fileName}`});
      }
      for(const fileName of ['manifest.json','三组预测核验数据说明.md'])archive.file(path.join(datasetRoot,fileName),{name:fileName});
      void archive.finalize();
      return;
    }
    safeHydroValidationScene(req);
    const requestedCase = req.query.caseId ? validationDefinition(req.query.caseId).caseId : null;
    const datasetRoot = validationDatasetRoot(dataDirectory);
    if (!fs.existsSync(datasetRoot)) throw httpError(404, '预测验证数据集尚未生成');
    const archiveName = req.query.deviceId ? downloadFileName(HYDRO_VALIDATION_SCENE_ID, requestedDeviceId(req), '预测核验成对样例', 'zip') : requestedCase ? `2326-水轮机预测验证-${requestedCase}-数据包.zip` : '2326-水轮机预测验证-50组数据包.zip';
    setDownloadHeaders(res, 'application/zip', archiveName);
    const archive = new ZipArchive({ zlib: { level: 9 } });
    archive.on('error', (error) => res.destroy(error));
    archive.pipe(res);
    if (requestedCase) {
      const directory = path.join(datasetRoot, requestedCase);
      for (const fileName of fs.readdirSync(directory)) archive.file(path.join(directory, fileName), { name: `${requestedCase}/${fileName}` });
    } else {
      for (const definition of hydroValidationDefinitions()) {
        const directory = path.join(datasetRoot, definition.caseId);
        for (const fileName of fs.readdirSync(directory)) archive.file(path.join(directory, fileName), { name: `${definition.caseId}/${fileName}` });
      }
      for (const fileName of ['README.md', 'manifest.json', '水轮机预测验证数据集索引.xlsx']) {
        const target = path.join(datasetRoot, fileName);
        if (fs.existsSync(target)) archive.file(target, { name: fileName });
      }
    }
    void archive.finalize();
  }));

  app.post('/api/model-showcase/:sceneId/data/imports', route((req, res) => {
    const sceneId = safeScene(req);
    const fileName = sanitizeFileName(req.body?.fileName);
    const fileSize = Number(req.body?.fileSize);
    const source = parseImportSource(req.body?.source);
    const sclFileName = sanitizeSclFileName(req.body?.sclFileName);
    const sclFileSize = sclFileName ? Number(req.body?.sclFileSize) : 0;
    const mode: ImportMode = req.body?.mode === 'replace' ? 'replace' : 'append';
    const conflictPolicy: ConflictPolicy = ['keep-existing', 'replace-existing', 'reject'].includes(req.body?.conflictPolicy) ? req.body.conflictPolicy : 'keep-existing';
    if (!Number.isSafeInteger(fileSize) || fileSize < 1) throw httpError(400, '文件大小无效');
    if (sclFileName && source !== 'iec61850') throw httpError(400, '只有 IEC 61850 数据来源可以附带 SCL 文件');
    if (sclFileName && (!Number.isSafeInteger(sclFileSize) || sclFileSize < 1)) throw httpError(400, 'SCL 文件大小无效');
    const deviceId = validateDeviceId(req.body?.deviceId);
    const verificationCaseId = req.body?.verificationCaseId ? String(req.body.verificationCaseId) : undefined;
    if (verificationCaseId) {
      safeScene(req);
      const run = readRun(rootFor(dataDirectory, sceneId), verificationCaseId);
      if (run.deviceId !== deviceId) throw httpError(400, '所选预测不属于当前设备');
      if (mode !== 'append') throw httpError(400, '实测核验不允许覆盖参考历史');
    }
    const deviceSource = req.body?.deviceSource === 'existing' || req.body?.deviceSource === 'new' ? req.body.deviceSource : null;
    const existingDevices = new Set(ensureState(dataDirectory, sceneId).records.map((record) => record.device_id));
    if (deviceSource === 'existing' && !existingDevices.has(deviceId)) throw httpError(400, '所选已有设备不存在，请刷新设备清单后重试');
    if (deviceSource === 'new' && existingDevices.has(deviceId)) throw httpError(409, '该设备 ID 已存在，请使用已有设备入口');
    if (deviceSource === 'new' && mode === 'replace') throw httpError(400, '新增设备不能使用覆盖方式');
    const batchId = randomUUID();
    const importRoot = path.join(ensureDirectories(dataDirectory, sceneId), 'imports');
    const tempPath = path.join(importRoot, `${batchId}.part`);
    const normalizedPath = path.join(importRoot, `${batchId}.normalized.json`);
    const sclTempPath = sclFileName ? path.join(importRoot, `${batchId}.scl.part`) : null;
    const now = new Date().toISOString();
    const task: ImportTask = { verificationCaseId, batchId, sceneId, deviceId, fileName, fileSize, format: parseFormat(fileName), source, mode, conflictPolicy, uploadedBytes: 0, parsedRows: 0, totalRows: null, stage: 'uploading', error: null, createdAt: now, updatedAt: now, tempPath, normalizedPath, sclFileName, sclFileSize, sclUploadedBytes: 0, sclTempPath, preview: null };
    fs.writeFileSync(tempPath, Buffer.alloc(0));
    if (sclTempPath) fs.writeFileSync(sclTempPath, Buffer.alloc(0));
    imports.set(batchId, task);
    res.status(201).json({ ...task, tempPath: undefined, normalizedPath: undefined, sclTempPath: undefined });
  }));

  app.post('/api/model-showcase/:sceneId/data/imports/:batchId/preview', route((req, res) => {
    const sceneId = safeScene(req);
    const task = imports.get(String(req.params.batchId));
    if (!task || task.sceneId !== sceneId) throw httpError(404, '上传任务不存在或已过期');
    if (task.stage !== 'uploading' && task.stage !== 'previewed') throw httpError(409, '当前任务不能生成导入预检');
    if (task.uploadedBytes !== task.fileSize) throw httpError(409, `文件尚未上传完成：${task.uploadedBytes}/${task.fileSize}`);
    if (task.sclFileName && task.sclUploadedBytes !== task.sclFileSize) throw httpError(409, `SCL 文件尚未上传完成：${task.sclUploadedBytes}/${task.sclFileSize}`);
    if (task.stage === 'previewed' && task.preview) return res.json({ ...task, tempPath: undefined, normalizedPath: undefined, sclTempPath: undefined });
    task.stage = 'previewing';
    task.updatedAt = new Date().toISOString();
    try {
      task.preview = buildImportPreview(dataDirectory, sceneId, task);
      task.totalRows = task.preview.sourceRowCount;
      task.parsedRows = task.preview.sourceRowCount;
      task.stage = 'previewed';
      task.updatedAt = new Date().toISOString();
      res.json({ ...task, tempPath: undefined, normalizedPath: undefined, sclTempPath: undefined });
    } catch (error) {
      task.stage = 'failed';
      task.error = error instanceof Error ? error.message : '预检解析失败';
      task.updatedAt = new Date().toISOString();
      if (fs.existsSync(task.normalizedPath)) fs.unlinkSync(task.normalizedPath);
      throw error;
    }
  }));

  app.put('/api/model-showcase/:sceneId/data/imports/:batchId/scl/chunks/:index', route(async (req, res) => {
    const sceneId = safeScene(req);
    const task = imports.get(String(req.params.batchId));
    if (!task || task.sceneId !== sceneId) throw httpError(404, '上传任务不存在或已过期');
    if (task.stage !== 'uploading' || !task.sclFileName || !task.sclTempPath) throw httpError(409, '当前任务没有可上传的 SCL 文件');
    const offset = Number(req.headers['x-upload-offset']);
    if (!Number.isSafeInteger(offset) || offset !== task.sclUploadedBytes) throw httpError(409, `SCL 上传偏移不匹配，服务端需要从 ${task.sclUploadedBytes} 字节继续`);
    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(task.sclTempPath!, { flags: 'a' });
      let chunkBytes = 0;
      req.on('data', (chunk: Buffer) => { chunkBytes += chunk.byteLength; });
      req.on('error', reject);
      output.on('error', reject);
      output.on('finish', () => { task.sclUploadedBytes += chunkBytes; task.updatedAt = new Date().toISOString(); resolve(); });
      req.pipe(output);
    });
    if (task.sclUploadedBytes > task.sclFileSize) throw httpError(400, '已上传 SCL 字节数超过声明的文件大小');
    res.json({ batchId: task.batchId, sclUploadedBytes: task.sclUploadedBytes, sclFileSize: task.sclFileSize, stage: task.stage });
  }));

  app.put('/api/model-showcase/:sceneId/data/imports/:batchId/chunks/:index', route(async (req, res) => {
    const sceneId = safeScene(req);
    const task = imports.get(String(req.params.batchId));
    if (!task || task.sceneId !== sceneId) throw httpError(404, '上传任务不存在或已过期');
    if (task.stage !== 'uploading') throw httpError(409, '当前任务不能继续上传');
    const offset = Number(req.headers['x-upload-offset']);
    if (!Number.isSafeInteger(offset) || offset !== task.uploadedBytes) throw httpError(409, `上传偏移不匹配，服务端需要从 ${task.uploadedBytes} 字节继续`);
    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(task.tempPath, { flags: 'a' });
      let chunkBytes = 0;
      req.on('data', (chunk: Buffer) => { chunkBytes += chunk.byteLength; });
      req.on('error', reject);
      output.on('error', reject);
      output.on('finish', () => { task.uploadedBytes += chunkBytes; task.updatedAt = new Date().toISOString(); resolve(); });
      req.pipe(output);
    });
    if (task.uploadedBytes > task.fileSize) throw httpError(400, '已上传字节数超过声明的文件大小');
    res.json({ batchId: task.batchId, uploadedBytes: task.uploadedBytes, fileSize: task.fileSize, stage: task.stage });
  }));

  app.post('/api/model-showcase/:sceneId/data/imports/:batchId/complete', route((req, res) => {
    const sceneId = safeScene(req);
    const task = imports.get(String(req.params.batchId));
    if (!task || task.sceneId !== sceneId) throw httpError(404, '上传任务不存在或已过期');
    if (task.uploadedBytes !== task.fileSize) throw httpError(409, `文件尚未上传完成：${task.uploadedBytes}/${task.fileSize}`);
    if (task.sclFileName && task.sclUploadedBytes !== task.sclFileSize) throw httpError(409, `SCL 文件尚未上传完成：${task.sclUploadedBytes}/${task.sclFileSize}`);
    if (task.stage === 'uploading') {
      task.preview = buildImportPreview(dataDirectory, sceneId, task);
      task.totalRows = task.preview.sourceRowCount;
      task.parsedRows = task.preview.sourceRowCount;
    } else if (task.stage !== 'previewed') {
      throw httpError(409, '当前任务不能确认导入');
    }
    if (!task.preview || !fs.existsSync(task.normalizedPath)) throw httpError(409, '导入预检已失效，请重新上传文件');
    task.stage = 'importing';
    task.updatedAt = new Date().toISOString();
    res.status(202).json({ batchId: task.batchId, stage: task.stage });
    setImmediate(() => {
      try {
        const normalizedRecords = JSON.parse(fs.readFileSync(task.normalizedPath, 'utf8')) as DataRecord[];
        if (!normalizedRecords.length) throw httpError(400, '预检数据中没有可导入记录');
        if (task.verificationCaseId) {
          const modelRoot = rootFor(dataDirectory, sceneId);
          // Validate fully before changing persisted results. Raw inputs are archived by import ID.
          const rawRows = rowsFromFile(task);
          checkVerification(modelRoot, task.verificationCaseId, task.deviceId, normalizedRecords, rawRows, false, sceneId);
          const archive = path.join(unifiedRoot(modelRoot), 'uploads');
          fs.mkdirSync(archive, { recursive: true });
          fs.copyFileSync(task.tempPath, path.join(archive, `${task.verificationCaseId}-${task.batchId}.${task.format}`));
          if (task.sclTempPath) fs.copyFileSync(task.sclTempPath, path.join(modelRoot, 'protocol', 'scl', `${task.batchId}-${task.sclFileName}`));
          checkVerification(modelRoot, task.verificationCaseId, task.deviceId, normalizedRecords, rawRows, true, sceneId);
          for (const file of [task.tempPath, task.normalizedPath, task.sclTempPath]) if (file && fs.existsSync(file)) fs.unlinkSync(file);
          task.stage = 'completed';
          task.updatedAt = new Date().toISOString();
          return;
        }
        const state = ensureState(dataDirectory, sceneId);
        const fileHash = createHash('sha256').update(fs.readFileSync(task.tempPath)).digest('hex');
        const duplicateBatch = state.batches.find((batch) => batch.sha256 === fileHash && batch.deviceId === task.deviceId);
        if (duplicateBatch && task.conflictPolicy === 'reject') throw httpError(409, `相同文件已于 ${duplicateBatch.importedAt} 导入`);
        const replacedBatchIds = new Set(task.mode === 'replace' ? state.batches.filter((batch) => batch.deviceId === task.deviceId).map((batch) => batch.batchId) : []);
        const base = task.mode === 'replace' ? state.records.filter((record) => record.device_id !== task.deviceId) : state.records.slice();
        const indexed = new Map(base.map((record) => [`${record.device_id}|${record.timestamp}`, record]));
        let duplicates = 0;
        let accepted = 0;
        for (const record of normalizedRecords) {
          const key = `${record.device_id}|${record.timestamp}`;
          if (indexed.has(key)) {
            duplicates += 1;
            if (task.conflictPolicy === 'reject') throw httpError(409, `发现重复记录：${record.device_id} / ${record.timestamp}`);
            if (task.conflictPolicy === 'keep-existing') continue;
          }
          indexed.set(key, record);
          accepted += 1;
        }
        let sclMetadata: Pick<BatchManifest, 'sclFileName' | 'sclPath' | 'sclSha256' | 'sclSize'> = {};
        if (task.sclFileName && task.sclTempPath) {
          const sclArchiveName = `${task.batchId}-${task.sclFileName}`;
          const sclRelativePath = path.posix.join('protocol', 'scl', sclArchiveName);
          const sclTarget = path.join(rootFor(dataDirectory, sceneId), 'protocol', 'scl', sclArchiveName);
          fs.copyFileSync(task.sclTempPath, sclTarget);
          sclMetadata = {
            sclFileName: task.sclFileName,
            sclPath: sclRelativePath,
            sclSha256: createHash('sha256').update(fs.readFileSync(task.sclTempPath)).digest('hex'),
            sclSize: task.sclFileSize,
          };
        }
        const manifest: BatchManifest = { batchId: task.batchId, fileName: task.fileName, fileSize: task.fileSize, sha256: fileHash, format: task.format, source: task.source, deviceId: task.deviceId, mode: task.mode, conflictPolicy: task.conflictPolicy, importedAt: new Date().toISOString(), rowCount: task.preview!.sourceRowCount, acceptedCount: accepted, rejectedCount: task.preview!.rejectedRecordCount, duplicateCount: duplicates, status: 'completed', ...sclMetadata };
        const next: StoredState = { ...state, records: [...indexed.values()].sort((a, b) => a.timestamp.localeCompare(b.timestamp)), batches: task.mode === 'replace' ? [...state.batches.filter((batch) => batch.deviceId !== task.deviceId), manifest] : [...state.batches, manifest] };
        task.focusBatchId = accepted > 0 ? task.batchId : duplicateBatch && next.records.some(r=>r.batch_id===duplicateBatch.batchId) ? duplicateBatch.batchId : '';
        fs.copyFileSync(task.tempPath, path.join(rootFor(dataDirectory, sceneId), 'batches', `${task.batchId}.${task.format}`));
        writeState(dataDirectory, sceneId, next);
        removeBatchFiles(dataDirectory, sceneId, replacedBatchIds);
        fs.unlinkSync(task.tempPath);
        fs.unlinkSync(task.normalizedPath);
        if (task.sclTempPath && fs.existsSync(task.sclTempPath)) fs.unlinkSync(task.sclTempPath);
        task.stage = 'completed';
        task.updatedAt = new Date().toISOString();
      } catch (error) {
        task.stage = 'failed';
        task.error = error instanceof Error ? error.message : '解析失败';
        task.updatedAt = new Date().toISOString();
        if (fs.existsSync(task.tempPath)) fs.unlinkSync(task.tempPath);
        if (fs.existsSync(task.normalizedPath)) fs.unlinkSync(task.normalizedPath);
        if (task.sclTempPath && fs.existsSync(task.sclTempPath)) fs.unlinkSync(task.sclTempPath);
      }
    });
  }));

  app.get('/api/model-showcase/:sceneId/data/imports/:batchId', route((req, res) => {
    const sceneId = safeScene(req);
    const task = imports.get(String(req.params.batchId));
    if (!task || task.sceneId !== sceneId) throw httpError(404, '上传任务不存在或已过期');
    res.json({ ...task, tempPath: undefined, normalizedPath: undefined, sclTempPath: undefined });
  }));

  app.delete('/api/model-showcase/:sceneId/data/imports/:batchId', route((req, res) => {
    const sceneId = safeScene(req);
    const task = imports.get(String(req.params.batchId));
    if (!task || task.sceneId !== sceneId) throw httpError(404, '上传任务不存在或已过期');
    if (task.stage === 'completed') throw httpError(409, '已完成任务请通过批次删除');
    task.stage = 'cancelled';
    if (fs.existsSync(task.tempPath)) fs.unlinkSync(task.tempPath);
    if (fs.existsSync(task.normalizedPath)) fs.unlinkSync(task.normalizedPath);
    if (task.sclTempPath && fs.existsSync(task.sclTempPath)) fs.unlinkSync(task.sclTempPath);
    res.status(204).end();
  }));

  app.post('/api/model-showcase/:sceneId/data/reset', route((req, res) => {
    const sceneId = safeScene(req);
    const previous = ensureState(dataDirectory, sceneId);
    removeBatchFiles(dataDirectory, sceneId, new Set(previous.batches.map((batch) => batch.batchId)));
    writeState(dataDirectory, sceneId, initializedState(sceneId));
    res.json(overview(sceneId, readState(dataDirectory, sceneId)));
  }));

  app.delete('/api/model-showcase/:sceneId/data', route((req, res) => {
    const sceneId = safeScene(req);
    const state = ensureState(dataDirectory, sceneId);
    const scope = String(req.query.scope || 'all');
    const target = String(req.query.target || '');
    if (!['all', 'device', 'batch'].includes(scope)) throw httpError(400, '不支持的删除范围');
    const records = scope === 'all' ? [] : scope === 'device' ? state.records.filter((record) => record.device_id !== validateDeviceId(target)) : state.records.filter((record) => record.batch_id !== target);
    const batches = scope === 'all' ? [] : scope === 'device' ? state.batches.filter((batch) => batch.deviceId !== target) : state.batches.filter((batch) => batch.batchId !== target);
    const removedBatchIds = new Set(state.batches.filter((batch) => !batches.some((retained) => retained.batchId === batch.batchId)).map((batch) => batch.batchId));
    removeBatchFiles(dataDirectory, sceneId, removedBatchIds);
    writeState(dataDirectory, sceneId, { ...state, records, batches });
    res.json(overview(sceneId, readState(dataDirectory, sceneId)));
  }));

  app.post('/api/model-showcase/:sceneId/data/protocol/convert', route((req, res) => {
    const sceneId = safeScene(req);
    const source = req.body?.source === 'iec61850' ? 'iec61850' : 'modbus';
    const input = req.body?.values && typeof req.body.values === 'object' ? req.body.values as Record<string, unknown> : {};
    const p = PROFILES[sceneId];
    const normalized = normalizeProtocolValues(sceneId, source, input);
    const target = source === 'modbus' ? Object.fromEntries(p.fields.filter((rule) => Number.isFinite(normalized[rule.field])).map((rule) => [rule.iec61850Path, normalized[rule.field]])) : Object.fromEntries(p.fields.filter((rule) => Number.isFinite(normalized[rule.field])).map((rule) => [String(rule.modbusAddress), normalized[rule.field]]));
    res.json({ source, target: source === 'modbus' ? 'iec61850' : 'modbus', normalized, values: target, mappedCount: Object.keys(normalized).length });
  }));

  app.get('/api/model-showcase/:sceneId/data/protocols', route((req, res) => {
    const sceneId = safeScene(req);
    res.json({
      sceneId,
      adapters: [
        { protocol: 'modbus', transports: ['TCP', 'RTU'], status: 'ready-for-configuration' },
        { protocol: 'iec61850', transports: ['MMS', 'reports'], status: 'ready-for-configuration' },
      ],
      mappings: PROFILES[sceneId].fields.map((field) => ({ field: field.field, modbusAddress: field.modbusAddress, iec61850Path: field.iec61850Path, unit: field.unit })),
      ingestPath: `/api/model-showcase/${sceneId}/data/protocol/ingest`,
      convertPath: `/api/model-showcase/${sceneId}/data/protocol/convert`,
    });
  }));

  app.post('/api/model-showcase/:sceneId/data/protocol/ingest', route((req, res) => {
    const sceneId = safeScene(req);
    const source: 'modbus' | 'iec61850' = req.body?.source === 'iec61850' ? 'iec61850' : 'modbus';
    const deviceId = validateDeviceId(req.body?.deviceId);
    const input = req.body?.values && typeof req.body.values === 'object' ? req.body.values as Record<string, unknown> : {};
    const values = normalizeProtocolValues(sceneId, source, input);
    if (Object.keys(values).length !== PROFILES[sceneId].fields.length) throw httpError(400, '协议数据未包含本模型的全部必需点位');
    const timestampMillis = Date.parse(String(req.body?.timestamp || new Date().toISOString()));
    if (!Number.isFinite(timestampMillis)) throw httpError(400, '协议数据时间戳无效');
    const qualityText = String(req.body?.quality || 'good').toLowerCase();
    const quality: Quality = qualityText === 'bad' ? 'bad' : qualityText === 'uncertain' ? 'uncertain' : 'good';
    const timestamp = new Date(timestampMillis).toISOString();
    const batchId = `${source}-${randomUUID()}`;
    const state = ensureState(dataDirectory, sceneId);
    const indexed = new Map(state.records.map((record) => [`${record.device_id}|${record.timestamp}`, record]));
    indexed.set(`${deviceId}|${timestamp}`, { timestamp, device_id: deviceId, quality, values, batch_id: batchId });
    const serialized = JSON.stringify({ source, deviceId, timestamp, quality, values });
    const manifest: BatchManifest = { batchId, fileName: `${source}-${timestamp}.json`, fileSize: Buffer.byteLength(serialized), sha256: createHash('sha256').update(serialized).digest('hex'), format: source, source, deviceId, mode: 'append', conflictPolicy: 'replace-existing', importedAt: new Date().toISOString(), rowCount: 1, acceptedCount: 1, rejectedCount: 0, duplicateCount: state.records.length === indexed.size ? 1 : 0, status: 'completed' };
    fs.writeFileSync(path.join(rootFor(dataDirectory, sceneId), 'batches', `${batchId}.${source}.json`), serialized, 'utf8');
    writeState(dataDirectory, sceneId, { ...state, records: [...indexed.values()].sort((a, b) => a.timestamp.localeCompare(b.timestamp)), batches: [...state.batches, manifest] });
    res.status(201).json({ batchId, dataVersion: readState(dataDirectory, sceneId).dataVersion, normalized: values, analysis: analyse(sceneId, readState(dataDirectory, sceneId), deviceId) });
  }));

  app.get('/api/model-showcase/:sceneId/downloads/specification', route(async (req, res) => {
    const sceneId = safeScene(req);
    const deviceId = requestedDeviceId(req);
    const config = getModelShowcaseConfig(sceneId)!;
    const format = requestedFormat(req, ['pdf', 'docx', 'json'], 'pdf');
    const title = `${config.title} 数据规范`;
    const sections = specificationSections(sceneId);
    if (format === 'json') return sendJsonDownload(res, downloadFileName(sceneId, deviceId, '数据规范', 'json'), { ...schemaFor(sceneId), deviceId });
    if (format === 'docx') return writeDocx(res, downloadFileName(sceneId, deviceId, '数据规范', 'docx'), title, sections);
    writePdf(res, downloadFileName(sceneId, deviceId, '数据规范', 'pdf'), title, sections);
  }));

  app.get('/api/model-showcase/:sceneId/downloads/samples', route((req, res) => {
    const sceneId = safeScene(req);
    const deviceId = requestedDeviceId(req);
    const source = parseImportSource(req.query.source);
    const format = requestedFormat(req, ['csv', 'xlsx', 'json', 'zip'], 'zip');
    const rows = protocolRowsForSample(sceneId, deviceId, source);
    const sampleLabel = source === 'standard' ? '数据样例' : `${sourceLabel(source).replace(' ', '')}数据样例`;
    const sheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, sheet, sourceLabel(source).slice(0, 31));
    if (source !== 'standard') {
      const guideSheet = xlsx.utils.json_to_sheet(requiredProtocolColumns(source).map((field) => ({ 字段名: field, 是否必需: '是', 说明: '字段名固定，可增加其他扩展列' })));
      xlsx.utils.book_append_sheet(workbook, guideSheet, '固定字段说明');
    }
    if (format === 'csv') return sendCsvDownload(res, downloadFileName(sceneId, deviceId, sampleLabel, 'csv'), sheet);
    if (format === 'json') return sendJsonDownload(res, downloadFileName(sceneId, deviceId, sampleLabel, 'json'), { source, deviceId, ...(source === 'standard' ? {} : { requiredColumns: requiredProtocolColumns(source), exceptionPolicy: schemaFor(sceneId).obviousExceptionPolicy }), records: rows });
    if (format === 'xlsx') {
      setDownloadHeaders(res, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', downloadFileName(sceneId, deviceId, sampleLabel, 'xlsx'));
      return res.send(xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
    }
    setDownloadHeaders(res, 'application/zip', downloadFileName(sceneId, deviceId, `${sampleLabel}-全格式`, 'zip'));
    const archive = new ZipArchive({ zlib: { level: 9 } });
    archive.on('error', (error) => res.destroy(error));
    archive.pipe(res);
    archive.append(xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' }), { name: downloadFileName(sceneId, deviceId, sampleLabel, 'xlsx') });
    archive.append(`\ufeff${xlsx.utils.sheet_to_csv(sheet)}`, { name: downloadFileName(sceneId, deviceId, sampleLabel, 'csv') });
    archive.append(JSON.stringify({ source, deviceId, ...(source === 'standard' ? {} : { requiredColumns: requiredProtocolColumns(source), exceptionPolicy: schemaFor(sceneId).obviousExceptionPolicy }), records: rows }, null, 2), { name: downloadFileName(sceneId, deviceId, sampleLabel, 'json') });
    if (source !== 'standard') archive.append(protocolFieldGuide(source), { name: downloadFileName(sceneId, deviceId, `${sourceLabel(source).replace(' ', '')}固定字段说明`, 'txt') });
    void archive.finalize();
  }));

  app.get('/api/model-showcase/:sceneId/downloads/prediction', route((req, res) => {
    const sceneId = safeScene(req);
    const deviceId = requestedDeviceId(req);
    const format = requestedFormat(req, ['csv', 'xlsx', 'json'], 'xlsx');
    if (req.query.runId) {
      safeScene(req);
      const run = readRun(rootFor(dataDirectory, sceneId), String(req.query.runId));
      if (run.deviceId !== deviceId) throw httpError(400, '下载设备与预测不一致');
      if (format === 'json') return sendJsonDownload(res, downloadFileName(sceneId, deviceId, '预测结果', 'json'), run);
      const sheet = xlsx.utils.json_to_sheet(run.prediction.forecasts.map(f => ({ ...f, device_id: deviceId, predicted_tag: run.prediction.tag, fault: run.prediction.faultName, part: run.prediction.faultPart })));
      if (format === 'csv') return sendCsvDownload(res, downloadFileName(sceneId, deviceId, '预测结果', 'csv'), sheet);
      const book = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(book, sheet, '预测结果');
      if (run.result) xlsx.utils.book_append_sheet(book, xlsx.utils.json_to_sheet(run.result.fieldMetrics), '核验误差');
      setDownloadHeaders(res, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', downloadFileName(sceneId, deviceId, '预测结果', 'xlsx'));
      return res.send(xlsx.write(book, { type: 'buffer', bookType: 'xlsx' }));
    }
    const result = analyse(sceneId, ensureState(dataDirectory, sceneId), deviceId);
    if (format === 'json') return sendJsonDownload(res, downloadFileName(sceneId, deviceId, '预测结果', 'json'), result);
    const forecastRows = result.forecasts.map((row) => ({ ...row, health_score: result.diagnosis.healthScore, risk_level: result.diagnosis.riskLevel }));
    const forecastSheet = xlsx.utils.json_to_sheet(forecastRows);
    if (format === 'csv') return sendCsvDownload(res, downloadFileName(sceneId, deviceId, '预测结果', 'csv'), forecastSheet);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, forecastSheet, '预测结果');
    xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(result.diagnosis.predictions), '诊断结果');
    const output = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    setDownloadHeaders(res, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', downloadFileName(sceneId, deviceId, '预测结果', 'xlsx'));
    res.send(output);
  }));

  app.get('/api/model-showcase/:sceneId/downloads/report', route(async (req, res) => {
    const sceneId = safeScene(req);
    const deviceId = requestedDeviceId(req);
    const format = requestedFormat(req, ['pdf', 'docx', 'json'], 'pdf');
    if (req.query.runId) {
      safeScene(req);
      const run = readRun(rootFor(dataDirectory, sceneId), String(req.query.runId));
      if (run.deviceId !== deviceId) throw httpError(400, '下载设备与预测不一致');
      const summary = unifiedSummary(rootFor(dataDirectory, sceneId));
      if (format === 'json') return sendJsonDownload(res, downloadFileName(sceneId, deviceId, '分析报告', 'json'), { run, summary });
      const sections: DownloadSection[] = [
        { heading: '参考数据', lines: [`设备：${deviceId}`, `文件：${run.observation.fileName}`, `${run.observation.startAt} 至 ${run.observation.endAt}，${run.history.length} 条`, `预测时间：${run.prediction.generatedAt}`] },
        { heading: '预测结论', lines: [run.prediction.conclusion, `预警部位：${run.prediction.faultPart}`, `阈值诊断模型：${run.prediction.thresholdModelVersion || getModelOperationalProfile(sceneId).thresholdModel.version}`] },
        { heading: '预测依据', lines: (run.prediction.models || []).map(m=>`${m.field}：${m.method}；拟合 ${m.trainingRecords} 条；回测 MAE ${m.validationMae ?? '--'}；基线 MAE ${m.baselineMae ?? '--'}；周期 ${m.period ?? '未识别'} 个采样点；回测跨度 ${m.validationHorizon} 个采样点。`) },
        { heading: '预警指标与处置', lines: (run.prediction.alerts || []).length ? run.prediction.alerts.map(a=>`${a.label}：${a.part}，${a.firstAt} 起持续 ${a.durationMinutes} 分钟，峰值 ${a.peakValue} ${a.unit}，参考范围 ${a.normalMin}—${a.normalMax}。`) : ['预测中值未触发持续越界预警。'] },
        { heading: '检查建议', lines: (run.prediction.candidates || []).map(c=>`${c.faultName}：${c.recommendation}`) },
        { heading: '本次核验', lines: run.result ? [`覆盖率：${((run.coverage || 0)*100).toFixed(1)}%`, `状态核验：${run.labelKnown ? run.result.statusCorrect ? '一致' : '有偏差' : '未提供实际标签'}`, ...run.result.fieldMetrics.map(m=>`${m.label} MAE ${m.mae} ${m.unit}，RMSE ${m.rmse} ${m.unit}，归一化误差 ${(m.normalizedMae*100).toFixed(2)}%`)] : ['尚未传入后续实测'] },
        { heading: '累计核验', lines: [`已完成 ${summary.verifiedCases} 次，具有状态标签 ${summary.statusCount} 次`, `状态准确率：${summary.metrics.statusAccuracy == null ? '--' : (summary.metrics.statusAccuracy*100).toFixed(1)+'%'}`] },
      ];
      const title = '水轮机预测与实测核验报告';
      if (format === 'docx') return writeDocx(res, downloadFileName(sceneId, deviceId, '分析报告', 'docx'), title, sections);
      return writePdf(res, downloadFileName(sceneId, deviceId, '分析报告', 'pdf'), title, sections);
    }
    const state = ensureState(dataDirectory, sceneId);
    const result = analyse(sceneId, state, deviceId);
    const config = getModelShowcaseConfig(sceneId)!;
    const title = `${config.title} 数据分析报告`;
    const sections = reportSections(state, result);
    if (format === 'json') return sendJsonDownload(res, downloadFileName(sceneId, deviceId, '分析报告', 'json'), { sceneId, modelId: config.modelId, modelName: config.title, ...result });
    if (format === 'docx') return writeDocx(res, downloadFileName(sceneId, deviceId, '分析报告', 'docx'), title, sections);
    writePdf(res, downloadFileName(sceneId, deviceId, '分析报告', 'pdf'), title, sections);
  }));
}
