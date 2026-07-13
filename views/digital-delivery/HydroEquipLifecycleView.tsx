
import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[dd-hydro-equip-lifecycle]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/dd-hydro-equip-lifecycle';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Database, GitCommit, Settings, Activity, 
  Wrench, Archive, FileText, CheckCircle2, 
  HardDrive, ChevronRight, AlertTriangle, Layers
} from 'lucide-react';

// --- MOCK DATA ---

const LIFECYCLE_STAGES = [
  { id: 'DESIGN', label: '设计期 (Design)', desc: '参数定义与模型构建', icon: <Settings size={18} /> },
  { id: 'MANUFACTURE', label: '制造期 (Manufacturing)', desc: '生产质检与出厂验收', icon: <Layers size={18} /> },
  { id: 'INSTALL', label: '安装调试 (Install)', desc: '现场装配与系统联调', icon: <Wrench size={18} /> },
  { id: 'OPERATION', label: '运维期 (O&M)', desc: '实时监测与状态检修', icon: <Activity size={18} /> },
  { id: 'MAINTENANCE', label: '大修/技改 (Overhaul)', desc: '部件更换与性能升级', icon: <GitCommit size={18} /> },
];

const STAGE_DATA: Record<string, any> = {
  'DESIGN': {
    docs: [
      { name: 'General Assembly.dwg', size: '12 MB', date: '2020-01-15' },
      { name: 'Hydraulic Calculations.pdf', size: '4 MB', date: '2020-02-10' },
      { name: 'Material Specs v2.0', size: '2 MB', date: '2020-03-01' },
    ],
    stats: { completion: '100%', version: 'V4.2', review: 'Approved' }
  },
  'MANUFACTURE': {
    docs: [
      { name: 'Material Cert (Runner).pdf', size: '1.5 MB', date: '2021-06-20' },
      { name: 'FAT Report (Generator).pdf', size: '8 MB', date: '2021-08-15' },
      { name: 'NDT Inspection Log', size: '3 MB', date: '2021-07-05' },
    ],
    stats: { quality: '99.8%', defects: '0 Major', progress: 'Shipped' }
  },
  'INSTALL': {
    docs: [
      { name: 'Site Install Manual.pdf', size: '25 MB', date: '2022-01-10' },
      { name: 'Alignment Records.xlsx', size: '0.5 MB', date: '2022-03-12' },
      { name: 'SAT Report 72h.pdf', size: '5 MB', date: '2022-05-30' },
    ],
    stats: { safety: '0 Incident', deviation: '<0.05mm', status: 'Commissioned' }
  },
  'OPERATION': {
    docs: [
      { name: 'Real-time Telemetry Stream', size: 'Live', date: 'Now' },
      { name: 'Monthly Ops Report', size: '1.2 MB', date: '2023-10-01' },
      { name: 'Efficiency Analysis', size: '3 MB', date: '2023-10-15' },
    ],
    stats: { runtime: '12,450 h', availability: '99.5%', health: 'Good' }
  },
  'MAINTENANCE': {
    docs: [
      { name: 'Fault Diagnosis Log', size: '0.8 MB', date: '2023-11-05' },
      { name: 'Spare Parts Request', size: '0.2 MB', date: '2023-11-06' },
      { name: 'Repair Procedure B-04', size: '2 MB', date: '2023-11-08' },
    ],
    stats: { active_tickets: '2', next_major: '2025', cost: '$45k' }
  }
};

