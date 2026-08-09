
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-0]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-0';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ScatterChart, Scatter, ReferenceLine, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, Cell, PieChart, Pie
} from 'recharts';
import { 
  Activity, Zap, ShieldAlert, Cpu, AlertOctagon, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers
} from 'lucide-react';

// --- MOCK DATA ---

// RUL Prediction (Remaining Useful Life)
const RUL_DATA = Array.from({ length: 30 }, (_, i) => ({
    day: i,
    health: 90 - Math.pow(i/5, 1.8),
    confidenceUpper: 95 - Math.pow(i/5, 1.6),
    confidenceLower: 85 - Math.pow(i/5, 2.0)
}));

// Vibration Feature Evolution
const FEATURE_DATA = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    rms: 2.1 + (i > 15 ? (i-15)*0.2 : 0) + Math.random()*0.1,
    kurtosis: 3.2 + (i > 18 ? (i-18)*0.5 : 0) + Math.random()*0.2
}));

// Spectrum analysis (FFT Features)
const SPECTRUM_DATA = [
    { freq: '1X (转频)', amp: 45, status: 'normal' },
    { freq: '2X (二倍频)', amp: 12, status: 'normal' },
    { freq: 'BPFO (外圈)', amp: 38, status: 'warning' },
    { freq: 'BPFI (内圈)', amp: 8, status: 'normal' },
    { freq: 'BSF (滚动体)', amp: 5, status: 'normal' },
];

