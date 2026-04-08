import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Link2, Activity as TensionIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/mining-shovel-rope-life/ThreeScene';
import { ShovelRopeState } from '../../../components/life-warning/mining-shovel-rope-life/three-types';

export const View: React.FC = () => {
  const [ropeState, setRopeState] = useState<ShovelRopeState>({
    tension: 800, // kN
    bendingCycles: 150000, // cycles
    abrasion: 15, // %
    brokenWires: 2, // count
    operatingHours: 1200, // hours
  });

  const [healthScore, setHealthScore] = useState(82);
  const [estimatedLife, setEstimatedLife] = useState(800); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setRopeState(prev => {
        const newHours = prev.operatingHours + 1;
        const newCycles = prev.bendingCycles + 150; // Fast forward
        
        // Simulate digging cycle tension
        const isDigging = Math.random() > 0.4;
        const newTension = isDigging 
            ? Math.max(1000, Math.min(2200, prev.tension + (Math.random() * 500 - 100)))
            : Math.max(200, Math.min(800, prev.tension - 300));

        // Abrasion increases slowly
        const newAbrasion = Math.min(100, prev.abrasion + 0.02);

        // Broken wires increase based on fatigue (cycles) and tension spikes
        let newBrokenWires = prev.brokenWires;
        if (newCycles > 200000 && Math.random() > 0.98) newBrokenWires += 1;
        if (newTension > 1800 && Math.random() > 0.95) newBrokenWires += 1;

        const tensionPenalty = Math.max(0, (newTension - 1500) / 700) * 10;
        const abrasionPenalty = (newAbrasion / 100) * 30;
        const wirePenalty = Math.min(60, newBrokenWires * 5); // 12 wires is critical

        const health = Math.max(0, Math.floor(100 - tensionPenalty - abrasionPenalty - wirePenalty));
        
        const baseLife = 2500;
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          bendingCycles: newCycles,
          tension: newTension,
          abrasion: newAbrasion,
          brokenWires: newBrokenWires,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setRopeState({
      tension: 500,
      bendingCycles: 0,
      abrasion: 0,
      brokenWires: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(2500);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-3">
            <Link2 className="w-8 h-8" />
            矿用电铲钢丝绳寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于张力、弯曲疲劳与断丝率的提升钢丝绳安全评估</p>
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
              <div className="text-2xl font-bold text-blue-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>穿新绳作业</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行工况监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="实时张力 (kN)" value={ropeState.tension} max={2500} color={ropeState.tension > 1800 ? 'bg-rose-500' : ropeState.tension > 1200 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setRopeState(s => ({...s, tension: v}))} />
              <ParameterControl label="表面磨损率 (%)" value={ropeState.abrasion} max={100} color={ropeState.abrasion > 60 ? 'bg-rose-500' : ropeState.abrasion > 30 ? 'bg-amber-500' : 'bg-blue-500'} onChange={(v) => setRopeState(s => ({...s, abrasion: v}))} />
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">累计弯曲次数</div>
                <div className="text-xl font-mono text-slate-200">{(ropeState.bendingCycles / 1000).toFixed(1)} <span className="text-sm">k次</span></div>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              断丝状态监控
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">单捻距内断丝数 (根)</span>
                <span className={`font-mono font-bold text-2xl ${ropeState.brokenWires >= 6 ? 'text-rose-500 animate-pulse' : ropeState.brokenWires > 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {ropeState.brokenWires}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${ropeState.brokenWires >= 6 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (ropeState.brokenWires / 12) * 100)}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(6 / 12) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">报废标准: 6根/捻距 (交捻)</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(59,130,246,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            天轮处钢丝绳弯曲应力与断丝 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={ropeState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <TensionIcon className={`w-6 h-6 ${ropeState.tension > 1800 ? 'text-rose-500' : 'text-blue-400'}`} />
              <div>
                <div className="text-xs text-slate-400">瞬时拉断风险</div>
                <div className={`text-xl font-mono ${ropeState.tension > 1800 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (ropeState.tension / 2500) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {ropeState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="疲劳断丝 (弯曲/拉伸交变)" value={(ropeState.brokenWires / 8) * 100} critical={75} />
              <DiagnosticItem label="表面磨损 (与天轮/卷筒摩擦)" value={ropeState.abrasion} critical={80} />
              <DiagnosticItem label="过载拉伸损伤 (硬岩挖掘)" value={(ropeState.tension / 2500) * 100} critical={72} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-blue-400">诊断结论与建议：</strong></p>
              {ropeState.brokenWires >= 6 ? (
                <span className="text-rose-400 font-bold">【危急】 单捻距内断丝数已达报废标准，钢丝绳承载能力严重下降，极易发生断绳坠斗事故！必须立即停机更换钢丝绳。</span>
              ) : ropeState.tension > 2000 ? (
                <span className="text-rose-400 font-bold">【危急】 挖掘张力异常偏高，可能遇到大块硬岩或根底。请规范操作，避免强行挖掘导致钢丝绳过载损伤。</span>
              ) : ropeState.abrasion > 60 ? (
                <span className="text-amber-400">【警告】 钢丝绳表面磨损严重，截面积减小。建议检查天轮槽磨损情况，并加强钢丝绳润滑保养。</span>
              ) : ropeState.brokenWires > 2 ? (
                <span className="text-yellow-400">【注意】 已出现散发性断丝，表明钢丝绳进入疲劳期。建议缩短探伤周期，密切关注断丝发展趋势。</span>
              ) : (
                <span className="text-emerald-400">【正常】 钢丝绳各项指标正常，润滑良好，未见明显疲劳损伤。</span>
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
      <span className="font-mono text-blue-400">{value.toFixed(0)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
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
