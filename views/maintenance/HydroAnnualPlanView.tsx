
import React, { useState, useEffect, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/hydro-annual-plan/ThreeScene';
import { AnnualSimState, UnitStatus } from '../../components/maintenance/hydro-annual-plan/three-types';
import { 
  Calendar, Zap, TrendingUp, Users, Wrench, ShieldCheck, 
  BarChart4, Clock, Activity, AlertTriangle, ArrowRight,
  Maximize2, Database, Layers, Play, Save, RefreshCw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  BarChart, Bar, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Legend, LineChart, Line, ReferenceLine
} from 'recharts';

// --- 模拟方案数据 ---
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

export const HydroAnnualPlanView: React.FC = () => {
  const [activeMonthIdx, setActiveMonthIdx] = useState(4); // 默认选中5月
  const [simMode, setSimMode] = useState<'BASE' | 'OPTIMIZED'>('BASE');
  const [logs, setLogs] = useState<string[]>(['[System] 年度检修智能调度引擎就绪', '[System] 已载入2024年度典型来水模型']);

  const currentMonthData = ANNUAL_PLAN_DATA[activeMonthIdx];

  // 映射到3D状态
  const simState: AnnualSimState = useMemo(() => {
    const units: UnitStatus[] = [
      { id: 1, mode: currentMonthData.g1 as any, progress: 45 },
      { id: 2, mode: currentMonthData.g2 as any, progress: 0 },
      { id: 3, mode: currentMonthData.g3 as any, progress: 0 },
      { id: 4, mode: currentMonthData.g4 as any, progress: 0 },
    ];
    // 5-9月水位高
    const waterLevel = (currentMonthData.flow / 8200) * 100;
    return { month: activeMonthIdx + 1, units, waterLevel };
  }, [activeMonthIdx, currentMonthData]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 relative overflow-hidden">
      {/* 装饰背景 */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-cyan-900/30 p-4 rounded-lg backdrop-blur-md z-10">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-cyan-600/20 border border-cyan-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)]">
             <Calendar size={28} className="text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-cyan-400 mb-0.5 uppercase tracking-[0.2em] font-bold">
               Strategic Asset Management System
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               水电站年度检修 <span className="text-cyan-500 italic">方案模拟与优化</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-4">
             <div className="bg-slate-800/50 border border-slate-700 rounded px-4 py-2 flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase font-bold">全站可用率 (YTD)</span>
                <span className="text-2xl font-mono font-bold text-green-400">94.2%</span>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded px-4 py-2 flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase font-bold">预计弃水损失</span>
                <span className="text-2xl font-mono font-bold text-red-400">125 <span className="text-sm">万kWh</span></span>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Annual Gantt & Month Selector --- */}
        <div className="w-full lg:w-[350px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
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

           <SciFiCard title="当前月份策略建议" className="border-slate-800">
               <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded">
                  <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={16} className="text-blue-400" />
                      <span className="text-xs font-bold text-blue-200">优化提示 (Optimization)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                      {activeMonthIdx >= 4 && activeMonthIdx <= 7 ? 
                        "当前处于丰水期，建议缩短检修工期，或将主要任务提前至4月枯水期末段执行，以减少溢流弃水损失。" : 
                        "当前来水量较小，适合执行机组大修任务。建议优先完成G2机组的技术改造，提升整体水能利用率。"}
                  </p>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Strategic Twin --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black/40 border border-cyan-900/20 rounded-lg overflow-hidden relative shadow-inner group">
               {/* HUD Overlay */}
               <div className="absolute top-6 left-6 z-20 flex flex-col gap-3">
                   <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-3 rounded flex flex-col">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest">Active Month Focus</div>
                       <div className="text-2xl font-black text-white">{currentMonthData.month} <span className="text-sm font-normal text-slate-500">Operation Profile</span></div>
                   </div>
               </div>

               <ThreeScene state={simState} />

               {/* Center Simulation Status */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-700 shadow-2xl scale-110">
                   <div className="flex items-center px-4 gap-4">
                       <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full bg-green-500"></div>
                           <span className="text-[10px] font-bold text-slate-300 uppercase">Running</span>
                       </div>
                       <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
                           <span className="text-[10px] font-bold text-slate-300 uppercase">Overhaul</span>
                       </div>
                   </div>
                   <div className="w-[1px] h-8 bg-slate-700 mx-2"></div>
                   <button 
                     onClick={() => addLog('执行场景推演同步...')}
                     className="px-8 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-full shadow-lg shadow-cyan-900/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                   >
                       <Play size={18} fill="currentColor" />
                       运行模拟 (SIMULATE)
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
                       {/* Highlight current month */}
                       {/* Added missing ReferenceLine import from recharts to fix the error on line 206. */}
                       <ReferenceLine x={currentMonthData.month} stroke="#f97316" strokeDasharray="5 5" label={{value: 'Focus', fill: '#f97316', fontSize: 10}} />
                   </AreaChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* --- RIGHT: Optimization Analytics --- */}
        <div className="w-full lg:w-[380px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="资源负载均衡分析" subtitle="RESOURCES" className="h-[280px] border-cyan-900/40">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RESOURCE_LOAD}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Usage" dataKey="value" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#0ea5e9'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="方案对比效益 (Benchmark)" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-4">
                   <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded border border-slate-800 group hover:border-cyan-500/30 transition-all cursor-pointer">
                       <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center text-slate-500">A</div>
                           <div>
                               <div className="text-xs font-bold text-white">基准方案 (Baseline)</div>
                               <div className="text-[10px] text-slate-500">常规工期排布，满足规范最低要求</div>
                           </div>
                       </div>
                       <div className="text-right">
                           <div className="text-sm font-bold text-slate-300">124 days</div>
                           <div className="text-[9px] text-slate-500">TOTAL DOWNTIME</div>
                       </div>
                   </div>

                   <div className={`flex justify-between items-center p-3 rounded border transition-all cursor-pointer
                       ${simMode === 'OPTIMIZED' ? 'bg-cyan-900/20 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-slate-900/60 border-slate-800'}
                   `} onClick={() => {setSimMode('OPTIMIZED'); addLog('启动AI方案优化算法...');}}>
                       <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded flex items-center justify-center ${simMode === 'OPTIMIZED' ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-cyan-500'}`}>B</div>
                           <div>
                               <div className="text-xs font-bold text-white">AI 优化方案 (Hybrid)</div>
                               <div className="text-[10px] text-cyan-600 font-bold">推荐方案：并行检修 + 错峰调度</div>
                           </div>
                       </div>
                       <div className="text-right">
                           <div className="text-sm font-bold text-green-400">105 days</div>
                           <div className="text-[9px] text-green-600 font-bold">-15.3% TIME</div>
                       </div>
                   </div>

                   <div className="space-y-3 mt-2 border-t border-slate-800 pt-4">
                       <div className="flex justify-between text-xs">
                           <span className="text-slate-500">工序冲突风险</span>
                           <span className="text-green-400 font-bold">LOW</span>
                       </div>
                       <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="bg-green-500 h-full w-[20%]"></div>
                       </div>
                       
                       <div className="flex justify-between text-xs mt-3">
                           <span className="text-slate-500">备件周转效率</span>
                           <span className="text-cyan-400 font-bold">85%</span>
                       </div>
                       <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="bg-cyan-500 h-full w-[85%] shadow-[0_0_10px_cyan]"></div>
                       </div>
                   </div>
                   
                   <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all mt-2">
                       <Save size={14} /> 保存优化后的年度计划
                   </button>
               </div>
           </SciFiCard>

           {/* Event Log Terminal */}
           <div className="h-32 bg-[#020617] border border-slate-800 rounded-lg p-3 font-mono text-[10px] overflow-y-auto custom-scrollbar shadow-lg">
               {logs.map((log, i) => (
                   <div key={i} className="mb-1 border-l-2 border-cyan-800 pl-2 text-slate-500 hover:text-cyan-300 transition-colors">
                       {log}
                   </div>
               ))}
               <div className="text-cyan-500 mt-2 animate-pulse">_</div>
           </div>
        </div>

      </div>
    </div>
  );
};
