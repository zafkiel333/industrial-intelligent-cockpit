
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ScatterChart, Scatter, ReferenceLine
} from 'recharts';
import { 
  FlaskConical, Activity, Settings, TrendingUp, 
  Wind, Droplets, Filter, RefreshCcw, Sliders
} from 'lucide-react';

// --- MOCK DATA ---

// Grade-Recovery Curve (Theoretical model)
const GRADE_RECOVERY_DATA = Array.from({length: 20}, (_, i) => {
    const recovery = 75 + i; // 75% to 95%
    // Inverse relationship: Higher recovery usually means pulling more waste, so grade drops
    // Model: Grade = MaxGrade - k * exp(Recovery factor)
    const grade = 28 - 20 * Math.pow((recovery - 70) / 30, 2); 
    return {
        recovery: recovery,
        grade: Math.max(0, grade)
    };
});

// Reagent Efficiency
const REAGENT_EFFICIENCY = [
    { dosage: 10, recovery: 60 }, { dosage: 20, recovery: 75 },
    { dosage: 30, recovery: 85 }, { dosage: 40, recovery: 88 },
    { dosage: 50, recovery: 90 }, { dosage: 60, recovery: 91 }, // Diminishing returns
    { dosage: 70, recovery: 91.5 },
];

export const MineralRecoveryView: React.FC = () => {
  // --- STATE ---
  const [collectorDosage, setCollectorDosage] = useState(40); // g/t
  const [frotherDosage, setFrotherDosage] = useState(25); // g/t
  const [airFlow, setAirFlow] = useState(120); // L/min
  
  const [simMetrics, setSimMetrics] = useState({
    concGrade: 22.5, // %
    recovery: 88.5, // %
    tailingGrade: 0.15, // %
    massPull: 3.5, // %
    profit: 1250 // $/h
  });

  // Simulation Logic
  useEffect(() => {
    // 1. Calculate Recovery based on inputs
    // Base 85%, Collector adds logarithmic gain, Air adds linear gain up to a point
    let rec = 80 + 10 * (1 - Math.exp(-collectorDosage / 20)) + (airFlow - 100) * 0.05;
    rec = Math.min(95, Math.max(50, rec));

    // 2. Calculate Grade based on Recovery (Trade-off)
    // Higher Frother reduces selectivity (drops grade)
    const selectivityFactor = 1 - (frotherDosage - 20) * 0.01;
    let grd = 30 - 20 * Math.pow((rec - 70) / 30, 2);
    grd *= selectivityFactor;
    grd = Math.max(5, grd);

    setSimMetrics({
        concGrade: grd,
        recovery: rec,
        tailingGrade: 2.0 * (1 - rec/100), // Simple mass balance approx
        massPull: 3.5 + (airFlow - 120) * 0.02,
        profit: (rec * grd * 5) - (collectorDosage * 2 + frotherDosage * 3) // Mock profit formula
    });

  }, [collectorDosage, frotherDosage, airFlow]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#020b14] text-cyan-50 relative overflow-hidden">
      
      {/* Molecular Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-20"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-cyan-900/50 pb-4 px-2 bg-gradient-to-r from-[#0e172a] to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-400 mb-1 uppercase tracking-wider">
             <FlaskConical size={14} className="animate-bounce" /> Chemical Process Intelligence
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             选矿金属回收率 <span className="text-cyan-500">多维精细化分析</span>
          </h1>
        </div>
        
        {/* Real-time KPI Stream */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase">Recovery Rate</div>
                <div className="text-3xl font-mono font-bold text-cyan-300">{simMetrics.recovery.toFixed(2)} <span className="text-sm text-slate-500">%</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase">Concentrate Grade</div>
                <div className="text-2xl font-mono font-bold text-white">{simMetrics.concGrade.toFixed(2)} <span className="text-sm text-slate-500">% Cu</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase">Process Profit</div>
                <div className="text-2xl font-mono font-bold text-green-400">+$ {simMetrics.profit.toFixed(0)} <span className="text-sm text-slate-500">/h</span></div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Simulation Controls */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="药剂与工况调优" subtitle="SIMULATION" className="flex-1 border-cyan-900/50 bg-[#081220]/80">
                  <div className="flex flex-col gap-6 p-2">
                      {/* Collector Slider */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-cyan-200">
                              <span className="flex items-center gap-2"><Droplets size={12}/> 捕收剂 (Collector)</span>
                              <span className="font-mono">{collectorDosage} g/t</span>
                          </div>
                          <input 
                            type="range" min="10" max="100" 
                            value={collectorDosage} onChange={(e) => setCollectorDosage(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500">
                              <span>Low Cost</span>
                              <span>High Recovery</span>
                          </div>
                      </div>

                      {/* Frother Slider */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-teal-200">
                              <span className="flex items-center gap-2"><Filter size={12}/> 起泡剂 (Frother)</span>
                              <span className="font-mono">{frotherDosage} g/t</span>
                          </div>
                          <input 
                            type="range" min="10" max="60" 
                            value={frotherDosage} onChange={(e) => setFrotherDosage(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500">
                              <span>Stable Froth</span>
                              <span>Entrainment Risk</span>
                          </div>
                      </div>

                      {/* Air Flow Slider */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-blue-200">
                              <span className="flex items-center gap-2"><Wind size={12}/> 充气量 (Air Flow)</span>
                              <span className="font-mono">{airFlow} L/min</span>
                          </div>
                          <input 
                            type="range" min="80" max="200" 
                            value={airFlow} onChange={(e) => setAirFlow(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                      </div>

                      <div className="mt-4 p-3 bg-cyan-900/20 border border-cyan-800/30 rounded text-xs text-cyan-200/80 leading-relaxed">
                          <strong className="text-white block mb-1">AI 建议:</strong> 当前工况下，适当降低起泡剂用量可提升精矿品位 0.5%，且不显著影响回收率。
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="药剂-回收率响应" className="h-[200px] border-cyan-900/50">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={REAGENT_EFFICIENCY}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="dosage" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Dosage', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[50, 100]} />
                              <Tooltip contentStyle={{backgroundColor: '#020b14', borderColor: '#22d3ee'}} />
                              <Line type="monotone" dataKey="recovery" stroke="#22d3ee" strokeWidth={2} dot={{r:3}} />
                              <ReferenceLine x={collectorDosage} stroke="#facc15" strokeDasharray="3 3" label={{value: 'Current', fill: '#facc15', fontSize: 10}} />
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: Micro-Process Twin */}
          <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
              
              {/* 3D Container */}
              <div className="flex-1 bg-gradient-to-b from-[#081b26] to-[#020609] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(34,211,238,0.1)] group">
                  
                  {/* HUD: Particle Stats */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                      <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded">
                          <div className="text-[10px] text-cyan-300 uppercase font-bold mb-1 flex items-center gap-2">
                              <Activity size={12}/> Particle Tracking
                          </div>
                          <div className="flex gap-4 text-xs font-mono">
                              <div className="text-yellow-400">● Hydrophobic (Ore)</div>
                              <div className="text-slate-400">● Hydrophilic (Waste)</div>
                          </div>
                      </div>
                  </div>

                  {/* Froth Physics Info */}
                  <div className="absolute bottom-4 right-4 z-20">
                      <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded text-right">
                          <div className="text-[10px] text-slate-400 uppercase">Bubble Diameter (d32)</div>
                          <div className="text-lg font-bold text-white">1.2 mm</div>
                      </div>
                  </div>

                  <ThreeScene type="mineral-recovery-analysis" color="#22d3ee" />
              </div>

          </div>

          {/* RIGHT: Grade-Recovery Tradeoff */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="品位-回收率曲线" subtitle="TRADE-OFF" className="h-[280px] border-cyan-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 0}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis type="number" dataKey="recovery" name="Recovery" unit="%" stroke="#64748b" domain={[70, 100]} label={{ value: 'Recovery %', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                              <YAxis type="number" dataKey="grade" name="Grade" unit="%" stroke="#64748b" domain={[0, 40]} label={{ value: 'Grade %', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                              <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#020b14', borderColor: '#22d3ee', color: '#fff'}} />
                              
                              {/* Theoretical Curve */}
                              <Scatter name="Curve" data={GRADE_RECOVERY_DATA} line={{stroke: '#0e7490', strokeWidth: 2}} shape={() => null} />
                              
                              {/* Current Operating Point */}
                              <Scatter name="Current Ops" data={[{recovery: simMetrics.recovery, grade: simMetrics.concGrade}]} fill="#facc15" shape="circle" r={6}>
                                  <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
                              </Scatter>
                          </ScatterChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              {/* Economic Balance */}
              <SciFiCard title="经济效益平衡" subtitle="PROFIT" className="flex-1 border-cyan-900/50">
                  <div className="flex flex-col h-full gap-4">
                      <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 pb-2">
                          <span>Revenue (Metal)</span>
                          <span className="text-green-400 font-mono">+ $1,850</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 pb-2">
                          <span>Reagent Cost</span>
                          <span className="text-red-400 font-mono">- $420</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 pb-2">
                          <span>Energy Cost</span>
                          <span className="text-red-400 font-mono">- $180</span>
                      </div>
                      
                      <div className="mt-auto p-2 bg-slate-800 rounded text-center">
                          <div className="text-[10px] text-slate-500 uppercase">Net Efficiency</div>
                          <div className="text-xl font-bold text-white">{(simMetrics.profit / 1850 * 100).toFixed(1)}%</div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
