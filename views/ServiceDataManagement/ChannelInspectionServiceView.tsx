
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ChannelInspectionThreeScene } from '../../components/ServiceDataManagement/ChannelInspection/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sh-7]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sh-7';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, AreaChart, Area, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { 
  Radio, Waves, Crosshair, Navigation, Wind, 
  Map as MapIcon, Anchor, AlertTriangle, CheckCircle, 
  BatteryCharging, RefreshCcw, Eye, Search, Droplets
} from 'lucide-react';

export const ChannelInspectionServiceView: React.FC = () => {
  const [activeEntity, setActiveEntity] = useState<string>('buoy-01');
  const [waterLevel, setWaterLevel] = useState(0.2); // m relative to datum

  // Mock Data
  const facilityStatus = [
    { id: 'B-12', health: 95, drift: 2.1, battery: 88, status: 'Normal' },
    { id: 'B-13', health: 72, drift: 8.5, battery: 45, status: 'Warning' }, // Drift high
    { id: 'B-14', health: 98, drift: 1.2, battery: 92, status: 'Normal' },
    { id: 'L-A', health: 100, drift: 0, battery: 100, status: 'Normal' }, // Lighthouse
  ];

  const driftScatter = [
    { x: 2, y: 1, z: 10, name: 'B-12' },
    { x: -5, y: 6, z: 50, name: 'B-13' }, // Outlier
    { x: 1, y: -2, z: 10, name: 'B-14' },
    { x: 0, y: 0, z: 5, name: 'Anchor' },
  ];

  const maintenanceTasks = [
    { id: 'MT-202', target: 'B-13', type: 'Repositioning', priority: 'High', status: 'Pending' },
    { id: 'MT-203', target: 'B-12', type: 'Cleaning', priority: 'Low', status: 'Scheduled' },
    { id: 'MT-204', target: 'L-A', type: 'Lens Check', priority: 'Medium', status: 'In Progress' },
  ];

  const hydrologData = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    level: 2.5 + Math.sin(i * 0.5) * 0.5 + Math.random() * 0.1,
    current: 1.2 + Math.cos(i * 0.5) * 0.3
  }));

  // Simulation Loop for Hydrology
  useEffect(() => {
    const interval = setInterval(() => {
      setWaterLevel(prev => prev + Math.sin(Date.now() / 2000) * 0.005);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#082f49] p-2 overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border-b border-cyan-500/30 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-cyan-600/20 border border-cyan-500/50 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Navigation className="text-cyan-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">航道设施巡检与养护服务数据管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-cyan-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><Radio size={12}/> AtoN NETWORK: ONLINE</span>
                 <span>|</span>
                 <span>CHANNEL DEPTH: 12.5m (Min)</span>
                 <span>|</span>
                 <span className="text-emerald-400 font-bold">NAVIGABLE STATUS: OPEN</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-950/60 border border-cyan-900/50 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-cyan-500 uppercase font-bold">Patrol Drone</div>
              <div className="text-xl font-mono font-black text-white flex items-center justify-end gap-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Active
              </div>
           </div>
           <div className="px-4 py-2 bg-slate-950/60 border border-cyan-900/50 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-cyan-500 uppercase font-bold">Abnormal Buoys</div>
              <div className="text-xl font-mono font-black text-orange-400">01 <span className="text-xs text-slate-500">/ 42</span></div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Asset Health */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Drift Monitoring */}
           <SciFiCard title="锚位漂移监控 (Watch Circle)" subtitle="GPS TELEMETRY" className="bg-[#0c1c2e]/80 border-cyan-800/50">
              <div className="h-48 w-full relative">
                 {/* Visual Background for Radar */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-32 h-32 rounded-full border border-dashed border-cyan-500"></div>
                    <div className="w-16 h-16 rounded-full border border-cyan-500"></div>
                    <div className="w-full h-[1px] bg-cyan-900"></div>
                    <div className="h-full w-[1px] bg-cyan-900"></div>
                 </div>
                 
                 <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                       <XAxis type="number" dataKey="x" name="East" unit="m" stroke="#475569" domain={[-10, 10]} hide />
                       <YAxis type="number" dataKey="y" name="North" unit="m" stroke="#475569" domain={[-10, 10]} hide />
                       <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#020617', borderColor: '#0ea5e9', fontSize: '10px'}} />
                       <Scatter name="Buoys" data={driftScatter} fill="#facc15">
                          {driftScatter.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.name === 'B-13' ? '#ef4444' : entry.name === 'Anchor' ? '#ffffff' : '#facc15'} />
                          ))}
                       </Scatter>
                    </ScatterChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 px-2 mt-1">
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Normal</div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Out of Position (&gt5m)</div>
              </div>
           </SciFiCard>

           {/* Facility Health List */}
           <SciFiCard title="助航设施状态列表" className="flex-1 border-cyan-800/50">
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
                 {facilityStatus.map((item) => (
                    <div key={item.id} className="p-2 bg-slate-900/40 rounded border border-slate-700 flex flex-col gap-2">
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-cyan-200">{item.id}</span>
                          <span className={`text-[9px] px-1.5 rounded font-bold ${item.status === 'Warning' ? 'bg-orange-900/30 text-orange-400' : 'bg-green-900/30 text-green-400'}`}>
                             {item.status}
                          </span>
                       </div>
                       <div className="grid grid-cols-3 gap-1 text-[9px] text-slate-400">
                          <div className="text-center bg-slate-800/50 rounded py-1">
                             <div className="mb-0.5">Health</div>
                             <div className="text-white">{item.health}%</div>
                          </div>
                          <div className="text-center bg-slate-800/50 rounded py-1">
                             <div className="mb-0.5">Drift</div>
                             <div className={item.drift > 5 ? 'text-red-400' : 'text-white'}>{item.drift}m</div>
                          </div>
                          <div className="text-center bg-slate-800/50 rounded py-1">
                             <div className="mb-0.5">Batt</div>
                             <div className="text-green-400">{item.battery}%</div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* CENTER COLUMN: 3D Twin */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#020617] to-[#0c4a6e] border border-cyan-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_60px_rgba(8,145,178,0.1)]">
              {/* HUD */}
              <div className="absolute top-4 left-4 z-10 p-3 bg-black/60 backdrop-blur rounded border border-cyan-500/30">
                 <div className="flex items-center gap-2 mb-2">
                    <Eye className="text-cyan-400 animate-pulse" size={16} />
                    <span className="text-xs font-bold text-cyan-100">AI INSPECTION FEED</span>
                 </div>
                 <div className="space-y-1 text-[10px] font-mono text-slate-300">
                    <div>TARGET: Buoy No.13</div>
                    <div>CLASS: Lateral Mark (Port)</div>
                    <div>VISUAL: <span className="text-orange-400">Surface Corrosion (15%)</span></div>
                    <div>LIGHT: <span className="text-green-400">Operational</span></div>
                 </div>
              </div>

              <div className="absolute top-4 right-4 z-10 flex flex-col items-end">
                 <div className="flex items-center gap-2 text-xs text-white bg-blue-600/80 px-2 py-1 rounded shadow-lg">
                    <Crosshair size={14} /> UAV-X4 Tracking
                 </div>
              </div>

              <ChannelInspectionThreeScene
                 activeEntityId={activeEntity}
                 onEntitySelect={setActiveEntity}
                 waterLevel={waterLevel}
              />
              <div className="absolute bottom-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
           </div>

           {/* Inspection Log */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                    <Search size={14} /> Intelligent Inspection Logs
                 </div>
                 <div className="text-[9px] text-slate-500 font-mono">LIVE FEED</div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 custom-scrollbar">
                 <div className="flex gap-2">
                    <span className="text-slate-600">[10:42:01]</span>
                    <span className="text-cyan-500 font-bold">UAV-X4:</span>
                    <span>Completed scan of Sector A. 12 assets verified.</span>
                 </div>
                 <div className="flex gap-2">
                    <span className="text-slate-600">[10:42:15]</span>
                    <span className="text-blue-500 font-bold">USV-1:</span>
                    <span>Bathymetry update: Depth 12.8m at beacon 01.</span>
                 </div>
                 <div className="flex gap-2">
                    <span className="text-slate-600">[10:42:45]</span>
                    <span className="text-red-500 font-bold">ALERT:</span>
                    <span>Buoy B-13 drift exceeds threshold (8.5m). Auto-ticket generated.</span>
                 </div>
                 <div className="flex gap-2">
                    <span className="text-slate-600">[10:43:00]</span>
                    <span className="text-green-500 font-bold">SYS:</span>
                    <span>Tide level +2.5m. Adjusting camera gimbal offset.</span>
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Hydro & Maintenance */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Hydrology */}
           <SciFiCard title="水文气象环境" subtitle="REAL-TIME" className="border-cyan-800/50">
              <div className="grid grid-cols-2 gap-3 mb-3">
                 <div className="bg-slate-900/50 p-2 rounded text-center">
                    <div className="text-[9px] text-slate-500 uppercase flex items-center justify-center gap-1"><Droplets size={10}/> Water Level</div>
                    <div className="text-lg font-bold text-blue-300">{waterLevel.toFixed(2)} m</div>
                 </div>
                 <div className="bg-slate-900/50 p-2 rounded text-center">
                    <div className="text-[9px] text-slate-500 uppercase flex items-center justify-center gap-1"><Wind size={10}/> Current</div>
                    <div className="text-lg font-bold text-white">1.2 m/s</div>
                 </div>
              </div>
              <div className="h-28 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hydrologData}>
                       <defs>
                          <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis hide domain={[2, 4]} />
                       <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none', fontSize: '10px'}} />
                       <Area type="monotone" dataKey="level" stroke="#3b82f6" fill="url(#colorLevel)" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           {/* Work Orders */}
           <SciFiCard title="养护工单队列" subtitle="WORK ORDERS" className="flex-1 border-cyan-800/50">
              <div className="space-y-3 mt-1">
                 {maintenanceTasks.map((task, i) => (
                    <div key={i} className="flex flex-col gap-1 p-2 bg-slate-900/30 border border-slate-800 rounded">
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white">{task.target}</span>
                          <span className={`text-[9px] px-1.5 rounded ${
                             task.priority === 'High' ? 'bg-red-900/40 text-red-400' : 'bg-blue-900/40 text-blue-400'
                          }`}>{task.priority}</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>{task.type}</span>
                          <span className="text-slate-500">{task.status}</span>
                       </div>
                    </div>
                 ))}
                 
                 <button className="w-full py-2 mt-2 bg-cyan-700/20 hover:bg-cyan-600/30 border border-cyan-600/40 rounded text-[10px] text-cyan-300 font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
                    <RefreshCcw size={12} /> Generate Smart Schedule
                 </button>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
