
import React, { useState, useEffect, useRef } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Zap, Power, Play, RotateCcw, 
  GitBranch, CheckSquare, AlertOctagon, 
  BatteryCharging, Wind, Droplets,
  Activity, ArrowRight, Lock, Unlock,
  CircuitBoard, FileCode, Workflow
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- MOCK DATA ---

const SCENARIOS = [
  { id: 'S1', title: '方案 A: 柴发带辅机', desc: '利用保安柴油机带动核心辅机，建立机组自启动条件。', reliability: 98, time: '25min' },
  { id: 'S2', title: '方案 B: 直流系统启动', desc: '依靠蓄电池组进行全黑启动，仅适用于特定机型。', reliability: 85, time: '15min' },
  { id: 'S3', title: '方案 C: 邻网倒送电', desc: '通过联络线从临近变电站反向受电。', reliability: 99, time: '10min' },
];

const LOGIC_SEQUENCE = [
  { id: 1, label: '全厂失电确认', desc: '检测母线电压=0，确认外网解列，启动黑启动模式。', type: 'CHECK' },
  { id: 2, label: '保安电源投运', desc: '启动柴油发电机 (DG)，合闸保安II段母线。', type: 'ACTION' },
  { id: 3, label: '关键辅机恢复', desc: '启动#1机组高压油泵、技术供水泵、调速器油泵。', type: 'ACTION' },
  { id: 4, label: '机组开机逻辑', desc: '执行一键开机流程，开启进水阀，机组升速至额定。', type: 'LOGIC' },
  { id: 5, label: '零起升压', desc: '调节励磁电流，发电机电压由零升至额定值。', type: 'ACTION' },
  { id: 6, label: '冲击主变', desc: '合上发电机出口断路器，向主变压器充电。', type: 'CRITICAL' },
  { id: 7, label: '建立孤网', desc: '带厂用电负荷，稳定频率电压，等待并网。', type: 'STATE' },
];

const BATTERY_STATUS = Array.from({length: 20}, (_, i) => ({
    time: i,
    volts: 220 - i * 0.5 + Math.random(),
    load: i < 5 ? 10 : 80 // Jump when pumps start
}));

const READINESS_RADAR = [
  { subject: '厂用气源', A: 95, fullMark: 100 },
  { subject: '操作油压', A: 88, fullMark: 100 },
  { subject: '直流系统', A: 92, fullMark: 100 },
  { subject: '闸门状态', A: 100, fullMark: 100 },
  { subject: '监控通讯', A: 85, fullMark: 100 },
];

// --- COMPONENTS ---

