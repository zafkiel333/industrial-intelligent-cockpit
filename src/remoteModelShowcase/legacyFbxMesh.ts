import * as THREE from 'three';

/** Narrow reader for the nonstandard step_to_fbx_png.py single-mesh export.
 * Keeps its original positions, triangle indices and normals; never fabricates a substitute model.
 */
export function readLegacyStepFbx(input:ArrayBuffer):THREE.Group|null {
 const bytes=new Uint8Array(input),view=new DataView(input),text=new TextDecoder();
 if(bytes.length<256||view.getUint32(23,true)!==7400||view.getUint32(27,true)!==bytes.length||bytes[35]!==0||!text.decode(bytes.subarray(0,256)).includes('step_to_fbx_png.py'))return null;
 type ArrayValue={kind:string;count:number;offset:number;length:number;encoding:number};
 type Value=string|number|ArrayValue|undefined;
 type Node={name:string;props:Value[];children:Node[];end:number};let seen=0;
 const property=(at:number):{value:Value;end:number}=>{
  const type=String.fromCharCode(bytes[at++]);const size:Record<string,number>={Y:2,C:1,I:4,F:4,D:8,L:8};let value:Value;
  if(type==='S'||type==='R'){const n=view.getUint32(at,true);at+=4;if(at+n>bytes.length)throw Error('旧版 FBX 字符串不完整');if(type==='S')value=text.decode(bytes.subarray(at,at+n));at+=n;}
  else if('fdlibc'.includes(type)){const count=view.getUint32(at,true),encoding=view.getUint32(at+4,true),length=view.getUint32(at+8,true);value={kind:type,count,encoding,offset:at+12,length};at+=12+length;}
  else if(size[type]){value=type==='Y'?view.getInt16(at,true):type==='I'?view.getInt32(at,true):undefined;at+=size[type];}
  else throw Error('旧版 FBX 属性类型不支持');
  if(at>bytes.length)throw Error('旧版 FBX 数据不完整');return {value,end:at};
 };
 const parse=(at:number,depth=0):Node=>{
  if(++seen>10000||depth>32||at+9>bytes.length)throw Error('旧版 FBX 结构无效');
  const end=view.getUint32(at,true),count=view.getUint32(at+4,true);if(end<=at||end>bytes.length||count>10000)throw Error('旧版 FBX 节点无效');
  let cursor=at+8;const props:Value[]=[];for(let i=0;i<count;i++){const p=property(cursor);props.push(p.value);cursor=p.end;}
  const len=bytes[cursor++],name=text.decode(bytes.subarray(cursor,cursor+len));cursor+=len;const children:Node[]=[];
  while(cursor<end){const child=parse(cursor,depth+1);children.push(child);cursor=child.end;}
  if(cursor!==end)throw Error('旧版 FBX 节点偏移无效');return {name,props,children,end};
 };
 const root=parse(27),objects=root.children.find(n=>n.name==='Objects')?.children||[];
 const geometries=objects.filter(n=>n.name.startsWith('Geometry::')),models=objects.filter(n=>n.name.startsWith('Model::'));
 if(geometries.length!==1||models.length!==1||models[0].children.find(n=>n.name==='Properties70')?.children.length)throw Error('旧版 FBX 不是可安全恢复的单网格导出');
 const geo=geometries[0];
 const array=(n:Node|undefined,kind:string)=>{const a=n?.props[0];if(!a||typeof a!=='object'||a.kind!==kind||a.encoding!==0||a.count>8000000||a.length!==a.count*(kind==='d'?8:4)||a.offset+a.length>bytes.length)throw Error('旧版 FBX 网格数组无效');return a;};
 const positions=array(geo.children.find(n=>n.name==='Vertices'),'d'),indices=array(geo.children.find(n=>n.name==='PolygonVertexIndex'),'i');
 if(!positions.count||positions.count%3||indices.count%3)throw Error('旧版 FBX 三角网格不完整');
 const position=new Float32Array(positions.count);for(let i=0;i<position.length;i++){const v=view.getFloat64(positions.offset+i*8,true);if(!Number.isFinite(v)||Math.abs(v)>1e20)throw Error('旧版 FBX 坐标无效');position[i]=v;}
 const index=new Uint32Array(indices.count);for(let i=0;i<index.length;i++){const raw=view.getInt32(indices.offset+i*4,true);if((i%3===2)!==(raw<0))throw Error('旧版 FBX 包含未三角化面');const v=raw<0?~raw:raw;if(v>=position.length/3)throw Error('旧版 FBX 索引越界');index[i]=v;}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(position,3));geometry.setIndex(new THREE.BufferAttribute(index,1));
 const normalNode=geo.children.find(n=>n.name==='LayerElementNormal')?.children.find(n=>n.name==='Normals');
 if(normalNode){const source=array(normalNode,'d');if(source.count!==position.length)throw Error('旧版 FBX 法线数量无效');const normals=new Float32Array(source.count);for(let i=0;i<normals.length;i++){const value=view.getFloat64(source.offset+i*8,true);if(!Number.isFinite(value))throw Error('旧版 FBX 法线无效');normals[i]=value;}geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));}else geometry.computeVertexNormals();
 const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:'#b9ccd6',roughness:.65,metalness:.15,side:THREE.DoubleSide}));mesh.name=geo.name.slice('Geometry::'.length);
 // The audited export has its mast along -Z and omits GlobalSettings.UpAxis.
 // Rotate -Z onto Three.js +Y so the sail stands above the hull.
 const group=new THREE.Group();group.add(mesh);group.rotation.x=Math.PI/2;group.userData.legacyFbxRecovery=true;return group;
}
