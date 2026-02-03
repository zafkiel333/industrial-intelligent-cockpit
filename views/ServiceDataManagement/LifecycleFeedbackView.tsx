
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Scatter, ScatterChart, ZAxis, ReferenceLine
} from 'recharts';
import { 
  GitBranch, GitCommit, GitMerge, RefreshCw, 
  Microscope, FileDiff, ArrowRight, Zap, 
  AlertTriangle, CheckCircle, TrendingUp, Layers, PenTool
} from 'lucide-react';

export const LifecycleFeedbackView: React.FC = () => {
  const [activeIteration, setActiveIteration] = useState('V2.1');
  const [flowSpeed, setFlowSpeed] = useState(1);

  // --- Mock Data ---

  // 1. Reliability Growth (Duane Model)
  const reliabilityGrowth = [
    { version: 'V1.0', mtbf: 500, time: 0 },
    { version: 'V1.1', mtbf: 850, time: 1000 },
    { version: 'V1.2', mtbf: 1200, time: 2000 },
    { version: 'V2.0', mtbf: 2400, time: 3000 }, // Major redesign
    { version: 'V2.1', mtbf: 2850, time: 4000 },
  ];

  // 2. Parameter Optimization (Diff)
  const paramDiff = [
    { param: '轴承游隙 (μm)', vOld: 45, vNew: 35, delta: '-22%', impact: 'High' },
    { param: '密封硬度 (HRC)', vOld: 60, vNew: 68, delta: '+13%', impact: 'Med' },
    { param: '冷却流速 (L/min)', vOld: 120, vNew: 150, delta: '+25%', impact: 'High' },
    { param: '齿轮模数', vOld: 8, vNew: 8, delta: '0%', impact: 'None' },
  ];

  // 3. Failure Mode Distribution (Field Data)
  const failureModes = [
    { mode: '疲劳断裂', count: 145, designGap: '强度余量不足' },
    { mode: '磨损超标', count: 89, designGap: '材料选型偏差' },
    { mode: '电气短路', count: 42, designGap: '防护等级低' },
    { mode: '控制漂移', count: 28, designGap: '算法收敛慢' },
  ];

  // 4. Correlation Links (Service -> Design)
  const connections = [
    { from: 's1', to: 'd1', strength: 0.9 }, // 振动 -> 轴承游隙
    { from: 's2', to: 'd2', strength: 0.7 }, // 漏油 -> 密封硬度
    { from: 's3', to: 'd3', strength: 0.8 }, // 温升 -> 冷却流速
    { from: 's1', to: 'd2', strength: 0.4 }, // 振动 -> 密封 (Weak)
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-fuchsia-50 bg-[#07020a] p-2 overflow-hidden select-none">
      
      {/* 顶部：反哺闭环总览 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-fuchsia-950/60 via-purple-900/40 to-transparent border-b border-fuchsia-500/30 rounded-t-xl backdrop-blur-sm">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-fuchsia-600/20 border border-fuchsia-500/50 rounded-xl shadow-[0_0_25px_rgba(217,70,239,0.3)] animate-pulse">
              <RefreshCw className="text-fuchsia-400" size={32} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">装备全生命周期服务数据反哺设计系统</h1>
              <div className="flex items-center gap-6 mt-1 text-[10px] font-mono text-fuchsia-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><GitMerge size={12}/> LOOP STATUS: CLOSED</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><Microscope size={12}/> DATA-DRIVEN R&D</span>
                 <span>|</span>
                 <span className="text-emerald-400 font-bold">IMPROVEMENT VELOCITY: +14% / Qtr</span>
              </div>
           </div>
        </div>

        <div className="flex gap-6">
           <div className="text-right">
              <div className="text-[9px] text-fuchsia-400 uppercase font-bold">Active ECRs</div>
              <div className="text-3xl font-mono font-black text-white">12 <span className="text-sm font-normal text-slate-500">Pending</span></div>
           </div>
           <div className="w-[1px] h-10 bg-fuchsia-900/50"></div>
           <div className="text-right">
              <div className="text-[9px] text-fuchsia-400 uppercase font-bold">Feedback Latency</div>
              <div className="text-3xl font-mono font-black text-white">4.5 <span className="text-sm font-normal text-slate-500">Days</span></div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* Left: The Reality (Service Data) */}
        <div className="w-full lg:w-[25%] flex flex-col gap-4">
           <SciFiCard title="现场失效模式聚类" subtitle="REALITY CHECK" className="flex-1 bg-fuchsia-950/5 border-fuchsia-900/50">
              <div className="space-y-4 pt-2">
                 {failureModes.map((item, i) => (
                    <div key={i} className="relative p-3 bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden group hover:border-red-500/40 transition-all">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-white">{item.mode}</span>
                          <span className="text-xs font-mono text-red-400 font-bold">{item.count} Cases</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                          <div className="h-full bg-red-600" style={{width: `${(item.count / 150) * 100}%`}}></div>
                       </div>
                       <div className="flex items-center gap-2 text-[9px] text-slate-400 bg-slate-950/50 p-1.5 rounded">
                          <AlertTriangle size={10} className="text-amber-500"/>
                          <span>归因: <span className="text-fuchsia-300">{item.designGap}</span></span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="设计假设偏差度" subtitle="GAP ANALYSIS" className="h-1/3 border-fuchsia-900/50">
              <div className="h-full flex flex-col items-center justify-center gap-2">
                 <div className="text-[10px] text-slate-500 uppercase">Mean Deviation</div>
                 <div className="text-4xl font-black text-white">-18.4%</div>
                 <div className="text-[9px] text-slate-400 text-center px-4">
                    现场实测载荷谱比设计标准高出 18.4%，建议提升安全系数。
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* Center: The Correlation Engine (SVG) */}
        <div className="w-full lg:w-[50%] flex flex-col gap-4">
           <div className="flex-1 bg-[#0b0510] border border-fuchsia-500/20 rounded-2xl relative overflow-hidden shadow-[0_0_80px_rgba(192,38,211,0.1)] group">
              {/* HUD */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                 <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded border border-fuchsia-500/30 backdrop-blur">
                    <GitBranch className="text-fuchsia-400" size={16} />
                    <span className="text-xs font-bold text-fuchsia-100 uppercase">Service-Design Mapping</span>
                 </div>
              </div>

              {/* Central SVG */}
              <svg className="w-full h-full">
                 <defs>
                    <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                       <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" /> {/* Red: Failure */}
                       <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.8" /> {/* Cyan: Param */}
                    </linearGradient>
                    <filter id="glow">
                       <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                       <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                       </feMerge>
                    </filter>
                 </defs>

                 {/* Nodes: Symptoms (Left) */}
                 <g transform="translate(100, 100)">
                    <text x="0" y="-30" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">SYMPTOMS (Field)</text>
                    <circle id="s1" cx="0" cy="0" r="6" fill="#ef4444" />
                    <text x="-15" y="4" textAnchor="end" fill="#fff" fontSize="10">高频振动</text>
                    
                    <circle id="s2" cx="0" cy="80" r="6" fill="#ef4444" />
                    <text x="-15" y="84" textAnchor="end" fill="#fff" fontSize="10">密封失效</text>

                    <circle id="s3" cx="0" cy="160" r="6" fill="#ef4444" />
                    <text x="-15" y="164" textAnchor="end" fill="#fff" fontSize="10">温升过快</text>
                 </g>

                 {/* Nodes: Parameters (Right) */}
                 <g transform="translate(500, 100)">
                    <text x="0" y="-30" textAnchor="middle" fill="#22d3ee" fontSize="10" fontWeight="bold">PARAMETERS (Design)</text>
                    <circle id="d1" cx="0" cy="0" r="6" fill="#22d3ee" />
                    <text x="15" y="4" textAnchor="start" fill="#fff" fontSize="10">轴承游隙 (C3)</text>

                    <circle id="d2" cx="0" cy="80" r="6" fill="#22d3ee" />
                    <text x="15" y="84" textAnchor="start" fill="#fff" fontSize="10">密封材料硬度</text>

                    <circle id="d3" cx="0" cy="160" r="6" fill="#22d3ee" />
                    <text x="15" y="164" textAnchor="start" fill="#fff" fontSize="10">冷却回路流量</text>
                 </g>

                 {/* Links */}
                 {connections.map((c, i) => {
                    const yMap: any = { s1: 100, s2: 180, s3: 260, d1: 100, d2: 180, d3: 260 };
                    // Adjust y coordinates relative to SVG
                    const sy = yMap[c.from];
                    const dy = yMap[c.to];
                    const pathD = `M 100 ${sy} C 250 ${sy}, 350 ${dy}, 500 ${dy}`;
                    
                    return (
                       <g key={i}>
                          <path 
                             d={pathD} 
                             stroke="url(#linkGrad)" 
                             strokeWidth={c.strength * 4} 
                             fill="none" 
                             opacity="0.4"
                          />
                          {/* Animated Pulse */}
                          <circle r="3" fill="#fff" filter="url(#glow)">
                             <animateMotion 
                                dur={`${2/c.strength}s`} 
                                repeatCount="indefinite" 
                                path={pathD}
                             />
                          </circle>
                       </g>
                    );
                 })}
              </svg>

              {/* Action Bar */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                 <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-fuchsia-500/30 flex items-center gap-2">
                    <span className="text-[9px] text-slate-400">CORRELATION ENGINE</span>
                    <span className="text-xs font-bold text-white">AI-Weighted</span>
                 </div>
              </div>
           </div>

           {/* Feedback Log */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest">
                    <Zap size={14} /> Design Optimization Insights
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 custom-scrollbar">
                 <div className="flex gap-3 p-1 hover:bg-white/5 rounded">
                    <span className="text-slate-600">[AUTO]</span>
                    <span className="text-white">发现 <span className="text-red-400">振动异常</span> 与 <span className="text-cyan-400">轴承游隙</span> 强相关 (r=0.92)。</span>
                 </div>
                 <div className="flex gap-3 p-1 hover:bg-white/5 rounded">
                    <span className="text-slate-600">[SUGGEST]</span>
                    <span className="text-white">建议将 <span className="text-cyan-400">游隙等级</span> 从 C3 调整为 CN 以适应当前工况。</span>
                 </div>
                 <div className="flex gap-3 p-1 hover:bg-white/5 rounded">
                    <span className="text-slate-600">[SIM]</span>
                    <span className="text-slate-400">仿真验证显示调整后 MTBF 提升 15%。</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Right: Design Action & Value */}
        <div className="w-full lg:w-[25%] flex flex-col gap-4">
           
           {/* Design Diff */}
           <SciFiCard title="设计参数迭代 (Diff)" subtitle="ECR-2024-009" className="flex-1 border-fuchsia-900/50">
              <div className="space-y-0">
                 <div className="grid grid-cols-4 text-[9px] text-slate-500 uppercase border-b border-slate-800 pb-1 mb-2">
                    <span className="col-span-2">Parameter</span>
                    <span className="text-center">Old</span>
                    <span className="text-right">New</span>
                 </div>
                 {paramDiff.map((p, i) => (
                    <div key={i} className="grid grid-cols-4 items-center py-2 border-b border-slate-800/50 group hover:bg-white/5">
                       <div className="col-span-2">
                          <div className="text-[10px] text-white font-bold">{p.param}</div>
                          {p.impact === 'High' && <span className="text-[8px] bg-red-900/50 text-red-300 px-1 rounded">High Impact</span>}
                       </div>
                       <div className="text-center text-xs text-slate-500 line-through decoration-red-500">{p.vOld}</div>
                       <div className="text-right text-xs text-green-400 font-bold flex items-center justify-end gap-1">
                          {p.vNew}
                          {p.delta !== '0%' && <span className="text-[8px] text-green-600">({p.delta})</span>}
                       </div>
                    </div>
                 ))}
              </div>
              <button className="w-full mt-4 py-2 bg-fuchsia-600/20 hover:bg-fuchsia-600/40 border border-fuchsia-500/40 rounded text-[10px] text-fuchsia-200 font-bold uppercase flex items-center justify-center gap-2 transition-all">
                 <FileDiff size={12} /> 生成变更请求 (ECR)
              </button>
           </SciFiCard>

           {/* Reliability Growth */}
           <SciFiCard title="可靠性增长曲线" subtitle="DUANE MODEL" className="h-1/3 border-fuchsia-900/50">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reliabilityGrowth}>
                       <defs>
                          <linearGradient id="colorMtbf" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" vertical={false} />
                       <XAxis dataKey="version" stroke="#64748b" tick={{fontSize: 9}} />
                       <YAxis hide />
                       <Tooltip contentStyle={{backgroundColor: '#05020a', border: '1px solid #d946ef', fontSize: '10px'}} />
                       <Area type="monotone" dataKey="mtbf" stroke="#d946ef" fill="url(#colorMtbf)" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           {/* Status */}
           <SciFiCard title="迭代版本状态" className="bg-fuchsia-900/10 border-fuchsia-800/30">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-fuchsia-500/20 rounded">
                       <Layers size={16} className="text-fuchsia-400" />
                    </div>
                    <div>
                       <div className="text-xs font-bold text-white">Current: V2.1</div>
                       <div className="text-[9px] text-slate-400">Release: 2024-Q2</div>
                    </div>
                 </div>
                 <CheckCircle size={16} className="text-green-500" />
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
