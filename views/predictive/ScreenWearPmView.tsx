import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/screen-wear/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-7]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-7';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  // Added RadarChart, PolarGrid, PolarAngleAxis, Radar to fix "Cannot find name" errors on lines 98-109
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  ShieldAlert, Activity, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, Layers, Waves,
  Grid3X3, Filter, Scan, Binary, Trash2, 
  Target, Info, Eye, Droplets, History,
  // Fix: Added Settings to the import list to resolve "Cannot find name 'Settings'" error on line 132
  Settings
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 筛网磨损深度演变 (Wear Depth)
const WEAR_DATA = Array.from({ length: 30 }, (_, i) => ({
    day: i,
    depth: (Math.pow(i/25, 2) * 5) + Math.random() * 0.2,
    limit: 4.5
}));

// 2. 有效筛分面积与堵塞率 (ESA vs Clogging)
const CLOGGING_TREND = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    esa: 95 - Math.sin(i/10) * 15 - (i > 18 ? (i-18)*5 : 0),
    clogging: 5 + Math.sin(i/10) * 10 + (i > 18 ? (i-18)*8 : 0)
}));

// 3. 颗粒径级分布对比 (Actual vs Target)
const PSD_COMPARISON = [
    { range: '0-2mm', target: 20, actual: 12 },
    { range: '2-5mm', target: 35, actual: 28 },
    { range: '5-10mm', target: 25, actual: 45 }, // 明显偏移，指示堵孔
    { range: '10-20mm', target: 15, actual: 13 },
    { range: '>20mm', target: 5, actual: 2 },
];

