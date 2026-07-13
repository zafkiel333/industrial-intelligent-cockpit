
import React, { useState, useEffect } from 'react';
import { RollerSliderScene } from '../../../components/predictive/hydro-roller-slider/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-28]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-28';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, ScatterChart, Scatter, ComposedChart, Bar, BarChart
} from 'recharts';
import { 
  Settings, Activity, AlertTriangle, Disc, 
  Thermometer, Droplets, TrendingDown, Clock,
  Microscope, Layers, Gauge, RefreshCcw
} from 'lucide-react';

// --- Mock Data ---

// Stribeck Curve Data (Friction Coeff vs Hersey Number)
// Used to visualize lubrication regime
const STRIBECK_DATA = Array.from({length: 50}, (_, i) => {
    const x = i * 0.1; // Speed * Viscosity / Load
    // Curve shape: Boundary -> Mixed -> Hydrodynamic
    let mu = 0;
    if (x < 1) mu = 0.15 - x * 0.1; // Boundary (High friction)
    else if (x < 2.5) mu = 0.05 - (x-1)*0.02; // Mixed
    else mu = 0.02 + (x-2.5)*0.005; // Hydrodynamic (Low but rising)
    return { x, mu };
});

// Wear Rate Trend (Archard's Law simulation)
const WEAR_TREND = Array.from({length: 30}, (_, i) => {
    const cycles = i * 1000;
    // Non-linear wear (run-in -> steady -> severe)
    let wear = 0;
    if (i < 5) wear = i * 0.05; // Run-in
    else if (i < 20) wear = 0.25 + (i-5)*0.02; // Steady
    else wear = 0.55 + Math.pow(i-20, 1.5) * 0.05; // Severe
    
    return { 
        cycles, 
        wear,
        limit: 1.5 // mm
    };
});

// Acoustic Emission Spectrum (Bearing/Roller health)
const AE_SPECTRUM = Array.from({length: 40}, (_, i) => ({
    freq: i * 5, // kHz
    amp: Math.random() * 20 + (i > 15 && i < 25 ? 40 : 0) // Peak around 100kHz for cracking
}));

const COMPONENTS = [
    { id: 'R1', name: 'Left Main Roller', type: 'Roller', health: 85, wear: 0.25 },
    { id: 'R2', name: 'Right Main Roller', type: 'Roller', health: 92, wear: 0.15 },
    { id: 'S1', name: 'Side Slider Top', type: 'Slider', health: 70, wear: 0.8 },
    { id: 'S2', name: 'Side Slider Bot', type: 'Slider', health: 75, wear: 0.6 },
];

