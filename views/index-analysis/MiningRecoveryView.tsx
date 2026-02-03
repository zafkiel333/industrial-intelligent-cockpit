
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, ScatterChart, Scatter
} from 'recharts';
import { 
  Pickaxe, TrendingUp, Layers, Calculator, 
  Target, AlertCircle, Maximize2, RefreshCw, 
  Settings, ChevronRight, Gem, BoxSelect
} from 'lucide-react';

// --- MOCK DATA FOR CHARTS ---

// Grade-Tonnage Curve Data
const GRADE_TONNAGE_DATA = Array.from({length: 20}, (_, i) => {
    const grade = i * 0.5; // Cut-off grade from 0 to 10
    const tonnage = 100 * Math.exp(-0.2 * grade); // Decreases as cut-off rises
    const avgGrade = 2 + grade * 0.8; // Increases as cut-off rises
    return {
        cutOff: grade,
        tonnage: tonnage,
        avgGrade: avgGrade
    };
});

// Loss & Dilution Trend (Historical)
const TREND_DATA = Array.from({length: 12}, (_, i) => ({
    month: `${i+1}月`,
    recovery: 92 + Math.random() * 3, // Target ~95%
    dilution: 5 + Math.random() * 2, // Target < 5%
    oreMined: 450 + Math.random() * 50 // kt
}));

