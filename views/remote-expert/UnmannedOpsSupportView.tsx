
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  Gamepad2, Wifi, Zap, Activity, 
  Crosshair, Radio, AlertTriangle, 
  Cpu, Lock, Unlock, Map as MapIcon,
  Play, Pause, RefreshCw, Terminal,
  Radar as RadarIcon, Eye, Power,
  Battery, BrainCircuit
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  ScatterChart, Scatter, ZAxis, ReferenceLine, Cell, LineChart, Line
} from 'recharts';

// --- Types ---

interface DroneUnit {
  id: string;
  name: string;
  type: string;
  status: 'Autonomous' | 'Manual' | 'Idle' | 'Error';
  battery: number;
  taskProgress: number;
  latency: number; // ms
}

interface TelemetryLog {
  time: string;
  cmd: string;
  response: string;
  status: 'OK' | 'WARN' | 'ERR';
}

// --- Mock Data ---

const FLEET_STATUS: DroneUnit[] = [
  { id: 'R-01', name: 'TBM-Alpha (盾构)', type: 'TBM', status: 'Autonomous', battery: 85, taskProgress: 42, latency: 24 },
  { id: 'R-02', name: 'Hauler-X1 (矿卡)', type: 'Truck', status: 'Idle', battery: 12, taskProgress: 100, latency: 18 },
  { id: 'R-03', name: 'Insp-Drone (巡检)', type: 'UAV', status: 'Manual', battery: 64, taskProgress: 15, latency: 150 }, // High latency
];

// Simulated LiDAR Data (Point Cloud)
const LIDAR_DATA = Array.from({length: 100}, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  z: Math.random() * 100, // Intensity
  type: Math.random() > 0.9 ? 'Obstacle' : 'Terrain'
}));

// Network Quality Stream
const NETWORK_DATA = Array.from({ length: 60 }, (_, i) => ({
  time: i,
  latency: 20 + Math.random() * 10 + (Math.sin(i/5) * 5),
  packetLoss: Math.random() > 0.9 ? Math.random() * 2 : 0
}));

const SYSTEM_LOGS: TelemetryLog[] = [
  { time: '10:42:01', cmd: 'SYS_HEARTBEAT', response: 'ACK_OK (seq=1024)', status: 'OK' },
  { time: '10:42:02', cmd: 'PATH_PLAN_REQ', response: 'Calculating...', status: 'OK' },
  { time: '10:42:05', cmd: 'OBSTACLE_DETECT', response: 'Object ID: #992 @ 12m', status: 'WARN' },
  { time: '10:42:06', cmd: 'DECISION_Engine', response: 'Halt & Request Human Verify', status: 'WARN' },
];

// --- Sub-Components ---

const ConnectionStatus = ({ latency }: { latency: number }) => {
  const quality = latency < 50 ? 'Excellent' : latency < 100 ? 'Good' : 'Poor';
  const color = latency < 50 ? 'text-green-400' : latency < 100 ? 'text-yellow-400' : 'text-red-400';
  
  return (
    <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-2 rounded border border-slate-700 backdrop-blur-md">
       <div className="flex flex-col items-end">
           <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Uplink Status</span>
           <span className={`text-xs font-mono font-bold ${color} flex items-center gap-1`}>
               <Wifi size={12} /> {latency}ms
           </span>
       </div>
       <div className="h-8 w-px bg-slate-700"></div>
       <div className="flex flex-col items-end">
           <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Link Quality</span>
           <span className="text-xs text-white">{quality}</span>
       </div>
    </div>
  );
};

