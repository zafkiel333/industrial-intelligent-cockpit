import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/belt-conveyor/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  // Fix: Added missing Radar components to recharts import to resolve "Cannot find name" errors on lines 271-281
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  Activity, Zap, ShieldAlert, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  // Added AlertTriangle to fix "Cannot find name 'AlertTriangle'" error on line 144
  Search, ScanLine, Link, Box, AlertTriangle
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 分布式光纤温度分布 (Fiber Optic Sensing along 2km line)
const FIBER_TEMP_DATA = Array.from({ length: 50 }, (_, i) => ({
    dist: i * 40, // 0 to 2000m
    temp: 35 + Math.sin(i / 5) * 5 + (i === 35 ? 25 : 0), // 35单元模拟热敏点
    limit: 55
}));

// 2. 皮带张力动态波动 (Tension Profile)
const TENSION_DATA = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    tension: 120 + Math.sin(i / 2) * 10 + (i > 18 ? (i-18)*4 : 0),
    efficiency: 94 - Math.abs(Math.sin(i / 2) * 2)
}));

// 3. 驱动滚筒振动频谱特征
const VIB_SPECTRUM = [
    { freq: '1X 转频', val: 12, status: 'normal' },
    { freq: '2X 谐波', val: 8, status: 'normal' },
    { freq: '啮合频率', val: 45, status: 'warning' }, // 减速箱异常
    { freq: '托辊撞击', val: 8, status: 'normal' },
];

