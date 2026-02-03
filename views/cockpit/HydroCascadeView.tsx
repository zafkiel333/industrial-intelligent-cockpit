import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine
} from 'recharts';
import { 
  Waves, Activity, CloudRain, Droplets, Zap, 
  TrendingUp, ArrowRight, Gauge, Layers, Signal 
} from 'lucide-react';

// --- MOCK DATA ---
const CASCADE_STATIONS = [
  { id: 'DAM-01', name: '上游-金沙站', height: 1200, capacity: 6400, type: 'Head' },
  { id: 'DAM-02', name: '中游-溪洛站', height: 800, capacity: 12600, type: 'Major' },
  { id: 'DAM-03', name: '下游-向家站', height: 380, capacity: 6000, type: 'Regulating' },
  { id: 'DAM-04', name: '末端-葛洲站', height: 60, capacity: 2700, type: 'Run-of-River' }
];

const DISPATCH_PLAN = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    totalLoad: 15000 + Math.sin(i * 0.2) * 5000 + Math.random() * 500,
    dam1: 4000 + Math.sin(i * 0.2) * 1000,
    dam2: 8000 + Math.sin(i * 0.2) * 2000,
    dam3: 3000 + Math.sin(i * 0.2) * 800,
    price: 350 + Math.sin((i-12)*0.3) * 100
}));

const RAIN_FORECAST = Array.from({length: 7}, (_, i) => ({
    day: `D+${i}`,
    rain: Math.random() * 50,
    inflow: 2000 + Math.random() * 3000
}));

