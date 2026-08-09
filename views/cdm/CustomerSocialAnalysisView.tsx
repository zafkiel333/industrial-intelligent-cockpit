
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  MessageCircle, Share2, ThumbsUp, Eye, 
  TrendingUp, Globe, Hash, User, 
  AlertCircle, Search, Filter, Send,
  BarChart2, Zap, Heart, MessageSquare
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';

// --- Mock Data ---

const SOCIAL_STATS = [
  { label: '全网声量 (Mentions)', value: '14,250', trend: '+12%', icon: MessageCircle, color: '#0ea5e9' },
  { label: '情感指数 (Sentiment)', value: '8.4/10', trend: '+0.5', icon: Heart, color: '#ec4899' },
  { label: '互动总量 (Engagement)', value: '85.4K', trend: '+24%', icon: ThumbsUp, color: '#f59e0b' },
  { label: '潜在商机 (Leads)', value: '342', trend: '+8%', icon: Zap, color: '#10b981' },
];

const SENTIMENT_TREND = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  positive: Math.floor(Math.random() * 50) + 30,
  neutral: Math.floor(Math.random() * 30) + 20,
  negative: Math.floor(Math.random() * 15),
}));

const CHANNEL_DATA = [
  { name: '微信 (WeChat)', value: 45, fill: '#10b981' },
  { name: '微博 (Weibo)', value: 25, fill: '#f59e0b' },
  { name: '抖音 (Douyin)', value: 20, fill: '#0ea5e9' },
  { name: '行业论坛', value: 10, fill: '#6366f1' },
];

const TOPIC_CLUSTERS = [
  { subject: '产品质量', A: 90, fullMark: 100 },
  { subject: '售后服务', A: 65, fullMark: 100 },
  { subject: '价格因素', A: 75, fullMark: 100 },
  { subject: '物流交付', A: 50, fullMark: 100 },
  { subject: '品牌形象', A: 85, fullMark: 100 },
  { subject: '创新技术', A: 80, fullMark: 100 },
];

const SOCIAL_FEED = [
  { id: 1, user: 'User_8821', channel: 'Weibo', content: '这次采购的重型设备运行非常稳定，效率提升明显！赞一个👍', sentiment: 'Positive', time: '10 mins ago', likes: 124 },
  { id: 2, user: 'TechMaster', channel: 'Forum', content: '关于X-2000型号的液压系统维护，有没有官方的指导手册？', sentiment: 'Neutral', time: '35 mins ago', likes: 12 },
  { id: 3, user: 'InduLogistics', channel: 'WeChat', content: '发货速度比预期慢了三天，希望能改进物流对接。', sentiment: 'Negative', time: '2 hours ago', likes: 5 },
  { id: 4, user: 'Eng_Li', channel: 'Douyin', content: '现场安装调试视频分享，这工艺确实没得说。#工业制造 #智能工厂', sentiment: 'Positive', time: '4 hours ago', likes: 890 },
  { id: 5, user: 'Procure_King', channel: 'LinkedIn', content: 'Looking forward to the partnership with Shanghai Heavy Ind.', sentiment: 'Positive', time: '1 day ago', likes: 45 },
];

const KEYWORDS = [
  { text: '智能控制', size: 90, color: '#0ea5e9' },
  { text: '耐用性', size: 80, color: '#10b981' },
  { text: '响应慢', size: 40, color: '#ef4444' },
  { text: '性价比', size: 70, color: '#f59e0b' },
  { text: '售后专业', size: 60, color: '#8b5cf6' },
  { text: '节能', size: 55, color: '#06b6d4' },
  { text: '操作复杂', size: 30, color: '#f43f5e' },
  { text: '定制化', size: 50, color: '#ec4899' },
];

// --- Sub-Components ---

