
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/heavy-load/ThreeScene';
import { LoadViewMode } from '../../../components/predictive/heavy-load/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie
} from 'recharts';
import { 
  Anchor, Ship, Weight, Wind, Flame, 
  Activity, Gauge, TrendingUp, AlertTriangle, 
  Waves, Thermometer, Clock, Database, 
  ArrowRight, ShieldAlert, Zap
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 负荷-劣化率关联 (Load vs Degradation Rate)
const DEGRADATION_CURVE = Array.from({ length: 20 }, (_, i) => {
    const load = 50 + i * 3; // 50% to 110%
    const wearRate = load < 80 ? 1.0 : Math.pow((load - 70)/20, 2.5); // Exponential wear above 80%
    return { load, wearRate: parseFloat(wearRate.toFixed(2)) };
});

// 2. 实时航行参数流 (Real-time Stream)
const PARAM_STREAM = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    load: 85 + Math.sin(i / 3) * 10 + (i > 16 ? 15 : 0), // Late surge
    temp: 350 + Math.sin(i / 3) * 20 + (i > 16 ? 40 : 0), // Exhaust temp
    vib: 2.5 + (i > 16 ? 1.5 : 0) + Math.random() * 0.5
}));

// 3. 船体应力分布 (Hull Stress - Hogging/Sagging)
const HULL_STRESS = [
    { pos: 'Frame 20 (Bow)', stress: 120, limit: 250 },
    { pos: 'Frame 50', stress: 180, limit: 250 },
    { pos: 'Frame 100 (Mid)', stress: 245, limit: 250 }, // Near limit
    { pos: 'Frame 150', stress: 190, limit: 250 },
    { pos: 'Frame 200 (Stern)', stress: 140, limit: 250 },
];

// 4. 劣化因子雷达
const RISK_FACTORS = [
    { subject: '热负荷', A: 95, fullMark: 100 },
    { subject: '机械磨损', A: 82, fullMark: 100 },
    { subject: '船体疲劳', A: 88, fullMark: 100 },
    { subject: '轴系扭振', A: 65, fullMark: 100 },
    { subject: '污底阻力', A: 40, fullMark: 100 },
];

