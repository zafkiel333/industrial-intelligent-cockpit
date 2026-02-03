
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Shield, Lock, Unlock, FileSignature, 
  Copyright, Award, FileKey, AlertTriangle, 
  Search, Filter, CheckCircle2, XCircle, 
  Clock, Calendar, Fingerprint, Eye, 
  Scale, Briefcase, Zap, History,
  BookOpen, Gavel, ArrowRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area
} from 'recharts';

// --- Types ---

type IPType = 'Patent' | 'Trademark' | 'Copyright' | 'TradeSecret';
type NDAStatus = 'Active' | 'Expiring' | 'Expired' | 'Breached' | 'Draft';
type IPStatus = 'Registered' | 'Pending' | 'Renewal Needed' | 'Invalid';

interface CustomerIPProfile {
  id: string;
  name: string;
  industry: string;
  ndaStatus: NDAStatus;
  ndaExpiry: string;
  ipCount: number;
  riskScore: number; // 0-100 (Higher is riskier)
}

interface IPAsset {
  id: string;
  title: string;
  type: IPType;
  regNumber: string;
  filingDate: string;
  status: IPStatus;
  valueEst: string; // Valuation
}

interface NDAClause {
  id: string;
  title: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  status: 'Compliant' | 'Review';
}

// --- Mock Data ---

const CUSTOMERS: CustomerIPProfile[] = [
  { id: 'C-001', name: 'Shanghai Heavy Ind.', industry: 'Manufacturing', ndaStatus: 'Active', ndaExpiry: '2026-12-31', ipCount: 45, riskScore: 12 },
  { id: 'C-002', name: 'Pacific Power Group', industry: 'Energy', ndaStatus: 'Expiring', ndaExpiry: '2024-04-15', ipCount: 128, riskScore: 45 },
  { id: 'C-003', name: 'AutoWorks Global', industry: 'Automotive', ndaStatus: 'Active', ndaExpiry: '2025-06-30', ipCount: 62, riskScore: 5 },
  { id: 'C-004', name: 'Quantum Tech', industry: 'Technology', ndaStatus: 'Breached', ndaExpiry: '2024-01-01', ipCount: 210, riskScore: 95 },
  { id: 'C-005', name: 'North Star Logistics', industry: 'Logistics', ndaStatus: 'Draft', ndaExpiry: '-', ipCount: 15, riskScore: 0 },
];

const IP_ASSETS: IPAsset[] = [
  { id: 'IP-P-001', title: 'High-Efficiency Turbine Blade Design', type: 'Patent', regNumber: 'CN-2023-10023X', filingDate: '2023-05-12', status: 'Registered', valueEst: '¥ 2.5M' },
  { id: 'IP-T-002', title: 'PowerFlow™ Brand Logo', type: 'Trademark', regNumber: 'TM-88291', filingDate: '2022-11-05', status: 'Registered', valueEst: '¥ 800k' },
  { id: 'IP-C-003', title: 'Control System Source Code v2.4', type: 'Copyright', regNumber: 'SR-2024-0055', filingDate: '2024-01-15', status: 'Pending', valueEst: '¥ 1.2M' },
  { id: 'IP-S-004', title: 'Customer Pricing Algorithm', type: 'TradeSecret', regNumber: 'Internal-TS-04', filingDate: '2021-06-20', status: 'Registered', valueEst: 'Unknown' },
  { id: 'IP-P-005', title: 'Hydraulic Seal Mechanism', type: 'Patent', regNumber: 'CN-2019-55210Y', filingDate: '2019-08-30', status: 'Renewal Needed', valueEst: '¥ 450k' },
];

const NDA_CLAUSES: NDAClause[] = [
  { id: 'CL-01', title: 'Confidentiality Scope Definition', riskLevel: 'Low', status: 'Compliant' },
  { id: 'CL-02', title: 'Data Residency Requirement', riskLevel: 'Medium', status: 'Compliant' },
  { id: 'CL-03', title: 'Audit Rights & Access', riskLevel: 'High', status: 'Review' },
  { id: 'CL-04', title: 'Termination & Return of Data', riskLevel: 'High', status: 'Compliant' },
];

const IP_DISTRIBUTION = [
  { name: 'Patents', value: 45, fill: '#f59e0b' },
  { name: 'Trademarks', value: 25, fill: '#0ea5e9' },
  { name: 'Copyrights', value: 20, fill: '#8b5cf6' },
  { name: 'Secrets', value: 10, fill: '#ef4444' },
];

const RISK_RADAR = [
  { subject: 'Access Control', A: 90, fullMark: 100 },
  { subject: 'Data Encryption', A: 85, fullMark: 100 },
  { subject: 'Legal Framework', A: 70, fullMark: 100 },
  { subject: 'Audit Trail', A: 95, fullMark: 100 },
  { subject: 'Staff Training', A: 60, fullMark: 100 },
];

