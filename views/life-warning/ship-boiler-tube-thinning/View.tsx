import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Flame, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/ship-boiler-tube-thinning/ThreeScene';
import { BoilerTubeState } from '../../../components/life-warning/ship-boiler-tube-thinning/three-types';

export const View: React.FC = () => {
  const [boilerState, setBoilerState] = useState<BoilerTubeState>({
    steamPressure: 1.6, // MPa
    exhaustGasTemp: 350, // Celsius
    feedwaterPh: 9.5, // pH
    tubeThickness: 4.8, // mm (New is 5.0mm)
    operatingHours: 32000, // hours
  });

  const [healthScore, setHealthScore] = useState(85);
  const [estimatedLife, setEstimatedLife] = useState(18000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setBoilerState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate boiler load
        const loadChange = Math.random();
        let newPressure = prev.steamPressure;
        let newTemp = prev.exhaustGasTemp;

        if (loadChange > 0.8) {
            // High steam demand
            newPressure = Math.max(1.2, prev.steamPressure - 0.1); // Pressure drops initially
            newTemp = Math.min(450, prev.exhaustGasTemp + 5); // Burner fires up
        } else if (loadChange < 0.2) {
            // Low demand
            newPressure = Math.min(2.0, prev.steamPressure + 0.1);
            newTemp = Math.max(250, prev.exhaustGasTemp - 5);
        } else {
            // Steady
            newPressure = prev.steamPressure + (1.6 - prev.steamPressure) * 0.1 + (Math.random() - 0.5) * 0.05;
            newTemp = prev.exhaustGasTemp + (Math.random() - 0.5) * 2;
        }

        // Feedwater pH fluctuates slightly
        const newPh = prev.feedwaterPh + (Math.random() - 0.5) * 0.1;
        const clampedPh = Math.max(7.0, Math.min(11.0, newPh));

        // Wear rate (thinning) depends on Temperature (external oxidation) and pH (internal corrosion)
        let wearRate = 0.00005;
        if (newTemp > 400) wearRate *= 2; // High temp oxidation
        if (clampedPh < 8.5) wearRate *= 3; // Acidic corrosion
        if (clampedPh > 10.5) wearRate *= 2; // Caustic gouging
        
        const newThickness = Math.max(0, prev.tubeThickness - wearRate);

        // Health calculation
        // 5.0mm is new, 3.0mm is warning, 2.0mm is critical (burst risk)
        const wearPenalty = Math.max(0, ((5.0 - newThickness) / 3.0) * 80); 
        const phPenalty = (clampedPh < 8.5 || clampedPh > 10.5) ? 10 : 0;

        const health = Math.max(0, Math.floor(100 - wearPenalty - phPenalty));
        
        const baseLife = 50000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          steamPressure: newPressure,
          exhaustGasTemp: newTemp,
          feedwaterPh: clampedPh,
          tubeThickness: newThickness,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setBoilerState({
      steamPressure: 1.6,
      exhaustGasTemp: 300,
      feedwaterPh: 9.5,
      tubeThickness: 5.0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(50000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-indigo-400 flex items-center gap-3">
            <Flame className="w-8 h-8" />
            船舶锅炉受热面管壁减薄预警
          </h1>
          <p className="text-slate-400 mt-1">基于烟气温度、炉水pH值与蒸汽压力的水管内外壁腐蚀与爆管风险评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">管束健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-indigo-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>换管大修 (换新)</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              热工与水质监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="蒸汽压力 (MPa)" value={boilerState.steamPressure} max={2.5} color={boilerState.steamPressure > 2.2 ? 'bg-rose-500' : 'bg-sky-500'} onChange={(v) => setBoilerState(s => ({...s, steamPressure: v}))} />
              <ParameterControl label="排烟温度 (°C)" value={boilerState.exhaustGasTemp} max={500} color={boilerState.exhaustGasTemp > 420 ? 'bg-rose-500' : boilerState.exhaustGasTemp > 380 ? 'bg-amber-500' : 'bg-orange-500'} onChange={(v) => setBoilerState(s => ({...s, exhaustGasTemp: v}))} />
              <ParameterControl label="炉水 pH 值" value={boilerState.feedwaterPh} max={12} min={6} color={boilerState.feedwaterPh < 8.5 || boilerState.feedwaterPh > 10.5 ? 'bg-rose-500' : 'bg-emerald-500'} onChange={(v) => setBoilerState(s => ({...s, feedwaterPh: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-indigo-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              管壁减薄状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">受热面管壁厚度 (mm)</span>
                <span className={`font-mono font-bold text-lg ${boilerState.tubeThickness < 2.5 ? 'text-rose-500 animate-pulse' : boilerState.tubeThickness < 3.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {boilerState.tubeThickness.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${boilerState.tubeThickness < 2.5 ? 'bg-rose-500' : boilerState.tubeThickness < 3.5 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${(boilerState.tubeThickness / 5) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80" style={{ left: `${(3.5 / 5) * 100}%` }}></div> 
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(2.5 / 5) * 100}%` }}></div> 
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>爆管危险: 2.5</span>
                <span>初始: 5.0</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#1e1b4b] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(99,102,241,0.05)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            水管内外壁腐蚀与热传导 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={boilerState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${boilerState.tubeThickness < 2.5 && boilerState.steamPressure > 2.0 ? 'text-rose-500 animate-bounce' : 'text-indigo-400'}`} />
              <div>
                <div className="text-xs text-slate-400">高压爆管风险指数</div>
                <div className={`text-xl font-mono ${boilerState.tubeThickness < 2.5 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, ((5 - boilerState.tubeThickness) / 3) * 50 + (boilerState.steamPressure / 2.5) * 50).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计点火时间</div>
              <div className="text-xl font-mono text-slate-300">
                {boilerState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="内壁电化学腐蚀 (pH异常)" value={boilerState.feedwaterPh < 8.5 || boilerState.feedwaterPh > 10.5 ? 90 : 10} critical={80} />
              <DiagnosticItem label="外壁高温氧化/低温露点腐蚀" value={(boilerState.exhaustGasTemp / 500) * 100} critical={85} />
              <DiagnosticItem label="管壁减薄导致应力超限" value={((5 - boilerState.tubeThickness) / 3) * 100} critical={83} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-indigo-400">诊断结论与建议：</strong></p>
              {boilerState.tubeThickness < 2.5 ? (
                <span className="text-rose-400 font-bold">【危急】 受热面管壁已严重减薄，无法承受当前蒸汽压力，随时可能发生爆管事故！必须立即停炉，进行测厚并大面积换管。</span>
              ) : (boilerState.feedwaterPh < 8.5 || boilerState.feedwaterPh > 10.5) ? (
                <span className="text-rose-400 font-bold">【危急】 炉水 pH 值严重偏离标准范围，内壁正发生剧烈的酸性腐蚀或碱性苛性脆化。请立即进行排污并投加水处理药剂。</span>
              ) : boilerState.tubeThickness < 3.5 ? (
                <span className="text-amber-400">【警告】 管壁厚度已低于安全警戒线。建议在下次靠港时安排全面的无损探伤 (NDT) 检查。</span>
              ) : boilerState.exhaustGasTemp > 420 ? (
                <span className="text-yellow-400">【注意】 排烟温度偏高，可能存在受热面外部积灰结渣或内部结垢，影响传热并加速管壁老化。建议进行吹灰操作。</span>
              ) : (
                <span className="text-emerald-400">【正常】 锅炉水质达标，热工参数稳定，管壁厚度在安全范围内。</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ParameterControl = ({ label, value, max, min = 0, color, onChange }: { label: string, value: number, max: number, min?: number, color: string, onChange: (v: number) => void }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-300">{label}</span>
      <span className="font-mono text-indigo-400">{value.toFixed(2)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${((value - min) / (max - min)) * 100}%` }}></div>
    </div>
  </div>
);

const DiagnosticItem = ({ label, value, critical }: { label: string, value: number, critical: number }) => {
  const isCritical = value >= critical;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span className={isCritical ? 'text-rose-400 font-bold' : ''}>{value.toFixed(1)}%</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
        <div className={`h-full transition-all duration-500 ${isCritical ? 'bg-rose-500' : value > critical * 0.7 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, value)}%` }}></div>
        <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/50" style={{ left: `${critical}%` }}></div>
      </div>
    </div>
  );
};
