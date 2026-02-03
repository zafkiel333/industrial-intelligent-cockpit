
import React, { useState, useEffect, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/mining-emergency-drill/ThreeScene';
import { DrillStep } from '../../components/maintenance/mining-emergency-drill/three-types';
import { 
  AlertOctagon, Activity, Zap, ShieldAlert, 
  Settings, Clock, Target, BarChart3, 
  Database, Cpu, MessageSquare, Play, 
  RotateCcw, ShieldCheck, Siren, ArrowRight,
  UserCheck, Thermometer, Droplets, HardDrive,
  DollarSign, FileWarning, Timer,
  // Added Gauge and CheckCircle2 to fix the errors on line 205 and 300
  Gauge, CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell, Legend, ReferenceLine
} from 'recharts';

// --- 模拟演练配置 ---
const DRILL_STAGES: { id: DrillStep; label: string; action: string; duration: string }[] = [
  { id: 'STANDBY', label: '生产巡检', action: '监测主提升机负载波动', duration: 'NORMAL' },
  { id: 'INCIDENT_TRIGGER', label: '突发故障', action: '轴承烧瓦，紧急制动触发', duration: '0s' },
  { id: 'SITE_CONTAINMENT', label: '区域封锁', action: '执行 LOTO，人员紧急疏散', duration: 'T+5m' },
  { id: 'RAPID_DIAGNOSIS', label: '快速故障扫描', action: '3D点云测绘受损表面', duration: 'T+15m' },
  { id: 'EMERGENCY_REPAIR', label: '原位修复', action: '机器人自动补焊与研磨', duration: 'T+45m' },
  { id: 'RESTORE_TEST', label: '负载校验', action: '空载/满载循序恢复测试', duration: 'T+90m' },
];

const LOSS_DATA = Array.from({length: 20}, (_, i) => ({
    time: i,
    loss: i < 5 ? 0 : (i - 5) * 12.5, // 故障后损失线性增加
}));

const TEAM_READINESS = [
  { subject: '机械组', A: 95, fullMark: 100 },
  { subject: '电气组', A: 82, fullMark: 100 },
  { subject: '安全组', A: 100, fullMark: 100 },
  { subject: '物流组', A: 75, fullMark: 100 },
  { subject: '软件组', A: 90, fullMark: 100 },
];

export const MiningEmergencyDrillView: React.FC = () => {
  const [stepIdx, setStepIdx] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] 应急推演系统已初始化，通讯链路通畅...']);
  const [isEmergency, setIsEmergency] = useState(false);

  const currentStep = DRILL_STAGES[stepIdx];

  // 计时器
  useEffect(() => {
    let timer: any;
    if (isEmergency) {
        timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isEmergency]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 8)]);
  };

  const triggerIncident = () => {
      setStepIdx(1);
      setIsEmergency(true);
      addLog('!! 警报：主卷扬机右侧轴承检测到剧烈温升与振动 !!');
      addLog('!! 紧急停机信号已发送至 PLC 端 !!');
  };

  const handleNext = () => {
    if (stepIdx < DRILL_STAGES.length - 1) {
      setStepIdx(prev => prev + 1);
      addLog(`>>> 演练指令：执行 ${DRILL_STAGES[stepIdx+1].label}`);
    } else {
        setIsEmergency(false);
        addLog('演练总结：修复成功，系统已闭环。');
    }
  };

  const formatSecs = (s: number) => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#02040a] p-2 relative overflow-hidden">
      
      {/* 战术氛围层 */}
      {isEmergency && <div className="absolute inset-0 border-[20px] border-red-900/10 pointer-events-none z-50 animate-pulse"></div>}

      {/* --- TOP HUD (Command Center) --- */}
      <div className="flex items-center justify-between z-10 bg-slate-900/60 border border-slate-800 p-4 rounded-lg backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-5">
          <div className={`w-12 h-12 rounded-sm flex items-center justify-center border-2 transition-all duration-500
            ${!isEmergency ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-red-500/20 border-red-500 text-red-500 animate-pulse'}
          `}>
             {!isEmergency ? <ShieldCheck size={28} /> : <AlertOctagon size={28} />}
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               Incident Command / Mine Safety Drill
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
               矿山突发设备停机 <span className={!isEmergency ? 'text-cyan-500' : 'text-red-500'}>应急维修演练中心</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center h-12 border-l border-slate-800 pl-8">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">损失计时 (T-ZERO)</div>
                <div className={`text-3xl font-mono font-black ${isEmergency ? 'text-red-500' : 'text-slate-400'}`}>
                    {formatSecs(elapsedTime)}
                </div>
            </div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">预估经济损失</div>
                <div className="text-3xl font-mono font-bold text-orange-400">
                    ¥ {(elapsedTime * 24.5).toFixed(0)} <span className="text-xs">RMB</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Incident Intel --- */}
        <div className="w-[320px] flex flex-col gap-4">
           
           <SciFiCard title="事件影响分析" subtitle="IMPACT ASSESSMENT" className="h-1/2 border-slate-800 bg-slate-950/40">
               <div className="w-full h-full flex flex-col gap-4 p-1">
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={LOSS_DATA}>
                                <defs>
                                    <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis hide />
                                <Area type="stepAfter" dataKey="loss" stroke="#ef4444" fill="url(#lossGrad)" strokeWidth={2} isAnimationActive={false} />
                                <ReferenceLine y={150} stroke="#f59e0b" strokeDasharray="3 3" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">停机涉及工作面</span>
                            <span className="text-white font-bold">W-104, W-105</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">下游产能损失</span>
                            <span className="text-red-400 font-bold">-4500 t/d</span>
                        </div>
                    </div>
               </div>
           </SciFiCard>

           <SciFiCard title="应急响应资源" subtitle="READY TEAMS" className="flex-1 border-slate-800">
                <div className="w-full h-full p-2 flex flex-col gap-4">
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={TEAM_READINESS}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Ready" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-blue-900/10 border border-blue-500/20 p-2 rounded flex flex-col gap-1">
                        <div className="text-[10px] text-blue-400 font-bold flex items-center gap-1"><UserCheck size={10}/> 应急专家组</div>
                        <div className="text-xs text-slate-300">远程辅助系统已同步至王工终端。</div>
                    </div>
                </div>
           </SciFiCard>

        </div>

        {/* --- CENTER: 3D Tactical Twin --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] group">
               {/* HUD: Phase Badge */}
               <div className="absolute top-6 left-6 flex flex-col gap-4 z-20 pointer-events-none">
                   <div className={`bg-slate-950/90 backdrop-blur border p-4 rounded-sm flex flex-col border-l-4 transition-all
                     ${!isEmergency ? 'border-cyan-500/50' : 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]'}
                   `}>
                       <div className={`text-[10px] font-bold mb-1 uppercase tracking-widest ${!isEmergency ? 'text-cyan-500' : 'text-red-500'}`}>
                          Drill Stage: {currentStep.id}
                       </div>
                       <div className="text-2xl font-black text-white">{currentStep.label}</div>
                       <p className="text-[11px] text-slate-400 mt-2 italic">动作指令: {currentStep.action}</p>
                   </div>

                   {isEmergency && (
                        <div className="bg-slate-950/80 backdrop-blur border border-cyan-500/30 p-3 rounded-sm flex flex-col animate-in fade-in slide-in-from-left-2">
                           <div className="text-[10px] text-cyan-400 font-bold mb-2 uppercase tracking-widest flex items-center gap-2">
                               <Gauge size={10}/> Telemetry Matrix
                           </div>
                           <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px] font-bold text-white">
                              <span className="text-slate-500">BEARING TEMP:</span> <span className="text-red-400">112.5 °C</span>
                              <span className="text-slate-500">OIL PRESS:</span> <span className="text-yellow-500">0.05 MPa</span>
                              <span className="text-slate-500">VIBRATION:</span> 12.8 mm/s
                           </div>
                        </div>
                   )}
               </div>

               {/* Trigger Button (Only in Standby) */}
               {!isEmergency && (
                   <div className="absolute inset-0 flex items-center justify-center z-30">
                        <button 
                          onClick={triggerIncident}
                          className="group relative flex flex-col items-center justify-center p-10 bg-red-600/10 hover:bg-red-600/20 rounded-full border border-red-500/50 animate-pulse transition-all shadow-[0_0_50px_rgba(239,68,68,0.1)]"
                        >
                            <Siren size={48} className="text-red-500 mb-2 group-hover:scale-125 transition-transform" />
                            <span className="text-xs font-black text-white tracking-[0.2em] uppercase">触发紧急故障</span>
                        </button>
                   </div>
               )}

               {/* 3D Scene */}
               <ThreeScene step={currentStep.id} />

               {/* Bottom Control Scrubber */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-slate-950/90 p-4 rounded-full border border-slate-700 shadow-2xl flex items-center gap-6 backdrop-blur-xl z-20">
                   <button 
                     onClick={() => {setStepIdx(0); setIsEmergency(false); setElapsedTime(0); addLog('重新启动演习程序');}}
                     className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full border border-slate-700 transition-all hover:rotate-[-180deg]"
                   >
                       <RotateCcw size={20} />
                   </button>
                   
                   <div className="flex-1 flex justify-between px-6 relative h-10 items-center">
                       <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-slate-800 -translate-y-1/2"></div>
                       {DRILL_STAGES.map((s, idx) => (
                           <div 
                             key={s.id} 
                             className={`relative z-10 w-4 h-4 rounded-full transition-all border-2
                                ${idx <= stepIdx ? 'bg-red-500 border-white scale-125' : 'bg-slate-900 border-slate-700'}
                             `}
                           >
                               {idx === stepIdx && (
                                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-500 text-black px-2 py-0.5 rounded text-[8px] font-black uppercase whitespace-nowrap">
                                       {s.duration}
                                   </div>
                               )}
                           </div>
                       ))}
                   </div>

                   <button 
                     onClick={handleNext}
                     disabled={!isEmergency || stepIdx === DRILL_STAGES.length - 1}
                     className="px-8 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-full shadow-lg shadow-red-900/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                   >
                       <span className="tracking-widest uppercase">Next Directive</span>
                       <ArrowRight size={20} />
                   </button>
               </div>
           </div>

           {/* Console Log Terminal */}
           <div className="h-40 bg-slate-950 border border-slate-800 rounded p-3 font-mono text-[10px] overflow-y-auto custom-scrollbar flex flex-col gap-1 shadow-inner">
               <div className="text-slate-600 border-b border-slate-800 pb-1 mb-1 flex justify-between items-center">
                   <span>EMERGENCY_AUDIT_LOG_V1.0</span>
                   <span className="animate-pulse">ENCRYPTED</span>
               </div>
               {logs.map((log, i) => (
                   <div key={i} className={`flex gap-3 leading-relaxed transition-all duration-300 ${log.includes('!!') ? 'text-red-400 font-bold bg-red-900/10' : 'text-slate-400 hover:text-cyan-300'}`}>
                       <span className="text-slate-600">[{logs.length - i}]</span>
                       <span>{log}</span>
                   </div>
               ))}
           </div>
        </div>

        {/* RIGHT: Checklist & Supply */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="应急处理清单" subtitle="CHECKLIST" className="border-slate-800 bg-[#0c0e14]/90">
               <div className="space-y-3 py-1">
                   {[
                       { label: '现场供电隔离', status: stepIdx >= 2 ? 'Done' : 'Active' },
                       { label: '安全警戒带布置', status: stepIdx >= 2 ? 'Done' : 'Pending' },
                       { label: '吊装机械就绪', status: stepIdx >= 4 ? 'Done' : 'Pending' },
                       { label: '备件库存核实', status: 'Done' },
                   ].map((item, i) => (
                       <div key={i} className={`p-2 rounded border flex items-center justify-between transition-colors
                          ${item.status === 'Done' ? 'bg-green-900/10 border-green-800/30 text-green-500/80' : 'bg-slate-900/50 border-slate-800 text-slate-400'}
                       `}>
                           <span className="text-[11px] font-bold">{item.label}</span>
                           {item.status === 'Done' ? <CheckCircle2 size={14}/> : <div className="w-2 h-2 rounded-full bg-slate-600"></div>}
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="备件紧急调度" subtitle="LOGISTICS" className="flex-1 border-slate-800">
               <div className="flex flex-col h-full gap-4">
                    <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">最近备件点 (C-14)</div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-white tracking-tight">大型调心滚子轴承</span>
                            <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 rounded">In Stock</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-cyan-400">
                            <Clock size={12}/> <span className="font-mono">Est: 14 mins</span>
                        </div>
                    </div>

                    <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded p-2 flex flex-col items-center justify-center relative overflow-hidden">
                        <Database size={40} className="text-slate-800 absolute opacity-20" />
                        <div className="text-center z-10">
                            <div className="text-[10px] text-slate-500 mb-1">库存编号</div>
                            <div className="text-sm font-mono text-white">SKF-7214-MS-01</div>
                            <button className="mt-3 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold rounded-sm uppercase tracking-widest transition-all">
                                立即发起出库
                            </button>
                        </div>
                    </div>

                    <div className="p-3 bg-red-900/10 border border-red-900/30 rounded flex items-center gap-3">
                        <FileWarning size={16} className="text-red-500 shrink-0" />
                        <div className="text-[10px] text-red-300 leading-relaxed">
                            注：备件更换需专业起重班组在场，当前排班已锁定 2 名二级起重工。
                        </div>
                    </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};

function PauseIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
    );
}
