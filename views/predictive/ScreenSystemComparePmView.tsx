
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/screen-compare/ThreeScene';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, LineChart, Line,
  Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  Activity, ShieldCheck, Zap, AlertTriangle, 
  BarChart3, Layers, Database, Cpu, 
  TrendingUp, Timer, LayoutGrid, Info,
  Search, ArrowRightLeft, Brain, History,
  Gauge, Filter
} from 'lucide-react';

// --- MOCK DATA ---

const DEVICE_STATES = [
    { id: 'SC-01', name: '1# 粗碎后筛分', health: 92.5, status: 'normal' as const, ril: 850 },
    { id: 'SC-02', name: '2# 粗碎后筛分', health: 84.2, status: 'warning' as const, ril: 420 },
    { id: 'SC-03', name: '3# 中碎前分选', health: 71.8, status: 'warning' as const, ril: 150 },
    { id: 'SC-04', name: '4# 尾矿干排筛', health: 45.0, status: 'critical' as const, ril: 24 },
];

const MULTI_RADAR_DATA = [
    { subject: '振动稳定性', 'SC-01': 95, 'SC-04': 40, fullMark: 100 },
    { subject: '结构疲劳度', 'SC-01': 92, 'SC-04': 35, fullMark: 100 },
    { subject: '轴承健康', 'SC-01': 88, 'SC-04': 50, fullMark: 100 },
    { subject: '筛网完整性', 'SC-01': 98, 'SC-04': 60, fullMark: 100 },
    { subject: '能效指数', 'SC-01': 90, 'SC-04': 75, fullMark: 100 },
];

const HEALTH_HISTORY = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    'SC-01': 92 + Math.random() * 2,
    'SC-02': 84 + Math.sin(i/4) * 5,
    'SC-03': 70 + Math.random() * 8,
    'SC-04': 50 - i * 0.5 + Math.random() * 5
}));

