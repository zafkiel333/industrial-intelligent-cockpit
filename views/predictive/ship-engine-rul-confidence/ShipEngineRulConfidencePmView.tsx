
import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/ship-engine-rul-confidence/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter
} from 'recharts';
import { 
  Activity, Zap, ShieldAlert, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Eye, Microscope, Sliders, LineChart as ChartIcon,
  Box, Calculator, AlertOctagon, HeartPulse, Sparkles,
  // Fix: Added missing imports to resolve "Cannot find name" errors on lines 108, 124, 161
  Info, MonitorPlay, ShieldCheck
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 置信区间演化轨迹 (Confidence Band Evolution)
const CONFIDENCE_TRAJECTORY = Array.from({ length: 30 }, (_, i) => {
    const mean = 85 - Math.pow(i/5, 1.8) * 3;
    const std = 2 + (i * 0.4); // 预测越久，标准差越大
    return {
        day: `T+${i}`,
        mean: mean,
        ci95_high: mean + 1.96 * std,
        ci95_low: mean - 1.96 * std,
        ci90_high: mean + 1.64 * std,
        ci90_low: mean - 1.64 * std,
    };
});

// 2. 概率密度函数 (Probability Density Function - Gaussian)
const PDF_DATA = Array.from({ length: 40 }, (_, i) => {
    const x = i + 60; // RUL value range
    const mean = 80;
    const sigma = 5;
    const y = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / sigma, 2));
    return { x, y: y * 100 };
});

// 3. 特征敏感度 (Feature Sensitivity to Variance)
const SENSITIVITY_DATA = [
    { name: '燃油压力波动', val: 85, impact: 'High' },
    { name: '曲轴震动模态', val: 62, impact: 'Med' },
    { name: '扫气箱油雾', val: 45, impact: 'Med' },
    { name: '冷却水压偏差', val: 28, impact: 'Low' },
    { name: '增压器转速差', val: 12, impact: 'Low' },
];

