
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Wind, Zap, ShieldAlert, Thermometer, 
  Activity, AlertTriangle, Radio, Anchor, 
  ArrowRight, CheckSquare, Power, Lock, 
  Unlock, Siren, UserCheck, Mic2,
  TrendingDown, Gauge, Flame, Scale,
  Clock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, ComposedChart, Line, Bar, Cell, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';

// --- Types ---

interface StressMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  limit: number;
  trend: 'Rising' | 'Stable' | 'Falling';
  status: 'Safe' | 'Warning' | 'Critical';
}

interface ProtocolStep {
  id: string;
  code: string;
  action: string;
  role: string;
  status: 'Done' | 'In Progress' | 'Pending' | 'Locked';
  timeEst: string;
}

interface ExpertIntervention {
  id: string;
  time: string;
  expert: string;
  action: string;
  parameter: string;
  valueChange: string; // "80% -> 65%"
}

// --- Mock Data ---

// Scenario: Super Typhoon impacting an Offshore Wind Farm
const SCENARIO_INFO = {
  name: '超强台风 "海葵" 登陆防御',
  type: 'Extreme Weather / Grid Oscillation',
  level: 'RED (一级响应)',
  timeToImpact: '00:45:00', // Time until peak
  activeProtocol: 'TYPHOON-CAT4-SURVIVAL',
};

const STRESS_METRICS: StressMetric[] = [
  { id: 'm1', label: '瞬时风速 (Wind Gust)', value: 42.5, unit: 'm/s', limit: 50, trend: 'Rising', status: 'Critical' },
  { id: 'm2', label: '塔筒振动 (Tower Vib)', value: 0.45, unit: 'g', limit: 0.6, trend: 'Rising', status: 'Warning' },
  { id: 'm3', label: '电网频率 (Grid Freq)', value: 49.2, unit: 'Hz', limit: 49.5, trend: 'Falling', status: 'Critical' },
  { id: 'm4', label: '偏航误差 (Yaw Err)', value: 12, unit: 'deg', limit: 15, trend: 'Stable', status: 'Warning' },
];

const SURVIVAL_PREDICTION = Array.from({length: 60}, (_, i) => {
  const t = i; // minutes
  // Standard logic: Risk increases as storm approaches
  const riskBase = 50 + (t * 0.8); 
  // Expert logic: Mitigation measures reduce risk
  const riskMitigated = 50 + (t * 0.2); 
  
  return {
    time: `T+${t}m`,
    baseRisk: Math.min(100, riskBase),
    mitigatedRisk: Math.min(100, riskMitigated),
    limit: 90
  };
});

const EMERGENCY_PROTOCOLS: ProtocolStep[] = [
  { id: 'S1', code: 'P-001', action: '全场机组停机位置锁定 (Feather)', role: 'Auto/Sys', status: 'Done', timeEst: '2m' },
  { id: 'S2', code: 'P-002', action: '偏航系统液压释放 (Free Yaw)', role: 'Remote Expert', status: 'In Progress', timeEst: '5m' },
  { id: 'S3', code: 'P-003', action: '辅助电源切换至柴发', role: 'Site Ops', status: 'Pending', timeEst: '10m' },
  { id: 'S4', code: 'P-004', action: '海缆绝缘实时监测启动', role: 'System', status: 'Pending', timeEst: '1m' },
  { id: 'S5', code: 'P-005', action: '人员撤离确认 (Muster)', role: 'Safety Officer', status: 'Locked', timeEst: '-' },
];

const STABILITY_TRIANGLE = [
  { subject: '结构安全 (Safety)', A: 40, B: 90, fullMark: 100 }, // Current low, Target high
  { subject: '电网支撑 (Grid)', A: 80, B: 30, fullMark: 100 }, // Current high (trying to hold), Target low (let go)
  { subject: '设备寿命 (Life)', A: 50, B: 80, fullMark: 100 },
];

const EXPERT_LOGS: ExpertIntervention[] = [
  { id: 'L1', time: '10:42:05', expert: 'Dr. Zhang', action: 'Override Pitch Control', parameter: 'Pitch Rate', valueChange: 'Auto -> Max' },
  { id: 'L2', time: '10:40:12', expert: 'System', action: 'Alert Triggered', parameter: 'Wind Speed', valueChange: '>40m/s' },
  { id: 'L3', time: '10:38:50', expert: 'Sarah Li', action: 'Enable Soft-Cutout', parameter: 'Power Limit', valueChange: '100% -> 0%' },
];

// --- Components ---

