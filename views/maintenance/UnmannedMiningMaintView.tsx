
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/unmanned-mining/ThreeScene';
import { UnmannedMaintPhase } from '../../components/maintenance/unmanned-mining/three-types';
/* Added ShieldCheck and FileText to the import list from lucide-react to fix "Cannot find name" errors on lines 183 and 278 */
import { 
  Bot, Wifi, Activity, ShieldAlert, Cpu, 
  Zap, Play, RotateCcw, Crosshair, Radar,
  Settings, CheckCircle2, AlertTriangle, 
  ArrowRight, Signal, Terminal, Layers, 
  Wrench, BatteryCharging, ShieldCheck, FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  LineChart, Line, BarChart, Bar, Cell
} from 'recharts';

const LINK_DATA = Array.from({length: 20}, (_, i) => ({
    time: i,
    latency: 10 + Math.random() * 5,
    jitter: Math.random() * 2
}));

const AI_DECISIONS = [
    { name: '路径规划', value: 98, status: 'Optimal' },
    { name: '避障算法', value: 99, status: 'Optimal' },
    { name: '感知融合', value: 85, status: 'Drifting' },
    { name: '预测维护', value: 92, status: 'Optimal' },
];

const MAINTENANCE_STEPS: { id: UnmannedMaintPhase; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'AUTONOMOUS_OPS', label: '运行监测', desc: '全时段监测无人运输车传感器矩阵与边缘侧算力负载。', icon: <Radar size={16}/> },
  { id: 'REMOTE_TAKEOVER', label: '远程接管', desc: '由于环境复杂度超出AI处理阈值，请求5G超视距远程驾驶干预。', icon: <Wifi size={16}/> },
  { id: 'SENSOR_CALIBRATE', label: '感知校准', desc: '启动LiDAR点云与毫米波雷达时空对齐校准，消除运动偏置。', icon: <Crosshair size={16}/> },
  { id: 'LOGIC_RESET', label: '逻辑重置', desc: '执行感知-决策层参数硬重启，更新本地静态地图缓存。', icon: <Settings size={16}/> },
  { id: 'DIAGNOSTIC_TEST', label: '综合自检', desc: '执行刹车系统、转向机构与紧急避障逻辑的闭环模拟验证。', icon: <ShieldAlert size={16}/> },
];

