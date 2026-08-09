import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cp-inland-waterway]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cp-inland-waterway';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ReferenceLine
} from 'recharts';
import { 
  Anchor, Navigation, Droplets, ArrowRight, 
  Activity, Clock, AlertTriangle, Ship, 
  Wind, Lock, TrendingUp
} from 'lucide-react';

// --- MOCK DATA ---

const HYDRO_DATA = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    upstream: 145.2 + Math.sin(i*0.2)*0.5,
    downstream: 112.5 + Math.sin(i*0.2 + 2)*0.3,
    flow: 850 + Math.sin(i*0.1)*50
}));

const SHIP_QUEUE = [
    { id: 'S-2021', name: 'Cargo A', tonnage: 500, status: 'Entering', time: '10:45' },
    { id: 'S-2022', name: 'Tanker B', tonnage: 800, status: 'Waiting', time: '11:00' },
    { id: 'S-2023', name: 'Barge C', tonnage: 1200, status: 'Waiting', time: '11:15' },
    { id: 'S-2024', name: 'Cargo D', tonnage: 450, status: 'Scheduled', time: '11:30' },
];

const LOCK_CYCLE = [
    { phase: 'Filling', duration: '5m' },
    { phase: 'Entry', duration: '10m' },
    { phase: 'Closing', duration: '3m' },
    { phase: 'Emptying', duration: '5m' },
    { phase: 'Exit', duration: '8m' },
];

