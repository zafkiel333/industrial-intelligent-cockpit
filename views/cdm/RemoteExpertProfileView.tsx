
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Users, Star, Award, Zap, Activity, 
  Search, Filter, Phone, Video, MessageSquare,
  Cpu, MapPin, Clock, Briefcase, 
  Signal, ThumbsUp, Medal, GraduationCap,
  Calendar, Shield, BrainCircuit, ShieldCheck
} from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid,
  BarChart, Bar, Cell
} from 'recharts';

// --- Types ---

interface ExpertSkill {
  subject: string;
  A: number; // Expert Score
  fullMark: number;
}

interface WorkHistory {
  month: string;
  cases: number;
  satisfaction: number;
}

interface ExpertProfile {
  id: string;
  name: string;
  title: string;
  level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5'; // L5 is highest
  status: 'Online' | 'Busy' | 'Offline';
  specialties: string[];
  location: string;
  experience: number; // Years
  rating: number; // 0-5.0
  totalCases: number;
  responseRate: string;
  skills: ExpertSkill[];
  history: WorkHistory[];
  certs: string[];
  bio: string;
  availability: number; // 0-100% capacity
}

// --- Mock Data ---

const EXPERTS: ExpertProfile[] = [
  {
    id: 'EXP-001', name: 'Dr. Zhang Wei', title: 'Chief Propulsion Specialist', level: 'L5', status: 'Online',
    specialties: ['Gas Turbines', 'Vibration Analysis', 'Thermal Dynamics'],
    location: 'Shanghai HQ', experience: 18, rating: 4.9, totalCases: 1250, responseRate: '98%',
    bio: 'Former chief engineer at State Power. Specialized in diagnosing complex rotor imbalance and blade fatigue issues.',
    certs: ['ISO Cat IV Vibration', 'Six Sigma Black Belt', 'Certified Reliability Leader'],
    availability: 85,
    skills: [
      { subject: '故障诊断', A: 98, fullMark: 100 },
      { subject: '远程指导', A: 90, fullMark: 100 },
      { subject: '理论知识', A: 100, fullMark: 100 },
      { subject: '应急响应', A: 85, fullMark: 100 },
      { subject: '系统调优', A: 95, fullMark: 100 },
      { subject: '跨域协作', A: 80, fullMark: 100 },
    ],
    history: [
      { month: 'Oct', cases: 45, satisfaction: 4.8 },
      { month: 'Nov', cases: 52, satisfaction: 4.9 },
      { month: 'Dec', cases: 38, satisfaction: 5.0 },
      { month: 'Jan', cases: 60, satisfaction: 4.7 },
      { month: 'Feb', cases: 55, satisfaction: 4.9 },
      { month: 'Mar', cases: 65, satisfaction: 5.0 },
    ]
  },
  {
    id: 'EXP-002', name: 'Sarah Li', title: 'Senior Automation Engineer', level: 'L4', status: 'Busy',
    specialties: ['PLC Logic', 'SCADA Systems', 'Industrial Networks'],
    location: 'Beijing Branch', experience: 12, rating: 4.8, totalCases: 840, responseRate: '95%',
    bio: 'Expert in Siemens and Rockwell automation suites. Proven track record in rapid recovery of control system failures.',
    certs: ['Siemens Certified Pro', 'Cybersecurity L2'],
    availability: 20,
    skills: [
      { subject: '故障诊断', A: 92, fullMark: 100 },
      { subject: '远程指导', A: 95, fullMark: 100 },
      { subject: '理论知识', A: 88, fullMark: 100 },
      { subject: '应急响应', A: 90, fullMark: 100 },
      { subject: '系统调优', A: 85, fullMark: 100 },
      { subject: '跨域协作', A: 92, fullMark: 100 },
    ],
    history: [
      { month: 'Oct', cases: 30, satisfaction: 4.6 },
      { month: 'Nov', cases: 35, satisfaction: 4.7 },
      { month: 'Dec', cases: 40, satisfaction: 4.8 },
      { month: 'Jan', cases: 28, satisfaction: 4.9 },
      { month: 'Feb', cases: 42, satisfaction: 4.8 },
      { month: 'Mar', cases: 38, satisfaction: 4.7 },
    ]
  },
  {
    id: 'EXP-003', name: 'Mike Chen', title: 'Hydraulic Systems Lead', level: 'L3', status: 'Offline',
    specialties: ['High Pressure Pumps', 'Valves', 'Lubrication'],
    location: 'Guangzhou', experience: 8, rating: 4.6, totalCases: 520, responseRate: '92%',
    bio: 'Specializes in hydraulic fluid power systems. Extensive field experience in heavy machinery maintenance.',
    certs: ['Fluid Power Specialist'],
    availability: 0,
    skills: [
      { subject: '故障诊断', A: 85, fullMark: 100 },
      { subject: '远程指导', A: 80, fullMark: 100 },
      { subject: '理论知识', A: 85, fullMark: 100 },
      { subject: '应急响应', A: 88, fullMark: 100 },
      { subject: '系统调优', A: 75, fullMark: 100 },
      { subject: '跨域协作', A: 80, fullMark: 100 },
    ],
    history: [
      { month: 'Oct', cases: 20, satisfaction: 4.5 },
      { month: 'Nov', cases: 25, satisfaction: 4.6 },
      { month: 'Dec', cases: 22, satisfaction: 4.5 },
      { month: 'Jan', cases: 18, satisfaction: 4.7 },
      { month: 'Feb', cases: 30, satisfaction: 4.6 },
      { month: 'Mar', cases: 28, satisfaction: 4.5 },
    ]
  },
  {
    id: 'EXP-004', name: 'Elena Wu', title: 'Electrical Diagnostician', level: 'L4', status: 'Online',
    specialties: ['Power Quality', 'Transformers', 'Switchgear'],
    location: 'Remote (Chengdu)', experience: 15, rating: 4.9, totalCases: 1100, responseRate: '99%',
    bio: 'Deep knowledge of grid stability and power electronics. Focused on preventive maintenance strategies.',
    certs: ['High Voltage Safety', 'Thermography L2'],
    availability: 100,
    skills: [
      { subject: '故障诊断', A: 96, fullMark: 100 },
      { subject: '远程指导', A: 88, fullMark: 100 },
      { subject: '理论知识', A: 95, fullMark: 100 },
      { subject: '应急响应', A: 92, fullMark: 100 },
      { subject: '系统调优', A: 90, fullMark: 100 },
      { subject: '跨域协作', A: 85, fullMark: 100 },
    ],
    history: [
      { month: 'Oct', cases: 50, satisfaction: 4.9 },
      { month: 'Nov', cases: 48, satisfaction: 4.8 },
      { month: 'Dec', cases: 55, satisfaction: 4.9 },
      { month: 'Jan', cases: 52, satisfaction: 5.0 },
      { month: 'Feb', cases: 58, satisfaction: 4.9 },
      { month: 'Mar', cases: 60, satisfaction: 4.9 },
    ]
  }
];

