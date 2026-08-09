
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  GitMerge, GitCommit, GitPullRequest, 
  Play, Pause, RefreshCw, Settings, 
  AlertTriangle, CheckCircle2, XCircle, 
  BarChart4, TrendingUp, Zap, Droplets,
  ArrowRight, Layers, Command, Cpu,
  Database, Filter, Sliders
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  ComposedChart, Line, Bar, Legend, ScatterChart, Scatter, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---

// 梯级电站节点
const CASCADE_NODES = [
  { id: 'DAM-01', name: '金沙上游 (Jinsha)', level: 2450, maxLevel: 2500, outflow: 1200, status: 'Normal' },
  { id: 'DAM-02', name: '雅砻江口 (Yalong)', level: 1800, maxLevel: 1850, outflow: 2400, status: 'Normal' },
  { id: 'DAM-03', name: '三峡枢纽 (Three Gorges)', level: 175, maxLevel: 175, outflow: 15000, status: 'Optimized' },
  { id: 'DAM-04', name: '葛洲坝 (Gezhouba)', level: 66, maxLevel: 66, outflow: 15500, status: 'Normal' },
];

// 规则库
const RULE_SETS = [
  { id: 'R-FLOOD', name: '汛期防洪调度方案 A', type: 'Safety', active: true, priority: 1 },
  { id: 'R-ECO', name: '枯水期生态流量保障', type: 'Eco', active: true, priority: 2 },
  { id: 'R-POWER', name: '峰谷电价经济优化', type: 'Economy', active: false, priority: 3 },
  { id: 'R-EMERGENCY', name: '突发水污染应急响应', type: 'Emergency', active: false, priority: 0 },
];

// 调度模拟数据 (24h)
const SIMULATION_DATA = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    inflow: 12000 + Math.sin(i*0.2)*5000 + Math.random()*1000, // 入库流量
    outflow: 11000 + Math.sin(i*0.2)*4000, // 出库流量
    power: 18000 + Math.sin(i*0.2)*6000, // 发电量
    level: 172 + (i/24)*3 // 水位变化
}));

// 多目标优化帕累托前沿
const PARETO_DATA = Array.from({length: 50}, (_, i) => ({
    x: Math.random() * 100, // 安全性
    y: Math.random() * 100, // 经济性
    z: Math.random() * 50 + 50 // 综合得分
}));

// 逻辑节点图数据
const LOGIC_NODES = [
  { id: 1, type: 'INPUT', label: '雨情预报', x: 50, y: 50, status: 'active' },
  { id: 2, type: 'INPUT', label: '当前水位', x: 50, y: 150, status: 'active' },
  { id: 3, type: 'PROCESS', label: '洪水演算模型', x: 200, y: 100, status: 'processing' },
  { id: 'gate1', type: 'GATE', label: '安全约束检验', x: 350, y: 100, status: 'waiting' },
  { id: 4, type: 'OUTPUT', label: '发电计划', x: 500, y: 50, status: 'idle' },
  { id: 5, type: 'OUTPUT', label: '弃水指令', x: 500, y: 150, status: 'idle' },
];

