
import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/mine-drainage-pump/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-17]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-17';
import { PumpSimState } from '../../components/maintenance/mine-drainage-pump/three-types';
import { 
  Waves, Activity, Wrench, ShieldAlert, 
  Settings, Gauge, Play, RotateCcw, 
  CheckCircle2, AlertTriangle, Hammer, Ruler,
  Cpu, Thermometer, Zap, ClipboardList,
  ArrowRight, Search, Droplets, Info,
  // Added FileText to fix "Cannot find name 'FileText'" error
  FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell, ComposedChart, Line, Legend
} from 'recharts';

// --- MOCK DATA ---
const FLOW_DATA = Array.from({length: 40}, (_, i) => ({
    time: i,
    flow: 450 + Math.sin(i*0.2) * 20, // m3/h
    vibration: 2.1 + (i > 25 ? Math.random() * 5 : 0) // Peak in fault state
}));

const VIBRATION_SPECTRUM = [
    { freq: '1X', val: 12.5, status: 'Critical' },
    { freq: '2X', val: 4.2, status: 'Normal' },
    { freq: '3X', val: 1.8, status: 'Normal' },
    { freq: 'Sub', val: 0.5, status: 'Normal' },
];

const SOP_STEPS: { id: PumpSimState; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'STANDBY', label: '在线巡检', desc: '系统全要素监控，监测多级泵效率与轴承振动。', icon: <Activity size={16}/> },
  { id: 'CAVITATION', label: '气蚀预警', desc: '检测到高频噪声与流量波动，判断发生严重气蚀。', icon: <Waves size={16}/> },
  { id: 'BEARING_FAULT', label: '轴承报警', desc: '轴承支座温升过快 (>85°C)，振动值超过临界阈值。', icon: <Thermometer size={16}/> },
  { id: 'ISOLATION', label: '系统停泵', desc: '执行紧急停泵逻辑，关闭进出口电动闸阀。', icon: <LockIcon size={16}/> },
  { id: 'DISASSEMBLY', label: '泵体解体', desc: '拆卸联轴器，垂直起吊泵轴及多级叶轮组件。', icon: <LayersIcon size={16}/> },
  { id: 'REPLACEMENT', label: '备件更换', desc: '更换受损的导叶与叶轮，重新装配动平衡校准。', icon: <Settings size={16}/> },
  { id: 'RECOVERY', label: '试运验收', desc: '启动泵组，进行分阶段升压测试，确认流量恢复。', icon: <CheckCircle2 size={16}/> },
];

function LockIcon(props: any) {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}

function LayersIcon(props: any) {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m2.2 12.91 8.94 4.07a2 2 0 0 0 1.71 0l8.94-4.07"/><path d="m2.2 17.91 8.94 4.07a2 2 0 0 0 1.71 0l8.94-4.07"/></svg>;
}

