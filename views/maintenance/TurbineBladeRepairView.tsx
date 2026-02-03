
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/turbine-repair/ThreeScene';
import { RepairStep } from '../../components/maintenance/turbine-repair/three-types';
import { 
  Microscope, Scan, Zap, Hammer, CheckCircle2, 
  Play, RotateCcw, AlertTriangle, Layers, Thermometer,
  FileText, Activity, BoxSelect
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// --- MOCK DATA ---
const CAVITATION_DATA = [
  { zone: 'Leading Edge', depth: 4.5, area: 120 },
  { zone: 'Suction Side', depth: 8.2, area: 350 },
  { zone: 'Pressure Side', depth: 2.1, area: 80 },
  { zone: 'Trailing Edge', depth: 1.5, area: 40 },
];

const WELD_PARAMS = Array.from({length: 20}, (_, i) => ({
    time: i,
    temp: 1400 + Math.random() * 100,
    current: 180 + Math.random() * 20
}));

const PROCESS_STEPS: { id: RepairStep; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'SCANNING', label: '3D 扫描建模', desc: '获取损伤表面高精度点云数据，生成修复路径。', icon: <Scan size={16}/> },
  { id: 'CLEANING', label: '表面预处理', desc: '激光清洗去除氧化层与疲劳层，露出金属基体。', icon: <Layers size={16}/> },
  { id: 'WELDING', label: '激光熔覆/堆焊', desc: '机器人自动执行多层堆焊，控制热输入防止变形。', icon: <Zap size={16}/> },
  { id: 'GRINDING', label: '仿形打磨', desc: '去除多余焊料，恢复叶片原始水力型线。', icon: <Hammer size={16}/> },
  { id: 'INSPECT', label: '探伤与质检', desc: 'PT/UT 无损检测，确认无裂纹气孔。', icon: <CheckCircle2 size={16}/> },
];

