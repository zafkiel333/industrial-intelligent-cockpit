
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/ship-cylinder-liner/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-26]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-26';
import { LinerViewMode } from '../../components/predictive/ship-cylinder-liner/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  Activity, Zap, ShieldCheck, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Eye, Microscope, Flame, ClipboardList
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 磨损量演化 (Wear Trend vs Engine Hours)
const WEAR_EVOLUTION = Array.from({ length: 25 }, (_, i) => ({
    hours: i * 500,
    actual: i < 18 ? (0.02 * i + Math.random() * 0.01) : null,
    predicted: 0.02 * i + (i > 17 ? Math.pow(i-17, 1.4) * 0.05 : 0),
    limit: 0.8 // 报废极限 mm
}));

// 2. 扫气箱残油分析 (Fe Content & BN in Drain Oil)
const DRAIN_OIL_DATA = Array.from({ length: 12 }, (_, i) => ({
    date: `0${i+1}-15`,
    fe: 20 + Math.random() * 15 + (i > 8 ? i * 5 : 0),
    bn: 70 - i * 2,
    threshold: 60
}));

// 3. 缸套径向磨损分布 (Radial Wear Profile)
const RADIAL_PROFILE = [
    { angle: '0° (Fore)', val: 0.12 },
    { angle: '45°', val: 0.15 },
    { angle: '90° (Port)', val: 0.28 }, // 侧向力导致偏磨
    { angle: '135°', val: 0.22 },
    { angle: '180° (Aft)', val: 0.14 },
    { angle: '225°', val: 0.18 },
    { angle: '270° (Stbd)', val: 0.25 },
    { angle: '315°', val: 0.16 }
];

