
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  ClipboardList, UserCog, MapPin, Clock, 
  AlertCircle, CheckCircle2, MoreHorizontal, 
  Search, Filter, Calendar, Camera, Wrench,
  MessageSquare, Star, ArrowRight, Truck,
  Navigation, Smartphone, FileText, Send, Settings
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, CartesianGrid
} from 'recharts';

// --- Types ---

type TicketStatus = 'New' | 'Dispatched' | 'In Progress' | 'Pending Parts' | 'Resolved' | 'Closed';
type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

interface WorkOrder {
  id: string;
  customer: string;
  site: string;
  equipment: string;
  type: 'Repair' | 'Maintenance' | 'Installation' | 'Inspection';
  priority: Priority;
  status: TicketStatus;
  subject: string;
  createTime: string;
  slaDue: string; // ISO date string
  assignee: {
    name: string;
    id: string;
    avatarColor: string;
    skillMatch: number; // 0-100
    location: string;
    distToSite: number; // km
  };
  progress: number; // 0-100
}

interface ServiceLog {
  id: number;
  time: string;
  action: string;
  desc: string;
  actor: string;
  type: 'system' | 'human' | 'field_update';
  attachments?: string[]; // mock image placeholders
}

// --- Mock Data ---

const WORK_ORDERS: WorkOrder[] = [
  {
    id: 'WO-2024-8842',
    customer: 'Shanghai Heavy Industries',
    site: 'Plant A - Zone 4',
    equipment: 'Gas Turbine GT-101',
    type: 'Repair',
    priority: 'Critical',
    status: 'In Progress',
    subject: 'Turbine Vibration Alarm High (Zone 2)',
    createTime: '2024-03-20 08:30',
    slaDue: '2024-03-20 12:30',
    assignee: { name: 'Wang Engineer', id: 'ENG-007', avatarColor: '#0ea5e9', skillMatch: 95, location: 'En Route', distToSite: 2.5 },
    progress: 45
  },
  {
    id: 'WO-2024-8845',
    customer: 'Pacific Power Group',
    site: 'Substation B',
    equipment: 'Transformer T-2',
    type: 'Inspection',
    priority: 'Medium',
    status: 'New',
    subject: 'Quarterly Routine Inspection',
    createTime: '2024-03-20 09:15',
    slaDue: '2024-03-22 17:00',
    assignee: { name: 'Unassigned', id: '', avatarColor: '#64748b', skillMatch: 0, location: '-', distToSite: 0 },
    progress: 0
  },
  {
    id: 'WO-2024-8839',
    customer: 'AutoWorks GmbH',
    site: 'Assembly Line 1',
    equipment: 'Robotic Arm R-04',
    type: 'Maintenance',
    priority: 'High',
    status: 'Pending Parts',
    subject: 'Servo Motor Replacement',
    createTime: '2024-03-19 14:20',
    slaDue: '2024-03-20 10:00',
    assignee: { name: 'Li Tech', id: 'ENG-012', avatarColor: '#f59e0b', skillMatch: 88, location: 'On Site', distToSite: 0 },
    progress: 70
  },
  {
    id: 'WO-2024-8830',
    customer: 'Municipal Water',
    site: 'Pump Station North',
    equipment: 'Main Pump P-1',
    type: 'Repair',
    priority: 'Critical',
    status: 'Resolved',
    subject: 'Pump Seal Leakage',
    createTime: '2024-03-18 23:45',
    slaDue: '2024-03-19 04:00',
    assignee: { name: 'Chen Senior', id: 'ENG-001', avatarColor: '#10b981', skillMatch: 98, location: 'Base', distToSite: 15 },
    progress: 100
  },
];

const SERVICE_LOGS: ServiceLog[] = [
  { id: 1, time: '08:30', action: 'Ticket Created', desc: 'System alert triggered auto-ticket. Vibration > 8.5mm/s.', actor: 'System', type: 'system' },
  { id: 2, time: '08:35', action: 'Dispatched', desc: 'Auto-assigned to nearest qualified engineer Wang.', actor: 'Dispatcher AI', type: 'system' },
  { id: 3, time: '08:42', action: 'Acknowledged', desc: 'Engineer accepted the task via mobile app.', actor: 'Wang Engineer', type: 'human' },
  { id: 4, time: '09:15', action: 'Check-In', desc: 'Arrived at site. GPS Verified. Safety briefing completed.', actor: 'Wang Engineer', type: 'field_update' },
  { id: 5, time: '09:30', action: 'Diagnosis', desc: 'Initial inspection confirms bearing wear on shaft 2. Requesting spare part B-204.', actor: 'Wang Engineer', type: 'field_update', attachments: ['img1', 'img2'] },
];

