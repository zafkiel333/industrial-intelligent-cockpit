
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  CreditCard, FileText, DollarSign, RefreshCw, 
  Search, Filter, Download, Send, AlertCircle, 
  CheckCircle2, Clock, Landmark, Calculator,
  PieChart as PieIcon, ArrowUpRight, ArrowDownLeft,
  Banknote, Receipt, Scale
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';

// --- Types ---

interface FinanceProfile {
  id: string;
  name: string;
  taxId: string;
  bankName: string;
  bankAccount: string;
  address: string;
  phone: string;
  creditLimit: number;
  creditUsed: number;
  currency: string;
  paymentTerm: string; // e.g., Net 30
}

interface Transaction {
  id: string;
  date: string;
  type: 'Invoice' | 'Payment' | 'CreditNote' | 'Settlement';
  amount: number;
  status: 'Pending' | 'Partial' | 'Cleared' | 'Overdue' | 'Disputed';
  refDoc: string;
  desc: string;
}

interface AgingData {
  range: string;
  amount: number;
}

// --- Mock Data ---

const CUSTOMERS = [
  { id: 'C-001', name: 'Shanghai Heavy Industries', status: 'Good', balance: 45000 },
  { id: 'C-002', name: 'Pacific Power Group', status: 'Warning', balance: 125000 },
  { id: 'C-003', name: 'AutoWorks GmbH', status: 'Good', balance: 0 },
  { id: 'C-004', name: 'Quantum Tech', status: 'Overdue', balance: 8500 },
];

const FINANCE_PROFILES: Record<string, FinanceProfile> = {
  'C-001': {
    id: 'C-001', name: 'Shanghai Heavy Industries Ltd.',
    taxId: '91310000X88293...',
    bankName: 'ICBC Shanghai Branch',
    bankAccount: '6222 0210 0100 8888 999',
    address: 'No. 88, Century Ave, Pudong, Shanghai',
    phone: '021-55558888',
    creditLimit: 1000000,
    creditUsed: 450000,
    currency: 'CNY',
    paymentTerm: 'Net 60'
  },
  'C-002': {
    id: 'C-002', name: 'Pacific Power Group',
    taxId: '91110000Y77382...',
    bankName: 'Bank of China Beijing',
    bankAccount: '6201 0980 1122 3344 555',
    address: 'No. 1, Chang\'an St, Beijing',
    phone: '010-66667777',
    creditLimit: 500000,
    creditUsed: 480000,
    currency: 'CNY',
    paymentTerm: 'Net 30'
  }
};

const TRANSACTIONS: Transaction[] = [
  { id: 'INV-2024-001', date: '2024-03-15', type: 'Invoice', amount: 125000, status: 'Pending', refDoc: 'SO-8821', desc: 'Q1 Equipment Supply' },
  { id: 'PAY-2024-089', date: '2024-03-10', type: 'Payment', amount: -50000, status: 'Cleared', refDoc: 'TR-9921', desc: 'Bank Transfer - Partial' },
  { id: 'SET-2024-012', date: '2024-02-28', type: 'Settlement', amount: 0, status: 'Cleared', refDoc: 'STM-Feb', desc: 'February Statement Confirmed' },
  { id: 'INV-2024-002', date: '2024-02-15', type: 'Invoice', amount: 45000, status: 'Overdue', refDoc: 'SO-8755', desc: 'Maintenance Service' },
  { id: 'CN-2024-001', date: '2024-02-10', type: 'CreditNote', amount: -2000, status: 'Cleared', refDoc: 'RET-001', desc: 'Return Goods Adjustment' },
];

const AGING_DATA: AgingData[] = [
  { range: '0-30 Days', amount: 125000 },
  { range: '31-60 Days', amount: 45000 },
  { range: '61-90 Days', amount: 12000 },
  { range: '90+ Days', amount: 5000 },
];

