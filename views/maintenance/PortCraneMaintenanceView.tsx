
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/port-crane/ThreeScene';
import { CraneMaintenanceState } from '../../components/maintenance/port-crane/three-types';
import { 
  Anchor, Activity, Settings, 
  AlertTriangle, Play, RotateCcw, 
  Wrench, MonitorCheck, Box, 
  Cpu, Thermometer, Zap, ClipboardList,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, AreaChart, Area, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---
const VIB_SPECTRUM = Array.from({length: 30}, (_, i) => ({
    freq: i * 10,
    amp: i === 5 ? 12.5 : i === 12 ? 4.2 : Math.random() * 1.5 // Fault harmonics at 50Hz
}));

const MOTOR_TEMP = Array.from({length: 20}, (_, i) => ({
    time: `${i}:00`,
    temp: 65 + i * 1.5 + Math.random() * 2 // Rising trend
}));

const SOP_STEPS = [
    { id: 'OPERATING', label: '正常作业监控', desc: '监测起升机构电机振动与减速箱油温。', type: 'info' },
    { id: 'FAULT_ALARM', label: '故障报警触发', desc: '检测到起升电机非驱动端轴承振动超标 (RMS > 7.1mm/s)。', type: 'alert' },
    { id: 'LOCKOUT', label: '停机锁定 (LOTO)', desc: '执行挂牌上锁程序，切断主电源，锁定小车位置。', type: 'action' },
    { id: 'DIAGNOSIS', label: '精密诊断扫描', desc: '使用激光测振仪与声学成像仪定位具体故障点。', type: 'analysis' },
    { id: 'REPAIR_MOTOR', label: '电机轴承更换', desc: '拆卸电机端盖，使用拉马拆除旧轴承，热套安装新轴承。', type: 'repair' },
    { id: 'TEST_RUN', label: '空载试运行', desc: '恢复供电，低速空载运行30分钟，监测温升与振动。', type: 'test' },
];

export const PortCraneMaintenanceView: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] 岸桥 STS-04 远程监控连接成功...']);
  const [activeComponent, setActiveComponent] = useState<'MOTOR' | 'GEARBOX' | 'SPREADER'>('MOTOR');

  const currentStep = SOP_STEPS[currentStepIdx];
  const currentState = currentStep.id as CraneMaintenanceState;

  // Simulation Logic
  useEffect(() => {
    if (currentState === 'FAULT_ALARM') {
        addLog('!! 警报：起升机构振动值异常上升');
        addLog('!! 建议：立即停机检查');
    } else if (currentState === 'DIAGNOSIS') {
        addLog('>> 启动 AI 辅助诊断模块...');
        setTimeout(() => addLog('>> 诊断结果：电机后端轴承保持架磨损'), 1500);
    }
  }, [currentState]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 8)]);
  };

  const nextStep = () => {
    if (currentStepIdx < SOP_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      addLog(`进入阶段: ${SOP_STEPS[currentStepIdx + 1].label}`);
    }
  };

  const handleReset = () => {
      setCurrentStepIdx(0);
      setLogs(['[SYSTEM] 流程已重置']);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#0f172a]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between bg-slate-900/80 border-b border-orange-500/30 p-4 rounded-t-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-400 mb-1 uppercase tracking-wider">
             <Anchor size={14} /> Port Machinery Maintenance
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             港口岸桥关键部件 <span className="text-orange-500">虚拟维护中心</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Machine ID</div>
                <div className="text-xl font-bold text-white">STS-04</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-700"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">System Status</div>
                <div className={`text-xl font-bold ${currentState === 'FAULT_ALARM' ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {currentState.replace('_', ' ')}
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Component Tree & Diagnostics */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           {/* Component Selector */}
           <SciFiCard title="关键部件监控" subtitle="SELECT COMPONENT" className="border-orange-900/50">
               <div className="flex flex-col gap-2">
                   <button 
                     onClick={() => setActiveComponent('MOTOR')}
                     className={`p-3 rounded border flex items-center justify-between transition-all ${activeComponent === 'MOTOR' ? 'bg-orange-900/30 border-orange-500 text-white' : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:border-orange-500/50'}`}
                   >
                       <div className="flex items-center gap-3">
                           <Zap size={18} />
                           <span className="font-bold">主起升电机</span>
                       </div>
                       {activeComponent === 'MOTOR' && <div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_orange]"></div>}
                   </button>
                   <button 
                     onClick={() => setActiveComponent('GEARBOX')}
                     className={`p-3 rounded border flex items-center justify-between transition-all ${activeComponent === 'GEARBOX' ? 'bg-orange-900/30 border-orange-500 text-white' : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:border-orange-500/50'}`}
                   >
                       <div className="flex items-center gap-3">
                           <Settings size={18} />
                           <span className="font-bold">减速箱总成</span>
                       </div>
                   </button>
                   <button 
                     onClick={() => setActiveComponent('SPREADER')}
                     className={`p-3 rounded border flex items-center justify-between transition-all ${activeComponent === 'SPREADER' ? 'bg-orange-900/30 border-orange-500 text-white' : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:border-orange-500/50'}`}
                   >
                       <div className="flex items-center gap-3">
                           <Box size={18} />
                           <span className="font-bold">伸缩吊具</span>
                       </div>
                   </button>
               </div>
           </SciFiCard>

           {/* Vibration Chart */}
           <SciFiCard title="振动频谱监测" subtitle="ACCELERATION (g)" className="h-[240px] border-orange-900/50" noPadding>
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={VIB_SPECTRUM}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                          <XAxis dataKey="freq" hide />
                          <YAxis hide />
                          <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#f97316', color: '#fff'}} />
                          <Bar dataKey="amp" fill="#f97316" />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           {/* Temp Trend */}
           <SciFiCard title="温升趋势" subtitle="TEMPERATURE" className="h-[200px] border-orange-900/50" noPadding>
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOTOR_TEMP}>
                          <defs>
                              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="time" hide />
                          <YAxis domain={[50, 100]} hide />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#ef4444'}} />
                          <Area type="monotone" dataKey="temp" stroke="#ef4444" fill="url(#colorTemp)" strokeWidth={2} />
                      </AreaChart>
                  </ResponsiveContainer>
                  <div className="absolute top-2 right-2 text-xs text-red-400 flex items-center gap-1">
                      <Thermometer size={12} /> Warning: +85°C
                  </div>
              </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Workspace */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black/40 border border-slate-700 rounded-lg overflow-hidden relative shadow-[inset_0_0_60px_rgba(249,115,22,0.1)] group">
               {/* Top HUD */}
               <div className="absolute top-4 left-4 z-20 flex gap-4">
                   <div className="bg-slate-900/80 backdrop-blur border border-orange-500/30 px-3 py-1.5 rounded flex items-center gap-2">
                       <Cpu size={16} className="text-orange-400" />
                       <span className="text-xs font-bold text-white">PLC STATUS: {currentState === 'FAULT_ALARM' ? 'ERROR' : 'ONLINE'}</span>
                   </div>
               </div>

               {/* 3D Scene */}
               <ThreeScene state={currentState} />
               
               {/* Workflow Controls */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-600 shadow-xl">
                   <button 
                     onClick={handleReset}
                     className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-600 transition-colors"
                   >
                       <RotateCcw size={20} className="text-slate-400"/>
                   </button>
                   
                   <div className="flex items-center px-4 gap-2">
                       <span className="text-xs text-slate-400 uppercase tracking-widest">Step {currentStepIdx + 1} / {SOP_STEPS.length}</span>
                   </div>

                   <button 
                     onClick={nextStep}
                     disabled={currentStepIdx >= SOP_STEPS.length - 1}
                     className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-full shadow-lg shadow-orange-900/50 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                       <Play size={20} fill="currentColor" />
                       {currentStepIdx === SOP_STEPS.length - 1 ? '完成' : '下一步'}
                   </button>
               </div>
           </div>

           {/* Console */}
           <div className="h-32 bg-black/80 border-t border-slate-800 font-mono text-xs p-3 overflow-y-auto rounded-b-lg custom-scrollbar">
              {logs.map((log, i) => (
                 <div key={i} className="mb-1 text-slate-400 border-l-2 border-orange-800 pl-2">
                    {log}
                 </div>
              ))}
           </div>

        </div>

        {/* RIGHT: SOP & Guidelines */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4">
           
           <SciFiCard title="标准作业程序 (SOP)" subtitle="GUIDE" className="flex-1 border-orange-900/50">
               <div className="relative pl-4 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                   {/* Current Step Highlight */}
                   <div className="relative">
                       <div className="absolute -left-[13px] top-0 w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_5px_orange]"></div>
                       <h4 className="text-sm font-bold text-white mb-1">{currentStep.label}</h4>
                       <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-700 leading-relaxed">
                           {currentStep.desc}
                       </div>
                       
                       {/* Tools Required */}
                       <div className="mt-2 flex flex-wrap gap-1">
                           {['绝缘手套', '激光对中仪', '液压拉马'].map(tool => (
                               <span key={tool} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-600">
                                   {tool}
                               </span>
                           ))}
                       </div>
                   </div>
                   
                   {/* Next Step Preview */}
                   {currentStepIdx < SOP_STEPS.length - 1 && (
                       <div className="relative opacity-50">
                           <div className="absolute -left-[13px] top-0 w-3 h-3 rounded-full bg-slate-700 border border-slate-500"></div>
                           <h4 className="text-xs font-bold text-slate-400 mb-1">Next: {SOP_STEPS[currentStepIdx + 1].label}</h4>
                       </div>
                   )}
               </div>
           </SciFiCard>

           <SciFiCard title="维修知识库" subtitle="ASSETS" className="border-orange-900/50">
               <div className="space-y-2">
                   <div className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded cursor-pointer transition-colors text-xs text-slate-300">
                       <ClipboardList size={14} className="text-orange-400"/> 
                       <span>电机拆解工艺指导书.pdf</span>
                   </div>
                   <div className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded cursor-pointer transition-colors text-xs text-slate-300">
                       <MonitorCheck size={14} className="text-blue-400"/> 
                       <span>历史故障案例库 (Case #402)</span>
                   </div>
                   <div className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded cursor-pointer transition-colors text-xs text-slate-300">
                       <AlertTriangle size={14} className="text-red-400"/> 
                       <span>安全风险告知卡</span>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
