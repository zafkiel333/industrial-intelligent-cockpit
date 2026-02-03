
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Siren, Microscope, FileSearch, Scale, 
  GitMerge, Clock, AlertTriangle, CheckCircle2, 
  XCircle, FileText, Fingerprint, Gavel,
  Activity, Rewind, Play, Pause, FastForward,
  Database, UserCheck, ShieldAlert, ArrowRight,
  ZoomIn, Lock, Eye, MapPin
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, BarChart, Bar, Cell, ComposedChart, Line
} from 'recharts';

// --- Types ---

interface AccidentMeta {
  id: string;
  type: string;
  location: string;
  timestamp: string;
  severity: 'Level 1 (Catastrophic)' | 'Level 2 (Severe)' | 'Level 3 (Major)' | 'Level 4 (Minor)';
  status: 'Investigating' | 'Determining' | 'Concluded';
  teamLead: string;
}

interface TimeSeriesPoint {
  time: number; // relative seconds
  pressure: number;
  temp: number;
  valvePos: number;
  event?: string;
}

interface EvidenceItem {
  id: string;
  type: 'Log' | 'Video' | 'Physical' | 'Audio';
  name: string;
  collectedBy: string;
  time: string;
  integrity: 'Verified' | 'Pending';
  hash: string;
}

interface CauseNode {
  id: string;
  label: string;
  prob: number; // 0-100%
  status: 'Proven' | 'Suspected' | 'Excluded';
  type: 'Direct' | 'Root' | 'Contributing';
}

// --- Mock Data ---

const META_INFO: AccidentMeta = {
  id: 'ACC-20240321-R204',
  type: 'Chemical Reactor Overpressure Explosion',
  location: 'Zone B - Reactor Unit 4',
  timestamp: '2024-03-21 14:15:32',
  severity: 'Level 1 (Catastrophic)',
  status: 'Investigating',
  teamLead: 'Chief Expert Dr. Chen'
};

// Generate Black Box Data (T-60s to T+10s)
const BLACK_BOX_DATA: TimeSeriesPoint[] = Array.from({length: 700}, (_, i) => {
  const t = (i / 10) - 60; // seconds relative to event
  let p = 2.4; // Normal pressure MPa
  let temp = 145; // Normal temp C
  let valve = 45; // Valve %

  if (t > -30) {
     // Anomaly starts
     p = 2.4 + Math.exp((t + 30) / 8);
     temp = 145 + Math.exp((t + 30) / 10);
  }
  
  if (t > -5) {
     // Critical spike
     valve = 0; // Valve failed to open
  }

  if (t > 0) {
      // Post event (sensor loss)
      p = 0;
      temp = 0;
      valve = 0;
  }

  return {
    time: parseFloat(t.toFixed(1)),
    pressure: p,
    temp: temp,
    valvePos: valve,
    event: t === 0 ? 'EXPLOSION' : t === -30 ? 'Runaway Reaction Start' : t === -5 ? 'Safety Valve Fail' : undefined
  };
});

const EVIDENCE_LIST: EvidenceItem[] = [
  { id: 'E-001', type: 'Log', name: 'DCS Historian Logs', collectedBy: 'System', time: '14:16:00', integrity: 'Verified', hash: 'a1b2...c3d4' },
  { id: 'E-002', type: 'Video', name: 'CCTV-04 Footage', collectedBy: 'Security', time: '14:20:00', integrity: 'Verified', hash: 'e5f6...g7h8' },
  { id: 'E-003', type: 'Physical', name: 'Relief Valve Fragment', collectedBy: 'Field Team', time: '15:30:00', integrity: 'Pending', hash: 'N/A' },
  { id: 'E-004', type: 'Audio', name: 'Control Room Voice', collectedBy: 'Recorder', time: '14:15:00', integrity: 'Verified', hash: '9988...7766' },
];

const FAILURE_TREE: CauseNode[] = [
  { id: 'C1', label: 'Cooling System Failure', prob: 20, status: 'Excluded', type: 'Contributing' },
  { id: 'C2', label: 'Catalyst Feed Error', prob: 15, status: 'Excluded', type: 'Contributing' },
  { id: 'C3', label: 'Safety Valve Stuck', prob: 95, status: 'Proven', type: 'Direct' },
  { id: 'C4', label: 'Maintenance Oversight', prob: 88, status: 'Suspected', type: 'Root' },
  { id: 'C5', label: 'Operator Delay', prob: 40, status: 'Suspected', type: 'Contributing' },
];

