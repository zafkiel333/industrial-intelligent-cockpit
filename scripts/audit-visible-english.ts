import fs from 'node:fs';import path from 'node:path';import ts from 'typescript';
import {translateVisibleText} from '../src/localization/chineseUi';
const found=new Map<string,{translated:string;files:Set<string>}>();let files=0;
function scan(dir:string){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory()){scan(p);continue;}if(!p.endsWith('.tsx'))continue;files++;
const source=ts.createSourceFile(p,fs.readFileSync(p,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const add=(text:string)=>{text=text.trim();if(!text||text.length>180)return;const translated=translateVisibleText(text);if(!/[A-Za-z]{3,}/.test(translated)||/https?:|[\w-]+\.(?:csv|pdf|fbx|glb|json|tsx)|^[\w]+[-_]\w+|^#[0-9a-f]+$/i.test(translated))return;const old=found.get(text)||{translated,files:new Set<string>()};old.files.add(p);found.set(text,old);};
function visit(n:ts.Node){if(ts.isJsxText(n))add(n.text);if(ts.isStringLiteral(n)){const parent=n.parent;if(ts.isJsxAttribute(parent)&&['title','placeholder','aria-label','label','subtitle'].includes(parent.name.getText(source)))add(n.text);if(ts.isPropertyAssignment(parent)&&['name','label','title','desc','description','status','stage','risk','type','eta'].includes(parent.name.getText(source).replace(/['"]/g,'')))add(n.text);if(ts.isJsxExpression(parent))add(n.text);}ts.forEachChild(n,visit);}visit(source);
}}
scan('views');scan('components');
const rows=[...found].map(([text,v])=>({text,translated:v.translated,files:[...v.files]})).sort((a,b)=>b.files.length-a.files.length);
fs.mkdirSync('.runtime-cache/model-repair',{recursive:true});fs.writeFileSync('.runtime-cache/model-repair/english-audit.json',JSON.stringify({files,rows},null,2));console.log('ENGLISH_SOURCE_AUDIT',files,'files',rows.length,'candidates');console.log(rows.slice(0,95).map(r=>r.text+' => '+r.translated+' ['+r.files.length+']').join('\n'));
