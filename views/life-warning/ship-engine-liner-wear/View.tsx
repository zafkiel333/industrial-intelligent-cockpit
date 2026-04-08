import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Anchor, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/ship-engine-liner-wear/ThreeScene';
import { LinerState } from '../../../components/life-warning/ship-engine-liner-wear/three-types';

export const View: React.FC = () => {
  const [linerState, setLinerState] = useState<LinerState>({
    temperature: 180, // Celsius
    pistonSpeed: 8.5, // m/s
    oilFilmThickness: 2.5, // um
    wearDepth: 0.4, // mm
    operatingHours: 12500, // hours
  });

  const [healthScore, setHealthScore] = useState(82);
  const [estimatedLife, setEstimatedLife] = useState(15000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setLinerState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate engine load variations
        const newSpeed = Math.max(4.0, Math.min(12.0, prev.pistonSpeed + (Math.random() * 0.4 - 0.2)));
        
        // Oil film thickness depends on speed and temperature
        let newFilm = 3.0;
        if (newSpeed < 6.0) newFilm -= 0.5; // Low speed, boundary lubrication
        if (prev.temperature > 220) newFilm -= 1.0; // High temp thins oil
        newFilm = Math.max(0.5, Math.min(5.0, newFilm + (Math.random() - 0.5) * 0.2));

        // Temperature rises with speed and thin oil film (friction)
        let tempTarget = 160 + (newSpeed * 5);
        if (newFilm < 1.5) tempTarget += 40; // Scuffing heat
        const newTemp = prev.temperature + (tempTarget - prev.temperature) * 0.05 + (Math.random() - 0.5);

        // Wear rate (corrosive + abrasive)
        let wearRate = 0.00002;
        if (newFilm < 1.5) wearRate *= 5; // Metal-to-metal contact (scuffing)
        if (newTemp < 140) wearRate *= 3; // Cold corrosion (sulfuric acid)
        const newWear = Math.min(3.0, prev.wearDepth + wearRate);

        const wearPenalty = Math.max(0, (newWear / 2.0) * 60); // 2.0mm is critical
        const filmPenalty = newFilm < 1.5 ? 20 : 0;
        const tempPenalty = newTemp > 250 ? 20 : 0;

        const health = Math.max(0, Math.floor(100 - wearPenalty - filmPenalty - tempPenalty));
        
        const baseLife = 30000;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          pistonSpeed: newSpeed,
          oilFilmThickness: newFilm,
          temperature: newTemp,
          wearDepth: newWear,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setLinerState({
      temperature: 160,
      pistonSpeed: 8.0,
      oilFilmThickness: 3.5,
      wearDepth: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(30000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-orange-500 flex items-center gap-3">
            <Anchor className="w-8 h-8" />
            船舶主机缸套磨损预警
          </h1>
          <p className="text-slate-400 mt-1">基于油膜厚度、温度与活塞平均速度的缸套拉缸与异常磨损评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">缸套健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-orange-500">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>吊缸检修/更换缸套</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-orange-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              燃烧与润滑监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="缸壁温度 (°C)" value={linerState.temperature} max={300} min={100} color={linerState.temperature > 250 ? 'bg-rose-500' : linerState.temperature < 140 ? 'bg-blue-500' : 'bg-emerald-500'} onChange={(v) => setLinerState(s => ({...s, temperature: v}))} />
              <ParameterControl label="活塞平均速度 (m/s)" value={linerState.pistonSpeed} max={15} color="bg-sky-500" onChange={(v) => setLinerState(s => ({...s, pistonSpeed: v}))} />
              <ParameterControl label="最小油膜厚度 (μm)" value={linerState.oilFilmThickness} max={6} color={linerState.oilFilmThickness < 1.5 ? 'bg-rose-500' : linerState.oilFilmThickness < 2.5 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setLinerState(s => ({...s, oilFilmThickness: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-orange-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              缸套磨损状态
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">最大磨损深度 (mm)</span>
                <span className={`font-mono font-bold text-lg ${linerState.wearDepth > 1.8 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {linerState.wearDepth.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${linerState.wearDepth > 1.8 ? 'bg-rose-500' : 'bg-orange-500'}`} style={{ width: `${(linerState.wearDepth / 2.5) * 100}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(2.0 / 2.5) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">拉缸/漏气临界值: 2.0mm</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(249,115,22,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            气缸内部热负荷与活塞环刮擦 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={linerState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${linerState.oilFilmThickness < 1.5 || linerState.temperature > 250 ? 'text-rose-500' : 'text-orange-400'}`} />
              <div>
                <div className="text-xs text-slate-400">拉缸(Scuffing)风险指数</div>
                <div className={`text-xl font-mono ${linerState.oilFilmThickness < 1.5 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, ((3 - linerState.oilFilmThickness) / 2) * 50 + (linerState.temperature / 300) * 50).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {linerState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-orange-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="粘着磨损/拉缸 (油膜破裂)" value={linerState.oilFilmThickness < 2.0 ? (2.0 - linerState.oilFilmThickness) * 100 : 0} critical={50} />
              <DiagnosticItem label="低温酸腐蚀 (壁温过低)" value={linerState.temperature < 150 ? (150 - linerState.temperature) * 5 : 0} critical={60} />
              <DiagnosticItem label="正常机械磨损超限" value={(linerState.wearDepth / 2.0) * 100} critical={90} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-orange-400">诊断结论与建议：</strong></p>
              {linerState.wearDepth > 1.9 ? (
                <span className="text-rose-400 font-bold">【危急】 缸套磨损量已达极限，活塞环密封失效，可能导致严重窜气和扫气箱着火！必须安排最近港口吊缸更换。</span>
              ) : linerState.oilFilmThickness < 1.5 ? (
                <span className="text-rose-400 font-bold">【危急】 气缸油膜极度变薄，发生金属直接接触，拉缸风险极高！请立即增加气缸油注油率或降低主机负荷。</span>
              ) : linerState.temperature > 250 ? (
                <span className="text-amber-400">【警告】 缸壁温度过高，可能导致气缸油结焦碳化，加剧磨损。请检查冷却水系统和喷油器雾化状态。</span>
              ) : linerState.temperature < 140 ? (
                <span className="text-blue-400">【注意】 缸壁温度偏低，燃油中的硫燃烧生成的硫酸蒸汽易凝结，引发严重的低温酸腐蚀。建议提高冷却水温度。</span>
              ) : (
                <span className="text-emerald-400">【正常】 主机气缸润滑良好，燃烧状态稳定，磨损率在正常范围内。</span>
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
      <span className="font-mono text-orange-400">{value.toFixed(2)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
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
