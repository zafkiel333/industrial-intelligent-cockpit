import assert from 'node:assert/strict';
import { chromium, type Page } from 'playwright';
import { MODEL_SHOWCASE_SCENE_IDS, getModelShowcaseConfig } from '../src/remoteModelShowcase/modelCatalog';
import { getModelOperationalProfile } from '../src/remoteModelShowcase/modelOperationalProfiles';

const appUrl = process.env.APP_URL || 'http://127.0.0.1:3010/cockpit/';
const concurrency = Math.max(1, Math.min(4, Number(process.env.UI_AUDIT_CONCURRENCY || 3)));
const maxUiReadyMs = Number(process.env.MAX_UI_READY_MS || 15_000);
const requestedScenes = new Set((process.env.UI_AUDIT_SCENES || '').split(',').map(value => value.trim()).filter(Boolean));
const scenes = requestedScenes.size ? MODEL_SHOWCASE_SCENE_IDS.filter(sceneId => requestedScenes.has(sceneId)) : MODEL_SHOWCASE_SCENE_IDS;
const forbidden = /(?:捏造|糊弄|AI完成|会话交接|上游端点|不再返回有效|文件头、完整下载|DEMO|TEST)/i;
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const results: Array<{ sceneId: string; readyMs: number; modelReady: boolean }> = [];
const failures: string[] = [];
let nextIndex = 0;

async function audit(page: Page, sceneId: string) {
  const config = getModelShowcaseConfig(sceneId)!;
  const profile = getModelOperationalProfile(sceneId);
  const pageErrors: string[] = [];
  const onPageError = (error: Error) => pageErrors.push(error.message);
  page.on('pageerror', onPageError);
  const started = performance.now();
  try {
    const response = await page.goto(`${appUrl}?embedded=1&viewId=${encodeURIComponent(sceneId)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    assert(response?.ok(), `${sceneId}: page status ${response?.status()}`);
    await page.locator('.remote-model-showcase-header').waitFor({ timeout: maxUiReadyMs });
    await page.locator('.model-data-workspace').waitFor({ timeout: maxUiReadyMs });
    await page.waitForFunction(() => document.querySelectorAll('.hydro-measurements article').length === 6, null, { timeout: maxUiReadyMs });
    await page.waitForFunction(() => document.querySelectorAll('.hydro-metric-timeline').length === 6, null, { timeout: maxUiReadyMs });
    await page.waitForFunction(() => {
      const version = document.querySelector('.threshold-model-version strong')?.textContent?.trim();
      return Boolean(version && version !== '--');
    }, null, { timeout: maxUiReadyMs });
    const readyMs = Math.round(performance.now() - started);
    assert.ok(readyMs <= maxUiReadyMs, `${sceneId}: UI ready ${readyMs}ms`);
    assert.equal(await page.getByRole('button', { name: '导入历史数据', exact: true }).count(), 1, `${sceneId}: history import`);
    assert.equal(await page.getByRole('button', { name: '导入验证数据', exact: true }).count(), 1, `${sceneId}: verification import`);
    assert.equal(await page.getByRole('button', { name: '数据管理', exact: true }).count(), 1, `${sceneId}: data manager`);
    assert.equal(await page.locator('.hydro-measurements article').count(), profile.fields.length, `${sceneId}: metric cards`);
    assert.equal(await page.locator('.hydro-metric-timeline').count(), profile.fields.length, `${sceneId}: metric charts`);
    assert.equal((await page.locator('.threshold-model-version strong').textContent())?.trim(), profile.thresholdModel.version, `${sceneId}: threshold version`);
    const headerText = await page.locator('.remote-model-showcase-header').innerText();
    assert.ok(headerText.includes(config.title), `${sceneId}: expected title "${config.title}"; header "${headerText.split('\n').slice(0, 12).join(' / ')}"`);
    const pageText = await page.locator('.remote-model-showcase-page').innerText();
    assert.ok(!forbidden.test(pageText), `${sceneId}: public wording`);
    for (const field of profile.fields) assert.ok(pageText.includes(field.label), `${sceneId}: missing ${field.label}`);
    assert.deepEqual(pageErrors, [], `${sceneId}: page errors ${pageErrors.join(' | ')}`);
    const modelReady = await page.locator('.remote-model-viewer[data-model-ready="true"]').count() > 0;
    results.push({ sceneId, readyMs, modelReady });
  } finally {
    page.off('pageerror', onPageError);
  }
}

async function worker() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  try {
    while (true) {
      const index = nextIndex++;
      if (index >= scenes.length) break;
      const sceneId = scenes[index];
      try {
        await audit(page, sceneId);
      } catch (error) {
        failures.push(`${sceneId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } finally {
    await page.close();
  }
}

try {
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
} finally {
  await browser.close();
}

results.sort((a, b) => b.readyMs - a.readyMs);
if (failures.length) console.error('MODEL_OPERATIONAL_UI_ALL_FAILURES', JSON.stringify(failures, null, 2));
assert.deepEqual(failures, [], `Full UI audit failures:\n${failures.join('\n')}`);
assert.equal(results.length, scenes.length);
console.log('MODEL_OPERATIONAL_UI_ALL_OK', JSON.stringify({
  appUrl,
  scenes: results.length,
  concurrency,
  modelReadyAtUiCheck: results.filter(result => result.modelReady).length,
  slowest: results.slice(0, 10),
}));
