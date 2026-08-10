// 2026-08-09 新增：定义外部模型 BFF、遥测、诊断、预测和一致性校验共享类型；
export type ModelShowcaseSceneId =
  | 'sim-visual-hydro-turbine'
  | 'sim-visual-wastewater-pump'
  | 'sim-visual-bridge-crane'
  | 'sim-visual-haul-truck';

export type RemoteScenarioType = 'normal' | 'high_load' | 'fault';
export type RemoteDataMode = 'dashboard' | RemoteScenarioType;
export type RiskDirection = 'high' | 'low' | 'both';

// 2026-08-10 新增：定义跨项目连接状态、通道观测和数据来源关系；
export type ModelConnectionStatus = 'connected' | 'cached' | 'degraded' | 'offline' | 'unknown';
export type ModelConnectionChannel = 'metadata' | 'modelBinary' | 'dashboard' | 'scenario' | 'dataSync' | 'diagnosis';
export type ModelConnectionOwner = 'upstream' | 'local-derived';
export type ModelConnectionCacheState = 'hit' | 'miss' | 'empty';

export interface ModelConnectionChannelState {
  channel: ModelConnectionChannel;
  label: string;
  owner: ModelConnectionOwner;
  status: ModelConnectionStatus;
  localRoute: string;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  latencyMs: number | null;
  httpStatus: number | null;
  errorCode: string | null;
  errorMessage: string | null;
  cacheState?: ModelConnectionCacheState;
  bytes?: number;
}

export interface ModelConnectionProjectDescriptor {
  id: string;
  name: string;
  role: string;
  service?: string;
  baseUrl?: string;
  modelName?: string;
  detailUrl?: string;
}

export interface ModelShowcaseConnectionSnapshot {
  sceneId: ModelShowcaseSceneId;
  modelId: number;
  overallStatus: ModelConnectionStatus;
  generatedAt: string;
  sourceProject: ModelConnectionProjectDescriptor;
  connector: {
    type: 'BFF';
    name: string;
    transport: 'HTTP REST';
    role: string;
    modelCache: ModelConnectionCacheState;
    security: string[];
  };
  targetProject: ModelConnectionProjectDescriptor;
  channels: ModelConnectionChannelState[];
  provenance: {
    upstream: string[];
    localDerived: string[];
  };
}

export interface RemoteBindableField {
  field: string;
  label: string;
  unit: string;
  value: number;
  base_value: number;
  normal_min: number;
  normal_max: number;
  abnormal: boolean;
  trend: 'up' | 'down' | 'stable' | string;
  visual_binding?: string;
  refresh_s?: number;
  value_source?: 'api' | 'range-simulated';
}

export interface RemoteTwinStatus {
  status: string;
  color?: string;
  last_sync?: string;
  data_source?: string;
  sync_latency_ms?: number;
  data_points?: string;
}

export interface RemoteEquipmentInfo {
  name: string;
  status: string;
  rated_power?: number;
}

export interface RemoteRenderConfig {
  camera_default?: {
    position?: [number, number, number];
    target?: [number, number, number];
  };
  auto_rotate?: boolean;
  background_color?: string;
}

export interface RemoteScenarioTemplate {
  label: string;
  fields: Record<string, number>;
  status: string;
  color: string;
}

export interface RemoteDashboardData {
  scenario?: RemoteScenarioType;
  scenario_label?: string;
  scenario_status?: string;
  scenario_color?: string;
  twin_status: RemoteTwinStatus;
  equipment: RemoteEquipmentInfo;
  bindable_fields: RemoteBindableField[];
  model_config?: {
    polygon_count?: number;
    material_count?: number;
  };
  render_config?: RemoteRenderConfig;
  acceptance?: {
    data_response_ms?: number;
    data_response_pass?: boolean;
    max_response_seconds?: number;
    data_consistency_required?: boolean;
  };
  scenario_templates?: Partial<Record<RemoteScenarioType, RemoteScenarioTemplate>>;
}

export interface ModelAssetDescriptor {
  name: string;
  description: string;
  industry: string;
  fileName: string;
  fileSize: number;
  format: 'fbx' | 'glb' | 'gltf';
  localAssetUrl: string;
}

export interface ModelShowcaseBootstrap {
  sceneId: ModelShowcaseSceneId;
  modelId: number;
  title: string;
  model: ModelAssetDescriptor;
  dashboard: RemoteDashboardData;
}

export interface TelemetryHistoryPoint {
  time: number;
  label: string;
  values: Record<string, number>;
}

export interface DiagnosisFaultPrediction {
  faultCode: string;
  faultName: string;
  probability: number;
  horizon: '24h' | '72h' | '7d';
  expectedWindow: string;
  evidence: string[];
}

export interface DiagnosisResult {
  diagnosisId: string;
  generatedAt: string;
  dataWindow: {
    sampleCount: number;
    startAt?: string;
    endAt?: string;
  };
  healthScore: number;
  riskLevel: 'healthy' | 'attention' | 'warning' | 'critical';
  conclusion: string;
  faultPredictions: DiagnosisFaultPrediction[];
  recommendations: string[];
  confidence: number;
}

export interface ConsistencyFieldResult {
  field?: string;
  label?: string;
  expected?: number;
  actual?: number;
  diff?: number;
  diff_pct?: number;
  consistent?: boolean;
}

export interface ConsistencyResult {
  scenario?: string;
  scenario_label?: string;
  overall_consistency_pct?: number;
  consistency_level?: 'pass' | 'warn' | 'fail' | string;
  consistent_count?: number;
  total_fields?: number;
  fields?: ConsistencyFieldResult[];
  summary?: string;
}

export interface ShowcaseApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    retryable?: boolean;
  };
  message?: string;
}
