import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/ship-failure-analysis/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  ShieldAlert, Activity, Zap, Cpu, AlertTriangle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  ZapOff, Radio, Play, Share2, Network,
  Fingerprint, AlertOctagon, LayoutPanelTop,
  ShieldCheck, FileText, Workflow, Zap as ZapIcon,
  Atom, Cable, Database, Globe
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 故障指纹波形 (Signal Fingerprint)
const FINGERPRINT_WAVE = Array.from({ length: 60 }, (_, i) => ({
    x: i,
    nominal: Math.sin(i * 0.3) * 10,
    distorted: Math.sin(i * 0.3) * 10 + Math.sin(i * 0.9) * 3 + (Math.random() - 0.5) * 1.5,
    transient: i > 25 && i < 35 ? Math.sin(i * 0.3) * 2 : Math.sin(i * 0.3) * 10
}));

// 2. FMEA 风险矩阵 (Failure Mode and Effects Analysis)
const FMEA_MATRIX = [
    { name: '主发电机励磁丢失', probability: 15, severity: 95, rpn: 142, category: 'Generation' },
    { name: '汇流排单相接地', probability: 45, severity: 60, rpn: 270, category: 'Distribution' },
    { name: '推进器谐波超限', probability: 65, severity: 35, rpn: 227, category: 'Propulsion' },
    { name: 'ACB 断路器拒动', probability: 5, severity: 100, rpn: 50, category: 'Safety' },
    { name: '变频器电容老化', probability: 55, severity: 45, rpn: 247, category: 'Auxiliary' },
    { name: '中性线电流偏移', probability: 30, severity: 70, rpn: 210, category: 'Distribution' },
];

// 3. 风险传导路径权重 (Risk Propagation Chain)
const PROPAGATION_CHAIN = [
    { subject: '电网稳定性', A: 92, fullMark: 100 },
    { subject: '级联跳闸风险', A: 45, fullMark: 100 },
    { subject: '黑漆风险指数', A: 12, fullMark: 100 },
    { subject: '冗余设备就绪', A: 98, fullMark: 100 },
    { subject: '绝缘退化系数', A: 28, fullMark: 100 },
];

