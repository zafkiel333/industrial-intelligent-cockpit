
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/hoist-rope/ThreeScene';
import { RopeViewMode } from '../../components/predictive/hoist-rope/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  Activity, Zap, ShieldAlert, Cpu, AlertTriangle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Wind, Radio, Play, Pause, FastForward, Link,
  Eye, Microscope, Sliders
} from 'lucide-react';

// --- MOCK DATA ---

// 1. MFL 电磁探伤信号 (Magnetic Flux Leakage)
const MFL_SIGNAL_DATA = Array.from({ length: 100 }, (_, i) => ({
    dist: i,
    leakage: 10 + Math.random() * 5 + (i === 45 ? 65 : 0) + (i === 46 ? 55 : 0), // 模拟断丝尖峰
    noise: 5 + Math.random() * 3
}));

// 2. 弯曲疲劳循环统计 (Bending Cycles vs Damage)
const FATIGUE_CYCLES = Array.from({ length: 24 }, (_, i) => ({
    month: `M-${23-i}`,
    cycles: 12000 + Math.sin(i/2) * 2000,
    accumulation: Math.pow(i/23, 2.5) * 0.75
}));

// 3. 寿命概率分布 (Reliability Prediction)
const RELIABILITY_DATA = Array.from({ length: 20 }, (_, i) => {
    const x = i * 100;
    return {
        hours: x,
        prob: Math.exp(-Math.pow(x / 1500, 3.5)) * 100
    };
});

