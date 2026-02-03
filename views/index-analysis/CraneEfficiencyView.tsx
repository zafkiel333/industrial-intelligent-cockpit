
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Activity, Zap, Clock, Box, TrendingUp, 
  Settings, ArrowRight, MoreHorizontal, Crosshair,
  BarChart2, Play, Pause, FastForward
} from 'lucide-react';

// --- MOCK DATA ---

// Crane List
const CRANES = [
  { id: 'QC-01', type: 'STS', mph: 32.5, status: 'Active', energy: 120 },
  { id: 'QC-02', type: 'STS', mph: 34.2, status: 'Active', energy: 115 },
  { id: 'QC-03', type: 'STS', mph: 28.8, status: 'Maint', energy: 0 },
  { id: 'RTG-01', type: 'RTG', mph: 18.5, status: 'Active', energy: 45 },
  { id: 'RTG-02', type: 'RTG', mph: 20.1, status: 'Active', energy: 48 },
  { id: 'RTG-03', type: 'RTG', mph: 15.6, status: 'Idle', energy: 5 },
];

// Cycle Breakdown (Waterfall Simulation)
const CYCLE_BREAKDOWN = [
  { name: 'Hoist Up', time: 15, fill: '#0ea5e9' },
  { name: 'Trolley Out', time: 25, fill: '#3b82f6' },
  { name: 'Lower', time: 12, fill: '#6366f1' },
  { name: 'Dwell (Pick)', time: 8, fill: '#f59e0b' }, // Bottleneck color
  { name: 'Hoist', time: 14, fill: '#0ea5e9' },
  { name: 'Trolley In', time: 22, fill: '#3b82f6' },
  { name: 'Lower', time: 10, fill: '#6366f1' },
  { name: 'Drop', time: 5, fill: '#22c55e' }
];

// MPH Trend
const MPH_TREND = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    mph: 25 + Math.sin(i * 0.3) * 5 + Math.random() * 3,
    target: 30
}));

