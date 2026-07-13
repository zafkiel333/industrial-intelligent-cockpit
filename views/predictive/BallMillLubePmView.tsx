
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/ball-mill-lube/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-20]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-20';
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
  Tractor, Scale, Droplet, FlaskConical, Beaker,
  Filter
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 油膜厚度分布 (Film Thickness Distribution)
const FILM_DIST_DATA = [
    { pos: '进油区', val: 0.12, status: 'normal' },
    { pos: '承载区A', val: 0.08, status: 'normal' },
    { pos: '高压中心', val: 0.04, status: 'warning' },
    { pos: '承载区B', val: 0.07, status: 'normal' },
    { pos: '回油区', val: 0.15, status: 'normal' },
];

// 2. 油液理化劣化趋势 (Physicochemical Deterioration)
const LUBE_DETERIORATION = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    viscosity: 220 - i * 0.5 - Math.random() * 2, // 粘度下降
    nas: 6 + (i > 15 ? (i-15)*0.8 : 0) + Math.random(), // 污染度上升
    limit: 10
}));

// 3. 轴瓦温升与压力博弈 (Temp vs Pressure)
const TEMP_PRESS_DATA = Array.from({ length: 15 }, (_, i) => ({
    step: i,
    temp: 45 + i * 1.2,
    pressure: 4.2 - i * 0.15, // 随着温度升高，油膜压力由于粘度降低而减小
}));