export const HydroEquipLifecycleView: React.FC = () => {
  const [activeStage, setActiveStage] = useState('OPERATION');
  const currentData = STAGE_DATA[activeStage];

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#020605] text-slate-200 relative overflow-hidden">
      
      {/* 3D BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
         <ThreeScene type="dd-hydro-equip-lifecycle" color="#14b8a6" data={{ stage: activeStage }} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
         {/* Subtle Vignette */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#020605_100%)] pointer-events-none"></div>
      </div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-teal-900/30 bg-gradient-to-r from-teal-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-400 mb-1 uppercase tracking-widest">
             <Database size={14} className="animate-pulse" /> Digital Asset Management
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             机组设备 <span className="text-teal-500 text-shadow-glow">全生命周期数据交付</span>
          </h1>
        </div>
        <div className="flex gap-4 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Asset ID</span>
                 <span className="font-mono text-white font-bold">U1-GEN-2023</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Data Maturity</span>
                 <span className="font-mono text-teal-400 font-bold">L5 (Optimized)</span>
             </div>
        </div>
      </div>

      {/* CONTENT OVERLAYS */}
      <div className="relative flex-1 flex justify-between p-6 pointer-events-none">
          
          {/* LEFT: Timeline Selector */}
          <div className="w-80 flex flex-col gap-4 pointer-events-auto h-full justify-center">
              <div className="bg-[#051010]/80 backdrop-blur-md border border-teal-800/50 rounded-lg p-4 shadow-xl">
                  <h3 className="text-sm font-bold text-teal-100 mb-4 border-b border-teal-900/50 pb-2 flex items-center gap-2">
                      <Activity size={16}/> Lifecycle Stages
                  </h3>
                  <div className="relative space-y-0">
                      {/* Vertical Line */}
                      <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800 -z-10"></div>
                      
                      {LIFECYCLE_STAGES.map((stage) => (
                          <div 
                            key={stage.id}
                            onClick={() => setActiveStage(stage.id)}
                            className={`group relative flex items-center gap-4 p-3 rounded-md cursor-pointer transition-all duration-300
                                ${activeStage === stage.id 
                                    ? 'bg-teal-900/40 border border-teal-500/50 translate-x-2' 
                                    : 'hover:bg-slate-800/50 border border-transparent'}
                            `}
                          >
                              {/* Node Circle */}
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-colors
                                  ${activeStage === stage.id ? 'bg-teal-600 border-teal-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500 group-hover:border-teal-700'}
                              `}>
                                  {stage.icon}
                              </div>
                              
                              <div className="flex-1">
                                  <div className={`text-sm font-bold ${activeStage === stage.id ? 'text-white' : 'text-slate-400'}`}>
                                      {stage.label}
                                  </div>
                                  <div className="text-[10px] text-slate-500">{stage.desc}</div>
                              </div>
                              
                              {activeStage === stage.id && <ChevronRight size={16} className="text-teal-400" />}
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* RIGHT: Data Locker */}
          <div className="w-96 flex flex-col gap-4 pointer-events-auto h-full justify-center">
              
              {/* Dynamic Stats Panel */}
              <SciFiCard title="阶段关键指标 (Key Metrics)" className="border-teal-900/50 bg-[#051010]/80 backdrop-blur-md">
                  <div className="grid grid-cols-3 gap-2 text-center">
                      {Object.entries(currentData.stats).map(([key, val], i) => (
                          <div key={i} className="bg-slate-900/50 p-2 rounded border border-slate-800">
                              <div className="text-[10px] text-slate-400 uppercase mb-1">{key}</div>
                              <div className="text-sm font-bold text-white font-mono">{val as string}</div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* Document List */}
              <SciFiCard title="交付数据包 (Data Artifacts)" subtitle={activeStage} className="flex-1 border-teal-900/50 bg-[#051010]/80 backdrop-blur-md">
                  <div className="flex flex-col gap-3 h-full">
                      {currentData.docs.map((doc: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded hover:border-teal-500/50 transition-colors group cursor-pointer">
                              <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="p-2 bg-slate-800 rounded text-slate-400 group-hover:text-teal-400 transition-colors">
                                      <FileText size={16} />
                                  </div>
                                  <div className="min-w-0">
                                      <div className="text-sm font-bold text-slate-200 truncate group-hover:text-white">{doc.name}</div>
                                      <div className="text-[10px] text-slate-500 flex gap-2">
                                          <span>{doc.size}</span>
                                          <span>• {doc.date}</span>
                                      </div>
                                  </div>
                              </div>
                              <CheckCircle2 size={16} className="text-green-500/50 group-hover:text-green-400" />
                          </div>
                      ))}
                      
                      <div className="mt-auto pt-4 border-t border-slate-800">
                          <button className="w-full py-2.5 bg-teal-700/20 hover:bg-teal-700/40 text-teal-300 text-xs font-bold rounded border border-teal-500/30 transition-all flex items-center justify-center gap-2">
                              <HardDrive size={14} /> Download Package ({activeStage})
                          </button>
                      </div>
                  </div>
              </SciFiCard>
              
              {/* Alert / Warning Context */}
              {activeStage === 'MAINTENANCE' && (
                  <div className="bg-red-900/20 border border-red-500/30 p-3 rounded flex items-start gap-3 animate-in slide-in-from-right-4 fade-in">
                      <AlertTriangle className="text-red-500 shrink-0" size={20} />
                      <div>
                          <div className="text-xs font-bold text-red-200">Active Maintenance Ticket</div>
                          <div className="text-[10px] text-red-300/70 mt-1">
                              Rotor pole #12 vibration anomaly detected. Inspection required.
                          </div>
                      </div>
                  </div>
              )}

          </div>

      </div>

      {/* BOTTOM: Data DNA Strip */}
      <div className="h-12 bg-[#051010]/90 border-t border-teal-900/30 z-20 flex items-center justify-center relative pointer-events-none">
          <div className="flex gap-1 h-4 items-end">
              {Array.from({length: 60}).map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-teal-500/30 rounded-t-sm transition-all duration-500"
                    style={{
                        height: `${Math.random() * 100}%`,
                        opacity: activeStage === 'OPERATION' ? 0.8 : 0.3,
                        backgroundColor: i % 10 === 0 ? '#14b8a6' : '#0f766e'
                    }}
                  ></div>
              ))}
          </div>
          <div className="absolute right-4 text-[10px] text-teal-700 font-mono">DATA_INTEGRITY_CHECK: PASS</div>
      </div>

    </div>
  );
};
