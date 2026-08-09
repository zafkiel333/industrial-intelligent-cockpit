
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  BrainCircuit, Users, MessageSquare, FileText, 
  GitPullRequest, Zap, Activity, AlertOctagon, 
  CheckCircle2, Search, Filter, ArrowRight, 
  Lightbulb, Share2, UploadCloud, Microscope,
  Vote, XCircle, Clock, Database, Layers,
  ThumbsUp, ThumbsDown
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Line, Area, Bar, 
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, 
  ScatterChart, Scatter, ZAxis, ReferenceLine, Cell
} from 'recharts';

// --- Types ---

interface ProblemMeta {
  id: string;
  title: string;
  domain: string;
  urgency: 'Critical' | 'High' | 'Medium';
  status: 'Open' | 'In Consultation' | 'Solution Proposed' | 'Closed';
  submittedBy: string;
  date: string;
}

interface Expert {
  id: string;
  name: string;
  role: string;
  specialty: string;
  status: 'Online' | 'Away' | 'Busy';
  avatarColor: string;
  contribution: number; // 0-100
}

interface DiscussionItem {
  id: string;
  expertId: string;
  type: 'Analysis' | 'Question' | 'Proposal' | 'System';
  content: string;
  time: string;
  attachments?: string[];
}

interface SignalData {
  time: string;
  paramA: number; // Primary variable
  paramB: number; // Secondary variable
  correlation: number;
}

// --- Mock Data ---

const PROBLEM_INFO: ProblemMeta = {
  id: 'TC-2024-X99',
  title: '超临界机组高压加热器端差异常增大分析',
  domain: 'Thermal Power / Heat Exchange',
  urgency: 'High',
  status: 'In Consultation',
  submittedBy: 'Plant Ops - Team A',
  date: '2024-03-21 09:30'
};

const EXPERTS: Expert[] = [
  { id: 'E1', name: 'Dr. Zhang', role: 'Lead Consultant', specialty: 'Thermodynamics', status: 'Online', avatarColor: '#0ea5e9', contribution: 85 },
  { id: 'E2', name: 'Prof. Li', role: 'Material Specialist', specialty: 'Metallurgy', status: 'Online', avatarColor: '#f59e0b', contribution: 60 },
  { id: 'E3', name: 'Mike Chen', role: 'System Architect', specialty: 'Control Logic', status: 'Busy', avatarColor: '#8b5cf6', contribution: 45 },
];

const DISCUSSION_LOG: DiscussionItem[] = [
  { id: '1', expertId: 'System', type: 'System', content: 'Consultation session started. All datasets loaded.', time: '10:00' },
  { id: '2', expertId: 'E1', type: 'Analysis', content: 'Looking at the trend, the TTD (Terminal Temperature Difference) increased by 3.5°C over 48h. This suggests rapid fouling or internal leakage.', time: '10:05' },
  { id: '3', expertId: 'E3', type: 'Question', content: 'Has there been any fluctuation in the drain water level control valve position?', time: '10:08' },
  { id: '4', expertId: 'E2', type: 'Analysis', content: 'Checking material fatigue limits. The tube sheet stress might be a factor if thermal shock occurred.', time: '10:12' },
  { id: '5', expertId: 'E1', type: 'Proposal', content: 'Hypothesis: Partition plate bypass leakage. Recommend thermal imaging inspection of the shell side.', time: '10:25' },
];

const SIGNAL_DATA: SignalData[] = Array.from({length: 60}, (_, i) => {
  const t = i;
  // Simulate correlation breakdown
  const drift = t > 30 ? (t - 30) * 0.5 : 0;
  return {
    time: `T+${t}m`,
    paramA: 100 + Math.sin(t * 0.2) * 5 + Math.random() * 2, // Load
    paramB: 100 + Math.sin(t * 0.2) * 5 + drift + Math.random() * 2, // Temp Diff (drifting away)
    correlation: t > 30 ? 0.4 : 0.95
  };
});

