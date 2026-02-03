
import React, { useState } from 'react';
import { ThreeScene } from '../../components/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Database, Server, HardDrive, ClipboardList, 
  FileText, Archive, CheckCircle, BarChart4,
  RefreshCw, Layers, ShieldCheck, ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';

// --- MOCK DATA ---
const ASSET_TREE = [
  { 
    id: 'U1', label: '1# 机组 (Unit 1)', status: 'Delivered', children: [
       { id: 'TURB', label: '水轮机 (Turbine)', status: 'Delivered' },
       { id: 'GEN', label: '发电机 (Generator)', status: 'Delivered' },
       { id: 'GOV', label: '调速器 (Governor)', status: 'Processing' }
    ]
  },
  { 
    id: 'U2', label: '2# 机组 (Unit 2)', status: 'Pending', children: [
       { id: 'TURB2', label: '水轮机 (Turbine)', status: 'Pending' }
    ]
  },
  { 
    id: 'AUX', label: '公用系统 (BOP)', status: 'Partial', children: [] }
];

const LEDGER_DATA = {
  basic: [
    { label: 'KKS Code', value: '10MKA10AA001' },
    { label: 'Asset Name', value: 'Francis Turbine Unit 1' },
    { label: 'Manufacturer', value: 'Dongfang Electric' },
    { label: 'Install Date', value: '2023-05-15' },
    { label: 'Design Life', value: '40 Years' },
    { label: 'Original Value', value: '¥ 45,000,000' }
  ],
  om: [
    { label: 'Maint. Strategy', value: 'RCM (Reliability Centered)' },
    { label: 'Spare Parts BOM', value: 'Linked (145 items)' },
    { label: 'Initial Defects', value: 'Closed (3)' },
    { label: 'Warranty End', value: '2025-05-15' }
  ]
};

const MIGRATION_STATS = [
  { name: 'Asset Cards', value: 100, target: 100 },
  { name: 'O&M History', value: 85, target: 100 },
  { name: 'Spare Parts', value: 92, target: 100 },
  { name: 'SOP Docs', value: 78, target: 100 }
];

