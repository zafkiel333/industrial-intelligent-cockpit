
import React, { useState, useEffect } from 'react';
import { SwingThreeScene } from '../../../components/predictive/mining-swing/ThreeScene';
import { SwingPart } from '../../../components/predictive/mining-swing/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  // Fix: Added missing ReferenceLine import from recharts
  BarChart, Bar, Cell, Legend, ComposedChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceLine
} from 'recharts';
import { 
  RotateCw, Activity, Zap, ShieldAlert, Cpu, 
  Settings, Binary, TrendingUp, History,
  Compass, Gauge, Wind, AlertOctagon, 
  // Fix: Added missing ShieldCheck, AlertTriangle, and FileText imports from lucide-react
  Target, Info, CheckCircle2, Siren,
  ArrowUpRight, Microscope, Scan, Search,
  Fingerprint, Layers, Thermometer, Box, ShieldCheck, AlertTriangle, FileText
} from 'lucide-react';

const MOCK_PARTS: SwingPart[] = [
  { id: 'motor', name: '回转牵引电机', type: 'motor', health: 76, temp: 88, vibration: 4.5, stress: 0.8 },
  { id: 'gearbox', name: '行星减速箱', type: 'gear', health: 92, temp: 65, vibration: 1.2, stress: 0.4 },
  { id: 'pinion', name: '驱动小齿轮', type: 'gear', health: 85, temp: 52, vibration: 3.2, stress: 0.6 },
  { id: 'ring', name: '回转大齿圈', type: 'gear', health: 94, temp: 42, vibration: 0.8, stress: 0.3 },
  { id: 'brake', name: '回转制动器', type: 'brake', health: 98, temp: 35, vibration: 0.5, stress: 0.1 },
];

const GMF_SPECTRUM = [
    { freq: '1X', amp: 1.2, label: '转频' },
    { freq: 'GMF1', amp: 4.5, label: '一级啮合' },
    { freq: 'GMF2', amp: 3.2, label: '二级啮合' },
    { freq: 'SB-L', amp: 1.8, label: '左边频' },
    { freq: 'SB-R', amp: 1.9, label: '右边频' },
];

const RUL_DISTRIBUTION = Array.from({length: 40}, (_, i) => ({
    time: i * 20,
    prob: 100 * Math.exp(-Math.pow(i/25, 2.5)) // Weibull 概率密度模拟
}));

