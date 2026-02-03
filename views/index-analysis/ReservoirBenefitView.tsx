
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine, ScatterChart, Scatter,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  DollarSign, Zap, Droplets, Waves, TrendingUp, 
  Activity, ArrowUpRight, Scale, Leaf
} from 'lucide-react';

// --- MOCK DATA ---

// Dispatch Rule Curve Zones
const DISPATCH_ZONES = [
  { level: 100, zone: 'Dead Storage' },
  { level: 120, zone: 'Guarantee Output' },
  { level: 140, zone: 'Economic Operation' },
  { level: 150, zone: 'Flood Control' },
];

const RULE_CURVE_DATA = Array.from({length: 12}, (_, i) => ({
  month: i + 1,
  dead: 100,
  guarantee: 120 + Math.sin(i * 0.5) * 5,
  flood: 150,
  current: 130 + Math.sin(i * 0.5) * 10 // Dynamic current level
}));

// Marginal Value (Shadow Price)
const MARGINAL_VALUE_DATA = Array.from({length: 24}, (_, i) => ({
  hour: i,
  spotPrice: 40 + Math.sin((i-12)/6) * 30 + Math.random() * 10,
  waterValue: 50 + Math.sin((i-14)/6) * 20 // Opportunity cost
}));

// Benefit Composition
const BENEFIT_COMPOSITION = [
  { name: 'Power Gen', value: 65, fill: '#eab308' },
  { name: 'Irrigation', value: 20, fill: '#22c55e' },
  { name: 'Ecology', value: 10, fill: '#0ea5e9' },
  { name: 'Flood Prev', value: 5, fill: '#64748b' },
];

