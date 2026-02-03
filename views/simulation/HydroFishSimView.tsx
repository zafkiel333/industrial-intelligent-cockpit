
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Fish, Leaf, Activity, Droplets, 
  Wind, Search, Target, CheckCircle2, 
  AlertTriangle, Settings, BarChart2, Radio
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine, BarChart, Bar, Cell
} from 'recharts';

// --- MOCK DATA ---
const PASSAGE_DATA = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    count: Math.floor(Math.random() * 50) + (i > 6 && i < 18 ? 30 : 0),
    efficiency: 85 + Math.random() * 10
}));

const WATER_QUALITY = Array.from({length: 24}, (_, i) => ({
    time: i,
    do: 7.5 + Math.sin(i * 0.2) * 0.5 + Math.random() * 0.2, // Dissolved Oxygen
    nh3: 0.5 + Math.random() * 0.1
}));

const DETECTED_FISH = [
    { id: 'F-1024', species: 'Grass Carp', size: '45cm', time: '10:42:05', status: 'Passed' },
    { id: 'F-1025', species: 'Silver Carp', size: '38cm', time: '10:42:12', status: 'Passed' },
    { id: 'F-1026', species: 'Catfish', size: '60cm', time: '10:42:30', status: 'Struggling' },
    { id: 'F-1027', species: 'Unknown', size: '20cm', time: '10:42:45', status: 'Passed' },
];

