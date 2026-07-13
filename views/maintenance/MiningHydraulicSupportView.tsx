
import React, { useState, useEffect } from 'react';
/* Added THREE import to fix the "Cannot find name 'THREE'" error */
import * as THREE from 'three';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/mining-hydraulic-support/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-16]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-16';
import { SupportSimState } from '../../components/maintenance/mining-hydraulic-support/three-types';
import { 
  Droplets, Activity, Wrench, ShieldAlert, 
  Settings, Gauge, Play, RotateCcw, 
  CheckCircle2, AlertTriangle, Hammer, Ruler,
  Cpu, Thermometer, Zap, ClipboardList,
  ArrowRight, Search
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell, ComposedChart, Line
} from 'recharts';

// --- MOCK DATA ---
const PRESSURE_DATA = Array.from({length: 40}, (_, i) => ({
    time: i,
    p1: 32 + Math.sin(i*0.1) * 2, // Pillar 1 Pressure (MPa)
    p2: 31.5 + (i > 25 ? -10 : 0), // Simulating leak after index 25
}));

const FLOW_HISTORY = Array.from({length: 20}, (_, i) => ({
    time: i,
    flow: 120 + Math.random() * 20,
    temp: 45 + Math.random() * 2
}));

const SOP_STEPS: { id: SupportSimState; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'STANDBY', label: '运行巡检', desc: '实时监测立柱初撑力及各控制阀组流量稳定性。', icon: <Activity size={16}/> },
  { id: 'LEAK_ALARM', label: '泄压报警', desc: '检测到2号主立柱压力异常衰减，触发乳化液内泄警报。', icon: <AlertTriangle size={16}/> },
  { id: 'PRESSURE_RELIEF', label: '安全卸压', desc: '执行系统残压释放，断开高压进液截止阀，确保作业安全。', icon: <Zap size={16}/> },
  { id: 'VALVE_REPLACE', label: '阀组更换', desc: '更换受损的液控单向阀及操纵阀片，清理阀块表面。', icon: <Settings size={16}/> },
  { id: 'SEAL_REPAIR', label: '密封维护', desc: '解体立柱活塞，更换耐高压蕾型密封圈及导向环。', icon: <Wrench size={16}/> },
  { id: 'FUNCTION_TEST', label: '性能测试', desc: '启动泵站供液，执行升、降、推、移全行程空载试验。', icon: <Play size={16}/> },
  { id: 'COMPLETE', label: '验收归档', desc: '各项指标恢复正常，记录维修日志并上传至数字化平台。', icon: <CheckCircle2 size={16}/> },
];

