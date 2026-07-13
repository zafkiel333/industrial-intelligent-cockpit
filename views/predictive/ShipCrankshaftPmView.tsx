
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/ship-crankshaft/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-25]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-25';
import { CrankViewMode } from '../../components/predictive/ship-crankshaft/three-types';
import { 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter, Area
} from 'recharts';
import { 
  Activity, Zap, ShieldCheck, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Wind, Radio, Play, Pause, FastForward, Ship,
  Compass, HardDrive, MonitorPlay, Eye, Microscope
} from 'lucide-react';

const ORBIT_DATA = Array.from({ length: 50 }, (_, i) => {
    const angle = (i / 50) * Math.PI * 2;
    const r = 0.5 + Math.sin(angle * 2) * 0.1 + Math.random() * 0.05;
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
});

const VIB_ORDER_DATA = [
    { order: '3.0阶', amp: 0.12, status: 'normal' },
    { order: '6.0阶', amp: 0.45, status: 'warning' },
    { order: '9.0阶', amp: 0.15, status: 'normal' },
    { order: '12.0阶', amp: 0.08, status: 'normal' }
];

const DEFLECTION_HISTORY = Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}月`,
    val: 0.05 + (i * 0.01) + (i > 8 ? 0.05 : 0),
    limit: 0.15
}));

export const ShipCrankshaftPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<CrankViewMode>('alignment');
    const [healthScore] = useState(82.6);
    const [defLevel] = useState(0.58);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                        <History className="text-cyan-400 animate-spin-slow" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            船舶主机曲轴与主轴承健康监测系统
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/30 rounded">
                                监测模态: 多通道动能映射 (DKM)
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                主机: MAN B&W 6S60ME-C | 负载: 75% MCR
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">曲轴系健康度</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            {healthScore} <span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">主轴承最大偏差</div>
                        <div className="text-3xl font-mono font-bold text-orange-400">+0.12 <span className="text-sm">mm</span></div>
                    </div>
                </div>
            </div>
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    <SciFiCard title="主轴颈轴心轨迹 (Orbit)" subtitle="DE-NDE BALANCE" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis type="number" dataKey="x" hide domain={[-1, 1]} />
                                    <YAxis type="number" dataKey="y" hide domain={[-1, 1]} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#020617'}} />
                                    <Scatter name="Orbit" data={ORBIT_DATA} fill="#0ea5e9" line={{ stroke: '#0ea5e9', strokeWidth: 1.5 }} shape={() => null} />
                                </ScatterChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                <div className="w-24 h-24 rounded-full border border-dashed border-white"></div>
                            </div>
                        </div>
                    </SciFiCard>
                    <SciFiCard title="扭振阶次能量谱分析" subtitle="TORSIONAL FFT">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={VIB_ORDER_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <XAxis dataKey="order" stroke="#64748b" tick={{fontSize: 9}} />
                                    <YAxis hide domain={[0, 1]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Bar dataKey="amp" radius={[2, 2, 0, 0]}>
                                        {VIB_ORDER_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.status === 'warning' ? '#f59e0b' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                    <SciFiCard title="AI 专家诊断结论" subtitle="AI INFERENCE" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded text-[11px] text-blue-100 leading-relaxed">
                                <Brain className="inline mr-2" size={14} />
                                <span className="font-bold">深度解析：</span> 当前 #4 主轴承轨迹呈现明显的非线性偏移，结合润滑油液中 <span className="text-white font-bold underline">Pb/Sn 金属成分</span> 异常增长，判定为轴承白合金层早期疲劳剥落。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">查看轴承座声学超高频特征</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Wrench size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">启动全机对中状态推算</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_cyan]"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">曲轴系结构完整性同步仿真</span>
                            </div>
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前转速</span>
                                    <span className="text-white font-mono font-bold">82.4 RPM</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大循环应力</span>
                                    <span className="text-orange-400 font-mono font-bold">142 MPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">油膜最小厚度</span>
                                    <span className="text-emerald-400 font-mono font-bold">0.08 mm</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['alignment', 'lubrication', 'vibration'] as CrankViewMode[]).map((m) => (
                                <button 
                                    key={m}
                                    onClick={() => setViewMode(m)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === m ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {m === 'alignment' ? '对中' : m === 'lubrication' ? '润滑' : '振动'}
                                </button>
                            ))}
                        </div>
                        <ThreeScene rpm={82} deflectionLevel={defLevel} viewMode={viewMode} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-cyan-600 text-cyan-400 hover:text-white text-xs font-black rounded border border-cyan-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 细节缺陷特征提取
                            </button>
                            <button className="px-10 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center gap-3">
                                <MonitorPlay size={16} /> 仿真模型参数校准
                            </button>
                        </div>
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>
                    <SciFiCard title="曲轴臂距差 (Deflection) 演化趋势" subtitle="STRUCTURAL EVOLUTION" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={DEFLECTION_HISTORY}>
                                    <defs>
                                        <linearGradient id="defGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 0.2]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Area type="monotone" dataKey="val" name="实测臂距差 (mm)" stroke="#0ea5e9" fill="url(#defGrad)" strokeWidth={2} />
                                    <ReferenceLine y={0.15} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '强制校中阈值', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    <SciFiCard title="主轴承温升状态矩阵" subtitle="BEARING TEMP">
                        <div className="grid grid-cols-2 gap-3 py-2">
                            {[1, 2, 3, 4, 5, 6, 7].map(num => (
                                <div key={num} className={`p-2.5 rounded border flex flex-col items-center transition-all ${num === 4 ? 'bg-orange-950/40 border-orange-500 animate-pulse' : 'bg-slate-900/50 border-slate-800'}`}>
                                    <div className="text-[8px] text-slate-500 uppercase tracking-tighter"># {num} 主轴承</div>
                                    <div className={`text-lg font-mono font-bold ${num === 4 ? 'text-orange-400' : 'text-white'}`}>48.2 <span className="text-[10px]">°C</span></div>
                                </div>
                            ))}
                            <div className="p-2.5 rounded border bg-emerald-950/20 border-emerald-900/50 flex flex-col items-center justify-center">
                                <span className="text-[8px] text-emerald-500 uppercase">均衡度</span>
                                <span className="text-sm font-bold text-emerald-400">92%</span>
                            </div>
                        </div>
                    </SciFiCard>
                    <SciFiCard title="主润滑系统感知阵列" subtitle="LUBE STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '主滑油压力 (机前)', val: '0.35', unit: 'MPa', status: 'normal' },
                                { label: '滑油金属磨屑', val: '42', unit: 'ppm', status: 'warning' },
                                { label: '曲轴箱压力', val: '+0.12', unit: 'kPa', status: 'normal' },
                                { label: '扭矩波动率', val: '1.2%', unit: 'Δ', status: 'normal' },
                                { label: '油膜承载余量', val: '0.92', unit: 'Idx', status: 'normal' }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-cyan-500/30 transition-all">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-slate-400 font-bold">{item.label}</span>
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
                    <SciFiCard title="近期维保干预记录" subtitle="LOGS">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">2024-05-12: 完成全机臂距差测量</div>
                                    <div className="text-[9px] text-slate-500">结果: 符合规程 | 误差 &lt; 0.02mm</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>
            </div>
            <div className="h-10 bg-cyan-950/20 border-t border-orange-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">轴系传感器网络: 在线正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测模型同步延迟: 14ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Expert Core v5.1.2 - Dynamic Shaft Shield
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
                .animate-spin-slow {
                    animation: spin 15s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
