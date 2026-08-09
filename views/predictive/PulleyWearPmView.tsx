
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/pulley/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-11]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-11';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, Legend, ComposedChart
} from 'recharts';
import { 
  Activity, Zap, ShieldAlert, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Tractor, Scale
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 包胶厚度趋势 (Lagging Thickness mm)
const THICKNESS_TREND = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    drive: 15 - (i / 12) * 0.1 - (Math.random() * 0.05),
    bend: 12 - (i / 15) * 0.05 - (Math.random() * 0.02),
    limit: 5
}));

// 2. 摩擦系数变化 (Friction Coefficient μ)
const FRICTION_DATA = Array.from({ length: 10 }, (_, i) => ({
    tons: i * 50000,
    mu: 0.45 - (i * 0.025) + (Math.random() * 0.02),
    safe: 0.25
}));

// 3. 打滑风险分布 (Slip Probability)
const SLIP_PROB = [
    { name: '冷态启动', val: 15 },
    { name: '额定重载', val: 42 },
    { name: '雨天/潮湿', val: 78 },
    { name: '超载工况', val: 92 },
];

export const PulleyWearPmView: React.FC = () => {
    const [activePulley] = useState('DRIVE-HEAD-01');
    const [wearLevel] = useState(64.5); // %

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部数字看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/80 border-b border-orange-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-orange-600/20 rounded-full border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                        <Disc className="text-orange-400 animate-spin-slow" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            驱动与改向滚筒包胶完整性监测
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-orange-950/50 border border-orange-800/30 rounded">
                                系统负载: 85.4% | 运行平稳
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                设备组: B-LINE-PULLEY-CLUSTER
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">驱动滚筒包胶余量</div>
                        <div className="text-4xl font-mono font-bold text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                            35.5%
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">打滑预警等级</div>
                        <div className="text-3xl font-mono font-bold text-rose-500 animate-pulse">MEDIUM</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：驱动滚筒深度分析 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    <SciFiCard title="驱动滚筒 (Drive) 状态指纹" subtitle="HEAD PULLEY" highlight className="bg-[#0c1221]">
                        <div className="space-y-4 py-2">
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-slate-400 flex items-center gap-2"><Tractor size={14}/> 牵引力矩</div>
                                <span className="font-mono text-orange-300">42.5 kNm</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-slate-400 flex items-center gap-2"><Activity size={14}/> 动态偏心度</div>
                                <span className="font-mono text-emerald-400">0.02 mm</span>
                            </div>
                            <div className="h-36 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="60%" data={[
                                        { subject: '包胶硬度', A: 85, fullMark: 100 },
                                        { subject: '花纹深度', A: 32, fullMark: 100 },
                                        { subject: '附着力', A: 70, fullMark: 100 },
                                        { subject: '温升稳定', A: 55, fullMark: 100 },
                                        { subject: '对中精度', A: 92, fullMark: 100 },
                                    ]}>
                                        <PolarGrid stroke="#1e293b" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                        <Radar name="Status" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </SciFiCard>

                    <SciFiCard title="摩擦系数演化预测" subtitle="FRICTION μ">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={FRICTION_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="tons" stroke="#64748b" tick={{fontSize: 9}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[0, 0.6]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="mu" fill="#0ea5e9" fillOpacity={0.1} stroke="#0ea5e9" name="实测摩擦系数" />
                                    <ReferenceLine y={0.25} stroke="#ef4444" strokeDasharray="5 5" label={{value: '临界打滑线', fill: '#ef4444', fontSize: 10}} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-slate-500 uppercase tracking-tighter">
                            预测模型: EULER-COULOMB MODEL v2.0
                        </div>
                    </SciFiCard>

                    <SciFiCard title="AI 维护决策推演" subtitle="AI INSIGHT" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded">
                                <p className="text-[11px] text-indigo-100 leading-relaxed">
                                    <Brain className="inline mr-2" size={14} />
                                    基于当前 <span className="text-white font-bold">45.2°C</span> 的表面温升及 <span className="text-white font-bold">0.32</span> 的摩擦系数，判定包胶已进入快速磨损期。建议降低 15% 峰值启动加速度。
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-orange-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Settings size={16} className="text-orange-400" />
                                    <span className="text-[11px] text-slate-300">优化张紧力补偿算法</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-orange-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Wrench size={16} className="text-orange-400" />
                                    <span className="text-[11px] text-slate-300">预定下月“陶瓷包胶”更换方案</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：滚筒数字孪生核心 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 滚筒透视舞台 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_120px_rgba(0,0,0,1)]">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-orange-500/30">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_orange]"></div>
                                <span className="text-[12px] text-orange-400 font-black tracking-widest uppercase">滚筒分层健康透视</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">包胶最大磨损</span>
                                    <span className="text-white font-mono font-bold">9.4 mm</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">筒体受压应力</span>
                                    <span className="text-amber-400 font-mono font-bold">142 MPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">包胶脱落率</span>
                                    <span className="text-rose-500 font-mono font-bold">2.4%</span>
                                </div>
                            </div>
                        </div>

                        {/* 状态标注 */}
                        <div className="absolute top-8 right-8 z-10">
                            <div className="bg-slate-900/80 px-4 py-2 rounded border border-slate-700 text-[10px] text-slate-400">
                                <span className="block mb-1">扫描分辨率: <span className="text-white">0.5mm</span></span>
                                <span className="block">数据帧同步: <span className="text-green-400 font-mono">15ms</span></span>
                            </div>
                        </div>

                        <ThreeScene wearLevel={wearLevel / 100} rpm={45} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部中心交互 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-orange-600 text-orange-400 hover:text-white text-xs font-black rounded border border-orange-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 表面缺陷探测
                            </button>
                            <button className="px-10 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all flex items-center gap-3">
                                <RefreshCw size={16} /> 仿真模型校准
                            </button>
                        </div>
                        
                        {/* 极光工业网格背景效果 */}
                        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(249,115,22,0.05)_100%)]"></div>
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(249,115,22,0.02)_50%)] bg-[length:100%_12px] animate-[scan_25s_linear_infinite]"></div>
                    </div>

                    {/* 包胶厚度对比趋势图表 */}
                    <SciFiCard title="双滚筒包胶厚度实时监测 (24H)" subtitle="THICKNESS TRACKING" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={THICKNESS_TREND}>
                                    <defs>
                                        <linearGradient id="driveGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="bendGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={2} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: '厚度 (mm)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Area type="monotone" dataKey="drive" name="驱动滚筒" stroke="#f97316" fill="url(#driveGrad)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="bend" name="改向滚筒" stroke="#0ea5e9" fill="url(#bendGrad)" strokeWidth={2} />
                                    <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '极限预警线', fill: '#ef4444', fontSize: 10, position: 'insideBottomRight' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：改向滚筒与安全评估 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 改向滚筒状态看板 */}
                    <SciFiCard title="改向滚筒 (Bend) 运行特征" subtitle="TAIL/BEND PULLEY">
                        <div className="space-y-4 py-2">
                            <div className="h-24 w-full bg-[#020617] border border-slate-800 rounded relative overflow-hidden flex items-center justify-center">
                                {/* 模拟受力云图 */}
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,cyan_0%,transparent_70%)]"></div>
                                <div className="flex flex-col items-center">
                                    <Scale className="text-cyan-500 mb-1" size={24} />
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">轴荷分布平衡度</span>
                                    <span className="text-xl font-mono font-bold text-white">98.5%</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-2 bg-slate-900 border border-slate-800 rounded text-center">
                                    <div className="text-[9px] text-slate-500 uppercase">轴承温度</div>
                                    <div className="text-sm font-bold text-white">38.2 °C</div>
                                </div>
                                <div className="p-2 bg-slate-900 border border-slate-800 rounded text-center">
                                    <div className="text-[9px] text-slate-500 uppercase">转动阻力</div>
                                    <div className="text-sm font-bold text-green-400">Low</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 打滑风险概率矩阵 */}
                    <SciFiCard title="各种工况打滑概率" subtitle="SLIP RISK MATRIX" className="flex-1">
                        <div className="h-full flex flex-col">
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={SLIP_PROB} layout="vertical" margin={{left: -20, right: 20}}>
                                        <XAxis type="number" hide domain={[0, 100]} />
                                        <YAxis dataKey="name" type="category" tick={{fill: '#94a3b8', fontSize: 10}} width={60} />
                                        <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                        <Bar dataKey="val" radius={[0, 4, 4, 0]}>
                                            {SLIP_PROB.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.val > 70 ? '#ef4444' : entry.val > 40 ? '#f59e0b' : '#10b981'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 p-3 bg-rose-950/20 rounded border border-rose-900/30 flex items-center gap-3">
                                <AlertCircle size={20} className="text-rose-500" />
                                <div className="text-[10px] text-rose-300 leading-tight">
                                    <span className="font-bold block text-white mb-1">风险警告</span>
                                    当前摩擦力储备仅剩 <span className="text-white font-bold">12%</span>。在雨天工况下，打滑风险极高，建议启用应急张紧模式。
                                </div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 维护履历 */}
                    <SciFiCard title="滚筒维保生命周期" subtitle="LIFECYCLE">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3 opacity-60">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">#P-012 上次包胶更换</div>
                                    <div className="text-[9px] text-slate-500">2023-11-20 | 累计 1500h</div>
                                </div>
                            </div>
                            <div className="p-2 bg-orange-950/20 rounded border border-orange-900/50 flex items-center gap-3">
                                <History size={16} className="text-orange-400" />
                                <div>
                                    <div className="text-[10px] text-orange-100 font-bold">#P-028 计划包胶剔除</div>
                                    <div className="text-[9px] text-orange-500">剩余预计: 450h</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-orange-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚状态栏 --- */}
            <div className="h-10 bg-orange-950/20 border-t border-orange-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">激光扫描阵列: 联机正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测模型置信度: 96.4%</span>
                    </div>
                </div>
                <div className="text-[10px] text-orange-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Friction-AI Engine v2.4 - Pulley Shield Active
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
                    animation: spin 8s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
