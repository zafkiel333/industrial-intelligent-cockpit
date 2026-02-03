import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/belt-tear/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  Activity, Zap, ShieldAlert, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  ZapOff, Radio, Play, Share2, Network,
  Fingerprint, AlertOctagon, LayoutPanelTop,
  // Added Microscope to fix "Cannot find name 'Microscope'" error on line 167
  ShieldCheck, FileText, Workflow, Scan, Microscope
} from 'lucide-react';

// --- 模拟数据 ---

// 1. X射线/电磁探伤原始信号 (X-Ray / MFL Signal)
const SENSOR_SIGNAL_DATA = Array.from({ length: 100 }, (_, i) => {
    const isDefect = i > 40 && i < 45;
    return {
        dist: i,
        signal: 15 + Math.random() * 5 + (isDefect ? 60 : 0),
        threshold: 45
    };
});

// 2. 钢芯疲劳累积 (Steel Cord Fatigue)
const CORD_FATIGUE_DATA = [
    { name: '左翼区', value: 12, status: 'normal' },
    { name: '左过渡', value: 25, status: 'normal' },
    { name: '中心受力区', value: 78, status: 'warning' },
    { name: '右过渡', value: 42, status: 'normal' },
    { name: '右翼区', value: 15, status: 'normal' },
];

// 3. 纵向撕裂概率演化 (Tear Probability)
const TEAR_RISK_TREND = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    prob: i < 15 ? 5 + Math.random() * 5 : 12 + Math.pow(i - 15, 1.8) * 4,
    limit: 60
}));

// 4. 多维风险因子雷达
const RISK_RADAR_DATA = [
    { subject: '钢芯断裂', A: 85, fullMark: 100 },
    { subject: '接头伸长', A: 42, fullMark: 100 },
    { subject: '覆盖胶破损', A: 70, fullMark: 100 },
    { subject: '运行跑偏', A: 15, fullMark: 100 },
    { subject: '异物撞击', A: 92, fullMark: 100 },
];

