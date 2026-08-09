
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Activity, AlertTriangle, GitMerge, CheckCircle2, 
  XCircle, MessageSquare, Microscope, Share2, 
  BrainCircuit, ArrowRight, TrendingUp, Layers,
  Thermometer, Wind, Zap, Gauge, Users,
  Vote, Target, FileSignature, Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Line, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ScatterChart, Scatter, ZAxis, ReferenceLine, Cell
} from 'recharts';

// --- Types ---

interface TimeEvent {
  time: string;
  desc: string;
  type: 'Trigger' | 'Symptom' | 'Action' | 'System';
}

interface AnomalyMetric {
  time: string;
  normal: number;
  actual: number;
  deviation: number;
}

interface Hypothesis {
  id: string;
  title: string;
  probability: number;
  supporters: string[]; // Expert IDs
  status: 'Investigating' | 'Confirmed' | 'Rejected';
  evidence: number; // 0-100 strength
}

// --- Mock Data ---

const ANOMALY_META = {
  id: 'INC-2024-X92',
  title: '主汽轮机 #2 负荷突降异常',
  severity: 'High',
  duration: '00:45:12',
  status: 'Joint Analysis',
  affectedSystem: 'Steam Turbine Gen-2',
};

const TIMELINE_EVENTS: TimeEvent[] = [
  { time: '10:15:00', type: 'System', desc: '系统自动调节指令：负荷设定值由 80% 降至 70%' },
  { time: '10:15:05', type: 'Trigger', desc: '调节阀开度响应滞后 2.5s (阈值 0.5s)' },
  { time: '10:15:12', type: 'Symptom', desc: '一回路压力瞬时波动 (+15%)' },
  { time: '10:15:30', type: 'Symptom', desc: '主汽温下降速率超标' },
  { time: '10:20:00', type: 'Action', desc: '操作员手动介入：锁定阀位' },
];

const EXPERTS = [
  { id: 'E1', name: 'Dr. Zhang', role: 'Process Expert', avatar: '#0ea5e9', status: 'Online' },
  { id: 'E2', name: 'Mike Chen', role: 'Control Sys', avatar: '#f59e0b', status: 'Online' },
  { id: 'E3', name: 'Sarah Wu', role: 'Mechanical', avatar: '#8b5cf6', status: 'Analyzing' },
];

const HYPOTHESES_DATA: Hypothesis[] = [
  { id: 'H1', title: '电液转换器卡涩 (Servo Valve Stuck)', probability: 85, supporters: ['E1', 'E2'], status: 'Investigating', evidence: 90 },
  { id: 'H2', title: '控制逻辑死区设置不当 (Deadband)', probability: 40, supporters: [], status: 'Rejected', evidence: 30 },
  { id: 'H3', title: '主汽压力传感器故障 (Sensor Drift)', probability: 60, supporters: ['E3'], status: 'Investigating', evidence: 65 },
];

// Generate deviation curve
const DEVIATION_DATA = Array.from({length: 60}, (_, i) => {
  const t = i;
  const normal = 100 - Math.sin(t * 0.1) * 20;
  // Anomaly starts at t=30
  const actual = t < 30 ? normal + (Math.random()-0.5)*2 : normal - (t-30)*1.5 + (Math.random()-0.5)*5;
  return {
    time: `T+${t}s`,
    normal,
    actual,
    deviation: Math.abs(normal - actual)
  };
});

// --- Components ---