export const ScreenWearPmView: React.FC = () => {
    const [clogRisk, setClogRisk] = useState(72.5);
    const [wearIndex, setWearIndex] = useState(38.4);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部 HUD 看板 --- */}
            <div className="flex justify-between items-center bg-slate-900/60 border-b border-orange-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-orange-600/20 rounded border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)] relative">
                        <Grid3X3 className="text-orange-400" size={32} />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            筛网磨损与堵塞智能预测中心
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-orange-950/50 border border-orange-800 rounded">
                                监测状态: 深度扫描中
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                型号: PU-Elastic-HighFlow
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">堵塞风险指数 (Clogging)</div>
                        <div className="text-4xl font-mono font-bold text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                            {clogRisk}%
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">预计剩余服役</div>
                        <div className="text-3xl font-mono font-bold text-emerald-400">342 <span className="text-sm">HRS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主分析矩阵布局 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：微观监测与物料特征 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 孔径形变雷达 */}
                    <SciFiCard title="筛孔微观形变分析" subtitle="APERTURE DEFORMATION" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                                    { subject: '中心区', A: 12, fullMark: 100 },
                                    { subject: '左边缘', A: 8, fullMark: 100 },
                                    { subject: '右边缘', A: 15, fullMark: 100 },
                                    { subject: '给料区', A: 45, fullMark: 100 },
                                    { subject: '排料区', A: 25, fullMark: 100 },
                                ]}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Deformation" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-3 p-2 bg-orange-900/10 rounded border border-orange-900/30 text-[10px] text-orange-300">
                           <Info className="inline mr-2" size={10}/>
                           给料区冲刷严重，检测到微裂纹扩展征兆。
                        </div>
                    </SciFiCard>

                    {/* 颗粒透筛效率 */}
                    <SciFiCard title="产物粒径偏移分析" subtitle="PSD SHIFT">
                        <div className="h-40 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={PSD_COMPARISON} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="range" stroke="#64748b" tick={{fontSize: 9}} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Bar dataKey="target" name="目标" fill="#334155" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="actual" name="实测" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-red-400 font-bold uppercase">
                            !!! 5-10mm 积压：筛网由于堵塞导致有效透筛面积下降 !!!
                        </div>
                    </SciFiCard>

                    {/* AI 预测诊断决策 */}
                    <SciFiCard title="智能维护推荐" subtitle="PROGNOSTICS" className="flex-1">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-red-900/10 border-l-4 border-red-500 rounded">
                                <AlertCircle className="text-red-500 shrink-0" size={18} />
                                <p className="text-xs text-red-100/80 leading-relaxed">
                                    当前堵塞率呈非线性上升趋势。建议在 <span className="text-white font-black underline">2.5小时</span> 内执行自动清理程序。
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-orange-900/30 rounded border border-slate-700 hover:border-orange-500 transition-all cursor-pointer">
                                    <Trash2 size={16} className="text-orange-400" />
                                    <span className="text-[11px] text-slate-300">启动高压水幕在线清网</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-orange-900/30 rounded border border-slate-700 hover:border-orange-500 transition-all cursor-pointer">
                                    <Settings size={16} className="text-orange-400" />
                                    <span className="text-[11px] text-slate-300">调整激振频率抑制堵塞</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D 孪生与实时扫描 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 筛网动力学视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-2xl overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-orange-500/30">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
                                <span className="text-[12px] text-orange-400 font-black tracking-widest uppercase">全网格拓扑健康扫描</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大磨损点</span>
                                    <span className="text-white font-mono font-bold">1.24 mm</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">平均筛分阻力</span>
                                    <span className="text-orange-400 font-mono font-bold">42.8 N</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">网格张力</span>
                                    <span className="text-green-400 font-mono font-bold">8.5 kN/m</span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500" style={{width: '65%'}}></div>
                                </div>
                            </div>
                        </div>

                        {/* 实时状态标识 */}
                        <div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-2">
                            <div className="bg-black/60 px-3 py-1 rounded border border-slate-800 text-[10px] text-slate-500">
                                刷新率: <span className="text-orange-400 font-bold">60 FPS</span>
                            </div>
                        </div>

                        <ThreeScene wearLevel={wearIndex / 100} cloggingSeverity={clogRisk / 100} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部中心操作 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-8 py-2.5 bg-slate-900/90 hover:bg-orange-600 text-orange-400 hover:text-white text-xs font-black rounded-sm border border-orange-900/50 transition-all flex items-center gap-3">
                                <Binary size={16} /> 导出磨损云图
                            </button>
                            <button className="px-8 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded-sm border border-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all flex items-center gap-3">
                                <Scan size={16} /> 启动微观自检
                            </button>
                        </div>
                        
                        {/* 扫描线动画效果 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(249,115,22,0.05)_50%)] bg-[length:100%_8px] animate-[scan_12s_linear_infinite]"></div>
                    </div>

                    {/* ESA 效率衰减曲线 */}
                    <SciFiCard title="有效筛分面积 (ESA) 与堵塞率演变" subtitle="EFFICIENCY DECAY" className="h-[240px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={CLOGGING_TREND}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize: '10px'}} />
                                    <Area type="monotone" dataKey="esa" name="有效面积 (%)" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                                    <Line type="monotone" dataKey="clogging" name="堵塞风险 (%)" stroke="#ef4444" strokeWidth={2} dot={false} />
                                    <ReferenceLine y={25} stroke="#ef4444" strokeDasharray="10 5" label={{value: '干预阈值', fill: '#ef4444', fontSize: 10, position: 'insideTopLeft'}} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：磨损预测与健康矩阵 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 长期磨损深度预测 */}
                    <SciFiCard title="磨损深度预测 (30D)" subtitle="WEAR FORECAST">
                        <div className="h-40 w-full relative bg-[#0a0f1d] border border-slate-800 rounded p-2">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={WEAR_DATA}>
                                    <defs>
                                        <linearGradient id="wearGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" hide />
                                    <YAxis hide domain={[0, 6]} />
                                    <Area type="monotone" dataKey="depth" stroke="#f59e0b" strokeWidth={2} fill="url(#wearGrad)" />
                                    <ReferenceLine y={4.5} stroke="#ef4444" strokeDasharray="3 3" />
                                </AreaChart>
                             </ResponsiveContainer>
                             <div className="absolute top-2 left-2 text-[8px] text-slate-500 uppercase tracking-widest">Wear Depth (mm)</div>
                             <div className="mt-2 text-right text-[10px] text-emerald-400">目前处于第 1 阶段稳定磨损期</div>
                        </div>
                    </SciFiCard>

                    {/* 多维健康指标 */}
                    <SciFiCard title="筛面状态矩阵" subtitle="METRICS" className="flex-1">
                        <div className="space-y-2">
                            {[
                                { label: '局部温升 (干摩擦)', val: '54.2', unit: '°C', status: 'normal' },
                                { label: '弹性回复模量', val: '0.85', unit: 'Gpa', status: 'warning' },
                                { label: '中心段残余厚度', val: '12.4', unit: 'mm', status: 'normal' },
                                { label: '振动衰减系数', val: '1.24', unit: 'ζ', status: 'warning' },
                                { label: '颗粒驻留时间', val: '1.2', unit: 's', status: 'normal' },
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

                    {/* 历史案例分析 */}
                    <SciFiCard title="相似失效案例" subtitle="HISTORICAL" className="h-[150px]">
                        <div className="space-y-2">
                            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">#H-CASE-212 (2023)</div>
                                    <div className="text-[9px] text-slate-500">特征匹配: 82% (含水黏性物料堵孔)</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-slate-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 状态页脚 --- */}
            <div className="h-10 bg-orange-950/20 border-t border-orange-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">终端感知网: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">边缘计算负载: 42%</span>
                    </div>
                </div>
                <div className="text-[10px] text-orange-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Brain size={12} /> Neural Mesh Guard - Sieve Intelligence Active v5.4.1
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