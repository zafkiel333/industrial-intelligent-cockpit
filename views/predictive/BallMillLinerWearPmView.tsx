
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/ball-mill-liner/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie
} from 'recharts';
import { 
  Activity, Zap, ShieldAlert, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Tractor, Scale, Ruler, Hammer, Calendar,
  LayoutGrid, Crosshair
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 衬板减薄趋势 (Thickness Decay vs Tonnage)
const WEAR_CURVE = Array.from({ length: 30 }, (_, i) => ({
    tons: i * 10000,
    thickness: 150 - Math.pow(i/1.8, 1.45),
    predicted: 150 - Math.pow(i/1.8, 1.42),
    limit: 45
}));

// 2. 衬板区域磨损速率对比 (Wear Rate by Zone)
const ZONE_RATES = [
    { zone: '给料端 (Feed)', rate: 0.12, status: 'normal' },
    { zone: '一仓中部', rate: 0.24, status: 'warning' },
    { zone: '隔仓板区', rate: 0.38, status: 'critical' },
    { zone: '二仓中部', rate: 0.18, status: 'normal' },
    { zone: '排料端', rate: 0.08, status: 'normal' },
];

// 3. 撞击能级特征谱线
const IMPACT_SPECTRUM = Array.from({ length: 40 }, (_, i) => ({
    freq: i * 50,
    energy: (i === 12 ? 85 : i === 25 ? 40 : Math.random() * 20) + 10,
    impact_threshold: 65
}));

export const BallMillLinerWearPmView: React.FC = () => {
    const [wearFactor, setWearFactor] = useState(0.54);
    const [estReplaceDate] = useState('2024-09-12');

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部 HUD：磨损态势实时看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-orange-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-orange-600/20 rounded-lg border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                        <Ruler className="text-orange-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            球磨机衬板磨损全生命周期演化中心
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-orange-950/50 border border-orange-800/30 rounded">
                                AI 引擎: Wear-LSTM-Pro v4.2
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                衬板材质: 高锰钢 Mn13Cr2 | 已服役: 1420h
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">平均残余厚度</div>
                        <div className="text-4xl font-mono font-bold text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                            78.4 <span className="text-sm">mm</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">预计建议更换日期</div>
                        <div className="text-3xl font-mono font-bold text-rose-500">{estReplaceDate}</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：物理场与特征捕捉 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 分区磨损速率 */}
                    <SciFiCard title="衬板分区磨损梯度 (mm/kt)" subtitle="ZONAL WEAR RATE" highlight className="bg-[#0c1221]">
                        <div className="h-48 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ZONE_RATES} layout="vertical" margin={{left: -20, right: 20}}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="zone" type="category" tick={{fill: '#94a3b8', fontSize: 10}} width={80} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                                        {ZONE_RATES.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.status === 'critical' ? '#ef4444' : entry.status === 'warning' ? '#f59e0b' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 text-center">
                            <div className="text-[9px] text-slate-500 uppercase tracking-widest">最高磨损点位</div>
                            <div className="text-sm font-bold text-rose-400">#12 Block (隔仓板附近)</div>
                        </div>
                    </SciFiCard>

                    {/* 声纹撞击特征 */}
                    <SciFiCard title="钢丝绳/衬板撞击能级" subtitle="ACOUSTIC IMPACT">
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={IMPACT_SPECTRUM}>
                                    <defs>
                                        <linearGradient id="impactGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="freq" hide />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                    <Area type="monotone" dataKey="energy" stroke="#f59e0b" fill="url(#impactGrad)" strokeWidth={2} name="撞击声强" />
                                    <ReferenceLine y={65} stroke="#ef4444" strokeDasharray="5 5" label={{value:'直撞风险', fill:'#ef4444', fontSize:8}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-slate-500">
                            能量异常判定：<span className="text-white font-bold">无直接撞击风险</span> (物料层厚度正常)
                        </div>
                    </SciFiCard>

                    {/* AI 预测建议 */}
                    <SciFiCard title="AI 寿命补偿建议" subtitle="AI ADVISORY" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded text-[11px] text-blue-100 leading-relaxed">
                                <Brain className="inline mr-2" size={14} />
                                <span className="font-bold">决策引擎：</span> 检测到进料侧衬板由于“波峰”磨平导致研磨效率下降 <span className="text-white">4.2%</span>。建议在 30 班次后通过调整“给料级配”补偿研磨效能损失。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-orange-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Calendar size={16} className="text-orange-400" />
                                    <span className="text-[11px] text-slate-300">调取下季度检修备件计划</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-orange-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Hammer size={16} className="text-orange-400" />
                                    <span className="text-[11px] text-slate-300">进入磨损厚度历史云图回溯</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D数字孪生与激光扫描 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 剖面视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-orange-500/30">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_orange]"></div>
                                <span className="text-[12px] text-orange-400 font-black tracking-widest uppercase">衬板厚度场动态渲染 (1:1 仿真)</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大磨损点厚度</span>
                                    <span className="text-rose-500 font-mono font-bold">57.4 mm</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">平均磨损率</span>
                                    <span className="text-white font-mono font-bold">0.14 mm/d</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">结构可靠度</span>
                                    <span className="text-emerald-400 font-mono font-bold">94.8%</span>
                                </div>
                            </div>
                        </div>

                        {/* 热力图例 */}
                        <div className="absolute bottom-8 right-8 z-10 p-3 bg-black/60 backdrop-blur border border-slate-800 rounded">
                            <div className="text-[9px] text-slate-500 uppercase font-bold mb-2">厚度热力标识 (mm)</div>
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 text-[10px]"><div className="w-2 h-2 rounded-full bg-blue-500"></div> 150 (新件)</div>
                                <div className="flex items-center gap-2 text-[10px]"><div className="w-2 h-2 rounded-full bg-cyan-400"></div> 100 (稳定期)</div>
                                <div className="flex items-center gap-2 text-[10px]"><div className="w-2 h-2 rounded-full bg-orange-500"></div> 60 (警戒)</div>
                                <div className="flex items-center gap-2 text-[10px]"><div className="w-2 h-2 rounded-full bg-red-600"></div> 45 (更换)</div>
                            </div>
                        </div>

                        <ThreeScene wearFactor={wearFactor} />

                        {/* 底部中心操作 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-orange-600 text-orange-400 hover:text-white text-xs font-black rounded border border-orange-900/50 transition-all flex items-center gap-3">
                                <ScanLine size={16} /> 执行在线激光测厚
                            </button>
                            <button className="px-10 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all flex items-center gap-3">
                                <RefreshCw size={16} /> 校准神经网络模型
                            </button>
                        </div>
                    </div>

                    {/* 预测演化图表 */}
                    <SciFiCard title="厚度减薄预测与累计处理量关系" subtitle="PREDICTIVE DECAY" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={WEAR_CURVE}>
                                    <defs>
                                        <linearGradient id="wearGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="tons" stroke="#64748b" tick={{fontSize: 10}} label={{ value: '累计吨位 (kt)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: '残余厚度 (mm)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} domain={[0, 160]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Area type="monotone" dataKey="predicted" name="AI 预测轨迹" stroke="#f97316" strokeDasharray="5 5" fill="url(#wearGrad)" />
                                    <Line type="monotone" dataKey="thickness" name="实际监测值" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, fill: '#0ea5e9'}} />
                                    <ReferenceLine y={45} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '报废极限', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：经济性与运行指标 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 维护与经济性分析 */}
                    <SciFiCard title="磨损经济性分析" subtitle="ECONOMY">
                        <div className="space-y-4 py-2">
                             <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-slate-500 uppercase">吨耗成本增量 (磨损引起)</span>
                                    <span className="text-rose-400">+¥ 0.42/t</span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500" style={{width: '65%'}}></div>
                                </div>
                             </div>
                             <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-slate-500 uppercase">研磨能效降额</span>
                                    <span className="text-amber-400">-5.8%</span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500" style={{width: '42%'}}></div>
                                </div>
                             </div>
                        </div>
                    </SciFiCard>

                    {/* 传感器实时矩阵 */}
                    <SciFiCard title="实时感知矩阵" subtitle="SENSORS" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '筒体表面振动', val: '4.2', unit: 'mm/s', status: 'normal' },
                                { label: '主电机电流波动', val: '12', unit: 'A', status: 'warning' },
                                { label: '衬板应变测量', val: '142', unit: 'με', status: 'normal' },
                                { label: '出料口粒度中值', val: '0.074', unit: 'mm', status: 'normal' },
                                { label: '声学异常指数', val: '0.12', unit: 'Idx', status: 'normal' },
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

                    {/* 维保策略快照 */}
                    <SciFiCard title="智能维护工作包" subtitle="DECISIONS">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">上轮更换: 2023-10-15</div>
                                    <div className="text-[9px] text-slate-500">累计产量: 1,540,000 t</div>
                                </div>
                            </div>
                            <div className="p-2 bg-orange-950/20 rounded border border-orange-900/50 flex items-center gap-3">
                                <History size={16} className="text-orange-400" />
                                <div>
                                    <div className="text-[10px] text-orange-100 font-bold">下轮大修: 预估 2024-09-12</div>
                                    <div className="text-[9px] text-orange-600">距离更换仅剩 150,000 t</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-orange-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统状态页脚 --- */}
            <div className="h-10 bg-orange-950/20 border-t border-orange-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">终端测厚阵列: 在线正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测模型置信度: 96.8%</span>
                    </div>
                </div>
                <div className="text-[10px] text-orange-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Wear-Neural Inference Core v4.2 - Holistic Shield Active
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