const SocialNodeGraph = () => {
  // Simulating a force-directed graph with SVG
  const nodes = [
    { x: 50, y: 50, r: 15, color: '#f59e0b', label: '核心品牌' },
    { x: 30, y: 30, r: 8, color: '#0ea5e9', label: 'KOL_A' },
    { x: 70, y: 30, r: 10, color: '#10b981', label: 'Partner_B' },
    { x: 20, y: 70, r: 6, color: '#6366f1', label: 'User_C' },
    { x: 80, y: 60, r: 9, color: '#ec4899', label: 'Media_D' },
    { x: 50, y: 80, r: 7, color: '#0ea5e9', label: 'Fan_E' },
    { x: 40, y: 45, r: 4, color: '#64748b' },
    { x: 60, y: 40, r: 4, color: '#64748b' },
    { x: 55, y: 65, r: 4, color: '#64748b' },
  ];

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#080c14] rounded-lg border border-indigo-900/30">
      <div className="absolute inset-0 opacity-20" style={{
         backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)',
         backgroundSize: '20px 20px'
      }}></div>
      
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
         {/* Links */}
         <line x1="50" y1="50" x2="30" y2="30" stroke="#334155" strokeWidth="0.5" className="animate-pulse" />
         <line x1="50" y1="50" x2="70" y2="30" stroke="#334155" strokeWidth="0.5" />
         <line x1="50" y1="50" x2="20" y2="70" stroke="#334155" strokeWidth="0.5" />
         <line x1="50" y1="50" x2="80" y2="60" stroke="#334155" strokeWidth="0.5" className="animate-pulse" />
         <line x1="50" y1="50" x2="50" y2="80" stroke="#334155" strokeWidth="0.5" />
         <line x1="30" y1="30" x2="20" y2="70" stroke="#334155" strokeWidth="0.2" />
         <line x1="70" y1="30" x2="80" y2="60" stroke="#334155" strokeWidth="0.2" />

         {/* Nodes */}
         {nodes.map((node, i) => (
           <g key={i} className="cursor-pointer hover:opacity-80 transition-opacity">
              <circle cx={node.x} cy={node.y} r={node.r / 3} fill={node.color} fillOpacity="0.2" className="animate-ping" style={{animationDuration: `${2+i}s`}} />
              <circle cx={node.x} cy={node.y} r={node.r / 4} fill={node.color} stroke="#fff" strokeWidth="0.2" />
              {node.label && (
                <text x={node.x} y={node.y + node.r/3 + 3} fontSize="3" fill="#cbd5e1" textAnchor="middle">{node.label}</text>
              )}
           </g>
         ))}
      </svg>

      <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded border border-slate-700 text-[10px] text-slate-400">
         影响力网络 (Influence Network)
      </div>
    </div>
  );
};

