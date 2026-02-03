
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Waves, Umbrella, CloudRain, AlertTriangle, 
  Settings, Droplets, Map as MapIcon, Siren, 
  Activity, ArrowRight, MousePointer2, Gauge,
  Play, Pause
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ReferenceLine, BarChart, Bar
} from 'recharts';

// --- MOCK DATA ---
const INFLOW_FORECAST = Array.from({length: 48}, (_, i) => {
    // Generate a flood peak curve (Unit Hydrograph)
    const t = i;
    const peak = 20;
    const flow = 500 + 4000 * Math.exp(-Math.pow(t - peak, 2) / 50);
    return { time: `T+${i}h`, flow, rain: t < 24 ? Math.random() * 20 : 0 };
});

const RISK_POINTS = [
    { id: 'TOWN-A', name: 'River Town A', elevation: 12.5, status: 'Safe' },
    { id: 'CITY-B', name: 'Industrial City B', elevation: 15.0, status: 'Safe' },
    { id: 'FARM-C', name: 'Lowland Farm C', elevation: 8.0, status: 'Warning' },
];

export const HydroFloodSimView: React.FC = () => {
  // State
  const [simTime, setSimTime] = useState(0); // 0-48 hours
  const [isPlaying, setIsPlaying] = useState(false);
  const [gateOpening, setGateOpening] = useState(0); // 0-100%
  
  // Computed Metrics
  const [metrics, setMetrics] = useState({
    reservoirLevel: 145.0, // m
    inflow: 500, // m3/s
    outflow: 0, // m3/s
    downstreamLevel: 5.0, // m
    storageUsed: 65, // %
    riskLevel: 'LOW'
  });

  // Simulation Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
        setSimTime(prev => {
            const next = prev + 0.5;
            if (next > 48) { setIsPlaying(false); return 48; }
            return next;
        });
    }, 200); // Fast simulation speed

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Update Physics based on Time & Controls
  useEffect(() => {
      // Get Inflow from forecast
      const timeIdx = Math.floor(simTime);
      const currentInflow = INFLOW_FORECAST[Math.min(timeIdx, 47)].flow;
      
      // Calculate Outflow (Gate Function)
      // Q = C * A * sqrt(2gh)
      const head = metrics.reservoirLevel - 100; // effective head
      const dischargeCapacity = 5000; // max m3/s
      const currentOutflow = (gateOpening / 100) * dischargeCapacity * Math.sqrt(head / 50);

      // Mass Balance: dV/dt = In - Out
      // Assume Surface Area = 1,000,000 m2
      const volumeChange = (currentInflow - currentOutflow) * 1800; // 30min step in m3
      const levelChange = volumeChange / 1000000; 

      const newLevel = Math.min(160, Math.max(120, metrics.reservoirLevel + levelChange));
      
      // Downstream Level (Rating Curve approx)
      // H = a * Q^b
      const downLevel = 5.0 + Math.pow(currentOutflow / 100, 0.6);

      // Risk Logic
      let risk = 'LOW';
      if (downLevel > 12) risk = 'HIGH';
      else if (downLevel > 9) risk = 'MED';

      setMetrics({
          reservoirLevel: newLevel,
          inflow: currentInflow,
          outflow: currentOutflow,
          downstreamLevel: downLevel,
          storageUsed: ((newLevel - 120) / 40) * 100,
          riskLevel: risk
      });

  }, [simTime, gateOpening]); // Dependencies for calculation step

  return (
    <div className="h-full w-full relative bg-[#020617] text-cyan-50 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
              type="hydro-flood" 
              simData={{ 
                  inflow: metrics.inflow,
                  outflow: metrics.outflow,
                  rain: simTime < 24 && isPlaying, // Rain during first 24h
                  upstreamLevel: (metrics.reservoirLevel - 120) / 4, // Norm for visuals (0-10)
                  downstreamLevel: (metrics.downstreamLevel - 5) // Visual scaling
              }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#020617_90%)] pointer-events-none"></div>
          {/* Rain Overlay */}
          {simTime < 24 && isPlaying && (
              <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10 animate-pulse"></div>
          )}
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0e1b2e]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Umbrella size={14} /> FLOOD DEFENSE SYSTEM
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 水库调度 <span className="text-blue-500">& 洪水演进过程仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
              {/* Equation Visual */}
              <div className="flex items-center gap-4 bg-slate-900/60 p-2 rounded border border-blue-500/30">
                  <div className="text-center">
                      <div className="text-[10px] text-slate-400">INFLOW</div>
                      <div className="text-lg font-bold text-green-400">{metrics.inflow.toFixed(0)}</div>
                  </div>
                  <div className="text-slate-500 font-bold text-xl">-</div>
                  <div className="text-center">
                      <div className="text-[10px] text-slate-400">OUTFLOW</div>
                      <div className="text-lg font-bold text-yellow-400">{metrics.outflow.toFixed(0)}</div>
                  </div>
                  <div className="text-slate-500 font-bold text-xl">=</div>
                  <div className="text-center">
                      <div className="text-[10px] text-slate-400">Δ STORAGE</div>
                      <div className={`text-lg font-bold ${metrics.inflow > metrics.outflow ? 'text-blue-400' : 'text-red-400'}`}>
                          {(metrics.inflow - metrics.outflow).toFixed(0)}
                      </div>
                  </div>
              </div>

              <div className="w-px h-10 bg-slate-700"></div>

              <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase">Sim Time</div>
                  <div className="text-3xl font-mono font-bold text-white">T+{simTime.toFixed(1)}h</div>
              </div>
          </div>
      </div>

      {/* LEFT: Hydrograph & Forecast */}
      <div className="absolute left-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Hydrograph Chart */}
          <SciFiCard title="入库洪水预报 (Hydrograph)" subtitle="48H FORECAST" className="h-[300px] border-blue-900/50 bg-[#060b10]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={INFLOW_FORECAST}>
                          <defs>
                              <linearGradient id="gradFlow" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={11} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#3b82f6'}} />
                          <Area type="monotone" dataKey="flow" stroke="#3b82f6" fill="url(#gradFlow)" strokeWidth={2} name="Inflow" />
                          <ReferenceLine x={`T+${Math.floor(simTime)}h`} stroke="white" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          {/* Dispatch Controls */}
          <div className="flex-1 bg-[#060b10]/90 backdrop-blur-md border border-blue-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-blue-900/30 pb-2">
                  <Settings size={16} className="text-blue-400"/> 调度指令 (Dispatch)
              </h3>
              
              <div className="flex-1 flex flex-col justify-center gap-6">
                  {/* Gate Slider */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-300">Spillway Gate Opening</span>
                          <span className="text-yellow-400">{gateOpening.toFixed(0)}%</span>
                      </div>
                      <div className="relative w-full h-8 bg-slate-800 rounded-full border border-slate-600 flex items-center px-1">
                          <input 
                             type="range" min="0" max="100" step="1"
                             value={gateOpening}
                             onChange={(e) => setGateOpening(parseFloat(e.target.value))}
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div 
                             className="h-6 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-100"
                             style={{width: `${gateOpening}%`}}
                          ></div>
                      </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setGateOpening(20)} className="p-2 border border-slate-700 bg-slate-800/50 hover:bg-slate-700 rounded text-xs text-slate-300">
                          Base Flow
                      </button>
                      <button onClick={() => setGateOpening(100)} className="p-2 border border-red-900/50 bg-red-900/20 hover:bg-red-900/40 rounded text-xs text-red-300 font-bold">
                          Emergency Dump
                      </button>
                  </div>
              </div>
          </div>

      </div>

      {/* RIGHT: Risk & Impact */}
      <div className="absolute right-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <SciFiCard title="下游风险雷达" subtitle="IMPACT" className="h-[280px] border-blue-900/50 bg-[#060b10]/90 pointer-events-auto">
              <div className="flex flex-col gap-3 p-1">
                  {RISK_POINTS.map(pt => (
                      <div key={pt.id} className="p-3 bg-slate-900/40 border border-slate-800 rounded flex justify-between items-center">
                          <div>
                              <div className="text-xs font-bold text-white">{pt.name}</div>
                              <div className="text-[10px] text-slate-500">Elev: {pt.elevation}m</div>
                          </div>
                          <div className={`text-xs font-bold px-2 py-1 rounded border 
                              ${metrics.downstreamLevel > pt.elevation 
                                  ? 'bg-red-900/30 text-red-500 border-red-900 animate-pulse' 
                                  : metrics.downstreamLevel > pt.elevation - 2 
                                      ? 'bg-yellow-900/30 text-yellow-500 border-yellow-900' 
                                      : 'bg-green-900/30 text-green-500 border-green-900'}
                          `}>
                              {metrics.downstreamLevel > pt.elevation ? 'FLOODED' : metrics.downstreamLevel > pt.elevation - 2 ? 'RISK' : 'SAFE'}
                          </div>
                      </div>
                  ))}
                  
                  <div className="mt-2 p-2 bg-blue-900/20 border border-blue-800/30 rounded text-center">
                      <div className="text-[10px] text-slate-400">Current River Level</div>
                      <div className="text-2xl font-bold text-white">{metrics.downstreamLevel.toFixed(1)} m</div>
                  </div>
              </div>
          </SciFiCard>

          {/* Reservoir Profile */}
          <div className="flex-1 bg-[#060b10]/90 backdrop-blur-md border border-blue-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 border-b border-blue-900/30 pb-2">
                  <Waves size={16} className="text-cyan-500"/> 库容曲线 (Capacity)
              </h3>
              
              <div className="flex-1 relative flex items-end justify-center w-full border-b-2 border-slate-600 mb-6">
                   {/* Dam Profile Visual */}
                   <div className="absolute bottom-0 right-0 w-1/3 h-full bg-slate-700/50" style={{clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'}}></div>
                   
                   {/* Water Level */}
                   <div className="w-full bg-blue-500/30 absolute bottom-0 transition-all duration-300 border-t border-blue-400" 
                        style={{height: `${((metrics.reservoirLevel - 120)/40)*100}%`}}>
                       <div className="absolute top-0 right-1/3 -translate-y-1/2 text-xs font-bold text-white bg-blue-600 px-2 rounded">
                           {metrics.reservoirLevel.toFixed(1)}m
                       </div>
                   </div>

                   {/* Flood Limit Line */}
                   <div className="absolute bottom-[85%] w-full border-t border-dashed border-red-500">
                       <span className="text-[9px] text-red-500 bg-black/50 px-1 absolute right-0 -top-2">Max Flood Limit (154m)</span>
                   </div>
              </div>
          </div>

      </div>

      {/* BOTTOM CONTROL BAR */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <div className="bg-black/80 backdrop-blur px-8 py-4 rounded-full border border-slate-700 flex items-center gap-8 shadow-2xl">
              
              <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all shadow-[0_0_20px_currentColor]
                      ${isPlaying ? 'bg-yellow-600 border-yellow-800 text-white hover:bg-yellow-500' : 'bg-blue-600 border-blue-800 text-white hover:bg-blue-500'}
                  `}
              >
                  {isPlaying ? <Pause size={24}/> : <Play size={24} ml-1/>}
              </button>

              <div className="flex flex-col">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Timeline Control</div>
                  <input 
                      type="range" min="0" max="48" step="0.1" 
                      value={simTime} onChange={(e) => setSimTime(parseFloat(e.target.value))}
                      className="w-64 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>Start</span>
                      <span>Peak</span>
                      <span>End</span>
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
};
