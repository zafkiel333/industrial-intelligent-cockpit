
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/idler/ThreeScene';
// Added missing RadarChart, PolarGrid, PolarAngleAxis, and Radar to the recharts imports
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ScatterChart, Scatter,
  ZAxis, PieChart, Pie, Legend, ComposedChart,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  Activity, Zap, ShieldAlert, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Radio, AudioLines, MapPin, 
  ArrowUpRight, ListTodo
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 空间失效热点 (Spatial Failure Distribution - along the conveyor)
const SPATIAL_HOTSPOTS = Array.from({ length: 20 }, (_, i) => ({
    dist: i * 100, // meters
    faultCount: Math.floor(Math.random() * 5 + (i > 14 ? 12 : 0)), // 模拟末端高故障
    temp: 45 + Math.random() * 20
}));

// 2. 声纹特征频率 (Acoustic Spectrum)
const ACOUSTIC_DATA = [
    { freq: '低频背景', val: 20 },
    { freq: '转速基频', val: 45 },
    { freq: '轴承早期', val: 12 },
    { freq: '金属干涉', val: 78 }, // 异常
    { freq: '高频冲击', val: 32 },
];

// 3. 失效概率趋势 (Bath-tub Curve Integration)
const BATH_TUB_DATA = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    wear_out: Math.pow(i/20, 3) * 80 + Math.random() * 5,
    infant_mortality: Math.pow((24-i)/24, 2) * 10,
    random_fail: 5
}));

