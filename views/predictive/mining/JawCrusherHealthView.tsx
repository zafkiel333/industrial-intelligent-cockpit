
import React, { useState, useEffect } from 'react';
import { JawCrusherThreeScene } from '../../../components/predictive/mining-jaw-crusher/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-mining-20]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-mining-20';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Cell, ComposedChart, Legend
} from 'recharts';
import { 
  Hammer, Activity, Zap, TrendingUp, 
  AlertTriangle, Settings, Scale, 
  RotateCw, Layers, Maximize2, Minimize2,
  PieChart as PieIcon, ArrowDown, ScanLine, FileText, Box
} from 'lucide-react';

// --- Mock Data ---

// 1. Crushing Force Distribution (Along Jaw Height)
const FORCE_DISTRIBUTION = Array.from({length: 20}, (_, i) => ({
    height: `${(i*5)}%`, // Top to Bottom
    force: 100 + i * 20 + Math.random() * 50, // Force increases towards discharge
    wear: i > 15 ? 85 : 20 + i * 2 // Wear concentrated at bottom
}));

// 2. Health Radar (Six Dimensions)
const HEALTH_RADAR = [
    { subject: '动颚衬板', A: 72, fullMark: 100 }, // Worn
    { subject: '定颚衬板', A: 85, fullMark: 100 },
    { subject: '偏心轴承', A: 92, fullMark: 100 },
    { subject: '肘板状态', A: 98, fullMark: 100 },
    { subject: '机架应力', A: 88, fullMark: 100 },
    { subject: '排料口', A: 65, fullMark: 100 }, // Needs adjustment
];

// 3. Throughput & Power
const PROD_DATA = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    tph: 450 + Math.sin(i*0.5)*50 + Math.random()*20,
    power: 180 + Math.sin(i*0.5)*30
}));

// 4. Vibration Spectrum (Bearing Health)
const VIB_DATA = [
    { freq: '1X', val: 2.5 },
    { freq: '2X', val: 0.8 },
    { freq: '3X', val: 0.3 },
    { freq: 'BPFO', val: 4.2 }, // Bearing Outer Race Fault?
    { freq: 'BPFI', val: 1.1 },
];