export const ReservoirBenefitView: React.FC = () => {
  // --- STATE ---
  const [targetLevel, setTargetLevel] = useState(135.0); // m
  const [discharge, setDischarge] = useState(450); // m3/s
  const [elecPrice, setElecPrice] = useState(65); // $/MWh (Peak)
  
  const [metrics, setMetrics] = useState({
    head: 85.0, // m
    powerOutput: 320, // MW
    revenueRate: 20800, // $/h
    irrigationSupply: 12.5, // m3/s
    totalBenefit: 1450000, // $ (Daily accum)
    waterUtilization: 92.5 // %
  });

  // Simulation
  useEffect(() => {
    // Basic Hydro Physics
    // P = 9.81 * Q * H * eta
    const head = targetLevel - 50; // Assume tailwater 50m
    const efficiency = 0.9;
    const power = (9.81 * discharge * head * efficiency) / 1000; // MW
    
    // Revenue
    const revenue = power * elecPrice; // $/h
    
    // Irrigation (Simplified: proportional to surplus or specific release)
    const irrFlow = discharge * 0.15; // 15% diverted

    setMetrics(prev => ({
      head: head,
      powerOutput: power,
      revenueRate: revenue,
      irrigationSupply: irrFlow,
      totalBenefit: prev.totalBenefit + revenue / 3600, // Accumulate per tick (simulated)
      waterUtilization: 90 + Math.random() * 5
    }));
  }, [targetLevel, discharge, elecPrice]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#0c120c] text-yellow-50 relative overflow-hidden">
      
      {/* Background Wealth/Water Mix */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-yellow-900/20 via-[#0c120c] to-black pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-yellow-800/50 pb-4 px-2 bg-gradient-to-r from-yellow-950/80 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-yellow-500 mb-1 uppercase tracking-wider">
             <Scale size={14} className="animate-pulse" /> Multi-Objective Optimization
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             水库兴利 <span className="text-yellow-500">调度效益分析</span>
          </h1>
        </div>
        
        {/* Core Value Metrics */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Zap size={10}/> Power Output</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.powerOutput.toFixed(1)} <span className="text-sm text-slate-500">MW</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-yellow-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><DollarSign size={10}/> Revenue Rate</div>
                <div className="text-2xl font-mono font-bold text-yellow-400">$ {(metrics.revenueRate/1000).toFixed(1)}k <span className="text-sm text-slate-500">/h</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-yellow-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Leaf size={10}/> Irrigation</div>
                <div className="text-2xl font-mono font-bold text-green-400">{metrics.irrigationSupply.toFixed(1)} <span className="text-sm text-slate-500">m³/s</span></div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Scheduling Controls */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="调度决策仿真" subtitle="SIMULATION" className="flex-1 border-yellow-900/50 bg-[#1a1205]/80">
                  <div className="flex flex-col gap-6 p-2">
                      {/* Water Level Control */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-blue-300">
                              <span className="flex items-center gap-2"><Waves size={12}/> 目标水位 (Target Level)</span>
                              <span className="font-mono">{targetLevel.toFixed(1)} m</span>
                          </div>
                          <input 
                            type="range" min="110" max="150" step="0.5" 
                            value={targetLevel} onChange={(e) => setTargetLevel(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500">
                              <span>Dead Lvl (100m)</span>
                              <span>Flood Lvl (150m)</span>
                          </div>
                      </div>

                      {/* Discharge Control */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-cyan-300">
                              <span className="flex items-center gap-2"><Droplets size={12}/> 发电流量 (Discharge)</span>
                              <span className="font-mono">{discharge} m³/s</span>
                          </div>
                          <input 
                            type="range" min="0" max="800" step="10" 
                            value={discharge} onChange={(e) => setDischarge(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                      </div>

                      {/* Price Scenario */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-yellow-300">
                              <span className="flex items-center gap-2"><DollarSign size={12}/> 电价情景 (Price)</span>
                              <span className="font-mono">$ {elecPrice} /MWh</span>
                          </div>
                          <div className="flex gap-2">
                              <button onClick={() => setElecPrice(30)} className={`flex-1 py-1 text-[10px] rounded border ${elecPrice === 30 ? 'bg-yellow-600 text-white border-yellow-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>Off-Peak</button>
                              <button onClick={() => setElecPrice(65)} className={`flex-1 py-1 text-[10px] rounded border ${elecPrice === 65 ? 'bg-yellow-600 text-white border-yellow-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>Peak</button>
                              <button onClick={() => setElecPrice(120)} className={`flex-1 py-1 text-[10px] rounded border ${elecPrice === 120 ? 'bg-yellow-600 text-white border-yellow-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>Scarcity</button>
                          </div>
                      </div>

                      <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800/30 rounded text-xs text-yellow-200/80">
                          <strong className="block mb-1 text-white">Advisory:</strong> 
                          Current price is high. Recommend increasing discharge to capture revenue, provided flood limit is not breached.
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="效益构成" subtitle="COMPOSITION" className="h-[200px] border-yellow-900/50">
                  <div className="w-full h-full flex items-center">
                      <div className="w-1/2 h-full relative">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                    data={BENEFIT_COMPOSITION}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={30}
                                    outerRadius={50}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                  >
                                    {BENEFIT_COMPOSITION.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                  </Pie>
                                  <Tooltip contentStyle={{backgroundColor: '#0c120c', borderColor: '#eab308'}} />
                              </PieChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="w-1/2 text-xs space-y-2">
                          {BENEFIT_COMPOSITION.map((item, i) => (
                              <div key={i} className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.fill}}></div>
                                  <span className="text-slate-300">{item.name}</span>
                                  <span className="text-white font-bold ml-auto">{item.value}%</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Value Twin */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#050502] border border-yellow-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(234,179,8,0.15)] group">
                  
                  {/* HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-yellow-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Activity size={16} className="text-yellow-400 animate-pulse" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Operational Zone</div>
                              <div className="text-sm font-bold text-white">
                                  {targetLevel > 140 ? 'FLOOD CTRL' : targetLevel < 110 ? 'CONSERVATION' : 'OPTIMAL'}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* 3D Scene */}
                  <ThreeScene type="reservoir-benefit-analysis" color="#eab308" />
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 right-4 z-20 bg-black/60 p-2 rounded border border-yellow-900 text-[10px] text-slate-300 text-right">
                      <div className="flex items-center justify-end gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Power Value</div>
                      <div className="flex items-center justify-end gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Irrigation Value</div>
                  </div>
              </div>

              {/* Dispatch Rule Curve Chart */}
              <SciFiCard title="水库调度图 (Rule Curve)" subtitle="OPERATIONAL ZONES" className="h-[260px] border-yellow-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={RULE_CURVE_DATA} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                              <defs>
                                  <linearGradient id="zoneDead" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#334155" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#334155" stopOpacity={0.3}/>
                                  </linearGradient>
                                  <linearGradient id="zoneFlood" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#331c09" vertical={false} />
                              <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[80, 160]} label={{ value: 'Level (m)', angle: -90, position: 'insideLeft' }} />
                              <Tooltip contentStyle={{backgroundColor: '#0c120c', borderColor: '#eab308', color: '#fff'}} />
                              
                              <Area type="monotone" dataKey="dead" stackId="1" stroke="none" fill="url(#zoneDead)" name="Dead Storage" />
                              <Area type="monotone" dataKey="guarantee" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} name="Active Storage" />
                              <Area type="monotone" dataKey="flood" stackId="3" stroke="#ef4444" fill="url(#zoneFlood)" name="Flood Control" />
                              
                              <Line type="monotone" dataKey="current" stroke="#facc15" strokeWidth={3} dot={{r:4, fill:'#facc15'}} name="Current Trajectory" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Economic Analysis */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Marginal Value (Shadow Price) */}
              <SciFiCard title="水资源边际价值 (Shadow Price)" subtitle="OPPORTUNITY COST" className="flex-1 border-yellow-900/50">
                  <div className="flex flex-col h-full gap-4">
                      <div className="text-xs text-slate-400 leading-relaxed">
                          Compare spot market price vs. estimated future value of stored water.
                      </div>
                      
                      <div className="flex-1 min-h-[150px]">
                          <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={MARGINAL_VALUE_DATA}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#331c09" vertical={false} />
                                  <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} />
                                  <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                                  <Tooltip contentStyle={{backgroundColor: '#0c120c', borderColor: '#eab308'}} />
                                  <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                                  <Line type="step" dataKey="spotPrice" stroke="#facc15" strokeWidth={2} dot={false} name="Spot Price ($)" />
                                  <Line type="monotone" dataKey="waterValue" stroke="#22d3ee" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Water Value ($)" />
                              </LineChart>
                          </ResponsiveContainer>
                      </div>

                      <div className="p-2 bg-yellow-900/20 border border-yellow-800/30 rounded flex items-center justify-between">
                          <div className="text-xs text-slate-300">Decision</div>
                          <div className="text-sm font-bold text-green-400">GENERATE</div>
                      </div>
                  </div>
              </SciFiCard>

              {/* Water Utilization */}
              <SciFiCard title="水资源利用率" subtitle="EFFICIENCY" className="h-[200px] border-yellow-900/50">
                  <div className="flex flex-col items-center justify-center h-full">
                      <div className="relative w-32 h-32 mb-2">
                           {/* Gauge */}
                           <svg className="w-full h-full" viewBox="0 0 100 100">
                               <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="8" />
                               <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#eab308" strokeWidth="8" strokeDasharray="126" strokeDashoffset={126 - (126 * metrics.waterUtilization / 100)} />
                           </svg>
                           <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
                               {metrics.waterUtilization.toFixed(1)}%
                           </div>
                      </div>
                      <div className="text-xs text-slate-400">Total Runoff Utilized</div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
