
import React, { useState, useEffect } from 'react';
import { GovernorHydraulicScene } from '../../../components/predictive/hydro-governor/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-10]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-10';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, Cell
} from 'recharts';
import { 
  Activity, Gauge, Zap, Settings, AlertTriangle, 
  Droplets, Thermometer, TrendingUp, CheckCircle2, 
  RotateCw, RefreshCw, Power
} from 'lucide-react';

// --- Mock Data ---

const PRESSURE_BUILDUP_DATA = Array.from({length: 40}, (_, i) => ({
    time: i,
    pressure: i < 10 ? 3.8 : i < 30 ? 3.8 + (i-10)*0.01 : 4.0 + Math.exp(-(i-30)), // Pump cycle sim
    limit: 4.2
}));

const SERVO_STEP_DATA = Array.from({length: 50}, (_, i) => {
    // Step response simulation
    const t = i;
    const setpoint = t > 10 ? 60 : 20;
    // Overdamped response
    const actual = t > 10 ? 20 + (60-20)*(1 - Math.exp(-(t-10)/5)) : 20;
    return { time: t, setpoint, actual };
});

const OIL_QUALITY_TREND = Array.from({length: 12}, (_, i) => ({
    month: `M${i+1}`,
    nas: 5 + Math.floor(i/4), // NAS Class increasing (degrading)
    water: 50 + i * 2 // ppm
}));

