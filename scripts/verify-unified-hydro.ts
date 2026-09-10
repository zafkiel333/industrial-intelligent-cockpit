import express from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { registerPilotDataRoutes } from '../src/remoteModelShowcase/pilotDataService';

const dataDirectory=fs.mkdtempSync(path.join(os.tmpdir(),'hydro-unified-'));
const app=express();
app.use((req,_res,next)=>{req.url=req.url.replace(/^\/scene-library-api\//,'/api/');next()});
app.use(express.json({limit:'5mb'}));
registerPilotDataRoutes(app,dataDirectory);
// Read-only upstream assets for realistic local browser checks; all uploads remain isolated.
app.use('/api',async(req,res)=>{
  if(req.method!=='GET')return res.sendStatus(404);
  try{const r=await fetch(`https://47.122.104.52/api${req.url}`,{signal:AbortSignal.timeout(30000)});res.status(r.status).type(r.headers.get('content-type')||'application/json').send(Buffer.from(await r.arrayBuffer()));}catch{res.sendStatus(502)}
});
app.use('/cockpit',express.static('dist-standalone'));
const server=app.listen(3010,'127.0.0.1');
const base='http://127.0.0.1:3010/api/model-showcase/sim-visual-hydro-turbine';
async function json(route:string,body?:unknown,method=body?'POST':'GET') {
  const r=await fetch(base+route,{method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  const j=await r.json();if(!r.ok)throw new Error(`${r.status}: ${JSON.stringify(j)}`);return j;
}
async function upload(content:string,deviceId:string,verificationCaseId?:string,mode='append',fileName='测试.csv') {
  const task=await json('/data/imports',{fileName,fileSize:Buffer.byteLength(content),deviceId,source:'standard',mode,verificationCaseId,conflictPolicy:'keep-existing'});
  const chunk=await fetch(`${base}/data/imports/${task.batchId}/chunks/0`,{method:'PUT',headers:{'Content-Type':'application/octet-stream','X-Upload-Offset':'0'},body:content});assert.equal(chunk.status,200);
  await json(`/data/imports/${task.batchId}/preview`,{});
  await json(`/data/imports/${task.batchId}/complete`,{});
  for(let i=0;i<100;i++){const status=await json(`/data/imports/${task.batchId}`);if(status.stage==='failed')throw Error(status.error);if(status.stage==='completed')return status.focusBatchId ?? task.batchId;await new Promise(r=>setTimeout(r,20));}throw Error('import timed out');
}
const suite=path.join('src/data/model-showcase/sim-visual-hydro-turbine__model-2326/reference/forecast-validation');
try {
  for(const id of ['HT-01','HT-30','HT-50','HT-41']) {
    const observation=fs.readFileSync(path.join(suite,id,`${id}-观测数据.csv`),'utf8');
    const verification=fs.readFileSync(path.join(suite,id,`${id}-验证数据.csv`),'utf8');
    const deviceId=`FIELD-${id}`;
    const batchId=await upload(observation,deviceId,undefined,'append',`${id}-历史.csv`);
    assert.equal(await upload(observation,deviceId),batchId,'duplicate imports must focus retained data');
    const run=await json('/data/forecast/reference',{deviceId,batchId});
    assert.equal(run.prediction.forecasts.length,2160);
    assert.equal(run.history.length,180);
    const saved=JSON.stringify(run.prediction);
    const again=await json('/data/forecast/reference',{deviceId,batchId});assert.equal(again.caseId,run.caseId);
    const lines=verification.trim().split(/\r?\n/);
    await upload(lines.slice(0,181).join('\n'),deviceId,run.caseId);
    const partial=await json(`/data/forecast/runs/${run.caseId}`);assert.equal(partial.coverage,.5);
    const before=await json('/data/forecast/summary');
    await upload(verification,deviceId,run.caseId);
    const checked=await json(`/data/forecast/runs/${run.caseId}`);assert.equal(checked.coverage,1);assert.equal(JSON.stringify(checked.prediction),saved);assert.equal(checked.result.fieldMetrics.length,6);
    const after=await json('/data/forecast/summary');assert.equal(after.verifiedCases,before.verifiedCases+1);
    await upload(verification,deviceId,run.caseId);
    assert.equal((await json('/data/forecast/summary')).verifiedCases,after.verifiedCases);
    await assert.rejects(()=>upload(verification.replaceAll(`${id}-INVALID`,'x').replaceAll(`2326-VAL-${id.slice(-2)}`,'wrong-device'),deviceId,run.caseId),/设备/);
    const downloaded=await fetch(`${base}/downloads/prediction?deviceId=${encodeURIComponent(deviceId)}&format=json&runId=${run.caseId}`).then(r=>r.json());assert.deepEqual(downloaded.prediction,run.prediction);
    if(id==='HT-50') {
      // Covering history changes active selection, but prior evaluation remains reproducible.
      await upload(observation.split(/\r?\n/).slice(0,121).join('\n'),deviceId,undefined,'replace');
      const next=await json('/data/forecast/reference',{deviceId});assert.notEqual(next.caseId,run.caseId);assert.equal((await json(`/data/forecast/runs/${run.caseId}`)).coverage,1);
    }
  }
  // No labels: valid numeric verification, no fictitious accuracy denominator.
  const obs=fs.readFileSync(path.join(suite,'HT-02','HT-02-观测数据.csv'),'utf8');
  const ver=fs.readFileSync(path.join(suite,'HT-02','HT-02-验证数据.csv'),'utf8').trim().split(/\r?\n/).map(l=>l.split(',').slice(0,10).join(',')).join('\n');
  const batch=await upload(obs,'no-label');const run=await json('/data/forecast/reference',{deviceId:'no-label',batchId:batch});
  await upload(ver,'no-label',run.caseId);const checked=await json(`/data/forecast/runs/${run.caseId}`);assert.equal(checked.labelKnown,false);assert.equal(checked.result.actualTag,null);
  const summary=await json('/data/forecast/summary');assert.equal(summary.verifiedCases,5);assert.equal(summary.statusCount,4);assert.equal(summary.predictedCases,6);
  await assert.rejects(()=>json('/data/forecast/reference',{deviceId:'missing'}),/24/);
  const series=obs.trim().split(/\r?\n/);
  const firstBatch=await upload(series.slice(0,61).join('\n'),'ONE-HISTORY');
  await upload([series[0],...series.slice(61,121)].join('\n'),'ONE-HISTORY');
  const mergedHistory=await json(`/data/forecast/reference?deviceId=ONE-HISTORY&batchId=${firstBatch}`);
  assert.equal(mergedHistory.history.length,120,'a device has only one active history regardless of batch parameter');
  await upload(series.slice(0,49).join('\n'),'ONE-HISTORY',undefined,'replace');
  assert.equal((await json('/data/forecast/reference?deviceId=ONE-HISTORY')).history.length,48);
  for(const source of ['modbus','iec61850']) for(const format of ['csv','xlsx','json']) {
    const deviceId=`PROTO-${source}-${format}`;
    const file=await fetch(`${base}/downloads/samples?deviceId=${deviceId}&source=${source}&format=${format}`).then(r=>r.arrayBuffer());
    const task=await json('/data/imports',{fileName:`${source}.${format}`,fileSize:file.byteLength,deviceId,deviceSource:'new',source});
    const put=await fetch(`${base}/data/imports/${task.batchId}/chunks/0`,{method:'PUT',headers:{'Content-Type':'application/octet-stream','X-Upload-Offset':'0'},body:file});assert.equal(put.status,200);
    const preview=await json(`/data/imports/${task.batchId}/preview`,{});assert(preview.preview.validRecordCount>0);
    await json(`/data/imports/${task.batchId}/complete`,{});
    for(let i=0;i<100;i++){const s=await json(`/data/imports/${task.batchId}`);if(s.stage==='failed')throw Error(s.error);if(s.stage==='completed')break;await new Promise(r=>setTimeout(r,20));}
    const reference=await json(`/data/forecast/reference?deviceId=${deviceId}&batchId=${task.batchId}`);assert.equal(reference.history.length,preview.preview.validRecordCount);
    if(reference.history.length>=24) { const prediction=await json('/data/forecast/reference',{deviceId,batchId:task.batchId});assert(prediction.prediction.forecasts.length>0); }
      else await assert.rejects(()=>json('/data/forecast/reference',{deviceId,batchId:task.batchId}),/24/);
  }
  const sceneLogs=await json('/data/forecast/logs/scene');
  assert(sceneLogs.entries.some((entry:any)=>entry.category==='prediction'&&entry.deviceId==='FIELD-HT-01'));
  assert(sceneLogs.entries.some((entry:any)=>entry.category==='verification'&&entry.deviceId==='FIELD-HT-41'));
  assert(sceneLogs.entries.some((entry:any)=>entry.level==='normal'),'normal predictions must be recorded');
  assert(sceneLogs.entries.some((entry:any)=>['attention','warning','critical'].includes(entry.level)),'abnormal predictions must be recorded');
  assert(sceneLogs.entries.filter((entry:any)=>entry.level==='critical').every((entry:any)=>entry.content.startsWith('严重风险预测')));
  const responseStart=Date.now(),responseEnd=responseStart+237;
  const responsePayload={traceId:'api-log-check-1',scope:'sim-visual-hydro-turbine',action:'预测结果生成',context:'FIELD-HT-01',start:responseStart,end:responseEnd,duration:237,status:'completed'};
  await json('/data/forecast/logs/response',responsePayload);
  await json('/data/forecast/logs/response',responsePayload);
  const responseLogs=await json('/data/forecast/logs/response');
  assert.equal(responseLogs.entries.filter((entry:any)=>entry.traceId===responsePayload.traceId).length,1);
  assert.equal(responseLogs.entries.find((entry:any)=>entry.traceId===responsePayload.traceId).duration,237);
  const modelLogRoot=path.join(dataDirectory,'model-showcase','sim-visual-hydro-turbine__model-2326','logs');
  assert(fs.existsSync(path.join(modelLogRoot,'scene-prediction-events.jsonl')));
  assert(fs.existsSync(path.join(modelLogRoot,'system-response-events.jsonl')));
  console.log('UNIFIED_HYDRO_API_OK',JSON.stringify({dataDirectory,summary:{verified:summary.verifiedCases,labeled:summary.statusCount},port:3010}));
}catch(e){console.error(e);server.close();process.exitCode=1;}
if(process.env.KEEP_TEST_SERVER!=='1') server.close();
