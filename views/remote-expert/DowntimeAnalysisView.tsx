
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AlertTriangle, Clock, Activity, FileText, 
  Search, Play, Pause, SkipBack, SkipForward,
  Rewind, FastForward, GitCommit, GitPullRequest,
  CheckCircle2, XCircle, Microscope, Layers,
  Database, ShieldAlert, ArrowRight, UserCheck,
  FileSignature, Fingerprint, MapPin, Zap,
  Binary, Network, AlignLeft
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, BarChart, Bar, Cell, ComposedChart, Line, Legend
} from 'recharts';

// --- Types ---

interface TripEvent {
  id: string;
  timestamp: string;
  ms: number; // milliseconds relative to T0
  type: 'Alarm' | 'Trip' | 'Action' | 'State';
  description: string;
  source: string;
  isFirstOut?: boolean; // Is this the root trigger?
}

interface SignalPoint {
  time: number; // seconds relative to T0
  speed: number; // RPM
  vibration: number; // mm/s
  temp: number; // C
  valve: number; // %
  tripSignal: number; // 0 or 1
}

interface RootCauseCandidate {
  id: string;
  category: string;
  name: string;
  probability: number;
  evidence: string;
  status: 'Confirmed' | 'Suspected' | 'Excluded';
}

// --- Mock Data ---

const INCIDENT_META = {
  id: 'TRIP-20240321-GT02',
  asset: '#2 燃气轮机 (SGT-800)',
  tripTime: '2024-03-21 14:32:05.450',
  duration: '停机 4h 12m',
  lossEstimate: '¥ 450,000',
  status: 'Analysis In Progress',
  team: '专家组 A (动力/自控)'
};

const SOE_DATA: TripEvent[] = [
  { id: 'E1', timestamp: '14:32:05.120', ms: -330, type: 'State', description: '负荷突变 (Load Rejection 10%)', source: 'Grid' },
  { id: 'E2', timestamp: '14:32:05.350', ms: -100, type: 'Alarm', description: '轴承#2 振动高高 (VIB_HH)', source: 'Bently Nevada' },
  { id: 'E3', timestamp: '14:32:05.450', ms: 0, type: 'Trip', description: '保护动作：紧急停机 (ESD)', source: 'Protection Relay', isFirstOut: true },
  { id: 'E4', timestamp: '14:32:05.480', ms: 30, type: 'Action', description: '主燃料阀关闭 (Fuel Valve Close)', source: 'TCS' },
  { id: 'E5', timestamp: '14:32:05.800', ms: 350, type: 'State', description: '转速开始下降', source: 'Speed Sensor' },
  { id: 'E6', timestamp: '14:32:06.200', ms: 750, type: 'Alarm', description: '发电机逆功率', source: 'Generator Protection' },
];

const ROOT_CAUSES: RootCauseCandidate[] = [
  { id: 'RC1', category: 'Mechanical', name: '转子瞬时不平衡 (Rotor Imbalance)', probability: 85, evidence: '1X 频分量突增', status: 'Suspected' },
  { id: 'RC2', category: 'Control', name: '伺服阀卡涩 (Servo Stuck)', probability: 40, evidence: '阀位反馈滞后', status: 'Excluded' },
  { id: 'RC3', category: 'Grid', name: '电网波动冲击 (Grid Shock)', probability: 60, evidence: '负荷突变记录', status: 'Suspected' },
];

// Generate T-10s to T+10s data
const BLACKBOX_DATA: SignalPoint[] = Array.from({length: 200}, (_, i) => {
  const t = (i - 100) / 10; // -10s to +10s
  
  let speed = 3000;
  let vib = 2.5;
  let valve = 85;
  let trip = 0;

  if (t > -0.3) { // Anomaly starts
      vib = 2.5 + Math.random() * 0.5 + (t + 0.3) * 20; // Rapid vib rise
      if (vib > 12) vib = 12; // Max sensor reading
  }
  
  if (t >= 0) { // Trip happened
      trip = 1;
      valve = Math.max(0, 85 - t * 200); // Valve closes fast
      if (t > 0.5) speed = 3000 * Math.exp(-(t-0.5)*0.1); // Spindown
  } else {
      // Normal fluctuation
      vib += Math.sin(t*10) * 0.1;
  }

  return {
    time: t,
    speed,
    vibration: vib,
    temp: 540 + Math.random() * 2,
    valve,
    tripSignal: trip
  };
});

// --- Components ---