export const TurbineBladeRepairView: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [logs, setLogs] = useState<string[]>(['[System] 修复工作站就绪，载入叶片模型 #B-04...']);

  const currentStep = PROCESS_STEPS[currentStepIdx];

  useEffect(() => {
    let interval: any;
    if (autoPlay) {
        interval = setInterval(() => {
            if (currentStepIdx < PROCESS_STEPS.length - 1) {
                setCurrentStepIdx(prev => prev + 1);
                addLog(`>>> 自动流程: 进入 ${PROCESS_STEPS[currentStepIdx + 1].label}`);
            } else {
                setAutoPlay(false);
                addLog('>>> 自动流程完成。');
            }
        }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoPlay, currentStepIdx]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 5)]);
  };

  const handleStepChange = (idx: number) => {
      setCurrentStepIdx(idx);
      addLog(`>>> 手动切换至: ${PROCESS_STEPS[idx].label}`);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#0f172a]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between bg-slate-900/80 border-b border-cyan-500/30 p-4 rounded-t-lg">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Microscope size={14} /> Precision Engineering Lab
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             水轮机叶片 <span className="text-cyan-500">空蚀修复全过程仿真</span>
          </h1>
        </div>
        
        <div className="flex gap-4">
            <button 
              onClick={() => setAutoPlay(!autoPlay)}
              className={`flex items-center gap-2 px-4 py-2 rounded font-bold transition-all ${autoPlay ? 'bg-red-900/50 text-red-300 border border-red-500' : 'bg-green-600 hover:bg-green-500 text-white'}`}
            >
                {autoPlay ? <PauseIcon /> : <Play size={16} />}
                {autoPlay ? '停止自动演示' : '开始自动演示'}
            </button>
            <button 
              onClick={() => { setCurrentStepIdx(0); setAutoPlay(false); addLog('流程重置'); }}
              className="p-2 rounded border border-slate-600 hover:bg-slate-700 text-slate-400"
            >
                <RotateCcw size={18} />
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Analysis & Damage */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="空蚀损伤评估" subtitle="SCAN DATA" className="border-cyan-900/50">
              <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-slate-900/50 p-3 rounded border border-slate-700">
                      <div className="p-2 bg-red-900/20 rounded-full text-red-500"><AlertTriangle size={20}/></div>
                      <div>
                          <div className="text-xs text-slate-400">最大蚀坑深度</div>
                          <div className="text-2xl font-bold text-white">8.2 <span className="text-sm font-normal text-slate-500">mm</span></div>
                      </div>
                  </div>

                  <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={CAVITATION_DATA} layout="vertical" margin={{left: 10, right: 10}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                              <XAxis type="number" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis dataKey="zone" type="category" stroke="#94a3b8" width={80} tick={{fontSize: 10}} />
                              <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9'}} />
                              <Bar dataKey="area" name="Area (cm²)" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={15} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
                  
                  <div className="text-xs text-slate-400 leading-relaxed bg-slate-900/30 p-2 rounded">
                      <strong className="text-cyan-400">诊断报告：</strong> 
                      叶片吸力面出水边存在典型蜂窝状空蚀坑，伴有晶间腐蚀。建议采用马氏体不锈钢粉末进行激光熔覆修复。
                  </div>
              </div>
           </SciFiCard>

           <SciFiCard title="修复工艺参数" subtitle="PARAMETERS" className="flex-1 border-cyan-900/50">
               <div className="flex flex-col gap-3">
                   <div className="flex justify-between items-center p-2 border-b border-slate-800">
                       <span className="text-xs text-slate-400 flex items-center gap-2"><Zap size={12}/> Laser Power</span>
                       <span className="font-mono text-cyan-300">2.5 kW</span>
                   </div>
                   <div className="flex justify-between items-center p-2 border-b border-slate-800">
                       <span className="text-xs text-slate-400 flex items-center gap-2"><Activity size={12}/> Scanning Speed</span>
                       <span className="font-mono text-cyan-300">12 mm/s</span>
                   </div>
                   <div className="flex justify-between items-center p-2 border-b border-slate-800">
                       <span className="text-xs text-slate-400 flex items-center gap-2"><Layers size={12}/> Layer Height</span>
                       <span className="font-mono text-cyan-300">0.8 mm</span>
                   </div>
                   <div className="flex justify-between items-center p-2">
                       <span className="text-xs text-slate-400 flex items-center gap-2"><BoxSelect size={12}/> Overlap Rate</span>
                       <span className="font-mono text-cyan-300">45%</span>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Workspace */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black/40 border border-slate-700 rounded-lg relative overflow-hidden shadow-inner">
               {/* Step Indicator Overlay */}
               <div className="absolute top-4 left-4 z-20 flex gap-2">
                   <div className="px-3 py-1 bg-cyan-900/80 border border-cyan-500/50 rounded text-cyan-200 text-xs font-bold uppercase flex items-center gap-2">
                       {currentStep.icon} {currentStep.label}
                   </div>
               </div>

               {/* Robotic Arm Telemetry */}
               <div className="absolute top-4 right-4 z-20 w-48 bg-black/60 backdrop-blur border border-slate-700 p-2 rounded">
                   <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Robot Telemetry</div>
                   <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-white">
                       <div>X: 124.5</div>
                       <div>Y: 45.2</div>
                       <div>Z: -12.0</div>
                       <div>J1: 45°</div>
                       <div>J2: -12°</div>
                       <div>J3: 88°</div>
                   </div>
               </div>

               <ThreeScene step={currentStep.id} />
           </div>

           {/* Timeline Control */}
           <div className="h-24 bg-slate-900/50 border border-slate-800 rounded p-4 flex items-center justify-between">
               {PROCESS_STEPS.map((step, idx) => {
                   const isActive = idx === currentStepIdx;
                   const isPast = idx < currentStepIdx;
                   return (
                       <div 
                         key={step.id} 
                         className={`flex-1 flex flex-col items-center cursor-pointer group relative`}
                         onClick={() => handleStepChange(idx)}
                       >
                           {/* Connecting Line */}
                           {idx < PROCESS_STEPS.length - 1 && (
                               <div className={`absolute top-3 left-[50%] w-full h-0.5 ${isPast ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>
                           )}
                           
                           <div className={`
                               w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all
                               ${isActive ? 'bg-cyan-500 text-white scale-125 shadow-[0_0_10px_cyan]' : 
                                 isPast ? 'bg-cyan-900 text-cyan-400 border border-cyan-700' : 'bg-slate-800 text-slate-500 border border-slate-700'}
                           `}>
                               {isPast ? <CheckCircle2 size={12}/> : <span className="text-[10px]">{idx + 1}</span>}
                           </div>
                           <div className={`mt-2 text-xs font-bold ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                               {step.id}
                           </div>
                       </div>
                   );
               })}
           </div>

        </div>

        {/* RIGHT: Quality & Logs */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4">
           
           <SciFiCard title="熔池温度监测 (IR)" subtitle="THERMAL" className="h-[200px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={WELD_PARAMS}>
                           <defs>
                               <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                   <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                           <XAxis hide />
                           <YAxis hide domain={['dataMin', 'dataMax']} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                           <Area type="monotone" dataKey="temp" stroke="#f59e0b" fill="url(#colorTemp)" strokeWidth={2} />
                       </AreaChart>
                   </ResponsiveContainer>
                   <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-orange-400">
                       <Thermometer size={12} /> 1450°C
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="仿真日志" className="flex-1 border-slate-800">
               <div className="h-full overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
                   {logs.map((log, i) => (
                       <div key={i} className="text-[10px] font-mono text-slate-400 border-l-2 border-slate-700 pl-2 py-1">
                           {log}
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};

function PauseIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
    )
}
