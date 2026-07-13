import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { GanttThreeScene } from '../../components/maintenance_gantt/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[am-gantt-plan]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/am-gantt-plan';
import { GanttTaskNode } from '../../components/maintenance_gantt/three-types';
import { 
  Calendar, 
  GitCommit, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  FastForward, 
  Layers, 
  Users, 
  BarChart2, 
  Workflow, 
  Briefcase,
  TrendingUp,
  Milestone
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  ComposedChart,
  Line
} from 'recharts';

// --- MOCK DATA ---

const PROJECT_START = new Date('2024-04-01');

// Tasks mapped to 3D Nodes
const TASKS: GanttTaskNode[] = [
  { id: 'T-01', name: '停机与安全隔离', startTime: 0, duration: 5, lane: 0, status: 'completed', critical: true, dependencies: [] },
  { id: 'T-02', name: '涡轮室排水', startTime: 5, duration: 8, lane: 1, status: 'completed', critical: true, dependencies: ['T-01'] },
  { id: 'T-03', name: '发电机转子吊出', startTime: 13, duration: 10, lane: 2, status: 'in-progress', critical: true, dependencies: ['T-02'] },
  { id: 'T-04', name: '定子绝缘检测', startTime: 15, duration: 15, lane: 3, status: 'in-progress', critical: false, dependencies: ['T-02'] },
  { id: 'T-05', name: '导叶机构拆解', startTime: 23, duration: 12, lane: 1, status: 'pending', critical: true, dependencies: ['T-03'] },
  { id: 'T-06', name: '主轴密封更换', startTime: 25, duration: 5, lane: 0, status: 'pending', critical: false, dependencies: ['T-03'] },
  { id: 'T-07', name: '转轮气蚀修复', startTime: 35, duration: 20, lane: 1, status: 'pending', critical: true, dependencies: ['T-05'] },
  { id: 'T-08', name: '电气回路调试', startTime: 30, duration: 15, lane: 4, status: 'pending', critical: false, dependencies: ['T-04'] },
  { id: 'T-09', name: '机组回装', startTime: 55, duration: 15, lane: 2, status: 'pending', critical: true, dependencies: ['T-07', 'T-06', 'T-08'] },
  { id: 'T-10', name: '充水试验', startTime: 70, duration: 5, lane: 1, status: 'pending', critical: true, dependencies: ['T-09'] },
  { id: 'T-11', name: '72h 试运行', startTime: 75, duration: 10, lane: 0, status: 'pending', critical: true, dependencies: ['T-10'] },
];

const RESOURCE_LOAD = Array.from({length: 20}, (_, i) => ({
  day: `D${i*2}`,
  mechanical: Math.floor(Math.random() * 40) + 20,
  electrical: Math.floor(Math.random() * 30) + 10,
  limit: 60
}));

const CRITICAL_PATH_RISK = [
  { stage: '拆卸', risk: 85, delay: 2 },
  { stage: '检测', risk: 40, delay: 0 },
  { stage: '修复', risk: 65, delay: 1 },
  { stage: '回装', risk: 30, delay: 0 },
  { stage: '调试', risk: 50, delay: 0 },
];