const LogicGate = ({ label, status, type }: { label: string, status: boolean, type: 'AND' | 'OR' | 'INPUT' }) => (
  <div className={`flex items-center gap-2 p-2 rounded border ${status ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-900/50 border-slate-700'}`}>
    <div className={`w-2 h-2 rounded-full ${status ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-slate-600'}`}></div>
    <div className="flex flex-col">
        <span className="text-[10px] text-slate-500 font-bold uppercase">{type}</span>
        <span className={`text-xs font-mono ${status ? 'text-white' : 'text-slate-400'}`}>{label}</span>
    </div>
  </div>
);

export const DowntimeAnalysisView: React.FC = () => {
  const [scrubberTime, setScrubberTime] = useState(0); // Index in BLACKBOX_DATA
  const [verdict, setVerdict] = useState<string>('');
  const [activeTab, setActiveTab] = useState('waveform');

  const currentSignal = BLACKBOX_DATA[scrubberTime] || BLACKBOX_DATA[100]; // Default to T0

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#020305]">
      
      {/* 1. Header: Incident Dossier */}
      <div className="flex justify-between items-stretch bg-[#080b14] border-b border-red-900/30 p-4">
         <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-red-950/30 border border-red-600/50 rounded flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)] animate-pulse-slow">
                 <AlertTriangle size={32} />
             </div>
             <div>
                 <div className="flex items-center gap-3 mb-1">
                     <span className="bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider">Trip Event</span>
                     <span className="text-xs text-slate-500 font-mono">ID: {INCIDENT_META.id}</span>
                 </div>
                 <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                    {INCIDENT_META.asset} <span className="text-slate-600">|</span> 非计划停机分析
                 </h1>
                 <div className="flex gap-6 text-xs text-slate-400 mt-1">
                     <span className="flex items-center gap-1"><Clock size={12} className="text-red-400"/> T0: {INCIDENT_META.tripTime}</span>
                     <span className="flex items-center gap-1"><Zap size={12} className="text-yellow-400"/> Loss: {INCIDENT_META.lossEstimate}</span>
                 </div>
             </div>
         </div>
         
         <div className="flex flex-col items-end justify-center gap-2">
             <div className="flex bg-slate-900 p-1 rounded border border-slate-700">
                 <button 
                    onClick={() => setActiveTab('waveform')}
                    className={`px-4 py-1 text-xs font-bold uppercase rounded transition-all ${activeTab === 'waveform' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                 >
                     Waveform
                 </button>
                 <button 
                    onClick={() => setActiveTab('logic')}
                    className={`px-4 py-1 text-xs font-bold uppercase rounded transition-all ${activeTab === 'logic' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                 >
                     Logic Trace
                 </button>
             </div>
             <div className="text-[10px] text-slate-500">
                 Auto-generated by: <span className="text-cyan-400">Diagnosis Engine v4.2</span>
             </div>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 px-4 pb-4">
         
         {/* LEFT: Sequence of Events (SOE) */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-hidden">
             
             <SciFiCard title="SOE 毫秒级时序记录" subtitle="PRECISION LOG" className="flex-1 border-slate-800 bg-[#0a0c10]">
                 <div className="relative pl-6 space-y-0 h-full overflow-y-auto custom-scrollbar py-2">
                     {/* Timeline Line */}
                     <div className="absolute left-[11px] top-0 bottom-0 w-px bg-slate-800"></div>
                     <div className="absolute left-[11px] top-1/2 w-px h-full bg-slate-800"></div> {/* Just to extend line */}

                     {SOE_DATA.map((evt, i) => (
                         <div key={i} className={`relative py-3 group ${evt.ms === 0 ? 'bg-red-900/10 -mx-4 px-10 border-y border-red-900/30' : 'pl-4'}`}>
                             {/* Node Dot */}
                             <div className={`absolute left-[-5px] top-4 w-2.5 h-2.5 rounded-full border-2 z-10 
                                 ${evt.ms === 0 ? 'bg-red-500 border-red-500 scale-125 shadow-[0_0_10px_red]' : 
                                   evt.ms < 0 ? 'bg-slate-900 border-slate-500' : 'bg-slate-900 border-indigo-500'}
                             `}></div>
                             
                             <div className="flex justify-between items-baseline mb-0.5">
                                 <span className={`font-mono text-[10px] ${evt.ms === 0 ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                                     {evt.ms > 0 ? `+${evt.ms}` : evt.ms} ms
                                 </span>
                                 <span className="text-[9px] text-slate-600 bg-slate-900 px-1 rounded border border-slate-800">{evt.source}</span>
                             </div>
                             
                             <div className={`text-xs font-bold ${evt.ms === 0 ? 'text-white' : 'text-slate-300'}`}>
                                 {evt.description}
                             </div>
                             
                             {evt.isFirstOut && (
                                 <div className="mt-1 inline-flex items-center gap-1 text-[9px] text-red-500 font-bold border border-red-900/50 px-1.5 py-0.5 rounded bg-red-950/30">
                                     <AlertTriangle size={8} /> FIRST OUT
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
             </SciFiCard>

             {/* Environmental Snapshot */}
             <SciFiCard title="停机工况快照" subtitle="T=0" className="h-40 border-slate-800">
                 <div className="grid grid-cols-2 gap-2 text-xs">
                     <div className="p-2 bg-slate-900/50 rounded border border-slate-700 flex justify-between">
                         <span className="text-slate-500">Load</span>
                         <span className="text-white font-mono">24.5 MW</span>
                     </div>
                     <div className="p-2 bg-slate-900/50 rounded border border-slate-700 flex justify-between">
                         <span className="text-slate-500">Grid Freq</span>
                         <span className="text-red-400 font-mono">49.2 Hz</span>
                     </div>
                     <div className="p-2 bg-slate-900/50 rounded border border-slate-700 flex justify-between">
                         <span className="text-slate-500">Amb. Temp</span>
                         <span className="text-white font-mono">22 °C</span>
                     </div>
                     <div className="p-2 bg-slate-900/50 rounded border border-slate-700 flex justify-between">
                         <span className="text-slate-500">Fuel Press</span>
                         <span className="text-white font-mono">3.2 MPa</span>
                     </div>
                 </div>
             </SciFiCard>

         </div>

         {/* CENTER: The Black Box Analysis */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
             
             {/* Main Chart */}
             <SciFiCard title="黑匣子数据回放 (Data Replay)" subtitle="T-10s to T+10s" className="flex-[2] border-indigo-900/50 bg-[#080a12]" noPadding>
                 <div className="w-full h-full p-2 flex flex-col">
                     <div className="flex-1 relative">
                         <ResponsiveContainer width="100%" height="100%">
                             <ComposedChart data={BLACKBOX_DATA} margin={{top: 20, right: 20, bottom: 20, left: 0}}
                                onMouseMove={(e) => {
                                    if(e.activeTooltipIndex !== undefined) setScrubberTime(e.activeTooltipIndex);
                                }}
                             >
                                 <defs>
                                     <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                         <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                     </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                 <XAxis dataKey="time" type="number" stroke="#64748b" tick={{fontSize: 10}} domain={[-10, 10]} label={{value: 'Seconds (Rel to Trip)', position: 'insideBottom', offset: -10, fontSize: 10}} />
                                 <YAxis yAxisId="left" stroke="#ef4444" tick={{fontSize: 10}} domain={[0, 15]} label={{ value: 'Vib (mm/s)', angle: -90, position: 'insideLeft', fill: '#ef4444', fontSize: 10 }} />
                                 <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" tick={{fontSize: 10}} domain={[0, 3500]} label={{ value: 'RPM', angle: 90, position: 'insideRight', fill: '#0ea5e9', fontSize: 10 }} />
                                 
                                 <Tooltip contentStyle={{backgroundColor: '#0f0c15', borderColor: '#333', fontSize: '12px'}} labelFormatter={(l) => `T${l > 0 ? '+' : ''}${l.toFixed(2)}s`} />
                                 
                                 {/* Trip Line */}
                                 <ReferenceLine x={0} stroke="#ef4444" strokeDasharray="5 5" label={{value: 'TRIP', fill: 'red', fontSize: 10, position: 'insideTopLeft'}} />
                                 
                                 {/* Scrubber Line */}
                                 <ReferenceLine x={currentSignal.time} stroke="#fff" strokeWidth={1} />

                                 <Area yAxisId="left" type="monotone" dataKey="vibration" stroke="#ef4444" fill="url(#colorVib)" strokeWidth={2} name="Vibration" />
                                 <Line yAxisId="right" type="monotone" dataKey="speed" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Speed" />
                                 <Line yAxisId="right" type="step" dataKey="valve" stroke="#10b981" strokeWidth={1} dot={false} name="Fuel Valve %" />
                             </ComposedChart>
                         </ResponsiveContainer>
                     </div>

                     {/* Playback Controls */}
                     <div className="h-12 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between px-4">
                         <div className="text-xs font-mono text-cyan-400">
                             Cursor: T{currentSignal.time > 0 ? '+' : ''}{currentSignal.time.toFixed(2)}s
                         </div>
                         <div className="flex gap-4 text-slate-400">
                             <Rewind size={16} className="cursor-pointer hover:text-white" />
                             <Play size={16} className="cursor-pointer hover:text-white text-green-400" />
                             <FastForward size={16} className="cursor-pointer hover:text-white" />
                         </div>
                     </div>
                 </div>
             </SciFiCard>

             {/* Logic Trace Panel */}
             <SciFiCard title="保护逻辑回溯 (Logic Trace)" subtitle="CAUSE CHAIN" className="h-[250px] border-slate-800">
                 <div className="flex items-center justify-center h-full gap-4 p-4 relative overflow-hidden">
                     {/* Decorative connector lines */}
                     <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10"></div>
                     
                     <LogicGate label="Vib X > 11mm/s" status={currentSignal.vibration > 11} type="INPUT" />
                     <ArrowRight size={16} className="text-slate-600" />
                     <LogicGate label="OR Gate A" status={currentSignal.vibration > 11} type="OR" />
                     <ArrowRight size={16} className="text-slate-600" />
                     <LogicGate label="Trip Delay (2s)" status={currentSignal.time >= 0} type="AND" />
                     <ArrowRight size={16} className="text-slate-600" />
                     <div className={`p-3 rounded border-2 font-bold text-xs ${currentSignal.time >= 0 ? 'bg-red-600 text-white border-red-400 shadow-[0_0_20px_red]' : 'bg-slate-900 text-slate-500 border-slate-700'}`}>
                         ESD TRIP
                     </div>
                 </div>
             </SciFiCard>

         </div>

         {/* RIGHT: Verdict & Report */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
             
             {/* Root Cause Probability */}
             <SciFiCard title="归因可能性分析" subtitle="AI PROBABILITY" className="border-indigo-900/30">
                 <div className="flex flex-col gap-4">
                     {ROOT_CAUSES.map(rc => (
                         <div key={rc.id} className="group cursor-pointer">
                             <div className="flex justify-between text-xs mb-1">
                                 <span className={`font-bold ${rc.status === 'Suspected' ? 'text-white' : 'text-slate-500'}`}>{rc.name}</span>
                                 <span className="font-mono text-cyan-400">{rc.probability}%</span>
                             </div>
                             <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                                 <div 
                                   className={`h-full ${rc.probability > 70 ? 'bg-red-500' : 'bg-indigo-500'}`} 
                                   style={{width: `${rc.probability}%`}}
                                 ></div>
                             </div>
                             <div className="text-[9px] text-slate-500 flex justify-between">
                                 <span>Evid: {rc.evidence}</span>
                                 {rc.status === 'Excluded' && <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={8}/> Ruled Out</span>}
                             </div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>

             {/* Verdict Form */}
             <SciFiCard title="最终定责与建议" subtitle="VERDICT" className="flex-1 border-slate-800 bg-[#0b0e16]">
                 <div className="flex flex-col h-full gap-4">
                     <div className="p-3 bg-red-900/10 border border-red-900/30 rounded">
                         <div className="text-xs text-red-300 font-bold mb-1">Primary Cause Identified</div>
                         <p className="text-[11px] text-slate-300 leading-relaxed">
                             High vibration due to <strong>Rotor Thermal Imbalance</strong> triggered by rapid load rejection grid event.
                         </p>
                     </div>
                     
                     <div className="space-y-2 flex-1">
                         <div className="text-[10px] text-slate-500 uppercase font-bold">Recommendations</div>
                         <div className="flex items-start gap-2 text-xs text-slate-300 p-2 bg-slate-900/50 rounded border border-slate-800">
                             <div className="min-w-[12px] text-cyan-500">1.</div>
                             Perform low-speed turning gear operation for 4 hours to equalize rotor temp.
                         </div>
                         <div className="flex items-start gap-2 text-xs text-slate-300 p-2 bg-slate-900/50 rounded border border-slate-800">
                             <div className="min-w-[12px] text-cyan-500">2.</div>
                             Inspect Bearing #2 pads for rub marks.
                         </div>
                         <div className="flex items-start gap-2 text-xs text-slate-300 p-2 bg-slate-900/50 rounded border border-slate-800">
                             <div className="min-w-[12px] text-cyan-500">3.</div>
                             Calibrate vibration probe sensitivity.
                         </div>
                     </div>

                     <div className="mt-auto">
                         <label className="text-[10px] text-slate-500 uppercase mb-1 block">Expert Sign-off</label>
                         <textarea 
                           className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white focus:border-cyan-500 outline-none h-20 resize-none"
                           placeholder="Enter final comments..."
                           value={verdict}
                           onChange={(e) => setVerdict(e.target.value)}
                         />
                         <button className="w-full mt-2 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors">
                             <FileSignature size={14} /> Submit Report
                         </button>
                     </div>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
