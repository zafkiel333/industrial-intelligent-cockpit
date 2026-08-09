
import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/ship-engine-failure/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-30]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-30';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  Activity, Zap, ShieldAlert, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Hourglass, Calendar, Flame, Microscope, Clock,
  ArrowUpRight, AlertOctagon, HeartPulse
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 生存函数与失效风险 (Survival & Hazard Function)
const SURVIVAL_DATA = Array.from({ length: 31 }, (_, i) => {
    const hours = i * 24;
    // 模拟 Weibull 生存曲线 R(t) = exp(-(t/eta)^beta)
    const reliability = Math.exp(-Math.pow(hours / 600, 3.2)) * 100;
    const hazard = Math.pow(hours / 600, 2.2) * 50;
    return { hours, reliability, hazard };
});

// 2. 失效触发因子重要性 (Failure Feature Importance)
const FEATURE_IMPORTANCE = [
    { subject: '排气温升速度', A: 85, fullMark: 100 },
    { subject: '滑油金属含量', A: 72, fullMark: 100 },
    { subject: '爆压偏差率', A: 65, fullMark: 100 },
    { subject: '冷却水压波动', A: 48, fullMark: 100 },
    { subject: '轴承振动包络', A: 92, fullMark: 100 },
];

// 3. 未来 30 天维护博弈模拟 (Maintenance vs Cost)
const MAINTENANCE_TRADE_OFF = Array.from({ length: 7 }, (_, i) => ({
    day: `D+${i * 5}`,
    risk: 10 + Math.pow(i, 2.5),
    cost: 100 - i * 10, // 越晚修成本（风险成本）越高，此处简化表示
}));

