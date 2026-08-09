
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, Scatter, ScatterChart, ReferenceLine,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Sankey, Cell, Legend,
  PieChart, Pie
} from 'recharts';
import { 
  TrendingUp, Users, DollarSign, Briefcase, 
  Target, Zap, Settings, ArrowUpRight, 
  CheckCircle, AlertCircle, BarChart3, PieChart as PieIcon,
  Smile, UserCheck, Wrench, RefreshCw, ArrowRight, Lightbulb, FileText
} from 'lucide-react';

export const ServiceModeOptimizationView: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'REACTIVE' | 'PREVENTIVE' | 'PREDICTIVE' | 'OUTCOME'>('PREDICTIVE');
  const [simulationYear, setSimulationYear] = useState(0);

  // --- Mock Data ---

  // 1. Service Transformation Trends
  const revenueMix = Array.from({length: 12}, (_, i) => ({
    month: `M${i+1}`,
    labor: 50 - i * 2, // Labor revenue decreasing (efficiency)
    parts: 30 - i * 0.5, // Parts revenue stabilizing
    digital: 10 + i * 3, // Digital service increasing
    subscription: 10 + i * 2 // Outcome based increasing
  }));

  // 2. Efficiency Comparison
  const efficiencyData = [
    { mode: 'Reactive', uptime: 85, cost: 100, satisfaction: 60 },
    { mode: 'Preventive', uptime: 92, cost: 120, satisfaction: 75 },
    { mode: 'Predictive', uptime: 98, cost: 85, satisfaction: 90 },
    { mode: 'Outcome', uptime: 99.5, cost: 80, satisfaction: 95 },
  ];

  // 3. Customer Sentiment
  const sentimentData = [
    { name: 'Response Time', val: 92, full: 100 },
    { name: 'First Time Fix', val: 88, full: 100 },
    { name: 'Cost Transparency', val: 95, full: 100 },
    { name: 'Tech Competence', val: 90, full: 100 },
    { name: 'Proactivity', val: 85, full: 100 },
  ];

  // 4. Pain Points (Sankey-like data logic)
  const inefficiencies = [
    { name: '无效派遣', value: 35, color: '#ef4444' },
    { name: '备件错配', value: 25, color: '#f97316' },
    { name: '诊断耗时', value: 20, color: '#eab308' },
    { name: '重复上门', value: 20, color: '#3b82f6' },
  ];

  // Simulation Animation
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulationYear(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const getModeColor = (mode: string) => {
     if (mode === 'REACTIVE') return '#ef4444';
     if (mode === 'PREVENTIVE') return '#f59e0b';
     if (mode === 'PREDICTIVE') return '#3b82f6';
     return '#10b981';
  };

  const activeColor = getModeColor(activeMode);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#060408] p-2 overflow-hidden select-none">
      
      {/* 顶部：服务价值指挥舱 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-transparent border-b border-amber-500/20 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-amber-600/20 border border-amber-500/40 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
              <TrendingUp className="text-amber-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">装备服务数据支撑的服务模式优化</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-amber-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><Target size={12}/> STRATEGY: SERVITIZATION</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><Zap size={12}/> EFFICIENCY GAIN: +24%</span>
                 <span>|</span>
                 <span className="text-emerald-400 font-bold">MODEL: {activeMode}_OPTIMIZED</span>
              </div>
           </div>
        </div>

        <div className="flex gap-6">
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase font-bold">Service Revenue</span>
              <span className="text-xl font-mono font-black text-white">$ 12.4M <span className="text-xs text-green-500">(+12%)</span></span>
           </div>
           <div className="w-[1px] h-10 bg-white/10"></div>
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase font-bold">Net Promoter Score</span>
              <span className="text-xl font-mono font-black text-amber-400">+58</span>
           </div>
           <div className="w-[1px] h-10 bg-white/10"></div>
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase font-bold">Contract Renewal</span>
              <span className="text-xl font-mono font-black text-blue-400">92.5%</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* Left: Pain Points & Cost */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Inefficiency Analysis */}
           <SciFiCard title="服务效能瓶颈诊断" subtitle="PAIN POINTS" className="flex-1 bg-amber-950/5 border-amber-900/40">
              <div className="space-y-4">
                 <div className="text-[10px] text-slate-400 mb-2">主要资源损耗分布 (Non-Value Added)</div>
                 {inefficiencies.map((item, i) => (
                    <div key={i} className="flex flex-col gap-1">
                       <div className="flex justify-between items-center text-xs text-slate-200">
                          <span className="font-bold">{item.name}</span>
                          <span>{item.value}%</span>
                       </div>
                       <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                             className="h-full rounded-full transition-all duration-1000" 
                             style={{width: `${item.value}%`, backgroundColor: item.color}}
                          ></div>
                       </div>
                    </div>
                 ))}
              </div>
              <div className="mt-6 p-3 bg-red-950/20 border border-red-900/30 rounded-lg">
                 <div className="flex items-start gap-2">
                    <AlertCircle className="text-red-400 mt-0.5" size={14} />
                    <div>
                       <div className="text-[10px] font-bold text-red-200">当前模式痛点: 反应式服务占比过高</div>
                       <div className="text-[9px] text-slate-500 mt-1 leading-tight">
                          65% 的工单为非计划停机抢修，导致备件物流成本溢价 30%，且客户满意度受损。
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           {/* Cost Structure */}
           <SciFiCard title="服务成本结构优化" subtitle="OPEX" className="h-1/3 border-amber-900/40">
              <div className="h-full flex flex-col items-center justify-center">
                 <div className="flex gap-4 items-end w-full px-4 h-32">
                    {/* Before */}
                    <div className="flex-1 flex flex-col items-center gap-1 group">
                       <div className="w-full bg-slate-800 rounded-t-md relative h-24 overflow-hidden flex flex-col justify-end">
                          <div className="w-full bg-red-500/80 h-[40%]" title="Logistics"></div>
                          <div className="w-full bg-orange-500/80 h-[40%]" title="Labor"></div>
                          <div className="w-full bg-blue-500/80 h-[20%]" title="Parts"></div>
                       </div>
                       <span className="text-[10px] text-slate-400">Current</span>
                       <span className="text-xs font-bold text-white">$120k</span>
                    </div>
                    
                    <div className="mb-8 text-slate-600"><ArrowRight size={16}/></div>

                    {/* After */}
                    <div className="flex-1 flex flex-col items-center gap-1 group">
                       <div className="w-full bg-slate-800 rounded-t-md relative h-24 overflow-hidden flex flex-col justify-end">
                          <div className="w-full bg-red-500/80 h-[10%]" title="Logistics"></div>
                          <div className="w-full bg-orange-500/80 h-[20%]" title="Labor"></div>
                          <div className="w-full bg-blue-500/80 h-[20%]" title="Parts"></div>
                          <div className="w-full bg-emerald-500/80 h-[15%]" title="Platform"></div>
                       </div>
                       <span className="text-[10px] text-slate-400">Optimized</span>
                       <span className="text-xs font-bold text-emerald-400">$85k</span>
                    </div>
                 </div>
                 <div className="text-[9px] text-emerald-400 font-bold bg-emerald-950/30 px-2 py-0.5 rounded">
                    Savings: 29%
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* Center: The Evolution Engine */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-[#0a060e] border border-amber-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_80px_rgba(245,158,11,0.08)]">
              {/* Header */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                 <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded border border-amber-500/30 backdrop-blur">
                    <RefreshCw className="text-amber-400" size={16} />
                    <span className="text-xs font-bold text-amber-100 uppercase tracking-widest">Service Mode Evolution</span>
                 </div>
              </div>

              {/* Central SVG Visualization */}
              <div className="w-full h-full flex items-center justify-center p-8">
                 <svg className="w-full h-full" viewBox="0 0 800 500">
                    <defs>
                       <linearGradient id="modeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="33%" stopColor="#f59e0b" />
                          <stop offset="66%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#10b981" />
                       </linearGradient>
                       <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                             <feMergeNode in="coloredBlur"/>
                             <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                       </filter>
                    </defs>

                    {/* Timeline Path */}
                    <path d="M 100 300 Q 250 300 400 250 T 700 150" stroke="#334155" strokeWidth="4" fill="none" />
                    <path d="M 100 300 Q 250 300 400 250 T 700 150" stroke="url(#modeGrad)" strokeWidth="4" fill="none" strokeDasharray="10,5" className="animate-[dash_2s_linear_infinite]" filter="url(#glow)" />

                    {/* Mode Nodes */}
                    {[
                      { id: 'REACTIVE', x: 100, y: 300, label: 'Reactive', sub: 'Break-Fix' },
                      { id: 'PREVENTIVE', x: 300, y: 280, label: 'Preventive', sub: 'Scheduled' },
                      { id: 'PREDICTIVE', x: 500, y: 220, label: 'Predictive', sub: 'Condition-Based' },
                      { id: 'OUTCOME', x: 700, y: 150, label: 'Outcome', sub: 'Servitization' }
                    ].map((node, i) => {
                       const isActive = activeMode === node.id;
                       const color = getModeColor(node.id);
                       
                       return (
                          <g key={i} onClick={() => setActiveMode(node.id as any)} className="cursor-pointer group">
                             {/* Pulse Ring */}
                             {isActive && (
                                <circle cx={node.x} cy={node.y} r="35" fill="none" stroke={color} strokeWidth="1" opacity="0.5">
                                   <animate attributeName="r" from="20" to="50" dur="1.5s" repeatCount="indefinite" />
                                   <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
                                </circle>
                             )}
                             
                             {/* Core Node */}
                             <circle cx={node.x} cy={node.y} r="20" fill="#0f172a" stroke={color} strokeWidth={isActive ? 3 : 1} className="transition-all duration-300" />
                             <circle cx={node.x} cy={node.y} r={isActive ? 8 : 4} fill={color} />
                             
                             {/* Label */}
                             <text x={node.x} y={node.y + 40} textAnchor="middle" fill={isActive ? '#fff' : '#94a3b8'} fontSize="12" fontWeight="bold">
                                {node.label}
                             </text>
                             <text x={node.x} y={node.y + 55} textAnchor="middle" fill="#64748b" fontSize="10">
                                {node.sub}
                             </text>
                          </g>
                       );
                    })}

                    {/* Active Mode Metrics Box */}
                    <g transform="translate(50, 50)">
                       <rect width="200" height="100" rx="8" fill="#0f172a" stroke={activeColor} strokeWidth="1" strokeOpacity="0.5" />
                       <text x="20" y="25" fill={activeColor} fontSize="12" fontWeight="bold" textAnchor="start">CURRENT MODE METRICS</text>
                       {efficiencyData.filter(d => d.mode.toUpperCase() === activeMode).map((d, i) => (
                          <g key={i}>
                             <text x="20" y="50" fill="#cbd5e1" fontSize="10">Uptime: {d.uptime}%</text>
                             <text x="20" y="70" fill="#cbd5e1" fontSize="10">Rel. Cost: {d.cost}%</text>
                             <text x="20" y="90" fill="#cbd5e1" fontSize="10">CSAT: {d.satisfaction}</text>
                             
                             {/* Bars */}
                             <rect x="100" y="44" width={d.uptime} height="4" fill="#10b981" rx="2" />
                             <rect x="100" y="64" width={d.cost * 0.8} height="4" fill="#f59e0b" rx="2" />
                             <rect x="100" y="84" width={d.satisfaction} height="4" fill="#3b82f6" rx="2" />
                          </g>
                       ))}
                    </g>
                 </svg>
              </div>

              {/* Bottom Logic Status */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                 {['Data Foundation', 'Analytics', 'Decision', 'Execution'].map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${i < 3 ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                       <span className={`text-[10px] uppercase font-bold ${i < 3 ? 'text-emerald-200' : 'text-slate-500'}`}>{step}</span>
                       {i < 3 && <div className="w-8 h-[1px] bg-slate-700"></div>}
                    </div>
                 ))}
              </div>
           </div>

           {/* Value Stream Revenue */}
           <div className="h-44 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                    <DollarSign size={14} /> Revenue Stream Evolution
                 </div>
                 <div className="flex gap-2">
                    <div className="flex items-center gap-1 text-[8px] text-purple-400"><div className="w-2 h-2 bg-purple-500 rounded"></div> Subscription</div>
                    <div className="flex items-center gap-1 text-[8px] text-cyan-400"><div className="w-2 h-2 bg-cyan-500 rounded"></div> Digital</div>
                 </div>
              </div>
              <div className="flex-1 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueMix} stackOffset="expand">
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 9}} />
                       <YAxis stroke="#64748b" tick={{fontSize: 9}} tickFormatter={(val) => `${val*100}%`} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                       <Area type="monotone" dataKey="labor" stackId="1" stroke="none" fill="#f59e0b" fillOpacity={0.6} />
                       <Area type="monotone" dataKey="parts" stackId="1" stroke="none" fill="#3b82f6" fillOpacity={0.6} />
                       <Area type="monotone" dataKey="digital" stackId="1" stroke="none" fill="#06b6d4" fillOpacity={0.8} />
                       <Area type="monotone" dataKey="subscription" stackId="1" stroke="none" fill="#8b5cf6" fillOpacity={0.9} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Right: Outcomes & Strategy */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           
           {/* CSAT Radar */}
           <SciFiCard title="客户体验指数 (CSAT)" subtitle="VOICE OF CUSTOMER" className="flex-1 border-amber-900/50">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={sentimentData}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Score" dataKey="val" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-2 mt-[-10px]">
                 <div className="bg-slate-900/50 px-2 py-1 rounded border border-slate-800 flex items-center gap-1">
                    <Smile size={12} className="text-green-400" />
                    <span className="text-[10px] text-white">Sentiment: Positive</span>
                 </div>
              </div>
           </SciFiCard>

           {/* SLA & Action */}
           <SciFiCard title="服务等级协议 (SLA) 预测" subtitle="COMPLIANCE" className="border-amber-900/50">
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Response &lt; 2h</span>
                    <span className="text-emerald-400 font-mono font-bold">99.2%</span>
                 </div>
                 <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[99.2%]"></div>
                 </div>

                 <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Uptime &gt 98%</span>
                    <span className="text-blue-400 font-mono font-bold">99.5%</span>
                 </div>
                 <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[99.5%]"></div>
                 </div>

                 <div className="p-2 bg-amber-900/20 border border-amber-800/30 rounded mt-2 flex items-start gap-2">
                    <Lightbulb size={14} className="text-amber-500 mt-0.5" />
                    <div className="text-[9px] text-slate-300">
                       建议：基于当前预测精度，可向 VIP 客户推送 "零停机保障" 增值包。
                    </div>
                 </div>
              </div>
              <button className="w-full mt-4 py-2 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/40 rounded text-[10px] text-amber-200 font-bold uppercase flex items-center justify-center gap-2 transition-all">
                 <FileText size={12} /> 生成服务策略报告
              </button>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
