
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, Scatter, ScatterChart, ReferenceLine,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import { 
  Activity, Zap, Gauge, Wind, RefreshCw, 
  Settings, AlertTriangle, GitMerge, Thermometer, 
  BrainCircuit, ArrowRight, ShieldCheck, Timer,
  Network, Cpu, Scale, FileText, Terminal
} from 'lucide-react';

export const ConditionCollaborationView: React.FC = () => {
  const [activeLogic, setActiveLogic] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  // --- Mock Data ---
  
  // 1. Condition Radar
  const conditionRadar = [
    { subject: '机械负载', A: 85, fullMark: 100 },
    { subject: '热应力', A: 62, fullMark: 100 },
    { subject: '振动烈度', A: 45, fullMark: 100 },
    { subject: '环境粉尘', A: 90, fullMark: 100 }, // High
    { subject: '电网波动', A: 30, fullMark: 100 },
  ];

  // 2. Dynamic RUL Comparison
  const rulTrend = Array.from({length: 20}, (_, i) => ({
    time: `T+${i}h`,
    static: 100 - i * 0.5,
    dynamic: 100 - i * (0.5 + Math.random() * 0.4), // Faster decay due to conditions
    stress: 20 + Math.random() * 30
  }));

  // 3. Collaboration Logic Nodes (Center Visualization)
  const logicNodes = [
    { id: 'c1', type: 'condition', label: '重载持续 > 4h', y: 15, active: true },
    { id: 'c2', type: 'condition', label: '环境温度 > 40°C', y: 45, active: false },
    { id: 'c3', type: 'condition', label: '振动频谱异常', y: 75, active: true },
    
    { id: 'a1', type: 'action', label: '缩短润滑周期', y: 15, active: true },
    { id: 'a2', type: 'action', label: '启动备用冷却', y: 45, active: false },
    { id: 'a3', type: 'action', label: '主轴探伤工单', y: 75, active: true },
  ];

  // Connections between conditions and actions
  const connections = [
    { from: 'c1', to: 'a1', active: true },
    { from: 'c2', to: 'a2', active: false },
    { from: 'c3', to: 'a3', active: true },
    { from: 'c1', to: 'a3', active: true }, // Complex logic
  ];

  // 4. Service Logs
  const serviceLogs = [
    { time: '10:45:22', type: 'TRIGGER', msg: '检测到「重载持续」工况，触发服务策略调整。' },
    { time: '10:45:25', type: 'ACTION', msg: '自动下发：润滑系统加注频率 +50%。' },
    { time: '10:46:10', type: 'SYNC', msg: '备件库：液压油消耗预测值更新。' },
    { time: '10:48:00', type: 'PREDICT', msg: '修正剩余寿命预测：RUL 下降 12h。' },
  ];

  // Animation Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(prev => prev + 1);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020408] p-2 overflow-hidden select-none">
      
      {/* 顶部：协同指挥栏 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-transparent border-b border-blue-500/30 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-pulse">
              <GitMerge className="text-blue-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">装备服务数据与运行工况协同管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-blue-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><Activity size={12}/> CONDITION: HEAVY_LOAD</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><BrainCircuit size={12}/> STRATEGY: ADAPTIVE_V4</span>
                 <span>|</span>
                 <span className="text-emerald-400 font-bold">SYNERGY SCORE: 96.5</span>
              </div>
           </div>
        </div>

        <div className="flex gap-6">
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase font-bold">工况偏离度</span>
              <span className="text-xl font-mono font-black text-amber-400">+12.4%</span>
           </div>
           <div className="w-[1px] h-10 bg-white/10"></div>
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase font-bold">策略响应延迟</span>
              <span className="text-xl font-mono font-black text-white">45ms</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：多维工况感知 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Radar Chart */}
           <SciFiCard title="实时工况压力谱" subtitle="STRESS MATRIX" className="bg-[#0a0e17]/80 border-blue-900/50">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={conditionRadar}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Current Load" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="p-2 bg-blue-900/10 border border-blue-800/30 rounded mt-[-10px] text-center">
                 <span className="text-[10px] text-slate-400">主要影响因子: <span className="text-amber-400 font-bold">环境粉尘 (90/100)</span></span>
              </div>
           </SciFiCard>

           {/* Real-time Load */}
           <SciFiCard title="关键载荷指标" className="flex-1 border-blue-900/50">
              <div className="grid grid-cols-2 gap-3 mb-4">
                 <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex flex-col items-center">
                    <Gauge className="text-cyan-500 mb-1" size={18} />
                    <div className="text-[9px] text-slate-500 uppercase">Torque</div>
                    <div className="text-lg font-bold text-white">4,250 <span className="text-xs font-normal">Nm</span></div>
                 </div>
                 <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex flex-col items-center">
                    <Thermometer className="text-red-500 mb-1" size={18} />
                    <div className="text-[9px] text-slate-500 uppercase">Oil Temp</div>
                    <div className="text-lg font-bold text-white">68.2 <span className="text-xs font-normal">°C</span></div>
                 </div>
                 <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex flex-col items-center">
                    <Wind className="text-slate-400 mb-1" size={18} />
                    <div className="text-[9px] text-slate-500 uppercase">Dust</div>
                    <div className="text-lg font-bold text-amber-400">High</div>
                 </div>
                 <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex flex-col items-center">
                    <Zap className="text-purple-400 mb-1" size={18} />
                    <div className="text-[9px] text-slate-500 uppercase">Power</div>
                    <div className="text-lg font-bold text-white">850 <span className="text-xs font-normal">kW</span></div>
                 </div>
              </div>
              <div className="text-center">
                 <div className="text-[9px] text-slate-500 mb-1">综合工况等级</div>
                 <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 w-[75%] animate-pulse"></div>
                 </div>
                 <div className="flex justify-between text-[8px] text-slate-600 mt-1 px-1">
                    <span>Low</span>
                    <span>Mid</span>
                    <span className="text-white font-bold">Heavy</span>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：协同逻辑可视化引擎 (2D SVG) */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-[#0b0e14] border border-blue-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_60px_rgba(59,130,246,0.1)]">
              {/* Header */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                 <Network className="text-blue-400" size={16} />
                 <span className="text-xs font-bold text-blue-100 uppercase tracking-widest">Logic Synapse Engine</span>
              </div>

              {/* Central SVG Visualization */}
              <div className="w-full h-full flex items-center justify-center p-8">
                 <svg className="w-full h-full" viewBox="0 0 600 400">
                    <defs>
                       <linearGradient id="gradLink" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                       </linearGradient>
                       <filter id="glow">
                          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                          <feMerge>
                             <feMergeNode in="coloredBlur"/>
                             <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                       </filter>
                    </defs>

                    {/* Connecting Lines */}
                    {connections.map((conn, i) => {
                       const start = logicNodes.find(n => n.id === conn.from);
                       const end = logicNodes.find(n => n.id === conn.to);
                       if (!start || !end) return null;

                       const startX = 150;
                       const startY = start.y * 3.5 + 50;
                       const endX = 450;
                       const endY = end.y * 3.5 + 50;

                       // Bezier control points
                       const cp1x = 250;
                       const cp1y = startY;
                       const cp2x = 350;
                       const cp2y = endY;

                       const pathD = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
                       
                       return (
                          <g key={i}>
                             {/* Static Background Line */}
                             <path d={pathD} stroke="#1e293b" strokeWidth="2" fill="none" />
                             
                             {/* Animated Pulse if active */}
                             {conn.active && (
                                <>
                                   <path d={pathD} stroke="url(#gradLink)" strokeWidth="3" fill="none" strokeDasharray="10,5" className="animate-[dash_1s_linear_infinite]" filter="url(#glow)">
                                      <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1.5s" repeatCount="indefinite" />
                                   </path>
                                   <circle r="3" fill="#fff">
                                      <animateMotion dur="1.5s" repeatCount="indefinite" path={pathD} />
                                   </circle>
                                </>
                             )}
                          </g>
                       );
                    })}

                    {/* Nodes - Left (Condition) */}
                    {logicNodes.filter(n => n.type === 'condition').map(node => (
                       <g key={node.id} transform={`translate(50, ${node.y * 3.5 + 50})`}>
                          <rect x="0" y="-20" width="120" height="40" rx="4" 
                                fill={node.active ? '#1e3a8a' : '#0f172a'} 
                                stroke={node.active ? '#3b82f6' : '#334155'} strokeWidth="2" />
                          <text x="60" y="5" textAnchor="middle" fill={node.active ? '#fff' : '#64748b'} fontSize="12" fontWeight="bold" fontFamily="monospace">
                             {node.label}
                          </text>
                          {/* Output Port */}
                          <circle cx="120" cy="0" r="4" fill={node.active ? '#3b82f6' : '#334155'} />
                       </g>
                    ))}

                    {/* Nodes - Right (Action) */}
                    {logicNodes.filter(n => n.type === 'action').map(node => (
                       <g key={node.id} transform={`translate(450, ${node.y * 3.5 + 50})`}>
                          <rect x="-20" y="-20" width="140" height="40" rx="4" 
                                fill={node.active ? '#064e3b' : '#0f172a'} 
                                stroke={node.active ? '#10b981' : '#334155'} strokeWidth="2" />
                          <text x="50" y="5" textAnchor="middle" fill={node.active ? '#fff' : '#64748b'} fontSize="12" fontWeight="bold" fontFamily="monospace">
                             {node.label}
                          </text>
                          {/* Input Port */}
                          <circle cx="-20" cy="0" r="4" fill={node.active ? '#10b981' : '#334155'} />
                       </g>
                    ))}
                    
                    {/* Labels */}
                    <text x="110" y="30" fill="#94a3b8" fontSize="10" textAnchor="middle" letterSpacing="2">DETECTED CONDITIONS</text>
                    <text x="490" y="30" fill="#94a3b8" fontSize="10" textAnchor="middle" letterSpacing="2">TRIGGERED SERVICES</text>

                 </svg>
              </div>

              {/* Bottom Logic Status */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                 <div className="px-4 py-2 bg-blue-900/80 backdrop-blur border border-blue-500/30 rounded-full flex items-center gap-2">
                    <Cpu size={12} className="text-blue-300" />
                    <span className="text-[10px] text-blue-100 font-mono">LOGIC_ENGINE: ACTIVE</span>
                 </div>
                 <div className="px-4 py-2 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-full flex items-center gap-2">
                    <Scale size={12} className="text-slate-300" />
                    <span className="text-[10px] text-slate-300 font-mono">WEIGHT: BALANCED</span>
                 </div>
              </div>
           </div>

           {/* Execution Logs */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    <Terminal size={14} /> 协同执行日志 (Live Execution)
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 custom-scrollbar">
                 {serviceLogs.map((log, i) => (
                    <div key={i} className="flex gap-4 p-1 hover:bg-white/5 transition-colors group">
                       <span className="text-slate-600">[{log.time}]</span>
                       <span className={`font-bold w-12 ${
                          log.type === 'TRIGGER' ? 'text-yellow-500' :
                          log.type === 'ACTION' ? 'text-green-500' : 
                          log.type === 'PREDICT' ? 'text-purple-500' : 'text-blue-400'
                       }`}>[{log.type}]</span>
                       <span className="text-slate-300 flex-1">{log.msg}</span>
                    </div>
                 ))}
                 <div className="flex gap-2 p-1 opacity-50">
                    <span className="text-green-500 animate-pulse">_</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：自适应服务与效益 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Dynamic RUL */}
           <SciFiCard title="寿命预测动态修正" subtitle="DYNAMIC RUL" className="flex-1 border-blue-900/50">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={rulTrend} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 9}} interval={4} />
                       <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[0, 100]} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                       <Area type="monotone" dataKey="stress" fill="#f59e0b" stroke="none" fillOpacity={0.1} name="Stress Impact" />
                       <Line type="monotone" dataKey="static" stroke="#64748b" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Standard RUL" />
                       <Line type="monotone" dataKey="dynamic" stroke="#10b981" strokeWidth={2} dot={false} name="Dynamic RUL" />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
              <div className="p-2 bg-slate-900/50 rounded border border-slate-800 mt-2">
                 <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">当前衰减速率</span>
                    <span className="text-red-400 font-mono font-bold">-0.8% / h</span>
                 </div>
                 <div className="text-[9px] text-slate-500 mt-1">因高负载工况，预计需提前 120h 进行保养。</div>
              </div>
           </SciFiCard>

           {/* Strategy Output */}
           <SciFiCard title="自适应服务策略" subtitle="ADAPTIVE PLAN" className="border-blue-900/50">
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-800 border-l-2 border-l-amber-500">
                    <div>
                       <div className="text-xs font-bold text-white">润滑计划调整</div>
                       <div className="text-[9px] text-slate-400">Target: Main Shaft</div>
                    </div>
                    <span className="text-[10px] bg-amber-900/20 text-amber-400 px-1.5 rounded">INTVL -20%</span>
                 </div>
                 <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-800 border-l-2 border-l-blue-500">
                    <div>
                       <div className="text-xs font-bold text-white">备件库存锁定</div>
                       <div className="text-[9px] text-slate-400">Target: Filter Set</div>
                    </div>
                    <span className="text-[10px] bg-blue-900/20 text-blue-400 px-1.5 rounded">RESERVE</span>
                 </div>
                 <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-800 border-l-2 border-l-green-500">
                    <div>
                       <div className="text-xs font-bold text-white">工单自动派发</div>
                       <div className="text-[9px] text-slate-400">Target: Team A</div>
                    </div>
                    <span className="text-[10px] bg-green-900/20 text-green-400 px-1.5 rounded">SENT</span>
                 </div>
              </div>
              <button className="w-full mt-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 rounded text-[10px] text-blue-200 font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                 <FileText size={12} /> 导出协同报告
              </button>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