export const GateRollerSliderWearView: React.FC = () => {
  // --- STATE ---
  const [selectedComp, setSelectedComp] = useState(COMPONENTS[0]);
  const [metrics, setMetrics] = useState({
      contactPress: 120, // MPa
      frictionCoeff: 0.05,
      temp: 42.5, // C
      wearDepth: 0.25, // mm
      cycles: 12500,
      aeLevel: 45, // dB
      lubrication: 'Mixed' as 'Boundary' | 'Mixed' | 'Hydrodynamic'
  });
  
  const [isSimulating, setIsSimulating] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        if (!isSimulating) return;
        
        const t = Date.now() / 1000;
        
        // Simulate dynamic load effect on friction and temp
        const loadVar = Math.sin(t * 0.5);
        
        setMetrics(prev => {
            const newPress = 120 + loadVar * 20;
            // Friction increases with pressure if lube breaks down
            const newFric = 0.05 + (newPress > 135 ? 0.02 : 0) + Math.random()*0.005;
            const newTemp = 42.5 + Math.abs(loadVar) * 5;
            
            // Determine lube regime
            let lube = 'Hydrodynamic';
            if (newFric > 0.08) lube = 'Mixed';
            if (newFric > 0.12) lube = 'Boundary';

            return {
                ...prev,
                contactPress: newPress,
                frictionCoeff: newFric,
                temp: newTemp,
                aeLevel: 45 + (newFric * 200) + Math.random()*5,
                lubrication: lube as any
            };
        });

    }, 200);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Derived visuals
  const wearPercent = (metrics.wearDepth / 1.5); // 1.5mm is limit

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#0c0a05] text-amber-50 p-2 overflow-y-auto custom-scrollbar selection:bg-amber-500/30">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-amber-900/40 pb-4 bg-gradient-to-r from-[#291b05] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <Microscope size={14} className="animate-pulse" />
             Tribology & Wear Mechanics
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             闸门滚轮与滑块 <span className="text-amber-500">磨损寿命预测</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Estimated RUL</div>
                <div className="text-3xl font-mono font-bold text-white">4,250 <span className="text-sm text-slate-500">cycles</span></div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Friction Coeff (μ)</div>
                <div className={`text-2xl font-mono font-bold ${metrics.frictionCoeff > 0.1 ? 'text-red-500' : 'text-green-400'}`}>
                    {metrics.frictionCoeff.toFixed(3)}
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Lubrication Regime</div>
                <div className={`text-2xl font-bold ${metrics.lubrication === 'Boundary' ? 'text-red-500' : metrics.lubrication === 'Mixed' ? 'text-yellow-400' : 'text-cyan-400'}`}>
                    {metrics.lubrication.toUpperCase()}
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Component Selection & Tribology */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Component List */}
           <SciFiCard title="监测部件列表" subtitle="ROLLING/SLIDING" className="border-amber-900/50 bg-[#160b02]/80">
               <div className="flex flex-col gap-2">
                   {COMPONENTS.map(comp => (
                       <div 
                         key={comp.id}
                         onClick={() => setSelectedComp(comp)}
                         className={`p-3 rounded border cursor-pointer transition-all flex justify-between items-center
                            ${selectedComp.id === comp.id ? 'bg-amber-900/30 border-amber-500' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                         `}
                       >
                           <div className="flex items-center gap-3">
                               <div className={`p-2 rounded-full ${comp.type === 'Roller' ? 'bg-blue-900/30 text-blue-400' : 'bg-orange-900/30 text-orange-400'}`}>
                                   {comp.type === 'Roller' ? <Disc size={16}/> : <Layers size={16}/>}
                               </div>
                               <div>
                                   <div className="text-sm font-bold text-white">{comp.name}</div>
                                   <div className="text-[10px] text-slate-500">Wear: {(comp.wear).toFixed(2)}mm</div>
                               </div>
                           </div>
                           <div className={`text-xs font-bold ${comp.health < 80 ? 'text-red-400' : 'text-green-400'}`}>
                               {comp.health}%
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Stribeck Curve */}
           <SciFiCard title="润滑状态曲线 (Stribeck)" subtitle="LUBRICATION" className="flex-1 border-amber-900/50">
               <div className="w-full h-full p-2 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={STRIBECK_DATA}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" />
                           <XAxis dataKey="x" stroke="#78350f" tick={{fontSize: 10}} label={{ value: 'Hersey Number', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                           <YAxis stroke="#78350f" tick={{fontSize: 10}} label={{ value: 'Friction Coeff (f)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0804', borderColor: '#f59e0b', color: '#fff'}} />
                           
                           {/* Zones */}
                           <ReferenceLine x={1} stroke="#333" label={{value:'Boundary', fontSize:9, fill:'#555'}} />
                           <ReferenceLine x={2.5} stroke="#333" label={{value:'Mixed', fontSize:9, fill:'#555'}} />
                           
                           <Line type="monotone" dataKey="mu" stroke="#f59e0b" strokeWidth={2} dot={false} />
                           
                           {/* Current Operating Point */}
                           {/* Mapping current friction to curve approx */}
                           <ReferenceLine y={metrics.frictionCoeff} stroke="red" strokeDasharray="3 3" />
                       </LineChart>
                   </ResponsiveContainer>
                   <div className="absolute top-2 right-2 text-[10px] text-slate-500 bg-black/60 p-1 rounded">
                       Viscosity • Speed / Load
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#050302] border border-amber-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(245,158,11,0.1)]">
               
               {/* HUD Overlay */}
               <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                   <div className="bg-black/60 backdrop-blur border border-amber-500/20 px-3 py-2 rounded">
                       <div className="text-[10px] text-amber-400 font-bold uppercase mb-1 flex items-center gap-2">
                           <Activity size={12} /> Contact Pressure
                       </div>
                       <div className="flex items-end gap-2">
                           <span className="text-3xl font-mono font-bold text-white leading-none">{metrics.contactPress.toFixed(0)}</span>
                           <span className="text-xs text-slate-400 mb-1">MPa</span>
                       </div>
                       <div className="w-32 h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-green-500 to-red-500" style={{width: `${(metrics.contactPress/200)*100}%`}}></div>
                       </div>
                   </div>
               </div>

               {/* Right HUD */}
               <div className="absolute top-4 right-4 z-10">
                   <div className="bg-black/60 backdrop-blur border border-amber-500/20 px-3 py-2 rounded text-right">
                       <div className="text-[10px] text-slate-400 uppercase mb-1">Material Temp</div>
                       <div className="text-xl font-bold text-white">{metrics.temp.toFixed(1)} °C</div>
                   </div>
               </div>

               {/* View Toggle */}
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                   <button 
                     onClick={() => setShowHeatmap(!showHeatmap)}
                     className={`px-3 py-1 rounded border text-xs font-bold flex items-center gap-2 transition-colors
                        ${showHeatmap ? 'bg-amber-600 border-amber-400 text-white' : 'bg-black/60 border-slate-600 text-slate-400'}
                     `}
                   >
                       <Thermometer size={14} /> Stress Heatmap
                   </button>
                   <button 
                     onClick={() => setIsSimulating(!isSimulating)}
                     className="px-3 py-1 rounded border bg-slate-800 border-slate-600 text-slate-300 text-xs font-bold"
                   >
                       {isSimulating ? 'Pause Sim' : 'Resume Sim'}
                   </button>
               </div>

               <RollerSliderScene 
                   wearLevel={wearPercent}
                   rotationSpeed={2.0}
                   contactStress={metrics.contactPress / 200}
                   debrisAmount={wearPercent * 0.8}
                   lubricationMode={metrics.lubrication === 'Boundary' ? 'dry' : 'oil'}
                   showHeatmap={showHeatmap}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Wear Rate Trend */}
           <SciFiCard title="磨损深度演化预测" subtitle="ARCHARD MODEL" className="h-[250px] border-amber-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={WEAR_TREND}>
                           <defs>
                               <linearGradient id="wearFill" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                           <XAxis dataKey="cycles" stroke="#78350f" tick={{fontSize: 10}} label={{ value: 'Cycles', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                           <YAxis stroke="#78350f" tick={{fontSize: 10}} label={{ value: 'Wear (mm)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0804', borderColor: '#ef4444', color: '#fff'}} />
                           <ReferenceLine y={1.5} stroke="red" strokeDasharray="3 3" label={{value:'Limit', fill:'red', fontSize:10}} />
                           
                           <Area type="monotone" dataKey="wear" stroke="#ef4444" fill="url(#wearFill)" strokeWidth={2} name="Wear Depth" />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Diagnostics & AE */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Acoustic Emission */}
           <SciFiCard title="声发射信号 (Acoustic Emission)" subtitle="CRACK DETECTION" className="flex-1 border-amber-900/50">
               <div className="h-full flex flex-col gap-4">
                   <div className="h-32 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={AE_SPECTRUM}>
                               <Bar dataKey="amp" fill="#f59e0b" />
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-2 text-center">
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                           <div className="text-[10px] text-slate-500">RMS Level</div>
                           <div className="text-lg font-bold text-white">{metrics.aeLevel.toFixed(1)} dB</div>
                       </div>
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                           <div className="text-[10px] text-slate-500">Kurtosis</div>
                           <div className="text-lg font-bold text-green-400">2.8</div>
                       </div>
                   </div>
                   
                   <div className="text-[10px] text-slate-400 mt-auto">
                       High frequency spikes detected &gt; 100kHz indicating micro-cracking initiation.
                   </div>
               </div>
           </SciFiCard>

           {/* Maintenance Strategy */}
           <SciFiCard title="维护策略建议" className="border-amber-900/50">
               <div className="space-y-3">
                   <div className="flex items-center gap-3 p-2 bg-slate-900/50 border border-slate-800 rounded">
                       <Droplets size={16} className="text-cyan-400" />
                       <div>
                           <div className="text-xs font-bold text-white">Lubrication Boost</div>
                           <div className="text-[10px] text-slate-500">Inject grease at intervals: 4h</div>
                       </div>
                   </div>

                   <div className="flex items-center gap-3 p-2 bg-slate-900/50 border border-slate-800 rounded">
                       <RefreshCcw size={16} className="text-yellow-400" />
                       <div>
                           <div className="text-xs font-bold text-white">Rotation Check</div>
                           <div className="text-[10px] text-slate-500">Verify free movement of roller R1</div>
                       </div>
                   </div>
                   
                   <button className="w-full py-2 bg-amber-900/20 hover:bg-amber-900/40 border border-amber-500/50 rounded text-xs text-amber-200 transition-colors flex items-center justify-center gap-2">
                       <Settings size={12} /> Schedule Inspection
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
