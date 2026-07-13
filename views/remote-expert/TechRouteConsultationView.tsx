
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[res-tech-route]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/res-tech-route';
import { 
  GitPullRequest, TrendingUp, AlertTriangle, 
  CheckCircle2, XCircle, MessageSquare, 
  Scale, Zap, Clock, ShieldCheck, 
  ArrowRight, Target, Box, Database,
  Vote, ThumbsUp, ThumbsDown, HelpCircle,
  FileSignature, Filter, Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend,
  ComposedChart, Line, Area, CartesianGrid, ReferenceLine
} from 'recharts';

// --- Types ---

interface TechRoute {
  id: string;
  name: string;
  tagline: string;
  type: 'Conservative' | 'Balanced' | 'Aggressive';
  maturity: number; // 0-100 (TRL)
  risk: number; // 0-100
  cost: number; // Normalized 0-100
  roi: number; // Months
  color: string;
}

interface CapabilityMetric {
  subject: string;
  Score: number;
  Benchmark: number;
  fullMark: number;
}

interface ExpertOpinion {
  id: string;
  expertName: string;
  role: string;
  avatarColor: string;
  stance: 'Support' | 'Oppose' | 'Neutral';
  comment: string;
}

// --- Mock Data ---

const ROUTES: TechRoute[] = [
  { 
    id: 'R1', name: '方案 A: 传统升级 (Retrofit)', tagline: '低风险，快速落地，技术成熟', 
    type: 'Conservative', maturity: 95, risk: 20, cost: 40, roi: 18, color: '#10b981' 
  },
  { 
    id: 'R2', name: '方案 B: 混合架构 (Hybrid)', tagline: '平衡成本与性能，平滑过渡', 
    type: 'Balanced', maturity: 75, risk: 45, cost: 65, roi: 24, color: '#f59e0b' 
  },
  { 
    id: 'R3', name: '方案 C: 全数字孪生 (Digital Twin)', tagline: '颠覆性创新，高投入高回报', 
    type: 'Aggressive', maturity: 40, risk: 85, cost: 95, roi: 36, color: '#ef4444' 
  },
];

const CAPABILITY_DATA: Record<string, CapabilityMetric[]> = {
  'R1': [
    { subject: '技术成熟度', Score: 95, Benchmark: 80, fullMark: 100 },
    { subject: '实施周期', Score: 90, Benchmark: 70, fullMark: 100 },
    { subject: '维护便利性', Score: 60, Benchmark: 60, fullMark: 100 },
    { subject: '性能提升', Score: 40, Benchmark: 50, fullMark: 100 },
    { subject: '扩展性', Score: 30, Benchmark: 50, fullMark: 100 },
    { subject: '合规性', Score: 100, Benchmark: 90, fullMark: 100 },
  ],
  'R2': [
    { subject: '技术成熟度', Score: 75, Benchmark: 80, fullMark: 100 },
    { subject: '实施周期', Score: 70, Benchmark: 70, fullMark: 100 },
    { subject: '维护便利性', Score: 75, Benchmark: 60, fullMark: 100 },
    { subject: '性能提升', Score: 70, Benchmark: 50, fullMark: 100 },
    { subject: '扩展性', Score: 80, Benchmark: 50, fullMark: 100 },
    { subject: '合规性', Score: 85, Benchmark: 90, fullMark: 100 },
  ],
  'R3': [
    { subject: '技术成熟度', Score: 40, Benchmark: 80, fullMark: 100 },
    { subject: '实施周期', Score: 30, Benchmark: 70, fullMark: 100 },
    { subject: '维护便利性', Score: 50, Benchmark: 60, fullMark: 100 },
    { subject: '性能提升', Score: 98, Benchmark: 50, fullMark: 100 },
    { subject: '扩展性', Score: 95, Benchmark: 50, fullMark: 100 },
    { subject: '合规性', Score: 60, Benchmark: 90, fullMark: 100 },
  ],
};

const FINANCIAL_PROJECTION = [
  { year: 'Y1', capex: 80, opex: 20, benefit: 10 },
  { year: 'Y2', capex: 10, opex: 25, benefit: 40 },
  { year: 'Y3', capex: 5, opex: 25, benefit: 70 },
  { year: 'Y4', capex: 5, opex: 30, benefit: 90 },
  { year: 'Y5', capex: 0, opex: 35, benefit: 110 },
];

