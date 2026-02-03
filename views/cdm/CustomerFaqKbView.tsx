
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Search, BookOpen, HelpCircle, FileText, 
  ThumbsUp, ThumbsDown, GitBranch, Hash, 
  Clock, User, ArrowRight, Zap, Lightbulb,
  Filter, Tag, Share2, Eye, BrainCircuit
} from 'lucide-react';
import { 
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell,
  BarChart, Bar, CartesianGrid, AreaChart, Area
} from 'recharts';

// --- Types ---

interface Article {
  id: string;
  title: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  author: string;
  updated: string;
  preview: string;
}

interface KnowledgeNode {
  x: number;
  y: number;
  z: number; // Size/Importance
  name: string;
  category: string;
}

// --- Mock Data ---

const KB_STATS = [
  { label: 'Total Articles', value: 2450, trend: '+12', color: '#f59e0b' },
  { label: 'Self-Service Rate', value: '82%', trend: '+4%', color: '#10b981' },
  { label: 'Avg Search Time', value: '1.2s', trend: '-0.3s', color: '#0ea5e9' },
  { label: 'Feedback Score', value: '4.8/5', trend: 'Stable', color: '#8b5cf6' },
];

const KNOWLEDGE_GRAPH_DATA: KnowledgeNode[] = [
  { x: 10, y: 50, z: 500, name: 'Billing', category: 'Finance' },
  { x: 15, y: 55, z: 200, name: 'Invoices', category: 'Finance' },
  { x: 12, y: 45, z: 150, name: 'Payment', category: 'Finance' },
  
  { x: 50, y: 80, z: 800, name: 'Installation', category: 'Tech' },
  { x: 55, y: 85, z: 300, name: 'Config', category: 'Tech' },
  { x: 45, y: 75, z: 250, name: 'Drivers', category: 'Tech' },
  { x: 52, y: 70, z: 200, name: 'Firmware', category: 'Tech' },

  { x: 80, y: 30, z: 600, name: 'Troubleshooting', category: 'Support' },
  { x: 85, y: 35, z: 300, name: 'Error Codes', category: 'Support' },
  { x: 75, y: 25, z: 200, name: 'Logs', category: 'Support' },
  
  { x: 30, y: 20, z: 400, name: 'Account', category: 'Admin' },
  { x: 35, y: 15, z: 100, name: 'Password', category: 'Admin' },
  { x: 25, y: 25, z: 150, name: 'Permissions', category: 'Admin' },
];

const ARTICLES: Article[] = [
  { 
    id: 'KB-101', title: '如何重置工业网关的 API 密钥?', category: 'Tech', 
    tags: ['Security', 'API', 'Gateway'], views: 1254, helpful: 98, author: 'Dev Ops', updated: '2024-03-15',
    preview: 'Go to Settings > Developer > Keys. Click "Regenerate". Note: This will invalidate old keys immediately...'
  },
  { 
    id: 'KB-204', title: '配置 MQTT 数据上报频率指南', category: 'Tech', 
    tags: ['IoT', 'Config', 'Performance'], views: 890, helpful: 85, author: 'System Arch', updated: '2024-03-10',
    preview: 'To optimize bandwidth, adjust the "publish_interval" parameter in the config.json file. Default is 1000ms...'
  },
  { 
    id: 'KB-305', title: '为什么我的月度账单金额有差异?', category: 'Finance', 
    tags: ['Billing', 'FAQ'], views: 3200, helpful: 92, author: 'Billing Support', updated: '2024-02-28',
    preview: 'Discrepancies often arise from pro-rated charges when adding new seats mid-month. Check the "Proration" section...'
  },
  { 
    id: 'KB-412', title: 'Error 503: Service Unavailable 排查步骤', category: 'Support', 
    tags: ['Troubleshooting', 'Server'], views: 560, helpful: 70, author: 'L2 Support', updated: '2024-03-18',
    preview: '503 errors usually indicate server overload or maintenance. First, check the Status Page for active incidents...'
  },
];

const SEARCH_TREND = [
  { hour: '08:00', volume: 120 },
  { hour: '10:00', volume: 450 },
  { hour: '12:00', volume: 300 },
  { hour: '14:00', volume: 580 },
  { hour: '16:00', volume: 420 },
  { hour: '18:00', volume: 150 },
];

