
import React, { useState, useEffect } from 'react';
import { GateStictionScene } from '../../../components/predictive/hydro-gate-stiction/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-29]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-29';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, ComposedChart, ScatterChart, Scatter, BarChart, Bar, Cell
} from 'recharts';
import { 
  AlertOctagon, GripHorizontal, ArrowUpDown, 
  Activity, Sliders, Volume2, ShieldAlert, 
  Settings, Play, Pause, RotateCcw
} from 'lucide-react';

// --- Mock Data ---

// Load vs Position (Hysteresis Loop - identifying binding)
const LOAD_CURVE = Array.from({length: 100}, (_, i) => {
    const pos = i;
    // Ideal: Smooth curve (Buoyancy changes linearly)
    const ideal = 120 - pos * 0.5;
    // Actual: Has bumps where friction is high
    let friction = 0;
    if (pos > 30 && pos < 40) friction = 20; // Binding spot 1
    if (pos > 70 && pos < 75) friction = 35; // Binding spot 2
    
    return {
        pos,
        ideal,
        actual: ideal + friction + Math.random() * 2
    };
});

// Skew Trend
const SKEW_TREND = Array.from({length: 50}, (_, i) => ({
    time: i,
    skew: Math.sin(i * 0.2) * 5 + (i > 30 ? (i-30)*0.5 : 0), // Growing skew
    limit: 15 // mm
}));

// Friction Zones (for 3D)
const FRICTION_ZONES = [
    { y: 35, intensity: 0.6 },
    { y: 72, intensity: 0.9 },
];

