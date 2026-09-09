import fs from 'node:fs';
import assert from 'node:assert/strict';
const base=process.env.PILOT_API_BASE_URL||'http://127.0.0.1:4178/api';
const root='外部模型数据上传与预测诊断-20260903/验收数据';
for(const scene of ['hydro-turbine','wastewater-pump','bridge-crane','haul-truck']){
 const response=await fetch(`${base}/model-showcase/sim-visual-${scene}/data/overview`);assert(response.ok);const {profile,modelId}=await response.json();
 const dir=root+'/'+scene;fs.mkdirSync(dir,{recursive:true});
 for(const abnormal of [false,true]){
  const device=`${modelId}-FIXTURE-${abnormal?'SURGE':'NORMAL'}`;
  const rows=Array.from({length:240},(_,i)=>[new Date(Date.UTC(2026,8,8,0,i)).toISOString(),device,'good',...profile.fields.map((f,k)=>{const span=f.normalMax-f.normalMin;const wave=Math.sin(i*2*Math.PI/(19+2*k));let v=(f.normalMin+f.normalMax)/2+span*(abnormal?.25+.85*wave+.14*Math.sin(i*1.3):.1*wave);if(f.normalMin>=0)v=Math.max(span*.01,v);return +v.toFixed(f.decimals)})]);
  fs.writeFileSync(dir+'/'+(abnormal?'异常大幅波动':'正常')+'.csv',['timestamp,device_id,quality,'+profile.fields.map(f=>f.field).join(','),...rows.map(r=>r.join(','))].join('\n'));
  for(let k=0;k<profile.fields.length;k++){const f=profile.fields[k],out=rows.filter(r=>r[k+3]<f.normalMin||r[k+3]>f.normalMax).length;assert(abnormal?out>20:out===0);}
 }
 fs.writeFileSync(dir+'/参考范围.json',JSON.stringify(profile.fields,null,2));
 console.log('PAIRED_FIXTURE_OK',scene);
}
