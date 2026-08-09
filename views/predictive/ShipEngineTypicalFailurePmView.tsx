
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/typical-failure/ThreeScene';
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
  Wind, Radio, Play, Pause, FastForward, Ship,
  Compass, HardDrive, MonitorPlay, AlertOctagon,
  Network, Workflow, Flame, Microscope, Layout,
  // Fix: Added AlertTriangle and ShieldCheck to the import list to resolve "Cannot find name" errors on line 250 and others
  AlertTriangle, ShieldCheck
} from 'lucide-react';

// --- 模拟数据 ---

const FAILURE_MODES = [
    { id: 'f-01', name: '喷油器雾化不良', prob: 75, risk: 'High', color: '#ef4444' },
    { id: 'f-02', name: '增压器喘振失效', prob: 42, risk: 'Med', color: '#f59e0b' },
    { id: 'f-03', name: '活塞环断裂泄压', prob: 28, risk: 'Low', color: '#10b981' },
    { id: 'f-04', name: '主轴承白合金剥落', prob: 54, risk: 'Med', color: '#f59e0b' },
    { id: 'f-05', name: '扫气箱油泥着火', prob: 15, risk: 'Low', color: '#10b981' },
];

const IMPACT_CHAIN = [
    { name: '燃油品质异常', weight: 85 },
    { name: '喷油定时偏差', weight: 62 },
    { name: '缸内燃烧恶化', weight: 45 },
    { name: '热负荷剧增', weight: 28 },
];

const PREDICTION_CURVE = Array.from({ length: 24 }, (_, i) => ({
    time: `${i * 2}h`,
    prob: i < 12 ? 15 + i : 27 + Math.pow(i-11, 2.2),
    confidence: [10 + i, 20 + i*1.2]
}));

