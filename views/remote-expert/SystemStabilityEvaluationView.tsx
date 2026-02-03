
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  Activity, Zap, Waves, AlertTriangle, 
  GitMerge, GitCommit, RefreshCw, Play, 
  Pause, RotateCcw, Share2, FileText,
  Target, Magnet, Cpu, ArrowRight,
  ShieldCheck, Crosshair, BrainCircuit, Save
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  ScatterChart, Scatter, ZAxis, ReferenceLine, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart
} from 'recharts';

// --- Types ---

interface Eigenvalue {
  id: string;
  real: number; // Damping (sigma)
  imag: number; // Frequency (j omega)
  mode: string;
  dampingRatio: number;
}

interface TrajectoryPoint {
  delta: number; // Rotor Angle (deg)
  omega: number; // Speed Deviation (pu)
  time: number;
}

interface StabilityMetric {
  subject: string;
  margin: number; // 0-100%
  status: 'Stable' | 'Critical' | 'Unstable';
}

// --- Mock Data ---

const STABILITY_INDICES: StabilityMetric[] = [
  { subject: '静态稳定 (Static)', margin: 85, status: 'Stable' },
  { subject: '暂态稳定 (Transient)', margin: 60, status: 'Stable' },
  { subject: '动态稳定 (Dynamic)', margin: 45, status: 'Critical' }, // Low damping
  { subject: '电压稳定 (Voltage)', margin: 78, status: 'Stable' },
  { subject: '频率稳定 (Freq)', margin: 92, status: 'Stable' },
  { subject: '小干扰 (Small Signal)', margin: 40, status: 'Critical' },
];

const EIGENVALUES: Eigenvalue[] = [
  { id: 'M1', real: -0.5, imag: 4.2, mode: 'Local Mode 1', dampingRatio: 0.12 },
  { id: 'M2', real: -0.2, imag: 8.5, mode: 'Local Mode 2', dampingRatio: 0.02 }, // Critical
  { id: 'M3', real: -1.2, imag: 2.1, mode: 'Inter-area Mode', dampingRatio: 0.50 },
  { id: 'M4', real: -0.8, imag: 5.6, mode: 'Exciter Mode', dampingRatio: 0.14 },
  { id: 'M5', real: -0.1, imag: 0.5, mode: 'Governor Mode', dampingRatio: 0.15 },
];

const TUNING_PARAMS = [
  { id: 'Kp', label: 'PSS Gain (Ks)', value: 12.5, min: 0, max: 20 },
  { id: 'T1', label: 'Lead Time (T1)', value: 0.25, min: 0.1, max: 1.0 },
  { id: 'T2', label: 'Lag Time (T2)', value: 0.05, min: 0.01, max: 0.1 },
];

// --- Components ---

const PhasePlanePlot = ({ isSimulating }: { isSimulating: boolean }) => {
  const [data, setData] = useState<TrajectoryPoint[]>([]);

  useEffect(() => {
    // Simulate a damped oscillation spiral
    const points: TrajectoryPoint[] = [];
    const steps = 200;
    const damping = isSimulating ? 0.02 : 0.05; // Simulate lower damping during "event"
    
    for (let i = 0; i < steps; i++) {
      const t = i * 0.1;
      const decay = Math.exp(-damping * t);
      // Spiraling in to (45, 0) - operating point
      const delta = 45 + 30 * decay * Math.cos(2 * t);
      const omega = 0 + 1.5 * decay * Math.sin(2 * t);
      points.push({ delta, omega, time: t });
    }
    setData(points);
  }, [isSimulating]);

  return (
    <div className="relative w-full h-full bg-[#050810] rounded border border-indigo-900/30 overflow-hidden">
        <div className="absolute top-2 left-2 text-[10px] text-indigo-400 font-mono z-10 bg-black/50 px-2 rounded">
            PHASE PORTRAIT (δ - ω)
        </div>
        <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                    type="number" 
                    dataKey="delta" 
                    name="Rotor Angle" 
                    unit="°" 
                    domain={[0, 90]} 
                    stroke="#64748b" 
                    tick={{fontSize: 10}}
                    label={{ value: 'Rotor Angle δ (deg)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#64748b' }}
                />
                <YAxis 
                    type="number" 
                    dataKey="omega" 
                    name="Speed Dev" 
                    unit="pu" 
                    domain={[-2, 2]} 
                    stroke="#64748b" 
                    tick={{fontSize: 10}}
                    label={{ value: 'Speed Deviation ω (pu)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#6366f1', fontSize: '12px'}} />
                
                {/* Separatrix Approximation (Stability Boundary) */}
                <ReferenceLine y={0} stroke="#334155" />
                <ReferenceLine x={45} stroke="#334155" />
                
                {/* Trajectory */}
                <Scatter name="Trajectory" data={data} line={{ stroke: '#0ea5e9', strokeWidth: 2 }} shape={() => null} />
                
                {/* Current State Marker */}
                <Scatter data={[data[data.length-1]]} fill="#10b981" shape="circle">
                    <Cell fill="#10b981" className="animate-pulse" />
                </Scatter>
            </ScatterChart>
        </ResponsiveContainer>
    </div>
  );
};

