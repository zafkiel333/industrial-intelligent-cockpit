
import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/mining-engine/ThreeScene';
import { EngineRepairPhase } from '../../components/maintenance/mining-engine/three-types';
import { 
  Zap, Activity, Wrench, ShieldAlert, 
  Settings, Gauge, Play, RotateCcw, 
  CheckCircle2, AlertTriangle, Hammer, Ruler,
  Cpu, Thermometer, Droplets, ClipboardList,
  ArrowRight, Search, Scan, Power, Info, BrainCircuit, Terminal,
  Waves, Microscope, FlaskConical, FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';

// --- 模拟数据 ---
const ENGINE_METRICS = Array.from({length: 40}, (_, i) => ({
    time: i,
    torque: 8500 + Math.sin(i*0.2) * 500, // Nm
    exhaustTemp: 650 + (i > 30 ? 150 : 0) + Math.random()*20, // C
    vibration: 2.5 + (i > 15 && i < 25 ? 4.0 : 0) // mm/s
}));

const ACOUSTIC_FINGERPRINT = Array.from({length: 12}, (_, i) => ({
    freq: `${i*2}kHz`,
    actual: 40 + Math.random()*40,
    normal: 30 + Math.sin(i*0.5)*20
}));

const OIL_PARTICLES = [
  { type: 'Fe (铁)', val: 45, limit: 30, status: 'Critical' },
  { type: 'Cu (铜)', val: 12, limit: 15, status: 'Normal' },
  { type: 'Al (铝)', val: 8, limit: 10, status: 'Normal' },
  { type: 'Si (硅)', val: 5, limit: 8, status: 'Normal' },
];

const REPAIR_STEPS: { id: EngineRepairPhase; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'STANDBY', label: '在线健康监测', desc: '系统实时监测 QSK60 发动机各缸排温均匀性及滑油压力。', icon: <Activity size={16}/> },
  { id: 'THERMAL_FAILURE', label: '热工故障预警', desc: '检测到 B 组排温异常升高，滑油粘度下降，触发二级警报。', icon: <ShieldAlert size={16}/> },
  { id: 'OIL_ANALYSIS', label: '滑油光谱诊断', desc: '取样进行原子发射光谱分析，发现铁粉、铬粉含量激增，判断缸套磨损。', icon: <Microscope size={16}/> },
  { id: 'TURBO_STALL', label: '增压器喘振仿真', desc: '模拟增压压力波动及喘振噪声，评估涡轮叶片完整性。', icon: <Waves size={16}/> },
  { id: 'DISASSEMBLY', label: '数字化拆解', desc: '执行自动化吊装程序，剥离增压器、中冷器及 B6 缸盖。', icon: <LayersIcon size={16}/> },
  { id: 'CORE_REPAIR', label: '核心组件修复', desc: '更换受损活塞环与缸套，调整喷油正时，恢复气密性。', icon: <Wrench size={16}/> },
  { id: 'COLD_START', label: '验证与试运行', desc: '执行维修后冷启动程序，监测关键摩擦副磨合指标。', icon: <Play size={16}/> },
];

function LayersIcon(props: any) {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m2.2 12.91 8.94 4.07a2 2 0 0 0 1.71 0l8.94-4.07"/><path d="m2.2 17.91 8.94 4.07a2 2 0 0 0 1.71 0l8.94-4.07"/></svg>;
}

