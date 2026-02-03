
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AlertOctagon, CheckCircle2, Clock, MessageSquare, 
  Search, Filter, User, Phone, Mail, 
  Activity, GitMerge, ShieldAlert, FileText, 
  ArrowRight, ThumbsUp, ThumbsDown, Siren,
  ListTodo, Stethoscope, Microscope, RefreshCw,
  GitPullRequest
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, ComposedChart, Area
} from 'recharts';

// --- Types ---

type TicketStatus = 'Open' | 'Analyzing' | 'Action' | 'Verify' | 'Closed';
type Severity = 'Critical' | 'Major' | 'Minor';

interface ComplaintTicket {
  id: string;
  customer: string;
  product: string;
  subject: string;
  severity: Severity;
  status: TicketStatus;
  created: string;
  sla: number; // hours remaining
  description: string;
  assignee: string;
  progress: number; // 0-100% of 8D process
}

// 8D Process Steps
interface EightDStep {
  step: string; // D1 - D8
  label: string;
  status: 'Done' | 'Current' | 'Pending';
  details: string;
}

// --- Mock Data ---

const TICKETS: ComplaintTicket[] = [
  { id: 'NCR-2024-089', customer: 'Shanghai Heavy Ind.', product: 'Gas Turbine GT-101', subject: '叶片异常振动频谱', severity: 'Critical', status: 'Analyzing', created: '2024-03-20 09:30', sla: 4, description: '客户监测系统报告2号轴承处振动超过ISO标准限值，频谱显示存在1x转频分量，请求紧急介入。', assignee: 'Dr. Zhang', progress: 25 },
  { id: 'NCR-2024-088', customer: 'Pacific Power Group', product: 'Control Panel X5', subject: 'HMI 触摸屏间歇性失灵', severity: 'Major', status: 'Action', created: '2024-03-19 14:15', sla: 24, description: '操作员反馈在高温环境下屏幕触控响应延迟，影响操作效率。初步怀疑散热不良。', assignee: 'Li Tech', progress: 60 },
  { id: 'CS-2024-112', customer: 'AutoWorks GmbH', product: 'Servo Motor M-200', subject: '包装箱破损导致外观划痕', severity: 'Minor', status: 'Verify', created: '2024-03-18 10:00', sla: 48, description: '收货检验发现外包装受潮，电机外壳有轻微划痕，需确认内部绝缘是否受影响。', assignee: 'Wang QA', progress: 85 },
  { id: 'NCR-2024-085', customer: 'Municipal Water', product: 'Pump P-01', subject: '密封圈早期磨损', severity: 'Major', status: 'Closed', created: '2024-03-15 08:00', sla: 0, description: '运行500小时后发现机械密封泄漏量超标。', assignee: 'Chen Eng', progress: 100 },
];

const EIGHT_D_STEPS: EightDStep[] = [
  { step: 'D1', label: '成立小组 (Team)', status: 'Done', details: 'Lead: Dr. Zhang, QA, R&D' },
  { step: 'D2', label: '问题描述 (Describe)', status: 'Done', details: 'Vib > 8.5mm/s @ 3krpm' },
  { step: 'D3', label: '围堵措施 (Contain)', status: 'Current', details: 'Remote Load Limit 80%' },
  { step: 'D4', label: '根因分析 (Root Cause)', status: 'Pending', details: 'Fishbone / 5-Why' },
  { step: 'D5', label: '永久对策 (Corrective)', status: 'Pending', details: 'Plan Generation' },
  { step: 'D6', label: '效果验证 (Verify)', status: 'Pending', details: 'Test Run' },
  { step: 'D7', label: '预防再发 (Prevent)', status: 'Pending', details: 'Process Update' },
  { step: 'D8', label: '结案致谢 (Close)', status: 'Pending', details: 'Report & Reward' },
];

const PARETO_DATA = [
  { type: '软件故障', count: 45 },
  { type: '机械磨损', count: 32 },
  { type: '电气元件', count: 28 },
  { type: '物流损坏', count: 12 },
  { type: '文档缺失', count: 5 },
];

const SATISFACTION_TREND = [
  { month: 'Oct', nps: 42, volume: 15 },
  { month: 'Nov', nps: 45, volume: 18 },
  { month: 'Dec', nps: 38, volume: 25 },
  { month: 'Jan', nps: 52, volume: 12 },
  { month: 'Feb', nps: 58, volume: 10 },
  { month: 'Mar', nps: 65, volume: 8 },
];

