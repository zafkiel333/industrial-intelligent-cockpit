
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/cross-system/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-46]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-46';
import { JointScenario, JointMetrics } from '../../components/maintenance/cross-system/three-types';
import { 
  GitMerge, Activity, Zap, ShieldCheck, 
  Cpu, Workflow, Layers, Share2, 
  Terminal, BarChart3, Radio, Database,
  TrendingUp, Play, RotateCcw, AlertTriangle,
  Users, MessageSquare, ChevronRight, LayoutGrid,
  FileText, ClipboardCheck, Network, BrainCircuit
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  BarChart, Bar, Cell
} from 'recharts';

// --- 模拟数据 ---
const SYSTEM_ROSTER = [
  { id: 'SYS-PWR', name: '动力能源系统', status: 'Optimal', health: 98, load: 42, color: 'text-cyan-400' },
  { id: 'SYS-HYD', name: '液压动力单元', status: 'Warning', health: 74, load: 88, color: 'text-orange-400' },
  { id: 'SYS-CTRL', name: '总控逻辑系统', status: 'Active', health: 100, load: 15, color: 'text-indigo-400' },
  { id: 'SYS-EXEC', name: '执行终端矩阵', status: 'Normal', health: 92, load: 35, color: 'text-emerald-400' },
];

const COLLAB_LOGIC_TREE = [
  { node: '主控指令', status: 'Synced', children: ['动力响应', '液压补偿'] },
  { node: '安全回路', status: 'Locked', children: ['人员定位', '能量隔离'] },
  { node: '反馈回路', status: 'Active', children: ['多端映射'] },
];

const PERFORMANCE_RADAR = [
  { subject: '数据一致性', A: 95, fullMark: 100 },
  { subject: '延迟控制', A: 88, fullMark: 100 },
  { subject: '解耦程度', A: 82, fullMark: 100 },
  { subject: '容错能力', A: 90, fullMark: 100 },
  { subject: '资源并发', A: 75, fullMark: 100 },
];

