
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/hydro-turbine/ThreeScene';
import { HydroSimulationStep } from '../../components/maintenance/hydro-turbine/three-types';
import { 
  Wrench, 
  Hammer, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Settings, 
  ClipboardList,
  ChevronRight, 
  Unlock, 
  Zap, 
  Gauge, 
  Activity 
} from 'lucide-react';

interface Step {
  id: HydroSimulationStep;
  label: string;
  desc: string;
  tools: string[];
}

// --- Simulation Data ---
const STEPS: Step[] = [
  { id: 'IDLE', label: '准备工作', desc: '检查现场安全措施，确认工作票，准备专用工具。', tools: ['PPE', 'Lockout'] },
  { id: 'REMOVE_COVER', label: '拆除上风洞盖板', desc: '使用行车配合电动扳手拆除发电机上盖板及风洞护罩。', tools: ['Impact Wrench', 'Crane'] },
  { id: 'LOOSEN_BOLTS', label: '松动上机架螺栓', desc: '对上机架基础螺栓进行液压拉伸松动，确保应力释放均匀。', tools: ['Hydraulic Tensioner'] },
  { id: 'LIFT_BRACKET', label: '吊出上机架', desc: '使用桥式起重机整体吊出上机架，注意水平度监控。', tools: ['Overhead Crane', 'Level Meter'] },
  { id: 'LIFT_ROTOR', label: '吊出转子 (关键)', desc: '最关键步骤。需使用专用平衡梁，控制起吊速度 <0.5m/min，严防碰擦定子。', tools: ['Rotor Yoke', 'Air Gap Sensor'] },
  { id: 'INSPECT', label: '定子检查与清扫', desc: '进入膛内检查定子线棒绝缘情况，清理油污灰尘。', tools: ['Flashlight', 'Cleaning Kit'] }
];

const TOOL_KIT = [
  { id: 'wrench', name: '液压扳手', icon: <Wrench size={20}/> },
  { id: 'crane', name: '桥机控制器', icon: <Settings size={20}/> },
  { id: 'meter', name: '百分表', icon: <Gauge size={20}/> },
  { id: 'safety', name: '安全锁具', icon: <Unlock size={20}/> }
];

