
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/steering-gear/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-54]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-54';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  Ship, Droplets, Activity, ShieldAlert, Cpu, 
  Compass, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Target, Binary, BarChart3,
  Search, ScanLine, Radio, AlertOctagon, 
  Zap, Play, RefreshCw, ShieldCheck,
  // Fix: Added Microscope to the import list to resolve "Cannot find name 'Microscope'" error on line 161
  Microscope
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 舵角随动误差趋势 (Instruction vs Feedback)
const RUDDER_FOLLOW_DATA = Array.from({ length: 30 }, (_, i) => ({
    time: `${i}:00`,
    instruction: 15 * Math.sin(i / 5),
    feedback: 15 * Math.sin(i / 5 - 0.2) + (Math.random() - 0.5) * 0.5,
    error: Math.abs(1.5 * Math.sin(i / 5)) + Math.random()
}));

// 2. 伺服阀响应频谱 (Valve Spectrum)
const VALVE_FFT_DATA = [
    { freq: '5Hz (基频)', val: 95 },
    { freq: '50Hz (电气)', val: 12 },
    { freq: '120Hz (高频)', val: 45 },
    { freq: '240Hz (紊流)', val: 82 }, // 异常点
    { freq: '500Hz (尖峰)', val: 28 },
];

// 3. 液压泵能效比 (Efficiency vs Power)
const PUMP_EFF_DATA = [
    { name: '#1 主泵', efficiency: 92, power: 45 },
    { name: '#2 备泵', efficiency: 88, power: 48 },
];

// 4. 健康评估多维雷达
const HEALTH_RADAR = [
  { subject: '油膜完整性', A: 95, fullMark: 100 },
  { subject: '伺服响应', A: 64, fullMark: 100 }, // 响应迟滞
  { subject: '密封完整度', A: 78, fullMark: 100 },
  { subject: '压力稳定性', A: 88, fullMark: 100 },
  { subject: '油液洁净度', A: 42, fullMark: 100 }, // 污染严重
];

