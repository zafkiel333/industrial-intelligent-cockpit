import React, { useState, useEffect } from 'react';
import { AirCompressorThreeScene } from '../../../components/predictive/hydro-air-compressor/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-33]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-33';
import { CompressorPart } from '../../../components/predictive/hydro-air-compressor/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line, Legend, ComposedChart
} from 'recharts';
import { 
  ShieldCheck, Activity, Zap, TrendingUp, 
  AlertTriangle, Hammer, Gauge, Cpu, 
  Clock, Database, Droplets, Binary,
  ChevronRight, ArrowUpRight, Box, Settings,
  Layers, CheckCircle2, FileText, Scan, Crosshair,
  Thermometer, Wind, Filter
} from 'lucide-react';

// --- 模拟数据 ---

const COMPONENT_DATA: CompressorPart[] = [
  { id: 'air-end', name: '螺杆机头', health: 84, riskLevel: 'warning', temp: 82 },
  { id: 'oil-sep', name: '油气分离器', health: 42, riskLevel: 'critical', temp: 75 },
  { id: 'motor', name: '驱动电机', health: 95, riskLevel: 'normal', temp: 62 },
  { id: 'cooler', name: '热交换器', health: 76, riskLevel: 'warning', temp: 48 },
];

const OIL_QUALITY_RADAR = [
  { subject: '运动粘度', A: 95, fullMark: 100 },
  { subject: '酸值 (TAN)', A: 78, fullMark: 100 },
  { subject: '水分含量', A: 88, fullMark: 100 },
  { subject: '颗粒度 (NAS)', A: 62, fullMark: 100 },
  { subject: '抗氧化性', A: 80, fullMark: 100 },
];

const EFFICIENCY_TREND = Array.from({length: 30}, (_, i) => ({
  time: `T-${30-i}h`,
  eff: 88 - i * 0.1 + Math.random() * 2,
  energy: 6.2 + i * 0.05
}));

const RUL_PROJECTION = Array.from({length: 20}, (_, i) => ({
  day: `D+${i*2}`,
  sep_life: 85 * Math.exp(-i * 0.12),
  oil_life: 90 * Math.exp(-i * 0.05),
  limit: 30
}));

