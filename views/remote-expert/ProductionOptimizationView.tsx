
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  Workflow, Timer, BarChart4, TrendingUp, 
  AlertOctagon, Zap, ArrowRight, Layers, 
  GitBranch, RefreshCw, CheckCircle2, Sliders,
  Play, FastForward, Pause, Database,
  Settings, UserCheck, MessageSquare, Briefcase,
  Calendar, Users, Sparkles, BrainCircuit, Video
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, 
  ComposedChart, Line, Area, Cell, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, Legend, ReferenceLine, AreaChart
} from 'recharts';

// --- Types ---

interface ProductionNode {
  id: string;
  name: string;
  load: number; // 0-100%
  status: 'Normal' | 'Bottleneck' | 'Warning' | 'Idle';
  oee: number;
  taktTime: number; // seconds
}

interface ScheduleBlock {
  id: string;
  job: string;
  start: number; // hour offset
  duration: number; // hours
  status: 'Done' | 'Active' | 'Planned' | 'Optimized';
  machine: string;
}

interface OptimizationStrategy {
  id: string;
  name: string;
  type: 'Schedule' | 'Process' | 'Resource';
  gain: number; // % Efficiency gain
  cost: number; // Implementation cost score
  description: string;
}

// --- Mock Data ---

const PROCESS_FLOW: ProductionNode[] = [
  { id: 'OP-10', name: '原料预处理', load: 65, status: 'Normal', oee: 92, taktTime: 45 },
  { id: 'OP-20', name: '粗加工单元', load: 82, status: 'Normal', oee: 88, taktTime: 120 },
  { id: 'OP-30', name: '精细研磨', load: 98, status: 'Bottleneck', oee: 65, taktTime: 180 }, // Bottleneck
  { id: 'OP-40', name: '热处理', load: 90, status: 'Warning', oee: 78, taktTime: 150 },
  { id: 'OP-50', name: '最终组装', load: 70, status: 'Normal', oee: 95, taktTime: 90 },
];

const SCHEDULE_CURRENT: ScheduleBlock[] = [
  { id: 'J-101', job: 'Order #A1', start: 0, duration: 4, status: 'Done', machine: 'M-01' },
  { id: 'J-102', job: 'Order #A2', start: 4, duration: 5, status: 'Active', machine: 'M-01' },
  { id: 'J-103', job: 'Order #B1', start: 9, duration: 3, status: 'Planned', machine: 'M-01' },
  { id: 'J-GAP', job: 'Changeover', start: 12, duration: 2, status: 'Planned', machine: 'M-01' }, // Long gap
];

const SCHEDULE_OPTIMIZED: ScheduleBlock[] = [
  { id: 'J-101', job: 'Order #A1', start: 0, duration: 4, status: 'Done', machine: 'M-01' },
  { id: 'J-102', job: 'Order #A2', start: 4, duration: 4.5, status: 'Optimized', machine: 'M-01' }, // Faster
  { id: 'J-103', job: 'Order #B1', start: 8.5, duration: 3, status: 'Optimized', machine: 'M-01' },
  { id: 'J-GAP', job: 'Quick Change', start: 11.5, duration: 0.5, status: 'Optimized', machine: 'M-01' }, // Reduced gap
  { id: 'J-104', job: 'Order #C1', start: 12, duration: 4, status: 'Optimized', machine: 'M-01' }, // Extra job fit in
];

const STRATEGIES: OptimizationStrategy[] = [
  { id: 'STR-01', name: 'APS 高级排程算法', type: 'Schedule', gain: 12.5, cost: 20, description: '利用 AI 算法压缩换模时间，优化订单顺序。' },
  { id: 'STR-02', name: '工序并行化改造', type: 'Process', gain: 18.0, cost: 65, description: '将 OP-30 与 OP-40 部分工序并行处理，需增加缓存区。' },
  { id: 'STR-03', name: '动态班次调整', type: 'Resource', gain: 8.5, cost: 40, description: '根据预测负荷，在瓶颈工位增加 0.5 个班次人力。' },
];

const PERFORMANCE_RADAR = [
  { subject: '产能 (Throughput)', Current: 70, Optimized: 92, fullMark: 100 },
  { subject: '交付周期 (Lead Time)', Current: 60, Optimized: 85, fullMark: 100 }, // Higher is better (shorter)
  { subject: '库存周转 (WIP)', Current: 50, Optimized: 80, fullMark: 100 },
  { subject: '设备利用率 (OEE)', Current: 75, Optimized: 88, fullMark: 100 },
  { subject: '准时交付率 (OTD)', Current: 80, Optimized: 95, fullMark: 100 },
];

