// 2026-08-10 新增：记录外部模型各通道的运行期连接状态并生成安全的跨项目关系快照；
// 2026-08-10 调整：将对外项目、通道和数据职责描述统一改为设备业务语言；
import { getModelShowcaseConfig } from './modelCatalog';
import type {
  ModelConnectionCacheState,
  ModelConnectionChannel,
  ModelConnectionChannelState,
  ModelConnectionOwner,
  ModelConnectionStatus,
  ModelRefreshStatus,
  ModelShowcaseConnectionSnapshot,
  ModelShowcaseSceneId,
} from './types';

interface ConnectionUpdate {
  latencyMs?: number;
  httpStatus?: number | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  cacheState?: ModelConnectionCacheState;
  bytes?: number;
}

interface ConnectionSnapshotOptions {
  upstreamBaseUrl: string;
  modelCacheState: ModelConnectionCacheState;
  // 2026-08-12 新增：连接快照同步返回模型版本与定时更新状态；
  modelRefresh: ModelRefreshStatus;
}

const channelDefinitions: Record<ModelConnectionChannel, {
  label: string;
  owner: ModelConnectionOwner;
  localRoute: string;
}> = {
  metadata: { label: '设备模型信息', owner: 'upstream', localRoute: '/bootstrap' },
  modelBinary: { label: '设备三维模型', owner: 'upstream', localRoute: '/model' },
  dashboard: { label: '实时运行数据', owner: 'upstream', localRoute: '/dashboard' },
  scenario: { label: '典型仿真工况', owner: 'upstream', localRoute: '/scenario/:type' },
  dataSync: { label: '运行数据一致性校验', owner: 'upstream', localRoute: '/data-sync' },
  diagnosis: { label: '健康评估与故障预警', owner: 'local-derived', localRoute: '/diagnosis' },
};

const channelOrder: ModelConnectionChannel[] = [
  'metadata',
  'modelBinary',
  'dashboard',
  'scenario',
  'dataSync',
  'diagnosis',
];

const connectionStates = new Map<ModelShowcaseSceneId, Map<ModelConnectionChannel, ModelConnectionChannelState>>();

function emptyChannel(channel: ModelConnectionChannel): ModelConnectionChannelState {
  const definition = channelDefinitions[channel];
  return {
    channel,
    ...definition,
    status: 'unknown',
    lastAttemptAt: null,
    lastSuccessAt: null,
    latencyMs: null,
    httpStatus: null,
    errorCode: null,
    errorMessage: null,
    ...(channel === 'modelBinary' ? { cacheState: 'empty' as const } : {}),
  };
}

function sceneState(sceneId: ModelShowcaseSceneId): Map<ModelConnectionChannel, ModelConnectionChannelState> {
  const existing = connectionStates.get(sceneId);
  if (existing) return existing;
  const created = new Map(channelOrder.map((channel) => [channel, emptyChannel(channel)]));
  connectionStates.set(sceneId, created);
  return created;
}

