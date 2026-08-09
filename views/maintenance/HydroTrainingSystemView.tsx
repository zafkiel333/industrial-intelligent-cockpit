
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/hydro-training/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-34]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-34';
import { TrainingModule } from '../../components/maintenance/hydro-training/three-types';
// Added Clock, TrendingUp, ArrowRight, Gauge to imports from lucide-react to fix "Cannot find name" errors
import { 
  GraduationCap, Book, Target, Award, 
  Wrench, ShieldCheck, Activity, Cpu, 
  Zap, Play, RotateCcw, Info, 
  CheckCircle2, AlertTriangle, Hammer, Ruler,
  Timer, Users, BarChart3, Search, ChevronRight,
  Monitor, BrainCircuit, Terminal,
  Clock, TrendingUp, ArrowRight, Gauge
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell
} from 'recharts';

// --- MOCK DATA ---
const CURRICULUM = [
  { id: 'COMPONENT_ID', label: '1. 结构与原理识图', duration: '20 min', difficulty: '入门' },
  { id: 'GAP_MEASURE', label: '2. 导叶间隙精密测量', duration: '45 min', difficulty: '进阶' },
  { id: 'BOLT_TORQUE', label: '3. 液压拉伸与螺栓紧固', duration: '30 min', difficulty: '核心' },
  { id: 'ROTOR_LIFT', label: '4. 大型转子吊装指挥', duration: '60 min', difficulty: '专家' },
  { id: 'FAULT_FINDING', label: '5. 振动超标应急排查', duration: '40 min', difficulty: '应急' },
];

const SKILL_RADAR = [
  { subject: '机械识图', A: 95, fullMark: 100 },
  { subject: '工具操作', A: 82, fullMark: 100 },
  { subject: '安全规程', A: 100, fullMark: 100 },
  { subject: '逻辑判断', A: 75, fullMark: 100 },
  { subject: '应急响应', A: 68, fullMark: 100 },
  { subject: '工艺标准', A: 90, fullMark: 100 },
];

const PERFORMANCE_HISTORY = Array.from({length: 10}, (_, i) => ({
    session: i + 1,
    score: 75 + Math.random() * 20,
    time: 50 - i * 2
}));

