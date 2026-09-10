import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';

const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const p=await b.newPage({viewport:{width:1600,height:1000}});
const errors=[];p.on('pageerror',e=>errors.push(e.message));
const url=process.env.APP_URL || 'http://127.0.0.1:3010/cockpit/';
const readonly=process.env.READ_ONLY==='1';
let scenario='normal-outside';
try {
 if(!readonly)await p.route('**/data/forecast/reference?*',async route=>{
  const r=await route.fetch(),body=await r.json();
  if(body.record?.result){
   const level=scenario==='high-within'?163:150,actual=scenario==='high-within'?161:scenario==='normal-within'?151:147;
   body.record.prediction.forecasts.filter(f=>f.field==='rpm').forEach(f=>{f.predicted=level;f.lower=level-2;f.upper=level+2;});
   body.record.result.actualSeries.forEach(r=>{r.values.rpm=actual;});
  }
  await route.fulfill({response:r,json:body});
 });
 await p.goto(`${url}?embedded=1&viewId=sim-visual-hydro-turbine`,{waitUntil:'domcontentloaded'});
 await p.locator('.hydro-metric-timeline').first().waitFor();
 if(!readonly){
  await p.getByLabel('当前设备',{exact:true}).selectOption('FIELD-HT-01');
  const card=p.getByLabel('转速历史预测对照',{exact:true});
  for(const [name,reading,deviation] of [['normal-outside','normal','outside'],['normal-within','normal','within'],['high-within','high','within']]){
   scenario=name;await p.getByTitle('刷新设备历史与预测',{exact:true}).click();
   await p.waitForFunction(({reading,deviation})=>{const c=document.querySelector('.hydro-metric-timeline');return c?.querySelector('[data-reading-status]')?.getAttribute('data-reading-status')===reading && c?.querySelector('[data-deviation-status]')?.getAttribute('data-deviation-status')===deviation},{reading,deviation});
   await card.locator('.recharts-area').waitFor({state:'attached',timeout:10000});
   assert.equal(await card.locator('.recharts-area').count(),1);
   assert.equal(await card.locator('.recharts-wrapper').count(),1);
   assert.equal(await card.locator('.hydro-deviation-chart,.hydro-deviation-panel').count(),0);
   await card.screenshot({path:path.join(os.tmpdir(),`hydro-assessment-${name}.png`)});
  }
  await p.unroute('**/data/forecast/reference?*');
  await p.getByLabel('当前设备',{exact:true}).selectOption('2326-01');
  await p.waitForFunction(()=>document.querySelector('.hydro-metric-timeline [data-deviation-status]')?.getAttribute('data-deviation-status')==='pending');
 }
 await p.waitForFunction(()=>document.querySelectorAll('.hydro-assessment-card .recharts-wrapper').length===6);
 for(const width of [1600,390]){
  await p.setViewportSize({width,height:1000});
  assert.equal(await p.locator('.hydro-assessment-card').count(),6);
  assert.equal(await p.locator('.hydro-assessment-card .recharts-wrapper').count(),6);
  assert.equal(await p.locator('.hydro-deviation-chart,.hydro-deviation-panel').count(),0);
  for(let i=0;i<6;i++){
   const card=p.locator('.hydro-assessment-card').nth(i);await card.scrollIntoViewIfNeeded();
   const box=await card.boundingBox();assert(box.x>=0&&box.x+box.width<=width+1);
   if(i===0||i===5)await card.screenshot({path:path.join(os.tmpdir(),`hydro-assessment-${width}-${i}.png`)});
  }
  assert((await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth))<=2);
 }
 assert.deepEqual(errors,[]);console.log('METRIC_ASSESSMENT_UI_OK',JSON.stringify({readonly,url}));
}finally{await b.close()}
