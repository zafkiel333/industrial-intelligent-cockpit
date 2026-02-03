
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Trophy, MapPin, Calendar, Users, 
  Download, PlayCircle, Star, ArrowRight,
  TrendingUp, BarChart2, Share2, Crown,
  Briefcase, CheckCircle, Navigation, Layers,
  Activity, AlertTriangle, Check
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts';

// --- Types ---

interface BenchmarkCase {
  id: string;
  customerName: string;
  title: string;
  industry: 'Energy' | 'Manufacturing' | 'Port' | 'Mining';
  location: string;
  coordinates: { x: number; y: number }; // For map simulation
  replicabilityScore: number; // 0-100
  impact: {
    efficiency: number; // % increase
    cost: number; // % decrease
    safety: number; // % increase
  };
  solutionStack: string[];
  status: 'Open for Visit' | 'Restricted' | 'Virtual Only';
  coverImageGrad: string; // CSS gradient to simulate image
}

interface VisitLog {
  id: string;
  visitor: string;
  company: string;
  date: string;
  status: 'Upcoming' | 'Completed';
}

// --- Mock Data ---

const BENCHMARKS: BenchmarkCase[] = [
  {
    id: 'CASE-001',
    customerName: 'Shanghai Heavy Industries',
    title: '5G+ Dark Factory Transformation',
    industry: 'Manufacturing',
    location: 'Shanghai, CN',
    coordinates: { x: 75, y: 45 },
    replicabilityScore: 92,
    impact: { efficiency: 35, cost: 20, safety: 100 },
    solutionStack: ['IoT Core', 'Robot Arms', 'Digital Twin'],
    status: 'Open for Visit',
    coverImageGrad: 'from-blue-900 to-slate-900'
  },
  {
    id: 'CASE-002',
    customerName: 'Pacific Power Group',
    title: 'Smart Hydro Plant Digital Brain',
    industry: 'Energy',
    location: 'Yichang, CN',
    coordinates: { x: 50, y: 60 },
    replicabilityScore: 85,
    impact: { efficiency: 15, cost: 12, safety: 40 },
    solutionStack: ['Pred. Maint.', 'Energy Mgmt', 'AI Vision'],
    status: 'Restricted',
    coverImageGrad: 'from-amber-900 to-slate-900'
  },
  {
    id: 'CASE-003',
    customerName: 'Northern Mining Co.',
    title: 'Autonomous Haulage System',
    industry: 'Mining',
    location: 'Inner Mongolia, CN',
    coordinates: { x: 40, y: 30 },
    replicabilityScore: 78,
    impact: { efficiency: 25, cost: 30, safety: 95 },
    solutionStack: ['Fleet Mgmt', '5G Network', 'Safety Barrier'],
    status: 'Open for Visit',
    coverImageGrad: 'from-red-900 to-slate-900'
  },
];

const VISITOR_LOGS: VisitLog[] = [
  { id: 'V-102', visitor: 'Delegation A', company: 'State Grid', date: '2024-03-25', status: 'Upcoming' },
  { id: 'V-101', visitor: 'CTO Team', company: 'Global Motors', date: '2024-03-20', status: 'Completed' },
  { id: 'V-099', visitor: 'Gov Officials', company: 'Ministry of Ind.', date: '2024-03-15', status: 'Completed' },
];

const ROI_DATA = [
  { month: 'Start', cost: 100, output: 50 },
  { month: 'M3', cost: 90, output: 60 },
  { month: 'M6', cost: 85, output: 75 },
  { month: 'M9', cost: 82, output: 85 },
  { month: 'M12', cost: 80, output: 95 },
];

// --- Components ---

const IndustryBadge = ({ industry }: { industry: string }) => {
  const colors = {
    'Energy': 'bg-green-900/30 text-green-400 border-green-700',
    'Manufacturing': 'bg-blue-900/30 text-blue-400 border-blue-700',
    'Port': 'bg-cyan-900/30 text-cyan-400 border-cyan-700',
    'Mining': 'bg-red-900/30 text-red-400 border-red-700',
  }[industry] || 'bg-slate-800 text-slate-400';
  
  return <span className={`text-[10px] px-2 py-0.5 rounded border ${colors}`}>{industry}</span>;
};

