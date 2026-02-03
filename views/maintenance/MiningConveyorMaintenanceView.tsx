
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/mining-conveyor/ThreeScene';
import { ConveyorSimState } from '../../components/maintenance/mining-conveyor/three-types';
import { 
  Truck, Activity, Wrench, Settings, 
  RotateCcw, Play, Lock, AlertTriangle, 
  Thermometer, Zap, Layers, Timer,
  ArrowRight, ShieldCheck, Siren
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---
const CURRENT_DATA = Array.from({length: 30}, (_, i) => ({
    time: i,
    current: 450 + Math.random() * 20, // Amps
    limit: 600
}));

const TENSION_DATA = Array.from({length: 30}, (_, i) => ({
    time: i,
    tension: 80 + Math.random() * 2 // kN
}));

const SOP_STEPS: { id: ConveyorSimState; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'RUNNING', label: '运行监测', desc: '监测皮带跑偏、撕裂、打滑及电机电流。', icon: <Activity size={16}/> },
  { id: 'FAULT_TEAR', label: '故障报警', desc: '红外探头检测到K2+150处纵向撕裂，立即停机。', icon: <Siren size={16}/> },
  { id: 'LOCKOUT', label: '挂牌锁定', desc: '执行LOTOTO程序，断开主电源并锁定，释放张紧力。', icon: <Lock size={16}/> },
  { id: 'PREP_SURFACE', label: '表面处理', desc: '切除受损部位，打磨坡口，涂刷硫化胶浆。', icon: <Layers size={16}/> },
  { id: 'VULCANIZING', label: '热硫化修复', desc: '安装硫化机，加压加热(145°C)进行接头硫化。', icon: <Thermometer size={16}/> },
  { id: 'TENSIONING', label: '张力恢复', desc: '拆除硫化机，恢复皮带张紧力至设定值(85kN)。', icon: <Settings size={16}/> },
  { id: 'TEST_RUN', label: '空载试车', desc: '点动试车，检查接头平整度及跑偏情况。', icon: <Play size={16}/> },
];

