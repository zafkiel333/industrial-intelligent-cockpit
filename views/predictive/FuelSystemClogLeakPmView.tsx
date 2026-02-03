import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/fuel-clog-leak/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter
} from 'recharts';
import { 
  Droplets, ShieldAlert, Cpu, Activity, Zap, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Binary, BarChart3, Search, ScanLine,
  ZapOff, Flame, Microscope, Radio, HardDrive,
  MonitorPlay, Fingerprint, RefreshCw, AlertTriangle,
  FileText, Activity as ActivityIcon, Volume2, Network,
  // Added missing ShieldCheck import
  ShieldCheck
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 滤器压差预测曲线 (Differential Pressure ΔP in MPa)
const DP_FORECAST = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    actual: i < 16 ? 0.15 + (i * 0.01) + Math.random() * 0.02 : null,
    predicted: 0.15 + (i * 0.01) + (i > 15 ? (i-15)*0.08 : 0),
    limit: 0.45
}));

// 2. 进出口流量平衡分析 (Mass Balance)
const FLOW_BALANCE = Array.from({ length: 40 }, (_, i) => ({
    index: i,
    inlet: 240 + Math.sin(i / 5) * 10,
    outlet: 240 + Math.sin(i / 5) * 10 - (i > 25 ? (i-25) * 1.5 : 0), // 模拟下游泄漏导致的流量丢失
    deviation: i > 25 ? (i-25) * 1.5 : 0
}));

// 3. 声发射泄漏特征指纹 (Acoustic Fingerprint)
const ACOUSTIC_SPECTRUM = [
    { freq: '20kHz (背景)', amp: 15, status: 'normal' },
    { freq: '40kHz (空蚀)', amp: 22, status: 'normal' },
    { freq: '60kHz (紊流)', amp: 45, status: 'warning' },
    { freq: '80kHz (微漏)', amp: 82, status: 'critical' }, // 典型的射流声纹
    { freq: '100kHz (超声)', amp: 35, status: 'normal' },
];

