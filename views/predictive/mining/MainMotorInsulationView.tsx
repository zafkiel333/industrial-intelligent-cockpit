
import React, { useState, useEffect } from 'react';
import { MiningMotorInsulationScene } from '../../../components/predictive/mining-motor-insulation/ThreeScene';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  ScatterChart, Scatter, Cell, LineChart, Line, Legend, ComposedChart, Bar, BarChart
} from 'recharts';
import { 
  Zap, Activity, Thermometer, ShieldAlert, 
  Cpu, Binary, GitFork, TrendingUp,
  Fingerprint, Info, AlertTriangle, FileText,
  Clock, Gauge, Layers, Crosshair, Scan, Droplets, Hammer,
  BrainCircuit, ShieldCheck, Waves, Wind
} from 'lucide-react';

// --- 模拟数据 ---

// PRPD (Phase Resolved Partial Discharge) 指纹图谱数据
const PRPD_DATA = Array.from({length: 300}, () => ({
  phase: Math.random() * 360,
  mag: Math.random() * 40 + (Math.random() > 0.85 ? 120 : 0), // 模拟放电脉冲
  count: Math.random() * 10
}));

// 正弦电压参考线
const VOLTAGE_WAVE = Array.from({length: 37}, (_, i) => ({
  phase: i * 10,
  val: Math.sin(i * 10 * (Math.PI / 180)) * 100 + 100
}));

// 绝缘电阻与极化指数趋势
const TREND_HISTORY = Array.from({length: 30}, (_, i) => {
  const base = 1200 - i * 5;
  const isPred = i > 20;
  return {
    time: `T-${30-i}d`,
    actual: isPred ? null : base + (Math.random()-0.5)*20,
    predict: isPred ? base - (i-20)*15 : null,
    limit: 600
  };
});

// 老化速率与温度关系
const AGING_TEMP_CURVE = [
  { temp: 40, rate: 1.0 },
  { temp: 60, rate: 1.2 },
  { temp: 80, rate: 2.5 },
  { temp: 105, rate: 8.0 }, // 绝缘等级临界点
  { temp: 120, rate: 24.0 },
];

