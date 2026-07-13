
import React, { useState, useEffect, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/ship-emergency/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-26]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-26';
import { EmergencyStep } from '../../components/maintenance/ship-emergency/three-types';
import { 
  ShieldAlert, Activity, Zap, Compass, 
  Wind, Clock, AlertTriangle, Play,
  RotateCcw, Info, ArrowRight, Gauge,
  Cpu, Thermometer, Droplets, UserCheck,
  LifeBuoy, Map, Siren, ChevronRight,
  Database, FileText, CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, BarChart, Bar, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// --- 模拟数据 ---
const POWER_FLOW_DATA = Array.from({length: 20}, (_, i) => ({
    time: i,
    main: 85 + Math.sin(i*0.5)*5,
    aux: 12 + Math.random()*2
}));

const FAULT_IMPACT = [
  { subject: '动力输出', A: 10, fullMark: 100 },
  { subject: '电网稳定', A: 35, fullMark: 100 },
  { subject: '操纵性', A: 20, fullMark: 100 },
  { subject: '通信保障', A: 85, fullMark: 100 },
  { subject: '火灾风险', A: 75, fullMark: 100 },
];

const EMERGENCY_PLAN_STEPS: { id: EmergencyStep; label: string; action: string; time: string }[] = [
  { id: 'STANDBY', label: '状态监视', action: '实时同步机舱遥测数据', time: 'LIVE' },
  { id: 'ALERT', label: '事故报警', action: '发生重大动力故障，启动应急广播', time: 'T+0' },
  { id: 'DIAGNOSIS', label: '远程评估', action: '启动数字孪生故障定位扫描', time: 'T+5m' },
  { id: 'ISOLATION', label: '风险阻断', action: '切断主油路，防止次生灾害', time: 'T+12m' },
  { id: 'REPAIR_PROCESS', label: '应急修复', action: '多工种协同更换关键损坏件', time: 'T+45m' },
  { id: 'SYNC_TEST', label: '联动验证', action: '恢复动力，验证全工况负载', time: 'T+80m' },
  { id: 'RECOVERED', label: '演练完成', action: '自动生成事故报告与日志归档', time: 'DONE' },
];

export const ShipEmergencyRepairSimView: React.FC = () => {
  const [stepIdx, setStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] 远洋指挥链路已建立...', '[Info] 船舶 IMO 9784311 处于正常巡航状态']);
  const [windowTime, setWindowTime] = useState(45); // 应急黄金窗口分钟

  const currentStep = EMERGENCY_PLAN_STEPS[stepIdx];

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  const handleNext = () => {
    if (stepIdx < EMERGENCY_PLAN_STEPS.length - 1) {
      setStepIdx(prev => prev + 1);
      addLog(`>>> 动作下达：${EMERGENCY_PLAN_STEPS[stepIdx+1].action}`);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#02040a] p-2 relative overflow-hidden">
      
      {/* 警报光效 */}
      {currentStep.id !== 'STANDBY' && currentStep.id !== 'RECOVERED' && (
        <div className="absolute inset-0 border-[20px] border-red-900/10 pointer-events-none z-50 animate-pulse shadow-[inset_0_0_100px_rgba(239,68,68,0.05)]"></div>
      )}

      {/* --- TOP HUD (Command Center) --- */}
      <div className="flex items-center justify-between z-10 bg-slate-900/60 border border-slate-800 p-4 rounded-lg backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-5">
          <div className={`w-12 h-12 rounded-sm flex items-center justify-center border-2 transition-all duration-500
            ${currentStep.id === 'STANDBY' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-red-500/20 border-red-500 text-red-500 animate-pulse'}
          `}>
             {currentStep.id === 'STANDBY' ? <LifeBuoy size={28} /> : <ShieldAlert size={28} />}
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               Vessel ID: IMO-9784311 / Tactical Command
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
               船舶关键设备 <span className={currentStep.id === 'STANDBY' ? 'text-cyan-500' : 'text-red-500'}>应急维修推演中心</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center h-12 border-l border-slate-800 pl-8">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold">黄金窗口期</div>
                <div className={`text-2xl font-mono font-black ${windowTime < 10 ? 'text-red-500 animate-bounce' : 'text-orange-400'}`}>
                    00:{windowTime.toString().padStart(2,'0')}:00
                </div>
            </div>
            <div className="flex flex-col justify-between h-full py-1">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${currentStep.id === 'STANDBY' ? 'bg-green-500' : 'bg-red-500 animate-ping'}`}></div>
                    <span className="text-[10px] font-mono">Satellite Link: Secure</span>
                </div>
                <div className="flex items-center gap-2 opacity-60">
                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                    <span className="text-[10px] font-mono">Expert AI Support: Ready</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Threat Assessment --- */}
        <div className="w-[320px] flex flex-col gap-4">
           
           <SciFiCard title="故障损害风险评估" subtitle="IMPACT MATRIX" className="h-1/2 border-slate-800">
               <div className="w-full h-full p-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={FAULT_IMPACT}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Status" dataKey="A" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.4} />
                        </RadarChart>
                    </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="全船能流分配" subtitle="POWER GRID" className="flex-1 border-slate-800">
                <div className="w-full h-full p-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={POWER_FLOW_DATA}>
                            <defs>
                                <linearGradient id="mainPwr" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="time" hide />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip contentStyle={{backgroundColor: '#0c0e14', border: '1px solid #334155'}} />
                            <Area type="monotone" dataKey="main" stroke="#0ea5e9" fill="url(#mainPwr)" strokeWidth={2} />
                            <Line type="monotone" dataKey="aux" stroke="#f59e0b" strokeWidth={1} dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
           </SciFiCard>

           <div className="h-[100px] bg-slate-900/40 border border-slate-800 rounded p-2 overflow-hidden flex flex-col shadow-inner">
               <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-1 flex items-center gap-2">
                   <Cpu size={12}/> 系统审计 (Audit Trail)
               </div>
               <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-1 mt-1 pr-1 custom-scrollbar">
                   {logs.map((log, i) => (
                       <div key={i} className="flex gap-2 animate-in slide-in-from-left-1">
                           <span className="text-cyan-600">[{i+1}]</span>
                           <span className="text-slate-400">{log}</span>
                       </div>
                   ))}
               </div>
           </div>
        </div>

        {/* --- CENTER: 3D Tactical Twin --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black/40 border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] group">
               {/* 3D Scene */}
               <ThreeScene step={currentStep.id} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Stage Information HUD */}
               <div className="absolute top-6 left-6 flex flex-col gap-4 pointer-events-none">
                   <div className={`bg-slate-950/80 backdrop-blur border p-4 rounded-sm flex flex-col border-l-4 transition-all duration-1000
                     ${currentStep.id === 'STANDBY' ? 'border-cyan-500/50' : 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]'}
                   `}>
                       <div className={`text-[10px] font-bold mb-1 uppercase tracking-widest ${currentStep.id === 'STANDBY' ? 'text-cyan-500' : 'text-red-500'}`}>
                          推演阶段: {currentStep.id}
                       </div>
                       <div className="text-2xl font-black text-white">
                          {currentStep.label}
                       </div>
                       <p className="text-[11px] text-slate-400 mt-2 max-w-[200px] leading-relaxed italic">
                           当前操作指引：{currentStep.action}
                       </p>
                   </div>
                   
                   {currentStep.id !== 'STANDBY' && (
                     <div className="bg-slate-950/80 backdrop-blur border border-orange-500/30 p-3 rounded-sm flex flex-col animate-in fade-in slide-in-from-left-2">
                        <div className="text-[10px] text-orange-400 font-bold mb-2 uppercase tracking-widest flex items-center gap-2">
                            <Gauge size={10}/> 实时动力学参数
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px] font-bold text-white">
                           <span className="text-slate-500">机油压:</span> <span className="text-red-400">0.08 MPa</span>
                           <span className="text-slate-500">主轴转速:</span> 12.0 RPM
                           <span className="text-slate-500">燃油漏率:</span> 15.2 L/m
                        </div>
                     </div>
                   )}
               </div>

               {/* Center Action Scrubber */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] bg-slate-950/90 p-4 rounded-full border border-slate-700 shadow-2xl flex items-center gap-6 backdrop-blur-xl">
                   <button 
                     onClick={() => {setStepIdx(0); addLog('重新启动应急演练流程');}}
                     className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full border border-slate-700 transition-all hover:rotate-[-180deg]"
                   >
                       <RotateCcw size={20} />
                   </button>
                   
                   <div className="flex-1 flex justify-between px-4 relative items-center h-10">
                       <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-800 -translate-y-1/2"></div>
                       {EMERGENCY_PLAN_STEPS.map((s, idx) => (
                           <div 
                             key={s.id} 
                             onClick={() => {setStepIdx(idx); addLog(`手动跳转推演节点: ${s.label}`);}}
                             className={`relative z-10 w-4 h-4 rounded-full cursor-pointer transition-all border-2
                                ${idx <= stepIdx ? 'bg-orange-500 border-white scale-125' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}
                             `}
                           >
                               {idx === stepIdx && (
                                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-orange-500 text-black px-2 py-0.5 rounded text-[8px] font-black uppercase whitespace-nowrap">
                                       {s.time}
                                   </div>
                               )}
                           </div>
                       ))}
                   </div>

                   <button 
                     onClick={handleNext}
                     disabled={stepIdx === EMERGENCY_PLAN_STEPS.length - 1}
                     className="px-8 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-full shadow-lg shadow-orange-900/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                   >
                       <span className="tracking-widest uppercase">Next Directive</span>
                       <ArrowRight size={20} />
                   </button>
               </div>
           </div>

           {/* Emergency Map & Drift (Bottom Strip) */}
           <div className="h-[120px] flex gap-4">
               <div className="w-[220px] bg-slate-900/60 border border-slate-800 rounded-lg p-3 relative flex items-center justify-center overflow-hidden">
                   <Map className="text-slate-800 absolute scale-[4] opacity-20" />
                   <div className="relative z-10 text-center">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">漂移位置预测</div>
                       <div className="text-sm font-bold text-white">Zone C-12 / Reef Warning</div>
                       <div className="flex gap-2 justify-center mt-1">
                           <span className="text-[10px] text-red-400">Velocity: 1.2 kn</span>
                           <span className="text-[10px] text-blue-400">Current: NW</span>
                       </div>
                   </div>
               </div>
               
               <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex items-center gap-6">
                   <div className="flex flex-col">
                       <span className="text-[10px] text-slate-500 uppercase font-bold">船体稳定性状况</span>
                       <span className="text-xl font-mono font-bold text-green-400 tracking-tighter">STABLE (Tilt 1.2°)</span>
                   </div>
                   <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-green-600 to-green-400 w-[82%]"></div>
                   </div>
                   <div className="text-right">
                       <span className="text-[10px] text-slate-500 uppercase font-bold">黑启动就绪度</span>
                       <div className="text-xl font-mono font-bold text-white">45%</div>
                   </div>
               </div>
           </div>
        </div>

        {/* --- RIGHT: Resource & Support --- */}
        <div className="w-[300px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="应急小组分配" subtitle="PERSONNEL" className="border-slate-800">
               <div className="space-y-4 py-1">
                   {[
                       { label: '机舱抢修组 (Eng A)', val: 85, status: 'Active' },
                       { label: '电力调度组 (Elec B)', val: 100, status: 'Standby' },
                       { label: '消防监护组 (Fire C)', val: 100, status: 'Ready' },
                   ].map((item, i) => (
                       <div key={i} className="group">
                           <div className="flex justify-between items-center text-[11px] mb-1.5">
                               <span className="text-slate-300 group-hover:text-orange-400 transition-colors">{item.label}</span>
                               <span className={`font-mono text-[10px] ${item.val < 30 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>{item.val}%</span>
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                               <div className={`h-full transition-all duration-1000 ${item.val < 30 ? 'bg-red-500' : 'bg-orange-500'}`} style={{width: `${item.val}%`}}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="专家策略推荐" subtitle="AI INSIGHTS" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-orange-950/20 border border-orange-900/30 rounded">
                       <div className="flex items-center gap-2 mb-2">
                           <AlertTriangle size={14} className="text-orange-500" />
                           <span className="text-xs font-bold text-orange-200">关键建议</span>
                       </div>
                       <p className="text-[11px] text-slate-400 leading-relaxed italic">
                          "基于历史同型号主机爆缸案例分析，建议在执行应急修复前先启动辅机并网，以保障备用舵机的液压油压，防止船舶在大风浪下失控。"
                       </p>
                   </div>

                   <div className="space-y-2">
                      <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-1 flex items-center gap-2">
                          <FileText size={12}/> 关联预案库
                      </div>
                      <div className="flex flex-col gap-2">
                          {['ERP-04: 主机失速处置', 'ERP-09: 燃油泄漏防护', 'SOP-22: 紧急黑启动'].map(plan => (
                              <div key={plan} className="p-2 bg-slate-900/60 hover:bg-slate-800 rounded border border-slate-800 flex items-center justify-between group cursor-pointer transition-all">
                                  <span className="text-[10px] text-slate-300 group-hover:text-white">{plan}</span>
                                  <ChevronRight size={12} className="text-slate-600 group-hover:text-orange-500" />
                              </div>
                          ))}
                      </div>
                   </div>

                   <div className="mt-auto p-3 bg-blue-900/10 border border-blue-900/30 rounded flex items-center justify-between">
                       <div className="flex items-center gap-2">
                           <CheckCircle2 size={16} className="text-green-500" />
                           <span className="text-xs text-blue-200">推演一致性校验</span>
                       </div>
                       <span className="text-xs font-bold text-white">98.5%</span>
                   </div>
               </div>
           </SciFiCard>

           <button className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/30 animate-pulse">
               <Siren size={18} /> 提交最终指令集
           </button>
        </div>

      </div>
    </div>
  );
};

function PauseIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
    );
}
