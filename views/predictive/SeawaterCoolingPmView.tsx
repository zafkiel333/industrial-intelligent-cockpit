
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/seawater-cooling/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-50]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-50';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter
} from 'recharts';
import { 
  Droplets, Activity, Zap, ShieldAlert, Cpu, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Binary, BarChart3, Search, ScanLine,
  RefreshCw, AlertTriangle, ShieldCheck, Microscope,
  ArrowRightLeft, Radio, Wind, HardDrive, MonitorPlay,
  Flame, Anchor, FlaskConical, Beaker, Bug
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 结垢热阻趋势 (Fouling Resistance Rf - m²·K/W)
const FOULING_TREND = Array.from({ length: 30 }, (_, i) => ({
    day: `D+${i}`,
    actual: 0.0001 + Math.pow(i/15, 1.8) * 0.0005 + Math.random() * 0.00005,
    predicted: 0.0001 + Math.pow(i/15, 1.8) * 0.0005 + (i > 20 ? (i-20)*0.0001 : 0),
    limit: 0.0008
}));

// 2. 腐蚀电位分布 (Corrosion Potential - mV)
const POTENTIAL_RADAR = [
    { subject: '艉部牺牲阳极', A: 85, fullMark: 100 },
    { subject: '进水阀座', A: 72, fullMark: 100 },
    { subject: '换热器端盖', A: 45, fullMark: 100 }, // 偏低，风险高
    { subject: '管束连接处', A: 88, fullMark: 100 },
    { subject: '泵壳接地', A: 92, fullMark: 100 },
];

// 3. 海生物活跃度与堵塞风险 (Bio-activity Index)
const BIO_ACTIVITY = Array.from({ length: 12 }, (_, i) => ({
    month: `${i+1}月`,
    activity: 20 + Math.sin(i / 1.5) * 50 + 20,
    temp: 15 + Math.sin(i / 1.5) * 10
}));

export const SeawaterCoolingPmView: React.FC = () => {
    const [healthScore] = useState(76.4);
    const [foulingFactor, setFoulingFactor] = useState(0.42);
    const [corrosionRisk, setCorrosionRisk] = useState(0.28);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：冷却系统深度评估看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                        <Waves className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            海水冷却系统结垢与腐蚀预测
                            <span className="text-xs not-italic font-bold bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 uppercase tracking-widest">Bio-Shield Active</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>分析引擎: Aqueous-Prognostics v4.2</span>
                            <span>管径: DN1200 | 材质: Cu-Ni 90/10</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">系统全生命周期可靠度</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            {healthScore}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">建议清洗窗口 (EST)</div>
                        <div className="text-3xl font-mono font-bold text-orange-400 tracking-tighter">D + 18 <span className="text-sm">DAYS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：热阻演化与水质监测 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 结垢热阻预测图 */}
                    <SciFiCard title="结垢热阻演化预测 (Rf)" subtitle="FOULING RESISTANCE" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={FOULING_TREND} margin={{top:10, right:30, left:-10, bottom:0}}>
                                    <defs>
                                        <linearGradient id="foulGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="day" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="predicted" stroke="#0ea5e9" fill="url(#foulGrad)" strokeWidth={2} strokeDasharray="5 5" name="预测轨迹" />
                                    <Line type="monotone" dataKey="actual" stroke="#22d3ee" strokeWidth={3} dot={{r:3}} name="实测热阻" />
                                    <ReferenceLine y={0.0008} stroke="#ef4444" strokeDasharray="10 5" label={{value:'清洗门限', fill:'#ef4444', fontSize:9, position:'top'}} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center text-[10px]">
                            <span className="text-slate-500">热阻增长率</span>
                            <span className="text-orange-400 font-bold font-mono">+1.2 e-6 / day</span>
                        </div>
                    </SciFiCard>

                    {/* 水质理化参数 */}
                    <SciFiCard title="海水理化特性流" subtitle="WATER CHEMISTRY">
                        <div className="grid grid-cols-2 gap-3 py-2">
                             {[
                                { label: '海水盐度 (Sal)', val: '3.45', unit: '%', status: 'normal' },
                                { label: '溶解氧 (DO)', val: '6.2', unit: 'mg/L', status: 'warning' },
                                { label: '海水 pH 值', val: '8.14', unit: 'pH', status: 'normal' },
                                { label: '电导率 (Cond)', val: '45.8', unit: 'mS/cm', status: 'normal' },
                             ].map((item, i) => (
                                <div key={i} className={`p-2.5 rounded border flex flex-col items-center justify-center transition-all ${item.status === 'warning' ? 'bg-orange-950/20 border-orange-500/50' : 'bg-slate-900/50 border-slate-800'}`}>
                                    <span className="text-[9px] text-slate-500 uppercase font-bold text-center mb-1">{item.label}</span>
                                    <div className="text-xl font-mono font-bold text-white">
                                        {item.val}
                                    </div>
                                </div>
                             ))}
                        </div>
                    </SciFiCard>

                    {/* AI 劣化推演报告 */}
                    <SciFiCard title="AI 专家劣化推演" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演报告：</span> 监测到换热器进出口温差缩小趋势加快，结合当前 <span className="text-white font-bold underline">22.4°C 的高水温环境</span>，判定为钙镁垢类与海生物污损的复合劣化。
                                预测若不进行化学在线处理，能效损耗将在下个航段上升 <span className="text-rose-400 font-bold">18.5%</span>。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <FlaskConical size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">查看实验室腐蚀产物分析</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：冷却管束数字孪生 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping shadow-[0_0:10px_cyan]"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">冷却管束热应力与结垢同步仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前流速 (Velocity)</span>
                                    <span className="text-white font-mono font-bold">2.45 m/s</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">管束换热系数 η</span>
                                    <span className="text-emerald-400 font-mono font-bold">92.4%</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">出口背压 ΔP</span>
                                    <span className="text-orange-400 font-mono font-bold">0.42 MPa</span>
                                </div>
                            </div>
                        </div>

                        {/* 状态标注 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2 items-end">
                            <div className="bg-black/60 px-3 py-1 rounded border border-slate-700 text-[10px] text-slate-500 uppercase tracking-tighter">
                                采样位: <span className="text-white font-bold">HEAT-EX-B4</span>
                            </div>
                            <button 
                                onClick={() => { setFoulingFactor(0.8); setCorrosionRisk(0.9); }}
                                className="bg-rose-900/30 px-3 py-1 rounded border border-rose-900/50 text-[10px] text-rose-400 font-bold animate-pulse hover:bg-rose-600 hover:text-white transition-all"
                            >
                                执行加速劣化仿真
                            </button>
                        </div>

                        <ThreeScene scalingSeverity={foulingFactor} corrosionSeverity={corrosionRisk} isScanning={true} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部交互区 - 结垢模拟 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex flex-col gap-1 flex-1">
                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    <span>结垢层厚度模拟 (Scaling Depth)</span>
                                    <span className="text-cyan-400 font-mono">Current: {(foulingFactor * 2.5).toFixed(2)} mm</span>
                                </div>
                                <input 
                                    type="range" min="0" max="1" step="0.01" 
                                    value={foulingFactor} 
                                    onChange={(e) => setFoulingFactor(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                             </div>
                             <div className="flex items-center gap-3">
                                <button className="px-10 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2">
                                    <ScanLine size={14} /> 启动光纤探伤扫描
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 海生物活跃度预测图表 */}
                    <SciFiCard title="海生物活跃度与管路阻塞风险预测" subtitle="BIO-FOULING PROGNOSIS" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={BIO_ACTIVITY} margin={{top:10, right:30, left:0, bottom:0}}>
                                    <defs>
                                        <linearGradient id="bioGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#84cc16" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Area type="monotone" dataKey="activity" name="海生物活跃指数" stroke="#84cc16" fill="url(#bioGrad)" strokeWidth={2} />
                                    <Line type="monotone" dataKey="temp" name="海水表面温度" stroke="#f59e0b" strokeWidth={2} dot={{r:4}} />
                                    <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '高危阻塞期', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：电化学保护与维护矩阵 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 腐蚀电位雷达 */}
                    <SciFiCard title="阴极保护电位分布" subtitle="ELECTROCHEMICAL CP">
                        <div className="h-56 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={POTENTIAL_RADAR}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                    <Radar name="Potential" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="p-2 bg-blue-900/20 rounded border border-blue-900/30 flex justify-between items-center text-[10px]">
                            <span className="text-slate-400">平均保护电流</span>
                            <span className="text-cyan-400 font-bold font-mono">1.24 A/m²</span>
                        </div>
                    </SciFiCard>

                    {/* 实时感知阵列流 */}
                    <SciFiCard title="核心传感器实时流阵列" subtitle="STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '外加电流保护压降', val: '1.24', unit: 'V', status: 'normal' },
                                { label: '海水浊度 (Turbidity)', val: '14.2', unit: 'NTU', status: 'warning' },
                                { label: '叶绿素 A 浓度', val: '2.5', unit: 'mg/m³', status: 'normal' },
                                { label: '进水口滤网差压', val: '0.12', unit: 'MPa', status: 'normal' },
                                { label: '电化学噪声强度', val: '0.85', unit: 'Idx', status: 'warning' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-cyan-500/30 transition-all">
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

                    {/* 预测维护建议 */}
                    <SciFiCard title="预测性工作建议" subtitle="ACTIONS">
                        <div className="space-y-2">
                            <div className="p-3 bg-emerald-950/20 rounded border border-emerald-900/50 flex items-center gap-3">
                                <ShieldCheck size={20} className="text-emerald-400" />
                                <div>
                                    <div className="text-[10px] text-emerald-100 font-bold uppercase">调整牺牲阳极输出</div>
                                    <div className="text-[9px] text-emerald-600 font-bold italic">建议增加 5% 保护电位以对冲高盐度风险</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-emerald-600" />
                            </div>
                            <div className="p-3 bg-orange-950/20 rounded border border-orange-900/50 flex items-center gap-3">
                                <Beaker size={20} className="text-orange-400" />
                                <div>
                                    <div className="text-[10px] text-orange-100 font-bold uppercase">在线化学除垢作业</div>
                                    <div className="text-[9px] text-orange-600">预测能效恢复幅度: +14.5%</div>
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
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">终端水质监测网: 联机正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">劣化趋势更新: 25ms 前</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Aqueous Engine v4.2.0 - Active Protection Shield
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
