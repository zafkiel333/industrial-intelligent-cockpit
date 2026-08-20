
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  Workflow, Sliders, Zap, Activity, 
  GitMerge, GitPullRequest, ArrowRight, 
  CheckCircle2, AlertTriangle, Settings, 
  Play, RotateCcw, FileText, MessageSquare,
  Video, Mic, MicOff, PhoneOff, Cpu,
  BarChart2, BarChart3, Layers, Timer, Gauge,
  RefreshCw, Wind, Thermometer
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Line, Area, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  ScatterChart, Scatter, ZAxis, ReferenceLine, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart
} from 'recharts';

// --- Types ---

interface StrategyModule {
  id: string;
  name: string;
  category: string;
  status: 'Active' | 'Optimizing' | 'Idle';
  efficiencyGain: number; // %
  icon: any;
}

interface ProcessNode {
  id: string;
  name: string;
  type: 'Input' | 'Process' | 'Decision' | 'Output';
  status: 'Normal' | 'Bottleneck' | 'Idle';
  efficiency: number; // %
  load: number; // %
  x: number;
  y: number;
}

interface ProcessParam {
  id: string;
  name: string;
  current: number;
  optimized: number;
  unit: string;
  delta: number;
}

interface ExpertMessage {
  id: string;
  author: string;
  role: string;
  text: string;
  time: string;
  type: 'text' | 'file';
}

// --- Mock Data ---

const PROCESS_NODES: ProcessNode[] = [
  { id: 'P1', name: '燃料供给 (Fuel)', type: 'Input', status: 'Normal', efficiency: 98, load: 85, x: 10, y: 50 },
  { id: 'P2', name: '空气预热 (Preheat)', type: 'Process', status: 'Normal', efficiency: 92, load: 80, x: 30, y: 30 },
  { id: 'P3', name: '燃烧反应 (Combustion)', type: 'Process', status: 'Bottleneck', efficiency: 75, load: 98, x: 30, y: 70 },
  { id: 'P4', name: '能量转换 (Conversion)', type: 'Process', status: 'Normal', efficiency: 88, load: 85, x: 60, y: 50 },
  { id: 'P5', name: '排放监测 (Emission)', type: 'Decision', status: 'Normal', efficiency: 95, load: 60, x: 80, y: 50 },
  { id: 'P6', name: '动力输出 (Output)', type: 'Output', status: 'Normal', efficiency: 90, load: 85, x: 95, y: 50 },
];

const OPTIMIZATION_MODULES: StrategyModule[] = [
  { id: 'S-COMB', name: '燃烧效率寻优', category: 'Boiler', status: 'Optimizing', efficiencyGain: 1.5, icon: Zap },
  { id: 'S-LOAD', name: '负荷经济分配', category: 'Grid', status: 'Active', efficiencyGain: 2.1, icon: BarChart3 },
  { id: 'S-COOL', name: '循环水变频策略', category: 'Aux', status: 'Idle', efficiencyGain: 0, icon: Wind },
  { id: 'S-TEMP', name: '主汽温PID整定', category: 'Turbine', status: 'Active', efficiencyGain: 0.8, icon: Thermometer },
];

const SIMULATION_DATA = Array.from({length: 40}, (_, i) => ({
  time: `T+${i}`,
  current: 80 + Math.sin(i * 0.3) * 5 + Math.random() * 2,
  optimized: i < 10 ? 80 : 92 + Math.sin(i * 0.3) * 2, // Stable higher after optimization applied
}));

const CHAT_LOG: ExpertMessage[] = [
  { id: '1', author: 'System', role: 'Bot', text: '已加载历史运行数据 (30天)。', time: '10:00', type: 'text' },
  { id: '2', author: 'Dr. Zhang', role: 'Expert', text: '注意到P3节点的负荷率长期处于98%，这明显是产能瓶颈。', time: '10:05', type: 'text' },
  { id: '3', author: 'Dr. Zhang', role: 'Expert', text: '建议调整反应釜温度至435°C，并增加催化剂流速。', time: '10:06', type: 'text' },
  { id: '4', author: 'Li Eng', role: 'Client', text: '收到，正在模拟该参数组合的能耗影响。', time: '10:07', type: 'text' },
  { id: '5', author: 'System', role: 'Bot', text: 'Optimization_Report_v1.pdf Generated', time: '10:08', type: 'file' },
];

