
import React, { useState, useEffect, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/hydraulic-support-resistance/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[km-hydraulic-support]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/km-hydraulic-support';
import { MiningState } from '../../components/knowledge-manage/hydraulic-support-resistance/three-types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  LineChart, Line, ReferenceLine, AreaChart, Area, Cell, Legend
} from 'recharts';
import { 
  Activity, AlertTriangle, ArrowRight, Database, 
  Layers, Gauge, TrendingUp, Search, 
  ArrowDownToLine, Maximize2, RefreshCw,
  BarChart3, CheckCircle2
} from 'lucide-react';

// --- MOCK DATA ---

// 1. Full Face Resistance Distribution (100 supports)
const generateFaceData = () => {
    return Array.from({length: 100}, (_, i) => {
        // Create a wave pattern to simulate weighting zones
        const base = 30; // MPa
        const weighting = Math.sin(i * 0.1) * 10 + Math.sin(i * 0.05) * 5; 
        const noise = Math.random() * 2;
        let pressure = base + weighting + noise;
        
        // Add a "peak" zone
        if (i > 40 && i < 60) pressure += 15; 

        return {
            id: i + 1,
            pressure: Math.max(10, Math.min(60, pressure)),
            status: pressure > 45 ? 'High' : pressure > 35 ? 'Med' : 'Normal'
        };
    });
};

// 2. Single Support Cycle Data (Time based)
const CYCLE_DATA = Array.from({length: 60}, (_, i) => {
    // Typical mining cycle: Set -> Active -> Yield -> Release
    let p = 0;
    if (i < 5) p = i * 6; // Setting
    else if (i < 45) p = 30 + (i-5) * 0.2 + Math.random(); // Working
    else if (i < 55) p = 38 + (i-45) * 0.5; // Loading up
    else p = 0; // Release/Advance
    return { time: i, pressure: p };
});

// 3. Prediction Data
const PREDICTION_DATA = [
    { step: '10刀', pressure: 32 },
    { step: '20刀', pressure: 34 },
    { step: '30刀', pressure: 38 },
    { step: '40刀', pressure: 48 }, // Peak
    { step: '50刀', pressure: 35 },
];