export const MainMotorInsulationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'prognostics'>('monitor');
  const [insHealth, setInsHealth] = useState(82.4);
  const [pdLevel, setPdLevel] = useState(420);
  const [viewMode, setViewMode] = useState<'standard' | 'thermal' | 'electric-field'>('standard');
  const [rpm, setRpm] = useState(1200);

  useEffect(() => {
    const timer = setInterval(() => {
        setInsHealth(prev => Math.max(20, prev + (Math.random()-0.6)*0.1));
        setPdLevel(prev => 420 + (Math.random()-0.5)*50);
        setRpm(prev => 1200 + Math.sin(Date.now()/1000)*50);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] bg-[#02040a] text-slate-100 p-2 overflow-y-auto custom-scrollbar selection:bg-purple-500/30">
      
      {/* 顶部：战略预警 HUD */}
      <div className="flex justify-between items-end border-b border-purple-900/50 pb-4 bg-gradient-to-r from-[#1a0b2e] to-transparent px-4">
        <div className="flex gap-6 items-center">
            <div className="p-4 bg-purple-600/20 rounded-xl border border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.3)]">
                <BrainCircuit size={36} className="text-purple-400 animate-pulse" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-purple-400 mb-1 uppercase tracking-[0.2em] font-bold">
                    <ShieldAlert size={14} /> Main Drive Insulation Diagnostic & Prognostic Center
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    主电机绝缘 <span className="text-purple-400 text-shadow-glow">劣化风险预测中心</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">综合健康指数 (GHI)</div>
                <div className={`text-5xl font-mono font-bold ${insHealth < 75 ? 'text-orange-500' : 'text-green-400'}`}>
                    {insHealth.toFixed(1)}
                </div>
            </div>
            <div className="h-12 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">预测剩余寿命 (RUL)</div>
                <div className="text-4xl font-mono font-bold text-white">425 <span className="text-sm text-slate-500">Days</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-10">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-orange-400 mb-1">实时风险等级</div>
                <div className="flex items-center gap-2 text-2xl font-bold text-white uppercase font-mono">
                    <AlertTriangle size={24} className="text-orange-500 animate-bounce" /> LEVEL 3
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：物理特征与趋势 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 局放相位图谱 */}
           <SciFiCard title="局放相位特征图谱 (PRPD)" subtitle="DISCHARGE FINGERPRINT" className="h-[320px] border-purple-900/50 bg-[#0c081a]/80" noPadding>
               <div className="w-full h-full relative p-4">
                   <div className="absolute inset-0 opacity-10 pointer-events-none">
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={VOLTAGE_WAVE}>
                               <Line type="monotone" dataKey="val" stroke="#fff" strokeWidth={1} dot={false} />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{ top: 20, right: 10, bottom: 20, left: -20 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" vertical={false} />
                           <XAxis type="number" dataKey="phase" domain={[0, 360]} stroke="#6b7280" tick={{fontSize: 10}} />
                           <YAxis type="number" dataKey="mag" domain={[0, 200]} stroke="#6b7280" tick={{fontSize: 10}} />
                           <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#000', borderColor: '#8b5cf6'}} />
                           <Scatter name="PD" data={PRPD_DATA}>
                               {PRPD_DATA.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.mag > 100 ? '#ef4444' : '#22d3ee'} fillOpacity={0.6} />
                               ))}
                           </Scatter>
                       </ScatterChart>
                   </ResponsiveContainer>
                   <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-500/30">
                       <Fingerprint size={10} /> 模式识别：电晕放电 (Corona)
                   </div>
               </div>
           </SciFiCard>

           {/* 退化历史与预测趋势 */}
           <SciFiCard title="绝缘电阻趋势预测" subtitle="RESISTANCE DEGRADATION" className="flex-1 border-purple-900/50">
               <div className="h-full w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={TREND_HISTORY}>
                           <defs>
                               <linearGradient id="colorIns" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" vertical={false} />
                           <XAxis dataKey="time" stroke="#6b7280" tick={{fontSize: 9}} interval={6} />
                           <YAxis stroke="#6b7280" tick={{fontSize: 9}} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#8b5cf6'}} />
                           <Area type="monotone" dataKey="actual" stroke="#8b5cf6" fill="url(#colorIns)" name="实时测量" isAnimationActive={false} />
                           <Line type="monotone" dataKey="predict" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} dot={false} name="AI 演化预测" />
                           <ReferenceLine y={600} stroke="#ef4444" strokeDasharray="3 3" label={{value: '安全临界', fill: '#ef4444', fontSize: 10}} />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D数字孪生视口 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#0a0514] to-[#020204] border border-purple-800/40 relative rounded-2xl overflow-hidden shadow-[inset_0_0_100px_rgba(168,85,247,0.1)] group">
               
               {/* 视口 HUD 层 */}
               <div className="absolute top-6 left-6 z-10 pointer-events-none space-y-4">
                   <div className="bg-black/70 backdrop-blur-md border border-purple-500/30 px-5 py-4 rounded-lg flex flex-col gap-3 shadow-2xl pointer-events-auto">
                       <div className="text-[10px] text-purple-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Binary size={14} /> Dielectric Physics Simulation
                       </div>
                       <div className="flex items-center gap-10">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase mb-1">当前介损正切 (Tanδ)</div>
                               <div className="text-2xl font-mono font-bold text-white">0.024 <span className="text-xs">/ 2.4%</span></div>
                           </div>
                           <div className="w-[1px] h-10 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase mb-1">极化指数 (PI)</div>
                               <div className="text-2xl font-mono font-bold text-cyan-400">2.15</div>
                           </div>
                       </div>
                   </div>

                   <div className="flex gap-3 pointer-events-auto">
                        <div className="px-3 py-1 bg-purple-900/40 border border-purple-500/30 rounded text-[10px] text-purple-200 flex items-center gap-2">
                            <Waves size={12} className="animate-pulse" /> 电磁场流仿真中
                        </div>
                        <div className="px-3 py-1 bg-orange-900/40 border border-orange-500/30 rounded text-[10px] text-orange-200 flex items-center gap-2">
                            <Thermometer size={12} /> 绕组最高温: 82.4°C
                        </div>
                   </div>
               </div>

               {/* 右侧：分析模式切换 */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-3 pointer-events-auto">
                   <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700 flex flex-col gap-2 shadow-2xl backdrop-blur">
                       <button 
                            onClick={() => setViewMode('standard')}
                            className={`p-3 rounded-lg transition-all ${viewMode === 'standard' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40' : 'text-slate-500 hover:text-white'}`}
                       >
                           <Layers size={20} />
                       </button>
                       <button 
                            onClick={() => setViewMode('electric-field')}
                            className={`p-3 rounded-lg transition-all ${viewMode === 'electric-field' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40' : 'text-slate-500 hover:text-white'}`}
                       >
                           <Scan size={20} />
                       </button>
                       <button 
                            onClick={() => setViewMode('thermal')}
                            className={`p-3 rounded-lg transition-all ${viewMode === 'thermal' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40' : 'text-slate-500 hover:text-white'}`}
                       >
                           <Thermometer size={20} />
                       </button>
                   </div>
               </div>

               <MiningMotorInsulationScene 
                   rotationSpeed={rpm}
                   windingTemp={85}
                   pdIntensity={pdLevel}
                   insulationHealth={insHealth}
                   viewMode={viewMode}
                   isRunning={true}
               />

               {/* 底部 HUD：异常定位锁定 */}
               <div className="absolute bottom-8 left-6 right-6 z-10 flex gap-4 pointer-events-none animate-in slide-in-from-bottom-6">
                    <div className="flex-1 bg-black/60 backdrop-blur-md border-l-4 border-red-500 p-4 rounded-r-lg flex justify-between items-center shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-950/40 rounded flex items-center justify-center">
                                <AlertTriangle size={28} className="text-red-500 animate-pulse" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white uppercase tracking-widest mb-1">绝缘薄弱区域锁定 (Slot #12-14)</div>
                                <div className="text-[11px] text-red-400 leading-tight">检测到端部绝缘存在层间微裂缝，伴随非典型高频电荷脉冲。</div>
                            </div>
                        </div>
                        <div className="flex gap-6">
                             <div className="text-right">
                                 <div className="text-[9px] text-slate-500 uppercase mb-1">最大局放量 (Qmax)</div>
                                 <div className="text-2xl font-mono font-bold text-white">{pdLevel.toFixed(0)} <span className="text-xs">pC</span></div>
                             </div>
                        </div>
                    </div>
               </div>
           </div>

           {/* 环境相关性看板 */}
           <div className="grid grid-cols-4 gap-4">
               {[
                   { label: '绕组环境湿度', val: '45.2', unit: '%', icon: <Droplets className="text-blue-400"/> },
                   { label: '定子核心振动', val: '2.14', unit: 'mm/s', icon: <Activity className="text-yellow-400"/> },
                   { label: '冷却空气流量', val: '1240', unit: 'm³/min', icon: <Wind className="text-cyan-400"/> },
                   { label: '润滑油质酸值', val: '0.12', unit: 'mg/g', icon: <Zap className="text-purple-400"/> },
               ].map((m, i) => (
                   <div key={i} className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center gap-3 group hover:border-purple-500/50 transition-all">
                       <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-purple-900/30 transition-colors">{m.icon}</div>
                       <div>
                           <div className="text-[10px] text-slate-500 uppercase font-bold">{m.label}</div>
                           <div className="text-lg font-mono font-bold text-white">{m.val} <span className="text-[10px] font-normal opacity-50">{m.unit}</span></div>
                       </div>
                   </div>
               ))}
           </div>

        </div>

        {/* 右侧：预测决策 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 老化动力学模型 */}
           <SciFiCard title="绝缘热老化动力学" subtitle="ARRHENIUS MODEL" className="h-[280px] border-purple-900/50" noPadding>
               <div className="w-full h-full p-4 flex flex-col">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <ComposedChart data={AGING_TEMP_CURVE}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" vertical={false} />
                               <XAxis dataKey="temp" stroke="#6b7280" tick={{fontSize: 10}} label={{ value: 'Temp °C', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                               <YAxis stroke="#6b7280" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#8b5cf6'}} />
                               <Bar dataKey="rate" fill="#8b5cf6" fillOpacity={0.4} />
                               <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} dot={{r: 4, fill: '#ef4444'}} />
                           </ComposedChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="mt-2 p-2 bg-purple-900/20 rounded text-[10px] text-purple-300 leading-tight">
                       <Info size={12} className="inline mr-1" /> 基于 6°C 规则：运行温度每上升 6°C，预期寿命将缩短 50%。
                   </div>
               </div>
           </SciFiCard>

           {/* 智能维保决策引擎 */}
           <SciFiCard title="智能维护决策引擎" className="flex-1 border-purple-900/50 bg-[#14081f]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-4 bg-orange-950/30 border border-orange-500/40 rounded-xl flex items-start gap-3 shadow-inner">
                       <ShieldCheck className="text-green-500 shrink-0 mt-1" size={24} />
                       <div>
                           <div className="text-sm font-bold text-white uppercase tracking-wider">劣化对冲策略建议</div>
                           <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                               检测到高负荷工况下绕组热点峰值超标。预测将在下个大班次（18小时后）触及风险红线。建议：
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-purple-500 pl-2">下一步行动清单 (Priority)</div>
                       <div className="flex items-center gap-3 text-xs text-slate-200 py-2 border-b border-slate-800/50">
                           <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center font-mono font-bold text-blue-400">01</div>
                           <span>强制提升机舱内冷循环压力 15%</span>
                       </div>
                       <div className="flex items-center gap-3 text-xs text-slate-200 py-2 border-b border-slate-800/50">
                           <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center font-mono font-bold text-blue-400">02</div>
                           <span>执行离线介质损耗因数 (Tanδ) 抽检</span>
                       </div>
                       <div className="flex items-center gap-3 text-xs text-red-400 font-bold py-2">
                           <div className="w-6 h-6 bg-red-950 rounded flex items-center justify-center font-mono font-bold text-red-400">03</div>
                           <span>预计 T+45d 安排绕组绝缘局部补漆</span>
                       </div>
                   </div>

                   <button className="mt-auto w-full py-4 bg-purple-700/30 hover:bg-purple-700/50 border border-purple-500/50 rounded-xl text-xs text-purple-100 font-bold transition-all flex items-center justify-center gap-3 group shadow-lg">
                       <FileText size={18} className="group-hover:translate-x-1 transition-transform" /> 
                       下发预防性维护计划单
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>

      {/* 底部装饰条 */}
      <div className="h-6 flex gap-6 text-[10px] text-slate-600 font-mono overflow-hidden items-center px-4 border-t border-slate-900 mt-2">
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> SENSOR_INS_PD: ACTIVE</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> SAMPLING_RATE: 2.5MHz</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-500"></div> MODEL_ACCURACY: 98.2%</div>
          <div className="flex-1 text-right text-purple-900 font-bold uppercase tracking-widest">Dielectric Integrity Monitoring Protocol V2.1</div>
      </div>
    </div>
  );
};
