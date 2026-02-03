
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  GitBranch, Play, Pause, RotateCcw, 
  Settings, Sliders, Activity, Zap, 
  CheckCircle2, AlertOctagon, FileCode, 
  Database, Share2, Shield, Target,
  Cpu, Layers, ArrowRight, MousePointer2,
  Terminal, BarChart4, TrendingUp, Lock,
  BrainCircuit, MessageSquare
} from 'lucide-react';
import { 
  ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Legend, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell
} from 'recharts';

// --- Types ---

interface Strategy {
  id: string;
  name: string;
  type: 'Optimization' | 'Safety' | 'Response';
  status: 'Draft' | 'Simulating' | 'Verified' | 'Deployed';
  author: string;
  version: string;
  description: string;
}

interface SimParameter {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  category: string;
}

interface LogicBlock {
  id: string;
  type: 'Input' | 'Process' | 'Decision' | 'Output';
  label: string;
  x: number;
  y: number;
  status: 'Active' | 'Idle' | 'Error';
}

interface KpiComparison {
  metric: string;
  baseline: number;
  simulated: number;
  unit: string;
  improvement: number; // %
}

// --- Mock Data ---

const STRATEGIES: Strategy[] = [
  { id: 'STR-2024-001', name: '削峰填谷经济调度 (Peak Shifting)', type: 'Optimization', status: 'Draft', author: 'Dr. Zhang', version: 'v1.2', description: '通过优化储能充放电逻辑，降低尖峰电价时段的电网取电量。' },
  { id: 'STR-2024-002', name: '极端寒潮防冻逻辑 (Anti-Freeze)', type: 'Safety', status: 'Verified', author: 'SysAdmin', version: 'v2.0', description: '当环境温度<-5℃时，自动触发伴热带与循环泵的脉冲运行模式。' },
  { id: 'STR-2024-003', name: '负荷跟随快速响应 (Fast Response)', type: 'Response', status: 'Simulating', author: 'Mike Chen', version: 'v0.9', description: '基于MPC模型预测控制，提高机组对AGC指令的响应速率。' },
];

const INIT_PARAMS: SimParameter[] = [
  { id: 'P1', label: '充电触发阈值', value: 0.15, min: 0.05, max: 0.30, unit: 'CNY/kWh', category: 'Cost' },
  { id: 'P2', label: '最大放电功率', value: 800, min: 200, max: 1200, unit: 'kW', category: 'Constraint' },
  { id: 'P3', label: 'SOC 下限保护', value: 20, min: 10, max: 40, unit: '%', category: 'Safety' },
  { id: 'P4', label: '预测视窗长度', value: 4, min: 1, max: 12, unit: 'h', category: 'Algorithm' },
];

const LOGIC_NODES: LogicBlock[] = [
  { id: 'N1', type: 'Input', label: '电网负荷预测', x: 10, y: 50, status: 'Active' },
  { id: 'N2', type: 'Input', label: '实时电价', x: 10, y: 20, status: 'Active' },
  { id: 'N3', type: 'Decision', label: '成本优化求解器', x: 40, y: 35, status: 'Active' },
  { id: 'N4', type: 'Process', label: '储能SOC约束', x: 40, y: 70, status: 'Active' },
  { id: 'N5', type: 'Decision', label: '安全校验门', x: 70, y: 50, status: 'Idle' },
  { id: 'N6', type: 'Output', label: 'PCS 指令下发', x: 90, y: 50, status: 'Idle' },
];

const KPIS: KpiComparison[] = [
  { metric: '日运行成本', baseline: 12500, simulated: 10800, unit: '¥', improvement: 13.6 },
  { metric: '设备损耗率', baseline: 0.05, simulated: 0.048, unit: '%', improvement: 4.0 },
  { metric: '电网波动率', baseline: 2.1, simulated: 1.5, unit: '%', improvement: 28.5 },
  { metric: '碳排放量', baseline: 4.2, simulated: 3.8, unit: 't', improvement: 9.5 },
];

const EXPERT_COMMENTS = [
  { user: 'Dr. Zhang', role: 'Chief Architect', text: 'SOC下限建议从15%提升至20%，以延长电池寿命。', time: '10:42', type: 'Suggestion' },
  { user: 'System', role: 'Simulator', text: '仿真T+12h出现一次功率越限警告。', time: '10:45', type: 'Warning' },
  { user: 'Sarah Li', role: 'Safety Officer', text: '同意修改。请重新运行全周期仿真验证。', time: '10:48', type: 'Approval' },
];

