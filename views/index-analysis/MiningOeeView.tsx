
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, Legend, ReferenceLine, PieChart, Pie, Cell
} from 'recharts';
import { 
  Activity, Settings, Clock, AlertTriangle, 
  TrendingUp, TrendingDown, Hammer, Zap, 
  BarChart3, RefreshCw
} from 'lucide-react';

// --- MOCK DATA ---

// OEE Waterfall Data
const TIME_LOSS_DATA = [
  { name: 'Total Time', value: 720, type: 'Base' }, // 12h shift
  { name: 'Planned Down', value: -60, type: 'Loss' },
  { name: 'Availability Loss', value: -85, type: 'Loss' },
  { name: 'Performance Loss', value: -95, type: 'Loss' },
  { name: 'Quality Loss', value: -30, type: 'Loss' },
  { name: 'Fully Productive', value: 450, type: 'Result' },
];

const DOWNTIME_REASONS = [
  { name: 'Mechanical Fail', value: 45, color: '#ef4444' },
  { name: 'Electrical Fault', value: 25, color: '#f59e0b' },
  { name: 'Conveyor Block', value: 20, color: '#3b82f6' },
  { name: 'Other', value: 10, color: '#64748b' },
];

const OEE_TREND = Array.from({length: 12}, (_, i) => ({
    hour: `${8+i}:00`,
    oee: 65 + Math.random() * 20,
    target: 75
}));

