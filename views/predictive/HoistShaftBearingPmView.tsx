
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/hoist-shaft/ThreeScene';
import { ShaftViewMode } from '../../components/predictive/hoist-shaft/three-types';
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
  Tractor, Scale, HeartPulse, Workflow, Microscope
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 轴承特征频率能量 (FFT Features)
const BEARING_FFT = [
    { freq: 'BPFO (外圈)', val: 72, status: 'warning' },
    { freq: 'BPFI (内圈)', val: 24, status: 'normal' },
    { freq: 'BSF (滚动体)', val: 18, status: 'normal' },
    { freq: 'FTF (保持架)', val: 12, status: 'normal' },
    { freq: '2X (不对中)', val: 45, status: 'warning' },
];

// 2. 疲劳损伤积累预测 (Palmgren-Miner)
const FATIGUE_ACCUMULATION = Array.from({ length: 24 }, (_, i) => ({
    cycle: i * 50,
    damage: Math.pow(i/20, 2.5) * 0.8,
    limit: 0.85
}));

// 3. Weibull 可靠度生存曲线
const RELIABILITY_SURVIVAL = Array.from({ length: 30 }, (_, i) => {
    const t = i * 200;
    const beta = 3.5;
    const eta = 4500;
    const rel = Math.exp(-Math.pow(t/eta, beta));
    return { hours: t, reliability: rel * 100 };
});