const KPI_RADAR = [
  { subject: '产能 (Capacity)', Current: 70, Optimized: 95, fullMark: 100 },
  { subject: '能耗 (Energy)', Current: 60, Optimized: 85, fullMark: 100 },
  { subject: '质量 (Quality)', Current: 90, Optimized: 92, fullMark: 100 },
  { subject: '稳定性 (Stability)', Current: 80, Optimized: 75, fullMark: 100 },
  { subject: '成本 (Cost)', Current: 65, Optimized: 88, fullMark: 100 },
];

// --- Components ---

const ProcessDiagram = ({ activeNode, onSelect }: { activeNode: string, onSelect: (id: string) => void }) => {
  return (
    <div className="w-full h-full relative bg-[#06080e] rounded overflow-hidden select-none border border-cyan-900/30">
       {/* Background Grid */}
       <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
         backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px)',
         backgroundSize: '30px 30px'
       }}></div>

       <svg className="w-full h-full absolute inset-0">
          <defs>
             <marker id="arrow" markerWidth="10" markerHeight="10" refX="20" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#475569" />
             </marker>
             <filter id="glow-node">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
             </filter>
          </defs>

          {/* Connectors (Hardcoded paths based on node coords for style) */}
          {/* P1 -> P2, P1 -> P3 */}
          <path d="M10% 50% L20% 50% L20% 30% L30% 30%" stroke="#334155" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
          <path d="M20% 50% L20% 70% L30% 70%" stroke="#334155" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
          
          {/* P2 -> P4, P3 -> P4 */}
          <path d="M30% 30% L45% 30% L45% 50% L60% 50%" stroke="#334155" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
          <path d="M30% 70% L45% 70% L45% 50% L60% 50%" stroke="#334155" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
          
          {/* P4 -> P5 -> P6 */}
          <line x1="60%" y1="50%" x2="80%" y2="50%" stroke="#334155" strokeWidth="2" markerEnd="url(#arrow)" />
          <line x1="80%" y1="50%" x2="95%" y2="50%" stroke="#334155" strokeWidth="2" markerEnd="url(#arrow)" />

          {/* Animated Particles for Flow */}
          <circle r="3" fill="#0ea5e9">
             <animateMotion dur="3s" repeatCount="indefinite" path="M10% 50% L20% 50% L20% 30% L30% 30% L45% 30% L45% 50% L60% 50% L95% 50%" />
          </circle>
          <circle r="3" fill="#0ea5e9">
             <animateMotion dur="4s" repeatCount="indefinite" path="M10% 50% L20% 50% L20% 70% L30% 70% L45% 70% L45% 50% L60% 50% L95% 50%" />
          </circle>

          {/* Nodes */}
          {PROCESS_NODES.map(node => {
             const isActive = activeNode === node.id;
             const isBottleneck = node.status === 'Bottleneck';
             const color = isBottleneck ? '#ef4444' : isActive ? '#06b6d4' : '#64748b';
             
             return (
               <g 
                 key={node.id} 
                 onClick={() => onSelect(node.id)} 
                 className="cursor-pointer transition-all duration-300 hover:opacity-80"
               >
                  <circle 
                    cx={`${node.x}%`} cy={`${node.y}%`} r={isActive ? 25 : 20} 
                    fill="#0f172a" stroke={color} strokeWidth={2}
                    filter={isActive || isBottleneck ? 'url(#glow-node)' : ''}
                  />
                  {/* Icon Placeholder */}
                  <foreignObject x={`${node.x-2}%`} y={`${node.y-3.5}%`} width="4%" height="7%">
                      <div className={`w-full h-full flex items-center justify-center ${isBottleneck ? 'text-red-500 animate-pulse' : 'text-cyan-500'}`}>
                         {node.type === 'Input' ? <Layers size={18}/> : 
                          node.type === 'Decision' ? <GitMerge size={18}/> : 
                          node.type === 'Output' ? <ArrowRight size={18}/> : <Activity size={18}/>}
                      </div>
                  </foreignObject>

                  {/* Label */}
                  <text x={`${node.x}%`} y={`${node.y + 10}%`} textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold" dy="10">
                     {node.name}
                  </text>
                  
                  {/* Stats Badge */}
                  <g transform={`translate(${node.x}, ${node.y - 10})`}>
                      <rect x="-15" y="-12" width="30" height="12" rx="2" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="0.5" />
                      <text x="0" y="-4" textAnchor="middle" fill="#fff" fontSize="8">{node.efficiency}%</text>
                  </g>
               </g>
             );
          })}
       </svg>
       
       <div className="absolute top-4 left-4 p-2 bg-black/60 rounded border border-cyan-900/50 backdrop-blur">
          <div className="text-[10px] text-cyan-400 font-bold mb-1">FLOW TOPOLOGY</div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
             <div className="w-2 h-2 rounded-full bg-green-500"></div> Normal
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Bottleneck
          </div>
       </div>
    </div>
  );
};

