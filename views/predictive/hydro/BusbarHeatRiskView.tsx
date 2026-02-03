
import React, { useState, useEffect } from 'react';
import { BusbarScene } from '../../../components/predictive/hydro-busbar/ThreeScene';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, ScatterChart, Scatter, ZAxis, BarChart, Bar, Cell, ComposedChart
} from 'recharts';
import { 
  Thermometer, Zap, Activity, AlertTriangle, 
  Scan, Grid, History, ArrowUpRight, 
  Flame, LayoutGrid, Eye, Search, Layers, Settings
} from 'lucide-react';

// --- Mock Data ---

// Temperature Rise Trend (Correlated with Load)
const TEMP_LOAD_DATA = Array.from({length: 48}, (_, i) => {
    const t = i;
    const load = t > 10 && t < 38 ? 80 + Math.sin(t*0.2)*10 : 40;
    // Phase C has a fault (Resistance higher -> Temp rises faster and stays higher)
    const tempA = 40 + load * 0.4 + Math.random();
    const tempB = 41 + load * 0.42 + Math.random();
    const tempC = 45 + load * 0.6 + (t > 20 ? (t-20)*0.5 : 0) + Math.random(); // Runaway
    
    return {
        time: `${i}:00`,
        load,
        tempA,
        tempB,
        tempC,
        limit: 90
    };
});

// Resistance Hysteresis (Temp vs Resistance)
// A healthy joint returns to same resistance when cooled. A bad one increases (ratcheting).
const RESISTANCE_LOOP = Array.from({length: 50}, (_, i) => {
    const temp = 20 + i * 1.5;
    // Hysteresis loop opening up
    const resHeating = 15 + (temp - 20) * 0.05; 
    const resCooling = 15 + (temp - 20) * 0.05 + (i > 30 ? 2 : 0); // Permanent set
    return { temp, resHeating, resCooling };
});

// Joint Matrix Status
const JOINT_MATRIX = [
    { id: 'J-A1', temp: 52, status: 'normal' }, { id: 'J-B1', temp: 53, status: 'normal' }, { id: 'J-C1', temp: 55, status: 'normal' },
    { id: 'J-A2', temp: 51, status: 'normal' }, { id: 'J-B2', temp: 54, status: 'normal' }, { id: 'J-C2', temp: 88, status: 'critical' },
    { id: 'J-A3', temp: 50, status: 'normal' }, { id: 'J-B3', temp: 52, status: 'normal' }, { id: 'J-C3', temp: 62, status: 'warning' },
];

