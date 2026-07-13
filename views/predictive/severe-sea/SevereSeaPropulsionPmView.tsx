
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/severe-sea/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-70]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-70';
import { SeaRiskViewMode } from '../../../components/predictive/severe-sea/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, Scatter, ScatterChart,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend
} from 'recharts';
import { 
  Waves, Wind, Activity, Zap, AlertOctagon, 
  TrendingUp, Anchor, Compass, Gauge, Umbrella,
  CloudLightning, AlertTriangle, ShieldAlert, Thermometer,
  RotateCw, Navigation
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 推进器飞车特征 (Propeller Racing Signature)
// Torque drops, RPM spikes
const RACING_DATA = Array.from({ length: 60 }, (_, i) => {
    const t = i / 10;
    const isRacing = t > 3 && t < 4.5;
    return {
        time: t.toFixed(1),
        rpm: 90 + (isRacing ? 35 * Math.sin((t-3)*Math.PI) : Math.random() * 2),
        torque: 85 - (isRacing ? 50 * Math.sin((t-3)*Math.PI) : Math.random() * 5),
        rpmLimit: 110
    };
});

// 2. 运行包络图 (Engine Operating Envelope)
// X: RPM, Y: Power/Torque
const ENVELOPE_DATA = Array.from({ length: 20 }, (_, i) => ({
    rpm: 60 + i * 2,
    power: Math.pow((60 + i*2)/100, 3) * 100, // Propeller curve
    limit_surge: Math.pow((60 + i*2)/100, 3) * 120, // Surge line
    limit_torque: 110 // Torque limit
}));
const CURRENT_OP_POINT = [{ rpm: 105, power: 95 }]; // Anomaly point

// 3. 风险概率分布
const RISK_DISTRIBUTION = [
    { name: '螺旋桨飞车', prob: 85, impact: 'High' },
    { name: '轴系扭振', prob: 62, impact: 'Med' },
    { name: '主机喘振', prob: 45, impact: 'High' },
    { name: '推力轴承过载', prob: 70, impact: 'Med' },
    { name: '调速器滞后', prob: 30, impact: 'Low' },
];

export const SevereSeaPropulsionPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<SeaRiskViewMode>('propeller-racing');
    const [seaState, setSeaState] = useState(7); // Beaufort
    const [waveHeight, setWaveHeight] = useState(5.5); // m
    const [riskIndex, setRiskIndex] = useState(78.5);

    // Dynamic Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            // Fluctuate wave height slightly
            setWaveHeight(prev => Math.max(0, Math.min(10, prev + (Math.random() - 0.5) * 0.5)));
            // Update risk based on wave
            setRiskIndex(prev => Math.min(100, 40 + waveHeight * 8));
        }, 2000);
        return () => clearInterval(interval);
    }, [waveHeight]);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#050b14]">
            
            {/* --- 顶部：风暴预警指挥板 --- */}
            <div className="flex justify-between items-center bg-[#0a1529]/90 border-b border-blue-500/30 p-4 relative overflow-hidden">
                {/* 动态雨幕背景 */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-red-600/20 rounded border border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.4)] animate-pulse">
                        <CloudLightning className="text-red-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            恶劣海况下推进系统风险预测
                            <span className="text-xs not-italic font-bold bg-red-900/50 text-red-300 px-2 py-0.5 rounded border border-red-800 uppercase">STORM MODE</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Wind size={12}/> 风力: 8级 (Gale)</span>
                            <span className="flex items-center gap-1"><Waves size={12}/> 有效波高: {waveHeight.toFixed(1)}m</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">推进风险指数 (PRI)</div>
                        <div className={`text-4xl font-mono font-bold ${riskIndex > 75 ? 'text-red-500' : 'text-orange-400'} drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]`}>
                            {riskIndex.toFixed(1)}
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">飞车发生概率</div>
                        <div className="text-3xl font-mono font-bold text-yellow-400 tracking-tighter">85% <span className="text-sm text-slate-500">HIGH</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：动态负荷与瞬态响应 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 飞车特征曲线 */}
                    <SciFiCard title="扭矩-转速瞬态响应 (Racing)" subtitle="TRANSIENT LOAD" highlight className="bg-[#0b1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={RACING_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 9}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[0, 140]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="rpm" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} name="RPM" />
                                    <Line type="monotone" dataKey="torque" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Torque %" />
                                    <ReferenceLine y={110} stroke="#f59e0b" strokeDasharray="3 3" label={{value:'Overspeed', fill:'#f59e0b', fontSize:8}} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-red-900/10 border border-red-900/30 rounded flex items-center gap-2">
                             <AlertTriangle size={14} className="text-red-500 animate-pulse" />
                             <span className="text-[10px] text-red-200">检测到螺旋桨出水：转速激增 +25%</span>
                        </div>
                    </SciFiCard>

                    {/* 运行包络限制 */}
                    <SciFiCard title="主机运行包络限制" subtitle="OPERATING ENVELOPE">
                        <div className="h-48 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart margin={{top:10, right:10, left:-20, bottom:10}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="rpm" type="number" domain={[60, 120]} stroke="#64748b" tick={{fontSize: 9}} label={{ value: 'RPM', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                                    <YAxis dataKey="power" type="number" domain={[0, 140]} stroke="#64748b" tick={{fontSize: 9}} label={{ value: 'Power %', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                                    <Area dataKey="limit_surge" data={ENVELOPE_DATA} stroke="none" fill="#ef4444" fillOpacity={0.1} name="Surge Zone" />
                                    <Line dataKey="power" data={ENVELOPE_DATA} stroke="#334155" strokeDasharray="5 5" dot={false} name="Prop Curve" />
                                    <Scatter name="Current" data={CURRENT_OP_POINT} fill="#f59e0b" shape="cross" />
                                </ComposedChart>
                            </ResponsiveContainer>
                            <div className="absolute top-2 right-2 text-[10px] text-orange-400 border border-orange-500/30 px-2 rounded">
                                重负荷区运行
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 风险因子列表 */}
                    <SciFiCard title="实时风险因子评估" subtitle="RISK FACTORS" className="flex-1">
                        <div className="space-y-3">
                            {RISK_DISTRIBUTION.map((item, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[11px]">
                                        <span className="text-slate-300 font-bold">{item.name}</span>
                                        <span className={`font-mono font-bold ${item.impact === 'High' ? 'text-red-500' : item.impact === 'Med' ? 'text-orange-400' : 'text-green-400'}`}>
                                            {item.prob}%
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${item.prob > 70 ? 'bg-red-600' : item.prob > 40 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                                            style={{ width: `${item.prob}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：海况数字孪生 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 暴风雨视窗 */}
                    <div className="flex-1 relative bg-[#010205] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-red-500/30">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping shadow-[0_0_10px_red]"></div>
                                <span className="text-[12px] text-red-400 font-black tracking-widest uppercase">恶劣海况动力响应仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">螺旋桨沉深</span>
                                    <span className={`font-mono font-bold ${waveHeight > 4 ? 'text-rose-500' : 'text-white'}`}>
                                        -0.5 m (Emerging)
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">轴系扭振应力</span>
                                    <span className="text-orange-400 font-mono font-bold">142 MPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">纵摇角度 (Pitch)</span>
                                    <span className="text-white font-mono font-bold">± 4.2°</span>
                                </div>
                            </div>
                        </div>

                        {/* 视角切换 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['hydro-elasticity', 'propeller-racing', 'fatigue-stress'] as SeaRiskViewMode[]).map((mode) => (
                                <button 
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === mode ? 'bg-red-900/80 border-red-500 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {mode === 'hydro-elasticity' ? '流固耦合' : mode === 'propeller-racing' ? '飞车监测' : '疲劳应力'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene waveHeight={waveHeight} shipPitch={waveHeight * 0.1} rpm={90} viewMode={viewMode} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部交互区：海况模拟 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl">
                             <div className="flex flex-col gap-1 flex-1 px-4">
                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    <div className="flex items-center gap-2 text-cyan-400"><Waves size={14}/> 波浪强度模拟 (Wave Height)</div>
                                    <span className="text-white font-mono">{waveHeight.toFixed(1)} m</span>
                                </div>
                                <input 
                                    type="range" min="0" max="10" step="0.5" 
                                    value={waveHeight} 
                                    onChange={(e) => setWaveHeight(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                             </div>
                             <div className="flex items-center gap-3 pr-4 border-l border-slate-700 pl-4">
                                <div className="text-center">
                                    <div className="text-[9px] text-slate-500 uppercase">Beaufort</div>
                                    <div className="text-lg font-bold text-white">{Math.min(12, Math.floor(waveHeight * 1.2))}</div>
                                </div>
                             </div>
                        </div>
                        
                        {/* 雨滴特效覆盖层 (CSS) */}
                        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse"></div>
                    </div>

                    {/* 功率储备图表 */}
                    <SciFiCard title="主机功率储备与海况限制 (Power Reserve)" subtitle="SEA MARGIN" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={Array.from({length:20}, (_,i)=>({
                                    seaState: i/2,
                                    requiredPower: 40 + Math.pow(i, 1.5),
                                    limit: 100
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="seaState" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Sea State (m)', position: 'insideBottomRight' }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Power %', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="requiredPower" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="需求功率" />
                                    <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="5 5" label="扭矩限制" />
                                    <ReferenceLine x={waveHeight} stroke="#fff" label="当前海况" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：决策支持与维护 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 调速器响应 */}
                    <SciFiCard title="调速器(Governor) 动态响应" subtitle="CONTROL LOOP">
                        <div className="flex flex-col gap-3 py-2">
                            <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800">
                                <span className="text-[10px] text-slate-400">油门波动幅度</span>
                                <span className="text-sm font-bold text-orange-400">± 12.5 %</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800">
                                <span className="text-[10px] text-slate-400">负荷限制模式</span>
                                <span className="text-xs font-bold text-cyan-400 bg-cyan-900/20 px-2 py-0.5 rounded">ROUGH SEA</span>
                            </div>
                            <div className="h-24 w-full bg-black/40 rounded border border-slate-800 relative overflow-hidden">
                                {/* Simulated sine wave for fluctuation */}
                                <svg width="100%" height="100%" preserveAspectRatio="none">
                                    <path d="M0,50 Q25,20 50,50 T100,50 T150,50 T200,50" fill="none" stroke="#f59e0b" strokeWidth="2" className="animate-pulse" />
                                </svg>
                                <div className="absolute top-1 right-1 text-[8px] text-slate-500">Fuel Index</div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 应急决策建议 */}
                    <SciFiCard title="应急操控决策建议" subtitle="DECISION SUPPORT" className="flex-1">
                        <div className="space-y-3">
                            <div className="p-3 bg-rose-950/20 rounded border border-rose-900/50 flex items-center gap-3">
                                <Anchor size={20} className="text-rose-400" />
                                <div>
                                    <div className="text-[10px] text-rose-100 font-bold uppercase">建议: 降速至 85 RPM</div>
                                    <div className="text-[9px] text-rose-600 font-bold italic">当前海况下可降低飞车风险 60%</div>
                                </div>
                            </div>
                            <div className="p-3 bg-blue-950/20 rounded border border-blue-900/50 flex items-center gap-3">
                                <Navigation size={20} className="text-blue-400" />
                                <div>
                                    <div className="text-[10px] text-blue-100 font-bold uppercase">建议: 调整航向 +15°</div>
                                    <div className="text-[9px] text-blue-600 font-bold italic">减少纵摇幅度 (Pitch Reduction)</div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-800">
                                <button className="w-full py-2.5 bg-slate-800 hover:bg-orange-600 text-white text-[11px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                                    <ShieldAlert size={14} /> 激活恶劣海况保护模式
                                </button>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 轴系应力状态 */}
                    <SciFiCard title="轴系瞬时应力峰值" subtitle="SHAFT STRESS">
                        <div className="grid grid-cols-2 gap-2">
                             <div className="p-2 bg-slate-900/50 border border-slate-800 rounded">
                                 <div className="text-[9px] text-slate-500">扭转应力</div>
                                 <div className="text-sm font-bold text-white">45 MPa</div>
                             </div>
                             <div className="p-2 bg-slate-900/50 border border-slate-800 rounded">
                                 <div className="text-[9px] text-slate-500">弯曲应力</div>
                                 <div className="text-sm font-bold text-yellow-400">82 MPa</div>
                             </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统状态页脚 --- */}
            <div className="h-10 bg-blue-950/20 border-t border-blue-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">气象传真: 接收中</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">主机保护: 限制模式</span>
                    </div>
                </div>
                <div className="text-[10px] text-blue-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Zap size={12} /> Rough-Sea-Optimization Core v3.0 - Active
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
            `}</style>
        </div>
    );
};