export const SwingMechanismHealthView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'mechanical' | 'thermal' | 'magnetic'>('mechanical');
  const [activeId, setActiveId] = useState<string | null>('motor');
  const [rpm, setRpm] = useState(850);
  const [torque, setTorque] = useState(65.4);
  const [healthIndex, setHealthIndex] = useState(84.2);

  const activeComp = MOCK_PARTS.find(p => p.id === activeId) || MOCK_PARTS[0];

  useEffect(() => {
    const interval = setInterval(() => {
        setRpm(850 + Math.sin(Date.now() / 2000) * 100);
        setTorque(65 + Math.cos(Date.now() / 3000) * 5);
        setHealthIndex(prev => Math.max(20, prev + (Math.random() - 0.52) * 0.1));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020308] text-purple-50 p-2 overflow-y-auto custom-scrollbar selection:bg-purple-500/30">
      
      {/* 顶部：战略性能 HUD */}
      <div className="flex justify-between items-end border-b border-purple-900/40 pb-4 bg-gradient-to-r from-[#120524] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-4 bg-purple-600/20 rounded-xl border border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.4)] animate-pulse">
                <RotateCw size={36} className="text-purple-400" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-purple-400 mb-1 uppercase tracking-[0.2em] font-bold">
                    <Binary size={14} /> Swing Traction Drive Integrity Scan
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    回转机构 <span className="text-purple-400 italic text-shadow-glow">健康状态评估中心</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">回转输出扭矩</div>
                <div className="text-3xl font-mono font-bold text-white tracking-tighter">
                    {torque.toFixed(1)} <span className="text-sm text-slate-500">kN·m</span>
                </div>
            </div>
            <div className="h-12 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">综合健康评分 (GHI)</div>
                <div className={`text-4xl font-mono font-bold ${healthIndex < 75 ? 'text-orange-500' : 'text-green-400'}`}>
                    {healthIndex.toFixed(1)}
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-10">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-purple-400 mb-1">AI 预后诊断状态</div>
                <div className="flex items-center gap-2 text-2xl font-bold text-white uppercase font-mono bg-purple-900/20 px-3 py-1 rounded border border-purple-500/30">
                    <ShieldAlert size={24} className="text-purple-400 animate-bounce" /> STABLE-MOD
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：物理特征与频域指纹 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           <SciFiCard title="机组组件运行指纹" subtitle="ASSET MATRIX" className="flex-1 border-purple-900/50 bg-[#0c051a]/80">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {MOCK_PARTS.map(part => (
                       <div 
                         key={part.id}
                         onClick={() => setActiveId(part.id)}
                         className={`p-3 rounded border transition-all cursor-pointer relative group overflow-hidden
                            ${activeId === part.id ? 'bg-purple-950 border-purple-500 shadow-lg scale-[1.02]' : 'bg-slate-900/40 border-slate-800 hover:border-purple-500/30'}
                         `}
                       >
                           {activeId === part.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>}
                           <div className="flex justify-between items-center mb-2">
                               <div className="flex items-center gap-2">
                                   <div className={`w-1.5 h-1.5 rounded-full ${part.health < 80 ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></div>
                                   <span className="text-xs font-bold text-slate-100 group-hover:text-purple-300 transition-colors">{part.name}</span>
                               </div>
                               <span className={`text-[10px] font-mono font-bold ${part.health > 85 ? 'text-green-400' : 'text-red-500'}`}>
                                   {part.health}%
                               </span>
                           </div>
                           <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-mono mb-2">
                               <div className="flex items-center gap-1"><Thermometer size={10}/> {part.temp}°C</div>
                               <div className="flex items-center gap-1"><Activity size={10}/> {part.vibration} mm/s</div>
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                               <div className={`h-full ${part.health > 85 ? 'bg-green-500' : 'bg-red-500'}`} style={{width: `${part.health}%`}}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* 啮合频率频谱分析 (GMF) */}
           <SciFiCard title="啮合频率频谱分析 (GMF)" subtitle="FREQUENCY DOMAIN" className="h-[280px] border-purple-900/50">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={GMF_SPECTRUM} margin={{left: -20}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" vertical={false} />
                           <XAxis dataKey="freq" stroke="#6b7280" tick={{fontSize: 9}} />
                           <YAxis hide />
                           <Tooltip cursor={{fill: '#2e1065'}} contentStyle={{backgroundColor: '#000', borderColor: '#8b5cf6', color: '#fff'}} />
                           <Bar dataKey="amp" radius={[2, 2, 0, 0]}>
                               {GMF_SPECTRUM.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.amp > 4 ? '#ef4444' : '#8b5cf6'} fillOpacity={0.6} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D数字孪生视口 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口：回转机构全息 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#0a0514] to-[#020204] border border-purple-800/40 relative rounded-2xl overflow-hidden shadow-[inset_0_0_100px_rgba(168,85,247,0.15)] group">
               
               {/* 视口 HUD 层 */}
               <div className="absolute top-6 left-6 z-10 space-y-4 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur-md border border-purple-500/30 px-5 py-4 rounded-lg flex flex-col gap-3 shadow-2xl pointer-events-auto">
                       <div className="text-[10px] text-purple-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Fingerprint size={14} /> Swing Kinematic Signature Simulator
                       </div>
                       <div className="flex items-center gap-10">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">实时回转转速</div>
                               <div className="text-2xl font-mono font-bold text-white">{rpm.toFixed(0)} <span className="text-xs">RPM</span></div>
                           </div>
                           <div className="w-[1px] h-10 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">传动比 (Ratio)</div>
                               <div className="text-2xl font-mono font-bold text-cyan-400">125.4</div>
                           </div>
                       </div>
                   </div>

                   <div className="flex gap-3 pointer-events-auto">
                        <div className="px-3 py-1 bg-purple-900/40 border border-purple-500/30 rounded text-[10px] text-purple-200 flex items-center gap-2">
                            <Zap size={12} className="animate-pulse" /> 电机相电流平衡度: 98.5%
                        </div>
                        <div className="px-3 py-1 bg-blue-900/40 border border-blue-500/30 rounded text-[10px] text-blue-200 flex items-center gap-2">
                            {/* Fix: Added CheckCircle2 to lucide-react imports */}
                            <ShieldCheck size={12} /> 机架刚度: OPTIMAL
                        </div>
                   </div>
               </div>

               {/* 右侧：模式切换 */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-3 pointer-events-auto">
                   <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700 flex flex-col gap-1 shadow-2xl backdrop-blur">
                       <button onClick={() => setViewMode('mechanical')} className={`p-3 rounded-lg ${viewMode === 'mechanical' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-white'}`}><Layers size={20} /></button>
                       <button onClick={() => setViewMode('magnetic')} className={`p-3 rounded-lg ${viewMode === 'magnetic' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-white'}`}><Scan size={20} /></button>
                       <button onClick={() => setViewMode('thermal')} className={`p-3 rounded-lg ${viewMode === 'thermal' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-white'}`}><Thermometer size={20} /></button>
                   </div>
               </div>

               <SwingThreeScene 
                   parts={MOCK_PARTS}
                   rpm={rpm}
                   torque={torque}
                   viewMode={viewMode}
                   activePartId={activeId}
                   onPartSelect={setActiveId}
               />

               {/* 底部 HUD：部件深度分析 */}
               <div className="absolute bottom-8 left-6 right-6 z-10 flex gap-4 pointer-events-none animate-in slide-in-from-bottom-6">
                    <div className={`flex-1 bg-black/60 backdrop-blur-md border-l-4 ${activeComp.health < 80 ? 'border-red-500' : 'border-purple-500'} p-4 rounded-r-lg flex justify-between items-center shadow-2xl`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${activeComp.health < 80 ? 'bg-red-950/40' : 'bg-purple-950/40'} rounded flex items-center justify-center border border-purple-500/20`}>
                                {activeComp.health < 80 ? <AlertOctagon size={28} className="text-red-500 animate-pulse" /> : <Settings size={28} className="text-purple-500" />}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white uppercase tracking-widest mb-1">特征提取：{activeComp.name}</div>
                                <div className={`text-[11px] ${activeComp.health < 80 ? 'text-red-400' : 'text-slate-400'} leading-tight`}>
                                    分析：{activeComp.id === 'motor' ? '检测到 142Hz 处存在异常谐波幅值，暗示转子存在微小偏心导致的电磁激振。' : '当前部件运行参数处于稳定分布区间。'}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-10">
                             <div className="text-right">
                                 <div className="text-[9px] text-slate-500 uppercase">健康置信度</div>
                                 <div className={`text-2xl font-mono font-bold ${activeComp.health < 80 ? 'text-red-400' : 'text-white'}`}>{activeComp.health}%</div>
                             </div>
                             <div className="text-right">
                                 <div className="text-[9px] text-slate-500 uppercase">预测故障时间</div>
                                 <div className="text-2xl font-mono font-bold text-white">420h</div>
                             </div>
                        </div>
                    </div>
               </div>
           </div>

           {/* 能量代谢分析曲线 */}
           <SciFiCard title="回转过程功率-扭矩代谢曲线" subtitle="ENERGY METABOLISM" className="h-[220px] border-purple-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={Array.from({length: 30}, (_, i) => ({ t: i, power: 40 + Math.sin(i*0.5)*10, torque: 35 + Math.cos(i*0.5)*15 }))}>
                           <defs>
                               <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/><stop offset="95%" stopColor="#d946ef" stopOpacity={0}/></linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" vertical={false} />
                           <XAxis dataKey="t" hide />
                           <YAxis hide />
                           <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#d946ef'}} />
                           <Area type="monotone" dataKey="power" stroke="#d946ef" fill="url(#pGrad)" strokeWidth={2} name="有功功率" />
                           <Line type="monotone" dataKey="torque" stroke="#0ea5e9" strokeWidth={1} dot={false} name="机械扭矩" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
        </div>

        {/* 右侧：AI 预后与维护决策 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* 剩余寿命 Weibull 分布 */}
           <SciFiCard title="剩余寿命概率分布 (Weibull)" subtitle="SURVIVAL ANALYSIS" className="h-[280px] border-purple-900/50" noPadding>
               <div className="w-full h-full p-4 flex flex-col">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={RUL_DISTRIBUTION}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" vertical={false} />
                               <XAxis dataKey="time" stroke="#6b7280" tick={{fontSize: 9}} label={{value: 'Hours', position: 'insideBottom', offset: -5, fontSize: 10}} />
                               <YAxis hide />
                               <Area type="monotone" dataKey="prob" stroke="#a855f7" fill="#a855f722" strokeWidth={2} />
                               {/* Fix: Added missing ReferenceLine from recharts */}
                               <ReferenceLine x={28} stroke="#ef4444" strokeDasharray="5 5" label={{value: 'Critical', fill: 'red', fontSize: 10}} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="mt-2 text-center text-[10px] text-slate-500 uppercase tracking-widest">
                       Confidence Level: <span className="text-purple-400 font-bold">94.2%</span>
                   </div>
               </div>
           </SciFiCard>

           {/* 智能维保决策 */}
           <SciFiCard title="智能辅助决策引擎" className="flex-1 border-purple-900/50 bg-[#120824]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-orange-950/30 border border-orange-500/40 rounded-xl flex items-start gap-3 shadow-inner">
                       {/* Fix: Added missing AlertTriangle from lucide-react */}
                       <AlertTriangle className="text-orange-500 shrink-0 mt-1" size={20} />
                       <div>
                           <div className="text-xs font-bold text-white uppercase">检测到齿面退化趋势</div>
                           <p className="text-[10px] text-slate-300 leading-relaxed mt-1">
                               回转小齿轮 (Pinion) 的边频带能量呈现非线性增长。建议：暂时限制回转加速度至 85%，以抑制裂纹扩展。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-purple-500 pl-2">下一步推荐操作 (Priority)</div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> T+2h: 执行自动集中润滑增强程序
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> T+4h: 采集减速箱油样进行光谱分析
                       </div>
                       <div className="flex items-center gap-2 text-xs text-red-400 font-bold py-1">
                           <AlertOctagon size={14} className="animate-pulse" /> 建议下次检修：更换二级行星齿轮
                       </div>
                   </div>

                   <button className="mt-auto w-full py-3 bg-purple-700/30 hover:bg-purple-700/50 border border-purple-500/50 rounded-lg text-xs text-purple-100 font-bold transition-all flex items-center justify-center gap-2 group shadow-lg">
                       {/* Fix: Added missing FileText from lucide-react */}
                       <FileText size={16} className="group-hover:translate-x-1 transition-transform" /> 
                       下发预防性维护计划
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>

      {/* 底部装饰条 */}
      <div className="h-6 flex gap-6 text-[10px] text-slate-600 font-mono overflow-hidden items-center px-4 border-t border-slate-900 mt-2">
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> SENSOR_SWING_ACC: ACTIVE</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> TELEMETRY_LINK: STABLE</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-purple-500"></div> AI_COGNITIVE_LOAD: 12.5%</div>
          <div className="flex-1 text-right text-purple-900 font-bold uppercase tracking-widest italic">Mining Intelligence Protocol V2.1</div>
      </div>
    </div>
  );
};
