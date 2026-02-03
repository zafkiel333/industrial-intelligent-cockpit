import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/fuel-system/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter
} from 'recharts';
import { 
  Droplet, Thermometer, ShieldAlert, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Brain, AlertTriangle,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Flame, Zap, Activity, Filter, ZapOff,
  Crosshair, Radio, Info, Network,
  // Fix: Added missing Microscope and ShieldCheck imports from lucide-react
  Microscope, ShieldCheck
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 粘度-温度实时控制矩阵 (Viscosity Control)
const VISCOSITY_TREND = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    actual: 12 + Math.sin(i / 4) * 0.5 + (Math.random() - 0.5) * 0.2,
    target: 12.0,
    temp: 135 + Math.sin(i / 4) * 2
}));

// 2. 滤器堵塞演化预测 (Filter Clogging)
const FILTER_CLOG_DATA = Array.from({ length: 30 }, (_, i) => ({
    day: `D+${i}`,
    dp: 0.15 + Math.pow(i / 20, 2.5) * 0.6, // 压差上升
    limit: 0.65
}));

// 3. 燃油理化指标分析 (Fuel Quality Radar)
const FUEL_QUALITY_RADAR = [
    { subject: '水分含量', A: 92, fullMark: 100 },
    { subject: '密度稳定性', A: 85, fullMark: 100 },
    { subject: '残碳指数', A: 78, fullMark: 100 },
    { subject: '硫含量', A: 65, fullMark: 100 },
    { subject: '颗粒度(Al+Si)', A: 88, fullMark: 100 },
];

