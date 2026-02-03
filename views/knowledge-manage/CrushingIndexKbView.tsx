
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/crushing-index/ThreeScene';
import { MillState } from '../../components/knowledge-manage/crushing-index/three-types';
import { 
  Database, Calculator, Activity, Hexagon, 
  RotateCw, Play, Hammer, Scale, 
  FileText, Search, Zap, Layers,
  ArrowRight, Info
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  LineChart, Line, BarChart, Bar, ReferenceLine, Legend, ComposedChart
} from 'recharts';

// --- MOCK DATA ---

const ORE_DATABASE = [
  { id: 'O-001', name: '磁铁矿 (Magnetite)', wi: 9.8, density: 4.2, hardness: 6.0, type: 'Metallic' },
  { id: 'O-002', name: '花岗岩 (Granite)', wi: 15.2, density: 2.7, hardness: 7.0, type: 'Igneous' },
  { id: 'O-003', name: '石灰石 (Limestone)', wi: 12.5, density: 2.6, hardness: 3.5, type: 'Sedimentary' },
  { id: 'O-004', name: '玄武岩 (Basalt)', wi: 17.5, density: 2.9, hardness: 8.0, type: 'Igneous' },
  { id: 'O-005', name: '石英 (Quartz)', wi: 13.6, density: 2.65, hardness: 7.0, type: 'Mineral' },
  { id: 'O-006', name: '铜矿石 (Copper Ore)', wi: 11.4, density: 3.8, hardness: 4.5, type: 'Metallic' },
];

const PSD_DATA = Array.from({length: 20}, (_, i) => {
    const size = Math.pow(1.5, i) * 10; // Microns to mm scale log
    // Cumulative passing %
    // Feed: coarser
    const feed = 100 * (1 - Math.exp(-0.005 * size));
    // Product: finer
    const prod = 100 * (1 - Math.exp(-0.05 * size));
    
    return {
        size: size.toFixed(0),
        feed: Math.min(100, feed),
        product: Math.min(100, prod)
    };
});

const POWER_SPEED_DATA = Array.from({length: 20}, (_, i) => {
    const speed = i * 5 + 10; // % Critical Speed
    // Power peaks around 75-80% critical speed
    const power = 100 * Math.sin((speed / 120) * Math.PI); 
    return { speed, power };
});

