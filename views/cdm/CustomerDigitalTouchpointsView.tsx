
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Fingerprint, MousePointer, Globe, Smartphone, 
  Monitor, Wifi, MapPin, Clock, ArrowRight, 
  Search, Filter, Activity, Zap, Layers, 
  Terminal, Share2, Eye, LogIn, LogOut, Radio
} from 'lucide-react';
import { 
  Sankey, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Cell,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- Types ---

interface TouchpointEvent {
  id: string;
  user: string;
  company: string;
  action: string;
  channel: 'Web' | 'Mobile' | 'IoT' | 'API';
  timestamp: string;
  duration: number; // seconds
  engagementScore: number; // 0-100
  device: string;
  ip: string;
  location: string;
}

interface JourneyNode {
  name: string;
}

interface JourneyLink {
  source: number;
  target: number;
  value: number;
}

// --- Mock Data ---

const LIVE_EVENTS: TouchpointEvent[] = [
  { id: 'EVT-9921', user: 'Li Wei', company: 'Shanghai Heavy', action: 'Export Report', channel: 'Web', timestamp: '10:42:05', duration: 120, engagementScore: 85, device: 'Chrome / Win10', ip: '210.12.x.x', location: 'Shanghai' },
  { id: 'EVT-9922', user: 'Sarah J.', company: 'Pacific Power', action: 'View Dashboard', channel: 'Mobile', timestamp: '10:41:50', duration: 45, engagementScore: 60, device: 'Safari / iOS', ip: '192.168.x.x', location: 'Beijing' },
  { id: 'EVT-9923', user: 'System', company: 'AutoWorks', action: 'API Data Sync', channel: 'API', timestamp: '10:41:12', duration: 0, engagementScore: 90, device: 'Server', ip: '10.0.0.5', location: 'Frankfurt' },
  { id: 'EVT-9924', user: 'Mike Chen', company: 'Quantum Tech', action: 'Config Alert', channel: 'Web', timestamp: '10:40:55', duration: 300, engagementScore: 95, device: 'Edge / Win11', ip: '172.16.x.x', location: 'Shenzhen' },
  { id: 'EVT-9925', user: 'Guest_02', company: 'Unknown', action: 'Landing Page', channel: 'Web', timestamp: '10:40:10', duration: 10, engagementScore: 20, device: 'Firefox / Mac', ip: '58.21.x.x', location: 'Hangzhou' },
  { id: 'EVT-9926', user: 'IoT_Gateway', company: 'North Star', action: 'Telemetry Push', channel: 'IoT', timestamp: '10:39:45', duration: 0, engagementScore: 100, device: 'Embedded', ip: '10.2.1.1', location: 'Wuhan' },
];

const SANKEY_DATA = {
  nodes: [
    { name: 'Landing (入口)' }, // 0
    { name: 'Login (登录)' },   // 1
    { name: 'Dashboard (概览)' }, // 2
    { name: 'Asset Detail (资产)' }, // 3
    { name: 'Report (报表)' }, // 4
    { name: 'Alerts (告警)' }, // 5
    { name: 'Exit (离开)' },   // 6
  ],
  links: [
    { source: 0, target: 1, value: 800 },
    { source: 0, target: 6, value: 200 }, // Bounce
    { source: 1, target: 2, value: 750 },
    { source: 1, target: 6, value: 50 },
    { source: 2, target: 3, value: 400 },
    { source: 2, target: 4, value: 200 },
    { source: 2, target: 5, value: 100 },
    { source: 2, target: 6, value: 50 },
    { source: 3, target: 6, value: 300 }, // Finished task
    { source: 3, target: 4, value: 100 },
    { source: 4, target: 6, value: 250 },
    { source: 5, target: 3, value: 80 },
  ]
};

const SCATTER_DATA = Array.from({ length: 50 }, (_, i) => ({
  x: Math.random() * 600, // Duration (s)
  y: Math.random() * 100, // Engagement Score
  z: Math.random() * 1000, // Activity Count (Bubble Size)
  type: Math.random() > 0.5 ? 'Web' : Math.random() > 0.5 ? 'Mobile' : 'API'
}));

const CHANNEL_RADAR = [
  { subject: '访问频次', A: 90, fullMark: 100 },
  { subject: '停留时长', A: 75, fullMark: 100 },
  { subject: '功能深度', A: 60, fullMark: 100 },
  { subject: '转化率', A: 85, fullMark: 100 },
  { subject: '回访率', A: 80, fullMark: 100 },
];

const USER_TIMELINE = [
  { time: '10:42:05', action: 'Export Report', detail: 'Monthly_Ops.pdf' },
  { time: '10:41:20', action: 'Filter Data', detail: 'Range: Last 30 Days' },
  { time: '10:38:45', action: 'View Asset', detail: 'Gas Turbine #04' },
  { time: '10:38:10', action: 'Dashboard Load', detail: 'Latency: 120ms' },
  { time: '10:38:05', action: 'Login Success', detail: '2FA Verified' },
];

// --- Components ---

const ChannelIcon = ({ type }: { type: string }) => {
  switch(type) {
    case 'Web': return <Monitor size={14} className="text-cyan-400" />;
    case 'Mobile': return <Smartphone size={14} className="text-purple-400" />;
    case 'IoT': return <Wifi size={14} className="text-emerald-400" />;
    case 'API': return <Terminal size={14} className="text-amber-400" />;
    default: return <Globe size={14} className="text-slate-400" />;
  }
};

const MetricBlock = ({ label, value, sub, icon: Icon, color }: any) => (
  <div className="bg-[#0b101e]/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between group hover:border-slate-600 transition-all">
    <div>
      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">{label}</div>
      <div className="text-xl font-mono font-bold text-white">{value}</div>
      {sub && <div className="text-[9px] text-slate-400 mt-1">{sub}</div>}
    </div>
    <div className={`p-2 rounded-full bg-slate-900 border border-slate-800 group-hover:scale-110 transition-transform`} style={{color: color}}>
       <Icon size={18} />
    </div>
  </div>
);

export const CustomerDigitalTouchpointsView: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState(LIVE_EVENTS[0].id);
  const activeEvent = LIVE_EVENTS.find(e => e.id === selectedEventId) || LIVE_EVENTS[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Command Header */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-cyan-900/50 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
               <Fingerprint size={14} className="animate-pulse" /> Digital Footprint Analytics
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               客户数字化 <span className="text-cyan-500">触点与访问轨迹</span>
            </h1>
          </div>
          <div className="flex gap-2 text-xs text-slate-400">
             <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Live Tracking Active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
           <MetricBlock label="Active Sessions" value="1,248" sub="+12% Peak" icon={Activity} color="#0ea5e9" />
           <MetricBlock label="Avg Duration" value="08:45" sub="min:sec" icon={Clock} color="#f59e0b" />
           <MetricBlock label="Touchpoints" value="15.4K" sub="Daily Events" icon={MousePointer} color="#8b5cf6" />
           <MetricBlock label="Bounce Rate" value="32.5%" sub="-2.1% Improvement" icon={LogOut} color="#ef4444" />
           <MetricBlock label="Conversion" value="4.8%" sub="Goal Completion" icon={Zap} color="#10b981" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Real-time Signal Stream */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex items-center justify-between px-1 mb-2">
               <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Radio size={14}/> Live Signals</span>
               <div className="flex gap-1">
                   <button className="p-1 hover:bg-slate-800 rounded"><Filter size={12} className="text-slate-500"/></button>
                   <button className="p-1 hover:bg-slate-800 rounded"><Search size={12} className="text-slate-500"/></button>
               </div>
           </div>

           <div className="flex flex-col gap-2">
               {LIVE_EVENTS.map(evt => (
                   <div 
                     key={evt.id}
                     onClick={() => setSelectedEventId(evt.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedEventId === evt.id 
                            ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[inset_4px_0_0_#0ea5e9]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-1">
                           <div className="flex items-center gap-2">
                               <ChannelIcon type={evt.channel} />
                               <span className={`font-bold text-sm ${selectedEventId === evt.id ? 'text-white' : 'text-slate-300'}`}>{evt.user}</span>
                           </div>
                           <span className="text-[10px] font-mono text-slate-500">{evt.timestamp}</span>
                       </div>
                       
                       <div className="text-xs text-cyan-200 truncate mb-1">{evt.action}</div>
                       <div className="text-[10px] text-slate-500 truncate">{evt.company} • {evt.location}</div>
                   </div>
               ))}
                <div className="text-[10px] text-center text-slate-600 animate-pulse mt-2">-- Receiving Stream --</div>
           </div>
        </div>

        {/* CENTER COLUMN: The Journey Nexus */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* 1. Sankey Diagram (Flow) */}
           <SciFiCard title="用户旅程流向 (Journey Flow)" subtitle="PATH ANALYSIS" className="h-[350px] border-cyan-900/50 bg-[#06080e]" noPadding>
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <Sankey
                         data={SANKEY_DATA}
                         node={{ stroke: '#0ea5e9', strokeWidth: 0, fill: '#0ea5e9' }} // Cyan Nodes
                         link={{ stroke: '#334155', fill: 'none' }}
                         margin={{ left: 20, right: 20, top: 20, bottom: 20 }}
                       >
                         <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9', color: '#fff'}} />
                       </Sankey>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* 2. Session Cluster (Scatter) */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[300px]">
               <SciFiCard title="会话深度聚类" subtitle="ENGAGEMENT CLUSTER" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                               <XAxis type="number" dataKey="x" name="Duration" unit="s" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis type="number" dataKey="y" name="Score" unit="" stroke="#64748b" tick={{fontSize: 10}} />
                               <ZAxis type="number" dataKey="z" range={[20, 200]} name="Events" />
                               <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#0ea5e9'}} />
                               <Scatter name="Sessions" data={SCATTER_DATA}>
                                   {SCATTER_DATA.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.type === 'Web' ? '#0ea5e9' : entry.type === 'Mobile' ? '#f59e0b' : '#10b981'} fillOpacity={0.6} />
                                   ))}
                               </Scatter>
                           </ScatterChart>
                       </ResponsiveContainer>
                       <div className="absolute bottom-2 right-2 flex gap-3 text-[10px] text-slate-400">
                           <span className="flex items-center gap-1"><div className="w-2 h-2 bg-[#0ea5e9] rounded-full"></div> Web</span>
                           <span className="flex items-center gap-1"><div className="w-2 h-2 bg-[#f59e0b] rounded-full"></div> Mobile</span>
                           <span className="flex items-center gap-1"><div className="w-2 h-2 bg-[#10b981] rounded-full"></div> API</span>
                       </div>
                   </div>
               </SciFiCard>

               <SciFiCard title="流量时段热度" subtitle="24H HEAT" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={Array.from({length: 24}, (_,i) => ({ time: i, traffic: Math.random()*100 }))}>
                               <defs>
                                   <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#8b5cf6'}} />
                               <Area type="monotone" dataKey="traffic" stroke="#8b5cf6" fill="url(#colorTraffic)" strokeWidth={2} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>
           </div>
        </div>

        {/* RIGHT COLUMN: Identity Inspector */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* User Profile Card */}
           <SciFiCard title="用户数字画像" subtitle="IDENTITY" className="border-cyan-900/50 bg-[#080b16]">
               <div className="flex flex-col gap-4 p-2">
                   <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                       <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-lg font-bold text-white shadow-lg border border-cyan-400/30">
                           {activeEvent.user.charAt(0)}
                       </div>
                       <div>
                           <div className="text-lg font-bold text-white">{activeEvent.user}</div>
                           <div className="text-xs text-cyan-400">{activeEvent.company}</div>
                       </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3 text-xs">
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                           <div className="text-[10px] text-slate-500 uppercase">Device</div>
                           <div className="text-slate-300 truncate" title={activeEvent.device}>{activeEvent.device}</div>
                       </div>
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                           <div className="text-[10px] text-slate-500 uppercase">Location</div>
                           <div className="text-slate-300 flex items-center gap-1"><MapPin size={10} /> {activeEvent.location}</div>
                       </div>
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                           <div className="text-[10px] text-slate-500 uppercase">IP Address</div>
                           <div className="text-slate-300 font-mono">{activeEvent.ip}</div>
                       </div>
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                           <div className="text-[10px] text-slate-500 uppercase">Engagement</div>
                           <div className="text-green-400 font-bold">{activeEvent.engagementScore} / 100</div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Session Timeline */}
           <SciFiCard title="当前会话轨迹" subtitle="SESSION LOG" className="flex-1 border-slate-800">
               <div className="relative pl-4 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 h-full overflow-y-auto custom-scrollbar">
                   {USER_TIMELINE.map((step, i) => (
                       <div key={i} className="relative">
                           <div className={`absolute -left-[13px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-[#020408] z-10 
                               ${i===0 ? 'border-cyan-500 shadow-[0_0_8px_cyan]' : 'border-slate-600'}
                           `}></div>
                           <div className="flex flex-col gap-1">
                               <div className="flex justify-between items-center">
                                   <span className={`text-xs font-bold ${i===0 ? 'text-white' : 'text-slate-400'}`}>{step.action}</span>
                                   <span className="text-[10px] font-mono text-slate-600">{step.time}</span>
                               </div>
                               <div className="text-[10px] text-slate-500 bg-slate-900/30 px-2 py-1 rounded border border-slate-800/50">
                                   {step.detail}
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Channel Preference Radar */}
           <SciFiCard title="渠道偏好分析" subtitle="PREFERENCE" className="h-48 border-slate-800">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="60%" data={CHANNEL_RADAR}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="User" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#f59e0b', fontSize: '10px'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
