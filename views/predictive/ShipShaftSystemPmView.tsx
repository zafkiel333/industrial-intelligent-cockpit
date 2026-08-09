import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/shaft-system/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-34]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-34';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter
} from 'recharts';
import { 
  Activity, Zap, ShieldCheck, Cpu, AlertTriangle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Link, Box, ArrowUpCircle,
  HardDrive, MonitorPlay, Hammer, Wind, Radio,
  Compass, Workflow, Microscope
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 轴心轨迹 (Shaft Orbit)
const ORBIT_DATA = Array.from({ length: 40 }, (_, i) => {
    const angle = (i / 40) * Math.PI * 2;
    const r = 0.5 + Math.sin(angle * 2) * 0.1 + Math.random() * 0.05;
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
});

// 2. 各轴承温升与载荷 (Bearing Load & Temp)
const BEARING_MATRIX = [
    { name: '推力轴承', temp: 42, load: 850, status: 'normal' },
    { name: '中间轴承1', temp: 45, load: 420, status: 'normal' },
    { name: '中间轴承2', temp: 48, load: 450, status: 'normal' },
    { name: '艉轴前轴承', temp: 52, load: 680, status: 'warning' },
    { name: '艉轴后轴承', temp: 58, load: 920, status: 'warning' },
];

// 3. 寿命演化预测 (RUL Path)
const RUL_EVOLUTION = Array.from({ length: 24 }, (_, i) => ({
    time: `T+${i*5}d`,
    health: 94 - Math.pow(i/5, 1.6) * 4 + Math.random() * 2,
    threshold: 60
}));

export const ShipShaftSystemPmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<'hologram' | 'xray'>('hologram');
    const [healthScore] = useState(88.4);
    const [rpm, setRpm] = useState(82);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：推进系统指挥舰桥 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,cyan_0%,transparent_70%)]"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        <Compass className="text-cyan-400 animate-spin-slow" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            船舶推进轴系健康状态评估
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>诊断引擎: Marine-Kinetic-AI v5.4</span>
                            <span>轴系全长: 24.5 M | 主轴径: 600 MM</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">系统综合健康度</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            {healthScore}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">轴系转速 (RPM)</div>
                        <div className="text-3xl font-mono font-bold text-white tracking-tighter">
                            {rpm} <span className="text-sm text-slate-500">REV</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 主动态分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                
                {/* 左侧：动能指纹分析 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 轴心轨迹云图 */}
                    <SciFiCard title="主轴中心轨迹指纹" subtitle="ORBIT ANALYSIS" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis type="number" dataKey="x" hide domain={[-1, 1]} />
                                    <YAxis type="number" dataKey="y" hide domain={[-1, 1]} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#020617'}} />
                                    <Scatter name="Orbit" data={ORBIT_DATA} fill="#0ea5e9" line={{ stroke: '#0ea5e9', strokeWidth: 1 }} shape={() => null} />
                                </ScatterChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                <div className="w-32 h-32 rounded-full border border-dashed border-white"></div>
                            </div>
                        </div>
                        <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                             <span>瞬时偏心量: 0.14 mm</span>
                             <span className="text-emerald-400">轨迹收敛: 正常</span>
                        </div>
                    </SciFiCard>

                    {/* 扭振阶次分析 */}
                    <SciFiCard title="阶次特征频谱分析" subtitle="ORDER ANALYSIS">
                        <div className="h-40 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { order: '3X', val: 12 },
                                    { order: '6X', val: 45 },
                                    { order: '9X', val: 18 },
                                    { order: '12X', val: 8 },
                                ]}>
                                    <XAxis dataKey="order" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                    <Bar dataKey="val" fill="#8b5cf6" radius={[2, 2, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* AI 深度评估报告 */}
                    <SciFiCard title="AI 专家系统诊断" subtitle="PROGNOSTICS" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold">推演报告：</span> 检测到艉轴管后轴承处存在非稳态激振，匹配度 82% 为 <span className="text-white font-bold underline">艉轴承偏磨初兆</span>。建议监控 12.5 节以上航速下的振动能量分布。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-cyan-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Microscope size={16} className="text-cyan-400" />
                                    <span className="text-[11px] text-slate-300">查看轴系校中补偿计算书</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：全长数字孪生视窗 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 交互层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping shadow-[0_0_10px_cyan]"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">轴系动力学完整性全息扫描</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大挠度</span>
                                    <span className="text-white font-mono font-bold">12.5 mm</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">艉密封压力</span>
                                    <span className="text-emerald-400 font-mono font-bold">0.42 MPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">推进效率指数</span>
                                    <span className="text-cyan-300 font-mono font-bold">96.8%</span>
                                </div>
                            </div>
                        </div>

                        {/* 状态标注 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2 items-end">
                            <div className="bg-black/60 px-3 py-1 rounded border border-slate-700 text-[10px] text-slate-500">
                                模型精度: <span className="text-cyan-400 font-bold">99.2%</span>
                            </div>
                        </div>

                        <ThreeScene rpm={rpm} healthScore={healthScore} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部交互功能区 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-cyan-600 text-cyan-400 hover:text-white text-xs font-black rounded border border-cyan-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 细节分段透视
                            </button>
                            <button className="px-10 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center gap-3">
                                <History size={16} /> 仿真历史回溯
                            </button>
                        </div>
                        
                        {/* 极光扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_15px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* RUL 预测轨迹图表 */}
                    <SciFiCard title="轴系部件 RUL 衰减轨迹预测" subtitle="PROGNOSTIC PATH" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={RUL_EVOLUTION}>
                                    <defs>
                                        <linearGradient id="rulGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={2} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[40, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="health" name="健康趋势" stroke="#0ea5e9" fill="url(#rulGrad)" strokeWidth={3} />
                                    <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '预防检修线', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：支撑与油液分析 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 轴瓦温度场监控 */}
                    <SciFiCard title="轴承支撑状态热图" subtitle="BEARING GRADIENT">
                        <div className="space-y-4 py-2">
                            {BEARING_MATRIX.map((item, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-400 uppercase">{item.name}</span>
                                        <span className={item.status === 'warning' ? 'text-orange-400' : 'text-slate-100'}>{item.temp} °C</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full transition-all duration-1000 ${item.status === 'warning' ? 'bg-orange-500' : 'bg-cyan-500'}`} 
                                          style={{ width: `${(item.temp / 80) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                             <div className="p-2 bg-slate-900 border border-slate-800 rounded text-center">
                                <div className="text-[9px] text-slate-500 uppercase">最大支反力</div>
                                <div className="text-sm font-bold text-white">920 kN</div>
                             </div>
                             <div className="p-2 bg-slate-900 border border-slate-800 rounded text-center">
                                <div className="text-[9px] text-slate-500 uppercase">轴瓦油位</div>
                                <div className="text-sm font-bold text-emerald-400">Normal</div>
                             </div>
                        </div>
                    </SciFiCard>

                    {/* 实时参数感知流 */}
                    <SciFiCard title="实时感知参数阵列" subtitle="DATA STREAM" className="flex-1">
                        <div className="space-y-2">
                            {[
                                { label: '中间轴承 X 振速', val: '2.4', unit: 'mm/s', status: 'normal' },
                                { label: '主推力块压力', val: '12.4', unit: 'MPa', status: 'normal' },
                                { label: '滑油金属颗粒度', val: '45', unit: 'ppm', status: 'warning' },
                                { label: '艉管密封油耗', val: '0.12', unit: 'L/h', status: 'normal' },
                                { label: '轴系扭转能量', val: '0.85', unit: 'Idx', status: 'normal' },
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

                    {/* 维保策略 */}
                    <SciFiCard title="预测驱动维保序列" subtitle="ACTIONS">
                        <div className="space-y-2">
                            <div className="p-2.5 bg-rose-950/20 rounded border border-rose-900/50 flex items-center gap-3">
                                <Wrench size={16} className="text-rose-400" />
                                <div>
                                    <div className="text-[10px] text-rose-100 font-bold">艉轴承对中复核</div>
                                    <div className="text-[9px] text-rose-500">建议于 D+15 航行间歇期执行</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-rose-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚 --- */}
            <div className="h-10 bg-cyan-950/20 border-t border-cyan-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">边缘网关: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">数据同步延迟: 14ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Kinetic Engine v5.4.1 - Full Spectrum Shield Active
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