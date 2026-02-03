
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Siren, ShieldAlert, Activity, TrendingDown, 
  MessageSquare, Mic2, FileWarning, Lock, 
  Unlock, Send, UserX, Globe, Bell, 
  AlertTriangle, CheckSquare, XOctagon, 
  Radio, Megaphone, Eye, PhoneCall
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, ReferenceLine
} from 'recharts';

// --- Types ---

type CrisisLevel = 'DEFCON 1' | 'DEFCON 2' | 'DEFCON 3' | 'DEFCON 4' | 'Normal';
type Status = 'Active' | 'Contained' | 'Resolved' | 'Monitoring';

interface CrisisEvent {
  id: string;
  customer: string;
  title: string;
  level: CrisisLevel;
  type: string; // e.g., "Data Leak", "PR Scandal"
  status: Status;
  startTime: string;
  sentiment: number; // 0 (Negative) - 100 (Positive)
  impactValue: number; // Estimated financial impact
  mediaReach: number; // People reached
}

interface SopStep {
  id: string;
  task: string;
  role: string;
  status: 'Pending' | 'Done' | 'Skipped';
  time?: string;
}

interface PrAsset {
  type: 'Statement' | 'Press Release' | 'Internal Memo' | 'FAQ';
  title: string;
  status: 'Draft' | 'Approved' | 'Published';
}

// --- Mock Data ---

const CRISIS_LIST: CrisisEvent[] = [
  { id: 'INC-2403-A', customer: 'Titanium Holdings', title: '执行高管涉嫌商业贿赂传闻', level: 'DEFCON 2', type: 'Reputation', status: 'Active', startTime: '2024-03-20 08:30', sentiment: 15, impactValue: 2500000, mediaReach: 450000 },
  { id: 'INC-2403-B', customer: 'Pacific Power Group', title: 'Q1 财报数据泄露风险', level: 'DEFCON 3', type: 'Data Security', status: 'Monitoring', startTime: '2024-03-19 14:15', sentiment: 45, impactValue: 500000, mediaReach: 12000 },
  { id: 'INC-2402-C', customer: 'Shanghai Heavy Ind.', title: '工厂废水排放超标指控', level: 'DEFCON 4', type: 'Compliance', status: 'Resolved', startTime: '2024-02-10 09:00', sentiment: 75, impactValue: 0, mediaReach: 5000 },
];

const SENTIMENT_WAVE = Array.from({length: 24}, (_, i) => ({
  time: `${i}:00`,
  score: 50 + Math.sin(i/2) * 30 + (Math.random() - 0.5) * 20, // Fluctuating sentiment
  volume: Math.floor(Math.random() * 500) + 100
}));

const SOP_CHECKLIST: SopStep[] = [
  { id: 'S1', task: '启动危机响应小组 (CRT)', role: 'Commander', status: 'Done', time: '08:35' },
  { id: 'S2', task: '锁定相关客户数据权限', role: 'Data Steward', status: 'Done', time: '08:40' },
  { id: 'S3', task: '起草初步回应声明 (Holding Statement)', role: 'PR Lead', status: 'Pending' },
  { id: 'S4', task: '通知核心利益相关者', role: 'Account Mgr', status: 'Pending' },
  { id: 'S5', task: '全网舆情实时监控配置', role: 'Analyst', status: 'Pending' },
];

const PR_ASSETS: PrAsset[] = [
  { type: 'Statement', title: '关于所谓"商业贿赂"的严正声明', status: 'Draft' },
  { type: 'Internal Memo', title: '致全体员工：合规性重申', status: 'Approved' },
  { type: 'FAQ', title: '投资者问答口径 V1.0', status: 'Draft' },
];

const STAKEHOLDERS = [
  { role: 'Legal Counsel', name: 'Wang & Partners', contact: '+86 139...291' },
  { role: 'PR Agency', name: 'Global Comms', contact: '+86 138...992' },
  { role: 'CEO Office', name: 'Direct Line', contact: 'Ext. 8801' },
];

// --- Visual Components ---

