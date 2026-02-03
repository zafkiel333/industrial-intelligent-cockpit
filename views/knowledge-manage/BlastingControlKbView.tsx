
import React, { useState, useEffect, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Activity, Zap, Target, Layers, 
  Settings, AlertTriangle, FileText, 
  Crosshair, Timer, Scale, Radio,
  TrendingDown, ShieldCheck, Flame,
  MousePointer2, Database, Calculator,
  Play, ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, 
  ReferenceLine, AreaChart, Area, ScatterChart, Scatter, ZAxis, Cell, Legend
} from 'recharts';

// --- MOCK DATA ---

// 1. 爆破震动波形 (Seismic Waveform)
const WAVEFORM_DATA = Array.from({length: 100}, (_, i) => {
    // 模拟衰减震荡波
    const t = i * 0.1;
    const envelope = Math.exp(-0.2 * t) * (t > 1 ? 1 : 0);
    const wave = Math.sin(10 * t) * Math.sin(3 * t) * 5 * envelope;
    // 添加一点随机噪声
    const noise = (Math.random() - 0.5) * 0.2;
    return {
        time: t.toFixed(1),
        velocity: wave + noise,
        limit: 2.0 // cm/s 安全阈值
    };
});

// 2. 萨达夫公式回归分析 (PPV vs Distance)
// V = K * (Q^(1/3) / R)^α
const REGRESSION_DATA = Array.from({length: 20}, (_, i) => {
    const dist = 50 + i * 20; // 距离爆心距离 (m)
    // 假设 K=150, alpha=1.5, Q=200kg
    const sd = Math.pow(200, 1/3) / dist;
    const ppv = 150 * Math.pow(sd, 1.5);
    return {
        distance: dist,
        ppv: ppv,
        measured: ppv * (0.8 + Math.random() * 0.4) // 模拟实测值
    };
});

// 3. 炮孔布局数据 (Drill Pattern)
const generateDrillPattern = (rows: number, cols: number) => {
    const holes = [];
    for(let r=0; r<rows; r++) {
        for(let c=0; c<cols; c++) {
            // 毫秒延期：排间25ms，孔间17ms
            const delay = r * 25 + c * 17;
            holes.push({
                id: `H-${r}-${c}`,
                r, c,
                x: c * 4 + 2, // 4m 间距
                y: r * 3 + 2, // 3m 排距
                delay,
                charge: 120, // kg
                status: 'Ready'
            });
        }
    }
    return holes;
};

const DRILL_HOLES = generateDrillPattern(5, 8);

// 4. 优化建议库
const OPTIMIZATION_RULES = [
    { id: 'R01', type: 'Vibration', title: '微差干扰降震', desc: '建议孔间延期由 17ms 调整为 25ms，利用波形干涉降低主频能量。', score: 92 },
    { id: 'R02', type: 'Cost', title: '炸药单耗优化', desc: '岩石系数 f=8-10，建议单耗降低至 0.45 kg/m³。', score: 85 },
    { id: 'R03', type: 'Fragmentation', title: '空气间隔装药', desc: '采用底部空气间隔，改善破碎块度均匀性。', score: 88 },
];

// --- COMPONENTS ---

