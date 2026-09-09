import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.APP_URL || 'http://127.0.0.1:3000/';
const api = `${baseUrl.replace(/\/$/, '')}/api/model-showcase/sim-visual-hydro-turbine/data/validation`;
const caseId = 'HT-01';
const dataset = path.join(process.cwd(), 'src', 'data', 'model-showcase', 'sim-visual-hydro-turbine__model-2326', 'reference', 'forecast-validation', caseId);
const shotRoot = path.join(os.tmpdir(), 'cockpit-hydro-validation-shots');
fs.mkdirSync(shotRoot, { recursive: true });

await fetch(`${api}/cases/${caseId}`, { method: 'DELETE' });
const browser = await chromium.launch({ headless: true });
try {
  const desktop = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  const page = await desktop.newPage();
  await page.goto(`${baseUrl}?embedded=1&viewId=sim-visual-hydro-turbine`, { waitUntil: 'domcontentloaded' });
  const workbench = page.getByRole('region', { name: '水轮机预测验证工作台' });
  await workbench.waitFor({ timeout: 45_000 });
  await page.getByRole('heading', { name: '水轮机时序预测与结论核验' }).waitFor();
  await page.waitForFunction(() => document.querySelectorAll('.hydro-case-list > button').length === 50, undefined, { timeout: 45_000 });
  if (await workbench.locator('.hydro-case-list > button').count() !== 50) throw new Error('工况索引未显示完整 50 组');

  const stages = workbench.locator('.hydro-upload-stage');
  await stages.nth(0).locator('input[type=file]').setInputFiles(path.join(dataset, `${caseId}-观测数据.csv`));
  await stages.nth(0).getByRole('button', { name: '解析并生成预测' }).click();
  await workbench.getByText(`${caseId} 观测数据已解析，预测结论已经冻结。`).waitFor({ timeout: 45_000 });
  await workbench.getByText('预测已冻结', { exact: true }).waitFor();

  await stages.nth(1).locator('input[type=file]').setInputFiles(path.join(dataset, `${caseId}-验证数据.csv`));
  await stages.nth(1).getByRole('button', { name: '核验并记录结果' }).click();
  await workbench.getByText(`${caseId} 验证完成，误差与结论核验结果已计入累计统计。`).waitFor({ timeout: 45_000 });
  await workbench.getByText('结论一致', { exact: true }).waitFor();
  if (await workbench.locator('.hydro-validation-chart path[stroke="#d66a2b"]').count() !== 6) throw new Error('六项后续实测对照线未完整呈现');
  if (await workbench.locator('.hydro-metric-table > div').count() !== 7) throw new Error('逐指标误差表不完整');
  if (await workbench.locator('.hydro-ledger-table > button').count() !== 50) throw new Error('验证台账未覆盖 50 组');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) throw new Error(`桌面页面横向溢出 ${overflow}px`);
  await workbench.screenshot({ path: path.join(shotRoot, 'hydro-validation-desktop.png') });
  await workbench.locator('.hydro-validation-chart').screenshot({ path: path.join(shotRoot, 'hydro-validation-chart.png') });
  await workbench.locator('.hydro-validation-ledger').screenshot({ path: path.join(shotRoot, 'hydro-validation-ledger.png') });

  await workbench.getByRole('button', { name: '删除本组记录' }).click();
  const dialog = page.getByRole('dialog', { name: `删除 ${caseId} 的验证记录？` });
  await dialog.waitFor();
  await dialog.getByRole('button', { name: '取消' }).click();
  await dialog.waitFor({ state: 'hidden' });
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(`${baseUrl}?embedded=1&viewId=sim-visual-hydro-turbine`, { waitUntil: 'domcontentloaded' });
  const mobileWorkbench = mobilePage.getByRole('region', { name: '水轮机预测验证工作台' });
  await mobileWorkbench.waitFor({ timeout: 45_000 });
  const mobileOverflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (mobileOverflow > 1) throw new Error(`移动页面横向溢出 ${mobileOverflow}px`);
  await mobilePage.getByRole('heading', { name: '水轮机时序预测与结论核验' }).scrollIntoViewIfNeeded();
  await mobilePage.screenshot({ path: path.join(shotRoot, 'hydro-validation-mobile.png'), fullPage: false });
  await mobile.close();

  console.log('HYDRO_VALIDATION_UI_OK', JSON.stringify({ desktopOverflow: overflow, mobileOverflow, screenshots: shotRoot }));
} finally {
  await browser.close();
  await fetch(`${api}/cases/${caseId}`, { method: 'DELETE' });
}
