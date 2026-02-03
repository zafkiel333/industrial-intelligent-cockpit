import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/port-collaborative/ThreeScene';
import { CollaborativePhase } from '../../components/maintenance/port-collaborative/three-types';
import { 
  Users, Activity, Wrench, ShieldAlert, 
  Cpu, Zap, Play, RotateCcw, 
  CheckCircle2, AlertTriangle, Workflow,
  MessageSquare, Users2, Timer, Settings2,
  Lock, Share2, ClipboardCheck, ArrowRight,
  UserCheck, ShieldCheck
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  // Added Line to fix "Cannot find name 'Line'" error
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, Legend, Line
} from 'recharts';

// --- 模拟数据 ---
const TEAM_HEALTH = [
  { subject: '机械组', A: 95, B: 80, fullMark: 100 },
  { subject: '电气组', A: 88, B: 90, fullMark: 100 },
  { subject: '自动化组', A: 92, B: 75, fullMark: 100 },
  { subject: '液压组', A: 78, B: 85, fullMark: 100 },
  { subject: '安全监护', A: 100, B: 100, fullMark: 100 },
];

const COLLAB_EFFICIENCY = Array.from({length: 12}, (_, i) => ({
    time: `${i*2}min`,
    sync: 70 + Math.random() * 25,
    risk: 10 + Math.random() * 15
}));

const COLLAB_STEPS: { id: CollaborativePhase; label: string; lead: string; desc: string; color: string }[] = [
  { id: 'SAFETY_LOCK', label: '现场准入与锁定', lead: '安全组', desc: '执行 LOTO 程序，所有工种确认机械、动力隔离。', color: '#ef4444' },
  { id: 'MECH_DISMANTLE', label: '机械机构拆解', lead: '机械组', desc: '拆卸小车行走轮组，电气组同步监控缆线张力。', color: '#f59e0b' },
  { id: 'ELEC_TEST', label: '电气参数测试', lead: '电气组', desc: '变频器静态测试，机械组负责制动器手动释放配合。', color: '#3b82f6' },
  { id: 'AUTO_CALIBRATE', label: '控制逻辑校准', desc: 'PLC 轨迹参数重置，班组联合确认安全限位。', lead: '自动化组', color: '#10b981' },
  { id: 'JOINT_VERIFY', label: '全系统联动验收', desc: '多工种协同监测重载作业全过程，完成数字化签认。', lead: '全员', color: '#8b5cf6' },
];

const TEAM_UNITS = [
    { name: '机械班组', leader: '张建国', status: 'Working', color: 'text-amber-500', icon: <Wrench size={14}/> },
    { name: '电气班组', leader: '李明华', status: 'Standby', color: 'text-blue-500', icon: <Zap size={14}/> },
    { name: '软件班组', leader: '陈思齐', status: 'Ready', color: 'text-emerald-500', icon: <Cpu size={14}/> },
];

