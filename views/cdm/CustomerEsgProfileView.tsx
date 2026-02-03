
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Leaf, Wind, Factory, Droplets, 
  TrendingDown, Globe, Award, FileCheck, 
  AlertCircle, ArrowRight, Zap, Target,
  Recycle, Sprout, BarChart3, Search, Filter,
  Scale, CloudFog
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell, ReferenceLine, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ComposedChart, Line
} from 'recharts';

// --- Types ---

interface EsgProfile {
  id: string;
  name: string;
  industry: string;
  esgRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'B' | 'CCC';
  esgScore: number; // 0-100
  carbonIntensity: number; // tCO2e / Million Revenue
  netZeroTarget: string; // Year
  emissionStatus: 'On Track' | 'Lagging' | 'Critical';
}

interface EmissionScope {
  scope: string;
  value: number; // tCO2e
  breakdown: { name: string; value: number }[];
}

interface CarbonCredit {
  id: string;
  type: 'Allowance' | 'Offset';
  project: string;
  vintage: string;
  amount: number;
  status: 'Active' | 'Retired';
}

// --- Mock Data ---

const CUSTOMERS: EsgProfile[] = [
  { id: 'C-001', name: 'Shanghai Heavy Ind.', industry: 'Manufacturing', esgRating: 'BBB', esgScore: 65, carbonIntensity: 125.4, netZeroTarget: '2050', emissionStatus: 'Lagging' },
  { id: 'C-002', name: 'Pacific Power Group', industry: 'Energy', esgRating: 'A', esgScore: 82, carbonIntensity: 450.2, netZeroTarget: '2045', emissionStatus: 'On Track' },
  { id: 'C-003', name: 'AutoWorks Global', industry: 'Automotive', esgRating: 'AA', esgScore: 88, carbonIntensity: 45.8, netZeroTarget: '2035', emissionStatus: 'On Track' },
  { id: 'C-004', name: 'Quantum Tech', industry: 'Technology', esgRating: 'AAA', esgScore: 94, carbonIntensity: 12.5, netZeroTarget: '2030', emissionStatus: 'On Track' },
  { id: 'C-005', name: 'North Star Logistics', industry: 'Logistics', esgRating: 'B', esgScore: 55, carbonIntensity: 88.2, netZeroTarget: '2060', emissionStatus: 'Critical' },
];

const SCOPE_DATA: EmissionScope[] = [
  { 
    scope: 'Scope 1 (直接排放)', 
    value: 4500, 
    breakdown: [
      { name: 'Stationary Combustion', value: 2500 },
      { name: 'Mobile Combustion', value: 1200 },
      { name: 'Fugitive Emissions', value: 800 }
    ]
  },
  { 
    scope: 'Scope 2 (能源间接)', 
    value: 3200, 
    breakdown: [
      { name: 'Purchased Electricity', value: 2800 },
      { name: 'Purchased Heat/Steam', value: 400 }
    ]
  },
  { 
    scope: 'Scope 3 (价值链)', 
    value: 8500, 
    breakdown: [
      { name: 'Purchased Goods', value: 4500 },
      { name: 'Logistics', value: 2000 },
      { name: 'Waste', value: 500 },
      { name: 'Use of Products', value: 1500 }
    ]
  }
];

const TRAJECTORY_DATA = [
  { year: '2020', actual: 18000, target: 18000 },
  { year: '2021', actual: 17500, target: 17100 },
  { year: '2022', actual: 16800, target: 16245 },
  { year: '2023', actual: 16200, target: 15432 },
  { year: '2024', actual: 15800, target: 14660 }, // Current
  { year: '2025', actual: null, target: 13900 },
  { year: '2026', actual: null, target: 13000 },
  { year: '2027', actual: null, target: 12100 },
  { year: '2028', actual: null, target: 11200 },
  { year: '2029', actual: null, target: 10300 },
  { year: '2030', actual: null, target: 9000 }, // Milestone
];

const ESG_RADAR = [
  { subject: 'E-Env Mgmt', A: 85, fullMark: 100 },
  { subject: 'E-Carbon', A: 70, fullMark: 100 },
  { subject: 'E-Resources', A: 80, fullMark: 100 },
  { subject: 'S-Labor', A: 90, fullMark: 100 },
  { subject: 'S-Community', A: 75, fullMark: 100 },
  { subject: 'G-Ethics', A: 95, fullMark: 100 },
  { subject: 'G-Board', A: 85, fullMark: 100 },
];

