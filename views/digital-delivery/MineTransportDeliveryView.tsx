
import React, { useState } from 'react';
import { GeoThreeScene } from '../../components/scene-digital-delivery/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  ArrowRight, Activity, Box, Truck, Anchor, 
  Settings, CheckCircle2, AlertTriangle, FileText,
  Share2, Zap, Layers, RefreshCw, Cpu
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar 
} from 'recharts';

// --- MOCK DATA ---
const HOIST_STATS = [
  { label: '提升速度', value: '12.5 m/s', status: 'Normal' },
  { label: '钢丝绳张力', value: '145 kN', status: 'Normal' },
  { label: '制动油压', value: '12.5 MPa', status: 'Normal' },
  { label: '罐笼位置', value: '-450 m', status: 'Moving' },
];

const TRANSPORT_LOGIC = [
  { id: 'L-01', rule: '皮带空载保护', condition: 'Load < 5%', action: 'Stop after 5min', status: 'Verified' },
  { id: 'L-02', rule: '煤仓满仓闭锁', condition: 'Level > 95%', action: 'Stop Feeder', status: 'Verified' },
  { id: 'L-03', rule: '提升机超速保护', condition: 'Speed > 14m/s', action: 'Emergency Brake', status: 'Verified' },
];

const FLOW_DATA = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    hoist: 400 + Math.sin(i*0.3)*100,
    conveyor: 420 + Math.sin(i*0.3)*80 + Math.random()*20
}));

const ASSET_LIST = [
  { id: 'JKMD-4x4', name: '多绳摩擦式提升机', type: 'Hoist', ver: 'v2.1' },
  { id: 'DTL-120', name: '带式输送机', type: 'Conveyor', ver: 'v1.5' },
  { id: 'NTE-240', name: '电动轮自卸车', type: 'Truck', ver: 'v3.0' },
  { id: 'PLC-S7', name: '主控系统逻辑', type: 'Control', ver: 'v4.2' },
];

