
import React, { useState } from 'react';
import { GeoThreeScene } from '../../components/scene-digital-delivery/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[dd-nav-dispatch]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/dd-nav-dispatch';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Radio, Map as MapIcon, Activity, Navigation, 
  CheckCircle2, AlertTriangle, RefreshCw, Layers, 
  Database, ShieldCheck, Share2, Signal, Video, Server
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// --- MOCK DATA ---

const SYSTEM_NODES = [
  { id: 'VTS-CORE', label: 'VTS 指挥中心 (Core)', status: 'Online', verified: true },
  { id: 'RADAR-01', label: '1# 雷达站 (Radar)', status: 'Calibrated', verified: true },
  { id: 'AIS-BASE', label: 'AIS 基站集群', status: 'Online', verified: true },
  { id: 'CCTV-NET', label: 'CCTV 监控网', status: 'Syncing', verified: false },
  { id: 'VHF-COM', label: 'VHF 通信系统', status: 'Online', verified: true },
];

const ACCEPTANCE_TESTS = [
  { id: 'T-01', name: '雷达目标跟踪精度', result: 'Pass', val: '< 5m' },
  { id: 'T-02', name: 'AIS数据融合延迟', result: 'Pass', val: '1.2s' },
  { id: 'T-03', name: 'CCTV联动响应', result: 'Warn', val: '3.5s' },
  { id: 'T-04', name: 'VHF语音清晰度', result: 'Pass', val: '4.8/5' },
  { id: 'T-05', name: '电子海图(ENC)更新', result: 'Pass', val: 'Latest' },
];

const DATA_STATS = [
  { name: 'Vessel Tracks', count: 12500, color: '#00ff9d' },
  { name: 'Voice Logs', count: 450, color: '#0ea5e9' },
  { name: 'Alert Events', count: 85, color: '#f59e0b' },
  { name: 'User Profiles', count: 42, color: '#6366f1' },
];