// --- Helper Components ---

const SeverityBadge: React.FC<{ level: Severity }> = ({ level }) => {
  const colors = {
    'Critical': 'bg-red-500 shadow-[0_0_10px_#ef4444] text-white',
    'Major': 'bg-orange-500 text-white',
    'Minor': 'bg-blue-500 text-white'
  }[level];
  return <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${colors}`}>{level}</span>;
};

const ProcessNode: React.FC<{ step: EightDStep }> = ({ step }) => {
  const styles = {
    'Done': 'bg-emerald-900/40 border-emerald-500 text-emerald-400',
    'Current': 'bg-blue-900/40 border-blue-500 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-1 ring-blue-400 scale-105',
    'Pending': 'bg-slate-900/40 border-slate-700 text-slate-500 opacity-60'
  }[step.status];

  return (
    <div className={`flex flex-col p-2 border rounded transition-all duration-300 relative ${styles}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="font-bold text-xs font-mono">{step.step}</span>
        {step.status === 'Done' && <CheckCircle2 size={12} />}
        {step.status === 'Current' && <Activity size={12} className="animate-pulse" />}
      </div>
      <div className="text-[10px] font-bold mb-1 truncate">{step.label}</div>
      <div className="text-[9px] leading-tight truncate opacity-80">{step.details}</div>
    </div>
  );
};