export const ScreenSystemComparePmView: React.FC = () => {
    const [selectedDevice, setSelectedDevice] = useState(DEVICE_STATES[3]);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部全局博弈状态栏 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/80 border-b border-cyan-500/20 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-cyan-600/20 rounded-sm border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <LayoutGrid className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            筛分集群健康博弈分析
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/30 rounded">
                                产线: 铁矿三期生产线
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                活跃单元: 04 / 04
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">集群平均健康度</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            73.4%
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">本周待检修项</div>
                        <div className="text-3xl font-mono font-bold text-orange-400">03 <span className="text-sm">TASKS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：集群排名与优先级 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 维护优先级队列 */}
                    <SciFiCard title="检修优先级博弈" subtitle="RANKING" highlight className="bg-[#0c1221]">
                        <div className="space-y-3 py-2">
                            {/* Fix: Create a shallow copy before sorting to avoid mutating read-only constant array */}
                            {[...DEVICE_STATES].sort((a,b) => a.health - b.health).map((device, i) => (
                                <div 
                                    key={device.id} 
                                    onClick={() => setSelectedDevice(device)}
                                    className={`group flex items-center gap-4 p-3 rounded border transition-all cursor-pointer
                                        ${selectedDevice.id === device.id ? 'bg-cyan-900/30 border-cyan-500' : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}
                                    `}
                                >
                                    <div className={`text-xl font-black italic ${i === 0 ? 'text-red-500' : 'text-slate-700'}`}>0{i+1}</div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-white mb-1">{device.name}</div>
                                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${device.status === 'critical' ? 'bg-red-500' : device.status === 'warning' ? 'bg-orange-500' : 'bg-cyan-500'}`} 
                                                style={{ width: `${device.health}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-slate-500">RUL</div>
                                        <div className={`text-xs font-mono font-bold ${device.ril < 100 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>{device.ril}h</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 综合健康雷达对比 */}
                    <SciFiCard title="多维亚健康评估" subtitle="COMPARISON">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={MULTI_RADAR_DATA}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9 }} />
                                    <Radar name="1# 筛 (健康)" dataKey="SC-01" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} />
                                    <Radar name="4# 筛 (重病)" dataKey="SC-04" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* AI 预测群组报告 */}
                    <SciFiCard title="AI 集群健康透视" subtitle="AI INSIGHT" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-xs text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2" size={14} />
                                集群分析发现 3# 与 4# 筛分单元存在 <span className="text-white font-bold underline">12.5Hz 谐振相干性</span>，可能加剧结构焊缝疲劳，建议错峰运行。
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase">
                                    <span>系统同步状态</span>
                                    <span className="text-green-400">同步完成</span>
                                </div>
                                <div className="grid grid-cols-4 gap-1">
                                    {Array.from({length: 12}).map((_, i) => (
                                        <div key={i} className={`h-4 rounded-sm ${Math.random() > 0.8 ? 'bg-orange-500' : 'bg-slate-800'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：集群 3D 透视与演化 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_120px_rgba(0,0,0,1)] group">
                        {/* HUD 交互层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">全产线设备节点实时扫描</span>
                            </div>
                        </div>

                        {/* 设备详情悬浮窗 */}
                        <div className="absolute bottom-8 right-8 z-10 w-64 bg-black/50 backdrop-blur-xl border border-slate-700 p-5 rounded-sm space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-black text-white">{selectedDevice.name}</h3>
                                <span className="text-[10px] font-mono text-slate-500">#{selectedDevice.id}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-2 bg-slate-900/50 rounded">
                                    <div className="text-[9px] text-slate-500 uppercase">振动包络值</div>
                                    <div className="text-lg font-mono text-cyan-300">12.4g</div>
                                </div>
                                <div className="p-2 bg-slate-900/50 rounded">
                                    <div className="text-[9px] text-slate-500 uppercase">故障匹配度</div>
                                    <div className="text-lg font-mono text-orange-400">88%</div>
                                </div>
                            </div>
                            <button className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold rounded-sm transition-all flex items-center justify-center gap-2">
                                <Search size={14} /> 调取单台深度诊断
                            </button>
                        </div>

                        <ThreeScene deviceStates={DEVICE_STATES} />

                        {/* 动态扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_10px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 历史趋势矩阵对比 */}
                    <SciFiCard title="集群健康演化矩阵" subtitle="TEMPORAL DECAY" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={HEALTH_HISTORY}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[40, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Line type="monotone" dataKey="SC-01" stroke="#0ea5e9" strokeWidth={2} dot={false} name="1# 粗筛" />
                                    <Line type="monotone" dataKey="SC-02" stroke="#10b981" strokeWidth={2} dot={false} name="2# 粗筛" />
                                    <Line type="monotone" dataKey="SC-03" stroke="#f59e0b" strokeWidth={2} dot={false} name="3# 分选" />
                                    <Line type="monotone" dataKey="SC-04" stroke="#ef4444" strokeWidth={3} dot={false} name="4# 干排" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：统计博弈与资产详情 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* RUL 预测博弈图 */}
                    <SciFiCard title="设备剩余寿命博弈" subtitle="REMAINING LIFE">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={DEVICE_STATES} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="id" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                                    <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#020617'}} />
                                    <Bar dataKey="ril" radius={[2, 2, 0, 0]}>
                                        {DEVICE_STATES.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.ril < 100 ? '#ef4444' : entry.ril < 500 ? '#f59e0b' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-center text-[10px] text-red-500 font-bold animate-pulse">
                            🚨 检测到 4# 单元将在 24 小时内面临结构失效风险 🚨
                        </div>
                    </SciFiCard>

                    {/* 多维健康指标流 */}
                    <SciFiCard title="集群传感器融合流" subtitle="DATA STREAM" className="flex-1">
                        <div className="space-y-2">
                            {[
                                { label: '集群共振干扰系数', val: '0.14', unit: 'ζ', status: 'normal' },
                                { label: '总功率负载波动', val: '12.5', unit: 'kW', status: 'warning' },
                                { label: '平均轴承温升', val: '54.8', unit: '°C', status: 'normal' },
                                { label: '物料流分布偏差', val: '18%', unit: 'Δ', status: 'warning' },
                                { label: '预测模型置信度', val: '0.96', unit: 'Idx', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-cyan-500/30 transition-all">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-slate-400 font-bold">{item.label}</span>
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'normal' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></span>
                                    </div>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-lg font-mono font-bold text-white">{item.val}</span>
                                        <span className="text-[10px] text-slate-600">{item.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 维护计划历史 */}
                    <SciFiCard title="近期博弈决策记录" subtitle="DECISION LOG">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">2024-05-18: 已调整 3# 变频器</div>
                                    <div className="text-[9px] text-slate-500">操作原因: 抑制集群共振波</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 状态页脚 --- */}
            <div className="h-10 bg-cyan-950/20 border-t border-cyan-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">中央决策引擎: 在线</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">集群数据吞吐: 140MB/s</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Zap size={12} /> Neural Mesh Comparative Core v8.4
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