export const MiningConveyorMaintenanceView: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] 皮带综保系统在线...']);
  const [motorAmps, setMotorAmps] = useState(450);
  const [beltSpeed, setBeltSpeed] = useState(3.5); // m/s
  const [temp, setTemp] = useState(65);

  const currentStep = SOP_STEPS[currentStepIdx];
  const currentState = currentStep.id;

  // Simulation Logic
  useEffect(() => {
    let interval: any;
    
    interval = setInterval(() => {
        if (currentState === 'RUNNING' || currentState === 'TEST_RUN') {
            setMotorAmps(450 + Math.random() * 20);
            setBeltSpeed(3.5);
            setTemp(65 + Math.random());
        } else if (currentState === 'VULCANIZING') {
            setMotorAmps(0);
            setBeltSpeed(0);
            setTemp(prev => Math.min(145, prev + 2)); // Heating up
        } else {
            setMotorAmps(0);
            setBeltSpeed(0);
            setTemp(prev => Math.max(25, prev - 1)); // Cooling
        }

        // Simulating fault trigger in first step
        if (currentState === 'RUNNING' && Math.random() > 0.98) {
            // Usually manual trigger in demo, but random spice is nice or maybe not for controlled demo
        }
    }, 500);

    return () => clearInterval(interval);
  }, [currentState]);

  useEffect(() => {
      if (currentState === 'FAULT_TEAR') {
          addLog('!! 严重警报：检测到皮带纵向撕裂');
          addLog('>> 联锁动作：紧急停机指令已发出');
      } else if (currentState === 'VULCANIZING') {
          addLog('>> 硫化机升温中... 当前温度 110°C');
      }
  }, [currentState]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  const nextStep = () => {
    if (currentStepIdx < SOP_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      addLog(`执行: ${SOP_STEPS[currentStepIdx + 1].label}`);
    } else {
        setCurrentStepIdx(0);
        addLog('流程重置');
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-amber-50 bg-[#0c0a09]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between bg-stone-900/80 border-b border-orange-600/40 p-4 rounded-t-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 uppercase tracking-wider">
             <Truck size={14} /> Critical Conveyor Systems
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             矿用皮带输送机 <span className="text-orange-600">故障维修演练</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
             <div className="flex items-center gap-3 bg-stone-800/50 px-4 py-2 rounded border border-stone-700">
                 <Settings size={18} className={currentState === 'FAULT_TEAR' ? 'text-red-500 animate-pulse' : 'text-green-500'} />
                 <div>
                     <div className="text-[10px] text-stone-500 uppercase">Belt Status</div>
                     <div className={`text-sm font-bold ${currentState === 'RUNNING' ? 'text-green-400' : 'text-red-400'}`}>
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
        
        {/* LEFT: Drive Diagnostics */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="驱动电机监控" subtitle="MAIN DRIVE" className="h-[240px] border-orange-900/50 bg-[#1c1917]" noPadding>
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={CURRENT_DATA}>
                          <defs>
                              <linearGradient id="colorAmp" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis domain={[0, 600]} stroke="#78716c" tick={{fontSize: 10}} label={{ value: 'Amps', angle: -90, position: 'insideLeft', fill: '#78716c', fontSize: 10 }} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f59e0b'}} />
                          <Area type="monotone" dataKey="current" stroke="#f59e0b" fill="url(#colorAmp)" />
                          <ReferenceLine y={550} stroke="red" strokeDasharray="3 3" label={{value:'OL', fill:'red', fontSize:10}} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="运行参数" className="flex-1 border-orange-900/50">
               <div className="flex flex-col gap-4">
                   <div className="flex justify-between items-center p-3 bg-stone-900/50 rounded border border-stone-800">
                       <div className="flex items-center gap-3">
                           <Activity size={20} className="text-blue-400" />
                           <div>
                               <div className="text-xs text-stone-400">Belt Speed</div>
                               <div className="text-lg font-bold text-white">{beltSpeed.toFixed(1)} m/s</div>
                           </div>
                       </div>
                   </div>
                   <div className="flex justify-between items-center p-3 bg-stone-900/50 rounded border border-stone-800">
                       <div className="flex items-center gap-3">
                           <Thermometer size={20} className={temp > 100 ? 'text-red-500' : 'text-orange-400'} />
                           <div>
                               <div className="text-xs text-stone-400">Temp (Repair)</div>
                               <div className="text-lg font-bold text-white">{temp.toFixed(0)} °C</div>
                           </div>
                       </div>
                   </div>
                   <div className="p-3 bg-stone-900/50 rounded border border-stone-800">
                        <div className="text-xs text-stone-400 mb-2">Tension (kN)</div>
                        <div className="h-16">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={TENSION_DATA}>
                                    <Line type="monotone" dataKey="tension" stroke="#22c55e" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Visualization */}
        <div className="flex-1 flex flex-col gap-4 relative">
           <div className="flex-1 bg-[#15100b] border border-orange-800/40 rounded-lg overflow-hidden relative shadow-inner group">
               {/* Overlay Status */}
               <div className="absolute top-4 left-4 z-20">
                   <div className="bg-black/60 backdrop-blur border border-orange-500/30 px-3 py-1.5 rounded flex items-center gap-2">
                       <ShieldCheck size={14} className="text-green-400" />
                       <span className="text-xs font-bold text-stone-200">PROTECTION: {currentState === 'LOCKOUT' ? 'LOCKED (LOTO)' : 'ACTIVE'}</span>
                   </div>
               </div>

               {/* 3D Scene */}
               <ThreeScene state={currentState} />

               {/* Step Controls */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-black/80 p-2 rounded-full border border-stone-600 shadow-xl">
                   <button 
                     onClick={() => {setCurrentStepIdx(0); addLog('系统重置');}}
                     className="p-3 bg-stone-800 hover:bg-stone-700 rounded-full border border-stone-600 transition-colors"
                   >
                       <RotateCcw size={20} className="text-stone-400"/>
                   </button>
                   
                   <div className="h-8 w-[1px] bg-stone-700"></div>

                   <button 
                     onClick={nextStep}
                     className="px-6 py-3 bg-orange-700 hover:bg-orange-600 text-white font-bold rounded-full shadow-lg shadow-orange-900/50 flex items-center gap-2 transition-all hover:scale-105"
                   >
                       {currentStepIdx === SOP_STEPS.length - 1 ? '完成演练' : '下一步 (Next)'} <ArrowRight size={16}/>
                   </button>
               </div>
           </div>

           {/* Console Log */}
           <div className="h-32 bg-stone-900/80 border-t border-stone-700 font-mono text-xs p-3 overflow-y-auto rounded-b-lg custom-scrollbar">
              {logs.map((log, i) => (
                 <div key={i} className="mb-1 text-stone-400 border-l-2 border-orange-800 pl-2">
                    {log}
                 </div>
              ))}
           </div>
        </div>

        {/* RIGHT: SOP & Spare Parts */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4">
           
           <SciFiCard title="维修操作规程 (SOP)" subtitle="GUIDE" className="flex-1 border-orange-900/50">
               <div className="relative pl-4 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-800">
                   {SOP_STEPS.map((step, idx) => {
                       const active = idx === currentStepIdx;
                       const past = idx < currentStepIdx;
                       return (
                           <div key={step.id} className={`relative ${active ? 'opacity-100' : 'opacity-60'}`}>
                               <div className={`absolute -left-[13px] top-0 w-3 h-3 rounded-full 
                                   ${active ? 'bg-orange-500 shadow-[0_0_5px_orange]' : past ? 'bg-green-500' : 'bg-stone-700'}
                               `}></div>
                               <h4 className={`text-sm font-bold mb-1 ${active ? 'text-white' : 'text-stone-400'}`}>{step.label}</h4>
                               {active && (
                                   <div className="text-xs text-stone-400 bg-stone-800/50 p-2 rounded border border-stone-700 leading-relaxed">
                                       {step.desc}
                                   </div>
                               )}
                           </div>
                       );
                   })}
               </div>
           </SciFiCard>

           <SciFiCard title="备件消耗清单" subtitle="BOM" className="border-stone-700">
               <div className="space-y-2">
                   <div className="flex justify-between items-center text-xs p-2 bg-stone-900/30 rounded border border-stone-800">
                       <span className="text-stone-300">ST1000 钢丝绳芯胶带</span>
                       <span className="text-orange-400">2.5 m</span>
                   </div>
                   <div className="flex justify-between items-center text-xs p-2 bg-stone-900/30 rounded border border-stone-800">
                       <span className="text-stone-300">热硫化胶浆 (A/B)</span>
                       <span className="text-orange-400">5 kg</span>
                   </div>
                   <div className="flex justify-between items-center text-xs p-2 bg-stone-900/30 rounded border border-stone-800">
                       <span className="text-stone-300">芯胶/面胶</span>
                       <span className="text-orange-400">10 kg</span>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
