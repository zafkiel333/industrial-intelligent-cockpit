
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/rtg-travel/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-66]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-66';
import { RtgViewMode } from '../../../components/predictive/rtg-travel/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie
} from 'recharts';
import { 
  Truck, Settings, Activity, Thermometer, AlertTriangle, 
  Gauge, Wrench, Zap, Layers, Binary, Search, 
  Disc, BarChart3, Wind, CircleDashed,
  Brain, RefreshCw
} from 'lucide-react';

// --- MOCK DATA ---

// 1. Gearbox Vibration Spectrum (FFT)
const VIB_SPECTRUM = Array.from({ length: 50 }, (_, i) => ({
    freq: i * 20, // Hz
    amp: (i === 15 || i === 30) ? 8.5 + Math.random() * 2 : 1 + Math.random(), // Harmonics at 300Hz, 600Hz
    threshold: 6.0
}));

// 2. Oil Quality Trend
const OIL_TREND = Array.from({ length: 12 }, (_, i) => ({
    month: `M-${11-i}`,
    viscosity: 220 - i * 2 - Math.random() * 5, // Dropping
    iron: 15 + i * 8 + Math.random() * 5, // Rising Fe ppm
}));

// 3. Tire Condition
const TIRE_DATA = [
    { pos: 'FL', pressure: 10.2, temp: 45, wear: 20 },
    { pos: 'FR', pressure: 10.1, temp: 48, wear: 22 },
    { pos: 'RL', pressure: 9.8, temp: 44, wear: 18 },
    { pos: 'RR', pressure: 10.3, temp: 46, wear: 21 },
];

// 4. Motor Current (MCSA)
const MOTOR_CURRENT = Array.from({ length: 60 }, (_, i) => ({
    time: i,
    current: 120 + Math.sin(i * 0.5) * 5 + Math.random() * 2,
    limit: 150
}));

