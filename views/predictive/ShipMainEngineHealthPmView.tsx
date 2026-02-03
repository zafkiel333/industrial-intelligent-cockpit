
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/ship-main-engine/ThreeScene';
import { EngineViewMode } from '../../components/predictive/ship-main-engine/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter
} from 'recharts';
import { 
  Activity, Zap, ShieldCheck, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Wind, Radio, Play, Pause, FastForward, Ship,
  Anchor, Compass, HardDrive, MonitorPlay, Flame
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 各缸排气温差博弈 (Cylinder Temp Balance)
const CYL_TEMP_DATA = [
    { id: '#1缸', temp: 345, status: 'normal' },
    { id: '#2缸', temp: 352, status: 'normal' },
    { id: '#3缸', temp: 385, status: 'warning' }, // 异常缸
    { id: '#4缸', temp: 348, status: 'normal' },
    { id: '#5缸', temp: 342, status: 'normal' },
    { id: '#6缸', temp: 350, status: 'normal' },
];

// 2. 示功图 (P-V Diagram Simulation Points)
const PV_DIAGRAM = Array.from({ length: 40 }, (_, i) => {
    const angle = (i / 40) * Math.PI;
    return {
        volume: 10 + i * 2,
        pressure: i < 5 ? 10 + i * 15 : 85 * Math.exp(-(i-5)/15) + Math.random()*2,
        ideal: i < 5 ? 10 + i * 16 : 90 * Math.exp(-(i-5)/16)
    };
});

// 3. 关键部件 RUL 衰减轨迹
const RUL_TRAJECTORY = Array.from({ length: 30 }, (_, i) => ({
    date: `D+${i}`,
    liner: 95 - Math.pow(i/5, 1.6),
    piston: 92 - Math.pow(i/4, 1.8),
    bearing: 98 - Math.pow(i/6, 1.4),
    limit: 60
}));

export const ShipMainEngineHealthPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<EngineViewMode>('mechanical');
    const [loadPercent] = useState(78);
    const [healthScore] = useState(86.5);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部 HUD：深海心脏态势面板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-cyan-600/20 rounded-full border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                        <Activity className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            船舶主机整机健康状态总览
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/30 rounded">
                                监测模型: Marine-Expert-v5.0
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                型号: MAN B&W 6S70ME-C | 航行状态: 巡航 (12.4 kn)
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">整机健康指数</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            {healthScore} <span className="text-sm">/ 100</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">主机当前负荷</div>
                        <div className="text-3xl font-mono font-bold text-orange-400">{loadPercent}% MCR</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：热力循环与缸内特征 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 示功图分析 (P-V Diagram) */}
                    <SciFiCard title="各缸爆发压力 P-V 曲线" subtitle="INDICATOR DIAGRAM" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={PV_DIAGRAM} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="volume" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Line type="monotone" dataKey="ideal" stroke="#334155" strokeWidth={1} strokeDasharray="3 3" dot={false} name="基准功图" />
                                    <Area type="monotone" dataKey="pressure" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} strokeWidth={2} name="实测功图" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                            <div className="text-[10px] text-slate-500 uppercase flex items-center gap-2">
                                <Zap size={14} className="text-yellow-500" /> 指示平均有效压力
                            </div>
                            <span className="text-sm font-mono font-bold text-white">1.84 MPa</span>
                        </div>
                    </SciFiCard>

                    {/* 各缸温差监测 */}
                    <SciFiCard title="各缸排气温差分布" subtitle="CYLINDER BALANCE">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={CYL_TEMP_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <XAxis dataKey="id" tick={{fill: '#94a3b8', fontSize: 10}} stroke="#1e293b" />
                                    <YAxis hide domain={[0, 500]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                    <Bar dataKey="temp" radius={[2, 2, 0, 0]}>
                                        {CYL_TEMP_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.status === 'warning' ? '#ef4444' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                    <ReferenceLine y={400} stroke="#ef4444" strokeDasharray="5 5" label={{value:'警界线', fill:'#ef4444', fontSize:8, position:'top'}} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-slate-500">
                             均衡度判定：<span className="text-rose-400 font-bold">#3缸 温升异常 (+35°C)</span>
                        </div>
                    </SciFiCard>

                    {/* AI 诊断深度报告 */}
                    <SciFiCard title="AI 专家诊断推演" subtitle="AI INFERENCE" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2" size={14} />
                                <span className="font-bold">深度解析：</span> 模型捕捉到 #3 缸喷油压力下降与排温上升的负相关特征。匹配 <span className="text-white font-bold underline">喷油器早期雾化不良</span> 样本，匹配度 92%。建议调整该缸供油正时或进行单缸清洗。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <MonitorPlay size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">调取高采样率瞬态油压波形</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Flame size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">进入曲轴箱油雾浓度趋势</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：主机数字孪生与结构透视 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 动力核心视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping shadow-[0_0_10px_cyan]"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">主机全系统动力学实时映射</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前转速</span>
                                    <span className="text-white font-mono font-bold">82.4 RPM</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">扫气压力</span>
                                    <span className="text-emerald-400 font-mono font-bold">0.34 MPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">增压器转速</span>
                                    <span className="text-orange-400 font-mono font-bold">12,450 RPM</span>
                                </div>
                            </div>
                        </div>

                        {/* 视角切换 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['mechanical', 'xray', 'thermal'] as EngineViewMode[]).map((mode) => (
                                <button 
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === mode ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {mode === 'mechanical' ? '实景' : mode === 'xray' ? '透视' : '热力'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene loadLevel={loadPercent/100} healthStatus={healthScore/100} viewMode={viewMode} />

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-cyan-600 text-cyan-400 hover:text-white text-xs font-black rounded border border-cyan-900/50 transition-all flex items-center gap-3">
                                <ScanLine size={16} /> 微米级缸套扫描
                            </button>
                            <button className="px-10 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center gap-3">
                                <Settings size={16} /> 仿真工况负荷校准
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 预测寿命衰减图表 */}
                    <SciFiCard title="主机核心部件 RUL 衰减轨迹预测 (30D)" subtitle="PROGNOSTIC DECAY" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={RUL_TRAJECTORY}>
                                    <defs>
                                        <linearGradient id="linerGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 10}} interval={5} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[50, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Area type="monotone" dataKey="liner" name="气缸套健康度" stroke="#0ea5e9" fill="url(#linerGrad)" strokeWidth={2} />
                                    <Line type="monotone" dataKey="piston" name="活塞环状态" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="bearing" name="主轴承可靠度" stroke="#10b981" strokeWidth={2} dot={false} />
                                    <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '预防检修线', fill: '#ef4444', fontSize: 10 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：辅助系统与风险矩阵 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 综合健康雷达图 */}
                    <SciFiCard title="多维健康评估维度" subtitle="METRICS">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                                    { subject: '燃烧效率', A: 92, fullMark: 100 },
                                    { subject: '润滑质量', A: 85, fullMark: 100 },
                                    { subject: '结构稳定性', A: 78, fullMark: 100 },
                                    { subject: '排放合规性', A: 95, fullMark: 100 },
                                    { subject: '辅助响应', A: 82, fullMark: 100 },
                                ]}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Score" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 辅助感知阵列流 */}
                    <SciFiCard title="主机辅机系统感知流" subtitle="AUX SYSTEMS" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '主轴承油温 (出口)', val: '45.2', unit: '°C', status: 'normal' },
                                { label: '缸套冷却水温升', val: '12.4', unit: '°C', status: 'normal' },
                                { label: '燃油粘度 (机前)', val: '12.4', unit: 'cSt', status: 'normal' },
                                { label: '曲轴箱压力', val: '0.42', unit: 'kPa', status: 'warning' },
                                { label: '滑油消耗率趋势', val: '0.82', unit: 'kg/h', status: 'normal' },
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

                    {/* 资产维护序列 */}
                    <SciFiCard title="近期维保工作包" subtitle="MAINTENANCE">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">2024-05-18: 完成 #2 缸喷油泵校验</div>
                                    <div className="text-[9px] text-slate-500">状态: 执行完成 | 校准精度: 99%</div>
                                </div>
                            </div>
                            <div className="p-2 bg-indigo-950/20 rounded border border-indigo-900/50 flex items-center gap-3">
                                <Wrench size={16} className="text-indigo-400" />
                                <div>
                                    <div className="text-[10px] text-indigo-100 font-bold">下一主要检修: 增压器叶片清洗</div>
                                    <div className="text-[9px] text-indigo-500">预计 2024-06-15 | 航行间歇期</div>
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
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">中央数据同步: 活跃</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">边缘计算状态: 联机</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Expert Core v5.0.4 - Structural Shield Active
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
