
import React, { useState, useEffect } from 'react';
import { PumpBearingScene } from '../../../components/predictive/hydro-pump-bearing/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-31]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-31';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter, ComposedChart, Legend, Cell
} from 'recharts';
import { 
  Activity, Thermometer, RotateCw, AlertTriangle, 
  Waves, Disc, Settings, Cpu, TrendingDown, 
  Target, ShieldAlert, History
} from 'lucide-react';

// --- Mock Data ---

// Vibration Trend (Monthly) with Prediction
const VIB_TREND = Array.from({length: 24}, (_, i) => {
    const t = i;
    // Exponential growth of vibration
    const actual = t < 18 ? 2.5 + Math.exp(t * 0.1) * 0.5 + Math.random()*0.2 : null;
    const predict = 2.5 + Math.exp(t * 0.1) * 0.5;
    return {
        month: `M-${24-i}`,
        actual,
        predict,
        limit: 8.0
    };
});

// Impeller Efficiency Loss Curve
const EFF_CURVE = Array.from({length: 50}, (_, i) => {
    const hours = i * 500; // 0 to 25000 hours
    // Efficiency drops as clearance opens (wear)
    const eff = 92 - (hours / 25000) * 8 - (hours > 15000 ? (hours-15000)*0.0005 : 0);
    return { hours, eff };
});

// Spectrum Analysis (Waterfall-like)
const SPECTRUM_DATA = [
    { freq: '0.5X', val: 0.5, type: 'Oil Whirl' },
    { freq: '1X', val: 4.2, type: 'Unbalance' },
    { freq: '2X', val: 1.8, type: 'Misalignment' },
    { freq: '3X', val: 0.4, type: 'Looseness' },
    { freq: '5X', val: 2.5, type: 'Vane Pass' }, // Blade pass
    { freq: '10X', val: 0.8, type: 'Bearing' },
];

