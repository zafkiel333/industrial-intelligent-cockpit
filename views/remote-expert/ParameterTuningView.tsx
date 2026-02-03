
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Sliders, Activity, Zap, RefreshCw, 
  Play, RotateCcw, TrendingUp, Cpu, 
  Settings, GitCommit, CheckCircle2, 
  AlertOctagon, BarChart4, Wind, Thermometer,
  Maximize, GitBranch, Save, History
} from 'lucide-react';
import { 
  ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  BarChart, Bar, Cell, ReferenceLine, ScatterChart, Scatter, ZAxis
} from 'recharts';

// --- Types ---

interface ControlLoop {
  id: string;
  name: string;
  tag: string;
  type: 'PID' | 'Fuzzy' | 'MPC';
  status: 'Auto' | 'Manual' | 'Cascade';
  health: number; // 0-100
  stability: 'Stable' | 'Oscillating' | 'Sluggish';
}

interface PidParams {
  kp: number;
  ti: number;
  td: number;
  deadband: number;
  filter: number;
}

interface PerformanceMetric {
  subject: string;
  Current: number;
  Optimized: number;
  fullMark: number;
}

// --- Mock Data ---

const CONTROL_LOOPS: ControlLoop[] = [
  { id: 'L-101', name: '主汽温度控制', tag: 'TIC-2041', type: 'PID', status: 'Auto', health: 65, stability: 'Oscillating' },
  { id: 'L-102', name: '给水流量调节', tag: 'FIC-1102', type: 'PID', status: 'Cascade', health: 92, stability: 'Stable' },
  { id: 'L-103', name: '炉膛负压控制', tag: 'PIC-3005', type: 'Fuzzy', status: 'Auto', health: 88, stability: 'Stable' },
  { id: 'L-104', name: '磨煤机风量', tag: 'FIC-4402', type: 'PID', status: 'Manual', health: 45, stability: 'Sluggish' },
  { id: 'L-105', name: '除氧器水位', tag: 'LIC-5021', type: 'MPC', status: 'Auto', health: 78, stability: 'Stable' },
];

const PERFORMANCE_DATA: PerformanceMetric[] = [
  { subject: '上升时间 (Rise Time)', Current: 60, Optimized: 85, fullMark: 100 },
  { subject: '超调量 (Overshoot)', Current: 40, Optimized: 90, fullMark: 100 }, // Higher score means less overshoot
  { subject: '调节时间 (Settling)', Current: 50, Optimized: 80, fullMark: 100 },
  { subject: '稳态误差 (Error)', Current: 70, Optimized: 95, fullMark: 100 },
  { subject: '鲁棒性 (Robustness)', Current: 65, Optimized: 85, fullMark: 100 },
  { subject: '执行器磨损 (Wear)', Current: 55, Optimized: 75, fullMark: 100 },
];

const AI_SUGGESTIONS = [
  { id: 1, type: 'Gain', text: '建议降低比例增益 (Kp) 15% 以抑制高频振荡。', impact: 'High' },
  { id: 2, type: 'Filter', text: '检测到信号噪声，建议增加 PV 滤波时间常数至 2s。', impact: 'Medium' },
  { id: 3, type: 'Integration', text: '积分饱和风险，建议启用抗积分饱和 (Anti-windup)。', impact: 'Low' },
];

// --- Components ---

const Knob = ({ label, value, min, max, onChange, unit }: { label: string, value: number, min: number, max: number, onChange: (v: number) => void, unit?: string }) => {
  // Simple visual representation of a knob using SVG
  const percentage = (value - min) / (max - min);
  const rotation = -135 + (percentage * 270);

  return (
    <div className="flex flex-col items-center group">
      <div className="relative w-16 h-16 mb-2 cursor-pointer">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          {/* Track */}
          <path d="M 20 80 A 40 40 0 1 1 80 80" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
          {/* Indicator Arc */}
          <path d="M 20 80 A 40 40 0 1 1 80 80" fill="none" stroke="#0ea5e9" strokeWidth="8" strokeLinecap="round" 
                strokeDasharray={`${percentage * 200}, 300`} className="transition-all duration-300" />
          {/* Knitting Needle / Pointer */}
          <g transform={`rotate(${rotation} 50 50)`} className="transition-transform duration-300 ease-out">
            <line x1="50" y1="50" x2="50" y2="15" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="50" r="4" fill="#fff" />
          </g>
        </svg>
        <input 
          type="range" min={min} max={max} step={(max-min)/100} value={value} 
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-ns-resize"
          title="Drag to adjust"
        />
      </div>
      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{label}</div>
      <div className="text-sm font-mono font-bold text-cyan-400">{value.toFixed(2)} <span className="text-[9px] text-slate-600">{unit}</span></div>
    </div>
  );
};

