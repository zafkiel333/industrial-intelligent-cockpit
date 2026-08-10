// 2026-08-09 新增：根据当前及近期遥测快照生成稳定的设备诊断和故障预测结论；
import { getModelShowcaseConfig } from './modelCatalog';
import type {
  DiagnosisFaultPrediction,
  DiagnosisResult,
  ModelShowcaseSceneId,
  RemoteBindableField,
  RemoteDashboardData,
  RemoteDataMode,
  RiskDirection,
} from './types';

interface DiagnosticSnapshot {
  timestamp: number;
  mode: RemoteDataMode;
  fields: RemoteBindableField[];
}

interface FieldAnalysis {
  field: RemoteBindableField;
  risk: number;
  trend: number;
  volatility: number;
}

const HISTORY_LIMIT = 60;
const histories = new Map<ModelShowcaseSceneId, DiagnosticSnapshot[]>();
const lastRiskLevels = new Map<ModelShowcaseSceneId, DiagnosisResult['riskLevel']>();

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const finite = (value: unknown, fallback = 0) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;

export function recordDiagnosticSnapshot(
  sceneId: ModelShowcaseSceneId,
  dashboard: RemoteDashboardData,
  mode: RemoteDataMode = 'dashboard',
): void {
  if (!Array.isArray(dashboard.bindable_fields) || dashboard.bindable_fields.length === 0) return;

  const history = histories.get(sceneId) ?? [];
  history.push({
    timestamp: Date.now(),
    mode,
    fields: dashboard.bindable_fields.map((field) => ({ ...field })),
  });
  if (history.length > HISTORY_LIMIT) history.splice(0, history.length - HISTORY_LIMIT);
  histories.set(sceneId, history);
}

export function clearDiagnosticHistory(sceneId: ModelShowcaseSceneId): void {
  histories.delete(sceneId);
  lastRiskLevels.delete(sceneId);
}

function analyseField(
  key: string,
  latest: RemoteBindableField,
  snapshots: DiagnosticSnapshot[],
  direction: RiskDirection = 'both',
): FieldAnalysis {
  const min = finite(latest.normal_min);
  const max = finite(latest.normal_max, min + 1);
  const span = Math.max(0.000001, max - min);
  const value = finite(latest.value, finite(latest.base_value));
  const position = (value - min) / span;

  let boundaryRisk = 0;
  if (value < min || value > max || latest.abnormal) {
    const overflow = value < min ? (min - value) / span : (value - max) / span;
    boundaryRisk = 75 + clamp(overflow * 80, 0, 25);
  } else if (direction === 'high') {
    boundaryRisk = clamp(((position - 0.65) / 0.35) * 55);
  } else if (direction === 'low') {
    boundaryRisk = clamp(((0.35 - position) / 0.35) * 55);
  } else {
    boundaryRisk = clamp(((Math.abs(position - 0.5) - 0.32) / 0.18) * 55);
  }

  const values = snapshots
    .map((snapshot) => snapshot.fields.find((field) => field.field === key)?.value)
    .filter((item): item is number => typeof item === 'number' && Number.isFinite(item));

  const trend = values.length > 1 ? (values[values.length - 1] - values[0]) / span : 0;
  const mean = values.length ? values.reduce((sum, item) => sum + item, 0) / values.length : value;
  const variance = values.length
    ? values.reduce((sum, item) => sum + Math.pow(item - mean, 2), 0) / values.length
    : 0;
  const volatility = Math.sqrt(variance) / span;
  const alignedTrend = direction === 'high' ? Math.max(0, trend) : direction === 'low' ? Math.max(0, -trend) : Math.abs(trend);
  const recentAbnormalRatio = snapshots.length
    ? snapshots.slice(-12).filter((snapshot) => snapshot.fields.find((field) => field.field === key)?.abnormal).length / Math.min(12, snapshots.length)
    : 0;
  const risk = clamp(boundaryRisk + Math.min(20, alignedTrend * 42) + Math.min(15, volatility * 60) + recentAbnormalRatio * 15);

  return { field: latest, risk, trend, volatility };
}

function probabilityToWindow(probability: number): Pick<DiagnosisFaultPrediction, 'horizon' | 'expectedWindow'> {
  if (probability >= 0.76) return { horizon: '24h', expectedWindow: '未来 6～24 小时' };
  if (probability >= 0.52) return { horizon: '72h', expectedWindow: '未来 24～72 小时' };
  return { horizon: '7d', expectedWindow: '未来 3～7 天' };
}

