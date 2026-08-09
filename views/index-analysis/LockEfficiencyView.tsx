
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ia-lock-efficiency]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ia-lock-efficiency';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, ScatterChart, Scatter,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Ship, Lock, Activity, TrendingUp, Clock, 
  Droplets, FastForward, Play, Pause, Anchor,
  BarChart2, Navigation, Layers
} from 'lucide-react';

// --- MOCK DATA ---

// Ship Queue
const QUEUE_DATA = [
  { id: 'S-8821', name: 'HUAYUN 05', tons: 1500, status: 'Entering', eta: 'Now' },
  { id: 'S-8822', name: 'CHANGJ IANG', tons: 2200, status: 'Queue', eta: '15m' },
  { id: 'S-8823', name: 'GOLDEN STAR', tons: 800, status: 'Queue', eta: '35m' },
  { id: 'S-8824', name: 'BLUE WHALE', tons: 1800, status: 'Queue', eta: '50m' },
  { id: 'S-8825', name: 'RIVER KING', tons: 1200, status: 'Scheduled', eta: '1h 20m' },
];

// Transit Time Breakdown (Stacked Bar)
const TRANSIT_BREAKDOWN = [
  { stage: 'Entry', time: 5, fill: '#0ea5e9' },
  { stage: 'Gate Ops', time: 2, fill: '#64748b' },
  { stage: 'Filling/Emptying', time: 8, fill: '#3b82f6' },
  { stage: 'Exit', time: 4, fill: '#22c55e' },
];

// Water Level Cycle
const LEVEL_CYCLE = Array.from({length: 40}, (_, i) => ({
    time: i,
    chamber1: i < 10 ? 7 : i < 20 ? 7 - (i-10)*0.3 : 4,
    chamber2: i < 20 ? 4 : i < 30 ? 4 - (i-20)*0.3 : 1
}));

// Tonnage Trend
const TONNAGE_TREND = Array.from({length: 12}, (_, i) => ({
    hour: `${8+i}:00`,
    tonnage: 2000 + Math.sin(i*0.5) * 500 + Math.random() * 200,
    ships: 4 + Math.floor(Math.random() * 2)
}));

