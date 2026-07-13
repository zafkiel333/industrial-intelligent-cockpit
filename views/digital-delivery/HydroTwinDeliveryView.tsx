
import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[dd-hydro-twin]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/dd-hydro-twin';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area
} from 'recharts';
import { 
  Layers, Database, Zap, Activity, Scan, 
  GitBranch, CheckCircle2, RefreshCw, Cpu, 
  Share2, Box, FileCode, Server
} from 'lucide-react';

// --- MOCK DATA ---

const MATURITY_DATA = [
  { subject: '几何精度', A: 95, fullMark: 100 },
  { subject: '物理属性', A: 88, fullMark: 100 },
  { subject: '行为逻辑', A: 82, fullMark: 100 },
  { subject: '规则约束', A: 90, fullMark: 100 },
  { subject: '数据关联', A: 96, fullMark: 100 },
  { subject: '仿真能力', A: 78, fullMark: 100 },
];

const SYNC_STATS = [
  { name: 'IoT测点映射', value: 98.5, status: 'Normal' },
  { name: 'SCADA数据流', value: 100.0, status: 'Normal' },
  { name: '历史数据迁移', value: 92.4, status: 'Syncing' },
  { name: 'GIS坐标校准', value: 99.9, status: 'Normal' },
];

const DATA_FLOW = Array.from({length: 20}, (_, i) => ({
    time: i,
    rate: 50 + Math.random() * 30 + (i > 10 ? 40 : 0) // Burst of data
}));

const FUNCTION_MODULES = [
  { id: 'M-01', name: '实时状态映射', ready: true },
  { id: 'M-02', name: '故障诊断回溯', ready: true },
  { id: 'M-03', name: '预测性维护', ready: false }, // In progress
  { id: 'M-04', name: '虚拟巡检', ready: true },
];

export const HydroTwinDeliveryView: React.FC = () => {
  const [syncRate, setSyncRate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
        setSyncRate(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#020810] text-slate-200 relative overflow-hidden">
      
      {/* Background Matrix Rain */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-20"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-cyan-900/30 bg-gradient-to-r from-cyan-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-widest">
             <GitBranch size={14} className="animate-pulse" /> Virtual-Real Synchronization
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             数字孪生水电站 <span className="text-cyan-500 text-shadow-glow">交付验证平台</span>
          </h1>
        </div>
        <div className="flex gap-6 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Twin Fidelity</span>
                 <span className="font-mono text-white font-bold text-lg">L3 - Dynamic</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Sync Latency</span>
                 <span className="font-mono text-green-400 font-bold text-lg">12ms</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded shadow-lg shadow-cyan-900/50 transition-all flex items-center gap-2 border border-cyan-400/50">
                 <RefreshCw size={14} className={syncRate > 0 ? "animate-spin" : ""} /> 开始同步测试
             </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: Maturity & Model Stats */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              {/* Maturity Radar */}
              <SciFiCard title="孪生体成熟度模型 (TML)" subtitle="EVALUATION" className="h-[300px] border-cyan-900/50 bg-[#081220]/80 pointer-events-auto">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={MATURITY_DATA}>
                              <PolarGrid stroke="#1e3a8a" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#67e8f9', fontSize: 10 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar name="Maturity" dataKey="A" stroke="#22d3ee" strokeWidth={2} fill="#22d3ee" fillOpacity={0.4} />
                              <Tooltip contentStyle={{backgroundColor: '#020810', borderColor: '#22d3ee', color: '#fff'}} />
                          </RadarChart>
                      </ResponsiveContainer>
                      <div className="absolute top-2 right-2 text-xs font-bold text-cyan-300 bg-cyan-900/30 px-2 py-1 rounded">Score: 88.2</div>
                  </div>
              </SciFiCard>

              {/* Asset Composition */}
              <SciFiCard title="数字资产构成" className="flex-1 border-cyan-900/50 bg-[#081220]/80 pointer-events-auto">
                  <div className="flex flex-col gap-4 p-2">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-xs text-slate-400 flex items-center gap-2"><Box size={14}/> 3D Models</span>
                          <span className="font-mono text-white">4,250</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-xs text-slate-400 flex items-center gap-2"><Activity size={14}/> Sensors</span>
                          <span className="font-mono text-white">12,800</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-xs text-slate-400 flex items-center gap-2"><FileCode size={14}/> Rules/Scripts</span>
                          <span className="font-mono text-white">856</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400 flex items-center gap-2"><Database size={14}/> Data Tags</span>
                          <span className="font-mono text-white">1.2M</span>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: Digital Twin Hologram */}
          <div className="flex-1 relative border border-cyan-800/30 rounded-lg overflow-hidden bg-[#050b16]">
              {/* 3D Scene */}
              <div className="absolute inset-0">
                  <ThreeScene type="hydro-twin-delivery" color="#06b6d4" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* Scanning Overlay UI */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  {/* Corners */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-500"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-500"></div>
                  
                  {/* Status Text */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div className="text-cyan-400 text-xs font-bold tracking-[0.3em] animate-pulse">SYSTEM SYNCHRONIZING</div>
                      <div className="text-[10px] text-slate-500 mt-1">Packets: 14.5 GB/s</div>
                  </div>
              </div>
          </div>

          {/* RIGHT: Sync Status & Functional Delivery */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              {/* Sync Status */}
              <SciFiCard title="数据同步态势" subtitle="LIVE STREAM" className="h-[280px] border-cyan-900/50 bg-[#081220]/80 pointer-events-auto">
                  <div className="flex flex-col gap-3">
                      {SYNC_STATS.map((stat, i) => (
                          <div key={i} className="flex justify-between items-center">
                              <span className="text-xs text-slate-300">{stat.name}</span>
                              <div className="flex items-center gap-2">
                                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                      <div className={`h-full ${stat.value >= 100 ? 'bg-green-500' : 'bg-cyan-500'}`} style={{width: `${stat.value}%`}}></div>
                                  </div>
                                  <span className="text-[10px] font-mono text-white w-8 text-right">{stat.value.toFixed(0)}%</span>
                              </div>
                          </div>
                      ))}
                      
                      <div className="h-16 mt-2 border-t border-slate-800 pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={DATA_FLOW}>
                                  <Area type="monotone" dataKey="rate" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
              </SciFiCard>

              {/* Functional Delivery List */}
              <SciFiCard title="功能模块交付" subtitle="MODULES" className="flex-1 border-cyan-900/50 bg-[#081220]/80 pointer-events-auto">
                  <div className="flex flex-col gap-2">
                      {FUNCTION_MODULES.map((mod, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded hover:border-cyan-500/30 transition-colors group">
                              <div className="flex items-center gap-3">
                                  <div className={`p-1.5 rounded-full ${mod.ready ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                                      {mod.ready ? <CheckCircle2 size={12}/> : <Server size={12}/>}
                                  </div>
                                  <div className="flex flex-col">
                                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">{mod.name}</span>
                                      <span className="text-[9px] text-slate-500">{mod.id}</span>
                                  </div>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded ${mod.ready ? 'bg-green-900/20 text-green-500' : 'bg-yellow-900/20 text-yellow-500'}`}>
                                  {mod.ready ? 'Ready' : 'Testing'}
                              </span>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

          </div>
      </div>
    </div>
  );
};
