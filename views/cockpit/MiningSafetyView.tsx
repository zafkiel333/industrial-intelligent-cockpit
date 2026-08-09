
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cp-mining-safety]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cp-mining-safety';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, BarChart, Bar
} from 'recharts';
import { 
  ShieldCheck, Wind, Radio, Zap, Droplets, 
  Users, Activity, AlertTriangle, Fan, MapPin, 
  Phone, Thermometer, Box, Siren, MousePointer
} from 'lucide-react';

// --- TYPES ---
interface SystemStatus {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'normal' | 'warning' | 'alarm';
  color: string;
  data: { label: string; value: string; unit: string }[];
}

// --- MOCK DATA ---
const SAFETY_SYSTEMS: SystemStatus[] = [
  { 
    id: 'monitor', 
    name: '监测监控系统', 
    icon: <Activity size={24} />, 
    status: 'normal', 
    color: '#10b981',
    data: [
        { label: 'CH4 Max', value: '0.42', unit: '%' },
        { label: 'CO Max', value: '12', unit: 'ppm' },
        { label: 'Wind Spd', value: '2.5', unit: 'm/s' }
    ]
  },
  { 
    id: 'personnel', 
    name: '人员定位系统', 
    icon: <MapPin size={24} />, 
    status: 'normal', 
    color: '#3b82f6',
    data: [
        { label: 'Total', value: '145', unit: '人' },
        { label: 'Lead', value: '3', unit: '人' },
        { label: 'Zone A', value: '42', unit: '人' }
    ]
  },
  { 
    id: 'comms', 
    name: '通信联络系统', 
    icon: <Phone size={24} />, 
    status: 'normal', 
    color: '#8b5cf6',
    data: [
        { label: 'Base Stn', value: '24/24', unit: 'Online' },
        { label: 'Calls', value: '5', unit: 'Active' },
        { label: 'Broadcast', value: 'Ready', unit: '' }
    ]
  },
  { 
    id: 'refuge', 
    name: '紧急避险系统', 
    icon: <Box size={24} />, 
    status: 'normal', 
    color: '#f59e0b',
    data: [
        { label: 'Chambers', value: '6', unit: 'Avail' },
        { label: 'O2 Supply', value: '98', unit: '%' },
        { label: 'Capacity', value: '120', unit: '人' }
    ]
  },
  { 
    id: 'air', 
    name: '压风自救系统', 
    icon: <Wind size={24} />, 
    status: 'warning', 
    color: '#f97316',
    data: [
        { label: 'Main Pres', value: '0.65', unit: 'MPa' },
        { label: 'Air Flow', value: '450', unit: 'm³/min' },
        { label: 'Masks', value: '100%', unit: 'OK' }
    ]
  },
  { 
    id: 'water', 
    name: '供水施救系统', 
    icon: <Droplets size={24} />, 
    status: 'normal', 
    color: '#06b6d4',
    data: [
        { label: 'Pressure', value: '2.4', unit: 'MPa' },
        { label: 'Pool Lvl', value: '8.5', unit: 'm' },
        { label: 'Dust Spr', value: 'Auto', unit: '' }
    ]
  }
];

const GAS_TREND = Array.from({length: 20}, (_, i) => ({
    time: i,
    ch4: 0.3 + Math.random() * 0.2,
    co: 5 + Math.random() * 5
}));