export const ShipEngineRulConfidencePmView: React.FC = () => {
    const [uncertainty, setUncertainty] = useState(0.32);
    const [confidenceLevel, setConfidenceLevel] = useState(0.95);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部数字看板：置信度态势 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-purple-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-purple-600/20 rounded-sm border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                        <Sparkles className="text-purple-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            主机剩余寿命(RUL)置信区间分析
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-purple-950/50 border border-purple-800/30 rounded">
                                统计模型: Bayesian-Monte-Carlo-v2
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                采样序列: Real-time Markov Stream
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">中值剩余寿命预测</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            1,452 <span className="text-sm">HRS</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">95% 置信窗口</div>
                        <div className="text-3xl font-mono font-bold text-purple-400">± 124 <span className="text-sm">HRS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵布局 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：特征权重与敏感度 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 特征敏感度矩阵 */}
                    <SciFiCard title="预测不确定性贡献因子" subtitle="SENSITIVITY ANALYSIS" highlight className="bg-[#0c1221]">
                        <div className="space-y-4 py-2">
                            {SENSITIVITY_DATA.map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between items-center text-[11px] font-bold">
                                        <span className="text-slate-400 uppercase">{item.name}</span>
                                        <span className={item.impact === 'High' ? 'text-rose-500' : 'text-cyan-400'}>
                                            {item.val}%
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${item.impact === 'High' ? 'bg-rose-600' : 'bg-cyan-500'}`} 
                                            style={{ width: `${item.val}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 置信度雷达图 */}
                    <SciFiCard title="数据源可信度评分" subtitle="DATA RELIABILITY">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                    { subject: '传感器精度', A: 95, fullMark: 100 },
                                    { subject: '工况稳定性', A: 42, fullMark: 100 },
                                    { subject: '算法收敛度', A: 88, fullMark: 100 },
                                    { subject: '历史样本量', A: 75, fullMark: 100 },
                                    { subject: '实时信噪比', A: 92, fullMark: 100 },
                                ]}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Reliability" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 预测参数调优 */}
                    <SciFiCard title="预测参数动态调优" subtitle="HYPER-PARAMETERS" className="flex-1">
                        <div className="space-y-6 px-1">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-widest">
                                    <span>不确定性容差 (Uncertainty)</span>
                                    <span className="text-purple-400 font-mono">σ={uncertainty.toFixed(2)}</span>
                                </div>
                                <input 
                                    type="range" min="0.1" max="0.9" step="0.01" 
                                    value={uncertainty} 
                                    onChange={(e) => setUncertainty(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" 
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-widest">
                                    <span>置信水平 (Confidence Level)</span>
                                    <span className="text-cyan-400 font-mono">{(confidenceLevel*100).toFixed(0)}%</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {[0.9, 0.95, 0.99].map(cl => (
                                        <button 
                                            key={cl}
                                            onClick={() => setConfidenceLevel(cl)}
                                            className={`py-1.5 rounded text-[10px] font-bold border transition-all
                                                ${confidenceLevel === cl ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_10px_cyan]' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}
                                            `}
                                        >
                                            {cl * 100}%
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-3 bg-indigo-950/20 border border-indigo-800/30 rounded text-[10px] text-indigo-200 leading-relaxed italic">
                                <Info className="inline mr-2" size={12} />
                                调高置信水平会显著拉宽寿命预测窗口，用于极端工况下的保守维保决策。
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：不确定性数字孪生 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 概率场透视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">主机寿命不确定性全息场扫描</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前误差范围 (σ)</span>
                                    <span className="text-rose-500 font-mono font-bold">± 4.8%</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">后验收敛速率</span>
                                    <span className="text-white font-mono font-bold">0.14 s⁻¹</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">蒙特卡洛迭代</span>
                                    <span className="text-emerald-400 font-mono font-bold">10k+</span>
                                </div>
                            </div>
                        </div>

                        <ThreeScene uncertainty={uncertainty} confidenceLevel={confidenceLevel} />

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-cyan-600 text-cyan-400 hover:text-white text-xs font-black rounded border border-cyan-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 特征敏感性下钻
                            </button>
                            <button className="px-10 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all flex items-center gap-3">
                                <MonitorPlay size={16} /> 启动动态仿真
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 置信区间演化预测曲线 */}
                    <SciFiCard title="寿命预测置信带演化图 (Confidence Band)" subtitle="TEMPORAL UNCERTAINTY" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={CONFIDENCE_TRAJECTORY}>
                                    <defs>
                                        <linearGradient id="band95" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="band90" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} interval={5} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[40, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Area type="monotone" dataKey="ci95_high" stroke="none" fill="url(#band95)" name="95% CI 边界" />
                                    <Area type="monotone" dataKey="ci95_low" stroke="none" fill="#020617" />
                                    <Area type="monotone" dataKey="ci90_high" stroke="none" fill="url(#band90)" name="90% CI 边界" />
                                    <Area type="monotone" dataKey="ci90_low" stroke="none" fill="#020617" />
                                    <Line type="monotone" dataKey="mean" stroke="#0ea5e9" strokeWidth={3} dot={false} name="预测均值轨迹" />
                                    <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '维保门限', fill: '#ef4444', fontSize: 10, position: 'insideTopLeft' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：后验分布与决策反馈 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 概率密度分布 (PDF) */}
                    <SciFiCard title="寿命概率密度分布 (PDF)" subtitle="PROBABILITY DISTRIBUTION">
                        <div className="h-48 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={PDF_DATA} margin={{top:5, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="pdfGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="x" stroke="#64748b" tick={{fontSize: 9}} label={{ value: 'RUL (h)', position: 'insideBottomRight', fontSize: 9 }} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="y" stroke="#10b981" fill="url(#pdfGrad)" strokeWidth={2} name="概率密度" />
                                    <ReferenceLine x={80} stroke="#f59e0b" label={{value:'均值', fill:'#f59e0b', fontSize:8}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-slate-500 uppercase tracking-widest font-bold">
                            当前分布：正态收敛 (σ = 4.2)
                        </div>
                    </SciFiCard>

                    {/* 置信度决策建议 */}
                    <SciFiCard title="置信驱动维保建议" subtitle="O&M DECISIONS" className="flex-1">
                        <div className="space-y-3">
                            <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded flex items-center gap-3">
                                <ShieldCheck size={20} className="text-emerald-500" />
                                <div>
                                    <div className="text-[10px] text-slate-100 font-bold">高置信度 (Low Risk)</div>
                                    <div className="text-[9px] text-slate-500">建议维持当前 18kn 经济航速</div>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-900 rounded border border-slate-800 flex items-center gap-3 opacity-60">
                                <Activity size={20} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">置信区间突破阈值响应</div>
                                    <div className="text-[9px] text-slate-500">当 95% 窗口宽于 200h 时触发报警</div>
                                </div>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-800">
                                <button className="w-full py-2 bg-slate-800 hover:bg-purple-700 text-white text-[11px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                                    <Calculator size={14} /> 执行马尔可夫链蒙特卡洛模拟
                                </button>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 模型同步状态 */}
                    <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                            <span>计算单元负载</span>
                            <span className="text-green-400">OPTIMAL</span>
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
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">统计引擎: 在线稳定</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">不确定性解析时延: 12ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-purple-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Bayesian-Probability-Shield v2.0 - Active Analytics
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
