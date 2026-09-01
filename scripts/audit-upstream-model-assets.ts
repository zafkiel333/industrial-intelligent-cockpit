import { MODEL_SHOWCASE_CATALOG } from '../src/remoteModelShowcase/modelCatalog';

const apiBase = (process.env.VISUAL_MODEL_API_BASE_URL
  || 'https://8.146.211.204:3100/three-model-api').replace(/\/$/, '');
const maxBytes = 50 * 1024 * 1024;
const concurrency = Math.max(1, Math.min(6, Number(process.env.MODEL_ASSET_AUDIT_CONCURRENCY || 3)));

interface Envelope<T> {
  code: number | string;
  data: T;
  message?: string;
}

interface ModelFile {
  file_name: string;
  file_url: string;
  file_size?: number;
}

interface ModelMetadata {
  model_id: number;
  model_name: string;
  model_file?: ModelFile[];
}

interface ModelFileList {
  file_list?: ModelFile[];
}

type Format = 'fbx' | 'glb' | 'gltf';

interface AuditResult {
  sceneId: string;
  modelId: number;
  modelName: string;
  format: Format | null;
  fileSize: number;
  status: 'valid' | 'invalid' | 'too-large' | 'missing' | 'unavailable';
  reason: string;
}

async function getJson<T>(pathname: string): Promise<T> {
  const response = await fetch(`${apiBase}${pathname}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15_000),
  });
  const payload = await response.json() as Envelope<T>;
  if (!response.ok || Number(payload.code) !== 200) {
    throw new Error(payload.message || `HTTP ${response.status}`);
  }
  return payload.data;
}

function formatOf(fileName: string): Format | null {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension === 'fbx' || extension === 'glb' || extension === 'gltf' ? extension : null;
}

function chooseFile(files: ModelFile[]): { file: ModelFile; format: Format } | null {
  for (const format of ['glb', 'gltf', 'fbx'] as const) {
    const file = files.find((candidate) => formatOf(candidate.file_name) === format);
    if (file) return { file, format };
  }
  return null;
}

function validatePrefix(format: Format, bytes: Uint8Array): boolean {
  const header = new TextDecoder('ascii').decode(bytes.subarray(0, 32));
  if (format === 'fbx') return header.startsWith('Kaydara FBX Binary') || header.trimStart().startsWith('; FBX');
  if (format === 'glb') return header.slice(0, 4) === 'glTF';
  return header.trimStart().startsWith('{');
}

async function inspectPrefix(file: ModelFile, format: Format): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(
      `${apiBase}/api/v1/three-model/models/files?file_url=${encodeURIComponent(file.file_url)}`,
      { signal: controller.signal, headers: { Accept: 'application/octet-stream' } },
    );
    if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);
    const reader = response.body.getReader();
    const first = await reader.read();
    await reader.cancel('prefix audit complete');
    return Boolean(first.value && validatePrefix(format, first.value));
  } finally {
    clearTimeout(timer);
  }
}

async function audit(sceneId: string, modelId: number, expectedName: string): Promise<AuditResult> {
  try {
    const metadata = await getJson<ModelMetadata>(`/api/v1/three-model/models?model_id=${modelId}`);
    let files = Array.isArray(metadata.model_file) ? metadata.model_file : [];
    if (files.length === 0) {
      const listed = await getJson<ModelFileList>(`/api/v1/three-model/models/files?model_id=${modelId}`);
      files = Array.isArray(listed.file_list) ? listed.file_list : [];
    }
    const selected = chooseFile(files);
    if (!selected) {
      return { sceneId, modelId, modelName: metadata.model_name || expectedName, format: null, fileSize: 0, status: 'missing', reason: 'no supported model file' };
    }
    const fileSize = Number(selected.file.file_size || 0);
    if (fileSize > maxBytes) {
      return { sceneId, modelId, modelName: metadata.model_name || expectedName, format: selected.format, fileSize, status: 'too-large', reason: 'exceeds 50 MiB limit' };
    }
    const valid = await inspectPrefix(selected.file, selected.format);
    return {
      sceneId,
      modelId,
      modelName: metadata.model_name || expectedName,
      format: selected.format,
      fileSize,
      status: valid ? 'valid' : 'invalid',
      reason: valid ? 'validated model prefix' : `remote endpoint did not return a valid ${selected.format.toUpperCase()} prefix`,
    };
  } catch (error) {
    return {
      sceneId,
      modelId,
      modelName: expectedName,
      format: null,
      fileSize: 0,
      status: 'unavailable',
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

const entries = Object.values(MODEL_SHOWCASE_CATALOG);
const results: AuditResult[] = [];
let cursor = 0;

async function worker(): Promise<void> {
  while (cursor < entries.length) {
    const config = entries[cursor++];
    results.push(await audit(config.sceneId, config.modelId, config.expectedRemoteName));
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
results.sort((left, right) => left.sceneId.localeCompare(right.sceneId));

const failures = results.filter((result) => result.status !== 'valid');
failures.forEach((result) => {
  console.error(`${result.sceneId}/${result.modelId} status=${result.status} bytes=${result.fileSize} reason=${result.reason}`);
});

const valid = results.length - failures.length;
console.log(`UPSTREAM_MODEL_ASSET_AUDIT total=${results.length} valid=${valid} failures=${failures.length} concurrency=${concurrency}`);
if (failures.length > 0) process.exitCode = 1;
