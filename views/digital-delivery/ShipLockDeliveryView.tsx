
import React, { useState } from 'react';
import { GeoThreeScene } from '../../components/scene-digital-delivery/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[dd-ship-lock]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/dd-ship-lock';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Lock, Settings, Activity, FileText, 
  CheckSquare, Server, Layers, GitMerge,
  Search, ShieldCheck, Share2, Scan, 
  Database, RefreshCw
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

// --- MOCK DATA ---

const SYSTEM_TREE = [
  { id: 'CIVIL', label: '土建工程 (Civil)', status: 'Verified', children: [
      { id: 'UPPER_HEAD', label: '上闸首', status: 'Pass' },
      { id: 'CHAMBER', label: '闸室', status: 'Pass' },
      { id: 'LOWER_HEAD', label: '下闸首', status: 'Pass' },
  ]},
  { id: 'MECH', label: '金属结构 (Mech)', status: 'Active', children: [
      { id: 'MITER_GATE', label: '人字门', status: 'Scanning', active: true },
      { id: 'VALVE', label: '输水阀门', status: 'Pending' },
  ]},
  { id: 'ELEC', label: '电气自动化 (Elec)', status: 'Pending', children: [
      { id: 'PLC', label: 'PLC控制柜', status: 'Pending' },
      { id: 'SENSORS', label: '水位/流速计', status: 'Pending' },
  ]},
];

const DATA_QUALITY = [
  { subject: 'Geometry', A: 96, fullMark: 100 },
  { subject: 'Attributes', A: 90, fullMark: 100 },
  { subject: 'Logic', A: 85, fullMark: 100 },
  { subject: 'Docs', A: 95, fullMark: 100 },
  { subject: 'Topology', A: 92, fullMark: 100 },
];

const ASSET_LEDGER = [
  { code: 'G-L-01', name: '左岸上闸门', model: 'Miter-1200', status: 'Linked' },
  { code: 'G-R-01', name: '右岸上闸门', model: 'Miter-1200', status: 'Linked' },
  { code: 'HPU-01', name: '液压启闭机', model: 'Hydra-250', status: 'Missing Param' },
  { code: 'V-FILL', name: '充水阀门', model: 'Roller-800', status: 'Linked' },
];

const COMMISSIONING_LOG = [
  { step: 1, task: '闸门启闭逻辑测试', result: 'Pass', time: '10:00' },
  { step: 2, task: '水位传感器校准', result: 'Pass', time: '10:30' },
  { step: 3, task: '输水系统联调', result: 'Running', time: 'Now' },
  { step: 4, task: '集中控制功能验证', result: 'Pending', time: '--' },
];

