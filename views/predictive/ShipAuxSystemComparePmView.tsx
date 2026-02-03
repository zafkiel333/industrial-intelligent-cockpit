
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/ship-aux-compare/ThreeScene';
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
  Compass, LayoutGrid, Scale, Microscope, Info,
  CheckCircle2, AlertOctagon, Network, Workflow,
  Droplet, FlaskConical, Box
} from 'lucide-react';

// --- 模拟数据 ---

const AUX_SYSTEMS = [
    { id: 'fuel', name: '燃油供给系统', health: 82.4, status: 'stable', load: 75, energy: 45 },
    { id: 'lube', name: '滑油系统', health: 88.5, status: 'optimal', load: 60, energy: 30 },
    { id: 'cooling', name: '海水冷却系统', health: 64.2, status: 'degrading', load: 85, energy: 55 },
    { id: 'air', name: '压缩空气系统', health: 91.0, status: 'optimal', load: 40, energy: 25 },
    { id: 'purifier', name: '分油机组', health: 75.8, status: 'stable', load: 90, energy: 65 },
];

const COMPARISON_RADAR = [
    { subject: '水力效率', fuel: 85, cooling: 65, lube: 90, fullMark: 100 },
    { subject: '结构健康', fuel: 72, cooling: 55, lube: 85, fullMark: 100 },
    { subject: '能效指数', fuel: 92, cooling: 45, lube: 80, fullMark: 100 },
    { subject: '动态稳定性', fuel: 78, cooling: 82, lube: 95, fullMark: 100 },
    { subject: '冗余可靠性', fuel: 98, cooling: 88, lube: 90, fullMark: 100 },
];

const HEALTH_HISTORY = Array.from({length: 12}, (_, i) => ({
    month: `${i+1}月`,
    fuel: 85 - i * 0.5,
    cooling: 75 - i * 1.2,
    lube: 90 + Math.sin(i) * 2,
}));

