
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/port-crane/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-64]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-64';
import { CraneViewMode } from '../../../components/predictive/port-crane/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  Anchor, Activity, ShieldCheck, Cpu, AlertTriangle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Wind, Radio, Play, Pause, FastForward, Ship,
  Compass, HardDrive, MonitorPlay, Eye, Microscope,
  Box, Truck
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 结构应力监测 (Structure Stress)
const STRESS_DATA = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    stress: 120 + Math.sin(i / 3) * 30 + (i > 16 ? (i-16)*10 : 0),
    limit: 180
}));

// 2. 钢丝绳健康 (Wire Rope Health)
const ROPE_HEALTH = [
    { name: '主起升', val: 85, status: 'normal' },
    { name: '变幅牵引', val: 92, status: 'normal' },
    { name: '小车牵引', val: 78, status: 'warning' },
    { name: '臂架俯仰', val: 95, status: 'normal' },
];

// 3. 关键部件综合评分
const HEALTH_RADAR = [
    { subject: '金属结构', A: 92, fullMark: 100 },
    { subject: '起升机构', A: 85, fullMark: 100 },
    { subject: '变幅机构', A: 88, fullMark: 100 },
    { subject: '大车行走', A: 75, fullMark: 100 },
    { subject: '电气控制', A: 90, fullMark: 100 },
];

export const PortCraneHealthPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<CraneViewMode>('operation');
    const [healthScore, setHealthScore] = useState(88.5);
    const [cycleProgress, setCycleProgress] = useState(0);
    const [isOperating, setIsOperating] = useState(true);

    useEffect(() => {
        if (!isOperating) return;
        const interval = setInterval(() => {
            setCycleProgress(prev => (prev + 0.005) % 1);
        }, 50);
        return () => clearInterval(interval);
    }, [isOperating]);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- TOP HUD --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.3)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        <Anchor className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            港口岸桥整机健康监测与预测
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/30 rounded">
                                监测模型: STS-Digital-Twin v4.2
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                设备: QC-102 | 额定起重量: 65t
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">整机健康指数</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            {healthScore}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">结构疲劳寿命</div>
                        <div className="text-3xl font-mono font-bold text-emerald-400">15.2 <span className="text-sm">Yrs</span></div>
                    </div>
                </div>
            </div>

            {/* --- MAIN GRID --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* LEFT: Stress & Structure */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* Stress Trend */}
                    <SciFiCard title="关键节点应力监测" subtitle="STRESS LOAD" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={STRESS_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="stress" stroke="#ef4444" fill="url(#stressGrad)" strokeWidth={2} name="应力(MPa)" />
                                    <ReferenceLine y={180} stroke="#f59e0b" strokeDasharray="5 5" label={{value:'疲劳线', fill:'#f59e0b', fontSize:8}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-slate-500">
                             当前状态：<span className="text-emerald-400 font-bold">弹性形变区间</span>
                        </div>
                    </SciFiCard>

                    {/* System Health Radar */}
                    <SciFiCard title="子系统健康度评估" subtitle="SYSTEM HEALTH">
                        <div className="h-48 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={HEALTH_RADAR}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Health" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* AI Prognostics */}
                    <SciFiCard title="AI 专家诊断建议" subtitle="AI INFERENCE" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演报告：</span> 监测到大车行走机构右前轮存在 <span className="text-white font-bold underline">周期性冲击振动</span>。结合轨道不平整度数据，判定为轨道接头高低错位引发的轮缘磨损。
                            </div>
                            <div className="space-y-2">
                                <button className="w-full py-2 bg-slate-800 hover:bg-cyan-600 text-white text-[10px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2 group">
                                    <Wrench size={14} className="text-cyan-400 group-hover:text-white" /> 预约轨道打磨修复
                                </button>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* CENTER: 3D Digital Twin */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD Overlay */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping shadow-[0_0_10px_cyan]"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">岸桥作业全过程实时仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-56">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前吊重</span>
                                    <span className="text-white font-mono font-bold">42.5 t</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">小车位置</span>
                                    <span className="text-emerald-400 font-mono font-bold">24.5 m</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">起升高度</span>
                                    <span className="text-orange-400 font-mono font-bold">18.2 m</span>
                                </div>
                            </div>
                        </div>

                        {/* View Switcher */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['operation', 'structural', 'drive-train'] as CraneViewMode[]).map((m) => (
                                <button 
                                    key={m}
                                    onClick={() => setViewMode(m)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === m ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {m === 'operation' ? '作业' : m === 'structural' ? '结构' : '传动'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene 
                            healthStatus={healthScore} 
                            workCycle={cycleProgress} 
                            viewMode={viewMode}
                        />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* Bottom Controls */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-3/4 bg-black/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl items-center">
                             <div className="flex-1">
                                 <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">
                                     <span>作业循环进度 (Cycle Progress)</span>
                                     <span className="text-cyan-400">{(cycleProgress * 100).toFixed(0)}%</span>
                                 </div>
                                 <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                     <div className="h-full bg-cyan-500 transition-all duration-300" style={{width: `${cycleProgress * 100}%`}}></div>
                                 </div>
                             </div>
                             
                             <div className="flex gap-2">
                                <button 
                                    onClick={() => setIsOperating(!isOperating)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-cyan-600 text-white text-xs font-black rounded flex items-center gap-2 transition-all"
                                >
                                    {isOperating ? <Pause size={14}/> : <Play size={14}/>}
                                </button>
                             </div>
                        </div>
                        
                        {/* Scan Line */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* Wire Rope Health */}
                    <SciFiCard title="起升钢丝绳健康监测" subtitle="ROPE STATUS" className="h-[200px] bg-[#050b16]">
                        <div className="w-full h-full p-2 flex flex-col justify-center">
                            <div className="space-y-3">
                                {ROPE_HEALTH.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-20 text-[10px] text-slate-400 font-bold text-right">{item.name}</div>
                                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${item.status === 'warning' ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                                                style={{ width: `${item.val}%` }}
                                            ></div>
                                        </div>
                                        <div className="w-12 text-[10px] font-mono text-white">{item.val}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* RIGHT: Drive Train & Maintenance */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* Drive Train Status */}
                    <SciFiCard title="传动系统状态矩阵" subtitle="DRIVE TRAIN">
                        <div className="space-y-3 py-2">
                            {[
                                { label: '起升减速机温升', val: '45.2', unit: '°C', status: 'normal' },
                                { label: '小车电机电流', val: '124', unit: 'A', status: 'normal' },
                                { label: '制动器磨损量', val: '2.4', unit: 'mm', status: 'warning' },
                                { label: '卷筒联轴器', val: '0.04', unit: 'mm', status: 'normal' },
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

                    {/* Maintenance Log */}
                    <SciFiCard title="维保作业记录" subtitle="LOGS" className="flex-1">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">2024-05-18: 钢丝绳润滑</div>
                                    <div className="text-[9px] text-slate-500">状态: 完成</div>
                                </div>
                            </div>
                            <div className="p-2 bg-orange-950/20 rounded border border-orange-900/50 flex items-center gap-3">
                                <Wrench size={16} className="text-orange-400" />
                                <div>
                                    <div className="text-[10px] text-orange-100 font-bold">建议: 更换小车导轮</div>
                                    <div className="text-[9px] text-orange-600">截止: 2024-06-01</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- FOOTER --- */}
            <div className="h-10 bg-cyan-950/20 border-t border-cyan-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">PLC 通讯: 正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">CMS 延时: 18ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> ZPMC-Port-Intelligence v4.0 - Active
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
