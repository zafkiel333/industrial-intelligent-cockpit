
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/crane-trolley/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-65]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-65';
import { TrolleyViewMode } from '../../../components/predictive/crane-trolley/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter
} from 'recharts';
import { 
  Move, Zap, Activity, ShieldAlert, Cpu, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Anchor, Ruler, Scale, Box, Truck
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 轨道平整度与磨损 (Rail Profile)
const RAIL_PROFILE = Array.from({ length: 40 }, (_, i) => ({
    dist: i * 2, // meters
    wear: 0.5 + Math.sin(i / 5) * 0.2 + Math.random() * 0.1, // mm
    deviation: Math.sin(i / 8) * 1.5, // mm
    limit: 2.0
}));

// 2. 钢丝绳断丝信号 (MFL Signal)
const ROPE_MFL_DATA = Array.from({ length: 60 }, (_, i) => ({
    length: i * 5,
    signal: 5 + Math.random() * 2 + (i === 24 ? 45 : 0) + (i === 42 ? 30 : 0),
    threshold: 25
}));

// 3. 车轮状态矩阵
const WHEEL_STATUS = [
    { id: 'FL (前左)', wear: 12.5, vib: 0.4, status: 'normal' },
    { id: 'FR (前右)', wear: 14.2, vib: 0.5, status: 'warning' },
    { id: 'RL (后左)', wear: 11.8, vib: 0.3, status: 'normal' },
    { id: 'RR (后右)', wear: 13.0, vib: 0.4, status: 'normal' },
];

// 4. 起升电机电流特征 (MCSA)
const MOTOR_CURRENT = Array.from({ length: 30 }, (_, i) => ({
    time: i,
    current: 450 + Math.sin(i / 2) * 200 + Math.random() * 20,
    torque: 2200 + Math.sin(i / 2) * 800
}));

export const CraneTrolleyPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<TrolleyViewMode>('mechanical');
    const [healthScore, setHealthScore] = useState(82.5);
    const [riskIndex, setRiskIndex] = useState(0.35);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- TOP HUD --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-orange-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-orange-600/20 rounded border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                        <Move className="text-orange-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            岸桥小车与起升结构劣化预测中心
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-orange-950/50 border border-orange-800/30 rounded">
                                模型: Rail-Rope-Interaction v2.1
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                设备: STS-QC-105 | 载荷: 45t
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">机构健康指数 (MHI)</div>
                        <div className="text-4xl font-mono font-bold text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                            {healthScore}<span className="text-sm">/100</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">小车轨道平整度</div>
                        <div className="text-3xl font-mono font-bold text-emerald-400">Class B</div>
                    </div>
                </div>
            </div>

            {/* --- MAIN GRID --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* LEFT: Rail & Wheel Analysis */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* Rail Profile Chart */}
                    <SciFiCard title="小车轨道磨损与波浪度" subtitle="RAIL PROFILE" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={RAIL_PROFILE} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="dist" stroke="#64748b" tick={{fontSize: 9}} label={{value: 'm', position: 'insideBottomRight'}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="wear" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} name="磨损量(mm)" />
                                    <Line type="monotone" dataKey="deviation" stroke="#f59e0b" strokeWidth={2} dot={false} name="高低偏差(mm)" />
                                    <ReferenceLine y={2} stroke="#ef4444" strokeDasharray="5 5" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-orange-400 font-bold uppercase">
                            检测到 35m-42m 区间波浪度超标 (需打磨)
                        </div>
                    </SciFiCard>

                    {/* Wheel Status Matrix */}
                    <SciFiCard title="车轮组运行状态矩阵" subtitle="WHEEL MATRIX">
                        <div className="space-y-3 py-2">
                            {WHEEL_STATUS.map((w, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[11px] font-bold">
                                        <span className="text-slate-400">{w.id}</span>
                                        <span className={w.status === 'warning' ? 'text-orange-400' : 'text-slate-100'}>{w.wear} mm</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden flex">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${w.status === 'warning' ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                                            style={{ width: `${(w.wear / 20) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[9px] text-slate-600">
                                        <span>Vib: {w.vib} g</span>
                                        <span>{w.status.toUpperCase()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* AI Prognostics */}
                    <SciFiCard title="AI 劣化趋势推演" subtitle="PROGNOSTICS" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演报告：</span> 监测到前右轮 (FR) 轮缘磨损速率异常，结合轨道侧磨数据，判定为 <span className="text-white font-bold underline">车架菱形变形导致的啃轨</span>。
                                建议在 15 天内进行车轮定位校准。
                            </div>
                            <button className="w-full py-2 bg-slate-800 hover:bg-orange-600 text-white text-[10px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                                <Wrench size={12} /> 生成啃轨修复方案
                            </button>
                        </div>
                    </SciFiCard>
                </div>

                {/* CENTER: 3D Digital Twin */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD Overlay */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-orange-500/30">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping shadow-[0_0_10px_orange]"></div>
                                <span className="text-[12px] text-orange-400 font-black tracking-widest uppercase">小车-起升机构联合仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-56">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前行车速度</span>
                                    <span className="text-white font-mono font-bold">3.5 m/s</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">起升钢丝绳张力</span>
                                    <span className="text-emerald-400 font-mono font-bold">220 kN</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">小车架应力峰值</span>
                                    <span className="text-rose-500 font-mono font-bold">142 MPa</span>
                                </div>
                            </div>
                        </div>

                        {/* View Switcher */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['mechanical', 'wear-profile', 'stress-field'] as TrolleyViewMode[]).map((m) => (
                                <button 
                                    key={m}
                                    onClick={() => setViewMode(m)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === m ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {m === 'mechanical' ? '实景' : m === 'wear-profile' ? '磨损' : '应力'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene viewMode={viewMode} wearLevel={riskIndex} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* Bottom Controls */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-orange-600 text-orange-400 hover:text-white text-xs font-black rounded-sm border border-orange-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 钢丝绳断丝定位
                            </button>
                            <button className="px-10 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded-sm border border-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all flex items-center gap-3">
                                <RefreshCw size={16} /> 载荷谱回放
                            </button>
                        </div>
                        
                        {/* Scan Line */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(249,115,22,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* Hoist Motor Analysis */}
                    <SciFiCard title="起升电机电流特征分析 (MCSA)" subtitle="MOTOR HEALTH" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={MOTOR_CURRENT}>
                                    <defs>
                                        <linearGradient id="currGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} label={{ value: 'Current (A)', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Area type="monotone" dataKey="current" stroke="#f97316" fill="url(#currGrad)" name="定子电流" strokeWidth={2} />
                                    <Line type="monotone" dataKey="torque" stroke="#0ea5e9" strokeWidth={2} dot={false} name="输出扭矩 (Nm)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* RIGHT: Rope & Maintenance */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* Wire Rope MFL */}
                    <SciFiCard title="钢丝绳全长无损探伤 (MFL)" subtitle="WIRE INTEGRITY">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={ROPE_MFL_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="length" stroke="#64748b" tick={{fontSize: 9}} label={{value: 'Length (m)', position: 'insideBottomRight', offset: -5}} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                    <Line type="monotone" dataKey="signal" stroke="#a855f7" strokeWidth={2} dot={false} />
                                    <ReferenceLine y={25} stroke="#ef4444" strokeDasharray="5 5" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-between items-center px-2 bg-purple-900/10 border border-purple-800/30 rounded py-1 mt-2">
                             <div className="flex items-center gap-2 text-[10px] text-purple-300">
                                 <Magnet size={12} /> 局部断丝检测
                             </div>
                             <span className="text-xs font-bold text-white">2 处 (120m, 210m)</span>
                        </div>
                    </SciFiCard>

                    {/* Real-time Stream */}
                    <SciFiCard title="感知阵列实时参数" subtitle="STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '减速箱油温', val: '62.4', unit: '°C', status: 'normal' },
                                { label: '制动器磨损量', val: '2.4', unit: 'mm', status: 'warning' },
                                { label: '卷筒轴承振动', val: '0.8', unit: 'mm/s', status: 'normal' },
                                { label: '小车轨道偏差', val: '1.2', unit: 'mm', status: 'warning' },
                                { label: '吊具倾角', val: '0.5', unit: '°', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-orange-500/30 transition-all">
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

                    {/* Maintenance Plan */}
                    <SciFiCard title="维护建议" subtitle="O&M">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">2024-05-18: 轨道紧固件复拧</div>
                                    <div className="text-[9px] text-slate-500">状态: 完成</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- FOOTER --- */}
            <div className="h-10 bg-orange-950/20 border-t border-orange-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">CMS系统: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">结构应力反馈: 24ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-orange-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> ZPMC-Smart-Structure Core v3.0 - Active
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
