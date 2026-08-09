
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/lighthouse-power/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-67]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-67';
import { PowerViewMode } from '../../../components/predictive/lighthouse-power/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie
} from 'recharts';
import { 
  Zap, Sun, Wind, Battery, CloudRain, 
  Thermometer, Activity, Signal, AlertTriangle, 
  TrendingUp, Wifi, Navigation, ShieldCheck,
  Power, Droplets, Calendar, Anchor, Brain,
  Search, RefreshCw, ChevronRight
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 微电网能量平衡预测 (Energy Balance Forecast)
const ENERGY_BALANCE_DATA = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    // 太阳能：白天有，中午高峰
    const solar = (hour > 6 && hour < 18) ? Math.sin((hour - 6) * Math.PI / 12) * 50 : 0;
    // 风能：随机波动
    const wind = 20 + Math.random() * 30;
    // 负载：夜间灯光开启，负载高
    const load = (hour < 6 || hour > 18) ? 60 : 15; 
    
    return {
        time: `${hour}:00`,
        generation: solar + wind,
        consumption: load,
        batteryLevel: 0 // calculate later
    };
});
// Simple simulation of battery integration
let currentBat = 80;
ENERGY_BALANCE_DATA.forEach(d => {
    const net = d.generation - d.consumption;
    currentBat = Math.min(100, Math.max(0, currentBat + net * 0.1));
    d.batteryLevel = currentBat;
});

// 2. 电池单体一致性分布 (Cell Voltage Consistency)
const BATTERY_CELLS = Array.from({ length: 48 }, (_, i) => ({
    id: i,
    volts: 3.2 + Math.random() * 0.15 - (i === 12 ? 0.4 : 0), // Cell 12 is weak
    status: i === 12 ? 'warning' : 'normal'
}));

// 3. 环境腐蚀与健康因子 (Environmental Stress)
const ENV_RISK_RADAR = [
    { subject: '盐雾浓度', A: 85, fullMark: 100 },
    { subject: '紫外线强度', A: 72, fullMark: 100 },
    { subject: '湿度循环', A: 90, fullMark: 100 },
    { subject: '温差冲击', A: 65, fullMark: 100 },
    { subject: '风暴载荷', A: 40, fullMark: 100 },
];

