import React, { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, Link, ArrowDownToLine, ShieldAlert, RefreshCw } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/gate-hoist-rope-fatigue/ThreeScene';
import { RopeState } from '../../../components/life-warning/gate-hoist-rope-fatigue/three-types';

export const View: React.FC = () => {
  const [ropeState, setRopeState] = useState<RopeState>({
    tension: 150, // kN (working load)
    bendingCycles: 5000,
    corrosionLevel: 0.1,
    brokenWires: 0,
    fatigueFactor: 0.05,
  });

  const [healthScore, setHealthScore] = useState(98);
  const [estimatedLife, setEstimatedLife] = useState(12000); // Cycles remaining

  useEffect(() => {
    const interval = setInterval(() => {
      setRopeState(prev => {
        // Simulate operation cycle (lifting/lowering gate)
        const isOperating = Math.random() > 0.7; // 30% chance of operating
        
        let newTension = prev.tension;
        let newCycles = prev.bendingCycles;
        
        if (isOperating) {
          // Tension spikes during operation (e.g., breaking gate seal)
          newTension = 150 + Math.random() * 250; // Max ~400kN
          newCycles += 1;
        } else {
          // Resting tension
          newTension = 150 + (Math.random() - 0.5) * 10;
        }

        // Fatigue accumulation based on Miner's rule (simplified)
        // High tension cycles cause exponentially more fatigue
        const stressRatio = newTension / 500; // Assume 500kN is breaking load
        const fatigueIncrement = isOperating ? Math.pow(stressRatio, 3) * 0.001 : 0;
        
        // Corrosion increases slowly over time
        const corrosionIncrement = 0.0001 + (Math.random() * 0.00005);
        
        const newCorrosion = Math.min(1.0, prev.corrosionLevel + corrosionIncrement);
        const newFatigue = Math.min(1.0, prev.fatigueFactor + fatigueIncrement + (newCorrosion * 0.0005));

        // Broken wires appear probabilistically based on fatigue and corrosion
        let newBrokenWires = prev.brokenWires;
        if (newFatigue > 0.4 && Math.random() < (newFatigue - 0.4) * 0.1) {
          newBrokenWires += 1;
        }

        // Update health and life
        // Health drops sharply if broken wires exceed threshold (e.g., 6 per lay length)
        const brokenWirePenalty = newBrokenWires > 6 ? 50 : newBrokenWires * 5;
        setHealthScore(Math.max(0, Math.floor(100 - (newFatigue * 100) - brokenWirePenalty)));
        
        // Estimate remaining cycles based on current fatigue rate
        const remainingCycles = Math.max(0, Math.floor((1 - newFatigue) / (fatigueIncrement || 0.0001)));
        setEstimatedLife(remainingCycles);

        return {
          ...prev,
          tension: newTension,
          bendingCycles: newCycles,
          corrosionLevel: newCorrosion,
          fatigueFactor: newFatigue,
          brokenWires: newBrokenWires,
        };
      });
    }, 1000); // Faster update for dynamic tension

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setRopeState({
      tension: 150,
      bendingCycles: 0,
      corrosionLevel: 0,
      brokenWires: 0,
      fatigueFactor: 0,
    });
    setHealthScore(100);
    setEstimatedLife(20000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#111827] text-slate-200 p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <Link className="w-8 h-8 text-slate-400" />
            闸门启闭机钢丝绳疲劳预警
          </h1>
          <p className="text-slate-400 mt-1">基于张力监测与弯曲疲劳累积的断丝及寿命预测</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">结构健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-600"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">剩余弯曲次数</div>
              <div className="text-2xl font-bold text-slate-300">{estimatedLife.toLocaleString()}</div>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>更换钢丝绳</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Parameters */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <ArrowDownToLine className="w-5 h-5" />
              载荷与环境监测
            </h3>
            
            <div className="space-y-6">
              <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">实时张力 (kN)</span>
                  <span className={`font-mono text-xl font-bold ${ropeState.tension > 350 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                    {ropeState.tension.toFixed(1)}
                  </span>
                </div>
                {/* Dynamic tension bar */}
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500 transition-all duration-100" style={{ width: `${Math.min(100, (ropeState.tension / 500) * 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0</span><span>额定: 150</span><span>破断: 500</span>
                </div>
              </div>

              <ParameterControl 
                label="表面锈蚀程度" 
                value={ropeState.corrosionLevel * 100} 
                max={100} 
                color={ropeState.corrosionLevel > 0.6 ? 'bg-amber-700' : 'bg-amber-600'}
                onChange={(v) => setRopeState(s => ({...s, corrosionLevel: v / 100}))}
              />
              
              <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-slate-700">
                <span className="text-sm text-slate-400">累计弯曲循环</span>
                <span className="font-mono text-lg text-slate-300">{ropeState.bendingCycles.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              损伤状态指标
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">疲劳损伤因子 (D)</span>
                <span className={`font-mono font-bold ${ropeState.fatigueFactor > 0.8 ? 'text-rose-500' : 'text-amber-400'}`}>
                  {ropeState.fatigueFactor.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">断丝数 (根/捻距)</span>
                <span className={`font-mono font-bold text-xl ${ropeState.brokenWires >= 6 ? 'text-rose-500 animate-pulse' : ropeState.brokenWires > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {ropeState.brokenWires}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: 3D Visualization */}
        <div className="col-span-6 bg-[#0a0a0a] border border-slate-700 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-600 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></div>
            6x36WS 钢丝绳 3D 微观受力模型
          </div>
          
          <div className="flex-1 relative">
            <ThreeScene state={ropeState} />
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-800/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-600">
              <div className="text-xs text-slate-400">当前应力状态</div>
              <div className={`text-lg font-mono ${ropeState.tension > 300 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {ropeState.tension > 300 ? '高应力区' : '安全工作区'}
              </div>
            </div>
            <div className="bg-slate-800/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-600 text-right">
              <div className="text-xs text-slate-400">截面积损失率估算</div>
              <div className="text-lg font-mono text-amber-400">
                {((ropeState.corrosionLevel * 0.1 + (ropeState.brokenWires / 216)) * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Analysis & History */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              疲劳寿命 S-N 曲线分析
            </h3>
            
            {/* Simulated S-N Curve Area */}
            <div className="h-48 bg-slate-900 border border-slate-700 rounded-lg relative overflow-hidden mb-6 p-2">
               {/* Axes */}
               <div className="absolute left-6 top-2 bottom-6 w-px bg-slate-600"></div>
               <div className="absolute left-6 bottom-6 right-2 h-px bg-slate-600"></div>
               <div className="absolute left-2 top-2 text-[10px] text-slate-500 transform -rotate-90 origin-left">应力幅 (S)</div>
               <div className="absolute right-2 bottom-2 text-[10px] text-slate-500">循环数 (log N)</div>
               
               {/* S-N Curve Line (Simulated) */}
               <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                 <path d="M 30 20 Q 100 80 250 150" fill="none" stroke="#4b5563" strokeWidth="2" strokeDasharray="4 4" />
               </svg>

               {/* Current State Point */}
               <div 
                 className="absolute w-3 h-3 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.8)] transform -translate-x-1.5 -translate-y-1.5 transition-all duration-500"
                 style={{
                   left: `${30 + (ropeState.bendingCycles / 20000) * 220}px`,
                   top: `${150 - (ropeState.tension / 500) * 130}px`
                 }}
               ></div>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-slate-100">安全评估规程 (GB/T 5972)：</strong></p>
              {ropeState.brokenWires >= 6 ? (
                <span className="text-rose-400 font-bold">【报废警告】 局部断丝数已达到或超过 6根/捻距 报废标准。必须立即停止使用并更换钢丝绳！</span>
              ) : ropeState.fatigueFactor > 0.8 || ropeState.corrosionLevel > 0.8 ? (
                <span className="text-amber-400">【严重警告】 疲劳损伤或锈蚀严重，截面积损失接近临界值。建议降载运行，并在一周内安排更换。</span>
              ) : ropeState.brokenWires > 0 ? (
                <span className="text-yellow-400">【注意】 发现散发性断丝。需加强日常探伤检测，记录断丝发展趋势。</span>
              ) : (
                <span className="text-emerald-400">【正常】 钢丝绳处于安全服役期。请保持定期润滑保养，防止内部锈蚀。</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Subcomponents
const ParameterControl = ({ label, value, max, min = 0, color, onChange }: { label: string, value: number, max: number, min?: number, color: string, onChange: (v: number) => void }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-300">{label}</span>
      <span className="font-mono text-slate-300">{value.toFixed(1)}%</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={(max - min) / 100}
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400"
    />
    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${((value - min) / (max - min)) * 100}%` }}></div>
    </div>
  </div>
);