export const BusbarHeatRiskView: React.FC = () => {
  // --- STATE ---
  const [metrics, setMetrics] = useState({
      load: 1250, // A
      ambientTemp: 24.5, // C
      maxTemp: 88.2, // C
      unbalance: 15.4, // %
      resistance: 45.2, // micro-ohm (Contact R)
  });

  const [phaseTemps, setPhaseTemps] = useState<[number, number, number]>([52, 54, 88]);
  const [viewMode, setViewMode] = useState<'visual' | 'thermal'>('visual');
  const [predictionTime, setPredictionTime] = useState(0); // For animation of chart

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
        const t = Date.now() / 1000;
        
        // Sim Load Fluctuation
        const loadNoise = Math.sin(t * 0.5) * 50;
        const currentLoad = 1250 + loadNoise;

        // Sim Temp Response (Phase C follows load more aggressively due to high R)
        setPhaseTemps(prev => [
            52 + loadNoise * 0.01 + Math.random(),
            54 + loadNoise * 0.01 + Math.random(),
            88 + loadNoise * 0.03 + Math.sin(t)*2 // The Fault
        ]);

        setMetrics(prev => ({
            ...prev,
            load: currentLoad,
            maxTemp: 88 + loadNoise * 0.03,
            resistance: 45.2 + Math.max(0, (prev.maxTemp - 80) * 0.1) // Resistance rises with extreme heat
        }));

        setPredictionTime(t);

    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#050202] text-rose-50 p-2 overflow-y-auto custom-scrollbar selection:bg-rose-500/30">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-rose-900/40 pb-4 bg-gradient-to-r from-[#1f050a] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400 mb-1 uppercase tracking-wider">
             <Flame size={14} className="animate-pulse" />
             Thermal Imaging & Contact Analysis
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             母线连接点 <span className="text-rose-500">过热风险预测</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Max Hotspot Temp</div>
                <div className={`text-3xl font-mono font-bold ${metrics.maxTemp > 80 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {metrics.maxTemp.toFixed(1)} <span className="text-sm text-slate-500">°C</span>
                </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Load Current</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.load.toFixed(0)} <span className="text-sm text-slate-500">A</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Contact Resistance</div>
                <div className="text-2xl font-mono font-bold text-yellow-400">{metrics.resistance.toFixed(1)} <span className="text-sm text-slate-500">μΩ</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Thermal & Electrical Physics */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Phase Temperature Balance */}
           <SciFiCard title="三相温升不平衡度" subtitle="PHASE BALANCE" className="border-rose-900/50 bg-[#0a0203]/80">
               <div className="flex flex-col gap-4 py-2">
                   {['A', 'B', 'C'].map((phase, i) => (
                       <div key={phase} className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded flex items-center justify-center font-bold border 
                               ${i === 2 ? 'bg-red-900/30 border-red-500 text-red-400' : 'bg-slate-900/50 border-slate-700 text-slate-400'}
                           `}>
                               {phase}
                           </div>
                           <div className="flex-1">
                               <div className="flex justify-between text-xs mb-1">
                                   <span className="text-slate-400">Temp</span>
                                   <span className={i === 2 ? 'text-red-400 font-bold' : 'text-white'}>{phaseTemps[i].toFixed(1)}°C</span>
                               </div>
                               <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                   <div 
                                     className={`h-full ${i === 2 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                     style={{width: `${(phaseTemps[i]/120)*100}%`}}
                                   ></div>
                               </div>
                           </div>
                       </div>
                   ))}
                   
                   <div className="mt-2 p-2 bg-red-900/10 border border-red-900/30 rounded text-xs flex justify-between items-center">
                       <span className="text-rose-300 font-bold">Unbalance Rate</span>
                       <span className="text-white font-mono text-lg">{metrics.unbalance.toFixed(1)}%</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Resistance Hysteresis Loop */}
           <SciFiCard title="电阻-温度迟滞环 (R-T Loop)" subtitle="DEGRADATION" className="flex-1 border-rose-900/50">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{top: 10, right: 10, bottom: 10, left: 0}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c1c" />
                           <XAxis type="number" dataKey="temp" name="Temp" unit="°C" stroke="#9f1239" tick={{fontSize: 10}} label={{ value: 'Temp (°C)', position: 'insideBottom', offset: -5, fill: '#9f1239', fontSize: 10 }} />
                           <YAxis type="number" dataKey="resHeating" name="Res" unit="μΩ" stroke="#9f1239" tick={{fontSize: 10}} label={{ value: 'R (μΩ)', angle: -90, position: 'insideLeft', fill: '#9f1239', fontSize: 10 }} domain={[10, 30]} />
                           <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#0a0202', borderColor: '#f43f5e', color: '#fff'}} />
                           <Scatter name="Heating" data={RESISTANCE_LOOP} line={{stroke: '#f43f5e', strokeWidth: 2}} lineType="fitting" shape={() => null} />
                           <Scatter name="Cooling" data={RESISTANCE_LOOP.map(d => ({temp: d.temp, resHeating: d.resCooling}))} line={{stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '3 3'}} lineType="fitting" shape={() => null} />
                       </ScatterChart>
                   </ResponsiveContainer>
                   <div className="text-[10px] text-center text-slate-500 mt-1">
                       Loop widening indicates mechanical loosening (Plastic Deformation).
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#000000] border border-rose-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(244,63,94,0.1)] group">
               
               {/* Controls */}
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                   <button 
                     onClick={() => setViewMode('visual')}
                     className={`px-4 py-1.5 rounded text-xs font-bold border transition-colors flex items-center gap-2 ${viewMode === 'visual' ? 'bg-rose-600 border-rose-400 text-white' : 'bg-black/60 border-slate-700 text-slate-400'}`}
                   >
                       <Eye size={12}/> Visual
                   </button>
                   <button 
                     onClick={() => setViewMode('thermal')}
                     className={`px-4 py-1.5 rounded text-xs font-bold border transition-colors flex items-center gap-2 ${viewMode === 'thermal' ? 'bg-orange-600 border-orange-400 text-white' : 'bg-black/60 border-slate-700 text-slate-400'}`}
                   >
                       <Activity size={12}/> Thermal Cam
                   </button>
               </div>

               {/* Alert Overlay */}
               {metrics.maxTemp > 85 && (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
                       <div className="w-64 h-64 rounded-full border-2 border-red-500/20 bg-red-500/5 animate-ping"></div>
                   </div>
               )}

               <div className="absolute bottom-4 right-4 z-10">
                   <div className="bg-black/70 backdrop-blur p-2 rounded border border-rose-500/30 text-right">
                       <div className="text-[10px] text-rose-300 font-bold uppercase mb-1">Hotspot Detected</div>
                       <div className="text-xl font-bold text-white">Joint Phase C-2</div>
                       <div className="text-[10px] text-red-500 font-mono">Rise Rate: +2.5°C/h</div>
                   </div>
               </div>

               <BusbarScene 
                   phaseTemps={phaseTemps}
                   loadCurrent={metrics.load}
                   hotspotLocation={3} // Phase C
                   viewMode={viewMode}
               />
           </div>

           {/* Temperature Trend Prediction */}
           <SciFiCard title="温升趋势与负荷关联 (Temp vs Load)" subtitle="PREDICTION 24H" className="h-[260px] border-rose-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={TEMP_LOAD_DATA}>
                           <defs>
                               <linearGradient id="loadFill" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c1c" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={6} />
                           <YAxis yAxisId="left" stroke="#f43f5e" tick={{fontSize: 10}} label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fill: '#f43f5e', fontSize: 10 }} domain={[20, 100]} />
                           <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tick={{fontSize: 10}} label={{ value: 'Load (A)', angle: 90, position: 'insideRight', fill: '#3b82f6', fontSize: 10 }} domain={[0, 2000]} />
                           <Tooltip contentStyle={{backgroundColor: '#0a0202', borderColor: '#f43f5e', color: '#fff'}} />
                           <ReferenceLine yAxisId="left" y={90} stroke="red" strokeDasharray="3 3" label={{value: 'Trip', fill: 'red', fontSize: 10}} />
                           
                           <Area yAxisId="right" type="monotone" dataKey="load" stroke="none" fill="url(#loadFill)" name="Load Current" />
                           <Line yAxisId="left" type="monotone" dataKey="tempC" stroke="#f43f5e" strokeWidth={2} dot={false} name="Phase C (Fault)" />
                           <Line yAxisId="left" type="monotone" dataKey="tempA" stroke="#10b981" strokeWidth={1} dot={false} name="Phase A" />
                           <Line yAxisId="left" type="monotone" dataKey="tempB" stroke="#10b981" strokeWidth={1} dot={false} name="Phase B" />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Matrix & Actions */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Joint Health Matrix */}
           <SciFiCard title="连接点健康矩阵 (Joint Matrix)" subtitle="STATUS" className="flex-1 border-rose-900/50 bg-[#080204]/80">
               <div className="grid grid-cols-3 gap-2 h-full content-start overflow-y-auto pr-1">
                   {JOINT_MATRIX.map((joint) => (
                       <div key={joint.id} className={`p-2 rounded border flex flex-col items-center justify-center aspect-square transition-all cursor-pointer hover:scale-105
                           ${joint.status === 'critical' ? 'bg-red-900/40 border-red-500 shadow-[0_0_10px_red]' : 
                             joint.status === 'warning' ? 'bg-yellow-900/20 border-yellow-600' : 'bg-slate-900/40 border-slate-800'}
                       `}>
                           <div className="text-[10px] text-slate-400 font-bold">{joint.id}</div>
                           <div className={`text-lg font-bold ${joint.status === 'critical' ? 'text-white' : joint.status === 'warning' ? 'text-yellow-400' : 'text-green-500'}`}>
                               {joint.temp}°
                           </div>
                           {joint.status === 'critical' && <AlertTriangle size={12} className="text-red-500 mt-1 animate-bounce" />}
                       </div>
                   ))}
                   
                   {/* Legend */}
                   <div className="col-span-3 flex justify-center gap-4 mt-4 text-[10px] text-slate-500">
                       <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Normal</span>
                       <span className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div> Rise</span>
                       <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Crit</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Risk Calculation */}
           <SciFiCard title="热失控风险评估" className="border-rose-900/50">
               <div className="space-y-3">
                   <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400">Time to Critical (90°C)</span>
                       <span className="text-white font-mono font-bold">2.5 Hours</span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-yellow-500 to-red-500" style={{width: '85%'}}></div>
                   </div>

                   <div className="p-2 bg-rose-900/20 border border-rose-500/30 rounded text-xs text-rose-200">
                       <div className="font-bold flex items-center gap-1 mb-1"><Search size={12}/> Root Cause</div>
                       Loose bolt detected on Phase C Joint 2. Contact resistance increased by 200%.
                   </div>

                   <button className="w-full py-2 bg-rose-700/30 hover:bg-rose-600/50 border border-rose-500/50 rounded text-xs text-rose-100 transition-colors flex items-center justify-center gap-2">
                       <Settings size={12} /> Schedule Bolt Tightening
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
