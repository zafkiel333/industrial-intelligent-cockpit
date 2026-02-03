
import React, { useState, useEffect } from 'react';
import { MaintenanceOptScene } from '../../../components/predictive/hydro-maint-opt/ThreeScene';
import { MaintTaskNode } from '../../../components/predictive/hydro-maint-opt/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, ScatterChart, Scatter, Legend, ComposedChart, Line
} from 'recharts';
import { 
  Calendar, Zap, TrendingDown, Target, 
  ShieldCheck, Activity, Search, Layers,
  Clock, Users, Box, Hammer, Brain,
  ChevronRight, ArrowRight, AlertTriangle,
  FileText, Workflow, CheckCircle2
} from 'lucide-react';

// --- 模拟数据 ---

const MOCK_TASKS: MaintTaskNode[] = [
    { id: 'T1', name: '定子槽楔加固', part: 'stator', urgency: 0.8, duration: 48, status: 'optimized', position: [0, 4, 3] },
    { id: 'T2', name: '推力瓦油样分析', part: 'bearing', urgency: 0.9, duration: 8, status: 'standard', position: [3, 1, 0] },
    { id: 'T3', name: '转轮抗磨涂层修复', part: 'runner', urgency: 0.4, duration: 72, status: 'skipped', position: [0, -4, -3] },
    { id: 'T4', name: '励磁柜除尘校验', part: 'aux', urgency: 0.6, duration: 12, status: 'optimized', position: [-4, 2, 2] },
    { id: 'T5', name: '导叶间隙调整', part: 'runner', urgency: 0.7, duration: 24, status: 'standard', position: [0, -2, 4] },
];

const PLAN_COMPARISON = [
    { name: '传统模式', cost: 120, downtime: 300, risk: 45 },
    { name: 'AI优化模式', cost: 75, downtime: 180, risk: 12 },
];

const RESOURCE_LOAD = Array.from({length: 12}, (_, i) => ({
    time: `Day ${i+1}`,
    manpower: 20 + Math.sin(i * 0.5) * 10,
    tools: 15 + Math.cos(i * 0.5) * 5
}));

const OPTIMIZATION_PARETO = Array.from({length: 20}, (_, i) => ({
    x: 40 + Math.random() * 60, // Cost saving
    y: 30 + Math.random() * 50, // Risk reduction
    z: Math.random() * 100,
    type: i === 5 ? 'current' : 'option'
}));

