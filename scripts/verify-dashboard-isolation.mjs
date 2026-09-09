import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
let available=false;
let metadataAvailable=true;
const upstream=http.createServer((req,res)=>{
  res.setHeader('Content-Type','application/json');
  if(req.url.includes('/dashboard')){
    if(!available){res.statusCode=503;res.end(JSON.stringify({code:503,message:'test outage'}));return;}
    res.end(JSON.stringify({code:200,data:{twin_status:{status:'ONLINE'},equipment:{name:'test',status:'ONLINE'},bindable_fields:[{field:'rpm',label:'转速',unit:'r/min',value:150,base_value:150,normal_min:130,normal_max:170,abnormal:false,trend:'stable'}]}}));return;
  }
  if(!metadataAvailable){res.statusCode=503;res.end(JSON.stringify({code:503,message:'metadata outage'}));return;}
  res.end(JSON.stringify({code:200,data:{model_id:2338,model_name:'test',model_file:[{file_name:'test.fbx',file_size:32,file_url:'/test.fbx'}]}}));
});
await new Promise(resolve=>upstream.listen(0,'127.0.0.1',resolve));
const probe=http.createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dashboard-isolation-'));
const models=path.join(dir,'models');fs.mkdirSync(models);
const binary=Buffer.from('Kaydara FBX Binary  test fixture');const contentHash=createHash('sha256').update(binary).digest('hex');
fs.writeFileSync(path.join(models,'test.fbx'),binary);
for(const [sceneId,modelId] of [['ia-ship-eeoi',2362],['sim-port-motion',999]]){
 fs.writeFileSync(path.join(models,sceneId+'.json'),JSON.stringify({schemaVersion:1,sceneId,modelId,binaryFile:'test.fbx',contentType:'application/octet-stream',fileName:'test.fbx',fileSize:binary.length,format:'fbx',cachedAt:Date.now(),updatedAt:Date.now(),lastCheckedAt:Date.now(),nextRefreshAt:Date.now()+86400000,assetFingerprint:'test',contentHash,version:contentHash.slice(0,16)}));
}
const child=spawn(process.execPath,['node_modules/tsx/dist/cli.mjs','server.ts'],{env:{...process.env,NODE_ENV:'production',HOST:'127.0.0.1',PORT:String(port),SCENE_DATA_DIRECTORY:dir,MODEL_CACHE_DIRECTORY:path.join(dir,'models'),VISUAL_MODEL_API_BASE_URL:`http://127.0.0.1:${upstream.address().port}`},stdio:'ignore'});
const base=`http://127.0.0.1:${port}/api`;
try{
  for(let i=0;i<60;i++){try{if((await fetch(base+'/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
  const r=await fetch(base+'/model-showcase/ia-turbine-wear/bootstrap');assert.equal(r.status,200);const b=await r.json();
  assert.equal(b.model.format,'fbx');assert.match(b.dashboard.unavailableReason,/正在同步/);assert.deepEqual(b.dashboard.bindable_fields,[]);assert.equal(b.dashboard.twin_status.status,'运行数据同步中');
  const history=await fetch(base+'/model-showcase/sim-visual-hydro-turbine/data/overview');assert.equal(history.status,200);
  available=true;const d=await(await fetch(base+'/model-showcase/ia-turbine-wear/dashboard')).json();assert.equal(d.twin_status.status,'ONLINE');assert.equal(d.unavailableReason,undefined);
  available=false;const fallback=await(await fetch(base+'/model-showcase/ia-turbine-wear/dashboard')).json();assert.match(fallback.unavailableReason,/最近一次可用数据/);assert.equal(fallback.bindable_fields.length,1);
  metadataAvailable=false;
  const cached=await fetch(base+'/model-showcase/ia-ship-eeoi/model');assert.equal(cached.status,200);assert.deepEqual(Buffer.from(await cached.arrayBuffer()),binary);
  const boot=await fetch(base+'/model-showcase/ia-ship-eeoi/bootstrap');assert.equal(boot.status,200);
  const wrong=await fetch(base+'/model-showcase/sim-port-motion/model');assert.notEqual(wrong.status,200);
  console.log('DASHBOARD_ISOLATION_OK outageBootstrap=200 noFabricatedValues=ok localData=ok recovery=ok offlineModel=ok wrongBinding=rejected');
}finally{child.kill();upstream.closeAllConnections();await new Promise(resolve=>upstream.close(resolve));}
