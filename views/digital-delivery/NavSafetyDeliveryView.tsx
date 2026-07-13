
import React, { useState } from 'react';
import { GeoThreeScene } from '../../components/scene-digital-delivery/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[dd-nav-safety]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/dd-nav-safety';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  ShieldAlert, Siren, LifeBuoy, AlertTriangle, 
  Map as MapIcon, Signal, Activity, CheckCircle2,
  FileText, Share2, Play, Users, Plane
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// --- MOCK DATA ---
const PROTOCOLS = [
  { id: 'SAR-01', name: '海上搜救预案 (SAR)', status: 'Active', verified: true },
  { id: 'SPILL-02', name: '溢油应急响应 (Oil Spill)', status: 'Active', verified: true },
  { id: 'COLL-03', name: '船舶碰撞处置 (Collision)', status: 'Review', verified: false },
  { id: 'FIRE-04', name: '船舶火灾扑救 (Fire)', status: 'Active', verified: true },
];

const DRILL_STATS = [
  { name: 'Resp Time', val: 12.5, unit: 'min', status: 'Good' },
  { name: 'Asset Avail', val: 95, unit: '%', status: 'Good' },
  { name: 'Comms Reli', val: 99.8, unit: '%', status: 'Good' },
  { name: 'Success Rate', val: 92, unit: '%', status: 'Warn' },
];

const ASSET_READY = [
  { id: 'B-01', name: 'Rescue Boat A', status: 'Ready', loc: 'Base 1' },
  { id: 'H-02', name: 'SAR Helicopter', status: 'Maint', loc: 'Hangar' },
  { id: 'D-05', name: 'Surveillance Drone', status: 'Airborne', loc: 'Sector C' },
  { id: 'T-03', name: 'Emergency Tug', status: 'Ready', loc: 'Pier 4' },
];

const PERFORMANCE_DATA = [
  { day: 'Mon', score: 85 },
  { day: 'Tue', score: 92 },
  { day: 'Wed', score: 88 },
  { day: 'Thu', score: 95 },
  { day: 'Fri', score: 90 },
];

