import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/propeller-crack-corrosion/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-37]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-37';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  Activity, Zap, ShieldCheck, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Anchor, Wind, Radio, Play,
  Microscope, Fingerprint, Droplet, Flame,
  /* Fix: Added AlertTriangle and RefreshCw to the import list to resolve "Cannot find name" errors */
  AlertTriangle, RefreshCw
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 声发射特征谱 (Acoustic Emission)
const AE_SPECTRUM = Array.from({ length: 40 }, (_, i) => ({
    freq: i * 5,
    energy: i === 18 ? 85 : i === 22 ? 40 : Math.random() * 15 + 5,
    threshold: 60
}));

// 2. 叶片腐蚀深度演化 (Corrosion Depth mm)
const CORROSION_TREND = Array.from({ length: 24 }, (_, i) => ({
    time: `T-${23-i}d`,
    depth: 0.05 + Math.pow(i/12, 1.8) * 0.2 + Math.random() * 0.02,
    rate: 0.001 + (i > 15 ? 0.005 : 0),
    limit: 0.5
}));

// 3. 裂纹应力强度因子 (K_I)
const CRACK_STRESS_DATA = Array.from({ length: 15 }, (_, i) => ({
    step: i,
    ki: 12 + Math.pow(i, 1.5) * 0.8,
    kic: 45
}));

