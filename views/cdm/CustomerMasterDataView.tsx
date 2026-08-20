
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Search, Filter, Plus, FileText, Database, 
  Hash, GitCommit, CheckCircle2, AlertCircle, 
  MoreHorizontal, QrCode, ShieldCheck, RefreshCw,
  Globe, Building2, User, CreditCard
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, CartesianGrid
} from 'recharts';

// --- Types & Mock Data ---

interface CustomerRecord {
  id: string; // The Unified Code
  name: string;
  type: 'Enterprise' | 'Government' | 'Individual';
  industry: string;
  region: string;
  status: 'Active' | 'Pending' | 'Draft' | 'Blocked';
  completeness: number; // 0-100
  updated: string;
}

const CUSTOMER_DATA: CustomerRecord[] = [
  { id: 'ENT-CN-MFG-24001', name: 'Shanghai Heavy Industries Ltd.', type: 'Enterprise', industry: 'Manufacturing', region: 'East China', status: 'Active', completeness: 100, updated: '2024-03-15' },
  { id: 'ENT-CN-EGY-24042', name: 'Pacific Power Group', type: 'Enterprise', industry: 'Energy', region: 'North China', status: 'Active', completeness: 95, updated: '2024-03-14' },
  { id: 'GOV-CN-TRN-23115', name: 'Municipal Transport Bureau', type: 'Government', industry: 'Public Sector', region: 'South China', status: 'Active', completeness: 100, updated: '2023-11-30' },
  { id: 'ENT-US-LOG-24005', name: 'Global Logistics Corp.', type: 'Enterprise', industry: 'Logistics', region: 'Overseas', status: 'Pending', completeness: 80, updated: '2024-03-16' },
  { id: 'IND-CN-RET-24088', name: 'Wang J.', type: 'Individual', industry: 'Retail', region: 'West China', status: 'Draft', completeness: 45, updated: '2024-03-16' },
  { id: 'ENT-DE-AUT-23552', name: 'AutoWorks GmbH', type: 'Enterprise', industry: 'Automotive', region: 'Overseas', status: 'Active', completeness: 98, updated: '2023-12-10' },
  { id: 'ENT-CN-TCH-24102', name: 'Quantum Chip Tech', type: 'Enterprise', industry: 'Technology', region: 'East China', status: 'Active', completeness: 92, updated: '2024-02-28' },
];

const CODE_SEGMENTS = [
  { id: 'seg1', label: 'Entity Type', value: 'ENT', desc: 'Enterprise / Gov / Ind', color: '#0ea5e9' },
  { id: 'seg2', label: 'Country Region', value: 'CN', desc: 'ISO 3166-1 Alpha-2', color: '#8b5cf6' },
  { id: 'seg3', label: 'Industry Code', value: 'MFG', desc: 'Standard Ind. Class', color: '#f59e0b' },
  { id: 'seg4', label: 'Sequence No.', value: '24001', desc: 'Auto-increment', color: '#10b981' },
];

const QUALITY_STATS = [
  { name: 'Completeness', value: 94 },
  { name: 'Uniqueness', value: 99.8 },
  { name: 'Validity', value: 97.5 },
  { name: 'Consistency', value: 92 },
];

// --- Components ---

const CodingVisualizer = ({ code }: { code: string }) => {
  const parts = code.split('-');
  return (
    <div className="flex items-center gap-1 p-4 bg-[#050b14] border border-slate-800 rounded-lg overflow-x-auto">
      {parts.length === 4 ? (
        <>
          <div className="flex flex-col items-center gap-2">
             <div className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider">{CODE_SEGMENTS[0].label}</div>
             <div data-localization="preserve" className="px-3 py-2 bg-cyan-950/40 border border-cyan-500/50 rounded text-xl font-mono text-cyan-300 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                {parts[0]}
             </div>
          </div>
          <div className="h-0.5 w-4 bg-slate-700 mt-6"></div>
          <div className="flex flex-col items-center gap-2">
             <div className="text-[10px] text-purple-500 font-bold uppercase tracking-wider">{CODE_SEGMENTS[1].label}</div>
             <div data-localization="preserve" className="px-3 py-2 bg-purple-950/40 border border-purple-500/50 rounded text-xl font-mono text-purple-300 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                {parts[1]}
             </div>
          </div>
          <div className="h-0.5 w-4 bg-slate-700 mt-6"></div>
          <div className="flex flex-col items-center gap-2">
             <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">{CODE_SEGMENTS[2].label}</div>
             <div data-localization="preserve" className="px-3 py-2 bg-amber-950/40 border border-amber-500/50 rounded text-xl font-mono text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                {parts[2]}
             </div>
          </div>
          <div className="h-0.5 w-4 bg-slate-700 mt-6"></div>
          <div className="flex flex-col items-center gap-2">
             <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">{CODE_SEGMENTS[3].label}</div>
             <div data-localization="preserve" className="px-3 py-2 bg-emerald-950/40 border border-emerald-500/50 rounded text-xl font-mono text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                {parts[3]}
             </div>
          </div>
        </>
      ) : (
        <div className="text-slate-500 text-sm">Non-standard Code Format</div>
      )}
    </div>
  );
};

