import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/propulsion-degradation/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter, ZAxis
} from 'recharts';
// Fix: Added missing Anchor import from lucide-react to resolve error on line 282
import { 
  Activity, Zap, ShieldAlert, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Wind, Radio, Play, Pause, FastForward, Ship,
  Compass, HardDrive, MonitorPlay, Flame, Microscope,
  ArrowDownRight, Scale, Droplet, Anchor
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 劣化速率演化 (Degradation Velocity Trend - mm/year equivalent)
const VELOCITY_TREND = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    rate: 0.12 + Math.pow(i/15, 2.5) * 0.4 + Math.random() * 0.05,
    acceleration: (i > 16 ? 0.05 : 0.01),
    limit: 0.5
}));

// 2. 效率损耗博弈 (Efficiency vs Fuel Penalty)
const EFFICIENCY_PENALTY = Array.from({ length: 12 }, (_, i) => ({
    month: `T-${11-i}M`,
    eta_loss: 1.2 + i * 0.4 + (i > 8 ? i * 0.8 : 0),
    fuel_extra: 2.5 + i * 0.8 + (i > 8 ? i * 1.5 : 0)
}));

// 3. 劣化因子贡献度 (Degradation Force Vector)
const FORCE_VECTOR = [
    { subject: '生物污损', A: 85, fullMark: 100 },
    { subject: '气蚀冲刷', A: 42, fullMark: 100 },
    { subject: '电化学腐蚀', A: 32, fullMark: 100 },
    { subject: '泥沙磨损', A: 15, fullMark: 100 },
    { subject: '轴系失稳', A: 58, fullMark: 100 },
];

