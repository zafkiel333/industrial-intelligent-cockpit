
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[res-commissioning]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/res-commissioning';
import { 
  Sliders, Play, Pause, RotateCcw, 
  CheckCircle2, XCircle, AlertOctagon, 
  Activity, Cpu, Network, Wifi, 
  Mic, Video, MessageSquare, FileCode,
  Zap, Settings, Terminal, Timer,
  ArrowRightLeft, GitBranch, ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  BarChart, Bar, Cell
} from 'recharts';

// --- Types ---

interface TestCase {
  id: string;
  name: string;
  category: 'Logic' | 'Performance' | 'Safety';
  status: 'Passed' | 'Running' | 'Failed' | 'Pending';
  value: string; // Measured value
  target: string; // Expected value
  expertSignOff: boolean;
}

interface PidParam {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
}

interface TrendData {
  time: string;
  load: number;
  efficiency: number;
  stability: number; // 0-100
  vibration: number;
}

// --- Mock Data ---

const TEST_CASES: TestCase[] = [
  { id: 'T-001', name: 'PID 参数自整定测试', category: 'Logic', status: 'Passed', value: 'Converged', target: 'Stable', expertSignOff: true },
  { id: 'T-002', name: '100% 满负荷阶跃响应', category: 'Performance', status: 'Running', value: '4.2s', target: '<5.0s', expertSignOff: false },
  { id: 'T-003', name: '甩负荷超速保护验证', category: 'Safety', status: 'Pending', value: '-', target: '<3300rpm', expertSignOff: false },
  { id: 'T-004', name: '72小时连续运行稳定性', category: 'Performance', status: 'Running', value: '48h 12m', target: '72h', expertSignOff: false },
  { id: 'T-005', name: '润滑油温控逻辑校验', category: 'Logic', status: 'Failed', value: 'Oscillating', target: '±2°C', expertSignOff: false },
];

const INITIAL_PARAMS: PidParam[] = [
  { id: 'P1', label: '比例增益 (Kp)', value: 1.25, min: 0.5, max: 5.0, unit: '' },
  { id: 'P2', label: '积分时间 (Ti)', value: 25.0, min: 10, max: 100, unit: 'ms' },
  { id: 'P3', label: '微分时间 (Td)', value: 0.45, min: 0, max: 2.0, unit: 'ms' },
  { id: 'P4', label: '死区范围 (Deadband)', value: 0.5, min: 0, max: 2.0, unit: '%' },
];

const PERFORMANCE_RADAR = [
  { subject: '响应速度', A: 92, fullMark: 100 },
  { subject: '稳态精度', A: 85, fullMark: 100 },
  { subject: '鲁棒性', A: 70, fullMark: 100 }, // Needs improvement
  { subject: '能效比', A: 95, fullMark: 100 },
  { subject: '安全性', A: 98, fullMark: 100 },
  { subject: '噪音控制', A: 88, fullMark: 100 },
];

const EXPERT_LOG = [
  { time: '14:32', user: 'Dr. Zhang', msg: '观察到满负荷时有轻微震荡，建议增大积分时间 Ti。' },
  { time: '14:35', user: 'Site Eng.', msg: 'Ti 已调整至 30ms，系统趋于稳定。' },
  { time: '14:40', user: 'AI Bot', msg: '阶跃响应测试通过。超调量 < 2%。' },
];