export const CraneEfficiencyView: React.FC = () => {
  const [selectedCrane, setSelectedCrane] = useState('QC-02');
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [metrics, setMetrics] = useState({
    grossMph: 34.2,
    netMph: 36.5,
    cycleTime: 105, // seconds
    energyPerMove: 4.2 // kWh
  });

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            grossMph: 34 + Math.sin(Date.now()/2000) * 2,
            cycleTime: 105 - (simSpeed - 1) * 20 + Math.random() * 5
        }));
    }, 500);
    return () => clearInterval(interval);
  }, [simSpeed]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#020409] text-blue-50 relative overflow-hidden">
      
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-blue-900/50 pb-4 px-2 bg-gradient-to-r from-blue-950/80 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-wider">
             <Crosshair size={14} className="animate-spin-slow" /> Precision Motion Analysis
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             岸桥/场桥作业效率 <span className="text-blue-500">(MPH) 精益分析</span>
          </h1>
        </div>
        
        {/* Sim Controls */}
        <div className="flex items-center gap-4 bg-slate-900/60 p-2 rounded border border-blue-500/30">
            <div className="text-[10px] text-slate-400 uppercase mr-2">Simulation Speed</div>
            <div className="flex gap-1">
                {[0.5, 1.0, 2.0].map(s => (
                    <button 
                        key={s}
                        onClick={() => setSimSpeed(s)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${simSpeed === s ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        {s}x
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Crane Selector & List */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              <SciFiCard title="设备矩阵 (Fleet Matrix)" subtitle="LIVE STATUS" className="flex-1 border-blue-900/50 bg-[#080c14]/80">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {CRANES.map(crane => (
                          <div 
                            key={crane.id}
                            onClick={() => setSelectedCrane(crane.id)}
                            className={`p-3 rounded border cursor-pointer transition-all flex justify-between items-center group
                                ${selectedCrane === crane.id 
                                    ? 'bg-blue-900/30 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                            `}
                          >
                              <div>
                                  <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${crane.status === 'Active' ? 'bg-green-400 shadow-[0_0_5px_lime]' : 'bg-slate-500'}`}></div>
                                      <span className="text-sm font-bold text-white">{crane.id}</span>
                                      <span className="text-[10px] bg-slate-800 px-1.5 rounded text-slate-400">{crane.type}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-1">Energy: {crane.energy} kWh</div>
                              </div>
                              <div className="text-right">
                                  <div className="text-xl font-mono font-bold text-blue-300">{crane.mph.toFixed(1)}</div>
                                  <div className="text-[10px] text-slate-400">MPH</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>
          </div>

          {/* CENTER: 3D Holographic Stage */}
          <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
              
              {/* 3D Container */}
              <div className="flex-1 bg-[#020204] border border-blue-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(14,165,233,0.15)] group">
                  
                  {/* HUD: Motion Stats */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                      <div className="bg-black/60 backdrop-blur border border-blue-500/30 px-3 py-2 rounded w-48">
                          <div className="text-[10px] text-blue-300 uppercase font-bold mb-1 flex items-center gap-2">
                              <Activity size={12}/> Hoist Velocity
                          </div>
                          <div className="flex items-end gap-2">
                              <span className="text-2xl font-mono font-bold text-white">120</span>
                              <span className="text-xs text-slate-400 mb-1">m/min</span>
                          </div>
                          <div className="w-full h-1 bg-slate-800 mt-1 rounded overflow-hidden">
                              <div className="h-full bg-blue-500 w-[80%]"></div>
                          </div>
                      </div>
                      
                      <div className="bg-black/60 backdrop-blur border border-blue-500/30 px-3 py-2 rounded w-48">
                          <div className="text-[10px] text-blue-300 uppercase font-bold mb-1 flex items-center gap-2">
                              <TrendingUp size={12}/> Trolley Velocity
                          </div>
                          <div className="flex items-end gap-2">
                              <span className="text-2xl font-mono font-bold text-white">240</span>
                              <span className="text-xs text-slate-400 mb-1">m/min</span>
                          </div>
                          <div className="w-full h-1 bg-slate-800 mt-1 rounded overflow-hidden">
                              <div className="h-full bg-yellow-500 w-[60%]"></div>
                          </div>
                      </div>
                  </div>

                  {/* Trajectory Legend */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/70 px-4 py-2 rounded-full border border-blue-900/50 flex gap-4 text-[10px] text-slate-300">
                      <div className="flex items-center gap-1"><div className="w-2 h-0.5 bg-green-500"></div> Optimal Path</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-0.5 bg-red-500"></div> Deviation</div>
                  </div>

                  <ThreeScene type="crane-efficiency-analysis" color="#0ea5e9" />
              </div>

              {/* Bottom KPIs */}
              <div className="h-24 grid grid-cols-3 gap-4">
                  <SciFiCard className="bg-slate-900/40 border-blue-900/50 flex flex-col justify-center items-center" noPadding>
                      <div className="text-[10px] text-slate-400 uppercase">Gross MPH</div>
                      <div className="text-3xl font-bold text-white">{metrics.grossMph.toFixed(1)}</div>
                      <div className="text-[9px] text-green-400">+2.4 vs Avg</div>
                  </SciFiCard>
                  <SciFiCard className="bg-slate-900/40 border-blue-900/50 flex flex-col justify-center items-center" noPadding>
                      <div className="text-[10px] text-slate-400 uppercase">Cycle Time</div>
                      <div className="text-3xl font-bold text-blue-300">{metrics.cycleTime.toFixed(0)} s</div>
                      <div className="text-[9px] text-slate-500">Target: 95s</div>
                  </SciFiCard>
                  <SciFiCard className="bg-slate-900/40 border-blue-900/50 flex flex-col justify-center items-center" noPadding>
                      <div className="text-[10px] text-slate-400 uppercase">Energy / Move</div>
                      <div className="text-3xl font-bold text-yellow-400">{metrics.energyPerMove} <span className="text-sm">kWh</span></div>
                  </SciFiCard>
              </div>

          </div>

          {/* RIGHT: Cycle DNA & Analysis */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="单箱作业周期分解 (Cycle DNA)" subtitle="SECONDS" className="flex-1 border-blue-900/50">
                  <div className="w-full h-full p-2 flex flex-col">
                      <div className="flex-1">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={CYCLE_BREAKDOWN} layout="vertical" margin={{left: 0}}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" horizontal={false} />
                                  <XAxis type="number" stroke="#64748b" tick={{fontSize: 10}} hide />
                                  <YAxis dataKey="name" type="category" stroke="#94a3b8" width={70} tick={{fontSize: 10}} />
                                  <Tooltip cursor={{fill: '#0c0a10'}} contentStyle={{backgroundColor: '#020409', borderColor: '#3b82f6', color: '#fff'}} />
                                  <Bar dataKey="time" barSize={12} radius={[0, 4, 4, 0]}>
                                    {CYCLE_BREAKDOWN.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                  </Bar>
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                      
                      <div className="mt-2 p-2 bg-yellow-900/10 border border-yellow-900/30 rounded text-xs text-yellow-200/80">
                          <strong className="block mb-1">Bottleneck Detected:</strong> 
                          Pick-up Dwell time is 3s above standard. Suggest operator training on micro-movements.
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="效率趋势 (24H)" subtitle="MPH TREND" className="h-[200px] border-blue-900/50">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={MPH_TREND}>
                              <defs>
                                  <linearGradient id="colorMph" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" vertical={false} />
                              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={4} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 40]} />
                              <Tooltip contentStyle={{backgroundColor: '#020409', borderColor: '#0ea5e9'}} />
                              <Area type="monotone" dataKey="mph" stroke="#0ea5e9" fill="url(#colorMph)" strokeWidth={2} />
                              <Line type="monotone" dataKey="target" stroke="#facc15" strokeDasharray="5 5" dot={false} strokeWidth={1} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
