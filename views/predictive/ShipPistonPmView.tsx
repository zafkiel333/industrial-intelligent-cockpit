
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/ship-piston/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-27]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-27';
import { PistonViewMode } from '../../components/predictive/ship-piston/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie
} from 'recharts';
import { 
  Activity, Zap, ShieldCheck, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Flame, Crosshair, Microscope, Bell
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 活塞环开口间隙矩阵 (Ring Gap mm)
const RING_GAP_DATA = [
    { name: '#1 气环', actual: 1.45, design: 1.20, status: 'warning' },
    { name: '#2 气环', actual: 1.28, design: 1.20, status: 'normal' },
    { name: '#3 气环', actual: 1.22, design: 1.20, status: 'normal' },
    { name: '#4 油环', actual: 1.25, design: 1.20, status: 'normal' },
];

// 2. 冷却油温升波动 (Cooling Oil ΔT)
const OIL_TEMP_DATA = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    inlet: 45 + Math.random() * 2,
    outlet: 62 + Math.sin(i / 4) * 5 + Math.random() * 3,
    threshold: 75
}));

// 3. 活塞头表面热负荷雷达
const THERMAL_LOAD_RADAR = [
    { subject: '排气侧', A: 85, fullMark: 100 },
    { subject: '进气侧', A: 42, fullMark: 100 },
    { subject: '右侧壁', A: 55, fullMark: 100 },
    { subject: '左侧壁', A: 58, fullMark: 100 },
    { subject: '中心区', A: 92, fullMark: 100 },
];

