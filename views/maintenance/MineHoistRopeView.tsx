
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/mine-hoist-rope/ThreeScene';
import { RopeSimState } from '../../components/maintenance/mine-hoist-rope/three-types';
import { 
  ArrowDown, ArrowUp, Activity, AlertTriangle, 
  CheckCircle2, Lock, Unlock, Zap, Scan, 
  RotateCcw, Play, Wrench, FileText, Ruler, ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// --- MOCK DATA ---
const SCAN_DATA = Array.from({length: 50}, (_, i) => ({
    dist: i * 20, // meters
    lf: Math.random() * 2 + (i === 25 ? 8.5 : 0), // Local Fault (broken wire) %
    lma: 98 - Math.random() * 1 // Loss of Metallic Area %
}));

const TENSION_DATA = [
    { subject: 'Rope 1', A: 120, fullMark: 150 },
    { subject: 'Rope 2', A: 118, fullMark: 150 },
    { subject: 'Rope 3', A: 95, fullMark: 150 }, // Slack
    { subject: 'Rope 4', A: 122, fullMark: 150 },
];

const STEPS: { id: RopeSimState; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'SCANNING', label: '无损探伤', desc: '启动MRT电磁探伤仪，全长扫描钢丝绳断丝与磨损情况。', icon: <Scan size={16}/> },
  { id: 'FAULT_LOCATED', label: '缺陷定位', desc: '系统自动锁定重大缺陷位置(LF > 8%)，发出更换建议。', icon: <AlertTriangle size={16}/> },
  { id: 'LOCKING', label: '稳罐闭锁', desc: '下放箕斗至检修平台，投入液压稳罐装置，锁定容器。', icon: <Lock size={16}/> },
  { id: 'DETACH_OLD', label: '旧绳回收', desc: '切断旧绳连接，通过辅助绞车缓慢回收旧钢丝绳。', icon: <ArrowUp size={16}/> },
  { id: 'INSTALL_NEW', label: '新绳挂装', desc: '引入新型三角股钢丝绳，下放至容器连接装置。', icon: <ArrowDown size={16}/> },
  { id: 'TENSIONING', label: '张力平衡', desc: '调整液压调绳装置，确保四绳张力差 < 5%。', icon: <Activity size={16}/> },
  { id: 'COMPLETE', label: '试运验收', desc: '解锁容器，进行空载与重载试运行，验证各项指标。', icon: <CheckCircle2 size={16}/> },
];

