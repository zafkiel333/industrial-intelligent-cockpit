import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/mining-conflict/ThreeScene';
import { ConflictState, ProcessNode } from '../../components/maintenance/mining-conflict/three-types';
import { 
  GitCommit, AlertTriangle, ShieldAlert, Cpu, 
  Zap, Clock, Target, Layers, 
  Play, RotateCcw, ShieldCheck, TrendingUp,
  BrainCircuit, LayoutGrid, ListFilter,
  FileText, Activity, Workflow, Share2,
  Users, Terminal, Gavel, ArrowRight, CheckCircle2
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  BarChart, Bar, Cell, ComposedChart, Line
} from 'recharts';

// --- MOCK DATA ---
const CONFLICT_LIST = [
  { id: 'C01', type: 'SPATIAL', title: '空间干涉：驱动部 vs 卸料槽', level: 'HIGH', impact: '无法同时展开', team: '机+电' },
  { id: 'C02', type: 'RESOURCE', title: '资源抢夺：250t 桥机占用', level: 'MEDIUM', impact: '导致 G2 顺延', team: '起重组' },
  { id: 'C03', type: 'LOGIC', title: '逻辑冲突：绝缘测试前置未完成', level: 'CRITICAL', impact: '安全风险', team: '电气组' },
];

const RESOURCE_LOAD = [
  { name: '机械班组', value: 85, fill: '#f59e0b' },
  { name: '电气班组', value: 42, fill: '#3b82f6' },
  { name: '起重资源', value: 98, fill: '#ef4444' },
  { name: '安全监护', value: 70, fill: '#10b981' },
];

const EFFICIENCY_TREND = Array.from({length: 10}, (_, i) => ({
    time: i,
    before: 60 + Math.random() * 10,
    after: 85 + Math.random() * 10
}));

