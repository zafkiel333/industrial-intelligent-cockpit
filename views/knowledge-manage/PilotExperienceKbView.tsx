
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/pilot-experience/ThreeScene';
import { NavigationScenario } from '../../components/knowledge-manage/pilot-experience/three-types';
import { 
  Compass, Anchor, Wind, Map, 
  BookOpen, BrainCircuit, Navigation, 
  AlertTriangle, Crosshair, Ship,
  MessageSquare, Layers, RotateCcw,
  Target, Waves, FileText, ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, LineChart, Line, 
  XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area,
  Legend
} from 'recharts';

// --- MOCK DATA ---

const SCENARIO_LIST = [
  { id: 'NARROW_BEND', label: '狭窄航道S型急弯', difficulty: 'Critical', region: 'Mawei Channel' },
  { id: 'CROSS_CURRENT', label: '强横流区靠泊', difficulty: 'High', region: 'Yangshan Phase 4' },
  { id: 'BRIDGE_ZONE', label: '主航道桥区通过', difficulty: 'Medium', region: 'Sutong Bridge' },
  { id: 'FOG_NAVIGATION', label: '能见度不良(雾航)', difficulty: 'High', region: 'East China Sea' },
];

const EXPERT_TIPS = [
  { time: 'T-05:00', text: '进入弯道前需提前减速至 6 节，预留车钟余量。' },
  { time: 'T-02:30', text: '注意左舷流压明显增大，建议向流压侧带舵 5 度。' },
  { time: 'T-00:45', text: '船艏过浮标 D4 后，立即回舵并适量加车抑制偏转。' },
];

const RISK_RADAR_DATA = [
  { subject: '碰撞风险', A: 85, fullMark: 100 },
  { subject: '搁浅风险', A: 60, fullMark: 100 },
  { subject: '失控风险', A: 75, fullMark: 100 },
  { subject: '能见度', A: 40, fullMark: 100 },
  { subject: '流压影响', A: 92, fullMark: 100 },
];

const TELEMETRY_DATA = Array.from({length: 30}, (_, i) => ({
    time: i,
    rudder: Math.sin(i * 0.5) * 20, // Rudder angle
    rot: Math.cos(i * 0.5) * 10,    // Rate of Turn
    heading: 120 + i * 2,           // Heading
}));

