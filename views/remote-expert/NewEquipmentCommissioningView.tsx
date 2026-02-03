
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  Play, Pause, RefreshCw, CheckSquare, 
  Square, ArrowRight, Zap, Activity, 
  Thermometer, Gauge, ShieldCheck, FileCheck,
  Radio, GitCommit, UserCheck, Sliders,
  ListTodo, Power, AlertTriangle, BookOpen,
  CheckCircle2, Send
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
  ReferenceLine, LineChart, Line, Legend, ComposedChart
} from 'recharts';

// --- Types ---

interface CommissioningPhase {
  id: string;
  name: string;
  status: 'Completed' | 'In Progress' | 'Pending' | 'Hold';
  progress: number;
}

interface ChecklistItem {
  id: string;
  task: string;
  status: 'Pass' | 'Fail' | 'Pending';
  value?: string;
  required?: string;
}

interface TelemetryPoint {
  time: number;
  rpm: number;
  vibration: number; // mm/s
  temp: number; // C
  load: number; // MW
}

// --- Mock Data ---

const PROJECT_META = {
  name: 'GT-2024-X1 新机组投运',
  site: '滨海电厂三期 #1机组',
  manager: 'Chief Eng. Wang',
  target: '首次并网 (First Synchronization)',
  startTime: '08:00:00',
  elapsed: '02:15:30'
};

const PHASES: CommissioningPhase[] = [
  { id: 'P1', name: '静态调试 (Static)', status: 'Completed', progress: 100 },
  { id: 'P2', name: '盘车运行 (Turning)', status: 'Completed', progress: 100 },
  { id: 'P3', name: '空负荷冲转 (Run-up)', status: 'In Progress', progress: 65 },
  { id: 'P4', name: '励磁系统试验 (Excitation)', status: 'Pending', progress: 0 },
  { id: 'P5', name: '并网带负荷 (Sync)', status: 'Pending', progress: 0 },
];

const CHECKLIST: ChecklistItem[] = [
  { id: 'C1', task: '润滑油压建立', status: 'Pass', value: '0.45 MPa', required: '>0.3' },
  { id: 'C2', task: '盘车装置脱开', status: 'Pass', value: 'Disengaged', required: 'Yes' },
  { id: 'C3', task: '临界转速区振动', status: 'Pass', value: '3.2 mm/s', required: '<5.0' },
  { id: 'C4', task: '3000rpm 定速稳定', status: 'Pending', value: '---', required: '±5rpm' },
  { id: 'C5', task: '轴承温度温升率', status: 'Pending', value: '---', required: '<2°C/min' },
];

const EXPERT_LOGS = [
  { time: '10:12:05', user: 'Dr. Zhang', msg: '确认通过一阶临界转速 (1250rpm)，振动正常。' },
  { time: '10:14:30', user: 'System', msg: '达到 2000rpm 暖机平台，自动保持 5min。' },
  { time: '10:15:45', user: 'Site Lead', msg: '现场听诊无异响，请求继续升速。' },
];

// --- Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    'Completed': 'bg-green-500/20 text-green-400 border-green-500/50',
    'In Progress': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 animate-pulse',
    'Pending': 'bg-slate-800 text-slate-500 border-slate-700',
    'Hold': 'bg-red-500/20 text-red-400 border-red-500/50',
  }[status] || 'bg-slate-800';

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles}`}>
      {status}
    </span>
  );
};

const ParameterGauge = ({ label, value, unit, status = 'normal' }: any) => (
  <div className={`p-3 rounded border bg-slate-900/40 flex flex-col items-center justify-center relative overflow-hidden group
      ${status === 'warning' ? 'border-amber-500/50' : status === 'critical' ? 'border-red-500/50' : 'border-slate-700 hover:border-cyan-500/50'}
  `}>
      <div className="text-[10px] text-slate-500 uppercase mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-mono font-bold ${status === 'warning' ? 'text-amber-400' : status === 'critical' ? 'text-red-400' : 'text-white'}`}>
            {value}
          </span>
          <span className="text-[10px] text-slate-400">{unit}</span>
      </div>
      {status !== 'normal' && (
        <div className={`absolute top-0 right-0 p-1 ${status === 'warning' ? 'text-amber-500' : 'text-red-500'}`}>
          <AlertTriangle size={10} />
        </div>
      )}
  </div>
);