export const PropellerCrackCorrosionPmView: React.FC = () => {
    const [healthScore] = useState(74.2);
    const [rpm] = useState(105);
    const [corrosionLevel] = useState(0.42);
    const [crackDetected] = useState(true);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：推进系统健康基准 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-amber-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.2)_0%,transparent_70%)]"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-amber-600/20 rounded-lg border border-amber-500/50 shadow-[0_0_20px_rgba(217,119,6,0.3)]">
                        <Anchor className="text-amber-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            螺旋桨叶片裂纹与腐蚀预测中心
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>探测引擎: Deep-Sea-Acoustic v3.1</span>
                            <span>合金材质: Ni-Al-Bronze (NAB)</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">叶片综合健康度</div>
                        <div className="text-4xl font-mono font-bold text-amber-500 drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]">
                            {healthScore}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">腐蚀速率 (mm/y)</div>
                        <div className="text-3xl font-mono font-bold text-cyan-400 tracking-tighter">0.142</div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：物理场特征提取 (声纹与粗糙度) */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 声发射指纹 */}
                    <SciFiCard title="声发射 (AE) 裂纹指纹" subtitle="FATIGUE SPECTRUM" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={AE_SPECTRUM} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="aeGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="freq" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="energy" stroke="#ef4444" fill="url(#aeGrad)" strokeWidth={2} name="撞击能级" />
                                    <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500 font-bold">
                             <div className="flex items-center gap-1"><Fingerprint size={12} className="text-rose-500" /> 特征频率匹配</div>
                             <span className="text-rose-400">92.5% (裂纹)</span>
                        </div>
                    </SciFiCard>

                    {/* 表面粗糙度演化 */}
                    <SciFiCard title="表面微观粗糙度 Ra (µm)" subtitle="SURFACE ROUGHNESS">
                        <div className="h-40 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'P1', val: 0.8 },
                                    { name: 'P2', val: 1.2 },
                                    { name: 'P3', val: 2.5 },
                                    { name: 'P4', val: 1.8 },
                                ]}>
                                    <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 9}} />
                                    <YAxis hide />
                                    <Bar dataKey="val" radius={[2, 2, 0, 0]} barSize={20}>
                                        {Array.from({length: 4}).map((_, i) => (
                                            <Cell key={i} fill={i === 2 ? '#f59e0b' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-slate-400 leading-tight">
                            区域 P3 检测到非均匀腐蚀斑点，局部阻力系数增加 <span className="text-white">12%</span>。
                        </div>
                    </SciFiCard>

                    {/* AI 推演：腐蚀机理 */}
                    <SciFiCard title="AI 专家诊断推演" subtitle="CORROSION LOGIC" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-amber-900/20 border-l-4 border-amber-500 rounded text-[11px] text-amber-100 leading-relaxed">
                                <Brain className="inline mr-2 text-amber-400" size={14} />
                                <span className="font-bold">推演报告：</span> 检测到叶根处电化学电位负移，匹配 <span className="text-white font-bold underline">应力腐蚀开裂 (SCC)</span> 早期特征。主要诱因为高航速下的湍流脉冲激励。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-amber-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-amber-400" />
                                    <span className="text-[11px] text-slate-300">查看叶面腐蚀电位分布图</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：全息数字孪生视窗 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 数字孪生视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-amber-500/30">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping shadow-[0_0_10px_amber]"></div>
                                <span className="text-[12px] text-amber-400 font-black tracking-widest uppercase">推进器表面动态损伤场扫描</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大应力强度 (K_I)</span>
                                    <span className="text-rose-500 font-mono font-bold">24.8 MPa√m</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">空泡溃灭能级</span>
                                    <span className="text-cyan-400 font-mono font-bold">4.2 gE</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">当前推进效率</span>
                                    <span className="text-emerald-400 font-mono font-bold">96.4%</span>
                                </div>
                            </div>
                        </div>

                        {/* 状态标注 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2 items-end">
                            <div className="bg-black/60 px-3 py-1 rounded border border-slate-700 text-[10px] text-slate-500 uppercase tracking-tighter">
                                实时转速: <span className="text-white font-mono">{rpm} RPM</span>
                            </div>
                        </div>

                        <ThreeScene rpm={rpm} corrosionLevel={corrosionLevel} crackDetected={crackDetected} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部中心操作 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-amber-600 text-amber-400 hover:text-white text-xs font-black rounded border border-amber-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 微观裂纹下钻
                            </button>
                            <button className="px-10 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(217,119,6,0.4)] transition-all flex items-center gap-3">
                                <RefreshCw size={16} /> 仿真模型校准
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(217,119,6,0.02)_50%)] bg-[length:100%_15px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 腐蚀深度演化图表 */}
                    <SciFiCard title="叶面腐蚀深度及速率演化" subtitle="CORROSION EVOLUTION" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={CORROSION_TREND}>
                                    <defs>
                                        <linearGradient id="corGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 0.6]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Area type="monotone" dataKey="depth" name="磨损深度 (mm)" stroke="#0ea5e9" fill="url(#corGrad)" strokeWidth={2} />
                                    <Line type="monotone" dataKey="rate" name="瞬时速率 (mm/d)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                    <ReferenceLine y={0.5} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '服役极限', fill: '#ef4444', fontSize: 10 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：环境应力与维护矩阵 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 裂纹扩展风险 */}
                    <SciFiCard title="裂纹扩展应力强度 (K_I)" subtitle="FRACTURE RISK">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={CRACK_STRESS_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="step" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                    <Line type="step" dataKey="ki" stroke="#ef4444" strokeWidth={2} dot={{r:3}} name="应力强度" />
                                    <ReferenceLine y={45} stroke="#fff" strokeDasharray="3 3" label={{value:'K_IC', fill:'#fff', fontSize:8}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-rose-500 font-bold text-center">
                             当前应力状态正快速接近断裂韧性临界值 (K_IC)
                        </div>
                    </SciFiCard>

                    {/* 维护策略推荐 */}
                    <SciFiCard title="智能维护工作包" subtitle="MAINTENANCE" className="flex-1">
                        <div className="space-y-3">
                            <div className="p-3 bg-rose-950/20 rounded border border-rose-900/50 flex items-center gap-3">
                                <AlertTriangle size={20} className="text-rose-500" />
                                <div>
                                    <div className="text-[11px] text-rose-100 font-bold">预防性抛光作业</div>
                                    <div className="text-[9px] text-rose-500">建议于抵港后 24h 内执行</div>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded flex items-center gap-3 opacity-60">
                                <ShieldCheck size={20} className="text-slate-500" />
                                <div>
                                    <div className="text-[11px] text-slate-200 font-bold">牺牲阳极块检查</div>
                                    <div className="text-[9px] text-slate-600">距离下次定期检查: 12d</div>
                                </div>
                            </div>
                            <div className="mt-auto pt-4">
                                <button className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold rounded shadow-[0_0_15px_rgba(217,119,6,0.3)] transition-all flex items-center justify-center gap-2">
                                    <Settings size={14} /> 自动调节舵角减振
                                </button>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 传感器实时感知流 */}
                    <SciFiCard title="环境劣化因子感知" subtitle="DATA STREAM">
                        <div className="space-y-2">
                            {[
                                { label: '海水盐度 (Salinity)', val: '3.45', unit: '%', status: 'normal' },
                                { label: '海水温度', val: '18.2', unit: '°C', status: 'normal' },
                                { label: '电流防腐系统电位', val: '-850', unit: 'mV', status: 'warning' },
                                { label: '推进器轴向振动', val: '1.24', unit: 'mm/s', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2 bg-slate-800/40 rounded border border-slate-700/50">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-slate-400 font-bold">{item.label}</span>
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'normal' ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`}></span>
                                    </div>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-sm font-mono font-bold text-white">{item.val}</span>
                                        <span className="text-[9px] text-slate-600">{item.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统状态脚部 --- */}
            <div className="h-10 bg-amber-950/20 border-t border-amber-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">声纳传感器网: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测模型同步: 12ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-amber-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Echo Engine v3.1 - Structural Integrity Shield Active
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
