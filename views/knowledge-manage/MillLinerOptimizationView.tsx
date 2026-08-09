
import React, { useState, useEffect, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Disc, Layers, Database, Calculator, 
  ArrowRight, Settings, Activity, Scale, 
  FileText, History, Zap, TrendingUp, 
  Crosshair, CheckSquare, AlertTriangle,
  ChevronRight, Microscope, Filter, Info
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Area, Line, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ScatterChart, Scatter, ReferenceLine, 
  Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, LineChart, ZAxis
} from 'recharts';

// --- MOCK DATA ---

// 1. 衬板磨损轮廓 (Liner Profile)
// 模拟一个波浪形的衬板，随着时间磨损变平
const generateLinerProfile = (wearFactor: number) => {
    const data = [];
    for (let i = 0; i <= 60; i++) {
        const x = i;
        // 原始波形 (New)
        const originalY = 10 + Math.sin(i * 0.5) * 5; 
        // 磨损后的波形 (Worn) - 峰值被磨平，谷底略微下降
        const wear = (Math.sin(i * 0.5) + 1) * 3 * wearFactor + wearFactor; 
        const currentY = Math.max(2, originalY - wear);
        
        data.push({ x, original: originalY, current: currentY });
    }
    return data;
};

// 2. 钢球级配方案 (Ball Grading Schemes)
const GRADING_SCHEMES = [
    { id: 'S-STD', name: '标准级配 (Standard)', distribution: [20, 30, 30, 20], eff: 85, wear: 'High' },
    { id: 'S-OPT-A', name: '耐磨优化型 (Wear Opt)', distribution: [15, 25, 40, 20], eff: 88, wear: 'Low' },
    { id: 'S-OPT-B', name: '细磨效能型 (Fine Grind)', distribution: [10, 20, 40, 30], eff: 94, wear: 'Med' },
];

// 3. 粒径分布 (PSD - Particle Size Distribution)
// Rosin-Rammler distribution simulation
const PSD_DATA = Array.from({length: 20}, (_, i) => {
    const size = Math.pow(1.4, i); // microns
    return {
        size: size.toFixed(0),
        feed: 100 * (1 - Math.exp(-0.0005 * Math.pow(size, 1.2))),
        product_base: 100 * (1 - Math.exp(-0.02 * Math.pow(size, 0.9))),
        product_opt: 100 * (1 - Math.exp(-0.025 * Math.pow(size, 0.95))), // Better grinding
    };
});

// 4. 优化档案记录
const ARCHIVE_LOGS = [
    { date: '2024-03-15', type: '衬板更换', desc: '更换 Cr-Mo 合金钢衬板，波峰高度 110mm。', status: 'Done' },
    { date: '2024-02-10', type: '级配调整', desc: '增加 Φ60mm 钢球比例 5%，减少 Φ100mm。', status: 'Verified' },
    { date: '2024-01-05', type: '磨损检测', desc: '3号筒体腹板衬板磨损速率异常 (1.2mm/月)。', status: 'Analysis' },
];

// 5. 磨机内部运动轨迹点 (2D Scatter for Trajectory)
const generateTrajectory = (speedPercent: number) => {
    const points = [];
    const count = 300;
    // Simulate kidney shape charge motion
    for(let i=0; i<count; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Bias angle towards the "toe" (rising side) based on speed
        const bias = speedPercent / 100 * Math.PI; 
        
        let r = Math.random() * 40 + 10;
        let theta = angle;
        
        // Simple logic to cluster points in the charge zone
        if (theta > Math.PI + bias || theta < bias) {
             // Inside charge
             const activeTheta = Math.PI * 1.2 + Math.random() * Math.PI;
             theta = activeTheta - bias * 0.5;
        }

        points.push({
            x: Math.cos(theta) * r,
            y: Math.sin(theta) * r,
            z: Math.random() // for color intensity
        });
    }
    return points;
};

