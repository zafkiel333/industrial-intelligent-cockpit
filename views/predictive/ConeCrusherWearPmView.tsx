import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/cone/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-1]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-1';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  // Added Line to fix "Cannot find name 'Line'" error on line 245
  BarChart, Bar, Cell, ReferenceLine, ComposedChart, Line
} from 'recharts';
import { 
  TrendingUp, Activity, Ruler, Target, AlertTriangle, 
  Settings, Clock, Gauge, Database, FileText,
  ChevronRight, ArrowDownRight, Layers, Zap,
  // Fix: Added Thermometer to the import list to resolve "Cannot find name 'Thermometer'" error on line 286
  Thermometer
} from 'lucide-react';

// --- MOCK DATA ---

// Wear Rate vs Cumulative Tonnage
const WEAR_TONNAGE_DATA = [
    { tons: 0, wear: 0, predicted: 0 },
    { tons: 50000, wear: 5, predicted: 4.8 },
    { tons: 100000, wear: 12, predicted: 11.5 },
    { tons: 150000, wear: 22, predicted: 21.0 },
    { tons: 200000, wear: 35, predicted: 34.5 },
    { tons: 250000, wear: 52, predicted: 53.0 },
    { tons: 300000, wear: null, predicted: 72.0 },
    { tons: 350000, wear: null, predicted: 95.0 },
];

// Vertical Wear Profile (3 zones)
const ZONE_DATA = [
    { zone: '上部 (Feed)', wear: 12, rate: 'Normal' },
    { zone: '中部 (Middle)', wear: 34, rate: 'Steady' },
    { zone: '下部 (Discharge)', wear: 52, rate: 'Aggressive' },
];

// Efficiency vs Wear percentage
const EFFICIENCY_WEAR = Array.from({length: 20}, (_, i) => ({
    wear: i * 5,
    efficiency: 98 - Math.pow(i*5/100, 2) * 20
}));

