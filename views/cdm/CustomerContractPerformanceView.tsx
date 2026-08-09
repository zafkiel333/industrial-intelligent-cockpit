
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  FileCheck, AlertOctagon, TrendingUp, Calendar, 
  DollarSign, Activity, CheckCircle2, XCircle, 
  Clock, Shield, Target, Scale, 
  Search, Filter, ArrowRight, Gavel, 
  Briefcase, Percent, AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, RadialBarChart, RadialBar, Legend, LineChart, Line, ReferenceLine,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- Types ---

type MilestoneStatus = 'Completed' | 'In Progress' | 'Pending' | 'Delayed' | 'At Risk';

interface Milestone {
  id: string;
  name: string;
  dueDate: string;
  completionDate?: string;
  status: MilestoneStatus;
  weight: number; // Importance 0-100
  paymentAmount?: number;
}

interface ContractPerformance {
  id: string;
  title: string;
  customer: string;
  totalValue: number;
  signedDate: string;
  endDate: string;
  fulfillmentRate: number; // %
  qualityScore: number; // 0-100
  timeScore: number; // 0-100
  costScore: number; // 0-100
  status: 'Executing' | 'Completed' | 'Breach Warning' | 'Dispute';
  milestones: Milestone[];
  risks: { type: string; level: 'High' | 'Medium' | 'Low'; desc: string }[];
}

// --- Mock Data ---

const CONTRACTS: ContractPerformance[] = [
  {
    id: 'CTR-2024-HYD-01',
    title: '2024年度核心液压系统采购框架协议',
    customer: '上海重工集团',
    totalValue: 12500000,
    signedDate: '2024-01-15',
    endDate: '2024-12-31',
    fulfillmentRate: 68.5,
    qualityScore: 98,
    timeScore: 85,
    costScore: 92,
    status: 'Executing',
    milestones: [
      { id: 'M1', name: '首批预付款支付', dueDate: '2024-01-30', completionDate: '2024-01-28', status: 'Completed', weight: 10, paymentAmount: 2500000 },
      { id: 'M2', name: 'Q1 产品交付验收', dueDate: '2024-03-31', completionDate: '2024-03-30', status: 'Completed', weight: 25, paymentAmount: 3000000 },
      { id: 'M3', name: 'Q2 产品交付验收', dueDate: '2024-06-30', status: 'In Progress', weight: 25, paymentAmount: 3000000 },
      { id: 'M4', name: 'Q3 产品交付验收', dueDate: '2024-09-30', status: 'Pending', weight: 25, paymentAmount: 3000000 },
      { id: 'M5', name: '年度质保金结算', dueDate: '2025-01-15', status: 'Pending', weight: 15, paymentAmount: 1000000 },
    ],
    risks: [
      { type: '供应链', level: 'Medium', desc: '核心密封件进口货期延长风险' }
    ]
  },
  {
    id: 'CTR-2023-SVC-88',
    title: '智能运维全托管服务合同',
    customer: '太平洋电力集团',
    totalValue: 4800000,
    signedDate: '2023-06-01',
    endDate: '2026-06-01',
    fulfillmentRate: 92.0,
    qualityScore: 99,
    timeScore: 98,
    costScore: 95,
    status: 'Executing',
    milestones: [
      { id: 'M1', name: '系统部署上线', dueDate: '2023-07-01', completionDate: '2023-06-28', status: 'Completed', weight: 20 },
      { id: 'M2', name: '2023年度SLA考核', dueDate: '2023-12-31', completionDate: '2024-01-05', status: 'Completed', weight: 30 },
      { id: 'M3', name: '2024半年度巡检', dueDate: '2024-06-30', status: 'Pending', weight: 10 },
    ],
    risks: []
  },
  {
    id: 'CTR-2024-DEV-09',
    title: '新型破碎机联合研发协议',
    customer: '北方矿业',
    totalValue: 8500000,
    signedDate: '2024-02-10',
    endDate: '2024-11-30',
    fulfillmentRate: 35.0,
    qualityScore: 88,
    timeScore: 60,
    costScore: 90,
    status: 'Breach Warning',
    milestones: [
      { id: 'M1', name: '原型机设计冻结', dueDate: '2024-03-15', completionDate: '2024-03-20', status: 'Completed', weight: 20 },
      { id: 'M2', name: '样机试制完成', dueDate: '2024-05-15', status: 'Delayed', weight: 40 },
      { id: 'M3', name: '现场工业性试验', dueDate: '2024-08-30', status: 'At Risk', weight: 40 },
    ],
    risks: [
      { type: '进度', level: 'High', desc: '关键零部件加工延期，导致样机组装滞后15天' },
      { type: '技术', level: 'Medium', desc: '高负荷下振动指标未达标' }
    ]
  }
];

