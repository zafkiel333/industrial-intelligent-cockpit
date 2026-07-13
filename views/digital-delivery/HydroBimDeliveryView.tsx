
import React, { useState } from 'react';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[dd-hydro-bim]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/dd-hydro-bim';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Box, FileText, CheckCircle, AlertTriangle, 
  Layers, Database, Search, Maximize, 
  Eye, FileCode, Hammer, Ruler
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// --- MOCK DATA ---
const MODEL_TREE = [
  { id: 'SITE', label: 'Site (枢纽区)', type: 'Site', children: [
      { id: 'DAM', label: 'Dam (大坝)', type: 'Building', children: [
          { id: 'BLK-01', label: 'Block #1 (左岸)', type: 'Block' },
          { id: 'BLK-05', label: 'Block #5 (溢流)', type: 'Block', active: true },
          { id: 'BLK-09', label: 'Block #9 (右岸)', type: 'Block' }
      ]},
      { id: 'PH', label: 'Powerhouse (厂房)', type: 'Building' }
  ]}
];

const ATTRIBUTES = [
  { key: 'IFC Class', val: 'IfcDamSegment' },
  { key: 'Material', val: 'C35 W8 F100' },
  { key: 'Volume', val: '12,450 m³' },
  { key: 'Tag ID', val: 'CV-DAM-05-01' },
  { key: 'Stage', val: 'As-Built' },
];

const COMPLIANCE_STATS = [
  { name: 'Naming', val: 98, status: 'Pass' },
  { name: 'Parameters', val: 100, status: 'Pass' },
  { name: 'Classification', val: 92, status: 'Pass' },
  { name: 'Topology', val: 85, status: 'Warn' },
];

const DRAWINGS = [
  { id: 'DWG-01', name: '大坝横剖面图', type: 'Section' },
  { id: 'DWG-02', name: '溢流表孔配筋图', type: 'Detail' },
  { id: 'DWG-03', name: '廊道系统布置图', type: 'Plan' },
];

