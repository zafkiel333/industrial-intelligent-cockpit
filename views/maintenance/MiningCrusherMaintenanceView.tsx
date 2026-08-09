
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/mining-crusher/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-12]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-12';
import { CrusherSimState } from '../../components/maintenance/mining-crusher/three-types';
import { 
  Pickaxe, Activity, Wrench, Scan, Flame, 
  RotateCcw, Play, CheckCircle2, AlertTriangle, 
  Layers, Thermometer, Hammer, ClipboardList,
  ArrowRight, ShieldAlert, Microscope, Component
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';

// --- MOCK DATA ---
const HEALTH_METRICS = [
  { subject: '结构应力', A: 45, fullMark: 100 }, // Low is bad/high stress
  { subject: '振动稳定性', A: 60, fullMark: 100 },
  { subject: '衬板磨损', A: 85, fullMark: 100 },
  { subject: '润滑油温', A: 92, fullMark: 100 },
  { subject: '紧固件扭矩', A: 98, fullMark: 100 },
  { subject: '主轴跳动', A: 70, fullMark: 100 },
];

const REPLACED_PARTS = [
    { name: '上机架衬套', life: 95, color: '#22c55e' },
    { name: '偏心轴套', life: 88, color: '#22c55e' },
    { name: '动锥衬板', life: 42, color: '#f59e0b' }, // Wearing out
    { name: '机架主肋', life: 15, color: '#ef4444' }, // Critical
];

const STRESS_DATA = Array.from({length: 20}, (_, i) => ({
    time: i,
    stress: 200 + Math.random() * 50 + (i > 10 ? 150 : 0) // Stress spike
}));

const STEPS: { id: CrusherSimState; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'OPERATION', label: '运行监测', desc: '实时监控破碎机振动、电流与油温。检测到机架异常振动频谱。', icon: <Activity size={16}/> },
  { id: 'ALARM', label: '故障锁定', desc: '声发射传感器定位到上机架环形筋板处存在裂纹扩展信号。', icon: <ShieldAlert size={16}/> },
  { id: 'DISASSEMBLY', label: '停机拆解', desc: '拆除给料斗及上机架总成，暴露受损区域。', icon: <Layers size={16}/> },
  { id: 'NDT_SCAN', label: '探伤检测', desc: '使用便携式激光扫描仪与超声波探伤仪(UT)确定裂纹深度与走向。', icon: <Scan size={16}/> },
  { id: 'WELDING', label: '焊接修复', desc: '执行机器人自动坡口加工与多层多道堆焊修复工艺。', icon: <Flame size={16}/> },
  { id: 'HEAT_TREAT', label: '热处理', desc: '局部感应加热进行焊后消应力处理，防止二次开裂。', icon: <Thermometer size={16}/> },
  { id: 'REASSEMBLY', label: '回装试车', desc: '重新组装设备，调整排矿口(CSS)，进行负荷试车验证。', icon: <RotateCcw size={16}/> },
];

