import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/ship-switchboard/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-41]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-41';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie
} from 'recharts';
import { 
  Zap, Thermometer, ShieldAlert, Cpu, Activity,
  TrendingUp, Gauge, Wrench, Brain, AlertTriangle,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Binary, BarChart3, Search, ScanLine,
  ZapOff, Flame, Microscope, Radio, HardDrive,
  MonitorPlay, Fingerprint, RefreshCw
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 母线接点温升趋势 (Busbar Hotspot Temp)
const TEMP_TREND_DATA = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    tempA: 42 + Math.sin(i/3) * 2,
    tempB: 45 + Math.pow(i/10, 2.2) + Math.random() * 3, // 模拟异常温升
    tempC: 41 + Math.cos(i/4) * 2,
    limit: 75
}));

// 2. 接触电阻预测模型 (Contact Resistance R_contact in μΩ)
const RESISTANCE_INFERENCE = Array.from({ length: 12 }, (_, i) => ({
    month: `T-${11-i}M`,
    r_actual: 15 + i * 1.5 + (i > 8 ? i * 8 : 0),
    r_limit: 100
}));

// 3. 谐波畸变对温升贡献度 (Harmonic Contributions)
const HARMONIC_RADAR = [
    { subject: '基波电流', A: 95, fullMark: 100 },
    { subject: '3次谐波', A: 45, fullMark: 100 },
    { subject: '5次谐波', A: 32, fullMark: 100 },
    { subject: '7次谐波', A: 18, fullMark: 100 },
    { subject: '高频噪声', A: 12, fullMark: 100 },
];

