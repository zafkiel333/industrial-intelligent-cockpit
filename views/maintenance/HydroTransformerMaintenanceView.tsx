
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/hydro-transformer/ThreeScene';
import { MaintenancePhase } from '../../components/maintenance/hydro-transformer/three-types';
import { 
  Zap, Thermometer, Activity, AlertTriangle, 
  Wrench, ClipboardList, ShieldAlert, FileSearch, 
  CheckCircle2, Play, Pause, RotateCcw, Flame
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell
} from 'recharts';

// --- Simulation Data ---

// Dissolved Gas Analysis (DGA) - Fault Evolution
const DGA_DATA_NORMAL = [
  { gas: 'H2', val: 10, limit: 150 },
  { gas: 'CH4', val: 5, limit: 120 },
  { gas: 'C2H2', val: 0, limit: 5 },
  { gas: 'C2H4', val: 8, limit: 100 },
  { gas: 'C2H6', val: 12, limit: 150 },
  { gas: 'CO', val: 300, limit: 500 },
];

const DGA_DATA_FAULT = [
  { gas: 'H2', val: 180, limit: 150 }, // High
  { gas: 'CH4', val: 150, limit: 120 }, // High
  { gas: 'C2H2', val: 45, limit: 5 }, // Critical (Arcing)
  { gas: 'C2H4', val: 220, limit: 100 }, // High (Overheat)
  { gas: 'C2H6', val: 45, limit: 150 },
  { gas: 'CO', val: 450, limit: 500 },
];

// Maintenance Steps
const SOP_STEPS: { id: MaintenancePhase; title: string; desc: string; tools: string[] }[] = [
  { id: 'MONITORING', title: '状态监测', desc: '监测瓦斯继电器、油温及局放信号。发现B相乙炔含量超标。', tools: ['DGA Monitor', 'Infrared Cam'] },
  { id: 'DIAGNOSIS', title: '故障确诊', desc: '根据三比值法判断为低能放电兼过热。准备停电检修。', tools: ['Expert System'] },
  { id: 'ISOLATION', title: '停电隔离', desc: '断开高低压侧开关，拉开刀闸，挂接地线。', tools: ['Safety Key', 'Grounding Wire'] },
  { id: 'DRAIN_OIL', title: '排油作业', desc: '连接滤油机，将变压器油排至事故油池，露出铁芯。', tools: ['Oil Pump', 'Valve Key'] },
  { id: 'LIFT_CORE', title: '吊罩/吊芯', desc: '拆除套管及大盖螺栓，起吊器身进行内部检查。', tools: ['Crane', 'Wrench Set'] },
  { id: 'REPAIR', title: '故障修复', desc: '发现线圈层间绝缘烧损，更换绝缘纸并重新绑扎。', tools: ['Insulation Kit', 'Soldering'] },
  { id: 'RESTORE', title: '回装注油', desc: '回装器身，真空注油，静置后进行耐压试验。', tools: ['Vacuum Pump', 'HV Tester'] },
];

