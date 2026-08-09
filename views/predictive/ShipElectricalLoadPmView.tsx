import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/ship-electrical-load/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-42]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-42';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter
} from 'recharts';
import { 
  Zap, Activity, ShieldAlert, Cpu, TrendingUp, 
  Gauge, Wrench, Thermometer, Brain, AlertTriangle,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Power, BatteryCharging, AlertOctagon, Radio,
  FastForward, Wind, Anchor
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 负载预测趋势 (24h 历史 + 4h 预测)
const LOAD_FORECAST_DATA = Array.from({ length: 28 }, (_, i) => {
    const isForecast = i >= 24;
    const base = 750 + Math.sin(i / 4) * 150;
    const actual = isForecast ? null : base + (Math.random() - 0.5) * 40;
    const pred = base + (isForecast ? (i-23)*20 : 0); // 模拟预测上升
    return {
        time: `${i}:00`,
        actual,
        predicted: pred,
        upper: pred + 50,
        lower: pred - 50,
        isForecast
    };
});

// 2. 谐波畸变指纹 (Harmonic Spectrum)
const HARMONIC_DATA = [
    { freq: '1st (Base)', val: 100, status: 'normal' },
    { freq: '3rd (Triplen)', val: 12, status: 'normal' },
    { freq: '5th (VFD)', val: 28, status: 'warning' },
    { freq: '7th (Comm)', val: 18, status: 'normal' },
    { freq: '11th (Noise)', val: 8, status: 'normal' },
];

// 3. 备用容量与稳定性雷达
const GRID_STABILITY_RADAR = [
    { subject: '有功储备', A: 92, fullMark: 100 },
    { subject: '电压稳定性', A: 85, fullMark: 100 },
    { subject: '频率偏差', A: 95, fullMark: 100 },
    { subject: '无功平衡', A: 78, fullMark: 100 },
    { subject: '谐波抑制', A: 60, fullMark: 100 },
];

export const ShipElectricalLoadPmView: React.FC = () => {
    const [loadIntensity, setLoadIntensity] = useState(0.72);
    const [isAnomaly, setIsAnomaly] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            // 模拟随机异常突发
            if (Math.random() > 0.9) {
                setIsAnomaly(true);
                setTimeout(() => setIsAnomaly(false), 3000);
            }
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：电能完整性监控看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-blue-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-blue-600/20 rounded border border-blue-500/50 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                        <Power className="text-blue-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            船舶电力系统负载异常预测
                            <span className="text-xs not-italic font-bold bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded border border-blue-800 uppercase">Load-Shield Active</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>系统架构: 6.6kV 中压环网</span>
                            <span>预测算法: Hybrid-Temporal-Transformer v2.4</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">系统备用容量率</div>
                        <div className="text-4xl font-mono font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            24.5<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">电网预测状态</div>
                        <div className={`text-3xl font-mono font-bold ${isAnomaly ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                            {isAnomaly ? 'SURGE RISK' : 'STABLE'}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 主分析交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：负载演化与AI预测 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 高频负载预测图 */}
                    <SciFiCard title="负载功率时空预测" subtitle="LOAD FORECASTING" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={LOAD_FORECAST_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="upper" stroke="none" fill="#0ea5e9" fillOpacity={0.05} />
                                    <Area type="monotone" dataKey="lower" stroke="none" fill="#020617" />
                                    <Area type="monotone" dataKey="predicted" stroke="#0ea5e9" fill="url(#loadGrad)" strokeWidth={2} strokeDasharray="5 5" name="预测值" />
                                    <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} dot={{r: 2}} name="实测值" />
                                    <ReferenceLine x="23:00" stroke="#f59e0b" strokeDasharray="3 3" label={{value: '预测起点', fill: '#f59e0b', fontSize: 8}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-slate-500 font-bold">
                            预测置信度区间: <span className="text-blue-400">95% Confidence Band</span>
                        </div>
                    </SciFiCard>

                    {/* 谐波畸变指纹 */}
                    <SciFiCard title="电网谐波畸变指纹 (THD)" subtitle="HARMONIC SPECTRUM">
                        <div className="h-44 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={HARMONIC_DATA} margin={{top:5, right:5, left:-20, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="freq" tick={{fontSize: 9, fill: '#64748b'}} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                    <Bar dataKey="val" radius={[2, 2, 0, 0]} barSize={15}>
                                        {HARMONIC_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.status === 'warning' ? '#f59e0b' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-blue-900/10 rounded border border-blue-900/30">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-500 uppercase flex items-center gap-1"><Binary size={10}/> 总谐波畸变率</span>
                                <span className="text-white font-mono font-bold">2.84 %</span>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* AI 稳定性评估 */}
                    <SciFiCard title="AI 稳定性风险推演" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演报告：</span> 监测到 5 次谐波能量在重载模式下异常波动。预测在下个航段开启 <span className="text-white font-bold underline">首侧推器</span> 时，可能引发 6.6kV 母线暂态电压跌落超过 10%。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-blue-900/40 rounded border border-slate-700 cursor-pointer transition-all text-xs">
                                    <Search size={14} className="text-blue-400" />
                                    <span className="text-slate-300">调取历史黑匣子失电工况比对</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：能量场数字孪生视窗 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#01030a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset:0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-blue-500/30">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping shadow-[0_0_10px_blue]"></div>
                                <span className="text-[12px] text-blue-400 font-black tracking-widest uppercase">全船电网动态负载流仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">有功总功率</span>
                                    <span className="text-white font-mono font-bold">4,250 kW</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">电网频率</span>
                                    <span className="text-emerald-400 font-mono font-bold">59.98 Hz</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">瞬态冲击风险</span>
                                    <span className={`font-mono font-bold ${isAnomaly ? 'text-rose-500' : 'text-blue-400'}`}>LOW</span>
                                </div>
                            </div>
                        </div>

                        <ThreeScene loadIntensity={loadIntensity} isAnomalyDetected={isAnomaly} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部中心交互 - 动态调整负载模拟 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex flex-col gap-1 flex-1">
                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    <span>工况负载演化模拟 (Load Simulation)</span>
                                    <span className="text-blue-400 font-mono">Intensity: {(loadIntensity * 100).toFixed(0)}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="1" step="0.01" 
                                    value={loadIntensity} 
                                    onChange={(e) => setLoadIntensity(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                             </div>
                             <div className="flex items-center gap-3">
                                <button className="p-3 rounded-full bg-slate-800 hover:bg-blue-600 transition-colors border border-slate-700">
                                    <Settings size={16} className="text-white" />
                                </button>
                                <button className="px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all uppercase tracking-widest">
                                    启动概率预测
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(37,99,235,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 节点负载分配分析图 */}
                    <SciFiCard title="核心负载单元功率分配" subtitle="POWER ALLOCATION" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: '推进器 A', active: 1800, reserve: 200 },
                                    { name: '推进器 B', active: 1750, reserve: 250 },
                                    { name: '冷藏集装箱', active: 450, reserve: 150 },
                                    { name: '辅助辅机', active: 200, reserve: 400 },
                                ]} margin={{top:20, right:20, bottom:0, left:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'kW', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Bar dataKey="active" name="当前消耗" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="reserve" name="响应储备" fill="#334155" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：电网健康与稳定性 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 电网稳定性雷达 */}
                    <SciFiCard title="电网运行综合稳定性" subtitle="GRID STABILITY">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={GRID_STABILITY_RADAR}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                    <Radar name="Status" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 实时参数感知阵列 */}
                    <SciFiCard title="实时电能质量感知" subtitle="STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '频率最大偏差', val: '0.02', unit: 'Hz', status: 'normal' },
                                { label: '电压不平衡度', val: '0.84', unit: '%', status: 'normal' },
                                { label: '无功功率总和', val: '420', unit: 'kVar', status: 'warning' },
                                { label: '中性线电流', val: '12.4', unit: 'A', status: 'normal' },
                                { label: '发电机并联环流', val: '5.2', unit: 'A', status: 'warning' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-blue-500/30 transition-all">
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

                    {/* 预测性响应建议 */}
                    <SciFiCard title="电力调度决策链" subtitle="ACTIONS">
                        <div className="space-y-2">
                            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-300 font-bold">2024-05-20: 预测性开机</div>
                                    <div className="text-[9px] text-slate-500">检测到负载增长斜率超标，已启动 #3 DG 预热</div>
                                </div>
                            </div>
                            <div className="p-2.5 bg-blue-950/20 rounded border border-blue-900/50 flex items-center gap-3">
                                <Zap size={16} className="text-blue-400" />
                                <div>
                                    <div className="text-[10px] text-blue-100 font-bold">建议操作: 削峰填谷模式</div>
                                    <div className="text-[9px] text-blue-600">延迟空调非必要循环，保障推进优先</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-blue-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚状态栏 --- */}
            <div className="h-10 bg-blue-950/20 border-t border-blue-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">电能质量传感器: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">边缘计算负载: 24.5%</span>
                    </div>
                </div>
                <div className="text-[10px] text-blue-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Power-Inference Core v4.8 - Predictive Guard
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