// 1. 炮孔布置与起爆时序图 (SVG)
const BlastingPatternMap = ({ activeHole, onHoleClick }: { activeHole: string | null, onHoleClick: (h: any) => void }) => {
    return (
        <div className="w-full h-full relative bg-[#0a0500] rounded-lg border border-orange-900/30 overflow-hidden group">
            {/* 网格背景 */}
            <div className="absolute inset-0 opacity-10" 
                 style={{backgroundImage: 'linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
            </div>
            
            <svg viewBox="0 0 400 200" className="w-full h-full absolute inset-0 p-4">
                <defs>
                    <radialGradient id="blastGlow">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#7c2d12" stopOpacity="0"/>
                    </radialGradient>
                </defs>

                {/* 连接线 (起爆网络) */}
                <g stroke="#451a03" strokeWidth="1">
                    {DRILL_HOLES.map((h, i) => {
                         // 简单的横向连接
                         if (h.c < 7) {
                             const next = DRILL_HOLES.find(n => n.r === h.r && n.c === h.c + 1);
                             if(next) return <line key={`l-r-${i}`} x1={h.x * 10} y1={h.y * 10} x2={next.x * 10} y2={next.y * 10} />;
                         }
                         return null;
                    })}
                </g>

                {/* 炮孔 */}
                {DRILL_HOLES.map((hole) => {
                    const isActive = activeHole === hole.id;
                    const radius = isActive ? 8 : 4;
                    
                    return (
                        <g 
                          key={hole.id} 
                          onClick={() => onHoleClick(hole)} 
                          className="cursor-pointer transition-all hover:opacity-80"
                          transform={`translate(${hole.x * 10}, ${hole.y * 10})`}
                        >
                            {/* 起爆顺序光晕 */}
                            <circle r={radius * 2} fill="url(#blastGlow)" opacity={isActive ? 0.6 : 0.2} />
                            
                            {/* 孔位主体 */}
                            <circle 
                                r={radius} 
                                fill={isActive ? '#ffffff' : '#f97316'} 
                                stroke="#7c2d12" 
                                strokeWidth="1"
                            />
                            
                            {/* 延期时间标签 */}
                            <text 
                                y={-10} 
                                textAnchor="middle" 
                                fontSize="8" 
                                fill={isActive ? '#f97316' : '#78716c'} 
                                fontWeight="bold"
                            >
                                {hole.delay}ms
                            </text>
                        </g>
                    );
                })}
                
                {/* 自由面指示 (Free Face) */}
                <line x1="10" y1="180" x2="350" y2="180" stroke="#ef4444" strokeWidth="2" strokeDasharray="10 5" />
                <text x="180" y="195" fill="#ef4444" fontSize="10" textAnchor="middle">自由面 (Free Face)</text>
            </svg>
            
            <div className="absolute top-2 right-2 flex flex-col gap-1 text-[9px] text-slate-500 text-right">
                <span>Total Holes: {DRILL_HOLES.length}</span>
                <span>Total Charge: {(DRILL_HOLES.length * 120 / 1000).toFixed(1)} t</span>
            </div>
        </div>
    );
};

// 2. 震动热力场 (2D Canvas Simulation)
const VibrationHeatmap = ({ intensity }: { intensity: number }) => {
    return (
        <div className="w-full h-full relative bg-[#020408] rounded-lg overflow-hidden border border-slate-800">
            {/* 模拟热力图层 - 使用多个径向渐变叠加 */}
            <div className="absolute inset-0" style={{
                background: `
                    radial-gradient(circle at 30% 40%, rgba(239, 68, 68, ${0.4 * intensity}) 0%, transparent 40%),
                    radial-gradient(circle at 70% 60%, rgba(249, 115, 22, ${0.3 * intensity}) 0%, transparent 50%),
                    radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 80%)
                `
            }}></div>
            
            {/* 敏感目标标注 */}
            <div className="absolute top-[20%] left-[20%] w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75"></div>
            <div className="absolute top-[20%] left-[20%] w-2 h-2 bg-white rounded-full flex items-center justify-center group cursor-help z-10">
                <div className="absolute left-4 bg-black/80 text-[10px] text-white px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 border border-red-500">
                    <span className="text-red-400 font-bold">!</span> 居民区 (Dist: 350m)
                </div>
            </div>
            
            {/* 监测点 */}
            <div className="absolute bottom-[30%] right-[30%] w-2 h-2 bg-cyan-400 rounded-full z-10 border border-black">
                 <div className="absolute right-4 text-[9px] text-cyan-400">V1 (Sensor)</div>
            </div>
            
            {/* 等值线模拟 SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                <circle cx="30%" cy="40%" r="50" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" />
                <circle cx="30%" cy="40%" r="100" fill="none" stroke="#f97316" strokeWidth="1" strokeDasharray="4 2" />
                <circle cx="30%" cy="40%" r="180" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="4 2" />
            </svg>
        </div>
    );
};

export const BlastingControlKbView: React.FC = () => {
  const [selectedHole, setSelectedHole] = useState<any>(DRILL_HOLES[0]);
  const [simProgress, setSimProgress] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [kValue, setKValue] = useState(150);
  const [alphaValue, setAlphaValue] = useState(1.5);

  // 模拟起爆动画
  useEffect(() => {
    let interval: any;
    if (isSimulating) {
        interval = setInterval(() => {
            setSimProgress(prev => {
                if (prev >= 100) {
                    setIsSimulating(false);
                    return 0;
                }
                return prev + 2;
            });
        }, 50);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#050202] p-2 relative overflow-hidden">
      
      {/* 烈焰背景纹理 */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_top,_#ef4444_0%,_transparent_70%)]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-orange-900/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-orange-600/20 border-2 border-orange-500 rounded flex items-center justify-center relative shadow-[0_0_20px_rgba(249,115,22,0.3)]">
             <Flame size={28} className="text-orange-400" />
             <div className="absolute inset-0 bg-orange-500/10 animate-pulse rounded"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-orange-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Activity size={12} /> Precision Blasting Control
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               矿山爆破 <span className="text-orange-500 italic">参数优化与震动控制</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Max PPV (Today)</div>
                <div className="text-2xl font-mono font-black text-white">1.82 <span className="text-sm text-slate-600 font-normal">cm/s</span></div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Efficiency</div>
                <div className="text-2xl font-mono font-black text-green-400">0.42 <span className="text-sm text-slate-500 font-normal">kg/m³</span></div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Safety Compliance</div>
                <div className="text-xl font-black bg-green-900/20 text-green-500 px-2 rounded border border-green-800/30">PASS</div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Design & Parameters --- */}
        <div className="w-full lg:w-[360px] flex flex-col gap-4">
           
           <SciFiCard title="爆破网络设计台" subtitle="DESIGNER" className="h-[320px] border-orange-900/30 bg-[#0f0a05]/90">
              <div className="w-full h-full p-1 flex flex-col gap-2">
                  <div className="flex-1 border border-slate-800 rounded overflow-hidden relative">
                      <BlastingPatternMap activeHole={selectedHole?.id} onHoleClick={setSelectedHole} />
                      
                      {/* Sim Progress Bar */}
                      {isSimulating && (
                          <div className="absolute bottom-0 left-0 h-1 bg-orange-500 transition-all duration-100 ease-linear" style={{width: `${simProgress}%`}}></div>
                      )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setIsSimulating(true)}
                        disabled={isSimulating}
                        className="py-2 bg-orange-700 hover:bg-orange-600 text-white font-bold text-xs rounded flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      >
                          <Play size={14} fill="currentColor" /> 模拟起爆
                      </button>
                      <button className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded flex items-center justify-center gap-2 border border-slate-600 transition-all">
                          <Settings size={14} /> 自动布孔
                      </button>
                  </div>
              </div>
           </SciFiCard>

           <SciFiCard title="单孔参数配置" subtitle="HOLE DETAIL" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-4 p-1">
                   <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                       <span className="text-xs font-bold text-white flex items-center gap-2"><Target size={14} className="text-orange-500"/> 孔号: {selectedHole?.id}</span>
                       <span className="text-[10px] font-mono text-slate-500">Delay: {selectedHole?.delay}ms</span>
                   </div>
                   
                   <div className="space-y-3">
                       <div className="space-y-1">
                           <div className="flex justify-between text-[10px] text-slate-400">
                               <span>装药量 (Charge Weight)</span>
                               <span className="text-orange-400 font-mono">{selectedHole?.charge} kg</span>
                           </div>
                           <input type="range" className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500" defaultValue={50} />
                       </div>
                       <div className="space-y-1">
                           <div className="flex justify-between text-[10px] text-slate-400">
                               <span>孔深 (Depth)</span>
                               <span className="text-cyan-400 font-mono">12.5 m</span>
                           </div>
                           <input type="range" className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" defaultValue={70} />
                       </div>
                       <div className="space-y-1">
                           <div className="flex justify-between text-[10px] text-slate-400">
                               <span>堵塞长度 (Stemming)</span>
                               <span className="text-slate-300 font-mono">3.5 m</span>
                           </div>
                           <input type="range" className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-500" defaultValue={30} />
                       </div>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: Wave & Propagation --- */}
        <div className="flex-1 flex flex-col gap-4">
           
           <div className="grid grid-cols-2 gap-4 h-[240px]">
               {/* 震动场热力图 */}
               <SciFiCard title="震动速度场 (PPV Heatmap)" subtitle="SIMULATION" className="border-red-900/30 bg-black" noPadding>
                   <div className="w-full h-full p-2 relative">
                       <VibrationHeatmap intensity={isSimulating ? 1.0 : 0.2} />
                       <div className="absolute bottom-3 left-3 text-[9px] text-slate-500 bg-black/60 px-2 py-1 rounded border border-slate-800">
                           Max PPV: {(isSimulating ? 3.5 : 0.5).toFixed(2)} cm/s
                       </div>
                   </div>
               </SciFiCard>

               {/* 萨达夫回归分析 */}
               <SciFiCard title="衰减规律回归 (Regression)" subtitle="SADOVSKY" className="border-slate-800" noPadding>
                   <div className="w-full h-full p-2 flex flex-col">
                       <div className="flex justify-between px-2 mb-1 text-[9px] font-mono text-slate-500">
                           <span>K = {kValue}</span>
                           <span>α = {alphaValue}</span>
                       </div>
                       <div className="flex-1 min-h-0">
                           <ResponsiveContainer width="100%" height="100%">
                               <ScatterChart margin={{top: 10, right: 10, bottom: 0, left: -10}}>
                                   <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                   <XAxis type="number" dataKey="distance" name="Distance" unit="m" stroke="#64748b" tick={{fontSize: 10}} />
                                   <YAxis type="number" dataKey="ppv" name="PPV" unit="cm/s" stroke="#64748b" tick={{fontSize: 10}} />
                                   <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#0c0a09', border: '1px solid #333'}} />
                                   <Legend verticalAlign="top" height={20} wrapperStyle={{fontSize: '10px'}}/>
                                   <Scatter name="实测值" data={REGRESSION_DATA} fill="#f97316" shape="circle" />
                                   <Line dataKey="ppv" data={REGRESSION_DATA} stroke="#3b82f6" strokeWidth={2} dot={false} name="拟合曲线" />
                               </ScatterChart>
                           </ResponsiveContainer>
                       </div>
                   </div>
               </SciFiCard>
           </div>

           {/* 实时波形监测 */}
           <SciFiCard title="监测点震动波形" subtitle="SEISMOGRAPH" className="flex-1 border-slate-800">
               <div className="w-full h-full flex flex-col">
                   <div className="flex justify-between items-center mb-2 px-2">
                       <div className="flex items-center gap-2 text-xs text-slate-400">
                           <Radio size={14} className={isSimulating ? 'text-red-500 animate-pulse' : 'text-slate-600'} />
                           <span>Sensor Node: V1 (Village)</span>
                       </div>
                       <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                           <AlertTriangle size={10}/> Limit: 2.0 cm/s
                       </span>
                   </div>
                   <div className="flex-1 min-h-0">
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={WAVEFORM_DATA}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="time" hide />
                               <YAxis domain={[-3, 3]} hide />
                               <ReferenceLine y={2} stroke="red" strokeDasharray="3 3" />
                               <ReferenceLine y={-2} stroke="red" strokeDasharray="3 3" />
                               <Line 
                                 type="monotone" 
                                 dataKey="velocity" 
                                 stroke="#f97316" 
                                 strokeWidth={1.5} 
                                 dot={false} 
                                 animationDuration={0} // Real-time feel
                               />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* --- RIGHT: Knowledge & Optimization --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4">
           
           <SciFiCard title="智能优化引擎" subtitle="AI ADVISOR" className="h-[280px] border-cyan-900/30">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {OPTIMIZATION_RULES.map((rule, i) => (
                       <div key={i} className="p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-cyan-500/50 transition-all cursor-pointer group">
                           <div className="flex justify-between items-start mb-2">
                               <span className="text-xs font-bold text-white group-hover:text-cyan-300">{rule.title}</span>
                               <span className="text-[9px] font-mono text-green-400 bg-green-900/20 px-1.5 rounded">{rule.score}分</span>
                           </div>
                           <p className="text-[10px] text-slate-400 leading-tight mb-2">{rule.desc}</p>
                           <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                               <span className="text-[9px] text-slate-600 uppercase">{rule.type}</span>
                               <button className="text-[9px] text-cyan-500 flex items-center gap-1 hover:text-cyan-300">
                                   应用 <ArrowRight size={10}/>
                               </button>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="合规性检查 (GB 6722)" className="flex-1 border-slate-800">
               <div className="space-y-4">
                   <div className="flex items-center gap-3">
                       <div className="p-2 bg-green-900/20 rounded border border-green-800 text-green-500">
                           <ShieldCheck size={18} />
                       </div>
                       <div className="flex-1">
                           <div className="text-xs font-bold text-slate-200">安全距离校验</div>
                           <div className="text-[10px] text-slate-500">当前设计满足最小飞石距离 300m</div>
                       </div>
                   </div>
                   
                   <div className="flex items-center gap-3">
                       <div className="p-2 bg-yellow-900/20 rounded border border-yellow-800 text-yellow-500">
                           <Scale size={18} />
                       </div>
                       <div className="flex-1">
                           <div className="text-xs font-bold text-slate-200">单响药量限制</div>
                           <div className="text-[10px] text-slate-500">当前最大 150kg &lt; 限值 200kg</div>
                       </div>
                   </div>

                   <button className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded border border-slate-600 transition-all flex items-center justify-center gap-2">
                       <FileText size={14} /> 生成爆破设计说明书
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