export const ShipCylinderLinerPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<LinerViewMode>('thickness');
    const [healthScore] = useState(78.5);
    const [maxWear] = useState(0.42);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部 HUD：气缸完整性看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        <ScanLine className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            船舶主机气缸套磨损趋势预测
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/30 rounded">
                                监测模态: 在线激光测厚 + 残油化学指纹
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                单元: Cylinder #4 | 材质: Tarkalloy
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">缸套健康指数</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            {healthScore} <span className="text-sm">/ 100</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">最大径向磨损量</div>
                        <div className="text-3xl font-mono font-bold text-orange-400">{maxWear} <span className="text-sm">mm</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：摩擦学指标与理化分析 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 残油 Fe/BN 分析 */}
                    <SciFiCard title="扫气箱残油理化趋势" subtitle="DRAIN OIL ANALYSIS" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={DRAIN_OIL_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="date" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="fe" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} name="Fe 铁含量(ppm)" />
                                    <Line type="monotone" dataKey="bn" stroke="#0ea5e9" strokeWidth={2} dot={false} name="碱值 (BN)" />
                                    <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="5 5" label={{value: '异常线', fill: '#ef4444', fontSize: 8}} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500">
                             <span>监测结论：<span className="text-rose-400 font-bold">铁磨屑显著上升</span></span>
                             <span>采样间隔：24h</span>
                        </div>
                    </SciFiCard>

                    {/* 径向偏磨分布图 */}
                    <SciFiCard title="径向偏磨极坐标分布" subtitle="RADIAL PROFILE">
                        <div className="h-52 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADIAL_PROFILE}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="angle" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Wear" dataKey="val" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-1 text-[10px] text-center text-slate-500 italic">
                             特征识别：90° 进气侧存在轻微低温腐蚀倾向。
                        </div>
                    </SciFiCard>

                    {/* AI 磨损机理推演 */}
                    <SciFiCard title="AI 专家诊断推演" subtitle="AI INFERENCE" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2" size={14} />
                                <span className="font-bold">深度解析：</span> 监测到活塞环在第一道槽处存在非平衡冲击，且 Fe 元素磁感应值异常。匹配 <span className="text-white font-bold underline">异常硬磨损</span> 模式。建议检查注油机各泵芯同步性。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">查看金属颗粒形貌扫描图</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Droplets size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">执行在线注油率动态调优</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：缸套数字孪生全景视图 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 气缸套透视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_120px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping shadow-[0_0_10px_cyan]"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">气缸内壁磨损场实时映射</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前扫描高度</span>
                                    <span className="text-white font-mono font-bold">2,450 mm</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大等效应力</span>
                                    <span className="text-orange-400 font-mono font-bold">185 MPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">内壁表面粗糙度</span>
                                    <span className="text-emerald-400 font-mono font-bold">Ra 0.8 µm</span>
                                </div>
                            </div>
                        </div>

                        {/* 视图控制 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['thickness', 'scuffing', 'thermal'] as LinerViewMode[]).map((mode) => (
                                <button 
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === mode ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {mode === 'thickness' ? '测厚' : mode === 'scuffing' ? '拉缸风险' : '热应力'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene wearSeverity={maxWear / 0.8} viewMode={viewMode} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-cyan-600 text-cyan-400 hover:text-white text-xs font-black rounded border border-cyan-900/50 transition-all flex items-center gap-3">
                                <Eye size={16} /> 仿真内窥视图
                            </button>
                            <button className="px-10 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center gap-3">
                                <RefreshCw size={16} /> 标定模型参数
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 预测趋势图表 */}
                    <SciFiCard title="气缸套磨损率预测曲线 (Remaining Useful Life)" subtitle="WEAR FORECAST" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={WEAR_EVOLUTION}>
                                    <defs>
                                        <linearGradient id="wearGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="hours" stroke="#64748b" tick={{fontSize: 10}} label={{ value: '运行小时数 (h)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: '磨损量 (mm)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} domain={[0, 1.0]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="predicted" name="AI 预测轨迹" stroke="#0ea5e9" fill="url(#wearGrad)" strokeWidth={2} strokeDasharray="5 5" />
                                    <Line type="monotone" dataKey="actual" name="历史实测值" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
                                    <ReferenceLine y={0.8} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '强制报废极限', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：辅助参数与状态矩阵 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 内壁热负荷矩阵 */}
                    <SciFiCard title="缸壁温度场分布" subtitle="THERMAL PROFILE">
                        <div className="grid grid-cols-2 gap-3 py-2">
                             {[
                                { label: 'TDC (上死点)', val: 245, unit: '°C', status: 'warning' },
                                { label: '扫气口区域', val: 182, unit: '°C', status: 'normal' },
                                { label: 'BDC (下死点)', val: 124, unit: '°C', status: 'normal' },
                                { label: '冷却水出口', val: 82, unit: '°C', status: 'normal' },
                             ].map((item, i) => (
                                <div key={i} className={`p-2.5 rounded border flex flex-col items-center justify-center transition-all ${item.status === 'warning' ? 'bg-orange-950/40 border-orange-500 animate-pulse' : 'bg-slate-900/50 border-slate-800'}`}>
                                    <span className="text-[9px] text-slate-500 uppercase font-bold text-center mb-1">{item.label}</span>
                                    <div className={`text-xl font-mono font-bold ${item.status === 'warning' ? 'text-orange-400' : 'text-white'}`}>
                                        {item.val} <span className="text-xs">°</span>
                                    </div>
                                </div>
                             ))}
                        </div>
                    </SciFiCard>

                    {/* 实时注油参数阵列 */}
                    <SciFiCard title="注油系统实时状态" subtitle="LUBE SYSTEM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '主注油率 (Feed Rate)', val: '0.82', unit: 'g/kWh', status: 'normal' },
                                { label: '注油机出口压力', val: '12.4', unit: 'bar', status: 'normal' },
                                { label: '油量传感器 B4', val: 'Error', unit: 'Δ', status: 'critical' },
                                { label: '缸内油膜厚度(Est)', val: '2.5', unit: 'µm', status: 'warning' },
                                { label: '扫气箱油泥积存', val: 'Low', unit: 'Lvl', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-cyan-500/30 transition-all">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-slate-400 font-bold">{item.label}</span>
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'normal' ? 'bg-emerald-500' : item.status === 'warning' ? 'bg-orange-500 animate-pulse' : 'bg-rose-500 animate-ping'}`}></span>
                                    </div>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-lg font-mono font-bold text-white">{item.val}</span>
                                        <span className="text-[10px] text-slate-600">{item.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 维保任务快照 */}
                    <SciFiCard title="近期维保任务包" subtitle="MAINTENANCE">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">2024-05-18: 完成 #4 缸吊缸检查</div>
                                    <div className="text-[9px] text-slate-500">结果: 第一道活塞环背压偏高</div>
                                </div>
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