const CREDITS: CarbonCredit[] = [
  { id: 'CC-2023-088', type: 'Allowance', project: 'National ETS Quota', vintage: '2023', amount: 5000, status: 'Active' },
  { id: 'CC-2022-VER', type: 'Offset', project: 'Yunnan Reforestation', vintage: '2022', amount: 1200, status: 'Retired' },
  { id: 'CC-2024-CER', type: 'Offset', project: 'Wind Farm Project 04', vintage: '2024', amount: 3500, status: 'Active' },
];

const COLORS = {
  s1: '#f59e0b', // Scope 1 - Amber (Combustion)
  s2: '#0ea5e9', // Scope 2 - Blue (Electricity)
  s3: '#8b5cf6', // Scope 3 - Purple (Value Chain)
  safe: '#10b981',
  warn: '#f59e0b',
  risk: '#ef4444'
};

// --- Components ---

const RatingBadge = ({ rating }: { rating: string }) => {
  let color = 'bg-slate-800 text-slate-400 border-slate-700';
  if (rating.startsWith('A')) color = 'bg-emerald-900/40 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_#10b981]';
  if (rating.startsWith('B')) color = 'bg-amber-900/40 text-amber-400 border-amber-500/50';
  if (rating.startsWith('C')) color = 'bg-red-900/40 text-red-400 border-red-500/50';

  return (
    <div className={`w-10 h-10 rounded flex items-center justify-center font-bold text-sm border ${color}`}>
      {rating}
    </div>
  );
};

