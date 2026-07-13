
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/winch-health/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-59]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-59';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie
} from 'recharts';
import { 
  Activity, Zap, ShieldCheck, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Anchor, Ship, HardDrive, MonitorPlay, AlertOctagon,
  LifeBuoy, Hammer, FastForward, Play, Info,
  Box, Terminal, Radar as RadarIcon, ShieldAlert,
  // Added Microscope and Sliders to resolve "Cannot find name" errors on lines 149 and 192
  Microscope, Sliders
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 核心部件健康堆栈 (Component Health Stack)
const COMPONENT_HEALTH = [
    { id: 'motor', name: '变频驱动电机', score: 94, status: '正常', color: '#10b981' },
    { id: 'gearbox', name: '三级行星减速箱', score: 78, status: '注意', color: '#f59e0b' },
    { id: 'brake', name: '液压盘式制动器', score: 85, status: '正常', color: '#10b981' },
    { id: 'rope', name: '高强度钢丝绳', score: 62, status: '风险', color: '#f43f5e' },
    { id: 'drum', name: '主卷筒结构', score: 91, status: '正常', color: '#10b981' },
];

// 2. 张力载荷演化趋势 (Tension & Load Trend)
const LOAD_TREND_DATA = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    tension: 120 + Math.sin(i / 3) * 30 + Math.random() * 5,
    speed: 15 + Math.cos(i / 4) * 5,
    limit: 180
}));

// 3. 故障模式热力雷达 (Failure Mode Radar)
const FAILURE_RADAR = [
    { subject: '机械磨损', A: 45, fullMark: 100 },
    { subject: '液压内泄', A: 82, fullMark: 100 },
    { subject: '电控迟滞', A: 32, fullMark: 100 },
    { subject: '结构疲劳', A: 55, fullMark: 100 },
    { subject: '热失效', A: 78, fullMark: 100 },
];