// Generate Simulation Curves
const SIM_DATA = Array.from({length: 48}, (_, i) => {
  const t = i / 2; // 0 to 24h
  // Baseline: Simple logic
  const baseLoad = 50 + 30 * Math.sin((t-6)/24 * Math.PI * 2) + Math.random()*5;
  // Simulated: Optimized logic (smoother, clipped peaks)
  const simLoad = 50 + 20 * Math.sin((t-6)/24 * Math.PI * 2) + Math.random()*2;
  
  const price = t > 8 && t < 20 ? 1.2 : 0.4; // Peak price during day

  return {
    time: `${Math.floor(t)}:${t%1===0?'00':'30'}`,
    price,
    baseLoad,
    simLoad,
    soc: 100 - (simLoad/2), // Mock SOC
  };
});

// --- Components ---

const LogicFlowDiagram = ({ active }: { active: boolean }) => (
  <div className="relative w-full h-full bg-[#06080e] rounded border border-indigo-900/30 overflow-hidden">
     {/* Background Grid */}
     <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
         backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
         backgroundSize: '20px 20px'
     }}></div>
     
     <svg className="w-full h-full absolute inset-0 pointer-events-none">
        <defs>
           <marker id="arrow-logic" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill="#475569" />
           </marker>
           <filter id="glow-sim">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
           </filter>
        </defs>
        
        {/* Connections */}
        <path d="M10% 20% L40% 35%" stroke="#334155" strokeWidth="2" markerEnd="url(#arrow-logic)" />
        <path d="M10% 50% L40% 35%" stroke="#334155" strokeWidth="2" markerEnd="url(#arrow-logic)" />
        <path d="M40% 35% L70% 50%" stroke="#334155" strokeWidth="2" markerEnd="url(#arrow-logic)" />
        <path d="M40% 70% L70% 50%" stroke="#334155" strokeWidth="2" markerEnd="url(#arrow-logic)" />
        <path d="M70% 50% L90% 50%" stroke="#334155" strokeWidth="2" markerEnd="url(#arrow-logic)" />
        
        {/* Data Flow Animation */}
        {active && (
           <>
              <circle r="3" fill="#0ea5e9" filter="url(#glow-sim)">
                 <animateMotion dur="2s" repeatCount="indefinite" path="M10% 20% L40% 35% L70% 50% L90% 50%" />
              </circle>
              <circle r="3" fill="#10b981" filter="url(#glow-sim)">
                 <animateMotion dur="3s" repeatCount="indefinite" path="M10% 50% L40% 35%" />
              </circle>
           </>
        )}
     </svg>

     {/* HTML Nodes for interaction */}
     {LOGIC_NODES.map(node => (
        <div 
          key={node.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 rounded border shadow-lg transition-all
             ${node.type === 'Decision' ? 'rotate-45 w-24 h-24 flex items-center justify-center' : 'w-32 h-12 flex items-center justify-center'}
             ${active && node.status === 'Active' 
                 ? 'bg-indigo-900/40 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                 : 'bg-slate-900 border-slate-700 text-slate-500'}
          `}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
           <div className={node.type === 'Decision' ? '-rotate-45 text-center' : 'text-center'}>
               <div className="text-[9px] uppercase font-bold opacity-70">{node.type}</div>
               <div className="text-xs font-bold leading-tight">{node.label}</div>
           </div>
        </div>
     ))}
  </div>
);

const ScoreRing = ({ value, label, color }: { value: number, label: string, color: string }) => (
    <div className="flex flex-col items-center">
        <div className="relative w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="36" fill="none" stroke="#1e293b" strokeWidth="6" />
                <circle cx="40" cy="40" r="36" fill="none" stroke={color} strokeWidth="6" strokeDasharray="226" strokeDashoffset={226 - (226 * value) / 100} strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                {value}
            </div>
        </div>
        <div className="mt-1 text-[10px] text-slate-400 uppercase">{label}</div>
    </div>
);

export const StrategySimulationView: React.FC = () => {
  const [selectedStrategyId, setSelectedStrategyId] = useState(STRATEGIES[0].id);
  const [isSimulating, setIsSimulating] = useState(false);
  const [params, setParams] = useState(INIT_PARAMS);
  const [simProgress, setSimProgress] = useState(0);

  const activeStrategy = STRATEGIES.find(s => s.id === selectedStrategyId) || STRATEGIES[0];

  const handleRunSim = () => {
    setIsSimulating(true);
    setSimProgress(0);
    const interval = setInterval(() => {
        setSimProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                setIsSimulating(false);
                return 100;
            }
            return prev + 2;
        });
    }, 50);
  };

  const handleParamChange = (id: string, val: number) => {
    setParams(prev => prev.map(p => p.id === id ? { ...p, value: val } : p));
  };

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#030408]">
      
      {/* 1. Header: Strategy Lab */}
      <div className="flex justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0e0b1f] to-transparent px-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <BrainCircuit size={14} className="animate-pulse" /> Strategy Sandbox
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             远程运行策略 <span className="text-indigo-500">仿真与验证实验室</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
               <span className="text-[10px] text-slate-500 uppercase">Simulation Engine</span>
               <span className="text-sm font-bold text-green-400 flex items-center gap-2">
                   <Zap size={14} /> ONLINE (v4.2)
               </span>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
               <Share2 size={16} /> 部署策略 (Deploy)
            </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden px-4 pb-4">
         
         {/* LEFT: Configuration (3 Cols) */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
             
             {/* Strategy Selector */}
             <SciFiCard title="策略库 (Strategy Library)" subtitle="SELECT" className="border-indigo-900/30">
                 <div className="flex flex-col gap-3">
                     {STRATEGIES.map(st => (
                         <div 
                           key={st.id} 
                           onClick={() => setSelectedStrategyId(st.id)}
                           className={`p-3 rounded border cursor-pointer transition-all duration-200 relative group
                              ${selectedStrategyId === st.id 
                                  ? 'bg-indigo-950/40 border-indigo-500 shadow-[inset_4px_0_0_#6366f1]' 
                                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                           `}
                         >
                             <div className="flex justify-between items-start mb-1">
                                 <span className="text-[10px] font-mono text-slate-500">{st.id}</span>
                                 <span className={`text-[9px] px-1.5 rounded border 
                                     ${st.status === 'Verified' ? 'text-green-400 border-green-900/50 bg-green-900/10' : 
                                       st.status === 'Draft' ? 'text-yellow-400 border-yellow-900/50 bg-yellow-900/10' : 
                                       'text-blue-400 border-blue-900/50 bg-blue-900/10'}
                                 `}>{st.status}</span>
                             </div>
                             <div className={`text-sm font-bold mb-1 ${selectedStrategyId === st.id ? 'text-white' : 'text-slate-300'}`}>
                                 {st.name}
                             </div>
                             <div className="text-[10px] text-slate-500 line-clamp-2">{st.description}</div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>

             {/* Parameters Tuning */}
             <SciFiCard title="参数矩阵配置 (Params)" subtitle="TUNING" className="flex-1 border-slate-800">
                 <div className="space-y-4">
                     {params.map(p => (
                         <div key={p.id}>
                             <div className="flex justify-between text-xs mb-1">
                                 <span className="text-slate-300">{p.label}</span>
                                 <span className="font-mono text-cyan-400">{p.value} <span className="text-[9px] text-slate-500">{p.unit}</span></span>
                             </div>
                             <input 
                               type="range" 
                               min={p.min} max={p.max} step={(p.max-p.min)/20}
                               value={p.value}
                               onChange={(e) => handleParamChange(p.id, parseFloat(e.target.value))}
                               className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                             />
                             <div className="flex justify-between text-[9px] text-slate-600 mt-1">
                                 <span>{p.min}</span>
                                 <span>{p.max}</span>
                             </div>
                         </div>
                     ))}
                 </div>
                 
                 <div className="mt-6 pt-4 border-t border-slate-800 flex gap-2">
                     <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors flex items-center justify-center gap-2">
                         <RotateCcw size={12} /> Reset
                     </button>
                     <button className="flex-1 py-2 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-300 text-xs rounded border border-indigo-500/30 transition-colors flex items-center justify-center gap-2">
                         <Settings size={12} /> Advanced
                     </button>
                 </div>
             </SciFiCard>

         </div>

         {/* CENTER: Simulation Canvas (6 Cols) */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
             
             {/* Main Sim Chart */}
             <SciFiCard title="策略仿真推演 (Simulation)" subtitle="TIMELINE" className="flex-[2] border-indigo-900/50 bg-[#080a12]" noPadding>
                 <div className="w-full h-full p-4 flex flex-col">
                     {/* Toolbar */}
                     <div className="flex justify-between items-center mb-4">
                         <div className="flex gap-4 text-xs">
                             <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-slate-500"></div> Baseline</div>
                             <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-indigo-500"></div> Optimized</div>
                             <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-amber-500 dashed border-b border-dashed"></div> Price</div>
                         </div>
                         <div className="flex items-center gap-2">
                             {isSimulating && <span className="text-[10px] text-green-400 animate-pulse">Computing Physics Model... {simProgress}%</span>}
                             <button 
                               onClick={handleRunSim}
                               disabled={isSimulating}
                               className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all
                                  ${isSimulating ? 'bg-slate-800 text-slate-500 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'}
                               `}
                             >
                                 <Play size={12} fill="currentColor" /> Run Simulation
                             </button>
                         </div>
                     </div>

                     {/* Chart */}
                     <div className="flex-1 w-full relative">
                         {isSimulating && (
                             <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                                 <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                             </div>
                         )}
                         <ResponsiveContainer width="100%" height="100%">
                             <ComposedChart data={SIM_DATA} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                                 <defs>
                                     <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                         <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                     </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                 <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={5} />
                                 <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}/>
                                 <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{fontSize: 10}} domain={[0, 2]} label={{ value: 'Price', angle: 90, position: 'insideRight', fill: '#f59e0b', fontSize: 10 }}/>
                                 <Tooltip contentStyle={{backgroundColor: '#0f0c1d', borderColor: '#6366f1', color: '#fff'}} />
                                 <Area yAxisId="left" type="monotone" dataKey="simLoad" name="Optimized" stroke="#6366f1" strokeWidth={2} fill="url(#colorOpt)" />
                                 <Line yAxisId="left" type="monotone" dataKey="baseLoad" name="Baseline" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                 <Line yAxisId="right" type="step" dataKey="price" name="Elec Price" stroke="#f59e0b" strokeWidth={1} dot={false} />
                             </ComposedChart>
                         </ResponsiveContainer>
                     </div>
                 </div>
             </SciFiCard>

             {/* Logic Visualizer */}
             <SciFiCard title="控制逻辑拓扑 (Logic Topology)" subtitle="VISUALIZER" className="h-[250px] border-slate-800" noPadding>
                 <div className="w-full h-full p-2">
                     <LogicFlowDiagram active={isSimulating} />
                 </div>
             </SciFiCard>

         </div>

         {/* RIGHT: Results & Verification (3 Cols) */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
             
             {/* Verification Scores */}
             <SciFiCard title="验证评估 (Verification)" subtitle="SCORE" className="border-indigo-900/30">
                 <div className="flex justify-around py-2">
                     <ScoreRing value={92} label="Safety" color="#10b981" />
                     <ScoreRing value={85} label="Economy" color="#f59e0b" />
                     <ScoreRing value={98} label="Stability" color="#0ea5e9" />
                 </div>
                 
                 <div className="space-y-3 mt-4">
                     {KPIS.map((kpi, i) => (
                         <div key={i} className="flex justify-between items-center text-xs p-2 bg-slate-900/50 border border-slate-800 rounded">
                             <span className="text-slate-300">{kpi.metric}</span>
                             <div className="text-right">
                                 <span className="font-bold text-white mr-2">{kpi.simulated} {kpi.unit}</span>
                                 <span className="text-green-400 font-mono text-[10px]">(+{kpi.improvement}%)</span>
                             </div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>

             {/* Expert Review Panel */}
             <SciFiCard title="专家评审意见" subtitle="REVIEW" className="flex-1 border-slate-800">
                 <div className="flex flex-col h-full">
                     <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1 mb-2">
                         {EXPERT_COMMENTS.map((c, i) => (
                             <div key={i} className="flex gap-2 items-start text-xs bg-slate-900/30 p-2 rounded">
                                 <div className={`mt-0.5 p-1 rounded-full ${c.type === 'Warning' ? 'bg-red-500/20 text-red-400' : c.type === 'Approval' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                     {c.type === 'Warning' ? <AlertOctagon size={10}/> : c.type === 'Approval' ? <CheckCircle2 size={10}/> : <MessageSquare size={10}/>}
                                 </div>
                                 <div>
                                     <div className="flex justify-between w-full mb-0.5">
                                         <span className="font-bold text-slate-200">{c.user}</span>
                                         <span className="text-[9px] text-slate-500">{c.time}</span>
                                     </div>
                                     <p className="text-slate-400 leading-tight">{c.text}</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                     
                     <div className="pt-2 border-t border-slate-800">
                         <div className="flex items-center gap-2 mb-2">
                             <Shield size={12} className="text-emerald-500"/>
                             <span className="text-[10px] text-emerald-400 font-bold uppercase">Ready for Deployment</span>
                         </div>
                         <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors flex items-center justify-center gap-2">
                             <FileCode size={12} /> Export Validation Report
                         </button>
                     </div>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