function riskLevelFor(score: number, previous?: DiagnosisResult['riskLevel']): DiagnosisResult['riskLevel'] {
  const raw = score >= 72 ? 'critical' : score >= 48 ? 'warning' : score >= 24 ? 'attention' : 'healthy';
  if (!previous) return raw;
  const rank: Record<DiagnosisResult['riskLevel'], number> = { healthy: 0, attention: 1, warning: 2, critical: 3 };
  if (rank[raw] >= rank[previous]) return raw;
  const recoveryBoundary: Record<DiagnosisResult['riskLevel'], number> = {
    healthy: 0,
    attention: 19,
    warning: 43,
    critical: 67,
  };
  return score > recoveryBoundary[previous] ? previous : raw;
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items));
}

export function runDiagnosis(sceneId: ModelShowcaseSceneId): DiagnosisResult | null {
  const config = getModelShowcaseConfig(sceneId);
  const snapshots = histories.get(sceneId) ?? [];
  const latest = snapshots[snapshots.length - 1];
  if (!config || !latest) return null;

  const analyses = new Map<string, FieldAnalysis>();
  latest.fields.forEach((field) => analyses.set(
    field.field,
    analyseField(field.field, field, snapshots, config.fields[field.field]?.riskDirection),
  ));

  let weightedRisk = 0;
  let totalWeight = 0;
  Object.entries(config.fields).forEach(([key, fieldConfig]) => {
    const analysis = analyses.get(key);
    if (!analysis) return;
    weightedRisk += analysis.risk * fieldConfig.weight;
    totalWeight += fieldConfig.weight;
  });
  const overallRisk = clamp(totalWeight ? weightedRisk / totalWeight : 0);
  const healthScore = Math.round(clamp(100 - overallRisk));
  const riskLevel = riskLevelFor(overallRisk, lastRiskLevels.get(sceneId));
  lastRiskLevels.set(sceneId, riskLevel);

  const predictions = config.faultProfiles.map((profile) => {
    const profileAnalyses = profile.fields.map((field) => analyses.get(field)).filter((item): item is FieldAnalysis => Boolean(item));
    const averageRisk = profileAnalyses.length
      ? profileAnalyses.reduce((sum, item) => sum + item.risk, 0) / profileAnalyses.length
      : 0;
    const highRiskCount = profileAnalyses.filter((item) => item.risk >= 50).length;
    const trendContribution = profileAnalyses.reduce((sum, item) => sum + Math.min(1, Math.abs(item.trend)), 0);
    const probability = clamp(0.08 + averageRisk / 100 * 0.7 + highRiskCount * 0.06 + trendContribution * 0.025, 0, 0.96);
    const evidence = profileAnalyses
      .sort((a, b) => b.risk - a.risk)
      .slice(0, 3)
      .map((item) => `${item.field.label} ${item.field.value.toFixed(2)} ${item.field.unit}（风险贡献 ${Math.round(item.risk)}%）`);
    return {
      faultCode: profile.code,
      faultName: profile.name,
      probability,
      ...probabilityToWindow(probability),
      evidence,
      recommendation: profile.recommendation,
    };
  }).sort((a, b) => b.probability - a.probability);

  const selected = predictions.filter((item) => item.probability >= 0.28).slice(0, 3);
  if (selected.length === 0 && predictions[0]) selected.push(predictions[0]);

  const faultPredictions: DiagnosisFaultPrediction[] = selected.map(({ recommendation: _recommendation, ...prediction }) => ({
    ...prediction,
    probability: Number(prediction.probability.toFixed(2)),
  }));
  const recommendations = unique(selected.map((item) => item.recommendation));
  if (recommendations.length === 0) recommendations.push('保持当前巡检周期，持续观察关键参数趋势。');

  const top = selected[0];
  const conclusion = riskLevel === 'healthy'
    ? `${config.expectedRemoteName}当前主要参数保持在正常区间，短期趋势平稳，未发现显著故障征兆。`
    : `${config.expectedRemoteName}当前处于${riskLevel === 'critical' ? '高风险' : riskLevel === 'warning' ? '预警' : '关注'}状态，诊断系统重点提示“${top?.faultName ?? '运行参数偏离'}”，建议结合现场巡检及时复核。`;

  const firstAt = snapshots[0]?.timestamp;
  const lastAt = latest.timestamp;
  const confidence = clamp(0.46 + Math.min(0.36, snapshots.length / HISTORY_LIMIT * 0.36) + (latest.fields.some((field) => field.abnormal) ? 0.08 : 0), 0, 0.94);

  return {
    diagnosisId: `diag-${sceneId}-${lastAt}`,
    generatedAt: new Date(lastAt).toISOString(),
    dataWindow: {
      sampleCount: snapshots.length,
      startAt: firstAt ? new Date(firstAt).toISOString() : undefined,
      endAt: new Date(lastAt).toISOString(),
    },
    healthScore,
    riskLevel,
    conclusion,
    faultPredictions,
    recommendations,
    confidence: Number(confidence.toFixed(2)),
  };
}
