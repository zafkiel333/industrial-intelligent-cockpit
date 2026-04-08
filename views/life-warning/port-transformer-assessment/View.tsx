import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Zap, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/port-transformer-assessment/ThreeScene';
import { TransformerState } from '../../../components/life-warning/port-transformer-assessment/three-types';

export const View: React.FC = () => {
  const [transformerState, setTransformerState] = useState<TransformerState>({
    voltage: 10.5, // kV
    current: 450, // A
    oilTemp: 55, // Celsius
    partialDischarge: 80, // pC
    operatingHours: 45000, // hours
  });

  const [healthScore, setHealthScore] = useState(88);
  const [estimatedLife, setEstimatedLife] = useState(120000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setTransformerState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate port electrical load (cranes starting/stopping)
        const loadSpike = Math.random() > 0.8;
        let newCurrent = prev.current;
        let newVoltage = prev.voltage;

        if (loadSpike) {
            newCurrent = 600 + Math.random() * 400; // Surge up to 1000A
            newVoltage = 10.5 - (newCurrent / 1000) * 0.2; // Slight voltage drop
        } else {
            newCurrent = prev.current + (400 - prev.current) * 0.1 + (Math.random() - 0.5) * 50;
            newVoltage = 10.5 + (Math.random() - 0.5) * 0.1;
        }

        // Oil temp responds slowly to current
        const targetTemp = 40 + (newCurrent / 1000) * 40; // Max ~80C under normal load
        const newTemp = prev.oilTemp + (targetTemp - prev.oilTemp) * 0.05;

        // Partial discharge increases with age, temp, and voltage spikes
        let pdRate = 0.01;
        if (newTemp > 75) pdRate *= 2;
        if (newHours > 80000) pdRate *= 3;
        if (loadSpike) pdRate += Math.random() * 5; // Spikes cause sudden PD events
        
        // PD can fluctuate but generally trends up over long term
        let newPD = prev.partialDischarge + pdRate + (Math.random() - 0.5) * 2;
        newPD = Math.max(10, newPD); // Base level

        // Health calculation
        // PD > 500pC is warning, > 1000pC is critical
        // Temp > 85C is warning, > 95C is critical
        const pdPenalty = Math.max(0, (newPD / 1000) * 60); 
        const tempPenalty = Math.max(0, ((newTemp - 75) / 25) * 40);

        const health = Math.max(0, Math.floor(100 - pdPenalty - tempPenalty));
        
        const baseLife = 200000; // ~20+ years
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          voltage: newVoltage,
          current: newCurrent,
          oilTemp: newTemp,
          partialDischarge: newPD,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setTransformerState({
      voltage: 10.5,
      current: 400,
      oilTemp: 45,
      partialDischarge: 20,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(200000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-3">
            <Zap className="w-8 h-8" />
            港口变电所互感器寿命评估
          </h1>
          <p className="text-slate-400 mt-1">基于局部放电 (UHF)、油温与负荷波动的绝缘老化及击穿风险预测</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">绝缘健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-yellow-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换互感器</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-yellow-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              电网负荷与热工监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="运行电压 (kV)" value={transformerState.voltage} max={12} min={9} color="bg-blue-500" onChange={(v) => setTransformerState(s => ({...s, voltage: v}))} />
              <ParameterControl label="负载电流 (A)" value={transformerState.current} max={1200} color={transformerState.current > 1000 ? 'bg-rose-500' : transformerState.current > 800 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setTransformerState(s => ({...s, current: v}))} />
              <ParameterControl label="顶层油温 (°C)" value={transformerState.oilTemp} max={120} color={transformerState.oilTemp > 90 ? 'bg-rose-500' : transformerState.oilTemp > 75 ? 'bg-amber-500' : 'bg-orange-500'} onChange={(v) => setTransformerState(s => ({...s, oilTemp: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              特高频局部放电 (UHF)
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">放电量 (pC)</span>
                <span className={`font-mono font-bold text-2xl ${transformerState.partialDischarge > 1000 ? 'text-rose-500 animate-pulse' : transformerState.partialDischarge > 500 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {transformerState.partialDischarge.toFixed(0)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${transformerState.partialDischarge > 1000 ? 'bg-rose-500' : transformerState.partialDischarge > 500 ? 'bg-amber-500' : 'bg-yellow-500'}`} style={{ width: `${Math.min(100, (transformerState.partialDischarge / 1500) * 100)}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80" style={{ left: `${(500 / 1500) * 100}%` }}></div> 
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(1000 / 1500) * 100}%` }}></div> 
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>注意: 500</span>
                <span>危险: 1000</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(234,179,8,0.05)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
            线圈发热与绝缘局放 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={transformerState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${transformerState.partialDischarge > 1000 ? 'text-rose-500 animate-bounce' : 'text-yellow-400'}`} />
              <div>
                <div className="text-xs text-slate-400">绝缘击穿风险指数</div>
                <div className={`text-xl font-mono ${transformerState.partialDischarge > 1000 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (transformerState.partialDischarge / 1200) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计带电运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {transformerState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-yellow-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="固体绝缘老化 (局放加剧)" value={(transformerState.partialDischarge / 1500) * 100} critical={66} />
              <DiagnosticItem label="绕组过热 (铜损增加)" value={(transformerState.oilTemp / 120) * 100} critical={75} />
              <DiagnosticItem label="绝缘油劣化 (产气)" value={((transformerState.oilTemp - 40) / 80) * 50 + (transformerState.partialDischarge / 2000) * 50} critical={80} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-yellow-400">诊断结论与建议：</strong></p>
              {transformerState.partialDischarge > 1000 ? (
                <span className="text-rose-400 font-bold">【危急】 局部放电量严重超标，内部绝缘可能存在树枝状放电或悬浮电位放电，随时有击穿爆炸风险！必须立即切除负荷，停电进行油色谱 (DGA) 和电气试验。</span>
              ) : transformerState.oilTemp > 95 ? (
                <span className="text-rose-400 font-bold">【危急】 顶层油温过高，绕组热点温度可能已超过绝缘耐受极限，将加速绝缘纸老化。请立即降低负荷并检查冷却系统。</span>
              ) : transformerState.partialDischarge > 500 ? (
                <span className="text-amber-400">【警告】 监测到明显的局部放电活动，绝缘存在早期缺陷。建议缩短巡检周期，并安排停电检修计划。</span>
              ) : transformerState.current > 1000 ? (
                <span className="text-yellow-400">【注意】 互感器处于重载状态，频繁的负荷冲击会加速热老化。</span>
              ) : (
                <span className="text-emerald-400">【正常】 互感器绝缘状态良好，局放水平在正常背景噪声范围内，运行稳定。</span>
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
      <span className="font-mono text-yellow-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
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
