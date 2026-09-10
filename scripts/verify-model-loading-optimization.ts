import { readFileSync } from 'node:fs';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`MODEL_LOADING_OPTIMIZATION_VERIFY_FAILED: ${message}`);
}

const viewer = readFileSync('components/remote-model-showcase/RemoteModelViewer.tsx', 'utf8');
const server = readFileSync('server.ts', 'utf8');

assert(viewer.includes('new AbortController()'), 'browser model request must be cancellable');
assert(viewer.includes('signal: controller.signal'), 'AbortController signal must reach fetch');
assert(viewer.includes('task.controller.abort()'), 'orphaned downloads must be aborted after page switch');
assert(viewer.includes('pendingForAsset'), 'an in-flight asset request must survive metadata/content version alias changes');
assert(viewer.includes('subscribers: Set<(progress: ModelLoadProgress) => void>'), 'shared tasks must broadcast byte progress');
assert(viewer.includes('subscriber(task.progress)'), 'a remounted viewer must immediately receive current progress');
assert(viewer.includes("cache: 'default'"), 'versioned browser responses must use the HTTP cache');
assert(!viewer.includes("cache: 'no-store'"), 'viewer must not force a full model transfer on every visit');
assert(viewer.includes("phase: 'preparing'"), 'server preparation phase is missing');
assert(viewer.includes("phase: 'downloading'"), 'byte download phase is missing');
assert(viewer.includes("phase: 'parsing'"), 'model parsing phase is missing');
assert(viewer.includes('MODEL_STREAM_STALL_TIMEOUT_MS'), 'stalled streams must have a watchdog');
assert(viewer.includes('MAX_RESOLVED_MODEL_BUFFERS = 3'), 'browser ArrayBuffer cache must retain the three primary smart-operations models');
assert(viewer.includes('MODEL_TASK_ABORT_GRACE_MS = 2_000'), 'page transitions must allow an in-flight model request to reconnect');
assert(viewer.includes('MAX_AUTOMATIC_MODEL_RETRIES = 2'), 'invalid upstream assets must not trigger endless browser retries');
assert(viewer.includes('renderer.forceContextLoss()'), 'unmounted viewers must release their WebGL context');
assert(server.includes('private, max-age=31536000, immutable'), 'versioned model responses must be browser-cacheable');
assert(!server.includes('res.setHeader("Cache-Control", "private, no-store")'), 'server must not disable the versioned model cache');
assert(server.includes('cachedModelMatchesAsset(cached, asset)'), 'a scene cache must be rejected when its configured model fingerprint changes');
assert(server.includes('MODEL_BINDING_CACHE_MISMATCH'), 'a failed replacement must not be disguised as the newly configured model');
const servableModelStart = server.indexOf('async function getServableModel');
const servableModelEnd = server.indexOf('function sendShowcaseError', servableModelStart);
const servableModelSource = server.slice(servableModelStart, servableModelEnd);
assert(servableModelSource.includes('cached?.modelId === config.modelId'), 'cached models must be checked against the configured binding');
assert(
  servableModelSource.indexOf('return cached;') < servableModelSource.indexOf('resolveModelAsset(sceneId)'),
  'a valid bound cache must be returned before waiting for upstream metadata',
);
assert(server.includes('dashboardRuntimeCache'), 'the last available dashboard must be retained for transient upstream failures');
assert(server.includes('dashboardRequests'), 'concurrent dashboard requests for one scene must be coalesced');
assert(server.includes('MODEL_DASHBOARD_TIMEOUT_MS'), 'dashboard loading must use a bounded responsiveness timeout');
const bootstrapStart = server.indexOf('app.get("/api/model-showcase/:sceneId/bootstrap"');
const bootstrapEnd = server.indexOf('app.get("/api/model-showcase/:sceneId/connection"', bootstrapStart);
const bootstrapSource = server.slice(bootstrapStart, bootstrapEnd);
assert(bootstrapSource.includes('const dashboard = dashboardFallback(sceneId)'), 'bootstrap must return the available dashboard without waiting for upstream data');
assert(bootstrapSource.includes('void fetchDashboard(sceneId)'), 'bootstrap must refresh dashboard data in the background');
assert(bootstrapSource.includes('description: config.description'), 'public page descriptions must come from the reviewed scene configuration');
assert(!bootstrapSource.includes('metadata.model_description || config.description'), 'upstream maintenance notes must not become public page descriptions');
assert(server.includes('modelMetadataRequests'), 'concurrent metadata requests for one scene must be coalesced');
assert(server.includes('MODEL_METADATA_FAILURE_BACKOFF_MS'), 'recent metadata failures must use a short retry backoff');
assert(server.includes('MODEL_METADATA_TIMEOUT_MS'), 'metadata loading must use a bounded responsiveness timeout');
assert(server.includes('process.env.MODEL_DOWNLOAD_TIMEOUT_MS || 20_000'), 'first model download must not block for the previous 60-second retry window');
assert(server.includes('process.env.MODEL_DOWNLOAD_ATTEMPTS || 1'), 'initial download retries must return control to the viewer between attempts');
assert(server.includes('MODEL_MEMORY_CACHE_MAX_BYTES'), 'server model buffers must have a byte budget');
assert(server.includes('MODEL_MEMORY_CACHE_MAX_ENTRIES'), 'server model buffers must have an entry budget');
assert(server.includes('pruneModelBinaryMemoryCache'), 'server model buffers must be evicted by LRU');
assert(server.includes('[...modelBinaryCache.keys()]'), 'scheduled refresh must inspect only resident models');
assert(!server.includes('Promise.all(MODEL_SHOWCASE_SCENE_IDS.map'), 'scheduled refresh must not load every persisted model into memory');

console.log('MODEL_LOADING_OPTIMIZATION_VERIFY_OK abort=grace-2s sharedProgress=enabled duplicateFetch=guarded dashboardFetch=coalesced bootstrap=nonblocking phases=3 browserCache=immutable browserBuffers=3 serverLru=bounded autoRetry=2 bindingCache=validated');
