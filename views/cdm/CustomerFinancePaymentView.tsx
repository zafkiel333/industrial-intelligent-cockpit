
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  CreditCard, Globe, ShieldCheck, Activity, 
  RefreshCcw, Lock, Wallet, ArrowDownLeft, 
  ArrowUpRight, Landmark, Banknote, Signal,
  CheckCircle, AlertOctagon, Smartphone,
  ScanLine, Key, Eye
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// --- Types ---

interface PaymentInstrument {
  id: string;
  type: 'Bank Transfer' | 'Digital Wallet' | 'Letter of Credit' | 'Corporate Card';
  provider: string; // e.g. ICBC, Alipay, SWIFT
  accountNo: string; // Masked
  currency: string;
  status: 'Verified' | 'Pending' | 'Expired' | 'Frozen';
  lastUsed: string;
  limit: number;
}

interface TransactionFlow {
  id: string;
  time: string;
  amount: number;
  currency: string;
  channel: string;
  status: 'Clearing' | 'Settled' | 'Rejected' | 'AML Check';
  fraudScore: number; // 0-100 (High is bad)
}

// --- Mock Data ---

const PAYMENT_METHODS: PaymentInstrument[] = [
  { id: 'PM-8821', type: 'Bank Transfer', provider: 'ICBC Shanghai', accountNo: '**** **** **** 8821', currency: 'CNY', status: 'Verified', lastUsed: '2024-03-20', limit: 5000000 },
  { id: 'PM-9932', type: 'Letter of Credit', provider: 'Bank of China', accountNo: 'LC-2024-0052', currency: 'USD', status: 'Verified', lastUsed: '2024-02-15', limit: 10000000 },
  { id: 'PM-1022', type: 'Digital Wallet', provider: 'Alipay Enterprise', accountNo: 'corp@heavyind.com', currency: 'CNY', status: 'Verified', lastUsed: '2024-03-21', limit: 500000 },
  { id: 'PM-4401', type: 'Corporate Card', provider: 'Visa Commercial', accountNo: '**** 4401', currency: 'USD', status: 'Expired', lastUsed: '2023-11-10', limit: 50000 },
];

const CURRENCY_DIST = [
  { name: 'CNY (人民币)', value: 65, color: '#ef4444' },
  { name: 'USD (美元)', value: 25, color: '#10b981' },
  { name: 'EUR (欧元)', value: 10, color: '#3b82f6' },
];

const CLEARING_TREND = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  volume: Math.floor(Math.random() * 2000) + 1000,
  latency: Math.floor(Math.random() * 50) + 20
}));

// --- Helper Components ---