const DefconBadge = ({ level }: { level: CrisisLevel }) => {
  const config = {
    'DEFCON 1': { color: 'bg-red-600 text-white animate-pulse', label: 'CRITICAL' },
    'DEFCON 2': { color: 'bg-orange-600 text-white', label: 'SEVERE' },
    'DEFCON 3': { color: 'bg-yellow-500 text-black', label: 'SUBSTANTIAL' },
    'DEFCON 4': { color: 'bg-green-600 text-white', label: 'MODERATE' },
    'Normal': { color: 'bg-slate-700 text-slate-300', label: 'LOW' },
  }[level];

  return (
    <div className={`flex items-center px-4 py-2 rounded-sm font-bold tracking-widest ${config.color} shadow-lg`}>
      <Siren size={18} className="mr-2" />
      {level} // {config.label}
    </div>
  );
};

const ThreatSonar = ({ intensity }: { intensity: number }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#05080a] border border-red-900/30 rounded-lg">
      {/* Grid */}
      <div className="absolute inset-0" style={{
         backgroundImage: 'radial-gradient(rgba(239, 68, 68, 0.2) 1px, transparent 1px)',
         backgroundSize: '20px 20px'
      }}></div>
      
      {/* Radar Circles */}
      <div className="absolute w-[80%] h-[80%] border border-red-900/30 rounded-full"></div>
      <div className="absolute w-[60%] h-[60%] border border-red-900/40 rounded-full"></div>
      <div className="absolute w-[40%] h-[40%] border border-red-900/50 rounded-full"></div>
      <div className="absolute w-[20%] h-[20%] border border-red-500/50 rounded-full bg-red-900/10"></div>
      
      {/* Scan Line */}
      <div className="absolute w-full h-full animate-[spin_4s_linear_infinite] origin-center">
         <div className="w-1/2 h-1/2 bg-gradient-to-l from-red-500/50 to-transparent absolute top-0 left-1/2 origin-bottom-left" style={{clipPath: 'polygon(0 0, 100% 0, 0 100%)'}}></div>
      </div>
      
      {/* Blips */}
      <div className="absolute top-[30%] left-[60%] w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
      <div className="absolute top-[70%] left-[40%] w-2 h-2 bg-orange-500 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
      
      <div className="absolute bottom-2 left-2 text-[10px] text-red-400 font-mono">
         THREAT INTENSITY: {intensity}%
      </div>
    </div>
  );
};

const NewsTicker = () => (
  <div className="flex items-center gap-2 bg-slate-900/80 border-y border-slate-800 py-1 px-4 overflow-hidden whitespace-nowrap">
      <span className="text-red-500 font-bold text-xs uppercase flex items-center gap-1 shrink-0"><Radio size={12}/> LIVE FEED:</span>
      <div className="flex gap-8 text-xs text-slate-300 font-mono animate-[marquee_20s_linear_infinite]">
          <span>[10:45] Social sentiment drops by 15% following tweet...</span>
          <span>[10:42] Competitor X releases statement...</span>
          <span>[10:30] Stock price affected (-2.1%)...</span>
          <span>[10:15] Media inquiry from Financial Times...</span>
      </div>
  </div>
);