export const CustomerMasterDataView: React.FC = () => {
  const [selectedId, setSelectedId] = useState(CUSTOMER_DATA[0].id);
  const selectedRecord = CUSTOMER_DATA.find(c => c.id === selectedId) || CUSTOMER_DATA[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="md:col-span-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
               <Database size={14} /> Master Data Management
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
               客户主数据 <span className="text-indigo-500">统一建档</span>
            </h1>
         </div>
         
         <div className="md:col-span-3 grid grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-slate-700 p-3 rounded flex items-center justify-between">
               <div>
                  <div className="text-xs text-slate-400 uppercase">Total Records</div>
                  <div className="text-2xl font-mono font-bold text-white">14,205</div>
               </div>
               <div className="h-10 w-10 bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-400">
                  <FileText size={20} />
               </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 p-3 rounded flex items-center justify-between">
               <div>
                  <div className="text-xs text-slate-400 uppercase">Data Quality Score</div>
                  <div className="text-2xl font-mono font-bold text-green-400">98.5%</div>
               </div>
               <div className="h-10 w-10 bg-green-900/30 rounded-full flex items-center justify-center text-green-400">
                  <ShieldCheck size={20} />
               </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 p-3 rounded flex items-center justify-between">
               <div>
                  <div className="text-xs text-slate-400 uppercase">New Today</div>
                  <div className="text-2xl font-mono font-bold text-cyan-400">+12</div>
               </div>
               <div className="h-10 w-10 bg-cyan-900/30 rounded-full flex items-center justify-center text-cyan-400">
                  <RefreshCw size={20} />
               </div>
            </div>
         </div>
      </div>

      {/* 2. Main Workspace (Split View) */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
         
         {/* Left: Data Registry (List View) */}
         <div className="w-full lg:w-2/3 flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex gap-4">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search by Name, Unified Code, or Tax ID..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                  />
               </div>
               <button className="px-4 py-2 bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-300 rounded text-sm flex items-center gap-2 transition-colors">
                  <Filter size={16} /> Filter
               </button>
               <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-colors">
                  <Plus size={16} /> New Record
               </button>
            </div>

            {/* Grid */}
            <SciFiCard title="主数据注册表 (Registry)" subtitle="LIVE VIEW" className="flex-1 border-indigo-900/30" noPadding>
               <div className="w-full h-full overflow-y-auto">
                  <table className="w-full text-left text-sm">
                     <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-400 sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                           <th className="px-4 py-3 border-b border-slate-700">Unified Code</th>
                           <th className="px-4 py-3 border-b border-slate-700">Customer Name</th>
                           <th className="px-4 py-3 border-b border-slate-700">Type</th>
                           <th className="px-4 py-3 border-b border-slate-700">Region</th>
                           <th className="px-4 py-3 border-b border-slate-700">Quality</th>
                           <th className="px-4 py-3 border-b border-slate-700">Status</th>
                           <th className="px-4 py-3 border-b border-slate-700 w-10"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800/50">
                        {CUSTOMER_DATA.map((row) => (
                           <tr 
                             key={row.id} 
                             onClick={() => setSelectedId(row.id)}
                             className={`cursor-pointer transition-colors hover:bg-white/5
                                ${selectedId === row.id ? 'bg-indigo-900/20 border-l-2 border-indigo-500' : 'border-l-2 border-transparent'}
                             `}
                           >
                              <td data-localization="preserve" className="px-4 py-3 font-mono text-indigo-300 font-bold">{row.id}</td>
                              <td className="px-4 py-3 font-bold text-slate-200">{row.name}</td>
                              <td className="px-4 py-3 text-slate-400">
                                 <div className="flex items-center gap-2">
                                    {row.type === 'Enterprise' ? <Building2 size={14}/> : <User size={14}/>}
                                    {row.type}
                                 </div>
                              </td>
                              <td className="px-4 py-3 text-slate-400">{row.region}</td>
                              <td className="px-4 py-3">
                                 <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                       className={`h-full ${row.completeness > 90 ? 'bg-green-500' : row.completeness > 60 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                       style={{width: `${row.completeness}%`}}
                                    ></div>
                                 </div>
                              </td>
                              <td className="px-4 py-3">
                                 <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold
                                    ${row.status === 'Active' ? 'bg-green-900/20 text-green-400' : 
                                      row.status === 'Pending' ? 'bg-yellow-900/20 text-yellow-400' : 
                                      row.status === 'Draft' ? 'bg-slate-700 text-slate-300' : 'bg-red-900/20 text-red-400'}
                                 `}>
                                    {row.status}
                                 </span>
                              </td>
                              <td className="px-4 py-3 text-slate-500 hover:text-white">
                                 <MoreHorizontal size={16} />
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </SciFiCard>
         </div>

         {/* Right: Detail View (The "Digital File") */}
         <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">
            
            {/* Identity Card */}
            <SciFiCard title="客户数字档案" subtitle="DIGITAL PROFILE" className="border-indigo-500/30 bg-[#080c14]">
               <div className="flex flex-col gap-6">
                  {/* Header Info */}
                  <div className="flex items-start gap-4">
                     <div className="h-16 w-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center text-white shadow-lg shrink-0">
                        {selectedRecord.type === 'Enterprise' ? <Building2 size={32} /> : <User size={32} />}
                     </div>
                     <div>
                        <h2 className="text-xl font-bold text-white leading-tight">{selectedRecord.name}</h2>
                        <div className="text-xs text-slate-400 mt-1 flex gap-2">
                           <span className="bg-slate-800 px-2 py-0.5 rounded">{selectedRecord.industry}</span>
                           <span className="bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1"><Globe size={10}/> {selectedRecord.region}</span>
                        </div>
                     </div>
                  </div>

                  {/* Unified Code Visualizer */}
                  <div>
                     <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-1">
                        <QrCode size={12} /> Unified Social Credit Code Structure
                     </div>
                     <CodingVisualizer code={selectedRecord.id} />
                  </div>

                  {/* Lifecycle Steps */}
                  <div className="bg-slate-900/50 p-4 rounded border border-slate-800">
                     <div className="text-[10px] text-slate-500 uppercase font-bold mb-3">Lifecycle Status</div>
                     <div className="flex items-center justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-700 -z-0"></div>
                        
                        <div className="relative z-10 flex flex-col items-center gap-1">
                           <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-black shadow-[0_0_10px_lime]"><CheckCircle2 size={14}/></div>
                           <span className="text-[9px] text-green-400">Created</span>
                        </div>
                        <div className="relative z-10 flex flex-col items-center gap-1">
                           <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-black shadow-[0_0_10px_lime]"><CheckCircle2 size={14}/></div>
                           <span className="text-[9px] text-green-400">Verified</span>
                        </div>
                        <div className="relative z-10 flex flex-col items-center gap-1">
                           <div className={`w-6 h-6 rounded-full flex items-center justify-center text-black ${selectedRecord.status === 'Active' ? 'bg-green-500' : 'bg-slate-600'}`}>
                              {selectedRecord.status === 'Active' ? <CheckCircle2 size={14}/> : <div className="w-2 h-2 bg-slate-400 rounded-full"></div>}
                           </div>
                           <span className={`text-[9px] ${selectedRecord.status === 'Active' ? 'text-green-400' : 'text-slate-500'}`}>Approved</span>
                        </div>
                        <div className="relative z-10 flex flex-col items-center gap-1">
                           <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-500 flex items-center justify-center">
                              <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                           </div>
                           <span className="text-[9px] text-slate-500">Synced</span>
                        </div>
                     </div>
                  </div>

                  {/* Attributes Grid */}
                  <div className="grid grid-cols-2 gap-3">
                     <div className="p-2 border border-slate-700 rounded bg-slate-900/30">
                        <div className="text-[10px] text-slate-500">Tax ID</div>
                        <div className="text-sm font-mono text-slate-200">91310000X...</div>
                     </div>
                     <div className="p-2 border border-slate-700 rounded bg-slate-900/30">
                        <div className="text-[10px] text-slate-500">Legal Rep</div>
                        <div className="text-sm font-mono text-slate-200">Zhang W.</div>
                     </div>
                     <div className="p-2 border border-slate-700 rounded bg-slate-900/30">
                        <div className="text-[10px] text-slate-500">Capital</div>
                        <div className="text-sm font-mono text-slate-200">¥ 50M</div>
                     </div>
                     <div className="p-2 border border-slate-700 rounded bg-slate-900/30">
                        <div className="text-[10px] text-slate-500">Credit Rating</div>
                        <div className="text-sm font-mono text-green-400 font-bold">AAA</div>
                     </div>
                  </div>
               </div>
            </SciFiCard>

            {/* Governance Actions */}
            <div className="grid grid-cols-2 gap-3">
               <button className="py-3 bg-indigo-900/20 hover:bg-indigo-900/40 border border-indigo-500/30 text-indigo-300 rounded text-xs flex items-center justify-center gap-2 transition-colors">
                  <GitCommit size={14} /> View History
               </button>
               <button className="py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded text-xs flex items-center justify-center gap-2 transition-colors">
                  <CreditCard size={14} /> ERP Sync Status
               </button>
            </div>

         </div>
      </div>

      {/* 3. Bottom: Data Governance & Quality */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-64">
         
         {/* Coding Rules Engine */}
         <SciFiCard title="统一编码规则引擎" subtitle="RULES CONFIG" className="md:col-span-2 border-slate-800">
            <div className="flex gap-6 items-center h-full px-4">
               <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-slate-900/50 border border-slate-700 rounded">
                     <div className="h-8 w-8 rounded bg-cyan-900/50 text-cyan-400 flex items-center justify-center font-bold">1</div>
                     <div className="flex-1">
                        <div className="text-xs text-slate-400">Rule Set: Enterprise (CN)</div>
                        <div className="font-mono text-sm text-cyan-300" data-localization="preserve">Format: [TYPE]-[CTRY]-[IND]-[SEQ]</div>
                     </div>
                     <div className="text-[10px] bg-green-900/20 text-green-400 px-2 py-1 rounded">Active</div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-slate-900/50 border border-slate-700 rounded opacity-60">
                     <div className="h-8 w-8 rounded bg-purple-900/50 text-purple-400 flex items-center justify-center font-bold">2</div>
                     <div className="flex-1">
                        <div className="text-xs text-slate-400">Rule Set: Individual (Global)</div>
                        <div className="font-mono text-sm text-purple-300" data-localization="preserve">Format: IND-[CTRY]-[ID5]-[SEQ]</div>
                     </div>
                     <div className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">Draft</div>
                  </div>
               </div>
               
               <div className="w-px h-32 bg-slate-800"></div>

               <div className="w-1/3 text-center">
                  <div className="text-4xl font-bold text-white mb-1">100%</div>
                  <div className="text-xs text-slate-500 uppercase">Coding Compliance</div>
                  <div className="mt-4 flex flex-col gap-1 text-[10px] text-slate-400">
                     <span className="flex justify-between"><span>Auto-Gen:</span> <span className="text-white">13,800</span></span>
                     <span className="flex justify-between"><span>Manual:</span> <span className="text-white">405</span></span>
                  </div>
               </div>
            </div>
         </SciFiCard>

         {/* Data Quality Chart */}
         <SciFiCard title="数据质量概览" subtitle="DQ DASHBOARD" className="border-slate-800">
            <div className="w-full h-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={QUALITY_STATS} layout="vertical" margin={{top: 10, right: 30, left: 10, bottom: 5}}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                     <XAxis type="number" domain={[0, 100]} hide />
                     <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} tick={{fontSize: 10}} />
                     <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{backgroundColor: '#0f172a', borderColor: '#6366f1', color: '#e2e8f0'}}
                     />
                     <Bar dataKey="value" barSize={12} radius={[0, 4, 4, 0]}>
                        {QUALITY_STATS.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === 0 ? '#0ea5e9' : index === 1 ? '#8b5cf6' : index === 2 ? '#10b981' : '#f59e0b'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </SciFiCard>

      </div>
    </div>
  );
};