export const MineDrainagePumpView: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] 矿井主排水控制台已连接。']);
  const [waterLevel, setWaterLevel] = useState(4.2); // meters in sump
  
  const currentStep = SOP_STEPS[currentStepIdx];
  const currentState = currentStep.id;

  // Simulation Logic
  useEffect(() => {
    const interval = setInterval(() => {
        if (currentState === 'STANDBY' || currentState === 'RECOVERY') {
            setWaterLevel(prev => Math.max(1, prev - 0.005));
        } else if (currentState === 'CAVITATION' || currentState === 'BEARING_FAULT') {
            setWaterLevel(prev => Math.min(8, prev + 0.01)); // Sump rising
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentState]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 8)]);
  };

  const nextStep = () => {
    if (currentStepIdx < SOP_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      addLog(`任务推进: ${SOP_STEPS[currentStepIdx + 1].label}`);
    }
  };

  const handleReset = () => {
      setCurrentStepIdx(0);
      setWaterLevel(4.2);
      addLog('>>> 仿真系统重置');
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 relative">
      {/* Dynamic Background Noise */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      {/* --- HEADER --- */}
      <div className="z-10 flex items-center justify-between bg-slate-900/60 border border-cyan-900/40 p-4 rounded-lg backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/20 border border-blue-500 rounded flex items-center justify-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-blue-500/20 animate-pulse"></div>
             <Droplets size={28} className="text-blue-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-400 mb-0.5 uppercase tracking-[0.2em] font-black">
               <ShieldAlert size={12} className="animate-pulse" /> Safety Critical Operation
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               主排水泵站 <span className="text-cyan-500 italic">故障诊断与仿真维修</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Sump Water Level</div>
                <div className={`text-3xl font-mono font-black ${waterLevel > 6 ? 'text-red-500 animate-bounce' : 'text-cyan-400'}`}>
                    {waterLevel.toFixed(2)} <span className="text-sm font-normal text-slate-600">m</span>
                </div>
            </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">System Load</div>
                <div className="text-3xl font-mono font-black text-white">
                    {currentState === 'STANDBY' ? '85' : '0'}<span className="text-sm font-normal text-slate-600">%</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 z-10">
        
        {/* --- LEFT: Operational Timeline --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="检修工序导航" subtitle="WORKFLOW" className="border-cyan-900/30 bg-[#080c14]/80">
              <div className="space-y-4 relative pl-4 mt-2">
                 <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800"></div>
                 {SOP_STEPS.map((step, idx) => {
                     const active = idx === currentStepIdx;
                     const done = idx < currentStepIdx;
                     return (
                         <div key={step.id} className={`relative transition-all duration-300 ${active ? 'opacity-100 scale-105 origin-left' : 'opacity-40'}`}>
                             <div className={`absolute -left-[24px] top-1 w-4 h-4 rounded-full border-2 
                                 ${active ? 'bg-cyan-500 border-white shadow-[0_0_15px_cyan]' : 
                                   done ? 'bg-green-500 border-green-700' : 'bg-slate-900 border-slate-700'}
                             `}></div>
                             <div className={`p-3 rounded border flex flex-col gap-1 transition-all
                                 ${active ? 'bg-cyan-900/30 border-cyan-500/50' : 'bg-slate-900/20 border-slate-800'}
                             `}>
                                 <div className="flex items-center gap-2">
                                     <span className={active ? 'text-cyan-400' : 'text-slate-500'}>{step.icon}</span>
                                     <h4 className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-500'}`}>{step.label}</h4>
                                 </div>
                                 {active && <p className="text-[11px] text-slate-400 leading-tight">{step.desc}</p>}
                             </div>
                         </div>
                     );
                 })}
              </div>
           </SciFiCard>

           <SciFiCard title="实时日志" subtitle="EVENT LOG" className="flex-1 border-slate-800 bg-black/40">
               <div className="h-full overflow-y-auto font-mono text-[10px] space-y-1.5 custom-scrollbar pr-1">
                   {logs.map((log, i) => (
                       <div key={i} className={`pb-1 border-b border-white/5 transition-all duration-300 ${log.includes('!!') ? 'text-red-400 font-bold bg-red-900/5' : 'text-slate-500 hover:text-cyan-300'}`}>
                           {log}
                       </div>
                   ))}
                   <div className="text-cyan-600 animate-pulse">_</div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Visualization --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black/80 border border-cyan-800/20 rounded-lg overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene state={currentState} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Overlays */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-3">
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-2 rounded flex flex-col">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest">Outlet Pressure</div>
                       <div className="text-xl font-mono font-bold text-white">4.25 <span className="text-xs text-slate-500">MPa</span></div>
                   </div>
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-2 rounded flex flex-col">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest">Motor Amps</div>
                       <div className="text-xl font-mono font-bold text-white">124.5 <span className="text-xs text-slate-500">A</span></div>
                   </div>
               </div>

               {/* Operation Buttons */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-700 shadow-2xl">
                   <button 
                     onClick={handleReset}
                     className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full border border-slate-600 transition-all hover:rotate-[-45deg]"
                   >
                       <RotateCcw size={22} />
                   </button>
                   <div className="h-12 w-[1px] bg-slate-800 mx-2"></div>
                   <button 
                     onClick={nextStep}
                     disabled={currentStepIdx === SOP_STEPS.length - 1}
                     className="px-10 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-full shadow-lg shadow-cyan-900/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                   >
                       {currentStepIdx === SOP_STEPS.length - 1 ? '演练完成' : '执行下一步'}
                       <ArrowRight size={20} />
                   </button>
               </div>

               {/* Interactive Hint */}
               <div className="absolute bottom-4 right-4 text-[10px] text-slate-500 flex items-center gap-2">
                   <Activity size={12} className="text-cyan-600" />
                   <span>实时同步 PDM 数据资产</span>
               </div>
           </div>

           {/* Performance Charts (Bottom center) */}
           <div className="h-[220px] grid grid-cols-2 gap-4">
               <SciFiCard title="流量及振动趋势" subtitle="TELEMETRY" className="border-cyan-900/20" noPadding>
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <ComposedChart data={FLOW_DATA}>
                               <defs>
                                   <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="time" hide />
                               <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 10}} domain={[400, 500]} />
                               <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{fontSize: 10}} domain={[0, 10]} />
                               <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#06b6d4'}} />
                               <Area yAxisId="left" type="monotone" dataKey="flow" stroke="#0ea5e9" fill="url(#flowGrad)" name="Flow m3/h" />
                               <Line yAxisId="right" type="monotone" dataKey="vibration" stroke="#ef4444" strokeWidth={2} dot={false} name="Vib mm/s" />
                           </ComposedChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="振动频谱特征 (1X/2X)" subtitle="FFT ANALYSIS" className="border-cyan-900/20" noPadding>
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={VIBRATION_SPECTRUM}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                               <XAxis dataKey="freq" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#06b6d4'}} cursor={{fill: 'rgba(6, 182, 212, 0.1)'}} />
                               <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                                   {VIBRATION_SPECTRUM.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.status === 'Critical' ? '#ef4444' : '#06b6d4'} />
                                   ))}
                               </Bar>
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>
           </div>
        </div>

        {/* --- RIGHT: Components & Fault Tree --- */}
        <div className="w-full lg:w-[360px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="核心组件健康度" subtitle="BOM STATUS" className="h-[320px] border-cyan-900/30">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {[
                       { name: '多级离心叶轮组', status: 'Warning', life: 42, partId: 'P-IMP-05' },
                       { name: '主驱动电机', status: 'Optimal', life: 88, partId: 'M-AC-12' },
                       { name: '推力轴承 A', status: 'Critical', life: 12, partId: 'B-THR-01' },
                       { name: '平衡盘装置', status: 'Warning', life: 35, partId: 'P-BAL-02' },
                       { name: '机械密封单元', status: 'Optimal', life: 92, partId: 'S-MEC-04' },
                   ].map((item, i) => (
                       <div key={i} className="bg-slate-900/40 border border-slate-800 p-2 rounded flex flex-col gap-1 group hover:border-cyan-500/50 transition-colors">
                           <div className="flex justify-between items-center">
                               <span className="text-[11px] font-bold text-white group-hover:text-cyan-400 transition-colors">{item.name}</span>
                               <span className={`text-[8px] px-1.5 py-0.5 rounded font-black 
                                   ${item.status === 'Optimal' ? 'bg-green-900/30 text-green-400' : 
                                     item.status === 'Warning' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400 animate-pulse'}`}>
                                   {item.status.toUpperCase()}
                               </span>
                           </div>
                           <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                               <span className="flex-1">ID: {item.partId}</span>
                               <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                                   <div className={`h-full ${item.life < 30 ? 'bg-red-500' : item.life < 60 ? 'bg-yellow-500' : 'bg-cyan-500'}`} style={{width: `${item.life}%`}}></div>
                               </div>
                               <span className="w-8 text-right">{item.life}%</span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="专家故障树" subtitle="DIAGNOSIS" className="flex-1 border-slate-800">
               <div className="space-y-3">
                   <div className="p-3 bg-red-900/10 border border-red-900/30 rounded">
                       <div className="flex items-center gap-2 mb-2">
                           <ShieldAlert size={16} className="text-red-500" />
                           <span className="text-xs font-bold text-red-200 uppercase tracking-widest">Active Diagnosis</span>
                       </div>
                       <div className="flex flex-col gap-2 relative pl-4 before:absolute before:left-1 before:top-1 before:bottom-1 before:w-0.5 before:bg-red-500/30">
                           <div className="text-[11px] text-slate-200 font-bold">检测到轴承剧烈振动 & 温升</div>
                           <ArrowRight size={10} className="text-slate-500 rotate-90 my-1 ml-1" />
                           <div className="text-[10px] text-slate-400">可能原因：润滑油失效 / 轴承疲劳剥落</div>
                           <div className="text-[11px] text-green-400 font-bold mt-2 flex items-center gap-2">
                               <Settings size={12}/> 建议操作：停泵执行B级检修
                           </div>
                       </div>
                   </div>
                   
                   <div className="space-y-2">
                       <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-1">
                           <span>Manuals</span>
                           <span className="flex items-center gap-1 hover:text-cyan-400 cursor-pointer">View All <ArrowRight size={10}/></span>
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 p-1.5 hover:bg-slate-800 rounded cursor-pointer transition-colors">
                           <FileText size={12} className="text-blue-500" /> <span>多级泵解体与组装规程.pdf</span>
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 p-1.5 hover:bg-slate-800 rounded cursor-pointer transition-colors">
                           <Zap size={12} className="text-yellow-500" /> <span>电气控制回路图纸_V2.dwg</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
