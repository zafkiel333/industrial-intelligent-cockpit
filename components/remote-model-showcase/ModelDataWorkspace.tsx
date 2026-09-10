import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Database,
  Download,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Layers3,
  Network,
  RefreshCw,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { apiUrl } from '../../src/integration/apiClient';
import { HydroUnifiedContent } from './HydroUnifiedContent';
import { beginTiming, clearTiming, finishAfterPaint, finishTiming, type TimingTicket } from '../../src/remoteModelShowcase/responseTiming';
import { ResponseTimingStrip } from './ResponseTiming';
import type { ModelShowcaseSceneId } from '../../src/remoteModelShowcase/types';
import { getModelShowcaseConfig } from '../../src/remoteModelShowcase/modelCatalog';

interface BatchSummary {
  batchId: string;
  fileName: string;
  deviceId: string;
  mode: 'replace' | 'append';
  importedAt: string;
  acceptedCount: number;
  rejectedCount: number;
  duplicateCount: number;
  source?: UploadDataSource;
}

interface FieldProfile {
  field: string;
  label: string;
  unit: string;
  normalMin: number;
  normalMax: number;
  decimals?: number;
  part?: string;
}

export interface DataOverview {
  sceneId: ModelShowcaseSceneId;
  dataVersion: string;
  updatedAt: string;
  recordCount: number;
  fieldCount: number;
  deviceCount: number;
  devices: string[];
  timeRange: { startAt: string | null; endAt: string | null };
  quality: { good: number; uncertain: number; bad: number };
  batches: BatchSummary[];
  profile: { fields: FieldProfile[]; forecastLabel: string; sampleIntervalSeconds:number; thresholdModel?:{name:string;version:string} };
}

interface ImportPreview {
  verification?: { matched: number; excluded: number; coverage: number };
  source: UploadDataSource;
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
  impact: { currentDeviceRecords: number; duplicateTimes: number; estimatedDeviceRecords: number; estimatedTotalRecords: number };
  warnings: string[];
}

interface ImportStatus {
  batchId: string;
  focusBatchId?: string;
  source: UploadDataSource;
  uploadedBytes: number;
  sclUploadedBytes: number;
  sclFileSize: number;
  fileSize: number;
  parsedRows: number;
  totalRows: number | null;
  stage: 'uploading' | 'previewing' | 'previewed' | 'importing' | 'completed' | 'failed' | 'cancelled';
  error: string | null;
  preview: ImportPreview | null;
}

interface ConfirmState {
  title: string;
  message: string;
  action: () => Promise<void>;
}

type DownloadKind = 'specification' | 'samples' | 'prediction' | 'report';
type UploadDeviceSource = 'existing' | 'new';
type UploadDataSource = 'standard' | 'modbus' | 'iec61850';

interface SclSummary {
  fileName: string;
  iedCount: number;
  logicalDeviceCount: number;
  dataObjectCount: number;
}

const UPLOAD_SOURCES: Array<{ value: UploadDataSource; label: string; detail: string }> = [
  { value: 'standard', label: '通用表格', detail: '模型字段宽表' },
  { value: 'modbus', label: 'Modbus', detail: '寄存器采集长表' },
  { value: 'iec61850', label: 'IEC 61850', detail: '对象路径采集长表' },
];

const DOWNLOAD_OPTIONS: Record<DownloadKind, { label: string; formats: Array<{ value: string; suffix: string; detail: string }> }> = {
  specification: { label: '数据规范', formats: [{ value: 'pdf', suffix: '.pdf', detail: '适合查看、打印和归档' }, { value: 'docx', suffix: '.docx', detail: 'Word 可编辑文档' }, { value: 'json', suffix: '.json', detail: '系统对接数据文件' }] },
  samples: { label: '数据样例', formats: [{ value: 'csv', suffix: '.csv', detail: '通用表格，可直接导入' }, { value: 'xlsx', suffix: '.xlsx', detail: 'Excel 工作簿，可直接导入' }, { value: 'json', suffix: '.json', detail: '结构化数据，可直接导入' }, { value: 'zip', suffix: '.zip', detail: '包含全部样例格式' }] },
  prediction: { label: '预测结果', formats: [{ value: 'csv', suffix: '.csv', detail: '通用预测结果表格' }, { value: 'xlsx', suffix: '.xlsx', detail: '含预测与诊断工作表' }, { value: 'json', suffix: '.json', detail: '系统对接数据文件' }] },
  report: { label: '分析报告', formats: [{ value: 'pdf', suffix: '.pdf', detail: '适合查看、打印和归档' }, { value: 'docx', suffix: '.docx', detail: 'Word 可编辑报告' }, { value: 'json', suffix: '.json', detail: '系统对接数据文件' }] },
};

const CHUNK_SIZE = 4 * 1024 * 1024;
async function requestJson<T>(pathname: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(pathname), {
    ...init,
    headers: { Accept: 'application/json', ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers },
  });
  const body = await response.json().catch(() => ({})) as { error?: { message?: string }; message?: string } & T;
  if (!response.ok) throw new Error(body.error?.message || body.message || `请求失败（${response.status}）`);
  return body;
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '--';
}

function compactNumber(value: number): string {
  return value.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
}

function fileNamePart(value: string): string {
  return value.trim().replace(/[\\/:*?"<>|]/g, '-');
}

async function inspectSclFile(file: File): Promise<SclSummary> {
  const document = new DOMParser().parseFromString(await file.text(), 'application/xml');
  if (document.getElementsByTagName('parsererror').length) throw new Error('SCL 文件不是有效的 XML 文档');
  const count = (localName: string) => document.getElementsByTagNameNS('*', localName).length || document.getElementsByTagName(localName).length;
  const iedCount = count('IED');
  const logicalDeviceCount = count('LDevice');
  const dataObjectCount = count('DOI') + count('DO');
  if (!iedCount || !logicalDeviceCount) throw new Error('SCL 文件中未识别到 IED 或逻辑设备');
  return { fileName: file.name, iedCount, logicalDeviceCount, dataObjectCount };
}

function putChunk(url: string, blob: Blob, offset: number, onProgress: (loaded: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', apiUrl(url));
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.setRequestHeader('X-Upload-Offset', String(offset));
    xhr.upload.onprogress = (event) => onProgress(event.loaded);
    xhr.onerror = () => reject(new Error('上传连接中断'));
    xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`分块上传失败（${xhr.status}）`));
    xhr.send(blob);
  });
}