export const LighthousePowerPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<PowerViewMode>('energy-flow');
    const [soh, setSoh] = useState(92.5); // State of Health
    const [autonomyDays, setAutonomyDays] = useState(14); // Days without input
    const [weatherState, setWeatherState] = useState('Overcast');

    // Real-time params simulation
    const [windSpeed, setWindSpeed] = useState(12.5);
    const [solarOut, setSolarOut] = useState(0.0);

    useEffect(() => {
        const interval = setInterval(() => {
            const time = Date.now() / 1000;
            setWindSpeed(12 + Math.sin(time * 0.5) * 5);
            setSolarOut(Math.max(0, Math.sin(time * 0.2) * 800)); // Fake day/cycle
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：深海灯塔状态指挥板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-yellow-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.2)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-yellow-600/20 rounded-full border border-yellow-500/50 shadow-[0_0_25px_rgba(234,179,8,0.3)]">
                        <Navigation className="text-yellow-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            航道助航灯塔供电设备健康评估
                            <span className="text-xs not-italic font-bold bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded border border-yellow-800 uppercase">ISLAND GRID</span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>位置: 30°42'N, 122°25'E (东海)</span>
                            <span>供电模式: 风光互补微电网</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">能源自给自足率</div>
                        <div className="text-4xl font-mono font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                            100<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">阴雨天续航能力</div>
                        <div className="text-3xl font-mono font-bold text-yellow-400 tracking-tighter">{autonomyDays} <span className="text-sm">DAYS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：能源输入端状态 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 风光发电实时效率 */}
                    <SciFiCard title="清洁能源捕获效率" subtitle="GENERATION EFFICIENCY" highlight className="bg-[#0c1221]">
                        <div className="space-y-4 py-2">
                            {/* 风能 */}
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-cyan-400 flex items-center gap-2"><Wind size={14}/> 风力发电</span>
                                    <span className="text-white font-mono">{windSpeed.toFixed(1)} m/s</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500 transition-all duration-1000" style={{width: `${Math.min(100, windSpeed/25*100)}%`}}></div>
                                    </div>
                                    <span className="text-[10px] text-slate-500 w-12 text-right">{(windSpeed * 0.15).toFixed(1)} kW</span>
                                </div>
                            </div>
                            
                            {/* 光伏 */}
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-yellow-400 flex items-center gap-2"><Sun size={14}/> 光伏发电</span>
                                    <span className="text-white font-mono">Irradiance: High</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-500 transition-all duration-1000" style={{width: `${solarOut/10}%`}}></div>
                                    </div>
                                    <span className="text-[10px] text-slate-500 w-12 text-right">{(solarOut/1000).toFixed(2)} kW</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                            <span className="text-[10px] text-slate-500">MPPT 追踪状态</span>
                            <span className="text-xs font-bold text-green-400">OPTIMAL (98.5%)</span>
                        </div>
                    </SciFiCard>

                    {/* 环境腐蚀雷达 */}
                    <SciFiCard title="海洋环境侵蚀应力" subtitle="STRESS FACTORS">
                        <div className="h-48 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={ENV_RISK_RADAR}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Stress" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #ef4444'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-[10px] text-center text-red-400 mt-1 uppercase font-bold animate-pulse">
                            <AlertTriangle className="inline mr-1" size={10} /> 盐雾腐蚀等级: C5-M (Very High)
                        </div>
                    </SciFiCard>

                    {/* 天气预报决策 */}
                    <SciFiCard title="气象-能源联动预测" subtitle="FORECAST" className="flex-1">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded border border-slate-800">
                                <CloudRain size={20} className="text-slate-400" />
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-slate-200">未来 48h 阴雨预警</div>
                                    <div className="text-[10px] text-slate-500">预计光伏产出下降 85%</div>
                                </div>
                            </div>
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">策略建议：</span> 预测蓄电池 SOC 将在 D+2 降至 30%。建议立即切除 <span className="text-white">雷达应答器(Racon)</span> 等非必要负载，保留主灯器供电。
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D数字孪生与能量流 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 孤岛灯塔视窗 */}
                    <div className="flex-1 relative bg-[#01050a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-yellow-500/30">
                                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping shadow-[0_0_10px_yellow]"></div>
                                <span className="text-[12px] text-yellow-400 font-black tracking-widest uppercase">微电网能量流实时仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-56">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">蓄电池 SOC</span>
                                    <span className="text-emerald-400 font-mono font-bold">84.5 %</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">主灯器状态</span>
                                    <span className="text-white font-mono font-bold">FLASH .4s</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">微网母线电压</span>
                                    <span className="text-cyan-400 font-mono font-bold">25.4 VDC</span>
                                </div>
                            </div>
                        </div>

                        {/* 视图切换 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['energy-flow', 'battery-thermal', 'environmental-stress'] as PowerViewMode[]).map((mode) => (
                                <button 
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === mode ? 'bg-yellow-600 border-yellow-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {mode === 'energy-flow' ? '能量流' : mode === 'battery-thermal' ? '电池热力' : '环境应力'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene windSpeed={windSpeed} solarIntensity={solarOut/1000} batteryTemp={0.3} viewMode={viewMode} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部交互区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-yellow-600 text-yellow-400 hover:text-white text-xs font-black rounded border border-yellow-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 电池单体巡检
                            </button>
                            <button className="px-10 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all flex items-center gap-3">
                                <RefreshCw size={16} /> 远程充放电测试
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(234,179,8,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 能量平衡预测图表 */}
                    <SciFiCard title="微电网能量供需平衡预测 (24H)" subtitle="ENERGY BALANCE" className="h-[240px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={ENERGY_BALANCE_DATA} margin={{top:10, right:30, left:0, bottom:0}}>
                                    <defs>
                                        <linearGradient id="genGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis yAxisId="power" stroke="#64748b" tick={{fontSize: 10}} label={{ value: '功率 (W)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                                    <YAxis yAxisId="soc" orientation="right" stroke="#f59e0b" tick={{fontSize: 10}} domain={[0, 100]} label={{ value: 'SOC %', angle: 90, position: 'insideRight', fill: '#f59e0b', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Area yAxisId="power" type="monotone" dataKey="generation" name="发电功率" stroke="#10b981" fill="url(#genGrad)" strokeWidth={2} />
                                    <Area yAxisId="power" type="monotone" dataKey="consumption" name="负载消耗" stroke="#ef4444" fill="url(#loadGrad)" strokeWidth={2} />
                                    <Line yAxisId="soc" type="monotone" dataKey="batteryLevel" name="电池SOC" stroke="#f59e0b" strokeWidth={3} dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：储能健康与维护 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 电池组一致性热图 (Cell Balance) */}
                    <SciFiCard title="蓄电池组单体电压一致性" subtitle="CELL BALANCE" className="bg-[#0b1221]">
                        <div className="grid grid-cols-8 gap-1 p-2">
                             {BATTERY_CELLS.map((cell) => (
                                 <div 
                                    key={cell.id} 
                                    className={`aspect-square rounded-sm flex items-center justify-center text-[8px] font-mono transition-all
                                        ${cell.status === 'warning' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:bg-emerald-800 hover:text-white'}
                                    `}
                                    title={`Cell #${cell.id}: ${cell.volts.toFixed(2)}V`}
                                 >
                                     {cell.volts.toFixed(1)}
                                 </div>
                             ))}
                        </div>
                        <div className="mt-2 flex justify-between items-center px-2 text-[10px] text-slate-500">
                             <span>压差 ΔV: <span className="text-orange-400 font-bold">142 mV</span></span>
                             <span>SOH: <span className="text-emerald-400 font-bold">{soh}%</span></span>
                        </div>
                    </SciFiCard>

                    {/* 实时数据流 */}
                    <SciFiCard title="遥测数据实时流" subtitle="TELEMETRY" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '充电电流', val: '12.4', unit: 'A', status: 'normal' },
                                { label: '电池舱温度', val: '28.5', unit: '°C', status: 'normal' },
                                { label: '光伏板积灰率', val: '12%', unit: '', status: 'warning' },
                                { label: '备用柴发油位', val: '85%', unit: '', status: 'normal' },
                                { label: '通信信号强度', val: '-85', unit: 'dBm', status: 'normal' },
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

                    {/* 维护计划 */}
                    <SciFiCard title="预测性巡检任务" subtitle="TASKS">
                        <div className="space-y-2">
                            <div className="p-3 bg-yellow-950/20 rounded border border-yellow-900/50 flex items-center gap-3">
                                <Battery className="text-yellow-400" size={20} />
                                <div>
                                    <div className="text-[10px] text-yellow-100 font-bold uppercase">电池组均衡维护</div>
                                    <div className="text-[9px] text-yellow-600 font-bold italic">建议在连续阴雨前执行</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-yellow-600" />
                            </div>
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded flex items-center gap-3 opacity-60">
                                <Anchor size={20} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200 font-bold">防雷接地电阻测试</div>
                                    <div className="text-[9px] text-slate-500">距下次周期: 45天</div>
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
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">北斗卫星链路: 锁定</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">能量管理策略: 自适应模式</span>
                    </div>
                </div>
                <div className="text-[10px] text-yellow-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Power size={12} /> Microgrid-EMS v2.4 - Autonomous Power Active
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
