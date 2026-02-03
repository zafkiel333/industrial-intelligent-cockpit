
import React, { useState } from 'react';
import { GeoThreeScene } from '../../components/scene-digital-delivery/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Cpu, Network, Server, Share2, 
  Terminal, Activity, ShieldCheck, 
  Database, GitBranch, CloudLightning,
  MonitorCheck, Code, PlayCircle
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';

// --- MOCK DATA ---
const MODULES = [
  { id: 'TOS-CORE', name: 'TOS 核心调度引擎', ver: 'v4.5.2', status: 'Stable', hash: 'e4d9...2a1' },
  { id: 'GATE-SYS', name: '智能闸口系统', ver: 'v2.1.0', status: 'Active', hash: '8b2f...c90' },
  { id: 'BILL-CTR', name: '费收结算中心', ver: 'v3.0.1', status: 'Active', hash: '1a7d...b34' },
  { id: 'VBS-APP', name: '预约查询服务', ver: 'v1.8.4', status: 'Syncing', hash: 'pending...' },
];

const API_PERFORMANCE = [
  { metric: 'Latency', A: 95, fullMark: 100 },
  { metric: 'Availability', A: 99, fullMark: 100 },
  { metric: 'Throughput', A: 88, fullMark: 100 },
  { metric: 'Error Rate', A: 92, fullMark: 100 },
  { metric: 'Security', A: 98, fullMark: 100 },
];

const TRAFFIC_DATA = Array.from({length: 24}, (_, i) => ({
    hour: `T-${24-i}`,
    requests: 2500 + Math.sin(i * 0.5) * 800 + Math.random() * 200,
    errors: 10 + Math.random() * 20
}));

const DEPLOY_PIPELINE = [
  { id: 1, stage: 'Code Commit', status: 'Done', time: '10:00' },
  { id: 2, stage: 'Auto Build', status: 'Done', time: '10:05' },
  { id: 3, stage: 'Unit Tests', status: 'Done', time: '10:12' },
  { id: 4, stage: 'Integration', status: 'Running', time: 'Now' },
  { id: 5, stage: 'Deploy Prod', status: 'Pending', time: '--' },
];

