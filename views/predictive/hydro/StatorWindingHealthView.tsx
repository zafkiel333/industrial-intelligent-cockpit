
import React, { useState, useEffect } from 'react';
import { StatorWindingScene } from '../../../components/predictive/hydro-stator/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-2]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-2';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  ScatterChart, Scatter, LineChart, Line, Legend, Cell
} from 'recharts';
import { 
  Activity, Zap, Thermometer, AlertTriangle, 
  Waves, Layers, Scan, TrendingDown, FileText,
  Hexagon, ShieldCheck
} from 'lucide-react';

// --- Mock Data ---

// Health Index Trend (Last 30 days)
const HI_TREND = Array.from({length: 30}, (_, i) => ({
    day: `D-${30-i}`,
    hi: 98 - (i * 0.1) - (Math.random() * 0.5), // Slowly degrading
    pred: 98 - (i * 0.1) - 0.2 // Linear prediction
}));

// PRPD (Phase Resolved Partial Discharge) Pattern
// Sine wave reference + Discharge points
const PRPD_POINTS = [];
for(let i=0; i<200; i++) {
    const phase = Math.random() * 360;
    // PD typically happens at 45-90 and 225-270 degrees (rising edges)
    let mag = 0;
    if ((phase > 45 && phase < 135) || (phase > 225 && phase < 315)) {
        mag = Math.random() * 50 + 10;
    } else {
        mag = Math.random() * 5; // Noise
    }
    PRPD_POINTS.push({ phase, mag, color: mag > 30 ? '#ef4444' : '#3b82f6' });
}

// Sine Wave for Reference
const SINE_WAVE = Array.from({length: 37}, (_, i) => ({
    phase: i * 10,
    volts: Math.sin((i * 10) * Math.PI / 180) * 40 + 50 // Offset to overlay
}));

// Slot Temperature Map (48 Slots)
const SLOT_TEMPS = Array.from({length: 48}, (_, i) => ({
    id: i + 1,
    temp: 65 + Math.random() * 5 + (i === 12 ? 15 : 0) // Slot 13 is hot
}));

