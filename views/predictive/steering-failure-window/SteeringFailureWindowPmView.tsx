
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/steering-failure-window/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend
} from 'recharts';
import { 
  Activity, Zap, ShieldAlert, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Hourglass, Calendar, Flame, Microscope, Clock,
  Ship, Anchor, HardDrive, MonitorPlay, AlertOctagon,
  LifeBuoy, Hammer, FastForward, Play, Info,
  Box, Terminal, Radar as RadarIcon, ShieldAlert as ShieldAlertIcon,
  // Fix: Added ShieldCheck to resolve "Cannot find name 'ShieldCheck'" error on line 309
  ShieldCheck,
  Sliders
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 失效概率密度函数 (PDF - 基于 Weibull 分布)
const PDF_DATA = Array.from({ length: 40 }, (_, i) => {
    const t = i * 24; // 每 24h 一个点
    const eta = 800; // 尺度参数 (平均寿命)
    const beta = 3.5; // 形状参数 (磨损失效期)
    const prob = (beta/eta) * Math.pow(t/eta, beta-1) * Math.exp(-Math.pow(t/eta, beta)) * 10000;
    return { hours: t, prob: parseFloat(prob.toFixed(2)) };
});

// 2. 核心组件劣化路径 (Degradation Path)
const COMPONENTS = [
    { id: 'seal', name: '主活塞密封', score: 92, drift: 0.12, risk: 'Low' },
    { id: 'servo', name: '伺服阀闭环', score: 78, drift: 0.45, risk: 'Med' },
    { id: 'pump', name: '变量泵柱塞', score: 64, drift: 0.72, risk: 'High' },
    { id: 'fluid', name: '液压油品质', score: 85, drift: 0.24, risk: 'Low' },
];

export const SteeringFailureWindowPmView: React.FC = () => {
    const [futureDays, setFutureDays] = useState(0);
    const [isSimulating, setIsSimulating] = useState(false);
    const [metrics, setMetrics] = useState({
        reliability: 88.5,
        hazardRate: 0.012,
        entropy: 12.4
    });

    // Fix: Defined healthScore to resolve "Cannot find name 'healthScore'" error on line 194
    const healthScore = metrics.reliability;

    // 动态数据模拟
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => ({
                reliability: prev.reliability + (Math.random() - 0.5) * 0.1,
                hazardRate: Math.max(0, prev.hazardRate + (Math.random() - 0.5) * 0.001),
                entropy: prev.entropy + (Math.random() - 0.5) * 0.05
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleSimulation = () => {
        setIsSimulating(true);
        setTimeout(() => setIsSimulating(false), 3000);
    };

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部 HUD 看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-rose-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-rose-600/20 rounded-sm border border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                        <Hourglass className="text-rose-400 animate-pulse" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            操舵系统失效时间窗口预测
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>所属节点: 舵机房 HPU-01</span>
                            <span>预测算法: Weibull-LSTM Hybrid v5.2</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">失效倒计时 (T-Mean)</div>
                        <div className="text-4xl font-mono font-bold text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                            542 <span className="text-sm">HRS</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">失效置信窗口 (95% CI)</div>
                        <div className="text-3xl font-mono font-bold text-cyan-400 tracking-tighter">428 ~ 680 HRS</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析阵列 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：概率图谱与生存分析 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 失效概率密度函数 */}
                    <SciFiCard title="失效概率密度分布 (PDF)" subtitle="PROBABILITY DENSITY" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={PDF_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="pdfGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="hours" stroke="#64748b" tick={{fontSize: 9}} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="prob" stroke="#f43f5e" fill="url(#pdfGrad)" strokeWidth={2} name="发生概率" />
                                    <ReferenceLine x={542} stroke="#f59e0b" strokeDasharray="5 5" label={{value:'均值', fill:'#f59e0b', fontSize:8}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-slate-500 uppercase">
                             目前处于“耗损故障期” (Wear-out Phase)
                        </div>
                    </SciFiCard>

                    {/* 可靠性衰减轨迹 */}
                    <SciFiCard title="系统可靠性演化" subtitle="RELIABILITY CURVE">
                        <div className="h-40 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={Array.from({length: 20}, (_, i) => ({ time: i, val: 100 - Math.pow(i/2, 2.2) }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[0, 100]} />
                                    <Line type="monotone" dataKey="val" stroke="#10b981" strokeWidth={2} dot={false} name="可靠度 (%)" />
                                    <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="5 5" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* AI 失效因果报告 */}
                    <SciFiCard title="AI 失效推演简报" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed italic">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">深度推演：</span> 监测到变量泵在重载换向时的压力超调量（Overshoot）由 1.2% 上升至 4.5%。基于马尔可夫链状态迁移模型，判定为 <span className="text-white underline">伺服比例阀阀芯磨损</span>。
                                预计在持续作业 350 小时后，将发生不可接受的响应延迟。
                            </div>
                            <div className="space-y-2">
                                <button className="w-full py-2 bg-slate-800 hover:bg-rose-900/40 rounded border border-slate-700 text-[11px] text-slate-300 transition-all flex items-center justify-center gap-2">
                                    <Microscope size={14} /> 调取典型失效指纹比对
                                </button>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：时序演化 3D 数字孪生 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-rose-500/30">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                                <span className="text-[12px] text-rose-400 font-black tracking-widest uppercase">时空退化轨迹全息仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">预测健康度</span>
                                    <span className={`font-mono font-bold ${futureDays > 20 ? 'text-rose-500' : 'text-emerald-400'}`}>
                                        {Math.max(0, 85 - futureDays * 2).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">瞬时风险熵</span>
                                    <span className="text-white font-mono font-bold">{(metrics.entropy + futureDays * 0.5).toFixed(2)} Δ</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">机械应力强度</span>
                                    <span className="text-amber-400 font-mono font-bold">{(0.42 + futureDays * 0.02).toFixed(2)} g</span>
                                </div>
                            </div>
                        </div>

                        <ThreeScene daysOffset={futureDays} isSimulating={true} healthScore={healthScore} />

                        {/* 底部交互区：时间推演轴 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-4/5 bg-black/70 backdrop-blur-2xl border border-slate-700 p-6 rounded-2xl shadow-2xl">
                             <div className="flex justify-between items-center mb-4 px-2">
                                <div className="flex items-center gap-3">
                                    <Clock className="text-cyan-400" size={20} />
                                    <span className="text-sm font-black text-white uppercase tracking-[0.2em]">失效推演时间轴 (Time Horizon)</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold">当前预览节点</div>
                                    <div className="px-5 py-1 bg-cyan-900/30 border border-cyan-500/50 rounded text-cyan-400 font-mono font-bold text-2xl tracking-tighter">
                                        T + {futureDays} <span className="text-xs italic uppercase ml-1">Days</span>
                                    </div>
                                </div>
                             </div>
                             <div className="relative h-4 w-full bg-slate-900 rounded-full flex items-center px-1">
                                <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-rose-500/20 rounded-r-full border-l border-rose-500/50 shadow-[inset_0_0_20px_rgba(244,63,94,0.1)]"></div>
                                <input 
                                    type="range" min="0" max="30" step="1" 
                                    value={futureDays} 
                                    onChange={(e) => setFutureDays(parseInt(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 z-10"
                                />
                             </div>
                             <div className="flex justify-between mt-2 text-[9px] text-slate-500 uppercase font-bold tracking-widest px-1">
                                <span>当前时刻 (NOW)</span>
                                <span className="text-rose-500">关键失效窗口 (FAILURE WINDOW)</span>
                             </div>
                        </div>
                        
                        {/* 极光装饰线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_15px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 未来 30 天维护窗口建议 */}
                    <SciFiCard title="预测性维护执行窗口建议" subtitle="O&M WINDOWS" className="h-[200px] bg-[#050b16]">
                        <div className="flex flex-col h-full gap-4 py-2">
                             <div className="flex-1 flex gap-4 px-4">
                                {[
                                    { date: '06-12', label: '预防巡检', cost: 10, risk: 5, status: 'ready' },
                                    { date: '06-20', label: '组件换新', cost: 45, risk: 15, status: 'best' },
                                    { date: '06-28', label: '事故停机', cost: 100, risk: 90, status: 'danger' },
                                ].map((w, i) => (
                                    <div key={i} className={`flex-1 p-3 rounded border flex flex-col justify-between transition-all ${w.status === 'best' ? 'bg-cyan-900/20 border-cyan-500 scale-105' : 'bg-slate-900/40 border-slate-800 opacity-60'}`}>
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-black text-white">{w.label}</span>
                                            <Calendar size={12} className="text-slate-500" />
                                        </div>
                                        <div className="text-xl font-mono font-bold text-slate-100">{w.date}</div>
                                        <div className="text-[9px] text-slate-500 uppercase font-bold">损失成本: {w.cost}%</div>
                                    </div>
                                ))}
                             </div>
                             <div className="h-10 bg-indigo-950/20 border-t border-indigo-900/30 flex items-center justify-center px-4 gap-4">
                                <Info size={14} className="text-indigo-400" />
                                <span className="text-[10px] text-indigo-200">综合判定：最佳维护时间点位于 <span className="text-white font-bold">D+18 (06-20)</span>，可最大化设备残值并规避 85% 失效风险。</span>
                             </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：分系统劣化矩阵 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 组件健康状态阵列 */}
                    <SciFiCard title="关键节点健康指数" subtitle="COMPONENT HEALTH">
                        <div className="space-y-4 py-2">
                            {COMPONENTS.map((comp, i) => (
                                <div key={i} className="group relative p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-cyan-500/50 transition-all">
                                    <div className="flex justify-between items-center mb-1 text-[11px] font-bold">
                                        <span className="text-slate-400 uppercase">{comp.name}</span>
                                        <span className={comp.risk === 'High' ? 'text-rose-500' : comp.risk === 'Med' ? 'text-orange-400' : 'text-emerald-400'}>
                                            {comp.score}%
                                        </span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${comp.risk === 'High' ? 'bg-rose-500 animate-pulse' : comp.risk === 'Med' ? 'bg-orange-500' : 'bg-cyan-500'}`} 
                                            style={{ width: `${comp.score}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 预测因子感知流 */}
                    <SciFiCard title="实时感知参数矩阵" subtitle="DATA STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '变量泵倾角偏差', val: '0.12', unit: '°', status: 'normal' },
                                { label: '伺服电流相移', val: '14.5', unit: 'ms', status: 'warning' },
                                { label: '系统含金指数', val: '45', unit: 'ppm', status: 'normal' },
                                { label: '换向冲击峰值', val: '4.2', unit: 'g', status: 'warning' },
                                { label: '模型计算残差', val: '0.02', unit: 'Idx', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-rose-500/30 transition-all">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{item.label}</span>
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

                    {/* 维护指令决策 */}
                    <SciFiCard title="智能维护工作包" subtitle="O&M PLAN">
                        <div className="space-y-2">
                            <div className="p-3 bg-rose-950/20 rounded border border-rose-900/50 flex items-center gap-3">
                                <ShieldCheck size={20} className="text-rose-400" />
                                <div>
                                    <div className="text-[10px] text-rose-100 font-bold uppercase">伺服阀阻尼件更换</div>
                                    <div className="text-[9px] text-rose-600 font-bold italic text-shadow-glow">建议：窗口期内优先执行</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-rose-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统状态脚部 --- */}
            <div className="h-10 bg-rose-950/20 border-t border-rose-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">终端感知网: 联机正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">不确定性推演: 25ms 前</span>
                    </div>
                </div>
                <div className="text-[10px] text-rose-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Temporal-Prediction Engine v5.2.1 - Active Protection
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
            `}</style>
        </div>
    );
};
