
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Users, Gavel, AlertTriangle, CheckCircle2, 
  TrendingUp, MessageSquare, Scale, BrainCircuit,
  Vote, ThumbsUp, ThumbsDown, Clock, ShieldAlert,
  ArrowRight, Mic2, FileText, XCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  ScatterChart, Scatter, ZAxis, ReferenceLine, Cell,
  PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';

// --- Types ---

interface Expert {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  status: 'Online' | 'Thinking' | 'Voting';
  authorityWeight: number; // 1-10, influence power
  vote?: string; // Solution ID
}

interface DiagnosisHypothesis {
  id: string;
  name: string;
  probability: number; // Avg probability from experts
  variance: number; // Disagreement level
  votes: number;
}

interface SolutionOption {
  id: string;
  title: string;
  risk: number; // 0-100
  cost: number; // 0-100 (Financial + Time)
  impact: number; // Size of bubble (Effectiveness)
  votes: number;
  description: string;
}

interface Argument {
  id: string;
  expertId: string;
  type: 'Pro' | 'Con' | 'Neutral';
  text: string;
  time: string;
}

// --- Mock Data ---

const EXPERTS: Expert[] = [
  { id: 'E1', name: 'Dr. Zhang', role: 'Chief Engineer', avatarColor: '#ef4444', status: 'Voting', authorityWeight: 10, vote: 'SOL-B' },
  { id: 'E2', name: 'Sarah Li', role: 'AI Specialist', avatarColor: '#8b5cf6', status: 'Online', authorityWeight: 8, vote: 'SOL-A' },
  { id: 'E3', name: 'Mike Chen', role: 'Ops Manager', avatarColor: '#f59e0b', status: 'Thinking', authorityWeight: 7 },
  { id: 'E4', name: 'Vendor Rep', role: 'OEM Support', avatarColor: '#10b981', status: 'Online', authorityWeight: 6 },
  { id: 'E5', name: 'Safety Officer', role: 'HSE Lead', avatarColor: '#3b82f6', status: 'Voting', authorityWeight: 9, vote: 'SOL-C' },
];

const HYPOTHESES: DiagnosisHypothesis[] = [
  { id: 'H1', name: 'Blade Fatigue', probability: 65, variance: 15, votes: 2 },
  { id: 'H2', name: 'Sensor Fault', probability: 25, variance: 40, votes: 1 }, // High disagreement
  { id: 'H3', name: 'Control Logic', probability: 10, variance: 5, votes: 2 },
];

const SOLUTIONS: SolutionOption[] = [
  { id: 'SOL-A', title: 'Emergency Shutdown', risk: 10, cost: 90, impact: 100, votes: 1, description: 'Immediate halt to prevent catastrophic failure. High production loss.' },
  { id: 'SOL-B', title: 'Load Reduction (50%)', risk: 40, cost: 30, impact: 60, votes: 2, description: 'Reduce operational load to mitigate vibration while maintaining partial output.' },
  { id: 'SOL-C', title: 'Online Calibration', risk: 80, cost: 10, impact: 40, votes: 1, description: 'Attempt to recalibrate sensors while running. High risk if actual mechanical failure.' },
];

const ARGUMENTS: Argument[] = [
  { id: 'A1', expertId: 'E1', type: 'Con', text: 'Vibration signature (1X harmonic) strongly suggests mechanical imbalance, not sensor error.', time: '10:45' },
  { id: 'A2', expertId: 'E2', type: 'Pro', text: 'AI model predicts 85% chance of blade crack propagation within 4 hours.', time: '10:46' },
  { id: 'A3', expertId: 'E4', type: 'Neutral', text: 'We saw similar readings in Unit 4 last year, turned out to be loose wiring.', time: '10:48' },
];

const CONSENSUS_DATA = [
  { name: 'Agreement', value: 65, fill: '#10b981' },
  { name: 'Divergence', value: 35, fill: '#ef4444' },
];

// --- Components ---

