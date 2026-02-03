
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/salt-spray/ThreeScene';
import { CorrosionViewMode } from '../../../components/predictive/salt-spray/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, Scatter, ScatterChart,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend
} from 'recharts';
import { 
  Droplets, Wind, Activity, Zap, AlertOctagon, 
  TrendingUp, Anchor, Compass, Gauge, Umbrella,
  CloudRain, AlertTriangle, ShieldAlert, Thermometer,
  Layers, Beaker, Hexagon, Fingerprint, Clock
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 腐蚀速率演化 (Corrosion Rate over Years)
const CORROSION_RATE_DATA = Array.from({ length: 20 }, (_, i) => {
    const year = i;
    // Exponential growth phase followed by steady state
    const rate = year < 5 ? 0.05 + year * 0.02 : 0.15 + Math.log(year-4) * 0.05;
    return { year, rate: rate.toFixed(3), limit: 0.3 };
});

// 2. 电化学噪声谱 (Electrochemical Noise)
const ECN_DATA = Array.from({ length: 50 }, (_, i) => ({
    time: i,
    current: Math.random() * 10 - 5 + (Math.sin(i/5)*2), // nA
    potential: -600 + Math.random() * 20 // mV
}));

// 3. 涂层阻抗谱 (EIS - Nyquist Plot Approx)
const EIS_DATA = Array.from({ length: 30 }, (_, i) => {
    const r = 100 - i * 3;
    const x = Math.sqrt(2500 - Math.pow(r-50, 2)) * (0.5 + Math.random()*0.1);
    return { z_real: r, z_imag: x };
});

// 4. 环境腐蚀性雷达
const ENV_RISK_RADAR = [
    { subject: 'Cl- 沉降率', A: 95, fullMark: 100 },
    { subject: '相对湿度', A: 88, fullMark: 100 },
    { subject: '表面润湿时间', A: 92, fullMark: 100 },
    { subject: '二氧化硫', A: 30, fullMark: 100 },
    { subject: '温度循环', A: 75, fullMark: 100 },
];

export const HighSaltCorrosionPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<CorrosionViewMode>('visual-surface');
    const [exposureYears, setExposureYears] = useState(3.5);
    const [saltDensity, setSaltDensity] = useState(0.8);
    const [healthIndex, setHealthIndex] = useState(85.4);

    // Dynamic Simulation
    useEffect(() => {
        // Recalculate health based on exposure
        const decay = Math.pow(exposureYears, 1.2) * 2.5;
        setHealthIndex(Math.max(0, 100 - decay));
    }, [exposureYears]);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#050a05]">
            
            {/* --- 顶部：腐蚀实验室看板 --- */}
            <div className="flex justify-between items-center bg-[#0a150a]/90 border-b border-lime-500/30 p-4 relative overflow-hidden">
                {/* 动态酸性烟雾背景 */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(132,204,22,0.2)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-lime-600/20 rounded border border-lime-500/50 shadow-[0_0_25px_rgba(132,204,22,0.4)]">
                        <Beaker className="text-lime-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            高盐雾环境设备腐蚀失效预测
                            <span className="text-xs not-italic font-bold bg-lime-900/50 text-lime-300 px-2 py-0.5 rounded border border-lime-800 uppercase">C5-M MARINE</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Droplets size={12}/> 盐雾沉降: {saltDensity * 50} ml/80cm²/h</span>
                            <span className="flex items-center gap-1"><Clock size={12}/> 暴露时间: {exposureYears} Years</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">材料完整性指数 (MII)</div>
                        <div className={`text-4xl font-mono font-bold ${healthIndex < 60 ? 'text-red-500' : healthIndex < 80 ? 'text-orange-400' : 'text-lime-400'} drop-shadow-[0_0_10px_rgba(132,204,22,0.5)]`}>
                            {healthIndex.toFixed(1)}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">平均腐蚀速率</div>
                        <div className="text-3xl font-mono font-bold text-white tracking-tighter">0.12 <span className="text-sm text-slate-500">mm/a</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：环境与微观电化学 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 环境监测 */}
                    <SciFiCard title="环境腐蚀应力场 (Environmental Stress)" subtitle="REAL-TIME" highlight className="bg-[#0b120b]">
                        <div className="grid grid-cols-2 gap-3 py-2">
                            <div className="bg-lime-900/10 border border-lime-800/30 p-2 rounded flex flex-col items-center">
                                <span className="text-[10px] text-lime-400 uppercase font-bold">Cl- 浓度</span>
                                <span className="text-xl font-bold text-white">2.4 <span className="text-xs">mg/m³</span></span>
                            </div>
                            <div className="bg-lime-900/10 border border-lime-800/30 p-2 rounded flex flex-col items-center">
                                <span className="text-[10px] text-lime-400 uppercase font-bold">相对湿度 RH</span>
                                <span className="text-xl font-bold text-white">92 <span className="text-xs">%</span></span>
                            </div>
                            <div className="bg-lime-900/10 border border-lime-800/30 p-2 rounded flex flex-col items-center">
                                <span className="text-[10px] text-lime-400 uppercase font-bold">表面润湿 TOW</span>
                                <span className="text-xl font-bold text-white">6,400 <span className="text-xs">h/y</span></span>
                            </div>
                            <div className="bg-lime-900/10 border border-lime-800/30 p-2 rounded flex flex-col items-center">
                                <span className="text-[10px] text-lime-400 uppercase font-bold">温度</span>
                                <span className="text-xl font-bold text-white">28.5 <span className="text-xs">°C</span></span>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 电化学噪声 */}
                    <SciFiCard title="电化学噪声指纹 (ECN)" subtitle="LOCALIZED CORROSION">
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={ECN_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2e05" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis yAxisId="curr" hide domain={[-10, 10]} />
                                    <YAxis yAxisId="pot" orientation="right" hide domain={[-650, -550]} />
                                    <Tooltip contentStyle={{backgroundColor: '#050a05', border: '1px solid #3f6212'}} />
                                    <Line yAxisId="curr" type="monotone" dataKey="current" stroke="#a3e635" strokeWidth={1} dot={false} name="电流波动 (nA)" />
                                    <Line yAxisId="pot" type="monotone" dataKey="potential" stroke="#f97316" strokeWidth={1} dot={false} name="电位波动 (mV)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                             <span className="flex items-center gap-1 text-lime-400"><Activity size={10}/> 亚稳态点蚀活跃</span>
                             <span>定位指数: 0.82</span>
                        </div>
                    </SciFiCard>

                    {/* 腐蚀因子雷达 */}
                    <SciFiCard title="腐蚀诱因权重" subtitle="RISK FACTOR" className="flex-1">
                        <div className="h-full w-full min-h-[160px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={ENV_RISK_RADAR}>
                                    <PolarGrid stroke="#1a2e05" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#4d7c0f', fontSize: 10 }} />
                                    <Radar name="Risk" dataKey="A" stroke="#84cc16" fill="#84cc16" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：腐蚀演化孪生 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 腐蚀演化视窗 */}
                    <div className="flex-1 relative bg-[#010200] border border-lime-900/50 rounded-3xl overflow-hidden shadow-[inset_0_0_100px_rgba(20,83,45,0.4)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-lime-500/30">
                                <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse shadow-[0_0_10px_lime]"></div>
                                <span className="text-[12px] text-lime-400 font-black tracking-widest uppercase">腐蚀形貌时间演化仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-lime-900 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大点蚀深度</span>
                                    <span className={`font-mono font-bold ${healthIndex < 70 ? 'text-red-500' : 'text-white'}`}>
                                        {(exposureYears * 0.12).toFixed(2)} mm
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">涂层鼓泡面积</span>
                                    <span className="text-orange-400 font-mono font-bold">
                                        {(Math.pow(exposureYears, 2) * 0.5).toFixed(1)} %
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">结构强度余量</span>
                                    <span className="text-lime-400 font-mono font-bold">
                                        {(100 - exposureYears * 2).toFixed(1)} %
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 视图切换 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['visual-surface', 'pitting-depth', 'electrochemical'] as CorrosionViewMode[]).map((mode) => (
                                <button 
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === mode ? 'bg-lime-700 border-lime-500 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {mode === 'visual-surface' ? '宏观形貌' : mode === 'pitting-depth' ? '点蚀深度' : '电化学场'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene 
                            corrosionLevel={1 - healthIndex/100} 
                            saltDensity={saltDensity} 
                            viewMode={viewMode} 
                        />

                        {/* 底部交互区：时间机器 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/70 backdrop-blur-xl border border-lime-900 p-4 rounded-2xl">
                             <div className="flex flex-col gap-1 flex-1 px-4">
                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    <div className="flex items-center gap-2 text-lime-400"><Clock size={14}/> 暴露时间推演 (Time Machine)</div>
                                    <span className="text-white font-mono">{exposureYears.toFixed(1)} Years</span>
                                </div>
                                <input 
                                    type="range" min="0" max="10" step="0.1" 
                                    value={exposureYears} 
                                    onChange={(e) => setExposureYears(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-lime-500"
                                />
                                <div className="flex justify-between text-[9px] text-slate-600 uppercase mt-1">
                                    <span>Installation</span>
                                    <span>5 Years</span>
                                    <span>10 Years (EOL)</span>
                                </div>
                             </div>
                        </div>
                        
                        {/* 腐蚀纹理覆盖层 */}
                        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/rust.png')] mix-blend-overlay"></div>
                    </div>

                    {/* 腐蚀速率预测图 */}
                    <SciFiCard title="全生命周期腐蚀速率预测" subtitle="CORROSION MODEL" className="h-[250px] bg-[#0b120b]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={CORROSION_RATE_DATA} margin={{top:10, right:10, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2e05" vertical={false} />
                                    <XAxis dataKey="year" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Years', position: 'insideBottomRight', offset: -5 }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Rate (mm/a)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip contentStyle={{backgroundColor: '#050a05', border: '1px solid #3f6212'}} />
                                    <Area type="monotone" dataKey="rate" stroke="#f97316" fill="url(#rateGrad)" strokeWidth={2} name="腐蚀速率" />
                                    <ReferenceLine y={0.3} stroke="#ef4444" strokeDasharray="5 5" label="结构失效阈值" />
                                    <ReferenceLine x={exposureYears} stroke="#fff" label="Current" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：材料与涂层分析 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 阻抗谱分析 (EIS) */}
                    <SciFiCard title="涂层失效阻抗谱 (EIS)" subtitle="NYQUIST PLOT">
                        <div className="h-48 w-full mt-2 bg-[#050a05] border border-lime-900/30 rounded p-2">
                             <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2e05" />
                                    <XAxis type="number" dataKey="z_real" name="Z'" unit="Ω" stroke="#64748b" tick={{fontSize: 9}} />
                                    <YAxis type="number" dataKey="z_imag" name="-Z''" unit="Ω" stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#050a05'}} />
                                    <Scatter name="Impedance" data={EIS_DATA} fill="#a3e635" line={{stroke: '#a3e635', strokeWidth: 1}} />
                                </ScatterChart>
                             </ResponsiveContainer>
                             <div className="absolute top-2 right-2 text-[9px] text-lime-500">
                                 容抗弧收缩: <span className="text-white font-bold">45% (涂层微孔)</span>
                             </div>
                        </div>
                    </SciFiCard>

                    {/* 挂片腐蚀监测 */}
                    <SciFiCard title="在线挂片监测数据" subtitle="COUPON DATA" className="flex-1">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-lime-900/10 border border-lime-800/30 rounded">
                                <Layers size={20} className="text-lime-500" />
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-200">碳钢挂片 (A3)</span>
                                        <span className="text-[10px] text-orange-400">0.15 mm/a</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full mt-1">
                                        <div className="h-full bg-orange-500" style={{width: '65%'}}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-lime-900/10 border border-lime-800/30 rounded">
                                <Hexagon size={20} className="text-blue-400" />
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-200">铝合金 (5083)</span>
                                        <span className="text-[10px] text-green-400">0.02 mm/a</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full mt-1">
                                        <div className="h-full bg-green-500" style={{width: '15%'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 维护决策 */}
                    <SciFiCard title="腐蚀防护建议" subtitle="PROTECTION">
                        <div className="space-y-2">
                            <div className="p-3 bg-slate-900/80 rounded border border-slate-700 flex items-center gap-3">
                                <Zap size={18} className="text-yellow-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200 font-bold">阴极保护 (ICCP)</div>
                                    <div className="text-[9px] text-slate-500">建议调高输出电流至 2.5A</div>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-900/80 rounded border border-slate-700 flex items-center gap-3">
                                <Fingerprint size={18} className="text-cyan-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200 font-bold">涂层修补</div>
                                    <div className="text-[9px] text-slate-500">法兰连接处建议局部补漆</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚 --- */}
            <div className="h-10 bg-lime-950/20 border-t border-lime-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-lime-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">大气腐蚀监测站: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">点蚀预测精度: ±0.05mm</span>
                    </div>
                </div>
                <div className="text-[10px] text-lime-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Beaker size={12} /> Chemical-Corrosion-Lab v2.1 - Material Science Active
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
