
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  ShieldAlert, TrendingDown, TrendingUp, DollarSign, 
  Lock, Unlock, Activity, AlertTriangle, FileText, 
  Search, Filter, Eye, Gavel, Building, History,
  CreditCard, PieChart as PieIcon, ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, ReferenceLine
} from 'recharts';

// --- Types ---

type RiskLevel = 'High' | 'Medium' | 'Low';
type CreditRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'C' | 'D';

interface CreditProfile {
  id: string;
  name: string;
  rating: CreditRating;
  score: number; // 0-1000
  riskLevel: RiskLevel;
  creditLimit: number;
  usedLimit: number;
  currency: string;
  dso: number; // Days Sales Outstanding
  overdueAmount: number;
  lastAssessment: string;
  nextReview: string;
}

interface RiskFactor {
  subject: string;
  score: number; // 0-100 (Higher is safer)
  fullMark: number;
}

interface RiskAlert {
  id: string;
  date: string;
  severity: 'Critical' | 'Major' | 'Minor';
  category: 'Legal' | 'Financial' | 'Market' | 'Operational';
  message: string;
}

// --- Mock Data ---

const CUSTOMER_POOL: CreditProfile[] = [
  { 
    id: 'C-002', name: 'Pacific Power Group', rating: 'BB', score: 620, riskLevel: 'Medium', 
    creditLimit: 500000, usedLimit: 480000, currency: 'CNY', dso: 65, overdueAmount: 25000,
    lastAssessment: '2023-12-01', nextReview: '2024-06-01'
  },
  { 
    id: 'C-004', name: 'Quantum Tech', rating: 'C', score: 450, riskLevel: 'High', 
    creditLimit: 100000, usedLimit: 98000, currency: 'CNY', dso: 120, overdueAmount: 85000,
    lastAssessment: '2024-01-15', nextReview: '2024-04-15'
  },
  { 
    id: 'C-001', name: 'Shanghai Heavy Ind.', rating: 'AAA', score: 950, riskLevel: 'Low', 
    creditLimit: 2000000, usedLimit: 450000, currency: 'CNY', dso: 30, overdueAmount: 0,
    lastAssessment: '2024-02-20', nextReview: '2025-02-20'
  },
  { 
    id: 'C-003', name: 'AutoWorks GmbH', rating: 'AA', score: 880, riskLevel: 'Low', 
    creditLimit: 1500000, usedLimit: 800000, currency: 'EUR', dso: 42, overdueAmount: 5000,
    lastAssessment: '2023-11-10', nextReview: '2024-11-10'
  },
  { 
    id: 'C-005', name: 'North Star Logistics', rating: 'B', score: 580, riskLevel: 'Medium', 
    creditLimit: 300000, usedLimit: 290000, currency: 'CNY', dso: 88, overdueAmount: 12000,
    lastAssessment: '2024-03-01', nextReview: '2024-09-01'
  },
];

const RISK_DIMENSIONS: Record<string, RiskFactor[]> = {
  'C-002': [
    { subject: '偿债能力', score: 60, fullMark: 100 },
    { subject: '营运能力', score: 75, fullMark: 100 },
    { subject: '盈利能力', score: 55, fullMark: 100 },
    { subject: '行业前景', score: 80, fullMark: 100 },
    { subject: '法律合规', score: 90, fullMark: 100 },
    { subject: '付款习惯', score: 50, fullMark: 100 },
  ],
  'C-004': [
    { subject: '偿债能力', score: 30, fullMark: 100 },
    { subject: '营运能力', score: 40, fullMark: 100 },
    { subject: '盈利能力', score: 20, fullMark: 100 },
    { subject: '行业前景', score: 85, fullMark: 100 },
    { subject: '法律合规', score: 60, fullMark: 100 },
    { subject: '付款习惯', score: 25, fullMark: 100 },
  ],
  'default': [
    { subject: '偿债能力', score: 90, fullMark: 100 },
    { subject: '营运能力', score: 90, fullMark: 100 },
    { subject: '盈利能力', score: 90, fullMark: 100 },
    { subject: '行业前景', score: 90, fullMark: 100 },
    { subject: '法律合规', score: 100, fullMark: 100 },
    { subject: '付款习惯', score: 95, fullMark: 100 },
  ]
};

const CREDIT_HISTORY = [
  { month: 'Sep', limit: 500, usage: 320, score: 650 },
  { month: 'Oct', limit: 500, usage: 380, score: 645 },
  { month: 'Nov', limit: 500, usage: 450, score: 630 },
  { month: 'Dec', limit: 500, usage: 490, score: 610 },
  { month: 'Jan', limit: 500, usage: 485, score: 625 },
  { month: 'Feb', limit: 500, usage: 470, score: 620 },
];

