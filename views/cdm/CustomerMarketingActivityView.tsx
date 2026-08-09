
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Megaphone, Target, Users, Calendar, 
  MousePointer, Share2, MessageCircle, Video,
  MapPin, TrendingUp, Filter, ArrowRight,
  UserPlus, Mail, Presentation, Award,
  Globe, DollarSign
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, FunnelChart, Funnel, LabelList, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';

// --- Types ---

interface Campaign {
  id: string;
  name: string;
  type: 'Event' | 'Webinar' | 'Digital' | 'ABM';
  status: 'Active' | 'Planned' | 'Completed';
  date: string;
  reach: number;
  engagementScore: number; // 0-100
}

interface ActivityLog {
  id: string;
  time: string;
  customer: string;
  action: string;
  channel: string;
  score: number; // Lead Score impact
}

// --- Mock Data ---

const CAMPAIGNS: Campaign[] = [
  { id: 'CMP-2401', name: '2024 Global Industrial Expo', type: 'Event', status: 'Completed', date: '2024-01-15', reach: 4500, engagementScore: 92 },
  { id: 'CMP-2403', name: 'Smart Hydraulics Webinar Series', type: 'Webinar', status: 'Active', date: '2024-03-10', reach: 1200, engagementScore: 85 },
  { id: 'CMP-2404', name: 'Q2 New Product Launch (Turbine-X)', type: 'Digital', status: 'Active', date: '2024-04-01', reach: 8500, engagementScore: 78 },
  { id: 'CMP-2402', name: 'Strategic Account Summit (Energy)', type: 'ABM', status: 'Planned', date: '2024-05-20', reach: 50, engagementScore: 0 },
];

const ENGAGEMENT_TREND = [
  { day: 'Mon', online: 120, offline: 20 },
  { day: 'Tue', online: 150, offline: 15 },
  { day: 'Wed', online: 180, offline: 40 },
  { day: 'Thu', online: 220, offline: 35 },
  { day: 'Fri', online: 190, offline: 80 }, // Event day
  { day: 'Sat', online: 90, offline: 10 },
  { day: 'Sun', online: 60, offline: 5 },
];

const FUNNEL_DATA = [
  { value: 5000, name: '触达 (Reach)', fill: '#6366f1' },
  { value: 1200, name: '互动 (Engaged)', fill: '#8b5cf6' },
  { value: 450, name: '意向 (MQL)', fill: '#d946ef' },
  { value: 85, name: '商机 (SQL)', fill: '#ec4899' },
  { value: 24, name: '成交 (Deal)', fill: '#10b981' },
];

const LEAD_RADAR = [
  { subject: '互动频率', A: 95, fullMark: 100 },
  { subject: '决策权重', A: 80, fullMark: 100 },
  { subject: '预算匹配', A: 60, fullMark: 100 },
  { subject: '品牌偏好', A: 90, fullMark: 100 },
  { subject: '需求紧迫', A: 75, fullMark: 100 },
];

const LIVE_STREAM: ActivityLog[] = [
  { id: 'L-01', time: '10:42:15', customer: 'Shanghai Heavy Ind.', action: 'Downloaded Whitepaper: "Green Energy"', channel: 'Website', score: +10 },
  { id: 'L-02', time: '10:40:02', customer: 'Pacific Power Group', action: 'Attended Session: "Predictive Maint"', channel: 'Webinar', score: +25 },
  { id: 'L-03', time: '10:35:55', customer: 'AutoWorks GmbH', action: 'Clicked Email: "Q2 Pricing"', channel: 'EDM', score: +5 },
  { id: 'L-04', time: '10:28:10', customer: 'Quantum Tech', action: 'Visited Booth: #A12 @ Expo', channel: 'Offline', score: +30 },
  { id: 'L-05', time: '10:15:33', customer: 'North Star Logistics', action: 'Requested Demo', channel: 'Form', score: +50 },
];

// --- Components ---

const CampaignTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'Event': return <MapPin size={14} className="text-purple-400" />;
    case 'Webinar': return <Video size={14} className="text-blue-400" />;
    case 'ABM': return <Target size={14} className="text-red-400" />;
    default: return <Share2 size={14} className="text-green-400" />;
  }
};