const ExpertCard: React.FC<{ expert: Expert }> = ({ expert }) => (
  <div className="flex items-center gap-3 p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-cyan-500/30 transition-all group">
    <div className="relative">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg border-2 border-slate-700" style={{backgroundColor: expert.avatarColor}}>
        {expert.name.charAt(0)}
      </div>
      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0b1221] flex items-center justify-center bg-slate-800 text-[8px]
          ${expert.vote ? 'bg-green-500 text-white' : 'bg-slate-600'}
      `}>
          {expert.vote ? <CheckCircle2 size={10} /> : '...'}
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-200 truncate">{expert.name}</span>
        <span className="text-[9px] text-cyan-400 bg-cyan-900/20 px-1 rounded border border-cyan-900/50">W:{expert.authorityWeight}</span>
      </div>
      <div className="text-[10px] text-slate-500 truncate">{expert.role}</div>
    </div>
    {expert.vote && (
        <div className="text-[10px] font-mono font-bold text-yellow-400 border border-yellow-900/50 px-1 rounded bg-yellow-900/10">
            {expert.vote.split('-')[1]}
        </div>
    )}
  </div>
);

const ChatBubble: React.FC<{ arg: Argument }> = ({ arg }) => {
  const expert = EXPERTS.find(e => e.id === arg.expertId);
  const color = arg.type === 'Pro' ? 'border-green-900/50 bg-green-950/10' : arg.type === 'Con' ? 'border-red-900/50 bg-red-950/10' : 'border-slate-800 bg-slate-900/30';
  
  return (
    <div className={`p-2 rounded border ${color} mb-2`}>
      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: expert?.avatarColor}}></div>
            {expert?.name}
        </span>
        <span className="text-[9px] text-slate-600">{arg.time}</span>
      </div>
      <p className="text-xs text-slate-400 leading-tight">{arg.text}</p>
      <div className={`text-[9px] mt-1 font-bold ${arg.type === 'Pro' ? 'text-green-500' : arg.type === 'Con' ? 'text-red-500' : 'text-slate-500'}`}>
          {arg.type.toUpperCase()}
      </div>
    </div>
  );
};

export const RemoteExpertDecisionView: React.FC = () => {
  const [selectedSolution, setSelectedSolution] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-red-900/50 pb-4 bg-gradient-to-r from-[#1f0a0a] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-500 mb-1 uppercase tracking-wider animate-pulse">
             <ShieldAlert size={14} /> Critical Incident Response
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             多专家会诊 <span className="text-red-500">联合决策台</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="px-4 py-2 bg-slate-900/80 border border-slate-700 rounded flex flex-col items-end">
               <span className="text-[10px] text-slate-500 uppercase">Session Timer</span>
               <span className="text-xl font-mono font-bold text-yellow-400">00:45:12</span>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[10px] text-slate-500 uppercase">Confidence Level</span>
               <span className="text-xl font-bold text-white">65% <span className="text-xs text-slate-500 font-normal">Moderate</span></span>
            </div>
            <button className="ml-4 flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all">
               <Gavel size={16} /> 最终裁决
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT: Expert Council */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           <SciFiCard title="专家委员会 (Council)" subtitle="ONLINE" className="h-full border-red-900/30">
               <div className="flex flex-col gap-3 h-full">
                   <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                       {EXPERTS.map(exp => <ExpertCard key={exp.id} expert={exp} />)}
                   </div>
                   
                   {/* Connection Status */}
                   <div className="mt-auto pt-4 border-t border-slate-800">
                       <div className="flex justify-between items-center text-xs mb-2">
                           <span className="text-slate-500">Audio Bridge</span>
                           <span className="text-green-400 flex items-center gap-1"><Mic2 size={10}/> Connected</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-500">Data Latency</span>
                           <span className="text-white font-mono">12ms</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* CENTER: Analysis & Matrix */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Row 1: Root Cause Debate */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[280px]">
               <SciFiCard title="归因分析差异度 (Divergence)" subtitle="ROOT CAUSE" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={HYPOTHESES} layout="vertical" margin={{left: 20}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                               <XAxis type="number" domain={[0, 100]} hide />
                               <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} tick={{fontSize: 10}} />
                               <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f0a0a', borderColor: '#ef4444'}} />
                               <Bar dataKey="probability" name="Probability %" barSize={15} radius={[0, 4, 4, 0]}>
                                   {HYPOTHESES.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#ef4444' : '#64748b'} />
                                   ))}
                               </Bar>
                               {/* Error bars simulation using another bar stack or custom shape is complex, using simplified visual */}
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="焦点辩论流 (Live Arguments)" subtitle="STREAM" className="border-slate-800">
                   <div className="h-full flex flex-col">
                       <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                           {ARGUMENTS.map(arg => <ChatBubble key={arg.id} arg={arg} />)}
                       </div>
                       <div className="mt-2 pt-2 border-t border-slate-800 flex gap-2">
                           <input type="text" placeholder="Add argument..." className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none focus:border-cyan-500 text-slate-200" />
                           <button className="bg-slate-800 hover:bg-slate-700 px-3 rounded text-xs text-white">Post</button>
                       </div>
                   </div>
               </SciFiCard>
           </div>

           {/* Row 2: Decision Matrix */}
           <SciFiCard title="解决方案博弈矩阵 (Trade-off Matrix)" subtitle="DECISION SUPPORT" className="h-[350px] border-cyan-900/50 bg-[#06080e]" noPadding>
               <div className="w-full h-full p-4 relative">
                   {/* Quadrant Labels */}
                   <div className="absolute top-4 left-4 text-[10px] font-bold text-green-500 bg-green-900/20 px-2 rounded">Safe & Cheap (Ideal)</div>
                   <div className="absolute top-4 right-4 text-[10px] font-bold text-yellow-500 bg-yellow-900/20 px-2 rounded">Safe but Expensive</div>
                   <div className="absolute bottom-10 right-4 text-[10px] font-bold text-red-500 bg-red-900/20 px-2 rounded">Risky & Expensive</div>
                   <div className="absolute bottom-10 left-4 text-[10px] font-bold text-orange-500 bg-orange-900/20 px-2 rounded">Risky but Cheap</div>

                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                           <XAxis type="number" dataKey="cost" name="Cost/Downtime" stroke="#64748b" label={{ value: 'Cost / Downtime Impact', position: 'insideBottom', offset: -10, fontSize: 10 }} />
                           <YAxis type="number" dataKey="risk" name="Risk" stroke="#64748b" label={{ value: 'Implementation Risk', angle: -90, position: 'insideLeft', fontSize: 10 }} reversed />
                           <ZAxis type="number" dataKey="impact" range={[100, 400]} name="Effectiveness" />
                           <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#0f0a0a', borderColor: '#3b82f6', color: '#fff'}} />
                           <Scatter name="Solutions" data={SOLUTIONS} onClick={(d) => setSelectedSolution(d.id)}>
                               {SOLUTIONS.map((entry, index) => (
                                   <Cell 
                                     key={`cell-${index}`} 
                                     fill={entry.id === selectedSolution ? '#fff' : entry.id === 'SOL-A' ? '#10b981' : entry.id === 'SOL-B' ? '#f59e0b' : '#ef4444'} 
                                     stroke={entry.id === selectedSolution ? '#0ea5e9' : 'none'}
                                     strokeWidth={3}
                                   />
                               ))}
                               <ReferenceLine y={50} stroke="#334155" />
                               <ReferenceLine x={50} stroke="#334155" />
                           </Scatter>
                       </ScatterChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Decision Engine */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Consensus Meter */}
           <SciFiCard title="共识仪表盘" subtitle="AGREEMENT" className="border-slate-800">
               <div className="flex items-center h-32">
                   <div className="w-32 h-32 relative">
                       <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                               <Pie 
                                 data={CONSENSUS_DATA} 
                                 innerRadius={25} 
                                 outerRadius={35} 
                                 paddingAngle={5} 
                                 dataKey="value"
                                 startAngle={180}
                                 endAngle={0}
                               >
                                   <Cell fill="#10b981" />
                                   <Cell fill="#ef4444" />
                               </Pie>
                           </PieChart>
                       </ResponsiveContainer>
                       <div className="absolute inset-0 flex items-center justify-center flex-col pt-4">
                           <span className="text-2xl font-bold text-white">65%</span>
                           <span className="text-[8px] text-slate-500 uppercase">Aligned</span>
                       </div>
                   </div>
                   <div className="flex-1 text-xs text-slate-400">
                       <p>Current consensus is <span className="text-yellow-400">Weak</span>.</p>
                       <p className="mt-2">Major disagreement on <strong>Risk Factor</strong>.</p>
                   </div>
               </div>
           </SciFiCard>

           {/* Solution Proposals */}
           <SciFiCard title="行动方案投票 (Voting)" subtitle="PROPOSALS" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-3">
                   {SOLUTIONS.map(sol => (
                       <div 
                         key={sol.id}
                         onClick={() => setSelectedSolution(sol.id)}
                         className={`p-3 rounded border cursor-pointer transition-all duration-300 relative overflow-hidden group
                            ${selectedSolution === sol.id 
                                ? 'bg-cyan-950/40 border-cyan-500 shadow-[inset_4px_0_0_#0ea5e9]' 
                                : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                         `}
                       >
                           <div className="flex justify-between items-start mb-1">
                               <span className="font-bold text-sm text-white">{sol.title}</span>
                               <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono flex items-center gap-1">
                                   <Vote size={10} /> {sol.votes}
                               </span>
                           </div>
                           <p className="text-[10px] text-slate-400 leading-tight mb-2">
                               {sol.description}
                           </p>
                           <div className="flex gap-2 text-[9px]">
                               <span className="bg-red-900/20 text-red-400 px-1 rounded">Risk: {sol.risk}%</span>
                               <span className="bg-yellow-900/20 text-yellow-400 px-1 rounded">Cost: {sol.cost}%</span>
                           </div>

                           {/* Action Overlay */}
                           {selectedSolution === sol.id && (
                               <div className="mt-3 pt-2 border-t border-white/10 flex gap-2 animate-in fade-in">
                                   <button className="flex-1 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded font-bold flex items-center justify-center gap-1">
                                       <ThumbsUp size={12}/> Vote
                                   </button>
                                   <button className="flex-1 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded flex items-center justify-center gap-1">
                                       <ThumbsDown size={12}/> Veto
                                   </button>
                               </div>
                           )}
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* AI Summary */}
           <div className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded flex items-start gap-3">
               <div className="p-1.5 bg-indigo-500/20 rounded-full text-indigo-400 animate-pulse">
                   <BrainCircuit size={16} />
               </div>
               <div>
                   <div className="text-xs font-bold text-indigo-200 mb-1">AI Recommendation</div>
                   <p className="text-[10px] text-slate-400 leading-tight">
                       Based on historical data (Case #8821), <strong>Solution B</strong> (Load Reduction) yields the highest success rate (82%) with minimal long-term damage.
                   </p>
               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