export const HydraulicSupportResistanceView: React.FC = () => {
  const [faceData, setFaceData] = useState(generateFaceData());
  const [selectedSupportId, setSelectedSupportId] = useState(50);
  const [miningState, setMiningState] = useState<MiningState>('MONITORING');
  const [avgPressure, setAvgPressure] = useState(32.5);

  // Simulation Loop
  useEffect(() => {
      const interval = setInterval(() => {
          setFaceData(prev => {
              const newData = prev.map(item => {
                  // Drift pressure slightly
                  const change = (Math.random() - 0.5) * 2;
                  let newP = Math.max(0, Math.min(60, item.pressure + change));
                  
                  // Simulate weighting event dynamically
                  if (miningState === 'WEIGHTING') {
                      if (item.id > 30 && item.id < 70) newP += 0.5;
                  }
                  
                  return {
                      ...item,
                      pressure: newP,
                      status: newP > 45 ? 'High' : newP > 35 ? 'Med' : 'Normal'
                  };
              });
              
              // Calc Avg
              const sum = newData.reduce((acc, curr) => acc + curr.pressure, 0);
              setAvgPressure(sum / newData.length);
              
              return newData;
          });
      }, 500);
      return () => clearInterval(interval);
  }, [miningState]);

  // Extract data for 3D scene (6 supports around selected ID)
  const sceneData = useMemo(() => {
      const start = Math.max(0, selectedSupportId - 3);
      const end = Math.min(100, selectedSupportId + 3);
      return faceData.slice(start, end).map(d => d.pressure);
  }, [faceData, selectedSupportId]);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#0c0a09] p-2 relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-stone-900/80 border border-amber-600/30 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-900/20 border-2 border-amber-600 rounded flex items-center justify-center relative shadow-[0_0_20px_rgba(245,158,11,0.2)]">
             <Layers size={28} className="text-amber-500" />
             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-stone-900 border border-amber-500 rounded-full flex items-center justify-center">
                 <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
             </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-amber-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Activity size={12} /> Strata Pressure Intelligence
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               综采工作面 <span className="text-amber-500 italic">液压支架阻力图谱</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Avg Resistance</div>
                <div className="text-2xl font-mono font-black text-white">{avgPressure.toFixed(1)} <span className="text-sm text-stone-500">MPa</span></div>
             </div>
             <div className="h-10 w-[1px] bg-stone-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Load Status</div>
                <div className={`text-2xl font-mono font-black ${avgPressure > 40 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {avgPressure > 40 ? 'WEIGHTING' : 'NORMAL'}
                </div>
             </div>
             <div className="h-10 w-[1px] bg-stone-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Supports Online</div>
                <div className="text-2xl font-mono font-black text-blue-400">120 <span className="text-sm text-stone-500">/ 120</span></div>
             </div>
        </div>
      </div>

      {/* --- TOP: FACE RESISTANCE MAP (The "Spectrogram") --- */}
      <div className="h-[240px] bg-[#1c1917] border border-amber-900/30 rounded-xl p-4 flex flex-col z-10 shadow-lg">
          <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-300 uppercase tracking-wider">
                  <BarChart3 size={14} className="text-amber-500"/> Real-time Face Resistance Distribution (1-100#)
              </div>
              <div className="flex gap-4 text-[10px] text-stone-500">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-sm"></div> Normal (&lt;35)</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-500 rounded-sm"></div> Warning (35-45)</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-sm"></div> Alarm (&gt;45)</span>
              </div>
          </div>
          <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={faceData} barGap={0} categoryGap={0} 
                    onClick={(data) => { if(data && data.activePayload) setSelectedSupportId(data.activePayload[0].payload.id); }}
                 >
                     <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                     <XAxis dataKey="id" stroke="#57534e" tick={{fontSize: 10}} interval={9} label={{ value: 'Support ID', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#57534e' }} />
                     <YAxis stroke="#57534e" tick={{fontSize: 10}} domain={[0, 60]} />
                     <Tooltip 
                        contentStyle={{backgroundColor: '#0c0a09', borderColor: '#d97706'}}
                        itemStyle={{color: '#fff'}}
                        cursor={{fill: 'rgba(217, 119, 6, 0.2)'}}
                     />
                     <ReferenceLine y={45} stroke="#ef4444" strokeDasharray="3 3" label={{value:'Alarm Limit', fill:'red', fontSize: 10}} />
                     <Bar dataKey="pressure" name="Resistance (MPa)">
                         {faceData.map((entry, index) => (
                             <Cell 
                                key={`cell-${index}`} 
                                fill={entry.pressure > 45 ? '#ef4444' : entry.pressure > 35 ? '#f59e0b' : '#10b981'} 
                                stroke={selectedSupportId === entry.id ? '#fff' : 'none'}
                                strokeWidth={selectedSupportId === entry.id ? 2 : 0}
                             />
                         ))}
                     </Bar>
                 </BarChart>
             </ResponsiveContainer>
          </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Single Support Analysis --- */}
        <div className="w-full lg:w-[340px] flex flex-col gap-4">
           <SciFiCard title={`支架 #${selectedSupportId} 状态详情`} subtitle="DETAIL" className="flex-1 border-amber-900/30 bg-[#0c0a09]/90">
               <div className="flex flex-col gap-4 h-full">
                   <div className="grid grid-cols-2 gap-3 mt-2">
                       <div className="bg-stone-900/50 p-3 rounded border border-stone-800 text-center">
                           <div className="text-[10px] text-stone-500 uppercase">Current Pressure</div>
                           <div className="text-xl font-bold text-white font-mono">
                               {faceData[selectedSupportId-1]?.pressure.toFixed(1)} MPa
                           </div>
                       </div>
                       <div className="bg-stone-900/50 p-3 rounded border border-stone-800 text-center">
                           <div className="text-[10px] text-stone-500 uppercase">Setting Load</div>
                           <div className="text-xl font-bold text-amber-500 font-mono">30.0 MPa</div>
                       </div>
                   </div>

                   <div className="flex-1 min-h-[150px] border border-stone-800 rounded p-2 bg-black/20">
                       <div className="text-[10px] text-stone-500 mb-1">Working Cycle Curve</div>
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={CYCLE_DATA}>
                               <defs>
                                   <linearGradient id="cycleGrad" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                               <XAxis dataKey="time" hide />
                               <YAxis hide domain={[0, 50]} />
                               <Area type="step" dataKey="pressure" stroke="#f59e0b" fill="url(#cycleGrad)" strokeWidth={2} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
                   
                   <div className="space-y-2">
                       <div className="flex justify-between text-xs items-center p-2 bg-stone-900/50 rounded">
                           <span className="text-stone-400">初撑力合格率</span>
                           <span className="text-green-400 font-bold">98.5%</span>
                       </div>
                       <div className="flex justify-between text-xs items-center p-2 bg-stone-900/50 rounded">
                           <span className="text-stone-400">安全阀开启次数</span>
                           <span className="text-white font-bold">2</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Twin & Controls --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-amber-900/20 rounded-xl overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene state={miningState} pressureData={sceneData} />
               <div className="absolute top-4 right-4 z-20">
                 <ModelLibraryLink url={MODEL_LIB_URL} />
               </div>

               {/* Overlays */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                   <div className="bg-stone-950/80 backdrop-blur border border-amber-500/30 p-2 rounded flex items-center gap-3">
                       <Search size={16} className="text-amber-400" />
                       <div className="text-xs text-white">
                           Selected Zone: <span className="font-mono text-amber-300">#{Math.max(1, selectedSupportId-3)} - #{Math.min(100, selectedSupportId+3)}</span>
                       </div>
                   </div>
               </div>
               
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-stone-900/90 p-2 rounded-full border border-stone-600 backdrop-blur">
                   {[
                       { id: 'MONITORING', label: '实时监测' },
                       { id: 'WEIGHTING', label: '来压模拟' },
                       { id: 'ADVANCING', label: '移架演示' },
                   ].map(mode => (
                       <button 
                         key={mode.id}
                         onClick={() => setMiningState(mode.id as MiningState)}
                         className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all
                            ${miningState === mode.id ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white hover:bg-stone-800'}
                         `}
                       >
                           {mode.label}
                       </button>
                   ))}
               </div>
           </div>
        </div>

        {/* --- RIGHT: Prediction & Analysis --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="矿压预测 (Strata Prediction)" subtitle="AI MODEL" className="h-[250px] border-amber-900/30">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={PREDICTION_DATA}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                           <XAxis dataKey="step" stroke="#57534e" tick={{fontSize: 10}} />
                           <YAxis stroke="#57534e" tick={{fontSize: 10}} domain={[0, 60]} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#d97706'}} />
                           <Legend verticalAlign="top" height={20} wrapperStyle={{fontSize: '10px'}} />
                           <Line type="monotone" dataKey="pressure" name="Predicted P" stroke="#d97706" strokeWidth={2} dot={{r:4}} />
                           <ReferenceLine y={45} stroke="red" strokeDasharray="3 3" label={{value:'Limit', fill:'red', fontSize:10}} />
                       </LineChart>
                   </ResponsiveContainer>
               </div>
               <div className="px-2 pb-2 text-[10px] text-stone-400 text-center">
                   预测下一次周期来压步距: <span className="text-white font-bold">15.5m</span>
               </div>
           </SciFiCard>

           <SciFiCard title="总体评价" className="flex-1 border-stone-800">
               <div className="flex flex-col gap-3">
                   <div className="p-3 bg-stone-900/50 border border-stone-700 rounded flex items-center gap-3">
                       <div className="p-2 bg-green-900/20 rounded-full text-green-500"><CheckCircle2 size={16}/></div>
                       <div>
                           <div className="text-xs font-bold text-stone-200">支架适应性评价</div>
                           <div className="text-[10px] text-stone-500">优 (工作阻力利用率 85%)</div>
                       </div>
                   </div>
                   <div className="p-3 bg-stone-900/50 border border-stone-700 rounded flex items-center gap-3">
                       <div className="p-2 bg-yellow-900/20 rounded-full text-yellow-500"><AlertTriangle size={16}/></div>
                       <div>
                           <div className="text-xs font-bold text-stone-200">异常区域提示</div>
                           <div className="text-[10px] text-stone-500">45#-52# 支架初撑力偏低</div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