// --- Components ---

const UrgencyBadge = ({ level }: { level: string }) => {
  const color = level === 'Critical' ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 
                level === 'High' ? 'bg-orange-500 shadow-[0_0_10px_#f97316]' : 'bg-blue-500';
  return (
    <span className={`px-3 py-1 rounded text-xs font-bold text-white flex items-center gap-2 ${color}`}>
      <AlertOctagon size={12} /> {level} Priority
    </span>
  );
};

const SchematicDiagram = () => (
  <div className="w-full h-full relative bg-[#080b14] rounded border border-slate-700 overflow-hidden group">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
          backgroundSize: '20px 20px'
      }}></div>

      {/* SVG Logic Map */}
      <svg className="w-full h-full absolute inset-0">
          <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="#475569" />
              </marker>
              <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                  <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
          </defs>

          {/* Pipes */}
          <path d="M50,150 L200,150" stroke="#334155" strokeWidth="4" fill="none" markerEnd="url(#arrow)" />
          <path d="M300,150 L450,150" stroke="#334155" strokeWidth="4" fill="none" markerEnd="url(#arrow)" />
          <path d="M250,200 L250,300" stroke="#334155" strokeWidth="4" fill="none" markerEnd="url(#arrow)" />
          
          {/* Heat Exchanger Body */}
          <rect x="200" y="100" width="100" height="100" rx="4" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
          
          {/* Internal Coils (Simulated) */}
          <path d="M220,120 Q250,110 280,120 T280,140 T220,160" stroke="#f59e0b" strokeWidth="2" fill="none" className="animate-pulse" />
          
          {/* Fault Indicator */}
          <circle cx="250" cy="150" r="30" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" className="animate-ping" />
          
          {/* Labels */}
          <text x="125" y="140" fill="#94a3b8" fontSize="10" textAnchor="middle">Feedwater In</text>
          <text x="375" y="140" fill="#94a3b8" fontSize="10" textAnchor="middle">Feedwater Out</text>
          <text x="250" y="80" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">HP Heater #3</text>
      </svg>
      
      {/* Interactive Hotspots */}
      <div className="absolute top-[140px] left-[240px] w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center cursor-pointer hover:scale-125 transition-transform border border-red-500">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      </div>
      
      <div className="absolute bottom-4 left-4">
          <div className="bg-black/60 px-3 py-1 rounded border border-slate-600 text-[10px] text-slate-300 backdrop-blur">
              System State: <span className="text-yellow-400 font-bold">DEGRADED</span>
          </div>
      </div>
  </div>
);

