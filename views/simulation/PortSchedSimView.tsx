
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Calendar, Ship, MapPin, AlertCircle, 
  Settings, Zap, TrendingUp, Clock, 
  DollarSign, Activity, Globe, Anchor,
  BarChart, FastForward, AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart as RechartsBar, Bar, Cell, ComposedChart, Line
} from 'recharts';

// --- MOCK DATA ---
const SCHEDULE_GANTT = [
  { vessel: 'COSCO STAR', arrive: 0, dept: 8, status: 'OnTime', delay: 0 },
  { vessel: 'MSC GEM', arrive: 4, dept: 12, status: 'Late', delay: 4 },
  { vessel: 'EVER GIVEN', arrive: 10, dept: 24, status: 'OnTime', delay: 0 },
  { vessel: 'HMM ALGE', arrive: 16, dept: 22, status: 'Late', delay: 2 },
  { vessel: 'ONE MILLAU', arrive: 20, dept: 28, status: 'OnTime', delay: 0 },
];

const COST_ANALYSIS = Array.from({length: 12}, (_, i) => ({
    speed: 10 + i,
    cost: 50 + Math.pow(i, 2) * 2, // Exponential cost with speed
    duration: 30 - i * 1.5
}));

export const PortSchedSimView: React.FC = () => {
  // State
  const [speedMult, setSpeedMult] = useState(1.0);
  const [activeDelays, setActiveDelays] = useState(false);
  const [simTime, setSimTime] = useState(0);

  const [metrics, setMetrics] = useState({
      reliability: 92.5, // %
      avgDelay: 4.2, // hrs
      fuelSavings: 12500, // $
      fleetSpeed: 14.5 // kn
  });

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setSimTime(t => (t + 0.05) % 24);
        
        // Dynamic Metrics
        const delayImpact = activeDelays ? 15 : 0;
        const speedEffect = (speedMult - 1) * 5;
        
        setMetrics(prev => ({
            reliability: Math.max(60, 92.5 - delayImpact + speedEffect),
            avgDelay: activeDelays ? 18.5 : 4.2 - speedEffect,
            fuelSavings: prev.fuelSavings + (speedMult < 1 ? 100 : -50),
            fleetSpeed: 14.5 * speedMult
        }));

    }, 100);
    return () => clearInterval(interval);
  }, [speedMult, activeDelays]);

  return (
    <div className="h-full w-full relative bg-[#02040a] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE (Center Stage) */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="port-sched" 
            simData={{ 
                speedMultiplier: speedMult,
                showDelays: activeDelays
            }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#02040a_90%)] pointer-events-none"></div>
      </div>

      {/* TOP HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0f172a]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Globe size={14} /> GLOBAL LOGISTICS COMMAND
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 航运调度 <span className="text-blue-500">& 时刻表优化仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Schedule Reliability</div>
                   <div className={`text-3xl font-mono font-bold ${metrics.reliability < 80 ? 'text-red-500' : 'text-green-400'}`}>
                       {metrics.reliability.toFixed(1)}%
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Avg Fleet Delay</div>
                   <div className="text-3xl font-mono font-bold text-white">
                       {metrics.avgDelay.toFixed(1)} <span className="text-sm text-slate-500">h</span>
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT WING: Route & Status */}
      <div className="absolute left-6 top-32 bottom-32 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <SciFiCard title="航线网络状态" subtitle="ACTIVE LANES" className="flex-1 border-blue-900/50 bg-[#060b14]/90 pointer-events-auto">
              <div className="flex flex-col gap-3 p-1">
                  {['Asia-Europe', 'Trans-Pacific', 'Intra-Asia'].map((route, i) => (
                      <div key={i} className="p-3 bg-slate-900/40 rounded border border-slate-800 flex justify-between items-center group hover:border-blue-500/50 transition-colors cursor-pointer">
                          <div>
                              <div className="text-xs font-bold text-white mb-1">{route}</div>
                              <div className="text-[9px] text-slate-500 flex items-center gap-1">
                                  <Activity size={10} className="text-blue-400"/> {activeDelays ? 'Congested' : 'Fluent'}
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="text-lg font-mono text-cyan-300">{Math.floor(Math.random()*10)+5} <span className="text-xs">Ships</span></div>
                          </div>
                      </div>
                  ))}
                  
                  <div className="mt-4 pt-3 border-t border-slate-800">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                          <AlertCircle size={14} className={activeDelays ? "text-red-500 animate-pulse" : "text-slate-600"}/>
                          <span>{activeDelays ? 'Typhoon Alert: West Pacific' : 'No Weather Alerts'}</span>
                      </div>
                  </div>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT WING: Optimization Engine */}
      <div className="absolute right-6 top-32 bottom-32 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#060b14]/90 backdrop-blur-md border border-blue-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-blue-900/30 pb-2">
                  <Settings size={16} className="text-blue-500"/> 调度优化控制台
              </h3>
              
              <div className="space-y-6">
                  {/* Speed Control */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300 flex items-center gap-2"><FastForward size={12}/> Speed Recovery Factor</span>
                          <span className="font-mono text-cyan-300">{speedMult.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" min="0.8" max="1.5" step="0.1" 
                        value={speedMult} onChange={(e) => setSpeedMult(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                      <div className="flex justify-between text-[8px] text-slate-500">
                          <span>Slow Steam</span><span>Normal</span><span>Catch Up</span>
                      </div>
                  </div>

                  {/* Scenario Toggle */}
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-700">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                          <AlertTriangle size={16} className="text-yellow-500"/>
                          <span>Disruption Scenario</span>
                      </div>
                      <button 
                         onClick={() => setActiveDelays(!activeDelays)}
                         className={`w-12 h-6 rounded-full p-1 transition-colors ${activeDelays ? 'bg-red-600' : 'bg-slate-600'}`}
                      >
                          <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${activeDelays ? 'translate-x-6' : ''}`}></div>
                      </button>
                  </div>
                  
                  {/* Cost Benefit */}
                  <div className="p-3 bg-blue-900/20 border border-blue-800/30 rounded flex justify-between items-center">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                          <DollarSign size={14} className="text-green-400"/> Fuel Savings
                      </div>
                      <span className={`font-mono font-bold ${metrics.fuelSavings > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {metrics.fuelSavings > 0 ? '+' : ''}{(metrics.fuelSavings/1000).toFixed(1)}k
                      </span>
                  </div>
              </div>
          </div>

          <SciFiCard title="成本-时效权衡 (Trade-off)" subtitle="ANALYSIS" className="h-[250px] border-blue-900/50 bg-[#060b14]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={COST_ANALYSIS}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="speed" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Speed (kn)', position: 'insideBottom', offset: -5 }}/>
                          <YAxis yAxisId="left" stroke="#ef4444" tick={{fontSize: 10}} label={{ value: 'Cost', angle: -90, position: 'insideLeft' }}/>
                          <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tick={{fontSize: 10}} label={{ value: 'Time', angle: 90, position: 'insideRight' }}/>
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#333'}} />
                          <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} dot={false} name="Fuel Cost" />
                          <Line yAxisId="right" type="monotone" dataKey="duration" stroke="#3b82f6" strokeWidth={2} dot={false} name="Transit Time" />
                      </ComposedChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>

      {/* BOTTOM PANEL: Voyage Gantt */}
      <div className="absolute bottom-6 left-6 right-6 h-48 bg-[#060b14]/95 backdrop-blur-md border border-blue-900/50 rounded-lg p-4 pointer-events-auto shadow-2xl z-20 flex flex-col">
          <div className="flex justify-between items-center mb-2 border-b border-blue-900/30 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar size={16} className="text-blue-500"/> 船期计划表 (Voyage Schedule)
              </h3>
              <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500/20 border border-green-500 rounded"></div> On Time</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500/20 border border-red-500 rounded"></div> Delayed</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500/20 border border-blue-500 rounded"></div> Planned</div>
              </div>
          </div>
          
          <div className="flex-1 w-full relative">
               {/* Custom Gantt Bars */}
               {SCHEDULE_GANTT.map((item, i) => (
                   <div key={i} className="flex items-center h-6 mb-1 relative">
                       <div className="w-24 text-[10px] text-slate-400 truncate">{item.vessel}</div>
                       <div className="flex-1 h-full bg-slate-900/50 rounded relative overflow-hidden">
                           {/* Planned Bar */}
                           <div 
                              className={`absolute top-1 bottom-1 rounded border opacity-80
                                  ${item.status === 'Late' ? 'bg-red-500/20 border-red-500' : 'bg-green-500/20 border-green-500'}
                              `}
                              style={{
                                  left: `${(item.arrive/30)*100}%`,
                                  width: `${((item.dept - item.arrive)/30)*100}%`
                              }}
                           >
                               <span className="absolute left-1 top-0 bottom-0 flex items-center text-[8px] text-white whitespace-nowrap px-1">
                                   {item.delay > 0 ? `+${item.delay}h` : 'OK'}
                               </span>
                           </div>
                       </div>
                   </div>
               ))}
               
               {/* Time Markers */}
               <div className="flex justify-between text-[9px] text-slate-500 mt-1 pl-24">
                   <span>Day 1</span><span>Day 5</span><span>Day 10</span><span>Day 15</span><span>Day 20</span><span>Day 25</span>
               </div>
          </div>
      </div>

    </div>
  );
};