export const ShipLockDeliveryView: React.FC = () => {
  const [activeNode, setActiveNode] = useState('MITER_GATE');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#020508] text-slate-200 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020508] to-black pointer-events-none"></div>
      
      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-blue-900/30 bg-gradient-to-r from-blue-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-widest">
             <Lock size={14} className="animate-pulse" /> Digital Twin Portal
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             船闸枢纽 <span className="text-cyan-500 text-shadow-glow">数字化交付平台</span>
          </h1>
        </div>
        
        {/* Progress */}
        <div className="flex gap-6 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Integration Progress</span>
                 <span className="font-mono text-white font-bold text-lg">72.5%</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Twin Fidelity</span>
                 <span className="font-mono text-cyan-400 font-bold text-lg">LOD 500</span>
             </div>
             <button className="ml-4 px-6 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded shadow-lg shadow-blue-900/40 transition-all flex items-center gap-2 border border-blue-500/50">
                 <Share2 size={14} /> 提交验收
             </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: System Tree */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="系统分解结构 (SBS)" subtitle="ASSETS" className="flex-1 border-blue-900/50 bg-[#050b14]/90 pointer-events-auto">
                  <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {SYSTEM_TREE.map((sys) => (
                          <div key={sys.id} className="mb-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-900/60 p-2 rounded mb-1">
                                  <Layers size={12} className="text-blue-400"/> {sys.label}
                              </div>
                              <div className="pl-3 space-y-1">
                                  {sys.children.map(child => (
                                      <div 
                                        key={child.id}
                                        onClick={() => setActiveNode(child.id)}
                                        className={`flex justify-between items-center p-2 rounded cursor-pointer transition-all border
                                            ${activeNode === child.id 
                                                ? 'bg-blue-900/30 border-blue-500 text-white' 
                                                : 'bg-transparent border-slate-800 text-slate-400 hover:border-blue-700'}
                                        `}
                                      >
                                          <span className="text-xs">{child.label}</span>
                                          {child.active ? <Scan size={12} className="text-cyan-400 animate-pulse"/> : 
                                           <div className={`w-2 h-2 rounded-full ${child.status === 'Pass' ? 'bg-green-500' : 'bg-slate-600'}`}></div>}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Visualization */}
          <div className="flex-1 relative flex flex-col gap-4">
              <div className="flex-1 bg-[#010203] border border-blue-800/40 relative rounded-lg overflow-hidden shadow-2xl">
                  {/* 3D Scene */}
                  <div className="absolute inset-0">
                      <GeoThreeScene type="dd-ship-lock" color="#0ea5e9" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                  </div>

                  {/* HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4 pointer-events-none">
                      <div className="bg-black/60 backdrop-blur border border-blue-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Activity size={16} className="text-cyan-400 animate-pulse" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Virtual Commissioning</div>
                              <div className="text-sm font-bold text-white">Filling Test</div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Water Level Overlay */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-black/60 px-4 py-2 rounded-full border border-slate-700 flex gap-6 text-[10px] text-slate-300 pointer-events-none">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Upstream: 142m</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Chamber: Varying</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Downstream: 110m</div>
                  </div>
              </div>

              {/* Bottom: Commissioning Log */}
              <SciFiCard title="联合调试日志 (Commissioning Log)" subtitle="TIMELINE" className="h-[180px] border-blue-900/50 bg-[#050b14]" noPadding>
                  <div className="w-full h-full p-2 flex gap-4 items-center overflow-x-auto custom-scrollbar">
                      {COMMISSIONING_LOG.map((log, i) => (
                          <div key={i} className="min-w-[160px] p-3 rounded border border-slate-800 bg-slate-900/40 flex flex-col gap-2 relative">
                              {i !== COMMISSIONING_LOG.length - 1 && (
                                  <div className="absolute top-1/2 -right-4 w-4 h-0.5 bg-slate-800"></div>
                              )}
                              <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-slate-500">Step 0{log.step}</span>
                                  <span className="text-[10px] text-blue-300">{log.time}</span>
                              </div>
                              <div className="text-xs font-bold text-white">{log.task}</div>
                              <div className={`text-[10px] uppercase font-bold ${log.result === 'Pass' ? 'text-green-400' : log.result === 'Running' ? 'text-yellow-400 animate-pulse' : 'text-slate-600'}`}>
                                  {log.result}
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>
          </div>

          {/* RIGHT: Acceptance Engine */}
          <div className="w-80 flex flex-col gap-4 pointer-events-auto">
              
              {/* Data Quality */}
              <SciFiCard title="数据质量评估" subtitle="SCORE" className="h-[260px] border-blue-900/40 bg-[#050b14]/90 backdrop-blur-md">
                  <div className="w-full h-full p-2 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={DATA_QUALITY}>
                              <PolarGrid stroke="#1e3a8a" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#93c5fd', fontSize: 10 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar name="Score" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.4} />
                              <Tooltip contentStyle={{backgroundColor: '#020408', borderColor: '#3b82f6'}} />
                          </RadarChart>
                      </ResponsiveContainer>
                      <div className="absolute top-0 right-0 text-xs font-bold text-cyan-400 bg-blue-900/30 px-2 py-1 rounded">Q-Index: 91.6</div>
                  </div>
              </SciFiCard>

              {/* Asset Ledger */}
              <SciFiCard title="关键设备台账 (Ledger)" subtitle="ASSETS" className="flex-1 border-blue-900/40 bg-[#050b14]/90 backdrop-blur-md">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {ASSET_LEDGER.map((asset, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 bg-slate-900/50 border border-slate-800 rounded group hover:border-blue-500/30 transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className="p-1 rounded-full bg-slate-800 text-slate-400 group-hover:text-cyan-400 transition-colors">
                                      <Settings size={12} />
                                  </div>
                                  <div>
                                      <div className="text-xs font-bold text-slate-200">{asset.name}</div>
                                      <div className="text-[9px] text-slate-500 font-mono">{asset.code}</div>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className="text-[9px] text-slate-500">{asset.model}</div>
                                  <span className={`text-[9px] font-bold ${asset.status === 'Linked' ? 'text-green-500' : 'text-yellow-500'}`}>{asset.status}</span>
                              </div>
                          </div>
                      ))}
                      
                      <div className="mt-auto pt-3 border-t border-slate-800">
                           <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 flex items-center justify-center gap-2 transition-colors">
                               <Database size={12} /> 关联文档库 (Docs)
                           </button>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