export const GovernorHealthView: React.FC = () => {
  // --- STATE ---
  const [metrics, setMetrics] = useState({
    pressure: 4.05, // MPa
    tankLevel: 65, // %
    temp: 42.5, // C
    accuPressure: 3.9, // MPa
    accuLevel: 55, // % (Oil level)
    pumpA: 'running' as 'running' | 'standby' | 'fault',
    pumpB: 'standby' as 'running' | 'standby' | 'fault',
    servoPos: 45, // %
    nitrogenPurity: 99.9, // %
    oilNas: 6,
  });

  const [healthScore, setHealthScore] = useState(94.2);
  
  // Logic Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const t = Date.now() / 1000;
      
      // Simulate Pump Cycle Logic
      // Pressure drops slowly due to leakage/servo use, then pump kicks in
      setMetrics(prev => {
          let newP = prev.pressure;
          let pA = prev.pumpA;
          
          if (prev.pumpA === 'running') {
              newP += 0.05; // Build pressure
              if (newP > 4.2) { newP = 4.2; pA = 'standby'; } // Cut out
          } else {
              newP -= 0.01; // Leakage / Consumption
              if (newP < 3.8) { pA = 'running'; } // Cut in
          }

          // Randomize Servo Movement
          const targetServo = 45 + Math.sin(t * 0.5) * 20;
          const newServo = prev.servoPos + (targetServo - prev.servoPos) * 0.1;

          return {
              ...prev,
              pressure: newP,
              pumpA: pA,
              tankLevel: 65 - Math.sin(t*0.1)*2, // Inverse to accumulator roughly
              accuLevel: 55 + (newP - 4.0) * 10, // Pressure proportional to level
              temp: 42.5 + Math.sin(t*0.05) * 0.5,
              servoPos: newServo
          };
      });

    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020610] text-cyan-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-cyan-800/40 pb-4 bg-gradient-to-r from-cyan-950/20 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Settings size={14} className="animate-spin-slow" />
             Hydraulic Control Unit (HCU)
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             调速器液压系统 <span className="text-cyan-500">健康状态评估</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">System Health</div>
                <div className="text-3xl font-mono font-bold text-green-400">{healthScore.toFixed(1)} <span className="text-sm text-slate-500">%</span></div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Work Capacity</div>
                <div className="text-2xl font-mono font-bold text-white">42,500 <span className="text-sm text-slate-500">N·m</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Oil Cleanliness</div>
                <div className="text-2xl font-mono font-bold text-yellow-400">NAS {metrics.oilNas}</div>
            </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Input / Source Metrics */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Oil Tank Stats */}
           <SciFiCard title="集油槽状态 (Sump)" subtitle="SOURCE" className="border-cyan-900/50 bg-[#050a14]/80">
               <div className="flex flex-col gap-4 py-2">
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                           <Droplets size={20} className="text-cyan-500" />
                           <div>
                               <div className="text-xs text-slate-400">OIL LEVEL</div>
                               <div className="text-xl font-bold text-white font-mono">{metrics.tankLevel.toFixed(1)} %</div>
                           </div>
                       </div>
                       <div className="h-10 w-2 bg-slate-800 rounded-full overflow-hidden flex flex-col justify-end">
                           <div className="bg-cyan-500 w-full transition-all duration-500" style={{height: `${metrics.tankLevel}%`}}></div>
                       </div>
                   </div>

                   <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                       <div className="flex items-center gap-3">
                           <Thermometer size={20} className="text-orange-500" />
                           <div>
                               <div className="text-xs text-slate-400">TEMPERATURE</div>
                               <div className="text-xl font-bold text-white font-mono">{metrics.temp.toFixed(1)} °C</div>
                           </div>
                       </div>
                       <div className="text-[10px] text-slate-500 text-right">
                           Cooler: <span className="text-green-400">AUTO</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Pump Cluster */}
           <SciFiCard title="油泵运行监测" subtitle="PUMPS" className="flex-1 border-cyan-900/50">
               <div className="flex flex-col gap-3">
                   {/* Pump A */}
                   <div className={`p-3 rounded border flex justify-between items-center transition-all ${metrics.pumpA === 'running' ? 'bg-cyan-950/30 border-cyan-500 shadow-[inset_0_0_10px_rgba(6,182,212,0.2)]' : 'bg-slate-900/30 border-slate-800'}`}>
                       <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-full ${metrics.pumpA === 'running' ? 'bg-cyan-500 text-black animate-spin' : 'bg-slate-700 text-slate-400'}`}>
                               <RotateCw size={16} />
                           </div>
                           <div>
                               <div className="text-sm font-bold text-white">Main Pump #1</div>
                               <div className="text-[10px] text-slate-400">{metrics.pumpA === 'running' ? 'Load: 24A' : 'Ready'}</div>
                           </div>
                       </div>
                       <div className={`text-xs font-bold uppercase px-2 py-1 rounded ${metrics.pumpA === 'running' ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                           {metrics.pumpA}
                       </div>
                   </div>

                   {/* Pump B */}
                   <div className={`p-3 rounded border flex justify-between items-center transition-all ${metrics.pumpB === 'running' ? 'bg-cyan-950/30 border-cyan-500 shadow-[inset_0_0_10px_rgba(6,182,212,0.2)]' : 'bg-slate-900/30 border-slate-800'}`}>
                       <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-full ${metrics.pumpB === 'running' ? 'bg-cyan-500 text-black animate-spin' : 'bg-slate-700 text-slate-400'}`}>
                               <RotateCw size={16} />
                           </div>
                           <div>
                               <div className="text-sm font-bold text-white">Main Pump #2</div>
                               <div className="text-[10px] text-slate-400">{metrics.pumpB === 'running' ? 'Load: 25A' : 'Standby'}</div>
                           </div>
                       </div>
                       <div className={`text-xs font-bold uppercase px-2 py-1 rounded ${metrics.pumpB === 'running' ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                           {metrics.pumpB}
                       </div>
                   </div>

                   {/* Logic Check */}
                   <div className="mt-2 p-2 bg-slate-900/50 border border-slate-700 rounded text-xs text-slate-400 flex justify-between">
                       <span>Switch Logic:</span>
                       <span className="text-green-400 font-mono">P_Low &lt; 3.8MPa</span>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Twin & Control Logic */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#020305] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(6,182,212,0.1)]">
               
               {/* HUD Overlay - Main Pressure */}
               <div className="absolute top-4 left-4 z-10 p-3 bg-black/70 backdrop-blur rounded border border-cyan-500/30 flex flex-col items-start gap-1">
                   <div className="text-[10px] text-cyan-400 font-bold uppercase flex items-center gap-2">
                       <Gauge size={12} /> System Pressure
                   </div>
                   <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-mono font-bold text-white tracking-tighter">{metrics.pressure.toFixed(2)}</span>
                       <span className="text-xs text-slate-400">MPa</span>
                   </div>
                   {/* Range Bar */}
                   <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-1 relative overflow-hidden">
                       <div className="absolute left-[80%] top-0 h-full w-0.5 bg-red-500 z-20" title="Relief 4.2"></div>
                       <div className="absolute left-[60%] top-0 h-full w-0.5 bg-green-500 z-20" title="Start 3.8"></div>
                       <div className="h-full bg-cyan-500 transition-all duration-300" style={{width: `${(metrics.pressure/5)*100}%`}}></div>
                   </div>
               </div>

               {/* Servo Position Indicator */}
               <div className="absolute bottom-4 right-4 z-10 p-2 bg-black/60 backdrop-blur rounded border border-slate-700 text-right">
                   <div className="text-[10px] text-slate-400 uppercase mb-1">Guide Vane Opening</div>
                   <div className="text-2xl font-mono font-bold text-yellow-400">{metrics.servoPos.toFixed(1)} %</div>
               </div>

               <GovernorHydraulicScene 
                   systemPressure={metrics.pressure}
                   tankLevel={metrics.tankLevel}
                   oilTemp={metrics.temp}
                   pumpA_State={metrics.pumpA}
                   pumpB_State={metrics.pumpB}
                   accumulatorLevel={metrics.accuLevel}
                   servoPosition={metrics.servoPos}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Pump Performance Curve */}
           <SciFiCard title="打压过程压力曲线" subtitle="CYCLE ANALYSIS" className="h-[250px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={PRESSURE_BUILDUP_DATA}>
                           <defs>
                               <linearGradient id="colorPress" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" hide />
                           <YAxis domain={[3.5, 4.5]} stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'MPa', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                           <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#0ea5e9', color: '#fff'}} />
                           <ReferenceLine y={3.8} stroke="green" strokeDasharray="3 3" label={{value: 'ON', fill: 'green', fontSize: 10}} />
                           <ReferenceLine y={4.2} stroke="red" strokeDasharray="3 3" label={{value: 'OFF', fill: 'red', fontSize: 10}} />
                           <Area type="monotone" dataKey="pressure" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorPress)" isAnimationActive={false} />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Accumulator & Servo Analysis */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Accumulator Health */}
           <SciFiCard title="蓄能器组状态" subtitle="ACCUMULATOR" className="border-cyan-900/50">
               <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-4">
                       <div className="relative w-16 h-24 bg-slate-800 rounded border border-slate-600 flex flex-col justify-end overflow-hidden">
                           {/* Gas */}
                           <div className="w-full bg-red-900/50 flex items-center justify-center text-[8px] text-red-300" style={{height: `${100-metrics.accuLevel}%`}}>N₂</div>
                           {/* Oil */}
                           <div className="w-full bg-cyan-600 flex items-center justify-center text-[8px] text-cyan-100 transition-all duration-500" style={{height: `${metrics.accuLevel}%`}}>Oil</div>
                           {/* Piston Line */}
                           <div className="absolute w-full h-1 bg-white opacity-50" style={{bottom: `${metrics.accuLevel}%`}}></div>
                       </div>
                       
                       <div className="flex-1 space-y-3">
                           <div>
                               <div className="text-xs text-slate-400">Gas Pressure</div>
                               <div className="text-lg font-bold text-white">{metrics.accuPressure.toFixed(2)} <span className="text-xs font-normal text-slate-500">MPa</span></div>
                           </div>
                           <div>
                               <div className="text-xs text-slate-400">Oil/Gas Ratio</div>
                               <div className="text-lg font-bold text-cyan-400">1.25</div>
                           </div>
                       </div>
                   </div>

                   <div className="p-2 bg-red-900/10 border border-red-900/30 rounded text-xs text-red-300 flex items-center gap-2">
                       <AlertTriangle size={12} />
                       <span>Prediction: N₂ Leakage Risk +2%</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Servo Response Analysis */}
           <SciFiCard title="接力器响应特性 (PID)" subtitle="SERVO" className="flex-1 border-cyan-900/50">
               <div className="h-32 w-full mb-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={SERVO_STEP_DATA}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                           <XAxis dataKey="time" hide />
                           <YAxis hide domain={[0, 100]} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                           <Line type="step" dataKey="setpoint" stroke="#64748b" strokeDasharray="3 3" dot={false} strokeWidth={1} />
                           <Line type="monotone" dataKey="actual" stroke="#f59e0b" strokeWidth={2} dot={false} />
                       </LineChart>
                   </ResponsiveContainer>
               </div>
               
               <div className="grid grid-cols-2 gap-2 text-xs">
                   <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                       <div className="text-slate-500">Dead Time</div>
                       <div className="text-white font-mono">0.15 s</div>
                   </div>
                   <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                       <div className="text-slate-500">Hysteresis</div>
                       <div className="text-white font-mono">0.05 %</div>
                   </div>
               </div>
           </SciFiCard>

           {/* Oil Quality Trend */}
           <SciFiCard title="油质劣化趋势" className="h-[180px] border-cyan-900/50">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={OIL_QUALITY_TREND} margin={{top: 10, right: 0, bottom: 0, left: -20}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 9}} />
                           <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                           <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#000', borderColor: '#facc15'}} />
                           <Bar dataKey="nas" fill="#facc15" barSize={10} radius={[2,2,0,0]} name="NAS Grade" />
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
