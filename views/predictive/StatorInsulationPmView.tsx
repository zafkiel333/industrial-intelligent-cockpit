import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/stator-insulation/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  CloudLightning, Activity, Zap, ShieldAlert, Cpu, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Wind, Radio, Play, Pause, FastForward, Ship,
  Compass, HardDrive, MonitorPlay, Flame, Microscope,
  ArrowDownRight, Scale, Droplet, ZapOff
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 极化指数与吸收比趋势 (PI & DAR)
const POLARIZATION_TREND = Array.from({ length: 24 }, (_, i) => ({
    time: `T-${23-i}H`,
    pi: 3.2 - i * 0.04 - Math.random() * 0.1,
    dar: 1.6 - i * 0.02 - Math.random() * 0.05,
    limit_pi: 2.0,
    limit_dar: 1.3
}));

// 2. 局部放电 PRPD 指纹 (Partial Discharge Pattern)
const PRPD_DATA = Array.from({ length: 100 }, (_, i) => ({
    phase: i * 3.6,
    magnitude: (i > 15 && i < 35) || (i > 65 && i < 85) 
        ? Math.random() * 80 + 20 
        : Math.random() * 10,
    count: Math.floor(Math.random() * 50)
}));

// 3. 绝缘电阻温湿度补偿模型 (Temp-Humidity Correction)
const CORRECTION_SURFACE = [
    { name: 'R实测', val: 420, fullMark: 1000 },
    { name: 'R补偿', val: 580, fullMark: 1000 },
    { name: '湿度影响', val: 720, fullMark: 1000 },
    { name: '盐雾系数', val: 450, fullMark: 1000 },
    { name: '温升偏移', val: 320, fullMark: 1000 },
];