export const RtgTravelPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<RtgViewMode>('reality');
    const [travelSpeed] = useState(6.5); // km/h (Scaled for display)
    const [healthScore] = useState(78.4);
    const [gearboxTemp] = useState(72.5); // °C

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- TOP HUD --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-orange-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(249,115,22,0.2)_50%,transparent_75%,transparent)] bg-[length:20px_20px]"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-orange-600/20 rounded border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                        <Truck className="text-orange-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            场桥(RTG)行走机构与减速箱预测维护
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-orange-950/50 border border-orange-800/30 rounded">
                                设备号: RTG-042 (Lane 6)
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                监测模态: 振动 + 油液 + 胎压
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">行走系统健康度</div>
                        <div className={`text-4xl font-mono font-bold ${healthScore < 80 ? 'text-orange-400' : 'text-emerald-400'}`}>
                            {healthScore}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">减速箱油温</div>
                        <div className={`text-3xl font-mono font-bold ${gearboxTemp > 75 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                            {gearboxTemp} <span className="text-sm">°C</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN GRID --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* LEFT: Gearbox Diagnostics */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* Vibration Analysis */}
                    <SciFiCard title="减速箱振动频谱 (Gear Mesh)" subtitle="FFT SPECTRUM" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={VIB_SPECTRUM} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="freq" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="amp" stroke="#f97316" fill="url(#vibGrad)" strokeWidth={2} name="振幅 (g)" />
                                    <ReferenceLine y={6} stroke="#ef4444" strokeDasharray="5 5" label={{value:'报警线', fill:'#ef4444', fontSize:8}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-orange-900/10 border border-orange-900/30 rounded flex items-center gap-2 text-[10px] text-orange-200">
                             <AlertTriangle size={12} />
                             检测到 300Hz (3X) 啮合频率能量异常，疑似齿面点蚀。
                        </div>
                    </SciFiCard>

                    {/* Oil Quality */}
                    <SciFiCard title="润滑油液理化趋势" subtitle="OIL CONDITION">
                        <div className="h-40 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={OIL_TREND} margin={{top:10, right:5, left:-15, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="month" hide />
                                    <YAxis yAxisId="visc" stroke="#0ea5e9" tick={{fontSize: 9}} domain={[150, 250]} />
                                    <YAxis yAxisId="fe" orientation="right" stroke="#ef4444" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area yAxisId="visc" type="monotone" dataKey="viscosity" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} name="粘度(cSt)" />
                                    <Line yAxisId="fe" type="monotone" dataKey="iron" stroke="#ef4444" strokeWidth={2} dot={false} name="铁含量(ppm)" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-slate-500">
                             <span>粘度: <span className="text-cyan-400">198 cSt</span></span>
                             <span>Fe: <span className="text-rose-500">124 ppm (High)</span></span>
                        </div>
                    </SciFiCard>

                    {/* AI Prognostics */}
                    <SciFiCard title="AI 故障推演结论" subtitle="DIAGNOSIS" className="flex-1">
                        <div className="space-y-3">
                            <div className="p-3 bg-slate-900/50 border-l-4 border-orange-500 rounded">
                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                    <Brain className="inline mr-2 text-orange-400" size={14} />
                                    综合振动与油样分析，判定为 <span className="text-white font-bold">减速箱高速级齿轮磨损</span>。
                                    预测剩余寿命 (RUL): <span className="text-orange-400 font-bold">450 小时</span>。
                                </p>
                            </div>
                            <button className="w-full py-2 bg-slate-800 hover:bg-orange-600 text-white text-[10px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                                <Wrench size={12} /> 预约更换齿轮油
                            </button>
                        </div>
                    </SciFiCard>
                </div>

                {/* CENTER: 3D Digital Twin */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_120px_rgba(0,0,0,1)] group">
                        {/* HUD Overlay */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-orange-500/30">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping shadow-[0_0_10px_orange]"></div>
                                <span className="text-[12px] text-orange-400 font-black tracking-widest uppercase">行走台车组实时孪生</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-56">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">行走速度</span>
                                    <span className="text-white font-mono font-bold">110 m/min</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">电机转速</span>
                                    <span className="text-emerald-400 font-mono font-bold">1480 RPM</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">输出扭矩</span>
                                    <span className="text-amber-400 font-mono font-bold">450 Nm</span>
                                </div>
                            </div>
                        </div>

                        {/* View Switcher */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['reality', 'thermal-map', 'vibration-analysis'] as RtgViewMode[]).map((m) => (
                                <button 
                                    key={m}
                                    onClick={() => setViewMode(m)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === m ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {m === 'reality' ? '实景' : m === 'thermal-map' ? '热力场' : '振动场'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene 
                            speed={0.8} 
                            gearboxTemp={gearboxTemp / 100} 
                            vibrationLevel={viewMode === 'vibration-analysis' ? 0.8 : 0} 
                            viewMode={viewMode} 
                        />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* Bottom Actions */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-orange-600 text-orange-400 hover:text-white text-xs font-black rounded border border-orange-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 声纹异常定位
                            </button>
                            <button className="px-10 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all flex items-center gap-3">
                                <RefreshCw size={16} /> 仿真模型校准
                            </button>
                        </div>
                        
                        {/* Scan Line */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(249,115,22,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* Motor Current Analysis */}
                    <SciFiCard title="电机电流特征 (MCSA) - 转子条健康" subtitle="MOTOR HEALTH" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={MOTOR_CURRENT}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[100, 160]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Line type="monotone" dataKey="current" stroke="#0ea5e9" strokeWidth={2} dot={false} name="定子电流(A)" />
                                    <ReferenceLine y={150} stroke="#ef4444" strokeDasharray="5 5" label={{value: '过载', fill: '#ef4444', fontSize: 10}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* RIGHT: Tire & Wheel Health */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* Tire Monitoring */}
                    <SciFiCard title="轮胎状态监测 (TPMS)" subtitle="TIRE HEALTH">
                        <div className="grid grid-cols-2 gap-3 py-2">
                             {TIRE_DATA.map((tire, i) => (
                                 <div key={i} className="p-2 bg-slate-900/50 rounded border border-slate-700 flex flex-col items-center relative">
                                     <div className="absolute top-1 left-2 text-[10px] font-bold text-slate-500">{tire.pos}</div>
                                     <CircleDashed className={`mb-1 ${tire.pressure < 10 ? 'text-orange-400' : 'text-emerald-400'}`} size={24} />
                                     <div className="text-sm font-mono font-bold text-white">{tire.pressure} Bar</div>
                                     <div className="flex gap-2 text-[9px] text-slate-400 mt-1">
                                         <span>{tire.temp}°C</span>
                                         <span>Wear: {tire.wear}%</span>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </SciFiCard>

                    {/* Sensor Stream */}
                    <SciFiCard title="传感器实时数据流" subtitle="STREAM" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '制动器磨损', val: '2.1', unit: 'mm', status: 'normal' },
                                { label: '电机绝缘电阻', val: '500', unit: 'MΩ', status: 'normal' },
                                { label: '减速机输入轴振动', val: '4.5', unit: 'mm/s', status: 'warning' },
                                { label: '供电电缆张力', val: '120', unit: 'N', status: 'normal' },
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

                    {/* Work Orders */}
                    <SciFiCard title="维护建议" subtitle="O&M">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <Settings size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">计划: 减速箱油品取样</div>
                                    <div className="text-[9px] text-slate-500">截止: 2024-06-15</div>
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
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">胎压监测: 在线</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">振动采样: 2048Hz</span>
                    </div>
                </div>
                <div className="text-[10px] text-orange-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> ZPMC-Mobility-Guard v4.1 - Active Protection
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