export const CrushingIndexKbView: React.FC = () => {
  const [activeOre, setActiveOre] = useState(ORE_DATABASE[1]);
  const [millState, setMillState] = useState<MillState>('IDLE');
  const [f80, setF80] = useState(12000); // microns
  const [p80, setP80] = useState(150); // microns
  
  // Calculate Work Input (W) using Bond's Law
  // W = 10 * Wi * (1/sqrt(P80) - 1/sqrt(F80))
  const workInput = 10 * activeOre.wi * (1/Math.sqrt(p80) - 1/Math.sqrt(f80));
  
  // Simulation Controls
  const handleSimulate = (mode: MillState) => {
      setMillState(mode);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-amber-50 bg-[#0c0a09] p-2 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/rocky-wall.png')]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-stone-900/60 border border-amber-900/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-600/20 border-2 border-amber-500 rounded-lg flex items-center justify-center relative shadow-[0_0_20px_rgba(245,158,11,0.3)]">
             <Hammer size={32} className="text-amber-400" />
             <div className="absolute top-0 right-0 w-3 h-3 bg-stone-200 rounded-full animate-ping"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-amber-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Database size={12} /> Comminution Knowledge Base
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               矿石破碎 <span className="text-amber-500 italic">功指数 (Wi) 档案</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Active Material</div>
                <div className="text-2xl font-mono font-black text-white">{activeOre.name.split(' ')[0]}</div>
             </div>
             <div className="h-10 w-[1px] bg-stone-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Bond Work Index</div>
                <div className="text-3xl font-mono font-black text-amber-400">{activeOre.wi} <span className="text-sm font-normal text-stone-600">kWh/t</span></div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Ore Library --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="岩性指纹库 (Lithology)" subtitle="DATABASE" className="flex-1 border-amber-900/30 bg-[#1c1917]/90">
              <div className="relative mb-3">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={14} />
                   <input 
                     type="text" 
                     placeholder="搜索矿石名称..." 
                     className="w-full bg-stone-900 border border-stone-700 rounded-sm py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-amber-500 text-stone-200"
                   />
              </div>
              
              <div className="flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar">
                  {ORE_DATABASE.map(ore => (
                      <div 
                        key={ore.id}
                        onClick={() => setActiveOre(ore)}
                        className={`p-3 rounded border cursor-pointer transition-all hover:translate-x-1 group relative overflow-hidden
                           ${activeOre.id === ore.id 
                               ? 'bg-amber-900/20 border-amber-500 shadow-[inset_0_0_15px_rgba(245,158,11,0.1)]' 
                               : 'bg-stone-900/40 border-stone-800 hover:border-stone-600'}
                        `}
                      >
                          {activeOre.id === ore.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>}
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-bold text-stone-200 group-hover:text-white">{ore.name}</span>
                              <span className="text-[10px] bg-stone-800 px-1.5 rounded text-stone-400">{ore.type}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-stone-500">
                              <div>Wi: <span className="text-amber-500 font-bold">{ore.wi}</span></div>
                              <div>Hardness: {ore.hardness}</div>
                          </div>
                      </div>
                  ))}
              </div>
           </SciFiCard>

           <div className="p-3 bg-stone-900/60 border border-stone-800 rounded">
               <div className="text-[10px] text-stone-500 uppercase font-bold mb-2 flex items-center gap-2">
                   <Info size={12}/> Parameter Detail
               </div>
               <div className="grid grid-cols-2 gap-y-2 text-xs">
                   <div className="text-stone-400">密度 Density:</div>
                   <div className="text-white text-right font-mono">{activeOre.density} g/cm³</div>
                   <div className="text-stone-400">莫氏硬度 Mohs:</div>
                   <div className="text-white text-right font-mono">{activeOre.hardness}</div>
                   <div className="text-stone-400">研磨性 Abrasion:</div>
                   <div className="text-white text-right font-mono">High</div>
               </div>
           </div>
        </div>

        {/* --- CENTER: 3D Simulation & Charts --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-[#050505] border border-amber-900/20 rounded-lg overflow-hidden relative shadow-2xl group flex flex-col">
               {/* 3D Scene */}
               <div className="flex-1 relative">
                   <ThreeScene state={millState} />
                   
                   {/* HUD */}
                   <div className="absolute top-4 left-4 z-20 flex gap-2">
                       <div className="bg-stone-950/80 backdrop-blur border border-amber-500/30 px-3 py-1.5 rounded flex items-center gap-2 text-xs text-amber-200">
                           <Activity size={14} className="animate-spin-slow"/>
                           <span className="font-bold">{millState} MODE</span>
                       </div>
                   </div>

                   {/* Simulation Controls */}
                   <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-stone-950/90 p-2 rounded-full border border-stone-700 shadow-xl backdrop-blur">
                       <button onClick={() => handleSimulate('IDLE')} className={`p-2 rounded-full hover:bg-stone-700 ${millState==='IDLE'?'text-white':'text-stone-500'}`}><RotateCw size={18}/></button>
                       <div className="w-px h-6 bg-stone-700 mx-1"></div>
                       <button onClick={() => handleSimulate('CASCADING')} className={`px-3 py-1 rounded-full text-[10px] font-bold ${millState==='CASCADING'?'bg-amber-600 text-white':'text-stone-400 hover:text-white'}`}>泻落</button>
                       <button onClick={() => handleSimulate('CATARACTING')} className={`px-3 py-1 rounded-full text-[10px] font-bold ${millState==='CATARACTING'?'bg-amber-600 text-white':'text-stone-400 hover:text-white'}`}>抛落</button>
                       <button onClick={() => handleSimulate('CENTRIFUGAL')} className={`px-3 py-1 rounded-full text-[10px] font-bold ${millState==='CENTRIFUGAL'?'bg-red-600 text-white':'text-stone-400 hover:text-white'}`}>离心</button>
                   </div>
               </div>
           </div>

           {/* Charts */}
           <div className="h-[240px] grid grid-cols-2 gap-4">
               <SciFiCard title="粒径分布曲线 (PSD)" subtitle="F80 / P80" className="border-amber-900/30" noPadding>
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={PSD_DATA} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                               <XAxis dataKey="size" stroke="#57534e" tick={{fontSize: 10}} label={{ value: 'Size (μm)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                               <YAxis stroke="#57534e" tick={{fontSize: 10}} label={{ value: '% Passing', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                               <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#d97706'}} />
                               <Legend verticalAlign="top" height={20} wrapperStyle={{fontSize: '10px'}}/>
                               <Line type="monotone" dataKey="feed" stroke="#57534e" strokeWidth={2} dot={false} name="Feed (F80)" />
                               <Line type="monotone" dataKey="product" stroke="#f59e0b" strokeWidth={2} dot={false} name="Product (P80)" />
                               <ReferenceLine y={80} stroke="#22d3ee" strokeDasharray="3 3" label={{value:'80%', fill:'#22d3ee', fontSize:9}} />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="磨机转速与功耗" subtitle="POWER CURVE" className="border-stone-800" noPadding>
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={POWER_SPEED_DATA}>
                               <defs>
                                   <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                               <XAxis dataKey="speed" stroke="#57534e" tick={{fontSize: 10}} label={{ value: '% Critical Speed', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                               <YAxis stroke="#57534e" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#d97706'}} />
                               <Area type="monotone" dataKey="power" stroke="#f59e0b" fill="url(#powerGrad)" name="Power Draw" />
                               <ReferenceLine x={75} stroke="#10b981" strokeDasharray="3 3" label={{value:'Optimal', fill:'#10b981', fontSize:10}} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>
           </div>

        </div>

        {/* --- RIGHT: Calculator & Standards --- */}
        <div className="w-[320px] flex flex-col gap-4">
           
           <SciFiCard title="邦德功指数计算器" subtitle="CALCULATOR" className="border-amber-900/30">
               <div className="flex flex-col gap-4 p-1">
                   <div className="p-3 bg-stone-900/50 border border-stone-800 rounded">
                       <div className="flex justify-between mb-2 text-xs text-stone-400">
                           <span>Feed Size (F80)</span>
                           <span className="text-white">{f80} μm</span>
                       </div>
                       <input 
                         type="range" min="1000" max="20000" step="100" 
                         value={f80} onChange={(e) => setF80(parseInt(e.target.value))}
                         className="w-full h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-stone-400"
                       />
                   </div>

                   <div className="p-3 bg-stone-900/50 border border-stone-800 rounded">
                       <div className="flex justify-between mb-2 text-xs text-stone-400">
                           <span>Product Size (P80)</span>
                           <span className="text-white">{p80} μm</span>
                       </div>
                       <input 
                         type="range" min="40" max="500" step="10" 
                         value={p80} onChange={(e) => setP80(parseInt(e.target.value))}
                         className="w-full h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                       />
                   </div>

                   <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-xl text-center">
                       <div className="text-xs text-amber-200/70 mb-1 uppercase tracking-widest flex items-center justify-center gap-2">
                           <Zap size={12}/> Specific Energy (W)
                       </div>
                       <div className="text-3xl font-black text-white font-mono">
                           {workInput.toFixed(2)} <span className="text-sm font-normal text-amber-500">kWh/t</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="关联标准与文献" className="flex-1 border-stone-800">
               <div className="flex flex-col gap-3">
                   {[
                       { code: 'GB/T 1234-2020', title: '球磨机功指数试验方法' },
                       { code: 'SME Handbook', title: 'Bond Law & Comminution' },
                       { code: 'JKMRC', title: 'SAG Mill Testing Standards' },
                   ].map((std, i) => (
                       <div key={i} className="flex items-center gap-3 p-2 hover:bg-stone-800 rounded cursor-pointer transition-colors group">
                           <div className="p-1.5 bg-stone-900 rounded text-stone-500 group-hover:text-amber-400">
                               <FileText size={14} />
                           </div>
                           <div className="flex-1">
                               <div className="text-xs font-bold text-stone-300">{std.code}</div>
                               <div className="text-[10px] text-stone-500">{std.title}</div>
                           </div>
                           <ArrowRight size={12} className="text-stone-700 group-hover:text-amber-500" />
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
