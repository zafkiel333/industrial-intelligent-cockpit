
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  Wind, CloudRain, Zap, Activity, 
  AlertTriangle, ShieldAlert, Siren, 
  Radio, MapPin, Navigation, Share2,
  PhoneCall, Users, CheckSquare, 
  Thermometer, Waves, Move, Umbrella,
  Tornado, CloudLightning, Power
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell, ReferenceLine, ComposedChart, Line
} from 'recharts';

// --- Types ---

interface WeatherMetric {
  time: string;
  windSpeed: number; // m/s
  rainfall: number; // mm/h
  riskIndex: number; // 0-100
}

interface DisasterEvent {
  id: string;
  type: string;
  level: 'Blue' | 'Yellow' | 'Orange' | 'Red';
  location: string;
  distance: number; // km from asset
  speed: number; // km/h
  eta: string;
}

interface ExpertOpinion {
  expert: string;
  role: string;
  assessment: 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical';
  confidence: number;
  advice: string;
  avatarColor: string;
}

// --- Mock Data ---

const WEATHER_TREND: WeatherMetric[] = Array.from({length: 24}, (_, i) => {
  const t = i;
  // Simulate a storm passing through
  const stormProfile = Math.exp(-Math.pow(t - 14, 2) / 10); 
  return {
    time: `${i}:00`,
    windSpeed: 5 + 30 * stormProfile + Math.random() * 2,
    rainfall: 0 + 50 * stormProfile + Math.random() * 5,
    riskIndex: 10 + 85 * stormProfile
  };
});

const ACTIVE_DISASTER: DisasterEvent = {
  id: 'TY-2409-HA',
  type: 'Typhoon "Haikui"',
  level: 'Red',
  location: '24.5N, 118.2E',
  distance: 45,
  speed: 25,
  eta: '2h 15m'
};

const EXPERT_PANEL: ExpertOpinion[] = [
  { expert: 'Dr. Zhang', role: 'Meteorologist', assessment: 'Critical', confidence: 95, advice: 'Wind gusts may exceed tower design load (45m/s). Recommend grid isolation.', avatarColor: '#ef4444' },
  { expert: 'Eng. Li', role: 'Structural Lead', assessment: 'High Risk', confidence: 88, advice: 'Monitoring strain gauges on Tower #42. Vibration is increasing.', avatarColor: '#f59e0b' },
  { expert: 'Ms. Wang', role: 'Grid Dispatch', assessment: 'Medium Risk', confidence: 90, advice: 'Load transfer plan activated. Backup generation on standby.', avatarColor: '#3b82f6' },
];

const RISK_DIMENSIONS = [
  { subject: 'Wind Load', val: 95, limit: 80, full: 100 },
  { subject: 'Rain/Flood', val: 70, limit: 85, full: 100 },
  { subject: 'Lightning', val: 60, limit: 70, full: 100 },
  { subject: 'Geological', val: 40, limit: 60, full: 100 },
  { subject: 'Grid Stability', val: 85, limit: 80, full: 100 },
];

// --- Sub-Components ---

const ThreatLevelBadge = ({ level }: { level: string }) => {
  const colors = {
    'Red': 'bg-red-600 text-white animate-pulse shadow-[0_0_15px_red]',
    'Orange': 'bg-orange-500 text-black',
    'Yellow': 'bg-yellow-400 text-black',
    'Blue': 'bg-blue-500 text-white',
  }[level] || 'bg-slate-700';

  return (
    <div className={`px-4 py-1 rounded text-xs font-bold uppercase tracking-widest ${colors}`}>
      {level} Alert
    </div>
  );
};

