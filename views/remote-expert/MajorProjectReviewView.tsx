
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  Building, Calendar, DollarSign, Users, 
  AlertTriangle, CheckCircle2, XCircle, 
  Flag, TrendingUp, Layers, FileText,
  Gavel, Share2, MessageSquare, Clock,
  Briefcase, ShieldCheck, Target, ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area, CartesianGrid, ReferenceLine, Line
} from 'recharts';

// --- Types ---

interface ProjectMeta {
  id: string;
  name: string;
  type: string;
  stage: string; // e.g., "CDR (Critical Design Review)"
  budget: string;
  progress: number; // 0-100
  health: number; // 0-100
  manager: string;
}

interface ReviewIssue {
  id: string;
  title: string;
  category: 'Technical' | 'Safety' | 'Cost' | 'Schedule';
  severity: 'Critical' | 'Major' | 'Minor';
  status: 'Open' | 'Closed' | 'Waived';
  raisedBy: string;
  response?: string;
}

interface ExpertVote {
  expert: string;
  role: string;
  vote: 'Approve' | 'Conditional' | 'Reject' | 'Pending';
  comment?: string;
  avatarColor: string;
}

interface RiskMetric {
  subject: string;
  score: number; // 0-100 (Lower is safer)
  threshold: number;
}

// --- Mock Data ---

const PROJECT_INFO: ProjectMeta = {
  id: 'PRJ-2024-XGW',
  name: '西部能源基地二期扩建工程',
  type: 'Infrastructure / Energy',
  stage: 'Critical Design Review (CDR)',
  budget: '¥ 12.5 B',
  progress: 35.4,
  health: 92,
  manager: 'Director Wang',
};

const REVIEW_ISSUES: ReviewIssue[] = [
  { id: 'IQ-042', title: '主结构抗震等级冗余度不足', category: 'Technical', severity: 'Critical', status: 'Open', raisedBy: 'Dr. Zhang' },
  { id: 'IQ-045', title: '关键设备交付周期延误风险', category: 'Schedule', severity: 'Major', status: 'Open', raisedBy: 'Mike Chen' },
  { id: 'IQ-038', title: '深基坑支护方案成本超支', category: 'Cost', severity: 'Minor', status: 'Closed', raisedBy: 'Finance Dept', response: 'Optimized support structure.' },
  { id: 'IQ-051', title: '特种作业人员资质审核缺失', category: 'Safety', severity: 'Major', status: 'Open', raisedBy: 'Safety Officer' },
];

const EXPERT_VOTES: ExpertVote[] = [
  { expert: 'Dr. Zhang', role: 'Chief Architect', vote: 'Conditional', comment: 'Pending resolution of IQ-042 seismicity calc.', avatarColor: '#ef4444' },
  { expert: 'Prof. Li', role: 'Structural Lead', vote: 'Approve', comment: 'Structural integrity verified.', avatarColor: '#0ea5e9' },
  { expert: 'Eng. Wu', role: 'MEP Specialist', vote: 'Approve', comment: 'Systems integration looks solid.', avatarColor: '#10b981' },
  { expert: 'Ms. Zhao', role: 'Cost Control', vote: 'Reject', comment: 'Budget overrun in foundation works unacceptable.', avatarColor: '#f59e0b' },
  { expert: 'Mr. Liu', role: 'HSE Manager', vote: 'Pending', avatarColor: '#8b5cf6' },
];

const RISK_RADAR: RiskMetric[] = [
  { subject: '技术可行性', score: 25, threshold: 80 }, // Low risk is good
  { subject: '工期风险', score: 65, threshold: 50 },
  { subject: '成本控制', score: 70, threshold: 60 },
  { subject: 'HSE 合规', score: 15, threshold: 30 },
  { subject: '供应链', score: 55, threshold: 50 },
  { subject: '政策风险', score: 10, threshold: 40 },
];

const BUDGET_TREND = Array.from({length: 12}, (_, i) => ({
  month: `M${i+1}`,
  planned: 100 + i * 20,
  actual: 100 + i * 20 + (i > 4 ? (i-4)*15 : 0), // Overrun starts M5
}));

// --- Helper Components ---

