import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Clock3, Target, TrendingUp, RefreshCw, ShieldAlert, Waves, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { apiUrl } from '../../src/integration/apiClient';
import type { HydroRun } from '../../src/remoteModelShowcase/unifiedHydroService';
import type { DataOverview } from './ModelDataWorkspace';
import { chartHistory, forecastDeviation, thresholdStatus } from '../../src/remoteModelShowcase/metricComparison';
import { beginTiming, finishAfterPaint, pendingTiming } from '../../src/remoteModelShowcase/responseTiming';
import { ResponseTimingStrip } from './ResponseTiming';
interface MetricDefinition {field:string;label:string;unit:string;normal:[number,number]}
const methods:Record<string,string>={level:'稳健水平预测','damped-trend':'阻尼趋势预测',seasonal:'周期预测','harmonic-regression':'谐波回归与短期残差预测'};
const date = (s:string) => new Date(s).toLocaleString('zh-CN',{hour12:false});
const num = (v?:number|null) => v==null || !Number.isFinite(v) ? '--' : v.toLocaleString('zh-CN',{maximumFractionDigits:2});
const pct = (v?:number|null) => v == null ? '--' : `${(v*100).toFixed(1)}%`;

function PredictionTagComparison({run}:{run:HydroRun}) {
  const predicted=run.prediction.tag;
  const actual=run.labelKnown && (run.result?.actualTag==='normal' || run.result?.actualTag==='abnormal') ? run.result.actualTag : null;
  const label=(tag:'normal'|'abnormal')=>tag==='normal'?'正常':'异常';
  return <div className="hydro-tag-comparison" aria-label="预测与实际状态对比">
    <article className={`hydro-tag-card is-${predicted}`} data-tag={predicted} aria-label="预测状态"><span>预测状态 <small>预测 tag</small></span><strong>{predicted==='normal'?<CheckCircle2 size={24}/>:<ShieldAlert size={24}/>} {label(predicted)}</strong><p>由本次保存的预测结果给出</p></article>
    <div className={`hydro-tag-verdict ${actual ? predicted===actual?'is-match':'is-mismatch':''}`}><ArrowRight size={22}/><strong>{actual ? predicted===actual?'判断一致':'判断不一致':'等待实际标签'}</strong><small>{actual ? run.coverage===1?'本次状态核验结果':'当前为部分数据核验' : run.result?'验证文件未提供状态标签':'导入验证数据后对照'}</small></div>
    <article className={`hydro-tag-card is-${actual || 'pending'}`} data-tag={actual || 'pending'} aria-label="实际状态"><span>实际状态 <small>实际 tag</small></span><strong>{actual==='normal'?<CheckCircle2 size={24}/>:actual==='abnormal'?<ShieldAlert size={24}/>:<Clock3 size={24}/>} {actual?label(actual):run.result?'未提供标签':'待验证'}</strong><p>{actual?'来自验证数据的实际状态标签':'不将缺失标签视为正常'}</p></article>
  </div>;
}