// --- Components ---

const StatusIndicator = ({ status }: { status: string }) => {
  const config = {
    'Online': { color: 'bg-green-500', glow: 'shadow-[0_0_10px_#22c55e]', text: 'text-green-400' },
    'Busy': { color: 'bg-red-500', glow: 'shadow-[0_0_10px_#ef4444]', text: 'text-red-400' },
    'Offline': { color: 'bg-slate-500', glow: '', text: 'text-slate-400' },
  }[status] || { color: 'bg-slate-500', glow: '', text: 'text-slate-400' };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color} ${config.glow} animate-pulse`}></div>
      <span className={`text-xs font-bold uppercase ${config.text}`}>{status}</span>
    </div>
  );
};

const LevelBadge = ({ level }: { level: string }) => {
  const color = level === 'L5' ? 'text-amber-400 border-amber-500 bg-amber-900/20' : 
                level === 'L4' ? 'text-purple-400 border-purple-500 bg-purple-900/20' : 
                'text-blue-400 border-blue-500 bg-blue-900/20';
  return (
    <div className={`w-8 h-8 flex items-center justify-center rounded-lg border ${color} font-bold font-mono text-xs shadow-lg`}>
      {level}
    </div>
  );
};

export const RemoteExpertProfileView: React.FC = () => {
  const [selectedExpertId, setSelectedExpertId] = useState(EXPERTS[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  const activeExpert = EXPERTS.find(e => e.id === selectedExpertId) || EXPERTS[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & Global Stats */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#081226] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <BrainCircuit size={14} /> Expert Resource Pool
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             专家资源 <span className="text-cyan-500">与能力画像</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Available Experts</div>
                <div className="text-xl font-mono font-bold text-white flex items-center justify-end gap-2">
                    <Users size={16} className="text-cyan-400"/> 24 / 45
                </div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Avg Response</div>
                <div className="text-xl font-mono font-bold text-green-400 flex items-center justify-end gap-2">
                    <Zap size={16}/> 2m 15s
                </div>
            </div>
            <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]">
               <Search size={14} /> 智能匹配专家
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Expert Roster */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search by skill, name..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-400">
                  <Filter size={14} />
               </button>
           </div>

           <div className="flex flex-col gap-3">
               {EXPERTS.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))).map(expert => (
                   <div 
                     key={expert.id}
                     onClick={() => setSelectedExpertId(expert.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group overflow-hidden
                        ${selectedExpertId === expert.id 
                            ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[inset_4px_0_0_#0ea5e9]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       {/* Hover Glow */}
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>

                       <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center text-sm font-bold text-white shadow-lg relative overflow-hidden">
                                   {expert.name.split(' ').map(n => n[0]).join('')}
                                   <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                               </div>
                               <div>
                                   <h3 className={`font-bold text-sm ${selectedExpertId === expert.id ? 'text-white' : 'text-slate-300'}`}>
                                       {expert.name}
                                   </h3>
                                   <div className="text-[10px] text-slate-500 truncate w-32">{expert.title}</div>
                               </div>
                           </div>
                           <LevelBadge level={expert.level} />
                       </div>
                       
                       <div className="flex flex-wrap gap-1 mb-2">
                           {expert.specialties.slice(0, 2).map((tag, i) => (
                               <span key={i} className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800">
                                   {tag}
                               </span>
                           ))}
                           {expert.specialties.length > 2 && <span className="text-[9px] text-slate-600 px-1">+{expert.specialties.length - 2}</span>}
                       </div>

                       <div className="flex justify-between items-center text-[10px] pt-2 border-t border-slate-800/50">
                           <StatusIndicator status={expert.status} />
                           <div className="flex items-center gap-1 text-yellow-500">
                               <Star size={10} fill="currentColor" /> {expert.rating}
                           </div>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: The Holo-Profile */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* 1. Identity & Radar Block */}
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[400px]">
               
               {/* Identity Card */}
               <SciFiCard className="border-cyan-900/50 bg-[#06080e]" noPadding>
                   <div className="relative h-full p-6 flex flex-col">
                       {/* Background Deco */}
                       <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                           <Cpu size={120} className="text-cyan-500" />
                       </div>

                       <div className="flex items-start justify-between mb-6 z-10">
                           <div>
                               <div className="text-xs text-cyan-500 font-bold uppercase tracking-widest mb-1">Expert Profile</div>
                               <h2 className="text-3xl font-bold text-white mb-1">{activeExpert.name}</h2>
                               <div className="flex items-center gap-3 text-sm text-slate-400">
                                   <span className="flex items-center gap-1"><Briefcase size={14}/> {activeExpert.title}</span>
                                   <span className="flex items-center gap-1"><MapPin size={14}/> {activeExpert.location}</span>
                               </div>
                           </div>
                           <div className="text-right">
                               <div className="text-[10px] text-slate-500 uppercase">System ID</div>
                               <div className="font-mono text-cyan-400">{activeExpert.id}</div>
                           </div>
                       </div>

                       <div className="flex-1 z-10 space-y-4">
                           <div className="p-3 bg-slate-900/50 border border-slate-800 rounded">
                               <div className="text-[10px] text-slate-500 uppercase mb-2">Professional Bio</div>
                               <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-3">
                                   "{activeExpert.bio}"
                               </p>
                           </div>

                           <div className="grid grid-cols-3 gap-3">
                               <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                                   <div className="text-[10px] text-slate-500 uppercase">Experience</div>
                                   <div className="text-xl font-bold text-white">{activeExpert.experience} <span className="text-xs font-normal text-slate-600">Yrs</span></div>
                               </div>
                               <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                                   <div className="text-[10px] text-slate-500 uppercase">Cases Solved</div>
                                   <div className="text-xl font-bold text-white">{activeExpert.totalCases}</div>
                               </div>
                               <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                                   <div className="text-[10px] text-slate-500 uppercase">Response</div>
                                   <div className="text-xl font-bold text-green-400">{activeExpert.responseRate}</div>
                               </div>
                           </div>
                       </div>

                       <div className="mt-6 flex gap-3 z-10">
                           <button className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 transition-all">
                               <Video size={14} /> 视频连线
                           </button>
                           <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all">
                               <MessageSquare size={14} /> 发送消息
                           </button>
                       </div>
                   </div>
               </SciFiCard>

               {/* Capability Radar */}
               <SciFiCard title="六维能力模型" subtitle="CAPABILITY MATRIX" className="border-slate-800">
                   <div className="w-full h-full p-2 relative">
                       <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={activeExpert.skills}>
                               <PolarGrid stroke="#334155" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                               <Radar name="Capability" dataKey="A" stroke="#0ea5e9" strokeWidth={3} fill="#0ea5e9" fillOpacity={0.4} />
                               <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9', color: '#fff'}} />
                           </RadarChart>
                       </ResponsiveContainer>
                       
                       {/* Overlay Score */}
                       <div className="absolute top-2 right-2 flex flex-col items-end">
                           <span className="text-[10px] text-slate-500 uppercase">Composite Score</span>
                           <span className="text-2xl font-bold text-cyan-400">93.5</span>
                       </div>
                   </div>
               </SciFiCard>
           </div>

           {/* 2. Performance & Logs */}
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[300px]">
               
               {/* Service Performance Chart */}
               <SciFiCard title="服务效能趋势 (6 Months)" subtitle="PERFORMANCE" className="xl:col-span-2 border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={activeExpert.history} margin={{top:10, right:10, left:0, bottom:0}}>
                               <defs>
                                   <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize: 10}} domain={[0, 5]} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#8b5cf6', color: '#fff'}} />
                               <Area yAxisId="left" type="monotone" dataKey="cases" stroke="#8b5cf6" fill="url(#colorCases)" name="Cases Solved" />
                               <Area yAxisId="right" type="monotone" dataKey="satisfaction" stroke="#10b981" fill="none" strokeWidth={2} name="Sat. Score" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               {/* Availability & Skills */}
               <SciFiCard title="当前状态与排班" className="border-slate-800">
                   <div className="flex flex-col h-full gap-4">
                       <div>
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-xs text-slate-400">Current Load</span>
                               <span className={`text-xs font-bold ${activeExpert.availability < 30 ? 'text-red-400' : 'text-green-400'}`}>
                                   {100 - activeExpert.availability}% Busy
                               </span>
                           </div>
                           <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-gradient-to-r from-green-500 to-red-500" style={{width: `${100 - activeExpert.availability}%`}}></div>
                           </div>
                       </div>

                       <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                           <div className="text-[10px] text-slate-500 uppercase font-bold">Skill Tags</div>
                           <div className="flex flex-wrap gap-1">
                               {activeExpert.specialties.map((s, i) => (
                                   <span key={i} className="text-[10px] px-2 py-1 bg-indigo-900/20 text-indigo-300 border border-indigo-500/30 rounded">
                                       {s}
                                   </span>
                               ))}
                           </div>
                       </div>
                       
                       <div className="p-2 bg-slate-900/50 rounded border border-slate-700 flex items-center justify-between">
                           <span className="text-[10px] text-slate-400">Next Available Slot</span>
                           <span className="text-xs text-white font-mono">Today 14:00</span>
                       </div>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Credentials & Feed */}
        <div className="w-full lg:w-[280px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Certification Wall */}
           <SciFiCard title="资质认证墙 (Credentials)" subtitle="VERIFIED" className="border-slate-800">
               <div className="flex flex-col gap-3">
                   {activeExpert.certs.map((cert, i) => (
                       <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/30 border border-slate-800 rounded hover:border-amber-500/30 transition-colors group">
                           <div className="p-2 bg-slate-950 rounded-full text-amber-500 group-hover:scale-110 transition-transform">
                               <Award size={16} />
                           </div>
                           <div className="flex-1 min-w-0">
                               <div className="text-xs font-bold text-slate-200 truncate">{cert}</div>
                               <div className="text-[9px] text-slate-500 flex items-center gap-1"><ShieldCheck size={8}/> Verified by HR</div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Knowledge Contribution */}
           <SciFiCard title="知识贡献 (Contributions)" className="flex-1 border-slate-800">
               <div className="space-y-4">
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                           <div className="p-1.5 bg-blue-900/20 rounded text-blue-400"><Briefcase size={12}/></div>
                           <span className="text-xs text-slate-300">Technical Articles</span>
                       </div>
                       <span className="text-sm font-bold text-white">12</span>
                   </div>
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                           <div className="p-1.5 bg-pink-900/20 rounded text-pink-400"><Video size={12}/></div>
                           <span className="text-xs text-slate-300">Training Videos</span>
                       </div>
                       <span className="text-sm font-bold text-white">5</span>
                   </div>
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                           <div className="p-1.5 bg-green-900/20 rounded text-green-400"><ShieldCheck size={12}/></div>
                           <span className="text-xs text-slate-300">Standard SOPs</span>
                           </div>
                       <span className="text-sm font-bold text-white">8</span>
                   </div>

                   <div className="pt-4 border-t border-slate-800 mt-2">
                       <div className="text-[10px] text-slate-500 uppercase mb-2">Recent Activity</div>
                       <div className="space-y-3">
                           <div className="flex gap-2 text-[10px]">
                               <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-1.5 shrink-0"></div>
                               <div className="text-slate-400">Resolved <span className="text-white">Ticket #8821</span> (Vibration Alert) - 2h ago</div>
                           </div>
                           <div className="flex gap-2 text-[10px]">
                               <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 shrink-0"></div>
                               <div className="text-slate-400">Published <span className="text-white">"Rotor Balancing Guide"</span> - Yesterday</div>
                           </div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