const StatusPill = ({ status }: { status: string }) => {
  const styles = {
    'Open': 'bg-red-900/30 text-red-400 border-red-800',
    'Closed': 'bg-green-900/30 text-green-400 border-green-800',
    'Waived': 'bg-slate-800 text-slate-400 border-slate-600',
  }[status] || 'bg-slate-800 text-slate-400';
  return <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${styles}`}>{status}</span>;
};

const VoteCard = ({ vote }: { vote: ExpertVote }) => {
  const statusColor = 
    vote.vote === 'Approve' ? 'text-green-500 border-green-500/50 bg-green-900/10' :
    vote.vote === 'Reject' ? 'text-red-500 border-red-500/50 bg-red-900/10' :
    vote.vote === 'Conditional' ? 'text-yellow-500 border-yellow-500/50 bg-yellow-900/10' :
    'text-slate-500 border-slate-700 bg-slate-900/30';
  
  const icon = 
    vote.vote === 'Approve' ? <CheckCircle2 size={14}/> :
    vote.vote === 'Reject' ? <XCircle size={14}/> :
    vote.vote === 'Conditional' ? <AlertTriangle size={14}/> : <Clock size={14}/>;

  return (
    <div className="flex items-start gap-3 p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-amber-900/50 transition-colors">
      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm mt-1" style={{backgroundColor: vote.avatarColor}}>
        {vote.expert.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
           <div>
             <div className="text-xs font-bold text-slate-200">{vote.expert}</div>
             <div className="text-[10px] text-slate-500">{vote.role}</div>
           </div>
           <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${statusColor}`}>
              {icon} {vote.vote}
           </div>
        </div>
        {vote.comment && <div className="text-[10px] text-slate-400 mt-1 italic">"{vote.comment}"</div>}
      </div>
    </div>
  );
};

