
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/dredging-hydraulic/ThreeScene';
import { DredgingSimState } from '../../components/maintenance/dredging-hydraulic/three-types';
import { 
  Activity, Droplets, RotateCcw, Play, Wrench, 
  Settings, Gauge, AlertTriangle, ArrowRight,
  Filter, CheckCircle2, FlaskConical, Anchor
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, AreaChart, Area,
  BarChart, Bar, Cell
} from 'recharts';

// --- MOCK DATA ---
const PRESSURE_LOG = Array.from({length: 30}, (_, i) => ({
    time: i,
    pMain: 25 + Math.random() * 0.5, // MPa
    pPilot: 3.5 + Math.random() * 0.1
}));

const OIL_CONTAMINATION = [
    { size: '>4µm', count: 12500, limit: 10000 },
    { size: '>6µm', count: 4200, limit: 3000 },
    { size: '>14µm', count: 850, limit: 500 },
];

const STEPS: { id: DredgingSimState; label: string; desc: string; }[] = [
  { id: 'DREDGING', label: '正常作业', desc: '监测系统压力与绞刀扭矩。' },
  { id: 'STALL', label: '故障报警', desc: '绞刀液压系统压力突降，动作卡滞，疑似阀芯卡堵。' },
  { id: 'DIAGNOSE', label: '油液诊断', desc: '提取油样分析，NAS清洁度等级超标 (NAS 10级)。' },
  { id: 'FLUSHING', label: '在线冲洗', desc: '开启旁路过滤系统，提升油液清洁度。' },
  { id: 'REPLACE_VALVE', label: '更换伺服阀', desc: '隔离故障回路，更换受损的电液比例阀。' },
  { id: 'TEST', label: '试运行', desc: '恢复压力，进行空载与负载动作测试。' },
];