export const HeavyLoadDegradationPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<LoadViewMode>('structural-stress');
    const [loadPercent, setLoadPercent] = useState(0.92); // 92% MCR
    const [seaState, setSeaState] = useState(6); // Beaufort 6
    const [rulDays, setRulDays] = useState(320);

    // Dynamic Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            // Fluctuations based on sea state
            const variance = (seaState / 10) * 0.05;
            setLoadPercent(prev => Math.min(1.1, Math.max(0.5, prev + (Math.random() - 0.5) * variance)));
            
            // RUL decreases faster at high load
            if (loadPercent > 0.9) {
                setRulDays(prev => Math.max(0, prev - 0.1)); // Accelerated aging
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [seaState, loadPercent]);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020409]">
            
            {/* --- 顶部指挥舰桥 --- */}
            <div className="flex justify-between items-center bg-[#0a1120]/90 border-b border-orange-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.2)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-orange-600/20 rounded-full border border-orange-500/50 shadow-[0_0_25px_rgba(249,115,22,0.3)]">
                        <Weight className="text-orange-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            重载航行工况设备劣化预测
                            <span className="text-xs not-italic font-bold bg-orange-900/50 text-orange-300 px-2 py-0.5 rounded border border-orange-800 uppercase">HEAVY LOAD MODE</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>工况: 满载 (Full Scantling Draft)</span>
                            <span>海况: Beaufort {seaState}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">瞬时劣化加速因子</div>
                        <div className={`text-4xl font-mono font-bold ${loadPercent > 1.0 ? 'text-rose-500 animate-pulse' : 'text-orange-400'} drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]`}>
                            {loadPercent > 0.8 ? ((loadPercent - 0.7) * 4).toFixed(2) : '1.0'}x
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">主机负荷率 (MCR)</div>
                        <div className="text-3xl font-mono font-bold text-white tracking-tighter">{(loadPercent * 100).toFixed(1)}%</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：动力与排放惩罚 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 负荷-劣化曲线 */}
                    <SciFiCard title="负荷-劣化加速曲线" subtitle="WEAR RATE" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={DEGRADATION_CURVE}>
                                    <defs>
                                        <linearGradient id="wearGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="load" stroke="#64748b" tick={{fontSize: 9}} label={{ value: 'Load %', position: 'insideBottomRight', offset: -5 }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} label={{ value: 'Factor', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="wearRate" stroke="#f97316" fill="url(#wearGrad)" strokeWidth={2} name="劣化倍率" />
                                    <ReferenceLine x={loadPercent * 100} stroke="#fff" label={{value: '当前', fill: '#fff', fontSize: 10}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-slate-500">
                             85% MCR 以上运行将导致 <span className="text-orange-400 font-bold">指数级寿命衰减</span>
                        </div>
                    </SciFiCard>

                    {/* 实时参数流 */}
                    <SciFiCard title="动力系统热负荷监测" subtitle="THERMAL LOAD">
                        <div className="h-40 w-full mt-2">
                             <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={PARAM_STREAM}>
                                    <XAxis dataKey="time" hide />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                    <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} name="排气温度" />
                                    <Line type="monotone" dataKey="load" stroke="#fbbf24" strokeWidth={2} dot={false} name="负荷波动" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-between items-center px-2 text-[10px]">
                            <span className="text-red-400 font-bold flex items-center gap-1"><Flame size={12}/> 排温过高预警</span>
                            <span className="text-slate-400">Trend: Rising</span>
                        </div>
                    </SciFiCard>

                    {/* 劣化因子雷达 */}
                    <SciFiCard title="综合劣化因子权重" subtitle="FACTOR ANALYSIS" className="flex-1">
                         <div className="h-full w-full min-h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={RISK_FACTORS}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Risk" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：重载仿真数字孪生 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 视窗 */}
                    <div className="flex-1 relative bg-[#010205] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-orange-500/30">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_orange]"></div>
                                <span className="text-[12px] text-orange-400 font-black tracking-widest uppercase">满载航行结构应力场仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-56">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大弯矩 (BM)</span>
                                    <span className={`font-mono font-bold ${loadPercent > 1.0 ? 'text-rose-500' : 'text-white'}`}>98.2 % Limit</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">螺旋桨滑失率</span>
                                    <span className="text-yellow-400 font-mono font-bold">12.5 %</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">吃水深度 (Draft)</span>
                                    <span className="text-emerald-400 font-mono font-bold">14.8 m</span>
                                </div>
                            </div>
                        </div>

                        {/* 视图切换 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['hydrodynamics', 'structural-stress', 'engine-load'] as LoadViewMode[]).map((mode) => (
                                <button 
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === mode ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {mode === 'hydrodynamics' ? '流体动力' : mode === 'structural-stress' ? '结构应力' : '主机负荷'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene loadPercentage={loadPercent} seaState={seaState} viewMode={viewMode} />

                        {/* 底部交互区：海况与负荷模拟 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex flex-col gap-1 flex-1 px-4">
                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    <div className="flex items-center gap-2 text-cyan-400"><Wind size={14}/> 海况模拟 (Beaufort Scale)</div>
                                    <span className="text-white font-mono">{seaState}</span>
                                </div>
                                <input 
                                    type="range" min="0" max="10" step="1" 
                                    value={seaState} 
                                    onChange={(e) => setSeaState(parseInt(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                             </div>
                             <div className="w-[1px] h-8 bg-slate-700"></div>
                             <div className="flex flex-col gap-1 flex-1 px-4">
                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    <div className="flex items-center gap-2 text-orange-400"><Weight size={14}/> 货物装载率 (Load %)</div>
                                    <span className="text-white font-mono">{(loadPercent*100).toFixed(0)}%</span>
                                </div>
                                <input 
                                    type="range" min="0.5" max="1.2" step="0.05" 
                                    value={loadPercent} 
                                    onChange={(e) => setLoadPercent(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(249,115,22,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 船体应力分布图 */}
                    <SciFiCard title="船体梁纵向应力分布 (Longitudinal Strength)" subtitle="STRESS MONITOR" className="h-[220px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={HULL_STRESS} layout="vertical" margin={{left:20}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                    <XAxis type="number" stroke="#64748b" tick={{fontSize: 9}} domain={[0, 300]} />
                                    <YAxis dataKey="pos" type="category" stroke="#64748b" tick={{fontSize: 10}} width={100} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Bar dataKey="stress" name="当前应力 (MPa)" barSize={15} radius={[0, 4, 4, 0]}>
                                        {HULL_STRESS.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.stress > 240 ? '#ef4444' : entry.stress > 200 ? '#f59e0b' : '#3b82f6'} />
                                        ))}
                                    </Bar>
                                    <ReferenceLine x={250} stroke="#ef4444" strokeDasharray="5 5" label={{value:'许用极限', fill:'#ef4444', fontSize:10}} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：经济性与维保建议 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 能效惩罚评估 */}
                    <SciFiCard title="重载能效惩罚评估" subtitle="SFOC PENALTY">
                        <div className="space-y-4 py-2">
                             <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-slate-500 uppercase">单位燃油消耗率 (SFOC)</span>
                                    <span className="text-rose-400 font-mono">+4.2 g/kWh</span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500" style={{width: '75%'}}></div>
                                </div>
                             </div>
                             <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-slate-500 uppercase">污底阻力增量</span>
                                    <span className="text-amber-400 font-mono">+12.5%</span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500" style={{width: '45%'}}></div>
                                </div>
                             </div>
                        </div>
                        <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded text-center">
                            <div className="text-[10px] text-slate-500 uppercase mb-1">当前航速优化建议</div>
                            <div className="text-lg font-bold text-emerald-400">11.5 Knots <span className="text-xs font-normal text-slate-400">(Eco-Speed)</span></div>
                        </div>
                    </SciFiCard>

                    {/* 预测性维保建议 */}
                    <SciFiCard title="劣化驱动维保建议" subtitle="ACTIONS" className="flex-1">
                        <div className="space-y-3">
                            <div className="p-3 bg-orange-950/20 rounded border border-orange-900/50 flex items-center gap-3">
                                <ShieldAlert size={20} className="text-orange-400" />
                                <div>
                                    <div className="text-[10px] text-orange-100 font-bold uppercase">主机吊缸检查</div>
                                    <div className="text-[9px] text-orange-600 font-bold italic">由于持续超负荷，建议提前 500h 执行</div>
                                </div>
                                <ArrowRight size={14} className="ml-auto text-orange-600" />
                            </div>
                            <div className="p-3 bg-slate-900 rounded border border-slate-800 flex items-center gap-3 opacity-80">
                                <Anchor size={20} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200 font-bold">船体结构探伤</div>
                                    <div className="text-[9px] text-slate-500">重点区域：船中甲板及底部纵骨</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 历史案例 */}
                    <SciFiCard title="相似工况失效案例" subtitle="HISTORY">
                        <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                            <strong className="text-white">Case #H-2021:</strong> 同型船在 Beaufort 7 海况下全速满载航行 72h，导致 #4 缸套拉伤及曲轴箱油雾报警。
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚 --- */}
            <div className="h-10 bg-orange-950/20 border-t border-orange-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">应力监测网: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">负荷预测偏差: 2.4%</span>
                    </div>
                </div>
                <div className="text-[10px] text-orange-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Zap size={12} /> Heavy-Load-Prognostics Core v2.1 - Overload Protection Active
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
