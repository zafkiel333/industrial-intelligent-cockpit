
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/ship-engine-risk/ThreeScene';
import { RiskViewMode } from '../../components/predictive/ship-engine-risk/three-types';
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
  Compass, HardDrive, MonitorPlay, Eye, Microscope,
  AlertOctagon, Network, Workflow
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 系统风险热力地图 (System Risk Heatmap)
const RISK_HEATMAP = [
    { name: '燃油系统', risk: 82, trend: 'up' },
    { name: '润滑系统', risk: 45, trend: 'stable' },
    { name: '扫气系统', risk: 12, trend: 'down' },
    { name: '冷却系统', risk: 38, trend: 'stable' },
    { name: '启动空气', risk: 15, trend: 'stable' },
    { name: '调速系统', risk: 64, trend: 'up' },
];

// 2. 失效模式预测概率 (Top Failure Modes)
const FAILURE_MODES = [
    { mode: '喷油器雾化不良', prob: 75 },
    { mode: '增压器喘振', prob: 42 },
    { mode: '活塞环密封失效', prob: 32 },
    { mode: '主轴承油膜变薄', prob: 28 },
    { mode: '缸套异常磨损', prob: 15 },
];

// 3. 未来 72h 可靠性趋势预测 (Reliability Forecast)
const RELIABILITY_TREND = Array.from({ length: 24 }, (_, i) => ({
    time: `${i * 3}h`,
    val: 98 - Math.pow(i/4, 1.5) * 2 + Math.random() * 1.5,
    threshold: 80
}));

export const ShipEngineRiskOverviewPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<RiskViewMode>('probability');
    const [globalRisk] = useState(62.8);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部数字看板：风险态势感知 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-purple-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-purple-600/20 rounded-sm border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                        <ShieldAlert className="text-purple-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            船舶主机故障风险预测全维概览
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-purple-950/50 border border-purple-800/30 rounded">
                                AI 预警引擎: Global-Shield v5.0
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                船舶: MV OCEAN-GUARDIAN | 状态: 航行中
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">全局系统风险值</div>
                        <div className="text-4xl font-mono font-bold text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                            {globalRisk} <span className="text-sm">/ 100</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">平均无故障运行 (MTBF)</div>
                        <div className="text-3xl font-mono font-bold text-cyan-400">1,248 <span className="text-sm">HRS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 px-2">
                
                {/* 左侧：风险分布与系统树 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 系统风险热力地图 */}
                    <SciFiCard title="子系统风险热力分析" subtitle="SYSTEM RISK" highlight className="bg-[#0c1221]">
                        <div className="space-y-3 py-2">
                            {RISK_HEATMAP.map((item, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[11px]">
                                        <span className="text-slate-400 font-bold">{item.name}</span>
                                        <span className={`font-mono ${item.risk > 70 ? 'text-rose-500' : item.risk > 40 ? 'text-orange-400' : 'text-emerald-400'}`}>
                                            {item.risk}%
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${item.risk > 70 ? 'bg-rose-600' : item.risk > 40 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                                            style={{ width: `${item.risk}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 失效模式雷达图 */}
                    <SciFiCard title="主要失效模式推演" subtitle="FAILURE PROBABILITY">
                        <div className="h-48 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={FAILURE_MODES.map(m => ({ subject: m.mode, A: m.prob, fullMark: 100 }))}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                    <Radar name="Probability" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-center text-rose-500 text-[10px] font-bold animate-pulse">
                            高风险项：#3 缸喷油器响应迟滞特征增强
                        </div>
                    </SciFiCard>

                    {/* AI 逻辑链条 */}
                    <SciFiCard title="AI 推理决策链" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2" size={14} />
                                <span className="font-bold">逻辑推演：</span> [燃油系统震荡] → [单缸热负荷不均] → [活塞环摩擦加剧] → <span className="text-white font-bold underline">潜在拉缸风险</span>。建议在 48h 内切换备用泵并降低 5% 负荷。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-purple-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Workflow size={16} className="text-purple-400" />
                                    <span className="text-[11px] text-slate-300">查看故障传播动态路径图</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-purple-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Settings size={16} className="text-purple-400" />
                                    <span className="text-[11px] text-slate-300">执行全系统鲁棒性压力测试</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：全息数字孪生全景 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 全景风险视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-purple-500/30">
                                <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping shadow-[0_0_10px_purple]"></div>
                                <span className="text-[12px] text-purple-400 font-black tracking-widest uppercase">全系统健康风险全息映射扫描</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前系统风险</span>
                                    <span className="text-rose-500 font-mono font-bold">MODERATE</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">数据采集频率</span>
                                    <span className="text-white font-mono font-bold">50.0 kHz</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">神经元激活率</span>
                                    <span className="text-emerald-400 font-mono font-bold">92.4%</span>
                                </div>
                            </div>
                        </div>

                        {/* 风险图例 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['probability', 'impact', 'connectivity'] as RiskViewMode[]).map((m) => (
                                <button 
                                    key={m}
                                    onClick={() => setViewMode(m)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === m ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {m === 'probability' ? '失效概率' : m === 'impact' ? '影响范围' : '拓扑关联'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene globalRiskLevel={globalRisk / 100} viewMode={viewMode} />

                        {/* 底部交互功能栏 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-purple-600 text-purple-400 hover:text-white text-xs font-black rounded border border-purple-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 深度特征检索
                            </button>
                            <button className="px-10 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all flex items-center gap-3">
                                <MonitorPlay size={16} /> 启动蒙特卡洛仿真
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(139,92,246,0.02)_50%)] bg-[length:100%_12px] animate-[scan_15s_linear_infinite]"></div>
                    </div>

                    {/* 可靠性趋势预测曲线 */}
                    <SciFiCard title="未来 72h 系统运行可靠性预测 (Reliability Forecast)" subtitle="TEMPORAL ANALYSIS" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={RELIABILITY_TREND}>
                                    <defs>
                                        <linearGradient id="relGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[60, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="val" name="可靠性指数" stroke="#8b5cf6" fill="url(#relGrad)" strokeWidth={2} />
                                    <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '安全门限', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：关键指标与维保排程 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 运行指标流 */}
                    <SciFiCard title="实时物理场感知阵列" subtitle="DATA STREAM">
                        <div className="space-y-3 py-2">
                            {[
                                { label: '主轴平均振幅', val: '0.04', unit: 'mm', status: 'normal' },
                                { label: '排气平均背压', val: '0.12', unit: 'MPa', status: 'warning' },
                                { label: '燃油总管压降', val: '1.2', unit: 'bar/min', status: 'normal' },
                                { label: '滑油金属颗粒度', val: '24', unit: 'ppm', status: 'warning' },
                                { label: '增压器喘振裕度', val: '18%', unit: 'Δ', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-purple-500/30 transition-all">
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

                    {/* 维护计划建议表 */}
                    <SciFiCard title="预测性维保建议包" subtitle="MAINTENANCE" className="flex-1">
                        <div className="space-y-3">
                            <div className="p-2 bg-rose-950/20 rounded border border-rose-900/30 flex items-center gap-3">
                                <History size={20} className="text-rose-500" />
                                <div>
                                    <div className="text-[10px] text-slate-100 font-bold">#3 缸喷油器更换</div>
                                    <div className="text-[9px] text-slate-500">建议时间: 72h 内 (抵港后)</div>
                                </div>
                            </div>
                            <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center gap-3 opacity-60">
                                <Wrench size={20} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">#2 缸排气阀研磨</div>
                                    <div className="text-[9px] text-slate-500">建议时间: 500h 后 (定期)</div>
                                </div>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-800">
                                <button className="w-full py-2 bg-slate-800 hover:bg-purple-700 text-white text-[11px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                                    <HardDrive size={14} /> 调取电子检修工单
                                </button>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 网络状态 */}
                    <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                            <span>神经元互联状态</span>
                            <span className="text-green-400">Stable</span>
                        </div>
                        <div className="flex gap-1 h-3">
                            {Array.from({length: 15}).map((_, i) => (
                                <div key={i} className="flex-1 bg-indigo-500/30 rounded-sm"></div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* --- 状态页脚 --- */}
            <div className="h-10 bg-purple-950/20 border-t border-purple-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">中央处理机: 在线正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测模型同步延迟: 28ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-purple-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Expert Neural Core v5.0 - Active Risk Shield
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