export const MineTransportDeliveryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('HOIST');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#080a0f] text-slate-200 relative overflow-hidden">
      
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-orange-900/10 via-[#080a0f] to-black pointer-events-none"></div>
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(249, 115, 22, .3) 25%, rgba(249, 115, 22, .3) 26%, transparent 27%, transparent 74%, rgba(249, 115, 22, .3) 75%, rgba(249, 115, 22, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(249, 115, 22, .3) 25%, rgba(249, 115, 22, .3) 26%, transparent 27%, transparent 74%, rgba(249, 115, 22, .3) 75%, rgba(249, 115, 22, .3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px'}}>
      </div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-orange-900/40 bg-gradient-to-r from-orange-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-400 mb-1 uppercase tracking-widest">
             <RefreshCw size={14} className="animate-spin-slow" /> Kinetic Logistics System
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             运输与提升系统 <span className="text-orange-500 text-shadow-glow">数字化交付</span>
          </h1>
        </div>
        
        {/* Actions */}
        <div className="flex gap-6 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Logic Integrity</span>
                 <div className="flex items-center gap-2 text-green-400 font-mono font-bold">
                     <CheckCircle2 size={14}/> 100% Passed
                 </div>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <button className="px-4 py-2 bg-orange-700 hover:bg-orange-600 text-white text-xs font-bold rounded shadow-lg shadow-orange-900/40 transition-all flex items-center gap-2 border border-orange-500/50">
                 <Share2 size={14} /> 启动联调移交
             </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: Hoist Systems */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              <SciFiCard title="主井提升系统 (Hoisting)" subtitle="VERTICAL" className="flex-1 border-orange-900/50 bg-[#0c0a08]/90 pointer-events-auto">
                  <div className="flex flex-col gap-4 p-2 h-full">
                      <div className="relative h-48 border border-slate-800 rounded bg-black/40 p-4 flex flex-col items-center justify-center mb-2">
                          <div className="text-4xl font-black text-orange-500 mb-2">420 t/h</div>
                          <div className="text-xs text-slate-400 uppercase">Current Capacity</div>
                          
                          <div className="absolute bottom-2 left-2 text-[10px] text-slate-500">Cycle: 145s</div>
                          <div className="absolute bottom-2 right-2 text-[10px] text-green-400">Auto Mode</div>
                      </div>

                      <div className="space-y-2">
                          {HOIST_STATS.map((stat, i) => (
                              <div key={i} className="flex justify-between items-center p-2 bg-slate-900/50 border border-slate-800 rounded">
                                  <span className="text-xs text-slate-300">{stat.label}</span>
                                  <div className="text-right">
                                      <div className="text-sm font-bold text-white font-mono">{stat.value}</div>
                                      <div className="text-[9px] text-green-500">{stat.status}</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </SciFiCard>
          </div>

          {/* CENTER: 3D Visualization */}
          <div className="flex-1 relative flex flex-col gap-4">
              <div className="flex-1 bg-[#050302] border border-orange-800/40 relative rounded-lg overflow-hidden shadow-2xl">
                  <div className="absolute inset-0">
                      <GeoThreeScene type="transport" />
                  </div>

                  {/* HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4 pointer-events-none">
                      <div className="bg-black/60 backdrop-blur border border-orange-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Anchor size={16} className="text-orange-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Shaft Depth</div>
                              <div className="text-sm font-bold text-white">850m</div>
                          </div>
                      </div>
                      <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Activity size={16} className="text-cyan-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Haulage Efficiency</div>
                              <div className="text-sm font-bold text-white">92.4%</div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 right-4 z-20 bg-black/70 p-3 rounded border border-orange-900 text-[10px] text-slate-300 pointer-events-none">
                      <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Hoist / Skip</div>
                      <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-cyan-400"></div> Material Flow</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Haul Truck</div>
                  </div>
              </div>

              {/* Bottom Chart: Flow Balance */}
              <SciFiCard title="运输流平衡分析" subtitle="BALANCE" className="h-[220px] border-orange-900/50 bg-[#0c0a08]" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={FLOW_DATA}>
                              <defs>
                                  <linearGradient id="gradHoist" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="gradBelt" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#331c09" vertical={false} />
                              <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={2} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                              <Tooltip contentStyle={{backgroundColor: '#0c0a08', borderColor: '#f97316'}} />
                              <Area type="monotone" dataKey="hoist" stroke="#f97316" fill="url(#gradHoist)" name="Hoist (t/h)" />
                              <Area type="monotone" dataKey="conveyor" stroke="#22d3ee" fill="url(#gradBelt)" name="Belt (t/h)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>
          </div>

          {/* RIGHT: Logic & Assets */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="联锁逻辑验证 (Interlock)" subtitle="PLC" className="h-[300px] border-orange-900/50 bg-[#0c0a08]/90 pointer-events-auto">
                  <div className="flex flex-col gap-2 p-1 overflow-y-auto custom-scrollbar h-full">
                      {TRANSPORT_LOGIC.map((logic, i) => (
                          <div key={i} className="bg-slate-900/40 p-2.5 rounded border border-slate-800 hover:border-orange-500/30 transition-colors">
                              <div className="flex justify-between items-start mb-1">
                                  <div className="flex items-center gap-2">
                                      <Settings size={12} className="text-orange-400"/>
                                      <span className="text-xs font-bold text-slate-200">{logic.rule}</span>
                                  </div>
                                  <span className="text-[9px] bg-green-900/20 text-green-400 px-1.5 rounded">{logic.status}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 mt-1 pl-5">
                                  <div>IF: {logic.condition}</div>
                                  <div>THEN: {logic.action}</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              <SciFiCard title="交付资产清单" subtitle="ASSETS" className="flex-1 border-orange-900/50 bg-[#0c0a08]/90 pointer-events-auto">
                  <div className="flex flex-col gap-2 p-1">
                      {ASSET_LIST.map((asset, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-800 rounded group hover:border-cyan-500/30 transition-colors cursor-pointer">
                              <div className="flex items-center gap-3">
                                  {asset.type === 'Hoist' ? <Anchor size={14} className="text-orange-400"/> : 
                                   asset.type === 'Conveyor' ? <Layers size={14} className="text-cyan-400"/> :
                                   asset.type === 'Truck' ? <Truck size={14} className="text-red-400"/> :
                                   <Cpu size={14} className="text-green-400"/>}
                                  <div>
                                      <div className="text-xs font-bold text-white">{asset.name}</div>
                                      <div className="text-[9px] text-slate-500">{asset.id}</div>
                                  </div>
                              </div>
                              <div className="text-right text-[10px] text-slate-400">
                                  <div>Model: {asset.ver}</div>
                                  <div className="text-green-500 flex items-center justify-end gap-1"><FileText size={8}/> Ready</div>
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="mt-auto pt-3 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Total Items</span>
                          <span className="text-white font-bold">142</span>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
