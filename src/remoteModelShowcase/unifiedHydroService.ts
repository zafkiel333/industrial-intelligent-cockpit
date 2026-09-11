import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { validationPredictionForScene, compareModelValidation, type DataRecord, type StoredState } from './pilotDataService';
import { forecastTraining } from './adaptiveForecast';
import { getModelOperationalProfile } from './modelOperationalProfiles';
import type { ModelShowcaseSceneId } from './types';

const HYDRO_SCENE:ModelShowcaseSceneId = 'sim-visual-hydro-turbine';
const fail = (message: string, status = 400): never => { throw Object.assign(new Error(message), { status }); };
export type HydroSceneLogLevel = 'normal' | 'info' | 'attention' | 'warning' | 'critical';
export interface HydroSceneLogEntry {
  id: string;
  timestamp: string;
  level: HydroSceneLogLevel;
  category: 'operation' | 'prediction' | 'verification';
  deviceId: string;
  caseId: string;
  content: string;
}
export interface StoredResponseTiming {
  traceId: string;
  scope: string;
  action: string;
  context: string;
  start: number;
  end: number;
  duration: number;
  status: 'completed' | 'failed' | 'cancelled';
  recordedAt: string;
}
export interface HydroRun {
  sceneId?: ModelShowcaseSceneId;
  caseId: string;
  deviceId: string;
  reference: { batchId: string; fingerprint: string; dataVersion: string };
  observation: { fileName: string; sha256: string; rowCount: number; startAt: string; endAt: string; uploadedAt: string };
  history: DataRecord[];
  prediction: ReturnType<typeof validationPredictionForScene>;
  status: 'predicted' | 'verified';
  result?: Omit<ReturnType<typeof compareModelValidation>, 'actualTag' | 'statusCorrect' | 'faultCorrect' | 'conclusionCorrect'> & { actualTag: 'normal'|'abnormal'|null; statusCorrect:boolean|null;faultCorrect:boolean|null;conclusionCorrect:boolean|null };
  coverage?: number;
  labelKnown?: boolean;
  faultKnown?: boolean;
}

