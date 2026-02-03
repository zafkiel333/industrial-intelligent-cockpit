
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Users, Crown, Shield, Wallet, 
  ThumbsUp, ThumbsDown, Minus, 
  ArrowRight, Activity, Zap, 
  Network, Search, Filter,
  UserCheck, UserX, UserMinus,
  MessageSquare, FileText
} from 'lucide-react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Cell, ReferenceLine, Label
} from 'recharts';

// --- Types ---

type RoleType = 'Economic Buyer' | 'Champion' | 'Technical Evaluator' | 'User' | 'Gatekeeper' | 'Blocker';
type Sentiment = 'Positive' | 'Neutral' | 'Negative';
type InfluenceLevel = 'High' | 'Medium' | 'Low';

interface Stakeholder {
  id: string;
  name: string;
  title: string;
  role: RoleType;
  sentiment: Sentiment;
  influence: number; // 0-100
  support: number; // -100 to 100 (Negative = Detractor)
  avatarColor: string;
  x: number; // Graph Position %
  y: number; // Graph Position %
  reportsTo?: string;
}

interface Relationship {
  source: string;
  target: string;
  type: 'Reporting' | 'Influence' | 'Conflict' | 'Trust';
  strength: number; // Line thickness
}

// --- Mock Data ---

const STAKEHOLDERS: Stakeholder[] = [
  { id: 'S1', name: 'Robert Chen', title: 'CEO', role: 'Economic Buyer', sentiment: 'Neutral', influence: 100, support: 10, avatarColor: '#f59e0b', x: 50, y: 10 },
  { id: 'S2', name: 'Sarah Wu', title: 'CTO', role: 'Technical Evaluator', sentiment: 'Positive', influence: 85, support: 75, avatarColor: '#0ea5e9', x: 30, y: 40, reportsTo: 'S1' },
  { id: 'S3', name: 'Mike Ross', title: 'CFO', role: 'Gatekeeper', sentiment: 'Negative', influence: 90, support: -40, avatarColor: '#ef4444', x: 70, y: 40, reportsTo: 'S1' },
  { id: 'S4', name: 'David Li', title: 'VP Engineering', role: 'Champion', sentiment: 'Positive', influence: 70, support: 90, avatarColor: '#10b981', x: 20, y: 70, reportsTo: 'S2' },
  { id: 'S5', name: 'Jenny Zhang', title: 'Ops Manager', role: 'User', sentiment: 'Neutral', influence: 40, support: 20, avatarColor: '#8b5cf6', x: 50, y: 70, reportsTo: 'S2' },
  { id: 'S6', name: 'Tom Wang', title: 'Procurement Lead', role: 'Blocker', sentiment: 'Negative', influence: 60, support: -60, avatarColor: '#64748b', x: 80, y: 70, reportsTo: 'S3' },
];

const RELATIONSHIPS: Relationship[] = [
  { source: 'S4', target: 'S2', type: 'Trust', strength: 2 }, // VP Eng influences CTO
  { source: 'S2', target: 'S3', type: 'Conflict', strength: 2 }, // CTO vs CFO
  { source: 'S6', target: 'S3', type: 'Reporting', strength: 1 },
  { source: 'S5', target: 'S4', type: 'Influence', strength: 1 },
];

const MATRIX_DATA = STAKEHOLDERS.map(s => ({
  x: s.support,
  y: s.influence,
  z: 100, // Bubble size
  name: s.name,
  role: s.role,
  fill: s.sentiment === 'Positive' ? '#10b981' : s.sentiment === 'Negative' ? '#ef4444' : '#f59e0b'
}));

// --- Helper Components ---

