
import React, { useState } from 'react';
import { ThreeScene } from '../../components/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  GitMerge, Settings, Play, CheckCircle2, 
  Terminal, Cpu, ArrowRight, Activity, 
  RefreshCcw, AlertTriangle, FileCode, Layers,
  Database, Share2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---

const LOGIC_NODES = [
  { id: 'SHEARER', label: '采煤机逻辑 (Shearer)', status: 'Verified', active: true },
  { id: 'AFC', label: '刮板输送机 (AFC)', status: 'Verified', active: true },
  { id: 'SUPPORT', label: '液压支架 (Supports)', status: 'Verified', active: true },
  { id: 'PUMP', label: '乳化液泵站 (Pump)', status: 'Checking' },
  { id: 'POWER', label: '供电系统 (Power)', status: 'Pending' }
];

const ASSET_LIST = [
  { code: 'SH-01', name: 'MG1000/2550-GWD', type: 'Shearer', status: 'Model Matched', health: 98 },
  { code: 'AFC-01', name: 'SGZ1250/3000', type: 'Conveyor', status: 'Param Mismatch', health: 85, warning: true },
  { code: 'SUP-001', name: 'ZY15000/28/62', type: 'Support', status: 'Logic OK', health: 100 },
  { code: 'SUP-002', name: 'ZY15000/28/62', type: 'Support', status: 'Logic OK', health: 100 },
];

const LOGIC_SIMULATION = Array.from({length: 40}, (_, i) => ({
    step: i,
    shearerSpeed: 3.5 + Math.sin(i * 0.2) * 0.5,
    supportPressure: 32 + Math.cos(i * 0.2) * 2,
    conveyorLoad: 80 + Math.random() * 5
}));

const HANDOVER_LOG = [
    { time: '14:20:01', msg: 'Shearer [SH-01] Control Logic Uploaded', type: 'Success' },
    { time: '14:20:05', msg: 'AFC [AFC-01] Soft Start Profile Verified', type: 'Success' },
    { time: '14:20:12', msg: 'Hydraulic Group A: Pressure Logic Warning', type: 'Warn' },
    { time: '14:20:45', msg: 'Support Advance Sequence: Sync OK', type: 'Success' },
];

