
import React, { useState, useEffect } from 'react';
import { GateHoistScene } from '../../../components/predictive/hydro-gate-hoist/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-26]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-26';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Cell,
  ScatterChart, Scatter
} from 'recharts';
import { 
  Activity, ArrowRight, AlertTriangle, Thermometer, 
  Droplets, Gauge, TrendingUp, Search, 
  GitCommit, RefreshCw, StopCircle, PlayCircle
} from 'lucide-react';

// --- Mock Data ---

// Hysteresis Loop: Cylinder Force vs Stroke
// A healthy loop is smooth. Stiction causes spikes at start.
const HYSTERESIS_LOOP = Array.from({length: 100}, (_, i) => {
    // 0 -> 100 -> 0 cycle
    const phase = (i / 100) * Math.PI * 2;
    const stroke = 50 + 50 * Math.sin(phase - Math.PI/2); 
    
    // Ideal Force
    let force = stroke * 10 + 500; // Base load
    
    // Add Friction
    const dir = Math.cos(phase - Math.PI/2);
    const friction = 150 * (dir > 0 ? 1 : -1);
    
    // Add Degradation (Stiction Spike at start of movement)
    let degradation = 0;
    if (stroke < 5 && dir > 0) degradation = 300; // Breakout spike

    return {
        stroke: stroke,
        force: force + friction + degradation + Math.random() * 20,
        type: dir > 0 ? 'Extend' : 'Retract'
    };
});

// Seal Wear Radar
const SEAL_HEALTH_RADAR = [
    { subject: 'Abrasion', A: 85, fullMark: 100 },
    { subject: 'Extrusion', A: 92, fullMark: 100 },
    { subject: 'Thermal', A: 65, fullMark: 100 }, // High thermal degradation
    { subject: 'Chemical', A: 90, fullMark: 100 },
    { subject: 'Elasticity', A: 70, fullMark: 100 },
];

// Oil Particle Trend
const OIL_TREND = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    particles: 150 + i * 5 + Math.random() * 20,
    water: 40 + Math.sin(i*0.5) * 10
}));

