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
assert(viewer.includes('MAX_RESOLVED_MODEL_BUFFERS = 3'), 'browser ArrayBuffer cache must remain bounded');
assert(server.includes('private, max-age=31536000, immutable'), 'versioned model responses must be browser-cacheable');
assert(!server.includes('res.setHeader("Cache-Control", "private, no-store")'), 'server must not disable the versioned model cache');
assert(server.includes('cachedModelMatchesAsset(cached, asset)'), 'a scene cache must be rejected when its configured model fingerprint changes');
assert(server.includes('MODEL_BINDING_CACHE_MISMATCH'), 'a failed replacement must not be disguised as the newly configured model');

console.log('MODEL_LOADING_OPTIMIZATION_VERIFY_OK abort=enabled sharedProgress=enabled duplicateFetch=guarded phases=3 browserCache=immutable memoryCache=3 bindingCache=validated');