export const TechConsultationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Analysis');
  const [inputMsg, setInputMsg] = useState('');

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200 bg-[#030407]">
      
      {/* 1. Header: War Room Style */}
      <div className="flex justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0b0a1a] to-transparent px-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <BrainCircuit size={14} /> Expert Consultation Hub
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
             远程关键技术 <span className="text-indigo-500">专项咨询室</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Case ID</div>
                <div className="text-lg font-mono font-bold text-white">{PROBLEM_INFO.id}</div>
             </div>
             <div className="h-8 w-px bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Elapsed Time</div>
                <div className="text-lg font-mono font-bold text-yellow-400">02:15:30</div>
             </div>
             <UrgencyBadge level={PROBLEM_INFO.urgency} />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden px-4 pb-4">
         
         {/* LEFT: Problem Dossier */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
             
             {/* Info Card */}
             <SciFiCard title="问题档案 (Dossier)" className="border-indigo-900/30">
                 <div className="space-y-4">
                     <div>
                         <div className="text-xs text-slate-500 mb-1">Subject</div>
                         <div className="text-sm font-bold text-white leading-snug">{PROBLEM_INFO.title}</div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <div className="text-xs text-slate-500 mb-1">Domain</div>
                             <div className="text-xs text-slate-300 bg-slate-900/50 px-2 py-1 rounded border border-slate-700">{PROBLEM_INFO.domain}</div>
                         </div>
                         <div>
                             <div className="text-xs text-slate-500 mb-1">Submitted By</div>
                             <div className="text-xs text-slate-300">{PROBLEM_INFO.submittedBy}</div>
                         </div>
                     </div>
                     <div>
                         <div className="text-xs text-slate-500 mb-1">Context</div>
                         <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/30 p-2 rounded">
                             Unit running at 85% load. TTD drifted from design value (1.2°C) to 4.7°C. Efficiency loss estimated at 1.5%. No external leaks observed.
                         </p>
                     </div>
                 </div>
                 <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
                     <button className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors flex items-center justify-center gap-1">
                         <FileText size={12}/> View Logs
                     </button>
                     <button className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors flex items-center justify-center gap-1">
                         <Database size={12}/> Raw Data
                     </button>
                 </div>
             </SciFiCard>

             {/* Evidence Gallery (Placeholder) */}
             <SciFiCard title="附件与证据" subtitle="3 FILES" className="flex-1 border-slate-800">
                 <div className="flex flex-col gap-2">
                     {['Thermal_Img_01.jpg', 'Vib_Spectrum_Report.pdf', 'P_T_Log_Export.csv'].map((file, i) => (
                         <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 cursor-pointer group">
                             <div className="flex items-center gap-2 overflow-hidden">
                                 <FileText size={14} className="text-slate-500 group-hover:text-indigo-400 shrink-0" />
                                 <span className="text-xs text-slate-300 truncate">{file}</span>
                             </div>
                             <ArrowRight size={12} className="text-slate-600 group-hover:text-white" />
                         </div>
                     ))}
                 </div>
             </SciFiCard>

         </div>

         {/* CENTER: Analysis & Schematic */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
             
             {/* 1. System Schematic */}
             <SciFiCard title="系统原理拓扑 (System Topology)" subtitle="LIVE STATE" className="flex-[3] border-indigo-900/50 bg-[#020204]" noPadding>
                 <div className="w-full h-full p-2">
                     <SchematicDiagram />
                 </div>
             </SciFiCard>

             {/* 2. Correlation Analysis */}
             <SciFiCard title="参数关联分析 (Correlation)" subtitle="TREND" className="flex-[2] border-slate-800">
                 <div className="w-full h-full p-2 relative">
                     <ResponsiveContainer width="100%" height="100%">
                         <ComposedChart data={SIGNAL_DATA} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                             <defs>
                                 <linearGradient id="colorParamA" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                 </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                             <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={9} />
                             <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={['auto', 'auto']} />
                             <Tooltip contentStyle={{backgroundColor: '#0f0c15', borderColor: '#6366f1', fontSize: '12px'}} />
                             <Legend wrapperStyle={{fontSize: '10px'}} verticalAlign="top" />
                             
                             <Area type="monotone" dataKey="paramA" name="Load (%)" stroke="#3b82f6" fill="url(#colorParamA)" strokeWidth={2} />
                             <Line type="monotone" dataKey="paramB" name="TTD (°C x10)" stroke="#ef4444" strokeWidth={2} dot={false} />
                             
                             <ReferenceLine x="T+30m" stroke="#f59e0b" strokeDasharray="3 3" label={{value:'Divergence', fill:'#f59e0b', fontSize:10}} />
                         </ComposedChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

         </div>

         {/* RIGHT: Expert Council */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
             
             {/* Expert Roster */}
             <div className="flex -space-x-2 overflow-hidden py-1">
                 {EXPERTS.map((exp, i) => (
                     <div key={exp.id} className="relative group cursor-pointer">
                         <div className="w-10 h-10 rounded-full border-2 border-[#030407] flex items-center justify-center text-xs font-bold text-white shadow-lg transition-transform hover:scale-110 hover:z-10" style={{backgroundColor: exp.avatarColor}}>
                             {exp.name.charAt(0)}
                         </div>
                         <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#030407] ${exp.status === 'Online' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                     </div>
                 ))}
                 <div className="w-10 h-10 rounded-full border-2 border-[#030407] bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold hover:bg-slate-700 cursor-pointer">
                     +2
                 </div>
             </div>

             {/* Discussion Feed */}
             <SciFiCard title="专家研讨记录" subtitle="LIVE FEED" className="flex-1 border-indigo-900/30">
                 <div className="flex flex-col h-full gap-3">
                     <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                         {DISCUSSION_LOG.map((msg) => (
                             <div key={msg.id} className={`flex flex-col gap-1 ${msg.type === 'System' ? 'opacity-70' : ''}`}>
                                 <div className="flex justify-between items-baseline">
                                     <span className={`text-[10px] font-bold ${msg.expertId === 'System' ? 'text-slate-500' : 'text-indigo-300'}`}>
                                         {msg.expertId === 'System' ? 'SYSTEM' : EXPERTS.find(e => e.id === msg.expertId)?.name || msg.expertId}
                                     </span>
                                     <span className="text-[9px] text-slate-600 font-mono">{msg.time}</span>
                                 </div>
                                 <div className={`p-2 rounded text-xs leading-relaxed
                                     ${msg.type === 'Proposal' ? 'bg-emerald-900/20 border border-emerald-900/50 text-emerald-100' : 
                                       msg.type === 'Question' ? 'bg-amber-900/10 border border-amber-900/30 text-amber-100' : 
                                       msg.type === 'System' ? 'bg-slate-900/30 text-slate-400 text-[10px] italic' :
                                       'bg-slate-800/50 border border-slate-700 text-slate-300'}
                                 `}>
                                     {msg.content}
                                 </div>
                             </div>
                         ))}
                     </div>
                     
                     <div className="mt-auto">
                         <div className="flex gap-2 mb-2">
                             <button className="flex-1 py-1.5 bg-indigo-900/30 border border-indigo-500/30 rounded text-[10px] text-indigo-300 hover:bg-indigo-900/50">Propose Solution</button>
                             <button className="flex-1 py-1.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 hover:bg-slate-700">Ask Question</button>
                         </div>
                         <div className="relative">
                             <input 
                               className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" 
                               placeholder="Type your insight..."
                             />
                             <button className="absolute right-1 top-1 p-1 bg-indigo-600 rounded text-white hover:bg-indigo-500">
                                 <ArrowRight size={12}/>
                             </button>
                         </div>
                     </div>
                 </div>
             </SciFiCard>

             {/* Conclusion / Vote */}
             <SciFiCard title="结论投票 (Consensus)" subtitle="PENDING" className="h-40 border-slate-800">
                 <div className="flex flex-col h-full justify-between">
                     <div className="text-xs text-slate-400 text-center px-4">
                         Current Hypothesis: <strong className="text-white">Partition Plate Leakage</strong>
                     </div>
                     
                     <div className="flex justify-center gap-4">
                         <div className="flex flex-col items-center gap-1">
                             <div className="w-10 h-10 rounded-full bg-green-900/20 border border-green-500 flex items-center justify-center text-green-500 hover:bg-green-900/40 cursor-pointer">
                                 <ThumbsUp size={16} />
                             </div>
                             <span className="text-[9px] text-slate-500">Agree (1)</span>
                         </div>
                         <div className="flex flex-col items-center gap-1">
                             <div className="w-10 h-10 rounded-full bg-red-900/20 border border-red-500 flex items-center justify-center text-red-500 hover:bg-red-900/40 cursor-pointer">
                                 <ThumbsDown size={16} />
                             </div>
                             <span className="text-[9px] text-slate-500">Disagree (0)</span>
                         </div>
                     </div>

                     <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                         <div className="h-full bg-green-500 w-[33%]"></div>
                     </div>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
