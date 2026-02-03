
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/steering-rul/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  Timer, Activity, Zap, ShieldAlert, Cpu, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Layers, Waves, Settings, Droplets, 
  Binary, BarChart3, Search, ScanLine, Magnet, 
  Disc, RefreshCw, AlertTriangle, ShieldCheck, 
  History, Info, Microscope, Sliders, Box,
  // Fix: Added missing MonitorPlay import from lucide-react to resolve "Cannot find name 'MonitorPlay'" on line 167
  MonitorPlay
} from 'lucide-react';

// --- 模拟数据生成器 ---

// 1. 寿命衰减轨迹（带置信区间）
const RUL_TRAJECTORY = Array.from({ length: 24 }, (_, i) => {
    const hours = i * 200;
    const base = 100 - Math.pow(i/5, 1.6) * 4;
    return {
        hours,
        health: base,
        upper: Math.min(100, base + 5 + i * 0.5),
        lower: Math.max(0, base - 5 - i * 0.5),
        limit: 40
    };
});

// 2. 关键部件损耗矩阵
const COMPONENT_STACK = [
    { id: 'pump', name: '变量柱塞泵', health: 82, rul: 14500, risk: 'Low', color: '#0ea5e9' },
    { id: 'seal', name: '主油缸密封', health: 48, rul: 3200, risk: 'High', color: '#ef4444' },
    { id: 'bearing', name: '舵柄主轴承', health: 75, rul: 8900, risk: 'Med', color: '#f59e0b' },
    { id: 'oil', name: '液压油品质', health: 91, rul: 2400, risk: 'Low', color: '#10b981' },
];

// 3. 寿命损耗敏感度分析 (影响因子)
const SENSITIVITY_DATA = [
    { subject: '系统压力波', A: 85, fullMark: 100 },
    { subject: '油液颗粒度', A: 42, fullMark: 100 },
    { subject: '机械振动', A: 70, fullMark: 100 },
    { subject: '温度循环', A: 35, fullMark: 100 },
    { subject: '换向频率', A: 92, fullMark: 100 },
];