export const ShipElectricalFailureModePmView: React.FC = () => {
    const [selectedMode, setSelectedMode] = useState(FMEA_MATRIX[1]);
    const [simActive, setSimActive] = useState(false);
    const [globalRisk] = useState(38.4);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：FMEA 战略决策看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-rose-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-rose-600/20 rounded-sm border border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.3)]">
                        <AlertOctagon className="text-rose-400 animate-pulse" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            船舶电力系统失效模式分析 (FMEA-AI)
                            <span className="text-xs not-italic font-bold bg-rose-900/50 text-rose-300 px-2 py-0.5 rounded border border-rose-800 uppercase">Prognostic Shield Active</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>分析引擎: Neural-Failure-Core v9.1</span>
                            <span>实时样本库: 2,480 种故障模态 (Marine-Class)</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">系统瞬时风险熵 (SRE)</div>
                        <div className="text-4xl font-mono font-bold text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                            {globalRisk}<span className="text-sm">Δ</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">全船失电 (Blackout) 概率</div>
                        <div className="text-3xl font-mono font-bold text-emerald-400">0.024%</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：失效清单与严酷度博弈 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* FMEA 风险点列表 */}
                    <SciFiCard title="当前关键失效模态" subtitle="ACTIVE MODES" highlight className="bg-[#0c1221]">
                        <div className="space-y-2 py-2">
                            {FMEA_MATRIX.map((item, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => setSelectedMode(item)}
                                    className={`p-3 rounded border transition-all cursor-pointer group relative overflow-hidden
                                        ${selectedMode.name === item.name ? 'bg-rose-900/20 border-rose-500' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}
                                    `}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-white group-hover:text-rose-300">{item.name}</span>
                                        <span className={`text-[10px] font-mono ${item.severity > 80 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>S:{item.severity}</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${item.severity > 80 ? 'bg-red-500' : 'bg-cyan-500'}`} 
                                            style={{ width: `${item.probability}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* FMEA 严酷度矩阵图 (Scatter) */}
                    <SciFiCard title="失效后果严酷度矩阵" subtitle="PROBABILITY vs SEVERITY">
                        <div className="h-48 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis type="number" dataKey="probability" name="发生概率" unit="%" stroke="#64748b" tick={{fontSize: 9}} />
                                    <YAxis type="number" dataKey="severity" name="严酷度" unit="S" stroke="#64748b" tick={{fontSize: 9}} />
                                    <ZAxis type="number" dataKey="rpn" range={[50, 400]} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Scatter name="Failure Modes" data={FMEA_MATRIX} fill="#f43f5e" fillOpacity={0.6}>
                                        {FMEA_MATRIX.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.name === selectedMode.name ? '#ef4444' : '#6366f1'} />
                                        ))}
                                    </Scatter>
                                    <ReferenceLine x={50} stroke="#475569" strokeDasharray="3 3" />
                                    <ReferenceLine y={50} stroke="#475569" strokeDasharray="3 3" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-[9px] text-slate-500 text-center uppercase tracking-widest mt-1">右上象限：关键监控区 (Critical Focus)</div>
                    </SciFiCard>

                    {/* AI 贝叶斯诊断推演 */}
                    <SciFiCard title="AI 失效因果推演" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演报告：</span> 监测到 <span className="text-white font-black underline italic">{selectedMode.name}</span> 特征在 6.6kV 母线段显著增强。推演路径：[绝缘层微裂纹] → [局部电晕放电] → [单相接地]。
                                预测在持续高湿度工况下，24h 内演化为 <span className="text-rose-400 font-bold">永久性接地故障</span> 的概率为 82%。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-rose-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Workflow size={16} className="text-rose-400" />
                                    <span className="text-[11px] text-slate-300">查看故障传导逻辑树 (FTA)</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：拓扑全息数字孪生 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 拓扑视窗 */}
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-rose-500/30">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping shadow-[0_0_10px_rose]"></div>
                                <span className="text-[12px] text-rose-400 font-black tracking-widest uppercase">全船电网失效传导场实时仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">失效率预测 (λ)</span>
                                    <span className="text-rose-500 font-mono font-bold">1.24 e-5 /h</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">拓扑互联熵</span>
                                    <span className="text-emerald-400 font-mono font-bold">0.82 bits</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">动态脆弱性</span>
                                    <span className="text-white font-mono font-bold">LOW</span>
                                </div>
                            </div>
                        </div>

                        {/* 状态控制 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                             <button 
                                onClick={() => setSimActive(!simActive)}
                                className={`px-5 py-2.5 rounded-sm border text-[10px] font-black uppercase tracking-widest transition-all
                                    ${simActive ? 'bg-rose-600 border-rose-400 text-white animate-pulse' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-white'}
                                `}
                             >
                                {simActive ? 'STOP SIMULATION' : 'START SIMULATION'}
                             </button>
                        </div>

                        <ThreeScene failureSeverity={selectedMode.severity / 100} activeFailureMode={selectedMode.name} />

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex items-center gap-6 flex-1 px-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase">选定模态</span>
                                    <span className="text-sm font-black text-rose-400">{selectedMode.name}</span>
                                </div>
                                <div className="h-8 w-[1px] bg-slate-800"></div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between text-[9px] text-slate-500 uppercase tracking-widest">失效演化模拟 (Evolution)</div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-600 animate-pulse" style={{width: `${selectedMode.rpn / 4}%`}}></div>
                                    </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <button className="px-10 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all flex items-center gap-2">
                                    <Play size={14} /> 启动概率坍塌预测
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(225,29,72,0.02)_50%)] bg-[length:100%_15px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 信号特征分析图表 */}
                    <SciFiCard title="失效模式信号指纹波形 (Waveform Analysis)" subtitle="SIGNAL FINGERPRINT" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={FINGERPRINT_WAVE} margin={{top:10, right:20, bottom:0, left:-20}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="x" hide />
                                    <YAxis hide domain={[-15, 15]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Line type="monotone" dataKey="nominal" name="基准正弦" stroke="#334155" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                                    <Line type="monotone" dataKey="distorted" name="谐波畸变" stroke="#ef4444" strokeWidth={2} dot={false} />
                                    <Area type="monotone" dataKey="transient" name="暂态跌落" fill="#0ea5e9" fillOpacity={0.1} stroke="#0ea5e9" strokeWidth={1} dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：健康评估与响应 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 系统风险雷达图 */}
                    <SciFiCard title="风险传导综合评估" subtitle="RISK RADAR">
                        <div className="h-56 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={PROPAGATION_CHAIN}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Status" dataKey="A" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 实时感知阵列流 */}
                    <SciFiCard title="失效感知实时参数阵列" subtitle="STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '中性线位移电压', val: '42.5', unit: 'V', status: 'warning' },
                                { label: '母线暂态阻抗', val: '0.12', unit: 'Ω', status: 'normal' },
                                { label: '谐波总含量 (THD-U)', val: '4.2', unit: '%', status: 'warning' },
                                { label: '节点磁饱和指数', val: '1.04', unit: 'Δ', status: 'normal' },
                                { label: '保护继电器时漂', val: '12', unit: 'ms', status: 'normal' },
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

                    {/* 预防性响应建议 */}
                    <SciFiCard title="预测性处置方案" subtitle="RESPONSE">
                        <div className="space-y-2">
                            <div className="p-3 bg-rose-950/20 rounded border border-rose-900/50 flex items-center gap-3">
                                <ShieldCheck size={20} className="text-rose-400" />
                                <div>
                                    <div className="text-[10px] text-rose-100 font-bold uppercase">主汇流排绝缘清洗</div>
                                    <div className="text-[9px] text-rose-600 font-bold tracking-tighter italic">建议在 D+2 天抵港窗口期执行</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-rose-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚 --- */}
            <div className="h-10 bg-rose-950/20 border-t border-rose-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">失效探测传感器: 联机正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">风险模型更新: 14ms 前</span>
                    </div>
                </div>
                <div className="text-[10px] text-rose-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Failure-Analysis Core v9.1 - Prognostic Shield Active
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