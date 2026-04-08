import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, GitCommit, Search, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/conveyor-belt-cord-damage/ThreeScene';
import { BeltCordState } from '../../../components/life-warning/conveyor-belt-cord-damage/three-types';

export const View: React.FC = () => {
  const [beltState, setBeltState] = useState<BeltCordState>({
    tension: 80, // kN
    speed: 3.5, // m/s
    brokenCords: 2, // count
    corrosionLevel: 15, // %
    operatingHours: 8500, // hours
  });

  const [healthScore, setHealthScore] = useState(88);
  const [estimatedLife, setEstimatedLife] = useState(12000); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setBeltState(prev => {
        const newHours = prev.operatingHours + 1;
        
        const newSpeed = Math.max(1.0, Math.min(6.0, prev.speed + (Math.random() - 0.5) * 0.2));
        const newTension = Math.max(40, Math.min(150, prev.tension + (newSpeed - prev.speed) * 10 + (Math.random() - 0.5) * 5));

        let corrosionIncrease = 0.01;
        if (newHours > 10000) corrosionIncrease += 0.02;
        const newCorrosion = Math.min(100, prev.corrosionLevel + corrosionIncrease);

        let newBrokenCords = prev.brokenCords;
        if (newCorrosion > 40 && Math.random() > 0.95) newBrokenCords += 1;
        if (newTension > 130 && Math.random() > 0.9) newBrokenCords += 1;

        const brokenPenalty = Math.min(100, newBrokenCords * 5);
        const corrosionPenalty = newCorrosion * 0.5;
        const tensionPenalty = Math.max(0, (newTension - 100) / 50) * 20;

        const health = Math.max(0, Math.floor(100 - brokenPenalty - corrosionPenalty - tensionPenalty));
        
        const baseLife = 20000;
        const remainingLife = Math.max(0, Math.floor(baseLife * (health / 100) - (newHours * 0.8)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          speed: newSpeed,
          tension: newTension,
          corrosionLevel: newCorrosion,
          brokenCords: newBrokenCords,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setBeltState({
      tension: 80,
      speed: 3.5,
      brokenCords: 0,
      corrosionLevel: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(20000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400 flex items-center gap-3">
            <GitCommit className="w-8 h-8" />
            输送带钢丝绳芯损伤预警
          </h1>
          <p className="text-slate-400 mt-1">基于X射线探伤与张力监测的输送带骨架寿命评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">钢丝绳健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-emerald-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换输送带</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行工况监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="运行带速 (m/s)" value={beltState.speed} max={8} color={beltState.speed > 6 ? 'bg-rose-500' : beltState.speed > 4.5 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setBeltState(s => ({...s, speed: v}))} />
              <ParameterControl label="主张力 (kN)" value={beltState.tension} max={200} color={beltState.tension > 150 ? 'bg-rose-500' : beltState.tension > 120 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setBeltState(s => ({...s, tension: v}))} />
              <ParameterControl label="钢丝绳腐蚀度 (%)" value={beltState.corrosionLevel} max={100} color={beltState.corrosionLevel > 60 ? 'bg-rose-500' : beltState.corrosionLevel > 30 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setBeltState(s => ({...s, corrosionLevel: v}))} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center gap-2">
              <Search className="w-5 h-5" />
              断丝检测
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">检测到断丝数量 (根)</span>
                <span className={`font-mono font-bold text-lg ${beltState.brokenCords > 10 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {beltState.brokenCords}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${beltState.brokenCords > 10 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (beltState.brokenCords / 20) * 100)}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(15 / 20) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">临界值: 15 根/接头</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(16,185,129,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            X射线在线探伤 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={beltState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${beltState.tension > 150 ? 'text-rose-500' : 'text-emerald-400'}`} />
              <div>
                <div className="text-xs text-slate-400">张力超限预警</div>
                <div className={`text-xl font-mono ${beltState.tension > 150 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.max(0, ((beltState.tension - 100) / 100) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {beltState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="钢丝绳断裂 (强度丧失)" value={(beltState.brokenCords / 20) * 100} critical={75} />
              <DiagnosticItem label="芯体腐蚀 (水汽侵入)" value={beltState.corrosionLevel} critical={70} />
              <DiagnosticItem label="过载拉伸疲劳 (高张力)" value={(beltState.tension / 200) * 100} critical={75} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-emerald-400">诊断结论与建议：</strong></p>
              {beltState.brokenCords > 15 ? (
                <span className="text-rose-400 font-bold">【危急】 局部断丝数量已超过安全标准，存在极高的断带风险！必须立即停机，进行接头硫化修复或更换该段输送带。</span>
              ) : beltState.tension > 160 ? (
                <span className="text-rose-400 font-bold">【危急】 输送带主张力严重超标，可能发生卡阻或严重超载。请立即停机检查驱动装置及沿线托辊。</span>
              ) : beltState.corrosionLevel > 60 ? (
                <span className="text-amber-400">【警告】 钢丝绳芯腐蚀严重，覆盖胶可能已大面积破损。建议安排全面检查并修补覆盖胶。</span>
              ) : beltState.brokenCords > 5 ? (
                <span className="text-yellow-400">【注意】 探伤系统检测到少量断丝，请密切关注断丝发展趋势，缩短探伤周期。</span>
              ) : (
                <span className="text-emerald-400">【正常】 钢丝绳芯完好，张力正常，输送带运行状态良好。</span>
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
      <span className="font-mono text-emerald-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
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
