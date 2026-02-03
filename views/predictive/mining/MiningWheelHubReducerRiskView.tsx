
import React, { useState, useEffect } from 'react';
import { WheelHubThreeScene } from '../../../components/predictive/mining-wheel-hub/ThreeScene';
import { GearComponent } from '../../../components/predictive/mining-wheel-hub/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, ComposedChart, Legend, ScatterChart, Scatter
} from 'recharts';
import { 
  Settings, AlertOctagon, Activity, Thermometer, 
  Droplets, Microscope, Target, RotateCw, 
  TrendingUp, Layers, Crosshair, Box, 
  Cpu, Zap, ShieldCheck, CheckCircle2, FileText
} from 'lucide-react';

// --- Mock Data ---

const VIBRATION_SPECTRUM = Array.from({length: 60}, (_, i) => ({
    freq: i * 5, // Hz
    // Simulate gear mesh frequencies (GMF) and harmonics
    amp: Math.random() * 0.5 + (i === 15 ? 5.2 : i === 30 ? 2.8 : i === 45 ? 1.5 : 0), 
    limit: 6.0
}));

const OIL_DEBRIS_TREND = Array.from({length: 24}, (_, i) => {
    const t = i;
    // Exponential growth of Fe particles indicating wear
    const fe = 50 + Math.exp(t * 0.15) * 5 + Math.random() * 10;
    return { time: `-${24-i}w`, fe: fe.toFixed(0), cu: 20 + i, si: 15 + Math.random()*5 };
});

const FAILURE_PROBS = [
    { mode: 'Pitting (点蚀)', prob: 78, color: '#f59e0b' },
    { mode: 'Spalling (剥落)', prob: 45, color: '#0ea5e9' },
    { mode: 'Scuffing (胶合)', prob: 25, color: '#10b981' },
    { mode: 'Crack (裂纹)', prob: 12, color: '#6366f1' },
];

const COMPONENTS: GearComponent[] = [
    { id: 'sun-gear', name: '太阳轮 (Sun Gear)', type: 'sun', health: 82, stress: 0.65, temperature: 95 },
    { id: 'planet-1', name: '行星轮 #1', type: 'planet', health: 95, stress: 0.3, temperature: 88 },
    { id: 'planet-2', name: '行星轮 #2', type: 'planet', health: 45, stress: 0.9, temperature: 110 }, // Faulty
    { id: 'planet-3', name: '行星轮 #3', type: 'planet', health: 92, stress: 0.35, temperature: 89 },
    { id: 'ring-gear', name: '内齿圈 (Ring Gear)', type: 'ring', health: 88, stress: 0.4, temperature: 85 },
];

