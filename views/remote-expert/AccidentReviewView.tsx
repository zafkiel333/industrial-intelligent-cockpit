
import React, { useState, useEffect, useRef } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AlertTriangle, Clock, Activity, FileText, 
  Search, Play, Pause, SkipBack, SkipForward,
  Rewind, FastForward, GitCommit, GitPullRequest,
  CheckCircle2, XCircle, Microscope, Layers,
  Database, ShieldAlert, ArrowRight, UserCheck,
  FileSignature, Fingerprint, MapPin
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, BarChart, Bar, Cell
} from 'recharts';

// --- Types ---

interface TimePoint {
  time: string; // MM:SS.ms
  timestamp: number;
  pressure: number; // MPa
  temp: number; // C
  valvePos: number; // %
  vib: number; // mm/s
  event?: string;
}

interface EvidenceItem {
  id: string;
  type: 'Log' | 'Photo' | 'Audio' | 'Data';
  title: string;
  desc: string;
  timeOffset: string; // e.g. T-5s
  status: 'Verified' | 'Analyzing';
}

interface RootCauseNode {
  id: string;
  label: string;
  type: 'Direct' | 'Intermediate' | 'Root';
  prob: number;
  children?: RootCauseNode[];
}

// --- Mock Data ---

const INCIDENT_META = {
  id: 'ACC-20240315-X09',
  title: '2号高压加热器管道爆裂事故',
  date: '2024-03-15 14:32:05',
  location: '热电二厂 - 汽机房 12m 层',
  severity: 'Level 1 (重大)',
  status: 'Reviewing (复盘中)',
  expertTeam: 'Dr. Zhang, Chief Eng. Li, Safety Officer Wang'
};

// Generate high-resolution data for replay (60 seconds window, T-30 to T+30)
const REPLAY_DATA: TimePoint[] = Array.from({length: 600}, (_, i) => {
  const t = i / 10 - 30; // Seconds relative to T0
  const isPost = t > 0;
  
  // Simulation: Pressure buildup then crash
  let p = 12.5; 
  if (t > -10 && t <= 0) p = 12.5 + Math.pow((t + 10)/2, 2) * 0.05; // Exp rise
  if (t > 0) p = Math.max(0, 25 * Math.exp(-t)); // Crash
  
  // Temp spike
  let temp = 540;
  if (t > -5) temp = 540 + Math.random() * 5 + (t > 0 ? 50 : 0);

  // Vibration precursor
  let vib = 2.5;
  if (t > -15) vib = 2.5 + Math.sin(t * 5) * 0.5 + (t > -5 ? Math.random() * 5 : 0);
  if (t > 0) vib = 0; // Sensor lost

  let evt = undefined;
  if (i === 300) evt = 'PIPE RUPTURE';
  if (i === 200) evt = 'Safety Valve Fail';
  if (i === 150) evt = 'Vib Alarm High';
  if (i === 350) evt = 'Emerg. Shutdown';

  return {
    time: t.toFixed(1) + 's',
    timestamp: t,
    pressure: p,
    temp: temp,
    valvePos: t < -10 ? 100 : (t < 0 ? 100 : 0),
    vib: vib,
    event: evt
  };
});

const EVIDENCE_CHAIN: EvidenceItem[] = [
  { id: 'E1', type: 'Data', title: 'DCS 历史趋势库', desc: '压力曲线在 T-8s 出现非线性激增，偏离正常调节范围。', timeOffset: 'T-8s', status: 'Verified' },
  { id: 'E2', type: 'Log', title: '安全阀动作记录', desc: '指令发出时间 T-5s，但阀位反馈显示未动作。', timeOffset: 'T-5s', status: 'Verified' },
  { id: 'E3', type: 'Audio', title: '现场声纹监控', desc: '检测到金属高频撕裂声，声强 120dB。', timeOffset: 'T-0s', status: 'Verified' },
  { id: 'E4', type: 'Photo', title: '断口金相分析', desc: '断口呈现典型疲劳纹，非瞬时过载断裂。', timeOffset: 'Post-Event', status: 'Analyzing' },
];

// --- Components ---