export const JawCrusherHealthView: React.FC = () => {
  // --- State ---
  const [rpm, setRpm] = useState(240);
  const [css, setCss] = useState(120); // mm
  const [load, setLoad] = useState(85); // %
  const [viewMode, setViewMode] = useState<'solid' | 'stress' | 'wear'>('solid');
  const [healthScore, setHealthScore] = useState(82.4);
  const [isCrushing, setIsCrushing] = useState(true);

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        const t = Date.now() / 1000;
        setLoad(85 + Math.sin(t) * 10);
        setRpm(240 + Math.cos(t) * 5);
        // Random vibration spike
        if (Math.random() > 0.95) setHealthScore(prev => Math.max(60, prev - 0.1));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#0c0a09] text-stone-200 p-2 overflow-y-auto custom-scrollbar selection:bg-orange-500/30">
      
      {/* HEADER: Heavy Industrial Style */}
      <div className="flex justify-between items-end border-b border-orange-900/40 pb-4 bg-gradient-to-r from-[#1c1917] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-3 bg-stone-800/50 rounded-lg border border-orange-600/50 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                <Hammer size={32} className="text-orange-500 animate-pulse" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 uppercase tracking-widest font-bold">
                    <Activity size={14} /> Primary Crushing Intelligence
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    颚式破碎机 <span className="text-stone-500 font-light">|</span> <span className="text-orange-500">整机健康总览</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase tracking-widest">综合健康评分</div>
                <div className={`text-4xl font-mono font-bold ${healthScore > 80 ? 'text-green-500' : 'text-yellow-500'}`}>
                    {healthScore.toFixed(1)}
                </div>
            </div>
            <div className="h-10 w-[1px] bg-stone-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase">累计运行工时</div>
                <div className="text-3xl font-mono font-bold text-white">12,458 <span className="text-sm text-stone-500">h</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-stone-800 pl-8">
                <div className="text-[10px] text-stone-500 uppercase font-bold text-orange-400">设备状态</div>
                <div className="flex items-center gap-2 text-xl font-bold text-white uppercase">
                    <RotateCw size={20} className="text-green-500 animate-spin" /> RUNNING
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Mechanics & Stress */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* Crushing Force Profile */}
           <SciFiCard title="破碎力沿程分布 (Force Profile)" subtitle="JAW HEIGHT" className="flex-1 border-orange-900/40 bg-[#1c1917]/60">
               <div className="h-full w-full relative p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={FORCE_DISTRIBUTION} layout="vertical">
                           <CartesianGrid strokeDasharray="3 3" stroke="#44403c" horizontal={false} />
                           <XAxis type="number" stroke="#a8a29e" tick={{fontSize: 9}} label={{ value: 'Force (kN)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                           <YAxis dataKey="height" type="category" stroke="#a8a29e" tick={{fontSize: 9}} width={40} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316'}} />
                           <Bar dataKey="force" barSize={10} radius={[0, 4, 4, 0]}>
                               {FORCE_DISTRIBUTION.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.force > 150 ? '#ef4444' : '#f97316'} />
                               ))}
                           </Bar>
                           <Line type="monotone" dataKey="wear" stroke="#3b82f6" strokeWidth={2} dot={false} name="Wear %" />
                       </ComposedChart>
                   </ResponsiveContainer>
                   <div className="absolute top-2 right-2 text-[10px] text-stone-500 bg-black/60 px-2 py-1 rounded">
                       Bottom Zone Stress Critical
                   </div>
               </div>
           </SciFiCard>

           {/* Toggle Plate Status */}
           <SciFiCard title="肘板负荷监测" subtitle="SAFETY FUSE" className="h-[200px] border-orange-900/40">
               <div className="flex flex-col gap-4 h-full justify-center">
                   <div className="flex justify-between items-center text-sm">
                       <span className="text-stone-400">Load Percentage</span>
                       <span className="text-white font-bold font-mono">{(load * 0.9).toFixed(1)}%</span>
                   </div>
                   <div className="w-full h-4 bg-stone-800 rounded-full overflow-hidden relative border border-stone-700">
                       <div className="absolute left-[85%] top-0 h-full w-0.5 bg-red-500 z-10"></div> {/* Trip limit */}
                       <div className={`h-full transition-all duration-300 ${load > 90 ? 'bg-red-500' : 'bg-orange-500'}`} style={{width: `${load * 0.9}%`}}></div>
                   </div>
                   <div className="flex gap-2 text-[10px] text-stone-500 mt-1">
                       <AlertTriangle size={12} className={load > 90 ? 'text-red-500' : 'text-stone-600'} />
                       <span>Safety Fuse Limit: 95%</span>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* MIDDLE: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Viewport */}
           <div className="flex-1 min-h-[450px] bg-[#050403] border border-orange-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(234,88,12,0.15)] group">
               
               {/* Controls */}
               <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                   <button onClick={() => setViewMode('solid')} className={`p-2 rounded border transition-colors ${viewMode === 'solid' ? 'bg-orange-600 text-white' : 'bg-black/60 text-stone-400'}`}>
                       <Box size={16} />
                   </button>
                   <button onClick={() => setViewMode('stress')} className={`p-2 rounded border transition-colors ${viewMode === 'stress' ? 'bg-orange-600 text-white' : 'bg-black/60 text-stone-400'}`}>
                       <Layers size={16} />
                   </button>
                   <button onClick={() => setViewMode('wear')} className={`p-2 rounded border transition-colors ${viewMode === 'wear' ? 'bg-orange-600 text-white' : 'bg-black/60 text-stone-400'}`}>
                       <ScanLine size={16} />
                   </button>
               </div>

               {/* Left HUD: Settings */}
               <div className="absolute top-4 left-4 z-10 space-y-2">
                   <div className="bg-black/60 backdrop-blur border border-orange-900/30 px-3 py-2 rounded">
                       <div className="text-[10px] text-orange-400 font-bold uppercase mb-1 flex items-center gap-2">
                           <Settings size={12} /> CSS Setting
                       </div>
                       <div className="text-2xl font-mono font-bold text-white">{css} <span className="text-xs text-stone-500">mm</span></div>
                   </div>
               </div>

               <JawCrusherThreeScene 
                   state={{
                       rpm,
                       jawAngle: 0,
                       load,
                       css,
                       temperature: 65,
                       wearMap: []
                   }}
                   isRunning={isCrushing}
                   viewMode={viewMode}
                   onPartSelect={() => {}}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

               {/* Bottom Status */}
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                   <div className="px-4 py-1 bg-stone-900/80 rounded-full border border-stone-600 text-xs font-mono text-stone-300 flex items-center gap-2">
                       ECCENTRIC SHAFT: {rpm.toFixed(0)} RPM
                   </div>
               </div>
           </div>

           {/* Production Trend */}
           <SciFiCard title="台时产量与能耗趋势" subtitle="TPH vs KW" className="h-[250px] border-orange-900/40" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={PROD_DATA}>
                           <defs>
                               <linearGradient id="prodFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                           <XAxis dataKey="time" stroke="#78716c" tick={{fontSize: 9}} interval={4} />
                           <YAxis yAxisId="left" stroke="#f97316" tick={{fontSize: 9}} />
                           <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tick={{fontSize: 9}} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316'}} />
                           <Legend wrapperStyle={{fontSize: '10px'}} />
                           <Area yAxisId="left" type="monotone" dataKey="tph" stroke="#f97316" fill="url(#prodFill)" name="Production (t/h)" />
                           <Line yAxisId="right" type="monotone" dataKey="power" stroke="#3b82f6" strokeWidth={2} dot={false} name="Power (kW)" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Diagnostics */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Component Health Radar */}
           <SciFiCard title="组件健康多维扫描" subtitle="HEALTH RADAR" className="h-[300px] border-orange-900/40">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={HEALTH_RADAR}>
                           <PolarGrid stroke="#292524" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#a8a29e', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Health" dataKey="A" stroke="#f97316" strokeWidth={2} fill="#f97316" fillOpacity={0.4} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316'}} />
                       </RadarChart>
                   </ResponsiveContainer>
                   <div className="text-center text-[10px] text-stone-500 mt-[-10px]">
                       Attention: Discharge Opening Wear
                   </div>
               </div>
           </SciFiCard>

           {/* Maintenance Action */}
           <SciFiCard title="智能维护建议" className="flex-1 border-orange-900/40">
               <div className="flex flex-col gap-3 h-full">
                   <div className="p-3 bg-red-900/10 border border-red-900/30 rounded flex items-start gap-2">
                       <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                       <div>
                           <div className="text-xs font-bold text-red-300">Liner Wear Alert</div>
                           <p className="text-[10px] text-stone-400">Movable jaw plate bottom section reached 85% wear limit. Schedule rotation or replacement.</p>
                       </div>
                   </div>
                   
                   <div className="space-y-2 mt-2">
                       <div className="flex justify-between items-center text-xs border-b border-stone-800 pb-1">
                           <span className="text-stone-400">Est. Remaining Life</span>
                           <span className="text-white font-mono">145 hrs</span>
                       </div>
                       <div className="flex justify-between items-center text-xs border-b border-stone-800 pb-1">
                           <span className="text-stone-400">Bearing Vibration</span>
                           <span className="text-green-400">Normal</span>
                       </div>
                   </div>

                   <button className="mt-auto w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded border border-stone-600 transition-colors flex items-center justify-center gap-2">
                       <FileText size={14} /> Create Work Order
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
