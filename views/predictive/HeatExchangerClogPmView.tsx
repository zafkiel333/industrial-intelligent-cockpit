
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/heat-exchanger/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-51]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-51';
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
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Flame, Microscope, Droplet, ArrowRightLeft,
  LayoutGrid, Info, ShieldCheck, Timer as TimerIcon,
  Hourglass, FlaskConical, Beaker
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 传热系数衰减预测 (Heat Transfer Coefficient U - W/m²K)
const EFFICIENCY_DECAY_DATA = Array.from({ length: 30 }, (_, i) => ({
    day: `D+${i}`,
    actual: i < 15 ? 1200 - Math.pow(i/2, 1.3) * 15 + Math.random() * 20 : null,
    predicted: 1200 - Math.pow(i/2, 1.3) * 15 + (i > 14 ? (i-14)*-25 : 0),
    limit: 800
}));

// 2. 管束堵塞概率矩阵 (Tube Bundle Clogging Matrix)
const TUBE_CLOG_MATRIX = Array.from({ length: 16 }, (_, i) => ({
    id: `Bundle-${i+1}`,
    val: Math.random() * 100,
    status: Math.random() > 0.8 ? 'critical' : Math.random() > 0.5 ? 'warning' : 'normal'
}));

// 3. 污垢热阻多因子贡献 (Fouling Factor Rf)
const FOULING_RADAR = [
    { subject: '生物黏泥', A: 85, fullMark: 100 },
    { subject: '碳酸钙结垢', A: 42, fullMark: 100 },
    { subject: '悬浮物沉积', A: 78, fullMark: 100 },
    { subject: '金属腐蚀产物', A: 35, fullMark: 100 },
    { subject: '油脂污染', A: 12, fullMark: 100 },
];

