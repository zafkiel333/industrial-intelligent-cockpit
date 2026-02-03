
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/cooling-pump/ThreeScene';
import { PumpViewMode } from '../../components/predictive/cooling-pump/three-types';
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
  Wind, Radio, Play, Pause, FastForward, Ship,
  Compass, HardDrive, MonitorPlay, Eye, Microscope
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 扬程-流量特性曲线 (H-Q Curve)
const HQ_CURVE_DATA = Array.from({ length: 20 }, (_, i) => {
    const q = i * 20; // m3/h
    // H = H0 - kQ^2
    const h_design = 60 - 0.0008 * q * q; 
    const h_actual = h_design * 0.92 - Math.random() * 0.5; // Efficiency drop
    return {
        flow: q,
        design: h_design > 0 ? h_design : 0,
        actual: h_actual > 0 ? h_actual : 0
    };
});

// 2. 气蚀余量监测 (NPSH Margin)
const NPSH_DATA = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    npsha: 6.5 + Math.sin(i / 4) * 0.5, // Available
    npshr: 3.2 + (i > 16 ? (i-16)*0.2 : 0), // Required (increases with flow/fouling)
    margin: 3.3
}));

// 3. 振动频谱 (FFT)
const VIB_SPECTRUM = [
    { freq: '1X (RPM)', val: 2.4, limit: 4.5 },
    { freq: '2X', val: 0.8, limit: 3.0 },
    { freq: '3X (Blade)', val: 1.2, limit: 3.0 }, // Blade pass frequency
    { freq: '5X', val: 3.5, limit: 3.0 }, // Cavitation signature
    { freq: 'High Freq', val: 1.8, limit: 2.0 },
];

