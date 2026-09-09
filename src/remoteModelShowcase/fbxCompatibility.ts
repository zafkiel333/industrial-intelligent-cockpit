/** Repair a narrow exporter defect: a Mesh geometry connected to a Model typed Null.
 * Null and Mesh are both four bytes: changing only that property preserves FBX offsets,
 * source geometry, transforms and materials. The downloaded source is never modified.
 */
export function repairFbxNullMeshNodes(input:ArrayBuffer):{buffer:ArrayBuffer;repairedNodes:number} {
 const bytes=new Uint8Array(input),text=new TextDecoder();
 if(text.decode(bytes.subarray(0,18))!=='Kaydara FBX Binary')return {buffer:input,repairedNodes:0};
 const view=new DataView(input);if(input.byteLength<27)return {buffer:input,repairedNodes:0};
 const wide=view.getUint32(23,true)>=7500,header=wide?25:13;
 const numberAt=(offset:number)=>wide?Number(view.getBigUint64(offset,true)):view.getUint32(offset,true);
 type Node={name:string;props:unknown[];strings:Map<number,number>;children:Node[]};
 let nodesSeen=0;
 const parse=(at:number,depth:number):{node:Node;end:number}|null=>{
  if(depth>64||++nodesSeen>100000||at+header>bytes.length)throw Error('Invalid FBX structure');
  const end=numberAt(at);if(!end)return null;
  const count=numberAt(at+(wide?8:4)),length=numberAt(at+(wide?16:8)),nameLength=bytes[at+header-1];
  if(!Number.isSafeInteger(end)||end<=at||end>bytes.length||count>100000)throw Error('Invalid FBX node');
  let cursor=at+header+nameLength;const propertyEnd=cursor+length;
  if(propertyEnd>end)throw Error('Invalid FBX properties');
  const node:Node={name:text.decode(bytes.subarray(at+header,cursor)),props:[],strings:new Map(),children:[]};
  for(let i=0;i<count;i++){
   const type=String.fromCharCode(bytes[cursor++]);let value:unknown;
   const sizes:Record<string,number>={Y:2,C:1,I:4,F:4,D:8,L:8};
   if(type==='S'||type==='R'){const size=view.getUint32(cursor,true);cursor+=4;if(cursor+size>propertyEnd)throw Error('Invalid FBX string');if(type==='S'){value=text.decode(bytes.subarray(cursor,cursor+size));node.strings.set(i,cursor);}cursor+=size;}
   else if('fdlibc'.includes(type)){const size=view.getUint32(cursor+8,true);value=view.getUint32(cursor,true);cursor+=12+size;}
   else if(sizes[type]){if(type==='L')value=Number(view.getBigInt64(cursor,true));else if(type==='I')value=view.getInt32(cursor,true);cursor+=sizes[type];}
   else throw Error('Unknown FBX property');
   if(cursor>propertyEnd)throw Error('Invalid FBX property length');node.props.push(value);
  }
  cursor=propertyEnd;
  while(cursor+header<=end){const child=parse(cursor,depth+1);if(!child)break;node.children.push(child.node);cursor=child.end;}
  return {node,end};
 };
 try{
  const roots:Node[]=[];let offset=27;
  while(offset+header<bytes.length){const parsed=parse(offset,0);if(!parsed)break;roots.push(parsed.node);offset=parsed.end;}
  const objects=roots.find(n=>n.name==='Objects')?.children||[];
  const geometries=new Set(objects.filter(n=>n.name==='Geometry'&&n.props[2]==='Mesh'&&n.children.some(c=>c.name==='Vertices'&&Number(c.props[0])>0)&&n.children.some(c=>c.name==='PolygonVertexIndex'&&Number(c.props[0])>0)).map(n=>n.props[0]));
  const links=roots.find(n=>n.name==='Connections')?.children.filter(n=>n.name==='C'&&n.props[0]==='OO')||[];
  const candidates=objects.filter(n=>n.name==='Model'&&n.props[2]==='Null'&&links.filter(c=>c.props[2]===n.props[0]&&geometries.has(c.props[1])).length===1);
  if(!candidates.length)return {buffer:input,repairedNodes:0};
  const output=input.slice(0),out=new Uint8Array(output);
  for(const node of candidates){const at=node.strings.get(2);if(at===undefined)throw Error('Missing FBX type');out.set([77,101,115,104],at);}
  return {buffer:output,repairedNodes:candidates.length};
 }catch{return {buffer:input,repairedNodes:0};}
}
