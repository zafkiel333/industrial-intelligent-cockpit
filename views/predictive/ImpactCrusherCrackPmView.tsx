
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/impact/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, BarChart, Bar, Cell, ReferenceLine, ScatterChart, Scatter
} from 'recharts';
import { 
  Activity, Zap, ShieldAlert, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Radar,
  Binary, Search, FileText, Magnet
} from 'lucide-react';

// --- MOCK DATA ---

// Paris Law Crack Growth Prediction (da/dN)
const CRACK_GROWTH_DATA = Array.from({ length: 20 }, (_, i) => ({
    cycles: i * 5000,
    length: 1.2 + Math.pow(1.15, i),
    threshold: 15
}));

// AE (Acoustic Emission) Signal Hits
const AE_HITS = Array.from({ length: 30 }, (_, i) => ({
    time: `${i}s`,
    amplitude: 40 + Math.random() * 20 + (i > 20 ? (i-20)*5 : 0),
    energy: 10 + Math.random() * 10
}));

// Stress Intensity Distribution across blow bars
const STRESS_BLOCKS = [
    { id: 'Bar-1', ki: 12.5, status: 'Normal' },
    { id: 'Bar-2', ki: 18.4, status: 'Warning' },
    { id: 'Bar-3', ki: 11.2, status: 'Normal' },
    { id: 'Bar-4', ki: 10.8, status: 'Normal' },
];