const COMPLIANCE_TREND = Array.from({ length: 6 }, (_, i) => ({
  month: `M-${6-i}`,
  score: 85 + Math.random() * 10,
  incidents: Math.floor(Math.random() * 3)
}));

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    'Active': 'bg-emerald-900/30 text-emerald-400 border-emerald-800',
    'Registered': 'bg-emerald-900/30 text-emerald-400 border-emerald-800',
    'Expiring': 'bg-amber-900/30 text-amber-400 border-amber-800 animate-pulse',
    'Renewal Needed': 'bg-amber-900/30 text-amber-400 border-amber-800',
    'Expired': 'bg-slate-800 text-slate-400 border-slate-600',
    'Breached': 'bg-red-900/30 text-red-400 border-red-800 shadow-[0_0_10px_#ef4444]',
    'Invalid': 'bg-red-900/30 text-red-400 border-red-800',
    'Draft': 'bg-blue-900/30 text-blue-400 border-blue-800',
    'Pending': 'bg-blue-900/30 text-blue-400 border-blue-800',
  }[status] || 'bg-slate-800 text-slate-400';

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1 w-fit ${styles}`}>
      {status === 'Breached' && <AlertTriangle size={10} />}
      {status === 'Active' && <Shield size={10} />}
      {status}
    </span>
  );
};

const TypeIcon = ({ type }: { type: IPType }) => {
  switch(type) {
    case 'Patent': return <Award size={14} className="text-amber-400" />;
    case 'Trademark': return <CheckCircle2 size={14} className="text-blue-400" />;
    case 'Copyright': return <Copyright size={14} className="text-purple-400" />;
    case 'TradeSecret': return <Lock size={14} className="text-red-400" />;
  }
};

export const CustomerIpNdaView: React.FC = () => {
  const [selectedCustId, setSelectedCustId] = useState(CUSTOMERS[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  const activeCustomer = CUSTOMERS.find(c => c.id === selectedCustId) || CUSTOMERS[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-amber-900/50 pb-4 bg-gradient-to-r from-[#1a1205] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <Scale size={14} /> Intellectual Property Governance
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             知识产权 <span className="text-amber-500">与保密协议管理</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Active NDAs</div>
                <div className="text-xl font-mono font-bold text-white">1,204</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">IP Assets Value</div>
                <div className="text-xl font-mono font-bold text-amber-400">¥ 4.2B</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Compliance Rate</div>
                <div className="text-xl font-mono font-bold text-green-400">99.8%</div>
            </div>
            <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]">
               <FileSignature size={14} /> 签署新协议
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Customer Registry */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search customer..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-amber-500 text-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-400">
                  <Filter size={14} />
               </button>
           </div>

           <div className="flex flex-col gap-3">
               {CUSTOMERS.map(cust => (
                   <div 
                     key={cust.id}
                     onClick={() => setSelectedCustId(cust.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedCustId === cust.id 
                            ? 'bg-amber-950/30 border-amber-500/50 shadow-[inset_4px_0_0_#f59e0b]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <div>
                               <div className="text-[10px] font-mono text-slate-500">{cust.id}</div>
                               <div className={`font-bold text-sm line-clamp-1 ${selectedCustId === cust.id ? 'text-white' : 'text-slate-300'}`}>
                                   {cust.name}
                               </div>
                           </div>
                           <StatusBadge status={cust.ndaStatus} />
                       </div>
                       
                       <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 mt-2">
                           <div className="flex items-center gap-1"><Shield size={10}/> IP: {cust.ipCount}</div>
                           <div className="flex items-center gap-1 justify-end"><Clock size={10}/> Exp: {cust.ndaExpiry}</div>
                       </div>
                       
                       {cust.riskScore > 50 && (
                           <div className="mt-2 w-full bg-red-900/20 border border-red-900/50 rounded px-2 py-1 flex items-center justify-between text-[10px] text-red-300">
                               <span className="flex items-center gap-1"><AlertTriangle size={10}/> High Risk Detected</span>
                               <span>{cust.riskScore}/100</span>
                           </div>
                       )}
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: The Vault Workspace */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Top: NDA Lifecycle & Status */}
           <SciFiCard title="保密协议 (NDA) 执行监控" subtitle="LIFECYCLE" className="border-amber-900/50 bg-[#0c0a06]" noPadding>
               <div className="flex flex-col h-full p-4 gap-4">
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                           <div className="p-3 bg-slate-900 border border-slate-700 rounded-full text-amber-500">
                               <FileKey size={24} />
                           </div>
                           <div>
                               <div className="text-lg font-bold text-white">Mutual Non-Disclosure Agreement</div>
                               <div className="text-xs text-slate-400 flex items-center gap-2">
                                   Ver: 2024-STD-V2 <span className="w-1 h-1 bg-slate-600 rounded-full"></span> Signed: 2022-01-01
                               </div>
                           </div>
                       </div>
                       <div className="text-right">
                           <div className="text-[10px] text-slate-500 uppercase">Validity</div>
                           <div className="text-2xl font-mono font-bold text-white">{activeCustomer.ndaExpiry === '-' ? 'N/A' : '865 Days Left'}</div>
                       </div>
                   </div>

                   {/* Clause Compliance Checklist */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                       {NDA_CLAUSES.map((clause) => (
                           <div key={clause.id} className="flex items-center justify-between p-2 bg-slate-900/50 border border-slate-800 rounded">
                               <div className="flex items-center gap-2">
                                   <div className={`w-1.5 h-1.5 rounded-full ${clause.status === 'Compliant' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                   <span className="text-xs text-slate-300">{clause.title}</span>
                               </div>
                               <span className={`text-[9px] px-1.5 rounded ${clause.riskLevel === 'High' ? 'bg-red-900/20 text-red-400' : 'bg-slate-800 text-slate-500'}`}>
                                   {clause.riskLevel} Risk
                               </span>
                           </div>
                       ))}
                   </div>
               </div>
           </SciFiCard>

           {/* Middle: IP Asset Grid */}
           <SciFiCard title="知识产权资产矩阵 (IP Portfolio)" subtitle="ASSETS" className="flex-1 border-slate-800">
               <div className="flex flex-col h-full gap-4">
                   <div className="overflow-x-auto">
                       <table className="w-full text-left text-xs">
                           <thead className="text-slate-500 bg-slate-900/80 uppercase font-bold">
                               <tr>
                                   <th className="p-3">Asset Name</th>
                                   <th className="p-3">Type</th>
                                   <th className="p-3">Reg. Number</th>
                                   <th className="p-3">Filing Date</th>
                                   <th className="p-3">Valuation</th>
                                   <th className="p-3 text-right">Status</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-800/50 text-slate-300">
                               {IP_ASSETS.map((asset) => (
                                   <tr key={asset.id} className="hover:bg-amber-900/10 transition-colors group cursor-pointer">
                                       <td className="p-3 font-bold text-white group-hover:text-amber-400 transition-colors">{asset.title}</td>
                                       <td className="p-3 flex items-center gap-2">
                                           <TypeIcon type={asset.type} /> {asset.type}
                                       </td>
                                       <td className="p-3 font-mono text-slate-400">{asset.regNumber}</td>
                                       <td className="p-3">{asset.filingDate}</td>
                                       <td className="p-3 font-mono text-emerald-400">{asset.valueEst}</td>
                                       <td className="p-3 text-right">
                                           <StatusBadge status={asset.status} />
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
                   
                   <div className="mt-auto flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-800">
                       <span>Total 5 Assets Displayed</span>
                       <button className="flex items-center gap-1 hover:text-white transition-colors">
                           View All in Registry <ArrowRight size={12}/>
                       </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Risk & Intelligence */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Risk Radar */}
           <SciFiCard title="IP 风险与合规雷达" subtitle="ASSESSMENT" className="border-slate-800">
               <div className="h-56 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RISK_RADAR}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Score" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0a06', borderColor: '#f59e0b'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Asset Distribution */}
           <SciFiCard title="资产类型分布" subtitle="PORTFOLIO" className="border-slate-800">
               <div className="h-40 w-full flex items-center">
                   <div className="w-1/2 h-full relative">
                       <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                               <Pie 
                                 data={IP_DISTRIBUTION} 
                                 innerRadius={30} 
                                 outerRadius={50} 
                                 paddingAngle={5} 
                                 dataKey="value"
                               >
                                   {IP_DISTRIBUTION.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.fill} />
                                   ))}
                               </Pie>
                           </PieChart>
                       </ResponsiveContainer>
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <Briefcase size={20} className="text-slate-500" />
                       </div>
                   </div>
                   <div className="flex-1 space-y-2 pr-2">
                       {IP_DISTRIBUTION.map((d, i) => (
                           <div key={i} className="flex justify-between items-center text-xs">
                               <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.fill}}></div>
                                   <span className="text-slate-300">{d.name}</span>
                               </div>
                               <span className="font-mono text-white">{d.value}%</span>
                           </div>
                       ))}
                   </div>
               </div>
           </SciFiCard>

           {/* Compliance Trend */}
           <SciFiCard title="合规指数趋势" subtitle="AUDIT LOG" className="flex-1 border-slate-800">
               <div className="w-full h-32 mb-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={COMPLIANCE_TREND}>
                           <defs>
                               <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                           <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis hide domain={[60, 100]} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0a06', borderColor: '#10b981'}} />
                           <Area type="monotone" dataKey="score" stroke="#10b981" fill="url(#colorComp)" strokeWidth={2} />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
               
               <div className="space-y-2">
                   <div className="p-2 bg-red-900/10 border border-red-900/30 rounded flex items-start gap-2">
                       <Gavel size={14} className="text-red-500 mt-0.5" />
                       <div className="text-[10px] text-red-200">
                           <strong>Alert:</strong> Potential trademark infringement detected in Region CN-East. Legal review pending.
                       </div>
                   </div>
                   <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded border border-slate-600 transition-colors flex items-center justify-center gap-2">
                       <BookOpen size={12} /> View Audit Report
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