export const DredgingHydraulicMaintenanceView: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] 绞吸船液压监控系统上线...']);
  const [pressureData, setPressureData] = useState(PRESSURE_LOG);
  const [cleanliness, setCleanliness] = useState(10); // NAS Grade

  const currentStep = STEPS[currentStepIdx];
  const currentState = currentStep.id;

  // Simulation Logic
  useEffect(() => {
    const interval = setInterval(() => {
        // Update Chart
        setPressureData(prev => {
            const last = prev[prev.length-1];
            let newMain = 25;
            
            if (currentState === 'STALL') newMain = 5 + Math.random() * 2; // Pressure drop
            else if (currentState === 'FLUSHING' || currentState === 'REPLACE_VALVE') newMain = 0; // depressurized
            else newMain = 25 + Math.random() * 0.5;

            return [...prev.slice(1), { 
                time: last.time + 1, 
                pMain: newMain, 
                pPilot: 3.5 + Math.random() * 0.1 
            }];
        });

        // Cleanliness improvement
        if (currentState === 'FLUSHING') {
            setCleanliness(prev => Math.max(5, prev - 0.5));
        } else if (currentState === 'DREDGING') {
            setCleanliness(6);
        } else if (currentState === 'STALL' || currentState === 'DIAGNOSE') {
            setCleanliness(10);
        }

    }, 800);
    return () => clearInterval(interval);
  }, [currentState]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  const nextStep = () => {
    if (currentStepIdx < STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      addLog(`切换流程: ${STEPS[currentStepIdx + 1].label}`);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#0f172a]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between bg-slate-900/80 border-b border-amber-500/30 p-4 rounded-t-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <Anchor size={14} /> Dredging Operations
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             航道疏浚设备 <span className="text-amber-500">液压系统维修模拟</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">System Mode</div>
                <div className={`text-xl font-bold ${currentState === 'STALL' ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {currentState}
                </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-700"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Oil Cleanliness</div>
                <div className={`text-2xl font-mono font-bold ${cleanliness > 8 ? 'text-red-500' : 'text-green-400'}`}>
                    NAS {cleanliness.toFixed(0)}
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Schematic & Analysis */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           {/* P&ID Schematic Placeholder */}
           <SciFiCard title="液压原理图 (Schematic)" subtitle="HPU STATUS" className="h-[240px] border-amber-900/50 bg-[#0b1221]" noPadding>
              <div className="w-full h-full p-4 relative flex items-center justify-center">
                  <div className="w-full h-full border border-slate-700 rounded relative opacity-80">
                      {/* Abstract P&ID Drawing */}
                      <svg width="100%" height="100%">
                          <defs>
                              <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                                <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
                              </marker>
                          </defs>
                          <rect x="20%" y="70%" width="60%" height="20%" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 5" />
                          <text x="50%" y="85%" textAnchor="middle" fill="#f59e0b" fontSize="10">Oil Tank</text>
                          
                          <circle cx="50%" cy="50%" r="15" fill="none" stroke="#64748b" strokeWidth="2" />
                          <path d="M50% 50% L60% 40%" stroke="#64748b" />
                          <text x="50%" y="55%" textAnchor="middle" fill="#fff" fontSize="8">PUMP</text>

                          <line x1="50%" y1="70%" x2="50%" y2="65%" stroke="#64748b" strokeWidth="2" />
                          <line x1="50%" y1="35%" x2="50%" y2="20%" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
                          
                          {/* Proportional Valve */}
                          <rect x="40%" y="20%" width="20%" height="10%" fill={currentState === 'STALL' ? '#ef4444' : '#334155'} stroke="#fff" />
                          <text x="50%" y="26%" textAnchor="middle" fill="#fff" fontSize="8">VALVE</text>
                      </svg>
                      
                      {currentState === 'STALL' && (
                          <div className="absolute top-[20%] left-[65%] text-xs text-red-500 font-bold bg-black/80 px-1 border border-red-500">
                              BLOCKAGE
                          </div>
                      )}
                  </div>
              </div>
           </SciFiCard>

           {/* Oil Analysis */}
           <SciFiCard title="油液颗粒计数" subtitle="ISO 4406" className="flex-1 border-amber-900/50">
              <div className="w-full h-full min-h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={OIL_CONTAMINATION} layout="vertical" margin={{left: 0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                          <XAxis type="number" stroke="#94a3b8" tick={{fontSize: 10}} />
                          <YAxis dataKey="size" type="category" stroke="#94a3b8" width={50} tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#f59e0b'}} />
                          <Bar dataKey="count" fill="#f59e0b" barSize={15} radius={[0,4,4,0]}>
                              {OIL_CONTAMINATION.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={cleanliness > 8 ? '#ef4444' : '#10b981'} />
                              ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
              <div className="text-xs text-slate-400 mt-2 bg-slate-900/50 p-2 rounded">
                  <div className="flex justify-between">
                      <span>Water Content:</span>
                      <span className="text-white">120 ppm</span>
                  </div>
                  <div className="flex justify-between">
                      <span>Viscosity (40°C):</span>
                      <span className="text-white">45.2 cSt</span>
                  </div>
              </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Visualization */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-[#0c0a09] border border-amber-800/40 rounded-lg overflow-hidden relative shadow-inner">
               {/* 3D Scene */}
               <ThreeScene state={currentState} />

               {/* Overlay: Tools */}
               {currentState === 'FLUSHING' && (
                   <div className="absolute bottom-4 left-4 bg-black/70 p-3 rounded border border-blue-500/50 flex items-center gap-3">
                       <Filter size={24} className="text-blue-400 animate-pulse" />
                       <div>
                           <div className="text-xs text-blue-200 font-bold">FLUSHING ACTIVE</div>
                           <div className="text-[10px] text-slate-400">Flow: 250 L/min</div>
                       </div>
                   </div>
               )}
               {currentState === 'REPLACE_VALVE' && (
                   <div className="absolute bottom-4 left-4 bg-black/70 p-3 rounded border border-yellow-500/50 flex items-center gap-3">
                       <Wrench size={24} className="text-yellow-400" />
                       <div>
                           <div className="text-xs text-yellow-200 font-bold">MAINTENANCE MODE</div>
                           <div className="text-[10px] text-slate-400">System Depressurized</div>
                       </div>
                   </div>
               )}

               {/* Step Controls */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-600 shadow-xl">
                   <button 
                     onClick={() => {setCurrentStepIdx(0); addLog('重置系统');}}
                     className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-600 transition-colors"
                   >
                       <RotateCcw size={20} className="text-slate-400"/>
                   </button>
                   
                   <div className="flex items-center px-4 gap-2">
                       <span className="text-xs text-slate-400 uppercase tracking-widest">Step {currentStepIdx + 1} / {STEPS.length}</span>
                   </div>

                   <button 
                     onClick={nextStep}
                     disabled={currentStepIdx >= STEPS.length - 1}
                     className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-full shadow-lg shadow-amber-900/50 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                       <Play size={20} fill="currentColor" />
                       {currentStepIdx === STEPS.length - 1 ? '完成' : '下一步'}
                   </button>
               </div>
           </div>

           {/* Pressure Monitor */}
           <SciFiCard title="主系统压力曲线" subtitle="PRESSURE (MPa)" className="h-[200px] border-amber-900/50" noPadding>
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={pressureData}>
                          <defs>
                              <linearGradient id="colorPress" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis domain={[0, 30]} stroke="#64748b" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#f59e0b'}} />
                          <Area type="monotone" dataKey="pMain" stroke="#f59e0b" fill="url(#colorPress)" strokeWidth={2} />
                          <Line type="monotone" dataKey="pPilot" stroke="#0ea5e9" strokeWidth={1} dot={false} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Instructions */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4">
           
           <SciFiCard title="操作指引 (SOP)" subtitle="GUIDANCE" className="flex-1 border-amber-900/50">
               <div className="relative pl-4 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                   <div className="relative">
                       <div className="absolute -left-[13px] top-0 w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_5px_orange]"></div>
                       <h4 className="text-sm font-bold text-white mb-1">{currentStep.label}</h4>
                       <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/50 p-2 rounded border border-slate-800">
                           {currentStep.desc}
                       </p>
                   </div>
                   
                   {currentStepIdx < STEPS.length - 1 && (
                       <div className="relative opacity-50">
                           <div className="absolute -left-[13px] top-0 w-3 h-3 rounded-full bg-slate-700 border border-slate-500"></div>
                           <h4 className="text-xs font-bold text-slate-400 mb-1">Next: {STEPS[currentStepIdx + 1].label}</h4>
                       </div>
                   )}
               </div>

               <div className="mt-6 border-t border-slate-800 pt-4">
                   <div className="flex items-center gap-2 mb-2">
                       <Gauge size={14} className="text-slate-400" />
                       <span className="text-xs font-bold text-slate-300">Safety Check</span>
                   </div>
                   <div className="flex gap-2">
                       <span className={`px-2 py-1 rounded text-[10px] ${currentState === 'DREDGING' ? 'bg-green-900/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}>High Pressure</span>
                       <span className={`px-2 py-1 rounded text-[10px] ${currentState === 'REPLACE_VALVE' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>LOTO Active</span>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="日志记录" className="h-[200px] border-amber-900/50">
               <div className="h-full overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
                   {logs.map((log, i) => (
                       <div key={i} className="text-[10px] font-mono text-slate-400 border-l-2 border-slate-700 pl-2">
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