export const MineHoistRopeView: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] 提升系统维护模块就绪...']);
  const [tensionData, setTensionData] = useState(TENSION_DATA);

  const currentStep = STEPS[currentStepIdx];
  const currentState = currentStep.id;

  // Logic Simulation
  useEffect(() => {
    if (currentState === 'FAULT_LOCATED') {
        addLog('!! 警报：检测到距井口500m处存在集中断丝，LMA损失>8%');
        addLog('>> 建议立即执行换绳程序');
    } else if (currentState === 'TENSIONING') {
        const interval = setInterval(() => {
            // Simulate balancing process
            setTensionData(prev => prev.map(p => ({
                ...p,
                A: p.A < 115 ? p.A + 2 : p.A > 125 ? p.A - 2 : p.A
            })));
        }, 500);
        return () => clearInterval(interval);
    } else if (currentState === 'COMPLETE') {
        addLog('>> 换绳完成。张力不平衡度: 1.2% (合格)');
    }
  }, [currentState]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 8)]);
  };

  const nextStep = () => {
    if (currentStepIdx < STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      addLog(`工序推进: ${STEPS[currentStepIdx + 1].label}`);
    }
  };

  const reset = () => {
      setCurrentStepIdx(0);
      setTensionData(TENSION_DATA);
      addLog('流程重置');
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-stone-200 bg-[#0c0a09]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between bg-stone-900/80 border-b border-amber-600/40 p-4 rounded-t-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <Wrench size={14} /> Critical Asset Maintenance
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             矿山提升机 <span className="text-amber-600">钢丝绳失效更换模拟</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase">Rope Service Life</div>
                <div className="text-xl font-bold text-red-500">CRITICAL (2.1 Years)</div>
            </div>
            <div className="h-8 w-[1px] bg-stone-700"></div>
            <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase">Current Operation</div>
                <div className="text-xl font-bold text-white">{currentStep.label}</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Diagnostics */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="探伤数据分析 (MRT)" subtitle="FLUX LEAKAGE" className="h-[280px] border-amber-900/50 bg-[#1c1917]" noPadding>
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={SCAN_DATA}>
                          <defs>
                              <linearGradient id="colorLF" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                          <XAxis dataKey="dist" stroke="#666" tick={{fontSize: 10}} label={{ value: 'Depth (m)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#666' }} />
                          <YAxis stroke="#ef4444" tick={{fontSize: 10}} domain={[0, 10]} label={{ value: 'LF (%)', angle: -90, position: 'insideLeft', fill: '#ef4444', fontSize: 10 }} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#ef4444'}} />
                          <ReferenceLine y={8} stroke="red" strokeDasharray="3 3" label={{value:'Reject', fill:'red', fontSize:10}} />
                          <Area type="monotone" dataKey="lf" stroke="#ef4444" fill="url(#colorLF)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="钢丝绳参数" className="flex-1 border-amber-900/50">
               <div className="flex flex-col gap-3">
                   <div className="flex justify-between items-center p-2 border-b border-stone-800">
                       <span className="text-xs text-stone-400">Rope Type</span>
                       <span className="font-mono text-white">6V × 48S + FC</span>
                   </div>
                   <div className="flex justify-between items-center p-2 border-b border-stone-800">
                       <span className="text-xs text-stone-400">Diameter</span>
                       <span className="font-mono text-white">42 mm</span>
                   </div>
                   <div className="flex justify-between items-center p-2 border-b border-stone-800">
                       <span className="text-xs text-stone-400">Breaking Load</span>
                       <span className="font-mono text-amber-500">1450 kN</span>
                   </div>
                   <div className="flex justify-between items-center p-2">
                       <span className="text-xs text-stone-400">Safety Factor</span>
                       <span className="font-mono text-red-400 font-bold">5.8 (Low)</span>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Twin */}
        <div className="flex-1 flex flex-col gap-4 relative">
           <div className="flex-1 bg-[#151210] border border-amber-800/40 rounded-lg overflow-hidden relative shadow-2xl group">
               
               {/* HUD Overlays */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                   <div className="bg-black/60 backdrop-blur border border-amber-600/30 p-2 rounded w-48">
                       <div className="text-[10px] text-amber-500 font-bold mb-1 flex items-center gap-2">
                           <Activity size={12}/> ROPE TENSION MONITOR
                       </div>
                       <div className="h-32 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={tensionData}>
                                   <PolarGrid stroke="#44403c" />
                                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#a8a29e', fontSize: 10 }} />
                                   <PolarRadiusAxis angle={30} domain={[80, 140]} tick={false} axisLine={false} />
                                   <Radar name="Tension" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.3} />
                               </RadarChart>
                           </ResponsiveContainer>
                       </div>
                   </div>
               </div>

               {/* 3D Scene */}
               <ThreeScene state={currentState} />

               {/* Control Bar */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-black/80 p-2 rounded-full border border-stone-700 shadow-xl">
                   <button onClick={reset} className="p-3 hover:bg-stone-700 rounded-full text-stone-400 transition-colors">
                       <RotateCcw size={18}/>
                   </button>
                   <div className="h-8 w-[1px] bg-stone-700"></div>
                   <button 
                     onClick={nextStep}
                     disabled={currentStepIdx >= STEPS.length - 1}
                     className="px-6 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-full font-bold flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
                   >
                       {currentStepIdx === STEPS.length - 1 ? '完成' : '下一步 (Next)'} 
                       {currentState === 'SCANNING' || currentState === 'DETACH_OLD' ? <Activity className="animate-spin" size={16}/> : <ArrowRight size={16}/>}
                   </button>
               </div>
           </div>

           {/* Logs */}
           <div className="h-32 bg-stone-900/80 border-t border-stone-700 font-mono text-xs p-3 overflow-y-auto rounded-b-lg custom-scrollbar">
               {logs.map((log, i) => (
                   <div key={i} className="mb-1 text-stone-400 border-l-2 border-amber-700 pl-2">
                       {log}
                   </div>
               ))}
           </div>
        </div>

        {/* RIGHT: SOP & Tools */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4">
           
           <SciFiCard title="换绳作业流程" subtitle="SOP" className="flex-1 border-amber-900/50">
               <div className="relative pl-4 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-800">
                   {STEPS.map((step, idx) => {
                       const active = idx === currentStepIdx;
                       const done = idx < currentStepIdx;
                       return (
                           <div key={step.id} className="relative">
                               <div className={`absolute -left-[13px] top-0 w-3 h-3 rounded-full border-2 
                                   ${active ? 'bg-amber-500 border-amber-300' : done ? 'bg-green-500 border-green-700' : 'bg-stone-800 border-stone-600'}
                               `}></div>
                               <div className={`p-2 rounded border transition-all ${active ? 'bg-amber-900/20 border-amber-500/50' : 'bg-transparent border-transparent'}`}>
                                   <div className={`text-xs font-bold ${active ? 'text-white' : 'text-stone-500'}`}>{step.label}</div>
                                   {active && <div className="text-[10px] text-stone-400 mt-1">{step.desc}</div>}
                               </div>
                           </div>
                       );
                   })}
               </div>
           </SciFiCard>

           <SciFiCard title="所需工具与备件" className="border-stone-700">
               <div className="grid grid-cols-2 gap-2">
                   {['液压调绳器', '首绳悬挂装置', '稳罐索具', '辅助绞车', '力矩扳手', '对讲机'].map((tool, i) => (
                       <div key={i} className="bg-stone-800/50 p-2 rounded text-[10px] text-stone-300 text-center border border-stone-700">
                           {tool}
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
