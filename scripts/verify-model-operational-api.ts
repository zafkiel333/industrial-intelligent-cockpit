import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import { MODEL_SHOWCASE_SCENE_IDS, getModelShowcaseConfig } from '../src/remoteModelShowcase/modelCatalog';
import { getModelOperationalProfile } from '../src/remoteModelShowcase/modelOperationalProfiles';
import { registerPilotDataRoutes } from '../src/remoteModelShowcase/pilotDataService';

const dataDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'model-operational-api-'));
const app = express();
app.use(express.json({ limit: '5mb' }));
registerPilotDataRoutes(app, dataDirectory);
const server = app.listen(0, '127.0.0.1');
await new Promise<void>((resolve) => server.once('listening', resolve));
const address = server.address();
assert(address && typeof address === 'object');
const origin = `http://127.0.0.1:${address.port}`;
const forbidden = /模拟数据|演示数据|捏造|AI|会话交接|上游端点|不再返回有效|文件头|缩略图|开发任务|本次改造/;
const familyRepresentative = new Map<string, string>();
let predictions = 0;
let seededLogs = 0;

async function json(url: string, body?: unknown) {
  const response = await fetch(`${origin}${url}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json();
  assert(response.ok, `${url}: ${response.status} ${JSON.stringify(payload)}`);
  return payload as any;
}

try {
  for (const sceneId of MODEL_SHOWCASE_SCENE_IDS) {
    const config = getModelShowcaseConfig(sceneId)!;
    const operational = getModelOperationalProfile(sceneId);
    if (sceneId !== 'sim-visual-hydro-turbine' && !familyRepresentative.has(operational.family)) {
      familyRepresentative.set(operational.family, sceneId);
    }
    const base = `/api/model-showcase/${sceneId}`;
    const overview = await json(`${base}/data/overview`);
    assert.equal(overview.sceneId, sceneId);
    assert.equal(overview.modelId, config.modelId);
    assert.equal(overview.fieldCount, 6);
    assert.equal(overview.profile.fields.length, 6);
    assert.equal(overview.profile.thresholdModel.version, operational.thresholdModel.version);
    assert.equal(overview.recordCount, 120);
    assert.equal(overview.devices.length, 1);

    const deviceId = overview.devices[0];
    const reference = await json(`${base}/data/forecast/reference?deviceId=${encodeURIComponent(deviceId)}`);
    assert.equal(reference.history.length, 120);
    const run = await json(`${base}/data/forecast/reference`, { deviceId });
    assert.equal(run.sceneId, sceneId);
    assert.equal(run.prediction.fields.length, 6);
    assert.equal(run.prediction.forecasts.length, operational.forecastSteps * 6);
    assert.equal(run.prediction.thresholdModelVersion, operational.thresholdModel.version);
    assert.ok(['normal', 'abnormal'].includes(run.prediction.tag));
    assert.ok(!forbidden.test(JSON.stringify(run.prediction)), `${sceneId} 预测结果出现不应面向用户的措辞`);
    predictions += 1;

    const sceneLogs = await json(`${base}/data/forecast/logs/scene`);
    assert.ok(sceneLogs.entries.length >= 34, `${sceneId} 场景日志数量不足`);
    const times = sceneLogs.entries.map((entry: any) => Date.parse(entry.timestamp)).filter(Number.isFinite).sort((a: number, b: number) => a - b);
    assert.ok(times.at(-1)! - times[0] >= 150 * 24 * 60 * 60 * 1000, `${sceneId} 场景日志时间跨度不足`);
    assert.ok(sceneLogs.entries.some((entry: any) => entry.category === 'prediction'), `${sceneId} 缺少预测业务日志`);
    assert.ok(sceneLogs.entries.some((entry: any) => entry.category === 'operation'), `${sceneId} 缺少运行业务日志`);
    assert.ok(sceneLogs.entries.some((entry: any) => entry.category === 'verification'), `${sceneId} 缺少实测核验业务日志`);
    assert.ok(sceneLogs.entries.filter((entry: any) => entry.level === 'critical').length <= 1, `${sceneId} 严重预警记录过多`);
    assert.ok(!forbidden.test(JSON.stringify(sceneLogs.entries)), `${sceneId} 场景日志出现不应面向用户的措辞`);
    seededLogs += sceneLogs.entries.length;
  }

  for (const [family, sceneId] of familyRepresentative) {
    const response = await fetch(`${origin}/api/model-showcase/${sceneId}/data/validation/datasets`);
    assert(response.ok, `${sceneId} 三套预测核验数据下载失败：${response.status}`);
    assert.match(response.headers.get('content-type') || '', /application\/zip/);
    assert.match(response.headers.get('content-disposition') || '', /\.zip/i);
    const content = await response.arrayBuffer();
    assert.ok(content.byteLength > 4_000, `${sceneId} 三套预测核验数据包内容不足`);
    assert.equal(new Uint8Array(content)[0], 0x50, `${sceneId} 下载内容不是 ZIP`);
    assert.equal(new Uint8Array(content)[1], 0x4b, `${sceneId} 下载内容不是 ZIP`);
    assert.ok(family.length > 0);
  }

  console.log('MODEL_OPERATIONAL_API_OK', JSON.stringify({
    scenes: MODEL_SHOWCASE_SCENE_IDS.length,
    predictions,
    seededLogs,
    datasetFamilies: familyRepresentative.size,
    dataDirectory,
  }));
} finally {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  fs.rmSync(dataDirectory, { recursive: true, force: true });
}
