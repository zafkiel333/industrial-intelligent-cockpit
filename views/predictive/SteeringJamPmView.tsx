
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/steering-jam/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-56]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-56';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter
} from 'recharts';
import { 
  Activity, Zap, ShieldAlert, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Wind, Radio, Play, Pause, FastForward, Ship,
  Compass, HardDrive, MonitorPlay, AlertOctagon,
  LifeBuoy, Hammer, Lock, ShieldX,
  // Fix: Added missing Microscope and ShieldCheck imports to resolve "Cannot find name" errors.
  Microscope, ShieldCheck
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 摩擦-扭矩相关性分布 (Friction vs Torque Correlation)
const CORRELATION_DATA = Array.from({ length: 40 }, (_, i) => ({
    torque: 20 + i * 2,
    friction: 5 + Math.pow(i/10, 2) * 5 + (i > 25 ? Math.random() * 20 : Math.random() * 5),
    isAnomaly: i > 25
}));

// 2. 伺服阀响应响应迟滞趋势 (Servo Lag Trend)
const LAG_TREND = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    lag: 12 + Math.sin(i / 3) * 5 + (i > 16 ? (i - 16) * 10 : 0),
    threshold: 45
}));

// 3. 风险因子多维解析 (Risk Factors)
const RISK_RADAR = [
    { subject: '机械磨损', A: 85, fullMark: 100 },
    { subject: '液压污染', A: 42, fullMark: 100 },
    { subject: '电控迟滞', A: 78, fullMark: 100 },
    { subject: '密封失效', A: 35, fullMark: 100 },
    { subject: '外部负载', A: 92, fullMark: 100 },
];

