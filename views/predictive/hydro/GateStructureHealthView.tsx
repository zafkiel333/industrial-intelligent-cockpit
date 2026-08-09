
import React, { useState, useEffect } from 'react';
import { GateStructureScene } from '../../../components/predictive/hydro-gate/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-25]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-25';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';
import { 
  Activity, ArrowDown, ArrowUp, Lock, Unlock, 
  AlertTriangle, Settings, Waves, Layers, 
  ShieldCheck, Gauge, Construction
} from 'lucide-react';

// --- Mock Data ---

const VIBRATION_SPECTRUM = Array.from({length: 40}, (_, i) => ({
    freq: i * 2,
    amp: 0.1 + Math.random() * 0.05 + (i > 5 && i < 15 ? 0.3 : 0) // Low freq flow induced vib
}));

const HOIST_FORCE_CURVE = Array.from({length: 50}, (_, i) => {
    // Opening %
    const pos = i * 2;
    // Force: Initial breakout friction + hydraulic load + weight - buoyancy
    // Simplified curve: High start, dips, then rises with water load changing
    let force = 1200; // kN
    if (pos < 5) force += 300; // Breakout
    else force = 1200 - pos * 2 + Math.sin(pos/10)*50;
    
    return { pos, force, limit: 1600 };
});

const CORROSION_MAP = [
    { zone: 'Splash Zone', depth: 0.8, rate: 'High' },
    { zone: 'Submerged', depth: 0.3, rate: 'Low' },
    { zone: 'Atmospheric', depth: 0.1, rate: 'Low' },
    { zone: 'Bottom Seal', depth: 0.6, rate: 'Med' },
];

