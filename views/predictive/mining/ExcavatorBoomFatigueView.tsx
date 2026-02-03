import React, { useState, useEffect } from 'react';
import { BoomFatigueThreeScene } from '../../../components/predictive/mining-boom-fatigue/ThreeScene';
import { StrainGauge } from '../../../components/predictive/mining-boom-fatigue/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, Cell, ComposedChart, ScatterChart, Scatter, Legend
} from 'recharts';
import { 
  Activity, AlertTriangle, ShieldCheck, Ruler, 
  TrendingUp, Timer, Hammer, Search, 
  GitCommit, Layers, Hexagon, Maximize2,
  Minimize2, Pause, Play, Microscope, FileText
} from 'lucide-react';

// --- Mock Data ---

// Rainflow Counting Data (Stress Cycles)
const RAINFLOW_DATA = Array.from({length: 20}, (_, i) => ({
    range: `${i*10}-${(i+1)*10}`,
    count: Math.floor(Math.exp(-(i-5)*(i-5)/10) * 5000 + Math.random()*500),
    stress: i*10 + 5
}));

// Paris Law Crack Propagation
const CRACK_PROPAGATION = Array.from({length: 36}, (_, i) => {
    const month = i;
    // Exponential growth
    const length = 1.5 * Math.exp(0.08 * month);
    return {
        month: `M${month}`,
        length: length.toFixed(2),
        critical: 12
    };
});

// Real-time Stress Tensor Stream
const STRESS_STREAM = Array.from({length: 50}, (_, i) => ({
    time: i,
    s1: 120 + Math.sin(i*0.2)*50 + Math.random()*10,
    s2: 80 + Math.sin(i*0.2 + 1)*30,
    s3: 40 + Math.random()*20
}));

// Weld Health Status
const WELD_POINTS = [
    { id: 'W1', loc: 'Boom Root', fatigue: 0.45, status: 'Good' },
    { id: 'W2', loc: 'Cylinder Lug', fatigue: 0.72, status: 'Warning' },
    { id: 'W3', loc: 'Arm Pivot', fatigue: 0.30, status: 'Good' },
    { id: 'W4', loc: 'Bucket Pin', fatigue: 0.85, status: 'Critical' },
];

const STRAIN_SENSORS: StrainGauge[] = [
    { id: 'SG-01', label: 'Boom Root Top', position: [0, 2, 2], value: 450 },
    { id: 'SG-02', label: 'Boom Mid Side', position: [0.8, 6, 0.5], value: 320 },
    { id: 'SG-03', label: 'Arm Cylinder Mount', position: [0, 9, -1], value: 680 },
];