export const MiningEngineRepairView: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] 矿用大功率发动机档案 MT-QSK60 已载入...']);
  const [oilPressure, setOilPressure] = useState(0.42);

  const currentStep = REPAIR_STEPS[currentStepIdx];
  const currentState = currentStep.id;

  // 模拟运行数据波动
  useEffect(() => {
    const interval = setInterval(() => {
        if (currentState === 'STANDBY' || currentState === 'COLD_START') {
            setOilPressure(0.42 + (Math.random()-0.5) * 0.05);
        } else if (currentState === 'THERMAL_FAILURE') {
            setOilPressure(prev => Math.max(0.1, prev - 0.005));
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentState]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  const nextStep = () => {
    if (currentStepIdx < REPAIR_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      addLog(`任务推进: ${REPAIR_STEPS[currentStepIdx + 1].label}`);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#02040a] p-2 relative overflow-hidden">
      {/* 科技背景装饰 */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/5 blur-[150px] rounded-full pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-red-900/30 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-red-600/20 border border-red-500 rounded flex items-center justify-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
             <Zap size={32} className="text-red-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-red-500 mb-0.5 uppercase tracking-[0.4em] font-black">
               <ShieldAlert size={12} className="animate-pulse" /> Critical Maintenance Directive
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               矿用发动机故障 <span className="text-red-500 italic">维修仿真系统</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-12 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Main Oil Pressure</div>
                <div className={`text-3xl font-mono font-black ${oilPressure < 0.2 ? 'text-red-500 animate-bounce' : 'text-cyan-400'}`}>
                    {oilPressure.toFixed(2)} <span className="text-sm font-normal text-slate-600">MPa</span>
                </div>
            </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Engine Speed</div>
                <div className="text-3xl font-mono font-black text-white">
                    {currentState === 'STANDBY' ? '1800' : '0'}<span className="text-sm font-normal text-slate-600">RPM</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 z-10">
        
        {/* --- LEFT: Diagnostic Sequence --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="维修仿真工序" subtitle="SEQUENCE" className="border-red-900/30 bg-[#0c0e14]/90">
              <div className="space-y-4 relative pl-4 mt-2">
                 <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800"></div>
                 {REPAIR_STEPS.map((step, idx) => {
                     const active = idx === currentStepIdx;
                     const done = idx < currentStepIdx;
                     return (
                         <div key={step.id} className={`relative transition-all duration-300 ${active ? 'opacity-100 translate-x-2' : 'opacity-40'}`}>
                             <div className={`absolute -left-[24px] top-1 w-4 h-4 rounded-full border-2 
                                 ${active ? 'bg-red-500 border-white shadow-[0_0_15px_red]' : 
                                   done ? 'bg-green-500 border-green-700' : 'bg-slate-900 border-slate-700'}
                             `}></div>
                             <div className={`p-3 rounded border flex flex-col gap-1 transition-all
                                 ${active ? 'bg-red-900/30 border-red-500/50' : 'bg-slate-900/20 border-slate-800'}
                             `}>
                                 <div className="flex items-center gap-2">
                                     <span className={active ? 'text-red-400' : 'text-slate-500'}>{step.icon}</span>
                                     <h4 className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-500'}`}>{step.label}</h4>
                                 </div>
                                 {active && <p className="text-[11px] text-slate-400 leading-tight italic">{step.desc}</p>}
                             </div>
                         </div>
                     );
                 })}
              </div>
           </SciFiCard>

           <SciFiCard title="实时日志与警报" className="flex-1 border-slate-800 bg-black/40">
               <div className="h-full overflow-y-auto font-mono text-[10px] space-y-1.5 custom-scrollbar pr-1">
                   {logs.map((log, i) => (
                       <div key={i} className={`pb-1 border-b border-white/5 transition-all duration-300 ${log.includes('!!') ? 'text-red-400 font-bold bg-red-900/10' : 'text-slate-500 hover:text-red-300'}`}>
                           {log}
                       </div>
                   ))}
                   <div className="text-red-600 animate-pulse">_</div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Power Core --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-red-900/20 rounded-lg overflow-hidden relative shadow-inner group">
               {/* 3D Scene */}
               <ThreeScene phase={currentState} />

               {/* Floating Telemetry (HUD) */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-3">
                   <div className="bg-black/60 backdrop-blur border border-red-500/30 p-2 rounded flex flex-col">
                       <div className="text-[10px] text-red-400 font-bold mb-1 uppercase tracking-widest">Exhaust Temp</div>
                       <div className="text-xl font-mono font-bold text-white">682 <span className="text-xs text-slate-500">°C</span></div>
                   </div>
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-2 rounded flex flex-col">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest">Comp Ratio</div>
                       <div className="text-xl font-mono font-bold text-white">15.5:1</div>
                   </div>
               </div>

               {/* Central Action Console */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-700 shadow-2xl scale-110">
                   <button 
                     onClick={() => {setCurrentStepIdx(0); addLog('系统状态重置');}}
                     className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full border border-slate-600 transition-all hover:rotate-[-45deg]"
                   >
                       <RotateCcw size={22} />
                   </button>
                   <div className="h-12 w-[1px] bg-slate-800 mx-2"></div>
                   <button 
                     onClick={nextStep}
                     disabled={currentStepIdx === REPAIR_STEPS.length - 1}
                     className="px-10 py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-full shadow-lg shadow-red-900/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                   >
                       {currentStepIdx === REPAIR_STEPS.length - 1 ? '演练完成' : '下一步 (Next)'}
                       <ArrowRight size={20} />
                   </button>
               </div>
           </div>

           {/* Performance Charts (Bottom center) */}
           <div className="h-[220px] grid grid-cols-2 gap-4">
               <SciFiCard title="扭矩与排温特性" subtitle="LOAD CURVES" className="border-slate-800" noPadding>
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={ENGINE_METRICS}>
                               <defs>
                                   <linearGradient id="torqueGrad" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="time" hide />
                               <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 10}} domain={[7000, 10000]} />
                               <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{fontSize: 10}} domain={[400, 1000]} />
                               <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#ef4444'}} />
                               <Area yAxisId="left" type="monotone" dataKey="torque" stroke="#64748b" fill="url(#torqueGrad)" name="Torque Nm" />
                               <Line yAxisId="right" type="monotone" dataKey="exhaustTemp" stroke="#ef4444" strokeWidth={2} dot={false} name="Temp °C" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="声纹指纹分析" subtitle="ACOUSTIC FFT" className="border-slate-800" noPadding>
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={ACOUSTIC_FINGERPRINT}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                               <XAxis dataKey="freq" stroke="#64748b" tick={{fontSize: 8}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#ef4444'}} cursor={{fill: 'rgba(239, 68, 68, 0.1)'}} />
                               <Bar dataKey="actual" fill="#ef4444" radius={[2, 2, 0, 0]} name="Live" />
                               <Bar dataKey="normal" fill="#334155" radius={[2, 2, 0, 0]} name="Base" />
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>
           </div>
        </div>

        {/* --- RIGHT: Diagnostics & BOM --- */}
        <div className="w-full lg:w-[360px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="滑油光谱分析结果" subtitle="OIL SPECTROSCOPY" className="h-[280px] border-red-900/30">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {OIL_PARTICLES.map((item, i) => (
                       <div key={i} className="bg-slate-900/40 border border-slate-800 p-2.5 rounded flex flex-col gap-1.5 group hover:border-red-500/50 transition-colors">
                           <div className="flex justify-between items-center">
                               <span className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">{item.type}</span>
                               <span className={`text-[8px] px-1.5 py-0.5 rounded font-black 
                                   ${item.status === 'Normal' ? 'bg-green-900/30 text-green-400' : 
                                     item.status === 'Warning' ? 'bg-red-900/30 text-red-400 animate-pulse' : 'bg-yellow-900/30 text-yellow-400'}`}>
                                   {item.status.toUpperCase()}
                               </span>
                           </div>
                           <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                               <span className="flex-1">PPM: {item.val}</span>
                               <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                                   <div className={`h-full ${item.val > item.limit ? 'bg-red-500' : 'bg-cyan-500'}`} style={{width: `${Math.min(100, (item.val/item.limit)*80)}%`}}></div>
                               </div>
                               <span className="w-10 text-right">Lim: {item.limit}</span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="专家故障推理" subtitle="EXPERT AI" className="flex-1 border-slate-800">
               <div className="space-y-4">
                   <div className="p-3 bg-red-900/10 border border-red-900/30 rounded">
                       <div className="flex items-center gap-2 mb-2">
                           <ShieldAlert size={16} className="text-red-500" />
                           <span className="text-xs font-bold text-red-200 uppercase tracking-widest">Active Diagnosis</span>
                       </div>
                       <div className="flex flex-col gap-2 relative pl-4 border-l border-red-500/30">
                           <div className="text-[11px] text-slate-200 font-bold underline">检测到 6 号缸活塞连杆组异常振动</div>
                           <ArrowRight size={10} className="text-slate-500 rotate-90 my-1 ml-1" />
                           <div className="text-[10px] text-slate-400">可能原因：滑油乳化 / 缸套疲劳剥落</div>
                           <div className="text-[11px] text-green-400 font-bold mt-2 flex items-center gap-2">
                               <Settings size={12}/> 指令：执行缸盖吊装检查
                           </div>
                       </div>
                   </div>
                   
                   <div className="space-y-3">
                       <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-1 uppercase font-black">
                           <span>Technical Manuals</span>
                           <span className="flex items-center gap-1 hover:text-red-400 cursor-pointer transition-colors">Open Library <ArrowRight size={10}/></span>
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 p-2 hover:bg-slate-800 rounded cursor-pointer transition-all border border-transparent hover:border-slate-700">
                           <FileText size={14} className="text-red-500" /> <span>QSK60 缸盖吊装工艺规程.pdf</span>
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 p-2 hover:bg-slate-800 rounded cursor-pointer transition-all border border-transparent hover:border-slate-700">
                           <Activity size={14} className="text-blue-500" /> <span>燃油喷射正时校准表.xlsx</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           <div className="bg-slate-900/40 border border-slate-800 rounded p-4 flex flex-col items-center gap-3">
               <div className="flex items-center gap-2 w-full">
                   <BrainCircuit size={24} className="text-red-500 animate-pulse" />
                   <div className="flex-1">
                       <div className="text-[10px] text-slate-500 uppercase">AI Reasoning Core</div>
                       <div className="text-xs font-bold text-white uppercase">Active Inference</div>
                   </div>
               </div>
               <div className="w-full h-12 bg-black/60 rounded flex items-center justify-center border border-slate-700">
                   <Terminal size={14} className="text-green-500 mr-2" />
                   <span className="text-[9px] font-mono text-green-400">PROCESSING_REPAIR_SCENARIO...</span>
               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
