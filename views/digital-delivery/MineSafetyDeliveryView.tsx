
import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[dd-mine-safety]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/dd-mine-safety';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  ShieldCheck, AlertTriangle, Activity, 
  Wifi, CheckCircle, Database, FileText, 
  Play, RotateCcw, Share2, Scan, 
  Thermometer, Wind, Zap, Box
} from 'lucide-react';

// --- MOCK DATA ---
const SENSOR_LIST = [
  { id: 'GS-101', type: '瓦斯传感器', loc: 'K1+200', status: 'Online', val: '0.04%' },
  { id: 'WS-204', type: '风速传感器', loc: 'K1+450', status: 'Online', val: '2.4 m/s' },
  { id: 'TS-302', type: '温度传感器', loc: 'K0+800', status: 'Calibrating', val: '--' },
  { id: 'CO-105', type: '一氧化碳', loc: 'K1+220', status: 'Online', val: '2 ppm' },
];

const VALIDATION_STEPS = [
  { id: 1, label: '设备注册', status: 'done' },
  { id: 2, label: '链路通断', status: 'done' },
  { id: 3, label: '数据映射', status: 'active' },
  { id: 4, label: '报警联动', status: 'pending' },
  { id: 5, label: '三维对映', status: 'pending' },
];

const LOGS = [
  { time: '10:42:01', sys: 'SYS_CORE', msg: 'Device GS-101 heartbeat received.', type: 'info' },
  { time: '10:42:05', sys: 'AI_VALID', msg: 'Data consistency check: PASS', type: 'success' },
  { time: '10:42:12', sys: 'NET_OP', msg: 'Latency spike on node TS-302 detected.', type: 'warn' },
];