const EXPERT_OPINIONS: Record<string, ExpertOpinion[]> = {
  'R1': [
    { id: 'E1', expertName: 'Dr. Zhang', role: 'Chief Architect', avatarColor: '#0ea5e9', stance: 'Neutral', comment: '稳妥的选择，但长期来看可能会成为技术债务。' },
    { id: 'E2', expertName: 'Mike Chen', role: 'Finance Lead', avatarColor: '#f59e0b', stance: 'Support', comment: '符合今年的预算削减计划，ROI 周期最短。' },
  ],
  'R2': [
    { id: 'E1', expertName: 'Dr. Zhang', role: 'Chief Architect', avatarColor: '#0ea5e9', stance: 'Support', comment: '这是当前最平衡的方案，既利用了现有资产，又引入了智能控制。' },
    { id: 'E3', expertName: 'Sarah Li', role: 'Ops Director', avatarColor: '#10b981', stance: 'Support', comment: '运维团队只需少量培训即可上手，过渡平滑。' },
  ],
  'R3': [
    { id: 'E1', expertName: 'Dr. Zhang', role: 'Chief Architect', avatarColor: '#0ea5e9', stance: 'Support', comment: '虽然风险高，但这能让我们在未来5年保持行业领先。' },
    { id: 'E2', expertName: 'Mike Chen', role: 'Finance Lead', avatarColor: '#f59e0b', stance: 'Oppose', comment: '初始投入过大，且目前技术标准的变数太多，建议观望。' },
    { id: 'E3', expertName: 'Sarah Li', role: 'Ops Director', avatarColor: '#10b981', stance: 'Neutral', comment: '技术很诱人，但我们的基础设施可能还不支持。' },
  ],
};

// --- Components ---

