
import React, { useState, useEffect } from 'react';
import { ShovelOverviewThreeScene } from '../../../components/predictive/mining-shovel-overview/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-mining-0]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-mining-0';
import { ShovelPart } from '../../../components/predictive/mining-shovel-overview/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { 
  Activity, Zap, ShieldAlert, Cpu, 
  Settings, Binary, TrendingUp, History,
  Compass, Gauge, Wind, AlertOctagon, 
  Target, Info, CheckCircle2, Siren,
  ArrowUpRight, Microscope, Scan, Search,
  AlertTriangle, ShieldCheck, Layers, Thermometer, FileText,
  RotateCw, BarChart3, Fingerprint, Waves
} from 'lucide-react';

const MOCK_PARTS: ShovelPart[] = [
  { id: 'hoist', name: '提升驱动系统', health: 94, temp: 62, vibration: 2.1, stress: 0.3, status: 'normal' },
  { id: 'crowd', name: '推压机构总成', health: 88, temp: 68, vibration: 4.5, stress: 0.45, status: 'warning' },
  { id: 'swing', name: '回转驱动系统', health: 76, temp: 75, vibration: 5.8, stress: 0.6, status: 'warning' },
  { id: 'propel', name: '行走机构', health: 92, temp: 45, vibration: 1.2, stress: 0.2, status: 'normal' },
  { id: 'rope', name: '提升钢丝绳', health: 65, temp: 40, vibration: 0.5, stress: 0.75, status: 'warning' },
  { id: 'dipper', name: '铲斗工作系统', health: 48, temp: 35, vibration: 12.4, stress: 0.9, status: 'critical' },
];

const HEALTH_TRAJECTORY = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    wear: 20 + i * 1.5 + Math.random() * 5,
    vibration: 15 + i * 0.8 + Math.sin(i * 0.5) * 10,
    insulation: 100 - i * 0.5
}));

const RISK_PROFILE_RADAR = [
    { subject: '结构疲劳', A: 85, fullMark: 100 },
    { subject: '润滑质量', A: 40, fullMark: 100 },
    { subject: '电气绝缘', A: 95, fullMark: 100 },
    { subject: '热工稳态', A: 78, fullMark: 100 },
    { subject: '传动精度', A: 88, fullMark: 100 },
];

