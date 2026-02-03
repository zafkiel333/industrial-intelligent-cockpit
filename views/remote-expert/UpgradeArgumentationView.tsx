
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  GitBranch, Zap, TrendingUp, Layers, 
  ArrowRight, CheckCircle2, AlertTriangle, 
  Scale, Calculator, Microscope, FileText,
  ThumbsUp, XCircle, Share2, History,
  Cpu, Crosshair, ArrowUpRight, Gauge,
  Activity, Sparkles, RefreshCw, Play, Search
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Line, Area, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ReferenceLine, Cell
} from 'recharts';

// --- Types ---

interface UpgradeOption {
  id: string;
  name: string;
  type: 'Retrofit' | 'Replace' | 'Software';
  cost: number;
  downtime: number; // days
  efficiencyGain: number; // %
  lifeExtension: number; // years
  riskScore: number; // 0-100
  techStack: string[];
}

interface PerformanceMetric {
  subject: string;
  Current: number;
  Projected: number;
  fullMark: number;
}

interface ExpertVote {
  expert: string;
  role: string;
  vote: 'Approve' | 'Reject' | 'Hold';
  comment: string;
  avatarColor: string;
}

// --- Mock Data ---

const ASSET_INFO = {
  name: 'GT-2000 燃气轮机组',
  currentAge: 12,
  location: 'Power Plant Zone B',
  status: 'Operational (Efficiency Degraded)',
  baselineEff: 32.5 // %
};

const UPGRADE_OPTIONS: UpgradeOption[] = [
  { 
    id: 'OPT-A', name: '控制系统升级 (Control Retrofit)', type: 'Software', 
    cost: 1200000, downtime: 5, efficiencyGain: 2.5, lifeExtension: 3, riskScore: 20,
    techStack: ['AI Optimization', 'New PLC', 'Edge Gateway']
  },
  { 
    id: 'OPT-B', name: '燃烧室核心部件换型 (Burner Mod)', type: 'Retrofit', 
    cost: 4500000, downtime: 15, efficiencyGain: 5.8, lifeExtension: 8, riskScore: 55,
    techStack: ['DLN Burners', 'Ceramic Tiles', 'Fuel Flex']
  },
  { 
    id: 'OPT-C', name: '整机转子替换 (Rotor Swap)', type: 'Replace', 
    cost: 12000000, downtime: 30, efficiencyGain: 8.5, lifeExtension: 15, riskScore: 40,
    techStack: ['3D Printed Blades', 'Adv. Coating', 'Active Clearance']
  }
];

const ROI_PROJECTION = Array.from({length: 12}, (_, i) => {
  const year = 2024 + i;
  return {
    year: year.toString(),
    baseline: 100 - i * 2, // Degradation
    optA: 100 - i * 2 + 5,
    optB: 100 - i * 1.5 + 15, // Better curve
    optC: 100 - i * 1.0 + 25, // Best curve
    costRecov: i < 3 ? -20 + i*10 : i*15 // Simple ROI curve
  };
});

const PERF_RADAR_DATA: Record<string, PerformanceMetric[]> = {
  'OPT-A': [
    { subject: '热效率', Current: 60, Projected: 65, fullMark: 100 },
    { subject: '可靠性', Current: 70, Projected: 75, fullMark: 100 },
    { subject: '维护性', Current: 50, Projected: 80, fullMark: 100 },
    { subject: '排放', Current: 60, Projected: 65, fullMark: 100 },
    { subject: '灵活性', Current: 40, Projected: 90, fullMark: 100 },
  ],
  'OPT-B': [
    { subject: '热效率', Current: 60, Projected: 85, fullMark: 100 },
    { subject: '可靠性', Current: 70, Projected: 80, fullMark: 100 },
    { subject: '维护性', Current: 50, Projected: 60, fullMark: 100 },
    { subject: '排放', Current: 60, Projected: 95, fullMark: 100 },
    { subject: '灵活性', Current: 40, Projected: 50, fullMark: 100 },
  ],
  'OPT-C': [
    { subject: '热效率', Current: 60, Projected: 95, fullMark: 100 },
    { subject: '可靠性', Current: 70, Projected: 98, fullMark: 100 },
    { subject: '维护性', Current: 50, Projected: 90, fullMark: 100 },
    { subject: '排放', Current: 60, Projected: 90, fullMark: 100 },
    { subject: '灵活性', Current: 40, Projected: 85, fullMark: 100 },
  ]
};

