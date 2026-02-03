
import React, { useState } from 'react';
import { GeoThreeScene } from '../../components/scene-digital-delivery/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Waves, Activity, Anchor, Radio, 
  Map as MapIcon, Database, CheckCircle2, 
  FileCheck, HardDrive, Ship, Search, 
  TrendingUp, Download, Scan, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// --- MOCK DATA ---
const SENSORS = [
  { id: 'R-001', name: '多波束测深仪 (MBES)', type: 'Sonar', status: 'Active', health: 98 },
  { id: 'T-102', name: '潮位计 (Tide Gauge)', type: 'Hydro', status: 'Active', health: 100 },
  { id: 'C-205', name: 'ADCP 测流仪', type: 'Hydro', status: 'Calibrating', health: 85 },
  { id: 'S-301', name: '侧扫声呐 (SSS)', type: 'Sonar', status: 'Standby', health: 92 },
];

const MAINTENANCE_LOG = [
  { id: 'T-2023-085', task: 'K12+500 疏浚作业', date: '2023-11-20', status: 'Completed', vol: '4500 m³' },
  { id: 'T-2023-086', task: '14# 灯浮标更换电池', date: '2023-11-22', status: 'Completed', vol: '--' },
  { id: 'T-2023-088', task: '航道障碍物扫测', date: 'Today', status: 'In Progress', vol: '--' },
];

const DATA_QUALITY = [
  { day: 'Mon', coverage: 98, error: 0.5 },
  { day: 'Tue', coverage: 99, error: 0.4 },
  { day: 'Wed', coverage: 95, error: 0.8 },
  { day: 'Thu', coverage: 100, error: 0.2 },
  { day: 'Fri', coverage: 97, error: 0.6 },
];

const HANDOVER_FILES = [
  { name: 'Bathymetry_Map_Nov.xyz', size: '2.4 GB', type: 'Point Cloud' },
  { name: 'Silt_Analysis_Report.pdf', size: '15 MB', type: 'Report' },
  { name: 'Maintenance_Ledger_2023.xlsx', size: '4 MB', type: 'Data' },
];

