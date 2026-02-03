
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Truck, ArrowRightLeft, Clock, Activity, 
  Settings, Play, RotateCcw, AlertTriangle, 
  Database, Gauge, Users, Layers
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine
} from 'recharts';

// --- DATA ---
const CYCLE_TIMES = [
  { stage: 'Queue', time: 1.5, fill: '#ef4444' },
  { stage: 'Spot', time: 0.8, fill: '#f59e0b' },
  { stage: 'Load', time: 3.2, fill: '#22c55e' }, // Loader cycle x passes
  { stage: 'Haul', time: 12.0, fill: '#3b82f6' },
  { stage: 'Dump', time: 1.2, fill: '#8b5cf6' },
  { stage: 'Return', time: 8.5, fill: '#64748b' },
];

export const MineCoopSimView: React.FC = () => {
  // State
  const [truckCount, setTruckCount] = useState(4);
  const [loaderSpeed, setLoaderSpeed] = useState(1.0);
  const [matchFactor, setMatchFactor] = useState(0.85); // 1.0 is balanced
  
  // Metrics
  const [metrics, setMetrics] = useState({
    oee: 78.5,
    tonsPerHour: 1450,
    activeTrucks: 4,
    passes: 0
  });

  // Calc Logic
  useEffect(() => {
      // MF = (N_trucks * t_loader) / (N_loaders * t_truck_cycle)
      // Ideal = 1.0. <1.0 = Over-trucked (Queue). >1.0 = Under-trucked (Loader waits).
      
      const idealTrucks = 6; // Simplified baseline
      const mf = truckCount / idealTrucks;
      
      setMatchFactor(mf);
      
      // Efficiency penalties
      let eff = 100;
      if (mf > 1.0) eff -= (mf - 1) * 20; // Queue penalty
      if (mf < 1.0) eff -= (1 - mf) * 30; // Loader idle penalty
      
      setMetrics(prev => ({
          ...prev,
          oee: Math.max(0, eff * loaderSpeed),
          activeTrucks: truckCount,
          tonsPerHour: 1200 * mf * loaderSpeed // Rough production rate
      }));

  }, [truckCount, loaderSpeed]);

  return (
    <div className="h-full w-full relative bg-[#1c1917] text-amber-50 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="mine-coop" 
            simData={{ 
                truckCount,
                loaderSpeed
            }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#1c1917_100%)] pointer-events-none"></div>
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <ArrowRightLeft size={14} /> SYNERGY OPS CENTER
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 卸卡车-装载机 <span className="text-amber-500">协同作业效率仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Match Factor</div>
                   <div className={`text-3xl font-mono font-bold ${matchFactor > 1.1 ? 'text-red-500' : matchFactor < 0.9 ? 'text-yellow-400' : 'text-green-400'}`}>
                       {matchFactor.toFixed(2)}
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Hourly Prod</div>
                   <div className="text-3xl font-mono font-bold text-white">
                       {metrics.tonsPerHour.toFixed(0)} <span className="text-sm">t/h</span>
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT: Cycle Analysis */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <SciFiCard title="作业循环分解 (Cycle Time)" subtitle="MINUTES" className="flex-1 border-amber-900/50 bg-[#0c0a09]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={CYCLE_TIMES} layout="vertical" margin={{left: 10}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#44403c" horizontal={false} />
                          <XAxis type="number" stroke="#a8a29e" tick={{fontSize: 10}} />
                          <YAxis dataKey="stage" type="category" stroke="#a8a29e" width={50} tick={{fontSize: 12}} />
                          <Tooltip cursor={{fill: '#1c1917'}} contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f59e0b', color: '#fff'}} />
                          <Bar dataKey="time" radius={[0, 4, 4, 0]} barSize={20}>
                            {CYCLE_TIMES.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          <SciFiCard title="队列状态" subtitle="QUEUE" className="h-[200px] border-amber-900/50 bg-[#0c0a09]/90 pointer-events-auto">
              <div className="flex flex-col gap-4 h-full justify-center px-4">
                  <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Trucks in System</span>
                      <span className="font-bold text-white">{truckCount}</span>
                  </div>
                  
                  {/* Visual Queue */}
                  <div className="flex gap-1 h-8 bg-slate-800 rounded p-1">
                      {Array.from({length: truckCount}).map((_, i) => (
                          <div key={i} className={`flex-1 rounded ${i === 0 ? 'bg-green-500 animate-pulse' : 'bg-amber-600'}`}></div>
                      ))}
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-slate-900/50 border border-slate-700 rounded">
                      <AlertTriangle size={14} className={matchFactor > 1.1 ? "text-red-500" : "text-slate-600"}/>
                      <span className="text-[10px] text-slate-300">
                          {matchFactor > 1.1 ? 'Queue Warning: Over-trucked' : matchFactor < 0.9 ? 'Efficiency Loss: Under-trucked' : 'Optimal Balance'}
                      </span>
                  </div>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT: Loader Perf */}
      <div className="absolute right-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <SciFiCard title="装载机性能" subtitle="LOADER KPIs" className="h-[250px] border-amber-900/50 bg-[#0c0a09]/90 pointer-events-auto">
              <div className="flex flex-col gap-4 h-full justify-center items-center">
                  <div className="relative w-32 h-32">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="8" />
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#f59e0b" strokeWidth="8" 
                                  strokeDasharray="283" strokeDashoffset={283 - (283 * 0.95)} className="rotate-[-90deg] origin-center" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-white">95%</span>
                          <span className="text-[8px] text-slate-500 uppercase">Bucket Fill</span>
                      </div>
                  </div>
                  <div className="flex justify-between w-full px-4 text-xs text-slate-400">
                      <span>Passes/Truck: <strong className="text-white">5</strong></span>
                      <span>Swing: <strong className="text-white">28s</strong></span>
                  </div>
              </div>
          </SciFiCard>

          <SciFiCard title="仿真控制台" subtitle="SETTINGS" className="flex-1 border-amber-900/50 bg-[#0c0a09]/90 pointer-events-auto">
              <div className="flex flex-col gap-6 p-2">
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span className="flex items-center gap-2"><Truck size={12}/> Fleet Size</span>
                          <span className="font-mono text-amber-400">{truckCount}</span>
                      </div>
                      <input 
                        type="range" min="1" max="10" step="1" 
                        value={truckCount} onChange={(e) => setTruckCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                  </div>

                  <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span className="flex items-center gap-2"><Activity size={12}/> Loader Speed</span>
                          <span className="font-mono text-green-400">{loaderSpeed.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="2.0" step="0.1" 
                        value={loaderSpeed} onChange={(e) => setLoaderSpeed(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-800 flex gap-2">
                      <button className="flex-1 py-2 bg-slate-800 hover:bg-amber-900/40 text-xs text-slate-300 rounded border border-slate-600 transition-all flex items-center justify-center gap-2">
                          <Settings size={12} /> Optimization
                      </button>
                      <button className="flex-1 py-2 bg-slate-800 hover:bg-amber-900/40 text-xs text-slate-300 rounded border border-slate-600 transition-all flex items-center justify-center gap-2">
                          <Database size={12} /> Export Data
                      </button>
                  </div>
              </div>
          </SciFiCard>

      </div>

    </div>
  );
};