const RouteCard = ({ route, active, onClick }: { route: TechRoute, active: boolean, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 relative group overflow-hidden
       ${active 
         ? 'bg-slate-900/80 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
         : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'}
    `}
  >
    {active && <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: route.color }}></div>}
    
    <div className="flex justify-between items-start mb-2 pl-2">
       <div>
          <div className={`text-xs font-bold uppercase mb-1 ${active ? 'text-white' : 'text-slate-400'}`}>{route.type} Strategy</div>
          <div className="text-sm font-bold text-slate-200 group-hover:text-white leading-tight">{route.name}</div>
       </div>
       <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-colors
          ${active ? 'border-current text-current' : 'border-slate-600 text-slate-600'}
       `} style={{ color: active ? route.color : undefined }}>
          {route.id}
       </div>
    </div>
    
    <div className="pl-2 text-[10px] text-slate-500 mb-3 line-clamp-2">
       {route.tagline}
    </div>

    <div className="pl-2 grid grid-cols-3 gap-2 text-[9px] uppercase text-slate-400">
       <div>
          <span className="block text-slate-600">Cost</span>
          <span className="font-mono text-white">{route.cost}/100</span>
       </div>
       <div>
          <span className="block text-slate-600">Risk</span>
          <span className="font-mono" style={{color: route.risk > 70 ? '#ef4444' : route.risk > 40 ? '#f59e0b' : '#10b981'}}>{route.risk}%</span>
       </div>
       <div>
          <span className="block text-slate-600">Maturity</span>
          <span className="font-mono text-white">TRL-{Math.floor(route.maturity/10)}</span>
       </div>
    </div>
  </div>
);

export const TechRouteConsultationView: React.FC = () => {
  const [selectedRouteId, setSelectedRouteId] = useState(ROUTES[1].id);
  const activeRoute = ROUTES.find(r => r.id === selectedRouteId) || ROUTES[1];
  const activeOpinions = EXPERT_OPINIONS[selectedRouteId];
  const activeRadar = CAPABILITY_DATA[selectedRouteId];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200 bg-[#04060b]">
      
      {/* 1. Header */}
      <div className="flex justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#0d1526] to-transparent px-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <GitPullRequest size={14} className="animate-pulse" /> Strategic Decision Support
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             远程技术路线 <span className="text-cyan-500">比选咨询中心</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
             <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">Consultation ID</span>
                <span className="text-xl font-mono font-bold text-white">#TC-2024-X92</span>
             </div>
             <div className="h-8 w-px bg-slate-700"></div>
             <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Decision Deadline</span>
                 <span className="text-xl font-mono font-bold text-red-400">3 Days</span>
             </div>
             <button className="ml-2 flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
                <FileSignature size={16} /> 生成决议书
             </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden px-4 pb-4">
         
         {/* LEFT: Route Selector */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
             <div className="flex justify-between items-center text-xs text-slate-400 px-1 mb-2">
                 <span className="uppercase font-bold">Candidate Routes</span>
                 <Filter size={14} className="cursor-pointer hover:text-white" />
             </div>
             
             <div className="flex flex-col gap-4">
                 {ROUTES.map(route => (
                     <RouteCard 
                       key={route.id} 
                       route={route} 
                       active={selectedRouteId === route.id} 
                       onClick={() => setSelectedRouteId(route.id)} 
                     />
                 ))}
             </div>

             <div className="mt-auto p-4 rounded border border-slate-700 bg-slate-900/30">
                 <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold mb-2">
                     <AlertTriangle size={14} /> System Alert
                 </div>
                 <p className="text-[10px] text-slate-400 leading-relaxed">
                     Route C requires infrastructure upgrade (5G Network) not currently available in Zone B. This may increase lead time by 3 months.
                 </p>
             </div>
         </div>

         {/* CENTER: Simulation Sandbox */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
             
             {/* 3D Visualizer */}
             <SciFiCard title="技术方案仿真 (Simulation)" subtitle="DIGITAL TWIN" className="flex-[3] border-cyan-900/50 bg-[#020408]" noPadding>
                 <div className="w-full h-full relative">
                     {/* Overlay Grid */}
                     <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                         backgroundImage: `linear-gradient(${activeRoute.color} 1px, transparent 1px), linear-gradient(90deg, ${activeRoute.color} 1px, transparent 1px)`,
                         backgroundSize: '40px 40px'
                     }}></div>

                     {/* 3D Model */}
                     <div className="absolute inset-0 z-0">
                         <ThreeScene type="turbine" color={activeRoute.color} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                     </div>

                     {/* HUD Overlay */}
                     <div className="absolute top-4 left-4 z-10 pointer-events-none">
                         <div className="bg-black/60 backdrop-blur border px-3 py-1.5 rounded text-xs text-white flex items-center gap-2" style={{borderColor: activeRoute.color}}>
                             <Activity size={14} style={{color: activeRoute.color}} className="animate-pulse"/> 
                             Projected Performance: <span className="font-bold">{(100 - activeRoute.risk/2).toFixed(1)}%</span>
                         </div>
                     </div>
                     
                     {/* Floating Specs */}
                     <div className="absolute top-20 right-10 flex flex-col gap-2 items-end z-10 pointer-events-none">
                         <div className="text-[10px] text-slate-400 bg-black/50 px-2 py-1 rounded border border-slate-700">
                             Power Output: <span className="text-white font-mono">12.5 MW</span>
                         </div>
                         <div className="text-[10px] text-slate-400 bg-black/50 px-2 py-1 rounded border border-slate-700">
                             Efficiency: <span className="text-white font-mono">94.2%</span>
                         </div>
                         <div className="text-[10px] text-slate-400 bg-black/50 px-2 py-1 rounded border border-slate-700">
                             Footprint: <span className="text-white font-mono">240 m²</span>
                         </div>
                     </div>
                 </div>
             </SciFiCard>

             {/* Financial Projection */}
             <SciFiCard title="全生命周期成本 (TCO Projection)" subtitle="5-YEAR FORECAST" className="flex-[2] border-slate-800">
                 <div className="w-full h-full p-2">
                     <ResponsiveContainer width="100%" height="100%">
                         <ComposedChart data={FINANCIAL_PROJECTION} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                             <defs>
                                 <linearGradient id="colorBenefit" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor={activeRoute.color} stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor={activeRoute.color} stopOpacity={0}/>
                                 </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                             <XAxis dataKey="year" stroke="#64748b" tick={{fontSize: 10}} />
                             <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Amount (¥)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                             <Tooltip contentStyle={{backgroundColor: '#0f0c15', borderColor: activeRoute.color, color: '#fff'}} />
                             <Legend wrapperStyle={{fontSize: '10px'}} verticalAlign="top"/>
                             
                             <Bar dataKey="capex" name="CAPEX (投入)" stackId="a" fill="#64748b" barSize={20} />
                             <Bar dataKey="opex" name="OPEX (运维)" stackId="a" fill="#475569" barSize={20} />
                             <Area type="monotone" dataKey="benefit" name="Benefit (收益)" stroke={activeRoute.color} fill="url(#colorBenefit)" strokeWidth={2} />
                         </ComposedChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

         </div>

         {/* RIGHT: Expert Council (3 Cols) */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">
             
             {/* Radar Analysis */}
             <SciFiCard title="多维能力评估" subtitle="BENCHMARKING" className="h-[280px] border-slate-800">
                 <div className="w-full h-full">
                     <ResponsiveContainer width="100%" height="100%">
                         <RadarChart cx="50%" cy="50%" outerRadius="65%" data={activeRadar}>
                             <PolarGrid stroke="#334155" />
                             <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                             <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                             <Radar name="Current Route" dataKey="Score" stroke={activeRoute.color} strokeWidth={2} fill={activeRoute.color} fillOpacity={0.4} />
                             <Radar name="Industry Avg" dataKey="Benchmark" stroke="#64748b" strokeWidth={1} fill="transparent" strokeDasharray="4 4" />
                             <Tooltip contentStyle={{backgroundColor: '#0f0a0a', borderColor: '#333'}} />
                             <Legend wrapperStyle={{fontSize: '10px'}}/>
                         </RadarChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

             {/* Expert Opinions */}
             <SciFiCard title="专家评审团 (Expert Council)" subtitle="OPINIONS" className="flex-1 border-slate-800">
                 <div className="flex flex-col gap-3 h-full">
                     {activeOpinions.map(op => (
                         <div key={op.id} className="bg-slate-900/40 p-3 rounded border border-slate-800 relative group">
                             {/* Stance Indicator */}
                             <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l 
                                 ${op.stance === 'Support' ? 'bg-green-500' : op.stance === 'Oppose' ? 'bg-red-500' : 'bg-slate-500'}
                             `}></div>
                             
                             <div className="flex justify-between items-start mb-1 pl-2">
                                 <div className="flex items-center gap-2">
                                     <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style={{backgroundColor: op.avatarColor}}>
                                         {op.expertName.charAt(0)}
                                     </div>
                                     <div>
                                         <div className="text-xs font-bold text-slate-200">{op.expertName}</div>
                                         <div className="text-[9px] text-slate-500">{op.role}</div>
                                     </div>
                                 </div>
                                 <div className="flex gap-1">
                                     {op.stance === 'Support' && <ThumbsUp size={12} className="text-green-500"/>}
                                     {op.stance === 'Oppose' && <ThumbsDown size={12} className="text-red-500"/>}
                                     {op.stance === 'Neutral' && <HelpCircle size={12} className="text-slate-500"/>}
                                 </div>
                             </div>
                             
                             <div className="pl-2 mt-2 text-[10px] text-slate-300 leading-relaxed bg-black/20 p-1.5 rounded">
                                 "{op.comment}"
                             </div>
                         </div>
                     ))}

                     <button className="mt-auto w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors flex items-center justify-center gap-2">
                         <MessageSquare size={12} /> Add Comment
                     </button>
                 </div>
             </SciFiCard>

             {/* Final Recommendation */}
             <div className="p-3 bg-slate-900/60 border border-indigo-500/30 rounded flex items-center justify-between">
                 <div>
                     <div className="text-[10px] text-indigo-400 font-bold uppercase mb-1">System Recommendation</div>
                     <div className="text-xs text-white">Route B: Hybrid</div>
                 </div>
                 <div className="text-xl font-bold text-green-400">92%</div>
             </div>

         </div>

      </div>
    </div>
  );
};
