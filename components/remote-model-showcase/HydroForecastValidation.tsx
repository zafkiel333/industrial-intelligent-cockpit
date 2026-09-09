import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  FileCheck2,
  FileUp,
  Gauge,
  History,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Target,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { apiUrl } from '../../src/integration/apiClient';

type ValidationTag = 'normal' | 'abnormal';
type CaseStatus = 'pending' | 'predicted' | 'verified';

interface ValidationFileSummary {
  fileName: string;
  rowCount: number;
  startAt: string;
  endAt: string;
  uploadedAt: string;
}

interface FieldMetric {
  field: string;
  label: string;
  unit: string;
  mae: number;
  rmse: number;
  normalizedMae: number;
  smape: number;
  intervalCoverage: number;
}

interface ValidationResult {
  actualTag: ValidationTag;
  actualFaultCode: string | null;
  actualFaultName: string;
  actualFaultPart: string;
  statusCorrect: boolean;
  faultCorrect: boolean;
  conclusionCorrect: boolean;
  normalizedMae: number;
  smape: number;
  intervalCoverage: number;
  fieldMetrics: FieldMetric[];
  actualSeries: Array<{ timestamp: string; values: Record<string, number> }>;
  verifiedAt: string;
}

interface ValidationRecordSummary {
  caseId: string;
  deviceId: string;
  status: Exclude<CaseStatus, 'pending'>;
  observation: ValidationFileSummary;
  predictedTag: ValidationTag;
  predictedFaultName: string;
  predictedFaultPart: string;
  conclusion: string;
  riskLevel: 'healthy' | 'attention' | 'warning' | 'critical';
  healthScore: number;
  verification?: ValidationFileSummary;
  result?: ValidationResult;
}

interface ValidationOverview {
  targetCases: number;
  predictedCases: number;
  verifiedCases: number;
  updatedAt: string;
  metrics: {
    statusAccuracy: number | null;
    conclusionAccuracy: number | null;
    faultAccuracy: number | null;
    normalizedMae: number | null;
    smape: number | null;
    intervalCoverage: number | null;
  };
  availableCases: Array<{
    caseId: string;
    deviceId: string;
    observationCount: number;
    verificationCount: number;
    observationFileName: string;
    verificationFileName: string;
    status: CaseStatus;
  }>;
  records: ValidationRecordSummary[];
}

interface ValidationCaseRecord {
  caseId: string;
  deviceId: string;
  status: Exclude<CaseStatus, 'pending'>;
  observation: ValidationFileSummary;
  prediction: {
    generatedAt: string;
    tag: ValidationTag;
    faultName: string;
    faultPart: string;
    conclusion: string;
    riskLevel: 'healthy' | 'attention' | 'warning' | 'critical';
    healthScore: number;
    forecasts: Array<{ field: string; timestamp: string; predicted: number; lower: number; upper: number }>;
  };
  verification?: ValidationFileSummary;
  result?: ValidationResult;
}

interface CaseDetailResponse {
  definition: {
    caseId: string;
    deviceId: string;
    observationCount: number;
    verificationCount: number;
  };
  record: ValidationCaseRecord | null;
}

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  tone: 'warning' | 'danger';
  action: () => Promise<void>;
}

const fields = [
  { field: 'rpm', label: '转速', unit: 'r/min', color: '#087eaa' },
  { field: 'temperature', label: '轴承温度', unit: '°C', color: '#9a4fb8' },
  { field: 'vibration', label: '主轴振动', unit: 'mm/s', color: '#d56d16' },
  { field: 'pressure', label: '水压', unit: 'MPa', color: '#188779' },
  { field: 'flow_rate', label: '流量', unit: 'm³/s', color: '#d4475f' },
  { field: 'power_output', label: '输出功率', unit: 'MW', color: '#536fbd' },
] as const;

const percent = (value: number | null | undefined, decimals = 1) => value == null
  ? '--'
  : `${(value * 100).toFixed(decimals)}%`;
const dateTime = (value?: string) => value
  ? new Date(value).toLocaleString('zh-CN', { hour12: false })
  : '--';
const tagLabel = (tag?: ValidationTag) => tag === 'abnormal' ? '异常' : tag === 'normal' ? '正常' : '--';