export const ShipEngineFailureWindowPmView: React.FC = () => {
    const [futureDay, setFutureDay] = useState(0); // 0 - 30 days
    const [healthScore] = useState(84.2);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：失效时空状态看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-rose-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-rose-600/20 rounded border border-rose-500/50 shadow-[0_0_20px_rgba(225,29,72,0.2)]">
                        <Hourglass className="text-rose-400 animate-pulse" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            船舶主机失效时间窗口 (TTF) 推演中心
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-rose-950/50 border border-rose-800/30 rounded">
                                计算模式: 动态非稳态 Markov 链
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                船舶: MV EXPLORER-X | 状态: 预警观测
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">中值失效剩余时间</div>
                        <div className="text-4xl font-mono font-bold text-rose-500 drop-shadow-[0_0_10px_rgba(225,29,72,0.5)]">
                            542 <span className="text-sm">HRS</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">失效置信度 (95% CI)</div>
                        <div className="text-3xl font-mono font-bold text-cyan-400">428 ~ 680 HRS</div>
                    </div>
                </div>
            </div>

            {/* --- 主推演交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：生存函数与概率图谱 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* Weibull 生存曲线 */}
                    <SciFiCard title="系统生存函数 (Survival)" subtitle="RELIABILITY" highlight className="bg-[#0c1221]">
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={SURVIVAL_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="relGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="hours" stroke="#64748b" tick={{fontSize: 9}} label={{ value: 'h', position: 'insideBottomRight', fontSize: 9 }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="reliability" name="可靠度 (%)" stroke="#10b981" fill="url(#relGrad)" strokeWidth={2} />
                                    <Line type="monotone" dataKey="hazard" name="失效风险" stroke="#ef4444" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                                    <ReferenceLine x={542} stroke="#f59e0b" strokeDasharray="10 5" label={{ value: 'T-Mean', fill: '#f59e0b', fontSize: 10 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 失效因子敏感度 */}
                    <SciFiCard title="失效触发因子敏感度" subtitle="FEATURE ATTRIBUTION">
                        <div className="h-52 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={FEATURE_IMPORTANCE}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Impact" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-1 flex items-center justify-center gap-2 p-1 bg-indigo-900/10 rounded border border-indigo-900/30">
                            <Brain size={14} className="text-indigo-400" />
                            <span className="text-[10px] text-indigo-200">当前主导因子：轴承振动包络 (92%)</span>
                        </div>
                    </SciFiCard>

                    {/* AI 模拟推演结论 */}
                    <SciFiCard title="AI 时间窗口分析" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-rose-900/20 border-l-4 border-rose-500 rounded text-[11px] text-rose-100 leading-relaxed">
                                <span className="font-bold uppercase flex items-center gap-2 mb-1 text-rose-400">
                                    <AlertOctagon size={14} /> 紧急预测报告
                                </span>
                                根据最近 48h 的特征演化，#3 缸套的磨损已进入“三阶段剧变期”。若维持当前 12.4 节航速，失效窗口将在 <span className="text-white font-bold underline">6月22日</span> 左右开启。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-rose-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <History size={16} className="text-rose-400" />
                                    <span className="text-[11px] text-slate-300">比对历史同期失效轨迹</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-rose-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Target size={16} className="text-rose-400" />
                                    <span className="text-[11px] text-slate-300">执行蒙特卡洛生存仿真</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D数字孪生与时间轴联动 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 老化过程视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-rose-500/30">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping shadow-[0_0_10px_rose]"></div>
                                <span className="text-[12px] text-rose-400 font-black tracking-widest uppercase">未来失效态势全息模拟</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">预测状态</span>
                                    <span className={`font-mono font-bold ${futureDay > 20 ? 'text-red-500' : 'text-emerald-400'}`}>
                                        {futureDay > 20 ? 'CRITICAL FAILURE' : 'STABLE OPERATING'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">结构振幅 (Sim)</span>
                                    <span className="text-white font-mono font-bold">{(0.12 + futureDay * 0.05).toFixed(2)} mm</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">失效概率 (t)</span>
                                    <span className="text-rose-500 font-mono font-bold">{(futureDay * 3.2).toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>

                        <ThreeScene futureTimeOffset={futureDay * 3.3} riskIntensity={futureDay / 30} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部交互：时间推演滑块 */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 w-3/4 bg-black/70 backdrop-blur-xl border border-slate-700 p-6 rounded-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-cyan-400" size={18} />
                                    <span className="text-sm font-bold text-white uppercase tracking-widest">时间推演轴 (Temporal Scrubber)</span>
                                </div>
                                <div className="px-4 py-1 bg-cyan-950 border border-cyan-800 rounded text-cyan-400 font-mono font-bold text-xl">
                                    T + {futureDay} <span className="text-xs">DAYS</span>
                                </div>
                            </div>
                            <div className="relative h-2 w-full bg-slate-800 rounded-full">
                                {/* 风险区域标注 */}
                                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-rose-500/20 rounded-r-full border-l border-rose-500/50"></div>
                                <input 
                                    type="range" min="0" max="30" step="1" 
                                    value={futureDay} 
                                    onChange={(e) => setFutureDay(parseInt(e.target.value))}
                                    className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer accent-cyan-500"
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                                <span>当前时刻 (Now)</span>
                                <span className="text-rose-500">失效高危期 (Failure Window)</span>
                            </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(225,29,72,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 未来风险演化曲线 */}
                    <SciFiCard title="未来 30 天失效风险积累与预警周期" subtitle="RISK ACCUMULATION" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={RISK_TIMELINE}>
                                    <defs>
                                        <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="risk" stroke="#f43f5e" fill="url(#riskGrad)" strokeWidth={3} name="预测失效风险" />
                                    <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '强制停机阈值', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                    <ReferenceLine x={`06-${futureDay + 1}`} stroke="#fff" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：维保博弈与资源调度 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 维护计划博弈图 */}
                    <SciFiCard title="维保时机与成本博弈" subtitle="O&M OPTIMIZATION">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={MAINTENANCE_TRADE_OFF}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 9}} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                    <Bar dataKey="cost" name="停机损失" fill="#334155" barSize={15} />
                                    <Line type="monotone" dataKey="risk" name="失效风险" stroke="#ef4444" strokeWidth={2} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-center text-[10px] text-emerald-400 font-bold">
                             最优建议：建议在 <span className="text-white underline italic">D+12</span> (抵港停靠期) 执行预防性更换。
                        </div>
                    </SciFiCard>

                    {/* 资源保障状态 */}
                    <SciFiCard title="备件与资源就绪度" subtitle="LOGISTICS" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '活塞环组 (6件套)', val: '库存充足', status: 'normal' },
                                { label: '气缸套 (4#专配)', val: '运输中', status: 'warning' },
                                { label: '主轴轴承 (壳牌)', val: '抵港待取', status: 'warning' },
                                { label: '维修工单生成', val: '已挂起', status: 'normal' },
                                { label: '外部专家预约', val: '已确认', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-rose-500/30 transition-all">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-slate-400 font-bold">{item.label}</span>
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'normal' ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`}></span>
                                    </div>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-sm font-bold text-white uppercase italic">{item.val}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 类似失效案例比对 */}
                    <SciFiCard title="相似失效指纹匹配" subtitle="MATCHING">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3 opacity-60">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">#H-CASE-2022-04</div>
                                    <div className="text-[9px] text-slate-500">匹配度: 42% (燃油品质诱发)</div>
                                </div>
                            </div>
                            <div className="p-2 bg-rose-950/20 rounded border border-rose-900/50 flex items-center gap-3">
                                <History size={16} className="text-rose-400" />
                                <div>
                                    <div className="text-[10px] text-rose-100 font-bold">#H-CASE-2023-11</div>
                                    <div className="text-[9px] text-rose-500">匹配度: 91.4% (疲劳断裂模型)</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-rose-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统状态脚部 --- */}
            <div className="h-10 bg-rose-950/20 border-t border-rose-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">中央预测引擎: 在线稳定</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">模型误差 (MAE): 12.4h</span>
                    </div>
                </div>
                <div className="text-[10px] text-rose-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Temporal-Inference Core v5.2.1 - Predictive Shield
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

// --- MOCK DATA FOR CHART ---
const RISK_TIMELINE = Array.from({ length: 30 }, (_, i) => ({
    date: `06-${i + 1}`,
    risk: i < 15 ? 10 + i * 1.5 : 32.5 + Math.pow(i - 14, 2) * 0.4
}));