export const GanttPlanView: React.FC = () => {
  const [currentDay, setCurrentDay] = useState(18); // Simulation starts at day 18
  const [selectedTaskId, setSelectedTaskId] = useState<string>('T-03');
  const [isPlaying, setIsPlaying] = useState(false);

  const selectedTask = TASKS.find(t => t.id === selectedTaskId);

  // Time simulation
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentDay(prev => (prev + 0.5) % 100);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700">
      
      {/* 顶部：战略指挥台抬头 */}
      <div className="flex items-center justify-between border-b border-indigo-500/30 pb-4 bg-gradient-to-r from-[#0f0a28] to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.4)] border border-indigo-400/50">
              <Calendar size={30} className="text-white" />
           </div>
           <div>
              <div className="flex items-center gap-2 text-indigo-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Strategic Overhaul Command
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                 年度大修 <span className="text-indigo-500 italic">时空战略图谱</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/80 px-8 py-3 rounded border border-slate-800">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">总工期进度</div>
              <div className="text-xl font-mono font-bold text-white flex items-center gap-2">
                 <span className="text-cyan-400">Day {Math.floor(currentDay)}</span> / 85
              </div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">关键路径延误</div>
              <div className="text-xl font-mono font-bold text-red-500 flex items-center gap-2">
                 <AlertTriangle size={16} /> +24h
              </div>
           </div>
           
           <button 
             onClick={() => setIsPlaying(!isPlaying)}
             className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all
               ${isPlaying ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white'}
             `}
           >
              {isPlaying ? <FastForward size={18} /> : <Play size={18} />}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：任务序列 (Gantt List) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="执行任务序列 (Task Sequence)" subtitle="GANTT_LIST" highlight className="flex-1 border-indigo-900/30">
              <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar pt-2">
                 {TASKS.map(task => {
                    // Calculate progress based on currentDay
                    let progress = 0;
                    if (currentDay > task.startTime + task.duration) progress = 100;
                    else if (currentDay < task.startTime) progress = 0;
                    else progress = ((currentDay - task.startTime) / task.duration) * 100;

                    return (
                      <div 
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`p-3 rounded border transition-all cursor-pointer relative overflow-hidden group
                           ${selectedTaskId === task.id 
                              ? 'bg-indigo-950/40 border-indigo-500 shadow-lg' 
                              : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                        `}
                      >
                         <div className="flex justify-between items-center mb-2 relative z-10">
                            <span className={`text-[10px] font-mono px-1.5 rounded ${task.critical ? 'bg-amber-900/40 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-500'}`}>
                               {task.id}
                            </span>
                            <span className="text-[10px] text-slate-400">D{task.startTime} - D{task.startTime + task.duration}</span>
                         </div>
                         <div className="text-sm font-bold text-white relative z-10 mb-2">{task.name}</div>
                         
                         {/* Progress Bar Background */}
                         <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative z-10">
                            <div 
                               className={`h-full transition-all duration-300 ${task.critical ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                               style={{width: `${progress}%`}}
                            ></div>
                         </div>

                         {/* Status Indicator */}
                         <div className="flex justify-between items-center mt-2 text-[9px] text-slate-500 relative z-10">
                            <span className="uppercase">{task.status}</span>
                            <span>{progress.toFixed(0)}%</span>
                         </div>
                      </div>
                    );
                 })}
              </div>
           </SciFiCard>
        </div>

        {/* 中间：3D 时空隧道 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           
           <div className="flex-1 relative bg-[#050510] border border-indigo-900/30 rounded-lg overflow-hidden group">
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs">
                          <Workflow size={14} className="animate-pulse" />
                          DEPENDENCY NETWORK
                       </div>
                       <div className="text-2xl font-bold text-white uppercase tracking-tight">
                          Time-Tunnel <span className="text-indigo-500">Visualization</span>
                       </div>
                    </div>
                    
                    <div className="bg-black/60 border border-indigo-500/30 p-3 rounded backdrop-blur">
                       <div className="text-[10px] text-slate-500 uppercase mb-1">Selected Task</div>
                       <div className="text-lg font-bold text-white">{selectedTask?.name}</div>
                       <div className="text-xs text-indigo-400 font-mono mt-1">Duration: {selectedTask?.duration} Days</div>
                    </div>
                 </div>

                 {/* Legend */}
                 <div className="flex gap-4 pointer-events-auto">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                       <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_5px_orange]"></div> Critical Path
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                       <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Standard
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                       <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Completed
                    </div>
                 </div>
              </div>

              {/* 3D Scene */}
              <div className="absolute inset-0">
                 <GanttThreeScene 
                    tasks={TASKS}
                    progress={currentDay}
                    onTaskSelect={setSelectedTaskId}
                 />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
              </div>
              
              {/* Decorative Vignette */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_50%,#050510_100%)]"></div>
           </div>

           {/* Milestone Tracker */}
           <div className="h-32 bg-slate-900/60 border border-slate-800 rounded p-4 flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'linear-gradient(90deg, transparent 50%, #333 50%)', backgroundSize: '4px 100%'}}></div>
              
              {[
                { label: 'Project Kickoff', date: 'Day 0', status: 'done' },
                { label: 'Disassembly Complete', date: 'Day 25', status: 'active' },
                { label: 'Major Replacement', date: 'Day 50', status: 'future' },
                { label: 'Startup', date: 'Day 80', status: 'future' },
              ].map((m, i) => (
                 <div key={i} className="flex flex-col items-center gap-2 z-10 relative">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                       ${m.status === 'done' ? 'bg-green-500 border-green-400 text-black' : 
                         m.status === 'active' ? 'bg-indigo-600 border-indigo-400 text-white animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-500'}
                    `}>
                       <Milestone size={14} />
                    </div>
                    <div className="text-center">
                       <div className={`text-xs font-bold ${m.status === 'future' ? 'text-slate-500' : 'text-slate-200'}`}>{m.label}</div>
                       <div className="text-[10px] text-slate-600 font-mono">{m.date}</div>
                    </div>
                    {i < 3 && <div className="absolute top-4 left-[100%] w-full h-[2px] bg-slate-700 -z-10" style={{width: '200%'}}></div>}
                 </div>
              ))}
           </div>

        </div>

        {/* 右侧：资源负载与风险 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           {/* Resource Histogram */}
           <SciFiCard title="资源负载热力 (Resource Load)" subtitle="MANPOWER" className="flex-1 border-indigo-900/30">
              <div className="h-full flex flex-col">
                 <div className="flex gap-4 mb-2 justify-center">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400"><div className="w-2 h-2 bg-indigo-500"></div> Mech</div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400"><div className="w-2 h-2 bg-purple-500"></div> Elec</div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400"><div className="w-full h-[1px] border-t border-dashed border-red-500 w-4"></div> Limit</div>
                 </div>
                 
                 <div className="flex-1 min-h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={RESOURCE_LOAD} stackOffset="sign">
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} interval={3} />
                          <YAxis hide />
                          <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                          <Bar dataKey="mechanical" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="electrical" stackId="a" fill="#a855f7" radius={[2, 2, 0, 0]} />
                          <Line type="monotone" dataKey="limit" stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                       </ComposedChart>
                    </ResponsiveContainer>
                 </div>
                 
                 <div className="mt-2 p-2 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-400 text-center">
                    <span className="text-red-400 font-bold">Alert:</span> Day 12-16 机械组负载超限 15%
                 </div>
              </div>
           </SciFiCard>

           {/* Critical Path Risk Analysis */}
           <SciFiCard title="关键路径风险评估" subtitle="RISK_MATRIX" className="h-64 border-slate-800">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CRITICAL_PATH_RISK} layout="vertical" margin={{left: 0}}>
                       <XAxis type="number" hide />
                       <YAxis dataKey="stage" type="category" stroke="#94a3b8" fontSize={10} width={30} tickLine={false} axisLine={false} />
                       <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                       <Bar dataKey="risk" barSize={10} radius={[0, 4, 4, 0]}>
                          {CRITICAL_PATH_RISK.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.risk > 70 ? '#ef4444' : entry.risk > 40 ? '#f59e0b' : '#10b981'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
                 <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-2">
                    <span>Low Risk</span>
                    <span>High Risk</span>
                 </div>
              </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};