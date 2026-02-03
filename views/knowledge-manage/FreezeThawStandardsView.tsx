
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Snowflake, Thermometer, Shield, Layers, 
  Wind, Droplets, Activity, FileText, 
  CheckCircle2, AlertTriangle, ArrowRight,
  Database, Gauge, Zap
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  LineChart, Line, BarChart, Bar, ReferenceLine, ScatterChart, Scatter, ZAxis
} from 'recharts';

// --- MOCK DATA ---

// Temperature & Freeze-Thaw Cycles
const TEMP_DATA = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    airTemp: -15 + Math.sin((i-6)*0.26) * 10 - Math.random()*2, // Diurnal cycle -25 to -5
    concreteTemp: -2 + Math.sin((i-8)*0.26) * 2, // Thermal lag
    freezePoint: 0
}));

// Ice Thickness Growth
const ICE_GROWTH = [
    { day: 'D1', thick: 5 }, { day: 'D2', thick: 12 },
    { day: 'D3', thick: 18 }, { day: 'D4', thick: 24 },
    { day: 'D5', thick: 28 }, { day: 'D6', thick: 32 },
    { day: 'D7', thick: 35 },
];

// Standards Database
const STANDARDS_DB = [
    { id: 'SL 211-2006', title: '水工建筑物抗冰冻设计规范', type: 'Design', status: 'Active' },
    { id: 'GB/T 50666', title: '混凝土结构工程施工规范 (冬施)', type: 'Construction', status: 'Active' },
    { id: 'DL/T 5150', title: '水工混凝土试验规程', type: 'Testing', status: 'Active' },
    { id: 'ISO 1920-9', title: 'Concrete Durability - Freeze/Thaw', type: 'Intl', status: 'Ref' },
];

// Concrete Mix Durability
const CONCRETE_MIX = [
    { name: 'C30-F200', df: 85, cost: 450, strength: 35 },
    { name: 'C40-F300', df: 92, cost: 520, strength: 45 },
    { name: 'C50-F400', df: 96, cost: 600, strength: 55 }, // High performance
];

// Active System Status
const ANTI_ICING_SYSTEMS = [
    { name: '压力水吹冰 (Bubbler)', status: 'Running', load: 85, eff: 'High' },
    { name: '电热缆加热 (Heating)', status: 'Standby', load: 0, eff: '-' },
    { name: '潜水泵扰冰 (Pump)', status: 'Running', load: 60, eff: 'Med' },
];

// --- COMPONENTS ---

// Visualizing Ice Pressure on Dam Face
const IcePressureVisual = ({ thickness }: { thickness: number }) => {
    return (
        <div className="w-full h-full relative bg-[#0f172a] rounded border border-cyan-900/30 overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 300 200">
                <defs>
                    <linearGradient id="iceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#cffafe" stopOpacity="0.9"/>
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.6"/>
                    </linearGradient>
                    <pattern id="concrete" width="10" height="10" patternUnits="userSpaceOnUse">
                         <rect width="10" height="10" fill="#334155"/>
                         <path d="M0 10 L10 0" stroke="#475569" strokeWidth="1"/>
                    </pattern>
                </defs>
                
                {/* Dam Wall */}
                <path d="M50,20 L50,180 L100,180 L80,20 Z" fill="url(#concrete)" stroke="#94a3b8" />
                
                {/* Water */}
                <rect x="0" y="80" width="50" height="100" fill="#0ea5e9" fillOpacity="0.3" />
                
                {/* Ice Sheet */}
                <rect x="0" y={80 - thickness} width="50" height={thickness} fill="url(#iceGrad)" stroke="white" strokeWidth="1" />
                
                {/* Pressure Distribution (Triangular) */}
                <path d={`M50,${80-thickness} L50,80 L${50 + thickness * 1.5},${80 - thickness/2} Z`} fill="rgba(239, 68, 68, 0.4)" stroke="#ef4444" strokeDasharray="2 2" />
                
                {/* Text Labels */}
                <text x="110" y="50" fill="#cbd5e1" fontSize="10">Dam Structure</text>
                <text x="10" y="70" fill="#cffafe" fontSize="10">Ice Sheet ({thickness}px)</text>
                <text x="90" y={80} fill="#ef4444" fontSize="10">Pressure Zone</text>
                
                {/* Measuring Line */}
                <line x1="5" y1={80-thickness} x2="5" y2={80} stroke="white" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
            </svg>
        </div>
    );
};

