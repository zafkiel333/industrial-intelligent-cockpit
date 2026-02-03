
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  Microscope, GitMerge, BrainCircuit, Activity, 
  Layers, Thermometer, Zap, Wind, Search, 
  Share2, Network, Fingerprint, Database,
  ArrowRight, AlertOctagon, CheckCircle2,
  Minimize2, Maximize2, Play, Pause, RotateCcw,
  Scan
} from 'lucide-react';
import { 
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, CartesianGrid, ReferenceLine, Legend,
  AreaChart, Area
} from 'recharts';

// --- Types ---

interface SensorGroup {
  id: string;
  name: string;
  icon: any;
  status: 'Normal' | 'Warning' | 'Critical';
  value: string;
  unit: string;
  trend: number[]; // Sparkline data
}

interface DiagnosisPath {
  step: number;
  node: string;
  desc: string;
  status: 'Pass' | 'Fail' | 'Suspect';
  confidence: number;
}

interface CorrelationPoint {
  x: number; // Load
  y: number; // Vibration
  z: number; // Temp (Size)
  type: 'Normal' | 'Current' | 'Fault A' | 'Fault B';
}

// --- Mock Data ---

const SENSOR_GROUPS: SensorGroup[] = [
  { id: 'vib', name: '轴系振动 (Vibration)', icon: Activity, status: 'Critical', value: '8.45', unit: 'mm/s', trend: [2,3,4,5,7,8,8.5,8.2] },
  { id: 'thm', name: '热工参数 (Thermal)', icon: Thermometer, status: 'Warning', value: '542', unit: '°C', trend: [520,525,530,535,538,540,542,541] },
  { id: 'fld', name: '流体动力 (Fluid)', icon: Wind, status: 'Normal', value: '12.5', unit: 'MPa', trend: [12.4,12.5,12.5,12.4,12.5,12.6,12.5,12.5] },
  { id: 'ele', name: '电气特性 (Electric)', icon: Zap, status: 'Normal', value: '24.1', unit: 'kA', trend: [24,24.1,24,24.2,24.1,24,24.1,24.1] },
];

// Phase Space Data (Load vs Vibration)
const PHASE_DATA: CorrelationPoint[] = [
  ...Array.from({length: 30}, () => ({ x: 80+Math.random()*10, y: 2+Math.random(), z: 50, type: 'Normal' as const })), // Normal cluster
  ...Array.from({length: 10}, () => ({ x: 60+Math.random()*5, y: 6+Math.random()*2, z: 80, type: 'Fault A' as const })), // Surge
  ...Array.from({length: 10}, () => ({ x: 90+Math.random()*5, y: 8+Math.random()*2, z: 90, type: 'Fault B' as const })), // Rubbing
  { x: 88, y: 7.5, z: 100, type: 'Current' as const } // Current operating point
];

const REASONING_CHAIN: DiagnosisPath[] = [
  { step: 1, node: 'Signal Processing', desc: 'FFT Transform & Wavelet Denoising', status: 'Pass', confidence: 100 },
  { step: 2, node: 'Feature Extraction', desc: 'Identified 0.45x Sub-synchronous comp.', status: 'Suspect', confidence: 85 },
  { step: 3, node: 'Rule Base Check', desc: 'Oil Whip Condition Met', status: 'Pass', confidence: 92 },
  { step: 4, node: 'Physics Model', desc: 'Rotor Dynamics Stability Margin < 0', status: 'Fail', confidence: 88 },
  { step: 5, node: 'Final Verdict', desc: 'Oil Whip caused by bearing instability', status: 'Suspect', confidence: 90 },
];

const COUPLING_RADAR = [
  { subject: 'Vib-Temp', A: 90, fullMark: 100 },
  { subject: 'Vib-Load', A: 85, fullMark: 100 },
  { subject: 'Temp-Press', A: 40, fullMark: 100 },
  { subject: 'Flow-Vib', A: 30, fullMark: 100 },
  { subject: 'Elec-Temp', A: 50, fullMark: 100 },
  { subject: 'Load-Press', A: 95, fullMark: 100 },
];

// --- Sub-Components ---

