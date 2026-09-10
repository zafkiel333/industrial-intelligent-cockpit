/** Per-indicator threshold checks and empirical forecast-error comparisons.
 * A limit breach is not a diagnosis, and an empirical error bound is not an acceptance specification.
 */
export function thresholdStatus(value: number | null | undefined, lower: number, upper: number) {
  if (value == null || !Number.isFinite(value)) return 'unknown' as const;
  return value < lower ? 'low' as const : value > upper ? 'high' as const : 'normal' as const;
}

export function forecastDeviation(actual: number | null | undefined, forecast?: {predicted:number;lower:number;upper:number}) {
  if (actual == null || !Number.isFinite(actual) || !forecast || ![forecast.predicted,forecast.lower,forecast.upper].every(Number.isFinite) || forecast.lower > forecast.upper) return null;
  const delta = actual - forecast.predicted;
  return {
    delta,
    lower: forecast.lower - forecast.predicted,
    upper: forecast.upper - forecast.predicted,
    outside: actual < forecast.lower || actual > forecast.upper,
  };
}

/** Bound rendering work while retaining short spikes and gaps in each time bucket. */
export function chartHistory<T extends {quality:string;values:Record<string,number>}>(records:T[],field:string,buckets=250):T[] {
  if(records.length<=buckets*2)return records;
  const step=Math.ceil(records.length/buckets),indices=new Set<number>();
  for(let start=0;start<records.length;start+=step){
    const end=Math.min(records.length,start+step);let low=-1,high=-1,gap=-1;
    indices.add(start);indices.add(end-1);
    for(let i=start;i<end;i++){
      const r=records[i];
      if(r.quality==='bad'||!Number.isFinite(r.values[field])){gap=i;continue;}
      if(low<0||r.values[field]<records[low].values[field])low=i;
      if(high<0||r.values[field]>records[high].values[field])high=i;
    }
    for(const i of [low,high,gap])if(i>=0)indices.add(i);
  }
  return [...indices].sort((a,b)=>a-b).map(i=>records[i]);
}