export const MaintenancePlanOptimizationView: React.FC = () => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('T1');
  const [optLevel, setOptLevel] = useState(85);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedTask = MOCK_TASKS.find(t => t.id === selectedTaskId);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020408] text-emerald-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* 顶部：优化引擎 HUD */}
      <div className="flex justify-between items-end border-b border-emerald-900/40 pb-4 bg-gradient-to-r from-[#0c2e1a] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-3 bg-emerald-600/20 rounded-lg border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Brain size={28} className="text-emerald-400 animate-pulse" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-widest font-bold">
                    <Zap size={14} /> Predictive Maintenance Planning & Strategy
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    预测驱动 <span className="text-emerald-400 font-extrabold">检修计划优化评估</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">停机时间缩减</div>
                <div className="text-3xl font-mono font-bold text-emerald-400">-120 <span className="text-sm">Hours</span></div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">运维成本节约</div>
                <div className="text-3xl font-mono font-bold text-white">￥34.5 <span className="text-sm text-slate-500">W</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-emerald-400">优化引擎负载</div>
                <div className="flex items-center gap-2 text-xl font-bold text-white uppercase">
                    <ShieldCheck size={20} className="text-emerald-500" /> STABLE
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：计划对比与任务清单 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* 计划模式对比 */}
           <SciFiCard title="检修模式效能对比" subtitle="MODE COMPARISON" className="border-emerald-900/50 bg-[#082412]/80">
               <div className="h-[180px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={PLAN_COMPARISON} margin={{left: -20}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 10}} />
                           <YAxis hide />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#10b981'}} />
                           <Legend iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                           <Bar dataKey="downtime" name="停机时长" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
                           <Bar dataKey="cost" name="财务支出" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                           <Bar dataKey="risk" name="残余风险" fill="#ef4444" radius={[2, 2, 0, 0]} />
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* 动态任务清单 */}
           <SciFiCard title="智能优化任务推荐" subtitle="TASK QUEUE" className="flex-1 border-emerald-900/50">
               <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {MOCK_TASKS.map(task => (
                       <div 
                         key={task.id}
                         onClick={() => setSelectedTaskId(task.id)}
                         className={`p-3 rounded border transition-all cursor-pointer group relative overflow-hidden
                            ${selectedTaskId === task.id ? 'bg-emerald-950/40 border-emerald-500 shadow-lg' : 'bg-slate-900/30 border-slate-800 hover:border-emerald-500/30'}
                         `}
                       >
                           {selectedTaskId === task.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_cyan]"></div>}
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-xs font-bold text-slate-100 group-hover:text-emerald-300">{task.name}</span>
                               <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase 
                                  ${task.status === 'optimized' ? 'bg-emerald-900 text-emerald-400' : 
                                    task.status === 'skipped' ? 'bg-slate-800 text-slate-500 line-through' : 'bg-orange-900 text-orange-400'}`}>
                                   {task.status}
                               </span>
                           </div>
                           <div className="flex justify-between items-center text-[9px] text-slate-500">
                               <span className="flex items-center gap-1"><Clock size={10}/> {task.duration}h</span>
                               <span className="flex items-center gap-1"><Target size={10}/> Priority: {(task.urgency*10).toFixed(0)}</span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D 检修数字孪生视口 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#02040a] to-[#000502] border border-emerald-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(16,185,129,0.1)] group">
               
               {/* 视口 HUD 层 */}
               <div className="absolute top-6 left-6 z-10 space-y-4 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-emerald-500/30 px-4 py-3 rounded flex flex-col gap-2 shadow-2xl pointer-events-auto">
                       <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Workflow size={14} /> Maintenance Sequence Digital Twin
                       </div>
                       <div className="flex items-center gap-10">
                           <div>
                               <div className="text-[9px] text-slate-500">优化置信度</div>
                               <div className="text-xl font-mono font-bold text-white">{optLevel}%</div>
                           </div>
                           <div className="w-[1px] h-8 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">关键路径长度</div>
                               <div className="text-xl font-mono font-bold text-emerald-400">145 <span className="text-xs">hrs</span></div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* 右侧：任务详情浮窗 */}
               {selectedTask && (
                   <div className="absolute top-6 right-6 z-10 w-64 bg-black/80 backdrop-blur border border-emerald-500/30 p-4 rounded animate-in fade-in slide-in-from-right-4 pointer-events-auto">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-white">{selectedTask.name}</h3>
                            <button onClick={() => setSelectedTaskId(null)} className="text-slate-500 hover:text-white"><Zap size={14}/></button>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-emerald-900/20 p-2 rounded">
                                <div className="text-[9px] text-emerald-400 uppercase font-bold mb-1">优化收益分析</div>
                                <div className="text-xs text-slate-300">延迟检修风险：<span className="text-red-400">12.5%</span></div>
                                <div className="text-xs text-slate-300">提前检修损失：<span className="text-yellow-400">￥2,450</span></div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">工序前置任务</span>
                                <span className="text-white font-mono">T0-Basic</span>
                            </div>
                            <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded transition-all">调整此任务权重</button>
                        </div>
                   </div>
               )}

               <MaintenanceOptScene 
                   tasks={MOCK_TASKS}
                   optimizationFactor={optLevel/100}
                   selectedTaskId={selectedTaskId}
                   onTaskClick={setSelectedTaskId}
                   showLogicFlow={true}
               />

               {/* 底部 HUD：时间轴双轨对比 */}
               <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col gap-2 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur border border-slate-700 p-3 rounded">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-[9px] text-slate-500 uppercase">检修窗口预测 (Timeline Contrast)</div>
                            <div className="flex gap-4 text-[9px] text-slate-500">
                                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-600 rounded"></div> 传统计划</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded"></div> AI 建议</span>
                            </div>
                        </div>
                        {/* 模拟时间轴条 */}
                        <div className="space-y-1.5">
                            <div className="h-2 w-full bg-slate-900 rounded overflow-hidden flex relative">
                                <div className="absolute left-[10%] w-[50%] h-full bg-slate-600"></div>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded overflow-hidden flex relative">
                                <div className="absolute left-[15%] w-[30%] h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            </div>
                        </div>
                    </div>
               </div>
           </div>

           {/* 资源负载预测曲线 */}
           <SciFiCard title="检修资源负载预测" subtitle="RESOURCE ALLOCATION" className="h-[200px] border-emerald-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={RESOURCE_LOAD}>
                           <defs>
                               <linearGradient id="colMan" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 9}} />
                           <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                           <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#10b981'}} />
                           <Legend iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                           <Area type="monotone" dataKey="manpower" stroke="#10b981" fill="url(#colMan)" name="人力需求 (Person)" />
                           <Line type="step" dataKey="tools" stroke="#0ea5e9" strokeWidth={1} dot={false} name="专用工器具" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 右侧：优化策略与收益模型 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 overflow-y-auto pr-1">
           
           {/* 多目标帕累托分析 */}
           <SciFiCard title="计划最优平衡分析" subtitle="PARETO FRONTIER" className="h-[300px] border-emerald-900/50">
               <div className="h-full w-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{top: 10, right: 10, bottom: 10, left: -20}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                           <XAxis type="number" dataKey="x" stroke="#64748b" hide />
                           <YAxis type="number" dataKey="y" stroke="#64748b" hide />
                           <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#000', borderColor: '#10b981'}} />
                           <Scatter name="Options" data={OPTIMIZATION_PARETO}>
                               {OPTIMIZATION_PARETO.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.type === 'current' ? '#fff' : '#10b981'} fillOpacity={0.6} />
                               ))}
                           </Scatter>
                       </ScatterChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <div className="w-32 h-32 border border-emerald-500 rounded-full animate-ping"></div>
                   </div>
                   <div className="absolute bottom-2 left-2 text-[9px] text-slate-500 flex gap-4">
                       <span>X: 成本收益</span>
                       <span>Y: 风险对冲</span>
                   </div>
               </div>
           </SciFiCard>

           {/* 智能决策建议 */}
           <SciFiCard title="AI 辅助决策引擎" className="flex-1 border-emerald-900/50 bg-[#0a1a0f]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-emerald-950/40 border border-slate-500/30 rounded flex items-start gap-3 shadow-inner">
                       <Zap className="text-yellow-400 shrink-0 mt-1" size={18} />
                       <div>
                           <div className="text-xs font-bold text-white uppercase">计划优化率：85%</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                               基于未来 30 天负荷预测及部件劣化曲线，建议将 3号机组 检修计划推迟 45 小时，以利用电网低负荷电价窗口。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                           <Workflow size={12} /> Optimization Plan
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           {/* Fixed: added missing CheckCircle2 import */}
                           <CheckCircle2 size={14} className="text-emerald-500" /> 备件采购前置：500kV 绝缘套管
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           {/* Fixed: added missing CheckCircle2 import */}
                           <CheckCircle2 size={14} className="text-emerald-500" /> 班组调配：A组派往 2号导轴承
                       </div>
                       <div className="flex items-center gap-2 text-xs text-red-400 font-bold">
                           <AlertTriangle size={14} className="animate-pulse" /> 关键节点：Day 4 吊装作业
                       </div>
                   </div>

                   <button className="mt-auto w-full py-2.5 bg-emerald-700/30 hover:bg-emerald-700/50 border border-emerald-500/50 rounded text-xs text-emerald-100 font-bold transition-all flex items-center justify-center gap-2 group">
                       <FileText size={14} className="group-hover:translate-y-[-2px] transition-transform" /> 
                       下发优化后检修令
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