export const MiningHydraulicSupportView: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] 矿用液压支架智能维护模块启动...']);
  const [pillarPress, setPillarPress] = useState(32.4);

  const currentStep = SOP_STEPS[currentStepIdx];
  const currentState = currentStep.id;

  // Simulation Logic
  useEffect(() => {
    let interval: any;
    interval = setInterval(() => {
        if (currentState === 'STANDBY' || currentState === 'COMPLETE') {
            setPillarPress(32 + Math.random() * 0.5);
        } else if (currentState === 'LEAK_ALARM') {
            setPillarPress(prev => Math.max(5, prev - 0.2));
            if (Date.now() % 5000 < 500) addLog('!! 警报：检测到持续性内泄漏 !!');
        } else {
            /* Using THREE.MathUtils.lerp to smoothly transition pressure values */
            setPillarPress(THREE.MathUtils.lerp(pillarPress, 0, 0.1));
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentState, pillarPress]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  const nextStep = () => {
    if (currentStepIdx < SOP_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      addLog(`任务推进: ${SOP_STEPS[currentStepIdx + 1].label}`);
    }
  };

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#020617] p-2">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-cyan-900/50 p-4 rounded-lg backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-600/20 border border-cyan-500 rounded-sm flex items-center justify-center">
             <Droplets size={28} className="text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-cyan-400 mb-0.5 uppercase tracking-widest font-bold">
               <ShieldAlert size={14} className="animate-pulse" /> Maintenance Simulation
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               矿用液压支架 <span className="text-cyan-500 italic">关键部件维修仿真</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Support Unit ID</div>
                <div className="text-2xl font-mono font-black text-white tracking-widest">ZY12000/28/62D</div>
            </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">System Pressure</div>
                <div className={`text-3xl font-mono font-black ${pillarPress < 20 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                    {pillarPress.toFixed(1)} <span className="text-sm font-normal text-slate-600">MPa</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* --- LEFT: Task List & Safety --- */}
        <div className="w-full lg:w-[340px] flex flex-col gap-5 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="维修任务指引" subtitle="WORKFLOW" className="border-cyan-900/50 bg-[#080c14]">
              <div className="space-y-3 relative pl-4 mt-2">
                 <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800"></div>
                 {SOP_STEPS.map((step, idx) => {
                     const active = idx === currentStepIdx;
                     const done = idx < currentStepIdx;
                     return (
                         <div key={step.id} className={`relative transition-all duration-500 ${active ? 'opacity-100' : 'opacity-50'}`}>
                             <div className={`absolute -left-[24px] top-1 w-4 h-4 rounded-full border-2 
                                 ${active ? 'bg-cyan-500 border-cyan-200 shadow-[0_0_10px_cyan]' : 
                                   done ? 'bg-green-500 border-green-700' : 'bg-slate-900 border-slate-700'}
                             `}></div>
                             <div className={`p-3 rounded border flex flex-col gap-1 transition-all
                                 ${active ? 'bg-cyan-900/20 border-cyan-500/50' : 'bg-slate-900/40 border-slate-800'}
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

           <SciFiCard title="安全风险告知" className="border-red-900/40 bg-red-950/10">
               <div className="space-y-3">
                   <div className="flex items-start gap-3 p-2 bg-red-900/10 border border-red-900/30 rounded">
                       <ShieldAlert className="text-red-500 shrink-0" size={16} />
                       <div>
                           <div className="text-xs font-bold text-red-200 uppercase">High Pressure Hazard</div>
                           <div className="text-[10px] text-red-100/70">严禁带压作业！确保先开启先导回路卸压后再拆卸任何接头。</div>
                       </div>
                   </div>
                   <div className="flex items-start gap-3 p-2 bg-yellow-900/10 border border-yellow-900/30 rounded">
                       <AlertTriangle className="text-yellow-500 shrink-0" size={16} />
                       <div>
                           <div className="text-xs font-bold text-yellow-200 uppercase">Chemical Exposure</div>
                           <div className="text-[10px] text-yellow-100/70">乳化液可能引起皮肤不适，请佩戴耐油防护手套。</div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* --- CENTER: 3D Visualization --- */}
        <div className="flex-1 flex flex-col gap-5 relative">
           
           <div className="flex-1 bg-black border border-cyan-800/30 rounded-lg overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene state={currentState} />
              <div className="absolute bottom-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Overlays */}
               <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-2 rounded flex flex-col items-end">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest">Cylinder Tilt</div>
                       <div className="text-lg font-mono font-bold text-white">1.25°</div>
                       <div className="w-24 h-1 bg-slate-800 mt-1"><div className="bg-cyan-500 h-full w-[20%]"></div></div>
                   </div>
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-2 rounded flex flex-col items-end">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest">Fluid Flow</div>
                       <div className="text-lg font-mono font-bold text-white">45.2 <span className="text-xs text-slate-500">L/min</span></div>
                   </div>
               </div>

               {/* Operation Buttons */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-700 shadow-2xl">
                   <button 
                     onClick={() => {setCurrentStepIdx(0); addLog('重新启动模拟');}}
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

           {/* Console Log Terminal */}
           <div className="h-36 bg-[#020617] border border-slate-800 rounded-lg p-3 font-mono text-xs overflow-y-auto custom-scrollbar shadow-lg">
               <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-800">
                   <div className="w-2 h-2 rounded-full bg-red-500"></div>
                   <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   <span className="ml-2 text-[10px] text-slate-600 uppercase font-bold">Diagnostics Console</span>
               </div>
               {logs.map((log, i) => (
                   <div key={i} className={`mb-1 pl-2 border-l-2 transition-all duration-300 ${log.includes('!!') ? 'border-red-500 text-red-400 font-bold bg-red-900/5' : 'border-cyan-800 text-slate-400 hover:text-cyan-300'}`}>
                       {log}
                   </div>
               ))}
               <div className="text-cyan-500 mt-2 animate-pulse">_</div>
           </div>

        </div>

        {/* --- RIGHT: Analytics & Component Status --- */}
        <div className="w-full lg:w-[360px] flex flex-col gap-5">
           
           <SciFiCard title="立柱压力监测" subtitle="PRESSURE TREND" className="h-[240px] border-cyan-900/50" noPadding>
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={PRESSURE_DATA}>
                          <defs>
                              <linearGradient id="p1Grad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 45]} />
                          <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#06b6d4', fontSize: '10px'}} />
                          <ReferenceLine y={10} stroke="#ef4444" strokeDasharray="3 3" label={{value:'Min', fill:'red', fontSize: 10}} />
                          <Area type="monotone" dataKey="p1" stroke="#06b6d4" fill="url(#p1Grad)" name="Cylinder 1" />
                          <Line type="monotone" dataKey="p2" stroke="#ef4444" strokeWidth={2} dot={false} name="Cylinder 2 (Leak)" />
                      </ComposedChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="阀组元器件状态" subtitle="BOM STATUS" className="flex-1 border-cyan-900/50">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {[
                       { name: '液控单向阀 DN20', status: 'Warning', life: 12, partId: 'V-LCO-02' },
                       { name: '电液换向阀 DN12', status: 'Optimal', life: 85, partId: 'V-SV-08' },
                       { name: '先导操纵阀', status: 'Optimal', life: 92, partId: 'V-PV-01' },
                       { name: '安全截止阀', status: 'Optimal', life: 99, partId: 'V-SF-01' },
                       { name: '高压进液胶管', status: 'Wear', life: 45, partId: 'H-HP-25' },
                   ].map((item, i) => (
                       <div key={i} className="bg-slate-900/40 border border-slate-800 p-2 rounded flex flex-col gap-1 group hover:border-cyan-500/50 transition-colors">
                           <div className="flex justify-between items-center">
                               <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{item.name}</span>
                               <span className={`text-[9px] px-1.5 py-0.5 rounded font-black 
                                   ${item.status === 'Optimal' ? 'bg-green-900/30 text-green-400' : 
                                     item.status === 'Warning' ? 'bg-red-900/30 text-red-400 animate-pulse' : 'bg-yellow-900/30 text-yellow-400'}`}>
                                   {item.status.toUpperCase()}
                               </span>
                           </div>
                           <div className="flex items-center gap-4 text-[10px] text-slate-500">
                               <span>ID: {item.partId}</span>
                               <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                                   <div className={`h-full ${item.life < 30 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{width: `${item.life}%`}}></div>
                               </div>
                               <span className="w-8 text-right">{item.life}%</span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 p-3 rounded text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Fluid Temperature</div>
                  <div className="text-xl font-mono font-bold text-orange-400">48.2 °C</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-3 rounded text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Purity (NAS)</div>
                  <div className="text-xl font-mono font-bold text-green-400">NAS 7</div>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};
