
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Cpu, Search, Calendar, Clock, MapPin, 
  AlertCircle, CheckCircle2, User, Zap, 
  ArrowRight, Radio, Server, Filter,
  GitPullRequest, Activity, Phone
} from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';

// --- Types ---

type Priority = 'Critical' | 'High' | 'Medium';
type RequestStatus = 'Pending' | 'Matching' | 'Scheduled' | 'In-Progress';

interface ServiceRequest {
  id: string;
  customer: string;
  equipment: string;
  issue: string;
  priority: Priority;
  location: string;
  created: string;
  tags: string[];
  requiredSkills: string[];
  status: RequestStatus;
}

interface ExpertCandidate {
  id: string;
  name: string;
  title: string;
  matchScore: number; // 0-100
  distance: number; // Virtual distance or network latency
  availability: 'Available' | 'Busy' | 'Offline';
  skills: { name: string; score: number }[]; // For Radar
  costRate: string;
}

interface TimeSlot {
  time: string;
  status: 'Free' | 'Booked' | 'OnCall';
  label?: string;
}

// --- Mock Data ---

const REQUEST_QUEUE: ServiceRequest[] = [
  { 
    id: 'REQ-2024-089', customer: 'Shanghai Heavy Ind.', equipment: 'Gas Turbine GT-101', 
    issue: 'Abnormal Vibration Spectrum', priority: 'Critical', location: 'Shanghai', 
    created: '10 mins ago', tags: ['Vibration', 'Rotating'], status: 'Pending',
    requiredSkills: ['Vibration Analysis', 'Gas Turbine']
  },
  { 
    id: 'REQ-2024-090', customer: 'Pacific Power', equipment: 'Substation Transformer', 
    issue: 'Oil Temp High Warning', priority: 'High', location: 'Beijing', 
    created: '25 mins ago', tags: ['Thermal', 'High Voltage'], status: 'Pending',
    requiredSkills: ['Electrical', 'Thermal Imaging']
  },
  { 
    id: 'REQ-2024-091', customer: 'AutoWorks GmbH', equipment: 'Robotic Arm K-Series', 
    issue: 'Calibration Drift', priority: 'Medium', location: 'Shenzhen', 
    created: '1 hour ago', tags: ['Robotics', 'Control'], status: 'Pending',
    requiredSkills: ['PLC Programming', 'Mechanical']
  },
];

const EXPERT_CANDIDATES: ExpertCandidate[] = [
  {
    id: 'EXP-001', name: 'Dr. Zhang Wei', title: 'Senior Propulsion Engineer',
    matchScore: 98, distance: 5, availability: 'Available', costRate: '¥1200/h',
    skills: [
      { name: 'Vibration', score: 95 },
      { name: 'Thermal', score: 80 },
      { name: 'Control', score: 60 },
      { name: 'Mech', score: 90 },
      { name: 'Elec', score: 70 },
    ]
  },
  {
    id: 'EXP-005', name: 'Li Qiang', title: 'Rotating Mach. Specialist',
    matchScore: 85, distance: 12, availability: 'Busy', costRate: '¥800/h',
    skills: [
      { name: 'Vibration', score: 85 },
      { name: 'Thermal', score: 60 },
      { name: 'Control', score: 75 },
      { name: 'Mech', score: 88 },
      { name: 'Elec', score: 50 },
    ]
  },
  {
    id: 'EXP-012', name: 'Sarah Chen', title: 'System Analyst',
    matchScore: 62, distance: 45, availability: 'Available', costRate: '¥600/h',
    skills: [
      { name: 'Vibration', score: 40 },
      { name: 'Thermal', score: 50 },
      { name: 'Control', score: 95 },
      { name: 'Mech', score: 30 },
      { name: 'Elec', score: 85 },
    ]
  },
];

const SCHEDULE_TIMELINE: TimeSlot[] = [
  { time: '08:00', status: 'Booked', label: 'REQ-2024-082' },
  { time: '09:00', status: 'Booked', label: 'REQ-2024-085' },
  { time: '10:00', status: 'Free' },
  { time: '11:00', status: 'Free' },
  { time: '12:00', status: 'OnCall' },
  { time: '13:00', status: 'Booked', label: 'Internal Meeting' },
  { time: '14:00', status: 'Free' },
  { time: '15:00', status: 'Free' },
  { time: '16:00', status: 'Free' },
];

const LOAD_DATA = Array.from({length: 24}, (_, i) => ({
  hour: i,
  load: Math.floor(Math.random() * 80) + 20
}));