const ScoreBadge = ({ score }: { score: number }) => (
  <div className={`flex items-center gap-1 text-xs font-bold ${score > 0 ? 'text-green-400' : 'text-slate-500'}`}>
    {score > 0 ? '+' : ''}{score} pts
  </div>
);

export const CustomerMarketingActivityView: React.FC = () => {
  const [selectedCampaignId, setSelectedCampaignId] = useState(CAMPAIGNS[1].id);
  const activeCampaign = CAMPAIGNS.find(c => c.id === selectedCampaignId) || CAMPAIGNS[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & Global KPIs */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-purple-900/50 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-purple-400 mb-1 uppercase tracking-wider">
               <Megaphone size={14} /> Marketing Intelligence Center
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               客户营销活动 <span className="text-purple-500">参与全景记录</span>
            </h1>
          </div>
          
          <div className="flex gap-2">
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300">
                <Calendar size={14} /> <span>Q1 2024</span>
             </div>
             <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                Create Campaign
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
                { label: 'Marketing Reach', val: '45.2K', sub: '+12% MoM', color: '#8b5cf6', icon: Globe },
                { label: 'Avg Engagement', val: '68%', sub: 'High', color: '#0ea5e9', icon: MousePointer },
                { label: 'MQL Conversion', val: '4.8%', sub: '+0.5%', color: '#ec4899', icon: Filter },
                { label: 'Cost Per Lead', val: '¥ 450', sub: '-10%', color: '#10b981', icon: DollarSign },
            ].map((stat, i) => (
                <div key={i} className="bg-slate-900/40 border border-slate-800 p-3 rounded flex items-center justify-between group hover:border-purple-500/30 transition-all">
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">{stat.label}</div>
                        <div className="text-2xl font-mono font-bold text-white">{stat.val}</div>
                        <div className="text-[10px] font-bold" style={{color: stat.color}}>{stat.sub}</div>
                    </div>
                    <div className="p-2 rounded-full bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform">
                        <stat.icon size={18} style={{color: stat.color}} />
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Campaign Command */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex justify-between items-center px-1">
               <span className="text-xs font-bold text-slate-400 uppercase">Active Campaigns</span>
               <Filter size={14} className="text-slate-500 cursor-pointer hover:text-white" />
           </div>

           <div className="flex flex-col gap-3">
               {CAMPAIGNS.map(cmp => (
                   <div 
                     key={cmp.id}
                     onClick={() => setSelectedCampaignId(cmp.id)}
                     className={`p-4 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedCampaignId === cmp.id 
                            ? 'bg-purple-950/30 border-purple-500/50 shadow-[inset_4px_0_0_#a855f7]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-2">
                               <CampaignTypeIcon type={cmp.type} />
                               <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border 
                                  ${cmp.status === 'Active' ? 'bg-green-900/20 border-green-800 text-green-400' : 
                                    cmp.status === 'Completed' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-yellow-900/20 border-yellow-800 text-yellow-400'}
                               `}>{cmp.status}</span>
                           </div>
                           <span className="text-[10px] text-slate-500 font-mono">{cmp.date}</span>
                       </div>
                       
                       <h3 className={`text-sm font-bold mb-3 ${selectedCampaignId === cmp.id ? 'text-white' : 'text-slate-300'}`}>
                           {cmp.name}
                       </h3>
                       
                       <div className="flex items-center justify-between text-[10px]">
                           <span className="text-slate-500">Reach: <span className="text-white">{cmp.reach}</span></span>
                           <div className="flex items-center gap-1">
                               <span className="text-slate-500">Score:</span>
                               <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                   <div className="h-full bg-purple-500" style={{width: `${cmp.engagementScore}%`}}></div>
                               </div>
                           </div>
                       </div>
                   </div>
               ))}
           </div>

           <div className="mt-auto p-4 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-purple-500/20 rounded">
               <div className="flex items-center gap-2 text-purple-300 text-xs font-bold mb-2">
                   <Award size={14} /> Top Performer
               </div>
               <div className="text-sm font-bold text-white">Smart Hydraulics Webinar</div>
               <div className="text-[10px] text-slate-400 mt-1">Highest MQL Conversion (12%)</div>
           </div>
        </div>

        {/* CENTER COLUMN: Signal Processing */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Top: Engagement Waveform */}
           <SciFiCard title="互动声浪趋势 (Engagement Wave)" subtitle="ONLINE vs OFFLINE" className="h-[320px] border-purple-900/50 bg-[#0a0714]" noPadding>
               <div className="w-full h-full p-4 flex flex-col">
                   <div className="flex justify-between items-center mb-2 px-2">
                       <h2 className="text-sm font-bold text-white flex items-center gap-2">
                           {activeCampaign.name} <span className="text-xs text-slate-500 font-normal">Activity Analysis</span>
                       </h2>
                   </div>
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={ENGAGEMENT_TREND} margin={{top:10, right:10, left:0, bottom:0}}>
                               <defs>
                                   <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                                       <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                   </linearGradient>
                                   <linearGradient id="colorOffline" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#f472b6" stopOpacity={0.4}/>
                                       <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#8b5cf6', color: '#fff'}} />
                               <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                               <Area type="monotone" dataKey="online" stackId="1" stroke="#8b5cf6" fill="url(#colorOnline)" name="Digital Interactions" />
                               <Area type="monotone" dataKey="offline" stackId="1" stroke="#f472b6" fill="url(#colorOffline)" name="Physical/Event" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </SciFiCard>

           {/* Bottom: The Interaction Stream */}
           <SciFiCard title="客户行为信号流 (Signal Stream)" subtitle="REAL-TIME LOG" className="flex-1 border-slate-800">
               <div className="flex flex-col h-full overflow-hidden">
                   <div className="grid grid-cols-12 text-[10px] text-slate-500 uppercase font-bold border-b border-slate-800 pb-2 mb-2 px-2">
                       <div className="col-span-2">Time</div>
                       <div className="col-span-3">Customer</div>
                       <div className="col-span-5">Action</div>
                       <div className="col-span-2 text-right">Impact</div>
                   </div>
                   <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                       {LIVE_STREAM.map((log) => (
                           <div key={log.id} className="grid grid-cols-12 items-center p-2 rounded hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700/50 group">
                               <div className="col-span-2 text-xs font-mono text-slate-400">{log.time}</div>
                               <div className="col-span-3 text-xs font-bold text-white truncate pr-2">{log.customer}</div>
                               <div className="col-span-5">
                                   <div className="text-xs text-slate-200 truncate">{log.action}</div>
                                   <div className="text-[9px] text-slate-500 flex items-center gap-1">
                                       Source: <span className="text-cyan-400">{log.channel}</span>
                                   </div>
                               </div>
                               <div className="col-span-2 text-right">
                                   <ScoreBadge score={log.score} />
                               </div>
                           </div>
                       ))}
                       <div className="p-2 text-center">
                           <span className="text-[10px] text-slate-600 animate-pulse">Scanning for signals...</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Conversion Intelligence */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Marketing Funnel */}
           <SciFiCard title="活动转化漏斗" subtitle="CONVERSION" className="h-[300px] border-pink-900/30">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <FunnelChart>
                           <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#d946ef', color: '#fff'}} />
                           <Funnel
                               data={FUNNEL_DATA}
                               dataKey="value"
                               nameKey="name"
                               isAnimationActive
                           >
                               <LabelList position="right" fill="#fff" stroke="none" dataKey="name" fontSize={10} />
                           </Funnel>
                       </FunnelChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Top Lead Radar */}
           <SciFiCard title="高意向客户画像" subtitle="TOP LEAD" className="border-indigo-900/50">
               <div className="flex flex-col h-full">
                   <div className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700 rounded mb-4">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">SH</div>
                       <div>
                           <div className="text-sm font-bold text-white">Shanghai Heavy Ind.</div>
                           <div className="text-[10px] text-slate-400">Score: 92 (Hot)</div>
                       </div>
                       <Award className="ml-auto text-yellow-400" size={20} />
                   </div>

                   <div className="flex-1 h-48 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={LEAD_RADAR}>
                               <PolarGrid stroke="#334155" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                               <Radar name="Lead Score" dataKey="A" stroke="#d946ef" strokeWidth={2} fill="#d946ef" fillOpacity={0.3} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#d946ef', color: '#fff'}} />
                           </RadarChart>
                       </ResponsiveContainer>
                   </div>

                   <div className="flex gap-2 mt-2">
                       <button className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors">
                           <Mail size={12} /> Contact
                       </button>
                       <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors">
                           View Profile
                       </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
