
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/nav-mark-risk/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-68]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-68';
import { NavMarkViewMode } from '../../../components/predictive/nav-mark-risk/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  Radio, Anchor, BatteryCharging, Sun, Activity, 
  Map as MapIcon, Wind, AlertTriangle, ShieldCheck, 
  Navigation, Signal, Zap, Waves, Crosshair, 
  Wifi, HelpCircle, AlertOctagon, RotateCw, ChevronRight
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 位置漂移散点图 (Drift Watch Circle)
const DRIFT_DATA = Array.from({ length: 50 }, (_, i) => {
    const angle = Math.random() * 2 * Math.PI;
    const r = Math.random() * 15; // meters
    return { 
        x: r * Math.cos(angle), 
        y: r * Math.sin(angle),
        time: i 
    };
});
const ANCHOR_POINT = [{ x: 0, y: 0 }];

// 2. 能源代谢曲线 (Energy Balance)
const ENERGY_DATA = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    solarInput: i > 6 && i < 18 ? Math.sin((i-6)/12 * Math.PI) * 120 : 0,
    consumption: 15 + (i > 18 || i < 6 ? 40 : 0), // Night load higher (light on)
    batteryLevel: 0 // calc later
}));
// Simple simulation of battery integration
let bat = 80;
ENERGY_DATA.forEach(d => {
    bat = Math.max(0, Math.min(100, bat + (d.solarInput - d.consumption) * 0.05));
    d.batteryLevel = bat;
});

// 3. 姿态与波浪关联 (Attitude vs Wave)
const MOTION_DATA = Array.from({ length: 30 }, (_, i) => ({
    time: `${i}s`,
    pitch: Math.sin(i/2) * 10 + Math.random() * 2,
    roll: Math.cos(i/2.5) * 12 + Math.random() * 2,
    waveHeight: 1.5 + Math.sin(i/5) * 0.5
}));

// 4. 失效风险因子 (Risk Factors)
const RISK_FACTORS = [
    { name: '锚链磨损', val: 45, status: 'normal' },
    { name: '电池老化', val: 78, status: 'warning' },
    { name: '光源寿命', val: 20, status: 'normal' },
    { name: '位置偏离', val: 12, status: 'normal' },
    { name: '撞击风险', val: 5, status: 'normal' },
];