export const NavSafetyDeliveryView: React.FC = () => {
  const [activeProto, setActiveProto] = useState('SAR-01');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#0f0404] text-slate-200 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-red-900/20 via-[#0f0404] to-black pointer-events-none"></div>
      
      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-red-900/30 bg-gradient-to-r from-red-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-500 mb-1 uppercase tracking-widest">
             <Siren size={14} className="animate-pulse" /> Emergency Response System
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             应急通航与安全管理 <span className="text-red-500 text-shadow-glow">数字交付指挥台</span>
          </h1>
        </div>
        
        {/* Status */}
        <div className="flex gap-6 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Alert Level</span>
                 <span className="font-mono text-red-400 font-bold text-lg">LEVEL II</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Readiness</span>
                 <span className="font-mono text-white font-bold text-lg">95%</span>
             </div>
             <button className="ml-4 px-6 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded shadow-lg shadow-red-900/40 transition-all flex items-center gap-2 border border-red-500/50">
                 <Play size={14} /> 启动演练交付
             </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: Protocols */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="应急预案库 (Protocols)" subtitle="VALIDATED" className="flex-1 border-red-900/50 bg-[#1a0505]/90 pointer-events-auto">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {PROTOCOLS.map((p, i) => (
                          <div 
                            key={i} 
                            onClick={() => setActiveProto(p.id)}
                            className={`p-3 rounded border cursor-pointer transition-all hover:translate-x-1 group
                                ${activeProto === p.id 
                                   ? 'bg-red-900/30 border-red-500 text-white shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]' 
                                   : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-red-700'}
                            `}
                          >
                              <div className="flex justify-between items-start mb-1">
                                  <div className="flex items-center gap-2">
                                      <ShieldAlert size={14} className={activeProto === p.id ? "text-red-400" : "text-slate-500"}/>
                                      <span className="text-sm font-bold">{p.name}</span>
                                  </div>
                                  {p.verified && <CheckCircle2 size={12} className="text-green-500"/>}
                              </div>
                              <div className="flex justify-between items-center text-[10px] mt-1">
                                  <span className="font-mono opacity-70">{p.id}</span>
                                  <span className={`px-1.5 rounded ${p.status === 'Active' ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'}`}>
                                      {p.status}
                                  </span>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* Performance Chart */}
              <SciFiCard title="演练达标率趋势" subtitle="DRILLS" className="h-[200px] border-red-900/50 bg-[#1a0505]/90 pointer-events-auto">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={PERFORMANCE_DATA}>
                              <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} />
                              <Tooltip cursor={{fill: 'rgba(239,68,68,0.1)'}} contentStyle={{backgroundColor: '#0f0404', borderColor: '#ef4444', color: '#fff'}} />
                              <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={20}>
                                {PERFORMANCE_DATA.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.score > 90 ? '#22c55e' : '#ef4444'} />
                                ))}
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Scene */}
          <div className="flex-1 relative flex flex-col gap-4">
              <div className="flex-1 bg-[#050101] border border-red-800/40 relative rounded-lg overflow-hidden shadow-2xl">
                  {/* 3D Scene */}
                  <div className="absolute inset-0">
                      <GeoThreeScene type="dd-nav-safety" color="#ef4444" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                  </div>

                  {/* HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4 pointer-events-none">
                      <div className="bg-black/60 backdrop-blur border border-red-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <LifeBuoy size={16} className="text-red-400 animate-spin-slow" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Rescue Ops</div>
                              <div className="text-sm font-bold text-white">Active Search</div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Target Info */}
                  <div className="absolute bottom-8 right-8 z-20 bg-black/70 p-3 rounded border border-red-900 text-xs text-slate-300 pointer-events-none w-64">
                      <div className="font-bold text-red-400 mb-2 border-b border-red-900 pb-1">TARGET: VESSEL-X</div>
                      <div className="flex justify-between mb-1"><span>Status:</span> <span className="text-white">Distress Signal</span></div>
                      <div className="flex justify-between mb-1"><span>Coordinates:</span> <span className="text-white font-mono">34.5N, 121.2E</span></div>
                      <div className="flex justify-between"><span>Drift:</span> <span className="text-yellow-400">1.2 kn SE</span></div>
                  </div>
              </div>
          </div>

          {/* RIGHT: Resource Status */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              {/* Asset Status */}
              <SciFiCard title="应急资源就绪度" subtitle="ASSETS" className="flex-1 border-red-900/50 bg-[#1a0505]/90 pointer-events-auto">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {ASSET_READY.map((asset, i) => (
                          <div key={i} className="bg-slate-900/40 p-2.5 rounded border border-slate-800 flex justify-between items-center group hover:border-red-500/30 transition-colors">
                              <div>
                                  <div className="text-xs font-bold text-slate-200">{asset.name}</div>
                                  <div className="text-[9px] text-slate-500 flex items-center gap-1">
                                      <MapIcon size={8}/> {asset.loc}
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className={`text-[10px] font-bold ${asset.status === 'Ready' || asset.status === 'Airborne' ? 'text-green-400' : 'text-yellow-400'}`}>
                                      {asset.status}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* Stats Grid */}
              <SciFiCard title="关键指标监控" subtitle="KPI" className="h-[220px] border-red-900/50 bg-[#1a0505]/90 pointer-events-auto">
                  <div className="grid grid-cols-2 gap-3 p-1 h-full content-center">
                      {DRILL_STATS.map((stat, i) => (
                          <div key={i} className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                              <div className="text-[10px] text-slate-400">{stat.name}</div>
                              <div className={`text-lg font-bold ${stat.status === 'Good' ? 'text-green-400' : 'text-yellow-400'}`}>
                                  {stat.val} <span className="text-xs font-normal text-slate-500">{stat.unit}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* Report Gen */}
              <SciFiCard title="交付文档生成" subtitle="DOCS" className="border-red-900/50 bg-[#1a0505]/90 pointer-events-auto">
                  <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600 flex items-center justify-center gap-2 transition-colors text-xs">
                          <FileText size={12} /> Drill Report
                      </button>
                      <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600 flex items-center justify-center gap-2 transition-colors text-xs">
                          <Share2 size={12} /> Share Log
                      </button>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