const ALERTS: Record<string, RiskAlert[]> = {
  'C-002': [
    { id: 'A-101', date: '2024-03-18', severity: 'Major', category: 'Financial', message: 'DSO increased by 15% in last quarter.' },
    { id: 'A-102', date: '2024-03-10', severity: 'Minor', category: 'Operational', message: 'Key personnel change: CFO resigned.' },
  ],
  'C-004': [
    { id: 'A-201', date: '2024-03-19', severity: 'Critical', category: 'Legal', message: 'Named defendant in new contract dispute lawsuit.' },
    { id: 'A-202', date: '2024-03-15', severity: 'Major', category: 'Financial', message: 'Credit utilization > 95% for 3 consecutive months.' },
    { id: 'A-203', date: '2024-02-28', severity: 'Critical', category: 'Financial', message: 'Overdue balance exceeded threshold ($50k).' },
  ]
};

// --- Helper Components ---

const RiskBadge = ({ level }: { level: RiskLevel }) => {
  const styles = {
    'High': 'bg-red-950/40 text-red-400 border-red-800 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
    'Medium': 'bg-orange-950/40 text-orange-400 border-orange-800',
    'Low': 'bg-emerald-950/40 text-emerald-400 border-emerald-800',
  }[level];
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles}`}>
      {level} Risk
    </span>
  );
};

const CreditScoreGauge = ({ score, rating }: { score: number, rating: string }) => {
  // Score range typically 300-900. Normalize to 0-100 for gauge visually.
  const normalized = Math.max(0, Math.min(100, (score - 300) / 6)); 
  const color = score > 750 ? '#10b981' : score > 600 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Background Circle */}
      <svg className="absolute w-full h-full transform -rotate-90">
        <circle cx="96" cy="96" r="80" fill="none" stroke="#1e293b" strokeWidth="12" />
        <circle 
          cx="96" cy="96" r="80" fill="none" stroke={color} strokeWidth="12" 
          strokeDasharray="502" strokeDashoffset={502 - (502 * normalized) / 100}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-4xl font-bold text-white tracking-tighter">{score}</div>
        <div className="text-xl font-bold mt-1" style={{color}}>{rating}</div>
        <div className="text-[10px] text-slate-500 uppercase mt-2">Credit Score</div>
      </div>
    </div>
  );
};

export const CustomerCreditView: React.FC = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(CUSTOMER_POOL[0].id);
  
  const activeProfile = CUSTOMER_POOL.find(c => c.id === selectedCustomerId) || CUSTOMER_POOL[0];
  const activeRisks = RISK_DIMENSIONS[activeProfile.id] || RISK_DIMENSIONS['default'];
  const activeAlerts = ALERTS[activeProfile.id] || [];

  const usagePercent = (activeProfile.usedLimit / activeProfile.creditLimit) * 100;

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0f0a24] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <ShieldAlert size={14} /> Credit Risk Control Center
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             信用额度与 <span className="text-indigo-500">风险预警台</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Portfolio Risk</div>
                <div className="text-lg font-bold text-yellow-400">Moderate</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Total Exposure</div>
                <div className="text-lg font-bold text-white">¥ 21.5 M</div>
            </div>
            <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]">
               <Eye size={14} /> 启动信审流程
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Customer Risk List */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search entity..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
                  />
               </div>
               <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-400">
                  <Filter size={14} />
               </button>
           </div>

           <div className="flex flex-col gap-3">
               {CUSTOMER_POOL.sort((a,b) => a.score - b.score).map(cust => (
                   <div 
                     key={cust.id}
                     onClick={() => setSelectedCustomerId(cust.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedCustomerId === cust.id 
                            ? 'bg-indigo-950/30 border-indigo-500/50 shadow-[inset_4px_0_0_#6366f1]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <div className="flex flex-col">
                               <h3 className={`font-bold text-sm line-clamp-1 ${selectedCustomerId === cust.id ? 'text-white' : 'text-slate-300'}`}>
                                   {cust.name}
                                </h3>
                               <span className="text-[10px] text-slate-500">{cust.id}</span>
                           </div>
                           <RiskBadge level={cust.riskLevel} />
                       </div>
                       
                       <div className="space-y-1">
                           <div className="flex justify-between text-[10px] text-slate-400">
                               <span>Limit Usage</span>
                               <span className={cust.usedLimit/cust.creditLimit > 0.9 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                                   {((cust.usedLimit/cust.creditLimit)*100).toFixed(0)}%
                               </span>
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full ${cust.riskLevel === 'High' ? 'bg-red-500' : cust.riskLevel === 'Medium' ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                                 style={{width: `${(cust.usedLimit/cust.creditLimit)*100}%`}}
                               ></div>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: Credit Cockpit */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Row 1: Profile Header & Gauge */}
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
               
               {/* Identity & Limit */}
               <SciFiCard className="border-indigo-900/50 bg-[#080b16]" noPadding>
                   <div className="p-6 flex flex-col justify-between h-full">
                       <div className="flex justify-between items-start">
                           <div className="flex items-center gap-3">
                               <div className="p-3 bg-slate-800 rounded border border-slate-700 text-slate-300">
                                   <Building size={24} />
                               </div>
                               <div>
                                   <h2 className="text-xl font-bold text-white">{activeProfile.name}</h2>
                                   <div className="flex gap-2 text-xs text-slate-400 mt-1">
                                       <span className="flex items-center gap-1"><History size={12}/> Last Reviewed: {activeProfile.lastAssessment}</span>
                                   </div>
                               </div>
                           </div>
                           {activeProfile.riskLevel === 'High' && (
                               <div className="flex items-center gap-2 px-3 py-1 bg-red-900/20 border border-red-500/50 rounded text-red-400 text-xs font-bold animate-pulse">
                                   <AlertTriangle size={14} /> CREDIT FREEZE SUGGESTED
                               </div>
                           )}
                       </div>

                       <div className="mt-6">
                           <div className="flex justify-between text-sm mb-2">
                               <span className="text-slate-400">Credit Limit Usage</span>
                               <span className="text-white font-mono">
                                   {activeProfile.currency} {(activeProfile.usedLimit/1000).toFixed(0)}k / {(activeProfile.creditLimit/1000).toFixed(0)}k
                               </span>
                           </div>
                           <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
                               {/* Safe Zone */}
                               <div className="absolute top-0 left-0 h-full bg-slate-700 w-[80%] border-r border-slate-600 opacity-30"></div>
                               {/* Usage Bar */}
                               <div 
                                 className={`h-full transition-all duration-1000 ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                                 style={{width: `${usagePercent}%`}}
                               ></div>
                           </div>
                           <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                               <span>Available: {((activeProfile.creditLimit - activeProfile.usedLimit)/1000).toFixed(0)}k</span>
                               <span>80% Warning Threshold</span>
                           </div>
                       </div>

                       <div className="grid grid-cols-3 gap-4 mt-6">
                           <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                               <div className="text-[10px] text-slate-500 uppercase">DSO</div>
                               <div className={`text-xl font-mono font-bold ${activeProfile.dso > 90 ? 'text-red-400' : 'text-white'}`}>
                                   {activeProfile.dso} <span className="text-xs font-normal text-slate-500">days</span>
                               </div>
                           </div>
                           <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                               <div className="text-[10px] text-slate-500 uppercase">Overdue</div>
                               <div className={`text-xl font-mono font-bold ${activeProfile.overdueAmount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                   {(activeProfile.overdueAmount/1000).toFixed(1)}k
                               </div>
                           </div>
                           <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                               <div className="text-[10px] text-slate-500 uppercase">Rating</div>
                               <div className="text-xl font-mono font-bold text-indigo-300">
                                   {activeProfile.rating}
                               </div>
                           </div>
                       </div>
                   </div>
               </SciFiCard>

               {/* Score Gauge */}
               <SciFiCard className="border-indigo-900/50 flex flex-col items-center justify-center bg-[#080b16]">
                   <CreditScoreGauge score={activeProfile.score} rating={activeProfile.rating} />
                   <div className="text-center mt-[-10px] mb-4">
                       <div className="text-xs text-slate-400">Risk Assessment Model v3.0</div>
                       <div className="text-[10px] text-indigo-500">AI Confidence: 94%</div>
                   </div>
                   <div className="flex gap-4 w-full px-8">
                       <button className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded border border-slate-600 transition-colors">
                           Download Report
                       </button>
                       <button className="flex-1 py-1.5 bg-indigo-900/30 hover:bg-indigo-900/50 text-xs text-indigo-300 rounded border border-indigo-500/30 transition-colors">
                           Adjust Limit
                       </button>
                   </div>
               </SciFiCard>
           </div>

           {/* Row 2: Analytics */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
               {/* Risk Dimensions Radar */}
               <SciFiCard title="风险维度分析 (Risk Factors)" className="border-slate-800">
                   <div className="h-64 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={activeRisks}>
                               <PolarGrid stroke="#334155" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                               <Radar name="Score" dataKey="score" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                               <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#8b5cf6', color: '#e2e8f0'}} />
                           </RadarChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               {/* Credit Trend */}
               <SciFiCard title="信用趋势 (6 Months)" className="border-slate-800">
                   <div className="h-64 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={CREDIT_HISTORY} margin={{top:10, right:10, left:0, bottom:0}}>
                               <defs>
                                   <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="month" stroke="#666" tick={{fontSize: 10}} />
                               <YAxis yAxisId="left" stroke="#666" tick={{fontSize: 10}} domain={[0, 800]} label={{ value: 'Usage (k)', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 10 }} />
                               <YAxis yAxisId="right" orientation="right" stroke="#666" tick={{fontSize: 10}} domain={[500, 800]} label={{ value: 'Score', angle: 90, position: 'insideRight', fill: '#666', fontSize: 10 }} />
                               <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9', color: '#e2e8f0'}} />
                               <ReferenceLine yAxisId="left" y={500} stroke="#ef4444" strokeDasharray="3 3" label={{value: 'Limit', fill: '#ef4444', fontSize: 10}} />
                               <Area yAxisId="left" type="monotone" dataKey="usage" stroke="#0ea5e9" fill="url(#colorScore)" name="Usage" />
                               <Area yAxisId="right" type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2} fill="none" name="Credit Score" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Risk Intelligence */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Alert Feed */}
           <SciFiCard title="风险预警情报" subtitle="LIVE FEED" className="border-red-900/30">
               <div className="flex flex-col gap-3">
                   {activeAlerts.length > 0 ? activeAlerts.map(alert => (
                       <div key={alert.id} className="bg-red-950/20 border border-red-900/40 p-3 rounded flex flex-col gap-2 relative overflow-hidden">
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                           <div className="flex justify-between items-start">
                               <div className="flex items-center gap-2">
                                   <AlertTriangle size={14} className="text-red-500" />
                                   <span className="text-xs font-bold text-red-200">{alert.category} Warning</span>
                               </div>
                               <span className="text-[9px] text-slate-500">{alert.date}</span>
                           </div>
                           <p className="text-xs text-slate-300 leading-relaxed">
                               {alert.message}
                           </p>
                           <div className="flex justify-end">
                               <span className="text-[9px] bg-red-900/50 text-red-300 px-1.5 py-0.5 rounded border border-red-800">{alert.severity}</span>
                           </div>
                       </div>
                   )) : (
                       <div className="text-center py-8 text-slate-500 text-xs italic">
                           <CheckCircle2 size={24} className="mx-auto mb-2 text-green-500 opacity-50"/>
                           No active alerts.
                       </div>
                   )}
               </div>
           </SciFiCard>

           {/* Financial Snapshot */}
           <SciFiCard title="外部征信数据 (External)" subtitle="SNAPSHOT" className="border-slate-800">
               <div className="space-y-3">
                   <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
                       <span className="text-slate-400">Legal Lawsuits (Count)</span>
                       <span className={`font-mono font-bold ${activeProfile.riskLevel === 'High' ? 'text-red-400' : 'text-slate-200'}`}>
                           {activeProfile.riskLevel === 'High' ? '5' : '0'}
                       </span>
                   </div>
                   <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
                       <span className="text-slate-400">Admin Penalties</span>
                       <span className="font-mono font-bold text-slate-200">0</span>
                   </div>
                   <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
                       <span className="text-slate-400">Tax Rating</span>
                       <span className="font-mono font-bold text-green-400">A</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400">Blacklist Status</span>
                       <span className="font-mono font-bold text-green-400">Clear</span>
                   </div>
               </div>
               
               <div className="mt-4 p-2 bg-slate-900 rounded border border-slate-700 flex items-center justify-between">
                   <span className="text-[10px] text-slate-500">Source: TianYanCha / S&P</span>
                   <span className="text-[10px] text-indigo-400">Updated: 1h ago</span>
               </div>
           </SciFiCard>

           {/* Actions */}
           <div className="flex flex-col gap-2 mt-auto">
               <button className="w-full py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-800 text-red-400 text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors">
                   <Lock size={12} /> Freeze Credit Account
               </button>
               <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs rounded flex items-center justify-center gap-2 transition-colors">
                   <FileText size={12} /> Request Audit
               </button>
           </div>

        </div>

      </div>
    </div>
  );
};