const RECONCILIATION_STATS = [
  { name: 'Matched', value: 85, color: '#10b981' },
  { name: 'In Transit', value: 10, color: '#f59e0b' },
  { name: 'Disputed', value: 5, color: '#ef4444' },
];

// --- Helper Components ---

const StatusTag = ({ status }: { status: string }) => {
  const styles = {
    'Pending': 'bg-blue-900/30 text-blue-400 border-blue-800',
    'Cleared': 'bg-green-900/30 text-green-400 border-green-800',
    'Overdue': 'bg-red-900/30 text-red-400 border-red-800 animate-pulse',
    'Partial': 'bg-amber-900/30 text-amber-400 border-amber-800',
    'Disputed': 'bg-purple-900/30 text-purple-400 border-purple-800',
  }[status] || 'bg-slate-800 text-slate-400';

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles}`}>
      {status}
    </span>
  );
};

const DigitalInvoiceCard = ({ profile }: { profile: FinanceProfile }) => (
  <div className="relative w-full h-48 bg-gradient-to-br from-[#1a1300] to-[#0c0a00] rounded-xl border border-amber-500/30 overflow-hidden shadow-lg group hover:border-amber-500/60 transition-all">
    {/* Metallic Shine Effect */}
    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(110deg,transparent_25%,rgba(255,215,0,0.05)_50%,transparent_75%)] pointer-events-none"></div>
    
    <div className="absolute top-4 left-4">
      <div className="text-[10px] text-amber-600 uppercase font-bold tracking-widest flex items-center gap-1">
        <Landmark size={12} /> Corporate Billing Profile
      </div>
      <div className="text-xl font-bold text-amber-100 mt-1">{profile.name}</div>
    </div>

    <div className="absolute top-4 right-4">
      <div className="px-2 py-1 bg-amber-900/20 border border-amber-600/50 rounded text-xs text-amber-400 font-mono">
        TAX ID: {profile.taxId.slice(0, 10)}...
      </div>
    </div>

    <div className="absolute bottom-4 left-4 right-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[9px] text-slate-500 uppercase">Bank Name</div>
          <div className="text-sm text-slate-300 font-medium truncate">{profile.bankName}</div>
        </div>
        <div>
          <div className="text-[9px] text-slate-500 uppercase">Account Number</div>
          <div className="text-sm text-slate-300 font-mono tracking-wider">{profile.bankAccount}</div>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-amber-900/30 flex justify-between text-[10px] text-amber-600">
         <span className="flex items-center gap-1"><CreditCard size={10}/> Verified</span>
         <span>Billing Term: {profile.paymentTerm}</span>
      </div>
    </div>
  </div>
);

export const CustomerFinanceView: React.FC = () => {
  const [selectedCustId, setSelectedCustId] = useState('C-001');
  const [activeTab, setActiveTab] = useState<'Invoices' | 'Statements'>('Invoices');

  const activeProfile = FINANCE_PROFILES[selectedCustId] || FINANCE_PROFILES['C-001'];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-amber-600/40 pb-4 bg-gradient-to-r from-[#1f1205] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <DollarSign size={14} /> Financial Operations Center
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             结算与开票 <span className="text-amber-500">资金中台</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Total AR (应收)</div>
                <div className="text-xl font-mono font-bold text-white">¥ 1,245,000</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">DSO (周转天数)</div>
                <div className="text-xl font-mono font-bold text-green-400">42 Days</div>
            </div>
            <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]">
               <FileText size={14} /> 开具发票
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Customer Wallet List */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4 overflow-y-auto pr-1">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input type="text" placeholder="Search customer..." className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-amber-500 text-slate-200"/>
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
                       <div className="flex justify-between items-center mb-1">
                           <span className="text-[10px] font-mono text-slate-500">{cust.id}</span>
                           <div className={`w-2 h-2 rounded-full ${cust.status === 'Good' ? 'bg-green-500' : cust.status === 'Warning' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                       </div>
                       <div className={`text-sm font-bold truncate mb-2 ${selectedCustId === cust.id ? 'text-white' : 'text-slate-300'}`}>{cust.name}</div>
                       <div className="flex justify-between items-end">
                           <div className="text-[10px] text-slate-500 uppercase">Balance</div>
                           <div className="text-sm font-mono text-amber-200">¥ {cust.balance.toLocaleString()}</div>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: The Transaction Ledger */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Top: Digital Billing Profile */}
           <div className="flex flex-col gap-4">
               <DigitalInvoiceCard profile={activeProfile} />
               
               {/* Credit Bar */}
               <div className="bg-slate-900/50 border border-slate-800 rounded p-3 flex items-center gap-4">
                   <div className="text-xs font-bold text-slate-400 whitespace-nowrap w-24">信用额度 Usage</div>
                   <div className="flex-1 relative h-3 bg-slate-800 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-gradient-to-r from-green-500 to-amber-500 transition-all duration-1000" 
                         style={{width: `${(activeProfile.creditUsed / activeProfile.creditLimit) * 100}%`}}
                       ></div>
                   </div>
                   <div className="text-xs font-mono text-slate-300 whitespace-nowrap">
                       {((activeProfile.creditUsed / activeProfile.creditLimit) * 100).toFixed(1)}% ({activeProfile.creditUsed / 1000}k / {activeProfile.creditLimit / 1000}k)
                   </div>
               </div>
           </div>

           {/* Ledger / Waterfall */}
           <SciFiCard 
             title="往来账务明细 (Ledger)" 
             subtitle="TRANSACTIONS" 
             className="flex-1 border-amber-900/50" 
             noPadding
           >
               <div className="flex flex-col h-full">
                   {/* Tabs */}
                   <div className="flex border-b border-slate-800 px-4 pt-2 gap-4">
                       {['Invoices', 'Statements', 'Payments'].map(tab => (
                           <button 
                             key={tab}
                             onClick={() => setActiveTab(tab as any)}
                             className={`pb-2 text-xs font-bold uppercase border-b-2 transition-colors ${activeTab === tab ? 'text-amber-400 border-amber-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                           >
                               {tab}
                           </button>
                       ))}
                       <div className="flex-1"></div>
                       <button className="text-slate-400 hover:text-white pb-2"><Filter size={14}/></button>
                   </div>

                   {/* List Header */}
                   <div className="grid grid-cols-6 gap-2 px-4 py-2 bg-slate-900/80 text-[10px] text-slate-500 uppercase font-bold border-b border-slate-800">
                       <div className="col-span-1">Date / ID</div>
                       <div className="col-span-1">Type</div>
                       <div className="col-span-2">Description</div>
                       <div className="col-span-1 text-right">Amount</div>
                       <div className="col-span-1 text-center">Status</div>
                   </div>

                   {/* List Rows */}
                   <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                       {TRANSACTIONS.map((tx) => (
                           <div key={tx.id} className="grid grid-cols-6 gap-2 px-3 py-3 rounded hover:bg-slate-800/50 transition-colors items-center border border-transparent hover:border-slate-700">
                               <div className="col-span-1">
                                   <div className="text-xs text-slate-300 font-mono">{tx.date}</div>
                                   <div className="text-[10px] text-slate-500">{tx.id}</div>
                               </div>
                               <div className="col-span-1">
                                   <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                       {tx.type === 'Invoice' ? <FileText size={12} className="text-amber-500"/> : 
                                        tx.type === 'Payment' ? <ArrowDownLeft size={12} className="text-green-500"/> : 
                                        tx.type === 'CreditNote' ? <RefreshCw size={12} className="text-purple-500"/> :
                                        <CheckCircle2 size={12} className="text-blue-500"/>}
                                       {tx.type}
                                   </div>
                               </div>
                               <div className="col-span-2 text-xs text-slate-400 truncate" title={tx.desc}>{tx.desc}</div>
                               <div className="col-span-1 text-right">
                                   <div className={`text-sm font-mono font-bold ${tx.amount < 0 ? 'text-green-400' : 'text-white'}`}>
                                       {tx.amount < 0 ? '-' : ''}¥ {Math.abs(tx.amount).toLocaleString()}
                                   </div>
                               </div>
                               <div className="col-span-1 text-center">
                                   <StatusTag status={tx.status} />
                               </div>
                           </div>
                       ))}
                   </div>
                   
                   {/* Footer Actions */}
                   <div className="p-3 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/30">
                       <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-600 rounded text-xs text-slate-300 hover:text-white hover:border-slate-400 transition-colors">
                           <Download size={12} /> Export CSV
                       </button>
                       <button className="flex items-center gap-2 px-3 py-1.5 bg-amber-900/20 border border-amber-600/50 rounded text-xs text-amber-400 hover:bg-amber-900/40 transition-colors">
                           <Send size={12} /> Send Statement
                       </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Risk & Analytics */}
        <div className="w-full lg:w-[300px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Aging Analysis */}
           <SciFiCard title="账龄分析 (Aging)" subtitle="OVERDUE RISK" className="border-amber-900/50">
               <div className="h-48 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={AGING_DATA} layout="vertical" margin={{top:5, right:20, bottom:5, left:0}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                           <XAxis type="number" stroke="#666" tick={{fontSize: 9}} hide />
                           <YAxis dataKey="range" type="category" stroke="#94a3b8" width={70} tick={{fontSize: 10}} />
                           <Tooltip cursor={{fill: '#1c1917'}} contentStyle={{backgroundColor: '#0c0a06', borderColor: '#f59e0b'}} />
                           <Bar dataKey="amount" barSize={15} radius={[0, 4, 4, 0]}>
                               {AGING_DATA.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : index === 2 ? '#f97316' : '#ef4444'} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
               </div>
               <div className="text-[10px] text-center text-slate-500 mt-2">
                   Total Overdue: <span className="text-red-400 font-bold">¥ 17,000</span> (Critical)
               </div>
           </SciFiCard>

           {/* Reconciliation Status */}
           <SciFiCard title="对账差异监控" subtitle="RECONCILIATION" className="border-slate-800">
               <div className="flex items-center gap-2 h-32">
                   <div className="w-24 h-24 relative flex-shrink-0">
                       <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                               <Pie data={RECONCILIATION_STATS} innerRadius={25} outerRadius={35} paddingAngle={5} dataKey="value">
                                   {RECONCILIATION_STATS.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.color} />
                                   ))}
                               </Pie>
                           </PieChart>
                       </ResponsiveContainer>
                       <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">95%</div>
                   </div>
                   <div className="flex-1 space-y-2 text-xs">
                       <div className="flex justify-between">
                           <span className="text-slate-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Matched</span>
                           <span className="text-white">85%</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Transit</span>
                           <span className="text-white">10%</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Disputed</span>
                           <span className="text-white">5%</span>
                       </div>
                   </div>
               </div>
               <div className="mt-2 p-2 bg-red-900/10 border border-red-900/30 rounded flex items-start gap-2">
                   <AlertCircle size={12} className="text-red-500 mt-0.5" />
                   <div className="text-[10px] text-red-200">
                       Detected 2 invoice mismatches in last batch. <span className="underline cursor-pointer">Review</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Quick Tools */}
           <div className="grid grid-cols-2 gap-3">
               <div className="bg-slate-900/50 p-3 rounded border border-slate-700 hover:border-amber-500/30 cursor-pointer group transition-colors">
                   <Calculator size={20} className="text-slate-500 group-hover:text-amber-400 mb-2" />
                   <div className="text-xs text-slate-300 font-bold">Tax Calc</div>
               </div>
               <div className="bg-slate-900/50 p-3 rounded border border-slate-700 hover:border-amber-500/30 cursor-pointer group transition-colors">
                   <Scale size={20} className="text-slate-500 group-hover:text-amber-400 mb-2" />
                   <div className="text-xs text-slate-300 font-bold">Audit Log</div>
               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
