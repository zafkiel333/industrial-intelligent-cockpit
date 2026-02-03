
import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/ship-engine-fault-prob/ThreeScene';
import { ProbViewMode } from '../../../components/predictive/ship-engine-fault-prob/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie
} from 'recharts';
import { 
  Activity, Zap, ShieldAlert, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  GitBranch, ShieldCheck, Microscope, AlertOctagon,
  // Fix: Added missing MonitorPlay and HardDrive to resolve "Cannot find name" errors on lines 161 and 175
  MonitorPlay, HardDrive
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 故障概率时间演化 (Future Risk Trend)
const PROB_TIMELINE = Array.from({ length: 30 }, (_, i) => ({
    day: `D+${i}`,
    prob: 12 + Math.pow(i/5, 1.8) * 4 + Math.random() * 3,
    confidence: [10 + i, 15 + i*1.5]
}));

// 2. 核心子系统风险值 (System Prob Matrix)
const SYSTEM_RISK_DATA = [
    { name: '燃油喷射', val: 72, status: 'warning' },
    { name: '曲轴轴承', val: 18, status: 'normal' },
    { name: '增压系统', val: 45, status: 'warning' },
    { name: '冷却循环', val: 12, status: 'normal' },
    { name: '启动空气', val: 8, status: 'normal' },
];

// 3. Weibull 概率密度分布 (Failure Rate Density)
const WEIBULL_DIST = Array.from({ length: 40 }, (_, i) => {
    const hours = i * 200;
    const beta = 2.5; 
    const eta = 8000;
    const f = (beta/eta) * Math.pow(hours/eta, beta-1) * Math.exp(-Math.pow(hours/eta, beta));
    return { hours, density: f * 10000 };
});

export const ShipEngineFaultProbPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<ProbViewMode>('bayesian');
    const [overallProb] = useState(18.4);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部数字看板：风险态势感知 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-purple-500/30 p-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-600/20 rounded border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                        <Activity className="text-purple-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            船舶主机故障发生概率预测
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-purple-950/50 border border-purple-800/30 rounded">
                                预测引擎: Prob-Shield v4.8 (Bayesian-LSTM)
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                计算单元: #1 Main Engine | 置信度: 96.5%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">当前瞬时故障概率</div>
                        <div className="text-4xl font-mono font-bold text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                            {overallProb} <span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">平均失效前时间 (MTTF)</div>
                        <div className="text-3xl font-mono font-bold text-cyan-400">1,450 <span className="text-sm">HRS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：子系统概率与推演 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 子系统风险矩阵 */}
                    <SciFiCard title="子系统故障概率矩阵" subtitle="SYSTEM MATRIX" highlight className="bg-[#0c1221]">
                        <div className="space-y-4 py-2">
                            {SYSTEM_RISK_DATA.map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between items-center text-[11px] font-bold">
                                        <span className="text-slate-400 uppercase">{item.name}</span>
                                        <span className={item.val > 60 ? 'text-rose-500' : item.val > 30 ? 'text-orange-400' : 'text-emerald-400'}>
                                            {item.val}%
                                        </span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden flex">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${item.val > 60 ? 'bg-rose-600' : item.val > 30 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                                            style={{ width: `${item.val}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 预测特征雷达图 */}
                    <SciFiCard title="前兆特征耦合分析" subtitle="FEATURE COUPLING">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                    { subject: '热力不均', A: 85, fullMark: 100 },
                                    { subject: '振动能量', A: 42, fullMark: 100 },
                                    { subject: '油液颗粒', A: 65, fullMark: 100 },
                                    { subject: '压力脉动', A: 92, fullMark: 100 },
                                    { subject: '转速偏差', A: 38, fullMark: 100 },
                                ]}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Coupling" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* AI 贝叶斯推理链 */}
                    <SciFiCard title="AI 故障机理推演" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">逻辑链：</span> [燃油高压共振] ➔ [喷油器开启压力异常] ➔ [3号缸排温突增] ➔ <span className="text-white font-bold underline">潜在活塞环拉伤风险</span>。发生概率于最近6小时内由 5% 激增至 72%。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-purple-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <GitBranch size={16} className="text-purple-400" />
                                    <span className="text-[11px] text-slate-300">查看贝叶斯条件概率网络</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D数字孪生与演化 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 风险视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 交互层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-purple-500/30">
                                <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></div>
                                <span className="text-[12px] text-purple-400 font-black tracking-widest uppercase">全系统风险节点概率场实时推演</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大故障倾向</span>
                                    <span className="text-rose-500 font-mono font-bold uppercase tracking-widest">CRITICAL</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">数据主干网通量</span>
                                    <span className="text-white font-mono font-bold">15.2 GB/s</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">模型不确定性 (σ)</span>
                                    <span className="text-emerald-400 font-mono font-bold">0.02%</span>
                                </div>
                            </div>
                        </div>

                        {/* 视角控制 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['bayesian', 'weibull', 'monte-carlo'] as ProbViewMode[]).map((m) => (
                                <button 
                                    key={m}
                                    onClick={() => setViewMode(m)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === m ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {m === 'bayesian' ? '贝叶斯' : m === 'weibull' ? 'Weibull' : '蒙特卡洛'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene overallRisk={overallProb / 100} viewMode={viewMode} />

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 flex items-center justify-center bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl w-3/4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-purple-600 text-purple-400 hover:text-white text-xs font-black rounded border border-purple-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 深度概率下钻
                            </button>
                            <button className="px-10 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all flex items-center gap-3">
                                <MonitorPlay size={16} /> 启动蒙特卡洛生存仿真
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(139,92,246,0.02)_50%)] bg-[length:100%_12px] animate-[scan_15s_linear_infinite]"></div>
                    </div>

                    {/* 风险随时间演化图表 */}
                    <SciFiCard title="未来 30 天故障概率演化趋势" subtitle="TEMPORAL RISK EVOLUTION" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={PROB_TIMELINE}>
                                    <defs>
                                        <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} interval={4} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} label={{ value: '发生概率 (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="prob" stroke="#8b5cf6" strokeWidth={3} fill="url(#probGrad)" name="故障风险预测" />
                                    <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '高风险红色警戒区', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：统计分析与维保排程 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* Weibull 失效密度分布 */}
                    <SciFiCard title="失效概率密度函数 (PDF)" subtitle="WEIBULL DISTRIBUTION">
                        <div className="h-48 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={WEIBULL_DIST} margin={{top:5, right:5, left:-20, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="hours" stroke="#64748b" tick={{fontSize: 9}} label={{ value: 'h', position: 'insideBottomRight', fontSize: 9 }} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Line type="monotone" dataKey="density" stroke="#10b981" strokeWidth={2} dot={false} name="失效密度" />
                                    <ReferenceLine x={4000} stroke="#f59e0b" label={{value:'当前点', fill:'#f59e0b', fontSize:8}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-slate-500 uppercase tracking-widest font-bold">
                            当前处于“耗损失效期”前期
                        </div>
                    </SciFiCard>

                    {/* 预测性检修包 */}
                    <SciFiCard title="预测驱动检修建议" subtitle="MAINTENANCE" className="flex-1">
                        <div className="space-y-3">
                            <div className="p-3 bg-rose-950/20 rounded border border-rose-900/30 flex items-center gap-3">
                                <History size={20} className="text-rose-500" />
                                <div>
                                    <div className="text-[10px] text-slate-100 font-bold">#3缸喷油器整体更换</div>
                                    <div className="text-[9px] text-slate-500">建议时间: 72h 内 | 风险减损: 65%</div>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-900 rounded border border-slate-800 flex items-center gap-3 opacity-60">
                                <Wrench size={20} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">#1-6轴承油膜检查</div>
                                    <div className="text-[9px] text-slate-500">建议时间: 500h 后 | 风险减损: 12%</div>
                                </div>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-800">
                                <button className="w-full py-2 bg-slate-800 hover:bg-purple-700 text-white text-[11px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                                    <HardDrive size={14} /> 调取全机剩余寿命清单
                                </button>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 传感器阵列同步流 */}
                    <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                            <span>计算核心负载</span>
                            <span className="text-green-400">NORMAL</span>
                        </div>
                        <div className="flex gap-1 h-3">
                            {Array.from({length: 15}).map((_, i) => (
                                <div key={i} className="flex-1 bg-indigo-500/30 rounded-sm"></div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* --- 状态页脚 --- */}
            <div className="h-10 bg-purple-950/20 border-t border-purple-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">主控处理器: 在线正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">故障预测模型时延: 24ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-purple-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Prob-Shield Neural Core v4.8 - Predictive Guard
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                    border-radius: 2px;
                }
                @keyframes scan {
                    from { background-position: 0 0; }
                    to { background-position: 0 100%; }
                }
                .animate-spin-slow {
                    animation: spin 15s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
