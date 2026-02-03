
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/hatch-cover/ThreeScene';
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
  ZapOff, Lock, Unlock, Hammer, Microscope,
  Box, Info, ShieldCheck, Flame, Network, 
  Maximize2, Play, MousePointer2, AlertTriangle
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 液压瞬态响应波形 (Pressure Transient)
const PRESSURE_WAVE = Array.from({ length: 40 }, (_, i) => {
    const isAction = i > 10 && i < 30;
    return {
        time: i,
        p_left: isAction ? 18 + Math.random() * 2 : 2 + Math.random() * 0.5,
        p_right: isAction ? 16 + Math.random() * 3 : 2 + Math.random() * 0.5,
        limit: 22
    };
});

// 2. 左右侧启闭同步偏差 (Sync Deviation mm)
const SYNC_DEVIATION = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    val: 2.5 + Math.pow(i/10, 2) + Math.random() * 1.5,
    threshold: 12
}));

// 3. 密封失效风险因子
const SEAL_FACTORS = [
    { subject: '橡胶硬度', A: 85, fullMark: 100 },
    { subject: '接触压力', A: 42, fullMark: 100 },
    { subject: '表面锈蚀', A: 78, fullMark: 100 },
    { subject: '压缩变形率', A: 32, fullMark: 100 },
    { subject: '导轨直线度', A: 55, fullMark: 100 },
];

