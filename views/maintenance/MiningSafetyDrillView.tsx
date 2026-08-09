
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/mining-safety-drill/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-42]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-42';
import { DrillPhase, SafetyMetrics } from '../../components/maintenance/mining-safety-drill/three-types';
import { 
  ShieldAlert, Activity, Zap, Compass, 
  Wind, Clock, AlertTriangle, Play,
  RotateCcw, Info, ArrowRight, Gauge,
  Cpu, Thermometer, Droplets, UserCheck,
  LifeBuoy, Map, Siren, ChevronRight,
  Database, FileText, CheckCircle2,
  BarChart3, Scale, Layers, HardDrive,
  CheckSquare, Lock, Terminal, BrainCircuit,
  Workflow, Microscope, Lightbulb,
  ShieldCheck, AlertOctagon, TrendingUp
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell, Legend, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---
const SAFETY_STANDARDS = [
  { subject: '高压隔离', A: 100, fullMark: 100 },
  { subject: '防坠落布防', A: 85, fullMark: 100 },
  { subject: '气体监测', A: 95, fullMark: 100 },
  { subject: '工具冗余', A: 70, fullMark: 100 },
  { subject: '人员间距', A: 92, fullMark: 100 },
];

const GAS_HISTORY = Array.from({length: 20}, (_, i) => ({
    time: i,
    ch4: 0.15 + Math.random() * 0.05,
    co: 5 + Math.random() * 2
}));

const DRILL_SOP = [
  { id: 'PRE_CHECK', label: '作业前环境预检', desc: '利用边缘侧传感器检测巷道温湿度、有害气体浓度及顶板压力。' },
  { id: 'ISOLATION', label: '能量隔离 LOTO', desc: '执行高压动力源切断，并在物理隔离点实施机械锁闭与挂牌。' },
  { id: 'ZONE_SETUP', label: '安全域布防', desc: '建立以设备中心为圆心的 8 米半径警戒区，开启声光警示系统。' },
  { id: 'REPAIR_EXEC', label: '关键件拆换演练', desc: '模拟驱动部轴承更换，实时监控作业姿态与机械应力。' },
  { id: 'EMERGENCY', label: '突发灾害响应', desc: '模拟发生顶板冒落或瓦斯突涌时的紧急撤离与设备锁死路径。' },
];

export const MiningSafetyDrillView: React.FC = () => {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [metrics, setMetrics] = useState<SafetyMetrics>({ gasLevel: 0.18, stability: 98, compliance: 95, fatigue: 12 });
  const [aiAudit, setAiAudit] = useState('正在初始化 AI 安全审计引擎...');
  const [logs, setLogs] = useState<string[]>(['[Kernel] 安全仿真内核 V4.2 启动', '[Asset] 载入 WK-20 型电铲结构拓扑']);
  const [timer, setTimer] = useState(0);

  const currentStep = DRILL_SOP[phaseIdx];
  const phase = currentStep.id as DrillPhase;

  // AI Reasoning with Gemini
  useEffect(() => {
    const fetchAIAudit = async () => {
      setAiAudit('AI 正在评估当前作业阶段的规范性与潜在隐患...');
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `作为一个矿山安全专家。当前维修演练阶段：${currentStep.label}。
        实时数据：瓦斯 ${metrics.gasLevel}%, 结构稳定性 ${metrics.stability}%, 合规度 ${metrics.compliance}%。
        请针对该阶段给出 3 条专业且硬核的安全操作指令。要求中文，语言简练、工程化。`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt
        });
        setAiAudit(response.text || '审计报告生成失败。');
      } catch (err) {
        setAiAudit('AI 审计链路断开。本地策略提示：确保 LOTO 锁定点具备双重物理备份。');
      }
    };
    fetchAIAudit();
  }, [phaseIdx]);

  // Timer simulation
  useEffect(() => {
    const t = setInterval(() => setTimer(prev => prev + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 10)]);
  };

  const handleNext = () => {
      if (phaseIdx < DRILL_SOP.length - 1) {
          setPhaseIdx(prev => prev + 1);
          addLog(`进入下一阶段：${DRILL_SOP[phaseIdx + 1].label}`);
      }
  };

  const formatTime = (s: number) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col gap-3 font-[Rajdhani] text-slate-200 bg-[#09090b] p-2 relative overflow-hidden">
      
      {/* --- HEADER: Tactical Command HUD --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-yellow-600/30 p-3 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-600/20 border-2 border-yellow-500 rounded flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-yellow-500/10 animate-pulse"></div>
             <ShieldAlert size={28} className="text-red-500 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-yellow-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               Safety-Critical Simulation / Realistic
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter">
               矿山装备维修 <span className="text-yellow-500 italic">安全演练仿真</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Safety Score</div>
                <div className="text-2xl font-mono font-black text-green-400">
                    {metrics.compliance}<span className="text-xs font-normal text-slate-600">/100</span>
                </div>
            </div>
             <div className="h-8 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Elapsed Time</div>
                <div className="text-2xl font-mono font-black text-white">{formatTime(timer)}</div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 z-10">
        
        {/* --- LEFT: SOP & Gear --- */}
        <div className="w-full lg:w-[280px] flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="演练科目" subtitle="SOP" className="flex-1 border-yellow-900/30 bg-[#0c0e14]/90">
              <div className="flex flex-col gap-2 mt-1 h-full">
                 {DRILL_SOP.map((step, i) => {
                     const active = i === phaseIdx;
                     const done = i < phaseIdx;
                     return (
                         <div 
                           key={step.id}
                           className={`p-2 rounded border transition-all relative overflow-hidden group
                             ${active ? 'bg-yellow-900/30 border-yellow-500' : 
                               done ? 'bg-slate-900/40 border-green-800 opacity-60' : 'bg-slate-900/40 border-slate-800 text-slate-500'}
                           `}
                         >
                             {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div>}
                             <div className="flex justify-between items-center">
                                <span className={`text-[11px] font-bold ${active ? 'text-white' : 'text-slate-500'}`}>{step.label}</span>
                                {done && <CheckCircle2 size={10} className="text-green-500" />}
                             </div>
                             {active && <p className="text-[9px] leading-tight text-slate-400 mt-1">{step.desc}</p>}
                         </div>
                     );
                 })}
              </div>
           </SciFiCard>

           <SciFiCard title="安全物料" subtitle="EQUIP" className="h-[180px] border-slate-800">
               <div className="grid grid-cols-3 gap-2">
                   {[
                       { name: '绝缘垫', icon: <Layers size={14}/> },
                       { name: '坠落索', icon: <LifeBuoy size={14}/> },
                       { name: '防爆灯', icon: <Lightbulb size={14}/> },
                       { name: 'LOTO锁', icon: <Lock size={14}/> },
                       { name: '急救包', icon: <ShieldCheck size={14}/> },
                       { name: '监测仪', icon: <Gauge size={14}/> },
                   ].map((item, i) => (
                       <div key={i} className="flex flex-col items-center justify-center p-1.5 bg-slate-900/50 border border-slate-800 rounded hover:border-yellow-500/50 cursor-pointer transition-all">
                           <div className="text-slate-500 mb-0.5">{item.icon}</div>
                           <span className="text-[8px] text-slate-400">{item.name}</span>
                       </div>
                   ))}
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Tactical Workspace --- */}
        <div className="flex-1 flex flex-col gap-3 relative">
           
           <div className="flex-1 bg-black border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_80px_rgba(0,0,0,1)] group">
               {/* 3D Scene */}
               <ThreeScene phase={phase} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Overlay HUD - Compressed and moved to top corner */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                   <div className="bg-slate-950/80 backdrop-blur border-l-2 border-yellow-500 p-2 rounded-sm shadow-xl flex flex-col border border-slate-800 max-w-[200px]">
                       <div className="text-[8px] text-yellow-500 font-bold uppercase tracking-widest flex items-center gap-1">
                           <Siren size={10} className="animate-pulse" /> SIM_ACTIVE
                       </div>
                       <div className="text-lg font-black text-white italic truncate">
                           {DRILL_SOP[phaseIdx].label}
                       </div>
                       <div className="flex items-center gap-2 mt-1 opacity-60">
                          <div className="flex items-center gap-1 text-[8px] text-slate-400"><Map size={10}/> SECTOR: S-4</div>
                          <div className="flex items-center gap-1 text-[8px] text-green-400 font-bold"><ShieldCheck size={10}/> SCAN: ON</div>
                       </div>
                   </div>
               </div>

               {/* Action Control Dock - Optimized to be smaller and less intrusive */}
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/80 p-2 rounded-full border border-slate-700 shadow-2xl backdrop-blur-md">
                   <div className="flex gap-2 px-1">
                        <button className="p-2 bg-slate-800 hover:bg-yellow-600 rounded-full text-slate-400 hover:text-black transition-all" title="Reset Simulation"><RotateCcw size={16}/></button>
                        <button className="p-2 bg-slate-800 hover:bg-yellow-600 rounded-full text-slate-400 hover:text-black transition-all" title="Report"><HardDrive size={16}/></button>
                   </div>
                   <div className="w-[1px] h-6 bg-slate-700 my-auto mx-1"></div>
                   <button 
                     onClick={handleNext}
                     className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-black rounded-full shadow-lg shadow-yellow-900/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                   >
                       <Play size={14} fill="currentColor" />
                       <span className="text-[10px] tracking-widest uppercase">执行下一步动作</span>
                   </button>
               </div>
           </div>

           {/* Event Log Terminal */}
           <div className="h-32 bg-[#020205] border border-slate-800 rounded-lg p-2 font-mono text-[9px] overflow-hidden flex flex-col shadow-inner">
               <div className="text-slate-600 border-b border-slate-800 pb-1 mb-1 flex justify-between items-center uppercase font-black tracking-widest">
                   <div className="flex items-center gap-2"><Terminal size={12} /> safety_audit_stream</div>
                   <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-yellow-500 animate-pulse"></div> SYNC_OK</div>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0.5 pr-1">
                   {logs.map((log, i) => (
                       <div key={i} className={`flex gap-2 leading-tight transition-all duration-300 ${log.includes('!!') ? 'text-red-400 font-bold bg-red-900/10' : 'text-slate-500 hover:text-yellow-300'}`}>
                           <span className="text-slate-800">[{logs.length - i}]</span>
                           <span>{log}</span>
                       </div>
                   ))}
               </div>
               <div className="text-yellow-500 mt-1 animate-pulse">_</div>
           </div>
        </div>

        {/* --- RIGHT: Risk Matrix & AI Expert --- */}
        <div className="w-full lg:w-[300px] flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="合规量化" subtitle="RADAR" className="h-[220px] border-yellow-900/30 bg-[#0c0e14]/90">
               <div className="w-full h-full p-1">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="65%" data={SAFETY_STANDARDS}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 8 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Drill" dataKey="A" stroke="#facc15" strokeWidth={2} fill="#facc15" fillOpacity={0.3} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="环境风险" className="h-[160px] border-slate-800">
               <div className="flex flex-col gap-2.5">
                   <div className="flex justify-between items-center text-[10px]">
                       <span className="flex items-center gap-1.5 text-slate-400"><Droplets size={10} className="text-cyan-400"/> CH4 Conc.</span>
                       <span className="font-mono text-white">{metrics.gasLevel}%</span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div className="bg-cyan-500 h-full w-[18%] shadow-[0_0_8px_#0ea5e9]"></div>
                   </div>

                   <div className="flex justify-between items-center text-[10px]">
                       <span className="flex items-center gap-1.5 text-slate-400"><Activity size={10} className="text-red-400"/> Rock Stress</span>
                       <span className="font-mono text-white">45.2 MPa</span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div className="bg-red-500 h-full w-[45%]"></div>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="AI 审计报告" subtitle="AI" className="flex-1 border-yellow-900/20 bg-yellow-950/5">
               <div className="flex flex-col h-full gap-2">
                   <div className="p-2 bg-yellow-900/10 border border-yellow-900/30 rounded-lg relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-1 opacity-10">
                           <BrainCircuit size={32} className="text-yellow-500" />
                       </div>
                       <div className="flex items-center gap-1.5 mb-1">
                           <Cpu size={12} className="text-yellow-400" />
                           <span className="text-[8px] font-bold text-yellow-200 uppercase tracking-tighter">Gemini Intelligence</span>
                       </div>
                       <p className="text-[9px] text-slate-300 leading-relaxed italic">
                          "{aiAudit}"
                       </p>
                   </div>

                   <div className="mt-auto space-y-2">
                      <div className="flex justify-between items-center text-[8px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-1">
                           <span>Readiness</span>
                           <TrendingUp size={10} className="text-green-500"/>
                       </div>
                       <div className="space-y-1">
                          <div className="flex justify-between text-[9px]">
                              <span className="text-slate-400">法规校验</span>
                              <span className="text-green-400 font-bold uppercase">Passed</span>
                          </div>
                          <div className="flex justify-between text-[9px]">
                              <span className="text-slate-400">操作偏差</span>
                              <span className="text-white font-mono">2.4%</span>
                          </div>
                       </div>
                      <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded text-[10px] flex items-center justify-center gap-2 border border-slate-700">
                          <CheckCircle2 size={14} /> 演练结果评估
                      </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
