
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  GraduationCap, Users, BookOpen, Calendar, 
  Award, PlayCircle, FileText, CheckCircle2, 
  Clock, TrendingUp, Search, Filter, 
  Download, Medal, BrainCircuit, Target,
  User, ArrowRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area
} from 'recharts';

// --- Types ---

interface TrainingProgram {
  id: string;
  title: string;
  type: 'On-site' | 'Virtual' | 'E-Learning';
  status: 'Scheduled' | 'In Progress' | 'Completed';
  instructor: string;
  date: string;
  attendees: number;
  duration: string;
  completionRate: number;
}

interface PersonnelCert {
  id: string;
  name: string;
  role: string;
  company: string;
  certs: string[]; // List of badges
  skillLevel: number; // 0-100
  lastTraining: string;
  avatarColor: string;
}

interface SkillNode {
  id: string;
  x: number;
  y: number;
  label: string;
  status: 'Mastered' | 'Learning' | 'Locked';
  connections: string[];
}

// --- Mock Data ---

const TRAINING_PROGRAMS: TrainingProgram[] = [
  { id: 'TRN-2024-001', title: '燃气轮机高级运维 L3', type: 'On-site', status: 'In Progress', instructor: 'Dr. Zhang', date: '2024-03-20', attendees: 12, duration: '3 Days', completionRate: 45 },
  { id: 'TRN-2024-005', title: '工业安全生产规范 V2', type: 'E-Learning', status: 'Completed', instructor: 'System', date: '2024-03-15', attendees: 150, duration: '4 Hours', completionRate: 98 },
  { id: 'TRN-2024-012', title: '控制系统故障诊断', type: 'Virtual', status: 'Scheduled', instructor: 'Wang Eng.', date: '2024-03-25', attendees: 25, duration: '1 Day', completionRate: 0 },
  { id: 'TRN-2023-089', title: '液压系统基础维护', type: 'On-site', status: 'Completed', instructor: 'Li Tech', date: '2023-12-10', attendees: 18, duration: '2 Days', completionRate: 100 },
];

const PERSONNEL: PersonnelCert[] = [
  { id: 'P001', name: 'Zhang Wei', role: 'Plant Manager', company: 'Shanghai Heavy', certs: ['Safety L3', 'Ops L2'], skillLevel: 85, lastTraining: '2 weeks ago', avatarColor: '#0ea5e9' },
  { id: 'P002', name: 'Li Qiang', role: 'Lead Technician', company: 'Pacific Power', certs: ['Master Mechanic', 'Elec Safety'], skillLevel: 92, lastTraining: 'Yesterday', avatarColor: '#10b981' },
  { id: 'P003', name: 'Sarah Chen', role: 'Operator', company: 'AutoWorks', certs: ['Basic Ops'], skillLevel: 45, lastTraining: '1 month ago', avatarColor: '#f59e0b' },
];

const SKILL_NODES: SkillNode[] = [
  { id: 'base', x: 50, y: 80, label: '基础认知', status: 'Mastered', connections: ['ops', 'safe'] },
  { id: 'ops', x: 30, y: 50, label: '设备操作', status: 'Mastered', connections: ['adv-ops'] },
  { id: 'safe', x: 70, y: 50, label: '安全规范', status: 'Mastered', connections: ['emg'] },
  { id: 'adv-ops', x: 20, y: 20, label: '高级运维', status: 'Learning', connections: [] },
  { id: 'emg', x: 60, y: 20, label: '应急处置', status: 'Learning', connections: [] },
  { id: 'diag', x: 80, y: 20, label: '故障诊断', status: 'Locked', connections: [] },
];

const SCORE_DISTRIBUTION = [
  { name: '>90 (Excellent)', value: 45, fill: '#10b981' },
  { name: '80-90 (Good)', value: 30, fill: '#0ea5e9' },
  { name: '60-80 (Pass)', value: 20, fill: '#f59e0b' },
  { name: '<60 (Fail)', value: 5, fill: '#ef4444' },
];

const RESOURCE_USAGE = [
  { month: 'Oct', downloads: 120, streams: 450 },
  { month: 'Nov', downloads: 150, streams: 520 },
  { month: 'Dec', downloads: 180, streams: 600 },
  { month: 'Jan', downloads: 140, streams: 480 },
  { month: 'Feb', downloads: 200, streams: 750 },
  { month: 'Mar', downloads: 250, streams: 890 },
];

// --- Sub-Components ---

