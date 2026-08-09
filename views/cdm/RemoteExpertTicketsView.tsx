
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AlertCircle, CheckCircle2, Clock, 
  MessageSquare, Search, Filter, 
  User, Paperclip, Send, 
  Cpu, Wrench, Activity, 
  Zap, BrainCircuit, History,
  ArrowRight, ShieldCheck, Tag,
  MoreHorizontal, FileText, ChevronRight,
  MapPin, Share2, Video
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

// --- Types ---

type TicketStatus = 'New' | 'Analyzing' | 'Expert_Assigned' | 'Remote_Guide' | 'On_Site' | 'Resolved';
type Priority = 'P0_Critical' | 'P1_High' | 'P2_Medium' | 'P3_Low';

interface Ticket {
  id: string;
  title: string;
  customer: string;
  equipment: string;
  location: string;
  status: TicketStatus;
  priority: Priority;
  created: string;
  assignee?: string;
  expertId?: string;
  aiConfidence: number;
}

interface TimelineEvent {
  id: string;
  type: 'System' | 'User' | 'Expert' | 'AI';
  author: string;
  content: string;
  time: string;
  isLog?: boolean;
}

interface Expert {
  id: string;
  name: string;
  role: string;
  org: string;
  skillMatch: number;
  status: 'Online' | 'Busy' | 'Offline';
  avatarColor: string;
}

// --- Mock Data ---

const TICKETS: Ticket[] = [
  { id: 'TKT-2024-8842', title: 'Gas Turbine Vibration High', customer: 'Shanghai Heavy Ind.', equipment: 'GT-101', location: 'Shanghai Site A', status: 'Expert_Assigned', priority: 'P0_Critical', created: '10:30 AM', expertId: 'EXP-001', aiConfidence: 92 },
  { id: 'TKT-2024-8841', title: 'Hydraulic Pressure Drop', customer: 'Pacific Power', equipment: 'Pump Station #4', location: 'Beijing North', status: 'Analyzing', priority: 'P1_High', created: '09:15 AM', assignee: 'System', aiConfidence: 78 },
  { id: 'TKT-2024-8839', title: 'PLC Communication Timeout', customer: 'AutoWorks GmbH', equipment: 'Control Cab X-2', location: 'Shenzhen Hub', status: 'New', priority: 'P2_Medium', created: 'Yesterday', assignee: 'Pending', aiConfidence: 45 },
  { id: 'TKT-2024-8820', title: 'Bearing Overheat Warning', customer: 'Northern Mining', equipment: 'Conveyor C-5', location: 'Inner Mongolia', status: 'Resolved', priority: 'P1_High', created: '2 Days Ago', expertId: 'EXP-003', aiConfidence: 88 },
];

const TIMELINE_DATA: TimelineEvent[] = [
  { id: '1', type: 'System', author: 'IoT Alert System', content: 'Alert Triggered: Vibration (X-Axis) exceeded threshold 8.5mm/s.', time: '10:30:05', isLog: true },
  { id: '2', type: 'AI', author: 'Diagnosis Bot', content: 'Preliminary analysis suggests possible rotor imbalance or blade fouling. Confidence: 92%.', time: '10:30:15' },
  { id: '3', type: 'User', author: 'Site Operator Li', content: 'Uploaded onsite photos. Visible oil leak near bearing housing.', time: '10:35:00' },
  { id: '4', type: 'System', author: 'Dispatcher', content: 'Assigned to Remote Expert Dr. Zhang (Propulsion Specialist).', time: '10:36:20', isLog: true },
  { id: '5', type: 'Expert', author: 'Dr. Zhang', content: 'Reviewing telemetry now. Please perform spectral analysis on frequency 1X and 2X.', time: '10:38:45' },
];

const ACTIVE_EXPERT: Expert = {
  id: 'EXP-001',
  name: 'Dr. Zhang',
  role: 'Senior Propulsion Engineer',
  org: 'Global Expert Center',
  skillMatch: 98,
  status: 'Online',
  avatarColor: '#0ea5e9'
};