const EXPERT_VOTES = [
  { expert: 'Dr. Zhang', vote: 'Mechanical Failure', confidence: 'High' },
  { expert: 'Eng. Li', vote: 'Mechanical Failure', confidence: 'High' },
  { expert: 'Prof. Wu', vote: 'Process Control', confidence: 'Medium' },
];

// --- Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const color = 
    status === 'Proven' ? 'bg-red-900/50 text-red-400 border-red-700' :
    status === 'Suspected' ? 'bg-yellow-900/50 text-yellow-400 border-yellow-700' :
    'bg-green-900/50 text-green-400 border-green-700';
    
  return <span className={`text-[10px] px-2 py-0.5 rounded border ${color}`}>{status}</span>;
};

const EvidenceIcon = ({ type }: { type: string }) => {
  switch(type) {
    case 'Log': return <Database size={14} className="text-blue-400" />;
    case 'Video': return <Eye size={14} className="text-purple-400" />;
    case 'Physical': return <Microscope size={14} className="text-orange-400" />;
    case 'Audio': return <Activity size={14} className="text-green-400" />;
    default: return <FileText size={14} />;
  }
};

const LogicTreeVisualization = () => {
  return (
    <div className="w-full h-full relative bg-[#080b16] rounded border border-slate-800 p-4">
       {/* SVG Connector Lines */}
       <svg className="absolute inset-0 w-full h-full pointer-events-none">
           <path d="M400,50 L400,100" stroke="#475569" strokeWidth="2" />
           <path d="M400,100 L200,180" stroke="#475569" strokeWidth="2" />
           <path d="M400,100 L600,180" stroke="#475569" strokeWidth="2" />
           <path d="M200,220 L100,300" stroke="#475569" strokeWidth="2" />
           <path d="M200,220 L300,300" stroke="#475569" strokeWidth="2" />
       </svg>

       {/* Event Node (Top) */}
       <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-900/80 border border-red-500 text-white px-4 py-2 rounded shadow-[0_0_20px_rgba(220,38,38,0.5)] z-10 text-center">
           <div className="text-xs font-bold uppercase text-red-300">Incident Event</div>
           <div className="font-bold">Reactor Explosion</div>
       </div>

       {/* Branch Nodes */}
       <div className="absolute top-[180px] left-[200px] -translate-x-1/2 -translate-y-1/2">
           <div className="bg-slate-900 border border-slate-600 p-2 rounded text-center w-40 hover:border-yellow-500 cursor-pointer transition-colors group">
               <div className="text-[10px] text-slate-400">Direct Cause</div>
               <div className="text-sm font-bold text-white group-hover:text-yellow-400">Overpressure</div>
           </div>
       </div>

       <div className="absolute top-[180px] left-[600px] -translate-x-1/2 -translate-y-1/2">
           <div className="bg-slate-900 border border-green-600 p-2 rounded text-center w-40 opacity-50">
               <div className="text-[10px] text-slate-400">External Factor</div>
               <div className="text-sm font-bold text-slate-300">Power Loss</div>
               <div className="text-[9px] text-green-500 mt-1">EXCLUDED</div>
           </div>
       </div>

       {/* Root Nodes */}
       <div className="absolute top-[300px] left-[100px] -translate-x-1/2 -translate-y-1/2">
           <div className="bg-red-950/40 border border-red-500 p-2 rounded text-center w-40 hover:scale-105 transition-transform cursor-pointer">
               <div className="text-[10px] text-red-300">Root Cause A</div>
               <div className="text-sm font-bold text-white">Valve Mech Failure</div>
               <div className="w-full bg-slate-800 h-1 mt-1 rounded overflow-hidden">
                   <div className="h-full bg-red-500 w-[95%]"></div>
               </div>
           </div>
       </div>

       <div className="absolute top-[300px] left-[300px] -translate-x-1/2 -translate-y-1/2">
           <div className="bg-yellow-900/30 border border-yellow-500 p-2 rounded text-center w-40 hover:scale-105 transition-transform cursor-pointer">
               <div className="text-[10px] text-yellow-300">Root Cause B</div>
               <div className="text-sm font-bold text-white">Maintenance Miss</div>
               <div className="w-full bg-slate-800 h-1 mt-1 rounded overflow-hidden">
                   <div className="h-full bg-yellow-500 w-[88%]"></div>
               </div>
           </div>
       </div>
    </div>
  );
};