const PERFORMANCE_TREND = [
  { month: '10月', score: 92, fulfillment: 88 },
  { month: '11月', score: 94, fulfillment: 90 },
  { month: '12月', score: 91, fulfillment: 92 },
  { month: '1月', score: 95, fulfillment: 89 },
  { month: '2月', score: 88, fulfillment: 85 },
  { month: '3月', score: 93, fulfillment: 91 },
];

const OBLIGATION_DISTRIBUTION = [
  { name: '按时交付', value: 85, fill: '#10b981' },
  { name: '质量达标', value: 92, fill: '#3b82f6' },
  { name: '文档完整', value: 78, fill: '#f59e0b' },
  { name: '响应速度', value: 88, fill: '#8b5cf6' },
];

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    'Executing': 'bg-blue-900/30 text-blue-400 border-blue-800',
    'Completed': 'bg-green-900/30 text-green-400 border-green-800',
    'Breach Warning': 'bg-red-900/30 text-red-400 border-red-800 animate-pulse',
    'Dispute': 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
  }[status] || 'bg-slate-800 text-slate-400';

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles}`}>
      {status === 'Breach Warning' ? '履约预警' : status === 'Executing' ? '执行中' : status === 'Completed' ? '已完结' : '争议中'}
    </span>
  );
};

const MilestoneNode: React.FC<{ ms: Milestone; index: number; total: number }> = ({ ms, index, total }) => {
  const isLast = index === total - 1;
  const statusColor = 
    ms.status === 'Completed' ? '#10b981' : 
    ms.status === 'In Progress' ? '#3b82f6' : 
    ms.status === 'Delayed' ? '#ef4444' : 
    ms.status === 'At Risk' ? '#f59e0b' : '#475569';

  return (
    <div className="flex flex-col items-center relative flex-1">
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute top-4 left-1/2 w-full h-1 bg-slate-800 -z-10">
          <div 
            className="h-full transition-all duration-1000" 
            style={{ 
              width: ms.status === 'Completed' ? '100%' : '0%', 
              backgroundColor: '#10b981' 
            }}
          ></div>
        </div>
      )}

      {/* Node */}
      <div 
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-[#0b1221] z-10 transition-all duration-300
          ${ms.status === 'In Progress' ? 'scale-125 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : ''}
        `}
        style={{ borderColor: statusColor, color: statusColor }}
      >
        {ms.status === 'Completed' ? <CheckCircle2 size={16} /> : 
         ms.status === 'Delayed' ? <AlertTriangle size={16} /> : 
         ms.status === 'At Risk' ? <AlertOctagon size={16} /> :
         <div className="w-2 h-2 rounded-full bg-current" />}
      </div>

      {/* Label */}
      <div className="mt-3 text-center px-1">
        <div className="text-[10px] text-slate-500 font-mono mb-1">{ms.dueDate}</div>
        <div className={`text-xs font-bold ${ms.status === 'Delayed' || ms.status === 'At Risk' ? 'text-red-300' : 'text-slate-200'}`}>
          {ms.name}
        </div>
        {ms.paymentAmount && (
          <div className="mt-1 text-[10px] text-emerald-400 bg-emerald-900/20 px-1.5 py-0.5 rounded inline-block">
            ¥ {(ms.paymentAmount/10000).toFixed(0)}万
          </div>
        )}
      </div>
    </div>
  );
};

