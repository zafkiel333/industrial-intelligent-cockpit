
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/tailings-safety/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[km-tailings-safety]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/km-tailings-safety';
import { DamSafetyState } from '../../components/knowledge-manage/tailings-safety/three-types';
import { 
  Mountain, AlertTriangle, Droplets, Ruler, 
  Activity, BookOpen, Search, Filter, 
  ArrowRight, CloudRain, ShieldCheck, Thermometer,
  Eye, Info
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  LineChart, Line, BarChart, Bar, ReferenceLine, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- MOCK DATA ---

const THRESHOLD_RULES = [
  { id: 'T-001', grade: 'I等库', dryBeach: '≥150m', safetyFreeboard: '≥1.5m', status: 'Active' },
  { id: 'T-002', grade: 'II等库', dryBeach: '≥100m', safetyFreeboard: '≥1.2m', status: 'Active' },
  { id: 'T-003', grade: 'III等库', dryBeach: '≥70m', safetyFreeboard: '≥1.0m', status: 'Active' },
  { id: 'T-004', grade: 'IV等库', dryBeach: '≥50m', safetyFreeboard: '≥0.7m', status: 'Active' },
  { id: 'T-005', grade: 'V等库', dryBeach: '≥40m', safetyFreeboard: '≥0.5m', status: 'Active' },
];

const SATURATION_DATA = Array.from({length: 20}, (_, i) => ({
  dist: i * 5, // Distance from dam crest
  depth: 25 - (i * 0.8) - Math.random(), // Depth of phreatic line
  limit: 5 // Critical depth limit
}));

const SAFETY_FACTOR_DATA = [
  { subject: '抗滑稳定 (Sliding)', A: 1.35, fullMark: 1.5, threshold: 1.15 },
  { subject: '渗透稳定 (Seepage)', A: 1.42, fullMark: 1.5, threshold: 1.2 },
  { subject: '抗震稳定 (Seismic)', A: 1.25, fullMark: 1.5, threshold: 1.1 },
  { subject: '排洪能力 (Discharge)', A: 1.50, fullMark: 1.5, threshold: 1.0 },
  { subject: '干滩长度 (Beach)', A: 1.10, fullMark: 1.5, threshold: 1.0 },
];

const RAIN_HISTORY = Array.from({length: 12}, (_, i) => ({
  time: `${i*2}:00`,
  rain: Math.random() * 20,
  level: 14 + Math.sin(i * 0.2) * 2
}));

export const TailingsSafetyKbView: React.FC = () => {
  const [damState, setDamState] = useState<DamSafetyState>('NORMAL');
  const [waterLevel, setWaterLevel] = useState(14.0); // Meters (Max 20 in visual)
  const [rainMode, setRainMode] = useState(false);
  const [selectedRule, setSelectedRule] = useState(THRESHOLD_RULES[1]);

  // Derived Values
  // Dry Beach Length approx calculation: (DamHeight - WaterLevel) * SlopeRatio
  // DamHeight = 20, Slope = 1.33
  const currentDryBeach = Math.max(0, (20 - waterLevel) * 1.33 * 5).toFixed(1); // Scale factor 5 for realism
  
  // Simulation Loop
  useEffect(() => {
    let interval: any;
    if (rainMode) {
        interval = setInterval(() => {
            setWaterLevel(prev => {
                const next = prev + 0.05;
                if (next > 19) return 19;
                return next;
            });
            setDamState('RISING');
        }, 200);
    } else {
        setDamState('NORMAL');
    }
    
    // Auto state check
    if (waterLevel > 18) setDamState('CRITICAL');
    else if (waterLevel > 16) setDamState('WARNING');

    return () => clearInterval(interval);
  }, [rainMode, waterLevel]);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-stone-200 bg-[#1c1917] p-2 relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-stone-900/80 border border-cyan-900/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-cyan-900/20 border-2 border-cyan-600 rounded flex items-center justify-center relative shadow-[0_0_15px_rgba(8,145,178,0.3)]">
             <Mountain size={30} className="text-cyan-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <ShieldCheck size={12} /> Geotechnical Safety Database
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               尾矿库 <span className="text-cyan-500 italic">干滩长度与浸润线安全阈值库</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Current Level</div>
                <div className="text-3xl font-mono font-black text-white">{waterLevel.toFixed(2)} <span className="text-sm text-stone-600 font-normal">m</span></div>
             </div>
             <div className="h-10 w-[1px] bg-stone-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Dry Beach</div>
                <div className={`text-2xl font-mono font-black ${parseFloat(currentDryBeach) < 50 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                    {currentDryBeach} <span className="text-sm text-stone-600 font-normal">m</span>
                </div>
             </div>
             <div className="h-10 w-[1px] bg-stone-700"></div>
             <div className="text-right">
                 <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Risk State</div>
                 <div className={`text-xl font-bold px-2 rounded ${damState === 'CRITICAL' ? 'bg-red-900 text-red-200' : damState === 'WARNING' ? 'bg-yellow-900 text-yellow-200' : 'bg-green-900 text-green-200'}`}>
                     {damState}
                 </div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 flex-1 min-h-0 z-10">
        
        {/* --- LEFT: Standards Library --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="安全阈值规范 (GB 39496)" subtitle="STANDARDS" className="flex-1 border-cyan-900/30 bg-[#0c0a09]/90">
              <div className="flex flex-col gap-2 mt-2">
                  <div className="relative mb-3">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={14} />
                       <input 
                         type="text" 
                         placeholder="搜索库等或规范..." 
                         className="w-full bg-stone-900 border border-stone-700 rounded-sm py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-cyan-500 text-stone-200"
                       />
                  </div>
                  
                  {THRESHOLD_RULES.map(rule => (
                      <div 
                        key={rule.id}
                        onClick={() => setSelectedRule(rule)}
                        className={`p-3 rounded border cursor-pointer transition-all hover:translate-x-1 group relative overflow-hidden
                           ${selectedRule.id === rule.id 
                               ? 'bg-cyan-900/20 border-cyan-500 shadow-[inset_0_0_15px_rgba(8,145,178,0.1)]' 
                               : 'bg-stone-900/40 border-stone-800 hover:border-stone-600'}
                        `}
                      >
                          {selectedRule.id === rule.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>}
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-bold text-stone-200 group-hover:text-white">{rule.grade}</span>
                              <span className="text-[10px] bg-stone-800 px-1.5 rounded text-stone-400">{rule.status}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-stone-500">
                              <div>Min Dry Beach: <span className="text-cyan-400 font-bold">{rule.dryBeach}</span></div>
                              <div>Safety H: <span className="text-cyan-400 font-bold">{rule.safetyFreeboard}</span></div>
                          </div>
                      </div>
                  ))}
              </div>
           </SciFiCard>

           <SciFiCard title="稳定性系数雷达" subtitle="FoS" className="h-[250px] border-stone-800">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SAFETY_FACTOR_DATA}>
                           <PolarGrid stroke="#292524" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#78716c', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 1.6]} tick={false} axisLine={false} />
                           <Radar name="Current FoS" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                           <Radar name="Limit" dataKey="threshold" stroke="#ef4444" strokeWidth={1} fill="none" strokeDasharray="3 3"/>
                           <Legend />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Twin & Simulation --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-[#050505] border border-cyan-900/20 rounded-lg overflow-hidden relative shadow-2xl group flex flex-col">
               {/* 3D Scene */}
               <div className="flex-1 relative">
                   <ThreeScene state={damState} waterLevel={waterLevel} />
                   <div className="absolute top-4 right-4 z-20">
                     <ModelLibraryLink url={MODEL_LIB_URL} />
                   </div>

                   {/* HUD Overlays */}
                   <div className="absolute top-4 left-4 z-20 pointer-events-none">
                       <div className="bg-stone-950/80 backdrop-blur border border-cyan-500/30 p-3 rounded-sm flex flex-col border-l-4 border-l-cyan-500 shadow-xl">
                           <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                               <Activity size={10}/> Dynamic Monitor
                           </div>
                           <div className="text-xl font-black text-white">{selectedRule.grade} Standard</div>
                           <div className="text-xs text-stone-400 mt-1">Req Beach: {selectedRule.dryBeach}</div>
                       </div>
                   </div>

                   {/* Visual Alert */}
                   {damState === 'CRITICAL' && (
                       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-900/80 border-2 border-red-500 p-6 rounded-xl flex flex-col items-center animate-bounce z-30">
                           <AlertTriangle size={48} className="text-white mb-2" />
                           <div className="text-2xl font-black text-white uppercase">OVERTOPPING RISK</div>
                           <div className="text-sm text-red-200">Immediate Drainage Required</div>
                       </div>
                   )}
               </div>

               {/* Simulation Controls */}
               <div className="h-16 bg-stone-900/80 border-t border-stone-800 flex items-center px-6 gap-6 backdrop-blur">
                   <div className="flex items-center gap-3 flex-1">
                       <CloudRain size={18} className={rainMode ? "text-blue-400" : "text-stone-500"} />
                       <div className="flex-1 flex flex-col">
                           <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                               <span>Manual Water Level Control</span>
                               <span className="text-cyan-400 font-mono">{waterLevel.toFixed(1)}m</span>
                           </div>
                           <input 
                             type="range" min="5" max="19" step="0.1" 
                             value={waterLevel} 
                             onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
                             className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                           />
                       </div>
                   </div>
                   
                   <button 
                     onClick={() => setRainMode(!rainMode)}
                     className={`px-4 py-2 rounded text-xs font-bold transition-all border flex items-center gap-2
                        ${rainMode ? 'bg-blue-600 text-white border-blue-400' : 'bg-stone-800 text-stone-400 border-stone-600 hover:text-white'}
                     `}
                   >
                       {rainMode ? 'STOP RAIN' : 'SIMULATE RAIN'}
                   </button>
               </div>
           </div>

           {/* Bottom Charts: Saturation Line */}
           <div className="h-[200px] bg-stone-900/40 border border-stone-800 rounded-lg p-3 overflow-hidden">
               <div className="text-[10px] text-stone-500 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>浸润线埋深剖面 (Phreatic Depth Profile)</span>
                   <span className="text-cyan-500 flex items-center gap-1"><Ruler size={10}/> Critical Depth: 5m</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={SATURATION_DATA}>
                       <defs>
                           <linearGradient id="satGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                               <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                       <XAxis dataKey="dist" stroke="#57534e" tick={{fontSize: 10}} label={{ value: 'Dist from Crest (m)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#57534e' }} />
                       <YAxis stroke="#57534e" tick={{fontSize: 10}} label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#57534e' }} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#0891b2'}} />
                       <ReferenceLine y={5} stroke="red" strokeDasharray="3 3" label={{value:'Limit', fill:'red', fontSize:10}} />
                       <Area type="monotone" dataKey="depth" stroke="#0ea5e9" fill="url(#satGrad)" strokeWidth={2} name="Phreatic Depth" />
                   </AreaChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* --- RIGHT: Monitoring & Logs --- */}
        <div className="w-[320px] flex flex-col gap-4">
           
           <SciFiCard title="在线监测指标" subtitle="SENSORS" className="flex-1 border-cyan-900/30">
               <div className="flex flex-col gap-4">
                   <div className="p-3 bg-stone-900/50 border border-stone-800 rounded flex justify-between items-center">
                       <div className="flex items-center gap-3">
                           <div className="p-2 rounded bg-stone-800 text-stone-400"><Droplets size={16}/></div>
                           <div>
                               <div className="text-xs font-bold text-stone-200">孔隙水压力</div>
                               <div className="text-[10px] text-stone-500">Pore Pressure</div>
                           </div>
                       </div>
                       <div className="text-right">
                           <div className="text-lg font-mono font-bold text-white">45.2 <span className="text-xs text-stone-500">kPa</span></div>
                           <div className="text-[9px] text-green-400">Stable</div>
                       </div>
                   </div>

                   <div className="p-3 bg-stone-900/50 border border-stone-800 rounded flex justify-between items-center">
                       <div className="flex items-center gap-3">
                           <div className="p-2 rounded bg-stone-800 text-stone-400"><Eye size={16}/></div>
                           <div>
                               <div className="text-xs font-bold text-stone-200">坝体位移</div>
                               <div className="text-[10px] text-stone-500">Displacement</div>
                           </div>
                       </div>
                       <div className="text-right">
                           <div className="text-lg font-mono font-bold text-white">2.1 <span className="text-xs text-stone-500">mm</span></div>
                           <div className="text-[9px] text-green-400">Within Limit</div>
                       </div>
                   </div>
                   
                   <div className="h-32 mt-2">
                       <div className="text-[10px] text-stone-500 mb-1">Rainfall vs Level (24h)</div>
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={RAIN_HISTORY}>
                               <Line type="monotone" dataKey="rain" stroke="#0ea5e9" strokeWidth={1} dot={false} />
                               <Line type="monotone" dataKey="level" stroke="#f59e0b" strokeWidth={1} dot={false} />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </SciFiCard>

           <div className="p-4 bg-stone-900/80 border border-stone-800 rounded-lg">
               <div className="text-xs font-bold text-stone-400 uppercase mb-2 flex items-center gap-2">
                   <Info size={14} /> Expert Advice
               </div>
               <p className="text-[11px] text-stone-300 leading-relaxed italic">
                   "当前干滩长度接近警戒值。建议加强对浸润线观测管 #04-#08 的人工比测频率，并检查排渗棱体是否通畅。"
               </p>
           </div>

        </div>

      </div>
    </div>
  );
};