const THROUGHPUT_TREND = Array.from({length: 12}, (_, i) => ({
  hour: `${i+8}:00`,
  actual: 50 + Math.random() * 20,
  target: 80
}));

// --- Sub-Components ---

const ProcessFlowBar = ({ nodes }: { nodes: ProductionNode[] }) => {
  return (
    <div className="flex items-center w-full gap-2 relative h-32">
      {nodes.map((node, i) => (
        <div key={node.id} className="flex-1 flex flex-col items-center group relative cursor-pointer hover:-translate-y-1 transition-transform">
          {/* Connector Line */}
          {i < nodes.length - 1 && (
            <div className="absolute top-[24px] left-[50%] w-full h-1 bg-slate-800 -z-10">
              <div 
                className={`h-full bg-cyan-500/50 transition-all duration-1000`} 
                style={{width: '100%', animation: 'pulse 2s infinite'}}
              ></div>
            </div>
          )}
          
          <div className={`
            w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold shadow-lg relative z-10
            ${node.status === 'Bottleneck' 
              ? 'bg-red-900/40 border-red-500 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse' 
              : node.status === 'Warning' 
                ? 'bg-yellow-900/40 border-yellow-500 text-yellow-100' 
                : 'bg-slate-900/80 border-cyan-500/50 text-cyan-100'}
          `}>
             {node.load}%
          </div>
          <div className="mt-2 text-center">
             <div className="text-[10px] text-slate-400 font-bold uppercase">{node.id}</div>
             <div className="text-xs text-white truncate w-20">{node.name}</div>
          </div>
          
          {/* Hover Details */}
          <div className="absolute top-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-slate-700 p-2 rounded z-20 w-32 text-center pointer-events-none">
             <div className="text-[10px] text-slate-400">OEE: <span className="text-white">{node.oee}%</span></div>
             <div className="text-[10px] text-slate-400">Takt: <span className="text-white">{node.taktTime}s</span></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const GanttRow = ({ schedule, label, isSimulated = false, isSimulating = false }: { schedule: ScheduleBlock[], label: string, isSimulated?: boolean, isSimulating?: boolean }) => (
  <div className="flex flex-col gap-1 mb-4">
    <div className="flex justify-between text-xs text-slate-400 mb-1">
       <span>{label}</span>
       <span className="font-mono">{isSimulating ? 'Calculating...' : ''}</span>
    </div>
    <div className="w-full h-8 bg-slate-900/50 rounded border border-slate-800 relative overflow-hidden flex items-center">
       {/* Hour Markers */}
       {Array.from({length: 12}).map((_, i) => (
         <div key={i} className="absolute h-full w-px bg-slate-800" style={{left: `${(i/12)*100}%`}}></div>
       ))}
       
       {schedule.map((block) => (
         <div 
           key={block.id}
           className={`absolute h-6 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-sm transition-all duration-500 border
             ${block.status === 'Done' ? 'bg-slate-600 border-slate-500' : 
               block.status === 'Active' ? 'bg-cyan-600 border-cyan-400' : 
               block.status === 'Optimized' ? 'bg-emerald-600 border-emerald-400' : 'bg-indigo-600 border-indigo-400'}
           `}
           style={{
             left: `${(block.start / 16) * 100}%`, // Assuming 16h shift view
             width: `${(block.duration / 16) * 100}%`,
             top: 3
           }}
         >
           {block.job}
         </div>
       ))}
    </div>
  </div>
);

// --- Main Component ---

export const ProductionOptimizationView: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState(STRATEGIES[0].id);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  
  const activeStrategy = STRATEGIES.find(s => s.id === selectedStrategy) || STRATEGIES[0];

  const handleSimulate = () => {
    setIsSimulating(true);
    setSimProgress(0);
    const interval = setInterval(() => {
      setSimProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulating(false);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200 bg-[#020204]">
      
      {/* 1. Header: Production Command */}
      <div className="flex justify-between items-end border-b border-emerald-900/50 pb-4 bg-gradient-to-r from-[#031410] to-transparent px-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-wider">
             <Workflow size={14} className="animate-pulse" /> Production Orchestration
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             远程生产组织 <span className="text-emerald-500">优化建议中心</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Overall OEE</div>
                <div className="text-xl font-mono font-bold text-white">72.4% <span className="text-xs text-red-400">(-2.1%)</span></div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Bottleneck</div>
                <div className="text-xl font-mono font-bold text-red-500 flex items-center gap-2 justify-end">
                    <AlertOctagon size={16}/> OP-30
                </div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Est. Uplift</div>
                <div className="text-xl font-mono font-bold text-emerald-400">+15.8%</div>
            </div>
        </div>
      </div>

      {/* 2. Top Banner: Process Flow Heatmap */}
      <div className="px-4">
        <SciFiCard className="border-emerald-900/30 bg-[#05080c] py-4" noPadding>
           <div className="px-8 relative">
               <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                   <Layers size={14} /> Real-time Production Line Status
               </div>
               <ProcessFlowBar nodes={PROCESS_FLOW} />
           </div>
        </SciFiCard>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden px-4 pb-4">
         
         {/* LEFT COLUMN: Bottleneck Digital Twin */}
         <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
             
             <SciFiCard title="瓶颈工位透视 (OP-30)" subtitle="DIGITAL TWIN" className="flex-[3] border-red-900/40 bg-[#080303]" noPadding>
                 <div className="w-full h-full relative">
                     {/* 3D Scene */}
                     <div className="absolute inset-0 z-0">
                         <ThreeScene type="crusher" color="#ef4444" />
                     </div>
                     
                     {/* Overlay Stats */}
                     <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                         <div className="bg-black/60 backdrop-blur border border-red-500/30 px-3 py-2 rounded w-40">
                             <div className="text-[9px] text-red-300 uppercase font-bold mb-1">Cycle Time (Act)</div>
                             <div className="text-2xl font-mono font-bold text-white tracking-tighter">
                                 185 <span className="text-xs font-normal text-slate-400">sec</span>
                             </div>
                             <div className="text-[9px] text-slate-500">Target: 150 sec</div>
                         </div>
                         <div className="bg-black/60 backdrop-blur border border-slate-700 px-3 py-2 rounded w-40">
                             <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Availability</div>
                             <div className="text-lg font-mono font-bold text-yellow-400">82.5%</div>
                         </div>
                     </div>
                     
                     <div className="absolute bottom-4 right-4 z-10">
                         <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-600 rounded text-xs text-white hover:bg-red-900/50 hover:border-red-500 transition-colors">
                             <Video size={14} /> 现场监控
                         </button>
                     </div>
                 </div>
             </SciFiCard>

             <SciFiCard title="产能趋势分析" subtitle="THROUGHPUT" className="flex-[2] border-slate-800">
                 <div className="w-full h-full p-2">
                     <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={THROUGHPUT_TREND}>
                             <defs>
                                 <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                 </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                             <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} />
                             <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                             <Tooltip contentStyle={{backgroundColor: '#0f0c15', borderColor: '#f59e0b', color: '#fff'}} />
                             <ReferenceLine y={80} stroke="#10b981" strokeDasharray="5 5" label={{value:'Target', fill:'#10b981', fontSize:10}} />
                             <Area type="monotone" dataKey="actual" stroke="#f59e0b" fill="url(#colorThroughput)" />
                         </AreaChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

         </div>

         {/* CENTER COLUMN: Scheduling Sandbox */}
         <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
             
             {/* Strategy Selector */}
             <div className="grid grid-cols-3 gap-3">
                 {STRATEGIES.map(str => (
                     <div 
                       key={str.id}
                       onClick={() => setSelectedStrategy(str.id)}
                       className={`p-3 rounded border cursor-pointer transition-all relative overflow-hidden group
                          ${selectedStrategy === str.id 
                              ? 'bg-emerald-950/40 border-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]' 
                              : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'}
                       `}
                     >
                         <div className="flex justify-between items-start mb-2">
                             <div className={`p-1.5 rounded-full ${selectedStrategy === str.id ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                                 {str.type === 'Schedule' ? <Calendar size={14}/> : str.type === 'Process' ? <Settings size={14}/> : <Users size={14}/>}
                             </div>
                             <span className="text-[10px] font-mono text-slate-500">{str.id}</span>
                         </div>
                         <div className="text-xs font-bold text-white leading-tight mb-1">{str.name}</div>
                         <div className="flex gap-2 text-[9px] text-slate-400">
                             <span className="text-emerald-400">Gain: +{str.gain}%</span>
                         </div>
                     </div>
                 ))}
             </div>

             {/* Scheduling Sandbox */}
             <SciFiCard title="排产策略沙箱 (Scheduling Sandbox)" subtitle="GANTT SIM" className="flex-1 border-indigo-900/50 bg-[#080a14]">
                 <div className="flex flex-col h-full gap-4">
                     <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-800">
                         <div className="text-xs text-slate-300 flex items-center gap-2">
                             <GitBranch size={14} className="text-indigo-400" />
                             Strategy: <span className="text-white font-bold">{activeStrategy.name}</span>
                         </div>
                         <button 
                           onClick={handleSimulate}
                           disabled={isSimulating}
                           className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all
                              ${isSimulating ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}
                           `}
                         >
                             {isSimulating ? <RefreshCw size={12} className="animate-spin"/> : <Play size={12} fill="currentColor"/>}
                             {isSimulating ? `Simulating ${simProgress}%` : 'Run Simulation'}
                         </button>
                     </div>

                     <div className="flex-1 overflow-y-auto pr-1 space-y-6">
                         <div>
                             <div className="text-[10px] text-slate-500 uppercase mb-2 pl-1">Baseline Schedule</div>
                             <GanttRow schedule={SCHEDULE_CURRENT} label="Machine 01" />
                         </div>
                         
                         {/* Simulation Result Overlay */}
                         <div className="relative">
                             <div className={`transition-all duration-1000 ${isSimulating || simProgress === 100 ? 'opacity-100' : 'opacity-30 blur-sm'}`}>
                                 <div className="text-[10px] text-emerald-500 uppercase mb-2 pl-1 flex items-center gap-2">
                                     Optimized Schedule <Sparkles size={10} />
                                 </div>
                                 <GanttRow schedule={SCHEDULE_OPTIMIZED} label="Machine 01 (Opt)" isSimulated={true} isSimulating={isSimulating} />
                             </div>
                             
                             {(!isSimulating && simProgress === 0) && (
                                 <div className="absolute inset-0 flex items-center justify-center">
                                     <div className="bg-black/80 px-4 py-2 rounded border border-slate-600 text-xs text-slate-300">
                                         Press "Run Simulation" to visualize
                                     </div>
                                 </div>
                             )}
                         </div>
                     </div>
                     
                     <div className="p-3 bg-indigo-900/10 border border-indigo-500/20 rounded text-xs text-indigo-200 leading-relaxed">
                         <div className="font-bold flex items-center gap-2 mb-1"><BrainCircuit size={14}/> AI Explanation</div>
                         {activeStrategy.description} Predicted reduction in changeover time by <span className="text-white font-bold">15%</span>.
                     </div>
                 </div>
             </SciFiCard>
         </div>

         {/* RIGHT COLUMN: Evaluation & Action */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
             
             {/* Outcome Radar */}
             <SciFiCard title="综合效能预估" subtitle="METRICS" className="h-[280px] border-slate-800">
                 <div className="w-full h-full relative">
                     <ResponsiveContainer width="100%" height="100%">
                         <RadarChart cx="50%" cy="50%" outerRadius="70%" data={PERFORMANCE_RADAR}>
                             <PolarGrid stroke="#334155" />
                             <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                             <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                             <Radar name="Current" dataKey="Current" stroke="#64748b" strokeWidth={1} fill="transparent" />
                             <Radar name="Optimized" dataKey="Optimized" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                             <Legend wrapperStyle={{fontSize: '10px'}} />
                             <Tooltip contentStyle={{backgroundColor: '#0f0c1d', borderColor: '#10b981', color: '#fff'}} />
                         </RadarChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

             {/* Expert Chat */}
             <SciFiCard title="专家建议与协同" subtitle="CHAT" className="flex-1 border-slate-800">
                 <div className="flex flex-col h-full gap-3">
                     <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 max-h-[150px]">
                         <div className="flex gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">Dr.Z</div>
                             <div className="bg-slate-900/50 p-2 rounded border border-slate-700 text-xs text-slate-300">
                                 The gap at 12:00 is due to cooling requirements. We can optimize it with Strategy #2.
                             </div>
                         </div>
                         <div className="flex gap-3 flex-row-reverse">
                             <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">Me</div>
                             <div className="bg-indigo-900/20 p-2 rounded border border-indigo-500/30 text-xs text-indigo-200 text-right">
                                 Agreed. Let's simulate the parallel process option.
                             </div>
                         </div>
                     </div>
                     
                     <div className="mt-auto pt-2 border-t border-slate-800">
                         <div className="flex gap-2 mb-2">
                             <input className="flex-1 bg-black border border-slate-700 rounded px-2 py-1 text-xs text-white" placeholder="Type message..." />
                             <button className="bg-slate-800 p-1 rounded text-slate-300 hover:text-white"><ArrowRight size={14}/></button>
                         </div>
                         <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors shadow-lg">
                             <CheckCircle2 size={14} /> Approve & Deploy
                         </button>
                     </div>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