const TimelineScrubber = ({ 
  data, 
  currentTime, 
  onScrub, 
  isPlaying, 
  onPlayPause 
}: { 
  data: TimePoint[], 
  currentTime: number, 
  onScrub: (t: number) => void, 
  isPlaying: boolean,
  onPlayPause: () => void
}) => {
  return (
    <div className="w-full bg-[#0c0a09] border border-slate-800 rounded-lg p-4 flex flex-col gap-4">
      {/* Controls & Time Display */}
      <div className="flex justify-between items-center">
         <div className="flex items-center gap-4">
            <button onClick={onPlayPause} className="w-10 h-10 rounded-full bg-amber-600 hover:bg-amber-500 text-black flex items-center justify-center transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)]">
               {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1"/>}
            </button>
            <div className="flex flex-col">
               <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Relative Time (T0 = Incident)</span>
               <span className={`text-2xl font-mono font-bold ${currentTime >= 0 ? 'text-red-500' : 'text-slate-200'}`}>
                  {currentTime > 0 ? '+' : ''}{currentTime.toFixed(1)} s
               </span>
            </div>
         </div>
         
         <div className="flex gap-2">
            <button className="p-2 bg-slate-800 rounded hover:bg-slate-700 text-slate-400"><SkipBack size={16}/></button>
            <button className="p-2 bg-slate-800 rounded hover:bg-slate-700 text-slate-400"><Rewind size={16}/></button>
            <button className="p-2 bg-slate-800 rounded hover:bg-slate-700 text-slate-400"><FastForward size={16}/></button>
            <button className="p-2 bg-slate-800 rounded hover:bg-slate-700 text-slate-400"><SkipForward size={16}/></button>
         </div>
      </div>

      {/* Scrubber Area */}
      <div className="relative h-24 bg-slate-900/50 rounded border border-slate-800 overflow-hidden cursor-crosshair group"
           onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const pct = x / rect.width;
              onScrub(Math.floor(pct * data.length));
           }}
      >
         {/* Mini Chart Background */}
         <div className="absolute inset-0 opacity-30 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data}>
                  <Area type="step" dataKey="pressure" stroke="#f59e0b" fill="#f59e0b" strokeWidth={1} />
               </AreaChart>
            </ResponsiveContainer>
         </div>

         {/* Events Markers */}
         {data.map((d, i) => d.event && (
             <div key={i} className="absolute top-0 bottom-0 w-px bg-slate-600 border-l border-dashed border-slate-400" style={{left: `${(i/data.length)*100}%`}}>
                 <div className="absolute top-1 left-1 text-[8px] bg-slate-800 px-1 rounded text-slate-300 whitespace-nowrap z-10 border border-slate-600">
                     {d.event}
                 </div>
             </div>
         ))}

         {/* T0 Line */}
         <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-red-500/50 z-0"></div>

         {/* Playhead */}
         <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500 shadow-[0_0_10px_#f59e0b] z-20 transition-all duration-75"
              style={{left: `${((currentTime + 30) / 60) * 100}%`}}>
         </div>
      </div>
    </div>
  );
};

const DataPanel = ({ currentData }: { currentData: TimePoint }) => (
  <div className="grid grid-cols-4 gap-4">
      {[
        { label: 'Main Steam Pressure', val: currentData.pressure.toFixed(2), unit: 'MPa', max: 25, color: '#f59e0b' },
        { label: 'Reheat Temp', val: currentData.temp.toFixed(1), unit: '°C', max: 600, color: '#ef4444' },
        { label: 'Valve Position', val: currentData.valvePos.toFixed(0), unit: '%', max: 100, color: '#3b82f6' },
        { label: 'Vibration (X)', val: currentData.vib.toFixed(2), unit: 'mm/s', max: 10, color: '#8b5cf6' },
      ].map((metric, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800 p-3 rounded flex flex-col justify-between">
              <div className="text-[10px] text-slate-500 uppercase">{metric.label}</div>
              <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-mono font-bold text-white" style={{color: metric.color}}>{metric.val}</span>
                  <span className="text-xs text-slate-500">{metric.unit}</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div className="h-full transition-all duration-75" style={{width: `${(parseFloat(metric.val)/metric.max)*100}%`, backgroundColor: metric.color}}></div>
              </div>
          </div>
      ))}
  </div>
);

