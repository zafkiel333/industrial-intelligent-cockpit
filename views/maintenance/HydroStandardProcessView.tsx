
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/hydro-standard/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-31]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-31';
import { StandardStep } from '../../components/maintenance/hydro-standard/three-types';
import { 
  ClipboardCheck, Target, Ruler, Hammer, 
  RotateCcw, Play, CheckCircle2, ShieldCheck,
  Activity, Gauge, Cpu, Zap, Maximize2,
  FileText, Users, Clock, AlertCircle,
  Layers, ArrowRight, BookOpen, Settings
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, Cell
} from 'recharts';

const SOP_DATA: { id: StandardStep; label: string; time: string; desc: string }[] = [
  { id: 'INIT_CHECK', label: '准备与首检', time: '1.5h', desc: '确认检修工器具就绪，记录导水机构原始数据。' },
  { id: 'SHAFT_ALIGN', label: '销轴标准化对中', time: '4.0h', desc: '利用激光对中仪调整销轴垂直度，偏差控制在 0.02mm/m。' },
  { id: 'CLEARANCE_ADJ', label: '间隙精细化调整', time: '6.0h', desc: '标准化调整导叶端面及立面间隙，确保水力对称。' },
  { id: 'TORQUE_LOCK', label: '标准化力矩紧固', time: '2.0h', desc: '根据工艺手册执行分步力矩紧固，数字扳手实时上传。' },
  { id: 'SYNC_TEST', label: '静特性测试', time: '3.5h', desc: '全行程同步性校验，测试接力器动作偏差。' },
  { id: 'FINAL_SIGN', label: '工艺标准签认', time: '1.0h', desc: '三级验收签认，归档数字化检修履历。' },
];

const TOLERANCE_MATRIX = [
  { part: '导叶上端隙', actual: 0.45, standard: 0.50, status: 'Normal' },
  { part: '导叶下端隙', actual: 0.52, standard: 0.50, status: 'Warning' },
  { part: '销轴垂直度', actual: 0.015, standard: 0.02, status: 'Normal' },
  { part: '立面接触线', actual: 95, standard: 90, status: 'Optimal' },
];

const QUALITY_RADAR = [
  { subject: '工序执行率', A: 98, fullMark: 100 },
  { subject: '精度达标率', A: 95, fullMark: 100 },
  { subject: '人员资质', A: 100, fullMark: 100 },
  { subject: '数据一致性', A: 92, fullMark: 100 },
  { subject: '安全规程', A: 100, fullMark: 100 },
];

