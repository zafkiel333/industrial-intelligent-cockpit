
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Droplets, Activity, AlertTriangle, Play, Pause, 
  Power, Settings, RotateCcw, TrendingUp, Waves,
  ShieldAlert, Gauge, ArrowUp
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar
} from 'recharts';

// --- MOCK DATA ---
const INFLOW_HISTORY = Array.from({length: 60}, (_, i) => ({
    time: i,
    inflow: 200 + Math.random() * 50,
    outflow: 0
}));

const PUMPS = [
    { id: 'P-01', type: 'Main', cap: 600, status: 'OFF', eff: 92, temp: 25 },
    { id: 'P-02', type: 'Main', cap: 600, status: 'OFF', eff: 91, temp: 25 },
    { id: 'P-03', type: 'Aux', cap: 400, status: 'OFF', eff: 88, temp: 24 },
    { id: 'P-04', type: 'Aux', cap: 400, status: 'OFF', eff: 89, temp: 24 },
];

export const MineWaterSimView: React.FC = () => {
  // State
  const [isRunning, setIsRunning] = useState(true);
  const [waterLevel, setWaterLevel] = useState(2.5); // meters
  const [inflowRate, setInflowRate] = useState(240); // m3/h
  const [activePumps, setActivePumps] = useState([false, false, false, false]);
  const [isFloodMode, setIsFloodMode] = useState(false);
  
  const [graphData, setGraphData] = useState(INFLOW_HISTORY);

  // Constants
  const SUMP_CAPACITY_HEIGHT = 8.0; // Max meters
  const WARNING_LEVEL = 6.0;
  
  // Logic
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
        // 1. Calculate Flows
        const totalPumpCapacity = activePumps.reduce((acc, active, i) => acc + (active ? PUMPS[i].cap : 0), 0);
        const currentInflow = isFloodMode ? 1500 + Math.random() * 200 : inflowRate + Math.random() * 20;
        
        // 2. Water Balance (simplified area of sump ~1000m2)
        const netFlow = currentInflow - totalPumpCapacity; // m3/h
        const levelChange = (netFlow / 1000) / 360; // m per tick (fast simulation)
        
        setWaterLevel(prev => Math.max(0, Math.min(SUMP_CAPACITY_HEIGHT, prev + levelChange)));
        
        // 3. Update Graph
        setGraphData(prev => {
            const next = [...prev.slice(1)];
            next.push({
                time: (prev[prev.length-1].time + 1),
                inflow: currentInflow,
                outflow: totalPumpCapacity
            });
            return next;
        });

    }, 100);
    return () => clearInterval(interval);
  }, [isRunning, activePumps, inflowRate, isFloodMode]);

  const togglePump = (idx: number) => {
      setActivePumps(prev => {
          const next = [...prev];
          next[idx] = !next[idx];
          return next;
      });
  };

  return (
    <div className="h-full w-full relative bg-[#02040a] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="mine-water" 
            simData={{ 
                waterLevel,
                pumpsActive: activePumps,
                inflowRate: isFloodMode ? 1500 : inflowRate
            }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#02040a_100%)] pointer-events-none"></div>
          {/* Warning Overlay */}
          {waterLevel > WARNING_LEVEL && (
              <div className="absolute inset-0 border-[10px] border-red-500/50 animate-pulse pointer-events-none"></div>
          )}
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#082f49]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Droplets size={14} /> HYDRO-GUARD SYSTEM
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 矿井水害 <span className="text-cyan-500">涌水与排水系统仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Sump Level</div>
                   <div className={`text-3xl font-mono font-bold ${waterLevel > WARNING_LEVEL ? 'text-red-500' : 'text-cyan-400'}`}>
                       {waterLevel.toFixed(2)} m
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Net Flow</div>
                   <div className="text-3xl font-mono font-bold text-white">
                       {(isFloodMode ? 1500 : inflowRate) - activePumps.reduce((a,v,i)=>a+(v?PUMPS[i].cap:0),0)} m³/h
                   </div>
               </div>
          </div>
      </div>

      {/* Left Panel: Analytics */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          <SciFiCard title="涌水量实时监测" subtitle="INFLOW" className="h-[280px] border-cyan-900/50 bg-[#061018]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={graphData}>
                          <defs>
                              <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="time" hide />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#06b6d4'}} />
                          <Area type="monotone" dataKey="inflow" stroke="#06b6d4" fill="url(#gradIn)" strokeWidth={2} name="Inflow" />
                          <Line type="monotone" dataKey="outflow" stroke="#22c55e" strokeWidth={2} dot={false} name="Drainage" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          <div className="flex-1 bg-[#061018]/90 backdrop-blur-md border border-cyan-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity size={16} className="text-cyan-500"/> 水源类型识别
              </h3>
              <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs p-2 bg-slate-900/50 rounded border border-slate-800">
                      <span className="text-slate-300">Aquifer Seepage</span>
                      <span className="font-bold text-cyan-400">Normal</span>
                  </div>
                  <div className="flex justify-between items-center text-xs p-2 bg-slate-900/50 rounded border border-slate-800">
                      <span className="text-slate-300">Old Goaf Water</span>
                      <span className="font-bold text-yellow-500">Rising</span>
                  </div>
                  <div className="flex justify-between items-center text-xs p-2 bg-slate-900/50 rounded border border-slate-800">
                      <span className="text-slate-300">Fault Water</span>
                      <span className="font-bold text-green-400">Stable</span>
                  </div>
              </div>
              
              <div className="mt-auto">
                  <div className="text-[10px] text-slate-500 mb-1">Base Inflow Rate (m³/h)</div>
                  <input 
                      type="range" min="100" max="800" step="10" 
                      value={inflowRate} onChange={(e) => setInflowRate(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
              </div>
          </div>
      </div>

      {/* Right Panel: Pump Control */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          <div className="bg-[#061018]/90 backdrop-blur-md border border-cyan-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-cyan-900/30 pb-2">
                  <Settings size={16} className="text-cyan-500"/> 排水泵站集控 (Cluster Control)
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                  {PUMPS.map((pump, i) => (
                      <div 
                        key={pump.id}
                        onClick={() => togglePump(i)}
                        className={`p-3 rounded border cursor-pointer transition-all flex flex-col gap-2 relative overflow-hidden group
                            ${activePumps[i] ? 'bg-cyan-900/30 border-cyan-500' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}
                        `}
                      >
                          <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-white">{pump.id}</span>
                              <div className={`w-2 h-2 rounded-full ${activePumps[i] ? 'bg-green-500 shadow-[0_0_5px_lime]' : 'bg-slate-600'}`}></div>
                          </div>
                          <div className="flex items-end gap-1">
                              <ArrowUp size={16} className={activePumps[i] ? 'text-cyan-400 animate-bounce' : 'text-slate-600'} />
                              <span className={`text-lg font-mono font-bold ${activePumps[i] ? 'text-white' : 'text-slate-500'}`}>
                                  {activePumps[i] ? pump.cap : 0}
                              </span>
                              <span className="text-[10px] text-slate-500 mb-1">m³/h</span>
                          </div>
                          {activePumps[i] && (
                              <div className="absolute bottom-0 left-0 h-1 bg-cyan-500 animate-[loading_2s_linear_infinite]" style={{width: '100%'}}></div>
                          )}
                      </div>
                  ))}
              </div>
          </div>

          {/* Emergency Panel */}
          <div className="flex-1 bg-[#1a0505]/90 backdrop-blur-md border border-red-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-red-100 mb-2 flex items-center gap-2">
                  <ShieldAlert size={16} className="text-red-500"/> 应急联动 (Emergency)
              </h3>
              
              <div className="space-y-4 flex-1">
                  <div className="p-3 bg-red-900/20 border border-red-900/50 rounded flex items-center gap-4">
                      <Gauge size={24} className={isFloodMode ? 'text-red-500 animate-pulse' : 'text-slate-500'} />
                      <div>
                          <div className="text-xs text-red-200 font-bold">突水模拟 (Water Inrush)</div>
                          <div className="text-[10px] text-slate-400">Simulate 1500m³/h spike</div>
                      </div>
                      <button 
                        onClick={() => setIsFloodMode(!isFloodMode)}
                        className={`ml-auto px-3 py-1 text-xs font-bold rounded border transition-colors
                            ${isFloodMode ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-300'}
                        `}
                      >
                          {isFloodMode ? 'STOP' : 'TEST'}
                      </button>
                  </div>
                  
                  <div className="space-y-1">
                       <div className="flex justify-between text-xs text-slate-400">
                           <span>Pump Efficiency</span>
                           <span>88%</span>
                       </div>
                       <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                           <div className="bg-yellow-500 h-full w-[88%]"></div>
                       </div>
                  </div>
              </div>
              
              <button 
                 onClick={() => { setActivePumps([true, true, true, true]); setIsRunning(true); }}
                 className="w-full py-3 bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-sm rounded flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                  <Power size={16}/> ALL PUMPS START
              </button>
          </div>
      </div>

      {/* Depth Ruler (Center Overlay) */}
      <div className="absolute left-1/2 top-32 bottom-32 -translate-x-1/2 w-16 pointer-events-none flex flex-col items-center justify-between py-8">
          <div className="h-full w-2 bg-slate-800/50 rounded-full relative border border-slate-600">
              {/* Level Marker */}
              <div 
                className="absolute w-8 h-8 left-1/2 -translate-x-1/2 -ml-0 transition-all duration-300 flex items-center justify-center"
                style={{ bottom: `${(waterLevel / SUMP_CAPACITY_HEIGHT) * 100}%` }}
              >
                  <div className={`w-4 h-4 rotate-45 transform ${waterLevel > WARNING_LEVEL ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-cyan-400 shadow-[0_0_10px_cyan]'}`}></div>
              </div>
              
              {/* Scale Lines */}
              {[0, 25, 50, 75, 100].map(p => (
                  <div key={p} className="absolute left-0 w-4 h-[1px] bg-slate-500" style={{bottom: `${p}%`}}>
                      <span className="absolute left-6 -top-2 text-[10px] text-slate-400 font-mono">{(p/100 * SUMP_CAPACITY_HEIGHT).toFixed(0)}m</span>
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
};
