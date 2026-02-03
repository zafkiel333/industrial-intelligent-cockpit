
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/winch-gearbox-brake/ThreeScene';
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
  ZapOff, Lock, Unlock, Hammer, Microscope,
  Box, Info, ShieldCheck, Flame, Network,
  // Fix: Added AlertTriangle to the import list to resolve "Cannot find name 'AlertTriangle'" error on line 124
  AlertTriangle
} from 'lucide-react';

// --- 模拟数据 ---

const GEAR_ENERGY_DATA = [
    { freq: '1X 转频', val: 12, status: 'normal' },
    { freq: '啮合频率', val: 45, status: 'normal' },
    { freq: '2X 谐波', val: 18, status: 'normal' },
    { freq: '异常特征频', val: 68, status: 'warning' },
    { freq: '噪底', val: 5, status: 'normal' },
];

const BRAKE_THERMAL_TREND = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    temp: 35 + Math.sin(i/2) * 5 + (i > 16 ? (i-16)*8 : 0),
    pressure: 12.5 + Math.random() * 0.5,
    limit: 85
}));

const RELIABILITY_RADAR = [
    { subject: '齿轮寿命', A: 92, fullMark: 100 },
    { subject: '油液品质', A: 85, fullMark: 100 },
    { subject: '制动余量', A: 74, fullMark: 100 },
    { subject: '热稳定性', A: 68, fullMark: 100 },
    { subject: '响应时间', A: 95, fullMark: 100 },
];