const ExpertAvatar = ({ expert, showStatus = true }: { expert: any, showStatus?: boolean }) => (
  <div className="relative group cursor-pointer" title={`${expert.name} - ${expert.role}`}>
    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white border-2 border-[#0b1221] shadow-lg text-xs" style={{backgroundColor: expert.avatar}}>
      {expert.name.charAt(0)}
    </div>
    {showStatus && (
      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0b1221] ${expert.status === 'Online' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
    )}
  </div>
);

const ProbabilityBar = ({ value }: { value: number }) => (
  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
    <div 
      className={`h-full transition-all duration-1000 ${value > 80 ? 'bg-red-500' : value > 50 ? 'bg-amber-500' : 'bg-blue-500'}`} 
      style={{width: `${value}%`}}
    ></div>
  </div>
);

export const OperationAnomalyAnalysisView: React.FC = () => {
  const [selectedHypothesis, setSelectedHypothesis] = useState<string | null>('H1');
  const [activeTab, setActiveTab] = useState<'Curve' | 'Correlation'>('Curve');

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#03060d] p-2">
      
      {/* 1. WAR ROOM HEADER */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-red-900/30 p-4 rounded-lg backdrop-blur-md">
         <div>
             <div className="flex items-center gap-3 mb-1">
                 <div className="p-1.5 bg-red-500/20 rounded text-red-500 animate-pulse border border-red-500/50">
                     <AlertTriangle size={18} />
                 </div>
                 <h1 className="text-xl font-bold text-white tracking-wide">联合研判作战室 (Joint Analysis Room)</h1>
                 <span className="px-2 py-0.5 rounded bg-red-900/40 border border-red-800 text-[10px] text-red-300 font-mono">
                     {ANOMALY_META.id}
                 </span>
             </div>
             <div className="flex gap-4 text-xs text-slate-400">
                 <span className="flex items-center gap-1"><Activity size={12} className="text-amber-400"/> Status: {ANOMALY_META.status}</span>
                 <span className="flex items-center gap-1"><Clock size={12}/> Elapsed: <span className="font-mono text-white">{ANOMALY_META.duration}</span></span>
                 <span className="flex items-center gap-1"><Target size={12}/> Subject: {ANOMALY_META.affectedSystem}</span>
             </div>
         </div>
         
         <div className="flex items-center gap-6">
             <div className="flex -space-x-2">
                 {EXPERTS.map(e => <ExpertAvatar key={e.id} expert={e} />)}
                 <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#0b1221] flex items-center justify-center text-xs text-slate-400 font-bold hover:bg-slate-700 cursor-pointer">+</div>
             </div>
             <div className="h-8 w-px bg-slate-700"></div>
             <button className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded font-bold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all">
                 <FileSignature size={16} /> 签署研判结论
             </button>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
         
         {/* LEFT: Context & Timeline (3 Cols) */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
             
             {/* Event Stream */}
             <SciFiCard title="异常时序流 (Event Stream)" subtitle="CHRONOLOGY" className="flex-1 border-slate-800">
                 <div className="relative pl-4 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 h-full overflow-y-auto custom-scrollbar">
                     {TIMELINE_EVENTS.map((evt, i) => (
                         <div key={i} className="relative group">
                             <div className={`absolute -left-[11px] top-1.5 w-2.5 h-2.5 rounded-full border-2 z-10 bg-[#03060d]
                                 ${evt.type === 'Trigger' ? 'border-red-500 bg-red-900' : 
                                   evt.type === 'Action' ? 'border-green-500' : 'border-slate-500'}
                             `}></div>
                             
                             <div className="text-[10px] font-mono text-slate-500 mb-0.5">{evt.time}</div>
                             <div className={`text-xs p-2 rounded border transition-colors
                                 ${evt.type === 'Trigger' ? 'bg-red-900/10 border-red-900/50 text-red-200' : 
                                   evt.type === 'Action' ? 'bg-green-900/10 border-green-900/50 text-green-200' : 
                                   'bg-slate-900/30 border-slate-800 text-slate-300'}
                             `}>
                                 <div className="font-bold mb-1 opacity-70 uppercase text-[9px]">{evt.type}</div>
                                 {evt.desc}
                             </div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>

             {/* Impact Scope */}
             <SciFiCard title="影响范围 (Impact Radius)" className="h-48 border-amber-900/30">
                 <div className="flex flex-col gap-3">
                     <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                         <div className="flex items-center gap-2">
                             <Zap size={14} className="text-yellow-400" />
                             <span className="text-xs text-slate-300">Power Output</span>
                         </div>
                         <span className="text-sm font-bold text-red-400">-12 MW</span>
                     </div>
                     <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                         <div className="flex items-center gap-2">
                             <Thermometer size={14} className="text-orange-400" />
                             <span className="text-xs text-slate-300">Exhaust Temp</span>
                         </div>
                         <span className="text-sm font-bold text-orange-300">+15 °C</span>
                     </div>
                     <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                         <div className="flex items-center gap-2">
                             <Gauge size={14} className="text-blue-400" />
                             <span className="text-xs text-slate-300">System Pressure</span>
                         </div>
                         <span className="text-sm font-bold text-green-400">Stable</span>
                     </div>
                 </div>
             </SciFiCard>

         </div>

         {/* CENTER: Analytical Workbench (6 Cols) */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
             
             {/* Main Chart Area */}
             <SciFiCard 
               title="多维偏差全息图 (Deviation Hologram)" 
               subtitle="LIVE ANALYSIS" 
               className="flex-[2] border-indigo-900/50 bg-[#080b16]" 
               noPadding
             >
                 <div className="flex flex-col h-full">
                     {/* Toolbar */}
                     <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                         <div className="flex bg-slate-900 rounded p-1">
                             <button 
                               onClick={() => setActiveTab('Curve')}
                               className={`px-3 py-1 text-xs rounded transition-all ${activeTab === 'Curve' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                             >
                                 Trend Curve
                             </button>
                             <button 
                               onClick={() => setActiveTab('Correlation')}
                               className={`px-3 py-1 text-xs rounded transition-all ${activeTab === 'Correlation' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                             >
                                 Correlation
                             </button>
                         </div>
                         <div className="flex gap-2 text-slate-500">
                             <button className="hover:text-indigo-400"><Layers size={16}/></button>
                             <button className="hover:text-indigo-400"><Share2 size={16}/></button>
                         </div>
                     </div>

                     {/* Chart Content */}
                     <div className="flex-1 w-full p-2">
                         <ResponsiveContainer width="100%" height="100%">
                             <ComposedChart data={DEVIATION_DATA} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                                 <defs>
                                     <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                         <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                     </linearGradient>
                                     <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                         <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                     </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                 <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={9} />
                                 <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[60, 110]} />
                                 <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#6366f1', fontSize: '12px'}} />
                                 <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                                 
                                 <Area type="monotone" dataKey="normal" name="Golden Batch (Ideal)" stroke="#10b981" fill="url(#colorNormal)" strokeWidth={2} strokeDasharray="5 5" />
                                 <Area type="monotone" dataKey="actual" name="Current Value" stroke="#ef4444" fill="url(#colorActual)" strokeWidth={2} />
                                 <Line type="monotone" dataKey="deviation" name="Delta" stroke="#f59e0b" strokeWidth={1} dot={false} />
                                 
                                 <ReferenceLine x="T+30s" stroke="#f59e0b" label={{value: 'Anomaly Start', fill: '#f59e0b', fontSize: 10}} />
                             </ComposedChart>
                         </ResponsiveContainer>
                     </div>
                 </div>
             </SciFiCard>

             {/* Evidence Panel */}
             <div className="h-48 grid grid-cols-2 gap-4">
                 <SciFiCard title="关联特征 (Features)" className="border-slate-800">
                     <div className="space-y-2 text-xs">
                         <div className="flex justify-between">
                             <span className="text-slate-400">Response Delay</span>
                             <span className="text-red-400 font-bold">2540 ms</span>
                         </div>
                         <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                             <div className="bg-red-500 h-full w-[85%]"></div>
                         </div>
                         
                         <div className="flex justify-between pt-2">
                             <span className="text-slate-400">Valve Stiction</span>
                             <span className="text-amber-400 font-bold">High</span>
                         </div>
                         <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                             <div className="bg-amber-500 h-full w-[60%]"></div>
                         </div>
                     </div>
                 </SciFiCard>
                 
                 <SciFiCard title="相似案例匹配" className="border-slate-800">
                     <div className="flex flex-col gap-2">
                         <div className="p-2 bg-slate-900/50 border border-slate-700 rounded flex justify-between items-center cursor-pointer hover:border-indigo-500">
                             <div>
                                 <div className="text-xs font-bold text-indigo-300">Case #8821</div>
                                 <div className="text-[10px] text-slate-500">Servo Valve Failure</div>
                             </div>
                             <div className="text-right">
                                 <div className="text-xs font-bold text-green-400">92%</div>
                                 <div className="text-[9px] text-slate-500">Match</div>
                             </div>
                         </div>
                         <div className="text-center">
                            <button className="text-[10px] text-slate-400 hover:text-white flex items-center justify-center w-full gap-1">
                                View Comparison <ArrowRight size={10} />
                            </button>
                         </div>
                     </div>
                 </SciFiCard>
             </div>

         </div>

         {/* RIGHT: Hypothesis & Resolution (3 Cols) */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
             
             {/* Hypothesis Battleground */}
             <SciFiCard title="归因假设竞擂 (Hypothesis)" subtitle="VOTING" className="border-indigo-900/50">
                 <div className="flex flex-col gap-3">
                     {HYPOTHESES_DATA.map((hyp) => (
                         <div 
                           key={hyp.id}
                           onClick={() => setSelectedHypothesis(hyp.id)}
                           className={`p-3 rounded border cursor-pointer transition-all relative overflow-hidden
                              ${selectedHypothesis === hyp.id 
                                  ? 'bg-indigo-900/20 border-indigo-500/50 shadow-[inset_2px_0_0_#6366f1]' 
                                  : 'bg-slate-900/30 border-slate-800 hover:border-slate-600'}
                              ${hyp.status === 'Rejected' ? 'opacity-50' : ''}
                           `}
                         >
                             <div className="flex justify-between items-start mb-1">
                                 <span className={`text-xs font-bold ${selectedHypothesis === hyp.id ? 'text-white' : 'text-slate-300'}`}>
                                     {hyp.title}
                                 </span>
                                 {hyp.status === 'Rejected' ? <XCircle size={14} className="text-red-500"/> : <Vote size={14} className="text-indigo-400"/>}
                             </div>
                             
                             <div className="flex items-center gap-2 mb-2">
                                 <span className="text-[10px] text-slate-500">Prob:</span>
                                 <span className={`text-xs font-mono font-bold ${hyp.probability > 70 ? 'text-green-400' : 'text-slate-200'}`}>
                                     {hyp.probability}%
                                 </span>
                             </div>
                             <ProbabilityBar value={hyp.probability} />
                             
                             {/* Supporters */}
                             <div className="flex items-center gap-1 mt-2 justify-end">
                                 <span className="text-[8px] text-slate-500 mr-1">Votes:</span>
                                 {hyp.supporters.map(s => {
                                     const expert = EXPERTS.find(e => e.id === s);
                                     return expert ? <div key={s} className="w-4 h-4 rounded-full text-[8px] flex items-center justify-center text-white" style={{backgroundColor: expert.avatar}}>{expert.name[0]}</div> : null;
                                 })}
                             </div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>

             {/* Action Plan */}
             <SciFiCard title="处置方案 (Resolution)" subtitle="DRAFT" className="flex-1 border-slate-800">
                 <div className="flex flex-col h-full gap-4">
                     <div className="p-3 bg-slate-900/50 border border-slate-700 rounded text-xs text-slate-300 leading-relaxed">
                         <div className="font-bold text-white mb-2 flex items-center gap-2">
                             <CheckCircle2 size={12} className="text-green-500" /> Recommended Action
                         </div>
                         Isolation of servo valve hydraulic circuit followed by manual actuation test. If stuck, switch to redundant controller.
                     </div>
                     
                     <div className="space-y-2">
                         <div className="flex justify-between text-[10px] text-slate-500 uppercase">
                             <span>Consensus</span>
                             <span className="text-white">High (2/3)</span>
                         </div>
                         <div className="flex justify-between text-[10px] text-slate-500 uppercase">
                             <span>Risk Level</span>
                             <span className="text-yellow-400">Medium</span>
                         </div>
                         <div className="flex justify-between text-[10px] text-slate-500 uppercase">
                             <span>Est. Time</span>
                             <span className="text-white">45 mins</span>
                         </div>
                     </div>

                     <div className="mt-auto grid grid-cols-2 gap-2">
                         <button className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors shadow-lg">
                             Approve Plan
                         </button>
                         <button className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 text-xs rounded transition-colors">
                             Request More Info
                         </button>
                     </div>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
