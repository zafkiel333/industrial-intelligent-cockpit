
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/hydro-return/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-43]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-43';
import { ReturnPhase, SyncMetrics } from '../../components/maintenance/hydro-return/three-types';
import { 
  Zap, Activity, ShieldCheck, Clock, 
  RotateCw, Gauge, Cpu, Workflow,
  CheckCircle2, AlertTriangle, FileText,
  Play, RotateCcw, ArrowRight, Share2,
  Terminal, BarChart3, Radio, Database,
  TrendingUp, Power, History, BrainCircuit
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell, Legend, LineChart, Line, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---
const SYNC_WAVE_DATA = Array.from({length: 50}, (_, i) => {
    const t = i * 0.2;
    return {
        t,
        grid: Math.sin(t),
        unit: Math.sin(t * 0.98 + 0.2) // Out of sync initially
    };
});

const RETURN_SOP = [
  { id: 'COLD_CHECK', label: '冷态系统首检', time: '15m', desc: '电气绝缘测量与回路完整性静态校验。' },
  { id: 'PRESSURE_BUILD', label: '建立润滑油压', time: '10m', desc: '启动高压抗燃油泵，建立支承油膜及调节压油。' },
  { id: 'SPEED_RAMP', label: '转速爬升程序', time: '30m', desc: '开启导叶，机组从静止加速至额定转速 (75rpm)。' },
  { id: 'EXCITATION', label: '励磁自励起压', time: '5m', desc: '投入励磁变与AVR，发电机端电压升至额定值。' },
  { id: 'GRID_SYNC', label: '并网相位捕获', time: '3m', desc: '自动准同期装置捕捉电网相角，执行合闸指令。' },
  { id: 'LOAD_RAMP', label: '负荷快速加载', time: '20m', desc: '机组进入AGC控制，按 50MW/min 速率增至满载。' },
];

const RESOURCE_LOAD = [
  { subject: '调度优先级', A: 95, fullMark: 100 },
  { subject: '操作合规性', A: 100, fullMark: 100 },
  { subject: '机械稳定性', A: 82, fullMark: 100 },
  { subject: '热工裕度', A: 75, fullMark: 100 },
  { subject: '电网稳定性', A: 90, fullMark: 100 },
];

export const HydroRapidReturnView: React.FC = () => {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [syncMetrics, setSyncMetrics] = useState<SyncMetrics>({ frequency: 49.5, voltage: 17.2, phaseAngle: 42, vibration: 0.02 });
  const [aiReport, setAiReport] = useState('正在初始化快速复役辅助决策引擎...');
  const [logs, setLogs] = useState<string[]>(['[System] 复役仿真环境加载完成', '[Asset] 载入 G-02 混流式机组数字档案']);
  const [timer, setTimer] = useState(4800); // 80 mins countdown

  const currentStep = RETURN_SOP[phaseIdx];
  const phase = currentStep.id as ReturnPhase;

  // AI Reasoning with Gemini
  useEffect(() => {
    const fetchAIAnalysis = async () => {
      setAiReport('AI 正在评估当前水力参数与电网调频需求...');
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `作为一个水电站运行专家。当前机组正处于快速复役阶段：${currentStep.label}。
        当前参数：频率 ${syncMetrics.frequency}Hz, 电压 ${syncMetrics.voltage}kV, 振动 ${syncMetrics.vibration}mm。
        电网调峰需求极其迫切。请给出 3 条硬核的技术操作建议，确保复役安全且快速。要求中文，专业。`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt
        });
        setAiReport(response.text || '分析报告生成失败。');
      } catch (err) {
        setAiReport('AI 决策链路延迟。本地建议：密切监测 3# 推力瓦温升速率，必要时开启强制水冷。');
      }
    };
    fetchAIAnalysis();
  }, [phaseIdx]);

  // Simulation Data Dynamics
  useEffect(() => {
    const interval = setInterval(() => {
        setSyncMetrics(prev => ({
            frequency: Math.min(50, prev.frequency + 0.01),
            voltage: Math.min(18, prev.voltage + 0.02),
            phaseAngle: Math.max(0, prev.phaseAngle - 0.5),
            vibration: 0.02 + (phaseIdx * 0.01) + Math.random() * 0.01
        }));
        if (timer > 0) setTimer(t => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phaseIdx]);

  const addLog = (msg: string) => {
    const timeStr = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${timeStr}] ${msg}`, ...prev.slice(0, 10)]);
  };

  const handleNext = () => {
      if (phaseIdx < RETURN_SOP.length - 1) {
          setPhaseIdx(prev => prev + 1);
          addLog(`>>> 阶段推进：进入 ${RETURN_SOP[phaseIdx + 1].label}`);
      }
  };

  const formatSecs = (s: number) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col gap-3 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 relative overflow-hidden">
      
      {/* --- HEADER: Tactical Control HUD --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-indigo-900/30 p-3 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600/20 border-2 border-indigo-500 rounded flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>
             <Power size={28} className="text-indigo-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-indigo-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               High-Availability Recovery / G-02
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
               水电站设备 <span className="text-indigo-500">快速复役维修仿真</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">SLA Countdown</div>
                <div className={`text-2xl font-mono font-black ${timer < 600 ? 'text-red-500 animate-pulse' : 'text-orange-400'}`}>
                    {formatSecs(timer)}
                </div>
            </div>
             <div className="h-8 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Return Readiness</div>
                <div className="text-2xl font-mono font-black text-green-400">
                    {((phaseIdx + 1) / RETURN_SOP.length * 100).toFixed(0)}%
                </div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 z-10">
        
        {/* --- LEFT: Process & Controls --- */}
        <div className="w-full lg:w-[280px] flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="复役工序指令" subtitle="SOP" className="flex-1 border-indigo-900/30 bg-[#0c0e14]/90">
              <div className="flex flex-col gap-2 mt-1 h-full">
                 {RETURN_SOP.map((step, i) => {
                     const active = i === phaseIdx;
                     const done = i < phaseIdx;
                     return (
                         <div 
                           key={step.id}
                           className={`p-2 rounded border transition-all relative overflow-hidden group
                             ${active ? 'bg-indigo-900/30 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 
                               done ? 'bg-slate-900/40 border-green-800 opacity-60' : 'bg-slate-900/40 border-slate-800 text-slate-500'}
                           `}
                         >
                             {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}
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

           <SciFiCard title="并网同步特性" subtitle="GRID SYNC" className="h-[200px] border-slate-800">
               <div className="w-full h-full p-1 relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={SYNC_WAVE_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="t" hide />
                          <YAxis hide domain={[-1.5, 1.5]} />
                          <Line type="monotone" dataKey="grid" stroke="#64748b" strokeWidth={1} dot={false} name="Grid Phase" isAnimationActive={false} />
                          <Line type="monotone" dataKey="unit" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Unit Phase" isAnimationActive={false} className="animate-pulse" />
                      </LineChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1 right-1 text-[8px] text-indigo-300 font-mono bg-indigo-950/50 px-1 rounded">
                      Δ: {syncMetrics.phaseAngle.toFixed(1)}°
                  </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Visualization Area --- */}
        <div className="flex-1 flex flex-col gap-3 relative">
           
           <div className="flex-1 bg-black border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_80px_rgba(0,0,0,1)] group">
               {/* 3D Scene */}
               <ThreeScene phase={phase} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Overlay HUD - Compact corner layout */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                   <div className="bg-slate-950/80 backdrop-blur border-l-2 border-indigo-500 p-2 rounded-sm shadow-xl flex flex-col border border-slate-800 max-w-[180px]">
                       <div className="text-[8px] text-indigo-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-1">
                           <Activity size={10} className="animate-pulse" /> DYNAMIC_TWIN
                       </div>
                       <div className="text-sm font-black text-white italic truncate uppercase">
                           {phase.replace('_', ' ')}
                       </div>
                   </div>

                   <div className="bg-slate-950/80 backdrop-blur border border-slate-800 p-2 rounded flex flex-col gap-1 min-w-[150px]">
                      <div className="text-[8px] text-slate-500 uppercase font-black">Telemetry</div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 font-mono text-[10px] font-bold text-white">
                         <span className="text-slate-500">SPD:</span> <span className="text-cyan-400">{phaseIdx > 1 ? '75.0 rpm' : '0.0 rpm'}</span>
                         <span className="text-slate-500">VIB:</span> <span className={syncMetrics.vibration > 0.1 ? 'text-red-400' : 'text-green-400'}>{syncMetrics.vibration.toFixed(3)}</span>
                         <span className="text-slate-500">OIL:</span> 16.5 MPa
                      </div>
                   </div>
               </div>

               {/* Action Control Dock - Slimmer and more transparent */}
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/80 p-2 rounded-full border border-slate-700 shadow-2xl backdrop-blur-md">
                   <div className="flex gap-2 px-1">
                        <button className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-full text-slate-400 hover:text-white transition-all shadow-inner" title="Reset Simulation"><RotateCcw size={16}/></button>
                        <button className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-full text-slate-400 hover:text-white transition-all shadow-inner" title="Sync Logs"><Database size={16}/></button>
                   </div>
                   <div className="w-[1px] h-6 bg-slate-700 my-auto mx-1"></div>
                   <button 
                     onClick={handleNext}
                     disabled={phaseIdx === RETURN_SOP.length - 1}
                     className="px-8 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-full shadow-lg shadow-indigo-900/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                   >
                       <Play size={16} fill="currentColor" />
                       <span className="text-[10px] tracking-widest uppercase font-bold">推进复役工序</span>
                   </button>
               </div>
           </div>

           {/* Event Log Terminal - Shorter height */}
           <div className="h-32 bg-[#020205] border border-slate-800 rounded-lg p-2 font-mono text-[9px] overflow-hidden flex flex-col shadow-inner">
               <div className="text-slate-600 border-b border-slate-800 pb-1 mb-1 flex justify-between items-center uppercase font-black tracking-widest">
                   <div className="flex items-center gap-2"><Terminal size={12} /> restart_kernel_v4.2</div>
                   <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse"></div> SYNC_OK</div>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0.5 pr-1">
                   {logs.map((log, i) => (
                       <div key={i} className={`flex gap-2 leading-tight transition-all duration-300 ${log.includes('!!') ? 'text-red-400 font-bold bg-red-900/10' : 'text-slate-500 hover:text-indigo-300'}`}>
                           <span className="text-slate-800">[{logs.length - i}]</span>
                           <span>{log}</span>
                       </div>
                   ))}
               </div>
               <div className="text-indigo-500 mt-0.5 animate-pulse">_</div>
           </div>
        </div>

        {/* --- RIGHT: Performance & AI --- */}
        <div className="w-full lg:w-[300px] flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="复役效能评估" subtitle="KPI" className="h-[240px] border-indigo-900/30 bg-[#0c0e14]/90">
               <div className="w-full h-full p-1 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="65%" data={RESOURCE_LOAD}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 8 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Unit" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.3} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="AI 辅助决策" subtitle="AI" className="flex-1 border-indigo-900/20 bg-indigo-950/5">
               <div className="flex flex-col h-full gap-2">
                   <div className="p-2 bg-indigo-900/10 border border-indigo-900/30 rounded-lg relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-1 opacity-10">
                           <BrainCircuit size={32} className="text-indigo-500" />
                       </div>
                       <div className="flex items-center gap-1.5 mb-1">
                           <Cpu size={12} className="text-indigo-400" />
                           <span className="text-[8px] font-bold text-indigo-200 uppercase tracking-tighter">Gemini Intelligence</span>
                       </div>
                       <p className="text-[9px] text-slate-300 leading-relaxed italic">
                          "{aiReport}"
                       </p>
                   </div>

                   <div className="mt-auto space-y-2">
                      <div className="flex justify-between items-center text-[8px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-1">
                           <span>Readiness</span>
                           <TrendingUp size={10} className="text-green-500"/>
                       </div>
                       <div className="space-y-1">
                          <div className="flex justify-between text-[9px]">
                              <span className="text-slate-400">电网同步预测</span>
                              <span className="text-green-400 font-bold uppercase">Optimal</span>
                          </div>
                          <div className="flex justify-between text-[9px]">
                              <span className="text-slate-400">时间轴偏移</span>
                              <span className="text-white font-mono">-4.2s</span>
                          </div>
                       </div>
                      <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded text-[10px] flex items-center justify-center gap-2 border border-slate-700 group transition-all">
                          <Share2 size={14} className="group-hover:rotate-12 transition-transform" /> 汇报至省调中心
                      </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
