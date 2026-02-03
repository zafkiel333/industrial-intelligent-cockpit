import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/truck-tire/ThreeScene';
import { RoadSurfaceType, ViewMode } from '../../components/knowledge-manage/truck-tire/three-types';
import { 
  Truck, Activity, Thermometer, AlertTriangle, 
  Map, Layers, Settings, Zap, 
  Database, Info, ArrowRight, Gauge,
  Scale, Eye, Flame, RotateCcw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  ScatterChart, Scatter, ZAxis, ReferenceLine, Legend,
  BarChart, Bar, Cell
} from 'recharts';

// --- MOCK DATA ---
const TIRE_SPECS = {
    model: '59/80R63',
    brand: 'Michelin XDR3',
    loadIndex: '208B',
    pressure: '700 kPa',
    tkphRating: 1450
};

const TKPH_DATA = Array.from({length: 24}, (_, i) => ({
    hour: i,
    tkph: 800 + Math.sin(i * 0.2) * 400 + Math.random() * 100,
    limit: 1450
}));

const WEAR_CORRELATION = Array.from({length: 30}, (_, i) => ({
    iri: 2 + i * 0.2 + Math.random(), // Road Roughness (m/km)
    wearRate: 0.1 + (i * 0.2) * 0.05 + Math.random() * 0.05, // mm/100h
    heat: 60 + i * 2 // Temp
}));

const FAILURE_MODES = [
    { id: 'F01', name: '胎冠刺穿 (Crown Cut)', risk: 'High', cause: 'Sharp Rocks' },
    { id: 'F02', name: '热剥离 (Heat Sep.)', risk: 'Critical', cause: 'Over Speed/Load' },
    { id: 'F03', name: '侧壁划伤 (Sidewall)', risk: 'Med', cause: 'Spillage' },
    { id: 'F04', name: '胎圈老化 (Bead Age)', risk: 'Low', cause: 'Heat Transfer' },
];

