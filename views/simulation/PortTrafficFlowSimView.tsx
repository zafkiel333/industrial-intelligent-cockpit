
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Ship, Anchor, Navigation, Wind, Eye, 
  AlertTriangle, Gauge, Play, Pause, RotateCcw,
  Radio, MapPin, Activity, ListOrdered
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- MOCK DATA ---
const HOURLY_TRAFFIC = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    inbound: 5 + Math.floor(Math.random() * 5),
    outbound: 5 + Math.floor(Math.random() * 5),
    congestion: 20 + Math.random() * 30
}));

const VESSEL_QUEUE = [
    { id: 'V-101', name: 'COSCO STAR', type: 'Container', speed: 12.5, status: 'Inbound' },
    { id: 'V-102', name: 'MSC GEM', type: 'Container', speed: 11.0, status: 'Inbound' },
    { id: 'V-103', name: 'OCEAN PRIDE', type: 'Tanker', speed: 10.2, status: 'Outbound' },
    { id: 'V-104', name: 'BLUE WHALE', type: 'Bulk', speed: 9.5, status: 'Anchored' },
    { id: 'V-105', name: 'HARBOR TUG', type: 'Tug', speed: 8.0, status: 'Patrol' },
];

export const PortTrafficFlowSimView: React.FC = () => {
  // --- STATE ---
  const [trafficRate, setTrafficRate] = useState(50); // % Inflow
  const [speedLimit, setSpeedLimit] = useState(12); // kn
  const [visibility, setVisibility] = useState(100); // %
  const [simState, setSimState] = useState<'RUNNING' | 'PAUSED'>('RUNNING');

  const [metrics, setMetrics] = useState({
    activeCount: 12,
    congestionIndex: 35, // 0-100
    collisionRisk: 'LOW',
    avgWaitTime: 15 // min
  });

  // Simulation Loop
  useEffect(() => {
    if (simState !== 'RUNNING') return;

    const interval = setInterval(() => {
        // Dynamic metrics update
        const cong = (trafficRate / 100) * 80 + (100 - visibility) * 0.2;
        
        setMetrics(prev => ({
            activeCount: Math.floor(trafficRate / 5) + Math.floor(Math.random() * 3),
            congestionIndex: cong,
            collisionRisk: cong > 75 ? 'HIGH' : cong > 50 ? 'MED' : 'LOW',
            avgWaitTime: 15 + (cong > 60 ? (cong - 60) : 0)
        }));
    }, 1000);

    return () => clearInterval(interval);
  }, [simState, trafficRate, visibility]);

  return (
    <div className="h-full w-full relative bg-[#020617] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 1. 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="port-traffic-flow" 
            simData={{ 
                trafficRate: simState === 'RUNNING' ? trafficRate : 0,
                visibility,
                speedLimit
            }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_95%)] pointer-events-none"></div>
          {/* Radar Scanline Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.02)_2px,transparent_2px)] bg-[size:100%_4px] pointer-events-none"></div>
      </div>

      {/* 2. HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0f172a]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Radio size={14} /> VTS COMMAND CENTER
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 船舶在港 <span className="text-blue-500">航道交通流仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Active Vessels</div>
                   <div className="text-3xl font-mono font-bold text-white">{metrics.activeCount}</div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Congestion Index</div>
                   <div className={`text-3xl font-mono font-bold ${metrics.congestionIndex > 70 ? 'text-red-500 animate-pulse' : metrics.congestionIndex > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                       {metrics.congestionIndex.toFixed(0)}
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Collision Risk</div>
                   <div className={`text-2xl font-black ${metrics.collisionRisk === 'HIGH' ? 'text-red-500' : metrics.collisionRisk === 'MED' ? 'text-yellow-400' : 'text-blue-400'}`}>
                       {metrics.collisionRisk}
                   </div>
               </div>
          </div>
      </div>

      {/* 3. LEFT PANEL: Traffic Control */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#0b1120]/90 backdrop-blur-md border border-blue-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-blue-900/30 pb-2">
                  <Navigation size={16} className="text-blue-500"/> 交通流管控 (Traffic)
              </h3>
              
              <div className="space-y-6">
                  {/* Traffic Rate */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300 flex items-center gap-2"><Ship size={12}/> Inflow Rate</span>
                          <span className="font-mono text-cyan-300">{trafficRate}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="5" 
                        value={trafficRate} onChange={(e) => setTrafficRate(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                  </div>

                  {/* Speed Limit */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300 flex items-center gap-2"><Gauge size={12}/> Speed Limit</span>
                          <span className="font-mono text-orange-300">{speedLimit} kn</span>
                      </div>
                      <input 
                        type="range" min="5" max="20" step="1" 
                        value={speedLimit} onChange={(e) => setSpeedLimit(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                  </div>

                  {/* Visibility */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300 flex items-center gap-2"><Eye size={12}/> Visibility</span>
                          <span className="font-mono text-white">{visibility}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="10" 
                        value={visibility} onChange={(e) => setVisibility(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-300"
                      />
                      <div className="flex justify-between text-[8px] text-slate-500">
                          <span>Foggy</span><span>Clear</span>
                      </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => setSimState(simState === 'RUNNING' ? 'PAUSED' : 'RUNNING')}
                        className={`flex-1 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all border
                            ${simState === 'RUNNING' ? 'bg-blue-600/30 border-blue-500 text-blue-200' : 'bg-green-600/30 border-green-500 text-green-200'}
                        `}
                      >
                          {simState === 'RUNNING' ? <Pause size={14}/> : <Play size={14}/>}
                          {simState === 'RUNNING' ? 'PAUSE TRAFFIC' : 'RESUME TRAFFIC'}
                      </button>
                      <button 
                        onClick={() => { setTrafficRate(50); setSpeedLimit(12); setVisibility(100); }}
                        className="px-3 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-600"
                      >
                          <RotateCcw size={14}/>
                      </button>
                  </div>
              </div>
          </div>

          <SciFiCard title="实时船舶队列" subtitle="VTS QUEUE" className="flex-1 border-blue-900/50 bg-[#0b1120]/90 pointer-events-auto">
              <div className="flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar p-1">
                  {VESSEL_QUEUE.map((v, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded border border-slate-800 bg-slate-900/40 hover:border-blue-500/50 transition-colors">
                          <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-slate-800 rounded text-slate-400">
                                  <Ship size={12}/>
                              </div>
                              <div>
                                  <div className="text-xs font-bold text-white">{v.name}</div>
                                  <div className="text-[9px] text-slate-500">{v.id} | {v.type}</div>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${v.status === 'Inbound' ? 'bg-blue-900/30 text-blue-400' : v.status === 'Outbound' ? 'bg-orange-900/30 text-orange-400' : 'bg-slate-800 text-slate-400'}`}>
                                  {v.status}
                              </div>
                              <div className="text-[9px] text-slate-400 mt-1">{v.speed} kn</div>
                          </div>
                      </div>
                  ))}
              </div>
          </SciFiCard>

      </div>

      {/* 4. RIGHT PANEL: Analysis */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          <SciFiCard title="交通流量预测 (24H)" subtitle="VOLUME" className="h-[280px] border-blue-900/50 bg-[#0b1120]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={HOURLY_TRAFFIC}>
                          <defs>
                              <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="gradCong" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={2} />
                          <YAxis yAxisId="left" stroke="#3b82f6" tick={{fontSize: 10}} />
                          <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#3b82f6'}} />
                          <Area yAxisId="left" type="monotone" dataKey="inbound" stackId="1" stroke="#3b82f6" fill="url(#gradIn)" />
                          <Area yAxisId="left" type="monotone" dataKey="outbound" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
                          <Area yAxisId="right" type="monotone" dataKey="congestion" stroke="#f59e0b" fill="url(#gradCong)" strokeWidth={2} name="Congestion Index" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          <SciFiCard title="航道安全风险雷达" subtitle="RISK" className="flex-1 border-blue-900/50 bg-[#0b1120]/90 pointer-events-auto">
              <div className="w-full h-full p-2 relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                          { subject: 'Traffic Density', A: metrics.congestionIndex, fullMark: 100 },
                          { subject: 'Visibility', A: 100 - visibility, fullMark: 100 },
                          { subject: 'Speed Violations', A: Math.random()*20, fullMark: 100 },
                          { subject: 'Near Misses', A: Math.random()*15, fullMark: 100 },
                          { subject: 'Current Speed', A: 40, fullMark: 100 },
                      ]}>
                          <PolarGrid stroke="#1e3a8a" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#93c5fd', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Risk Factor" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.4} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                      </RadarChart>
                  </ResponsiveContainer>
                  
                  {metrics.congestionIndex > 60 && (
                      <div className="absolute bottom-4 left-4 right-4 bg-red-900/30 border border-red-500/50 p-2 rounded text-center">
                          <div className="text-xs text-red-200 font-bold flex items-center justify-center gap-2">
                              <AlertTriangle size={14}/> High Congestion Warning
                          </div>
                      </div>
                  )}
              </div>
          </SciFiCard>

      </div>

      {/* 5. BOTTOM HUD: Legend */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-black/60 backdrop-blur px-6 py-2 rounded-full border border-blue-900/50 flex gap-6 text-[10px] text-slate-300">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Inbound Lane</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Outbound Lane</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Navigation Buoy</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Restricted Zone</div>
          </div>
      </div>

    </div>
  );
};
