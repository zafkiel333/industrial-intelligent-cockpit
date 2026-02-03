
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/steering-pump-actuator/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  Activity, Zap, ShieldAlert, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Wind, Radio, Play, Pause, FastForward, Ship,
  Compass, HardDrive, MonitorPlay, FlaskConical,
  Microscope, LayoutPanelTop, ShieldCheck
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 泵容积效率衰减 (Pump Volumetric Efficiency)
const PUMP_EFF_DATA = Array.from({ length: 24 }, (_, i) => ({
    time: `T-${23-i}H`,
    pump1: 94 - Math.pow(i/20, 2) * 5,
    pump2: 95 - i * 0.1,
    limit: 85
}));

// 2. 执行机构摩擦力指纹 (Actuator Friction Torque)
const ACTUATOR_FRICTION = [
    { name: '0° 中位', val: 12, status: 'normal' },
    { name: '15° 舷左', val: 18, status: 'normal' },
    { name: '35° 满左', val: 42, status: 'warning' }, // 末端摩擦大
    { name: '15° 舷右', val: 15, status: 'normal' },
    { name: '35° 满右', val: 38, status: 'warning' },
];

// 3. 系统压力脉动能级 (Pressure Ripple)
const RIPPLE_SPECTRUM = Array.from({ length: 40 }, (_, i) => ({
    freq: i * 10,
    amp: (i === 15 ? 85 : i === 30 ? 42 : Math.random() * 20) + 10,
    threshold: 60
}));