export const MiningOeeView: React.FC = () => {
  // --- STATE ---
  // Simulation Inputs
  const [plannedDowntime, setPlannedDowntime] = useState(60); // minutes
  const [unplannedDowntime, setUnplannedDowntime] = useState(45); // minutes
  const [speedFactor, setSpeedFactor] = useState(0.85); // 0-1 (Performance)
  const [rejectRate, setRejectRate] = useState(0.05); // 0-1 (Quality)

  // Calculated Metrics
  const [oeeMetrics, setOeeMetrics] = useState({
    availability: 0,
    performance: 0,
    quality: 0,
    oee: 0,
    productiveTime: 0
  });

  useEffect(() => {
    // Calculation Logic
    const totalTime = 720; // 12 hours * 60
    const runTime = totalTime - plannedDowntime - unplannedDowntime;
    const avail = runTime / (totalTime - plannedDowntime);
    
    // Performance is simplified here as speed factor
    const perf = speedFactor;
    
    // Quality
    const qual = 1 - rejectRate;

    const oee = avail * perf * qual;

    setOeeMetrics({
        availability: Math.max(0, avail * 100),
        performance: perf * 100,
        quality: qual * 100,
        oee: Math.max(0, oee * 100),
        productiveTime: runTime * perf * qual
    });
  }, [plannedDowntime, unplannedDowntime, speedFactor, rejectRate]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#0c0a09] text-amber-50 relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-950/20 via-[#0c0a09] to-black pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-amber-800/50 pb-4 px-2 bg-gradient-to-r from-[#2a1a05] to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <Activity size={14} className="animate-pulse" /> Equipment Efficiency Optimization
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             综采设备 OEE <span className="text-amber-500">综合效率分析</span>
          </h1>
        </div>
        
        {/* Core OEE Score */}
        <div className="flex items-center gap-4 bg-slate-900/60 p-2 rounded border border-amber-500/30">
            <div className="text-right px-4">
                <div className="text-[10px] text-slate-400 uppercase">Overall Equipment Effectiveness</div>
                <div className={`text-3xl font-mono font-bold ${oeeMetrics.oee >= 75 ? 'text-green-400' : oeeMetrics.oee >= 60 ? 'text-yellow-400' : 'text-red-500'}`}>
                    {oeeMetrics.oee.toFixed(1)}%
                </div>
            </div>
            <div className="flex gap-2">
                <div className="flex flex-col items-center px-2 border-l border-slate-700">
                    <span className="text-xs text-slate-500">Avail</span>
                    <span className="font-bold text-white">{oeeMetrics.availability.toFixed(0)}%</span>
                </div>
                <div className="flex flex-col items-center px-2 border-l border-slate-700">
                    <span className="text-xs text-slate-500">Perf</span>
                    <span className="font-bold text-white">{oeeMetrics.performance.toFixed(0)}%</span>
                </div>
                <div className="flex flex-col items-center px-2 border-l border-slate-700">
                    <span className="text-xs text-slate-500">Qual</span>
                    <span className="font-bold text-white">{oeeMetrics.quality.toFixed(0)}%</span>
                </div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Simulation Inputs */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="OEE 因子仿真调优" subtitle="SIMULATION" className="flex-1 border-amber-900/50 bg-[#151008]/80">
                  <div className="flex flex-col gap-6 p-2">
                      {/* Availability Input */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-amber-200">
                              <span className="flex items-center gap-2"><Clock size={12}/> Unplanned Downtime</span>
                              <span className="font-mono">{unplannedDowntime} min</span>
                          </div>
                          <input 
                            type="range" min="0" max="240" step="5" 
                            value={unplannedDowntime} onChange={(e) => setUnplannedDowntime(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                          />
                      </div>

                      {/* Performance Input */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-blue-200">
                              <span className="flex items-center gap-2"><Zap size={12}/> Running Speed</span>
                              <span className="font-mono">{(speedFactor * 100).toFixed(0)}%</span>
                          </div>
                          <input 
                            type="range" min="0.5" max="1.0" step="0.01" 
                            value={speedFactor} onChange={(e) => setSpeedFactor(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                      </div>

                      {/* Quality Input */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-green-200">
                              <span className="flex items-center gap-2"><AlertTriangle size={12}/> Reject/Waste Rate</span>
                              <span className="font-mono">{(rejectRate * 100).toFixed(1)}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="0.2" step="0.01" 
                            value={rejectRate} onChange={(e) => setRejectRate(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                          />
                      </div>

                      <div className="mt-4 p-3 bg-amber-900/20 border border-amber-800/30 rounded text-xs text-amber-200/80 leading-relaxed">
                          <strong className="text-white block mb-1">Impact Analysis:</strong> 
                          Reducing downtime by 30 mins will increase OEE by +4.2%. Current bottleneck is Availability.
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="停机原因分布" subtitle="PARETO" className="h-[250px] border-amber-900/50">
                  <div className="w-full h-full p-2 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                data={DOWNTIME_REASONS}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {DOWNTIME_REASONS.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f59e0b', color: '#fff'}} />
                              <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                          </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                          <span className="text-lg font-bold text-white">{unplannedDowntime}m</span>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: Digital Twin & 3D */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#050505] border border-amber-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(245,158,11,0.15)] group">
                  
                  {/* HUD: Status */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-amber-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Hammer size={16} className="text-amber-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Shearer Status</div>
                              <div className={`text-sm font-bold ${oeeMetrics.availability > 0 ? 'text-green-400' : 'text-red-500'}`}>
                                  {oeeMetrics.availability > 0 ? 'RUNNING' : 'STOPPED'}
                              </div>
                          </div>
                      </div>
                  </div>

                  <ThreeScene type="mining-oee-analysis" color="#f59e0b" />
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(245,158,11,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
              </div>

              {/* Bottom: Waterfall Chart (Custom visual using BarChart) */}
              <SciFiCard title="时间损失瀑布图 (Time Loss Waterfall)" subtitle="MINUTES" className="h-[240px] border-amber-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={TIME_LOSS_DATA}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#331c09" vertical={false} />
                              <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                              <Tooltip cursor={{fill: '#1c1917'}} contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f59e0b'}} />
                              <Bar dataKey="value" fill="#f59e0b">
                                {TIME_LOSS_DATA.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.type === 'Loss' ? '#ef4444' : entry.type === 'Result' ? '#10b981' : '#3b82f6'} />
                                ))}
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Trends & Benchmarks */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* OEE Trend */}
              <SciFiCard title="OEE 班次趋势" subtitle="SHIFT TREND" className="h-[280px] border-amber-900/50">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={OEE_TREND}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#331c09" vertical={false} />
                              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={2} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                              <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f59e0b'}} />
                              <Bar dataKey="oee" fill="#f59e0b" barSize={10} radius={[2, 2, 0, 0]} />
                              <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              {/* Benchmarking */}
              <SciFiCard title="行业对标" className="flex-1 border-amber-900/50">
                  <div className="flex flex-col gap-4 justify-center h-full">
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-slate-400">
                              <span>World Class OEE</span>
                              <span className="text-white">85%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-slate-500 h-full" style={{width: '85%'}}></div>
                          </div>
                      </div>
                      
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-slate-400">
                              <span>Current Site</span>
                              <span className="text-amber-400">{oeeMetrics.oee.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full" style={{width: `${oeeMetrics.oee}%`}}></div>
                          </div>
                      </div>

                      <div className="p-2 border border-slate-700 rounded bg-slate-900/30 flex items-center gap-2 mt-2">
                          <TrendingUp size={16} className="text-green-400" />
                          <div className="text-xs text-slate-300">
                              Top opportunity: Reduce unplanned mech downtime.
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