export const SafetyAccidentIdentificationView: React.FC = () => {
  const [playbackTime, setPlaybackTime] = useState(-30);
  const [isPlaying, setIsPlaying] = useState(false);

  // Playback logic
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackTime(prev => {
          if (prev >= 10) {
            setIsPlaying(false);
            return -60;
          }
          return prev + 0.5;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentDataPoint = BLACK_BOX_DATA.find(d => d.time >= playbackTime) || BLACK_BOX_DATA[BLACK_BOX_DATA.length-1];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200 bg-[#050505]">
      
      {/* 1. Incident Command Header */}
      <div className="flex justify-between items-stretch bg-gradient-to-r from-red-950/50 to-slate-900/50 border-b border-red-900/30 p-4">
         <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-red-900/20 border border-red-600 rounded flex items-center justify-center text-red-500 shadow-[0_0_30px_rgba(220,38,38,0.3)] animate-pulse-slow">
                 <Siren size={32} />
             </div>
             <div>
                 <div className="flex items-center gap-2 mb-1">
                     <span className="bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider">{META_INFO.severity}</span>
                     <span className="text-xs text-slate-500 font-mono">CASE ID: {META_INFO.id}</span>
                 </div>
                 <h1 className="text-2xl font-bold text-white tracking-wide">{META_INFO.type}</h1>
                 <div className="flex gap-4 text-xs text-slate-400 mt-1">
                     <span className="flex items-center gap-1"><Clock size={12} className="text-red-400"/> {META_INFO.timestamp}</span>
                     <span className="flex items-center gap-1"><MapPin size={12}/> {META_INFO.location}</span>
                     <span className="flex items-center gap-1"><UserCheck size={12}/> Lead: {META_INFO.teamLead}</span>
                 </div>
             </div>
         </div>
         
         <div className="flex flex-col items-end justify-center gap-2">
             <div className="text-right">
                 <div className="text-[10px] text-slate-500 uppercase">Investigation Status</div>
                 <div className="text-xl font-bold text-yellow-400 flex items-center gap-2 justify-end">
                     <Activity size={16} className="animate-spin-slow" /> {META_INFO.status}
                 </div>
             </div>
             <div className="flex gap-2">
                 <button className="px-4 py-1.5 bg-red-700/50 hover:bg-red-600 border border-red-500 text-white text-xs font-bold rounded transition-colors flex items-center gap-2">
                     <ShieldAlert size={12} /> Seize Evidence
                 </button>
             </div>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden px-4 pb-4">
         
         {/* LEFT COLUMN: Evidence & Timeline */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
             
             {/* Evidence Locker */}
             <SciFiCard title="物证与数据链 (Evidence)" subtitle="CHAIN OF CUSTODY" className="border-slate-800">
                 <div className="flex flex-col gap-2">
                     {EVIDENCE_LIST.map(ev => (
                         <div key={ev.id} className="p-2 bg-slate-900/50 border border-slate-700 rounded hover:border-cyan-500 transition-colors group cursor-pointer">
                             <div className="flex justify-between items-start mb-1">
                                 <div className="flex items-center gap-2">
                                     <EvidenceIcon type={ev.type} />
                                     <span className="text-xs font-bold text-slate-200 group-hover:text-white">{ev.name}</span>
                                 </div>
                                 {ev.integrity === 'Verified' ? (
                                     <CheckCircle2 size={12} className="text-green-500" />
                                 ) : (
                                     <AlertTriangle size={12} className="text-yellow-500" />
                                 )}
                             </div>
                             <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                                 <span>{ev.time}</span>
                                 <span className="flex items-center gap-1"><Fingerprint size={8}/> {ev.hash.substring(0, 8)}...</span>
                             </div>
                         </div>
                     ))}
                 </div>
                 <button className="w-full mt-3 py-2 border border-dashed border-slate-700 text-slate-500 text-xs rounded hover:text-white hover:border-slate-500 transition-colors flex items-center justify-center gap-2">
                     <ZoomIn size={12} /> View Evidence Room
                 </button>
             </SciFiCard>

             {/* SOE (Sequence of Events) */}
             <SciFiCard title="时序复盘 (SOE)" subtitle="MILLISECOND LOG" className="flex-1 border-red-900/30">
                 <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-700 h-full overflow-y-auto custom-scrollbar">
                     <div className="absolute left-[7px] top-1/2 w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                     {[
                        { t: '-30m', desc: 'Process normal. Load 85%.', color: 'bg-slate-500' },
                        { t: '-05m', desc: 'Warning: Temp > 140°C.', color: 'bg-yellow-500' },
                        { t: '-30s', desc: 'Critical: Pressure Surge.', color: 'bg-orange-500' },
                        { t: '-05s', desc: 'Valve Actuation Fail.', color: 'bg-red-500' },
                        { t: '00.00', desc: 'INCIDENT: RUPTURE', color: 'bg-red-600 animate-pulse' },
                        { t: '+02s', desc: 'ESD System Triggered.', color: 'bg-blue-500' },
                     ].map((evt, i) => (
                         <div key={i} className="relative group">
                             <div className={`absolute -left-[19px] top-1.5 w-2 h-2 rounded-full ${evt.color}`}></div>
                             <span className="text-[10px] font-mono text-slate-500 block mb-0.5">{evt.t}</span>
                             <div className="text-xs text-slate-300 font-bold">{evt.desc}</div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>

         </div>

         {/* CENTER COLUMN: Analysis Workbench */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
             
             {/* Black Box Replay */}
             <SciFiCard title="黑匣子数据回放 (Black Box Replay)" subtitle="T-60s to T+10s" className="flex-[2] border-red-900/50 bg-[#0a0505]" noPadding>
                 <div className="w-full h-full p-4 flex flex-col">
                     {/* Playback Monitor */}
                     <div className="flex justify-between items-center mb-4 bg-black/40 p-2 rounded border border-red-900/30">
                         <div className="flex gap-4 font-mono text-sm">
                             <div className="text-red-400">T: {playbackTime.toFixed(1)}s</div>
                             <div className="text-white">P: {currentDataPoint.pressure.toFixed(2)} MPa</div>
                             <div className="text-white">T: {currentDataPoint.temp.toFixed(1)} °C</div>
                             <div className="text-white">V: {currentDataPoint.valvePos.toFixed(0)} %</div>
                         </div>
                         <div className="flex gap-2">
                             <button className="p-1 hover:text-white text-slate-400"><Rewind size={16}/></button>
                             <button onClick={() => setIsPlaying(!isPlaying)} className="p-1 hover:text-white text-red-500">
                                 {isPlaying ? <Pause size={16}/> : <Play size={16}/>}
                             </button>
                             <button className="p-1 hover:text-white text-slate-400"><FastForward size={16}/></button>
                         </div>
                     </div>

                     {/* Charts */}
                     <div className="flex-1">
                         <ResponsiveContainer width="100%" height="100%">
                             <ComposedChart data={BLACK_BOX_DATA} margin={{top: 5, right: 20, bottom: 5, left: 0}}>
                                 <defs>
                                     <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                         <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                     </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                 <XAxis dataKey="time" type="number" stroke="#64748b" tick={{fontSize: 10}} domain={[-60, 10]} allowDataOverflow />
                                 <YAxis yAxisId="left" stroke="#ef4444" tick={{fontSize: 10}} label={{ value: 'Pressure', angle: -90, position: 'insideLeft', fill: '#ef4444', fontSize: 10 }} />
                                 <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" tick={{fontSize: 10}} domain={[0, 200]} />
                                 <Tooltip contentStyle={{backgroundColor: '#0f0505', borderColor: '#ef4444', fontSize: '12px'}} labelFormatter={(v) => `T${v}s`} />
                                 
                                 {/* Event Lines */}
                                 <ReferenceLine x={-30} stroke="#f59e0b" strokeDasharray="3 3" label={{value:'Anomaly', fill:'#f59e0b', fontSize:10}} />
                                 <ReferenceLine x={-5} stroke="#f59e0b" strokeDasharray="3 3" label={{value:'Fail', fill:'#f59e0b', fontSize:10}} />
                                 <ReferenceLine x={0} stroke="#ef4444" label={{value:'EXPLOSION', fill:'red', fontSize:12, fontWeight:'bold'}} />
                                 
                                 {/* Playhead */}
                                 <ReferenceLine x={playbackTime} stroke="#fff" />

                                 <Area yAxisId="left" type="monotone" dataKey="pressure" stroke="#ef4444" fill="url(#colorPressure)" strokeWidth={2} name="Pressure" />
                                 <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} dot={false} name="Temp" />
                                 <Line yAxisId="right" type="step" dataKey="valvePos" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Valve %" />
                             </ComposedChart>
                         </ResponsiveContainer>
                     </div>
                 </div>
             </SciFiCard>

             {/* Logic Failure Tree */}
             <SciFiCard title="失效逻辑树 (Fault Tree Analysis)" subtitle="ROOT CAUSE" className="flex-1 border-slate-800 bg-[#080b16]">
                 <div className="w-full h-full p-2 relative">
                     <LogicTreeVisualization />
                 </div>
             </SciFiCard>

         </div>

         {/* RIGHT: Verdict & Report */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
             
             {/* Expert Consensus */}
             <SciFiCard title="专家组定责 (Consensus)" subtitle="VOTING" className="border-indigo-900/30">
                 <div className="flex flex-col gap-3">
                     {EXPERT_VOTES.map((vote, i) => (
                         <div key={i} className="flex justify-between items-center p-2 bg-slate-900/40 border border-slate-800 rounded">
                             <div>
                                 <div className="text-xs font-bold text-slate-200">{vote.expert}</div>
                                 <div className="text-[10px] text-slate-500">Vote: {vote.vote}</div>
                             </div>
                             <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${vote.confidence === 'High' ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'}`}>
                                 {vote.confidence} Conf.
                             </span>
                         </div>
                     ))}
                 </div>
                 <div className="mt-3 pt-3 border-t border-slate-800 text-center">
                     <div className="text-xs text-slate-400 mb-1">Final Conclusion Probability</div>
                     <div className="text-xl font-bold text-red-500">95.2%</div>
                     <div className="text-[10px] text-red-300">Mechanical Failure (Safety Valve)</div>
                 </div>
             </SciFiCard>

             {/* Impact Assessment */}
             <SciFiCard title="事故损失评估" subtitle="IMPACT" className="border-slate-800">
                 <div className="space-y-3">
                     <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-400">Direct Economic Loss</span>
                         <span className="text-white font-mono">¥ 2,450,000</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-400">Production Downtime</span>
                         <span className="text-white font-mono">48 Hours</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-400">Casualties</span>
                         <span className="text-green-400 font-bold">0 (None)</span>
                     </div>
                     <div className="w-full bg-slate-800 h-px my-1"></div>
                     <div className="text-[10px] text-slate-500 italic">
                         * Environmental impact assessment pending lab results.
                     </div>
                 </div>
             </SciFiCard>

             {/* Report Generation */}
             <SciFiCard title="结案报告生成" className="flex-1 border-slate-800 bg-slate-900/20">
                 <div className="flex flex-col h-full gap-4">
                     <div className="flex-1 space-y-2">
                         <div className="flex items-center gap-2 p-2 border border-slate-700 rounded text-xs text-slate-300 hover:bg-slate-800 cursor-pointer">
                             <CheckCircle2 size={14} className="text-green-500" /> Executive Summary
                         </div>
                         <div className="flex items-center gap-2 p-2 border border-slate-700 rounded text-xs text-slate-300 hover:bg-slate-800 cursor-pointer">
                             <CheckCircle2 size={14} className="text-green-500" /> Evidence Logs (Full)
                         </div>
                         <div className="flex items-center gap-2 p-2 border border-slate-700 rounded text-xs text-slate-300 hover:bg-slate-800 cursor-pointer">
                             <CheckCircle2 size={14} className="text-green-500" /> CAPA Plan (Preventive)
                         </div>
                     </div>
                     
                     <button className="w-full py-3 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition-colors">
                         <Gavel size={14} /> Finalize & Archive Case
                     </button>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};