
import React, { useState, useEffect } from 'react';
import { GateCorrosionScene } from '../../../components/predictive/hydro-gate-corrosion/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-27]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-27';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, ComposedChart, Bar, BarChart, Scatter, ScatterChart
} from 'recharts';
import { 
  Clock, AlertTriangle, ShieldAlert, Activity, 
  Target, Layers, Play, Pause, Microscope, 
  Hexagon, Droplets, RotateCcw
} from 'lucide-react';

// --- Mock Data ---

// S-N Curve (Stress vs Cycles) - Logarithmic representation simplified
const SN_CURVE_DATA = Array.from({length: 50}, (_, i) => {
    const cycles = Math.pow(10, 4 + i * 0.1); // 10^4 to 10^9
    const stressLimit = 400 - 40 * Math.log10(cycles); // Simplified Wöhler line
    return {
        cyclesLog: 4 + i * 0.1,
        cycles: cycles,
        stress: Math.max(50, stressLimit),
        operatingPoint: i === 35 ? 120 : null // Current operating point
    };
});

// Corrosion Depth over Time (50 Years)
const CORROSION_DATA = Array.from({length: 51}, (_, i) => {
    const year = i;
    // Linear then accelerating corrosion
    const depth = 0.05 * year + (year > 25 ? Math.pow(year-25, 2) * 0.002 : 0);
    const thickness = 16 - depth; // Initial 16mm
    return {
        year,
        depth: depth.toFixed(2),
        thickness: thickness.toFixed(2),
        limit: 10 // Minimum thickness limit
    };
});

// Load Spectrum (Rainflow)
const LOAD_SPECTRUM = [
    { range: '0-20%', cycles: 150000 },
    { range: '20-40%', cycles: 85000 },
    { range: '40-60%', cycles: 45000 },
    { range: '60-80%', cycles: 12000 },
    { range: '80-100%', cycles: 2500 },
];

