
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  BookOpen, Share2, Search, Filter, 
  BrainCircuit, GitBranch, Lightbulb, 
  CheckCircle2, ThumbsUp, MessageSquare,
  Award, TrendingUp, Hash, ArrowUpRight,
  Database, Zap, FileText, Bookmark,
  Star, User
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from 'recharts';

// --- Types ---

interface KnowledgeNode {
  id: string;
  x: number;
  y: number;
  r: number;
  label: string;
  type: 'Root' | 'Category' | 'Leaf';
  connections: string[];
}

interface CaseStudy {
  id: string;
  title: string;
  author: string;
  role: string;
  date: string;
  tags: string[];
  summary: string;
  impact: string; // e.g. "Saved $50k"
  likes: number;
  views: number;
  verified: boolean;
}

interface Contributor {
  rank: number;
  name: string;
  points: number;
  badges: string[];
  avatarColor: string;
}

// --- Mock Data ---

const KNOWLEDGE_NODES: KnowledgeNode[] = [
  { id: 'root', x: 50, y: 50, r: 25, label: 'Industrial Brain', type: 'Root', connections: ['cat1', 'cat2', 'cat3', 'cat4'] },
  { id: 'cat1', x: 20, y: 30, r: 15, label: 'Rotating Mach.', type: 'Category', connections: ['l1', 'l2'] },
  { id: 'cat2', x: 80, y: 30, r: 15, label: 'Control Sys', type: 'Category', connections: ['l3', 'l4'] },
  { id: 'cat3', x: 20, y: 70, r: 15, label: 'Hydraulics', type: 'Category', connections: ['l5'] },
  { id: 'cat4', x: 80, y: 70, r: 15, label: 'Process', type: 'Category', connections: ['l6'] },
  { id: 'l1', x: 10, y: 20, r: 8, label: 'Vibration', type: 'Leaf', connections: [] },
  { id: 'l2', x: 30, y: 15, r: 8, label: 'Bearings', type: 'Leaf', connections: [] },
  { id: 'l3', x: 70, y: 15, r: 8, label: 'PLC Logic', type: 'Leaf', connections: [] },
  { id: 'l4', x: 90, y: 20, r: 8, label: 'Network', type: 'Leaf', connections: [] },
  { id: 'l5', x: 10, y: 80, r: 8, label: 'Pressure', type: 'Leaf', connections: [] },
  { id: 'l6', x: 90, y: 80, r: 8, label: 'Flow', type: 'Leaf', connections: [] },
];

const GOLDEN_CASES: CaseStudy[] = [
  {
    id: 'CS-2024-042',
    title: '燃气轮机叶片裂纹的早期声学诊断特征识别',
    author: 'Dr. Zhang',
    role: 'Chief Specialist',
    date: '2024-03-20',
    tags: ['Acoustic', 'Gas Turbine', 'Predictive'],
    summary: '通过高频声发射传感器捕捉到了叶片微裂纹产生的特征波形（25-40kHz频段），比传统振动监测提前48小时预警。',
    impact: 'Avoided catastrophic failure (~¥20M)',
    likes: 156,
    views: 1205,
    verified: true
  },
  {
    id: 'CS-2024-038',
    title: '大型球磨机主轴承润滑失效的根因分析',
    author: 'Mike Chen',
    role: 'Senior Engineer',
    date: '2024-03-15',
    tags: ['Lubrication', 'Ball Mill', 'Maintenance'],
    summary: '油液光谱分析显示铜元素异常升高。经远程内窥镜检查，发现供油泵出口单向阀卡滞，导致间歇性断油。',
    impact: 'Reduced downtime by 12h',
    likes: 89,
    views: 840,
    verified: true
  },
  {
    id: 'CS-2024-022',
    title: 'PLC 远程 IO 模块抗干扰改造方案',
    author: 'Sarah Li',
    role: 'Automation Lead',
    date: '2024-03-05',
    tags: ['EMI', 'PLC', 'Retrofit'],
    summary: '针对变频器谐波干扰导致IO模块误动作的问题，提出了加装有源滤波器及重新布线的标准化方案。',
    impact: 'Communication stability 95% -> 99.9%',
    likes: 210,
    views: 3500,
    verified: true
  }
];

