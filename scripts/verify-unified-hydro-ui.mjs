import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';

const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1600,height:1080}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const url=process.env.APP_URL || 'http://127.0.0.1:3010/cockpit/';
const readonly=process.env.READ_ONLY==='1';
const waitText=async(text)=>{await page.getByText(text,{exact:false}).first().waitFor({timeout:20000})};
try {
  await page.goto(`${url}?embedded=1&viewId=sim-visual-hydro-turbine`,{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('.hydro-unified').waitFor({timeout:30000});
  assert.equal(await page.getByRole('button',{name:'导入历史数据',exact:true}).count(),1);
  assert.equal(await page.getByRole('button',{name:'导入验证数据',exact:true}).count(),1);
  assert.equal(await page.getByLabel('预测参考数据',{exact:true}).count(),0);
  if(readonly && await page.locator('.hydro-metric-timeline').count()===0) {
    const deviceValues=await page.getByLabel('当前设备',{exact:true}).locator('option').evaluateAll(options=>options.map(option=>option.value).filter(Boolean));
    for(const value of deviceValues) {
      await page.getByLabel('当前设备',{exact:true}).selectOption(value);
      try {
        await page.waitForFunction(()=>document.querySelectorAll('.hydro-metric-timeline').length===6,null,{timeout:3000});
        break;
      } catch {}
    }
  }
  assert.equal(await page.locator('.hydro-metric-timeline').count(),6);
  assert.equal(await page.locator('.hydro-measurements button').count(),0);
  assert.equal(await page.locator('.hydro-case-index,.hydro-validation-ledger,.pilot-data-dashboard').count(),0);
  if(!readonly){
    const device=`UI-${Date.now()}`;
    await page.getByRole('button',{name:'导入历史数据',exact:true}).click();
    await page.getByRole('button',{name:'新增设备',exact:true}).click();
    await page.locator('.model-data-device-source').locator('..').locator('..').getByRole('textbox').fill(device);
    const dir='src/data/model-showcase/sim-visual-hydro-turbine__model-2326/reference/forecast-validation/HT-03';
    await page.locator('input[type=file]').first().setInputFiles(path.join(dir,'HT-03-观测数据.csv'));
    // File selection starts upload and parsing automatically.
    await page.getByRole('button',{name:'确认导入',exact:true}).waitFor({timeout:10000});
    await page.getByRole('button',{name:'确认导入',exact:true}).click();
    await page.getByRole('dialog',{name:'导入历史数据',exact:true}).waitFor({state:'hidden',timeout:15000});
    await page.waitForFunction(d=>document.querySelector('select[aria-label="当前设备"]')?.value===d,device);
    await page.getByRole('button',{name:'生成预测',exact:true}).click();
    await page.getByRole('button',{name:'预测已生成',exact:true}).waitFor({timeout:15000});
    await page.getByRole('button',{name:'导入验证数据',exact:true}).click();
    assert.equal(await page.getByLabel('数据用途',{exact:true}).count(),0);
    assert.equal(await page.getByRole('button',{name:'新增设备',exact:true}).count(),0);
    await page.locator('input[type=file]').first().setInputFiles(path.join(dir,'HT-03-验证数据.csv'));
    await page.getByRole('button',{name:'确认导入',exact:true}).waitFor({timeout:15000});
    await page.getByRole('button',{name:'确认导入',exact:true}).click();
    await page.getByRole('dialog',{name:'导入验证数据',exact:true}).waitFor({state:'hidden',timeout:15000});
    await waitText('已纳入相应累计指标');
    await page.getByRole('button',{name:'数据管理',exact:true}).click();
    assert.equal(await page.getByRole('dialog',{name:'管理已存数据'}).count(),1);
    await page.getByRole('button',{name:'关闭数据管理'}).click();
    await page.getByRole('button',{name:'预测结果',exact:true}).click();
    await page.locator('[data-format=json]').click();
    const dl=page.waitForEvent('download');await page.getByRole('button',{name:'下载',exact:true}).click();
    const download=await dl;assert(download.suggestedFilename().includes(device));assert(download.suggestedFilename().endsWith('.json'));
    await page.getByLabel('当前设备',{exact:true}).selectOption('2326-01');
    await page.getByRole('button',{name:'生成预测',exact:true}).waitFor();
    assert.equal(await page.locator('.hydro-field-error').count(),0);
    await page.getByLabel('当前设备',{exact:true}).selectOption(device);
    // Selecting merged data must resolve the same content-based saved prediction.
    await page.getByRole('button',{name:'预测已生成',exact:true}).waitFor();
    await waitText('已纳入相应累计指标');
  }
  for(const width of [1600,390]) {
    await page.setViewportSize({width,height:1080});
    await page.locator('.hydro-unified').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(os.tmpdir(),`hydro-unified-${width}.png`),fullPage:true});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);assert(overflow<=2,`overflow ${width}: ${overflow}`);
    const boxes=await page.locator('.hydro-metric-timeline').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}}));
    if(width===1600){assert(boxes[1].x>boxes[0].x);assert(Math.abs(boxes[0].y-boxes[1].y)<2);assert(boxes[2].y>boxes[0].y);}
    else {assert(boxes.every(b=>Math.abs(b.x-boxes[0].x)<2));assert(boxes[1].y>boxes[0].y);}
    for(let i=0;i<6;i++) {
      const card=page.locator('.hydro-metric-timeline').nth(i);
      await card.scrollIntoViewIfNeeded();
      await card.screenshot({path:path.join(os.tmpdir(),`hydro-metric-${i}-${width}.png`)});
      assert((await card.locator('.recharts-line-curve').count())>0);
    }
    for(const selector of ['.hydro-series-panel','.hydro-warning-panel','.hydro-verification-panel']) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.locator(selector).screenshot({path:path.join(os.tmpdir(),`hydro-refined-${selector.slice(1)}-${width}.png`)});
    }
  }
  assert.deepEqual(errors,[]);
  if(!readonly){
    await page.getByLabel('当前设备',{exact:true}).selectOption('FIELD-HT-41');
    await page.locator('.hydro-warning-panel.has-warning').waitFor({timeout:15000});
    assert((await page.locator('.hydro-alert-cards article').count())>0);
    await page.setViewportSize({width:1600,height:1080});
    await page.locator('.hydro-warning-panel').screenshot({path:path.join(os.tmpdir(),'hydro-refined-abnormal-warning.png')});
  }
  console.log('UNIFIED_HYDRO_UI_OK',JSON.stringify({readonly,url,screenshots:path.join(os.tmpdir(),'hydro-unified-*.png')}));
}finally{await browser.close()}
