
import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/mining-drilling-rig/ThreeScene';
import { DrillRepairPhase } from '../../components/maintenance/mining-drilling-rig/three-types';
import { 
  Zap, Activity, Wrench, ShieldAlert, 
  Settings, Gauge, Play, RotateCcw, 
  CheckCircle2, AlertTriangle, Hammer, Ruler,
  Cpu, Thermometer, Droplets, ClipboardList,
  ArrowRight, Search, Scan, Power, Info, BrainCircuit, Terminal, Microscope
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, Cell
} from 'recharts';

// --- 模拟实时数据 ---
const PRESSURE_HISTORY = Array.from({length: 40}, (_, i) => ({
    time: i,
    pMain: 28 + Math.sin(i*0.2) * 2, // 主回路压力 MPa
    pPilot: 3.5 + Math.random() * 0.2, // 先导压力 MPa
}));

const TORQUE_STATS = [
    { name: '回转扭矩', val: 14500, limit: 18000 },
    { name: '给进压力', val: 850, limit: 1200 },
    { name: '提升力', val: 2400, limit: 3000 },
];

const MAINTENANCE_STEPS: { id: DrillRepairPhase; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'INITIAL_SCAN', label: '全机诊断扫描', desc: '利用激光测距仪与在线传感器融合诊断，定位动力系统压力泄露点。', icon: <Scan size={16}/> },
  { id: 'PRESSURE_RELEASE', label: '安全卸压隔离', desc: '执行高压回路强制泄压，切断主泵供电，完成挂牌锁闭(LOTO)。', icon: <Power size={16}/> },
  { id: 'VALVE_REMOVAL', label: '电液比例阀拆解', desc: '拆除受损的比例控制阀组，检查密封端面及阀芯磨损情况。', icon: <Settings size={16}/> },
  { id: 'INTERNAL_CLEAN', label: '液压回路清洗', desc: '对高压胶管及泵体内部进行在线循环冲洗，提升油液NAS等级。', icon: <Droplets size={16}/> },
  { id: 'CORE_REPAIR', label: '动力头密封修复', desc: '更换回转动力头主轴密封圈，调整主轴承间隙，恢复额定扭矩。', icon: <Hammer size={16}/> },
  { id: 'SYSTEM_TEST', label: '全工况性能测试', desc: '恢复系统供能，进行模拟钻进试验，记录动态响应特性曲线。', icon: <Activity size={16}/> },
  { id: 'COMPLETE', label: '数字化验收归档', desc: '同步维修数据至PDM系统，生成电子质检报告，恢复生产许可。', icon: <CheckCircle2 size={16}/> },
];

