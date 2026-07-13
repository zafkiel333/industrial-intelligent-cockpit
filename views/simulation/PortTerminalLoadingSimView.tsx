
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-port-load]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-port-load';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Anchor, Truck, Box, Activity, 
  Settings, Play, Pause, Clock, 
  BarChart2, Zap, Layers, List
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, Legend, LineChart, Line, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---

const CRANE_SCHED = [
  { id: 'QC-01', status: 'Working', bay: 'Bay 08', progress: 65, eta: '1h 20m' },
  { id: 'QC-02', status: 'Working', bay: 'Bay 12', progress: 42, eta: '2h 10m' },
  { id: 'QC-03', status: 'Maintenance', bay: '--', progress: 0, eta: '--' },
];

const MPH_TREND = Array.from({length: 12}, (_, i) => ({
    time: `${i+8}:00`,
    mph: 25 + Math.random() * 10 + (i > 4 ? 5 : 0), // Peak around noon
    target: 30
}));

const AGV_WAIT_DATA = [
  { name: 'Waiting for Crane', value: 35, fill: '#ef4444' },
  { name: 'Travel', value: 45, fill: '#3b82f6' },
  { name: 'Idle', value: 20, fill: '#334155' },
];

const GANTT_DATA = [
    { id: 'QC-01', start: 0, end: 4, type: 'Load' },
    { id: 'QC-01', start: 5, end: 8, type: 'Disch' },
    { id: 'QC-02', start: 1, end: 6, type: 'Disch' },
    { id: 'QC-03', start: 0, end: 8, type: 'Maint' },
];

