
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-hydro-river]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-hydro-river';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Waves, Wind, Activity, Layers, 
  Map as MapIcon, ArrowRight, Gauge, 
  Calendar, RotateCcw, Play, Pause,
  ChevronsUp, ChevronsDown, Settings
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, Legend, Cell
} from 'recharts';

// --- MOCK DATA ---

// Cross Section Change (Initial vs Current)
const CROSS_SECTION_DATA = Array.from({length: 40}, (_, i) => {
    const x = i * 2; // meters
    const initialZ = -4 - Math.cos(i * 0.15) * 2; // Bed profile
    return { x, initialZ, currentZ: initialZ }; // Will update currentZ in sim
});

const SEDIMENT_BALANCE = Array.from({length: 12}, (_, i) => ({
    month: `M${i+1}`,
    inflow: 5000 + Math.random() * 2000,
    outflow: 4800 + Math.random() * 2000,
    deposition: 0
})).map(d => ({...d, deposition: d.inflow - d.outflow}));

export const HydroRiverSimView: React.FC = () => {
  // --- STATE ---
  const [isRunning, setIsRunning] = useState(true);
  const [year, setYear] = useState(0); // Simulation timeline
  const [flowRate, setFlowRate] = useState(1200); // m3/s
  const [sedimentLoad, setSedimentLoad] = useState(5.0); // kg/m3
  
  const [metrics, setMetrics] = useState({
    maxScourDepth: 0.0, // m
    maxDeposition: 0.0, // m
    bedLoadTransport: 12.5, // kg/s
    channelStability: 95.0 // %
  });

  const [profileData, setProfileData] = useState(CROSS_SECTION_DATA);

  // Simulation Loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
        // Advance time
        setYear(prev => prev + 0.1);

        // Update Physics Metrics
        setMetrics(prev => {
            const scour = Math.min(5, prev.maxScourDepth + (flowRate/5000) * 0.01);
            const dep = Math.min(5, prev.maxDeposition + (sedimentLoad/20) * 0.01);
            return {
                maxScourDepth: scour,
                maxDeposition: dep,
                bedLoadTransport: (flowRate * sedimentLoad * 0.01),
                channelStability: Math.max(0, 100 - (scour + dep) * 5)
            };
        });

        // Update Cross Section Chart
        setProfileData(prev => prev.map(p => {
            // Simulate center scour, bank deposition
            const distFromCenter = Math.abs(p.x - 40); // Center at 40 (idx 20)
            let delta = 0;
            if (distFromCenter < 10) {
                 // Scour
                 delta = -0.05 * (flowRate/1000);
            } else if (distFromCenter > 20) {
                 // Deposition
                 delta = 0.02 * (sedimentLoad/5);
            }
            return { ...p, currentZ: p.currentZ + delta };
        }));

    }, 100); // Fast simulation

    return () => clearInterval(interval);
  }, [isRunning, flowRate, sedimentLoad]);

  const handleReset = () => {
      setYear(0);
      setMetrics({ maxScourDepth: 0, maxDeposition: 0, bedLoadTransport: 0, channelStability: 100 });
      setProfileData(CROSS_SECTION_DATA);
  };

  return (
    <div className="h-full w-full relative bg-[#060b13] text-cyan-50 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="hydro-river" 
            simData={{ 
                flowRate,
                sedimentLoad,
                timeStep: year
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#060b13_100%)] pointer-events-none"></div>
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0f172a]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Waves size={14} /> RIVER MORPHOLOGY LAB
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 河道整治 <span className="text-cyan-500">河床冲淤演变仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Simulated Time</div>
                   <div className="text-3xl font-mono font-bold text-white">Year {year.toFixed(1)}</div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Channel Stability</div>
                   <div className={`text-3xl font-mono font-bold ${metrics.channelStability < 60 ? 'text-red-500' : 'text-green-400'}`}>
                       {metrics.channelStability.toFixed(1)}%
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT: Controls */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Simulation Deck */}
          <div className="bg-[#0b1421]/90 backdrop-blur-md border border-cyan-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-cyan-900/30 pb-2">
                  <Settings size={16} className="text-cyan-500"/> 水动力条件控制
              </h3>
              
              <div className="space-y-6">
                  {/* Flow Rate */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-2"><Wind size={12}/> Flow Rate</span>
                          <span className="font-mono text-cyan-300">{flowRate} m³/s</span>
                      </div>
                      <input 
                        type="range" min="500" max="3000" step="100" 
                        value={flowRate} onChange={(e) => setFlowRate(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                  </div>

                  {/* Sediment Load */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-2"><Layers size={12}/> Sediment Load</span>
                          <span className="font-mono text-orange-300">{sedimentLoad} kg/m³</span>
                      </div>
                      <input 
                        type="range" min="0" max="20" step="0.5" 
                        value={sedimentLoad} onChange={(e) => setSedimentLoad(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                  </div>

                  {/* Playback */}
                  <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => setIsRunning(!isRunning)}
                        className={`flex-1 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all
                            ${isRunning ? 'bg-cyan-700 hover:bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}
                        `}
                      >
                          {isRunning ? <Pause size={14}/> : <Play size={14}/>}
                          {isRunning ? 'RUNNING' : 'PAUSED'}
                      </button>
                      <button 
                        onClick={handleReset}
                        className="px-3 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-600"
                      >
                          <RotateCcw size={14}/>
                      </button>
                  </div>
              </div>
          </div>

          {/* Real-time Stats */}
          <SciFiCard title="冲淤监测指标" subtitle="REAL-TIME" className="flex-1 border-cyan-900/50 bg-[#0b1421]/90 pointer-events-auto">
              <div className="flex flex-col gap-4 h-full">
                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                          <div className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1"><ChevronsDown size={10}/> Max Scour</div>
                          <div className="text-lg font-bold text-red-400">{metrics.maxScourDepth.toFixed(2)} m</div>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                          <div className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1"><ChevronsUp size={10}/> Max Deposit</div>
                          <div className="text-lg font-bold text-green-400">{metrics.maxDeposition.toFixed(2)} m</div>
                      </div>
                  </div>
                  
                  <div className="mt-auto">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Bed Load Transport</span>
                          <span className="font-mono text-white">{metrics.bedLoadTransport.toFixed(0)} kg/s</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-600 to-orange-400" style={{width: `${Math.min(100, metrics.bedLoadTransport/5)}%`}}></div>
                      </div>
                  </div>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT: Analysis */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Cross Section Profile */}
          <SciFiCard title="河床横断面演变" subtitle="SECTION A-A" className="h-[280px] border-cyan-900/50 bg-[#0b1421]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={profileData}>
                          <defs>
                              <linearGradient id="bedFill" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.8}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="x" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Distance (m)', position: 'insideBottom', offset: -5 }} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[-8, 2]} label={{ value: 'Elevation (m)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#3b82f6'}} />
                          <ReferenceLine y={-1} stroke="#0ea5e9" strokeDasharray="3 3" label="Water Level" />
                          <Area type="monotone" dataKey="currentZ" stroke="#f59e0b" fill="url(#bedFill)" strokeWidth={2} name="Current Bed" />
                          <Line type="monotone" dataKey="initialZ" stroke="#94a3b8" strokeDasharray="5 5" dot={false} name="Initial Bed" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          {/* Sediment Balance */}
          <SciFiCard title="泥沙收支平衡 (Sediment Balance)" subtitle="ANNUAL" className="flex-1 border-cyan-900/50 bg-[#0b1421]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={SEDIMENT_BALANCE}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#3b82f6'}} />
                          <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                          <Bar dataKey="inflow" fill="#3b82f6" stackId="a" name="Inflow" />
                          <Bar dataKey="outflow" fill="#94a3b8" stackId="b" name="Outflow" />
                          <Bar dataKey="deposition" fill="#f59e0b" name="Net Deposit" />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>

      {/* CENTER HUD: Legend */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-black/70 backdrop-blur px-6 py-2 rounded-full border border-cyan-900/50 flex gap-6 text-[10px] text-slate-300 pointer-events-none">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-800 border border-red-500"></div> Scour Zone</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-800 border border-green-500"></div> Deposition Zone</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-600 border border-slate-400"></div> Stable Bed</div>
      </div>

    </div>
  );
};