const PERFORMANCE_STATS = [
  { day: 'Mon', completed: 12, sla: 100 },
  { day: 'Tue', completed: 15, sla: 95 },
  { day: 'Wed', completed: 18, sla: 98 },
  { day: 'Thu', completed: 10, sla: 100 },
  { day: 'Fri', completed: 14, sla: 92 },
  { day: 'Sat', completed: 5, sla: 100 },
  { day: 'Sun', completed: 2, sla: 100 },
];

// --- Helper Components ---

const StatusBadge = ({ status }: { status: TicketStatus }) => {
  const styles = {
    'New': 'bg-blue-900/30 text-blue-400 border-blue-800',
    'Dispatched': 'bg-indigo-900/30 text-indigo-400 border-indigo-800',
    'In Progress': 'bg-amber-900/30 text-amber-400 border-amber-800 animate-pulse',
    'Pending Parts': 'bg-purple-900/30 text-purple-400 border-purple-800',
    'Resolved': 'bg-green-900/30 text-green-400 border-green-800',
    'Closed': 'bg-slate-800 text-slate-400 border-slate-700',
  }[status];

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles}`}>
      {status}
    </span>
  );
};

const PriorityIcon = ({ p }: { p: Priority }) => {
  if (p === 'Critical') return <AlertCircle size={14} className="text-red-500 fill-red-500/20" />;
  if (p === 'High') return <ArrowRight size={14} className="text-orange-500 -rotate-45" />;
  if (p === 'Medium') return <ArrowRight size={14} className="text-blue-500" />;
  return <ArrowRight size={14} className="text-slate-500 rotate-45" />;
};

export const CustomerWorkOrdersView: React.FC = () => {
  const [selectedTicketId, setSelectedTicketId] = useState(WORK_ORDERS[0].id);
  const [activeTab, setActiveTab] = useState('timeline');

  const activeTicket = WORK_ORDERS.find(t => t.id === selectedTicketId) || WORK_ORDERS[0];

  const radarData = [
    { subject: 'Skill Match', A: activeTicket.assignee.skillMatch, fullMark: 100 },
    { subject: 'Availability', A: 100, fullMark: 100 },
    { subject: 'Proximity', A: 90, fullMark: 100 },
    { subject: 'Past Rating', A: 95, fullMark: 100 },
    { subject: 'Certification', A: 100, fullMark: 100 },
  ];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header & Global KPIs */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0f1016] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <ClipboardList size={14} /> Field Service Management
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             工单与现场 <span className="text-indigo-500">处置指挥中心</span>
          </h1>
        </div>
        
        <div className="grid grid-cols-4 gap-6">
            <div className="text-right border-r border-slate-800 pr-6">
                <div className="text-[10px] text-slate-500 uppercase">Open Tickets</div>
                <div className="text-xl font-mono font-bold text-white">24</div>
            </div>
            <div className="text-right border-r border-slate-800 pr-6">
                <div className="text-[10px] text-slate-500 uppercase">Avg Response</div>
                <div className="text-xl font-mono font-bold text-cyan-400">12m</div>
            </div>
            <div className="text-right border-r border-slate-800 pr-6">
                <div className="text-[10px] text-slate-500 uppercase">SLA Breach</div>
                <div className="text-xl font-mono font-bold text-red-500">0</div>
            </div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Sat Score</div>
                <div className="text-xl font-mono font-bold text-yellow-400">4.9/5</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Ticket Stream */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search ID, Subject..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
                  />
               </div>
               <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-400">
                  <Filter size={14} />
               </button>
           </div>

           <div className="flex flex-col gap-2">
               {WORK_ORDERS.map(ticket => (
                   <div 
                     key={ticket.id}
                     onClick={() => setSelectedTicketId(ticket.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-200 relative group flex flex-col gap-2
                        ${selectedTicketId === ticket.id 
                            ? 'bg-indigo-900/20 border-indigo-500/50 shadow-[inset_4px_0_0_#6366f1]' 
                            : 'bg-slate-900/30 border-slate-800 hover:bg-slate-800'}
                     `}
                   >
                       <div className="flex justify-between items-start">
                           <div className="flex items-center gap-2">
                               <PriorityIcon p={ticket.priority} />
                               <span className={`text-xs font-bold font-mono ${selectedTicketId === ticket.id ? 'text-indigo-300' : 'text-slate-400'}`}>{ticket.id}</span>
                           </div>
                           <StatusBadge status={ticket.status} />
                       </div>
                       
                       <div className="text-sm font-bold text-slate-200 line-clamp-1">{ticket.subject}</div>
                       <div className="text-[10px] text-slate-500">{ticket.customer} • {ticket.site}</div>
                       
                       <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 pt-2 border-t border-slate-800/50">
                           <span className="flex items-center gap-1"><Clock size={10}/> Due: {ticket.slaDue.split(' ')[1]}</span>
                           <span>{ticket.type}</span>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: Operational Console */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Ticket Header Card */}
           <SciFiCard className="border-indigo-900/50 bg-[#080b14]" noPadding>
               <div className="p-4 flex flex-col gap-4">
                   <div className="flex justify-between items-start">
                       <div>
                           <div className="flex items-center gap-3 mb-2">
                               <h2 className="text-xl font-bold text-white">{activeTicket.subject}</h2>
                               {activeTicket.priority === 'Critical' && <span className="bg-red-900/40 text-red-400 border border-red-900/50 text-[10px] px-2 py-0.5 rounded animate-pulse font-bold">CRITICAL OUTAGE</span>}
                           </div>
                           <div className="flex gap-4 text-xs text-slate-400">
                               <span className="flex items-center gap-1"><UserCog size={12}/> {activeTicket.customer}</span>
                               <span className="flex items-center gap-1"><MapPin size={12}/> {activeTicket.site}</span>
                               <span className="flex items-center gap-1"><Wrench size={12}/> {activeTicket.equipment}</span>
                           </div>
                       </div>
                       
                       <div className="text-right">
                           <div className="text-[10px] text-slate-500 uppercase font-bold">SLA Countdown</div>
                           <div className="text-2xl font-mono font-bold text-indigo-300">03:45:12</div>
                       </div>
                   </div>

                   {/* Progress Bar */}
                   <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden flex">
                       <div className="bg-indigo-500 h-full transition-all duration-1000" style={{width: `${activeTicket.progress}%`}}></div>
                   </div>
               </div>
               
               {/* Action Tabs */}
               <div className="flex bg-slate-900/50 border-t border-slate-800 px-2">
                   {['timeline', 'media', 'parts'].map(tab => (
                       <button
                         key={tab}
                         onClick={() => setActiveTab(tab)}
                         className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors flex items-center gap-2
                            ${activeTab === tab ? 'text-indigo-400 border-indigo-500' : 'text-slate-500 border-transparent hover:text-slate-300'}
                         `}
                       >
                           {tab === 'timeline' && <Clock size={12} />}
                           {tab === 'media' && <Camera size={12} />}
                           {tab === 'parts' && <Settings size={12} />}
                           {tab.charAt(0).toUpperCase() + tab.slice(1)}
                       </button>
                   ))}
               </div>
           </SciFiCard>

           {/* Main Content Area (Timeline / Logs) */}
           {activeTab === 'timeline' && (
               <SciFiCard title="现场处置记录 (Timeline)" subtitle="LIVE LOG" className="flex-1 border-slate-800">
                   <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                       {SERVICE_LOGS.map((log, i) => (
                           <div key={i} className="relative">
                               {/* Dot */}
                               <div className={`absolute -left-[19px] top-1.5 w-3 h-3 rounded-full border-2 bg-slate-950 z-10
                                   ${log.type === 'field_update' ? 'border-indigo-500' : log.type === 'human' ? 'border-green-500' : 'border-slate-600'}
                               `}></div>
                               
                               <div className="bg-slate-900/30 border border-slate-800 p-3 rounded hover:border-slate-700 transition-colors">
                                   <div className="flex justify-between items-start mb-1">
                                       <div className="flex items-center gap-2">
                                           <span className="text-sm font-bold text-slate-200">{log.action}</span>
                                           <span className="text-[10px] px-1.5 rounded bg-slate-800 text-slate-400">{log.actor}</span>
                                       </div>
                                       <span className="text-xs font-mono text-slate-500">{log.time}</span>
                                   </div>
                                   <p className="text-xs text-slate-400 leading-relaxed">{log.desc}</p>
                                   
                                   {log.attachments && (
                                       <div className="flex gap-2 mt-3">
                                           {log.attachments.map((_, idx) => (
                                               <div key={idx} className="w-16 h-12 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-slate-600 hover:border-indigo-500 cursor-pointer transition-colors">
                                                   <Camera size={14} />
                                               </div>
                                           ))}
                                       </div>
                                   )}
                               </div>
                           </div>
                       ))}
                       
                       {/* Input Area */}
                       <div className="relative pt-4">
                           <div className="absolute -left-[19px] top-6 w-3 h-3 rounded-full border-2 border-slate-700 bg-slate-950 z-10"></div>
                           <div className="flex gap-2">
                               <input type="text" placeholder="Add note or update..." className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500" />
                               <button className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded"><Send size={14} /></button>
                           </div>
                       </div>
                   </div>
               </SciFiCard>
           )}

           {activeTab === 'media' && (
               <SciFiCard title="现场影像资料 (Evidence)" subtitle="GALLERY" className="flex-1 border-slate-800">
                   <div className="grid grid-cols-3 gap-4">
                       <div className="aspect-video bg-slate-900 border border-slate-700 rounded flex flex-col items-center justify-center text-slate-500 hover:text-indigo-400 hover:border-indigo-500 cursor-pointer transition-colors">
                           <Camera size={24} />
                           <span className="text-xs mt-2">Vibration Reading</span>
                       </div>
                       <div className="aspect-video bg-slate-900 border border-slate-700 rounded flex flex-col items-center justify-center text-slate-500 hover:text-indigo-400 hover:border-indigo-500 cursor-pointer transition-colors">
                           <Camera size={24} />
                           <span className="text-xs mt-2">Damaged Seal</span>
                       </div>
                       <div className="aspect-video bg-slate-900 border border-slate-700 rounded flex flex-col items-center justify-center text-slate-500 hover:text-indigo-400 hover:border-indigo-500 cursor-pointer transition-colors">
                           <FileText size={24} />
                           <span className="text-xs mt-2">Sign-off Sheet</span>
                       </div>
                   </div>
               </SciFiCard>
           )}

        </div>

        {/* RIGHT COLUMN: Resources & Intelligence */}
        <div className="w-full lg:w-[300px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Engineer Profile */}
           <SciFiCard title="执行工程师" subtitle="ASSIGNEE" className="border-indigo-900/50">
               <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg" style={{backgroundColor: activeTicket.assignee.avatarColor}}>
                       {activeTicket.assignee.name.charAt(0)}
                   </div>
                   <div>
                       <div className="font-bold text-white">{activeTicket.assignee.name}</div>
                       <div className="text-xs text-slate-400 flex items-center gap-1">
                           <Smartphone size={10} /> {activeTicket.assignee.id || 'N/A'}
                       </div>
                   </div>
               </div>

               <div className="grid grid-cols-2 gap-2 mb-4">
                   <div className="bg-slate-900/50 p-2 rounded text-center border border-slate-800">
                       <div className="text-[10px] text-slate-500">Status</div>
                       <div className="text-xs font-bold text-green-400">{activeTicket.assignee.location}</div>
                   </div>
                   <div className="bg-slate-900/50 p-2 rounded text-center border border-slate-800">
                       <div className="text-[10px] text-slate-500">ETA</div>
                       <div className="text-xs font-bold text-white">10 min</div>
                   </div>
               </div>

               {/* Skill Radar */}
               <div className="h-40 w-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Skill" dataKey="A" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.4} />
                       </RadarChart>
                   </ResponsiveContainer>
                   <div className="absolute top-0 right-0 text-[10px] text-indigo-400 font-bold">Match: {activeTicket.assignee.skillMatch}%</div>
               </div>
           </SciFiCard>

           {/* Location Map Placeholder */}
           <SciFiCard title="位置追踪" subtitle="LIVE GPS" className="h-48 border-slate-800" noPadding>
               <div className="w-full h-full bg-[#050505] relative overflow-hidden flex items-center justify-center">
                   {/* Simplified Map Viz */}
                   <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
                   
                   {/* Route Line */}
                   <svg className="absolute inset-0 w-full h-full">
                       <path d="M50,150 Q120,100 200,80" stroke="#6366f1" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                   </svg>

                   {/* Site Pin */}
                   <div className="absolute top-[80px] left-[200px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                       <MapPin className="text-red-500 fill-red-500/20" size={24} />
                       <span className="text-[10px] bg-red-900/80 px-1 rounded text-white">Site</span>
                   </div>

                   {/* Tech Pin (Moving) */}
                   <div className="absolute top-[110px] left-[130px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                       <Truck className="text-green-400 fill-green-400/20" size={20} />
                       <span className="text-[10px] bg-green-900/80 px-1 rounded text-white">Tech</span>
                   </div>
               </div>
           </SciFiCard>

           {/* AI Recommendation */}
           <SciFiCard title="AI 辅助决策" subtitle="RECOMMENDATION" className="border-indigo-900/50 bg-indigo-950/10">
               <div className="flex gap-3">
                   <div className="p-2 bg-indigo-900/30 rounded h-fit text-indigo-400">
                       <MessageSquare size={16} />
                   </div>
                   <div>
                       <div className="text-xs font-bold text-white mb-1">Knowledge Base Hit (92%)</div>
                       <p className="text-xs text-slate-400 leading-relaxed">
                           Similiar vibration issues on GT-101 were resolved by replacing the <strong>Bearing Seal Ring (Part #B-204)</strong>. Check alignment before replacement.
                       </p>
                       <button className="mt-2 text-[10px] text-indigo-400 hover:text-white flex items-center gap-1">
                           View Procedure <ArrowRight size={10} />
                       </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