export const CustomerSocialAnalysisView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & Stats */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-indigo-900/50 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
               <Globe size={14} /> Social Intelligence
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               客户社交媒体 <span className="text-indigo-500">与在线互动分析</span>
            </h1>
          </div>
          
          <div className="flex gap-2">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input 
                  type="text" 
                  placeholder="追踪关键词或话题..." 
                  className="bg-slate-900/50 border border-slate-700 rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500 w-64 text-slate-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded shadow-lg transition-colors">
                <Filter size={16} />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {SOCIAL_STATS.map((stat, i) => (
             <div key={i} className="bg-slate-900/40 border border-slate-800 p-4 rounded-lg flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                <div>
                   <div className="text-xs text-slate-500 uppercase font-bold mb-1">{stat.label}</div>
                   <div className="text-2xl font-mono font-bold text-white">{stat.value}</div>
                   <div className={`text-xs font-bold mt-1 ${stat.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.trend} <span className="text-slate-600 font-normal">vs last week</span>
                   </div>
                </div>
                <div className="p-3 rounded-full bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform">
                   <stat.icon size={24} style={{ color: stat.color }} />
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Audience & Content */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Channel Distribution */}
           <SciFiCard title="渠道声量分布" subtitle="SOURCES" className="border-indigo-900/50">
               <div className="h-48 w-full flex items-center">
                   <div className="w-1/2 h-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                               <Pie 
                                 data={CHANNEL_DATA} 
                                 innerRadius={30} 
                                 outerRadius={50} 
                                 paddingAngle={5} 
                                 dataKey="value"
                               >
                                   {CHANNEL_DATA.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.fill} />
                                   ))}
                               </Pie>
                               <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#333'}} />
                           </PieChart>
                   </ResponsiveContainer>
                   </div>
                   <div className="flex-1 space-y-2 pr-2">
                       {CHANNEL_DATA.map((d, i) => (
                           <div key={i} className="flex justify-between items-center text-xs">
                               <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.fill}}></div>
                                   <span className="text-slate-300">{d.name.split(' ')[0]}</span>
                               </div>
                               <span className="font-mono text-white">{d.value}%</span>
                           </div>
                       ))}
                   </div>
               </div>
           </SciFiCard>

           {/* Word Cloud / Keywords */}
           <SciFiCard title="热门话题关键词" subtitle="TRENDING" className="flex-1 border-slate-800">
               <div className="flex flex-wrap gap-3 content-start h-full">
                   {KEYWORDS.map((kw, i) => (
                       <span 
                         key={i} 
                         className="px-2 py-1 rounded border bg-slate-900/50 hover:bg-slate-800 transition-colors cursor-pointer"
                         style={{
                             fontSize: `${Math.max(10, kw.size / 4)}px`,
                             color: kw.color,
                             borderColor: `${kw.color}40`
                         }}
                       >
                           {kw.text}
                       </span>
                   ))}
               </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Analysis & Network */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Row 1: Network Graph & Sentiment Trend */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[320px]">
               
               {/* Influence Graph */}
               <SciFiCard title="客户影响力网络" subtitle="SOCIAL GRAPH" className="border-indigo-900/50" noPadding>
                   <div className="w-full h-full p-2">
                       <SocialNodeGraph />
                   </div>
               </SciFiCard>

               {/* Sentiment Chart */}
               <SciFiCard title="情感倾向趋势 (24H)" subtitle="SENTIMENT" className="border-slate-800">
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
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="time" stroke="#666" tick={{fontSize: 10}} interval={3} />
                               <YAxis stroke="#666" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#333'}} />
                               <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                               <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="url(#colorPos)" name="Positive" />
                               <Area type="monotone" dataKey="neutral" stackId="1" stroke="#64748b" fill="#64748b" fillOpacity={0.3} name="Neutral" />
                               <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="url(#colorNeg)" name="Negative" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>
           </div>

           {/* Row 2: Topic Radar & Engagement */}
           <div className="h-64 grid grid-cols-1 md:grid-cols-2 gap-6">
               
               <SciFiCard title="话题维度评价" subtitle="TOPIC RADAR" className="border-slate-800">
                   <div className="w-full h-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={TOPIC_CLUSTERS}>
                               <PolarGrid stroke="#334155" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                               <Radar name="Evaluation" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#8b5cf6'}} />
                           </RadarChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="互动类型分析" subtitle="ACTIONS" className="border-slate-800">
                   <div className="flex flex-col justify-center h-full gap-4 px-4">
                       <div className="space-y-1">
                           <div className="flex justify-between text-xs text-slate-400">
                               <span className="flex items-center gap-1"><ThumbsUp size={12}/> Likes / Favorites</span>
                               <span className="text-white font-mono">65%</span>
                           </div>
                           <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                               <div className="bg-pink-500 h-full" style={{width: '65%'}}></div>
                           </div>
                       </div>
                       <div className="space-y-1">
                           <div className="flex justify-between text-xs text-slate-400">
                               <span className="flex items-center gap-1"><MessageSquare size={12}/> Comments / Replies</span>
                               <span className="text-white font-mono">25%</span>
                           </div>
                           <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                               <div className="bg-purple-500 h-full" style={{width: '25%'}}></div>
                           </div>
                       </div>
                       <div className="space-y-1">
                           <div className="flex justify-between text-xs text-slate-400">
                               <span className="flex items-center gap-1"><Share2 size={12}/> Shares / Reposts</span>
                               <span className="text-white font-mono">10%</span>
                           </div>
                           <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                               <div className="bg-cyan-500 h-full" style={{width: '10%'}}></div>
                           </div>
                       </div>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Live Feed */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           <SciFiCard title="实时互动流 (Live Stream)" subtitle="FEED" className="flex-1 border-pink-900/30">
               <div className="flex flex-col gap-0 relative h-full overflow-y-auto custom-scrollbar">
                   {/* Timeline Line */}
                   <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-800"></div>

                   {SOCIAL_FEED.map((post, i) => (
                       <div key={post.id} className="relative pl-8 py-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                           {/* Avatar/Dot */}
                           <div className={`absolute left-[5px] top-4 w-4 h-4 rounded-full border-2 border-[#0b1221] z-10 flex items-center justify-center text-[8px] font-bold text-white
                               ${post.channel === 'WeChat' ? 'bg-green-500' : post.channel === 'Weibo' ? 'bg-yellow-500' : 'bg-blue-500'}
                           `}>
                               {post.channel[0]}
                           </div>
                           
                           <div className="flex justify-between items-start mb-1">
                               <span className="text-xs font-bold text-cyan-300">{post.user}</span>
                               <span className="text-[9px] text-slate-500">{post.time}</span>
                           </div>
                           
                           <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                               {post.content}
                           </p>

                           <div className="flex justify-between items-center">
                               <div className="flex gap-2">
                                   <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                                       post.sentiment === 'Positive' ? 'text-green-400 border-green-500/30 bg-green-900/10' : 
                                       post.sentiment === 'Negative' ? 'text-red-400 border-red-500/30 bg-red-900/10' : 
                                       'text-slate-400 border-slate-600 bg-slate-800'
                                   }`}>
                                       {post.sentiment}
                                   </span>
                               </div>
                               <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                   <ThumbsUp size={10} /> {post.likes}
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>
           
           <div className="grid grid-cols-2 gap-2">
               <button className="py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 hover:text-white hover:border-slate-500 transition-colors">
                   View All Posts
               </button>
               <button className="py-2 bg-indigo-900/30 border border-indigo-500/30 rounded text-xs text-indigo-300 hover:text-white hover:border-indigo-500 transition-colors flex items-center justify-center gap-2">
                   <Send size={12} /> Quick Reply
               </button>
           </div>

        </div>

      </div>
    </div>
  );
};