const RemoteController = ({ active }: { active: boolean }) => (
  <div className={`relative p-6 rounded-xl border-2 transition-all duration-500 overflow-hidden
      ${active ? 'border-red-500 bg-red-950/20 shadow-[0_0_30px_rgba(220,38,38,0.2)]' : 'border-slate-800 bg-slate-900/50'}
  `}>
      {/* Background Tech Grid */}
      <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
      }}></div>

      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <div className={`p-4 rounded-full border-4 transition-all duration-300
              ${active ? 'bg-red-600 border-red-400 animate-pulse text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}
          `}>
              <Gamepad2 size={48} />
          </div>
          
          <div>
              <div className="text-sm font-bold uppercase tracking-widest mb-1">
                  {active ? 'Manual Override Engaged' : 'System Autonomous'}
              </div>
              <div className="text-[10px] font-mono opacity-70">
                  {active ? 'Direct Control Authority: REMOTE EXPERT' : 'Monitoring Mode'}
              </div>
          </div>

          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-300 ${active ? 'bg-red-500 w-full' : 'bg-green-500 w-[10%]'}`}></div>
          </div>
      </div>
  </div>
);

const AIReasoningLog = () => (
  <div className="font-mono text-xs space-y-2">
     <div className="flex items-start gap-2 opacity-50">
        <span className="text-slate-500">[10:41:55]</span>
        <span className="text-blue-400">PLANNER:</span>
        <span>Generating Waypoints (A* Algo)...</span>
     </div>
     <div className="flex items-start gap-2 opacity-70">
        <span className="text-slate-500">[10:41:58]</span>
        <span className="text-blue-400">PERCEPTION:</span>
        <span>Confidence 0.98. Terrain Flat.</span>
     </div>
     <div className="flex items-start gap-2 bg-red-900/20 p-1 rounded border-l-2 border-red-500">
        <span className="text-slate-400">[10:42:05]</span>
        <span className="text-red-400 font-bold">ANOMALY:</span>
        <span>Unidentified Thermal Signature. Dist: 12m.</span>
     </div>
     <div className="flex items-start gap-2 animate-pulse">
        <span className="text-slate-400">[10:42:06]</span>
        <span className="text-yellow-400">DECISION:</span>
        <span>Requesting Operator Intervention...</span>
     </div>
  </div>
);

export const UnmannedOpsSupportView: React.FC = () => {
  const [selectedUnitId, setSelectedUnitId] = useState('R-01');
  const [manualMode, setManualMode] = useState(false);
  const [streamData, setStreamData] = useState(NETWORK_DATA);

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setStreamData(prev => {
            const next = [...prev.slice(1)];
            const t = prev[prev.length - 1].time + 1;
            next.push({
                time: t,
                latency: 20 + Math.random() * 10 + (Math.sin(t/5) * 5),
                packetLoss: Math.random() > 0.95 ? Math.random() * 5 : 0
            });
            return next;
        });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const activeUnit = FLEET_STATUS.find(u => u.id === selectedUnitId) || FLEET_STATUS[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200 bg-[#030303]">
      
      {/* 1. Header: The Command Bridge */}
      <div className="flex justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#0a1124] to-transparent px-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Radio size={14} className="animate-pulse" /> Teleoperation Command
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             无人化作业 <span className="text-cyan-500">远程技术支持中枢</span>
          </h1>
        </div>
        
        <div className="flex gap-4 items-center">
            <ConnectionStatus latency={activeUnit.latency} />
            
            <button 
              onClick={() => setManualMode(!manualMode)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded shadow-lg transition-all
                 ${manualMode 
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50 animate-pulse' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600'}
              `}
            >
               {manualMode ? <Unlock size={16} /> : <Lock size={16} />}
               {manualMode ? 'RELEASE CONTROL' : 'TAKEOVER CONTROL'}
            </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden px-4 pb-4">
         
         {/* LEFT: Fleet Status & Selection */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
             <SciFiCard title="作业单元 (Active Fleet)" subtitle="STATUS" className="border-cyan-900/30">
                 <div className="flex flex-col gap-3">
                     {FLEET_STATUS.map(unit => (
                         <div 
                           key={unit.id}
                           onClick={() => setSelectedUnitId(unit.id)}
                           className={`p-3 rounded border cursor-pointer transition-all relative overflow-hidden group
                              ${selectedUnitId === unit.id 
                                  ? 'bg-cyan-950/40 border-cyan-500 shadow-[inset_4px_0_0_#0ea5e9]' 
                                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                           `}
                         >
                             <div className="flex justify-between items-start mb-2">
                                 <div>
                                     <div className="text-xs font-bold text-white">{unit.name}</div>
                                     <div className="text-[10px] text-slate-500 font-mono">ID: {unit.id}</div>
                                 </div>
                                 <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold
                                     ${unit.status === 'Autonomous' ? 'bg-green-900/30 text-green-400' : 
                                       unit.status === 'Manual' ? 'bg-red-900/30 text-red-400 border border-red-900' : 'bg-slate-800 text-slate-500'}
                                 `}>
                                     {unit.status}
                                 </span>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                                 <div className="flex items-center gap-1">
                                     <Battery size={10} className={unit.battery < 20 ? 'text-red-500' : 'text-green-400'}/>
                                     {unit.battery}%
                                 </div>
                                 <div className="flex items-center gap-1 justify-end">
                                     <Activity size={10} className="text-blue-400"/>
                                     {unit.taskProgress}% Done
                                 </div>
                             </div>
                             
                             {/* Progress Bar */}
                             <div className="absolute bottom-0 left-0 h-1 bg-slate-800 w-full">
                                 <div className="h-full bg-cyan-500 transition-all" style={{width: `${unit.taskProgress}%`}}></div>
                             </div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>

             {/* Connection Quality Chart */}
             <SciFiCard title="链路质量 (QoS)" className="flex-1 border-slate-800">
                 <div className="w-full h-full p-2">
                     <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={streamData}>
                             <defs>
                                 <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                 </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                             <XAxis dataKey="time" hide />
                             <YAxis hide domain={[0, 100]} />
                             <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#333', fontSize: '12px'}} />
                             <Area type="monotone" dataKey="latency" stroke="#10b981" fill="url(#colorLat)" strokeWidth={2} />
                             <Line type="monotone" dataKey="packetLoss" stroke="#ef4444" strokeWidth={1} dot={false} />
                         </AreaChart>
                     </ResponsiveContainer>
                 </div>
                 <div className="px-2 pb-2 flex justify-between text-[9px] text-slate-500">
                     <span>Latency (ms)</span>
                     <span className="text-red-400">Packet Loss</span>
                 </div>
             </SciFiCard>
         </div>

         {/* CENTER: The Operator's Eye */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
             
             {/* 1. Main Viewport (3D + LiDAR Overlay) */}
             <SciFiCard title="全息作业现场 (Holo-View)" subtitle="LIDAR + OPTICAL" className="flex-[3] border-cyan-900/50 bg-[#020202]" noPadding>
                 <div className="w-full h-full relative">
                     {/* 3D Scene */}
                     <div className={`absolute inset-0 z-0 transition-opacity duration-500 ${manualMode ? 'opacity-100' : 'opacity-80'}`}>
                         <ThreeScene type="tbm" color={manualMode ? '#ef4444' : '#06b6d4'} />
                     </div>
                     
                     {/* LiDAR Point Cloud Overlay (Simulated) */}
                     <div className="absolute inset-0 z-10 pointer-events-none opacity-40 mix-blend-screen">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                <Scatter name="Lidar" data={LIDAR_DATA} fill="#0ea5e9" shape="circle">
                                    {LIDAR_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.type === 'Obstacle' ? '#ef4444' : '#0ea5e9'} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                     </div>

                     {/* HUD Overlays */}
                     <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                         <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-1.5 rounded text-xs text-cyan-300 flex items-center gap-2">
                             <RadarIcon size={14} className="animate-spin-slow"/> 
                             LiDAR Scanning
                         </div>
                         {manualMode && (
                             <div className="bg-red-900/80 border border-red-500 px-3 py-1.5 rounded text-xs text-white font-bold animate-pulse flex items-center gap-2">
                                 <AlertTriangle size={14} /> MANUAL OVERRIDE ACTIVE
                             </div>
                         )}
                     </div>

                     {/* Crosshair (Center) */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none opacity-50">
                         <Crosshair size={48} className={manualMode ? 'text-red-500' : 'text-cyan-500'} />
                     </div>
                 </div>
             </SciFiCard>

             {/* 2. Control & Telemetry Strip */}
             <div className="h-32 grid grid-cols-4 gap-4">
                 <SciFiCard className="border-slate-800 bg-slate-900/20" noPadding>
                     <div className="flex flex-col items-center justify-center h-full p-2">
                         <span className="text-[10px] text-slate-500 uppercase">Torque</span>
                         <span className="text-xl font-mono font-bold text-white">4,250 Nm</span>
                         <div className="w-full bg-slate-800 h-1 mt-1 rounded-full"><div className="w-[65%] bg-blue-500 h-full"></div></div>
                     </div>
                 </SciFiCard>
                 <SciFiCard className="border-slate-800 bg-slate-900/20" noPadding>
                     <div className="flex flex-col items-center justify-center h-full p-2">
                         <span className="text-[10px] text-slate-500 uppercase">RPM</span>
                         <span className="text-xl font-mono font-bold text-white">1.8</span>
                         <div className="w-full bg-slate-800 h-1 mt-1 rounded-full"><div className="w-[80%] bg-green-500 h-full"></div></div>
                     </div>
                 </SciFiCard>
                 <SciFiCard className="border-slate-800 bg-slate-900/20" noPadding>
                     <div className="flex flex-col items-center justify-center h-full p-2">
                         <span className="text-[10px] text-slate-500 uppercase">Thrust</span>
                         <span className="text-xl font-mono font-bold text-white">12,500 kN</span>
                         <div className="w-full bg-slate-800 h-1 mt-1 rounded-full"><div className="w-[90%] bg-amber-500 h-full"></div></div>
                     </div>
                 </SciFiCard>
                 <div className="flex flex-col gap-2">
                     <button className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-white flex items-center justify-center gap-2 transition-colors">
                         <Eye size={14} /> Switch Cam
                     </button>
                     <button className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-white flex items-center justify-center gap-2 transition-colors">
                         <RefreshCw size={14} /> Reset Sensors
                     </button>
                 </div>
             </div>

         </div>

         {/* RIGHT: AI Brain & Logs */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
             
             {/* Operator Console */}
             <RemoteController active={manualMode} />

             {/* AI Reasoning Stream */}
             <SciFiCard title="AI 决策思维链 (Reasoning)" subtitle="LOG" className="flex-1 border-indigo-900/30">
                 <div className="h-full flex flex-col">
                     <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-black/40 rounded border border-slate-800/50 mb-2">
                         <AIReasoningLog />
                     </div>
                     
                     <div className="p-2 bg-indigo-900/20 border border-indigo-500/20 rounded text-xs text-indigo-200">
                         <div className="flex items-center gap-2 font-bold mb-1">
                             <BrainCircuit size={14} /> Recommended Action
                         </div>
                         Stop advance immediately. Perform visual inspection of Sector 4.
                     </div>
                 </div>
             </SciFiCard>

             {/* System Terminal */}
             <SciFiCard title="系统指令终端" subtitle="CMD" className="h-[200px] border-slate-800 bg-[#050505]">
                 <div className="h-full flex flex-col font-mono text-[10px] p-2 overflow-hidden">
                     <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                         {SYSTEM_LOGS.map((log, i) => (
                             <div key={i} className="flex gap-2">
                                 <span className="text-slate-500">[{log.time}]</span>
                                 <span className={log.status === 'OK' ? 'text-green-500' : 'text-yellow-500'}>{log.cmd}</span>
                                 <span className="text-slate-300">{log.response}</span>
                             </div>
                         ))}
                     </div>
                     <div className="mt-2 flex items-center gap-2 border-t border-slate-800 pt-1">
                         <span className="text-green-500">{'>'}</span>
                         <input className="bg-transparent border-none outline-none text-white w-full" placeholder="Enter command..." />
                     </div>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