export const ShipEngineTypicalFailurePmView: React.FC = () => {
    const [selectedFailure, setSelectedFailure] = useState(FAILURE_MODES[0]);
    const [scanProgress, setScanProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setScanProgress(p => (p + 1) % 101);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：全息指挥部看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-rose-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%,transparent_50%,#1e293b_50%,#1e293b_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide_20s_linear_infinite]"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-rose-600/20 rounded border border-rose-500/50 shadow-[0_0_25px_rgba(225,29,72,0.3)]">
                        <AlertOctagon className="text-rose-400 animate-pulse" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            船舶主机典型失效模式预测指挥中心
                            <span className="text-xs not-italic font-bold bg-rose-900/50 text-rose-300 px-2 py-0.5 rounded border border-rose-800">WAR-MODE ACTIVE</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>神经元推演引擎: v8.4.2</span>
                            <span>实时威胁库: 124 种已知失效模型</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">主威胁失效发生概率</div>
                        <div className="text-4xl font-mono font-bold text-rose-500 drop-shadow-[0_0_10px_rgba(225,29,72,0.5)]">
                            {selectedFailure.prob}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">平均无故障时长估计</div>
                        <div className="text-3xl font-mono font-bold text-cyan-400 tracking-tighter">1,452 <span className="text-sm">H</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析区 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：典型失效模式清单 (The Arsenal) */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    <div className="text-xs font-bold text-slate-500 uppercase px-1 flex justify-between">
                        <span>Typical Failure Library</span>
                        <span>Probability</span>
                    </div>
                    
                    <div className="space-y-3">
                        {FAILURE_MODES.map((mode) => (
                            <div 
                                key={mode.id}
                                onClick={() => setSelectedFailure(mode)}
                                className={`p-4 rounded border cursor-pointer transition-all duration-300 relative group
                                    ${selectedFailure.id === mode.id 
                                        ? 'bg-rose-950/30 border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.1)]' 
                                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                                `}
                            >
                                {selectedFailure.id === mode.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>}
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${mode.risk === 'High' ? 'bg-rose-500 animate-ping' : mode.risk === 'Med' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                                        <h3 className="text-sm font-bold text-slate-200 group-hover:text-white">{mode.name}</h3>
                                    </div>
                                    <span className={`text-xs font-mono font-bold ${mode.prob > 60 ? 'text-rose-400' : 'text-slate-400'}`}>{mode.prob}%</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${mode.prob > 60 ? 'bg-rose-500' : 'bg-cyan-500'}`} 
                                        style={{ width: `${mode.prob}%` }}
                                    ></div>
                                </div>
                                <div className="mt-2 flex justify-between text-[10px] text-slate-500 font-mono">
                                    <span>ID: {mode.id.toUpperCase()}</span>
                                    <span className="flex items-center gap-1 uppercase tracking-widest">{mode.risk} RISK <ChevronRight size={10}/></span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <SciFiCard title="环境劣化因子博弈" className="mt-auto border-slate-800 bg-slate-900/20">
                         <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">燃油硫分影响</span>
                                <span className="text-rose-400 font-bold">+12%</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">海况载荷增量</span>
                                <span className="text-orange-400 font-bold">+5.4%</span>
                            </div>
                         </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D数字孪生与诊断视角 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 数字孪生视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-2xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-rose-500/30">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                                <span className="text-[12px] text-rose-400 font-black tracking-widest uppercase">全系统健康场实时推演扫描</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-56">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">扫描进度 (SCAN)</span>
                                    <span className="text-white font-mono font-bold">{scanProgress}%</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500" style={{width: `${scanProgress}%`}}></div>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前焦点模式</span>
                                    <span className="text-rose-500 font-bold uppercase">{selectedFailure.name}</span>
                                </div>
                            </div>
                        </div>

                        <ThreeScene activeFailureId={selectedFailure.id} />

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-rose-600 text-rose-400 hover:text-white text-xs font-black rounded border border-rose-900/50 transition-all flex items-center gap-3 shadow-xl">
                                <Search size={16} /> 深度特征检索
                            </button>
                            <button className="px-10 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(225,29,72,0.4)] transition-all flex items-center gap-3">
                                <History size={16} /> 故障演化模拟
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线效果 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(244,63,94,0.02)_50%)] bg-[length:100%_15px] animate-[scan_15s_linear_infinite]"></div>
                    </div>

                    {/* 失效时间预测过程图 */}
                    <SciFiCard title="失效概率时序演化预测 (Next 48H)" subtitle="FAILURE PROBABILITY PATH" className="h-[220px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={PREDICTION_CURVE}>
                                    <defs>
                                        <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="prob" stroke="#f43f5e" fill="url(#failGrad)" strokeWidth={3} name="失效发生率" />
                                    <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '紧急制动门限', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：深度诊断与根因分析 (The Chain) */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 根因权重分析图表 */}
                    <SciFiCard title="失效模式诱因权重" subtitle="ROOT CAUSE" className="bg-[#0b1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={IMPACT_CHAIN.map(c => ({ subject: c.name, A: c.weight, fullMark: 100 }))}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                    <Radar name="Weight" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 故障传播链条 */}
                    <SciFiCard title="潜在故障传播链" subtitle="PROPAGATION" className="flex-1">
                        <div className="space-y-4 py-2">
                             {[
                                { step: '1', label: '喷油正时漂移', risk: 'Detected', color: 'text-cyan-400' },
                                { step: '2', label: '缸盖热负荷波动', risk: 'Probable', color: 'text-orange-400' },
                                { step: '3', label: '排气阀密封受损', risk: 'Predicted', color: 'text-rose-500' },
                             ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className={`w-8 h-8 rounded border flex items-center justify-center font-bold text-sm ${item.color} border-current opacity-60 group-hover:opacity-100 transition-opacity`}>
                                        {item.step}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-white">{item.label}</div>
                                        <div className={`text-[9px] uppercase font-black ${item.color}`}>{item.risk}</div>
                                    </div>
                                    <ChevronRight className="text-slate-700" size={14} />
                                </div>
                             ))}
                             <div className="mt-4 p-3 bg-rose-950/20 rounded border border-rose-900/30 flex items-center gap-3">
                                <AlertTriangle size={20} className="text-rose-500" />
                                <div className="text-[10px] text-rose-300 leading-tight">
                                    <span className="font-bold block text-white mb-1">关键阻断建议</span>
                                    执行单缸封油程序，防止热应力向相邻缸室扩散，风险减损预期：<span className="text-white font-bold">15.2%</span>。
                                </div>
                             </div>
                        </div>
                    </SciFiCard>

                    {/* 实时感知阵列流 */}
                    <SciFiCard title="特征指纹流阵列" subtitle="STREAM">
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: '爆压偏差', val: '+4.2%' },
                                { label: '扫气背压', val: '0.35MPa' },
                                { label: '滑油残铁', val: '45ppm' },
                                { label: '振动峰值', val: '1.2mm/s' },
                            ].map((item, i) => (
                                <div key={i} className="p-2 bg-slate-800/40 rounded border border-slate-700/50">
                                    <div className="text-[8px] text-slate-500 uppercase font-bold">{item.label}</div>
                                    <div className="text-xs font-mono font-bold text-white">{item.val}</div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统状态页脚 --- */}
            <div className="h-10 bg-rose-950/20 border-t border-rose-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测节点: 主机控制室 A1</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">失效窗口期解析中...</span>
                    </div>
                </div>
                <div className="text-[10px] text-rose-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Failure-Chain-Inference Engine v8.4.2 - Structural Integrity Guard Active
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
                    to { background-position: 40px 40px; }
                }
            `}</style>
        </div>
    );
};
