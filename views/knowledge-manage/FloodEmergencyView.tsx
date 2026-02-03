
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/flood-emergency/ThreeScene';
import { DrillPhase } from '../../components/knowledge-manage/flood-emergency/three-types';
import { 
  CloudLightning, AlertTriangle, Play, Pause, RotateCcw, 
  FileText, Shield, Radio, Activity, Map, Megaphone,
  UserCheck, Timer, Zap, Droplets, Waves
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- MOCK DATA ---
const SCRIPTS = [
    { id: 'S-001', title: '百年一遇特大洪水防御', level: 'I级 (红色)', type: 'Basin-wide', impact: 'High' },
    { id: 'S-002', title: '大坝漫顶溃决应急撤离', level: 'I级 (红色)', type: 'Dam Safety', impact: 'Critical' },
    { id: 'S-003', title: '下游城镇内涝排险', level: 'II级 (橙色)', type: 'Urban', impact: 'Medium' },
    { id: 'S-004', title: '山洪泥石流地质灾害', level: 'III级 (黄色)', type: 'Geo', impact: 'Medium' },
];

const SOP_TASKS = [
    { time: 'T+00:05', task: '启动I级应急响应', role: '指挥长', status: 'Done' },
    { time: 'T+00:15', task: '全流域泄洪闸门联控', role: '调度中心', status: 'Active' },
    { time: 'T+00:30', task: '下游A/B区人员转移', role: '安保组', status: 'Pending' },
    { time: 'T+01:00', task: '应急物资空投补给', role: '物流组', status: 'Pending' },
    { time: 'T+02:00', task: '抢险突击队集结堤防', role: '工程组', status: 'Pending' },
];

const RESOURCE_CAPABILITY = [
    { subject: '物资储备', A: 85, fullMark: 100 },
    { subject: '响应速度', A: 92, fullMark: 100 },
    { subject: '人员配置', A: 78, fullMark: 100 },
    { subject: '设备完好', A: 95, fullMark: 100 },
    { subject: '通讯保障', A: 88, fullMark: 100 },
];

const FLOOD_LEVEL_DATA = Array.from({length: 24}, (_, i) => ({
    time: i,
    level: i < 5 ? 100 : 100 + Math.pow(i-5, 1.5), // Rising curve
    limit: 140
}));

export const Flood2EmergencyView: React.FC = () => {
  const [activeScript, setActiveScript] = useState(SCRIPTS[0]);
  const [phase, setPhase] = useState<DrillPhase>('IDLE');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] 应急预案库已加载，等待演练指令...']);

  // Simulation Loop
  useEffect(() => {
    let interval: any;
    if (phase === 'PLAYING' || phase === 'CRITICAL_EVENT') {
        interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    setPhase('RECOVERY');
                    addLog('>>> 洪峰已过，进入灾后恢复评估阶段');
                    return 100;
                }
                // Trigger critical event at 70%
                if (prev > 70 && phase !== 'CRITICAL_EVENT') {
                    setPhase('CRITICAL_EVENT');
                    addLog('!! 警报：水位突破警戒线，启动紧急分洪区 !!');
                }
                return prev + 0.5;
            });
        }, 100);
    }
    return () => clearInterval(interval);
  }, [phase]);

  const addLog = (msg: string) => {
      const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
      setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 8)]);
  };

  const togglePlay = () => {
      if (phase === 'IDLE' || phase === 'PAUSED' || phase === 'RECOVERY') {
          setPhase('PLAYING');
          if (progress >= 100) setProgress(0);
          addLog('>>> 演练推演开始：' + activeScript.title);
      } else {
          setPhase('PAUSED');
          addLog('>>> 演练暂停');
      }
  };

  const resetDrill = () => {
      setPhase('IDLE');
      setProgress(0);
      addLog('>>> 演练场景重置');
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#0f172a] p-2 relative overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1e3a8a_0%,_#0f172a_60%)] opacity-30 pointer-events-none"></div>
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-blue-900/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-red-900/20 border border-red-500 rounded flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
             <CloudLightning size={32} className="text-red-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-red-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Shield size={12} /> Emergency Response Command
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               极端洪水 <span className="text-red-500 italic">应急预案演练脚本库</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Sim Time</div>
                <div className="text-2xl font-mono font-black text-white">T+{Math.floor(progress/4)}h</div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Risk Level</div>
                <div className={`text-2xl font-mono font-black ${phase === 'CRITICAL_EVENT' ? 'text-red-500 animate-bounce' : 'text-blue-400'}`}>
                    {phase === 'CRITICAL_EVENT' ? 'CRITICAL' : 'ELEVATED'}
                </div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Script Library --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="预案脚本库" subtitle="LIBRARY" className="border-blue-900/30 bg-[#0b1121]/90">
              <div className="flex flex-col gap-3 mt-2">
                 {SCRIPTS.map((script) => (
                    <div 
                      key={script.id}
                      onClick={() => { setActiveScript(script); addLog(`加载预案：${script.title}`); }}
                      className={`p-3 rounded border-l-4 cursor-pointer transition-all hover:bg-slate-800/80
                        ${activeScript.id === script.id 
                            ? 'bg-blue-900/20 border-blue-500 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' 
                            : 'bg-slate-900/40 border-slate-700 text-slate-400'}
                      `}
                    >
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-[10px] font-mono opacity-70">{script.id}</span>
                           <span className={`text-[9px] px-1.5 rounded font-bold uppercase ${
                               script.level.includes('I级') ? 'text-red-400 bg-red-900/20' : 'text-yellow-400 bg-yellow-900/20'
                           }`}>
                               {script.level}
                           </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-200">{script.title}</h3>
                        <div className="flex gap-2 mt-2 text-[10px] text-slate-500">
                            <span className="bg-slate-800 px-1 rounded">{script.type}</span>
                            <span className="bg-slate-800 px-1 rounded">Impact: {script.impact}</span>
                        </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="应急能力雷达" subtitle="ASSESSMENT" className="h-[250px] border-slate-800">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RESOURCE_CAPABILITY}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Capability" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.4} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: Digital Sand Table --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-blue-900/30 rounded-lg overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene phase={phase} progress={progress} />

               {/* Overlays HUD */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-3">
                   <div className="bg-slate-950/80 backdrop-blur border border-blue-500/30 p-3 rounded flex flex-col w-56">
                       <div className="text-[10px] text-blue-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Activity size={12}/> Simulation Status
                       </div>
                       <div className="text-xl font-black text-white">{phase}</div>
                       <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-blue-600 to-red-500 transition-all duration-300" style={{width: `${progress}%`}}></div>
                       </div>
                   </div>
               </div>

               {/* Timeline Controls */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-3 rounded-full border border-slate-700 shadow-2xl backdrop-blur-xl">
                   <button 
                     onClick={resetDrill}
                     className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full border border-slate-600 transition-all"
                   >
                       <RotateCcw size={20} />
                   </button>
                   <div className="h-10 w-[1px] bg-slate-700 mx-1"></div>
                   <button 
                     onClick={togglePlay}
                     className={`px-8 py-2 rounded-full font-bold flex items-center gap-2 transition-all min-w-[140px] justify-center
                        ${phase === 'PLAYING' || phase === 'CRITICAL_EVENT' ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}
                     `}
                   >
                       {phase === 'PLAYING' || phase === 'CRITICAL_EVENT' ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}
                       {phase === 'PLAYING' || phase === 'CRITICAL_EVENT' ? 'PAUSE' : 'START DRILL'}
                   </button>
               </div>
           </div>

           {/* Flood Level Chart */}
           <div className="h-[180px] bg-slate-900/40 border border-slate-800 rounded-lg p-3 overflow-hidden">
               <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>洪水演进过程线 (Flood Hydrograph)</span>
                   <span className="text-red-400 flex items-center gap-1"><AlertTriangle size={10}/> Limit: 140m</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={FLOOD_LEVEL_DATA}>
                       <defs>
                           <linearGradient id="floodGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                               <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                       <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[90, 160]} />
                       <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#ef4444'}} />
                       <Area type="monotone" dataKey="level" stroke="#ef4444" fill="url(#floodGrad)" strokeWidth={2} isAnimationActive={false} />
                   </AreaChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* --- RIGHT: Execution & Logs --- */}
        <div className="w-[340px] flex flex-col gap-4">
           
           <SciFiCard title="SOP 执行指令流" subtitle="ACTIONS" className="flex-1 border-blue-900/30">
               <div className="relative pl-4 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 py-2">
                   {SOP_TASKS.map((task, i) => (
                       <div key={i} className="relative group">
                           {/* Status Dot */}
                           <div className={`absolute -left-[13px] top-1.5 w-3 h-3 rounded-full border-2 
                               ${task.status === 'Done' ? 'bg-green-500 border-green-300' : 
                                 task.status === 'Active' ? 'bg-blue-500 border-white animate-pulse' : 'bg-slate-800 border-slate-600'}
                           `}></div>
                           
                           <div className={`p-3 rounded border transition-all ${task.status === 'Active' ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-900/40 border-slate-800'}`}>
                               <div className="flex justify-between items-center mb-1">
                                   <span className="text-[10px] text-slate-500 font-mono">{task.time}</span>
                                   <span className={`text-[9px] px-1.5 rounded uppercase font-bold ${task.status === 'Done' ? 'text-green-400 bg-green-900/20' : 'text-slate-400 bg-slate-800'}`}>
                                       {task.status}
                                   </span>
                               </div>
                               <div className="text-sm font-bold text-slate-200">{task.task}</div>
                               <div className="flex items-center gap-2 mt-2 text-[10px] text-cyan-500">
                                   <UserCheck size={10} /> 责任人: {task.role}
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <div className="h-[200px] bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col shadow-inner">
               <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-1.5 flex items-center gap-2">
                   <Radio size={12} className="text-red-500 animate-pulse"/> Emergency Broadcast Channel
               </div>
               <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1.5 mt-2 pr-1 custom-scrollbar">
                   {logs.map((log, i) => (
                       <div key={i} className={`flex gap-2 animate-in slide-in-from-left-1 ${log.includes('!!') ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                           <span className="opacity-50">[{logs.length - i}]</span>
                           <span>{log}</span>
                       </div>
                   ))}
                   <div className="animate-pulse text-blue-500 mt-1">_</div>
               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