const WarningLight = ({ active }: { active: boolean }) => (
  <div className={`relative w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center overflow-hidden bg-black
      ${active ? 'shadow-[0_0_50px_rgba(239,68,68,0.6)]' : ''}
  `}>
      <div className={`absolute w-full h-full bg-red-600 rounded-full opacity-50 ${active ? 'animate-ping' : 'hidden'}`}></div>
      <Siren size={32} className={`${active ? 'text-red-500 animate-pulse' : 'text-slate-700'}`} />
      {active && <div className="absolute inset-0 border-t-4 border-transparent border-t-red-400/50 rounded-full animate-spin"></div>}
  </div>
);

const GaugeMeter = ({ metric }: { metric: StressMetric }) => {
  const percent = Math.min(100, (metric.value / (metric.limit * 1.2)) * 100);
  const isCrit = metric.status === 'Critical';
  
  return (
    <div className={`p-3 rounded border bg-slate-900/40 relative overflow-hidden transition-all
        ${isCrit ? 'border-red-500/50 shadow-[inset_0_0_20px_rgba(220,38,38,0.2)]' : 'border-slate-700 hover:border-amber-500/50'}
    `}>
        {isCrit && <div className="absolute top-0 right-0 p-1"><AlertTriangle size={10} className="text-red-500 animate-pulse"/></div>}
        
        <div className="flex justify-between items-end mb-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                {metric.label.includes('Wind') ? <Wind size={10}/> : metric.label.includes('Grid') ? <Zap size={10}/> : <Activity size={10}/>}
                {metric.label.split(' ')[0]}
            </span>
            <span className={`text-xs font-bold ${metric.trend === 'Rising' ? 'text-red-400' : 'text-slate-300'}`}>
                {metric.trend === 'Rising' ? '▲' : '▼'}
            </span>
        </div>
        
        <div className="flex items-baseline gap-1 mb-2">
            <span className={`text-2xl font-mono font-bold ${isCrit ? 'text-red-500' : metric.status === 'Warning' ? 'text-amber-400' : 'text-white'}`}>
                {metric.value}
            </span>
            <span className="text-[10px] text-slate-500">{metric.unit}</span>
        </div>

        {/* Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
            <div 
                className={`h-full transition-all duration-500 ${isCrit ? 'bg-red-600' : 'bg-amber-500'}`} 
                style={{width: `${percent}%`}}
            ></div>
            {/* Limit Line */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-white z-10" style={{left: `${(metric.limit / (metric.limit * 1.2)) * 100}%`}}></div>
        </div>
        <div className="flex justify-between text-[8px] text-slate-600 mt-1">
            <span>0</span>
            <span className="text-red-400 font-bold">Limit: {metric.limit}</span>
        </div>
    </div>
  );
};

export const ExtremeConditionView: React.FC = () => {
  const [activeStepId, setActiveStepId] = useState('S2');
  const [isOverrideActive, setIsOverrideActive] = useState(false);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#050202]">
      
      {/* 1. DEFCON Header */}
      <div className="flex justify-between items-stretch border-b border-red-900/50 bg-gradient-to-r from-[#2a0a0a] to-transparent rounded-t-lg overflow-hidden">
         <div className="p-4 flex items-center gap-6">
             <WarningLight active={true} />
             <div>
                 <div className="flex items-center gap-2 mb-1">
                     <span className="bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold rounded animate-pulse">EMERGENCY MODE</span>
                     <span className="text-xs text-red-400 font-mono tracking-widest">{SCENARIO_INFO.level}</span>
                 </div>
                 <h1 className="text-3xl font-bold text-white tracking-wide">{SCENARIO_INFO.name}</h1>
                 <div className="flex gap-4 text-xs text-slate-400 mt-1">
                     <span className="flex items-center gap-1"><Clock size={12}/> Impact in: <span className="text-red-400 font-mono text-sm">{SCENARIO_INFO.timeToImpact}</span></span>
                     <span className="flex items-center gap-1"><ShieldAlert size={12}/> Protocol: {SCENARIO_INFO.activeProtocol}</span>
                 </div>
             </div>
         </div>
         
         <div className="flex flex-col justify-center px-6 border-l border-red-900/30 bg-red-950/10">
             <div className="text-right">
                 <div className="text-[10px] text-slate-500 uppercase">Expert Connection</div>
                 <div className="flex items-center justify-end gap-2 text-green-400 font-bold">
                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                     SECURE / LOW LATENCY
                 </div>
             </div>
             <div className="text-right mt-2">
                 <div className="text-[10px] text-slate-500 uppercase">Authority Level</div>
                 <div className="text-amber-400 font-bold text-sm">LEVEL 5 (FULL CONTROL)</div>
             </div>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden px-4 pb-4">
         
         {/* LEFT: Condition & Telemetry */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
             
             {/* Critical Metrics */}
             <SciFiCard title="极限工况参数 (Critical Telemetry)" subtitle="REAL-TIME" className="border-red-900/30">
                 <div className="flex flex-col gap-3">
                     {STRESS_METRICS.map(m => (
                         <GaugeMeter key={m.id} metric={m} />
                     ))}
                 </div>
             </SciFiCard>

             {/* Environment Cam */}
             <SciFiCard title="现场态势 (Situational Awareness)" className="flex-1 border-slate-800" noPadding>
                 <div className="w-full h-full relative bg-black flex flex-col">
                     <div className="flex-1 relative overflow-hidden">
                         {/* Simulated stormy camera feed */}
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
                         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-600 flex flex-col items-center">
                             <div className="w-16 h-16 border-4 border-slate-700 rounded-full border-t-red-500 animate-spin"></div>
                             <span className="mt-2 text-xs font-mono">CAM-04 SIGNAL LOST</span>
                         </div>
                         <div className="absolute top-2 left-2 text-[9px] bg-red-600 text-white px-1 rounded">LIVE</div>
                     </div>
                     <div className="p-3 border-t border-slate-800">
                         <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                             <span>Wind Direction</span>
                             <span className="text-white">NW 315°</span>
                         </div>
                         <div className="flex justify-between items-center text-xs text-slate-400">
                             <span>Atmospheric Press</span>
                             <span className="text-white">960 hPa</span>
                         </div>
                     </div>
                 </div>
             </SciFiCard>
         </div>

         {/* CENTER: Strategy & Simulation */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
             
             {/* 1. Survival Prediction Chart */}
             <SciFiCard title="生存概率推演 (Survival Forecast)" subtitle="AI SIMULATION" className="h-[320px] border-red-900/30 bg-[#080505]" noPadding>
                 <div className="w-full h-full p-4 flex flex-col">
                     <div className="flex justify-between items-center mb-2 px-2">
                         <div className="flex gap-4 text-xs">
                             <span className="flex items-center gap-1 text-slate-500"><div className="w-3 h-0.5 bg-slate-500"></div> Do Nothing</span>
                             <span className="flex items-center gap-1 text-green-400"><div className="w-3 h-0.5 bg-green-400"></div> With Expert Strategy</span>
                         </div>
                         <div className="text-[10px] text-red-400 animate-pulse border border-red-900/50 px-2 rounded">
                             Risk Horizon: +30min
                         </div>
                     </div>
                     
                     <div className="flex-1">
                         <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={SURVIVAL_PREDICTION}>
                                 <defs>
                                     <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                         <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                     </linearGradient>
                                     <linearGradient id="colorMit" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                         <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                     </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                 <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={9} />
                                 <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} label={{ value: 'Risk Index', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                                 <Tooltip contentStyle={{backgroundColor: '#0f0505', borderColor: '#333', fontSize: '12px'}} />
                                 
                                 <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" label={{value: 'Failure Threshold', fill: 'red', fontSize: 10, position: 'right'}} />
                                 
                                 <Area type="monotone" dataKey="baseRisk" stroke="#ef4444" strokeWidth={2} fill="url(#colorBase)" name="Baseline Risk" />
                                 <Area type="monotone" dataKey="mitigatedRisk" stroke="#10b981" strokeWidth={2} fill="url(#colorMit)" name="Mitigated Risk" />
                             </AreaChart>
                         </ResponsiveContainer>
                     </div>
                 </div>
             </SciFiCard>

             {/* 2. Strategy Console */}
             <div className="flex-1 grid grid-cols-2 gap-4">
                 
                 {/* Stability Radar */}
                 <SciFiCard title="多维权衡决策 (Trade-off)" className="border-slate-800">
                     <div className="w-full h-full">
                         <ResponsiveContainer width="100%" height="100%">
                             <RadarChart cx="50%" cy="50%" outerRadius="70%" data={STABILITY_TRIANGLE}>
                                 <PolarGrid stroke="#334155" />
                                 <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                 <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                 <Radar name="Current" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.3} />
                                 <Radar name="Target" dataKey="B" stroke="#10b981" strokeWidth={2} fill="transparent" strokeDasharray="4 4" />
                                 <Legend wrapperStyle={{fontSize: '10px'}}/>
                             </RadarChart>
                         </ResponsiveContainer>
                     </div>
                 </SciFiCard>

                 {/* Expert Manual Override */}
                 <SciFiCard title="专家手动介入 (Manual Override)" className="border-amber-900/30 bg-amber-950/5">
                     <div className="flex flex-col h-full gap-3 justify-center items-center">
                         <div className="text-center mb-2">
                             <div className="text-xs text-slate-400 mb-1">Control Authority</div>
                             <div className={`text-xl font-bold ${isOverrideActive ? 'text-amber-500' : 'text-slate-500'}`}>
                                 {isOverrideActive ? 'EXPERT MANUAL' : 'SYSTEM AUTO'}
                             </div>
                         </div>
                         
                         <button 
                           onClick={() => setIsOverrideActive(!isOverrideActive)}
                           className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center transition-all shadow-2xl
                               ${isOverrideActive 
                                   ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_30px_rgba(245,158,11,0.5)]' 
                                   : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-400'}
                           `}
                         >
                             <Power size={32} />
                             <span className="text-[10px] font-bold mt-1">{isOverrideActive ? 'DISENGAGE' : 'ENGAGE'}</span>
                         </button>
                         
                         <div className="text-[10px] text-slate-500">
                             {isOverrideActive ? 'Warning: Auto-protection disabled' : 'System logic protecting assets'}
                         </div>
                     </div>
                 </SciFiCard>

             </div>

         </div>

         {/* RIGHT: Execution & Logs */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
             
             {/* Protocol Checklist */}
             <SciFiCard title="应急响应流程 (SOP Execution)" subtitle="STEP 2/5" className="flex-1 border-slate-800">
                 <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-4 before:bottom-4 before:w-px before:bg-slate-700">
                     {EMERGENCY_PROTOCOLS.map((step, i) => (
                         <div key={step.id} className="relative group">
                             {/* Node */}
                             <div className={`absolute -left-[19px] top-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold z-10
                                 ${step.status === 'Done' ? 'bg-green-600 border-green-400 text-white' : 
                                   step.status === 'In Progress' ? 'bg-amber-600 border-amber-400 text-white animate-pulse' : 
                                   'bg-slate-800 border-slate-600 text-slate-500'}
                             `}>
                                 {step.status === 'Done' ? <CheckSquare size={10}/> : i + 1}
                             </div>
                             
                             <div className={`p-2 rounded border transition-colors
                                 ${step.status === 'In Progress' ? 'bg-amber-900/20 border-amber-500/50' : 
                                   step.status === 'Locked' ? 'opacity-50 border-slate-800' : 'bg-slate-900/30 border-slate-700'}
                             `}>
                                 <div className="flex justify-between items-start mb-1">
                                     <span className="text-xs font-bold text-slate-200">{step.action}</span>
                                     <span className="text-[9px] text-slate-500 font-mono">{step.timeEst}</span>
                                 </div>
                                 <div className="flex justify-between items-center text-[10px]">
                                     <span className="text-cyan-400">{step.role}</span>
                                     <span className={step.status === 'Done' ? 'text-green-500' : step.status === 'In Progress' ? 'text-amber-500' : 'text-slate-600'}>
                                         {step.status}
                                     </span>
                                 </div>
                                 
                                 {step.status === 'In Progress' && (
                                     <div className="mt-2 flex gap-2">
                                         <button className="flex-1 py-1 bg-green-600 hover:bg-green-500 text-white text-[10px] rounded font-bold">Confirm</button>
                                         <button className="flex-1 py-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] rounded">Abort</button>
                                     </div>
                                 )}
                             </div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>

             {/* Expert Logs */}
             <SciFiCard title="专家操作日志 (Audit Log)" subtitle="IMMUTABLE" className="h-[250px] border-slate-800">
                 <div className="flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar pr-1">
                     {EXPERT_LOGS.map((log) => (
                         <div key={log.id} className="text-[10px] p-2 bg-slate-900/50 border border-slate-800 rounded font-mono">
                             <div className="flex justify-between text-slate-500 mb-1">
                                 <span>{log.time}</span>
                                 <span className="text-cyan-500">{log.expert}</span>
                             </div>
                             <div className="text-slate-300">
                                 <span className="text-amber-500">[{log.action}]</span> {log.parameter}
                             </div>
                             <div className="text-slate-500 mt-0.5 pl-2 border-l-2 border-slate-700">
                                 {log.valueChange}
                             </div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
