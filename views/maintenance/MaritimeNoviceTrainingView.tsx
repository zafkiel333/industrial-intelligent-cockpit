
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/maritime-novice/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-35]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-35';
import { TrainingPhase } from '../../components/maintenance/maritime-novice/three-types';
import { 
  GraduationCap, BookOpen, Wrench, 
  ShieldCheck, AlertTriangle, Activity, Zap, 
  Clock, Play, RotateCcw, Info, 
  CheckCircle2, ArrowRight, Gauge, 
  Target, Award, Terminal, HardDrive,
  // Added Thermometer, TrendingUp, and Monitor to fix missing icon errors
  Thermometer, TrendingUp, Monitor
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

// --- MOCK DATA ---
const SYLLABUS = [
  { id: 'SAFETY_CHECK', label: '1. 安全闭锁确认 (LOTO)', difficulty: '★', status: 'Current' },
  { id: 'TOOL_SELECT', label: '2. 维修工器具识别与选用', difficulty: '★', status: 'Next' },
  { id: 'DISASSEMBLY', label: '3. 泵体上盖板标准拆卸', difficulty: '★★', status: 'Locked' },
  { id: 'PART_IDENTIFY', label: '4. 叶轮与轴封损耗识别', difficulty: '★★★', status: 'Locked' },
  { id: 'REASSEMBLY', label: '5. 精密回装与对中校准', difficulty: '★★★★', status: 'Locked' },
];

const SKILL_PROFILES = [
  { subject: '工艺标准度', A: 85, fullMark: 100 },
  { subject: '工具选用', A: 65, fullMark: 100 },
  { subject: '安全规范', A: 100, fullMark: 100 },
  { subject: '识图能力', A: 75, fullMark: 100 },
  { subject: '故障判断', A: 40, fullMark: 100 },
];

const SESSION_LOGS = [
  { time: '10:05', type: 'info', msg: '欢迎进入航运设备虚拟实操实验室。' },
  { time: '10:07', type: 'success', msg: '[步骤1] 安全能量隔离确认通过。' },
  { time: '10:10', type: 'warn', msg: '非法操作预警：未佩戴绝缘手套。' },
];

export const MaritimeNoviceTrainingView: React.FC = () => {
  const [phase, setPhase] = useState<TrainingPhase>('SAFETY_CHECK');
  const [sessionLogs, setLogs] = useState(SESSION_LOGS);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTimer(prev => prev + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleNextPhase = () => {
      const phases: TrainingPhase[] = ['SAFETY_CHECK', 'TOOL_SELECT', 'DISASSEMBLY', 'PART_IDENTIFY', 'REASSEMBLY', 'VERIFICATION'];
      const currentIndex = phases.indexOf(phase);
      if (currentIndex < phases.length - 1) {
          const next = phases[currentIndex + 1];
          setPhase(next);
          const newLog = { 
            time: new Date().toLocaleTimeString('zh-CN', {hour12:false, minute:'2-digit', second:'2-digit'}),
            type: 'success',
            msg: `进入下一阶段：${next.replace('_', ' ')}`
          };
          setLogs(prev => [newLog, ...prev.slice(0, 5)]);
      }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 relative overflow-hidden">
      
      {/* HUD Background Decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,_#10b981_0%,_transparent_60%)]"></div>
      
      {/* --- HEADER: Session Intel --- */}
      <div className="flex items-center justify-between bg-slate-900/40 border border-emerald-900/30 p-4 rounded-lg backdrop-blur-md z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-600/20 border-2 border-emerald-500 rounded-full flex items-center justify-center relative group shadow-[0_0_20px_rgba(16,185,129,0.2)]">
             <div className="absolute inset-0 bg-emerald-500/10 animate-pulse rounded-full"></div>
             <GraduationCap size={32} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 mb-0.5 uppercase tracking-[0.4em] font-black">
               Trainee Academy / V-Skill Lab
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
               航运设备 <span className="text-emerald-500">新手维修技能训练仿真</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Trainee Level</div>
                <div className="text-2xl font-mono font-black text-white">NOVICE <span className="text-emerald-500">L1</span></div>
            </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Training Timer</div>
                <div className="text-2xl font-mono font-black text-cyan-400">{formatTime(timer)}</div>
            </div>
        </div>
      </div>

      <div className="flex flex-1 gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Curriculum & Syllabus --- */}
        <div className="w-[300px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="训练课程目录" subtitle="SYLLABUS" className="flex-1 border-emerald-900/30 bg-emerald-950/5">
              <div className="space-y-3 mt-2">
                 {SYLLABUS.map((item, idx) => (
                    <div 
                      key={item.id}
                      className={`p-3 rounded border transition-all relative group
                        ${phase === item.id 
                            ? 'bg-emerald-900/30 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                            : 'bg-slate-900/40 border-slate-800 opacity-60'}
                      `}
                    >
                        {phase === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>}
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-xs font-bold text-white">{item.label}</span>
                           <span className="text-[10px] text-emerald-600 font-bold">{item.difficulty}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className={`text-[9px] uppercase tracking-widest ${phase === item.id ? 'text-emerald-400' : 'text-slate-500'}`}>{item.status}</span>
                           {phase === item.id && <Activity size={10} className="text-emerald-500 animate-pulse" />}
                        </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="实时操作指导" className="h-[180px] border-slate-800">
               <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded flex items-start gap-3">
                   <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                   <div className="text-[11px] text-blue-100/70 leading-relaxed italic">
                      "新手提示：在进行任何拆解动作前，必须在本地控制面板上确认‘停止’信号已锁定。当前 3D 视图中红色区域表示尚未执行的安全步骤。"
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Interactive Lab --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,0,0,1)] group">
               {/* HUD: Active Task Display */}
               <div className="absolute top-6 left-6 pointer-events-none z-20">
                   <div className="bg-slate-950/80 backdrop-blur border-l-4 border-emerald-500 p-4 rounded-sm shadow-xl flex flex-col gap-1">
                       <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Target size={12}/> Current Mission
                       </div>
                       <div className="text-2xl font-black text-white italic tracking-tighter uppercase">
                           {phase.replace('_', ' ')}
                       </div>
                   </div>
               </div>

               {/* Right HUD: Feedback */}
               <div className="absolute top-6 right-6 z-20 flex flex-col gap-3 pointer-events-none">
                   <div className="bg-black/60 backdrop-blur border border-emerald-500/30 p-3 rounded flex flex-col items-end">
                       <div className="text-[10px] text-emerald-400 font-bold mb-1 uppercase tracking-widest">Step Accuracy</div>
                       <div className="text-2xl font-mono font-bold text-white">92%</div>
                   </div>
               </div>

               {/* 3D Simulation Scene */}
               <ThreeScene phase={phase} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Virtual Toolbox Dock (Floating Bottom) */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-6 bg-slate-900/90 p-4 rounded-xl border border-slate-700 shadow-2xl backdrop-blur-md scale-105">
                   <div className="flex items-center gap-2 pr-4 border-r border-slate-700">
                      <div className="text-[10px] text-slate-500 font-black uppercase vertical-text">Tool<br/>box</div>
                   </div>
                   {[
                       { id: 'wrench', name: '活动扳手', icon: <Wrench size={18}/> },
                       { id: 'gauge', name: '深度计', icon: <Gauge size={18}/> },
                       { id: 'thermal', name: '测温仪', icon: <Thermometer size={18}/> },
                       { id: 'tablet', name: '数字工单', icon: <ClipboardList size={18}/> },
                   ].map((tool, i) => (
                       <button 
                         key={i}
                         className="flex flex-col items-center gap-1 group hover:scale-110 transition-all"
                       >
                           <div className="w-10 h-10 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/50 transition-colors">
                               {tool.icon}
                           </div>
                           <span className="text-[8px] text-slate-600 font-bold uppercase">{tool.name}</span>
                       </button>
                   ))}
                   <div className="w-[1px] h-10 bg-slate-700 mx-2"></div>
                   <button 
                     onClick={handleNextPhase}
                     className="px-8 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg shadow-lg flex items-center gap-3 transition-all active:scale-95"
                   >
                       <span className="tracking-widest uppercase">执行指令</span>
                       <ArrowRight size={18} />
                   </button>
               </div>
           </div>

           {/* Event Log Terminal (Bottom) */}
           <div className="h-36 bg-[#020205] border border-slate-800/60 rounded-lg p-3 font-mono text-[11px] overflow-hidden flex flex-col shadow-inner">
               <div className="text-slate-600 border-b border-slate-800 pb-1.5 mb-1.5 flex justify-between items-center uppercase font-black tracking-widest">
                   <div className="flex items-center gap-2"><Terminal size={14} /> session_feedback_kernel_log</div>
                   <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> MONITORING</div>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                   {sessionLogs.map((log, i) => (
                       <div key={i} className={`flex gap-3 leading-relaxed transition-all duration-300 
                          ${log.type === 'warn' ? 'text-red-400 font-bold bg-red-900/10' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-400'}
                       `}>
                           <span className="text-slate-700">[{log.time}]</span>
                           <span>{log.msg}</span>
                       </div>
                   ))}
               </div>
           </div>
        </div>

        {/* --- RIGHT: Skills & Performance --- */}
        <div className="w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="新手能力指纹" subtitle="SKILL RADAR" className="h-[280px] border-emerald-900/50 bg-emerald-950/5">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SKILL_PROFILES}>
                           <PolarGrid stroke="#065f46" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#6ee7b7', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Student" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.4} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="训练记录档案" subtitle="HISTORY" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-4">
                   <div className="space-y-4">
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">总计练习课时</span>
                           <span className="text-white font-bold">12.5 h</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">平均单步耗时</span>
                           <span className="text-white font-bold">45.2 s</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">错误纠正率</span>
                           <span className="text-emerald-400 font-bold">98.5%</span>
                       </div>
                   </div>
                   
                   <div className="h-px bg-slate-800"></div>

                   <div className="space-y-3">
                      <div className="text-[10px] text-slate-500 uppercase font-black flex items-center gap-2">
                          <Award size={12} className="text-yellow-500"/> 已获得勋章 (Badges)
                      </div>
                      <div className="flex gap-2">
                          <div className="w-10 h-10 rounded bg-emerald-900/40 border border-emerald-500/50 flex items-center justify-center text-emerald-400" title="Safety Pro">
                              <ShieldCheck size={20} />
                          </div>
                          <div className="w-10 h-10 rounded bg-slate-800/40 border border-slate-700 flex items-center justify-center text-slate-600" title="Fast Worker">
                              <Zap size={20} />
                          </div>
                          <div className="w-10 h-10 rounded bg-slate-800/40 border border-slate-700 flex items-center justify-center text-slate-600" title="Precise">
                              <Target size={20} />
                          </div>
                      </div>
                   </div>
                   
                   <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all mt-2 group">
                       <HardDrive size={16} className="text-slate-500 group-hover:text-emerald-400"/> 下载完整训练报告
                   </button>
               </div>
           </SciFiCard>

           {/* Mistake Alert */}
           <div className="bg-red-950/20 border border-red-900/40 p-3 rounded-lg flex items-start gap-3">
               <AlertTriangle size={20} className="text-red-500 shrink-0" />
               <div className="text-[10px] text-red-300/70 leading-relaxed">
                   <span className="font-bold text-red-200 uppercase block mb-1">Mistake Trend Alert</span>
                   检测到在“回装对中”环节频繁出现力矩过载，建议申请专家复核视频回放。
               </div>
           </div>
        </div>

      </div>
    </div>
  );
};

// --- Missing Icons ---
function ClipboardList(props: any) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <path d="M12 11h4"></path>
            <path d="M12 16h4"></path>
            <path d="M8 11h.01"></path>
            <path d="M8 16h.01"></path>
        </svg>
    );
}
