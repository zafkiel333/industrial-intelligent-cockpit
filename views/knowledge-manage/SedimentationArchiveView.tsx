
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/sedimentation/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[km-sedimentation]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/km-sedimentation';
import { SedimentSimState } from '../../components/knowledge-manage/sedimentation/three-types';
import { 
  History, Layers, Mountain, Ruler, 
  CalendarClock, ArrowDownToLine, FileClock,
  PieChart as PieIcon, BarChart3, Database,
  ScanLine
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---

const TIMELINE = [2000, 2005, 2010, 2015, 2020, 2024];

const SEDIMENT_HISTORY = [
    { year: 2000, volume: 0, capacity: 100 },
    { year: 2005, volume: 12, capacity: 88 },
    { year: 2010, volume: 28, capacity: 72 },
    { year: 2015, volume: 45, capacity: 55 },
    { year: 2020, volume: 62, capacity: 38 },
    { year: 2024, volume: 75, capacity: 25 },
];

const COMPOSITION_DATA = [
    { name: 'Sand (粗砂)', value: 35, color: '#d97706' },
    { name: 'Silt (粉砂)', value: 45, color: '#f59e0b' },
    { name: 'Clay (粘土)', value: 20, color: '#78350f' },
];

const SECTION_PROFILE = Array.from({length: 40}, (_, i) => {
    // Generate a valley profile
    const x = i;
    const bed = Math.pow((i - 20) / 5, 2); 
    return {
        dist: i,
        bed: bed,
        sediment2010: bed + (bed < 5 ? 2 : 0),
        sediment2024: bed + (bed < 8 ? 5 : 0),
    };
});

export const SedimentationArchiveView: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [sliceMode, setSliceMode] = useState(false);
  const [slicePos, setSlicePos] = useState(0); // -30 to 30

  // Calculate accumulation factor (0 to 1) based on year
  const accumFactor = useMemo(() => {
      const idx = TIMELINE.indexOf(selectedYear);
      return idx / (TIMELINE.length - 1);
  }, [selectedYear]);

  const simState: SedimentSimState = {
      year: selectedYear,
      accumulationFactor: accumFactor,
      isSlicing: sliceMode,
      slicePosition: slicePos
  };

  const currentStats = SEDIMENT_HISTORY.find(s => s.year === selectedYear) || SEDIMENT_HISTORY[0];

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-stone-200 bg-[#1c1917] p-2 relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-stone-900/80 border border-amber-900/30 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-900/20 border-2 border-amber-600 rounded flex items-center justify-center relative">
             <Layers size={30} className="text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-amber-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <History size={12} /> Geological Archive
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               库区泥沙淤积 <span className="text-amber-600 italic">演变历史档案</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Selected Year</div>
                <div className="text-4xl font-mono font-black text-white">{selectedYear}</div>
             </div>
             <div className="h-10 w-[1px] bg-stone-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Sediment Vol</div>
                <div className="text-2xl font-mono font-bold text-amber-400">{currentStats.volume} <span className="text-sm text-stone-500">Mm³</span></div>
             </div>
             <div className="h-10 w-[1px] bg-stone-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Rem. Capacity</div>
                <div className={`text-2xl font-mono font-bold ${currentStats.capacity < 40 ? 'text-red-500' : 'text-green-400'}`}>
                    {currentStats.capacity}%
                </div>
             </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 z-10">
        
        {/* --- LEFT: Timeline & Controls --- */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4">
           
           <SciFiCard title="历史演变时间轴" subtitle="TIMELINE" className="flex-1 border-amber-900/30 bg-[#0c0a09]/90">
              <div className="flex flex-col gap-0 relative h-full py-4 pl-4">
                  {/* Vertical Line */}
                  <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-stone-800"></div>
                  
                  {TIMELINE.map((year, idx) => {
                      const active = year === selectedYear;
                      return (
                        <div 
                          key={year}
                          onClick={() => setSelectedYear(year)}
                          className={`relative flex items-center gap-4 p-3 cursor-pointer group transition-all duration-300
                             ${active ? 'pl-6' : 'pl-2'}
                          `}
                        >
                            <div className={`
                                z-10 w-4 h-4 rounded-full border-2 transition-all duration-300
                                ${active ? 'bg-amber-500 border-white scale-125 shadow-[0_0_10px_#f59e0b]' : 'bg-stone-900 border-stone-600 group-hover:border-amber-500'}
                            `}></div>
                            
                            <div className={`flex-1 p-3 rounded border transition-all
                                ${active ? 'bg-amber-900/20 border-amber-600/50' : 'bg-stone-900/40 border-stone-800 group-hover:border-stone-600'}
                            `}>
                                <div className={`text-sm font-bold ${active ? 'text-white' : 'text-stone-400'}`}>{year}</div>
                                {active && (
                                    <div className="text-[10px] text-amber-300 mt-1 flex items-center gap-1">
                                        <Database size={10}/> Data Loaded
                                    </div>
                                )}
                            </div>
                        </div>
                      );
                  })}
              </div>
           </SciFiCard>

           <div className="p-4 bg-stone-900/60 border border-stone-800 rounded-lg">
               <div className="text-xs font-bold text-stone-400 mb-3 uppercase flex items-center gap-2">
                   <ScanLine size={14}/> Cross Section Analysis
               </div>
               <div className="flex items-center justify-between mb-2">
                   <span className="text-xs text-stone-300">Enable Slicer</span>
                   <button 
                     onClick={() => setSliceMode(!sliceMode)}
                     className={`w-10 h-5 rounded-full transition-colors ${sliceMode ? 'bg-amber-600' : 'bg-stone-700'} relative`}
                   >
                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${sliceMode ? 'left-6' : 'left-1'}`}></div>
                   </button>
               </div>
               
               {sliceMode && (
                   <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                       <div className="flex justify-between text-[10px] text-stone-500">
                           <span>Upstream</span>
                           <span>Dam</span>
                       </div>
                       <input 
                         type="range" min="-25" max="25" step="1" 
                         value={slicePos} 
                         onChange={(e) => setSlicePos(parseInt(e.target.value))}
                         className="w-full h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                       />
                       <div className="text-center text-xs font-mono text-amber-400">Position: {slicePos}m</div>
                   </div>
               )}
           </div>
        </div>

        {/* --- CENTER: 3D Visualization --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-[#0c0a09] border border-amber-900/20 rounded-lg overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene state={simState} />
               <div className="absolute top-4 right-4 z-20">
                 <ModelLibraryLink url={MODEL_LIB_URL} />
               </div>

               {/* Overlays */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                   <div className="bg-black/60 backdrop-blur border border-amber-600/30 p-2 rounded flex items-center gap-3">
                       <Mountain size={16} className="text-amber-500" />
                       <div>
                           <div className="text-[10px] text-stone-400 uppercase">Terrain</div>
                           <div className="text-sm font-bold text-white">3D Bathymetry</div>
                       </div>
                   </div>
               </div>
               
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-stone-700 text-xs text-stone-300 flex gap-4">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 bg-stone-700"></div> Bedrock</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-600"></div> Sediment</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 bg-cyan-600/50 border border-cyan-500"></div> Water</div>
               </div>
           </div>

           {/* Cross Section Chart */}
           <div className="h-[200px] bg-stone-900/40 border border-stone-800 rounded-lg p-3">
               <div className="flex justify-between items-center mb-2 px-2">
                   <span className="text-[10px] font-bold text-stone-400 uppercase">Profile Comparison (Section A-A)</span>
                   <div className="flex gap-2 text-[9px]">
                       <span className="text-stone-500">--- Bed</span>
                       <span className="text-amber-500">--- 2010</span>
                       <span className="text-red-500">--- 2024</span>
                   </div>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={SECTION_PROFILE}>
                       <defs>
                           <linearGradient id="sedGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                       <XAxis dataKey="dist" stroke="#44403c" tick={{fontSize: 10}} />
                       <YAxis stroke="#44403c" tick={{fontSize: 10}} reversed />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#78350f'}} />
                       <Area type="monotone" dataKey="bed" stroke="#44403c" fill="#1c1917" strokeWidth={2} name="Bedrock" />
                       <Area type="monotone" dataKey="sediment2024" stroke="#ef4444" fill="url(#sedGrad)" strokeWidth={2} name="2024 Level" />
                       <Line type="monotone" dataKey="sediment2010" stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={2} dot={false} name="2010 Level" />
                   </AreaChart>
               </ResponsiveContainer>
           </div>

        </div>

        {/* --- RIGHT: Sedimentology Analysis --- */}
        <div className="w-[300px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="泥沙成分构成" subtitle="COMPOSITION" className="h-[250px] border-amber-900/30">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie
                             data={COMPOSITION_DATA}
                             cx="50%"
                             cy="50%"
                             innerRadius={40}
                             outerRadius={60}
                             paddingAngle={5}
                             dataKey="value"
                           >
                             {COMPOSITION_DATA.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                             ))}
                           </Pie>
                           <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none'}} />
                           <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{fontSize: '10px'}}/>
                       </PieChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="库容曲线演变" subtitle="CAPACITY LOSS" className="h-[200px] border-stone-700">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={SEDIMENT_HISTORY}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                           <XAxis dataKey="year" stroke="#44403c" tick={{fontSize: 10}} />
                           <YAxis stroke="#44403c" tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#44403c'}} />
                           <Area type="monotone" dataKey="volume" stroke="#d97706" fill="#d97706" fillOpacity={0.3} name="Sediment" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <div className="bg-stone-900/50 border border-stone-800 p-3 rounded">
               <div className="text-[10px] text-stone-500 uppercase font-bold mb-2 flex items-center gap-2">
                   <ArrowDownToLine size={12}/> Deposition Rate
               </div>
               <div className="flex justify-between items-end">
                   <div className="text-2xl font-mono text-white">1.25 <span className="text-xs text-stone-500">Mm³/yr</span></div>
                   <div className="text-[10px] text-red-400 font-bold">+0.05% vs Avg</div>
               </div>
               <div className="w-full h-1 bg-stone-800 mt-2 rounded overflow-hidden">
                   <div className="h-full bg-red-500 w-[65%]"></div>
               </div>
           </div>

           <button className="w-full py-3 bg-amber-900/20 hover:bg-amber-900/40 text-amber-500 border border-amber-900/50 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all">
               <FileClock size={14} /> 生成清淤建议报告
           </button>
        </div>

      </div>
    </div>
  );
};
