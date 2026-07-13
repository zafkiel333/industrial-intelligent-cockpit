
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/gate-hoist/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-03]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-03';
import { GateSimState } from '../../components/maintenance/gate-hoist/three-types';
import { 
  Activity, AlertTriangle, Anchor, ArrowRight, 
  CheckCircle2, ChevronRight, ClipboardList, 
  Gauge, Hammer, Microscope, Play, RefreshCw, 
  Scan, Settings, ShieldAlert, Thermometer, Zap 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell
} from 'recharts';

// --- MOCK DATA ---
const STRESS_DATA_NORMAL = Array.from({length: 20}, (_, i) => ({ time: i, stress: 120 + Math.random() * 10 }));
const STRESS_DATA_CRACK = Array.from({length: 20}, (_, i) => ({ 
  time: i, 
  stress: i > 15 ? 280 + Math.random() * 20 : 120 + Math.random() * 10 
}));

const CYLINDER_DATA = [
  { name: 'Piston A', pressure: 14.5, temp: 45 },
  { name: 'Piston B', pressure: 14.2, temp: 46 },
];

const WORKFLOW_STEPS: { id: GateSimState; label: string; desc: string }[] = [
  { id: 'MONITORING', label: '实时监测', desc: '全天候结构应力与振动监测' },
  { id: 'ALARM', label: '损伤预警', desc: 'AE声发射检测到支臂裂纹扩展信号' },
  { id: 'DRAIN', label: '排空隔离', desc: '放下检修门，排空流道水体' },
  { id: 'NDT', label: '无损探伤', desc: '主要焊缝相控阵超声波检测(PAUT)' },
  { id: 'WELDING', label: '补焊加固', desc: '碳弧气刨清根，多层多道焊接' },
  { id: 'TESTING', label: '功能试验', desc: '动水启闭试验与应力复测' },
];