export const FreezeThawStandardsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('design');
  const [iceThickness, setIceThickness] = useState(25); // visual px
  const [simRunning, setSimRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (simRunning) {
        interval = setInterval(() => {
            setIceThickness(prev => {
                if (prev > 45) return 10;
                return prev + 0.5;
            });
        }, 100);
    }
    return () => clearInterval(interval);
  }, [simRunning]);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#080c14] p-2 relative overflow-hidden">
      
      {/* Frozen Texture Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/snow.png')]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-[#080c14] pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-cyan-500/30 p-4 rounded-lg backdrop-blur-xl z-10 shadow-lg">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-cyan-900/20 border-2 border-cyan-400 rounded flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(34,211,238,0.3)]">
             <Snowflake size={30} className="text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Shield size={12} /> Cold Region Engineering
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               寒冷地区 <span className="text-cyan-400 italic">防冻融技术规范库</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Ambient Temp</div>
                <div className="text-3xl font-mono font-black text-blue-200">-18.5 <span className="text-sm font-normal text-slate-600">°C</span></div>
             </div>
             <div className="h-10 w-[1px] bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Ice Thickness</div>
                <div className="text-3xl font-mono font-black text-white">42 <span className="text-sm font-normal text-slate-600">cm</span></div>
             </div>
             <div className="h-10 w-[1px] bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Freeze Index</div>
                <div className="text-2xl font-mono font-black text-yellow-400">F300</div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Environmental Stress --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="冻融循环监测 (Cycles)" subtitle="METEOROLOGY" className="border-cyan-900/30 bg-[#0b1221]/80">
              <div className="h-[200px] w-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={TEMP_DATA}>
                          <defs>
                              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[-30, 10]} />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9'}} />
                          <ReferenceLine y={0} stroke="#fff" strokeDasharray="3 3" />
                          <Area type="monotone" dataKey="airTemp" stroke="#0ea5e9" fill="url(#colorTemp)" strokeWidth={2} name="Air Temp" />
                          <Line type="monotone" dataKey="concreteTemp" stroke="#f59e0b" strokeWidth={2} dot={false} name="Concrete Core" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
              <div className="px-4 pb-2 text-[10px] text-slate-400 flex justify-between">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Air Temp</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Structure Temp</span>
              </div>
           </SciFiCard>

           <SciFiCard title="冰层生长预测" subtitle="THICKNESS" className="flex-1 border-cyan-900/30">
               <div className="h-full flex flex-col gap-2">
                   <div className="flex-1 min-h-[150px]">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={ICE_GROWTH} layout="vertical">
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                               <XAxis type="number" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis dataKey="day" type="category" stroke="#94a3b8" width={30} tick={{fontSize: 10}} />
                               <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#cbd5e1'}} />
                               <Bar dataKey="thick" fill="#cbd5e1" barSize={10} radius={[0, 4, 4, 0]} name="Thickness (cm)" />
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
                   
                   <div className="p-3 bg-cyan-900/20 border border-cyan-800/30 rounded">
                       <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold mb-1">
                           <AlertTriangle size={14} /> 冰压力预警
                       </div>
                       <p className="text-[10px] text-slate-400">
                           预计未来 48 小时静冰压力将达到 <span className="text-white font-mono">150 kN/m</span>。建议开启二号吹冰系统。
                       </p>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* --- CENTER: Technical Standards & Simulation --- */}
        <div className="flex-1 flex flex-col gap-4">
           
           {/* Interactive Simulation Window */}
           <div className="flex-1 bg-[#050810] border border-cyan-700/30 rounded-lg overflow-hidden relative shadow-2xl flex flex-col">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-600 to-blue-600 z-20"></div>
               
               {/* Controls */}
               <div className="absolute top-4 left-4 z-20 flex gap-2">
                   <button 
                     onClick={() => setSimRunning(!simRunning)}
                     className={`px-3 py-1.5 rounded border text-xs font-bold flex items-center gap-2 transition-all
                         ${simRunning ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-slate-900/80 text-cyan-400 border-cyan-900 hover:border-cyan-500'}
                     `}
                   >
                       <Activity size={14} className={simRunning ? "animate-spin" : ""} />
                       {simRunning ? 'SIMULATING...' : 'RUN SIMULATION'}
                   </button>
               </div>

               <div className="absolute top-4 right-4 z-20">
                   <div className="bg-black/60 backdrop-blur px-3 py-1 rounded border border-slate-700 text-[10px] text-slate-300">
                       Static Ice Pressure Model (S-IPM)
                   </div>
               </div>

               {/* Visualization Area */}
               <div className="flex-1 p-8 flex items-center justify-center relative">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.05),transparent)]"></div>
                   <IcePressureVisual thickness={iceThickness} />
               </div>

               {/* Bottom Info Bar */}
               <div className="h-12 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between px-6 text-xs">
                   <div className="flex gap-6">
                       <span className="text-slate-400">Structure: <span className="text-white">Gravity Dam</span></span>
                       <span className="text-slate-400">Material: <span className="text-white">C35 Concrete</span></span>
                   </div>
                   <div className="flex gap-2">
                       <span className="text-cyan-500">Calculated Stress:</span>
                       <span className="font-mono font-bold text-white">{(iceThickness * 2.5).toFixed(1)} kPa</span>
                   </div>
               </div>
           </div>

           {/* Standards & Specs Grid */}
           <SciFiCard title="技术规范与材料库" subtitle="DATABASE" className="h-[280px] border-cyan-900/30">
               <div className="h-full flex flex-col gap-4">
                   {/* Tabs */}
                   <div className="flex border-b border-slate-700">
                       {['Design', 'Material', 'Construction'].map(tab => (
                           <button 
                             key={tab}
                             onClick={() => setActiveTab(tab.toLowerCase())}
                             className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${activeTab === tab.toLowerCase() ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                           >
                               {tab} Standards
                           </button>
                       ))}
                   </div>

                   {/* Content List */}
                   <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                       {STANDARDS_DB.filter(s => activeTab === 'all' || true).map((std, i) => (
                           <div key={i} className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-cyan-500/30 transition-all group cursor-pointer">
                               <div className="flex items-center gap-3">
                                   <div className="p-2 bg-slate-800 rounded text-slate-400 group-hover:text-cyan-400 transition-colors">
                                       <FileText size={16} />
                                   </div>
                                   <div>
                                       <div className="text-sm font-bold text-slate-200 group-hover:text-white">{std.id}</div>
                                       <div className="text-[10px] text-slate-500">{std.title}</div>
                                   </div>
                               </div>
                               <div className="flex items-center gap-3">
                                   <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">{std.type}</span>
                                   <ArrowRight size={14} className="text-slate-600 group-hover:text-cyan-500" />
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* --- RIGHT: Operations & Strategy --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4">
           
           {/* Anti-icing Systems */}
           <SciFiCard title="主动防冰系统状态" subtitle="SYSTEMS" className="border-cyan-900/30">
               <div className="space-y-4">
                   {ANTI_ICING_SYSTEMS.map((sys, i) => (
                       <div key={i} className="relative">
                           <div className="flex justify-between items-center mb-1">
                               <div className="flex items-center gap-2">
                                   <Zap size={14} className={sys.status === 'Running' ? 'text-yellow-400' : 'text-slate-600'} />
                                   <span className="text-xs font-bold text-slate-200">{sys.name}</span>
                               </div>
                               <span className={`text-[9px] px-1.5 rounded ${sys.status === 'Running' ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                                   {sys.status}
                               </span>
                           </div>
                           <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                               <div className={`h-full ${sys.status === 'Running' ? 'bg-cyan-500' : 'bg-slate-600'}`} style={{width: `${sys.load}%`}}></div>
                           </div>
                           <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                               <span>Load: {sys.load}%</span>
                               <span>Eff: {sys.eff}</span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Concrete Durability Chart */}
           <SciFiCard title="混凝土抗冻耐久性" subtitle="MATERIAL" className="flex-1 border-slate-800">
               <div className="w-full h-full flex flex-col">
                   <div className="flex-1 min-h-[150px]">
                       <ResponsiveContainer width="100%" height="100%">
                           <ScatterChart margin={{top: 10, right: 10, bottom: 0, left: 0}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                               <XAxis type="number" dataKey="strength" name="Strength" unit="MPa" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Strength', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                               <YAxis type="number" dataKey="df" name="Durability Factor" unit="%" stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} label={{ value: 'Durability Factor', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                               <ZAxis type="number" dataKey="cost" range={[50, 400]} name="Cost" />
                               <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#22d3ee'}} />
                               <Scatter name="Mixes" data={CONCRETE_MIX} fill="#22d3ee" shape="circle" />
                           </ScatterChart>
                       </ResponsiveContainer>
                   </div>
                   
                   <div className="mt-2 p-2 bg-slate-900/50 border border-slate-700 rounded text-[10px] text-slate-400">
                       <span className="text-cyan-400 font-bold">Recommendation:</span> Use C40-F300 mix for spillway surface. Bubbler system recommended for intake gates.
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