export const HydroFishSimView: React.FC = () => {
  // --- STATE ---
  const [ecoFlow, setEcoFlow] = useState(20.0); // m3/s
  const [inletVel, setInletVel] = useState(1.2); // m/s
  const [waterLevel, setWaterLevel] = useState(50); // %
  
  const [metrics, setMetrics] = useState({
    passageRate: 92.5, // %
    totalCount: 1245,
    compliance: 'PASS',
    attractionFlow: 15.2 // m3/s
  });

  const [activeFish, setActiveFish] = useState<any[]>([]);

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        // Update physics effect on metrics
        // High velocity > 2.0 reduces passage rate
        let eff = 95;
        if (inletVel > 1.5) eff -= (inletVel - 1.5) * 40;
        if (inletVel > 2.5) eff = 0;
        
        // Low flow reduces attraction
        if (ecoFlow < 10) eff *= 0.8;

        setMetrics(prev => ({
            passageRate: Math.max(0, eff + (Math.random()-0.5)*2),
            totalCount: prev.totalCount + (eff > 50 ? Math.floor(Math.random()*2) : 0),
            compliance: eff > 80 ? 'PASS' : 'WARN',
            attractionFlow: ecoFlow * 0.8
        }));

        // Simulated Fish Radar
        if (Math.random() > 0.7) {
            const newFish = {
                x: 20 + Math.random() * 60,
                y: Math.random() * 100,
                size: Math.random() * 10 + 5
            };
            setActiveFish(prev => [...prev.slice(-10), newFish]);
        }

    }, 500);
    return () => clearInterval(interval);
  }, [ecoFlow, inletVel]);

  return (
    <div className="h-full w-full relative bg-[#04120a] text-emerald-50 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="hydro-fish" 
            simData={{ 
                dischargeFlow: ecoFlow,
                velocity: inletVel,
                waterLevel: waterLevel
            }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#04120a_100%)] pointer-events-none"></div>
          {/* Bio-luminescent particles overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#064e3b]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Leaf size={14} /> BIO-ECOLOGICAL MONITOR
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 生态下泄流量 <span className="text-emerald-500">& 鱼道通行仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Compliance Status</div>
                   <div className={`text-3xl font-bold ${metrics.compliance === 'PASS' ? 'text-green-400' : 'text-yellow-400'} flex items-center justify-end gap-2`}>
                       {metrics.compliance === 'PASS' ? <CheckCircle2 /> : <AlertTriangle />}
                       {metrics.compliance}
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Total Passage (Today)</div>
                   <div className="text-3xl font-mono font-bold text-white">
                       {metrics.totalCount}
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT PANEL: Controls */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#022c22]/90 backdrop-blur-md border border-emerald-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-emerald-900/30 pb-2">
                  <Settings size={16} className="text-emerald-500"/> 生态调度参数 (Control)
              </h3>
              
              <div className="space-y-6">
                  {/* Eco Flow */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300 flex items-center gap-2"><Droplets size={12}/> Ecological Discharge</span>
                          <span className="font-mono text-cyan-300">{ecoFlow.toFixed(1)} m³/s</span>
                      </div>
                      <input 
                        type="range" min="5" max="50" step="0.5" 
                        value={ecoFlow} onChange={(e) => setEcoFlow(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                  </div>

                  {/* Inlet Velocity */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300 flex items-center gap-2"><Wind size={12}/> Fishway Inlet Velocity</span>
                          <span className={`font-mono ${inletVel > 2 ? 'text-red-400' : 'text-green-400'}`}>{inletVel.toFixed(2)} m/s</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="3.0" step="0.1" 
                        value={inletVel} onChange={(e) => setInletVel(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                      <div className="flex justify-between text-[8px] text-slate-500">
                          <span>Low (Safe)</span>
                          <span>Critical (&gt;2m/s)</span>
                      </div>
                  </div>

                  {/* Attraction Flow */}
                  <div className="p-3 bg-emerald-900/20 border border-emerald-800/30 rounded flex justify-between items-center">
                      <span className="text-xs text-emerald-200 font-bold">Attraction Flow Eff.</span>
                      <span className="text-lg font-mono text-white">{metrics.attractionFlow.toFixed(1)} <span className="text-xs text-slate-500">m³/s</span></span>
                  </div>
              </div>
          </div>

          <SciFiCard title="鱼道通行效率趋势" subtitle="24H" className="flex-1 border-emerald-900/50 bg-[#022c22]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={PASSAGE_DATA}>
                          <defs>
                              <linearGradient id="gradPass" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                          <XAxis dataKey="hour" hide />
                          <YAxis stroke="#6ee7b7" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#022c22', borderColor: '#10b981'}} />
                          <Area type="monotone" dataKey="count" stroke="#10b981" fill="url(#gradPass)" strokeWidth={2} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT PANEL: Monitoring */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Water Quality */}
          <SciFiCard title="水环境指标监测" subtitle="QUALITY" className="h-[220px] border-emerald-900/50 bg-[#022c22]/90 pointer-events-auto">
              <div className="flex flex-col gap-4 h-full p-2">
                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900/40 p-2 rounded border border-slate-800 text-center">
                          <div className="text-[10px] text-slate-400">DO (Dissolved O2)</div>
                          <div className="text-lg font-bold text-cyan-300">7.8 <span className="text-xs font-normal">mg/L</span></div>
                      </div>
                      <div className="bg-slate-900/40 p-2 rounded border border-slate-800 text-center">
                          <div className="text-[10px] text-slate-400">Temp</div>
                          <div className="text-lg font-bold text-yellow-300">16.5 <span className="text-xs font-normal">°C</span></div>
                      </div>
                  </div>
                  <div className="flex-1 w-full min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={WATER_QUALITY}>
                              <YAxis domain={[0, 10]} hide />
                              <Line type="monotone" dataKey="do" stroke="#22d3ee" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="nh3" stroke="#f59e0b" strokeWidth={1} dot={false} />
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </SciFiCard>

          {/* Fish Detection Log */}
          <div className="flex-1 bg-[#022c22]/90 backdrop-blur-md border border-emerald-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 border-b border-emerald-900/30 pb-2">
                  <Fish size={16} className="text-emerald-500"/> 过鱼实时监测 (Detection)
              </h3>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                  {DETECTED_FISH.map((fish, i) => (
                      <div key={i} className="flex justify-between items-center p-2.5 bg-slate-900/40 border border-slate-800 rounded hover:border-emerald-500/50 transition-colors">
                          <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-emerald-900/30 rounded text-emerald-400">
                                  <Fish size={14} />
                              </div>
                              <div>
                                  <div className="text-xs font-bold text-white">{fish.species}</div>
                                  <div className="text-[10px] text-slate-500">ID: {fish.id}</div>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="text-xs font-mono text-cyan-300">{fish.size}</div>
                              <span className={`text-[9px] px-1.5 rounded ${fish.status === 'Passed' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                  {fish.status}
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

      </div>

      {/* BOTTOM OVERLAY: Sonar View */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-black/80 backdrop-blur border border-emerald-500/30 p-2 rounded-lg flex items-center gap-4">
              <div className="w-64 h-16 bg-[#001a0f] rounded border border-emerald-900/50 relative overflow-hidden">
                  <div className="absolute top-1 left-2 text-[8px] text-emerald-500 font-bold uppercase flex items-center gap-1">
                      <Radio size={8} className="animate-pulse"/> Acoustic Camera
                  </div>
                  {/* Simulated Sonar Blips */}
                  {activeFish.map((f, i) => (
                      <div 
                        key={i} 
                        className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_5px_#34d399] animate-ping"
                        style={{ left: `${f.x}%`, top: `${f.y}%` }}
                      ></div>
                  ))}
                  {/* Scan Line */}
                  <div className="absolute top-0 bottom-0 w-1 bg-emerald-500/20 blur-sm animate-[scan_2s_linear_infinite]"></div>
              </div>
          </div>
      </div>

    </div>
  );
};
