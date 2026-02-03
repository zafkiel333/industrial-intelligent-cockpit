import React, { useState, useEffect } from 'react';
import { CoolingPumpScene } from '../../../components/predictive/hydro-cooling-pump/ThreeScene';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, ScatterChart, Scatter, ComposedChart, Bar, BarChart, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from 'recharts';
import { 
  Activity, Droplets, Thermometer, Wind, AlertTriangle, 
  Settings, Zap, Gauge, Filter, Power, RotateCw, GitMerge
} from 'lucide-react';

// --- Mock Data ---

// H-Q Curve (Head vs Flow)
const HQ_CURVE_DATA = Array.from({length: 50}, (_, i) => {
    const q = i * 10; // Flow m3/h
    // Ideal Curve H = H0 - kQ^2
    const head = 80 - 0.0002 * q * q;
    // Efficiency Curve (Parabola)
    const eff = -0.0005 * Math.pow(q - 300, 2) + 85; 
    return { q, head: Math.max(0, head), eff: Math.max(0, eff) };
});

// Vibration Spectrum
const VIB_SPECTRUM = [
    { freq: '1X', val: 2.5, type: 'Unbalance' },
    { freq: '2X', val: 0.8, type: 'Misalignment' },
    { freq: '3X', val: 0.2, type: 'Looseness' },
    { freq: 'BPF', val: 1.2, type: 'Vane Pass' },
    { freq: 'High', val: 0.5, type: 'Bearing' },
];

// Risk Factors
const RISK_RADAR = [
    { subject: '气蚀风险', A: 45, fullMark: 100 },
    { subject: '轴承磨损', A: 80, fullMark: 100 },
    { subject: '电机过热', A: 65, fullMark: 100 },
    { subject: '密封泄漏', A: 30, fullMark: 100 },
    { subject: '管道堵塞', A: 55, fullMark: 100 },
];

