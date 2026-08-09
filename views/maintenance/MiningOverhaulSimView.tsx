import React, { useState, useEffect, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/mining-overhaul/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-24]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-24';
import { OverhaulStep } from '../../components/maintenance/mining-overhaul/three-types';
// Added missing types from hydro-annual-plan as the component logic reuses them
import { AnnualSimState, UnitStatus } from '../../components/maintenance/hydro-annual-plan/three-types';
import { 
  Wrench, Activity, AlertTriangle, ShieldCheck, 
  Settings, Clock, Zap, Target, 
  BarChart3, Database, ClipboardList, Play,
  RotateCcw, Info, ArrowRight, Gauge, 
  Cpu, HardDrive, DollarSign, Users, Scale, Save,
  TrendingUp, FileText
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, Legend, Cell,
  ReferenceLine
} from 'recharts';

// --- 模拟方案数据 ---
const FEASIBILITY_KPI = [
  { subject: '工序可行性', A: 85, fullMark: 100 },
  { subject: '资源保障率', A: 92, fullMark: 100 },
  { subject: '风险受控度', A: 78, fullMark: 100 },
  { subject: '经济效益比', A: 88, fullMark: 100 },
  { subject: '工期可靠性', A: 95, fullMark: 100 },
];

const ANNUAL_PLAN_DATA = [
  { month: '1月', g1: 'RUNNING', g2: 'RUNNING', g3: 'RUNNING', g4: 'RUNNING', flow: 1200 },
  { month: '2月', g1: 'MAINTENANCE', g2: 'RUNNING', g3: 'RUNNING', g4: 'RUNNING', flow: 1100 },
  { month: '3月', g1: 'MAINTENANCE', g2: 'RUNNING', g3: 'RUNNING', g4: 'RUNNING', flow: 1400 },
  { month: '4月', g1: 'RUNNING', g2: 'RUNNING', g3: 'MAINTENANCE', g4: 'RUNNING', flow: 2500 },
  { month: '5月', g1: 'RUNNING', g2: 'RUNNING', g3: 'MAINTENANCE', g4: 'RUNNING', flow: 4500 }, // 丰水期
  { month: '6月', g1: 'RUNNING', g2: 'RUNNING', g3: 'RUNNING', g4: 'RUNNING', flow: 6800 },
  { month: '7月', g1: 'RUNNING', g2: 'RUNNING', g3: 'RUNNING', g4: 'RUNNING', flow: 8200 },
  { month: '8月', g1: 'RUNNING', g2: 'MAINTENANCE', g3: 'RUNNING', g4: 'RUNNING', flow: 7500 },
  { month: '9月', g1: 'RUNNING', g2: 'MAINTENANCE', g3: 'RUNNING', g4: 'RUNNING', flow: 5000 },
  { month: '10月', g1: 'RUNNING', g2: 'RUNNING', g3: 'RUNNING', g4: 'RUNNING', flow: 3200 },
  { month: '11月', g1: 'RUNNING', g2: 'RUNNING', g3: 'RUNNING', g4: 'MAINTENANCE', flow: 2100 },
  { month: '12月', g1: 'RUNNING', g2: 'RUNNING', g3: 'RUNNING', g4: 'MAINTENANCE', flow: 1500 },
];

const RESOURCE_LOAD = [
  { name: '机械班', value: 85, fullMark: 100 },
  { name: '电气班', value: 92, fullMark: 100 },
  { name: '保护班', value: 65, fullMark: 100 },
  { name: '起重工', value: 40, fullMark: 100 },
  { name: '外协团队', value: 75, fullMark: 100 },
];

const SIM_PHASES: { id: OverhaulStep; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'INITIAL', label: '方案概览', icon: <Database size={16}/>, desc: '载入设备档案与检修历史数据。' },
  { id: 'SCAN', label: '数字孪生', icon: <Activity size={16}/>, desc: '3D数字化实测，建立高精度损伤模型。' },
  { id: 'EXPLODE', label: '解体推演', icon: <LayersIcon size={16}/>, desc: '模拟机械拆解顺序，识别物理干涉。' },
  { id: 'REPLACE', label: '修复换新', icon: <Wrench size={16}/>, desc: '核心件再制造及备件更换方案推演。' },
  { id: 'ASSEMBLY', label: '逆向重组', icon: <Settings size={16}/>, desc: '基于激光对中的精密重组时序模拟。' },
  { id: 'VALIDATION', label: '综合评估', icon: <ShieldCheck size={16}/>, desc: '方案可行性终评与数字签认。' },
];