async function requestJson<T>(pathname: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(pathname), {
    ...init,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = await response.json().catch(() => ({})) as T & { error?: { message?: string } };
  if (!response.ok) throw new Error(body.error?.message || `请求失败（${response.status}）`);
  return body;
}

export function HydroForecastValidation() {
  const [overview, setOverview] = useState<ValidationOverview | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState('HT-01');
  const [detail, setDetail] = useState<CaseDetailResponse | null>(null);
  const [observationFile, setObservationFile] = useState<File | null>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const observationInput = useRef<HTMLInputElement>(null);
  const verificationInput = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    requestJson<ValidationOverview>('model-showcase/sim-visual-hydro-turbine/data/validation/overview', { signal: controller.signal })
      .then(setOverview)
      .catch((requestError) => requestError.name !== 'AbortError' && setError(requestError.message));
    return () => controller.abort();
  }, [revision]);

  useEffect(() => {
    const controller = new AbortController();
    setDetail(null);
    setObservationFile(null);
    setVerificationFile(null);
    requestJson<CaseDetailResponse>(`model-showcase/sim-visual-hydro-turbine/data/validation/cases/${selectedCaseId}`, { signal: controller.signal })
      .then(setDetail)
      .catch((requestError) => requestError.name !== 'AbortError' && setError(requestError.message));
    return () => controller.abort();
  }, [revision, selectedCaseId]);

  const selectedDefinition = overview?.availableCases.find((item) => item.caseId === selectedCaseId);
  const selectedRecord = detail?.record || null;
  const recordByCase = useMemo(() => new Map(overview?.records.map((record) => [record.caseId, record]) || []), [overview]);

  const executeUpload = async (kind: 'observation' | 'verification', file: File) => {
    setBusy(kind);
    setError('');
    setNotice('');
    try {
      const content = await file.text();
      await requestJson(`model-showcase/sim-visual-hydro-turbine/data/validation/cases/${selectedCaseId}/${kind}`, {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, content }),
      });
      setNotice(kind === 'observation'
        ? `${selectedCaseId} 观测数据已解析，预测结论已经冻结。`
        : `${selectedCaseId} 验证完成，误差与结论核验结果已计入累计统计。`);
      setObservationFile(null);
      setVerificationFile(null);
      refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : '文件处理失败');
    } finally {
      setBusy('');
    }
  };

  const uploadObservation = () => {
    if (!observationFile) return;
    if (selectedRecord) {
      setConfirmState({
        title: '重新生成该组预测？',
        message: '新的观测数据会替换该组已保存内容，并清除其验证结果。其他工况组不受影响。',
        confirmLabel: '替换并重新预测',
        tone: 'warning',
        action: () => executeUpload('observation', observationFile),
      });
      return;
    }
    void executeUpload('observation', observationFile);
  };

  const removeCase = () => setConfirmState({
    title: `删除 ${selectedCaseId} 的验证记录？`,
    message: '该组观测文件、冻结预测、验证文件和误差结果将一并删除。',
    confirmLabel: '确认删除',
    tone: 'danger',
    action: async () => {
      setBusy('delete');
      try {
        await requestJson(`model-showcase/sim-visual-hydro-turbine/data/validation/cases/${selectedCaseId}`, { method: 'DELETE' });
        setNotice(`${selectedCaseId} 的验证记录已删除。`);
        refresh();
      } finally {
        setBusy('');
      }
    },
  });

  const resetAll = () => setConfirmState({
    title: '重置全部预测验证记录？',
    message: '已完成和待验证的所有工况记录都会被删除，50 组原始数据文件不会受影响。',
    confirmLabel: '确认重置',
    tone: 'danger',
    action: async () => {
      setBusy('reset');
      try {
        await requestJson('model-showcase/sim-visual-hydro-turbine/data/validation', { method: 'DELETE' });
        setNotice('预测验证记录已重置。');
        refresh();
      } finally {
        setBusy('');
      }
    },
  });

  return <section className="hydro-validation-workbench" aria-label="水轮机预测验证工作台">
    <header className="hydro-validation-header">
      <div>
        <span className="hydro-validation-eyebrow"><Target size={14} /> 预测能力验证</span>
        <h2>水轮机时序预测与结论核验</h2>
        <p>先依据观测窗口冻结未来 6 小时预测，再导入后续实测数据，对数值误差、状态判断及故障部位结论进行独立核验。</p>
      </div>
      <div className="hydro-validation-actions">
        <a href={apiUrl(`model-showcase/sim-visual-hydro-turbine/data/validation/datasets?caseId=${selectedCaseId}`)}><Download size={15} /> 下载本组数据</a>
        <a href={apiUrl('model-showcase/sim-visual-hydro-turbine/data/validation/datasets')}><Database size={15} /> 下载50组数据</a>
        <button type="button" onClick={refresh} title="刷新验证进度"><RefreshCw size={15} /></button>
        <button type="button" onClick={resetAll} disabled={!overview?.predictedCases || Boolean(busy)} title="重置全部验证记录"><RotateCcw size={15} /></button>
      </div>
    </header>

    <div className="hydro-validation-kpis">
      <Metric icon={<History />} label="已完成验证" value={`${overview?.verifiedCases ?? 0} / ${overview?.targetCases ?? 50}`} sub={`${overview?.predictedCases ?? 0} 组已形成预测`} />
      <Metric icon={<ShieldCheck />} label="状态判断准确率" value={percent(overview?.metrics.statusAccuracy)} sub="正常 / 异常标签" tone="green" />
      <Metric icon={<Target />} label="综合结论准确率" value={percent(overview?.metrics.conclusionAccuracy)} sub={`异常故障类型 ${percent(overview?.metrics.faultAccuracy)}`} tone="violet" />
      <Metric icon={<Gauge />} label="平均归一化误差" value={percent(overview?.metrics.normalizedMae)} sub={`区间覆盖率 ${percent(overview?.metrics.intervalCoverage)}`} tone="amber" />
      <Metric icon={<Activity />} label="平均对称误差" value={percent(overview?.metrics.smape)} sub={overview?.verifiedCases ? `基于 ${overview.verifiedCases} 组后续实测` : '等待首组验证'} />
    </div>

    {error && <div className="hydro-validation-message is-error" role="alert"><AlertTriangle size={16} />{error}<button type="button" onClick={() => setError('')} title="关闭"><X size={14} /></button></div>}
    {notice && <div className="hydro-validation-message is-success" role="status"><CheckCircle2 size={16} />{notice}<button type="button" onClick={() => setNotice('')} title="关闭"><X size={14} /></button></div>}

    <div className="hydro-validation-layout">
      <aside className="hydro-case-index">
        <header><div><h3>工况组</h3><p>按既定顺序完成两阶段验证</p></div><b>{overview?.verifiedCases ?? 0}/50</b></header>
        <div className="hydro-case-progress"><i style={{ width: `${(overview?.verifiedCases || 0) / 50 * 100}%` }} /></div>
        <div className="hydro-case-list">
          {overview?.availableCases.map((item) => <button
            type="button"
            key={item.caseId}
            className={`${item.caseId === selectedCaseId ? 'is-active' : ''} is-${item.status}`}
            onClick={() => setSelectedCaseId(item.caseId)}
          >
            <span>{item.status === 'verified' ? <CheckCircle2 /> : item.status === 'predicted' ? <Clock3 /> : <span />}</span>
            <div><strong>{item.caseId}</strong><small>{item.deviceId}</small></div>
            <b>{item.status === 'verified' ? '已验证' : item.status === 'predicted' ? '待核验' : '未开始'}</b>
          </button>)}
        </div>
      </aside>

      <div className="hydro-validation-main">
        <section className="hydro-validation-flow">
          <header>
            <div><span>{selectedCaseId}</span><div><h3>{selectedDefinition?.deviceId || detail?.definition.deviceId || '--'}</h3><p>观测 180 分钟 · 验证 360 分钟 · 采样间隔 60 秒</p></div></div>
            <b className={`is-${selectedDefinition?.status || 'pending'}`}>{selectedDefinition?.status === 'verified' ? '验证完成' : selectedDefinition?.status === 'predicted' ? '预测已冻结' : '等待观测数据'}</b>
          </header>

          <div className="hydro-validation-stages">
            <UploadStage
              index="01"
              title="导入观测窗口"
              description="解析历史运行序列并生成未来 6 小时预测。此阶段不读取实际状态标签。"
              file={observationFile}
              saved={selectedRecord?.observation}
              expectedName={selectedDefinition?.observationFileName || `${selectedCaseId}-观测数据.csv`}
              busy={busy === 'observation'}
              actionLabel={selectedRecord ? '重新解析并预测' : '解析并生成预测'}
              inputRef={observationInput}
              onSelect={setObservationFile}
              onUpload={uploadObservation}
            />
            <div className="hydro-stage-connector"><TrendingUp size={18} /><span>冻结预测</span></div>
            <UploadStage
              index="02"
              title="导入后续实测"
              description="按同一时间轴核验预测值、实际状态与故障部位，并将结果计入累计统计。"
              file={verificationFile}
              saved={selectedRecord?.verification}
              expectedName={selectedDefinition?.verificationFileName || `${selectedCaseId}-验证数据.csv`}
              busy={busy === 'verification'}
              disabled={!selectedRecord}
              actionLabel={selectedRecord?.result ? '重新执行核验' : '核验并记录结果'}
              inputRef={verificationInput}
              onSelect={setVerificationFile}
              onUpload={() => verificationFile && void executeUpload('verification', verificationFile)}
            />
          </div>

          {selectedRecord ? <PredictionOutcome record={selectedRecord} /> : <div className="hydro-prediction-placeholder"><TrendingUp size={22} /><div><strong>预测结论将在观测数据解析后冻结</strong><span>状态标签、故障类型、预警部位与 6 小时数值预测将作为本组核验基准。</span></div></div>}
        </section>

        <ValidationChart record={selectedRecord} />

        {selectedRecord?.result && <FieldMetrics metrics={selectedRecord.result.fieldMetrics} />}

        {selectedRecord && <div className="hydro-case-footer">
          <span>观测文件：{selectedRecord.observation.fileName} · {dateTime(selectedRecord.observation.uploadedAt)}</span>
          <button type="button" onClick={removeCase} disabled={Boolean(busy)}><Trash2 size={14} /> 删除本组记录</button>
        </div>}
      </div>
    </div>

    <ValidationLedger overview={overview} recordByCase={recordByCase} onSelect={setSelectedCaseId} />

    {confirmState && <ConfirmDialog
      state={confirmState}
      busy={Boolean(busy)}
      onCancel={() => setConfirmState(null)}
      onConfirm={async () => {
        const action = confirmState.action;
        setConfirmState(null);
        try { await action(); } catch (actionError) { setError(actionError instanceof Error ? actionError.message : '操作失败'); }
      }}
    />}
  </section>;
}