export const ModelDataWorkspace: React.FC<{ sceneId: ModelShowcaseSceneId; viewer?: React.ReactNode }> = ({ sceneId, viewer }) => {
  const unified = Boolean(viewer);
  const [batchId, setBatchId] = useState('');
  const [runId, setRunId] = useState('');
  const [revision, setRevision] = useState(0);
  const [purpose, setPurpose] = useState<'history' | 'verification'>('history');
  const [manageOpen, setManageOpen] = useState(false);
  const [overview, setOverview] = useState<DataOverview | null>(null);

  const [deviceId, setDeviceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadSource, setUploadSource] = useState<UploadDataSource>('standard');
  const [sclFile, setSclFile] = useState<File | null>(null);
  const [sclSummary, setSclSummary] = useState<SclSummary | null>(null);
  const [uploadDeviceId, setUploadDeviceId] = useState('');
  const [uploadDeviceSource, setUploadDeviceSource] = useState<UploadDeviceSource>('existing');
  const [mode, setMode] = useState<'replace' | 'append'>('append');
  const [conflictPolicy, setConflictPolicy] = useState<'keep-existing' | 'replace-existing' | 'reject'>('keep-existing');
  const [task, setTask] = useState<ImportStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [downloadChoice, setDownloadChoice] = useState<{ kind: DownloadKind; format: string; deviceId: string; source: UploadDataSource } | null>(null);
  const pollRef = useRef<number | null>(null);
  const previewTiming=useRef<TimingTicket>(null);
  const commitTiming=useRef<TimingTicket>(null);
  const sclReadGeneration=useRef(0);
  useLayoutEffect(()=>{
    if(task?.stage==='previewed')return finishAfterPaint(previewTiming.current,()=>Boolean(document.querySelector('.model-data-import-preview')));
  },[task?.stage]);

  const load = useCallback(async (selectedDevice = deviceId) => {
    setLoading(true);
    setError(null);
    try {
      const nextOverview = await requestJson<DataOverview>(`model-showcase/${sceneId}/data/overview`);
      setOverview(nextOverview);
      if (unified && (!selectedDevice || !nextOverview.devices.includes(selectedDevice))) {
        setDeviceId(nextOverview.devices[0] || ''); setBatchId(''); setRunId('');
      } else if (selectedDevice && !nextOverview.devices.includes(selectedDevice)) setDeviceId('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '数据加载失败');
    } finally {
      setLoading(false);
    }
  }, [deviceId, sceneId]);

  useEffect(() => { void load(deviceId); }, [deviceId, sceneId]);
  useEffect(() => () => { if (pollRef.current) window.clearTimeout(pollRef.current); }, []);
  useEffect(() => {
    if (!unified) return;
    const focus = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail?.sceneId !== sceneId) return;
      beginTiming(sceneId,'设备数据读取',detail.deviceId || '');
      setDeviceId(detail.deviceId || ''); setBatchId(''); setRunId(''); setManageOpen(false);
    };
    window.addEventListener('model-data-focus',focus);
    return () => window.removeEventListener('model-data-focus',focus);
  },[unified,sceneId]);

  const pollTask = useCallback(async (batchId: string) => {
    try {
      const status = await requestJson<ImportStatus>(`model-showcase/${sceneId}/data/imports/${batchId}`);
      setTask(status);
      if (status.stage === 'completed') {
        setBusy(false);
        setUploadOpen(false);
        setFile(null);
        if (unified && purpose === 'verification') { setRevision(v=>v+1); return; }
        await load(uploadDeviceId);
        setDeviceId(uploadDeviceId);
        const focusBatchId = status.focusBatchId ?? batchId;
        if (unified) { setBatchId(''); setRunId(''); setRevision(v=>v+1); }
        window.dispatchEvent(new CustomEvent('model-data-changed', { detail: { sceneId, deviceId: uploadDeviceId, batchId: focusBatchId } }));
        return;
      }
      if (status.stage === 'failed' || status.stage === 'cancelled') {
        setBusy(false);
        setError(status.error || '文件处理未完成');
        finishAfterPaint(commitTiming.current,undefined,status.stage==='cancelled'?'cancelled':'failed');
        return;
      }
      pollRef.current = window.setTimeout(() => void pollTask(batchId), 500);
    } catch (pollError) {
      setBusy(false);
      setError(pollError instanceof Error ? pollError.message : '读取解析状态失败');
      finishAfterPaint(commitTiming.current,undefined,'failed');
    }
  }, [deviceId, load, sceneId, uploadDeviceId, unified, purpose]);

  const cancelUploadTask = async (currentTask = task) => {
    finishTiming(previewTiming.current,'cancelled');
    if (currentTask && !['completed', 'cancelled'].includes(currentTask.stage)) {
      try {
        await requestJson(`model-showcase/${sceneId}/data/imports/${currentTask.batchId}`, { method: 'DELETE' });
      } catch {
        // A completed or expired task no longer needs temporary-file cleanup.
      }
    }
    setTask(null);
  };

  const prepareImportPreview = async (selectedFile = file) => {
    if (!selectedFile || !uploadDeviceId.trim()) return;
    previewTiming.current=beginTiming(sceneId,'文件上传与解析',uploadDeviceId);
    const file=selectedFile;
    setBusy(true);
    setError(null);
    let activeBatchId: string | null = null;
    try {
      const created = await requestJson<ImportStatus>(`model-showcase/${sceneId}/data/imports`, {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, fileSize: file.size, deviceId: uploadDeviceId.trim(), deviceSource: uploadDeviceSource, source: uploadSource, mode, conflictPolicy, sclFileName: sclFile?.name, sclFileSize: sclFile?.size, verificationCaseId: unified && purpose === 'verification' ? runId : undefined }),
      });
      activeBatchId = created.batchId;
      setTask(created);
      let offset = created.uploadedBytes || 0;
      let index = Math.floor(offset / CHUNK_SIZE);
      while (offset < file.size) {
        const end = Math.min(file.size, offset + CHUNK_SIZE);
        const baseOffset = offset;
        await putChunk(`model-showcase/${sceneId}/data/imports/${created.batchId}/chunks/${index}`, file.slice(offset, end), offset, (loaded) => setTask((current) => current ? { ...current, uploadedBytes: baseOffset + loaded } : current));
        offset = end;
        index += 1;
        setTask((current) => current ? { ...current, uploadedBytes: offset } : current);
      }
      if (sclFile) {
        let sclOffset = created.sclUploadedBytes || 0;
        let sclIndex = Math.floor(sclOffset / CHUNK_SIZE);
        while (sclOffset < sclFile.size) {
          const end = Math.min(sclFile.size, sclOffset + CHUNK_SIZE);
          const baseOffset = sclOffset;
          await putChunk(`model-showcase/${sceneId}/data/imports/${created.batchId}/scl/chunks/${sclIndex}`, sclFile.slice(sclOffset, end), sclOffset, (loaded) => setTask((current) => current ? { ...current, sclUploadedBytes: baseOffset + loaded } : current));
          sclOffset = end;
          sclIndex += 1;
          setTask((current) => current ? { ...current, sclUploadedBytes: sclOffset } : current);
        }
      }
      setTask((current) => current ? { ...current, stage: 'previewing' } : current);
      const previewed = await requestJson<ImportStatus>(`model-showcase/${sceneId}/data/imports/${created.batchId}/preview`, { method: 'POST', body: '{}' });
      setTask(previewed);
      setBusy(false);
    } catch (uploadError) {
      if (activeBatchId) {
        try {
          const status = await requestJson<ImportStatus>(`model-showcase/${sceneId}/data/imports/${activeBatchId}`);
          if (!['completed', 'cancelled'].includes(status.stage)) {
            await requestJson(`model-showcase/${sceneId}/data/imports/${activeBatchId}`, { method: 'DELETE' });
          }
        } catch {
          // Keep the original upload error; startup cleanup handles an unreachable abandoned task.
        }
      }
      setBusy(false);
      setError(uploadError instanceof Error ? uploadError.message : '文件预检失败');
      finishAfterPaint(previewTiming.current,undefined,'failed');
    }
  };

  const commitImport = async () => {
    if (!task || task.stage !== 'previewed') return;
    if(purpose==='history'){clearTiming(sceneId,'预测结果生成');clearTiming(sceneId,'验证结果展示');}
    commitTiming.current=beginTiming(sceneId,purpose==='verification'?'验证结果展示':'历史入库',purpose==='verification'?runId:uploadDeviceId);
    setBusy(true);
    setError(null);
    try {
      await requestJson(`model-showcase/${sceneId}/data/imports/${task.batchId}/complete`, { method: 'POST', body: '{}' });
      setTask((current) => current ? { ...current, stage: 'importing' } : current);
      await pollTask(task.batchId);
    } catch (importError) {
      setBusy(false);
      setError(importError instanceof Error ? importError.message : '确认导入失败');
      finishAfterPaint(commitTiming.current,undefined,'failed');
    }
  };

  const mutation = async (pathname: string, method: 'POST' | 'DELETE') => {
    setBusy(true);
    setError(null);
    try {
      await requestJson(pathname, { method, ...(method === 'POST' ? { body: '{}' } : {}) });
      setConfirm(null);
      await load('');
      setDeviceId('');
      setBatchId(''); setRunId(''); setRevision(v=>v+1);
      window.dispatchEvent(new CustomEvent('model-data-changed', { detail: { sceneId, batchId: '' } }));
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : '操作失败');
    } finally {
      setBusy(false);
    }
  };

  const startUpload = () => {
    const normalizedDeviceId = uploadDeviceId.trim();
    const deviceExists = overview?.devices.includes(normalizedDeviceId) || false;
    if (uploadDeviceSource === 'existing' && !deviceExists) {
      setError('请选择已有设备后再上传数据。');
      return;
    }
    if (uploadDeviceSource === 'new' && deviceExists) {
      setError('该设备 ID 已存在，请切换到“已有设备”并从下拉框选择。');
      return;
    }
    if (task?.stage !== 'previewed') {
      void prepareImportPreview();
      return;
    }
    if (mode === 'replace' && overview?.devices.includes(uploadDeviceId.trim())) {
      setConfirm({ title: '确认覆盖设备数据', message: `预检已完成。将以 ${task.preview?.validRecordCount || 0} 条记录替换设备 ${uploadDeviceId} 的现有数据；其他设备不受影响。`, action: async () => { setConfirm(null); await commitImport(); } });
    } else {
      void commitImport();
    }
  };

  const closeUpload = async () => {
    if (busy) return;
    sclReadGeneration.current++;
    await cancelUploadTask();
    setUploadOpen(false);
    setFile(null);
    setSclFile(null);
    setSclSummary(null);
    setError(null);
  };

  const resetUploadSelection = async () => {
    sclReadGeneration.current++;
    await cancelUploadTask();
    clearTiming(sceneId,'文件上传与解析');clearTiming(sceneId,'SCL 解析');
    setFile(null);
    setSclFile(null);
    setSclSummary(null);
    setError(null);
  };

  const changeUploadSource = (source: UploadDataSource) => {
    sclReadGeneration.current++;
    clearTiming(sceneId,'文件上传与解析');clearTiming(sceneId,'SCL 解析');
    setUploadSource(source);
    setFile(null);
    setTask(null);
    setError(null);
    if (source !== 'iec61850') {
      setSclFile(null);
      setSclSummary(null);
    }
  };

  const selectSclFile = async (nextFile: File | null) => {
    const generation=++sclReadGeneration.current;
    setSclFile(nextFile);
    setSclSummary(null);
    if (!nextFile) return;
    const timing=beginTiming(sceneId,'SCL 解析');
    try {
      const summary=await inspectSclFile(nextFile);
      if(generation!==sclReadGeneration.current)return;
      setSclSummary(summary);
      finishAfterPaint(timing,()=>Boolean(document.querySelector('.model-data-scl-summary')));
    } catch (sclError) {
      if(generation!==sclReadGeneration.current)return;
      setSclFile(null);
      setError(sclError instanceof Error ? sclError.message : 'SCL 文件检查失败');
      finishAfterPaint(timing,undefined,'failed');
    }
  };

  const downloadUploadSample = () => {
    const format = file?.name.toLowerCase().endsWith('.json') ? 'json' : file?.name.toLowerCase().endsWith('.csv') ? 'csv' : 'xlsx';
    const query = new URLSearchParams({ format, deviceId: uploadDeviceId.trim() || `${modelIdentity.modelId}-01`, source: uploadSource });
    void prepareDownload(`model-showcase/${sceneId}/downloads/samples?${query.toString()}`,'样例文件准备');
  };

  const openUpload = (intent: 'history' | 'verification' = 'history') => {
    sclReadGeneration.current++;
    clearTiming(sceneId,'文件上传与解析');clearTiming(sceneId,'SCL 解析');
    setPurpose(intent);
    const preferredDevice = deviceId && overview?.devices.includes(deviceId) ? deviceId : overview?.devices[0] || '';
    setUploadDeviceSource(preferredDevice ? 'existing' : 'new');
    setUploadDeviceId(preferredDevice);
    setMode('append');
    setUploadSource('standard');
    setFile(null);
    setSclFile(null);
    setSclSummary(null);
    setTask(null);
    setError(null);
    setUploadOpen(true);
  };

  const openDownload = (kind: DownloadKind) => {
    setDownloadChoice({ kind, format: DOWNLOAD_OPTIONS[kind].formats[0].value, deviceId: deviceId || overview?.devices[0] || '', source: 'standard' });
  };

  const prepareDownload = async (pathname:string,action='下载文件准备') => {
    const timing=beginTiming(sceneId,action);
    setError(null);
    try {
      const response=await fetch(apiUrl(pathname));
      if(!response.ok)throw new Error('文件准备失败，请重试');
      const blob=await response.blob();
      const name=response.headers.get('content-disposition')?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
      const objectUrl=URL.createObjectURL(blob),anchor=document.createElement('a');
      anchor.href=objectUrl;anchor.download=name?decodeURIComponent(name):'模型数据文件';
      anchor.click();window.setTimeout(()=>URL.revokeObjectURL(objectUrl),30000);
      finishAfterPaint(timing);
    } catch(e){setError(e instanceof Error?e.message:'文件准备失败');finishAfterPaint(timing,undefined,'failed');}
  };
  const download = () => {
    if (!downloadChoice?.deviceId.trim()) return;
    const query = new URLSearchParams({ format: downloadChoice.format, deviceId: downloadChoice.deviceId.trim() });
    if (unified && ['prediction','report'].includes(downloadChoice.kind)) query.set('runId',runId);
    if (downloadChoice.kind === 'samples') query.set('source', downloadChoice.source);
    void prepareDownload(`model-showcase/${sceneId}/downloads/${downloadChoice.kind}?${query.toString()}`);
    setDownloadChoice(null);
  };

  const uploadPercent = task?.fileSize ? Math.min(100, Math.round(task.uploadedBytes / task.fileSize * 100)) : 0;
  const parsePercent = task && ['previewed', 'importing', 'completed'].includes(task.stage) ? 100 : task?.stage === 'previewing' ? 45 : 0;
  const previewReady = task?.stage === 'previewed' && Boolean(task.preview);
  const selectedDownloadFormat = downloadChoice ? DOWNLOAD_OPTIONS[downloadChoice.kind].formats.find((item) => item.value === downloadChoice.format) : null;
  const modelConfig = getModelShowcaseConfig(sceneId);
  const modelIdentity = { modelId: String(modelConfig?.modelId || sceneId), title: modelConfig?.title || '设备数据分析' };
  const sampleSourceLabel = downloadChoice?.source === 'modbus' ? 'Modbus数据样例' : downloadChoice?.source === 'iec61850' ? 'IEC61850数据样例' : '数据样例';
  const downloadLabel = downloadChoice?.kind === 'samples' ? `${sampleSourceLabel}${downloadChoice.format === 'zip' ? '-全格式' : ''}` : downloadChoice ? DOWNLOAD_OPTIONS[downloadChoice.kind].label : '';
  const downloadFileName = downloadChoice && selectedDownloadFormat
    ? `${modelIdentity.modelId}-${modelIdentity.title}-设备ID-${fileNamePart(downloadChoice.deviceId) || '待填写'}-${downloadLabel}${selectedDownloadFormat.suffix}`
    : '';
  const uploadDeviceExists = overview?.devices.includes(uploadDeviceId.trim()) || false;
  const uploadDeviceError = uploadDeviceSource === 'new' && uploadDeviceId.trim() && uploadDeviceExists
    ? '该设备 ID 已存在，请使用“已有设备”选择。'
    : '';
  const batchSourceLabel = (source?: UploadDataSource) => source === 'modbus' ? 'Modbus' : source === 'iec61850' ? 'IEC 61850' : '通用表格';
  const metricItems = [
    { label: '记录总量', value: compactNumber(overview?.recordCount || 0), icon: Database, tone: 'blue' },
    { label: '设备数量', value: compactNumber(overview?.deviceCount || 0), icon: Activity, tone: 'cyan' },
    { label: '字段数量', value: compactNumber(overview?.fieldCount || 0), icon: Layers3, tone: 'violet' },
    { label: '有效数据', value: compactNumber(overview?.quality.good || 0), icon: CheckCircle2, tone: 'green' },
    { label: '待核数据', value: compactNumber(overview?.quality.uncertain || 0), icon: Clock3, tone: 'amber' },
    { label: '无效数据', value: compactNumber(overview?.quality.bad || 0), icon: CircleAlert, tone: 'red' },
  ];

  return (
    <section className="model-data-workspace mb-4" aria-label="模型数据管理">
      <header className="model-data-header">
        <div className="model-data-heading">
          <span className="model-data-heading-icon"><BarChart3 size={19} /></span>
          <div>
            <div className="model-data-heading-title">
              <h2>{unified ? `${modelConfig?.expectedRemoteName || '设备'}运行分析与预测核验` : '数据与文件管理'}</h2>
              <span className="model-data-live-badge"><span />{loading ? '读取中' : error ? '读取异常' : '已入库数据'}</span>
            </div>
            <div className="model-data-version">数据版本 <b>{overview?.dataVersion.slice(0, 8) || '--'}</b><i />最后更新 {formatDate(overview?.updatedAt || null)}</div>
          </div>
        </div>
        <div className="model-data-actions">
          <button type="button" onClick={() => openDownload('specification')} className="model-data-action"><FileText size={15} /><span>数据规范</span></button>
          <button type="button" onClick={() => openDownload('samples')} className="model-data-action"><Download size={15} /><span>数据样例</span></button>
          <button type="button" disabled={unified ? !runId : !overview?.recordCount} onClick={() => openDownload('prediction')} className="model-data-action"><FileSpreadsheet size={15} /><span>预测结果</span></button>
          <button type="button" disabled={unified ? !runId : !overview?.recordCount} onClick={() => openDownload('report')} className="model-data-action"><FileText size={15} /><span>分析报告</span></button>
          {unified && <button type="button" onClick={()=>setManageOpen(true)} className="model-data-action"><Database size={15}/>数据管理</button>}
          <button type="button" onClick={()=>openUpload('history')} className="model-data-action model-data-action-primary"><Upload size={15} /><span>{unified ? '导入历史数据' : '上传数据'}</span></button>
          {unified && <button type="button" disabled={!runId || busy} title={runId ? '对照当前已保存预测' : '请先生成预测'} onClick={()=>openUpload('verification')} className="model-data-action hydro-verify-action"><CheckCircle2 size={15}/>导入验证数据</button>}
        </div>
      </header>

      {unified && <ResponseTimingStrip scope={sceneId} action="下载文件准备"/>}

      {error && <div className="model-data-error" role="alert"><CircleAlert size={15} />{error}</div>}

      {unified && <HydroUnifiedContent viewer={viewer} overview={overview} deviceId={deviceId} batchId="" revision={revision} onRun={setRunId} onSelect={(device)=>{setDeviceId(device);setBatchId('');setRunId('');}} />}

      {(!unified || manageOpen) && <div className={unified ? 'model-data-modal-overlay' : undefined} role={unified ? 'dialog' : undefined} aria-modal={unified ? true : undefined} aria-label={unified ? '管理已存数据' : undefined}><div className={unified ? 'model-data-modal hydro-manager' : undefined}>
      {unified && <div className="model-data-modal-header"><h2>管理已存数据</h2><button type="button" className="model-data-modal-close" aria-label="关闭数据管理" onClick={()=>setManageOpen(false)}><X/></button></div>}
      <details className="model-data-storage-summary"><summary>全模型存储概况</summary>
      <div className="model-data-metrics">
        {metricItems.map((item) => {
          const Icon = item.icon;
          return <div key={item.label} className="model-data-metric"><span className={`model-data-metric-icon is-${item.tone}`}><Icon size={16} /></span><div><div className="model-data-metric-label">{item.label}</div><div className="model-data-metric-value">{item.value}</div></div></div>;
        })}
      </div>

      </details>

      <section className="model-data-batches">
        <div className="model-data-batches-header">
          <div className="model-data-panel-title"><FileArchive size={16} /><div><h3>数据批次记录</h3><p>{overview?.batches.length || 0} 个批次 · 按传入时间倒序</p></div></div>
          <div className="model-data-batch-tools">{deviceId && <button type="button" disabled={busy} className="model-data-icon-button is-danger" title="删除当前设备" onClick={() => setConfirm({ title: '确认删除设备数据', message: `将删除设备 ${deviceId} 的全部记录和批次。`, action: () => mutation(`model-showcase/${sceneId}/data?scope=device&target=${encodeURIComponent(deviceId)}`, 'DELETE') })}><Trash2 size={14} /></button>}
            <button type="button" disabled={busy} onClick={() => setConfirm({ title: '确认重置数据', message: `将清除当前 ${overview?.recordCount || 0} 条记录，并恢复本模型的初始数据。`, action: () => mutation(`model-showcase/${sceneId}/data/reset`, 'POST') })} className="model-data-icon-button is-warning" title="重置数据"><RotateCcw size={14} /></button>
            <button type="button" disabled={busy || !overview?.recordCount} onClick={() => setConfirm({ title: '确认删除全部数据', message: `将删除当前 ${overview?.recordCount || 0} 条记录和批次；规范与样例仍可下载。`, action: () => mutation(`model-showcase/${sceneId}/data?scope=all`, 'DELETE') })} className="model-data-icon-button is-danger" title="删除全部数据"><Trash2 size={14} /></button>
          </div>
        </div>
        <div className="model-data-table-wrap">
          <table className="model-data-table">
            <thead><tr><th>传入时间</th><th>文件</th><th>数据来源</th><th>设备 ID</th><th>传入方式</th><th>有效 / 拒绝 / 冲突</th><th><span className="sr-only">操作</span></th></tr></thead>
            <tbody>{overview?.batches.map((batch) => <tr key={batch.batchId}><td>{formatDate(batch.importedAt)}</td><td className="model-data-file-cell" title={batch.fileName}>{batch.fileName}</td><td><span className={`model-data-source-tag is-${batch.source || 'standard'}`}>{batchSourceLabel(batch.source)}</span></td><td><code>{batch.deviceId}</code></td><td><span className={`model-data-mode is-${batch.mode}`}>{batch.mode === 'replace' ? '覆盖' : '增加'}</span></td><td><span className="is-valid">{batch.acceptedCount}</span> / <span className="is-rejected">{batch.rejectedCount}</span> / {batch.duplicateCount}</td><td><button type="button" disabled={batch.acceptedCount === 0} className="model-data-button inspection-batch-open" onClick={() => { setDeviceId(batch.deviceId); window.dispatchEvent(new CustomEvent('model-data-focus', { detail: { sceneId, deviceId: batch.deviceId, batchId: batch.batchId } })); }}>分析</button><button type="button" disabled={busy} onClick={() => setConfirm({ title: '确认删除批次', message: `将删除文件“${batch.fileName}”对应的 ${batch.acceptedCount} 条记录，并重新计算预测与诊断。`, action: () => mutation(`model-showcase/${sceneId}/data?scope=batch&target=${encodeURIComponent(batch.batchId)}`, 'DELETE') })} className="model-data-icon-button is-danger" title="删除批次"><Trash2 size={13} /></button></td></tr>)}</tbody>
          </table>
          {!overview?.batches.length && <div className="model-data-empty model-data-table-empty">暂无批次</div>}
        </div>
      </section>
      </div></div>}

      {uploadOpen && <div className="model-data-modal-overlay" role="dialog" aria-modal="true" aria-label={unified ? purpose === 'verification' ? '导入验证数据' : '导入历史数据' : '上传设备数据'}>
        <div className="model-data-modal model-data-upload-modal">
          <div className="model-data-modal-header"><div className="model-data-modal-heading"><span><Upload size={18} /></span><div><h2>{unified ? purpose === 'verification' ? '导入验证数据' : '导入历史数据' : '上传设备数据'}</h2><p>{unified ? purpose === 'verification' ? '对照当前已保存预测；验证不会重新拟合预测' : '更新所选设备的历史记录，用于展示和下一次预测' : '协议文件预检通过后进入统一分析链路'}</p></div></div><button type="button" disabled={busy} onClick={() => void closeUpload()} className="model-data-modal-close" title="关闭"><X size={18} /></button></div>
          <div className="model-data-modal-body">
            {error && <div className="model-data-error" role="alert"><CircleAlert size={15} />{error}</div>}
            {unified && purpose === 'verification' && <div className="hydro-import-summary"><strong>核验设备：{deviceId}</strong><p>后续实测与已保存预测按时间对齐，不修改设备历史。补充文件合并到本次核验，同一时间点采用本次有效实测值。</p><p>状态核验需 actual_tag；故障类型核验需 actual_fault_code。</p></div>}
            <div className="model-data-field"><span>数据来源</span><div className="model-data-source-options" role="radiogroup" aria-label="数据来源">{UPLOAD_SOURCES.map((source) => <button key={source.value} type="button" role="radio" aria-checked={uploadSource === source.value} data-source={source.value} disabled={busy || previewReady} onClick={() => changeUploadSource(source.value)} className={uploadSource === source.value ? 'is-selected' : ''}><Network size={15} /><span>{source.label}</span><small>{source.detail}</small></button>)}</div></div>
            {!(unified && purpose === 'verification') && <fieldset className="hydro-import-target">
            <div className="model-data-field"><span>目标设备</span><div className="model-data-segmented model-data-device-source"><button type="button" disabled={busy || previewReady || !overview?.devices.length} onClick={() => { setUploadDeviceSource('existing'); setUploadDeviceId(deviceId && overview?.devices.includes(deviceId) ? deviceId : overview?.devices[0] || ''); }} className={uploadDeviceSource === 'existing' ? 'is-active' : ''}>已有设备</button><button type="button" disabled={busy || previewReady} onClick={() => { setUploadDeviceSource('new'); setUploadDeviceId(''); setMode('append'); setError(null); }} className={uploadDeviceSource === 'new' ? 'is-active' : ''}>新增设备</button></div></div>
            {uploadDeviceSource === 'existing'
              ? <label className="model-data-field"><span>选择已有设备</span><select value={uploadDeviceId} disabled={busy || previewReady} onChange={(event) => setUploadDeviceId(event.target.value)} aria-label="上传已有设备">{overview?.devices.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              : <label className={`model-data-field ${uploadDeviceError ? 'has-error' : ''}`}><span>新设备 ID</span><input value={uploadDeviceId} disabled={busy || previewReady} onChange={(event) => setUploadDeviceId(event.target.value)} placeholder={`例如 ${modelIdentity.modelId}-NEW-01`} aria-invalid={Boolean(uploadDeviceError)} />{uploadDeviceError && <small className="model-data-field-error" role="alert">{uploadDeviceError}</small>}</label>}
            </fieldset>}
            {!(unified && purpose === 'verification') && <div className="model-data-field"><span>传入方式</span><div className="model-data-segmented"><button type="button" disabled={busy || previewReady} onClick={() => setMode('append')} className={mode === 'append' ? 'is-active' : ''}>{uploadDeviceSource === 'new' ? '建立该设备历史' : '追加到现有历史'}</button><button type="button" disabled={busy || previewReady || uploadDeviceSource === 'new'} onClick={() => setMode('replace')} className={mode === 'replace' ? 'is-active' : ''}>替换该设备全部历史</button></div></div>}
            {unified && purpose === 'history' && <p className="hydro-import-note">{uploadDeviceSource === 'new' ? "以新设备 ID 建立独立历史。" : mode === 'replace' ? "用本文件替换该设备全部历史；已保存预测与核验记录保留。" : "向当前设备历史追加数据；重复时间按下方规则处理。"}导入后页面使用更新后的唯一历史。</p>}
            {!(unified && purpose === 'verification') && mode === 'append' && uploadDeviceSource === 'existing' && <label className="model-data-field"><span>重复时间处理</span><select value={conflictPolicy} disabled={busy || previewReady} onChange={(event) => setConflictPolicy(event.target.value as typeof conflictPolicy)}><option value="keep-existing">保留已有记录</option><option value="replace-existing">使用新记录</option><option value="reject">发现冲突即取消</option></select></label>}
            {uploadSource === 'iec61850' && <label className="model-data-field"><span>SCL 点位模型（可选，确认导入后永久保存）</span><input type="file" accept=".icd,.cid,.scd,.ssd,.xml" disabled={busy || previewReady} onChange={(event) => void selectSclFile(event.target.files?.[0] || null)} className="model-data-file-input" />{sclSummary && <small className="model-data-scl-summary"><CheckCircle2 size={13} />{sclSummary.fileName} · {sclSummary.iedCount} 个 IED · {sclSummary.logicalDeviceCount} 个逻辑设备 · {sclSummary.dataObjectCount} 个数据对象 · 将保存到当前模型目录</small>}</label>}
            {unified && uploadSource === 'iec61850' && <small className="model-data-scl-summary">如需附带 SCL，请先选择 SCL，再选择运行数据文件。</small>}
            <div className="model-data-file-row"><label className="model-data-field"><span>{uploadSource === 'standard' ? (unified ? purpose === 'verification' ? '后续实测文件' : '历史运行数据文件' : '模型数据文件') : `${UPLOAD_SOURCES.find((item) => item.value === uploadSource)?.label} 运行数据文件`}</span><input type="file" accept=".csv,.xlsx,.json" disabled={busy || previewReady || (unified && (!uploadDeviceId.trim() || Boolean(uploadDeviceError)))} onChange={(event) => { const selected=event.target.files?.[0] || null; setFile(selected); setTask(null); setError(null); if(unified && selected)void prepareImportPreview(selected); }} className="model-data-file-input" /></label>{!(unified && purpose === 'verification') && <button type="button" disabled={busy || previewReady || !uploadDeviceId.trim()} onClick={downloadUploadSample} className="model-data-sample-button"><Download size={14} />下载当前来源样例</button>}</div>
            {unified && <ResponseTimingStrip scope={sceneId} action="SCL 解析"/>}
            {task && <div className="model-data-progress-group"><Progress label="上传数据" value={uploadPercent} detail={`${compactNumber(task.uploadedBytes)} / ${compactNumber(task.fileSize)} 字节${task.sclFileSize ? ` · SCL ${compactNumber(task.sclUploadedBytes)} / ${compactNumber(task.sclFileSize)} 字节` : ''}`} /><Progress label="解析、校验与映射" value={parsePercent} detail={task.stage === 'failed' ? task.error || '处理失败' : task.stage === 'previewing' ? '正在识别固定字段、时间、点位、数值和质量' : task.stage === 'previewed' ? `${task.preview?.sourceRowCount || 0} 行已完成预检` : task.stage === 'importing' ? (purpose === 'verification' ? '正在对照原预测并保存核验结果' : '正在更新设备历史，完成后可生成预测') : task.stage === 'completed' ? '导入完成' : '等待文件上传完成'} /></div>}
            {unified && <ResponseTimingStrip scope={sceneId} action="文件上传与解析"/>}
            {task?.preview && <ImportPreviewPanel preview={task.preview} />}
            {unified && <ResponseTimingStrip scope={sceneId} action="样例文件准备"/>}
          </div>
          <div className="model-data-modal-footer">{previewReady && <button type="button" disabled={busy} onClick={() => void resetUploadSelection()} className="model-data-button">重新选择</button>}<button type="button" disabled={busy} onClick={() => void closeUpload()} className="model-data-button">取消</button><button type="button" disabled={busy || !file || !uploadDeviceId.trim() || Boolean(uploadDeviceError)} onClick={startUpload} className="model-data-button is-primary"><Upload size={14} />{busy ? (task?.stage === 'importing' ? '正在导入' : '正在预检') : previewReady ? '确认导入' : '解析并预览'}</button></div>
        </div>
      </div>}

      {downloadChoice && <div className="model-data-modal-overlay" role="dialog" aria-modal="true" aria-label={`下载${DOWNLOAD_OPTIONS[downloadChoice.kind].label}`}>
        <div className="model-data-modal model-data-download-modal">
          <div className="model-data-modal-header"><div className="model-data-modal-heading"><span><Download size={18} /></span><div><h2>下载{DOWNLOAD_OPTIONS[downloadChoice.kind].label}</h2><p>选择设备与导出格式</p></div></div><button type="button" onClick={() => setDownloadChoice(null)} className="model-data-modal-close" title="关闭"><X size={18} /></button></div>
          <div className="model-data-modal-body">
            <label className="model-data-field"><span>设备 ID</span><input required readOnly={unified && ['prediction','report'].includes(downloadChoice.kind)} list={`download-devices-${sceneId}`} value={downloadChoice.deviceId} onChange={(event) => setDownloadChoice({ ...downloadChoice, deviceId: event.target.value })} aria-label="下载设备 ID" /><datalist id={`download-devices-${sceneId}`}>{overview?.devices.map((item) => <option key={item} value={item} />)}</datalist></label>
            {downloadChoice.kind === 'samples' && <div className="model-data-field"><span>样例来源</span><div className="model-data-source-options" role="radiogroup" aria-label="样例来源">{UPLOAD_SOURCES.map((source) => <button key={source.value} type="button" role="radio" aria-checked={downloadChoice.source === source.value} data-source={source.value} onClick={() => setDownloadChoice({ ...downloadChoice, source: source.value })} className={downloadChoice.source === source.value ? 'is-selected' : ''}><Network size={15} /><span>{source.label}</span><small>{source.detail}</small></button>)}</div></div>}
            {unified && downloadChoice.kind === 'samples' && <button type="button" className="model-data-button" onClick={()=>{void prepareDownload(`model-showcase/${sceneId}/data/validation/datasets?${new URLSearchParams({deviceId:downloadChoice.deviceId || `${modelIdentity.modelId}-01`})}`);setDownloadChoice(null);}}>下载历史与后续实测成对样例（.zip）</button>}
            <div className="model-data-field"><span>文件格式</span><div className="model-data-format-grid" role="radiogroup" aria-label="文件格式">{DOWNLOAD_OPTIONS[downloadChoice.kind].formats.map((format) => { const selected = downloadChoice.format === format.value; return <button key={format.value} type="button" role="radio" aria-checked={selected} data-format={format.value} className={`model-data-format-option ${selected ? 'is-selected' : ''}`} onClick={() => setDownloadChoice({ ...downloadChoice, format: format.value })}><span className="model-data-format-suffix">{format.suffix}</span><span className="model-data-format-detail">{format.detail}</span>{selected && <CheckCircle2 size={17} />}</button>; })}</div></div>
            <div className="model-data-file-preview"><span>文件名预览</span><code>{downloadFileName}</code></div>
          </div>
          <div className="model-data-modal-footer"><button type="button" autoFocus onClick={() => setDownloadChoice(null)} className="model-data-button">取消</button><button type="button" disabled={!downloadChoice.deviceId.trim()} onClick={download} className="model-data-button is-primary"><Download size={14} />下载</button></div>
        </div>
      </div>}

      {confirm && <div className="model-data-modal-overlay" role="alertdialog" aria-modal="true">
        <div className="model-data-modal model-data-confirm-modal">
          <div className="model-data-confirm-content"><span><CircleAlert size={20} /></span><div><h2>{confirm.title}</h2><p>{confirm.message}</p></div></div>
          <div className="model-data-modal-footer"><button type="button" autoFocus disabled={busy} onClick={() => setConfirm(null)} className="model-data-button">取消</button><button type="button" disabled={busy} onClick={() => void confirm.action()} className="model-data-button is-danger">确认</button></div>
        </div>
      </div>}
    </section>
  );
};