export const PumpBearingImpellerView: React.FC = () => {
  // --- STATE ---
  const [metrics, setMetrics] = useState({
      rpm: 1480,
      tempUpper: 65.2,
      tempLower: 72.5, // Hotter
      vibration: 4.5, // mm/s
      wearIndex: 45, // %
      efficiency: 89.5, // %
      rul: 4200, // hours
  });

  const [showHousing, setShowHousing] = useState(true);
  const [isSimulating, setIsSimulating] = useState(true);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
        if (!isSimulating) return;
        const t = Date.now() / 1000;
        
        // Dynamic fluctuation
        setMetrics(prev => ({
            ...prev,
            rpm: 1480 + Math.sin(t) * 5,
            tempUpper: 65 + Math.sin(t*0.1) * 1 + Math.random()*0.5,
            tempLower: 72 + Math.sin(t*0.1) * 1.5 + Math.random()*0.5,
            vibration: 4.5 + Math.sin(t*2) * 0.2 + (Math.random()-0.5)*0.5
        }));

    }, 200);
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Derived
  const bearingHealth = Math.max(0, 100 - (metrics.vibration / 10) * 100);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020508] text-cyan-50 p-2 overflow-y-auto custom-scrollbar selection:bg-cyan-500/30">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-cyan-900/40 pb-4 bg-gradient-to-r from-[#0c1220] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Settings size={14} className="animate-spin-slow" />
             Rotating Machinery Prognostics
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             水泵轴承与叶轮 <span className="text-cyan-500">劣化趋势预测</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Bearing Health</div>
                <div className={`text-3xl font-mono font-bold ${bearingHealth < 60 ? 'text-red-500' : 'text-green-400'}`}>
                    {bearingHealth.toFixed(1)}%
                </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Impeller Wear</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.wearIndex.toFixed(0)} <span className="text-sm text-slate-500">%</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Predicted RUL</div>
                <div className="text-2xl font-mono font-bold text-yellow-400">{metrics.rul} <span className="text-sm text-slate-500">hrs</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Bearing Diagnostics */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Bearing Status */}
           <SciFiCard title="轴承状态监测" subtitle="THERMAL & VIB" className="border-cyan-900/50 bg-[#060a12]/80">
               <div className="flex flex-col gap-4">
                   <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-700">
                       <div className="flex items-center gap-2">
                           <Thermometer size={16} className="text-red-400" />
                           <span className="text-xs text-slate-300">Lower Temp</span>
                       </div>
                       <span className="font-mono text-white font-bold">{metrics.tempLower.toFixed(1)}°C</span>
                   </div>
                   
                   <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-700">
                       <div className="flex items-center gap-2">
                           <Thermometer size={16} className="text-orange-400" />
                           <span className="text-xs text-slate-300">Upper Temp</span>
                       </div>
                       <span className="font-mono text-white font-bold">{metrics.tempUpper.toFixed(1)}°C</span>
                   </div>

                   <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-700">
                       <div className="flex items-center gap-2">
                           <Activity size={16} className="text-yellow-400" />
                           <span className="text-xs text-slate-300">Vibration (RMS)</span>
                       </div>
                       <span className="font-mono text-white font-bold">{metrics.vibration.toFixed(2)} mm/s</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Frequency Spectrum */}
           <SciFiCard title="振动频谱特征 (FFT)" className="flex-1 border-cyan-900/50">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={SPECTRUM_DATA} layout="vertical" margin={{left: 10, right: 10}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                           <XAxis type="number" stroke="#64748b" hide />
                           <YAxis dataKey="freq" type="category" stroke="#94a3b8" width={30} tick={{fontSize: 10}} />
                           <Tooltip 
                                cursor={{fill: '#1e293b'}} 
                                contentStyle={{backgroundColor: '#000', borderColor: '#22d3ee'}} 
                                formatter={(value, name, props) => [value, props.payload.type]}
                           />
                           <Bar dataKey="val" fill="#22d3ee" barSize={12} radius={[0, 4, 4, 0]}>
                               {SPECTRUM_DATA.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.freq === '1X' ? '#ef4444' : '#22d3ee'} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
                   <div className="text-[10px] text-center text-slate-500 mt-2">
                       High 1X indicates potential unbalance or bent shaft.
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#020204] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(34,211,238,0.1)]">
               
               {/* Controls */}
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                   <button 
                     onClick={() => setShowHousing(!showHousing)}
                     className={`px-3 py-1 rounded text-xs border transition-colors ${showHousing ? 'bg-cyan-600 border-cyan-400 text-black' : 'bg-black/50 border-slate-700 text-slate-400'}`}
                   >
                       Toggle Housing
                   </button>
               </div>

               {/* Alert Overlay */}
               {metrics.vibration > 4.0 && (
                   <div className="absolute bottom-4 right-4 z-10">
                       <div className="bg-red-900/80 px-4 py-2 rounded-full border border-red-500 text-white animate-pulse flex items-center gap-2">
                           <AlertTriangle size={16} /> 
                           <span className="text-xs font-bold">VIBRATION ALERT</span>
                       </div>
                   </div>
               )}

               <PumpBearingScene 
                   rpm={metrics.rpm}
                   bearingTempUpper={metrics.tempUpper}
                   bearingTempLower={metrics.tempLower}
                   impellerWear={metrics.wearIndex}
                   vibrationAmp={metrics.vibration}
                   showHousing={showHousing}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Vibration Trend Chart */}
           <SciFiCard title="振动劣化趋势预测 (Vibration Trend)" subtitle="RUL ESTIMATION" className="h-[250px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={VIB_TREND}>
                           <defs>
                               <linearGradient id="vibFill" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Vib (mm/s)', angle: -90, position: 'insideLeft', fontSize: 10 }} domain={[0, 10]} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#ef4444', color: '#fff'}} />
                           <ReferenceLine y={7.1} stroke="red" strokeDasharray="3 3" label={{value: 'Trip', fill: 'red', fontSize: 10}} />
                           
                           <Area type="monotone" dataKey="actual" stroke="#22d3ee" fill="url(#vibFill)" strokeWidth={2} name="History" />
                           <Line type="monotone" dataKey="predict" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Prediction" />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Impeller & Efficiency */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Efficiency Curve */}
           <SciFiCard title="叶轮效率衰减曲线" subtitle="WEAR IMPACT" className="h-[300px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4 flex flex-col">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={EFF_CURVE}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                               <XAxis dataKey="hours" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Operating Hours', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[80, 100]} />
                               <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#22d3ee'}} />
                               <Line type="monotone" dataKey="eff" stroke="#10b981" strokeWidth={2} dot={false} />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="text-[10px] text-center text-slate-500 mt-1">
                       Current Eff: <span className="text-white font-bold">{metrics.efficiency.toFixed(1)}%</span> (Gap increased +0.5mm)
                   </div>
               </div>
           </SciFiCard>

           {/* Diagnostics */}
           <SciFiCard title="叶轮状态诊断" className="flex-1 border-cyan-900/50">
               <div className="flex flex-col gap-4">
                   <div className="p-3 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
                           <Disc size={14} className="text-orange-400" /> Wear Pattern
                       </div>
                       <p className="text-[10px] text-slate-400">
                           Leading edge erosion detected. Cavitation signature present in high frequency spectrum.
                       </p>
                   </div>

                   <div className="space-y-2">
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Balancing Grade</span>
                           <span className="text-yellow-400 font-bold">G6.3</span>
                       </div>
                       <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="bg-yellow-500 h-full" style={{width: '60%'}}></div>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Seal Ring Clearance</span>
                           <span className="text-white font-bold">0.8 mm</span>
                       </div>
                   </div>

                   <button className="mt-auto w-full py-2 bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-500/50 rounded text-xs text-cyan-200 transition-colors flex items-center justify-center gap-2">
                       <ShieldAlert size={12} /> Schedule Balancing
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
