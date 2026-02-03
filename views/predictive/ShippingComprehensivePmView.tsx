
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/shipping-comprehensive/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie
} from 'recharts';
import { 
  Activity, Zap, ShieldCheck, Cpu, AlertTriangle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Ship, Anchor, Navigation, Globe, Wind, Radio,
  Leaf, Medal, AlertOctagon, FileText, CheckCircle2,
  Tractor, Compass
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 全船健康趋势 (Fleet Health Trend)
const FLEET_HEALTH_DATA = Array.from({ length: 30 }, (_, i) => ({
    date: `2024-05-${i+1}`,
    health: 92 - Math.random() * 5 - (i > 20 ? (i-20)*0.5 : 0), // 月末略有下降
    efficiency: 95 - Math.random() * 3,
    risk: 10 + (i > 20 ? (i-20)*2 : 0)
}));

// 2. 子系统健康得分 (System Breakdown)
const SYSTEM_SCORES = [
    { name: '主推进系统', score: 85, status: 'warning', weight: 35 },
    { name: '电力系统', score: 92, status: 'normal', weight: 25 },
    { name: '辅助系统', score: 88, status: 'normal', weight: 15 },
    { name: '甲板机械', score: 95, status: 'normal', weight: 15 },
    { name: '通导设备', score: 98, status: 'normal', weight: 10 },
];

// 3. 综合风险雷达 (Holistic Risk)
const RISK_RADAR = [
    { subject: '机械磨损', A: 65, fullMark: 100 },
    { subject: '电气绝缘', A: 32, fullMark: 100 },
    { subject: '结构疲劳', A: 45, fullMark: 100 },
    { subject: '能效排放', A: 78, fullMark: 100 },
    { subject: '合规风险', A: 20, fullMark: 100 },
    { subject: '网络安全', A: 15, fullMark: 100 },
];

// 4. 航次能效 CII 预测
const CII_DATA = [
    { name: 'A', value: 30, color: '#10b981' },
    { name: 'B', value: 45, color: '#3b82f6' },
    { name: 'C', value: 15, color: '#f59e0b' }, // Current
    { name: 'D', value: 8, color: '#f97316' },
    { name: 'E', value: 2, color: '#ef4444' },
];

export const ShippingComprehensivePmView: React.FC = () => {
    const [globalScore] = useState(88.4);
    
    // 传递给 3D 场景的状态
    const systemHealthMap = {
        main: 75,
        aux: 92,
        shaft: 88
    };

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：舰队指挥中心 HUD --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-blue-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-blue-600/20 rounded border border-blue-500/50 shadow-[0_0_25px_rgba(59,130,246,0.3)]">
                        <Ship className="text-blue-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            航运预测性维护综合评估视图
                            <span className="text-xs not-italic font-bold bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded border border-blue-800 uppercase">Fleet Command</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>船名: MV PACIFIC GIANT</span>
                            <span>IMO: 9876543 | 航次: V-2405-CN-US</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">全船综合健康指数 (VHI)</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            {globalScore}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">预计下一临界维护点</div>
                        <div className="text-3xl font-mono font-bold text-amber-500 tracking-tighter">D+14 <span className="text-sm">Days</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主体内容：左中右三栏布局 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：健康指标与趋势 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 子系统健康得分排行 */}
                    <SciFiCard title="子系统健康度排行" subtitle="SYSTEM STATUS" highlight className="bg-[#0c1221]">
                        <div className="space-y-3 py-2">
                            {SYSTEM_SCORES.map((sys, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span className="text-slate-300">{sys.name}</span>
                                        <span className={sys.status === 'warning' ? 'text-orange-400' : 'text-emerald-400'}>{sys.score}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${sys.status === 'warning' ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                                            style={{ width: `${sys.score}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 p-2 bg-orange-950/20 border border-orange-900/30 rounded flex items-center gap-2">
                            <AlertTriangle size={14} className="text-orange-500 animate-pulse" />
                            <span className="text-[10px] text-orange-200">主推进系统存在早期劣化征兆 (振动↑)</span>
                        </div>
                    </SciFiCard>

                    {/* 历史健康趋势 */}
                    <SciFiCard title="30天健康度演化趋势" subtitle="VHI TREND">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={FLEET_HEALTH_DATA} margin={{top:10, right:0, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="date" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[60, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="health" stroke="#0ea5e9" fill="url(#healthGrad)" strokeWidth={2} name="健康度" />
                                    <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={1} dot={false} name="风险值" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 关键警报列表 */}
                    <SciFiCard title="实时高优警报" subtitle="ACTIVE ALERTS" className="flex-1">
                        <div className="space-y-2">
                            <div className="p-2.5 bg-red-950/20 border-l-2 border-red-500 rounded flex items-start gap-2">
                                <Activity size={14} className="text-red-400 mt-0.5" />
                                <div>
                                    <div className="text-xs font-bold text-red-200">主机 #3 缸排温偏差高</div>
                                    <div className="text-[10px] text-slate-500">10:42 AM | 持续 2.5h | 等级: High</div>
                                </div>
                            </div>
                            <div className="p-2.5 bg-orange-950/20 border-l-2 border-orange-500 rounded flex items-start gap-2">
                                <Droplets size={14} className="text-orange-400 mt-0.5" />
                                <div>
                                    <div className="text-xs font-bold text-orange-200">艉轴管滑油含水量上升</div>
                                    <div className="text-[10px] text-slate-500">08:15 AM | 趋势预警 | 等级: Med</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：全船 3D 数字孪生 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 船舶全息视窗 */}
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 悬浮层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-blue-500/30">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_blue]"></div>
                                <span className="text-[12px] text-blue-400 font-black tracking-widest uppercase">全船资产数字孪生 (Digital Twin)</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-64">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">航速 (SOG)</span>
                                    <span className="text-white font-mono font-bold">14.2 kn</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">主机转速</span>
                                    <span className="text-emerald-400 font-mono font-bold">85.4 RPM</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">总油耗</span>
                                    <span className="text-orange-400 font-mono font-bold">42.5 t/d</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">下一港口</span>
                                    <span className="text-white font-bold">SINGAPORE (ETA: 48h)</span>
                                </div>
                            </div>
                        </div>

                        {/* 3D 场景组件 */}
                        <ThreeScene systemHealth={systemHealthMap} />

                        {/* 底部功能导航 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl justify-center">
                             <button className="flex flex-col items-center gap-1 group">
                                <div className="p-3 rounded-full bg-slate-800 group-hover:bg-blue-600 transition-colors border border-slate-600">
                                    <Activity size={18} className="text-slate-300 group-hover:text-white"/>
                                </div>
                                <span className="text-[9px] text-slate-400 uppercase font-bold">主机</span>
                             </button>
                             <div className="w-px h-8 bg-slate-700 my-auto"></div>
                             <button className="flex flex-col items-center gap-1 group">
                                <div className="p-3 rounded-full bg-slate-800 group-hover:bg-cyan-600 transition-colors border border-slate-600">
                                    <Compass size={18} className="text-slate-300 group-hover:text-white"/>
                                </div>
                                <span className="text-[9px] text-slate-400 uppercase font-bold">推进</span>
                             </button>
                             <div className="w-px h-8 bg-slate-700 my-auto"></div>
                             <button className="flex flex-col items-center gap-1 group">
                                <div className="p-3 rounded-full bg-slate-800 group-hover:bg-purple-600 transition-colors border border-slate-600">
                                    <Zap size={18} className="text-slate-300 group-hover:text-white"/>
                                </div>
                                <span className="text-[9px] text-slate-400 uppercase font-bold">电力</span>
                             </button>
                             <div className="w-px h-8 bg-slate-700 my-auto"></div>
                             <button className="flex flex-col items-center gap-1 group">
                                <div className="p-3 rounded-full bg-slate-800 group-hover:bg-green-600 transition-colors border border-slate-600">
                                    <Leaf size={18} className="text-slate-300 group-hover:text-white"/>
                                </div>
                                <span className="text-[9px] text-slate-400 uppercase font-bold">能效</span>
                             </button>
                        </div>
                    </div>

                    {/* 综合风险雷达 */}
                    <SciFiCard title="全船风险多维评估 (Holistic Risk)" subtitle="RISK RADAR" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full flex">
                            <div className="flex-1 h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RISK_RADAR}>
                                        <PolarGrid stroke="#1e293b" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Radar name="Risk" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                                        <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-40 flex flex-col justify-center pr-4 space-y-4">
                                <div className="text-center">
                                    <div className="text-[10px] text-slate-500 uppercase">最高风险域</div>
                                    <div className="text-lg font-bold text-orange-400">能效排放</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] text-slate-500 uppercase">最安全域</div>
                                    <div className="text-lg font-bold text-green-400">网络安全</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：环保、合规与决策 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* CII/EEXI 能效评级 */}
                    <SciFiCard title="碳强度指标 (CII) 预测" subtitle="EMISSIONS" className="bg-[#0b1221]">
                        <div className="flex items-center justify-center py-4">
                            <div className="relative w-32 h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={CII_DATA}
                                            innerRadius={40}
                                            outerRadius={55}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {CII_DATA.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-amber-500">C</span>
                                    <span className="text-[8px] text-slate-500 uppercase">Rating</span>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 pb-2">
                             <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                 <span>本航次累积排放</span>
                                 <span className="text-white font-mono">1,245 tCO2</span>
                             </div>
                             <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-amber-500" style={{width: '65%'}}></div>
                             </div>
                             <div className="mt-2 text-[9px] text-center text-slate-500">
                                 预测年底评级: <span className="text-amber-500 font-bold">C (边缘)</span>
                             </div>
                        </div>
                    </SciFiCard>

                    {/* 智能决策支持 */}
                    <SciFiCard title="智能运维决策建议" subtitle="DECISION SUPPORT" className="flex-1">
                        <div className="space-y-3">
                            <div className="p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                                    <Tractor size={14} /> 航速优化建议
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    建议将巡航速度从 14.2 kn 降低至 <span className="text-white font-bold">13.5 kn</span>。可降低主机热负荷 8%，并提升 CII 评级概率。
                                </p>
                            </div>
                            
                            <div className="p-3 bg-emerald-900/20 border-l-4 border-emerald-500 rounded flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                                    <Wrench size={14} /> 备件调度提醒
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    检测到主海水泵备件库存低于安全水位。建议在 <span className="text-white font-bold">新加坡港</span> 安排补给。
                                </p>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 报告生成 */}
                    <div className="mt-auto">
                        <button className="w-full py-3 bg-slate-800 hover:bg-blue-700 text-white text-xs font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2 group">
                            <FileText size={14} className="text-blue-400 group-hover:text-white" /> 生成综合评估报告 (PDF)
                        </button>
                    </div>
                </div>

            </div>

            {/* --- 底部状态栏 --- */}
            <div className="h-10 bg-blue-950/20 border-t border-blue-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">星链通讯: 正常 (Latency 450ms)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">岸端数据同步: 进行中</span>
                    </div>
                </div>
                <div className="text-[10px] text-blue-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Medal size={12} /> ClassNK Smart Ship (Machinery) Certified
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
            `}</style>
        </div>
    );
};