export const FuelSystemHealthPmView: React.FC = () => {
    const [fuelHealth] = useState(86.4);
    const [anomalyType, setAnomalyType] = useState<'none' | 'pump' | 'filter'>('none');
    const [viscosity] = useState(12.2);

    useEffect(() => {
        const timer = setInterval(() => {
            // 模拟随机警告触发
            if (Math.random() > 0.8) {
                setAnomalyType(Math.random() > 0.5 ? 'pump' : 'filter');
                setTimeout(() => setAnomalyType('none'), 3000);
            }
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：燃油动力态势看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-emerald-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.2)_0%,transparent_70%)]"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-emerald-600/20 rounded border border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                        <Droplet className="text-emerald-400 animate-pulse" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            燃油供给系统健康状态评估
                            <span className="text-xs not-italic font-bold bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">FUEL-GUARD ACTIVE</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>主控引擎: Fluid-Prognostics v4.8</span>
                            <span>介质类型: 重油 (HFO-380) | 燃油消耗率: 12.4 t/h</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">系统综合健康指数</div>
                        <div className="text-4xl font-mono font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                            {fuelHealth}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">燃油运动粘度</div>
                        <div className="text-3xl font-mono font-bold text-cyan-400 tracking-tighter">
                            {viscosity} <span className="text-sm">cSt</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：物理特性与品质分析 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 粘度-温度动态控制图 */}
                    <SciFiCard title="粘度-温度平衡监测" subtitle="V-T CONTROL" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={VISCOSITY_TREND} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="viscGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis yAxisId="visc" stroke="#0ea5e9" tick={{fontSize: 9}} domain={[10, 15]} />
                                    <YAxis yAxisId="temp" orientation="right" stroke="#f59e0b" tick={{fontSize: 9}} domain={[130, 145]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area yAxisId="visc" type="monotone" dataKey="actual" stroke="#0ea5e9" fill="url(#viscGrad)" strokeWidth={2} name="粘度(cSt)" />
                                    <Line yAxisId="temp" type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={1} dot={false} strokeDasharray="5 5" name="温度(°C)" />
                                    <ReferenceLine yAxisId="visc" y={12} stroke="#10b981" strokeDasharray="10 5" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500 font-bold">
                             <div className="flex items-center gap-1"><History size={12} /> 采样频率: 5s</div>
                             <span className="text-emerald-400">稳态保持中</span>
                        </div>
                    </SciFiCard>

                    {/* 燃油品质雷达 */}
                    <SciFiCard title="燃油理化指标全检" subtitle="CHEMICAL ANALYSIS">
                        <div className="h-52 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={FUEL_QUALITY_RADAR}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Quality" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-1 flex items-center justify-center gap-2 p-1 bg-emerald-900/10 rounded border border-emerald-900/30">
                            <Binary size={14} className="text-emerald-500" />
                            <span className="text-[10px] text-emerald-200 uppercase font-bold">符合 ISO 8217 船用燃油标准</span>
                        </div>
                    </SciFiCard>

                    {/* AI 劣化推演报告 */}
                    <SciFiCard title="AI 劣化路径推演" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演报告：</span> 监测到自动反冲洗滤器动作频率在过去 12h 内提升 <span className="text-white font-bold">24%</span>。通过对分油机残渣光谱分析，判定为由于当前燃油中 <span className="text-white">Al+Si 颗粒</span> 偏高导致的精滤器加速堵塞。
                                预测在持续巡航工况下，强制换洗窗口将在 <span className="text-rose-400 font-bold">38小时</span> 后开启。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">调取分油机油泥成分分析图</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：燃油拓扑数字孪生 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-emerald-500/30">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                                <span className="text-[12px] text-emerald-400 font-black tracking-widest uppercase">全系统燃油循环流场同步仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">系统总压力</span>
                                    <span className="text-white font-mono font-bold">0.85 MPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">供给泵转速</span>
                                    <span className="text-emerald-400 font-mono font-bold">1450 RPM</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">换热效率</span>
                                    <span className="text-cyan-400 font-mono font-bold">96.2%</span>
                                </div>
                            </div>
                        </div>

                        {/* 状态标记 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2 items-end">
                            {anomalyType !== 'none' && (
                                <div className="bg-rose-600 px-4 py-1 rounded border border-rose-400 text-xs font-black text-white animate-bounce flex items-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.5)]">
                                    <AlertTriangle size={14} /> 局部异常发现: {anomalyType.toUpperCase()}
                                </div>
                            )}
                            <div className="bg-slate-900/80 px-3 py-1 rounded border border-slate-700 text-[10px] text-slate-500">
                                同步延时: <span className="text-emerald-400 font-mono">14ms</span>
                            </div>
                        </div>

                        <ThreeScene flowRate={flowRateSim} temperatureLevel={temperatureSim} anomalyTarget={anomalyType} />

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex flex-col gap-1 flex-1">
                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    <span>系统流量动态模拟 (Flow Simulation)</span>
                                    <span className="text-emerald-400 font-mono">Current: 24.5 m³/h</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
                                    <div className="h-full bg-emerald-500 animate-pulse" style={{width: '65%'}}></div>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <button className="px-10 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2">
                                    <ScanLine size={14} /> 启动微纳扫描
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(16,185,129,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 滤器堵塞预测曲线图表 */}
                    <SciFiCard title="滤器压差演化与失效窗口预测" subtitle="FILTER PROGNOSIS" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={FILTER_CLOG_DATA} margin={{top:10, right:30, left:0, bottom:0}}>
                                    <defs>
                                        <linearGradient id="clogGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: '压差 (MPa)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="dp" stroke="#0ea5e9" fill="url(#clogGrad)" strokeWidth={3} name="预测压差" />
                                    <ReferenceLine y={0.65} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '强制清洗限值', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：设备感知与维护矩阵 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 泵组运行特征 */}
                    <SciFiCard title="循环/供给泵运行特征" subtitle="PUMP ARRAY">
                        <div className="space-y-4 py-2">
                             {[
                                { label: '1# 循环泵 振幅', val: '2.4', unit: 'mm/s', status: 'normal' },
                                { label: '2# 循环泵 电流', val: '12.8', unit: 'A', status: 'warning' },
                                { label: '供给泵 滑油压力', val: '4.2', unit: 'bar', status: 'normal' },
                                { label: '分油机 出口压力', val: '1.2', unit: 'bar', status: 'normal' },
                             ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-400 uppercase">{item.label}</span>
                                        <span className={item.status === 'warning' ? 'text-orange-400 animate-pulse' : 'text-slate-100'}>{item.val} {item.unit}</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                                        <div 
                                          className={`h-full transition-all duration-1000 ${item.status === 'warning' ? 'bg-orange-500' : 'bg-cyan-500'}`} 
                                          style={{ width: `${Math.random() * 40 + 50}%` }}
                                        ></div>
                                    </div>
                                </div>
                             ))}
                        </div>
                    </SciFiCard>

                    {/* 实时感知参数阵列 */}
                    <SciFiCard title="系统感知参数阵列" subtitle="STREAM" className="flex-1">
                        <div className="space-y-2">
                            {[
                                { label: '进油口温度', val: '135', unit: '°C', status: 'normal' },
                                { label: '加热器蒸汽压', val: '0.62', unit: 'MPa', status: 'normal' },
                                { label: '机前粘度偏差', val: '+0.12', unit: 'cSt', status: 'warning' },
                                { label: '回油背压波动', val: 'Low', unit: 'Δ', status: 'normal' },
                                { label: '燃油计流量', val: '12.4', unit: 'm³/h', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-emerald-500/30 transition-all">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-slate-400 font-bold">{item.label}</span>
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'normal' ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`}></span>
                                    </div>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-lg font-mono font-bold text-white">{item.val}</span>
                                        <span className="text-[9px] text-slate-600">{item.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 维护建议 */}
                    <SciFiCard title="预测驱动维保记录" subtitle="ACTIONS">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-300 font-bold">2024-05-18: 完成精滤器清洗</div>
                                    <div className="text-[9px] text-slate-500">检测结果: 有机硅杂质沉积</div>
                                </div>
                            </div>
                            <div className="p-2 bg-emerald-950/20 rounded border border-emerald-900/50 flex items-center gap-3">
                                <ShieldCheck size={16} className="text-emerald-400" />
                                <div>
                                    <div className="text-[10px] text-emerald-100 font-bold">建议任务: 粘度传感器校准</div>
                                    <div className="text-[9px] text-emerald-600">预计于 150h 港口靠泊期执行</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-emerald-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统状态脚部 --- */}
            <div className="h-10 bg-emerald-950/20 border-t border-emerald-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">流量感知网: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">动态粘度补偿延迟: 12ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-emerald-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Fluid-Network Engine v4.8 - Predictive Integrity Active
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
                @keyframes slide {
                    from { background-position: 0 0; }
                    to { background-position: 30px 30px; }
                }
            `}</style>
        </div>
    );
};

// --- MOCK CONSTANTS FOR ANIMATION ---
const flowRateSim = 0.65;
const temperatureSim = 0.72;
