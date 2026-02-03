
import React, { useState, useEffect } from 'react';
import { TransformerScene } from '../../../components/predictive/hydro-transformer/ThreeScene';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, LineChart, Line, ComposedChart, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from 'recharts';
import { 
  Zap, Thermometer, Droplets, Wind, Activity, 
  AlertTriangle, ShieldCheck, Box, Eye, Layers,
  Binary, FileText, CheckCircle2
} from 'lucide-react';

// --- Mock Data ---

// DGA (Dissolved Gas Analysis)
const DGA_DATA = [
    { gas: 'H2', ppm: 15, limit: 100, status: 'Normal' },
    { gas: 'CH4', ppm: 8, limit: 50, status: 'Normal' },
    { gas: 'C2H6', ppm: 5, limit: 50, status: 'Normal' },
    { gas: 'C2H4', ppm: 12, limit: 50, status: 'Normal' },
    { gas: 'C2H2', ppm: 0, limit: 1, status: 'Normal' }, // Acetylene is critical
    { gas: 'CO', ppm: 250, limit: 500, status: 'Normal' },
    { gas: 'CO2', ppm: 1200, limit: 2500, status: 'Normal' },
];

const HEALTH_TREND = Array.from({length: 30}, (_, i) => ({
    day: i + 1,
    hi: 98 - (i * 0.05) - Math.random() * 0.2, // Health Index
    load: 60 + Math.sin(i * 0.5) * 20
}));

const BUSHING_DATA = [
    { phase: 'A', tanDelta: 0.32, cap: 102.5, status: 'Good' },
    { phase: 'B', tanDelta: 0.35, cap: 102.8, status: 'Good' },
    { phase: 'C', tanDelta: 0.45, cap: 103.2, status: 'Watch' }, // Slightly higher
];

