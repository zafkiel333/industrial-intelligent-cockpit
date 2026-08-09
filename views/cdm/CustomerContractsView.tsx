
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  FileText, Shield, DollarSign, Calendar, 
  AlertTriangle, CheckCircle2, Search, Filter, 
  Briefcase, Scale, PenTool, History, 
  CreditCard, PieChart as PieIcon, Landmark,
  Gavel, ScrollText, ArrowRight, Truck
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, LineChart, Line
} from 'recharts';

// --- Types ---

interface Contract {
  id: string;
  title: string;
  customer: string;
  type: 'Sales' | 'Service' | 'NDA' | 'Procurement';
  status: 'Draft' | 'Review' | 'Active' | 'Expiring' | 'Closed';
  value: number; // USD
  currency: string;
  startDate: string;
  endDate: string;
  riskScore: number; // 0-100
  terms: {
    payment: string;
    incoterms: string;
    warranty: string;
    penalty: string;
  };
  progress: number; // 0-100% (Time elapsed or value consumed)
}

// --- Mock Data ---

const CONTRACTS_DATA: Contract[] = [
  { 
    id: 'CTR-2024-001', title: 'Annual Equipment Supply Agreement', customer: 'Shanghai Heavy Ind.', 
    type: 'Sales', status: 'Active', value: 4500000, currency: 'USD',
    startDate: '2024-01-01', endDate: '2024-12-31', riskScore: 15,
    terms: { payment: 'Net 60', incoterms: 'DDP Shanghai', warranty: '24 Months', penalty: '0.5% / Week' },
    progress: 35
  },
  { 
    id: 'CTR-2023-089', title: 'Smart O&M Service Level Agreement', customer: 'Pacific Power Group', 
    type: 'Service', status: 'Active', value: 1200000, currency: 'USD',
    startDate: '2023-06-01', endDate: '2026-05-31', riskScore: 5,
    terms: { payment: 'Quarterly Advance', incoterms: 'N/A', warranty: 'SLA 99.9%', penalty: 'Service Credits' },
    progress: 28
  },
  { 
    id: 'CTR-2024-042', title: 'Strategic Partnership MOU', customer: 'Quantum Tech', 
    type: 'NDA', status: 'Review', value: 0, currency: 'USD',
    startDate: '2024-04-01', endDate: '2025-03-31', riskScore: 45,
    terms: { payment: 'N/A', incoterms: 'N/A', warranty: 'N/A', penalty: 'Legal Action' },
    progress: 0
  },
  { 
    id: 'CTR-2021-112', title: 'Legacy Maintenance Contract', customer: 'Northern Grid', 
    type: 'Service', status: 'Expiring', value: 850000, currency: 'USD',
    startDate: '2021-05-01', endDate: '2024-04-30', riskScore: 65,
    terms: { payment: 'Net 30', incoterms: 'FOB', warranty: '12 Months', penalty: '1% / Week' },
    progress: 98
  },
  { 
    id: 'CTR-2024-015', title: 'Spare Parts Framework', customer: 'AutoWorks GmbH', 
    type: 'Sales', status: 'Draft', value: 2000000, currency: 'EUR',
    startDate: 'TBD', endDate: 'TBD', riskScore: 10,
    terms: { payment: 'LC at Sight', incoterms: 'EXW', warranty: 'Standard', penalty: 'None' },
    progress: 0
  }
];

const PAY_SCHEDULE = [
  { month: 'Jan', plan: 150, actual: 150 },
  { month: 'Feb', plan: 120, actual: 110 },
  { month: 'Mar', plan: 180, actual: 180 },
  { month: 'Apr', plan: 200, actual: 0 }, // Future
  { month: 'May', plan: 150, actual: 0 },
  { month: 'Jun', plan: 220, actual: 0 },
];

const TERM_DISTRIBUTION = [
  { name: 'Standard', value: 65, color: '#10b981' },
  { name: 'Deviated', value: 25, color: '#f59e0b' },
  { name: 'High Risk', value: 10, color: '#ef4444' },
];

// --- Helper Components ---

