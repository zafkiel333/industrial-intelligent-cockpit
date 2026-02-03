
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/deck-machinery/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  ShieldAlert, Activity, Zap, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Binary, Search, ScanLine, Disc, RefreshCw,
  Anchor, Network, Workflow, HardDrive, MonitorPlay,
  Flame, Microscope, Sliders, Box, AlertOctagon, 
  Hourglass, FileText, ChevronLeft,
  // Fix: Added Settings to the import list to resolve "Cannot find name 'Settings'" error on line 241
  Settings
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 各类失效模式的 RPN 风险值
const RISK_RPN_DATA = [
    { name: '齿面点蚀', prob: 72, impact: 85, rpn: 242 },
    { name: '轴承疲劳', prob: 45, impact: 92, rpn: 180 },
    { name: '液压内泄', prob: 64, impact: 60, rpn: 154 },
    { name: '制动迟滞', prob: 12, impact: 95, rpn: 54 },
    { name: '钢丝绳断丝', prob: 38, impact: 78, rpn: 125 },
];

// 2. 特征频带能量分布
const FREQ_ENERGY_DATA = Array.from({ length: 40 }, (_, i) => ({
    freq: i * 50,
    val: i === 12 ? 85 : i === 24 ? 42 : Math.random() * 20 + 5,
    threshold: 60
}));

// 3. 剩余寿命演化轨迹
const RUL_EVOLUTION = Array.from({ length: 24 }, (_, i) => ({
    time: `T+${i*5}d`,
    health: 94 - Math.pow(i/5, 1.6) * 4 + Math.random() * 2,
    limit: 60
}));

export const DeckMachineryFailurePmView: React.FC = () => {
    const [selectedFailure, setSelectedFailure] = useState(RISK_RPN_DATA[0]);
    const [healthScore] = useState(82.4);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617] overflow-hidden">
            
            {/* --- 顶部全息状态条 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4 relative z-20">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <Anchor className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            甲板机械失效模式综合预测终端
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>探测引擎: Fracture-Vision v5.2</span>
                            <span>监控对象: NO.1 锚鱼机 (Windlass)</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">整机健康指数</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            {healthScore}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">主威胁失效模式</div>
                        <div className="text-2xl font-mono font-bold text-rose-500 animate-pulse">{selectedFailure.name}</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵：侧翼化布局 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-4 pb-4 relative">
                
                {/* 3D 数字孪生全景 (背景层) */}
                <div className="absolute inset-0 z-0">
                    <ThreeScene healthScore={healthScore} activeFailureMode={selectedFailure.name} />
                    
                    {/* 背景装饰线 (模拟扫描) */}
                    <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(90deg,#1e293b_1px,transparent_1px),linear-gradient(#1e293b_1px,transparent_1px)] bg-[size:50px_50px]"></div>
                </div>

                {/* 左侧翼：失效模态博弈 (悬浮感) */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar z-10">
                    <SciFiCard title="失效模式 RPN 评估" subtitle="FMEA MATRIX" highlight className="bg-[#0c1221]/80 backdrop-blur-md">
                        <div className="space-y-3 py-2">
                            {RISK_RPN_DATA.map((item, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => setSelectedFailure(item)}
                                    className={`group flex items-center gap-4 p-3 rounded border transition-all cursor-pointer
                                        ${selectedFailure.name === item.name ? 'bg-cyan-900/30 border-cyan-500' : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}
                                    `}
                                >
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-white mb-1">{item.name}</div>
                                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${item.prob > 60 ? 'bg-rose-500' : 'bg-cyan-500'}`} 
                                                style={{ width: `${item.prob}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-slate-500 uppercase">RPN</div>
                                        <div className={`text-sm font-mono font-bold ${item.rpn > 200 ? 'text-rose-400' : 'text-slate-300'}`}>{item.rpn}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    <SciFiCard title="声发射 (AE) 特征指纹" subtitle="FFT ENERGY" className="bg-[#0c1221]/80 backdrop-blur-md">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={FREQ_ENERGY_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="freq" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="val" stroke="#ef4444" fill="url(#failGrad)" strokeWidth={2} name="能量谱" />
                                    <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-slate-900/50 rounded border border-slate-700 flex justify-between items-center text-[10px]">
                            <span className="text-slate-400 font-bold uppercase flex items-center gap-1"><Binary size={12}/> 特征匹配度</span>
                            <span className="text-cyan-400 font-mono">Matched 92.4%</span>
                        </div>
                    </SciFiCard>

                    <SciFiCard title="AI 故障机理推演" subtitle="AI INFERENCE" className="flex-1 bg-[#0c1221]/80 backdrop-blur-md">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed italic">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold uppercase">诊断简报:</span> 监测到 <span className="text-white font-bold underline italic">{selectedFailure.name}</span> 特征在 400Hz-800Hz 频带能量激增。判定为“低润滑状态下的重载疲劳损伤”。预计在下个班次前，磨损深度将超过 0.15mm。
                            </div>
                            <div className="space-y-2">
                                <button className="w-full py-2 bg-slate-800 hover:bg-cyan-600 text-white text-[10px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                                    <Microscope size={14} /> 调取理化分析记录
                                </button>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧翼：寿命预测与感知流 (悬浮感) */}
                <div className="col-span-3 col-start-10 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar z-10">
                    <SciFiCard title="剩余有效寿命预测" subtitle="RUL PATH" className="bg-[#0c1221]/80 backdrop-blur-md">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={RUL_EVOLUTION}>
                                    <defs>
                                        <linearGradient id="rulGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 9}} interval={4} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[40, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="health" stroke="#0ea5e9" fill="url(#rulGrad)" strokeWidth={3} name="健康轨迹" />
                                    <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="10 5" label={{value:'临界值', fill:'#ef4444', fontSize:8, position:'top'}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    <SciFiCard title="感知阵列实时流" subtitle="STREAM" className="flex-1 bg-[#0c1221]/80 backdrop-blur-md">
                        <div className="space-y-3">
                            {[
                                { label: '主减速箱振速', val: '2.4', unit: 'mm/s', status: 'normal' },
                                { label: '液压站供油温', val: '54.2', unit: '°C', status: 'warning' },
                                { label: '离合器结合力', val: '145', unit: 'kN', status: 'normal' },
                                { label: '排绳丝杠偏移', val: '0.12', unit: 'mm', status: 'normal' },
                                { label: '各级齿轮合能', val: '0.82', unit: 'Idx', status: 'warning' },
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

                    <SciFiCard title="预测驱动建议" subtitle="ACTIONS" className="bg-[#0c1221]/80 backdrop-blur-md">
                        <div className="space-y-2">
                            <div className="p-3 bg-rose-950/20 rounded border border-rose-900/50 flex items-center gap-3">
                                <Wrench size={20} className="text-rose-400" />
                                <div>
                                    <div className="text-[10px] text-rose-100 font-bold uppercase">执行齿面在线补强润滑</div>
                                    <div className="text-[9px] text-rose-600 font-bold italic">建议在 12h 内完成</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-rose-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统状态脚部 --- */}
            <div className="h-10 bg-cyan-950/20 border-t border-cyan-500/20 px-6 flex items-center justify-between z-20">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">终端感知阵列: 联机正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测模型同步: 25ms 前</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Kinetic-Dynamics Engine v3.4 - Deck Machinery Shield Active
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
