import fs from 'node:fs';
import {MODEL_SHOWCASE_CATALOG} from '../src/remoteModelShowcase/modelCatalog';
const base=process.env.MODEL_LIBRARY_VERIFY_BASE_URL||'https://47.122.104.52/scene-library-api';
const dir='.runtime-cache/model-repair/audit';fs.mkdirSync(dir,{recursive:true});
const groups=new Map<number,string[]>();for(const c of Object.values(MODEL_SHOWCASE_CATALOG))groups.set(c.modelId,[...(groups.get(c.modelId)||[]),c.sceneId]);
const jobs=[...groups],results:any[]=[];let cursor=0;
async function worker(){while(cursor<jobs.length){const [modelId,scenes]=jobs[cursor++];const scene=scenes[0];try{
 const meta=await fetch(`${base}/model-showcase/${scene}/bootstrap`,{signal:AbortSignal.timeout(45000)});if(!meta.ok)throw Error('metadata HTTP '+meta.status+' '+(await meta.text()).slice(0,180));const data=await meta.json();
 const filepath=`${dir}/${modelId}.${data.model.format}`;let bytes:number;
 if(fs.existsSync(filepath))bytes=fs.statSync(filepath).size;else{const r=await fetch(`${base}/model-showcase/${scene}/model`,{signal:AbortSignal.timeout(75000)});if(!r.ok)throw Error('binary HTTP '+r.status+' '+(await r.text()).slice(0,180));const buf=Buffer.from(await r.arrayBuffer());fs.writeFileSync(filepath,buf);bytes=buf.length;}
 results.push({modelId,scenes,status:'downloaded',bytes,format:data.model.format,file:filepath,name:data.model.fileName});
 }catch(e){results.push({modelId,scenes,status:'failed',error:String(e)});console.log('FAILED',modelId,scenes.join(','),String(e));}
 fs.writeFileSync(dir+'/results.json',JSON.stringify(results,null,2));if(results.length%10===0)console.log('AUDIT_PROGRESS',results.length+'/'+jobs.length);
}}
await Promise.all([worker(),worker()]);console.log('BINARY_AUDIT_DONE',JSON.stringify({pages:Object.keys(MODEL_SHOWCASE_CATALOG).length,models:jobs.length,failures:results.filter(r=>r.status==='failed').length}));