const SignalChart = ({ isSimulating, params }: { isSimulating: boolean, params: PidParams }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Generate step response simulation based on PID params
    const generateResponse = () => {
      const newData = [];
      let pv = 0;
      let sp = 50; // Setpoint
      let integral = 0;
      let prevError = 0;
      
      // Simulation constants
      const dt = 0.1;
      const systemLag = 0.95; // Inertia

      for (let i = 0; i < 100; i++) {
        // Step change at t=10
        if (i === 10) sp = 80;
        
        const error = sp - pv;
        integral += error * dt;
        const derivative = (error - prevError) / dt;
        
        // PID Output
        let output = (params.kp * error) + (params.kp / params.ti * integral) + (params.kp * params.td * derivative);
        
        // Apply Limit
        output = Math.max(0, Math.min(100, output));

        // System Process Model (First order lag + delay)
        pv = pv * systemLag + output * (1 - systemLag);
        
        // Add Noise
        const noise = (Math.random() - 0.5) * 2;

        newData.push({
          time: i,
          sp: sp,
          pv: pv + noise,
          cv: output,
        });
        prevError = error;
      }
      return newData;
    };

    if (isSimulating) {
        // Animate the drawing
        const fullData = generateResponse();
        let frame = 0;
        const interval = setInterval(() => {
            if (frame >= fullData.length) {
                clearInterval(interval);
            } else {
                setData(fullData.slice(0, frame));
                frame += 2;
            }
        }, 20);
        return () => clearInterval(interval);
    } else {
        setData(generateResponse());
    }
  }, [params, isSimulating]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis dataKey="time" type="number" stroke="#64748b" tick={{fontSize: 10}} hide />
        <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 110]} />
        <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#334155', fontSize: '12px'}} />
        <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
        
        <Line type="step" dataKey="sp" name="Setpoint (SP)" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
        <Area type="monotone" dataKey="pv" name="Process Variable (PV)" stroke="#0ea5e9" strokeWidth={3} fill="url(#colorPv)" />
        <Line type="monotone" dataKey="cv" name="Output (CV)" stroke="#f59e0b" strokeWidth={1} dot={false} opacity={0.6} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export const ParameterTuningView: React.FC = () => {
  const [selectedLoopId, setSelectedLoopId] = useState(CONTROL_LOOPS[0].id);
  const [pidParams, setPidParams] = useState<PidParams>({ kp: 1.5, ti: 20, td: 0.5, deadband: 0.5, filter: 1.0 });
  const [simulating, setSimulating] = useState(false);
  const [historyMode, setHistoryMode] = useState(false);

  const activeLoop = CONTROL_LOOPS.find(l => l.id === selectedLoopId) || CONTROL_LOOPS[0];

  const handleSimulate = () => {
    setSimulating(true);
    setTimeout(() => setSimulating(false), 2000); // Reset trigger
  };

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200 bg-[#04060b]">
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-cyan-900/50 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
               <Sliders size={14} /> Control Loop Optimization
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               远程参数整定 <span className="text-cyan-500">与性能调优</span>
            </h1>
          </div>
          
          <div className="flex gap-4 items-center">
             <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">Optimization Gain</span>
                <span className="text-xl font-mono font-bold text-green-400">+12.5%</span>
             </div>
             <div className="h-8 w-px bg-slate-700"></div>
             <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Loop Health Avg</span>
                 <span className="text-xl font-mono font-bold text-white">88/100</span>
             </div>
             <button className="ml-2 flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Save size={14} /> 应用参数
             </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Loop Selector */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           <div className="text-xs font-bold text-slate-400 uppercase px-1">Active Control Loops</div>
           <div className="flex flex-col gap-2">
               {CONTROL_LOOPS.map(loop => (
                   <div 
                     key={loop.id}
                     onClick={() => setSelectedLoopId(loop.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedLoopId === loop.id 
                            ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[inset_4px_0_0_#0ea5e9]' 
                            : 'bg-slate-900/30 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <div>
                               <div className="text-[10px] font-mono text-cyan-300">{loop.tag}</div>
                               <div className={`font-bold text-sm ${selectedLoopId === loop.id ? 'text-white' : 'text-slate-300'}`}>{loop.name}</div>
                           </div>
                           <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                               loop.status === 'Auto' ? 'text-green-400 border-green-800 bg-green-900/20' : 
                               loop.status === 'Manual' ? 'text-yellow-400 border-yellow-800 bg-yellow-900/20' : 
                               'text-blue-400 border-blue-800 bg-blue-900/20'
                           }`}>
                               {loop.status}
                           </span>
                       </div>
                       
                       <div className="flex items-center justify-between mt-2">
                           <div className="flex items-center gap-2 text-[10px] text-slate-500">
                               <Activity size={12} className={loop.health < 60 ? 'text-red-500' : 'text-slate-600'}/>
                               Health: {loop.health}
                           </div>
                           <div className={`text-[10px] font-bold ${
                               loop.stability === 'Oscillating' ? 'text-red-400 animate-pulse' : 
                               loop.stability === 'Sluggish' ? 'text-yellow-400' : 'text-green-500'
                           }`}>
                               {loop.stability}
                           </div>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: The Tuning Workbench */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
           
           {/* 1. Oscilloscope Display */}
           <SciFiCard title="动态响应示波器 (Step Response)" subtitle="SIMULATION" className="flex-[2] border-cyan-900/50 bg-[#080b16]" noPadding>
               <div className="w-full h-full flex flex-col">
                   {/* Toolbar */}
                   <div className="h-10 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900/50">
                       <div className="flex items-center gap-4 text-xs">
                           <div className="flex items-center gap-1 text-green-400"><div className="w-2 h-0.5 bg-green-400"></div> Setpoint</div>
                           <div className="flex items-center gap-1 text-cyan-400"><div className="w-2 h-0.5 bg-cyan-400"></div> PV</div>
                           <div className="flex items-center gap-1 text-amber-500"><div className="w-2 h-0.5 bg-amber-500"></div> Output</div>
                       </div>
                       <div className="flex gap-2">
                           <button 
                             onClick={() => setHistoryMode(!historyMode)}
                             className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${historyMode ? 'text-cyan-400' : 'text-slate-400'}`} 
                             title="Compare History"
                           >
                               <History size={16} />
                           </button>
                           <button 
                             onClick={handleSimulate}
                             className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition-colors"
                           >
                               <Play size={12} fill="currentColor" /> Step Test
                           </button>
                       </div>
                   </div>
                   
                   {/* Chart Area */}
                   <div className="flex-1 relative p-2">
                       <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                           backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                           backgroundSize: '20px 20px'
                       }}></div>
                       <SignalChart isSimulating={simulating} params={pidParams} />
                   </div>
               </div>
           </SciFiCard>

           {/* 2. Mixing Console (Parameters) */}
           <div className="h-48 bg-[#0a0d18] border border-slate-800 rounded-xl p-4 flex flex-col shadow-inner">
               <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                       <Settings size={14} className="text-cyan-500" /> PID Parameter Deck
                   </div>
                   <button 
                     onClick={() => setPidParams({ kp: 1.5, ti: 20, td: 0.5, deadband: 0.5, filter: 1.0 })}
                     className="text-[10px] flex items-center gap-1 text-slate-500 hover:text-white transition-colors"
                   >
                       <RotateCcw size={10} /> Reset Defaults
                   </button>
               </div>
               
               <div className="flex-1 flex justify-around items-center gap-8 px-4 bg-slate-900/30 rounded-lg border border-slate-800/50">
                   {/* P */}
                   <Knob label="Proportional (Kp)" value={pidParams.kp} min={0.1} max={10} unit="" onChange={(v) => setPidParams({...pidParams, kp: v})} />
                   
                   <div className="w-px h-24 bg-slate-800"></div>
                   
                   {/* I */}
                   <Knob label="Integral (Ti)" value={pidParams.ti} min={1} max={100} unit="s" onChange={(v) => setPidParams({...pidParams, ti: v})} />
                   
                   <div className="w-px h-24 bg-slate-800"></div>

                   {/* D */}
                   <Knob label="Derivative (Td)" value={pidParams.td} min={0} max={10} unit="s" onChange={(v) => setPidParams({...pidParams, td: v})} />

                   <div className="w-px h-24 bg-slate-800"></div>

                   {/* Advanced */}
                   <div className="flex flex-col gap-4 w-32">
                       <div className="space-y-1">
                           <div className="flex justify-between text-[9px] text-slate-500 uppercase">
                               <span>Deadband</span>
                               <span className="text-white">{pidParams.deadband}%</span>
                           </div>
                           <input 
                             type="range" min="0" max="5" step="0.1" value={pidParams.deadband} 
                             onChange={(e) => setPidParams({...pidParams, deadband: parseFloat(e.target.value)})}
                             className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                           />
                       </div>
                       <div className="space-y-1">
                           <div className="flex justify-between text-[9px] text-slate-500 uppercase">
                               <span>Filter (Tf)</span>
                               <span className="text-white">{pidParams.filter}s</span>
                           </div>
                           <input 
                             type="range" min="0" max="10" step="0.5" value={pidParams.filter} 
                             onChange={(e) => setPidParams({...pidParams, filter: parseFloat(e.target.value)})}
                             className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                           />
                       </div>
                   </div>
               </div>
           </div>

        </div>

        {/* RIGHT COLUMN: Insights & Metrics */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Performance Radar */}
           <SciFiCard title="调节品质评估" subtitle="METRICS" className="border-indigo-900/30">
               <div className="h-56 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={PERFORMANCE_DATA}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Current" dataKey="Current" stroke="#64748b" strokeWidth={2} fill="transparent" />
                           <Radar name="Optimized" dataKey="Optimized" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                           <Legend wrapperStyle={{fontSize: '10px'}}/>
                           <Tooltip contentStyle={{backgroundColor: '#0f0a0a', borderColor: '#333'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
               <div className="text-center mt-[-10px] text-xs text-slate-400">
                   Total Score Impact: <span className="text-green-400 font-bold">+18%</span>
               </div>
           </SciFiCard>

           {/* AI Recommendations */}
           <SciFiCard title="AI 优化建议" subtitle="ADVISOR" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-3 h-full">
                   {AI_SUGGESTIONS.map((s) => (
                       <div key={s.id} className={`p-3 rounded border text-xs flex gap-3 cursor-pointer transition-all hover:scale-[1.02]
                           ${s.impact === 'High' ? 'bg-red-900/10 border-red-900/30 hover:border-red-500/50' : 
                             s.impact === 'Medium' ? 'bg-amber-900/10 border-amber-900/30 hover:border-amber-500/50' : 
                             'bg-blue-900/10 border-blue-900/30 hover:border-blue-500/50'}
                       `}>
                           <div className={`mt-0.5 ${s.impact === 'High' ? 'text-red-500' : s.impact === 'Medium' ? 'text-amber-500' : 'text-blue-500'}`}>
                               {s.impact === 'High' ? <AlertOctagon size={14}/> : <Zap size={14}/>}
                           </div>
                           <div>
                               <div className="font-bold text-slate-200 mb-1">{s.type} Adjustment</div>
                               <p className="text-slate-400 leading-tight">{s.text}</p>
                           </div>
                       </div>
                   ))}
               </div>
               
               <div className="mt-auto pt-4 border-t border-slate-800">
                   <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors">
                       <Cpu size={14} /> Run Auto-Tune
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
