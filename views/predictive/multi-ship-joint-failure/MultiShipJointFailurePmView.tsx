
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/multi-ship-joint-failure/ThreeScene';
import { FleetViewMode } from '../../../components/predictive/multi-ship-joint-failure/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, Scatter, ScatterChart,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { 
  Globe, Share2, Network, Zap, Activity, 
  TrendingUp, AlertOctagon, Filter, Database, 
  Users, MapPin, Search, Bot, Server,
  Radio, Layers, CheckCircle2, AlertTriangle, Link
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 故障模式聚类 (Failure Clusters)
const CLUSTER_DATA = [
    { x: 10, y: 30, z: 200, name: '燃油系统异常 (Fuel Sys)', type: 'Common' },
    { x: 50, y: 80, z: 150, name: '增压器喘振 (Turbo Surge)', type: 'Emerging' },
    { x: 80, y: 20, z: 80, name: '轴承高温 (Bearing Temp)', type: 'Routine' },
    { x: 30, y: 50, z: 300, name: '电气绝缘 (Insulation)', type: 'Common' },
];

// 2. 舰队风险排名 (Fleet Risk Ranking)
const RISK_RANKING = [
    { id: 'V-102', name: 'Pacific Giant', risk: 92, status: 'Critical', region: 'Indian Ocean' },
    { id: 'V-305', name: 'Atlantic Star', risk: 78, status: 'Warning', region: 'North Sea' },
    { id: 'V-208', name: 'Asian Pearl', risk: 65, status: 'Warning', region: 'Pacific' },
    { id: 'V-401', name: 'Nordic Spirit', risk: 42, status: 'Normal', region: 'Baltic' },
    { id: 'V-110', name: 'Southern Cross', risk: 35, status: 'Normal', region: 'Aus-NZ' },
];

// 3. 关联因子分析 (Correlation Factors)
const CORRELATION_FACTORS = [
    { name: '燃油批次', value: 85, color: '#f43f5e' }, // High correlation
    { name: '海况等级', value: 65, color: '#f59e0b' },
    { name: '设备批次', value: 45, color: '#0ea5e9' },
    { name: '维护间隔', value: 30, color: '#6366f1' },
    { name: '船员班组', value: 15, color: '#10b981' },
];

// 4. 联邦学习模型更新趋势
const LEARNING_TREND = Array.from({ length: 14 }, (_, i) => ({
    day: `D-${13-i}`,
    accuracy: 85 + i * 1.0 + Math.random(),
    nodes: 10 + i * 2
}));