export const BeltTearPmView: React.FC = () => {
    const [isXrayMode, setIsXrayMode] = useState(true);
    const [tearProb] = useState(24.5);
    const [activeSection, setActiveSection] = useState('SEC-08');

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：撕裂防护指挥看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-rose-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-rose-600/20 rounded border border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.3)]">
                        <ShieldAlert className="text-rose-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            输送带纵向撕裂与钢芯断裂预测
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-rose-950/50 border border-rose-800/30 rounded">
                                探测引擎: X-Ray-Vision v5.2
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                模式: 在线连续无损探伤 (NDT)
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">瞬时撕裂风险熵</div>
                        <div className="text-4xl font-mono font-bold text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                            {tearProb}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">受损钢芯点位数</div>
                        <div className="text-3xl font-mono font-bold text-amber-400">03 <span className="text-sm text-slate-500">NODES</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：信号指纹与横截面分析 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* NDT 信号瀑布流 */}
                    <SciFiCard title="探伤传感器原始信号 (NDT)" subtitle="RAW SCANNER" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={SENSOR_SIGNAL_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="sigGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="dist" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="signal" stroke="#a855f7" fill="url(#sigGrad)" strokeWidth={2} name="漏磁/射线强度" />
                                    <ReferenceLine y={45} stroke="#ef4444" strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-rose-900/10 rounded border border-rose-900/30 flex justify-between items-center">
                            <span className="text-[10px] text-rose-300 font-bold uppercase">异常定位: 1,425m</span>
                            <span className="text-[10px] text-white font-mono">断芯特征匹配: 94.2%</span>
                        </div>
                    </SciFiCard>

                    {/* 横向受力分布 */}
                    <SciFiCard title="横截面钢芯载荷分布" subtitle="TRANSVERSE LOAD">
                        <div className="h-44 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={CORD_FATIGUE_DATA} margin={{top:10, right:10, left:-20, bottom:0}}>
                                    <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 10}} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                    <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={30}>
                                        {CORD_FATIGUE_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.status === 'warning' ? '#f59e0b' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-[10px] text-center text-slate-500 uppercase tracking-widest mt-1">
                             <Fingerprint className="inline mr-2" size={12} /> 中心受力区呈现非对称疲劳
                        </div>
                    </SciFiCard>

                    {/* AI 诊断推演报告 */}
                    <SciFiCard title="AI 撕裂机理推演" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演报告：</span> 监测到 <span className="text-white font-bold underline">#SEC-08</span> 段接头位移出现 0.12mm/h 的蠕变，且 2X 谐波振动能级激增。判定为“由于给料口卡入异物”导致的表层刺穿。
                                预测在持续运行 2.5h 后，刺穿点将演化为纵向贯穿撕裂。建议立即启动紧急减速。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-rose-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-rose-400" />
                                    <span className="text-[11px] text-slate-300">调取高精 X-Ray 损伤切片图</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：输送带 3D 扫描与实时透视 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 透视视窗 */}
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-rose-500/30">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping shadow-[0_0:10px_rose]"></div>
                                <span className="text-[12px] text-rose-400 font-black tracking-widest uppercase">全皮带钢芯完整度实时 X-Ray 扫描</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">带面张力 (Tension)</span>
                                    <span className="text-white font-mono font-bold">142.5 kN/m</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大损伤深度</span>
                                    <span className="text-rose-400 font-mono font-bold">12.4 mm</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">接头滑动量</span>
                                    <span className="text-emerald-400 font-mono font-bold">0.05 mm</span>
                                </div>
                            </div>
                        </div>

                        {/* 状态控制 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-3 items-end">
                            <div className="bg-black/60 px-4 py-2 rounded border border-rose-500/30 backdrop-blur">
                                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">风险节点锁定</div>
                                <div className="text-2xl font-mono font-bold text-rose-500 uppercase tracking-tighter">NODE-X42</div>
                            </div>
                            <button 
                                onClick={() => setIsXrayMode(!isXrayMode)}
                                className={`px-5 py-2 rounded-sm border text-[10px] font-black uppercase tracking-widest transition-all
                                    ${isXrayMode ? 'bg-purple-600 border-purple-400 text-white animate-pulse' : 'bg-slate-900 border-slate-700 text-slate-500'}
                                `}
                            >
                                {isXrayMode ? 'X-Ray Active' : 'Normal View'}
                            </button>
                        </div>

                        <ThreeScene tearRisk={tearProb / 100} isXRayMode={isXrayMode} />

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex flex-col gap-1 flex-1">
                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    <span>带面损伤演化模拟 (Wear Evolution)</span>
                                    <span className="text-rose-400">Pathogens Detected</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
                                    <div className="h-full bg-rose-500 animate-[pulse_1s_infinite]" style={{width: '78%'}}></div>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <button className="px-10 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all flex items-center gap-2">
                                    <Scan size={14} /> 启动全量自检
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线效果 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(244,63,94,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 撕裂概率演化图表 */}
                    <SciFiCard title="纵向撕裂概率动态预测 (Next 24H)" subtitle="TEAR PROBABILITY TREND" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={TEAR_RISK_TREND} margin={{top:20, right:30, left:0, bottom:0}}>
                                    <defs>
                                        <linearGradient id="tearGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: '发生概率 (%)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Area type="monotone" dataKey="prob" name="撕裂发生概率" stroke="#f43f5e" fill="url(#tearGrad)" strokeWidth={2} />
                                    <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '紧急制动门限', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：风险分析与维保矩阵 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 综合风险雷达 */}
                    <SciFiCard title="系统完整性综合评估" subtitle="RISK RADAR">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RISK_RADAR_DATA}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                    <Radar name="Risk" dataKey="A" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 实时参数感知流 */}
                    <SciFiCard title="感知阵列实时参数流" subtitle="STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '左侧边缘跑偏量', val: '12.4', unit: 'mm', status: 'normal' },
                                { label: '动态皮带弹性模量', val: '0.92', unit: 'Idx', status: 'warning' },
                                { label: '钢芯磁通强度误差', val: '4.5%', unit: 'Δ', status: 'warning' },
                                { label: '落料点冲击声强', val: '142', unit: 'dB', status: 'normal' },
                                { label: '接头区域温升', val: '+2.4', unit: '°C', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-rose-500/30 transition-all">
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

                    {/* 维护建议 */}
                    <SciFiCard title="预测驱动维护包" subtitle="ACTIONS">
                        <div className="space-y-2">
                            <div className="p-3 bg-rose-950/20 rounded border border-rose-900/50 flex items-center gap-3">
                                <ShieldCheck size={20} className="text-rose-400" />
                                <div>
                                    <div className="text-[10px] text-rose-100 font-bold uppercase">执行接头硫化补强</div>
                                    <div className="text-[9px] text-rose-600 font-bold italic text-shadow-glow">预期寿命延长: 450h</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-rose-600" />
                            </div>
                            <div className="p-3 bg-orange-950/20 rounded border border-orange-900/50 flex items-center gap-3">
                                <Wrench size={20} className="text-orange-400" />
                                <div>
                                    <div className="text-[10px] text-orange-100 font-bold uppercase">清理落料口缓冲床</div>
                                    <div className="text-[9px] text-orange-600">减少异常冲击能级: 25%</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-orange-600" />
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
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">探伤阵列: 联机正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测模型同步: 25ms 前</span>
                    </div>
                </div>
                <div className="text-[10px] text-rose-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Neural-Vision Core v5.2 - Structural Integrity Shield Active
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