
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/extreme-weather/ThreeScene';
import { WeatherType } from '../../../components/predictive/extreme-weather/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, Radar, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import { 
  CloudRain, Sun, Wind, CloudLightning, Thermometer, 
  Shield, AlertTriangle, Snowflake, Umbrella, Anchor,
  Activity, Gauge, Signal, ArrowUpRight, AlertOctagon
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 气象预报与失效概率 (Forecast vs Failure Prob)
const FORECAST_DATA = Array.from({ length: 24 }, (_, i) => {
    const time = `${i}:00`;
    // Simulate a storm passing through
    const stormProfile = Math.exp(-Math.pow(i - 14, 2) / 10); 
    const windSpeed = 5 + stormProfile * 25; // m/s
    const prob = 5 + stormProfile * 80; // %
    
    return {
        time,
        wind: windSpeed,
        prob: prob,
        limit: 85
    };
});

// 2. 设备耐受力雷达 (Resilience Matrix)
const RESILIENCE_DATA = [
    { subject: '抗风载荷', A: 85, fullMark: 100 },
    { subject: '低温冷脆', A: 60, fullMark: 100 }, // Weakness
    { subject: '绝缘防水', A: 92, fullMark: 100 },
    { subject: '散热效能', A: 75, fullMark: 100 },
    { subject: '基础稳固', A: 95, fullMark: 100 },
];

// 3. 实时传感器流
const SENSOR_STREAM = [
    { id: 'S-01', name: '风速计', val: 24.5, unit: 'm/s', status: 'warning' },
    { id: 'S-02', name: '结构应变', val: 450, unit: 'με', status: 'normal' },
    { id: 'S-03', name: '柜内湿度', val: 88, unit: '%', status: 'warning' },
    { id: 'S-04', name: '表面温度', val: -12.4, unit: '°C', status: 'critical' },
];