export const MiningConflictResolutionView: React.FC = () => {
  const [state, setState] = useState<ConflictState>('ANALYZING');
  const [logs, setLogs] = useState<string[]>(['[Kernel] 冲突检测算法 v3.2 加载完成...', '[Info] 正在扫描全矿山维修工序包...']);
  const [aiReport, setAiReport] = useState('正在利用 AI 调度引擎评估工序冲突...');

  // AI Reasoning Logic
  useEffect(() => {
    const fetchAIAnalysis = async () => {
      if (state === 'CONFLICT_FOUND') {
        setAiReport('工业智能核心正在计算最优消解路径，权衡停机成本与施工风险...');
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `作为一个矿山调度专家。当前存在 3 个维修冲突：
          1. 空间冲突：驱动部与卸料槽维修区域重叠。
          2. 资源冲突：两组均需使用唯一的桥机。
          3. 逻辑冲突：电气组在机械加固前尝试进行带电测试。
          请给出一条硬核的消解策略，要求包含优先级排序和资源错峰建议。中文，工程化语言。`;
          
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
          });
          setAiReport(response.text || '分析报告生成失败。');
        } catch (err) {
          setAiReport('AI 决策链路受干扰。建议本地策略：优先级 A > B > C，桥机优先保障关键路径 G2。');
        }
      }
    };
    fetchAIAnalysis();
  }, [state]);

  // Simulation Stages
  useEffect(() => {
    if (state === 'ANALYZING') {
      const timer = setTimeout(() => {
        setState('CONFLICT_FOUND');
        addLog('!! 警报：检测到 3 处关键路径干涉点');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 8)]);
  };

  const runResolution = () => {
    setState('RESOLVING');
    addLog('>> 执行 AI 自动消解算法...');
    setTimeout(() => {
        setState('OPTIMIZED');
        addLog('>> 消解成功。工期缩短 14.5%，资源利用率提升 22%');
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#02040a] p-2 relative overflow-hidden">
      
      {/* 战术装饰层 */}
      <div className="absolute inset-0 pointer-events-none opacity-5 tech-grid-bg"></div>

      {/* --- HEADER: Tactical Control HUD --- */}
      <div className="flex items-center justify-between z-10 bg-slate-900/60 border border-slate-800 p-4 rounded-lg backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded flex items-center justify-center border-2 transition-all duration-700
            ${state === 'CONFLICT_FOUND' ? 'bg-red-600/20 border-red-500 animate-pulse' : 'bg-indigo-600/20 border-indigo-500 text-indigo-400'}
          `}>
             <Gavel size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-indigo-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               Maintenance Strategy Optimizer / Kernel 4.2
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
               矿山装备维修 <span className="text-indigo-500">工序冲突消解模拟</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center border-l border-slate-800 pl-8 h-12">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Conflicts</div>
                <div className={`text-3xl font-mono font-black ${state === 'CONFLICT_FOUND' ? 'text-red-500' : 'text-green-400'}`}>
                    {state === 'CONFLICT_FOUND' ? '03' : '00'}
                </div>
            </div>
             <div className="text-right border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Wait Time Reduced</div>
                <div className="text-3xl font-mono font-black text-cyan-400">14.5<span className="text-sm">%</span></div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Conflict Tracker & Resource Load --- */}
        <div className="w-[320px] flex flex-col gap-4">
           <SciFiCard title="当前干涉分析列表" subtitle="CONFLICTS" className="flex-1 border-slate-800 bg-[#0c0e14]/90">
              <div className="flex flex-col gap-3 mt-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                 {CONFLICT_LIST.map((c) => (
                    <div key={c.id} className={`p-3 rounded border transition-all relative overflow-hidden group
                        ${state === 'OPTIMIZED' ? 'bg-green-950/20 border-green-900/50 opacity-40' : 
                          c.level === 'HIGH' || c.level === 'CRITICAL' ? 'bg-red-950/20 border-red-500/50' : 'bg-slate-900/40 border-slate-800'}
                    `}>
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-[10px] font-mono text-slate-500">{c.id} / {c.type}</span>
                           <span className={`text-[8px] font-black px-1.5 py-0.5 rounded
                              ${c.level === 'CRITICAL' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}
                           `}>{c.level}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{c.title}</h4>
                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                           <span className="flex items-center gap-1"><Users size={10} /> {c.team}</span>
                           <span className="italic">{c.impact}</span>
                        </div>
                    </div>
                 ))}
                 
                 {state === 'OPTIMIZED' && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                        <CheckCircle2 size={48} className="text-green-500 mb-2" />
                        <h4 className="text-white font-bold">所有冲突已消解</h4>
                        <p className="text-[10px] text-slate-400 mt-1">方案已进入仿真待执行阶段</p>
                    </div>
                 )}
              </div>
           </SciFiCard>

           <SciFiCard title="资源实时负载" subtitle="LOAD" className="h-[240px] border-slate-800">
               <div className="w-full h-full p-1">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={RESOURCE_LOAD} layout="vertical" margin={{left: -20}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                           <XAxis type="number" hide domain={[0, 100]} />
                           <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{fontSize: 10}} width={70} />
                           <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                               {RESOURCE_LOAD.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.fill} />
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
               <ThreeScene state={state} />

               {/* Overlay HUD Components */}
               <div className="absolute top-6 left-6 pointer-events-none z-20 flex flex-col gap-4">
                   <div className="bg-slate-950/80 backdrop-blur border-l-4 border-indigo-500 p-4 rounded-sm shadow-xl flex flex-col">
                       <div className="text-[10px] text-indigo-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Activity size={14} className="animate-pulse" /> Simulation Kernel Active
                       </div>
                       <div className="text-3xl font-black text-white italic tracking-tighter uppercase">
                          {state.replace('_', ' ')}
                       </div>
                   </div>
               </div>

               {/* Central Action Dock */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-3 rounded-full border border-slate-700 shadow-2xl backdrop-blur-xl scale-100">
                   <div className="flex gap-2 px-2">
                        <button 
                          onClick={() => {setState('ANALYZING'); addLog('系统重置，开始全域扫描');}}
                          className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-full text-slate-400 hover:text-white transition-all shadow-inner" 
                          title="Reset Engine"
                        >
                          <RotateCcw size={18}/>
                        </button>
                        <button className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-full text-slate-400 hover:text-white transition-all shadow-inner" title="Save Snapshot"><Share2 size={18}/></button>
                   </div>
                   <div className="w-[1px] h-6 bg-slate-700 my-auto mx-1"></div>
                   <button 
                     onClick={runResolution}
                     disabled={state !== 'CONFLICT_FOUND'}
                     className="px-6 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full shadow-lg shadow-indigo-900/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 text-[11px]"
                   >
                       <Zap size={14} fill="currentColor" />
                       <span className="tracking-wider uppercase">执行 AI 消解</span>
                   </button>
                   <button 
                     onClick={() => setState('SIMULATING')}
                     disabled={state !== 'OPTIMIZED'}
                     className="px-6 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-full shadow-lg shadow-cyan-900/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 text-[11px]"
                   >
                       <Play size={14} fill="currentColor" />
                       <span className="tracking-wider uppercase">启动模拟</span>
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

        {/* --- RIGHT: AI Insights & Efficiency --- */}
        <div className="w-[360px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="智能调度建议" subtitle="AI REASONING" className="flex-1 border-indigo-900/30 bg-indigo-950/5">
               <div className="flex flex-col h-full gap-4">
                   <div className="p-4 bg-indigo-900/20 border border-indigo-800/30 rounded flex items-start gap-4 group">
                       <BrainCircuit size={48} className="text-indigo-500 shrink-0 mt-1 animate-pulse" />
                       <div className="flex-1">
                           <div className="text-xs font-black text-indigo-200 mb-2 flex items-center gap-2 uppercase tracking-widest">
                               <Cpu size={12}/> AI Analysis Engine
                           </div>
                           <p className="text-[11px] text-slate-300 leading-relaxed italic relative z-10">
                              "{aiReport}"
                           </p>
                       </div>
                   </div>

                   <div className="mt-auto space-y-3">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-2">
                           <span>Decision Quality</span>
                           <TrendingUp size={12} className="text-indigo-500"/>
                       </div>
                       <div className="space-y-2 px-1">
                          <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">停机损失风险 (PLR)</span>
                              <span className="text-green-400 font-bold uppercase font-mono">0.024</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">备件周转协同度</span>
                              <span className="text-white font-mono font-bold">HIGH (92%)</span>
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