export const GateStructureHealthView: React.FC = () => {
  // --- STATE ---
  const [metrics, setMetrics] = useState({
      opening: 0, // %
      waterUp: 8.5, // m
      waterDown: 2.1, // m
      trunnionFriction: 0.12, // Coeff
      hoistLoad: 0, // kN
      vibration: 0.05, // mm
      healthScore: 92.4
  });

  const [isOperating, setIsOperating] = useState(false);
  const [targetOpening, setTargetOpening] = useState(0);
  const [showStress, setShowStress] = useState(false);

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        // Move gate logic
        if (Math.abs(metrics.opening - targetOpening) > 0.5) {
            const dir = targetOpening > metrics.opening ? 1 : -1;
            setMetrics(prev => ({
                ...prev,
                opening: prev.opening + dir * 0.5,
                hoistLoad: 1200 + (dir > 0 ? 100 : -50) + Math.random()*20,
                vibration: 0.1 + Math.random() * 0.05
            }));
            setIsOperating(true);
        } else {
            setIsOperating(false);
            setMetrics(prev => ({
                ...prev,
                hoistLoad: prev.opening > 0 ? 1100 : 0, // Static load
                vibration: 0.05 + Math.random() * 0.01
            }));
        }

        // Water fluctuation
        setMetrics(prev => ({
            ...prev,
            waterUp: 8.5 + Math.sin(Date.now()/5000)*0.2,
            waterDown: 2.1 + (prev.opening > 0 ? prev.opening/50 : 0) + Math.random()*0.05
        }));

    }, 50);
    return () => clearInterval(interval);
  }, [targetOpening, metrics.opening]);

  const toggleGate = () => {
      setTargetOpening(prev => prev === 0 ? 100 : 0);
  };

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020610] text-teal-50 p-2 overflow-y-auto custom-scrollbar selection:bg-teal-500/30">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-teal-900/40 pb-4 bg-gradient-to-r from-[#031d24] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-400 mb-1 uppercase tracking-wider">
             <Construction size={14} className="animate-pulse" />
             Structural Integrity Monitor
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             弧形闸门 <span className="text-teal-500">结构整体健康评估</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Health Score</div>
                <div className="text-3xl font-mono font-bold text-green-400">{metrics.healthScore.toFixed(1)}</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Safe Ops Days</div>
                <div className="text-2xl font-mono font-bold text-white">1,842 <span className="text-sm text-slate-500">days</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Gate Status</div>
                <div className={`text-2xl font-bold ${isOperating ? 'text-yellow-400' : 'text-teal-400'}`}>
                    {isOperating ? 'MOVING' : (metrics.opening < 1 ? 'CLOSED' : 'OPEN')}
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Structural & Corrosion */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Displacement & Deformation */}
           <SciFiCard title="结构变形监测" subtitle="DISPLACEMENT" className="border-teal-900/50 bg-[#040f16]/80">
               <div className="flex flex-col gap-4 p-2">
                   <div className="grid grid-cols-2 gap-3">
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                           <div className="text-xs text-slate-400 mb-1">Trunnion X</div>
                           <div className="text-lg font-mono text-white">0.12 <span className="text-xs">mm</span></div>
                       </div>
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                           <div className="text-xs text-slate-400 mb-1">Arm Stress</div>
                           <div className="text-lg font-mono text-white">145 <span className="text-xs">MPa</span></div>
                       </div>
                   </div>
                   
                   <div className="flex items-center justify-between text-xs border-t border-slate-800 pt-2">
                       <span className="text-slate-500">支臂侧向失稳系数</span>
                       <span className="text-green-400 font-bold">4.2 (Safe)</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Corrosion Heatmap */}
           <SciFiCard title="腐蚀深度分布" subtitle="mm/yr" className="flex-1 border-teal-900/50">
               <div className="flex flex-col gap-3 h-full">
                   {CORROSION_MAP.map((c, i) => (
                       <div key={i} className="flex flex-col gap-1">
                           <div className="flex justify-between text-xs">
                               <span className="text-slate-300">{c.zone}</span>
                               <span className={c.depth > 0.5 ? 'text-yellow-400' : 'text-slate-400'}>{c.depth} mm</span>
                           </div>
                           <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                               <div className={`h-full ${c.rate === 'High' ? 'bg-red-500' : c.rate === 'Med' ? 'bg-yellow-500' : 'bg-green-500'}`} style={{width: `${c.depth * 80}%`}}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#020204] border border-teal-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(20,184,166,0.1)]">
               
               {/* Controls */}
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                   <button 
                     onClick={toggleGate}
                     className="flex items-center gap-2 bg-teal-900/80 hover:bg-teal-700 text-white px-4 py-2 rounded border border-teal-500/50 font-bold text-xs transition-all shadow-lg"
                   >
                       {metrics.opening > 0 ? <ArrowDown size={14}/> : <ArrowUp size={14}/>}
                       {metrics.opening > 0 ? 'CLOSE GATE' : 'OPEN GATE'}
                   </button>
                   <button 
                     onClick={() => setShowStress(!showStress)}
                     className={`flex items-center gap-2 px-3 py-2 rounded border font-bold text-xs transition-all ${showStress ? 'bg-red-900/60 border-red-500 text-white' : 'bg-black/50 border-slate-700 text-slate-400'}`}
                   >
                       <Layers size={14}/> Stress Map
                   </button>
               </div>

               {/* Right HUD */}
               <div className="absolute bottom-4 right-4 z-10 space-y-2 text-right">
                   <div className="bg-black/60 backdrop-blur px-3 py-2 rounded border border-teal-500/20">
                       <div className="text-[10px] text-slate-400 uppercase mb-1">Opening Height</div>
                       <div className="text-2xl font-bold text-white font-mono">{(metrics.opening/10).toFixed(1)} <span className="text-xs">m</span></div>
                       <div className="w-24 h-1 bg-slate-800 mt-1 rounded overflow-hidden">
                           <div className="h-full bg-teal-500" style={{width: `${metrics.opening}%`}}></div>
                       </div>
                   </div>
                   
                   <div className="bg-black/60 backdrop-blur px-3 py-2 rounded border border-teal-500/20">
                        <div className="text-[10px] text-slate-400 uppercase mb-1">Upstream Level</div>
                        <div className="text-xl font-bold text-blue-300 font-mono">{metrics.waterUp.toFixed(1)} <span className="text-xs">m</span></div>
                   </div>
               </div>

               <GateStructureScene 
                   openingHeight={metrics.opening}
                   waterLevelUpstream={metrics.waterUp}
                   waterLevelDownstream={metrics.waterDown}
                   stressMap={showStress}
                   vibrationIntensity={metrics.vibration > 0.1 ? 1.0 : 0.2}
                   trunnionHealth={95} // Fixed for demo
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Hoist Force Curve */}
           <SciFiCard title="启闭力特性曲线 (Hoist Force)" subtitle="HYSTERESIS" className="h-[250px] border-teal-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={HOIST_FORCE_CURVE}>
                           <defs>
                               <linearGradient id="forceFill" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#0f3d3e" vertical={false} />
                           <XAxis dataKey="pos" stroke="#5eead4" tick={{fontSize: 10}} label={{ value: 'Opening (%)', position: 'insideBottom', offset: -5, fill: '#5eead4', fontSize: 10 }} />
                           <YAxis stroke="#5eead4" tick={{fontSize: 10}} label={{ value: 'Force (kN)', angle: -90, position: 'insideLeft', fill: '#5eead4', fontSize: 10 }} />
                           <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#14b8a6', color: '#fff'}} />
                           <ReferenceLine y={1600} stroke="red" strokeDasharray="3 3" label={{value:'Limit', fill:'red', fontSize:10}} />
                           
                           <Area type="monotone" dataKey="force" stroke="#14b8a6" strokeWidth={2} fill="url(#forceFill)" />
                           {/* Dynamic Dot */}
                           {isOperating && (
                               <ReferenceLine x={metrics.opening} stroke="white" strokeDasharray="2 2" />
                           )}
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Vibration & Risk */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Vibration Spectrum */}
           <SciFiCard title="流激振动频谱 (FIV)" subtitle="0-100 Hz" className="flex-1 border-teal-900/50">
               <div className="h-full w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={VIBRATION_SPECTRUM}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#0f3d3e" vertical={false} />
                           <XAxis dataKey="freq" stroke="#475569" tick={{fontSize: 10}} />
                           <Tooltip cursor={{fill: '#0f3d3e'}} contentStyle={{backgroundColor: '#000', borderColor: '#14b8a6'}} />
                           <Bar dataKey="amp" fill="#2dd4bf" barSize={3} />
                       </BarChart>
                   </ResponsiveContainer>
                   <div className="text-[10px] text-center text-slate-500 mt-2">
                       Low frequency resonance detected at 20-30Hz (Gap Flow).
                   </div>
               </div>
           </SciFiCard>

           {/* Diagnostics */}
           <SciFiCard title="智能诊断与维护" className="border-teal-900/50">
               <div className="flex flex-col gap-3">
                   <div className="p-3 rounded border border-yellow-500/30 bg-yellow-900/10">
                       <div className="flex items-center gap-2 text-xs font-bold text-yellow-300 mb-1">
                           <AlertTriangle size={12} /> Trunnion Warning
                       </div>
                       <p className="text-[10px] text-slate-300">
                           Friction coefficient (0.12) slightly elevated. Suggest lubrication in next cycle.
                       </p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-2 text-xs">
                       <div className="p-2 bg-slate-900/50 rounded border border-slate-700 flex justify-between">
                           <span className="text-slate-400">Seal Life</span>
                           <span className="text-white">85%</span>
                       </div>
                       <div className="p-2 bg-slate-900/50 rounded border border-slate-700 flex justify-between">
                           <span className="text-slate-400">Wire Rope</span>
                           <span className="text-green-400">OK</span>
                       </div>
                   </div>

                   <button className="mt-2 w-full py-2 bg-teal-900/30 hover:bg-teal-900/50 border border-teal-500/50 rounded text-xs text-teal-200 transition-colors flex items-center justify-center gap-2">
                       <ShieldCheck size={12} /> View Full Report
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