export const ExtremeWeatherPmView: React.FC = () => {
    const [activeWeather, setActiveWeather] = useState<WeatherType>('typhoon');
    const [intensity, setIntensity] = useState(0.8);
    const [riskIndex, setRiskIndex] = useState(72.4);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#0a0f16]">
            
            {/* --- 顶部：气候防御指挥板 --- */}
            <div className="flex justify-between items-center bg-[#111827]/90 border-b border-indigo-500/30 p-4 relative overflow-hidden">
                {/* 背景动态纹理 */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className={`p-3 rounded-lg border shadow-lg transition-colors duration-500
                        ${activeWeather === 'typhoon' ? 'bg-indigo-900/40 border-indigo-500 text-indigo-400' : 
                          activeWeather === 'heatwave' ? 'bg-red-900/40 border-red-500 text-red-400' :
                          activeWeather === 'blizzard' ? 'bg-cyan-900/40 border-cyan-500 text-cyan-400' : 
                          'bg-amber-900/40 border-amber-500 text-amber-400'}
                    `}>
                        {activeWeather === 'typhoon' && <CloudLightning size={32} className="animate-pulse" />}
                        {activeWeather === 'heatwave' && <Sun size={32} className="animate-spin-slow" />}
                        {activeWeather === 'blizzard' && <Snowflake size={32} className="animate-bounce" />}
                        {activeWeather === 'sandstorm' && <Wind size={32} />}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                            极端气象条件设备失效预测
                            <span className={`text-xs not-italic font-bold px-2 py-0.5 rounded border uppercase
                                ${activeWeather === 'typhoon' ? 'bg-indigo-900/50 text-indigo-300 border-indigo-800' : 
                                  activeWeather === 'heatwave' ? 'bg-red-900/50 text-red-300 border-red-800' :
                                  'bg-slate-800 text-slate-400 border-slate-700'}
                            `}>
                                {activeWeather.toUpperCase()} ALERT
                            </span>
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Shield size={12}/> 防御等级: Level 4</span>
                            <span className="flex items-center gap-1"><Activity size={12}/> 实时气象数据接入中</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">失效概率峰值 (24H)</div>
                        <div className="text-4xl font-mono font-bold text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                            85.2<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">气象强度指数 (WSI)</div>
                        <div className="text-3xl font-mono font-bold text-yellow-400 tracking-tighter">
                            {(intensity * 10).toFixed(1)} <span className="text-sm text-slate-500">/ 10</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：环境监测与控制 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 气象模式选择 */}
                    <SciFiCard title="气象场景模拟器" subtitle="SCENARIO" highlight className="bg-[#0f1623]">
                        <div className="grid grid-cols-2 gap-2 py-2">
                            {[
                                { id: 'typhoon', label: '超强台风', icon: <CloudLightning size={16}/>, color: 'indigo' },
                                { id: 'blizzard', label: '极寒暴雪', icon: <Snowflake size={16}/>, color: 'cyan' },
                                { id: 'heatwave', label: '极端热浪', icon: <Sun size={16}/>, color: 'red' },
                                { id: 'sandstorm', label: '强沙尘暴', icon: <Wind size={16}/>, color: 'amber' },
                            ].map(w => (
                                <button 
                                    key={w.id}
                                    onClick={() => setActiveWeather(w.id as WeatherType)}
                                    className={`flex items-center gap-2 p-3 rounded border transition-all
                                        ${activeWeather === w.id 
                                            ? `bg-${w.color}-900/40 border-${w.color}-500 text-white shadow-lg` 
                                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800'}
                                    `}
                                >
                                    {w.icon}
                                    <span className="text-xs font-bold">{w.label}</span>
                                </button>
                            ))}
                        </div>
                        
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold">
                                <span>模拟强度 (Intensity)</span>
                                <span>{(intensity * 100).toFixed(0)}%</span>
                            </div>
                            <input 
                                type="range" min="0" max="1" step="0.01" 
                                value={intensity} 
                                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>
                    </SciFiCard>

                    {/* 实时传感器流 */}
                    <SciFiCard title="环境传感器阵列" subtitle="SENSORS">
                        <div className="space-y-3">
                            {SENSOR_STREAM.map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded border border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'critical' ? 'bg-red-500 animate-ping' : s.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                        <span className="text-[11px] text-slate-300 font-bold">{s.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-mono font-bold text-white">{s.val}</span>
                                        <span className="text-[10px] text-slate-500 ml-1">{s.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 风险雷达 */}
                    <SciFiCard title="设备韧性与薄弱点" subtitle="VULNERABILITY" className="flex-1">
                        <div className="h-full w-full min-h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={RESILIENCE_DATA}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Resilience" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：环境数字孪生 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 气象视窗 */}
                    <div className="flex-1 relative bg-[#020408] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-slate-700">
                                <Activity className="text-indigo-400" size={16} />
                                <span className="text-[12px] text-white font-black tracking-widest uppercase">全域气象应力场仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大瞬时风压</span>
                                    <span className="text-white font-mono font-bold">2.45 kPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">结构表面温降</span>
                                    <span className="text-cyan-400 font-mono font-bold">-15.2 °C/h</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">基础不均匀沉降</span>
                                    <span className="text-orange-400 font-mono font-bold">0.8 mm</span>
                                </div>
                            </div>
                        </div>

                        <ThreeScene 
                            weatherType={activeWeather} 
                            intensity={intensity} 
                            structureHealth={(100 - riskIndex) / 100} 
                        />

                        {/* 底部警告条 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-2/3">
                            <div className="bg-red-950/80 backdrop-blur border border-red-500/50 p-3 rounded flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="text-red-500 animate-bounce" size={20} />
                                    <div>
                                        <div className="text-xs font-black text-white uppercase">Critical Warning</div>
                                        <div className="text-[10px] text-red-200">预测结构振幅将在 T+4h 超过疲劳极限</div>
                                    </div>
                                </div>
                                <div className="text-2xl font-mono font-bold text-red-500">T-4h</div>
                            </div>
                        </div>
                    </div>

                    {/* 失效概率预测曲线 */}
                    <SciFiCard title="气象诱发失效概率预测 (24H)" subtitle="WEATHER-INDUCED FAILURE" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={FORECAST_DATA} margin={{top:10, right:20, bottom:0, left:-20}}>
                                    <defs>
                                        <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis yAxisId="prob" stroke="#f43f5e" tick={{fontSize: 10}} label={{ value: 'Prob %', angle: -90, position: 'insideLeft', fill: '#f43f5e' }} />
                                    <YAxis yAxisId="wind" orientation="right" stroke="#0ea5e9" tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #334155'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    
                                    <Area yAxisId="prob" type="monotone" dataKey="prob" name="失效概率" stroke="#f43f5e" fill="url(#riskGrad)" strokeWidth={2} />
                                    <Line yAxisId="wind" type="monotone" dataKey="wind" name="风速预测 (m/s)" stroke="#0ea5e9" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                                    <ReferenceLine yAxisId="prob" y={80} stroke="#f59e0b" strokeDasharray="5 5" label="停机阈值" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：预警与响应 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 极端工况预警详情 */}
                    <SciFiCard title="多物理场耦合预警" subtitle="COUPLED RISKS">
                        <div className="space-y-3 py-2">
                             <div className="p-3 bg-slate-900/50 rounded border border-slate-700 flex flex-col gap-2">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                                    <span>风致振动 (Wind Load)</span>
                                    <span className="text-rose-400">High Risk</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500" style={{width: '85%'}}></div>
                                </div>
                                <p className="text-[9px] text-slate-500">共振频率接近一阶模态 (0.8Hz)</p>
                             </div>

                             <div className="p-3 bg-slate-900/50 rounded border border-slate-700 flex flex-col gap-2">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                                    <span>雨雪侵蚀 (Erosion)</span>
                                    <span className="text-orange-400">Moderate</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500" style={{width: '60%'}}></div>
                                </div>
                             </div>

                             <div className="p-3 bg-slate-900/50 rounded border border-slate-700 flex flex-col gap-2">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                                    <span>低温冷脆 (Embrittlement)</span>
                                    <span className="text-emerald-400">Low Risk</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{width: '25%'}}></div>
                                </div>
                             </div>
                        </div>
                    </SciFiCard>

                    {/* 应急响应建议 */}
                    <SciFiCard title="智能应急响应策略" subtitle="RESPONSE PLAN" className="flex-1">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded">
                                <Umbrella className="text-indigo-400 shrink-0" size={16} />
                                <div>
                                    <div className="text-[11px] font-bold text-indigo-100 uppercase">启动防风锚定程序</div>
                                    <div className="text-[10px] text-indigo-300 mt-1">建议在风速超过 25m/s 前完成所有大型机械的锚定与系固。</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-orange-900/20 border-l-4 border-orange-500 rounded">
                                <Thermometer className="text-orange-400 shrink-0" size={16} />
                                <div>
                                    <div className="text-[11px] font-bold text-orange-100 uppercase">电子设备伴热开启</div>
                                    <div className="text-[10px] text-orange-300 mt-1">检测到露点温度逼近，需启动控制柜除湿加热器。</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-slate-800">
                             <button className="w-full py-2 bg-slate-800 hover:bg-rose-700 text-white text-[10px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                                 <AlertOctagon size={12} /> 发布全场停工指令
                             </button>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚 --- */}
            <div className="h-10 bg-indigo-950/20 border-t border-indigo-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">气象卫星链路: 稳定</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">灾害预警级别: 橙色</span>
                    </div>
                </div>
                <div className="text-[10px] text-indigo-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Signal size={12} /> Meteo-Risk-AI v6.0 - Active Monitoring
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
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
