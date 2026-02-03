
import React, { useState, useEffect } from 'react';
import { GisBayScene } from '../../../components/predictive/hydro-gis/ThreeScene';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from 'recharts';
import { 
  Zap, Wind, Activity, AlertTriangle, 
  Search, Sliders, Box, Layers, 
  Thermometer, Droplets, Fingerprint, ShieldCheck
} from 'lucide-react';

// --- Mock Data ---

const DENSITY_TREND = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    pressure: 0.62 + Math.sin(i*0.2) * 0.005 - (i * 0.0005), // Slow leak sim
    temp: 22 + Math.sin(i*0.3) * 5
}));

const BREAKER_COIL_CURVE = Array.from({length: 100}, (_, i) => {
    // Typical coil current signature: Rise -> Dip (Armature move) -> Rise -> Steady
    const t = i;
    let current = 0;
    if (t < 10) current = t * 0.5;
    else if (t < 30) current = 5 - (t-10)*0.1; // Dip
    else if (t < 50) current = 3 + (t-30)*0.2;
    else if (t < 80) current = 7;
    else current = 0;
    return { time: t, current };
});

const PRPD_PATTERN = Array.from({length: 150}, (_, i) => ({
    phase: Math.random() * 360,
    q: Math.random() * 50 + (Math.random() > 0.9 ? 100 : 0), // Occasional spikes
    count: Math.floor(Math.random() * 10)
}));

const GAS_DECOMPOSITION = [
    { name: 'SO2', value: 2.5, limit: 10 },
    { name: 'H2S', value: 0.8, limit: 5 },
    { name: 'HF', value: 1.2, limit: 8 },
    { name: 'CO', value: 150, limit: 300 },
];

