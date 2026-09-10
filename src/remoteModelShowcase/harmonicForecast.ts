import { adaptiveForecast } from './adaptiveForecast';

/** Fourier regression with fitted AR(1) residuals, selected by chronological holdouts.
 * No generated noise or replay of observed cycles is added to point forecasts.
 */
const mean = (x: number[]) => x.reduce((s, v) => s + v, 0) / Math.max(1, x.length);
const quantile = (x: number[], p: number) => x.slice().sort((a,b)=>a-b)[Math.min(x.length-1,Math.floor(x.length*p))] || 0;
function solve(matrix: number[][], vector: number[]) {
  const a = matrix.map((r,i)=>[...r,vector[i]]);
  for (let i=0;i<a.length;i++) {
    let pivot=i; for(let j=i+1;j<a.length;j++) if(Math.abs(a[j][i])>Math.abs(a[pivot][i]))pivot=j;
    [a[i],a[pivot]]=[a[pivot],a[i]];
    if(Math.abs(a[i][i])<1e-10)return null;
    const divisor=a[i][i]; for(let k=i;k<=a.length;k++)a[i][k]/=divisor;
    for(let j=0;j<a.length;j++)if(j!==i){const f=a[j][i];for(let k=i;k<=a.length;k++)a[j][k]-=f*a[i][k];}
  }
  return a.map(r=>r[a.length]);
}
function fit(train:number[], period:number, harmonics:number, trend:boolean) {
  const n=train.length, center=mean(train);
  const basis=(i:number)=>[1,...(trend?[(i-(n-1))/n]:[]),...Array.from({length:harmonics},(_,k)=>[Math.sin(2*Math.PI*(k+1)*i/period),Math.cos(2*Math.PI*(k+1)*i/period)]).flat()];
  const size=basis(0).length;
  const matrix=Array.from({length:size},()=>Array(size).fill(0)),vector=Array(size).fill(0);
  train.forEach((v,i)=>{const x=basis(i),w=Math.exp((i-n+1)/(2*n));for(let j=0;j<size;j++){vector[j]+=w*x[j]*(v-center);for(let k=0;k<size;k++)matrix[j][k]+=w*x[j]*x[k];}});
  for(let j=1;j<size;j++)matrix[j][j]+=trend && j===1 ? 0.5 : 0.03;
  const coeff=solve(matrix,vector);if(!coeff)return null;
  const value=(i:number)=>center+basis(i).reduce((s,v,j)=>s+v*coeff[j],0);
  const residuals=train.map((v,i)=>v-value(i));
  const sse=residuals.reduce((s,v)=>s+v*v,0);
  const bic=n*Math.log(Math.max(1e-12,sse/n))+size*Math.log(n);
  const denominator=residuals.slice(0,-1).reduce((s,v)=>s+v*v,0);
  const phi=denominator>1e-12?Math.max(-0.9,Math.min(0.9,residuals.slice(1).reduce((s,v,i)=>s+v*residuals[i],0)/denominator)):0;
  return { period,bic,residuals, predict:(steps:number)=>Array.from({length:steps},(_,h)=>{
    const t=n+h;
    // Limit long-range trend extrapolation while preserving the fitted phase/amplitude.
    const linear=trend ? coeff[1]*(h+1)/n : 0;
    const damped=trend ? coeff[1]/n * 0.98*(1-Math.pow(0.98,h+1))/(1-0.98):0;
    return value(t)-linear+damped+residuals.at(-1)!*Math.pow(phi,h+1);
  }) };
}
function selectHarmonic(train:number[]) {
  if(train.length<48)return null;
  let best:ReturnType<typeof fit>=null;
  // Short histories may contain fewer than two cycles. Require >1.25 cycles per fold,
  // >1.5 cycles at final fit, stable periods and independent multi-fold improvement.
  for(let period=8;period<=Math.min(180,train.length/1.25);period+=1) {
    const candidate=fit(train,period,1,true);
    if(candidate && (!best || candidate.bic<best.bic)) best=candidate;
  }
  if(!best)return null;
  const coarse=best.period;
  for(let period=Math.max(8,coarse-1);period<=Math.min(train.length/1.25,coarse+1);period+=0.2)for(const trend of [false,true])for(const k of [1,2]) {
    const candidate=fit(train,period,k,trend);
    if(candidate && candidate.bic<best.bic)best=candidate;
  }
  return best;
}

export function harmonicForecast(values:number[], steps:number, physicalMin=-Infinity) {
  const series=values.filter(Number.isFinite).slice(-720);
  const baseline=adaptiveForecast(series,steps,physicalMin,false);
  const horizons=[0.2,0.15,0.1].map(f=>Math.max(6,Math.min(90,Math.floor(series.length*f))));
  const errors:number[]=[], baselineErrors:number[]=[], periods:number[]=[],folds:Array<{historyPoints:number;horizon:number;mae:number;baselineMae:number}>=[];
  for(const horizon of [...new Set(horizons)]) {
    const train=series.slice(0,-horizon),heldout=series.slice(-horizon);
    const fitted=selectHarmonic(train);if(!fitted)continue;
    const forecast=fitted.predict(horizon), comparison=adaptiveForecast(train,horizon,physicalMin,false);
    const e=heldout.map((v,i)=>Math.abs(v-Math.max(physicalMin,forecast[i])));
    const b=heldout.map((v,i)=>Math.abs(v-comparison.points[i].predicted));
    errors.push(...e);baselineErrors.push(...b);periods.push(fitted.period);
    folds.push({historyPoints:train.length,horizon,mae:mean(e),baselineMae:mean(b)});
  }
  const final=selectHarmonic(series);
  const improvement=baselineErrors.length && mean(baselineErrors)>1e-10 ? 1-mean(errors)/mean(baselineErrors):0;
  const stable=periods.length>=2 && Math.max(...periods)/Math.min(...periods)<1.25;
  const useHarmonic=!!final && series.length/final.period>=1.5 && stable && improvement>0.08 && folds.filter(f=>f.mae<f.baselineMae).length>=2;
  const reason=useHarmonic?'周期结构在多个历史留出窗口优于基线':'周期结构未在历史留出中稳定改善，采用稳健基线';
  if(!useHarmonic || !final) return {...baseline,selectionReason:reason,backtestFolds:folds,backtestImprovement:0,intervalKind:'经验误差区间',algorithmVersion:'hydro-harmonic-v3'};
  const horizon=Math.max(...folds.map(f=>f.horizon));
  // Calibrate against chronological holdouts and retain wider long-horizon coverage.
  // The interval remains an empirical prediction range rather than a protection setting.
  const width=Math.max(quantile(errors,.96),quantile(final.residuals.map(Math.abs),.95))*1.65;
  return {
    method:'harmonic-regression',period:Number(final.period.toFixed(2)),trainingRecords:series.length,
    validationMae:mean(errors),baselineMae:mean(baselineErrors),validationPoints:errors.length,validationHorizon:horizon,
    selectionReason:reason,backtestFolds:folds,backtestImprovement:improvement,intervalKind:'经验误差区间',algorithmVersion:'hydro-harmonic-v3',
    points:final.predict(steps).map((v,i)=>{const predicted=Math.max(physicalMin,v);const radius=width*Math.sqrt(1+2.2*(i+1)/Math.max(1,horizon));return{predicted,lower:Math.max(physicalMin,predicted-radius),upper:predicted+radius};}),
  };
}
