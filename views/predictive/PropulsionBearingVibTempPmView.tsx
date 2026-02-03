import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/propulsion-bearing/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter
} from 'recharts';
import { 
  Activity, Zap, ShieldCheck, Cpu, AlertTriangle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  HardDrive, MonitorPlay, Flame, Microscope, Bell,
  Wind, Radio, Play, Ruler, Scale
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 振动包络谱分析 (Vibration Envelope)
const ENVELOPE_DATA = Array.from({ length: 40 }, (_, i) => ({
    freq: i * 5,
    energy: i === 12 ? 85 : i === 24 ? 40 : Math.random() * 20 + 5,
    threshold: 60
}));

// 2. 温升预测轨迹 (Thermal Path Prediction)
const THERMAL_PREDICTION = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    actual: i < 15 ? 42 + i * 0.8 + Math.random() : null,
    predicted: 42 + i * 0.8 + (i >= 15 ? Math.pow(i-14, 1.5) * 2 : 0),
    limit: 75
}));

// 3. 轴承载荷平衡度 (Load Balancing)
const LOAD_RADAR = [
    { subject: '垂直载荷', A: 92, fullMark: 100 },
    { subject: '水平载荷', A: 85, fullMark: 100 },
    { subject: '轴向推力', A: 95, fullMark: 100 },
    { subject: '扭矩平衡', A: 78, fullMark: 100 },
    { subject: '油膜刚度', A: 88, fullMark: 100 },
];

