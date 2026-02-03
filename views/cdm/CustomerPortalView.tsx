
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Globe, Users, Layout, Zap, 
  MessageSquare, Shield, Key, Activity, 
  Radio, MousePointer, Search, Bell, 
  CheckCircle2, XCircle, LogIn, Code,
  Smartphone, Monitor, Server, ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, LineChart, Line
} from 'recharts';

// --- Mock Data ---

const PORTAL_STATS = [
  { label: '当前在线用户', value: 142, unit: 'Users', trend: '+12%', color: '#0ea5e9', icon: Users },
  { label: '今日自助办理量', value: 856, unit: 'Tasks', trend: '+5%', color: '#10b981', icon: Zap },
  { label: '服务分流率 (Deflection)', value: 78.5, unit: '%', trend: '+2.1%', color: '#8b5cf6', icon: Activity },
  { label: 'API 调用请求', value: '2.4M', unit: 'Reqs', trend: '+15%', color: '#f59e0b', icon: Code },
];

const TRAFFIC_DATA = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  visitors: Math.floor(Math.random() * 200) + 50,
  apiCalls: Math.floor(Math.random() * 5000) + 1000,
}));

const DEFLECTION_DATA = [
  { name: '知识库搜索', value: 4500, fill: '#3b82f6' },
  { name: '文档下载', value: 2100, fill: '#0ea5e9' },
  { name: '自助诊断', value: 1200, fill: '#6366f1' },
  { name: '提交工单 (人工)', value: 800, fill: '#ef4444' }, // Goal is to keep this low
];

const RECENT_SESSIONS = [
  { id: 'S-102', user: 'Li Wei', company: 'Shanghai Heavy', page: 'Asset Dashboard', device: 'Desktop', ip: '202.108.x.x', status: 'Active' },
  { id: 'S-105', user: 'Sarah J.', company: 'Global Logistics', page: 'API Docs', device: 'Tablet', ip: '192.168.x.x', status: 'Idle' },
  { id: 'S-109', user: 'System_Bot', company: 'Pacific Power', page: 'Webhook Endpoint', device: 'Server', ip: '10.0.0.5', status: 'Active' },
  { id: 'S-112', user: 'Wang D.', company: 'AutoWorks', page: 'Order Tracking', device: 'Mobile', ip: '172.16.x.x', status: 'Active' },
];

const PENDING_ACCESS = [
  { id: 'REQ-01', user: 'Chen Gang', company: 'New Energy Corp', role: 'Engineer', date: '2024-03-21' },
  { id: 'REQ-02', user: 'Mike Ross', company: 'Partner Ltd.', role: 'Procurement', date: '2024-03-20' },
];

const API_HEALTH = [
  { name: 'Auth', latency: 45, status: 'Healthy' },
  { name: 'Assets', latency: 120, status: 'Healthy' },
  { name: 'Orders', latency: 85, status: 'Healthy' },
  { name: 'IoT Stream', latency: 250, status: 'Warning' },
];

// --- Sub-Components ---

const PortalMap = () => (
  <div className="relative w-full h-full bg-[#050810] overflow-hidden rounded border border-slate-800">
    <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)',
        backgroundSize: '20px 20px'
    }}></div>
    
    {/* Stylized World Map Dots */}
    <svg className="w-full h-full absolute inset-0 pointer-events-none">
       {/* Asia Cluster */}
       <circle cx="70%" cy="40%" r="2" fill="#0ea5e9" className="animate-ping" style={{animationDuration:'3s'}} />
       <circle cx="72%" cy="38%" r="1.5" fill="#0ea5e9" />
       <circle cx="68%" cy="42%" r="1.5" fill="#0ea5e9" />
       <circle cx="75%" cy="45%" r="1.5" fill="#0ea5e9" />
       
       {/* Europe Cluster */}
       <circle cx="50%" cy="30%" r="2" fill="#8b5cf6" className="animate-ping" style={{animationDuration:'4s'}} />
       <circle cx="48%" cy="28%" r="1.5" fill="#8b5cf6" />
       <circle cx="52%" cy="32%" r="1.5" fill="#8b5cf6" />

       {/* US Cluster */}
       <circle cx="20%" cy="35%" r="2" fill="#f59e0b" className="animate-ping" style={{animationDuration:'5s'}} />
       <circle cx="22%" cy="38%" r="1.5" fill="#f59e0b" />
       
       {/* Connecting Lines */}
       <path d="M20% 35% Q 45% 10% 70% 40%" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.3" />
       <path d="M50% 30% Q 60% 50% 70% 40%" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.3" />
    </svg>
    
    <div className="absolute bottom-2 left-2 text-[10px] text-cyan-500 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-800">
       LIVE ACCESS MAP
    </div>
  </div>
);