function sanitizeErrorMessage(message: string | null | undefined): string | null {
  if (!message) return null;
  return message
    .replace(/3d_model\/[\w\-./%\u4e00-\u9fff]+/gi, '[hidden-object-key]')
    .replace(/file_url=[^\s&"']+/gi, 'file_url=[hidden]')
    .slice(0, 240);
}

export function recordConnectionSuccess(
  sceneId: ModelShowcaseSceneId,
  channel: ModelConnectionChannel,
  update: ConnectionUpdate = {},
): void {
  const state = sceneState(sceneId);
  const previous = state.get(channel) ?? emptyChannel(channel);
  const now = new Date().toISOString();
  const cacheState = update.cacheState ?? previous.cacheState;
  state.set(channel, {
    ...previous,
    status: cacheState === 'hit' ? 'cached' : 'connected',
    lastAttemptAt: now,
    lastSuccessAt: now,
    latencyMs: update.latencyMs ?? previous.latencyMs,
    httpStatus: update.httpStatus ?? previous.httpStatus,
    errorCode: null,
    errorMessage: null,
    ...(cacheState ? { cacheState } : {}),
    ...(typeof update.bytes === 'number' ? { bytes: update.bytes } : {}),
  });
}

export function recordConnectionFailure(
  sceneId: ModelShowcaseSceneId,
  channel: ModelConnectionChannel,
  update: ConnectionUpdate,
): void {
  const state = sceneState(sceneId);
  const previous = state.get(channel) ?? emptyChannel(channel);
  const cacheAvailable = previous.cacheState === 'hit';
  state.set(channel, {
    ...previous,
    status: cacheAvailable ? 'cached' : previous.lastSuccessAt ? 'degraded' : 'offline',
    lastAttemptAt: new Date().toISOString(),
    latencyMs: update.latencyMs ?? previous.latencyMs,
    httpStatus: update.httpStatus ?? previous.httpStatus,
    errorCode: update.errorCode ?? 'UPSTREAM_ERROR',
    errorMessage: sanitizeErrorMessage(update.errorMessage),
  });
}

export function recordConnectionCacheHit(
  sceneId: ModelShowcaseSceneId,
  channel: ModelConnectionChannel,
  update: Pick<ConnectionUpdate, 'bytes'> = {},
): void {
  const state = sceneState(sceneId);
  const previous = state.get(channel) ?? emptyChannel(channel);
  const now = new Date().toISOString();
  state.set(channel, {
    ...previous,
    status: 'cached',
    lastAttemptAt: now,
    lastSuccessAt: previous.lastSuccessAt ?? now,
    errorCode: null,
    errorMessage: null,
    cacheState: 'hit',
    ...(typeof update.bytes === 'number' ? { bytes: update.bytes } : {}),
  });
}

function overallStatus(channels: ModelConnectionChannelState[]): ModelConnectionStatus {
  const metadata = channels.find((item) => item.channel === 'metadata')!;
  const model = channels.find((item) => item.channel === 'modelBinary')!;
  const dashboard = channels.find((item) => item.channel === 'dashboard')!;
  const core = [metadata, model, dashboard];
  if (core.every((item) => item.status === 'unknown')) return 'unknown';
  if (model.status === 'cached' && (dashboard.status === 'connected' || dashboard.status === 'cached')) return 'cached';
  if (metadata.status === 'connected' && model.status === 'connected' && dashboard.status === 'connected') return 'connected';
  if (core.every((item) => item.status === 'offline' || item.status === 'unknown')) return 'offline';
  return 'degraded';
}

export function getConnectionSnapshot(
  sceneId: ModelShowcaseSceneId,
  options: ConnectionSnapshotOptions,
): ModelShowcaseConnectionSnapshot {
  const config = getModelShowcaseConfig(sceneId)!;
  const state = sceneState(sceneId);
  const channels = channelOrder.map((channel) => ({ ...(state.get(channel) ?? emptyChannel(channel)) }));
  const modelChannel = channels.find((item) => item.channel === 'modelBinary')!;
  if (options.modelCacheState === 'hit') {
    modelChannel.status = 'cached';
    modelChannel.cacheState = 'hit';
  } else if (!modelChannel.cacheState || modelChannel.cacheState === 'hit') {
    modelChannel.cacheState = options.modelCacheState;
  }

  return {
    sceneId,
    modelId: config.modelId,
    overallStatus: overallStatus(channels),
    generatedAt: new Date().toISOString(),
    sourceProject: {
      id: 'ices-union-3d2',
      name: 'ICES-Union 3d2.0',
      role: '设备三维模型与运行数据资源平台',
      service: 'three-model-api',
      baseUrl: options.upstreamBaseUrl,
      modelName: config.expectedRemoteName,
      detailUrl: config.sourceDetailUrl,
    },
    connector: {
      type: 'BFF',
      name: '模型数据安全接入服务',
      transport: 'HTTP REST',
      role: '负责核准设备接入、资源校验、快速复用与服务异常保护',
      modelCache: options.modelCacheState,
      security: ['仅接入已核准设备', '隐藏资源存储地址', '校验三维模型格式', '限制超大资源文件'],
    },
    targetProject: {
      id: 'industrial-intelligent-cockpit',
      name: '工业智能驾驶舱',
      role: '设备仿真、运行监测、健康评估、故障预警与分析报告应用',
    },
    channels,
    provenance: {
      upstream: ['设备三维模型', '设备基础信息', '实时运行快照', '典型工况数据', '运行数据一致性校验'],
      localDerived: ['安全接入与资源校验', '资源快速复用', '运行趋势整理', '范围参数动态演示', '健康评估与故障预警', '设备分析报告'],
    },
    modelRefresh: options.modelRefresh,
  };
}
