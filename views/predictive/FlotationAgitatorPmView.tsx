
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/flotation-agitator/ThreeScene';
import { AgitatorMode } from '../../components/predictive/flotation-agitator/three-types';
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
  Wind, Radio, Play, Pause, FastForward, Link,
  Eye, Microscope, Sliders, Volume2, Beaker
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 叶轮磨损深度扫描 (Liner/Impeller Wear mm)
const IMPELLER_WEAR = Array.from({ length: 12 }, (_, i) => ({
    blade: `#${i+1}`,
    wear: 8 + Math.random() * 12,
    limit: 25
}));

// 2. 气泡发生均匀度演化 (Bubble Uniformity Index)
const BUBBLE_STABILITY = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    uniformity: 92 - Math.pow(i/18, 2) * 10 - Math.random() * 3,
    aeration: 450 + Math.sin(i/2) * 20
}));

// 3. 声学特征匹配 (Acoustic Cavitation Fingerprint)
const CAVITATION_FEATURES = [
    { subject: '高频连续冲击', A: 75, fullMark: 100 },
    { subject: '低频气流噪', A: 42, fullMark: 100 },
    { subject: '叶轮扫膛音', A: 15, fullMark: 100 },
    { subject: '轴承滚动噪', A: 32, fullMark: 100 },
    { subject: '湍流压力脉动', A: 88, fullMark: 100 },
];