const StrategyNode = ({ module, active, onClick }: { module: StrategyModule, active: boolean, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className={`relative p-3 rounded-lg border cursor-pointer transition-all duration-300 group overflow-hidden
      ${active 
        ? 'bg-emerald-900/30 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
        : 'bg-slate-900/40 border-slate-700 hover:border-emerald-500/30'}
    `}
  >
    {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>}
    
    <div className="flex justify-between items-start mb-2">
      <div className={`p-2 rounded-full ${active ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
        <module.icon size={16} />
      </div>
      {module.status === 'Optimizing' && (
        <span className="text-[9px] text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded bg-emerald-900/20 animate-pulse flex items-center gap-1">
          <RefreshCw size={8} className="animate-spin" /> TUNING
        </span>
      )}
    </div>
    
    <div className="text-sm font-bold text-slate-200 group-hover:text-white mb-1">{module.name}</div>
    <div className="flex justify-between items-center">
       <span className="text-[10px] text-slate-500">{module.category}</span>
       <span className="text-xs font-mono font-bold text-emerald-400">+{module.efficiencyGain}%</span>
    </div>
  </div>
);

const ParameterSlider = ({ param, onChange }: { param: ProcessParam, onChange: (val: number) => void }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-3 rounded hover:border-emerald-500/30 transition-colors group">
    <div className="flex justify-between items-center mb-2">
      <label className="text-xs text-slate-300 font-bold">{param.name}</label>
      <div className="flex items-center gap-2">
         {param.current !== param.optimized && (
             <span className="text-[9px] text-emerald-400 cursor-pointer hover:underline" onClick={() => onChange(param.optimized)}>
                AI Rec: {param.optimized}
             </span>
         )}
         <span className="text-xs font-mono text-emerald-300 bg-emerald-900/20 px-1.5 py-0.5 rounded border border-emerald-900/50">
           {param.current} {param.unit}
         </span>
      </div>
    </div>
    <div className="relative h-6 flex items-center">
      <input 
        type="range" 
        min={param.current * 0.8} 
        max={param.current * 1.2} 
        value={param.current}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 z-10"
      />
      {/* AI Recommendation Marker */}
      <div 
        className="absolute w-0.5 h-3 bg-emerald-400 top-1.5 pointer-events-none z-0" 
        style={{ left: `${((param.optimized - (param.current * 0.8)) / ((param.current * 1.2) - (param.current * 0.8))) * 100}%` }}
        title="AI Recommendation"
      ></div>
    </div>
  </div>
);

export const ProcessOptimizationView: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState('P3');
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(OPTIMIZATION_MODULES[0].id);
  // Reusing PARAMS_LIST type but it was defined locally in previous version, let's redefine mock PARAMS
  const [params, setParams] = useState<ProcessParam[]>([
      { id: '1', name: '反应温度 (Temp)', current: 420, optimized: 435, unit: '°C', delta: 3.5 },
      { id: '2', name: '进料压力 (Press)', current: 1.2, optimized: 1.1, unit: 'MPa', delta: -8.3 },
      { id: '3', name: '催化剂流速 (Flow)', current: 450, optimized: 520, unit: 'L/h', delta: 15.5 },
      { id: '4', name: '冷却水温差 (dT)', current: 12, optimized: 15, unit: '°C', delta: 25.0 },
  ]);

  const activeNode = PROCESS_NODES.find(n => n.id === selectedNodeId) || PROCESS_NODES[0];
  const activeModule = OPTIMIZATION_MODULES.find(m => m.id === selectedModuleId) || OPTIMIZATION_MODULES[0];

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 3000);
  };

  const handleParamChange = (id: string, newVal: number) => {
    setParams(prev => prev.map(p => p.id === id ? { ...p, current: parseFloat(newVal.toFixed(2)) } : p));
  };

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#020305]">
      
      {/* 1. Header */}
      <div className="flex justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#0a1620] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Workflow size={14} /> Process Engineering
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             远程工艺流程 <span className="text-cyan-500">优化咨询中心</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
             <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">Process OEE</span>
                <span className="text-xl font-mono font-bold text-yellow-400">72.4%</span>
             </div>
             <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">Est. Uplift</span>
                <span className="text-xl font-mono font-bold text-green-400">+15.8%</span>
             </div>
             <button 
                onClick={handleSimulate}
                disabled={isSimulating}
                className={`ml-4 flex items-center gap-2 px-6 py-2 text-white text-sm font-bold rounded shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all
                   ${isSimulating ? 'bg-slate-700 cursor-wait' : 'bg-cyan-600 hover:bg-cyan-500'}
                `}
             >
                {isSimulating ? <RefreshCw size={16} className="animate-spin"/> : <Play size={16} />}
                {isSimulating ? 'Simulating...' : 'Run Simulation'}
             </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden px-2 pb-2">
         
         {/* LEFT COLUMN: Parameters & Diagnosis */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
             
             {/* Node Details */}
             <SciFiCard title="节点诊断 (Diagnosis)" subtitle={activeNode.id} subtitleIsCode className="border-cyan-900/30">
                 <div className="flex flex-col gap-4">
                     <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-700">
                         <div>
                             <div className="text-sm font-bold text-white">{activeNode.name}</div>
                             <div className={`text-[10px] uppercase font-bold ${activeNode.status === 'Bottleneck' ? 'text-red-500' : 'text-green-500'}`}>
                                 Status: {activeNode.status}
                             </div>
                         </div>
                         <div className="text-right">
                             <div className="text-[10px] text-slate-500">Efficiency</div>
                             <div className={`text-xl font-mono font-bold ${activeNode.efficiency < 80 ? 'text-red-400' : 'text-white'}`}>
                                 {activeNode.efficiency}%
                             </div>
                         </div>
                     </div>
                     
                     <div className="space-y-1">
                         <div className="text-[10px] text-slate-500 uppercase mb-1">Load Balance</div>
                         <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                             <div className={`h-full ${activeNode.load > 90 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{width: `${activeNode.load}%`}}></div>
                         </div>
                         <div className="flex justify-between text-[10px] text-slate-400">
                             <span>0%</span>
                             <span className={activeNode.load > 90 ? 'text-red-400' : 'text-slate-300'}>{activeNode.load}% Loaded</span>
                         </div>
                     </div>
                 </div>
             </SciFiCard>

             {/* Parameter Tuning */}
             <SciFiCard title="工艺参数调优 (Tuning)" subtitle="INPUTS" className="flex-1 border-slate-800">
                 <div className="flex flex-col gap-3">
                     {params.map(param => (
                         <div key={param.id} className="p-3 bg-slate-900/30 border border-slate-800 rounded hover:border-cyan-500/30 transition-colors">
                             <div className="flex justify-between items-center mb-2">
                                 <span className="text-xs font-bold text-slate-300">{param.name}</span>
                                 <span className={`text-[10px] px-1.5 py-0.5 rounded bg-slate-950 font-mono ${param.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                     {param.delta > 0 ? '+' : ''}{param.delta}%
                                 </span>
                             </div>
                             <div className="flex items-center gap-2">
                                 <div className="flex-1 relative h-6 bg-slate-900 rounded border border-slate-700 overflow-hidden">
                                     {/* Current Marker */}
                                     <div className="absolute top-0 bottom-0 w-1 bg-slate-500 z-10" style={{left: '40%'}} title="Current"></div>
                                     {/* Optimized Marker */}
                                     <div className="absolute top-0 bottom-0 w-1 bg-cyan-400 z-10 shadow-[0_0_5px_cyan]" style={{left: '65%'}} title="Optimized"></div>
                                     {/* Range Fill */}
                                     <div className="absolute top-2 bottom-2 left-[40%] right-[35%] bg-cyan-900/50"></div>
                                 </div>
                                 <span className="text-xs font-mono text-cyan-300 w-12 text-right">{param.optimized}</span>
                             </div>
                             <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                                 <span>Curr: {param.current}</span>
                                 <span>Target</span>
                             </div>
                         </div>
                     ))}
                 </div>
                 <div className="mt-auto pt-4 flex gap-2">
                     <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors flex items-center justify-center gap-1">
                         <RotateCcw size={12}/> Reset
                     </button>
                     <button className="flex-1 py-2 bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-300 text-xs rounded border border-cyan-500/30 transition-colors flex items-center justify-center gap-1">
                         <Settings size={12}/> Auto-Tune
                     </button>
                 </div>
             </SciFiCard>

         </div>

         {/* CENTER: Topology & Simulation */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
             
             {/* 1. Process Topology */}
             <SciFiCard title="工艺拓扑全景 (Process Topology)" subtitle="FLOW MAP" className="flex-[3] border-cyan-900/50 bg-[#020408]" noPadding>
                 <div className="w-full h-full p-2">
                     <ProcessDiagram activeNode={selectedNodeId} onSelect={setSelectedNodeId} />
                 </div>
             </SciFiCard>

             {/* 2. Simulation Chart */}
             <SciFiCard title="优化模拟推演 (Simulation)" subtitle="COMPARISON" className="flex-[2] border-slate-800">
                 <div className="w-full h-full p-2">
                     <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={SIMULATION_DATA} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                             <defs>
                                 <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                                 </linearGradient>
                                 <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                 </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                             <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={9} />
                             <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[60, 100]} />
                             <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#0ea5e9', fontSize: '12px'}} />
                             <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                             
                             <Area type="monotone" dataKey="current" name="Baseline (Current)" stroke="#64748b" strokeWidth={2} fill="url(#colorBase)" strokeDasharray="5 5" />
                             <Area type="monotone" dataKey="optimized" name="Optimized (Projected)" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorOpt)" />
                         </AreaChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

         </div>

         {/* RIGHT: Expert & Report */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
             
             {/* Expert Console */}
             <SciFiCard title="专家在线会诊" subtitle="LIVE" className="border-indigo-900/30">
                 <div className="flex flex-col gap-4">
                     {/* Video Placeholder */}
                     <div className="relative aspect-video bg-black rounded border border-slate-700 flex flex-col items-center justify-center group overflow-hidden">
                         <div className="absolute inset-0 bg-slate-800 opacity-50"></div>
                         <div className="relative z-10 flex flex-col items-center">
                             <div className="w-16 h-16 rounded-full bg-slate-700 border-2 border-indigo-500 flex items-center justify-center mb-2 shadow-lg">
                                 <span className="text-xl font-bold text-white">Dr.Z</span>
                             </div>
                             <span className="text-xs text-white font-bold">Dr. Zhang (Process Expert)</span>
                             <span className="text-[9px] text-green-400 flex items-center gap-1 mt-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Talking...</span>
                         </div>
                         
                         {/* Controls */}
                         <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="p-1.5 rounded-full bg-red-600 text-white"><MicOff size={12}/></button>
                             <button className="p-1.5 rounded-full bg-slate-600 text-white"><Video size={12}/></button>
                         </div>
                     </div>

                     {/* Chat Log */}
                     <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded p-2 h-40 overflow-y-auto custom-scrollbar space-y-2">
                         {CHAT_LOG.map(msg => (
                             <div key={msg.id} className="text-xs">
                                 <div className="flex justify-between text-[9px] text-slate-500 mb-0.5">
                                     <span className={msg.role === 'Expert' ? 'text-indigo-400 font-bold' : msg.role === 'Bot' ? 'text-cyan-400' : 'text-slate-300'}>{msg.author}</span>
                                     <span>{msg.time}</span>
                                 </div>
                                 <div className={`p-1.5 rounded border ${msg.type === 'file' ? 'bg-slate-800 border-dashed border-slate-600 flex items-center gap-2 cursor-pointer hover:bg-slate-700' : 'bg-slate-900/50 border-slate-800 text-slate-300'}`}>
                                     {msg.type === 'file' && <FileText size={12} className="text-cyan-500"/>}
                                     {msg.text}
                                 </div>
                             </div>
                         ))}
                     </div>
                     
                     <div className="flex gap-2">
                         <input className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500" placeholder="Ask expert..." />
                         <button className="p-1.5 bg-indigo-600 rounded text-white hover:bg-indigo-500"><ArrowRight size={14}/></button>
                     </div>
                 </div>
             </SciFiCard>

             {/* Outcome Preview */}
             <SciFiCard title="优化价值评估" subtitle="ROI" className="flex-1 border-slate-800">
                 <div className="h-48 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                         <RadarChart cx="50%" cy="50%" outerRadius="70%" data={KPI_RADAR}>
                             <PolarGrid stroke="#334155" />
                             <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                             <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                             <Radar name="Current" dataKey="Current" stroke="#64748b" strokeWidth={1} fill="transparent" />
                             <Radar name="Optimized" dataKey="Optimized" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.4} />
                             <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#0ea5e9', fontSize: '12px'}} />
                         </RadarChart>
                     </ResponsiveContainer>
                 </div>
                 
                 <div className="mt-2 space-y-2">
                     <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-700">
                         <span className="text-xs text-slate-400">Total Efficiency Gain</span>
                         <span className="text-sm font-bold text-green-400">+12.5%</span>
                     </div>
                     <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-700">
                         <span className="text-xs text-slate-400">Annual Cost Saving</span>
                         <span className="text-sm font-bold text-white">¥ 2.4M</span>
                     </div>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
