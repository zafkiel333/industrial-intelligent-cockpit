import fs from 'node:fs';
import assert from 'node:assert/strict';
const base=process.env.PILOT_API_BASE_URL||'http://127.0.0.1:4178/api';
assert(['127.0.0.1','localhost'].includes(new URL(base).hostname),'Pair imports require an isolated local or tunneled API');
for(const scene of ['hydro-turbine','wastewater-pump','bridge-crane','haul-truck']){
 const root=base+'/model-showcase/sim-visual-'+scene+'/data/';
 const request=async(p,init)=>{const r=await fetch(root+p,init);assert(r.ok,await r.clone().text());return r.json()};
 const overview=await request('overview');
 for(const abnormal of [false,true]){
  const device=`${overview.modelId}-FIXTURE-${abnormal?'SURGE':'NORMAL'}`;
  if(!overview.devices.includes(device)){
   const bytes=fs.readFileSync(`外部模型数据上传与预测诊断-20260903/验收数据/${scene}/${abnormal?'异常大幅波动':'正常'}.csv`);
   const task=await request('imports',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({deviceId:device,deviceSource:'new',source:'standard',mode:'append',conflictPolicy:'reject',fileName:abnormal?'surge.csv':'normal.csv',fileSize:bytes.length})});
   await request(`imports/${task.batchId}/chunks/0`,{method:'PUT',headers:{'content-type':'application/octet-stream','x-upload-offset':'0'},body:bytes});
   const preview=await request(`imports/${task.batchId}/preview`,{method:'POST'});assert.equal(preview.preview.validRecordCount,240);
   await request(`imports/${task.batchId}/complete`,{method:'POST'});
   let done=false;for(let i=0;i<100;i++){const state=await request(`imports/${task.batchId}`);assert.notEqual(state.stage,'failed',state.error);if(state.stage==='completed'){done=true;break;}await new Promise(r=>setTimeout(r,100));}assert(done);
  }
  const t=await request('timeline?deviceId='+device);assert.equal(t.history.length,240);assert(t.forecasts.length>0);
  for(const f of t.fields){const outside=v=>v<f.normalMin||v>f.normalMax;const count=t.history.filter(r=>outside(r.values[f.field])).length;assert(abnormal?count>20:count===0);const model=t.forecastModels.find(m=>m.field===f.field);assert.equal(model.method,'seasonal');assert(model.validationMae<model.baselineMae*.85);const pred=t.forecasts.filter(p=>p.field===f.field);assert(abnormal?pred.some(p=>outside(p.predicted)):pred.every(p=>!outside(p.predicted)));}
  console.log('PAIR_API_OK',scene,abnormal?'surge':'normal');
 }
}
