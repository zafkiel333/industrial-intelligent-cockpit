
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Gavel, Trophy, XCircle, Clock, 
  Target, TrendingUp, Users, FileText, 
  Search, Filter, ArrowRight, DollarSign,
  Briefcase, Award, Swords, AlertTriangle,
  ChevronRight, Calculator, PieChart as PieIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, PieChart, Pie, CartesianGrid, ReferenceLine
} from 'recharts';

// --- Types ---

type BidStatus = 'Planning' | 'Bidding' | 'Evaluation' | 'Negotiation' | 'Won' | 'Lost';

interface Competitor {
  name: string;
  strength: number; // 0-100
  priceScore: number;
  techScore: number;
  bizScore: number;
  risk: string;
}

interface TenderProject {
  id: string;
  name: string;
  customer: string;
  type: string;
  budget: number;
  ourBid: number;
  status: BidStatus;
  winProb: number; // %
  deadline: string;
  manager: string;
  competitors: Competitor[];
  progress: number; // 0-100% of timeline
  timeline: string[]; // Current active stage name
}

// --- Mock Data ---

const TENDER_LIST: TenderProject[] = [
  {
    id: 'BID-2024-001',
    name: 'Yangshan Port Phase V Automation',
    customer: 'Shanghai Port Group',
    type: 'EPC',
    budget: 85000000,
    ourBid: 82500000,
    status: 'Negotiation',
    winProb: 85,
    deadline: '2024-04-15',
    manager: 'Zhang Wei',
    progress: 80,
    timeline: ['RFP', 'Site Survey', 'Tech Bid', 'Comm Bid', 'Negotiation', 'Award'],
    competitors: [
      { name: 'Our Solution', strength: 90, priceScore: 80, techScore: 95, bizScore: 90, risk: 'Low' },
      { name: 'Global Tech', strength: 85, priceScore: 70, techScore: 98, bizScore: 80, risk: 'High' },
      { name: 'Local Infra', strength: 75, priceScore: 95, techScore: 70, bizScore: 85, risk: 'Medium' }
    ]
  },
  {
    id: 'BID-2024-045',
    name: 'North-West Mining Conveyor Sys',
    customer: 'Shenhua Energy',
    type: 'Equipment Supply',
    budget: 12000000,
    ourBid: 11800000,
    status: 'Evaluation',
    winProb: 60,
    deadline: '2024-05-01',
    manager: 'Li Qiang',
    progress: 60,
    timeline: ['RFP', 'Tech Bid', 'Clarification', 'Evaluation', 'Award'],
    competitors: [
      { name: 'Our Solution', strength: 80, priceScore: 85, techScore: 80, bizScore: 85, risk: 'Med' },
      { name: 'Heavy Gear Inc.', strength: 82, priceScore: 80, techScore: 88, bizScore: 75, risk: 'Low' },
    ]
  },
  {
    id: 'BID-2023-112',
    name: 'Offshore Wind Farm Maintenance',
    customer: 'Three Gorges New Energy',
    type: 'Service',
    budget: 5000000,
    ourBid: 4800000,
    status: 'Won',
    winProb: 100,
    deadline: '2023-12-10',
    manager: 'Chen H.',
    progress: 100,
    timeline: ['Completed'],
    competitors: []
  },
  {
    id: 'BID-2024-089',
    name: 'Smart Factory IoT Upgrade',
    customer: 'AutoWorks GmbH',
    type: 'IT Solution',
    budget: 3500000,
    ourBid: 3800000,
    status: 'Bidding',
    winProb: 45,
    deadline: '2024-06-20',
    manager: 'Sarah L.',
    progress: 30,
    timeline: ['Pre-qual', 'RFP', 'Proposal', 'Demo', 'Award'],
    competitors: [
      { name: 'Our Solution', strength: 75, priceScore: 60, techScore: 90, bizScore: 70, risk: 'High' },
      { name: 'IoT Experts', strength: 88, priceScore: 85, techScore: 85, bizScore: 90, risk: 'Low' }
    ]
  }
];

const WIN_LOSS_REASONS = [
  { name: '技术优势 (Tech)', value: 45, fill: '#10b981' },
  { name: '价格因素 (Price)', value: 30, fill: '#f59e0b' },
  { name: '客户关系 (Relation)', value: 15, fill: '#3b82f6' },
  { name: '品牌影响 (Brand)', value: 10, fill: '#8b5cf6' },
];

const FUNNEL_DATA = [
  { stage: '线索 (Leads)', count: 120, value: 500 },
  { stage: '立项 (Qualified)', count: 45, value: 320 },
  { stage: '投标 (Bidding)', count: 28, value: 180 },
  { stage: '谈判 (Negotiation)', count: 12, value: 95 },
  { stage: '中标 (Won)', count: 8, value: 65 },
];