export const NavDispatchDeliveryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('VTS-CORE');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#020804] text-slate-200 relative overflow-hidden">
      
      {/* Background Radar Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-[#020804] to-black pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,157,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,157,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-green-900/30 bg-gradient-to-r from-green-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-green-400 mb-1 uppercase tracking-widest">
             <Radio size={14} className="animate-pulse" /> Command & Control Handover
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             通航调度与指挥系统 <span className="text-green-500 text-shadow-glow">交付验证中心</span>
          </h1>
        </div>
        
        {/* Status */}
        <div className="flex gap-6 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">System Uptime</span>
                 <span className="font-mono text-white font-bold text-lg">99.9%</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Signal Coverage</span>
                 <span className="font-mono text-green-400 font-bold text-lg">100%</span>
             </div>
             <button className="ml-4 px-6 py-2 bg-green-700 hover:bg-green-600 text-white text-xs font-bold rounded shadow-lg shadow-green-900/40 transition-all flex items-center gap-2 border border-green-500/50">
                 <Share2 size={14} /> 确认系统移交
             </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: System Topology */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="硬件设施拓扑 (Hardware)" subtitle="STATUS" className="flex-1 border-green-900/50 bg-[#040f08]/90 pointer-events-auto">
                  <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {SYSTEM_NODES.map((node, i) => (
                          <div 
                            key={i} 
                            onClick={() => setActiveTab(node.id)}
                            className={`p-3 rounded border cursor-pointer transition-all hover:translate-x-1 group
                                ${activeTab === node.id 
                                    ? 'bg-green-900/30 border-green-500 text-white' 
                                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-green-600/50'}
                            `}
                          >
                              <div className="flex justify-between items-start mb-1">
                                  <div className="flex items-center gap-2">
                                      {node.id.includes('RADAR') ? <Activity size={14} className="text-green-400"/> : 
                                       node.id.includes('CCTV') ? <Video size={14} className="text-blue-400"/> :
                                       <Server size={14} className="text-slate-400"/>}
                                      <span className="text-sm font-bold">{node.label}</span>
                                  </div>
                                  {node.verified && <CheckCircle2 size={12} className="text-green-500"/>}
                              </div>
                              <div className="flex justify-between items-center text-[10px]">
                                  <span className="font-mono opacity-70">{node.id}</span>
                                  <span className={`px-1.5 rounded ${node.status === 'Online' ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'}`}>
                                      {node.status}
                                  </span>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* Data Migration Stats */}
              <SciFiCard title="数据迁移统计" subtitle="MIGRATION" className="h-[220px] border-green-900/50 bg-[#040f08]/90 pointer-events-auto">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={DATA_STATS} layout="vertical" margin={{left: 10, right: 20}}>
                              <XAxis type="number" hide />
                              <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10, fill: '#94a3b8'}} />
                              <Tooltip cursor={{fill: 'rgba(0,255,157,0.1)'}} contentStyle={{backgroundColor: '#020804', borderColor: '#00ff9d', color: '#fff'}} />
                              <Bar dataKey="count" barSize={12} radius={[0, 4, 4, 0]}>
                                  {DATA_STATS.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Channel Twin */}
          <div className="flex-1 relative flex flex-col gap-4">
              <div className="flex-1 bg-[#010302] border border-green-800/40 relative rounded-lg overflow-hidden shadow-2xl">
                  {/* 3D Scene */}
                  <div className="absolute inset-0">
                      <GeoThreeScene type="dd-nav-dispatch" color="#00ff9d" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                  </div>

                  {/* HUD Overlays */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4 pointer-events-none">
                      <div className="bg-black/60 backdrop-blur border border-green-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Signal size={16} className="text-green-400 animate-pulse" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Radar Signal Strength</div>
                              <div className="text-sm font-bold text-white">-45 dBm (Strong)</div>
                          </div>
                      </div>
                      <div className="bg-black/60 backdrop-blur border border-blue-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Navigation size={16} className="text-blue-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Tracked Targets</div>
                              <div className="text-sm font-bold text-white">4 Active</div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Validation Overlay */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-black/70 px-6 py-2 rounded-full border border-green-500/50 text-green-300 text-xs font-mono pointer-events-none flex items-center gap-2">
                      <RefreshCw size={12} className="animate-spin"/> VERIFYING DATA LINK: TOWER-02 <span className="text-slate-500 mx-2"></span> VESSEL-88
                  </div>
              </div>
          </div>

          {/* RIGHT: Acceptance & Logic */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              {/* Acceptance Checklist */}
              <SciFiCard title="功能验收测试 (FAT)" subtitle="CHECKLIST" className="flex-1 border-green-900/50 bg-[#040f08]/90 pointer-events-auto">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {ACCEPTANCE_TESTS.map((test, i) => (
                          <div key={i} className="bg-slate-900/40 p-2.5 rounded border border-slate-800 flex justify-between items-center group hover:border-green-500/30 transition-colors">
                              <div>
                                  <div className="text-xs font-bold text-slate-200">{test.name}</div>
                                  <div className="text-[9px] text-slate-500 font-mono">{test.id}</div>
                              </div>
                              <div className="text-right">
                                  <div className={`text-xs font-bold ${test.result === 'Pass' ? 'text-green-400' : 'text-yellow-400'}`}>
                                      {test.result}
                                  </div>
                                  <div className="text-[9px] text-slate-400">{test.val}</div>
                              </div>
                          </div>
                      ))}
                      
                      <div className="mt-auto pt-3 border-t border-slate-800">
                          <div className="flex items-center gap-2 p-2 bg-green-900/20 border border-green-900/50 rounded text-xs text-green-200">
                              <ShieldCheck size={14} />
                              <span>Critical Logic Verified</span>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

              {/* System Architecture */}
              <SciFiCard title="系统架构完整性" subtitle="ARCH" className="h-[200px] border-green-900/50 bg-[#040f08]/90 pointer-events-auto">
                  <div className="flex flex-col h-full justify-center gap-2 p-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Presentation Layer</span>
                          <span className="text-green-500">OK</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded overflow-hidden"><div className="h-full bg-green-500 w-full"></div></div>
                      
                      <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                          <span>Business Logic Layer</span>
                          <span className="text-green-500">OK</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded overflow-hidden"><div className="h-full bg-green-500 w-full"></div></div>
                      
                      <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                          <span>Data Access Layer</span>
                          <span className="text-yellow-400">Review</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded overflow-hidden"><div className="h-full bg-yellow-500 w-[90%]"></div></div>
                      
                      <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                          <span>Hardware Interface</span>
                          <span className="text-green-500">OK</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded overflow-hidden"><div className="h-full bg-green-500 w-full"></div></div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
