
import React, { useState } from 'react';
import { ThreeScene } from '../../components/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Layers, HardDrive, CheckCircle2, Clock, 
  Map as MapIcon, Share2, Hammer, Activity,
  Server, FileText, Database, ShieldCheck
} from 'lucide-react';

const PHASES = [
  { id: 1, name: '地质勘探 (Exploration)', status: 'completed', progress: 100 },
  { id: 2, name: '基建工程 (Construction)', status: 'active', progress: 85 },
  { id: 3, name: '设备安装 (Install)', status: 'pending', progress: 20 },
  { id: 4, name: '系统联调 (Commissioning)', status: 'pending', progress: 0 },
  { id: 5, name: '竣工交付 (Handover)', status: 'pending', progress: 0 }
];

const MODULES = [
  { id: 'MOD-01', name: '地质资源模型', type: 'Geology', size: '4.2 GB', status: 'Ready' },
  { id: 'MOD-02', name: '采矿设计方案', type: 'Design', size: '1.8 GB', status: 'Ready' },
  { id: 'MOD-03', name: '基建BIM模型', type: 'Construction', size: '12.5 GB', status: 'Syncing' },
  { id: 'MOD-04', name: '安全监测系统', type: 'Safety', size: '0.5 GB', status: 'Checking' },
  { id: 'MOD-05', name: '设备资产台账', type: 'Asset', size: '0.2 GB', status: 'Pending' },
];