// --- SVG 2D 磨机剖面组件 ---
const MillCrossSection = ({ wear }: { wear: number }) => {
    // 模拟衬板齿形
    const teeth = [];
    const radius = 140;
    const numTeeth = 24;
    for (let i = 0; i < numTeeth; i++) {
        const angle = (i / numTeeth) * Math.PI * 2;
        const nextAngle = ((i + 1) / numTeeth) * Math.PI * 2;
        
        // 磨损导致齿高降低
        const toothHeight = 20 * (1 - wear); 
        
        const x1 = Math.cos(angle) * radius;
        const y1 = Math.sin(angle) * radius;
        const x2 = Math.cos(angle + (nextAngle-angle)/2) * (radius - toothHeight);
        const y2 = Math.sin(angle + (nextAngle-angle)/2) * (radius - toothHeight);
        const x3 = Math.cos(nextAngle) * radius;
        const y3 = Math.sin(nextAngle) * radius;

        teeth.push(`${x1},${y1} ${x2},${y2} ${x3},${y3}`);
    }

    return (
        <svg viewBox="0 0 320 320" className="w-full h-full animate-[spin_20s_linear_infinite]">
            <defs>
                <radialGradient id="millGrad">
                    <stop offset="50%" stopColor="transparent" />
                    <stop offset="95%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#475569" />
                </radialGradient>
            </defs>
            {/* 筒体外壳 */}
            <circle cx="160" cy="160" r="150" fill="none" stroke="#475569" strokeWidth="4" />
            
            {/* 衬板齿圈 */}
            <g transform="translate(160, 160)">
                <polygon points={teeth.join(' ')} fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.8" />
                <circle r={radius} fill="url(#millGrad)" opacity="0.3" />
            </g>

            {/* 中心标记 */}
            <circle cx="160" cy="160" r="5" fill="#94a3b8" />
            <line x1="150" y1="160" x2="170" y2="160" stroke="#94a3b8" />
            <line x1="160" y1="150" x2="160" y2="170" stroke="#94a3b8" />
        </svg>
    );
};


