
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/hoist-brake/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie
} from 'recharts';
import { 
  Activity, Zap, ShieldAlert, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Wind, Radio, Play, Pause, FastForward, Link,
  Eye, Microscope, Sliders, Shield,
  // Fix: Added Hammer to the import list to resolve "Cannot find name 'Hammer'" error on line 120
  Hammer,
  Flame
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 制动油压瞬态波形 (Dynamic Oil Pressure Transient)
const PRESSURE_WAVE = Array.from({ length: 40 }, (_, i) => {
    // 模拟一段制动压力上升曲线
    let val = 0;
    if (i < 10) val = 0;
    else if (i < 20) val = (i - 10) * 1.2 + Math.random() * 0.5;
    else val = 12 + Math.random() * 0.2;
    return { time: i * 0.1, pressure: val };
});

// 2. 闸瓦间隙多点分布 (Gap Distribution Radar)
const GAP_DISTRIBUTION = [
    { subject: '左上闸瓦', A: 0.85, fullMark: 2.0 },
    { subject: '右上闸瓦', A: 1.15, fullMark: 2.0 }, // 异常偏大
    { subject: '左下闸瓦', A: 0.88, fullMark: 2.0 },
    { subject: '右下闸瓦', A: 0.92, fullMark: 2.0 },
];

// 3. 可靠性衰减预测 (Reliability Degradation)
const RELIABILITY_TREND = Array.from({ length: 24 }, (_, i) => ({
    cycle: i * 100,
    reliability: Math.exp(-Math.pow(i/15, 3)) * 100,
    risk: Math.pow(i/20, 2) * 50
}));

export const HoistBrakePmView: React.FC = () => {
    const [isBraking, setIsBraking] = useState(false);
    const [reliabilityScore] = useState(88.4);
    const [deadTime] = useState(0.245); // s

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部 HUD：安全态势总览 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-rose-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-rose-600/20 rounded border border-rose-500/50 shadow-[0_0_20px_rgba(225,29,72,0.2)]">
                        <Shield className="text-rose-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            提升机制动系统可靠性预测与瞬态分析
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-rose-950/50 border border-rose-800/30 rounded">
                                核心安全指标: LEVEL-A+
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                响应延时: 12ms | 冗余度: 2N
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">系统可靠度指数</div>
                        <div className="text-4xl font-mono font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                            {reliabilityScore} <span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">当前空动时间</div>
                        <div className={`text-3xl font-mono font-bold ${deadTime > 0.3 ? 'text-rose-500' : 'text-cyan-400'}`}>
                            {deadTime} <span className="text-sm">s</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：瞬态物理场监控 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 制动压力波形 */}
                    <SciFiCard title="制动油压瞬态响应" subtitle="PRESSURE TRANSIENT" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={PRESSURE_WAVE} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="pressGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 9}} label={{ value: 's', position: 'insideBottomRight', offset: -5 }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="pressure" stroke="#ef4444" fill="url(#pressGrad)" strokeWidth={2} name="压力(MPa)" />
                                    <ReferenceLine y={12.0} stroke="#f59e0b" strokeDasharray="5 5" label={{value: '额定制动力', fill: '#f59e0b', fontSize: 10}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center text-[10px]">
                             <div className="text-[10px] text-slate-500 uppercase flex items-center gap-2">
                                <Zap size={14} className="text-yellow-500" /> 油泵运行电流
                             </div>
                             <span className="text-sm font-mono font-bold text-white">42.8 A</span>
                        </div>
                    </SciFiCard>

                    {/* 闸瓦间隙分布 */}
                    <SciFiCard title="闸瓦间隙平衡分析" subtitle="GAP SYMMETRY">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={GAP_DISTRIBUTION}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Gap" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-center text-rose-500 text-[10px] font-bold animate-pulse">
                            警告: 右上闸瓦间隙 (1.15mm) 超过平均阈值 25%
                        </div>
                    </SciFiCard>

                    {/* AI 诊断深度分析 */}
                    <SciFiCard title="神经网络故障推演" subtitle="AI DIAGNOSIS" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded">
                                <p className="text-[11px] text-indigo-100 leading-relaxed">
                                    <Brain className="inline mr-2 text-indigo-400" size={14} />
                                    系统判定：当前空动时间偏移主要是由于“液压站回油背压异常”引起。预测在 <span className="text-white font-bold">120个循环</span> 后可能突破 0.3s 安全红线。
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-rose-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <RefreshCw size={16} className="text-rose-400" />
                                    <span className="text-[11px] text-slate-300">执行液压站泄压自检</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-rose-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Wrench size={16} className="text-rose-400" />
                                    <span className="text-[11px] text-slate-300">调取闸瓦更换作业包</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D 孪生与制动演示 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 制动单元视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-rose-500/30">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                                <span className="text-[12px] text-rose-400 font-black tracking-widest uppercase">制动盘热应力场实时仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大温升</span>
                                    <span className="text-orange-400 font-mono font-bold">+42.5 °C</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">瞬时正压力</span>
                                    <span className="text-white font-mono font-bold">145 kN</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">偏摆跳动</span>
                                    <span className="text-emerald-400 font-mono font-bold">0.02 mm</span>
                                </div>
                            </div>
                        </div>

                        {/* 状态控制按钮 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-3">
                            <button 
                                onMouseDown={() => setIsBraking(true)}
                                onMouseUp={() => setIsBraking(false)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all shadow-xl
                                    ${isBraking ? 'bg-rose-600 border-rose-400 scale-95 shadow-rose-900/50' : 'bg-slate-900 border-slate-700 hover:border-rose-500 text-slate-400'}
                                `}
                            >
                                <Hammer size={20} className={isBraking ? 'text-white' : 'text-rose-500'} />
                                <span className="text-xs font-black uppercase tracking-widest">模拟制动模拟</span>
                            </button>
                            <div className="bg-black/40 px-3 py-1 rounded border border-slate-800 text-[10px] text-slate-500 text-center">
                                长按按键执行应急制动
                            </div>
                        </div>

                        <ThreeScene isBraking={isBraking} discTemp={isBraking ? 0.8 : 0.2} />

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-rose-600 text-rose-400 hover:text-white text-xs font-black rounded border border-rose-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 细节特征探测
                            </button>
                            <button className="px-10 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(225,29,72,0.4)] transition-all flex items-center gap-3">
                                <Settings size={16} /> 仿真模型校准
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线效果 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(225,29,72,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 可靠性趋势图表 */}
                    <SciFiCard title="可靠度衰减与风险增长预测 (Weibull Distribution)" subtitle="RELIABILITY PROGNOSTICS" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={RELIABILITY_TREND}>
                                    <defs>
                                        <linearGradient id="relGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="cycle" stroke="#64748b" tick={{fontSize: 10}} label={{ value: '制动循环次数', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Area type="monotone" dataKey="reliability" name="系统可靠度 (%)" stroke="#10b981" fill="url(#relGrad)" strokeWidth={3} />
                                    <Line type="monotone" dataKey="risk" name="失效风险率" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                                    <ReferenceLine x={1500} stroke="#f59e0b" strokeDasharray="10 5" label={{ value: '预防检修窗口', fill: '#f59e0b', fontSize: 10, position: 'top' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：部件细节与寿命管理 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 弹簧组疲劳监测 */}
                    <SciFiCard title="制动弹簧疲劳演化" subtitle="SPRING FATIGUE">
                        <div className="space-y-4 py-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">主弹簧预紧力</span>
                                <span className="text-lg font-mono font-bold text-white">450 kN</span>
                            </div>
                            <div className="h-32 w-full bg-[#020617] border border-slate-800 rounded relative overflow-hidden flex items-center justify-center">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,#8b5cf6_0%,transparent_70%)] animate-pulse"></div>
                                <div className="flex flex-col items-center">
                                    <Activity className="text-purple-500 mb-1" size={24} />
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">剩余疲劳次数</span>
                                    <span className="text-xl font-mono font-bold text-white">245,820</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-2 bg-slate-900 border border-slate-800 rounded text-center">
                                    <div className="text-[9px] text-slate-500 uppercase">自由高度</div>
                                    <div className="text-sm font-bold text-white">425 mm</div>
                                </div>
                                <div className="p-2 bg-slate-900 border border-slate-800 rounded text-center">
                                    <div className="text-[9px] text-slate-500 uppercase">刚度偏移</div>
                                    <div className="text-sm font-bold text-green-400">-0.4%</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 关键子系统风险矩阵 */}
                    <SciFiCard title="子系统故障传播矩阵" subtitle="PROPAGATION" className="flex-1">
                        <div className="space-y-2">
                            {[
                                { label: '密封件泄漏风险', val: '12%', status: 'normal' },
                                { label: '油液污染NAS', val: '7级', status: 'warning' },
                                { label: '闸瓦磨损不均', val: 'High', status: 'critical' },
                                { label: '电磁阀响应偏移', val: '15ms', status: 'normal' },
                                { label: '管路共振强度', val: '0.04g', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-rose-500/30 transition-all">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-slate-400 font-bold">{item.label}</span>
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'normal' ? 'bg-emerald-500' : item.status === 'warning' ? 'bg-yellow-500 animate-pulse' : 'bg-rose-500 animate-ping'}`}></span>
                                    </div>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-lg font-mono font-bold text-white">{item.val}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 维护记录日志 */}
                    <SciFiCard title="资产维护履历" subtitle="TIMELINE">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">2024-05-15: 更换 A1 闸瓦组</div>
                                    <div className="text-[9px] text-slate-500">检测结果: 偏磨 2.5mm</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统状态页脚状态栏 --- */}
            <div className="h-10 bg-rose-950/20 border-t border-rose-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">制动监测网: 联机正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">瞬态捕捉精度: 10µs</span>
                    </div>
                </div>
                <div className="text-[10px] text-rose-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Brake-Guardian v3.5 - Integrity Engine Active
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
