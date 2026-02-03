
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/hoist-failure/ThreeScene';
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
  Search, ScanLine, Link, Box, ArrowUpCircle,
  HardDrive, MonitorPlay, Hammer, Hourglass, 
  Calendar, Flame, Microscope
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 健康熵演化轨迹 (Health Entropy Evolution)
const ENTROPY_DATA = Array.from({ length: 30 }, (_, i) => ({
    day: `T-${30-i}`,
    entropy: 12 + Math.pow(i/10, 2) + Math.random() * 2,
    efficiency: 98 - Math.pow(i/15, 1.5) * 5
}));

// 2. 失效概率密度预测 (Failure Probability Density - Weibull)
const WEIBULL_DIST = Array.from({ length: 40 }, (_, i) => {
    const hours = i * 24;
    // 模拟 Weibull 概率分布
    const prob = Math.exp(-Math.pow(hours/600, 3.5)) * Math.pow(hours/600, 2.5) * 100;
    return { hours, prob };
});

// 3. 未来 30 天失效风险轴 (Future Risk Timeline)
const RISK_TIMELINE = Array.from({ length: 30 }, (_, i) => ({
    date: `06-${i+1}`,
    risk: i < 15 ? 10 + i : 25 + Math.pow(i-15, 2.2),
    threshold: 80
}));

