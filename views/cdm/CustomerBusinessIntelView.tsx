
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Globe, Search, AlertTriangle, TrendingUp, 
  Building2, Users, FileText, Gavel, 
  Newspaper, Share2, Activity, Eye,
  ShieldAlert, Lock, Network, Zap,
  MessageCircle, Radar as RadarIcon, Filter
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell, Legend
} from 'recharts';

// --- Types ---

type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Safe';
type Sentiment = 'Positive' | 'Neutral' | 'Negative';

interface MonitoredEntity {
  id: string;
  name: string;
  legalRep: string;
  capital: string;
  status: string;
  riskLevel: RiskLevel;
  sentimentScore: number; // 0-100
  tags: string[];
}

interface NewsItem {
  id: string;
  date: string;
  source: string;
  title: string;
  sentiment: Sentiment;
  type: 'News' | 'Announcement' | 'Social' | 'Legal';
}

interface RelationNode {
  id: string;
  label: string;
  type: 'Main' | 'Person' | 'Company' | 'Invest';
  x: number;
  y: number;
  r: number;
}

interface RelationLink {
  source: string;
  target: string;
  label: string;
}

// --- Mock Data ---

const ENTITIES: MonitoredEntity[] = [
  { id: 'C-001', name: 'Shanghai Heavy Ind.', legalRep: 'Zhang Wei', capital: '500M CNY', status: 'Active', riskLevel: 'Low', sentimentScore: 85, tags: ['Manufacturing', 'State-owned'] },
  { id: 'C-002', name: 'Pacific Power Group', legalRep: 'Li Qiang', capital: '1.2B CNY', status: 'Active', riskLevel: 'Medium', sentimentScore: 60, tags: ['Energy', 'Listed'] },
  { id: 'C-003', name: 'Titanium Holdings', legalRep: 'Mike Chen', capital: '50M USD', status: 'Abnormal', riskLevel: 'High', sentimentScore: 35, tags: ['Trade', 'Cross-border'] },
  { id: 'C-004', name: 'Quantum Tech', legalRep: 'Sarah Wu', capital: '20M CNY', status: 'Active', riskLevel: 'Safe', sentimentScore: 92, tags: ['High-Tech', 'Startup'] },
];

const NEWS_FEED: NewsItem[] = [
  { id: 'N1', date: '10 mins ago', source: 'Finance News', title: 'Shanghai Heavy Ind. announces Q1 profit surge of 15%.', sentiment: 'Positive', type: 'News' },
  { id: 'N2', date: '2 hours ago', source: 'Court Daily', title: 'Patent dispute hearing scheduled for next month.', sentiment: 'Negative', type: 'Legal' },
  { id: 'N3', date: '5 hours ago', source: 'Weibo', title: 'New product line launch receives mixed reviews from users.', sentiment: 'Neutral', type: 'Social' },
  { id: 'N4', date: 'Yesterday', source: 'Gov Portal', title: 'Awarded "Green Factory" certification.', sentiment: 'Positive', type: 'Announcement' },
  { id: 'N5', date: '2 days ago', source: 'Supplier Network', title: 'Supply chain disruption rumor reported.', sentiment: 'Negative', type: 'Social' },
];

const SENTIMENT_TREND = Array.from({ length: 14 }, (_, i) => ({
  day: `D-${14-i}`,
  positive: Math.floor(Math.random() * 40) + 20,
  neutral: Math.floor(Math.random() * 30) + 10,
  negative: Math.floor(Math.random() * 20),
  riskIndex: Math.floor(Math.random() * 30) + 10
}));

const RISK_RADAR = [
  { subject: '法律诉讼', A: 65, fullMark: 100 },
  { subject: '经营异常', A: 20, fullMark: 100 },
  { subject: '行政处罚', A: 10, fullMark: 100 },
  { subject: '舆情风险', A: 85, fullMark: 100 },
  { subject: '股权冻结', A: 0, fullMark: 100 },
  { subject: '对外担保', A: 45, fullMark: 100 },
];