const BenchmarkMap = ({ activeCase }: { activeCase: BenchmarkCase }) => (
  <div className="w-full h-full relative bg-[#080b14] overflow-hidden rounded">
    <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)',
        backgroundSize: '40px 40px'
    }}></div>
    
    {/* Stylized Map Outline (Abstract) */}
    <svg className="w-full h-full absolute inset-0 pointer-events-none">
       <path d="M100,100 Q400,50 700,150 T1000,300" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="5 5" />
       
       {/* Active Location Pin */}
       <g transform={`translate(${activeCase.coordinates.x * 8}, ${activeCase.coordinates.y * 3})`}>
          <circle r="20" fill="#f59e0b" fillOpacity="0.2" className="animate-ping" />
          <circle r="6" fill="#f59e0b" />
          <line x1="0" y1="0" x2="40" y2="-40" stroke="#f59e0b" strokeWidth="1" />
          <rect x="40" y="-60" width="120" height="40" fill="rgba(0,0,0,0.8)" stroke="#f59e0b" rx="4" />
          <text x="50" y="-45" fill="white" fontSize="10" fontWeight="bold">SITE: {activeCase.location}</text>
          <text x="50" y="-30" fill="#fbbf24" fontSize="8">ROI: +{activeCase.impact.efficiency}% Eff</text>
       </g>
    </svg>
    
    <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-2 rounded border border-amber-900/50 backdrop-blur">
       <div className="text-[10px] text-amber-500 font-bold uppercase mb-1">Digital Twin Link</div>
       <div className="flex items-center gap-2 text-white text-xs">
          <Activity size={12} className="animate-pulse text-green-500" /> Live Data Connected
       </div>
    </div>
  </div>
);

