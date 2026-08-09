
import React, { useState } from 'react';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[dd-mine-equip-lifecycle]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/dd-mine-equip-lifecycle';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  GitCommit, Activity, Truck, Settings, 
  FileText, Database, Layers, RefreshCw, 
  Archive, AlertTriangle, FileCode, CheckCircle2,
  HardDrive, History, Share2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell
} from 'recharts';

// --- MOCK DATA ---

const LIFECYCLE_STAGES = [
  { id: 'DESIGN', label: '设计定义 (Design)', icon: <Settings size={18} />, status: 'Completed' },
  { id: 'MANUFACTURE', label: '生产制造 (Build)', icon: <HammerIcon />, status: 'Completed' },
  { id: 'TRANSPORT', label: '物流运输 (Logistics)', icon: <Truck size={18} />, status: 'Completed' },
  { id: 'INSTALL', label: '现场装配 (Assembly)', icon: <WrenchIcon />, status: 'Active' },
  { id: 'OPERATION', label: '运行维护 (O&M)', icon: <Activity size={18} />, status: 'Pending' },
  { id: 'RECYCLE', label: '回收报废 (End-of-Life)', icon: <RefreshCw size={18} />, status: 'Future' },
];

const ASSET_INFO = {
  id: 'MT-930E-2024-001',
  model: 'Komatsu 930E-5',
  type: 'Ultra-Class Haul Truck',
  owner: 'Shenhua Group',
  commissionDate: '2023-11-15',
  value: '$ 5,200,000'
};

const DOC_LIST = [
  { name: 'General_Arrangement.pdf', type: 'Design', size: '15 MB', date: '2023-01-10' },
  { name: 'Engine_FAT_Report.pdf', type: 'Test', size: '8 MB', date: '2023-05-20' },
  { name: 'Chassis_Material_Cert.xml', type: 'Cert', size: '250 KB', date: '2023-06-15' },
  { name: 'Assembly_Manual_V2.pdf', type: 'Manual', size: '42 MB', date: '2023-09-01' },
  { name: 'Spare_Parts_BOM.csv', type: 'Data', size: '5 MB', date: '2023-09-05' },
];

const HEALTH_HISTORY = Array.from({length: 12}, (_, i) => ({
    month: `M${i+1}`,
    score: 95 + Math.random() * 5 - (i > 8 ? 2 : 0) // Slight degradation
}));

// Icons helper
function HammerIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15L22 10.64"/><path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25V7.86c0-.55-.45-1-1-1H14c-1.75 0-3.23.85-4.22 2.19l-3.3 4.45c-.21.28-.19.68.05.94l2.69 2.69c.26.26.66.27.95.06l4.44-3.3c1.35-1 2.2-2.48 2.2-4.23V6.35"/></svg>; }
function WrenchIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>; }

