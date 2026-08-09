import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/mining-conflict/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-45]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-45';
import { ConflictStep, TaskNode } from '../../components/maintenance/mining-conflict/three-types';
import { 
  GitMerge, AlertTriangle, ShieldAlert, Cpu, 
  Zap, Clock, Target, Layers, 
  Play, RotateCcw, ShieldCheck, TrendingUp,
  BrainCircuit, LayoutGrid, ListFilter,
  FileText, Activity, Workflow, Share2,
  Users, Terminal, Gavel, ArrowRight, CheckCircle2,
  Maximize2, Box
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  BarChart, Bar, Cell, ComposedChart, Line
} from 'recharts';

// --- MOCK DATA ---
const INITIAL_TASKS: TaskNode[] = [
  { id: 'T1', name: '给料斗液压管拆卸', team: 'HYD', start: 0, duration: 4, conflicts: ['T2'] },
  { id: 'T2', name: '驱动侧润滑脂加注', team: 'MECH', start: 2, duration: 3, conflicts: ['T1'] },
  { id: 'T3', name: '控制屏二次回路校验', team: 'ELEC', start: 6, duration: 4, conflicts: [] },
  { id: 'T4', name: '防爆性能联合验收', team: 'SAFETY', start: 10, duration: 2, conflicts: [] },
];

const RESOLVED_TASKS: TaskNode[] = [
  { id: 'T1', name: '给料斗液压管拆卸', team: 'HYD', start: 0, duration: 4, conflicts: [] },
  { id: 'T2', name: '驱动侧润滑脂加注', team: 'MECH', start: 4.5, duration: 3, conflicts: [] }, 
  { id: 'T3', name: '控制屏二次回路校验', team: 'ELEC', start: 8, duration: 4, conflicts: [] },
  { id: 'T4', name: '防爆性能联合验收', team: 'SAFETY', start: 12.5, duration: 2, conflicts: [] },
];

const RESOURCE_LOAD = [
  { name: '机械班组', val: 85 },
  { name: '电气班组', val: 42 },
  { name: '液压专班', val: 98 },
  { name: '安全监督', val: 60 },
];

const EFFICIENCY_TREND = Array.from({length: 10}, (_, i) => ({
    time: i,
    before: 60 + Math.random() * 10,
    after: 85 + Math.random() * 10
}));

