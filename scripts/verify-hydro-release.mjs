import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const origin=process.env.HYDRO_PREFLIGHT_API || 'http://127.0.0.1:3103';
assert(['127.0.0.1','localhost'].includes(new URL(origin).hostname),'write checks only on isolated loopback');
assert.equal(new URL(origin).port,'3103');
const base=origin+'/api/model-showcase/sim-visual-hydro-turbine';
const json=async(route,body)=>{const r=await fetch(base+route,{method:body?'POST':'GET',headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});const j=await r.json();assert(r.ok,JSON.stringify(j));return j};
assert((await fetch(`${origin}/api/health`).then(r=>r.json())).status==='ok');
for(const r of (await json('/data/forecast/summary')).records) assert((await fetch(`${base}/data/forecast/runs/${r.caseId}`,{method:'DELETE'})).ok);
assert((await fetch(`${base}/data?scope=all`,{method:'DELETE'})).ok);
async function upload(content,deviceId,runId) {
 const t=await json('/data/imports',{fileName:'release-check.csv',fileSize:Buffer.byteLength(content),deviceId,verificationCaseId:runId,mode:'append',source:'standard'});
 const r=await fetch(`${base}/data/imports/${t.batchId}/chunks/0`,{method:'PUT',headers:{'Content-Type':'application/octet-stream','X-Upload-Offset':'0'},body:content});assert(r.ok);
 await json(`/data/imports/${t.batchId}/preview`,{});await json(`/data/imports/${t.batchId}/complete`,{});
 for(let i=0;i<100;i++){const s=await json(`/data/imports/${t.batchId}`);assert.notEqual(s.stage,'failed',s.error);if(s.stage==='completed')return t.batchId;await new Promise(r=>setTimeout(r,40))}throw Error('import timeout');
}
for(const id of ['HT-01','HT-41']) {
 const root=path.join(process.cwd(),'src/data/model-showcase/sim-visual-hydro-turbine__model-2326/reference/forecast-validation',id);
 const deviceId=`RELEASE-${id}`;
 const batchId=await upload(fs.readFileSync(path.join(root,`${id}-观测数据.csv`),'utf8'),deviceId);
 const run=await json('/data/forecast/reference',{deviceId,batchId});assert.equal(run.prediction.forecasts.length,2160);
 await upload(fs.readFileSync(path.join(root,`${id}-验证数据.csv`),'utf8'),deviceId,run.caseId);
 const checked=await json(`/data/forecast/runs/${run.caseId}`);assert.equal(checked.coverage,1);assert.equal(checked.labelKnown,true);assert.deepEqual(checked.prediction,run.prediction);
 assert.equal(checked.prediction.tag,id==='HT-01'?'normal':'abnormal');
 for(const kind of ['prediction','report'])for(const format of kind==='prediction'?['csv','xlsx','json']:['pdf','docx','json']) {
   const r=await fetch(`${base}/downloads/${kind}?${new URLSearchParams({deviceId,runId:run.caseId,format})}`);assert(r.ok);const bytes=await r.arrayBuffer();assert(bytes.byteLength>100);
 }
 console.log('RELEASE_CASE_OK',id,checked.prediction.tag,checked.result.statusCorrect);
}
const summary=await json('/data/forecast/summary');assert(summary.verifiedCases>=2);assert(summary.statusCount>=2);
console.log('HYDRO_RELEASE_PREFLIGHT_OK');