export const MineEquipLifecycleView: React.FC = () => {
  const [currentStage, setCurrentStage] = useState('INSTALL');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#0c0905] text-slate-200 relative overflow-hidden">
      
      {/* Background: Industrial Orange Haze */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-orange-900/20 via-[#0c0905] to-black pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-orange-900/30 bg-gradient-to-r from-orange-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-400 mb-1 uppercase tracking-widest">
             <Database size={14} className="animate-pulse" /> Digital Twin Archive
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             矿山设备 <span className="text-orange-500 text-shadow-glow">全生命周期档案交付</span>
          </h1>
        </div>
        
        {/* Top Actions */}
        <div className="flex gap-6 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Asset Value</span>
                 <span className="font-mono text-white font-bold text-lg">{ASSET_INFO.value}</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded border border-slate-600 transition-all flex items-center gap-2">
                 <History size={14} /> 变更记录
             </button>
             <button className="px-4 py-2 bg-orange-700 hover:bg-orange-600 text-white text-xs font-bold rounded shadow-lg shadow-orange-900/50 transition-all flex items-center gap-2 border border-orange-500/50">
                 <Share2 size={14} /> 交付确认
             </button>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: Lifecycle Timeline */}
          <div className="w-72 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="生命周期阶段 (Lifecycle)" subtitle="PROGRESS" className="flex-1 border-orange-900/50 bg-[#0c0805]/90 pointer-events-auto">
                  <div className="relative flex flex-col gap-6 p-2 h-full justify-center">
                      {/* DNA Line */}
                      <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-orange-500/20 via-orange-500 to-orange-500/20 -z-10"></div>
                      
                      {LIFECYCLE_STAGES.map((stage) => (
                          <div 
                            key={stage.id}
                            onClick={() => setCurrentStage(stage.id)}
                            className={`relative flex items-center gap-4 cursor-pointer group transition-all duration-300 ${currentStage === stage.id ? 'translate-x-2' : ''}`}
                          >
                              {/* Node */}
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-colors
                                  ${currentStage === stage.id 
                                    ? 'bg-orange-600 border-orange-400 text-white shadow-[0_0_15px_#f97316]' 
                                    : stage.status === 'Completed' 
                                      ? 'bg-slate-900 border-green-500 text-green-500'
                                      : 'bg-slate-900 border-slate-700 text-slate-500 group-hover:border-orange-700'}
                              `}>
                                  {stage.status === 'Completed' ? <CheckCircle2 size={18}/> : stage.icon}
                              </div>
                              
                              {/* Label */}
                              <div className={`p-3 rounded border w-full transition-colors
                                  ${currentStage === stage.id 
                                    ? 'bg-orange-900/30 border-orange-500 text-white' 
                                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-orange-900/50'}
                              `}>
                                  <div className="text-xs font-bold">{stage.label}</div>
                                  <div className="text-[9px] uppercase mt-1 opacity-70">{stage.status}</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Exploded View */}
          <div className="flex-1 relative flex flex-col gap-4">
              
              {/* 3D Scene */}
              <div className="flex-1 bg-[#050302] border border-orange-800/40 relative rounded-lg overflow-hidden shadow-2xl">
                  <div className="absolute inset-0">
                      <ThreeScene type="dd-mine-equip-lifecycle" color="#f97316" data={{ stage: currentStage }} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                  </div>

                  {/* Asset Info Overlay */}
                  <div className="absolute top-4 left-4 z-20 pointer-events-none">
                      <div className="bg-black/60 backdrop-blur border border-orange-500/30 p-4 rounded-lg">
                          <div className="text-xs text-orange-400 font-bold mb-1">{ASSET_INFO.id}</div>
                          <div className="text-2xl font-bold text-white mb-2">{ASSET_INFO.model}</div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[10px] text-slate-300">
                              <div>Type: <span className="text-white">{ASSET_INFO.type}</span></div>
                              <div>Owner: <span className="text-white">{ASSET_INFO.owner}</span></div>
                              <div>Status: <span className="text-green-400">{currentStage}</span></div>
                          </div>
                      </div>
                  </div>

                  {/* Stage Description Overlay */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/70 px-6 py-2 rounded-full border border-orange-900/50 text-xs text-orange-200">
                      Current View: <span className="font-bold text-white">{LIFECYCLE_STAGES.find(s => s.id === currentStage)?.label}</span>
                  </div>
              </div>

              {/* Bottom: Health History (Simulated) */}
              <div className="h-40 bg-[#0c0805]/90 border border-orange-900/30 rounded p-4 flex gap-6">
                  <div className="w-1/3 flex flex-col justify-center gap-2">
                      <div className="text-xs text-slate-400 uppercase font-bold">Asset Health Prediction</div>
                      <div className="text-3xl font-mono font-bold text-green-400">94.2%</div>
                      <div className="text-[10px] text-slate-500">Based on Digital Twin Simulation</div>
                  </div>
                  <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={HEALTH_HISTORY}>
                              <defs>
                                  <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#331c09" vertical={false} />
                              <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                              <Tooltip contentStyle={{backgroundColor: '#0c0805', borderColor: '#22c55e'}} />
                              <Area type="monotone" dataKey="score" stroke="#22c55e" fill="url(#colorHealth)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>

          </div>

          {/* RIGHT: Digital Archives */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="数字档案柜 (Data Vault)" subtitle="FILES" className="flex-1 border-orange-900/50 bg-[#0c0805]/90 pointer-events-auto">
                  <div className="flex flex-col h-full">
                      {/* Filter/Search */}
                      <div className="mb-3 relative">
                           <input type="text" placeholder="Filter documents..." className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none focus:border-orange-500" />
                      </div>

                      {/* File List */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                          {DOC_LIST.map((doc, i) => (
                              <div key={i} className="group p-2 rounded border border-slate-800 bg-slate-900/30 hover:bg-slate-800 transition-colors cursor-pointer">
                                  <div className="flex justify-between items-start mb-1">
                                      <div className="flex items-center gap-2">
                                          {doc.type === 'Design' ? <Settings size={12} className="text-blue-400"/> : 
                                           doc.type === 'Data' ? <FileCode size={12} className="text-green-400"/> :
                                           <FileText size={12} className="text-orange-400"/>}
                                          <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate w-32">{doc.name}</span>
                                      </div>
                                  </div>
                                  <div className="flex justify-between text-[9px] text-slate-500">
                                      <span>{doc.size}</span>
                                      <span>{doc.date}</span>
                                  </div>
                              </div>
                          ))}
                      </div>

                      {/* Warnings */}
                      <div className="mt-auto pt-3 border-t border-slate-800">
                          <div className="bg-red-900/20 border border-red-900/50 p-2 rounded flex items-start gap-2">
                              <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                              <div>
                                  <div className="text-[10px] font-bold text-red-300">Missing Certificate</div>
                                  <div className="text-[9px] text-red-200/60">Final commissioning report signature pending.</div>
                              </div>
                          </div>
                      </div>

                      <button className="mt-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors flex items-center justify-center gap-2">
                          <HardDrive size={12} /> Download Selected
                      </button>
                  </div>
              </SciFiCard>

          </div>

      </div>

    </div>
  );
};