export const CoolingWaterPumpPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<PumpViewMode>('standard');
    const [healthScore] = useState(82.4);
    const [rpm] = useState(1480);
    const [cavitationRisk] = useState(0.65); // High risk

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部 HUD：水力机械看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        <Waves className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            主机冷却水泵健康状态评估中心
                            <span className="text-xs not-italic font-bold bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 uppercase tracking-widest">Hydro-Guard Active</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>设备编号: PUMP-CSW-01</span>
                            <span>预测模型: Cavitation-CNN v2.1</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">水力效能指数</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            {healthScore}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">气蚀风险等级</div>
                        <div className="text-3xl font-mono font-bold text-orange-400 tracking-tighter">HIGH</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：水力性能与气蚀分析 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* H-Q 曲线 */}
                    <SciFiCard title="H-Q 扬程流量性能曲线" subtitle="HYDRAULIC PERFORMANCE" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={HQ_CURVE_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="flow" stroke="#64748b" tick={{fontSize: 9}} label={{ value: 'Q (m³/h)', position: 'insideBottomRight', offset: -5 }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} label={{ value: 'H (m)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Line type="monotone" dataKey="design" stroke="#334155" strokeDasharray="5 5" dot={false} name="设计曲线" />
                                    <Area type="monotone" dataKey="actual" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} strokeWidth={2} name="实测曲线" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-slate-500">
                             当前工况偏离BEP点: <span className="text-orange-400 font-bold">+12% (大流量区)</span>
                        </div>
                    </SciFiCard>

                    {/* NPSH 分析 */}
                    <SciFiCard title="有效气蚀余量监控" subtitle="NPSH TREND">
                        <div className="h-40 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={NPSH_DATA}>
                                    <defs>
                                        <linearGradient id="npshGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[0, 8]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                    <Area type="monotone" dataKey="npsha" stroke="#06b6d4" fill="url(#npshGrad)" name="NPSHa" />
                                    <Line type="monotone" dataKey="npshr" stroke="#f59e0b" strokeWidth={2} dot={false} name="NPSHr" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex items-center justify-between px-2 bg-slate-900/50 rounded border border-slate-800 py-1">
                            <span className="text-[10px] text-slate-400">安全裕量 (Margin)</span>
                            <span className="text-xs font-mono font-bold text-yellow-500">0.8 m (Low)</span>
                        </div>
                    </SciFiCard>

                    {/* AI 诊断 */}
                    <SciFiCard title="AI 气蚀与磨损推演" subtitle="AI DIAGNOSIS" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">深度分析：</span> 监测到叶片通过频率 (BPF) 及其谐波能量显著上升，且伴随有高频宽带噪声。判定为 <span className="text-white font-bold underline">叶轮入口气蚀剥蚀</span>。
                                预测在持续大流量工况下，叶轮质量不平衡将在 200h 内超出 ISO 10816 限制。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">查看叶片表面微观损伤图</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：全息数字孪生视窗 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping shadow-[0_0_10px_cyan]"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">流体动力学场实时仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">出口流量</span>
                                    <span className="text-white font-mono font-bold">385 m³/h</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">出口压力</span>
                                    <span className="text-emerald-400 font-mono font-bold">0.42 MPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">吸入口真空度</span>
                                    <span className="text-orange-400 font-mono font-bold">-0.05 MPa</span>
                                </div>
                            </div>
                        </div>

                        {/* 视角切换 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['standard', 'xray', 'thermal'] as PumpViewMode[]).map((mode) => (
                                <button 
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === mode ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {mode === 'standard' ? '外观' : mode === 'xray' ? '流场透视' : '热分布'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene rpm={rpm} flowRate={0.8} cavitationLevel={cavitationRisk} viewMode={viewMode} />

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-cyan-600 text-cyan-400 hover:text-white text-xs font-black rounded border border-cyan-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 气蚀区域定位
                            </button>
                            <button className="px-10 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all flex items-center gap-3">
                                <RefreshCw size={16} /> 仿真模型校准
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_15px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 振动频谱图表 */}
                    <SciFiCard title="泵组振动特征频谱 (Vibration Spectrum)" subtitle="FFT ANALYSIS" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={VIB_SPECTRUM} margin={{top:20, right:20, bottom:0, left:-20}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="freq" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Vel (mm/s)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Bar dataKey="val" radius={[2, 2, 0, 0]}>
                                        {VIB_SPECTRUM.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.val > entry.limit ? '#f59e0b' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                    <ReferenceLine y={3.0} stroke="#ef4444" strokeDasharray="5 5" label={{value:'ISO报警线', fill:'#ef4444', fontSize:10}} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：多维评估与维护 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 综合健康雷达 */}
                    <SciFiCard title="多维运行健康评估" subtitle="HEALTH METRICS">
                        <div className="h-56 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                    { subject: '水力效率', A: 85, fullMark: 100 },
                                    { subject: '气蚀余量', A: 45, fullMark: 100 }, // Low margin
                                    { subject: '轴承状态', A: 92, fullMark: 100 },
                                    { subject: '密封性能', A: 88, fullMark: 100 },
                                    { subject: '结构振动', A: 75, fullMark: 100 },
                                ]}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Status" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 实时感知流 */}
                    <SciFiCard title="实时感知参数阵列" subtitle="STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '电机驱动端温度', val: '65.2', unit: '°C', status: 'normal' },
                                { label: '泵非驱动端振动', val: '4.2', unit: 'mm/s', status: 'warning' },
                                { label: '机械密封泄漏率', val: '5', unit: 'ml/h', status: 'normal' },
                                { label: '电机运行电流', val: '124', unit: 'A', status: 'normal' },
                                { label: '泵壳表面噪声', val: '92', unit: 'dB', status: 'warning' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-cyan-500/30 transition-all">
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

                    {/* 维护建议 */}
                    <SciFiCard title="预测性维保建议" subtitle="ACTIONS">
                        <div className="space-y-2">
                            <div className="p-3 bg-orange-950/20 rounded border border-orange-900/50 flex items-center gap-3">
                                <Wrench size={20} className="text-orange-400" />
                                <div>
                                    <div className="text-[10px] text-orange-100 font-bold uppercase">调整出口阀开度</div>
                                    <div className="text-[9px] text-orange-600 font-bold italic">建议关小 15% 以抑制气蚀</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-orange-600" />
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
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">水声传感器: 联机正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测模型同步: 22ms 前</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Fluid-Dynamics Core v2.1 - Predictive Shield Active
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