const ScopeBar = ({ data }: { data: EmissionScope[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="flex w-full h-8 rounded-full overflow-hidden border border-slate-800 bg-slate-900 mt-4 relative group">
       {/* Scope 1 */}
       <div 
         className="h-full bg-gradient-to-r from-amber-700 to-amber-500 flex items-center justify-center text-[10px] font-bold text-black transition-all hover:brightness-110 cursor-help"
         style={{width: `${(data[0].value / total) * 100}%`}}
         title={`Scope 1: ${data[0].value} tCO2e`}
       >
         S1
       </div>
       {/* Scope 2 */}
       <div 
         className="h-full bg-gradient-to-r from-cyan-700 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-black transition-all hover:brightness-110 cursor-help"
         style={{width: `${(data[1].value / total) * 100}%`}}
         title={`Scope 2: ${data[1].value} tCO2e`}
       >
         S2
       </div>
       {/* Scope 3 */}
       <div 
         className="h-full bg-gradient-to-r from-violet-700 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white transition-all hover:brightness-110 cursor-help"
         style={{width: `${(data[2].value / total) * 100}%`}}
         title={`Scope 3: ${data[2].value} tCO2e`}
       >
         S3
       </div>
    </div>
  );
};

export const CustomerEsgProfileView: React.FC = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('C-001');
  const [searchTerm, setSearchTerm] = useState('');

  const activeProfile = CUSTOMERS.find(c => c.id === selectedCustomerId) || CUSTOMERS[0];
  const totalEmissions = SCOPE_DATA.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-emerald-900/50 pb-4 bg-gradient-to-r from-[#022c22] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-wider">
             <Sprout size={14} /> Sustainability & Decarbonization
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户 ESG 指标 <span className="text-emerald-500">与碳排放档案</span>
          </h1>
        </div>
        
        <div className="flex gap-4 items-center mt-4 md:mt-0">
             <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end min-w-[120px]">
                <span className="text-[10px] text-slate-500 uppercase">Portfolio Avg Score</span>
                <span className="text-xl font-mono font-bold text-emerald-400">76.8</span>
             </div>
             <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end min-w-[120px]">
                <span className="text-[10px] text-slate-500 uppercase">Total Emissions</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-xl font-mono font-bold text-white">4.2M</span>
                    <span className="text-[9px] text-slate-400">tCO2e</span>
                </div>
             </div>
             <button className="h-full px-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-colors flex items-center gap-2">
                <FileCheck size={16} /> 生成 ESG 报告
             </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Customer Selector */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search company..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
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
                     onClick={() => setSelectedCustomerId(cust.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedCustomerId === cust.id 
                            ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[inset_4px_0_0_#10b981]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <div>
                               <h3 className={`font-bold text-sm line-clamp-1 ${selectedCustomerId === cust.id ? 'text-white' : 'text-slate-300'}`}>
                                   {cust.name}
                               </h3>
                               <div className="text-[10px] text-slate-500">{cust.industry}</div>
                           </div>
                           <RatingBadge rating={cust.esgRating} />
                       </div>

                       <div className="grid grid-cols-2 gap-2 mt-2">
                           <div className="bg-slate-950/30 p-1.5 rounded border border-slate-800/50">
                               <div className="text-[9px] text-slate-500">Carbon Intensity</div>
                               <div className="text-xs font-mono text-white">{cust.carbonIntensity} <span className="text-[8px] text-slate-600">t/$M</span></div>
                           </div>
                           <div className="bg-slate-950/30 p-1.5 rounded border border-slate-800/50">
                               <div className="text-[9px] text-slate-500">Status</div>
                               <div className={`text-xs font-bold ${cust.emissionStatus === 'Critical' ? 'text-red-400' : 'text-emerald-400'}`}>
                                   {cust.emissionStatus}
                               </div>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: Carbon & ESG Analysis */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Top: Carbon Footprint Breakdown */}
           <SciFiCard title="碳排放全景 (Carbon Footprint)" subtitle={`${totalEmissions.toLocaleString()} tCO2e`} className="border-emerald-900/50 bg-[#020604]">
               <div className="flex flex-col gap-6">
                   
                   {/* Scope Visualizer */}
                   <div>
                       <div className="flex justify-between items-end mb-2">
                           <div className="text-xs text-slate-400">Emission Scopes Breakdown</div>
                           <div className="flex gap-4 text-[10px]">
                               <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Scope 1 (28%)</span>
                               <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Scope 2 (20%)</span>
                               <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-violet-500"></div> Scope 3 (52%)</span>
                           </div>
                       </div>
                       <ScopeBar data={SCOPE_DATA} />
                   </div>

                   {/* Detailed Stats */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {SCOPE_DATA.map((scope, i) => (
                           <div key={i} className="bg-slate-900/40 border border-slate-800 p-3 rounded">
                               <div className="flex justify-between items-center mb-2">
                                   <span className={`text-xs font-bold ${i===0?'text-amber-400':i===1?'text-cyan-400':'text-violet-400'}`}>
                                       {scope.scope.split(' ')[0]} {scope.scope.split(' ')[1]}
                                   </span>
                                   <span className="text-xs font-mono text-white">{scope.value}t</span>
                               </div>
                               <div className="space-y-1">
                                   {scope.breakdown.map((item, idx) => (
                                       <div key={idx} className="flex justify-between text-[10px] text-slate-400 border-b border-slate-800/50 last:border-0 pb-0.5">
                                           <span>{item.name}</span>
                                           <span>{item.value}</span>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           </SciFiCard>

           {/* Middle: Trajectory & ESG Radar */}
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[320px]">
               
               {/* Net Zero Trajectory */}
               <SciFiCard title="净零排放路径 (Pathway to Net Zero)" subtitle={`TARGET: ${activeProfile.netZeroTarget}`} className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <ComposedChart data={TRAJECTORY_DATA} margin={{top:10, right:10, left:0, bottom:0}}>
                               <defs>
                                   <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="year" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#020604', borderColor: '#10b981', color: '#fff'}} />
                               <Legend />
                               <Area type="monotone" dataKey="actual" name="Historical Emission" stroke="#10b981" fill="url(#colorActual)" strokeWidth={2} />
                               <Line type="monotone" dataKey="target" name="Net Zero Path" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                           </ComposedChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               {/* ESG Radar */}
               <SciFiCard title="ESG 综合绩效" subtitle="SCORECARD" className="border-slate-800">
                   <div className="w-full h-full flex flex-col">
                       <div className="flex-1">
                           <ResponsiveContainer width="100%" height="100%">
                               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={ESG_RADAR}>
                                   <PolarGrid stroke="#334155" />
                                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                   <Radar name="Score" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                                   <Tooltip contentStyle={{backgroundColor: '#020604', borderColor: '#0ea5e9', color: '#fff'}} />
                               </RadarChart>
                           </ResponsiveContainer>
                       </div>
                       <div className="flex justify-center gap-4 text-[10px] text-slate-400 pb-2">
                           <div className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Environment</div>
                           <div className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Social</div>
                           <div className="flex items-center gap-1"><span className="w-2 h-2 bg-purple-500 rounded-full"></span> Governance</div>
                       </div>
                   </div>
               </SciFiCard>
           </div>
        </div>

        {/* RIGHT COLUMN: Green Finance & Compliance */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Carbon Asset Wallet */}
           <SciFiCard title="碳资产钱包 (Carbon Assets)" subtitle="WALLET" className="border-emerald-900/30">
               <div className="bg-slate-900/50 p-4 rounded border border-slate-700 mb-4 flex flex-col items-center">
                   <div className="text-xs text-slate-400 uppercase mb-1">Total Available Credits</div>
                   <div className="text-3xl font-mono font-bold text-white flex items-center gap-2">
                       <Leaf className="text-emerald-500" size={24} /> 8,500 <span className="text-sm font-normal text-slate-500">t</span>
                   </div>
               </div>

               <div className="space-y-3">
                   {CREDITS.map(credit => (
                       <div key={credit.id} className={`p-3 rounded border flex flex-col gap-2 relative overflow-hidden transition-all hover:scale-105 cursor-pointer
                           ${credit.status === 'Active' ? 'bg-[#061810] border-emerald-800' : 'bg-slate-900 border-slate-800 opacity-60'}
                       `}>
                           <div className="flex justify-between items-start">
                               <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase border ${credit.status === 'Active' ? 'text-green-400 border-green-800 bg-green-900/20' : 'text-slate-400 border-slate-700'}`}>
                                   {credit.type}
                               </span>
                               <span className="text-xs font-bold text-white">{credit.amount.toLocaleString()} t</span>
                           </div>
                           <div className="text-xs text-slate-300 font-bold truncate">{credit.project}</div>
                           <div className="flex justify-between text-[10px] text-slate-500">
                               <span>Vintage: {credit.vintage}</span>
                               <span className="font-mono">{credit.id}</span>
                           </div>
                       </div>
                   ))}
               </div>
               
               <button className="w-full mt-4 py-2 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-600/50 text-emerald-400 text-xs rounded transition-colors flex items-center justify-center gap-2">
                   <Scale size={14} /> Trade on Exchange
               </button>
           </SciFiCard>

           {/* Certificates & Compliance */}
           <SciFiCard title="合规与认证" subtitle="CERTS" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar" style={{maxHeight: '200px'}}>
                   {[
                       { name: 'ISO 14064-1', type: 'GHG Verification', status: 'Valid', date: '2024-12' },
                       { name: 'Green Factory L3', type: 'Certification', status: 'Valid', date: '2025-06' },
                       { name: 'CBAM Declaration', type: 'EU Export', status: 'Pending', date: '2024-04' },
                   ].map((cert, i) => (
                       <div key={i} className="flex items-center justify-between p-2 border-b border-slate-800 hover:bg-slate-800/50 rounded transition-colors">
                           <div className="flex items-center gap-3">
                               <Award size={16} className={cert.status === 'Valid' ? 'text-yellow-500' : 'text-slate-500'} />
                               <div>
                                   <div className="text-xs font-bold text-slate-200">{cert.name}</div>
                                   <div className="text-[10px] text-slate-500">{cert.type}</div>
                               </div>
                           </div>
                           <div className="text-right">
                               <div className={`text-[10px] font-bold ${cert.status === 'Valid' ? 'text-green-400' : 'text-orange-400'}`}>{cert.status}</div>
                               <div className="text-[9px] text-slate-600">Exp: {cert.date}</div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* AI Recommendation */}
           <div className="p-3 bg-emerald-900/10 border border-emerald-500/20 rounded flex items-start gap-3">
               <div className="p-1.5 bg-emerald-500/20 rounded-full text-emerald-400 animate-pulse">
                   <CloudFog size={16} />
               </div>
               <div>
                   <div className="text-xs font-bold text-emerald-200 mb-1">Optimization Tip</div>
                   <p className="text-[10px] text-slate-400 leading-tight">
                       Switching logistics partner for Route A could reduce Scope 3 emissions by <span className="text-white font-bold">4.2%</span>.
                   </p>
               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