export const MineSafetyDeliveryView: React.FC = () => {
  const [simMode, setSimMode] = useState<'SCAN' | 'ALERT'>('SCAN');
  const [testLog, setTestLog] = useState<string[]>([]);

  const toggleSim = () => {
    if (simMode === 'SCAN') {
      setSimMode('ALERT');
      setTestLog(prev => [...prev, 'Starting Gas Leak Simulation...']);
      setTimeout(() => setTestLog(prev => [...prev, 'Sensor GS-101 Triggered (>1.0%)']), 1500);
      setTimeout(() => setTestLog(prev => [...prev, 'Logic: Fan Power Cut [OK]']), 2500);
      setTimeout(() => setTestLog(prev => [...prev, 'Logic: Alarm Broadcast [OK]']), 3000);
    } else {
      setSimMode('SCAN');
      setTestLog([]);
    }
  };

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#050505] text-slate-200 relative overflow-hidden">
      
      {/* 3D Background Layer */}
      <div className="absolute inset-0 z-0">
         <ThreeScene type="dd-mine-safety-delivery" color="#00ff9d" data={{ simMode }} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_90%)] pointer-events-none"></div>
         <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,157,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,157,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      </div>

      {/* Floating HUD Header */}
      <div className="relative z-20 px-8 py-6 flex justify-between items-start pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-[#00ff9d] mb-1 uppercase tracking-[0.2em] font-bold animate-pulse">
                 <ShieldCheck size={14} /> Safety Assurance Protocol
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-lg">
                 安全监测预警系统 <span className="text-[#00ff9d]">交付验收中心</span>
              </h1>
          </div>
          
          <div className="flex gap-4 pointer-events-auto">
             <div className="bg-black/60 backdrop-blur border border-[#00ff9d]/30 px-4 py-2 rounded flex flex-col items-end">
                 <span className="text-[10px] text-slate-400 uppercase">System Availability</span>
                 <span className="text-xl font-mono text-white font-bold">99.98%</span>
             </div>
             <button className="px-6 py-2 bg-[#00ff9d]/20 hover:bg-[#00ff9d]/40 text-[#00ff9d] border border-[#00ff9d] rounded font-bold uppercase tracking-wider transition-all flex items-center gap-2 text-sm shadow-[0_0_15px_rgba(0,255,157,0.3)]">
                 <FileText size={16} /> 生成验收报告
             </button>
          </div>
      </div>

      {/* Floating Modules Layout */}
      <div className="flex-1 relative z-10 p-8 flex justify-between pointer-events-none">
          
          {/* LEFT: Device Registry */}
          <div className="w-80 flex flex-col gap-6 pointer-events-auto">
              
              <SciFiCard title="感知设备台账 (Device Ledger)" subtitle="LIVE SYNC" className="flex-1 border-[#00ff9d]/30 bg-[#0a0f0c]/90 backdrop-blur-md">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {SENSOR_LIST.map((s, i) => (
                          <div key={i} className="group p-3 border border-slate-800 bg-slate-900/40 rounded hover:border-[#00ff9d]/50 transition-all cursor-pointer">
                              <div className="flex justify-between items-start mb-1">
                                  <div className="flex items-center gap-2">
                                      {s.type.includes('瓦斯') ? <AlertTriangle size={14} className="text-red-400"/> : 
                                       s.type.includes('风速') ? <Wind size={14} className="text-blue-400"/> :
                                       <Activity size={14} className="text-slate-400"/>}
                                      <span className="text-sm font-bold text-white group-hover:text-[#00ff9d] transition-colors">{s.type}</span>
                                  </div>
                                  <span className={`text-[9px] px-1.5 rounded ${s.status === 'Online' ? 'bg-[#00ff9d]/20 text-[#00ff9d]' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                      {s.status}
                                  </span>
                              </div>
                              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                  <span>ID: {s.id}</span>
                                  <span>Loc: {s.loc}</span>
                              </div>
                              <div className="mt-2 text-right font-mono text-lg text-white font-bold">{s.val}</div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              <div className="p-4 bg-black/60 backdrop-blur border border-slate-700 rounded-lg">
                  <div className="text-xs text-slate-400 uppercase mb-2 flex items-center gap-2">
                      <Wifi size={14} /> Network Health
                  </div>
                  <div className="flex gap-1 h-8 items-end">
                      {Array.from({length: 20}).map((_, i) => (
                          <div key={i} className="flex-1 bg-[#00ff9d]" style={{height: `${30 + Math.random()*70}%`, opacity: 0.5}}></div>
                      ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>Latency: 12ms</span>
                      <span>Packet Loss: 0%</span>
                  </div>
              </div>

          </div>

          {/* CENTER BOTTOM: Simulation Controls */}
          <div className="self-end mb-8 pointer-events-auto flex flex-col items-center gap-4">
              {simMode === 'ALERT' && (
                  <div className="bg-red-950/80 border border-red-500 text-red-200 px-6 py-4 rounded-lg backdrop-blur-md max-w-md w-full animate-in slide-in-from-bottom-4">
                      <div className="text-xs font-bold uppercase mb-2 flex items-center gap-2">
                          <Activity size={14} className="animate-pulse"/> Test Scenario Log
                      </div>
                      <div className="space-y-1 font-mono text-xs">
                          {testLog.map((log, i) => (
                              <div key={i} className="border-l-2 border-red-500/50 pl-2">{log}</div>
                          ))}
                      </div>
                  </div>
              )}

              <div className="flex gap-4">
                  <button 
                    onClick={toggleSim}
                    className={`flex items-center gap-3 px-8 py-3 rounded-full font-bold uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] border-2
                        ${simMode === 'ALERT' 
                           ? 'bg-red-600 border-red-500 text-white hover:bg-red-500' 
                           : 'bg-slate-900/80 border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10'}
                    `}
                  >
                      {simMode === 'ALERT' ? <RotateCcw /> : <Play />}
                      {simMode === 'ALERT' ? 'RESET SIMULATION' : 'RUN SAFETY TEST'}
                  </button>
              </div>
          </div>

          {/* RIGHT: Validation Pipeline */}
          <div className="w-80 flex flex-col gap-6 pointer-events-auto">
              
              <SciFiCard title="交付验证流水线 (Validation)" subtitle="AUTO" className="border-[#00ff9d]/30 bg-[#0a0f0c]/90 backdrop-blur-md">
                  <div className="relative pl-4 space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                      {VALIDATION_STEPS.map((step) => (
                          <div key={step.id} className="relative flex items-center gap-4">
                              <div className={`w-3 h-3 rounded-full z-10 border-2 
                                  ${step.status === 'done' ? 'bg-[#00ff9d] border-[#00ff9d]' : 
                                    step.status === 'active' ? 'bg-black border-[#00ff9d] animate-pulse' : 'bg-black border-slate-600'}
                              `}></div>
                              <div className={`flex-1 p-2 rounded border transition-colors
                                  ${step.status === 'active' ? 'bg-[#00ff9d]/10 border-[#00ff9d]/50' : 'border-transparent'}
                              `}>
                                  <div className={`text-xs font-bold ${step.status === 'active' ? 'text-white' : 'text-slate-400'}`}>
                                      {step.label}
                                  </div>
                              </div>
                              {step.status === 'done' && <CheckCircle size={14} className="text-[#00ff9d]" />}
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              <div className="flex-1 bg-black/40 backdrop-blur border border-slate-800 rounded-lg p-3 font-mono text-[10px] overflow-hidden">
                  <div className="text-xs text-slate-500 uppercase border-b border-slate-800 pb-1 mb-2">System Console</div>
                  <div className="space-y-1 h-40 overflow-y-auto custom-scrollbar">
                      {LOGS.map((l, i) => (
                          <div key={i} className="flex gap-2">
                              <span className="text-slate-600">[{l.time}]</span>
                              <span className={`${l.type === 'success' ? 'text-[#00ff9d]' : l.type === 'warn' ? 'text-yellow-500' : 'text-slate-300'}`}>
                                  {l.msg}
                              </span>
                          </div>
                      ))}
                      <div className="animate-pulse text-[#00ff9d]">_</div>
                  </div>
              </div>

          </div>

      </div>
    </div>
  );
};