function logRoot(modelRoot: string) {
  const root = path.join(modelRoot, 'logs');
  fs.mkdirSync(root, { recursive: true });
  return root;
}
function readJsonLines<T>(file: string): T[] {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).flatMap(line => {
    try { return [JSON.parse(line) as T]; } catch { return []; }
  });
}
const persistedLogKeys = new Map<string, Set<string>>();
function appendUnique<T extends { id?: string; traceId?: string }>(file: string, entry: T) {
  const key = entry.id || entry.traceId;
  if (!key) return;
  let keys = persistedLogKeys.get(file);
  if (!keys) {
    keys = new Set(readJsonLines<T>(file).map(row => row.id || row.traceId).filter((value): value is string => Boolean(value)));
    persistedLogKeys.set(file, keys);
  }
  if (keys.has(key)) return;
  fs.appendFileSync(file, `${JSON.stringify(entry)}\n`, 'utf8');
  keys.add(key);
}
function cleanLogText(value: unknown, max = 160) {
  return String(value ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
}
function formatBusinessTime(value: unknown) {
  const date = new Date(String(value || ''));
  if (!Number.isFinite(date.getTime())) return cleanLogText(value, 40);
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(date).replaceAll('/', '-');
}
function predictionLogEntry(run: HydroRun, sceneId:ModelShowcaseSceneId): HydroSceneLogEntry {
  const profile=getModelOperationalProfile(sceneId);
  const prediction = run.prediction;
  const alerts = [...(prediction.alerts || [])].sort((left, right) => {
    const rank: Record<string, number> = { critical: 3, warning: 2, attention: 1 };
    return (rank[right.severity] || 0) - (rank[left.severity] || 0);
  });
  const primaryAlert = alerts[0];
  if (prediction.tag === 'normal') {
    return {
      id: `prediction:${run.caseId}`, timestamp: prediction.generatedAt, level: 'normal', category: 'prediction',
      deviceId: run.deviceId, caseId: run.caseId,
      content: `预测完成：设备 ${run.deviceId} 的${prediction.horizon}趋势判断为正常，${profile.fields.length}项关键指标未形成持续越界。${profile.normalLog}建议按计划复核${profile.reviewTarget}。`,
    };
  }
  const hasSevereAlert = prediction.riskLevel === 'critical' && alerts.some(alert =>
    alert.severity === 'critical' && (Number(alert.durationMinutes) >= 60 || alerts.length >= 2));
  const level: HydroSceneLogLevel = hasSevereAlert
    ? 'critical'
    : prediction.riskLevel === 'warning' || prediction.riskLevel === 'critical'
      ? 'warning'
      : 'attention';
  const prefix = level === 'critical' ? '严重风险预测' : level === 'warning' ? '预测预警' : '预测关注';
  const timing = primaryAlert
    ? `最早持续越界预计开始于 ${formatBusinessTime(primaryAlert.firstAt)}，最长连续约 ${Number(primaryAlert.durationMinutes).toFixed(1)} 分钟。`
    : '';
  return {
    id: `prediction:${run.caseId}`, timestamp: prediction.generatedAt, level, category: 'prediction',
    deviceId: run.deviceId, caseId: run.caseId,
    content: `${prefix}：设备 ${run.deviceId} 的${prediction.horizon}预测发现 ${alerts.length} 项持续越界趋势，主要疑似故障为${prediction.faultName}，重点关注${prediction.faultPart}。${timing}建议结合当前工况优先开展现场复核。`,
  };
}
function verificationLogEntry(run: HydroRun): HydroSceneLogEntry | null {
  if (!run.result) return null;
  const actual = run.labelKnown && run.result.actualTag ? run.result.actualTag : null;
  const identity = createHash('sha256').update(JSON.stringify({
    caseId: run.caseId, coverage: run.coverage || 0, actual, fault: run.result.actualFaultCode,
    series: run.result.actualSeries.map(row => [row.timestamp, row.values]),
  })).digest('hex').slice(0, 16);
  const complete = run.coverage === 1;
  const matched = run.result.statusCorrect === true;
  const level: HydroSceneLogLevel = !actual
    ? 'info'
    : matched
      ? actual === 'normal' ? 'normal' : 'info'
      : actual === 'abnormal' ? 'warning' : 'attention';
  const comparison = actual
    ? `预测状态为${run.prediction.tag === 'normal' ? '正常' : '异常'}，实际状态为${actual === 'normal' ? '正常' : '异常'}，状态判断${matched ? '一致' : '不一致'}`
    : '验证数据未提供实际状态标签，本次仅核验数值偏差';
  return {
    id: `verification:${run.caseId}:${identity}`, timestamp: run.result.verifiedAt, level, category: 'verification',
    deviceId: run.deviceId, caseId: run.caseId,
    content: `${complete ? '实测核验完成' : '阶段性实测核验'}：设备 ${run.deviceId} 已覆盖 ${(Number(run.coverage || 0) * 100).toFixed(1)}% 的预测时间段；${comparison}，本次 sMAPE 为 ${(run.result.smape * 100).toFixed(1)}%。`,
  };
}
function sceneLogFile(modelRoot: string) { return path.join(logRoot(modelRoot), 'scene-prediction-events.jsonl'); }
function responseLogFile(modelRoot: string) { return path.join(logRoot(modelRoot), 'system-response-events.jsonl'); }
function writeSceneLog(modelRoot: string, entry: HydroSceneLogEntry | null) {
  if (!entry) return;
  try { appendUnique(sceneLogFile(modelRoot), entry); } catch (error) { console.error('[hydro-log] failed to persist scene log:', error); }
}
type OperationalHistoryKind = 'current' | 'operation' | 'plan' | 'closure' | 'normal-prediction' | 'attention-prediction' | 'warning-prediction' | 'critical-prediction' | 'normal-verification' | 'attention-verification' | 'abnormal-verification';
interface OperationalHistoryBlueprint {
  days: number;
  level: HydroSceneLogLevel;
  category: HydroSceneLogEntry['category'];
  kind: OperationalHistoryKind;
  faultSlot?: number;
}
const OPERATIONAL_HISTORY_BLUEPRINTS: OperationalHistoryBlueprint[] = [
  {days:0,level:'normal',category:'operation',kind:'current'},
  {days:1,level:'normal',category:'verification',kind:'normal-verification'},
  {days:3,level:'normal',category:'prediction',kind:'normal-prediction'},
  {days:6,level:'info',category:'operation',kind:'operation'},
  {days:10,level:'normal',category:'verification',kind:'normal-verification'},
  {days:14,level:'normal',category:'prediction',kind:'normal-prediction'},
  {days:20,level:'normal',category:'operation',kind:'closure'},
  {days:27,level:'info',category:'verification',kind:'abnormal-verification',faultSlot:0},
  {days:31,level:'warning',category:'prediction',kind:'warning-prediction',faultSlot:0},
  {days:38,level:'normal',category:'operation',kind:'closure'},
  {days:46,level:'normal',category:'verification',kind:'normal-verification'},
  {days:52,level:'normal',category:'prediction',kind:'normal-prediction'},
  {days:61,level:'info',category:'operation',kind:'plan'},
  {days:70,level:'normal',category:'operation',kind:'closure'},
  {days:76,level:'info',category:'verification',kind:'attention-verification'},
  {days:83,level:'attention',category:'prediction',kind:'attention-prediction'},
  {days:96,level:'normal',category:'operation',kind:'operation'},
  {days:110,level:'normal',category:'verification',kind:'normal-verification'},
  {days:118,level:'normal',category:'prediction',kind:'normal-prediction'},
  {days:131,level:'info',category:'operation',kind:'operation'},
  {days:145,level:'normal',category:'operation',kind:'closure'},
  {days:154,level:'info',category:'verification',kind:'attention-verification'},
  {days:165,level:'attention',category:'prediction',kind:'attention-prediction'},
  {days:179,level:'normal',category:'operation',kind:'operation'},
  {days:196,level:'normal',category:'operation',kind:'closure'},
  {days:205,level:'info',category:'verification',kind:'abnormal-verification',faultSlot:1},
  {days:218,level:'warning',category:'prediction',kind:'warning-prediction',faultSlot:1},
  {days:236,level:'info',category:'operation',kind:'plan'},
  {days:257,level:'normal',category:'operation',kind:'closure'},
  {days:269,level:'info',category:'verification',kind:'abnormal-verification',faultSlot:2},
  {days:284,level:'critical',category:'prediction',kind:'critical-prediction',faultSlot:2},
  {days:315,level:'normal',category:'operation',kind:'operation'},
  {days:342,level:'normal',category:'verification',kind:'normal-verification'},
  {days:350,level:'normal',category:'prediction',kind:'normal-prediction'},
];

export function buildOperationalHistoryEntries(modelRoot:string,sceneId:ModelShowcaseSceneId,now=Date.now()):HydroSceneLogEntry[]{
  const profile=getModelOperationalProfile(sceneId);
  const device=`${path.basename(modelRoot).match(/model-(\d+)/)?.[1]||'DEV'}-01`;
  const seed=Number.parseInt(createHash('sha256').update(sceneId).digest('hex').slice(0,8),16);
  const faults=profile.faultProfiles;
  const seriousFault=faults.find(fault=>fault.serious);
  const allowCritical=Boolean(seriousFault)&&seed%17===0;
  const field=(index:number)=>profile.fields[index%profile.fields.length];
  const fault=(index:number)=>faults[index%faults.length];
  const smape=(index:number)=>(6.2+((seed+index*19)%67)/10).toFixed(1);
  const content=(kind:OperationalHistoryKind,index:number,faultSlot?:number)=>{
    const currentField=field(index);
    const currentFault=fault(faultSlot??index);
    switch(kind){
      case 'current': return `设备 ${device} 最新运行复核完成，${profile.fields.map(item=>item.label).join('、')}保持协调，当前未形成需要升级处置的持续异常。`;
      case 'operation': return `设备 ${device} 完成${profile.reviewTarget}例行检查，重点核查${currentField.part}及${currentField.label}趋势，运行数据与现场状态相符。`;
      case 'plan': return `设备 ${device} 下一周期检查计划已确认，将结合${currentField.label}变化重点复核${profile.reviewTarget}，相关测点和工况记录已准备。`;
      case 'closure': return `设备 ${device} 前期关注事项完成闭环，${currentField.part}复核正常，相关指标恢复稳定并继续纳入周期趋势监测。`;
      case 'normal-prediction': return `预测完成：设备 ${device} 的${profile.forecastLabel}趋势判断为正常，${profile.fields.length}项关键指标未形成持续越界。${profile.normalLog}`;
      case 'attention-prediction': return `预测关注：设备 ${device} 的${currentField.label}在${profile.forecastLabel}内短时接近参考边界，尚未形成持续越界；建议结合工况复核${currentField.part}。`;
      case 'warning-prediction': return `预测预警：设备 ${device} 的${profile.forecastLabel}趋势显示${currentFault.name}，主要关联${currentFault.fields.map(name=>profile.fields.find(item=>item.field===name)?.label||name).join('、')}，重点检查${currentFault.part}。`;
      case 'critical-prediction': {
        const selected=allowCritical?seriousFault!:currentFault;
        return `${allowCritical?'严重风险预测':'预测预警'}：设备 ${device} 的${profile.forecastLabel}趋势显示${selected.name}并存在持续扩大迹象，重点部位为${selected.part}；已按计划组织现场复核并控制相关运行条件。`;
      }
      case 'normal-verification': return `实测核验完成：设备 ${device} 的预测状态为正常、实际状态为正常，状态判断一致；${profile.fields.length}项指标对齐完整，本次 sMAPE 为 ${smape(index)}%。`;
      case 'attention-verification': return `实测核验完成：设备 ${device} 的预测状态与实际状态一致；${currentField.label}存在局部偏差但未改变总体判断，本次 sMAPE 为 ${smape(index)}%。`;
      case 'abnormal-verification': return `实测核验完成：设备 ${device} 的预测状态为异常、实际状态为异常，${currentFault.name}结论与现场复核一致；本次 sMAPE 为 ${smape(index)}%。`;
    }
  };
  return OPERATIONAL_HISTORY_BLUEPRINTS.map((blueprint,index)=>{
    const minuteOffset=(seed+index*97)%720;
    const isCritical=blueprint.kind==='critical-prediction'&&allowCritical;
    const criticalFallback=blueprint.faultSlot===2&&!allowCritical;
    const effectiveKind=criticalFallback
      ? blueprint.kind==='critical-prediction'?'attention-prediction':blueprint.kind==='abnormal-verification'?'attention-verification':blueprint.kind
      : blueprint.kind;
    return {
      id:`operational-v2:${sceneId}:${index}`,
      timestamp:new Date(now-blueprint.days*86400000-minuteOffset*60000).toISOString(),
      level:blueprint.level==='critical'?(isCritical?'critical':'attention'):blueprint.level,
      category:blueprint.category,
      deviceId:device,
      caseId:`operational-history-${String(index+1).padStart(2,'0')}`,
      content:content(effectiveKind,index,blueprint.faultSlot),
    };
  });
}
function ensureOperationalHistory(modelRoot:string,sceneId:ModelShowcaseSceneId){
  for(const event of buildOperationalHistoryEntries(modelRoot,sceneId))writeSceneLog(modelRoot,event);
}
export function readHydroSceneLogs(modelRoot: string, sceneId:ModelShowcaseSceneId=HYDRO_SCENE) {
  ensureOperationalHistory(modelRoot,sceneId);
  for (const name of fs.readdirSync(unifiedRoot(modelRoot)).filter(value => /^P-[a-f0-9]{32}\.json$/.test(value))) {
    const run = readRun(modelRoot, name.slice(0, -5));
    writeSceneLog(modelRoot, predictionLogEntry(run,sceneId));
    writeSceneLog(modelRoot, verificationLogEntry(run));
  }
  const unique = new Map<string, HydroSceneLogEntry>();
  for (const row of readJsonLines<HydroSceneLogEntry>(sceneLogFile(modelRoot))) unique.set(row.id, row);
  return [...unique.values()].sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}
export function recordResponseTiming(modelRoot: string, input: Partial<StoredResponseTiming>, sceneId:ModelShowcaseSceneId=HYDRO_SCENE) {
  const traceId = cleanLogText(input.traceId, 120);
  const action = cleanLogText(input.action, 80);
  const context = cleanLogText(input.context, 160);
  const start = Number(input.start), end = Number(input.end), duration = Number(input.duration);
  const status = input.status;
  if (!traceId || !action || input.scope !== sceneId) fail('响应日志标识或功能名称无效');
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || end < start || duration !== end - start) fail('响应日志时间戳无效');
  if (!['completed', 'failed', 'cancelled'].includes(String(status))) fail('响应日志状态无效');
  const entry: StoredResponseTiming = {
    traceId, scope: sceneId, action, context, start, end, duration,
    status: status as StoredResponseTiming['status'], recordedAt: new Date().toISOString(),
  };
  appendUnique(responseLogFile(modelRoot), entry);
  return entry;
}
export function readResponseTimings(modelRoot: string) {
  const unique = new Map<string, StoredResponseTiming>();
  for (const row of readJsonLines<StoredResponseTiming>(responseLogFile(modelRoot))) unique.set(row.traceId, row);
  return [...unique.values()].sort((left, right) => right.end - left.end);
}

