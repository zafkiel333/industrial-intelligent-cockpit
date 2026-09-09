import fs from 'node:fs';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';
import {repairFbxNullMeshNodes} from '../src/remoteModelShowcase/fbxCompatibility';
import {readLegacyStepFbx} from '../src/remoteModelShowcase/legacyFbxMesh';
import {prepareViewerModel} from '../src/remoteModelShowcase/modelViewerTransform';
// Texture images do not affect the geometry audit; browser rendering is verified separately.
(globalThis as any).window={URL:globalThis.URL};
(globalThis as any).document={createElementNS:()=>({addEventListener(){},removeEventListener(){},set src(_v:string){}})};
const input=JSON.parse(fs.readFileSync('.runtime-cache/model-repair/audit/results.json','utf8'));
const output=[];
for(const r of input){if(r.status!=='downloaded')continue;
 try{if(r.format!=='fbx')throw Error('Requires browser GLTF audit');const bytes=fs.readFileSync(r.file);const buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);const fixed=repairFbxNullMeshNodes(buffer);
 const object=readLegacyStepFbx(buffer)||new FBXLoader().parse(fixed.buffer,'');const prepared=prepareViewerModel(object);let vertices=0;object.traverse((o:any)=>{if(o.isMesh)vertices+=o.geometry.getAttribute('position')?.count||0;});
 if(!prepared.size.toArray().every(Number.isFinite)||!vertices)throw Error('Empty or nonfinite geometry');
 output.push({...r,parse:'ok',repairNodes:fixed.repairedNodes,legacyRecovery:Boolean(object.userData.legacyFbxRecovery),meshCount:prepared.meshCount,vertices});
 object.traverse((o:any)=>{if(o.isMesh){o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material]){for(const v of Object.values(m))if(v instanceof THREE.Texture)v.dispose();m.dispose();}}});
 }catch(e){output.push({...r,parse:'failed',error:String(e)});console.log('PARSE_FAILED',r.modelId,String(e));}
}
fs.writeFileSync('.runtime-cache/model-repair/audit/parsed.json',JSON.stringify(output,null,2));console.log('PARSING_AUDIT',JSON.stringify({total:output.length,failed:output.filter(r=>r.parse==='failed').map(r=>[r.modelId,r.error]),repaired:output.filter(r=>r.repairNodes).map(r=>[r.modelId,r.scenes,r.repairNodes])}));
