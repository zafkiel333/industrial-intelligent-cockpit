import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/fuel-injector/ThreeScene';
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
  Wind, Radio, Play, Flame, Microscope, Droplet,
  ClipboardList, Scale, Info,
  // Added FastForward to fix "Cannot find name 'FastForward'" error on line 221
  FastForward
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 喷射压力特征波形 (Injection Pressure Profile)
const PRESSURE_PROFILE = Array.from({ length: 60 }, (_, i) => {
    const t = i / 60;
    // 典型的共轨喷射三段式脉冲
    const p_ideal = t < 0.1 ? 0 : t < 0.3 ? 120 * Math.sin((t-0.1)*Math.PI/0.2) : 0;
    const p_actual = t < 0.1 ? 0 : t < 0.3 ? (120 - 15) * Math.sin((t-0.1)*Math.PI/0.2) + (Math.random()-0.5)*5 : 0;
    return { time: t.toFixed(2), ideal: p_ideal, actual: p_actual };
});

// 2. 柱塞偶件磨损路径 (Plunger Wear Path)
const WEAR_EVOLUTION = Array.from({ length: 30 }, (_, i) => ({
    cycle: i * 1000,
    gap: 2 + Math.pow(i/10, 1.8) * 1.5, // 间隙从 2um 增加
    leakage: 0.1 + Math.pow(i/15, 2) * 0.4,
    limit: 6.0
}));

// 3. 喷油器各项性能指标 (Injector KPIs)
const PERFORMANCE_METRICS = [
    { subject: '雾化细度 (SMD)', A: 92, fullMark: 100 },
    { subject: '喷射贯穿距', A: 85, fullMark: 100 },
    { subject: '循环供油稳定性', A: 78, fullMark: 100 },
    { subject: '针阀开启压力', A: 65, fullMark: 100 }, // 偏低，指示劣化
    { subject: '回油量控制', A: 88, fullMark: 100 },
];

