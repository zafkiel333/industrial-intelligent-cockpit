import React, { useState, useEffect } from 'react';
import { HydraulicValveThreeScene } from '../../../components/predictive/mining-valve/ThreeScene';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  ScatterChart, Scatter, LineChart, Line, Legend, ComposedChart, Cell, PieChart, Pie,
  BarChart, Bar
} from 'recharts';
import { 
  ShieldAlert, Activity, Zap, TrendingUp, 
  AlertTriangle, Hammer, Gauge, Cpu, 
  Clock, Database, Droplets, Binary,
  ChevronRight, ArrowRightLeft, Box, Settings,
  Layers, CheckCircle2, FileText, Scan, Crosshair,
  Thermometer, Waves, Wind, FlaskConical, Target,
  AlertOctagon
} from 'lucide-react';

// --- 模拟数据 ---

const HYSTERESIS_DATA = Array.from({length: 40}, (_, i) => {
    const phase = (i / 40) * Math.PI * 2;
    const cmd = Math.sin(phase) * 100;
    const stiction = 18; 
    const isOpening = Math.cos(phase) > 0;
    const pos = isOpening ? cmd - stiction : cmd + stiction;
    return { cmd, pos, isOpening };
});

const OIL_NAS_DIST = [
  { name: '4μm', value: 3800, fill: '#3b82f6' },
  { name: '6μm', value: 1450, fill: '#0ea5e9' },
  { name: '14μm', value: 580, fill: '#ef4444' }, // 关键危害颗粒
  { name: '21μm', value: 92, fill: '#b91c1c' },
];

const RISK_EVOLUTION = Array.from({length: 24}, (_, i) => ({
  time: `T-${24-i}h`,
  risk: 20 + i * 1.5 + (i > 18 ? (i-18)*8 : 0), 
  temp: 45 + Math.sin(i * 0.5) * 5
}));

const RUL_CLOCK_DATA = [
  { name: 'Remaining', value: 42, fill: '#10b981' },
  { name: 'Elapsed', value: 58, fill: '#1e293b' },
];

