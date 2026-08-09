import React, { useState, useEffect } from 'react';
import { WindingThermalScene } from '../../../components/predictive/hydro-transformer-winding/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-16]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-16';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, ComposedChart, BarChart, Bar, Cell, Legend
} from 'recharts';
import { 
  Thermometer, Zap, Activity, Clock, 
  AlertOctagon, TrendingUp, Layers, Flame, 
  Wind, Droplets, Calendar, ArrowRight
} from 'lucide-react';

// --- Mock Data ---

// Temperature Rise Curve (Time vs Load vs Temp)
const TEMP_RISE_DATA = Array.from({length: 48}, (_, i) => {
    const t = i;
    const load = t > 12 && t < 36 ? 90 + Math.sin(t*0.5)*10 : 60; // Peak load during day
    // Temp lags load
    const tempLag = load * 0.8 + 20 + Math.sin((t-2)*0.5)*5;
    
    return {
        time: `${i}:00`,
        load: load,
        hst: tempLag + 15, // Hot spot is higher
        topOil: tempLag
    };
});

// DP (Degree of Polymerization) Degradation
const DP_DEGRADATION = Array.from({length: 30}, (_, i) => {
    const year = 2000 + i;
    // Initial 1000, Critical 200
    // Accelerated aging model
    const dp = 1000 * Math.exp(-0.04 * i);
    return {
        year: year,
        dp: dp,
        limit: 200
    };
});

// Thermal Model (Gradient across winding height)
const THERMAL_GRADIENT = Array.from({length: 20}, (_, i) => ({
    height: i * 5, // % height
    temp: 60 + i * 2 - (i > 15 ? (i-15)*4 : 0) // Peak around 75-80% height typical for transformers
}));