function Metric({ icon, label, value, sub, tone = 'blue' }: { icon: React.ReactNode; label: string; value: string; sub: string; tone?: string }) {
  return <article className={`hydro-validation-kpi is-${tone}`}><span>{icon}</span><div><small>{label}</small><strong>{value}</strong><p>{sub}</p></div></article>;
}

function UploadStage({ index, title, description, file, saved, expectedName, busy, disabled, actionLabel, inputRef, onSelect, onUpload }: {
  index: string;
  title: string;
  description: string;
  file: File | null;
  saved?: ValidationFileSummary;
  expectedName: string;
  busy: boolean;
  disabled?: boolean;
  actionLabel: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSelect: (file: File | null) => void;
  onUpload: () => void;
}) {
  return <article className={`hydro-upload-stage ${saved ? 'is-complete' : ''} ${disabled ? 'is-disabled' : ''}`}>
    <header><span>{index}</span><div><h4>{title}</h4><p>{description}</p></div>{saved && <CheckCircle2 size={18} />}</header>
    <div className="hydro-upload-file">
      <FileCheck2 size={18} />
      <div><strong>{file?.name || saved?.fileName || expectedName}</strong><small>{file ? `${(file.size / 1024).toFixed(1)} KB，等待处理` : saved ? `${saved.rowCount} 条 · ${dateTime(saved.uploadedAt)}` : 'CSV 固定长表格式'}</small></div>
      <button type="button" onClick={() => inputRef.current?.click()} disabled={disabled || busy}>选择文件</button>
      <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={(event) => onSelect(event.target.files?.[0] || null)} />
    </div>
    <button type="button" className="hydro-upload-submit" disabled={disabled || busy || !file} onClick={onUpload}>
      {busy ? <LoaderCircle className="animate-spin" size={15} /> : <FileUp size={15} />}{busy ? '正在处理...' : actionLabel}
    </button>
  </article>;
}

