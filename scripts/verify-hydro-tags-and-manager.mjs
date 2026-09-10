import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';

const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1600,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const url=process.env.APP_URL || 'http://127.0.0.1:3010/cockpit/';
const readonly=process.env.READ_ONLY==='1';
try {
 await page.goto(`${url}?embedded=1&viewId=sim-visual-hydro-turbine`,{waitUntil:'domcontentloaded'});
 await page.getByLabel('当前设备',{exact:true}).waitFor();
 if(!readonly){
  for(const [device,expected] of [['FIELD-HT-01','normal'],['FIELD-HT-41','abnormal'],['no-label','pending']]){
   await page.getByLabel('当前设备',{exact:true}).selectOption(device);
   const actual=page.locator('.hydro-tag-card[aria-label="实际状态"]');
   await page.waitForFunction(tag=>document.querySelector('.hydro-tag-card[aria-label="实际状态"]')?.getAttribute('data-tag')===tag,expected);
   assert.equal(await actual.getAttribute('data-tag'),expected);
   if(expected!=='pending')assert.equal(await page.locator('.hydro-tag-card[aria-label="预测状态"]').getAttribute('data-tag'),expected);
   assert.equal(await page.getByText('当前时间覆盖率',{exact:true}).count(),0);
   assert.equal(await page.getByText('本次对称误差（sMAPE）',{exact:true}).count(),1);
   await page.locator('.hydro-tag-comparison').screenshot({path:path.join(os.tmpdir(),`hydro-tags-${expected}.png`)});
  }
  // Render a disagreement as a browser fixture only; no stored prediction or labels are changed.
  await page.route('**/data/forecast/reference?*',async route=>{
   const r=await route.fetch();const body=await r.json();
   if(body.record?.result){body.record.labelKnown=true;body.record.result.actualTag=body.record.prediction.tag==='normal'?'abnormal':'normal';body.record.result.statusCorrect=false;body.record.result.conclusionCorrect=false;}
   await route.fulfill({response:r,json:body});
  });
  await page.getByLabel('当前设备',{exact:true}).selectOption('FIELD-HT-01');
  await page.getByText('判断不一致',{exact:true}).waitFor();
  await page.locator('.hydro-tag-comparison').screenshot({path:path.join(os.tmpdir(),'hydro-tags-mismatch.png')});
  await page.unroute('**/data/forecast/reference?*');
 }
 for(const width of [1600,390]){
  await page.setViewportSize({width,height:1000});
  await page.getByRole('button',{name:'数据管理',exact:true}).click();
  const box=await page.locator('.hydro-manager').boundingBox();
  assert(box && box.width>width*.9 && box.height>750,JSON.stringify(box));
  assert(box.x>=0 && box.x+box.width<=width+1);
  assert.equal(await page.locator('.hydro-manager thead th').first().evaluate(n=>getComputedStyle(n).position),'sticky');
  const scrolling=await page.locator('.hydro-manager .model-data-table-wrap').evaluate(n=>({horizontal:n.scrollWidth>n.clientWidth,overflow:getComputedStyle(n).overflowY}));
  assert.equal(scrolling.overflow,'auto');if(width===390)assert(scrolling.horizontal);
  await page.locator('.hydro-manager').screenshot({path:path.join(os.tmpdir(),`hydro-manager-${width}.png`)});
  await page.getByRole('button',{name:'关闭数据管理'}).click();
  if(!readonly){await page.locator('.hydro-tag-comparison').screenshot({path:path.join(os.tmpdir(),`hydro-tags-${width}.png`)});}
 }
 assert.deepEqual(errors,[]);console.log('HYDRO_TAGS_MANAGER_OK',JSON.stringify({readonly,url}));
}finally{await browser.close()}
