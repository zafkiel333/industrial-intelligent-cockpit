import React, { useState } from 'react';
import { GeoThreeScene } from '../../components/scene-digital-delivery/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Box, Layers, FileCheck, Search, ShieldCheck, 
  Database, GitCommit, Settings, CheckCircle2, 
  Anchor, Ruler, Scan, ChevronDown, ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

// --- MOCK DATA ---
const MODEL_HIERARCHY = [
  { id: 'INFRA', label: '水工结构 (Marine Structure)', open: true, children: [
      { id: 'QUAY', label: '高桩码头 (High-Pile Wharf)', active: true },
      { id: 'REVET', label: '护岸 (Revetment)', active: false },
      { id: 'DREDGE', label: '疏浚工程 (Dredging)', active: false },
  ]},
  { id: 'MEP', label: '机电设施 (MEP)', open: false, children: [
      { id: 'POWER', label: '岸电系统 (Shore Power)', active: false },
      { id: 'LIGHT', label: '照明系统 (Lighting)', active: false },
  ]},
  { id: 'NAV', label: '助航设施 (Nav Aids)', open: false, children: [
      { id: 'BUOY', label: '灯浮标 (Buoys)', active: false },
  ]}
];

const COMPLIANCE_SCORE = [
  { subject: 'Geometry', A: 98, fullMark: 100 },
  { subject: 'Attributes', A: 92, fullMark: 100 },
  { subject: 'Naming', A: 100, fullMark: 100 },
  { subject: 'Topology', A: 85, fullMark: 100 },
  { subject: 'Ref Data', A: 95, fullMark: 100 },
];

const CHECKLIST = [
  { item: 'IFC Schema Validation', status: 'Pass', info: 'IFC4x3' },
  { item: 'Clash Detection', status: 'Pass', info: '0 Clashes' },
  { item: 'Georeference Check', status: 'Pass', info: 'WGS84 / UTM 50N' },
  { item: 'LOD Compliance', status: 'Warn', info: 'Pile Cap < LOD400' },
];