export const MajorProjectReviewView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('issues'); // issues, files, timeline

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200 bg-[#040300]">
      
      {/* 1. Header: Project Command */}
      <div className="flex justify-between items-end border-b border-amber-900/40 pb-4 bg-gradient-to-r from-[#1f1200] to-transparent px-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <Briefcase size={14} /> Major Project Governance
          </div>
          <div className="flex items-center gap-4">
             <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                重大项目 <span className="text-amber-500">技术把关指挥舱</span>
             </h1>
             <span className="px-3 py-1 bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs font-bold rounded flex items-center gap-2">
                <Flag size={12} className="text-amber-500"/> {PROJECT_INFO.stage}
             </span>
          </div>
        </div>
        
        <div className="flex gap-6 items-center">
             <div className="text-right border-r border-slate-800 pr-6">
                <div className="text-[10px] text-slate-500 uppercase">Total Budget</div>
                <div className="text-xl font-mono font-bold text-white">{PROJECT_INFO.budget}</div>
             </div>
             <div className="text-right border-r border-slate-800 pr-6">
                <div className="text-[10px] text-slate-500 uppercase">Overall Progress</div>
                <div className="text-xl font-mono font-bold text-green-400">{PROJECT_INFO.progress}%</div>
             </div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Project Health</div>
                <div className="text-xl font-mono font-bold text-amber-400">{PROJECT_INFO.health}/100</div>
             </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden px-4 pb-4">
         
         {/* LEFT: Project Context (3 Cols) */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">
             
             {/* Project Card */}
             <SciFiCard title="项目概况" className="border-amber-900/30">
                 <div className="space-y-4">
                     <div>
                         <div className="text-xs text-slate-500 mb-1">Project Name</div>
                         <div className="text-sm font-bold text-white">{PROJECT_INFO.name}</div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <div className="text-xs text-slate-500 mb-1">Type</div>
                             <div className="text-sm text-slate-300">{PROJECT_INFO.type}</div>
                         </div>
                         <div>
                             <div className="text-xs text-slate-500 mb-1">Manager</div>
                             <div className="text-sm text-slate-300">{PROJECT_INFO.manager}</div>
                         </div>
                     </div>
                     <div className="pt-4 border-t border-slate-800">
                         <div className="flex justify-between items-center mb-1 text-xs text-slate-400">
                             <span>Phase Completion</span>
                             <span>85%</span>
                         </div>
                         <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-amber-500" style={{width: '85%'}}></div>
                         </div>
                     </div>
                 </div>
             </SciFiCard>

             {/* Milestone Tracker */}
             <SciFiCard title="里程碑节点 (Milestones)" subtitle="TIMELINE" className="flex-1 border-slate-800">
                 <div className="relative pl-4 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                     {[
                         { name: '项目立项', date: '2023-06', status: 'Done' },
                         { name: '初步设计审查 (PDR)', date: '2023-11', status: 'Done' },
                         { name: '关键设计审查 (CDR)', date: 'Now', status: 'Active' },
                         { name: '详细设计冻结', date: '2024-06', status: 'Pending' },
                         { name: '施工图交付', date: '2024-09', status: 'Pending' },
                     ].map((m, i) => (
                         <div key={i} className="relative group">
                             <div className={`absolute -left-[11px] top-1 w-2.5 h-2.5 rounded-full border-2 z-10 
                                 ${m.status === 'Done' ? 'bg-green-500 border-green-500' : 
                                   m.status === 'Active' ? 'bg-amber-500 border-amber-500 animate-pulse' : 'bg-slate-900 border-slate-600'}
                             `}></div>
                             <div className="flex justify-between items-center">
                                 <span className={`text-xs font-bold ${m.status === 'Active' ? 'text-amber-400' : m.status === 'Done' ? 'text-slate-300' : 'text-slate-500'}`}>
                                     {m.name}
                                 </span>
                                 <span className="text-[10px] font-mono text-slate-500">{m.date}</span>
                             </div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>

         </div>

         {/* CENTER: Visual & Issues (6 Cols) */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
             
             {/* 3D Site Twin */}
             <SciFiCard title="工程数字孪生 (Construction Twin)" subtitle="ZONE B" className="flex-[3] border-amber-900/50 bg-[#0a0805]" noPadding>
                 <div className="w-full h-full relative">
                     {/* 3D Scene */}
                     <div className="absolute inset-0 z-0">
                         <ThreeScene type="crane" color="#f59e0b" />
                     </div>
                     
                     {/* AR Markers Overlay */}
                     <div className="absolute top-[20%] left-[30%] pointer-events-none group">
                         <div className="w-4 h-4 rounded-full bg-red-500/50 border border-red-500 flex items-center justify-center animate-ping"></div>
                         <div className="absolute top-0 left-0 w-4 h-4 rounded-full border border-red-500 flex items-center justify-center">
                             <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                         </div>
                         <div className="absolute left-6 top-0 bg-black/80 border border-red-500/50 px-2 py-1 rounded text-[9px] text-red-300 w-32 backdrop-blur">
                             <strong>Issue #IQ-042</strong><br/>Seismic Support Weakness
                         </div>
                     </div>

                     <div className="absolute bottom-[30%] right-[30%] pointer-events-none">
                         <div className="w-4 h-4 rounded-full border border-amber-500 flex items-center justify-center bg-amber-500/20">
                             <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                         </div>
                         <div className="absolute right-6 top-0 bg-black/80 border border-amber-500/50 px-2 py-1 rounded text-[9px] text-amber-300 w-32 backdrop-blur text-right">
                             <strong>Issue #IQ-045</strong><br/>Equipment Delay Risk
                         </div>
                     </div>
                     
                     {/* Controls */}
                     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                         <button className="px-3 py-1 bg-black/60 border border-slate-600 rounded text-xs text-white hover:bg-amber-900/50 transition-colors">Structure</button>
                         <button className="px-3 py-1 bg-black/60 border border-slate-600 rounded text-xs text-white hover:bg-amber-900/50 transition-colors">MEP</button>
                         <button className="px-3 py-1 bg-black/60 border border-slate-600 rounded text-xs text-white hover:bg-amber-900/50 transition-colors">Safety</button>
                     </div>
                 </div>
             </SciFiCard>

             {/* Technical Issues List */}
             <SciFiCard title="技术审查问题清单 (Technical Queries)" subtitle="T Q" className="flex-[2] border-slate-800">
                 <div className="flex flex-col h-full overflow-hidden">
                     <div className="flex justify-between items-center mb-2 px-2">
                         <div className="flex gap-2">
                             <span className="text-[10px] px-2 py-0.5 bg-red-900/20 text-red-400 border border-red-900/50 rounded cursor-pointer">Critical: 1</span>
                             <span className="text-[10px] px-2 py-0.5 bg-amber-900/20 text-amber-400 border border-amber-900/50 rounded cursor-pointer">Major: 2</span>
                         </div>
                         <button className="text-xs text-amber-500 flex items-center gap-1 hover:text-white">
                             View All <ArrowRight size={10}/>
                         </button>
                     </div>
                     
                     <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                         {REVIEW_ISSUES.map(issue => (
                             <div key={issue.id} className="p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-slate-600 transition-colors group cursor-pointer">
                                 <div className="flex justify-between items-start mb-1">
                                     <div className="flex items-center gap-2">
                                         <span className={`w-2 h-2 rounded-full ${issue.severity === 'Critical' ? 'bg-red-500' : issue.severity === 'Major' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                                         <span className="text-xs font-bold text-slate-200 group-hover:text-white">{issue.title}</span>
                                     </div>
                                     <StatusPill status={issue.status} />
                                 </div>
                                 <div className="flex justify-between items-center text-[10px] text-slate-500 pl-4">
                                     <span>ID: {issue.id} • {issue.category}</span>
                                     <span>By: {issue.raisedBy}</span>
                                 </div>
                                 {issue.response && (
                                     <div className="mt-2 pl-4 text-[10px] text-green-400/80 border-l-2 border-green-900 pl-2">
                                         Resp: {issue.response}
                                     </div>
                                 )}
                             </div>
                         ))}
                     </div>
                 </div>
             </SciFiCard>

         </div>

         {/* RIGHT COLUMN: Decision & Risks (3 Cols) */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-1">
             
             {/* Risk Radar */}
             <SciFiCard title="风险多维雷达" subtitle="ASSESSMENT" className="border-red-900/30">
                 <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                         <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RISK_RADAR}>
                             <PolarGrid stroke="#334155" />
                             <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                             <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                             <Radar name="Risk Score" dataKey="score" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.4} />
                             <Tooltip contentStyle={{backgroundColor: '#0f0505', borderColor: '#ef4444', color: '#fff'}} />
                         </RadarChart>
                     </ResponsiveContainer>
                 </div>
                 <div className="text-center mt-[-10px] text-xs text-slate-400">
                     Highest Risk: <span className="text-red-400 font-bold">Cost Control</span>
                 </div>
             </SciFiCard>

             {/* Cost Trend */}
             <SciFiCard title="预算执行偏离度" subtitle="COST CONTROL" className="border-slate-800">
                 <div className="h-40 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={BUDGET_TREND} margin={{top:5, right:0, left:0, bottom:0}}>
                             <defs>
                                 <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                 </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                             <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                             <Tooltip contentStyle={{backgroundColor: '#0f0a05', borderColor: '#f59e0b', fontSize: '10px'}} />
                             <Area type="monotone" dataKey="actual" stroke="#f59e0b" fill="url(#colorCost)" strokeWidth={2} />
                             <Line type="monotone" dataKey="planned" stroke="#64748b" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                         </AreaChart>
                     </ResponsiveContainer>
                 </div>
                 <div className="flex justify-between px-2 text-[10px] text-slate-500">
                     <span>Base: Planned</span>
                     <span className="text-amber-400">Amber: Actual</span>
                 </div>
             </SciFiCard>

             {/* Expert Voting Console */}
             <SciFiCard title="专家表决 (Voting)" subtitle="GATE REVIEW" className="flex-1 border-slate-800 bg-[#0c0a09]">
                 <div className="flex flex-col gap-3 h-full">
                     <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1 max-h-[250px]">
                         {EXPERT_VOTES.map((vote, i) => <VoteCard key={i} vote={vote} />)}
                     </div>
                     
                     <div className="mt-auto pt-4 border-t border-slate-800">
                         <div className="flex justify-between items-center mb-2">
                             <span className="text-xs text-slate-400">Pass Threshold</span>
                             <span className="text-xs text-white font-bold">4/5 Approvals</span>
                         </div>
                         <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                             <div className="h-full bg-green-500 w-[40%] float-left"></div>
                             <div className="h-full bg-yellow-500 w-[20%] float-left"></div>
                             <div className="h-full bg-red-500 w-[20%] float-left"></div>
                         </div>
                         
                         <button className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold rounded shadow-lg transition-colors flex items-center justify-center gap-2">
                             <Gavel size={14} /> Finalize Gate Decision
                         </button>
                     </div>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