export const HydroStandardProcessView: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[SYS] 工艺标准化平台已启动', '[INFO] 载入设备：700MW 混流式水轮机']);
  const [simTime, setSimTime] = useState(0);

  const currentStep = SOP_DATA[currentStepIdx];

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  const handleNext = () => {
    if (currentStepIdx < SOP_DATA.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      addLog(`工序推进至：${SOP_DATA[currentStepIdx + 1].label}`);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#02040a] p-2 relative">
      {/* Background Decorative Tech Layer */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,_#0ea5e9_0%,_transparent_60%)]"></div>

      {/* --- HEADER SECTION --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-cyan-900/30 p-4 rounded-lg backdrop-blur-md z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-cyan-600/20 border border-cyan-500 rounded flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
             <ClipboardCheck size={32} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-400 mb-0.5 uppercase tracking-[0.4em] font-black">
               Standardization Engine V3.2
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
               水电站设备检修 <span className="text-cyan-500">工艺标准化仿真平台</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Compliance Rate</div>
                <div className="text-3xl font-mono font-black text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">98.5%</div>
            </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Standard</div>
                <div className="text-xl font-mono font-black text-white">Q/CTG-SOP-2024</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 z-10">
        
        {/* --- LEFT: SOP Roadmap --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4">
           <SciFiCard title="标准化工艺路径" subtitle="SOP ROADMAP" className="flex-1 border-cyan-900/30 bg-[#0c0e14]/90 overflow-hidden">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 {SOP_DATA.map((step, idx) => {
                     const active = idx === currentStepIdx;
                     const done = idx < currentStepIdx;
                     return (
                         <div key={step.id} className={`relative p-3 rounded border transition-all duration-500
                            ${active ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] scale-[1.02] translate-x-1' : 
                              done ? 'bg-slate-900/20 border-green-900/30' : 'bg-slate-900/20 border-slate-800'}
                         `}>
                            <div className="flex justify-between items-start mb-1">
                               <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-cyan-500 animate-pulse' : done ? 'bg-green-500' : 'bg-slate-700'}`}></div>
                                  <span className={`text-[11px] font-bold ${active ? 'text-white' : 'text-slate-500'}`}>{step.label}</span>
                               </div>
                               <span className="text-[9px] font-mono text-slate-500">{step.time}</span>
                            </div>
                            {active && <p className="text-[10px] text-slate-400 leading-relaxed italic border-t border-cyan-900/30 pt-2 mt-1">{step.desc}</p>}
                            {done && <div className="absolute right-2 bottom-2"><CheckCircle2 size={12} className="text-green-500 opacity-50" /></div>}
                         </div>
                     );
                 })}
              </div>
           </SciFiCard>

           <SciFiCard title="执行偏差实时分析" className="h-[200px] border-slate-800">
               <div className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={Array.from({length: 12}, (_,i)=>({t:i, val: 90+Math.random()*10}))}>
                          <defs>
                              <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis hide />
                          <YAxis hide domain={[80, 100]} />
                          <Area type="monotone" dataKey="val" stroke="#0ea5e9" fill="url(#compGrad)" strokeWidth={2} />
                      </AreaChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                      <div className="text-3xl font-black text-cyan-400 font-mono">0.05</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Std Deviation (σ)</div>
                  </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Twin Workspace --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           <div className="flex-1 bg-black border border-cyan-800/20 rounded-lg overflow-hidden relative shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] group">
               {/* HUD Overlays */}
               <div className="absolute top-6 left-6 z-20 pointer-events-none">
                   <div className="bg-slate-950/80 backdrop-blur border-l-4 border-cyan-500 p-4 rounded-sm shadow-xl">
                       <div className="text-[10px] text-cyan-500 font-bold mb-1 uppercase tracking-widest">Current Standard Op</div>
                       <div className="text-3xl font-black text-white italic">{currentStep.label}</div>
                   </div>
               </div>

               {/* Right HUD Widgets */}
               <div className="absolute top-6 right-6 z-20 flex flex-col gap-3 items-end">
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded flex flex-col items-end">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase">Standard Deviation</div>
                       <div className="text-xl font-mono font-bold text-white flex items-center gap-2">
                           <Target size={16} className="text-green-400" /> ±0.012 <span className="text-xs text-slate-500">mm</span>
                       </div>
                   </div>
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded flex flex-col items-end">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase">Material Stress</div>
                       <div className="text-lg font-mono font-bold text-white">NOMINAL</div>
                   </div>
               </div>

               {/* 3D Simulation */}
               <ThreeScene step={currentStep.id} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Interaction Controls */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-700 shadow-2xl scale-110">
                   <button 
                     onClick={() => {setCurrentStepIdx(0); addLog('重新初始化工艺校验程序');}}
                     className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full border border-slate-600 transition-all hover:rotate-[-180deg] duration-500"
                   >
                       <RotateCcw size={22} />
                   </button>
                   <div className="h-12 w-[1px] bg-slate-800 mx-2"></div>
                   <button 
                     onClick={handleNext}
                     disabled={currentStepIdx === SOP_DATA.length - 1}
                     className="px-10 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-full shadow-lg shadow-cyan-900/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                   >
                       <span className="tracking-widest uppercase">Standardize Next</span>
                       <ArrowRight size={20} />
                   </button>
               </div>
           </div>

           {/* Console Log Terminal */}
           <div className="h-36 bg-[#020617] border border-slate-800 rounded-lg p-3 font-mono text-[11px] overflow-y-auto custom-scrollbar shadow-lg">
               <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-800">
                   <Cpu size={14} className="text-cyan-600" />
                   <span className="text-[9px] text-slate-600 uppercase font-black">Standardization Audit Console</span>
               </div>
               {logs.map((log, i) => (
                   <div key={i} className="mb-1 pl-2 border-l-2 border-cyan-800 text-slate-400 hover:text-cyan-200 transition-colors">
                       {log}
                   </div>
               ))}
               <div className="text-cyan-500 mt-1 animate-pulse">_</div>
           </div>
        </div>

        {/* --- RIGHT: Audit & Analytics --- */}
        <div className="w-full lg:w-[360px] flex flex-col gap-4">
           <SciFiCard title="综合合规性评估" subtitle="AUDIT SCORE" className="h-[280px] border-cyan-900/30">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={QUALITY_RADAR}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Status" dataKey="A" stroke="#06b6d4" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0e14', borderColor: '#0ea5e9'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="精密公差监测矩阵" subtitle="TOLERANCE" className="flex-1 border-cyan-900/30">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {TOLERANCE_MATRIX.map((item, i) => (
                       <div key={i} className="bg-slate-900/40 border border-slate-800 p-2.5 rounded flex flex-col gap-1 hover:border-cyan-500/30 transition-all">
                           <div className="flex justify-between items-center">
                               <span className="text-xs font-bold text-white">{item.part}</span>
                               <span className={`text-[9px] px-1.5 py-0.5 rounded font-black 
                                   ${item.status === 'Optimal' ? 'bg-green-900/30 text-green-400' : 
                                     item.status === 'Normal' ? 'bg-blue-900/30 text-blue-400' : 'bg-red-900/30 text-red-400 animate-pulse'}`}>
                                   {item.status.toUpperCase()}
                               </span>
                           </div>
                           <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono mt-1">
                               <div className="flex flex-col">
                                  <span className="text-[8px] text-slate-600">MEASURED</span>
                                  <span className="text-white font-bold">{item.actual}</span>
                               </div>
                               <div className="h-6 w-[1px] bg-slate-800"></div>
                               <div className="flex flex-col">
                                  <span className="text-[8px] text-slate-600">STANDARD</span>
                                  <span className="text-cyan-600 font-bold">{item.standard}</span>
                               </div>
                               <div className="flex-1 flex justify-end">
                                  {item.actual <= item.standard ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-red-500" />}
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-bold flex items-center justify-center gap-3 transition-all group">
               <BookOpen size={16} className="text-cyan-500 group-hover:scale-110" /> 
               调阅标准化工艺指导书
           </button>
        </div>

      </div>
    </div>
  );
};