const EigenvaluePlot = () => {
    return (
        <div className="relative w-full h-full bg-[#050810] rounded border border-indigo-900/30">
            <div className="absolute top-2 left-2 text-[10px] text-indigo-400 font-mono z-10 bg-black/50 px-2 rounded">
                S-PLANE (Pole-Zero)
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis 
                        type="number" 
                        dataKey="real" 
                        name="Damping (σ)" 
                        domain={[-2, 0.5]} 
                        stroke="#64748b" 
                        tick={{fontSize: 10}}
                        label={{ value: 'Real Axis (Damping)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#64748b' }}
                    />
                    <YAxis 
                        type="number" 
                        dataKey="imag" 
                        name="Freq (jω)" 
                        domain={[0, 10]} 
                        stroke="#64748b" 
                        tick={{fontSize: 10}}
                        label={{ value: 'Imaginary Axis (Freq)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }}
                    />
                    <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }} 
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-slate-900 border border-slate-700 p-2 rounded text-xs text-white">
                                        <div className="font-bold mb-1">{data.mode}</div>
                                        <div>σ: {data.real}</div>
                                        <div>jω: {data.imag}</div>
                                        <div className={data.dampingRatio < 0.05 ? 'text-red-400' : 'text-green-400'}>
                                            ζ: {(data.dampingRatio*100).toFixed(1)}%
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }} 
                    />
                    
                    {/* Stability Boundary */}
                    <ReferenceLine x={0} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" label={{value:'Unstable Region', position:'insideTopRight', fill:'red', fontSize:10}}/>
                    
                    {/* 10% Damping Line (Ideal) */}
                    <ReferenceLine segment={[{x:0, y:0}, {x:-1, y:10}]} stroke="#10b981" strokeDasharray="2 2" label={{value:'10% Damping', position:'insideTopLeft', fill:'#10b981', fontSize:8}} />

                    <Scatter name="Modes" data={EIGENVALUES}>
                        {EIGENVALUES.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.dampingRatio < 0.03 ? '#ef4444' : entry.dampingRatio < 0.05 ? '#f59e0b' : '#3b82f6'} />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};