export const MiningDrillingRigRepairView: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] 矿用钻机 ZLJ-1200 动力系统档案加载成功...']);
  const [systemAmps, setSystemAmps] = useState(340);
  const [oilTemp, setOilTemp] = useState(52.4);

  const currentStep = MAINTENANCE_STEPS[currentStepIdx];
  const currentState = currentStep.id;

  // 模拟运行数据波动
  useEffect(() => {
    const interval = setInterval(() => {
        if (currentState === 'INITIAL_SCAN' || currentState === 'SYSTEM_TEST') {
            setSystemAmps(340 + (Math.random()-0.5) * 20);
            setOilTemp(52 + Math.sin(Date.now()/5000));
        } else {
            setSystemAmps(THREE.MathUtils.lerp(systemAmps, 0, 0.1));
            setOilTemp(THREE.MathUtils.lerp(oilTemp, 25, 0.05));
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentState, systemAmps, oilTemp]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  const nextStep = () => {
    if (currentStepIdx < MAINTENANCE_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      addLog(`任务切换: ${MAINTENANCE_STEPS[currentStepIdx + 1].label}`);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020205] p-2 relative overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/40 border border-cyan-900/30 p-4 rounded-lg backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-600/20 border border-amber-500 rounded-sm flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-amber-500/10 animate-pulse"></div>
             <Hammer size={32} className="text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-amber-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Zap size={12} className="animate-pulse" /> Precision Maintenance Command
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               矿用钻机动力系统 <span className="text-amber-500 italic">拆解维修演练</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Main Loop Pressure</div>
                <div className={`text-3xl font-mono font-black ${currentState === 'PRESSURE_RELEASE' ? 'text-red-500' : 'text-cyan-400'}`}>
                    {currentState === 'PRESSURE_RELEASE' ? '1.2' : (28 + Math.random()).toFixed(1)} <span className="text-sm font-normal text-slate-600">MPa</span>
                </div>
            </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Engine Load</div>
                <div className="text-3xl font-mono font-black text-white">
                    {systemAmps.toFixed(0)} <span className="text-sm font-normal text-slate-600">A</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* --- LEFT: Task Roadmap --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="检修工序指南" subtitle="MAINTENANCE FLOW" className="border-amber-900/30 bg-[#080c14]/80">
              <div className="space-y-4 relative pl-3 mt-2">
                 <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-slate-800"></div>
                 {MAINTENANCE_STEPS.map((step, idx) => {
                     const active = idx === currentStepIdx;
                     const done = idx < currentStepIdx;
                     return (
                         <div key={step.id} className={`relative transition-all duration-300 ${active ? 'opacity-100 translate-x-2' : 'opacity-40'}`}>
                             <div className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-2 
                                 ${active ? 'bg-amber-500 border-white shadow-[0_0_15px_#f59e0b]' : 
                                   done ? 'bg-green-500 border-green-700' : 'bg-slate-900 border-slate-700'}
                             `}></div>
                             <div className={`p-3 rounded border flex flex-col gap-1 transition-all
                                 ${active ? 'bg-amber-900/30 border-amber-500/50' : 'bg-slate-900/20 border-slate-800'}
                             `}>
                                 <div className="flex items-center gap-2">
                                     <span className={active ? 'text-amber-400' : 'text-slate-500'}>{step.icon}</span>
                                     <h4 className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-500'}`}>{step.label}</h4>
                                 </div>
                                 {active && <p className="text-[10px] text-slate-400 leading-tight border-t border-amber-500/20 pt-1 mt-1">{step.desc}</p>}
                             </div>
                         </div>
                     );
                 })}
              </div>
           </SciFiCard>

           <SciFiCard title="诊断专家建议" className="flex-1 border-slate-800 bg-black/40">
               <div className="h-full flex flex-col gap-4 p-1">
                   <div className="flex items-start gap-3 p-3 bg-blue-900/10 border border-blue-900/30 rounded">
                       <Info className="text-blue-400 shrink-0 mt-0.5" size={16} />
                       <div className="text-[11px] text-blue-100/70 leading-relaxed italic">
                          当前检测到比例阀 K-02 控制电流与流量线性度偏差 15%，建议重点检查节流孔是否存在杂质堵塞。
                       </div>
                   </div>
                   <div className="p-3 bg-orange-900/10 border border-orange-900/30 rounded">
                       <div className="text-xs font-bold text-orange-400 mb-2 flex items-center gap-2"><ClipboardList size={14}/> 备件需求预测</div>
                       <ul className="text-[10px] text-slate-400 space-y-1">
                           <li>• 氟橡胶 O 型圈 22x3.5 (4个)</li>
                           <li>• 比例方向阀 YB-250 (1个)</li>
                           <li>• 液压油清洗剂 (10L)</li>
                       </ul>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Control Area --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-amber-900/20 rounded-lg overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene phase={currentState} />

               {/* Overlays HUD */}
               <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
                   <div className="bg-black/60 backdrop-blur border border-amber-500/30 p-2 rounded flex flex-col items-end">
                       <div className="text-[10px] text-amber-500 font-bold mb-1 uppercase tracking-widest">Main Motor Power</div>
                       <div className="text-lg font-mono font-bold text-white">45.2 <span className="text-xs text-slate-500">kW</span></div>
                       <div className="w-24 h-1 bg-slate-800 mt-1"><div className="bg-amber-500 h-full w-[45%]"></div></div>
                   </div>
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-2 rounded flex flex-col items-end">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest">Hydraulic Flow</div>
                       <div className="text-lg font-mono font-bold text-white">220 <span className="text-xs text-slate-500">L/min</span></div>
                   </div>
               </div>

               {/* Central Action Button */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-700 shadow-2xl scale-110">
                   <button 
                     onClick={() => {setCurrentStepIdx(0); addLog('重新启动仿真');}}
                     className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full border border-slate-600 transition-all hover:rotate-[-45deg]"
                   >
                       <RotateCcw size={22} />
                   </button>
                   <div className="h-12 w-[1px] bg-slate-800 mx-2"></div>
                   <button 
                     onClick={nextStep}
                     disabled={currentStepIdx === MAINTENANCE_STEPS.length - 1}
                     className="px-10 py-3 bg-amber-600 hover:bg-amber-600 text-white font-black rounded-full shadow-lg shadow-amber-900/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                   >
                       {currentStepIdx === MAINTENANCE_STEPS.length - 1 ? '演练完成' : '下一步 (Next Step)'}
                       <ArrowRight size={20} />
                   </button>
               </div>
           </div>

           {/* Event Console */}
           <div className="h-36 bg-[#020205] border border-slate-800/60 rounded-lg p-3 font-mono text-[11px] overflow-y-auto custom-scrollbar shadow-lg">
               <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-800">
                   <div className="w-2 h-2 rounded-full bg-red-500"></div>
                   <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   <span className="ml-2 text-[9px] text-slate-600 uppercase font-bold tracking-widest">Maintenance Command Center Logs</span>
               </div>
               {logs.map((log, i) => (
                   <div key={i} className={`mb-1 pl-2 border-l-2 transition-all duration-300 ${log.includes('!!') ? 'border-red-500 text-red-400 font-bold bg-red-900/5' : 'border-amber-800 text-slate-400 hover:text-amber-200'}`}>
                       {log}
                   </div>
               ))}
               <div className="text-amber-500 mt-1 animate-pulse">_</div>
           </div>

        </div>

        {/* --- RIGHT: Analytics & Status --- */}
        <div className="w-full lg:w-[360px] flex flex-col gap-4">
           
           <SciFiCard title="压力特性实时监控" subtitle="HYDRAULIC TELEMETRY" className="h-[250px] border-amber-900/30" noPadding>
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={PRESSURE_HISTORY}>
                          <defs>
                              <linearGradient id="pMainGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 45]} />
                          <Tooltip contentStyle={{backgroundColor: '#020205', borderColor: '#06b6d4'}} />
                          <Area type="monotone" dataKey="pMain" stroke="#06b6d4" fill="url(#pMainGrad)" name="Main Loop" />
                          <Line type="monotone" dataKey="pPilot" stroke="#eab308" strokeWidth={1} dot={false} name="Pilot System" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="系统负载性能分析" subtitle="DYNAMIC PERFORMANCE" className="flex-1 border-amber-900/30">
               <div className="flex flex-col gap-5 h-full">
                   {TORQUE_STATS.map((stat, i) => (
                       <div key={i} className="flex flex-col gap-1.5">
                           <div className="flex justify-between items-center">
                               <span className="text-xs font-bold text-slate-300">{stat.name}</span>
                               <span className="text-xs font-mono text-amber-400">{stat.val} / {stat.limit}</span>
                           </div>
                           <div className="w-full h-2 bg-slate-900 rounded-sm border border-slate-800 overflow-hidden relative">
                               <div className="h-full bg-amber-500 shadow-[0_0_10px_#f59e0b]" style={{width: `${(stat.val/stat.limit)*100}%`}}></div>
                               <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-red-500/50"></div>
                           </div>
                       </div>
                   ))}

                   <div className="grid grid-cols-2 gap-3 mt-auto">
                      <div className="bg-slate-900/80 border border-slate-800 p-3 rounded text-center">
                          <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Oil Temp</div>
                          <div className={`text-xl font-mono font-bold ${oilTemp > 60 ? 'text-red-500' : 'text-orange-400'}`}>{oilTemp.toFixed(1)} °C</div>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-800 p-3 rounded text-center">
                          <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Filtration</div>
                          <div className="text-xl font-mono font-bold text-green-400">NAS 6</div>
                      </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