export const SmartPortDeliveryView: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState('TOS-CORE');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#03020c] text-slate-200 relative overflow-hidden">
      
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#03020c] to-black pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-indigo-900/30 bg-gradient-to-r from-indigo-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-widest">
             <Cpu size={14} className="animate-pulse" /> Intelligent Port Brain
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             智慧港口管理系统 <span className="text-indigo-500 text-shadow-glow">数字交付中心</span>
          </h1>
        </div>
        
        {/* System Stats */}
        <div className="flex gap-6 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">System Uptime</span>
                 <span className="font-mono text-white font-bold text-lg">99.99%</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">API Health</span>
                 <span className="font-mono text-green-400 font-bold text-lg">Optimal</span>
             </div>
             <button className="ml-4 px-6 py-2 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold rounded shadow-lg shadow-indigo-900/40 transition-all flex items-center gap-2 border border-indigo-500/50">
                 <CloudLightning size={14} /> 部署上线
             </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: Module Stack */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="软件模块栈 (Modules)" subtitle="VERSION" className="flex-1 border-indigo-900/50 bg-[#050410]/90 pointer-events-auto">
                  <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {MODULES.map((mod, i) => (
                          <div 
                            key={i} 
                            onClick={() => setSelectedModule(mod.id)}
                            className={`p-3 rounded border cursor-pointer transition-all hover:translate-x-1 group
                                ${selectedModule === mod.id 
                                   ? 'bg-indigo-900/30 border-indigo-500 text-white shadow-[0_0_10px_#6366f1]' 
                                   : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-indigo-700'}
                            `}
                          >
                              <div className="flex justify-between items-start mb-1">
                                  <div className="flex items-center gap-2">
                                      {mod.id === 'TOS-CORE' ? <Server size={14} className="text-indigo-400"/> : <Code size={14} className="text-slate-500"/>}
                                      <span className="text-sm font-bold">{mod.name}</span>
                                  </div>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded border 
                                      ${mod.status === 'Stable' ? 'border-green-500/50 text-green-400' : 'border-yellow-500/50 text-yellow-400'}
                                  `}>{mod.status}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-mono opacity-70 mt-2">
                                  <span>{mod.ver}</span>
                                  <span>MD5: {mod.hash}</span>
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="flex items-center gap-2"><Database size={12}/> DB Schema</span>
                          <span className="text-green-400">Synced</span>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Architecture */}
          <div className="flex-1 relative flex flex-col gap-4">
              <div className="flex-1 bg-[#010103] border border-indigo-800/40 relative rounded-lg overflow-hidden shadow-2xl">
                  {/* 3D Scene */}
                  <div className="absolute inset-0">
                      <GeoThreeScene type="dd-smart-port" color="#6366f1" />
                  </div>

                  {/* HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4 pointer-events-none">
                      <div className="bg-black/60 backdrop-blur border border-indigo-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Network size={16} className="text-indigo-400 animate-pulse" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Data Traffic</div>
                              <div className="text-sm font-bold text-white">45.2 MB/s</div>
                          </div>
                      </div>
                      <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Activity size={16} className="text-cyan-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Avg Latency</div>
                              <div className="text-sm font-bold text-white">12 ms</div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Deployment Pipeline */}
              <div className="h-24 bg-[#050410]/90 border border-indigo-900/30 rounded p-4 flex items-center justify-between pointer-events-auto">
                  {DEPLOY_PIPELINE.map((step, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center relative group">
                          {i !== DEPLOY_PIPELINE.length - 1 && (
                              <div className="absolute top-3 left-1/2 w-full h-0.5 bg-slate-800 -z-10">
                                  <div className={`h-full bg-indigo-500 transition-all duration-1000 ${step.status === 'Done' ? 'w-full' : 'w-0'}`}></div>
                              </div>
                          )}
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 mb-2 z-10 bg-[#050410]
                              ${step.status === 'Done' ? 'border-green-500 text-green-500' : 
                                step.status === 'Running' ? 'border-indigo-500 text-indigo-500 animate-pulse' : 'border-slate-700 text-slate-700'}
                          `}>
                              {step.status === 'Running' ? <PlayCircle size={12}/> : <div className="w-2 h-2 rounded-full bg-current"></div>}
                          </div>
                          <div className="text-xs font-bold text-slate-200">{step.stage}</div>
                          <div className="text-[9px] text-slate-500">{step.time}</div>
                      </div>
                  ))}
              </div>
          </div>

          {/* RIGHT: Validation & Metrics */}
          <div className="w-80 flex flex-col gap-4 pointer-events-auto">
              
              {/* API Radar */}
              <SciFiCard title="接口质量评估 (API Check)" subtitle="SCORE" className="h-[280px] border-indigo-900/40 bg-[#050410]/90 backdrop-blur-md">
                  <div className="w-full h-full p-2 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={API_PERFORMANCE}>
                              <PolarGrid stroke="#312e81" />
                              <PolarAngleAxis dataKey="metric" tick={{ fill: '#a5b4fc', fontSize: 10 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar name="Performance" dataKey="A" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.4} />
                              <Tooltip contentStyle={{backgroundColor: '#020408', borderColor: '#6366f1'}} />
                          </RadarChart>
                      </ResponsiveContainer>
                      <div className="absolute top-0 right-0 text-xs font-bold text-green-400 bg-indigo-900/30 px-2 py-1 rounded flex items-center gap-1">
                          <ShieldCheck size={12}/> Pass
                      </div>
                  </div>
              </SciFiCard>

              {/* Traffic Trend */}
              <SciFiCard title="系统负载测试" subtitle="RPS" className="flex-1 border-indigo-900/40 bg-[#050410]/90 backdrop-blur-md">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={TRAFFIC_DATA}>
                              <defs>
                                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                              <XAxis dataKey="hour" hide />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                              <Tooltip contentStyle={{backgroundColor: '#020408', borderColor: '#6366f1'}} />
                              <Area type="monotone" dataKey="requests" stroke="#6366f1" fill="url(#colorReq)" />
                          </AreaChart>
                      </ResponsiveContainer>
                      <div className="text-center text-[10px] text-slate-500 mt-1">Stress Test: 5000 concurrent users</div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