// --- Components ---

const StatusBadge = ({ status }: { status: BidStatus }) => {
  const styles = {
    'Planning': 'bg-slate-800 text-slate-400 border-slate-600',
    'Bidding': 'bg-blue-900/30 text-blue-400 border-blue-500/50',
    'Evaluation': 'bg-purple-900/30 text-purple-400 border-purple-500/50 animate-pulse',
    'Negotiation': 'bg-amber-900/30 text-amber-400 border-amber-500/50',
    'Won': 'bg-green-900/30 text-green-400 border-green-500/50',
    'Lost': 'bg-red-900/30 text-red-400 border-red-500/50',
  }[status];

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles}`}>
      {status}
    </span>
  );
};

const ProbabilityGauge = ({ prob }: { prob: number }) => (
  <div className="flex flex-col items-center">
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="24" cy="24" r="20" stroke="#1e293b" strokeWidth="4" fill="none"/>
        <circle 
          cx="24" cy="24" r="20" stroke={prob > 70 ? '#10b981' : prob > 40 ? '#f59e0b' : '#ef4444'} 
          strokeWidth="4" fill="none" strokeDasharray="125" strokeDashoffset={125 - (125 * prob) / 100} 
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-white">{prob}%</span>
    </div>
    <span className="text-[9px] text-slate-500 uppercase mt-1">Win Prob</span>
  </div>
);

export const CustomerTenderingView: React.FC = () => {
  const [selectedBidId, setSelectedBidId] = useState(TENDER_LIST[0].id);
  const activeBid = TENDER_LIST.find(t => t.id === selectedBidId) || TENDER_LIST[0];

  // Radar Data Generator for Active Bid
  const radarData = activeBid.competitors.length > 0 ? [
    { subject: '技术方案', A: activeBid.competitors[0].techScore, B: activeBid.competitors[1]?.techScore || 0, fullMark: 100 },
    { subject: '商务报价', A: activeBid.competitors[0].priceScore, B: activeBid.competitors[1]?.priceScore || 0, fullMark: 100 },
    { subject: '交付能力', A: activeBid.competitors[0].bizScore, B: activeBid.competitors[1]?.bizScore || 0, fullMark: 100 },
    { subject: '企业资质', A: 90, B: 85, fullMark: 100 },
    { subject: '售后服务', A: 95, B: 70, fullMark: 100 },
  ] : [];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & Strategic KPIs */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-amber-600/40 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
               <Gavel size={14} /> Tendering & Bidding Management
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               客户招投标 <span className="text-amber-500">全生命周期管理</span>
            </h1>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-slate-900/50 border border-slate-700 px-4 py-2 rounded flex flex-col items-end">
                <span className="text-[10px] text-slate-400 uppercase">YTD Win Rate</span>
                <span className="text-xl font-bold text-green-400">32.5%</span>
             </div>
             <div className="bg-slate-900/50 border border-slate-700 px-4 py-2 rounded flex flex-col items-end">
                <span className="text-[10px] text-slate-400 uppercase">Active Pipeline</span>
                <span className="text-xl font-bold text-white">¥ 145M</span>
             </div>
             <button className="h-full px-4 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold text-sm shadow-lg transition-colors flex items-center gap-2">
                <Target size={16} /> 立项新标
             </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Opportunity Pipeline */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           {/* Filters */}
           <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Project Name / ID..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-amber-500 text-slate-200"
                  />
               </div>
               <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-400">
                  <Filter size={14} />
               </button>
           </div>

           {/* Cards */}
           <div className="flex flex-col gap-3">
               {TENDER_LIST.map(tender => (
                   <div 
                     key={tender.id}
                     onClick={() => setSelectedBidId(tender.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group flex gap-3
                        ${selectedBidId === tender.id 
                            ? 'bg-amber-950/20 border-amber-500/50 shadow-[inset_4px_0_0_#f59e0b]' 
                            : 'bg-slate-900/30 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-start mb-1">
                               <span className="text-[10px] font-mono text-slate-500">{tender.id}</span>
                               <StatusBadge status={tender.status} />
                           </div>
                           <h4 className={`text-sm font-bold truncate ${selectedBidId === tender.id ? 'text-white' : 'text-slate-300'}`}>
                               {tender.name}
                           </h4>
                           <div className="text-[10px] text-slate-400 mt-1 truncate">{tender.customer}</div>
                           <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800/50">
                               <span className="text-xs font-mono text-amber-100">¥ {(tender.budget/1000000).toFixed(1)}M</span>
                               <span className="text-[10px] text-slate-500">{tender.deadline}</span>
                           </div>
                       </div>
                       <ProbabilityGauge prob={tender.winProb} />
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: War Room (Detail) */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* 1. Project Header & Timeline */}
           <SciFiCard className="border-amber-900/50 bg-[#0c0a06]" noPadding>
               <div className="p-5">
                   <div className="flex justify-between items-start mb-6">
                       <div>
                           <div className="flex items-center gap-3 mb-1">
                               <h2 className="text-2xl font-bold text-white">{activeBid.name}</h2>
                               <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">{activeBid.type}</span>
                           </div>
                           <div className="flex items-center gap-4 text-xs text-slate-400">
                               <span className="flex items-center gap-1"><Briefcase size={12}/> {activeBid.customer}</span>
                               <span className="flex items-center gap-1"><Users size={12}/> PM: {activeBid.manager}</span>
                               <span className="flex items-center gap-1 text-amber-500"><Clock size={12}/> Deadline: {activeBid.deadline}</span>
                           </div>
                       </div>
                       <div className="text-right">
                           <div className="text-[10px] text-slate-500 uppercase font-bold">Total Budget</div>
                           <div className="text-2xl font-mono font-bold text-white">¥ {activeBid.budget.toLocaleString()}</div>
                           <div className="text-xs text-amber-400">Our Bid: ¥ {activeBid.ourBid.toLocaleString()}</div>
                       </div>
                   </div>

                   {/* Process Timeline */}
                   <div className="relative pt-4 pb-2">
                       {/* Line */}
                       <div className="absolute top-[27px] left-0 w-full h-1 bg-slate-800">
                           <div className="h-full bg-amber-600" style={{width: `${activeBid.progress}%`}}></div>
                       </div>
                       
                       <div className="flex justify-between relative z-10">
                           {activeBid.timeline.map((stage, i) => (
                               <div key={i} className="flex flex-col items-center gap-2">
                                   <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center bg-[#0c0a06]
                                       ${activeBid.status === 'Won' ? 'border-green-500 text-green-500' : 
                                         i <= (activeBid.progress / 100 * (activeBid.timeline.length-1)) ? 'border-amber-500 text-amber-500' : 'border-slate-600 text-slate-600'}
                                   `}>
                                       <span className="text-[10px] font-bold">{i+1}</span>
                                   </div>
                                   <span className={`text-[10px] uppercase font-bold ${i <= (activeBid.progress / 100 * (activeBid.timeline.length-1)) ? 'text-amber-100' : 'text-slate-600'}`}>
                                       {stage}
                                   </span>
                               </div>
                           ))}
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* 2. Competitor Analysis (Split View) */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[340px]">
               
               {/* Radar Comparison */}
               <SciFiCard title="竞对能力多维透视 (Competitor Radar)" subtitle="ANALYSIS" className="border-slate-800">
                   {activeBid.competitors.length > 0 ? (
                       <div className="w-full h-full flex flex-col">
                           <div className="flex-1">
                               <ResponsiveContainer width="100%" height="100%">
                                   <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                       <PolarGrid stroke="#334155" />
                                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                       <Radar name="Our Solution" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.4} />
                                       <Radar name="Competitor A" dataKey="B" stroke="#64748b" strokeWidth={2} fill="transparent" strokeDasharray="4 4" />
                                       <Legend wrapperStyle={{fontSize:'10px'}}/>
                                       <Tooltip contentStyle={{backgroundColor: '#0c0a06', borderColor: '#f59e0b'}} />
                                   </RadarChart>
                               </ResponsiveContainer>
                           </div>
                           <div className="p-3 bg-amber-900/10 border border-amber-500/20 rounded text-[10px] text-amber-200/80 mt-[-10px]">
                               <strong className="block mb-1">SWOT Insight:</strong>
                               Our technical score leads by 15%, but competitor pricing is aggressive. Suggest emphasizing TCO (Total Cost of Ownership) advantage.
                           </div>
                       </div>
                   ) : (
                       <div className="h-full flex items-center justify-center text-slate-500 text-xs">No competitor data for closed/single-source bid.</div>
                   )}
               </SciFiCard>

               {/* Pricing & Strategy */}
               <SciFiCard title="报价策略模拟 (Pricing)" subtitle="SIMULATION" className="border-slate-800">
                   <div className="w-full h-full flex flex-col p-2">
                       {activeBid.competitors.length > 0 ? (
                           <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={[
                                   { name: 'Budget', value: activeBid.budget },
                                   { name: 'Our Bid', value: activeBid.ourBid },
                                   { name: 'Comp A', value: activeBid.budget * 0.92 },
                                   { name: 'Comp B', value: activeBid.budget * 1.05 },
                               ]} layout="vertical" margin={{top:5, right:30, bottom:5, left:10}}>
                                   <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                   <XAxis type="number" stroke="#64748b" tick={{fontSize: 10}} hide />
                                   <YAxis dataKey="name" type="category" stroke="#94a3b8" width={60} tick={{fontSize: 10}} />
                                   <Tooltip cursor={{fill: '#1c1917'}} contentStyle={{backgroundColor: '#0c0a06', borderColor: '#f59e0b'}} formatter={(val:number)=>`¥ ${(val/1000000).toFixed(2)}M`} />
                                   <Bar dataKey="value" barSize={15} radius={[0, 4, 4, 0]}>
                                       {/* Custom Coloring */}
                                       <Cell fill="#64748b" /> 
                                       <Cell fill="#f59e0b" />
                                       <Cell fill="#ef4444" />
                                       <Cell fill="#ef4444" />
                                   </Bar>
                                   <ReferenceLine x={activeBid.budget} stroke="#10b981" strokeDasharray="3 3" label={{value:'Limit', position:'top', fill:'#10b981', fontSize:10}}/>
                               </BarChart>
                           </ResponsiveContainer>
                       ) : (
                           <div className="h-full flex items-center justify-center text-slate-500 text-xs">N/A</div>
                       )}
                       
                       <div className="mt-2 flex gap-2 justify-end">
                           <button className="px-3 py-1 bg-slate-800 border border-slate-600 rounded text-[10px] text-slate-300 hover:text-white flex items-center gap-1">
                               <Calculator size={10} /> Recalculate Margin
                           </button>
                       </div>
                   </div>
               </SciFiCard>

           </div>

           {/* 3. Document Vault (Horizontal) */}
           <SciFiCard title="标书与文档金库" subtitle="SECURE" className="h-40 border-slate-800">
               <div className="grid grid-cols-4 gap-4 h-full items-center">
                   {['RFP_Specs_v2.pdf', 'Tech_Proposal_Final.pdf', 'Commercial_Quote_v3.xlsx', 'Site_Survey_Report.docx'].map((doc, i) => (
                       <div key={i} className="flex flex-col items-center gap-2 p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-amber-500/50 hover:bg-slate-900/60 transition-all cursor-pointer group">
                           <FileText size={24} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                           <span className="text-[10px] text-slate-300 truncate max-w-full">{doc}</span>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Intelligence & History */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Win/Loss Analysis */}
           <SciFiCard title="胜负手分析 (Win/Loss)" subtitle="INSIGHTS" className="border-indigo-900/30">
               <div className="h-48 w-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie 
                             data={WIN_LOSS_REASONS} 
                             innerRadius={40} 
                             outerRadius={60} 
                             paddingAngle={5} 
                             dataKey="value"
                           >
                               {WIN_LOSS_REASONS.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.fill} />
                               ))}
                           </Pie>
                           <Tooltip contentStyle={{backgroundColor: '#0c0a06', borderColor: '#f59e0b'}} />
                       </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                       <span className="text-xs text-slate-500 uppercase">Primary Driver</span>
                       <span className="text-lg font-bold text-white">Tech</span>
                   </div>
               </div>
               
               <div className="space-y-2 mt-2 px-2">
                   {WIN_LOSS_REASONS.map((item, i) => (
                       <div key={i} className="flex justify-between items-center text-xs">
                           <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.fill}}></div>
                               <span className="text-slate-300">{item.name}</span>
                           </div>
                           <span className="font-mono text-white">{item.value}%</span>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Sales Funnel */}
           <SciFiCard title="销售漏斗 (Pipeline)" subtitle="CONVERSION" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-2 h-full justify-center py-2">
                   {FUNNEL_DATA.map((stage, i) => (
                       <div key={i} className="flex items-center gap-2 group">
                           <div className="text-[10px] text-slate-400 w-24 text-right">{stage.stage}</div>
                           <div className="flex-1 bg-slate-900/50 h-6 rounded-r overflow-hidden relative">
                               <div 
                                 className="h-full bg-indigo-900/40 group-hover:bg-indigo-600/40 transition-colors border-l-2 border-indigo-500" 
                                 style={{width: `${(stage.count / 120) * 100}%`}}
                               ></div>
                               <span className="absolute top-1 left-2 text-[10px] font-bold text-white">{stage.count}</span>
                           </div>
                           <div className="text-[10px] font-mono text-slate-500 w-12 text-right">¥{stage.value}M</div>
                       </div>
                   ))}
               </div>
               <div className="mt-4 p-2 bg-indigo-900/10 border border-indigo-500/20 rounded text-[10px] text-indigo-200/80 text-center">
                   <Swords size={12} className="inline mr-1" />
                   Conversion Rate (Bid to Win): <strong className="text-white">28.5%</strong>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
