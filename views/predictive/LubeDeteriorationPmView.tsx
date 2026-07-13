import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/lube-deterioration/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-47]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-47';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter
} from 'recharts';
import { 
  Droplet, ShieldAlert, Cpu, Activity, Zap, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Binary, BarChart3, Search, ScanLine,
  ZapOff, Flame, Microscope, Radio, HardDrive,
  MonitorPlay, Fingerprint, RefreshCw, AlertTriangle,
  Beaker, FlaskConical, Filter, Wind
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 油液寿命衰减曲线 (RUL Evolution)
const LUBE_LIFE_TREND = Array.from({ length: 30 }, (_, i) => ({
    day: `D-${29-i}`,
    health: 95 - Math.pow(i/10, 1.6) * 4 + Math.random() * 2,
    threshold: 60
}));

// 2. 颗粒度分布 (ISO 4406 / NAS 1638)
const PARTICLE_DISTRIBUTION = [
    { size: '>4μm', count: 18450, status: 'normal' },
    { size: '>6μm', count: 4200, status: 'warning' },
    { size: '>14μm', count: 850, status: 'critical' },
    { size: '>21μm', count: 120, status: 'critical' },
    { size: '>38μm', count: 15, status: 'normal' },
];

// 3. 化学指标多维雷达 (Chemical Fingerprint)
const CHEMICAL_RADAR = [
    { subject: '氧化度', A: 82, fullMark: 100 },
    { subject: '硝化度', A: 45, fullMark: 100 },
    { subject: '碱值消耗', A: 78, fullMark: 100 },
    { subject: '水分含量', A: 92, fullMark: 100 },
    { subject: '清净性', A: 65, fullMark: 100 },
];

// 4. 金属元素增长斜率 (Metal Concentration ppm)
const METAL_TREND = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i+1}`,
    fe: 12 + i * 2.5 + Math.random() * 2,
    cu: 4 + i * 0.8,
    al: 2 + i * 0.5,
}));

export const LubeDeteriorationPmView: React.FC = () => {
    const [fluidHealth] = useState(72.4);
    const [nasLevel] = useState(9);
    const [isSimulating, setIsSimulating] = useState(true);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：分子级流体监控看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-amber-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-amber-600/20 rounded border border-amber-500/50 shadow-[0_0_25px,rgba(245,158,11,0.3)]">
                        <Droplet className="text-amber-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            润滑油系统污染与劣化预测
                            <span className="text-xs not-italic font-bold bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded border border-amber-800 uppercase">Fluid-Shield Active</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>分析引擎: Molecular-Prognostics v3.5</span>
                            <span>检测精度: 0.1 ppm | 传感器同步: 14ms 前</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">油液剩余寿命 (RUL)</div>
                        <div className="text-4xl font-mono font-bold text-amber-400 drop-shadow-[0_0_10px,rgba(245,158,11,0.5)]">
                            1,452<span className="text-sm">HRS</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">当前污染等级</div>
                        <div className={`text-3xl font-mono font-bold ${nasLevel > 8 ? 'text-rose-500' : 'text-emerald-400'}`}>
                            NAS {nasLevel}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：物理性能与颗粒特性 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 颗粒度分布直方图 */}
                    <SciFiCard title="颗粒污染物径级分布" subtitle="ISO 4406" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={PARTICLE_DISTRIBUTION} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="size" stroke="#64748b" tick={{fontSize: 9}} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Bar dataKey="count" radius={[2, 2, 0, 0]} barSize={20}>
                                        {PARTICLE_DISTRIBUTION.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.status === 'critical' ? '#ef4444' : entry.status === 'warning' ? '#f59e0b' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500">
                             <span>监测标准: ISO 4406:2021</span>
                             <span className="text-rose-400 font-bold uppercase animate-pulse">检测到硬质磨屑</span>
                        </div>
                    </SciFiCard>

                    {/* 金属元素浓度趋势 */}
                    <SciFiCard title="磨损金属元素演化 (ppm)" subtitle="SPECTROSCOPY">
                        <div className="h-44 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={METAL_TREND}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="month" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '9px'}} />
                                    <Line type="monotone" dataKey="fe" stroke="#ef4444" strokeWidth={2} name="铁 Fe (缸套)" />
                                    <Line type="monotone" dataKey="cu" stroke="#f59e0b" strokeWidth={2} name="铜 Cu (轴承)" />
                                    <Line type="monotone" dataKey="al" stroke="#0ea5e9" strokeWidth={1} name="铝 Al" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* AI 劣化归因推演 */}
                    <SciFiCard title="AI 劣化路径归因" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演报告：</span> 监测到铁元素(Fe)浓度在过去 48h 内斜率陡增 <span className="text-white font-bold underline">24%</span>。通过磨屑形貌特征分析，判定为由于油液 <span className="text-white">抗氧化剂(AO)</span> 耗尽导致的酸性腐蚀磨损。
                                预测若不进行补加，主轴承油膜稳定性将在 <span className="text-rose-400 font-bold">120小时</span> 后下降至临界点。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-amber-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-amber-400" />
                                    <span className="text-[11px] text-slate-300">查看铁谱分析微观图像</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：流体数字孪生核心 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 流体仿真视窗 */}
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px,rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-amber-500/30">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
                                <span className="text-[12px] text-amber-400 font-black tracking-widest uppercase">全系统油液循环流场同步仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">动态运动粘度</span>
                                    <span className="text-white font-mono font-bold">214 cSt</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">油液总酸值 (TAN)</span>
                                    <span className="text-orange-400 font-mono font-bold">2.4 mgKOH/g</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">滤器压差 ΔP</span>
                                    <span className="text-emerald-400 font-mono font-bold">0.42 MPa</span>
                                </div>
                            </div>
                        </div>

                        {/* 状态标记 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2 items-end">
                            <div className="bg-slate-900/80 px-3 py-1 rounded border border-slate-700 text-[10px] text-slate-500 uppercase tracking-tighter">
                                当前油品: <span className="text-white font-bold">ISO VG 220</span>
                            </div>
                            <div className="bg-amber-900/30 px-3 py-1 rounded border border-amber-900/50 text-[10px] text-amber-400 font-bold animate-pulse">
                                监测到添加剂析出征兆
                            </div>
                        </div>

                        <ThreeScene deteriorationLevel={0.4} particleDensity={0.6} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部中心交互 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex items-center gap-6 flex-1 px-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase">劣化相位</span>
                                    <span className="text-sm font-black text-amber-400 tracking-widest">OXIDATION STAGE II</span>
                                </div>
                                <div className="h-8 w-[1px] bg-slate-800"></div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between text-[9px] text-slate-500 uppercase tracking-widest">周期性理化演化仿真 (Physio-Sim)</div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500 animate-pulse" style={{width: '72%'}}></div>
                                    </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <button className="px-10 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded shadow-[0_0_20px,rgba(245,158,11,0.4)] transition-all flex items-center gap-2">
                                    <RefreshCw size={14} /> 启动在线净化仿真
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(245,158,11,0.02)_50%)] bg-[length:100%_15px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 油液寿命演化图表 */}
                    <SciFiCard title="油液健康寿命演化与报废极限预测" subtitle="LIFECYCLE PROGNOSTICS" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={LUBE_LIFE_TREND} margin={{top:10, right:30, left:0, bottom:0}}>
                                    <defs>
                                        <linearGradient id="lifeGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Health Index', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="health" stroke="#f59e0b" fill="url(#lifeGrad)" strokeWidth={3} name="健康度预测" />
                                    <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '强制换油门限', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：理化指标与维保响应 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 化学特征雷达图 */}
                    <SciFiCard title="油液理化多维指纹" subtitle="CHEMICAL RADAR">
                        <div className="h-56 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={CHEMICAL_RADAR}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                    <Radar name="Chemical" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 实时参数感知阵列 */}
                    <SciFiCard title="理化感知实时参数" subtitle="STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '油箱平均温度', val: '54.5', unit: '°C', status: 'normal' },
                                { label: '在线含水量测定', val: '45', unit: 'ppm', status: 'warning' },
                                { label: '主油泵供油压力', val: '12.4', unit: 'bar', status: 'normal' },
                                { label: '清净分散剂余量', val: '65', unit: '%', status: 'warning' },
                                { label: '模型推演置信度', val: '98.5', unit: '%', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-amber-500/30 transition-all">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-slate-400 font-bold uppercase">{item.label}</span>
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

                    {/* 维保建议 */}
                    <SciFiCard title="预测性维保建议" subtitle="ACTIONS">
                        <div className="space-y-2">
                            <div className="p-3 bg-amber-950/20 rounded border border-amber-900/50 flex items-center gap-3">
                                <Filter size={20} className="text-amber-400" />
                                <div>
                                    <div className="text-[10px] text-amber-100 font-bold uppercase">精滤器二级排污</div>
                                    <div className="text-[9px] text-amber-600 font-bold tracking-tighter italic">预计颗粒度降低预期: NAS 1级</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-amber-600" />
                            </div>
                            <div className="p-3 bg-blue-950/20 rounded border border-blue-900/50 flex items-center gap-3">
                                <History size={20} className="text-blue-400" />
                                <div>
                                    <div className="text-[10px] text-blue-100 font-bold uppercase">调取 2023-Q4 对比分析</div>
                                    <div className="text-[9px] text-blue-600">历史劣变路径匹配度: 94%</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统状态脚部 --- */}
            <div className="h-10 bg-amber-950/20 border-t border-amber-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">在线理化监测仪: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">动态粘度补偿延时: 12ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-amber-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Molecular-Digital-Armor v3.5 - Integrity Guard Active
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