const StatusTag = ({ status }: { status: string }) => {
  const styles = {
    'Active': 'bg-green-900/30 text-green-400 border-green-800',
    'Review': 'bg-blue-900/30 text-blue-400 border-blue-800',
    'Expiring': 'bg-red-900/30 text-red-400 border-red-800 animate-pulse',
    'Draft': 'bg-slate-800 text-slate-400 border-slate-600',
    'Closed': 'bg-slate-900 text-slate-600 border-slate-800',
  }[status] || 'bg-slate-800 text-slate-400';

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles}`}>
      {status}
    </span>
  );
};

const RiskGauge = ({ score }: { score: number }) => {
  const color = score < 30 ? '#10b981' : score < 70 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
      <div 
        className="h-full transition-all duration-1000"
        style={{ width: `${score}%`, backgroundColor: color }}
      ></div>
    </div>
  );
};

export const CustomerContractsView: React.FC = () => {
  const [selectedId, setSelectedId] = useState(CONTRACTS_DATA[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  const activeContract = CONTRACTS_DATA.find(c => c.id === selectedId) || CONTRACTS_DATA[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-amber-600/40 pb-4 bg-gradient-to-r from-[#1f1505] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <Scale size={14} /> Commercial Governance
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             合同与商务 <span className="text-amber-500">条款控制台</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Total Contract Value</div>
                <div className="text-xl font-mono font-bold text-white">$ 145.2 M</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Compliance Rate</div>
                <div className="text-xl font-mono font-bold text-green-400">98.2%</div>
            </div>
            <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]">
               <PenTool size={14} /> 起草合同
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Contract Registry */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           {/* Filters */}
           <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search ID, Customer..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-amber-500 text-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-400">
                  <Filter size={14} />
               </button>
           </div>

           {/* List */}
           <div className="flex flex-col gap-3">
               {CONTRACTS_DATA.map(contract => (
                   <div 
                     key={contract.id}
                     onClick={() => setSelectedId(contract.id)}
                     className={`p-4 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedId === contract.id 
                            ? 'bg-amber-950/30 border-amber-500/50 shadow-[inset_4px_0_0_#f59e0b]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-mono text-slate-500 bg-slate-950/50 px-1.5 rounded border border-slate-800">
                               {contract.id}
                           </span>
                           <StatusTag status={contract.status} />
                       </div>
                       
                       <h3 className={`font-bold text-sm mb-1 line-clamp-1 ${selectedId === contract.id ? 'text-white' : 'text-slate-300'}`}>
                           {contract.title}
                       </h3>
                       <div className="text-[10px] text-slate-400 mb-3 truncate">{contract.customer}</div>

                       <div className="flex justify-between items-end">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">Value</div>
                               <div className="text-sm font-mono font-bold text-amber-100">
                                   {contract.currency === 'USD' ? '$' : '€'} {(contract.value / 1000).toFixed(0)}k
                               </div>
                           </div>
                           <div className="text-right">
                               <div className="text-[9px] text-slate-500 uppercase">Expires</div>
                               <div className="text-xs font-mono text-slate-300">{contract.endDate}</div>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: Digital Contract Twin */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
           
           {/* Top: Identity & Timeline */}
           <SciFiCard title="合同全生命周期视图" subtitle="LIFECYCLE" className="border-amber-900/50 bg-[#0c0a06]">
               <div className="flex flex-col gap-6">
                   {/* Header Info */}
                   <div className="flex justify-between items-start">
                       <div>
                           <h2 className="text-2xl font-bold text-white mb-2">{activeContract.title}</h2>
                           <div className="flex gap-4 text-xs text-slate-400">
                               <span className="flex items-center gap-1"><Briefcase size={12} className="text-amber-500"/> {activeContract.customer}</span>
                               <span className="flex items-center gap-1"><FileText size={12} className="text-amber-500"/> {activeContract.type} Contract</span>
                           </div>
                       </div>
                       <div className="text-right">
                           <div className="text-[10px] text-slate-500 uppercase font-bold">Progress</div>
                           <div className="text-2xl font-bold text-white">{activeContract.progress}%</div>
                       </div>
                   </div>

                   {/* Metro Map Timeline */}
                   <div className="relative px-4 py-2">
                       <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-0"></div>
                       <div className="flex justify-between relative z-10">
                           {['Draft', 'Review', 'Signed', 'Active', 'Close'].map((step, i) => {
                               const isActive = 
                                   (activeContract.status === 'Draft' && i === 0) ||
                                   (activeContract.status === 'Review' && i <= 1) ||
                                   (activeContract.status === 'Active' && i <= 3) ||
                                   (activeContract.status === 'Expiring' && i <= 3) ||
                                   (activeContract.status === 'Closed');
                               
                               return (
                                   <div key={step} className="flex flex-col items-center gap-2">
                                       <div className={`w-4 h-4 rounded-full border-2 transition-all
                                           ${isActive ? 'bg-amber-500 border-amber-500 scale-125 shadow-[0_0_10px_#f59e0b]' : 'bg-slate-900 border-slate-600'}
                                       `}></div>
                                       <span className={`text-[10px] uppercase font-bold ${isActive ? 'text-amber-100' : 'text-slate-600'}`}>{step}</span>
                                   </div>
                               );
                           })}
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Middle: Commercial Terms Matrix */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
               {/* Key Terms Grid */}
               <SciFiCard title="核心商务条款" subtitle="KEY TERMS" className="border-slate-800">
                   <div className="grid grid-cols-2 gap-4">
                       <div className="p-3 bg-slate-900/50 rounded border border-slate-700/50">
                           <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                               <DollarSign size={12} className="text-green-400"/> Payment Term
                           </div>
                           <div className="text-lg font-bold text-white">{activeContract.terms.payment}</div>
                       </div>
                       <div className="p-3 bg-slate-900/50 rounded border border-slate-700/50">
                           <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                               <Truck size={12} className="text-blue-400"/> Incoterms
                           </div>
                           <div className="text-lg font-bold text-white">{activeContract.terms.incoterms}</div>
                       </div>
                       <div className="p-3 bg-slate-900/50 rounded border border-slate-700/50">
                           <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                               <Shield size={12} className="text-amber-400"/> Warranty
                           </div>
                           <div className="text-lg font-bold text-white">{activeContract.terms.warranty}</div>
                       </div>
                       <div className="p-3 bg-slate-900/50 rounded border border-slate-700/50">
                           <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                               <Gavel size={12} className="text-red-400"/> Penalty
                           </div>
                           <div className="text-lg font-bold text-white">{activeContract.terms.penalty}</div>
                       </div>
                   </div>
                   
                   {/* Non-Standard Clause Alert */}
                   <div className="mt-4 p-3 bg-amber-900/10 border border-amber-500/20 rounded flex items-start gap-3">
                       <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                       <div>
                           <div className="text-xs font-bold text-amber-200">Non-Standard Clause Detected</div>
                           <div className="text-[10px] text-amber-200/70 mt-1">Section 14.2 (IP Rights) deviates from standard template. Legal review recommended before renewal.</div>
                       </div>
                   </div>
               </SciFiCard>

               {/* Financial Performance */}
               <SciFiCard title="合同执行资金流" subtitle="CASH FLOW" className="border-slate-800">
                   <div className="h-48 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={PAY_SCHEDULE} margin={{top:10, right:10, left:0, bottom:0}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="month" stroke="#666" tick={{fontSize: 10}} />
                               <YAxis stroke="#666" tick={{fontSize: 10}} />
                               <Tooltip cursor={{fill: '#1c1917'}} contentStyle={{backgroundColor: '#0c0a06', borderColor: '#f59e0b'}} />
                               <Bar dataKey="plan" name="Planned" fill="#334155" />
                               <Bar dataKey="actual" name="Actual" fill="#f59e0b" />
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="flex justify-between items-center text-xs px-2 mt-2">
                       <div className="flex gap-4">
                           <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-600 rounded-full"></div> Plan</span>
                           <span className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> Actual</span>
                       </div>
                       <span className="text-green-400 font-bold">On Track</span>
                   </div>
               </SciFiCard>

           </div>

           {/* Bottom: Document Vault */}
           <SciFiCard title="合同文档金库" subtitle="SECURE VAULT" className="border-slate-800">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {[
                       { name: 'Signed_Contract_Main.pdf', size: '2.4 MB', date: '2024-01-02' },
                       { name: 'Technical_Annex_V3.pdf', size: '15.8 MB', date: '2023-12-20' },
                       { name: 'NDA_Signed.pdf', size: '0.8 MB', date: '2023-11-15' },
                   ].map((doc, i) => (
                       <div key={i} className="flex items-center p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-amber-500/30 transition-colors cursor-pointer group">
                           <div className="p-2 bg-slate-800 rounded mr-3 text-slate-400 group-hover:text-amber-400">
                               <ScrollText size={20} />
                           </div>
                           <div className="flex-1 min-w-0">
                               <div className="text-sm font-bold text-slate-300 group-hover:text-white truncate">{doc.name}</div>
                               <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                                   <span>{doc.size}</span>
                                   <span>{doc.date}</span>
                               </div>
                           </div>
                           <ArrowRight size={14} className="text-slate-600 group-hover:text-amber-500 ml-2" />
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Analytics & Risk */}
        <div className="w-full lg:w-[280px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Risk Monitor */}
           <SciFiCard title="风险评估" subtitle="RISK SCORE" className="border-amber-900/50">
               <div className="flex flex-col items-center py-4">
                   <div className="text-4xl font-bold text-white mb-2">{activeContract.riskScore}</div>
                   <div className="w-full px-4 mb-2">
                       <RiskGauge score={activeContract.riskScore} />
                   </div>
                   <div className={`text-xs font-bold uppercase py-1 px-3 rounded
                       ${activeContract.riskScore < 30 ? 'bg-green-900/20 text-green-400' : 
                         activeContract.riskScore < 70 ? 'bg-yellow-900/20 text-yellow-400' : 'bg-red-900/20 text-red-400'}
                   `}>
                       {activeContract.riskScore < 30 ? 'Low Risk' : activeContract.riskScore < 70 ? 'Medium Risk' : 'High Risk'}
                   </div>
               </div>
               
               <div className="space-y-2 mt-4 px-2">
                   <div className="flex justify-between text-xs">
                       <span className="text-slate-400">Financial Risk</span>
                       <span className="text-green-400">Low</span>
                   </div>
                   <div className="flex justify-between text-xs">
                       <span className="text-slate-400">Legal Risk</span>
                       <span className="text-yellow-400">Med</span>
                   </div>
                   <div className="flex justify-between text-xs">
                       <span className="text-slate-400">Delivery Risk</span>
                       <span className="text-green-400">Low</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Terms Analysis */}
           <SciFiCard title="条款合规性分布" className="border-slate-800">
               <div className="h-40 w-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie 
                             data={TERM_DISTRIBUTION} 
                             innerRadius={30} 
                             outerRadius={50} 
                             paddingAngle={5} 
                             dataKey="value"
                           >
                               {TERM_DISTRIBUTION.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.color} />
                               ))}
                           </Pie>
                           <Tooltip contentStyle={{backgroundColor: '#0c0a06', borderColor: '#f59e0b'}} />
                       </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <span className="text-xs font-bold text-slate-500">100%</span>
                   </div>
               </div>
               <div className="space-y-1 px-2">
                   {TERM_DISTRIBUTION.map((item, i) => (
                       <div key={i} className="flex items-center justify-between text-[10px]">
                           <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                               <span className="text-slate-300">{item.name}</span>
                           </div>
                           <span className="text-slate-500">{item.value}%</span>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Action Center */}
           <div className="mt-auto bg-slate-900/50 border border-slate-700 p-4 rounded">
               <div className="text-xs font-bold text-slate-400 uppercase mb-3">Pending Actions</div>
               <div className="space-y-2">
                   <button className="w-full text-left text-xs text-slate-300 hover:text-white flex items-center gap-2 p-2 hover:bg-slate-800 rounded transition-colors">
                       <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                       Approve Payment Milestone #2
                   </button>
                   <button className="w-full text-left text-xs text-slate-300 hover:text-white flex items-center gap-2 p-2 hover:bg-slate-800 rounded transition-colors">
                       <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                       Review SLA Breach (Mar 12)
                   </button>
               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
