
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Award, ShieldCheck, Globe, Users, 
  TrendingUp, AlertOctagon, FileCheck, Map,
  CheckCircle2, XCircle, Zap, Coins,
  MoreHorizontal, Filter, Search, Crown,
  Briefcase, Lock, Key, AlertTriangle
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid, AreaChart, Area
} from 'recharts';

// --- Types ---

type TierLevel = 'Global' | 'Strategic' | 'Core' | 'Authorized';
type AuthStatus = 'Active' | 'Expiring' | 'Revoked' | 'Pending';

interface AgentProfile {
  id: string;
  name: string;
  tier: TierLevel;
  region: string;
  status: AuthStatus;
  authorizedProducts: string[];
  validUntil: string;
  creditScore: number;
  rebatePool: number;
  performance: {
    sales: number; // % of target
    tech: number;  // Tech capability score
    compliance: number;
    capital: number;
    marketing: number;
  };
}

// --- Mock Data ---

const AGENTS: AgentProfile[] = [
  { 
    id: 'AG-001', name: 'Sino-Global Distribution', tier: 'Global', region: 'East China', 
    status: 'Active', authorizedProducts: ['Heavy Mach', 'IoT Systems', 'Spare Parts', 'Service'],
    validUntil: '2025-12-31', creditScore: 98, rebatePool: 450000,
    performance: { sales: 110, tech: 95, compliance: 100, capital: 90, marketing: 85 }
  },
  { 
    id: 'AG-002', name: 'North Star Tech Ltd.', tier: 'Strategic', region: 'North China', 
    status: 'Active', authorizedProducts: ['IoT Systems', 'Service'],
    validUntil: '2024-12-31', creditScore: 88, rebatePool: 120000,
    performance: { sales: 92, tech: 88, compliance: 95, capital: 80, marketing: 75 }
  },
  { 
    id: 'AG-003', name: 'Western Mining Supply', tier: 'Core', region: 'West China', 
    status: 'Expiring', authorizedProducts: ['Spare Parts'],
    validUntil: '2024-04-15', creditScore: 75, rebatePool: 25000,
    performance: { sales: 85, tech: 60, compliance: 80, capital: 70, marketing: 60 }
  },
  { 
    id: 'AG-004', name: 'Pearl River Equipment', tier: 'Core', region: 'South China', 
    status: 'Active', authorizedProducts: ['Heavy Mach', 'Spare Parts'],
    validUntil: '2025-06-30', creditScore: 82, rebatePool: 55000,
    performance: { sales: 98, tech: 75, compliance: 90, capital: 85, marketing: 80 }
  },
];

const TIER_STATS = [
  { level: 'Global', count: 3, color: '#f59e0b', revenue: '45%' },
  { level: 'Strategic', count: 12, color: '#ec4899', revenue: '30%' },
  { level: 'Core', count: 45, color: '#3b82f6', revenue: '20%' },
  { level: 'Authorized', count: 120, color: '#10b981', revenue: '5%' },
];

const SALES_TREND = [
  { month: 'Q1', target: 100, actual: 95 },
  { month: 'Q2', target: 100, actual: 105 },
  { month: 'Q3', target: 100, actual: 112 },
  { month: 'Q4', target: 100, actual: 98 },
];

// --- Components ---