// Animated Logic Path SVG
const PowerTopologySVG = ({ activeStep }: { activeStep: number }) => {
  // Logic to determine which lines are energized based on step
  const isEnergized = (threshold: number) => activeStep >= threshold;

  return (
    <div className="w-full h-full bg-[#050a10] rounded relative overflow-hidden select-none">
       {/* Background Grid */}
       <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>

       <svg viewBox="0 0 800 500" className="w-full h-full relative z-10">
          <defs>
             <filter id="glowGreen">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
             </filter>
             <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                 <stop offset="0%" stopColor="#334155" />
                 <stop offset="100%" stopColor="#475569" />
             </linearGradient>
          </defs>

          {/* --- Static Structure (Grey) --- */}
          
          {/* Diesel Generator */}
          <g transform="translate(100, 400)">
              <rect x="-30" y="-20" width="60" height="40" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
              <text x="0" y="5" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">DG (柴发)</text>
          </g>

          {/* Aux Busbar */}
          <rect x="50" y="300" width="300" height="10" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
          <text x="60" y="290" fill="#94a3b8" fontSize="10">400V Aux Bus</text>

          {/* Pumps / Loads */}
          <g transform="translate(100, 220)">
             <circle r="15" fill="#1e293b" stroke="#64748b" strokeWidth="2"/>
             <text x="0" y="25" textAnchor="middle" fill="#64748b" fontSize="8">Oil Pump</text>
          </g>
          <g transform="translate(200, 220)">
             <circle r="15" fill="#1e293b" stroke="#64748b" strokeWidth="2"/>
             <text x="0" y="25" textAnchor="middle" fill="#64748b" fontSize="8">Water Pump</text>
          </g>
          <g transform="translate(300, 220)">
             <circle r="15" fill="#1e293b" stroke="#64748b" strokeWidth="2"/>
             <text x="0" y="25" textAnchor="middle" fill="#64748b" fontSize="8">Governor</text>
          </g>

          {/* Main Generator */}
          <g transform="translate(500, 400)">
              <circle r="40" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
              <text x="0" y="5" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">G1 (主机)</text>
          </g>

          {/* Main Busbar */}
          <rect x="450" y="150" width="300" height="15" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
          <text x="460" y="140" fill="#94a3b8" fontSize="10">10kV Gen Bus</text>

          {/* Main Transformer */}
          <g transform="translate(600, 80)">
             <path d="M-20,0 A20,20 0 1,1 20,0 A20,20 0 1,1 -20,0" fill="none" stroke="#64748b" strokeWidth="2" />
             <path d="M-20,10 A20,20 0 1,0 20,10 A20,20 0 1,0 -20,10" fill="none" stroke="#64748b" strokeWidth="2" transform="translate(0, 15)" />
          </g>

          {/* --- Animated Lines (Green when active) --- */}

          {/* 1. DG to Aux Bus */}
          <path d="M100,380 L100,310" 
             stroke={isEnergized(2) ? "#10b981" : "#334155"} 
             strokeWidth={isEnergized(2) ? 4 : 2} 
             filter={isEnergized(2) ? "url(#glowGreen)" : ""}
             className="transition-colors duration-500"
          />
          {/* Flow Dash */}
          {isEnergized(2) && <circle r="3" fill="#fff"><animateMotion dur="1s" repeatCount="indefinite" path="M100,380 L100,310" /></circle>}

          {/* 2. Aux Bus to Pumps */}
          {[100, 200, 300].map((x, i) => (
             <React.Fragment key={i}>
                 <path d={`M${x},300 L${x},235`} 
                    stroke={isEnergized(3) ? "#10b981" : "#334155"} 
                    strokeWidth={isEnergized(3) ? 3 : 2}
                    filter={isEnergized(3) ? "url(#glowGreen)" : ""}
                 />
                 {isEnergized(3) && <circle r="2" fill="#fff"><animateMotion dur="1s" repeatCount="indefinite" path={`M${x},300 L${x},235`} /></circle>}
             </React.Fragment>
          ))}

          {/* 3. Main Generator to Main Bus */}
          <path d="M500,360 L500,165" 
             stroke={isEnergized(5) ? "#ef4444" : "#334155"}  // High Voltage Red
             strokeWidth={isEnergized(5) ? 6 : 2}
             strokeDasharray={isEnergized(5) ? "0" : "5,5"}
          />
          {isEnergized(5) && <circle r="4" fill="#ffaaaa"><animateMotion dur="0.5s" repeatCount="indefinite" path="M500,360 L500,165" /></circle>}
          
          {/* 4. Main Bus to Transformer */}
          <path d="M600,150 L600,115"
             stroke={isEnergized(6) ? "#ef4444" : "#334155"} 
             strokeWidth={isEnergized(6) ? 6 : 2}
          />

       </svg>

       {/* Breaker Symbols (Overlay) */}
       <div className={`absolute top-[320px] left-[92px] w-4 h-4 border-2 bg-black transition-colors ${isEnergized(2) ? 'border-green-500 bg-green-900' : 'border-slate-600'}`}></div>
       <div className={`absolute top-[280px] left-[592px] w-4 h-4 border-2 bg-black transition-colors ${isEnergized(6) ? 'border-red-500 bg-red-900' : 'border-slate-600'}`}></div>
       <div className={`absolute top-[135px] left-[592px] w-4 h-4 border-2 bg-black transition-colors ${isEnergized(6) ? 'border-red-500 bg-red-900' : 'border-slate-600'}`}></div>

       {/* Status Legend */}
       <div className="absolute bottom-4 right-4 flex flex-col gap-2 text-[10px] text-slate-400 bg-black/60 p-2 rounded border border-slate-800">
          <div className="flex items-center gap-2"><div className="w-3 h-1 bg-slate-600"></div> De-energized</div>
          <div className="flex items-center gap-2"><div className="w-3 h-1 bg-emerald-500"></div> 400V Active</div>
          <div className="flex items-center gap-2"><div className="w-3 h-1 bg-red-500"></div> 10kV Active</div>
       </div>
    </div>
  );
};

