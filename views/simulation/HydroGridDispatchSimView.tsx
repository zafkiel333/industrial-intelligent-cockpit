
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Zap, Activity, TrendingUp, Settings, 
  Sun, Wind, AlertTriangle, Radio, 
  BarChart2, DollarSign, RefreshCw, Layers
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  LineChart, Line, ComposedChart, ReferenceLine, BarChart, Bar, Legend
} from 'recharts';

// --- MOCK DATA ---
const DEMAND_CURVE = Array.from({length: 24}, (_, i) => {
    // Typical "Duck Curve" influenced demand
    const hour = i;
    const baseLoad = 5000;
    const peak = (hour > 17 && hour < 22) ? 3000 : 0;
    const morningPeak = (hour > 7 && hour < 10) ? 1500 : 0;
    const solarDip = (hour > 10 && hour < 16) ? -1000 : 0; // Solar impact
    
    return {
        time: `${i}:00`,
        demand: baseLoad + peak + morningPeak + solarDip + Math.random()*200,
        renewable: (hour > 6 && hour < 18) ? 2000 * Math.sin((hour-6)/12 * Math.PI) : 0,
        price: 40 + (peak ? 50 : 0) + (solarDip ? -10 : 0) + Math.random()*5
    };
});

const UNIT_STATUS = [
    { id: 'G1', cap: 200, status: 'RUN', load: 180, mode: 'AGC' },
    { id: 'G2', cap: 200, status: 'RUN', load: 150, mode: 'AGC' },
    { id: 'G3', cap: 200, status: 'STANDBY', load: 0, mode: 'MAN' },
    { id: 'G4', cap: 200, status: 'MAINT', load: 0, mode: 'OFF' },
];

