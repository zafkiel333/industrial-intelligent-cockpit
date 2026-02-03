
import React, { useState, useEffect } from 'react';
import { HydraulicPumpThreeScene } from '../../../components/predictive/mining-pump/ThreeScene';
import { PumpPartStatus } from '../../../components/predictive/mining-pump/three-types';
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
  Thermometer, Waves, Wind, FlaskConical
} from 'lucide-react';

// --- 模拟数据 ---

// Fix: Updated PUMP_COMPONENTS to include riskLevel as required by the PumpPartStatus interface
const PUMP_COMPONENTS: PumpPartStatus[] = [
  { id: 'pistons', name: '柱塞组件', health: 82, wearDepth: 0.12, temp: 72, riskLevel: 'normal' },
  { id: 'valve-plate', name: '配流盘', health: 45, wearDepth: 0.45, temp: 88, riskLevel: 'critical' },
  { id: 'swash-plate', name: '斜盘', health: 91, wearDepth: 0.05, temp: 58, riskLevel: 'normal' },
  { id: 'bearings', name: '主轴承', health: 76, wearDepth: 0.08, temp: 65, riskLevel: 'warning' },
];

const PRESSURE_RIPPLE_DATA = Array.from({length: 60}, (_, i) => ({
  time: i,
  pressure: 32 + Math.sin(i * 0.8) * 2 + (i > 40 ? Math.random()*5 : 0), // 模拟压力脉动
  limit: 38
}));

const EFFICIENCY_DEGRADATION = Array.from({length: 24}, (_, i) => ({
  hour: `H-${24-i}`,
  volEff: 96 - (i * 0.1) - (i > 18 ? (i-18)*1.5 : 0), // 容积效率突降
  leakage: 2 + (i * 0.2) + (i > 18 ? (i-18)*2.5 : 0) // 泄油量剧增
}));

// Fix: Defined missing OIL_ANALYSIS_DATA constant required by the chart components
const OIL_ANALYSIS_DATA = Array.from({length: 12}, (_, i) => ({
  month: `T-${12-i}w`,
  iron: 15 + i * 2 + Math.random()*5,
  copper: 5 + i * 0.5 + Math.random()*2,
  silicon: 8 + Math.random()*3
}));

const RUL_FORECAST = Array.from({length: 10}, (_, i) => ({
  day: `D+${i*3}`,
  health: 84 * Math.exp(-i * 0.12),
  safety: 40
}));