export const GateHoistMaintenanceView: React.FC = () => {
  const [currentState, setCurrentState] = useState<GateSimState>('MONITORING');
  const [stressData, setStressData] = useState(STRESS_DATA_NORMAL);
  const [healthScore, setHealthScore] = useState(98);
  const [logs, setLogs] = useState<string[]>(['[SYS] 监测系统就绪，传感器在线...']);

  // Simulation Logic
  useEffect(() => {
    let timer: any;
    if (currentState === 'MONITORING') {
      setStressData(STRESS_DATA_NORMAL);
      setHealthScore(98);
    } else if (currentState === 'ALARM') {
      setStressData(STRESS_DATA_CRACK);
      setHealthScore(65);
      addLog('!! 警报：右侧支臂检测到应力突变 (285MPa)');
      addLog('!! 警报：声发射信号活跃度高');
    } else if (currentState === 'WELDING') {
      addLog('>> 启动自动焊接机器人，执行修复程序...');
    } else if (currentState === 'TESTING') {
      setStressData(STRESS_DATA_NORMAL);
      setHealthScore(95);
      addLog('>> 修复完成，应力水平回归正常范围');
    }
    return () => clearTimeout(timer);
  }, [currentState]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 5)]);
  };

  const advanceState = () => {
    const idx = WORKFLOW_STEPS.findIndex(s => s.id === currentState);
    if (idx < WORKFLOW_STEPS.length - 1) {
      setCurrentState(WORKFLOW_STEPS[idx + 1].id);
    } else {
      setCurrentState('MONITORING'); // Reset
      addLog('流程重置，返回监测状态');
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#0f172a]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between bg-slate-900/80 border-b-2 border-orange-500/50 p-4 rounded-t-lg">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-400 mb-1 uppercase tracking-wider">
             <Anchor size={14} /> Structural Health Monitoring (SHM)
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             弧形闸门启闭机 <span className="text-orange-500">结构损伤模拟维修</span>
          </h1>
        </div>
        
        <div className="flex gap-6">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">System Status</div>
                <div className={`text-2xl font-bold ${currentState === 'ALARM' ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {currentState}
                </div>
            </div>
            <div className="text-right border-l border-slate-700 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Health Score</div>
                <div className={`text-2xl font-mono font-bold ${healthScore < 80 ? 'text-red-500' : 'text-green-400'}`}>
                    {healthScore}
                </div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          
          {/* LEFT COLUMN: 3D Visualization */}
          <div className="col-span-8 flex flex-col gap-4 relative">
              <div className="flex-1 bg-black/40 border border-slate-700 rounded-lg overflow-hidden relative shadow-inner">
                  {/* Overlay HUD */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                      <div className="bg-slate-900/80 backdrop-blur border border-orange-500/30 p-2 rounded w-48">
                          <div className="text-[10px] text-orange-400 font-bold mb-1 flex items-center gap-2">
                              <Activity size={12}/> VIBRATION SPECTRUM
                          </div>
                          <div className="h-12 flex items-end gap-1">
                              {[30, 50, 20, 70, 40, 60, 30, 80, 45, 20].map((h, i) => (
                                  <div key={i} className="flex-1 bg-orange-500/50" style={{height: `${h}%`}}></div>
                              ))}
                          </div>
                      </div>
                  </div>

                  <ThreeScene state={currentState} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
                  
                  {/* Bottom Control Bar */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-600 shadow-xl">
                      {WORKFLOW_STEPS.map((step, i) => {
                          const isActive = step.id === currentState;
                          const isPast = WORKFLOW_STEPS.findIndex(s => s.id === currentState) > i;
                          return (
                              <div key={step.id} className="flex items-center">
                                  <div className={`
                                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                      ${isActive ? 'bg-orange-500 text-black scale-110 shadow-[0_0_10px_orange]' : 
                                        isPast ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-slate-800 text-slate-500 border border-slate-700'}
                                  `}>
                                      {i + 1}
                                  </div>
                                  {i < WORKFLOW_STEPS.length - 1 && <div className="w-4 h-0.5 bg-slate-700 mx-1"></div>}
                              </div>
                          );
                      })}
                      <div className="w-[1px] h-6 bg-slate-600 mx-2"></div>
                      <button 
                        onClick={advanceState}
                        className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold transition-colors"
                      >
                          {currentState === 'TESTING' ? <RefreshCw size={14}/> : <Play size={14}/>}
                          {currentState === 'TESTING' ? 'RESET' : 'NEXT STEP'}
                      </button>
                  </div>
              </div>

              {/* Log Console */}
              <div className="h-32 bg-black/60 border border-slate-700 rounded-lg p-3 font-mono text-xs overflow-y-auto">
                  {logs.map((log, i) => (
                      <div key={i} className="mb-1 border-l-2 border-orange-500 pl-2 text-slate-300">
                          {log}
                      </div>
                  ))}
              </div>
          </div>

          {/* RIGHT COLUMN: Data & Analysis */}
          <div className="col-span-4 flex flex-col gap-4">
              
              {/* Stress Analysis */}
              <SciFiCard title="结构应力矩阵 (Stress Matrix)" subtitle="MPa" className="h-64 border-orange-900/50">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stressData}>
                              <defs>
                                  <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                              <XAxis dataKey="time" hide />
                              <YAxis stroke="#94a3b8" tick={{fontSize: 10}} domain={[0, 350]} />
                              <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#f97316'}} />
                              <ReferenceLine y={250} stroke="red" strokeDasharray="3 3" label={{value: 'Yield Limit', fill: 'red', fontSize: 10}} />
                              <Area type="monotone" dataKey="stress" stroke="#f97316" fill="url(#colorStress)" isAnimationActive={true} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              {/* Hydraulic Telemetry */}
              <SciFiCard title="液压启闭机遥测" subtitle="CYLINDER" className="border-slate-700">
                  <div className="space-y-4">
                      {CYLINDER_DATA.map((cyl, i) => (
                          <div key={i} className="bg-slate-900/50 p-3 rounded border border-slate-800">
                              <div className="flex justify-between mb-2">
                                  <span className="text-xs font-bold text-white flex items-center gap-2">
                                      <Settings size={12} className="text-blue-400"/> {cyl.name}
                                  </span>
                                  <span className="text-[10px] text-green-400 bg-green-900/20 px-1 rounded">NORMAL</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col">
                                      <span className="text-[10px] text-slate-500">Pressure</span>
                                      <span className="text-lg font-mono text-white">{cyl.pressure} <span className="text-xs text-slate-500">MPa</span></span>
                                  </div>
                                  <div className="flex flex-col">
                                      <span className="text-[10px] text-slate-500">Temp</span>
                                      <span className="text-lg font-mono text-white">{cyl.temp} <span className="text-xs text-slate-500">°C</span></span>
                                  </div>
                              </div>
                              <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                                  <div className="bg-blue-500 h-full" style={{width: `${(cyl.pressure/20)*100}%`}}></div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* Current Task Info */}
              <SciFiCard title="当前作业详情" className="flex-1 border-slate-700">
                  <div className="flex flex-col h-full justify-between">
                      <div>
                          <h3 className="text-lg font-bold text-white mb-2">{WORKFLOW_STEPS.find(s => s.id === currentState)?.label}</h3>
                          <p className="text-xs text-slate-400 leading-relaxed">
                              {WORKFLOW_STEPS.find(s => s.id === currentState)?.desc}
                          </p>
                      </div>
                      
                      <div className="p-3 bg-orange-900/10 border border-orange-900/30 rounded flex items-start gap-3 mt-4">
                          <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={16} />
                          <div>
                              <div className="text-xs font-bold text-orange-200">Safety Notice</div>
                              <div className="text-[10px] text-slate-400 mt-1">
                                  Lockout/Tagout (LOTO) procedure required before entering chamber. Verify hydraulic pressure release.
                              </div>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>
      </div>
    </div>
  );
};
