
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/hoist/ThreeScene';
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
  Search, ScanLine, Link, Box, ArrowUpCircle,
  HardDrive, MonitorPlay, Hammer
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 系统亚健康状态 (Sub-system Health)
const SUBSYSTEM_HEALTH = [
    { name: '驱动电机', score: 92, status: 'normal' },
    { name: '行星减速机', score: 78, status: 'warning' },
    { name: '制动系统', score: 85, status: 'normal' },
    { name: '主轴轴承', score: 64, status: 'critical' },
    { name: '钢丝绳', score: 90, status: 'normal' },
];

// 2. 健康熵趋势预测 (Health Entropy Trend)
const HEALTH_FORECAST = Array.from({ length: 24 }, (_, i) => ({
    day: `D+${i}`,
    health: 84 - Math.pow(i/12, 1.5) * 6 + Math.random() * 2,
    lower: 84 - Math.pow(i/12, 1.5) * 6 - 5,
    upper: 84 - Math.pow(i/12, 1.5) * 6 + 5,
}));

// 3. 实时特征雷达 (Dynamic Features)
const DYNAMIC_FEATURES = [
    { subject: '振动有效值', A: 45, fullMark: 100 },
    { subject: '谐波总畸变', A: 85, fullMark: 100 },
    { subject: '润滑油NAS', A: 32, fullMark: 100 },
    { subject: '绳张力不平衡', A: 15, fullMark: 100 },
    { subject: '闸瓦间隙', A: 68, fullMark: 100 },
];