export const MineProcessDeliveryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('logic');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#140a05] text-slate-200 relative overflow-hidden">
      
      {/* Background: Underground vibe */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-900/10 via-[#140a05] to-black pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-orange-900/30 bg-gradient-to-r from-orange-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-400 mb-1 uppercase tracking-widest">
             <GitMerge size={14} className="animate-pulse" /> Automated Workflow Handoff
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             采掘工艺与流程 <span className="text-orange-500 text-shadow-glow">数字化移交</span>
          </h1>
        </div>
        
        {/* Delivery Stats */}
        <div className="flex gap-8 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Process Logic</span>
                 <div className="flex items-center gap-2 text-green-400 font-bold font-mono">
                     <CheckCircle2 size={14}/> Verified
                 </div>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Asset Binding</span>
                 <span className="font-mono text-white font-bold text-lg">92.4%</span>
             </div>
             <button className="ml-4 px-6 py-2 bg-orange-700 hover:bg-orange-600 text-white text-xs font-bold rounded-sm shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all flex items-center gap-2 border border-orange-400/50">
                 <Share2 size={14} /> 签署交付证书
             </button>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: Process Logic Control */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              {/* Node Navigator */}
              <SciFiCard title="工艺流程节点 (Flow)" subtitle="LIVE" className="flex-1 border-orange-900/50 bg-[#1a0f0a]/90 pointer-events-auto">
                  <div className="flex flex-col gap-4 p-2 relative h-full">
                      {/* Vertical Line */}
                      <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-slate-800 -z-10"></div>
                      
                      {LOGIC_NODES.map((node, i) => (
                          <div key={i} className="flex items-center gap-4 group cursor-pointer">
                              <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center bg-[#0c0805] z-10 transition-all
                                  ${node.active 
                                      ? 'border-orange-500 text-orange-400 shadow-[0_0_10px_#f97316]' 
                                      : 'border-slate-700 text-slate-500 group-hover:border-orange-700'}
                              `}>
                                  {node.id === 'SHEARER' ? <Settings size={20}/> : node.id === 'AFC' ? <RefreshCcw size={20}/> : <Layers size={20}/>}
                              </div>
                              <div className="flex-1 p-3 bg-slate-900/50 border border-slate-800 rounded hover:bg-slate-800 transition-colors">
                                  <div className="text-sm font-bold text-slate-200">{node.label}</div>
                                  <div className={`text-[10px] ${node.status === 'Verified' ? 'text-green-400' : 'text-yellow-400'}`}>
                                      {node.status}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>
              
              {/* Script Viewer */}
              <SciFiCard title="逻辑脚本预览" subtitle="PLC" className="h-[200px] border-orange-900/50 bg-[#1a0f0a]/90 pointer-events-auto">
                  <div className="p-2 font-mono text-[10px] text-green-300 bg-black/40 rounded h-full overflow-hidden relative">
                      <div className="absolute inset-0 p-2 overflow-y-auto custom-scrollbar">
                          {`IF Shearer_Pos > 120 THEN
  CALL Support_Advance(Group_A)
  SET AFC_Speed = 0.8
ELSIF Shearer_Pos < 10 THEN
  CALL Tail_Gate_Procedure()
END IF
// Verification: PASS
// Latency: 12ms`}
                      </div>
                      <div className="absolute bottom-2 right-2">
                          <button className="text-orange-400 hover:text-white flex items-center gap-1">
                              <FileCode size={12} /> Full Script
                          </button>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Visualization */}
          <div className="flex-1 relative flex flex-col gap-4">
              
              {/* 3D Scene Container */}
              <div className="flex-1 bg-[#050302] border border-orange-800/40 relative rounded-lg overflow-hidden shadow-2xl">
                  <div className="absolute inset-0">
                      <ThreeScene type="dd-mine-process-delivery" color="#f97316" />
                  </div>

                  {/* HUD: Machine Status */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                      <div className="bg-black/60 backdrop-blur border border-orange-500/30 px-4 py-2 rounded flex items-center gap-4">
                          <div className="flex flex-col">
                              <span className="text-[9px] text-slate-400 uppercase">Shearer Speed</span>
                              <span className="text-lg font-bold text-white font-mono">4.2 m/min</span>
                          </div>
                          <div className="w-px h-6 bg-slate-600"></div>
                          <div className="flex flex-col">
                              <span className="text-[9px] text-slate-400 uppercase">Support Pressure</span>
                              <span className="text-lg font-bold text-orange-400 font-mono">32 MPa</span>
                          </div>
                      </div>
                  </div>
                  
                  {/* Visual Legend */}
                  <div className="absolute bottom-4 right-4 z-20 bg-black/70 p-2 rounded border border-orange-900 text-[10px] text-slate-300 flex flex-col gap-1">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Shearer</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Active Support</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Control Data</div>
                  </div>
              </div>

              {/* Bottom: Logic Simulation Chart */}
              <SciFiCard title="联合仿真验证 (Co-Simulation)" subtitle="DATA STREAM" className="h-[220px] border-orange-900/50 bg-[#0c0805]" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={LOGIC_SIMULATION}>
                              <defs>
                                  <linearGradient id="gradSpeed" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#331c09" vertical={false} />
                              <XAxis dataKey="step" stroke="#64748b" tick={{fontSize: 10}} interval={5} label={{ value: 'Time Step', position: 'insideBottom', offset: -5 }} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                              <Tooltip contentStyle={{backgroundColor: '#0c0805', borderColor: '#f97316', color: '#fff'}} />
                              <ReferenceLine x={20} stroke="#22c55e" label="Trigger Event" />
                              <Area type="monotone" dataKey="shearerSpeed" stroke="#f97316" fill="url(#gradSpeed)" name="Cutter Speed" />
                              <Area type="monotone" dataKey="supportPressure" stroke="#3b82f6" fill="none" strokeWidth={2} name="Hydraulic Pressure" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Asset List & Handover */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              {/* Asset Binding */}
              <SciFiCard title="设备资产绑定" subtitle="BINDING" className="flex-1 border-orange-900/50 bg-[#1a0f0a]/90 pointer-events-auto">
                  <div className="flex flex-col gap-1 h-full overflow-y-auto custom-scrollbar pr-1">
                      {ASSET_LIST.map((asset, i) => (
                          <div key={i} className="bg-slate-900/40 p-2.5 rounded border border-slate-800 hover:border-orange-500/30 transition-colors group cursor-pointer">
                              <div className="flex justify-between items-start mb-1">
                                  <span className="text-xs font-bold text-slate-200 group-hover:text-white">{asset.name}</span>
                                  <span className="text-[9px] font-mono text-slate-500">{asset.code}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px]">
                                  <span className="text-slate-400">{asset.type}</span>
                                  <div className={`flex items-center gap-1 ${asset.warning ? 'text-yellow-400' : 'text-green-400'}`}>
                                      {asset.warning && <AlertTriangle size={8} />}
                                      {asset.status}
                                  </div>
                              </div>
                          </div>
                      ))}
                      
                      <div className="mt-auto pt-3 border-t border-slate-800">
                           <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600 flex items-center justify-center gap-2 transition-colors text-xs">
                               <Database size={12} /> Sync Asset Registry
                           </button>
                      </div>
                  </div>
              </SciFiCard>

              {/* Handover Logs */}
              <SciFiCard title="移交日志 (Logs)" subtitle="TERMINAL" className="h-[250px] border-orange-900/50 bg-[#1a0f0a]/90 pointer-events-auto">
                  <div className="flex flex-col h-full font-mono text-[10px] space-y-2 p-1 overflow-y-auto custom-scrollbar">
                      {HANDOVER_LOG.map((log, i) => (
                          <div key={i} className="flex gap-2 border-b border-slate-800/50 pb-1">
                              <span className="text-slate-500">[{log.time}]</span>
                              <span className={`${log.type === 'Success' ? 'text-green-400' : 'text-yellow-400'}`}>{log.msg}</span>
                          </div>
                      ))}
                      <div className="text-orange-500 animate-pulse">_ Waiting for sign-off...</div>
                  </div>
              </SciFiCard>

          </div>

      </div>

    </div>
  );
};