export const AirCompressorOilHealthView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>('oil-sep');
  const [viewMode, setViewMode] = useState<'standard' | 'xray' | 'thermal'>('standard');
  const [globalHealth, setGlobalHealth] = useState(82.4);

  useEffect(() => {
    const timer = setInterval(() => {
      setGlobalHealth(prev => prev + (Math.random()-0.5)*0.2);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const activeComp = COMPONENT_DATA.find(c => c.id === selectedId) || COMPONENT_DATA[0];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] bg-[#02040a] text-slate-100 p-2 overflow-y-auto custom-scrollbar">
      
      {/* 顶部：战略性能看板 */}
      <div className="flex justify-between items-end border-b border-cyan-900/40 pb-4 bg-gradient-to-r from-[#0c1a2e] to-transparent px-4">
        <div className="flex gap-6 items-center">
            <div className="p-4 bg-cyan-600/20 rounded-xl border border-cyan-500/50 shadow-[0_0_25px_rgba(56,189,248,0.3)]">
                <Wind size={32} className="text-cyan-400 animate-pulse" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-[0.2em] font-bold">
                    <Activity size={14} /> Fluid Thermal Systems & Strategic Reliability
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    空压机与油系统 <span className="text-cyan-400 italic text-shadow-glow">健康深度评估</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">系统等熵效率 (Isentropic)</div>
                <div className="text-3xl font-mono font-bold text-white tracking-tighter">
                    84.2 <span className="text-sm text-slate-500">%</span>
                </div>
            </div>
            <div className="h-12 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">平均故障间隔预测 (MTBF)</div>
                <div className="text-3xl font-mono font-bold text-cyan-400">4,120 <span className="text-sm">h</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-10">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-orange-400 mb-1">AI 预测风险级别</div>
                <div className="flex items-center gap-2 text-2xl font-bold text-white uppercase font-mono bg-red-900/20 px-3 py-1 rounded border border-red-500/30">
                    <AlertTriangle size={24} className="text-red-500 animate-bounce" /> LEVEL 3
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：部件透视与劣化排序 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           <SciFiCard title="核心组件健康评价" subtitle="DEGRADATION AUDIT" className="flex-1 border-cyan-900/50 bg-[#081224]/80">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {COMPONENT_DATA.map(comp => (
                       <div 
                         key={comp.id}
                         onClick={() => setSelectedId(comp.id)}
                         className={`p-3 rounded border transition-all cursor-pointer relative group overflow-hidden
                            ${selectedId === comp.id ? 'bg-cyan-950 border-cyan-500 shadow-lg scale-[1.02]' : 'bg-slate-900/40 border-slate-800 hover:border-cyan-500/40'}
                         `}
                       >
                           <div className="flex justify-between items-center mb-2">
                               <div className="flex items-center gap-2">
                                   <div className={`w-1.5 h-1.5 rounded-full ${comp.riskLevel === 'critical' ? 'bg-red-500 animate-ping' : 'bg-cyan-500'}`}></div>
                                   <span className="text-sm font-bold text-slate-100 group-hover:text-blue-300 transition-colors">{comp.name}</span>
                               </div>
                               <span className={`text-xs font-mono font-bold ${comp.health > 80 ? 'text-green-400' : 'text-red-500'}`}>
                                   {comp.health}%
                               </span>
                           </div>
                           <div className="flex justify-between items-center text-[9px] text-slate-500 uppercase tracking-widest">
                               <span className="flex items-center gap-1 font-mono"><Thermometer size={10}/> {comp.temp}°C</span>
                               <span className="font-bold opacity-60">Status: {comp.riskLevel}</span>
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                               <div className={`h-full ${comp.health > 80 ? 'bg-cyan-500' : 'bg-red-500'}`} style={{width: `${comp.health}%`}}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="润滑油液指纹特征" subtitle="FLUID ANALYTICS" className="h-[300px] border-cyan-900/50">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={OIL_QUALITY_RADAR}>
                           <PolarGrid stroke="#1e293b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <Radar name="Oil Condition" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D数字孪生与实时仿真 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口：全息场模式 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#0a1120] to-[#02040a] border border-cyan-800/40 relative rounded-2xl overflow-hidden shadow-[inset_0_0_100px_rgba(56,189,248,0.1)] group">
               
               {/* 视口 HUD 层 */}
               <div className="absolute top-6 left-6 z-10 pointer-events-none space-y-4">
                   <div className="bg-black/70 backdrop-blur-md border border-cyan-500/30 px-5 py-4 rounded-lg flex flex-col gap-3 shadow-2xl pointer-events-auto">
                       <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Binary size={14} /> Thermodynamic Digital Twin V2.5
                       </div>
                       <div className="flex items-center gap-10">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase mb-1">排气压力</div>
                               <div className="text-2xl font-mono font-bold text-white">0.72 <span className="text-xs">MPa</span></div>
                           </div>
                           <div className="w-[1px] h-10 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase mb-1">油气分离压差</div>
                               <div className="text-2xl font-mono font-bold text-red-400">0.15 <span className="text-xs">MPa</span></div>
                           </div>
                       </div>
                   </div>

                   <div className="flex gap-3 pointer-events-auto">
                        <div className="px-3 py-1 bg-blue-900/40 border border-blue-500/30 rounded text-[10px] text-blue-200 flex items-center gap-2">
                            <Zap size={12} className="animate-pulse" /> 功率平衡仿真中
                        </div>
                        <div className="px-3 py-1 bg-orange-900/40 border border-orange-500/30 rounded text-[10px] text-orange-200 flex items-center gap-2">
                            <Thermometer size={12} /> 排气口温度: 84.5°C
                        </div>
                   </div>
               </div>

               {/* 右侧：分析模式切换 */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-3 pointer-events-auto">
                   <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700 flex flex-col gap-2 shadow-2xl backdrop-blur">
                       <button 
                            onClick={() => setViewMode('standard')}
                            className={`p-3 rounded-lg transition-all ${viewMode === 'standard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'text-slate-500 hover:text-white'}`}
                       >
                           <Layers size={20} />
                       </button>
                       <button 
                            onClick={() => setViewMode('xray')}
                            className={`p-3 rounded-lg transition-all ${viewMode === 'xray' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'text-slate-500 hover:text-white'}`}
                       >
                           <Scan size={20} />
                       </button>
                       <button 
                            onClick={() => setViewMode('thermal')}
                            className={`p-3 rounded-lg transition-all ${viewMode === 'thermal' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'text-slate-500 hover:text-white'}`}
                       >
                           <Thermometer size={20} />
                       </button>
                   </div>
               </div>

               <AirCompressorThreeScene 
                   parts={COMPONENT_DATA}
                   motorRpm={2950}
                   airFlowIntensity={0.8}
                   oilCirculationSpeed={0.5}
                   compressionRatio={8.2}
                   viewMode={viewMode}
                   selectedId={selectedId}
                   onSelect={setSelectedId}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

               {/* 底部 HUD：异常部件锁定 */}
               <div className="absolute bottom-8 left-6 right-6 z-10 flex gap-4 pointer-events-none animate-in slide-in-from-bottom-6">
                    <div className={`flex-1 bg-black/60 backdrop-blur-md border-l-4 ${activeComp.riskLevel === 'critical' ? 'border-red-500' : 'border-blue-500'} p-4 rounded-r-lg flex justify-between items-center shadow-2xl`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${activeComp.riskLevel === 'critical' ? 'bg-red-950/40' : 'bg-blue-950/40'} rounded flex items-center justify-center`}>
                                {activeComp.riskLevel === 'critical' ? <AlertTriangle size={28} className="text-red-500 animate-pulse" /> : <Settings size={28} className="text-blue-500" />}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white uppercase tracking-widest mb-1">重点诊断对象：{activeComp.name}</div>
                                <div className={`text-[11px] ${activeComp.riskLevel === 'critical' ? 'text-red-400' : 'text-slate-400'} leading-tight`}>
                                    诊断：{activeComp.riskLevel === 'critical' ? '检测到滤芯表面存在油泥积聚，阻塞比达 1.45。建议立即停机清洗或更换。' : '系统运行平稳，当前健康状态良好。'}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-6">
                             <div className="text-right">
                                 <div className="text-[9px] text-slate-500 uppercase mb-1">当前健康值</div>
                                 <div className={`text-2xl font-mono font-bold ${activeComp.health < 60 ? 'text-red-400' : 'text-white'}`}>{activeComp.health}%</div>
                             </div>
                        </div>
                    </div>
               </div>
           </div>

           {/* 热动力效率曲线 */}
           <SciFiCard title="热动力循环效率分析" subtitle="EFFICIENCY TREND" className="h-[220px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4 flex gap-6">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={EFFICIENCY_TREND}>
                               <defs>
                                   <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="time" hide />
                               <YAxis domain={[80, 95]} stroke="#64748b" tick={{fontSize: 9}} />
                               <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#10b981'}} />
                               <Area type="monotone" dataKey="eff" stroke="#10b981" fill="url(#effGrad)" name="循环效率 %" isAnimationActive={false} />
                               <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={1} dot={false} name="能耗(kW)" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="w-48 border-l border-slate-800 pl-6 flex flex-col justify-center gap-3">
                        <div className="text-xs text-slate-400">
                            当前比功率: <span className="text-white font-bold font-mono">6.42 kW/m³</span>
                        </div>
                        <div className="text-xs text-slate-400">
                            异常能量损失: <span className="text-red-400 font-bold font-mono">4.5%</span>
                        </div>
                        <div className="text-[10px] text-slate-500 italic">
                            * 损失主要源于油分芯压差引起的内功率损耗。
                        </div>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* 右侧：预测寿命与决策引擎 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* RUL 预测曲线 */}
           <SciFiCard title="易损件剩余寿命预测 (RUL)" subtitle="LIFE PROJECTION" className="h-[300px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4 flex flex-col">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={RUL_PROJECTION}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 9}} />
                               <YAxis domain={[0, 100]} stroke="#64748b" tick={{fontSize: 9}} />
                               <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#3b82f6'}} />
                               <Legend wrapperStyle={{fontSize: '10px'}} />
                               <Line type="monotone" dataKey="sep_life" name="油分芯" stroke="#ef4444" strokeWidth={2} dot={{r: 4, fill: '#ef4444'}} />
                               <Line type="monotone" dataKey="oil_life" name="润滑油" stroke="#10b981" strokeWidth={2} dot={{r: 4, fill: '#10b981'}} />
                               <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="3 3" label={{value: '故障临界', fill: '#ef4444', fontSize: 10}} />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="mt-4 p-3 bg-red-900/10 border border-red-900/30 rounded flex justify-between items-center">
                        <div className="text-[10px] text-red-300 font-bold uppercase">预计故障发生时间</div>
                        <div className="text-lg font-mono font-bold text-red-500 flex items-center gap-1"><Clock size={16}/> 14d 08h</div>
                   </div>
               </div>
           </SciFiCard>

           {/* 智能维保决策建议 */}
           <SciFiCard title="AI 辅助维护建议" className="flex-1 border-cyan-900/50 bg-[#1a1c2e]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-4 bg-orange-950/30 border border-orange-500/40 rounded-xl flex items-start gap-3 shadow-inner">
                       <ShieldCheck className="text-green-500 shrink-0 mt-1" size={24} />
                       <div>
                           <div className="text-sm font-bold text-white uppercase tracking-wider">劣化对冲策略建议</div>
                           <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                               检测到油气分离系统阻力异常增加。建议在未来48小时内下调排气目标压力 0.05MPa，可有效延缓油分芯失效速率 15%。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-cyan-500 pl-2">下一步行动清单 (Priority)</div>
                       <div className="flex items-center gap-3 text-xs text-slate-200 py-2 border-b border-slate-800/50">
                           <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center font-mono font-bold text-blue-400">01</div>
                           <span>更换主油路精密滤芯 (10μm)</span>
                       </div>
                       <div className="flex items-center gap-3 text-xs text-slate-200 py-2 border-b border-slate-800/50">
                           <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center font-mono font-bold text-blue-400">02</div>
                           <span>执行进气电磁阀闭合压力校准</span>
                       </div>
                       <div className="flex items-center gap-3 text-xs text-red-400 font-bold py-2">
                           <div className="w-6 h-6 bg-red-950 rounded flex items-center justify-center font-mono font-bold text-red-400">03</div>
                           <span>安排下周三停机更换油气分离芯</span>
                       </div>
                   </div>

                   <button className="mt-auto w-full py-4 bg-blue-700/30 hover:bg-blue-700/50 border border-blue-500/50 rounded-xl text-xs text-blue-100 font-bold transition-all flex items-center justify-center gap-3 group shadow-lg">
                       <FileText size={18} className="group-hover:translate-x-1 transition-transform" /> 
                       下发预防性维护工单
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>

      {/* 底部装饰条 */}
      <div className="h-6 flex gap-6 text-[10px] text-slate-600 font-mono overflow-hidden items-center px-4 border-t border-slate-900 mt-2">
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> SENSOR_OIL_PH: ACTIVE</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> ANALYZER_NAS: SYNCED</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-500"></div> PREDICTION_ACCURACY: 94.5%</div>
          <div className="flex-1 text-right text-blue-900 font-bold uppercase tracking-widest italic">Fluidic Intelligence Protocol V5.1</div>
      </div>
    </div>
  );
};