export const ExcavatorPumpHealthView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>('valve-plate');
  const [viewMode, setViewMode] = useState<'standard' | 'internal'>('internal');
  const [globalHealth, setGlobalHealth] = useState(84.2);

  // 动态数据波动
  useEffect(() => {
    const timer = setInterval(() => {
      setGlobalHealth(prev => Math.max(10, prev + (Math.random()-0.55)*0.2));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const activeComp = PUMP_COMPONENTS.find(c => c.id === selectedId) || PUMP_COMPONENTS[0];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] bg-[#02040a] text-slate-100 p-2 overflow-y-auto custom-scrollbar">
      
      {/* 顶部：战略性能看板 */}
      <div className="flex justify-between items-end border-b border-cyan-900/40 pb-4 bg-gradient-to-r from-[#0c1a2e] to-transparent px-4">
        <div className="flex gap-6 items-center">
            <div className="p-4 bg-cyan-600/20 rounded-xl border border-cyan-500/50 shadow-[0_0_25px_rgba(56,189,248,0.3)]">
                <Gauge size={32} className="text-cyan-400 animate-pulse" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-[0.2em] font-bold">
                    <Activity size={14} /> Fluid Power Prognostics & Health Audit
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    液压主泵 <span className="text-cyan-400 italic text-shadow-glow">健康指数监测中心</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">瞬时容积效率</div>
                <div className="text-3xl font-mono font-bold text-white tracking-tighter">
                    92.4 <span className="text-sm text-slate-500">%</span>
                </div>
            </div>
            <div className="h-12 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">壳体泄油流量</div>
                <div className={`text-3xl font-mono font-bold ${activeComp.health < 60 ? 'text-red-500' : 'text-cyan-400'}`}>
                    12.5 <span className="text-sm">L/min</span>
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-10">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-orange-400 mb-1">AI 劣化风险评估</div>
                <div className="flex items-center gap-2 text-2xl font-bold text-white uppercase font-mono bg-orange-900/20 px-3 py-1 rounded border border-orange-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <AlertTriangle size={24} className="text-orange-500 animate-bounce" /> LEVEL 2
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：部件特征与油质 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* 核心组件劣化清单 */}
           <SciFiCard title="核心组件劣化清单" subtitle="COMPONENTS AUDIT" className="flex-1 border-cyan-900/50 bg-[#081224]/80">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {PUMP_COMPONENTS.map(comp => (
                       <div 
                         key={comp.id}
                         onClick={() => setSelectedId(comp.id)}
                         className={`p-3 rounded border transition-all cursor-pointer relative group overflow-hidden
                            ${selectedId === comp.id ? 'bg-cyan-950 border-cyan-500 shadow-lg scale-[1.02]' : 'bg-slate-900/40 border-slate-800 hover:border-cyan-500/30'}
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
                               <span className="font-bold opacity-60">磨损: {comp.wearDepth}mm</span>
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                               <div className={`h-full ${comp.health > 80 ? 'bg-cyan-500' : 'bg-red-500'}`} style={{width: `${comp.health}%`}}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="液压油品质监测" subtitle="OIL CONDITION" className="h-[280px] border-cyan-900/50">
               <div className="flex flex-col gap-4 h-full py-2">
                   <div className="grid grid-cols-2 gap-3">
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                           <div className="text-[9px] text-slate-500 uppercase mb-1">NAS 颗粒等级</div>
                           <div className="text-xl font-bold text-yellow-400 font-mono">NAS 8</div>
                       </div>
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                           <div className="text-[9px] text-slate-500 uppercase mb-1">含水量 (ppm)</div>
                           <div className="text-xl font-bold text-white font-mono">142</div>
                       </div>
                   </div>
                   <div className="flex-1 relative">
                       <div className="text-[10px] text-slate-400 mb-2">金属元素趋势 (Fe / Cu)</div>
                       <ResponsiveContainer width="100%" height="80%">
                           <LineChart data={OIL_ANALYSIS_DATA.slice(0, 8)}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="month" hide />
                               <YAxis hide domain={[0, 50]} />
                               <Line type="monotone" dataKey="iron" stroke="#ef4444" strokeWidth={2} dot={false} />
                               <Line type="monotone" dataKey="copper" stroke="#f59e0b" strokeWidth={2} dot={false} />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D数字孪生与实时仿真 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口：全息健康场 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#0a1120] to-[#02040a] border border-blue-800/40 relative rounded-2xl overflow-hidden shadow-[inset_0_0_100px_rgba(56,189,248,0.1)] group">
               
               {/* 视口 HUD 层 */}
               <div className="absolute top-6 left-6 z-10 pointer-events-none space-y-4">
                   <div className="bg-black/70 backdrop-blur border border-blue-500/30 px-5 py-4 rounded-lg flex flex-col gap-3 shadow-2xl pointer-events-auto text-shadow-glow">
                       <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Binary size={14} /> Hydraulic Kinematic Simulator v5.1
                       </div>
                       <div className="flex items-center gap-10">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase mb-1">主泵转速</div>
                               <div className="text-2xl font-mono font-bold text-white">1850 <span className="text-xs">RPM</span></div>
                           </div>
                           <div className="w-[1px] h-10 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase mb-1">斜盘摆角</div>
                               <div className="text-2xl font-mono font-bold text-cyan-400">14.5 <span className="text-xs">°</span></div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* 右侧：分析模式与交互 */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-3 pointer-events-auto">
                   <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700 flex flex-col gap-2 shadow-2xl backdrop-blur">
                       <button 
                            onClick={() => setViewMode(viewMode === 'standard' ? 'internal' : 'standard')}
                            className={`p-3 rounded-lg transition-all ${viewMode === 'internal' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'text-slate-500 hover:text-white'}`}
                       >
                           <Layers size={20} />
                       </button>
                       <button className="p-3 rounded-lg text-slate-500 hover:text-white transition-all"><Scan size={20} /></button>
                       <button className="p-3 rounded-lg text-slate-500 hover:text-white transition-all"><Crosshair size={20} /></button>
                   </div>
               </div>

               <HydraulicPumpThreeScene 
                   parts={PUMP_COMPONENTS}
                   rpm={1850}
                   swashPlateAngle={14.5}
                   pressure={32.5}
                   isInternalVisible={viewMode === 'internal'}
                   isCavitating={activeComp.health < 50}
                   selectedPartId={selectedId}
                   onPartSelect={setSelectedId}
               />

               {/* 底部 HUD：异常部件锁定 */}
               <div className="absolute bottom-8 left-6 right-6 z-10 flex gap-4 pointer-events-none animate-in slide-in-from-bottom-6">
                    <div className={`flex-1 bg-black/60 backdrop-blur-md border-l-4 ${activeComp.health < 60 ? 'border-red-500' : 'border-blue-500'} p-4 rounded-r-lg flex justify-between items-center shadow-2xl`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${activeComp.health < 60 ? 'bg-red-950/40' : 'bg-blue-950/40'} rounded flex items-center justify-center`}>
                                {activeComp.health < 60 ? <AlertTriangle size={28} className="text-red-500 animate-pulse" /> : <Settings size={28} className="text-blue-500" />}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white uppercase tracking-widest mb-1">高敏特征提取：{activeComp.name}</div>
                                <div className={`text-[11px] ${activeComp.health < 60 ? 'text-red-400' : 'text-slate-400'} leading-tight`}>
                                    诊断：{activeComp.id === 'valve-plate' ? '检测到非典型压力尖峰，暗示配流盘表面存在疲劳剥落，导致密封面泄漏率上升 15%。' : '系统当前特征稳定，未发现早期故障迹象。'}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-6">
                             <div className="text-right">
                                 <div className="text-[9px] text-slate-500 uppercase mb-1">健康概率分布</div>
                                 <div className={`text-2xl font-mono font-bold ${activeComp.health < 60 ? 'text-red-400' : 'text-white'}`}>{activeComp.health}%</div>
                             </div>
                        </div>
                    </div>
               </div>
           </div>

           {/* 压力脉动高频监测 */}
           <SciFiCard title="出口压力脉动高频波形" subtitle="PULSE SIGNATURE" className="h-[220px] border-blue-900/50" noPadding>
               <div className="w-full h-full p-4 flex gap-6">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={PRESSURE_RIPPLE_DATA}>
                               <defs>
                                   <linearGradient id="pressGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/><stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/></linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="time" hide />
                               <YAxis domain={[25, 40]} stroke="#64748b" tick={{fontSize: 9}} />
                               <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#22d3ee'}} />
                               <Area type="step" dataKey="pressure" stroke="#22d3ee" fill="url(#pressGrad)" strokeWidth={1} isAnimationActive={false} />
                               <ReferenceLine y={35} stroke="#ef4444" strokeDasharray="5 5" label={{value:'警告线', fill:'#ef4444', fontSize:10}} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="w-48 border-l border-slate-800 pl-6 flex flex-col justify-center gap-3">
                        <div className="text-xs text-slate-400">
                            峰峰值 (P-P): <span className="text-white font-bold font-mono">4.2 MPa</span>
                        </div>
                        <div className="text-xs text-slate-400">
                            主频成分: <span className="text-cyan-400 font-bold font-mono">285 Hz</span>
                        </div>
                        <div className="text-[10px] text-slate-500 italic">
                            * 检测到与转频不相关的调制信号，疑似轴承滚子点蚀。
                        </div>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* 右侧：预测寿命与决策引擎 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* RUL 预测曲线 */}
           <SciFiCard title="关键部件寿命衰减预测" subtitle="RUL PROJECTION" className="h-[280px] border-blue-900/50" noPadding>
               <div className="w-full h-full p-4 flex flex-col">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={RUL_FORECAST}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 9}} />
                               <YAxis domain={[0, 100]} stroke="#64748b" tick={{fontSize: 9}} />
                               <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#3b82f6'}} />
                               <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} />
                               <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="5 5" label={{value: '故障临界', fill: '#ef4444', fontSize: 10}} />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="mt-4 p-3 bg-red-900/10 border border-red-900/30 rounded flex justify-between items-center shadow-lg">
                        <div className="text-[10px] text-red-300 font-bold uppercase tracking-widest">预计强制更换时间</div>
                        <div className="text-sm font-mono font-bold text-red-500 flex items-center gap-1"><Clock size={16}/> 14d 08h</div>
                   </div>
               </div>
           </SciFiCard>

           {/* 智能维保决策建议 */}
           <SciFiCard title="AI 智能辅助决策" className="flex-1 border-blue-900/50 bg-[#1a1c2e]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-4 bg-orange-950/30 border border-orange-500/40 rounded-xl flex items-start gap-3 shadow-inner">
                       <ShieldCheck className="text-green-500 shrink-0 mt-1" size={24} />
                       <div>
                           <div className="text-sm font-bold text-white uppercase tracking-wider">劣化对冲策略已生成</div>
                           <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                               检测到配流盘泄漏引起的内循环热量升高。建议：临时下调最大输出扭矩 15%，以防止泵体过热导致的密封失效。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-blue-500 pl-2">下一步推荐操作 (Priority)</div>
                       <div className="flex items-center gap-3 text-xs text-slate-200 py-2 border-b border-slate-800/50">
                           <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center font-mono font-bold text-blue-400">01</div>
                           <span>在线清洗主泵吸油滤芯</span>
                       </div>
                       <div className="flex items-center gap-3 text-xs text-slate-200 py-2 border-b border-slate-800/50">
                           <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center font-mono font-bold text-blue-400">02</div>
                           <span>执行配流盘精密超声扫描</span>
                       </div>
                       <div className="flex items-center gap-3 text-xs text-red-400 font-bold py-2">
                           <div className="w-6 h-6 bg-red-950 rounded flex items-center justify-center font-mono font-bold text-red-400">03</div>
                           <span>预计下周四停机更换主轴承</span>
                       </div>
                   </div>

                   <button className="mt-auto w-full py-4 bg-blue-700/30 hover:bg-blue-700/50 border border-blue-500/50 rounded-xl text-xs text-blue-100 font-bold transition-all flex items-center justify-center gap-3 group shadow-lg">
                       <FileText size={18} /> 
                       下发预防性维护工单
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>

      {/* 底部装饰条 */}
      <div className="h-6 flex gap-6 text-[10px] text-slate-600 font-mono overflow-hidden items-center px-4 border-t border-slate-900 mt-2">
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> SENSOR_CASE_DRAIN: ACTIVE</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> ANALYZER_NAS: SYNCED</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-500"></div> MODEL_CONFIDENCE: 92.8%</div>
          <div className="flex-1 text-right text-blue-900 font-bold uppercase tracking-widest italic">Predictive Hydraulic Protocol V2.4</div>
      </div>
    </div>
  );
};
