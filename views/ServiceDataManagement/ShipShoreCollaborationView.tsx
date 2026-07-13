
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ShipShoreThreeScene } from '../../components/ServiceDataManagement/ShipShoreCollaboration/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sh-8]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sh-8';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  Satellite, Wifi, RefreshCw, Radio, Globe, 
  Server, Activity, Download, Upload, MonitorCheck,
  FileCode, Database, Share2, Zap, Link
} from 'lucide-react';

export const ShipShoreCollaborationView: React.FC = () => {
  const [activeLink, setActiveLink] = useState<string>('link-01');
  const [trafficLoad, setTrafficLoad] = useState(1.5);

  // Mock Data
  const fleetLinks = [
    { id: 'S-01', ship: 'COSCO STAR', type: 'VSAT (Ku)', signal: 92, lat: '35ms', status: 'Optimal' },
    { id: 'S-02', ship: 'EVER GIVEN', type: '5G / Coastal', signal: 78, lat: '120ms', status: 'Good' },
    { id: 'S-03', ship: 'MSC GULSUN', type: 'L-Band (B/U)', signal: 99, lat: '850ms', status: 'Backup' },
    { id: 'S-04', ship: 'HMM ALGECIRAS', type: 'VSAT (Ka)', signal: 45, lat: '240ms', status: 'Unstable' },
  ];

  const trafficData = Array.from({length: 20}, (_, i) => ({
      time: i,
      up: Math.floor(Math.random() * 50) + 20,
      down: Math.floor(Math.random() * 100) + 50
  }));

  const remoteSessions = [
    { id: 'SES-992', target: 'COSCO STAR', system: 'Main Engine ECU', expert: 'Dr. Zhang', duration: '14:20' },
    { id: 'SES-993', target: 'EVER GIVEN', system: 'Cargo Monitor', expert: 'System AI', duration: '05:12' },
  ];

  const otaProgress = [
    { name: 'Completed', value: 65, color: '#10b981' },
    { name: 'In Progress', value: 25, color: '#3b82f6' },
    { name: 'Pending', value: 10, color: '#334155' },
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020617] p-2 overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/30 border-b border-cyan-500/20 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-cyan-600/20 border border-cyan-500/40 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Globe className="text-cyan-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">船岸协同条件下航运装备服务数据管理平台</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-cyan-200/70 tracking-[0.2em] uppercase">
                 <span className="flex items-center gap-2"><Satellite size={12}/> SAT-LINK: ACTIVE</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><Wifi size={12}/> FLEET ONLINE: 98%</span>
                 <span>|</span>
                 <span className="text-emerald-400 font-bold">DIGITAL THREAD: SYNCHRONIZED</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Global Data Flux</div>
              <div className="text-xl font-mono font-black text-cyan-400">45.2 TB<span className="text-xs text-slate-600">/Day</span></div>
           </div>
           <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Remote Sessions</div>
              <div className="text-xl font-mono font-black text-white">12 <span className="text-xs text-green-500">Active</span></div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Connectivity */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Fleet Link Status */}
           <SciFiCard title="船队通信链路状态" subtitle="SAT/5G" className="flex-1 border-cyan-900/50">
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[350px]">
                 {fleetLinks.map((link, i) => (
                    <div key={i} className="p-3 bg-slate-900/40 rounded border border-slate-800 hover:border-cyan-500/30 transition-all group cursor-pointer">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-white flex items-center gap-2">
                             <Radio size={12} className={link.status === 'Unstable' ? 'text-red-500' : 'text-green-400'} />
                             {link.ship}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">{link.type}</span>
                       </div>
                       <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500">
                          <div className="bg-slate-950 p-1 rounded text-center">
                             <div className="mb-0.5">Signal</div>
                             <div className={link.signal < 50 ? 'text-red-400' : 'text-cyan-400'}>{link.signal}%</div>
                          </div>
                          <div className="bg-slate-950 p-1 rounded text-center">
                             <div className="mb-0.5">Latency</div>
                             <div className="text-white">{link.lat}</div>
                          </div>
                          <div className="bg-slate-950 p-1 rounded text-center">
                             <div className="mb-0.5">Sync</div>
                             <div className="text-emerald-400">OK</div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           {/* Bandwidth Usage */}
           <SciFiCard title="天地数据流量监控" subtitle="THROUGHPUT">
              <div className="h-40 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficData}>
                       <defs>
                          <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis hide />
                       <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#3b82f6', fontSize: '10px'}} />
                       <Area type="monotone" dataKey="up" stroke="#3b82f6" fill="url(#colorUp)" strokeWidth={2} name="Uplink" />
                       <Area type="monotone" dataKey="down" stroke="#22d3ee" fill="url(#colorDown)" strokeWidth={2} name="Downlink" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2 text-[10px]">
                 <div className="flex items-center gap-1 text-blue-400"><Upload size={10} /> Uplink: 45 Mbps</div>
                 <div className="flex items-center gap-1 text-cyan-400"><Download size={10} /> Downlink: 120 Mbps</div>
              </div>
           </SciFiCard>
        </div>

        {/* CENTER COLUMN: Digital Twin */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#020617] to-[#0f172a] border border-cyan-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_60px_rgba(6,182,212,0.1)]">
              {/* HUD */}
              <div className="absolute top-4 left-4 z-10">
                 <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded border border-cyan-500/30 backdrop-blur">
                    <Activity className="text-cyan-400 animate-pulse" size={16} />
                    <span className="text-xs font-bold text-cyan-100 uppercase">Global Digital Thread Active</span>
                 </div>
              </div>
              
              <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                 <div className="text-[9px] text-slate-400 font-mono">SAT_CONSTELLATION: LEO_MESH_V2</div>
                 <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                 </div>
              </div>

              <ShipShoreThreeScene globalTraffic={trafficLoad} />
              <div className="absolute bottom-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                 <div className="px-4 py-2 bg-slate-900/80 border border-slate-700 rounded-full flex items-center gap-3 backdrop-blur">
                    <div className="flex items-center gap-2 text-[10px] text-slate-300">
                       <div className="w-2 h-2 rounded-full bg-cyan-400"></div> VSAT
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-300">
                       <div className="w-2 h-2 rounded-full bg-blue-500"></div> 5G
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-300">
                       <div className="w-2 h-2 rounded-full bg-yellow-500"></div> L-Band
                    </div>
                 </div>
              </div>
           </div>

           {/* Service Tunnels */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                    <MonitorCheck size={14} /> Active Remote Sessions (Live)
                 </div>
                 <button className="text-[10px] text-cyan-500 hover:text-white flex items-center gap-1">
                    <RefreshCw size={10} /> Refresh
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                 {remoteSessions.map((ses, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-blue-900/30 rounded text-blue-400"><Server size={14}/></div>
                          <div>
                             <div className="text-xs font-bold text-white">{ses.target} <span className="text-slate-500 mx-1">/</span> {ses.system}</div>
                             <div className="text-[9px] text-slate-400">Expert: {ses.expert}</div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-[10px] text-green-400 font-mono animate-pulse">CONNECTED</div>
                          <div className="text-[9px] text-slate-500">{ses.duration}</div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Collaboration & OTA */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           
           {/* OTA Manager */}
           <SciFiCard title="装备固件 OTA 升级" subtitle="FLEET WIDE" className="border-cyan-900/50">
              <div className="flex items-center gap-4 mb-4">
                 <div className="h-16 w-16 relative">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie data={otaProgress} innerRadius={20} outerRadius={30} dataKey="value" stroke="none">
                             {otaProgress.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                          </Pie>
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">65%</div>
                 </div>
                 <div className="flex-1">
                    <div className="text-xs font-bold text-white mb-1">Patch: ECU-v2.4.1_Critical</div>
                    <div className="text-[9px] text-slate-400">Target: 42 Vessels</div>
                    <div className="text-[9px] text-slate-400">Est. Completion: 2h 15m</div>
                 </div>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-[9px] text-slate-400">
                    <span>Validation</span>
                    <span className="text-green-400">Done</span>
                 </div>
                 <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-full"></div>
                 </div>
                 <div className="flex justify-between text-[9px] text-slate-400">
                    <span>Distribution</span>
                    <span className="text-blue-400">In Progress</span>
                 </div>
                 <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[65%] animate-pulse"></div>
                 </div>
              </div>
           </SciFiCard>

           {/* Twin Sync */}
           <SciFiCard title="数字孪生同步一致性" subtitle="SHORE TWIN" className="flex-1 border-cyan-900/50">
              <div className="flex flex-col gap-3 h-full">
                 <div className="flex items-start gap-3 p-2 bg-slate-900/50 rounded border border-slate-800">
                    <Database size={16} className="text-purple-400 mt-1" />
                    <div className="flex-1">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-200">Main Engine Twin</span>
                          <span className="text-[9px] bg-green-900/20 text-green-400 px-1 rounded">SYNCED</span>
                       </div>
                       <div className="text-[9px] text-slate-500">Last update: 12s ago</div>
                    </div>
                 </div>
                 <div className="flex items-start gap-3 p-2 bg-slate-900/50 rounded border border-slate-800">
                    <Database size={16} className="text-purple-400 mt-1" />
                    <div className="flex-1">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-200">Cargo System Twin</span>
                          <span className="text-[9px] bg-yellow-900/20 text-yellow-400 px-1 rounded">LAGGING</span>
                       </div>
                       <div className="text-[9px] text-slate-500">Last update: 5m ago (Low Bandwidth)</div>
                    </div>
                 </div>
                 
                 <div className="mt-auto p-3 bg-cyan-900/10 border border-cyan-800/30 rounded flex items-center gap-2">
                    <Share2 size={16} className="text-cyan-400" />
                    <div className="text-[9px] text-cyan-200">
                       <span className="font-bold">Collaboration Note:</span> Shore team adjusted engine parameters for Vessel #04 based on twin simulation results.
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