export const ConeCrusherWearPmView: React.FC = () => {
    const [currentWear, setCurrentWear] = useState(52.4);
    const [estDaysLeft, setEstDaysLeft] = useState(28);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none">
            
            {/* --- TECH HEADER --- */}
            <div className="flex justify-between items-center bg-slate-900/60 border-b border-orange-500/40 pb-4 px-2">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-600/20 rounded border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                        <TrendingUp className="text-orange-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white">
                            圆锥破碎机衬板磨损趋势预测
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest px-2 py-0.5 bg-orange-950/50 border border-orange-800 rounded">
                                核心预测模型: WearNet-v2.0 (LSTM)
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                设备编号: CONE-LNR-08
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-8 items-center pr-4">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">预计剩余寿命 (RUL)</div>
                        <div className="text-4xl font-mono font-bold text-orange-500">
                            {estDaysLeft} <span className="text-sm font-normal text-slate-500">天</span>
                        </div>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">当前累计吨位</div>
                        <div className="text-3xl font-mono font-bold text-white">254,820 <span className="text-sm font-normal text-slate-500">t</span></div>
                    </div>
                </div>
            </div>

            {/* --- MAIN DASHBOARD CONTENT --- */}
            <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
                
                {/* LEFT COLUMN: Wear Analytics */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* Wear Dashboard Gauge */}
                    <SciFiCard title="当前平均磨损深度" subtitle="CURRENT WEAR" highlight className="bg-gradient-to-br from-slate-900 to-[#1e1408]">
                        <div className="flex flex-col items-center py-4">
                            <div className="relative w-44 h-44 flex items-center justify-center">
                                {/* SVG Circular Bar */}
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="88" cy="88" r="80" stroke="#1e293b" strokeWidth="8" fill="none" />
                                    <circle 
                                        cx="88" cy="88" r="80" stroke="#f97316" strokeWidth="12" fill="none" 
                                        strokeDasharray="502" strokeDashoffset={502 - (502 * currentWear) / 100}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-black text-white">{currentWear.toFixed(1)}<span className="text-xl">%</span></span>
                                    <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-1">磨损率评估</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full mt-6">
                                <div className="text-center p-2 bg-black/40 rounded border border-slate-800">
                                    <div className="text-[10px] text-slate-500">初始厚度</div>
                                    <div className="text-lg font-bold">120 <span className="text-xs">mm</span></div>
                                </div>
                                <div className="text-center p-2 bg-black/40 rounded border border-slate-800">
                                    <div className="text-[10px] text-slate-500">剩余厚度</div>
                                    <div className="text-lg font-bold text-orange-400">57.1 <span className="text-xs">mm</span></div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* Vertical Wear Profile */}
                    <SciFiCard title="垂直磨损带分布" subtitle="ZONAL DISTRIBUTION">
                        <div className="space-y-4 py-2">
                            {ZONE_DATA.map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400 font-bold">{item.zone}</span>
                                        <span className="text-white font-mono">{item.wear}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${i === 2 ? 'bg-orange-500' : 'bg-cyan-500'}`} 
                                            style={{ width: `${item.wear}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-[9px] text-right text-slate-500">{item.rate} Rate</div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* AI Maintenance Advice */}
                    <SciFiCard title="智能维护决策系统" subtitle="AI ADVISORY" className="flex-1">
                        <div className="space-y-3">
                            <div className="p-3 bg-blue-900/10 border-l-4 border-blue-500 rounded">
                                <div className="flex items-center gap-2 text-xs font-bold text-blue-300 mb-1">
                                    <Settings size={14} /> 运行优化建议
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    基于当前排料段磨损速度，建议在下个班次将 CSS 补偿量增加 <span className="text-white">2.5mm</span>，以维持产品粒度。
                                </p>
                            </div>
                            <div className="p-3 bg-orange-900/10 border-l-4 border-orange-500 rounded">
                                <div className="flex items-center gap-2 text-xs font-bold text-orange-300 mb-1">
                                    <AlertTriangle size={14} /> 停机预警
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    预测衬板将在累计处理量达到 <span className="text-white">325,000 吨</span> 时触发 85% 预警线，建议提前预定备件。
                                </p>
                            </div>
                            <button className="w-full mt-2 py-2 bg-slate-800 hover:bg-orange-600 text-white text-[10px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                                <FileText size={12} /> 生成年度磨损分析报告
                            </button>
                        </div>
                    </SciFiCard>
                </div>

                {/* CENTER COLUMN: Digital Twin View */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D Model Visualizer */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-xl overflow-hidden shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]">
                        {/* HUD Elements */}
                        <div className="absolute top-6 left-6 z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_cyan]"></div>
                                <div className="bg-black/60 px-3 py-1 rounded border border-cyan-500/30">
                                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">动态剖面实时渲染</span>
                                </div>
                            </div>
                            <div className="bg-black/60 p-3 rounded border border-slate-800 backdrop-blur-sm space-y-2 w-48">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500">主马达电流</span>
                                    <span className="text-white font-mono font-bold">185.4 A</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500">锁紧油压</span>
                                    <span className="text-green-400 font-mono font-bold">12.5 MPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500">当前 CSS</span>
                                    <span className="text-white font-mono font-bold">32.0 mm</span>
                                </div>
                            </div>
                        </div>

                        {/* Wear Hotspot Legend */}
                        <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                             <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded border border-slate-800">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-[10px] text-slate-400">重度磨损带</span>
                             </div>
                             <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded border border-slate-800">
                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                <span className="text-[10px] text-slate-400">中度磨损带</span>
                             </div>
                             <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded border border-slate-800">
                                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                                <span className="text-[10px] text-slate-400">正常/新件</span>
                             </div>
                        </div>

                        <ThreeScene wearLevel={currentWear / 100} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                        
                        {/* Overlay Scan Effect */}
                        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.05)_0%,transparent_70%)]"></div>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-4 py-1.5 bg-slate-900/90 hover:bg-cyan-600 text-cyan-400 hover:text-white text-[10px] font-bold rounded-sm border border-cyan-900/50 transition-all flex items-center gap-2">
                                <Layers size={14} /> 切换结构剖面视图
                            </button>
                        </div>
                    </div>

                    {/* Integrated Trend Chart */}
                    <SciFiCard title="磨损-吨位预测关联曲线" subtitle="WEAR TREND" className="h-[280px] bg-[#080d19]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={WEAR_TONNAGE_DATA} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                                    <defs>
                                        <linearGradient id="colorWear" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="tons" stroke="#64748b" tick={{fontSize: 10}} label={{ value: '累计吨位 (t)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: '磨损率 (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} domain={[0, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    
                                    <Area type="monotone" dataKey="predicted" stroke="#f97316" strokeDasharray="5 5" fill="url(#colorWear)" name="AI 预测趋势" />
                                    <Line type="monotone" dataKey="wear" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, fill: '#0ea5e9'}} name="历史实测值" />
                                    
                                    <ReferenceLine x={254820} stroke="#fff" label={{ value: '当前点', fill: '#fff', fontSize: 10, position: 'top' }} />
                                    <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '极限磨损阈值', fill: '#ef4444', fontSize: 10 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* RIGHT COLUMN: Economic & Parameters */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* Efficiency Loss Estimator */}
                    <SciFiCard title="磨损经济性效能分析" subtitle="EFFICIENCY LOSS" className="bg-[#0b1221]">
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={EFFICIENCY_WEAR}>
                                    <XAxis dataKey="wear" hide />
                                    <YAxis hide domain={[70, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="efficiency" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="破碎效率" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 space-y-2">
                             <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">效率降额</span>
                                <span className="text-red-400 font-bold">-4.5%</span>
                             </div>
                             <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">吨耗成本增量</span>
                                <span className="text-red-400 font-bold">+RMB 0.82/t</span>
                             </div>
                        </div>
                    </SciFiCard>

                    {/* Sensor Array Table */}
                    <SciFiCard title="传感器实时数据阵列" subtitle="SENSORS" className="flex-1">
                        <div className="space-y-2">
                            {[
                                { icon: <Activity size={12}/>, label: '振动 (X-Axis)', value: '2.4', unit: 'mm/s', status: 'Normal' },
                                { icon: <Zap size={12}/>, label: '电机功率因素', value: '0.94', unit: 'cosφ', status: 'Good' },
                                { icon: <Thermometer size={12}/>, label: '回油温度', value: '54.2', unit: '°C', status: 'Normal' },
                                { icon: <Gauge size={12}/>, label: '衬板压力传感器', value: '450', unit: 'kN', status: 'Active' },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-cyan-500/30 transition-all">
                                    <div className="flex items-center gap-2">
                                        <div className="text-cyan-500">{s.icon}</div>
                                        <span className="text-[11px] text-slate-300 font-bold">{s.label}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-mono font-bold">{s.value} <span className="text-[9px] font-normal text-slate-500">{s.unit}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* Maintenance Plan Checklist */}
                    <SciFiCard title="检修及更换任务" subtitle="ACTION ITEMS">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 p-2 bg-white/5 rounded opacity-50 cursor-not-allowed">
                                <div className="w-1.5 h-8 bg-slate-600 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-bold">初始测量与打标</div>
                                    <div className="text-[9px] text-slate-500">已于 05-12 完成</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-orange-600/20 rounded border border-orange-500/30 cursor-pointer hover:bg-orange-600/30 transition-all">
                                <div className="w-1.5 h-8 bg-orange-500 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-bold">中后期手动测量校准</div>
                                    <div className="text-[9px] text-orange-300">预计 3天 后执行</div>
                                </div>
                                <ChevronRight size={14} className="text-orange-500" />
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-red-600/20 rounded border border-red-500/30 cursor-pointer hover:bg-red-600/30 transition-all">
                                <div className="w-1.5 h-8 bg-red-500 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-bold">衬板更换大修</div>
                                    <div className="text-[9px] text-red-300">预计 28天 后执行</div>
                                </div>
                                <ChevronRight size={14} className="text-red-500" />
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