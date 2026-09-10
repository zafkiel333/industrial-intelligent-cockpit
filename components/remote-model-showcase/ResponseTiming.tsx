import React,{useSyncExternalStore} from 'react';
import {CircleDot,Clock3,Flag,Timer} from 'lucide-react';
import {formatResponseDuration,subscribeTiming,timingSnapshot,type ResponseTiming} from '../../src/remoteModelShowcase/responseTiming';

function timestamp(value:number|null){
  if(value===null)return '等待结束';
  const d=new Date(value),pad=(n:number,w=2)=>String(n).padStart(w,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(),3)}`;
}
function TimingRow({row}:{row:ResponseTiming}) {
  const state=row.status==='running'?'处理中':row.status==='failed'?'未完成':row.status==='cancelled'?'计时已中止':'已完成';
  return <div className={`response-timing-row is-${row.status}`} data-action={row.action} data-start={row.start} data-end={row.end??''} data-duration={row.duration??''} data-status={row.status}>
    <span className="response-timing-action"><Clock3 size={14}/><span><b>{row.action}</b><small>{state}</small></span></span>
    <span className="response-timing-flow">
      <span className="response-timing-stamp is-start" data-localization="preserve"><span className="response-timing-node"><CircleDot size={12}/></span><span className="response-timing-copy"><b>T_start</b><time>{timestamp(row.start)}</time></span></span>
      <span className="response-timing-stamp is-end" data-localization="preserve"><span className="response-timing-node"><Flag size={12}/></span><span className="response-timing-copy"><b>T_end</b><time>{timestamp(row.end)}</time></span></span>
      <span className="response-timing-result" data-localization="preserve"><span className="response-timing-node"><Timer size={12}/></span><span className="response-timing-copy"><b>Δt · 本次响应</b><strong className="response-timing-duration">{formatResponseDuration(row.duration)}</strong></span></span>
    </span>
  </div>;
}
export function ResponseTimingStrip({scope,action,actions,context,placement='default'}:{scope:string;action?:string;actions?:string[];context?:string;placement?:'default'|'context'|'header'|'footer'}) {
  const rows=useSyncExternalStore(subscribeTiming,()=>timingSnapshot(scope));
  const row=rows.filter(r=>(r.action===action || actions?.includes(r.action)) && (context===undefined || r.context===context)).at(-1);
  return row?<div className={`response-timing-local is-${placement}`}><TimingRow row={row}/></div>:null;
}