export const ShipPistonPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<PistonViewMode>('mechanical');
    const [healthScore] = useState(81.5);
    const [thermalRisk] = useState(64);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部 HUD：活塞动力态势 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-orange-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-orange-600/20 rounded border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                        <Activity className="text-orange-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            船舶主机活塞组件劣化评估中心
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-orange-950/50 border border-orange-800/30 rounded">
                                监测模态: 动力学 + 瞬态热传导 (EHD)
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                单元: Cylinder #2 | 累计运行: 14,250h
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">活塞组件综合健康</div>
                        <div className="text-4xl font-mono font-bold text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                            {healthScore} <span className="text-sm">/ 100</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">预测检修周期 (RUL)</div>
                        <div className="text-3xl font-mono font-bold text-cyan-400">1,240 <span className="text-sm">HRS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：活塞环状态与密封效能 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 活塞环开口间隙 */}
                    <SciFiCard title="活塞环开口间隙监测" subtitle="RING GAP (mm)" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={RING_GAP_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 9}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[0, 2]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Bar dataKey="actual" radius={[2, 2, 0, 0]} barSize={20}>
                                        {RING_GAP_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.status === 'warning' ? '#f59e0b' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                    <Line type="monotone" dataKey="design" stroke="#475569" strokeDasharray="5 5" dot={false} name="设计标准" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-slate-500">
                             判定结论：<span className="text-orange-400 font-bold">#1 环磨损加剧，开口异常 (+20%)</span>
                        </div>
                    </SciFiCard>

                    {/* 热负荷分布雷达 */}
                    <SciFiCard title="活塞头热疲劳分布" subtitle="THERMAL STRESS">
                        <div className="h-52 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={THERMAL_LOAD_RADAR}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Load" dataKey="A" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-1 flex items-center justify-center gap-2 p-1 bg-rose-900/10 rounded border border-rose-900/30">
                            <Flame size={14} className="text-rose-500 animate-pulse" />
                            <span className="text-[10px] text-rose-200">检测到中心区热应力集中</span>
                        </div>
                    </SciFiCard>

                    {/* AI 诊断深度报告 */}
                    <SciFiCard title="AI 专家诊断推演" subtitle="AI INFERENCE" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2" size={14} />
                                <span className="font-bold">深度解析：</span> 监测到 #1 环开口增大与冷却油出口温升异常。匹配 <span className="text-white font-bold underline">“活塞环走合面偏磨”</span> 模式，匹配度 88%。建议在下一停航期执行吊缸检查。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">查看活塞环槽微观磨损云图</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <History size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">调取同型号活塞失效对比</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：活塞数字孪生核心 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 动力核心透视 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-orange-500/30">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping shadow-[0_0_10px_orange]"></div>
                                <span className="text-[12px] text-orange-400 font-black tracking-widest uppercase">活塞总成动力学映射</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大爆发压力</span>
                                    <span className="text-white font-mono font-bold">18.4 MPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">冷却油出口温</span>
                                    <span className="text-orange-400 font-mono font-bold">65.2 °C</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">活塞杆应力</span>
                                    <span className="text-emerald-400 font-mono font-bold">142 MPa</span>
                                </div>
                            </div>
                        </div>

                        {/* 视角控制 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['mechanical', 'thermal', 'lubrication'] as PistonViewMode[]).map((mode) => (
                                <button 
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === mode ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {mode === 'mechanical' ? '实景' : mode === 'thermal' ? '热力' : '冷却'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene wearLevel={0.4} thermalLoad={thermalRisk / 100} viewMode={viewMode} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部交互 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-orange-600 text-orange-400 hover:text-white text-xs font-black rounded border border-orange-900/50 transition-all flex items-center gap-3">
                                <ScanLine size={16} /> 高精激光扫描头
                            </button>
                            <button className="px-10 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all flex items-center gap-3">
                                <Settings size={16} /> 仿真工况校准
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(249,115,22,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 冷却油温升波动图表 */}
                    <SciFiCard title="活塞冷却油温升特性曲线" subtitle="COOLING DYNAMICS" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={OIL_TEMP_DATA}>
                                    <defs>
                                        <linearGradient id="oilGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[40, 80]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Area type="monotone" dataKey="outlet" name="出口温度" stroke="#0ea5e9" fill="url(#oilGrad)" strokeWidth={2} />
                                    <Line type="monotone" dataKey="inlet" name="进口温度" stroke="#94a3b8" strokeWidth={1} dot={false} />
                                    <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '超温预警', fill: '#ef4444', fontSize: 10 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：子系统状态与维护 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 活塞头积碳监测 */}
                    <SciFiCard title="活塞头积碳评估" subtitle="CARBON BUILDUP">
                        <div className="flex flex-col items-center py-4">
                            <div className="relative w-32 h-32 flex items-center justify-center border-2 border-slate-800 rounded-full">
                                <div className="absolute inset-0 bg-slate-900 rounded-full opacity-40"></div>
                                <div className="text-center">
                                    <div className="text-xs text-slate-500 uppercase">当前积碳厚度</div>
                                    <div className="text-2xl font-mono font-bold text-white">0.85 <span className="text-xs">mm</span></div>
                                    <div className="text-[10px] text-green-500 font-bold mt-1">Lvl: 轻微</div>
                                </div>
                                {/* 模拟圆形进度条 */}
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle cx="64" cy="64" r="60" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="377" strokeDashoffset={377 * 0.7} />
                                </svg>
                            </div>
                            <div className="mt-4 w-full p-2 bg-slate-900/50 rounded border border-slate-800 text-[10px] text-slate-500">
                                积碳速率预测：<span className="text-emerald-400 font-bold">0.05 mm/1000h</span> (处于优良工况)
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 传感器实时流 */}
                    <SciFiCard title="感知阵列参数流" subtitle="DATA STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '环槽受压强度', val: '145', unit: 'MPa', status: 'normal' },
                                { label: '活塞裙侧向力', val: '12.4', unit: 'kN', status: 'warning' },
                                { label: '冷却油流量', val: '8.5', unit: 'm³/h', status: 'normal' },
                                { label: '振荡冷却频率', val: '82', unit: 'Hz', status: 'normal' },
                                { label: '主轴承背压', val: '0.42', unit: 'MPa', status: 'normal' },
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

                    {/* 维护计划 */}
                    <SciFiCard title="近期维保干预项" subtitle="MAINTENANCE">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">2024-05-10: 完成冷却喷咀清洗</div>
                                    <div className="text-[9px] text-slate-500">结果: 冷却效率提升 8%</div>
                                </div>
                            </div>
                            <div className="p-2 bg-indigo-950/20 rounded border border-indigo-900/50 flex items-center gap-3">
                                <Bell size={16} className="text-indigo-400" />
                                <div>
                                    <div className="text-[10px] text-indigo-100 font-bold">下一任务: #1 气环开口测量</div>
                                    <div className="text-[9px] text-slate-500">预计于 150h 停机期执行</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-indigo-600" />
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
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">激光测厚阵列: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测模型同步时延: 18ms</span>
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
            `}</style>
        </div>
    );
};
