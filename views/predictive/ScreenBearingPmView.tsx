
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/screen-bearing/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-5]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-5';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend
} from 'recharts';
import { 
  Activity, Zap, ShieldAlert, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Clock, Microscope, Info
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 载荷谱 - 雨流计数结果 (Load Spectrum - Rainflow Counting)
const RAINFLOW_DATA = [
    { range: '0-20kN', cycles: 45000, damage: 0.05 },
    { range: '20-40kN', cycles: 28000, damage: 0.12 },
    { range: '40-60kN', cycles: 15000, damage: 0.25 },
    { range: '60-80kN', cycles: 8000, damage: 0.35 },
    { range: '80-100kN', cycles: 2500, damage: 0.23 },
];

// 2. 疲劳累积趋势 (Fatigue Accumulation Trend)
const ACCUMULATION_DATA = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    damage: (Math.pow(i/24, 1.5) * 0.65) + Math.random() * 0.02,
    limit: 0.8
}));

// 3. Weibull 寿命概率密度 (Weibull Reliability)
const WEIBULL_DATA = Array.from({ length: 30 }, (_, i) => {
    const t = i * 20; 
    const beta = 3.5; // 形状参数
    const eta = 400;  // 尺度参数
    const r = Math.exp(-Math.pow(t/eta, beta));
    const f = (beta/eta) * Math.pow(t/eta, beta-1) * r;
    return { time: t, reliability: r * 100, hazard: f * 1000 };
});

