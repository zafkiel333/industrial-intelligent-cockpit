
import React, { useState, useEffect } from 'react';
import { BreakerScene } from '../../../components/predictive/hydro-breaker/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-21]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-21';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Cell, Legend, LineChart
} from 'recharts';
import { 
  Zap, Activity, Timer, Settings, 
  RotateCw, RefreshCcw, AlertTriangle, 
  Play, ShieldCheck, Fingerprint, 
  TrendingUp, GitMerge, AlertOctagon
} from 'lucide-react';

// --- Mock Data ---

// Coil Current & Travel Curve (The Mechanical Fingerprint)
// Ideal vs Actual
const SIGNATURE_DATA = Array.from({length: 100}, (_, i) => {
    const t = i; // ms
    
    // Coil Current: Rise -> Plunger Move (Dip) -> Rise -> Saturation -> Cutoff
    const coilIdeal = t < 10 ? t * 0.5 : t < 30 ? 5 - (t-10)*0.05 : t < 60 ? 4 + (t-30)*0.15 : t < 80 ? 8.5 : 0;
    
    // Actual (Degraded): Slower plunger (friction), higher current
    const coilActual = t < 12 ? t * 0.48 : t < 35 ? 5.2 - (t-12)*0.03 : t < 65 ? 4.8 + (t-35)*0.15 : t < 85 ? 9.0 : 0;

    // Travel (S-Curve)
    // 0 = Open, 100 = Closed
    // Closing operation simulation
    let travelIdeal = 0;
    if (t > 30 && t < 70) {
        const p = (t - 30) / 40;
        travelIdeal = 100 / (1 + Math.exp(-10 * (p - 0.5)));
    } else if (t >= 70) travelIdeal = 100;

    // Actual Travel: Slower, maybe rebound
    let travelActual = 0;
    if (t > 35 && t < 75) {
        const p = (t - 35) / 40;
        travelActual = 100 / (1 + Math.exp(-10 * (p - 0.5)));
    } else if (t >= 75) {
        // Rebound effect
        travelActual = 100 - 5 * Math.exp(-(t-75)/5) * Math.cos((t-75)*0.5); 
    }

    return { 
        time: t, 
        coilRef: Math.max(0, coilIdeal), 
        coilAct: Math.max(0, coilActual),
        travelRef: travelIdeal,
        travelAct: Math.max(0, travelActual)
    };
});

// Mechanical Fingerprint Radar
const MECH_FINGERPRINT = [
    { subject: '分闸时间', A: 85, fullMark: 100 },
    { subject: '合闸时间', A: 88, fullMark: 100 },
    { subject: '刚分速度', A: 75, fullMark: 100 }, // Degraded
    { subject: '刚合速度', A: 80, fullMark: 100 },
    { subject: '超行程', A: 95, fullMark: 100 },
    { subject: '线圈电流', A: 82, fullMark: 100 },
];

// Motor Charge Current
const MOTOR_DATA = Array.from({length: 50}, (_, i) => ({
    time: i,
    current: i > 5 && i < 40 ? 12 + Math.random() * 2 : 0
}));

