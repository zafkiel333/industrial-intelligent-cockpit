
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Siren, Flame, Biohazard, Wind, Activity, 
  Radio, Send, MapPin, Crosshair, ShieldAlert,
  Users, Battery, Zap, AlertTriangle, FileCode,
  ArrowRight, Download, UploadCloud, Lock, Unlock,
  Thermometer, Timer, LifeBuoy, Layers, Clock, Info,
  CheckCircle2, RefreshCw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, RadialBarChart, RadialBar, Legend
} from 'recharts';

// --- Types ---

interface HazardData {
  time: string;
  h2s: number; // H2S 浓度 ppm
  temp: number; // 温度 C
  lel: number; // 爆炸下限 %
}

interface SupportPackage {
  id: string;
  type: 'Blueprint' | 'Script' | 'AR_Marker' | 'Protocol';
  name: string;
  size: string;
  status: 'Ready' | 'Deploying' | 'Deployed' | 'Failed';
  icon: any;
}

interface RescueTeamMember {
  id: string;
  name: string;
  role: string;
  bpm: number; // Heart rate
  o2: number; // Oxygen level %
  status: 'Active' | 'Warning' | 'Critical';
  loc: string;
}

// --- Mock Data ---

const INCIDENT_INFO = {
  code: 'INC-20240322-A7',
  location: '二期化工区 - 乙烯裂解炉 F-101',
  type: '高压管道泄漏 / 伴随局部火情',
  startTime: '10:42:00',
  duration: '00:18:45',
  level: 'LEVEL I (红色)',
  weather: '西北风 4级',
};

const TEAM_MEMBERS: RescueTeamMember[] = [
  { id: 'R1', name: '救援01 (队长)', role: 'Leader', bpm: 110, o2: 85, status: 'Active', loc: 'Z1-Access' },
  { id: 'R2', name: '救援02 (破拆)', role: 'Breacher', bpm: 125, o2: 78, status: 'Active', loc: 'Z1-Inner' },
  { id: 'R3', name: '救援03 (搜救)', role: 'Medic', bpm: 145, o2: 92, status: 'Warning', loc: 'Z1-Inner' },
];

const SUPPORT_PACKAGES: SupportPackage[] = [
  { id: 'PKG-01', type: 'Protocol', name: '紧急关断序列 (ESD-L2)', size: '4KB', status: 'Deployed', icon: FileCode },
  { id: 'PKG-02', type: 'Blueprint', name: 'F-101 内部管网结构图 (3D)', size: '125MB', status: 'Ready', icon: MapPin },
  { id: 'PKG-03', type: 'AR_Marker', name: '泄漏点 AR 空间标注', size: '2MB', status: 'Ready', icon: Crosshair },
  { id: 'PKG-04', type: 'Script', name: '消防机器人突入路径规划', size: '15KB', status: 'Ready', icon: Zap },
];

// --- Sub-Components ---

const HeartbeatLine = ({ rate, status }: { rate: number, status: string }) => {
  const color = status === 'Critical' ? '#ef4444' : status === 'Warning' ? '#f59e0b' : '#10b981';
  return (
    <div className="flex items-center gap-2">
      <Activity size={12} style={{color}} className="animate-pulse" />
      <span className="font-mono text-sm font-bold" style={{color}}>{rate}</span>
      <span className="text-[10px] text-slate-500">BPM</span>
    </div>
  );
};

