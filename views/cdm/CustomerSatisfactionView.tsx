
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Smile, Frown, Meh, MessageCircle, 
  TrendingUp, Activity, UserCheck, AlertOctagon,
  MessageSquare, ThumbsUp, ThumbsDown, Filter,
  Share2, Zap, ArrowRight, Heart
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, Sector, RadialBarChart, RadialBar, Legend
} from 'recharts';

// --- Types ---

interface FeedbackItem {
  id: string;
  customer: string;
  avatarColor: string;
  channel: 'Survey' | 'Email' | 'App' | 'Call';
  type: 'NPS' | 'CSAT' | 'Complaint';
  score: number; // 0-10 or 1-5
  comment: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  tags: string[];
  date: string;
  status: 'New' | 'Follow-up' | 'Closed';
}

interface DriverFactor {
  factor: string;
  impact: number; // Correlation coefficient equivalent 0-100
  satisfaction: number; // Current score 0-100
}

// --- Mock Data ---

const FEEDBACK_STREAM: FeedbackItem[] = [
  { id: 'FB-1024', customer: 'Shanghai Heavy Ind.', avatarColor: '#0ea5e9', channel: 'Survey', type: 'NPS', score: 9, comment: 'The new dashboard features are fantastic. Really helps our team.', sentiment: 'Positive', tags: ['Product', 'UI'], date: '10 mins ago', status: 'New' },
  { id: 'FB-1023', customer: 'Pacific Power Group', avatarColor: '#f59e0b', channel: 'Call', type: 'Complaint', score: 2, comment: 'Response time for ticket #8842 was too slow. We had downtime.', sentiment: 'Negative', tags: ['Support', 'SLA'], date: '1 hour ago', status: 'Follow-up' },
  { id: 'FB-1022', customer: 'AutoWorks GmbH', avatarColor: '#8b5cf6', channel: 'Email', type: 'CSAT', score: 4, comment: 'Good service overall, but documentation needs update.', sentiment: 'Neutral', tags: ['Docs', 'Service'], date: '3 hours ago', status: 'New' },
  { id: 'FB-1021', customer: 'Quantum Tech', avatarColor: '#10b981', channel: 'App', type: 'NPS', score: 10, comment: 'Best vendor we work with. Highly recommended.', sentiment: 'Positive', tags: ['Overall'], date: 'Yesterday', status: 'Closed' },
  { id: 'FB-1020', customer: 'North Star Logistics', avatarColor: '#ef4444', channel: 'Survey', type: 'NPS', score: 6, comment: 'Pricing is getting a bit high compared to competitors.', sentiment: 'Neutral', tags: ['Price'], date: 'Yesterday', status: 'New' },
];

const NPS_DATA = [
  { name: 'Promoters', value: 65, fill: '#10b981' },
  { name: 'Passives', value: 25, fill: '#f59e0b' },
  { name: 'Detractors', value: 10, fill: '#ef4444' },
];

const SATISFACTION_TREND = [
  { month: 'Sep', nps: 45, csat: 82 },
  { month: 'Oct', nps: 48, csat: 84 },
  { month: 'Nov', nps: 52, csat: 85 },
  { month: 'Dec', nps: 50, csat: 83 },
  { month: 'Jan', nps: 55, csat: 88 },
  { month: 'Feb', nps: 58, csat: 89 },
];

const KEY_DRIVERS: DriverFactor[] = [
  { factor: 'System Stability', impact: 95, satisfaction: 92 },
  { factor: 'Support Speed', impact: 88, satisfaction: 75 },
  { factor: 'Feature Richness', impact: 82, satisfaction: 88 },
  { factor: 'Ease of Use', impact: 75, satisfaction: 85 },
  { factor: 'Pricing Value', impact: 60, satisfaction: 65 },
];

const FOLLOW_UP_TASKS = [
  { id: 1, customer: 'Pacific Power Group', issue: 'SLA Breach Complaint', owner: 'Li Manager', due: 'Today 14:00' },
  { id: 2, customer: 'North Star Logistics', issue: 'Pricing Negotiation', owner: 'Sales Team', due: 'Tomorrow' },
];

// --- Components ---

const MetricCard = ({ title, value, sub, trend, color, icon: Icon }: any) => (
  <div className={`relative overflow-hidden bg-[#080c14] border border-slate-800 rounded-lg p-4 group hover:border-opacity-50 transition-all`} style={{borderColor: `${color}40`}}>
    <div className={`absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`} style={{color}}>
      <Icon size={64} />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs uppercase font-bold tracking-wider">
        <Icon size={14} style={{color}} /> {title}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white font-mono">{value}</span>
        {sub && <span className="text-xs text-slate-500">{sub}</span>}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        <span className={`${trend > 0 ? 'text-green-400' : 'text-red-400'} font-bold flex items-center`}>
          {trend > 0 ? '+' : ''}{trend}% <TrendingUp size={10} className="ml-1" />
        </span>
        <span className="text-slate-600">vs last month</span>
      </div>
    </div>
    <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-800">
      <div className="h-full transition-all duration-1000" style={{width: `${Math.abs(value)}%`, backgroundColor: color}}></div>
    </div>
  </div>
);

