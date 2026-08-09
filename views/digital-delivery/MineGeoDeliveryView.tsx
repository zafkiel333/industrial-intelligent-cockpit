
import React, { useState } from 'react';
import { GeoThreeScene } from '../../components/scene-digital-delivery/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Database, Layers, FileCode, Search, 
  Map as MapIcon, Share2, CheckCircle2, 
  AlertOctagon, Cuboid, BarChart4, Grid, 
  MoreHorizontal, Download, Box, FileText
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, CartesianGrid 
} from 'recharts';

// --- MOCK DATA ---

const GRADE_DISTRIBUTION = [
  { range: '0-1 g/t', value: 45, type: 'Waste' },
  { range: '1-3 g/t', value: 30, type: 'Low' },
  { range: '3-5 g/t', value: 15, type: 'Medium' },
  { range: '>5 g/t', value: 10, type: 'High' },
];

const DRILL_HOLES = [
  { id: 'DH-2023-01', depth: 450, dip: -90, status: 'Assayed', layer: 'Oxide' },
  { id: 'DH-2023-02', depth: 520, dip: -85, status: 'Assayed', layer: 'Sulphide' },
  { id: 'DH-2023-03', depth: 380, dip: -90, status: 'Logging', layer: 'Transition' },
  { id: 'DH-2023-04', depth: 410, dip: -75, status: 'Pending', layer: 'Unknown' },
];

const VALIDATION_CHECKS = [
  { item: 'Data Density Check', result: 'Pass', val: '25m x 25m' },
  { item: 'Topography Clip', result: 'Pass', val: '0 Errors' },
  { item: 'Grade Capping', result: 'Warn', val: 'Top 2%' },
  { item: 'Variogram Fit', result: 'Pass', val: 'Spherical' },
];

const RESOURCE_TABLE = [
  { class: 'Measured', tons: '4.2 Mt', grade: '4.5 g/t', metal: '18.9 t' },
  { class: 'Indicated', tons: '8.5 Mt', grade: '3.2 g/t', metal: '27.2 t' },
  { class: 'Inferred', tons: '12.0 Mt', grade: '2.1 g/t', metal: '25.2 t' },
];