export const WinchHealthPmView: React.FC = () => {
    const [overallHealth, setOverallHealth] = useState(84.5);
    const [isOperating, setIsOperating] = useState(true);
    const [loadFactor, setLoadFactor] = useState(0.65);

    // 动态模拟
    useEffect(() => {
        const interval = setInterval(() => {
            setOverallHealth(prev => prev + (Math.random() - 0.5) * 0.1);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部数字看板：整机态势 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-cyan-600/20 rounded-lg border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                        <Anchor className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            船用绞车整机健康状态总览
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>系统编号: WINCH-SY-402</span>
                            <span>评估引擎: Holistic-Vessel-Shield v5.4</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">综合健康指数</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            {overallHealth.toFixed(1)}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">预计可用时长 (MTBF)</div>
                        <div className="text-3xl font-mono font-bold text-amber-400">1,245 <span className="text-sm">HRS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：组件健康与风险因子 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 部件健康得分列表 */}
                    <SciFiCard title="关键节点健康评估" subtitle="COMPONENT STATUS" highlight className="bg-[#0c1221]">
                        <div className="space-y-4 py-2">
                            {COMPONENT_HEALTH.map((comp) => (
                                <div key={comp.id} className="group relative">
                                    <div className="flex justify-between items-center mb-1 text-[11px] font-bold">
                                        <span className="text-slate-400 uppercase">{comp.name}</span>
                                        <span className={comp.score < 70 ? 'text-rose-500 animate-pulse' : ''}>{comp.score}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden flex">
                                        <div 
                                            className="h-full transition-all duration-1000" 
                                            style={{ width: `${comp.score}%`, backgroundColor: comp.color }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 风险特征雷达 */}
                    <SciFiCard title="多维亚健康指纹" subtitle="RISK FINGERPRINT">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={FAILURE_RADAR}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Impact" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* AI 诊断推演 */}
                    <SciFiCard title="AI 专家诊断报告" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed italic">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold uppercase">诊断简报:</span> 监测到钢丝绳在排绳器换向瞬间伴随有 12.5Hz 的非线性冲击能级跳跃。判定为 <span className="text-white font-bold underline">排绳丝杠早期轴承磨损</span>。
                                建议在持续作业 250 小时后执行精密对中复核。
                            </div>
                            <div className="space-y-2">
                                <button className="w-full py-2 bg-slate-800 hover:bg-cyan-600 text-white text-[10px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2 group">
                                    <Microscope size={14} className="text-cyan-400 group-hover:text-white" /> 调取油液铁谱分析
                                </button>
                                <button className="w-full py-2 bg-slate-800 hover:bg-rose-600 text-white text-[10px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2 group">
                                    <MonitorPlay size={14} className="text-rose-400 group-hover:text-white" /> 查看历史失效演化
                                </button>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D数字孪生与实时扫描 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 绞车动力学视窗 */}
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_120px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">整机动力学全息实时仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前载荷 (Load)</span>
                                    <span className="text-white font-mono font-bold">124.5 kN</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">制动闸温度</span>
                                    <span className="text-orange-400 font-mono font-bold">54.2 °C</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">变频器谐波</span>
                                    <span className="text-emerald-400 font-mono font-bold">2.4%</span>
                                </div>
                            </div>
                        </div>

                        <ThreeScene healthScore={overallHealth} isOperating={isOperating} loadLevel={loadFactor} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部控制与扫描 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-6 rounded-2xl shadow-2xl">
                             <div className="flex flex-col gap-3 flex-1 px-4">
                                <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    <div className="flex items-center gap-2 text-cyan-400"><Sliders size={14}/> 仿真载荷映射 (Mapping)</div>
                                    <span>Intensity: {Math.floor(loadFactor * 100)}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="1" step="0.01" 
                                    value={loadFactor} 
                                    onChange={(e) => setLoadFactor(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                             </div>
                             <div className="flex items-center gap-3">
                                <button className="px-10 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded-sm shadow-lg transition-all flex items-center gap-2 uppercase tracking-widest">
                                    <ScanLine size={16} /> 启动全量扫描
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_15px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 载荷与张力趋势 */}
                    <SciFiCard title="实时张力与绳速波动曲线" subtitle="KINETIC TRACKING" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={LOAD_TREND_DATA} margin={{top:10, right:30, left:0, bottom:0}}>
                                    <defs>
                                        <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 200]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Area type="monotone" dataKey="tension" name="钢丝绳张力 (kN)" stroke="#0ea5e9" fill="url(#loadGrad)" strokeWidth={3} />
                                    <Line type="monotone" dataKey="speed" name="卷筒转速 (RPM)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                    <ReferenceLine y={180} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '过载切断线', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：传感器阵列与维保排程 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 传感器实时矩阵 */}
                    <SciFiCard title="感知阵列实时数据流" subtitle="STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '主电机振动 RMS', val: '2.4', unit: 'mm/s', status: 'normal' },
                                { label: '减速机齿面温升', val: '12.4', unit: '°C', status: 'warning' },
                                { label: '制动器油压残差', val: '0.05', unit: 'MPa', status: 'normal' },
                                { label: '排绳丝杠偏移量', val: '1.2', unit: 'mm', status: 'warning' },
                                { label: '模型拟合置信度', val: '0.96', unit: 'Idx', status: 'normal' },
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

                    {/* 维保建议项 */}
                    <SciFiCard title="预测性维保建议" subtitle="ACTIONS">
                        <div className="space-y-2">
                            <div className="p-3 bg-rose-950/20 rounded border border-rose-900/50 flex items-center gap-3">
                                <ShieldAlert size={20} className="text-rose-400" />
                                <div>
                                    <div className="text-[10px] text-rose-100 font-bold uppercase">钢丝绳强磁探伤</div>
                                    <div className="text-[9px] text-rose-600 font-bold italic shadow-glow">建议：48h 内执行</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-rose-600" />
                            </div>
                            <div className="p-3 bg-emerald-950/20 rounded border border-emerald-900/50 flex items-center gap-3">
                                <ShieldCheck size={20} className="text-emerald-400" />
                                <div>
                                    <div className="text-[10px] text-emerald-100 font-bold uppercase">减速机油液自净化</div>
                                    <div className="text-[9px] text-emerald-600 font-bold italic">已自动调整净化流速</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 历史案例匹配 */}
                    <SciFiCard title="历史特征指纹匹配" subtitle="CASES">
                        <div className="space-y-2">
                            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-300 font-bold">案例 #W-2023-14</div>
                                    <div className="text-[9px] text-slate-500">特征匹配度: 91.2% (轴承失效)</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-slate-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统状态脚部 --- */}
            <div className="h-10 bg-cyan-950/20 border-t border-cyan-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">终端感知网: 联机正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测模型同步: 12ms 前</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Kinetic Engine v5.4.1 - Active Asset Protection
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
                    animation: spin 10s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