function PredictionOutcome({ record }: { record: ValidationCaseRecord }) {
  const result = record.result;
  return <div className="hydro-prediction-outcome">
    <article><small>预测状态</small><strong className={`is-${record.prediction.tag}`}>{tagLabel(record.prediction.tag)}</strong><span>健康评分 {record.prediction.healthScore}</span></article>
    <article><small>预测故障与部位</small><strong>{record.prediction.faultName}</strong><span>{record.prediction.faultPart}</span></article>
    <article className="is-wide"><small>冻结结论</small><p>{record.prediction.conclusion}</p></article>
    <article className={result ? result.conclusionCorrect ? 'is-pass' : 'is-fail' : 'is-pending'}>
      <small>核验结论</small>
      <strong>{!result ? '等待后续实测' : result.conclusionCorrect ? '结论一致' : '结论存在偏差'}</strong>
      <span>{result ? `实际状态 ${tagLabel(result.actualTag)} · ${result.actualFaultName}` : '实际标签尚未进入本组计算'}</span>
    </article>
  </div>;
}

function ValidationChart({ record }: { record: ValidationCaseRecord | null }) {
  const width = 1120;
  const left = 120;
  const right = 22;
  const top = 34;
  const rowHeight = 82;
  const height = top + fields.length * rowHeight + 34;
  if (!record) return <section className="hydro-validation-chart"><header><div><h3>未来时序对照</h3><p>冻结预测与后续实测采用相同时间轴</p></div><b>等待预测</b></header><div className="hydro-chart-empty">导入观测数据后显示 6 小时预测曲线。</div></section>;

  const allTimes = record.prediction.forecasts.map((point) => Date.parse(point.timestamp));
  const start = Math.min(...allTimes);
  const end = Math.max(...allTimes);
  const x = (timestamp: string) => left + (Date.parse(timestamp) - start) / Math.max(1, end - start) * (width - left - right);
  const actual = record.result?.actualSeries || [];
  const line = (points: Array<{ timestamp: string; value: number }>, y: (value: number) => number) => points.map((point, index) => `${index ? 'L' : 'M'}${x(point.timestamp).toFixed(1)},${y(point.value).toFixed(1)}`).join(' ');
  const area = (points: Array<{ timestamp: string; lower: number; upper: number }>, y: (value: number) => number) => `${points.map((point, index) => `${index ? 'L' : 'M'}${x(point.timestamp).toFixed(1)},${y(point.upper).toFixed(1)}`).join(' ')} ${points.slice().reverse().map((point) => `L${x(point.timestamp).toFixed(1)},${y(point.lower).toFixed(1)}`).join(' ')} Z`;

  return <section className="hydro-validation-chart">
    <header><div><h3>未来 6 小时预测对照</h3><p>预测区间、中心预测与验证实测逐分钟对齐</p></div><div className="hydro-chart-legend"><span className="is-band" />预测区间<i className="is-forecast" />冻结预测<i className="is-actual" />后续实测</div></header>
    <div className="hydro-chart-scroll"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${record.caseId}未来预测与后续实测对照图`}>
      {fields.map((field, fieldIndex) => {
        const forecast = record.prediction.forecasts.filter((point) => point.field === field.field);
        const measured = actual.map((point) => ({ timestamp: point.timestamp, value: point.values[field.field] })).filter((point) => Number.isFinite(point.value));
        const values = [...forecast.flatMap((point) => [point.lower, point.upper]), ...measured.map((point) => point.value)];
        const minimum = Math.min(...values);
        const maximum = Math.max(...values);
        const span = Math.max(0.001, maximum - minimum);
        const rowTop = top + fieldIndex * rowHeight;
        const y = (value: number) => rowTop + 10 + (maximum - value) / span * (rowHeight - 24);
        const metric = record.result?.fieldMetrics.find((item) => item.field === field.field);
        return <g key={field.field}>
          <rect x={left} y={rowTop} width={width - left - right} height={rowHeight - 5} fill={fieldIndex % 2 ? '#fbfcfd' : '#f6fafc'} />
          {[0, 0.5, 1].map((ratio) => <line key={ratio} x1={left} x2={width - right} y1={rowTop + 10 + ratio * (rowHeight - 24)} y2={rowTop + 10 + ratio * (rowHeight - 24)} stroke="#dbe5ea" strokeDasharray="4 5" />)}
          <text x="14" y={rowTop + 31} fill={field.color} fontSize="13" fontWeight="700">{field.label}</text>
          <text x="14" y={rowTop + 49} fill="#80919c" fontSize="9">{field.unit}</text>
          {metric && <text x="14" y={rowTop + 66} fill="#526d7d" fontSize="8">MAE {metric.mae}</text>}
          <path d={area(forecast, y)} fill={`${field.color}1b`} />
          <path d={line(forecast.map((point) => ({ timestamp: point.timestamp, value: point.predicted })), y)} fill="none" stroke={field.color} strokeWidth="1.8" />
          {measured.length > 0 && <path d={line(measured, y)} fill="none" stroke="#d66a2b" strokeWidth="1.5" strokeDasharray="5 3" />}
        </g>;
      })}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const time = start + (end - start) * ratio;
        const xPos = left + (width - left - right) * ratio;
        return <g key={ratio}><line x1={xPos} x2={xPos} y1={top} y2={top + fields.length * rowHeight - 5} stroke="#cad9e1" strokeDasharray="3 6" /><text x={xPos} y={height - 10} textAnchor={ratio === 0 ? 'start' : ratio === 1 ? 'end' : 'middle'} fill="#728795" fontSize="9">{new Date(time).toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })}</text></g>;
      })}
    </svg></div>
  </section>;
}

function FieldMetrics({ metrics }: { metrics: FieldMetric[] }) {
  return <section className="hydro-field-metrics"><header><div><h3>逐指标误差明细</h3><p>归一化误差按各指标正常工作区间折算，便于跨量纲比较</p></div><b>360 个对照点 / 指标</b></header><div className="hydro-metric-table"><div className="is-head"><span>指标</span><span>MAE</span><span>RMSE</span><span>归一化误差</span><span>对称误差</span><span>区间覆盖率</span></div>{metrics.map((metric) => <div key={metric.field}><strong>{metric.label}<small>{metric.unit}</small></strong><span>{metric.mae}</span><span>{metric.rmse}</span><span>{percent(metric.normalizedMae)}</span><span>{percent(metric.smape)}</span><span>{percent(metric.intervalCoverage)}</span></div>)}</div></section>;
}

function ValidationLedger({ overview, recordByCase, onSelect }: { overview: ValidationOverview | null; recordByCase: Map<string, ValidationRecordSummary>; onSelect: (caseId: string) => void }) {
  return <section className="hydro-validation-ledger"><header><div><h3>对照验证记录</h3><p>每组预测一经生成即冻结；累计指标仅统计已导入后续实测的工况组。</p></div><b>{overview?.verifiedCases ?? 0} 条已核验</b></header><div className="hydro-ledger-table"><div className="is-head"><span>工况组 / 设备</span><span>阶段</span><span>预测状态</span><span>实际状态</span><span>故障结论</span><span>归一化误差</span><span>核验结果</span><span>完成时间</span></div>{overview?.availableCases.map((item) => {
    const record = recordByCase.get(item.caseId);
    const result = record?.result;
    return <button type="button" key={item.caseId} onClick={() => { onSelect(item.caseId); document.querySelector('.hydro-validation-layout')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
      <strong>{item.caseId}<small>{item.deviceId}</small></strong>
      <span className={`hydro-ledger-status is-${item.status}`}>{item.status === 'verified' ? '已验证' : item.status === 'predicted' ? '待核验' : '未开始'}</span>
      <span>{record ? tagLabel(record.predictedTag) : '--'}</span>
      <span>{result ? tagLabel(result.actualTag) : '--'}</span>
      <span>{record?.predictedFaultName || '--'}</span>
      <span>{result ? percent(result.normalizedMae) : '--'}</span>
      <span className={result ? result.conclusionCorrect ? 'is-correct' : 'is-incorrect' : ''}>{result ? result.conclusionCorrect ? '一致' : '有偏差' : '--'}</span>
      <time>{result ? dateTime(result.verifiedAt) : '--'}</time>
    </button>;
  })}</div></section>;
}

function ConfirmDialog({ state, busy, onCancel, onConfirm }: { state: ConfirmState; busy: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <div className="hydro-confirm-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}><div className={`hydro-confirm-dialog is-${state.tone}`} role="dialog" aria-modal="true" aria-labelledby="hydro-confirm-title"><header><AlertTriangle size={20} /><h3 id="hydro-confirm-title">{state.title}</h3></header><p>{state.message}</p><footer><button type="button" onClick={onCancel} disabled={busy}>取消</button><button type="button" className="is-confirm" onClick={onConfirm} disabled={busy}>{state.confirmLabel}</button></footer></div></div>;
}