const STATS_DATA = [
  { name: 'Mon', value: 12 },
  { name: 'Tue', value: 18 },
  { name: 'Wed', value: 15 },
  { name: 'Thu', value: 24 },
  { name: 'Fri', value: 20 },
  { name: 'Sat', value: 8 },
  { name: 'Sun', value: 5 },
];

// --- Components ---

const StatusStep = ({ current, step, label }: { current: string, step: string, label: string }) => {
  const steps = ['New', 'Analyzing', 'Expert_Assigned', 'Remote_Guide', 'On_Site', 'Resolved'];
  const currIdx = steps.indexOf(current);
  const stepIdx = steps.indexOf(step);
  const status = stepIdx < currIdx ? 'done' : stepIdx === currIdx ? 'active' : 'pending';

  return (
    <div className="flex flex-col items-center flex-1 relative group">
       {/* Line Connector */}
       <div className={`absolute top-[10px] left-[-50%] right-[50%] h-[2px] ${status !== 'pending' ? 'bg-cyan-500' : 'bg-slate-800'} -z-10`} style={{display: stepIdx === 0 ? 'none' : 'block'}}></div>
       
       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300
          ${status === 'done' ? 'bg-cyan-500 border-cyan-500 text-black' : 
            status === 'active' ? 'bg-slate-900 border-cyan-400 text-cyan-400 shadow-[0_0_10px_#22d3ee]' : 
            'bg-slate-900 border-slate-700 text-slate-700'}
       `}>
          {status === 'done' ? <CheckCircle2 size={12}/> : <div className="w-1.5 h-1.5 rounded-full bg-current"/>}
       </div>
       <div className={`text-[10px] mt-2 font-medium uppercase tracking-wider ${status === 'active' ? 'text-white' : 'text-slate-500'}`}>
         {label}
       </div>
    </div>
  );
};

export const RemoteExpertTicketsView: React.FC = () => {
  const [selectedTicketId, setSelectedTicketId] = useState(TICKETS[0].id);
  const [inputMsg, setInputMsg] = useState('');

  const activeTicket = TICKETS.find(t => t.id === selectedTicketId) || TICKETS[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#050b14] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Wrench size={14} /> Industrial Problem Center
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             工业问题 <span className="text-cyan-500">工单中心</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Avg Resolution Time</div>
                <div className="text-xl font-mono font-bold text-white">4h 15m</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Expert Availability</div>
                <div className="text-xl font-mono font-bold text-green-400">85%</div>
            </div>
            <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]">
               <AlertCircle size={14} /> 提报故障
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Ticket Queue */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search ID, Tag..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                  />
               </div>
               <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-400">
                  <Filter size={14} />
               </button>
           </div>

           {/* Stats Mini Chart */}
           <div className="bg-slate-900/40 p-3 rounded border border-slate-800 h-24">
              <div className="text-[10px] text-slate-500 mb-1 uppercase">Ticket Volume (7 Days)</div>
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={STATS_DATA}>
                    <Bar dataKey="value" fill="#3b82f6" radius={[2,2,0,0]} />
                 </BarChart>
              </ResponsiveContainer>
           </div>

           <div className="flex flex-col gap-2">
               {TICKETS.map(ticket => (
                   <div 
                     key={ticket.id}
                     onClick={() => setSelectedTicketId(ticket.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedTicketId === ticket.id 
                            ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[inset_4px_0_0_#0ea5e9]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase
                               ${ticket.priority.includes('P0') ? 'bg-red-900/50 text-red-400 border border-red-800' :
                                 ticket.priority.includes('P1') ? 'bg-orange-900/50 text-orange-400 border border-orange-800' :
                                 'bg-blue-900/50 text-blue-400 border border-blue-800'}
                           `}>
                               {ticket.priority.split('_')[0]}
                           </span>
                           <span className="text-[10px] text-slate-500">{ticket.created}</span>
                       </div>
                       
                       <h3 className={`font-bold text-sm mb-1 leading-snug ${selectedTicketId === ticket.id ? 'text-white' : 'text-slate-300'}`}>
                           {ticket.title}
                       </h3>
                       <div className="text-[10px] text-slate-400 truncate">{ticket.customer} • {ticket.equipment}</div>
                       
                       {/* AI Badge */}
                       <div className="mt-2 flex items-center justify-between">
                           <div className="flex items-center gap-1 text-[9px] text-indigo-400 bg-indigo-900/20 px-1.5 py-0.5 rounded">
                               <BrainCircuit size={10} /> AI Conf: {ticket.aiConfidence}%
                           </div>
                           <ChevronRight size={14} className={`text-slate-600 ${selectedTicketId === ticket.id ? 'text-cyan-500' : ''}`}/>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: The Workspace */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
           
           {/* 1. Ticket Progress Header */}
           <SciFiCard className="border-cyan-900/50 bg-[#080b14]" noPadding>
               <div className="p-4 flex flex-col gap-4">
                   <div className="flex justify-between items-start">
                       <div>
                           <div className="flex items-center gap-2 mb-1">
                               <h2 className="text-xl font-bold text-white">{activeTicket.title}</h2>
                               <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 rounded">{activeTicket.id}</span>
                           </div>
                           <div className="flex gap-4 text-xs text-slate-400">
                               <span className="flex items-center gap-1"><Cpu size={12}/> {activeTicket.equipment}</span>
                               <span className="flex items-center gap-1"><MapPin size={12}/> {activeTicket.location}</span>
                           </div>
                       </div>
                       
                       <div className="flex gap-2">
                           <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"><Share2 size={16}/></button>
                           <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded flex items-center gap-2 transition-colors">
                               Escalate
                           </button>
                       </div>
                   </div>
                   
                   {/* Workflow Stepper */}
                   <div className="flex justify-between items-center px-4 pt-2 w-full">
                       <StatusStep current={activeTicket.status} step="New" label="提交" />
                       <StatusStep current={activeTicket.status} step="Analyzing" label="智能研判" />
                       <StatusStep current={activeTicket.status} step="Expert_Assigned" label="专家指派" />
                       <StatusStep current={activeTicket.status} step="Remote_Guide" label="远程指导" />
                       <StatusStep current={activeTicket.status} step="On_Site" label="现场处置" />
                       <StatusStep current={activeTicket.status} step="Resolved" label="闭环归档" />
                   </div>
               </div>
           </SciFiCard>

           {/* 2. Collaborative Workspace (Split) */}
           <div className="flex-1 flex gap-4 min-h-0">
               
               {/* Diagnostic Chat / Timeline */}
               <SciFiCard title="专家协作与诊断流" subtitle="LIVE COLLAB" className="flex-[2] border-slate-800 flex flex-col">
                   <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-4 pr-2">
                       {TIMELINE_DATA.map((event, i) => (
                           <div key={i} className={`flex gap-3 ${event.type === 'User' ? 'flex-row-reverse' : ''}`}>
                               {event.type !== 'User' && (
                                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2
                                       ${event.type === 'System' ? 'bg-slate-800 border-slate-600 text-slate-400' : 
                                         event.type === 'AI' ? 'bg-indigo-900 border-indigo-500 text-indigo-300' :
                                         'bg-cyan-900 border-cyan-500 text-cyan-300'}
                                   `}>
                                       {event.type === 'AI' ? <BrainCircuit size={14}/> : event.type === 'System' ? <Activity size={14}/> : event.author.charAt(0)}
                                   </div>
                               )}
                               
                               <div className={`max-w-[80%] flex flex-col ${event.type === 'User' ? 'items-end' : 'items-start'}`}>
                                   <div className="flex items-baseline gap-2 mb-1">
                                       <span className={`text-xs font-bold ${event.type === 'User' ? 'text-slate-300' : event.type === 'AI' ? 'text-indigo-400' : 'text-cyan-400'}`}>
                                           {event.author}
                                       </span>
                                       <span className="text-[10px] text-slate-600">{event.time}</span>
                                   </div>
                                   
                                   <div className={`p-3 rounded-lg text-sm text-slate-200 border
                                       ${event.type === 'User' ? 'bg-slate-800 border-slate-700' : 
                                         event.type === 'AI' ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-100' : 
                                         event.isLog ? 'bg-slate-950 border-slate-800 font-mono text-xs text-slate-400' :
                                         'bg-cyan-950/20 border-cyan-500/30'}
                                   `}>
                                       {event.content}
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
                   
                   <div className="mt-4 pt-4 border-t border-slate-800 relative">
                       <input 
                         type="text" 
                         className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-4 pr-12 py-3 text-sm focus:border-cyan-500 outline-none text-white"
                         placeholder="Type message or paste logs..."
                         value={inputMsg}
                         onChange={(e) => setInputMsg(e.target.value)}
                       />
                       <button className="absolute right-2 top-[22px] p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors">
                           <Send size={14} />
                       </button>
                       <div className="flex gap-2 mt-2">
                           <button className="text-xs text-slate-500 hover:text-white flex items-center gap-1"><Paperclip size={12}/> Attach File</button>
                           <button className="text-xs text-slate-500 hover:text-white flex items-center gap-1"><Video size={12}/> Start Video Call</button>
                       </div>
                   </div>
               </SciFiCard>

               {/* Right Side Widgets (Expert & Knowledge) */}
               <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
                   
                   {/* Assigned Expert */}
                   <SciFiCard title="指派专家 (Assignee)" className="border-indigo-900/30">
                       <div className="flex items-center gap-3 mb-3">
                           <div className="w-12 h-12 rounded-full border-2 border-cyan-500 flex items-center justify-center text-lg font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]" style={{backgroundColor: ACTIVE_EXPERT.avatarColor}}>
                               {ACTIVE_EXPERT.name.charAt(0)}
                           </div>
                           <div>
                               <div className="font-bold text-white">{ACTIVE_EXPERT.name}</div>
                               <div className="text-xs text-slate-400">{ACTIVE_EXPERT.role}</div>
                           </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                           <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                               <div className="text-[10px] text-slate-500">Skill Match</div>
                               <div className="font-bold text-green-400">{ACTIVE_EXPERT.skillMatch}%</div>
                           </div>
                           <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                               <div className="text-[10px] text-slate-500">Status</div>
                               <div className="font-bold text-cyan-400">{ACTIVE_EXPERT.status}</div>
                           </div>
                       </div>
                       
                       <button className="w-full py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs text-slate-300 rounded transition-colors">
                           View Profile
                       </button>
                   </SciFiCard>

                   {/* AI Recommendations */}
                   <SciFiCard title="智能推荐 (AI)" subtitle="KNOWLEDGE" className="flex-1 border-purple-900/30">
                       <div className="flex flex-col gap-3">
                           {[
                               { title: 'GT-101 Vibration Diagnostics Guide', type: 'Manual', score: 98 },
                               { title: 'Case #2201: Rotor Imbalance', type: 'Case', score: 85 },
                               { title: 'Sensor Calibration SOP', type: 'Video', score: 72 }
                           ].map((item, i) => (
                               <div key={i} className="p-2 rounded bg-slate-900/40 border border-slate-800 hover:border-purple-500/30 cursor-pointer group transition-colors">
                                   <div className="flex justify-between items-start mb-1">
                                       <span className={`text-[9px] px-1.5 rounded uppercase font-bold
                                           ${item.type === 'Manual' ? 'bg-blue-900/30 text-blue-300' : 'bg-orange-900/30 text-orange-300'}
                                       `}>{item.type}</span>
                                       <span className="text-[9px] text-green-400 font-mono">{item.score}% Match</span>
                                   </div>
                                   <div className="text-xs text-slate-300 group-hover:text-white leading-tight">{item.title}</div>
                               </div>
                           ))}
                       </div>
                       <button className="w-full mt-3 py-1.5 border border-dashed border-slate-600 text-xs text-slate-400 hover:text-white rounded flex items-center justify-center gap-1 transition-colors">
                           <Search size={10} /> Search Knowledge Base
                       </button>
                   </SciFiCard>

                   {/* Equipment Quick View */}
                   <div className="p-3 rounded border border-slate-800 bg-[#0a0d14]">
                       <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-bold text-slate-400">Equipment Health</span>
                           <Activity size={14} className="text-yellow-500" />
                       </div>
                       <div className="flex items-end gap-2">
                           <span className="text-2xl font-bold text-yellow-400">72</span>
                           <span className="text-xs text-slate-500 mb-1">/ 100</span>
                       </div>
                       <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                           <div className="h-full bg-yellow-500" style={{width: '72%'}}></div>
                       </div>
                   </div>

               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