export const HoistShaftBearingPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<ShaftViewMode>('standard');
    const [healthScore] = useState(74.5);
    const [remainingHrs] = useState(1240);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：核心全息看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-cyan-600/20 rounded-lg border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <Activity className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            提升机主轴与轴承剩余寿命预测
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/30 rounded">
                                计算引擎: Fracture-Mechanics-AI v4
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                采样率: 25.6 kHz | 动态范围: 120dB
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">主轴结构完整性</div>
                        <div className={`text-4xl font-mono font-bold ${healthScore < 80 ? 'text-orange-400' : 'text-emerald-400'}`}>
                            {healthScore} <span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">预计失效剩余时间</div>
                        <div className="text-4xl font-mono font-bold text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]">
                            {remainingHrs} <span className="text-sm">HRS</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：物理感知与特征分析 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 轴承声发射频谱 */}
                    <SciFiCard title="轴承故障特征谱线" subtitle="FFT ENVELOPE" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={BEARING_FFT} layout="vertical" margin={{top:5, right:20, left:-20, bottom:0}}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="freq" type="category" stroke="#64748b" tick={{fontSize: 10}} width={70} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Bar dataKey="val" radius={[0, 2, 2, 0]} barSize={12}>
                                        {BEARING_FFT.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.status === 'warning' ? '#f59e0b' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                            <div className="text-[10px] text-slate-500 uppercase">峰值脉冲能量</div>
                            <span className="text-sm font-mono font-bold text-orange-400">4.82 gE</span>
                        </div>
                    </SciFiCard>

                    {/* 疲劳累积模型 */}
                    <SciFiCard title="疲劳损伤演化 (Miner)" subtitle="DAMAGE ACCUMULATION">
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={FATIGUE_ACCUMULATION}>
                                    <defs>
                                        <linearGradient id="dmgGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="cycle" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="damage" stroke="#8b5cf6" fill="url(#dmgGrad)" strokeWidth={2} name="损伤因子" />
                                    <ReferenceLine y={0.85} stroke="#ef4444" strokeDasharray="5 5" label={{value: '疲劳极限', fill: '#ef4444', fontSize: 10}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-center text-[10px] text-slate-500">
                            当前载荷循环速率: <span className="text-white font-bold">2.4 Hz</span> | 应力均值: <span className="text-white font-bold">142 MPa</span>
                        </div>
                    </SciFiCard>

                    {/* AI 诊断推演 */}
                    <SciFiCard title="神经网络退化解析" subtitle="AI DIAGNOSIS" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-orange-950/20 border-l-4 border-orange-500 rounded text-[11px] text-orange-100 leading-relaxed">
                                <Brain className="inline mr-2" size={14} />
                                <span className="font-bold">深度学习提示：</span> NDE端轴承检测到非平稳性冲击。通过与1.2万条历史故障曲线比对，匹配度为 <span className="text-white font-bold underline">86.4% 为外圈早期点蚀</span>。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">执行油样铁谱分析比对</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <History size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">调取同型号失效全周期图谱</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D孪生仿真与预测主窗 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 动力学透视 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 交互层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">主轴系应力场动态映射</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前转速</span>
                                    <span className="text-white font-mono font-bold">14.2 RPM</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大扭矩</span>
                                    <span className="text-orange-500 font-mono font-bold">1,240 kN·m</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">NDE端振动</span>
                                    <span className="text-rose-500 font-mono font-bold">4.28 mm/s</span>
                                </div>
                            </div>
                        </div>

                        {/* 视图切换按钮 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['standard', 'xray', 'stress'] as ShaftViewMode[]).map((mode) => (
                                <button 
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === mode ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {mode === 'standard' ? '实景' : mode === 'xray' ? '透视' : '应力'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene healthScore={healthScore} rpm={45} viewMode={viewMode} />

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-cyan-600 text-cyan-400 hover:text-white text-xs font-black rounded border border-cyan-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 微观微观裂纹扫描
                            </button>
                            <button className="px-10 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center gap-3">
                                <Workflow size={16} /> 仿真工况推演
                            </button>
                        </div>
                        
                        {/* 扫描线动画 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 可靠度概率分布预测 */}
                    <SciFiCard title="存活概率预测 (Reliability Survival)" subtitle="WEIBULL DISTRIBUTION" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={RELIABILITY_SURVIVAL}>
                                    <defs>
                                        <linearGradient id="relGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="hours" stroke="#64748b" tick={{fontSize: 10}} label={{ value: '服役时间 (hrs)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: '可靠度 (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="reliability" stroke="#0ea5e9" strokeWidth={3} fill="url(#relGrad)" name="可靠性" />
                                    <ReferenceLine x={remainingHrs + 3200} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '理论失效极限', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：资产评估与维护记录 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 运行应力风险矩阵 */}
                    <SciFiCard title="实时运行风险评估" subtitle="RISK MATRIX">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                    { subject: '冲击载荷', A: 85, fullMark: 100 },
                                    { subject: '润滑状态', A: 70, fullMark: 100 },
                                    { subject: '振动稳定性', A: 55, fullMark: 100 },
                                    { subject: '温升一致性', A: 92, fullMark: 100 },
                                    { subject: '频率偏移度', A: 40, fullMark: 100 },
                                ]}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                    <Radar name="Risk" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 传感器感知流 */}
                    <SciFiCard title="结构特征提取流" subtitle="DATA STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: 'DE轴承温升', val: '+12.4', unit: '°C', status: 'normal' },
                                { label: 'NDE轴承温升', val: '+24.8', unit: '°C', status: 'warning' },
                                { label: '润滑油金属屑', val: '24', unit: 'ppm', status: 'warning' },
                                { label: '主轴轴向窜动', val: '0.04', unit: 'mm', status: 'normal' },
                                { label: '联轴器不对中', val: '0.12', unit: 'mm', status: 'normal' },
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

                    {/* 检修历史快照 */}
                    <SciFiCard title="部件维护履历" subtitle="O&M HISTORY">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">2023-11-12: 更换驱动端密封</div>
                                    <div className="text-[9px] text-slate-500">耗时: 4.5h | 状态: OK</div>
                                </div>
                            </div>
                            <div className="p-2 bg-emerald-950/20 rounded border border-emerald-900/50 flex items-center gap-3">
                                <History size={16} className="text-emerald-400" />
                                <div>
                                    <div className="text-[10px] text-emerald-100 font-bold">2024-02-05: 主轴激光对中校准</div>
                                    <div className="text-[9px] text-emerald-500">精度: 0.01mm | 状态: PASS</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-emerald-600" />
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
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测引擎: 在线</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">边缘网关延迟: 14ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Shaft-Integrity Core v4.2 - Holistic Predictive Shield Active
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