export const HydroGridDispatchSimView: React.FC = () => {
  // --- STATE ---
  const [controlMode, setControlMode] = useState<'AGC' | 'MANUAL'>('AGC');
  const [baseGenSet, setBaseGenSet] = useState(400); // MW
  const [hydroOutput, setHydroOutput] = useState(400); // MW
  
  const [metrics, setMetrics] = useState({
    gridFreq: 50.00,
    ace: 0, // Area Control Error
    totalLoad: 4500,
    netLoad: 3800,
    spotPrice: 45.2,
    revenue: 12500 // $/h
  });

  const [simTime, setSimTime] = useState(0); // Hour index 0-23
  const [historyData, setHistoryData] = useState<any[]>([]);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
        setSimTime(t => (t + 0.05) % 24);
        
        const hourIdx = Math.floor(simTime);
        const nextHourIdx = (hourIdx + 1) % 24;
        const progress = simTime - hourIdx;
        
        // Interpolate Demand
        const d1 = DEMAND_CURVE[hourIdx];
        const d2 = DEMAND_CURVE[nextHourIdx];
        
        const currentDemand = d1.demand + (d2.demand - d1.demand) * progress;
        const currentRenewable = d1.renewable + (d2.renewable - d1.renewable) * progress;
        const currentPrice = d1.price + (d2.price - d1.price) * progress;
        
        const netGridLoad = currentDemand - currentRenewable; // Load that hydro needs to meet (plus thermal base)
        
        // Dispatch Logic
        let targetGen = 0;
        if (controlMode === 'AGC') {
            // Automatic Generation Control (Load Following)
            // PID-like adjustment
            const error = netGridLoad - hydroOutput;
            targetGen = hydroOutput + error * 0.1; // Slow ramp
        } else {
            // Manual Setpoint
            targetGen = baseGenSet;
        }

        // Clamp to capacity (4 units * 200 = 800MW max, but simulate partial availability)
        const maxCap = 600; // 3 units available
        targetGen = Math.min(maxCap, Math.max(0, targetGen));
        
        // Frequency Deviation
        // F = 50 + k * (Gen - Load)
        // Simplified: System inertia resists change
        const mismatch = targetGen - netGridLoad;
        // In reality, hydro is just one part. Assume Hydro target matches "Scheduled" portion.
        // Let's visualize Hydro vs Remaining Gap.
        // If Hydro matches Net Load scaled down (e.g. Hydro covers 20% of load), freq is stable.
        // Let's assume this is a microgrid where Hydro + Renewable = Load.
        // So Gen = Hydro + Renewable.
        const totalGen = targetGen + currentRenewable;
        const balance = totalGen - currentDemand;
        const newFreq = 50.0 + balance * 0.0005; 

        setHydroOutput(targetGen);
        
        setMetrics({
            gridFreq: newFreq,
            ace: balance,
            totalLoad: currentDemand,
            netLoad: netGridLoad,
            spotPrice: currentPrice,
            revenue: targetGen * currentPrice
        });

        // Update History
        setHistoryData(prev => {
            const pt = { 
                time: simTime.toFixed(1), 
                hydro: targetGen, 
                load: netGridLoad, 
                freq: newFreq 
            };
            const next = [...prev, pt];
            if(next.length > 50) next.shift();
            return next;
        });

    }, 100);
    return () => clearInterval(interval);
  }, [simTime, controlMode, baseGenSet, hydroOutput]);

  return (
    <div className="h-full w-full relative bg-[#090514] text-violet-50 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="hydro-grid" 
            simData={{ 
                load: (metrics.totalLoad / 8000) * 100,
                gen: (hydroOutput / 800) * 100,
                freq: metrics.gridFreq,
                price: metrics.spotPrice
            }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#090514_100%)] pointer-events-none"></div>
          {/* Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#1e1b4b]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-violet-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Zap size={14} /> SMART GRID DISPATCH
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 水库-电网 <span className="text-violet-500">联合调度仿真 (Gen-Grid)</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">System Freq</div>
                   <div className={`text-3xl font-mono font-bold ${Math.abs(metrics.gridFreq - 50) > 0.2 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                       {metrics.gridFreq.toFixed(3)} <span className="text-sm text-slate-500">Hz</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Hydro Output</div>
                   <div className="text-3xl font-mono font-bold text-white">
                       {hydroOutput.toFixed(0)} <span className="text-sm text-slate-500">MW</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Real-time Price</div>
                   <div className="text-3xl font-mono font-bold text-yellow-400">
                       <span className="text-sm">$</span>{metrics.spotPrice.toFixed(2)}
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT PANEL: Dispatch & Units */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#0f0a1e]/90 backdrop-blur-md border border-violet-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-violet-900/30 pb-2">
                  <Activity size={16} className="text-violet-500"/> 负荷控制 (AGC)
              </h3>
              
              <div className="space-y-4">
                  {/* Mode */}
                  <div className="flex bg-slate-900/50 p-1 rounded border border-slate-700">
                      <button 
                        onClick={() => setControlMode('AGC')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-2 ${controlMode === 'AGC' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}
                      >
                          <Radio size={12}/> AGC AUTO
                      </button>
                      <button 
                        onClick={() => setControlMode('MANUAL')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-2 ${controlMode === 'MANUAL' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}
                      >
                          <Settings size={12}/> MANUAL
                      </button>
                  </div>

                  {/* Slider */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span>Base Gen Setpoint</span>
                          <span className="font-mono text-violet-300">{baseGenSet} MW</span>
                      </div>
                      <input 
                        type="range" min="0" max="800" step="10" 
                        value={baseGenSet} onChange={(e) => setBaseGenSet(parseFloat(e.target.value))}
                        disabled={controlMode === 'AGC'}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500 disabled:opacity-50"
                      />
                  </div>

                  {/* ACE Monitor */}
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-700 flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-400">ACE (Error)</span>
                          <span className={`${Math.abs(metrics.ace) > 50 ? 'text-red-400' : 'text-white'}`}>{metrics.ace.toFixed(1)} MW</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full relative overflow-hidden">
                          <div className="absolute top-0 bottom-0 w-0.5 bg-white left-1/2"></div>
                          <div 
                              className={`absolute top-0 bottom-0 ${metrics.ace > 0 ? 'bg-green-500 left-1/2' : 'bg-red-500 right-1/2'}`}
                              style={{ width: `${Math.min(50, Math.abs(metrics.ace)/10)}%` }} // Visual scale
                          ></div>
                      </div>
                  </div>
              </div>
          </div>

          <SciFiCard title="机组出力分配" subtitle="UNIT STATUS" className="flex-1 border-violet-900/50 bg-[#0f0a1e]/90 pointer-events-auto">
              <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                  {UNIT_STATUS.map((u, i) => (
                      <div key={i} className="flex justify-between items-center p-2.5 bg-slate-900/40 border border-slate-800 rounded">
                          <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${u.status === 'RUN' ? 'bg-green-500 shadow-[0_0_5px_lime]' : 'bg-slate-600'}`}></div>
                                  Unit {u.id}
                              </div>
                              <div className="text-[10px] text-slate-500">{u.mode}</div>
                          </div>
                          <div className="text-right">
                              <div className="text-sm font-mono text-cyan-300">{u.status === 'RUN' ? (hydroOutput/3).toFixed(0) : 0} MW</div>
                              <div className="text-[9px] text-slate-400">Cap: {u.cap}</div>
                          </div>
                      </div>
                  ))}
              </div>
          </SciFiCard>

      </div>

      {/* 4. RIGHT PANEL: Market & Forecast */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Demand Curve */}
          <SciFiCard title="电网负荷与可再生能源" subtitle="24H FORECAST" className="h-[300px] border-violet-900/50 bg-[#0f0a1e]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={DEMAND_CURVE}>
                          <defs>
                              <linearGradient id="gradDemand" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" vertical={false} />
                          <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} width={30} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#8b5cf6'}} />
                          <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                          
                          <Area type="monotone" dataKey="demand" name="Total Load" stroke="#8b5cf6" fill="url(#gradDemand)" />
                          <Area type="monotone" dataKey="renewable" name="Solar/Wind" stroke="#facc15" fill="#facc15" fillOpacity={0.2} />
                          <ReferenceLine x={`${Math.floor(simTime)}:00`} stroke="white" strokeDasharray="3 3" />
                      </ComposedChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          {/* Revenue Tracking */}
          <SciFiCard title="实时调节效益" subtitle="REVENUE" className="flex-1 border-violet-900/50 bg-[#0f0a1e]/90 pointer-events-auto">
              <div className="flex flex-col gap-4 h-full justify-center">
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded">
                      <div className="flex items-center gap-3">
                          <DollarSign size={20} className="text-yellow-400" />
                          <div>
                              <div className="text-xs text-slate-400">Current Revenue</div>
                              <div className="text-xl font-bold text-white">${metrics.revenue.toLocaleString()}</div>
                          </div>
                      </div>
                      <span className="text-[10px] text-green-400 bg-green-900/20 px-2 py-1 rounded">+12% vs Plan</span>
                  </div>
                  
                  <div className="flex-1 w-full min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={historyData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" horizontal={false} />
                              <XAxis dataKey="time" hide />
                              <YAxis domain={['auto', 'auto']} hide />
                              <Tooltip contentStyle={{backgroundColor: '#000'}} />
                              <Line type="monotone" dataKey="hydro" stroke="#22d3ee" dot={false} strokeWidth={2} name="Hydro Gen" />
                              <Line type="monotone" dataKey="load" stroke="#facc15" dot={false} strokeWidth={1} name="Net Load" />
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="text-center text-[10px] text-slate-500">Tracking Performance (5s window)</div>
              </div>
          </SciFiCard>

      </div>

    </div>
  );
};