export const HydroCascadeView: React.FC = () => {
  const [activeDam, setActiveDam] = useState('DAM-02');
  const [totalMetrics, setTotalMetrics] = useState({
    gen: 24580, // MW
    storage: 45.2, // Billion m3
    inflow: 12500, // m3/s
    outflow: 11800 // m3/s
  });

  const activeStation = CASCADE_STATIONS.find(s => s.id === activeDam) || CASCADE_STATIONS[0];

  useEffect(() => {
    const interval = setInterval(() => {
        setTotalMetrics(prev => ({
            gen: 24000 + Math.sin(Date.now()/5000) * 1000,
            storage: 45.2 + Math.random() * 0.1,
            inflow: 12500 + Math.sin(Date.now()/3000) * 500,
            outflow: 11800 + Math.sin(Date.now()/3000) * 400
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#040b14] text-cyan-50 relative overflow-hidden">
      
      {/* Background Pulse */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#040b14] to-[#040b14] pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-cyan-800/50 pb-4 px-2 bg-gradient-to-r from-blue-950/80 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Waves size={14} className="animate-pulse" /> Digital Watershed Twin
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             流域梯级电站 <span className="text-cyan-500">联合调度驾驶舱</span>
          </h1>
        </div>
        
        {/* Aggregate KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Zap size={10}/> Total Generation</div>
                <div className="text-2xl font-mono font-bold text-cyan-300">{totalMetrics.gen.toLocaleString(undefined, {maximumFractionDigits: 0})} <span className="text-sm text-slate-500">MW</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Layers size={10}/> Total Storage</div>
                <div className="text-2xl font-mono font-bold text-white">{totalMetrics.storage.toFixed(2)} <span className="text-sm text-slate-500">Bn m³</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Droplets size={10}/> Inflow/Outflow</div>
                <div className="text-xl font-mono font-bold text-blue-400">
                    {totalMetrics.inflow.toFixed(0)} <span className="text-xs text-slate-500">In</span> / {totalMetrics.outflow.toFixed(0)} <span className="text-xs text-slate-500">Out</span>
                </div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Hydrology & Meteorology */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="流域水情预报 (7 Days)" subtitle="HYDROLOGY" className="h-[280px] border-cyan-900/50 bg-[#081220]/60" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={RAIN_FORECAST}>
                              <defs>
                                  <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis yAxisId="left" stroke="#3b82f6" tick={{fontSize: 10}} label={{ value: 'Inflow (m³/s)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#3b82f6' }} />
                              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{fontSize: 10}} label={{ value: 'Rain (mm)', angle: 90, position: 'insideRight', fontSize: 10, fill: '#94a3b8' }} />
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#3b82f6'}} />
                              <Bar yAxisId="right" dataKey="rain" fill="#94a3b8" barSize={10} radius={[2, 2, 0, 0]} opacity={0.5} />
                              <Area yAxisId="left" type="monotone" dataKey="inflow" stroke="#3b82f6" fill="url(#rainGrad)" strokeWidth={2} />
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              <SciFiCard title="防洪调度警示" className="flex-1 border-cyan-900/50">
                  <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 p-3 bg-red-900/10 border border-red-900/30 rounded">
                          <CloudRain className="text-red-400" size={20} />
                          <div>
                              <div className="text-xs font-bold text-red-200">Flood Peak Alert</div>
                              <div className="text-[10px] text-slate-400">Est. Arrival: 14h 30m @ Dam-01</div>
                          </div>
                      </div>
                      
                      <div className="space-y-2 mt-2">
                          <div className="flex justify-between items-center text-xs text-slate-400">
                              <span>Dam-01 Level</span>
                              <span className="text-yellow-400 font-bold">1198.5 m (Hi)</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-yellow-500 h-full w-[95%]"></div>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
                              <span>Dam-02 Level</span>
                              <span className="text-green-400 font-bold">785.2 m</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-green-500 h-full w-[80%]"></div>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Cascade Visualization */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#050810] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(6,182,212,0.15)]">
                  
                  {/* Dam Selection HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                      {CASCADE_STATIONS.map(dam => (
                          <button 
                            key={dam.id}
                            onClick={() => setActiveDam(dam.id)}
                            className={`px-3 py-1.5 rounded border text-xs font-bold transition-all
                                ${activeDam === dam.id ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-black/40 border-slate-700 text-slate-400 hover:bg-slate-800'}
                            `}
                          >
                              {dam.name}
                          </button>
                      ))}
                  </div>

                  {/* Active Dam Stats Overlay */}
                  <div className="absolute top-16 left-4 z-20 bg-black/60 backdrop-blur border border-cyan-500/30 p-3 rounded w-64">
                      <div className="text-xs text-cyan-400 font-bold mb-2 flex items-center gap-2">
                          <Activity size={12}/> Real-time Status: {activeStation.name}
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 text-[10px] text-slate-300">
                          <div>Height: <span className="text-white font-mono">{activeStation.height}m</span></div>
                          <div>Cap: <span className="text-white font-mono">{activeStation.capacity}MW</span></div>
                          <div>Flow: <span className="text-blue-300 font-mono">2450 m³/s</span></div>
                          <div>Eff: <span className="text-green-400 font-mono">94.2%</span></div>
                      </div>
                  </div>

                  <ThreeScene type="cascade-river" color="#06b6d4" />
              </div>

              {/* Bottom: Joint Dispatch Schedule */}
              <SciFiCard title="梯级联合调度计划 (24H)" subtitle="LOAD ALLOCATION" className="h-[240px] border-cyan-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={DISPATCH_PLAN}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={2} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Output (MW)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#0ea5e9'}} />
                              <Area type="monotone" dataKey="dam1" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" name="Dam-01" />
                              <Area type="monotone" dataKey="dam2" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Dam-02" />
                              <Area type="monotone" dataKey="dam3" stackId="1" stroke="#6366f1" fill="#6366f1" name="Dam-03" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Grid & Market */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Load & Frequency */}
              <SciFiCard title="电网负荷与频率" subtitle="GRID DEMAND" className="flex-1 border-cyan-900/50">
                  <div className="flex flex-col gap-4 h-full">
                      <div className="flex items-center justify-between p-2 border-b border-slate-800">
                          <span className="text-xs text-slate-400">System Frequency</span>
                          <span className="text-xl font-mono font-bold text-green-400">50.02 Hz</span>
                      </div>
                      
                      <div className="flex-1 min-h-[120px]">
                          <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={DISPATCH_PLAN}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                  <XAxis hide />
                                  <YAxis hide domain={['auto', 'auto']} />
                                  <Tooltip contentStyle={{backgroundColor: '#000'}} />
                                  <Line type="monotone" dataKey="totalLoad" stroke="#f59e0b" strokeWidth={2} dot={false} />
                              </LineChart>
                          </ResponsiveContainer>
                          <div className="text-center text-[10px] text-amber-500 mt-1">Load Curve Trend</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-auto">
                          <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                              <div className="text-[10px] text-slate-500">ACE</div>
                              <div className="text-sm font-bold text-white">-12 MW</div>
                          </div>
                          <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                              <div className="text-[10px] text-slate-500">Reserve</div>
                              <div className="text-sm font-bold text-cyan-300">1200 MW</div>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

              {/* Market Price */}
              <SciFiCard title="现货市场电价" subtitle="RMB/MWh" className="h-[200px] border-cyan-900/50">
                  <div className="flex flex-col h-full justify-between">
                      <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-yellow-400">425.8</span>
                          <span className="text-xs text-slate-500">Avg Price</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-green-500 to-red-500 h-full w-[65%]"></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Low: 280</span>
                          <span>High: 850</span>
                      </div>
                      <div className="p-2 bg-yellow-900/10 border border-yellow-900/30 rounded text-xs text-yellow-200/80">
                          Recommendation: Increase output at Dam-02 during 18:00-21:00 peak.
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};