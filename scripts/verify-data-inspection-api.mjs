import assert from 'node:assert/strict';
const base=process.env.PILOT_API_BASE_URL||'http://127.0.0.1:4178/api';
const lifecycle=process.env.PILOT_LIFECYCLE==='1';
async function request(p,method='GET',body,headers={}){const r=await fetch(base+'/'+p,{method,body,headers,signal:AbortSignal.timeout(30000)});assert(r.ok,`${p}: ${r.status} ${r.ok?'':await r.text()}`);return r.status===204?null:r.json();}
for(const scene of ['hydro-turbine','wastewater-pump','bridge-crane','haul-truck']){
 const p='model-showcase/sim-visual-'+scene;
 const overview=await request(p+'/data/overview');
 const current=await request(p+'/data/inspection');assert.equal(current.deviceId,overview.devices[0]||null);assert.equal(current.bins.reduce((sum,b)=>sum+b.fields[0].count,0),current.recordCount);
 for(const b of overview.batches){const filtered=await request(p+'/data/inspection?'+new URLSearchParams({deviceId:b.deviceId,batchId:b.batchId}));assert.equal(filtered.deviceId,b.deviceId);assert.equal(filtered.batchId,b.batchId);}
 if(lifecycle){
  assert(process.env.PILOT_DATA_ROOT&&!process.env.PILOT_DATA_ROOT.includes('/shared/'),'isolated root required');
  const id='INSPECTION-TEST-'+scene,fields=overview.profile.fields;
  const records=Array.from({length:4},(_,i)=>({timestamp:new Date(Date.UTC(2026,8,7,0,i*10)).toISOString(),device_id:id,quality:i===3?'bad':i===2?'uncertain':'good',...Object.fromEntries(fields.map(f=>[f.field,(f.normalMin+f.normalMax)/2]))}));
  records[1][fields[0].field]=fields[0].normalMax+(fields[0].normalMax-fields[0].normalMin)*0.1;
  const bytes=Buffer.from(JSON.stringify({records}));
  const task=await request(p+'/data/imports','POST',JSON.stringify({deviceId:id,deviceSource:'new',mode:'append',fileName:'inspection.json',fileSize:bytes.length}),{'content-type':'application/json'});
  const response=await fetch(base+'/'+p+'/data/imports/'+task.batchId+'/chunks/0',{method:'PUT',headers:{'content-type':'application/octet-stream','x-upload-offset':'0'},body:bytes});assert(response.ok);
  await request(p+'/data/imports/'+task.batchId+'/complete','POST');
  for(let i=0;i<100;i++){const t=await request(p+'/data/imports/'+task.batchId);if(t.stage==='completed')break;assert(t.stage!=='failed',t.error);await new Promise(r=>setTimeout(r,50));}
  const result=await request(p+'/data/inspection?'+new URLSearchParams({deviceId:id,batchId:task.batchId}));assert.equal(result.recordCount,4);assert.equal(result.quality.bad,1);assert.equal(result.quality.uncertain,1);assert.equal(result.outsideRecordCount,1);assert(result.bins.some(b=>b.fields[0].status==='empty'));assert.equal(result.fields[0].latest,records[2][fields[0].field]);
  const wrong=await request(p+'/data/inspection?'+new URLSearchParams({deviceId:overview.devices[0],batchId:task.batchId}));assert.equal(wrong.recordCount,0);
  await request(p+'/data?'+new URLSearchParams({scope:'device',target:id}),'DELETE');
 }
}
console.log(`INSPECTION_API_OK scenes=4 filters=ok aggregation=ok lifecycle=${lifecycle}`);