const RoleBadge = ({ role }: { role: RoleType }) => {
  const styles = {
    'Economic Buyer': 'bg-yellow-900/30 text-yellow-400 border-yellow-700',
    'Champion': 'bg-green-900/30 text-green-400 border-green-700',
    'Blocker': 'bg-red-900/30 text-red-400 border-red-700',
    'Technical Evaluator': 'bg-blue-900/30 text-blue-400 border-blue-700',
    'User': 'bg-purple-900/30 text-purple-400 border-purple-700',
    'Gatekeeper': 'bg-slate-800 text-slate-400 border-slate-600',
  }[role];
  
  return <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold ${styles}`}>{role}</span>;
};

const SentimentIcon = ({ s }: { s: Sentiment }) => {
  if (s === 'Positive') return <ThumbsUp size={12} className="text-green-500" />;
  if (s === 'Negative') return <ThumbsDown size={12} className="text-red-500" />;
  return <Minus size={12} className="text-yellow-500" />;
};

const RelationshipGraph = ({ activeNode, onSelect }: { activeNode: string, onSelect: (id: string) => void }) => {
  return (
    <div className="relative w-full h-full bg-[#080b14] rounded overflow-hidden select-none group">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>

      <svg className="w-full h-full absolute inset-0 pointer-events-none">
        <defs>
          <marker id="arrow-reporting" markerWidth="10" markerHeight="10" refX="20" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#475569" />
          </marker>
          <marker id="arrow-influence" markerWidth="10" markerHeight="10" refX="20" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
          </marker>
        </defs>

        {/* Reporting Lines (Vertical/Hierarchical) */}
        {STAKEHOLDERS.map(s => {
          if (!s.reportsTo) return null;
          const manager = STAKEHOLDERS.find(m => m.id === s.reportsTo);
          if (!manager) return null;
          return (
            <line 
              key={`rep-${s.id}`}
              x1={`${manager.x}%`} y1={`${manager.y}%`}
              x2={`${s.x}%`} y2={`${s.y}%`}
              stroke="#334155" strokeWidth="2"
            />
          );
        })}

        {/* Influence/Conflict Lines (Curved/Colored) */}
        {RELATIONSHIPS.map((rel, i) => {
          const s = STAKEHOLDERS.find(n => n.id === rel.source);
          const t = STAKEHOLDERS.find(n => n.id === rel.target);
          if (!s || !t) return null;
          
          const color = rel.type === 'Conflict' ? '#ef4444' : rel.type === 'Trust' ? '#f59e0b' : '#10b981';
          const dash = rel.type === 'Reporting' ? '' : '5 5';
          
          return (
            <path
              key={`rel-${i}`}
              d={`M${s.x * 10},${s.y * 5} Q${(s.x + t.x) * 5},${(s.y + t.y) * 5 + 20} ${t.x * 10},${t.y * 5}`} // Simplified scale logic for SVG viewBox 0 0 1000 500
              fill="none"
              stroke={color}
              strokeWidth={rel.strength}
              strokeDasharray={dash}
              className="animate-pulse"
              style={{animationDuration: '3s'}}
              // Note: Coordinates in SVG path d need real pixel/viewBox values. 
              // For simplicity in this mock, we assume a viewBox of 0 0 100 100 percentages mapped to screen.
            />
          );
        })}
        
        {/* Simplified direct lines for this view implementation since viewBox mapping is tricky in raw SVG/React */}
         {RELATIONSHIPS.map((rel, i) => {
          const s = STAKEHOLDERS.find(n => n.id === rel.source);
          const t = STAKEHOLDERS.find(n => n.id === rel.target);
          if (!s || !t) return null;
          const color = rel.type === 'Conflict' ? '#ef4444' : rel.type === 'Trust' ? '#f59e0b' : '#10b981';
          return (
            <line 
              key={`line-${i}`}
              x1={`${s.x}%`} y1={`${s.y}%`}
              x2={`${t.x}%`} y2={`${t.y}%`}
              stroke={color}
              strokeWidth={rel.strength}
              strokeDasharray="4 4"
              opacity="0.6"
            />
          );
         })}

      </svg>

      {/* Nodes */}
      {STAKEHOLDERS.map(s => (
        <div
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center gap-2 group transition-all duration-300
            ${activeNode === s.id ? 'scale-110 z-20' : 'scale-100 z-10 hover:scale-105'}
          `}
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
        >
          {/* Avatar Ring */}
          <div className={`relative w-12 h-12 rounded-full border-2 bg-[#0b1221] flex items-center justify-center shadow-lg
             ${activeNode === s.id ? 'border-cyan-400 shadow-[0_0_15px_cyan]' : 'border-slate-600'}
          `}>
             <div className="text-sm font-bold text-white" style={{color: s.avatarColor}}>{s.name.charAt(0)}</div>
             
             {/* Status Dot */}
             <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0b1221] flex items-center justify-center
                ${s.sentiment === 'Positive' ? 'bg-green-500' : s.sentiment === 'Negative' ? 'bg-red-500' : 'bg-yellow-500'}
             `}>
               {s.role === 'Champion' ? <Crown size={8} className="text-black"/> : null}
               {s.role === 'Blocker' ? <Shield size={8} className="text-white"/> : null}
             </div>
          </div>
          
          {/* Label */}
          <div className={`flex flex-col items-center bg-black/60 backdrop-blur px-2 py-1 rounded border border-slate-700 transition-colors
             ${activeNode === s.id ? 'border-cyan-500' : ''}
          `}>
             <span className="text-xs font-bold text-white whitespace-nowrap">{s.name}</span>
             <span className="text-[9px] text-slate-400 whitespace-nowrap">{s.title}</span>
          </div>
        </div>
      ))}
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 p-2 bg-black/70 rounded border border-slate-700 flex flex-col gap-2">
         <div className="flex items-center gap-2 text-[10px] text-slate-400"><div className="w-3 h-0.5 bg-slate-500"></div> Reporting</div>
         <div className="flex items-center gap-2 text-[10px] text-slate-400"><div className="w-3 h-0.5 bg-green-500 border-b border-dashed"></div> Influence</div>
         <div className="flex items-center gap-2 text-[10px] text-slate-400"><div className="w-3 h-0.5 bg-red-500 border-b border-dotted"></div> Conflict</div>
      </div>
    </div>
  );
};

export const CustomerDecisionChainView: React.FC = () => {
  const [selectedStakeholderId, setSelectedStakeholderId] = useState('S1');
  const activeStakeholder = STAKEHOLDERS.find(s => s.id === selectedStakeholderId) || STAKEHOLDERS[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0b0a1f] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <Network size={14} /> Stakeholder Management
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户决策链 <span className="text-indigo-500">与人脉关系图谱</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Political Alignment</div>
                <div className="text-xl font-mono font-bold text-yellow-400">Mixed</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Champion Coverage</div>
                <div className="text-xl font-mono font-bold text-white">2/6</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Decision Velocity</div>
                <div className="text-xl font-mono font-bold text-indigo-400">Slow</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Roster */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex justify-between items-center px-1 mb-2">
               <h3 className="text-xs font-bold text-slate-400 uppercase">Stakeholder Roster</h3>
               <button className="text-indigo-400 hover:text-white"><Filter size={14}/></button>
           </div>

           <div className="flex flex-col gap-2">
               {STAKEHOLDERS.map(person => (
                   <div 
                     key={person.id}
                     onClick={() => setSelectedStakeholderId(person.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-200 relative group
                        ${selectedStakeholderId === person.id 
                            ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[inset_4px_0_0_#6366f1]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex items-center gap-3">
                           <div className="relative">
                               <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white border border-slate-700" style={{backgroundColor: `${person.avatarColor}20`}}>
                                   <span style={{color: person.avatarColor}}>{person.name.charAt(0)}</span>
                               </div>
                               <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0b1221] flex items-center justify-center bg-slate-800`}>
                                   <SentimentIcon s={person.sentiment} />
                               </div>
                           </div>
                           
                           <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-center mb-0.5">
                                   <span className={`text-sm font-bold truncate ${selectedStakeholderId === person.id ? 'text-white' : 'text-slate-300'}`}>{person.name}</span>
                               </div>
                               <div className="text-xs text-slate-500 truncate mb-1">{person.title}</div>
                               <RoleBadge role={person.role} />
                           </div>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: The Graph */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Graph Container */}
           <SciFiCard title="组织影响力网络 (Influence Nexus)" subtitle="INTERACTIVE" className="h-[450px] border-indigo-900/50" noPadding>
               <div className="w-full h-full p-2 relative flex flex-col">
                   <div className="flex-1">
                       <RelationshipGraph activeNode={selectedStakeholderId} onSelect={setSelectedStakeholderId} />
                   </div>
               </div>
           </SciFiCard>

           {/* Selected Person Strategy Card */}
           <SciFiCard title="接触策略 (Engagement Plan)" subtitle={activeStakeholder.name.toUpperCase()} className="border-slate-800">
               <div className="flex gap-6">
                   <div className="w-1/3 border-r border-slate-800 pr-4">
                       <div className="text-xs text-slate-500 uppercase mb-2">Current Stance</div>
                       <div className="flex items-center gap-2 mb-4">
                           <div className={`text-2xl font-bold ${activeStakeholder.sentiment === 'Positive' ? 'text-green-400' : activeStakeholder.sentiment === 'Negative' ? 'text-red-400' : 'text-yellow-400'}`}>
                               {activeStakeholder.sentiment}
                           </div>
                       </div>
                       
                       <div className="space-y-3">
                           <div>
                               <div className="flex justify-between text-xs mb-1">
                                   <span className="text-slate-400">Influence Power</span>
                                   <span className="text-white">{activeStakeholder.influence}/100</span>
                               </div>
                               <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                   <div className="bg-indigo-500 h-full" style={{width: `${activeStakeholder.influence}%`}}></div>
                               </div>
                           </div>
                           <div>
                               <div className="flex justify-between text-xs mb-1">
                                   <span className="text-slate-400">Support Level</span>
                                   <span className="text-white">{activeStakeholder.support > 0 ? '+' : ''}{activeStakeholder.support}</span>
                               </div>
                               <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden relative">
                                   <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-600"></div>
                                   <div 
                                     className={`h-full absolute top-0 ${activeStakeholder.support > 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                                     style={{
                                         left: activeStakeholder.support > 0 ? '50%' : `${50 + activeStakeholder.support/2}%`,
                                         width: `${Math.abs(activeStakeholder.support)/2}%`
                                     }}
                                   ></div>
                               </div>
                           </div>
                       </div>
                   </div>

                   <div className="flex-1">
                       <div className="text-xs text-slate-500 uppercase mb-2">Recommended Actions</div>
                       <div className="grid grid-cols-2 gap-3">
                           <div className="p-3 bg-slate-900/50 border border-slate-700 rounded hover:border-indigo-500/50 cursor-pointer group">
                               <div className="flex items-center gap-2 mb-1">
                                   <MessageSquare size={14} className="text-indigo-400" />
                                   <span className="text-xs font-bold text-slate-200 group-hover:text-white">1:1 Value Pitch</span>
                               </div>
                               <p className="text-[10px] text-slate-400">Schedule private session to address budget concerns.</p>
                           </div>
                           <div className="p-3 bg-slate-900/50 border border-slate-700 rounded hover:border-indigo-500/50 cursor-pointer group">
                               <div className="flex items-center gap-2 mb-1">
                                   <Users size={14} className="text-green-400" />
                                   <span className="text-xs font-bold text-slate-200 group-hover:text-white">Leverage Champion</span>
                               </div>
                               <p className="text-[10px] text-slate-400">Ask David Li (VP Eng) to endorse technical specs.</p>
                           </div>
                           <div className="p-3 bg-slate-900/50 border border-slate-700 rounded hover:border-indigo-500/50 cursor-pointer group">
                               <div className="flex items-center gap-2 mb-1">
                                   <FileText size={14} className="text-yellow-400" />
                                   <span className="text-xs font-bold text-slate-200 group-hover:text-white">Send Case Study</span>
                               </div>
                               <p className="text-[10px] text-slate-400">Share ROI report from similar industry project.</p>
                           </div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Power Matrix */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Power/Interest Matrix */}
           <SciFiCard title="权力/支持度矩阵" subtitle="STRATEGY MAP" className="h-[350px] border-slate-800">
               <div className="w-full h-full p-2 relative">
                   {/* Quadrant Labels */}
                   <div className="absolute top-2 right-2 text-[9px] text-green-400 font-bold bg-green-900/20 px-1 rounded">Champions</div>
                   <div className="absolute top-2 left-8 text-[9px] text-red-400 font-bold bg-red-900/20 px-1 rounded">Hostiles</div>
                   <div className="absolute bottom-8 right-2 text-[9px] text-blue-400 font-bold bg-blue-900/20 px-1 rounded">Supporters</div>
                   <div className="absolute bottom-8 left-8 text-[9px] text-slate-500 font-bold bg-slate-800 px-1 rounded">Neutrals</div>

                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                           <XAxis type="number" dataKey="x" name="Support" stroke="#64748b" domain={[-100, 100]} tick={{fontSize: 10}} label={{ value: 'Support (-100 to +100)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#64748b' }} />
                           <YAxis type="number" dataKey="y" name="Influence" stroke="#64748b" domain={[0, 100]} tick={{fontSize: 10}} label={{ value: 'Influence (0-100)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                           <ZAxis type="number" dataKey="z" range={[50, 400]} />
                           <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#6366f1', color: '#fff'}} />
                           <ReferenceLine y={50} stroke="#475569" strokeDasharray="3 3" />
                           <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" />
                           <Scatter name="Stakeholders" data={MATRIX_DATA} fill="#8884d8">
                               {MATRIX_DATA.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.fill} stroke="#fff" strokeWidth={1} />
                               ))}
                           </Scatter>
                       </ScatterChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Political Landscape Summary */}
           <SciFiCard title="政治态势总结" className="flex-1 border-slate-800">
               <div className="space-y-4">
                   <div className="flex items-center gap-3">
                       <div className="p-2 bg-green-900/20 rounded-full text-green-400 border border-green-900/50">
                           <UserCheck size={18} />
                       </div>
                       <div>
                           <div className="text-xs text-slate-400">Economic Buyer</div>
                           <div className="text-sm font-bold text-white">Neutral (Needs ROI)</div>
                       </div>
                   </div>
                   <div className="flex items-center gap-3">
                       <div className="p-2 bg-red-900/20 rounded-full text-red-400 border border-red-900/50">
                           <UserMinus size={18} />
                       </div>
                       <div>
                           <div className="text-xs text-slate-400">Key Blocker</div>
                           <div className="text-sm font-bold text-white">CFO (Budget Cut)</div>
                       </div>
                   </div>
                   <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-900/20 rounded-full text-blue-400 border border-blue-900/50">
                           <UserCheck size={18} />
                       </div>
                       <div>
                           <div className="text-xs text-slate-400">Technical Win</div>
                           <div className="text-sm font-bold text-white">Secured (CTO)</div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