const TOP_CONTRIBUTORS: Contributor[] = [
  { rank: 1, name: 'Dr. Zhang', points: 12500, badges: ['Master', 'Pioneer'], avatarColor: '#f59e0b' },
  { rank: 2, name: 'Sarah Li', points: 9800, badges: ['Expert', 'Writer'], avatarColor: '#8b5cf6' },
  { rank: 3, name: 'Mike Chen', points: 8200, badges: ['Solver'], avatarColor: '#0ea5e9' },
  { rank: 4, name: 'Wang Engineer', points: 6500, badges: ['Active'], avatarColor: '#10b981' },
];

const TREND_DATA = Array.from({length: 12}, (_, i) => ({
  month: `M${i+1}`,
  cases: Math.floor(Math.random() * 50) + 20,
  reuse: Math.floor(Math.random() * 200) + 100
}));

const TOPIC_DIST = [
  { name: 'Mechanical', value: 45, fill: '#f59e0b' },
  { name: 'Electrical', value: 30, fill: '#8b5cf6' },
  { name: 'Control', value: 15, fill: '#0ea5e9' },
  { name: 'Process', value: 10, fill: '#10b981' },
];

// --- Sub-Components ---

const KnowledgeNetwork = () => (
  <div className="w-full h-full relative bg-[#090b15] rounded overflow-hidden select-none border border-slate-800">
     <div className="absolute inset-0 opacity-20" style={{
         backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)',
         backgroundSize: '30px 30px'
     }}></div>
     
     <svg className="w-full h-full absolute inset-0">
        {/* Connections */}
        {KNOWLEDGE_NODES.map(node => 
           node.connections.map(targetId => {
              const target = KNOWLEDGE_NODES.find(n => n.id === targetId);
              if (!target) return null;
              return (
                 <line 
                   key={`${node.id}-${target.id}`}
                   x1={`${node.x}%`} y1={`${node.y}%`}
                   x2={`${target.x}%`} y2={`${target.y}%`}
                   stroke="#4f46e5" strokeWidth="1" strokeOpacity="0.4"
                 />
              );
           })
        )}

        {/* Nodes */}
        {KNOWLEDGE_NODES.map((node, i) => (
           <g key={node.id} className="cursor-pointer hover:opacity-80 transition-opacity">
              <circle 
                cx={`${node.x}%`} cy={`${node.y}%`} r={node.r} 
                fill={node.type === 'Root' ? '#6366f1' : node.type === 'Category' ? '#0ea5e9' : '#1e293b'}
                fillOpacity={node.type === 'Leaf' ? 1 : 0.2}
                stroke={node.type === 'Root' ? '#818cf8' : node.type === 'Category' ? '#38bdf8' : '#475569'}
                strokeWidth={node.type === 'Root' ? 2 : 1}
                className={node.type === 'Root' ? 'animate-pulse' : ''}
                style={{animationDuration: '3s'}}
              />
              <text 
                x={`${node.x}%`} y={`${node.y + (node.r > 20 ? 0 : 20)/5}%`} 
                dy={node.r / 3}
                textAnchor="middle" 
                fill="#cbd5e1" 
                fontSize={node.type === 'Root' ? 10 : 8} 
                fontWeight={node.type === 'Root' ? 'bold' : 'normal'}
                className="pointer-events-none"
              >
                {node.label}
              </text>
           </g>
        ))}
     </svg>
  </div>
);