export const SteeringRulPmView: React.FC = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [loadMode, setLoadMode] = useState<'normal' | 'heavy'>('normal');

    // 提取 3D 组件需要的健康度 Record
    const componentHealth = COMPONENT_STACK.reduce((acc, cur) => {
        acc[cur.id] = cur.health;
        return acc;
    }, {} as Record<string, number>);

    const handleScan = () => {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 4000);
    };

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部 HUD：系统寿命态势 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.2)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-cyan-600/20 rounded-sm border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <Timer className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            舵机关键部件剩余寿命 (RUL) 预测
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>计算引擎: Temporal-Weibull v5.4</span>
                            <span>预测周期: 500ms 实时闭环</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">系统最小剩余寿命 (L-min)</div>
                        <div className="text-4xl font-mono font-bold text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                            3,200 <span className="text-sm">HRS</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">综合可靠度 (Reliability)</div>
                        <div className="text-3xl font-mono font-bold text-cyan-400 tracking-tighter">98.42%</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析区 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：部件寿命堆栈与敏感度 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 部件 RUL 列表 */}
                    <SciFiCard title="部件寿命评估矩阵" subtitle="COMPONENT STACK" highlight className="bg-[#0c1221]">
                        <div className="space-y-5 py-2">
                            {COMPONENT_STACK.map((comp) => (
                                <div key={comp.id} className="group relative cursor-pointer">
                                    <div className="flex justify-between items-end mb-1">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-slate-100">{comp.name}</span>
                                            <span className="text-[9px] text-slate-500 font-mono">PN: {comp.id.toUpperCase()}-X02</span>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-mono font-bold ${comp.health < 60 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`}>
                                                {comp.rul.toLocaleString()} <span className="text-[8px]">h</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                                        <div 
                                            className="h-full transition-all duration-1000" 
                                            style={{ width: `${comp.health}%`, backgroundColor: comp.color }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-2 bg-slate-950 rounded border border-slate-800 text-[10px] text-slate-500">
                           <Info className="inline mr-1" size={10} />
                           * 剩余寿命基于“混合专家模型 (MoE)”结合历史经验与实时载荷计算。
                        </div>
                    </SciFiCard>

                    {/* 损耗驱动因子分析 */}
                    <SciFiCard title="寿命损耗特征敏感度" subtitle="SENSITIVITY">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SENSITIVITY_DATA}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                    <Radar name="Impact" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* AI 诊断深度分析 */}
                    <SciFiCard title="AI 寿命劣化归因报告" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed italic">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold uppercase">诊断简报:</span> 检测到左侧密封组件在 250 Bar 以上高压脉冲时伴随有微量频率漂移，判定为“疲劳微裂纹初期”。
                                预计在 <span className="text-white font-bold underline">180 运行小时</span> 后进入二级劣化期，届时内泄率将提升 12%。
                            </div>
                            <div className="space-y-2">
                                <button className="w-full py-2 bg-slate-800 hover:bg-cyan-600 text-white text-[10px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2 group">
                                    <Microscope size={14} className="text-cyan-400 group-hover:text-white" /> 调取理化分析记录
                                </button>
                                <button className="w-full py-2 bg-slate-800 hover:bg-rose-600 text-white text-[10px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2 group">
                                    <MonitorPlay size={14} className="text-rose-400 group-hover:text-white" /> 查看相似失效案例
                                </button>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D数字孪生与寿命演化轴 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 动力学视窗 */}
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">全机理寿命场实时仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大工作负载</span>
                                    <span className="text-white font-mono font-bold">18.5 MPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前油液温度</span>
                                    <span className="text-orange-400 font-mono font-bold">54.2 °C</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">特征匹配度</span>
                                    <span className="text-emerald-400 font-mono font-bold">96.8%</span>
                                </div>
                            </div>
                        </div>

                        {/* 视角控制与扫描控制 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-3 items-end">
                            <div className="bg-black/60 px-4 py-2 rounded border border-cyan-500/30 backdrop-blur">
                                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">算法置信偏差 (σ)</div>
                                <div className="text-2xl font-mono font-bold text-cyan-400 uppercase tracking-tighter">± 4.2%</div>
                            </div>
                        </div>

                        <ThreeScene componentHealth={componentHealth} isScanning={isScanning} />

                        {/* 底部交互区：工况负荷模拟 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-6 rounded-2xl shadow-2xl">
                             <div className="flex flex-col gap-3 flex-1">
                                <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    <div className="flex items-center gap-2 text-cyan-400"><Sliders size={14}/> 寿命演化载荷模拟 (Load Factor)</div>
                                    <span className={loadMode === 'heavy' ? 'text-rose-500' : 'text-emerald-400'}>{loadMode.toUpperCase()} DUTY CYCLE</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setLoadMode('normal')}
                                        className={`flex-1 py-2 text-[10px] font-bold rounded border transition-all ${loadMode === 'normal' ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'border-slate-700 text-slate-500 hover:text-slate-300'}`}
                                    >
                                        常压巡航 (NORMAL)
                                    </button>
                                    <button 
                                        onClick={() => setLoadMode('heavy')}
                                        className={`flex-1 py-2 text-[10px] font-bold rounded border transition-all ${loadMode === 'heavy' ? 'bg-rose-900/30 border-rose-500 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]' : 'border-slate-700 text-slate-500 hover:text-slate-300'}`}
                                    >
                                        重载恶劣 (HEAVY)
                                    </button>
                                </div>
                             </div>
                             <div className="h-full w-[1px] bg-slate-800 mx-2"></div>
                             <div className="flex items-center gap-3">
                                <button 
                                    onClick={handleScan}
                                    disabled={isScanning}
                                    className={`px-10 h-full text-white text-xs font-black rounded-sm shadow-lg transition-all flex flex-col items-center justify-center gap-2
                                        ${isScanning ? 'bg-slate-700' : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40'}
                                    `}
                                >
                                    {isScanning ? <RefreshCw className="animate-spin" size={16} /> : <ScanLine size={16} />}
                                    <span className="tracking-widest">{isScanning ? '正在重构' : '全系统寿命扫描'}</span>
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_15px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 寿命演化与置信区间图表 */}
                    <SciFiCard title="寿命衰减轨迹预测 (Confidence Band Analysis)" subtitle="RELIABILITY FORECAST" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={RUL_TRAJECTORY} margin={{top:10, right:30, left:0, bottom:0}}>
                                    <defs>
                                        <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="hours" stroke="#64748b" tick={{fontSize: 10}} label={{ value: '服役小时数 (Hrs)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    
                                    {/* 置信区间阴影 */}
                                    <Area type="monotone" dataKey="ci95_high" data={RUL_TRAJECTORY.map(d => ({...d, high: d.upper, low: d.lower}))} stroke="none" fill="#0ea5e9" fillOpacity={0.05} name="95% 置信带" />
                                    
                                    <Area type="monotone" dataKey="health" name="预测健康度 (Mean)" stroke="#0ea5e9" fill="url(#healthGrad)" strokeWidth={3} />
                                    <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '失效报废线', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：传感器流与维保响应 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 能效与成本博弈 */}
                    <SciFiCard title="寿命经济性平衡评估" subtitle="ECONOMY" className="bg-[#0b1221]">
                        <div className="space-y-4 py-2">
                             <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-slate-500 uppercase">劣化引起能耗增量</span>
                                    <span className="text-rose-400 font-mono">+4.2% ΔP</span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500 animate-pulse" style={{width: '65%'}}></div>
                                </div>
                             </div>
                             <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-slate-500 uppercase">预防维护 ROI 预测</span>
                                    <span className="text-emerald-400 font-mono">1:8.5</span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{width: '85%'}}></div>
                                </div>
                             </div>
                        </div>
                    </SciFiCard>

                    {/* 传感器感知实时参数流 */}
                    <SciFiCard title="核心传感器实时流阵列" subtitle="STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '变量泵柱塞振动', val: '2.4', unit: 'mm/s', status: 'normal' },
                                { label: '主油缸密封内泄速率', val: '12.4', unit: 'ml/min', status: 'warning' },
                                { label: '油液含铁磨损量', val: '45', unit: 'ppm', status: 'warning' },
                                { label: '伺服阀响应偏置', val: '0.04', unit: 'ms', status: 'normal' },
                                { label: '系统压力残差系数', val: '0.96', unit: 'Idx', status: 'normal' },
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

                    {/* 维护建议项 */}
                    <SciFiCard title="预测性维保建议" subtitle="ACTIONS">
                        <div className="space-y-2">
                            <div className="p-3 bg-rose-950/20 rounded border border-rose-900/50 flex items-center gap-3 cursor-pointer hover:bg-rose-900/40 transition-all">
                                <Wrench size={20} className="text-rose-400" />
                                <div>
                                    <div className="text-[10px] text-rose-100 font-bold uppercase">主油缸密封件更换</div>
                                    <div className="text-[9px] text-rose-600 font-bold italic text-shadow-glow">风险溢出期: D+14</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-rose-600" />
                            </div>
                            <div className="p-3 bg-emerald-950/20 rounded border border-emerald-900/50 flex items-center gap-3">
                                <ShieldCheck size={20} className="text-emerald-400" />
                                <div>
                                    <div className="text-[10px] text-emerald-100 font-bold uppercase">液压油微克级净化</div>
                                    <div className="text-[9px] text-emerald-600 font-bold italic">已自动调整净化循环泵流速</div>
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
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测引擎: 联机正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">模型误差 (MAE): 12.4h</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Predictive Engine v5.4.1 - Active Asset Protection
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