export const GateHoistDegradationView: React.FC = () => {
  // --- STATE ---
  const [metrics, setMetrics] = useState({
      stroke: 0, // %
      pressureA: 12.5, // MPa
      pressureB: 0.5, // MPa
      temp: 45.2, // C
      rodScore: 15, // %
      sealWear: 35, // %
      leakage: 0.05, // L/min
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [cycleTime, setCycleTime] = useState(0);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
        let newStroke = metrics.stroke;
        let pA = 12.5;
        let temp = metrics.temp;

        if (isSimulating) {
            const t = Date.now() / 2000;
            const sine = Math.sin(t);
            newStroke = 50 + sine * 50;
            
            // Pressure spikes during direction change
            pA = 12.5 + Math.abs(sine) * 5 + (Math.abs(newStroke - 50) > 45 ? 2 : 0);
            
            // Temp rises with operation
            temp = Math.min(85, temp + 0.1);
        } else {
            // Cool down
            temp = Math.max(20, temp - 0.05);
        }

        setMetrics(prev => ({
            ...prev,
            stroke: newStroke,
            pressureA: pA + (Math.random()-0.5)*0.2,
            temp: temp,
            // Slow degradation simulation
            sealWear: Math.min(100, 35 + (temp > 60 ? (temp-60)/100 : 0)),
            leakage: 0.05 + (prev.sealWear/100) * 0.2
        }));

    }, 50);
    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#030712] text-slate-200 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-orange-900/40 pb-4 bg-gradient-to-r from-[#1c0a00] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 uppercase tracking-wider">
             <Activity size={14} className="animate-pulse" />
             Hydraulic Actuator Prognostics
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             弧形闸门启闭机构 <span className="text-orange-500">劣化趋势预测</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Seal RUL</div>
                <div className="text-3xl font-mono font-bold text-white">4,250 <span className="text-sm text-slate-500">cycles</span></div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Health Index</div>
                <div className="text-2xl font-mono font-bold text-yellow-400">82.5 <span className="text-sm text-slate-500">%</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Leakage Rate</div>
                <div className={`text-2xl font-mono font-bold ${metrics.leakage > 0.2 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {metrics.leakage.toFixed(3)} <span className="text-sm text-slate-500">L/min</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Sensor Telemetry */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Cylinder Status */}
           <SciFiCard title="液压缸实时监测" subtitle="TELEMETRY" className="border-orange-900/50 bg-[#0c0a09]/80">
               <div className="flex flex-col gap-4">
                   <div className="p-3 bg-slate-900/50 rounded border border-slate-800 relative overflow-hidden">
                       <div className="flex justify-between items-center mb-1 relative z-10">
                           <span className="text-xs text-slate-400 font-bold uppercase">Piston Stroke</span>
                           <span className="text-xl font-mono text-white">{metrics.stroke.toFixed(1)}%</span>
                       </div>
                       <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden relative z-10">
                           <div className="bg-orange-500 h-full transition-all duration-100" style={{width: `${metrics.stroke}%`}}></div>
                       </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                           <div className="text-[10px] text-slate-500 mb-1">Pressure A (Rod)</div>
                           <div className="text-lg font-mono text-white">{metrics.pressureA.toFixed(1)} <span className="text-xs">MPa</span></div>
                       </div>
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                           <div className="text-[10px] text-slate-500 mb-1">Pressure B (Cap)</div>
                           <div className="text-lg font-mono text-white">{metrics.pressureB.toFixed(1)} <span className="text-xs">MPa</span></div>
                       </div>
                   </div>

                   <div className="flex items-center justify-between p-3 bg-red-900/10 border border-red-900/30 rounded">
                       <div className="flex items-center gap-2">
                           <Thermometer size={18} className="text-red-400" />
                           <div>
                               <div className="text-xs text-red-300 font-bold">Gland Temp</div>
                               <div className="text-[10px] text-slate-400">Limit: 80°C</div>
                           </div>
                       </div>
                       <div className="text-xl font-mono font-bold text-white">{metrics.temp.toFixed(1)}°C</div>
                   </div>
               </div>
           </SciFiCard>

           {/* Seal Health Radar */}
           <SciFiCard title="密封失效模式分析" subtitle="SEAL HEALTH" className="flex-1 border-orange-900/50">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SEAL_HEALTH_RADAR}>
                           <PolarGrid stroke="#331c0a" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#fdba74', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Health" dataKey="A" stroke="#f97316" strokeWidth={2} fill="#f97316" fillOpacity={0.4} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316', color: '#fff'}} />
                       </RadarChart>
                   </ResponsiveContainer>
                   <div className="text-[10px] text-center text-slate-500 mt-2">
                       Significant thermal degradation detected.
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: Digital Twin & Simulation */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#050505] border border-orange-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(249,115,22,0.1)]">
               
               {/* Controls */}
               <div className="absolute top-4 left-4 z-10">
                   <div className="bg-black/60 backdrop-blur border border-orange-500/20 px-3 py-2 rounded flex items-center gap-4">
                       <button 
                         onClick={() => setIsSimulating(!isSimulating)}
                         className={`p-2 rounded-full transition-colors ${isSimulating ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}
                       >
                           {isSimulating ? <StopCircle size={20} /> : <PlayCircle size={20} />}
                       </button>
                       <div>
                           <div className="text-[10px] text-slate-400 font-bold uppercase">Test Cycle</div>
                           <div className="text-xs text-white">{isSimulating ? 'Running...' : 'Idle'}</div>
                       </div>
                   </div>
               </div>

               {/* Right HUD */}
               <div className="absolute top-4 right-4 z-10 space-y-2 text-right">
                   <div className="bg-black/60 backdrop-blur px-3 py-2 rounded border border-orange-500/20">
                       <div className="text-[10px] text-slate-400 uppercase mb-1">Rod Condition</div>
                       <div className="text-xl font-bold text-white font-mono">{metrics.rodScore < 20 ? 'GOOD' : 'SCORING'}</div>
                       <div className="text-[9px] text-slate-500">Roughness: {(0.1 + metrics.rodScore/100).toFixed(2)} Ra</div>
                   </div>
               </div>

               {/* Leak Alert */}
               {metrics.leakage > 0.1 && (
                   <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                       <div className="flex items-center gap-2 bg-red-900/80 px-4 py-2 rounded-full border border-red-500 text-white animate-pulse">
                           <Droplets size={16} /> 
                           <span className="text-xs font-bold">EXTERNAL LEAK DETECTED</span>
                       </div>
                   </div>
               )}

               <GateHoistScene 
                   extension={metrics.stroke}
                   pressureHead={metrics.pressureB}
                   pressureRod={metrics.pressureA}
                   sealWear={metrics.sealWear}
                   rodScore={metrics.rodScore}
                   temperature={metrics.temp}
                   isMoving={isSimulating}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Friction Hysteresis Chart */}
           <SciFiCard title="摩擦力迟滞环 (Friction Hysteresis)" subtitle="FINGERPRINT" className="h-[280px] border-orange-900/50" noPadding>
               <div className="w-full h-full p-4 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 0}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" />
                           <XAxis type="number" dataKey="stroke" name="Stroke" unit="%" stroke="#7c2d12" domain={[0, 100]} label={{ value: 'Stroke (%)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#7c2d12' }} />
                           <YAxis type="number" dataKey="force" name="Force" unit="kN" stroke="#7c2d12" label={{ value: 'Cylinder Force (kN)', angle: -90, position: 'insideLeft', fill: '#7c2d12', fontSize: 10 }} />
                           <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316', color: '#fff'}} />
                           
                           <Scatter name="Cycle" data={HYSTERESIS_LOOP} fill="#f97316" line={{stroke: '#f97316', strokeWidth: 1}} shape="circle" />
                       </ScatterChart>
                   </ResponsiveContainer>
                   <div className="absolute top-4 left-16 bg-black/50 p-2 rounded border border-slate-800 text-[10px] text-slate-400">
                       <span className="text-red-400 font-bold block">Abnormal Breakout Force</span>
                       Detected at 0-5% stroke (Stiction).
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Oil Analysis & Maintenance */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Oil Contamination Trend */}
           <SciFiCard title="液压油污染度趋势" subtitle="NAS CLASS" className="flex-1 border-orange-900/50">
               <div className="h-full w-full flex flex-col">
                   <div className="flex-1 min-h-[150px]">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={OIL_TREND}>
                               <defs>
                                   <linearGradient id="colorOil" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                               <XAxis dataKey="time" hide />
                               <YAxis stroke="#7c2d12" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316'}} />
                               <Area type="monotone" dataKey="particles" stroke="#f97316" fill="url(#colorOil)" strokeWidth={2} name="Particles" />
                               <Line type="monotone" dataKey="water" stroke="#0ea5e9" strokeWidth={1} dot={false} name="Water ppm" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="p-3 bg-orange-900/10 border border-orange-900/30 rounded mt-2">
                       <div className="flex justify-between items-center text-xs text-orange-200 mb-1">
                           <span>Contamination Level</span>
                           <span className="font-bold">NAS 9 (High)</span>
                       </div>
                       <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                           <div className="bg-red-500 h-full" style={{width: '85%'}}></div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Maintenance Action */}
           <SciFiCard title="预测性维护建议" className="border-orange-900/50">
               <div className="space-y-3">
                   <div className="flex items-start gap-2 text-xs text-slate-300">
                       <AlertTriangle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                       <span>Rod seal leakage rate increasing. Piston rod surface scoring detected.</span>
                   </div>
                   <div className="flex items-start gap-2 text-xs text-slate-300">
                       <TrendingUp size={14} className="text-red-400 shrink-0 mt-0.5" />
                       <span>Recommend seal kit replacement within 3 months.</span>
                   </div>
               </div>
               
               <button className="w-full mt-4 py-2 bg-orange-700/30 hover:bg-orange-600/50 border border-orange-500/50 rounded text-xs text-orange-100 transition-colors flex items-center justify-center gap-2">
                   <GitCommit size={12} /> Schedule Seal Replacement
               </button>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