export const HoistRopePmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<RopeViewMode>('standard');
    const [wearIndex] = useState(0.68); // 68% fatigue
    const [brokenWires] = useState(4); // detected broken wires in standard section

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：索道健康控制塔 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-purple-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-purple-600/20 rounded-full border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                        <Link className="text-purple-400 rotate-45" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            提升机钢丝绳疲劳全生命周期预测
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-purple-950/50 border border-purple-800/30 rounded">
                                计算模型: Palmgren-Miner-Neural v4.2
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                绳径: 42.0mm | 结构: 6x36WS+IWR
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">疲劳损伤积累度</div>
                        <div className="text-4xl font-mono font-bold text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                            0.684 <span className="text-sm">D</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">强制退役预测窗口</div>
                        <div className="text-3xl font-mono font-bold text-rose-500 animate-pulse">428 <span className="text-sm">HRS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主分析交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：电磁特征与微观缺陷 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* MFL 磁粉检测瀑布图 */}
                    <SciFiCard title="磁通泄漏检测 (MFL)" subtitle="NDT REAL-TIME" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={MFL_SIGNAL_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="mflGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="dist" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="leakage" stroke="#a855f7" fill="url(#mflGrad)" strokeWidth={2} name="磁通变化" />
                                    <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-3 bg-rose-950/20 rounded border border-rose-500/30 flex items-center gap-3">
                            <Magnet className="text-rose-500 animate-pulse" size={20} />
                            <div>
                                <div className="text-[10px] text-rose-200 uppercase font-bold">断丝征兆锁定</div>
                                <div className="text-xs text-white font-mono">位置: 1,425.4m | 数量峰值: {brokenWires}</div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 弯曲应力谱 */}
                    <SciFiCard title="弯曲疲劳循环分析" subtitle="BENDING DYNAMICS">
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={FATIGUE_CYCLES}>
                                    <XAxis dataKey="month" hide />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                    <Bar dataKey="cycles" fill="#334155" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="accumulation" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex justify-between text-[10px] text-slate-500 uppercase">
                            <span>累计循环: 2,450,000</span>
                            <span className="text-purple-400">D-Rate: +0.02%/day</span>
                        </div>
                    </SciFiCard>

                    {/* AI 劣化推演报告 */}
                    <SciFiCard title="神经网络诊断结论" subtitle="AI INFERENCE" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2" size={14} />
                                模型提示：当前弯曲疲劳与“微氧化腐蚀”呈现高度复合相关性。
                                预测在 <span className="text-white font-bold">60天</span> 后进入“加剧损伤期”，建议调整自动涂油机压力。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-purple-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-purple-400" />
                                    <span className="text-[11px] text-slate-300">调取电子内窥镜历史影像</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-purple-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Sliders size={16} className="text-purple-400" />
                                    <span className="text-[11px] text-slate-300">调优动态预警阈值</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D数字孪生与结构透视 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 索道结构视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-purple-500/30">
                                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_purple]"></div>
                                <span className="text-[12px] text-purple-400 font-black tracking-widest uppercase">全截面磁场完整性同步仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大截面积损失</span>
                                    <span className="text-white font-mono font-bold">2.4% LMA</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">钢丝疲劳储备</span>
                                    <span className={`font-mono font-bold ${wearIndex > 0.6 ? 'text-orange-500' : 'text-emerald-400'}`}>32%</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">润滑油膜连续度</span>
                                    <span className="text-blue-400 font-mono font-bold">94%</span>
                                </div>
                            </div>
                        </div>

                        {/* 视图切换 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['standard', 'magnetic', 'fatigue-map'] as RopeViewMode[]).map((mode) => (
                                <button 
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === mode ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {mode === 'standard' ? '实物' : mode === 'magnetic' ? '电磁' : '疲劳'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene wearIndex={wearIndex} viewMode={viewMode} />

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-purple-600 text-purple-400 hover:text-white text-xs font-black rounded border border-purple-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 微米级损伤探测
                            </button>
                            <button className="px-10 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all flex items-center gap-3">
                                <ScanLine size={16} /> 启动全量NDT扫描
                            </button>
                        </div>
                        
                        {/* 扫描线效果 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(168,85,247,0.02)_50%)] bg-[length:100%_12px] animate-[scan_15s_linear_infinite]"></div>
                    </div>

                    {/* 残余寿命Weibull分布 */}
                    <SciFiCard title="残余寿命概率分布 (Reliability Prediction)" subtitle="WEIBULL DISTRIBUTION" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={RELIABILITY_DATA}>
                                    <defs>
                                        <linearGradient id="relGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="hours" stroke="#64748b" tick={{fontSize: 10}} label={{ value: '预测运行时间 (hrs)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: '存活概率 (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="prob" stroke="#8b5cf6" strokeWidth={3} fill="url(#relGrad)" name="可靠性" />
                                    <ReferenceLine x={428} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '强制报废点', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：环境因子与风险管理 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 环境劣化因子 */}
                    <SciFiCard title="环境劣化应力监测" subtitle="ENVIRONMENTAL">
                        <div className="space-y-4 py-2">
                            {[
                                { label: '环境相对湿度', val: 78, unit: '%', status: 'warning' },
                                { label: '盐雾腐蚀浓度', val: 12, unit: 'ppm', status: 'normal' },
                                { label: '润滑脂残存厚度', val: 45, unit: 'μm', status: 'warning' },
                                { label: '环境二氧化硫', val: 0.04, unit: 'mg/m³', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-400 uppercase">{item.label}</span>
                                        <span className={item.status === 'warning' ? 'text-orange-400' : 'text-slate-100'}>{item.val}{item.unit}</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full transition-all duration-1000 ${item.status === 'warning' ? 'bg-orange-500' : 'bg-purple-500'}`} 
                                          style={{ width: `${item.val}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 实时应力流阵列 */}
                    <SciFiCard title="索道动态监测阵列" subtitle="STREAM" className="flex-1">
                        <div className="space-y-2">
                            {[
                                { label: '瞬时张力波动', val: '42.5', unit: 'kN', status: 'normal' },
                                { label: '加速峰值应力', val: '124', unit: 'MPa', status: 'normal' },
                                { label: '横向偏摆幅度', val: '12.4', unit: 'mm', status: 'warning' },
                                { label: '声发射能量均值', val: '0.85', unit: 'Idx', status: 'normal' },
                                { label: '特征解耦置信度', val: '0.98', unit: 'Idx', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-purple-500/30 transition-all">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-slate-400 font-bold">{item.label}</span>
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'normal' ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`}></span>
                                    </div>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-lg font-mono font-bold text-white">{item.val}</span>
                                        <span className="text-[10px] text-slate-600">{item.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 维保日志 */}
                    <SciFiCard title="近期维保干预" subtitle="MAINTENANCE LOG">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">2024-05-10: 完成全绳强磁润滑</div>
                                    <div className="text-[9px] text-slate-500">结果: 内部干摩擦系数下降 15%</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统状态脚部 --- */}
            <div className="h-10 bg-purple-950/20 border-t border-purple-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">电磁感应网: 在线</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">边缘推演延迟: 28ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-purple-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Lifeline-Neural v4.2.1 - Structural Integrity Active
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
                    animation: spin 10s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