export const HydroTrainingSystemView: React.FC = () => {
  const [activeModule, setActiveModule] = useState<TrainingModule>('COMPONENT_ID');
  const [logs, setLogs] = useState<string[]>(['[System] 模拟器准备就绪，学员：王晓强 [工号: 20240901]', '[Info] 当前课程：水轮发电机组结构认识']);
  const [progress, setProgress] = useState(32); // Overall curriculum progress

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 8)]);
  };

  const handleModuleChange = (id: TrainingModule) => {
      setActiveModule(id);
      addLog(`>>> 切换训练模块: ${id}`);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 relative overflow-hidden">
      
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,_#3b82f6_0%,_transparent_60%)]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-blue-900/30 p-4 rounded-lg backdrop-blur-md z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-600/20 border-2 border-blue-500 rounded flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
             <BrainCircuit size={32} className="text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-blue-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               <BrainCircuit size={12} /> Digital Workforce Enablement
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               水电设备检修 <span className="text-blue-500 italic">人员培训模拟系统</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Curriculum Progress</div>
                <div className="flex items-center gap-3">
                   <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" style={{width: `${progress}%`}}></div>
                   </div>
                   <span className="text-2xl font-mono font-black text-white">{progress}%</span>
                </div>
            </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Trainee Grade</div>
                <div className="text-3xl font-mono font-black text-green-400">CLASS-B+</div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Curriculum & Modules --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="训练课程大纲" subtitle="SYLLABUS" className="border-blue-900/30 bg-[#0c0e14]/90">
              <div className="flex flex-col gap-2 mt-2">
                 {CURRICULUM.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleModuleChange(item.id as TrainingModule)}
                      className={`p-3 rounded border cursor-pointer transition-all group relative overflow-hidden
                        ${activeModule === item.id 
                            ? 'bg-blue-900/30 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                            : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-600'}
                      `}
                    >
                        {activeModule === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                        <div className="flex justify-between items-center mb-1">
                           <span className={`text-sm font-bold ${activeModule === item.id ? 'text-white' : 'text-slate-400'}`}>
                             {item.label}
                           </span>
                           <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase
                              ${item.difficulty === '专家' ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-500'}
                           `}>{item.difficulty}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] opacity-60">
                           <div className="flex items-center gap-1"><Clock size={10}/> {item.duration}</div>
                           {activeModule === item.id && <ChevronRight size={14} className="text-blue-500 animate-pulse" />}
                        </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="考试历史趋势" subtitle="PERFORMANCE" className="flex-1 border-slate-800">
                <div className="w-full h-full p-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={PERFORMANCE_HISTORY}>
                            <defs>
                                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="session" hide />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: '1px solid #334155'}} />
                            <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="url(#scoreGrad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-2 p-2 bg-blue-900/10 border border-blue-900/30 rounded flex items-center gap-2">
                    <TrendingUp size={14} className="text-blue-400" />
                    <span className="text-[10px] text-blue-300">近3次考核平均分提升 12.5%</span>
                </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Training Simulator --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] group">
               {/* 3D Scene */}
               <ThreeScene module={activeModule} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Interaction HUD Overlay */}
               <div className="absolute top-6 left-6 pointer-events-none z-20">
                   <div className="bg-slate-950/80 backdrop-blur border-l-4 border-blue-500 p-5 rounded-sm shadow-xl flex flex-col gap-1">
                       <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Active Training Unit</div>
                       <div className="text-3xl font-black text-white italic tracking-tighter">
                           {activeModule.replace('_', ' ')}
                       </div>
                       <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400"><Monitor size={12}/> VIRTUAL MODE</div>
                          <div className="flex items-center gap-1 text-[10px] text-green-400"><ShieldCheck size={12}/> SAFETY ENABLED</div>
                       </div>
                   </div>
               </div>

               {/* Real-time Telemetry HUD (Right) */}
               <div className="absolute top-6 right-6 z-20 flex flex-col gap-3 pointer-events-none">
                   <div className="bg-black/60 backdrop-blur border border-blue-500/30 p-3 rounded flex flex-col items-end">
                       <div className="text-[10px] text-blue-400 font-bold mb-1 uppercase">Interaction Accuracy</div>
                       <div className="text-2xl font-mono font-bold text-white">99.2%</div>
                   </div>
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-3 rounded flex flex-col items-end">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase">Time Elapsed</div>
                       <div className="text-2xl font-mono font-bold text-white flex items-center gap-2">
                           <Timer size={18} className="text-cyan-500" /> 14:22
                       </div>
                   </div>
               </div>

               {/* Instruction Prompt (Floating Bottom) */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-[600px] bg-slate-900/90 border border-slate-700 p-4 rounded-lg shadow-2xl backdrop-blur-xl flex items-center gap-6">
                   <div className="w-12 h-12 rounded bg-blue-600/20 border border-blue-500 flex items-center justify-center shrink-0">
                       <Info size={24} className="text-blue-400" />
                   </div>
                   <div className="flex-1">
                       <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">AI Instructor Guidance</div>
                       <p className="text-sm text-white font-medium leading-relaxed">
                           当前操作点已高亮：请移动至机组上部导轴承处，使用【百分表】测量主轴径向跳动。注意读数时需避开传感器支架。
                       </p>
                   </div>
                   <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/40">
                       确认执行 <ArrowRight size={18} />
                   </button>
               </div>
           </div>

           {/* Simulation Activity Console */}
           <div className="h-40 bg-[#020205] border border-slate-800/60 rounded-lg p-3 font-mono text-[11px] overflow-hidden flex flex-col shadow-inner">
               <div className="text-slate-600 border-b border-slate-800 pb-1.5 mb-1.5 flex justify-between items-center uppercase font-black tracking-widest">
                   <div className="flex items-center gap-2"><Terminal size={14} /> Training_Simulation_Log_V4.0</div>
                   <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div> RECORDING</div>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                   {logs.map((log, i) => (
                       <div key={i} className={`flex gap-3 leading-relaxed transition-all duration-300 ${log.includes('!!') ? 'text-red-400 font-bold bg-red-900/10' : 'text-slate-400 hover:text-blue-300'}`}>
                           <span className="text-slate-700">[{logs.length - i}]</span>
                           <span>{log}</span>
                       </div>
                   ))}
               </div>
           </div>
        </div>

        {/* --- RIGHT: Skills & Tool Belt --- */}
        <div className="w-[340px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="学员技能指纹" subtitle="SKILL CHART" className="h-[320px] border-blue-900/30 bg-[#0c0e14]/90">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SKILL_RADAR}>
                           <PolarGrid stroke="#1e293b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Student" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.4} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="虚拟工具带" subtitle="INVENTORY" className="flex-1 border-slate-800">
               <div className="grid grid-cols-2 gap-3 py-1">
                   {[
                       { name: '百分表 (Bore Gauge)', icon: <Gauge size={18}/>, status: 'In Use' },
                       { name: '数显力矩扳手', icon: <Wrench size={18}/>, status: 'Ready' },
                       { name: '激光测距仪', icon: <Target size={18}/>, status: 'Ready' },
                       { name: '内窥镜探头', icon: <Search size={18}/>, status: 'Ready' },
                       { name: '液压拉伸器控制单元', icon: <Activity size={18}/>, status: 'Ready' },
                       { name: '标准校准块', icon: <Grip size={18}/>, status: 'Ready' },
                   ].map((tool, i) => (
                       <div key={i} className={`p-2.5 rounded border flex flex-col gap-2 transition-all cursor-pointer group
                          ${tool.status === 'In Use' ? 'bg-blue-950/40 border-blue-500' : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'}
                       `}>
                           <div className="flex justify-between items-center">
                               <div className={`${tool.status === 'In Use' ? 'text-blue-400' : 'text-slate-500'} group-hover:text-blue-300`}>
                                   {tool.icon}
                               </div>
                               <span className={`text-[8px] font-black uppercase ${tool.status === 'In Use' ? 'text-blue-400' : 'text-slate-600'}`}>{tool.status}</span>
                           </div>
                           <div className="text-[10px] font-bold text-slate-300 leading-tight truncate">{tool.name}</div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <div className="space-y-3">
              <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded text-sm flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-900/30">
                  <Award size={20} /> 完成本次评估并提交记录
              </button>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded flex items-center gap-3 opacity-60">
                 <Monitor size={18} className="text-slate-500" />
                 <div className="text-[10px] text-slate-500">
                    课程记录将自动同步至【集团人力资源中心-技能档案】。
                 </div>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};

// Helper components missing from Lucide but needed for detail
const Grip = (props: any) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
);