export const MainTransformerHealthView: React.FC = () => {
  // --- STATE ---
  const [metrics, setMetrics] = useState({
    oilTemp: 55.4,
    windingTempHV: 68.2,
    windingTempLV: 62.5,
    load: 78.5, // %
    oilLevel: 52, // %
    voltage: 505.2, // kV
    current: 1250, // A
    pd: 120, // pC (Partial Discharge)
    coreVib: 25, // um
  });

  const [viewMode, setViewMode] = useState<'standard' | 'thermal' | 'internal'>('standard');
  const [fansRunning, setFansRunning] = useState(true);
  const [healthIndex, setHealthIndex] = useState(94.5);

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setMetrics(prev => {
            const loadFactor = (prev.load / 100);
            return {
                ...prev,
                load: 78.5 + Math.sin(Date.now()/5000) * 5,
                oilTemp: 55 + loadFactor * 5 + (Math.random()-0.5)*0.2,
                windingTempHV: 68 + loadFactor * 8 + (Math.random()-0.5)*0.3,
                windingTempLV: 62 + loadFactor * 6 + (Math.random()-0.5)*0.3,
                pd: 120 + (Math.random()-0.5) * 10,
                coreVib: 25 + (Math.random()-0.5) * 2
            };
        });
        
        // Randomly toggle fans for visual effect
        if (Math.random() > 0.98) setFansRunning(prev => !prev);

    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020204] text-violet-50 p-2 overflow-y-auto custom-scrollbar selection:bg-violet-500/30">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-violet-900/40 pb-4 bg-gradient-to-r from-[#1a052e] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-violet-400 mb-1 uppercase tracking-wider">
             <Zap size={14} className="animate-pulse" />
             HV Equipment Monitoring
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             主变压器 <span className="text-violet-500">运行健康状态总览</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Health Index</div>
                <div className="text-3xl font-mono font-bold text-green-400">{healthIndex.toFixed(1)} <span className="text-sm text-slate-500">/ 100</span></div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Total Load</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.load.toFixed(1)} <span className="text-sm text-slate-500">%</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Est. Rem. Life</div>
                <div className="text-2xl font-mono font-bold text-yellow-400">18.5 <span className="text-sm text-slate-500">Years</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Thermal & Chemical */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Thermal Profile */}
           <SciFiCard title="热场分布监测 (Thermal)" subtitle="HST & OIL" className="border-violet-900/50 bg-[#0a0510]/80">
               <div className="flex flex-col gap-4">
                   <div className="grid grid-cols-2 gap-3">
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                           <div className="flex items-center gap-2 text-xs text-slate-400 mb-1"><Thermometer size={12} className="text-red-500"/> Winding HV</div>
                           <div className="text-xl font-bold text-white">{metrics.windingTempHV.toFixed(1)} °C</div>
                           <div className="w-full h-1 bg-slate-800 rounded mt-1"><div className="h-full bg-red-500" style={{width: `${metrics.windingTempHV/120*100}%`}}></div></div>
                       </div>
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                           <div className="flex items-center gap-2 text-xs text-slate-400 mb-1"><Thermometer size={12} className="text-orange-500"/> Top Oil</div>
                           <div className="text-xl font-bold text-white">{metrics.oilTemp.toFixed(1)} °C</div>
                           <div className="w-full h-1 bg-slate-800 rounded mt-1"><div className="h-full bg-orange-500" style={{width: `${metrics.oilTemp/100*100}%`}}></div></div>
                       </div>
                   </div>
                   
                   <div className="flex items-center justify-between p-2 border-t border-slate-800">
                       <div className="text-xs text-slate-400">Cooling Efficiency</div>
                       <div className="text-sm font-bold text-green-400">98%</div>
                   </div>
                   <div className="flex items-center gap-2 text-xs text-slate-500">
                       <Wind size={12} className={fansRunning ? "text-green-500 animate-spin" : "text-slate-600"} />
                       Fans: {fansRunning ? 'RUNNING' : 'IDLE'}
                   </div>
               </div>
           </SciFiCard>

           {/* DGA Analysis */}
           <SciFiCard title="油色谱分析 (DGA)" subtitle="GAS PPM" className="flex-1 border-violet-900/50">
               <div className="h-full w-full flex flex-col">
                   <div className="flex-1 min-h-[200px]">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={DGA_DATA} layout="vertical" margin={{left: 0}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" horizontal={false} />
                               <XAxis type="number" stroke="#64748b" hide />
                               <YAxis dataKey="gas" type="category" stroke="#a78bfa" width={40} tick={{fontSize: 10}} />
                               <Tooltip 
                                  cursor={{fill: '#2e1065'}}
                                  contentStyle={{backgroundColor: '#05030a', borderColor: '#8b5cf6', color: '#fff'}}
                               />
                               <Bar dataKey="ppm" barSize={12} radius={[0, 4, 4, 0]}>
                                   {DGA_DATA.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.gas === 'C2H2' && entry.ppm > 0.5 ? '#ef4444' : entry.ppm > entry.limit * 0.8 ? '#f59e0b' : '#8b5cf6'} />
                                   ))}
                               </Bar>
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="mt-2 p-2 bg-slate-900/50 rounded text-xs border border-slate-700">
                       <span className="text-slate-400 font-bold">Duval Diagnosis:</span> <span className="text-green-400">T1 (Thermal Fault &lt; 300°C) - Stable</span>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[450px] bg-[#050208] border border-violet-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(139,92,246,0.1)] group">
               
               {/* Controls Overlay */}
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                   <button 
                     onClick={() => setViewMode('standard')}
                     className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${viewMode === 'standard' ? 'bg-violet-600 border-violet-400 text-white' : 'bg-black/50 border-slate-700 text-slate-400 hover:text-white'}`}
                   >
                       Standard
                   </button>
                   <button 
                     onClick={() => setViewMode('thermal')}
                     className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${viewMode === 'thermal' ? 'bg-orange-600 border-orange-400 text-white' : 'bg-black/50 border-slate-700 text-slate-400 hover:text-white'}`}
                   >
                       Thermal
                   </button>
                   <button 
                     onClick={() => setViewMode('internal')}
                     className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${viewMode === 'internal' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-black/50 border-slate-700 text-slate-400 hover:text-white'}`}
                   >
                       Internal
                   </button>
               </div>

               {/* Right HUD */}
               <div className="absolute top-4 right-4 z-10 space-y-2 text-right">
                   <div className="bg-black/60 backdrop-blur px-3 py-2 rounded border border-violet-500/20">
                       <div className="text-[10px] text-slate-400 uppercase mb-1">Partial Discharge</div>
                       <div className="text-xl font-bold text-violet-300 font-mono">{metrics.pd.toFixed(0)} <span className="text-xs">pC</span></div>
                   </div>
                   <div className="bg-black/60 backdrop-blur px-3 py-2 rounded border border-violet-500/20">
                       <div className="text-[10px] text-slate-400 uppercase mb-1">Core Vibration</div>
                       <div className="text-xl font-bold text-white font-mono">{metrics.coreVib.toFixed(1)} <span className="text-xs">µm</span></div>
                   </div>
               </div>

               <TransformerScene 
                   oilTemp={metrics.oilTemp}
                   windingTempHV={metrics.windingTempHV}
                   windingTempLV={metrics.windingTempLV}
                   oilLevel={metrics.oilLevel}
                   isFansRunning={fansRunning}
                   coreVibration={metrics.coreVib}
                   viewMode={viewMode}
               />
           </div>

           {/* Health Trend Chart */}
           <SciFiCard title="健康指数演化 (Health Trend)" subtitle="30 DAYS" className="h-[220px] border-violet-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={HEALTH_TREND}>
                           <defs>
                               <linearGradient id="colorHi" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" vertical={false} />
                           <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis yAxisId="left" stroke="#10b981" tick={{fontSize: 10}} domain={[80, 100]} />
                           <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#05030a', borderColor: '#8b5cf6', color: '#fff'}} />
                           <Legend wrapperStyle={{fontSize: '10px'}} />
                           
                           <Area yAxisId="left" type="monotone" dataKey="hi" stroke="#10b981" fill="url(#colorHi)" name="Health Index" />
                           <Line yAxisId="right" type="monotone" dataKey="load" stroke="#f59e0b" strokeWidth={1} dot={false} name="Load %" />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Bushings & Diagnosis */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Bushing Health */}
           <SciFiCard title="套管绝缘监测 (OIP Bushing)" subtitle="TAN DELTA" className="border-violet-900/50">
               <div className="flex flex-col gap-3">
                   {BUSHING_DATA.map((b, i) => (
                       <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 border border-slate-800 rounded">
                           <div className="flex items-center gap-3">
                               <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-violet-400 border border-violet-900">
                                   {b.phase}
                               </div>
                               <div>
                                   <div className="text-xs text-slate-300">Tan δ: {b.tanDelta}%</div>
                                   <div className="text-[10px] text-slate-500">Cap: {b.cap} pF</div>
                               </div>
                           </div>
                           <div className={`text-xs px-2 py-0.5 rounded font-bold ${b.status === 'Good' ? 'text-green-400 bg-green-900/20' : 'text-yellow-400 bg-yellow-900/20'}`}>
                               {b.status}
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Insulation Aging */}
           <SciFiCard title="绝缘老化评估" subtitle="PAPER INSULATION" className="border-violet-900/50">
               <div className="flex flex-col gap-4">
                   <div className="flex justify-between items-center text-xs text-slate-400">
                       <span>DP (聚合度)</span>
                       <span className="text-white font-bold">850</span>
                   </div>
                   <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                       <div className="bg-gradient-to-r from-green-500 to-yellow-500 h-full" style={{width: '75%'}}></div>
                   </div>
                   <div className="flex justify-between text-[10px] text-slate-500">
                       <span>New (1200)</span>
                       <span>End of Life (200)</span>
                   </div>
                   
                   <div className="p-2 bg-violet-900/10 border border-violet-500/20 rounded text-xs text-violet-200 mt-2">
                       <div className="flex items-center gap-2 mb-1 font-bold"><Binary size={12}/> Furfural Analysis</div>
                       Furfural content 0.15 mg/L indicates slow aging rate. Est. remaining life &gt; 18 years.
                   </div>
               </div>
           </SciFiCard>

           {/* Maintenance Actions */}
           <SciFiCard title="维护决策建议" className="flex-1 border-violet-900/50">
               <div className="space-y-3">
                   <div className="flex items-start gap-2 p-2 bg-yellow-900/10 border border-yellow-900/30 rounded">
                       <AlertTriangle size={14} className="text-yellow-500 mt-0.5" />
                       <div>
                           <div className="text-xs text-yellow-200 font-bold">Watchlist: C-Phase Bushing</div>
                           <p className="text-[10px] text-slate-400">Tan delta showing slight upward trend. Schedule offline test in 3 months.</p>
                       </div>
                   </div>
                   
                   <button className="w-full py-2 bg-violet-700/30 hover:bg-violet-600/50 border border-violet-500/50 rounded text-xs text-violet-100 transition-colors flex items-center justify-center gap-2">
                       <FileText size={12} /> Generate Health Report
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