export const ScreenBearingPmView: React.FC = () => {
    const [cumulativeDamage, setCumulativeDamage] = useState(68.4);
    const [rulHours, setRulHours] = useState(542);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 科技感头部导航 --- */}
            <div className="flex justify-between items-center bg-slate-900/60 border-b border-cyan-500/30 p-4">
                <div className="flex items-center gap-5">
                    <div className="p-3 bg-emerald-600/20 rounded border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <Microscope className="text-emerald-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            振动筛轴承疲劳寿命预测中心
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest px-2 py-0.5 bg-emerald-950/50 border border-emerald-800 rounded">
                                计算标准: ISO-281:2007 (修正寿命)
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                模型: Neural-Fatigue-V5
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-10 items-center pr-4">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">累积损伤度 (Miner's Sum)</div>
                        <div className="text-4xl font-mono font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                            0.684
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">剩余有效运行时间</div>
                        <div className="text-3xl font-mono font-bold text-yellow-500">{rulHours} <span className="text-sm">HRS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 核心分析矩阵布局 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：特征提取与工况面板 */}
                <div className="col-span-3 flex flex-col gap-5 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 应力循环计数 (雨流法) */}
                    <SciFiCard title="载荷谱雨流计数 (Rainflow)" subtitle="LOAD DYNAMICS" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={RAINFLOW_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="range" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Bar dataKey="cycles" fill="#0ea5e9" radius={[2, 2, 0, 0]} barSize={20}>
                                        {RAINFLOW_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index > 3 ? '#ef4444' : '#0ea5e9'} fillOpacity={0.8} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-3 p-2 bg-slate-950/50 rounded border border-slate-800 text-[10px] text-slate-400">
                           <div className="flex justify-between mb-1">
                               <span>最大循环应力</span>
                               <span className="text-white font-mono">92.5 kN</span>
                           </div>
                           <div className="flex justify-between">
                               <span>应力集中系数 (Kt)</span>
                               <span className="text-white font-mono">2.14</span>
                           </div>
                        </div>
                    </SciFiCard>

                    {/* 损伤累积模型 */}
                    <SciFiCard title="疲劳损伤演变曲线" subtitle="CUMULATIVE DAMAGE">
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={ACCUMULATION_DATA}>
                                    <defs>
                                        <linearGradient id="dmgGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" hide />
                                    <YAxis domain={[0, 1]} hide />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="damage" stroke="#10b981" fill="url(#dmgGrad)" strokeWidth={2} />
                                    <ReferenceLine y={0.8} stroke="#ef4444" strokeDasharray="3 3" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-bold uppercase text-slate-500">
                            <span>初始无损</span>
                            <span className="text-emerald-500">当前损伤: 68.4%</span>
                            <span className="text-red-500">失效门限</span>
                        </div>
                    </SciFiCard>

                    {/* 诊断专家意见 */}
                    <SciFiCard title="AI 疲劳失效诊断" subtitle="PROGNOSTICS" className="flex-1">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-yellow-900/10 border-l-4 border-yellow-500 rounded">
                                <AlertCircle className="text-yellow-500 shrink-0" size={18} />
                                <p className="text-xs text-yellow-100/80 leading-relaxed">
                                    当前载荷谱显示 80kN 以上高应力循环次数增加显著。**Palmgren-Miner** 累积速率已进入非线性增长阶段。
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-2">
                                    <Target size={12}/> 预测性干预措施
                                </div>
                                <div className="group flex items-center gap-3 p-2 bg-slate-800/50 hover:bg-emerald-900/30 rounded border border-slate-700 hover:border-emerald-500 transition-all cursor-pointer">
                                    <Wrench size={16} className="text-emerald-400" />
                                    <span className="text-[11px] text-slate-300">润滑油脂在线清洗与置换</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2 bg-slate-800/50 hover:bg-emerald-900/30 rounded border border-slate-700 hover:border-emerald-500 transition-all cursor-pointer">
                                    <Settings size={16} className="text-emerald-400" />
                                    <span className="text-[11px] text-slate-300">调整变频器输出减缓冲击载荷</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D孪生与概率分析 */}
                <div className="col-span-6 flex flex-col gap-5 min-h-0">
                    
                    {/* 3D 轴承疲劳透视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,1)]">
                        {/* HUD Overlay */}
                        <div className="absolute top-6 left-6 z-10">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur px-3 py-1.5 rounded border border-emerald-500/30">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[11px] text-emerald-400 font-black tracking-widest">REAL-TIME STRESS MAPPING</span>
                            </div>
                            <div className="mt-4 bg-black/40 p-4 rounded border border-slate-800 backdrop-blur-sm space-y-3 w-48">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前频率</span>
                                    <span className="text-white font-mono font-bold">16.4 Hz</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最高温升</span>
                                    <span className="text-orange-400 font-mono font-bold">+15.2°C</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">等效应力</span>
                                    <span className="text-emerald-400 font-mono font-bold">42.8 MPa</span>
                                </div>
                            </div>
                        </div>

                        {/* Visual Quality Markers */}
                        <div className="absolute bottom-6 right-6 z-10 flex flex-col items-end gap-2">
                            <div className="bg-black/60 px-3 py-1 rounded border border-slate-800 text-[10px] text-slate-500">
                                模型精度: <span className="text-emerald-400 font-bold">98.2%</span>
                            </div>
                        </div>

                        <ThreeScene damageSeverity={cumulativeDamage / 100} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* Interactive UI Tools */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-8 py-2 bg-slate-900/80 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-black rounded border border-emerald-900/50 transition-all flex items-center gap-2">
                                <Binary size={14} /> 导出载荷原始信号
                            </button>
                            <button className="px-8 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2">
                                <Clock size={14} /> 预测未来演化步长
                            </button>
                        </div>
                    </div>

                    {/* 可靠性概率预测 */}
                    <SciFiCard title="Weibull 寿命概率分布" subtitle="RELIABILITY FORECAST" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={WEIBULL_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} label={{ value: '时间 (h)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                                    <YAxis yAxisId="left" stroke="#10b981" tick={{fontSize: 10}} label={{ value: '可靠度 (%)', angle: -90, position: 'insideLeft', fill: '#10b981', fontSize: 10 }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tick={{fontSize: 10}} label={{ value: '失效风险率', angle: 90, position: 'insideRight', fill: '#f43f5e', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize: '10px'}} />
                                    <Area yAxisId="left" type="monotone" dataKey="reliability" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="可靠度曲线" />
                                    <Line yAxisId="right" type="monotone" dataKey="hazard" stroke="#f43f5e" strokeWidth={2} dot={false} name="失效风险率" />
                                    <ReferenceLine x={400} stroke="#fff" strokeDasharray="10 5" label={{value: '设计中值寿命', fill: '#fff', fontSize: 10, position: 'top'}} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：关键参数阵列 */}
                <div className="col-span-3 flex flex-col gap-5 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* S-N 疲劳曲线对比 */}
                    <SciFiCard title="S-N 疲劳设计校核" subtitle="STRESS-CYCLE">
                        <div className="h-40 w-full relative bg-[#0a0f1d] border border-slate-800 rounded p-2">
                             <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[
                                    { logN: 4, s: 200, actual: 210 },
                                    { logN: 5, s: 150, actual: 165 },
                                    { logN: 6, s: 100, actual: 120 },
                                    { logN: 7, s: 80, actual: 105 },
                                ]}>
                                    <XAxis dataKey="logN" hide />
                                    <YAxis hide />
                                    <Line type="monotone" dataKey="s" stroke="#64748b" strokeDasharray="3 3" dot={false} />
                                    <Line type="monotone" dataKey="actual" stroke="#f59e0b" strokeWidth={2} dot={{r:4}} />
                                </LineChart>
                             </ResponsiveContainer>
                             <div className="absolute top-2 left-2 text-[8px] text-slate-500 uppercase">log Stress vs log Life</div>
                             <div className="mt-2 text-right text-[10px] text-orange-400">当前运行应力超过设计基准 12.5%</div>
                        </div>
                    </SciFiCard>

                    {/* 传感器实时状态阵列 */}
                    <SciFiCard title="结构多维健康指标" subtitle="METRICS" className="flex-1">
                        <div className="space-y-2">
                            {[
                                { label: '轴承峰值加速度', val: '12.4', unit: 'g', status: 'normal' },
                                { label: '包络谱尖峰能量', val: '0.85', unit: 'J', status: 'warning' },
                                { label: '内圈特征频率幅值', val: '1.24', unit: 'mm/s', status: 'normal' },
                                { label: '外圈特征频率幅值', val: '2.56', unit: 'mm/s', status: 'warning' },
                                { label: '保持架稳定性系数', val: '0.98', unit: 'Index', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-emerald-500/30 transition-all">
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

                    {/* 历史同型故障库 */}
                    <SciFiCard title="相似失效案例比对" subtitle="HISTORICAL CASES">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3 opacity-60">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">Case #H-102 (2022)</div>
                                    <div className="text-[9px] text-slate-500">特征匹配度: 42%</div>
                                </div>
                            </div>
                            <div className="p-2 bg-emerald-950/20 rounded border border-emerald-900/50 flex items-center gap-3">
                                <History size={16} className="text-emerald-400" />
                                <div>
                                    <div className="text-[10px] text-emerald-100 font-bold">Case #H-245 (2023)</div>
                                    <div className="text-[9px] text-emerald-500">特征匹配度: 89% (重载疲劳)</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-emerald-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 状态页脚 --- */}
            <div className="h-10 bg-emerald-950/20 border-t border-emerald-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">边缘计算中心: 联机正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">神经网络推演周期: 50ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-emerald-600 font-mono tracking-tighter uppercase italic">
                    Integrated Predictive Shield: Fatigue Guardian Active v2.5.0
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