export const ExcavatorBoomFatigueView: React.FC = () => {
  // --- State ---
  const [boomAngle, setBoomAngle] = useState(30);
  const [armAngle, setArmAngle] = useState(45);
  const [stressFactor, setStressFactor] = useState(0.5);
  const [isSimulating, setIsSimulating] = useState(true);
  const [viewMode, setViewMode] = useState<'stress' | 'fatigue' | 'wireframe'>('stress');
  const [selectedWeld, setSelectedWeld] = useState<string | null>('W2');

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
        if (!isSimulating) return;

        const t = Date.now() / 1500;
        // Digging cycle simulation
        const cycle = Math.sin(t);
        
        setBoomAngle(30 + cycle * 20);
        setArmAngle(45 + Math.cos(t) * 30);
        
        // Stress peaks at digging point (lowest arm angle approx)
        const load = Math.max(0, -Math.cos(t)); 
        setStressFactor(0.3 + load * 0.7);

    }, 50);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const activeWeldData = WELD_POINTS.find(w => w.id === selectedWeld);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#050508] text-slate-200 p-2 overflow-y-auto custom-scrollbar selection:bg-orange-500/30">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-orange-900/40 pb-4 bg-gradient-to-r from-[#1c0a05] to-transparent px-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 uppercase tracking-wider">
             <Hammer size={14} className="animate-pulse" />
             Structural Health Monitoring (SHM)
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             挖掘机动臂 <span className="text-orange-500">结构疲劳劣化预测</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">累积疲劳损伤度 (D)</div>
                <div className="text-3xl font-mono font-bold text-white">0.425</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">剩余循环次数</div>
                <div className="text-3xl font-mono font-bold text-green-400">1.2M <span className="text-sm text-slate-500">Cycles</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-orange-400">当前应力峰值</div>
                <div className={`text-2xl font-mono font-bold ${stressFactor > 0.8 ? 'text-red-500' : 'text-white'}`}>
                    {(stressFactor * 450).toFixed(0)} <span className="text-xs">MPa</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Fatigue Analysis */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Rainflow Counting */}
           <SciFiCard title="应力循环雨流计数 (Rainflow)" subtitle="CYCLE HISTOGRAM" className="h-[300px] border-orange-900/50 bg-[#0c0a09]/80" noPadding>
               <div className="w-full h-full p-4 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={RAINFLOW_DATA} margin={{top: 10, right: 0, bottom: 0, left: -20}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" vertical={false} />
                           <XAxis dataKey="range" stroke="#7c2d12" tick={{fontSize: 9}} angle={-45} textAnchor="end" height={50} />
                           <YAxis stroke="#7c2d12" tick={{fontSize: 9}} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0502', borderColor: '#f97316'}} cursor={{fill: '#2a1a1a'}} />
                           <Bar dataKey="count" fill="#f97316" radius={[2, 2, 0, 0]}>
                               {RAINFLOW_DATA.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fillOpacity={entry.stress > 150 ? 1 : 0.6} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
                   <div className="absolute top-2 right-2 text-[9px] text-slate-500 bg-black/60 px-2 py-1 rounded">
                       High Amplitude Cycles: 12%
                   </div>
               </div>
           </SciFiCard>

           {/* Weld Health Matrix */}
           <SciFiCard title="关键焊缝健康矩阵" subtitle="WELD STATUS" className="flex-1 border-orange-900/50">
               <div className="flex flex-col gap-3">
                   {WELD_POINTS.map(w => (
                       <div 
                         key={w.id} 
                         onClick={() => setSelectedWeld(w.id)}
                         className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between group
                            ${selectedWeld === w.id ? 'bg-orange-900/30 border-orange-500' : 'bg-slate-900/40 border-slate-800 hover:border-orange-500/30'}
                         `}
                       >
                           <div className="flex items-center gap-3">
                               <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs
                                   ${w.status === 'Critical' ? 'bg-red-900 text-red-200' : w.status === 'Warning' ? 'bg-yellow-900 text-yellow-200' : 'bg-green-900 text-green-200'}
                               `}>
                                   {w.id}
                               </div>
                               <div>
                                   <div className="text-xs font-bold text-white group-hover:text-orange-300">{w.loc}</div>
                                   <div className="text-[10px] text-slate-500">Damage: {w.fatigue.toFixed(2)}</div>
                               </div>
                           </div>
                           <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full ${w.status === 'Critical' ? 'bg-red-500' : w.status === 'Warning' ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                 style={{width: `${w.fatigue * 100}%`}}
                               ></div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Viewport */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#0a0505] to-[#020202] border border-orange-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(249,115,22,0.1)] group">
               
               {/* Controls */}
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                   <button 
                     onClick={() => setViewMode('stress')} 
                     className={`px-3 py-1.5 text-xs font-bold rounded border transition-colors ${viewMode === 'stress' ? 'bg-orange-600 border-orange-400 text-white' : 'bg-black/60 border-slate-700 text-slate-400'}`}
                   >
                       Stress Map
                   </button>
                   <button 
                     onClick={() => setViewMode('fatigue')} 
                     className={`px-3 py-1.5 text-xs font-bold rounded border transition-colors ${viewMode === 'fatigue' ? 'bg-red-600 border-red-400 text-white' : 'bg-black/60 border-slate-700 text-slate-400'}`}
                   >
                       Fatigue Life
                   </button>
               </div>

               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4 bg-black/70 backdrop-blur px-4 py-2 rounded-full border border-slate-700">
                   <button onClick={() => setIsSimulating(!isSimulating)} className="text-orange-400 hover:text-white transition-colors">
                       {isSimulating ? <Pause size={20} /> : <Play size={20} />}
                   </button>
                   <div className="w-[1px] h-6 bg-slate-600"></div>
                   <div className="flex flex-col justify-center">
                       <span className="text-[9px] text-slate-400 uppercase">Load Cycle</span>
                       <span className="text-xs font-mono text-white">{isSimulating ? 'DIGGING' : 'IDLE'}</span>
                   </div>
               </div>

               {/* Stress Gauge Overlay */}
               <div className="absolute top-4 right-4 z-10 w-48">
                   <div className="bg-black/60 backdrop-blur border border-orange-500/30 p-3 rounded">
                       <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] text-orange-400 font-bold uppercase">实时应力张量</span>
                           <Activity size={12} className="text-orange-500 animate-pulse" />
                       </div>
                       <div className="space-y-1">
                           {STRAIN_SENSORS.map(s => (
                               <div key={s.id} className="flex justify-between text-xs">
                                   <span className="text-slate-400">{s.id}</span>
                                   <span className="font-mono text-white">{(s.value * (0.5 + stressFactor*0.5)).toFixed(0)} με</span>
                               </div>
                           ))}
                       </div>
                   </div>
               </div>

               <BoomFatigueThreeScene 
                   boomAngle={boomAngle}
                   armAngle={armAngle}
                   bucketAngle={-30}
                   stressFactor={stressFactor}
                   weldHealth={activeWeldData ? (1 - activeWeldData.fatigue) * 100 : 80}
                   strainGauges={STRAIN_SENSORS}
                   showStrainSensors={true}
                   viewMode={viewMode}
               />
           </div>

           {/* Real-time Stress Plot */}
           <SciFiCard title="应力波形实时监测" subtitle="STRAIN GAUGE" className="h-[220px] border-orange-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={STRESS_STREAM}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" vertical={false} />
                           <XAxis dataKey="time" hide />
                           <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[0, 200]} label={{ value: 'Stress (MPa)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0502', borderColor: '#f97316'}} />
                           <Legend iconType="plain" wrapperStyle={{fontSize: '10px'}} />
                           <Line type="monotone" dataKey="s1" stroke="#f97316" strokeWidth={2} dot={false} name="Boom Root" />
                           <Line type="monotone" dataKey="s2" stroke="#0ea5e9" strokeWidth={1} dot={false} name="Cylinder" />
                       </LineChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Crack Prediction & Maintenance */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Crack Propagation */}
           <SciFiCard title="裂纹扩展预测 (Paris Law)" subtitle="FRACTURE MECH" className="h-[280px] border-orange-900/50">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={CRACK_PROPAGATION}>
                           <defs>
                               <linearGradient id="crackFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
                           <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 9}} />
                           <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0502', borderColor: '#ef4444'}} />
                           <ReferenceLine y={12} stroke="red" strokeDasharray="3 3" label={{value: 'Crit', fill: 'red', fontSize: 9}} />
                           <Area type="monotone" dataKey="length" stroke="#ef4444" fill="url(#crackFill)" name="Crack Len (mm)" />
                       </AreaChart>
                   </ResponsiveContainer>
                   <div className="text-[10px] text-center text-slate-500 mt-2">
                       Predicted Critical Failure: <span className="text-red-400 font-bold">M28</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Maintenance Strategy */}
           <SciFiCard title="结构维护策略" className="flex-1 border-orange-900/50">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-2 mb-2 text-xs font-bold text-orange-300">
                           <Microscope size={14} /> NDT Inspection
                       </div>
                       <div className="flex justify-between items-center text-[10px] text-slate-400">
                           <span>Last Check</span>
                           <span className="text-white">2023-11-15</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                           <span>Next Due</span>
                           <span className="text-yellow-400 font-bold">14 Days</span>
                       </div>
                   </div>

                   <div className="space-y-2">
                       <div className="text-[10px] font-bold text-slate-500 uppercase">Action Items</div>
                       <div className="flex items-center gap-2 text-xs text-slate-300">
                           <ShieldCheck size={12} className="text-green-500" /> Reinforce Weld W2
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300">
                           <ShieldCheck size={12} className="text-slate-600" /> UT Scan Boom Pivot
                       </div>
                   </div>
                   
                   <button className="mt-auto w-full py-2 bg-orange-900/20 hover:bg-orange-900/40 border border-orange-500/50 rounded text-xs text-orange-200 transition-colors flex items-center justify-center gap-2">
                       <FileText size={14} /> Generate Repair Plan
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};