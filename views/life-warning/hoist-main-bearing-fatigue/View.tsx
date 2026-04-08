import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, ArrowUpDown, ThermometerSun, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/hoist-main-bearing-fatigue/ThreeScene';
import { HoistBearingState } from '../../../components/life-warning/hoist-main-bearing-fatigue/three-types';

export const View: React.FC = () => {
  const [bearingState, setBearingState] = useState<HoistBearingState>({
    vibration: 2.5, // mm/s
    temperature: 45, // Celsius
    load: 60, // tons
    oilFilmThickness: 12, // micrometers
    operatingHours: 25000, // hours
  });

  const [healthScore, setHealthScore] = useState(92);
  const [estimatedLife, setEstimatedLife] = useState(45000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setBearingState(prev => {
        const newHours = prev.operatingHours + 1;
        
        const newLoad = Math.max(20, Math.min(100, prev.load + (Math.random() - 0.5) * 10));
        
        let vibIncrease = 0;
        if (newHours > 30000) vibIncrease += 0.02;
        const newVibration = Math.max(1.0, Math.min(15, prev.vibration + (Math.random() > 0.9 ? vibIncrease : (Math.random() - 0.5) * 0.1)));

        // Oil film gets thinner with high load and high temp
        let filmTarget = 15 - (newLoad / 10);
        if (prev.temperature > 70) filmTarget -= (prev.temperature - 70) * 0.2;
        const newFilm = Math.max(0.5, prev.oilFilmThickness + (filmTarget - prev.oilFilmThickness) * 0.1);

        // Temp rises if film is thin (friction) or load is high
        let tempTarget = 35 + (newLoad * 0.2);
        if (newFilm < 5) tempTarget += (5 - newFilm) * 5;
        const newTemp = prev.temperature + (tempTarget - prev.temperature) * 0.05 + (Math.random() - 0.5);

        const vibPenalty = Math.max(0, (newVibration - 4.5) / 6.5) * 40;
        const tempPenalty = Math.max(0, (newTemp - 65) / 25) * 30;
        const filmPenalty = Math.max(0, (8 - newFilm) / 6) * 30;

        const health = Math.max(0, Math.floor(100 - vibPenalty - tempPenalty - filmPenalty));
        
        const baseLife = 80000;
        const loadFactor = Math.pow(newLoad / 50, 3); // L10 life is inversely proportional to load^3
        const remainingLife = Math.max(0, Math.floor((baseLife / loadFactor) * (health / 100) - (newHours * 0.5)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          load: newLoad,
          vibration: newVibration,
          temperature: newTemp,
          oilFilmThickness: newFilm,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setBearingState({
      vibration: 1.5,
      temperature: 40,
      load: 50,
      oilFilmThickness: 15,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(80000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-sky-400 flex items-center gap-3">
            <ArrowUpDown className="w-8 h-8" />
            提升机主轴承疲劳监测
          </h1>
          <p className="text-slate-400 mt-1">基于交变载荷、油膜厚度与低频振动的重载轴承寿命评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">轴承健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命 (L10)</div>
              <div className="text-2xl font-bold text-sky-400">{(estimatedLife / 1000).toFixed(1)} <span className="text-sm font-normal">k小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换主轴承</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-sky-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行工况监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="提升载荷 (t)" value={bearingState.load} max={120} color={bearingState.load > 90 ? 'bg-rose-500' : bearingState.load > 70 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setBearingState(s => ({...s, load: v}))} />
              <ParameterControl label="低频振动速度 (mm/s)" value={bearingState.vibration} max={15} color={bearingState.vibration > 7.1 ? 'bg-rose-500' : bearingState.vibration > 4.5 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setBearingState(s => ({...s, vibration: v}))} />
              <ParameterControl label="轴承座温度 (°C)" value={bearingState.temperature} max={100} color={bearingState.temperature > 80 ? 'bg-rose-500' : bearingState.temperature > 65 ? 'bg-amber-500' : 'bg-sky-500'} onChange={(v) => setBearingState(s => ({...s, temperature: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-sky-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              润滑状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">最小油膜厚度 (μm)</span>
                <span className={`font-mono font-bold text-lg ${bearingState.oilFilmThickness < 3 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {bearingState.oilFilmThickness.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${bearingState.oilFilmThickness < 3 ? 'bg-rose-500' : 'bg-sky-500'}`} style={{ width: `${(bearingState.oilFilmThickness / 20) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(2 / 20) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">边界润滑临界值: 2.0 μm</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(14,165,233,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
            主轴承载荷分布与油膜状态 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={bearingState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${bearingState.vibration > 7.1 ? 'text-rose-500' : 'text-sky-400'}`} />
              <div>
                <div className="text-xs text-slate-400">交变应力疲劳累积</div>
                <div className={`text-xl font-mono ${bearingState.vibration > 7.1 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (bearingState.operatingHours / 80000) * 100 * Math.pow(bearingState.load/50, 2)).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {bearingState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-sky-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="接触疲劳剥落 (高载荷/振动)" value={(bearingState.vibration / 11) * 100} critical={65} />
              <DiagnosticItem label="胶合/烧伤 (油膜破裂/高温)" value={Math.max(0, (10 - bearingState.oilFilmThickness) / 8) * 100} critical={85} />
              <DiagnosticItem label="保持架断裂风险 (冲击载荷)" value={(bearingState.load / 120) * 100} critical={75} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-sky-400">诊断结论与建议：</strong></p>
              {bearingState.oilFilmThickness < 2.5 ? (
                <span className="text-rose-400 font-bold">【危急】 油膜厚度极低，已进入边界润滑状态，极易发生金属直接接触导致胶合烧瓦！请立即检查润滑油站压力及油品粘度。</span>
              ) : bearingState.vibration > 7.1 ? (
                <span className="text-rose-400 font-bold">【危急】 低频振动严重超标，可能存在主轴不对中、基础松动或轴承内部已发生严重剥落。建议立即停机进行振动频谱分析。</span>
              ) : bearingState.temperature > 75 ? (
                <span className="text-amber-400">【警告】 轴承温度偏高，可能是载荷过大或冷却不良导致。建议降低提升速度或载荷，并检查冷却水循环。</span>
              ) : bearingState.load > 85 ? (
                <span className="text-yellow-400">【注意】 当前提升载荷较大，交变应力加速疲劳累积，建议优化装载量，避免长期满负荷运行。</span>
              ) : (
                <span className="text-emerald-400">【正常】 振动、温度及润滑状态均在正常范围内，主轴承运行平稳。</span>
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
      <span className="font-mono text-sky-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500" />
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
