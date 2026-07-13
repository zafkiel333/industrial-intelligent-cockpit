
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/continuous-voyage/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-73]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-73';
import { FatigueViewMode } from '../../../components/predictive/continuous-voyage/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, Scatter, ScatterChart,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, Cell
} from 'recharts';
import { 
  Activity, Clock, Anchor, Zap, AlertTriangle, 
  TrendingUp, Ship, Waves, Brain, History,
  Database, FileText, Target, Hourglass, Search
} from 'lucide-react';

// --- MOCK DATA ---

// 1. S-N 疲劳曲线 (Stress vs Number of cycles)
const SN_CURVE_DATA = Array.from({ length: 50 }, (_, i) => {
    const N = Math.pow(10, 4 + i * 0.1); // 10^4 to 10^9
    // S = C * N^(-1/m)
    const stressLimit = 1000 * Math.pow(N, -0.33); // Slope m=3
    return { n_log: Math.log10(N), stress: stressLimit };
});
const CURRENT_OP_POINT = [{ n_log: 6.5, stress: 150 }]; // Example operating point

// 2. 雨流计数直方图 (Rainflow Counting)
const RAINFLOW_DATA = [
    { range: '0-50 MPa', cycles: 1200000, damage: 0.05 },
    { range: '50-100 MPa', cycles: 450000, damage: 0.15 },
    { range: '100-150 MPa', cycles: 50000, damage: 0.35 }, // Critical zone
    { range: '150-200 MPa', cycles: 2500, damage: 0.25 },
    { range: '>200 MPa', cycles: 100, damage: 0.20 },
];

// 3. 累积损伤趋势 (Cumulative Damage Trend)
const DAMAGE_TREND = Array.from({ length: 30 }, (_, i) => ({
    day: `D+${i}`,
    damage: 0.45 + (i * 0.01) + (i > 20 ? (i-20)*0.005 : 0), // Accelerated at end
    limit: 1.0
}));

// 4. 疲劳风险分布
const FATIGUE_DISTRIBUTION = [
    { subject: '船中底板', A: 85, fullMark: 100 },
    { subject: '艉轴承座', A: 65, fullMark: 100 },
    { subject: '舱口角隅', A: 92, fullMark: 100 }, // High stress concentration
    { subject: '主机基座', A: 55, fullMark: 100 },
    { subject: '首部外板', A: 40, fullMark: 100 },
];

export const ContinuousVoyageFatiguePmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<FatigueViewMode>('cumulative-damage');
    const [accumulatedDamage, setAccumulatedDamage] = useState(0.684);
    const [voyageHours, setVoyageHours] = useState(3450);
    const [currentStress, setCurrentStress] = useState(145); // MPa

    // Simulation Loop
    useEffect(() => {
        const interval = setInterval(() => {
            setVoyageHours(h => h + 1);
            // Stress fluctuation
            setCurrentStress(145 + Math.sin(Date.now()/2000) * 20);
            // Slow damage accumulation
            setAccumulatedDamage(d => Math.min(1.0, d + 0.0001));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020409]">
            
            {/* --- 顶部：疲劳监控指挥板 --- */}
            <div className="flex justify-between items-center bg-[#0a0a1a]/90 border-b border-indigo-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(90deg,transparent_0%,rgba(99,102,241,0.2)_50%,transparent_100%)] animate-[scan_5s_linear_infinite]"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-indigo-600/20 rounded border border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                        <Activity className="text-indigo-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            连续航行工况疲劳失效预测
                            <span className="text-xs not-italic font-bold bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800 uppercase">ENDURANCE MODE</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Ship size={12}/> 航程: 跨太平洋 (Trans-Pacific)</span>
                            <span className="flex items-center gap-1"><Clock size={12}/> 连续运行: {voyageHours} HRS</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Miner 累积损伤度 (D)</div>
                        <div className={`text-4xl font-mono font-bold ${accumulatedDamage > 0.8 ? 'text-red-500 animate-pulse' : 'text-indigo-400'} drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]`}>
                            {accumulatedDamage.toFixed(4)}
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">剩余疲劳寿命</div>
                        <div className="text-3xl font-mono font-bold text-emerald-400 tracking-tighter">1.2 <span className="text-sm text-slate-500">YEARS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：载荷谱与S-N分析 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* S-N 曲线状态 */}
                    <SciFiCard title="结构 S-N 疲劳曲线校核" subtitle="STRESS-LIFE" highlight className="bg-[#0b0b1a]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={SN_CURVE_DATA} margin={{top:10, right:10, left:-20, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="n_log" type="number" domain={[4, 9]} stroke="#64748b" tick={{fontSize: 9}} label={{ value: 'Log(N)', position: 'insideBottom', offset: -5 }} />
                                    <YAxis dataKey="stress" type="number" stroke="#64748b" tick={{fontSize: 9}} domain={[0, 400]} label={{ value: 'Stress (MPa)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Line type="monotone" dataKey="stress" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Fatigue Limit" />
                                    <Scatter data={CURRENT_OP_POINT} fill="#ef4444" shape="cross" name="Current Op" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-slate-500">
                             当前工况点位于疲劳极限下方 (安全区)
                        </div>
                    </SciFiCard>

                    {/* 雨流计数分布 */}
                    <SciFiCard title="载荷谱雨流计数 (Rainflow)" subtitle="LOAD SPECTRUM">
                        <div className="h-40 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={RAINFLOW_DATA} layout="vertical" margin={{left: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="range" type="category" tick={{fill: '#94a3b8', fontSize: 10}} width={70} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #334155'}} />
                                    <Bar dataKey="damage" name="Damage Contribution" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={15}>
                                        {RAINFLOW_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 2 ? '#ef4444' : '#6366f1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-[10px] text-center text-purple-300 mt-1">
                             <AlertTriangle className="inline mr-1" size={10} />
                             100-150 MPa 区间贡献了 35% 的累积损伤
                        </div>
                    </SciFiCard>

                    {/* AI 诊断 */}
                    <SciFiCard title="AI 疲劳状态推演" subtitle="AI INFERENCE" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演报告：</span> 监测到船中 <span className="text-white">#4 货舱角隅</span> 应力集中系数随海况恶化呈非线性增长。
                                预测在持续 7 级海况下航行 48 小时后，微裂纹扩展速率将进入加速期 (II期)。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-purple-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Database size={16} className="text-purple-400" />
                                    <span className="text-[11px] text-slate-300">调取历史航次应力谱数据</span>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D 疲劳数字孪生 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_120px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-indigo-500/30">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shadow-[0_0_10px_indigo]"></div>
                                <span className="text-[12px] text-indigo-400 font-black tracking-widest uppercase">全船结构疲劳场实时仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大应力幅</span>
                                    <span className="text-white font-mono font-bold">{currentStress.toFixed(1)} MPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">应力循环次数</span>
                                    <span className="text-emerald-400 font-mono font-bold">2.45 x 10⁶</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">裂纹扩展速率</span>
                                    <span className="text-rose-500 font-mono font-bold">1.2e-5 mm/cyc</span>
                                </div>
                            </div>
                        </div>

                        {/* 视角切换 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['cumulative-damage', 'crack-propagation', 'stress-cycles'] as FatigueViewMode[]).map((mode) => (
                                <button 
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === mode ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {mode === 'cumulative-damage' ? '损伤累积' : mode === 'crack-propagation' ? '裂纹扩展' : '应力循环'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene fatigueLevel={accumulatedDamage} voyageTime={voyageHours} stressAmplitude={currentStress / 200} viewMode={viewMode} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部交互：航程模拟 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl items-center">
                             <div className="flex-1">
                                 <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">
                                     <span>未来航程疲劳预测 (Voyage Projection)</span>
                                     <span className="text-indigo-400">Target: Rotterdam</span>
                                 </div>
                                 <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                     <div className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500" style={{width: `${accumulatedDamage * 100}%`}}></div>
                                 </div>
                             </div>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(99,102,241,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 累积损伤趋势图 */}
                    <SciFiCard title="疲劳损伤累积趋势预测 (Damage Accumulation)" subtitle="LINEAR/NON-LINEAR MODEL" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={DAMAGE_TREND}>
                                    <defs>
                                        <linearGradient id="dmgGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 1.2]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="damage" stroke="#8b5cf6" fill="url(#dmgGrad)" strokeWidth={3} name="累积损伤度" />
                                    <ReferenceLine y={1.0} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '疲劳失效', fill: '#ef4444', fontSize: 10 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：结构与维保 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 疲劳热点雷达 */}
                    <SciFiCard title="结构疲劳热点分布" subtitle="HOTSPOTS">
                        <div className="h-56 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={FATIGUE_DISTRIBUTION}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Damage" dataKey="A" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 维护建议 */}
                    <SciFiCard title="疲劳寿命管理建议" subtitle="O&M STRATEGY" className="flex-1">
                        <div className="space-y-3">
                            <div className="p-3 bg-yellow-950/20 rounded border border-yellow-900/50 flex items-center gap-3">
                                <Anchor size={20} className="text-yellow-400" />
                                <div>
                                    <div className="text-[10px] text-yellow-100 font-bold uppercase">建议: 调整航速与航向</div>
                                    <div className="text-[9px] text-yellow-600 font-bold italic">降低波浪砰击应力幅值 15%</div>
                                </div>
                            </div>
                            <div className="p-3 bg-indigo-950/20 rounded border border-indigo-900/50 flex items-center gap-3">
                                <Search size={20} className="text-indigo-400" />
                                <div>
                                    <div className="text-[10px] text-indigo-100 font-bold uppercase">关键焊缝探伤检查</div>
                                    <div className="text-[9px] text-indigo-500">建议在 D+5 靠港期间执行</div>
                                </div>
                            </div>
                            <div className="mt-auto pt-4">
                                <button className="w-full py-2.5 bg-slate-800 hover:bg-indigo-600 text-white text-[11px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                                    <FileText size={14} /> 生成结构健康评估报告
                                </button>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚 --- */}
            <div className="h-10 bg-indigo-950/20 border-t border-indigo-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">应力监测网: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">疲劳计算更新: 100ms 前</span>
                    </div>
                </div>
                <div className="text-[10px] text-indigo-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Target size={12} /> Structural-Fatigue-Core v6.2 - Endurance Guard Active
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
