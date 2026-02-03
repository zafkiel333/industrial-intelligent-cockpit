
import React, { useState } from 'react';
import { ThreeScene } from '../../components/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Activity, ShieldCheck, Database, CheckCircle2, 
  AlertOctagon, Signal, FileCheck, Share2, 
  Terminal, Search, Server, GitCommit
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell
} from 'recharts';

// --- MOCK DATA ---
const SENSOR_TREE = [
  { id: 'DAU-01', label: '坝基自动化采集单元 (Base)', status: 'Online', sensors: [
    { id: 'PZ-101', type: 'Piezometer', val: '245 kPa', status: 'Calibrated' },
    { id: 'JN-201', type: 'Joint Meter', val: '1.2 mm', status: 'Calibrated' },
    { id: 'TP-301', type: 'Thermometer', val: '14.5 °C', status: 'Verified' },
  ]},
  { id: 'DAU-02', label: '坝顶自动化采集单元 (Crest)', status: 'Online', sensors: [
    { id: 'PL-401', type: 'Plumb Line', val: '3.5 mm', status: 'Calibrated' },
    { id: 'GNSS-01', type: 'GNSS Rover', val: 'Fixed', status: 'Calibrated' },
  ]},
  { id: 'DAU-03', label: '绕坝渗流监测 (Abutment)', status: 'Syncing', sensors: [
    { id: 'WEIR-01', type: 'Weir Gauge', val: '12 L/s', status: 'Pending' },
  ]}
];

const SIGNAL_QUALITY = Array.from({length: 20}, (_, i) => ({
    time: i,
    snr: 90 + Math.random() * 10,
    packetLoss: Math.random() > 0.9 ? 1 : 0
}));

const DELIVERY_CHECKLIST = [
  { item: '仪器参数台账导入', status: 'Done', time: '10:00' },
  { item: '基准值 (Initial Reading) 固化', status: 'Done', time: '10:15' },
  { item: '计算公式库验证', status: 'Done', time: '10:30' },
  { item: '报警阈值配置', status: 'Done', time: '10:45' },
  { item: '通信链路压力测试', status: 'Running', time: 'Now' },
];

