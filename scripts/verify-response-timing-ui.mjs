import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const p=await b.newPage({viewport:{width:1600,height:1100}});
const errors=[];p.on('pageerror',e=>errors.push(e.message));
const url=process.env.APP_URL || 'http://127.0.0.1:3010/cockpit/';
const readonly=process.env.READ_ONLY==='1';
const previewDir=process.env.PREVIEW_DIR || '';
const previewOnly=process.env.PREVIEW_ONLY==='1';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function capturePreview(name,locator=p){if(previewDir)await locator.screenshot({path:path.join(previewDir,name)});}
async function capturePreviewTop(name,locator,height=760){if(!previewDir)return;const box=await locator.boundingBox();if(box)await p.screenshot({path:path.join(previewDir,name),clip:{x:box.x,y:box.y,width:box.width,height:Math.min(height,box.height)}});}
async function timing(action,root=p){
 const row=root.locator(`.response-timing-row[data-action="${action}"][data-status="completed"]`);
 await row.waitFor({timeout:30000});
 const value=await row.evaluate(n=>({start:Number(n.dataset.start),end:Number(n.dataset.end),duration:Number(n.dataset.duration),text:n.textContent}));
 assert(value.start>1e12&&value.end>=value.start);assert.equal(value.end-value.start,value.duration);assert(value.text.includes('T_start')&&value.text.includes('T_end'));return value;
}
try{
 await p.goto(`${url}?embedded=1&viewId=sim-visual-hydro-turbine`,{waitUntil:'domcontentloaded'});
 await p.locator('.hydro-unified').waitFor();
 assert.equal(await p.locator('.response-timing-board').count(),0);
  await p.waitForFunction(() => document.querySelector('.threshold-model-version strong')?.textContent?.includes(' v'));
  assert.match(await p.locator('.threshold-model-version').innerText(), /(?:HD-TD|HYD-TD) v\d+\.\d+\.\d+/);
  await timing('设备数据读取');
  await timing('三维资源显示');
  await capturePreview('01-页面标题区时延.png',p.locator('.remote-model-showcase-header'));
  await capturePreview('02-三维视窗时延.png',p.locator('.remote-model-timed-wrapper'));
  const responseLogButton=p.getByRole('button',{name:/系统响应日志/});
  await responseLogButton.click();
  const responseOperation=p.locator('.system-response-operation.is-completed').first();
  await responseOperation.waitFor();
  const responseKinds=await responseOperation.locator('.system-response-log-line').evaluateAll(nodes=>nodes.map(node=>node.dataset.logKind));
  const responseEndIndex=responseKinds.indexOf('end');
  assert(responseEndIndex>=0&&responseKinds[responseEndIndex+1]==='duration','T_end must be immediately followed by latency');
  assert((await responseOperation.innerText()).includes('T_start')&&(await responseOperation.innerText()).includes('T_end')&&(await responseOperation.innerText()).includes('Δt'));
  await p.locator('.platform-meta-bar').screenshot({path:path.join(os.tmpdir(),'system-response-log-desktop.png')});
  await p.setViewportSize({width:390,height:900});
  assert((await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth))<=2);
  await p.locator('.platform-meta-bar').screenshot({path:path.join(os.tmpdir(),'system-response-log-mobile.png')});
  await p.setViewportSize({width:1600,height:1100});
  await responseLogButton.click();
  if(!readonly){
  const device=`TIME-${Date.now()}`;
  const dir='src/data/model-showcase/sim-visual-hydro-turbine__model-2326/reference/forecast-validation/HT-03';
  await p.getByRole('button',{name:'导入历史数据',exact:true}).click();
  const modal=p.getByRole('dialog',{name:'导入历史数据',exact:true});
  await modal.getByRole('button',{name:'新增设备',exact:true}).click();
  await modal.getByRole('textbox').fill(device);
  assert.equal(await modal.locator('[data-action="文件上传与解析"]').count(),0);
  await modal.locator('input[accept=".csv,.xlsx,.json"]').setInputFiles(path.join(dir,'HT-03-观测数据.csv'));
  const preview=await timing('文件上传与解析',modal);
  // Human reading/confirmation time must not extend a completed preview or enter commit latency.
  await delay(700);
  assert.equal((await timing('文件上传与解析',modal)).end,preview.end);
  await modal.getByRole('button',{name:'确认导入',exact:true}).click();
  await modal.waitFor({state:'hidden'});
  const saved=await timing('历史入库');assert(saved.start-preview.end>=650);
  await capturePreviewTop('03-设备数据区时延.png',p.locator('.hydro-unified'));
  await p.route('**/data/forecast/reference',async route=>{if(route.request().method()==='POST')await delay(200);await route.continue();});
  await p.getByRole('button',{name:'生成预测',exact:true}).click();
  const predicted=await timing('预测结果生成',p.locator('.hydro-series-panel'));assert(predicted.duration>=200);
  await capturePreview('04-预测面板时延.png',p.locator('.hydro-series-panel>header'));
  const sceneLogButton=p.getByRole('button',{name:/场景日志/});await sceneLogButton.click();
  const predictionLog=p.locator('.scene-business-log .platform-business-log-row').filter({hasText:device}).filter({hasText:'预测'}).first();
  await predictionLog.waitFor({timeout:15000});
  assert((await predictionLog.innerText()).includes('预测结果'));
  assert.equal(await p.locator('.scene-business-log .platform-log-level').filter({hasText:'严重预警'}).count()<=await p.locator('.scene-business-log .platform-business-log-row').count(),true);
  await p.locator('.platform-meta-bar').screenshot({path:path.join(os.tmpdir(),'scene-business-log-desktop.png')});
  await sceneLogButton.click();
  await p.getByRole('button',{name:'导入验证数据',exact:true}).click();
  const check=p.getByRole('dialog',{name:'导入验证数据',exact:true});
  await check.locator('input[accept=".csv,.xlsx,.json"]').setInputFiles(path.join(dir,'HT-03-验证数据.csv'));
  await timing('文件上传与解析',check);
  await check.getByRole('button',{name:'确认导入',exact:true}).click();await check.waitFor({state:'hidden'});
  await timing('验证结果展示',p.locator('.hydro-verification-panel'));
  await capturePreview('05-核验面板时延.png',p.locator('.hydro-verification-panel>header'));
  if(previewOnly){
   await p.setViewportSize({width:390,height:900});
   const mobileTiming=p.locator('.hydro-series-panel>header');await mobileTiming.scrollIntoViewIfNeeded();
   await capturePreview('06-移动端预测面板时延.png',mobileTiming);
   assert((await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth))<=2);
   console.log('RESPONSE_TIMING_PREVIEW_OK',JSON.stringify({url,previewDir}));
   await b.close();process.exit(0);
  }
  await p.getByRole('button',{name:'预测结果',exact:true}).click();
  await p.locator('[data-format="json"]').click();const download=p.waitForEvent('download');await p.getByRole('button',{name:'下载',exact:true}).click();await download;
  await timing('下载文件准备');
  await p.getByRole('button',{name:'导入历史数据',exact:true}).click();
  const failedModal=p.getByRole('dialog',{name:'导入历史数据',exact:true});
  await failedModal.locator('input[accept=".csv,.xlsx,.json"]').setInputFiles({name:'invalid.csv',mimeType:'text/csv',buffer:Buffer.from('invalid_column\nwrong')});
  await failedModal.locator('[data-action="文件上传与解析"][data-status="failed"]').waitFor();
  assert.equal(await failedModal.locator('[data-action="文件上传与解析"][data-status="completed"]').count(),0);
  await failedModal.getByRole('button',{name:'取消',exact:true}).click();
  await p.getByRole('button',{name:'导入历史数据',exact:true}).click();
  const protocolModal=p.getByRole('dialog',{name:'导入历史数据',exact:true});
  await protocolModal.getByRole('radio',{name:/IEC 61850/}).click();
  const scl='<?xml version="1.0"?><SCL xmlns="http://www.iec.ch/61850/2003/SCL"><IED name="TEST"><AccessPoint name="S1"><Server><LDevice inst="LD0"><LN0 lnClass="LLN0" inst=""/></LDevice></Server></AccessPoint></IED></SCL>';
  await protocolModal.locator('input[accept=".icd,.cid,.scd,.ssd,.xml"]').setInputFiles({name:'test.cid',mimeType:'application/xml',buffer:Buffer.from(scl)});
  await timing('SCL 解析',protocolModal);
  const sample=await p.request.get(`http://127.0.0.1:3010/api/model-showcase/sim-visual-hydro-turbine/downloads/samples?${new URLSearchParams({deviceId:device,source:'iec61850',format:'json'})}`);
  assert(sample.ok());
  await protocolModal.locator('input[accept=".csv,.xlsx,.json"]').setInputFiles({name:'iec-sample.json',mimeType:'application/json',buffer:await sample.body()});
  await timing('文件上传与解析',protocolModal);
  await protocolModal.screenshot({path:path.join(os.tmpdir(),'response-time-protocol-preview.png')});
  await protocolModal.getByRole('button',{name:'取消',exact:true}).click();
  for(const width of [1600,390]){
   await p.setViewportSize({width,height:1100});
   for(const panel of ['.hydro-series-panel','.hydro-verification-panel']){
    const strip=p.locator(`${panel} .response-timing-local`);await strip.scrollIntoViewIfNeeded();await strip.screenshot({path:path.join(os.tmpdir(),`response-time-${panel.slice(1)}-${width}.png`)});
   }
   assert((await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth))<=2);
  }
  const beforeDelete=await p.evaluate(()=>performance.timeOrigin+performance.now());
  await p.getByRole('button',{name:'数据管理',exact:true}).click();await p.getByTitle('删除当前设备',{exact:true}).click();
  await p.getByRole('alertdialog').getByRole('button',{name:'确认',exact:true}).click();await p.getByRole('alertdialog').waitFor({state:'hidden'});
  await delay(100);
  const starts=await p.locator('.response-timing-row').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.start)));assert(starts.every(s=>s<beforeDelete),'management deletion must not start a response measurement');
 }
 assert.deepEqual(errors,[]);console.log('RESPONSE_TIMING_UI_OK',JSON.stringify({readonly,url}));
}finally{await b.close()}