const SkillConstellation = ({ nodes }: { nodes: SkillNode[] }) => {
  return (
    <div className="w-full h-full relative bg-[#090c14] overflow-hidden rounded border border-slate-800">
       <div className="absolute inset-0 opacity-20" style={{
           backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)',
           backgroundSize: '20px 20px'
       }}></div>
       
       <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Connections */}
          {nodes.map(node => 
             node.connections.map(targetId => {
                const target = nodes.find(n => n.id === targetId);
                if (!target) return null;
                return (
                   <line 
                     key={`${node.id}-${target.id}`}
                     x1={`${node.x}%`} y1={`${node.y}%`}
                     x2={`${target.x}%`} y2={`${target.y}%`}
                     stroke={node.status === 'Mastered' ? '#6366f1' : '#334155'}
                     strokeWidth="0.5"
                     strokeDasharray={node.status === 'Learning' ? '2 2' : ''}
                     className="animate-pulse"
                   />
                );
             })
          )}

          {/* Nodes */}
          {nodes.map(node => (
             <g key={node.id}>
                <circle 
                  cx={`${node.x}%`} cy={`${node.y}%`} r="3" 
                  fill={node.status === 'Mastered' ? '#6366f1' : node.status === 'Learning' ? '#f59e0b' : '#1e293b'}
                  stroke={node.status === 'Locked' ? '#475569' : '#fff'}
                  strokeWidth="0.5"
                  className="transition-all duration-500 hover:r-4 cursor-pointer"
                />
                {node.status === 'Learning' && (
                   <circle cx={`${node.x}%`} cy={`${node.y}%`} r="5" fill="none" stroke="#f59e0b" strokeWidth="0.2" className="animate-ping" />
                )}
                <text 
                  x={`${node.x}%`} y={`${node.y + 6}%`} 
                  textAnchor="middle" 
                  fill={node.status === 'Locked' ? '#475569' : '#cbd5e1'} 
                  fontSize="3" 
                  fontWeight="bold"
                >
                   {node.label}
                </text>
             </g>
          ))}
       </svg>
    </div>
  );
};