export const IdlerFaultPmView: React.FC = () => {
    const [activeSector, setActiveSector] = useState('SECTION-C');
    const [faultRisk] = useState(64.2);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：阵列概览 HUD --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/80 border-b border-cyan-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-cyan-600/20 rounded-full border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <ScanLine className="text-cyan-400 animate-pulse" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            全线托辊失效演化与空间分布监测
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/30 rounded">
                                监测总数: 4,250 组 | AI 扫描间隔: 100ms
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                覆盖长度: 2.4 km
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">今日失效预测数</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            12 <span className="text-sm">Units</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">集群健康风险</div>
                        <div className="text-3xl font-mono font-bold text-rose-500 animate-pulse">HIGH</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析区 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：空间分布与声纹诊断 */}
                <div className="col-span-4 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    <SciFiCard title="全线空间失效热点图" subtitle="SPATIAL FAILURE MAP" highlight className="bg-[#0c1221]">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={SPATIAL_HOTSPOTS}>
                                    <defs>
                                        <linearGradient id="hotGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="dist" stroke="#64748b" tick={{fontSize: 9}} label={{ value: '距离 (m)', position: 'insideBottom', offset: -5, fontSize: 9 }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="faultCount" stroke="#f43f5e" fill="url(#hotGrad)" name="预计失效密度" />
                                    <Line type="monotone" dataKey="temp" stroke="#0ea5e9" strokeWidth={2} name="均场温度" dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex items-center gap-3 p-3 bg-rose-900/10 border border-rose-500/20 rounded">
                            <MapPin className="text-rose-500 animate-bounce" size={20} />
                            <p className="text-[10px] text-rose-200">
                                异常锁定: <span className="font-bold">1800m - 2200m</span> 段（卸载端）托辊由于粉尘堆积导致温升过快，预期故障率提升 3.5 倍。
                            </p>
                        </div>
                    </SciFiCard>

                    <SciFiCard title="声纹故障特征提取" subtitle="ACOUSTIC DIAGNOSIS">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ACOUSTIC_DATA} layout="vertical" margin={{left: -20}}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="freq" type="category" tick={{fill: '#94a3b8', fontSize: 10}} width={60} />
                                    <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#020617'}} />
                                    <Bar dataKey="val" radius={[0, 4, 4, 0]}>
                                        {ACOUSTIC_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.val > 50 ? '#f59e0b' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-slate-900 rounded flex justify-between items-center border border-slate-800">
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase">
                                <AudioLines size={14} className="text-cyan-400" /> 轴承冲击指数
                            </div>
                            <span className="text-sm font-mono font-bold text-orange-400">7.24 (Critical)</span>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：托辊数字孪生精细透视 */}
                <div className="col-span-5 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 托辊单体透视 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_120px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_cyan]"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">单体托辊疲劳场映射</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">轴承剩余寿命</span>
                                    <span className="text-white font-mono font-bold">1,240 hrs</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">密封完整度</span>
                                    <span className="text-emerald-400 font-mono font-bold">94%</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">偏心跳动量</span>
                                    <span className="text-rose-500 font-mono font-bold">0.12 mm</span>
                                </div>
                            </div>
                        </div>

                        <ThreeScene wearSeverity={0.4} rotationSpeed={0.08} />

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-cyan-600 text-cyan-400 hover:text-white text-xs font-black rounded border border-cyan-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 细节特征提取
                            </button>
                            <button className="px-10 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center gap-3">
                                <Settings size={16} /> 仿真模型校准
                            </button>
                        </div>
                        
                        {/* 扫描线效果 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_25s_linear_infinite]"></div>
                    </div>

                    {/* 趋势曲线 */}
                    <SciFiCard title="失效趋势演化曲线 (浴盆曲线集成分析)" subtitle="FAILURE RATE TREND" className="h-[240px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={BATH_TUB_DATA}>
                                    <defs>
                                        <linearGradient id="wearOut" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={4} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: '失效风险率', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="wear_out" name="磨损期失效" stroke="#f59e0b" fill="url(#wearOut)" />
                                    <Line type="monotone" dataKey="random_fail" name="随机故障" stroke="#64748b" strokeDasharray="3 3" dot={false} />
                                    <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：AI 决策与维保排程 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 维护决策建议 */}
                    <SciFiCard title="AI 智能巡检决策" subtitle="MAINTENANCE ADVISORY" className="bg-[#0b1221]">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded">
                                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs mb-1">
                                    <Brain size={14}/> 核心预测建议
                                </div>
                                <p className="text-[11px] text-indigo-100 leading-relaxed">
                                    模型判定当前产线 <span className="text-white font-bold underline">B1-Sector-C</span> 段处于磨损耗损期。建议在 48h 内启动“定点润滑”干预。
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-orange-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <ListTodo size={16} className="text-orange-400" />
                                    <span className="text-[11px] text-slate-300">生成本班次重点巡检清单</span>
                                    <ArrowUpRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-orange-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Wrench size={16} className="text-orange-400" />
                                    <span className="text-[11px] text-slate-300">调取备件库 400x1200 托辊</span>
                                    <ArrowUpRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 近期失效统计 */}
                    <SciFiCard title="历史失效聚类分析" subtitle="CLUSTER ANALYTICS" className="flex-1">
                        <div className="h-full flex flex-col">
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={[
                                        { subject: '润滑失效', A: 85, fullMark: 100 },
                                        { subject: '密封破损', A: 42, fullMark: 100 },
                                        { subject: '筒体磨穿', A: 32, fullMark: 100 },
                                        { subject: '轴承疲劳', A: 92, fullMark: 100 },
                                        { subject: '外物损伤', A: 15, fullMark: 100 },
                                    ]}>
                                        <PolarGrid stroke="#1e293b" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                        <Radar name="Failures" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 p-3 bg-slate-950/60 rounded border border-slate-800">
                                <div className="flex justify-between items-center text-[10px] mb-2">
                                    <span className="text-slate-500 uppercase">主要失效模式匹配</span>
                                    <span className="text-orange-400 font-bold">轴承疲劳 (89%)</span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500" style={{width: '89%'}}></div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 维护日志 */}
                    <SciFiCard title="维保作业序列" subtitle="TIMELINE">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">2024-05-20: Sector-A 批量更换</div>
                                    <div className="text-[9px] text-slate-500">数量: 45 组 | 状态: OK</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统状态脚部 --- */}
            <div className="h-10 bg-orange-950/20 border-t border-orange-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">边缘传感器网络: 在线</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">AI 模型推演延迟: 45ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-orange-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Array-Scan Logic v4.2 - Predictive Integrity
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
