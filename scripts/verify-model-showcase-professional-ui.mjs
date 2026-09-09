import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.APP_URL || 'http://127.0.0.1:3000/';
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const scenes = ['eq-0', 'eq-5', 'eq-7', 'eq-15', 'eq-unit1-model', 'turbine-blade-erosion'];
const forbidden = /替换上游端点|不再返回有效|文件头|完整下载|缩略图|替换运行时近黑|模拟 Dashboard|不得复用|不虚构|不冒充|开发时|页面改为|删除模型不能支撑|模型资源请求失败|模型解析或渲染失败|Remote endpoint|Remote model|服务异常（|原因：|vunavaila|0\.0 MB|页面渲染耗时\(模拟\)|实时数据暂不可用|资源暂不可用/;
const errors = [];
const results = [];
const browser = await chromium.launch({ headless: true, executablePath: chromePath });

try {
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, locale: 'zh-CN' });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().startsWith('Failed to load resource:')) {
      errors.push(`console: ${message.text()}`);
    }
    if (message.type() === 'warning' && /width\(-1\)|height\(-1\)/.test(message.text())) {
      errors.push(`chart layout: ${message.text()}`);
    }
  });

  for (const sceneId of scenes) {
    const startedAt = Date.now();
    await page.goto(`${baseUrl}?embedded=1&viewId=${sceneId}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.locator('.remote-model-showcase-header h1').waitFor({ timeout: 20_000 });
    const headerText = await page.locator('.remote-model-showcase-header').innerText();
    const visibleText = await page.locator('body').innerText();
    if (forbidden.test(visibleText)) throw new Error(`${sceneId}: 页面仍显示内部实现或原始故障措辞`);
    if (!/运行数据已连接|运行数据同步中/.test(headerText)) throw new Error(`${sceneId}: 缺少业务化数据状态`);
    results.push(`${sceneId}=${Date.now() - startedAt}ms`);
  }

  await page.screenshot({ path: path.join(os.tmpdir(), 'model-showcase-professional-ui.png'), fullPage: false });
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`MODEL_SHOWCASE_PROFESSIONAL_UI_OK ${results.join(' ')}`);
} finally {
  await browser.close();
}