export const StatorInsulationPmView: React.FC = () => {
    const [healthScore] = useState(74.5);
    const [isScanning, setIsScanning] = useState(true);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：电介质完整性监控看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                        <CloudLightning className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            发电机定子绕组绝缘预测中心
                            <span className="text-xs not-italic font-bold bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">DIELECTRIC ANALYZER ACTIVE</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>探测模态: 在线局放 (OLPD) + FDS 介质谱</span>
                            <span>绝缘等级: Class F | 标称电压: 6.6 kV</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">介质健康评分 (DHI)</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            {healthScore}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">绝缘电阻 (R-ins)</div>
                        <div className="text-3xl font-mono font-bold text-white tracking-tighter">425 <span className="text-sm text-slate-500">MΩ</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主分析交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：电介质响应与环境补偿 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 极化特性曲线 */}
                    <SciFiCard title="极化指数 (PI) 与吸收比 (DAR)" subtitle="DIELECTRIC RESPONSE" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={POLARIZATION_TREND} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="piGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="pi" stroke="#06b6d4" fill="url(#piGrad)" strokeWidth={2} name="PI" />
                                    <Line type="monotone" dataKey="dar" stroke="#8b5cf6" strokeWidth={2} dot={false} name="DAR" />
                                    <ReferenceLine y={2.0} stroke="#ef4444" strokeDasharray="5 5" label={{value:'PI临界', fill:'#ef4444', fontSize:8}} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                             <div className="flex items-center gap-1 text-orange-400 animate-pulse"><ZapOff size={12}/> 受潮风险上升</div>
                             <span className="text-white font-mono">PI: 2.12 (警示)</span>
                        </div>
                    </SciFiCard>

                    {/* 环境补偿模型 */}
                    <SciFiCard title="环境劣化影响因子" subtitle="ECO-COMPENSATION">
                        <div className="h-52 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={CORRECTION_SURFACE}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Weight" dataKey="val" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* AI 诊断推演 */}
                    <SciFiCard title="AI 绝缘劣化机理推演" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演报告：</span> 监测到 #14 槽部存在 <span className="text-white font-bold underline">内电晕放电指纹</span>。由于高盐雾环境下散热器效率下降 15%，引发局部过热，加速了环氧树脂云母带的分层劣化。预计 300h 内放电量将翻倍。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">调取绝缘频谱 FDS 分析数据</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：定子绝缘全息数字孪生 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping shadow-[0_0_10px_cyan]"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">绕组介质响应实时全息渲染</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大局放量 (Qmax)</span>
                                    <span className="text-rose-500 font-mono font-bold">450 pC</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">介质损耗因数 tanδ</span>
                                    <span className="text-emerald-400 font-mono font-bold">0.024</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前平均场强</span>
                                    <span className="text-white font-mono font-bold">2.4 kV/mm</span>
                                </div>
                            </div>
                        </div>

                        <ThreeScene insulationHealth={healthScore / 100} isScanning={isScanning} />

                        {/* 底部中心交互 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-cyan-600 text-cyan-400 hover:text-white text-xs font-black rounded border border-cyan-900/50 transition-all flex items-center gap-3 shadow-xl">
                                <Search size={16} /> 绝缘结构微观解构
                            </button>
                            <button className="px-10 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center gap-3">
                                <MonitorPlay size={16} /> 模拟过电压冲击测试
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* PRPD 指纹图谱 */}
                    <SciFiCard title="局部放电相位解析谱 (PRPD Fingerprint)" subtitle="OLPD MONITORING" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{top: 20, right: 20, bottom: 0, left: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis type="number" dataKey="phase" name="Phase" unit="°" stroke="#64748b" tick={{fontSize: 10}} domain={[0, 360]} />
                                    <YAxis type="number" dataKey="magnitude" name="Magnitude" unit="pC" stroke="#64748b" tick={{fontSize: 10}} />
                                    <ZAxis type="number" dataKey="count" range={[20, 200]} />
                                    <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Scatter name="PD Hits" data={PRPD_DATA} fill="#0ea5e9" fillOpacity={0.6} />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：维护计划与风险管理 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 绝缘寿命预测 */}
                    <SciFiCard title="绝缘寿命预期演化 (RUL)" subtitle="LIFE CYCLE">
                        <div className="space-y-4 py-2">
                            <div className="h-32 w-full bg-[#020617] border border-slate-800 rounded relative overflow-hidden flex items-center justify-center">
                                {/* 模拟寿命进度条 */}
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,cyan_0%,transparent_70%)]"></div>
                                <div className="flex flex-col items-center">
                                    <Timer className="text-cyan-500 mb-1" size={24} />
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">预测剩余有效运行</span>
                                    <span className="text-xl font-mono font-bold text-white">4,250 <span className="text-xs">HRS</span></span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-slate-500">累计电应力</span>
                                    <span className="text-white">92.4 %</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500" style={{ width: '92%' }}></div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 实时感知阵列流 */}
                    <SciFiCard title="实时电介质状态阵列" subtitle="DATA STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '槽部平均温度', val: '82.4', unit: '°C', status: 'normal' },
                                { label: '槽楔松动检测', val: 'Pass', unit: '', status: 'normal' },
                                { label: '定子漏电电流', val: '4.2', unit: 'µA', status: 'warning' },
                                { label: '冷却空气盐分', val: '12.4', unit: 'mg/m³', status: 'normal' },
                                { label: '绕组端部振动', val: '1.24', unit: 'mm/s', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-cyan-500/30 transition-all">
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

                    {/* 维护建议 */}
                    <SciFiCard title="预测性维保建议包" subtitle="MAINTENANCE">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-300 font-bold">上次离线试验: 2023-11-12</div>
                                    <div className="text-[9px] text-slate-500">检测结果: 良好 (B级)</div>
                                </div>
                            </div>
                            <div className="p-2 bg-orange-950/20 rounded border border-orange-900/50 flex items-center gap-3">
                                <Wrench size={16} className="text-orange-400" />
                                <div>
                                    <div className="text-[10px] text-orange-100 font-bold">建议任务: 绕组喷漆除盐</div>
                                    <div className="text-[9px] text-orange-600">预计于 D+15 进坞窗口执行</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-orange-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚状态栏 --- */}
            <div className="h-10 bg-cyan-950/20 border-t border-cyan-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">绝缘传感器网: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">分析时延: 14ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Dielectric-Inference Engine v5.2.0 - Insulation Guardian Active
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