export const CrossSystemJointMaintView: React.FC = () => {
  const [scenario, setScenario] = useState<JointScenario>('POWER_SYNC');
  const [aiReport, setAiReport] = useState('正在初始化全域协同评估引擎...');
  const [logs, setLogs] = useState<string[]>(['[Kernel] 跨系统协同内核 v4.0 启动...', '[Network] 已建立多端加密孪生隧道']);
  const [metrics, setMetrics] = useState<JointMetrics>({ syncRate: 98.4, latency: 12, conflictIndex: 0.05, stability: 99 });

  // AI 推理生成 (Gemini)
  useEffect(() => {
    const fetchAIAnalysis = async () => {
      setAiReport('AI 专家正在评估跨系统耦合风险与协作路径...');
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `作为一个工业数字化专家。
        当前正在进行“跨系统设备联合维修协同仿真”。
        当前场景：${scenario}。
        系统状态：动力(98%)，液压(74%)，控制(100%)。
        请针对跨系统协同过程中可能出现的“数据竞争”或“物理干涉”给出 3 条硬核建议。
        要求：中文，专业，每条建议 30 字以内。`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt
        });
        setAiReport(response.text || '分析建议生成失败。');
      } catch (err) {
        setAiReport('AI 指挥链路受限。建议：优先确保控制层与液压层在“零压差”状态下的信号同步，防止负载冲击。');
      }
    };
    fetchAIAnalysis();
  }, [scenario]);

  const addLog = (msg: string) => {
    const timeStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setLogs(prev => [`[${timeStr}] ${msg}`, ...prev.slice(0, 10)]);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#02040a] p-2 relative overflow-hidden">
      
      {/* --- HEADER: Tactical Command HUD --- */}
      <div className="flex items-center justify-between z-10 bg-slate-900/60 border border-slate-800 p-4 rounded-lg backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-sm flex items-center justify-center border-2 border-cyan-500 bg-cyan-600/20 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
             <Network size={32} className="text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               Cross-System Synergetic Intelligence / Nexus
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
               跨系统设备 <span className="text-cyan-500">联合维修协同仿真中心</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center border-l border-slate-800 pl-8 h-12">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Co-Sim Fidelity</div>
                <div className="text-3xl font-mono font-black text-white">99.8<span className="text-sm font-normal text-slate-600">%</span></div>
            </div>
             <div className="text-right border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Sync Latency</div>
                <div className="text-3xl font-mono font-black text-green-400">{metrics.latency}<span className="text-sm font-normal text-slate-600">ms</span></div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* --- LEFT: System Roster --- */}
        <div className="w-[320px] flex flex-col gap-4">
           <SciFiCard title="子系统联动矩阵" subtitle="SYSTEM ROSTER" className="flex-1 border-slate-800 bg-[#0c0e14]/90">
              <div className="flex flex-col gap-3 mt-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                 {SYSTEM_ROSTER.map((sys) => (
                    <div key={sys.id} className="p-3 rounded border border-slate-800 bg-slate-900/40 hover:border-cyan-500/50 transition-all group">
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-[10px] font-mono text-slate-500">{sys.id}</span>
                           <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${sys.status === 'Warning' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                              {sys.status.toUpperCase()}
                           </span>
                        </div>
                        <h4 className={`text-sm font-bold ${sys.color} mb-1`}>{sys.name}</h4>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                           <div className="flex flex-col">
                              <span>Health Index</span>
                              <span className="text-white font-mono font-bold">{sys.health}%</span>
                           </div>
                           <div className="flex flex-col text-right">
                              <span>Compute Load</span>
                              <span className="text-white font-mono font-bold">{sys.load}%</span>
                           </div>
                        </div>
                        <div className="w-full h-0.5 bg-slate-800 mt-2 overflow-hidden rounded-full">
                           <div className="h-full bg-cyan-500 transition-all duration-1000" style={{width: `${sys.health}%`}}></div>
                        </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="资源并发调度" subtitle="RESOURCE CONCURRENCY" className="h-[240px] border-slate-800">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={Array.from({length: 20}, (_, i) => ({t: i, v: 40 + Math.sin(i)*20 + Math.random()*10}))}>
                           <defs>
                               <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis hide />
                           <YAxis hide domain={[0, 100]} />
                           <Area type="monotone" dataKey="v" stroke="#0ea5e9" fill="url(#areaGrad)" strokeWidth={2} isAnimationActive={false} />
                       </AreaChart>
                   </ResponsiveContainer>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                      <div className="text-3xl font-black text-white font-mono">0.82</div>
                      <div className="text-[10px] text-slate-500 uppercase">Load Balance Factor</div>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: Main 3D Synergetic twin --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           <div className="flex-1 bg-black border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,0,0,1)] group">
               {/* 3D Scene */}
               <ThreeScene scenario={scenario} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Overlay HUD Components */}
               <div className="absolute top-6 left-6 pointer-events-none z-20 flex flex-col gap-4">
                   <div className="bg-slate-950/80 backdrop-blur border-l-4 border-cyan-500 p-4 rounded-sm shadow-xl flex flex-col border border-slate-800">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Activity size={14} className="animate-pulse" /> Simulation Kernel Active
                       </div>
                       <div className="text-3xl font-black text-white italic tracking-tighter uppercase">
                          SCENARIO: {scenario.replace('_', ' ')}
                       </div>
                   </div>
               </div>

               {/* Tactical Scrubber / Action Dock */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-6 bg-slate-900/90 p-4 rounded-full border border-slate-700 shadow-2xl backdrop-blur-xl scale-110">
                   <div className="flex gap-3 px-2">
                        <button 
                          onClick={() => {setScenario('POWER_SYNC'); addLog('协同重置：全系统进入基准态');}}
                          className="p-2.5 bg-slate-800 hover:bg-cyan-600 rounded-full text-slate-400 hover:text-white transition-all shadow-inner" 
                          title="Reset Simulation"
                        >
                          <RotateCcw size={20}/>
                        </button>
                        <button className="p-2.5 bg-slate-800 hover:bg-cyan-600 rounded-full text-slate-400 hover:text-white transition-all shadow-inner" title="Global Snapshot"><Share2 size={20}/></button>
                   </div>
                   <div className="w-[1px] h-8 bg-slate-700 mx-1"></div>
                   <div className="flex gap-2">
                      {['POWER_SYNC', 'HYDRAULIC_BAL', 'LOGIC_OVERRIDE'].map(s => (
                        <button 
                          key={s}
                          onClick={() => {setScenario(s as any); addLog(`切换演练分支：${s}`);}}
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                            ${scenario === s ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}
                          `}
                        >
                          {s.split('_')[0]}
                        </button>
                      ))}
                   </div>
                   <div className="w-[1px] h-8 bg-slate-700 mx-1"></div>
                   <button className="px-10 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-full shadow-lg shadow-indigo-900/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95">
                       <Play size={18} fill="currentColor" />
                       <span className="tracking-widest uppercase text-xs">Run Joint Sim</span>
                   </button>
               </div>
           </div>

           {/* Event Bus Log (Terminal Style) */}
           <div className="h-40 bg-[#020205] border border-slate-800 rounded-lg p-3 font-mono text-[10px] overflow-hidden flex flex-col shadow-inner">
               <div className="text-slate-600 border-b border-slate-800 pb-1.5 mb-1.5 flex justify-between items-center uppercase font-black tracking-widest">
                   <div className="flex items-center gap-2"><Terminal size={14} /> global_event_bus_stream_v4.0</div>
                   <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div> REAL-TIME SYNC</div>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                   {logs.map((log, i) => (
                       <div key={i} className={`flex gap-3 leading-relaxed transition-all duration-300 ${log.includes('!!') ? 'text-red-400 font-bold bg-red-900/10' : 'text-slate-400 hover:text-cyan-300'}`}>
                           <span className="text-slate-800">[{logs.length - i}]</span>
                           <span>{log}</span>
                       </div>
                   ))}
               </div>
               <div className="animate-pulse text-cyan-500 mt-1">_</div>
           </div>
        </div>

        {/* --- RIGHT: Analytics & Logic --- */}
        <div className="w-[360px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="协同效能雷达" subtitle="KPI ANALYSIS" className="h-[280px] border-slate-800 bg-[#0c0e14]/90">
                <div className="w-full h-full p-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={PERFORMANCE_RADAR}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Co-Sim" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.4} />
                            <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#0ea5e9'}} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
           </SciFiCard>

           <SciFiCard title="Gemini 协同决策分析" subtitle="AI REASONING" className="flex-1 border-indigo-900/30 bg-indigo-950/5">
               <div className="flex flex-col h-full gap-4">
                   <div className="p-4 bg-indigo-900/20 border border-indigo-800/30 rounded flex items-start gap-4 group">
                       <BrainCircuit size={48} className="text-indigo-500 shrink-0 mt-1 animate-pulse" />
                       <div className="flex-1">
                           <div className="text-xs font-black text-indigo-200 mb-2 flex items-center gap-2 uppercase tracking-widest">
                               <Cpu size={12}/> AI Analysis Outcome
                           </div>
                           <p className="text-[11px] text-slate-300 leading-relaxed italic relative z-10">
                              "{aiReport}"
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3 mt-auto">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-2">
                           <span>Joint Logic Mapping</span>
                           <Workflow size={12} className="text-indigo-500"/>
                       </div>
                       <div className="flex flex-col gap-2">
                          {COLLAB_LOGIC_TREE.map((node, i) => (
                              <div key={i} className="flex items-center justify-between p-2 bg-slate-900/60 border border-slate-800 rounded">
                                  <div className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                      <span className="text-xs text-slate-300 font-bold">{node.node}</span>
                                  </div>
                                  <div className="flex gap-1">
                                      {node.children.map(c => (
                                          <span key={c} className="text-[8px] bg-indigo-900/30 text-indigo-300 px-1 border border-indigo-800/50 rounded">{c}</span>
                                      ))}
                                  </div>
                              </div>
                          ))}
                       </div>
                      <div className="flex gap-2 mt-2">
                        <button className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded text-[10px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/30 group">
                            <ClipboardCheck size={14} className="group-hover:rotate-12 transition-transform" /> 批准联合方案
                        </button>
                        <button className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded border border-slate-700 transition-all">
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
