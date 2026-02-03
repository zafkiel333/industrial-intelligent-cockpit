
import React, { useState } from 'react';
import { ThreeScene } from '../../components/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AlertTriangle, Play, ShieldAlert, Waves, 
  Map as MapIcon, Siren, FileText, CheckCircle2,
  TrendingDown, Umbrella, Navigation, Activity
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar
} from 'recharts';

// --- MOCK DATA ---
const SCENARIOS = [
  { id: 'SC-01', name: '100年一遇洪水 (100-Year)', type: 'Standard', severity: 'High', status: 'Ready' },
  { id: 'SC-02', name: '溃坝模拟 (Dam Break)', type: 'Extreme', severity: 'Critical', status: 'Ready' },
  { id: 'SC-03', name: '台风风暴潮叠加 (Typhoon)', type: 'Combo', severity: 'High', status: 'Draft' },
  { id: 'SC-04', name: '常规防洪调度 (Routine)', type: 'Normal', severity: 'Low', status: 'Ready' },
];

const PROTOCOLS = [
  { step: 1, action: '启动二级响应', role: '指挥长', time: 'T+00:30' },
  { step: 2, action: '开启3#泄洪闸', role: '调度员', time: 'T+01:00' },
  { step: 3, action: '下游群众转移', role: '地方政府', time: 'T+02:00' },
  { step: 4, action: '抢险物资调配', role: '后勤组', time: 'T+03:00' },
];

const IMPACT_DATA = Array.from({length: 24}, (_, i) => ({
    hour: `T+${i}`,
    depth: i < 5 ? 0 : (i-5) * 0.5 + Math.random() * 0.2, // Rising flood
    population: i < 8 ? 0 : (i-8) * 1200 // Affected people
}));

export const FloodDispatchDeliveryView: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [isSimulating, setIsSimulating] = useState(false);

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#0f172a] text-slate-200 relative overflow-hidden">
      
      {/* Dark Rain Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-red-900/30 bg-gradient-to-r from-slate-900/90 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-400 mb-1 uppercase tracking-widest">
             <ShieldAlert size={14} className="animate-pulse" /> Emergency Response System
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             防洪调度与应急推演系统 <span className="text-red-500 text-shadow-glow">数字交付</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">System Status</span>
                 <span className="font-mono text-green-400 font-bold">Online</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Active Protocols</span>
                 <span className="font-mono text-white font-bold">12 Sets</span>
             </div>
             <button 
                onClick={() => setIsSimulating(!isSimulating)}
                className={`ml-4 px-4 py-2 text-white text-xs font-bold rounded shadow-lg transition-all flex items-center gap-2 border
                   ${isSimulating ? 'bg-red-600 border-red-400 hover:bg-red-500' : 'bg-blue-600 border-blue-400 hover:bg-blue-500'}
                `}
             >
                 {isSimulating ? <Activity size={14} className="animate-spin" /> : <Play size={14} />}
                 {isSimulating ? '演练进行中...' : '启动推演'}
             </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: Scenario Selector */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="推演场景库 (Scenarios)" subtitle="SELECT" className="flex-1 border-red-900/30 bg-[#0f172a]/90 pointer-events-auto">
                  <div className="flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
                      {SCENARIOS.map((sc, i) => (
                          <div 
                            key={i}
                            onClick={() => setActiveScenario(sc)}
                            className={`p-3 rounded border cursor-pointer transition-all hover:translate-x-1 group
                                ${activeScenario.id === sc.id 
                                    ? 'bg-red-900/20 border-red-500 text-white' 
                                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-red-500/30'}
                            `}
                          >
                              <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-sm">{sc.name}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                                      sc.severity === 'Critical' ? 'bg-red-600 text-white border-red-500' :
                                      sc.severity === 'High' ? 'bg-orange-600/50 text-orange-200 border-orange-500' :
                                      'bg-blue-600/30 text-blue-300 border-blue-500'
                                  }`}>{sc.severity}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] opacity-70 mt-2">
                                  <span className="font-mono">{sc.id}</span>
                                  <span className="text-slate-300">{sc.type}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* Simulation Parameters */}
              <SciFiCard title="边界条件设定" className="h-48 border-slate-700 bg-[#0f172a]/90 pointer-events-auto">
                  <div className="flex flex-col gap-3 p-1">
                      <div className="flex justify-between items-center text-xs text-slate-300">
                          <span>Inflow Peak</span>
                          <span className="font-mono text-red-400">12,500 m³/s</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full w-[85%]"></div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-slate-300 mt-2">
                          <span>Initial Level</span>
                          <span className="font-mono text-blue-400">142.5 m</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full w-[60%]"></div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Sand Table */}
          <div className="flex-1 relative border border-slate-700 rounded-lg overflow-hidden bg-[#020408]">
              {/* 3D Scene */}
              <div className="absolute inset-0">
                  <ThreeScene type="dd-flood-control-delivery" color="#ef4444" />
              </div>

              {/* HUD Overlay */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/60 backdrop-blur px-6 py-2 rounded-full border border-red-500/30 pointer-events-none">
                  <div className="flex flex-col items-center">
                      <span className="text-[9px] text-slate-400 uppercase">Simulation Time</span>
                      <span className="text-sm font-bold text-white font-mono">T+04:30:00</span>
                  </div>
                  <div className="h-6 w-px bg-slate-700"></div>
                  <div className="flex flex-col items-center">
                      <span className="text-[9px] text-slate-400 uppercase">Flood Stage</span>
                      <span className="text-sm font-bold text-red-400 animate-pulse">RISING</span>
                  </div>
              </div>

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 bg-black/60 p-2 rounded border border-slate-700 text-[10px] text-slate-300">
                  <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Water Body</div>
                  <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Warning Zone</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-600"></div> Critical Asset</div>
              </div>
          </div>

          {/* RIGHT: Protocols & Impact */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              {/* Response Protocols */}
              <SciFiCard title="应急响应预案 (Playbook)" subtitle="EXECUTION" className="flex-1 border-red-900/30 bg-[#0f172a]/90 pointer-events-auto">
                  <div className="flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
                      {PROTOCOLS.map((p, i) => (
                          <div key={i} className="flex gap-3 p-2 bg-slate-900/40 rounded border border-slate-800 hover:border-blue-500/30">
                              <div className="flex flex-col items-center justify-center w-8 bg-slate-800 rounded text-slate-400 font-bold text-xs">
                                  {p.step}
                              </div>
                              <div className="flex-1">
                                  <div className="text-sm font-bold text-white">{p.action}</div>
                                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                                      <span>{p.role}</span>
                                      <span className="text-red-300">{p.time}</span>
                                  </div>
                              </div>
                              <CheckCircle2 size={14} className="text-slate-600 self-center" />
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* Impact Charts */}
              <SciFiCard title="灾损评估预测" subtitle="IMPACT" className="h-[240px] border-red-900/30 bg-[#0f172a]/90 pointer-events-auto">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={IMPACT_DATA}>
                              <defs>
                                  <linearGradient id="colorPop" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={4} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#ef4444'}} />
                              <Area type="monotone" dataKey="population" stroke="#ef4444" fill="url(#colorPop)" name="Affected Pop." />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

      </div>

    </div>
  );
};
