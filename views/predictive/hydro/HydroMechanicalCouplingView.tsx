
import React, { useState, useEffect } from 'react';
import { CouplingThreeScene } from '../../../components/predictive/hydro-coupling/ThreeScene';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, ScatterChart, Scatter, ZAxis, Legend, ComposedChart, Bar,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Activity, Waves, Zap, ShieldAlert, 
  ArrowRightLeft, TrendingUp, Cpu, Binary,
  GitBranch, Link, AlertOctagon, Timer,
  Layers, Settings, AlertTriangle, CheckCircle2
} from 'lucide-react';

// --- 模拟数据 ---

// 耦合演化路径 (三轴数据：流体激振、机械响应、电磁扰动)
const EVOLUTION_PATH = Array.from({length: 40}, (_, i) => {
  const t = i;
  return {
    time: `${t}s`,
    hydraulic: (20 + Math.sin(t * 0.3) * 5 + (t > 25 ? (t-25)*2 : 0)).toFixed(1),
    mechanical: (15 + Math.cos(t * 0.3) * 3 + (t > 25 ? (t-25)*1.5 : 0)).toFixed(1),
    electrical: (10 + Math.sin(t * 0.2) * 2 + (t > 30 ? (t-30)*3 : 0)).toFixed(1),
  };
});

// 跨域关联矩阵数据 (Radar Chart 替代)
const CROSS_DOMAIN_RADAR = [
  { subject: '动静干涉', A: 85, fullMark: 100 },
  { subject: '转频耦合', A: 92, fullMark: 100 },
  { subject: '电磁刚度', A: 78, fullMark: 100 },
  { subject: '流体阻尼', A: 65, fullMark: 100 },
  { subject: '轴系稳定性', A: 88, fullMark: 100 },
];

// 耦合相图 (Orbit-like scatter)
const PHASE_ORBIT = Array.from({length: 60}, (_, i) => {
    const rad = i * 0.15;
    const noise = Math.random() * 5;
    return {
        x: Math.cos(rad) * 40 + noise,
        y: Math.sin(rad) * 30 + noise,
        z: i
    };
});