export const FuelInjectorDegradationPmView: React.FC = () => {
    const [healthScore] = useState(78.2);
    const [activeCyl, setActiveCyl] = useState(3);
    const [isSimulating] = useState(true);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：精密喷射指挥中心 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                        <ScanLine className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            燃油泵与喷油器劣化趋势预测
                            <span className="text-xs not-italic font-bold bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 uppercase">Injection-Shield Active</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>分析引擎: Neural-Spray-Pro v2.4</span>
                            <span>检测精度: 微米级 (μm) | 采样率: 50.0 kHz</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">系统综合健康度 (IHI)</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            {healthScore}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">预计强制更换窗口</div>
                        <div className="text-3xl font-mono font-bold text-rose-500 tracking-tighter">452 <span className="text-sm">HRS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：微观偶件分析与流量分配 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 柱塞间隙演化 */}
                    <SciFiCard title="柱塞偶件配合间隙演化" subtitle="CLEARANCE DEGRADATION" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={WEAR_EVOLUTION} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="gapGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="cycle" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="gap" stroke="#0ea5e9" fill="url(#gapGrad)" strokeWidth={2} name="间隙(μm)" />
                                    <Line type="monotone" dataKey="leakage" stroke="#f59e0b" strokeWidth={1} dot={false} name="内泄流量" />
                                    <ReferenceLine y={6} stroke="#ef4444" strokeDasharray="10 5" label={{value:'磨损极限', fill:'#ef4444', fontSize:8}} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center text-[10px]">
                            <span className="text-slate-500 uppercase">当前平均间隙</span>
                            <span className="text-white font-mono font-bold">4.28 μm</span>
                        </div>
                    </SciFiCard>

                    {/* 各缸平衡度 */}
                    <SciFiCard title="各缸喷射压力均衡度" subtitle="CYLINDER BALANCE">
                        <div className="space-y-4 py-2">
                            {[1, 2, 3, 4, 5, 6].map(cyl => (
                                <div key={cyl} className={`flex items-center gap-3 p-1.5 rounded transition-all cursor-pointer ${activeCyl === cyl ? 'bg-cyan-900/20 border border-cyan-500/50' : 'hover:bg-slate-800/40'}`} onClick={() => setActiveCyl(cyl)}>
                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${activeCyl === cyl ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400'}`}>#{cyl}</div>
                                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full transition-all duration-1000 ${cyl === 3 ? 'bg-rose-500' : 'bg-cyan-500'}`} 
                                          style={{ width: `${cyl === 3 ? 72 : 92 + Math.random() * 5}%` }}
                                        ></div>
                                    </div>
                                    <span className={`text-[10px] font-mono ${cyl === 3 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
                                        {cyl === 3 ? 'LOW' : 'OPT'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* AI 诊断深度推演 */}
                    <SciFiCard title="AI 失效路径推演" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演报告：</span> 监测到 #3 缸喷油泵泵压在额定转速下延迟响应 <span className="text-white">1.2ms</span>。初步判定为由于燃油中 <span className="text-white">Cat-fines 含量波动</span> 导致的柱塞斜槽早期磨损。预测燃烧不完全风险将在下个航段上升 15%。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">查看柱塞表面扫描电子显微镜图像</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：精密 3D 动力学孪生 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 喷油器微观实验室 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 叠加层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping shadow-[0_0:10px_cyan]"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">喷射循环动力学数字孪生</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大喷射压力</span>
                                    <span className="text-white font-mono font-bold">124.5 MPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">针阀开启时刻</span>
                                    <span className="text-emerald-400 font-mono font-bold">BTDC 12.4°</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">雾化索特直径 (SMD)</span>
                                    <span className="text-orange-400 font-mono font-bold">24.2 μm</span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500" style={{width: '92%'}}></div>
                                </div>
                            </div>
                        </div>

                        {/* 状态标记 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2 items-end">
                            <div className="bg-black/60 px-3 py-1 rounded border border-slate-700 text-[10px] text-slate-500 uppercase tracking-tighter">
                                当前气缸: <span className="text-white font-bold">CYLINDER #03</span>
                            </div>
                            <div className="bg-rose-900/30 px-3 py-1 rounded border border-rose-900/50 text-[10px] text-rose-400 font-bold animate-pulse">
                                监测到二次喷射 (After-Drip)
                            </div>
                        </div>

                        <ThreeScene wearLevel={0.4} isInjecting={isSimulating} />

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex items-center gap-6 flex-1 px-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase">模型拟合度</span>
                                    <span className="text-sm font-black text-cyan-400">98.5%</span>
                                </div>
                                <div className="h-8 w-[1px] bg-slate-800"></div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between text-[9px] text-slate-500 uppercase tracking-widest">动态劣化趋势模拟 (Cycle Simulation)</div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500 animate-pulse" style={{width: '65%'}}></div>
                                    </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <button className="px-10 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all flex items-center gap-2">
                                    <FastForward size={14} /> 启动时域加速演化
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(34,211,238,0.02)_50%)] bg-[length:100%_15px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 压力脉动图表 */}
                    <SciFiCard title="燃油喷射压力瞬态波形分析 (Transient Profile)" subtitle="PRESSURE WAVEFORM" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={PRESSURE_PROFILE} margin={{top:10, right:20, bottom:0, left:-20}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Pressure (MPa)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Line type="monotone" dataKey="ideal" name="理论标准波形" stroke="#334155" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                                    <Area type="monotone" dataKey="actual" name="实测脉冲特征" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} strokeWidth={3} dot={false} />
                                    <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" label={{value:'针阀起跳点', fill:'#f59e0b', fontSize:10}} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：雾化分析与维护策略 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 雾化雷达评估 */}
                    <SciFiCard title="雾化品质多维评估" subtitle="ATOMIZATION RADAR">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={PERFORMANCE_METRICS}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Status" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 运行感知参数 */}
                    <SciFiCard title="供油感知实时参数" subtitle="STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '主供油泵转速', val: '1420', unit: 'RPM', status: 'normal' },
                                { label: '燃油回油温度', val: '64.5', unit: '°C', status: 'warning' },
                                { label: '喷油泵循环泄露量', val: '12', unit: 'cc/min', status: 'warning' },
                                { label: '喷射正时偏移', val: '+0.4', unit: '°CA', status: 'normal' },
                                { label: '燃油粘度 (机前)', val: '12.4', unit: 'cSt', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-cyan-500/30 transition-all">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-slate-400 font-bold uppercase">{item.label}</span>
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

                    {/* 维护建议 */}
                    <SciFiCard title="预测驱动维保计划" subtitle="ACTIONS">
                        <div className="space-y-2">
                            <div className="p-3 bg-orange-950/20 rounded border border-orange-900/50 flex items-center gap-3">
                                <History size={20} className="text-orange-400" />
                                <div>
                                    <div className="text-[10px] text-orange-100 font-bold uppercase">#3 喷油器强制换新</div>
                                    <div className="text-[9px] text-orange-600 font-bold tracking-tighter italic">建议在 D+5 靠港期间执行</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-orange-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统状态脚部 --- */}
            <div className="h-10 bg-cyan-950/20 border-t border-cyan-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">供油探测网: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测模型同步: 14ms 前</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Injection-Prognostics Core v2.4 - Active Protection
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
