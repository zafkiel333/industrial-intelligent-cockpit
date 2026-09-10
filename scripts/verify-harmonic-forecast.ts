import assert from 'node:assert/strict';
import {harmonicForecast} from '../src/remoteModelShowcase/harmonicForecast';
import {generateHydroValidationCase} from '../src/remoteModelShowcase/hydroValidationSuite';
import {validationPrediction,compareHydroValidation,type DataRecord} from '../src/remoteModelShowcase/pilotDataService';
const wave=(i:number)=>150+4*Math.sin(i*2*Math.PI/57.6)+.4*Math.cos(i*4*Math.PI/57.6);
const data=Array.from({length:180},(_,i)=>wave(i)+.1*Math.sin(i*12.73));
const forecast=harmonicForecast(data,120,0);
const mae=forecast.points.reduce((s,p,i)=>s+Math.abs(p.predicted-wave(180+i)),0)/120;
assert.equal(forecast.method,'harmonic-regression');assert(mae<1);assert(forecast.validationMae!<forecast.baselineMae!*.92);
assert(Math.max(...forecast.points.map(p=>p.predicted))-Math.min(...forecast.points.map(p=>p.predicted))>6);
assert.deepEqual(harmonicForecast(data,120,0),forecast,'deterministic predictions');
assert(harmonicForecast(Array(180).fill(8),360,0).points.every(p=>p.predicted===8),'constant inputs must stay flat');
for(const field of ['rpm','temperature','vibration','pressure','flow_rate','power_output'] as const){
 const sample=generateHydroValidationCase('HT-01');
 const fit=harmonicForecast(sample.observation.map(r=>r[field]),360,0);
 assert(fit.points.every(p=>p.lower<=p.predicted&&p.upper>=p.predicted&&Number.isFinite(p.upper)));
 console.log(field,fit.method,'period',fit.period,'backtest MAE',fit.validationMae,'span',Math.max(...fit.points.map(p=>p.predicted))-Math.min(...fit.points.map(p=>p.predicted)));
}
console.log('HARMONIC_FORECAST_OK independentHoldoutMAE='+mae);
const results=[];
for(let i=1;i<=50;i++) {
 const sample=generateHydroValidationCase(`HT-${String(i).padStart(2,'0')}`);
 const records=(rows:typeof sample.observation):DataRecord[]=>rows.map(r=>({timestamp:r.timestamp,device_id:r.device_id,quality:r.quality,batch_id:'test',values:{rpm:r.rpm,temperature:r.temperature,vibration:r.vibration,pressure:r.pressure,flow_rate:r.flow_rate,power_output:r.power_output}}));
 const prediction=validationPrediction(records(sample.observation),true);
 const result=compareHydroValidation({prediction},records(sample.verification),sample.definition.actualTag,sample.definition.faultCode);
 assert.equal(result.fieldMetrics.length,6);
 results.push(result);
}
console.log('HARMONIC_50_CASE_HOLDOUT',JSON.stringify({count:results.length,statusAccuracy:results.filter(r=>r.statusCorrect).length/results.length,conclusionAccuracy:results.filter(r=>r.conclusionCorrect).length/results.length,normalizedMae:results.reduce((s,r)=>s+r.normalizedMae,0)/results.length}));