export const HydroTurbineDisassemblyView: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [logs, setLogs] = useState<string[]>(['>>> 系统初始化完成', '>>> 等待操作指令...']);
  const [score, setScore] = useState(100);

  const currentStep = STEPS[currentStepIndex];

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  const handleNextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setIsAnimating(true);
      addLog(`开始执行: ${STEPS[currentStepIndex + 1].label}`);
      // Simulate delay for operation
      setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
        setIsAnimating(false);
        addLog(`完成: ${STEPS[currentStepIndex + 1].label}`);
      }, 1500);
    } else {
      addLog('演练结束。全流程完成。');
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setScore(100);
    addLog('>>> 系统重置');
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-cyan-900/50 p-4 rounded-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Zap size={14} /> Virtual Maintenance Trainer
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
             水轮发电机组 <span className="text-cyan-500">虚拟拆装演练系统</span>
          </h1>
        </div>
        
        {/* Progress & Score */}
        <div className="flex gap-8 items-center">
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase">当前步骤</div>
              <div className="text-xl font-bold text-white">{currentStepIndex + 1} / {STEPS.length}</div>
           </div>
           <div className="text-right border-l border-slate-700 pl-6">
              <div className="text-[10px] text-slate-500 uppercase">操作评分</div>
              <div className="text-3xl font-mono font-bold text-green-400">{score}</div>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={handleReset}
                className="p-2 rounded-full border border-slate-600 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="重置演练"
              >
                <RotateCcw size={20} />
              </button>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Operation Panel */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
           
           <SciFiCard title="拆解工序流程 (Flow)" className="border-cyan-900/50">
              <div className="space-y-4 relative pl-2">
                 {/* Timeline Line */}
                 <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-800"></div>
                 
                 {STEPS.map((step, idx) => {
                   const isActive = idx === currentStepIndex;
                   const isPast = idx < currentStepIndex;
                   return (
                     <div key={step.id} className={`relative pl-8 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                        {/* Dot */}
                        <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 bg-slate-900
                           ${isActive ? 'border-cyan-500 text-cyan-400 shadow-[0_0_10px_cyan]' : 
                             isPast ? 'border-green-500 text-green-500' : 'border-slate-700 text-slate-500'}
                        `}>
                           {isPast ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                        </div>
                        
                        <div className={`p-3 rounded border ${isActive ? 'bg-cyan-950/30 border-cyan-500/50' : 'bg-slate-900/40 border-slate-800'}`}>
                           <h3 className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>{step.label}</h3>
                           {isActive && (
                             <div className="mt-2 text-xs text-slate-300 animate-in fade-in slide-in-from-left-2">
                               {step.desc}
                               <div className="mt-2 flex flex-wrap gap-1">
                                  {step.tools.map(t => (
                                    <span key={t} className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-cyan-300 border border-slate-700">{t}</span>
                                  ))}
                               </div>
                             </div>
                           )}
                        </div>
                     </div>
                   );
                 })}
              </div>
           </SciFiCard>

           {/* Tool Selection */}
           <SciFiCard title="工具准备 (Tools)" className="flex-1 border-cyan-900/50">
              <div className="grid grid-cols-2 gap-2">
                 {TOOL_KIT.map(tool => (
                    <button key={tool.id} className="flex flex-col items-center justify-center p-3 bg-slate-900/50 border border-slate-700 rounded hover:bg-slate-800 hover:border-cyan-500/50 transition-all group">
                       <div className="text-slate-400 group-hover:text-cyan-400 mb-1">{tool.icon}</div>
                       <span className="text-xs text-slate-300">{tool.name}</span>
                    </button>
                 ))}
              </div>
              <div className="mt-4 p-2 bg-yellow-900/20 border border-yellow-900/40 rounded flex items-start gap-2">
                 <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                 <span className="text-xs text-yellow-200/80">注意：起吊转子前必须确认气隙监测探头已拆除。</span>
              </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Workspace */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           {/* 3D Container */}
           <div className="flex-1 bg-[#080c14] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(6,182,212,0.1)] group">
              {/* HUD: Current Action */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                 <div className="bg-black/60 backdrop-blur px-6 py-2 rounded-full border border-cyan-500/30 flex items-center gap-3 shadow-lg">
                    <Activity size={18} className="text-cyan-400 animate-pulse" />
                    <span className="text-sm font-bold text-white uppercase tracking-wider">
                       Current Task: {currentStep.id}
                    </span>
                 </div>
              </div>

              {/* Controls Overlay */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4">
                 <button 
                   onClick={handleNextStep}
                   disabled={isAnimating || currentStepIndex >= STEPS.length - 1}
                   className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded shadow-lg shadow-cyan-900/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                 >
                    {isAnimating ? <span className="animate-spin">⏳</span> : <Play size={20} fill="currentColor" />}
                    执行下一步
                 </button>
              </div>

              <ThreeScene step={currentStep.id} />
           </div>

           {/* Console Logs */}
           <div className="h-32 bg-black/80 border-t border-slate-800 font-mono text-xs p-3 overflow-y-auto rounded-b-lg">
              {logs.map((log, i) => (
                 <div key={i} className="mb-1 text-slate-400 border-l-2 border-slate-700 pl-2 hover:text-cyan-300 hover:border-cyan-500 transition-colors">
                    {log}
                 </div>
              ))}
           </div>

        </div>

        {/* RIGHT: Knowledge & Specs */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4">
           
           <SciFiCard title="设备技术参数" subtitle="SPECS" className="border-slate-800">
              <div className="space-y-2 text-xs">
                 <div className="flex justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                    <span className="text-slate-400">机组型号</span>
                    <span className="font-mono text-white">SF700-42/14300</span>
                 </div>
                 <div className="flex justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                    <span className="text-slate-400">转子重量</span>
                    <span className="font-mono text-cyan-300">1,850 t</span>
                 </div>
                 <div className="flex justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                    <span className="text-slate-400">额定转速</span>
                    <span className="font-mono text-white">75 rpm</span>
                 </div>
                 <div className="flex justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                    <span className="text-slate-400">定子内径</span>
                    <span className="font-mono text-white">14,300 mm</span>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="检修工艺标准" subtitle="SOP" className="flex-1 border-slate-800">
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                 <p>
                    <strong className="text-cyan-400">1. 转子起吊：</strong> 
                    必须使用专用平衡梁。起吊前需检查制动器闸板是否完全落下，并在气隙中插入绝缘保护片。起升过程需保持水平度偏差 &lt;0.5mm/m。
                 </p>
                 <p>
                    <strong className="text-cyan-400">2. 螺栓拆卸：</strong> 
                    上机架基础螺栓力矩高达 4500 Nm，必须采用液压拉伸器分三步预紧卸载，防止螺纹咬死。
                 </p>
                 <div className="p-3 bg-slate-800 rounded border border-slate-700 flex items-start gap-2">
                    <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                    <span>提示：转子吊出后，定子腔内需立即覆盖防尘布，并开启除湿机。</span>
                 </div>
              </div>
              <button className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded flex items-center justify-center gap-2 transition-colors">
                 <ClipboardList size={14} /> 查看完整工艺卡
              </button>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