export const PropulsionDegradationRatePmView: React.FC = () => {
    const [degrRate, setDegrRate] = useState(0.68); // 68%
    const [isSimulating, setIsSimulating] = useState(false);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：推进动力核心诊断看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,cyan_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                        <TrendingUp className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            推进系统劣化速度评估中心
                            <span className="text-xs not-italic font-bold bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">ACCEL-ENGINE ACTIVE</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>评估引擎: Bio-Kinetics-v5.2</span>
                            <span>评估周期: 实时连续监测 (RTCM)</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">系统瞬时劣化速率</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            0.542 <span className="text-sm">Δ/Yr</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">预计能效损耗点 (E-EoL)</div>
                        <div className="text-3xl font-mono font-bold text-orange-400">1,420 <span className="text-sm">HRS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵：劣化推演核心 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：速率演化与因子解析 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 劣化加速度分析 */}
                    <SciFiCard title="劣化速度演化曲线" subtitle="VELOCITY & ACCEL" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={VELOCITY_TREND} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="rate" stroke="#06b6d4" fill="url(#rateGrad)" strokeWidth={3} name="劣化速率" />
                                    <Line type="monotone" dataKey="acceleration" stroke="#f43f5e" strokeWidth={2} dot={false} name="加速度" />
                                    <ReferenceLine y={0.5} stroke="#ef4444" strokeDasharray="10 5" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center text-[10px]">
                            <span className="text-slate-400">当前阶段：<span className="text-orange-400 font-bold">加速劣化期</span></span>
                            <span className="text-cyan-400 font-mono">D-Slope: +14.2%</span>
                        </div>
                    </SciFiCard>

                    {/* 劣化动力矢量图 */}
                    <SciFiCard title="劣化诱因权重矢量" subtitle="FORCE VECTORS">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={FORCE_VECTOR}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Impact" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* AI 诊断深度推演 */}
                    <SciFiCard title="AI 专家劣化推演" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">深度推演报告：</span> 监测到 #2 叶片根部存在周期性 <span className="text-white font-bold underline">压力脉动畸变</span>，判定为生物污损导致的流场紊乱。
                                预测劣化速率将在未来 450h 内提升 <span className="text-rose-400 font-bold">22%</span>，燃油开支将额外增加 $4,200/天。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">查看螺旋桨扫气声纹比对图</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：数字化推进系统全息视角 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 劣化视窗 */}
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping shadow-[0_0:10px_cyan]"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">推进动力场数字孪生实时渲染</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">表面粗糙度</span>
                                    <span className="text-white font-mono font-bold">Ra 42.5 µm</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">推进效率 η</span>
                                    <span className="text-emerald-400 font-mono font-bold">94.2%</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">空泡溃灭能级</span>
                                    <span className="text-orange-400 font-mono font-bold">4.2 gE</span>
                                </div>
                            </div>
                        </div>

                        <ThreeScene degradationRate={degrRate} isScanning={true} />

                        {/* 底部交互区 - 仿真控制 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex flex-col gap-1 flex-1">
                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    <span>劣化时间推演 (Temporal Simulation)</span>
                                    <span className="text-cyan-400">Current: {Math.floor(degrRate * 100)}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="1" step="0.01" 
                                    value={degrRate} 
                                    onChange={(e) => setDegrRate(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                             </div>
                             <div className="flex items-center gap-3">
                                <button className="p-3 rounded-full bg-slate-800 hover:bg-cyan-600 transition-colors border border-slate-700">
                                    <History size={16} className="text-white" />
                                </button>
                                <button 
                                    onClick={() => setIsSimulating(!isSimulating)}
                                    className={`px-8 py-2 rounded font-black text-xs uppercase tracking-widest transition-all
                                        ${isSimulating ? 'bg-orange-600 text-white animate-pulse' : 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'}
                                    `}
                                >
                                    {isSimulating ? 'STOP SIM' : 'START SIM'}
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 效率-油耗博弈图表 */}
                    <SciFiCard title="效率衰减与燃油惩罚博弈分析 (Next 12M)" subtitle="EFFICIENCY-FUEL CORRELATION" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={EFFICIENCY_PENALTY}>
                                    <defs>
                                        <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis yAxisId="left" stroke="#0ea5e9" tick={{fontSize: 10}} label={{ value: '效率损耗 (%)', angle: -90, position: 'insideLeft', fill: '#0ea5e9', fontSize: 10 }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tick={{fontSize: 10}} label={{ value: '燃油增量 (%)', angle: 90, position: 'insideRight', fill: '#f43f5e', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Area yAxisId="right" type="monotone" dataKey="fuel_extra" name="超额燃油消耗" stroke="#f43f5e" fill="url(#fuelGrad)" strokeWidth={2} />
                                    <Line yAxisId="left" type="monotone" dataKey="eta_loss" name="推进效率损失" stroke="#0ea5e9" strokeWidth={3} dot={{r:4}} />
                                    <ReferenceLine yAxisId="left" y={5} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '进坞建议点', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：环境约束与维护矩阵 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 运行工况热负荷 */}
                    <SciFiCard title="环境劣化应力场" subtitle="ENVIRONMENTAL">
                        <div className="space-y-4 py-2">
                             {[
                                { label: '海水盐度影响', val: '3.45', unit: '%', status: 'normal' },
                                { label: '环境平均水温', val: '18.2', unit: '°C', status: 'normal' },
                                { label: '附着生物活跃度', val: 'High', unit: '', status: 'warning' },
                                { label: '电流防腐系统效能', val: '92', unit: '%', status: 'normal' },
                             ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-cyan-500/30 transition-all">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-400 uppercase">{item.label}</span>
                                        <span className={item.status === 'warning' ? 'text-orange-400 animate-pulse' : 'text-slate-100'}>{item.val} {item.unit}</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                                        <div 
                                          className={`h-full transition-all duration-1000 ${item.status === 'warning' ? 'bg-orange-500' : 'bg-cyan-500'}`} 
                                          style={{ width: `${Math.random() * 50 + 50}%` }}
                                        ></div>
                                    </div>
                                </div>
                             ))}
                        </div>
                    </SciFiCard>

                    {/* 维护建议与干预 */}
                    <SciFiCard title="预测驱动维护包" subtitle="MAINTENANCE" className="flex-1">
                        <div className="space-y-3">
                            <div className="p-3 bg-cyan-950/20 rounded border border-cyan-900/50 flex items-center gap-3">
                                <RefreshCw size={20} className="text-cyan-400" />
                                <div>
                                    <div className="text-[11px] text-cyan-100 font-bold">水下螺旋桨抛光</div>
                                    <div className="text-[9px] text-cyan-600">效率恢复预期: +2.5% | ROI: 4.2x</div>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded flex items-center gap-3 opacity-60">
                                <Anchor size={20} className="text-slate-500" />
                                <div>
                                    <div className="text-[11px] text-slate-200 font-bold">定期进坞防污漆涂装</div>
                                    <div className="text-[9px] text-slate-600">距离下轮大修: 142d</div>
                                </div>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-800">
                                <button className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold rounded shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all flex items-center justify-center gap-2">
                                    <Settings size={14} /> 自动优化巡航转速曲线
                                </button>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 历史案例库 */}
                    <SciFiCard title="同型号劣化指纹匹配" subtitle="HISTORY CLUSTER">
                        <div className="space-y-2">
                            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-300 font-bold">案例 #D-2023-04</div>
                                    <div className="text-[9px] text-slate-500">特征匹配度: 91% (高盐雾劣化)</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-slate-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统状态页脚状态栏 --- */}
            <div className="h-10 bg-cyan-950/20 border-t border-cyan-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">劣化感知器阵列: 在线</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">数据帧同步延迟: 14ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Kinetics-Shield v5.2.0 - Predictive Integrity Active
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
                @keyframes slide {
                    from { background-position: 0 0; }
                    to { background-position: 60px 60px; }
                }
            `}</style>
        </div>
    );
};