const MiniSparkline = ({ data, color }: { data: number[], color: string }) => (
  <div className="h-8 w-16">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data.map((v, i) => ({ i, v }))}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const KnowledgeGraphNode = ({ label, status, x, y }: { label: string, status: string, x: number, y: number }) => (
  <div 
    className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-all duration-500`}
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    <div className={`w-3 h-3 rounded-full border-2 
      ${status === 'Pass' ? 'bg-green-500 border-green-300' : 
        status === 'Fail' ? 'bg-red-500 border-red-300' : 
        'bg-yellow-500 border-yellow-300 animate-pulse'}
    `}></div>
    <div className="text-[10px] text-slate-400 bg-black/60 px-1.5 rounded border border-slate-800 whitespace-nowrap">
      {label}
    </div>
  </div>
);

export const ComplexDiagnosisView: React.FC = () => {
  const [activeAnalysis, setActiveAnalysis] = useState('PhaseSpace'); // PhaseSpace, Spectrum, Model
  const [isSimulating, setIsSimulating] = useState(true);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#020204]">
      
      {/* 1. Header: The Diagnosis Command */}
      <div className="flex justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0a0620] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <Microscope size={14} /> Advanced Diagnostics
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             远程复杂工况 <span className="text-indigo-500">多维诊断支持</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">Analysis Mode</span>
                <span className="text-sm font-bold text-white bg-slate-900 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                    <GitMerge size={12} className="text-pink-500"/> Multi-Physics Fusion
                </span>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">AI Confidence</span>
                <span className="text-xl font-mono font-bold text-indigo-400">92.4%</span>
            </div>
            <button className="ml-4 flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
               <Share2 size={16} /> 生成专家会诊包
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Telemetry Array */}
        <div className="w-full lg:w-[260px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           <div className="flex justify-between items-center text-xs text-slate-400 px-1 mb-2">
               <span className="uppercase font-bold">Input Signals</span>
               <Activity size={14} />
           </div>

           <div className="flex flex-col gap-3">
               {SENSOR_GROUPS.map(sensor => (
                   <div key={sensor.id} className={`p-3 rounded border transition-all hover:bg-slate-900/50 cursor-pointer group
                       ${sensor.status === 'Critical' ? 'bg-red-950/20 border-red-500/50' : 
                         sensor.status === 'Warning' ? 'bg-yellow-950/20 border-yellow-500/50' : 'bg-slate-900/30 border-slate-800'}
                   `}>
                       <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-2">
                               <sensor.icon size={16} className={sensor.status === 'Critical' ? 'text-red-400' : sensor.status === 'Warning' ? 'text-yellow-400' : 'text-slate-400'} />
                               <span className="text-xs font-bold text-slate-200">{sensor.name}</span>
                           </div>
                           <div className={`w-2 h-2 rounded-full ${sensor.status === 'Critical' ? 'bg-red-500 animate-ping' : sensor.status === 'Warning' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                       </div>
                       
                       <div className="flex justify-between items-end">
                           <div>
                               <div className="text-2xl font-mono font-bold text-white">{sensor.value}</div>
                               <div className="text-[10px] text-slate-500">{sensor.unit}</div>
                           </div>
                           <MiniSparkline data={sensor.trend} color={sensor.status === 'Critical' ? '#ef4444' : sensor.status === 'Warning' ? '#eab308' : '#10b981'} />
                       </div>
                   </div>
               ))}
           </div>

           {/* Coupling Matrix Mini */}
           <div className="mt-auto bg-[#080b16] border border-slate-800 rounded p-3">
               <div className="text-[10px] text-slate-500 uppercase mb-2">Coupling Intensity</div>
               <div className="h-32 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={COUPLING_RADAR}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 8 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Coupling" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </div>
        </div>

        {/* CENTER COLUMN: The Fusion Core */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
           
           {/* Top: 3D Twin & Controls */}
           <div className="flex-1 bg-black rounded-lg border border-indigo-900/30 relative overflow-hidden group">
               <div className="absolute inset-0 z-0">
                   <ThreeScene type="turbine" color="#6366f1" />
               </div>
               
               {/* HUD Overlays */}
               <div className="absolute top-4 left-4 z-10 pointer-events-none">
                   <div className="bg-black/60 backdrop-blur border border-indigo-500/30 px-3 py-1.5 rounded text-xs text-indigo-300 flex items-center gap-2">
                       <Scan size={14} className="animate-spin-slow"/> 
                       System State: <span className="text-white font-bold">TRANSIENT (LOAD REJECTION)</span>
                   </div>
               </div>

               <div className="absolute bottom-4 left-4 z-10 w-[400px] h-[200px] bg-black/80 backdrop-blur border border-slate-700 rounded-lg p-3 flex flex-col">
                   <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-2">
                           <GitMerge size={12} className="text-pink-500"/> Phase Space Trajectory
                       </span>
                       <div className="flex gap-2">
                           <button className="text-slate-500 hover:text-white"><Maximize2 size={12}/></button>
                       </div>
                   </div>
                   
                   <div className="flex-1 relative">
                       <ResponsiveContainer width="100%" height="100%">
                           <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                               <XAxis type="number" dataKey="x" name="Load" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Load %', position: 'insideBottom', offset: -5, fontSize: 8 }} domain={[0, 100]} />
                               <YAxis type="number" dataKey="y" name="Vibration" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Vib mm/s', angle: -90, position: 'insideLeft', fontSize: 8 }} domain={[0, 12]} />
                               <ZAxis type="number" dataKey="z" range={[50, 400]} />
                               <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#6366f1', color: '#fff'}} />
                               <Scatter name="Points" data={PHASE_DATA}>
                                   {PHASE_DATA.map((entry, index) => (
                                       <Cell 
                                         key={`cell-${index}`} 
                                         fill={entry.type === 'Current' ? '#fff' : entry.type === 'Fault A' ? '#ef4444' : entry.type === 'Fault B' ? '#f59e0b' : '#3b82f6'} 
                                         fillOpacity={entry.type === 'Normal' ? 0.3 : 0.8}
                                       />
                                   ))}
                               </Scatter>
                           </ScatterChart>
                       </ResponsiveContainer>
                       {/* Current Indicator */}
                       <div className="absolute top-2 right-2 flex flex-col gap-1 text-[8px] text-slate-500">
                           <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-50"></div> Normal</div>
                           <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Fault Cluster</div>
                       </div>
                   </div>
               </div>
               
               {/* Controls */}
               <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                   <button className="p-2 bg-slate-900/80 border border-slate-700 rounded text-slate-300 hover:text-white transition-colors">
                       <Layers size={16} />
                   </button>
                   <button 
                     className={`p-2 rounded border transition-colors ${isSimulating ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-300'}`}
                     onClick={() => setIsSimulating(!isSimulating)}
                   >
                       {isSimulating ? <Pause size={16}/> : <Play size={16}/>}
                   </button>
                   <button className="p-2 bg-slate-900/80 border border-slate-700 rounded text-slate-300 hover:text-white transition-colors">
                       <RotateCcw size={16} />
                   </button>
               </div>
           </div>

        </div>

        {/* RIGHT COLUMN: Inference & Knowledge */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Reasoning Chain */}
           <SciFiCard title="专家推理链 (Inference Chain)" subtitle="LOGIC PATH" className="border-slate-800 bg-[#0b0e14]">
               <div className="relative h-[300px] w-full border border-slate-800 rounded bg-[#050505] overflow-hidden">
                   {/* Background Connections */}
                   <svg className="absolute inset-0 w-full h-full pointer-events-none">
                       <path d="M50% 15% L50% 35% L25% 55% M50% 35% L75% 55% M25% 55% L50% 85% M75% 55% L50% 85%" stroke="#334155" strokeWidth="1" fill="none" />
                   </svg>
                   
                   {/* Nodes */}
                   <KnowledgeGraphNode label="1. Signal Proc" status="Pass" x={50} y={15} />
                   <KnowledgeGraphNode label="2. Feature Ext" status="Suspect" x={50} y={35} />
                   <KnowledgeGraphNode label="3A. Rule Check" status="Pass" x={25} y={55} />
                   <KnowledgeGraphNode label="3B. Physics Model" status="Fail" x={75} y={55} />
                   <KnowledgeGraphNode label="4. Verdict" status="Suspect" x={50} y={85} />
               </div>
               
               <div className="mt-4 space-y-3">
                   {REASONING_CHAIN.map(step => (
                       <div key={step.step} className="flex gap-3 items-start p-2 hover:bg-slate-800/50 rounded transition-colors cursor-pointer">
                           <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-black
                               ${step.status === 'Pass' ? 'bg-green-500' : step.status === 'Fail' ? 'bg-red-500' : 'bg-yellow-500'}
                           `}>
                               {step.step}
                           </div>
                           <div className="flex-1">
                               <div className="flex justify-between items-center">
                                   <span className="text-xs font-bold text-slate-200">{step.node}</span>
                                   <span className="text-[9px] text-indigo-400">{step.confidence}% Conf.</span>
                               </div>
                               <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{step.desc}</p>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Similar Cases */}
           <SciFiCard title="相似案例匹配 (Case Match)" subtitle="KB" className="flex-1 border-indigo-900/30">
               <div className="flex flex-col gap-3">
                   {[
                       { id: 'C-2021-09', title: 'Turbine Oil Whip during Startup', similarity: 94 },
                       { id: 'C-2023-02', title: 'Steam Force Induced Vibration', similarity: 78 },
                       { id: 'C-2019-11', title: 'Bearing Seal Rubbing', similarity: 65 },
                   ].map((c, i) => (
                       <div key={i} className="bg-slate-900/40 p-3 rounded border border-slate-800 hover:border-indigo-500/50 transition-colors group cursor-pointer">
                           <div className="flex justify-between items-start mb-1">
                               <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1 rounded border border-slate-700">{c.id}</span>
                               <span className={`text-[10px] font-bold ${c.similarity > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                                   {c.similarity}% Match
                               </span>
                           </div>
                           <div className="text-xs text-slate-300 group-hover:text-white transition-colors">{c.title}</div>
                       </div>
                   ))}
               </div>
               
               <button className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors">
                   <Database size={12} /> Search Knowledge Base
               </button>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