export const SystemStabilityEvaluationView: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [pssParams, setPssParams] = useState(TUNING_PARAMS);
  const [timeDomainData, setTimeDomainData] = useState<any[]>([]);

  // Oscillation Simulation
  useEffect(() => {
    const data = Array.from({length: 100}, (_, i) => {
        const t = i * 0.05;
        // Superposition of modes
        const mode1 = Math.exp(-0.2 * t) * Math.sin(5 * t); // Well damped
        const mode2 = Math.exp(-0.02 * t) * Math.sin(8.5 * t) * 0.5; // Poorly damped (Dominant)
        return {
            time: t.toFixed(2),
            power: 1 + (mode1 + mode2) * 0.1 // per unit
        };
    });
    setTimeDomainData(data);
  }, []);

  const handleSimulate = () => {
      setIsSimulating(true);
      setTimeout(() => setIsSimulating(false), 3000);
  };

  const handleParamChange = (id: string, val: number) => {
      setPssParams(prev => prev.map(p => p.id === id ? { ...p, value: val } : p));
  };

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200 bg-[#020204]">
      
      {/* 1. Header */}
      <div className="flex justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0a0520] to-transparent px-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <Activity size={14} className="animate-pulse" /> Grid Stability Assurance
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             远程系统 <span className="text-indigo-500">稳定性评估中心</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
               <span className="text-[10px] text-slate-500 uppercase">Damping Ratio (Min)</span>
               <span className="text-xl font-mono font-bold text-red-400">2.1%</span>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
               <span className="text-[10px] text-slate-500 uppercase">System Stiffness</span>
               <span className="text-xl font-mono font-bold text-white">High</span>
            </div>
            <button 
                onClick={handleSimulate}
                className={`ml-4 flex items-center gap-2 px-6 py-2 text-white text-sm font-bold rounded shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all
                    ${isSimulating ? 'bg-slate-800 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-500'}
                `}
            >
               {isSimulating ? <RefreshCw size={16} className="animate-spin"/> : <Play size={16} fill="currentColor"/>}
               {isSimulating ? 'Computing...' : 'Run Analysis'}
            </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden px-4 pb-4">
         
         {/* LEFT: Stability Margins & Events */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
             
             {/* Margin Radar */}
             <SciFiCard title="稳定性裕度 (Stability Margin)" subtitle="ASSESSMENT" className="h-[300px] border-indigo-900/30">
                 <div className="w-full h-full p-2">
                     <ResponsiveContainer width="100%" height="100%">
                         <RadarChart cx="50%" cy="50%" outerRadius="70%" data={STABILITY_INDICES}>
                             <PolarGrid stroke="#334155" />
                             <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                             <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                             <Radar name="Margin" dataKey="margin" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                             <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#6366f1', color: '#fff'}} />
                         </RadarChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

             {/* Disturbance Log */}
             <SciFiCard title="电网扰动事件库" subtitle="EVENTS" className="flex-1 border-slate-800">
                 <div className="flex flex-col gap-2">
                     {[
                         { id: 'E-01', type: 'Short Circuit', loc: 'Line 241', t: '-5m' },
                         { id: 'E-02', type: 'Load Step', loc: 'Bus A', t: '-2h' },
                         { id: 'E-03', type: 'Gen Trip', loc: 'Unit #3', t: '-1d' },
                     ].map((evt, i) => (
                         <div key={i} className="flex justify-between items-center p-2.5 bg-slate-900/40 border border-slate-800 rounded hover:border-red-500/30 transition-colors cursor-pointer group">
                             <div className="flex items-center gap-3">
                                 <div className="p-1.5 bg-slate-950 rounded text-red-400 border border-red-900/30 group-hover:bg-red-900/20">
                                     <Zap size={14} />
                                 </div>
                                 <div>
                                     <div className="text-xs font-bold text-slate-200">{evt.type}</div>
                                     <div className="text-[10px] text-slate-500">{evt.loc}</div>
                                 </div>
                             </div>
                             <span className="text-[10px] font-mono text-slate-400">{evt.t}</span>
                         </div>
                     ))}
                 </div>
                 <div className="mt-4 p-3 bg-indigo-900/10 border border-indigo-500/20 rounded text-[10px] text-indigo-200 leading-relaxed">
                     <BrainCircuit size={12} className="inline mr-1"/>
                     <strong>AI Insight:</strong> 0.2Hz inter-area oscillation detected after Line 241 fault. PSS tuning required.
                 </div>
             </SciFiCard>

         </div>

         {/* CENTER: The Analysis Core */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
             
             {/* 1. 3D & Phase Plane */}
             <div className="flex-1 grid grid-cols-2 gap-4 min-h-[300px]">
                 
                 {/* 3D Model */}
                 <SciFiCard title="机电暂态仿真" subtitle="DIGITAL TWIN" className="border-indigo-900/50 bg-[#03040a]" noPadding>
                     <div className="w-full h-full relative">
                         <div className="absolute inset-0 z-0 opacity-80">
                             <ThreeScene type="generator" color="#6366f1" />
                         </div>
                         <div className="absolute top-4 left-4 z-10 pointer-events-none">
                             <div className="flex items-center gap-2 text-[10px] text-indigo-300 bg-black/60 px-2 py-1 rounded border border-indigo-900/50">
                                 <Activity size={12} className="animate-pulse"/> Rotor Angle: 45.2°
                             </div>
                         </div>
                     </div>
                 </SciFiCard>

                 {/* Phase Plane */}
                 <PhasePlanePlot isSimulating={isSimulating} />
             </div>

             {/* 2. Oscillation Chart */}
             <SciFiCard title="时域功率震荡 (Power Swing)" subtitle="TIME DOMAIN" className="flex-[0.8] border-slate-800">
                 <div className="w-full h-full p-2">
                     <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={timeDomainData} margin={{top: 5, right: 0, left: 0, bottom: 0}}>
                             <defs>
                                 <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                 </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                             <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={10} />
                             <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={['auto', 'auto']} />
                             <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#ef4444', fontSize: '12px'}} />
                             <ReferenceLine y={1} stroke="#fff" strokeDasharray="3 3" />
                             <Area type="monotone" dataKey="power" stroke="#ef4444" strokeWidth={2} fill="url(#colorPower)" name="Active Power (pu)" />
                         </AreaChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

         </div>

         {/* RIGHT: Expert Controls */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
             
             {/* Eigenvalue Analysis */}
             <SciFiCard title="特征值分析 (Small Signal)" subtitle="MODAL" className="h-[250px] border-slate-800" noPadding>
                 <div className="w-full h-full p-2">
                     <EigenvaluePlot />
                 </div>
             </SciFiCard>

             {/* PSS Tuning Deck */}
             <SciFiCard title="PSS 参数整定" subtitle="CONTROL" className="flex-1 border-indigo-900/30">
                 <div className="flex flex-col gap-4 h-full">
                     <div className="space-y-4">
                         {pssParams.map(param => (
                             <div key={param.id}>
                                 <div className="flex justify-between text-xs mb-1">
                                     <span className="text-slate-300">{param.label}</span>
                                     <span className="font-mono text-cyan-400">{param.value}</span>
                                 </div>
                                 <input 
                                   type="range" 
                                   min={param.min} max={param.max} step={0.01}
                                   value={param.value}
                                   onChange={(e) => {
                                       const newVal = parseFloat(e.target.value);
                                       setPssParams(prev => prev.map(p => p.id === param.id ? { ...p, value: newVal } : p));
                                   }}
                                   className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                 />
                             </div>
                         ))}
                     </div>
                     
                     <div className="mt-auto pt-4 border-t border-slate-800 space-y-2">
                         <div className="flex justify-between items-center text-[10px] text-slate-400">
                             <span>Damping Improvement</span>
                             <span className="text-green-400 font-bold">+5.2%</span>
                         </div>
                         <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors">
                             <Save size={14} /> Apply Settings
                         </button>
                         <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors flex items-center justify-center gap-2">
                             <FileText size={14} /> Generate Report
                         </button>
                     </div>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
