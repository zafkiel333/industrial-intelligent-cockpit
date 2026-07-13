
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/compressed-air/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-52]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-52';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie
} from 'recharts';
import { 
  Wind, Zap, Activity, ShieldAlert, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Flame, Microscope, Droplet, ArrowRightLeft,
  LayoutGrid, Info, ShieldCheck, Volume2, CloudRain,
  Timer as TimerIcon,
  Fingerprint
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 压力波形与波动率 (Pressure Waveform & Variance)
const PRESSURE_TIME_DATA = Array.from({ length: 30 }, (_, i) => ({
    time: `${i}:00`,
    actual: 0.8 + Math.sin(i/2) * 0.05 + (i > 20 ? (i-20)*-0.02 : 0), // 模拟末端压降
    required: 0.8,
    variance: Math.random() * 0.05
}));

// 2. 泄漏量声纹识别 (Leakage Acoustic Fingerprint)
const LEAK_ACOUSTIC_DATA = [
    { freq: '20kHz (背景)', val: 15 },
    { freq: '40kHz (微泄)', val: 32 },
    { freq: '60kHz (紊流)', val: 78 }, // 异常特征点
    { freq: '80kHz (超声)', val: 45 },
    { freq: '100kHz (脉冲)', val: 22 },
];

// 3. 能效博弈: 压力 vs 能耗 (Pressure vs Energy Specific Power)
const EFFICIENCY_GAME_DATA = Array.from({ length: 12 }, (_, i) => ({
    pressure: 0.6 + i * 0.05,
    power: 5.5 + i * 0.8, // 压力越高，比功率越高 (越不划算)
    efficiency: 95 - i * 3
}));

// 4. 系统运行指标雷达
const SYSTEM_HEALTH_RADAR = [
    { subject: '除水效能', A: 92, fullMark: 100 },
    { subject: '润滑油质', A: 85, fullMark: 100 },
    { subject: '管网密封', A: 45, fullMark: 100 }, // 泄漏导致得分低
    { subject: '比功率 η', A: 78, fullMark: 100 },
    { subject: '电机热健康', A: 88, fullMark: 100 },
];

export const CompressedAirPmView: React.FC = () => {
    const [healthScore] = useState(72.4);
    const [leakRate, setLeakRate] = useState(12.5); // %
    const [isSimulating, setIsSimulating] = useState(false);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：气动动力看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        <Wind className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            压缩空气系统故障风险预测
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/30 rounded">
                                计算引擎: Pneumatic-Predictor v2.8
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                介质: 干空气 | 额定压力: 0.8 MPa
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">系统全生命周期健康度</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            {healthScore}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">当前估计泄漏率</div>
                        <div className={`text-3xl font-mono font-bold ${leakRate > 10 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                            {leakRate}%
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：物理场与特征诊断 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 压力瞬态波形 */}
                    <SciFiCard title="压力瞬态波动监测" subtitle="PRESSURE DYNAMICS" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={PRESSURE_TIME_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="presGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[0.6, 1.0]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="actual" stroke="#0ea5e9" fill="url(#presGrad)" strokeWidth={2} name="实时压力(MPa)" />
                                    <ReferenceLine y={0.8} stroke="#10b981" strokeDasharray="5 5" label={{value: '额定', fill: '#10b981', fontSize: 8}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center text-[10px]">
                            <span className="text-slate-500">压力变异系数 (Cv)</span>
                            <span className="text-rose-400 font-bold font-mono">0.084 (警告)</span>
                        </div>
                    </SciFiCard>

                    {/* 泄漏声纹频谱 */}
                    <SciFiCard title="泄漏声纹特征指纹" subtitle="ACOUSTIC SIGNATURE">
                        <div className="h-44 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={LEAK_ACOUSTIC_DATA} layout="vertical" margin={{left: -20, right: 20}}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="freq" type="category" tick={{fill: '#94a3b8', fontSize: 10}} width={80} />
                                    <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#020617'}} />
                                    <Bar dataKey="val" radius={[0, 4, 4, 0]} barSize={15}>
                                        {LEAK_ACOUSTIC_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.val > 60 ? '#f43f5e' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-[10px] text-center text-slate-500 uppercase tracking-widest mt-1">
                             <Fingerprint className="inline mr-2" size={12} /> 特征匹配: 螺旋接头密封失效 (89%)
                        </div>
                    </SciFiCard>

                    {/* AI 推演报告 */}
                    <SciFiCard title="AI 专家劣化推演" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">深度报告：</span> 监测到 #3 压缩机组排气温度与压力波动呈现明显的非线性解耦特征。初步判定为 <span className="text-white font-black underline italic">冷干机换热管束结露结垢</span>。
                                预测在持续运行 48h 后，下游精密过滤器的露点温度将突破 <span className="text-rose-400 font-bold">-20°C</span> 阈值。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">查看除水效率劣化轨迹图</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：全息数字孪生与系统仿真 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 全景视窗 */}
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping shadow-[0_0:10px_cyan]"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">全系统压力场同步仿真扫描</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">压缩比</span>
                                    <span className="text-white font-mono font-bold">1:8.2</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">排气温度</span>
                                    <span className="text-orange-400 font-mono font-bold">82.4 °C</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">系统含油量</span>
                                    <span className="text-emerald-400 font-mono font-bold">&lt; 0.01 ppm</span>
                                </div>
                            </div>
                        </div>

                        {/* 状态控制与定位 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-3 items-end">
                            <div className="bg-black/60 px-4 py-2 rounded border border-rose-500/30 backdrop-blur">
                                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">异常点位检索</div>
                                <div className="text-2xl font-mono font-bold text-rose-500">VALVE-L42</div>
                            </div>
                            <button 
                                onClick={() => setIsSimulating(!isSimulating)}
                                className={`px-5 py-2 rounded-sm border text-[10px] font-black uppercase tracking-widest transition-all
                                    ${isSimulating ? 'bg-cyan-600 border-cyan-400 text-white animate-pulse' : 'bg-slate-900 border-slate-700 text-slate-500'}
                                `}
                            >
                                {isSimulating ? 'Simulation Running' : 'Start Simulation'}
                            </button>
                        </div>

                        <ThreeScene pressureLevel={0.8} flowVelocity={0.6} isAnomalyActive={true} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex flex-col gap-1 flex-1">
                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    <span>管网压力梯度分布 (Pressure Gradient)</span>
                                    <span className="text-cyan-400">Peak: 0.85 MPa</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
                                    <div className="h-full bg-cyan-500 animate-pulse" style={{width: '78%'}}></div>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <button className="px-10 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2">
                                    <ScanLine size={14} /> 启动声发射探伤
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 能效博弈图表 */}
                    <SciFiCard title="压力设定与比功率能效博弈" subtitle="EFFICIENCY TRADE-OFF" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={EFFICIENCY_GAME_DATA} margin={{top:20, right:30, left:0, bottom:0}}>
                                    <defs>
                                        <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="pressure" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Pressure (MPa)', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                                    <YAxis yAxisId="left" stroke="#0ea5e9" tick={{fontSize: 10}} label={{ value: 'Efficiency (%)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#0ea5e9' }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tick={{fontSize: 10}} label={{ value: 'Power (kW/m³)', angle: 90, position: 'insideRight', fontSize: 10, fill: '#f43f5e' }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Area yAxisId="right" type="monotone" dataKey="power" name="比功率 (Energy Penalty)" stroke="#f43f5e" fill="url(#powerGrad)" strokeWidth={2} />
                                    <Line yAxisId="left" type="monotone" dataKey="efficiency" name="系统效率" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4}} />
                                    <ReferenceLine x={0.8} stroke="#10b981" strokeDasharray="10 5" label={{ value: '最优运行点', fill: '#10b981', fontSize: 10, position: 'top' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：综合健康与维保矩阵 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 系统综合雷达 */}
                    <SciFiCard title="多维运行健康评估" subtitle="HEALTH RADAR">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SYSTEM_HEALTH_RADAR}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                    <Radar name="Health" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 实时参数感知流 */}
                    <SciFiCard title="核心传感器实时流阵列" subtitle="STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '冷干机出口露点', val: '-18.4', unit: '°C', status: 'warning' },
                                { label: '精密过滤器压差', val: '0.12', unit: 'MPa', status: 'normal' },
                                { label: '空压机油气分离压', val: '0.42', unit: 'MPa', status: 'normal' },
                                { label: '主电机轴向振幅', val: '0.05', unit: 'mm', status: 'normal' },
                                { label: '耗气量不平衡度', val: '14.2%', unit: 'Δ', status: 'warning' },
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

                    {/* 维护建议 */}
                    <SciFiCard title="预测驱动建议序列" subtitle="ACTIONS">
                        <div className="space-y-2">
                            <div className="p-3 bg-emerald-950/20 rounded border border-emerald-900/50 flex items-center gap-3">
                                <ShieldCheck size={20} className="text-emerald-400" />
                                <div>
                                    <div className="text-[10px] text-emerald-100 font-bold uppercase">执行冷干机疏水自检</div>
                                    <div className="text-[9px] text-emerald-600 font-bold italic">预期露点恢复幅度: 4.5°C</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-emerald-600" />
                            </div>
                            <div className="p-3 bg-orange-950/20 rounded border border-orange-900/50 flex items-center gap-3">
                                <Wrench size={20} className="text-orange-400" />
                                <div>
                                    <div className="text-[10px] text-orange-100 font-bold uppercase">VALVE-L42 连接件更换</div>
                                    <div className="text-[9px] text-orange-600">检测到微漏特征, 预计损耗: 2kWh/h</div>
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
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">终端感知网: 联机正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测模型同步: 25ms 前</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Pneumatic-Inference Core v2.8 - Active Protection Shield
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