export const MiningRecoveryView: React.FC = () => {
  // --- STATE ---
  const [cutOffGrade, setCutOffGrade] = useState(2.5); // g/t
  const [metrics, setMetrics] = useState({
    oreTonnage: 450000,
    wasteTonnage: 120000,
    avgGrade: 4.2,
    recoveryRate: 93.5,
    dilutionRate: 4.8,
    metalContent: 1890 // kg
  });

  // Simulation: Recalculate metrics when Cut-off Grade changes
  useEffect(() => {
    // Simulated calculation formula
    const factor = (3.0 - cutOffGrade) * 0.1;
    
    setMetrics(prev => ({
        oreTonnage: 450000 * (1 + factor),
        wasteTonnage: 120000 * (1 - factor),
        avgGrade: 4.2 + (cutOffGrade - 2.5) * 0.5,
        recoveryRate: Math.min(99, 93.5 - (cutOffGrade - 2.5) * 2), // Higher cut-off usually lowers recovery of total resource
        dilutionRate: Math.max(1, 4.8 - (cutOffGrade - 2.5) * 1.5), // Higher cut-off usually reduces dilution (stricter selection)
        metalContent: 1890 * (1 + factor * 0.8)
    }));
  }, [cutOffGrade]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#0b0a14] text-slate-200 relative overflow-hidden">
      
      {/* Background Tech Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-purple-900/50 pb-4 px-2 bg-gradient-to-r from-[#1e1b4b] to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <Gem size={14} className="animate-pulse" /> Resource Optimization Engine
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             采矿回采率 <span className="text-purple-500">& 贫化率智能分析</span>
          </h1>
        </div>
        
        {/* Simulation Control Header */}
        <div className="flex items-center gap-6 bg-slate-900/60 p-2 rounded border border-purple-500/30">
            <div className="text-right px-4">
                <div className="text-[10px] text-slate-400 uppercase">Current Cut-off Grade</div>
                <div className="text-2xl font-mono font-bold text-amber-400">{cutOffGrade.toFixed(1)} <span className="text-sm text-slate-500">g/t</span></div>
            </div>
            <div className="h-8 w-[1px] bg-slate-700"></div>
            <div className="flex flex-col w-48 gap-1">
                <div className="flex justify-between text-xs text-slate-300">
                    <span>Sensitivity Analysis</span>
                    <span>{cutOffGrade.toFixed(1)}</span>
                </div>
                <input 
                  type="range" min="1.0" max="5.0" step="0.1" 
                  value={cutOffGrade}
                  onChange={(e) => setCutOffGrade(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: 3D Voxel Model (The Hero) */}
          <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
              
              {/* 3D Container */}
              <div className="flex-1 bg-[#050508] border border-purple-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(168,85,247,0.15)] group">
                  
                  {/* HUD: Block Stats */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                      <div className="bg-black/60 backdrop-blur border border-purple-500/30 px-3 py-2 rounded">
                          <div className="text-[10px] text-purple-300 uppercase font-bold mb-1 flex items-center gap-2">
                              <BoxSelect size={12}/> Block Model Summary
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-300">
                              <div>Total Blocks: <span className="text-white font-mono">15,625</span></div>
                              <div>Resolution: <span className="text-white font-mono">5x5x5m</span></div>
                              <div>Ore Blocks: <span className="text-amber-400 font-mono">8,420</span></div>
                              <div>Waste Blocks: <span className="text-slate-400 font-mono">7,205</span></div>
                          </div>
                      </div>
                  </div>

                  {/* Legend Overlay */}
                  <div className="absolute bottom-4 left-4 z-20 bg-black/60 p-2 rounded border border-slate-700 text-[10px] text-slate-300 flex flex-col gap-1">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 border border-amber-300"></div> High Grade (&gt;5g/t)</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 border border-purple-300"></div> Low Grade (2-5g/t)</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-600 border border-slate-500"></div> Waste/Gangue</div>
                  </div>

                  <ThreeScene type="mining-recovery-analysis" color="#a855f7" />
              </div>

              {/* Bottom: Simulated Metrics Strip */}
              <div className="h-24 grid grid-cols-4 gap-4">
                  <SciFiCard className="bg-slate-900/40 border-purple-900/50 flex flex-col justify-center items-center" noPadding>
                      <div className="text-xs text-slate-400 uppercase">Ore Tonnage</div>
                      <div className="text-2xl font-bold text-white">{(metrics.oreTonnage/1000).toFixed(1)} k</div>
                  </SciFiCard>
                  <SciFiCard className="bg-slate-900/40 border-purple-900/50 flex flex-col justify-center items-center" noPadding>
                      <div className="text-xs text-slate-400 uppercase">Avg Grade</div>
                      <div className="text-2xl font-bold text-amber-400">{metrics.avgGrade.toFixed(2)} g/t</div>
                  </SciFiCard>
                  <SciFiCard className="bg-slate-900/40 border-purple-900/50 flex flex-col justify-center items-center" noPadding>
                      <div className="text-xs text-slate-400 uppercase">Metal Content</div>
                      <div className="text-2xl font-bold text-purple-300">{metrics.metalContent.toFixed(0)} kg</div>
                  </SciFiCard>
                  <SciFiCard className="bg-slate-900/40 border-purple-900/50 flex flex-col justify-center items-center" noPadding>
                      <div className="text-xs text-slate-400 uppercase">Profit Est.</div>
                      <div className="text-2xl font-bold text-green-400">$ {(metrics.metalContent * 60 / 1000).toFixed(1)} M</div>
                  </SciFiCard>
              </div>

          </div>

          {/* RIGHT: Analysis Charts */}
          <div className="w-full lg:w-1/2 flex flex-col gap-5">
              
              {/* Row 1: Core Indicators Gauge/Chart */}
              <div className="h-[280px] grid grid-cols-2 gap-5">
                  <SciFiCard title="回采率分析 (Recovery)" subtitle="KPI" className="border-purple-900/50">
                      <div className="flex flex-col items-center justify-center h-full relative">
                          <div className="relative w-40 h-40">
                              {/* Custom Circular Progress */}
                              <svg className="w-full h-full -rotate-90">
                                  <circle cx="80" cy="80" r="70" fill="none" stroke="#1e293b" strokeWidth="12" />
                                  <circle cx="80" cy="80" r="70" fill="none" stroke="#a855f7" strokeWidth="12" 
                                          strokeDasharray="440" strokeDashoffset={440 - (440 * metrics.recoveryRate / 100)} 
                                          className="transition-all duration-500 ease-out" />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-3xl font-bold text-white">{metrics.recoveryRate.toFixed(1)}%</span>
                                  <span className="text-xs text-slate-400">Recovery</span>
                              </div>
                          </div>
                          <div className="text-center mt-2 text-xs text-slate-400">
                              Target: &gt;92% | Loss Rate: {(100 - metrics.recoveryRate).toFixed(1)}%
                          </div>
                      </div>
                  </SciFiCard>

                  <SciFiCard title="贫化率分析 (Dilution)" subtitle="KPI" className="border-purple-900/50">
                      <div className="flex flex-col items-center justify-center h-full relative">
                          <div className="relative w-40 h-40">
                              {/* Custom Circular Progress */}
                              <svg className="w-full h-full -rotate-90">
                                  <circle cx="80" cy="80" r="70" fill="none" stroke="#1e293b" strokeWidth="12" />
                                  <circle cx="80" cy="80" r="70" fill="none" stroke="#f59e0b" strokeWidth="12" 
                                          strokeDasharray="440" strokeDashoffset={440 - (440 * metrics.dilutionRate / 100)} 
                                          className="transition-all duration-500 ease-out" />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-3xl font-bold text-white">{metrics.dilutionRate.toFixed(1)}%</span>
                                  <span className="text-xs text-slate-400">Dilution</span>
                              </div>
                          </div>
                          <div className="text-center mt-2 text-xs text-slate-400">
                              Limit: &lt;8% | Waste Mixed: {(metrics.wasteTonnage/1000).toFixed(1)} kt
                          </div>
                      </div>
                  </SciFiCard>
              </div>

              {/* Row 2: Grade-Tonnage Curve */}
              <SciFiCard title="品位-吨位曲线 (Grade-Tonnage Curve)" subtitle="OPTIMIZATION" className="flex-1 border-purple-900/50">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={GRADE_TONNAGE_DATA} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="cutOff" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Cut-off Grade (g/t)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                              <YAxis yAxisId="left" stroke="#a855f7" tick={{fontSize: 10}} label={{ value: 'Tonnage (kt)', angle: -90, position: 'insideLeft', fill: '#a855f7', fontSize: 10 }} />
                              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{fontSize: 10}} label={{ value: 'Avg Grade (g/t)', angle: 90, position: 'insideRight', fill: '#f59e0b', fontSize: 10 }} />
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#a855f7'}} />
                              <Area yAxisId="left" type="monotone" dataKey="tonnage" fill="#a855f7" stroke="#a855f7" fillOpacity={0.3} name="Ore Tonnage" />
                              <Line yAxisId="right" type="monotone" dataKey="avgGrade" stroke="#f59e0b" strokeWidth={2} dot={false} name="Average Grade" />
                              <ReferenceLine x={cutOffGrade} stroke="white" strokeDasharray="3 3" label={{value: 'Current Cut-off', fill: 'white', fontSize: 10}} />
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              {/* Row 3: Historical Trend */}
              <SciFiCard title="历史回采指标趋势 (12 Months)" subtitle="TREND" className="flex-1 border-purple-900/50">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={TREND_DATA} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#a855f7'}} />
                              <Bar dataKey="recovery" name="Recovery %" fill="#a855f7" barSize={15} radius={[4, 4, 0, 0]} />
                              <Line type="monotone" dataKey="dilution" name="Dilution %" stroke="#f59e0b" strokeWidth={2} dot={{r:3}} />
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
