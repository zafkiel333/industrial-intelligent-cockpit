
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Search, User, Briefcase, Phone, Mail, 
  MapPin, Tag, Star, Calendar, MessageSquare, 
  TrendingUp, Shield, Award, Network,
  Linkedin, MoreHorizontal, Filter, Plus
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid
} from 'recharts';

// --- Types ---

interface Contact {
  id: string;
  name: string;
  title: string;
  company: string;
  avatarColor: string;
  status: 'Online' | 'Offline' | 'Busy';
  tags: string[];
  email: string;
  phone: string;
  location: string;
  influence: {
    decisionPower: number; // 决策权
    techSavvy: number;    // 技术理解
    budgetControl: number;// 预算控制
    affinity: number;     // 亲密度
    urgency: number;      // 需求迫切度
  };
  traits: string[]; // e.g. "Analytical", "Direct"
  lastInteraction: string;
  roleType: 'Decision Maker' | 'Influencer' | 'End User' | 'Gatekeeper';
}

// --- Mock Data ---

const CONTACTS: Contact[] = [
  { 
    id: 'C-001', name: 'Dr. Sarah Chen', title: 'Chief Technology Officer', company: 'Quantum Global Group',
    avatarColor: '#0ea5e9', status: 'Online', 
    tags: ['VIP', 'Tech Lead', 'Early Adopter'],
    email: 'sarah.chen@quantum.global', phone: '+86 138-0000-1234', location: 'Shanghai, CN',
    influence: { decisionPower: 90, techSavvy: 95, budgetControl: 80, affinity: 85, urgency: 70 },
    traits: ['Analytical', 'Visionary', 'Detail-Oriented'],
    lastInteraction: '2 hours ago', roleType: 'Decision Maker'
  },
  { 
    id: 'C-002', name: 'Michael Ross', title: 'Procurement Director', company: 'Pacific Power Group',
    avatarColor: '#f59e0b', status: 'Busy', 
    tags: ['Negotiator', 'Budget Focus'],
    email: 'm.ross@pacificpower.com', phone: '+86 139-1111-2222', location: 'Beijing, CN',
    influence: { decisionPower: 85, techSavvy: 40, budgetControl: 100, affinity: 60, urgency: 50 },
    traits: ['Cost-Conscious', 'Direct', 'Skeptical'],
    lastInteraction: '1 day ago', roleType: 'Gatekeeper'
  },
  { 
    id: 'C-003', name: 'Liu Wei', title: 'Plant Manager', company: 'Quantum China Ltd.',
    avatarColor: '#10b981', status: 'Offline', 
    tags: ['Operational', 'End User'],
    email: 'liuw@quantum.cn', phone: '+86 137-3333-4444', location: 'Wuhan, CN',
    influence: { decisionPower: 60, techSavvy: 75, budgetControl: 40, affinity: 90, urgency: 85 },
    traits: ['Pragmatic', 'Results-Driven', 'Loyal'],
    lastInteraction: '3 days ago', roleType: 'End User'
  },
  { 
    id: 'C-004', name: 'Emma Watson', title: 'VP of Engineering', company: 'North America HQ',
    avatarColor: '#8b5cf6', status: 'Online', 
    tags: ['Innovator', 'Key Opinion Leader'],
    email: 'e.watson@quantum.us', phone: '+1 415-555-0123', location: 'San Francisco, US',
    influence: { decisionPower: 80, techSavvy: 90, budgetControl: 70, affinity: 75, urgency: 60 },
    traits: ['Collaborative', 'Open-Minded'],
    lastInteraction: '1 week ago', roleType: 'Influencer'
  },
];

const INTERACTION_HISTORY = [
  { date: '2024-03-15', type: 'Meeting', note: 'Q1 Strategy Review', sentiment: 'Positive' },
  { date: '2024-03-10', type: 'Email', note: 'Technical Specs Confirmation', sentiment: 'Neutral' },
  { date: '2024-02-28', type: 'Call', note: 'Budget negotiation follow-up', sentiment: 'Negative' },
  { date: '2024-02-15', type: 'Site Visit', note: 'Factory acceptance test', sentiment: 'Positive' },
];

const PREFERENCE_DATA = [
  { name: 'Email', value: 80 },
  { name: 'Phone', value: 40 },
  { name: 'WeChat', value: 90 },
  { name: 'Meeting', value: 60 },
];