export const StatorWindingHealthView: React.FC = () => {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [pdActive, setPdActive] = useState(true);
  const [metrics, setMetrics] = useState({
      hi: 88.5,
      pdMax: 1250, // pC
      tanDelta: 0.85, // %
      ir: 5.2, // GΩ
      vib: 145 // µm
  });

  // Animation simulation
  useEffect(() => {
      const interval = setInterval(() => {
          setMetrics(prev => ({
              ...prev,
              pdMax: 1200 + Math.random() * 100,
              vib: 140 + Math.sin(Date.now()/1000) * 10
          }));
      }, 1000);
      return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020408] text-violet-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-violet-900/40 pb-4 bg-gradient-to-r from-violet-950/20 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-violet-400 mb-1 uppercase tracking-wider">
             <Layers size={14} className="animate-pulse" />
             Insulation Diagnostic System
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             发电机定子绕组 <span className="text-violet-500">健康指数趋势</span>
          </h1>
        </div>
        
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Health Index (HI)</div>
                <div className="text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                    {metrics.hi.toFixed(1)}
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-violet-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Max PD (Qmax)</div>
                <div className="text-2xl font-mono font-bold text-red-400">{metrics.pdMax.toFixed(0)} <span className="text-sm text-slate-500">pC</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-violet-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Dielectric Loss (tgδ)</div>
                <div className="text-2xl font-mono font-bold text-yellow-400">{metrics.tanDelta} <span className="text-sm text-slate-500">%</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: 3D Twin & Controls */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* Main 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#05030a] border border-violet-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(139,92,246,0.1)] group">
              
              {/* HUD Left */}
              <div className="absolute top-4 left-4 z-10 space-y-2 pointer-events-none">
                  <div className="bg-black/40 backdrop-blur p-2 rounded border border-violet-500/20">
                      <div className="text-[10px] text-violet-300 font-bold mb-1">END WINDING VIBRATION</div>
                      <div className="flex items-end gap-2">
                          <span className="text-2xl font-mono text-white">{metrics.vib.toFixed(0)}</span>
                          <span className="text-xs text-slate-400 mb-1">µm</span>
                      </div>
                      <div className="w-32 h-1 bg-slate-800 rounded mt-1 overflow-hidden">
                          <div className="h-full bg-violet-500 animate-pulse" style={{width: `${metrics.vib/200*100}%`}}></div>
                      </div>
                  </div>
              </div>

              {/* HUD Right */}
              <div className="absolute top-4 right-4 z-10 pointer-events-none">
                  <div className="flex items-center gap-2 text-red-400 bg-red-950/30 px-3 py-1 rounded border border-red-900/50">
                      <Zap size={14} className={pdActive ? "animate-ping" : ""} />
                      <span className="text-xs font-bold">PD ACTIVITY DETECTED</span>
                  </div>
              </div>

              {/* Legend Bottom */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-4 text-[10px] bg-black/60 px-4 py-1 rounded-full border border-slate-700">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-600"></div> Core</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-700"></div> Winding</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Hotspot/PD</div>
              </div>

              <StatorWindingScene 
                  activeSlot={activeSlot} 
                  pdLocation={pdActive ? [1,1,1] : undefined}
                  vibrationAmp={metrics.vib / 100}
              />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Slot Heatmap Strip */}
           <SciFiCard title="定子槽温分布 (Slot Temperature)" className="h-[140px] border-violet-900/50" noPadding>
               <div className="w-full h-full p-2 flex flex-col justify-center">
                   <div className="flex gap-0.5 h-16 items-end w-full overflow-x-auto custom-scrollbar pb-2">
                       {SLOT_TEMPS.map((slot) => (
                           <div 
                             key={slot.id} 
                             className={`flex-1 min-w-[8px] cursor-pointer hover:opacity-80 transition-all group relative rounded-t-sm
                                 ${activeSlot === slot.id ? 'opacity-100 ring-1 ring-white z-10' : 'opacity-80'}
                             `}
                             style={{
                                 height: `${(slot.temp / 100) * 100}%`,
                                 backgroundColor: slot.temp > 80 ? '#ef4444' : slot.temp > 70 ? '#f59e0b' : '#3b82f6'
                             }}
                             onClick={() => setActiveSlot(activeSlot === slot.id ? null : slot.id)}
                           >
                               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black/90 text-white text-[9px] p-1 rounded whitespace-nowrap z-20 pointer-events-none">
                                   Slot {slot.id}: {slot.temp.toFixed(1)}°C
                               </div>
                           </div>
                       ))}
                   </div>
                   <div className="flex justify-between text-[10px] text-slate-500 px-1">
                       <span>Slot 1</span>
                       <span>Slot 24</span>
                       <span>Slot 48</span>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Charts & Analysis */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5">
           
           {/* PRPD Analysis (The Cool Chart) */}
           <SciFiCard title="局部放电相位分析 (PRPD)" subtitle="PHASE RESOLVED PD" className="h-[300px] border-violet-900/50" noPadding>
               <div className="w-full h-full p-4 relative">
                   {/* Background Sine Wave for Reference */}
                   <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={SINE_WAVE}>
                               <Line type="monotone" dataKey="volts" stroke="#fff" strokeWidth={2} dot={false} />
                               <XAxis dataKey="phase" hide />
                               <YAxis domain={[0, 100]} hide />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>

                   {/* Scatter Plot for PD Events */}
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 0}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis type="number" dataKey="phase" name="Phase" unit="°" domain={[0, 360]} stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis type="number" dataKey="mag" name="Charge" unit="pC" stroke="#64748b" tick={{fontSize: 10}} />
                           <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#0f0718', borderColor: '#8b5cf6', color: '#fff'}} />
                           <Scatter name="PD Events" data={PRPD_POINTS} fill="#8884d8">
                               {PRPD_POINTS.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.color} />
                               ))}
                           </Scatter>
                       </ScatterChart>
                   </ResponsiveContainer>
                   
                   <div className="absolute top-4 right-4 text-[10px] text-slate-400 bg-black/60 p-2 rounded border border-slate-700">
                       <div>Pattern: <span className="text-red-400 font-bold">Internal Void</span></div>
                       <div>Severity: <span className="text-yellow-400">Moderate</span></div>
                   </div>
               </div>
           </SciFiCard>

           {/* Trend & Prediction */}
           <div className="flex-1 flex gap-5">
               <SciFiCard title="绝缘老化趋势" subtitle="HI TREND" className="flex-1 border-violet-900/50">
                   <div className="h-full w-full min-h-[150px]">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={HI_TREND}>
                               <defs>
                                   <linearGradient id="colorHi" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="day" hide />
                               <YAxis domain={[80, 100]} stroke="#64748b" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0718', borderColor: '#10b981'}} />
                               <Area type="monotone" dataKey="hi" stroke="#10b981" strokeWidth={2} fill="url(#colorHi)" />
                               <Line type="monotone" dataKey="pred" stroke="#fbbf24" strokeDasharray="3 3" strokeWidth={2} dot={false} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="诊断结论" className="w-1/3 border-violet-900/50">
                   <div className="flex flex-col h-full justify-between">
                       <div className="space-y-2">
                           <div className="flex items-start gap-2 text-xs text-slate-300">
                               <ShieldCheck className="text-green-400 shrink-0" size={14} />
                               <span>剩余寿命预测: &gt; 15 年</span>
                           </div>
                           <div className="flex items-start gap-2 text-xs text-slate-300">
                               <AlertTriangle className="text-yellow-400 shrink-0" size={14} />
                               <span>建议: 缩短局放监测周期至每周一次</span>
                           </div>
                       </div>
                       
                       <button className="w-full py-1.5 bg-violet-900/30 hover:bg-violet-900/50 text-violet-200 text-xs rounded border border-violet-500/30 transition-colors flex items-center justify-center gap-1">
                           <FileText size={12} /> 详细报告
                       </button>
                   </div>
               </SciFiCard>
           </div>

        </div>

      </div>
    </div>
  );
};