export const BeltConveyorPmView: React.FC = () => {
    const [lineId] = useState('BC-MAIN-001');
    const [beltSpeed] = useState(3.5); // m/s
    const [anomalyDist] = useState(1400); // meters

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部全局感知看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/80 border-b border-cyan-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <Link className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            带式输送机整线健康状态总览
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/30 rounded">
                                系统状态: 智能分析中
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                线长: 2,450 米 | 皮带宽度: 1,600 毫米
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">整线健康得分</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            85.4
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">纵向撕裂风险</div>
                        <div className="text-3xl font-mono font-bold text-rose-500 animate-pulse">24%</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：动力与张紧系统 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 驱动单元热力图 */}
                    <SciFiCard title="驱动总成状态指纹" subtitle="POWERTRAIN" highlight className="bg-[#0c1221]">
                        <div className="space-y-4 py-2">
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-slate-400 flex items-center gap-2"><Cpu size={14}/> 电机功率</div>
                                <span className="font-mono text-cyan-300">450 kW</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-slate-400 flex items-center gap-2"><Thermometer size={14}/> 减速机油温</div>
                                <span className="font-mono text-orange-400">68.2 °C</span>
                            </div>
                            <div className="h-32 w-full mt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={VIB_SPECTRUM} margin={{top:5, right:5, left:-20, bottom:0}}>
                                        <XAxis dataKey="freq" tick={{fontSize: 9}} stroke="#64748b" />
                                        <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                        <Bar dataKey="amp" radius={[2, 2, 0, 0]}>
                                            {VIB_SPECTRUM.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.status === 'warning' ? '#f59e0b' : '#0ea5e9'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 张紧装置动态 */}
                    <SciFiCard title="动态张紧力平衡" subtitle="TENSION CONTROL">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={TENSION_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="tension" fill="#0ea5e9" fillOpacity={0.1} stroke="#0ea5e9" name="张紧力(kN)" />
                                    <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} dot={false} name="能效比" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-slate-500 uppercase tracking-tighter">
                            液压站压力: 12.4 MPa | 响应延迟: 140ms
                        </div>
                    </SciFiCard>

                    {/* AI 维护决策 */}
                    <SciFiCard title="预测性维护指令" subtitle="AI INSIGHT" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-rose-950/20 border-l-4 border-rose-500 rounded">
                                <p className="text-[11px] text-rose-100 leading-relaxed">
                                    <AlertTriangle className="inline mr-2" size={14} />
                                    检测到 1400m 处托辊异常冲击，疑似轴承破损。建议在下个检修窗口（4.5h后）人工复核。
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Wrench size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">自动跑偏校正补偿启动</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Settings size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">优化重载启动曲线 (S-Curve)</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：整线数字孪生全景 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 输送机数字孪生 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)]">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping shadow-[0_0_10px_cyan]"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">整线数字化拓扑健康感知</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前带速</span>
                                    <span className="text-white font-mono font-bold">{beltSpeed} m/s</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">瞬时运量</span>
                                    <span className="text-amber-400 font-mono font-bold">2450 t/h</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">皮带填充率</span>
                                    <span className="text-green-400 font-mono font-bold">68%</span>
                                </div>
                            </div>
                        </div>

                        {/* 异常标注预览 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col items-end gap-2">
                            <div className="bg-rose-600 px-3 py-1 rounded border border-rose-400 text-[10px] text-white font-bold animate-bounce">
                                异常点探测: {anomalyDist} m
                            </div>
                        </div>

                        <ThreeScene beltSpeed={beltSpeed} anomalyZone={anomalyDist / 2450} />

                        {/* 底部功能栏 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-8 py-2.5 bg-slate-900/90 hover:bg-cyan-600 text-cyan-400 hover:text-white text-xs font-black rounded border border-cyan-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 细节分段透视
                            </button>
                            <button className="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center gap-3">
                                <Zap size={16} /> 仿真负荷推演
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 分布式光纤温感图表 */}
                    <SciFiCard title="整线分布式光纤监测 (Fiber Optic Sensing)" subtitle="TEMPERATURE & ACOUSTICS" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={FIBER_TEMP_DATA}>
                                    <defs>
                                        <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="dist" stroke="#64748b" tick={{fontSize: 10}} label={{ value: '距离 (m)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: '温度 (°C)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="temp" stroke="#0ea5e9" fill="url(#tempGrad)" strokeWidth={2} />
                                    <ReferenceLine y={55} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '超温预警', fill: '#ef4444', fontSize: 10 }} />
                                    <ReferenceLine x={1400} stroke="#f59e0b" label={{ value: '异常点', fill: '#f59e0b', fontSize: 10, position: 'top' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：皮带健康与寿命 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 皮带数字化扫描 */}
                    <SciFiCard title="皮带数字化皮肤监控" subtitle="BELT SCANNER">
                        <div className="space-y-4 py-2">
                            <div className="h-24 w-full bg-[#020617] border border-slate-800 rounded relative overflow-hidden">
                                {/* 模拟皮带展开视图 */}
                                <div className="absolute inset-0 opacity-30" style={{
                                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 100px, #1e293b 100px, #1e293b 102px)'
                                }}></div>
                                <div className="absolute top-1/2 left-2/3 w-16 h-0.5 bg-red-500 shadow-[0_0_10px_red] animate-pulse"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">2D皮带展开表面云图</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-2 bg-slate-900 border border-slate-800 rounded text-center">
                                    <div className="text-[9px] text-slate-500 uppercase">最大磨损</div>
                                    <div className="text-sm font-bold text-white">4.2 mm</div>
                                </div>
                                <div className="p-2 bg-slate-900 border border-slate-800 rounded text-center">
                                    <div className="text-[9px] text-slate-500 uppercase">接头伸长</div>
                                    <div className="text-sm font-bold text-green-400">0.12%</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 托辊健康统计矩阵 */}
                    <SciFiCard title="托辊组失效概率分布" subtitle="IDLER MATRIX" className="flex-1">
                        <div className="h-full flex flex-col">
                            <div className="flex-1 min-h-[150px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={[
                                        { subject: '温升', A: 45, fullMark: 100 },
                                        { subject: '声音能量', A: 78, fullMark: 100 },
                                        { subject: '转速偏移', A: 32, fullMark: 100 },
                                        { subject: '径向跳动', A: 25, fullMark: 100 },
                                        { subject: '载荷分布', A: 60, fullMark: 100 },
                                    ]}>
                                        <PolarGrid stroke="#1e293b" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                        <Radar name="Idler Health" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 p-3 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <Brain size={20} className="text-purple-400" />
                                <div className="text-[10px] text-slate-400 leading-tight">
                                    多源感知融合：判定整线托辊状态稳定，仅 <span className="text-white font-bold">1400m-1450m</span> 段需重点监视。
                                </div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 维护计划历史 */}
                    <SciFiCard title="资产维保序列" subtitle="HISTORY">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3 opacity-60">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">#M-245 已完成皮带硫化</div>
                                    <div className="text-[9px] text-slate-500">2024-05-12 | 状态: OK</div>
                                </div>
                            </div>
                            <div className="p-2 bg-indigo-950/20 rounded border border-indigo-900/50 flex items-center gap-3">
                                <History size={16} className="text-indigo-400" />
                                <div>
                                    <div className="text-[10px] text-indigo-100 font-bold">#M-258 待执行托辊更换</div>
                                    <div className="text-[9px] text-indigo-500">预计 2024-06-05</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-indigo-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚状态栏 --- */}
            <div className="h-10 bg-cyan-950/20 border-t border-cyan-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">分布式光纤网: 联机正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">边缘网关数据同步: 120ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Neural Conveyor Core v5.8.4 - Line Health Active
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