export const PilotExperienceKbView: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<NavigationScenario>('NARROW_BEND');
  const [engineOrder, setEngineOrder] = useState('SLOW AHEAD');
  const [ukc, setUkc] = useState(2.4); // Under Keel Clearance

  useEffect(() => {
    const timer = setInterval(() => {
        // Random fluctuation
        setUkc(prev => Math.max(0.5, prev + (Math.random() - 0.5) * 0.1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#02040a] p-2 relative overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_#0ea5e9_0%,_transparent_70%)]"></div>
      
      {/* --- HEADER --- */}
      <div className="z-10 flex items-center justify-between bg-[#0b1121]/90 border border-cyan-900/50 p-4 rounded-lg backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-cyan-600/20 border-2 border-cyan-500 rounded-full flex items-center justify-center relative shadow-[0_0_20px_rgba(6,182,212,0.3)]">
             <Anchor size={28} className="text-cyan-400" />
             <div className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full animate-ping"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Navigation size={12} /> Marine Pilot Knowledge Base
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
               引航员 <span className="text-cyan-500">特殊水域操作经验集</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Vessel</div>
                <div className="text-2xl font-mono font-black text-white">MV OCEAN KING</div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Pilotage Zone</div>
                <div className="text-2xl font-mono font-black text-cyan-400">{SCENARIO_LIST.find(s=>s.id===activeScenario)?.region}</div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Scenarios & Radar --- */}
        <div className="w-[300px] flex flex-col gap-4 overflow-y-auto custom-scrollbar">
           
           <SciFiCard title="复杂水域场景库" subtitle="SCENARIOS" className="flex-1 border-cyan-900/30 bg-[#080c14]/80">
              <div className="flex flex-col gap-2 mt-2">
                 {SCENARIO_LIST.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setActiveScenario(item.id as NavigationScenario)}
                      className={`p-3 rounded border cursor-pointer transition-all relative overflow-hidden group
                        ${activeScenario === item.id 
                            ? 'bg-cyan-900/40 border-cyan-500 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                      `}
                    >
                        {activeScenario === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>}
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-xs font-bold text-white group-hover:text-cyan-300">{item.label}</span>
                           <span className={`text-[9px] px-1.5 rounded font-black ${item.difficulty === 'Critical' ? 'bg-red-900/50 text-red-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                               {item.difficulty}
                           </span>
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                            <Map size={10}/> {item.region}
                        </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="航行风险雷达" subtitle="RISK PROFILE" className="h-[240px] border-cyan-900/30">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RISK_RADAR_DATA}>
                           <PolarGrid stroke="#1e293b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Risk" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.3} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Simulation & HUD --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black/40 border border-cyan-800/30 rounded-lg overflow-hidden relative shadow-2xl group flex flex-col">
               {/* Top HUD */}
               <div className="absolute top-4 left-4 z-20 flex gap-4">
                   <div className="bg-slate-950/80 backdrop-blur border border-cyan-500/30 px-3 py-1.5 rounded flex items-center gap-3">
                       <Compass size={18} className="text-cyan-400 animate-spin-slow" />
                       <div>
                           <div className="text-[10px] text-slate-400 uppercase">Heading (HDG)</div>
                           <div className="text-lg font-mono font-bold text-white">124.5°</div>
                       </div>
                   </div>
                   <div className="bg-slate-950/80 backdrop-blur border border-cyan-500/30 px-3 py-1.5 rounded flex items-center gap-3">
                       <Waves size={18} className="text-blue-400" />
                       <div>
                           <div className="text-[10px] text-slate-400 uppercase">UKC (Clearance)</div>
                           <div className={`text-lg font-mono font-bold ${ukc < 1.0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                               {ukc.toFixed(2)} m
                           </div>
                       </div>
                   </div>
               </div>

               {/* Engine Telegraph HUD */}
               <div className="absolute top-4 right-4 z-20">
                   <div className="bg-slate-950/80 backdrop-blur border border-orange-500/30 px-4 py-2 rounded text-center">
                       <div className="text-[10px] text-orange-400 uppercase font-bold mb-1">Engine Telegraph</div>
                       <div className="text-xl font-black text-white tracking-widest">{engineOrder}</div>
                   </div>
               </div>

               {/* 3D Scene */}
               <div className="flex-1 relative">
                  <ThreeScene scenario={activeScenario} />
                  
                  {/* Bottom Legend */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-6 text-[10px] text-slate-400 bg-black/60 px-4 py-1 rounded-full border border-slate-700">
                      <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-green-500"></div> Expert Track</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-red-500"></div> Own Ship</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500 opacity-50"></div> Current Vector</div>
                  </div>
               </div>
           </div>

           {/* Telemetry Charts */}
           <div className="h-[180px] bg-slate-900/40 border border-slate-800 rounded-lg p-3 overflow-hidden">
               <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>操纵响应曲线 (Maneuvering Response)</span>
                   <span className="text-cyan-500 flex items-center gap-1"><Target size={10}/> ROT / Rudder</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={TELEMETRY_DATA}>
                       <defs>
                           <linearGradient id="rudderGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                       <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#0ea5e9'}} />
                       <Legend verticalAlign="top" height={20} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                       <Area type="step" dataKey="rudder" stroke="#0ea5e9" fill="url(#rudderGrad)" name="Rudder Angle" />
                       <Line type="monotone" dataKey="rot" stroke="#f59e0b" strokeWidth={2} dot={false} name="Rate of Turn (°/min)" />
                   </AreaChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* --- RIGHT: Expert Insights --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="专家操作提示 (Tips)" subtitle="AI ASSIST" className="flex-1 border-emerald-900/30">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-emerald-900/10 border border-emerald-500/20 rounded-xl relative overflow-hidden">
                       <div className="absolute right-0 top-0 p-2 opacity-10"><BrainCircuit size={48} className="text-emerald-500"/></div>
                       <h4 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-2">
                          <BookOpen size={14} /> 核心操纵要领
                       </h4>
                       <p className="text-[11px] text-slate-300 leading-relaxed italic">
                          "在 {activeScenario.replace('_',' ')} 场景下，应利用流压差进行辅助转向。切忌大舵角急转，以防船尾甩向浅滩区。"
                       </p>
                   </div>

                   <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                       <div className="text-[10px] text-slate-500 uppercase font-black border-b border-slate-800 pb-1">Timeline Annotations</div>
                       {EXPERT_TIPS.map((tip, i) => (
                           <div key={i} className="flex gap-3">
                               <div className="flex flex-col items-center">
                                   <div className="w-2 h-2 rounded-full bg-slate-700 mt-1.5"></div>
                                   <div className="w-0.5 h-full bg-slate-800"></div>
                               </div>
                               <div className="pb-2">
                                   <span className="text-[10px] font-mono text-cyan-500 bg-cyan-900/20 px-1 rounded">{tip.time}</span>
                                   <p className="text-xs text-slate-300 mt-1">{tip.text}</p>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           </SciFiCard>

           <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
               <div className="text-xs font-bold text-white flex items-center gap-2">
                   <FileText size={14} className="text-blue-400" /> 关联海事事故案例
               </div>
               <div className="space-y-2">
                   <div className="flex justify-between items-center text-[10px] text-slate-400 hover:text-white cursor-pointer transition-colors">
                       <span>• 2019 "Ever Smart" 搁浅事故复盘</span>
                       <ArrowRight size={10} />
                   </div>
                   <div className="flex justify-between items-center text-[10px] text-slate-400 hover:text-white cursor-pointer transition-colors">
                       <span>• 长江口深水航道避碰经验总结</span>
                       <ArrowRight size={10} />
                   </div>
               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
