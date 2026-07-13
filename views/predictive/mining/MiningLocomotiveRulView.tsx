import React, { useState, useMemo, useEffect } from 'react';
import { LocomotiveRulScene } from '../../../components/predictive/mining-locomotive-rul/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-mining-19]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-mining-19';
import { RulComponent } from '../../../components/predictive/mining-locomotive-rul/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  ComposedChart, Line, Bar, Cell, Legend
} from 'recharts';
import { 
  History, Calendar, AlertTriangle, TrendingDown, 
  Layers, ChevronRight, Clock, Shield, Hammer,
  FileText, Workflow, BrainCircuit, Maximize2, Minimize2, CheckCircle2
} from 'lucide-react';

// --- Mock Data ---

const INITIAL_COMPONENTS: RulComponent[] = [
    { id: 'body', name: '车体结构 (Body)', category: 'body', currentHealth: 92, predictedRul: 3600, degradationRate: 0.2, position: [0, 2, 0], scale: [8, 3, 2.5] },
    { id: 'tm-1', name: '牵引电机 #1', category: 'motor', currentHealth: 78, predictedRul: 450, degradationRate: 2.5, position: [-2.5, 0.5, 0], scale: [1, 1, 1] },
    { id: 'tm-2', name: '牵引电机 #2', category: 'motor', currentHealth: 82, predictedRul: 620, degradationRate: 2.1, position: [2.5, 0.5, 0], scale: [1, 1, 1] },
    { id: 'ws-1', name: '轮对 #1 (Wheelset)', category: 'wheel', currentHealth: 65, predictedRul: 180, degradationRate: 4.2, position: [-2.5, 0, 0], scale: [1, 2.5, 1] },
    { id: 'ws-2', name: '轮对 #2 (Wheelset)', category: 'wheel', currentHealth: 70, predictedRul: 240, degradationRate: 3.8, position: [2.5, 0, 0], scale: [1, 2.5, 1] },
    { id: 'panto', name: '受电弓 (Pantograph)', category: 'pantograph', currentHealth: 55, predictedRul: 90, degradationRate: 6.5, position: [-2, 4, 0], scale: [1, 1, 1] },
];

const MAINTENANCE_SCHEDULE = [
    { task: '更换受电弓碳滑板', due: 'T+45 Days', urgency: 'High', type: 'Corrective' },
    { task: '轮对 #1 镟修', due: 'T+90 Days', urgency: 'Medium', type: 'Preventive' },
    { task: '电机轴承润滑', due: 'T+120 Days', urgency: 'Low', type: 'Routine' },
];

// Weibull Probability Density Function (PDF) Simulation
const WEIBULL_DIST = Array.from({length: 50}, (_, i) => {
    const t = i * 20; // Days
    // Shape k=2.5, Scale lambda=600
    const k = 2.5;
    const lambda = 600;
    const pdf = (k/lambda) * Math.pow(t/lambda, k-1) * Math.exp(-Math.pow(t/lambda, k));
    return { time: t, prob: pdf * 1000 }; // Scaled for display
});

