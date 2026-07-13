import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/hydro-sequence/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-37]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-37';
import { SequencePhase, PartIntel } from '../../components/maintenance/hydro-sequence/three-types';
// Added missing RotateCcw and FileText imports to fix the "Cannot find name" errors on lines 227 and 301
import { 
  History, Clock, Zap, Box, Compass, 
  ArrowRight, ShieldCheck, Activity, Cpu, 
  Settings, ChevronRight, ListChecks, 
  PackageCheck, Info, AlertTriangle, 
  BarChart4, Database, Terminal, 
  Workflow, Microscope, Truck,
  RotateCcw, FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// --- MOCK DATA ---
const ACTIVE_PART: PartIntel = {
  id: 'TP- Francis-042',
  name: '700MW推力轴承瓦 (Babbitt Pad)',
  weight: '1.25 Tons',
  material: 'ASTM B23 Alloy 2',
  tolerance: '±0.005 mm',
  stock: 8
};

const SEQUENCE_STEPS: { id: SequencePhase; label: string; time: string; desc: string; risks: string[] }[] = [
  { id: 'LOGISTICS', label: '智能出库与物流', time: '10:00', desc: 'AGV将备件从恒温库转运至检修场。', risks: ['环境温差应力', '震动超标'] },
  { id: 'CRANE_PICKUP', label: '精密起吊挂装', time: '10:45', desc: '行车吊钩与专用吊梁完成刚性锁闭。', risks: ['载荷偏心', '平衡度偏离'] },
  { id: 'AIR_TRANSPORT', label: '空间避障吊运', time: '11:15', desc: '基于激光扫描点云规划动态避障路径。', risks: ['空间碰撞', '摇摆抑制'] },
  { id: 'ALIGNMENT', label: '数字化毫米级对位', time: '12:00', desc: '视觉引导系统自动识别销轴孔位。', risks: ['接触面划伤', '轴线偏离'] },
  { id: 'FASTENING', label: '标准化紧固程序', time: '13:30', desc: '数字扳手执行分级力矩锁紧并记录。', risks: ['预紧力不均'] },
  { id: 'COMMISSIONING', label: '全速试运校验', time: '15:00', desc: '动态油膜压力与温升补偿曲线验证。', risks: ['热失稳'] },
];

const RESOURCE_LOAD = [
  { subject: '起重资源', A: 85, fullMark: 100 },
  { subject: '钳工班组', A: 95, fullMark: 100 },
  { subject: '监测仪器', A: 100, fullMark: 100 },
  { subject: '厂房净空', A: 70, fullMark: 100 },
  { subject: '备件余量', A: 40, fullMark: 100 },
];

export const HydroSparePartsSequenceView: React.FC = () => {
  const [phase, setPhase] = useState<SequencePhase>('LOGISTICS');
  const [aiAnalysis, setAiAnalysis] = useState('正在利用 Gemini 引擎分析最佳更换时窗...');
  const [logs, setLogs] = useState<string[]>(['[System] 关键备件时序仿真器已启动', '[Asset] 载入 Francis 转轮 4# 瓦片档案']);
  const [progress, setProgress] = useState(0);

  const currentStep = SEQUENCE_STEPS.find(s => s.id === phase)!;

  // AI Analysis with Gemini
  useEffect(() => {
    const fetchAIAdvice = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `作为一个水电站维护专家。当前任务是更换“${ACTIVE_PART.name}”。
          工艺步骤：${currentStep.label}。
          潜在风险：${currentStep.risks.join(', ')}。
          请给出简短的专业操作建议和环境控制要求。要求中文，回答精炼。`,
          config: { temperature: 0.7 }
        });
        setAiAnalysis(response.text || '分析失败。');
      } catch (err) {
        setAiAnalysis('无法连接至决策辅助引擎。请检查API配置。');
      }
    };
    fetchAIAdvice();
  }, [phase]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 8)]);
  };

  const handleNext = () => {
      const idx = SEQUENCE_STEPS.findIndex(s => s.id === phase);
      if (idx < SEQUENCE_STEPS.length - 1) {
          const next = SEQUENCE_STEPS[idx + 1].id;
          setPhase(next);
          setProgress(((idx + 1) / (SEQUENCE_STEPS.length - 1)) * 100);
          addLog(`>>> 执行阶段切换: ${next}`);
      }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 relative overflow-hidden">
      
      {/* 科技背景背景装饰 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,_#3b82f6_0%,_transparent_60%)]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-blue-900/30 p-4 rounded-lg backdrop-blur-md z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-600/20 border-2 border-blue-500 rounded flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
             <Workflow size={32} className="text-blue-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-blue-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               Critical Asset Sequence Simulator / v2.1
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               水电站关键备件 <span className="text-blue-500 italic">更换时序模拟</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Simulation Reliability</div>
                <div className="text-3xl font-mono font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                    99.4<span className="text-sm font-normal text-slate-600">%</span>
                </div>
            </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Est. Downtime Saved</div>
                <div className="text-3xl font-mono font-black text-green-400">12.5 <span className="text-sm font-normal text-slate-600">Hrs</span></div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Process Timeline --- */}
        <div className="w-[360px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="更换工序时序" subtitle="TIMELINE" className="flex-1 border-blue-900/30 bg-[#0c0e14]/90">
              <div className="relative pl-4 space-y-4 mt-2">
                 <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800"></div>
                 {SEQUENCE_STEPS.map((step, idx) => {
                     const active = phase === step.id;
                     const past = SEQUENCE_STEPS.findIndex(s => s.id === phase) > idx;
                     return (
                         <div key={step.id} className={`relative transition-all duration-300 ${active ? 'opacity-100' : 'opacity-40'}`}>
                             <div className={`absolute -left-[24px] top-1 w-4 h-4 rounded-full border-2 
                                 ${active ? 'bg-blue-500 border-white shadow-[0_0_15px_#3b82f6]' : 
                                   past ? 'bg-green-500 border-green-800' : 'bg-slate-900 border-slate-700'}
                             `}></div>
                             <div 
                                onClick={() => {setPhase(step.id); addLog(`跳转至: ${step.label}`);}}
                                className={`p-3 rounded border cursor-pointer group transition-all
                                 ${active ? 'bg-blue-950/40 border-blue-500/50' : 'bg-slate-900/20 border-slate-800 hover:border-slate-600'}
                             `}>
                                 <div className="flex justify-between mb-1">
                                     <h4 className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-500'}`}>{step.label}</h4>
                                     <span className="text-[10px] font-mono text-slate-600">{step.time}</span>
                                 </div>
                                 {active && <p className="text-[10px] text-slate-400 leading-tight border-t border-blue-500/20 pt-2 mt-1">{step.desc}</p>}
                                 {active && (
                                     <div className="flex gap-1 mt-2">
                                         {step.risks.map(r => (
                                             <span key={r} className="text-[8px] bg-red-900/20 text-red-400 px-1 border border-red-900/30 rounded">{r}</span>
                                         ))}
                                     </div>
                                 )}
                             </div>
                         </div>
                     );
                 })}
              </div>
           </SciFiCard>

           <div className="h-[140px] bg-slate-900/40 border border-slate-800 rounded-lg p-3 flex flex-col shadow-inner">
               <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-1.5 flex items-center gap-2">
                   <Terminal size={12}/> Event Trace Log
               </div>
               <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-1 mt-2 pr-1 custom-scrollbar">
                   {logs.map((log, i) => (
                       <div key={i} className={`flex gap-2 animate-in slide-in-from-left-1 duration-300 ${log.includes('!!') ? 'text-red-400 font-bold' : 'text-slate-500 hover:text-cyan-300'}`}>
                           <span className="text-cyan-600">[{logs.length - i}]</span>
                           <span>{log}</span>
                       </div>
                   ))}
                   <div className="animate-pulse text-cyan-500 mt-1">_</div>
               </div>
           </div>
        </div>

        {/* --- CENTER: Large Digital Twin --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_120px_rgba(0,0,0,0.9)] group">
               {/* 3D Scene */}
               <ThreeScene phase={phase} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Overlay HUD Components */}
               <div className="absolute top-6 left-6 pointer-events-none z-20">
                   <div className="bg-slate-950/90 backdrop-blur border border-blue-500/30 p-5 rounded-sm flex flex-col border-l-4">
                       <div className="text-[10px] text-blue-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Activity size={12} className="animate-pulse" /> Active Simulation
                       </div>
                       <div className="text-3xl font-black text-white italic">{currentStep.label}</div>
                       <p className="text-xs text-slate-400 mt-3 max-w-[280px] leading-relaxed italic border-t border-slate-800 pt-3">
                           {currentStep.desc}
                       </p>
                   </div>
               </div>

               {/* Right Overlay: Dynamic Parameters */}
               <div className="absolute top-6 right-6 z-20 flex flex-col gap-3 items-end">
                   <div className="bg-black/70 backdrop-blur px-4 py-2 rounded border border-blue-500/30 flex flex-col items-end">
                       <div className="text-[10px] text-blue-400 font-bold uppercase mb-1">Alignment Precision</div>
                       <div className="text-2xl font-mono font-bold text-white">0.002 <span className="text-xs text-slate-500">mm</span></div>
                       <div className="w-32 h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                           <div className="h-full bg-green-500" style={{width: '98%'}}></div>
                       </div>
                   </div>
                   <div className="bg-black/70 backdrop-blur px-4 py-2 rounded border border-orange-500/30 flex flex-col items-end">
                       <div className="text-[10px] text-orange-400 font-bold mb-1 uppercase">Hoist Tension</div>
                       <div className="text-2xl font-mono font-bold text-white">125 <span className="text-xs text-slate-500">kN</span></div>
                   </div>
               </div>

               {/* Control Bar (Scrubber Style) */}
               <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[85%] bg-slate-950/90 p-4 rounded-full border border-slate-700 shadow-2xl flex items-center gap-8 backdrop-blur-2xl scale-110">
                   <button 
                     onClick={() => {setPhase('LOGISTICS'); setProgress(0); addLog('重新初始化时序程序');}}
                     className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full border border-slate-700 transition-all hover:rotate-[-180deg] duration-500"
                   >
                       <RotateCcw size={20} />
                   </button>
                   
                   <div className="flex-1 px-4">
                       <div className="flex justify-between text-[10px] text-slate-500 uppercase font-black mb-1.5 px-1">
                           <span>Simulation Timeline</span>
                           <span className="text-blue-400">{progress.toFixed(0)}% Complete</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                           <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700" style={{width: `${progress}%`, boxShadow: '0 0 10px #0ea5e9'}}></div>
                       </div>
                   </div>

                   <button 
                     onClick={handleNext}
                     disabled={phase === 'COMMISSIONING'}
                     className="px-12 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-full shadow-lg shadow-blue-900/50 flex items-center gap-4 transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                   >
                       <span className="tracking-[0.2em] uppercase">推进阶段 (NEXT)</span>
                       <ArrowRight size={22} />
                   </button>
               </div>
           </div>
        </div>

        {/* --- RIGHT: Spares & AI Insights --- */}
        <div className="w-[320px] flex flex-col gap-4">
           
           <SciFiCard title="备件数字指纹" subtitle="PART INTEL" className="border-blue-900/30 bg-[#0c0e14]/90">
               <div className="flex flex-col gap-4">
                   <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
                       <div className="text-sm font-bold text-white mb-2">{ACTIVE_PART.name}</div>
                       <div className="grid grid-cols-2 gap-y-2 text-[10px] text-slate-400">
                           <div>Weight: <span className="text-white">{ACTIVE_PART.weight}</span></div>
                           <div>Stock: <span className="text-green-400 font-bold">{ACTIVE_PART.stock} Unit</span></div>
                           <div className="col-span-2">Tolerance: <span className="text-cyan-400">{ACTIVE_PART.tolerance}</span></div>
                       </div>
                   </div>

                   <div className="space-y-3">
                      <div className="text-[10px] text-slate-500 uppercase font-black border-b border-slate-800 pb-1">Resource Allocation</div>
                      {RESOURCE_LOAD.map(item => (
                          <div key={item.subject} className="flex flex-col gap-1">
                              <div className="flex justify-between text-[9px] uppercase">
                                  <span className="text-slate-500">{item.subject}</span>
                                  <span className="text-white">{item.A}%</span>
                              </div>
                              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500" style={{width: `${item.A}%`}}></div>
                              </div>
                          </div>
                      ))}
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="AI 专家指导建议" subtitle="REASONING" className="flex-1 border-blue-900/30 bg-blue-950/5">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-4 bg-blue-900/20 border border-blue-900/30 rounded flex items-start gap-4">
                       <Cpu size={32} className="text-blue-400 shrink-0 mt-1" />
                       <p className="text-[11px] text-slate-300 leading-relaxed italic">
                          "{aiAnalysis}"
                       </p>
                   </div>

                   <div className="mt-auto space-y-3">
                      <div className="p-3 bg-red-950/20 border border-red-900/30 rounded flex items-center gap-3">
                          <AlertTriangle size={18} className="text-red-500 shrink-0" />
                          <div className="text-[9px] text-red-300">
                             <span className="font-bold block">关键提醒：</span>
                             吊运过程中需维持吊钩垂向载荷监测，侧向偏移不得超过 2°，防止摆动干涉。
                          </div>
                      </div>
                      <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all">
                          <FileText size={16} /> 下载完整工序手册
                      </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