export const TransformerWindingView: React.FC = () => {
  // --- STATE ---
  const [metrics, setMetrics] = useState({
      load: 85, // %
      hst: 98.5, // Hot Spot Temp C
      topOil: 75.2, // C
      bottomOil: 55.4, // C
      agingFactor: 1.0, // Relative aging rate
      dp: 650, // Current DP
      rul: 12.5, // Remaining years
  });

  const [simTime, setSimTime] = useState(0);

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        const t = Date.now() / 1000;
        setSimTime(t);
        
        // Sim Load Fluctuation
        const newLoad = 80 + Math.sin(t * 0.2) * 15;
        // Sim Thermal Lag
        const newHst = 60 + newLoad * 0.5 + Math.sin(t * 0.1) * 2;
        // Arrhenius Law for Aging Factor: 2^((T - 98) / 6)
        // Base ref temp often 98C or 110C depending on standard. Using 98C.
        const aging = Math.pow(2, (newHst - 98) / 6);

        setMetrics(prev => ({
            ...prev,
            load: newLoad,
            hst: newHst,
            topOil: newHst - 15,
            bottomOil: newHst - 35,
            agingFactor: aging,
            // Slow decay of DP for visual effect if needed, or keep static current
            rul: 12.5 - (aging * 0.0001) 
        }));

    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020409] text-slate-200 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER: High-Contrast Technical Look */}
      <div className="flex justify-between items-end border-b border-indigo-900/40 pb-4 bg-gradient-to-r from-[#1e1b4b] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <Thermometer size={14} className="animate-pulse" />
             Thermal-Chemical Aging Analysis
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             主变绕组 <span className="text-indigo-500">温升与绝缘劣化预测</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Hot Spot Temp (HST)</div>
                <div className={`text-3xl font-mono font-bold ${metrics.hst > 110 ? 'text-red-500 animate-pulse' : 'text-orange-400'}`}>
                    {metrics.hst.toFixed(1)}<span className="text-sm text-slate-500">°C</span>
                </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Loss of Life Factor</div>
                <div className={`text-3xl font-mono font-bold ${metrics.agingFactor > 2 ? 'text-red-500' : 'text-white'}`}>
                    {metrics.agingFactor.toFixed(2)}<span className="text-sm text-slate-500">x</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT COLUMN: 3D Twin & Thermal Profile */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#05050a] border border-indigo-900/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(79,70,229,0.1)]">
               
               {/* HUD Overlays */}
               <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                   <div className="bg-black/60 backdrop-blur border border-indigo-500/30 px-3 py-2 rounded w-48">
                       <div className="text-[10px] text-indigo-300 font-bold uppercase mb-1 flex items-center gap-2">
                           <Zap size={12} /> Winding Load
                       </div>
                       <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-blue-500 to-orange-500" style={{width: `${Math.min(100, metrics.load)}%`}}></div>
                       </div>
                       <div className="text-right text-xs text-white mt-1 font-mono">{metrics.load.toFixed(1)}%</div>
                   </div>
               </div>

               {/* Aging Gauge Overlay */}
               <div className="absolute bottom-4 right-4 z-10 w-40">
                   <div className="bg-black/70 backdrop-blur p-3 rounded border border-orange-900/50 text-center">
                       <div className="text-[10px] text-slate-400 uppercase mb-1">Aging Rate</div>
                       <div className="relative h-20 w-full flex items-center justify-center">
                           {/* Simple Speedometer Visual */}
                           <svg viewBox="0 0 100 50" className="w-full h-full">
                               <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#334155" strokeWidth="10" />
                               <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="url(#heatGrad)" strokeWidth="10" strokeDasharray="126" strokeDashoffset={126 - (126 * Math.min(1, metrics.agingFactor/4))} />
                               <defs>
                                   <linearGradient id="heatGrad">
                                       <stop offset="0%" stopColor="#10b981" />
                                       <stop offset="50%" stopColor="#f59e0b" />
                                       <stop offset="100%" stopColor="#ef4444" />
                                   </linearGradient>
                               </defs>
                               <line x1="50" y1="50" x2="50" y2="10" stroke="white" strokeWidth="2" transform={`rotate(${(Math.min(4, metrics.agingFactor)/4)*180 - 90} 50 50)`} />
                           </svg>
                           <div className="absolute bottom-0 font-bold text-xl text-white">{metrics.agingFactor.toFixed(1)}x</div>
                       </div>
                   </div>
               </div>

               <WindingThermalScene 
                   hvTemp={metrics.hst} 
                   lvTemp={metrics.hst - 5}
                   oilTemp={metrics.topOil}
                   loadFactor={metrics.load / 100}
                   hotspotHeight={0.8}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Winding Height vs Temperature Chart */}
           <SciFiCard title="绕组轴向温度分布" subtitle="THERMAL MODEL" className="h-[250px] border-indigo-900/50" noPadding>
               <div className="w-full h-full p-4 flex gap-4">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={THERMAL_GRADIENT} layout="vertical">
                               <defs>
                                   <linearGradient id="tempFill" x1="0" y1="0" x2="1" y2="0">
                                       <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                       <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" horizontal={false} />
                               <XAxis type="number" domain={[40, 120]} stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Temp (°C)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                               <YAxis dataKey="height" type="category" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Winding Height %', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                               <Tooltip contentStyle={{backgroundColor: '#050a15', borderColor: '#ef4444', color: '#fff'}} />
                               <Area type="monotone" dataKey="temp" stroke="#ef4444" fill="url(#tempFill)" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="w-24 text-xs text-slate-400 flex flex-col justify-center gap-2 border-l border-slate-800 pl-2">
                       <div className="mb-2 font-bold text-white">Hotspot Zone</div>
                       <div className="flex items-center gap-1"><ArrowRight size={12} className="text-red-500"/> Top 80%</div>
                       <div className="text-[10px] text-slate-500">Eddy losses peak at winding ends.</div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Trend Analysis & Chemical Aging */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5">
           
           {/* Load vs Temp Trend */}
           <SciFiCard title="温升滞后效应分析" subtitle="LOAD vs HST" className="h-[280px] border-indigo-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={TEMP_RISE_DATA}>
                           <defs>
                               <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={5} />
                           <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" tick={{fontSize: 10}} label={{ value: 'Load %', angle: -90, position: 'insideLeft', fill: '#3b82f6' }} />
                           <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{fontSize: 10}} label={{ value: 'HST °C', angle: 90, position: 'insideRight', fill: '#ef4444' }} />
                           <Tooltip contentStyle={{backgroundColor: '#050a15', borderColor: '#6366f1', color: '#fff'}} />
                           <Legend wrapperStyle={{fontSize: '10px'}} />
                           
                           <Area yAxisId="left" type="monotone" dataKey="load" stroke="#3b82f6" fill="url(#colorLoad)" name="Load %" />
                           <Line yAxisId="right" type="monotone" dataKey="hst" stroke="#ef4444" strokeWidth={2} dot={false} name="Hot Spot Temp" />
                           <Line yAxisId="right" type="monotone" dataKey="topOil" stroke="#f59e0b" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Top Oil" />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <div className="flex flex-row gap-5 flex-1 min-h-[250px]">
               
               {/* DP Degradation Chart */}
               <SciFiCard title="绝缘聚合度 (DP) 衰减预测" subtitle="CHEMICAL LIFETIME" className="flex-1 border-indigo-900/50" noPadding>
                   <div className="w-full h-full p-4">
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={DP_DEGRADATION}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" />
                               <XAxis dataKey="year" stroke="#64748b" tick={{fontSize: 10}} interval={4} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 1000]} label={{ value: 'DP Value', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                               <Tooltip contentStyle={{backgroundColor: '#050a15', borderColor: '#10b981', color: '#fff'}} />
                               
                               <ReferenceLine y={200} stroke="red" strokeDasharray="3 3" label={{value: 'End of Life (200)', fill: 'red', fontSize: 10}} />
                               <ReferenceLine x={2024} stroke="white" strokeDasharray="3 3" />
                               
                               <Line type="monotone" dataKey="dp" stroke="#10b981" strokeWidth={2} dot={false} />
                           </LineChart>
                       </ResponsiveContainer>
                       <div className="absolute top-12 right-6 bg-slate-900/80 p-2 rounded border border-green-900/50 text-right">
                           <div className="text-[10px] text-slate-400">Current DP</div>
                           <div className="text-xl font-bold text-white">{metrics.dp.toFixed(0)}</div>
                       </div>
                   </div>
               </SciFiCard>

               {/* Metrics & RUL Text */}
               <SciFiCard title="剩余寿命评估" className="w-1/3 border-indigo-900/50">
                   <div className="flex flex-col h-full gap-4">
                       <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded border border-slate-800">
                           <Calendar size={20} className="text-cyan-500" />
                           <div>
                               <div className="text-xs text-slate-400">Est. Remaining</div>
                               <div className="text-xl font-bold text-white">{metrics.rul.toFixed(1)} <span className="text-xs font-normal text-slate-500">Years</span></div>
                           </div>
                       </div>

                       <div className="space-y-2">
                           <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-1">
                               <span className="text-slate-400">Aging Rate</span>
                               <span className={metrics.agingFactor > 1.5 ? 'text-red-400' : 'text-green-400'}>
                                   {(metrics.agingFactor * 100).toFixed(0)}%
                               </span>
                           </div>
                           <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-1">
                               <span className="text-slate-400">Cooling Mode</span>
                               <span className="text-white">ONAF</span>
                           </div>
                           <div className="flex justify-between items-center text-xs">
                               <span className="text-slate-400">Furfural</span>
                               <span className="text-white">0.2 mg/L</span>
                           </div>
                       </div>

                       <button className="mt-auto w-full py-2 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-200 text-xs rounded border border-indigo-500/30 transition-colors">
                           Export Life Report
                       </button>
                   </div>
               </SciFiCard>

           </div>

        </div>

      </div>
    </div>
  );
};