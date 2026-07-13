
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[res-ops-optimization]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/res-ops-optimization';
import { 
  Sliders, Zap, TrendingUp, Layers, 
  GitBranch, RefreshCw, Play, Save, 
  Cpu, Thermometer, Wind, Activity,
  CheckCircle2, ArrowRight, BrainCircuit,
  Settings, BarChart3, Minimize2,
  Filter, Sparkles
} from 'lucide-react';
import { 
  ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  BarChart, Bar, Cell
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

interface Parameter {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  recommendation: number; // AI suggested value
}

// --- Mock Data ---

const OPTIMIZATION_MODULES: StrategyModule[] = [
  { id: 'S-COMB', name: '燃烧效率寻优', category: 'Boiler', status: 'Optimizing', efficiencyGain: 1.5, icon: Zap },
  { id: 'S-LOAD', name: '负荷经济分配', category: 'Grid', status: 'Active', efficiencyGain: 2.1, icon: BarChart3 },
  { id: 'S-COOL', name: '循环水变频策略', category: 'Aux', status: 'Idle', efficiencyGain: 0, icon: Wind },
  { id: 'S-TEMP', name: '主汽温PID整定', category: 'Turbine', status: 'Active', efficiencyGain: 0.8, icon: Thermometer },
];

const SIMULATION_DATA = Array.from({length: 60}, (_, i) => {
  const t = i;
  const baseline = 85 + Math.sin(t * 0.1) * 5 + Math.random() * 2;
  const optimized = 88 + Math.sin(t * 0.1) * 4 + Math.random(); // Smoother and higher
  return {
    time: t,
    baseline: baseline,
    optimized: optimized,
    delta: optimized - baseline
  };
});

const INITIAL_PARAMS: Parameter[] = [
  { id: 'P1', label: '氧量设定值 (O2 Setpoint)', value: 2.5, min: 1.0, max: 5.0, unit: '%', recommendation: 2.2 },
  { id: 'P2', label: '风煤比系数 (Air/Fuel)', value: 1.8, min: 1.2, max: 2.5, unit: '', recommendation: 1.75 },
  { id: 'P3', label: '炉膛负压 (Furnace Press)', value: -50, min: -100, max: 0, unit: 'Pa', recommendation: -45 },
  { id: 'P4', label: '一次风压 (Primary Air)', value: 6.5, min: 5.0, max: 8.0, unit: 'kPa', recommendation: 6.2 },
];

const ROI_METRICS = [
  { name: 'Fuel Cost', current: 100, projected: 98.5 },
  { name: 'Emissions', current: 100, projected: 95.0 },
  { name: 'Stability', current: 100, projected: 105.0 },
];

// --- Components ---

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

const ParameterSlider = ({ param, onChange }: { param: Parameter, onChange: (val: number) => void }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-3 rounded hover:border-emerald-500/30 transition-colors group">
    <div className="flex justify-between items-center mb-2">
      <label className="text-xs text-slate-300 font-bold">{param.label}</label>
      <div className="flex items-center gap-2">
         {param.value !== param.recommendation && (
             <span className="text-[9px] text-emerald-400 cursor-pointer hover:underline" onClick={() => onChange(param.recommendation)}>
                AI Rec: {param.recommendation}
             </span>
         )}
         <span className="text-xs font-mono text-emerald-300 bg-emerald-900/20 px-1.5 py-0.5 rounded border border-emerald-900/50">
           {param.value} {param.unit}
         </span>
      </div>
    </div>
    <div className="relative h-6 flex items-center">
      <input 
        type="range" 
        min={param.min} 
        max={param.max} 
        step={(param.max - param.min) / 100}
        value={param.value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 z-10"
      />
      {/* AI Recommendation Marker */}
      <div 
        className="absolute w-0.5 h-3 bg-emerald-400 top-1.5 pointer-events-none z-0" 
        style={{ left: `${((param.recommendation - param.min) / (param.max - param.min)) * 100}%` }}
        title="AI Recommendation"
      ></div>
    </div>
  </div>
);

export const OperationOptimizationView: React.FC = () => {
  const [selectedModuleId, setSelectedModuleId] = useState(OPTIMIZATION_MODULES[0].id);
  const [params, setParams] = useState(INITIAL_PARAMS);
  const [isSimulating, setIsSimulating] = useState(false);

  const activeModule = OPTIMIZATION_MODULES.find(m => m.id === selectedModuleId) || OPTIMIZATION_MODULES[0];

  const handleParamChange = (id: string, newVal: number) => {
    setParams(prev => prev.map(p => p.id === id ? { ...p, value: parseFloat(newVal.toFixed(2)) } : p));
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#020508]">
      
      {/* 1. Header: Control Center */}
      <div className="flex justify-between items-end border-b border-emerald-900/50 pb-4 bg-gradient-to-r from-[#031c16] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-wider">
             <Sliders size={14} /> Strategic Control Plane
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             远程运维 <span className="text-emerald-500">策略优化中心</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Active Strategies</div>
                <div className="text-xl font-mono font-bold text-white">4 / 12</div>
             </div>
             <div className="h-8 w-px bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Est. Annual Saving</div>
                <div className="text-xl font-mono font-bold text-emerald-400">¥ 4.2 M</div>
             </div>
             <button className="ml-4 flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                <GitBranch size={16} /> 部署策略
             </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
         
         {/* LEFT: Strategy Library */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
             <div className="flex justify-between items-center text-xs text-slate-400 px-1 mb-2">
                 <span className="uppercase font-bold">Optimization Modules</span>
                 <Filter size={14} className="cursor-pointer hover:text-white" />
             </div>
             
             <div className="grid grid-cols-1 gap-3">
                 {OPTIMIZATION_MODULES.map(mod => (
                     <StrategyNode 
                       key={mod.id} 
                       module={mod} 
                       active={selectedModuleId === mod.id} 
                       onClick={() => setSelectedModuleId(mod.id)} 
                     />
                 ))}
             </div>

             {/* AI Suggestion Box */}
             <div className="mt-auto p-4 rounded border border-indigo-500/30 bg-indigo-900/10 relative overflow-hidden">
                 <div className="absolute -right-4 -top-4 text-indigo-500/20"><BrainCircuit size={64} /></div>
                 <div className="relative z-10">
                     <div className="text-xs font-bold text-indigo-300 mb-2 flex items-center gap-2">
                         <Sparkles size={12} /> AI Opportunity
                     </div>
                     <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                         Based on recent weather patterns, enabling "Cooling Tower Optimization" could yield an additional <strong>0.5% efficiency</strong>.
                     </p>
                     <button className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition-colors">
                         Review Proposal
                     </button>
                 </div>
             </div>
         </div>

         {/* CENTER: Simulation & Visuals */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
             
             {/* 1. Digital Twin Topology */}
             <SciFiCard title="逻辑拓扑仿真 (Digital Twin Logic)" subtitle="LIVE SIM" className="flex-[2] border-emerald-900/50 bg-[#020508]" noPadding>
                 <div className="w-full h-full relative">
                     {/* Overlay Grid */}
                     <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                         backgroundImage: 'linear-gradient(#059669 1px, transparent 1px), linear-gradient(90deg, #059669 1px, transparent 1px)',
                         backgroundSize: '40px 40px'
                     }}></div>

                     {/* 3D Model */}
                     <div className="absolute inset-0 z-0">
                         <ThreeScene type="generator" color="#10b981" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                     </div>

                     {/* Overlay Logic Nodes (SVG) */}
                     <svg className="absolute inset-0 w-full h-full pointer-events-none">
                         <defs>
                             <filter id="glow">
                                 <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                                 <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                             </filter>
                         </defs>
                         {/* Connection Lines */}
                         <path d="M200,100 L400,150 L600,100" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="5 5" className="animate-[dash_2s_linear_infinite]" filter="url(#glow)" />
                         <path d="M400,150 L400,300" stroke="#10b981" strokeWidth="2" fill="none" filter="url(#glow)" />
                         
                         {/* Nodes */}
                         <circle cx="200" cy="100" r="4" fill="#0ea5e9" />
                         <text x="210" y="105" fill="#0ea5e9" fontSize="10">Input: Fuel Flow</text>

                         <circle cx="600" cy="100" r="4" fill="#0ea5e9" />
                         <text x="610" y="105" fill="#0ea5e9" fontSize="10">Input: Air Flow</text>

                         <circle cx="400" cy="150" r="6" fill="#f59e0b" className="animate-pulse" />
                         <text x="415" y="155" fill="#f59e0b" fontSize="10" fontWeight="bold">AI Optimizer</text>

                         <circle cx="400" cy="300" r="4" fill="#10b981" />
                         <text x="415" y="305" fill="#10b981" fontSize="10">Output: Efficiency</text>
                     </svg>
                 </div>
             </SciFiCard>

             {/* 2. Simulation Chart */}
             <SciFiCard title="优化效果预演 (Performance Forecast)" subtitle="BASELINE vs OPTIMIZED" className="h-[280px] border-slate-800">
                 <div className="w-full h-full p-2 relative">
                     {isSimulating && (
                         <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col gap-2">
                             <RefreshCw className="animate-spin text-emerald-500" size={32} />
                             <span className="text-xs text-emerald-300 uppercase tracking-widest">Calculating Physics Model...</span>
                         </div>
                     )}
                     
                     <ResponsiveContainer width="100%" height="100%">
                         <ComposedChart data={SIMULATION_DATA} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                             <defs>
                                 <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                 </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                             <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Time (min)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                             <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[80, 100]} />
                             <Tooltip contentStyle={{backgroundColor: '#020508', borderColor: '#10b981', color: '#fff'}} />
                             <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                             
                             <Area type="monotone" dataKey="optimized" name="Optimized (Predicted)" stroke="#10b981" strokeWidth={2} fill="url(#colorOpt)" />
                             <Line type="monotone" dataKey="baseline" name="Baseline (Current)" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                         </ComposedChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

         </div>

         {/* RIGHT: Tuning & Results */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-1">
             
             {/* Parameter Tuning Deck */}
             <SciFiCard title="参数微调 (Fine-Tuning)" subtitle="CONTROL DECK" className="flex-1 border-emerald-900/30">
                 <div className="flex flex-col gap-4">
                     <div className="text-xs text-slate-500 bg-slate-900/50 p-2 rounded border border-slate-800">
                         Current Strategy: <span className="text-emerald-400 font-bold">{activeModule.name}</span>
                     </div>
                     
                     <div className="space-y-3">
                         {params.map(p => (
                             <ParameterSlider key={p.id} param={p} onChange={(v) => handleParamChange(p.id, v)} />
                         ))}
                     </div>

                     <div className="mt-auto pt-4 border-t border-slate-800">
                         <button 
                           onClick={handleRunSimulation}
                           className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded flex items-center justify-center gap-2 border border-slate-600 transition-colors"
                         >
                             <Play size={14} className="text-emerald-400" /> Run Simulation
                         </button>
                         <div className="flex gap-2 mt-2">
                             <button className="flex-1 py-2 bg-slate-900 text-slate-400 text-[10px] rounded border border-slate-800 hover:text-white">
                                 Reset to Default
                             </button>
                             <button className="flex-1 py-2 bg-slate-900 text-emerald-400 text-[10px] rounded border border-slate-800 hover:bg-emerald-900/20">
                                 Apply AI Recs
                             </button>
                         </div>
                     </div>
                 </div>
             </SciFiCard>

             {/* Outcome Scorecard */}
             <SciFiCard title="预期收益评估 (Projected ROI)" subtitle="SCORECARD" className="h-[280px] border-slate-800">
                 <div className="h-full w-full flex flex-col justify-center">
                     <div className="h-40 w-full mb-4">
                         <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={ROI_METRICS} layout="vertical" margin={{left: 10, right: 10}}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                 <XAxis type="number" domain={[80, 110]} hide />
                                 <YAxis dataKey="name" type="category" stroke="#94a3b8" width={70} tick={{fontSize: 10}} />
                                 <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#020508', borderColor: '#333'}} />
                                 <Bar dataKey="current" name="Current" fill="#64748b" barSize={8} radius={[0, 4, 4, 0]} />
                                 <Bar dataKey="projected" name="Projected" fill="#10b981" barSize={8} radius={[0, 4, 4, 0]} />
                             </BarChart>
                         </ResponsiveContainer>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-2 text-center">
                         <div className="p-2 bg-slate-900/50 rounded border border-slate-800">
                             <div className="text-[9px] text-slate-500 uppercase">Efficiency Delta</div>
                             <div className="text-lg font-bold text-emerald-400">+1.8%</div>
                         </div>
                         <div className="p-2 bg-slate-900/50 rounded border border-slate-800">
                             <div className="text-[9px] text-slate-500 uppercase">Cost Saving</div>
                             <div className="text-lg font-bold text-white">¥ 240k<span className="text-[9px] text-slate-500">/yr</span></div>
                         </div>
                     </div>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