export function unifiedRoot(modelRoot: string) {
  const root = path.join(modelRoot, 'validation', 'unified');
  fs.mkdirSync(root, { recursive: true });
  return root;
}
export function readRun(modelRoot: string, id: string): HydroRun {
  if (!/^P-[a-f0-9]{32}$/.test(id)) fail('预测编号无效');
  const file = path.join(unifiedRoot(modelRoot), `${id}.json`);
  if (!fs.existsSync(file)) fail('预测记录不存在，请重新选择参考数据', 404);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function saveRun(modelRoot: string, run: HydroRun) {
  const file = path.join(unifiedRoot(modelRoot), `${run.caseId}.json`);
  const temporary = `${file}.${randomUUID()}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(run));
  fs.renameSync(temporary, file);
}
export function referenceRun(state: StoredState, deviceId: string, batchId: string, sceneId:ModelShowcaseSceneId=HYDRO_SCENE) {
  const history = state.records.filter(r => r.device_id === deviceId).sort((a,b) => a.timestamp.localeCompare(b.timestamp));
  // Content identity is independent of unrelated device changes and of repeated imports.
  const operational=getModelOperationalProfile(sceneId);
  const algorithm=`${operational.family}-harmonic-v4:${operational.thresholdModel.version}`;
  const fingerprint = createHash('sha256').update(JSON.stringify({ deviceId, algorithm, history: history.map(r => [r.timestamp, r.quality, r.values]) })).digest('hex');
  return { history, fingerprint, caseId: `P-${fingerprint.slice(0,32)}` };
}
export function makeRun(modelRoot: string, state: StoredState, deviceId: string, batchId: string, sceneId:ModelShowcaseSceneId=HYDRO_SCENE): HydroRun {
  const operational=getModelOperationalProfile(sceneId);
  const reference = referenceRun(state, deviceId, batchId,sceneId);
  if (reference.history.filter(r => r.quality !== 'bad').length < 24) fail('参考数据至少需要 24 条有效历史记录');
  if (forecastTraining(reference.history,operational.sampleIntervalSeconds).records.length < 24) fail('末段连续有效历史不足 24 条，请补充数据或检查采样缺口');
  const target = path.join(unifiedRoot(modelRoot), `${reference.caseId}.json`);
  if (fs.existsSync(target)) return readRun(modelRoot, reference.caseId);
  const prediction = validationPredictionForScene(sceneId,reference.history, true);
  if (!prediction.forecasts.length) fail('当前连续历史不足以形成预测，请检查采样间隔和数据缺口');
  const run: HydroRun = {
    sceneId,caseId: reference.caseId, deviceId, reference: { batchId:'', fingerprint: reference.fingerprint, dataVersion: state.dataVersion },
    observation: { fileName: '设备当前历史', sha256: reference.fingerprint, rowCount: reference.history.length, startAt: reference.history[0].timestamp, endAt: reference.history.at(-1)!.timestamp, uploadedAt: new Date().toISOString() },
    history: reference.history, prediction, status: 'predicted',
  };
  saveRun(modelRoot, run);
  writeSceneLog(modelRoot, predictionLogEntry(run,sceneId));
  return run;
}
export function unifiedSummary(modelRoot: string) {
  const runs: HydroRun[] = fs.readdirSync(unifiedRoot(modelRoot)).filter(n => /^P-[a-f0-9]{32}\.json$/.test(n)).map(n => readRun(modelRoot, n.slice(0,-5)));
  const oldIndex = path.join(modelRoot, 'validation', 'index.json');
  const legacy: any[] = fs.existsSync(oldIndex) ? JSON.parse(fs.readFileSync(oldIndex, 'utf8')).records || [] : [];
  // Keep the latest verified evaluation for identical device/history content across algorithm versions.
  const uniqueVerified = new Map<string,HydroRun>();
  for(const run of runs.filter(r=>r.result && r.coverage===1).sort((a,b)=>a.prediction.generatedAt.localeCompare(b.prediction.generatedAt))) {
    const identity=createHash('sha256').update(JSON.stringify([run.deviceId,run.history.map(r=>[r.timestamp,r.quality,r.values])])).digest('hex');
    uniqueVerified.set(identity,run);
  }
  const verified = [...uniqueVerified.values(), ...legacy.filter(r => r.status === 'verified' && r.result)];
  const statusRuns = verified.filter(r => r.labelKnown !== false);
  const conclusionRuns = statusRuns.filter(r => r.result.actualTag === 'normal' || r.faultKnown !== false);
  const mean = (rows: any[], fn: (r:any)=>number) => rows.length ? rows.reduce((s,r) => s + fn(r),0) / rows.length : null;
  return { predictedCases: runs.length + legacy.length, verifiedCases: verified.length, statusCount: statusRuns.length, conclusionCount: conclusionRuns.length,
    metrics: { statusAccuracy: mean(statusRuns,r=>Number(r.result.statusCorrect)), conclusionAccuracy: mean(conclusionRuns,r=>Number(r.result.conclusionCorrect)), normalizedMae: mean(verified,r=>r.result.normalizedMae), smape: mean(verified,r=>r.result.smape) },
    records: runs.map(r => ({ caseId:r.caseId, deviceId:r.deviceId, fileName:r.observation.fileName, startAt:r.observation.startAt, endAt:r.observation.endAt, generatedAt:r.prediction.generatedAt, coverage:r.coverage || 0 })).sort((a,b)=>b.generatedAt.localeCompare(a.generatedAt)),
    legacyCount: legacy.length,
  };
}

export function checkVerification(modelRoot: string, id: string, deviceId: string, records: DataRecord[], rawRows: Record<string,unknown>[], commit = false, sceneId:ModelShowcaseSceneId=HYDRO_SCENE) {
  const operational=getModelOperationalProfile(sceneId);
  const run = readRun(modelRoot,id);
  if (run.deviceId !== deviceId) fail('验证设备与预测设备不一致');
  const rawDevices = new Set(rawRows.map(r => String(r.device_id ?? r.deviceId ?? '').trim()).filter(Boolean));
  // Explicit assignment to a new device is permitted for historical imports, never silently for validation.
  const originalDevices = new Set(run.history.map(r => String((r as any).source_device_id || r.device_id)));
  if ([...rawDevices].some(d => d !== deviceId && !originalDevices.has(d))) fail('验证文件中的设备 ID 与参考数据不一致');
  const times = new Set(run.prediction.forecasts.map(f=>f.timestamp));
  const incoming = records.filter(r=>r.quality !== 'bad' && times.has(r.timestamp));
  if (!incoming.length) fail('验证数据与当前预测时间区间没有有效重叠');
  const tags = new Set(rawRows.map(r=>String(r.actual_tag || '').trim().toLowerCase()).filter(Boolean).map(t=>t === '正常' ? 'normal' : t === '异常' ? 'abnormal' : t));
  if (tags.size>1 || [...tags].some(t=>!['normal','abnormal'].includes(t))) fail('实际状态标签需一致，且为 normal / abnormal');
  const codes = new Set(rawRows.map(r=>String(r.actual_fault_code || '').trim().toUpperCase()).filter(Boolean));
  const validCodes = operational.faultProfiles.map(fault=>fault.code);
  if (codes.size>1 || [...codes].some(c=>!validCodes.includes(c))) fail('实际故障代码无效或不一致');
  const tag = [...tags][0] as 'normal'|'abnormal'|undefined;
  const code = [...codes][0] as string|undefined;
  if (tag === 'normal' && code) fail('正常状态不能同时标记实际故障');
  if (run.labelKnown && tag && run.result?.actualTag !== tag) fail('补充验证数据的实际标签与已保存标签冲突');
  if (run.faultKnown && code && run.result?.actualFaultCode !== code) fail('补充验证数据的故障类型与已保存结论冲突');
  const merged = new Map<string,DataRecord>((run.result?.actualSeries || []).map(r=>[r.timestamp,{...r,device_id:deviceId,quality:'good',batch_id:'verification'}]));
  incoming.forEach(r=>merged.set(r.timestamp,r));
  const actual = [...merged.values()].sort((a,b)=>a.timestamp.localeCompare(b.timestamp));
  run.coverage = actual.length / times.size;
  run.labelKnown = Boolean(tag || run.labelKnown);
  run.faultKnown = Boolean(code || run.faultKnown || tag === 'normal');
  run.result = compareModelValidation(sceneId,run,actual,tag || run.result?.actualTag || 'normal',code || run.result?.actualFaultCode || null);
  if (!run.labelKnown) { run.result.actualTag=null; run.result.actualFaultName='未提供实际故障信息'; run.result.actualFaultPart='--'; run.result.statusCorrect=null; }
  if (!run.faultKnown || !run.labelKnown) { run.result.faultCorrect=null; run.result.conclusionCorrect=null; }
  run.status = run.coverage === 1 ? 'verified' : 'predicted';
  if (commit) {
    saveRun(modelRoot,run);
    writeSceneLog(modelRoot, verificationLogEntry(run));
  }
  return { run, matched:incoming.length, excluded:records.length-incoming.length };
}

export function registerUnifiedHydroRoutes(app: any, getState:()=>StoredState, getRoot:()=>string, sceneId:ModelShowcaseSceneId=HYDRO_SCENE) {
  const wrap = (fn:Function) => (req:any,res:any) => { try { fn(req,res); } catch(e:any) {res.status(e.status || 500).json({error:{message:e.message}});} };
  const base = `/api/model-showcase/${sceneId}/data/forecast`;
  app.get(`${base}/summary`,wrap((_req:any,res:any)=>res.json(unifiedSummary(getRoot()))));
  app.get(`${base}/logs/scene`,wrap((_req:any,res:any)=>res.json({ entries: readHydroSceneLogs(getRoot(),sceneId) })));
  app.get(`${base}/logs/response`,wrap((_req:any,res:any)=>res.json({ entries: readResponseTimings(getRoot()) })));
  app.post(`${base}/logs/response`,wrap((req:any,res:any)=>res.status(201).json(recordResponseTiming(getRoot(), req.body || {},sceneId))));
  app.get(`${base}/reference`,wrap((req:any,res:any)=>{
    const state = getState(), deviceId = String(req.query.deviceId || ''), batchId = '';
    const ref = referenceRun(state,deviceId,batchId,sceneId);
    const file = path.join(unifiedRoot(getRoot()),`${ref.caseId}.json`);
    res.json({ deviceId,batchId,history:ref.history, record:fs.existsSync(file) ? readRun(getRoot(),ref.caseId) : null });
  }));
  app.post(`${base}/reference`,wrap((req:any,res:any)=>{
    res.json(makeRun(getRoot(),getState(),String(req.body?.deviceId || ''),String(req.body?.batchId || ''),sceneId));
  }));
  app.get(`${base}/runs/:id`,wrap((req:any,res:any)=>res.json(readRun(getRoot(),req.params.id))));
  app.delete(`${base}/runs/:id`,wrap((req:any,res:any)=>{
    const run=readRun(getRoot(),req.params.id);
    fs.unlinkSync(path.join(unifiedRoot(getRoot()),`${run.caseId}.json`));
    const uploads=path.join(unifiedRoot(getRoot()),'uploads');
    if(fs.existsSync(uploads)) for(const file of fs.readdirSync(uploads)) {
      if(file.startsWith(`${run.caseId}-`) && fs.statSync(path.join(uploads,file)).isFile()) fs.unlinkSync(path.join(uploads,file));
    }
    res.json(unifiedSummary(getRoot()));
  }));
}
