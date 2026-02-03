
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/ship-lock/ThreeScene';
import { LockMaintenanceState } from '../../components/maintenance/ship-lock/three-types';
import { 
  Anchor, Activity, Settings, 
  AlertTriangle, Play, RotateCcw, 
  Wrench, GitMerge, FileText, 
  Cpu, Thermometer, Droplets,
  CheckCircle2, Lock, Unlock, ArrowRight, Gauge
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, AreaChart, Area,
  ScatterChart, Scatter
} from 'recharts';

// --- MOCK DATA ---
const GATE_SYNC_DATA = Array.from({length: 40}, (_, i) => ({
    time: i,
    left: Math.sin(i*0.2) * 45 + (i > 20 ? 5 : 0), // Deviation after t=20
    right: Math.sin(i*0.2) * 45
}));

const PRESSURE_DATA = Array.from({length: 20}, (_, i) => ({
    time: i,
    pA: 12 + Math.random(),
    pB: 11.5 + Math.random()
}));

const MAINTENANCE_STEPS: { id: LockMaintenanceState; label: string; desc: string; }[] = [
  { id: 'MONITORING', label: '智能巡检', desc: '全要素实时监控，检测闸门同步偏差。' },
  { id: 'FAULT_SYNC', label: '故障锁定', desc: '检测到左岸人字门液压缸内泄，导致开度不同步 (>2°)。' },
  { id: 'ISOLATION', label: '系统隔离', desc: '切断主油路，挂牌上锁(LOTO)，排空余压。' },
  { id: 'DIAGNOSIS', label: '精密诊断', desc: '连接便携式液压测试仪，分析比例阀P-Q特性曲线。' },
  { id: 'REPAIR_VALVE', label: '阀件更换', desc: '拆卸故障比例阀，清洗阀块，安装新阀件。' },
  { id: 'DEBUGGING', label: '参数整定', desc: '执行PID自整定程序，重新校准同步控制参数。' },
  { id: 'RESTORED', label: '恢复通航', desc: '进行全行程动水启闭试验，确认指标合格。' },
];