const StatusTag = ({ status }: { status: AuthStatus }) => {
  const styles = {
    'Active': 'bg-emerald-900/30 text-emerald-400 border-emerald-500/50',
    'Expiring': 'bg-amber-900/30 text-amber-400 border-amber-500/50 animate-pulse',
    'Revoked': 'bg-red-900/30 text-red-400 border-red-500/50',
    'Pending': 'bg-blue-900/30 text-blue-400 border-blue-500/50',
  }[status];
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1 ${styles}`}>
      {status === 'Active' && <CheckCircle2 size={10} />}
      {status === 'Expiring' && <AlertOctagon size={10} />}
      {status === 'Revoked' && <XCircle size={10} />}
      {status}
    </span>
  );
};

const TierPyramid = ({ activeTier, onSelect }: { activeTier: string, onSelect: (t: string) => void }) => {
  return (
    <div className="relative w-full h-48 flex flex-col items-center justify-center gap-1">
       {/* Global */}
       <div 
         onClick={() => onSelect('Global')}
         className={`w-1/4 h-8 flex items-center justify-center rounded-t-lg cursor-pointer transition-all border border-b-0
            ${activeTier === 'Global' ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_15px_#f59e0b]' : 'bg-slate-900/50 border-slate-700 text-slate-500'}
         `}
       >
         <Crown size={14} className={activeTier === 'Global' ? 'text-amber-400' : 'text-slate-600'} />
       </div>
       
       {/* Strategic */}
       <div 
         onClick={() => onSelect('Strategic')}
         className={`w-2/4 h-10 flex items-center justify-center cursor-pointer transition-all border border-b-0
            ${activeTier === 'Strategic' ? 'bg-pink-500/20 border-pink-500 text-pink-300 shadow-[0_0_15px_#ec4899]' : 'bg-slate-900/50 border-slate-700 text-slate-500'}
         `}
       >
         <span className="text-xs font-bold uppercase">Strategic</span>
       </div>

       {/* Core */}
       <div 
         onClick={() => onSelect('Core')}
         className={`w-3/4 h-12 flex items-center justify-center cursor-pointer transition-all border border-b-0
            ${activeTier === 'Core' ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-[0_0_15px_#3b82f6]' : 'bg-slate-900/50 border-slate-700 text-slate-500'}
         `}
       >
         <span className="text-xs font-bold uppercase">Core Partner</span>
       </div>

       {/* Authorized */}
       <div 
         onClick={() => onSelect('Authorized')}
         className={`w-full h-14 flex items-center justify-center rounded-b-lg cursor-pointer transition-all border
            ${activeTier === 'Authorized' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_#10b981]' : 'bg-slate-900/50 border-slate-700 text-slate-500'}
         `}
       >
         <span className="text-xs font-bold uppercase">Authorized Reseller</span>
       </div>
    </div>
  );
};

const HolographicCert = ({ agent }: { agent: AgentProfile }) => {
  return (
    <div className="relative w-full aspect-[1.6] bg-gradient-to-br from-slate-900 to-slate-950 rounded-lg border border-slate-700 overflow-hidden group">
       {/* Hologram Effect Overlay */}
       <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(14,165,233,0.1)_50%,transparent_60%)] pointer-events-none group-hover:opacity-100 transition-opacity"></div>
       <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]"></div>
       
       <div className="absolute top-0 right-0 p-4">
          <ShieldCheck size={48} className="text-emerald-500/20" />
       </div>

       <div className="p-6 flex flex-col h-full justify-between relative z-10">
          <div>
             <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Award size={18} />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Certificate of Authorization</span>
             </div>
             <h3 className="text-xl font-bold text-white font-serif tracking-wide">{agent.name}</h3>
             <div className="text-xs text-slate-400 mt-1">Unified Agency Code: <span className="font-mono text-emerald-300">{agent.id}</span></div>
          </div>

          <div className="space-y-2">
             <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-1">
                <span className="text-slate-500">Authorization Level</span>
                <span className={`font-bold uppercase ${agent.tier === 'Global' ? 'text-amber-400' : 'text-blue-400'}`}>{agent.tier} Partner</span>
             </div>
             <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-1">
                <span className="text-slate-500">Authorized Territory</span>
                <span className="text-white">{agent.region}</span>
             </div>
             <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-1">
                <span className="text-slate-500">Validity Period</span>
                <span className="font-mono text-white">Until {agent.validUntil}</span>
             </div>
          </div>

          <div className="flex justify-between items-end">
             <div className="w-16 h-16 border-2 border-slate-700 bg-white/5 p-1">
                {/* QR Code Placeholder */}
                <div className="w-full h-full bg-black flex items-center justify-center text-[8px] text-slate-500 text-center leading-tight">
                   Digital Sig Verified
                </div>
             </div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Status</div>
                <div className={`text-lg font-bold ${agent.status === 'Active' ? 'text-emerald-400' : 'text-red-400'}`}>{agent.status}</div>
             </div>
          </div>
       </div>
    </div>
  );
};

export const CustomerChannelAuthView: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState('Global');
  const [selectedAgentId, setSelectedAgentId] = useState(AGENTS[0].id);

  const activeAgent = AGENTS.find(a => a.id === selectedAgentId) || AGENTS[0];
  
  // Radar Data
  const radarData = [
    { subject: 'Sales Perf', A: activeAgent.performance.sales, fullMark: 150 },
    { subject: 'Tech Capability', A: activeAgent.performance.tech, fullMark: 100 },
    { subject: 'Marketing', A: activeAgent.performance.marketing, fullMark: 100 },
    { subject: 'Capital', A: activeAgent.performance.capital, fullMark: 100 },
    { subject: 'Compliance', A: activeAgent.performance.compliance, fullMark: 100 },
  ];

  const filteredAgents = AGENTS.filter(a => selectedTier === 'All' || a.tier === selectedTier);

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-emerald-900/50 pb-4 bg-gradient-to-r from-[#022c22] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-wider">
             <Briefcase size={14} /> Partner Relationship Management (PRM)
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户渠道授权 <span className="text-emerald-500">与代理等级管理</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Total Partners</div>
                <div className="text-xl font-mono font-bold text-white">180</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Channel GMV</div>
                <div className="text-xl font-mono font-bold text-emerald-400">$ 45.2M</div>
            </div>
            <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
               <ShieldCheck size={14} /> 授权审核
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Hierarchy & Roster */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           {/* Tier Selector */}
           <SciFiCard title="代理等级金字塔" subtitle="TIER STRUCTURE" className="border-emerald-900/30">
               <TierPyramid activeTier={selectedTier} onSelect={setSelectedTier} />
               <div className="grid grid-cols-2 gap-2 mt-4">
                   {TIER_STATS.map(stat => (
                       <div key={stat.level} className="text-center p-2 bg-slate-900/50 rounded border border-slate-800">
                           <div className="text-[10px] text-slate-500 uppercase">{stat.level}</div>
                           <div className="text-sm font-bold text-white">{stat.count}</div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Agent List */}
           <div className="flex flex-col gap-3 flex-1">
               <div className="flex items-center gap-2 mb-1">
                   <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                      <input 
                        type="text" 
                        placeholder="Search agent..." 
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                      />
                   </div>
                   <button className="p-1.5 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-400">
                      <Filter size={14} />
                   </button>
               </div>
               
               <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                   {filteredAgents.length > 0 ? filteredAgents.map(agent => (
                       <div 
                         key={agent.id}
                         onClick={() => setSelectedAgentId(agent.id)}
                         className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                            ${selectedAgentId === agent.id 
                                ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[inset_4px_0_0_#10b981]' 
                                : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                         `}
                       >
                           <div className="flex justify-between items-start mb-1">
                               <span className="font-bold text-sm text-white truncate">{agent.name}</span>
                               <StatusTag status={agent.status} />
                           </div>
                           <div className="flex justify-between text-[10px] text-slate-400">
                               <span>{agent.region}</span>
                               <span className={agent.creditScore > 90 ? 'text-green-400' : 'text-yellow-400'}>Score: {agent.creditScore}</span>
                           </div>
                       </div>
                   )) : (
                       <div className="text-center text-slate-500 py-4 text-xs">No agents in this tier.</div>
                   )}
               </div>
           </div>

        </div>

        {/* CENTER COLUMN: Network Matrix & Authorization */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Top: Matrix & Scope */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[340px]">
               
               {/* Sales Performance Chart */}
               <SciFiCard title="销售业绩达成率" subtitle="QoQ TREND" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={SALES_TREND} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                               <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#10b981', color: '#fff'}} />
                               <Bar dataKey="actual" name="Actual" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                               <Bar dataKey="target" name="Target" fill="#334155" radius={[4, 4, 0, 0]} barSize={20} />
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               {/* Authorization Scope */}
               <SciFiCard title="授权产品范围" subtitle="SCOPE" className="border-slate-800">
                   <div className="flex flex-col gap-4 h-full">
                       <div className="grid grid-cols-2 gap-3">
                           {['Heavy Mach', 'IoT Systems', 'Spare Parts', 'Service'].map((prod, i) => {
                               const isAuth = activeAgent.authorizedProducts.includes(prod);
                               return (
                                   <div key={i} className={`p-3 rounded border flex items-center justify-between
                                      ${isAuth ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-slate-900/30 border-slate-800 opacity-50'}
                                   `}>
                                       <span className={`text-xs font-bold ${isAuth ? 'text-emerald-100' : 'text-slate-500'}`}>{prod}</span>
                                       {isAuth ? <Lock size={14} className="text-emerald-500" /> : <Lock size={14} className="text-slate-600" />}
                                   </div>
                               );
                           })}
                       </div>
                       
                       <div className="mt-auto p-3 bg-slate-900/50 border border-slate-700 rounded text-xs text-slate-300">
                           <div className="flex items-center gap-2 mb-1 text-slate-400 uppercase font-bold text-[10px]">
                               <Key size={12} /> Authorization Key
                           </div>
                           <div className="font-mono text-emerald-400 break-all">
                               {activeAgent.id}-AUTH-X992-SECURE-TOKEN
                           </div>
                       </div>
                   </div>
               </SciFiCard>
           </div>

           {/* Bottom: Capability Radar & Rebates */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-64">
               
               <SciFiCard title="代理商能力画像" subtitle="CAPABILITY" className="lg:col-span-2 border-indigo-900/50">
                   <div className="h-full w-full flex items-center">
                       <div className="w-1/2 h-full">
                           <ResponsiveContainer width="100%" height="100%">
                               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                   <PolarGrid stroke="#334155" />
                                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                   <Radar name="Agent" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                                   <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#8b5cf6', color: '#fff'}} />
                               </RadarChart>
                           </ResponsiveContainer>
                       </div>
                       <div className="flex-1 space-y-3 pr-4">
                           <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                               <span className="text-xs text-slate-400">Tech Capability</span>
                               <div className="flex gap-1">
                                   {[1,2,3,4,5].map(n => <div key={n} className={`w-2 h-2 rounded-full ${n <= activeAgent.performance.tech/20 ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>)}
                               </div>
                           </div>
                           <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                               <span className="text-xs text-slate-400">Capital Strength</span>
                               <div className="flex gap-1">
                                   {[1,2,3,4,5].map(n => <div key={n} className={`w-2 h-2 rounded-full ${n <= activeAgent.performance.capital/20 ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>)}
                               </div>
                           </div>
                           <div className="flex justify-between items-center">
                               <span className="text-xs text-slate-400">Risk Score</span>
                               <span className="text-sm font-bold text-green-400">Low</span>
                           </div>
                       </div>
                   </div>
               </SciFiCard>

               <SciFiCard title="返利资金池 (Rebate)" subtitle="WALLET" className="border-yellow-900/30">
                   <div className="flex flex-col items-center justify-center h-full gap-2">
                       <div className="p-3 bg-yellow-900/20 rounded-full border border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                           <Coins size={32} className="text-yellow-400" />
                       </div>
                       <div className="text-3xl font-mono font-bold text-white mt-2">
                           ¥ {(activeAgent.rebatePool / 10000).toFixed(1)}w
                       </div>
                       <div className="text-[10px] text-slate-400 uppercase">Available Balance</div>
                       
                       <button className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 transition-colors">
                           View Statement
                       </button>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: The Certificate */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 pr-1">
           
           <SciFiCard title="数字授权证书" subtitle="DIGITAL TWIN" className="flex-1 border-emerald-900/50 bg-[#020408]" noPadding>
               <div className="w-full h-full p-4 flex flex-col">
                   <HolographicCert agent={activeAgent} />
                   
                   <div className="mt-6 space-y-4">
                       <div className="p-3 bg-slate-900/50 rounded border border-slate-800">
                           <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
                               <AlertTriangle size={14} className="text-yellow-500" /> Compliance Check
                           </div>
                           <div className="space-y-2">
                               <div className="flex justify-between text-[10px] text-slate-400">
                                   <span>Anti-Bribery Policy</span>
                                   <span className="text-green-400">Signed</span>
                               </div>
                               <div className="flex justify-between text-[10px] text-slate-400">
                                   <span>Brand Guidelines</span>
                                   <span className="text-green-400">Compliant</span>
                               </div>
                               <div className="flex justify-between text-[10px] text-slate-400">
                                   <span>Inventory Report</span>
                                   <span className="text-yellow-500">Pending (3 days)</span>
                               </div>
                           </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-2">
                           <button className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors">
                               <FileCheck size={14} /> Renew Auth
                           </button>
                           <button className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 text-xs rounded flex items-center justify-center gap-2 transition-colors">
                               <MoreHorizontal size={14} /> Actions
                           </button>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
