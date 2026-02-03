
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/gearbox/ThreeScene';
import { GearboxViewMode } from '../../components/predictive/gearbox/three-types';
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
  Wind, Radio, Play, Pause, FastForward
} from 'lucide-react';

// --- MOCK DATA ---

// 频域能量分布
const SPECTROGRAM_DATA = [
    { freq: '1X 转频', val: 12, status: 'normal' },
    { freq: '2X 谐波', val: 8, status: 'normal' },
    { freq: '啮合频率', val: 45, status: 'warning' },
    { freq: '轴承特征频', val: 22, status: 'normal' },
    { freq: '调制边频', val: 32, status: 'warning' },
];

// 温升预测轨迹
const THERMAL_FORECAST = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    actual: i < 14 ? 45 + Math.sin(i/2) * 5 + i : null,
    predicted: 45 + Math.sin(i/2) * 5 + i + (i > 13 ? (i-13)*2.5 : 0),
    limit: 85
}));

// 振动矢量图 (Radar)
const VIB_VECTOR = [
    { subject: '垂直方向', A: 45, fullMark: 100 },
    { subject: '水平方向', A: 85, fullMark: 100 },
    { subject: '轴向', A: 32, fullMark: 100 },
    { subject: '高频包络', A: 68, fullMark: 100 },
    { subject: '冲击脉冲', A: 25, fullMark: 100 },
];