function MetricTimeline({metric,history,run,syncId}:{metric:MetricDefinition;history:HydroRun['history'];run?:HydroRun|null;syncId:string}) {
  const {chart,min,max,latestValue,forecastBreaches,compared,outsideCount,mae}=useMemo(()=>{
    const entries=new Map<number,Record<string,unknown>>();
    chartHistory(history,metric.field).forEach(r=>{
      const value=r.quality==='bad'?null:r.values[metric.field];
      const status=thresholdStatus(value,metric.normal[0],metric.normal[1]);
      entries.set(Date.parse(r.timestamp),{time:Date.parse(r.timestamp),history:value,measuredBreach:status==='low'||status==='high'?value:null});
    });
    const forecasts=run?.prediction.forecasts.filter(f=>f.field===metric.field) || [];
    const forecastsByTime=new Map(forecasts.map(f=>[f.timestamp,f]));
    let forecastBreaches=0;
    forecasts.forEach(f=>{const time=Date.parse(f.timestamp),status=thresholdStatus(f.predicted,metric.normal[0],metric.normal[1]);const breach=status==='low'||status==='high';if(breach)forecastBreaches++;entries.set(time,{time,predicted:f.predicted,forecastBreach:breach?f.predicted:null,forecastRange:[f.lower,f.upper],forecastLower:f.lower,forecastUpper:f.upper})});
    const actualSeries=(run?.result?.actualSeries || []).slice().sort((a,b)=>a.timestamp.localeCompare(b.timestamp));
    const deviations:Array<NonNullable<ReturnType<typeof forecastDeviation>>>=[];
    actualSeries.forEach(r=>{
      const time=Date.parse(r.timestamp),value=r.values[metric.field],status=thresholdStatus(value,metric.normal[0],metric.normal[1]);
      const deviation=forecastDeviation(value,forecastsByTime.get(r.timestamp));
      if(deviation)deviations.push(deviation);
      entries.set(time,{...entries.get(time),time,actual:value,measuredBreach:status==='low'||status==='high'?value:null,delta:deviation?.delta,errorOutside:deviation?.outside});
    });
    const values=deviations.map(d=>Math.abs(d.delta));
    return {chart:[...entries.values()].sort((a,b)=>Number(a.time)-Number(b.time)),min:forecasts.length?Math.min(...forecasts.map(f=>f.predicted)):null,max:forecasts.length?Math.max(...forecasts.map(f=>f.predicted)):null,
      latestValue:actualSeries.length?actualSeries.at(-1)?.values[metric.field]:history.at(-1)?.quality==='bad'?null:history.at(-1)?.values[metric.field],forecastBreaches,compared:deviations.length,outsideCount:deviations.filter(d=>d.outside).length,mae:values.length?values.reduce((s,v)=>s+v,0)/values.length:null};
  },[history,run,metric]);
  const model=run?.prediction.models?.find(m=>m.field===metric.field);
  const status=thresholdStatus(latestValue,metric.normal[0],metric.normal[1]);
  const domain:[number,number]=[Number(chart[0]?.time||0),Number(chart.at(-1)?.time||1)];
  const dot=(color:string)=>(props:any)=>Number.isFinite(props.cx)&&Number.isFinite(props.cy)&&props.value!=null?<circle key={`${props.dataKey}-${props.index}`} cx={props.cx} cy={props.cy} r={2.8} fill={color} stroke="#fff" strokeWidth={0.6}/>:<g key={props.index}/>;
  return <article className="hydro-metric-timeline hydro-assessment-card" aria-label={`${metric.label}历史预测对照`}>
    <div className="hydro-metric-chart-heading"><h4>{metric.label}<small>{metric.unit}</small></h4><span>最新实测 <b>{num(latestValue)}</b></span></div>
    <div className="hydro-reading-verdicts"><span className={`is-${status}`} data-reading-status={status}>末次实测：{status==='normal'?'正常':status==='high'?'超上限':status==='low'?'低于下限':'待数据'}</span><span className={run?forecastBreaches?'is-forecast-alert':'is-normal':'is-pending'}>预测：{run?forecastBreaches?`${forecastBreaches} 个超限点`:'未见超限':'待生成'}</span></div>
    {chart.length ? <div className="hydro-metric-chart-canvas"><ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{width:640,height:245}}>
      <ComposedChart data={chart} syncId={syncId} syncMethod="value" margin={{top:20,right:18,bottom:5,left:0}}>
        <CartesianGrid stroke="#dbe7ee" strokeDasharray="3 5"/>
        <XAxis type="number" dataKey="time" domain={domain} tickCount={5} tickFormatter={n=>new Date(n).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})} tick={{fontSize:10}} minTickGap={35}/>
        <YAxis domain={['auto','auto']} tick={{fontSize:10}} tickFormatter={n=>num(n)} width={51}/>
        <Tooltip labelFormatter={n=>date(new Date(Number(n)).toISOString())} formatter={(value:any,name:any,item:any)=>{
          if(Array.isArray(value))return[`${value.map(v=>num(Number(v))).join(' ～ ')} ${metric.unit}`,name];
          const s=thresholdStatus(Number(value),metric.normal[0],metric.normal[1]);
          const deviation=name==='后续实测' && item.payload.delta!=null ? `；预测偏差 ${num(item.payload.delta)} ${metric.unit}（${item.payload.errorOutside?'超出经验范围':'经验范围内'}）` : '';
          return[`${num(Number(value))} ${metric.unit} · ${s==='normal'?'正常':s==='high'?'超上限':s==='low'?'低于下限':'待数据'}${deviation}`,name];
        }}/>
        <ReferenceLine y={metric.normal[0]} ifOverflow="extendDomain" stroke="#568474" strokeDasharray="6 4" label={{value:`正常下限 ${metric.normal[0]}`,position:'insideBottomLeft',fill:'#568474',fontSize:10}}/>
        <ReferenceLine y={metric.normal[1]} ifOverflow="extendDomain" stroke="#568474" strokeDasharray="6 4" label={{value:`正常上限 ${metric.normal[1]}`,position:'insideTopLeft',fill:'#568474',fontSize:10}}/>
        <Area dataKey="forecastRange" name="预测误差范围" fill="#e9c78f" fillOpacity={0.24} stroke="none" isAnimationActive={false}/>
        <Line dataKey="forecastLower" stroke="#c4a879" strokeOpacity={0.7} strokeWidth={0.9} strokeDasharray="2 4" dot={false} activeDot={false} tooltipType="none" isAnimationActive={false}/>
        <Line dataKey="forecastUpper" stroke="#c4a879" strokeOpacity={0.7} strokeWidth={0.9} strokeDasharray="2 4" dot={false} activeDot={false} tooltipType="none" isAnimationActive={false}/>
        <Line dataKey="history" name="历史实测" stroke="#087eaa" strokeWidth={1.9} dot={false} isAnimationActive={false}/>
        <Line dataKey="predicted" name="预测数值" stroke="#c87918" strokeDasharray="6 4" strokeWidth={1.9} dot={false} isAnimationActive={false}/>
        <Line dataKey="actual" name="后续实测" stroke="#198771" strokeWidth={1.9} dot={false} isAnimationActive={false}/>
        <Line dataKey="measuredBreach" name="实测超限" stroke="none" dot={dot('#ce4f55')} activeDot={false} tooltipType="none" isAnimationActive={false}/>
        <Line dataKey="forecastBreach" name="预测超限" stroke="none" dot={dot('#b94854')} activeDot={false} tooltipType="none" isAnimationActive={false}/>
        {run&&<ReferenceLine x={Date.parse(run.observation.endAt)} stroke="#829aa9" strokeDasharray="3 4" label={{value:'预测起点',position:'insideTopRight',fill:'#718a9c',fontSize:10}}/>}
      </ComposedChart>
    </ResponsiveContainer></div>:<div className="hydro-chart-empty">等待设备历史</div>}
    <div className="hydro-metric-chart-footer"><span>正常上下限 {metric.normal[0]} — {metric.normal[1]} {metric.unit}</span><span>{run?`预测 ${num(min)} — ${num(max)}`:'待生成预测'}</span></div>
    <div className="hydro-inline-error" aria-label={`${metric.label}预测偏差摘要`}><span className={compared?outsideCount?'is-large':'is-within':'is-pending'} data-deviation-status={compared?outsideCount?'outside':'within':'pending'}>{compared?outsideCount?'偏差超出经验范围':'偏差在经验范围内':'偏差待验证'}</span><small>{compared?`平均偏差 ${num(mae)} ${metric.unit} · 超出范围 ${outsideCount}/${compared} 点`:'导入后续实测后核验'}</small></div>
    {model&&<p className="hydro-metric-method">{methods[model.method] || model.method}{model.period?` · 周期约 ${num(model.period*(run!.prediction.sampleIntervalSeconds||60)/60)} 分钟`:''}</p>}
  </article>;
}
async function json<T>(url:string, init?:RequestInit):Promise<T> {
  const r=await fetch(apiUrl(url),{...init,headers:{'Content-Type':'application/json'}});
  const body=await r.json(); if(!r.ok) throw new Error(body.error?.message || '读取数据失败'); return body;
}
interface Summary { verifiedCases:number; predictedCases:number; statusCount:number; conclusionCount:number; metrics:{statusAccuracy:number|null;conclusionAccuracy:number|null;normalizedMae:number|null;smape:number|null} }
interface Reference { deviceId:string;history:HydroRun['history'];record:HydroRun|null }
type Props={viewer:React.ReactNode;overview:DataOverview|null;deviceId:string;batchId:string;revision:number;onSelect:(device:string,batch:string)=>void;onRun:(id:string)=>void};