export const MiningCrusherMaintenanceView: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] 矿山破碎站智能运维系统上线...']);
  const [stressVal, setStressVal] = useState(240);

  const currentStep = STEPS[currentStepIdx];
  const currentState = currentStep.id;

  // Simulation Logic
  useEffect(() => {
    let interval: any;
    if (currentState === 'OPERATION') {
        interval = setInterval(() => {
            setStressVal(240 + Math.random() * 20);
        }, 500);
    } else if (currentState === 'ALARM') {
        setStressVal(450 + Math.random() * 50); // High stress
        addLog('!! 警报：机架应力集中系数超标 (K=2.4)');
    } else if (currentState === 'WELDING') {
        addLog('>> 焊接机器人介入，电流: 280A, 电压: 32V');
    }
    return () => clearInterval(interval);
  }, [currentState]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  const nextStep = () => {
    if (currentStepIdx < STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      addLog(`工序切换: ${STEPS[currentStepIdx + 1].label}`);
    } else {
        setCurrentStepIdx(0);
        addLog('流程重置');
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-stone-200 bg-[#1c1917]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between bg-stone-900/80 border-b border-amber-600/40 p-4 rounded-t-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <Pickaxe size={14} /> Heavy Machinery Maintenance
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             矿用圆锥破碎机 <span className="text-amber-600">结构损伤模拟维修</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
             <div className="flex items-center gap-3 bg-stone-800/50 px-4 py-2 rounded border border-stone-700">
                 <Hammer size={18} className={currentState === 'ALARM' ? 'text-red-500 animate-bounce' : 'text-amber-500'} />
                 <div>
                     <div className="text-[10px] text-stone-500 uppercase">Operation Status</div>
                     <div className={`text-sm font-bold ${currentState === 'ALARM' ? 'text-red-500' : 'text-white'}`}>
                         {currentState}
                     </div>
                 </div>
             </div>
             <div className="h-8 w-[1px] bg-stone-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase">Current Step</div>
                <div className="text-xl font-bold text-white">{currentStep.label}</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Step Timeline */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           <SciFiCard title="维修工序流 (Workflow)" className="border-amber-700/50 bg-[#0c0a09]">
              <div className="relative pl-4 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-800">
                 {STEPS.map((step, idx) => {
                     const active = idx === currentStepIdx;
                     const past = idx < currentStepIdx;
                     return (
                         <div key={step.id} className={`relative transition-all duration-300 ${active ? 'opacity-100 scale-105 origin-left' : 'opacity-60'}`}>
                             <div className={`absolute -left-[13px] top-0 w-3 h-3 rounded-full 
                                 ${active ? 'bg-amber-500 shadow-[0_0_8px_orange]' : past ? 'bg-green-500' : 'bg-stone-700'}
                             `}></div>
                             <div className={`p-3 rounded border ${active ? 'bg-amber-900/20 border-amber-500/50' : 'bg-stone-900/40 border-stone-800'}`}>
                                 <div className="flex items-center gap-2 mb-1">
                                     <span className={active ? 'text-amber-400' : 'text-stone-500'}>{step.icon}</span>
                                     <h4 className="text-sm font-bold text-white">{step.label}</h4>
                                 </div>
                                 {active && <p className="text-xs text-stone-300 leading-relaxed">{step.desc}</p>}
                             </div>
                         </div>
                     );
                 })}
              </div>
           </SciFiCard>

           <SciFiCard title="维修工具箱" className="flex-1 border-stone-700">
               <div className="grid grid-cols-2 gap-2">
                   {['液压扳手', '激光扫描仪', '焊接机器人', '超声探伤仪', '感应加热器', '行车吊具'].map((tool, i) => (
                       <div key={i} className="bg-stone-800/50 p-2 rounded text-xs text-stone-400 text-center border border-stone-700 hover:border-amber-600 hover:text-amber-500 transition-colors cursor-pointer">
                           {tool}
                       </div>
                   ))}
               </div>
           </SciFiCard>
        </div>

        {/* CENTER: 3D Workspace */}
        <div className="flex-1 flex flex-col gap-4 relative">
           <div className="flex-1 bg-[#151210] border border-amber-800/30 rounded-lg overflow-hidden relative shadow-2xl">
               
               {/* HUD Overlays */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                   <div className="bg-black/60 backdrop-blur border border-amber-600/30 p-2 rounded w-48">
                       <div className="text-[10px] text-amber-500 font-bold mb-1 flex items-center gap-2">
                           <Activity size={12}/> FRAME STRESS MONITOR
                       </div>
                       <div className="flex justify-between text-xs font-mono text-stone-300">
                           <span>Peak:</span>
                           <span className={stressVal > 400 ? 'text-red-500 font-bold' : 'text-green-400'}>{stressVal.toFixed(0)} MPa</span>
                       </div>
                       <div className="w-full h-1 bg-stone-800 mt-1 rounded overflow-hidden">
                           <div className={`h-full ${stressVal > 400 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${(stressVal/600)*100}%`}}></div>
                       </div>
                   </div>
               </div>

               {/* 3D Scene */}
               <ThreeScene state={currentState} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Control Bar */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-black/80 p-2 rounded-full border border-stone-700 shadow-xl">
                   <button onClick={() => {setCurrentStepIdx(0); addLog('重置系统');}} className="p-3 hover:bg-stone-700 rounded-full text-stone-400 transition-colors">
                       <RotateCcw size={18}/>
                   </button>
                   <div className="h-8 w-[1px] bg-stone-700"></div>
                   <button 
                     onClick={nextStep}
                     className="px-6 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-full font-bold flex items-center gap-2 transition-all hover:scale-105"
                   >
                       {currentStepIdx === STEPS.length - 1 ? '完成演练' : '下一步 (Next)'} <ArrowRight size={16}/>
                   </button>
               </div>
           </div>

           {/* Logs */}
           <div className="h-32 bg-stone-900/80 border-t border-stone-700 font-mono text-xs p-3 overflow-y-auto rounded-b-lg">
               {logs.map((log, i) => (
                   <div key={i} className="mb-1 text-stone-400 border-l-2 border-amber-700 pl-2">
                       {log}
                   </div>
               ))}
           </div>
        </div>

        {/* RIGHT: Health & Analytics */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4">
           
           <SciFiCard title="结构健康矩阵" subtitle="HEALTH SCORE" className="h-[250px] border-amber-900/50" noPadding>
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={HEALTH_METRICS}>
                           <PolarGrid stroke="#44403c" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#a8a29e', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Status" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#1c1917', borderColor: '#f59e0b'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="应力历史曲线" subtitle="TREND" className="h-[200px] border-stone-700">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={STRESS_DATA}>
                           <defs>
                               <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#44403c" vertical={false} />
                           <XAxis dataKey="time" hide />
                           <YAxis hide domain={[0, 600]} />
                           <Tooltip contentStyle={{backgroundColor: '#1c1917', borderColor: '#ef4444'}} />
                           <Area type="monotone" dataKey="stress" stroke="#ef4444" fill="url(#colorStress)" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="零部件寿命预测" className="flex-1 border-stone-700">
               <div className="flex flex-col gap-3">
                   {REPLACED_PARTS.map((part, i) => (
                       <div key={i} className="flex flex-col gap-1">
                           <div className="flex justify-between text-xs">
                               <span className="text-stone-300">{part.name}</span>
                               <span style={{color: part.color}} className="font-bold">{part.life}%</span>
                           </div>
                           <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                               <div className="h-full transition-all duration-500" style={{width: `${part.life}%`, backgroundColor: part.color}}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
