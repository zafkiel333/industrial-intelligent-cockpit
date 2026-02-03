import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/aux-generator/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie
} from 'recharts';
import { 
  Zap, Activity, ShieldCheck, Cpu, AlertTriangle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Anchor, Wind, Radio, Play,
  Microscope, BatteryCharging, Power, HardDrive,
  MonitorPlay, ZapOff, RefreshCw
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 绝缘电阻趋势 (Insulation Resistance MΩ)
const INSULATION_DATA = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    measured: 50 - i * 0.8 - Math.random() * 2 + (i > 18 ? -10 : 0),
    humidity: 60 + Math.sin(i/3) * 10,
    limit: 10
}));

// 2. 多机负载分配 (Load Sharing - Unit 1, 2, 3)
const LOAD_SHARING_DATA = [
    { name: 'Genset #1', active: 450, reactive: 120, cap: 600, status: 'running' },
    { name: 'Genset #2', active: 442, reactive: 115, cap: 600, status: 'running' },
    { name: 'Genset #3', active: 0, reactive: 0, cap: 600, status: 'standby' },
];

// 3. 励磁系统动态指标 (Excitation Metrics)
const EXCITATION_RADAR = [
    { subject: '响应速度', A: 92, fullMark: 100 },
    { subject: '电压稳定性', A: 95, fullMark: 100 },
    { subject: '谐波分量', A: 78, fullMark: 100 },
    { subject: '碳刷磨损', A: 65, fullMark: 100 },
    { subject: '温度控制', A: 88, fullMark: 100 },
];

export const ShipAuxGeneratorPmView: React.FC = () => {
    const [activeUnit] = useState('#1 辅机');
    const [healthScore] = useState(84.2);
    const [loadFactor] = useState(0.75);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：辅机电能指挥中心 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,cyan_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                        <Zap className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            船舶辅机发电机健康监测与预测
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>所属系统: 电力系统 (Electrical Grid)</span>
                            <span>机组型号: Daihatsu 6DK-20 | 额定功率: 600 kW</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">系统可用度预测</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            98.8<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">总网有功功率</div>
                        <div className="text-3xl font-mono font-bold text-white tracking-tighter">892 <span className="text-sm">kW</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：电气健康与绝缘诊断 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 绝缘电阻分析 */}
                    <SciFiCard title="定子绕组绝缘趋势" subtitle="INSULATION RES" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={INSULATION_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="insuGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="measured" stroke="#06b6d4" fill="url(#insuGrad)" strokeWidth={2} name="实测值 (MΩ)" />
                                    <Line type="monotone" dataKey="humidity" stroke="#334155" strokeWidth={1} dot={false} strokeDasharray="5 5" name="相对湿度 (%)" />
                                    <ReferenceLine y={10} stroke="#ef4444" strokeDasharray="10 5" label={{value:'临界', fill:'#ef4444', fontSize:8}} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                             <div className="flex items-center gap-1 text-orange-400 animate-pulse"><AlertTriangle size={12}/> 受潮风险</div>
                             <span className="text-white font-mono">修正系数: 1.24</span>
                        </div>
                    </SciFiCard>

                    {/* 励磁性能雷达 */}
                    <SciFiCard title="励磁系统动态指纹" subtitle="EXCITATION">
                        <div className="h-52 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={EXCITATION_RADAR}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Status" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* AI 专家诊断报告 */}
                    <SciFiCard title="AI 专家劣化推演" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演报告：</span> 监测到 #1 辅机在 400kW 以上负荷时存在周期性 <span className="text-white font-bold underline">电压畸变</span>。初步判定为励磁碳刷与滑环接触不良。预测在 120h 内可能触发 AVR 低电压报警。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">查看定子铁芯红外成像记录</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：全息数字孪生视窗 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset:0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping shadow-[0_0_10px_cyan]"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">机组电磁力场数字孪生映射</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前频率</span>
                                    <span className="text-white font-mono font-bold">50.02 Hz</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">功率因数 (PF)</span>
                                    <span className="text-emerald-400 font-mono font-bold">0.92</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">机油压力</span>
                                    <span className="text-white font-mono font-bold">4.8 Bar</span>
                                </div>
                            </div>
                        </div>

                        <ThreeScene loadLevel={loadFactor} healthScore={healthScore} />

                        {/* 底部中心交互 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-cyan-600 text-cyan-400 hover:text-white text-xs font-black rounded border border-cyan-900/50 transition-all flex items-center gap-3 shadow-xl">
                                <Search size={16} /> 微观故障溯源
                            </button>
                            <button className="px-10 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center gap-3">
                                <MonitorPlay size={16} /> 仿真负载迁移测试
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 并联负载分配图表 */}
                    <SciFiCard title="集群负载分配博弈监测" subtitle="PMS BALANCING" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={LOAD_SHARING_DATA} margin={{top:20, right:20, bottom:0, left:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: '功率 (kW)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Bar dataKey="active" name="有功功率 (Active)" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="reactive" name="无功功率 (Reactive)" fill="#6366f1" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="cap" name="额定容量" fill="#1e293b" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：机械劣化与环境约束 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 机械劣化评估 */}
                    <SciFiCard title="辅机柴油机机械状态" subtitle="ENGINE HEALTH">
                        <div className="space-y-4 py-2">
                            {[
                                { label: '各缸爆发压差', val: 4.2, unit: '%', status: 'normal' },
                                { label: '滑油金属颗粒', val: 45, unit: 'ppm', status: 'warning' },
                                { label: '增压器喘振裕度', val: 18, unit: '%', status: 'normal' },
                                { label: '曲轴扭振强度', val: 0.12, unit: 'Δ', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                                        <span className="text-slate-400">{item.label}</span>
                                        <span className={item.status === 'warning' ? 'text-orange-400 animate-pulse' : 'text-slate-100'}>{item.val} {item.unit}</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full transition-all duration-1000 ${item.status === 'warning' ? 'bg-orange-500' : 'bg-cyan-500'}`} 
                                          style={{ width: `${Math.random() * 50 + 50}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 运行指标流 */}
                    <SciFiCard title="实时电能质量流" subtitle="DATA STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '总谐波畸变率 THD', val: '1.24', unit: '%', status: 'normal' },
                                { label: '电压不平衡度', val: '0.42', unit: '%', status: 'normal' },
                                { label: '频率最大偏差', val: '0.08', unit: 'Hz', status: 'normal' },
                                { label: '定子槽楔温度', val: '82.4', unit: '°C', status: 'warning' },
                                { label: '励磁回路绝缘', val: '2.5', unit: 'MΩ', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-cyan-500/30 transition-all">
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

                    {/* 维护计划 */}
                    <SciFiCard title="资产维保计划" subtitle="MAINTENANCE">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-300 font-bold">上次大修: 2023-11-20</div>
                                    <div className="text-[9px] text-slate-500">机组已累计运行: 4,500 HRS</div>
                                </div>
                            </div>
                            <div className="p-2 bg-orange-950/20 rounded border border-orange-900/50 flex items-center gap-3">
                                <Wrench size={16} className="text-orange-400" />
                                <div>
                                    <div className="text-[10px] text-orange-100 font-bold">建议任务: 绕组烘干处理</div>
                                    <div className="text-[9px] text-orange-600">由于绝缘电阻呈现加速下降趋势</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-orange-600" />
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
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">电力采集网: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">动态频率偏差: 0.02Hz</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Auxiliary-Core v5.2.0 - Power Integrity Shield Active
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