
import React, { useState, useEffect } from 'react';
import { PumpStationScene } from '../../../components/predictive/hydro-pump-station/ThreeScene';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, LineChart, Line, ComposedChart, Cell, Scatter
} from 'recharts';
import { 
  Droplets, Activity, Zap, CloudRain, 
  ArrowUpRight, AlertTriangle, Fan, Waves, 
  TrendingUp, Power
} from 'lucide-react';
import { PumpState } from '../../../components/predictive/hydro-pump-station/three-types';

// --- Mock Data ---

const INFLOW_PREDICTION = Array.from({length: 24}, (_, i) => {
    const t = i;
    // Simulated rain event at hour 14
    const rain = t > 12 && t < 18 ? Math.sin((t-12)/6 * Math.PI) * 50 : 0;
    const flow = 100 + rain * 10 + Math.random() * 20;
    return {
        time: `${i}:00`,
        inflow: flow,
        rain: rain,
        level: 30 + (rain > 0 ? (t-12)*5 : 0) // Lagging level rise
    };
});

const HQ_CURVE = Array.from({length: 20}, (_, i) => {
    const q = i * 200; // Flow
    const h = 25 - (q/1000)*(q/1000) * 2; // Head
    const eff = 80 - Math.pow((q - 2000)/500, 2) * 5; // Efficiency parabola
    return { q, h, eff: Math.max(0, eff) };
});

