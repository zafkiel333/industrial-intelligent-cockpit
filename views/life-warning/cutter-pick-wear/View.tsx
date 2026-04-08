import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Pickaxe, ThermometerSun, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/cutter-pick-wear/ThreeScene';
import { CutterPickState } from '../../../components/life-warning/cutter-pick-wear/three-types';

export const View: React.FC = () => {
  const [pickState, setPickState] = useState<CutterPickState>({
    rockHardness: 60, // MPa
    cuttingSpeed: 2.5, // m/s
    temperature: 80, // Celsius
    wearDepth: 5, // mm
    operatingHours: 120, // hours
  });

  const [healthScore, setHealthScore] = useState(85);
  const [estimatedLife, setEstimatedLife] = useState(300); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setPickState(prev => {
        const newHours = prev.operatingHours + 1;
        const newHardness = Math.max(20, Math.min(120, prev.rockHardness + (Math.random() - 0.5) * 10));
        const newSpeed = Math.max(1.0, Math.min(4.0, prev.cuttingSpeed + (Math.random() - 0.5) * 0.2));
        
        const wearRate = (newHardness / 100) * (newSpeed / 2) * 0.05;
        const newWearDepth = Math.min(30, prev.wearDepth + wearRate);

        let tempTarget = 50 + (newHardness * 1.5) + (newSpeed * 20);
        if (newWearDepth > 15) tempTarget += (newWearDepth - 15) * 2;
        const newTemp = prev.temperature + (tempTarget - prev.temperature) * 0.1 + (Math.random() - 0.5) * 5;

        const wearPenalty = Math.max(0, (newWearDepth / 25) * 60);
        const tempPenalty = Math.max(0, (newTemp - 150) / 100) * 40;
        const health = Math.max(0, Math.floor(100 - wearPenalty - tempPenalty));
        
        const baseLife = 500;
        const hardnessFactor = Math.pow(newHardness / 50, 1.2);
        const remainingLife = Math.max(0, Math.floor((baseLife / hardnessFactor) * (health / 100) - (newHours * 0.5)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          rockHardness: newHardness,
          cuttingSpeed: newSpeed,
          temperature: newTemp,
          wearDepth: newWearDepth,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setPickState({
      rockHardness: 50,
      cuttingSpeed: 2.0,
      temperature: 60,
      wearDepth: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(500);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-500 flex items-center gap-3">
            <Pickaxe className="w-8 h-8" />
            采掘机截齿磨损预警
          </h1>
          <p className="text-slate-400 mt-1">基于岩石硬度、截割速度与热应力的耐磨件寿命评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">截齿健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-amber-500">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换截齿</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              截割工况监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="岩石抗压强度 (MPa)" value={pickState.rockHardness} max={150} color={pickState.rockHardness > 100 ? 'bg-rose-500' : pickState.rockHardness > 60 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setPickState(s => ({...s, rockHardness: v}))} />
              <ParameterControl label="截割线速度 (m/s)" value={pickState.cuttingSpeed} max={5} color={pickState.cuttingSpeed > 3.5 ? 'bg-rose-500' : pickState.cuttingSpeed > 2.5 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setPickState(s => ({...s, cuttingSpeed: v}))} />
              <ParameterControl label="齿尖温度 (°C)" value={pickState.temperature} max={400} color={pickState.temperature > 250 ? 'bg-rose-500' : pickState.temperature > 150 ? 'bg-amber-500' : 'bg-amber-500'} onChange={(v) => setPickState(s => ({...s, temperature: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              磨损状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">平均磨损深度 (mm)</span>
                <span className={`font-mono font-bold text-lg ${pickState.wearDepth > 20 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {pickState.wearDepth.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${pickState.wearDepth > 20 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${(pickState.wearDepth / 30) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(25 / 30) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">报废极限: 25 mm</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(245,158,11,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            截割头磨损形貌与热力学 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={pickState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <ThermometerSun className={`w-6 h-6 ${pickState.temperature > 250 ? 'text-rose-500' : 'text-amber-400'}`} />
              <div>
                <div className="text-xs text-slate-400">合金头热疲劳指数</div>
                <div className={`text-xl font-mono ${pickState.temperature > 250 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (pickState.temperature / 300) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {pickState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="合金头磨料磨损" value={(pickState.wearDepth / 25) * 100} critical={80} />
              <DiagnosticItem label="热疲劳碎裂风险" value={(pickState.temperature / 300) * 100} critical={83} />
              <DiagnosticItem label="冲击断裂风险 (高硬度)" value={(pickState.rockHardness / 120) * 100} critical={83} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-amber-400">诊断结论与建议：</strong></p>
              {pickState.wearDepth > 22 ? (
                <span className="text-rose-400 font-bold">【危急】 截齿磨损已近极限，齿座存在严重磨损风险！必须立即停机更换截齿。</span>
              ) : pickState.temperature > 250 ? (
                <span className="text-rose-400 font-bold">【危急】 齿尖温度极高，合金头极易发生热疲劳碎裂。请立即检查内外喷雾冷却系统是否堵塞。</span>
              ) : pickState.rockHardness > 90 ? (
                <span className="text-amber-400">【警告】 遭遇坚硬岩层，截齿冲击负荷大，建议降低截割速度，并密切关注截齿断裂情况。</span>
              ) : (
                <span className="text-emerald-400">【正常】 截齿磨损在正常范围内，冷却系统工作正常，截割效率良好。</span>
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
      <span className="font-mono text-amber-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
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