const GRAPH_NODES: RelationNode[] = [
  { id: 'main', label: 'Shanghai Heavy', type: 'Main', x: 400, y: 300, r: 40 },
  { id: 'p1', label: 'Zhang Wei (CEO)', type: 'Person', x: 250, y: 150, r: 25 },
  { id: 'c1', label: 'Heavy Metal Ltd.', type: 'Company', x: 550, y: 150, r: 30 },
  { id: 'c2', label: 'SH Logistics', type: 'Company', x: 600, y: 400, r: 28 },
  { id: 'c3', label: 'Future Tech', type: 'Invest', x: 200, y: 450, r: 20 },
  { id: 'p2', label: 'Li (Director)', type: 'Person', x: 150, y: 250, r: 20 },
];

const GRAPH_LINKS: RelationLink[] = [
  { source: 'p1', target: 'main', label: 'Legal Rep' },
  { source: 'c1', target: 'main', label: 'Shareholder (45%)' },
  { source: 'main', target: 'c2', label: '100% Owned' },
  { source: 'main', target: 'c3', label: 'Invest (15%)' },
  { source: 'p2', target: 'main', label: 'Executive' },
  { source: 'p1', target: 'c3', label: 'Board' },
];

// --- Sub-Components ---

const RiskBadge = ({ level }: { level: RiskLevel }) => {
  const styles = {
    'Critical': 'bg-red-950/50 text-red-400 border-red-500 shadow-[0_0_10px_#ef4444]',
    'High': 'bg-orange-950/40 text-orange-400 border-orange-500',
    'Medium': 'bg-yellow-950/30 text-yellow-400 border-yellow-600',
    'Low': 'bg-blue-950/30 text-blue-400 border-blue-600',
    'Safe': 'bg-emerald-950/30 text-emerald-400 border-emerald-600',
  }[level];
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1 ${styles}`}>
      {['Critical', 'High'].includes(level) && <AlertTriangle size={10} />}
      {level}
    </span>
  );
};

const SentimentIcon = ({ type }: { type: Sentiment }) => {
  if (type === 'Positive') return <TrendingUp size={14} className="text-emerald-400" />;
  if (type === 'Negative') return <TrendingUp size={14} className="text-red-400 rotate-180" />;
  return <Activity size={14} className="text-slate-400" />;
};

const RelationGraph = () => {
  return (
    <div className="w-full h-full relative bg-[#050812] rounded overflow-hidden border border-indigo-900/30">
       <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
           backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
           backgroundSize: '30px 30px'
       }}></div>

       <svg className="w-full h-full absolute inset-0">
          <defs>
             <marker id="arrow" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
             </marker>
          </defs>

          {/* Links */}
          {GRAPH_LINKS.map((link, i) => {
             const s = GRAPH_NODES.find(n => n.id === link.source);
             const t = GRAPH_NODES.find(n => n.id === link.target);
             if (!s || !t) return null;
             return (
               <g key={i}>
                  <line 
                    x1={s.x} y1={s.y} 
                    x2={t.x} y2={t.y} 
                    stroke="#334155" 
                    strokeWidth="1" 
                    markerEnd="url(#arrow)"
                  />
                  <text x={(s.x+t.x)/2} y={(s.y+t.y)/2} fill="#64748b" fontSize="10" textAnchor="middle" dy="-5" className="bg-[#050812]">
                     {link.label}
                  </text>
               </g>
             )
          })}

          {/* Nodes */}
          {GRAPH_NODES.map((node, i) => (
             <g key={node.id} className="cursor-pointer hover:opacity-80 transition-opacity">
                {/* Glow for Main */}
                {node.type === 'Main' && (
                   <circle cx={node.x} cy={node.y} r={node.r + 10} fill="#4f46e5" fillOpacity="0.2" className="animate-pulse" />
                )}
                
                <circle 
                  cx={node.x} cy={node.y} r={node.r} 
                  fill={node.type === 'Main' ? '#4f46e5' : '#0f172a'} 
                  stroke={node.type === 'Main' ? '#818cf8' : node.type === 'Person' ? '#10b981' : '#0ea5e9'}
                  strokeWidth="2"
                />
                
                {/* Icon inside */}
                <foreignObject x={node.x - 10} y={node.y - 10} width="20" height="20">
                   <div className="flex items-center justify-center w-full h-full text-white">
                      {node.type === 'Main' ? <Building2 size={16} /> : node.type === 'Person' ? <Users size={16} /> : <Network size={16} />}
                   </div>
                </foreignObject>

                <text x={node.x} y={node.y + node.r + 15} fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle">
                   {node.label}
                </text>
             </g>
          ))}
       </svg>

       <div className="absolute top-4 left-4">
          <div className="bg-black/60 backdrop-blur px-3 py-1 rounded border border-indigo-500/30 text-xs text-indigo-300 font-bold">
             股权穿透与关联方 (Equity & Relations)
          </div>
       </div>
    </div>
  );
};

export const CustomerBusinessIntelView: React.FC = () => {
  const [selectedEntityId, setSelectedEntityId] = useState(ENTITIES[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  const activeEntity = ENTITIES.find(e => e.id === selectedEntityId) || ENTITIES[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & Ticker */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-indigo-900/50 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
               <Globe size={14} /> Business Intelligence Unit
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               客户工商情报 <span className="text-indigo-500">与舆情监控</span>
            </h1>
          </div>
          
          <div className="flex gap-4 items-center">
             <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">Risk Index</span>
                <span className="text-xl font-mono font-bold text-yellow-400">Moderate</span>
             </div>
             <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors shadow-lg">
                <Eye size={14} /> 深度尽调 (Due Diligence)
             </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Entity List */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search company..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-400">
                  <Filter size={14} />
               </button>
           </div>

           <div className="flex flex-col gap-3">
               {ENTITIES.map(entity => (
                   <div 
                     key={entity.id}
                     onClick={() => setSelectedEntityId(entity.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedEntityId === entity.id 
                            ? 'bg-indigo-950/30 border-indigo-500/50 shadow-[inset_4px_0_0_#6366f1]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-mono text-slate-500">{entity.id}</span>
                           <RiskBadge level={entity.riskLevel} />
                       </div>
                       
                       <h3 className={`font-bold text-sm mb-1 ${selectedEntityId === entity.id ? 'text-white' : 'text-slate-300'}`}>
                           {entity.name}
                       </h3>
                       
                       <div className="flex gap-2 mb-2">
                           {entity.tags.map(tag => (
                               <span key={tag} className="text-[9px] bg-slate-800 px-1.5 rounded text-slate-400 border border-slate-700">{tag}</span>
                           ))}
                       </div>

                       <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-800/50">
                           <span className="flex items-center gap-1"><Users size={10}/> {entity.legalRep}</span>
                           <span className="flex items-center gap-1"><Activity size={10}/> Sent: {entity.sentimentScore}</span>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: Intelligence Hub */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Top: Knowledge Graph & Sentiment Chart */}
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[400px]">
               
               {/* Relation Graph */}
               <SciFiCard title="企业图谱 (Relationship Graph)" subtitle="EQUITY & KEY PERSONS" className="border-indigo-900/50" noPadding>
                   <div className="w-full h-full p-2">
                       <RelationGraph />
                   </div>
               </SciFiCard>

               {/* Sentiment Trend */}
               <SciFiCard title="舆情情感趋势 (Sentiment Trend)" subtitle="14 DAYS" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={SENTIMENT_TREND} margin={{top:10, right:10, left:0, bottom:0}}>
                               <defs>
                                   <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                   </linearGradient>
                                   <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0c1d', borderColor: '#6366f1', fontSize: '12px'}} />
                               <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{fontSize:'10px'}}/>
                               <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="url(#colorPos)" name="Positive" />
                               <Area type="monotone" dataKey="neutral" stackId="1" stroke="#64748b" fill="#64748b" fillOpacity={0.3} name="Neutral" />
                               <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="url(#colorNeg)" name="Negative" />
                               
                               {/* Risk Line Overlay */}
                               <Area type="monotone" dataKey="riskIndex" stroke="#f59e0b" fill="none" strokeWidth={2} strokeDasharray="5 5" name="Risk Index" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>
           </div>

           {/* Bottom: Info Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
               {/* Registration Info */}
               <SciFiCard title="工商注册信息" subtitle="BASIC INFO" className="border-slate-800">
                   <div className="grid grid-cols-2 gap-4 text-xs">
                       <div className="p-2 bg-slate-900/50 rounded border border-slate-700">
                           <div className="text-slate-500 mb-1">Unified Social Credit Code</div>
                           <div className="font-mono text-white">91310000X...</div>
                       </div>
                       <div className="p-2 bg-slate-900/50 rounded border border-slate-700">
                           <div className="text-slate-500 mb-1">Registered Capital</div>
                           <div className="font-mono text-white">{activeEntity.capital}</div>
                       </div>
                       <div className="p-2 bg-slate-900/50 rounded border border-slate-700">
                           <div className="text-slate-500 mb-1">Establishment Date</div>
                           <div className="font-mono text-white">2005-04-12</div>
                       </div>
                       <div className="p-2 bg-slate-900/50 rounded border border-slate-700">
                           <div className="text-slate-500 mb-1">Operating Status</div>
                           <div className="font-mono text-green-400">{activeEntity.status}</div>
                       </div>
                       <div className="col-span-2 p-2 bg-slate-900/50 rounded border border-slate-700">
                           <div className="text-slate-500 mb-1">Registered Address</div>
                           <div className="text-white truncate">No. 88 Century Avenue, Pudong New Area, Shanghai, China</div>
                       </div>
                   </div>
               </SciFiCard>

               {/* Legal Risks */}
               <SciFiCard title="司法风险扫描" subtitle="LEGAL" className="border-slate-800">
                   <div className="space-y-3">
                       <div className="flex justify-between items-center text-xs p-2 bg-slate-900/30 rounded border border-slate-800">
                           <span className="flex items-center gap-2"><Gavel size={14} className="text-slate-400"/> Lawsuits (Defendant)</span>
                           <span className="font-bold text-white">3</span>
                       </div>
                       <div className="flex justify-between items-center text-xs p-2 bg-slate-900/30 rounded border border-slate-800">
                           <span className="flex items-center gap-2"><ShieldAlert size={14} className="text-slate-400"/> Dishonest Debtor</span>
                           <span className="font-bold text-green-400">None</span>
                       </div>
                       <div className="flex justify-between items-center text-xs p-2 bg-slate-900/30 rounded border border-slate-800">
                           <span className="flex items-center gap-2"><Lock size={14} className="text-slate-400"/> Equity Freeze</span>
                           <span className="font-bold text-white">0</span>
                       </div>
                       <div className="mt-2 text-[10px] text-slate-500 text-center">Data Source: China Judgements Online / Court Databases</div>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Intelligence Feed */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Risk Radar */}
           <SciFiCard title="风险维度雷达" subtitle="RISK FACTOR" className="border-red-900/30">
               <div className="h-48 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RISK_RADAR}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Risk Score" dataKey="A" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.4} />
                           <Tooltip contentStyle={{backgroundColor: '#0f0c1d', borderColor: '#ef4444', color: '#fff'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* News Feed */}
           <SciFiCard title="舆情动态流 (News Feed)" subtitle="LIVE" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar" style={{maxHeight: '400px'}}>
                   {NEWS_FEED.map((news, i) => (
                       <div key={news.id} className="bg-slate-900/40 p-3 rounded border border-slate-800 hover:border-indigo-500/30 transition-colors group">
                           <div className="flex justify-between items-start mb-1">
                               <div className="flex items-center gap-2">
                                   {news.type === 'News' ? <Newspaper size={12} className="text-blue-400"/> : 
                                    news.type === 'Legal' ? <Gavel size={12} className="text-red-400"/> :
                                    news.type === 'Social' ? <MessageCircle size={12} className="text-pink-400"/> : <Zap size={12} className="text-yellow-400"/>}
                                   <span className="text-[10px] text-slate-400">{news.source}</span>
                               </div>
                               <span className="text-[9px] text-slate-500">{news.date}</span>
                           </div>
                           <h4 className="text-xs font-bold text-slate-200 group-hover:text-white leading-snug mb-2">
                               {news.title}
                           </h4>
                           <div className="flex justify-between items-center">
                               <SentimentIcon type={news.sentiment} />
                               <span className={`text-[9px] px-1.5 rounded ${news.sentiment === 'Negative' ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-500'}`}>
                                   {news.sentiment}
                               </span>
                           </div>
                       </div>
                   ))}
               </div>
               <button className="w-full mt-3 py-2 border border-dashed border-slate-600 rounded text-xs text-slate-400 hover:text-white hover:border-indigo-500 transition-colors">
                   Load More
               </button>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