export const DamSafetyDeliveryView: React.FC = () => {
  const [activeDau, setActiveDau] = useState('DAU-01');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#020906] text-slate-200 relative overflow-hidden">
      
      {/* Background Matrix */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-30"></div>
      
      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-green-900/30 bg-gradient-to-r from-green-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-green-400 mb-1 uppercase tracking-widest">
             <ShieldCheck size={14} className="animate-pulse" /> Safety Monitoring Handover
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             大坝安全监测系统 <span className="text-green-500 text-shadow-glow">数字交付平台</span>
          </h1>
        </div>
        
        {/* Progress Stepper */}
        <div className="flex gap-8 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">System Integrity</span>
                 <span className="font-mono text-white font-bold text-lg">99.9%</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Sensors Online</span>
                 <span className="font-mono text-green-400 font-bold text-lg">452 / 452</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <button className="ml-4 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-xs font-bold rounded shadow-lg shadow-green-900/50 transition-all flex items-center gap-2 border border-green-500/50">
                 <Share2 size={14} /> 生成移交报告
             </button>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: Sensor Topology */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="监测点位拓扑 (Topology)" subtitle="LIVE STATUS" className="flex-1 border-green-900/50 bg-[#06120a]/90 pointer-events-auto">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {SENSOR_TREE.map((dau) => (
                          <div key={dau.id} className="mb-2">
                              <div 
                                onClick={() => setActiveDau(dau.id)}
                                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors border
                                   ${activeDau === dau.id ? 'bg-green-900/30 border-green-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-green-700'}
                                `}
                              >
                                  <div className="flex items-center gap-2">
                                      <Server size={14} className={activeDau === dau.id ? "text-green-400" : "text-slate-500"}/>
                                      <span className="text-xs font-bold">{dau.label.split(' ')[0]}</span>
                                  </div>
                                  <span className="text-[9px]">{dau.status}</span>
                              </div>
                              
                              {activeDau === dau.id && (
                                  <div className="pl-4 mt-1 space-y-1">
                                      {dau.sensors.map(sensor => (
                                          <div key={sensor.id} className="flex justify-between items-center text-[10px] p-1.5 bg-black/20 rounded border-l-2 border-slate-600">
                                              <span className="text-slate-300 font-mono">{sensor.id}</span>
                                              <span className="text-slate-500">{sensor.type}</span>
                                              <span className={`font-bold ${sensor.status === 'Calibrated' ? 'text-green-500' : 'text-yellow-500'}`}>{sensor.status}</span>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* Data Quality Chart */}
              <SciFiCard title="数据通信质量" subtitle="SNR CHECK" className="h-[200px] border-green-900/50 bg-[#06120a]/90 pointer-events-auto">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={SIGNAL_QUALITY}>
                              <defs>
                                  <linearGradient id="gradSnr" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#14532d" vertical={false} />
                              <XAxis hide />
                              <YAxis domain={[80, 100]} hide />
                              <Tooltip contentStyle={{backgroundColor: '#020906', borderColor: '#22c55e'}} />
                              <Area type="monotone" dataKey="snr" stroke="#22c55e" fill="url(#gradSnr)" strokeWidth={2} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Visualization */}
          <div className="flex-1 relative border border-green-800/30 rounded-lg overflow-hidden bg-[#030504]">
              {/* 3D Scene */}
              <div className="absolute inset-0">
                  <ThreeScene type="dd-dam-safety-delivery" color="#22c55e" />
              </div>

              {/* Top HUD */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/60 backdrop-blur px-6 py-2 rounded-full border border-green-500/30 pointer-events-none">
                  <div className="flex flex-col items-center">
                      <span className="text-[9px] text-slate-400 uppercase">Active Nodes</span>
                      <span className="text-sm font-bold text-white">128</span>
                  </div>
                  <div className="h-6 w-px bg-slate-700"></div>
                  <div className="flex flex-col items-center">
                      <span className="text-[9px] text-slate-400 uppercase">Data Rate</span>
                      <span className="text-sm font-bold text-green-400">12 Hz</span>
                  </div>
                  <div className="h-6 w-px bg-slate-700"></div>
                  <div className="flex flex-col items-center">
                      <span className="text-[9px] text-slate-400 uppercase">Latency</span>
                      <span className="text-sm font-bold text-white">45ms</span>
                  </div>
              </div>

              {/* Overlay Scanning Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-[scan_3s_linear_infinite] pointer-events-none" style={{backgroundSize: '100% 200%'}}></div>
          </div>

          {/* RIGHT: Validation & Logs */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              {/* Delivery Checklist */}
              <SciFiCard title="交付验收清单" subtitle="CHECKLIST" className="flex-1 border-green-900/50 bg-[#06120a]/90 pointer-events-auto">
                  <div className="flex flex-col gap-3 p-1">
                      {DELIVERY_CHECKLIST.map((task, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-800 rounded group hover:border-green-500/30 transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className={`p-1 rounded-full ${task.status === 'Done' ? 'bg-green-500 text-black' : 'bg-slate-700 text-slate-400'}`}>
                                      {task.status === 'Done' ? <CheckCircle2 size={12} /> : <Activity size={12} className={task.status === 'Running' ? 'animate-spin' : ''} />}
                                  </div>
                                  <span className="text-xs text-slate-200">{task.item}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-500">{task.time}</span>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* System Log Console */}
              <SciFiCard title="系统日志 (System Log)" subtitle="CONSOLE" className="h-[240px] border-green-900/50 bg-[#06120a]/90 pointer-events-auto">
                  <div className="flex flex-col h-full font-mono text-[10px] p-2 bg-black/40 rounded overflow-y-auto custom-scrollbar text-green-300 space-y-1">
                      <div>[10:45:02] SYS: DAU-01 Handshake OK.</div>
                      <div>[10:45:05] DATA: Baseline calculation started...</div>
                      <div>[10:45:08] CHECK: Piezometer P-102 offset <span className="text-yellow-400">0.05%</span> (Within Tol).</div>
                      <div>[10:45:12] NET: Uplink established to SCADA.</div>
                      <div>[10:45:15] <span className="text-white">Waiting for operator sign-off...</span></div>
                      <div className="animate-pulse">_</div>
                  </div>
              </SciFiCard>

          </div>

      </div>

    </div>
  );
};
