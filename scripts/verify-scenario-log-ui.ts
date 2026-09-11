import assert from 'node:assert/strict';
import express from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { MODEL_SHOWCASE_SCENE_IDS, isModelShowcaseSceneId } from '../src/remoteModelShowcase/modelCatalog';
import { registerPilotDataRoutes } from '../src/remoteModelShowcase/pilotDataService';
import { SCENARIO_REGISTRY } from '../src/scenarioLib/scenarioRegistry';

const dataDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'scene-log-ui-'));
const app = express();
app.use((req, _res, next) => {
  req.url = req.url.replace(/^\/scene-library-api\//, '/api/');
  next();
});
app.use(express.json({ limit: '5mb' }));
registerPilotDataRoutes(app, dataDirectory);
app.use('/cockpit', express.static(path.join(process.cwd(), 'dist-standalone')));
app.get('/cockpit/*splat', (_req, res) => res.sendFile(path.join(process.cwd(), 'dist-standalone', 'index.html')));

const server = app.listen(0, '127.0.0.1');
await new Promise<void>(resolve => server.once('listening', resolve));
const address = server.address();
assert(address && typeof address !== 'string');
const appUrl = `http://127.0.0.1:${address.port}/cockpit/`;
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
const pageErrors: string[] = [];
const staticLayoutScreenshot = path.join(os.tmpdir(), 'scene-log-static-layout-fixed.png');
page.on('pageerror', error => pageErrors.push(error.message));

const categorySamples = [...new Map(
  SCENARIO_REGISTRY
    .filter(entry => !isModelShowcaseSceneId(entry.id))
    .map(entry => [entry.categoryName, entry] as const),
).values()];
assert.equal(categorySamples.length, 20, '应覆盖 20 个场景库一级分类');

async function verifyLogPanel(sceneId: string, expectedCategory?: string) {
  const response = await page.goto(`${appUrl}?embedded=1&viewId=${encodeURIComponent(sceneId)}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  assert(response?.ok(), `${sceneId} 页面状态异常：${response?.status()}`);
  const button = page.getByRole('button', { name: '场景日志（34）', exact: true });
  await button.waitFor({ timeout: 20_000 });
  await button.click();
  const panel = page.locator('.scene-business-log');
  await panel.waitFor({ timeout: 10_000 });
  assert.equal(await panel.locator('.platform-business-log-row').count(), 34, `${sceneId} 日志展示数量`);
  assert.equal((await panel.locator('.platform-log-level').first().textContent())?.trim(), '正常', `${sceneId} 最新状态`);
  assert.equal(await panel.evaluate(element => element.scrollHeight > element.clientHeight), true, `${sceneId} 长日志应在面板内滚动`);
  const firstRowLayout = await panel.locator('.platform-business-log-row').first().evaluate(row => {
    const paragraph = row.querySelector('p');
    const rowBox = row.getBoundingClientRect();
    const paragraphBox = paragraph?.getBoundingClientRect();
    return { rowWidth: rowBox.width, paragraphWidth: paragraphBox?.width || 0 };
  });
  assert.ok(firstRowLayout.paragraphWidth >= firstRowLayout.rowWidth * 0.55, `${sceneId} 日志正文列宽不足`);
  assert.equal(await panel.locator(`.platform-business-log-row.${expectedCategory ? 'is-static' : 'has-category'}`).count(), 34, `${sceneId} 日志列结构`);
  if (sceneId === 'ia-transport-connect') await panel.screenshot({ path: staticLayoutScreenshot });
  const text = await panel.innerText();
  assert.ok(!/(?:捏造|糊弄|AI生成|会话交接|上游端点|不再返回有效|模拟数据|演示数据)/i.test(text), `${sceneId} 公开文案`);
  if (expectedCategory) assert.ok(text.length > expectedCategory.length * 10, `${sceneId} ${expectedCategory} 日志内容不足`);
}

try {
  for (const entry of categorySamples) await verifyLogPanel(entry.id, entry.categoryName);
  if (!categorySamples.some(entry => entry.id === 'ia-transport-connect')) await verifyLogPanel('ia-transport-connect', '指标分析');
  const remoteSamples = [MODEL_SHOWCASE_SCENE_IDS[0], MODEL_SHOWCASE_SCENE_IDS[Math.floor(MODEL_SHOWCASE_SCENE_IDS.length / 2)], MODEL_SHOWCASE_SCENE_IDS.at(-1)!];
  for (const sceneId of remoteSamples) await verifyLogPanel(sceneId);
  assert.deepEqual(pageErrors, [], `页面脚本错误：${pageErrors.join(' | ')}`);
  console.log('SCENARIO_LOG_UI_OK', JSON.stringify({ appUrl, categorySamples: categorySamples.length, targetStaticPage: 'ia-transport-connect', modelSamples: remoteSamples.length, rowsPerPage: 34, staticLayoutScreenshot }));
} finally {
  await browser.close();
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  fs.rmSync(dataDirectory, { recursive: true, force: true });
}