export const PortTerminalLoadingSimView: React.FC = () => {
  // State
  const [activeCranes, setActiveCranes] = useState(2);
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [agvDensity, setAgvDensity] = useState(50); // %

  const [metrics, setMetrics] = useState({
    mph: 28.5,
    movesDone: 1450,
    agvUtil: 78.2, // %
    energyPerMove: 2.4 // kWh
  });

  // Simulation Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            mph: 25 + (activeCranes * 2) + Math.random() * 5,
            movesDone: prev.movesDone + Math.floor(Math.random() * activeCranes),
            agvUtil: 60 + (agvDensity / 100) * 30
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, activeCranes, agvDensity]);

  return (
    <div className="h-full w-full relative bg-[#0b0f19] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 1. 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="port-terminal-loading" 
            simData={{ 
                activeCranes,
                speed: isPlaying ? simSpeed : 0
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#0b0f19_100%)] pointer-events-none"></div>
          {/* Scanline */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>
      </div>

      {/* 2. TOP HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0f172a]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-orange-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Anchor size={14} /> TERMINAL OPERATIONS SYSTEM (TOS)
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 码头装卸作业 <span className="text-orange-500">& 岸桥调度仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Current Efficiency</div>
                   <div className="text-3xl font-mono font-bold text-white">
                       {metrics.mph.toFixed(1)} <span className="text-sm text-slate-500">MPH</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Moves Completed</div>
                   <div className="text-3xl font-mono font-bold text-cyan-400">
                       {metrics.movesDone}
                   </div>
               </div>
          </div>
      </div>

      {/* 3. LEFT PANEL: Controls & Schedule */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#0b1120]/90 backdrop-blur-md border border-orange-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-orange-900/30 pb-2">
                  <Settings size={16} className="text-orange-500"/> 调度参数控制
              </h3>
              
              <div className="space-y-4">
                  {/* Crane Count */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span>Active Cranes (QC)</span>
                          <span className="font-mono text-orange-400">{activeCranes}</span>
                      </div>
                      <input 
                        type="range" min="1" max="3" step="1" 
                        value={activeCranes} onChange={(e) => setActiveCranes(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                  </div>

                  {/* Speed */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span>Sim Speed</span>
                          <span className="font-mono text-cyan-400">{simSpeed}x</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="3.0" step="0.5" 
                        value={simSpeed} onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                  </div>

                  {/* Playback */}
                  <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`flex-1 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all border
                            ${isPlaying ? 'bg-orange-600/20 border-orange-500 text-orange-200' : 'bg-green-600/20 border-green-500 text-green-200'}
                        `}
                      >
                          {isPlaying ? <Pause size={14}/> : <Play size={14}/>}
                          {isPlaying ? 'PAUSE' : 'START'}
                      </button>
                  </div>
              </div>
          </div>

          <SciFiCard title="作业甘特图 (Gantt)" subtitle="8H WINDOW" className="flex-1 border-orange-900/50 bg-[#0b1120]/90 pointer-events-auto">
              <div className="flex flex-col gap-2 p-1">
                  {GANTT_DATA.map((job, i) => (
                      <div key={i} className="flex flex-col gap-1 mb-2">
                          <div className="flex justify-between text-[10px] text-slate-400">
                              <span>{job.id}</span>
                              <span>{job.type}</span>
                          </div>
                          <div className="w-full h-4 bg-slate-800 rounded relative overflow-hidden">
                              <div 
                                className={`absolute h-full rounded ${job.type === 'Maint' ? 'bg-red-500/50' : 'bg-blue-500/80'}`}
                                style={{
                                    left: `${(job.start/8)*100}%`,
                                    width: `${((job.end-job.start)/8)*100}%`
                                }}
                              ></div>
                          </div>
                      </div>
                  ))}
                  
                  <div className="flex justify-between text-[10px] text-slate-500 mt-2 border-t border-slate-800 pt-1">
                      <span>08:00</span>
                      <span>12:00</span>
                      <span>16:00</span>
                  </div>
              </div>
          </SciFiCard>

      </div>

      {/* 4. RIGHT PANEL: Analytics */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Efficiency Trend */}
          <SciFiCard title="岸桥作业效率 (MPH)" subtitle="TREND" className="h-[250px] border-orange-900/50 bg-[#0b1120]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={MPH_TREND}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#331c09" vertical={false} />
                          <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={2} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 45]} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316'}} />
                          <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" label={{value:'Target', fill:'#22c55e', fontSize:10}} />
                          <Line type="monotone" dataKey="mph" stroke="#f97316" strokeWidth={2} dot={false} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          {/* AGV Utilization */}
          <div className="flex-1 bg-[#0b1120]/90 backdrop-blur-md border border-orange-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 border-b border-orange-900/30 pb-2">
                  <Truck size={16} className="text-blue-400"/> 水平运输分析 (AGV)
              </h3>
              
              <div className="flex items-center gap-4 h-40">
                  <div className="relative w-32 h-32">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                data={AGV_WAIT_DATA}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={45}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {AGV_WAIT_DATA.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="none"/>
                                ))}
                              </Pie>
                          </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                          <span className="text-xl font-bold text-white">{metrics.agvUtil.toFixed(0)}%</span>
                          <span className="text-[8px] text-slate-500">UTIL</span>
                      </div>
                  </div>
                  <div className="flex-1 space-y-2 text-xs text-slate-300">
                      {AGV_WAIT_DATA.map((item, i) => (
                          <div key={i} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.fill}}></div>
                                  <span>{item.name}</span>
                              </div>
                              <span className="font-mono">{item.value}%</span>
                          </div>
                      ))}
                  </div>
              </div>
              
              <div className="mt-auto p-2 bg-slate-900/50 border border-slate-800 rounded">
                  <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-400">Energy Efficiency</span>
                      <span className="text-green-400 font-bold">{metrics.energyPerMove} kWh/move</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[75%]"></div>
                  </div>
              </div>
          </div>

      </div>

      {/* 5. BOTTOM OVERLAY: Active Cranes Status */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex gap-4">
          {CRANE_SCHED.map((qc, i) => (
              <div key={i} className={`w-40 p-3 rounded-lg border backdrop-blur-md flex flex-col gap-1
                  ${qc.status === 'Working' ? 'bg-orange-900/20 border-orange-500/50' : 'bg-slate-900/60 border-slate-700'}
              `}>
                  <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">{qc.id}</span>
                      <span className={`text-[9px] px-1.5 rounded ${qc.status === 'Working' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                          {qc.status}
                      </span>
                  </div>
                  <div className="text-[10px] text-slate-400">{qc.bay}</div>
                  {qc.status === 'Working' && (
                      <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-orange-500" style={{width: `${qc.progress}%`}}></div>
                      </div>
                  )}
              </div>
          ))}
      </div>

    </div>
  );
};
