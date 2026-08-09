
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/exciter/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-4]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-4';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, BarChart, Bar, Cell, ReferenceLine, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  Activity, Zap, ShieldCheck, Cpu, AlertTriangle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, ArrowRightLeft, Radio
} from 'lucide-react';

// --- MOCK DATA ---

// Vibration Orbit (Lissajous Curve)
const ORBIT_DATA = Array.from({ length: 50 }, (_, i) => {
    const angle = (i / 50) * Math.PI * 2;
    return {
        x: Math.cos(angle) * 2 + Math.random() * 0.1,
        y: Math.sin(angle) * 1.8 + Math.random() * 0.1
    };
});

// Bearing Degradation Prediction
const DEGRADATION_DATA = Array.from({ length: 15 }, (_, i) => ({
    week: `W${i+1}`,
    actual: 95 - Math.pow(i/2, 1.5),
    baseline: 95 - i * 1.5
}));

// Lubrication Chemistry
const LUBE_RADAR = [
    { subject: '粘度偏移', A: 85, fullMark: 100 },
    { subject: '金属磨屑', A: 45, fullMark: 100 },
    { subject: '含水量', A: 92, fullMark: 100 },
    { subject: '氧化度', A: 78, fullMark: 100 },
    { subject: '添加剂余量', A: 60, fullMark: 100 },
];