// --- Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    'Passed': 'bg-green-500/20 text-green-400 border-green-500/50',
    'Running': 'bg-blue-500/20 text-blue-400 border-blue-500/50 animate-pulse',
    'Failed': 'bg-red-500/20 text-red-400 border-red-500/50',
    'Pending': 'bg-slate-800 text-slate-500 border-slate-700',
  }[status] || 'bg-slate-800';
  
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1 w-fit ${styles}`}>
      {status === 'Running' && <RefreshCw size={10} className="animate-spin"/>}
      {status}
    </span>
  );
};

const KnobControl = ({ param, onChange }: { param: PidParam, onChange: (v: number) => void }) => (
  <div className="flex flex-col items-center group">
     <div className="relative w-14 h-14 mb-2 cursor-pointer transition-transform active:scale-95">
         <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">
             <circle cx="50" cy="50" r="45" fill="#0f0f1b" stroke="#334155" strokeWidth="2" />
             <path d="M20 80 A 40 40 0 1 1 80 80" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
             <path 
                d="M20 80 A 40 40 0 1 1 80 80" 
                fill="none" 
                stroke="#8b5cf6" 
                strokeWidth="6" 
                strokeLinecap="round"
                strokeDasharray={`${((param.value - param.min)/(param.max - param.min)) * 220} 220`}
             />
             <line x1="50" y1="50" x2="50" y2="10" stroke="#fff" strokeWidth="3" strokeLinecap="round" transform={`rotate(${-135 + ((param.value - param.min)/(param.max - param.min)) * 270} 50 50)`} />
         </svg>
         <input 
            type="range" min={param.min} max={param.max} step={(param.max-param.min)/100}
            value={param.value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-ns-resize"
         />
     </div>
     <div className="text-[10px] text-slate-400 font-bold">{param.label.split(' ')[0]}</div>
     <div className="text-xs font-mono text-purple-300">{param.value.toFixed(2)}{param.unit}</div>
  </div>
);

export const RemoteCommissioningView: React.FC = () => {
  const [params, setParams] = useState(INITIAL_PARAMS);
  const [streamData, setStreamData] = useState<TrendData[]>([]);
  const [isRunning, setIsRunning] = useState(true);

  // Simulation Loop
  useEffect(() => {
    // Init buffer
    const initialData = Array.from({length: 60}, (_, i) => ({
       time: i.toString(),
       load: 50,
       efficiency: 80,
       stability: 90,
       vibration: 2.0
    }));
    setStreamData(initialData);

    const interval = setInterval(() => {
       if(!isRunning) return;

       setStreamData(prev => {
          const t = parseInt(prev[prev.length-1].time) + 1;
          const kp = params[0].value;
          
          // Simulation logic: Higher Kp = faster response but more oscillation
          const targetLoad = t % 100 > 50 ? 90 : 50; // Step change
          const noise = (Math.random() - 0.5) * 2;
          const oscillation = Math.sin(t * kp) * (kp * 2); 
          
          const newPoint = {
             time: t.toString(),
             load: targetLoad + oscillation + noise,
             efficiency: 85 + Math.random() * 5,
             stability: Math.max(0, 100 - Math.abs(oscillation) * 5),
             vibration: 2.0 + Math.abs(oscillation) * 0.1
          };
          
          return [...prev.slice(1), newPoint];
       });
    }, 100);
    return () => clearInterval(interval);
  }, [isRunning, params]);

  const handleParamChange = (id: string, val: number) => {
    setParams(prev => prev.map(p => p.id === id ? { ...p, value: val } : p));
  };

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200 bg-[#050408]">
      
      {/* 1. Header: Commissioning Console */}
      <div className="flex justify-between items-end border-b border-purple-900/50 pb-4 bg-gradient-to-r from-[#120824] to-transparent px-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-400 mb-1 uppercase tracking-wider">
             <Sliders size={14} /> System Tuning & Validation
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             远程调试 <span className="text-purple-500">与试运行专家服务</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
             <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end min-w-[140px]">
                <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><Timer size={10}/> 72h Trial Run</span>
                <div className="text-xl font-mono font-bold text-white">48:12:05 <span className="text-xs text-green-400">Running</span></div>
             </div>
             <div className="h-8 w-px bg-slate-700"></div>
             <div className="flex gap-2">
                <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-600"><Mic size={16}/></button>
                <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-600"><Video size={16}/></button>
                <button 
                   onClick={() => setIsRunning(!isRunning)}
                   className={`px-4 py-2 rounded text-xs font-bold flex items-center gap-2 transition-all ${isRunning ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                >
                   {isRunning ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor"/>}
                   {isRunning ? 'PAUSE TEST' : 'RESUME TEST'}
                </button>
             </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden px-4 pb-4">
         
         {/* LEFT: Test Suite (3 Cols) */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
             <SciFiCard title="调试用例库 (Test Suite)" subtitle="FAT / SAT" className="h-full border-purple-900/30">
                 <div className="flex flex-col gap-3">
                     {TEST_CASES.map(test => (
                         <div key={test.id} className="p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-purple-500/30 transition-all group">
                             <div className="flex justify-between items-start mb-2">
                                 <span className="text-[10px] font-mono text-slate-500">{test.id}</span>
                                 <StatusBadge status={test.status} />
                             </div>
                             <div className="text-xs font-bold text-slate-200 mb-2">{test.name}</div>
                             
                             <div className="grid grid-cols-2 gap-2 text-[10px] bg-black/20 p-2 rounded">
                                 <div>
                                     <span className="text-slate-500 block">Measured</span>
                                     <span className="font-mono text-white">{test.value}</span>
                                 </div>
                                 <div className="text-right">
                                     <span className="text-slate-500 block">Target</span>
                                     <span className="font-mono text-purple-300">{test.target}</span>
                                 </div>
                             </div>

                             <div className="mt-2 flex items-center justify-between">
                                 <span className="text-[9px] text-slate-500 uppercase">{test.category}</span>
                                 {test.expertSignOff ? (
                                     <div className="flex items-center gap-1 text-[9px] text-green-500">
                                         <ShieldCheck size={10} /> Expert Verified
                                     </div>
                                 ) : (
                                     <button className="text-[9px] text-purple-400 hover:text-white border border-purple-500/50 px-2 py-0.5 rounded transition-colors">
                                         Sign Off
                                     </button>
                                 )}
                             </div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>
         </div>

         {/* CENTER: The Stage (Visual & Logic) (6 Cols) */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
             
             {/* 1. 3D Twin with Logic Overlay */}
             <SciFiCard title="系统逻辑仿真 (Digital Twin)" subtitle="REAL-TIME" className="flex-[2] border-purple-900/50 bg-[#030206]" noPadding>
                 <div className="w-full h-full relative">
                     {/* 3D Scene */}
                     <div className="absolute inset-0 z-0">
                         <ThreeScene type="turbine" color="#a855f7" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                     </div>

                     {/* Logic Block Overlay (Simulated AR) */}
                     <div className="absolute top-4 left-4 z-10 p-3 bg-black/70 backdrop-blur rounded border border-purple-500/30 w-48">
                         <div className="flex items-center gap-2 text-xs font-bold text-purple-300 mb-2">
                             <GitBranch size={14} /> Control Logic
                         </div>
                         <div className="space-y-2">
                             <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                 <span className="text-[10px] text-white">PID Loop: Active</span>
                             </div>
                             <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                                 <span className="text-[10px] text-slate-400">Limit Protection: Stby</span>
                             </div>
                             <div className="h-px bg-slate-700 my-1"></div>
                             <div className="flex justify-between text-[10px]">
                                 <span className="text-slate-400">Output</span>
                                 <span className="font-mono text-white">82.4%</span>
                             </div>
                         </div>
                     </div>

                     {/* Bottom Metrics Bar */}
                     <div className="absolute bottom-4 left-4 right-4 flex justify-between gap-4">
                         <div className="flex-1 bg-slate-900/80 backdrop-blur border border-slate-700 rounded p-2 flex items-center justify-between">
                             <span className="text-[10px] text-slate-400">Vibration (X)</span>
                             <span className="text-sm font-mono font-bold text-white">2.4 mm/s</span>
                         </div>
                         <div className="flex-1 bg-slate-900/80 backdrop-blur border border-slate-700 rounded p-2 flex items-center justify-between">
                             <span className="text-[10px] text-slate-400">Temp (T1)</span>
                             <span className="text-sm font-mono font-bold text-white">540 °C</span>
                         </div>
                         <div className="flex-1 bg-slate-900/80 backdrop-blur border border-slate-700 rounded p-2 flex items-center justify-between">
                             <span className="text-[10px] text-slate-400">Speed</span>
                             <span className="text-sm font-mono font-bold text-cyan-400">3000 RPM</span>
                         </div>
                     </div>
                 </div>
             </SciFiCard>

             {/* 2. Step Response / Stability Chart */}
             <SciFiCard title="阶跃响应与稳定性监控" subtitle="STABILITY" className="flex-[1.5] border-slate-800">
                 <div className="w-full h-full p-2">
                     <ResponsiveContainer width="100%" height="100%">
                         <ComposedChart data={streamData} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                             <defs>
                                 <linearGradient id="colorStab" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                 </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                             <XAxis dataKey="time" hide />
                             <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 10}} domain={[0, 120]} />
                             <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                             <Tooltip contentStyle={{backgroundColor: '#050408', borderColor: '#8b5cf6', fontSize: '12px'}} />
                             <Legend wrapperStyle={{fontSize: '10px'}} />
                             
                             <Area yAxisId="right" type="monotone" dataKey="stability" name="Stability Index" stroke="#10b981" fill="url(#colorStab)" />
                             <Line yAxisId="left" type="step" dataKey="load" name="Load Setpoint" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                             <Line yAxisId="left" type="monotone" dataKey="vibration" name="Vibration (x10)" stroke="#ef4444" strokeWidth={1} dot={false} />
                         </ComposedChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

         </div>

         {/* RIGHT: Tuning Deck (3 Cols) */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
             
             {/* Parameter Knobs */}
             <SciFiCard title="PID 参数整定 (Tuning)" subtitle="REMOTE CONTROL" className="border-purple-900/30">
                 <div className="grid grid-cols-2 gap-4 py-2">
                     {params.map(p => (
                         <KnobControl key={p.id} param={p} onChange={(v) => handleParamChange(p.id, v)} />
                     ))}
                 </div>
                 <div className="mt-2 text-center">
                     <button className="text-[10px] text-purple-400 border border-purple-500/30 px-3 py-1 rounded hover:bg-purple-900/20 transition-colors">
                         Apply to Controller
                     </button>
                 </div>
             </SciFiCard>

             {/* Communication Log */}
             <SciFiCard title="专家协作日志" subtitle="CHAT" className="flex-1 border-slate-800">
                 <div className="flex flex-col h-full">
                     <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 mb-2 pr-1" style={{maxHeight: '150px'}}>
                         {EXPERT_LOG.map((log, i) => (
                             <div key={i} className="flex flex-col gap-1 text-xs">
                                 <div className="flex justify-between text-slate-500 text-[10px]">
                                     <span className="font-bold text-slate-300">{log.user}</span>
                                     <span>{log.time}</span>
                                 </div>
                                 <div className="p-2 bg-slate-900/50 rounded border border-slate-800 text-slate-300">
                                     {log.msg}
                                 </div>
                             </div>
                         ))}
                     </div>
                     <div className="mt-auto relative">
                         <input className="w-full bg-black border border-slate-700 rounded px-3 py-2 text-xs text-white focus:border-purple-500 outline-none" placeholder="Type message..." />
                     </div>
                 </div>
             </SciFiCard>

             {/* Performance Radar */}
             <SciFiCard title="性能验收评估" subtitle="VERIFICATION" className="h-48 border-slate-800">
                 <div className="w-full h-full">
                     <ResponsiveContainer width="100%" height="100%">
                         <RadarChart cx="50%" cy="50%" outerRadius="65%" data={PERFORMANCE_RADAR}>
                             <PolarGrid stroke="#334155" />
                             <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                             <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                             <Radar name="Performance" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                             <Tooltip contentStyle={{backgroundColor: '#050408', borderColor: '#8b5cf6'}} />
                         </RadarChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