export const HydroAssetDeliveryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('INFO');
  const [selectedAssetId, setSelectedAssetId] = useState('U1');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#050505] text-amber-50 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-[#050505] to-black pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-amber-900/40 bg-gradient-to-r from-amber-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-widest">
             <Database size={14} className="animate-pulse" /> Asset Lifecycle Handover
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             水电站资产 <span className="text-amber-500 text-shadow-glow">与运维台账数字交付</span>
          </h1>
        </div>
        
        {/* Progress Indicators */}
        <div className="flex gap-6 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Ledger Sync</span>
                 <span className="font-mono text-white font-bold text-lg">94.2%</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Validated Records</span>
                 <span className="font-mono text-amber-400 font-bold text-lg">12,450</span>
             </div>
             <button className="ml-4 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold rounded shadow-lg shadow-amber-900/50 transition-all flex items-center gap-2 border border-amber-500/50">
                 <Archive size={14} /> 归档确认
             </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: Asset Tree */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="资产结构树 (KKS Tree)" subtitle="HIERARCHY" className="flex-1 border-amber-900/50 bg-[#080502]/90 pointer-events-auto">
                  <div className="flex flex-col gap-1 h-full overflow-y-auto custom-scrollbar pr-1">
                      {ASSET_TREE.map((node) => (
                          <div key={node.id} className="mb-2">
                              <div 
                                onClick={() => setSelectedAssetId(node.id)}
                                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors border
                                   ${selectedAssetId === node.id || node.children.some(c=>c.id===selectedAssetId) 
                                      ? 'bg-amber-900/30 border-amber-500 text-white' 
                                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-amber-700'}
                                `}
                              >
                                  <div className="flex items-center gap-2">
                                      <Server size={14} className={selectedAssetId === node.id ? "text-amber-400" : "text-slate-500"}/>
                                      <span className="text-sm font-bold">{node.label}</span>
                                  </div>
                                  <span className={`text-[9px] px-1.5 rounded ${node.status === 'Delivered' ? 'bg-green-900/40 text-green-400' : 'bg-slate-800'}`}>
                                      {node.status}
                                  </span>
                              </div>
                              
                              {/* Children */}
                              <div className="pl-4 mt-1 space-y-1 border-l border-slate-800 ml-2">
                                  {node.children.map(child => (
                                      <div 
                                        key={child.id} 
                                        onClick={() => setSelectedAssetId(child.id)}
                                        className={`flex justify-between items-center text-xs p-1.5 rounded cursor-pointer
                                           ${selectedAssetId === child.id ? 'bg-amber-900/20 text-amber-200' : 'hover:bg-slate-800 text-slate-400'}
                                        `}
                                      >
                                          <span>{child.label}</span>
                                          {child.status === 'Processing' && <RefreshCw size={10} className="animate-spin text-amber-500"/>}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* Completeness Chart */}
              <SciFiCard title="数据完整性检查" subtitle="QC STATS" className="h-[200px] border-amber-900/50 bg-[#080502]/90 pointer-events-auto">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={MIGRATION_STATS} layout="vertical" margin={{left: 0}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#331c09" horizontal={false} />
                              <XAxis type="number" hide domain={[0, 100]} />
                              <YAxis dataKey="name" type="category" width={70} tick={{fontSize: 10, fill: '#94a3b8'}} />
                              <Tooltip cursor={{fill: '#1e1b15'}} contentStyle={{backgroundColor: '#050505', borderColor: '#d97706'}} />
                              <Bar dataKey="value" barSize={10} radius={[0, 4, 4, 0]}>
                                  {MIGRATION_STATS.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.value === 100 ? '#10b981' : '#f59e0b'} />
                                  ))}
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Visualization */}
          <div className="flex-1 flex flex-col gap-4 relative">
              
              {/* 3D Scene Container */}
              <div className="flex-1 bg-[#030201] border border-amber-800/40 relative rounded-lg overflow-hidden shadow-2xl">
                  <div className="absolute inset-0">
                      <ThreeScene type="dd-hydro-asset-delivery" color="#f59e0b" />
                  </div>

                  {/* Holographic Labels */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                      <div className="bg-black/60 backdrop-blur border border-amber-500/30 px-4 py-2 rounded flex items-center gap-3">
                          <Layers size={16} className="text-amber-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Asset Twin</div>
                              <div className="text-sm font-bold text-white">Francis Turbine V4</div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Data Migration Stream (Visual) */}
              <div className="h-16 bg-[#080502]/90 border border-amber-900/30 rounded flex items-center px-4 relative overflow-hidden">
                  <div className="text-xs font-bold text-slate-400 mr-4 z-10 flex items-center gap-2">
                      <HardDrive size={14}/> DATA MIGRATION:
                  </div>
                  {/* Streaming bits animation */}
                  <div className="flex-1 flex gap-2 overflow-hidden relative h-full items-center">
                      {Array.from({length: 20}).map((_, i) => (
                          <div 
                            key={i} 
                            className="w-8 h-1 bg-amber-500/50 rounded animate-[slideRight_2s_linear_infinite]"
                            style={{ animationDelay: `${i * 0.1}s`, opacity: Math.random() }}
                          ></div>
                      ))}
                  </div>
                  <div className="z-10 bg-black/40 px-2 py-1 rounded text-xs text-green-400 font-mono">
                      Writing to O&M DB...
                  </div>
              </div>

          </div>

          {/* RIGHT: Ledger Card */}
          <div className="w-96 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="资产台账详情 (Ledger)" subtitle="ID CARD" className="flex-1 border-amber-900/50 bg-[#080502]/90 pointer-events-auto">
                  <div className="flex flex-col h-full">
                      {/* Tabs */}
                      <div className="flex border-b border-slate-800 mb-4">
                          <button 
                            onClick={() => setActiveTab('INFO')}
                            className={`flex-1 py-2 text-xs font-bold ${activeTab === 'INFO' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-500'}`}
                          >
                              基础信息
                          </button>
                          <button 
                            onClick={() => setActiveTab('OM')}
                            className={`flex-1 py-2 text-xs font-bold ${activeTab === 'OM' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-500'}`}
                          >
                              运维配置
                          </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                          {activeTab === 'INFO' ? (
                              <div className="space-y-1">
                                  {LEDGER_DATA.basic.map((item, i) => (
                                      <div key={i} className="flex justify-between p-2 hover:bg-slate-800/50 rounded border-b border-slate-800/50 last:border-0">
                                          <span className="text-xs text-slate-400">{item.label}</span>
                                          <span className="text-xs font-mono font-bold text-white">{item.value}</span>
                                      </div>
                                  ))}
                              </div>
                          ) : (
                              <div className="space-y-2">
                                  {LEDGER_DATA.om.map((item, i) => (
                                      <div key={i} className="flex justify-between items-center p-2 bg-slate-900/50 border border-slate-800 rounded">
                                          <span className="text-xs text-slate-400">{item.label}</span>
                                          <span className="text-xs text-amber-200 font-bold">{item.value}</span>
                                      </div>
                                  ))}
                                  
                                  <div className="mt-4 p-3 bg-amber-900/10 border border-amber-800/30 rounded text-xs text-amber-200/80">
                                      <div className="flex items-center gap-2 mb-1 font-bold">
                                          <ShieldCheck size={12}/> Warranties Active
                                      </div>
                                      Asset is currently under manufacturer warranty. Maintenance requires authorized personnel.
                                  </div>
                              </div>
                          )}
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-auto pt-4 border-t border-slate-800 grid grid-cols-2 gap-2">
                          <button className="py-2 border border-slate-700 hover:border-amber-600 text-slate-300 hover:text-white rounded text-xs flex items-center justify-center gap-2 transition-colors">
                              <FileText size={12} /> 查看原件
                          </button>
                          <button className="py-2 border border-slate-700 hover:border-amber-600 text-slate-300 hover:text-white rounded text-xs flex items-center justify-center gap-2 transition-colors">
                              <ClipboardList size={12} /> 关联备件
                          </button>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>

    </div>
  );
};