export const ShipLockMaintenanceView: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] 船闸机电运维系统上线...']);
  
  const currentStep = MAINTENANCE_STEPS[currentStepIdx];
  const currentState = currentStep.id;

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 7)]);
  };

  const nextStep = () => {
    if (currentStepIdx < MAINTENANCE_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      addLog(`执行步骤: ${MAINTENANCE_STEPS[currentStepIdx + 1].label}`);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between bg-slate-900/80 border-b border-cyan-500/30 p-4 rounded-t-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Anchor size={14} /> Hydraulic Infrastructure
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             船闸机电设备 <span className="text-cyan-500">综合维修仿真</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
             <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded border border-slate-700">
                 <Activity size={18} className={currentState === 'FAULT_SYNC' ? 'text-red-500 animate-pulse' : 'text-green-500'} />
                 <div>
                     <div className="text-[10px] text-slate-400 uppercase">Health Status</div>
                     <div className="text-sm font-bold text-white">{currentState === 'MONITORING' ? 'OPTIMAL' : currentState === 'RESTORED' ? 'RECOVERED' : 'WARNING'}</div>
                 </div>
             </div>
             <div className="h-8 w-[1px] bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Current Phase</div>
                <div className="text-xl font-bold text-white">{currentStep.label}</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: 3D Twin & HUD */}
        <div className="flex-1 flex flex-col gap-4 relative">
            <div className="flex-1 bg-[#050b14] border border-cyan-800/30 rounded-lg overflow-hidden relative shadow-2xl group">
                
                {/* HUD Elements */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-2 rounded w-48">
                        <div className="text-[10px] text-cyan-400 font-bold mb-1 flex items-center gap-2">
                            <GitMerge size={12} /> GATE SYNCHRONIZATION
                        </div>
                        <div className="flex justify-between text-xs font-mono text-slate-300">
                            <span>L: {currentState === 'FAULT_SYNC' ? '-2.4°' : '0.0°'}</span>
                            <span className={currentState === 'FAULT_SYNC' ? 'text-red-500 font-bold' : 'text-green-400'}>
                                Δ: {currentState === 'FAULT_SYNC' ? '2.4°' : '0.1°'}
                            </span>
                            <span>R: 0.0°</span>
                        </div>
                    </div>
                    
                    <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-2 rounded w-48">
                        <div className="text-[10px] text-cyan-400 font-bold mb-1 flex items-center gap-2">
                            <Droplets size={12} /> HYDRAULIC PRESSURE
                        </div>
                         <div className="flex justify-between text-xs font-mono text-slate-300">
                            <span>Sys: 14.5 MPa</span>
                            <span>Temp: 42°C</span>
                        </div>
                    </div>
                </div>

                {/* 3D Scene Component */}
                <ThreeScene state={currentState} />

                {/* Step Navigation Overlay */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-2xl bg-black/80 border border-slate-700 rounded-full p-2 flex items-center justify-between shadow-xl">
                    <button 
                        onClick={() => {setCurrentStepIdx(0); addLog('场景重置');}}
                        className="p-3 rounded-full hover:bg-slate-700 text-slate-400 transition-colors"
                    >
                        <RotateCcw size={18} />
                    </button>
                    
                    <div className="flex-1 px-6">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{currentStep.label}</span>
                            <span className="text-[10px] text-slate-500">{currentStepIdx + 1} / {MAINTENANCE_STEPS.length}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 transition-all duration-500" style={{width: `${((currentStepIdx+1)/MAINTENANCE_STEPS.length)*100}%`}}></div>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 truncate">{currentStep.desc}</div>
                    </div>

                    <button 
                        onClick={nextStep}
                        disabled={currentStepIdx >= MAINTENANCE_STEPS.length - 1}
                        className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full shadow-[0_0_15px_rgba(8,145,178,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Play size={18} fill="currentColor" />
                    </button>
                </div>

            </div>
        </div>

        {/* RIGHT: Data & Schematics */}
        <div className="w-full lg:w-[420px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
            
            {/* Hydraulic Schematic (Simplified SVG) */}
            <SciFiCard title="液压系统拓扑 (P&ID)" subtitle="CIRCUIT A" className="h-[220px] border-cyan-900/50 bg-[#0b1221]" noPadding>
                <div className="w-full h-full p-4 relative flex items-center justify-center">
                    <svg viewBox="0 0 300 150" className="w-full h-full opacity-90">
                        {/* Pipes */}
                        <path d="M20,75 L80,75" stroke="#334155" strokeWidth="2" fill="none" />
                        <path d="M120,75 L200,75" stroke={currentState === 'FAULT_SYNC' ? '#ef4444' : '#334155'} strokeWidth="2" fill="none" strokeDasharray="4 2" className={currentState === 'FAULT_SYNC' ? 'animate-pulse' : ''} />
                        <path d="M200,75 L280,40" stroke="#334155" strokeWidth="2" fill="none" />
                        <path d="M200,75 L280,110" stroke="#334155" strokeWidth="2" fill="none" />

                        {/* Pump */}
                        <circle cx="100" cy="75" r="15" stroke="#0ea5e9" strokeWidth="2" fill="#0f172a" />
                        <text x="100" y="78" fontSize="8" fill="#0ea5e9" textAnchor="middle">PUMP</text>

                        {/* Valve Block (Fault Location) */}
                        <rect x="180" y="60" width="40" height="30" stroke={currentState === 'REPAIR_VALVE' ? '#facc15' : '#0ea5e9'} strokeWidth="2" fill="#0f172a" strokeDasharray={currentState === 'REPAIR_VALVE' ? '4 2' : '0'} />
                        <text x="200" y="78" fontSize="8" fill="white" textAnchor="middle">VALVE</text>

                        {/* Cylinders */}
                        <rect x="270" y="30" width="20" height="20" stroke="#94a3b8" fill="#1e293b" />
                        <rect x="270" y="100" width="20" height="20" stroke="#94a3b8" fill="#1e293b" />
                    </svg>
                    {currentState === 'FAULT_SYNC' && (
                        <div className="absolute top-[40%] left-[60%] bg-red-900/80 text-red-200 text-[10px] px-2 py-1 rounded border border-red-500 animate-bounce">
                            Internal Leakage
                        </div>
                    )}
                </div>
            </SciFiCard>

            {/* Sync Chart */}
            <SciFiCard title="双缸同步性分析" subtitle="DEVIATION" className="h-[200px] border-cyan-900/50" noPadding>
                <div className="w-full h-full p-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={GATE_SYNC_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="time" hide />
                            <YAxis domain={[-50, 50]} hide />
                            <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9'}} />
                            <ReferenceLine y={0} stroke="#334155" />
                            <Line type="monotone" dataKey="left" stroke="#ef4444" strokeWidth={2} dot={false} name="Left Gate" />
                            <Line type="monotone" dataKey="right" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Right Gate" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </SciFiCard>

            {/* Diagnostics Panel */}
            <SciFiCard title="系统自诊断报告" className="flex-1 border-cyan-900/50">
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center p-2 bg-slate-900/50 border border-slate-800 rounded">
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                            <Settings size={14} className="text-cyan-500" />
                            <span>Proportional Valve K1</span>
                        </div>
                        <span className={`text-[10px] px-1.5 rounded ${currentState === 'FAULT_SYNC' ? 'bg-red-900/30 text-red-400' : 'bg-green-900/20 text-green-400'}`}>
                            {currentState === 'FAULT_SYNC' ? 'ABNORMAL' : 'NORMAL'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-900/50 border border-slate-800 rounded">
                         <div className="flex items-center gap-2 text-xs text-slate-300">
                            <Gauge size={14} className="text-cyan-500" />
                            <span>System Pressure</span>
                        </div>
                        <span className="text-[10px] text-white font-mono">14.2 MPa</span>
                    </div>
                    
                    <div className="mt-2">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Operation Logs</div>
                        <div className="h-32 bg-black/40 rounded p-2 text-[10px] font-mono text-slate-400 overflow-y-auto custom-scrollbar border border-slate-800">
                            {logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
                        </div>
                    </div>
                </div>
            </SciFiCard>

        </div>

      </div>
    </div>
  );
};