// --- Helper Components ---

const PriorityBadge = ({ p }: { p: Priority }) => {
  const styles = {
    'Critical': 'bg-red-500 text-white shadow-[0_0_10px_#ef4444] animate-pulse',
    'High': 'bg-orange-500 text-white',
    'Medium': 'bg-blue-500 text-white',
  }[p];
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${styles}`}>{p}</span>;
};

const AvailabilityDot = ({ status }: { status: string }) => {
  const color = status === 'Available' ? 'bg-green-500' : status === 'Busy' ? 'bg-red-500' : 'bg-slate-500';
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${color} shadow-[0_0_5px_currentColor]`}></div>
      <span className="text-[10px] text-slate-400 uppercase">{status}</span>
    </div>
  );
};

export const RemoteExpertMatchingView: React.FC = () => {
  const [selectedReqId, setSelectedReqId] = useState(REQUEST_QUEUE[0].id);
  const [selectedExpertId, setSelectedExpertId] = useState(EXPERT_CANDIDATES[0].id);
  const [scanning, setScanning] = useState(false);

  const activeReq = REQUEST_QUEUE.find(r => r.id === selectedReqId) || REQUEST_QUEUE[0];
  const activeExpert = EXPERT_CANDIDATES.find(e => e.id === selectedExpertId) || EXPERT_CANDIDATES[0];

  useEffect(() => {
    // Simulate scan effect when request changes
    setScanning(true);
    const timer = setTimeout(() => setScanning(false), 800);
    return () => clearTimeout(timer);
  }, [selectedReqId]);

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Command Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#051119] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Cpu size={14} className="animate-pulse" /> AI Dispatch Center
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             智能专家 <span className="text-cyan-500">匹配与调度引擎</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Avg Match Time</div>
                <div className="text-xl font-mono font-bold text-cyan-400">12.5s</div>
             </div>
             <div className="h-8 w-px bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Expert Utilization</div>
                <div className="text-xl font-mono font-bold text-green-400">84%</div>
             </div>
             <div className="h-8 w-px bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Pending Queue</div>
                <div className="text-xl font-mono font-bold text-orange-500">14</div>
             </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT: Incoming Request Stream */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-700">
               <span className="text-xs font-bold text-slate-300 flex items-center gap-2"><Radio size={14} className="text-red-500 animate-pulse"/> Live Stream</span>
               <Filter size={14} className="text-slate-500 cursor-pointer hover:text-white" />
           </div>

           <div className="flex flex-col gap-3">
               {REQUEST_QUEUE.map(req => (
                   <div 
                     key={req.id}
                     onClick={() => { setSelectedReqId(req.id); setSelectedExpertId(EXPERT_CANDIDATES[0].id); }}
                     className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 relative group
                        ${selectedReqId === req.id 
                            ? 'bg-cyan-950/40 border-cyan-500 shadow-[inset_4px_0_0_#0ea5e9]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-mono text-slate-500">{req.id}</span>
                           <span className="text-[10px] text-slate-400">{req.created}</span>
                       </div>
                       <h3 className="font-bold text-sm text-white mb-1 line-clamp-1">{req.issue}</h3>
                       <div className="text-xs text-slate-400 mb-3">{req.customer}</div>
                       
                       <div className="flex justify-between items-center">
                           <div className="flex gap-1">
                               {req.tags.map(tag => (
                                   <span key={tag} className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700">
                                       {tag}
                                   </span>
                               ))}
                           </div>
                           <PriorityBadge p={req.priority} />
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER: The Neural Matching Core */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
           
           {/* 1. Visual Matching Engine */}
           <SciFiCard title="AI 神经匹配运算 (Neural Matching)" subtitle="PROCESSING" className="h-[400px] border-cyan-900/50 bg-[#020408]" noPadding>
               <div className="relative w-full h-full flex flex-col items-center justify-center p-4 overflow-hidden">
                   
                   {/* Background Effects */}
                   <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                       backgroundImage: 'radial-gradient(circle at center, #0ea5e9 1px, transparent 1px)',
                       backgroundSize: '30px 30px'
                   }}></div>
                   
                   {/* Scanning Line */}
                   {scanning && (
                       <div className="absolute top-0 w-full h-1 bg-cyan-400 shadow-[0_0_20px_#0ea5e9] animate-[scan_1s_ease-in-out]"></div>
                   )}

                   <div className="flex w-full h-full items-center justify-between gap-8 relative z-10">
                       
                       {/* Left Node: The Problem */}
                       <div className="w-1/3 h-full flex flex-col justify-center items-center gap-4">
                           <div className="w-32 h-32 rounded-full border-4 border-red-500/50 flex flex-col items-center justify-center bg-red-900/10 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse-slow">
                               <AlertCircle size={40} className="text-red-500 mb-2" />
                               <div className="text-xs font-bold text-red-200">PROBLEM</div>
                           </div>
                           <div className="text-center">
                               <div className="text-sm font-bold text-white">{activeReq.equipment}</div>
                               <div className="text-xs text-slate-400 mt-1">{activeReq.issue}</div>
                           </div>
                           <div className="flex flex-wrap justify-center gap-2 mt-2">
                               {activeReq.requiredSkills.map(s => (
                                   <span key={s} className="text-[10px] text-cyan-300 border border-cyan-800 px-2 py-1 rounded bg-cyan-900/20">
                                       Req: {s}
                                   </span>
                               ))}
                           </div>
                       </div>

                       {/* Center: The Match Score */}
                       <div className="flex-1 flex flex-col items-center justify-center">
                           <div className="relative">
                               {/* Connecting Lines (Simulated SVG) */}
                               <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] -z-10 pointer-events-none">
                                   <path d="M0,100 Q100,100 200,100 T400,100" fill="none" stroke={scanning ? '#0ea5e9' : '#334155'} strokeWidth="2" strokeDasharray="5 5" className={scanning ? 'animate-dash' : ''} />
                               </svg>

                               <div className="w-24 h-24 rounded-full bg-black border-2 border-cyan-500 flex items-center justify-center shadow-[0_0_40px_#0ea5e9]">
                                   <div className="text-center">
                                       <div className="text-3xl font-bold text-white tracking-tighter">{activeExpert.matchScore}%</div>
                                       <div className="text-[8px] text-cyan-400 uppercase tracking-widest">Match</div>
                                   </div>
                               </div>
                           </div>
                           <div className="mt-8 w-full max-w-xs">
                               <div className="flex justify-between text-xs text-slate-400 mb-1">
                                   <span>Skill Alignment</span>
                                   <span className="text-white">High</span>
                               </div>
                               <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-2">
                                   <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400" style={{width: '95%'}}></div>
                               </div>
                               <div className="flex justify-between text-xs text-slate-400 mb-1">
                                   <span>Availability</span>
                                   <span className="text-white">Immediate</span>
                               </div>
                               <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                   <div className="h-full bg-green-500" style={{width: '100%'}}></div>
                               </div>
                           </div>
                       </div>

                       {/* Right Node: The Expert */}
                       <div className="w-1/3 h-full flex flex-col justify-center items-center gap-4">
                           <div className="w-32 h-32 rounded-full border-4 border-green-500/50 flex flex-col items-center justify-center bg-green-900/10 shadow-[0_0_30px_rgba(34,197,94,0.2)] relative overflow-hidden">
                               <div className="absolute inset-0 flex items-center justify-center">
                                   <User size={48} className="text-green-400" />
                               </div>
                               {/* Scanning Ring */}
                               <div className="absolute inset-0 border-t-2 border-green-400 rounded-full animate-spin"></div>
                           </div>
                           <div className="text-center">
                               <div className="text-sm font-bold text-white">{activeExpert.name}</div>
                               <div className="text-xs text-slate-400 mt-1">{activeExpert.title}</div>
                           </div>
                           <div className="h-24 w-full mt-2">
                               <ResponsiveContainer width="100%" height="100%">
                                   <RadarChart cx="50%" cy="50%" outerRadius="80%" data={activeExpert.skills}>
                                       <PolarGrid stroke="#334155" />
                                       <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 8 }} />
                                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                       <Radar name="Skills" dataKey="score" stroke="#10b981" strokeWidth={1} fill="#10b981" fillOpacity={0.4} />
                                   </RadarChart>
                               </ResponsiveContainer>
                           </div>
                       </div>

                   </div>
               </div>
           </SciFiCard>

           {/* 2. Scheduler & Capacity */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
               
               {/* Gantt / Timeline */}
               <SciFiCard title="专家实时排班 (Live Schedule)" subtitle={activeExpert.name} className="lg:col-span-2 border-slate-800">
                   <div className="flex flex-col h-full gap-4">
                       <div className="flex justify-between items-center">
                           <div className="flex gap-4 text-xs">
                               <span className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-800 border border-slate-600 rounded"></div> Free</span>
                               <span className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-900/50 border border-indigo-500 rounded"></div> Booked</span>
                               <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-900/50 border border-green-500 rounded"></div> On Call</span>
                           </div>
                           <div className="text-xs font-mono text-cyan-400">Timezone: GMT+8</div>
                       </div>
                       
                       <div className="flex-1 flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
                           {SCHEDULE_TIMELINE.map((slot, i) => (
                               <div key={i} className="flex flex-col min-w-[80px] group">
                                   <div className="text-[10px] text-slate-500 mb-1 text-center font-mono">{slot.time}</div>
                                   <div className={`flex-1 rounded border relative transition-all hover:brightness-110 cursor-pointer
                                       ${slot.status === 'Free' ? 'bg-slate-900 border-slate-700 hover:bg-slate-800' : 
                                         slot.status === 'Booked' ? 'bg-indigo-900/40 border-indigo-500/50' : 'bg-green-900/20 border-green-500/50'}
                                   `}>
                                       {slot.label && (
                                           <div className="absolute inset-0 flex items-center justify-center p-1">
                                               <span className="text-[9px] text-white font-bold truncate w-full text-center">{slot.label}</span>
                                           </div>
                                       )}
                                   </div>
                               </div>
                           ))}
                       </div>

                       <div className="flex justify-end gap-2 mt-auto">
                           <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors">
                               Check Calendar
                           </button>
                           <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded flex items-center gap-2 transition-colors shadow-lg">
                               <Calendar size={14} /> Confirm Slot
                           </button>
                       </div>
                   </div>
               </SciFiCard>

               {/* Capacity Load */}
               <SciFiCard title="平台负荷预测" subtitle="24H LOAD" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={LOAD_DATA}>
                               <defs>
                                   <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#f59e0b', fontSize: '12px'}} />
                               <Area type="monotone" dataKey="load" stroke="#f59e0b" fill="url(#colorLoad)" strokeWidth={2} name="Request Vol" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT: Candidate List */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1">
           <div className="flex justify-between items-center px-1">
               <span className="text-xs font-bold text-slate-400 uppercase">Top Recommendations</span>
               <span className="text-[10px] text-cyan-500 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-800">AI Sorted</span>
           </div>

           <div className="flex flex-col gap-3">
               {EXPERT_CANDIDATES.map((expert, i) => (
                   <div 
                     key={expert.id}
                     onClick={() => setSelectedExpertId(expert.id)}
                     className={`p-4 rounded border cursor-pointer transition-all duration-300 relative group overflow-hidden
                        ${selectedExpertId === expert.id 
                            ? 'bg-green-950/30 border-green-500/50 shadow-[inset_4px_0_0_#10b981]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-sm font-bold text-white">
                                   {expert.name.charAt(0)}
                               </div>
                               <div>
                                   <div className={`font-bold text-sm ${selectedExpertId === expert.id ? 'text-white' : 'text-slate-200'}`}>
                                       {expert.name}
                                   </div>
                                   <div className="text-[10px] text-slate-500">{expert.title}</div>
                               </div>
                           </div>
                           <div className="text-right">
                               <div className="text-xl font-bold text-green-400 font-mono">{expert.matchScore}%</div>
                               <div className="text-[9px] text-slate-500 uppercase">Match</div>
                           </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/50 text-[10px] text-slate-400">
                           <div className="flex flex-col">
                               <span className="uppercase text-[8px]">Availability</span>
                               <AvailabilityDot status={expert.availability} />
                           </div>
                           <div className="flex flex-col text-right">
                               <span className="uppercase text-[8px]">Rate</span>
                               <span className="font-mono text-white">{expert.costRate}</span>
                           </div>
                       </div>

                       {selectedExpertId === expert.id && (
                           <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2">
                               <button className="flex-1 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded flex items-center justify-center gap-1 transition-colors shadow-lg">
                                   <Phone size={12} /> Connect
                               </button>
                               <button className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 flex items-center justify-center gap-1 transition-colors">
                                   Profile
                               </button>
                           </div>
                       )}
                   </div>
               ))}
           </div>
           
           <div className="mt-auto p-4 bg-indigo-900/10 border border-indigo-500/20 rounded">
               <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold mb-2">
                   <GitPullRequest size={14} /> Cross-Domain Expert?
               </div>
               <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                   Complex issues may require multi-expert consultation. Enable "Panel Mode" to invite multiple specialists.
               </p>
               <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs rounded border border-indigo-500/30 transition-colors">
                   Enable Panel Mode
               </button>
           </div>
        </div>

      </div>
    </div>
  );
};