export const FuelSystemClogLeakPmView: React.FC = () => {
    const [riskIndex, setRiskIndex] = useState(72.4);
    const [isLeakActive, setIsLeakActive] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            // 模拟检测到泄漏的突发状态
            if (Math.random() > 0.8) {
                setIsLeakActive(true);
                setTimeout(() => setIsLeakActive(false), 4000);
            }
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：流体安全监控看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-rose-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(transparent_50%,rgba(244,63,94,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-rose-600/20 rounded border border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.3)]">
                        <Droplets className="text-rose-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            燃油系统堵塞与泄漏风险预测
                            <span className="text-xs not-italic font-bold bg-rose-900/50 text-rose-300 px-2 py-0.5 rounded border border-rose-800 uppercase">Fluid-Shield Active</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>探测引擎: Pressure-Acoustic-Fusion v3.5</span>
                            <span>测控范围: 供油总管 - 喷油泵入口 | 响应级别: 毫秒级</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">系统瞬时完整性指数</div>
                        <div className={`text-4xl font-mono font-bold ${riskIndex > 70 ? 'text-rose-500' : 'text-emerald-400'} drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]`}>
                            {100 - riskIndex}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">泄露点概率定位</div>
                        <div className="text-3xl font-mono font-bold text-orange-400">Section L-04</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：堵塞特征与压力预测 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 滤器压差预测 */}
                    <SciFiCard title="滤器压差演化预测 (Next 8H)" subtitle="FILTER ΔP" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={DP_FORECAST} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="dpGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="predicted" stroke="#0ea5e9" fill="url(#dpGrad)" strokeWidth={2} strokeDasharray="5 5" name="预测轨迹" />
                                    <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} dot={{r: 3}} name="实测值" />
                                    <ReferenceLine y={0.45} stroke="#ef4444" strokeDasharray="10 5" label={{value: '清洗阈值', fill: '#ef4444', fontSize: 8}} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center text-[10px]">
                            <span className="text-slate-500 uppercase">预计清洗倒计时</span>
                            <span className="text-orange-400 font-bold font-mono">4.5 HRS</span>
                        </div>
                    </SciFiCard>

                    {/* 进出口流量平衡 */}
                    <SciFiCard title="进出口质量平衡动态分析" subtitle="MASS BALANCE">
                        <div className="h-40 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={FLOW_BALANCE}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="index" hide />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="step" dataKey="inlet" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} name="进端流量" />
                                    <Area type="step" dataKey="outlet" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="出端流量" />
                                    <Area type="monotone" dataKey="deviation" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="缺失偏差" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-slate-500 uppercase">
                             瞬时泄漏流量估算: <span className="text-rose-500 font-bold font-mono">12.5 kg/h</span>
                        </div>
                    </SciFiCard>

                    {/* AI 诊断推演报告 */}
                    <SciFiCard title="AI 专家风险推演" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演报告：</span> 监测到流量缺失与声发射高频信号同步发生。模式识别算法判定为 <span className="text-white font-black underline italic">高压共轨管 B 段微量雾化泄漏</span>。泄漏点疑似由于固定支架振动疲劳导致的焊缝微裂。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-rose-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-rose-400" />
                                    <span className="text-[11px] text-slate-300">查看历史压力降分布指纹</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：全息数字孪生视窗 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 全息视窗 */}
                    <div className="flex-1 relative bg-[#01030a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-rose-500/30">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping shadow-[0_0_10px_rose]"></div>
                                <span className="text-[12px] text-rose-400 font-black tracking-widest uppercase">全系统燃油压力场同步仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">系统平均压力</span>
                                    <span className="text-white font-mono font-bold">120.4 MPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">动态背压波动</span>
                                    <span className="text-rose-500 font-mono font-bold">± 4.2%</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">自愈性评估</span>
                                    <span className="text-emerald-400 font-mono font-bold">STABLE</span>
                                </div>
                            </div>
                        </div>

                        {/* 状态控制与定位 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-3 items-end">
                            <div className="bg-black/60 px-4 py-2 rounded border border-rose-500/30 backdrop-blur">
                                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">泄漏点 Z 轴定位</div>
                                <div className="text-2xl font-mono font-bold text-rose-500">Z +14.25m</div>
                            </div>
                            <button className="px-5 py-2 bg-slate-900 border border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all rounded-sm">
                                <RefreshCw className="inline mr-2" size={14} /> 刷新压力场模型
                            </button>
                        </div>

                        <ThreeScene isAnomalyActive={isLeakActive} />

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex items-center gap-6 flex-1 px-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase">诊断模块</span>
                                    <span className="text-sm font-black text-rose-400">F-CLOG-LEAK v3.5</span>
                                </div>
                                <div className="h-8 w-[1px] bg-slate-800"></div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between text-[9px] text-slate-500 uppercase tracking-widest">全线结构完整性扫描 (Integrity Scan)</div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-600 animate-[pulse_2s_infinite]" style={{width: '68%'}}></div>
                                    </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <button className="px-10 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all flex items-center gap-2">
                                    <Search size={14} /> 调取全息内窥视图
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(225,29,72,0.02)_50%)] bg-[length:100%_15px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 声纹故障特征频谱图表 */}
                    <SciFiCard title="超声波泄漏声纹频谱 (Ultrasound Leak Fingerprint)" subtitle="ACOUSTIC SIGNATURE" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ACOUSTIC_SPECTRUM} margin={{top:20, right:20, bottom:0, left:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="freq" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: '能级 (dB)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Bar dataKey="amp" name="当前能量分布" radius={[2, 2, 0, 0]} barSize={30}>
                                        {ACOUSTIC_SPECTRUM.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.status === 'critical' ? '#ef4444' : entry.status === 'warning' ? '#f59e0b' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：传感器与维护响应 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 系统风险雷达图 */}
                    <SciFiCard title="流体安全综合评估" subtitle="RISK RADAR">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                    { subject: '堵塞风险', A: 45, fullMark: 100 },
                                    { subject: '泄漏概率', A: 82, fullMark: 100 },
                                    { subject: '压力稳定性', A: 32, fullMark: 100 },
                                    { subject: '油质影响因子', A: 55, fullMark: 100 },
                                    { subject: '密封件寿命', A: 78, fullMark: 100 },
                                ]}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                    <Radar name="Status" dataKey="A" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 实时参数感知流 */}
                    <SciFiCard title="传感器实时感知阵列" subtitle="STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '主供油泵压力偏差', val: '0.12', unit: 'MPa', status: 'normal' },
                                { label: '流量二阶残差', val: '4.5', unit: 'kg/h', status: 'warning' },
                                { label: '环境油雾浓度', val: '12', unit: 'ppm', status: 'warning' },
                                { label: '管路冲击能量', val: '1.04', unit: 'Idx', status: 'normal' },
                                { label: '预测模型置信度', val: '98.5', unit: '%', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-rose-500/30 transition-all">
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

                    {/* 预防性响应建议 */}
                    <SciFiCard title="预测性处置方案" subtitle="RESPONSE">
                        <div className="space-y-2">
                            <div className="p-3 bg-rose-950/20 rounded border border-rose-900/50 flex items-center gap-3">
                                {/* Added missing ShieldCheck to fix Cannot find name error */}
                                <ShieldCheck size={20} className="text-rose-400" />
                                <div>
                                    <div className="text-[10px] text-rose-100 font-bold uppercase">Section L-04 紧固作业</div>
                                    <div className="text-[9px] text-rose-600 font-bold tracking-tighter italic">建议在 D+1 停机窗口执行</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-rose-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚状态栏 --- */}
            <div className="h-10 bg-rose-950/20 border-t border-rose-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">声发射传感器: 联机正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">风险模型更新: 25ms 前</span>
                    </div>
                </div>
                <div className="text-[10px] text-rose-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Fluid-Integrity Core v3.5.2 - Prognostic Shield Active
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