export const SteeringGearPmView: React.FC = () => {
    const [rudderAngle, setRudderAngle] = useState(15.4);
    const [isScanning, setIsScanning] = useState(false);
    const [showLeak, setShowLeak] = useState(false);
    const [healthScore] = useState(72.5);

    const handleStartDiagnostic = () => {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 5000);
    };

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：推进安全状态看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        <Compass className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            舵机液压系统健康状态评估
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>系统架构: 柱塞式双舵柄</span>
                            <span>工作压力: 18.5 MPa | 额定扭矩: 1250 kNm</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">系统可用度 (Availability)</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            {healthScore}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">当前反馈舵角</div>
                        <div className="text-3xl font-mono font-bold text-emerald-400 tracking-tighter">
                            {rudderAngle.toFixed(1)}<span className="text-sm">° PORT</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：随动特性与指纹分析 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 舵角随动误差分析 */}
                    <SciFiCard title="舵角随动差值分析 (Lag)" subtitle="FOLLOWING ERROR" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={RUDDER_FOLLOW_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="error" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} name="随动误差" />
                                    <Line type="monotone" dataKey="instruction" stroke="#334155" strokeWidth={1} dot={false} strokeDasharray="5 5" name="指令舵角" />
                                    <Line type="monotone" dataKey="feedback" stroke="#0ea5e9" strokeWidth={2} dot={false} name="反馈舵角" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex justify-between items-center text-[10px]">
                            <span className="text-slate-500">最大相位滞后</span>
                            <span className="text-rose-400 font-bold font-mono">1.84s (临界)</span>
                        </div>
                    </SciFiCard>

                    {/* 伺服阀响应频谱 */}
                    <SciFiCard title="伺服控制阀频率特征" subtitle="VALVE SPECTRUM">
                        <div className="h-48 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={VALVE_FFT_DATA} layout="vertical" margin={{left: -20, right: 20}}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="freq" type="category" tick={{fill: '#94a3b8', fontSize: 10}} width={80} />
                                    <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#020617'}} />
                                    <Bar dataKey="val" radius={[0, 4, 4, 0]} barSize={15}>
                                        {VALVE_FFT_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.val > 60 ? '#f43f5e' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-[10px] text-center text-slate-500 uppercase tracking-widest mt-1">
                             特征匹配: <span className="text-rose-400 font-bold">油路扰动与内泄特征 (84%)</span>
                        </div>
                    </SciFiCard>

                    {/* AI 诊断推演 */}
                    <SciFiCard title="AI 专家劣化推演" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演报告：</span> 监测到 #1 伺服阀在中位锁紧状态下存在 <span className="text-white font-bold underline">微量压力脉动</span>。结合流量传感器残差分析，判定为由于油液中 <span className="text-white">金属颗粒超标</span> 导致的阀芯密封面早期冲刷。
                                预测在持续风浪负载下，系统响应精度将在 72h 内下降 15%。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">查看油液理化指纹库</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：舵机数字孪生与仿真控制 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 动力学视窗 */}
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">全系统压力/流量场数字孪生映射</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前系统油压</span>
                                    <span className="text-white font-mono font-bold">18.4 MPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">液压泵容积效率</span>
                                    <span className="text-emerald-400 font-mono font-bold">94.2%</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">密封处泄漏量</span>
                                    <span className="text-rose-400 font-mono font-bold">12 ml/min</span>
                                </div>
                            </div>
                        </div>

                        {/* 状态控制 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2 items-end">
                            <div className="bg-black/60 px-4 py-2 rounded border border-orange-500/30 backdrop-blur">
                                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">主泵运行状态</div>
                                <div className="text-2xl font-mono font-bold text-orange-500 animate-pulse">PUMP-01</div>
                            </div>
                            <button 
                                onClick={() => setShowLeak(!showLeak)}
                                className={`px-5 py-2 rounded-sm border text-[10px] font-black uppercase tracking-widest transition-all
                                    ${showLeak ? 'bg-rose-600 border-rose-400 text-white animate-pulse' : 'bg-slate-900 border-slate-700 text-slate-500'}
                                `}
                            >
                                {showLeak ? 'Leakage Visible' : 'View Leak Flow'}
                            </button>
                        </div>

                        <ThreeScene rudderAngle={rudderAngle} isScanning={isScanning} leakageActive={showLeak} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex flex-col gap-1 flex-1">
                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    <span>舵机工作载荷模拟 (Rudder Load)</span>
                                    <span className="text-cyan-400">Current: 820 kNm</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
                                    <div className="h-full bg-cyan-500 animate-pulse" style={{width: '78%'}}></div>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <button 
                                    onClick={handleStartDiagnostic}
                                    disabled={isScanning}
                                    className={`px-10 py-2.5 text-white text-xs font-black rounded shadow-lg transition-all flex items-center gap-2
                                        ${isScanning ? 'bg-slate-700' : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40'}
                                    `}
                                >
                                    {isScanning ? <RefreshCw className="animate-spin" size={14} /> : <ScanLine size={14} />}
                                    {isScanning ? '正在执行深度自检...' : '启动系统深度自检'}
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 液压泵特性图表 */}
                    <SciFiCard title="主液压泵站效能博弈 (Pump Stats)" subtitle="HYDRAULIC ENERGY" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={PUMP_EFF_DATA} margin={{top:20, right:30, left:0, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Bar dataKey="efficiency" name="容积效率 (%)" fill="#10b981" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="power" name="输出功率 (kW)" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：综合指标与维保矩阵 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 综合评分雷达 */}
                    <SciFiCard title="多维运行健康评估" subtitle="HEALTH RADAR">
                        <div className="h-56 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={HEALTH_RADAR}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Status" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 实时感知参数流 */}
                    <SciFiCard title="实时感知参数矩阵" subtitle="DATA STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '补油箱油位', val: '75', unit: '%', status: 'normal' },
                                { label: '主回路油温', val: '54.2', unit: '°C', status: 'warning' },
                                { label: '伺服电流偏差', val: '+0.12', unit: 'mA', status: 'normal' },
                                { label: '机械密封压降', val: 'Low', unit: 'Δ', status: 'normal' },
                                { label: '机组振动频谱', val: 'Matched', unit: 'Idx', status: 'normal' },
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

                    {/* 维护建议 */}
                    <SciFiCard title="预测驱动工作包" subtitle="O&M PLAN">
                        <div className="space-y-2">
                            <div className="p-3 bg-rose-950/20 rounded border border-rose-900/50 flex items-center gap-3">
                                <Wrench size={20} className="text-rose-400" />
                                <div>
                                    <div className="text-[10px] text-rose-100 font-bold uppercase">更换精密伺服滤芯</div>
                                    <div className="text-[9px] text-rose-600 font-bold italic">建议在 D+3 港口靠泊期执行</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-rose-600" />
                            </div>
                            <div className="p-3 bg-emerald-950/20 rounded border border-emerald-900/50 flex items-center gap-3">
                                <ShieldCheck size={20} className="text-emerald-400" />
                                <div>
                                    <div className="text-[10px] text-emerald-100 font-bold uppercase">油液磁性过滤增强</div>
                                    <div className="text-[9px] text-emerald-600 font-bold italic">已自动调整磁力捕获器强度</div>
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
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">终端感知网: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测模型同步: 12ms 前</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Hydraulic Inference Engine v5.1.2 - Active Protection
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