export const PortBimDeliveryView: React.FC = () => {
  const [activeItem, setActiveItem] = useState('QUAY');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#020408] text-slate-200 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020408] to-black pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-20 px-8 py-5 flex justify-between items-start pointer-events-none border-b border-blue-900/30 bg-gradient-to-r from-blue-950/80 to-transparent">
          <div>
              <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-[0.2em] font-bold animate-pulse">
                 <Box size={14} /> BIM Lifecycle Handover
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-lg">
                 港航设施BIM模型 <span className="text-blue-500">数字交付实验室</span>
              </h1>
          </div>
          
          <div className="flex gap-6 pointer-events-auto items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-400 uppercase">Model Standard</span>
                 <span className="text-lg font-mono text-white font-bold">JTS/T 198-2022</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-400 uppercase">Verification</span>
                 <span className="text-lg font-mono text-green-400 font-bold">Passed</span>
             </div>
             <button className="ml-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold uppercase tracking-wider transition-all flex items-center gap-2 text-xs shadow-lg border border-blue-400/50">
                 <Database size={14} /> 导出交付包
             </button>
          </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative z-10 p-6 flex gap-6 min-h-0">
          
          {/* LEFT: Model Browser */}
          <div className="w-72 flex flex-col gap-4 pointer-events-auto">
              <SciFiCard title="模型结构树 (Model Tree)" subtitle="ASSETS" className="flex-1 border-blue-900/40 bg-[#050b14]/90 backdrop-blur-md">
                  <div className="flex flex-col gap-2 p-1 overflow-y-auto custom-scrollbar h-full">
                      
                      {/* Search */}
                      <div className="relative mb-2">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
                          <input type="text" placeholder="Filter elements..." className="w-full bg-slate-900 border border-slate-700 rounded py-1.5 pl-8 pr-2 text-xs text-slate-300 outline-none focus:border-blue-500"/>
                      </div>

                      {MODEL_HIERARCHY.map((group) => (
                          <div key={group.id} className="mb-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-800/50 p-2 rounded mb-1 cursor-pointer hover:bg-slate-800">
                                  {group.open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                  {group.label}
                              </div>
                              {group.open && (
                                  <div className="pl-3 space-y-1 border-l border-slate-700 ml-2">
                                      {group.children.map(item => (
                                          <div 
                                            key={item.id}
                                            onClick={() => setActiveItem(item.id)}
                                            className={`flex justify-between items-center p-2 rounded cursor-pointer transition-all border text-xs
                                                ${activeItem === item.id 
                                                    ? 'bg-blue-900/30 border-blue-500 text-white' 
                                                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800'}
                                            `}
                                          >
                                              <span className="flex items-center gap-2"><Layers size={10}/> {item.label}</span>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              </SciFiCard>
          </div>

          {/* CENTER: 3D Inspection */}
          <div className="flex-1 relative flex flex-col gap-4">
              <div className="flex-1 bg-[#010203] border border-blue-800/40 relative rounded-lg overflow-hidden shadow-2xl">
                  {/* 3D Scene */}
                  <div className="absolute inset-0">
                      <GeoThreeScene type="dd-port-bim" color="#0ea5e9" />
                  </div>

                  {/* HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4 pointer-events-none">
                      <div className="bg-black/60 backdrop-blur border border-blue-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Scan size={16} className="text-blue-400 animate-spin-slow" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Explode View</div>
                              <div className="text-sm font-bold text-white">Active</div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Active Element Info */}
                  <div className="absolute bottom-4 left-4 z-20 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded w-64 pointer-events-none">
                      <div className="text-xs font-bold text-blue-300 mb-2 border-b border-slate-700 pb-1">{activeItem} Details</div>
                      <div className="space-y-1 text-[10px] text-slate-400">
                           <div className="flex justify-between"><span>Element ID:</span> <span className="text-white font-mono">2845-XYZ</span></div>
                           <div className="flex justify-between"><span>Material:</span> <span className="text-white">C40 Marine Concrete</span></div>
                           <div className="flex justify-between"><span>Volume:</span> <span className="text-white">125 m³</span></div>
                           <div className="flex justify-between"><span>LOD:</span> <span className="text-green-400">LOD 400</span></div>
                      </div>
                  </div>
              </div>
          </div>

          {/* RIGHT: Quality & Data */}
          <div className="w-80 flex flex-col gap-4 pointer-events-auto">
              
              {/* Quality Radar */}
              <SciFiCard title="模型质量评分 (Quality)" subtitle="SCORE" className="h-[260px] border-blue-900/40 bg-[#050b14]/90 backdrop-blur-md">
                  <div className="w-full h-full p-2 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={COMPLIANCE_SCORE}>
                              <PolarGrid stroke="#1e3a8a" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#93c5fd', fontSize: 10 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar name="Score" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.4} />
                              <Tooltip contentStyle={{backgroundColor: '#020408', borderColor: '#3b82f6'}} />
                          </RadarChart>
                      </ResponsiveContainer>
                      <div className="absolute top-0 right-0 text-xs font-bold text-green-400 bg-blue-900/30 px-2 py-1 rounded">Overall: 95/100</div>
                  </div>
              </SciFiCard>

              {/* Checklist */}
              <SciFiCard title="合规性检查清单" subtitle="AUDIT" className="flex-1 border-blue-900/40 bg-[#050b14]/90 backdrop-blur-md">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {CHECKLIST.map((check, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 bg-slate-900/50 border border-slate-800 rounded group hover:border-blue-500/30 transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className={`p-1 rounded-full ${check.status === 'Pass' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                      {check.status === 'Pass' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                                  </div>
                                  <div>
                                      <div className="text-xs font-bold text-slate-200">{check.item}</div>
                                      <div className="text-[9px] text-slate-500">{check.info}</div>
                                  </div>
                              </div>
                              <span className={`text-[9px] font-bold ${check.status === 'Pass' ? 'text-green-500' : 'text-yellow-500'}`}>{check.status}</span>
                          </div>
                      ))}
                      
                      <div className="mt-auto pt-3 border-t border-slate-800">
                           <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900 p-2 rounded">
                               <span>Metadata Density</span>
                               <span className="text-white font-mono">15 attrs/obj</span>
                           </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>

      {/* BOTTOM: Data Pipeline Visual */}
      <div className="h-16 bg-[#050b14]/90 border-t border-blue-900/30 z-20 px-8 flex items-center justify-center pointer-events-none">
           <div className="flex items-center gap-4 w-full max-w-4xl opacity-70">
               <div className="text-[10px] text-slate-500 uppercase">Data Pipeline</div>
               <div className="flex-1 h-1 bg-slate-800 rounded relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-1/3 animate-[slideRight_2s_linear_infinite]"></div>
               </div>
               <div className="text-[10px] font-mono text-blue-300">Syncing...</div>
           </div>
      </div>
    </div>
  );
};