export const HatchCoverPmView: React.FC = () => {
    const [openProgress, setOpenProgress] = useState(0);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [healthScore] = useState(76.4);

    // 动作仿真逻辑
    useEffect(() => {
        let interval: any;
        if (isSimulating) {
            interval = setInterval(() => {
                setOpenProgress(prev => {
                    const next = prev + 0.01;
                    if (next >= 0.85) { 
                        setIsSimulating(false);
                        return 0.85; 
                    }
                    return next;
                });
            }, 50);
        }
        return () => clearInterval(interval);
    }, [isSimulating]);

    const handleAction = () => {
        if (openProgress >= 0.85) setOpenProgress(0);
        setIsSimulating(true);
    };

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617] overflow-hidden">
            
            {/* --- 顶部数字看板：系统核心态势 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4 relative z-20">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <Layers className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            舱口盖启闭机构故障风险预测
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/30 rounded">
                                计算模态: Kinematic-Structural Coupling
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                装置: NO.2 HOLD HATCH
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">机构健康指数</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            {healthScore}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">同步偏差警示</div>
                        <div className="text-3xl font-mono font-bold text-rose-500 animate-pulse">MEDIUM</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵：左右侧翼化 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-4 pb-4 relative">
                
                {/* 3D 数字孪生 (中央背景层) */}
                <div className="absolute inset-0 z-0">
                    <ThreeScene openProgress={openProgress} riskLevel={(100-healthScore)/100} isScanning={isScanning} />
                    
                    {/* HUD 转角标注 (不遮挡模型) */}
                    <div className="absolute top-8 left-1/4 translate-x-[-120px] pointer-events-none">
                        <div className="bg-black/60 backdrop-blur-md p-4 rounded-sm border-l-2 border-cyan-500">
                             <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">实时开度反馈</div>
                             <div className="text-3xl font-mono font-bold text-white">{(openProgress * 100).toFixed(1)}%</div>
                        </div>
                    </div>
                    
                    <div className="absolute top-8 right-1/4 translate-x-[120px] pointer-events-none">
                        <div className="bg-black/60 backdrop-blur-md p-4 rounded-sm border-r-2 border-rose-500 text-right">
                             <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">主铰链负载应力</div>
                             <div className="text-3xl font-mono font-bold text-rose-500">142.5 <span className="text-xs">MPa</span></div>
                        </div>
                    </div>
                </div>

                {/* 左侧翼：液压特征与同步性 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar z-10">
                    <SciFiCard title="液压缸瞬态压力指纹" subtitle="HYDRAULIC PROFILE" highlight className="bg-[#0c1221]/90 backdrop-blur-xl">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={PRESSURE_WAVE} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '9px'}} />
                                    <Line type="monotone" dataKey="p_left" stroke="#0ea5e9" strokeWidth={2} dot={false} name="左缸压力(MPa)" />
                                    <Line type="monotone" dataKey="p_right" stroke="#f59e0b" strokeWidth={2} dot={false} name="右缸压力(MPa)" />
                                    <ReferenceLine y={22} stroke="#ef4444" strokeDasharray="5 5" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-orange-950/20 border border-orange-900/30 rounded flex items-center gap-2">
                             <AlertTriangle size={14} className="text-orange-500 animate-pulse" />
                             <span className="text-[10px] text-orange-200">检测到右侧液压回路存在 2.4MPa 的迟滞波峰</span>
                        </div>
                    </SciFiCard>

                    <SciFiCard title="启闭过程同步偏差趋势" subtitle="SYNC DEVIATION" className="bg-[#0c1221]/80 backdrop-blur-md">
                        <div className="h-40 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={SYNC_DEVIATION}>
                                    <defs>
                                        <linearGradient id="devGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 9}} interval={4} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[0, 20]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                    <Area type="monotone" dataKey="val" stroke="#f43f5e" fill="url(#devGrad)" strokeWidth={2} name="差值(mm)" />
                                    <ReferenceLine y={12} stroke="#ef4444" strokeDasharray="10 5" label={{value:'同步报警', fill:'#ef4444', fontSize:8}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    <SciFiCard title="AI 专家劣化推演" subtitle="AI INFERENCE" className="flex-1 bg-[#0c1221]/80 backdrop-blur-md">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed italic">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演简报:</span> 监测到左右侧同步偏差已连续 3 个循环呈对数增长。判定为“右侧主铰链轴承润滑膜破裂”导致的摩擦力矩激增。
                                预测在下个装货港操作时，将有 65% 概率触发限位保护停机。
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧翼：密封评估与感知流 */}
                <div className="col-span-3 col-start-10 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar z-10">
                    <SciFiCard title="密封完整性综合评估" subtitle="SEALING HEALTH" className="bg-[#0c1221]/80 backdrop-blur-md">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SEAL_FACTORS}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Status" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    <SciFiCard title="实时感知参数阵列" subtitle="STREAM" className="flex-1 bg-[#0c1221]/80 backdrop-blur-md">
                        <div className="space-y-3">
                            {[
                                { label: '主铰链振动 RMS', val: '2.4', unit: 'mm/s', status: 'normal' },
                                { label: '液压油金属颗粒度', val: '45', unit: 'ppm', status: 'warning' },
                                { label: '密封槽冷凝水位', val: 'Low', unit: 'Δ', status: 'normal' },
                                { label: '滚轮运行轨迹偏差', val: '0.8', unit: 'mm', status: 'warning' },
                                { label: '控制系统循环时延', val: '12', unit: 'ms', status: 'normal' },
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

                    <SciFiCard title="预测驱动维保序列" subtitle="ACTIONS" className="bg-[#0c1221]/80 backdrop-blur-md">
                        <div className="space-y-2">
                            <div className="p-3 bg-rose-950/20 rounded border border-rose-900/50 flex items-center gap-3">
                                <Wrench size={20} className="text-rose-400" />
                                <div>
                                    <div className="text-[10px] text-rose-100 font-bold uppercase">执行铰链点加脂润滑</div>
                                    <div className="text-[9px] text-rose-600 font-bold italic">建议在 D+2 航行窗口执行</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-rose-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 底部：悬浮战术控制托盘 (防止遮挡模型) */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[60%] bg-black/70 backdrop-blur-2xl border border-slate-700 p-5 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center gap-8">
                     <div className="flex flex-col gap-1 flex-1 px-4 border-r border-slate-800">
                        <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
                            <div className="flex items-center gap-2"><TrendingUp size={14} className="text-cyan-400" /> 机构开合序列模拟 (Sequence Sim)</div>
                            <span>Pos: {Math.floor(openProgress * 100)}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_10px_#06b6d4]" style={{width: `${openProgress * 100}%`}}></div>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-4 pr-4">
                        <button 
                            onClick={handleAction}
                            disabled={isSimulating}
                            className={`px-8 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2
                                ${isSimulating ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/40 active:scale-95'}
                            `}
                        >
                            {isSimulating ? <RefreshCw className="animate-spin" size={14}/> : <Play size={14} />} 模拟启闭序列
                        </button>
                        
                        <button 
                            onMouseDown={() => setIsScanning(true)}
                            onMouseUp={() => setIsScanning(false)}
                            className={`p-3 rounded-full border transition-all
                                ${isScanning ? 'bg-orange-600 border-orange-400 text-white scale-110 shadow-[0_0_20px_orange]' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'}
                            `}
                            title="长按执行结构扫描"
                        >
                            <ScanLine size={20} />
                        </button>
                     </div>
                </div>
                
                {/* 装饰性全局扫描线 */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_25s_linear_infinite]"></div>
            </div>

            {/* --- 系统脚部：联机状态 --- */}
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
                @keyframes pulse-cyan {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};