export const ExcavatorValveStictionView: React.FC = () => {
  const [command, setCommand] = useState(0);
  const [actualPos, setActualPos] = useState(0);
  const [viewMode, setViewMode] = useState<'standard' | 'xray' | 'thermal'>('standard');
  const [riskIndex, setRiskIndex] = useState(42.5);
  const [isDithering, setIsDithering] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = Date.now() / 1500;
      const cmd = Math.sin(t) * 80;
      setCommand(cmd);
      setActualPos(prev => prev + (cmd - prev) * 0.12); // 模拟18%的响应滞后
      setRiskIndex(prev => Math.min(100, Math.max(10, prev + (Math.random()-0.48)*0.5)));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] bg-[#02040a] text-slate-100 p-2 overflow-y-auto custom-scrollbar selection:bg-cyan-500/30">
      
      {/* 顶部：核心监测 HUD */}
      <div className="flex justify-between items-end border-b border-cyan-900/40 pb-4 bg-gradient-to-r from-[#0c1a2e] to-transparent px-4">
        <div className="flex gap-6 items-center">
            <div className="p-4 bg-red-600/20 rounded-xl border border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.2)] animate-pulse">
                <ShieldAlert size={32} className="text-red-500" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-[0.2em] font-bold">
                    <Binary size={14} /> Fluidic Micro-Friction & Stiction Analytics
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    液压阀卡滞 <span className="text-red-500 italic text-shadow-glow">风险预测中心</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">当前响应滞后 (Lag)</div>
                <div className="text-3xl font-mono font-bold text-white tracking-tighter">
                    145 <span className="text-sm text-slate-500">ms</span>
                </div>
            </div>
            <div className="h-12 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">预测完全卡死窗口</div>
                <div className="text-3xl font-mono font-bold text-red-400">42 <span className="text-sm">h</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-10">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-orange-400 mb-1">AI 劣化评估结果</div>
                <div className="flex items-center gap-2 text-2xl font-bold text-white uppercase font-mono bg-red-900/20 px-3 py-1 rounded border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                    <AlertTriangle size={24} className="text-red-500 animate-bounce" /> HIGH RISK
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：迟滞分析与油质监控 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           <SciFiCard title="迟滞特性环 (Hysteresis)" subtitle="CMD vs ACTUAL" className="h-[320px] border-cyan-900/50 bg-[#081224]/80" noPadding>
               <div className="w-full h-full p-4 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                           <XAxis type="number" dataKey="cmd" name="指令" domain={[-100, 100]} stroke="#64748b" tick={{fontSize: 10}} label={{value:'控制电流 %', position:'insideBottom', offset:-5, fontSize:10, fill:'#64748b'}} />
                           <YAxis type="number" dataKey="pos" name="反馈" domain={[-100, 100]} stroke="#64748b" tick={{fontSize: 10}} label={{value:'位移反馈 %', angle:-90, position:'insideLeft', fontSize:10, fill:'#64748b'}} />
                           <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                           <Scatter name="Loop" data={HYSTERESIS_DATA} line={{stroke: '#0ea5e9', strokeWidth: 2}} shape={() => null} />
                           <Scatter name="Current" data={[{cmd: command, pos: actualPos}]} fill="#fff" shape="circle" />
                       </ScatterChart>
                   </ResponsiveContainer>
                   <div className="absolute top-4 right-6 text-[9px] text-cyan-400 font-bold bg-cyan-950/50 px-2 py-1 border border-cyan-500/30 rounded">
                       死区宽度: 18.2% (偏大)
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="油液颗粒分布监测" subtitle="NAS 1638 / ISO 4406" className="flex-1 border-cyan-900/50">
               <div className="flex flex-col h-full py-2">
                   <div className="flex justify-between items-center mb-4">
                       <div className="text-sm font-bold text-slate-300">污染等级：<span className="text-red-500 font-mono">NAS 11</span></div>
                       <div className="flex gap-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                           <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                       </div>
                   </div>
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={OIL_NAS_DIST} layout="vertical">
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                               <XAxis type="number" hide />
                               <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 9, fill: '#94a3b8'}} />
                               <Tooltip contentStyle={{backgroundColor: '#000'}} cursor={{fill: '#1e293b'}} />
                               <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                   {OIL_NAS_DIST.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.fill} />
                                   ))}
                               </Bar>
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="mt-4 p-2 bg-red-900/10 border border-red-500/20 rounded text-[10px] text-red-200">
                       <AlertTriangle size={10} className="inline mr-1" />
                       发现硬质金属屑成分，极大增加了阀芯划伤与突发性卡死的物理概率。
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D数字孪生与动态仿真 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口：高亮模式 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#0a1120] to-[#02040a] border border-blue-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(56,189,248,0.15)] group">
               
               {/* 视口 HUD 层 */}
               <div className="absolute top-6 left-6 z-10 pointer-events-none space-y-4">
                   <div className="bg-black/70 backdrop-blur-md border border-cyan-500/30 px-5 py-4 rounded-lg flex flex-col gap-3 shadow-2xl pointer-events-auto">
                       <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Cpu size={14} /> Valve Dynamics Monitoring v5.2
                       </div>
                       <div className="flex items-center gap-10">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase mb-1">瞬时动摩擦系数</div>
                               <div className="text-2xl font-mono font-bold text-white">0.18 <span className="text-xs">μ</span></div>
                           </div>
                           <div className="w-[1px] h-10 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase mb-1">控制阀压差</div>
                               <div className="text-2xl font-mono font-bold text-cyan-400">14.5 <span className="text-xs">MPa</span></div>
                           </div>
                       </div>
                   </div>

                   <div className="flex gap-3 pointer-events-auto">
                        <button 
                            onClick={() => setIsDithering(!isDithering)}
                            className={`px-3 py-1 border rounded text-[10px] flex items-center gap-2 transition-all 
                                ${isDithering ? 'bg-green-900/30 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-500'}
                            `}
                        >
                            <Zap size={12} className={isDithering ? 'animate-pulse' : ''} /> 颤振补偿 (DITHER) {isDithering ? 'ON' : 'OFF'}
                        </button>
                        <div className="px-3 py-1 bg-orange-900/40 border border-orange-500/30 rounded text-[10px] text-orange-200 flex items-center gap-2">
                            <Thermometer size={12} /> 阀内油温: 54.2°C
                        </div>
                   </div>
               </div>

               {/* 右侧：显示模式切换 */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-3 pointer-events-auto">
                   <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700 flex flex-col gap-2 shadow-2xl backdrop-blur">
                       <button onClick={() => setViewMode('standard')} className={`p-3 rounded-lg ${viewMode === 'standard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}><Layers size={20} /></button>
                       <button onClick={() => setViewMode('xray')} className={`p-3 rounded-lg ${viewMode === 'xray' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}><Scan size={20} /></button>
                       <button onClick={() => setViewMode('thermal')} className={`p-3 rounded-lg ${viewMode === 'thermal' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}><Thermometer size={20} /></button>
                   </div>
               </div>

               <HydraulicValveThreeScene 
                   spoolPosition={actualPos}
                   commandSignal={command}
                   oilQuality={0.8}
                   stictionRisk={riskIndex / 100}
                   viewMode={viewMode}
                   isDithering={isDithering}
               />

               {/* 底部 HUD：卡滞风险定位 */}
               <div className="absolute bottom-8 left-6 right-6 z-10 flex gap-4 pointer-events-none animate-in slide-in-from-bottom-6">
                    <div className="flex-1 bg-black/60 backdrop-blur-md border-l-4 border-red-500 p-4 rounded-r-lg flex justify-between items-center shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-950/40 rounded flex items-center justify-center border border-red-500/30">
                                <AlertTriangle size={28} className="text-red-500 animate-pulse" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white uppercase tracking-widest mb-1">预测失效位点锁定：阀芯边缘 (Land #2)</div>
                                <div className="text-[11px] text-red-400 leading-tight">检测到该区域存在由于微小颗粒划伤引起的局部静摩擦力激增。摩擦载荷较基准值提升 42%。</div>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-[9px] text-slate-500 uppercase mb-1">卡滞概率 (P-STIC)</div>
                             <div className="text-2xl font-mono font-bold text-red-500">{riskIndex.toFixed(1)}%</div>
                        </div>
                    </div>
               </div>
           </div>

           {/* 风险演化趋势曲线 */}
           <SciFiCard title="风险熵演化趋势 (72H)" subtitle="RISK EVOLUTION" className="h-[220px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4 flex gap-6">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={RISK_EVOLUTION}>
                               <defs>
                                   <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 9}} interval={4} />
                               <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                               <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#ef4444'}} />
                               <Area type="monotone" dataKey="risk" stroke="#ef4444" fill="url(#riskGrad)" name="卡滞风险指数" />
                               <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={1} dot={false} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="w-48 border-l border-slate-800 pl-6 flex flex-col justify-center gap-3">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">加速劣化因子</div>
                        <div className="flex items-center gap-2 text-xs text-red-400">
                             <TrendingUp size={12} /> 颗粒磨损
                        </div>
                        <div className="flex items-center gap-2 text-xs text-orange-400">
                             <Activity size={12} /> 高频换向
                        </div>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* 右侧：寿命预测与维保决策 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           <SciFiCard title="剩余寿命精确预测" subtitle="RUL (Remaining Useful Life)" className="h-[280px] border-cyan-900/50">
               <div className="flex flex-col items-center justify-center h-full gap-4">
                   <div className="relative w-40 h-40">
                       <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                               <Pie
                                   data={RUL_CLOCK_DATA}
                                   innerRadius={60}
                                   outerRadius={75}
                                   startAngle={90}
                                   endAngle={450}
                                   paddingAngle={0}
                                   dataKey="value"
                               >
                                   <Cell key="cell-0" fill="#10b981" />
                                   <Cell key="cell-1" fill="#1e293b" />
                               </Pie>
                           </PieChart>
                       </ResponsiveContainer>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <div className="text-3xl font-mono font-bold text-white">42h</div>
                           <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">HOURS LEFT</div>
                       </div>
                   </div>
                   <div className="w-full space-y-2">
                       <div className="flex justify-between text-xs border-b border-slate-800 pb-1">
                           <span className="text-slate-500 font-bold uppercase">Confidence</span>
                           <span className="text-green-400 font-mono">92.4%</span>
                       </div>
                       <div className="flex justify-between text-xs border-b border-slate-800 pb-1">
                           <span className="text-slate-500 font-bold uppercase">Algorithm</span>
                           <span className="text-white font-mono">XGB-STICT</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="智能维保决策建议" className="flex-1 border-cyan-900/50 bg-[#1a0f05]/30">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-red-950/30 border border-red-500/30 rounded flex items-start gap-3 shadow-inner">
                       <AlertTriangle className="text-red-500 shrink-0 mt-1" size={18} />
                       <div>
                           <div className="text-xs font-bold text-white uppercase">策略：劣化对冲限制</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                               当前阀芯粘滞阻力过大。建议通过调速器暂时限制该阀最大流量至 65%，以降低流体侧向力，防止突发死锁。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-cyan-500 pl-2">下一步行动清单 (Next Actions)</div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1.5 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> T+2h: 执行液压油旁路循环精滤
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1.5 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> T+4h: 重新校准颤振幅值至 5%
                       </div>
                       <div className="flex items-center gap-2 text-xs text-red-400 font-bold">
                           <AlertOctagon size={14} className="animate-pulse" /> 建议下次检修：停机更换阀芯
                       </div>
                   </div>

                   <button className="mt-auto w-full py-3 bg-cyan-700/30 hover:bg-cyan-700/50 border border-cyan-500/50 rounded-lg text-xs text-cyan-100 font-bold transition-all flex items-center justify-center gap-3 group shadow-lg">
                       <FileText size={18} className="group-hover:translate-x-1 transition-transform" /> 
                       下发预防性维护指令单
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>

      {/* 底部装饰条 */}
      <div className="h-6 flex gap-6 text-[10px] text-slate-600 font-mono overflow-hidden items-center px-4 border-t border-slate-900 mt-2">
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> SENSOR_LVDT: SYNCED</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> ANALYZER_NAS: ACTIVE</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-500"></div> PREDICTION_ACCURACY: 91.5%</div>
          <div className="flex-1 text-right text-blue-900 font-bold uppercase tracking-widest italic">Hydraulic Intelligence Control Protocol V5.4</div>
      </div>
    </div>
  );
};