const EXPERT_VOTES: ExpertVote[] = [
  { expert: 'Dr. Wang', role: 'Chief Engineer', vote: 'Approve', comment: 'Option B offers the best balance of cost vs performance.', avatarColor: '#0ea5e9' },
  { expert: 'Sarah Li', role: 'Financial Analyst', vote: 'Hold', comment: 'Need more detail on Option C downtime costs.', avatarColor: '#f59e0b' },
  { expert: 'Mike Chen', role: 'Safety Officer', vote: 'Approve', comment: 'Option B reduces NOx emissions significantly.', avatarColor: '#10b981' },
];

// --- Components ---

const MetricTile = ({ label, val, sub, icon: Icon, active }: any) => (
  <div className={`p-3 rounded border flex items-center justify-between transition-all
    ${active ? 'bg-cyan-900/30 border-cyan-500' : 'bg-slate-900/40 border-slate-700 opacity-60'}
  `}>
    <div>
      <div className="text-[10px] text-slate-400 uppercase font-bold">{label}</div>
      <div className="text-lg font-mono font-bold text-white">{val}</div>
      <div className="text-[9px] text-cyan-400">{sub}</div>
    </div>
    <div className={`p-2 rounded-full ${active ? 'bg-cyan-900/50 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
      <Icon size={16} />
    </div>
  </div>
);

export const UpgradeArgumentationView: React.FC = () => {
  const [selectedOptionId, setSelectedOptionId] = useState('OPT-B');
  const [isSimulating, setIsSimulating] = useState(false);
  
  const activeOption = UPGRADE_OPTIONS.find(o => o.id === selectedOptionId) || UPGRADE_OPTIONS[0];
  const radarData = PERF_RADAR_DATA[selectedOptionId];

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#030407]">
      
      {/* 1. Header: The Argumentation Room */}
      <div className="flex justify-between items-end border-b border-indigo-900/50 pb-3 bg-gradient-to-r from-[#0b0a16] to-transparent px-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <GitBranch size={14} /> Technical Decision Support
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
             关键设备技改 <span className="text-indigo-500">论证平台</span>
             <span className="text-sm font-normal text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{ASSET_INFO.name}</span>
          </h1>
        </div>
        
        <div className="flex gap-4 items-center">
             <div className="text-right hidden md:block">
                <div className="text-[10px] text-slate-500 uppercase">Project Budget Cap</div>
                <div className="text-lg font-mono font-bold text-white">¥ 5,000,000</div>
             </div>
             <div className="h-8 w-px bg-slate-700 hidden md:block"></div>
             <div className="flex items-center gap-2 bg-indigo-900/20 px-3 py-1.5 rounded border border-indigo-500/30 text-indigo-300 text-xs">
                <Activity size={14} className="animate-pulse"/> 
                <span>AI Prediction Active</span>
             </div>
             <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all">
                <FileText size={14} /> 生成论证报告
             </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden px-4 pb-4">
         
         {/* LEFT COLUMN: Option Selection */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Upgrade Pathways</div>
             
             {UPGRADE_OPTIONS.map(opt => (
                 <div 
                   key={opt.id}
                   onClick={() => setSelectedOptionId(opt.id)}
                   className={`relative p-4 rounded-lg border cursor-pointer transition-all duration-300 group overflow-hidden
                      ${selectedOptionId === opt.id 
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-[inset_4px_0_0_#6366f1]' 
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                   `}
                 >
                     {/* Background Tech Pattern */}
                     {selectedOptionId === opt.id && (
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] pointer-events-none"></div>
                     )}

                     <div className="flex justify-between items-start mb-2 relative z-10">
                         <span className={`text-[10px] font-mono px-1.5 rounded border ${selectedOptionId === opt.id ? 'text-indigo-300 border-indigo-500/50' : 'text-slate-500 border-slate-700'}`}>
                             {opt.type}
                         </span>
                         <span className={`text-xs font-bold ${opt.riskScore > 50 ? 'text-orange-400' : 'text-green-400'}`}>
                             Risk: {opt.riskScore}
                         </span>
                     </div>
                     
                     <h3 className={`font-bold text-sm mb-2 ${selectedOptionId === opt.id ? 'text-white' : 'text-slate-300'}`}>
                         {opt.name}
                     </h3>
                     
                     <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-[10px] text-slate-400 relative z-10">
                         <div>Cost: <span className="text-slate-200">¥{(opt.cost/10000).toFixed(0)}w</span></div>
                         <div>Time: <span className="text-slate-200">{opt.downtime} Days</span></div>
                         <div>Eff: <span className="text-green-400">+{opt.efficiencyGain}%</span></div>
                         <div>Life: <span className="text-blue-400">+{opt.lifeExtension} Yrs</span></div>
                     </div>
                 </div>
             ))}

             {/* Tech Stack List */}
             <SciFiCard title="涉及技术栈 (Tech Stack)" className="flex-1 border-slate-800 mt-2">
                 <div className="flex flex-wrap gap-2">
                     {activeOption.techStack.map((tech, i) => (
                         <span key={i} className="text-[10px] px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300 flex items-center gap-1">
                             <Cpu size={10} /> {tech}
                         </span>
                     ))}
                 </div>
                 <div className="mt-4 p-3 bg-indigo-900/10 border border-indigo-500/20 rounded text-[10px] text-indigo-200 leading-relaxed">
                     <span className="font-bold flex items-center gap-1 mb-1"><Sparkles size={10}/> AI Assessment</span>
                     This option provides the highest ROI within the 5-year window, utilizing mature technology with moderate risk.
                 </div>
             </SciFiCard>
         </div>

         {/* CENTER COLUMN: Digital Twin & Simulation */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-hidden">
             
             {/* 1. 3D Visualization */}
             <SciFiCard title="改造方案全息预览 (Holographic Preview)" subtitle="DIGITAL TWIN" className="flex-[3] border-indigo-900/50 bg-[#05060a]" noPadding>
                 <div className="w-full h-full relative">
                     {/* 3D Scene */}
                     <div className="absolute inset-0 z-0">
                         <ThreeScene type="turbine" color={selectedOptionId === 'OPT-A' ? '#0ea5e9' : selectedOptionId === 'OPT-B' ? '#f59e0b' : '#10b981'} />
                     </div>
                     
                     {/* Comparison Toggle Overlay */}
                     <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-700 backdrop-blur-md z-10">
                         <button className="px-4 py-1.5 text-xs text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors">Current State</button>
                         <button className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded shadow-lg transition-colors">Future State</button>
                     </div>

                     {/* Key Parameter Overlay */}
                     <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 pointer-events-none">
                         <div className="bg-black/60 border border-indigo-500/30 p-2 rounded w-32 backdrop-blur">
                             <div className="text-[9px] text-slate-400 uppercase">Projected Output</div>
                             <div className="text-xl font-bold text-indigo-400 font-mono">
                                 {isSimulating ? <span className="animate-pulse">...</span> : `${(350 * (1 + activeOption.efficiencyGain/100)).toFixed(1)} MW`}
                             </div>
                         </div>
                     </div>
                     
                     {/* Simulation Control */}
                     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                         <button 
                           onClick={handleSimulate}
                           className="flex items-center gap-3 px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-full font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95"
                         >
                             {isSimulating ? <RefreshCw className="animate-spin" size={16}/> : <Play size={16} fill="currentColor"/>}
                             RUN SIMULATION
                         </button>
                     </div>
                 </div>
             </SciFiCard>

             {/* 2. Economic Projection */}
             <SciFiCard title="经济效益推演 (Financial Projection)" subtitle="ROI ANALYSIS" className="flex-[2] border-slate-800">
                 <div className="w-full h-full p-2">
                     <ResponsiveContainer width="100%" height="100%">
                         <ComposedChart data={ROI_PROJECTION} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                             <defs>
                                 <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#64748b" stopOpacity={0.1}/>
                                     <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                                 </linearGradient>
                                 <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                 </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                             <XAxis dataKey="year" stroke="#64748b" tick={{fontSize: 10}} />
                             <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 140]} label={{ value: 'Performance Index', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                             <Tooltip contentStyle={{backgroundColor: '#0f0c15', borderColor: '#6366f1', color: '#fff'}} />
                             <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                             
                             <Area type="monotone" dataKey="baseline" name="Baseline (No Action)" stroke="#64748b" strokeDasharray="5 5" fill="url(#colorBase)" />
                             
                             {/* Dynamic Line based on selection */}
                             <Area 
                               type="monotone" 
                               dataKey={selectedOptionId === 'OPT-A' ? 'optA' : selectedOptionId === 'OPT-B' ? 'optB' : 'optC'} 
                               name="Selected Plan" 
                               stroke="#10b981" 
                               strokeWidth={2} 
                               fill="url(#colorNew)" 
                             />
                             
                             <Line type="monotone" dataKey="costRecov" name="Cost Recovery %" stroke="#f59e0b" strokeWidth={2} dot={false} yAxisId={0} />
                         </ComposedChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

         </div>

         {/* RIGHT COLUMN: Performance & Decision */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-1">
             
             {/* Performance Radar */}
             <SciFiCard title="性能提升评估" subtitle="METRICS" className="h-[280px] border-slate-800">
                 <div className="w-full h-full relative">
                     <ResponsiveContainer width="100%" height="100%">
                         <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                             <PolarGrid stroke="#334155" />
                             <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                             <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                             <Radar name="Current" dataKey="Current" stroke="#64748b" strokeWidth={1} fill="transparent" />
                             <Radar name="Projected" dataKey="Projected" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.4} />
                             <Tooltip contentStyle={{backgroundColor: '#0f0c15', borderColor: '#0ea5e9', fontSize: '12px'}} />
                         </RadarChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

             {/* KPIs Grid */}
             <div className="grid grid-cols-2 gap-3">
                 <MetricTile label="ROI (3-Year)" val="245%" sub="Excellent" icon={TrendingUp} active={true} />
                 <MetricTile label="Payback Period" val="1.8 Yrs" sub="Target < 2.0" icon={Calculator} active={false} />
                 <MetricTile label="Availability" val="99.5%" sub="+1.2%" icon={CheckCircle2} active={false} />
                 <MetricTile label="Carbon Footprint" val="-12%" sub="tCO2e" icon={ArrowUpRight} active={false} />
             </div>

             {/* Expert Review */}
             <SciFiCard title="专家评审结论" subtitle="VOTING" className="flex-1 border-indigo-900/30">
                 <div className="flex flex-col h-full gap-3">
                     <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1" style={{maxHeight: '200px'}}>
                         {EXPERT_VOTES.map((vote, i) => (
                             <div key={i} className="bg-slate-900/50 p-2.5 rounded border border-slate-800 flex gap-3">
                                 <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0" style={{backgroundColor: vote.avatarColor}}>
                                     {vote.expert.charAt(0)}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <div className="flex justify-between items-center mb-1">
                                         <span className="text-xs font-bold text-slate-200">{vote.expert}</span>
                                         <span className={`text-[9px] px-1.5 rounded font-bold uppercase
                                             ${vote.vote === 'Approve' ? 'bg-green-900/30 text-green-400' : 
                                               vote.vote === 'Reject' ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'}
                                         `}>{vote.vote}</span>
                                     </div>
                                     <p className="text-[10px] text-slate-400 leading-tight">{vote.comment}</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                     
                     <div className="mt-auto pt-2 border-t border-slate-800">
                         <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors flex items-center justify-center gap-2">
                             <Search size={12} /> View Full Report
                         </button>
                     </div>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
