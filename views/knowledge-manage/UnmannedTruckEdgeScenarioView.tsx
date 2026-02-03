
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/truck-edge/ThreeScene';
import { EdgeScenarioState } from '../../components/knowledge-manage/truck-edge/three-types';
import { 
  Truck, Cpu, Wifi, Activity, AlertTriangle, 
  Map, Database, Code, Zap, Layers, 
  Play, RotateCcw, ShieldAlert, Radio,
  CloudRain, Navigation, BrainCircuit,
  Terminal, Server, Lock, AlertOctagon, Scan
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend
} from 'recharts';

// --- MOCK DATA ---
const SCENARIOS = [
    { id: 'S-001', title: '突发障碍物避让', type: 'Safety', complexity: 'High', status: 'Verified' },
    { id: 'S-002', title: 'GPS信号丢失盲跑', type: 'Nav', complexity: 'Extreme', status: 'Experimental' },
    { id: 'S-003', title: '重载坡道起步', type: 'Control', complexity: 'Med', status: 'Verified' },
    { id: 'S-004', title: '雨雾天气感知降级', type: 'Perception', complexity: 'High', status: 'Pending' },
    { id: 'S-005', title: '交叉路口博弈', type: 'Decision', complexity: 'Med', status: 'Verified' },
];

const COMPUTE_LOAD = Array.from({length: 40}, (_, i) => ({
    time: i,
    cpu: 40 + Math.random() * 30 + (i > 20 ? 20 : 0),
    gpu: 60 + Math.random() * 20
}));

const LATENCY_DATA = Array.from({length: 20}, (_, i) => ({
    time: i,
    val: 15 + Math.random() * 5 + (i===10 ? 40 : 0) // Spike
}));

const ALGO_PERFORMANCE = [
    { subject: '感知精度', A: 92, fullMark: 100 },
    { subject: '决策速度', A: 85, fullMark: 100 },
    { subject: '轨迹平滑', A: 78, fullMark: 100 },
    { subject: '能耗控制', A: 88, fullMark: 100 },
    { subject: '鲁棒性', A: 95, fullMark: 100 },
];

const LOGS = [
    { time: '10:45:02', source: 'PERCEPTION', msg: 'Lidar point cloud clusters: 12 identified.' },
    { time: '10:45:03', source: 'FUSION', msg: 'Object ID #42 classified as STATIC OBSTACLE.' },
    { time: '10:45:03', source: 'PLANNER', msg: 'Global path blocked. Triggering local replan.' },
    { time: '10:45:04', source: 'CONTROL', msg: 'Steering command: -12 deg. Brake: 15%.' },
];

