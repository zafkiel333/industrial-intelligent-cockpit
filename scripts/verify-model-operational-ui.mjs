import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.APP_URL || 'http://127.0.0.1:3010/cockpit/';
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const representatives = {
  'sim-visual-hydro-turbine': ['转速', '轴承温度', '主轴振动', '水压', '流量', '输出功率'],
  'sim-visual-wastewater-pump': ['泵轴转速', '轴承温度', '泵体振动', '出口压力', '输送流量', '电机功率'],
  'sim-visual-bridge-crane': ['载荷', '运行位置', '运行速度', '驱动电流', '电机温度', '结构振动'],
  'sim-visual-haul-truck': ['发动机转速', '冷却液温度', '车体振动', '液压压力', '有效载荷', '牵引功率'],
  'eq-2': ['负载电流', '运行电压', '油温', '绕组温度', '局部放电量', '电磁振动'],
  'eq-5': ['进水流量', '溶解氧', '污泥浓度', '出水浊度', '鼓风机电流', '出水 COD'],
  'eq-7': ['轴系转速', '主机负荷', '润滑油压力', '轴承温度', '船体振动', '航行偏差'],
  'eq-10': ['供电电压', '设备电流', '机箱温度', '方位偏差', '信号质量', '通信时延'],
  'eq-14': ['回转速度', '推进压力', '驱动电流', '钻架振动', '钻进速度', '液压油温'],
  'eq-15': ['给料量', '主机电流', '轴承温度', '机体振动', '出料粒度', '处理效率'],
  'cv-robot-joint-wear': ['关节电流', '关节温度', '定位误差', '重复定位精度', '关节振动', '作业节拍'],
  'sim-hydro-gate': ['阀位开度', '阀前后压差', '动作时间', '执行油压', '执行器电流', '阀位偏差'],
  'cv-ship-propeller': ['缺陷特征值', '形变幅值', '表面温度', '相对位移', '识别置信度', '缺陷变化率'],
  'eq-4': ['瞬时流量', '管路压力', '电导率', '浊度', '信号质量', '零点漂移'],
  'ChillerRefrigerantRecoverySim': ['吸气压力', '排气压力', '排气温度', '电机电流', '机组振动', '运行效率'],
  'cp-dam-safety': ['结构位移', '渗压', '接缝开度', '结构应力', '结构温度', '裂缝变化率'],
};
const forbidden = /模拟数据|演示数据|捏造|AI完成|会话交接|上游端点|不再返回有效|文件头|缩略图|开发任务|本次改造|燃料量/;
const errors = [];
const timings = [];
const browser = await chromium.launch({ headless: true, executablePath: chromePath });

try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, locale: 'zh-CN' });
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error' && !message.text().startsWith('Failed to load resource:')) errors.push(`console: ${message.text()}`);
    if (message.type() === 'warning' && /width\(-1\)|height\(-1\)/.test(message.text())) errors.push(`chart: ${message.text()}`);
  });

  for (const [sceneId, labels] of Object.entries(representatives)) {
    const startedAt = Date.now();
    await page.goto(`${baseUrl}?embedded=1&viewId=${sceneId}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.locator('.hydro-unified').waitFor({ timeout: 30_000 });
    await page.locator('.hydro-metric-timeline').first().waitFor({ timeout: 20_000 });
    assert.equal(await page.locator('.hydro-metric-timeline').count(), 6, `${sceneId} 未展示六项指标`);
    assert.equal(await page.getByRole('button', { name: '导入历史数据', exact: true }).count(), 1, `${sceneId} 历史数据入口异常`);
    assert.equal(await page.getByRole('button', { name: '导入验证数据', exact: true }).count(), 1, `${sceneId} 验证数据入口异常`);
    assert.equal(await page.getByRole('button', { name: '数据管理', exact: true }).count(), 1, `${sceneId} 数据管理入口异常`);
    const headings = await page.locator('.hydro-metric-chart-heading h4').evaluateAll(nodes => nodes.map(node => node.childNodes[0]?.textContent?.trim()));
    assert.deepEqual(headings, labels, `${sceneId} 指标与模型场景不一致`);
    const text = await page.locator('body').innerText();
    assert.ok(!forbidden.test(text), `${sceneId} 出现内部、失真或不专业措辞`);
    assert.match(text, /阈值诊断模型/);
    timings.push(`${sceneId}=${Date.now() - startedAt}ms`);
  }

  await page.goto(`${baseUrl}?embedded=1&viewId=sim-visual-hydro-turbine`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.locator('.hydro-unified').waitFor({ timeout: 30_000 });
  await page.getByRole('button', { name: '数据管理', exact: true }).click();
  const manager = page.getByRole('dialog', { name: '管理已存数据' });
  await manager.waitFor();
  const managerBox = await manager.boundingBox();
  assert(managerBox && managerBox.width >= 1_100, `数据管理窗口宽度不足：${managerBox?.width}`);
  await page.getByRole('button', { name: '关闭数据管理' }).click();

  assert.deepEqual(errors, []);
  console.log(`MODEL_OPERATIONAL_UI_OK ${timings.join(' ')}`);
} finally {
  await browser.close();
}