export const GateStructureCorrosionFatigueView: React.FC = () => {
  // --- STATE ---
  const [simYear, setSimYear] = useState(15); // Current simulation year
  const [isSimulating, setIsSimulating] = useState(false);
  const [stressLoad, setStressLoad] = useState(65); // %
  const [showStress, setShowStress] = useState(true);
  const [showCracks, setShowCracks] = useState(true);
  
  // Real-time sensor noise
  const [aeSignal, setAeSignal] = useState(0); // Acoustic Emission

  useEffect(() => {
    // Simulation Timer
    let interval: any;
    if (isSimulating) {
        interval = setInterval(() => {
            setSimYear(prev => {
                if (prev >= 50) {
                    setIsSimulating(false);
                    return 50;
                }
                return prev + 0.5;
            });
        }, 100);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  useEffect(() => {
      // AE Signal Noise
      const timer = setInterval(() => {
          setAeSignal(Math.random() * 20 + (simYear > 30 ? (simYear-30)*2 : 0));
      }, 500);
      return () => clearInterval(timer);
  }, [simYear]);

  // Derived Metrics
  const currentDepth = (0.05 * simYear + (simYear > 25 ? Math.pow(simYear-25, 2) * 0.002 : 0)).toFixed(2);
  const remainingLife = Math.max(0, 40 - simYear * (1 + Math.random()*0.1)).toFixed(1);
  const shi = Math.max(0, 100 - (parseFloat(currentDepth)/6)*100).toFixed(1); // Structural Health Index

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#0b0402] text-orange-50 p-2 overflow-y-auto custom-scrollbar selection:bg-orange-500/30">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-orange-900/40 pb-4 bg-gradient-to-r from-[#2a0f05] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 uppercase tracking-wider">
             <Microscope size={14} className="animate-pulse" />
             Structural Material Lab
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             闸门钢结构 <span className="text-orange-500">腐蚀与疲劳劣化预测</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Structural Health (SHI)</div>
                <div className={`text-3xl font-mono font-bold ${parseFloat(shi) < 60 ? 'text-red-500' : 'text-green-400'}`}>
                    {shi} <span className="text-sm text-slate-500">/ 100</span>
                </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Projected Life</div>
                <div className="text-2xl font-mono font-bold text-white">{remainingLife} <span className="text-sm text-slate-500">Years</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Corrosion Depth</div>
                <div className="text-2xl font-mono font-bold text-orange-400">{currentDepth} <span className="text-sm text-slate-500">mm</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: 3D Twin & Simulation Controls */}
        <div className="w-full lg:w-3/5 flex flex-col gap-5 relative">
           
           {/* 3D Viewport */}
           <div className="flex-1 min-h-[450px] bg-[#050201] border border-orange-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(234,88,12,0.1)]">
               
               {/* Time HUD */}
               <div className="absolute top-4 left-4 z-10 w-64">
                   <div className="bg-black/70 backdrop-blur border border-orange-500/30 px-4 py-3 rounded">
                       <div className="flex justify-between items-center mb-2">
                           <span className="text-xs text-orange-400 font-bold uppercase flex items-center gap-2"><Clock size={12}/> Timeline Simulation</span>
                           <span className="text-xl font-mono text-white font-bold">Year {Math.floor(simYear)}</span>
                       </div>
                       <input 
                         type="range" min="0" max="50" step="0.5" 
                         value={simYear} 
                         onChange={(e) => setSimYear(parseFloat(e.target.value))}
                         className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                       />
                       <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                           <span>Install (0)</span>
                           <span>End of Life (50)</span>
                       </div>
                   </div>
               </div>

               {/* View Controls */}
               <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                   <button 
                     onClick={() => setShowStress(!showStress)}
                     className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors flex items-center gap-2 ${showStress ? 'bg-blue-600/80 border-blue-400 text-white' : 'bg-black/50 border-slate-700 text-slate-400'}`}
                   >
                       <Layers size={12}/> Stress Heatmap
                   </button>
                   <button 
                     onClick={() => setShowCracks(!showCracks)}
                     className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors flex items-center gap-2 ${showCracks ? 'bg-red-600/80 border-red-400 text-white' : 'bg-black/50 border-slate-700 text-slate-400'}`}
                   >
                       <Activity size={12}/> Crack Overlay
                   </button>
               </div>

               {/* Playback Controls */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                   <button 
                     onClick={() => setIsSimulating(!isSimulating)}
                     className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg
                        ${isSimulating ? 'bg-orange-900/80 border border-orange-500 text-orange-100' : 'bg-green-700/80 border border-green-500 text-white'}
                     `}
                   >
                       {isSimulating ? <Pause size={16}/> : <Play size={16}/>}
                       {isSimulating ? 'PAUSE AGING' : 'START AGING SIM'}
                   </button>
                   <button 
                     onClick={() => setSimYear(0)}
                     className="p-2 rounded-full bg-slate-800/80 border border-slate-600 text-slate-300 hover:text-white"
                   >
                       <RotateCcw size={16}/>
                   </button>
               </div>

               <GateCorrosionScene 
                   ageYears={simYear}
                   stressLoad={stressLoad}
                   showStress={showStress}
                   showCracks={showCracks}
                   corrosionRate={1.0}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Sensors Strip */}
           <div className="h-24 flex gap-4">
               <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded p-3 flex flex-col justify-center">
                   <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><Activity size={10} className="text-red-400"/> Acoustic Emission</div>
                   <div className="text-xl font-mono text-white mt-1">{aeSignal.toFixed(1)} <span className="text-xs text-slate-500">dB</span></div>
                   <div className="w-full h-1 bg-slate-800 rounded mt-1"><div className="h-full bg-red-500 transition-all" style={{width: `${Math.min(100, aeSignal)}%`}}></div></div>
               </div>
               <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded p-3 flex flex-col justify-center">
                   <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><Target size={10} className="text-blue-400"/> Stress Cycles</div>
                   <div className="text-xl font-mono text-white mt-1">{(simYear * 15000).toLocaleString()}</div>
               </div>
               <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded p-3 flex flex-col justify-center">
                   <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><Droplets size={10} className="text-orange-400"/> Coating Loss</div>
                   <div className="text-xl font-mono text-white mt-1">{(Math.min(100, simYear * 2.5)).toFixed(0)} <span className="text-xs text-slate-500">%</span></div>
               </div>
           </div>

        </div>

        {/* RIGHT: Analytical Dashboard */}
        <div className="w-full lg:w-2/5 flex flex-col gap-5">
           
           {/* Fatigue S-N Curve */}
           <SciFiCard title="疲劳寿命 S-N 曲线" subtitle="FATIGUE LIMIT" className="h-[280px] border-orange-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={SN_CURVE_DATA} margin={{left: 20}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" />
                           <XAxis 
                             dataKey="cyclesLog" 
                             type="number" 
                             domain={[4, 9]} 
                             tickFormatter={(val) => `10^${val}`}
                             stroke="#7c2d12" 
                             tick={{fontSize: 10}}
                             label={{ value: 'Cycles (N)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#7c2d12' }} 
                           />
                           <YAxis stroke="#7c2d12" tick={{fontSize: 10}} label={{ value: 'Stress (MPa)', angle: -90, position: 'insideLeft', fill: '#7c2d12', fontSize: 10 }} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0502', borderColor: '#f97316', color: '#fff'}} />
                           
                           {/* Limit Curve */}
                           <Line type="monotone" dataKey="stress" stroke="#f97316" strokeWidth={2} dot={false} name="Fatigue Limit" />
                           
                           {/* Operating Point */}
                           <Scatter data={[{cyclesLog: 6.5 + (simYear/50)*1.5, stress: stressLoad * 2}]} fill="#3b82f6" shape="cross" name="Current Ops" />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Corrosion Depth Forecast */}
           <SciFiCard title="腐蚀深度演化预测" subtitle="WALL THICKNESS" className="h-[250px] border-orange-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={CORROSION_DATA}>
                           <defs>
                               <linearGradient id="colorDepth" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" />
                           <XAxis dataKey="year" stroke="#7c2d12" tick={{fontSize: 10}} />
                           <YAxis yAxisId="left" stroke="#ef4444" tick={{fontSize: 10}} label={{ value: 'Depth (mm)', angle: -90, position: 'insideLeft', fill: '#ef4444' }} />
                           <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{fontSize: 10}} domain={[0, 16]} label={{ value: 'Thickness (mm)', angle: 90, position: 'insideRight', fill: '#94a3b8' }} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0502', borderColor: '#ef4444', color: '#fff'}} />
                           
                           <ReferenceLine yAxisId="right" y={10} stroke="red" strokeDasharray="3 3" label={{value: 'Limit', fill: 'red', fontSize: 10}} />
                           <ReferenceLine x={simYear} stroke="white" />
                           
                           <Area yAxisId="left" type="monotone" dataKey="depth" stroke="#ef4444" fill="url(#colorDepth)" name="Corrosion" />
                           <Line yAxisId="right" type="monotone" dataKey="thickness" stroke="#94a3b8" strokeWidth={2} dot={false} name="Remaining Steel" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Load Spectrum Bar */}
           <SciFiCard title="载荷谱 (Load Spectrum)" className="flex-1 border-orange-900/50">
               <div className="h-full w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={LOAD_SPECTRUM} layout="vertical" margin={{left: 10, right: 10, top: 5, bottom: 5}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" horizontal={false} />
                           <XAxis type="number" stroke="#7c2d12" hide />
                           <YAxis dataKey="range" type="category" stroke="#94a3b8" width={50} tick={{fontSize: 10}} />
                           <Tooltip cursor={{fill: '#2a0f05'}} contentStyle={{backgroundColor: '#0c0502', borderColor: '#f97316'}} />
                           <Bar dataKey="cycles" fill="#f97316" barSize={15} radius={[0, 4, 4, 0]} />
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