export const HydroTransformerMaintenanceView: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isHeatmapMode, setIsHeatmapMode] = useState(false);
  const [dgaData, setDgaData] = useState(DGA_DATA_NORMAL);
  const [logs, setLogs] = useState<string[]>(['[System] 初始化完成，监测系统在线。']);
  
  const currentStep = SOP_STEPS[currentStepIdx];

  useEffect(() => {
    // Simulate data change based on step
    if (currentStep.id === 'MONITORING') {
      // Simulate a developing fault
      const timer = setTimeout(() => {
        setDgaData(DGA_DATA_FAULT);
        addLog('!! 警报：色谱分析异常，检测到乙炔(C2H2)突增！');
        addLog('!! 警报：重瓦斯保护动作信号触发。');
      }, 2000);
      return () => clearTimeout(timer);
    } else if (currentStep.id === 'RESTORE') {
      setDgaData(DGA_DATA_NORMAL);
    }
  }, [currentStepIdx]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 7)]);
  };

  const nextStep = () => {
    if (currentStepIdx < SOP_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      addLog(`>>> 进入阶段：${SOP_STEPS[currentStepIdx + 1].title}`);
    }
  };

  const prevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
      addLog(`<<< 返回阶段：${SOP_STEPS[currentStepIdx - 1].title}`);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] bg-[#050510] text-slate-200">
      
      {/* HEADER */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-950/80 to-transparent border-b border-purple-800/50 p-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-400 mb-1 uppercase tracking-wider">
             <Zap size={14} /> High Voltage Asset Maintenance
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             主变压器故障模拟 <span className="text-purple-500">& 维修推演</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
            <div className="text-right">
                <div className="text-xs text-slate-400">Current Task</div>
                <div className="text-xl font-bold text-white">{currentStep.title}</div>
            </div>
            <div className="flex gap-2">
                <button 
                  onClick={() => setIsHeatmapMode(!isHeatmapMode)}
                  className={`p-2 rounded border transition-all ${isHeatmapMode ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
                  title="Toggle Thermal View"
                >
                    <Flame size={20} />
                </button>
                <button 
                  onClick={() => { setCurrentStepIdx(0); setDgaData(DGA_DATA_NORMAL); addLog('系统重置'); }}
                  className="p-2 rounded border bg-slate-800 border-slate-600 text-slate-400 hover:text-white"
                  title="Reset"
                >
                    <RotateCcw size={20} />
                </button>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Diagnostics (Data Heavy) */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
           
           {/* DGA Analysis Chart */}
           <SciFiCard title="油色谱 DGA 分析" subtitle="IEC 60599" className="h-[280px] border-purple-900/50 bg-[#0f0a1e]/80" noPadding>
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dgaData} layout="vertical" margin={{left: 0, right: 20}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" horizontal={false} />
                          <XAxis type="number" stroke="#a78bfa" tick={{fontSize: 10}} />
                          <YAxis dataKey="gas" type="category" stroke="#ddd6fe" width={40} tick={{fontSize: 10, fontWeight: 'bold'}} />
                          <Tooltip 
                            cursor={{fill: '#2e1065'}} 
                            contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#8b5cf6'}}
                          />
                          <ReferenceLine x={150} stroke="red" strokeDasharray="3 3" />
                          <Bar dataKey="val" barSize={15} radius={[0, 4, 4, 0]}>
                              {dgaData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.val > entry.limit ? '#ef4444' : '#8b5cf6'} />
                              ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           {/* Real-time Metrics */}
           <SciFiCard title="实时运行参数" className="flex-1 border-purple-900/50">
               <div className="flex flex-col gap-4">
                   <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-3">
                           <Thermometer size={20} className={dgaData === DGA_DATA_FAULT ? 'text-red-500 animate-pulse' : 'text-green-400'} />
                           <div>
                               <div className="text-xs text-slate-400">Top Oil Temp</div>
                               <div className="text-lg font-bold text-white">{dgaData === DGA_DATA_FAULT ? '98.5' : '65.2'} °C</div>
                           </div>
                       </div>
                   </div>
                   <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-3">
                           <Activity size={20} className="text-blue-400" />
                           <div>
                               <div className="text-xs text-slate-400">Load Factor</div>
                               <div className="text-lg font-bold text-white">{dgaData === DGA_DATA_FAULT ? '0%' : '85%'}</div>
                           </div>
                       </div>
                   </div>
                   <div className="p-3 bg-red-900/10 border border-red-900/30 rounded">
                       <div className="text-xs font-bold text-red-400 mb-2 flex items-center gap-2">
                           <ShieldAlert size={14}/> Protection Status
                       </div>
                       <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                           <span className={dgaData === DGA_DATA_FAULT ? 'text-red-500 font-bold' : ''}>• Gas Trip</span>
                           <span>• Diff Current</span>
                           <span>• Overcurrent</span>
                           <span>• Oil Level</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: 3D Workspace */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           {/* 3D Container */}
           <div className="flex-1 bg-[#080514] border border-purple-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(139,92,246,0.15)]">
               
               {/* Mode Indicator Overlay */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                   <div className={`px-3 py-1.5 rounded border backdrop-blur text-xs font-bold flex items-center gap-2
                       ${isHeatmapMode ? 'bg-red-900/60 border-red-500 text-red-200' : 'bg-black/60 border-purple-500/30 text-purple-200'}
                   `}>
                       {isHeatmapMode ? <Flame size={14} className="animate-bounce"/> : <Activity size={14}/>}
                       {isHeatmapMode ? 'INFRARED THERMAL MODE' : 'NORMAL VIEW'}
                   </div>
               </div>

               <ThreeScene phase={currentStep.id} isHeatmapMode={isHeatmapMode} />
               
               {/* Step Navigation Overlay */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-black/80 p-2 rounded-full border border-slate-700">
                   <button 
                     onClick={prevStep}
                     disabled={currentStepIdx === 0}
                     className="p-2 rounded-full hover:bg-slate-700 disabled:opacity-30 transition-colors"
                   >
                       <Play size={20} className="rotate-180 fill-current text-slate-300" />
                   </button>
                   
                   <div className="flex flex-col items-center w-48">
                       <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Step {currentStepIdx + 1} of {SOP_STEPS.length}</span>
                       <div className="w-full h-1 bg-slate-800 rounded-full mt-1">
                           <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{width: `${((currentStepIdx + 1) / SOP_STEPS.length) * 100}%`}}></div>
                       </div>
                   </div>

                   <button 
                     onClick={nextStep}
                     disabled={currentStepIdx === SOP_STEPS.length - 1}
                     className="p-2 rounded-full hover:bg-purple-900/50 disabled:opacity-30 transition-colors"
                   >
                       <Play size={20} className="fill-current text-purple-400" />
                   </button>
               </div>

           </div>

           {/* Logs Panel */}
           <div className="h-40 bg-[#0a0510] border border-slate-800 rounded p-3 font-mono text-xs overflow-y-auto custom-scrollbar">
               {logs.map((log, i) => (
                   <div key={i} className="mb-1 border-l-2 border-purple-800 pl-2 text-slate-400 hover:text-white transition-colors">
                       {log}
                   </div>
               ))}
           </div>

        </div>

        {/* RIGHT COLUMN: SOP & Tools */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4">
           
           {/* Current Task Detail */}
           <SciFiCard title="当前作业指引 (SOP)" subtitle="GUIDE" className="border-purple-900/50">
               <div className="flex flex-col gap-4">
                   <div className="p-3 bg-purple-900/10 border border-purple-800/30 rounded">
                       <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                           <CheckCircle2 size={16} className="text-purple-400"/>
                           {currentStep.title}
                       </h3>
                       <p className="text-sm text-slate-300 leading-relaxed">
                           {currentStep.desc}
                       </p>
                   </div>

                   <div>
                       <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                           <Wrench size={12} /> Required Tools
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                           {currentStep.tools.map((tool, i) => (
                               <div key={i} className="bg-slate-900/50 border border-slate-700 px-2 py-1.5 rounded text-xs text-center text-slate-300 hover:border-purple-500 cursor-default transition-colors">
                                   {tool}
                               </div>
                           ))}
                       </div>
                   </div>
                   
                   <div className="mt-2 p-2 bg-yellow-900/10 border border-yellow-900/20 rounded text-[10px] text-yellow-200/80 flex gap-2">
                       <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                       Warning: Ensure HV terminals are grounded before personnel approach.
                   </div>
               </div>
           </SciFiCard>

           {/* Knowledge Link */}
           <SciFiCard title="关联知识库" className="flex-1 border-slate-800">
               <div className="space-y-2">
                   <div className="flex items-center justify-between p-2 hover:bg-slate-800 rounded cursor-pointer group">
                       <div className="flex items-center gap-2 text-xs text-slate-300">
                           <FileSearch size={14} className="text-slate-500 group-hover:text-purple-400"/> 变压器检修规程.pdf
                       </div>
                   </div>
                   <div className="flex items-center justify-between p-2 hover:bg-slate-800 rounded cursor-pointer group">
                       <div className="flex items-center gap-2 text-xs text-slate-300">
                           <FileSearch size={14} className="text-slate-500 group-hover:text-purple-400"/> 典型故障案例库 #202
                       </div>
                   </div>
                   <div className="flex items-center justify-between p-2 hover:bg-slate-800 rounded cursor-pointer group">
                       <div className="flex items-center gap-2 text-xs text-slate-300">
                           <ClipboardList size={14} className="text-slate-500 group-hover:text-purple-400"/> 备品备件清单
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