export const MineConstructionDeliveryView: React.FC = () => {
  const [activePhase, setActivePhase] = useState(2);

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#1a0f0a] text-slate-200 relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/10 via-[#1a0f0a] to-black pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-orange-900/30 bg-gradient-to-r from-orange-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-400 mb-1 uppercase tracking-widest">
             <Hammer size={14} className="animate-pulse" /> Digital Mine Construction
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             数字矿山 <span className="text-orange-500 text-shadow-glow">整体建设交付平台</span>
          </h1>
        </div>
        
        {/* Status Indicators */}
        <div className="flex gap-6 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Project Progress</span>
                 <span className="font-mono text-white font-bold text-lg">65.2%</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Data Integrity</span>
                 <span className="font-mono text-green-400 font-bold text-lg">98.5%</span>
             </div>
             <button className="ml-4 px-4 py-2 bg-orange-700 hover:bg-orange-600 text-white text-xs font-bold rounded shadow-lg shadow-orange-900/50 transition-all flex items-center gap-2 border border-orange-500/50">
                 <Share2 size={14} /> 启动整体验收
             </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: Project Timeline */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="建设阶段总览 (Phases)" subtitle="TIMELINE" className="flex-1 border-orange-900/50 bg-[#0c0805]/90 pointer-events-auto">
                  <div className="flex flex-col gap-4 p-2 h-full overflow-y-auto custom-scrollbar">
                      {PHASES.map((phase, i) => (
                          <div key={phase.id} className="relative pl-6 pb-4 border-l border-slate-700 last:border-0">
                              <div className={`absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full border-2 
                                  ${phase.status === 'completed' ? 'bg-green-500 border-green-500' : 
                                    phase.status === 'active' ? 'bg-orange-500 border-orange-300 animate-pulse' : 
                                    'bg-slate-800 border-slate-600'}
                              `}></div>
                              
                              <div 
                                onClick={() => setActivePhase(phase.id)}
                                className={`p-3 rounded border cursor-pointer transition-all hover:translate-x-1 group
                                   ${activePhase === phase.id 
                                      ? 'bg-orange-900/30 border-orange-500 text-white' 
                                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-orange-700'}
                                `}
                              >
                                  <div className="flex justify-between items-start mb-2">
                                      <span className="font-bold text-sm">{phase.name}</span>
                                      {phase.status === 'completed' && <CheckCircle2 size={14} className="text-green-500" />}
                                      {phase.status === 'active' && <Activity size={14} className="text-orange-500 animate-spin-slow" />}
                                  </div>
                                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                                      <div 
                                        className={`h-full ${phase.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'}`} 
                                        style={{width: `${phase.progress}%`}}
                                      ></div>
                                  </div>
                                  <div className="text-[10px] font-mono text-right opacity-70">{phase.progress}%</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Construction Site */}
          <div className="flex-1 relative flex flex-col gap-4">
              
              {/* 3D Viewport */}
              <div className="flex-1 bg-[#050302] border border-orange-800/40 relative rounded-lg overflow-hidden shadow-2xl">
                  <div className="absolute inset-0">
                      <ThreeScene type="dd-mine-construction" color="#f97316" />
                  </div>

                  {/* HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-orange-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <MapIcon size={16} className="text-orange-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Site Coordinates</div>
                              <div className="text-sm font-bold text-white">N 34° 12' 45" / E 115° 08' 22"</div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Layer Controls */}
                  <div className="absolute bottom-4 right-4 z-20 bg-black/60 p-2 rounded border border-orange-900 text-[10px] text-slate-300 flex flex-col gap-2">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Ore Body</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-400"></div> Infrastructure</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Vegetation</div>
                  </div>
              </div>

              {/* Bottom Metrics */}
              <div className="h-32 grid grid-cols-3 gap-4">
                  <SciFiCard className="bg-[#0c0805]/90 border-orange-900/50 flex flex-col justify-center items-center" noPadding>
                      <div className="text-xs text-slate-400 uppercase mb-1">Total Excavation</div>
                      <div className="text-2xl font-bold text-white">4.2 M <span className="text-sm font-normal text-slate-500">m³</span></div>
                      <div className="w-2/3 h-1 bg-slate-800 rounded mt-2"><div className="h-full bg-orange-500 w-[65%]"></div></div>
                  </SciFiCard>
                  <SciFiCard className="bg-[#0c0805]/90 border-orange-900/50 flex flex-col justify-center items-center" noPadding>
                      <div className="text-xs text-slate-400 uppercase mb-1">Equipment Deployed</div>
                      <div className="text-2xl font-bold text-blue-300">145 <span className="text-sm font-normal text-slate-500">Units</span></div>
                      <div className="text-[10px] text-green-400 mt-1">98% Online</div>
                  </SciFiCard>
                  <SciFiCard className="bg-[#0c0805]/90 border-orange-900/50 flex flex-col justify-center items-center" noPadding>
                      <div className="text-xs text-slate-400 uppercase mb-1">Safety Incidents</div>
                      <div className="text-2xl font-bold text-green-400">0</div>
                      <div className="text-[10px] text-slate-500 mt-1">450 Days Safe Ops</div>
                  </SciFiCard>
              </div>

          </div>

          {/* RIGHT: Delivery Packages */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="交付模块清单 (Modules)" subtitle="PACKAGES" className="flex-1 border-orange-900/50 bg-[#0c0805]/90 pointer-events-auto">
                  <div className="flex flex-col gap-3 p-1">
                      {MODULES.map((mod, i) => (
                          <div key={i} className="bg-slate-900/40 p-3 rounded border border-slate-800 hover:border-orange-500/30 transition-colors group cursor-pointer">
                              <div className="flex justify-between items-center mb-1">
                                  <div className="flex items-center gap-2">
                                      <Database size={14} className="text-orange-400 group-hover:text-white transition-colors"/>
                                      <span className="text-sm font-bold text-slate-200 group-hover:text-white">{mod.name}</span>
                                  </div>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold
                                     ${mod.status === 'Ready' ? 'bg-green-900/30 text-green-400' : 
                                       mod.status === 'Syncing' ? 'bg-blue-900/30 text-blue-400 animate-pulse' : 'bg-slate-800 text-slate-500'}
                                  `}>{mod.status}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 border-t border-slate-800 pt-2">
                                  <span className="font-mono">{mod.id}</span>
                                  <span className="flex items-center gap-1"><HardDrive size={10}/> {mod.size}</span>
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-800">
                      <div className="bg-orange-900/20 border border-orange-500/30 p-3 rounded flex items-start gap-3">
                          <ShieldCheck className="text-orange-500 shrink-0" size={16} />
                          <div>
                              <div className="text-xs font-bold text-orange-200">Quality Assurance</div>
                              <div className="text-[10px] text-orange-300/70 mt-1">
                                  All modules passed ISO 19650 compliance check. Digital signature valid.
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