export const CustomerContractPerformanceView: React.FC = () => {
  const [selectedContractId, setSelectedContractId] = useState(CONTRACTS[0].id);
  const activeContract = CONTRACTS.find(c => c.id === selectedContractId) || CONTRACTS[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0c0a1f] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <Scale size={14} /> Contract Lifecycle Management
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户合同 <span className="text-indigo-500">履约跟踪驾驶舱</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Total Contract Value</div>
                <div className="text-xl font-mono font-bold text-white">¥ {activeContract.totalValue.toLocaleString()}</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Overall Health</div>
                <div className={`text-xl font-mono font-bold ${activeContract.fulfillmentRate < 50 ? 'text-red-400' : 'text-green-400'}`}>
                    {activeContract.fulfillmentRate}%
                </div>
            </div>
            <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]">
               <FileCheck size={14} /> 生成履约报告
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Contract List */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="搜索合同编号或客户..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
                  />
               </div>
               <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-400">
                  <Filter size={14} />
               </button>
           </div>

           <div className="flex flex-col gap-3">
               {CONTRACTS.map(contract => (
                   <div 
                     key={contract.id}
                     onClick={() => setSelectedContractId(contract.id)}
                     className={`p-4 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedContractId === contract.id 
                            ? 'bg-indigo-950/30 border-indigo-500/50 shadow-[inset_4px_0_0_#6366f1]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-mono text-slate-500">{contract.id}</span>
                           <StatusBadge status={contract.status} />
                       </div>
                       
                       <h3 className={`font-bold text-sm mb-1 line-clamp-2 ${selectedContractId === contract.id ? 'text-white' : 'text-slate-300'}`}>
                           {contract.title}
                       </h3>
                       <div className="text-[10px] text-slate-400 mb-3 truncate flex items-center gap-1">
                           <Briefcase size={10} /> {contract.customer}
                       </div>

                       <div className="flex justify-between items-center">
                           <div className="flex gap-2">
                               <div className="text-center">
                                   <div className="text-[8px] text-slate-500 uppercase">Score</div>
                                   <div className={`text-xs font-bold ${contract.qualityScore > 90 ? 'text-green-400' : 'text-yellow-400'}`}>{contract.qualityScore}</div>
                               </div>
                               <div className="w-px h-6 bg-slate-700"></div>
                               <div className="text-center">
                                   <div className="text-[8px] text-slate-500 uppercase">Progress</div>
                                   <div className="text-xs font-bold text-blue-400">{contract.fulfillmentRate}%</div>
                               </div>
                           </div>
                       </div>
                       
                       {/* Progress Bar */}
                       <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-500" style={{width: `${contract.fulfillmentRate}%`}}></div>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: Execution Dashboard */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Milestone Flow Visualizer */}
           <SciFiCard title="关键履约节点 (Milestone Chain)" subtitle="EXECUTION PATH" className="border-indigo-900/50 bg-[#080a14]" noPadding>
               <div className="p-6 overflow-x-auto">
                   <div className="flex items-start justify-between min-w-[600px] gap-4">
                       {activeContract.milestones.map((ms, i) => (
                           <MilestoneNode key={ms.id} ms={ms} index={i} total={activeContract.milestones.length} />
                       ))}
                   </div>
               </div>
               
               {/* Financials embedded */}
               <div className="flex border-t border-slate-800 bg-slate-900/30 px-6 py-3 justify-between items-center">
                   <div className="flex gap-6">
                       <div>
                           <div className="text-[10px] text-slate-500 uppercase">Paid Amount</div>
                           <div className="text-sm font-mono font-bold text-white">¥ 5,500,000</div>
                       </div>
                       <div>
                           <div className="text-[10px] text-slate-500 uppercase">Outstanding</div>
                           <div className="text-sm font-mono font-bold text-slate-300">¥ 7,000,000</div>
                       </div>
                   </div>
                   <div className="flex items-center gap-2 text-xs text-indigo-300">
                       <DollarSign size={14} /> 财务进度: 44%
                   </div>
               </div>
           </SciFiCard>

           {/* Metrics Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
               {/* Radar Analysis */}
               <SciFiCard title="履约维度评估" subtitle="SCORECARD" className="border-slate-800">
                   <div className="h-64 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                               { subject: '质量交付', A: activeContract.qualityScore, fullMark: 100 },
                               { subject: '时间进度', A: activeContract.timeScore, fullMark: 100 },
                               { subject: '成本控制', A: activeContract.costScore, fullMark: 100 },
                               { subject: '文档合规', A: 85, fullMark: 100 },
                               { subject: '客户满意', A: 92, fullMark: 100 },
                           ]}>
                               <PolarGrid stroke="#334155" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                               <Radar name="Score" dataKey="A" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.4} />
                               <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#6366f1', color: '#e2e8f0'}} />
                           </RadarChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               {/* Trend Chart */}
               <SciFiCard title="履约指数趋势 (6个月)" subtitle="TREND" className="border-slate-800">
                   <div className="h-64 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={PERFORMANCE_TREND} margin={{top:10, right:10, left:0, bottom:0}}>
                               <defs>
                                   <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[60, 100]} />
                               <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#10b981', color: '#e2e8f0'}} />
                               <Area type="monotone" dataKey="score" stroke="#10b981" fill="url(#colorPerf)" name="Performance Index" strokeWidth={2} />
                               <Line type="monotone" dataKey="fulfillment" stroke="#f59e0b" strokeWidth={2} dot={false} name="Progress %" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Risks & Obligations */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Risk Alerts */}
           <SciFiCard title="履约风险预警" subtitle="RISK MONITOR" className="border-red-900/30">
               <div className="flex flex-col gap-3">
                   {activeContract.risks.length > 0 ? activeContract.risks.map((risk, i) => (
                       <div key={i} className="bg-red-950/20 border border-red-900/40 p-3 rounded flex flex-col gap-2 relative overflow-hidden group">
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                           <div className="flex justify-between items-start">
                               <div className="flex items-center gap-2">
                                   <AlertTriangle size={14} className="text-red-500" />
                                   <span className="text-xs font-bold text-red-200">{risk.type} 风险</span>
                               </div>
                               <span className={`text-[9px] px-1.5 py-0.5 rounded border ${risk.level === 'High' ? 'bg-red-900/50 text-red-300 border-red-700' : 'bg-yellow-900/50 text-yellow-300 border-yellow-700'}`}>
                                   {risk.level}
                               </span>
                           </div>
                           <p className="text-xs text-slate-300 leading-relaxed">
                               {risk.desc}
                           </p>
                           <button className="text-[10px] text-red-400 hover:text-white flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               查看应对预案 <ArrowRight size={10} />
                           </button>
                       </div>
                   )) : (
                       <div className="text-center py-8 text-slate-500 text-xs italic bg-slate-900/30 rounded border border-slate-800">
                           <CheckCircle2 size={24} className="mx-auto mb-2 text-green-500 opacity-50"/>
                           当前无高等级风险
                       </div>
                   )}
               </div>
           </SciFiCard>

           {/* Obligation Matrix */}
           <SciFiCard title="义务履行矩阵" subtitle="OBLIGATIONS" className="flex-1 border-slate-800">
               <div className="h-48 w-full mb-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={OBLIGATION_DISTRIBUTION} layout="vertical" margin={{top: 5, right: 30, left: 10, bottom: 5}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                           <XAxis type="number" domain={[0, 100]} hide />
                           <YAxis dataKey="name" type="category" stroke="#94a3b8" width={60} tick={{fontSize: 10}} />
                           <Tooltip cursor={{fill: '#1a0505'}} contentStyle={{backgroundColor: '#000', borderColor: '#333'}} />
                           <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                               {OBLIGATION_DISTRIBUTION.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.fill} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
               </div>
               
               <div className="space-y-2">
                   <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-2">
                           <Gavel size={14} className="text-slate-400" />
                           <span className="text-xs text-slate-300">Penalty Clauses</span>
                       </div>
                       <span className="text-xs font-mono text-green-400">0 Triggered</span>
                   </div>
                   <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-2">
                           <Shield size={14} className="text-slate-400" />
                           <span className="text-xs text-slate-300">Warranty Claims</span>
                           </div>
                       <span className="text-xs font-mono text-yellow-400">2 Active</span>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