export const PumpStationHealthView: React.FC = () => {
  // --- STATE ---
  const [waterLevel, setWaterLevel] = useState(35); // %
  const [totalFlow, setTotalFlow] = useState(0); // m3/h
  const [rainMode, setRainMode] = useState(false);
  const [turbidity, setTurbidity] = useState(0.1);
  
  const [pumps, setPumps] = useState<PumpState[]>([
      { id: 1, isRunning: false, speed: 0, health: 95 },
      { id: 2, isRunning: false, speed: 0, health: 92 },
      { id: 3, isRunning: false, speed: 0, health: 88 },
      { id: 4, isRunning: false, speed: 0, health: 75 }, // Degraded
  ]);

  // Simulation Logic
  useEffect(() => {
      const interval = setInterval(() => {
          // 1. Environmental Inputs
          const inflow = 50 + (rainMode ? 200 : 0) + Math.random() * 20;
          
          // 2. Control Logic (PLC Sim)
          setPumps(prev => {
              const activeCount = prev.filter(p => p.isRunning).length;
              let newPumps = [...prev];
              
              // Start pumps if level high
              if (waterLevel > 60 && activeCount < 2) {
                  newPumps[0].isRunning = true;
                  newPumps[1].isRunning = true;
              } else if (waterLevel > 80 && activeCount < 4) {
                  newPumps.forEach(p => p.isRunning = true);
              } else if (waterLevel < 30 && activeCount > 0) {
                  newPumps.forEach(p => p.isRunning = false);
              }

              // Spin up/down
              return newPumps.map(p => ({
                  ...p,
                  speed: p.isRunning ? Math.min(1, p.speed + 0.05) : Math.max(0, p.speed - 0.05)
              }));
          });

          // 3. System Dynamics
          const pumpCapacity = 80; // discharge per pump per tick
          const discharge = pumps.reduce((acc, p) => acc + p.speed * pumpCapacity, 0);
          
          setTotalFlow(discharge * 60); // approx m3/h scale
          
          // Mass Balance: Level change
          // Surface area factor... simplified
          const levelChange = (inflow - discharge) * 0.05; 
          setWaterLevel(l => Math.min(100, Math.max(10, l + levelChange)));

          // Turbidity follows rain
          setTurbidity(t => rainMode ? Math.min(0.8, t + 0.01) : Math.max(0.1, t - 0.01));

      }, 100);

      return () => clearInterval(interval);
  }, [rainMode, waterLevel, pumps]);

  const togglePump = (index: number) => {
      setPumps(prev => {
          const next = [...prev];
          next[index].isRunning = !next[index].isRunning;
          return next;
      });
  };

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#02050b] text-cyan-50 p-2 overflow-y-auto custom-scrollbar selection:bg-cyan-500/30">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-cyan-900/40 pb-4 bg-gradient-to-r from-[#031d24] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Waves size={14} className="animate-pulse" />
             Flood Control & Drainage
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             排水泵站 <span className="text-cyan-500">整机健康状态总览</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Total Discharge</div>
                <div className="text-3xl font-mono font-bold text-white">{totalFlow.toFixed(0)} <span className="text-sm text-slate-500">m³/h</span></div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Sump Level</div>
                <div className={`text-3xl font-mono font-bold ${waterLevel > 80 ? 'text-red-500 animate-pulse' : 'text-cyan-300'}`}>
                    {waterLevel.toFixed(1)} <span className="text-sm text-slate-500">%</span>
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Active Units</div>
                <div className="text-2xl font-mono font-bold text-green-400">{pumps.filter(p=>p.isRunning).length} <span className="text-sm text-slate-500">/ 4</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Inflow & Environment */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Weather / Inflow Control */}
           <SciFiCard title="环境与入流量监测" subtitle="INFLOW" className="border-cyan-900/50 bg-[#040f16]/80">
               <div className="flex flex-col gap-4">
                   <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded border border-slate-700">
                       <div className="flex items-center gap-3">
                           <CloudRain size={20} className={rainMode ? "text-blue-400 animate-bounce" : "text-slate-500"} />
                           <div>
                               <div className="text-xs text-slate-400">Weather Status</div>
                               <div className="text-sm font-bold text-white">{rainMode ? 'Heavy Rain' : 'Dry Season'}</div>
                           </div>
                       </div>
                       <button 
                         onClick={() => setRainMode(!rainMode)}
                         className={`px-3 py-1 rounded text-xs border transition-colors ${rainMode ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
                       >
                           Simulate Rain
                       </button>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                       <div className="p-2 bg-slate-900/50 rounded border border-slate-800">
                           <div className="text-[10px] text-slate-500">Trash Rack Diff</div>
                           <div className="text-lg font-mono text-white">12 <span className="text-xs">cm</span></div>
                           <div className="w-full h-1 bg-slate-800 mt-1 rounded"><div className="bg-green-500 h-full" style={{width: '20%'}}></div></div>
                       </div>
                       <div className="p-2 bg-slate-900/50 rounded border border-slate-800">
                           <div className="text-[10px] text-slate-500">Turbidity</div>
                           <div className="text-lg font-mono text-white">{turbidity.toFixed(2)} <span className="text-xs">NTU</span></div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Inflow Prediction Chart */}
           <SciFiCard title="入流量趋势预测 (24H)" subtitle="FORECAST" className="flex-1 border-cyan-900/50">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={INFLOW_PREDICTION}>
                           <defs>
                               <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={5} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0814', borderColor: '#0ea5e9', color: '#fff'}} />
                           <Area type="monotone" dataKey="inflow" stroke="#0ea5e9" fill="url(#colorInflow)" name="Inflow" />
                           <Line type="monotone" dataKey="level" stroke="#f59e0b" strokeWidth={1} dot={false} name="Level" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#020305] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(34,211,238,0.1)]">
               
               {/* HUD */}
               <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded">
                       <div className="text-[10px] text-cyan-400 font-bold uppercase mb-1 flex items-center gap-2">
                           <Waves size={12} /> Sump Level
                       </div>
                       <div className="flex items-end gap-2">
                           <span className="text-3xl font-mono font-bold text-white leading-none">{waterLevel.toFixed(1)}</span>
                           <span className="text-xs text-slate-400 mb-1">%</span>
                       </div>
                       {/* Level Bar */}
                       <div className="w-32 h-2 bg-slate-800 mt-2 rounded-full overflow-hidden relative">
                           <div className="absolute left-[70%] h-full w-0.5 bg-yellow-500 z-10"></div>
                           <div className="absolute left-[90%] h-full w-0.5 bg-red-500 z-10"></div>
                           <div className={`h-full transition-all duration-500 ${waterLevel > 90 ? 'bg-red-500' : waterLevel > 70 ? 'bg-yellow-400' : 'bg-cyan-500'}`} style={{width: `${waterLevel}%`}}></div>
                       </div>
                   </div>
               </div>

               {/* Pump Status Overlay */}
               <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10 px-4">
                   {pumps.map((p, i) => (
                       <button 
                         key={p.id}
                         onClick={() => togglePump(i)}
                         className={`flex-1 bg-black/60 backdrop-blur border px-2 py-2 rounded flex flex-col items-center gap-1 transition-all hover:scale-105
                            ${p.isRunning ? 'border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'border-slate-700 opacity-70'}
                         `}
                       >
                           <div className="flex justify-between w-full">
                               <span className="text-[10px] font-bold text-white">P-{p.id}</span>
                               <span className={`w-2 h-2 rounded-full ${p.isRunning ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></span>
                           </div>
                           <div className="text-xs font-mono text-cyan-300">{(p.speed * 1450).toFixed(0)} <span className="text-[8px] text-slate-500">RPM</span></div>
                           {p.health < 80 && <div className="text-[8px] text-yellow-500 flex items-center gap-1"><AlertTriangle size={8}/> Check</div>}
                       </button>
                   ))}
               </div>

               <PumpStationScene 
                   waterLevel={waterLevel}
                   pumps={pumps}
                   flowRate={totalFlow}
                   turbidity={turbidity}
               />
           </div>

           {/* Pump Cluster Status */}
           <SciFiCard title="机组群运行效能 (Cluster Efficiency)" subtitle="H-Q CURVE" className="h-[250px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4 flex gap-4">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <ComposedChart data={HQ_CURVE}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="q" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Flow (m³/h)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                               <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Head (m)', angle: -90, position: 'insideLeft', fontSize: 10 }} domain={[0, 30]} />
                               <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{fontSize: 10}} label={{ value: 'Eff (%)', angle: 90, position: 'insideRight', fontSize: 10 }} domain={[0, 100]} />
                               <Tooltip contentStyle={{backgroundColor: '#0c0814', borderColor: '#0ea5e9'}} />
                               
                               <Line yAxisId="left" type="monotone" dataKey="h" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Head" />
                               <Line yAxisId="right" type="monotone" dataKey="eff" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Efficiency" />
                               
                               {/* Current Operating Point */}
                               <Scatter yAxisId="left" name="Current" data={[{q: totalFlow/4, h: 22}]} fill="#f59e0b" shape="cross" />
                           </ComposedChart>
                       </ResponsiveContainer>
                   </div>
                   
                   <div className="w-24 border-l border-slate-800 pl-2 flex flex-col justify-center gap-2 text-xs text-slate-400">
                       <div className="mb-1 font-bold text-white border-b border-slate-800 pb-1">System BEP</div>
                       <div className="flex justify-between"><span>Flow:</span> <span className="text-white">12k</span></div>
                       <div className="flex justify-between"><span>Head:</span> <span className="text-white">21m</span></div>
                       <div className="flex justify-between"><span>Eff:</span> <span className="text-green-400">82%</span></div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Health & Recommendations */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Detailed Health Grid */}
           <SciFiCard title="机组健康矩阵" subtitle="VIB & TEMP" className="flex-1 border-cyan-900/50">
               <div className="flex flex-col gap-3">
                   {pumps.map((p) => (
                       <div key={p.id} className="p-2 rounded bg-slate-900/40 border border-slate-800 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                               <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${p.health < 80 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-600' : 'bg-slate-800 text-slate-300'}`}>P{p.id}</div>
                               <div className="flex flex-col">
                                   <span className="text-xs text-slate-300">Health Index</span>
                                   <div className="w-16 h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                                       <div className={`h-full ${p.health < 80 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{width: `${p.health}%`}}></div>
                                   </div>
                               </div>
                           </div>
                           <div className="text-right text-[10px] text-slate-500">
                               <div>Vib: <span className="text-white">{(2 + (100-p.health)/20).toFixed(1)}</span> mm/s</div>
                               <div>Temp: <span className="text-white">{(45 + (100-p.health)/5).toFixed(1)}</span> °C</div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* AI Recommendations */}
           <SciFiCard title="智能调度建议" className="border-cyan-900/50">
               <div className="space-y-3">
                   <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                       <div className="flex items-center gap-2 mb-1 text-xs font-bold text-blue-300">
                           <TrendingUp size={14} /> Optimization
                       </div>
                       <p className="text-[10px] text-slate-300">
                           Rainfall expected in 2 hours. Suggest pre-lowering sump level to 20% by starting P3.
                       </p>
                   </div>

                   <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
                       <div className="flex items-center gap-2 mb-1 text-xs font-bold text-yellow-300">
                           <AlertTriangle size={14} /> Maintenance
                       </div>
                       <p className="text-[10px] text-slate-300">
                           P4 vibration trend accelerating. Schedule bearing inspection. Avoid using P4 for base load.
                       </p>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
