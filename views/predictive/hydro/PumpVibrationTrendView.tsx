
import React, { useState, useEffect } from 'react';
import { PumpVibrationScene } from '../../../components/predictive/hydro-pump-vibration/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-11]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-11';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter, ComposedChart, Legend
} from 'recharts';
import { 
  Activity, Gauge, Zap, AlertTriangle, 
  RotateCw, Thermometer, Droplets, Waves, 
  TrendingUp, GitCommit, Search, CheckSquare
} from 'lucide-react';

// --- Mock Data ---

const TREND_HISTORY = Array.from({length: 48}, (_, i) => {
    const t = i;
    // Correlated vibration and pressure
    const press = 4.0 + Math.sin(t*0.2) * 0.2 + (Math.random()-0.5)*0.05;
    const vib = 1.2 + (press - 4.0)*2 + Math.random()*0.2; // Vib correlates with pressure fluctuation
    
    // Prediction data (last 12 points)
    const isPred = i > 36;
    const pPress = isPred ? press + (i-36)*0.02 : null;
    const pVib = isPred ? vib + (i-36)*0.1 : null;

    return {
        time: `${i}:00`,
        press: isPred ? null : press,
        vib: isPred ? null : vib,
        pPress,
        pVib
    };
});

const SPECTRUM_DATA = [
    { freq: '0.5X', val: 0.2 },
    { freq: '1X', val: 2.5 }, // Rotation speed
    { freq: '2X', val: 0.8 }, // Misalignment
    { freq: '3X', val: 0.3 },
    { freq: 'BPF', val: 1.5 }, // Blade Pass Frequency (Gear meshing)
    { freq: '2xBPF', val: 0.5 },
];

const ORBIT_DATA = Array.from({length: 50}, (_, i) => {
    const rad = i * (Math.PI * 2 / 50);
    return {
        x: Math.cos(rad) * 1.5 + Math.random()*0.1,
        y: Math.sin(rad) * 1.2 + Math.random()*0.1
    };
});