const ImportPreviewPanel: React.FC<{ preview: ImportPreview }> = ({ preview }) => (
  <section className="model-data-import-preview" aria-label="导入预检结果">
    <div className="model-data-import-preview-header"><div><CheckCircle2 size={16} /><span>{preview.verification ? '验证数据预检通过' : '历史数据预检通过'}</span></div><small>{preview.sourceLabel} · {preview.fileFormat.toUpperCase()}</small></div>
    <div className="model-data-preview-metrics">
      <div><span>源文件行数</span><b>{compactNumber(preview.sourceRowCount)}</b></div>
      <div><span>完整时间记录</span><b>{compactNumber(preview.validRecordCount)}</b></div>
      <div><span>点位映射</span><b>{preview.mappedPointCount}/{preview.requiredPointCount}</b></div>
      <div><span>{preview.verification ? '核验时间覆盖率' : '导入后设备记录'}</span><b>{preview.verification ? `${(preview.verification.coverage*100).toFixed(1)}%` : compactNumber(preview.impact.estimatedDeviceRecords)}</b></div>
    </div>
    <div className="model-data-preview-time"><Clock3 size={13} /><span>{formatDate(preview.timeRange.startAt)} 至 {formatDate(preview.timeRange.endAt)}</span><i />质量：有效 {preview.quality.good} · 待核 {preview.quality.uncertain} · 无效 {preview.quality.bad}</div>
    <div className="model-data-preview-time"><CircleAlert size={13} /><span>自动规范化 {preview.correctedValueCount}</span><i />无效值 {preview.invalidValueCount} · 缺点记录 {preview.incompleteRecordCount} · 重复点位 {preview.duplicatePointCount}</div>
    {preview.scl && <div className="model-data-scl-summary"><CheckCircle2 size={13} /><span>SCL：{preview.scl.fileName}（{compactNumber(preview.scl.size)} 字节），确认导入后永久保存到当前模型数据目录</span></div>}
    <div className="model-data-mapping-table-wrap"><table className="model-data-mapping-table"><thead><tr><th>文件点位</th><th>模型指标</th><th>单位</th><th>状态</th></tr></thead><tbody>{preview.mappings.map((mapping) => <tr key={mapping.field}><td><code>{mapping.sourceKey}</code></td><td>{mapping.label}<small>{mapping.field}</small></td><td>{mapping.unit}</td><td><span className={mapping.observed ? 'is-mapped' : 'is-missing'}>{mapping.observed ? '已识别' : '未出现'}</span></td></tr>)}</tbody></table></div>
    {preview.warnings.length > 0 && <div className="model-data-preview-warnings">{preview.warnings.map((warning) => <p key={warning}><CircleAlert size={12} />{warning}</p>)}</div>}
    {preview.unmappedPoints.length > 0 && <div className="model-data-unmapped"><span>未映射点位</span><code>{preview.unmappedPoints.join('、')}</code></div>}
    {preview.verification ? <div className="model-data-impact-line"><span>本次对齐 {preview.verification.matched} 条</span><span>不在预测范围或质量无效 {preview.verification.excluded} 条</span><strong>原历史及预测保持不变</strong></div> : <div className="model-data-impact-line"><span>当前设备 {compactNumber(preview.impact.currentDeviceRecords)} 条</span><span>重复时间 {compactNumber(preview.impact.duplicateTimes)} 条</span><strong>预计全部数据 {compactNumber(preview.impact.estimatedTotalRecords)} 条</strong></div>}
  </section>
);

const Progress: React.FC<{ label: string; value: number; detail: string }> = ({ label, value, detail }) => <div className="model-data-progress"><div className="model-data-progress-label"><span>{label}</span><b>{value}%</b></div><div className="model-data-progress-track"><span style={{ width: `${value}%` }} /></div><p>{detail}</p></div>;