export const SteeringPumpActuatorPmView: React.FC = () => {
    const [pumpEff, setPumpEff] = useState(0.92);
    const [isXray, setIsXray] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    const handleDiagnostic = () => {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 3000);
    };

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：高精动力监控看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.2)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        <Zap className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            舵机液压泵与执行机构劣化预测
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>所属系统: 操舵动力单元 (HPU)</span>
                            <span>核心模型: Fluid-Mechanics-AI v4.2</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">系统可用度 (Availability)</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            88.4<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">主泵容积效率预测</div>
                        <div className="text-3xl font-mono font-bold text-emerald-400 tracking-tighter">92.5%</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：液压泵深度诊断 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 泵效博弈图 */}
                    <SciFiCard title="双泵容积效率衰减博弈" subtitle="EFFICIENCY DECAY" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={PUMP_EFF_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[80, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Line type="monotone" dataKey="pump1" stroke="#0ea5e9" strokeWidth={2} name="#1 主泵" dot={false} />
                                    <Line type="monotone" dataKey="pump2" stroke="#f59e0b" strokeWidth={2} name="#2 备泵" dot={false} />
                                    <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="5 5" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                             <span>劣化率 (D-Rate)</span>
                             <span className="text-orange-400 font-mono">+0.14% / 100h</span>
                        </div>
                    </SciFiCard>

                    {/* 压力脉动分析 */}
                    <SciFiCard title="泵出口压力脉动谱" subtitle="PRESSURE RIPPLE">
                        <div className="h-44 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={RIPPLE_SPECTRUM}>
                                    <defs>
                                        <linearGradient id="ripGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="freq" hide />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                    <Area type="monotone" dataKey="amp" stroke="#0ea5e9" fill="url(#ripGrad)" strokeWidth={2} name="能级 (dB)" />
                                    <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="5 5" label={{value:'气蚀线', fill:'#ef4444', fontSize:8}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-[10px] text-center text-slate-500 uppercase mt-1">
                             特征匹配: <span className="text-rose-400 font-bold">泵柱塞早期点蚀指纹 (Matched 82%)</span>
                        </div>
                    </SciFiCard>

                    {/* AI 专家诊断 */}
                    <SciFiCard title="AI 劣化机理推演" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed italic">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold uppercase">推演简报:</span> 监测到 #1 主泵在高压工况下出现非稳态压力脉动。基于流量计残差分析，判定为由于“单向阀回弹滞后”导致的容积效率下降。预计在下个航段，泵组发热量将上升 12%。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">查看主泵轴承声学发射记录</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：全息数字孪生视窗 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">舵机全机理动力学实时仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">系统总压力</span>
                                    <span className="text-white font-mono font-bold">18.5 MPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">执行器推力</span>
                                    <span className="text-emerald-400 font-mono font-bold">1250 kN</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">主泵转速</span>
                                    <span className="text-white font-mono font-bold">1450 RPM</span>
                                </div>
                            </div>
                        </div>

                        {/* 视角切换按钮组 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            <button 
                                onClick={() => setIsXray(!isXray)}
                                className={`px-5 py-2 rounded-sm border text-[10px] font-black uppercase tracking-widest transition-all
                                    ${isXray ? 'bg-cyan-600 border-cyan-400 text-white animate-pulse shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-white'}
                                `}
                            >
                                {isXray ? 'X-Ray Active' : 'Solid View'}
                            </button>
                        </div>

                        <ThreeScene pumpEfficiency={0.92} actuatorHealth={0.85} isXRayMode={isXray} isSimulating={true} />

                        {/* 底部功能区：模拟诊断操作 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex flex-col gap-1 flex-1">
                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    <span>系统压力响应延时 (Response Lag)</span>
                                    <span className="text-cyan-400">Current: 142ms</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
                                    <div className="h-full bg-cyan-500 animate-pulse" style={{width: '78%'}}></div>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <button 
                                    onClick={handleDiagnostic}
                                    disabled={isScanning}
                                    className={`px-10 py-2.5 text-white text-xs font-black rounded shadow-lg transition-all flex items-center gap-2
                                        ${isScanning ? 'bg-slate-700' : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40'}
                                    `}
                                >
                                    {isScanning ? <RefreshCw className="animate-spin" size={14} /> : <ScanLine size={14} />}
                                    {isScanning ? '正在重构压力场...' : '启动压力波谱采集'}
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_15px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 运行电流与功率分析 */}
                    <SciFiCard title="主驱动电机运行能效监控 (24H)" subtitle="POWER ANALYTICS" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={PUMP_EFF_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="pump1" fill="#0ea5e9" fillOpacity={0.1} stroke="#0ea5e9" strokeWidth={2} name="有功功率 (kW)" />
                                    <Line type="monotone" dataKey="pump2" stroke="#f59e0b" strokeWidth={2} dot={false} name="力矩平衡系数" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：执行机构与维保矩阵 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 执行机构摩擦分析 */}
                    <SciFiCard title="执行机构摩擦载荷分布" subtitle="ACTUATOR FRICTION">
                        <div className="h-44 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ACTUATOR_FRICTION} margin={{left: -20, right: 10}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 9}} stroke="#1e293b" />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                    <Bar dataKey="val" radius={[2, 2, 0, 0]} barSize={20}>
                                        {ACTUATOR_FRICTION.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.status === 'warning' ? '#f59e0b' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-rose-500 font-bold text-center">
                             检测到满舵位处存在局部硬摩擦点，疑似密封件老化。
                        </div>
                    </SciFiCard>

                    {/* 实时感知阵列 */}
                    <SciFiCard title="系统感知实时参数" subtitle="STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '补油箱油位', val: '78', unit: '%', status: 'normal' },
                                { label: '液压油电导率', val: '1.24', unit: 'µS', status: 'normal' },
                                { label: '主回路回油温', val: '54.2', unit: '°C', status: 'warning' },
                                { label: '伺服电流偏差', val: '+0.12', unit: 'mA', status: 'normal' },
                                { label: '机械密封压降', val: '4.2', unit: 'bar', status: 'normal' },
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

                    {/* 预测维护建议 */}
                    <SciFiCard title="预测驱动工作包" subtitle="O&M PLAN">
                        <div className="space-y-2">
                            <div className="p-3 bg-rose-950/20 rounded border border-rose-900/50 flex items-center gap-3">
                                <Wrench size={20} className="text-rose-400" />
                                <div>
                                    <div className="text-[10px] text-rose-100 font-bold uppercase">更换主泵轴封件</div>
                                    <div className="text-[9px] text-rose-600 font-bold italic">建议在 150h 停机期执行</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-rose-600" />
                            </div>
                            <div className="p-3 bg-emerald-950/20 rounded border border-emerald-900/50 flex items-center gap-3">
                                <ShieldCheck size={20} className="text-emerald-400" />
                                <div>
                                    <div className="text-[10px] text-emerald-100 font-bold uppercase">液压油滤芯自洁</div>
                                    <div className="text-[9px] text-emerald-600 font-bold italic">已自动调整净化压力 +5%</div>
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
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">终端感知网: 联机正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测模型同步: 15ms 前</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Fluid-AI Engine v4.2.1 - Predictive Guard Active
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
