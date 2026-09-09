import type { InspectionField, InspectionRecord } from './dataInspection';
export interface TimelineForecast { field: string; timestamp: string; predicted: number; lower: number; upper: number }
export interface ForecastModel {field:string;method:string;period:number|null;trainingRecords:number;validationMae:number|null;baselineMae:number|null;validationPoints:number;validationHorizon:number}
export function buildDataTimeline(records: InspectionRecord[], fields: InspectionField[], deviceId: string | null, batchId: string | null, sampleIntervalSeconds: number, forecastInput: TimelineForecast[], horizon: string, forecastModels:ForecastModel[]=[]) {
  const selected = records.filter(r => r.device_id === deviceId && (!batchId || r.batch_id === batchId)).sort((a,b) => a.timestamp.localeCompare(b.timestamp));
  const history = selected.slice(-240).map(r => ({ timestamp:r.timestamp, quality:r.quality, values:r.values }));
  const intervals = history.slice(1).map((r,i) => (Date.parse(r.timestamp)-Date.parse(history[i].timestamp))/1000).filter(v=>v>0).sort((a,b)=>a-b);
  const observedIntervalSeconds = intervals.length >= 3 ? intervals[Math.floor(intervals.length/2)] : sampleIntervalSeconds;
  const usable = selected.filter(r => r.quality !== 'bad');
  const forecastOrigin = history.at(-1)?.timestamp || null;
  const forecastMessage = usable.length < 6 ? '有效历史不足 6 条，暂不展示预测。' : history.at(-1)?.quality === 'bad' ? '末条历史数据不可用，暂不从该时点生成预测。' : forecastInput.length===0?'最近连续、等间隔的有效数据不足，暂不展示预测。':'';
  const forecasts = forecastMessage || !forecastOrigin ? [] : forecastInput.filter(f => Date.parse(f.timestamp) > Date.parse(forecastOrigin));
  return {deviceId,batchId,fields,history,forecasts,forecastModels,forecastOrigin,forecastMessage,sampleIntervalSeconds,observedIntervalSeconds,horizon,totalRecords:selected.length,displayedRecords:history.length,trainingRecords:Math.min(720,usable.length)};
}
export function referenceStatus(value:number|null,field:Pick<InspectionField,'normalMin'|'normalMax'>) {
 return value===null||!Number.isFinite(value)?'unknown':value<field.normalMin?'low':value>field.normalMax?'high':'normal';
}
export type DataTimeline = ReturnType<typeof buildDataTimeline> & { dataVersion: string };
export function splitTimelineSegments(points:Array<{time:number;value:number|null}>, maxGap:number) {
  const segments:Array<Array<{time:number;value:number}>>=[];
  let current:Array<{time:number;value:number}>=[];
  for(const p of points){
    if(p.value===null || !Number.isFinite(p.value)){if(current.length)segments.push(current);current=[];continue;}
    if(current.length && p.time-current[current.length-1].time>maxGap){segments.push(current);current=[];}
    current.push({time:p.time,value:p.value});
  }
  if(current.length)segments.push(current);
  return segments;
}
export function referencePercent(value:number, field:Pick<InspectionField,'normalMin'|'normalMax'>) {
  return (value-field.normalMin)/Math.max(0.000001,field.normalMax-field.normalMin)*100;
}