export const CustomerComplaintsView: React.FC = () => {
  const [selectedTicketId, setSelectedTicketId] = useState(TICKETS[0].id);
  const activeTicket = TICKETS.find(t => t.id === selectedTicketId) || TICKETS[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & Global KPIs */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-red-900/40 pb-4 bg-gradient-to-r from-[#1a0505] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-400 mb-1 uppercase tracking-wider">
             <ShieldAlert size={14} /> Quality Assurance Center
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户投诉与 <span className="text-red-500">质量闭环管理</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-end">
            <div className="text-right border-r border-red-900/30 pr-6">
                <div className="text-[10px] text-slate-500 uppercase">Active Issues</div>
                <div className="text-xl font-mono font-bold text-white">12 <span className="text-xs text-red-500 font-normal">(2 Crit)</span></div>
            </div>
            <div className="text-right border-r border-red-900/30 pr-6">
                <div className="text-[10px] text-slate-500 uppercase">Avg Resolution</div>
                <div className="text-xl font-mono font-bold text-yellow-400">28h</div>
            </div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Customer Sat (CSAT)</div>
                <div className="text-xl font-mono font-bold text-green-400">4.8/5.0</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Issue Stream */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search NCR, Customer..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-red-500 text-slate-200"
                  />
               </div>
               <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-400">
                  <Filter size={14} />
               </button>
           </div>

           <div className="flex flex-col gap-2">
               {TICKETS.map(ticket => (
                   <div 
                     key={ticket.id}
                     onClick={() => setSelectedTicketId(ticket.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-200 relative group
                        ${selectedTicketId === ticket.id 
                            ? 'bg-red-950/30 border-red-500/50 shadow-[inset_4px_0_0_#ef4444]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-mono text-slate-500">{ticket.id}</span>
                           <span className="text-[10px] text-slate-400">{ticket.created.split(' ')[0]}</span>
                       </div>
                       
                       <h3 className={`font-bold text-sm mb-1 line-clamp-1 ${selectedTicketId === ticket.id ? 'text-white' : 'text-slate-300'}`}>
                           {ticket.subject}
                       </h3>
                       
                       <div className="flex justify-between items-center mt-2">
                           <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{ticket.customer}</div>
                           <SeverityBadge level={ticket.severity} />
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: The 8D Workbench */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Case Header */}
           <SciFiCard className="border-red-900/30 bg-[#0c0505]" noPadding>
               <div className="p-4">
                   <div className="flex justify-between items-start">
                       <div>
                           <div className="flex items-center gap-3 mb-2">
                               <h2 className="text-xl font-bold text-white">{activeTicket.subject}</h2>
                               <span className="px-2 py-0.5 rounded border border-slate-700 text-xs text-slate-300 bg-slate-900">
                                   {activeTicket.product}
                               </span>
                           </div>
                           <div className="flex gap-6 text-xs text-slate-400">
                               <span className="flex items-center gap-1"><User size={12}/> {activeTicket.customer}</span>
                               <span className="flex items-center gap-1"><Stethoscope size={12}/> Assignee: {activeTicket.assignee}</span>
                               <span className="flex items-center gap-1 text-red-400"><Clock size={12}/> SLA Remaining: {activeTicket.sla}h</span>
                           </div>
                       </div>
                       <div className="text-right">
                            <div className="text-[10px] text-slate-500 uppercase font-bold">8D Progress</div>
                            <div className="text-2xl font-bold text-red-500">{activeTicket.progress}%</div>
                       </div>
                   </div>
                   
                   <div className="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded text-sm text-slate-300 leading-relaxed flex gap-3">
                       <FileText size={16} className="text-red-400 shrink-0 mt-0.5" />
                       <div>
                           <span className="text-red-400 font-bold mr-2 text-xs uppercase">Issue Description</span>
                           {activeTicket.description}
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* 8D Process Visualization */}
           <SciFiCard title="8D 闭环处置流程" subtitle="PROCESS TRACKER" className="border-slate-800">
               <div className="grid grid-cols-4 gap-3">
                   {EIGHT_D_STEPS.map((step, i) => (
                       <ProcessNode key={i} step={step} />
                   ))}
               </div>
               
               {/* Connection Lines (Visual only) */}
               <div className="h-1 w-full bg-slate-800 mt-[-10px] mb-4 relative -z-10 rounded overflow-hidden">
                   <div className="h-full bg-blue-500/50 transition-all duration-500" style={{width: `${activeTicket.progress}%`}}></div>
               </div>
           </SciFiCard>

           {/* Diagnostic Workspace */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
               {/* Root Cause Analysis (5-Why) */}
               <SciFiCard title="根因分析 (Root Cause)" subtitle="5-WHY" className="border-slate-800">
                   <div className="space-y-3 relative">
                       {/* Connecting Line */}
                       <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-700 -z-0"></div>
                       
                       <div className="flex gap-3 relative z-10">
                           <div className="w-6 h-6 rounded bg-slate-800 border border-slate-600 flex items-center justify-center text-xs text-slate-300 font-bold shrink-0">1</div>
                           <input className="flex-1 bg-slate-900/50 border border-slate-700 rounded px-2 py-1 text-xs focus:border-red-500 outline-none text-slate-300" defaultValue="Why: Vibration exceeded limit?" />
                       </div>
                       <div className="flex gap-3 relative z-10">
                           <div className="w-6 h-6 rounded bg-slate-800 border border-slate-600 flex items-center justify-center text-xs text-slate-300 font-bold shrink-0">2</div>
                           <input className="flex-1 bg-slate-900/50 border border-slate-700 rounded px-2 py-1 text-xs focus:border-red-500 outline-none text-slate-300" defaultValue="Why: Rotor imbalance detected." />
                       </div>
                       <div className="flex gap-3 relative z-10">
                           <div className="w-6 h-6 rounded bg-slate-800 border border-slate-600 flex items-center justify-center text-xs text-slate-300 font-bold shrink-0">3</div>
                           <input className="flex-1 bg-slate-900/50 border border-slate-700 rounded px-2 py-1 text-xs focus:border-red-500 outline-none text-slate-300" defaultValue="Why: Balancing weight detached." />
                       </div>
                       <div className="flex gap-3 relative z-10">
                           <div className="w-6 h-6 rounded bg-red-900/20 border border-red-500 text-red-400 flex items-center justify-center text-xs font-bold shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.4)]">R</div>
                           <div className="flex-1 bg-red-900/10 border border-red-900/30 rounded px-2 py-1 text-xs text-red-200">
                               <strong>Root Cause:</strong> Adhesion failure due to high operating temp (&gt;120°C).
                           </div>
                       </div>
                   </div>
                   <div className="mt-3 flex justify-end">
                       <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                           <GitPullRequest size={12} /> Link to Fishbone Diagram
                       </button>
                   </div>
               </SciFiCard>

               {/* CAPA Actions */}
               <SciFiCard title="纠正与预防措施 (CAPA)" subtitle="ACTION PLAN" className="border-slate-800">
                   <div className="space-y-2">
                       <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded border border-slate-700 hover:border-slate-600">
                           <input type="checkbox" checked className="accent-green-500" readOnly />
                           <span className="text-xs text-slate-300 line-through decoration-slate-500">Immediate: Stop unit & Inspect</span>
                           <span className="ml-auto text-[10px] bg-green-900/20 text-green-500 px-1.5 rounded">Done</span>
                       </div>
                       <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded border border-slate-700 hover:border-slate-600">
                           <input type="checkbox" className="accent-green-500" />
                           <span className="text-xs text-slate-300">Correction: Re-apply weight with HT glue</span>
                           <span className="ml-auto text-[10px] bg-yellow-900/20 text-yellow-500 px-1.5 rounded">WIP</span>
                       </div>
                       <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded border border-slate-700 hover:border-slate-600">
                           <input type="checkbox" className="accent-green-500" />
                           <span className="text-xs text-slate-300">Preventive: Update bonding procedure specs</span>
                           <span className="ml-auto text-[10px] bg-slate-800 text-slate-500 px-1.5 rounded">Plan</span>
                       </div>
                   </div>
                   <button className="mt-3 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded border border-slate-600 flex items-center justify-center gap-2 transition-colors">
                       <ListTodo size={12} /> Add Action Item
                   </button>
               </SciFiCard>
           </div>

        </div>

        {/* RIGHT COLUMN: Quality Intelligence */}
        <div className="w-full lg:w-[300px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Pareto Chart */}
           <SciFiCard title="故障类型分布" subtitle="PARETO (TOP 5)" className="border-red-900/30">
               <div className="h-48 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={PARETO_DATA} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                           <XAxis type="number" hide />
                           <YAxis dataKey="type" type="category" stroke="#94a3b8" width={60} tick={{fontSize: 10}} />
                           <Tooltip cursor={{fill: '#1a0505'}} contentStyle={{backgroundColor: '#000', borderColor: '#ef4444'}} />
                           <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={15}>
                                <Cell fill="#ef4444" />
                                <Cell fill="#f97316" />
                                <Cell fill="#f59e0b" />
                                <Cell fill="#3b82f6" />
                                <Cell fill="#64748b" />
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Satisfaction Trend */}
           <SciFiCard title="客户满意度趋势" subtitle="CSAT / NPS" className="border-slate-800">
               <div className="h-40 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={SATISFACTION_TREND}>
                           <defs>
                               <linearGradient id="colorNps" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                           <XAxis dataKey="month" stroke="#666" tick={{fontSize: 10}} />
                           <YAxis yAxisId="left" stroke="#666" tick={{fontSize: 10}} domain={[0, 100]} />
                           <YAxis yAxisId="right" orientation="right" hide />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#10b981'}} />
                           <Area yAxisId="left" type="monotone" dataKey="nps" stroke="#10b981" fill="url(#colorNps)" name="NPS Score" />
                           <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#64748b" strokeWidth={1} dot={false} name="Ticket Vol" />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Feedback Loop */}
           <SciFiCard title="客户反馈闭环" className="flex-1 border-slate-800">
               <div className="space-y-3">
                   <div className="p-3 bg-slate-900/50 rounded border border-slate-700 relative">
                       <div className="flex justify-between items-center mb-1">
                           <span className="text-[10px] text-slate-500 font-bold">AutoWorks GmbH</span>
                           <ThumbsUp size={12} className="text-green-500" />
                       </div>
                       <p className="text-xs text-slate-300 italic">"Response time was excellent. Tech arrived within 4 hours."</p>
                   </div>
                   <div className="p-3 bg-slate-900/50 rounded border border-slate-700 relative">
                       <div className="flex justify-between items-center mb-1">
                           <span className="text-[10px] text-slate-500 font-bold">Pacific Power</span>
                           <ThumbsDown size={12} className="text-red-500" />
                       </div>
                       <p className="text-xs text-slate-300 italic">"Need better spare parts availability next time."</p>
                   </div>
               </div>
               <button className="mt-auto w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded border border-slate-600 flex items-center justify-center gap-2 transition-colors">
                   <MessageSquare size={12} /> Send Satisfaction Survey
               </button>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
