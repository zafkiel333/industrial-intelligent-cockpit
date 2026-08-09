import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/lube-system-rul/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-48]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-48';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  Droplet, Zap, ShieldAlert, Cpu, Activity,
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Hourglass, Calendar, FlaskConical, Microscope,
  ShieldCheck, AlertTriangle, Workflow, Radio,
  Server, Box
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 部件 RUL 实时概览 (Component Stack)
const COMPONENT_STATUS = [
    { name: '主循环螺杆泵', rul: 1240, health: 85, risk: 'Low', color: '#0ea5e9' },
    { name: '自动反冲洗滤器', rul: 350, health: 42, risk: 'High', color: '#ef4444' },
    { name: '板式换热器', rul: 2800, health: 94, status: 'Normal', color: '#10b981' },
    { name: '推力轴承润滑支路', rul: 520, health: 65, risk: 'Med', color: '#f59e0b' },
];

// 2. 蒙特卡洛失效概率分布 (Failure Probability Density)
const FAILURE_DISTRIBUTION = Array.from({ length: 40 }, (_, i) => {
    const hours = i * 100 + 400; // 从400h到4400h
    // 模拟偏态分布
    const prob = Math.exp(-Math.pow(hours - 1200, 2) / 800000) * 100;
    return { hours, prob };
});

// 3. 劣化物理特征演化 (Physics of Failure - PoF)
const DEGRADATION_PATH = Array.from({ length: 30 }, (_, i) => ({
    day: `T-${29-i}`,
    vibration: 2.1 + Math.pow(i/15, 2.5) * 1.5 + (Math.random()-0.5)*0.2,
    leakage: 0.1 + Math.pow(i/20, 2) * 0.4,
    limit: 4.5
}));

