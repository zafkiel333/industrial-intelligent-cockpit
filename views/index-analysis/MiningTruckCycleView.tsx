
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ia-truck-cycle]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ia-truck-cycle';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, Legend, ReferenceLine, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Truck, Timer, TrendingUp, AlertTriangle, 
  MapPin, Gauge, Settings, PauseCircle, PlayCircle, 
  RotateCw, Navigation
} from 'lucide-react';

// --- MOCK DATA ---

// Cycle Time Breakdown (Stacked Bar)
const CYCLE_BREAKDOWN = [
  { truck: 'T-101', load: 3.5, haul: 12.0, dump: 1.5, return: 8.0, queue: 2.0 },
  { truck: 'T-102', load: 4.0, haul: 11.5, dump: 1.2, return: 8.2, queue: 0.5 },
  { truck: 'T-103', load: 3.2, haul: 12.5, dump: 1.8, return: 7.8, queue: 4.5 }, // High queue
  { truck: 'T-104', load: 3.8, haul: 11.8, dump: 1.4, return: 8.1, queue: 1.0 },
  { truck: 'T-105', load: 3.6, haul: 13.0, dump: 1.6, return: 8.5, queue: 0.8 },
];

const FLEET_STATUS = [
    { id: 'T-101', state: 'Hauling', speed: 28, load: 100 },
    { id: 'T-102', state: 'Return', speed: 42, load: 0 },
    { id: 'T-103', state: 'Queue', speed: 0, load: 0 },
    { id: 'T-104', state: 'Loading', speed: 0, load: 45 },
    { id: 'T-105', state: 'Hauling', speed: 25, load: 100 },
    { id: 'T-106', state: 'Dumping', speed: 0, load: 100 },
];

// Operator Score Radar
const OPERATOR_SCORE = [
    { subject: 'Safety', A: 95, fullMark: 100 },
    { subject: 'Speed Adherence', A: 88, fullMark: 100 },
    { subject: 'Fuel Eff', A: 75, fullMark: 100 },
    { subject: 'Tire Care', A: 90, fullMark: 100 },
    { subject: 'Queue Mgmt', A: 82, fullMark: 100 },
];