export const MiningProcessConflictView: React.FC = () => {
  const [step, setStep] = useState<ConflictStep>('SCANNING');
  const [activeTasks, setActiveTasks] = useState<TaskNode[]>(INITIAL_TASKS);
  const [aiAnalysis, setAiAnalysis] = useState('正在利用 AI 引擎扫描全量检修工序依赖关系...');
  const [logs, setLogs] = useState<string[]>(['[Kernel] 冲突消解引擎 V4.2 启动...', '[Info] 正在加载破碎机检修主计划.xml']);

  // AI Reasoning Simulator
  useEffect(() => {
    const fetchInference = async () => {
      if (step === 'DETECTED') {
        setAiAnalysis('AI 决策引擎正在计算资源冲突熵增，评估最佳消解时位...');
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `作为一个矿山设备检修调度专家。
          当前存在冲突：给料斗液压拆卸(T1)与润滑脂加注(T2)在空间上有65%的干涉，且共享同一台手动液压泵。
          请给出一个专业消解方案。要求：中文，包含优先级分配和具体的平移时间建议，回答字数100字左右。`;
          
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
          });
          setAiAnalysis(response.text || 'AI 推理响应异常。');
        } catch (err) {
          setAiAnalysis('AI 决策链路受限。建议：将 T2 工序延后 2.5 小时执行，优先释放液压动力源保障关键路径 T1。');
        }
      }
    };
    fetchInference();
  }, [step]);

  // Simulation Stages
  useEffect(() => {
    if (step === 'SCANNING') {
      const timer = setTimeout(() => {
        setStep('DETECTED');
        addLog('!! [警报] 检测到 2 处时空干涉冲突');
        addLog('!! [冲突1] T1 与 T2 空间包络重叠 42%');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const addLog = (msg: string) => {
    const timeStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setLogs(prev => [`[${timeStr}] ${msg}`, ...prev.slice(0, 7)]);
  };

  const runResolution = () => {
    setStep('RECALCULATING');
    addLog('>> 执行 AI 消解算法：时位平移与拓扑重构...');
    setTimeout(() => {
        setStep('RESOLVED');
        setActiveTasks(RESOLVED_TASKS);
        addLog('>> 消解完成。冲突消除，工期预期缩短 14%。');
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#02040a] p-2 relative overflow-hidden">
      
      {/* HUD Background Decorations */}
      <div className="absolute inset-0 pointer-events-none opacity-5 tech-grid-bg"></div>

      {/* --- HEADER: Control HUD --- */}
      <div className="flex items-center justify-between z-10 bg-slate-900/60 border border-slate-800 p-4 rounded-lg backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded flex items-center justify-center border-2 transition-all duration-700
            ${step === 'DETECTED' ? 'bg-red-600/20 border-red-500 animate-pulse' : 'bg-indigo-600/20 border-indigo-500 text-indigo-400'}
          `}>
             <Gavel size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-indigo-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               Industrial Process Strategy Hub
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
               矿山装备维修 <span className="text-indigo-500">工序冲突消解模拟</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center border-l border-slate-800 pl-8 h-12">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Conflicts</div>
                <div className={`text-3xl font-mono font-black ${step === 'DETECTED' ? 'text-red-500' : 'text-green-400'}`}>
                    {step === 'DETECTED' ? '02' : '00'}
                </div>
            </div>
             <div className="text-right border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Wait Time Reduction</div>
                <div className="text-3xl font-mono font-black text-cyan-400">14.5<span className="text-sm">%</span></div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Process Queue & Load --- */}
        <div className="w-[320px] flex flex-col gap-4">
           <SciFiCard title="当前冲突分析列表" subtitle="TASK QUEUE" className="flex-1 border-slate-800 bg-[#0c0e14]/90">
              <div className="flex flex-col gap-3 mt-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                 {activeTasks.map((t) => (
                    <div key={t.id} className={`p-3 rounded border transition-all relative overflow-hidden group
                        ${step === 'RESOLVED' ? 'bg-green-950/20 border-green-900/40 opacity-60' : 
                          t.conflicts.length > 0 ? 'bg-red-950/20 border-red-500/50 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]' : 'bg-slate-900/40 border-slate-800'}
                    `}>
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-[10px] font-mono text-slate-500">{t.id} / {t.team}</span>
                           <span className={`text-[8px] font-black px-1.5 py-0.5 rounded
                              ${t.conflicts.length > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}
                           `}>{t.conflicts.length > 0 ? 'CONFLICT' : 'SYNCED'}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{t.name}</h4>
                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                           <span className="flex items-center gap-1"><Clock size={10} /> START: {t.start}h</span>
                           <span className="italic">DUR: {t.duration}h</span>
                        </div>
                    </div>
                 ))}
                 
                 {step === 'RESOLVED' && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                        <CheckCircle2 size={48} className="text-green-500 mb-2" />
                        <h4 className="text-white font-bold">冲突已完全消解</h4>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-mono">Process Tree Optimal</p>
                    </div>
                 )}
              </div>
           </SciFiCard>

           <SciFiCard title="资源实时分时负载" subtitle="RESOURCE LOAD" className="h-[240px] border-slate-800">
               <div className="w-full h-full p-1">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={RESOURCE_LOAD} layout="vertical" margin={{left: -20}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                           <XAxis type="number" hide domain={[0, 100]} />
                           <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{fontSize: 10}} width={80} />
                           <Bar dataKey="val" radius={[0, 4, 4, 0]} barSize={12}>
                               {RESOURCE_LOAD.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#0ea5e9'} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Visualization Area --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           <div className="flex-1 bg-black border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,0,0,1)] group">
               {/* 3D Scene */}
               <ThreeScene state={step} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               <div className="absolute top-6 left-6 pointer-events-none z-20 flex flex-col gap-4">
                   <div className="bg-slate-950/80 backdrop-blur border-l-4 border-indigo-500 p-4 rounded-sm shadow-xl flex flex-col border border-slate-800">
                       <div className="text-[10px] text-indigo-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Activity size={14} className="animate-pulse" /> Simulation Kernel Active
                       </div>
                       <div className="text-3xl font-black text-white italic tracking-tighter uppercase">
                          PHASE: {step}
                       </div>
                   </div>
               </div>

               {/* Central Action Dock */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-3 rounded-full border border-slate-700 shadow-2xl backdrop-blur-xl scale-100">
                   <div className="flex gap-2 px-2">
                        <button 
                          onClick={() => {setStep('SCANNING'); addLog('引擎重启，开始全量工序扫描');}}
                          className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-full text-slate-400 hover:text-white transition-all shadow-inner" 
                          title="Reset Engine"
                        >
                          <RotateCcw size={18}/>
                        </button>
                        <button className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-full text-slate-400 hover:text-white transition-all shadow-inner" title="Save Path"><Share2 size={18}/></button>
                   </div>
                   <div className="w-[1px] h-6 bg-slate-700 my-auto mx-1"></div>
                   <button 
                     onClick={runResolution}
                     disabled={step !== 'DETECTED'}
                     className="px-6 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full shadow-lg shadow-indigo-900/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 text-[11px]"
                   >
                       <Zap size={14} fill="currentColor" />
                       <span className="tracking-wider uppercase">自动消解冲突</span>
                   </button>
                   <button 
                     onClick={() => setStep('SIMULATING')}
                     disabled={step !== 'RESOLVED'}
                     className="px-6 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-full shadow-lg shadow-cyan-900/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 text-[11px]"
                   >
                       <Play size={14} fill="currentColor" />
                       <span className="tracking-wider uppercase">验证演示</span>
                   </button>
               </div>
           </div>

           {/* Event Log Terminal */}
           <div className="h-40 bg-[#020205] border border-slate-800 rounded-lg p-3 font-mono text-[10px] overflow-hidden flex flex-col shadow-inner">
               <div className="text-slate-600 border-b border-slate-800 pb-1.5 mb-1.5 flex justify-between items-center uppercase font-black tracking-widest">
                   <div className="flex items-center gap-2"><Terminal size={14} /> conflict_solver_core_v1.0</div>
                   <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div> KERNEL_HEALTH_OK</div>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                   {logs.map((log, i) => (
                       <div key={i} className={`flex gap-3 leading-relaxed transition-all duration-300 ${log.includes('!!') ? 'text-red-400 font-bold bg-red-900/10' : 'text-slate-400 hover:text-indigo-300'}`}>
                           <span className="text-slate-700">[{logs.length - i}]</span>
                           <span>{log}</span>
                       </div>
                   ))}
               </div>
           </div>
        </div>

        {/* --- RIGHT: Intelligence & Metrics --- */}
        <div className="w-[360px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="智能决策推荐报告" subtitle="ANALYSIS" className="flex-1 border-indigo-900/30 bg-indigo-950/5">
               <div className="flex flex-col h-full gap-4">
                   <div className="p-4 bg-indigo-900/20 border border-indigo-800/30 rounded flex items-start gap-4 group">
                       <BrainCircuit size={48} className="text-indigo-500 shrink-0 mt-1 animate-pulse" />
                       <div className="flex-1">
                           <div className="text-xs font-black text-indigo-200 mb-2 flex items-center gap-2 uppercase tracking-widest">
                               <Cpu size={12}/> AI Analysis Outcome
                           </div>
                           <p className="text-[11px] text-slate-300 leading-relaxed italic relative z-10">
                              "{aiAnalysis}"
                           </p>
                       </div>
                   </div>

                   <div className="mt-auto space-y-3">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-2">
                           <span>Efficiency Gain</span>
                           <TrendingUp size={12} className="text-indigo-500"/>
                       </div>
                       <div className="space-y-2 px-1">
                          <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">预计平均等待时长</span>
                              <span className="text-green-400 font-bold uppercase font-mono">0.2h</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">备件周转协调率</span>
                              <span className="text-white font-mono font-bold">HIGH (94%)</span>
                          </div>
                       </div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded text-[10px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/30 group">
                            <ClipboardCheck size={14} className="group-hover:rotate-12 transition-transform" /> 签发最终工序包
                        </button>
                        <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded border border-slate-700 transition-all">
                            <Share2 size={14} />
                        </button>
                      </div>
                   </div>
               </div>
           </SciFiCard>
        </div>
      </div>
    </div>
  );
};

function ClipboardCheck(props: any) {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="m9 14 2 2 4-4"></path></svg>;
}