export const ChannelMonitorDeliveryView: React.FC = () => {
  const [activeSensor, setActiveSensor] = useState('R-001');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#02080a] text-slate-200 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#02080a] to-black pointer-events-none"></div>
      
      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-cyan-900/30 bg-gradient-to-r from-cyan-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-widest">
             <Waves size={14} className="animate-pulse" /> Hydrographic Sentinel
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             航道监测与维护系统 <span className="text-cyan-500 text-shadow-glow">数字交付中心</span>
          </h1>
        </div>
        
        {/* Status */}
        <div className="flex gap-6 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Coverage</span>
                 <span className="font-mono text-white font-bold text-lg">100%</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Navigable Depth</span>
                 <span className="font-mono text-cyan-400 font-bold text-lg">&gt; 6.5m</span>
             </div>
             <button className="ml-4 px-6 py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold rounded shadow-lg shadow-cyan-900/40 transition-all flex items-center gap-2 border border-cyan-500/50">
                 <FileCheck size={14} /> 确认数据归档
             </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: Sensor Network */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="感知设备网络 (Sensors)" subtitle="ONLINE" className="flex-1 border-cyan-900/50 bg-[#040a0f]/90 pointer-events-auto">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {SENSORS.map((s, i) => (
                          <div 
                            key={i} 
                            onClick={() => setActiveSensor(s.id)}
                            className={`p-3 rounded border cursor-pointer transition-all hover:translate-x-1 group
                                ${activeSensor === s.id 
                                   ? 'bg-cyan-900/30 border-cyan-500 text-white shadow-[inset_0_0_10px_rgba(34,211,238,0.2)]' 
                                   : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-cyan-700'}
                            `}
                          >
                              <div className="flex justify-between items-start mb-1">
                                  <div className="flex items-center gap-2">
                                      {s.type === 'Sonar' ? <Scan size={14} className="text-cyan-400"/> : <Activity size={14} className="text-green-400"/>}
                                      <span className="text-sm font-bold">{s.name}</span>
                                  </div>
                                  <span className={`text-[9px] px-1.5 rounded ${s.status === 'Active' ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'}`}>
                                      {s.status}
                                  </span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-mono opacity-70 mt-1">
                                  <span>ID: {s.id}</span>
                                  <span>Health: {s.health}%</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* Data Quality */}
              <SciFiCard title="数据质量趋势" subtitle="QC" className="h-[220px] border-cyan-900/50 bg-[#040a0f]/90 pointer-events-auto">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={DATA_QUALITY}>
                              <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} />
                              <Tooltip cursor={{fill: '#08141d'}} contentStyle={{backgroundColor: '#02080a', borderColor: '#22d3ee', color: '#fff'}} />
                              <Bar dataKey="coverage" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20}>
                                {DATA_QUALITY.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.coverage < 98 ? '#f59e0b' : '#0ea5e9'} />
                                ))}
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Twin */}
          <div className="flex-1 relative flex flex-col gap-4">
              <div className="flex-1 bg-[#010203] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-2xl">
                  {/* 3D Scene */}
                  <div className="absolute inset-0">
                      <GeoThreeScene type="dd-channel-monitor" color="#22d3ee" />
                  </div>

                  {/* HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4 pointer-events-none">
                      <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Ship size={16} className="text-cyan-400 animate-pulse" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Survey Vehicle</div>
                              <div className="text-sm font-bold text-white">USV-04 Active</div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Overlay Info */}
                  <div className="absolute bottom-4 right-4 z-20 bg-black/70 p-3 rounded border border-cyan-900 text-[10px] text-slate-300 pointer-events-none">
                      <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Water Surface</div>
                      <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Channel Bed</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Silt Accumulation</div>
                  </div>
              </div>

              {/* Bottom: Warning Banner */}
              <div className="h-12 bg-red-900/20 border border-red-500/30 rounded flex items-center px-4 gap-3 animate-in fade-in slide-in-from-bottom-4">
                  <AlertCircle className="text-red-500" size={20} />
                  <span className="text-xs text-red-200 font-bold uppercase">Maintenance Alert:</span>
                  <span className="text-xs text-slate-300">Section K12+500 silt accumulation exceeding 30cm threshold. Dredging recommended.</span>
                  <button className="ml-auto px-3 py-1 bg-red-900/50 hover:bg-red-800 text-white text-[10px] rounded border border-red-500 pointer-events-auto">Create Ticket</button>
              </div>
          </div>

          {/* RIGHT: Maintenance & Handover */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              {/* Maintenance Tasks */}
              <SciFiCard title="维护任务台账" subtitle="TASKS" className="flex-1 border-cyan-900/50 bg-[#040a0f]/90 pointer-events-auto">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {MAINTENANCE_LOG.map((task, i) => (
                          <div key={i} className="bg-slate-900/40 p-2.5 rounded border border-slate-800 hover:border-cyan-500/30 transition-colors">
                              <div className="flex justify-between items-start mb-1">
                                  <span className="text-xs font-bold text-slate-200">{task.task}</span>
                                  <span className={`text-[9px] px-1.5 rounded ${task.status === 'Completed' ? 'bg-green-900/40 text-green-400' : 'bg-blue-900/40 text-blue-400'}`}>
                                      {task.status}
                                  </span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                                  <span>{task.id}</span>
                                  <span>{task.date}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* Handover Files */}
              <SciFiCard title="交付文件包" subtitle="DOWNLOAD" className="h-[240px] border-cyan-900/50 bg-[#040a0f]/90 pointer-events-auto">
                  <div className="flex flex-col gap-2 p-1">
                      {HANDOVER_FILES.map((file, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900/30 hover:bg-slate-800 transition-colors cursor-pointer group">
                              <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="p-1.5 bg-slate-800 rounded text-cyan-500 group-hover:text-white transition-colors">
                                      {file.type === 'Data' ? <Database size={14}/> : <HardDrive size={14}/>}
                                  </div>
                                  <div className="min-w-0">
                                      <div className="text-xs font-bold text-slate-300 truncate">{file.name}</div>
                                      <div className="text-[9px] text-slate-500">{file.size}</div>
                                  </div>
                              </div>
                              <Download size={14} className="text-slate-600 group-hover:text-cyan-400"/>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