export const WinchGearboxBrakePmView: React.FC = () => {
    const [isBraking, setIsBraking] = useState(false);
    const [gearHealth] = useState(0.85);
    const [brakeWear] = useState(0.34);
    const [rpm, setRpm] = useState(60);

    useEffect(() => {
        const interval = setInterval(() => {
            if(!isBraking) {
                setRpm(60 + Math.sin(Date.now()/5000) * 5);
            } else {
                setRpm(prev => Math.max(0, prev - 2));
            }
        }, 100);
        return () => clearInterval(interval);
    }, [isBraking]);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部 HUD：综合状态中心 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                        <Box className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            绞车减速箱与制动器劣化预测总览
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/30 rounded">
                                监测模态: 动力-制动深度耦合
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                装置编号: WIN-GB-042 | 状态: 运行中
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">传动链健康度</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            {(gearHealth * 100).toFixed(1)}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">制动可靠度</div>
                        <div className="text-4xl font-mono font-bold text-emerald-400">92.4%</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析区 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2 relative">
                
                {/* 左侧：减速箱诊断深度分析 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar z-10">
                    <SciFiCard title="减速箱振动指纹" subtitle="VIB SPECTRUM" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={GEAR_ENERGY_DATA} margin={{top:5, right:5, left:-20, bottom:0}}>
                                    <XAxis dataKey="freq" tick={{fontSize: 9}} stroke="#64748b" />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Bar dataKey="val" radius={[2, 2, 0, 0]}>
                                        {GEAR_ENERGY_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.status === 'warning' ? '#f59e0b' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-orange-950/20 border border-orange-900/30 rounded flex items-center gap-2">
                             <AlertTriangle size={14} className="text-orange-500 animate-pulse" />
                             <span className="text-[10px] text-orange-200">啮合频率旁频带出现能量泄露</span>
                        </div>
                    </SciFiCard>

                    <SciFiCard title="润滑油液物性分析" subtitle="OIL ANALYSIS">
                        <div className="space-y-4 py-2">
                             {[
                                { label: '油液运动粘度', val: '214', unit: 'cSt', status: 'normal' },
                                { label: '金属磨屑含量', val: '45', unit: 'ppm', status: 'warning' },
                                { label: '含水量', val: '0.02%', unit: '', status: 'normal' },
                                { label: '油膜厚度系数', val: '0.94', unit: 'Idx', status: 'normal' },
                             ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-500 uppercase">{item.label}</span>
                                        <span className={item.status === 'warning' ? 'text-orange-400' : 'text-slate-100'}>{item.val} {item.unit}</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full transition-all duration-1000 ${item.status === 'warning' ? 'bg-orange-500' : 'bg-cyan-500'}`} 
                                          style={{ width: `${Math.random() * 40 + 50}%` }}
                                        ></div>
                                    </div>
                                </div>
                             ))}
                        </div>
                    </SciFiCard>

                    <SciFiCard title="AI 专家诊断报告" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-3">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed italic">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold uppercase">诊断简报:</span> 减速箱二级行星架轴承伴随有高频声发射脉冲。匹配度为 <span className="text-white font-bold underline">88.5% 为疲劳点蚀</span>。
                                预测在持续作业 250 小时后，振动能级将提升 2 级。
                            </div>
                            <button className="w-full py-2 bg-slate-800 hover:bg-cyan-600 text-white text-[10px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2 group">
                                <Microscope size={14} className="text-cyan-400 group-hover:text-white" /> 调取铁谱指纹比对
                            </button>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：全息数字孪生视窗 - 核心区域 */}
                <div className="col-span-6 relative h-full flex flex-col gap-4">
                    {/* 3D 动力核心背景 */}
                    <div className="flex-1 relative bg-gradient-to-b from-[#01050a] to-black border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_120px_rgba(0,0,0,1)]">
                        {/* HUD 覆盖层：实时状态 (固定在左侧，不挡中心) */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping shadow-[0_0:10px_cyan]"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">全系统动力学实时仿真扫描</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">工作载荷 (Load)</span>
                                    <span className="text-white font-mono font-bold">124.5 kNm</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前转速 (RPM)</span>
                                    <span className="text-emerald-400 font-mono font-bold">{Math.round(rpm)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">冲击能级 (gE)</span>
                                    <span className="text-orange-400 font-mono font-bold">4.21</span>
                                </div>
                            </div>
                        </div>

                        <ThreeScene gearHealth={gearHealth} rpm={rpm} isBraking={isBraking} />

                        {/* 状态标注图例 (固定在右侧，不挡中心) */}
                        <div className="absolute top-8 right-8 z-10 space-y-2">
                             <div className="bg-black/60 px-4 py-2 rounded border border-rose-500/30 backdrop-blur text-right">
                                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">制动瞬时温升</div>
                                <div className="text-2xl font-mono font-bold text-rose-500 tracking-tighter">{(isBraking ? 142 : 45.2).toFixed(1)} °C</div>
                             </div>
                        </div>

                        {/* 底部功能栏 (浮动托盘模式) */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4 w-[70%] bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-full shadow-2xl">
                             <div className="flex flex-col gap-1 flex-1 px-4">
                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    <span>制动执行模拟 (Action Sim)</span>
                                    <span className={isBraking ? 'text-rose-400 animate-pulse' : 'text-slate-600'}>
                                        {isBraking ? 'BRAKING ACTIVE' : 'SYSTEM IDLE'}
                                    </span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                                    <div className={`h-full transition-all duration-300 ${isBraking ? 'bg-rose-500 shadow-[0_0_10px_red]' : 'bg-cyan-500'}`} style={{width: isBraking ? '100%' : '20%'}}></div>
                                </div>
                             </div>
                             <div className="flex items-center gap-3 pr-4">
                                <button 
                                    onMouseDown={() => setIsBraking(true)}
                                    onMouseUp={() => setIsBraking(false)}
                                    className={`px-8 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2
                                        ${isBraking ? 'bg-rose-600 border-rose-400 text-white animate-pulse' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'}
                                    `}
                                >
                                    {isBraking ? <Lock size={14}/> : <Unlock size={14}/>} 模拟制动试验
                                </button>
                                <button className="p-2.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg transition-all active:scale-95">
                                    <ScanLine size={20} />
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 下方：制动过程热工分析图表 */}
                    <SciFiCard title="制动瞬态热平衡与压力波形 (24H)" subtitle="TRANSIENT ANALYSIS" className="h-[220px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={BRAKE_THERMAL_TREND} margin={{top:10, right:30, left:0, bottom:0}}>
                                    <defs>
                                        <linearGradient id="heatGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Area type="monotone" dataKey="temp" name="制动盘温度 (°C)" stroke="#f43f5e" fill="url(#heatGrad)" strokeWidth={2} />
                                    <Line type="monotone" dataKey="pressure" name="油路背压 (MPa)" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                                    <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '超温门限', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：综合健康与维保矩阵 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar z-10">
                    
                    <SciFiCard title="系统综合可靠度评价" subtitle="RELIABILITY RADAR">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RELIABILITY_RADAR}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                    <Radar name="Status" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    <SciFiCard title="实时感知参数矩阵" subtitle="STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '各级齿轮合能', val: '4.2', unit: 'gE', status: 'normal' },
                                { label: '制动响应延时', val: '245', unit: 'ms', status: 'warning' },
                                { label: '液压泵源脉动', val: '0.04', unit: 'MPa', status: 'normal' },
                                { label: '闸瓦剩余厚度', val: '12.4', unit: 'mm', status: 'warning' },
                                { label: '能效损失系数', val: '0.92', unit: 'Idx', status: 'normal' },
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

                    <SciFiCard title="预测驱动维保序列" subtitle="ACTIONS">
                        <div className="space-y-2">
                            <div className="p-3 bg-rose-950/20 rounded border border-rose-900/50 flex items-center gap-3 cursor-pointer hover:bg-rose-900/40 transition-all">
                                <Wrench size={20} className="text-rose-400" />
                                <div>
                                    <div className="text-[10px] text-rose-100 font-bold uppercase">调整制动瓦间隙</div>
                                    <div className="text-[9px] text-rose-600 font-bold italic">建议在 D+3 停机期执行</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-rose-600" />
                            </div>
                            <div className="p-3 bg-emerald-950/20 rounded border border-emerald-900/50 flex items-center gap-3">
                                <ShieldCheck size={20} className="text-emerald-400" />
                                <div>
                                    <div className="text-[10px] text-emerald-100 font-bold uppercase">齿轮油二级精滤</div>
                                    <div className="text-[9px] text-emerald-600 font-bold italic">已自动调整净化流速</div>
                                </div>
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
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测模型同步: 25ms 前</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Kinetic-Dynamics Engine v8.4.1 - Active Protection Active
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