export const ShipAuxSystemComparePmView: React.FC = () => {
    const [selectedId, setSelectedId] = useState('cooling');
    const [isRadarComparing, setIsRadarComparing] = useState(false);
    const activeSystem = AUX_SYSTEMS.find(s => s.id === selectedId) || AUX_SYSTEMS[0];

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：集群全局态势看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                        <Network className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            船舶辅助系统多设备健康对比分析
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/30 rounded">
                                分析引擎: Fleet-Cross-Analyzer v5.4
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                监控域: E/R Auxiliary Cluster
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">集群平均健康指数</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            78.8<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">关键劣化项</div>
                        <div className="text-3xl font-mono font-bold text-rose-500 animate-pulse">01 <span className="text-sm text-slate-500">SYSTEM</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：系统列表与快速指标 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    <div className="text-xs font-bold text-slate-500 uppercase px-1 flex justify-between">
                        <span>Auxiliary Systems Hierarchy</span>
                        <span>Health</span>
                    </div>

                    <div className="flex flex-col gap-3">
                        {AUX_SYSTEMS.map((sys) => (
                            <div 
                                key={sys.id}
                                onClick={() => setSelectedId(sys.id)}
                                className={`p-4 rounded border cursor-pointer transition-all duration-300 relative group
                                    ${selectedId === sys.id 
                                        ? 'bg-cyan-950/30 border-cyan-500 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]' 
                                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}
                                `}
                            >
                                {selectedId === sys.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>}
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded bg-slate-800 border ${selectedId === sys.id ? 'border-cyan-500 text-cyan-400' : 'border-slate-700 text-slate-500 group-hover:text-slate-300'}`}>
                                            {sys.id === 'fuel' ? <Droplet size={14}/> : sys.id === 'lube' ? <Zap size={14}/> : sys.id === 'cooling' ? <Waves size={14}/> : <Box size={14}/>}
                                        </div>
                                        <h3 className={`text-sm font-bold ${selectedId === sys.id ? 'text-white' : 'text-slate-300'}`}>{sys.name}</h3>
                                    </div>
                                    <span className={`text-xs font-mono font-bold ${sys.health < 70 ? 'text-rose-500' : sys.health < 85 ? 'text-orange-400' : 'text-emerald-400'}`}>
                                        {sys.health}%
                                    </span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${sys.health < 70 ? 'bg-rose-500' : sys.health < 85 ? 'bg-orange-500' : 'bg-cyan-500'}`} 
                                        style={{ width: `${sys.health}%` }}
                                    ></div>
                                </div>
                                <div className="mt-3 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                                    <span className="uppercase tracking-widest">{sys.status} Mode</span>
                                    <span className="flex items-center gap-1">Load: {sys.load}% <ChevronRight size={10}/></span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* AI 劣化推演报告 */}
                    <SciFiCard title="AI 集群关联分析" subtitle="CROSS-ENGINE INFERENCE" className="mt-auto border-indigo-900/40 bg-indigo-950/10">
                        <div className="p-3 space-y-3">
                            <div className="flex gap-3">
                                <Brain className="text-indigo-400 shrink-0" size={18} />
                                <p className="text-[11px] text-indigo-100 leading-relaxed italic">
                                    系统检测到 <span className="text-white font-bold">海水冷却系统</span> 效能下降与 <span className="text-white font-bold">滑油系统</span> 油温异常上升存在 84% 的因果相关。建议在未来 12h 内执行冷却器在线反洗。
                                </p>
                            </div>
                            <div className="h-[1px] bg-indigo-900/30"></div>
                            <div className="flex justify-between items-center text-[10px] text-slate-500">
                                <span>关联强度: High</span>
                                <span className="text-indigo-400 font-bold uppercase tracking-tighter cursor-pointer hover:underline">调取热力图谱</span>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：集群孪生可视化 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 集群视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_120px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping shadow-[0_0:10px_cyan]"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">全船辅机集群健康分布全息映射</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-56">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前焦点</span>
                                    <span className="text-white font-black text-xs">{activeSystem.name}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">特征匹配度</span>
                                    <span className="text-emerald-400 font-mono font-bold">92.4%</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">预测收敛误差</span>
                                    <span className="text-orange-400 font-mono font-bold">± 1.2%</span>
                                </div>
                            </div>
                        </div>

                        <ThreeScene systems={AUX_SYSTEMS} activeId={selectedId} onNodeSelect={setSelectedId} />

                        {/* 视图控制工具栏 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                             <button 
                                onClick={() => setIsRadarComparing(!isRadarComparing)}
                                className={`px-4 py-2 rounded-sm border text-[10px] font-black uppercase tracking-widest transition-all
                                    ${isRadarComparing ? 'bg-cyan-600 border-cyan-400 text-white animate-pulse' : 'bg-slate-900 border-slate-700 text-slate-500'}
                                `}
                             >
                                <Scale size={14} className="inline mr-2" /> {isRadarComparing ? '正在博弈比对' : '开启多维比对'}
                             </button>
                        </div>

                        {/* 底部交互区：系统快速详情 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-5/6 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex items-center gap-8 flex-1 px-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">选中系统详情</span>
                                    <span className="text-sm font-black text-white">{activeSystem.name}</span>
                                </div>
                                <div className="h-8 w-[1px] bg-slate-800"></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">能效占比</span>
                                    <span className="text-lg font-mono font-bold text-cyan-400">{activeSystem.energy}%</span>
                                </div>
                                <div className="h-8 w-[1px] bg-slate-800"></div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold">系统可靠性衰减轨迹 (Simulated Path)</div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500 animate-pulse" style={{width: `${activeSystem.health}%`}}></div>
                                    </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <button className="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded border border-cyan-400 transition-all flex items-center gap-2">
                                    <Microscope size={14} /> 深度下钻
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_15px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 集群健康历史趋势 */}
                    <SciFiCard title="集群历史健康演化趋势对比" subtitle="TEMPORAL COMPARISON" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={HEALTH_HISTORY}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[60, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Line type="monotone" dataKey="fuel" name="燃油系统" stroke="#eab308" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="cooling" name="海水冷却" stroke="#ef4444" strokeWidth={3} dot={{r:4}} />
                                    <Line type="monotone" dataKey="lube" name="滑油系统" stroke="#10b981" strokeWidth={2} dot={false} />
                                    <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '预警线', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：博弈雷达与维护策略 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 多维比对雷达 */}
                    <SciFiCard title="多维亚健康特征博弈" subtitle="RADAR COMPARISON">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={COMPARISON_RADAR}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                    <Radar name="燃油" dataKey="fuel" stroke="#eab308" fill="#eab308" fillOpacity={0.1} />
                                    <Radar name="冷却" dataKey="cooling" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                                    <Radar name="滑油" dataKey="lube" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 实时参数流矩阵 */}
                    <SciFiCard title="集群感知实时参数流" subtitle="DATA STREAM" className="flex-1">
                        <div className="space-y-2 py-2">
                            {[
                                { label: '冷却泵入口压降', val: '0.12', unit: 'MPa', status: 'warning' },
                                { label: '燃油分油机转速', val: '12,450', unit: 'RPM', status: 'normal' },
                                { label: '滑油回油温度', val: '64.8', unit: '°C', status: 'normal' },
                                { label: '空气总管湿含量', val: '0.42', unit: 'g/m³', status: 'normal' },
                                { label: '系统总体能效比', val: '0.92', unit: 'Idx', status: 'normal' },
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

                    {/* 预测维护建议项 */}
                    <SciFiCard title="预测驱动工作包" subtitle="O&M PLAN">
                        <div className="space-y-2">
                            <div className="p-3 bg-rose-950/20 rounded border border-rose-900/50 flex items-center gap-3">
                                <Wrench size={20} className="text-rose-400" />
                                <div>
                                    <div className="text-[10px] text-rose-100 font-bold uppercase">冷却系统在线反洗</div>
                                    <div className="text-[9px] text-rose-600 font-bold italic">建议在 D+1 停机窗口执行</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-rose-600" />
                            </div>
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded flex items-center gap-3 opacity-60">
                                <Settings size={20} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-300 font-bold uppercase">分油机动平衡校准</div>
                                    <div className="text-[9px] text-slate-500">已于 48h 前完成</div>
                                </div>
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
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">集群感知网: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">边缘侧数据吞吐: 124MB/s</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Fleet-Inference Engine v5.4.1 - Holistic Protection Active
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