export const ShipSwitchboardOverheatPmView: React.FC = () => {
    const [hotspotLevel, setHotspotLevel] = useState(0.65); // 65% 风险
    const [activePhase] = useState('Phase B');

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：电能热熵监控看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-orange-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-orange-600/20 rounded border border-orange-500/50 shadow-[0_0_25px_rgba(249,115,22,0.3)]">
                        <Zap className="text-orange-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            船舶配电板与母线过热风险预测
                            <span className="text-xs not-italic font-bold bg-orange-900/50 text-orange-300 px-2 py-0.5 rounded border border-orange-800 uppercase">Thermal-Shield Active</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>所属节点: 主配电板 MSB-01</span>
                            <span>额定电流: 2500 A | 环境参考温: 28.5 °C</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">关键点热裕度 (Thermal Margin)</div>
                        <div className="text-4xl font-mono font-bold text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                            12.8<span className="text-sm">°C</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">连接完整性预测</div>
                        <div className="text-3xl font-mono font-bold text-emerald-400">GOOD</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：热动力学与电阻推演 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 三相温升曲线对比 */}
                    <SciFiCard title="三相母线实时温升对比" subtitle="THERMAL BALANCE" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={TEMP_TREND_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '9px'}} />
                                    <Line type="monotone" dataKey="tempA" stroke="#eab308" strokeWidth={2} dot={false} name="Phase A" />
                                    <Line type="monotone" dataKey="tempB" stroke="#10b981" strokeWidth={3} dot={false} name="Phase B (Warn)" />
                                    <Line type="monotone" dataKey="tempC" stroke="#ef4444" strokeWidth={2} dot={false} name="Phase C" />
                                    <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="10 5" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-orange-950/20 border border-orange-900/30 rounded flex items-center gap-2">
                            <AlertTriangle size={14} className="text-orange-400 animate-pulse" />
                            <span className="text-[10px] text-orange-200">检测到 B 相接点温升斜率异常: +1.2°C/h</span>
                        </div>
                    </SciFiCard>

                    {/* 接触电阻推演图 */}
                    <SciFiCard title="连接点接触电阻反向推演" subtitle="RESISTANCE INFERENCE">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={RESISTANCE_INFERENCE}>
                                    <defs>
                                        <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="month" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="r_actual" stroke="#0ea5e9" fill="url(#resGrad)" strokeWidth={2} name="推算电阻 (μΩ)" />
                                    <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="5 5" label={{value:'劣变点', fill:'#ef4444', fontSize:8}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-slate-500">
                             算法模型：Thermal-Joule Coupling Core v2.1
                        </div>
                    </SciFiCard>

                    {/* AI 诊断推演报告 */}
                    <SciFiCard title="AI 专家过热推演" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">深度分析报告：</span> 监测到 B 相 2# 连接螺栓处温升与总谐波畸变率（THD-I）呈现强正相关。初步判定为 <span className="text-white font-bold underline">螺栓预紧力下降导致的接触面氧化</span>。
                                预测在持续 80% 负荷下，120h 内温升将突破 <span className="text-rose-400 font-bold">85°C</span> 熔点红线。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-orange-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Fingerprint size={16} className="text-orange-400" />
                                    <span className="text-[11px] text-slate-300">查看故障特征谐波指纹</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：全息母线数字孪生视窗 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#01030a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-orange-500/30">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping shadow-[0_0_10px_orange]"></div>
                                <span className="text-[12px] text-orange-400 font-black tracking-widest uppercase">配电核心温升场数字孪生映射</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大电流密度</span>
                                    <span className="text-white font-mono font-bold">2.4 A/mm²</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">三相平衡度</span>
                                    <span className="text-emerald-400 font-mono font-bold">96.5%</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">电弧噪声水平</span>
                                    <span className="text-white font-mono font-bold">-82 dBm</span>
                                </div>
                            </div>
                        </div>

                        <ThreeScene hotspotIntensity={hotspotLevel} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部交互区 - 风险模拟控制 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex flex-col gap-1 flex-1">
                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    <span>风险情景演化 (Risk Simulation)</span>
                                    <span className="text-orange-400">Severity: {Math.floor(hotspotLevel * 100)}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="1" step="0.01" 
                                    value={hotspotLevel} 
                                    onChange={(e) => setHotspotLevel(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                             </div>
                             <div className="flex items-center gap-3">
                                <button className="p-3 rounded-full bg-slate-800 hover:bg-orange-600 transition-colors border border-slate-700">
                                    <History size={16} className="text-white" />
                                </button>
                                <button className="px-8 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all">
                                    启动红外巡检
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(249,115,22,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 谐波分布与损耗分析 */}
                    <SciFiCard title="电流谐波分布与温升相关性" subtitle="HARMONIC IMPACT" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={HARMONIC_RADAR} margin={{top:20, right:20, bottom:0, left:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="subject" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: '能级 (dB)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Bar dataKey="A" name="当前能量分布" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
                                    <ReferenceLine y={25} stroke="#f59e0b" strokeDasharray="3 3" label={{value:'趋肤效应显著区', fill:'#f59e0b', fontSize:8}} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：红外阵列与维护建议 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 红外感知阵列 */}
                    <SciFiCard title="红外分布式温度阵列" subtitle="IR SENSOR MATRIX">
                        <div className="grid grid-cols-4 gap-1 py-2">
                            {Array.from({length: 16}).map((_, i) => {
                                const temp = 35 + Math.random() * 10 + (i === 10 ? 25 : 0);
                                return (
                                    <div key={i} className={`aspect-square flex items-center justify-center rounded-sm border border-white/5 transition-all
                                        ${temp > 60 ? 'bg-rose-600 animate-pulse' : temp > 45 ? 'bg-orange-600' : 'bg-slate-800'}
                                    `}>
                                        <span className="text-[8px] font-bold text-white/80">{temp.toFixed(0)}°</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-2 text-[9px] text-slate-500 uppercase flex justify-between">
                            <span>探测器: IR-Grid-X8</span>
                            <span className="text-rose-400 font-bold">1个异常热点</span>
                        </div>
                    </SciFiCard>

                    {/* 维护建议包 */}
                    <SciFiCard title="预测驱动维护包" subtitle="MAINTENANCE" className="flex-1">
                        <div className="space-y-3">
                            <div className="p-3 bg-orange-950/20 rounded border border-orange-900/50 flex items-center gap-3">
                                <RefreshCw size={20} className="text-orange-400" />
                                <div>
                                    <div className="text-[11px] text-orange-100 font-bold">紧固 B 相主母线接点</div>
                                    <div className="text-[9px] text-orange-600">建议力矩: 85 N·m | 状态: 紧急</div>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded flex items-center gap-3 opacity-60">
                                <Microscope size={20} className="text-slate-500" />
                                <div>
                                    <div className="text-[11px] text-slate-200 font-bold">绝缘挡板除尘清洗</div>
                                    <div className="text-[9px] text-slate-600">检测到微量盐雾堆积</div>
                                </div>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-800">
                                <button className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold rounded shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center gap-2">
                                    <HardDrive size={14} /> 调取断路器保护设定参数
                                </button>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 历史失效特征比对 */}
                    <SciFiCard title="历史过热案例指纹" subtitle="HISTORY CLUSTER">
                        <div className="space-y-2">
                            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-300 font-bold">案例 #E-2023-04</div>
                                    <div className="text-[9px] text-slate-500">特征匹配度: 94% (母线氧化)</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-slate-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚状态栏 --- */}
            <div className="h-10 bg-orange-950/20 border-t border-orange-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">红外阵列网: 联机正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">分析步长: 100ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-orange-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Thermal-Inference Core v2.1 - Predictive Shield Active
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