export const CustomerPortalView: React.FC = () => {
  const [announcement, setAnnouncement] = useState('系统将于本周六凌晨 02:00 进行例行维护，预计耗时 2 小时。');

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0d091f] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <Layout size={14} /> Self-Service Portal Admin
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户自助服务平台 <span className="text-indigo-500">与门户管理</span>
          </h1>
        </div>
        
        <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-400">
                <Globe size={14} className="text-green-500" />
                <span>Portal Status: Online</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]">
               <Bell size={14} /> 发布公告
            </button>
        </div>
      </div>

      {/* KPI Deck */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {PORTAL_STATS.map((stat, i) => (
             <div key={i} className="relative overflow-hidden bg-slate-900/40 border border-slate-800 p-4 rounded-lg group hover:border-indigo-500/30 transition-all">
                 <div className="flex justify-between items-start">
                     <div>
                         <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">{stat.label}</div>
                         <div className="flex items-baseline gap-1">
                             <span className="text-2xl font-mono font-bold text-white">{stat.value}</span>
                             <span className="text-xs text-slate-400">{stat.unit}</span>
                         </div>
                     </div>
                     <div className="p-2 rounded bg-slate-800 text-slate-400 group-hover:text-white transition-colors">
                         <stat.icon size={18} style={{ color: stat.color }} />
                     </div>
                 </div>
                 <div className="mt-2 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                     <div className="h-full transition-all duration-1000" style={{ width: '70%', backgroundColor: stat.color }}></div>
                 </div>
             </div>
         ))}
      </div>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Traffic & Identity */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           {/* Access Management */}
           <SciFiCard title="访问权限审批" subtitle="PENDING" className="border-indigo-900/50">
               <div className="flex flex-col gap-3">
                   {PENDING_ACCESS.map(req => (
                       <div key={req.id} className="p-3 bg-slate-900/40 border border-slate-800 rounded flex flex-col gap-2">
                           <div className="flex justify-between items-start">
                               <div className="flex items-center gap-2">
                                   <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white">
                                       {req.user.charAt(0)}
                                   </div>
                                   <div>
                                       <div className="text-xs font-bold text-white">{req.user}</div>
                                       <div className="text-[10px] text-slate-500">{req.company}</div>
                                   </div>
                               </div>
                               <span className="text-[9px] text-slate-500">{req.date}</span>
                           </div>
                           <div className="flex gap-2 mt-1">
                               <button className="flex-1 py-1 bg-green-900/20 border border-green-900/50 text-green-400 text-[10px] rounded hover:bg-green-900/40 flex items-center justify-center gap-1">
                                   <CheckCircle2 size={10} /> Approve
                               </button>
                               <button className="flex-1 py-1 bg-red-900/20 border border-red-900/50 text-red-400 text-[10px] rounded hover:bg-red-900/40 flex items-center justify-center gap-1">
                                   <XCircle size={10} /> Reject
                               </button>
                           </div>
                       </div>
                   ))}
                   {PENDING_ACCESS.length === 0 && <div className="text-center text-xs text-slate-500 py-4">No pending requests</div>}
               </div>
           </SciFiCard>

           {/* Live Sessions */}
           <SciFiCard title="实时会话监控" subtitle="LIVE" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-2">
                   {RECENT_SESSIONS.map(session => (
                       <div key={session.id} className="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded transition-colors text-xs border-b border-slate-800/50 last:border-0">
                           <div className="flex items-center gap-2">
                               <div className={`w-1.5 h-1.5 rounded-full ${session.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                               <div className="flex flex-col">
                                   <span className="text-slate-200 font-bold">{session.user}</span>
                                   <span className="text-[10px] text-slate-500">{session.page}</span>
                               </div>
                           </div>
                           <div className="text-right flex flex-col items-end">
                               <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                   {session.device === 'Mobile' ? <Smartphone size={10}/> : <Monitor size={10}/>} {session.device}
                               </span>
                               <span className="text-[9px] text-slate-600 font-mono">{session.ip}</span>
                           </div>
                       </div>
                   ))}
               </div>
               <button className="w-full mt-auto py-2 border border-dashed border-slate-700 text-slate-500 text-xs rounded hover:text-white hover:border-indigo-500 transition-colors">
                   View All Sessions
               </button>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Traffic & Analytics */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Top: Map & Traffic Chart */}
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[320px]">
               <SciFiCard title="全球访问热力 (Global Access)" subtitle="MAP" className="border-indigo-900/50" noPadding>
                   <div className="w-full h-full p-2">
                       <PortalMap />
                   </div>
               </SciFiCard>

               <SciFiCard title="流量负载监控" subtitle="24H TREND" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={TRAFFIC_DATA}>
                               <defs>
                                   <linearGradient id="colorApi" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                   </linearGradient>
                                   <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={4} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0c1d', borderColor: '#6366f1', fontSize: '12px'}} />
                               <Area type="monotone" dataKey="apiCalls" stackId="1" stroke="#f59e0b" fill="url(#colorApi)" name="API Req" />
                               <Area type="monotone" dataKey="visitors" stackId="2" stroke="#0ea5e9" fill="url(#colorUser)" name="Page Views" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>
           </div>

           {/* Bottom: Deflection & Configuration */}
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
               
               <SciFiCard title="服务分流效能 (Self-Service)" subtitle="VALUE" className="border-indigo-900/30">
                   <div className="flex items-center gap-4 h-48">
                       <div className="w-40 h-40 flex-shrink-0">
                           <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                   <Pie 
                                     data={DEFLECTION_DATA} 
                                     innerRadius={30} 
                                     outerRadius={50} 
                                     paddingAngle={5} 
                                     dataKey="value"
                                   >
                                       {DEFLECTION_DATA.map((entry, index) => (
                                           <Cell key={`cell-${index}`} fill={entry.fill} />
                                       ))}
                                   </Pie>
                                   <Tooltip contentStyle={{backgroundColor: '#0f0c1d', borderColor: '#333'}} />
                               </PieChart>
                           </ResponsiveContainer>
                       </div>
                       <div className="flex-1 space-y-2">
                           {DEFLECTION_DATA.map((d, i) => (
                               <div key={i} className="flex flex-col">
                                   <div className="flex justify-between text-xs mb-1">
                                       <span className="text-slate-300">{d.name}</span>
                                       <span className="font-mono text-white">{d.value}</span>
                                   </div>
                                   <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                       <div className="h-full" style={{width: `${(d.value / 4500) * 100}%`, backgroundColor: d.fill}}></div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
                   <div className="p-2 bg-indigo-900/20 border border-indigo-500/20 rounded text-[10px] text-indigo-200 mt-2">
                       <span className="font-bold">Insight:</span> Knowledge base articles deflected an estimated 4,500 support tickets this week.
                   </div>
               </SciFiCard>

               <SciFiCard title="门户内容管理 (CMS)" subtitle="CONFIG" className="border-slate-800">
                   <div className="space-y-4">
                       <div>
                           <div className="text-xs text-slate-500 uppercase font-bold mb-2">Active Announcement Banner</div>
                           <div className="flex gap-2">
                               <input 
                                 type="text" 
                                 value={announcement} 
                                 onChange={(e) => setAnnouncement(e.target.value)}
                                 className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                               />
                               <button className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold">Publish</button>
                           </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-3">
                           <div className="p-3 bg-slate-900/50 border border-slate-700 rounded hover:border-slate-500 cursor-pointer transition-colors flex items-center justify-between group">
                               <span className="text-xs text-slate-300">Homepage Layout</span>
                               <ArrowUpRight size={14} className="text-slate-500 group-hover:text-white" />
                           </div>
                           <div className="p-3 bg-slate-900/50 border border-slate-700 rounded hover:border-slate-500 cursor-pointer transition-colors flex items-center justify-between group">
                               <span className="text-xs text-slate-300">Menu Navigation</span>
                               <ArrowUpRight size={14} className="text-slate-500 group-hover:text-white" />
                           </div>
                       </div>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Developer & API */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           <SciFiCard title="开发者控制台" subtitle="API GATEWAY" className="border-cyan-900/50 bg-[#06141d]">
               <div className="flex flex-col gap-4">
                   <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded border border-slate-700">
                       <div className="flex items-center gap-2">
                           <Server size={16} className="text-cyan-400" />
                           <span className="text-xs font-bold text-white">Endpoint Status</span>
                       </div>
                       <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded border border-green-800">Operational</span>
                   </div>

                   <div className="space-y-2">
                       <div className="text-xs font-bold text-slate-500 uppercase">Latency Monitor</div>
                       {API_HEALTH.map((api, i) => (
                           <div key={i} className="flex justify-between items-center text-xs">
                               <span className="text-slate-300 w-20">{api.name}</span>
                               <div className="flex-1 mx-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                   <div 
                                     className={`h-full ${api.status === 'Healthy' ? 'bg-green-500' : 'bg-yellow-500'}`} 
                                     style={{width: `${(api.latency / 300) * 100}%`}}
                                   ></div>
                               </div>
                               <span className="font-mono text-slate-400 w-12 text-right">{api.latency}ms</span>
                           </div>
                       ))}
                   </div>

                   <div className="p-3 bg-cyan-900/10 border border-cyan-500/20 rounded">
                       <div className="flex justify-between items-center mb-1">
                           <span className="text-xs text-cyan-200 font-bold">API Key Management</span>
                           <Key size={12} className="text-cyan-500" />
                       </div>
                       <div className="text-[10px] text-slate-400 mb-2">Manage customer access tokens.</div>
                       <button className="w-full py-1.5 bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-700 text-cyan-300 text-xs rounded transition-colors">
                           Manage Tokens
                       </button>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="Webhooks 集成" subtitle="EVENTS" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar">
                   {[
                       { event: 'order.created', url: 'https://api.cust.com/hk1', success: true },
                       { event: 'ticket.updated', url: 'https://api.cust.com/hk2', success: true },
                       { event: 'alert.trigger', url: 'https://erp.partner.net/evt', success: false },
                       { event: 'data.sync', url: 'https://bi.analytics.io/in', success: true },
                   ].map((hook, i) => (
                       <div key={i} className="p-2 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-xs font-bold text-slate-200">{hook.event}</span>
                               {hook.success ? <CheckCircle2 size={10} className="text-green-500"/> : <XCircle size={10} className="text-red-500"/>}
                           </div>
                           <div className="text-[10px] text-slate-500 font-mono truncate">{hook.url}</div>
                       </div>
                   ))}
               </div>
               <button className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors">
                   Configure Webhooks
               </button>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
