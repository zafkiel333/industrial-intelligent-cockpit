
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/slope-disaster/ThreeScene';
import { SlopeSimState } from '../../components/knowledge-manage/slope-disaster/three-types';
import { 
  Mountain, Waves, CloudRain, AlertTriangle, 
  Activity, ArrowDown, Database, Layers,
  Search, FileText, Share2, Play, RotateCcw,
  Ruler
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  LineChart, Line, ComposedChart, Bar, Legend, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---

const DISPLACEMENT_DATA = Array.from({length: 40}, (_, i) => {
    // Exponential creep curve
    const t = i;
    const disp = i < 20 ? i * 0.5 : 10 + Math.pow(i - 20, 2) * 0.5;
    return {
        time: t,
        disp: disp,
        rate: i < 20 ? 0.5 : (i - 20),
        rain: Math.random() * 10
    };
});

const MECHANISM_LIB = [
    { id: 'M-001', title: '水位骤降型滑坡', type: 'Hydrodynamic', risk: 'High', desc: '库水位快速下降导致坡体内孔隙水压力消散滞后，形成向外的动水压力。' },
    { id: 'M-002', title: '强降雨致塌型滑坡', type: 'Rainfall', risk: 'High', desc: '持续降雨入渗导致土体饱和，抗剪强度降低，容重增加。' },
    { id: 'M-003', title: '库岸塌岸 (Bank Collapse)', type: 'Erosion', risk: 'Medium', desc: '波浪淘蚀坡脚，导致上部土体失稳崩塌。' },
    { id: 'M-004', title: '深层蠕滑 (Creep)', type: 'Structural', risk: 'Low', desc: '软弱夹层在重力作用下的长期缓慢变形。' },
];

const STRATIGRAPHY = [
    { id: 1, name: '第四系覆盖层 (Q4)', thickness: '5-12m', desc: '松散堆积体，透水性强', color: 'bg-[#8c6b4a]' },
    { id: 2, name: '强风化砂岩 (J2s)', thickness: '10-25m', desc: '节理裂隙发育，岩体破碎', color: 'bg-[#6b5845]' },
    { id: 3, name: '软弱夹层 (Mudstone)', thickness: '0.5-2m', desc: '关键滑带，抗剪强度低', color: 'bg-[#ef4444]' },
    { id: 4, name: '完整基岩 (Bedrock)', thickness: '>50m', desc: '微风化，透水性弱', color: 'bg-[#4a4036]' },
];

export const SlopeDisasterKbView: React.FC = () => {
  const [simState, setSimState] = useState<SlopeSimState>('STABLE');
  const [selectedMech, setSelectedMech] = useState(MECHANISM_LIB[0].id);

  const handleSimulate = (state: SlopeSimState) => {
      setSimState(state);
      // Auto reset after slide
      if (state === 'SLIDING') {
          setTimeout(() => setSimState('STABILIZED'), 4000);
      }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-stone-200 bg-[#1c1917] p-2 relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-lozenge.png')]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-stone-900/80 border border-amber-800/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-900/20 border-2 border-amber-600 rounded flex items-center justify-center relative">
             <Mountain size={30} className="text-amber-500" />
             <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-stone-900"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-amber-600 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Activity size={12} /> Geo-Hazard Analysis
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               库岸边坡 <span className="text-amber-600 italic">地质灾害机理库</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Active Sensors</div>
                <div className="text-2xl font-mono font-black text-white">48/50</div>
             </div>
             <div className="h-10 w-[1px] bg-stone-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Stability Coeff (FoS)</div>
                <div className={`text-2xl font-mono font-black ${simState === 'SLIDING' ? 'text-red-500 animate-bounce' : 'text-green-500'}`}>
                    {simState === 'STABLE' ? '1.25' : simState === 'SLIDING' ? '0.92' : '1.05'}
                </div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Mechanism & Stratigraphy --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="灾害机理图谱" subtitle="LIBRARY" className="border-amber-900/30 bg-[#0c0a09]/90">
              <div className="flex flex-col gap-2 mt-2">
                  {MECHANISM_LIB.map(mech => (
                      <div 
                        key={mech.id}
                        onClick={() => setSelectedMech(mech.id)}
                        className={`p-3 rounded border cursor-pointer transition-all hover:bg-stone-800
                            ${selectedMech === mech.id ? 'bg-amber-900/20 border-amber-600' : 'bg-stone-900/40 border-stone-800'}
                        `}
                      >
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-stone-200">{mech.title}</span>
                              <span className={`text-[9px] px-1.5 rounded ${mech.risk==='High'?'bg-red-900/40 text-red-400':'bg-yellow-900/40 text-yellow-400'}`}>
                                  {mech.risk}
                              </span>
                          </div>
                          <p className="text-[10px] text-stone-500 leading-tight">{mech.desc}</p>
                      </div>
                  ))}
              </div>
           </SciFiCard>

           <SciFiCard title="典型地层柱状图" subtitle="STRATIGRAPHY" className="flex-1 border-stone-700">
               <div className="flex flex-col gap-0 h-full relative pl-8 py-2">
                   {/* Depth Ruler */}
                   <div className="absolute left-0 top-2 bottom-2 w-6 border-r border-stone-600 flex flex-col justify-between text-[9px] text-stone-500 pr-1">
                       <span>0m</span><span>-20m</span><span>-50m</span><span>-100m</span>
                   </div>
                   
                   {STRATIGRAPHY.map(layer => (
                       <div key={layer.id} className="flex-1 flex items-stretch gap-2 mb-1 group">
                           <div className={`w-8 ${layer.color} border border-stone-900/50 rounded-sm relative`}>
                               {layer.name.includes('软弱') && <div className="absolute inset-0 animate-pulse bg-white/20"></div>}
                           </div>
                           <div className="flex-1 flex flex-col justify-center">
                               <div className="text-xs font-bold text-stone-300">{layer.name}</div>
                               <div className="text-[9px] text-stone-500">{layer.desc}</div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 4D Simulation --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-[#0c0a09] border border-amber-800/30 rounded-lg relative overflow-hidden shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene state={simState} />

               {/* Overlays */}
               <div className="absolute top-4 left-4 z-20 pointer-events-none">
                   <div className="bg-black/60 backdrop-blur border border-amber-600/30 p-3 rounded flex flex-col">
                       <div className="text-[10px] text-amber-500 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Layers size={12}/> Simulation Mode
                       </div>
                       <div className="text-xl font-black text-white">{simState}</div>
                   </div>
               </div>

               {/* Control Bar */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/80 p-2 rounded-full border border-stone-700 shadow-xl backdrop-blur">
                   <button onClick={() => handleSimulate('STABLE')} className="p-2 rounded-full hover:bg-stone-700 text-stone-400" title="Reset">
                       <RotateCcw size={18}/>
                   </button>
                   <div className="w-[1px] h-8 bg-stone-600 mx-1"></div>
                   
                   <button 
                     onClick={() => handleSimulate('RAINFALL')}
                     className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${simState === 'RAINFALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                   >
                       <CloudRain size={14}/> 强降雨
                   </button>
                   <button 
                     onClick={() => handleSimulate('DRAWDOWN')}
                     className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${simState === 'DRAWDOWN' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                   >
                       <Waves size={14}/> 水位骤降
                   </button>
                   <button 
                     onClick={() => handleSimulate('CREEP')}
                     className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${simState === 'CREEP' ? 'bg-yellow-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                   >
                       <Activity size={14}/> 蠕变监测
                   </button>
                   <button 
                     onClick={() => handleSimulate('SLIDING')}
                     className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${simState === 'SLIDING' ? 'bg-red-600 text-white animate-pulse' : 'text-slate-400 hover:bg-slate-800'}`}
                   >
                       <AlertTriangle size={14}/> 诱发滑坡
                   </button>
               </div>
           </div>

           {/* Monitoring Curves */}
           <div className="h-[200px] bg-stone-900/40 border border-stone-800 rounded-lg p-2 overflow-hidden">
               <div className="text-[10px] text-stone-500 font-bold mb-1 uppercase px-2 flex justify-between">
                   <span>位移-时间演化曲线 (S-t Curve)</span>
                   <span className="text-amber-500">Alert Threshold: 10mm/day</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <ComposedChart data={DISPLACEMENT_DATA}>
                       <defs>
                           <linearGradient id="dispGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                       <XAxis dataKey="time" stroke="#44403c" tick={{fontSize: 10}} interval={5} />
                       <YAxis yAxisId="left" stroke="#78716c" tick={{fontSize: 10}} label={{ value: 'Disp (mm)', angle: -90, position: 'insideLeft', fontSize: 9, fill: '#78716c' }} />
                       <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" tick={{fontSize: 10}} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f59e0b'}} />
                       <Area yAxisId="left" type="monotone" dataKey="disp" stroke="#f59e0b" fill="url(#dispGrad)" strokeWidth={2} name="累计位移" />
                       <Line yAxisId="right" type="step" dataKey="rain" stroke="#0ea5e9" strokeWidth={1} dot={false} name="降雨量" />
                       <ReferenceLine yAxisId="left" y={15} stroke="#ef4444" strokeDasharray="3 3" label={{value: 'Critical', fill: 'red', fontSize: 10}} />
                   </ComposedChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* --- RIGHT: Analysis & Reports --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="稳定性分析参数" subtitle="CALCULATION" className="border-stone-700">
               <div className="grid grid-cols-2 gap-3">
                   <div className="bg-stone-900/50 p-2 rounded border border-stone-800">
                       <div className="text-[10px] text-stone-500">内摩擦角 (φ)</div>
                       <div className="text-lg font-bold text-white">22.5°</div>
                   </div>
                   <div className="bg-stone-900/50 p-2 rounded border border-stone-800">
                       <div className="text-[10px] text-stone-500">粘聚力 (c)</div>
                       <div className="text-lg font-bold text-white">18.2 kPa</div>
                   </div>
                   <div className="bg-stone-900/50 p-2 rounded border border-stone-800">
                       <div className="text-[10px] text-stone-500">孔隙水压力 (u)</div>
                       <div className={`text-lg font-bold ${simState === 'RAINFALL' ? 'text-red-400' : 'text-blue-300'}`}>
                           {simState === 'RAINFALL' ? '45.2' : '12.5'} kPa
                       </div>
                   </div>
                   <div className="bg-stone-900/50 p-2 rounded border border-stone-800">
                       <div className="text-[10px] text-stone-500">渗透系数 (k)</div>
                       <div className="text-lg font-bold text-stone-300">1.5e-5</div>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="预警日志" subtitle="ALERTS" className="flex-1 border-stone-700">
               <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {[
                       { time: '10:45', msg: 'GNSS-03 监测点位移速率超标 (2.5mm/h)', level: 'High' },
                       { time: '09:30', msg: '深部测斜管 ZK-02 在 -18m 处发生剪切变形', level: 'Med' },
                       { time: '08:00', msg: '24小时累计降雨量达到 50mm', level: 'Low' },
                   ].map((log, i) => (
                       <div key={i} className={`p-2 rounded border-l-2 text-[10px] ${log.level === 'High' ? 'bg-red-900/10 border-red-500 text-red-200' : 'bg-stone-800/50 border-yellow-500 text-stone-300'}`}>
                           <div className="font-mono opacity-50 mb-0.5">{log.time}</div>
                           <div>{log.msg}</div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <button className="w-full py-3 bg-amber-900/20 hover:bg-amber-900/40 text-amber-500 border border-amber-900/50 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all">
               <FileText size={14} /> 生成地质灾害评估报告
           </button>

        </div>

      </div>
    </div>
  );
};