export const ExciterHealthPmView: React.FC = () => {
    const [healthScore, setHealthScore] = useState(82.4);
    const [vibIntensity, setVibIntensity] = useState(0.35);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none">
            
            {/* --- TOP HUD NAV --- */}
            <div className="flex justify-between items-center bg-slate-900/40 border-b border-teal-500/30 pb-4 px-2">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-teal-600/20 rounded-xl border border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                        <Waves className="text-teal-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white">
                            振动筛激振器健康状态评估
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-teal-950/50 border border-teal-800 rounded">
                                诊断引擎: Resonance-Analyzer Pro v4
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5">
                                采样频率: 10.24 kHz
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-8 items-center pr-4">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">综合健康指数</div>
                        <div className="text-4xl font-mono font-bold text-teal-400 drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]">
                            {healthScore}<span className="text-sm font-normal">/100</span>
                        </div>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">预测失效周期</div>
                        <div className="text-3xl font-mono font-bold text-orange-500">1,420 <span className="text-sm">hrs</span></div>
                    </div>
                </div>
            </div>

            {/* --- CONTENT GRID --- */}
            <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
                
                {/* LEFT COLUMN: Dynamic Fingerprints */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* Vibration Orbit Card */}
                    <SciFiCard title="轴心运动轨迹 (Orbit)" subtitle="LISSAJOUS" highlight className="bg-gradient-to-br from-slate-900 to-[#052c2c]">
                        <div className="h-44 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#134e4a" />
                                    <XAxis type="number" dataKey="x" hide domain={[-3, 3]} />
                                    <YAxis type="number" dataKey="y" hide domain={[-3, 3]} />
                                    <Scatter name="Orbit" data={ORBIT_DATA} fill="#2dd4bf" line={{ stroke: '#2dd4bf', strokeWidth: 1 }} shape={() => null} />
                                </ScatterChart>
                            </ResponsiveContainer>
                            {/* Overlay Info */}
                            <div className="absolute bottom-2 right-2 text-[9px] text-teal-500 font-mono">
                                椭圆率: 0.92 (正常)
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <div className="p-2 bg-black/40 border border-teal-900/50 rounded">
                                <div className="text-[9px] text-slate-500 uppercase">振幅 X-Axis</div>
                                <div className="text-sm font-bold text-white">4.25 <span className="text-[10px]">mm</span></div>
                            </div>
                            <div className="p-2 bg-black/40 border border-teal-900/50 rounded">
                                <div className="text-[9px] text-slate-500 uppercase">振幅 Y-Axis</div>
                                <div className="text-sm font-bold text-white">4.18 <span className="text-[10px]">mm</span></div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* Oil Analysis Card */}
                    <SciFiCard title="润滑状态指纹" subtitle="LUBRICATION">
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="60%" data={LUBE_RADAR}>
                                    <PolarGrid stroke="#134e4a" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Lube" dataKey="A" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-teal-900/10 rounded border border-teal-800/30">
                            <div className="flex items-center gap-2 text-[10px] text-teal-300">
                                <Droplets size={14} /> 自动注油泵状态
                            </div>
                            <span className="text-[10px] font-bold text-green-400">NORMAL (42%)</span>
                        </div>
                    </SciFiCard>

                    {/* Sensor Array Status */}
                    <SciFiCard title="边缘感知阵列" subtitle="SENSORS" className="flex-1">
                        <div className="space-y-2">
                            {[
                                { label: '轴承A温度', val: '52.4', unit: '°C', color: 'text-white' },
                                { label: '轴承B温度', val: '74.8', unit: '°C', color: 'text-orange-400 animate-pulse' },
                                { label: '齿轮啮合频率', val: '285', unit: 'Hz', color: 'text-white' },
                                { label: '螺栓预紧力', val: '98%', unit: 'Load', color: 'text-green-400' },
                            ].map((s, i) => (
                                <div key={i} className="flex justify-between items-center p-2 bg-slate-800/40 border border-slate-700 rounded-sm">
                                    <span className="text-[11px] text-slate-400">{s.label}</span>
                                    <span className={`text-xs font-mono font-bold ${s.color}`}>{s.val} {s.unit}</span>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>
                </div>

                {/* CENTER COLUMN: Digital Twin Control */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* Main Stage */}
                    <div className="flex-1 relative bg-black/50 border border-slate-800 rounded-2xl overflow-hidden shadow-[inset_0_0_120px_rgba(0,0,0,1)] group">
                        {/* HUD Elements */}
                        <div className="absolute top-6 left-6 z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-ping"></div>
                                <div className="bg-black/60 px-4 py-1.5 rounded border border-teal-500/30 backdrop-blur-md">
                                    <span className="text-[11px] text-teal-400 font-black uppercase tracking-[0.2em]">动力学平衡监测中</span>
                                </div>
                            </div>
                            <div className="bg-black/40 p-4 rounded border border-slate-800 backdrop-blur-sm space-y-3 w-56">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500">主轴转速</span>
                                    <span className="text-white font-mono font-bold">960 RPM</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500">同步相位差</span>
                                    <span className="text-green-400 font-mono font-bold">0.4°</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500">激振力强度</span>
                                    <span className="text-teal-300 font-mono font-bold">450 kN</span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-teal-500" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                        </div>

                        <ThreeScene intensity={vibIntensity} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* Interactive Overlays */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-8 py-2.5 bg-slate-900/90 hover:bg-teal-600 text-teal-400 hover:text-white text-[11px] font-black rounded-sm border border-teal-900/50 transition-all flex items-center gap-3">
                                <Settings size={16} /> 参数标定
                            </button>
                            <button className="px-8 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-black rounded-sm border border-teal-400 shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-all flex items-center gap-3">
                                <Radio size={16} /> 实时信号提取
                            </button>
                        </div>
                        
                        {/* Scanning Line Effect */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(45,212,191,0.03)_50%)] bg-[length:100%_8px] animate-[scan_12s_linear_infinite]"></div>
                    </div>

                    {/* Prediction Chart */}
                    <SciFiCard title="性能退化与寿命预测 (Health Decay)" subtitle="LSTM-PROGNOSTICS" className="h-[240px] bg-[#051111]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={DEGRADATION_DATA}>
                                    <defs>
                                        <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#134e4a" vertical={false} />
                                    <XAxis dataKey="week" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[50, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #134e4a'}} />
                                    <Area type="monotone" dataKey="actual" stroke="#14b8a6" fill="url(#healthGrad)" strokeWidth={3} name="预测健康度" />
                                    <Line type="monotone" dataKey="baseline" stroke="#475569" strokeDasharray="5 5" dot={false} name="设计基准" />
                                    <ReferenceLine y={75} stroke="#f43f5e" strokeDasharray="10 5" label={{ value: '预防检修线', fill: '#f43f5e', fontSize: 10 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* RIGHT COLUMN: AI Inference & Decision */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* Spectral Entropy Insight */}
                    <SciFiCard title="信号熵特征图谱" subtitle="SPECTRAL ENTROPY" className="bg-[#0b1221]">
                        <div className="flex flex-wrap gap-1.5 p-3 justify-center">
                            {Array.from({length: 40}).map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`w-4 h-4 rounded-full transition-all duration-1000 ${Math.random() > 0.8 ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-teal-900/40'}`}
                                ></div>
                            ))}
                        </div>
                        <div className="mt-4 p-3 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                            <Brain size={20} className="text-teal-400" />
                            <div className="text-[10px] text-slate-400 leading-tight">
                                异常自编码器：检测到 <span className="text-white font-bold">12.5%</span> 的非线性振动噪声增量。
                            </div>
                        </div>
                    </SciFiCard>

                    {/* Decision Support Actions */}
                    <SciFiCard title="维护建议决策" subtitle="MAINTENANCE" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-orange-950/20 border-l-4 border-orange-500 rounded-sm">
                                <div className="text-[11px] font-bold text-orange-300 flex items-center gap-2 mb-2">
                                    <AlertTriangle size={14} /> 紧急干预建议
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    检测到右侧驱动端轴承振速包络值超标，建议在下一停机窗口进行轴承座手动复核及润滑油脂更换。
                                </p>
                            </div>
                            
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center gap-3 p-3 bg-slate-800/60 hover:bg-teal-900/40 rounded border border-slate-700 cursor-pointer transition-all group">
                                    <History size={16} className="text-teal-500" />
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-white">历史同型故障比对</div>
                                        <div className="text-[9px] text-slate-500">匹配度: 89% (轴承疲劳)</div>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-600 group-hover:text-white" />
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-800/60 hover:bg-teal-900/40 rounded border border-slate-700 cursor-pointer transition-all group">
                                    <Settings size={16} className="text-teal-500" />
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-white">动态调速优化建议</div>
                                        <div className="text-[9px] text-slate-500">建议转速: 920 - 980 RPM</div>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-600 group-hover:text-white" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* Impact on Screen Box */}
                    <SciFiCard title="激振效能反馈" subtitle="SCREEN PERFORMANCE">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px]">
                                <span className="text-slate-500">筛箱有效振幅</span>
                                <span className="text-teal-400 font-bold">12.4 mm</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-500" style={{ width: '92%' }}></div>
                            </div>
                            <div className="flex justify-between text-[10px] pt-1">
                                <span className="text-slate-500">筛分效率指数</span>
                                <span className="text-white font-bold">94.5%</span>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- SYSTEM FOOTER --- */}
            <div className="h-10 bg-teal-950/20 border border-teal-500/20 rounded-sm flex items-center px-4 justify-between">
                <div className="flex gap-6 items-center">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_lime]"></span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Status: Optimal</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Edge AI: Connected</span>
                    </div>
                </div>
                <div className="text-[10px] text-teal-700 font-mono tracking-tighter">
                    GUARDIAN-II: EXCITER MONITORING ENGINE v4.12
                </div>
            </div>

            <style>{`
                @keyframes scan {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 100%; }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #134e4a;
                    border-radius: 2px;
                }
            `}</style>
        </div>
    );
};
