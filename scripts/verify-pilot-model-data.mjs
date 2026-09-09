import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import os from 'os';

const baseUrl = process.env.PILOT_UI_BASE_URL || 'http://127.0.0.1:4176/';
const readOnly = process.env.PILOT_VERIFY_READ_ONLY === '1';
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const samplePath = process.env.PILOT_SAMPLE_PATH || path.join(os.tmpdir(), 'cockpit-pilot-api-artifacts', 'samples', 'sim-visual-hydro-turbine-sample.csv');
const screenshotDir = process.env.PILOT_SCREENSHOT_DIR || '';
const sclTestPath = path.join(os.tmpdir(), 'cockpit-pilot-test.cid');
fs.writeFileSync(sclTestPath, '<?xml version="1.0" encoding="UTF-8"?><SCL xmlns="http://www.iec.ch/61850/2003/SCL"><IED name="TEST_IED"><AccessPoint name="S1"><Server><LDevice inst="LD0"><LN0 lnClass="LLN0" inst=""><DOI name="Mod"><DAI name="stVal"/></DOI></LN0></LDevice></Server></AccessPoint></IED></SCL>');
const sceneIds = [
  'sim-visual-hydro-turbine',
  'sim-visual-wastewater-pump',
  'sim-visual-bridge-crane',
  'sim-visual-haul-truck',
];
const sceneNames = {
  'sim-visual-hydro-turbine': '2326-水轮机多工况数字孪生分析',
  'sim-visual-wastewater-pump': '2328-污水泵运行效能与故障分析',
  'sim-visual-bridge-crane': '2316-桥式起重机载荷安全数字孪生分析',
  'sim-visual-haul-truck': '2310-矿卡牵引运输状态与故障分析',
};
const downloadExpectations = [
  { label: '数据规范', formats: ['pdf', 'docx', 'json'], testFormat: 'docx', fileLabel: '数据规范' },
  { label: '数据样例', formats: ['csv', 'xlsx', 'json', 'zip'], testFormat: 'csv', fileLabel: '数据样例' },
  { label: '预测结果', formats: ['csv', 'xlsx', 'json'], testFormat: 'json', fileLabel: '预测结果' },
  { label: '分析报告', formats: ['pdf', 'docx', 'json'], testFormat: 'docx', fileLabel: '分析报告' },
];

const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const errors = [];
if (screenshotDir) fs.mkdirSync(screenshotDir, { recursive: true });