export const CoolingWaterPumpRiskView: React.FC = () => {
  // --- STATE ---
  const [activePump, setActivePump] = useState<1 | 2>(1);
  const [metrics, setMetrics] = useState({
      flow: 320, // m3/h
      head: 65, // m
      temp: 45.2, // C
      vibration: 2.1, // mm/s
      current: 125, // A
      npshMargin: 1.5, // m (Net Positive Suction Head Margin)
      filterDiff: 0.05, // MPa
  });

  const [simState, setSimState] = useState({
      cavitation: false,
      clogging: 0.1, // 0-1
      efficiency: 82.5, // %
  });

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
        const t = Date.now() / 1000;
        
        setMetrics(prev => {
            // Fluctuate based on simulation state
            const flowNoise = (Math.random()-0.5) * 10;
            const newFlow = (simState.clogging > 0.5 ? 200 : 320) + flowNoise;
            
            const headNoise = (Math.random()-0.5) * 0.5;
            const newHead = (simState.clogging > 0.5 ? 75 : 65) + headNoise; // Clogging raises head/pressure
            
            const vibNoise = (simState.cavitation ? Math.random()*2 : 0) + (Math.random()-0.5)*0.1;
            
            return {
                ...prev,
                flow: newFlow,
                head: newHead,
                temp: 45 + (simState.clogging * 10) + Math.sin(t*0.1),
                vibration: 2.1 + vibNoise,
                npshMargin: simState.cavitation ? 0.2 : 1.5 + Math.sin(t*0.2)*0.1,
                filterDiff: 0.05 + simState.clogging * 0.2
            };
        });

    }, 200);
    return () => clearInterval(interval);
  }, [simState]);

  // Handlers
  const togglePump = () => setActivePump(prev => prev === 1 ? 2 : 1);
  const triggerCavitation = () => setSimState(prev => ({...prev, cavitation: !prev.cavitation}));
  const simulateClog = () => setSimState(prev => ({...prev, clogging: prev.clogging > 0.5 ? 0.1 : 0.8}));

  // Risk Calculation
  const totalRisk = (metrics.vibration / 5 * 40) + (simState.clogging * 30) + (simState.cavitation ? 30 : 0);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#02040b] text-cyan-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-cyan-900/40 pb-4 bg-gradient-to-r from-[#082f49] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Droplets size={14} className="animate-bounce" />
             Auxiliary System Monitoring
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             冷却水系统泵组 <span className="text-cyan-500">故障风险预测</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">System Efficiency</div>
                <div className={`text-3xl font-mono font-bold ${simState.efficiency < 75 ? 'text-yellow-400' : 'text-white'}`}>
                    {simState.efficiency.toFixed(1)}<span className="text-sm text-slate-500">%</span>
                </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Risk Index</div>
                <div className={`text-2xl font-mono font-bold ${totalRisk > 50 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {totalRisk.toFixed(0)} <span className="text-sm">/ 100</span>
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Active Unit</div>
                <div className="text-2xl font-bold text-cyan-400">PUMP #{activePump}</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Input Conditions & Controls */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Filters & Quality */}
           <SciFiCard title="进水状态监测" subtitle="PRE-TREATMENT" className="border-cyan-900/50 bg-[#061018]/80">
               <div className="flex flex-col gap-4">
                   <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-2">
                           <Filter size={16} className="text-cyan-400" />
                           <div>
                               <div className="text-xs text-slate-400">Filter ΔP</div>
                               <div className="text-lg font-bold text-white">{metrics.filterDiff.toFixed(3)} MPa</div>
                           </div>
                       </div>
                       <div className={`w-3 h-3 rounded-full ${metrics.filterDiff > 0.1 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                       <div className="bg-slate-900/50 p-2 rounded text-center">
                           <div className="text-[10px] text-slate-500">pH Level</div>
                           <div className="text-lg font-mono text-white">7.2</div>
                       </div>
                       <div className="bg-slate-900/50 p-2 rounded text-center">
                           <div className="text-[10px] text-slate-500">Hardness</div>
                           <div className="text-lg font-mono text-white">120</div>
                       </div>
                   </div>
                   
                   <div className="p-2 border-t border-slate-800 mt-2">
                       <div className="text-xs font-bold text-slate-400 mb-2">Simulate Faults</div>
                       <div className="flex gap-2">
                           <button 
                             onClick={triggerCavitation}
                             className={`flex-1 py-1 text-[10px] border rounded transition-colors ${simState.cavitation ? 'bg-red-900/50 border-red-500 text-red-200' : 'border-slate-600 hover:border-cyan-500'}`}
                           >
                               Cavitation
                           </button>
                           <button 
                             onClick={simulateClog}
                             className={`flex-1 py-1 text-[10px] border rounded transition-colors ${simState.clogging > 0.5 ? 'bg-yellow-900/50 border-yellow-500 text-yellow-200' : 'border-slate-600 hover:border-cyan-500'}`}
                           >
                               Blockage
                           </button>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Risk Radar */}
           <SciFiCard title="综合风险评估" subtitle="MULTI-FACTOR" className="flex-1 border-cyan-900/50">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RISK_RADAR}>
                           <PolarGrid stroke="#1e293b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Risk" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#020204] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(34,211,238,0.1)]">
               
               {/* HUD Left */}
               <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/20 px-3 py-2 rounded">
                       <div className="text-[10px] text-cyan-400 font-bold uppercase mb-1 flex items-center gap-2">
                           <Activity size={12} /> Flow Rate
                       </div>
                       <div className="flex items-end gap-2">
                           <span className="text-3xl font-mono font-bold text-white leading-none">{metrics.flow.toFixed(0)}</span>
                           <span className="text-xs text-slate-400 mb-1">m³/h</span>
                       </div>
                   </div>
               </div>

               {/* NPSH Margin Indicator */}
               <div className="absolute bottom-4 right-4 z-10">
                   <div className={`bg-black/70 backdrop-blur px-4 py-2 rounded border ${metrics.npshMargin < 0.5 ? 'border-red-500' : 'border-green-500'}`}>
                       <div className="text-[10px] text-slate-400 uppercase">NPSH Margin</div>
                       <div className={`text-xl font-bold ${metrics.npshMargin < 0.5 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                           {metrics.npshMargin.toFixed(2)} m
                       </div>
                   </div>
               </div>

               {/* Switch Control */}
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                   <button 
                     onClick={togglePump}
                     className="flex items-center gap-2 bg-cyan-900/80 hover:bg-cyan-700 text-white px-4 py-2 rounded-full border border-cyan-500/50 font-bold text-xs transition-all shadow-lg"
                   >
                       <GitMerge size={14} /> SWITCHOVER
                   </button>
               </div>

               <CoolingPumpScene 
                   activePumpId={activePump}
                   flowRate={metrics.flow / 3.2} // Norm approx
                   vibration={metrics.vibration / 5}
                   temperature={metrics.temp}
                   isCavitating={simState.cavitation}
                   cloggingLevel={simState.clogging}
               />
           </div>

           {/* H-Q Curve Analysis */}
           <SciFiCard title="水泵运行特性曲线 (H-Q Analysis)" subtitle="OPERATING POINT" className="h-[260px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={HQ_CURVE_DATA} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                           <XAxis dataKey="q" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Flow (m³/h)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                           <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Head (m)', angle: -90, position: 'insideLeft', fontSize: 10 }} domain={[0, 100]} />
                           <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{fontSize: 10}} domain={[0, 100]} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                           
                           <Line yAxisId="left" type="monotone" dataKey="head" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Head" />
                           <Line yAxisId="right" type="monotone" dataKey="eff" stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Efficiency" />
                           
                           {/* Operating Point */}
                           <Scatter yAxisId="left" name="Current Point" data={[{q: metrics.flow, head: metrics.head}]} fill="#f59e0b" shape="cross" r={6} />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Vibration & Output */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Vibration Spectrum */}
           <SciFiCard title="振动频谱 (Vibration FFT)" subtitle="RMS: 2.1mm/s" className="flex-1 border-cyan-900/50">
               <div className="h-full w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={VIB_SPECTRUM} layout="vertical" margin={{left: 20}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                           <XAxis type="number" stroke="#64748b" hide />
                           <YAxis dataKey="freq" type="category" stroke="#94a3b8" width={30} tick={{fontSize: 10}} />
                           <Bar dataKey="val" fill="#0ea5e9" barSize={15} radius={[0, 4, 4, 0]}>
                               {VIB_SPECTRUM.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.type === 'Unbalance' ? '#ef4444' : '#0ea5e9'} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
                   <div className="text-[10px] text-center text-slate-500 mt-2">
                       Warning: High 1X Vibration indicating rotor unbalance.
                   </div>
               </div>
           </SciFiCard>

           {/* Motor Parameters */}
           <SciFiCard title="电机运行参数" className="border-cyan-900/50">
               <div className="space-y-3">
                   <div className="flex justify-between items-center text-xs p-2 bg-slate-900/50 rounded border border-slate-800">
                       <span className="text-slate-400 flex items-center gap-2"><Zap size={12} className="text-yellow-500"/> Current</span>
                       <span className="font-mono text-white">{metrics.current.toFixed(1)} A</span>
                   </div>
                   <div className="flex justify-between items-center text-xs p-2 bg-slate-900/50 rounded border border-slate-800">
                       <span className="text-slate-400 flex items-center gap-2"><Power size={12} className="text-blue-500"/> Power</span>
                       <span className="font-mono text-white">{(metrics.current * 0.38 * 1.732 * 0.85).toFixed(1)} kW</span>
                   </div>
                   <div className="flex justify-between items-center text-xs p-2 bg-slate-900/50 rounded border border-slate-800">
                       <span className="text-slate-400 flex items-center gap-2"><Thermometer size={12} className="text-red-500"/> Winding Temp</span>
                       <span className="font-mono text-white">{metrics.temp.toFixed(1)} °C</span>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};