export const LubeSystemRulPmView: React.FC = () => {
    const [overallReliability] = useState(88.4);
    const [activeAnalysis] = useState(true);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：系统可靠性全景看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-indigo-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-indigo-600/20 rounded border border-indigo-500/50 shadow-[0_0_25px_rgba(99,102,241,0.3)]">
                        <Hourglass className="text-indigo-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            润滑系统关键部件剩余寿命(RUL)预测
                            <span className="text-xs not-italic font-bold bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800 uppercase tracking-tighter">Prognostics Node Active</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>计算模态: PoF + Data-Driven Fusion</span>
                            <span>分析引擎: Neural-Lube-Core v3.2</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">系统全周期可靠度</div>
                        <div className="text-4xl font-mono font-bold text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                            {overallReliability}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">预计最快失效窗口</div>
                        <div className="text-3xl font-mono font-bold text-rose-500 tracking-tighter">350 <span className="text-sm">HRS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：部件堆栈与健康矩阵 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 部件 RUL 堆栈 */}
                    <SciFiCard title="部件剩余寿命分布堆栈" subtitle="COMPONENT RUL" highlight className="bg-[#0c1221]">
                        <div className="space-y-4 py-2">
                            {COMPONENT_STATUS.map((item, i) => (
                                <div key={i} className="group relative">
                                    <div className="flex justify-between items-center mb-1 text-[11px] font-bold">
                                        <span className="text-slate-400 uppercase">{item.name}</span>
                                        <span className={`font-mono ${item.health < 50 ? 'text-rose-500' : 'text-slate-200'}`}>{item.rul} h</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                                        <div 
                                            className={`h-full transition-all duration-1000`} 
                                            style={{ width: `${item.health}%`, backgroundColor: item.color }}
                                        ></div>
                                    </div>
                                    {item.health < 50 && (
                                        <div className="mt-1 flex items-center gap-1 text-[9px] text-rose-500 font-bold animate-pulse">
                                            <AlertTriangle size={10} /> 建议在 15 日内检修
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 bg-slate-800 hover:bg-indigo-600 text-[10px] font-bold uppercase border border-slate-700 rounded transition-all flex items-center justify-center gap-2">
                            <Workflow size={14} /> 查看全系统拓扑关联图
                        </button>
                    </SciFiCard>

                    {/* 劣化因果分析雷达 */}
                    <SciFiCard title="劣化驱动因子解析" subtitle="DEGRADATION VECTORS">
                        <div className="h-52 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                    { subject: '机械磨损', A: 85, fullMark: 100 },
                                    { subject: '润滑失效', A: 42, fullMark: 100 },
                                    { subject: '空蚀气蚀', A: 32, fullMark: 100 },
                                    { subject: '热疲劳', A: 78, fullMark: 100 },
                                    { subject: '油液污染', A: 92, fullMark: 100 },
                                ]}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Status" dataKey="A" stroke="#818cf8" fill="#818cf8" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #334155'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* AI 诊断推演报告 */}
                    <SciFiCard title="AI 专家推演引擎" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演报告：</span> 监测到循环泵出口压力脉动频率与螺杆啮合基频偏离 1.2Hz。判定为 <span className="text-white font-black italic">侧隙间隙异常增大</span>。
                                结合油液中铁谱浓度上升趋势，预测泵体容积效率将在未来 120h 内下降 8.5%。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-indigo-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-indigo-400" />
                                    <span className="text-[11px] text-slate-300">调取高精度声纹特征对比图</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D数字孪生与预测分布 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 动力学孪生视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-indigo-500/30">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shadow-[0_0_10px_indigo]"></div>
                                <span className="text-[12px] text-indigo-400 font-black tracking-widest uppercase">循环模态结构完整性实时扫描</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大等效应力</span>
                                    <span className="text-white font-mono font-bold">124.5 MPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">润滑油膜厚度</span>
                                    <span className="text-emerald-400 font-mono font-bold">12.4 µm</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">轴向跳动量</span>
                                    <span className="text-rose-400 font-mono font-bold">0.12 mm</span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{width: '78%'}}></div>
                                </div>
                            </div>
                        </div>

                        {/* 状态标记 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2 items-end">
                            <div className="bg-black/60 px-3 py-1 rounded border border-slate-700 text-[10px] text-slate-500 uppercase tracking-tighter">
                                采样点: <span className="text-white font-bold">LUBE-PUMP-H1</span>
                            </div>
                            <div className="bg-emerald-900/30 px-3 py-1 rounded border border-emerald-900/50 text-[10px] text-emerald-400 font-bold">
                                预测偏差: ±2.4%
                            </div>
                        </div>

                        <ThreeScene wearSeverity={0.4} isAnalyzing={activeAnalysis} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex items-center gap-6 flex-1 px-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase">当前服役周期</span>
                                    <span className="text-sm font-black text-indigo-400">14,250 HRS</span>
                                </div>
                                <div className="h-8 w-[1px] bg-slate-800"></div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between text-[9px] text-slate-500 uppercase tracking-widest">物理劣变路径实时拟合 (Path Fitting)</div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 animate-pulse" style={{width: '82%'}}></div>
                                    </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <button className="px-10 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center gap-2">
                                    <ScanLine size={14} /> 启动微纳扫描
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(99,102,241,0.02)_50%)] bg-[length:100%_15px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 蒙特卡洛失效概率分布图表 */}
                    <SciFiCard title="蒙特卡洛失效概率密度预测 (Failure Probability)" subtitle="STOCHASTIC SIMULATION" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={FAILURE_DISTRIBUTION} margin={{top:10, right:20, bottom:0, left:-20}}>
                                    <defs>
                                        <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="hours" stroke="#64748b" tick={{fontSize: 10}} label={{ value: '服役时间 (h)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="prob" name="失效分布" stroke="#818cf8" fill="url(#probGrad)" strokeWidth={3} />
                                    <ReferenceLine x={1240} stroke="#f59e0b" strokeDasharray="3 3" label={{value:'中值寿命预测', fill:'#f59e0b', fontSize:10, position:'top'}} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：实时物理场与维保排程 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 劣变物理指标 (PoF) */}
                    <SciFiCard title="物理劣化演化特征 (PoF)" subtitle="FAILURE PHYSICS">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={DEGRADATION_PATH}>
                                    <defs>
                                        <linearGradient id="pathGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="day" hide />
                                    <YAxis hide domain={[0, 5]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                    <Area type="monotone" dataKey="vibration" stroke="#f43f5e" fill="url(#pathGrad)" strokeWidth={2} name="振动有效值" />
                                    <Line type="monotone" dataKey="leakage" stroke="#0ea5e9" strokeWidth={1} dot={false} name="内泄流量" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-slate-500 uppercase tracking-tighter flex justify-between">
                            <span>初始稳态</span>
                            <span className="text-rose-400 font-bold">已进入耗损故障期</span>
                        </div>
                    </SciFiCard>

                    {/* 实时参数流 */}
                    <SciFiCard title="系统感知实时参数" subtitle="STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '油泵轴端振动', val: '2.4', unit: 'mm/s', status: 'normal' },
                                { label: '滤器进出口压差', val: '0.12', unit: 'MPa', status: 'warning' },
                                { label: '油液颗粒浓度', val: '1240', unit: 'P/ml', status: 'warning' },
                                { label: '换热器端部温升', val: '12.4', unit: '°C', status: 'normal' },
                                { label: '预测模型拟合度', val: '0.98', unit: 'Idx', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-indigo-500/30 transition-all">
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

                    {/* 建议维护任务 */}
                    <SciFiCard title="预测驱动检修建议" subtitle="ACTIONS">
                        <div className="space-y-2">
                            <div className="p-3 bg-orange-950/20 rounded border border-orange-900/50 flex items-center gap-3">
                                <History size={20} className="text-orange-400" />
                                <div>
                                    <div className="text-[10px] text-orange-100 font-bold uppercase">#1 循环泵密封更换</div>
                                    <div className="text-[9px] text-orange-600 font-bold tracking-tighter italic">建议在 D+5 停机窗口执行</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-orange-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统状态脚部 --- */}
            <div className="h-10 bg-indigo-950/20 border-t border-indigo-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">润滑探测网: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">寿命推演周期: 500ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-indigo-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Lube-RUL Prognostics Core v3.2 - Predictive Shield Active
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