export const GisSwitchgearHealthView: React.FC = () => {
  // --- STATE ---
  const [sf6Density, setSf6Density] = useState(99.5); // %
  const [pressure, setPressure] = useState(0.62); // MPa
  const [pdLevel, setPdLevel] = useState(15); // pC
  const [breakerState, setBreakerState] = useState<'open'|'closed'>('closed');
  const [viewMode, setViewMode] = useState<'casing'|'internal'|'gas'>('casing');
  const [selectedPart, setSelectedPart] = useState<string | null>('cb-unit');

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        const t = Date.now() / 1000;
        setPressure(0.62 + Math.sin(t*0.1)*0.002);
        setPdLevel(15 + (Math.random() > 0.95 ? Math.random()*50 : 0));
        setSf6Density(99.5 + Math.sin(t*0.05)*0.1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020406] text-slate-200 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-cyan-900/40 pb-4 bg-gradient-to-r from-[#082f49] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Layers size={14} className="animate-pulse" />
             Gas Insulated Switchgear (GIS)
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             GIS 开关设备 <span className="text-cyan-500">健康状态评估</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">SF6 Pressure</div>
                <div className="text-3xl font-mono font-bold text-white">{pressure.toFixed(3)} <span className="text-sm text-slate-500">MPa</span></div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">PD Intensity</div>
                <div className={`text-2xl font-mono font-bold ${pdLevel > 50 ? 'text-purple-500 animate-pulse' : 'text-green-400'}`}>
                    {pdLevel.toFixed(0)} <span className="text-sm text-slate-500">pC</span>
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Breaker Status</div>
                <div className={`text-2xl font-bold ${breakerState === 'closed' ? 'text-red-500' : 'text-green-500'}`}>
                    {breakerState.toUpperCase()}
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Gas & Environment */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* SF6 Status */}
           <SciFiCard title="SF6 气体生态监测" subtitle="INSULATION" className="border-cyan-900/50 bg-[#061018]/80">
               <div className="flex flex-col gap-4 p-2">
                   <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-700">
                       <div className="flex items-center gap-2">
                           <Wind size={16} className="text-cyan-400" />
                           <span className="text-xs text-slate-300">Density</span>
                       </div>
                       <span className="font-mono text-white font-bold">{sf6Density.toFixed(2)}%</span>
                   </div>
                   
                   <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-700">
                       <div className="flex items-center gap-2">
                           <Droplets size={16} className="text-blue-400" />
                           <span className="text-xs text-slate-300">Moisture</span>
                       </div>
                       <span className="font-mono text-white font-bold">125 ppm</span>
                   </div>

                   <div className="h-32">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={DENSITY_TREND}>
                               <defs>
                                   <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="time" hide />
                               <YAxis domain={[0.61, 0.63]} hide />
                               <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#22d3ee'}} />
                               <Area type="monotone" dataKey="pressure" stroke="#22d3ee" fill="url(#colorP)" strokeWidth={2} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </SciFiCard>

           {/* Decomposition Products */}
           <SciFiCard title="气体分解产物 (Decomposition)" subtitle="ARCING BYPRODUCTS" className="flex-1 border-cyan-900/50">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={GAS_DECOMPOSITION} layout="vertical" margin={{left: 0}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                           <XAxis type="number" hide />
                           <YAxis dataKey="name" type="category" stroke="#94a3b8" width={30} tick={{fontSize: 10}} />
                           <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#000', borderColor: '#a855f7'}} />
                           <Bar dataKey="value" barSize={15} radius={[0, 4, 4, 0]}>
                               {GAS_DECOMPOSITION.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.value > entry.limit ? '#ef4444' : '#a855f7'} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
                   <div className="text-[10px] text-slate-500 mt-2 text-center">
                       High SO2 indicates internal sparking or overheating.
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[450px] bg-[#020203] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(34,211,238,0.1)] group">
               
               {/* Controls */}
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                   <button onClick={() => setViewMode('casing')} className={`px-3 py-1 rounded text-xs border ${viewMode === 'casing' ? 'bg-cyan-600 border-cyan-400 text-black' : 'bg-black/50 border-slate-700 text-slate-400'}`}>External</button>
                   <button onClick={() => setViewMode('internal')} className={`px-3 py-1 rounded text-xs border ${viewMode === 'internal' ? 'bg-cyan-600 border-cyan-400 text-black' : 'bg-black/50 border-slate-700 text-slate-400'}`}>X-Ray</button>
                   <button onClick={() => setViewMode('gas')} className={`px-3 py-1 rounded text-xs border ${viewMode === 'gas' ? 'bg-cyan-600 border-cyan-400 text-black' : 'bg-black/50 border-slate-700 text-slate-400'}`}>Gas Field</button>
               </div>

               {/* Selected Info */}
               <div className="absolute top-4 right-4 z-10 text-right">
                   <div className="bg-black/70 backdrop-blur p-2 rounded border border-cyan-500/30">
                       <div className="text-[10px] text-slate-400 uppercase">Selected Component</div>
                       <div className="text-sm font-bold text-white">{selectedPart ? selectedPart.toUpperCase() : 'NONE'}</div>
                   </div>
               </div>

               {/* Spark Alert */}
               {pdLevel > 30 && (
                   <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                       <div className="flex items-center gap-2 bg-purple-900/80 px-4 py-2 rounded-full border border-purple-500 text-white animate-pulse">
                           <Zap size={16} /> 
                           <span className="text-xs font-bold">PARTIAL DISCHARGE DETECTED</span>
                       </div>
                   </div>
               )}

               <GisBayScene 
                   sf6Density={sf6Density}
                   pdLocation={pdLevel > 30 ? [0, 2, 0] : []}
                   breakerState={breakerState}
                   selectedPartId={selectedPart}
                   onPartSelect={setSelectedPart}
                   viewMode={viewMode}
               />
           </div>

           {/* Breaker Coil Signature */}
           <SciFiCard title="断路器机械特性 (Coil Signature)" subtitle="TRIP CURVE" className="h-[250px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={BREAKER_COIL_CURVE}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Time (ms)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Current (A)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#22d3ee', color: '#fff'}} />
                           <Line type="monotone" dataKey="current" stroke="#22d3ee" strokeWidth={2} dot={false} />
                           <ReferenceLine y={5} stroke="red" strokeDasharray="3 3" label={{value: 'Ref', fill: 'red', fontSize: 10}} />
                       </LineChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Electrical Fingerprint */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* PRPD Pattern */}
           <SciFiCard title="特高频局放图谱 (PRPD)" subtitle="UHF PD" className="h-[300px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{top: 10, right: 10, bottom: 10, left: 10}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                           <XAxis type="number" dataKey="phase" domain={[0, 360]} stroke="#64748b" tick={{fontSize: 10}} name="Phase" unit="°" />
                           <YAxis type="number" dataKey="q" domain={[0, 200]} stroke="#64748b" tick={{fontSize: 10}} name="Amplitude" unit="pC" />
                           <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#000', borderColor: '#a855f7'}} />
                           <Scatter name="PD" data={PRPD_PATTERN} fill="#a855f7" shape="circle" />
                       </ScatterChart>
                   </ResponsiveContainer>
                   <div className="text-[10px] text-center text-slate-500 mt-2">
                       Cluster Analysis: <span className="text-purple-400 font-bold">Floating Potential</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Health Summary */}
           <SciFiCard title="综合健康诊断" className="flex-1 border-cyan-900/50">
               <div className="flex flex-col gap-4">
                   <div className="flex justify-between items-center text-xs text-slate-300 border-b border-slate-800 pb-2">
                       <span>Insulation Aging</span>
                       <span className="text-green-400">Slow</span>
                   </div>
                   <div className="flex justify-between items-center text-xs text-slate-300 border-b border-slate-800 pb-2">
                       <span>Gas Leakage Rate</span>
                       <span className="text-yellow-400">0.5 %/yr</span>
                   </div>
                   <div className="flex justify-between items-center text-xs text-slate-300 border-b border-slate-800 pb-2">
                       <span>Contact Wear</span>
                       <span className="text-white">12%</span>
                   </div>

                   <div className="mt-2 p-2 bg-slate-900/50 rounded border border-slate-700 text-xs text-slate-400">
                       <div className="flex items-center gap-2 mb-1 font-bold text-cyan-400"><Fingerprint size={12}/> AI Fingerprint</div>
                       Matches "Loose Shield" signature with 85% confidence.
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
