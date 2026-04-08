import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Link, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/port-stacker-rope-fatigue/ThreeScene';
import { WireRopeState } from '../../../components/life-warning/port-stacker-rope-fatigue/three-types';

export const View: React.FC = () => {
  const [ropeState, setRopeState] = useState<WireRopeState>({
    hoistLoad: 15, // t
    ropeSpeed: 0, // m/s
    bendingCycles: 150000, // count
    brokenWires: 2, // count per lay length
    operatingHours: 8500, // hours
  });

  const [healthScore, setHealthScore] = useState(82);
  const [estimatedLife, setEstimatedLife] = useState(3500); // Hours

  useEffect(() => {
    const interval = setInterval(() => {
      setRopeState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate stacking/reclaiming operations
        const isOperating = Math.random() > 0.3;
        let newSpeed = prev.ropeSpeed;
        let newLoad = prev.hoistLoad;
        let newCycles = prev.bendingCycles;

        if (isOperating) {
            newSpeed = 1.5 + Math.random() * 1.0; // 1.5 - 2.5 m/s
            newLoad = 10 + Math.random() * 30; // 10 - 40 t
            newCycles += Math.floor(newSpeed * 2); // Faster speed = more bending cycles over sheaves
        } else {
            newSpeed = 0;
            newLoad = 10; // Empty bucket/boom weight
        }

        // Fatigue and wire breakage logic
        // Breakage accelerates as cycles increase and under high load
        let breakProbability = 0.0001;
        if (newCycles > 200000) breakProbability *= 5; // End of life curve steepens
        if (newLoad > 35) breakProbability *= 2; // Heavy loads cause more stress

        let newBrokenWires = prev.brokenWires;
        if (Math.random() < breakProbability) {
            newBrokenWires += 1;
        }

        // Health calculation
        // 10 broken wires per lay length is typically discard criteria
        const breakPenalty = Math.max(0, (newBrokenWires / 10) * 70); 
        const cyclePenalty = Math.max(0, (newCycles / 300000) * 30); // 300k cycles is design life

        const health = Math.max(0, Math.floor(100 - breakPenalty - cyclePenalty));
        
        const baseLife = 12000; // Total hours design life
        const remainingLife = Math.max(0, Math.floor((baseLife - newHours) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          ropeSpeed: newSpeed,
          hoistLoad: newLoad,
          bendingCycles: newCycles,
          brokenWires: newBrokenWires,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setRopeState({
      hoistLoad: 10,
      ropeSpeed: 0,
      bendingCycles: 0,
      brokenWires: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(12000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-neutral-950 text-neutral-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-300 flex items-center gap-3">
            <Link className="w-8 h-8" />
            港口堆料机钢丝绳疲劳预警
          </h1>
          <p className="text-neutral-500 mt-1">基于弯曲疲劳循环、起升载荷与断丝率的钢丝绳剩余强度评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-neutral-500">钢丝绳健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-500' : healthScore > 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-neutral-700"></div>
            <div className="text-center">
              <div className="text-sm text-neutral-500">预计剩余寿命</div>
              <div className="text-2xl font-bold text-neutral-300">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换新钢丝绳</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-neutral-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行工况与疲劳累积
            </h3>
            <div className="space-y-6">
              <ParameterControl label="起升载荷 (t)" value={ropeState.hoistLoad} max={50} color={ropeState.hoistLoad > 40 ? 'bg-rose-500' : ropeState.hoistLoad > 30 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setRopeState(s => ({...s, hoistLoad: v}))} />
              <ParameterControl label="运行速度 (m/s)" value={ropeState.ropeSpeed} max={3} color="bg-neutral-500" onChange={(v) => setRopeState(s => ({...s, ropeSpeed: v}))} />
              
              <div className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
                <div className="text-sm text-neutral-400 mb-1">累计弯曲疲劳次数</div>
                <div className="text-2xl font-mono text-neutral-200">
                  {ropeState.bendingCycles.toLocaleString()} <span className="text-sm text-neutral-500">次</span>
                </div>
                <div className="w-full h-1 bg-neutral-700 mt-2 rounded-full overflow-hidden">
                  <div className="h-full bg-neutral-400" style={{ width: `${Math.min(100, (ropeState.bendingCycles / 300000) * 100)}%` }}></div>
                </div>
                <div className="text-right text-xs text-neutral-500 mt-1">设计寿命: 300k 次</div>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-neutral-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              表面损伤检测 (机器视觉)
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-400">捻距内断丝数 (根)</span>
                <span className={`font-mono font-bold text-lg ${ropeState.brokenWires >= 10 ? 'text-rose-500 animate-pulse' : ropeState.brokenWires >= 6 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {ropeState.brokenWires}
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${ropeState.brokenWires >= 10 ? 'bg-rose-500' : ropeState.brokenWires >= 6 ? 'bg-amber-500' : 'bg-neutral-500'}`} style={{ width: `${Math.min(100, (ropeState.brokenWires / 12) * 100)}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80" style={{ left: `${(6 / 12) * 100}%` }}></div> 
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(10 / 12) * 100}%` }}></div> 
              </div>
              <div className="flex justify-between text-xs text-neutral-500">
                <span>关注: 6</span>
                <span>报废: 10</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#171717] border border-neutral-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(163,163,163,0.05)]">
          <div className="absolute top-4 left-4 z-10 bg-neutral-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-neutral-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse"></div>
            滑轮组受力与钢丝绳断丝 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={ropeState} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-neutral-900/80 backdrop-blur px-4 py-2 rounded-lg border border-neutral-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${ropeState.brokenWires >= 10 ? 'text-rose-500 animate-bounce' : 'text-neutral-400'}`} />
              <div>
                <div className="text-xs text-neutral-400">断绳坠落风险指数</div>
                <div className={`text-xl font-mono ${ropeState.brokenWires >= 10 ? 'text-rose-500 animate-pulse' : 'text-neutral-200'}`}>
                  {Math.min(100, (ropeState.brokenWires / 10) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-neutral-900/80 backdrop-blur px-4 py-2 rounded-lg border border-neutral-700 text-right">
              <div className="text-xs text-neutral-400">累计运行时间</div>
              <div className="text-xl font-mono text-neutral-300">
                {ropeState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-neutral-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="交变弯曲疲劳 (内部断丝)" value={(ropeState.bendingCycles / 300000) * 100} critical={90} />
              <DiagnosticItem label="表面磨损与断丝 (外部损伤)" value={(ropeState.brokenWires / 10) * 100} critical={100} />
              <DiagnosticItem label="超载拉伸变形" value={(ropeState.hoistLoad / 50) * 100} critical={85} />
            </div>
            <div className="mt-8 p-4 bg-neutral-800/40 rounded-lg border border-neutral-700 text-sm text-neutral-300 leading-relaxed">
              <p className="mb-2"><strong className="text-neutral-400">诊断结论与建议：</strong></p>
              {ropeState.brokenWires >= 10 ? (
                <span className="text-rose-400 font-bold">【危急】 一个捻距内断丝数已达到或超过报废标准 (10根)！钢丝绳承载能力急剧下降，存在极高的断绳坠落风险。必须立即停机，强制更换钢丝绳。</span>
              ) : ropeState.bendingCycles > 280000 ? (
                <span className="text-rose-400 font-bold">【危急】 累计弯曲疲劳次数接近设计极限，内部可能存在大量不可见的疲劳断丝。建议立即进行电磁探伤 (NDT) 并准备更换。</span>
              ) : ropeState.brokenWires >= 6 ? (
                <span className="text-amber-500">【警告】 表面断丝数量增多，已进入疲劳加速期。请增加人工目视检查频率，注意观察断丝是否集中。</span>
              ) : ropeState.hoistLoad > 40 ? (
                <span className="text-yellow-500">【注意】 当前起升载荷较大，频繁重载会导致钢丝绳塑性伸长和疲劳加剧。</span>
              ) : (
                <span className="text-emerald-500">【正常】 钢丝绳疲劳状态在可控范围内，表面未见严重损伤。</span>
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
      <span className="text-neutral-400">{label}</span>
      <span className="font-mono text-neutral-300">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-neutral-500" />
    <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-2 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${((value - min) / (max - min)) * 100}%` }}></div>
    </div>
  </div>
);

const DiagnosticItem = ({ label, value, critical }: { label: string, value: number, critical: number }) => {
  const isCritical = value >= critical;
  return (
    <div>
      <div className="flex justify-between text-xs text-neutral-400 mb-1">
        <span>{label}</span>
        <span className={isCritical ? 'text-rose-500 font-bold' : ''}>{value.toFixed(1)}%</span>
      </div>
      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden relative">
        <div className={`h-full transition-all duration-500 ${isCritical ? 'bg-rose-500' : value > critical * 0.7 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, value)}%` }}></div>
        <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/50" style={{ left: `${critical}%` }}></div>
      </div>
    </div>
  );
};