export const PropulsionBearingVibTempPmView: React.FC = () => {
    const [healthScore] = useState(86.5);
    const [tempLevel] = useState(0.45);
    const [vibIntensity] = useState(0.28);
    const [rpm, setRpm] = useState(85);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：核心诊断指挥部 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-teal-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#0d9488_25%,transparent_25%,transparent_50%,#0d9488_50%,#0d9488_75%,transparent_75%,transparent)] bg-[length:30px_30px] animate-[slide_30s_linear_infinite]"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-teal-600/20 rounded-lg border border-teal-500/50 shadow-[0_0_25px_rgba(20,184,166,0.2)]">
                        <Disc className="text-teal-400 animate-spin-slow" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            推进轴承振动与温升趋势预测
                            <span className="text-xs not-italic font-bold bg-teal-900/50 text-teal-300 px-2 py-0.5 rounded border border-teal-800">PREDICTIVE-AI ACTIVE</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>诊断单元: STERN-TUBE-BRG-01</span>
                            <span>预测算法: Thermal-Vib-Fusion v8.2</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">综合健康得分 (BHI)</div>
                        <div className="text-4xl font-mono font-bold text-teal-400 drop-shadow-[0_0_10px_rgba(20,184,166,0.5)]">
                            {healthScore}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">预计健康窗口</div>
                        <div className="text-3xl font-mono font-bold text-amber-500">1,245 <span className="text-sm">HRS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互与分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：动态信号与指纹区 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 振动包络谱分析 */}
                    <SciFiCard title="振动包络特征分析" subtitle="ENVELOPE SPECTRUM" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={ENVELOPE_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#134e4a" vertical={false} />
                                    <XAxis dataKey="freq" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #134e4a'}} />
                                    <Area type="monotone" dataKey="energy" stroke="#2dd4bf" fill="url(#vibGrad)" strokeWidth={2} name="能量谱" />
                                    <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="5 5" label={{value:'损伤线', fill:'#ef4444', fontSize:8}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                             <span>采样：10.24 kHz</span>
                             <span className="text-teal-400">特征匹配：正常</span>
                        </div>
                    </SciFiCard>

                    {/* 载荷分布雷达 */}
                    <SciFiCard title="动力载荷平衡度" subtitle="DYNAMIC LOAD">
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={LOAD_RADAR}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Load" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* AI 诊断推演报告 */}
                    <SciFiCard title="AI 专家系统预测报告" subtitle="AI DIAGNOSTICS" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-teal-900/20 border-l-4 border-teal-500 rounded text-[11px] text-teal-100 leading-relaxed">
                                <Brain className="inline mr-2 text-teal-400" size={14} />
                                <span className="font-bold">预测逻辑：</span> 监测到轴承非驱动端温升斜率异常，结合包络谱中 <span className="text-white font-bold underline">12.5Hz 调幅特征</span>，判定为“润滑油膜局域失稳”。
                                预计在 <span className="text-amber-400 font-bold">150 小时</span> 内若负荷不降，磨损率将提升 15%。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-teal-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-teal-400" />
                                    <span className="text-[11px] text-slate-300">查看油液理化分析历史</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：轴承数字孪生核心 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#010a0a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-teal-500/30">
                                <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping shadow-[0_0_10px_teal]"></div>
                                <span className="text-[12px] text-teal-400 font-black tracking-widest uppercase">推进轴承热弹性动力学同步仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">轴心转速</span>
                                    <span className="text-white font-mono font-bold">{rpm} RPM</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">油膜最小厚度</span>
                                    <span className="text-emerald-400 font-mono font-bold">0.024 mm</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">冲击脉冲能级</span>
                                    <span className="text-teal-300 font-mono font-bold">4.2 gE</span>
                                </div>
                            </div>
                        </div>

                        <ThreeScene rpm={rpm} tempLevel={tempLevel} vibrationIntensity={vibIntensity} />

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-teal-600 text-teal-400 hover:text-white text-xs font-black rounded border border-teal-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 细节特征提取
                            </button>
                            <button className="px-10 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(20,184,166,0.4)] transition-all flex items-center gap-3">
                                <RefreshCw size={16} /> 模型参数校准
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(20,184,166,0.02)_50%)] bg-[length:100%_15px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 温升预测轨迹图表 */}
                    <SciFiCard title="轴瓦温升趋势演化预测 (Next 24H)" subtitle="THERMAL PROGNOSTICS" className="h-[220px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={THERMAL_PREDICTION}>
                                    <defs>
                                        <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[35, 85]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="predicted" stroke="#f43f5e" strokeDasharray="5 5" fill="url(#tempGrad)" name="预测温度 (°C)" />
                                    <Line type="monotone" dataKey="actual" stroke="#2dd4bf" strokeWidth={3} dot={{r:4}} name="实测温度 (°C)" />
                                    <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '预警门限', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：感知流与状态矩阵 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 实时感知阵列流 */}
                    <SciFiCard title="传感器实时数据阵列" subtitle="SENSOR ARRAY">
                        <div className="space-y-2 py-2">
                            {[
                                { label: '前部油温', val: '45.2', unit: '°C', status: 'normal' },
                                { label: '后部油温', val: '58.6', unit: '°C', status: 'warning' },
                                { label: '冷却水压', val: '0.42', unit: 'MPa', status: 'normal' },
                                { label: '进油流量', val: '124', unit: 'L/min', status: 'normal' },
                                { label: '结构振速', val: '2.45', unit: 'mm/s', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-teal-500/30 transition-all">
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

                    {/* 维护与检修建议 */}
                    <SciFiCard title="智能维护工作序列" subtitle="MAINTENANCE" className="flex-1">
                        <div className="space-y-3">
                            <div className="p-3 bg-orange-950/20 rounded border border-orange-900/50 flex items-center gap-3">
                                <Wrench size={20} className="text-orange-500" />
                                <div>
                                    <div className="text-[11px] text-orange-100 font-bold">检查密封冷却回路</div>
                                    <div className="text-[9px] text-orange-600">当前换热效率下降 12.5%</div>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded flex items-center gap-3 opacity-60">
                                <Layers size={20} className="text-slate-500" />
                                <div>
                                    <div className="text-[11px] text-slate-200 font-bold">定期油液光谱分析</div>
                                    <div className="text-[9px] text-slate-600">距离下次采样: 14h</div>
                                </div>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-800">
                                <button className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold rounded shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all flex items-center justify-center gap-2">
                                    <Settings size={14} /> 自动调节冷却负载
                                </button>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 历史案例库比对 */}
                    <SciFiCard title="历史特征聚类匹配" subtitle="CLUSTER MATCH">
                        <div className="space-y-2">
                            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-300 font-bold">案例 #B-2023-11</div>
                                    <div className="text-[9px] text-slate-500">特征匹配度: 82.4% (润滑受阻)</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-slate-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚状态栏 --- */}
            <div className="h-10 bg-teal-950/20 border-t border-teal-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测节点: 活跃在线</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">数据帧同步周期: 10ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-teal-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Kinetic-AI v8.2 - Structural Thermal Shield Active
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