export const GateStictionRiskView: React.FC = () => {
  // --- STATE ---
  const [gatePos, setGatePos] = useState(0); // %
  const [targetPos, setTargetPos] = useState(0);
  const [skew, setSkew] = useState(2.5); // mm
  const [hoistForce, setHoistForce] = useState(120); // tons
  const [jamProb, setJamProb] = useState(12.5); // %
  const [isOperating, setIsOperating] = useState(false);
  const [jammed, setJammed] = useState(false);

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        // Gate Movement Logic
        if (Math.abs(gatePos - targetPos) > 0.5) {
            const dir = targetPos > gatePos ? 1 : -1;
            
            // Check for jam at friction zones
            let speed = 0.5;
            let isJamming = false;
            
            // Simulate slow down at friction zones
            if ((gatePos > 30 && gatePos < 40) || (gatePos > 70 && gatePos < 75)) {
                speed = 0.1;
                // Random chance to "jam" visually
                if (Math.random() > 0.8) isJamming = true;
            }

            setGatePos(prev => prev + dir * speed);
            setJammed(isJamming);
            setIsOperating(true);
            
            // Update Metrics based on position
            setHoistForce(120 - gatePos * 0.5 + (isJamming ? 30 : 0));
            setSkew(2.5 + Math.sin(gatePos * 0.1) * 2 + (isJamming ? 5 : 0));
            
        } else {
            setIsOperating(false);
            setJammed(false);
        }

        // Random Fluctuation
        setJamProb(prev => {
            const base = 12.5;
            const dynamic = isOperating && (gatePos > 70 && gatePos < 75) ? 65 : 0;
            return base + dynamic;
        });

    }, 50);

    return () => clearInterval(interval);
  }, [gatePos, targetPos]);

  const toggleGate = () => {
      setTargetPos(prev => prev === 0 ? 100 : 0);
  };

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#080202] text-orange-50 p-2 overflow-y-auto custom-scrollbar selection:bg-orange-500/30">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-orange-900/40 pb-4 bg-gradient-to-r from-[#260a0a] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-400 mb-1 uppercase tracking-wider">
             <GripHorizontal size={14} className="animate-pulse" />
             Mechanical Binding Analysis
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             闸门卡阻 <span className="text-orange-500">与失灵风险预测</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Jamming Probability</div>
                <div className={`text-3xl font-mono font-bold ${jamProb > 50 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {jamProb.toFixed(1)} <span className="text-sm text-slate-500">%</span>
                </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Current Skew</div>
                <div className="text-2xl font-mono font-bold text-white">{skew.toFixed(1)} <span className="text-sm text-slate-500">mm</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Hoist Force</div>
                <div className="text-2xl font-mono font-bold text-yellow-400">{hoistForce.toFixed(0)} <span className="text-sm text-slate-500">kN</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Monitoring & Skew */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Skew Monitor Gauge */}
           <SciFiCard title="双缸/链条同步偏差 (Skew)" subtitle="DEVIATION" className="border-orange-900/50 bg-[#140502]/80">
               <div className="flex flex-col items-center py-4">
                   {/* Visual Gauge */}
                   <div className="relative w-full h-16 bg-slate-900/50 rounded border border-slate-800 flex items-center px-4">
                       <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-500 z-0"></div>
                       <div className="w-full h-1 bg-slate-700 rounded-full relative">
                           {/* Marker */}
                           <div 
                             className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_10px_orange] transition-all duration-100"
                             style={{ left: `${50 + (skew / 20) * 50}%` }}
                           ></div>
                       </div>
                   </div>
                   <div className="flex justify-between w-full text-xs text-slate-500 mt-1 px-1">
                       <span>-20mm</span>
                       <span>0</span>
                       <span>+20mm</span>
                   </div>
                   
                   <div className="mt-4 w-full grid grid-cols-2 gap-3">
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                           <div className="text-[10px] text-slate-500">Left Cyl</div>
                           <div className="font-mono text-white">{(gatePos * 10).toFixed(1)} mm</div>
                       </div>
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                           <div className="text-[10px] text-slate-500">Right Cyl</div>
                           <div className="font-mono text-white">{(gatePos * 10 + skew).toFixed(1)} mm</div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Skew History Trend */}
           <SciFiCard title="纠偏趋势记录" className="flex-1 border-orange-900/50">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={SKEW_TREND}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                           <XAxis dataKey="time" hide />
                           <YAxis stroke="#ea580c" tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0202', borderColor: '#ea580c', color: '#fff'}} />
                           <ReferenceLine y={15} stroke="red" strokeDasharray="3 3" label={{value:'Trip', fill:'red', fontSize:10}} />
                           <Line type="monotone" dataKey="skew" stroke="#f97316" strokeWidth={2} dot={false} />
                       </LineChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: Digital Twin & Force Curve */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#050101] border border-orange-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(249,115,22,0.1)]">
               
               {/* Controls */}
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                   <button 
                     onClick={toggleGate}
                     className="flex items-center gap-2 bg-orange-900/80 hover:bg-orange-700 text-white px-4 py-2 rounded border border-orange-500/50 font-bold text-xs transition-all shadow-lg"
                   >
                       {isOperating ? (
                           <> <Activity className="animate-spin" size={14}/> OPERATING </>
                       ) : (
                           <> <ArrowUpDown size={14}/> {targetPos === 100 ? 'OPEN' : 'CLOSE'} </>
                       )}
                   </button>
               </div>

               {/* Friction Alert Overlay */}
               {jammed && (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center animate-pulse">
                       <AlertOctagon size={48} className="text-red-500" />
                       <span className="text-red-500 font-bold bg-black/80 px-2 rounded">MOTION BLOCKED</span>
                   </div>
               )}

               <GateStictionScene 
                   position={gatePos}
                   skew={skew}
                   frictionZones={FRICTION_ZONES}
                   waterLevel={8.5}
                   isMoving={isOperating}
                   jammed={jammed}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Load vs Position Curve */}
           <SciFiCard title="启闭力-行程曲线 (Force vs Stroke)" subtitle="STICK-SLIP DETECTION" className="h-[280px] border-orange-900/50" noPadding>
               <div className="w-full h-full p-4 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={LOAD_CURVE}>
                           <defs>
                               <linearGradient id="colorForce" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" />
                           <XAxis dataKey="pos" stroke="#7c2d12" tick={{fontSize: 10}} label={{ value: 'Stroke (%)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#7c2d12' }} />
                           <YAxis stroke="#7c2d12" tick={{fontSize: 10}} label={{ value: 'Force (kN)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#7c2d12' }} domain={[0, 200]} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0202', borderColor: '#f97316', color: '#fff'}} />
                           
                           {/* Ideal Curve */}
                           <Line type="monotone" dataKey="ideal" stroke="#334155" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Baseline" />
                           
                           {/* Actual Curve */}
                           <Area type="monotone" dataKey="actual" stroke="#f97316" strokeWidth={2} fill="url(#colorForce)" name="Current" />
                           
                           {/* Current Position Marker */}
                           <ReferenceLine x={gatePos} stroke="#fff" />
                       </ComposedChart>
                   </ResponsiveContainer>
                   
                   {/* Friction Anomalies Markers */}
                   <div className="absolute bottom-8 left-[35%] w-8 h-8 rounded-full border-2 border-red-500/50 animate-ping pointer-events-none"></div>
                   <div className="absolute bottom-8 left-[75%] w-8 h-8 rounded-full border-2 border-red-500/50 animate-ping pointer-events-none"></div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Diagnostics & Acoustic */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Acoustic Fingerprint */}
           <SciFiCard title="声纹异响监测" subtitle="SCRAPING NOISE" className="border-orange-900/50">
               <div className="flex flex-col gap-4">
                   <div className="h-24 flex items-end gap-1 px-2 border-b border-slate-800 pb-2">
                       {Array.from({length: 20}).map((_, i) => (
                           <div key={i} className="flex-1 bg-slate-800 rounded-t overflow-hidden relative h-full">
                               <div 
                                 className="absolute bottom-0 w-full bg-orange-500 transition-all duration-100" 
                                 style={{
                                     height: `${Math.random() * 30 + (isOperating && (gatePos > 30 && gatePos < 40) ? 60 : 0)}%`,
                                     opacity: i > 12 ? 0.8 : 0.3 // High freq emphasis
                                 }}
                               ></div>
                           </div>
                       ))}
                   </div>
                   <div className="flex justify-between text-[10px] text-slate-500">
                       <span>Low Freq (Rumble)</span>
                       <span>High Freq (Screech)</span>
                   </div>
                   
                   <div className="p-2 bg-red-900/10 border border-red-900/30 rounded text-xs text-red-300 flex items-center gap-2">
                       <Volume2 size={14} />
                       <span>Metal-on-Metal contact signature detected at 35% stroke.</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Maintenance & Risk */}
           <SciFiCard title="卡阻风险评估" className="flex-1 border-orange-900/50">
               <div className="space-y-4 h-full">
                   <div>
                       <div className="flex justify-between text-xs text-slate-300 mb-1">
                           <span>Guide Rail Wear</span>
                           <span className="text-yellow-400">Moderate</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <div className="bg-yellow-500 h-full" style={{width: '60%'}}></div>
                       </div>
                   </div>
                   <div>
                       <div className="flex justify-between text-xs text-slate-300 mb-1">
                           <span>Wheel Bearing Health</span>
                           <span className="text-green-400">Good</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <div className="bg-green-500 h-full" style={{width: '90%'}}></div>
                       </div>
                   </div>

                   <div className="mt-auto pt-4 border-t border-slate-800">
                       <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Recommendation</div>
                       <ul className="space-y-2 text-xs text-slate-300">
                           <li className="flex gap-2"><Settings size={12} className="text-orange-500"/> Lubricate track segment 3 (30-40%).</li>
                           <li className="flex gap-2"><ShieldAlert size={12} className="text-red-500"/> Check synchronization valve.</li>
                       </ul>
                       <button className="w-full mt-4 py-2 bg-orange-700/30 hover:bg-orange-600/50 border border-orange-500/50 rounded text-xs text-orange-100 transition-colors">
                           Create Inspection Task
                       </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
