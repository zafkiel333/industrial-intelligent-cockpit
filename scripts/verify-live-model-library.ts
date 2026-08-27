import { PAGE_MODEL_BINDINGS } from '../src/remoteModelShowcase/pageModelBindings';

const baseUrl = (process.env.MODEL_LIBRARY_VERIFY_BASE_URL || 'http://127.0.0.1:3000/api').replace(/\/$/, '');
const concurrency = 4;
const failures: string[] = [];
let cursor = 0;

async function fetchWithRetry(url: string, attempts = 3): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 160)}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 800));
  }
  throw lastError;
}

async function worker(): Promise<void> {
  while (cursor < PAGE_MODEL_BINDINGS.length) {
    const binding = PAGE_MODEL_BINDINGS[cursor++];
    try {
      const response = await fetchWithRetry(`${baseUrl}/model-showcase/${binding.viewId}/bootstrap`);
      const payload = await response.json() as {
        modelId?: number;
        model?: { format?: string; fileSize?: number };
        dashboard?: { bindable_fields?: unknown[] };
      };
      const fieldCount = payload.dashboard?.bindable_fields?.length || 0;
      if (payload.modelId !== binding.modelId) throw new Error(`modelId=${payload.modelId}`);
      if (!['fbx', 'glb', 'gltf'].includes(payload.model?.format || '')) throw new Error(`format=${payload.model?.format}`);
      if (!payload.model?.fileSize || payload.model.fileSize > 50 * 1024 * 1024) throw new Error(`fileSize=${payload.model?.fileSize}`);
      if (fieldCount < 4 || fieldCount > 6) throw new Error(`dashboardFields=${fieldCount}`);
    } catch (error) {
      failures.push(`${binding.viewId}/${binding.modelId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

if (failures.length > 0) {
  console.error(failures.join('\n'));
  throw new Error(`MODEL_LIBRARY_LIVE_VERIFY_FAILED failures=${failures.length}`);
}

console.log(`MODEL_LIBRARY_LIVE_VERIFY_OK bindings=${PAGE_MODEL_BINDINGS.length} base=${baseUrl}`);