export const LockEfficiencyView: React.FC = () => {
  // --- STATE ---
  const [strategy, setStrategy] = useState<'FCFS' | 'MAX_THROUGHPUT' | 'WATER_SAVE'>('MAX_THROUGHPUT');
  const [metrics, setMetrics] = useState({
    avgTransitTime: 22.5, // min
    dailyTonnage: 45200, // t
    waterSaved: 15.2, // %
    efficiencyScore: 92.4, // %
    lockStatus: 'ACTIVE'
  });

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            dailyTonnage: prev.dailyTonnage + 50 + Math.random() * 20,
            avgTransitTime: strategy === 'MAX_THROUGHPUT' ? 22.5 : 25.0, // Tradeoff
            efficiencyScore: strategy === 'MAX_THROUGHPUT' ? 94.2 : strategy === 'WATER_SAVE' ? 88.5 : 90.0,
            waterSaved: strategy === 'WATER_SAVE' ? 25.5 : 15.2
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, [strategy]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#0c161c] text-cyan-50 relative overflow-hidden">
      
      {/* Background Water Caustics (Simulated) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#0c161c] to-black pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-cyan-800/50 pb-4 px-2 bg-gradient-to-r from-cyan-950/80 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Lock size={14} className="animate-pulse" /> Hydro-Navigation System
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             闸坝通航 <span className="text-cyan-500">效率指数分析</span>
          </h1>
        </div>
        
        {/* KPI Strip */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Clock size={10}/> Avg Transit Time</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.avgTransitTime.toFixed(1)} <span className="text-sm text-slate-500">min</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Anchor size={10}/> Daily Throughput</div>
                <div className="text-2xl font-mono font-bold text-cyan-300">{(metrics.dailyTonnage/1000).toFixed(1)}k <span className="text-sm text-slate-500">t</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Activity size={10}/> Efficiency Index</div>
                <div className="text-2xl font-mono font-bold text-green-400">{metrics.efficiencyScore.toFixed(1)}</div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Queue (Input Stream) */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="待闸船舶队列 (Arrivals)" subtitle="REAL-TIME" className="flex-1 border-cyan-900/50 bg-[#081218]/80">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {QUEUE_DATA.map((ship, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded border border-slate-800 bg-slate-900/40 hover:border-cyan-500/30 transition-colors group">
                              <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded bg-slate-800 text-slate-400 group-hover:text-cyan-400 transition-colors`}>
                                      <Ship size={14} />
                                  </div>
                                  <div>
                                      <div className="text-xs font-bold text-white">{ship.name}</div>
                                      <div className="text-[10px] text-slate-500">{ship.id} • {ship.tons}t</div>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className={`text-[10px] px-1.5 py-0.5 rounded font-bold
                                      ${ship.status === 'Entering' ? 'bg-green-900/30 text-green-400' : 
                                        ship.status === 'Queue' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-slate-800 text-slate-400'}
                                  `}>
                                      {ship.status}
                                  </div>
                                  <div className="text-[9px] text-slate-500 mt-1">{ship.eta}</div>
                              </div>
                          </div>
                      ))}
                      
                      <div className="mt-auto pt-2 border-t border-slate-800 text-center text-[10px] text-slate-500">
                          Total Queue: 12 Vessels | Est. Wait: 45 min
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="水资源利用率" subtitle="SAVINGS" className="h-[200px] border-cyan-900/50">
                  <div className="flex flex-col h-full justify-center items-center gap-4">
                      <div className="relative w-32 h-32">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                    data={[
                                        { name: 'Used', value: 100 - metrics.waterSaved, fill: '#334155' },
                                        { name: 'Saved', value: metrics.waterSaved, fill: '#0ea5e9' }
                                    ]}
                                    innerRadius={30}
                                    outerRadius={45}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                    stroke="none"
                                  >
                                    <Cell key="cell-0" fill="#1e293b" />
                                    <Cell key="cell-1" fill="#0ea5e9" />
                                  </Pie>
                              </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-bold text-cyan-400">{metrics.waterSaved.toFixed(1)}%</span>
                              <span className="text-[8px] text-slate-500 uppercase">Recycled</span>
                          </div>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                          <Droplets size={12} className="text-cyan-500" /> Pump-back System Active
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Twin */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#05080c] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(14,165,233,0.15)] group">
                  
                  {/* HUD Elements */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Layers size={16} className="text-cyan-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Chamber Levels</div>
                              <div className="text-sm font-bold text-white font-mono">HIGH <span className="text-slate-500">→</span> MID <span className="text-slate-500">→</span> LOW</div>
                          </div>
                      </div>
                  </div>

                  {/* Flow Animation Overlay */}
                  <div className="absolute bottom-8 right-8 z-20 w-48">
                      <div className="bg-black/60 backdrop-blur p-2 rounded border border-cyan-900">
                          <div className="text-[10px] text-slate-400 mb-1">Water Cycle Phase</div>
                          <div className="w-full h-1 bg-slate-800 rounded overflow-hidden">
                              <div className="h-full bg-cyan-500 animate-[loading_4s_linear_infinite]" style={{width: '30%'}}></div>
                          </div>
                          <div className="flex justify-between text-[8px] text-slate-500 mt-1">
                              <span>Fill</span>
                              <span>Empty</span>
                          </div>
                      </div>
                  </div>

                  <ThreeScene type="lock-efficiency-analysis" color="#0ea5e9" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* Water Level Chart */}
              <SciFiCard title="闸室水位动态曲线" subtitle="CYCLE" className="h-[220px] border-cyan-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={LEVEL_CYCLE}>
                              <defs>
                                  <linearGradient id="lvlC1" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="lvlC2" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} hide />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 8]} />
                              <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#0ea5e9', color: '#fff'}} />
                              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                              <Area type="step" dataKey="chamber1" name="Chamber 1 (High)" stroke="#0ea5e9" fill="url(#lvlC1)" strokeWidth={2} />
                              <Area type="step" dataKey="chamber2" name="Chamber 2 (Low)" stroke="#3b82f6" fill="url(#lvlC2)" strokeWidth={2} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Analysis & Controls */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Transit Time Analysis */}
              <SciFiCard title="通航耗时分解" subtitle="MINUTES" className="h-[280px] border-cyan-900/50">
                  <div className="w-full h-full flex flex-col">
                      <div className="flex-1">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={TRANSIT_BREAKDOWN} layout="vertical" margin={{left: 10}}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                  <XAxis type="number" stroke="#64748b" tick={{fontSize: 10}} />
                                  <YAxis dataKey="stage" type="category" stroke="#94a3b8" width={80} tick={{fontSize: 10}} />
                                  <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#020610', borderColor: '#0ea5e9'}} />
                                  <Bar dataKey="time" radius={[0, 4, 4, 0]} barSize={20}>
                                      {TRANSIT_BREAKDOWN.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.fill} />
                                      ))}
                                  </Bar>
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="text-center text-xs text-slate-400 mt-2">
                          Filling/Emptying is the critical path.
                      </div>
                  </div>
              </SciFiCard>

              {/* Tonnage Trend */}
              <SciFiCard title="过闸吨位趋势" subtitle="24H" className="h-[200px] border-cyan-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={TONNAGE_TREND}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={2} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                              <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#0ea5e9'}} />
                              <Line type="monotone" dataKey="tonnage" stroke="#facc15" strokeWidth={2} dot={false} />
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              {/* Dispatch Console */}
              <SciFiCard title="调度策略控制台" subtitle="ALGORITHM" className="flex-1 border-cyan-900/50">
                  <div className="flex flex-col gap-3 h-full justify-center">
                      
                      <button 
                        onClick={() => setStrategy('MAX_THROUGHPUT')}
                        className={`flex items-center justify-between p-3 rounded border transition-all ${strategy === 'MAX_THROUGHPUT' ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-cyan-500/50'}`}
                      >
                          <div className="flex items-center gap-2">
                              <FastForward size={16} />
                              <span className="text-xs font-bold">Max Throughput</span>
                          </div>
                          {strategy === 'MAX_THROUGHPUT' && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                      </button>

                      <button 
                        onClick={() => setStrategy('FCFS')}
                        className={`flex items-center justify-between p-3 rounded border transition-all ${strategy === 'FCFS' ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-cyan-500/50'}`}
                      >
                          <div className="flex items-center gap-2">
                              <Clock size={16} />
                              <span className="text-xs font-bold">First Come First Serve</span>
                          </div>
                          {strategy === 'FCFS' && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                      </button>

                      <button 
                        onClick={() => setStrategy('WATER_SAVE')}
                        className={`flex items-center justify-between p-3 rounded border transition-all ${strategy === 'WATER_SAVE' ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-cyan-500/50'}`}
                      >
                          <div className="flex items-center gap-2">
                              <Droplets size={16} />
                              <span className="text-xs font-bold">Water Conservation</span>
                          </div>
                          {strategy === 'WATER_SAVE' && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                      </button>

                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
