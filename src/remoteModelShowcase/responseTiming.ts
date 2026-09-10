import { apiUrl } from '../integration/apiClient';
import { isModelShowcaseSceneId } from './modelCatalog';

export interface ResponseTiming {
  id:number; traceId:string; scope:string; action:string; context:string;
  start:number; end:number|null; duration:number|null;
  status:'running'|'completed'|'failed'|'cancelled';
}
export type TimingTicket=ResponseTiming|null;
const scopes=new Map<string,ReadonlyArray<ResponseTiming>>();
const listeners=new Set<()=>void>();
const empty:ReadonlyArray<ResponseTiming>=[];
let sequence=0;
export const TIMED_SCENE='sim-visual-hydro-turbine';
const clock=()=>Math.floor(performance.timeOrigin+performance.now());
const sessionId=typeof crypto!=='undefined' && typeof crypto.randomUUID==='function'
  ? crypto.randomUUID()
  : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
export function timingSnapshot(scope:string){return scopes.get(scope)||empty;}
export function subscribeTiming(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
function publish(scope:string,rows:ReadonlyArray<ResponseTiming>){scopes.set(scope,rows);listeners.forEach(fn=>fn());}
function persistTiming(row:ResponseTiming) {
  if(!isModelShowcaseSceneId(row.scope) || row.end===null || row.duration===null || typeof window==='undefined')return;
  const pathname=`model-showcase/${row.scope}/data/forecast/logs/response`;
  void fetch(apiUrl(pathname),{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(row),keepalive:true,
  }).catch(()=>undefined);
}
export function beginTiming(scope:string,action:string,context=''):TimingTicket {
  if(!isModelShowcaseSceneId(scope))return null;
  const id=++sequence;
  const ticket:ResponseTiming={id,traceId:`${sessionId}-${id}`,scope,action,context,start:clock(),end:null,duration:null,status:'running'};
  publish(scope,[...timingSnapshot(scope),ticket]);
  return ticket;
}
export function pendingTiming(scope:string,action:string,context?:string):TimingTicket {
  const rows=timingSnapshot(scope);
  for(let index=rows.length-1;index>=0;index-=1){const row=rows[index];if(row.action===action&&row.status==='running'&&(context===undefined||row.context===context))return row;}
  return null;
}
export function finishTiming(ticket:TimingTicket,status:ResponseTiming['status']='completed') {
  if(!ticket || status==='running')return;
  const end=clock();
  let completed:ResponseTiming|null=null;
  const rows=timingSnapshot(ticket.scope).map(r=>{
    if(r.id!==ticket.id || r.status!=='running')return r;
    completed={...r,end,duration:end-r.start,status};
    return completed;
  });
  publish(ticket.scope,rows);
  if(completed)persistTiming(completed);
}
/** Finish only after the owning result has committed and had a browser paint opportunity. */
export function finishAfterPaint(ticket:TimingTicket,ready:()=>boolean=()=>true,status:ResponseTiming['status']='completed') {
  if(!ticket)return()=>{};
  if(document.visibilityState==='hidden'){finishTiming(ticket,'cancelled');return()=>{};}
  let stopped=false,frame=0;
  const cleanup=()=>{stopped=true;cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);};
  const visibility=()=>{if(document.visibilityState==='hidden'){finishTiming(ticket,'cancelled');cleanup();}};
  document.addEventListener('visibilitychange',visibility);
  const active=()=>!stopped && pendingTiming(ticket.scope,ticket.action)?.id===ticket.id;
  const paint=()=>{
    if(!active()){cleanup();return;}
    if(!ready()){
      if(clock()-ticket.start>120000){finishTiming(ticket,'failed');cleanup();return;}
      frame=requestAnimationFrame(paint);return;
    }
    frame=requestAnimationFrame(()=>{if(active())finishTiming(ticket,status);cleanup();});
  };
  frame=requestAnimationFrame(paint);
  return cleanup;
}
export function cancelTimings(scope:string){for(const r of timingSnapshot(scope))if(r.status==='running')finishTiming(r,'cancelled');}
export function clearTiming(scope:string,action:string){publish(scope,timingSnapshot(scope).filter(r=>r.action!==action));}
export function formatResponseDuration(ms:number|null){
  if(ms===null)return '计时中';
  if(ms<1)return `${(ms*1000).toFixed(0)} μs`;
  if(ms<1000)return `${ms.toFixed(1)} ms`;
  if(ms<60000)return `${(ms/1000).toFixed(2)} s`;
  return `${Math.floor(ms/60000)} min ${((ms%60000)/1000).toFixed(1)} s`;
}