export const CustomerContactsView: React.FC = () => {
  const [selectedContactId, setSelectedContactId] = useState<string>(CONTACTS[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedContact = CONTACTS.find(c => c.id === selectedContactId) || CONTACTS[0];

  // Transform influence object to array for Radar chart
  const radarData = [
    { subject: '决策权', A: selectedContact.influence.decisionPower, fullMark: 100 },
    { subject: '技术偏好', A: selectedContact.influence.techSavvy, fullMark: 100 },
    { subject: '预算掌控', A: selectedContact.influence.budgetControl, fullMark: 100 },
    { subject: '合作紧密', A: selectedContact.influence.affinity, fullMark: 100 },
    { subject: '需求迫切', A: selectedContact.influence.urgency, fullMark: 100 },
  ];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0c0f1d] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <User size={14} /> CRM Module
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             关键岗位 <span className="text-indigo-500">人物画像</span>
          </h1>
        </div>
        
        <div className="flex gap-3 mt-4 md:mt-0">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]">
               <Plus size={14} /> 新建联系人
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Contact Directory */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1">
           
           {/* Search & Filter */}
           <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search contacts..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-400">
                  <Filter size={14} />
               </button>
           </div>

           {/* List */}
           <div className="flex flex-col gap-2">
               {CONTACTS.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.company.toLowerCase().includes(searchTerm.toLowerCase())).map(contact => (
                   <div 
                     key={contact.id}
                     onClick={() => setSelectedContactId(contact.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-200 relative overflow-hidden group
                        ${selectedContactId === contact.id 
                            ? 'bg-indigo-900/30 border-indigo-500/50 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       {selectedContactId === contact.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}
                       
                       <div className="flex items-center gap-3">
                           <div className="relative">
                               <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg" style={{backgroundColor: contact.avatarColor}}>
                                   {contact.name.charAt(0)}
                               </div>
                               <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0b1221] 
                                   ${contact.status === 'Online' ? 'bg-green-500' : contact.status === 'Busy' ? 'bg-red-500' : 'bg-slate-500'}`} 
                               />
                           </div>
                           <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-start">
                                   <h3 className={`text-sm font-bold truncate ${selectedContactId === contact.id ? 'text-white' : 'text-slate-300'}`}>{contact.name}</h3>
                                   <span className="text-[10px] text-slate-500">{contact.lastInteraction}</span>
                               </div>
                               <div className="text-xs text-slate-500 truncate">{contact.title}</div>
                               <div className="text-[10px] text-indigo-400 truncate mt-0.5">{contact.company}</div>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* RIGHT COLUMN: Digital Dossier */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
           
           {/* Top: Identity & Influence */}
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
               
               {/* Identity Card */}
               <SciFiCard className="xl:col-span-2 border-indigo-900/50" noPadding>
                   <div className="p-6 relative overflow-hidden">
                       {/* Background Decoration */}
                       <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                           <Network size={200} className="text-indigo-500" />
                       </div>

                       <div className="flex flex-col md:flex-row gap-6 relative z-10">
                           {/* Avatar Section */}
                           <div className="flex flex-col items-center gap-3">
                               <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] border-2 border-indigo-500/30" style={{backgroundColor: selectedContact.avatarColor}}>
                                   {selectedContact.name.charAt(0)}
                               </div>
                               <div className="flex gap-2">
                                   <button className="p-2 rounded-full bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white transition-colors"><Phone size={14}/></button>
                                   <button className="p-2 rounded-full bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white transition-colors"><Mail size={14}/></button>
                                   <button className="p-2 rounded-full bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white transition-colors"><Linkedin size={14}/></button>
                               </div>
                           </div>

                           {/* Info Section */}
                           <div className="flex-1 space-y-4">
                               <div>
                                   <div className="flex items-center gap-3 mb-1">
                                       <h2 className="text-3xl font-bold text-white tracking-tight">{selectedContact.name}</h2>
                                       <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-500 text-white shadow-lg">
                                           {selectedContact.roleType}
                                       </span>
                                   </div>
                                   <div className="text-lg text-indigo-300 mb-1">{selectedContact.title}</div>
                                   <div className="flex items-center gap-4 text-xs text-slate-400">
                                       <span className="flex items-center gap-1"><Briefcase size={12}/> {selectedContact.company}</span>
                                       <span className="flex items-center gap-1"><MapPin size={12}/> {selectedContact.location}</span>
                                   </div>
                               </div>

                               <div className="flex flex-wrap gap-2">
                                   {selectedContact.tags.map((tag, i) => (
                                       <span key={i} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 flex items-center gap-1">
                                           <Tag size={10} /> {tag}
                                       </span>
                                   ))}
                               </div>

                               <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
                                   <div>
                                       <div className="text-[10px] text-slate-500 uppercase mb-1">Personality Traits</div>
                                       <div className="flex gap-2">
                                           {selectedContact.traits.map((t, i) => (
                                               <span key={i} className="text-xs font-bold text-emerald-400 bg-emerald-900/10 px-1.5 py-0.5 rounded border border-emerald-900/30">{t}</span>
                                           ))}
                                       </div>
                                   </div>
                                   <div>
                                       <div className="text-[10px] text-slate-500 uppercase mb-1">Communication Style</div>
                                       <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                                           <div className="bg-indigo-500 h-full w-1/3" title="Formal"></div>
                                           <div className="bg-purple-500 h-full w-1/3" title="Casual"></div>
                                           <div className="bg-slate-700 h-full w-1/3" title="Brief"></div>
                                       </div>
                                       <div className="flex justify-between text-[8px] text-slate-500 mt-1">
                                           <span>Formal</span>
                                           <span>Mixed</span>
                                           <span>Brief</span>
                                       </div>
                                   </div>
                               </div>
                           </div>
                       </div>
                   </div>
               </SciFiCard>

               {/* Influence Radar */}
               <SciFiCard title="影响力画像 (Influence)" className="border-indigo-900/50">
                   <div className="w-full h-48">
                       <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                               <PolarGrid stroke="#334155" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                               <Radar name="Influence" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                               <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#8b5cf6', color: '#e2e8f0'}} />
                           </RadarChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="text-center text-xs text-indigo-300 mt-2">
                       Total Impact Score: <span className="font-bold text-white">85/100</span>
                   </div>
               </SciFiCard>
           </div>

           {/* Bottom: History & Preferences */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               
               {/* Interaction Timeline */}
               <SciFiCard title="互动历史 (Timeline)" className="lg:col-span-2 border-indigo-900/50">
                   <div className="relative pl-4 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                       {INTERACTION_HISTORY.map((item, i) => (
                           <div key={i} className="relative">
                               <div className={`absolute -left-[13px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-slate-950 
                                   ${item.sentiment === 'Positive' ? 'border-green-500' : item.sentiment === 'Negative' ? 'border-red-500' : 'border-slate-500'}`}>
                               </div>
                               <div className="flex items-start justify-between bg-slate-900/40 p-3 rounded border border-slate-800 hover:border-slate-600 transition-colors">
                                   <div>
                                       <div className="flex items-center gap-2 mb-1">
                                           <span className="text-sm font-bold text-slate-200">{item.type}</span>
                                           <span className="text-xs text-slate-500">{item.date}</span>
                                       </div>
                                       <div className="text-xs text-slate-400">{item.note}</div>
                                   </div>
                                   <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase
                                       ${item.sentiment === 'Positive' ? 'bg-green-900/20 text-green-400' : 
                                         item.sentiment === 'Negative' ? 'bg-red-900/20 text-red-400' : 'bg-slate-800 text-slate-400'}
                                   `}>
                                       {item.sentiment}
                                   </span>
                               </div>
                           </div>
                       ))}
                   </div>
               </SciFiCard>

               {/* Channel Preferences */}
               <SciFiCard title="沟通渠道偏好" className="border-indigo-900/50">
                   <div className="w-full h-40">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={PREFERENCE_DATA} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                               <XAxis type="number" hide />
                               <YAxis dataKey="name" type="category" stroke="#94a3b8" width={50} tick={{fontSize: 10}} />
                               <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#6366f1'}} />
                               <Bar dataKey="value" barSize={12} radius={[0, 4, 4, 0]}>
                                   {PREFERENCE_DATA.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#a855f7'} />
                                   ))}
                               </Bar>
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="mt-4 p-3 bg-yellow-900/10 border border-yellow-900/30 rounded flex items-start gap-2">
                       <Star size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                       <div className="text-xs text-yellow-200/80">
                           <strong>Pro Tip:</strong> Prefers WeChat for quick updates. Avoid calling before 10 AM.
                       </div>
                   </div>
               </SciFiCard>

           </div>

        </div>

      </div>
    </div>
  );
};
