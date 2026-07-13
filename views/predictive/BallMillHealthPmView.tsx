
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/ball-mill/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-19]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-19';
import { MillViewMode } from '../../components/predictive/ball-mill/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie
} from 'recharts';
import { 
  Activity, Zap, ShieldCheck, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Volume2, FastForward, Info, Hammer
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 声纹特征分析 (Acoustic Spectrum)
const ACOUSTIC_SPECTRUM = Array.from({ length: 40 }, (_, i) => ({
    freq: i * 100,
    power: (i === 12 ? 85 : i === 25 ? 40 : Math.random() * 20) + 10,
    threshold: 60
}));

// 2. 负荷与功耗博弈 (Load vs Power Draw)
const LOAD_POWER_DATA = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    load: 85 + Math.sin(i / 3) * 5,
    power: 2450 + Math.sin(i / 3) * 200 + Math.random() * 50,
    efficiency: 92 - Math.abs(Math.sin(i / 3) * 2)
}));

// 3. 衬板磨损演化预测 (Liner RUL)
const LINER_DECAY = Array.from({ length: 20 }, (_, i) => ({
    month: `T-${19-i}`,
    thickness: 150 - Math.pow(i/1.5, 1.4),
    limit: 45
}));

export const BallMillHealthPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<MillViewMode>('mechanical');
    const [healthScore] = useState(88.4);
    const [grindingEff] = useState(94.2);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部 HUD：磨机核心态势 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-cyan-600/20 rounded-sm border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                        <Disc className="text-cyan-400 animate-spin-slow" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            球磨机整机健康状态总览 (Holistic Health)
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/30 rounded">
                                预测引擎: Mill-Neural-Net v5.0
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                规格: Ø5.03m x 8.3m | 钢球充填率: 35%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">整机健康得分</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            {healthScore} <span className="text-sm">/ 100</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">研磨能效比</div>
                        <div className="text-3xl font-mono font-bold text-emerald-400">{grindingEff}%</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：物理场与声纹感知 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 声纹频率分析 */}
                    <SciFiCard title="磨机声纹特征提取" subtitle="ACOUSTIC FINGERPRINT" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={ACOUSTIC_SPECTRUM} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="audioGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="freq" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="power" stroke="#0ea5e9" fill="url(#audioGrad)" strokeWidth={2} name="频谱能量" />
                                    <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="5 5" label={{value:'空磨风险', fill:'#ef4444', fontSize:8}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase">
                                <Volume2 size={14} className="text-cyan-400" /> 主特征频率
                            </div>
                            <span className="text-sm font-mono font-bold text-white">1,245 Hz</span>
                        </div>
                    </SciFiCard>

                    {/* 载荷功耗博弈图 */}
                    <SciFiCard title="填充率与功耗博弈" subtitle="LOAD-POWER BALANCE">
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={LOAD_POWER_DATA}>
                                    <XAxis dataKey="time" hide />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                    <Area type="monotone" dataKey="power" fill="#334155" stroke="#475569" name="主电机功耗" />
                                    <Line type="monotone" dataKey="load" stroke="#f59e0b" strokeWidth={2} dot={false} name="物料填充率" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                             <div className="p-2 bg-slate-900 rounded text-center">
                                <div className="text-[9px] text-slate-500">吨耗电量</div>
                                <div className="text-sm font-bold text-white">12.8 kWh/t</div>
                             </div>
                             <div className="p-2 bg-slate-900 rounded text-center">
                                <div className="text-[9px] text-slate-500">填充率偏移</div>
                                <div className="text-sm font-bold text-green-400">-0.5%</div>
                             </div>
                        </div>
                    </SciFiCard>

                    {/* AI 诊断推演报告 */}
                    <SciFiCard title="神经网络退化分析" subtitle="AI DIAGNOSIS" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2" size={14} />
                                模型提示：当前进料端轴瓦振动包络值检测到 <span className="text-white font-bold">12.5Hz</span> 的异常边频，初步判定为“润滑油膜厚度波动”。建议执行轴承座润滑压力微调。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Settings size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">调取润滑系统流量闭环历史</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Layers size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">进入筒体衬板分块分析</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D数字孪生与结构透视 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 球磨机核心视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">全状态动力学实时仿真</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">筒体工作转速</span>
                                    <span className="text-white font-mono font-bold">14.2 RPM</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">衬板平均厚度</span>
                                    <span className="text-white font-mono font-bold">115.4 mm</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">主减速机效率</span>
                                    <span className="text-emerald-400 font-mono font-bold">98.2%</span>
                                </div>
                            </div>
                        </div>

                        {/* 视角切换 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['mechanical', 'xray', 'thermal'] as MillViewMode[]).map((mode) => (
                                <button 
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === mode ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {mode === 'mechanical' ? '实景' : mode === 'xray' ? '透视' : '热力'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene healthScore={healthScore} viewMode={viewMode} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部功能栏 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-cyan-600 text-cyan-400 hover:text-white text-xs font-black rounded border border-cyan-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 细节特征探测
                            </button>
                            <button className="px-10 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center gap-3">
                                <RefreshCw size={16} /> 模型参数校准
                            </button>
                        </div>
                        
                        {/* 扫描线动画 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 衬板磨损演化预测 */}
                    <SciFiCard title="衬板厚度衰减与更换预测 (Liner Life)" subtitle="RUL FORECAST" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={LINER_DECAY}>
                                    <defs>
                                        <linearGradient id="linerGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} label={{ value: '服役时长', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: '厚度 (mm)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} domain={[0, 160]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="thickness" stroke="#0ea5e9" strokeWidth={3} fill="url(#linerGrad)" name="衬板残余厚度" />
                                    <ReferenceLine y={45} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '极限磨损线', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：环境应力与部件矩阵 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 轴瓦温升矩阵 */}
                    <SciFiCard title="进出料轴瓦热力矩阵" subtitle="BEARING HEATMAP">
                        <div className="grid grid-cols-2 gap-4 py-2">
                             <div className="text-center p-3 bg-slate-900 border border-slate-800 rounded">
                                <div className="text-[10px] text-slate-500 uppercase mb-2">Feed End (进料)</div>
                                <div className="text-2xl font-mono font-bold text-white">45.2°C</div>
                                <div className="text-[10px] text-emerald-500 font-bold mt-1 uppercase tracking-widest">Normal</div>
                             </div>
                             <div className="text-center p-3 bg-slate-900 border border-slate-800 rounded">
                                <div className="text-[10px] text-slate-500 uppercase mb-2">Discharge (出料)</div>
                                <div className="text-2xl font-mono font-bold text-orange-400">54.8°C</div>
                                <div className="text-[10px] text-orange-400 font-bold mt-1 uppercase tracking-widest animate-pulse">Rising</div>
                             </div>
                        </div>
                    </SciFiCard>

                    {/* 润滑油液健康指标 */}
                    <SciFiCard title="润滑油膜与油质分析" subtitle="LUBRICATION" className="flex-1">
                        <div className="space-y-4 py-2">
                            {[
                                { label: '供油母管压力', val: 0.42, unit: 'MPa', status: 'normal' },
                                { label: '油液污染NAS等级', val: 7, unit: 'Class', status: 'warning' },
                                { label: '油膜厚度指数', val: 0.85, unit: 'Idx', status: 'normal' },
                                { label: '过滤器压差', val: 0.04, unit: 'MPa', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-400 uppercase">{item.label}</span>
                                        <span className={item.status === 'warning' ? 'text-orange-400' : 'text-slate-100'}>{item.val} {item.unit}</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full transition-all duration-1000 ${item.status === 'warning' ? 'bg-orange-500' : 'bg-cyan-500'}`} 
                                          style={{ width: `${(item.val / (item.unit === 'Class' ? 12 : 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 近期风险预测日志 */}
                    <SciFiCard title="预测性工单记录" subtitle="DECISION LOG">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">2024-05-22: 润滑油膜稳定性预警</div>
                                    <div className="text-[9px] text-slate-500">操作: 已通过 PLC 增加主泵频率</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚状态栏 --- */}
            <div className="h-10 bg-cyan-950/20 border-t border-cyan-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">边缘网关: 在线</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">数据主干延迟: 14ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Mill-Digital-Armor v5.0 - Holistic Predictive Guard
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