function LayersIcon(props: any) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m2.2 12.91 8.94 4.07a2 2 0 0 0 1.71 0l8.94-4.07"/><path d="m2.2 17.91 8.94 4.07a2 2 0 0 0 1.71 0l8.94-4.07"/></svg>;
}

export const MiningOverhaulSimView: React.FC = () => {
  // Component State
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [strategy, setStrategy] = useState<'STANDARD' | 'OPTIMIZED' | 'URGENT'>('STANDARD');
  const [logs, setLogs] = useState<string[]>(['[System] 大修决策推演引擎已启动...', '[Info] 已载入 ZY-450 大型矿车档案']);
  
  const [activeMonthIdx, setActiveMonthIdx] = useState(4); 
  const [simMode, setSimMode] = useState<'BASE' | 'OPTIMIZED'>('BASE');

  // Computed Values
  const currentStep = SIM_PHASES[activeStepIdx];
  const currentMonthData = useMemo(() => ANNUAL_PLAN_DATA[activeMonthIdx], [activeMonthIdx]);

  // Map to 3D state - used by ThreeScene component
  const simState: AnnualSimState = useMemo(() => {
    const units: UnitStatus[] = [
      { id: 1, mode: currentMonthData.g1 as any, progress: 45 },
      { id: 2, mode: currentMonthData.g2 as any, progress: 0 },
      { id: 3, mode: currentMonthData.g3 as any, progress: 0 },
      { id: 4, mode: currentMonthData.g4 as any, progress: 0 },
    ];
    // Scale water level for visual effect based on flow
    const waterLevel = (currentMonthData.flow / 8200) * 100;
    return { month: activeMonthIdx + 1, units, waterLevel };
  }, [activeMonthIdx, currentMonthData]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 8)]);
  };

  const nextStep = () => {
    if (activeStepIdx < SIM_PHASES.length - 1) {
      setActiveStepIdx(prev => prev + 1);
      addLog(`>>> 进入推演阶段: ${SIM_PHASES[activeStepIdx + 1].label}`);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#02040a] p-2 relative overflow-hidden">
      
      {/* 科技背景层 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_20%_30%,_#f59e0b_0%,_transparent_50%)]"></div>

      {/* --- TOP HUD (Header) --- */}
      <div className="flex items-stretch gap-4 z-10">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg flex items-center gap-5 backdrop-blur-xl flex-1 shadow-2xl">
          <div className="w-16 h-16 bg-amber-600/20 border-2 border-amber-500 rounded flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-amber-500/10 animate-pulse"></div>
             <Settings size={32} className="text-amber-400 relative z-10" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[10px] text-amber-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <ShieldCheck size={12} /> Strategic Overhaul Simulator
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
               矿山巨兽 <span className="text-amber-500">大修可行性推演中心</span>
            </h1>
          </div>
          <div className="flex gap-10 border-l border-slate-800 pl-8 h-12 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">仿真可靠度</div>
                <div className="text-2xl font-mono font-black text-cyan-400">98.5<span className="text-sm font-normal text-slate-600">%</span></div>
             </div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">方案ID</div>
                <div className="text-xl font-mono text-white">OH-MS-2024-X4</div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Configuration & Strategy --- */}
        <div className="w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="方案策略配置" subtitle="STRATEGIES" className="border-slate-800 bg-[#0c0e14]/90">
              <div className="flex flex-col gap-3 mt-2">
                 {[
                   { id: 'STANDARD', label: '标准均衡型', cost: '124.5', time: '25d', risk: 'LOW', icon: <Scale size={14}/> },
                   { id: 'OPTIMIZED', label: 'AI 优化型', cost: '145.2', time: '18d', risk: 'MED', icon: <Zap size={14}/> },
                   { id: 'URGENT', label: '快速周转型', cost: '210.0', time: '12d', risk: 'HIGH', icon: <Clock size={14}/> },
                 ].map((s) => (
                    <div 
                      key={s.id}
                      onClick={() => { setStrategy(s.id as any); addLog(`切换至 ${s.label} 模拟路径`); }}
                      className={`p-3 rounded border cursor-pointer transition-all group relative overflow-hidden
                        ${strategy === s.id ? 'bg-amber-900/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'bg-slate-900/40 border-slate-800 text-slate-500'}
                      `}
                    >
                        {strategy === s.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>}
                        
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-sm font-bold flex items-center gap-2">
                             {s.icon} {s.label}
                           </span>
                           {strategy === s.id && <span className="text-[8px] bg-amber-500 text-black px-1.5 font-black rounded-sm uppercase tracking-widest">Selected</span>}
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[9px] font-mono opacity-80 uppercase">
                            <div className="flex flex-col"><span className="text-slate-600">Cost</span> <span className="text-white">¥{s.cost}W</span></div>
                            <div className="flex flex-col"><span className="text-slate-600">Time</span> <span className="text-white">{s.time}</span></div>
                            <div className="flex flex-col items-end"><span className="text-slate-600">Risk</span> <span className={s.risk === 'HIGH' ? 'text-red-500' : 'text-green-500'}>{s.risk}</span></div>
                        </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="年度检修时序图" subtitle="GANTT VIEW" className="flex-1 border-cyan-900/40">
              <div className="space-y-1 mt-2">
                 <div className="flex text-[10px] text-slate-500 uppercase font-bold mb-2 px-2">
                    <span className="w-12">Month</span>
                    <span className="flex-1 text-center">G1</span>
                    <span className="flex-1 text-center">G2</span>
                    <span className="flex-1 text-center">G3</span>
                    <span className="flex-1 text-center">G4</span>
                 </div>
                 <div className="space-y-1 h-[500px] overflow-y-auto custom-scrollbar pr-2">
                    {ANNUAL_PLAN_DATA.map((d, idx) => (
                        <div 
                          key={d.month} 
                          onClick={() => { setActiveMonthIdx(idx); addLog(`切换查看: ${d.month} 检修计划`); }}
                          className={`flex items-center p-2 rounded cursor-pointer transition-all border
                            ${activeMonthIdx === idx ? 'bg-cyan-900/30 border-cyan-500/50' : 'bg-slate-900/40 border-transparent hover:border-slate-700'}
                          `}
                        >
                           <span className="w-12 text-xs font-bold text-slate-300">{d.month}</span>
                           <div className="flex-1 flex gap-1 justify-center">
                              {[d.g1, d.g2, d.g3, d.g4].map((status, i) => (
                                 <div key={i} className={`flex-1 h-3 rounded-sm ${status === 'MAINTENANCE' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-slate-800'}`}></div>
                              ))}
                           </div>
                        </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Visualization & Action --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black/40 border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] group">
               {/* HUD: Phase Indicator */}
               <div className="absolute top-6 left-6 flex flex-col gap-4 pointer-events-none z-20">
                   <div className="bg-slate-950/80 backdrop-blur border border-amber-500/30 p-4 rounded-sm flex flex-col border-l-4">
                       <div className="text-[10px] text-amber-500 font-bold mb-1 uppercase tracking-widest">Active Sim Phase</div>
                       <div className="text-2xl font-black text-white">{currentStep.label}</div>
                       <p className="text-[11px] text-slate-400 max-w-[220px] mt-2 leading-relaxed">{currentStep.desc}</p>
                   </div>
                   
                   <div className="bg-slate-950/80 backdrop-blur border border-cyan-500/30 p-3 rounded-sm flex flex-col">
                       <div className="text-[10px] text-cyan-400 font-bold mb-2 uppercase tracking-widest flex items-center gap-2">
                           <Activity size={10}/> Dynamic Telemetry
                       </div>
                       <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px] font-bold text-white">
                          <span className="text-slate-500">STRESS:</span> <span className="text-green-400">NOMINAL</span>
                          <span className="text-slate-500">LOAD:</span> 142.5 t
                          <span className="text-slate-500">ALIGN:</span> 0.02 mm
                       </div>
                   </div>
               </div>

               {/* 3D Scene */}
               <ThreeScene step={currentStep.id} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Bottom Floating Scrubber */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-slate-950/90 p-4 rounded-full border border-slate-700 shadow-2xl flex items-center gap-6 backdrop-blur-xl z-20">
                   <button 
                     onClick={() => {setActiveStepIdx(0); addLog('重新启动方案模拟程序');}}
                     className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full border border-slate-700 transition-all hover:rotate-[-180deg] duration-500"
                   >
                       <RotateCcw size={20} />
                   </button>
                   
                   <div className="flex-1 flex justify-between px-6 relative h-10 items-center">
                       <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-slate-800 -translate-y-1/2"></div>
                       {SIM_PHASES.map((s, idx) => (
                           <div 
                             key={s.id} 
                             onClick={() => {setActiveStepIdx(idx); addLog(`手动跳转: ${s.label}`);}}
                             className={`relative z-10 w-4 h-4 rounded-full cursor-pointer transition-all border-2
                                ${idx <= activeStepIdx ? 'bg-amber-500 border-white scale-125' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}
                             `}
                           >
                               {idx === activeStepIdx && (
                                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-2 py-0.5 rounded text-[8px] font-black uppercase whitespace-nowrap">
                                       {s.id}
                                   </div>
                               )}
                           </div>
                       ))}
                   </div>

                   <button 
                     onClick={nextStep}
                     disabled={activeStepIdx === SIM_PHASES.length - 1}
                     className="px-8 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-full shadow-lg shadow-amber-900/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                   >
                       <span className="tracking-widest uppercase">Next Phase</span>
                       <ArrowRight size={20} />
                   </button>
               </div>
           </div>

           {/* Annual River Inflow Chart */}
           <div className="h-[220px] bg-slate-900/40 border border-slate-800 rounded-lg p-3 overflow-hidden">
               <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>典型水库来水量曲线 (Annual Reservoir Inflow)</span>
                   <span className="text-cyan-500">Units: m³/s</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={ANNUAL_PLAN_DATA}>
                       <defs>
                           <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                               <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                       <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 9000]} />
                       <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#0ea5e9'}} />
                       <Area type="monotone" dataKey="flow" stroke="#0ea5e9" fill="url(#flowGrad)" strokeWidth={3} />
                       {/* Highlight current month focus */}
                       <ReferenceLine x={currentMonthData.month} stroke="#f97316" strokeDasharray="5 5" label={{value: 'Focus', fill: '#f97316', fontSize: 10}} />
                   </AreaChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* --- RIGHT: KPI Analytics & Compliance --- */}
        <div className="w-[380px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="多维可行性评估" subtitle="KPI RADAR" className="h-[280px] border-slate-800">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="75%" data={FEASIBILITY_KPI}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Strategy" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.4} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0e14', borderColor: '#f59e0b'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="经济效益与风险分析" subtitle="ESTIMATION" className="border-slate-800">
               <div className="flex flex-col gap-5 py-1">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded">
                         <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                            <DollarSign size={10} className="text-amber-500"/> 预计总投入
                         </div>
                         <div className="text-2xl font-mono font-bold text-white">¥ 245.8 <span className="text-xs font-normal text-slate-600">万</span></div>
                      </div>
                      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded">
                         <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                            <TrendingUp size={10} className="text-green-500"/> 预期残值提升
                         </div>
                         <div className="text-2xl font-mono font-bold text-green-400">+32 <span className="text-sm font-normal text-slate-600">%</span></div>
                      </div>
                   </div>

                   <div className="space-y-4 px-1">
                      <div className="space-y-1">
                         <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400">方案执行风险系数</span>
                            <span className="text-yellow-400 font-bold">MEDIUM (0.42)</span>
                         </div>
                         <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500" style={{width: '42%'}}></div>
                         </div>
                      </div>

                      <div className="space-y-1">
                         <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400">技术人力匹配度</span>
                            <span className="text-cyan-400 font-bold">HIGH (95%)</span>
                         </div>
                         <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 w-[95%]" style={{boxShadow: '0 0 10px #0ea5e9'}}></div>
                         </div>
                      </div>
                   </div>
               </div>
           </SciFiCard>

           <div className="mt-auto space-y-3">
              <button className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black rounded text-sm flex items-center justify-center gap-2 group transition-all shadow-lg shadow-amber-900/20">
                  <Save size={16} /> 保存当前可行性推演报告
              </button>
              <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-sm flex items-center justify-center gap-2 transition-all border border-slate-700">
                  <FileText size={16} /> 导出至大修决策委员会
              </button>
           </div>

        </div>

      </div>
    </div>
  );
};