export const MiningSafetyView: React.FC = () => {
  const [activeSys, setActiveSys] = useState('monitor');
  const [depth, setDepth] = useState(-400); // meters
  const [alertTicker, setAlertTicker] = useState('系统运行正常，无重大安全隐患...');

  const activeSystemData = SAFETY_SYSTEMS.find(s => s.id === activeSys) || SAFETY_SYSTEMS[0];

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#0c0c0c] text-slate-200 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-black to-black pointer-events-none"></div>
      
      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-slate-800 pb-4 px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-green-500 mb-1 uppercase tracking-wider">
             <ShieldCheck size={14} className="animate-pulse" /> Underground Safety Guardian
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             井下六大系统 <span className="text-green-500">安全态势驾驶舱</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Safety Index</div>
                <div className="text-2xl font-mono font-bold text-green-400">98.5</div>
            </div>
            <div className="text-right border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Miners Underground</div>
                <div className="text-2xl font-mono font-bold text-white">145</div>
            </div>
            <div className="text-right border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Shift Leader</div>
                <div className="text-sm font-bold text-yellow-500">Wang Qiang</div>
            </div>
        </div>
      </div>

      {/* ALERT TICKER */}
      <div className="relative z-10 bg-red-900/20 border-y border-red-900/30 py-1 overflow-hidden flex items-center">
          <Siren size={14} className="text-red-500 mx-4 animate-pulse" />
          <div className="whitespace-nowrap text-xs text-red-200 animate-[marquee_20s_linear_infinite]">
              {alertTicker}  +++  2023-10-24 14:30: Warning: Slight pressure drop in compressed air line section B-4  +++  Personnel tracking active  +++
          </div>
      </div>

      {/* MAIN CONTENT LAYERED LAYOUT */}
      <div className="relative flex-1 flex min-h-0 z-10">
          
          {/* LEFT FLANK: System Modules */}
          <div className="w-[280px] flex flex-col gap-4 py-4 pl-2 overflow-y-auto custom-scrollbar">
              {SAFETY_SYSTEMS.slice(0, 3).map(sys => (
                  <div 
                    key={sys.id}
                    onClick={() => setActiveSys(sys.id)}
                    className={`
                        relative p-4 rounded border transition-all cursor-pointer group overflow-hidden
                        ${activeSys === sys.id 
                            ? 'bg-slate-800/80 border-l-4' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                    `}
                    style={{ borderLeftColor: activeSys === sys.id ? sys.color : '' }}
                  >
                      <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-slate-950 border border-slate-700 text-slate-300 group-hover:text-white transition-colors" style={{color: activeSys === sys.id ? sys.color : undefined}}>
                                  {sys.icon}
                              </div>
                              <div>
                                  <div className="text-sm font-bold text-white">{sys.name}</div>
                                  <div className="text-[10px] text-slate-500 uppercase">{sys.status}</div>
                              </div>
                          </div>
                      </div>
                      
                      {/* Mini Data Grid */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                          {sys.data.map((d, i) => (
                              <div key={i} className="bg-slate-950/50 p-1.5 rounded">
                                  <div className="text-[9px] text-slate-500">{d.label}</div>
                                  <div className="text-xs font-mono font-bold text-slate-200">
                                      {d.value} <span className="text-[8px] font-normal text-slate-500">{d.unit}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
              
              <SciFiCard title="环境监测趋势 (1h)" subtitle="CH4 / CO" className="flex-1 border-slate-800" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={GAS_TREND}>
                              <defs>
                                  <linearGradient id="gradCH4" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                              <XAxis dataKey="time" hide />
                              <YAxis hide />
                              <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#333'}} />
                              <Area type="monotone" dataKey="ch4" stroke="#10b981" fill="url(#gradCH4)" strokeWidth={2} />
                              <Line type="monotone" dataKey="co" stroke="#f59e0b" strokeWidth={1} dot={false} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>
          </div>

          {/* CENTER: 3D Holographic Mine */}
          <div className="flex-1 relative flex flex-col mx-4 my-4">
              
              {/* 3D Container Frame */}
              <div className="flex-1 relative bg-[#050505] border border-slate-800 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                  {/* Depth Scale Ruler */}
                  <div className="absolute right-4 top-10 bottom-10 w-12 flex flex-col items-center justify-between z-20 pointer-events-auto">
                      <div className="text-[10px] text-slate-500 font-mono">0m</div>
                      <div className="flex-1 w-1 bg-slate-800 my-2 relative rounded-full">
                          <input 
                            type="range" min="-800" max="0" 
                            value={depth} 
                            onChange={(e) => setDepth(parseInt(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize z-30" 
                            // orient="vertical" // Note: 'orient' is non-standard but kept if it works in target env, else use CSS
                            style={{ writingMode: 'vertical-lr', direction: 'rtl' } as React.CSSProperties}
                          />
                          <div 
                            className="absolute w-4 h-4 bg-green-500 rounded-full left-1/2 -translate-x-1/2 shadow-[0_0_10px_lime] transition-all"
                            style={{ top: `${Math.abs(depth)/8}%` }} // Simplified mapping
                          ></div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">-800m</div>
                  </div>

                  {/* Top HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-green-900/50 p-2 rounded flex items-center gap-3">
                          <div className="text-xs text-slate-400">Current Depth</div>
                          <div className="text-xl font-bold text-white font-mono">{depth}m</div>
                      </div>
                      <div className="bg-black/60 backdrop-blur border border-slate-800 p-2 rounded flex items-center gap-3">
                          <div className="text-xs text-slate-400">Section ID</div>
                          <div className="text-sm font-bold text-green-400">Zone-C4</div>
                      </div>
                  </div>

                  {/* 3D Scene */}
                  <ThreeScene type="mine-tunnel" color="#10b981" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                  
                  {/* Overlay Vignette */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#000000_100%)] pointer-events-none"></div>
              </div>

              {/* Bottom Info Panel based on Active System */}
              <div className="h-32 mt-4 bg-slate-900/50 border border-slate-700/50 rounded p-4 flex gap-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                  <div className="w-1/3 border-r border-slate-700 pr-4">
                      <div className="text-xs text-slate-500 uppercase font-bold mb-2 flex items-center gap-2">
                          <MousePointer size={12}/> System Focus
                      </div>
                      <div className="text-lg font-bold text-white">{activeSystemData.name}</div>
                      <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                          Displaying real-time telemetry for {activeSystemData.id} subsystem. Status is currently {activeSystemData.status}.
                      </div>
                  </div>
                  <div className="flex-1 flex justify-around items-center">
                      {activeSystemData.data.map((d, i) => (
                          <div key={i} className="text-center">
                              <div className="text-xs text-slate-500 uppercase mb-1">{d.label}</div>
                              <div className="text-2xl font-mono font-bold text-white">{d.value}</div>
                              <div className="text-[10px] text-slate-600">{d.unit || '-'}</div>
                          </div>
                      ))}
                  </div>
                  <div className="w-40 flex items-center justify-center border-l border-slate-700 pl-4">
                      <button className="w-full py-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-600/50 rounded text-sm font-bold transition-colors">
                          System Diagnostics
                      </button>
                  </div>
              </div>

          </div>

          {/* RIGHT FLANK: Remaining Systems */}
          <div className="w-[280px] flex flex-col gap-4 py-4 pr-2 overflow-y-auto custom-scrollbar">
              {SAFETY_SYSTEMS.slice(3, 6).map(sys => (
                  <div 
                    key={sys.id}
                    onClick={() => setActiveSys(sys.id)}
                    className={`
                        relative p-4 rounded border transition-all cursor-pointer group overflow-hidden
                        ${activeSys === sys.id 
                            ? 'bg-slate-800/80 border-r-4' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                    `}
                    style={{ borderRightColor: activeSys === sys.id ? sys.color : '' }}
                  >
                      <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-slate-950 border border-slate-700 text-slate-300 group-hover:text-white transition-colors" style={{color: activeSys === sys.id ? sys.color : undefined}}>
                                  {sys.icon}
                              </div>
                              <div>
                                  <div className="text-sm font-bold text-white">{sys.name}</div>
                                  <div className="text-[10px] text-slate-500 uppercase">{sys.status}</div>
                              </div>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-2">
                          {sys.data.map((d, i) => (
                              <div key={i} className="bg-slate-950/50 p-1.5 rounded">
                                  <div className="text-[9px] text-slate-500">{d.label}</div>
                                  <div className="text-xs font-mono font-bold text-slate-200">
                                      {d.value} <span className="text-[8px] font-normal text-slate-500">{d.unit}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              ))}

              <SciFiCard title="区域人员分布" subtitle="ZONES" className="flex-1 border-slate-800" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                              { name: 'A', count: 42 }, { name: 'B', count: 35 },
                              { name: 'C', count: 28 }, { name: 'D', count: 40 }
                          ]} layout="vertical" margin={{left: -20}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                              <XAxis type="number" hide />
                              <YAxis dataKey="name" type="category" stroke="#64748b" tick={{fontSize: 10}} width={30} />
                              <Tooltip cursor={{fill: '#333'}} contentStyle={{backgroundColor: '#000'}} />
                              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>
          </div>

      </div>
    </div>
  );
};
