
import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/mining-shovel/ThreeScene';
import { ShovelSimState } from '../../components/maintenance/mining-shovel/three-types';
import { 
  Zap, Activity, Wrench, ShieldAlert, 
  Settings, Gauge, Play, RotateCcw, 
  CheckCircle2, AlertTriangle, Hammer, Ruler,
  Cpu, Thermometer, Droplets, ClipboardList,
  ArrowRight, Search, Scan, Power, Info,
  Tractor, Box,
  // Added BrainCircuit and Terminal to fix missing name errors
  Microscope, BrainCircuit, Terminal
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// --- 模拟实时数据 ---
const CROWD_EFFORT_DATA = Array.from({length: 40}, (_, i) => ({
    time: i,
    current: 450 + Math.sin(i*0.2) * 50 + (i > 30 ? 200 : 0), // 电流波动
    torque: 850 + (Math.random()-0.5) * 40
}));

const HEALTH_STATS = [
    { subject: '起升机构', A: 92, fullMark: 100 },
    { subject: '推压机构', A: 45, fullMark: 100 }, // 故障点
    { subject: '回转系统', A: 88, fullMark: 100 },
    { subject: '行走底盘', A: 95, fullMark: 100 },
    { subject: '钢丝绳状态', A: 82, fullMark: 100 },
];

const SOP_STEPS: { id: ShovelSimState; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'STANDBY', label: '工况监测', desc: '实时分析电机负载特征向量，建立机构运行基准模型。', icon: <Activity size={16}/> },
  { id: 'CROWD_STALL', label: '故障预警', desc: '推压电机电流异常激增，振动频谱检测到二阶谐波超标。', icon: <AlertTriangle size={16}/> },
  { id: 'LOTO_PROCEDURE', label: '安全锁闭', desc: '执行高压配电柜停电、隔离、锁定、挂牌程序。', icon: <Power size={16}/> },
  { id: 'HOOD_REMOVAL', label: '结构解体', desc: '利用桥式行车吊离推压电机总成护罩及后端盖。', icon: <Box size={16}/> },
  { id: 'GEAR_INSPECT', label: '缺陷扫描', desc: '利用工业内窥镜与激光测量仪定位齿轮啮合面损伤。', icon: <Scan size={16}/> },
  { id: 'LASER_REPAIR', label: '激光修复', desc: '执行原位激光熔覆工艺，恢复齿面几何精度。', icon: <Zap size={16}/> },
  { id: 'RELOAD_TEST', label: '负荷验收', desc: '模拟满载挖掘作业，验证机构动态响应指标。', icon: <CheckCircle2 size={16}/> },
];