const TacticalMap = () => (
  <div className="w-full h-full relative bg-[#050000] overflow-hidden rounded border border-red-900/30 group">
     {/* Grid & Radar Effect */}
     <div className="absolute inset-0" style={{
         backgroundImage: 'radial-gradient(rgba(220, 38, 38, 0.15) 1px, transparent 1px), linear-gradient(0deg, transparent 98%, rgba(220, 38, 38, 0.1) 100%), linear-gradient(90deg, transparent 98%, rgba(220, 38, 38, 0.1) 100%)',
         backgroundSize: '30px 30px, 100px 100px, 100px 100px'
     }}></div>
     
     {/* Rotating Radar Scan */}
     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="w-[600px] h-[600px] bg-gradient-to-t from-red-900/10 to-transparent rounded-full animate-spin origin-bottom-left" style={{clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)', animationDuration: '4s'}}></div>
     </div>

     {/* Map SVG Overlay */}
     <svg className="w-full h-full absolute inset-0">
        <defs>
            <filter id="glow-red">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
            </marker>
        </defs>

        {/* Building Outline */}
        <path d="M150,100 L450,100 L450,350 L150,350 Z" fill="none" stroke="#334155" strokeWidth="2" />
        <rect x="200" y="150" width="100" height="100" fill="none" stroke="#475569" strokeWidth="1" />
        <rect x="350" y="250" width="50" height="50" fill="none" stroke="#475569" strokeWidth="1" />
        
        {/* Hazard Zone */}
        <circle cx="250" cy="200" r="80" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1" strokeDasharray="5 5" className="animate-pulse" />
        <text x="250" y="110" fill="#ef4444" fontSize="10" textAnchor="middle" fontWeight="bold">DANGER ZONE</text>
        
        {/* Team Members */}
        <g transform="translate(240, 260)" className="transition-all duration-1000 ease-in-out">
            <circle r="4" fill="#3b82f6" stroke="#fff" />
            <text x="8" y="4" fill="#3b82f6" fontSize="10">R1</text>
        </g>
        <g transform="translate(280, 220)" className="transition-all duration-1000 ease-in-out">
            <circle r="4" fill="#3b82f6" stroke="#fff" />
            <text x="8" y="4" fill="#3b82f6" fontSize="10">R2</text>
        </g>
        <g transform="translate(220, 220)" className="transition-all duration-1000 ease-in-out">
            <circle r="4" fill="#f59e0b" stroke="#fff" />
            <text x="8" y="4" fill="#f59e0b" fontSize="10">R3</text>
        </g>

        {/* Assets */}
        <path d="M400,300 L350,300" stroke="#10b981" strokeWidth="2" strokeDasharray="2 2" markerEnd="url(#arrow)" />
        <text x="410" y="305" fill="#10b981" fontSize="10">Robot Entry</text>
     </svg>

     {/* Map HUD */}
     <div className="absolute top-4 left-4 flex flex-col gap-2">
         <div className="bg-red-950/80 border border-red-500/50 px-2 py-1 rounded text-red-100 text-[10px] font-mono flex items-center gap-2 shadow-[0_0_10px_rgba(220,38,38,0.5)]">
             <Radio size={12} className="animate-pulse"/> LIVE TRACKING
         </div>
     </div>
  </div>
);

export const EmergencySupportView: React.FC = () => {
  const [hazards, setHazards] = useState<HazardData[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [packages, setPackages] = useState(SUPPORT_PACKAGES);

  // Simulation
  useEffect(() => {
    // Init data
    const initData = Array.from({length: 30}, (_, i) => ({
        time: i.toString(),
        h2s: 15 + Math.random() * 5,
        temp: 350 + Math.random() * 20,
        lel: 10 + Math.random() * 2
    }));
    setHazards(initData);

    const interval = setInterval(() => {
        setHazards(prev => {
            const next = [...prev.slice(1)];
            const last = prev[prev.length - 1];
            next.push({
                time: (parseInt(last.time) + 1).toString(),
                h2s: 15 + Math.random() * 10, // Increasing danger
                temp: 350 + Math.random() * 50,
                lel: 12 + Math.random() * 5
            });
            return next;
        });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDeploy = () => {
      if(!selectedPkg) return;
      setDeploying(true);
      setTimeout(() => {
          setPackages(prev => prev.map(p => p.id === selectedPkg ? { ...p, status: 'Deployed' } : p));
          setDeploying(false);
      }, 2000);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020101] p-2">
      
      {/* 1. EMERGENCY HEADER */}
      <div className="flex justify-between items-stretch bg-gradient-to-r from-red-950/80 via-[#1a0505] to-slate-950 border-b-2 border-red-600 p-4 rounded-b-lg shadow-[0_4px_20px_rgba(220,38,38,0.3)] relative overflow-hidden">
         {/* Animated Striped Background */}
         <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
             backgroundImage: 'repeating-linear-gradient(45deg, #000, #000 10px, #ef4444 10px, #ef4444 20px)'
         }}></div>

         <div className="relative z-10 flex items-center gap-6">
             <div className="w-16 h-16 bg-red-600/20 border-2 border-red-500 rounded-lg flex items-center justify-center animate-pulse">
                 <Siren size={32} className="text-red-500" />
             </div>
             <div>
                 <div className="flex items-center gap-3 mb-1">
                     <span className="bg-red-600 text-white px-3 py-0.5 rounded text-xs font-bold animate-pulse">EMERGENCY</span>
                     <span className="text-red-400 font-mono text-sm tracking-wider">{INCIDENT_INFO.code}</span>
                 </div>
                 <h1 className="text-3xl font-bold text-white tracking-tight text-shadow-red">{INCIDENT_INFO.type}</h1>
                 <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                     <span className="flex items-center gap-1"><MapPin size={12}/> {INCIDENT_INFO.location}</span>
                     <span className="flex items-center gap-1"><Clock size={12}/> T-Plus: <span className="text-white font-mono font-bold text-lg">{INCIDENT_INFO.duration}</span></span>
                 </div>
             </div>
         </div>

         <div className="relative z-10 flex gap-4">
             <div className="flex flex-col items-end justify-center px-4 border-r border-red-900/50">
                 <span className="text-[10px] text-red-300 uppercase">Threat Level</span>
                 <span className="text-2xl font-black text-red-500 tracking-widest">CRITICAL</span>
             </div>
             <div className="flex flex-col items-end justify-center pl-2">
                 <span className="text-[10px] text-slate-400 uppercase">On-Site Teams</span>
                 <div className="flex -space-x-2 mt-1">
                     <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-black flex items-center justify-center text-xs font-bold">A</div>
                     <div className="w-8 h-8 rounded-full bg-amber-600 border-2 border-black flex items-center justify-center text-xs font-bold">B</div>
                     <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-black flex items-center justify-center text-xs font-bold">+2</div>
                 </div>
             </div>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 overflow-hidden px-2">
         
         {/* LEFT: Situation Awareness (Telemetry & Video) */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
             
             {/* Hazard Monitor */}
             <SciFiCard title="环境危害监测 (HazMat)" subtitle="LIVE" className="border-red-900/40 bg-[#0a0202]">
                 <div className="flex flex-col gap-4">
                     <div className="flex items-center justify-between p-2 bg-red-950/20 border border-red-900/50 rounded">
                         <div className="flex items-center gap-2">
                             <Biohazard size={18} className="text-yellow-500" />
                             <div>
                                 <div className="text-xs text-slate-300">H2S (硫化氢)</div>
                                 <div className="text-xl font-mono font-bold text-yellow-500">24 ppm</div>
                             </div>
                         </div>
                         <div className="text-[10px] text-red-400 font-bold animate-pulse">HIGH</div>
                     </div>
                     
                     <div className="h-24 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={hazards}>
                                 <defs>
                                     <linearGradient id="colorH2s" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                                         <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                     </linearGradient>
                                 </defs>
                                 <XAxis hide />
                                 <YAxis hide domain={[0, 40]} />
                                 <Area type="monotone" dataKey="h2s" stroke="#ef4444" fill="url(#colorH2s)" strokeWidth={2} isAnimationActive={false} />
                             </AreaChart>
                         </ResponsiveContainer>
                     </div>

                     <div className="grid grid-cols-2 gap-2">
                         <div className="p-2 bg-slate-900/50 border border-slate-800 rounded flex items-center gap-2">
                             <Thermometer size={14} className="text-orange-500"/>
                             <div>
                                 <div className="text-[9px] text-slate-500">Core Temp</div>
                                 <div className="text-sm font-bold text-white">385°C</div>
                             </div>
                         </div>
                         <div className="p-2 bg-slate-900/50 border border-slate-800 rounded flex items-center gap-2">
                             <Wind size={14} className="text-blue-500"/>
                             <div>
                                 <div className="text-[9px] text-slate-500">Pressure</div>
                                 <div className="text-sm font-bold text-white">4.2 MPa</div>
                             </div>
                         </div>
                     </div>
                 </div>
             </SciFiCard>

             {/* Team Vitals */}
             <SciFiCard title="救援人员体征" subtitle="BIO-METRICS" className="flex-1 border-slate-800">
                 <div className="flex flex-col gap-3">
                     {TEAM_MEMBERS.map(member => (
                         <div key={member.id} className="p-3 bg-slate-900/40 border border-slate-800 rounded flex flex-col gap-2">
                             <div className="flex justify-between items-center">
                                 <div className="flex items-center gap-2">
                                     <span className="text-xs font-bold text-slate-200">{member.name}</span>
                                     <span className="text-[9px] bg-slate-800 px-1 rounded text-slate-400">{member.loc}</span>
                                 </div>
                                 <span className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                             </div>
                             <div className="grid grid-cols-2 gap-2">
                                 <HeartbeatLine rate={member.bpm} status={member.status} />
                                 <div className="flex items-center gap-2">
                                     <Wind size={12} className="text-blue-400" />
                                     <span className="font-mono text-sm font-bold text-blue-200">{member.o2}% O2</span>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>

         </div>

         {/* CENTER: Tactical Map (The Field) */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-hidden">
             
             {/* Map Container */}
             <div className="flex-1 relative rounded-lg border border-slate-700 shadow-2xl overflow-hidden">
                 <TacticalMap />
                 
                 {/* Map Overlays */}
                 <div className="absolute top-4 right-4 flex flex-col gap-2">
                     <button className="bg-black/60 hover:bg-slate-800 text-white p-2 rounded border border-slate-600 transition-colors">
                         <Layers size={18} />
                     </button>
                     <button className="bg-black/60 hover:bg-slate-800 text-white p-2 rounded border border-slate-600 transition-colors">
                         <ShieldAlert size={18} className="text-red-500" />
                     </button>
                 </div>

                 {/* Bottom Status Bar inside Map */}
                 <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-4 flex justify-between items-end">
                     <div className="flex gap-4">
                         <div className="text-xs">
                             <span className="text-slate-500 block">Drone-A</span>
                             <span className="text-green-400 font-mono">ONLINE (85%)</span>
                         </div>
                         <div className="text-xs">
                             <span className="text-slate-500 block">Robot-X</span>
                             <span className="text-green-400 font-mono">ONLINE (92%)</span>
                         </div>
                     </div>
                     <div className="text-right">
                         <span className="text-[10px] text-red-500 animate-pulse block">CONNECTION SECURE (AES-256)</span>
                     </div>
                 </div>
             </div>

             {/* Live Message/Log */}
             <div className="h-40 bg-[#080a10] border border-slate-800 rounded p-3 overflow-y-auto font-mono text-xs custom-scrollbar">
                 <div className="text-slate-500 mb-1 border-b border-slate-800 pb-1">COMMAND LOG STREAM</div>
                 <div className="flex flex-col gap-1">
                     <div className="text-green-400"><span className="text-slate-600">[10:42:05]</span> SYS: Uplink established with Team Alpha.</div>
                     <div className="text-cyan-400"><span className="text-slate-600">[10:42:12]</span> EXP: Dr. Zhang requested structure blueprint.</div>
                     <div className="text-red-400"><span className="text-slate-600">[10:43:55]</span> ALERT: H2S Sensor 04 triggered (High).</div>
                     <div className="text-slate-300"><span className="text-slate-600">[10:44:10]</span> CMD: Evacuation route calculated. Sent to HUD.</div>
                     <div className="text-slate-300"><span className="text-slate-600">[10:45:00]</span> R1: Visual confirmation of leak point.</div>
                 </div>
             </div>

         </div>

         {/* RIGHT: Delivery/Deployment (The Payload) */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
             
             {/* Deployment Console */}
             <SciFiCard title="战术支援交付 (Support Delivery)" subtitle="PAYLOAD" className="flex-1 border-cyan-900/50 bg-[#06080e]">
                 <div className="flex flex-col gap-4 h-full">
                     <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800">
                         <Info size={12} className="inline mr-1 text-cyan-500"/>
                         Select resources to deploy to on-site teams immediately.
                     </div>

                     <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1 max-h-[300px]">
                         {packages.map(pkg => (
                             <div 
                               key={pkg.id} 
                               onClick={() => setSelectedPkg(pkg.id)}
                               className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group overflow-hidden
                                   ${selectedPkg === pkg.id 
                                       ? 'bg-cyan-900/30 border-cyan-500 shadow-[inset_4px_0_0_#0ea5e9]' 
                                       : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'}
                                   ${pkg.status === 'Deployed' ? 'opacity-60 grayscale' : ''}
                               `}
                             >
                                 <div className="flex justify-between items-start">
                                     <div className="flex items-center gap-3">
                                         <div className={`p-2 rounded bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform ${selectedPkg === pkg.id ? 'text-cyan-400' : 'text-slate-500'}`}>
                                             <pkg.icon size={16} />
                                         </div>
                                         <div>
                                             <div className="text-xs font-bold text-white">{pkg.name}</div>
                                             <div className="text-[10px] text-slate-500">{pkg.type} • {pkg.size}</div>
                                         </div>
                                     </div>
                                     {pkg.status === 'Deployed' && <CheckCircle2 size={14} className="text-green-500"/>}
                                 </div>
                             </div>
                         ))}
                     </div>

                     {/* The Big Button */}
                     <div className="mt-auto pt-4 border-t border-slate-800">
                         <div className="flex justify-between text-[10px] text-slate-500 mb-2">
                             <span>Target: All Active Units</span>
                             <span>Bandwidth: High</span>
                         </div>
                         <button 
                           onClick={handleDeploy}
                           disabled={!selectedPkg || deploying || packages.find(p=>p.id===selectedPkg)?.status === 'Deployed'}
                           className={`w-full py-4 text-sm font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-3 relative overflow-hidden
                               ${deploying 
                                   ? 'bg-cyan-900 text-cyan-200 cursor-wait' 
                                   : (!selectedPkg || packages.find(p=>p.id===selectedPkg)?.status === 'Deployed') 
                                       ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                       : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]'}
                           `}
                         >
                             {deploying ? (
                                 <>
                                     <RefreshCw size={16} className="animate-spin" /> UPLOADING...
                                 </>
                             ) : (
                                 <>
                                     <UploadCloud size={18} /> DEPLOY SUPPORT
                                 </>
                             )}
                             
                             {/* Scan line effect on button */}
                             {!deploying && selectedPkg && <div className="absolute top-0 left-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-[shine_2s_infinite]"></div>}
                         </button>
                     </div>
                 </div>
             </SciFiCard>

             {/* Protocol Status */}
             <SciFiCard title="应急预案执行度" className="border-slate-800">
                 <div className="flex items-center gap-4">
                     <div className="relative w-16 h-16">
                         <svg className="w-full h-full transform -rotate-90">
                             <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="6" fill="none" />
                             <circle cx="32" cy="32" r="28" stroke="#f59e0b" strokeWidth="6" fill="none" strokeDasharray="175" strokeDashoffset="60" />
                         </svg>
                         <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">65%</div>
                     </div>
                     <div className="flex-1 space-y-2">
                         <div className="flex justify-between text-xs">
                             <span className="text-slate-400">Step 3/5</span>
                             <span className="text-yellow-400">In Progress</span>
                         </div>
                         <div className="text-[10px] text-slate-300 bg-slate-900 p-1.5 rounded border border-slate-800">
                             Current: Isolate Feed Valve V-204
                         </div>
                     </div>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
