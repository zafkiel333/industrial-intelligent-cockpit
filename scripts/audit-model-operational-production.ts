import assert from 'node:assert/strict';
import { MODEL_SHOWCASE_SCENE_IDS, getModelShowcaseConfig } from '../src/remoteModelShowcase/modelCatalog';

const baseUrl = (process.env.APP_API_URL || 'http://127.0.0.1:3102').replace(/\/$/, '');
const forbiddenText = /(?:AI(?:生成|完成)|捏造|糊弄|模拟数据|演示数据|上游端点|不再返回有效|会话交接|本次改造|bug|demo|test)/i;
const suspiciousDevice = /(?:demo|test|^1{6,}$)/i;
const issues: string[] = [];

async function json(pathname: string): Promise<any> {
  const response = await fetch(`${baseUrl}${pathname}`);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${pathname}`);
  return response.json();
}

for (const sceneId of MODEL_SHOWCASE_SCENE_IDS) {
  const config = getModelShowcaseConfig(sceneId)!;
  const encoded = encodeURIComponent(sceneId);
  const overview = await json(`/api/model-showcase/${encoded}/data/overview`);
  const logs = await json(`/api/model-showcase/${encoded}/data/forecast/logs/scene`);
  const publicText = [
    config.title,
    config.description,
    overview.profile?.familyLabel,
    overview.profile?.normalLog,
    overview.profile?.reviewTarget,
    ...(overview.profile?.fields || []).flatMap((field: any) => [field.label, field.part]),
    ...(overview.profile?.faultProfiles || []).flatMap((fault: any) => [fault.name, fault.part, fault.recommendation]),
    ...(logs.entries || []).flatMap((entry: any) => [entry.title, entry.message, entry.deviceId]),
  ].filter(Boolean).join(' ');
  if (forbiddenText.test(publicText)) issues.push(`${sceneId}: public wording`);
  for (const deviceId of overview.devices || []) {
    if (suspiciousDevice.test(String(deviceId))) issues.push(`${sceneId}: device ${deviceId}`);
  }
  for (const batch of overview.batches || []) {
    if (forbiddenText.test(String(batch.fileName || ''))) issues.push(`${sceneId}: batch ${batch.fileName}`);
  }
}

const uniqueIssues = [...new Set(issues)];
console.log('MODEL_OPERATIONAL_PRODUCTION_AUDIT', JSON.stringify({
  baseUrl,
  scenes: MODEL_SHOWCASE_SCENE_IDS.length,
  issues: uniqueIssues,
}, null, 2));
assert.deepEqual(uniqueIssues, []);