export const SteeringJamPmView: React.FC = () => {
    const [rudderAngle, setRudderAngle] = useState(12.5);
    const [isScanning, setIsScanning] = useState(false);
    const [jamRisk, setJamRisk] = useState(68.4);
    const [activeTab, setActiveTab] = useState('physics');

    const handleScan = () => {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 4000);
    };

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部数字看板：系统可靠性总览 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-orange-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.2)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-orange-600/20 rounded-sm border border-orange-500/50 shadow-[0_0_25px_rgba(249,115,22,0.3)]">
                        <ShieldX className="text-orange-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            舵机卡滞与失灵风险预测中心
                            <span className="text-xs not-italic font-bold bg-orange-950/50 text-orange-300 px-2 py-0.5 rounded border border-orange-800 tracking-widest uppercase">Emergency Guard</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>系统架构: 四柱塞式液压驱动</span>
                            <span>预测引擎: Kinematic-Anomalytics v5.8</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">瞬时卡滞风险熵 (SJE)</div>
                        <div className={`text-4xl font-mono font-bold ${jamRisk > 60 ? 'text-rose-500 animate-pulse' : 'text-orange-400'} drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]`}>
                            {jamRisk}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">预计失灵响应时间</div>
                        <div className="text-3xl font-mono font-bold text-cyan-400 tracking-tighter">4.2 <span className="text-sm">SEC</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵：左中右结构 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：物理场特征与关联分析 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 摩擦-扭矩散点分析 */}
                    <SciFiCard title="摩擦力-扭矩非线性关联" subtitle="SCATTER CORRELATION" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis type="number" dataKey="torque" name="扭矩" unit="kNm" stroke="#64748b" tick={{fontSize: 9}} />
                                    <YAxis type="number" dataKey="friction" name="摩擦力" unit="kN" stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#020617', border: '1px solid #334155'}} />
                                    <Scatter name="Normal" data={CORRELATION_DATA.filter(d => !d.isAnomaly)} fill="#22d3ee" />
                                    <Scatter name="Anomaly" data={CORRELATION_DATA.filter(d => d.isAnomaly)} fill="#ef4444" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-slate-500 uppercase tracking-tighter">
                            识别：高载荷区摩擦力呈现 <span className="text-rose-500 font-bold">幂律增长</span>，符合典型卡滞前兆
                        </div>
                    </SciFiCard>

                    {/* 伺服阀响应迟滞趋势 */}
                    <SciFiCard title="伺服控制响应迟滞趋势" subtitle="SERVO LAG (ms)">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={LAG_TREND}>
                                    <defs>
                                        <linearGradient id="lagGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                    <Area type="monotone" dataKey="lag" stroke="#f59e0b" fill="url(#lagGrad)" strokeWidth={2} />
                                    <ReferenceLine y={45} stroke="#ef4444" strokeDasharray="10 5" label={{value:'临界值', fill:'#ef4444', fontSize:8}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* AI 诊断深度分析 */}
                    <SciFiCard title="AI 专家卡滞推演报告" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed italic">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演简报：</span> 系统检测到左侧液压缸柱塞在中位偏转 15° 时，伴随有非稳态的压力脉动能级跳跃。判定为 <span className="text-white font-black underline italic">柱塞密封圈撕裂导致的机械性阻滞</span>。
                                预计在持续大舵角作业下，24h 内演化为完全卡死风险率为 72%。
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button className="py-2 bg-slate-800 hover:bg-orange-600 text-white text-[10px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2 group">
                                    <MonitorPlay size={14} className="text-orange-400 group-hover:text-white" /> 调取异常声纹
                                </button>
                                <button className="py-2 bg-slate-800 hover:bg-cyan-600 text-white text-[10px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2 group">
                                    <Microscope size={14} className="text-cyan-400 group-hover:text-white" /> 铁谱特征比对
                                </button>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：舵机 3D 数字孪生与全息扫描 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层：实时状态 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-orange-500/30">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
                                <span className="text-[12px] text-orange-400 font-black tracking-widest uppercase">舵机机械完整性实时仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大执行扭矩</span>
                                    <span className="text-white font-mono font-bold">1240 kNm</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前系统油压</span>
                                    <span className="text-emerald-400 font-mono font-bold">18.2 MPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">活塞润滑指数</span>
                                    <span className="text-rose-400 font-mono font-bold">0.42 Δ</span>
                                </div>
                            </div>
                        </div>

                        {/* 视角控制按钮组 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                             <button className="p-3 bg-black/60 border border-slate-700 rounded-full hover:border-orange-500 transition-all text-slate-400 hover:text-white active:scale-90">
                                <Search size={20} />
                             </button>
                             <button className="p-3 bg-black/60 border border-slate-700 rounded-full hover:border-orange-500 transition-all text-slate-400 hover:text-white active:scale-90">
                                <Layers size={20} />
                             </button>
                        </div>

                        <ThreeScene targetAngle={rudderAngle} jammingRisk={jamRisk / 100} isScanning={isScanning} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部交互区：舵角控制与深度扫描 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex flex-col gap-1 flex-1 px-4">
                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    <span>舵角指令模拟控制 (Rudder Command)</span>
                                    <span className="text-cyan-400">{rudderAngle}° PORT</span>
                                </div>
                                <input 
                                    type="range" min="-35" max="35" step="0.1" 
                                    value={rudderAngle} 
                                    onChange={(e) => setRudderAngle(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                             </div>
                             <div className="flex items-center gap-3 pr-4">
                                <button 
                                    onClick={handleScan}
                                    disabled={isScanning}
                                    className={`px-10 py-2.5 text-white text-xs font-black rounded-sm shadow-lg transition-all flex items-center gap-2
                                        ${isScanning ? 'bg-slate-700' : 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/40 active:translate-y-0.5'}
                                    `}
                                >
                                    {isScanning ? <RefreshCw className="animate-spin" size={14} /> : <ScanLine size={14} />}
                                    {isScanning ? '正在深度扫描...' : '启动全系统风险扫描'}
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(249,115,22,0.02)_50%)] bg-[length:100%_15px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 运行能效与功耗博弈 */}
                    <SciFiCard title="执行机构运行能效实时监测 (24H)" subtitle="POWER EFFICIENCY" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={LAG_TREND}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="lag" fill="#f59e0b" fillOpacity={0.1} stroke="#f59e0b" strokeWidth={2} name="单位功耗损耗" />
                                    <Line type="monotone" dataKey="lag" stroke="#0ea5e9" strokeWidth={2} dot={false} name="机械能转化率" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：风险分析与维保排程 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 风险雷达分析 */}
                    <SciFiCard title="卡滞风险多维解析" subtitle="FACTOR ANALYSIS">
                        <div className="h-56 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RISK_RADAR}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Status" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 实时参数流矩阵 */}
                    <SciFiCard title="实时感知参数矩阵" subtitle="DATA STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '柱塞表面粗糙度(Est)', val: 'Ra 1.2', unit: 'µm', status: 'warning' },
                                { label: '主油路含金指数', val: '45', unit: 'ppm', status: 'normal' },
                                { label: '伺服电流反馈偏置', val: '+0.12', unit: 'mA', status: 'normal' },
                                { label: '机械配合间隙变化', val: '-0.04', unit: 'mm', status: 'critical' },
                                { label: '舵柄动平衡系数', val: '0.96', unit: 'Idx', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-orange-500/30 transition-all">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-slate-400 font-bold uppercase">{item.label}</span>
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'normal' ? 'bg-emerald-500' : item.status === 'warning' ? 'bg-orange-500 animate-pulse' : item.status === 'critical' ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`}></span>
                                    </div>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-lg font-mono font-bold text-white">{item.val}</span>
                                        <span className="text-[10px] text-slate-600">{item.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 维保应急包 */}
                    <SciFiCard title="预测驱动应急任务包" subtitle="O&M PLAN">
                        <div className="space-y-2">
                            <div className="p-3 bg-rose-950/20 rounded border border-rose-900/50 flex items-center gap-3 cursor-pointer hover:bg-rose-900/40 transition-all">
                                <Wrench size={20} className="text-rose-400" />
                                <div>
                                    <div className="text-[10px] text-rose-100 font-bold uppercase">更换左侧活塞密封件</div>
                                    <div className="text-[9px] text-rose-600 font-bold italic">故障概率高 | 建议：下次进港执行</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-rose-600" />
                            </div>
                            <div className="p-3 bg-emerald-950/20 rounded border border-emerald-900/50 flex items-center gap-3">
                                <ShieldCheck size={20} className="text-emerald-400" />
                                <div>
                                    <div className="text-[10px] text-emerald-100 font-bold uppercase">液压油微克级过滤</div>
                                    <div className="text-[9px] text-emerald-600 font-bold italic">已自动调整辅助循环泵流速</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统状态脚部 --- */}
            <div className="h-10 bg-orange-950/20 border-t border-orange-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2 text-orange-500 font-black italic">
                        <AlertOctagon size={16} /> EMERGENCY ALERT LAYER ACTIVE
                    </div>
                    <div className="h-4 w-[1px] bg-slate-800"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">终端自愈网络: 在线</span>
                    </div>
                </div>
                <div className="text-[10px] text-orange-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Hydraulic Failure-Predictor v5.8.1 - Active Guard
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