export const MillLinerOptimizationView: React.FC = () => {
  const [activeScheme, setActiveScheme] = useState('S-OPT-B');
  const [wearProgress, setWearProgress] = useState(0.3); // 30% worn
  const [millSpeed, setMillSpeed] = useState(75); // % Critical Speed
  const [fillRate, setFillRate] = useState(35); // % Volume
  const [trajectoryData, setTrajectoryData] = useState(generateTrajectory(75));

  // 动态计算更新
  useEffect(() => {
    const interval = setInterval(() => {
        setTrajectoryData(generateTrajectory(millSpeed));
    }, 200); // 刷新轨迹模拟
    return () => clearInterval(interval);
  }, [millSpeed]);

  const currentScheme = GRADING_SCHEMES.find(s => s.id === activeScheme) || GRADING_SCHEMES[0];
  const linerProfileData = useMemo(() => generateLinerProfile(wearProgress), [wearProgress]);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#0c0a09] p-2 relative overflow-hidden">
      
      {/* 噪点纹理背景 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-stone-900/80 border border-amber-700/30 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-600/20 border-2 border-amber-500 rounded-lg flex items-center justify-center relative shadow-[0_0_20px_rgba(245,158,11,0.2)]">
             <Disc size={32} className="text-amber-400 animate-spin-slow" />
             <div className="absolute inset-0 border border-amber-500/50 rounded-lg scale-110"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-amber-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Database size={12} /> Comminution Archive
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               磨机衬板 <span className="text-amber-500 italic">钢球级配优化档案</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Mill ID</div>
                <div className="text-2xl font-mono font-black text-white">SAG-02</div>
             </div>
             <div className="h-10 w-[1px] bg-stone-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Optimized P80</div>
                <div className="text-2xl font-mono font-black text-emerald-400">74 <span className="text-sm text-stone-600">μm</span></div>
             </div>
             <div className="h-10 w-[1px] bg-stone-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Specific Energy</div>
                <div className="text-2xl font-mono font-black text-cyan-400">12.5 <span className="text-sm text-stone-600">kWh/t</span></div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Liner Lifecycle & Archive --- */}
        <div className="w-full lg:w-[340px] flex flex-col gap-4">
           
           <SciFiCard title="衬板磨损生命周期" subtitle="LIFECYCLE" className="flex-1 border-amber-900/30 bg-[#14100b]/90">
              <div className="flex flex-col gap-4 h-full pt-2">
                  <div className="h-[180px] bg-black/40 rounded border border-stone-800 p-2 relative">
                      <div className="absolute top-2 right-2 text-[9px] text-stone-500 flex gap-2">
                          <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-stone-600"></div> Original</span>
                          <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-amber-500"></div> Current</span>
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={linerProfileData}>
                              <defs>
                                  <linearGradient id="wearFill" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                              <XAxis dataKey="x" hide />
                              <YAxis hide domain={[0, 20]} />
                              <Area type="monotone" dataKey="original" stroke="#44403c" fill="none" strokeWidth={1} strokeDasharray="4 4"/>
                              <Area type="monotone" dataKey="current" stroke="#f59e0b" fill="url(#wearFill)" strokeWidth={2} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <div className="flex justify-between text-xs text-stone-400 mb-1">
                              <span>当前磨损率 (Wear Rate)</span>
                              <span className="text-amber-400 font-mono">{(wearProgress*100).toFixed(0)}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="1" step="0.05"
                            value={wearProgress}
                            onChange={(e) => setWearProgress(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                          <div className="bg-stone-900/50 p-2 rounded border border-stone-800">
                              <div className="text-[9px] text-stone-500">已服役时长</div>
                              <div className="text-sm font-bold text-white">4,250 <span className="text-[9px]">hrs</span></div>
                          </div>
                          <div className="bg-stone-900/50 p-2 rounded border border-stone-800">
                              <div className="text-[9px] text-stone-500">剩余寿命预测</div>
                              <div className="text-sm font-bold text-white">1,850 <span className="text-[9px]">hrs</span></div>
                          </div>
                      </div>
                  </div>
              </div>
           </SciFiCard>

           <SciFiCard title="优化档案记录" subtitle="LOGS" className="h-[280px] border-stone-800">
               <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {ARCHIVE_LOGS.map((log, i) => (
                       <div key={i} className="p-3 rounded bg-stone-900/40 border border-stone-800 hover:border-amber-900/50 transition-colors group cursor-pointer">
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-[10px] font-mono text-stone-500">{log.date}</span>
                               <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                                   log.status === 'Done' ? 'bg-green-900/20 text-green-400' : 
                                   log.status === 'Verified' ? 'bg-blue-900/20 text-blue-400' : 'bg-yellow-900/20 text-yellow-400'
                               }`}>{log.status}</span>
                           </div>
                           <div className="text-xs font-bold text-stone-300 group-hover:text-amber-400 transition-colors">{log.type}</div>
                           <div className="text-[10px] text-stone-500 mt-1 line-clamp-2">{log.desc}</div>
                       </div>
                   ))}
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: Simulation Engine --- */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
           
           {/* Visual Simulation Area */}
           <div className="flex-1 bg-black border border-amber-900/20 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-transparent z-20"></div>
               
               {/* Controls Bar */}
               <div className="flex justify-between items-center p-4 bg-gradient-to-b from-stone-900/80 to-transparent z-10">
                   <div>
                       <div className="text-[10px] text-amber-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
                           <Activity size={14} className="animate-pulse" /> Simulation Kernel
                       </div>
                       <h2 className="text-xl font-black text-white italic">介质运动轨迹仿真 (DEM)</h2>
                   </div>
                   <div className="flex gap-4">
                        <div className="flex flex-col">
                            <span className="text-[9px] text-stone-500 uppercase">Critical Speed</span>
                            <span className="text-lg font-mono text-cyan-400 font-bold">{millSpeed}%</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-stone-500 uppercase">Fill Rate</span>
                            <span className="text-lg font-mono text-cyan-400 font-bold">{fillRate}%</span>
                        </div>
                   </div>
               </div>

               {/* Main Visualizer */}
               <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                   {/* Background Grid */}
                   <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                   
                   {/* Mill Cross Section SVG */}
                   <div className="w-[320px] h-[320px] relative z-10">
                       <MillCrossSection wear={wearProgress} />
                   </div>

                   {/* Particle System (Recharts Scatter) Layered on top */}
                   <div className="absolute inset-0 z-20 pointer-events-none">
                       <ResponsiveContainer width="100%" height="100%">
                           <ScatterChart margin={{top: 0, right: 0, bottom: 0, left: 0}}>
                               <XAxis type="number" dataKey="x" domain={[-50, 50]} hide />
                               <YAxis type="number" dataKey="y" domain={[-50, 50]} hide />
                               <ZAxis type="number" dataKey="z" range={[10, 50]} />
                               <Scatter name="Charge" data={trajectoryData} fill="#f59e0b" animationDuration={0} />
                           </ScatterChart>
                       </ResponsiveContainer>
                   </div>

                   {/* Sliders Overlay */}
                   <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-2/3 bg-stone-900/90 backdrop-blur border border-stone-700 rounded-full px-6 py-2 flex gap-6 z-30">
                       <div className="flex-1 flex items-center gap-2">
                           <span className="text-[10px] text-stone-400 w-12">SPEED</span>
                           <input type="range" min="50" max="100" value={millSpeed} onChange={(e)=>setMillSpeed(parseInt(e.target.value))} className="flex-1 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                       </div>
                       <div className="flex-1 flex items-center gap-2">
                           <span className="text-[10px] text-stone-400 w-12">FILL</span>
                           <input type="range" min="20" max="45" value={fillRate} onChange={(e)=>setFillRate(parseInt(e.target.value))} className="flex-1 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                       </div>
                   </div>
               </div>
           </div>

           {/* Bottom: Charts */}
           <div className="h-[200px] grid grid-cols-2 gap-4">
               <SciFiCard title="磨矿产品粒度 (PSD)" subtitle="COMPARISON" className="border-stone-800" noPadding>
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={PSD_DATA} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                               <XAxis dataKey="size" stroke="#57534e" tick={{fontSize: 10}} label={{ value: 'Size (μm)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                               <YAxis stroke="#57534e" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#d97706'}} />
                               <Legend verticalAlign="top" height={20} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                               <Line type="monotone" dataKey="feed" stroke="#57534e" strokeWidth={1} dot={false} name="Feed" />
                               <Line type="monotone" dataKey="product_base" stroke="#f59e0b" strokeWidth={2} dot={false} name="Baseline" />
                               <Line type="monotone" dataKey="product_opt" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="3 3" name="Optimized" />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>
               
               <SciFiCard title="能耗/球耗对比" subtitle="KPIs" className="border-stone-800">
                    <div className="h-full flex items-center justify-around px-4">
                        <div className="text-center">
                            <div className="text-xs text-stone-500 mb-2">单位电耗 (kWh/t)</div>
                            <div className="flex items-end gap-2 justify-center">
                                <span className="text-2xl font-bold text-white">28.5</span>
                                <span className="text-xs font-bold text-green-400 flex items-center"><ArrowRight size={10} className="rotate-45" /> -4.2%</span>
                            </div>
                        </div>
                        <div className="w-px h-12 bg-stone-800"></div>
                        <div className="text-center">
                            <div className="text-xs text-stone-500 mb-2">钢球单耗 (kg/t)</div>
                            <div className="flex items-end gap-2 justify-center">
                                <span className="text-2xl font-bold text-white">0.65</span>
                                <span className="text-xs font-bold text-green-400 flex items-center"><ArrowRight size={10} className="rotate-45" /> -8.5%</span>
                            </div>
                        </div>
                    </div>
               </SciFiCard>
           </div>
        </div>

        {/* --- RIGHT: Grading Config --- */}
        <div className="w-[320px] flex flex-col gap-4">
           
           <SciFiCard title="钢球级配方案配置" subtitle="BALL CHARGE" className="h-1/2 border-amber-900/30">
               <div className="flex flex-col h-full gap-4">
                   <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1">
                       {GRADING_SCHEMES.map(s => (
                           <div 
                             key={s.id}
                             onClick={() => setActiveScheme(s.id)}
                             className={`p-3 rounded border cursor-pointer transition-all hover:bg-stone-800
                                ${activeScheme === s.id ? 'bg-amber-900/20 border-amber-500' : 'bg-stone-900/40 border-stone-800'}
                             `}
                           >
                               <div className="flex justify-between items-center mb-2">
                                   <span className="text-xs font-bold text-white">{s.name}</span>
                                   <span className="text-[10px] font-mono text-stone-500">{s.id}</span>
                               </div>
                               {/* Visual Bar for Distribution */}
                               <div className="h-4 flex rounded overflow-hidden w-full mb-1">
                                   <div className="bg-red-500 h-full" style={{width: `${s.distribution[0]}%`}} title="Φ100"></div>
                                   <div className="bg-orange-500 h-full" style={{width: `${s.distribution[1]}%`}} title="Φ80"></div>
                                   <div className="bg-yellow-500 h-full" style={{width: `${s.distribution[2]}%`}} title="Φ60"></div>
                                   <div className="bg-blue-500 h-full" style={{width: `${s.distribution[3]}%`}} title="Φ40"></div>
                               </div>
                               <div className="flex justify-between text-[9px] text-stone-400">
                                   <span>100mm</span>
                                   <span>80mm</span>
                                   <span>60mm</span>
                                   <span>40mm</span>
                               </div>
                           </div>
                       ))}
                   </div>
                   
                   <div className="p-3 bg-stone-900 border border-stone-800 rounded">
                       <div className="flex justify-between items-center mb-1">
                           <span className="text-xs text-stone-400">预计研磨效率</span>
                           <span className="text-sm font-bold text-emerald-400">{currentScheme.eff}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                           <div className="bg-emerald-500 h-full transition-all duration-500" style={{width: `${currentScheme.eff}%`}}></div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="智能优化建议" subtitle="AI ADVISOR" className="flex-1 border-stone-800">
               <div className="flex flex-col h-full gap-3">
                   <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded flex items-start gap-3">
                       <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                       <p className="text-[11px] text-blue-200/80 leading-relaxed italic">
                           "检测到矿石硬度系数 f 增加至 12.5，建议切换至 <strong>耐磨优化型 (S-OPT-A)</strong> 方案，并适当提高大球比例以增强冲击破碎能力。"
                       </p>
                   </div>
                   
                   <div className="flex-1 min-h-0 bg-black/20 rounded p-2">
                       <div className="text-[10px] text-stone-500 uppercase font-bold mb-2">补球策略 (Recharge)</div>
                       <div className="space-y-1">
                           <div className="flex justify-between text-xs p-1.5 bg-stone-800/50 rounded">
                               <span className="text-stone-300">Φ100mm</span>
                               <span className="text-amber-400 font-mono">150 kg/day</span>
                           </div>
                           <div className="flex justify-between text-xs p-1.5 bg-stone-800/50 rounded">
                               <span className="text-stone-300">Φ80mm</span>
                               <span className="text-amber-400 font-mono">80 kg/day</span>
                           </div>
                       </div>
                   </div>

                   <button className="w-full py-2 bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs rounded transition-all flex items-center justify-center gap-2">
                       <CheckSquare size={14} /> 应用级配方案
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};

export default MillLinerOptimizationView;
