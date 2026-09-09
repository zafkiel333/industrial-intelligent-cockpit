import assert from 'node:assert/strict';
import fs from 'node:fs';
import {adaptiveForecast,forecastTraining} from '../src/remoteModelShowcase/adaptiveForecast';
import {referenceStatus} from '../src/remoteModelShowcase/dataTimeline';
const wave=(i:number)=>12+8*Math.sin(i*2*Math.PI/19);
const periodic=adaptiveForecast(Array.from({length:240},(_,i)=>wave(i)),24,0);
assert.equal(periodic.method,'seasonal');
assert(periodic.validationMae!<periodic.baselineMae!*.85);
assert(Math.max(...periodic.points.map(p=>p.predicted))-Math.min(...periodic.points.map(p=>p.predicted))>14);
const heldoutMae=periodic.points.reduce((s,p,i)=>s+Math.abs(p.predicted-wave(240+i)),0)/24;assert(heldoutMae<.01);
const normal=adaptiveForecast(Array.from({length:240},(_,i)=>2+.4*Math.sin(i*2*Math.PI/19)),24,0);
assert(normal.points.every(p=>p.predicted>=0&&p.predicted<=4.5));
assert(periodic.points.some(p=>p.predicted>4.5)); // Reference limits cannot force abnormal forecasts to normal.
const constant=adaptiveForecast(Array(120).fill(8),24,0);assert.equal(constant.method,'level');assert(constant.points.every(p=>p.predicted===8));
for(const model of [periodic,normal,constant,adaptiveForecast([5,4,3,2,1,.1],24,0)])for(const p of model.points)assert(p.lower>=0&&p.lower<=p.predicted&&p.upper>=p.predicted&&Number.isFinite(p.upper));
const records=Array.from({length:20},(_,i)=>({timestamp:new Date(i*60000).toISOString(),quality:i===16?'bad':'good'}));
assert.equal(forecastTraining(records,60).records.length,3);
assert.equal(forecastTraining([...records,{timestamp:new Date(3600000).toISOString(),quality:'good'}],60).records.length,1);
assert.equal(referenceStatus(4.5,{normalMin:0,normalMax:4.5}),'normal');assert.equal(referenceStatus(5,{normalMin:0,normalMax:4.5}),'high');assert.equal(referenceStatus(null,{normalMin:0,normalMax:4.5}),'unknown');
const file='.runtime-cache/timeline-release/surge-demo/import-result.json';
if(fs.existsSync(file)){const data=JSON.parse(fs.readFileSync(file,'utf8'));for(const f of data.fields){const fit=adaptiveForecast(data.history.map((r:any)=>r.values[f.field]),24,0);assert(fit.validationMae!<=fit.baselineMae!*1.001,`${f.field} should not underperform the validated non-periodic baseline`);assert(fit.points.every(point=>Number.isFinite(point.predicted)),`${f.field} forecast must stay finite`);console.log('SURGE_BACKTEST',f.field,JSON.stringify({method:fit.method,period:fit.period,mae:fit.validationMae,baseline:fit.baselineMae,range:[Math.min(...fit.points.map(p=>p.predicted)),Math.max(...fit.points.map(p=>p.predicted))]}));}}
console.log('ADAPTIVE_FORECAST_OK heldoutPeriodicMAE='+heldoutMae+' normal=ok abnormal=ok constant=ok bounds=ok gaps=ok');