const RadarScreen = () => (
  <div className="w-full h-full relative bg-[#001] rounded-full border-2 border-slate-700 overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
      {/* Grid Rings */}
      <div className="absolute inset-0 rounded-full border border-slate-800 scale-75"></div>
      <div className="absolute inset-0 rounded-full border border-slate-800 scale-50"></div>
      <div className="absolute inset-0 rounded-full border border-slate-800 scale-25"></div>
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-800"></div>
      <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-800"></div>

      {/* Sweep Animation */}
      <div className="absolute inset-0 origin-center animate-[spin_4s_linear_infinite]">
         <div className="w-1/2 h-1/2 bg-gradient-to-l from-red-500/30 to-transparent absolute top-0 left-1/2 origin-bottom-left" style={{clipPath: 'polygon(0 0, 100% 0, 0 100%)'}}></div>
      </div>

      {/* Blips */}
      <div className="absolute top-[30%] left-[60%]">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute"></div>
          <div className="w-3 h-3 bg-red-500 rounded-full relative border border-white"></div>
          <div className="text-[8px] text-red-400 mt-1 whitespace-nowrap font-mono">EYE OF STORM</div>
      </div>

      {/* Asset Location */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="text-[8px] text-blue-400 mt-1 whitespace-nowrap">SITE</div>
      </div>
  </div>
);

export const DisasterWarningView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [timeIndex, setTimeIndex] = useState(14); // Current hour in simulation

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#0b0505]">
      
      {/* 1. DEFCON Header */}
      <div className="flex justify-between items-stretch border-b border-red-900/50 bg-gradient-to-r from-red-950/40 to-transparent p-4">
         <div className="flex items-center gap-6">
             <div className="w-14 h-14 bg-red-900/20 border-2 border-red-600 rounded flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse-slow">
                 <Siren size={28} />
             </div>
             <div>
                 <div className="flex items-center gap-3 mb-1">
                     <ThreatLevelBadge level={ACTIVE_DISASTER.level} />
                     <span className="text-xs text-red-300 font-mono tracking-wider">EVENT ID: {ACTIVE_DISASTER.id}</span>
                 </div>
                 <h1 className="text-3xl font-bold text-white tracking-wide flex items-center gap-2">
                    {ACTIVE_DISASTER.type} <span className="text-slate-500">|</span> 灾害预警研判
                 </h1>
             </div>
         </div>
         
         <div className="flex items-center gap-8">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Impact ETA</span>
                 <span className="text-3xl font-mono font-bold text-yellow-400">{ACTIVE_DISASTER.eta}</span>
             </div>
             <div className="h-10 w-px bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Distance</span>
                 <span className="text-xl font-mono font-bold text-white">{ACTIVE_DISASTER.distance} km</span>
             </div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Wind Max</span>
                 <span className="text-xl font-mono font-bold text-red-400">42.5 m/s</span>
             </div>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-4 pb-4">
         
         {/* LEFT: Environmental Sensing */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
             
             {/* Radar View */}
             <SciFiCard title="气象雷达 (Live Radar)" subtitle="100km RANGE" className="h-[280px] border-red-900/30 bg-black" noPadding>
                 <div className="w-full h-full p-4 flex flex-col items-center">
                     <div className="flex-1 aspect-square w-full max-w-[220px]">
                         <RadarScreen />
                     </div>
                     <div className="w-full grid grid-cols-2 gap-2 mt-4">
                         <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex items-center gap-2">
                             <Wind size={16} className="text-cyan-400"/>
                             <div>
                                 <div className="text-[9px] text-slate-500">Wind Dir</div>
                                 <div className="text-xs font-bold text-white">NE 45°</div>
                             </div>
                         </div>
                         <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex items-center gap-2">
                             <Move size={16} className="text-orange-400"/>
                             <div>
                                 <div className="text-[9px] text-slate-500">Storm Speed</div>
                                 <div className="text-xs font-bold text-white">{ACTIVE_DISASTER.speed} km/h</div>
                             </div>
                         </div>
                     </div>
                 </div>
             </SciFiCard>

             {/* Sensor Telemetry */}
             <SciFiCard title="现场微气象站数据" className="flex-1 border-slate-800">
                 <div className="flex flex-col gap-3">
                     {[
                        { label: '瞬时风速', val: '38.5 m/s', icon: Tornado, color: 'text-red-500' },
                        { label: '累计降雨', val: '125 mm', icon: CloudRain, color: 'text-blue-400' },
                        { label: '雷暴活动', val: 'High', icon: CloudLightning, color: 'text-yellow-400' },
                        { label: '环境温度', val: '22.5 °C', icon: Thermometer, color: 'text-green-400' },
                     ].map((m, i) => (
                         <div key={i} className="flex justify-between items-center p-2.5 bg-slate-900/40 border border-slate-800 rounded">
                             <div className="flex items-center gap-2 text-slate-300">
                                 <m.icon size={14} className={m.color} />
                                 <span className="text-xs">{m.label}</span>
                             </div>
                             <span className="font-mono font-bold text-white">{m.val}</span>
                         </div>
                     ))}
                 </div>
                 
                 <div className="mt-auto pt-4">
                     <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Risk Forecast (24h)</div>
                     <div className="h-24 w-full bg-slate-900/50 border border-slate-800 rounded p-1">
                         <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={WEATHER_TREND}>
                                 <defs>
                                     <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                                         <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                     </linearGradient>
                                 </defs>
                                 <Area type="monotone" dataKey="riskIndex" stroke="#ef4444" fill="url(#colorRisk)" strokeWidth={2} />
                             </AreaChart>
                         </ResponsiveContainer>
                     </div>
                 </div>
             </SciFiCard>

         </div>

         {/* CENTER: Asset Under Threat */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
             
             {/* 3D Asset Visualization */}
             <SciFiCard 
               title="受灾资产数字孪生 (Digital Twin)" 
               subtitle="TRANSMISSION LINE #42" 
               className="flex-[2] border-red-900/40 bg-[#080202]" 
               noPadding
             >
                 <div className="w-full h-full relative">
                     {/* Environmental Effects Layer */}
                     <div className="absolute inset-0 z-10 pointer-events-none opacity-50 mix-blend-screen" style={{
                         backgroundImage: 'url("https://www.transparenttextures.com/patterns/diagmonds-light.png")', // Simulating rain/noise
                         animation: 'rain 0.5s linear infinite'
                     }}></div>

                     {/* 3D Scene */}
                     <div className="absolute inset-0 z-0">
                         <ThreeScene type="transmission" color="#ef4444" />
                     </div>

                     {/* Threat Overlay (AR) */}
                     <div className="absolute top-[20%] right-[25%] z-20">
                         <div className="flex items-center gap-2 bg-black/60 backdrop-blur border border-red-500/50 px-3 py-1.5 rounded text-red-300 animate-pulse">
                             <AlertTriangle size={14} /> Wind Load: 115% (Critical)
                         </div>
                     </div>
                     <div className="absolute bottom-[30%] left-[25%] z-20">
                         <div className="flex items-center gap-2 bg-black/60 backdrop-blur border border-yellow-500/50 px-3 py-1.5 rounded text-yellow-300">
                             <Activity size={14} /> Vibration: 4.5g
                         </div>
                     </div>

                     {/* Controls */}
                     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                         <button className="px-4 py-1.5 bg-red-700/80 hover:bg-red-600 text-white text-xs font-bold rounded border border-red-500 backdrop-blur transition-colors">
                             Simulation Mode
                         </button>
                         <button className="px-4 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-600 backdrop-blur transition-colors">
                             Live Feed
                         </button>
                     </div>
                 </div>
             </SciFiCard>

             {/* Risk Assessment Radar */}
             <SciFiCard title="风险维度评估" subtitle="IMPACT ANALYSIS" className="flex-1 border-slate-800">
                 <div className="w-full h-full flex items-center">
                     <div className="w-1/2 h-full">
                         <ResponsiveContainer width="100%" height="100%">
                             <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RISK_DIMENSIONS}>
                                 <PolarGrid stroke="#334155" />
                                 <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                 <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                 <Radar name="Risk" dataKey="val" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.3} />
                                 <Radar name="Limit" dataKey="limit" stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" fill="transparent" />
                                 <Tooltip contentStyle={{backgroundColor: '#0f0505', borderColor: '#ef4444', color: '#fff'}} />
                             </RadarChart>
                         </ResponsiveContainer>
                     </div>
                     <div className="flex-1 space-y-3 pr-4">
                         <div className="p-3 bg-red-900/10 border border-red-500/30 rounded">
                             <div className="text-xs font-bold text-red-200 mb-1 flex items-center gap-2">
                                 <ShieldAlert size={12} /> Structure Integrity
                             </div>
                             <div className="text-[10px] text-slate-400">Wind load exceeds design limit by 15%. Risk of pylon collapse is high.</div>
                         </div>
                         <div className="p-3 bg-yellow-900/10 border border-yellow-500/30 rounded">
                             <div className="text-xs font-bold text-yellow-200 mb-1 flex items-center gap-2">
                                 <Zap size={12} /> Grid Stability
                             </div>
                             <div className="text-[10px] text-slate-400">Line galloping may cause short circuits. Auto-recloser blocked.</div>
                         </div>
                     </div>
                 </div>
             </SciFiCard>

         </div>

         {/* RIGHT: Expert & Response */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
             
             {/* Expert Council */}
             <SciFiCard title="专家研判组 (Expert Council)" subtitle="ONLINE" className="border-indigo-900/30">
                 <div className="flex flex-col gap-3">
                     {EXPERT_PANEL.map((exp, i) => (
                         <div key={i} className="bg-slate-900/40 p-3 rounded border border-slate-800 relative overflow-hidden group">
                             <div className="flex items-start justify-between mb-2">
                                 <div className="flex items-center gap-2">
                                     <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-md" style={{backgroundColor: exp.avatarColor}}>
                                         {exp.expert.charAt(0)}
                                     </div>
                                     <div>
                                         <div className="text-xs font-bold text-slate-200">{exp.expert}</div>
                                         <div className="text-[9px] text-slate-500">{exp.role}</div>
                                     </div>
                                 </div>
                                 <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                                     ${exp.assessment === 'Critical' ? 'bg-red-900/50 text-red-400' : 
                                       exp.assessment === 'High Risk' ? 'bg-orange-900/50 text-orange-400' : 'bg-yellow-900/50 text-yellow-400'}
                                 `}>{exp.assessment}</span>
                             </div>
                             <div className="text-[10px] text-slate-300 bg-black/20 p-2 rounded border border-slate-700/50 italic">
                                 "{exp.advice}"
                             </div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>

             {/* Response Plan */}
             <SciFiCard title="应急处置方案 (Response)" subtitle="ACTION" className="flex-1 border-slate-800">
                 <div className="flex flex-col h-full gap-4">
                     <div className="space-y-2">
                         <div className="flex items-center gap-2 text-xs font-bold text-white">
                             <CheckSquare size={14} className="text-green-500"/> Recommended Actions
                         </div>
                         {[
                             'Isolate Line L-42 immediately',
                             'Deploy drone inspection squad to Sector B',
                             'Activate backup power for critical loads',
                             'Evacuate personnel from 500m radius'
                         ].map((action, i) => (
                             <div key={i} className="flex items-center gap-2 p-2 bg-slate-900/50 rounded border border-slate-800 hover:border-slate-600 cursor-pointer">
                                 <div className="w-4 h-4 rounded border border-slate-500 flex items-center justify-center">
                                     {i === 0 && <div className="w-2 h-2 bg-green-500 rounded-sm"></div>}
                                 </div>
                                 <span className="text-[10px] text-slate-300">{action}</span>
                             </div>
                         ))}
                     </div>

                     <div className="mt-auto">
                         <div className="text-[9px] text-slate-500 mb-2 uppercase text-center">Authorization Required</div>
                         <div className="grid grid-cols-2 gap-2">
                             <button className="py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded shadow-lg shadow-red-900/30 flex flex-col items-center justify-center gap-1 transition-colors">
                                 <Power size={14} /> Emergency Shutdown
                             </button>
                             <button className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 flex flex-col items-center justify-center gap-1 transition-colors">
                                 <Share2 size={14} /> Broadcast Alert
                             </button>
                         </div>
                     </div>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