try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, locale: 'zh-CN' });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(`${viewport.width}px pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error' && !message.text().startsWith('Failed to load resource:')) errors.push(`${viewport.width}px console: ${message.text()}`);
    });
    page.on('response', (response) => {
      if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) errors.push(`${viewport.width}px HTTP ${response.status()}: ${response.url()}`);
    });

    for (const sceneId of sceneIds) {
      console.log('PILOT_UI_CHECK', `${viewport.width}px`, sceneId);
      await page.goto(`${baseUrl}?embedded=1&viewId=${sceneId}`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('heading', { name: '数据与文件管理' }).waitFor({ timeout: 45_000 });
      await page.getByRole('heading', { name: '预测数据', exact: true }).waitFor();
      for (const removed of ['正常运行', '高负荷', '故障演练']) {
        if (await page.getByRole('button', { name: removed, exact: true }).count()) throw new Error(`${sceneId}: 已删除的“${removed}”按钮仍存在`);
      }
      for (const heading of ['实测数据', '预测结论', '预警', '预警部位']) {
        if (await page.getByRole('heading', { name: heading, exact: true }).count() !== 1) throw new Error(`${sceneId}: 缺少“${heading}”区块`);
      }
      if (screenshotDir && sceneId === sceneIds[0]) {
        await page.getByRole('heading', { name: '实测数据与长周期预测' }).evaluate((element) => element.scrollIntoView({ block: 'start' }));
        await page.waitForTimeout(150);
        await page.screenshot({ path: path.join(screenshotDir, `workspace-viewport-${viewport.width}.png`) });
        await page.locator('.model-data-workspace').screenshot({ path: path.join(screenshotDir, `workspace-${viewport.width}.png`) });
      }
      for (const label of ['数据规范', '数据样例', '预测结果', '分析报告', '上传数据']) {
        if (await page.getByRole('button', { name: label }).count() !== 1) throw new Error(`${sceneId}: 缺少“${label}”按钮`);
      }
      for (const expected of downloadExpectations) {
        await page.getByRole('button', { name: expected.label }).click();
        const dialog = page.getByRole('dialog', { name: `下载${expected.label}` });
        await dialog.waitFor();
        if (screenshotDir && sceneId === sceneIds[0] && expected.label === '数据样例') {
          await page.screenshot({ path: path.join(screenshotDir, `download-dialog-${viewport.width}.png`) });
        }
        const downloadDeviceId = await dialog.locator('input[list^="download-devices-"]').inputValue();
        const expectedDeviceId = `${sceneNames[sceneId].split('-')[0]}-01`;
        if (downloadDeviceId !== expectedDeviceId) throw new Error(`${sceneId}: 下载设备 ID 期望 ${expectedDeviceId}，实际 ${downloadDeviceId}`);
        if (expected.label === '数据样例') {
          const sampleSources = await dialog.locator('[data-source]').evaluateAll((options) => options.map((option) => option.getAttribute('data-source')));
          if (sampleSources.join(',') !== 'standard,modbus,iec61850') throw new Error(`${sceneId}: 样例来源选项不完整，实际为 ${sampleSources.join(',')}`);
          await dialog.locator('[data-source="iec61850"]').click();
          if (!await dialog.locator('.model-data-file-preview code').innerText().then((name) => name.includes('IEC61850数据样例'))) throw new Error(`${sceneId}: IEC 61850 样例文件名未同步`);
          await dialog.locator('[data-source="standard"]').click();
        }
        const formatOptions = dialog.locator('[data-format]');
        const formats = await formatOptions.evaluateAll((options) => options.map((option) => option.getAttribute('data-format')));
        if (formats.join(',') !== expected.formats.join(',')) throw new Error(`${sceneId}: ${expected.label}格式不完整，实际为 ${formats.join(',')}`);
        for (const format of expected.formats) {
          const optionText = await dialog.locator(`[data-format="${format}"]`).innerText();
          if (!optionText.includes(`.${format}`)) throw new Error(`${sceneId}: ${expected.label}的 ${format} 选项未直观标明后缀`);
        }
        if (viewport.width === 1440) {
          const selectedOption = dialog.locator(`[data-format="${expected.testFormat}"]`);
          await selectedOption.click();
          if (await selectedOption.getAttribute('aria-checked') !== 'true') throw new Error(`${sceneId}: ${expected.testFormat} 格式未正确选中`);
          const expectedName = `${sceneNames[sceneId]}-设备ID-${expectedDeviceId}-${expected.fileLabel}.${expected.testFormat}`;
          const previewName = await dialog.locator('.model-data-file-preview code').innerText();
          if (previewName !== expectedName) throw new Error(`${sceneId}: 文件名预览错误，期望 ${expectedName}，实际 ${previewName}`);
          const [download] = await Promise.all([
            page.waitForEvent('download'),
            dialog.getByRole('button', { name: '下载', exact: true }).click(),
          ]);
          if (download.suggestedFilename() !== expectedName) throw new Error(`${sceneId}: 下载文件名错误，期望 ${expectedName}，实际 ${download.suggestedFilename()}`);
        } else {
          await dialog.getByTitle('关闭').click();
        }
        await dialog.waitFor({ state: 'hidden' });
      }
      await page.getByRole('button', { name: '上传数据' }).click();
      const uploadDialog = page.getByRole('dialog', { name: '上传设备数据' });
      await uploadDialog.waitFor();
      const uploadSources = await uploadDialog.locator('[data-source]').evaluateAll((options) => options.map((option) => option.getAttribute('data-source')));
      if (uploadSources.join(',') !== 'standard,modbus,iec61850') throw new Error(`${sceneId}: 数据来源选项不完整，实际为 ${uploadSources.join(',')}`);
      await uploadDialog.locator('[data-source="modbus"]').click();
      if (!await uploadDialog.getByText('Modbus 运行数据文件', { exact: true }).count()) throw new Error(`${sceneId}: Modbus 文件入口未显示`);
      await uploadDialog.locator('[data-source="iec61850"]').click();
      const sclInput = uploadDialog.locator('input[accept*=".cid"]');
      await sclInput.setInputFiles(sclTestPath);
      await uploadDialog.locator('.model-data-scl-summary').waitFor();
      if (!await uploadDialog.locator('.model-data-scl-summary').innerText().then((text) => text.includes('1 个 IED') && text.includes('1 个逻辑设备') && text.includes('将保存到当前模型目录'))) throw new Error(`${sceneId}: SCL 点位模型摘要错误`);
      await uploadDialog.locator('[data-source="standard"]').click();
      const expectedDeviceId = `${sceneNames[sceneId].split('-')[0]}-01`;
      const existingDeviceSelect = uploadDialog.getByLabel('上传已有设备');
      const existingDevices = await existingDeviceSelect.locator('option').evaluateAll((options) => options.map((option) => option.value));
      if (!existingDevices.includes(expectedDeviceId)) throw new Error(`${sceneId}: 已有设备下拉框缺少 ${expectedDeviceId}`);
      if (await existingDeviceSelect.inputValue() !== expectedDeviceId) throw new Error(`${sceneId}: 上传弹窗未默认选择 ${expectedDeviceId}`);
      await uploadDialog.getByRole('button', { name: '新增设备' }).click();
      const newDeviceInput = uploadDialog.getByPlaceholder(`例如 ${sceneNames[sceneId].split('-')[0]}-NEW-01`);
      await newDeviceInput.fill(expectedDeviceId);
      await uploadDialog.locator('.model-data-field-error').waitFor();
      if (await newDeviceInput.getAttribute('aria-invalid') !== 'true') throw new Error(`${sceneId}: 重复设备 ID 未标记为无效`);
      if (!await uploadDialog.getByRole('button', { name: '覆盖该设备' }).isDisabled()) throw new Error(`${sceneId}: 新增设备时仍可选择覆盖`);
      if (await uploadDialog.locator('select').count()) throw new Error(`${sceneId}: 新增设备时仍显示仅适用于已有设备的选择项`);
      await uploadDialog.getByRole('button', { name: '已有设备' }).click();
      await existingDeviceSelect.waitFor();
      if (await newDeviceInput.count()) throw new Error(`${sceneId}: 切回已有设备后仍显示新设备输入框`);
      await uploadDialog.getByTitle('关闭').click();
      await uploadDialog.waitFor({ state: 'hidden' });
      const visibleText = await page.locator('body').innerText();
      if (/模拟|仿真/.test(visibleText)) throw new Error(`${sceneId}: 页面仍包含“模拟/仿真”可见文字`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 1) throw new Error(`${sceneId}: 页面横向溢出 ${overflow}px`);
    }

    if (viewport.width === 1440 && !readOnly) {
      await page.goto(`${baseUrl}?embedded=1&viewId=sim-visual-hydro-turbine`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('heading', { name: '数据与文件管理' }).waitFor({ timeout: 45_000 });
      await page.getByRole('button', { name: '上传数据' }).click();
      const uploadDialog = page.getByRole('dialog', { name: '上传设备数据' });
      await uploadDialog.waitFor();
      await uploadDialog.getByRole('button', { name: '新增设备' }).click();
      const testDeviceId = `2326-UI-${Date.now()}`;
      await page.getByPlaceholder('例如 2326-NEW-01').fill(testDeviceId);
      await page.locator('input[type=file]').setInputFiles(samplePath);
      await page.getByRole('button', { name: '解析并预览' }).click();
      await page.getByRole('region', { name: '导入预检结果' }).waitFor({ timeout: 45_000 });
      if (!await page.getByText('导入预检通过', { exact: true }).count()) throw new Error('普通数据未显示导入预检结果');
      await page.screenshot({ path: path.join(os.tmpdir(), 'cockpit-pilot-ui-shots', 'upload-preview-dialog.png') });
      await page.getByRole('button', { name: '确认导入' }).click();
      await page.getByRole('dialog').waitFor({ state: 'hidden', timeout: 45_000 });
      await page.getByRole('cell', { name: testDeviceId, exact: true }).first().waitFor();
      const dashboardFilters = page.locator('.pilot-dashboard-filters select');
      await page.waitForFunction((expected) => document.querySelector('.pilot-dashboard-filters select')?.value === expected, testDeviceId);
      if (await dashboardFilters.nth(0).inputValue() !== testDeviceId) throw new Error('上传后未定位到新设备');
      await page.waitForFunction(() => Boolean(document.querySelectorAll('.pilot-dashboard-filters select')[1]?.value));
      if (!await dashboardFilters.nth(1).inputValue()) throw new Error('上传后未定位到新批次');
      await page.getByRole('img', { name: '各指标长周期预测图' }).waitFor();

      await page.getByTitle('重置数据').click();
      const alertDialog = page.getByRole('alertdialog');
      await alertDialog.waitFor();
      const focusedLabel = await page.evaluate(() => document.activeElement?.textContent?.trim());
      if (focusedLabel !== '取消') throw new Error(`危险操作默认焦点不是取消，实际为“${focusedLabel || ''}”`);
      await alertDialog.getByRole('button', { name: '取消' }).click();
      await page.getByTitle('重置数据').click();
      await page.getByRole('alertdialog').getByRole('button', { name: '确认' }).click();
      await page.getByRole('alertdialog').waitFor({ state: 'hidden' });
      await page.getByRole('cell', { name: testDeviceId, exact: true }).waitFor({ state: 'hidden' });
    }
    await context.close();
  }
} finally {
  await browser.close();
}

if (errors.length) throw new Error(errors.join('\n'));
console.log(`PILOT_UI_VERIFY_OK scenes=4 viewports=2 mode=${readOnly ? 'read-only' : 'full'} upload=${readOnly ? 'skipped' : 'ok'} confirmation=${readOnly ? 'skipped' : 'ok'}`);