export const TruckTireKbView: React.FC = () => {
  const [roadType, setRoadType] = useState<RoadSurfaceType>('HAUL_ROAD');
  const [viewMode, setViewMode] = useState<ViewMode>('VISUAL');
  const [truckSpeed, setTruckSpeed] = useState(30); // km/h
  const [tireTemp, setTireTemp] = useState(65); // C

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        // Temp rises with speed and road roughness
        let roughFactor = 1;
        if(roadType === 'GRAVEL') roughFactor = 1.2;
        if(roadType === 'HARD_ROCK') roughFactor = 1.5;
        if(roadType === 'MUDDY') roughFactor = 1.1; // Rolling resistance

        const targetTemp = 40 + (truckSpeed * 1.5 * roughFactor);
        setTireTemp(prev => prev + (targetTemp - prev) * 0.05);
    }, 500);
    return () => clearInterval(interval);
  }, [truckSpeed, roadType]);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#0c0a09] p-2 relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-stone-900/80 border border-orange-600/30 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-orange-900/20 border-2 border-orange-600 rounded-full flex items-center justify-center relative">
             <Truck size={30} className="text-orange-500" />
             <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-black"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-orange-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Settings size={12} /> Asset Lifecycle Management
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               矿用轮胎磨损 <span className="text-orange-500 italic">路面关联数据库</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">TKPH Real-time</div>
                <div className="text-2xl font-mono font-black text-white">1,245</div>
             </div>
             <div className="h-10 w-[1px] bg-stone-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Est. Tire Life</div>
                <div className="text-2xl font-mono font-black text-orange-400">3,850 <span className="text-sm text-stone-500 font-normal">hrs</span></div>
             </div>
             <div className="h-10 w-[1px] bg-stone-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Road Roughness (IRI)</div>
                <div className="text-2xl font-mono font-black text-cyan-400">8.2 <span className="text-sm text-stone-500 font-normal">m/km</span></div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Tire Specs & Failure Lib --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="轮胎技术档案" subtitle="SPECIFICATION" className="border-orange-900/30 bg-[#1c1917]/90">
              <div className="space-y-4 pt-2">
                 <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                     <span className="text-xs text-stone-400">Model ID</span>
                     <span className="text-lg font-bold text-white">{TIRE_SPECS.model}</span>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                     <div className="bg-stone-800/50 p-2 rounded border border-stone-700">
                         <div className="text-[10px] text-stone-500">TKPH Rating</div>
                         <div className="text-white font-mono">{TIRE_SPECS.tkphRating}</div>
                     </div>
                     <div className="bg-stone-800/50 p-2 rounded border border-stone-700">
                         <div className="text-[10px] text-stone-500">Std Pressure</div>
                         <div className="text-white font-mono">{TIRE_SPECS.pressure}</div>
                     </div>
                 </div>
                 
                 <div className="pt-2">
                     <div className="text-[10px] text-stone-500 uppercase font-bold mb-2">失效模式库 (Failure Modes)</div>
                     <div className="flex flex-col gap-2">
                         {FAILURE_MODES.map(f => (
                             <div key={f.id} className="flex justify-between items-center p-2 bg-stone-900/50 rounded hover:bg-stone-800 cursor-pointer transition-colors border border-stone-800 hover:border-orange-500/30">
                                 <div>
                                     <div className="text-xs text-stone-300 font-bold">{f.name}</div>
                                     <div className="text-[9px] text-stone-500">{f.cause}</div>
                                 </div>
                                 <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${f.risk === 'Critical' ? 'bg-red-900/40 text-red-400' : f.risk === 'High' ? 'bg-orange-900/40 text-orange-400' : 'bg-green-900/40 text-green-400'}`}>
                                     {f.risk}
                                 </span>
                             </div>
                         ))}
                     </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="磨损-路况关联分析" subtitle="SCATTER PLOT" className="flex-1 border-stone-800">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{top: 10, right: 10, bottom: 0, left: -15}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                           <XAxis type="number" dataKey="iri" name="Roughness" stroke="#666" tick={{fontSize: 10}} label={{ value: 'IRI (m/km)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                           <YAxis type="number" dataKey="wearRate" name="Wear Rate" stroke="#666" tick={{fontSize: 10}} label={{ value: 'Wear', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                           <ZAxis type="number" dataKey="heat" range={[20, 100]} name="Temp" />
                           <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316'}} />
                           <Scatter name="Correlation" data={WEAR_CORRELATION} fill="#f97316" />
                       </ScatterChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Twin & Simulation --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-[#050402] border border-orange-900/30 rounded-lg overflow-hidden relative shadow-2xl flex flex-col group">
               {/* 3D Scene */}
               <div className="flex-1 relative">
                   <ThreeScene surface={roadType} viewMode={viewMode} speed={truckSpeed} />
                   
                   {/* HUD Overlay */}
                   <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                       <div className="bg-stone-900/80 backdrop-blur border border-orange-500/30 p-3 rounded flex flex-col min-w-[140px]">
                           <div className="text-[10px] text-orange-500 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                               <Thermometer size={12}/> Tire Core Temp
                           </div>
                           <div className={`text-2xl font-mono font-bold ${tireTemp > 90 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                               {tireTemp.toFixed(1)} <span className="text-sm font-normal text-stone-500">°C</span>
                           </div>
                       </div>
                   </div>

                   <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
                       <div className="bg-stone-900/80 backdrop-blur border border-stone-700 px-3 py-1 rounded text-xs text-stone-300">
                           Simulation Speed: {truckSpeed} km/h
                       </div>
                   </div>
               </div>

               {/* Bottom Controls */}
               <div className="h-20 bg-stone-900/90 border-t border-stone-800 p-3 flex items-center justify-between backdrop-blur-md">
                   <div className="flex items-center gap-4">
                       <div className="flex flex-col gap-1">
                           <span className="text-[9px] text-stone-500 uppercase font-bold">Road Condition</span>
                           <div className="flex bg-stone-800 rounded p-1 gap-1">
                               {['HAUL_ROAD', 'GRAVEL', 'HARD_ROCK', 'MUDDY'].map((r) => (
                                   <button 
                                     key={r}
                                     onClick={() => setRoadType(r as RoadSurfaceType)}
                                     className={`px-3 py-1 rounded text-[10px] font-bold transition-all
                                        ${roadType === r ? 'bg-orange-600 text-white shadow' : 'text-stone-400 hover:text-stone-200'}
                                     `}
                                   >
                                       {r.replace('_', ' ')}
                                   </button>
                               ))}
                           </div>
                       </div>
                       
                       <div className="w-px h-8 bg-stone-700 mx-2"></div>

                       <div className="flex flex-col gap-1 w-48">
                           <div className="flex justify-between text-[9px] text-stone-500 uppercase font-bold">
                               <span>Speed Control</span>
                               <span>{truckSpeed} km/h</span>
                           </div>
                           <input 
                             type="range" min="0" max="60" step="5" 
                             value={truckSpeed} 
                             onChange={(e) => setTruckSpeed(parseInt(e.target.value))}
                             className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                           />
                       </div>
                   </div>

                   <div className="flex gap-2">
                       <button 
                         onClick={() => setViewMode('VISUAL')}
                         className={`p-2 rounded border transition-all ${viewMode === 'VISUAL' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-stone-800 border-stone-700 text-stone-500'}`}
                         title="Visual Mode"
                       ><Eye size={18}/></button>
                       <button 
                         onClick={() => setViewMode('THERMAL')}
                         className={`p-2 rounded border transition-all ${viewMode === 'THERMAL' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-stone-800 border-stone-700 text-stone-500'}`}
                         title="Thermal Mode"
                       ><Flame size={18}/></button>
                       <button 
                         onClick={() => setViewMode('WEAR_MAP')}
                         className={`p-2 rounded border transition-all ${viewMode === 'WEAR_MAP' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-stone-800 border-stone-700 text-stone-500'}`}
                         title="Wear Map Mode"
                       ><Activity size={18}/></button>
                   </div>
               </div>
           </div>
        </div>

        {/* --- RIGHT: TKPH & Maintenance --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="TKPH 实时监控" subtitle="LOAD LIMIT" className="h-[280px] border-orange-900/30">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={TKPH_DATA}>
                           <defs>
                               <linearGradient id="tkphGrad" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                           <XAxis dataKey="hour" stroke="#57534e" tick={{fontSize: 10}} interval={3} />
                           <YAxis stroke="#57534e" tick={{fontSize: 10}} domain={[0, 2000]} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316'}} />
                           <ReferenceLine y={1450} stroke="#ef4444" strokeDasharray="3 3" label={{value:'Limit', fill:'red', fontSize:10}} />
                           <Area type="monotone" dataKey="tkph" stroke="#f97316" fill="url(#tkphGrad)" strokeWidth={2} name="Current TKPH" />
                       </AreaChart>
                   </ResponsiveContainer>
                   <div className="text-center text-[10px] text-stone-500 mt-1">Ton-Kilometer Per Hour (24h Trend)</div>
               </div>
           </SciFiCard>

           <SciFiCard title="维护建议" subtitle="ACTION" className="flex-1 border-stone-800">
               <div className="space-y-3">
                   <div className="flex items-start gap-3 p-3 bg-stone-900/50 border border-stone-800 rounded">
                       <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                       <div>
                           <div className="text-xs font-bold text-white mb-1">降温指令</div>
                           <p className="text-[10px] text-stone-400 leading-tight">核心温度接近临界值，建议空载返程或停机冷却 30 分钟。</p>
                       </div>
                   </div>
                   <div className="flex items-start gap-3 p-3 bg-stone-900/50 border border-stone-800 rounded">
                       <RotateCcw className="text-blue-500 shrink-0 mt-0.5" size={16} />
                       <div>
                           <div className="text-xs font-bold text-white mb-1">轮胎换位 (Rotation)</div>
                           <p className="text-[10px] text-stone-400 leading-tight">建议在下个维护周期（50h后）将前轴轮胎调至后轴外侧。</p>
                       </div>
                   </div>
                   <div className="flex items-start gap-3 p-3 bg-stone-900/50 border border-stone-800 rounded">
                       <Scale className="text-green-500 shrink-0 mt-0.5" size={16} />
                       <div>
                           <div className="text-xs font-bold text-white mb-1">气压调整</div>
                           <p className="text-[10px] text-stone-400 leading-tight">当前载重下建议胎压上调至 720 kPa 以减少屈挠生热。</p>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};