export const MiningShovelMaintenanceView: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] 矿用电铲 WK-35 数字化维护平台启动...']);
  const [vibeVal, setVibeVal] = useState(2.4);

  const currentStep = SOP_STEPS[currentStepIdx];
  const currentState = currentStep.id;

  // 模拟运行数据
  useEffect(() => {
    const interval = setInterval(() => {
        if (currentState === 'STANDBY' || currentState === 'RELOAD_TEST') {
            setVibeVal(2.4 + (Math.random()-0.5)*0.2);
        } else if (currentState === 'CROWD_STALL') {
            setVibeVal(8.5 + Math.random()*2);
            if (Math.random() > 0.8) addLog('!! 警报：推压机构非正常冲击 (Peak > 12g)');
        } else {
            setVibeVal(0.1);
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentState]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 7)]);
  };

  const nextStep = () => {
    if (currentStepIdx < SOP_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      addLog(`操作指令：执行 ${SOP_STEPS[currentStepIdx + 1].label}`);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 relative overflow-hidden">
      {/* 装饰背板 */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-cyan-900/30 p-4 rounded-lg backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-600/20 border border-orange-500 rounded flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-orange-500/10 animate-pulse"></div>
             <Tractor size={32} className="text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-orange-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <ShieldAlert size={12} className="animate-pulse" /> Maintenance Protocol: Alpha-9
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               矿用电铲关键机构 <span className="text-orange-500 italic">虚拟维护演练</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Asset ID</div>
                <div className="text-2xl font-mono font-black text-white tracking-widest">WK-35-B04</div>
            </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Vibration Index</div>
                <div className={`text-3xl font-mono font-black ${vibeVal > 6 ? 'text-red-500 animate-bounce' : 'text-cyan-400'}`}>
                    {vibeVal.toFixed(1)} <span className="text-sm font-normal text-slate-600">mm/s</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 z-10">
        
        {/* --- LEFT: Operational Roadmap --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="维护引导工序" subtitle="WORKFLOW" className="border-orange-900/30 bg-[#080c14]/80">
              <div className="space-y-4 relative pl-3 mt-2">
                 <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-slate-800"></div>
                 {SOP_STEPS.map((step, idx) => {
                     const active = idx === currentStepIdx;
                     const done = idx < currentStepIdx;
                     return (
                         <div key={step.id} className={`relative transition-all duration-300 ${active ? 'opacity-100 translate-x-2' : 'opacity-40'}`}>
                             <div className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-2 
                                 ${active ? 'bg-orange-500 border-white shadow-[0_0_15px_#f97316]' : 
                                   done ? 'bg-green-500 border-green-700' : 'bg-slate-900 border-slate-700'}
                             `}></div>
                             <div className={`p-3 rounded border flex flex-col gap-1 transition-all
                                 ${active ? 'bg-orange-900/20 border-orange-500/50' : 'bg-slate-900/20 border-slate-800'}
                             `}>
                                 <div className="flex items-center gap-2">
                                     <span className={active ? 'text-orange-400' : 'text-slate-500'}>{step.icon}</span>
                                     <h4 className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-500'}`}>{step.label}</h4>
                                 </div>
                                 {active && <p className="text-[11px] text-slate-400 leading-tight">{step.desc}</p>}
                             </div>
                         </div>
                     );
                 })}
              </div>
           </SciFiCard>

           <SciFiCard title="状态实时日志" className="flex-1 border-slate-800 bg-black/40">
               <div className="h-full overflow-y-auto font-mono text-[10px] space-y-1.5 custom-scrollbar pr-1">
                   {logs.map((log, i) => (
                       <div key={i} className={`pb-1 border-b border-white/5 transition-all duration-300 ${log.includes('!!') ? 'text-red-400 font-bold bg-red-900/5' : 'text-slate-500 hover:text-cyan-300'}`}>
                           {log}
                       </div>
                   ))}
                   <div className="text-orange-600 animate-pulse">_</div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Visualization --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black/80 border border-orange-800/20 rounded-lg overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene state={currentState} />

               {/* Overlays HUD */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-3">
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-2 rounded flex flex-col">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest">Crowd Extension</div>
                       <div className="text-xl font-mono font-bold text-white">4.82 <span className="text-xs text-slate-500">m</span></div>
                   </div>
                   <div className="bg-black/60 backdrop-blur border border-orange-500/30 p-2 rounded flex flex-col">
                       <div className="text-[10px] text-orange-400 font-bold mb-1 uppercase tracking-widest">Bucket Tilt</div>
                       <div className="text-xl font-mono font-bold text-white">12.5 <span className="text-xs text-slate-500">deg</span></div>
                   </div>
               </div>

               {/* Operation Controls */}
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
                     disabled={currentStepIdx === SOP_STEPS.length - 1}
                     className="px-10 py-3 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-full shadow-lg shadow-orange-900/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                   >
                       {currentStepIdx === SOP_STEPS.length - 1 ? '演练完成' : '下一步骤 (Next Step)'}
                       <ArrowRight size={20} />
                   </button>
               </div>
           </div>

           {/* Motor Current Chart (Bottom) */}
           <div className="h-[220px] bg-slate-900/40 border border-slate-800 rounded-lg p-2 overflow-hidden">
               <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>推压电机实时电流波形 (Crowd Motor Current)</span>
                   <span className="text-orange-500">Live</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={CROWD_EFFORT_DATA}>
                       <defs>
                           <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[400, 800]} />
                       <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#f97316'}} />
                       <Area type="monotone" dataKey="current" stroke="#f97316" fill="url(#currentGrad)" strokeWidth={2} name="Current (A)" />
                   </AreaChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* --- RIGHT: Mechanics & BOM --- */}
        <div className="w-full lg:w-[360px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="主要机构健康矩阵" subtitle="SYSTEM HEALTH" className="h-[280px] border-orange-900/30">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={HEALTH_STATS}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Health" dataKey="A" stroke="#f97316" strokeWidth={2} fill="#ea580c" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#f97316'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="核心备件状态" subtitle="BOM STATUS" className="flex-1 border-orange-900/30">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {[
                       { name: '推压机构主齿轮', status: 'Critical', life: 12, partId: 'G-CWD-42' },
                       { name: '起升卷筒轴承', status: 'Optimal', life: 88, partId: 'B-HST-08' },
                       { name: '回转支承密封', status: 'Warning', life: 35, partId: 'S-SWG-12' },
                       { name: '履带销轴组件', status: 'Optimal', life: 92, partId: 'P-TRK-105' },
                       { name: '主电机换向器', status: 'Wear', life: 45, partId: 'M-DCM-01' },
                   ].map((item, i) => (
                       <div key={i} className="bg-slate-900/40 border border-slate-800 p-2 rounded flex flex-col gap-1 group hover:border-cyan-500/50 transition-colors">
                           <div className="flex justify-between items-center">
                               <span className="text-[11px] font-bold text-white group-hover:text-orange-400 transition-colors">{item.name}</span>
                               <span className={`text-[8px] px-1.5 py-0.5 rounded font-black 
                                   ${item.status === 'Optimal' ? 'bg-green-900/30 text-green-400' : 
                                     item.status === 'Warning' || item.status === 'Wear' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400 animate-pulse'}`}>
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

           {/* Expert Diagnosis Tools */}
           <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/50 border border-slate-800 p-3 rounded text-center hover:border-orange-500/50 cursor-pointer transition-all group">
                  <Scan size={20} className="mx-auto text-slate-500 group-hover:text-orange-400 mb-1" />
                  <div className="text-[9px] text-slate-500 uppercase font-bold">Acoustic Analysis</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-3 rounded text-center hover:border-orange-500/50 cursor-pointer transition-all group">
                  <Microscope size={20} className="mx-auto text-slate-500 group-hover:text-orange-400 mb-1" />
                  <div className="text-[9px] text-slate-500 uppercase font-bold">Lubrication Assay</div>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};