// --- Components ---

interface CategoryPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const CategoryPill: React.FC<CategoryPillProps> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border
      ${active 
        ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_10px_#f59e0b]' 
        : 'bg-slate-900/50 text-slate-400 border-slate-700 hover:border-amber-500/50 hover:text-amber-200'}
    `}
  >
    {label}
  </button>
);

const SearchBar = ({ onSearch }: { onSearch: (v: string) => void }) => (
  <div className="relative w-full max-w-3xl mx-auto group">
    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
    <div className="relative flex items-center bg-[#0b1221] border border-slate-700 rounded-lg p-2 shadow-2xl">
      <Search className="text-slate-400 ml-3" size={20} />
      <input 
        type="text" 
        placeholder="提问或搜索知识库 (e.g. '如何配置防火墙', 'Error 404')..." 
        className="w-full bg-transparent border-none text-slate-200 px-4 py-2 focus:outline-none text-lg placeholder:text-slate-600"
        onChange={(e) => onSearch(e.target.value)}
      />
      <div className="hidden md:flex gap-2 mr-2">
         <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">Cmd + K</span>
      </div>
      <button className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded font-bold transition-colors">
        Search
      </button>
    </div>
  </div>
);

export const CustomerFaqKbView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = ARTICLES.filter(a => 
    (activeCategory === 'All' || a.category === activeCategory) &&
    (a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Hero Search Section */}
      <div className="flex flex-col items-center justify-center py-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617] border-b border-slate-800">
          <div className="mb-6 text-center">
             <div className="flex items-center justify-center gap-2 text-amber-500 mb-2">
                <BrainCircuit size={24} />
                <span className="text-sm font-bold uppercase tracking-[0.2em]">Neural Knowledge Core</span>
             </div>
             <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">help you</span> today?
             </h1>
          </div>
          
          <SearchBar onSearch={setSearchQuery} />
          
          <div className="mt-6 flex flex-wrap justify-center gap-3">
             {['All', 'Tech', 'Finance', 'Support', 'Admin'].map(cat => (
                <CategoryPill key={cat} label={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
             ))}
          </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden px-4 md:px-8 pb-4">
          
          {/* LEFT: Article Results */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
             <div className="flex justify-between items-end mb-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                   <BookOpen size={18} className="text-amber-500" /> 
                   {searchQuery ? 'Search Results' : 'Recommended Articles'}
                </h3>
                <span className="text-xs text-slate-500">{filteredArticles.length} articles found</span>
             </div>

             {filteredArticles.map(article => (
                <SciFiCard key={article.id} className="border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group" noPadding>
                   <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{article.id}</span>
                            <span className="text-[10px] text-amber-400 border border-amber-900/50 bg-amber-900/10 px-2 py-0.5 rounded">{article.category}</span>
                         </div>
                         <div className="flex items-center gap-3 text-slate-500 text-xs">
                            <span className="flex items-center gap-1"><Eye size={12}/> {article.views}</span>
                            <span className="flex items-center gap-1"><ThumbsUp size={12}/> {article.helpful}%</span>
                         </div>
                      </div>
                      
                      <h4 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors mb-2">
                         {article.title}
                      </h4>
                      
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                         {article.preview}
                      </p>

                      <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
                         <div className="flex gap-2">
                            {article.tags.map(tag => (
                               <span key={tag} className="text-[10px] text-slate-500 flex items-center gap-1">
                                  <Hash size={10} /> {tag}
                               </span>
                            ))}
                         </div>
                         <div className="flex items-center gap-2 text-xs text-slate-500">
                             <User size={12} /> {article.author}
                             <span className="mx-1">•</span>
                             <Clock size={12} /> {article.updated}
                         </div>
                      </div>
                   </div>
                </SciFiCard>
             ))}
             
             {filteredArticles.length === 0 && (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded bg-slate-900/20">
                   <HelpCircle size={48} className="mx-auto text-slate-600 mb-4" />
                   <p className="text-slate-400">No articles found matching your criteria.</p>
                   <button className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded transition-colors">
                      Submit a Ticket
                   </button>
                </div>
             )}
          </div>

          {/* RIGHT: Knowledge Graph & Analytics */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
             
             {/* Knowledge Graph */}
             <SciFiCard title="知识拓扑 (Knowledge Map)" subtitle="RELATIONS" className="h-[300px] border-cyan-900/30 bg-[#080a12]" noPadding>
                 <div className="w-full h-full p-2 relative">
                     <ResponsiveContainer width="100%" height="100%">
                         <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                             <XAxis type="number" dataKey="x" hide domain={[0, 100]} />
                             <YAxis type="number" dataKey="y" hide domain={[0, 100]} />
                             <ZAxis type="number" dataKey="z" range={[100, 1000]} />
                             <Tooltip 
                                cursor={{ strokeDasharray: '3 3' }} 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-black/80 border border-cyan-500/50 p-2 rounded text-xs text-white">
                                                <div className="font-bold mb-1">{data.name}</div>
                                                <div className="text-cyan-400">{data.category}</div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                             />
                             <Scatter name="Nodes" data={KNOWLEDGE_GRAPH_DATA}>
                                 {KNOWLEDGE_GRAPH_DATA.map((entry, index) => {
                                     const color = entry.category === 'Finance' ? '#f59e0b' : 
                                                   entry.category === 'Tech' ? '#0ea5e9' : 
                                                   entry.category === 'Support' ? '#ef4444' : '#8b5cf6';
                                     return <Cell key={`cell-${index}`} fill={color} fillOpacity={0.6} stroke={color} />;
                                 })}
                             </Scatter>
                         </ScatterChart>
                     </ResponsiveContainer>
                     <div className="absolute bottom-2 left-2 text-[10px] text-slate-500 bg-black/50 px-2 py-1 rounded">
                         Size = Relevance
                     </div>
                 </div>
             </SciFiCard>

             {/* Quick Stats Grid */}
             <div className="grid grid-cols-2 gap-3">
                 {KB_STATS.map((stat, i) => (
                     <div key={i} className="bg-slate-900/50 border border-slate-800 p-3 rounded flex flex-col justify-between hover:border-slate-600 transition-colors">
                         <div className="text-[10px] text-slate-500 uppercase">{stat.label}</div>
                         <div className="text-xl font-mono font-bold text-white mt-1">{stat.value}</div>
                         <div className="text-[10px] font-bold mt-1" style={{color: stat.color}}>{stat.trend}</div>
                     </div>
                 ))}
             </div>

             {/* Search Trend */}
             <SciFiCard title="搜索热度趋势" subtitle="24H" className="h-[200px] border-slate-800">
                 <div className="w-full h-full p-2">
                     <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={SEARCH_TREND}>
                             <defs>
                                 <linearGradient id="colorSearch" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                 </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                             <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} />
                             <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#f59e0b', fontSize: '12px'}} />
                             <Area type="monotone" dataKey="volume" stroke="#f59e0b" fill="url(#colorSearch)" strokeWidth={2} />
                         </AreaChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

             {/* Top Contributors */}
             <SciFiCard title="知识贡献榜 (Top Contributors)" className="flex-1 border-slate-800">
                 <div className="space-y-3">
                     {[
                         { name: 'Dev Ops', score: 1250, badge: 'Master' },
                         { name: 'Support Lead', score: 980, badge: 'Expert' },
                         { name: 'Billing Team', score: 850, badge: 'Pro' }
                     ].map((u, i) => (
                         <div key={i} className="flex items-center justify-between p-2 bg-slate-900/30 rounded border border-transparent hover:border-slate-700 transition-colors">
                             <div className="flex items-center gap-3">
                                 <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-black
                                     ${i===0 ? 'bg-amber-400' : i===1 ? 'bg-slate-300' : 'bg-orange-700 text-white'}
                                 `}>
                                     {i+1}
                                 </div>
                                 <span className="text-sm text-slate-300">{u.name}</span>
                             </div>
                             <div className="text-right">
                                 <div className="text-xs font-mono text-cyan-400">{u.score} pts</div>
                                 <div className="text-[9px] text-slate-500">{u.badge}</div>
                             </div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>

          </div>

      </div>
    </div>
  );
};
