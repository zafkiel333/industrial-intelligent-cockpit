import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Droplet, ThermometerSun, Activity as PressureIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/hydraulic-support-seal-life/ThreeScene';
import { SealState } from '../../../components/life-warning/hydraulic-support-seal-life/three-types';

export const View: React.FC = () => {
  const [sealState, setSealState] = useState<SealState>({
    pressure: 25, // MPa
    temperature: 45, // Celsius
    fluidContamination: 15, // %
    wearDepth: 0.2, // mm
    operatingCycles: 15000, // cycles
  });

  const [healthScore, setHealthScore] = useState(90);
  const [estimatedCycles, setEstimatedCycles] = useState(35000); // Remaining cycles

  useEffect(() => {
    const interval = setInterval(() => {
      setSealState(prev => {
        const newCycles = prev.operatingCycles + 10; // Fast forward simulation
        
        const newPressure = Math.max(10, Math.min(45, prev.pressure + (Math.random() - 0.5) * 5));
        
        // Contamination increases slowly
        const newContamination = Math.min(100, prev.fluidContamination + 0.05);

        // Temperature rises with pressure and contamination
        let tempTarget = 35 + (newPressure * 0.5) + (newContamination * 0.2);
        const newTemp = prev.temperature + (tempTarget - prev.temperature) * 0.1 + (Math.random() - 0.5);

        // Wear rate depends on pressure, temp, and contamination
        let wearRate = 0.0001;
        if (newPressure > 35) wearRate *= 1.5;
        if (newTemp > 70) wearRate *= 1.2; // Material softens
        if (newContamination > 50) wearRate *= 2.0; // Abrasive wear
        
        const newWear = Math.min(2.5, prev.wearDepth + wearRate * 10); // *10 because we added 10 cycles

        const wearPenalty = Math.max(0, (newWear / 2.0) * 50);
        const tempPenalty = Math.max(0, (newTemp - 60) / 40) * 25;
        const contamPenalty = Math.max(0, (newContamination - 40) / 60) * 25;

        const health = Math.max(0, Math.floor(100 - wearPenalty - tempPenalty - contamPenalty));
        
        const baseLife = 50000;
        const remainingCycles = Math.max(0, Math.floor((baseLife - newCycles) * (health / 100)));
        setEstimatedCycles(remainingCycles);

        return {
          ...prev,
          operatingCycles: newCycles,
          pressure: newPressure,
          temperature: newTemp,
          fluidContamination: newContamination,
          wearDepth: newWear,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setSealState({
      pressure: 20,
      temperature: 35,
      fluidContamination: 5,
      wearDepth: 0,
      operatingCycles: 0,
    });
    setHealthScore(100);
    setEstimatedCycles(50000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-violet-400 flex items-center gap-3">
            <Droplet className="w-8 h-8" />
            液压支架密封件寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于系统压力、油液污染度与温升的聚氨酯密封圈磨损评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">密封健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余循环次数</div>
              <div className="text-2xl font-bold text-violet-400">{(estimatedCycles / 1000).toFixed(1)} <span className="text-sm font-normal">k次</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换密封组件</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-violet-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              液压工况监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="系统压力 (MPa)" value={sealState.pressure} max={50} color={sealState.pressure > 40 ? 'bg-rose-500' : sealState.pressure > 30 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setSealState(s => ({...s, pressure: v}))} />
              <ParameterControl label="油液污染度 (NAS等级等效%)" value={sealState.fluidContamination} max={100} color={sealState.fluidContamination > 70 ? 'bg-rose-500' : sealState.fluidContamination > 40 ? 'bg-amber-500' : 'bg-violet-500'} onChange={(v) => setSealState(s => ({...s, fluidContamination: v}))} />
              <ParameterControl label="油液温度 (°C)" value={sealState.temperature} max={100} color={sealState.temperature > 80 ? 'bg-rose-500' : sealState.temperature > 60 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setSealState(s => ({...s, temperature: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-violet-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              密封圈磨损状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">唇口磨损深度 (mm)</span>
                <span className={`font-mono font-bold text-lg ${sealState.wearDepth > 1.8 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {sealState.wearDepth.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${sealState.wearDepth > 1.8 ? 'bg-rose-500' : 'bg-violet-500'}`} style={{ width: `${(sealState.wearDepth / 2.5) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(2.0 / 2.5) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">泄漏临界值: 2.0 mm</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(139,92,246,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
            立柱油缸内部密封状态与流场 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={sealState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <PressureIcon className={`w-6 h-6 ${sealState.pressure > 40 ? 'text-rose-500' : 'text-violet-400'}`} />
              <div>
                <div className="text-xs text-slate-400">内泄露风险指数</div>
                <div className={`text-xl font-mono ${sealState.wearDepth > 1.8 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (sealState.wearDepth / 2.0) * 100 * (sealState.pressure / 30)).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计动作循环</div>
              <div className="text-xl font-mono text-slate-300">
                {sealState.operatingCycles.toLocaleString()} <span className="text-sm">次</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-violet-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="磨粒磨损 (油液污染)" value={sealState.fluidContamination} critical={75} />
              <DiagnosticItem label="挤出损伤 (超高压/间隙大)" value={(sealState.pressure / 50) * 100} critical={85} />
              <DiagnosticItem label="材料老化/软化 (高温)" value={(sealState.temperature / 100) * 100} critical={80} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-violet-400">诊断结论与建议：</strong></p>
              {sealState.wearDepth > 1.9 ? (
                <span className="text-rose-400 font-bold">【危急】 密封圈磨损已达极限，极易发生严重内泄露导致支架"降架"（失去支撑力）！必须立即更换立柱密封。</span>
              ) : sealState.fluidContamination > 75 ? (
                <span className="text-rose-400 font-bold">【危急】 乳化液污染度严重超标，固体颗粒正在快速切削密封唇口。请立即更换滤芯并清洗液压系统。</span>
              ) : sealState.temperature > 85 ? (
                <span className="text-amber-400">【警告】 液压油温过高，加速聚氨酯密封件老化和软化，降低抗挤出能力。建议检查冷却系统。</span>
              ) : sealState.pressure > 42 ? (
                <span className="text-yellow-400">【注意】 支架长期处于超高压状态，安全阀可能失效或顶板压力过大，增加密封挤出风险。</span>
              ) : (
                <span className="text-emerald-400">【正常】 密封件状态良好，液压系统压力与清洁度均在正常范围内。</span>
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
      <span className="font-mono text-violet-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500" />
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
