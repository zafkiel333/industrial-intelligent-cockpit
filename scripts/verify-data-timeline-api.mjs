import assert from 'node:assert/strict';
const base=process.env.PILOT_API_BASE_URL||'http://127.0.0.1:4178/api';
for(const scene of ['hydro-turbine','wastewater-pump','bridge-crane','haul-truck']){
 const p=base+'/model-showcase/sim-visual-'+scene+'/data/';
 const get=async(q)=>{const r=await fetch(p+q);assert(r.ok);return r.json()};
 const overview=await get('overview'),t=await get('timeline');assert.equal(t.deviceId,overview.devices[0]);assert(t.fields.length>=4);assert.equal(t.history.length,Math.min(240,t.totalRecords));
 const analysis=await get('analysis?'+new URLSearchParams({deviceId:t.deviceId}));assert.deepEqual(t.forecasts,analysis.forecasts.map(({field,timestamp,predicted,lower,upper})=>({field,timestamp,predicted,lower,upper})));
 for(const f of t.forecasts){assert(Date.parse(f.timestamp)>Date.parse(t.forecastOrigin));assert(f.lower<=f.predicted&&f.predicted<=f.upper);}
 const b=overview.batches[0];const scoped=await get('timeline?'+new URLSearchParams({deviceId:b.deviceId,batchId:b.batchId}));assert.equal(scoped.batchId,b.batchId);assert.equal(scoped.totalRecords,b.acceptedCount);
 const empty=await get('timeline?'+new URLSearchParams({deviceId:t.deviceId,batchId:'missing-batch'}));assert.equal(empty.history.length,0);assert.equal(empty.forecasts.length,0);
 console.log('TIMELINE_API_OK',scene,'history='+t.history.length,'forecast='+t.forecasts.length);
}
console.log('DATA_TIMELINE_API_VERIFY_OK scenes=4');