export const ElectricShovelHealthView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'hologram' | 'thermal' | 'mechanical'>('mechanical');
  const [activePartId, setActivePartId] = useState<string | null>('dipper');
  const [simValues, setSimValues] = useState({ swing: 0, hoist: 0.2, crowd: 0.5 });
  const [isScanning, setIsScanning] = useState(false);
  const [healthScore, setHealthScore] = useState(82.4);

  const activeComp = MOCK_PARTS.find(c => c.id === activePartId) || MOCK_PARTS[0];

  useEffect(() => {
    const interval = setInterval(() => {
        const t = Date.now() / 2000;
        setSimValues({
            swing: Math.sin(t * 0.5) * 45,
            hoist: 0.5 + Math.sin(t) * 0.4,
            crowd: 0.5 + Math.cos(t) * 0.3
        });
        setHealthScore(prev => Math.max(10, prev + (Math.random() - 0.52) * 0.1));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#02040a] text-cyan-50 p-2 overflow-y-auto custom-scrollbar selection:bg-cyan-500/30">
      
      {/* 顶部：战略运行 HUD */}
      <div className="flex justify-between items-end border-b border-cyan-900/40 pb-4 bg-gradient-to-r from-[#0c1a2e] to-transparent px-4">
        <div className="flex gap-6 items-center">
            <div className="p-4 bg-cyan-600/20 rounded-xl border border-cyan-500/50 shadow-[0_0_30px_rgba(56,189,248,0.4)]">
                <Siren size={36} className="text-cyan-400 animate-pulse" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-[0.2em] font-bold">
                    <Binary size={14} /> WK-55 Rope Shovel Fleet Intelligence Protocol
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    电铲整机 <span className="text-cyan-400 italic text-shadow-glow">健康状态评估总览</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center pointer-events-auto">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">整机健康评分 (GHI)</div>
                <div className={`text-5xl font-mono font-bold ${healthScore < 75 ? 'text-orange-500' : 'text-green-400'}`}>
                    {healthScore.toFixed(1)}
                </div>
            </div>
            <div className="h-12 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">剩余维护间隔 (RMI)</div>
                <div className="text-3xl font-mono font-bold text-white">1,240 <span className="text-sm">h</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-10">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-orange-400 mb-1">AI 预测风险状态</div>
                <div className="flex items-center gap-2 text-2xl font-bold text-white uppercase font-mono bg-red-900/20 px-3 py-1 rounded border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                    <AlertTriangle size={24} className="text-red-500 animate-bounce" /> MODERATE
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：子系统健康 DNA & 失效构成 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           <SciFiCard title="子系统健康序列" subtitle="HEALTH PULSE" className="flex-1 border-cyan-900/50 bg-[#081224]/80">
               <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {MOCK_PARTS.map(part => (
                       <div 
                         key={part.id}
                         onClick={() => setActivePartId(part.id)}
                         className={`p-3 rounded border transition-all cursor-pointer relative group overflow-hidden
                            ${activePartId === part.id ? 'bg-cyan-950 border-cyan-500 shadow-lg scale-[1.02]' : 'bg-slate-900/40 border-slate-800 hover:border-cyan-500/30'}
                         `}
                       >
                           {activePartId === part.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_cyan]"></div>}
                           <div className="flex justify-between items-center mb-2">
                               <div className="flex items-center gap-2">
                                   <div className={`w-1.5 h-1.5 rounded-full ${part.status === 'critical' ? 'bg-red-500 animate-ping' : part.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                   <span className="text-sm font-bold text-slate-100 group-hover:text-blue-300 transition-colors">{part.name}</span>
                               </div>
                               <span className={`text-xs font-mono font-bold ${part.health > 80 ? 'text-green-400' : part.health > 50 ? 'text-yellow-400' : 'text-red-500'}`}>
                                   {part.health}%
                               </span>
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full ${part.health > 80 ? 'bg-green-500' : part.health > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                 style={{width: `${part.health}%`}}
                               ></div>
                           </div>
                           <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-mono">
                               <span>振动: {part.vibration} mm/s</span>
                               <span>应力: {(part.stress * 100).toFixed(0)}%</span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="主导失效因子分布" subtitle="FAILURE DRIVERS" className="h-[280px] border-cyan-900/50">
               <div className="w-full h-full flex flex-col items-center">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie
                               data={[
                                   { name: '机械磨损', value: 45, fill: '#0ea5e9' },
                                   { name: '液压异常', value: 25, fill: '#f59e0b' },
                                   { name: '结构疲劳', value: 20, fill: '#ef4444' },
                                   { name: '电气老化', value: 10, fill: '#10b981' },
                               ]}
                               innerRadius={55}
                               outerRadius={75}
                               paddingAngle={5}
                               dataKey="value"
                           >
                           </Pie>
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                       </PieChart>
                   </ResponsiveContainer>
                   <div className="grid grid-cols-2 gap-2 w-full px-2 -mt-4 pb-2">
                        {[
                            { name: '机械磨损', color: '#0ea5e9' },
                            { name: '结构疲劳', color: '#ef4444' }
                        ].map(item => (
                            <div key={item.name} className="flex items-center gap-2 text-[10px] text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: item.color}}></div>
                                <span>{item.name}</span>
                            </div>
                        ))}
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D数字孪生与演化轨迹 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口：全息健康场 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#0a1120] to-[#02040a] border border-cyan-800/40 relative rounded-2xl overflow-hidden shadow-[inset_0_0_100px_rgba(56,189,248,0.15)] group">
               
               {/* 视口 HUD 层 */}
               <div className="absolute top-6 left-6 z-10 pointer-events-none space-y-4">
                   <div className="bg-black/70 backdrop-blur-md border border-cyan-500/30 px-5 py-4 rounded-lg flex flex-col gap-3 shadow-2xl pointer-events-auto">
                       <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Fingerprint size={14} /> Shovel Dynamic Kinematic Simulator
                       </div>
                       <div className="flex items-center gap-10">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase mb-1">回转速率</div>
                               <div className="text-2xl font-mono font-bold text-white">12.5 <span className="text-xs">deg/s</span></div>
                           </div>
                           <div className="w-[1px] h-10 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase mb-1">瞬时挖掘力</div>
                               <div className="text-2xl font-mono font-bold text-cyan-400">1,840 <span className="text-xs">kN</span></div>
                           </div>
                       </div>
                   </div>

                   <div className="flex gap-3 pointer-events-auto">
                        <button 
                            onClick={() => setIsScanning(!isScanning)}
                            className={`px-3 py-1 border rounded text-[10px] flex items-center gap-2 transition-all 
                                ${isScanning ? 'bg-cyan-900 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-700 text-slate-500'}
                            `}
                        >
                            <Scan size={14} className={isScanning ? 'animate-pulse' : ''} /> 结构扫描 {isScanning ? 'ACTIVE' : 'OFF'}
                        </button>
                        <div className="px-3 py-1 bg-blue-900/40 border border-blue-500/30 rounded text-[10px] text-blue-200 flex items-center gap-2">
                            <ShieldCheck size={12} /> 机电系统同步中
                        </div>
                   </div>
               </div>

               {/* 右侧：显示模式切换 */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-3 pointer-events-auto">
                   <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700 flex flex-col gap-2 shadow-2xl backdrop-blur">
                       <button onClick={() => setViewMode('hologram')} className={`p-3 rounded-lg transition-all ${viewMode === 'hologram' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}><Layers size={20} /></button>
                       <button onClick={() => setViewMode('mechanical')} className={`p-3 rounded-lg transition-all ${viewMode === 'mechanical' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}><Scan size={20} /></button>
                       <button onClick={() => setViewMode('thermal')} className={`p-3 rounded-lg transition-all ${viewMode === 'thermal' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}><Thermometer size={20} /></button>
                   </div>
               </div>

               <ShovelOverviewThreeScene 
                   parts={MOCK_PARTS}
                   swingAngle={simValues.swing}
                   hoistExtension={simValues.hoist}
                   crowdExtension={simValues.crowd}
                   viewMode={viewMode}
                   activePartId={activePartId}
                   onPartClick={setActivePartId}
                   isScanning={isScanning}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

               {/* 底部 HUD：异常部件锁定 */}
               <div className="absolute bottom-8 left-6 right-6 z-10 flex gap-4 pointer-events-none animate-in slide-in-from-bottom-6">
                    <div className={`flex-1 bg-black/60 backdrop-blur-md border-l-4 ${activeComp.status === 'critical' ? 'border-red-500' : 'border-blue-500'} p-4 rounded-r-lg flex justify-between items-center shadow-2xl`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${activeComp.status === 'critical' ? 'bg-red-950/40' : 'bg-blue-950/40'} rounded flex items-center justify-center border border-white/10`}>
                                {activeComp.status === 'critical' ? <AlertOctagon size={28} className="text-red-500 animate-pulse" /> : <Settings size={28} className="text-blue-500" />}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white uppercase tracking-widest mb-1">重点特征分析：{activeComp.name}</div>
                                <div className={`text-[11px] ${activeComp.status === 'critical' ? 'text-red-400' : 'text-slate-400'} leading-tight`}>
                                    诊断：{activeComp.id === 'dipper' ? '检测到铲斗左侧斗齿出现由于异常应力集中引起的疲劳微裂纹声发射。' : '当前部件运行参数处于稳定分布区间。'}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-10">
                             <div className="text-right">
                                 <div className="text-[9px] text-slate-500 uppercase mb-1">当前健康值</div>
                                 <div className={`text-2xl font-mono font-bold ${activeComp.health < 60 ? 'text-red-400' : 'text-white'}`}>{activeComp.health}%</div>
                             </div>
                             <div className="text-right">
                                 <div className="text-[9px] text-slate-500 uppercase mb-1">预测剩余循环</div>
                                 <div className="text-2xl font-mono font-bold text-white">12,450</div>
                             </div>
                        </div>
                    </div>
               </div>
           </div>

           {/* 健康演变轨迹 */}
           <SciFiCard title="多维健康演化预测 (72H)" subtitle="PROGNOSTICS TRAJECTORY" className="h-[220px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4 flex gap-6">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={HEALTH_TRAJECTORY}>
                               <defs>
                                   <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 9}} interval={4} />
                               <YAxis domain={[0, 100]} stroke="#64748b" tick={{fontSize: 9}} />
                               <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#ef4444'}} />
                               <Area type="monotone" dataKey="wear" stroke="#ef4444" fill="url(#riskGrad)" name="磨损风险" />
                               <Area type="monotone" dataKey="vibration" stroke="#f59e0b" fill="none" name="振动响应" />
                               <Area type="monotone" dataKey="insulation" stroke="#10b981" fill="none" name="电气绝缘" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="w-48 border-l border-slate-800 pl-6 flex flex-col justify-center gap-3">
                        <div className="bg-slate-900/60 p-2 rounded">
                            <div className="text-[9px] text-slate-500 uppercase">预测模型收敛度</div>
                            <div className="text-sm font-bold text-green-400">98.5% (Strong)</div>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded">
                            <div className="text-[9px] text-slate-500 uppercase">算法引擎版本</div>
                            <div className="text-sm font-bold text-white">XGB-SHOVEL v4.2</div>
                        </div>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* 右侧：综合画像与维护建议 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* 全局评估雷达 */}
           <SciFiCard title="整机健康多维画像" subtitle="KPI RADAR" className="h-[300px] border-cyan-900/50">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RISK_PROFILE_RADAR}>
                           <PolarGrid stroke="#1e293b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Status" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* AI 维护决策系统 */}
           <SciFiCard title="AI 辅助维护决策" className="flex-1 border-cyan-900/50 bg-[#1a1c2e]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-4 bg-orange-950/30 border border-orange-500/40 rounded-xl flex items-start gap-3 shadow-inner">
                       <ShieldCheck className="text-green-500 shrink-0 mt-1" size={24} />
                       <div>
                           <div className="text-sm font-bold text-white uppercase tracking-wider">劣化对冲策略建议</div>
                           <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                               检测到铲斗左侧斗齿出现严重不均匀磨损。建议：暂时将主挖掘角调整 +3°，可减少 15% 的偏心载荷，延长运行周期。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-cyan-500 pl-2">下一步推荐行动 (Priority)</div>
                       <div className="flex items-center gap-3 text-xs text-slate-200 py-1.5 border-b border-slate-800/50">
                           <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center font-mono font-bold text-blue-400">01</div>
                           <span>在线校准回转电机零点偏移</span>
                       </div>
                       <div className="flex items-center gap-3 text-xs text-slate-200 py-1.5 border-b border-slate-800/50">
                           <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center font-mono font-bold text-blue-400">02</div>
                           <span>执行提升钢丝绳全通磁探伤</span>
                       </div>
                       <div className="flex items-center gap-2 text-xs text-red-400 font-bold py-1.5">
                           <div className="w-6 h-6 bg-red-950 rounded flex items-center justify-center font-mono font-bold text-red-400">03</div>
                           <span>预计 T+72h 停机更换 5号斗齿</span>
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
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> TELEMETRY_STREAM: ACTIVE</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> GNSS_LOCK: HIGH_PRECISION</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-500"></div> MODEL_SYNC: 0.1s LATENCY</div>
          <div className="flex-1 text-right text-blue-900 font-bold uppercase tracking-widest italic">Mining Intelligence Protocol V4.2 - Integrated Diagnostics</div>
      </div>
    </div>
  );
};