export const HoistHealthPmView: React.FC = () => {
    const [hoistId] = useState('HOIST-SHAFT-01');
    const [isOperating] = useState(true);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：全维健康博弈指挥中心 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/80 border-b border-indigo-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-indigo-600/20 rounded border border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                        <Activity className="text-indigo-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            提升机整机健康状态评估系统
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-indigo-950/50 border border-indigo-800/30 rounded">
                                引擎: Holistic-Guard v4.5
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                位置: 北风井主提升机房
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">整机健康指数</div>
                        <div className="text-4xl font-mono font-bold text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                            84.2 <span className="text-sm">/ 100</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">系统可靠度</div>
                        <div className="text-3xl font-mono font-bold text-emerald-400">99.98%</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：子系统健康与诊断特征 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    <SciFiCard title="子系统亚健康评估" subtitle="SUB-SYSTEMS" highlight className="bg-[#0c1221]">
                        <div className="space-y-4 py-2">
                            {SUBSYSTEM_HEALTH.map((sys, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span className="text-slate-400 uppercase">{sys.name}</span>
                                        <span className={sys.status === 'critical' ? 'text-rose-500' : sys.status === 'warning' ? 'text-orange-400' : 'text-emerald-400'}>
                                            {sys.score}%
                                        </span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${sys.status === 'critical' ? 'bg-rose-600' : sys.status === 'warning' ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                                            style={{ width: `${sys.score}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    <SciFiCard title="运行特性关联雷达" subtitle="DYNAMIC SIGNATURE">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={DYNAMIC_FEATURES}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Features" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    <SciFiCard title="AI 故障特征提取" subtitle="AI INSIGHT" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-rose-900/20 border-l-4 border-rose-500 rounded text-[11px] text-rose-100 leading-relaxed">
                                <Brain className="inline mr-2 text-rose-400" size={14} />
                                <span className="font-bold">深度学习提示：</span> 检测到减速机输入轴处存在周期性冲击脉冲，幅值已连续3个班次上升。高度疑似“二级太阳轮齿面点蚀”。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-indigo-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <MonitorPlay size={16} className="text-indigo-400" />
                                    <span className="text-[11px] text-slate-300">查看主轴承历史振动包络图</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-indigo-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Settings size={16} className="text-indigo-400" />
                                    <span className="text-[11px] text-slate-300">调整变频器开关频率抑制共振</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：提升机全维数字孪生 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_120px_rgba(0,0,0,1)] group">
                        {/* HUD 交互层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-indigo-500/30">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                                <span className="text-[12px] text-indigo-400 font-black tracking-widest uppercase">提升系统结构动力学实时仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">提升载荷 (Payload)</span>
                                    <span className="text-white font-mono font-bold">24.5 t</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">运行带速</span>
                                    <span className="text-emerald-400 font-mono font-bold">8.5 m/s</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">卷筒偏摆度</span>
                                    <span className="text-rose-500 font-mono font-bold">0.12 mm</span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{width: '68%'}}></div>
                                </div>
                            </div>
                        </div>

                        {/* 状态标注 */}
                        <div className="absolute top-8 right-8 z-10">
                            <div className="bg-slate-900/80 px-4 py-2 rounded border border-slate-700 text-[10px] text-slate-400">
                                <span className="block mb-1">同步延时: <span className="text-green-400 font-mono">15ms</span></span>
                                <span className="block">监测精度: <span className="text-white">±0.01g</span></span>
                            </div>
                        </div>

                        <ThreeScene healthScore={84} loadFactor={0.8} isOperating={isOperating} />

                        {/* 底部中心交互 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-black rounded border border-indigo-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 结构特征探测
                            </button>
                            <button className="px-10 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all flex items-center gap-3">
                                <MonitorPlay size={16} /> 启动全量扫描
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(99,102,241,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 健康度预测图表 */}
                    <SciFiCard title="整机健康劣化趋势预测 (Next 24 Days)" subtitle="PROGNOSTIC TREND" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={HEALTH_FORECAST}>
                                    <defs>
                                        <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Health Index', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="health" stroke="#818cf8" strokeWidth={3} fill="url(#healthGrad)" name="AI 预测健康度" />
                                    <Line type="monotone" dataKey="lower" stroke="#f43f5e" strokeDasharray="3 3" dot={false} name="置信下限" />
                                    <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '强制检修门限', fill: '#ef4444', fontSize: 10, position: 'insideBottomLeft' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：部件细节与风险管理 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 制动盘状态监测 */}
                    <SciFiCard title="制动系统完整性监测" subtitle="BRAKE ANALYSIS">
                        <div className="space-y-4 py-2">
                            <div className="h-32 w-full bg-[#020617] border border-slate-800 rounded relative overflow-hidden flex items-center justify-center">
                                {/* 模拟制动盘热图 */}
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,red_0%,transparent_70%)] animate-pulse"></div>
                                <div className="flex flex-col items-center">
                                    <Hammer className="text-rose-500 mb-1" size={24} />
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">闸瓦剩余厚度</span>
                                    <span className="text-xl font-mono font-bold text-white">8.5 mm</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-2 bg-slate-900 border border-slate-800 rounded text-center">
                                    <div className="text-[9px] text-slate-500 uppercase">制动油压</div>
                                    <div className="text-sm font-bold text-white">12.4 MPa</div>
                                </div>
                                <div className="p-2 bg-slate-900 border border-slate-800 rounded text-center">
                                    <div className="text-[9px] text-slate-500 uppercase">空动时间</div>
                                    <div className="text-sm font-bold text-green-400">0.24 s</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 维护履历与任务 */}
                    <SciFiCard title="资产维护工作序列" subtitle="SERVICE LOGS" className="flex-1">
                        <div className="space-y-3 h-full">
                            <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded border border-slate-800">
                                <History size={16} className="text-slate-500 mt-1" />
                                <div>
                                    <div className="text-[11px] font-bold text-slate-200">#M-1025 完成钢丝绳探伤</div>
                                    <div className="text-[9px] text-slate-500">2024-05-15 | 发现 2 处断丝</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-amber-900/20 border-l-4 border-amber-500 rounded">
                                <Wrench size={16} className="text-amber-400 mt-1" />
                                <div>
                                    <div className="text-[11px] font-bold text-amber-100">计划任务: 减速机油质更换</div>
                                    <div className="text-[9px] text-amber-600">预计 2024-06-12</div>
                                </div>
                            </div>
                            <div className="mt-auto pt-4">
                                <button className="w-full py-2 bg-slate-800 hover:bg-indigo-700 text-white text-[11px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                                    <HardDrive size={14} /> 调取电子检修手册
                                </button>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 运行指标流 */}
                    <SciFiCard title="实时感知流阵列" subtitle="STREAM">
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: '卷筒振幅', val: '0.04mm' },
                                { label: '主轴轴向位', val: '0.01mm' },
                                { label: '电机壳温', val: '58.4°C' },
                                { label: '减速机壳温', val: '72.2°C' },
                            ].map((item, i) => (
                                <div key={i} className="p-2 bg-slate-800/40 rounded border border-slate-700/50">
                                    <div className="text-[8px] text-slate-500 uppercase">{item.label}</div>
                                    <div className="text-xs font-mono font-bold text-white">{item.val}</div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚状态栏 --- */}
            <div className="h-10 bg-indigo-950/20 border-t border-indigo-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">边缘网关数据流: 240 MB/s</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">AI 模型推演延迟: 25ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-indigo-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Holistic-Integrity Engine v4.5.2 - Structural Guard Active
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