export const MineGeoDeliveryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('MODEL');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#0a0805] text-amber-50 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-amber-950/20 via-[#0a0805] to-black pointer-events-none"></div>
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{backgroundImage: 'repeating-linear-gradient(45deg, #451a03 0, #451a03 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px'}}>
      </div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-amber-900/40 bg-gradient-to-r from-amber-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-widest">
             <Cuboid size={14} className="animate-pulse" /> Digital Resource Estimation
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             地质建模与资源储量 <span className="text-amber-500 text-shadow-glow">模型交付驾驶舱</span>
          </h1>
        </div>
        
        {/* Actions */}
        <div className="flex gap-6 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Model Date</span>
                 <span className="font-mono text-white font-bold text-lg">2023-OCT-15</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Confidence</span>
                 <span className="font-mono text-green-400 font-bold text-lg">High (JORC)</span>
             </div>
             <button className="ml-4 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold rounded shadow-lg shadow-amber-900/50 transition-all flex items-center gap-2 border border-amber-500/50">
                 <Share2 size={14} /> 提交审核
             </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: Drill Hole Database */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="钻孔数据库 (Drill DB)" subtitle="SOURCE" className="flex-1 border-amber-900/50 bg-[#0c0a08]/90 pointer-events-auto">
                  <div className="flex flex-col gap-3 h-full">
                      <div className="relative mb-2">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                          <input type="text" placeholder="Search Hole ID..." className="w-full bg-slate-900/50 border border-slate-700 rounded-sm py-1.5 pl-9 pr-4 text-xs text-slate-200 outline-none focus:border-amber-600"/>
                      </div>

                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                          {DRILL_HOLES.map((hole, i) => (
                              <div key={i} className="flex justify-between items-center p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-amber-600/50 transition-colors cursor-pointer group">
                                  <div>
                                      <div className="text-xs font-bold text-slate-200 group-hover:text-white">{hole.id}</div>
                                      <div className="text-[10px] text-slate-500">{hole.layer}</div>
                                  </div>
                                  <div className="text-right">
                                      <div className="text-xs font-mono text-amber-400">{hole.depth}m</div>
                                      <span className={`text-[9px] px-1.5 rounded ${hole.status === 'Assayed' ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                                          {hole.status}
                                      </span>
                                  </div>
                              </div>
                          ))}
                      </div>

                      <div className="mt-auto pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                          <span>Total Meters: 12,450m</span>
                          <Database size={14} />
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="品位分布统计" subtitle="HISTOGRAM" className="h-[240px] border-amber-900/50 bg-[#0c0a08]/90 pointer-events-auto">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={GRADE_DISTRIBUTION}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#331c09" vertical={false} />
                              <XAxis dataKey="range" stroke="#78716c" tick={{fontSize: 10}} />
                              <Tooltip cursor={{fill: '#1e1b15'}} contentStyle={{backgroundColor: '#050505', borderColor: '#d97706'}} />
                              <Bar dataKey="value" name="Block Count %">
                                {GRADE_DISTRIBUTION.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.type === 'High' ? '#f59e0b' : entry.type === 'Medium' ? '#a855f7' : '#475569'} />
                                ))}
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Geological Model */}
          <div className="flex-1 relative flex flex-col gap-4">
              <div className="flex-1 bg-[#050302] border border-amber-800/40 relative rounded-lg overflow-hidden shadow-2xl">
                  {/* Scene */}
                  <div className="absolute inset-0">
                      <GeoThreeScene />
                  </div>

                  {/* HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4 pointer-events-none">
                      <div className="bg-black/60 backdrop-blur border border-amber-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Layers size={16} className="text-amber-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Block Model</div>
                              <div className="text-sm font-bold text-white">16x16x16 Voxels</div>
                          </div>
                      </div>
                      <div className="bg-black/60 backdrop-blur border border-amber-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <MapIcon size={16} className="text-purple-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Kriging Variance</div>
                              <div className="text-sm font-bold text-white">0.12 (Low)</div>
                          </div>
                      </div>
                  </div>

                  {/* Filter Overlay */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/70 px-4 py-2 rounded-full border border-slate-700 flex gap-4 text-xs text-slate-300">
                      <label className="flex items-center gap-2 cursor-pointer hover:text-white"><input type="checkbox" defaultChecked className="accent-amber-500"/> Ore Body</label>
                      <label className="flex items-center gap-2 cursor-pointer hover:text-white"><input type="checkbox" defaultChecked className="accent-cyan-500"/> Boreholes</label>
                      <label className="flex items-center gap-2 cursor-pointer hover:text-white"><input type="checkbox" className="accent-purple-500"/> Fault Lines</label>
                  </div>
              </div>
              
              {/* Bottom: Resource Table */}
              <div className="h-32 bg-[#0c0a08]/90 border border-amber-900/30 rounded p-4 flex gap-8 items-center">
                  <div className="w-40 text-right border-r border-slate-800 pr-6">
                      <div className="text-xs text-slate-500 uppercase font-bold mb-1">Total Resource</div>
                      <div className="text-3xl font-mono font-bold text-white">24.7 <span className="text-sm text-slate-500 font-normal">Mt</span></div>
                      <div className="text-[10px] text-amber-500">Au Eq.</div>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-3 gap-4">
                      {RESOURCE_TABLE.map((row, i) => (
                          <div key={i} className="flex flex-col gap-1">
                              <div className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-1 mb-1">{row.class}</div>
                              <div className="flex justify-between text-[10px] text-slate-500">
                                  <span>Tons</span> <span className="text-white font-mono">{row.tons}</span>
                              </div>
                              <div className="flex justify-between text-[10px] text-slate-500">
                                  <span>Grade</span> <span className="text-amber-400 font-mono">{row.grade}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* RIGHT: Validation & Handover */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="模型合规性验证" subtitle="QA/QC" className="border-amber-900/50 bg-[#0c0a08]/90 pointer-events-auto">
                  <div className="space-y-3 p-1">
                      {VALIDATION_CHECKS.map((check, i) => (
                          <div key={i} className="flex justify-between items-center p-2.5 bg-slate-900/50 border border-slate-800 rounded">
                              <div className="flex items-center gap-2">
                                  {check.result === 'Pass' ? <CheckCircle2 size={14} className="text-green-500"/> : <AlertOctagon size={14} className="text-yellow-500"/>}
                                  <span className="text-xs text-slate-300">{check.item}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">{check.val}</span>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              <SciFiCard title="交付文件包 (Package)" subtitle="DOWNLOAD" className="flex-1 border-amber-900/50 bg-[#0c0a08]/90 pointer-events-auto">
                  <div className="flex flex-col gap-3 h-full">
                      <div className="p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-amber-500/30 group cursor-pointer transition-colors">
                          <div className="flex items-center gap-3">
                              <FileCode size={18} className="text-purple-400"/>
                              <div className="flex-1">
                                  <div className="text-xs font-bold text-white">Block Model (CSV)</div>
                                  <div className="text-[10px] text-slate-500">Full dataset with grade/density</div>
                              </div>
                              <Download size={14} className="text-slate-600 group-hover:text-amber-500"/>
                          </div>
                      </div>
                      
                      <div className="p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-amber-500/30 group cursor-pointer transition-colors">
                          <div className="flex items-center gap-3">
                              <Box size={18} className="text-blue-400"/>
                              <div className="flex-1">
                                  <div className="text-xs font-bold text-white">Wireframes (DXF)</div>
                                  <div className="text-[10px] text-slate-500">Lithology & Fault surfaces</div>
                              </div>
                              <Download size={14} className="text-slate-600 group-hover:text-amber-500"/>
                          </div>
                      </div>

                      <div className="p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-amber-500/30 group cursor-pointer transition-colors">
                          <div className="flex items-center gap-3">
                              <FileText size={18} className="text-green-400"/>
                              <div className="flex-1">
                                  <div className="text-xs font-bold text-white">Resource Report (PDF)</div>
                                  <div className="text-[10px] text-slate-500">JORC Compliant Statement</div>
                              </div>
                              <Download size={14} className="text-slate-600 group-hover:text-amber-500"/>
                          </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-800 text-center">
                          <div className="text-[10px] text-slate-500 mb-2">Cryptographic Hash</div>
                          <code className="text-[9px] text-amber-500/70 bg-black/40 px-2 py-1 rounded block truncate">
                              SHA256: 8a9f...4b2c
                          </code>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