export const RemoteExpertKnowledgeView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & Stats */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-indigo-900/50 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
               <BrainCircuit size={14} className="animate-pulse" /> Intellectual Property Core
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               专家案例 <span className="text-indigo-500">与知识沉淀图谱</span>
            </h1>
          </div>
          
          <div className="flex gap-4">
             <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">Total Cases</span>
                <span className="text-xl font-mono font-bold text-white">2,845</span>
             </div>
             <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">Solutions Reused</span>
                <div className="flex items-center gap-1">
                    <span className="text-xl font-mono font-bold text-green-400">14.2k</span>
                    <TrendingUp size={12} className="text-green-500" />
                </div>
             </div>
             <div className="px-4 py-2 bg-indigo-900/20 border border-indigo-500/30 rounded flex flex-col items-end">
                <span className="text-[10px] text-indigo-300 uppercase">Est. Value Saved</span>
                <span className="text-xl font-mono font-bold text-indigo-400">¥ 450M</span>
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Navigation & Trends */}
        <div className="w-full lg:w-[280px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Search knowledge..." 
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           <SciFiCard title="领域分布 (Domains)" className="border-slate-800">
               <div className="h-40 w-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie 
                             data={TOPIC_DIST} 
                             innerRadius={30} 
                             outerRadius={50} 
                             paddingAngle={5} 
                             dataKey="value"
                           >
                               {TOPIC_DIST.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                               ))}
                           </Pie>
                           <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#333'}} />
                       </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                       <span className="text-2xl font-bold text-white">4</span>
                       <span className="text-[9px] text-slate-500 uppercase">Domains</span>
                   </div>
               </div>
               <div className="space-y-2 mt-2">
                   {TOPIC_DIST.map((item, i) => (
                       <div key={i} className="flex justify-between items-center text-xs">
                           <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.fill}}></div>
                               <span className="text-slate-300">{item.name}</span>
                           </div>
                           <span className="font-mono text-white">{item.value}%</span>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="热门标签 (Hot Tags)" className="flex-1 border-slate-800">
               <div className="flex flex-wrap gap-2 content-start">
                   {['Vibration', 'Overheating', 'PLC', 'Hydraulics', 'Bearing', 'Sensor', 'Efficiency', 'Safety', 'Alignment'].map((tag, i) => (
                       <span 
                         key={i} 
                         className={`px-2 py-1 rounded text-[10px] cursor-pointer hover:bg-indigo-900/50 hover:text-white hover:border-indigo-500 transition-all border border-slate-700
                             ${i === 0 ? 'bg-indigo-900/20 text-indigo-300 text-xs font-bold' : 'bg-slate-900/50 text-slate-400'}
                         `}
                       >
                           #{tag}
                       </span>
                   ))}
               </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: The Knowledge Feed */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Top: Knowledge Graph */}
           <SciFiCard title="知识关联图谱 (Neural Map)" subtitle="INTERACTIVE" className="h-[300px] border-indigo-900/50 bg-[#06080e]" noPadding>
               <div className="w-full h-full p-2 relative">
                   <KnowledgeNetwork />
                   
                   <div className="absolute bottom-4 left-4 flex gap-4">
                       <div className="flex items-center gap-2 text-[10px] text-slate-400">
                           <div className="w-3 h-3 rounded-full bg-[#6366f1] opacity-50"></div> Root Domain
                       </div>
                       <div className="flex items-center gap-2 text-[10px] text-slate-400">
                           <div className="w-3 h-3 rounded-full bg-[#0ea5e9] opacity-50"></div> Category
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Case Feed */}
           <div className="flex flex-col gap-4">
               <div className="flex items-center justify-between">
                   <h3 className="text-sm font-bold text-white flex items-center gap-2">
                       <Star className="text-yellow-400" size={14} /> 
                       金牌案例 (Golden Cases)
                   </h3>
                   <div className="flex gap-2">
                       <button className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800">Most Recent</button>
                       <button className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded bg-indigo-900/20">Most Impactful</button>
                   </div>
               </div>

               {GOLDEN_CASES.map((study) => (
                   <div key={study.id} className="relative bg-slate-900/40 border border-slate-800 rounded-lg p-5 hover:border-indigo-500/50 transition-all group overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       
                       <div className="flex justify-between items-start mb-3">
                           <div>
                               <div className="flex items-center gap-2 mb-1">
                                   {study.verified && <CheckCircle2 size={14} className="text-green-400" />}
                                   <h4 className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors">{study.title}</h4>
                               </div>
                               <div className="flex items-center gap-3 text-xs text-slate-400">
                                   <span className="flex items-center gap-1"><User size={10}/> {study.author}</span>
                                   <span>•</span>
                                   <span>{study.role}</span>
                                   <span>•</span>
                                   <span>{study.date}</span>
                               </div>
                           </div>
                           <div className="flex items-center gap-2">
                               <span className="px-2 py-1 bg-green-900/20 border border-green-500/30 text-green-400 text-[10px] rounded font-bold">
                                   ROI: {study.impact}
                               </span>
                           </div>
                       </div>

                       <p className="text-sm text-slate-300 mb-4 leading-relaxed bg-[#0b0e16] p-3 rounded border border-slate-800/50">
                           {study.summary}
                       </p>

                       <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
                           <div className="flex gap-2">
                               {study.tags.map(tag => (
                                   <span key={tag} className="text-[10px] text-indigo-300 bg-indigo-900/10 px-2 py-0.5 rounded border border-indigo-900/30">
                                       #{tag}
                                   </span>
                               ))}
                           </div>
                           <div className="flex gap-4 text-xs text-slate-500">
                               <span className="flex items-center gap-1 hover:text-white cursor-pointer"><ThumbsUp size={12}/> {study.likes}</span>
                               <span className="flex items-center gap-1 hover:text-white cursor-pointer"><MessageSquare size={12}/> 12</span>
                               <span className="flex items-center gap-1"><ArrowUpRight size={12}/> {study.views}</span>
                           </div>
                       </div>
                   </div>
               ))}
           </div>

        </div>

        {/* RIGHT COLUMN: Community & Growth */}
        <div className="w-full lg:w-[300px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Leaderboard */}
           <SciFiCard title="专家贡献榜 (Leaderboard)" subtitle="TOP EXPERTS" className="border-indigo-900/30">
               <div className="flex flex-col gap-1">
                   {TOP_CONTRIBUTORS.map((c, i) => (
                       <div key={i} className={`flex items-center p-3 rounded border transition-colors
                           ${i === 0 ? 'bg-gradient-to-r from-amber-900/20 to-transparent border-amber-500/30' : 'bg-slate-900/30 border-slate-800'}
                       `}>
                           <div className={`w-8 h-8 flex items-center justify-center rounded font-bold text-sm mr-3 text-black
                               ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-300' : i === 2 ? 'bg-orange-700 text-white' : 'bg-slate-700 text-slate-300'}
                           `}>
                               {c.rank}
                           </div>
                           <div className="flex-1">
                               <div className="text-sm font-bold text-white">{c.name}</div>
                               <div className="text-[10px] text-slate-400 flex gap-1">
                                   {c.badges.map(b => <span key={b}>{b}</span>)}
                               </div>
                           </div>
                           <div className="text-right">
                               <div className="text-xs font-mono text-cyan-400 font-bold">{c.points}</div>
                               <div className="text-[9px] text-slate-500">Pts</div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Growth Trend */}
           <SciFiCard title="知识沉淀趋势" subtitle="GROWTH" className="border-slate-800">
               <div className="h-40 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={TREND_DATA}>
                           <defs>
                               <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#8b5cf6', color: '#fff'}} />
                           <Area type="monotone" dataKey="reuse" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorGrowth)" />
                           <Area type="monotone" dataKey="cases" stroke="#0ea5e9" strokeWidth={2} fill="none" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
               <div className="flex justify-between px-2 text-[10px] text-slate-400 mt-1">
                   <span className="text-indigo-400">Reuse Count</span>
                   <span className="text-cyan-400">New Cases</span>
               </div>
           </SciFiCard>

           {/* Quick Actions */}
           <div className="mt-auto">
               <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-900/20">
                   <Share2 size={14} /> Share Knowledge
               </button>
           </div>

        </div>

      </div>
    </div>
  );
};