export const BreakerMechanicalView: React.FC = () => {
  // --- STATE ---
  const [breakerState, setBreakerState] = useState<'closed' | 'open' | 'opening' | 'closing'>('open');
  const [travel, setTravel] = useState(0); // 0 = Open
  const [springState, setSpringState] = useState(100); // % Charged
  const [simulationStep, setSimulationStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Metrics
  const [closeTime, setCloseTime] = useState(42.5); // ms
  const [velocity, setVelocity] = useState(3.2); // m/s
  const [coilPeak, setCoilPeak] = useState(9.0); // A

  // Simulation Logic
  useEffect(() => {
    let interval: any;
    if (isSimulating) {
        interval = setInterval(() => {
            setSimulationStep(prev => {
                if (prev >= 100) {
                    setIsSimulating(false);
                    // Finalize state
                    if (breakerState === 'closing') setBreakerState('closed');
                    if (breakerState === 'opening') setBreakerState('open');
                    return 0;
                }
                return prev + 2;
            });
        }, 20);
    }
    return () => clearInterval(interval);
  }, [isSimulating, breakerState]);

  // Sync Animation
  useEffect(() => {
      if (!isSimulating) return;
      const t = simulationStep;
      
      if (breakerState === 'closing') {
          // Travel 0 -> 100
          if (t > 30 && t < 70) {
              const p = (t - 30) / 40;
              setTravel(100 / (1 + Math.exp(-10 * (p - 0.5))));
          } else if (t >= 70) {
              setTravel(100);
          }
          // Spring Discharge
          if (t < 50) setSpringState(Math.max(0, 100 - t * 2));
      } 
      else if (breakerState === 'opening') {
          // Travel 100 -> 0 (Faster trip)
          if (t > 20 && t < 50) {
              const p = (t - 20) / 30;
              setTravel(100 - (100 / (1 + Math.exp(-10 * (p - 0.5)))));
          } else if (t >= 50) {
              setTravel(0);
          }
      }
  }, [simulationStep, isSimulating, breakerState]);

  const handleOperation = (op: 'open' | 'close') => {
      if (isSimulating) return;
      if (op === 'close' && breakerState === 'closed') return;
      if (op === 'open' && breakerState === 'open') return;
      
      setBreakerState(op === 'close' ? 'closing' : 'opening');
      setIsSimulating(true);
      setSimulationStep(0);
  };

  const chargeSpring = () => {
      setSpringState(100);
  };

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020408] text-slate-200 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-cyan-900/40 pb-4 bg-gradient-to-r from-[#082f49] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Fingerprint size={14} className="animate-pulse" />
             Mechanical Characteristic Fingerprint
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             断路器机械特性 <span className="text-cyan-500">劣化趋势预测</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Mechanical Health</div>
                <div className="text-3xl font-mono font-bold text-yellow-400">86.5 <span className="text-sm text-slate-500">/ 100</span></div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Closing Time</div>
                <div className="text-2xl font-mono font-bold text-white">{closeTime} <span className="text-sm text-slate-500">ms</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Contact Speed</div>
                <div className="text-2xl font-mono font-bold text-red-400">{velocity} <span className="text-sm text-slate-500">m/s</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Controls & Radar */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Operations Panel */}
           <SciFiCard title="机械操作台 (Control)" subtitle="SIMULATION" className="border-cyan-900/50 bg-[#061018]/80">
               <div className="flex flex-col gap-4">
                   <div className="grid grid-cols-2 gap-3">
                       <button 
                         onClick={() => handleOperation('close')}
                         disabled={breakerState === 'closed' || isSimulating || springState < 100}
                         className={`py-4 rounded border font-bold flex flex-col items-center gap-1 transition-all
                            ${breakerState === 'closed' ? 'bg-red-900/20 border-red-900 text-red-500 opacity-50' : 'bg-green-600/20 border-green-500 text-green-400 hover:bg-green-600/40'}
                         `}
                       >
                           <Zap size={20} /> 合闸 (CLOSE)
                       </button>
                       <button 
                         onClick={() => handleOperation('open')}
                         disabled={breakerState === 'open' || isSimulating}
                         className={`py-4 rounded border font-bold flex flex-col items-center gap-1 transition-all
                            ${breakerState === 'open' ? 'bg-green-900/20 border-green-900 text-green-500 opacity-50' : 'bg-red-600/20 border-red-500 text-red-400 hover:bg-red-600/40'}
                         `}
                       >
                           <Activity size={20} /> 分闸 (OPEN)
                       </button>
                   </div>

                   {/* Spring Status */}
                   <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                       <div className="flex justify-between text-xs mb-1">
                           <span className="text-slate-400">Spring Energy</span>
                           <span className={springState < 100 ? 'text-yellow-400' : 'text-green-400'}>{springState.toFixed(0)}%</span>
                       </div>
                       <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                           <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-300" style={{width: `${springState}%`}}></div>
                       </div>
                       {springState < 100 && (
                           <button 
                             onClick={chargeSpring}
                             className="w-full py-1 text-[10px] border border-dashed border-slate-600 text-slate-400 hover:text-white rounded flex items-center justify-center gap-2"
                           >
                               <RefreshCcw size={10} className="animate-spin" /> Recharging...
                           </button>
                       )}
                   </div>
               </div>
           </SciFiCard>

           {/* Mechanical Fingerprint Radar */}
           <SciFiCard title="机械特性指纹" subtitle="RADAR" className="flex-1 border-cyan-900/50">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={MECH_FINGERPRINT}>
                           <PolarGrid stroke="#1e293b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Status" dataKey="A" stroke="#22d3ee" strokeWidth={2} fill="#22d3ee" fillOpacity={0.4} />
                           <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#22d3ee'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: Digital Twin & Curves */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#020204] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(34,211,238,0.1)]">
               
               {/* State Badge */}
               <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                   <div className={`px-6 py-1.5 rounded-full border backdrop-blur font-bold text-sm flex items-center gap-3 shadow-lg
                       ${breakerState === 'closed' ? 'bg-red-900/60 border-red-500 text-red-100' : 'bg-green-900/60 border-green-500 text-green-100'}
                   `}>
                       <div className={`w-2 h-2 rounded-full ${breakerState === 'closed' ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                       {breakerState.toUpperCase()}
                   </div>
               </div>

               {/* Right Stats */}
               <div className="absolute top-4 right-4 z-10 text-right space-y-1 pointer-events-none">
                   <div className="text-[10px] text-slate-500 uppercase">Contact Stroke</div>
                   <div className="text-xl font-mono text-white">{travel.toFixed(1)} <span className="text-xs">mm</span></div>
                   
                   <div className="text-[10px] text-slate-500 uppercase mt-2">Simulation Time</div>
                   <div className="text-xl font-mono text-cyan-400">{simulationStep} <span className="text-xs">ms</span></div>
               </div>

               <BreakerScene 
                   breakerState={breakerState}
                   travelPosition={travel}
                   arcIntensity={travel > 10 && travel < 90 && isSimulating ? 1.0 : 0}
                   springCompression={springState}
                   mechanismVibration={isSimulating ? 1.0 : 0}
                   showInternal={true}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Coil & Travel Curve Chart */}
           <SciFiCard title="分合闸线圈电流与行程曲线 (Coil & Travel)" subtitle="SIGNATURE" className="h-[300px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={SIGNATURE_DATA}>
                           <defs>
                               <linearGradient id="coilFill" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Time (ms)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                           
                           {/* Left Y: Current */}
                           <YAxis yAxisId="left" stroke="#f59e0b" tick={{fontSize: 10}} label={{ value: 'Current (A)', angle: -90, position: 'insideLeft', fill: '#f59e0b', fontSize: 10 }} domain={[0, 10]} />
                           
                           {/* Right Y: Travel */}
                           <YAxis yAxisId="right" orientation="right" stroke="#22d3ee" tick={{fontSize: 10}} label={{ value: 'Travel (mm)', angle: 90, position: 'insideRight', fill: '#22d3ee', fontSize: 10 }} domain={[0, 110]} />
                           
                           <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#22d3ee', color: '#fff'}} />
                           <Legend wrapperStyle={{fontSize:'10px'}} />

                           {/* Reference Areas/Lines */}
                           <ReferenceLine yAxisId="left" y={5} stroke="#333" strokeDasharray="3 3" />

                           {/* Current Curves */}
                           <Area yAxisId="left" type="monotone" dataKey="coilAct" stroke="#f59e0b" fill="url(#coilFill)" name="Coil Current (Act)" strokeWidth={2} />
                           <Line yAxisId="left" type="monotone" dataKey="coilRef" stroke="#78350f" strokeDasharray="5 5" dot={false} name="Reference" />
                           
                           {/* Travel Curves */}
                           <Line yAxisId="right" type="monotone" dataKey="travelAct" stroke="#22d3ee" strokeWidth={2} dot={false} name="Travel (Act)" />
                           <Line yAxisId="right" type="monotone" dataKey="travelRef" stroke="#0e7490" strokeDasharray="5 5" dot={false} name="Reference" />
                           
                           {/* Simulation Cursor */}
                           {isSimulating && <ReferenceLine x={simulationStep} stroke="#fff" />}
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Diagnostics & Motor */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Diagnostics */}
           <SciFiCard title="智能诊断结论" className="border-cyan-900/50">
               <div className="flex flex-col gap-3">
                   <div className="p-3 bg-red-900/10 border border-red-900/30 rounded">
                       <div className="flex items-center gap-2 text-xs font-bold text-red-400 mb-1">
                           <AlertOctagon size={14} /> Anomaly Detected
                       </div>
                       <p className="text-[10px] text-slate-300 leading-relaxed">
                           Coil current waveform shows delayed plunger movement (t1 &gt; 12ms). Indicates increased friction in the latch mechanism.
                       </p>
                   </div>
                   
                   <div className="flex justify-between items-center text-xs p-2 bg-slate-900/50 rounded border border-slate-800">
                       <span className="text-slate-400">Plunger Speed</span>
                       <span className="text-yellow-400 font-mono">0.8 m/s (Low)</span>
                   </div>
                   <div className="flex justify-between items-center text-xs p-2 bg-slate-900/50 rounded border border-slate-800">
                       <span className="text-slate-400">Coil Resistance</span>
                       <span className="text-white font-mono">12.5 Ω (Normal)</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Motor Current */}
           <SciFiCard title="储能电机电流监测" subtitle="CHARGE CYCLE" className="flex-1 border-cyan-900/50">
               <div className="h-full w-full flex flex-col">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={MOTOR_DATA}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="time" hide />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 15]} />
                               <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#22d3ee'}} />
                               <Line type="step" dataKey="current" stroke="#a855f7" strokeWidth={2} dot={false} />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="text-[10px] text-slate-500 text-center mt-2">
                       Max Current: <span className="text-purple-400 font-bold">13.2 A</span> | Charge Time: <span className="text-white font-bold">12s</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Action */}
           <button className="w-full py-2 bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-500/50 rounded text-xs text-cyan-200 transition-colors flex items-center justify-center gap-2">
               <ShieldCheck size={14} /> Schedule Mechanism Lube
           </button>

        </div>

      </div>
    </div>
  );
};