export const InlandWaterwayCockpitView: React.FC = () => {
  const [metrics, setMetrics] = useState({
    channelDepth: 4.5, // m
    lockEfficiency: 94.5, // %
    waitingShips: 12,
    avgWaitTime: 45, // min
    dailyThroughput: 12500 // tons
  });

  const [lockState, setLockState] = useState('FILLING');

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            channelDepth: 4.5 + (Math.random()-0.5)*0.05,
            waitingShips: Math.floor(10 + Math.random() * 5),
            dailyThroughput: prev.dailyThroughput + 20
        }));
        
        const time = Date.now() / 5000;
        const cycle = time % 4;
        setLockState(cycle < 1 ? 'FILLING' : cycle < 2 ? 'OPEN-UP' : cycle < 3 ? 'EMPTYING' : 'OPEN-DOWN');
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#0c1618] text-cyan-50 relative overflow-hidden">
      
      {/* Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#0c1618] to-[#0c1618] pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-cyan-800/50 pb-4 px-2 bg-gradient-to-r from-cyan-950/80 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Navigation size={14} className="animate-pulse" /> Smart Navigation Hub
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             内河航道 <span className="text-cyan-500">与通航枢纽驾驶舱</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Anchor size={10}/> Daily Throughput</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.dailyThroughput.toLocaleString()} <span className="text-sm text-slate-500">t</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Clock size={10}/> Avg Wait Time</div>
                <div className="text-2xl font-mono font-bold text-yellow-400">{metrics.avgWaitTime} <span className="text-sm text-slate-500">min</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Activity size={10}/> Lock Efficiency</div>
                <div className="text-2xl font-mono font-bold text-green-400">{metrics.lockEfficiency.toFixed(1)}%</div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Hydrology & Channel */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="航道水情监测" subtitle="HYDROLOGY" className="h-[280px] border-cyan-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={HYDRO_DATA}>
                              <defs>
                                  <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{fontSize: 10}} />
                              <Tooltip contentStyle={{backgroundColor: '#0c1618', borderColor: '#0ea5e9'}} />
                              <Area type="monotone" dataKey="upstream" stroke="#0ea5e9" fill="url(#colorUp)" name="Upstream (m)" />
                              <Line type="monotone" dataKey="downstream" stroke="#f59e0b" strokeWidth={2} dot={false} name="Downstream (m)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              <SciFiCard title="通航环境状态" className="flex-1 border-cyan-900/50">
                  <div className="grid grid-cols-2 gap-3 h-full content-start">
                      <div className="bg-slate-900/40 p-3 rounded border border-slate-800 text-center">
                          <div className="text-[10px] text-slate-500 uppercase">Channel Depth</div>
                          <div className="text-xl font-bold text-white">{metrics.channelDepth.toFixed(2)} m</div>
                          <div className="text-[9px] text-green-400">Normal</div>
                      </div>
                      <div className="bg-slate-900/40 p-3 rounded border border-slate-800 text-center">
                          <div className="text-[10px] text-slate-500 uppercase">Current Vel</div>
                          <div className="text-xl font-bold text-blue-300">1.2 m/s</div>
                          <div className="text-[9px] text-slate-400">Steady</div>
                      </div>
                      <div className="col-span-2 bg-slate-900/40 p-3 rounded border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                              <Wind size={16} className="text-slate-400" />
                              <span className="text-xs text-slate-300">Wind Speed</span>
                          </div>
                          <span className="font-bold text-white">4.5 m/s (NE)</span>
                      </div>
                      <div className="col-span-2 p-2 bg-yellow-900/10 border border-yellow-900/30 rounded flex items-center gap-2">
                          <AlertTriangle size={14} className="text-yellow-500" />
                          <span className="text-[10px] text-yellow-200">Notice: Dredging ops at km 45. Slow down.</span>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: Digital Twin Lock */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#050b0e] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(14,165,233,0.15)]">
                  {/* HUD Overlay */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Lock size={16} className={`text-cyan-400 ${lockState === 'FILLING' || lockState === 'EMPTYING' ? 'animate-pulse' : ''}`} />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Lock Chamber Status</div>
                              <div className="text-sm font-bold text-white">{lockState}</div>
                          </div>
                      </div>
                  </div>

                  {/* Level Indicator Overlay */}
                  <div className="absolute top-1/3 right-4 z-20 h-32 w-2 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                      <div className="absolute bottom-0 w-full bg-cyan-500 transition-all duration-1000" style={{height: lockState === 'FILLING' || lockState === 'OPEN-UP' ? '80%' : '20%'}}></div>
                  </div>
                  <div className="absolute top-1/3 right-8 z-20 h-32 flex flex-col justify-between text-[9px] text-slate-400 text-right">
                      <span>Max</span>
                      <span>Min</span>
                  </div>

                  <ThreeScene type="inland-waterway" color="#0ea5e9" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* Lock Cycle Status */}
              <div className="h-16 bg-slate-900/50 border border-cyan-900/30 rounded p-2 flex items-center justify-between px-4">
                  {LOCK_CYCLE.map((step, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 opacity-80">
                          <div className={`w-3 h-3 rounded-full ${lockState.includes(step.phase.toUpperCase().split(' ')[0]) ? 'bg-cyan-400 shadow-[0_0_8px_cyan]' : 'bg-slate-700'}`}></div>
                          <span className="text-[10px] text-slate-400">{step.phase}</span>
                      </div>
                  ))}
                  <div className="text-xs text-cyan-300 font-bold border-l border-slate-700 pl-4 ml-4">
                      Next: Entry (2m)
                  </div>
              </div>

          </div>

          {/* RIGHT: Dispatch & Queue */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Waiting Queue */}
              <SciFiCard title="待闸船舶队列" subtitle="QUEUE" className="flex-1 border-cyan-900/50">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {SHIP_QUEUE.map((ship, i) => (
                          <div key={i} className="flex justify-between items-center p-2.5 bg-slate-900/40 border border-slate-800 rounded hover:border-cyan-500/30 transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className="p-1.5 bg-slate-800 rounded text-slate-400">
                                      <Ship size={14} />
                                  </div>
                                  <div>
                                      <div className="text-xs font-bold text-white">{ship.name}</div>
                                      <div className="text-[10px] text-slate-500">{ship.tonnage}t • {ship.time}</div>
                                  </div>
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold
                                  ${ship.status === 'Entering' ? 'bg-green-900/30 text-green-400' : 
                                    ship.status === 'Waiting' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-slate-800 text-slate-400'}
                              `}>
                                  {ship.status}
                              </span>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* Automated Dispatch */}
              <SciFiCard title="智能排班建议" subtitle="AI OPT" className="h-[200px] border-cyan-900/50">
                  <div className="flex flex-col justify-center h-full gap-4">
                      <div className="flex items-center gap-3 p-3 bg-cyan-900/10 border border-cyan-800/30 rounded">
                          <TrendingUp size={20} className="text-cyan-400" />
                          <div>
                              <div className="text-xs font-bold text-cyan-200">Optimization Active</div>
                              <div className="text-[10px] text-slate-400">Grouping smaller vessels for next cycle.</div>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-center">
                          <div>
                              <div className="text-[10px] text-slate-500">Est. Cycle Time</div>
                              <div className="text-lg font-bold text-white">42 min</div>
                          </div>
                          <div>
                              <div className="text-[10px] text-slate-500">Capacity Util</div>
                              <div className="text-lg font-bold text-green-400">88%</div>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};