export const CustomerBenchmarkCasesView: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState(BENCHMARKS[0].id);
  const activeCase = BENCHMARKS.find(b => b.id === selectedCaseId) || BENCHMARKS[0];

  const radarData = [
    { subject: 'Innovation', A: 95, fullMark: 100 },
    { subject: 'ROI Speed', A: 88, fullMark: 100 },
    { subject: 'Scalability', A: activeCase.replicabilityScore, fullMark: 100 },
    { subject: 'Complexity', A: 60, fullMark: 100 }, // Lower is simpler? Let's say higher is more complex tech
    { subject: 'Sustainability', A: 90, fullMark: 100 },
  ];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-amber-600/40 pb-4 bg-gradient-to-r from-[#1f1600] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <Trophy size={14} /> Center of Excellence
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户标杆案例 <span className="text-amber-500">与样板点管理</span>
          </h1>
        </div>
        
        <div className="flex gap-4 items-center mt-4 md:mt-0">
             <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">Total Benchmarks</span>
                <span className="text-xl font-mono font-bold text-white">24</span>
             </div>
             <div className="h-8 w-px bg-slate-700"></div>
             <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">Avg ROI</span>
                <span className="text-xl font-mono font-bold text-green-400">18.5%</span>
             </div>
             <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <Star size={14} /> 提报新案例
             </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Case Library */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           <div className="text-xs font-bold text-slate-500 uppercase px-1 mb-2">Hall of Fame</div>
           <div className="flex flex-col gap-4">
               {BENCHMARKS.map(b => (
                   <div 
                     key={b.id}
                     onClick={() => setSelectedCaseId(b.id)}
                     className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 group border
                        ${selectedCaseId === b.id 
                            ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-[1.02]' 
                            : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'}
                     `}
                   >
                       {/* Background Image Sim */}
                       <div className={`absolute inset-0 bg-gradient-to-br ${b.coverImageGrad} opacity-40 group-hover:opacity-60 transition-opacity`}></div>
                       
                       <div className="relative p-4 z-10">
                           <div className="flex justify-between items-start mb-3">
                               <IndustryBadge industry={b.industry} />
                               {selectedCaseId === b.id && <Crown size={16} className="text-amber-400 fill-amber-400" />}
                           </div>
                           
                           <h3 className="text-lg font-bold text-white mb-1 leading-tight">{b.title}</h3>
                           <div className="text-xs text-slate-300 mb-4">{b.customerName}</div>
                           
                           <div className="flex justify-between items-end border-t border-white/10 pt-3">
                               <div>
                                   <div className="text-[10px] text-slate-400">Replicability</div>
                                   <div className="text-sm font-bold text-amber-300">{b.replicabilityScore}/100</div>
                               </div>
                               <ArrowRight size={16} className={`text-slate-400 ${selectedCaseId === b.id ? 'text-amber-500' : ''}`} />
                           </div>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: The Showcase */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* 1. Map & High Level Stats */}
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[350px]">
               <SciFiCard title="样板点数字孪生定位" subtitle="GLOBAL MAP" className="xl:col-span-2 border-amber-900/50" noPadding>
                   <div className="w-full h-full p-2">
                       <BenchmarkMap activeCase={activeCase} />
                   </div>
               </SciFiCard>

               <div className="flex flex-col gap-4">
                   <SciFiCard title="核心价值 (Key Impact)" subtitle="ROI" className="flex-1 border-slate-800">
                       <div className="flex flex-col justify-center h-full gap-4">
                           <div>
                               <div className="flex justify-between text-xs text-slate-400 mb-1">
                                   <span className="flex items-center gap-1"><TrendingUp size={12}/> Efficiency</span>
                                   <span className="text-green-400 font-bold">+{activeCase.impact.efficiency}%</span>
                               </div>
                               <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                   <div className="h-full bg-green-500" style={{width: `${activeCase.impact.efficiency}%`}}></div>
                               </div>
                           </div>
                           <div>
                               <div className="flex justify-between text-xs text-slate-400 mb-1">
                                   <span className="flex items-center gap-1"><ArrowRight size={12} className="rotate-45"/> Cost Saving</span>
                                   <span className="text-amber-400 font-bold">-{activeCase.impact.cost}%</span>
                               </div>
                               <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                   <div className="h-full bg-amber-500" style={{width: `${activeCase.impact.cost}%`}}></div>
                               </div>
                           </div>
                           <div>
                               <div className="flex justify-between text-xs text-slate-400 mb-1">
                                   <span className="flex items-center gap-1"><CheckCircle size={12}/> Safety</span>
                                   <span className="text-blue-400 font-bold">{activeCase.impact.safety}%</span>
                               </div>
                               <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                   <div className="h-full bg-blue-500" style={{width: `${activeCase.impact.safety}%`}}></div>
                               </div>
                           </div>
                       </div>
                   </SciFiCard>
                   
                   {/* Status Badge Big */}
                   <div className={`p-4 rounded border flex items-center justify-between
                       ${activeCase.status === 'Open for Visit' ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}
                   `}>
                       <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-full ${activeCase.status === 'Open for Visit' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                               {activeCase.status === 'Open for Visit' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                           </div>
                           <div>
                               <div className="text-xs text-slate-400 uppercase">Site Status</div>
                               <div className="text-sm font-bold text-white">{activeCase.status}</div>
                           </div>
                       </div>
                   </div>
               </div>
           </div>

           {/* 2. Deep Dive Analysis */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[300px]">
               
               <SciFiCard title="投入产出曲线 (ROI Trend)" subtitle="Before vs After" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={ROI_DATA}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f59e0b', color: '#fff'}} />
                               <Legend />
                               <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} name="OpEx (Cost)" />
                               <Line type="monotone" dataKey="output" stroke="#10b981" strokeWidth={2} name="Output" />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="解决方案架构 (Stack)" subtitle="TECH" className="border-slate-800">
                   <div className="flex flex-col h-full gap-4">
                       <div className="flex-1 flex flex-col justify-center gap-3 px-4">
                           {activeCase.solutionStack.map((tech, i) => (
                               <div key={i} className="flex items-center gap-4">
                                   <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold">
                                       {i+1}
                                   </div>
                                   <div className="flex-1 p-3 bg-slate-900/50 border border-slate-800 rounded text-sm text-slate-200">
                                       {tech}
                                   </div>
                               </div>
                           ))}
                       </div>
                       
                       <div className="h-32 w-full border-t border-slate-800 pt-2">
                           <ResponsiveContainer width="100%" height="100%">
                               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                   <PolarGrid stroke="#334155" />
                                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                   <Radar name="Score" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.4} />
                                   <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f59e0b'}} />
                               </RadarChart>
                           </ResponsiveContainer>
                       </div>
                   </div>
               </SciFiCard>
           </div>

        </div>

        {/* RIGHT COLUMN: Logistics & Assets */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Visit Management */}
           <SciFiCard title="参观接待管理" subtitle="LOGISTICS" className="border-amber-900/50">
               <div className="flex flex-col gap-4">
                   <div className="space-y-3">
                       {VISITOR_LOGS.map((log, i) => (
                           <div key={i} className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800 hover:border-amber-900/50 transition-colors">
                               <div>
                                   <div className="text-xs font-bold text-white">{log.visitor}</div>
                                   <div className="text-[10px] text-slate-500">{log.company}</div>
                               </div>
                               <div className="text-right">
                                   <div className="text-[10px] text-slate-400">{log.date}</div>
                                   <span className={`text-[9px] px-1.5 rounded ${log.status === 'Upcoming' ? 'bg-amber-900/30 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                                       {log.status}
                                   </span>
                               </div>
                           </div>
                       ))}
                   </div>
                   
                   <button className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors">
                       <Calendar size={14} /> Schedule Visit
                   </button>
               </div>
           </SciFiCard>

           {/* Downloads */}
           <SciFiCard title="案例资料包" subtitle="ASSETS" className="flex-1 border-slate-800">
               <div className="space-y-2">
                   {['Case Study PDF', 'Technical Whitepaper', 'Promo Video (4K)'].map((item, i) => (
                       <div key={i} className="flex justify-between items-center p-3 bg-slate-900/30 border border-slate-800 rounded cursor-pointer hover:bg-slate-800 transition-colors">
                           <div className="flex items-center gap-3">
                               {item.includes('Video') ? <PlayCircle size={16} className="text-red-400"/> : <Briefcase size={16} className="text-blue-400"/>}
                               <span className="text-xs text-slate-300">{item}</span>
                           </div>
                           <Download size={14} className="text-slate-500 hover:text-white" />
                       </div>
                   ))}
               </div>
               
               <div className="mt-auto p-4 bg-slate-900/50 rounded border border-slate-800 text-center">
                   <div className="text-xs text-slate-500 uppercase mb-2">Replicability Index</div>
                   <div className="text-3xl font-bold text-white">{activeCase.replicabilityScore}</div>
                   <div className="text-[10px] text-green-400 mt-1">High Potential</div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