export const HoistFailureWindowPmView: React.FC = () => {
    const [operatingLoad, setOperatingLoad] = useState(85); // %
    const [riskIndex] = useState(72.4);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：失效时空指挥部 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-rose-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-rose-600/20 rounded border border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                        <Hourglass className="text-rose-400 animate-pulse" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            提升机失效时间窗口 (TTF) 预测系统
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-rose-950/50 border border-rose-800/30 rounded">
                                预测引擎: Temporal-LSTM v5.2
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                计算置信度: 94.8% (CI: 0.95)
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">中值失效剩余时间</div>
                        <div className="text-4xl font-mono font-bold text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                            542 <span className="text-sm">HRS</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">失效窗口期</div>
                        <div className="text-2xl font-mono font-bold text-amber-400">06-22 ~ 06-28</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：演化轨迹与熵增分析 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    <SciFiCard title="系统健康熵演化" subtitle="HEALTH ENTROPY" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={ENTROPY_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="entGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="day" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="entropy" stroke="#f43f5e" fill="url(#entGrad)" strokeWidth={2} name="健康熵" />
                                    <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={1} dot={false} name="机械效率" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-3 bg-slate-900 rounded border border-slate-800">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-500 uppercase">当前熵增率</span>
                                <span className="text-rose-400 font-bold font-mono">+0.24 bits/day</span>
                            </div>
                        </div>
                    </SciFiCard>

                    <SciFiCard title="多变量退化特征" subtitle="DEGRADATION">
                        <div className="space-y-4 py-2">
                            {[
                                { label: '轴承磨损特征 (Vib)', val: 78, status: 'warning' },
                                { label: '电机绝缘阻抗', val: 92, status: 'normal' },
                                { label: '制动盘热疲劳', val: 65, status: 'critical' },
                                { label: '主轴承间隙偏移', val: 84, status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-400 uppercase">{item.label}</span>
                                        <span className={item.status === 'critical' ? 'text-rose-500' : 'text-slate-100'}>{item.val}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full transition-all duration-1000 ${item.status === 'critical' ? 'bg-rose-600 animate-pulse' : item.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                          style={{ width: `${item.val}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    <SciFiCard title="AI 演化推演报告" subtitle="AI INFERENCE" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">深度学习分析：</span> 观察到“能量-频率”耗散模式匹配 <span className="text-white font-black underline">轴承早期剥落</span> 演化模型。预测在连续高负荷运行 12 班次后将进入加速劣后期。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-rose-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-rose-400" />
                                    <span className="text-[11px] text-slate-300">调取同型号历史失效谱图</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：时空数字孪生与预测窗口 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-rose-500/30">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                                <span className="text-[12px] text-rose-400 font-black tracking-widest uppercase">提升动力核心全维预测扫描</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">预测运行总时长</span>
                                    <span className="text-white font-mono font-bold">15,420 h</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">已用寿命占比</span>
                                    <span className="text-rose-400 font-mono font-bold">92.4%</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">热应力强度</span>
                                    <span className="text-amber-400 font-mono font-bold">42.8%</span>
                                </div>
                            </div>
                        </div>

                        <ThreeScene riskLevel={riskIndex / 100} />

                        {/* 底部交互滑块 - 工况模拟 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-2/3 bg-black/70 backdrop-blur border border-slate-700 p-4 rounded-sm flex items-center gap-6">
                            <div className="flex-1">
                                <div className="flex justify-between text-[10px] text-slate-400 mb-2">
                                    <span>工况负载模拟 (Operating Load)</span>
                                    <span className="text-rose-400 font-bold">{operatingLoad}%</span>
                                </div>
                                <input 
                                    type="range" min="50" max="120" step="1" 
                                    value={operatingLoad} 
                                    onChange={(e) => setOperatingLoad(parseInt(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500" 
                                />
                            </div>
                            <div className="text-right whitespace-nowrap">
                                <div className="text-[9px] text-slate-500 uppercase">预测窗口偏移</div>
                                <div className="text-sm font-bold text-white">{(operatingLoad > 100 ? '-' : '+')}{Math.abs(100 - operatingLoad) * 4} HRS</div>
                            </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(244,63,94,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* Weibull 概率分布图表 */}
                    <SciFiCard title="失效概率密度函数 (Probability Density - Weibull)" subtitle="RELIABILITY FORECAST" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={WEIBULL_DIST}>
                                    <defs>
                                        <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="hours" stroke="#64748b" tick={{fontSize: 10}} label={{ value: '未来运行时间 (h)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: '失效概率 (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="prob" stroke="#f43f5e" strokeWidth={3} fill="url(#probGrad)" name="失效概率密度" />
                                    <ReferenceLine x={542} stroke="#fff" strokeDasharray="5 5" label={{ value: '当前预测点', fill: '#fff', fontSize: 10, position: 'top' }} />
                                    <ReferenceLine x={680} stroke="#ef4444" label={{ value: '极限失效点', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：风险轴与决策 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 未来 30 天风险趋势 */}
                    <SciFiCard title="未来 30 天风险演化趋势" subtitle="RISK TIMELINE">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={RISK_TIMELINE} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <XAxis dataKey="date" hide />
                                    <YAxis hide domain={[0, 100]} />
                                    <Area type="step" dataKey="risk" stroke="#f97316" fill="#f97316" fillOpacity={0.1} />
                                    <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 space-y-2">
                            <div className="flex justify-between text-[10px]">
                                <span className="text-slate-500">2024-06-22</span>
                                <span className="text-orange-500 font-bold italic">风险激增开始</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                                <span className="text-slate-500">2024-06-28</span>
                                <span className="text-red-600 font-bold italic">进入不可控故障期</span>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 维护资源推荐 */}
                    <SciFiCard title="预测驱动备件需求" subtitle="SPARE PARTS" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { item: '轴承 Z-204 组', qty: '2', status: 'In Stock', color: 'text-green-400' },
                                { item: '主轴密封圈 (氟橡胶)', qty: '4', status: 'Ordering', color: 'text-amber-400' },
                                { item: '减速机齿轮油 (VG220)', qty: '200L', status: 'Ready', color: 'text-green-400' },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-rose-500/30 transition-all">
                                    <div>
                                        <div className="text-[11px] text-slate-300 font-bold">{s.item}</div>
                                        <div className="text-[9px] text-slate-500">需求量: {s.qty}</div>
                                    </div>
                                    <span className={`text-[10px] font-bold ${s.color}`}>{s.status}</span>
                                </div>
                            ))}
                            <div className="mt-auto pt-4">
                                <button className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded border border-rose-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                                    <Wrench size={14} /> 预约 06-24 预防性大修
                                </button>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 近期类似失效指纹 */}
                    <SciFiCard title="相似案例匹配" subtitle="MATCHING">
                        <div className="flex items-center gap-4 p-2 bg-slate-900 rounded border border-slate-800">
                             <div className="w-12 h-12 rounded border border-rose-900/50 flex items-center justify-center bg-rose-950/20">
                                <History className="text-rose-500" size={20} />
                             </div>
                             <div>
                                <div className="text-[11px] font-bold text-slate-100">Case #H-2023-11</div>
                                <div className="text-[9px] text-slate-500">特征相似度: <span className="text-white font-bold">88.5%</span></div>
                                <div className="text-[9px] text-rose-400 italic">导致 24h 非计划停机</div>
                             </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚 --- */}
            <div className="h-10 bg-rose-950/20 border-t border-rose-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测节点: 活跃</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">剩余失效概率计算中...</span>
                    </div>
                </div>
                <div className="text-[10px] text-rose-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Temporal-Inference Engine v5.2.1 - Active Protection
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