export const JawCrusherPmView: React.FC = () => {
    const [deteriorationIndex, setDeteriorationIndex] = useState(62.4);
    const [rulDays, setRulDays] = useState(42);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none">
            
            {/* --- TOP HEADER --- */}
            <div className="flex justify-between items-center bg-slate-900/40 border-b border-cyan-500/30 pb-4 px-2">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-600/20 rounded-lg border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        <Cpu className="text-cyan-400 animate-pulse" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-400">
                            颚式破碎机主轴与轴承劣化预测
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest px-2 py-0.5 bg-cyan-950/50 border border-cyan-800 rounded">AI-Model: XGB-Industrial-v4</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Asset-ID: JAW-SHAFT-001</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 items-center">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">健康分值 (Health Score)</div>
                        <div className="text-4xl font-mono font-bold text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                            78.5
                        </div>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">故障概率 (24h)</div>
                        <div className="text-3xl font-mono font-bold text-orange-400">12.4%</div>
                    </div>
                </div>
            </div>

            {/* --- MAIN LAYOUT GRID --- */}
            <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
                
                {/* LEFT FLANK: Feature Extraction & Metrics */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* Deterioration Gauge */}
                    <SciFiCard title="劣化度指数分析" subtitle="D-INDEX" highlight className="bg-gradient-to-b from-slate-900/60 to-[#0b1221]">
                        <div className="flex flex-col items-center py-2">
                            <div className="relative w-40 h-40">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" stroke="#1e293b" strokeWidth="12" fill="none" />
                                    <circle cx="80" cy="80" r="70" stroke="url(#pm_grad)" strokeWidth="12" fill="none" strokeDasharray="440" strokeDashoffset={440 - (440 * deteriorationIndex) / 100} />
                                    <defs>
                                        <linearGradient id="pm_grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="60%" stopColor="#f59e0b" />
                                            <stop offset="100%" stopColor="#ef4444" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-white">{deteriorationIndex}</span>
                                    <span className="text-[10px] text-slate-500 uppercase">劣化水平</span>
                                </div>
                            </div>
                            <div className="mt-4 w-full space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">初期劣化</span>
                                    <span className="text-green-500">正常</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-yellow-500 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                                    <span>中期劣化 (当前状态)</span>
                                    <AlertOctagon size={14} />
                                </div>
                                <div className="flex justify-between text-xs opacity-30">
                                    <span className="text-slate-400">加剧劣化</span>
                                    <span className="text-red-500">严峻</span>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* Vibration Features Area */}
                    <SciFiCard title="振动特征演变" subtitle="TIME DOMAIN">
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={FEATURE_DATA}>
                                    <defs>
                                        <linearGradient id="colorRMS" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="rms" stroke="#0ea5e9" fill="url(#colorRMS)" name="RMS" />
                                    <Line type="monotone" dataKey="kurtosis" stroke="#f59e0b" dot={false} name="峭度" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-slate-500 uppercase font-mono tracking-tighter">
                            <span>00:00</span>
                            <span className="text-orange-500 animate-pulse">检测到脉冲冲击特征</span>
                            <span>24:00</span>
                        </div>
                    </SciFiCard>

                    {/* Diagnostic Intelligence */}
                    <SciFiCard title="AI 专家诊断结论" subtitle="KNOWLEDGE ENGINE" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-red-900/20 border-l-4 border-red-500 rounded-sm">
                                <div className="text-xs font-bold text-red-300 flex items-center gap-2 mb-1">
                                    <ShieldAlert size={14} /> 预警提示
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    通过频域卷积分析，检测到 #2 轴承外圈特征频率点能量异常。排除载荷波动，判定为早期剥落征兆。
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="text-[10px] text-slate-500 uppercase font-bold">建议决策指令</div>
                                <div className="flex items-center gap-3 p-2 bg-slate-800 rounded border border-slate-700 hover:border-cyan-500 cursor-pointer transition-all group">
                                    <Wrench size={16} className="text-cyan-400" />
                                    <span className="text-xs text-slate-200">检查自动润滑系统补给量</span>
                                    <ChevronRight size={14} className="ml-auto text-slate-600 group-hover:text-cyan-400" />
                                </div>
                                <div className="flex items-center gap-3 p-2 bg-slate-800 rounded border border-slate-700 hover:border-cyan-500 cursor-pointer transition-all group">
                                    <Timer size={16} className="text-cyan-400" />
                                    <span className="text-xs text-slate-200">调整下季度大修期备件需求</span>
                                    <ChevronRight size={14} className="ml-auto text-slate-600 group-hover:text-cyan-400" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* CENTER COLUMN: Digital Twin & Prediction */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D Visualizer */}
                    <div className="flex-1 relative bg-black/40 border border-slate-800 rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] group">
                        {/* Top Left HUD */}
                        <div className="absolute top-6 left-6 z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                                <div className="bg-black/60 px-3 py-1 rounded border border-red-500/30">
                                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">故障征兆点锁定</span>
                                </div>
                            </div>
                            <div className="bg-black/60 p-3 rounded border border-slate-800 backdrop-blur-sm space-y-2 w-48">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500">主轴转速</span>
                                    <span className="text-white font-mono font-bold">240 RPM</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500">轴承温升</span>
                                    <span className="text-orange-400 font-mono font-bold">+12.5°C</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500">润滑压力</span>
                                    <span className="text-green-400 font-mono font-bold">0.45 MPa</span>
                                </div>
                            </div>
                        </div>

                        {/* Middle Bottom Controls */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-6 py-2 bg-slate-900/80 hover:bg-cyan-600 text-cyan-400 hover:text-white text-xs font-bold rounded-full border border-cyan-900/50 transition-all flex items-center gap-2">
                                <History size={14} /> 历史回溯模式
                            </button>
                            <button className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-full border border-cyan-400 shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all flex items-center gap-2">
                                <Layers size={14} /> 剥离解构视图
                            </button>
                        </div>

                        <ThreeScene deteriorationLevel={deteriorationIndex / 100} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                        
                        {/* Interactive Scan Line Effect */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.05)_50%)] bg-[length:100%_4px] animate-[scan_10s_linear_infinite]"></div>
                    </div>

                    {/* RUL Chart */}
                    <SciFiCard title="剩余有效寿命预测 (RUL Prediction)" subtitle="LIFECYCLE FORECASTING" className="h-[250px] border-cyan-900/50 bg-[#080d19]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={RUL_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#64748b" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} label={{ value: '预测周期 (天)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="confidenceUpper" stroke="none" fill="url(#colorConfidence)" />
                                    <Area type="monotone" dataKey="confidenceLower" stroke="none" fill="#020617" />
                                    <Area type="monotone" dataKey="health" stroke="#10b981" fill="url(#colorHealth)" strokeWidth={3} />
                                    <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '停机预警线', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* RIGHT FLANK: Spectrum & Environment */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* FFT Characteristic Spectrum */}
                    <SciFiCard title="频域特征谱线" subtitle="FFT ANALYSIS" className="bg-[#0b1221]">
                        <div className="flex flex-col gap-3 h-full">
                            {SPECTRUM_DATA.map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-[10px] uppercase font-bold">
                                        <span className={item.status === 'warning' ? 'text-orange-400' : 'text-slate-400'}>{item.freq}</span>
                                        <span className="text-white">{item.amp} <span className="text-slate-600 font-normal">m/s²</span></span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full transition-all duration-1000 ${item.status === 'warning' ? 'bg-orange-500 animate-pulse' : 'bg-cyan-500'}`} 
                                          style={{ width: `${item.amp}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-4 p-2 bg-slate-950/50 rounded border border-slate-800 flex items-center gap-2">
                                <Brain size={16} className="text-purple-400" />
                                <div className="text-[9px] text-slate-400">
                                    深度学习模型：检测到 86% 的包络谱信号与轴承外圈磨损模型匹配。
                                </div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* Thermal Matrix */}
                    <SciFiCard title="热工趋势监控" subtitle="THERMAL PROFILE">
                        <div className="flex flex-col items-center py-2">
                            <div className="w-full grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="text-[10px] text-slate-500 mb-1">主轴承 A</div>
                                    <div className="text-2xl font-mono text-white">58.4 <span className="text-xs">°C</span></div>
                                    <div className="text-[10px] text-green-500 font-bold">STABLE</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] text-slate-500 mb-1">主轴承 B</div>
                                    <div className="text-2xl font-mono text-orange-400">72.2 <span className="text-xs">°C</span></div>
                                    <div className="text-[10px] text-orange-500 font-bold animate-pulse">RISING</div>
                                </div>
                            </div>
                            <div className="h-24 w-full mt-4 bg-slate-950/80 rounded border border-slate-800 relative overflow-hidden">
                                {/* Simplified Heatmap Simulation */}
                                <div className="absolute inset-0 opacity-40" style={{
                                    backgroundImage: 'radial-gradient(circle at 70% 50%, #f97316 0%, transparent 60%)'
                                }}></div>
                                <div className="flex h-full w-full">
                                    {Array.from({length: 20}).map((_, i) => (
                                        <div key={i} className="flex-1 border-r border-white/5 bg-blue-900/10 h-full"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* Operational Guard */}
                    <SciFiCard title="维护建议列表" subtitle="ACTION PLAN" className="flex-1">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded hover:bg-white/10 transition-colors">
                                <div className="w-1.5 h-10 bg-yellow-500 rounded-full"></div>
                                <div>
                                    <div className="text-xs font-bold text-white">增加润滑频率</div>
                                    <div className="text-[10px] text-slate-500">建议周期：由 8h 缩短至 4h</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded hover:bg-white/10 transition-colors opacity-50">
                                <div className="w-1.5 h-10 bg-slate-700 rounded-full"></div>
                                <div>
                                    <div className="text-xs font-bold text-white">轴承座密封更换</div>
                                    <div className="text-[10px] text-slate-500">预计于 1500 小时大修期执行</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded hover:bg-white/10 transition-colors opacity-50">
                                <div className="w-1.5 h-10 bg-slate-700 rounded-full"></div>
                                <div>
                                    <div className="text-xs font-bold text-white">主轴同轴度检测</div>
                                    <div className="text-[10px] text-slate-500">配合停机时间进行激光校准</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- FOOTER: Global Status Bar --- */}
            <div className="h-10 bg-cyan-950/20 border border-cyan-500/20 rounded flex items-center px-4 justify-between">
                <div className="flex gap-6 items-center">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-[10px] font-bold text-slate-400">EDGE GATEWAY: ONLINE</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                        <span className="text-[10px] font-bold text-slate-400">SENSOR SYNC: 12ms LATENCY</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono">
                    24/7 PREDICTIVE SHIELD ACTIVATED
                </div>
            </div>

            <style>{`
                @keyframes scan {
                    from { background-position: 0 0; }
                    to { background-position: 0 100%; }
                }
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