const SentimentBadge = ({ type }: { type: string }) => {
  const config = {
    'Positive': { color: 'text-green-400', bg: 'bg-green-900/20', icon: Smile },
    'Neutral': { color: 'text-yellow-400', bg: 'bg-yellow-900/20', icon: Meh },
    'Negative': { color: 'text-red-400', bg: 'bg-red-900/20', icon: Frown },
  }[type] || { color: 'text-slate-400', bg: 'bg-slate-800', icon: Meh };
  
  const Icon = config.icon;

  return (
    <span className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase ${config.bg} ${config.color}`}>
      <Icon size={12} /> {type}
    </span>
  );
};

export const CustomerSatisfactionView: React.FC = () => {
  const [filter, setFilter] = useState('All');

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & Vitals */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-indigo-900/50 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
               <Heart size={14} /> Customer Experience (CX)
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               客户体验 <span className="text-indigo-500">感知中心</span>
            </h1>
          </div>
          <div className="flex gap-2">
             <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 hover:text-white flex items-center gap-2">
                <Share2 size={12} /> Export Report
             </button>
             <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold shadow-lg transition-colors">
                Launch Survey
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <MetricCard title="NPS (Net Promoter Score)" value="58" sub="Excellent" trend={5.2} color="#10b981" icon={ThumbsUp} />
           <MetricCard title="CSAT (Satisfaction)" value="4.8" sub="/ 5.0" trend={1.5} color="#0ea5e9" icon={Smile} />
           <MetricCard title="CES (Effort Score)" value="1.8" sub="(Low is Good)" trend={-8.4} color="#8b5cf6" icon={Activity} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Live Feedback Stream */}
        <div className="w-full lg:w-[350px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                 <MessageSquare size={14} className="text-indigo-400"/> Live Feedback
              </h3>
              <div className="flex gap-1">
                 {['All', 'Alerts'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setFilter(t)}
                      className={`px-2 py-0.5 rounded text-[10px] transition-colors border ${filter === t ? 'bg-indigo-900/30 border-indigo-500 text-indigo-300' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                       {t}
                    </button>
                 ))}
              </div>
           </div>

           <div className="flex flex-col gap-3">
              {FEEDBACK_STREAM.map(item => (
                 <div key={item.id} className="p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-indigo-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style={{backgroundColor: item.avatarColor}}>
                             {item.customer.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-xs font-bold text-slate-200 line-clamp-1">{item.customer}</span>
                             <span className="text-[9px] text-slate-500">{item.channel} • {item.date}</span>
                          </div>
                       </div>
                       <SentimentBadge type={item.sentiment} />
                    </div>
                    
                    <div className="text-xs text-slate-300 leading-relaxed mb-2 pl-8 border-l-2 border-slate-800 group-hover:border-indigo-500/50 transition-colors">
                       "{item.comment}"
                    </div>

                    <div className="flex justify-between items-center pl-8">
                       <div className="flex gap-1">
                          {item.tags.map(tag => (
                             <span key={tag} className="text-[9px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">#{tag}</span>
                          ))}
                       </div>
                       {item.score !== undefined && (
                          <div className="text-[10px] font-mono">
                             <span className="text-slate-500">{item.type}: </span>
                             <span className="text-white font-bold">{item.score}</span>
                          </div>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* CENTER COLUMN: Analysis */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Row 1: NPS Breakdown & Trend */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
               
               <SciFiCard title="NPS 构成分析" subtitle="DISTRIBUTION" className="border-indigo-900/50">
                   <div className="flex items-center h-full">
                       <div className="w-1/2 h-full relative">
                           <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                   <Pie 
                                     data={NPS_DATA} 
                                     innerRadius={40} 
                                     outerRadius={60} 
                                     paddingAngle={5} 
                                     dataKey="value"
                                     startAngle={180}
                                     endAngle={0}
                                   >
                                       {NPS_DATA.map((entry, index) => (
                                           <Cell key={`cell-${index}`} fill={entry.fill} />
                                       ))}
                                   </Pie>
                               </PieChart>
                           </ResponsiveContainer>
                           <div className="absolute inset-0 flex items-center justify-center pt-8 flex-col pointer-events-none">
                               <span className="text-3xl font-bold text-white">58</span>
                               <span className="text-[10px] text-slate-500 uppercase">NPS Score</span>
                           </div>
                       </div>
                       <div className="flex-1 flex flex-col justify-center gap-3 pr-4">
                           {NPS_DATA.map((d, i) => (
                               <div key={i} className="flex flex-col gap-1">
                                   <div className="flex justify-between text-xs">
                                       <span className="text-slate-400">{d.name}</span>
                                       <span className="font-mono text-white">{d.value}%</span>
                                   </div>
                                   <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                       <div className="h-full" style={{width: `${d.value}%`, backgroundColor: d.fill}}></div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               </SciFiCard>

               <SciFiCard title="满意度趋势 (6 Months)" subtitle="NPS / CSAT" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={SATISFACTION_TREND}>
                               <defs>
                                   <linearGradient id="colorNpsTrend" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#10b981', fontSize: '12px'}} />
                               <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                               <Area type="monotone" dataKey="nps" stroke="#10b981" fill="url(#colorNpsTrend)" strokeWidth={2} name="NPS" />
                               <Area type="monotone" dataKey="csat" stroke="#0ea5e9" fill="none" strokeWidth={2} strokeDasharray="5 5" name="CSAT (x10)" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

           </div>

           {/* Row 2: Driver Analysis (Impact Matrix) */}
           <SciFiCard title="满意度驱动因子分析 (Key Drivers)" subtitle="IMPACT vs SCORE" className="flex-1 border-slate-800">
               <div className="flex flex-col h-full">
                   <div className="text-[10px] text-slate-500 mb-2">Identifying what matters most to customers. <span className="text-yellow-400">High Impact / Low Score = Critical Priority.</span></div>
                   <div className="flex-1 min-h-[200px]">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart 
                             data={KEY_DRIVERS} 
                             layout="vertical" 
                             margin={{top: 5, right: 30, left: 20, bottom: 5}}
                           >
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                               <XAxis type="number" stroke="#64748b" domain={[0, 100]} hide />
                               <YAxis dataKey="factor" type="category" stroke="#94a3b8" width={100} tick={{fontSize: 11}} />
                               <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#8b5cf6'}} />
                               <Legend />
                               <Bar dataKey="impact" name="Impact (Importance)" fill="#8b5cf6" barSize={10} radius={[0, 4, 4, 0]} />
                               <Bar dataKey="satisfaction" name="Current Score" fill="#0ea5e9" barSize={10} radius={[0, 4, 4, 0]} />
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Close The Loop */}
        <div className="w-full lg:w-[300px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Loop Tracker */}
           <SciFiCard title="闭环跟进 (Close Loop)" subtitle="ACTIONS" className="flex-1 border-red-900/30">
               <div className="flex flex-col gap-4 h-full">
                   {/* Summary Stats */}
                   <div className="grid grid-cols-2 gap-2">
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-700 text-center">
                           <div className="text-[10px] text-slate-500 uppercase">Open Detractors</div>
                           <div className="text-xl font-bold text-red-400">5</div>
                       </div>
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-700 text-center">
                           <div className="text-[10px] text-slate-500 uppercase">Responded (24h)</div>
                           <div className="text-xl font-bold text-green-400">92%</div>
                       </div>
                   </div>

                   {/* Task List */}
                   <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                       <div className="text-xs font-bold text-slate-400 uppercase mb-1">Priority Tasks</div>
                       {FOLLOW_UP_TASKS.map(task => (
                           <div key={task.id} className="p-2.5 bg-red-900/10 border border-red-900/30 rounded group hover:bg-red-900/20 transition-colors cursor-pointer">
                               <div className="flex justify-between mb-1">
                                   <span className="text-xs font-bold text-white">{task.customer}</span>
                                   <AlertOctagon size={12} className="text-red-500" />
                               </div>
                               <div className="text-[10px] text-slate-300 mb-2">{task.issue}</div>
                               <div className="flex justify-between items-center text-[9px] text-slate-500">
                                   <span className="flex items-center gap-1"><UserCheck size={8}/> {task.owner}</span>
                                   <span className="text-red-300">Due: {task.due}</span>
                               </div>
                           </div>
                       ))}
                   </div>

                   <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded border border-slate-600 transition-colors flex items-center justify-center gap-2">
                       View All Open Cases <ArrowRight size={12}/>
                   </button>
               </div>
           </SciFiCard>

           {/* Voice of Customer (AI Summary) */}
           <SciFiCard title="客户之声洞察 (VoC)" subtitle="AI SUMMARY" className="border-indigo-900/50">
               <div className="space-y-3">
                   <div className="p-3 bg-indigo-900/10 border border-indigo-500/20 rounded">
                       <div className="flex items-center gap-2 mb-1">
                           <Zap size={12} className="text-yellow-400" />
                           <span className="text-xs font-bold text-indigo-200">Top Complaint</span>
                       </div>
                       <p className="text-[10px] text-slate-300 leading-relaxed">
                           "System latency during peak hours" mentioned by 15% of enterprise users this week.
                       </p>
                   </div>
                   <div className="p-3 bg-green-900/10 border border-green-500/20 rounded">
                       <div className="flex items-center gap-2 mb-1">
                           <ThumbsUp size={12} className="text-green-400" />
                           <span className="text-xs font-bold text-green-200">Top Praise</span>
                       </div>
                       <p className="text-[10px] text-slate-300 leading-relaxed">
                           New mobile app interface received 98% positive sentiment in beta group.
                       </p>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