export const MiningLocomotiveRulView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('panto');
  const [explode, setExplode] = useState(0);
  const [previewMonth, setPreviewMonth] = useState(0); // 0 = Now, 12 = 1 Year later
  const [isSimulating, setIsSimulating] = useState(false);

  // Derived Data
  const activeComp = INITIAL_COMPONENTS.find(c => c.id === selectedId) || INITIAL_COMPONENTS[0];
  
  // Dynamic RUL Curve for selected component
  const rulTrend = useMemo(() => {
      return Array.from({length: 13}, (_, i) => {
          const month = i;
          const health = Math.max(0, activeComp.currentHealth - activeComp.degradationRate * month);
          // Confidence interval widens over time
          const uncertainty = i * 2; 
          return {
              month: `+${month}M`,
              health,
              upper: Math.min(100, health + uncertainty),
              lower: Math.max(0, health - uncertainty),
              limit: 40 // Failure threshold
          };
      });
  }, [activeComp]);

  // Simulation Loop
  useEffect(() => {
    let interval: any;
    if (isSimulating) {
        interval = setInterval(() => {
            setPreviewMonth(prev => {
                if (prev >= 12) {
                    setIsSimulating(false);
                    return 12;
                }
                return prev + 0.2;
            });
        }, 50);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#030005] text-slate-200 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-violet-900/40 pb-4 bg-gradient-to-r from-[#10031c] to-transparent px-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-violet-400 mb-1 uppercase tracking-wider">
             <Clock size={14} className="animate-pulse" />
             Lifecycle Prognostics
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             电机车关键部件 <span className="text-violet-500 font-extrabold">剩余寿命预测 (RUL)</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">预测最短寿命部件</div>
                <div className="text-2xl font-mono font-bold text-red-400 flex items-center gap-2">
                    {INITIAL_COMPONENTS.reduce((prev, curr) => prev.predictedRul < curr.predictedRul ? prev : curr).name.split(' ')[0]}
                </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">全车平均健康度</div>
                <div className="text-3xl font-mono font-bold text-white">82.4%</div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase">AI 置信度</div>
                <div className="text-2xl font-bold text-green-400">94.5%</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Component Health Matrix */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           <SciFiCard title="部件寿命矩阵 (Life Matrix)" subtitle="STATUS" className="flex-1 border-violet-900/50 bg-[#06030a]/80">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {INITIAL_COMPONENTS.map(comp => (
                       <div 
                         key={comp.id}
                         onClick={() => setSelectedId(comp.id)}
                         className={`p-3 rounded border cursor-pointer transition-all flex flex-col gap-2 relative overflow-hidden group
                            ${selectedId === comp.id ? 'bg-violet-950/50 border-violet-500 shadow-lg' : 'bg-slate-900/40 border-slate-800 hover:border-violet-500/30'}
                         `}
                       >
                           {selectedId === comp.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500"></div>}
                           <div className="flex justify-between items-center z-10">
                               <span className="text-sm font-bold text-slate-200">{comp.name}</span>
                               <span className={`text-xs font-mono font-bold ${comp.currentHealth > 70 ? 'text-green-400' : comp.currentHealth > 50 ? 'text-yellow-400' : 'text-red-500'}`}>
                                   {comp.currentHealth}%
                               </span>
                           </div>
                           
                           {/* Life Bar */}
                           <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden z-10 flex">
                               <div className="bg-slate-600 h-full" style={{width: `${100 - comp.currentHealth}%`}}></div> {/* Consumed */}
                               <div className="bg-green-500 h-full" style={{width: `${comp.currentHealth}%`}}></div> {/* Remaining */}
                           </div>
                           
                           <div className="flex justify-between text-[10px] text-slate-500 z-10">
                               <span>RUL: {comp.predictedRul} days</span>
                               <span className="text-violet-400">Rate: -{comp.degradationRate}%/mo</span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Maintenance Schedule */}
           <SciFiCard title="智能维护排程" className="h-[250px] border-violet-900/50">
               <div className="flex flex-col gap-3">
                   {MAINTENANCE_SCHEDULE.map((item, i) => (
                       <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800">
                           <div className="flex items-center gap-3">
                               <div className={`w-2 h-2 rounded-full ${item.urgency === 'High' ? 'bg-red-500 animate-pulse' : item.urgency === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                               <div>
                                   <div className="text-xs font-bold text-slate-200">{item.task}</div>
                                   <div className="text-[10px] text-slate-500">{item.type}</div>
                               </div>
                           </div>
                           <div className="text-right">
                               <div className="text-xs font-mono text-white">{item.due}</div>
                           </div>
                       </div>
                   ))}
                   <button className="mt-2 w-full py-2 bg-violet-700/20 hover:bg-violet-700/40 text-violet-300 text-xs rounded border border-violet-500/30 flex items-center justify-center gap-2">
                       <FileText size={12} /> 导出维护计划表
                   </button>
               </div>
           </SciFiCard>
        </div>

        {/* CENTER: Digital Twin & Time Travel */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[450px] bg-[#050208] border border-violet-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(139,92,246,0.15)] group">
               
               {/* Time Travel HUD */}
               <div className="absolute top-6 left-6 z-10 w-72 pointer-events-auto">
                   <div className="bg-black/70 backdrop-blur border border-violet-500/30 p-4 rounded-lg shadow-xl">
                       <div className="flex justify-between items-center mb-4">
                           <div className="text-xs font-bold text-violet-300 uppercase flex items-center gap-2">
                               <History size={14} /> Future State Simulation
                           </div>
                           <div className="text-xl font-mono font-bold text-white">
                               T + {previewMonth.toFixed(1)} <span className="text-xs text-slate-500">Months</span>
                           </div>
                       </div>
                       
                       <input 
                         type="range" min="0" max="12" step="0.1" 
                         value={previewMonth} 
                         onChange={(e) => setPreviewMonth(parseFloat(e.target.value))}
                         className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500 mb-2"
                       />
                       <div className="flex justify-between text-[9px] text-slate-500">
                           <span>Current</span>
                           <span>6 Months</span>
                           <span>1 Year</span>
                       </div>

                       <div className="flex gap-2 mt-4">
                           <button 
                             onClick={() => setIsSimulating(!isSimulating)}
                             className={`flex-1 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors
                                ${isSimulating ? 'bg-red-900/50 text-red-200 border border-red-500' : 'bg-violet-600 text-white hover:bg-violet-500'}
                             `}
                           >
                               {isSimulating ? 'STOP SIMULATION' : 'PLAY PREDICTION'}
                           </button>
                           <button 
                             onClick={() => setPreviewMonth(0)}
                             className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600"
                           >
                               RESET
                           </button>
                       </div>
                   </div>
               </div>

               {/* Right Controls */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 pointer-events-auto">
                   <div className="bg-black/60 p-2 rounded border border-slate-700 flex flex-col gap-2">
                       <div className="text-[9px] text-slate-500 uppercase text-center mb-1">Explode View</div>
                       <input 
                         type="range" min="0" max="1" step="0.01" 
                         value={explode} 
                         onChange={(e) => setExplode(parseFloat(e.target.value))}
                         className="h-24 w-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 writing-mode-vertical"
                         style={{writingMode: 'vertical-lr'}}
                       />
                   </div>
               </div>

               {/* Component Info Overlay */}
               <div className="absolute bottom-6 right-6 z-10 text-right pointer-events-none">
                   <div className="bg-black/60 backdrop-blur px-4 py-2 rounded border border-violet-500/20">
                       <div className="text-[10px] text-slate-400 uppercase mb-1">Active Component</div>
                       <div className="text-xl font-bold text-white">{activeComp.name}</div>
                       <div className="text-[10px] text-violet-400 font-mono mt-1">Health @ T+{previewMonth.toFixed(1)}M: {Math.max(0, activeComp.currentHealth - activeComp.degradationRate * previewMonth).toFixed(1)}%</div>
                   </div>
               </div>

               <LocomotiveRulScene 
                   components={INITIAL_COMPONENTS}
                   activeComponentId={selectedId}
                   onSelect={setSelectedId}
                   explodeFactor={explode}
                   previewTimeMonth={previewMonth}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Health Evolution Chart */}
           <SciFiCard title="健康度演化趋势预测 (Health Evolution)" subtitle="WITH CONFIDENCE INTERVAL" className="h-[250px] border-violet-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={rulTrend}>
                           <defs>
                               <linearGradient id="rulFill" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e1b2e" vertical={false} />
                           <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                           <Tooltip contentStyle={{backgroundColor: '#05020a', borderColor: '#8b5cf6'}} />
                           <Legend wrapperStyle={{fontSize:'10px'}}/>
                           
                           {/* Confidence Interval Area */}
                           <Area type="monotone" dataKey="range" stroke="none" fill="#334155" fillOpacity={0.2} />
                           
                           <Area type="monotone" dataKey="health" stroke="#8b5cf6" strokeWidth={2} fill="url(#rulFill)" name="预测健康度" />
                           <Line type="step" dataKey="limit" stroke="#ef4444" strokeDasharray="5 5" dot={false} name="失效阈值" />
                           
                           {/* Current Time Marker */}
                           <ReferenceLine x="+0M" stroke="#fff" label={{value:'Now', fill:'#fff', fontSize:10}} />
                           <ReferenceLine x={`+${Math.floor(previewMonth)}M`} stroke="#facc15" strokeDasharray="3 3" />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Probability & Logic */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Failure Probability (Weibull) */}
           <SciFiCard title="失效概率密度 (Weibull PDF)" subtitle="FAILURE RISK" className="h-[300px] border-violet-900/50">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={WEIBULL_DIST}>
                           <defs>
                               <linearGradient id="riskColor" x1="0" y1="0" x2="1" y2="0">
                                   <stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/>
                                   <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.4}/>
                                   <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e1b2e" />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} label={{value:'Days', position:'insideBottom', offset:-5, fontSize:10}} />
                           <YAxis hide />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#8b5cf6'}} />
                           <Area type="monotone" dataKey="prob" stroke="none" fill="url(#riskColor)" />
                           <ReferenceLine x={activeComp.predictedRul} stroke="#fff" label={{value:'Est. Fail', fill:'#fff', fontSize:10}} />
                       </AreaChart>
                   </ResponsiveContainer>
                   <div className="text-[10px] text-center text-slate-500 mt-2">
                       当前组件处于 <span className="text-yellow-400 font-bold">偶然失效期 (Random Failure)</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Maintenance Optimization */}
           <SciFiCard title="维护策略优化" className="flex-1 border-violet-900/50">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-slate-900/50 rounded border border-slate-800">
                       <div className="text-xs text-slate-400 mb-2 font-bold uppercase">Optimal Replacement Window</div>
                       <div className="flex justify-between items-center">
                           <div className="text-xl font-mono text-green-400">Oct 15 - Oct 20</div>
                           <div className="text-[10px] bg-green-900/30 text-green-300 px-2 py-0.5 rounded">Cost Minimized</div>
                       </div>
                   </div>

                   <div className="space-y-2">
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Spare Part Status</span>
                           <span className="text-white flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500"/> Available</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Labor Availability</span>
                           <span className="text-white">High</span>
                       </div>
                   </div>

                   <button className="mt-auto w-full py-3 bg-violet-700/30 hover:bg-violet-700/50 border border-violet-500/50 rounded-lg text-xs text-violet-100 font-bold transition-all flex items-center justify-center gap-2">
                       <Workflow size={14} /> 生成备件预定单
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};