export const WatershedDispatchRulesView: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [activeRule, setActiveRule] = useState('R-FLOOD');

  // 模拟运行效果
  useEffect(() => {
    let interval: any;
    if (isSimulating) {
        interval = setInterval(() => {
            setSimProgress(prev => {
                if (prev >= 100) {
                    setIsSimulating(false);
                    return 100;
                }
                return prev + 2;
            });
        }, 100);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleSimulate = () => {
      setSimProgress(0);
      setIsSimulating(true);
  };

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#04090f] p-2 relative overflow-hidden">
      
      {/* 背景装饰：数据流线条 */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
      </div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-cyan-900/30 p-4 rounded-lg backdrop-blur-md z-10 shadow-xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-900/20 border border-blue-500 rounded flex items-center justify-center relative">
             <Cpu size={30} className="text-blue-400" />
             <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_lime]"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-blue-400 mb-0.5 uppercase tracking-[0.2em] font-black">
               <GitMerge size={12} /> Intelligent Dispatch Core
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
               流域梯级 <span className="text-blue-500">调度规则引擎</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Rules</div>
                <div className="text-2xl font-mono font-bold text-white">128 <span className="text-sm text-slate-500 font-normal">Sets</span></div>
            </div>
             <div className="h-10 w-[1px] bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Optimization Score</div>
                <div className="text-3xl font-mono font-black text-green-400">94.8</div>
            </div>
             <div className="h-10 w-[1px] bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Capacity</div>
                <div className="text-2xl font-mono font-bold text-cyan-400">45.2 <span className="text-sm text-slate-500 font-normal">GW</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 z-10">
        
        {/* --- LEFT: Rule Library & Configuration --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="调度规则库 (Rule Sets)" subtitle="LIBRARY" className="border-cyan-900/30 bg-[#0b121e]">
              <div className="flex flex-col gap-3 mt-2">
                 {RULE_SETS.map((rule) => (
                    <div 
                      key={rule.id}
                      onClick={() => setActiveRule(rule.id)}
                      className={`p-3 rounded border cursor-pointer transition-all relative overflow-hidden group
                        ${activeRule === rule.id 
                            ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                            : 'bg-slate-900/40 border-slate-700 text-slate-500 hover:border-slate-500'}
                      `}
                    >
                        {activeRule === rule.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                        
                        <div className="flex justify-between items-center mb-1">
                           <span className={`text-[10px] px-1.5 rounded font-bold uppercase ${
                               rule.type === 'Safety' ? 'bg-red-900/40 text-red-400' : 
                               rule.type === 'Economy' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-green-900/40 text-green-400'
                           }`}>
                               {rule.type}
                           </span>
                           <span className="text-[10px] font-mono opacity-60">P-{rule.priority}</span>
                        </div>
                        <h3 className={`text-sm font-bold ${activeRule === rule.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                           {rule.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 text-[10px] opacity-60">
                           <CheckCircle2 size={10} /> 14 Constraints
                           <GitCommit size={10} /> v2.4
                        </div>
                    </div>
                 ))}
                 
                 <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 border-dashed rounded text-xs text-slate-400 flex items-center justify-center gap-2 transition-colors">
                     <Settings size={12} /> 配置高级参数
                 </button>
              </div>
           </SciFiCard>

           <SciFiCard title="边界条件约束" subtitle="CONSTRAINTS" className="flex-1 border-slate-800">
               <div className="space-y-4 text-xs">
                   <div className="space-y-1">
                       <div className="flex justify-between text-slate-400">
                           <span>下游防洪限制水位</span>
                           <span className="text-red-400 font-mono">175.0 m</span>
                       </div>
                       <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                           <div className="h-full bg-red-500 w-[95%]"></div>
                       </div>
                   </div>
                   <div className="space-y-1">
                       <div className="flex justify-between text-slate-400">
                           <span>最小生态流量</span>
                           <span className="text-green-400 font-mono">5000 m³/s</span>
                       </div>
                       <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                           <div className="h-full bg-green-500 w-[100%]"></div>
                       </div>
                   </div>
                   <div className="space-y-1">
                       <div className="flex justify-between text-slate-400">
                           <span>电网调峰需求</span>
                           <span className="text-yellow-400 font-mono">High</span>
                       </div>
                       <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                           <div className="h-full bg-yellow-500 w-[80%]"></div>
                       </div>
                   </div>
                   
                   <div className="p-2 bg-slate-900/50 rounded border border-slate-700 mt-2 text-[10px] text-slate-400 leading-relaxed">
                       <span className="text-blue-400 font-bold">提示：</span> 当前入库流量持续上涨，建议激活【削峰错峰】规则模块，优先保证大坝安全。
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: Logic Visualization & Simulation --- */}
        <div className="flex-1 flex flex-col gap-4">
           
           {/* Visual Logic Engine */}
           <div className="flex-1 bg-[#0b0f19] border border-cyan-800/30 rounded-lg relative overflow-hidden shadow-inner group">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400 z-20"></div>
               
               {/* Header HUD */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
                   <div className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest flex items-center gap-2">
                       <Command size={12} /> Logic Topology
                   </div>
                   <div className="text-xl font-bold text-white">规则执行逻辑视窗</div>
               </div>

               {/* SVG Node Graph */}
               <div className="w-full h-full p-8 flex items-center justify-center">
                   <svg width="100%" height="100%" viewBox="0 0 600 300" className="overflow-visible">
                       <defs>
                           <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                               <feGaussianBlur stdDeviation="2" result="blur"/>
                               <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                           </filter>
                           <linearGradient id="linkGrad" x1="0" y1="0" x2="1" y2="0">
                               <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                               <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.8"/>
                           </linearGradient>
                       </defs>
                       
                       {/* Links */}
                       <path d="M70,50 C150,50 150,100 200,100" stroke="url(#linkGrad)" strokeWidth="2" fill="none" className="animate-pulse" />
                       <path d="M70,150 C150,150 150,100 200,100" stroke="url(#linkGrad)" strokeWidth="2" fill="none" className="animate-pulse" />
                       <path d="M240,100 L350,100" stroke="#334155" strokeWidth="2" strokeDasharray="5 5" />
                       <path d="M390,100 C450,100 450,50 500,50" stroke="#334155" strokeWidth="2" />
                       <path d="M390,100 C450,100 450,150 500,150" stroke="#334155" strokeWidth="2" />

                       {/* Nodes */}
                       {LOGIC_NODES.map(node => (
                           <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                               {node.type === 'INPUT' && (
                                   <circle r="20" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                               )}
                               {node.type === 'PROCESS' && (
                                   <rect x="-25" y="-20" width="50" height="40" rx="4" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" filter="url(#glow)" />
                               )}
                               {node.type === 'GATE' && (
                                   <path d="M-20,0 L0,-20 L20,0 L0,20 Z" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                               )}
                               {node.type === 'OUTPUT' && (
                                   <circle r="15" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
                               )}
                               <text y="35" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">{node.label}</text>
                               
                               {/* Active Indicator */}
                               {(isSimulating || node.status === 'active') && (
                                   <circle r="4" fill="#fff" className="animate-ping" />
                               )}
                           </g>
                       ))}
                       
                       {/* Data Packets Animation (Simplified with CSS class on paths above or JS) */}
                   </svg>
               </div>

               {/* Bottom Control Bar */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-2/3 bg-slate-900/90 border border-slate-700 p-2 rounded-full flex items-center gap-4 shadow-xl z-20">
                   <button 
                     onClick={handleSimulate}
                     disabled={isSimulating}
                     className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white transition-colors disabled:opacity-50"
                   >
                       {isSimulating ? <RefreshCw className="animate-spin" size={18}/> : <Play size={18} fill="currentColor"/>}
                   </button>
                   <div className="flex-1 flex flex-col justify-center">
                       <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                           <span>Simulation Progress</span>
                           <span className="text-cyan-400 font-mono">{simProgress}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300" style={{width: `${simProgress}%`}}></div>
                       </div>
                   </div>
                   <button className="text-slate-400 hover:text-white px-2">
                       <Settings size={18} />
                   </button>
               </div>
           </div>

           {/* Simulation Result Charts */}
           <div className="h-[240px] grid grid-cols-2 gap-4">
               <SciFiCard title="模拟调度过程线" subtitle="SIMULATION RESULT" className="border-slate-800" noPadding>
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <ComposedChart data={SIMULATION_DATA}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                               <YAxis yAxisId="flow" stroke="#3b82f6" tick={{fontSize: 10}} domain={[0, 18000]} />
                               <YAxis yAxisId="level" orientation="right" stroke="#f59e0b" tick={{fontSize: 10}} domain={[170, 176]} />
                               <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#334155'}} />
                               <Legend wrapperStyle={{fontSize: '10px'}} />
                               <Area yAxisId="flow" type="monotone" dataKey="inflow" fill="#3b82f6" fillOpacity={0.1} stroke="#3b82f6" name="入库流量" />
                               <Line yAxisId="flow" type="monotone" dataKey="outflow" stroke="#10b981" strokeWidth={2} name="出库流量" />
                               <Line yAxisId="level" type="monotone" dataKey="level" stroke="#f59e0b" strokeWidth={2} dot={false} name="坝前水位" />
                           </ComposedChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="多目标优化分析" subtitle="PARETO FRONTIER" className="border-slate-800" noPadding>
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <ScatterChart margin={{top: 10, right: 10, bottom: 10, left: 0}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                               <XAxis type="number" dataKey="x" name="安全指标" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Safety Index', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                               <YAxis type="number" dataKey="y" name="经济指标" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Economic Index', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                               <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#020617'}} />
                               <Scatter name="Solutions" data={PARETO_DATA} fill="#0ea5e9" opacity={0.6} />
                               {/* Highlight Optimal Point */}
                               <ReferenceLine x={90} stroke="#f59e0b" strokeDasharray="3 3" />
                               <ReferenceLine y={85} stroke="#f59e0b" strokeDasharray="3 3" />
                           </ScatterChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>
           </div>

        </div>

        {/* --- RIGHT: Cascade Status & Output --- */}
        <div className="w-[300px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="梯级电站概览" subtitle="CASCADE STATUS" className="h-full border-cyan-900/30">
               <div className="flex flex-col gap-4 h-full">
                   {CASCADE_NODES.map((node, i) => (
                       <div key={node.id} className="relative pl-4 group">
                           {/* Connecting Line */}
                           {i < CASCADE_NODES.length - 1 && (
                               <div className="absolute left-[5px] top-3 bottom-[-16px] w-0.5 bg-slate-800 group-hover:bg-blue-900 transition-colors"></div>
                           )}
                           
                           <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 z-10 bg-slate-900 ${node.status === 'Optimized' ? 'border-green-500 shadow-[0_0_8px_lime]' : 'border-blue-500'}`}></div>
                           
                           <div className="bg-slate-900/40 border border-slate-800 p-3 rounded hover:border-cyan-500/30 transition-all">
                               <div className="flex justify-between items-center mb-2">
                                   <span className="text-xs font-bold text-white">{node.name}</span>
                                   <span className={`text-[9px] px-1.5 rounded uppercase ${node.status === 'Optimized' ? 'bg-green-900/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                                       {node.status}
                                   </span>
                               </div>
                               <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                                   <div className="flex flex-col">
                                       <span>Level</span>
                                       <span className="text-cyan-300 font-mono">{node.level} m</span>
                                   </div>
                                   <div className="flex flex-col text-right">
                                       <span>Outflow</span>
                                       <span className="text-white font-mono">{node.outflow} m³/s</span>
                                   </div>
                               </div>
                               <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                                   <div className="bg-blue-600 h-full" style={{width: `${(node.level/node.maxLevel)*100}%`}}></div>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