export const HydroMechanicalCouplingView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'total' | 'fluid' | 'mechanical' | 'electrical'>('total');
  const [couplingIndex, setCouplingIndex] = useState(0.32);
  const [isEmergency, setIsEmergency] = useState(false);

  // 动态模拟
  useEffect(() => {
    const interval = setInterval(() => {
        const time = Date.now() / 10000;
        const val = 0.32 + Math.sin(time) * 0.1 + (Math.random() > 0.9 ? 0.2 : 0);
        setCouplingIndex(val);
        setIsEmergency(val > 0.55);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#02040a] text-blue-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* 顶部：耦合态势 HUD */}
      <div className="flex justify-between items-end border-b border-blue-900/40 pb-4 bg-gradient-to-r from-[#0c1a2e] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-3 bg-blue-600/20 rounded-full border border-blue-500/50 animate-pulse">
                <Link size={28} className="text-cyan-400" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-widest font-bold">
                    <ShieldAlert size={14} /> Multi-Physics Coupling System
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    水工—机电 <span className="text-blue-400">耦合失效预测</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">系统耦合失稳指数 (SCI)</div>
                <div className={`text-4xl font-mono font-bold ${isEmergency ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                    {couplingIndex.toFixed(3)}
                </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">共振预测窗口</div>
                <div className="text-3xl font-mono font-bold text-white">425 <span className="text-sm">ms</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-green-400">耦合稳定状态</div>
                <div className="flex items-center gap-2 text-xl font-bold text-white uppercase">
                    {isEmergency ? <AlertOctagon className="text-red-500" size={18}/> : <ShieldAlert className="text-green-500" size={18}/>}
                    {isEmergency ? 'CRITICAL / 严重失稳' : 'NOMINAL / 动态平衡'}
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：跨域参数与关联分析 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* 三场参数看板 */}
           <SciFiCard title="多场耦合实时参数" subtitle="MULTI-DOMAIN METRICS" className="border-blue-900/50 bg-[#081224]/80">
               <div className="flex flex-col gap-4 py-2">
                   <div className="flex justify-between items-center p-2.5 bg-slate-900/50 rounded border-l-4 border-blue-500">
                       <div className="flex items-center gap-3">
                           <Waves size={18} className="text-blue-400" />
                           <span className="text-xs text-slate-300">水力激励 (P)</span>
                       </div>
                       <span className="font-mono text-white font-bold text-lg">145.2 <span className="text-[10px] font-normal opacity-50">kPa</span></span>
                   </div>
                   <div className="flex justify-between items-center p-2.5 bg-slate-900/50 rounded border-l-4 border-cyan-500">
                       <div className="flex items-center gap-3">
                           <Activity size={18} className="text-cyan-400" />
                           <span className="text-xs text-slate-300">机械摆度 (S)</span>
                       </div>
                       <span className="font-mono text-white font-bold text-lg">0.245 <span className="text-[10px] font-normal opacity-50">mm</span></span>
                   </div>
                   <div className="flex justify-between items-center p-2.5 bg-slate-900/50 rounded border-l-4 border-purple-500">
                       <div className="flex items-center gap-3">
                           <Zap size={18} className="text-purple-400" />
                           <span className="text-xs text-slate-300">磁场波动 (Φ)</span>
                       </div>
                       <span className="font-mono text-white font-bold text-lg">4.82 <span className="text-[10px] font-normal opacity-50">Wb</span></span>
                   </div>
               </div>
           </SciFiCard>

           {/* 耦合相图 (Orbit Plot) */}
           <SciFiCard title="流-固耦合相图 (Phase Space)" subtitle="SYSTEM STABILITY" className="flex-1 border-blue-900/50">
               <div className="w-full h-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{top: 10, right: 10, bottom: 10, left: -20}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                           <XAxis type="number" dataKey="x" stroke="#64748b" hide domain={[-50, 50]} />
                           <YAxis type="number" dataKey="y" stroke="#64748b" hide domain={[-50, 50]} />
                           <ZAxis type="number" dataKey="z" range={[5, 10]} />
                           <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#000', borderColor: '#22d3ee'}} />
                           <Scatter name="Orbit" data={PHASE_ORBIT} fill="#22d3ee" line={{stroke: '#22d3ee', strokeWidth: 1}} />
                       </ScatterChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="w-48 h-48 border border-blue-900/30 rounded-full"></div>
                       <div className="w-24 h-24 border border-blue-900/30 rounded-full absolute"></div>
                   </div>
                   <div className="absolute bottom-2 left-2 text-[9px] text-slate-500 font-mono">
                        NON-LINEAR DYNAMICS ACTIVE
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D 耦合演化视口 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口：耦合数字孪生 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#02040a] to-[#000105] border border-blue-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(56,189,248,0.1)] group">
               
               {/* 视口 HUD */}
               <div className="absolute top-6 left-6 z-10 space-y-4 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-blue-500/30 px-4 py-3 rounded flex flex-col gap-2">
                       <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Binary size={14} /> Fluid-Structure Interaction (FSI)
                       </div>
                       <div className="flex items-center gap-10">
                           <div>
                               <div className="text-[9px] text-slate-500">水力激振频率</div>
                               <div className="text-xl font-mono font-bold text-white">0.32 <span className="text-xs">fn</span></div>
                           </div>
                           <div className="w-[1px] h-8 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500">磁拉力非对称性</div>
                               <div className="text-xl font-mono font-bold text-purple-400">12.5 <span className="text-xs">%</span></div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* 右上角控制层切换 */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 pointer-events-auto">
                   <div className="bg-slate-900/80 backdrop-blur p-2 rounded border border-slate-700 flex flex-col gap-1">
                       <div className="text-[9px] text-slate-500 uppercase mb-1">物理场图层切换 View Mode</div>
                       <div className="flex gap-1">
                            {['total', 'fluid', 'mechanical', 'electrical'].map(m => (
                                <button 
                                    key={m}
                                    onClick={() => setViewMode(m as any)}
                                    className={`px-2 py-1 text-[10px] font-bold rounded transition-colors uppercase
                                        ${viewMode === m ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}
                                    `}
                                >
                                    {m}
                                </button>
                            ))}
                       </div>
                   </div>
               </div>

               {/* 共振危险区预警 */}
               {isEmergency && (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                        <div className="w-64 h-64 border-4 border-red-500/40 rounded-full animate-ping flex items-center justify-center">
                             <div className="w-32 h-32 bg-red-600/20 rounded-full flex items-center justify-center">
                                  <AlertTriangle size={64} className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                             </div>
                        </div>
                   </div>
               )}

               <CouplingThreeScene 
                   fluidVelocity={isEmergency ? 12.5 : 8.2}
                   vibrationAmp={isEmergency ? 320 : 120}
                   electromagneticStress={isEmergency ? 0.9 : 0.4}
                   couplingIntensity={couplingIndex}
                   isResonating={isEmergency}
                   viewMode={viewMode}
               />
           </div>

           {/* 耦合演化趋势曲线 */}
           <SciFiCard title="跨域耦合演化时序预测" subtitle="TEMPORAL EVOLUTION" className="h-[240px] border-blue-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={EVOLUTION_PATH}>
                           <defs>
                               <linearGradient id="colHyd" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                               <linearGradient id="colMech" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient>
                               <linearGradient id="colElec" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={5} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: '损伤指数 / Risk Index', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                           <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#3b82f6'}} />
                           <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}} />
                           <Area type="monotone" dataKey="hydraulic" stroke="#3b82f6" fill="url(#colHyd)" name="水力激振项" />
                           <Area type="monotone" dataKey="mechanical" stroke="#06b6d4" fill="url(#colMech)" name="机械响应项" />
                           <Area type="monotone" dataKey="electrical" stroke="#8b5cf6" fill="url(#colElec)" name="电磁扰动项" />
                           <ReferenceLine x="25s" stroke="#fff" strokeDasharray="3 3" label={{value: '耦合加速区', fill: '#fff', fontSize: 10, position: 'insideTopLeft'}} />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 右侧：失效机理与智能干预 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 机理贡献度分析 */}
           <SciFiCard title="耦合失效机理贡献度" subtitle="CONTRIBUTION MATRIX" className="flex-1 border-blue-900/50">
               <div className="h-full w-full flex flex-col">
                   <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={CROSS_DOMAIN_RADAR}>
                                <PolarGrid stroke="#1e293b" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Contribution" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                                <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                            </RadarChart>
                        </ResponsiveContainer>
                   </div>
                   <div className="mt-2 p-3 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-1">
                           <GitBranch size={14} className="text-blue-500" />
                           主导失效链 (Dominant Chain)
                       </div>
                       <div className="text-[10px] text-slate-500 italic leading-relaxed">
                           "低负荷空蚀 -&gt; 诱发共振频率漂移 -&gt; 定子机械疲劳 -&gt; 电气绝缘微损"
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* 智能协同干预策略 */}
           <SciFiCard title="多场协同干预策略" className="h-[320px] border-blue-900/50 bg-[#1a0505]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-orange-950/20 border border-orange-500/30 rounded flex items-start gap-3 shadow-inner">
                       <AlertTriangle className="text-orange-500 shrink-0 mt-1" size={18} />
                       <div>
                           <div className="text-xs font-bold text-white mb-1">共振回避逻辑已触发</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed">
                               预测 45% - 55% 负荷区间内存在流-固共振风险。建议通过 AGC 强制锁定该区间。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-blue-500 pl-2">下一步行动清单 (Pre-Actions)</div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> 增加 2号导轴承 供油压力
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> 执行发电机定子线圈 PD 深度扫描
                       </div>
                       <div className="flex items-center gap-2 text-xs text-red-400 font-bold py-1">
                           <AlertTriangle size={14} className="animate-pulse" /> 启动励磁系统 负载限制算法
                       </div>
                   </div>

                   <button className="mt-auto w-full py-2.5 bg-blue-700/30 hover:bg-blue-600/50 border border-blue-500/50 rounded-lg text-xs text-blue-100 font-bold transition-all flex items-center justify-center gap-2 group">
                       <Settings size={14} className="group-hover:rotate-180 transition-transform" /> 
                       下发协同优化指令
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