export const CustomerSupportTrainingView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('courses');

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header & Global Stats */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0d0b1a] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <GraduationCap size={14} /> Knowledge & Empowerment
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户赋能 <span className="text-indigo-500">培训记录中心</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Certified Staff</div>
                <div className="text-xl font-mono font-bold text-white">485</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Training Hours (YTD)</div>
                <div className="text-xl font-mono font-bold text-indigo-400">12,450</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Pass Rate</div>
                <div className="text-xl font-mono font-bold text-green-400">96.8%</div>
            </div>
            <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]">
               <PlayCircle size={14} /> 安排新培训
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Training Programs */}
        <div className="w-full lg:w-[340px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex gap-2 mb-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="搜索课程..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
                  />
               </div>
               <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-400">
                  <Filter size={14} />
               </button>
           </div>

           <div className="flex flex-col gap-3">
               {TRAINING_PROGRAMS.map(prog => (
                   <div 
                     key={prog.id}
                     className="p-4 bg-slate-900/40 border border-slate-800 rounded hover:border-indigo-500/50 transition-colors group cursor-pointer"
                   >
                       <div className="flex justify-between items-start mb-2">
                           <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold
                               ${prog.status === 'In Progress' ? 'bg-indigo-900/30 text-indigo-400 border-indigo-800 animate-pulse' : 
                                 prog.status === 'Completed' ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-slate-800 text-slate-400 border-slate-700'}
                           `}>
                               {prog.status}
                           </span>
                           <span className="text-[10px] text-slate-500 font-mono">{prog.date}</span>
                       </div>
                       
                       <h3 className="font-bold text-sm text-slate-200 group-hover:text-white mb-2">{prog.title}</h3>
                       
                       <div className="flex justify-between items-center text-[10px] text-slate-500 mb-3">
                           <span className="flex items-center gap-1"><Users size={10}/> {prog.attendees}</span>
                           <span className="flex items-center gap-1"><Clock size={10}/> {prog.duration}</span>
                           <span className="flex items-center gap-1"><User size={10} className="w-2.5 h-2.5"/> {prog.instructor}</span>
                       </div>

                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <div 
                             className={`h-full transition-all duration-1000 ${prog.completionRate === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} 
                             style={{width: `${prog.completionRate}%`}}
                           ></div>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: The Skill Nexus */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Skill Tree Visualizer */}
           <SciFiCard title="能力成长图谱 (Skill Constellation)" subtitle="INTERACTIVE" className="h-[350px] border-indigo-900/50" noPadding>
               <div className="w-full h-full p-2 flex flex-col">
                   <div className="flex justify-between px-4 pt-2 mb-2">
                       <div className="flex items-center gap-4 text-xs">
                           <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Mastered</div>
                           <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div> Learning</div>
                           <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-700"></div> Locked</div>
                       </div>
                       <div className="text-[10px] text-slate-500">Current View: Technical Ops Team</div>
                   </div>
                   <div className="flex-1 relative">
                       <SkillConstellation nodes={SKILL_NODES} />
                   </div>
               </div>
           </SciFiCard>

           {/* Resource Usage & Scores */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
               
               <SciFiCard title="知识资源热度" subtitle="ACCESS LOGS" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={RESOURCE_USAGE} margin={{top:10, right:10, left:0, bottom:0}}>
                               <defs>
                                   <linearGradient id="colorStream" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0f18', borderColor: '#8b5cf6', color: '#fff'}} />
                               <Area type="monotone" dataKey="streams" stroke="#8b5cf6" fill="url(#colorStream)" strokeWidth={2} name="Video Streams" />
                               <Area type="monotone" dataKey="downloads" stroke="#0ea5e9" fill="none" strokeWidth={2} name="Doc Downloads" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="考核成绩分布" subtitle="ASSESSMENT" className="border-slate-800">
                   <div className="flex items-center h-full">
                       <div className="w-1/2 h-full">
                           <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                   <Pie 
                                     data={SCORE_DISTRIBUTION} 
                                     innerRadius={30} 
                                     outerRadius={50} 
                                     paddingAngle={5} 
                                     dataKey="value"
                                   >
                                       {SCORE_DISTRIBUTION.map((entry, index) => (
                                           <Cell key={`cell-${index}`} fill={entry.fill} />
                                       ))}
                                   </Pie>
                                   <Tooltip contentStyle={{backgroundColor: '#0f0f18', borderColor: '#3b82f6'}} />
                               </PieChart>
                           </ResponsiveContainer>
                       </div>
                       <div className="flex-1 space-y-2 pr-4">
                           {SCORE_DISTRIBUTION.map((d, i) => (
                               <div key={i} className="flex justify-between items-center text-xs">
                                   <div className="flex items-center gap-2">
                                       <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.fill}}></div>
                                       <span className="text-slate-300">{d.name.split('(')[0]}</span>
                                   </div>
                                   <span className="font-mono text-white">{d.value}%</span>
                               </div>
                           ))}
                       </div>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Personnel & Resources */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Personnel Cards */}
           <SciFiCard title="关键人员认证 (Certifications)" subtitle="STAFF" className="flex-1 border-indigo-900/50">
               <div className="flex flex-col gap-3">
                   {PERSONNEL.map(p => (
                       <div key={p.id} className="bg-slate-900/40 p-3 rounded border border-slate-800 hover:border-indigo-500/30 transition-colors group">
                           <div className="flex items-center gap-3 mb-2">
                               <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md" style={{backgroundColor: p.avatarColor}}>
                                   {p.name.charAt(0)}
                               </div>
                               <div>
                                   <div className="text-sm font-bold text-white">{p.name}</div>
                                   <div className="text-[10px] text-slate-500">{p.role} @ {p.company}</div>
                               </div>
                               <div className="ml-auto text-xs font-bold text-indigo-400 font-mono">{p.skillLevel}</div>
                           </div>
                           
                           <div className="flex flex-wrap gap-1 mb-2">
                               {p.certs.map(cert => (
                                   <span key={cert} className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300 flex items-center gap-1">
                                       <Medal size={8} className="text-yellow-500"/> {cert}
                                   </span>
                               ))}
                           </div>
                           
                           <div className="text-[9px] text-slate-500 flex justify-between items-center border-t border-slate-800 pt-2">
                               <span>Last Trained: {p.lastTraining}</span>
                               <span className="text-indigo-500 cursor-pointer hover:underline">View Profile</span>
                           </div>
                       </div>
                   ))}
               </div>
               <button className="w-full mt-4 py-2 border border-dashed border-slate-600 rounded text-slate-400 text-xs hover:text-white hover:border-indigo-500 flex items-center justify-center gap-2 transition-colors">
                   <Users size={12} /> Manage Personnel
               </button>
           </SciFiCard>

           {/* Resource Library (Mini) */}
           <SciFiCard title="知识资源库" subtitle="DOWNLOADS" className="border-slate-800">
               <div className="space-y-2">
                   {[
                       { name: 'Operation Manual v2.4', type: 'PDF', size: '12 MB' },
                       { name: 'Safety Training Video', type: 'MP4', size: '145 MB' },
                       { name: 'Troubleshooting Guide', type: 'PDF', size: '4.5 MB' },
                   ].map((res, i) => (
                       <div key={i} className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer">
                           <div className="flex items-center gap-2">
                               <FileText size={14} className="text-slate-500" />
                               <span className="text-xs text-slate-300">{res.name}</span>
                           </div>
                           <Download size={12} className="text-slate-600 hover:text-indigo-400" />
                       </div>
                   ))}
               </div>
               <button className="w-full mt-3 text-xs text-indigo-400 hover:text-white flex items-center justify-center gap-1">
                   Visit Full Library <ArrowRight size={10} />
               </button>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