export const HydroBimDeliveryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('props');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#0f172a] text-slate-200 relative overflow-hidden">
      
      {/* Blueprint Grid Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-slate-700 bg-slate-900/90 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-widest">
             <Database size={14} /> Model Delivery Standard (MDS)
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
             水工建筑物 <span className="text-cyan-500 font-light">BIM模型交付</span>
          </h1>
        </div>
        <div className="flex gap-6 items-center">
             <div className="bg-slate-800 px-3 py-1 rounded border border-slate-600 flex items-center gap-2">
                 <Box size={14} className="text-blue-400"/>
                 <div className="flex flex-col items-end leading-none">
                     <span className="text-[10px] text-slate-400">Model Size</span>
                     <span className="font-mono font-bold text-sm">4.2 GB</span>
                 </div>
             </div>
             <div className="bg-slate-800 px-3 py-1 rounded border border-slate-600 flex items-center gap-2">
                 <Layers size={14} className="text-purple-400"/>
                 <div className="flex flex-col items-end leading-none">
                     <span className="text-[10px] text-slate-400">LOD Level</span>
                     <span className="font-mono font-bold text-sm">LOD 500</span>
                 </div>
             </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="flex-1 relative flex gap-4 p-4 overflow-hidden">
          
          {/* LEFT: Structure Tree */}
          <div className="w-72 flex flex-col gap-4 z-10 pointer-events-none">
              <SciFiCard title="模型结构树 (IFC Tree)" className="h-full border-slate-700 bg-slate-900/80 pointer-events-auto">
                  <div className="p-2 space-y-2">
                      {MODEL_TREE.map(node => (
                          <div key={node.id}>
                              <div className="flex items-center gap-2 text-xs text-slate-300 font-bold mb-1">
                                  <ChevronDownIcon /> {node.label}
                              </div>
                              <div className="pl-4 border-l border-slate-700 space-y-1">
                                  {node.children?.map(child => (
                                      <div key={child.id}>
                                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                              <ChevronDownIcon /> {child.label}
                                          </div>
                                          <div className="pl-4 border-l border-slate-700 space-y-1">
                                              {child.children?.map(leaf => (
                                                  <div 
                                                    key={leaf.id}
                                                    className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors text-xs
                                                        ${leaf.active ? 'bg-cyan-900/40 text-cyan-300 border border-cyan-500/30' : 'hover:bg-slate-800 text-slate-500'}
                                                    `}
                                                  >
                                                      <Box size={10} /> {leaf.label}
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>
          </div>

          {/* CENTER: 3D Viewport */}
          <div className="flex-1 relative border border-slate-700 rounded-lg overflow-hidden bg-[#020408]">
              <div className="absolute inset-0">
                  <ThreeScene type="dd-hydro-bim-delivery" color="#22d3ee" />
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>
              
              {/* Toolbar */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button className="p-2 bg-slate-800/80 hover:bg-cyan-600 text-slate-300 hover:text-white rounded border border-slate-600 transition-colors" title="Explode">
                      <Maximize size={16} />
                  </button>
                  <button className="p-2 bg-slate-800/80 hover:bg-cyan-600 text-slate-300 hover:text-white rounded border border-slate-600 transition-colors" title="X-Ray">
                      <Eye size={16} />
                  </button>
                  <button className="p-2 bg-slate-800/80 hover:bg-cyan-600 text-slate-300 hover:text-white rounded border border-slate-600 transition-colors" title="Section">
                      <Ruler size={16} />
                  </button>
              </div>

              {/* Bottom: Drawings Strip */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-700 rounded p-2 flex gap-4 overflow-x-auto">
                  {DRAWINGS.map(dwg => (
                      <div key={dwg.id} className="flex-shrink-0 w-32 bg-slate-800 p-2 rounded border border-slate-600 hover:border-cyan-500 cursor-pointer group">
                          <div className="aspect-video bg-blue-900/20 mb-1 rounded flex items-center justify-center">
                              <FileText size={16} className="text-slate-500 group-hover:text-cyan-400"/>
                          </div>
                          <div className="text-[10px] text-slate-300 truncate font-bold">{dwg.name}</div>
                          <div className="text-[9px] text-slate-500">{dwg.type}</div>
                      </div>
                  ))}
              </div>
          </div>

          {/* RIGHT: Attributes & Checks */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="构件信息面板" className="h-full border-slate-700 bg-slate-900/80 pointer-events-auto flex flex-col">
                  {/* Tabs */}
                  <div className="flex border-b border-slate-700 mb-4">
                      <button 
                        onClick={() => setActiveTab('props')}
                        className={`flex-1 py-2 text-xs font-bold ${activeTab === 'props' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
                      >
                          属性参数
                      </button>
                      <button 
                        onClick={() => setActiveTab('check')}
                        className={`flex-1 py-2 text-xs font-bold ${activeTab === 'check' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
                      >
                          合规检查
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                      {activeTab === 'props' ? (
                          <div className="space-y-1">
                              <div className="text-xs font-bold text-slate-400 uppercase mb-2 bg-slate-800 px-2 py-1 rounded">Identity Data</div>
                              {ATTRIBUTES.map((attr, i) => (
                                  <div key={i} className="flex justify-between px-2 py-1.5 border-b border-slate-800 last:border-0 hover:bg-slate-800/50">
                                      <span className="text-xs text-slate-400">{attr.key}</span>
                                      <span className="text-xs font-mono text-cyan-100">{attr.val}</span>
                                  </div>
                              ))}
                              
                              <div className="text-xs font-bold text-slate-400 uppercase mt-4 mb-2 bg-slate-800 px-2 py-1 rounded">Material Sets</div>
                              <div className="px-2 py-1 text-xs text-slate-300">
                                  Layer 1: Concrete C35<br/>
                                  Layer 2: Rebar HRB400<br/>
                                  Finish: Epoxy Coating
                              </div>
                          </div>
                      ) : (
                          <div className="space-y-4">
                              <div className="h-40">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={COMPLIANCE_STATS} layout="vertical" margin={{left: 20}}>
                                          <XAxis type="number" hide domain={[0, 100]}/>
                                          <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                          <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#020617', borderColor: '#334155'}} />
                                          <Bar dataKey="val" barSize={12} radius={[0, 4, 4, 0]}>
                                              {COMPLIANCE_STATS.map((entry, index) => (
                                                  <Cell key={`cell-${index}`} fill={entry.status === 'Pass' ? '#10b981' : '#f59e0b'} />
                                              ))}
                                          </Bar>
                                      </BarChart>
                                  </ResponsiveContainer>
                              </div>
                              <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                                  <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 mb-1">
                                      <AlertTriangle size={12} /> Issue Found: Topology
                                  </div>
                                  <p className="text-[10px] text-slate-400">
                                      Element ID #4521 has unconnected vertices. Manifold check failed.
                                  </p>
                              </div>
                          </div>
                      )}
                  </div>
              </SciFiCard>

          </div>

      </div>

    </div>
  );
};

// Simple Icon Component
const ChevronDownIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);