export const MiningTruckCycleView: React.FC = () => {
  // --- STATE ---
  const [speedLimit, setSpeedLimit] = useState(40); // km/h
  const [truckCount, setTruckCount] = useState(6);
  const [metrics, setMetrics] = useState({
    avgCycleTime: 28.5, // min
    throughput: 1250, // t/h
    queueTime: 2.4, // min
    efficiency: 85.2 // %
  });

  // Simulation
  useEffect(() => {
    // Recalculate based on inputs
    const baseTime = 25;
    const speedFactor = (40 - speedLimit) * 0.2; // Slower speed limit increases time
    const congestionFactor = (truckCount - 5) * 0.5; // More trucks increase queue
    
    const newCycle = baseTime + speedFactor + Math.max(0, congestionFactor);
    const newThroughput = (truckCount * 220) / (newCycle / 60); // 220t payload

    setMetrics({
        avgCycleTime: newCycle,
        throughput: newThroughput,
        queueTime: Math.max(0, congestionFactor * 2 + Math.random()),
        efficiency: 100 - (Math.max(0, congestionFactor) * 5)
    });
  }, [speedLimit, truckCount]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#1c1917] text-amber-50 relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-[#1c1917] to-black pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-amber-800/50 pb-4 px-2 bg-gradient-to-r from-[#451a03] to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <RotateCw size={14} className="animate-spin-slow" /> Logistics Optimization
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             矿用卡车 <span className="text-amber-500">运循环效能分析</span>
          </h1>
        </div>
        
        {/* Simulation Controls */}
        <div className="flex items-center gap-6 bg-slate-900/60 p-2 rounded border border-amber-600/30">
            <div className="flex flex-col w-32 gap-1">
                <div className="flex justify-between text-xs text-slate-300">
                    <span>Speed Limit</span>
                    <span>{speedLimit} km/h</span>
                </div>
                <input 
                  type="range" min="20" max="60" step="5" 
                  value={speedLimit}
                  onChange={(e) => setSpeedLimit(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
            </div>
            <div className="h-8 w-[1px] bg-slate-700"></div>
            <div className="flex flex-col w-32 gap-1">
                <div className="flex justify-between text-xs text-slate-300">
                    <span>Active Trucks</span>
                    <span>{truckCount}</span>
                </div>
                <input 
                  type="range" min="3" max="12" step="1" 
                  value={truckCount}
                  onChange={(e) => setTruckCount(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Fleet Status */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="车队实时脉动 (Fleet Pulse)" subtitle="LIVE" className="flex-1 border-amber-900/50 bg-[#0f0a05]/80">
                  <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {FLEET_STATUS.map((t, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded border border-slate-800 bg-slate-900/40 hover:border-amber-500/30 transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className={`p-1.5 rounded bg-slate-800 text-slate-300`}>
                                      <Truck size={14} />
                                  </div>
                                  <div>
                                      <div className="text-xs font-bold text-white">{t.id}</div>
                                      <div className="text-[10px] text-slate-500">{t.state}</div>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className="text-xs font-mono text-amber-400">{t.speed} km/h</div>
                                  <div className="w-12 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                      <div className="h-full bg-amber-600" style={{width: `${t.load}%`}}></div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              <SciFiCard title="运输效率 KPIs" className="h-[200px] border-amber-900/50">
                  <div className="grid grid-cols-2 gap-3 h-full content-center">
                      <div className="text-center p-2 border border-slate-800 rounded bg-slate-900/30">
                          <div className="text-[10px] text-slate-400 uppercase">Avg Cycle Time</div>
                          <div className="text-xl font-bold text-white">{metrics.avgCycleTime.toFixed(1)} <span className="text-xs font-normal">min</span></div>
                      </div>
                      <div className="text-center p-2 border border-slate-800 rounded bg-slate-900/30">
                          <div className="text-[10px] text-slate-400 uppercase">Hourly Throughput</div>
                          <div className="text-xl font-bold text-amber-400">{metrics.throughput.toFixed(0)} <span className="text-xs font-normal">t/h</span></div>
                      </div>
                      <div className="text-center p-2 border border-slate-800 rounded bg-slate-900/30">
                          <div className="text-[10px] text-slate-400 uppercase">Queue Loss</div>
                          <div className={`text-xl font-bold ${metrics.queueTime > 2 ? 'text-red-500' : 'text-green-400'}`}>{metrics.queueTime.toFixed(1)} <span className="text-xs font-normal">min</span></div>
                      </div>
                      <div className="text-center p-2 border border-slate-800 rounded bg-slate-900/30">
                          <div className="text-[10px] text-slate-400 uppercase">Fleet Efficiency</div>
                          <div className="text-xl font-bold text-blue-400">{metrics.efficiency.toFixed(1)}%</div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Simulation */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#0c0a09] border border-amber-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(245,158,11,0.15)] group">
                  
                  {/* HUD Elements */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-amber-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <MapPin size={16} className="text-amber-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Pit Elevation</div>
                              <div className="text-sm font-bold text-white">-125 m</div>
                          </div>
                      </div>
                      <div className="bg-black/60 backdrop-blur border border-amber-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Navigation size={16} className="text-blue-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Dump Elevation</div>
                              <div className="text-sm font-bold text-white">+45 m</div>
                          </div>
                      </div>
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 z-20 bg-black/60 p-2 rounded border border-slate-700 text-[10px] text-slate-300 flex flex-col gap-1">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Loading</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Hauling</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Dumping</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-500"></div> Return</div>
                  </div>

                  <ThreeScene type="mining-truck-cycle-analysis" color="#f59e0b" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* Cycle Time Composition Chart */}
              <SciFiCard title="单车循环时间分解" subtitle="MINUTES" className="h-[240px] border-amber-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={CYCLE_BREAKDOWN} layout="vertical" margin={{left: 10}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#331c09" horizontal={false} />
                              <XAxis type="number" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis dataKey="truck" type="category" stroke="#94a3b8" width={40} tick={{fontSize: 12}} />
                              <Tooltip cursor={{fill: '#1c1917'}} contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f59e0b'}} />
                              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}} iconSize={8}/>
                              <Bar dataKey="load" name="Load" stackId="a" fill="#3b82f6" />
                              <Bar dataKey="haul" name="Haul (Loaded)" stackId="a" fill="#22c55e" />
                              <Bar dataKey="queue" name="Queue" stackId="a" fill="#ef4444" />
                              <Bar dataKey="dump" name="Dump" stackId="a" fill="#f97316" />
                              <Bar dataKey="return" name="Return (Empty)" stackId="a" fill="#64748b" />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Analysis & Optimization */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Operator Score */}
              <SciFiCard title="操作员评分雷达" subtitle="SKILL MATRIX" className="h-[280px] border-amber-900/50">
                  <div className="w-full h-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={OPERATOR_SCORE}>
                              <PolarGrid stroke="#331c09" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar name="Score" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.4} />
                              <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f59e0b', color: '#fff'}} />
                          </RadarChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              {/* Optimization Insights */}
              <SciFiCard title="瓶颈诊断与建议" subtitle="AI INSIGHTS" className="flex-1 border-amber-900/50">
                  <div className="flex flex-col gap-3">
                      <div className="p-2 border-l-2 border-red-500 bg-slate-900/30 rounded">
                          <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-red-300 flex items-center gap-1"><AlertTriangle size={10}/> High Queue Time</span>
                              <span className="text-[9px] text-slate-500">T-103</span>
                          </div>
                          <p className="text-[10px] text-slate-400">Truck T-103 experienced 4.5min wait at Shovel #2. Suggest re-routing to Shovel #1.</p>
                      </div>
                      
                      <div className="p-2 border-l-2 border-yellow-500 bg-slate-900/30 rounded">
                          <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-yellow-300 flex items-center gap-1"><TrendingUp size={10}/> Speed Variance</span>
                          </div>
                          <p className="text-[10px] text-slate-400">Ramp section B speed dropped to 15km/h. Check for road conditions.</p>
                      </div>

                      <div className="mt-auto pt-2 border-t border-slate-800 text-center">
                          <button className="text-xs text-amber-500 hover:text-amber-400 flex items-center justify-center gap-1 w-full py-1.5 border border-dashed border-amber-900/50 rounded hover:bg-amber-900/10 transition-colors">
                              <Settings size={12} /> Auto-Optimize Dispatch
                          </button>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
