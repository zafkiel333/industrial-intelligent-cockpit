import assert from 'node:assert/strict';
import { MODEL_SHOWCASE_SCENE_IDS } from '../src/remoteModelShowcase/modelCatalog';

const baseUrl = (process.env.APP_API_URL || 'http://127.0.0.1:3102').replace(/\/$/, '');
const allowedHosts = new Set(['127.0.0.1', 'localhost', '47.122.104.52']);
const target = new URL(baseUrl);
assert.ok(allowedHosts.has(target.hostname), `Refusing to provision unexpected host: ${target.hostname}`);

const hydroSceneId = 'sim-visual-hydro-turbine';
const failures: string[] = [];
let overviewCount = 0;
let logCount = 0;
let pairedDatasetCount = 0;
let downloadedBytes = 0;

async function readJson(pathname: string): Promise<any> {
  const response = await fetch(`${baseUrl}${pathname}`);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

for (const sceneId of MODEL_SHOWCASE_SCENE_IDS) {
  try {
    const encodedSceneId = encodeURIComponent(sceneId);
    const overview = await readJson(`/api/model-showcase/${encodedSceneId}/data/overview`);
    assert.equal(overview.profile?.fields?.length ?? Object.keys(overview.fields || {}).length, 6);
    overviewCount += 1;

    const logs = await readJson(`/api/model-showcase/${encodedSceneId}/data/forecast/logs/scene`);
    assert.ok(Array.isArray(logs.entries) && logs.entries.length >= 7);
    logCount += logs.entries.length;

    if (sceneId !== hydroSceneId) {
      const response = await fetch(`${baseUrl}/api/model-showcase/${encodedSceneId}/data/validation/datasets`);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const archive = await response.arrayBuffer();
      assert.ok(archive.byteLength > 4_000);
      pairedDatasetCount += 3;
      downloadedBytes += archive.byteLength;
    }
  } catch (error) {
    failures.push(`${sceneId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

assert.deepEqual(failures, []);
console.log('MODEL_OPERATIONAL_DATA_PROVISIONED', JSON.stringify({
  baseUrl,
  scenes: MODEL_SHOWCASE_SCENE_IDS.length,
  overviewCount,
  logCount,
  pairedDatasetCount,
  downloadedBytes,
}));