export const ImpactCrusherCrackPmView: React.FC = () => {
    const [crackProb, setCrackProb] = useState(38.5);
    const [safetyMargin, setSafetyMargin] = useState(62);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none">
            
            {/* --- TECH TOP NAV --- */}
            <div className="flex justify-between items-center bg-slate-900/60 border-b border-purple-500/30 pb-4 px-2">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-600/20 rounded-lg border border-purple-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                        <Radar className="text-purple-400 animate-pulse" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white">
                            反击式破碎机转子裂纹预测
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-purple-950/50 border border-purple-800 rounded">分析引擎: Fracture-Core-AI v5</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">检测方法: 声发射 (AE) + 动态应变分析</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-8 items-center pr-4">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">裂纹萌生概率</div>
                        <div className="text-4xl font-mono font-bold text-purple-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]">
                            {crackProb}%
                        </div>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">剩余疲劳寿命 (次)</div>
                        <div className="text-3xl font-mono font-bold text-rose-500">12.5k <span className="text-xs text-slate-600">CYC</span></div>
                    </div>
                </div>
            </div>

            {/* --- CORE GRID LAYOUT --- */}
            <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
                
                {/* LEFT FLANK: Structural Health */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* Stress Intensity Factor */}
                    <SciFiCard title="应力强度因子 K_I" subtitle="STRESS INTENSITY" highlight className="bg-gradient-to-br from-[#1e1b4b] to-[#020617]">
                        <div className="flex flex-col items-center py-4">
                            <div className="relative w-40 h-40">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" stroke="#1e293b" strokeWidth="6" fill="none" />
                                    <circle 
                                      cx="80" cy="80" r="70" stroke="#a78bfa" strokeWidth="10" fill="none" 
                                      strokeDasharray="440" strokeDashoffset={440 - (440 * safetyMargin) / 100}
                                      strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black text-white">{safetyMargin}</span>
                                    <span className="text-[10px] text-purple-400 uppercase tracking-widest">安全裕度</span>
                                </div>
                            </div>
                            <div className="mt-6 w-full space-y-3">
                                <div className="p-2 bg-white/5 rounded border border-white/5 flex justify-between items-center text-xs">
                                    <span className="text-slate-400">当前 K_I Max</span>
                                    <span className="text-white font-mono font-bold">24.5 MPa√m</span>
                                </div>
                                <div className="p-2 bg-white/5 rounded border border-white/5 flex justify-between items-center text-xs">
                                    <span className="text-slate-400">断裂韧性 K_IC</span>
                                    <span className="text-slate-200 font-mono">65.0 MPa√m</span>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* Paris Law Forecast */}
                    <SciFiCard title="裂纹扩展预测模型" subtitle="FATIGUE GROWTH">
                        <div className="h-40 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={CRACK_GROWTH_DATA}>
                                    <defs>
                                        <linearGradient id="colorCrack" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="cycles" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #334155'}} />
                                    <Area type="monotone" dataKey="length" stroke="#f43f5e" fill="url(#colorCrack)" name="裂纹长度 (mm)" />
                                    <ReferenceLine y={15} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '临界线', fill: '#ef4444', fontSize: 10 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-mono tracking-tighter">
                            <span>0 CYC</span>
                            <span className="text-red-400">临界值 15mm</span>
                            <span>100k CYC</span>
                        </div>
                    </SciFiCard>

                    {/* Decision Support */}
                    <SciFiCard title="AI 维保智能决策" subtitle="MAINTENANCE PLAN" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-rose-900/20 border-l-4 border-rose-500 rounded">
                                <div className="text-xs font-bold text-rose-300 flex items-center gap-2 mb-1">
                                    <ShieldAlert size={14} /> 警告: 应力集中
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    监测到#2反击架固定座处声发射撞击能量增强，疑似存在应力腐蚀裂纹。
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-2.5 bg-slate-800 hover:bg-purple-900/40 rounded border border-slate-700 cursor-pointer transition-all group">
                                    <Magnet size={16} className="text-purple-400" />
                                    <div className="flex-1">
                                        <div className="text-[11px] font-bold text-slate-200">执行磁粉检测 (MT)</div>
                                        <div className="text-[9px] text-slate-500">优先级: 高 | 建议日期: 3日内</div>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-600 group-hover:text-white" />
                                </div>
                                <div className="flex items-center gap-3 p-2.5 bg-slate-800 hover:bg-purple-900/40 rounded border border-slate-700 cursor-pointer transition-all group">
                                    <Wrench size={16} className="text-purple-400" />
                                    <div className="flex-1">
                                        <div className="text-[11px] font-bold text-slate-200">转子动平衡校准</div>
                                        <div className="text-[9px] text-slate-500">检测到微量偏心 (12.4g)</div>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-600 group-hover:text-white" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* CENTER COLUMN: Digital Twin Control */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D Structural Explorer */}
                    <div className="flex-1 relative bg-black/50 border border-slate-800 rounded-xl overflow-hidden shadow-[inset_0_0_80px_rgba(0,0,0,1)]">
                        {/* HUD Diagnostics */}
                        <div className="absolute top-6 left-6 z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
                                <div className="bg-black/60 px-3 py-1 rounded border border-rose-500/30">
                                    <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">裂纹疑似区域锁定 (S-05-B)</span>
                                </div>
                            </div>
                            <div className="bg-black/60 p-3 rounded border border-slate-800 backdrop-blur-md space-y-2 w-44">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500">转子转速</span>
                                    <span className="text-white font-mono">485 RPM</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500">机体振速</span>
                                    <span className="text-yellow-400 font-mono">4.2 mm/s</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500">瞬时冲击力</span>
                                    <span className="text-rose-400 font-mono">152 kN</span>
                                </div>
                            </div>
                        </div>

                        {/* Visual Mode Controls */}
                        <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                             <button className="p-2 bg-black/60 border border-slate-700 rounded hover:border-purple-500 transition-colors">
                                <Search size={16} className="text-slate-400" />
                             </button>
                             <button className="p-2 bg-black/60 border border-slate-700 rounded hover:border-purple-500 transition-colors text-purple-400">
                                <Layers size={16} />
                             </button>
                        </div>

                        <ThreeScene crackSeverity={crackProb / 100} />

                        {/* Interactive UI Overlay */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-6 py-2 bg-slate-900/90 border border-purple-500/30 text-purple-400 hover:text-white hover:bg-purple-600 rounded-sm text-[10px] font-bold transition-all flex items-center gap-2">
                                <Binary size={14} /> 波形特征检索
                            </button>
                            <button className="px-6 py-2 bg-purple-600 border border-purple-400 text-white rounded-sm text-[10px] font-bold shadow-[0_0_20px_rgba(167,139,250,0.3)] transition-all flex items-center gap-2">
                                <History size={14} /> 应力场回溯
                            </button>
                        </div>
                        
                        {/* Overlay Scan Line */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(139,92,246,0.03)_50%)] bg-[length:100%_8px] animate-[scan_15s_linear_infinite]"></div>
                    </div>

                    {/* AE Waterfall / Spectrum */}
                    <SciFiCard title="声发射 (AE) 撞击能量监测" subtitle="REAL-TIME ACOUSTIC EMISSION" className="h-[220px] bg-[#080d19]">
                        <div className="w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={AE_HITS}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                                    <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#020617', border: '1px solid #334155'}} />
                                    <Bar dataKey="amplitude" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                                    <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={1} dot={false} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* RIGHT FLANK: Deep Analytics */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* Stress Mapping */}
                    <SciFiCard title="板锤受力强度分布" subtitle="STRUCTURAL LOAD" className="bg-[#0b1221]">
                        <div className="space-y-4">
                            {STRESS_BLOCKS.map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-slate-400 uppercase">{item.id}</span>
                                        <span className={item.status === 'Warning' ? 'text-rose-400' : 'text-purple-300'}>{item.ki} MPa√m</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full transition-all duration-1000 ${item.status === 'Warning' ? 'bg-rose-500 animate-pulse' : 'bg-purple-500'}`}
                                          style={{ width: `${(item.ki / 25) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* AI Neuron Activation */}
                    <SciFiCard title="特征神经网络响应" subtitle="AI INFERENCE" className="flex-1">
                        <div className="flex flex-col h-full">
                            <div className="grid grid-cols-8 gap-1 p-2 bg-slate-950/50 rounded border border-slate-800">
                                {Array.from({length: 40}).map((_, i) => (
                                    <div 
                                      key={i} 
                                      className={`aspect-square rounded-sm transition-all duration-700 ${Math.random() > 0.7 ? 'bg-purple-500 shadow-[0_0_5px_rgba(167,139,250,0.8)]' : 'bg-slate-800'}`}
                                    ></div>
                                ))}
                            </div>
                            <div className="mt-4 p-3 bg-purple-900/10 border border-purple-500/20 rounded">
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain size={16} className="text-purple-400" />
                                    <span className="text-xs font-bold text-slate-200">故障指纹匹配</span>
                                </div>
                                <div className="text-[10px] text-slate-400 leading-relaxed">
                                    当前声学特征与“转子根部疲劳裂纹”历史样本匹配度为 <span className="text-purple-300 font-bold">92.4%</span>。
                                </div>
                            </div>
                            
                            <div className="mt-auto space-y-2 pt-4">
                                <button className="w-full py-2 bg-slate-800 hover:bg-purple-600 text-white text-[10px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                                    <FileText size={12} /> 生成 NDT 无损探伤建议书
                                </button>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* Sensor Sync Status */}
                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500 uppercase">传感器阵列同步</span>
                            <span className="text-green-500 font-bold">ACTIVE</span>
                        </div>
                        <div className="flex gap-1 h-4">
                            {Array.from({length: 12}).map((_, i) => (
                                <div key={i} className="flex-1 bg-green-500/30 rounded-sm"></div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* --- BOTTOM FOOTER: Status Bar --- */}
            <div className="h-10 bg-purple-950/20 border border-purple-500/20 rounded flex items-center px-4 justify-between">
                <div className="flex gap-6 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">边缘计算节点: 正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">数据主干网: 15.2 GB/s</span>
                    </div>
                </div>
                <div className="text-[10px] text-purple-600 font-mono tracking-tighter">
                    STRUCTURAL-SHIELD™ ACTIVATED
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
                    background: #334155;
                    border-radius: 2px;
                }
            `}</style>
        </div>
    );
};
