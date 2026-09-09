export interface InspectionRecord {
  timestamp: string;
  device_id: string;
  batch_id: string;
  quality: 'good' | 'uncertain' | 'bad';
  values: Record<string, number>;
}
export interface InspectionField { field: string; label: string; unit: string; normalMin: number; normalMax: number; decimals: number }
export function buildDataInspection(records: InspectionRecord[], fields: InspectionField[], deviceId: string | null, batchId: string | null) {
  const selected = records.filter(r => r.device_id === deviceId && (!batchId || r.batch_id === batchId)).sort((a,b) => a.timestamp.localeCompare(b.timestamp));
  const start = selected.length ? Date.parse(selected[0].timestamp) : null;
  const end = selected.length ? Date.parse(selected[selected.length - 1].timestamp) : null;
  const binCount = start === end ? (start === null ? 0 : 1) : 12;
  const width = start !== null && end !== null ? Math.max(1, (end - start + 1) / Math.max(1,binCount)) : 1;
  const groups: InspectionRecord[][] = Array.from({length:binCount},()=>[]);
  for (const r of selected) groups[Math.min(binCount-1,Math.floor((Date.parse(r.timestamp)-start!)/width))].push(r);
  const summarize = (rows: InspectionRecord[], f: InspectionField) => {
    const usable = rows.filter(r => r.quality !== 'bad' && Number.isFinite(r.values[f.field]));
    const values = usable.map(r => r.values[f.field]);
    const outsideCount = values.filter(v=>v < f.normalMin || v > f.normalMax).length;
    return {count:rows.length, usableCount:values.length, badCount:rows.filter(r=>r.quality==='bad').length, uncertainCount:rows.filter(r=>r.quality==='uncertain').length,
      outsideCount, min:values.length?values.reduce((a,b)=>Math.min(a,b),Infinity):null, max:values.length?values.reduce((a,b)=>Math.max(a,b),-Infinity):null,
      latest:values.length?values[values.length-1]:null, latestAt:usable.at(-1)?.timestamp || null, latestQuality:usable.at(-1)?.quality || null,
      status:!rows.length?'empty':!values.length?'bad':outsideCount?'outside':rows.some(r=>r.quality!=='good')?'review':'normal'};
  };
  return {deviceId,batchId,recordCount:selected.length, startAt:start===null?null:new Date(start).toISOString(), endAt:end===null?null:new Date(end).toISOString(),
    quality:{good:selected.filter(r=>r.quality==='good').length,uncertain:selected.filter(r=>r.quality==='uncertain').length,bad:selected.filter(r=>r.quality==='bad').length},
    outsideRecordCount:selected.filter(r=>r.quality!=='bad' && fields.some(f=>Number.isFinite(r.values[f.field]) && (r.values[f.field]<f.normalMin || r.values[f.field]>f.normalMax))).length,
    fields:fields.map(f=>({...f,...summarize(selected,f)})),
    bins:groups.map((rows,i)=>({startAt:new Date(start!+i*width).toISOString(),endAt:new Date(i===binCount-1?end!:start!+(i+1)*width).toISOString(),fields:fields.map(f=>({field:f.field,...summarize(rows,f)}))}))};
}