export const BlackStartKbView: React.FC = () => {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeScenario, setActiveScenario] = useState('S1');

  // Playback Logic
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
        interval = setInterval(() => {
            setActiveStepIdx(prev => {
                if (prev >= LOGIC_SEQUENCE.length - 1) {
                    setIsPlaying(false);
                    return prev;
                }
                return prev + 1;
            });
        }, 2000); // 2 seconds per step for demo
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#02040a] p-2 relative overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-green-900/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-green-900/20 border-2 border-green-500 rounded flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>
             <Zap size={28} className="text-green-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-green-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Power size={12} /> Grid Restoration Protocol
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               黑启动 <span className="text-green-500 italic">操作逻辑库</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Success Rate</div>
                <div className="text-2xl font-mono font-black text-white">99.2%</div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Avg Recovery</div>
                <div className="text-2xl font-mono font-black text-green-400">25 <span className="text-sm text-slate-500 font-normal">min</span></div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Last Drill</div>
                <div className="text-2xl font-mono font-black text-slate-300">2024-05</div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Strategy & Conditions --- */}
        <div className="w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="启动方案选择" subtitle="STRATEGY" className="border-green-900/30 bg-[#06140e]/90">
               <div className="flex flex-col gap-3 mt-2">
                   {SCENARIOS.map(s => (
                       <div 
                         key={s.id}
                         onClick={() => { setActiveScenario(s.id); setActiveStepIdx(0); }}
                         className={`p-3 rounded border cursor-pointer transition-all hover:translate-x-1 group
                            ${activeScenario === s.id 
                                ? 'bg-green-900/20 border-green-500 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]' 
                                : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'}
                         `}
                       >
                           <div className="flex justify-between items-center mb-1">
                               <span className={`text-xs font-bold ${activeScenario === s.id ? 'text-white' : 'text-slate-400'}`}>{s.title}</span>
                               {activeScenario === s.id && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                           </div>
                           <p className="text-[10px] text-slate-500 leading-tight mb-2">{s.desc}</p>
                           <div className="flex justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-1">
                               <span>Reliability: {s.reliability}%</span>
                               <span>Time: {s.time}</span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="启动条件监测" subtitle="PERMISSIVES" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-4 h-full">
                   <div className="grid grid-cols-2 gap-2">
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex flex-col">
                           <span className="text-[9px] text-slate-500 uppercase flex items-center gap-1"><BatteryCharging size={10}/> DC Voltage</span>
                           <span className="text-lg font-mono text-green-400">224.5 V</span>
                       </div>
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex flex-col">
                           <span className="text-[9px] text-slate-500 uppercase flex items-center gap-1"><Wind size={10}/> Air Press</span>
                           <span className="text-lg font-mono text-white">3.8 MPa</span>
                       </div>
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex flex-col">
                           <span className="text-[9px] text-slate-500 uppercase flex items-center gap-1"><Droplets size={10}/> Gov Oil</span>
                           <span className="text-lg font-mono text-white">Normal</span>
                       </div>
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex flex-col">
                           <span className="text-[9px] text-slate-500 uppercase flex items-center gap-1"><Lock size={10}/> Breakers</span>
                           <span className="text-lg font-mono text-green-400">OPEN</span>
                       </div>
                   </div>

                   <div className="flex-1 min-h-[120px]">
                       <div className="text-[10px] text-slate-500 mb-1">Battery Discharge Curve (Forecast)</div>
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={BATTERY_STATUS}>
                               <defs>
                                   <linearGradient id="batGrad" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="time" hide />
                               <YAxis domain={[200, 230]} hide />
                               <Tooltip contentStyle={{backgroundColor: '#0c0e14', borderColor: '#10b981'}} />
                               <Area type="monotone" dataKey="volts" stroke="#10b981" fill="url(#batGrad)" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: Topology Engine --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-green-900/30 rounded-lg overflow-hidden relative shadow-2xl flex flex-col">
               {/* HUD */}
               <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
                   <div className="bg-black/60 backdrop-blur border border-green-500/30 px-3 py-1.5 rounded text-xs text-green-400 font-bold uppercase tracking-widest flex items-center gap-2">
                       <CircuitBoard size={14} /> Live Topology Status
                   </div>
               </div>

               {/* SVG Diagram */}
               <div className="flex-1 relative">
                   <PowerTopologySVG activeStep={activeStepIdx + 1} />
               </div>

               {/* Control Bar */}
               <div className="h-16 bg-slate-900/80 border-t border-slate-700 flex items-center px-4 justify-between backdrop-blur">
                   <div className="flex items-center gap-4">
                       <button 
                         onClick={() => {setActiveStepIdx(0); setIsPlaying(false);}}
                         className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
                       >
                           <RotateCcw size={18} />
                       </button>
                       <div className="flex flex-col">
                           <span className="text-[10px] text-slate-500 uppercase">Current Step</span>
                           <span className="text-sm font-bold text-white">{LOGIC_SEQUENCE[activeStepIdx]?.label || 'Ready'}</span>
                       </div>
                   </div>

                   <div className="flex-1 mx-8 h-2 bg-slate-800 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-green-500 transition-all duration-500 relative"
                         style={{width: `${((activeStepIdx + 1) / LOGIC_SEQUENCE.length) * 100}%`}}
                       >
                           <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 animate-pulse"></div>
                       </div>
                   </div>

                   <button 
                     onClick={() => setIsPlaying(!isPlaying)}
                     className={`px-6 py-2 rounded font-bold text-xs flex items-center gap-2 transition-all
                        ${isPlaying ? 'bg-yellow-600 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}
                     `}
                   >
                       {isPlaying ? 'PAUSE' : 'START SEQUENCE'} <Play size={14} fill="currentColor" />
                   </button>
               </div>
           </div>

           {/* Step List */}
           <div className="h-[200px] grid grid-cols-1 md:grid-cols-2 gap-4">
               <SciFiCard title="逻辑执行队列" subtitle="SEQUENCE" className="border-slate-800" noPadding>
                   <div className="w-full h-full overflow-y-auto custom-scrollbar p-2">
                       {LOGIC_SEQUENCE.map((step, idx) => (
                           <div key={idx} className={`flex items-center gap-3 p-2 rounded mb-1 transition-colors
                               ${idx === activeStepIdx ? 'bg-green-900/20 border border-green-500/30' : 'opacity-50'}
                           `}>
                               <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                                   ${idx <= activeStepIdx ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-500'}
                               `}>
                                   {idx + 1}
                               </div>
                               <div className="flex-1">
                                   <div className={`text-xs font-bold ${idx === activeStepIdx ? 'text-green-300' : 'text-slate-400'}`}>
                                       {step.label}
                                   </div>
                                   <div className="text-[10px] text-slate-500 line-clamp-1">{step.desc}</div>
                               </div>
                               <span className="text-[9px] px-1 bg-slate-800 rounded text-slate-400">{step.type}</span>
                           </div>
                       ))}
                   </div>
               </SciFiCard>

               <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-3 flex flex-col">
                   <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-2">
                       <FileCode size={12}/> Logic Gate Analyzer (Step {activeStepIdx + 1})
                   </div>
                   
                   {/* Simplified Logic Gate Visual */}
                   <div className="flex-1 flex items-center justify-center relative bg-[#080c14] rounded border border-slate-800/50">
                       <div className="absolute top-2 left-2 text-[9px] text-slate-600 font-mono">BOOLEAN CHECK</div>
                       
                       <div className="flex items-center gap-4">
                           <div className="flex flex-col gap-2">
                               <div className={`px-2 py-1 rounded text-[10px] border ${activeStepIdx >= 0 ? 'border-green-500 text-green-400 bg-green-900/20' : 'border-slate-600 text-slate-500'}`}>
                                   Permissive A: True
                               </div>
                               <div className={`px-2 py-1 rounded text-[10px] border ${activeStepIdx >= 2 ? 'border-green-500 text-green-400 bg-green-900/20' : 'border-slate-600 text-slate-500'}`}>
                                   Permissive B: {activeStepIdx >= 2 ? 'True' : 'False'}
                               </div>
                           </div>
                           
                           {/* AND Gate Graphic */}
                           <div className="w-8 h-8 border-2 border-slate-500 rounded-r-full border-l-0 flex items-center justify-center text-[8px] text-slate-400 font-bold bg-slate-800">
                               AND
                           </div>
                           
                           <div className={`px-3 py-1 rounded text-xs font-bold border 
                               ${activeStepIdx >= 2 ? 'border-green-400 text-green-400 bg-green-900/30' : 'border-slate-600 text-slate-500'}
                           `}>
                               EXECUTE
                           </div>
                       </div>
                   </div>
               </div>
           </div>
        </div>

        {/* --- RIGHT: Knowledge & Risk --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="系统就绪度评估" subtitle="RADAR" className="h-[250px] border-slate-800">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={READINESS_RADAR}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Status" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="操作风险提示" subtitle="RISK" className="flex-1 border-red-900/30">
               <div className="space-y-3">
                   <div className="flex items-start gap-3 p-3 bg-red-900/10 border border-red-900/30 rounded">
                       <AlertOctagon className="text-red-500 shrink-0 mt-0.5" size={16} />
                       <div>
                           <div className="text-xs font-bold text-red-200">励磁涌流风险</div>
                           <div className="text-[10px] text-red-200/60 leading-tight mt-1">
                               冲击主变时可能产生较大涌流，需确认差动保护定值已临时调整。
                           </div>
                       </div>
                   </div>
                   
                   <div className="flex items-start gap-3 p-3 bg-yellow-900/10 border border-yellow-900/30 rounded">
                       <Activity className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                       <div>
                           <div className="text-xs font-bold text-yellow-200">频率波动预警</div>
                           <div className="text-[10px] text-yellow-200/60 leading-tight mt-1">
                               孤网运行初期负荷突变可能导致频率失稳，需投入一次调频功能。
                           </div>
                       </div>
                   </div>

                   <div className="mt-4 pt-4 border-t border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-2">
                           <Workflow size={12}/> Related Docs
                       </div>
                       <div className="space-y-1">
                           <div className="flex items-center gap-2 text-xs text-slate-300 hover:text-green-400 cursor-pointer transition-colors">
                               <ArrowRight size={10} /> <span>黑启动现场处置方案 V3.0</span>
                           </div>
                           <div className="flex items-center gap-2 text-xs text-slate-300 hover:text-green-400 cursor-pointer transition-colors">
                               <ArrowRight size={10} /> <span>柴油机应急操作手册</span>
                           </div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