export const PortCollaborativeRepairView: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] 协同仿真引擎加载完毕...', '[System] 已连接岸桥 STS-22 实时数据接口']);
  const [synergyScore, setSynergyScore] = useState(94.5);

  const currentStep = COLLAB_STEPS[currentStepIdx];
  const currentState = currentStep.id;

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  const nextStep = () => {
    if (currentStepIdx < COLLAB_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      addLog(`[协同动态] ${COLLAB_STEPS[currentStepIdx+1].lead} 已接管任务：${COLLAB_STEPS[currentStepIdx+1].label}`);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#02040a] p-2 relative overflow-hidden">
      {/* 背景动态光影 */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_20%_30%,_#3b82f6_0%,_transparent_50%)]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-indigo-900/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500 rounded-full flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-indigo-500/10 animate-pulse rounded-full"></div>
             <Users2 size={32} className="text-indigo-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-indigo-400 mb-0.5 uppercase tracking-[0.4em] font-black">
               <ShieldCheck size={12} /> Collaborative Maintenance Command
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               港口设备 <span className="text-indigo-500 italic">多工种协同维修仿真</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-12 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Synergy Index</div>
                <div className="text-3xl font-mono font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                    {synergyScore.toFixed(1)} <span className="text-sm font-normal text-slate-600">%</span>
                </div>
            </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Units</div>
                <div className="text-3xl font-mono font-black text-white">03 <span className="text-sm font-normal text-slate-600">Teams</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 z-10">
        
        {/* --- LEFT: Team roster & Progress --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="现场作业班组" subtitle="TEAM UNITS" className="border-indigo-900/30 bg-[#0c0e14]/90">
              <div className="space-y-3 mt-2">
                 {TEAM_UNITS.map((team, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 transition-all group">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-sm bg-slate-800 ${team.color}`}>{team.icon}</div>
                          <div>
                             <div className="text-sm font-bold text-white group-hover:text-indigo-300">{team.name}</div>
                             <div className="text-[10px] text-slate-500">领班: {team.leader}</div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className={`text-[10px] font-bold uppercase ${team.status === 'Working' ? 'text-indigo-400' : 'text-slate-600'}`}>{team.status}</div>
                          <div className="flex gap-1 mt-1">
                             <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                             <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                             <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="协同工序树" subtitle="INTERDEPENDENCY" className="flex-1 border-indigo-900/30">
               <div className="relative pl-4 space-y-4 py-2 custom-scrollbar overflow-y-auto">
                   <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800"></div>
                   {COLLAB_STEPS.map((step, idx) => {
                       const active = idx === currentStepIdx;
                       const past = idx < currentStepIdx;
                       return (
                           <div key={step.id} className={`relative group transition-all duration-300 ${active ? 'opacity-100 scale-[1.02] origin-left' : 'opacity-40'}`}>
                               <div className={`absolute -left-[24px] top-1 w-4 h-4 rounded-full border-2 z-10 transition-all
                                   ${active ? 'bg-indigo-500 border-white shadow-[0_0_15px_rgba(99,102,241,1)]' : 
                                     past ? 'bg-green-500 border-green-800' : 'bg-slate-900 border-slate-700'}
                               `}></div>
                               <div className={`p-3 rounded border ${active ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-900/20 border-slate-800'}`}>
                                  <div className="flex justify-between mb-1">
                                     <h4 className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-500'}`}>{step.label}</h4>
                                     <span className="text-[9px] font-mono text-indigo-400">{step.lead}</span>
                                  </div>
                                  {active && <p className="text-[11px] text-slate-400 leading-tight border-t border-indigo-500/20 pt-2 mt-1">{step.desc}</p>}
                               </div>
                           </div>
                       );
                   })}
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Collaboration View --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-[#050505] border border-indigo-900/30 rounded-lg overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene phase={currentState} />

               {/* Floating Telemetry HUD */}
               <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
                   <div className="bg-black/60 backdrop-blur border border-indigo-500/30 p-3 rounded-lg flex flex-col items-end">
                       <div className="text-[10px] text-indigo-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Timer size={12} className="text-indigo-400"/> Operational Window
                       </div>
                       <div className="text-2xl font-mono font-bold text-white tracking-widest">14:52:00</div>
                       <div className="text-[9px] text-slate-500">EST. RESTORATION: 4.5h</div>
                   </div>
                   
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-3 rounded-lg flex flex-col items-end">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest">Collision Risk</div>
                       <div className="text-xl font-mono font-bold text-green-400">LOW</div>
                       <div className="w-24 h-1 bg-slate-800 mt-1 rounded-full overflow-hidden">
                           <div className="bg-green-500 h-full w-[15%]"></div>
                       </div>
                   </div>
               </div>

               {/* Central Workflow Button */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-700 shadow-2xl scale-110">
                   <button 
                     onClick={() => {setCurrentStepIdx(0); addLog('重新启动协同仿真');}}
                     className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full border border-slate-600 transition-all hover:rotate-[-45deg]"
                   >
                       <RotateCcw size={22} />
                   </button>
                   <div className="h-12 w-[1px] bg-slate-800 mx-2"></div>
                   <button 
                     onClick={nextStep}
                     disabled={currentStepIdx === COLLAB_STEPS.length - 1}
                     className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-full shadow-lg shadow-indigo-900/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                   >
                       {currentStepIdx === COLLAB_STEPS.length - 1 ? '演练完成' : '执行协同下一步 (Sync)'}
                       <ArrowRight size={20} />
                   </button>
               </div>

               {/* Corner Badges */}
               <div className="absolute bottom-4 left-4 text-[10px] text-slate-500 flex items-center gap-2">
                   <Activity size={12} className="text-indigo-500 animate-pulse" />
                   <span>实时同步 PDM 数据资产: STS-22-UNIT-D</span>
               </div>
           </div>

           {/* Efficiency & Risk Timeline */}
           <div className="h-[220px] bg-slate-900/40 border border-indigo-900/20 rounded-lg p-3 overflow-hidden shadow-inner">
               <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>协同匹配度与安全冲突趋势 (Synergy & Collision Risk)</span>
                   <span className="text-indigo-400">Live Simulation Data</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={COLLAB_EFFICIENCY}>
                       <defs>
                           <linearGradient id="syncGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} />
                       <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                       <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#8b5cf6'}} />
                       <Area type="monotone" dataKey="sync" stroke="#8b5cf6" fill="url(#syncGrad)" strokeWidth={2} name="协同度" />
                       <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={1} dot={false} name="风险值" />
                   </AreaChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* --- RIGHT: Collaborative Analysis --- */}
        <div className="w-full lg:w-[360px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="多工种作业负载" subtitle="RESOURCE CHART" className="h-[280px] border-indigo-900/30">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={TEAM_HEALTH}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Active" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.3} />
                           <Radar name="Fatigue" dataKey="B" stroke="#ef4444" strokeWidth={1} fill="#ef4444" fillOpacity={0.1} />
                           <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#8b5cf6', fontSize: '10px'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="协同决策看板" subtitle="AI INSIGHTS" className="flex-1 border-indigo-900/30">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded">
                       <div className="flex items-center gap-2 mb-2">
                           <MessageSquare size={14} className="text-indigo-400" />
                           <span className="text-xs font-bold text-indigo-200">指挥中心建议</span>
                       </div>
                       <p className="text-[11px] text-slate-400 leading-relaxed italic">
                          "基于历史工单分析，当前电气组测试阶段建议增加一名自动化工程师协同。预测10分钟后机械组将进入高空吊装环节，安全监护需从平台底部移动至二层回转台位置。"
                       </p>
                   </div>

                   <div className="space-y-2">
                      <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-1">协作沟通日志</div>
                      <div className="h-32 overflow-y-auto font-mono text-[9px] space-y-1 pr-1 custom-scrollbar">
                          {logs.map((log, i) => (
                              <div key={i} className="flex gap-2">
                                  <span className="text-indigo-600">[{i+1}]</span>
                                  <span className="text-slate-400">{log}</span>
                              </div>
                          ))}
                          <div className="animate-pulse text-indigo-500">_</div>
                      </div>
                   </div>

                   <button className="mt-auto w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[11px] font-bold flex items-center justify-center gap-2 transition-all group">
                       <Share2 size={12} className="group-hover:text-indigo-400" /> 同步协同状态至集团中心
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
