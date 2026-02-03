
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Network, Users, Truck, Settings, 
  Play, Pause, AlertTriangle, Radio, 
  MapPin, Clock, BarChart3, Activity,
  Cpu, Layers, Zap
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

// --- MOCK DATA ---
const TASK_QUEUE = [
  { id: 'T-001', type: 'HAUL', target: 'Excavator 3', status: 'Pending' },
  { id: 'T-002', type: 'MAINT', target: 'Truck 05', status: 'Active' },
  { id: 'T-003', type: 'BLAST', target: 'Zone B', status: 'Scheduled' },
];

const SHIFT_STATS = [
  { name: 'Haulage', value: 65, fill: '#f97316' },
  { name: 'Idle', value: 15, fill: '#334155' },
  { name: 'Maint', value: 10, fill: '#ef4444' },
  { name: 'Delay', value: 10, fill: '#eab308' },
];

const EFFICIENCY_TREND = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    ai: 85 + Math.sin(i*0.3)*5 + Math.random()*2,
    manual: 75 + Math.sin(i*0.3)*5
}));

export const MineDispatchSimView: React.FC = () => {
  const [dispatchMode, setDispatchMode] = useState<'AI' | 'MANUAL'>('AI');
  const [alertActive, setAlertActive] = useState(false);
  const [metrics, setMetrics] = useState({
    activeUnits: 24,
    safetyScore: 98.5,
    networkLatency: 12, // ms
    efficiency: 92.4 // %
  });

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            networkLatency: 10 + Math.random() * 5,
            efficiency: dispatchMode === 'AI' ? 92 + Math.random() : 85 + Math.random()
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, [dispatchMode]);

  return (
    <div className="h-full w-full relative bg-[#030610] text-blue-50 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="mine-dispatch" 
            simData={{ 
                mode: dispatchMode,
                alert: alertActive
            }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#030610_100%)] pointer-events-none"></div>
          {/* Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0f172a]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Network size={14} /> UNIFIED COMMAND CENTER
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 智能调度系统 <span className="text-cyan-500">“人-车-设备”联合仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Network Health</div>
                   <div className="text-2xl font-mono font-bold text-green-400">
                       {metrics.networkLatency} ms
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">System Efficiency</div>
                   <div className="text-3xl font-mono font-bold text-cyan-300">
                       {metrics.efficiency.toFixed(1)}%
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT: Dispatch Console */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#0b1221]/90 backdrop-blur-md border border-cyan-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-cyan-900/50 pb-2">
                  <Cpu size={16} className="text-cyan-500"/> 调度策略控制
              </h3>
              
              <div className="flex bg-slate-900/50 p-1 rounded border border-slate-700 mb-4">
                  <button 
                    onClick={() => setDispatchMode('AI')}
                    className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all
                        ${dispatchMode === 'AI' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}
                    `}
                  >
                      <Zap size={12}/> AI AUTO
                  </button>
                  <button 
                    onClick={() => setDispatchMode('MANUAL')}
                    className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all
                        ${dispatchMode === 'MANUAL' ? 'bg-orange-600 text-white shadow' : 'text-slate-400 hover:text-white'}
                    `}
                  >
                      <Settings size={12}/> MANUAL
                  </button>
              </div>

              <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-slate-900/40 rounded border border-slate-800">
                      <span className="text-xs text-slate-300">Collision Avoidance</span>
                      <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded">ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-900/40 rounded border border-slate-800">
                      <span className="text-xs text-slate-300">V2X Comms</span>
                      <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded">ONLINE</span>
                  </div>
              </div>

              <button 
                onClick={() => setAlertActive(!alertActive)}
                className={`w-full mt-4 py-3 font-bold text-xs rounded flex items-center justify-center gap-2 transition-all border
                    ${alertActive ? 'bg-red-600/80 border-red-500 text-white animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'}
                `}
              >
                  <AlertTriangle size={14}/> {alertActive ? 'EMERGENCY STOP ACTIVE' : 'SIMULATE EMERGENCY'}
              </button>
          </div>

          <SciFiCard title="任务队列 (Task Queue)" subtitle="PENDING" className="flex-1 border-cyan-900/50 bg-[#0b1221]/90 pointer-events-auto">
              <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                  {TASK_QUEUE.map((task, i) => (
                      <div key={i} className="p-2.5 bg-slate-900/40 border border-slate-800 rounded flex justify-between items-center group hover:border-cyan-500/30 transition-colors">
                          <div>
                              <div className="text-xs font-bold text-white mb-1">{task.id} <span className="text-slate-500">| {task.type}</span></div>
                              <div className="text-[10px] text-cyan-300">{task.target}</div>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${task.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                              {task.status}
                          </span>
                      </div>
                  ))}
                  <div className="mt-auto pt-2 text-center text-[10px] text-slate-500">
                      Auto-assigning next tasks...
                  </div>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT: Stats */}
      <div className="absolute right-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <SciFiCard title="协同效率对比" subtitle="AI vs MANUAL" className="h-[250px] border-cyan-900/50 bg-[#0b1221]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={EFFICIENCY_TREND}>
                          <defs>
                              <linearGradient id="gradAI" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="hour" hide />
                          <YAxis domain={[60, 100]} hide />
                          <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#06b6d4'}} />
                          <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                          <Area type="monotone" dataKey="ai" name="AI Dispatch" stroke="#06b6d4" fill="url(#gradAI)" strokeWidth={2} />
                          <Line type="monotone" dataKey="manual" name="Manual Baseline" stroke="#94a3b8" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          <SciFiCard title="资源利用率分布" subtitle="SHIFT" className="flex-1 border-cyan-900/50 bg-[#0b1221]/90 pointer-events-auto">
              <div className="flex flex-col h-full justify-center items-center">
                  <div className="relative w-48 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                data={SHIFT_STATS}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                              >
                                {SHIFT_STATS.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#334155', fontSize: '10px'}} />
                              <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{fontSize: '10px'}} iconSize={8} />
                          </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none pb-6">
                          <span className="text-2xl font-bold text-white">85%</span>
                          <span className="text-[10px] text-slate-400">UTIL</span>
                      </div>
                  </div>
              </div>
          </SciFiCard>

      </div>

      {/* CENTER HUD: Entity Legend */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-black/70 backdrop-blur px-6 py-2 rounded-full border border-cyan-900/50 flex gap-6 text-[10px] text-slate-300 pointer-events-none">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Truck</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Personnel</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Machinery</div>
          <div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-cyan-400"></div> Data Link</div>
      </div>

    </div>
  );
};