export const MultiShipJointFailurePmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<FleetViewMode>('geo-distribution');
    const [networkLoad, setNetworkLoad] = useState(42.5); // MB/s
    const [correlationIndex, setCorrelationIndex] = useState(0.82);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020208]">
            
            {/* --- 顶部：联邦智脑指挥中心 --- */}
            <div className="flex justify-between items-center bg-[#0a0a1a]/90 border-b border-purple-500/30 p-4 relative overflow-hidden">
                {/* 背景网格动画 */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(90deg,transparent_49%,rgba(139,92,246,0.5)_50%,transparent_51%)] bg-[length:40px_100%]"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-purple-600/20 rounded-full border border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.4)]">
                        <Globe className="text-purple-400 animate-pulse" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            多船舶设备联合故障预测中心
                            <span className="text-xs not-italic font-bold bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded border border-purple-800 uppercase">FEDERATED FLEET</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Users size={12}/> 在网船舶: 48 艘</span>
                            <span className="flex items-center gap-1"><Bot size={12}/> 活跃智能体: 152 个</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">故障特征关联度 (Correlation)</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            {(correlationIndex * 100).toFixed(1)}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">群体预警等级</div>
                        <div className="text-3xl font-mono font-bold text-rose-500 animate-pulse">HIGH</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：风险排名与共性分析 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 舰队风险列表 */}
                    <SciFiCard title="舰队风险实时排名" subtitle="FLEET RANKING" highlight className="bg-[#0b0b16]">
                        <div className="space-y-3 py-2">
                            {RISK_RANKING.map((ship, i) => (
                                <div key={i} className="flex items-center gap-3 p-2.5 rounded border border-slate-800 bg-slate-900/40 hover:border-purple-500/50 transition-all cursor-pointer group">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${ship.status === 'Critical' ? 'bg-rose-900/50 text-rose-400' : ship.status === 'Warning' ? 'bg-orange-900/50 text-orange-400' : 'bg-green-900/50 text-green-400'}`}>
                                        {i+1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-white group-hover:text-cyan-300">{ship.name}</span>
                                            <span className="text-[10px] text-slate-500">{ship.id}</span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${ship.status === 'Critical' ? 'bg-rose-500' : ship.status === 'Warning' ? 'bg-orange-500' : 'bg-green-500'}`} style={{width: `${ship.risk}%`}}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 共性因子归因 */}
                    <SciFiCard title="联合故障归因分析" subtitle="COMMON CAUSES">
                        <div className="h-44 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={CORRELATION_FACTORS} layout="vertical" margin={{left: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{fontSize: 10}} width={60} />
                                    <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#020617', border: '1px solid #8b5cf6'}} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={15}>
                                        {CORRELATION_FACTORS.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-rose-900/10 border border-rose-900/30 rounded flex items-center gap-2">
                             <AlertTriangle size={14} className="text-rose-500" />
                             <span className="text-[10px] text-rose-200">发现 5 艘船舶受同一批次劣质燃油影响</span>
                        </div>
                    </SciFiCard>

                    {/* 故障聚类 */}
                    <SciFiCard title="故障模式聚类云图" subtitle="CLUSTERING" className="flex-1">
                        <div className="h-full flex flex-col justify-center items-center">
                            <div className="relative w-full h-40 bg-slate-900/30 rounded border border-slate-800 overflow-hidden">
                                {CLUSTER_DATA.map((c, i) => (
                                    <div key={i} 
                                        className="absolute w-2 h-2 rounded-full animate-pulse"
                                        style={{
                                            left: `${c.x}%`, top: `${c.y}%`,
                                            backgroundColor: c.type === 'Common' ? '#ef4444' : '#0ea5e9',
                                            boxShadow: `0 0 ${c.z/10}px ${c.type === 'Common' ? '#ef4444' : '#0ea5e9'}`
                                        }}
                                        title={c.name}
                                    ></div>
                                ))}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-[10px] text-slate-600 font-mono">t-SNE Projection</span>
                                </div>
                            </div>
                            <div className="mt-4 w-full">
                                <button className="w-full py-2 bg-slate-800 hover:bg-purple-600 text-white text-[10px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                                    <Filter size={12} /> 筛选高频共性故障
                                </button>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：全球全息视图 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 地球与网络 */}
                    <div className="flex-1 relative bg-[#010205] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(139,92,246,0.1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-purple-500/30">
                                <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping shadow-[0_0_10px_purple]"></div>
                                <span className="text-[12px] text-purple-400 font-black tracking-widest uppercase">全球舰队故障感知网络实时同步</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-64">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">数据传输速率</span>
                                    <span className="text-white font-mono font-bold">1.2 GB/s</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">故障指纹库</span>
                                    <span className="text-cyan-400 font-mono font-bold">Updated Now</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">群体学习节点</span>
                                    <span className="text-emerald-400 font-mono font-bold">142/150 Active</span>
                                </div>
                            </div>
                        </div>

                        {/* 视图切换 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['geo-distribution', 'correlation-network', 'swarm-intelligence'] as FleetViewMode[]).map((mode) => (
                                <button 
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === mode ? 'bg-purple-600 border-purple-400 text-white shadow-lg' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {mode === 'geo-distribution' ? '地理分布' : mode === 'correlation-network' ? '关联网络' : '群体智能'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene correlationStrength={correlationIndex} activeAlerts={3} viewMode={viewMode} />

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl items-center">
                             <div className="flex-1 flex flex-col gap-1">
                                 <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                     <span>网络负载 (Link Load)</span>
                                     <span className="text-purple-400">{networkLoad.toFixed(1)} MB/s</span>
                                 </div>
                                 <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                     <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 animate-[pulse_2s_infinite]" style={{width: '60%'}}></div>
                                 </div>
                             </div>
                             <div className="h-8 w-[1px] bg-slate-600 mx-2"></div>
                             <div className="flex gap-3">
                                 <button className="flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded text-xs font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                                     <Share2 size={14} /> 分享故障模型
                                 </button>
                                 <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-cyan-700 text-slate-200 hover:text-white rounded text-xs font-bold transition-all border border-slate-600">
                                     <Link size={14} /> 建立远程会诊
                                 </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(139,92,246,0.02)_50%)] bg-[length:100%_20px] animate-[scan_30s_linear_infinite]"></div>
                    </div>

                    {/* 联邦学习进度 */}
                    <SciFiCard title="联邦学习模型精度进化 (Federated Learning)" subtitle="MODEL ACCURACY" className="h-[220px] bg-[#050510]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={LEARNING_TREND}>
                                    <defs>
                                        <linearGradient id="learnGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[80, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #8b5cf6'}} />
                                    <Area type="monotone" dataKey="accuracy" stroke="#8b5cf6" fill="url(#learnGrad)" strokeWidth={3} name="模型精度 (%)" />
                                    <Line type="step" dataKey="nodes" stroke="#22d3ee" strokeWidth={1} dot={false} name="参与节点数" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：群体智能与行动建议 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 维护协同建议 */}
                    <SciFiCard title="集群维护协同建议" subtitle="SYNERGY">
                        <div className="space-y-3 py-2">
                            <div className="p-3 bg-teal-900/20 border border-teal-500/30 rounded flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-teal-300">燃油泵批量更换</span>
                                    <span className="text-[10px] bg-teal-900 px-2 py-0.5 rounded text-white">Cost -15%</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-tight">
                                    建议对 <span className="text-white">V-102, V-305, V-401</span> 三艘船在新加坡港进行集中燃油泵备件更换。
                                </p>
                            </div>
                            
                            <div className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-indigo-300">润滑油统一加注</span>
                                    <span className="text-[10px] bg-indigo-900 px-2 py-0.5 rounded text-white">Efficiency +8%</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-tight">
                                    协调鹿特丹港供应商，为欧洲航线 4 艘船进行统一滑油补给。
                                </p>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 实时告警流 */}
                    <SciFiCard title="全网实时告警流" subtitle="LIVE ALERTS" className="flex-1">
                        <div className="space-y-2">
                            {[
                                { ship: 'V-102', msg: '主机 #3 缸排温过高', time: '10:42', type: 'Critical' },
                                { ship: 'V-208', msg: '发电机电压波动', time: '10:40', type: 'Warning' },
                                { ship: 'V-305', msg: '增压器振动异常', time: '10:35', type: 'Warning' },
                                { ship: 'V-110', msg: '锅炉水位低', time: '10:32', type: 'Normal' },
                            ].map((alert, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 bg-slate-900/40 rounded border border-slate-800">
                                    <div className={`w-1.5 h-8 rounded-full ${alert.type === 'Critical' ? 'bg-rose-500' : alert.type === 'Warning' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <span className="text-xs font-bold text-white">{alert.ship}</span>
                                            <span className="text-[9px] text-slate-500">{alert.time}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-300 truncate">{alert.msg}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-800">
                             <button className="w-full py-2 bg-slate-800 hover:bg-purple-700 text-white text-[10px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                                 <Radio size={14} /> 向全舰队广播预警
                             </button>
                        </div>
                    </SciFiCard>

                </div>

            </div>

            {/* --- 系统页脚 --- */}
            <div className="h-10 bg-purple-950/20 border-t border-purple-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">星链通讯阵列: 稳定</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">群体模型同步: 进行中</span>
                    </div>
                </div>
                <div className="text-[10px] text-purple-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Network size={12} /> Fleet-Swarm-Intelligence v1.0 - Connected
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