export const PumpVibrationTrendView: React.FC = () => {
  // --- STATE ---
  const [activePump, setActivePump] = useState<'P1'|'P2'>('P1');
  const [metrics, setMetrics] = useState({
      rpm: 1450,
      pressure: 4.05, // MPa
      vibration: 1.8, // mm/s
      temp: 52.5, // C
      flow: 180, // L/min
      cavitation: false
  });

  const [alerts, setAlerts] = useState<string[]>([]);

  // Simulation
  useEffect(() => {
      const interval = setInterval(() => {
          const t = Date.now() / 1000;
          
          setMetrics(prev => {
              const noise = (Math.random() - 0.5);
              const p = 4.0 + Math.sin(t*0.5)*0.2 + noise*0.05;
              const v = 1.8 + Math.abs(noise)*0.2 + (p > 4.2 ? 0.5 : 0);
              const cav = p < 3.8 || noise > 0.4; // Cavitation condition

              // Update alerts based on conditions
              const newAlerts = [];
              if (cav) newAlerts.push("Cavitation Inception Detected");
              if (v > 2.5) newAlerts.push("Vibration High Warning");
              if (prev.temp > 60) newAlerts.push("Oil Temp High");
              if (newAlerts.length === 0 && Math.random() > 0.95) setAlerts([]); // Clear sometimes
              if (newAlerts.length > 0) setAlerts(newAlerts);

              return {
                  rpm: 1450 + noise * 5,
                  pressure: p,
                  vibration: v,
                  temp: 52.5 + Math.sin(t*0.1)*0.5,
                  flow: 180 + noise * 2,
                  cavitation: cav
              };
          });
      }, 500);
      return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#080202] text-red-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-red-900/40 pb-4 bg-gradient-to-r from-red-950/20 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-400 mb-1 uppercase tracking-wider">
             <Activity size={14} className="animate-pulse" />
             Hydraulic Governor Diagnostics
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             调速系统油泵 <span className="text-red-500">振动与压力趋势预测</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Discharge Pressure</div>
                <div className="text-3xl font-mono font-bold text-white">{metrics.pressure.toFixed(2)} <span className="text-sm text-slate-500">MPa</span></div>
            </div>
            <div className="h-8 w-[1px] bg-red-900/50"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Vibration (RMS)</div>
                <div className={`text-3xl font-mono font-bold ${metrics.vibration > 2.0 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {metrics.vibration.toFixed(2)} <span className="text-sm text-slate-500">mm/s</span>
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-red-900/50 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Pump Efficiency</div>
                <div className="text-2xl font-mono font-bold text-yellow-400">88.5%</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Status & Spectrum */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Pump Selector */}
           <SciFiCard title="油泵机组状态" subtitle="ACTIVE UNIT" className="border-red-900/50 bg-[#100505]/80">
               <div className="grid grid-cols-2 gap-3">
                   <div 
                     onClick={() => setActivePump('P1')}
                     className={`p-3 rounded border cursor-pointer transition-all ${activePump === 'P1' ? 'bg-red-900/30 border-red-500' : 'bg-slate-900/30 border-slate-800'}`}
                   >
                       <div className="flex justify-between items-center mb-2">
                           <span className="font-bold text-sm text-white">Main Pump #1</span>
                           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                       </div>
                       <div className="text-xs text-slate-400">Run: 1240h</div>
                   </div>
                   
                   <div 
                     onClick={() => setActivePump('P2')}
                     className={`p-3 rounded border cursor-pointer transition-all ${activePump === 'P2' ? 'bg-red-900/30 border-red-500' : 'bg-slate-900/30 border-slate-800'}`}
                   >
                       <div className="flex justify-between items-center mb-2">
                           <span className="font-bold text-sm text-slate-300">Main Pump #2</span>
                           <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                       </div>
                       <div className="text-xs text-slate-500">Standby</div>
                   </div>
               </div>

               <div className="mt-4 space-y-3">
                   <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-2 text-xs text-slate-400">
                           <RotateCw size={14} className="text-red-400"/> Speed
                       </div>
                       <span className="font-mono text-white">{metrics.rpm.toFixed(0)} RPM</span>
                   </div>
                   <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-2 text-xs text-slate-400">
                           <Thermometer size={14} className="text-orange-400"/> Oil Temp
                       </div>
                       <span className="font-mono text-white">{metrics.temp.toFixed(1)} °C</span>
                   </div>
                   <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-2 text-xs text-slate-400">
                           <Droplets size={14} className="text-blue-400"/> Flow Rate
                       </div>
                       <span className="font-mono text-white">{metrics.flow.toFixed(0)} L/min</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Frequency Spectrum */}
           <SciFiCard title="振动频谱 (FFT)" subtitle="HARMONICS" className="flex-1 border-red-900/50">
               <div className="h-full w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={SPECTRUM_DATA} layout="vertical" margin={{left: 20, right: 20}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c1c" horizontal={false} />
                           <XAxis type="number" stroke="#7f1d1d" hide />
                           <YAxis dataKey="freq" type="category" stroke="#9ca3af" width={40} tick={{fontSize: 10}} />
                           <Tooltip cursor={{fill: '#331c1c'}} contentStyle={{backgroundColor: '#0a0000', borderColor: '#ef4444', color: '#fff'}} />
                           <Bar dataKey="val" fill="#ef4444" barSize={15} radius={[0, 4, 4, 0]} />
                       </BarChart>
                   </ResponsiveContainer>
                   <div className="text-[10px] text-slate-500 mt-2 text-center border-t border-red-900/30 pt-2">
                       Significant 1X (Rotation) & BPF (Meshing) Components
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: Digital Twin & Trends */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#050000] border border-red-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(239,68,68,0.1)]">
               
               {/* Overlays */}
               <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                   <div className="bg-black/60 backdrop-blur border border-red-500/30 px-3 py-2 rounded">
                       <div className="text-[10px] text-red-300 font-bold uppercase mb-1">
                           Discharge Pressure
                       </div>
                       <div className="flex items-end gap-2">
                           <span className="text-3xl font-mono font-bold text-white leading-none">{metrics.pressure.toFixed(2)}</span>
                           <span className="text-xs text-slate-400 mb-1">MPa</span>
                       </div>
                   </div>
               </div>

               {/* Alert Box */}
               {alerts.length > 0 && (
                   <div className="absolute top-4 right-4 z-10 w-48 space-y-2">
                       {alerts.map((alert, i) => (
                           <div key={i} className="bg-red-900/80 backdrop-blur border-l-4 border-red-500 p-2 rounded text-xs text-white animate-in slide-in-from-right-4 fade-in">
                               <div className="flex items-center gap-2 font-bold mb-1">
                                   <AlertTriangle size={12} className="text-yellow-300" /> ALARM
                               </div>
                               {alert}
                           </div>
                       ))}
                   </div>
               )}

               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                   <div className={`px-4 py-1 rounded-full border text-xs font-bold flex items-center gap-2 backdrop-blur
                       ${metrics.cavitation ? 'bg-red-900/50 border-red-500 text-red-200' : 'bg-green-900/30 border-green-500/50 text-green-300'}
                   `}>
                       {metrics.cavitation ? <Waves size={14} className="animate-pulse" /> : <CheckSquare size={14} />}
                       {metrics.cavitation ? 'CAVITATION DETECTED' : 'FLOW STABLE'}
                   </div>
               </div>

               <PumpVibrationScene 
                   rpm={metrics.rpm}
                   pressure={metrics.pressure}
                   vibration={metrics.vibration}
                   temperature={metrics.temp}
                   cavitation={metrics.cavitation}
                   flowRate={metrics.flow}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Trend Chart */}
           <SciFiCard title="压力与振动关联趋势 (Trend Correlation)" subtitle="PREDICTION 24H" className="h-[280px] border-red-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={TREND_HISTORY}>
                           <defs>
                               <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c1c" vertical={false} />
                           <XAxis dataKey="time" stroke="#7f1d1d" tick={{fontSize: 10}} interval={6} />
                           <YAxis yAxisId="left" stroke="#ef4444" tick={{fontSize: 10}} label={{ value: 'Vib (mm/s)', angle: -90, position: 'insideLeft', fill: '#ef4444', fontSize: 10 }} domain={[0, 4]} />
                           <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" tick={{fontSize: 10}} label={{ value: 'Press (MPa)', angle: 90, position: 'insideRight', fill: '#38bdf8', fontSize: 10 }} domain={[3, 5]} />
                           <Tooltip contentStyle={{backgroundColor: '#0a0000', borderColor: '#ef4444', color: '#fff'}} />
                           
                           {/* History */}
                           <Area yAxisId="left" type="monotone" dataKey="vib" stroke="#ef4444" fill="url(#colorVib)" name="Vibration" />
                           <Line yAxisId="right" type="monotone" dataKey="press" stroke="#38bdf8" strokeWidth={2} dot={false} name="Pressure" />
                           
                           {/* Prediction */}
                           <Line yAxisId="left" type="monotone" dataKey="pVib" stroke="#fca5a5" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Pred. Vib" />
                           <Line yAxisId="right" type="monotone" dataKey="pPress" stroke="#7dd3fc" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Pred. Press" />
                           
                           <ReferenceLine x="36:00" stroke="#fff" strokeDasharray="3 3" label={{value: 'Now', fill: '#fff', fontSize: 10}} />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Diagnostics */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Orbit / Phase Plane */}
           <SciFiCard title="轴心轨迹 (Phase Plane)" subtitle="SHAFT MOTION" className="h-[250px] border-red-900/50" noPadding>
               <div className="w-full h-full p-2 flex items-center justify-center relative">
                   {/* Background Grid */}
                   <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                       <div className="w-40 h-40 border border-red-500 rounded-full"></div>
                       <div className="w-[1px] h-full bg-red-500"></div>
                       <div className="h-[1px] w-full bg-red-500"></div>
                   </div>
                   
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{top: 10, right: 10, bottom: 10, left: 10}}>
                           <XAxis type="number" dataKey="x" domain={[-2, 2]} hide />
                           <YAxis type="number" dataKey="y" domain={[-2, 2]} hide />
                           <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#000', borderColor: '#ef4444'}} />
                           <Scatter name="Orbit" data={ORBIT_DATA} fill="#ef4444" line={{stroke: '#ef4444', strokeWidth: 1}} lineType="fitting" />
                       </ScatterChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* AI Diagnostics Log */}
           <SciFiCard title="AI 智能诊断日志" className="flex-1 border-red-900/50">
               <div className="flex flex-col gap-2 h-full overflow-hidden">
                   {[
                       { time: '10:45:02', code: 'ANOM-01', msg: 'High frequency harmonics detected (Gear mesh issue)', type: 'warn' },
                       { time: '10:30:15', code: 'PRED-02', msg: 'Pressure pulsation trend increasing > 5%', type: 'info' },
                       { time: '09:12:00', code: 'SYS-OK', msg: 'Oil viscosity within optimal range', type: 'success' },
                   ].map((log, i) => (
                       <div key={i} className="p-2 border-b border-red-900/20 last:border-0">
                           <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                               <span>{log.time}</span>
                               <span className="font-mono">{log.code}</span>
                           </div>
                           <div className={`text-xs ${log.type === 'warn' ? 'text-yellow-400' : log.type === 'success' ? 'text-green-400' : 'text-slate-300'}`}>
                               {log.msg}
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Maintenance Action */}
           <SciFiCard title="维护建议" className="border-red-900/50">
               <div className="space-y-2">
                   <div className="flex items-start gap-2 text-xs text-slate-300">
                       <TrendingUp size={14} className="text-red-400 shrink-0" />
                       <span>Predictive: Check alignment and coupling within 48h.</span>
                   </div>
                   <div className="flex items-start gap-2 text-xs text-slate-300">
                       <GitCommit size={14} className="text-blue-400 shrink-0" />
                       <span>Action: Schedule oil filter replacement.</span>
                   </div>
               </div>
               <button className="mt-3 w-full py-2 bg-red-900/20 hover:bg-red-900/40 text-red-300 text-xs rounded border border-red-900/50 transition-colors">
                   Acknowledge & Plan
               </button>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