export function HydroUnifiedContent({viewer,overview,deviceId,revision,onSelect,onRun}:Props) {
  const sceneId=overview?.sceneId || 'sim-visual-hydro-turbine';
  const base=`model-showcase/${sceneId}/data/forecast`;
  const fields=useMemo<MetricDefinition[]>(()=>overview?.profile.fields.map(field=>({field:field.field,label:field.label,unit:field.unit,normal:[field.normalMin,field.normalMax]})) || [],[overview?.profile.fields]);
  const thresholdModel=overview?.profile.thresholdModel || null;
  const TIMED_SCENE=sceneId;
  const HYDRO_THRESHOLD_MODEL={name:thresholdModel?.name || '阈值诊断模型',version:thresholdModel?.version || '--',legacyVersion:thresholdModel?.version || '--'};
  const [reference,setReference]=useState<Reference|null>(null);
  const [summary,setSummary]=useState<Summary|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [refresh,setRefresh]=useState(0);
  const [deleteOpen,setDeleteOpen]=useState(false);
  const firstRead=useRef(true);
  const summaryReady=useRef(false);
  useEffect(()=>{
    const controller=new AbortController();
    setReference(null); onRun(''); setError('');
    if(deviceId && firstRead.current){firstRead.current=false;beginTiming(TIMED_SCENE,'设备数据读取',deviceId);}
    if(deviceId) void json<Reference>(`${base}/reference?${new URLSearchParams({deviceId})}`,{signal:controller.signal}).then(response=>{
      if(!controller.signal.aborted){setReference(response);onRun(response.record?.caseId || '');}
    }).catch(e=>{if(e.name!=='AbortError'){
      setError(e.message);
      for(const action of ['设备数据读取','预测结果生成','历史入库'])finishAfterPaint(pendingTiming(TIMED_SCENE,action,deviceId),undefined,'failed');
      finishAfterPaint(pendingTiming(TIMED_SCENE,'验证结果展示'),undefined,'failed');
    }});
    return ()=>controller.abort();
  },[deviceId,overview?.dataVersion,revision,refresh,onRun]);
  useEffect(()=>{
    const c=new AbortController();
    summaryReady.current=false;
    void json<Summary>(`${base}/summary`,{signal:c.signal}).then(value=>{summaryReady.current=true;setSummary(value);}).catch(e=>{if(e.name!=='AbortError'){setError(e.message);finishAfterPaint(pendingTiming(TIMED_SCENE,'验证结果展示'),undefined,'failed');}});
    return ()=>c.abort();
  },[revision,refresh]);
  useLayoutEffect(()=>{
    if(!reference || reference.deviceId!==deviceId)return;
    const ready=()=>{
      const root=document.querySelector('.hydro-unified');
      return root?.getAttribute('data-rendered-device')===deviceId && (!reference.history.length || root.querySelectorAll('.hydro-metric-timeline .recharts-wrapper').length===6);
    };
    const cancellations=['设备数据读取','预测结果生成','历史入库'].map(action=>finishAfterPaint(pendingTiming(TIMED_SCENE,action,deviceId),ready));
    if(reference.record?.result && summaryReady.current)cancellations.push(finishAfterPaint(pendingTiming(TIMED_SCENE,'验证结果展示',reference.record.caseId),ready));
    return()=>cancellations.forEach(cancel=>cancel());
  },[reference,summary,deviceId]);
  const current=reference?.deviceId===deviceId ? reference : null;
  const run=current?.record;
  const history=current?.history || [];
  const alerts=run?.prediction.alerts || [];
  const firstAt=run?.prediction.forecasts[0]?.timestamp;
  const endAt=run?.prediction.forecasts.at(-1)?.timestamp;
  const summaries=fields.map(f=>{
    const values=run?.prediction.forecasts.filter(p=>p.field===f.field).map(p=>p.predicted) || [];
    return {...f,min:values.length?Math.min(...values):null,max:values.length?Math.max(...values):null,end:values.at(-1),last:history.at(-1)?.values[f.field],model:run?.prediction.models?.find(m=>m.field===f.field)};
  });
  const predict=async()=>{
    const timing=beginTiming(TIMED_SCENE,'预测结果生成',deviceId);
    setBusy(true);setError('');
    try {await json<HydroRun>(`${base}/reference`,{method:'POST',body:JSON.stringify({deviceId})});setRefresh(v=>v+1);}
    catch(e){setError(e instanceof Error?e.message:'预测失败');finishAfterPaint(timing,undefined,'failed');}finally{setBusy(false);}
  };
  const remove=async()=>{
    if(!run)return;setBusy(true);
    try{await json(`${base}/runs/${run.caseId}`,{method:'DELETE'});setRefresh(v=>v+1);setDeleteOpen(false);}
    catch(e){setError(e instanceof Error?e.message:'删除失败');}finally{setBusy(false);}
  };
  return <div className="hydro-unified hydro-refined" data-rendered-device={reference?.deviceId || ''} aria-label="设备统一分析工作区">
    <div className="hydro-context-bar">
      <label>当前设备<select aria-label="当前设备" disabled={busy} value={deviceId} onChange={e=>{beginTiming(TIMED_SCENE,'设备数据读取',e.target.value);onSelect(e.target.value,'');}}><option value="" disabled>请选择设备</option>{overview?.devices.map(d=><option key={d}>{d}</option>)}</select></label>
      <div className="hydro-history-identity"><strong>设备当前历史</strong><span>{history.length ? `${history.length.toLocaleString()} 条 · ${date(history[0].timestamp)} — ${date(history.at(-1)!.timestamp)}` : deviceId?'读取设备历史中':'请导入历史数据'}</span></div>
      <button className="model-data-button is-primary" disabled={busy || history.length<24 || !!run} onClick={()=>void predict()}><TrendingUp size={16}/>{busy?'正在生成预测':run?'预测已生成':'生成预测'}</button>
      <button className="model-data-icon-button" title="刷新设备历史与预测" disabled={busy} onClick={()=>{beginTiming(TIMED_SCENE,'设备数据读取',deviceId);setRefresh(v=>v+1);}}><RefreshCw size={16}/></button>
    </div>
    <ResponseTimingStrip scope={TIMED_SCENE} actions={['设备数据读取','历史入库']} context={deviceId} placement="context"/>
    <div className="hydro-workflow"><span className={history.length?'is-done':''}><b>01</b>历史数据<small>{history.length?`${history.length} 条已保存`:'等待导入'}</small></span><ArrowRight/><span className={run?'is-done':''}><b>02</b>运行预测<small>{run?run.prediction.horizon:'基于当前历史'}</small></span><ArrowRight/><span className={run?.result?'is-done':''}><b>03</b>实测核验<small>{run?.result?`已覆盖 ${pct(run.coverage)}`:'独立导入验证数据'}</small></span></div>
    {error && <div role="alert" className="model-data-error">{error}</div>}
    <div className="hydro-unified-top">
      <div className="hydro-viewer">{viewer}</div>
      <section className="hydro-current-panel"><header><h3>运行指标概览</h3><small>设备历史末次记录 · 全部关键趋势在下方同时展示</small></header>
        <div className="hydro-measurements">{fields.map(f=>{const v=history.at(-1)?.values[f.field];const outside=v!=null && (v<f.normal[0]||v>f.normal[1]);return <article key={f.field} className={outside?'has-risk':''}><span>{f.label}<i>{v==null?'待数据':outside?'超出参考':'参考范围内'}</i></span><strong>{num(v)}<small>{f.unit}</small></strong><small>参考 {f.normal[0]} — {f.normal[1]} {f.unit}</small></article>})}</div>
        <div className="hydro-current-explanation"><Clock3 size={17}/><p>每台设备只保留一份当前历史。追加会扩充记录，替换会更新全部历史；预测始终以更新后的数据为依据。</p></div>
      </section>
    </div>

    <section className="hydro-series-panel" aria-label="预测结果">
      <header><div className="hydro-section-title"><span className="hydro-section-number">01</span><div><h3>多指标预测结果</h3><p>{run?`${date(run.prediction.generatedAt)} 生成 · ${run.prediction.horizon}`:'全部关键趋势同时展示，生成预测后接续显示未来变化'}</p></div></div><div className="hydro-section-response"><span>统一时间轴 · 独立量纲</span><ResponseTimingStrip scope={TIMED_SCENE} action="预测结果生成" context={deviceId} placement="header"/></div></header>
      <div className="hydro-shared-legend" aria-label="图表图例"><span><i className="is-history"/>历史实测</span><span><i className="is-forecast"/>预测数值</span><span><i className="is-actual"/>后续实测</span><span><i className="is-limit-line"/>正常上下限</span><span><i className="is-forecast-range"/>预测误差范围</span><span><i className="is-limit-point"/>超限点</span></div>
      <p className="hydro-assessment-guide">绿色水平虚线标出正常上下限；浅橙色带随预测曲线变化，表示历史回测估计的误差范围。悬停可同时查看实测状态、预测值和偏差。</p>
      <div className="hydro-multichart-grid">{fields.map(metric=><MetricTimeline key={metric.field} metric={metric} history={history} run={run} syncId={`hydro-${deviceId}`}/>)}</div>
      {run && <>
        <div className="hydro-analysis-note"><Waves size={18}/><p>各项指标分别拟合和回测；偏差判断使用保存预测时的历史误差参考，不随验证值调整。预测范围不是现场验收容差，远期趋势仍需后续实测核验。</p></div>
        <details className="hydro-evidence"><summary>预测依据与适用范围</summary><p>参考 {history.length} 条历史；实际拟合使用末段连续有效数据，最多 720 条。采用时间先后划分的留出回测，验证实测不参与拟合。预测覆盖 {run.prediction.horizon}，各指标的历史回测跨度见下方。</p><div className="hydro-model-evidence">{run.prediction.models?.map(m=><article key={m.field}><b>{fields.find(f=>f.field===m.field)?.label}</b><span>{methods[m.method]}</span><small>拟合 {m.trainingRecords} 条 · 回测跨度最长 {num(m.validationHorizon*(run.prediction.sampleIntervalSeconds||60)/60)} 分钟</small><small>回测 MAE {num(m.validationMae)} / 基线 {num(m.baselineMae)} {fields.find(f=>f.field===m.field)?.unit}</small></article>)}</div><p>短历史中的周期仍需后续实测核验；模型参考阈值用于运行筛查，不替代设备厂家和现场确认的保护定值。</p></details>
      </>}
    </section>

    <section className={`hydro-warning-panel ${run?.prediction.tag==='abnormal'?'has-warning':''}`} aria-label="预警与处置建议">
      <header><div className="hydro-section-title"><span className="hydro-section-number">02</span><div><h3>预警与处置建议</h3><p>关注触发指标、预计时间、对应部位和排查顺序</p></div></div><ShieldAlert size={21}/></header>
      <div className="threshold-model-version"><ShieldAlert size={14}/><span>{HYDRO_THRESHOLD_MODEL.name}</span><strong data-localization="preserve">{run ? run.prediction.thresholdModelVersion || HYDRO_THRESHOLD_MODEL.legacyVersion : HYDRO_THRESHOLD_MODEL.version}</strong></div>
      {run?<><div className="hydro-warning-overview"><div className={`hydro-tag ${run.prediction.tag}`}>{run.prediction.tag==='normal'?'趋势平稳':'发现风险线索'}</div><div><h4>{run.prediction.tag==='normal'?'预测范围内未发现明确故障趋势':run.prediction.faultName}</h4><p>{run.prediction.conclusion}</p><small>重点部位：{run.prediction.faultPart} · 状态为趋势判断，故障部位需结合现场检查确认</small></div><div className="hydro-warning-count"><strong>{alerts.length}</strong><span>项持续越界预警</span></div></div>
        {alerts.length>0?<div className="hydro-alert-cards">{alerts.map(a=><article key={a.field}><div><b>{a.label} · {a.direction==='high'?'高于上限':'低于下限'}</b><span>{a.severity==='critical'?'高关注':a.severity==='warning'?'预警':'关注'}</span></div><h4>{a.part}</h4><dl><dt>该段开始</dt><dd>{date(a.firstAt)}</dd><dt>连续时长</dt><dd>{num(a.durationMinutes)} 分钟</dd><dt>预测峰值</dt><dd>{num(a.peakValue)} {a.unit}</dd><dt>参考阈值</dt><dd>{a.normalMin} — {a.normalMax} {a.unit}</dd></dl><small>按最长连续越界段展示，非单点波动触发</small></article>)}</div>:<div className="hydro-within-limits">{summaries.map(f=><div key={f.field}><CheckCircle2 size={15}/><span>{f.label}</span><small>持续越界：未触发</small></div>)}</div>}
        <div className="hydro-inspection-plan"><h4>{run.prediction.tag==='normal'?'常规检查建议':'建议排查顺序'}</h4>{(run.prediction.tag==='normal' ? run.prediction.candidates?.slice(0,2) : run.prediction.candidates)?.map((c,i)=><article key={c.faultCode}><b>{String(i+1).padStart(2,'0')}</b><div><h4>{c.faultName}</h4><p>{c.recommendation}</p><small>历史证据：{c.evidence.map(e=>e.split('，风险贡献')[0]).join('；')}</small></div></article>)}<p>建议结合当前工况与现场检查结果确认处置优先级。</p></div>
      </>:<div className="model-data-empty">生成预测后展示风险状态、阈值依据及部位排查建议</div>}
    </section>

    <section className="hydro-verification-panel" aria-label="当前预测核验"><header><div className="hydro-section-title"><span className="hydro-section-number">03</span><div><h3>实测核验与累计成效</h3><p>原预测保持不变，使用后续实测评估数值与结论</p></div></div><div className="hydro-section-response"><CheckCircle2 size={21}/><ResponseTimingStrip scope={TIMED_SCENE} action="验证结果展示" context={run?.caseId || 'not-ready'} placement="header"/></div></header>
      {run && <PredictionTagComparison run={run}/>}
      {run?.result?<><div className="hydro-verification-facts"><div><span data-localization="preserve">本次对称误差（sMAPE）</span><strong>{pct(run.result.smape)}</strong><small>预测值与实测值的相对偏差，越低越好</small></div><div><span>当前归一化误差</span><strong>{pct(run.result.normalizedMae)}</strong></div><div><span>状态判断核验</span><strong>{run.labelKnown?run.result.statusCorrect?'一致':'有偏差':'缺实际标签'}</strong><small>{run.labelKnown?`预测${run.prediction.tag==='normal'?'正常':'异常'} / 实测${run.result.actualTag==='normal'?'正常':'异常'}`:'仅核验数值误差'}</small></div><div><span>故障结论核验</span><strong>{run.result.conclusionCorrect==null?'缺故障依据':run.result.conclusionCorrect?'一致':'有偏差'}</strong></div></div><p className="hydro-analysis-caption">{run.coverage===1?'已纳入相应累计指标':'尚未覆盖全部预测时间，请补充后续实测；完成后计入累计统计'} · 经验区间覆盖率 {pct(run.result.intervalCoverage)}</p><div className="hydro-field-error">{run.result.fieldMetrics.map(m=><div key={m.field}><span>{m.label}</span><b>MAE {num(m.mae)} {m.unit}</b><small>RMSE {num(m.rmse)} · 归一化 {pct(m.normalizedMae)}</small></div>)}</div></>:<div className="hydro-verification-pending"><Target size={25}/><div><h4>{run?'等待后续实测核验':'先生成预测，再对照后续实测'}</h4><p>点击顶部“导入验证数据”，传入对应设备和预测时间段的实测文件。结果会接入上方同一张图表。</p></div></div>}
      <div className="hydro-cumulative"><header><h3>累计核验成效</h3><small>按已完成核验统计 · 不因切换设备而改变</small></header><div>{[{label:'已完成核验',value:String(summary?.verifiedCases||0),detail:'次完整时间核验'},{label:'状态准确率',value:pct(summary?.metrics.statusAccuracy),detail:`${summary?.statusCount||0} 次有标签核验`},{label:'综合结论准确率',value:pct(summary?.metrics.conclusionAccuracy),detail:`${summary?.conclusionCount||0} 次有效结论核验`},{label:'平均归一化误差',value:pct(summary?.metrics.normalizedMae),detail:`对称误差 ${pct(summary?.metrics.smape)}`}].map(m=><article key={m.label}><span>{m.label}</span><strong>{m.value}</strong><small>{m.detail}</small></article>)}</div></div>
    </section>
    {run && <div className="hydro-run-footer"><span>预测数据截止 {date(run.observation.endAt)} · {firstAt&&endAt?`${date(firstAt)} — ${date(endAt)}`:''}</span><button type="button" onClick={()=>setDeleteOpen(true)}>删除本次预测及核验</button></div>}
    {deleteOpen&&<div className="model-data-modal-overlay" role="dialog" aria-modal="true" aria-label="确认删除预测"><div className="model-data-modal"><div className="model-data-modal-body"><h3>删除本次预测及核验？</h3><p>将移出对应累计统计，设备历史数据保留。</p></div><footer className="model-data-modal-footer"><button className="model-data-button" disabled={busy} onClick={()=>setDeleteOpen(false)}>取消</button><button className="model-data-button" disabled={busy} onClick={()=>void remove()}>确认删除</button></footer></div></div>}
  </div>;
}