const StatusIndicator = ({ status }: { status: string }) => {
  const styles = {
    'Verified': 'bg-emerald-950/50 text-emerald-400 border-emerald-800',
    'Pending': 'bg-amber-950/50 text-amber-400 border-amber-800',
    'Expired': 'bg-slate-800 text-slate-400 border-slate-600',
    'Frozen': 'bg-red-950/50 text-red-400 border-red-800 animate-pulse',
    'Clearing': 'bg-blue-900/30 text-blue-300 border-blue-700',
    'Settled': 'bg-green-900/30 text-green-300 border-green-700',
    'Rejected': 'bg-red-900/30 text-red-300 border-red-700',
    'AML Check': 'bg-purple-900/30 text-purple-300 border-purple-700',
  }[status] || 'bg-slate-800 text-slate-400';

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1`}>
      {status === 'Verified' && <CheckCircle size={10} />}
      {status === 'AML Check' && <ScanLine size={10} />}
      {status === 'Frozen' && <Lock size={10} />}
      {status}
    </span>
  );
};

const BankCard: React.FC<{ data: PaymentInstrument }> = ({ data }) => (
  <div className={`relative p-4 rounded-xl border overflow-hidden group transition-all duration-300
      ${data.status === 'Frozen' ? 'bg-red-950/10 border-red-900/50 grayscale' : 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700 hover:border-cyan-500/50'}
  `}>
      {/* Chip Visual */}
      <div className="flex justify-between items-start mb-6">
          <div className="w-10 h-7 rounded bg-gradient-to-tr from-yellow-200 to-yellow-600 border border-yellow-700/50 opacity-80"></div>
          <div className="text-right">
              <div className="text-xs font-bold text-white uppercase tracking-wider">{data.provider}</div>
              <div className="text-[10px] text-slate-500">{data.type}</div>
          </div>
      </div>

      {/* Number */}
      <div className="text-lg font-mono font-bold text-slate-200 tracking-widest mb-4 flex items-center gap-2">
          {data.accountNo}
          {data.status === 'Verified' && <ShieldCheck size={14} className="text-emerald-500" />}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end">
          <div>
              <div className="text-[9px] text-slate-500 uppercase">Currency</div>
              <div className="text-xs font-bold text-cyan-400">{data.currency}</div>
          </div>
          <div className="text-right">
              <div className="text-[9px] text-slate-500 uppercase">Status</div>
              <StatusIndicator status={data.status} />
          </div>
      </div>

      {/* Gloss Effect */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
  </div>
);

export const CustomerFinancePaymentView: React.FC = () => {
  const [liveTransactions, setLiveTransactions] = useState<TransactionFlow[]>([]);
  
  // Real-time transaction generator
  useEffect(() => {
    const generateTx = () => {
      const id = Math.random().toString(36).substring(7).toUpperCase();
      const statuses: any[] = ['Clearing', 'Settled', 'Settled', 'Settled', 'AML Check', 'Rejected'];
      const channels = ['SWIFT', 'CNAPS', 'Alipay', 'UnionPay'];
      
      return {
        id: `TX-${id}`,
        time: new Date().toLocaleTimeString('zh-CN'),
        amount: Math.floor(Math.random() * 50000) + 1000,
        currency: Math.random() > 0.7 ? 'USD' : 'CNY',
        channel: channels[Math.floor(Math.random() * channels.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        fraudScore: Math.floor(Math.random() * 100)
      };
    };

    // Init
    setLiveTransactions(Array.from({length: 8}, generateTx));

    const interval = setInterval(() => {
      setLiveTransactions(prev => [generateTx(), ...prev.slice(0, 9)]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#060b19] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Landmark size={14} /> Treasury & Payment Hub
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户财务与 <span className="text-cyan-500">支付信息管理</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Incoming Cash (Today)</div>
                <div className="text-xl font-mono font-bold text-emerald-400 flex items-center justify-end gap-2">
                    <ArrowDownLeft size={16} /> ¥ 2,450,800
                </div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Outgoing Pending</div>
                <div className="text-xl font-mono font-bold text-amber-400 flex items-center justify-end gap-2">
                    <ArrowUpRight size={16} /> ¥ 125,000
                </div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
             <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Active Channels</div>
                <div className="text-xl font-mono font-bold text-white flex items-center justify-end gap-2">
                    <Signal size={16} className="text-cyan-500 animate-pulse" /> 12/12
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Payment Instruments */}
        <div className="w-full lg:w-[350px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex justify-between items-center mb-2 px-1">
               <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                   <Wallet size={14} /> Signed Instruments
               </span>
               <button className="text-[10px] bg-cyan-900/30 text-cyan-400 border border-cyan-800 px-2 py-1 rounded hover:bg-cyan-900/50 transition-colors">
                   + Add Account
               </button>
           </div>

           <div className="flex flex-col gap-4">
               {PAYMENT_METHODS.map(card => (
                   <BankCard key={card.id} data={card} />
               ))}
           </div>

           {/* Security Stats */}
           <SciFiCard title="支付安全态势 (Security)" className="mt-4 border-slate-800">
               <div className="space-y-4">
                   <div className="flex justify-between items-center">
                       <span className="text-xs text-slate-400 flex items-center gap-2"><Lock size={12}/> Encryption</span>
                       <span className="text-xs font-mono text-green-400">TLS 1.3 / AES-256</span>
                   </div>
                   <div className="flex justify-between items-center">
                       <span className="text-xs text-slate-400 flex items-center gap-2"><Key size={12}/> Tokenization</span>
                       <span className="text-xs font-mono text-green-400">Active</span>
                   </div>
                   <div className="flex justify-between items-center">
                       <span className="text-xs text-slate-400 flex items-center gap-2"><Eye size={12}/> 3D Secure</span>
                       <span className="text-xs font-mono text-green-400">Enforced</span>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Transaction Monitor */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Live Flow Visualization */}
           <SciFiCard title="实时资金清算流 (Real-time Clearing)" subtitle="PAYMENT GATEWAY" className="h-[320px] border-cyan-900/50 bg-[#02040a]" noPadding>
               <div className="flex flex-col h-full p-4">
                   <div className="flex-1 overflow-hidden relative">
                       {/* Table Header */}
                       <div className="grid grid-cols-6 text-[10px] text-slate-500 uppercase font-bold border-b border-slate-800 pb-2 mb-2">
                           <div className="col-span-1">Txn ID</div>
                           <div className="col-span-1">Time</div>
                           <div className="col-span-1">Channel</div>
                           <div className="col-span-1 text-right">Amount</div>
                           <div className="col-span-1 text-center">Risk Score</div>
                           <div className="col-span-1 text-right">Status</div>
                       </div>
                       
                       {/* Live Rows */}
                       <div className="space-y-1">
                           {liveTransactions.map((tx) => (
                               <div key={tx.id} className="grid grid-cols-6 items-center py-2 border-b border-slate-800/40 text-xs animate-in slide-in-from-top-2 fade-in duration-300">
                                   <div className="col-span-1 font-mono text-slate-400">{tx.id}</div>
                                   <div className="col-span-1 text-slate-500">{tx.time}</div>
                                   <div className="col-span-1 flex items-center gap-2">
                                       {tx.channel.includes('Alipay') ? <Smartphone size={12} className="text-blue-400"/> : <Globe size={12} className="text-slate-400"/>}
                                       {tx.channel}
                                   </div>
                                   <div className="col-span-1 text-right font-mono text-white">
                                       {tx.currency} {tx.amount.toLocaleString()}
                                   </div>
                                   <div className="col-span-1 flex justify-center">
                                       <div className={`px-2 py-0.5 rounded text-[10px] w-12 text-center ${tx.fraudScore > 80 ? 'bg-red-900/50 text-red-400' : 'bg-green-900/20 text-green-500'}`}>
                                           {tx.fraudScore}
                                       </div>
                                   </div>
                                   <div className="col-span-1 flex justify-end">
                                       <StatusIndicator status={tx.status} />
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Analytics Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
               
               <SciFiCard title="支付通道稳定性 (Latency)" subtitle="MS" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={CLEARING_TREND}>
                               <defs>
                                   <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="time" stroke="#666" tick={{fontSize: 10}} />
                               <YAxis stroke="#666" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9', fontSize: '12px'}} />
                               <Area type="monotone" dataKey="latency" stroke="#0ea5e9" fill="url(#colorLatency)" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="币种结算分布" subtitle="CURRENCY MIX" className="border-slate-800">
                   <div className="flex items-center h-full">
                       <div className="w-1/2 h-full">
                           <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                   <Pie 
                                     data={CURRENCY_DIST} 
                                     innerRadius={40} 
                                     outerRadius={60} 
                                     paddingAngle={5} 
                                     dataKey="value"
                                   >
                                       {CURRENCY_DIST.map((entry, index) => (
                                           <Cell key={`cell-${index}`} fill={entry.color} />
                                       ))}
                                   </Pie>
                                   <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#333'}} />
                               </PieChart>
                           </ResponsiveContainer>
                       </div>
                       <div className="flex-1 flex flex-col justify-center gap-3">
                           {CURRENCY_DIST.map((d, i) => (
                               <div key={i} className="flex flex-col">
                                   <div className="flex justify-between text-xs mb-1">
                                       <span className="text-slate-300">{d.name}</span>
                                       <span className="font-bold text-white">{d.value}%</span>
                                   </div>
                                   <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                       <div className="h-full" style={{width: `${d.value}%`, backgroundColor: d.color}}></div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Reconciliation & Fraud */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Anti-Fraud Radar */}
           <SciFiCard title="反欺诈风控 (AML/Fraud)" subtitle="AI SHIELD" className="border-red-900/30">
               <div className="flex flex-col gap-4">
                   <div className="p-3 bg-red-950/10 border border-red-500/20 rounded flex items-center justify-between">
                       <div className="flex items-center gap-2">
                           <AlertOctagon size={16} className="text-red-500 animate-pulse" />
                           <div>
                               <div className="text-xs font-bold text-red-200">High Risk Txn Detected</div>
                               <div className="text-[10px] text-red-400/70">ID: TX-X992 (Amount Mismatch)</div>
                           </div>
                       </div>
                       <button className="text-[10px] bg-red-900/50 hover:bg-red-800 text-white px-2 py-1 rounded transition-colors">
                           Review
                       </button>
                   </div>

                   <div className="space-y-2">
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Velocity Check</span>
                           <span className="text-green-400 font-bold">Pass</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Geo-IP Match</span>
                           <span className="text-green-400 font-bold">Pass</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Blacklist Check</span>
                           <span className="text-green-400 font-bold">Clean</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Behavior Model</span>
                           <span className="text-yellow-400 font-bold">Suspicious (85%)</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Reconciliation Workbench */}
           <SciFiCard title="对账工作台" subtitle="RECON" className="flex-1 border-slate-800">
               <div className="flex flex-col h-full gap-3">
                   <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-700">
                       <div className="flex items-center gap-2">
                           <Banknote size={16} className="text-cyan-500" />
                           <div className="text-xs text-slate-300">Unreconciled Items</div>
                       </div>
                       <span className="text-lg font-mono font-bold text-white">12</span>
                   </div>
                   
                   <div className="flex-1 bg-slate-900/30 rounded border border-slate-800 p-2 overflow-y-auto custom-scrollbar">
                       {[
                           { id: 'REC-01', desc: 'Wire Transfer #9921', amt: 50000, status: 'Match Found' },
                           { id: 'REC-02', desc: 'Cheque Deposit #221', amt: 12500, status: 'Pending' },
                           { id: 'REC-03', desc: 'Alipay Batch #B-01', amt: 8400, status: 'Variance' },
                       ].map((item, i) => (
                           <div key={i} className="mb-2 p-2 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/50 transition-colors cursor-pointer">
                               <div className="flex justify-between text-xs mb-1">
                                   <span className="font-bold text-slate-300">{item.id}</span>
                                   <span className="font-mono text-cyan-300">¥ {item.amt}</span>
                               </div>
                               <div className="flex justify-between items-center text-[10px]">
                                   <span className="text-slate-500">{item.desc}</span>
                                   <span className={`px-1.5 py-0.5 rounded ${item.status === 'Variance' ? 'bg-red-900/30 text-red-300' : 'bg-slate-800 text-slate-400'}`}>
                                       {item.status}
                                   </span>
                               </div>
                           </div>
                       ))}
                   </div>

                   <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-2">
                       <RefreshCcw size={12} /> Auto-Reconcile Batch
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