export const UnmannedMiningMaintView: React.FC = () => {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[SYS] 边缘计算中心连接成功...', '[DATA] 5G-UUV 链路握手完成 (RTT: 12ms)']);
  const [latencyVal, setLatencyVal] = useState(12);

  const currentStep = MAINTENANCE_STEPS[phaseIdx];
  const currentPhase = currentStep.id;

  useEffect(() => {
    const interval = setInterval(() => {
        setLatencyVal(12 + (Math.random()-0.5) * 2);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  const nextStep = () => {
    if (phaseIdx < MAINTENANCE_STEPS.length - 1) {
      setPhaseIdx(prev => prev + 1);
      addLog(`任务推进：${MAINTENANCE_STEPS[phaseIdx+1].label}`);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#02040a] p-2 relative">
      {/* 科技纹理 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,_#0ea5e9_0%,_transparent_60%)]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-cyan-900/30 p-4 rounded-lg backdrop-blur-md z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-cyan-600/20 border border-cyan-500 rounded flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
             <Bot size={32} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-400 mb-0.5 uppercase tracking-[0.4em] font-black">
               <Signal size={12} className="animate-pulse" /> Tele-Operation Hub V5.0
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               矿山无人值守设备 <span className="text-cyan-500 italic">虚拟检修平台</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Network Latency</div>
                <div className={`text-3xl font-mono font-black ${latencyVal > 15 ? 'text-red-500 animate-bounce' : 'text-green-400'}`}>
                    {latencyVal.toFixed(1)} <span className="text-sm font-normal text-slate-600">ms</span>
                </div>
            </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">AI Readiness</div>
                <div className="text-3xl font-mono font-black text-white">99.8%</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 z-10">
        
        {/* --- LEFT: Connectivity & Intelligence --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="5G/LEO 通讯链路" subtitle="LINK QUALITY" className="h-[220px] border-cyan-900/30" noPadding>
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={LINK_DATA}>
                          <defs>
                              <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis hide domain={[0, 30]} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0e14', borderColor: '#0ea5e9'}} />
                          <Area type="monotone" dataKey="latency" stroke="#0ea5e9" fill="url(#latencyGrad)" strokeWidth={2} isAnimationActive={false} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="自动驾驶算法评价" subtitle="AI METRICS" className="flex-1 border-cyan-900/30">
               <div className="flex flex-col gap-4 h-full">
                   {AI_DECISIONS.map((item, i) => (
                       <div key={i} className="flex flex-col gap-1.5">
                           <div className="flex justify-between items-center text-xs">
                               <span className="text-slate-300">{item.name}</span>
                               <span className={item.status === 'Optimal' ? 'text-green-400' : 'text-yellow-400'}>{item.value}%</span>
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full ${item.status === 'Optimal' ? 'bg-cyan-500' : 'bg-yellow-500'}`} 
                                 style={{width: `${item.value}%`, boxShadow: '0 0 5px currentColor'}}
                               ></div>
                           </div>
                       </div>
                   ))}
                   
                   <div className="mt-auto p-3 bg-cyan-900/10 border border-cyan-900/30 rounded flex items-center gap-3">
                       <Zap size={20} className="text-cyan-400" />
                       <div className="text-[10px] text-slate-400">
                           <span className="block font-bold text-white uppercase">Edge Compute</span>
                           Load: 42% | Temp: 58°C
                       </div>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: Digital Twin & Workspace --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-cyan-800/20 rounded-lg overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] group">
               {/* 3D Scene */}
               <ThreeScene phase={currentPhase} />

               {/* Stage Status Overlay */}
               <div className="absolute top-6 left-6">
                   <div className="bg-slate-950/80 backdrop-blur border-l-4 border-cyan-500 p-4 rounded-sm shadow-xl">
                       <div className="text-[10px] text-cyan-500 font-bold mb-1 uppercase tracking-widest">Active Phase</div>
                       <div className="text-3xl font-black text-white italic">{currentStep.label}</div>
                       <p className="text-[11px] text-slate-400 mt-2 max-w-[200px] leading-relaxed">{currentStep.desc}</p>
                   </div>
               </div>

               {/* Right HUD Widgets */}
               <div className="absolute top-6 right-6 flex flex-col gap-3 items-end">
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded flex flex-col items-end">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase">Propel Energy</div>
                       <div className="text-2xl font-mono font-bold text-white flex items-center gap-2">
                           <BatteryCharging size={18} className="text-green-400" /> 88.4%
                       </div>
                   </div>
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded flex flex-col items-end">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase">Sensor Health</div>
                       <div className="text-lg font-mono font-bold text-white flex items-center gap-2">
                           <ShieldCheck size={16} className="text-green-400" /> STABLE
                       </div>
                   </div>
               </div>

               {/* Action Console */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-700 shadow-2xl scale-110">
                   <button 
                     onClick={() => {setPhaseIdx(0); addLog('重新初始化监测序列');}}
                     className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full border border-slate-600 transition-all hover:rotate-[-180deg]"
                   >
                       <RotateCcw size={22} />
                   </button>
                   <div className="h-12 w-[1px] bg-slate-800 mx-2"></div>
                   <button 
                     onClick={nextStep}
                     disabled={phaseIdx === MAINTENANCE_STEPS.length - 1}
                     className="px-10 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-full shadow-lg shadow-cyan-900/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                   >
                       <span className="tracking-widest uppercase">Next Stage</span>
                       <ArrowRight size={20} />
                   </button>
               </div>
           </div>

           {/* Console Log Terminal */}
           <div className="h-40 bg-slate-950 border border-slate-800 rounded p-3 font-mono text-[10px] flex flex-col gap-1 shadow-inner overflow-hidden">
               <div className="text-slate-600 border-b border-slate-800 pb-1 mb-1 flex justify-between items-center uppercase font-black tracking-widest">
                   <div className="flex items-center gap-2"><Terminal size={14} /> telemetry_log_v5.0</div>
                   <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div> ENCRYPTED</div>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                   {logs.map((log, i) => (
                       <div key={i} className={`flex gap-3 leading-relaxed transition-all duration-300 ${log.includes('!!') ? 'text-red-400 font-bold bg-red-900/10' : 'text-slate-500 hover:text-cyan-300'}`}>
                           <span className="text-slate-700">[{logs.length - i}]</span>
                           <span>{log}</span>
                       </div>
                   ))}
                   <div className="text-cyan-500 animate-pulse">_</div>
               </div>
           </div>
        </div>

        {/* --- RIGHT: Task List & Specs --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="维护任务路线图" subtitle="ROADMAP" className="border-slate-800 bg-[#0c0e14]/90">
               <div className="space-y-3 py-1">
                   {MAINTENANCE_STEPS.map((step, idx) => {
                       const active = idx === phaseIdx;
                       const done = idx < phaseIdx;
                       return (
                           <div key={step.id} className={`relative group transition-all duration-300 ${active ? 'opacity-100 scale-[1.02] origin-left' : 'opacity-40'}`}>
                               <div className={`p-2.5 rounded border ${active ? 'bg-cyan-900/20 border-cyan-500/50' : 'bg-slate-900/20 border-slate-800'} flex items-center justify-between`}>
                                  <div className="flex items-center gap-3">
                                     <div className={`w-2 h-2 rounded-full ${active ? 'bg-cyan-500 animate-pulse' : done ? 'bg-green-500' : 'bg-slate-700'}`}></div>
                                     <span className="text-[11px] font-bold">{step.label}</span>
                                  </div>
                                  {done && <CheckCircle2 size={12} className="text-green-500" />}
                               </div>
                           </div>
                       );
                   })}
               </div>
           </SciFiCard>

           <SciFiCard title="传感器矩阵状态" subtitle="SENSORS" className="flex-1 border-slate-800">
               <div className="flex flex-col h-full gap-4">
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {[
                            { name: 'LiDAR-Alpha', val: 'Online', health: 98 },
                            { name: 'Millimeter Wave', val: 'Syncing', health: 45 },
                            { name: 'IMU-Nav-01', val: 'Online', health: 99 },
                            { name: 'Ultrasonic Array', val: 'Standby', health: 100 },
                        ].map((sensor, i) => (
                            <div key={i} className="p-2.5 rounded bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all group">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{sensor.name}</span>
                                    <span className={`text-[9px] font-mono ${sensor.health < 50 ? 'text-red-500' : 'text-green-500'}`}>{sensor.health}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-white">{sensor.val}</span>
                                    <div className="w-16 h-0.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${sensor.health < 50 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{width: `${sensor.health}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto space-y-2">
                        <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all">
                            <Wrench size={14} /> 启动硬件测试序列
                        </button>
                        <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all">
                            <FileText size={14} /> 调取维护日志档案
                        </button>
                    </div>
               </div>
           </SciFiCard>

           <div className="bg-red-950/20 border border-red-900/40 p-3 rounded-lg flex items-start gap-3">
               <AlertTriangle size={20} className="text-red-500 shrink-0" />
               <div className="text-[10px] text-red-300/70 leading-relaxed">
                   <span className="font-bold text-red-200 uppercase block mb-1">Safety Lockout Active</span>
                   系统处于维护锁定状态，所有自动驾驶决策均由人工二次确认。
               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