export const NewEquipmentCommissioningView: React.FC = () => {
  const [data, setData] = useState<TelemetryPoint[]>([]);
  const [targetRpm, setTargetRpm] = useState(3000);
  const [currentRpm, setCurrentRpm] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  // Simulation Loop
  useEffect(() => {
    const initData = Array.from({length: 60}, (_, i) => ({
      time: i,
      rpm: 0,
      vibration: 0,
      temp: 20,
      load: 0
    }));
    setData(initData);

    const interval = setInterval(() => {
      if (!isRunning) return;

      setCurrentRpm(prev => {
        // Ramp up logic
        const diff = targetRpm - prev;
        const step = diff > 0 ? Math.min(diff, 20) : Math.max(diff, -20); // Rate limit
        return prev + step;
      });

      setData(prev => {
        const lastTime = prev[prev.length - 1].time;
        const t = lastTime + 1;
        
        // Vibration peaks at critical speeds (e.g., 1200, 2400)
        let vibBase = 1.5;
        if (Math.abs(currentRpm - 1200) < 100) vibBase = 4.5; // Critical speed 1
        if (Math.abs(currentRpm - 2400) < 100) vibBase = 3.8; // Critical speed 2
        
        const newPoint = {
          time: t,
          rpm: currentRpm,
          vibration: vibBase + Math.random() * 0.5,
          temp: 20 + (currentRpm / 3000) * 60 + Math.random(),
          load: 0 // No load yet
        };
        return [...prev.slice(1), newPoint];
      });

    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, currentRpm, targetRpm]);

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200 bg-[#020406]">
      
      {/* 1. Header: Mission Control */}
      <div className="flex justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#061218] to-transparent px-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <RocketIcon /> Commissioning Command Center
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             新设备 <span className="text-cyan-500">远程投运技术支持</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">Elapsed Time</span>
                <span className="text-xl font-mono font-bold text-white">{PROJECT_META.elapsed}</span>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">Current Target</span>
                <span className="text-xl font-mono font-bold text-cyan-400 animate-pulse">{PROJECT_META.target}</span>
            </div>
            <button className="ml-4 flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all">
               <Power size={16} /> 紧急停机
            </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden px-4 pb-4">
         
         {/* LEFT: Procedure & Checklist */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar border-r border-slate-800/50">
             
             {/* Phase Tracker */}
             <SciFiCard title="投运阶段 (Phases)" subtitle="SOP EXECUTION" className="border-cyan-900/30">
                 <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-700">
                     {PHASES.map((phase, i) => (
                         <div key={phase.id} className="relative group">
                             <div className={`absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 z-10 
                                 ${phase.status === 'Completed' ? 'bg-green-500 border-green-500' : 
                                   phase.status === 'In Progress' ? 'bg-cyan-500 border-cyan-500 animate-pulse' : 
                                   'bg-slate-900 border-slate-600'}
                             `}></div>
                             <div className={`p-2 rounded border transition-all cursor-pointer
                                 ${phase.status === 'In Progress' ? 'bg-cyan-900/20 border-cyan-500/50' : 'bg-slate-900/30 border-slate-800 hover:border-slate-600'}
                             `}>
                                 <div className="flex justify-between items-start mb-1">
                                     <span className="text-xs font-bold text-white">{phase.name}</span>
                                     <StatusBadge status={phase.status} />
                                 </div>
                                 {phase.status === 'In Progress' && (
                                     <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                                         <div className="h-full bg-cyan-500 transition-all duration-1000" style={{width: `${phase.progress}%`}}></div>
                                     </div>
                                 )}
                             </div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>

             {/* Live Checklist */}
             <SciFiCard title="关键节点确认 (Checklist)" className="flex-1 border-slate-800">
                 <div className="flex flex-col gap-2">
                     {CHECKLIST.map((item) => (
                         <div key={item.id} className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800 text-xs">
                             <div className="flex items-center gap-2">
                                 {item.status === 'Pass' ? <CheckCircle2 size={14} className="text-green-500"/> : <Square size={14} className="text-slate-600"/>}
                                 <span className={item.status === 'Pass' ? 'text-slate-400 line-through' : 'text-slate-200'}>{item.task}</span>
                             </div>
                             <div className="text-right">
                                 <div className="font-mono text-cyan-300">{item.value}</div>
                                 <div className="text-[9px] text-slate-500">Req: {item.required}</div>
                             </div>
                         </div>
                     ))}
                 </div>
                 <button className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 flex items-center justify-center gap-2 transition-colors">
                     <ListTodo size={12} /> View Full Protocol
                 </button>
             </SciFiCard>
         </div>

         {/* CENTER: Digital Twin & Live Data */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
             
             {/* 1. 3D Twin */}
             <SciFiCard title="机组全息监控" subtitle="DIGITAL TWIN" className="flex-[3] border-cyan-900/50 bg-[#000]" noPadding>
                 <div className="w-full h-full relative">
                     <ThreeScene type="generator" color="#06b6d4" />
                     
                     {/* HUD Overlays */}
                     <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                         <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded">
                             <div className="text-[10px] text-cyan-400 uppercase font-bold mb-1">Rotor Speed</div>
                             <div className="text-3xl font-mono font-bold text-white tracking-tighter">
                                 {currentRpm.toFixed(0)} <span className="text-sm font-normal text-slate-400">RPM</span>
                             </div>
                         </div>
                     </div>

                     <div className="absolute top-4 right-4 z-10 pointer-events-none">
                         <div className="bg-black/60 backdrop-blur border border-slate-700 px-3 py-2 rounded flex flex-col items-end">
                             <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Grid Freq</div>
                             <div className="text-xl font-mono font-bold text-white">50.02 <span className="text-xs text-slate-400">Hz</span></div>
                         </div>
                     </div>

                     {/* Warnings */}
                     {(currentRpm > 1150 && currentRpm < 1350) && (
                         <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-900/80 border border-red-500 text-white px-4 py-1 rounded text-xs font-bold animate-pulse">
                             CRITICAL SPEED RANGE
                         </div>
                     )}
                 </div>
             </SciFiCard>

             {/* 2. Startup Curves */}
             <SciFiCard title="启动曲线监控 (Start-up Curve)" subtitle="RPM vs VIB" className="flex-[2] border-slate-800">
                 <div className="w-full h-full p-2">
                     <ResponsiveContainer width="100%" height="100%">
                         <ComposedChart data={data} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                             <defs>
                                 <linearGradient id="colorRpm" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                 </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                             <XAxis dataKey="time" stroke="#64748b" tick={false} />
                             <YAxis yAxisId="left" stroke="#0ea5e9" tick={{fontSize: 10}} domain={[0, 3500]} label={{ value: 'RPM', angle: -90, position: 'insideLeft', fill: '#0ea5e9', fontSize: 10 }} />
                             <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{fontSize: 10}} domain={[0, 10]} label={{ value: 'Vib (mm/s)', angle: 90, position: 'insideRight', fill: '#f59e0b', fontSize: 10 }} />
                             <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#0ea5e9', color: '#fff'}} />
                             <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                             
                             <Area yAxisId="left" type="monotone" dataKey="rpm" stroke="#0ea5e9" fill="url(#colorRpm)" strokeWidth={2} name="Speed (RPM)" isAnimationActive={false} />
                             <Line yAxisId="right" type="monotone" dataKey="vibration" stroke="#f59e0b" strokeWidth={2} dot={false} name="Vibration (mm/s)" isAnimationActive={false} />
                             
                             {/* Target Line */}
                             <ReferenceLine yAxisId="left" y={3000} stroke="#10b981" strokeDasharray="5 5" label={{value: 'Rated', fill: '#10b981', fontSize: 10}} />
                         </ComposedChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

         </div>

         {/* RIGHT COLUMN: Expert Control */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
             
             {/* Key Indicators */}
             <div className="grid grid-cols-2 gap-3">
                 <ParameterGauge label="Bearing Temp" value={data[data.length-1]?.temp.toFixed(1)} unit="°C" status="normal" />
                 <ParameterGauge label="Shaft Vib" value={data[data.length-1]?.vibration.toFixed(2)} unit="mm/s" status={data[data.length-1]?.vibration > 4 ? 'warning' : 'normal'} />
                 <ParameterGauge label="Lube Press" value="0.45" unit="MPa" status="normal" />
                 <ParameterGauge label="Diff Exp" value="1.2" unit="mm" status="normal" />
             </div>

             {/* Expert Communication */}
             <SciFiCard title="专家指导记录" subtitle="LOG" className="flex-1 border-slate-800">
                 <div className="flex flex-col h-full gap-3">
                     <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1" style={{maxHeight: '200px'}}>
                         {EXPERT_LOGS.map((log, i) => (
                             <div key={i} className="text-xs p-2 bg-slate-900/50 rounded border border-slate-800">
                                 <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                     <span className="font-bold text-cyan-400">{log.user}</span>
                                     <span>{log.time}</span>
                                 </div>
                                 <div className="text-slate-300">{log.msg}</div>
                             </div>
                         ))}
                     </div>
                     <div className="mt-auto">
                         <div className="flex gap-2">
                             <input className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500" placeholder="Type instruction..." />
                             <button className="bg-cyan-600 p-1.5 rounded text-white hover:bg-cyan-500"><Send size={14}/></button>
                         </div>
                     </div>
                 </div>
             </SciFiCard>

             {/* Parameter Adjustment */}
             <SciFiCard title="参数整定 (Tuning)" subtitle="REMOTE" className="border-indigo-900/30">
                 <div className="flex flex-col gap-4">
                     <div>
                         <div className="flex justify-between text-xs text-slate-300 mb-1">
                             <span>Target RPM Ramp Rate</span>
                             <span className="font-mono text-cyan-400">120 rpm/min</span>
                         </div>
                         <input type="range" className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                     </div>
                     <div>
                         <div className="flex justify-between text-xs text-slate-300 mb-1">
                             <span>Lube Oil Temp Setpoint</span>
                             <span className="font-mono text-cyan-400">45 °C</span>
                         </div>
                         <input type="range" className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                     </div>
                     
                     <div className="grid grid-cols-2 gap-2 mt-2">
                         <button 
                           onClick={() => setIsRunning(!isRunning)}
                           className={`py-2 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors
                              ${isRunning ? 'bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700' : 'bg-green-600 text-white hover:bg-green-500'}
                           `}
                         >
                             {isRunning ? <Pause size={12}/> : <Play size={12}/>} {isRunning ? 'Hold' : 'Resume'}
                         </button>
                         <button className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded flex items-center justify-center gap-1 transition-colors">
                             <CheckSquare size={12}/> Confirm
                         </button>
                     </div>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};

// Helper Icon
const RocketIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
);