export const FlotationAgitatorPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<AgitatorMode>('fluid');
    const [healthScore] = useState(72.8);
    const [riskIndex] = useState(42.5);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：流体动力学指挥中心 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <Waves className="text-cyan-400 animate-pulse" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            浮选机搅拌机构故障风险预测系统
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/30 rounded">
                                计算引擎: CFD-Predictor v3.2
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                型号: KYF-200 | 介质: 铜精矿浆 (pH 9.2)
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">机构健康指数</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            {healthScore} <span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">预计剩余寿命</div>
                        <div className="text-3xl font-mono font-bold text-orange-400">124 <span className="text-sm">DAYS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：物理场与效能监测 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 叶轮磨损扫描图 */}
                    <SciFiCard title="叶轮各叶片磨损深度 (mm)" subtitle="IMPELLER SCAN" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={IMPELLER_WEAR} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="blade" stroke="#64748b" tick={{fontSize: 9}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Bar dataKey="wear" radius={[2, 2, 0, 0]} barSize={15}>
                                        {IMPELLER_WEAR.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.wear > 15 ? '#f59e0b' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                    <ReferenceLine y={25} stroke="#ef4444" strokeDasharray="5 5" label={{value: '报废极限', fill: '#ef4444', fontSize: 8}} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 气泡稳定性趋势 */}
                    <SciFiCard title="气泡发生稳定性监测" subtitle="AERATION UNIFORMITY">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={BUBBLE_STABILITY}>
                                    <defs>
                                        <linearGradient id="bubGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="uniformity" stroke="#2dd4bf" fill="url(#bubGrad)" strokeWidth={2} name="均匀度指数" />
                                    <Line type="monotone" dataKey="aeration" stroke="#8b5cf6" strokeWidth={1} dot={false} name="充气量(L/min)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-teal-900/10 rounded border border-teal-800/30 flex justify-between items-center">
                            <div className="text-[10px] text-teal-400">平均充气稳定性</div>
                            <span className="text-sm font-mono font-bold text-white">96.4%</span>
                        </div>
                    </SciFiCard>

                    {/* AI 故障识别 */}
                    <SciFiCard title="AI 故障特征指纹" subtitle="CAVITATION ANALYSIS" className="flex-1">
                        <div className="h-full flex flex-col">
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={CAVITATION_FEATURES}>
                                        <PolarGrid stroke="#1e293b" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                        <Radar name="Acoustic" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 p-3 bg-rose-950/20 rounded border border-rose-900/30 flex items-center gap-3">
                                <AlertCircle size={20} className="text-rose-500" />
                                <div className="text-[10px] text-rose-300 leading-tight">
                                    <span className="font-bold block text-white mb-1">风险提示</span>
                                    声学传感器检测到 <span className="text-white font-bold">18kHz</span> 以上的高频能量激增，高度匹配“叶轮早期气蚀”特征。建议检查充气调节阀。
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D数字孪生与流场仿真 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 浮选动力学视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping shadow-[0_0_10px_cyan]"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">搅拌机构微观流场仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前转速</span>
                                    <span className="text-white font-mono font-bold">185 RPM</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">轴向跳动</span>
                                    <span className="text-emerald-400 font-mono font-bold">0.05 mm</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">定子结垢系数</span>
                                    <span className="text-orange-500 font-mono font-bold">0.12 Δ</span>
                                </div>
                            </div>
                        </div>

                        {/* 视角切换 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['fluid', 'structure', 'xray'] as AgitatorMode[]).map((m) => (
                                <button 
                                    key={m}
                                    onClick={() => setViewMode(m)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === m ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {m === 'fluid' ? '流场' : m === 'structure' ? '结构' : '透视'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene wearLevel={riskIndex / 100} rpm={180} viewMode={viewMode} />

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-cyan-600 text-cyan-400 hover:text-white text-xs font-black rounded border border-cyan-900/50 transition-all flex items-center gap-3">
                                <ScanLine size={16} /> 表面缺陷探测
                            </button>
                            <button className="px-10 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center gap-3">
                                <Settings size={16} /> 仿真工况推演
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 运行电流与功率分析 */}
                    <SciFiCard title="搅拌电机运行能效监控 (24H)" subtitle="POWER ANALYTICS" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={BUBBLE_STABILITY}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="aeration" fill="#0ea5e9" fillOpacity={0.1} stroke="#0ea5e9" strokeWidth={2} name="主马达功率" />
                                    <Line type="monotone" dataKey="uniformity" stroke="#f59e0b" strokeWidth={2} dot={false} name="力矩平衡系数" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：维护矩阵与资产详情 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 搅拌机构各部件状况 */}
                    <SciFiCard title="机构关键部件完整性" subtitle="COMPONENTS">
                        <div className="space-y-4 py-2">
                            {[
                                { label: '叶轮衬胶层', val: 78, status: 'warning' },
                                { label: '减速箱油位', val: 92, status: 'normal' },
                                { label: '主轴同轴度', val: 98, status: 'normal' },
                                { label: '定子抗冲刷度', val: 45, status: 'warning' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-400 uppercase">{item.label}</span>
                                        <span className={item.status === 'warning' ? 'text-orange-400' : 'text-slate-100'}>{item.val}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full transition-all duration-1000 ${item.status === 'warning' ? 'bg-orange-500' : 'bg-cyan-500'}`} 
                                          style={{ width: `${item.val}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 感知阵列实时流 */}
                    <SciFiCard title="实时感知参数流" subtitle="DATA STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '主轴承 X 振幅', val: '0.04', unit: 'mm', status: 'normal' },
                                { label: '减速机齿面温升', val: '+12.5', unit: '°C', status: 'normal' },
                                { label: '矿浆电导率', val: '1240', unit: 'µS', status: 'normal' },
                                { label: '叶轮动态扭矩', val: '42.8', unit: 'kNm', status: 'warning' },
                                { label: '充气阀开度', val: '65', unit: '%', status: 'normal' },
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

                    {/* 维护记录快照 */}
                    <SciFiCard title="资产维保履历" subtitle="O&M HISTORY">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">2024-05-12: 完成主轴对中校准</div>
                                    <div className="text-[9px] text-slate-500">结果: 振动值下降 15%</div>
                                </div>
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
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">声速传感器网络: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">边缘网关数据同步: 25ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Flotation-Intelligence Core v3.2 - Predictive Shield Active
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