export const NavMarkRiskPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<NavMarkViewMode>('standard');
    const [healthIndex, setHealthIndex] = useState(88.5);
    const [driftRadius, setDriftRadius] = useState(12.4);
    const [waveHeight, setWaveHeight] = useState(1.8);

    // Simulate real-time data updates
    useEffect(() => {
        const interval = setInterval(() => {
            setDriftRadius(prev => 10 + Math.sin(Date.now()/5000) * 5 + Math.random());
            setWaveHeight(prev => 1.5 + Math.cos(Date.now()/8000) * 0.5);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部 HUD：深蓝哨兵指挥台 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-yellow-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.2)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-yellow-600/20 rounded-full border border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                        <Radio className="text-yellow-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            航标设备失效风险预测
                            <span className="text-xs not-italic font-bold bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded border border-yellow-800 uppercase">AtoN Guardian</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>ID: NB-304 (灯浮标)</span>
                            <span>海区: 东海 B4 区 | 水深: 24m</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">综合健康指数 (PHI)</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            {healthIndex.toFixed(1)}
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">回旋半径监测</div>
                        <div className={`text-3xl font-mono font-bold ${driftRadius > 25 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                            {driftRadius.toFixed(1)} <span className="text-sm">m</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：位置与姿态感知 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 回旋半径雷达 (Position Radar) */}
                    <SciFiCard title="锚位漂移监控 (Watch Circle)" subtitle="GNSS POSITION" highlight className="bg-[#0c1221]">
                        <div className="h-56 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis type="number" dataKey="x" name="East" domain={[-30, 30]} tick={{fontSize: 9}} stroke="#64748b" />
                                    <YAxis type="number" dataKey="y" name="North" domain={[-30, 30]} tick={{fontSize: 9}} stroke="#64748b" />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#020617', border: '1px solid #eab308'}} />
                                    <ReferenceLine x={0} stroke="#334155" />
                                    <ReferenceLine y={0} stroke="#334155" />
                                    {/* 警戒圈 */}
                                    <ReferenceLine segment={[{x:-20, y:0}, {x:20, y:0}]} stroke="#ef4444" strokeDasharray="5 5" label="Limit"/>
                                    
                                    <Scatter name="Anchor" data={ANCHOR_POINT} fill="#fff" shape="cross" />
                                    <Scatter name="Buoy" data={DRIFT_DATA} fill="#eab308" fillOpacity={0.6} />
                                </ScatterChart>
                            </ResponsiveContainer>
                            <div className="absolute top-2 right-2 text-[10px] text-yellow-500 font-bold bg-yellow-900/20 px-2 rounded border border-yellow-800">
                                距锚点: {driftRadius.toFixed(1)}m
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 波浪与姿态 */}
                    <SciFiCard title="波浪动力响应 (Motion Response)" subtitle="IMU DATA">
                        <div className="h-40 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={MOTION_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[-20, 20]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Line type="monotone" dataKey="pitch" stroke="#0ea5e9" strokeWidth={2} dot={false} name="纵摇 (Pitch)" />
                                    <Line type="monotone" dataKey="roll" stroke="#f59e0b" strokeWidth={2} dot={false} name="横摇 (Roll)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex justify-between items-center px-2 text-[10px] text-slate-500">
                             <div className="flex items-center gap-1"><Waves size={12}/> 有效波高: {waveHeight.toFixed(1)}m</div>
                             <span className="text-emerald-400">稳性良好</span>
                        </div>
                    </SciFiCard>

                    {/* 风险预警列表 */}
                    <SciFiCard title="实时风险事件流" subtitle="EVENTS" className="flex-1">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded border border-slate-800">
                                <AlertOctagon className="text-slate-500 shrink-0" size={16} />
                                <div>
                                    <div className="text-xs font-bold text-slate-300">GPS 信号短暂漂移</div>
                                    <div className="text-[10px] text-slate-500">10:42 AM | 持续 12s</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-yellow-900/10 border border-yellow-600/30 rounded">
                                <BatteryCharging className="text-yellow-500 shrink-0" size={16} />
                                <div>
                                    <div className="text-xs font-bold text-yellow-200">电池内阻偏高</div>
                                    <div className="text-[10px] text-yellow-500/70">预测容量衰减: -4%</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：数字孪生与环境交互 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 浮标全息视窗 */}
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_120px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-yellow-500/30">
                                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping shadow-[0_0_10px_yellow]"></div>
                                <span className="text-[12px] text-yellow-400 font-black tracking-widest uppercase">浮标动态数字孪生 (Digital Twin)</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">灯质特征</span>
                                    <span className="text-white font-mono font-bold">FL(2) Y 6s</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">遥测信号 (RSSI)</span>
                                    <span className="text-emerald-400 font-mono font-bold">-72 dBm</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">环境照度</span>
                                    <span className="text-orange-400 font-mono font-bold">450 Lux</span>
                                </div>
                            </div>
                        </div>

                        {/* 视角切换 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['standard', 'mooring-strain', 'night-vision'] as NavMarkViewMode[]).map((mode) => (
                                <button 
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === mode ? 'bg-yellow-600 border-yellow-400 text-black' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {mode === 'standard' ? '实景' : mode === 'mooring-strain' ? '受力' : '夜视'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene 
                            waveHeight={waveHeight} 
                            driftDistance={driftRadius}
                            viewMode={viewMode}
                        />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-yellow-600 text-yellow-400 hover:text-black text-xs font-black rounded border border-yellow-900/50 transition-all flex items-center gap-3">
                                <Crosshair size={16} /> 锚链受力分析
                            </button>
                            <button className="px-10 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-black text-xs font-black rounded shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all flex items-center gap-3">
                                <RotateCw size={16} /> 仿真波浪测试
                            </button>
                        </div>
                        
                        {/* 扫描线动画 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(234,179,8,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 能源代谢分析 */}
                    <SciFiCard title="微电网能源代谢监测 (24H)" subtitle="POWER BUDGET" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={ENERGY_DATA}>
                                    <defs>
                                        <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#eab308" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis yAxisId="watt" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'W', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                                    <YAxis yAxisId="perc" orientation="right" stroke="#10b981" tick={{fontSize: 10}} domain={[0, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #334155'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Area yAxisId="watt" type="monotone" dataKey="solarInput" name="光伏输入" stroke="#eab308" fill="url(#solarGrad)" />
                                    <Line yAxisId="watt" type="step" dataKey="consumption" name="负载消耗" stroke="#ef4444" dot={false} strokeWidth={2} />
                                    <Line yAxisId="perc" type="monotone" dataKey="batteryLevel" name="电池SOC (%)" stroke="#10b981" strokeWidth={2} dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：部件健康与维护 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 失效因子风险条 */}
                    <SciFiCard title="失效因子权重分析" subtitle="RISK FACTORS">
                        <div className="space-y-3 py-2">
                            {RISK_FACTORS.map((item, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-400">{item.name}</span>
                                        <span className={item.status === 'warning' ? 'text-orange-400' : 'text-slate-100'}>{item.val}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full transition-all duration-1000 ${item.status === 'warning' ? 'bg-orange-500' : 'bg-cyan-500'}`} 
                                          style={{ width: `${item.val}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 实时数据流 */}
                    <SciFiCard title="遥测感知流" subtitle="STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '充电电压', val: '14.2', unit: 'V', status: 'normal' },
                                { label: '负载电流', val: '1.2', unit: 'A', status: 'normal' },
                                { label: '舱内湿度', val: '85', unit: '%', status: 'warning' },
                                { label: 'GPS 卫星数', val: '12', unit: '颗', status: 'normal' },
                                { label: '碰撞加速度', val: '0.04', unit: 'g', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-yellow-500/30 transition-all">
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

                    {/* 维护建议 */}
                    <SciFiCard title="智能维护工单" subtitle="ACTIONS">
                        <div className="space-y-2">
                            <div className="p-3 bg-yellow-950/20 rounded border border-yellow-900/50 flex items-center gap-3">
                                <BatteryCharging size={20} className="text-yellow-400" />
                                <div>
                                    <div className="text-[10px] text-yellow-100 font-bold uppercase">蓄电池容量核对</div>
                                    <div className="text-[9px] text-yellow-600 font-bold italic">建议在阴雨天前执行</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-yellow-600" />
                            </div>
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded flex items-center gap-3 opacity-60">
                                <Anchor size={20} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">锚链磨损检查</div>
                                    <div className="text-[9px] text-slate-600">距离下次定检: 45天</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚 --- */}
            <div className="h-10 bg-yellow-950/20 border-t border-yellow-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">北斗短报文: 正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">漂移预警算法: 运行中</span>
                    </div>
                </div>
                <div className="text-[10px] text-yellow-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Signal size={12} /> Nav-Mark-Predictor v2.1 - Active Monitoring
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
