
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/underwater-robot/ThreeScene';
import { RobotSimState } from '../../components/knowledge-manage/underwater-robot/three-types';
import { 
  Anchor, Activity, Camera, Aperture, 
  Map as MapIcon, Database, Search, 
  BatteryCharging, Signal, Compass,
  AlertTriangle, CheckCircle2, Waves, ScanLine
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- MOCK DATA ---

const DEPTH_PROFILE = Array.from({length: 40}, (_, i) => ({
    time: i,
    depth: -5 - Math.random() * 2 - (i > 10 ? i*0.5 : 0), // Going deeper
    temp: 14 - i * 0.1
}));

const DEFECT_TYPES = [
    { id: 'D-001', type: '裂缝 (Crack)', count: 12, risk: 'High', color: '#ef4444' },
    { id: 'D-002', type: '磨损 (Abrasion)', count: 45, risk: 'Med', color: '#f59e0b' },
    { id: 'D-003', type: '气蚀 (Cavitation)', count: 8, risk: 'High', color: '#ef4444' },
    { id: 'D-004', type: '淤积 (Sediment)', count: 2, risk: 'Low', color: '#10b981' },
];

const ROBOT_STATS = [
  { subject: '推进系统', A: 95, fullMark: 100 },
  { subject: '视觉成像', A: 88, fullMark: 100 },
  { subject: '声呐探测', A: 92, fullMark: 100 },
  { subject: '通信链路', A: 85, fullMark: 100 },
  { subject: '机械臂', A: 90, fullMark: 100 },
];

// Sonar Radar Component
const SonarRadar = () => (
    <div className="relative w-full h-48 bg-[#001e36] rounded-full border-2 border-[#004466] overflow-hidden flex items-center justify-center">
        {/* Grid */}
        <div className="absolute inset-0 border border-[#004466] rounded-full scale-75"></div>
        <div className="absolute inset-0 border border-[#004466] rounded-full scale-50"></div>
        <div className="absolute inset-0 border border-[#004466] rounded-full scale-25"></div>
        <div className="absolute w-full h-[1px] bg-[#004466]"></div>
        <div className="absolute h-full w-[1px] bg-[#004466]"></div>
        
        {/* Sweep */}
        <div className="absolute w-1/2 h-1/2 top-0 right-0 origin-bottom-left bg-gradient-to-t from-transparent to-[#0ea5e9]/50 animate-spin" style={{animationDuration: '2s'}}></div>
        
        {/* Blips */}
        <div className="absolute top-[30%] right-[30%] w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-[40%] left-[20%] w-1.5 h-1.5 bg-red-400 rounded-full opacity-60"></div>
    </div>
);

export const UnderwaterRobotView: React.FC = () => {
  const [simState, setSimState] = useState<RobotSimState>('IDLE');
  const [depth, setDepth] = useState(12.4);
  const [logs, setLogs] = useState<string[]>(['[SYS] ROV-Titan 系统自检完成', '[LINK] 脐带缆通讯正常', '[PWR] 电池电量 94%']);

  useEffect(() => {
    // Sim loop
    const interval = setInterval(() => {
        if (simState === 'DIVING') setDepth(d => d + 0.1);
        if (simState === 'ASCENDING') setDepth(d => Math.max(0, d - 0.2));
        
        if (Math.random() > 0.95 && simState === 'SCANNING') {
            const faults = ['检测到混凝土表层剥落', '发现微小裂纹 (L=15cm)', '钢筋外露锈蚀警报'];
            const msg = faults[Math.floor(Math.random() * faults.length)];
            setLogs(prev => [`[ALARM] ${msg}`, ...prev.slice(0, 5)]);
        }
    }, 500);
    return () => clearInterval(interval);
  }, [simState]);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-cyan-50 bg-[#000810] p-2 relative overflow-hidden">
      
      {/* Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#001e36_0%,_#000000_100%)] pointer-events-none"></div>
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'url(https://www.transparenttextures.com/patterns/diagmonds-light.png)'}}></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-[#001529]/80 border border-cyan-900/50 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-cyan-900/30 border-2 border-cyan-500 rounded-full flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-cyan-500/10 animate-pulse rounded-full"></div>
             <Aperture size={28} className="text-cyan-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Waves size={12} /> Subsea Inspection Unit
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               水工建筑物 <span className="text-cyan-500 italic">水下机器人检测图鉴</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Current Depth</div>
                <div className="text-2xl font-mono font-black text-white">{depth.toFixed(1)} <span className="text-sm font-normal text-slate-500">m</span></div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Mission Time</div>
                <div className="text-2xl font-mono font-black text-cyan-400">00:42:15</div>
             </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 z-10">
        
        {/* --- LEFT: ROV Telemetry & Control --- */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           {/* ROV Status */}
           <SciFiCard title="ROV 状态监测" subtitle="TITAN-X" className="border-cyan-900/40 bg-[#00101f]/90">
              <div className="flex flex-col gap-4 py-2">
                  <div className="flex justify-between items-center bg-[#002233] p-2 rounded border border-cyan-900">
                      <span className="text-xs text-slate-400 flex items-center gap-2"><BatteryCharging size={14}/> Battery</span>
                      <span className="text-green-400 font-mono font-bold">94%</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#002233] p-2 rounded border border-cyan-900">
                      <span className="text-xs text-slate-400 flex items-center gap-2"><Signal size={14}/> Signal</span>
                      <span className="text-cyan-400 font-mono font-bold">-45 dBm</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#002233] p-2 rounded border border-cyan-900">
                      <span className="text-xs text-slate-400 flex items-center gap-2"><Compass size={14}/> Heading</span>
                      <span className="text-white font-mono font-bold">124° NW</span>
                  </div>
              </div>
           </SciFiCard>

           {/* Sonar View */}
           <SciFiCard title="声呐扫描成像" subtitle="SONAR" className="border-cyan-900/40">
               <div className="flex flex-col items-center gap-2">
                   <SonarRadar />
                   <div className="text-[10px] text-slate-500 text-center w-full mt-2">
                       Mode: Sector Scan (180°) | Range: 20m
                   </div>
               </div>
           </SciFiCard>

           {/* Control Pad */}
           <div className="bg-[#00101f] border border-cyan-900/40 rounded p-3">
               <div className="text-[10px] text-cyan-600 font-bold mb-2 uppercase">Command Override</div>
               <div className="grid grid-cols-2 gap-2">
                   <button onClick={() => setSimState('SCANNING')} className={`p-2 text-xs border rounded transition-all ${simState === 'SCANNING' ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-transparent text-cyan-600 border-cyan-900 hover:border-cyan-600'}`}>
                       开始扫描
                   </button>
                   <button onClick={() => setSimState('INSPECTING')} className={`p-2 text-xs border rounded transition-all ${simState === 'INSPECTING' ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-transparent text-cyan-600 border-cyan-900 hover:border-cyan-600'}`}>
                       定点详查
                   </button>
                   <button onClick={() => setSimState('DIVING')} className="p-2 text-xs border border-cyan-900 rounded text-cyan-600 hover:border-cyan-600 hover:text-cyan-400">
                       下潜 (Dive)
                   </button>
                   <button onClick={() => setSimState('ASCENDING')} className="p-2 text-xs border border-cyan-900 rounded text-cyan-600 hover:border-cyan-600 hover:text-cyan-400">
                       上浮 (Surface)
                   </button>
               </div>
           </div>

        </div>

        {/* --- CENTER: 3D Visualization --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-cyan-900/30 rounded-lg overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene state={simState} />

               {/* Overlay HUD */}
               <div className="absolute top-4 left-4 z-20 pointer-events-none">
                   <div className="bg-[#001529]/80 backdrop-blur border border-cyan-500/30 p-3 rounded-sm flex flex-col border-l-4 border-l-cyan-500">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Activity size={10}/> Robot State
                       </div>
                       <div className="text-xl font-black text-white">{simState}</div>
                   </div>
               </div>

               {/* Crosshair */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-cyan-500/20 rounded-full flex items-center justify-center pointer-events-none">
                   <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                   <div className="absolute top-0 w-[1px] h-4 bg-cyan-500/50"></div>
                   <div className="absolute bottom-0 w-[1px] h-4 bg-cyan-500/50"></div>
                   <div className="absolute left-0 h-[1px] w-4 bg-cyan-500/50"></div>
                   <div className="absolute right-0 h-[1px] w-4 bg-cyan-500/50"></div>
               </div>
           </div>

           {/* Depth Chart */}
           <div className="h-[180px] bg-[#00101f]/80 border border-cyan-900/40 rounded-lg p-3 overflow-hidden">
               <div className="text-[10px] text-cyan-600 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>Mission Depth Profile</span>
                   <span>Water Temp: 12°C</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={DEPTH_PROFILE}>
                       <defs>
                           <linearGradient id="depthGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis stroke="#0ea5e9" tick={{fontSize: 10}} width={30} />
                       <Tooltip contentStyle={{backgroundColor: '#001e36', borderColor: '#0ea5e9'}} />
                       <Area type="monotone" dataKey="depth" stroke="#0ea5e9" fill="url(#depthGrad)" strokeWidth={2} />
                   </AreaChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* --- RIGHT: Knowledge & Logs --- */}
        <div className="w-[320px] flex flex-col gap-4">
           
           <SciFiCard title="缺陷图鉴库" subtitle="DEFECT ATLAS" className="flex-1 border-cyan-900/40 bg-[#00101f]/90">
               <div className="flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar pr-1">
                   {DEFECT_TYPES.map((d, i) => (
                       <div key={i} className="bg-[#002233]/60 p-3 rounded border border-cyan-900/50 flex flex-col gap-2 hover:border-cyan-500/50 transition-colors cursor-pointer group">
                           <div className="flex justify-between items-center">
                               <span className="text-xs font-bold text-white group-hover:text-cyan-400">{d.type}</span>
                               <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${d.risk === 'High' ? 'bg-red-900/40 text-red-400' : d.risk === 'Med' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-green-900/40 text-green-400'}`}>
                                   {d.risk}
                               </span>
                           </div>
                           <div className="flex items-center gap-2">
                               <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                   <div className="h-full rounded-full" style={{width: `${(d.count/50)*100}%`, backgroundColor: d.color}}></div>
                               </div>
                               <span className="text-[10px] text-slate-400 font-mono">{d.count} Cases</span>
                           </div>
                           {/* Placeholder for captured image */}
                           <div className="h-16 w-full bg-black/40 rounded border border-dashed border-slate-700 flex items-center justify-center text-[9px] text-slate-600">
                               <Camera size={14} className="mb-1" />
                               No Preview
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <div className="h-[200px] bg-[#00101f] border border-cyan-900/40 rounded p-3 flex flex-col">
               <div className="text-[10px] text-cyan-600 font-bold mb-2 uppercase border-b border-cyan-900/30 pb-1">System Log</div>
               <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-1.5 custom-scrollbar">
                   {logs.map((log, i) => (
                       <div key={i} className={`flex gap-2 ${log.includes('ALARM') ? 'text-red-400' : 'text-slate-400'}`}>
                           <span className="opacity-50">[{i}]</span>
                           <span>{log}</span>
                       </div>
                   ))}
                   <div className="text-cyan-500 animate-pulse">_</div>
               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
