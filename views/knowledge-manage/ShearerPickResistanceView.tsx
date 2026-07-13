
import React, { useState, useEffect, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/shearer-pick/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[km-shearer-pick]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/km-shearer-pick';
import { CutState } from '../../components/knowledge-manage/shearer-pick/three-types';
import { 
  Pickaxe, Activity, Settings, Zap, 
  RotateCw, Gauge, Flame, Layers, 
  Database, Info, ArrowRight, ShieldAlert,
  BarChart4, Microscope
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Legend, ReferenceLine
} from 'recharts';

// --- MOCK DATA GENERATORS ---

const generateForceData = (hardness: number, rpm: number) => {
    const data = [];
    for(let i=0; i<50; i++) {
        const angle = i * (360/50);
        // Simulate tri-axial forces fluctuating with rotation
        // Z: Cutting Force, Y: Normal Force, X: Lateral Force
        const noise = Math.random() * 0.2 + 0.9;
        const impact = (i % 10 === 0) ? 1.5 : 1.0; // Periodic impact of picks
        
        const zForce = Math.abs(Math.sin(i * 0.5)) * hardness * 50 * impact * noise;
        const yForce = zForce * 0.4;
        const xForce = zForce * 0.15 * (Math.random() > 0.5 ? 1 : -1);

        data.push({
            angle: angle,
            Fc: zForce, // Cutting
            Fn: yForce, // Normal
            Fl: xForce  // Lateral
        });
    }
    return data;
};

const SPECIFIC_ENERGY_DATA = Array.from({length: 20}, (_, i) => {
    const depth = i + 1; // mm
    // SE decreases as depth increases generally
    const se = 200 * Math.pow(depth, -0.3) + Math.random() * 10;
    return { depth, se };
});

const WEAR_PREDICTION = [
  { subject: '齿尖磨损', A: 85, fullMark: 100 },
  { subject: '齿体疲劳', A: 45, fullMark: 100 },
  { subject: '合金脱落风险', A: 30, fullMark: 100 },
  { subject: '卡簧失效', A: 15, fullMark: 100 },
  { subject: '齿座变形', A: 20, fullMark: 100 },
];

export const ShearerPickResistanceView: React.FC = () => {
  // --- STATE ---
  const [coalHardness, setCoalHardness] = useState(4.0); // Protodyakonov index (f)
  const [cutDepth, setCutDepth] = useState(20); // mm
  const [tractionSpeed, setTractionSpeed] = useState(3.5); // m/min
  const [drumRpm, setDrumRpm] = useState(60); // rev/min
  
  const [cutState, setCutState] = useState<CutState>('CUTTING');
  const [instantForce, setInstantForce] = useState(0);
  
  // Real-time calculation simulation
  const forceData = useMemo(() => generateForceData(coalHardness, drumRpm), [coalHardness, drumRpm]);
  
  useEffect(() => {
      const interval = setInterval(() => {
          // Simulate instant force fluctuation
          const baseForce = coalHardness * cutDepth * 2;
          const noise = Math.random() * 0.2 + 0.9;
          let val = baseForce * noise;
          
          if (cutState === 'HARD_INCLUSION') val *= 2.5;
          setInstantForce(val);

          // Auto state logic
          if (val > 800 && cutState !== 'HARD_INCLUSION') {
              setCutState('HARD_INCLUSION');
          } else if (val < 100 && cutState !== 'IDLE') {
              setCutState('IDLE');
          } else if (val > 100 && val < 800 && cutState === 'HARD_INCLUSION') {
              setCutState('CUTTING');
          }

      }, 200);
      return () => clearInterval(interval);
  }, [coalHardness, cutDepth, cutState]);

  // Derived metrics
  const specificEnergy = (instantForce / (cutDepth * 0.1)).toFixed(1); // Mock calculation
  const powerConsumption = ((instantForce * drumRpm) / 9550).toFixed(1); // kW approx

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#08080a] p-2 relative overflow-hidden">
      
      {/* Background Texture - Carbon Fiber / Rock */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/80 border-b-2 border-orange-600/60 p-4 rounded-lg backdrop-blur-md z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-orange-600/20 border-2 border-orange-500 rounded flex items-center justify-center relative shadow-[0_0_20px_rgba(249,115,22,0.4)]">
             <Pickaxe size={30} className="text-orange-400" />
             <div className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full animate-ping"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-orange-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Microscope size={12} /> Coal Cutting Mechanics Lab
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               采煤机截齿 <span className="text-orange-500 italic">截割阻力模型</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Instant Force</div>
                <div className={`text-3xl font-mono font-black ${instantForce > 600 ? 'text-red-500' : 'text-white'}`}>
                    {instantForce.toFixed(0)} <span className="text-sm font-normal text-slate-600">N</span>
                </div>
            </div>
             <div className="h-10 w-[1px] bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Specific Energy</div>
                <div className="text-2xl font-mono font-bold text-cyan-400">
                    {specificEnergy} <span className="text-xs text-slate-500">kWh/m³</span>
                </div>
            </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Parameters & Control --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4">
           
           <SciFiCard title="截割参数配置 (Inputs)" subtitle="PARAMS" className="border-orange-900/30 bg-[#120f0a]/90">
              <div className="flex flex-col gap-5 py-2">
                 {/* Parameter Sliders */}
                 <div className="space-y-2">
                     <div className="flex justify-between text-xs text-slate-400">
                         <span className="flex items-center gap-2"><Layers size={12}/> 煤岩坚固性系数 (f)</span>
                         <span className="text-orange-400 font-mono">{coalHardness.toFixed(1)}</span>
                     </div>
                     <input 
                       type="range" min="1" max="10" step="0.1" 
                       value={coalHardness} 
                       onChange={(e) => setCoalHardness(parseFloat(e.target.value))}
                       className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                     />
                     <div className="flex justify-between text-[9px] text-slate-600">
                         <span>Soft Coal</span>
                         <span>Hard Rock</span>
                     </div>
                 </div>

                 <div className="space-y-2">
                     <div className="flex justify-between text-xs text-slate-400">
                         <span className="flex items-center gap-2"><ArrowRight size={12}/> 截割深度 (h)</span>
                         <span className="text-cyan-400 font-mono">{cutDepth} mm</span>
                     </div>
                     <input 
                       type="range" min="5" max="50" step="1" 
                       value={cutDepth} 
                       onChange={(e) => setCutDepth(parseInt(e.target.value))}
                       className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                     />
                 </div>

                 <div className="space-y-2">
                     <div className="flex justify-between text-xs text-slate-400">
                         <span className="flex items-center gap-2"><RotateCw size={12}/> 滚筒转速 (n)</span>
                         <span className="text-green-400 font-mono">{drumRpm} rpm</span>
                     </div>
                     <input 
                       type="range" min="30" max="120" step="5" 
                       value={drumRpm} 
                       onChange={(e) => setDrumRpm(parseInt(e.target.value))}
                       className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                     />
                 </div>

                 <div className="p-3 bg-orange-900/10 border border-orange-600/20 rounded mt-2">
                     <div className="text-[10px] text-orange-500 font-bold uppercase mb-2">Theoretical Formula (Evans)</div>
                     <div className="text-[11px] font-mono text-slate-400">
                        Fc = (2 · σt · h · w · sin(α)) / (1 - sin(α))
                     </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="比能耗特性 (Specific Energy)" subtitle="SE CURVE" className="flex-1 border-slate-800">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={SPECIFIC_ENERGY_DATA}>
                           <defs>
                               <linearGradient id="seGrad" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="depth" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Depth (mm)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} width={30} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0e14', borderColor: '#0ea5e9'}} />
                           <Area type="monotone" dataKey="se" stroke="#0ea5e9" fill="url(#seGrad)" strokeWidth={2} name="SE (kWh/m³)" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Twin --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-orange-900/30 rounded-2xl overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene state={cutState} rpm={drumRpm} hardness={coalHardness} />
               <div className="absolute top-4 right-4 z-20">
                 <ModelLibraryLink url={MODEL_LIB_URL} />
               </div>

               {/* Overlays */}
               <div className="absolute top-4 left-4 z-20 pointer-events-none">
                   <div className="bg-slate-950/80 backdrop-blur border-l-4 border-orange-500 p-4 rounded-sm shadow-xl flex flex-col">
                       <div className="text-[10px] text-orange-500 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Activity size={12}/> Simulation State
                       </div>
                       <div className={`text-2xl font-black ${cutState === 'HARD_INCLUSION' ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                           {cutState}
                       </div>
                       <div className="text-[10px] text-slate-400 mt-2 font-mono">
                           Power Draw: {powerConsumption} kW
                       </div>
                   </div>
               </div>

               {/* Force Vector Legend */}
               <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1 items-end bg-black/60 p-2 rounded border border-slate-800">
                   <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">Force Vectors</div>
                   <div className="flex items-center gap-2 text-[10px] text-orange-400"><div className="w-3 h-0.5 bg-orange-500"></div> Cutting Force (Fc)</div>
                   <div className="flex items-center gap-2 text-[10px] text-blue-400"><div className="w-3 h-0.5 bg-blue-500"></div> Normal Force (Fn)</div>
               </div>
           </div>

           {/* Real-time Force Spectrum */}
           <div className="h-[200px] bg-slate-900/40 border border-slate-800 rounded-lg p-3 overflow-hidden">
               <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>三向阻力波形 (Tri-axial Force)</span>
                   <span className="text-orange-500">Live Data</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={forceData}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="angle" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Rotation Angle (°)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                       <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                       <Tooltip contentStyle={{backgroundColor: '#02040a', borderColor: '#333'}} />
                       <Legend verticalAlign="top" height={20} wrapperStyle={{fontSize: '10px'}}/>
                       <Line type="monotone" dataKey="Fc" stroke="#f97316" strokeWidth={2} dot={false} name="Fc (主切削力)" />
                       <Line type="monotone" dataKey="Fn" stroke="#3b82f6" strokeWidth={1} dot={false} name="Fn (法向力)" />
                       <Line type="monotone" dataKey="Fl" stroke="#10b981" strokeWidth={1} dot={false} name="Fl (侧向力)" />
                   </LineChart>
               </ResponsiveContainer>
           </div>

        </div>

        {/* --- RIGHT: Analytics & Wear --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="截齿磨损寿命预测" subtitle="WEAR" className="h-[280px] border-slate-800">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={WEAR_PREDICTION}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Wear Risk" dataKey="A" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0e14', borderColor: '#ef4444'}} />
                       </RadarChart>
                   </ResponsiveContainer>
                   <div className="text-center text-[10px] text-slate-500 mt-[-10px]">
                       综合磨损指数: <span className="text-red-400 font-bold">High</span>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="智能优化建议" subtitle="AI" className="flex-1 border-orange-900/30">
               <div className="flex flex-col h-full gap-4">
                   <div className="p-3 bg-orange-950/20 border border-orange-900/40 rounded">
                       <div className="flex items-center gap-2 mb-2">
                           <Zap size={16} className="text-orange-500" />
                           <span className="text-xs font-bold text-orange-200">参数优化</span>
                       </div>
                       <p className="text-[11px] text-slate-400 leading-relaxed italic">
                          "当前 f={coalHardness.toFixed(1)} 工况下，建议将截深增加至 35mm 并降低牵引速度至 2.8m/min，可使比能耗降低 12%。"
                       </p>
                   </div>

                   <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] border-b border-slate-800 pb-1">
                          <span className="text-slate-500">Pick Consumption</span>
                          <span className="text-white">0.45 pcs/kt</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] border-b border-slate-800 pb-1">
                          <span className="text-slate-500">Dust Generation</span>
                          <span className="text-white">High</span>
                      </div>
                   </div>
                   
                   <div className="mt-auto flex gap-2">
                       <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] rounded border border-slate-700 text-slate-300">
                           重置模型
                       </button>
                       <button className="flex-1 py-2 bg-orange-700 hover:bg-orange-600 text-[10px] font-bold rounded text-white shadow-lg shadow-orange-900/40">
                           应用优化参数
                       </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