export const HeatExchangerClogPmView: React.FC = () => {
    const [clogRisk, setClogRisk] = useState(62.4);
    const [effFactor, setEffFactor] = useState(0.88);
    const [isXray, setIsXray] = useState(false);
    
    // --- 新增：清洗仿真状态 ---
    const [isCleaning, setIsCleaning] = useState(false);
    const [cleanProgress, setCleanProgress] = useState(0);

    const handleStartCleaning = () => {
        if (isCleaning) return;
        
        setIsCleaning(true);
        setCleanProgress(0);
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 2;
            setCleanProgress(progress);
            
            // 随着清洗进度，动态改善健康指标
            setClogRisk(prev => Math.max(12.5, prev - 1.2)); // 风险降低
            setEffFactor(prev => Math.min(0.98, prev + 0.003)); // 效率提升
            
            if (progress >= 100) {
                clearInterval(interval);
                setIsCleaning(false);
                setCleanProgress(0);
            }
        }, 60); // 约 3 秒完成模拟
    };

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：热工效能实时看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        <ArrowRightLeft className="text-cyan-400 rotate-90" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            换热器堵塞与效率衰减预测系统
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/30 rounded">
                                监测模型: Thermal-Fluid-Hybrid v3.5
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                介质: Seawater / Lube Oil | 热负荷: 12.4 MW
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">传热效能指数 (U-Index)</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            {(effFactor * 100).toFixed(1)}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">堵塞预警等级</div>
                        <div className={`text-3xl font-mono font-bold ${clogRisk > 60 ? 'text-rose-500 animate-pulse' : 'text-orange-400'}`}>
                            {clogRisk > 60 ? 'CRITICAL' : 'MODERATE'}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：热阻演化与污垢解析 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 传热系数衰减预测 */}
                    <SciFiCard title="传热系数 (U) 衰减预测轨迹" subtitle="EFFICIENCY DECAY" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={EFFICIENCY_DECAY_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="day" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[600, 1300]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="predicted" stroke="#0ea5e9" fill="url(#effGrad)" strokeWidth={2} strokeDasharray="5 5" name="预测值" />
                                    <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} dot={{r: 3}} name="实测值" />
                                    <ReferenceLine y={800} stroke="#ef4444" strokeDasharray="10 5" label={{value: '清洗阈值', fill: '#ef4444', fontSize: 8}} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500">
                             <span>模型精度: 96.4%</span>
                             <span className={`${clogRisk > 60 ? 'text-orange-400' : 'text-emerald-400'} font-bold uppercase`}>趋势: {clogRisk > 60 ? '加速衰减中' : '运行平稳'}</span>
                        </div>
                    </SciFiCard>

                    {/* 污垢因子雷达 */}
                    <SciFiCard title="污垢热阻因子贡献度" subtitle="FOULING Rf FACTORS">
                        <div className="h-52 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={FOULING_RADAR}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Fouling" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* AI 诊断推演 */}
                    <SciFiCard title="AI 热工机理推演报告" subtitle="AI REASONING" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演报告：</span> 监测到换热器进出口压差 ΔP 在最近 48h 内异常增长 <span className="text-white font-bold underline">12.5%</span>，但温差响应呈现非线性滞后。初步判定为由于海水入口滤网破损导致的大颗粒杂物在管板处发生 <span className="text-white">机械性局部堵塞</span>。
                                预测在持续运行 72h 后，管束流速将突破冲刷极限，面临点蚀穿孔风险。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">查看管内垢层超声扫描图像</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：管束数字孪生与全息扫描 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 换热场视窗 */}
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping shadow-[0_0:10px_cyan]"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">换热管束热应力与结垢同步仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">管束平均流速</span>
                                    <span className="text-white font-mono font-bold">{(2.14 * effFactor / 0.88).toFixed(2)} m/s</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前污垢热阻 Rf</span>
                                    <span className="text-orange-400 font-mono font-bold">{(0.00042 * clogRisk / 62.4).toFixed(5)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">热效率 η</span>
                                    <span className="text-emerald-400 font-mono font-bold">{(effFactor * 100).toFixed(1)}%</span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 animate-pulse" style={{width: `${effFactor * 100}%`}}></div>
                                </div>
                            </div>
                        </div>

                        {/* 状态控制 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-3 items-end">
                            <div className="bg-black/60 px-4 py-2 rounded border border-rose-500/30 backdrop-blur">
                                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">堵塞节点探测</div>
                                <div className={`text-2xl font-mono font-bold ${clogRisk > 30 ? 'text-rose-500' : 'text-emerald-400'}`}>
                                    {clogRisk > 30 ? 'ZONE-B12' : 'CLEAR'}
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsXray(!isXray)}
                                className={`px-5 py-2 rounded-sm border text-[10px] font-black uppercase tracking-widest transition-all
                                    ${isXray ? 'bg-cyan-600 border-cyan-400 text-white animate-pulse shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-500'}
                                `}
                            >
                                {isXray ? 'X-Ray Active' : 'Solid Shell'}
                            </button>
                        </div>

                        <ThreeScene cloggingSeverity={clogRisk / 100} efficiency={effFactor} viewMode={isXray ? 'clogging' : 'thermal'} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部交互区 - 仿真控制 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex flex-col gap-1 flex-1">
                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    <span>结垢层厚度模拟 (Scale Simulation)</span>
                                    <span className="text-orange-400 font-mono">{(clogRisk * 0.05).toFixed(2)} mm</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
                                    <div className="h-full bg-orange-500 animate-pulse" style={{width: `${clogRisk}%`}}></div>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <button 
                                    onClick={handleStartCleaning}
                                    disabled={isCleaning}
                                    className={`px-10 py-2.5 text-white text-xs font-black rounded shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all flex items-center gap-2
                                        ${isCleaning ? 'bg-slate-700 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-500'}
                                    `}
                                >
                                    {isCleaning ? <RefreshCw className="animate-spin" size={14} /> : <FlaskConical size={14} />}
                                    {isCleaning ? `正在清洗... ${cleanProgress}%` : '启动在线化学洗胞模拟'}
                                </button>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 运行压差与热负荷图表 */}
                    <SciFiCard title="运行压差 (ΔP) 与换热负荷关联分析" subtitle="HYDRAULIC-THERMAL COUPLING" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={EFFICIENCY_DECAY_DATA.map((d, i) => ({...d, dp: 0.15 + i*0.02}))} margin={{top:10, right:30, left:0, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} interval={5} />
                                    <YAxis yAxisId="left" stroke="#0ea5e9" tick={{fontSize: 10}} label={{ value: '压差 ΔP (MPa)', angle: -90, position: 'insideLeft', fill: '#0ea5e9', fontSize: 10 }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tick={{fontSize: 10}} label={{ value: '换热负荷 (MW)', angle: 90, position: 'insideRight', fill: '#f43f5e', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Area yAxisId="left" type="monotone" dataKey="dp" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} name="系统总压差" />
                                    <Line yAxisId="right" type="monotone" dataKey="actual" stroke="#f43f5e" strokeWidth={3} dot={{r: 4}} name="实时热负荷" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：管束矩阵与维护决策 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 管束健康热力矩阵 */}
                    <SciFiCard title="管束堵塞概率矩阵" subtitle="TUBE MATRIX">
                        <div className="grid grid-cols-4 gap-1.5 py-2">
                            {TUBE_CLOG_MATRIX.map((cell, i) => {
                                const currentVal = Math.max(10, cell.val * (clogRisk / 62.4));
                                const status = currentVal > 80 ? 'critical' : currentVal > 50 ? 'warning' : 'normal';
                                return (
                                    <div key={i} className={`aspect-square rounded-sm border border-white/5 flex items-center justify-center transition-all relative group
                                        ${status === 'critical' ? 'bg-rose-600 animate-pulse' : status === 'warning' ? 'bg-orange-600' : 'bg-slate-800'}
                                    `}>
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/80 flex items-center justify-center text-[8px] transition-opacity z-10">
                                            {currentVal.toFixed(0)}%
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-2 text-[9px] text-slate-500 uppercase flex justify-between items-center">
                            <span>探测器: Fiber-Optic-X8</span>
                            <span className={`${clogRisk > 30 ? 'text-rose-400' : 'text-emerald-400'} font-bold`}>{clogRisk > 30 ? '02 严重堵塞区' : '全域通畅'}</span>
                        </div>
                    </SciFiCard>

                    {/* 实时感知流阵列 */}
                    <SciFiCard title="流体特性实时监测" subtitle="DATA STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '出口雷诺数 (Re)', val: (12450 * effFactor / 0.88).toFixed(0), unit: '', status: 'normal' },
                                { label: '局部空蚀指数', val: (0.12 * clogRisk / 62.4).toFixed(2), unit: 'Δ', status: clogRisk > 50 ? 'warning' : 'normal' },
                                { label: '牺牲阳极电位', val: '-850', unit: 'mV', status: 'normal' },
                                { label: '污垢层预测厚度', val: (0.42 * clogRisk / 62.4).toFixed(2), unit: 'mm', status: clogRisk > 40 ? 'warning' : 'normal' },
                                { label: '模型拟合残差', val: '0.002', unit: 'Idx', status: 'normal' },
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

                    {/* 维护建议包 */}
                    <SciFiCard title="预测性维护建议" subtitle="O&M PLAN">
                        <div className="space-y-2">
                            <div className="p-3 bg-emerald-950/20 rounded border border-emerald-900/50 flex items-center gap-3">
                                <ShieldCheck size={20} className="text-emerald-400" />
                                <div>
                                    <div className="text-[10px] text-emerald-100 font-bold uppercase">自动反冲洗程序</div>
                                    <div className="text-[9px] text-emerald-600 font-bold italic">建议在 4.2h 后执行，预期效率恢复 15%</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-emerald-600" />
                            </div>
                            <div className="p-3 bg-orange-950/20 rounded border border-orange-900/50 flex items-center gap-3">
                                <Wrench size={20} className="text-orange-400" />
                                <div>
                                    <div className="text-[10px] text-orange-100 font-bold uppercase">化学在线清洗预约</div>
                                    <div className="text-[9px] text-orange-600 font-bold italic">基于 D+18 劣化曲线推演</div>
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
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">中央处理机: 联机正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">数据帧延迟: 12ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> {isCleaning ? 'SIMULATING CHEMICAL REACTION...' : 'Thermal-Fluid Inference Core v3.5.2 - Predictive Integrity Active'}
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