export const AccidentReviewView: React.FC = () => {
  const [playIndex, setPlayIndex] = useState(250); // Start at T-5s approx
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis'); // analysis, evidence, report

  const currentData = REPLAY_DATA[playIndex];

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayIndex(prev => {
          if (prev >= REPLAY_DATA.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 100); // 10x speed playback of 100ms samples -> 10 samples/sec = real time
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#050505]">
      
      {/* 1. Header: Case File Style */}
      <div className="border-b border-red-900/30 bg-slate-900/50 p-4 flex justify-between items-start">
         <div className="flex gap-4">
             <div className="w-16 h-16 bg-red-950 border border-red-800 flex items-center justify-center text-red-500 shadow-lg rounded-sm">
                 <ShieldAlert size={32} />
             </div>
             <div>
                 <div className="flex items-center gap-2 mb-1">
                     <span className="bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold rounded-sm uppercase tracking-wider">Top Secret // Internal</span>
                     <span className="text-xs text-slate-500 font-mono">CASE ID: {INCIDENT_META.id}</span>
                 </div>
                 <h1 className="text-2xl font-bold text-white tracking-wide">{INCIDENT_META.title}</h1>
                 <div className="flex gap-4 text-xs text-slate-400 mt-1">
                     <span className="flex items-center gap-1"><Clock size={12}/> {INCIDENT_META.date}</span>
                     <span className="flex items-center gap-1"><MapPin size={12}/> {INCIDENT_META.location}</span>
                     <span className="text-red-400 font-bold">{INCIDENT_META.severity}</span>
                 </div>
             </div>
         </div>
         
         <div className="flex flex-col items-end gap-2">
             <div className="flex bg-slate-800 p-1 rounded border border-slate-700">
                 {['analysis', 'evidence', 'report'].map(tab => (
                     <button 
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       className={`px-4 py-1.5 text-xs font-bold uppercase rounded transition-all ${activeTab === tab ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                     >
                         {tab}
                     </button>
                 ))}
             </div>
             <div className="text-[10px] text-slate-500">
                 Review Team: {INCIDENT_META.expertTeam}
             </div>
         </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-y-auto px-4 pb-4 custom-scrollbar">
         
         {/* SECTION: The Black Box Replay */}
         <div className="flex flex-col gap-4">
             <div className="flex items-center gap-2 text-xs text-amber-500 uppercase font-bold tracking-widest mb-[-10px] z-10 pl-2">
                 <Activity size={14} /> Digital Twin State Replay
             </div>
             <TimelineScrubber 
               data={REPLAY_DATA} 
               currentTime={currentData.timestamp} 
               onScrub={setPlayIndex} 
               isPlaying={isPlaying}
               onPlayPause={() => setIsPlaying(!isPlaying)}
             />
             <DataPanel currentData={currentData} />
         </div>

         <div className="h-px bg-slate-800 w-full"></div>

         {/* SECTION: Deep Dive Content */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
             
             {/* LEFT: Sequence of Events (SOE) */}
             <SciFiCard title="事件时序链 (Sequence of Events)" subtitle="SOE LOG" className="border-slate-800 bg-[#080808]">
                 <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-700 h-full overflow-y-auto custom-scrollbar pr-2">
                     {[
                         { t: 'T-05:00', desc: 'System stable. Load 80%.', type: 'Normal' },
                         { t: 'T-00:45', desc: 'Vibration sensor #2 spike > 5mm/s.', type: 'Warning' },
                         { t: 'T-00:10', desc: 'Pressure sudden rise +15%.', type: 'Critical' },
                         { t: 'T-00:05', desc: 'Safety Valve actuation command sent.', type: 'Action' },
                         { t: 'T-00:00', desc: 'INCIDENT TRIGGERED. Pressure loss.', type: 'Incident' },
                         { t: 'T+00:02', desc: 'Emergency Shutdown (ESD) engaged.', type: 'System' },
                     ].map((evt, i) => (
                         <div key={i} className="relative group">
                             <div className={`absolute -left-[18px] top-1.5 w-2 h-2 rounded-full border 
                                 ${evt.type === 'Incident' ? 'bg-red-500 border-red-500' : 
                                   evt.type === 'Critical' ? 'bg-orange-500 border-orange-500' : 
                                   evt.type === 'Warning' ? 'bg-yellow-500 border-yellow-500' : 'bg-slate-900 border-slate-500'}
                             `}></div>
                             <div className="flex justify-between items-start">
                                 <span className={`text-xs font-mono font-bold ${evt.type === 'Incident' ? 'text-red-500' : 'text-slate-400'}`}>{evt.t}</span>
                                 <span className="text-[9px] uppercase border border-slate-800 px-1 rounded text-slate-500">{evt.type}</span>
                             </div>
                             <div className={`text-sm mt-1 ${evt.type === 'Incident' ? 'text-white font-bold' : 'text-slate-300'}`}>{evt.desc}</div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>

             {/* CENTER: Causal Analysis (Fault Tree) */}
             <SciFiCard title="根因推演 (Root Cause Analysis)" subtitle="FISHBONE" className="border-amber-900/30 bg-[#0c0a09]">
                 <div className="flex flex-col h-full relative">
                     <div className="flex-1 flex items-center justify-center relative">
                         {/* Simplified Tree Visualization using HTML/CSS */}
                         <div className="flex flex-col items-center gap-6 w-full">
                             {/* Effect */}
                             <div className="bg-red-900/40 border border-red-500 px-4 py-2 rounded text-red-200 font-bold text-center w-3/4 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                                 管道爆裂 (Pipe Rupture)
                             </div>
                             
                             {/* Connector */}
                             <div className="h-6 w-0.5 bg-slate-600"></div>
                             
                             {/* L1 Causes */}
                             <div className="flex gap-4 w-full justify-center">
                                 <div className="flex flex-col items-center gap-2">
                                     <div className="bg-slate-800 border border-slate-600 px-3 py-1.5 rounded text-slate-300 text-xs w-24 text-center">Overpressure</div>
                                     <div className="h-4 w-0.5 bg-slate-600"></div>
                                     <div className="bg-slate-900 border border-amber-500/50 px-2 py-1 rounded text-amber-400 text-[10px] w-24 text-center">Valve Stuck</div>
                                 </div>
                                 <div className="flex flex-col items-center gap-2">
                                     <div className="bg-slate-800 border border-slate-600 px-3 py-1.5 rounded text-slate-300 text-xs w-24 text-center">Material Fail</div>
                                     <div className="h-4 w-0.5 bg-slate-600"></div>
                                     <div className="bg-slate-900 border border-red-500 px-2 py-1 rounded text-red-400 text-[10px] w-24 text-center shadow-[0_0_10px_rgba(220,38,38,0.3)]">Fatigue Crack</div>
                                 </div>
                                 <div className="flex flex-col items-center gap-2">
                                     <div className="bg-slate-800 border border-slate-600 px-3 py-1.5 rounded text-slate-300 text-xs w-24 text-center">Operation</div>
                                 </div>
                             </div>
                         </div>
                         
                         {/* Overlay Conclusion */}
                         <div className="absolute bottom-0 w-full bg-amber-900/20 border-t border-amber-500/30 p-2 text-center">
                             <div className="text-[10px] text-amber-500 uppercase font-bold">Primary Root Cause Identified</div>
                             <div className="text-xs text-white">High-cycle fatigue due to flow-induced vibration (FIV).</div>
                         </div>
                     </div>
                 </div>
             </SciFiCard>

             {/* RIGHT: Evidence & Action */}
             <div className="flex flex-col gap-4">
                 
                 {/* Evidence Locker */}
                 <SciFiCard title="物证与数据链 (Evidence Chain)" className="flex-1 border-slate-800">
                     <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1 max-h-[180px]">
                         {EVIDENCE_CHAIN.map((ev) => (
                             <div key={ev.id} className="p-2 border border-slate-700 bg-slate-900/50 rounded flex gap-3 hover:border-cyan-500/50 transition-colors group cursor-pointer">
                                 <div className="p-2 bg-black rounded flex items-center justify-center text-slate-500 group-hover:text-cyan-400">
                                     {ev.type === 'Photo' ? <Microscope size={16}/> : ev.type === 'Audio' ? <Activity size={16}/> : <Database size={16}/>}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <div className="flex justify-between items-start">
                                         <div className="text-xs font-bold text-slate-200 truncate">{ev.title}</div>
                                         <span className="text-[9px] font-mono text-amber-500 bg-amber-900/10 px-1 rounded border border-amber-900/30">{ev.timeOffset}</span>
                                     </div>
                                     <div className="text-[10px] text-slate-500 truncate">{ev.desc}</div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </SciFiCard>

                 {/* Sign-off Panel */}
                 <SciFiCard title="结论签署 (Final Verdict)" className="border-green-900/30">
                     <div className="flex flex-col gap-3">
                         <div className="flex items-center gap-2 text-xs text-slate-300">
                             <UserCheck size={14} className="text-green-500" />
                             <span>Expert Consensus: <strong className="text-white">Reached (3/3)</strong></span>
                         </div>
                         <div className="p-2 bg-slate-800 rounded border border-slate-700 text-[10px] text-slate-400">
                             Corrective Action: Replace valve type, add vibration dampeners, update inspection interval to 3 months.
                         </div>
                         <button className="w-full py-2 bg-green-700 hover:bg-green-600 text-white text-xs font-bold rounded flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(21,128,61,0.4)] transition-all">
                             <FileSignature size={14} /> Generate Final Report
                         </button>
                     </div>
                 </SciFiCard>

             </div>

         </div>

      </div>
    </div>
  );
};