export const CustomerCrisisResponseView: React.FC = () => {
  const [selectedIncidentId, setSelectedIncidentId] = useState(CRISIS_LIST[0].id);
  const activeIncident = CRISIS_LIST.find(i => i.id === selectedIncidentId) || CRISIS_LIST[0];

  return (
    <div className="h-full flex flex-col font-[Rajdhani] text-slate-200 bg-[#020408]">
      
      {/* 1. Command Header */}
      <div className="flex justify-between items-center p-4 border-b border-red-900/30 bg-gradient-to-r from-red-950/20 to-slate-950">
         <div className="flex items-center gap-4">
             <div className="p-2 bg-red-900/20 border border-red-500/50 rounded text-red-500">
                 <ShieldAlert size={24} />
             </div>
             <div>
                 <h1 className="text-2xl font-bold text-white tracking-tight">CRISIS COMMAND CENTER</h1>
                 <div className="text-xs text-red-400 uppercase tracking-widest">Customer Data Protection & PR Response</div>
             </div>
         </div>
         
         <div className="flex items-center gap-6">
             <div className="text-right">
                 <div className="text-[10px] text-slate-500 uppercase">Active Incident</div>
                 <div className="text-lg font-bold text-white">{activeIncident.id}</div>
             </div>
             <DefconBadge level={activeIncident.level} />
         </div>
      </div>

      <NewsTicker />

      {/* 2. Main Dashboard Grid */}
      <div className="flex-1 p-4 grid grid-cols-12 gap-4 min-h-0 overflow-hidden">
         
         {/* LEFT COL: Incident List & Stakeholders (3 cols) */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
             
             {/* Incident Selector */}
             <SciFiCard title="突发事件队列 (Incidents)" subtitle="ACTIVE" className="border-red-900/30">
                 <div className="flex flex-col gap-3">
                     {CRISIS_LIST.map(inc => (
                         <div 
                           key={inc.id}
                           onClick={() => setSelectedIncidentId(inc.id)}
                           className={`p-3 rounded border cursor-pointer transition-all relative overflow-hidden
                              ${selectedIncidentId === inc.id 
                                  ? 'bg-red-950/40 border-red-500 text-white' 
                                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-600'}
                           `}
                         >
                             {selectedIncidentId === inc.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}
                             <div className="flex justify-between items-start mb-1">
                                 <span className="text-[10px] font-mono opacity-70">{inc.id}</span>
                                 <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${inc.status === 'Active' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'}`}>{inc.status}</span>
                             </div>
                             <div className="font-bold text-sm mb-1 line-clamp-1">{inc.title}</div>
                             <div className="text-[10px] opacity-80 flex justify-between">
                                 <span>{inc.customer}</span>
                                 <span>{inc.type}</span>
                             </div>
                         </div>
                     ))}
                 </div>
                 <button className="w-full mt-3 py-2 border border-dashed border-slate-700 text-slate-500 text-xs rounded hover:text-red-400 hover:border-red-500/50 transition-colors flex items-center justify-center gap-2">
                     <AlertTriangle size={12} /> Report New Incident
                 </button>
             </SciFiCard>

             {/* Stakeholder Contacts */}
             <SciFiCard title="紧急联络人 (Emergency Contacts)" className="flex-1 border-slate-800">
                 <div className="space-y-3">
                     {STAKEHOLDERS.map((person, i) => (
                         <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-700">
                             <div>
                                 <div className="text-xs font-bold text-slate-200">{person.role}</div>
                                 <div className="text-[10px] text-slate-500">{person.name}</div>
                             </div>
                             <button className="p-1.5 bg-green-900/20 text-green-400 border border-green-800 rounded hover:bg-green-900/40 transition-colors">
                                 <PhoneCall size={14} />
                             </button>
                         </div>
                     ))}
                 </div>
             </SciFiCard>

         </div>

         {/* CENTER COL: Threat Visualization & Sentiment (6 cols) */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
             
             {/* Main Visualizer */}
             <div className="grid grid-cols-2 gap-4 h-[300px]">
                 <SciFiCard title="舆情雷达 (Threat Sonar)" subtitle="MONITORING" className="border-red-900/50 bg-[#080505]" noPadding>
                     <div className="w-full h-full p-2">
                         <ThreatSonar intensity={100 - activeIncident.sentiment} />
                     </div>
                 </SciFiCard>

                 <SciFiCard title="影响评估 (Impact Assessment)" subtitle="ESTIMATED" className="border-slate-800">
                     <div className="flex flex-col gap-4 h-full justify-center px-2">
                         <div>
                             <div className="text-xs text-slate-400 uppercase mb-1">Projected Financial Loss</div>
                             <div className="text-3xl font-mono font-bold text-red-500">¥ {(activeIncident.impactValue/10000).toFixed(0)} W</div>
                         </div>
                         <div className="w-full h-px bg-slate-800"></div>
                         <div>
                             <div className="text-xs text-slate-400 uppercase mb-1">Public Exposure (Reach)</div>
                             <div className="text-3xl font-mono font-bold text-orange-400">{(activeIncident.mediaReach/1000).toFixed(1)} K</div>
                         </div>
                         <div className="w-full h-px bg-slate-800"></div>
                         <div>
                             <div className="text-xs text-slate-400 uppercase mb-1">Current Sentiment</div>
                             <div className="text-3xl font-mono font-bold text-white flex items-center gap-2">
                                 {activeIncident.sentiment}/100 
                                 <span className="text-xs font-normal text-red-400 bg-red-900/20 px-2 py-0.5 rounded">Critical</span>
                             </div>
                         </div>
                     </div>
                 </SciFiCard>
             </div>

             {/* Sentiment Chart */}
             <SciFiCard title="舆情声量趋势 (Sentiment Wave)" subtitle="24H" className="h-[250px] border-slate-800">
                 <div className="w-full h-full p-2">
                     <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={SENTIMENT_WAVE}>
                             <defs>
                                 <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                 </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                             <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                             <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                             <Tooltip contentStyle={{backgroundColor: '#0f0505', borderColor: '#ef4444', color: '#fff'}} />
                             <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" label={{value:'Neutral', fill:'#f59e0b', fontSize:10}} />
                             <Area type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={2} fill="url(#colorScore)" name="Sentiment Index" />
                             <Bar dataKey="volume" fill="#334155" barSize={10} yAxisId={0} opacity={0.3} />
                         </AreaChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

             {/* Action Buttons */}
             <div className="grid grid-cols-3 gap-4">
                 <button className="py-3 bg-slate-800 hover:bg-red-900/40 border border-slate-700 hover:border-red-500 text-slate-300 hover:text-white rounded text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 group">
                     <Lock size={16} className="text-slate-500 group-hover:text-red-400" />
                     <span>Lockdown Data</span>
                 </button>
                 <button className="py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 hover:text-white text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 group">
                     <Globe size={16} className="text-slate-500 group-hover:text-cyan-400" />
                     <span>Social Monitoring</span>
                 </button>
                 <button className="py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 hover:text-white text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 group">
                     <FileWarning size={16} className="text-slate-500 group-hover:text-yellow-400" />
                     <span>Legal Audit</span>
                 </button>
             </div>

         </div>

         {/* RIGHT COL: Response Protocol (3 cols) */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-1">
             
             {/* SOP Checklist */}
             <SciFiCard title="标准应对流程 (SOP)" subtitle="PROTOCOL" className="border-slate-800">
                 <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                     {SOP_CHECKLIST.map((step, i) => (
                         <div key={step.id} className="relative group">
                             <div className={`absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 z-10 flex items-center justify-center
                                 ${step.status === 'Done' ? 'bg-green-500 border-green-500' : 
                                   step.status === 'Pending' ? 'bg-slate-900 border-yellow-500' : 'bg-slate-800 border-slate-600'}
                             `}>
                                 {step.status === 'Done' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                             </div>
                             
                             <div className={`text-xs p-2 rounded border transition-colors cursor-pointer
                                 ${step.status === 'Pending' ? 'bg-yellow-900/10 border-yellow-900/30 text-yellow-200 hover:bg-yellow-900/20' : 
                                   step.status === 'Done' ? 'bg-slate-900/30 border-slate-800 text-slate-500 line-through decoration-slate-600' : ''}
                             `}>
                                 <div className="font-bold">{step.task}</div>
                                 <div className="flex justify-between mt-1 text-[10px] opacity-70">
                                     <span>{step.role}</span>
                                     {step.time && <span>{step.time}</span>}
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>

             {/* PR Assets */}
             <SciFiCard title="公关素材库 (PR Assets)" subtitle="TEMPLATES" className="flex-1 border-slate-800">
                 <div className="flex flex-col gap-2">
                     {PR_ASSETS.map((asset, i) => (
                         <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 border border-slate-700 rounded hover:border-cyan-500/50 transition-colors group cursor-pointer">
                             <div className="flex items-center gap-2 overflow-hidden">
                                 <div className="p-1.5 bg-slate-800 rounded text-slate-400 group-hover:text-cyan-400">
                                     <Mic2 size={14} />
                                 </div>
                                 <div className="min-w-0">
                                     <div className="text-xs text-slate-200 truncate">{asset.title}</div>
                                     <div className="text-[9px] text-slate-500">{asset.type}</div>
                                 </div>
                             </div>
                             <span className={`text-[9px] px-1.5 py-0.5 rounded border 
                                 ${asset.status === 'Approved' ? 'text-green-400 border-green-900/50 bg-green-900/10' : 'text-slate-400 border-slate-700 bg-slate-800'}
                             `}>
                                 {asset.status}
                             </span>
                         </div>
                     ))}
                 </div>
                 
                 <div className="mt-auto pt-4 flex gap-2">
                     <button className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors">
                         <Send size={12} /> Publish
                     </button>
                     <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 flex items-center justify-center gap-2 transition-colors">
                         <CheckSquare size={12} /> Approve
                     </button>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