export const UnmannedTruckEdgeScenarioView: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState('S-001');
  const [simState, setSimState] = useState<EdgeScenarioState>('CRUISING');
  const [logs, setLogs] = useState(LOGS);

  // Simulation Logic
  useEffect(() => {
    let timer: any;
    if (simState !== 'CRUISING') {
        // Auto sequence for demo
        if (simState === 'OBSTACLE_DETECT') {
            timer = setTimeout(() => { setSimState('DECIDING'); addLog('[AI] 计算避让代价函数...'); }, 2000);
        } else if (simState === 'DECIDING') {
            timer = setTimeout(() => { setSimState('REROUTING'); addLog('[PLANNER] 生成局部绕行轨迹'); }, 2000);
        } else if (simState === 'REROUTING') {
            timer = setTimeout(() => { setSimState('CRUISING'); addLog('[CONTROL] 回归主路径'); }, 4000);
        }
    }
    return () => clearTimeout(timer);
  }, [simState]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [{ time, source: 'SYSTEM', msg }, ...prev.slice(0, 6)]);
  };

  const handleScenarioClick = (id: string) => {
      setActiveScenario(id);
      setSimState('CRUISING');
      addLog(`场景重置：加载 ${id} 配置参数`);
  };

  const triggerEvent = (type: string) => {
      if (type === 'OBSTACLE') {
          setSimState('OBSTACLE_DETECT');
          addLog('!! [SENSOR] 前方 30m 检测到障碍物');
      } else if (type === 'COMMS') {
          setSimState('COMMS_LOSS');
          addLog('!! [LINK] 5G 信号丢失，切换至自主导航模式');
      } else if (type === 'STOP') {
          setSimState('EMERGENCY_STOP');
          addLog('!! [SAFETY] 紧急停车指令触发');
      }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#0b0c15] p-2 relative overflow-hidden">
      
      {/* Background Matrix */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/80 border-b border-purple-500/30 p-4 rounded-lg backdrop-blur-md z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-purple-600/20 border-2 border-purple-500 rounded-sm flex items-center justify-center relative shadow-[0_0_20px_rgba(168,85,247,0.3)]">
             <Cpu size={32} className="text-purple-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-purple-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Server size={12} /> Edge Computing Node
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               无人矿卡 <span className="text-purple-500 italic">边缘场景仿真库</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Inference Latency</div>
                <div className="text-2xl font-mono font-black text-white">12 <span className="text-sm font-normal text-slate-600">ms</span></div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Scenario</div>
                <div className="text-2xl font-mono font-black text-purple-400">{activeScenario}</div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Scenario Library --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="边缘场景库 (Edge Cases)" subtitle="LIBRARY" className="border-purple-900/30 bg-[#100d1d]/90">
              <div className="flex flex-col gap-2 mt-2">
                 {SCENARIOS.map(sc => (
                    <div 
                      key={sc.id}
                      onClick={() => handleScenarioClick(sc.id)}
                      className={`p-3 rounded border cursor-pointer transition-all hover:translate-x-1 group
                         ${activeScenario === sc.id 
                            ? 'bg-purple-900/30 border-purple-500 shadow-[inset_0_0_10px_rgba(168,85,247,0.2)]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                      `}
                    >
                        <div className="flex justify-between items-center mb-1">
                           <span className={`text-xs font-bold ${activeScenario === sc.id ? 'text-white' : 'text-slate-400'}`}>{sc.title}</span>
                           <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${sc.complexity === 'Extreme' ? 'bg-red-900/50 text-red-400' : 'bg-slate-800 text-slate-500'}`}>
                               {sc.complexity}
                           </span>
                        </div>
                        <div className="flex gap-2 text-[9px] text-slate-500 font-mono">
                            <span className="bg-slate-950 px-1 rounded border border-slate-800">{sc.id}</span>
                            <span>{sc.type}</span>
                        </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="算法性能雷达" subtitle="EVALUATION" className="h-[240px] border-slate-800">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={ALGO_PERFORMANCE}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Algo" dataKey="A" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.3} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Simulation & HUD --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-purple-900/20 rounded-lg overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene state={simState} />

               {/* HUD Overlay */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
                   <div className="bg-slate-950/80 backdrop-blur border border-purple-500/30 p-3 rounded-sm flex flex-col border-l-4 border-l-purple-500 w-64">
                       <div className="text-[10px] text-purple-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <BrainCircuit size={12}/> Planner State
                       </div>
                       <div className="text-xl font-black text-white">{simState}</div>
                       <div className="text-xs text-slate-400 mt-1 flex justify-between">
                           <span>Conf: 0.98</span>
                           <span>Mode: Auto</span>
                       </div>
                   </div>
               </div>

               {/* Trigger Controls */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-3 rounded-full border border-slate-700 shadow-xl backdrop-blur">
                   <button onClick={() => triggerEvent('OBSTACLE')} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-yellow-500 transition-all hover:scale-110" title="Trigger Obstacle">
                       <AlertTriangle size={20} />
                   </button>
                   <button onClick={() => triggerEvent('COMMS')} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-blue-400 transition-all hover:scale-110" title="Simulate Comms Loss">
                       <Wifi size={20} />
                   </button>
                   <div className="w-px h-8 bg-slate-700 mx-1"></div>
                   <button onClick={() => triggerEvent('STOP')} className="px-6 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-full transition-all shadow-lg shadow-red-900/50 flex items-center gap-2">
                       <AlertOctagon size={14}/> E-STOP
                   </button>
               </div>

               {/* Latency Graph Overlay */}
               <div className="absolute top-4 right-4 z-20 w-48 h-24 bg-black/60 backdrop-blur border border-slate-800 rounded p-2">
                   <div className="text-[9px] text-slate-500 mb-1">Network Latency (ms)</div>
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={LATENCY_DATA}>
                           <Line type="monotone" dataKey="val" stroke="#22d3ee" strokeWidth={2} dot={false} isAnimationActive={false} />
                       </LineChart>
                   </ResponsiveContainer>
               </div>
           </div>

           {/* Compute Load Chart */}
           <div className="h-[200px] bg-slate-900/40 border border-slate-800 rounded-lg p-3 overflow-hidden">
               <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>边缘计算负载 (Edge Compute Load)</span>
                   <span className="text-purple-500">NVIDIA Orin-X</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={COMPUTE_LOAD}>
                       <defs>
                           <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                       <Tooltip contentStyle={{backgroundColor: '#02040a', borderColor: '#d946ef'}} />
                       <Area type="step" dataKey="cpu" stroke="#d946ef" fill="url(#cpuGrad)" name="CPU Load %" />
                       <Line type="monotone" dataKey="gpu" stroke="#22d3ee" strokeWidth={2} dot={false} name="GPU Load %" />
                       <Legend verticalAlign="top" height={20} iconSize={8} wrapperStyle={{fontSize:'10px'}}/>
                   </AreaChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* --- RIGHT: Debug & Logs --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="感知数据流" subtitle="SENSOR FUSION" className="h-[280px] border-slate-800">
               <div className="flex flex-col gap-3 py-1">
                   <div className="flex items-center justify-between p-2 bg-slate-900/50 border border-slate-800 rounded">
                       <span className="text-xs text-slate-400 flex items-center gap-2"><Radio size={12}/> LiDAR</span>
                       <span className="text-xs font-mono text-green-400">20Hz / OK</span>
                   </div>
                   <div className="flex items-center justify-between p-2 bg-slate-900/50 border border-slate-800 rounded">
                       <span className="text-xs text-slate-400 flex items-center gap-2"><Scan size={12}/> Radar</span>
                       <span className="text-xs font-mono text-green-400">50Hz / OK</span>
                   </div>
                   <div className="flex items-center justify-between p-2 bg-slate-900/50 border border-slate-800 rounded">
                       <span className="text-xs text-slate-400 flex items-center gap-2"><Map size={12}/> GNSS/IMU</span>
                       <span className={`text-xs font-mono ${simState === 'COMMS_LOSS' ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                           {simState === 'COMMS_LOSS' ? 'DRIFTING' : 'FIXED'}
                       </span>
                   </div>
                   
                   <div className="mt-2 h-24 bg-black/40 rounded border border-slate-800 p-2 font-mono text-[9px] text-purple-300 overflow-hidden">
                       {`> Obj_List: [
  { id: 42, type: ROCK, dist: 35.2 },
  { id: 43, type: TRUCK, dist: 120.5 }
]
> Path_Cost: 14.5`}
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="决策内核日志" subtitle="KERNEL LOG" className="flex-1 border-purple-900/30">
               <div className="flex flex-col h-full">
                   <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                       {logs.map((log, i) => (
                           <div key={i} className="flex flex-col text-[10px] border-l-2 border-slate-700 pl-2 py-1">
                               <div className="flex justify-between text-slate-500">
                                   <span>{log.time}</span>
                                   <span className="text-purple-400">{log.source}</span>
                               </div>
                               <div className="text-slate-300">{log.msg}</div>
                           </div>
                       ))}
                       <div className="animate-pulse text-purple-500 text-xs">_</div>
                   </div>
                   
                   <div className="pt-3 mt-2 border-t border-slate-800">
                       <div className="flex items-center gap-2 text-[10px] text-slate-500">
                           <Terminal size={12} />
                           <span>SSH Connection: 192.168.10.42</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