export const MiningWheelHubReducerRiskView: React.FC = () => {
  // --- State ---
  const [rpm, setRpm] = useState(350);
  const [load, setLoad] = useState(75); // %
  const [vibLevel, setVibLevel] = useState(1.0);
  const [activeFault, setActiveFault] = useState<string | null>('planet-2');
  const [viewMode, setViewMode] = useState<'solid' | 'stress' | 'exploded'>('solid');
  
  // Real-time Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        const t = Date.now() / 1000;
        
        // Load fluctuation simulates uneven terrain
        const loadNoise = Math.sin(t) * 10 + (Math.random()-0.5)*5;
        setLoad(Math.max(10, 75 + loadNoise));
        
        // RPM correlates with load roughly
        setRpm(350 - loadNoise * 2);
        
        // Vibration spikes with load
        setVibLevel(1.0 + Math.abs(loadNoise/20) + (activeFault ? 1.5 : 0));
        
    }, 200);
    return () => clearInterval(interval);
  }, [activeFault]);

  const activeCompData = COMPONENTS.find(c => c.id === activeFault) || COMPONENTS[0];

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#050202] text-orange-50 p-2 overflow-y-auto custom-scrollbar selection:bg-orange-500/30">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-orange-900/40 pb-4 bg-gradient-to-r from-[#210e02] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-3 bg-orange-600/20 rounded-lg border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                <Settings size={32} className="text-orange-400 animate-spin-slow" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 uppercase tracking-wider font-bold">
                    <Activity size={14} /> Wheel End Drivetrain Prognostics
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    轮边减速器 <span className="text-orange-500 font-extrabold">故障风险预测中心</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">预测剩余寿命 (RUL)</div>
                <div className="text-3xl font-mono font-bold text-white">
                    840 <span className="text-sm text-slate-500 font-normal">Hrs</span>
                </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">综合健康评分</div>
                <div className="text-3xl font-mono font-bold text-orange-400">72.4</div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-red-400">主要风险源</div>
                <div className="flex items-center gap-2 text-xl font-bold text-white uppercase font-mono">
                    <AlertOctagon size={20} className="text-red-500 animate-pulse" /> PLANET #2
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Vibration & Oil Analysis */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Vibration Spectrum */}
           <SciFiCard title="振动频谱特征 (Vibration FFT)" subtitle="GMF ANALYSIS" className="h-[300px] border-orange-900/50 bg-[#0c0502]/80" noPadding>
               <div className="w-full h-full p-4 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={VIBRATION_SPECTRUM}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                           <XAxis dataKey="freq" stroke="#7c2d12" tick={{fontSize: 9}} />
                           <YAxis stroke="#7c2d12" tick={{fontSize: 9}} />
                           <Tooltip cursor={{fill: '#331c0a'}} contentStyle={{backgroundColor: '#000', borderColor: '#f97316'}} />
                           <ReferenceLine y={5.0} stroke="red" strokeDasharray="3 3" label={{value:'Limit', fill:'red', fontSize:9}} />
                           <Bar dataKey="amp" fill="#f97316" radius={[2, 2, 0, 0]}>
                               {VIBRATION_SPECTRUM.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.amp > 4 ? '#ef4444' : '#f97316'} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
                   <div className="absolute top-4 right-4 text-[9px] text-slate-500 bg-black/60 px-2 py-1 rounded border border-slate-800">
                       Peak @ 75Hz (GMF 1X)
                   </div>
               </div>
           </SciFiCard>

           {/* Oil Debris (Ferrography) */}
           <SciFiCard title="油液铁谱趋势 (Ferrography)" subtitle="WEAR PARTICLES" className="flex-1 border-orange-900/50">
               <div className="h-full w-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={OIL_DEBRIS_TREND}>
                           <defs>
                               <linearGradient id="colorFe" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" />
                           <XAxis dataKey="time" stroke="#7c2d12" tick={{fontSize: 9}} />
                           <YAxis stroke="#7c2d12" tick={{fontSize: 9}} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#ef4444'}} />
                           <Area type="monotone" dataKey="fe" stroke="#ef4444" fill="url(#colorFe)" name="Iron (ppm)" />
                           <Line type="monotone" dataKey="cu" stroke="#0ea5e9" dot={false} strokeWidth={2} name="Copper (ppm)" />
                       </AreaChart>
                   </ResponsiveContainer>
                   <div className="mt-2 flex items-center gap-2 text-xs text-red-300">
                       <Droplets size={12} /> <span className="font-bold">Alert:</span> Ferrous debris accumulation rate +15%/week.
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[450px] bg-[#050200] border border-orange-800/40 relative rounded-2xl overflow-hidden shadow-[inset_0_0_100px_rgba(249,115,22,0.15)] group">
               
               {/* HUD Left */}
               <div className="absolute top-6 left-6 z-10 space-y-4 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-orange-500/30 px-4 py-3 rounded flex flex-col gap-2 shadow-2xl pointer-events-auto">
                       <div className="text-[10px] text-orange-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Cpu size={14} /> Planetary Gearbox Digital Twin
                       </div>
                       <div className="flex items-center gap-8">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">Input Speed</div>
                               <div className="text-xl font-mono font-bold text-white">{rpm.toFixed(0)} <span className="text-xs">RPM</span></div>
                           </div>
                           <div className="w-[1px] h-8 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">Reduction Ratio</div>
                               <div className="text-xl font-mono font-bold text-cyan-400">28.5 : 1</div>
                           </div>
                       </div>
                   </div>
                   
                   {activeFault && (
                       <div className="flex items-center gap-3 bg-red-900/40 border border-red-500 px-4 py-2 rounded animate-in slide-in-from-left-4 fade-in">
                           <Crosshair className="text-red-500 animate-spin" size={20} />
                           <div>
                               <div className="text-xs font-bold text-white uppercase">Fault Localized</div>
                               <div className="text-[10px] text-red-200">{activeCompData.name} - High Stress</div>
                           </div>
                       </div>
                   )}
               </div>

               {/* View Controls */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-3 pointer-events-auto">
                   <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700 flex flex-col gap-2 shadow-2xl backdrop-blur">
                       <button onClick={() => setViewMode('solid')} className={`p-2 rounded ${viewMode === 'solid' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-white'}`} title="Solid"><Box size={18}/></button>
                       <button onClick={() => setViewMode('stress')} className={`p-2 rounded ${viewMode === 'stress' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-white'}`} title="Stress Map"><Target size={18}/></button>
                       <button onClick={() => setViewMode('exploded')} className={`p-2 rounded ${viewMode === 'exploded' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-white'}`} title="Explode"><Layers size={18}/></button>
                   </div>
               </div>

               <WheelHubThreeScene 
                   rpm={rpm}
                   torque={load}
                   vibration={vibLevel}
                   oilLevel={0.6}
                   debrisLevel={0.4}
                   viewMode={viewMode}
                   components={COMPONENTS}
                   activeFaultId={activeFault}
               />

               {/* Bottom HUD: Torque */}
               <div className="absolute bottom-6 right-6 z-10">
                   <div className="bg-black/60 backdrop-blur px-4 py-2 rounded border border-orange-500/20 text-right">
                       <div className="text-[10px] text-slate-400 uppercase mb-1">Load Torque</div>
                       <div className="text-2xl font-mono font-bold text-white">{(load * 12.5).toFixed(0)} <span className="text-xs text-slate-500">Nm</span></div>
                       <div className="w-32 h-1 bg-slate-800 rounded mt-1 overflow-hidden">
                           <div className="h-full bg-orange-500 transition-all duration-300" style={{width: `${load}%`}}></div>
                       </div>
                   </div>
               </div>

           </div>

           {/* Component Health Matrix */}
           <SciFiCard title="行星轮系健康矩阵" subtitle="PLANETARY STAGE" className="h-[220px] border-orange-900/50" noPadding>
               <div className="w-full h-full p-3 grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar">
                   {COMPONENTS.map(comp => (
                       <div 
                         key={comp.id} 
                         onClick={() => setActiveFault(comp.id)}
                         className={`p-2 rounded border cursor-pointer transition-all flex flex-col gap-1
                            ${activeFault === comp.id ? 'bg-orange-900/40 border-orange-500' : 'bg-slate-900/40 border-slate-800 hover:border-orange-500/30'}
                         `}
                       >
                           <div className="flex justify-between items-center">
                               <span className="text-xs font-bold text-slate-200">{comp.name}</span>
                               <span className={`text-[10px] px-1.5 rounded ${comp.health < 60 ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                                   {comp.health}%
                               </span>
                           </div>
                           <div className="flex justify-between text-[9px] text-slate-500">
                               <span className="flex items-center gap-1"><Thermometer size={10}/> {comp.temperature}°C</span>
                               <span className="flex items-center gap-1"><Activity size={10}/> {(comp.stress*100).toFixed(0)}%</span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Probability & Recommendations */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* Failure Mode Probability */}
           <SciFiCard title="失效模式概率分布" subtitle="FAULT CLASSIFICATION" className="h-[300px] border-orange-900/50">
               <div className="w-full h-full flex flex-col">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={FAILURE_PROBS} layout="vertical" margin={{left: 10}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" horizontal={false} />
                               <XAxis type="number" stroke="#7c2d12" hide />
                               <YAxis dataKey="mode" type="category" stroke="#94a3b8" width={80} tick={{fontSize: 10}} />
                               <Tooltip cursor={{fill: '#331c0a'}} contentStyle={{backgroundColor: '#000', borderColor: '#f97316'}} />
                               <Bar dataKey="prob" radius={[0, 4, 4, 0]} barSize={15}>
                                   {FAILURE_PROBS.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.color} />
                                   ))}
                               </Bar>
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="mt-2 text-[10px] text-slate-500 text-center">
                       High probability of <span className="text-orange-400 font-bold">Pitting</span> detected on Planet Gear #2.
                   </div>
               </div>
           </SciFiCard>

           {/* Maintenance Action */}
           <SciFiCard title="维护决策建议" className="flex-1 border-orange-900/50 bg-[#160a02]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-red-900/20 border border-red-500/30 rounded flex items-start gap-3 shadow-inner">
                       <ShieldCheck className="text-red-500 shrink-0 mt-1" size={18} />
                       <div>
                           <div className="text-xs font-bold text-white uppercase">立即干预警告</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                               2号行星轮点蚀面积已达 15%，且伴随异常高温（110°C）。预计剩余寿命 &lt; 200 小时。建议立即停机更换行星架总成。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-2">
                       <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-1">
                           <span className="text-slate-400">备件库存</span>
                           <span className="text-green-400 font-bold flex items-center gap-1"><CheckCircle2 size={10}/> In Stock</span>
                       </div>
                       <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-1">
                           <span className="text-slate-400">预计工时</span>
                           <span className="text-white font-mono">12 Hours</span>
                       </div>
                   </div>

                   <button className="mt-auto w-full py-3 bg-orange-700/30 hover:bg-orange-700/50 border border-orange-500/50 rounded-lg text-xs text-orange-100 font-bold transition-all flex items-center justify-center gap-2 group shadow-lg">
                       <FileText size={16} className="group-hover:translate-x-1 transition-transform" /> 
                       生成紧急维修工单
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