export const BallMillLubePmView: React.FC = () => {
    const [oilHealth] = useState(74.5);
    const [contaminationLevel, setContaminationLevel] = useState(0.42);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部 HUD：润滑系统全局态势 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-emerald-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-emerald-600/20 rounded border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <Droplet className="text-emerald-400 animate-pulse" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            球磨机主轴承润滑劣化预测系统
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-emerald-950/50 border border-emerald-800/30 rounded">
                                监测模态: 动力油膜动力学 (EHL)
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                润滑油品: ISO VG 220 极压工业齿轮油
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">油液综合健康指数</div>
                        <div className="text-4xl font-mono font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                            {oilHealth} <span className="text-sm">/ 100</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">建议换油倒计时</div>
                        <div className="text-3xl font-mono font-bold text-amber-500">142 <span className="text-sm">HRS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：微观流体与物理感知 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 轴瓦油膜厚度分布 */}
                    <SciFiCard title="动力油膜厚度梯度 (mm)" subtitle="FILM THICKNESS" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={FILM_DIST_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="pos" stroke="#64748b" tick={{fontSize: 9}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Bar dataKey="val" radius={[2, 2, 0, 0]} barSize={20}>
                                        {FILM_DIST_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.status === 'warning' ? '#f59e0b' : '#10b981'} />
                                        ))}
                                    </Bar>
                                    <ReferenceLine y={0.03} stroke="#ef4444" strokeDasharray="5 5" label={{value: '破裂临界点', fill: '#ef4444', fontSize: 8}} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 油液 NAS 等级演化趋势 */}
                    <SciFiCard title="NAS 污染等级演化趋势" subtitle="CONTAMINATION">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={LUBE_DETERIORATION}>
                                    <defs>
                                        <linearGradient id="nasGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="nas" stroke="#f59e0b" fill="url(#nasGrad)" strokeWidth={2} name="NAS 等级" />
                                    <ReferenceLine y={9} stroke="#ef4444" strokeDasharray="10 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                             <div className="p-2 bg-slate-900 rounded text-center border border-slate-800">
                                <div className="text-[9px] text-slate-500 uppercase">当前金属磨屑</div>
                                <div className="text-sm font-bold text-white">42 ppm</div>
                             </div>
                             <div className="p-2 bg-slate-900 rounded text-center border border-slate-800">
                                <div className="text-[9px] text-slate-500 uppercase">含水量指数</div>
                                <div className="text-sm font-bold text-emerald-400">0.02%</div>
                             </div>
                        </div>
                    </SciFiCard>

                    {/* AI 润滑故障推演报告 */}
                    <SciFiCard title="AI 润滑失效推演" subtitle="AI DIAGNOSIS" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演报告：</span> 监测到运动粘度下降速率超过 <span className="text-white">5%/100h</span>，疑似存在油液氧化或轻质组分挥发。预计轴瓦保护膜强度将持续削弱。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-emerald-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <FlaskConical size={16} className="text-emerald-400" />
                                    <span className="text-[11px] text-slate-300">调取理化分析实验室报告</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-emerald-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Filter size={16} className="text-emerald-400" />
                                    <span className="text-[11px] text-slate-300">检查循环系统滤芯压差</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：轴瓦润滑数字孪生 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-emerald-500/30">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                                <span className="text-[12px] text-emerald-400 font-black tracking-widest uppercase">轴瓦微观润滑动力学实时仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">平均油膜厚度</span>
                                    <span className="text-white font-mono font-bold">0.085 mm</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">油膜刚度系数</span>
                                    <span className="text-emerald-400 font-mono font-bold">450 kN/mm</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">油液颗粒密度</span>
                                    <span className="text-amber-400 font-mono font-bold">NAS 8</span>
                                </div>
                            </div>
                        </div>

                        <ThreeScene filmThickness={oilHealth / 100} contaminationLevel={contaminationLevel} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部交互滑块 - 污染度模拟 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-2/3 bg-black/70 backdrop-blur border border-slate-700 p-4 rounded-sm flex items-center gap-6">
                            <div className="flex-1">
                                <div className="flex justify-between text-[10px] text-slate-400 mb-2">
                                    <span>油液污染模拟 (Contamination)</span>
                                    <span className="text-amber-400 font-bold">NAS {(contaminationLevel * 12).toFixed(0)}</span>
                                </div>
                                <input 
                                    type="range" min="0" max="1" step="0.01" 
                                    value={contaminationLevel} 
                                    onChange={(e) => setContaminationLevel(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                                />
                            </div>
                            <div className="text-right whitespace-nowrap">
                                <div className="text-[9px] text-slate-500 uppercase">预测滤芯寿命</div>
                                <div className="text-sm font-bold text-white">{Math.max(10, (1 - contaminationLevel) * 240).toFixed(0)} HRS</div>
                            </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(16,185,129,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 温升与压力博弈图 */}
                    <SciFiCard title="轴瓦温升与油膜压力博弈" subtitle="THERMAL-PRESSURE BALANCE" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={TEMP_PRESS_DATA}>
                                    <defs>
                                        <linearGradient id="tpGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="step" hide />
                                    <YAxis yAxisId="left" stroke="#f43f5e" tick={{fontSize: 10}} label={{ value: '温度 (°C)', angle: -90, position: 'insideLeft', fill: '#f43f5e', fontSize: 10 }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" tick={{fontSize: 10}} label={{ value: '压力 (MPa)', angle: 90, position: 'insideRight', fill: '#0ea5e9', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area yAxisId="left" type="monotone" dataKey="temp" stroke="#f43f5e" fill="url(#tpGrad)" name="轴瓦温度" />
                                    <Line yAxisId="right" type="monotone" dataKey="pressure" stroke="#0ea5e9" strokeWidth={3} dot={{r:4}} name="油膜压力" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：维护矩阵与记录 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 润滑泵站状态 */}
                    <SciFiCard title="润滑泵站集群状态" subtitle="PUMP STATION">
                        <div className="space-y-4 py-2">
                            {[
                                { label: '1# 供油主泵', val: 'Running', status: 'normal' },
                                { label: '2# 备用泵', val: 'Standby', status: 'normal' },
                                { label: '冷却循环泵', val: 'Fault', status: 'critical' },
                                { label: '高压顶起泵', val: 'Disabled', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-800/40 rounded border border-slate-700/50">
                                    <span className="text-[11px] text-slate-300 font-bold">{item.label}</span>
                                    <span className={`text-[10px] font-bold uppercase ${item.status === 'critical' ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                                        {item.val}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 油液健康多因子 */}
                    <SciFiCard title="油质理化综合评分" subtitle="FACTORS" className="flex-1">
                        <div className="h-full flex flex-col">
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={[
                                        { subject: '粘度稳定性', A: 85, fullMark: 100 },
                                        { subject: '抗乳化性', A: 42, fullMark: 100 },
                                        { subject: '污染隔离度', A: 32, fullMark: 100 },
                                        { subject: '极压性能', A: 92, fullMark: 100 },
                                        { subject: '抗氧化寿命', A: 15, fullMark: 100 },
                                    ]}>
                                        <PolarGrid stroke="#1e293b" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                        <Radar name="Oil Quality" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4">
                                <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2">
                                    <Settings size={14} /> 调优泵站供油频率
                                </button>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 维护日志 */}
                    <SciFiCard title="近期维保干预记录" subtitle="DECISION LOG">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">2024-05-22: 完成滤芯二级清洗</div>
                                    <div className="text-[9px] text-slate-500">结果: NAS等级 下降 2级</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚状态栏 --- */}
            <div className="h-10 bg-emerald-950/20 border-t border-emerald-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">在线油质监测仪: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">仿真模型置信度: 96.8%</span>
                    </div>
                </div>
                <div className="text-[10px] text-emerald-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Hydro-Lube Inference Core v3.0 - Predictive Guard
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