export const GearboxPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<GearboxViewMode>('solid');
    const [vibSim, setVibSim] = useState(0.2);
    const [heatSim, setHeatSim] = useState(0.4);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部数字孪生状态中心 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/80 border-b border-orange-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-orange-600/20 rounded border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                        <FastForward className="text-orange-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            减速箱全时域振动与温升预测
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-orange-950/50 border border-orange-800/30 rounded">
                                AI核心: VibroTherm-v3.8
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                设备: B1-CONVEYOR-GB-012
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">动力完整性得分</div>
                        <div className="text-4xl font-mono font-bold text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                            82.4
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">异常预警等级</div>
                        <div className="text-3xl font-mono font-bold text-rose-500 animate-pulse">MODERATE</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：频域指纹与特征分析 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 实时频谱能量 */}
                    <SciFiCard title="振动频域指纹" subtitle="FFT ENERGY" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={SPECTROGRAM_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="freq" tick={{fontSize: 9}} stroke="#64748b" />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Bar dataKey="val" radius={[2, 2, 0, 0]}>
                                        {SPECTROGRAM_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.status === 'warning' ? '#f59e0b' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-orange-900/10 rounded border border-orange-900/30">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-400 flex items-center gap-1"><Binary size={10}/> 峰值因子 (Crest Factor)</span>
                                <span className="text-white font-mono">4.21</span>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 振动矢量雷达 */}
                    <SciFiCard title="多向振动矢量图" subtitle="DIRECTIONAL VIB">
                        <div className="h-52 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={VIB_VECTOR}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Vibration" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* AI 诊断推演 */}
                    <SciFiCard title="AI 专家系统预测" subtitle="AI INSIGHT" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded text-[11px] text-blue-100 leading-relaxed">
                                <Brain className="inline mr-2" size={14} />
                                模型提示：当前啮合频率处的异常能量与历史“齿面点蚀”样本匹配度为 <span className="text-white font-bold">89%</span>。建议在下一检修周期执行内窥镜检查。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-orange-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Radio size={16} className="text-orange-400" />
                                    <span className="text-[11px] text-slate-300">调取高清声纹监测对比</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-orange-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Wrench size={16} className="text-orange-400" />
                                    <span className="text-[11px] text-slate-300">润滑油粘度劣化分析</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D数字孪生与诊断视角 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 动力核心视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_120px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-orange-500/30">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_orange]"></div>
                                <span className="text-[12px] text-orange-400 font-black tracking-widest uppercase">全结构动力学特征实时渲染</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">高速端频率</span>
                                    <span className="text-white font-mono font-bold">1485 Hz</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">壳体振速 (RMS)</span>
                                    <span className={`font-mono font-bold ${vibSim > 0.5 ? 'text-rose-500' : 'text-emerald-400'}`}>4.82 mm/s</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">润滑油膜稳定性</span>
                                    <span className="text-blue-400 font-mono font-bold">92%</span>
                                </div>
                            </div>
                        </div>

                        {/* 视角切换按钮组 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['solid', 'xray', 'thermal'] as GearboxViewMode[]).map((m) => (
                                <button 
                                    key={m}
                                    onClick={() => setViewMode(m)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === m ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {m === 'solid' ? '实景' : m === 'xray' ? '结构' : '热力'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene viewMode={viewMode} vibrationIntensity={vibSim} tempLevel={heatSim} />

                        {/* 底部交互滑块 (负载模拟) */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-2/3 bg-black/50 backdrop-blur p-4 rounded-full border border-slate-700 flex items-center gap-6">
                            <div className="flex flex-col gap-1 flex-1">
                                <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>负载模拟强度 (Load Simulation)</span>
                                    <span className="text-orange-400 font-mono">{(vibSim * 100).toFixed(0)}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="1" step="0.01" 
                                    value={vibSim} 
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setVibSim(val);
                                        setHeatSim(val * 1.2);
                                    }}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                            </div>
                            <button className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                                <Play size={18} />
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(249,115,22,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 温升轨迹预测图表 */}
                    <SciFiCard title="热动力学演化预测 (Next 24H)" subtitle="THERMAL TRACKING" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={THERMAL_FORECAST}>
                                    <defs>
                                        <linearGradient id="heatGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[30, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="predicted" stroke="#f43f5e" fill="url(#heatGrad)" strokeDasharray="5 5" name="预测温度" />
                                    <Line type="monotone" dataKey="actual" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, fill: '#0ea5e9'}} name="实测温度" />
                                    <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '停机门限', fill: '#ef4444', fontSize: 10, position: 'insideBottomRight' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：油液与关键子系统 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 润滑油液健康 */}
                    <SciFiCard title="润滑系统多维评估" subtitle="LUBE HEALTH">
                        <div className="space-y-4 py-2">
                            {[
                                { label: '粘度稳定性', val: 92, status: 'normal' },
                                { label: '水分含量 (ppm)', val: 45, status: 'normal' },
                                { label: '磨损金属颗粒', val: 24, status: 'warning' },
                                { label: '总酸值 (TAN)', val: 12, status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-400 uppercase">{item.label}</span>
                                        <span className={item.status === 'warning' ? 'text-orange-400' : 'text-slate-100'}>{item.val}</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full transition-all duration-1000 ${item.status === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`} 
                                          style={{ width: `${item.val}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 实时特征参数阵列 */}
                    <SciFiCard title="子系统运行指标" subtitle="SYSTEM KPIs" className="flex-1">
                        <div className="space-y-2">
                            {[
                                { label: '高速轴承 X 振幅', val: '0.24', unit: 'mm', status: 'normal' },
                                { label: '输入轴转矩', val: '1240', unit: 'Nm', status: 'normal' },
                                { label: '动态偏心率', val: '0.02', unit: 'Δ', status: 'normal' },
                                { label: '齿面滑移率', val: '0.4%', unit: '', status: 'warning' },
                                { label: '环境相关性', val: '0.96', unit: 'Idx', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-orange-500/30 transition-all">
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

                    {/* 近期风险预测日志 */}
                    <SciFiCard title="AI 风险推演记录" subtitle="DECISION LOG">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">2024-05-20: 检测到异常声发射</div>
                                    <div className="text-[9px] text-slate-500">结果: 调优润滑压力 +5%</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚 --- */}
            <div className="h-10 bg-orange-950/20 border-t border-orange-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">边缘特征提取器: 正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测模型置信度: 94.8%</span>
                    </div>
                </div>
                <div className="text-[10px] text-orange-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> VibroTherm Engine v3.8.4 - Structural Integrity Active
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
